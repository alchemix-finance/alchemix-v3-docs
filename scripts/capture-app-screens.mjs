/**
 * Capture the app screens the Academy shows, at 2x, in dark mode.
 *
 * The lessons crop details out of these files and show some of them whole, so
 * they have to be sharp on a HiDPI display. A screenshot taken by hand is 1x
 * and shows whatever the wallet happens to hold; this drives an installed
 * Chrome headless at device scale 2 with no wallet, so every run produces the
 * same screens at the same size and nothing personal is in them.
 *
 * Only screens that render without a wallet are here. The Withdraw and Repay
 * tabs do (an empty field, MAX and a Connect Wallet button), so the lessons
 * crop those. The position screens (the stats strip, the open Fixed Yield
 * positions) still come from a real position and stay as they are.
 *
 *   pnpm capture:app                    writes into static/img
 *   pnpm capture:app out/dir            writes somewhere else
 *   pnpm capture:app static/img vault-usdc borrow
 *                                       recaptures only the named screens, so
 *                                       one new capture does not move every
 *                                       crop drawn on the others
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
 */
async function panel(page, url, tab, marker, file) {
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

    const rect = await page.evaluate((t, m) => {
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
      const R = node.getBoundingClientRect();
      const drawn = [...node.querySelectorAll("svg path[d]")].filter((p) => p.getAttribute("d").length > 120).length;
      const x1 = Math.min(L.left, R.left), y1 = Math.min(L.top, R.top), x2 = Math.max(L.right, R.right), y2 = Math.max(L.bottom, R.bottom);
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, drawn, fits: y2 + 30 < window.innerHeight };
    }, tab, marker);

    if (!rect) throw new Error(`could not find the ${tab} panel`);
    const wantsChart = tab !== "Info";
    if (wantsChart && rect.drawn === 0) { console.log(`  ${tab}: chart not drawn yet (attempt ${attempt})`); continue; }
    if (!rect.fits) throw new Error(`${tab} panel does not fit the viewport; raise the height`);
    const pad = 28;
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
 * One action tab on a vault page, as the Academy crops it: the tab strip and
 * the panel under it, down to the button, with a margin. Withdraw and Repay
 * render their field, their MAX and a Connect Wallet button with no wallet
 * attached; Borrow does not (it asks for a position first), which is why the
 * borrowing lesson crops the Deposit/Borrow tab out of the whole-page capture.
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
    // The panel's own button, under the strip and inside its column.
    const button = [...document.querySelectorAll("button")].find((b) => {
      const r = b.getBoundingClientRect();
      return r.top > L.bottom && r.left >= L.left - 40 && r.right <= L.right + 120 && r.width > L.width * 0.6;
    });
    if (!button) return null;
    let node = button;
    while (node.parentElement) {
      const r = node.parentElement.getBoundingClientRect();
      if (r.top < L.bottom - 4 || r.width > L.width * 1.6 || r.left < L.left - 60) break;
      node = node.parentElement;
    }
    const P = node.getBoundingClientRect();
    const B = button.getBoundingClientRect();
    const x1 = Math.min(L.left, P.left), x2 = Math.max(L.right, P.right);
    return { x: x1, y: L.top, w: x2 - x1, h: B.bottom + 28 - L.top };
  }, tab);
  if (!rect) throw new Error(`could not find the ${tab} panel`);
  const pad = 20;
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
  if (wanted("tab-withdraw")) await actionTab(page, USDC_VAULT, "Withdraw", "academy-tab-withdraw.png");
  if (wanted("tab-repay")) await actionTab(page, USDC_VAULT, "Repay", "academy-tab-repay.png");

  await page.setViewport({ width: 1600, height: 1900, deviceScaleFactor: 2 });
  if (wanted("vault-info")) await panel(page, ETH_VAULT, "Info", "Risk Level", "academy-vault-info.png");
  if (wanted("visualizer")) await panel(page, USDC_VAULT, "Visualizer", "Yield APY", "academy-visualizer.png");
  if (wanted("earmarking")) await panel(page, USDC_VAULT, "Earmarking", "Earmarking Rate", "academy-earmarking.png");
} finally {
  await browser.close();
}
