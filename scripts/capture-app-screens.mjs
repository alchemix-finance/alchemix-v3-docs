/**
 * Capture the app screens the Academy shows, at 2x, in dark mode.
 *
 * The lessons crop details out of these files and show some of them whole, so
 * they have to be sharp on a HiDPI display. A screenshot taken by hand is 1x
 * and shows whatever the wallet happens to hold; this drives an installed
 * Chrome headless at device scale 2 with no wallet, so every run produces the
 * same screens at the same size and nothing personal is in them.
 *
 * Only screens that render without a wallet are here. The Deposit/Borrow,
 * Withdraw and Repay tabs do (an empty field, MAX and a Connect Wallet button),
 * so the lessons show those. The position screens (the bar with a debt on it,
 * the open Fixed Yield positions) still come from a real position and stay as
 * they are.
 *
 * The list pages and the vault page are captured at a 1600px viewport. The
 * action tabs and the info panels are captured at 1000px, where the vault page
 * stacks its two panels and each one runs the full width of the page: side by
 * side at a desktop width the action panel is 612px wide and as tall as the
 * Info panel beside it, so a figure of it was either a thumbnail or half empty.
 * A third pass at 390px takes the stat tiles (two to a row there) and each
 * action panel on its own, for the lessons' narrow-column variants: a
 * desktop-width crop shown in a phone's column is a thumbnail.
 *
 *   pnpm capture:app                    writes into static/img
 *   pnpm capture:app out/dir            writes somewhere else
 *   pnpm capture:app static/img vault-usdc borrow
 *                                       recaptures only the named screens, so
 *                                       one new capture does not move every
 *                                       crop drawn on the others. The names:
 *                                       fixed-yield borrow mixed-yield
 *                                       vault-usdc tab-deposit tab-withdraw
 *                                       tab-repay vault-info visualizer
 *                                       earmarking phone-stats
 *                                       phone-tab-deposit phone-tab-withdraw
 *                                       phone-tab-repay
 *
 * Needs Chrome installed (the path below) and `puppeteer-core`, which is a
 * devDependency. The crop rectangles in `src/components/Academy/kit/index.jsx`
 * are fractions of each file, so a recapture at the same viewport keeps them
 * valid as long as the app's layout has not moved; check the lessons after.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.resolve(process.argv[2] ?? "static/img");
// Screen names to capture; empty means all of them.
const ONLY = new Set(process.argv.slice(3));
const wanted = (name) => ONLY.size === 0 || ONLY.has(name);
const APP = "https://app.alchemix.fi";

// One vault per asset. The Info tab is read from the ETH vault because its
// strategies span two risk classes; the Visualizer and Earmarking panels from
// the USDC vault because the lessons that show them carry a USDC position.
const ETH_VAULT = `${APP}/vaults/0x29bcfeD246ce37319d94eBa107db90C453D4c43D`;
const USDC_VAULT = `${APP}/vaults/0x9B44efCa3e2a707B63Dc00CE79d646E5E5D24bA5`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function closeToasts(page) {
  for (let i = 0; i < 5; i++) {
    const n = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].filter((b) => /close toast/i.test(b.getAttribute("aria-label") ?? ""));
      buttons.forEach((b) => b.click());
      return buttons.length;
    });
    if (!n) break;
    await sleep(900);
  }
}

async function open(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  await sleep(8000);
  await closeToasts(page);
  await sleep(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
}

/** A whole page as the viewport shows it. */
async function screen(page, url, file) {
  await open(page, url);
  await page.screenshot({ path: path.join(OUT, file) });
  console.log("wrote", file);
}

/**
 * One tab's panel on a vault page. The tabs switch on mousedown, so this uses
 * a real mouse click. The charts inside repaint from nothing whenever their
 * container resizes, which a clipped capture beyond the viewport triggers, so
 * the viewport is tall enough to hold the panel and the clip stays inside it.
 *
 * `whole` takes the entire painted panel, down to its own bottom edge. Without
 * it the clip ends under the block that holds `marker`, which is what the Info
 * tab wants: at this width its APR chart never draws and the panel runs on
 * empty for a screen, so the lesson shows the allocation and stops there.
 */
async function panel(page, url, tab, marker, file, { whole = false } = {}) {
  await open(page, url);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const handle = (await page.evaluateHandle((t) => [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t) ?? null, tab)).asElement();
    if (!handle) throw new Error(`no tab named ${tab}`);
    await handle.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await sleep(400);
    const box = await handle.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    try { await page.waitForNetworkIdle({ idleTime: 2000, timeout: 40000 }); } catch { /* keep going on the timer */ }
    await sleep(8000);
    await page.mouse.move(2, 2);
    // Measure and clip with the page at the top, so viewport and document
    // coordinates agree. The clip is in document coordinates.
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);

    const rect = await page.evaluate((t, m, w) => {
      const tabEl = [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t);
      const list = tabEl.closest("[role=tablist]") ?? tabEl.parentElement;
      const L = list.getBoundingClientRect();
      const leaf = [...document.querySelectorAll("*")].find((el) => el.childElementCount === 0 && (el.innerText ?? "").trim().startsWith(m) && el.getBoundingClientRect().top > L.bottom - 2);
      if (!leaf) return null;
      let node = leaf;
      while (node.parentElement) {
        const r = node.parentElement.getBoundingClientRect();
        if (r.top < L.bottom - 4 || r.width > L.width * 1.9 || r.left < L.left - 40) break;
        node = node.parentElement;
      }
      if (w) {
        // The outermost ancestor under the tab strip that paints a background:
        // the panel itself, rather than the content block inside it.
        for (let a = node; a && a !== document.body; a = a.parentElement) {
          const r = a.getBoundingClientRect();
          if (r.top < L.bottom - 4 || a.contains(list)) break;
          const bg = getComputedStyle(a).backgroundColor;
          if (bg && bg !== "transparent" && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg)) node = a;
        }
      }
      const R = node.getBoundingClientRect();
      const drawn = [...node.querySelectorAll("svg path[d]")].filter((p) => p.getAttribute("d").length > 120).length;
      const x1 = Math.min(L.left, R.left), y1 = Math.min(L.top, R.top), x2 = Math.max(L.right, R.right), y2 = Math.max(L.bottom, R.bottom);
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, drawn, fits: y2 + 30 < window.innerHeight };
    }, tab, marker, whole);

    if (!rect) throw new Error(`could not find the ${tab} panel`);
    const wantsChart = tab !== "Info";
    if (wantsChart && rect.drawn === 0) { console.log(`  ${tab}: chart not drawn yet (attempt ${attempt})`); continue; }
    if (!rect.fits) throw new Error(`${tab} panel does not fit the viewport; raise the height`);
    const pad = Math.max(0, Math.min(28, rect.x));
    await page.screenshot({
      path: path.join(OUT, file),
      clip: { x: rect.x - pad, y: rect.y - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad },
      captureBeyondViewport: false,
    });
    console.log("wrote", file, `(${Math.round(rect.w + 2 * pad)}x${Math.round(rect.h + 2 * pad)} css)`);
    return;
  }
  console.warn(`!! ${tab}: the chart never drew; ${file} left as it was`);
}

/**
 * One action tab on a vault page, as the Academy shows it: the tab strip and
 * the whole panel under it, with a margin. Taken at the 1000px viewport, where
 * the panel runs the full width of the page and ends just under its button.
 * Deposit/Borrow, Withdraw and Repay all render their fields, their MAX and a
 * Connect Wallet button with no wallet attached; Borrow does not (it asks for
 * a position first), which is why the borrowing lesson shows Deposit/Borrow.
 */
async function actionTab(page, url, tab, file) {
  await open(page, url);
  const handle = (await page.evaluateHandle((t) => [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t) ?? null, tab)).asElement();
  if (!handle) throw new Error(`no tab named ${tab}`);
  const box = await handle.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(3000);
  await page.mouse.move(2, 2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  const rect = await page.evaluate((t) => {
    const tabEl = [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t);
    const list = tabEl.closest("[role=tablist]") ?? tabEl.parentElement;
    const L = list.getBoundingClientRect();
    // The panel's own button: under the strip, and wide.
    const button = [...document.querySelectorAll("button")].find((b) => {
      const r = b.getBoundingClientRect();
      return r.top > L.bottom && r.left >= L.left - 40 && r.width > L.width * 0.6;
    });
    if (!button) return null;
    // Walk up to the panel: the last ancestor that starts under the tab strip
    // and does not also hold the strip.
    let node = button;
    while (node.parentElement) {
      const parent = node.parentElement;
      const r = parent.getBoundingClientRect();
      if (r.top < L.bottom - 4 || parent.contains(list)) break;
      node = parent;
    }
    const P = node.getBoundingClientRect();
    const B = button.getBoundingClientRect();
    const x1 = Math.min(L.left, P.left), x2 = Math.max(L.right, P.right);
    return { x: x1, y: L.top, w: x2 - x1, h: P.bottom - L.top, under: P.bottom - B.bottom };
  }, tab);
  if (!rect) throw new Error(`could not find the ${tab} panel`);
  if (rect.under > 120) throw new Error(`${tab} panel runs ${Math.round(rect.under)}px under its button; is the viewport narrow enough for the panels to stack?`);
  // The page's own margin beside the panel is all the room there is at this
  // width, so the pad is whatever is left of it.
  const pad = Math.max(0, Math.min(20, rect.x));
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: rect.x - pad, y: rect.y - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(${Math.round(rect.w + 2 * pad)}x${Math.round(rect.h + 2 * pad)} css)`);
}

/** The element under `leaf` that paints a background: the tile or panel it sits in. */
const PAINTED = `(el) => {
  for (let a = el; a && a !== document.body; a = a.parentElement) {
    const bg = getComputedStyle(a).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\\(\\d+, \\d+, \\d+, 0\\)/.test(bg)) return a;
  }
  return el;
}`;

/**
 * The vault's stat tiles at a phone width: from the first tile (APR) to the
 * last (LTV), two to a row, with a margin of the panel around them.
 */
async function phoneStats(page, url, file) {
  await open(page, url);
  const rect = await page.evaluate((paintedSrc) => {
    const painted = eval(paintedSrc);
    const leaf = (t) => [...document.querySelectorAll("*")].find((el) => el.childElementCount === 0 && (el.innerText ?? "").trim() === t);
    const a = painted(leaf("APR")), b = painted(leaf("LTV"));
    if (!a || !b) return null;
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    return { x: Math.min(A.left, B.left), y: A.top, w: Math.max(A.right, B.right) - Math.min(A.left, B.left), h: B.bottom - A.top };
  }, PAINTED);
  if (!rect) throw new Error("could not find the stat tiles");
  const pad = Math.max(0, Math.min(12, rect.x));
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: rect.x - pad, y: rect.y - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(${Math.round(rect.w + 2 * pad)}x${Math.round(rect.h + 2 * pad)} css)`);
}

/**
 * One action panel at a phone width, without its tab strip: the strip scrolls
 * sideways there and would be cut at the edge, and the caption names the tab.
 */
async function phoneTab(page, url, tab, file) {
  await open(page, url);
  const handle = (await page.evaluateHandle((t) => [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t) ?? null, tab)).asElement();
  if (!handle) throw new Error(`no tab named ${tab}`);
  await handle.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
  await sleep(400);
  const box = await handle.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(3000);
  await page.mouse.move(2, 2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  const rect = await page.evaluate((t) => {
    const tabEl = [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t);
    const list = tabEl.closest("[role=tablist]") ?? tabEl.parentElement;
    const L = list.getBoundingClientRect();
    const button = [...document.querySelectorAll("button")].find((b) => {
      const r = b.getBoundingClientRect();
      return r.top > L.bottom && r.width > window.innerWidth * 0.6;
    });
    if (!button) return null;
    let node = button;
    while (node.parentElement) {
      const parent = node.parentElement;
      const r = parent.getBoundingClientRect();
      if (r.top < L.bottom - 4 || parent.contains(list)) break;
      node = parent;
    }
    const P = node.getBoundingClientRect();
    return { x: P.left, y: P.top, w: P.width, h: P.height, under: P.bottom - button.getBoundingClientRect().bottom };
  }, tab);
  if (!rect) throw new Error(`could not find the ${tab} panel`);
  if (rect.under > 120) throw new Error(`${tab} panel runs ${Math.round(rect.under)}px under its button at phone width`);
  const pad = Math.max(0, Math.min(12, rect.x));
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: rect.x - pad, y: rect.y - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(${Math.round(rect.w + 2 * pad)}x${Math.round(rect.h + 2 * pad)} css)`);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--force-color-profile=srgb"],
  defaultViewport: { width: 1600, height: 1250, deviceScaleFactor: 2 },
});
try {
  fs.mkdirSync(OUT, { recursive: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);

  if (wanted("fixed-yield")) await screen(page, `${APP}/fixed-yield`, "academy-fixed-yield.png");
  if (wanted("borrow")) await screen(page, `${APP}/vaults`, "academy-borrow.png");
  if (wanted("mixed-yield")) await screen(page, `${APP}/mixed-yield`, "academy-mixed-yield.png");
  // The USDC vault page with no wallet: the Deposit/Borrow tab open, both of
  // its fields empty, a Connect Wallet button where Deposit will be. The
  // lessons about depositing and borrowing crop this one, so the asset in the
  // fields is the USDC their example position holds.
  if (wanted("vault-usdc")) await screen(page, USDC_VAULT, "academy-vault-usdc.png");

  // The stacked layout: one panel to a row, each the width of the page.
  await page.setViewport({ width: 1000, height: 1700, deviceScaleFactor: 2 });
  if (wanted("tab-deposit")) await actionTab(page, USDC_VAULT, "Deposit/Borrow", "academy-tab-deposit.png");
  if (wanted("tab-withdraw")) await actionTab(page, USDC_VAULT, "Withdraw", "academy-tab-withdraw.png");
  if (wanted("tab-repay")) await actionTab(page, USDC_VAULT, "Repay", "academy-tab-repay.png");

  await page.setViewport({ width: 1000, height: 2600, deviceScaleFactor: 2 });
  if (wanted("vault-info")) await panel(page, ETH_VAULT, "Info", "Risk Level", "academy-vault-info.png");
  if (wanted("visualizer")) await panel(page, USDC_VAULT, "Visualizer", "Yield APY", "academy-visualizer.png", { whole: true });
  if (wanted("earmarking")) await panel(page, USDC_VAULT, "Earmarking", "Earmarking Rate", "academy-earmarking.png", { whole: true });

  // Phones: the tiles two to a row, and each action panel on its own.
  await page.setViewport({ width: 390, height: 3000, deviceScaleFactor: 2 });
  if (wanted("phone-stats")) await phoneStats(page, USDC_VAULT, "academy-phone-stats.png");
  if (wanted("phone-tab-deposit")) await phoneTab(page, USDC_VAULT, "Deposit/Borrow", "academy-phone-tab-deposit.png");
  if (wanted("phone-tab-withdraw")) await phoneTab(page, USDC_VAULT, "Withdraw", "academy-phone-tab-withdraw.png");
  if (wanted("phone-tab-repay")) await phoneTab(page, USDC_VAULT, "Repay", "academy-phone-tab-repay.png");
} finally {
  await browser.close();
}
