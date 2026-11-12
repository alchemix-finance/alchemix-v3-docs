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
 *                                       phone-tab-repay menu vault-page swap
 *                                       earmarking-hover redemptions
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

// One vault per asset. The Info tab is read from the USDC vault, which sits
// inside the caps the lesson prints above it (the ETH capture read 64.87%
// Moderate under a table saying 60%); the Visualizer and Earmarking panels too,
// because the lessons that show them carry a USDC position.
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

/**
 * The app's top menu with Earn open, for beginner lesson 1: the header strip
 * at the 1600px viewport, down to the foot of the dropdown with the page's own
 * margin under it. The app's menus open on hover (a navigation-menu trigger
 * with aria-expanded), and the dropdown fades in, so the capture waits until
 * its items are fully opaque. Taken on the Mixed Yield page, so Earn is the
 * active item as well as the open one.
 */
async function menu(page, file) {
  await open(page, `${APP}/mixed-yield`);
  const trigger = (await page.evaluateHandle(() => [...document.querySelectorAll("button")].find((b) => (b.innerText ?? "").trim() === "Earn") ?? null)).asElement();
  if (!trigger) throw new Error("no Earn button in the header");
  const box = await trigger.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const items = () => page.evaluate(() => {
    const leaves = [...document.querySelectorAll("*")].filter((el) => el.childElementCount === 0 && /^(Variable Rate|Fixed Rate)$/.test((el.innerText ?? "").trim()));
    return leaves.map((el) => {
      let o = 1;
      for (let a = el; a && a !== document.body; a = a.parentElement) o *= Number(getComputedStyle(a).opacity);
      const r = el.getBoundingClientRect();
      return { o, bottom: r.bottom, w: r.width };
    });
  });
  let seen = [];
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    seen = await items();
    if (seen.length >= 2 && seen.every((x) => x.o > 0.99 && x.w > 0)) break;
  }
  if (!(seen.length >= 2 && seen.every((x) => x.o > 0.99))) throw new Error("the Earn menu did not open");
  await sleep(600);
  const rect = await page.evaluate(() => {
    const header = document.querySelector("header") ?? document.body;
    const H = header.getBoundingClientRect();
    const leaves = [...document.querySelectorAll("*")].filter((el) => el.childElementCount === 0 && /^(Variable Rate|Fixed Rate)$/.test((el.innerText ?? "").trim()));
    // The dropdown's own panel: the first ancestor of the items that paints a background.
    let panel = leaves[0];
    for (let a = leaves[0]; a && a !== document.body; a = a.parentElement) {
      const bg = getComputedStyle(a).backgroundColor;
      if (bg && bg !== "transparent" && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg)) { panel = a; break; }
    }
    const P = panel.getBoundingClientRect();
    return { top: Math.max(0, H.top), bottom: Math.max(H.bottom, P.bottom) };
  });
  // A short margin under the dropdown: the page's title starts about 12px
  // below it, and a deeper clip took the top of that in.
  const pad = 10;
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: 0, y: rect.top, width: 1600, height: Math.ceil(rect.bottom - rect.top + pad) },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(1600x${Math.ceil(rect.bottom - rect.top + pad)} css)`);
}

/**
 * The USDC vault page as a reader first meets it, for beginner lesson 2: the
 * vault's name, the stat tiles with the APR at the top, the bar, and the two
 * panels under them with the Info tab open beside Deposit/Borrow, in one
 * image. At the 1600px viewport the panels sit side by side, so the tiles and
 * the Info tab's allocation are on one screen. The viewport is tall enough to
 * hold the panels, and the capture waits for the Info tab's APR chart to draw.
 * The clip runs from the Back link to the panels' foot and across the page's
 * content column, with 24px of the page around it.
 */
async function vaultPage(page, url, file) {
  await page.setViewport({ width: 1600, height: 1500, deviceScaleFactor: 2 });
  await open(page, url);
  for (let i = 0; i < 30; i++) {
    const drawn = await page.evaluate(() => [...document.querySelectorAll("svg path[d]")].filter((p) => p.getAttribute("d").length > 120).length);
    if (drawn > 1) break;
    await sleep(1000);
  }
  await page.mouse.move(2, 2);
  await sleep(1500);
  const rect = await page.evaluate(() => {
    const leaf = (t) => [...document.querySelectorAll("*")].find((el) => el.childElementCount === 0 && (el.innerText ?? "").trim() === t);
    const painted = (el, minW) => {
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const bg = getComputedStyle(a).backgroundColor;
        if (a.getBoundingClientRect().width >= minW && bg && bg !== "transparent" && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg)) return a;
      }
      return null;
    };
    // The Back button starts the page's content column on the left; the
    // Info panel ends it on the right and at the foot.
    const back = [...document.querySelectorAll("button")].find((el) => (el.innerText ?? "").trim() === "Back");
    const info = painted(leaf("Risk Level"), 400);
    if (!back || !info) return null;
    const B = back.getBoundingClientRect(), I = info.getBoundingClientRect();
    return { x: B.left, y: B.top, w: I.right - B.left, h: I.bottom - B.top };
  });
  if (!rect) throw new Error("could not find the vault page's parts");
  const pad = 24;
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: rect.x - pad, y: rect.y - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(${Math.round(rect.w + 2 * pad)}x${Math.round(rect.h + 2 * pad)} css)`);
  await page.setViewport({ width: 1600, height: 1250, deviceScaleFactor: 2 });
}

/**
 * The Trade page's Swap card, alUSD in and USDC out, for beginner lesson 4.
 * The card loads as ETH to alETH; with no wallet attached its token pickers
 * still open, so the capture picks alUSD in the top box and USDC in the
 * bottom one, then clips the card with 24px of the page above and below and
 * 112px either side, so the picture has the proportions of a lesson's text
 * column and the card sits in the page as the app draws it.
 */
async function swapCard(page, file) {
  await open(page, `${APP}/trading/swap`);
  const pick = async (current, want) => {
    const handle = (await page.evaluateHandle((c) => [...document.querySelectorAll("button")].find((b) => (b.innerText ?? "").trim() === c && b.getBoundingClientRect().top > 400) ?? null, current)).asElement();
    if (!handle) throw new Error(`no ${current} picker on the Swap card`);
    const box = await handle.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await sleep(1500);
    const option = (await page.evaluateHandle((w) => [...document.querySelectorAll("button, li, div")].filter((e) => e.childElementCount <= 3 && e.getBoundingClientRect().height > 0).find((e) => (e.innerText ?? "").trim().split("\n")[0] === w) ?? null, want)).asElement();
    if (!option) throw new Error(`no ${want} in the ${current} picker`);
    const ob = await option.boundingBox();
    await page.mouse.click(ob.x + ob.width / 2, ob.y + ob.height / 2);
    await sleep(2000);
  };
  await pick("ETH", "alUSD");
  await pick("alETH", "USDC");
  await closeToasts(page);
  await page.mouse.move(2, 2);
  await sleep(1000);
  const rect = await page.evaluate(() => {
    const top = [...document.querySelectorAll("button")].find((b) => (b.innerText ?? "").trim() === "alUSD" && b.getBoundingClientRect().top > 400);
    const bottom = [...document.querySelectorAll("button")].find((b) => (b.innerText ?? "").trim() === "USDC" && b.getBoundingClientRect().top > 500);
    if (!top || !bottom) return null;
    // The card: the first ancestor of the top picker that also holds the bottom one and paints a background.
    for (let a = top.parentElement; a && a !== document.body; a = a.parentElement) {
      const bg = getComputedStyle(a).backgroundColor;
      if (a.contains(bottom) && bg && bg !== "transparent" && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg)) {
        const r = a.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      }
    }
    return null;
  });
  if (!rect) throw new Error("could not find the Swap card with alUSD and USDC picked");
  const padX = 112, padY = 24;
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: rect.x - padX, y: rect.y - padY, width: rect.w + 2 * padX, height: rect.h + 2 * padY },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(${Math.round(rect.w + 2 * padX)}x${Math.round(rect.h + 2 * padY)} css)`);
}

/**
 * A chart panel with its tooltip open on one day, for intermediate lessons 4
 * and 5: the Earmarking tab on a day where cover absorbed part of what
 * matured, and the Redemptions tab's Schedule on a day with alUSD maturing.
 * The pointer walks across the chart from the right until the tooltip holds
 * every label in `labels` and `ok(text)` accepts it; the clip is the panel
 * (as `panel` with `whole`) widened to take in the tooltip. Taken at the
 * 1000px viewport, with no wallet.
 */
async function hoverPanel(page, url, tab, marker, labels, ok, file) {
  await open(page, url);
  const handle = (await page.evaluateHandle((t) => [...document.querySelectorAll("[role=tab]")].find((el) => el.innerText.trim() === t) ?? null, tab)).asElement();
  if (!handle) throw new Error(`no tab named ${tab}`);
  await handle.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await sleep(400);
  const box = await handle.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  try { await page.waitForNetworkIdle({ idleTime: 2000, timeout: 40000 }); } catch { /* keep going on the timer */ }
  await sleep(8000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
  // The panel, as `panel` finds it, and the chart inside it.
  const found = await page.evaluate((t, m) => {
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
    for (let a = node; a && a !== document.body; a = a.parentElement) {
      const r = a.getBoundingClientRect();
      if (r.top < L.bottom - 4 || a.contains(list)) break;
      const bg = getComputedStyle(a).backgroundColor;
      if (bg && bg !== "transparent" && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg)) node = a;
    }
    const svgs = [...node.querySelectorAll("svg")].map((s) => s.getBoundingClientRect()).filter((r) => r.width > 300 && r.height > 120);
    if (!svgs.length) return null;
    const S = svgs.sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const R = node.getBoundingClientRect();
    const x1 = Math.min(L.left, R.left), y1 = Math.min(L.top, R.top), x2 = Math.max(L.right, R.right), y2 = Math.max(L.bottom, R.bottom);
    return { panel: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }, chart: { x: S.left, y: S.top, w: S.width, h: S.height } };
  }, tab, marker);
  if (!found) throw new Error(`could not find the ${tab} chart`);
  const { chart } = found;
  // The chart's own bars first, from the right (a sparse schedule shows a
  // tooltip only over a bar), then a sweep across the chart.
  const bars = await page.evaluate((c) => [...document.querySelectorAll("svg rect")]
    .map((r) => r.getBoundingClientRect())
    .filter((b) => b.width > 2 && b.width < 60 && b.height > 4 && b.left >= c.x - 2 && b.right <= c.x + c.w + 2 && b.top >= c.y - 2 && b.bottom <= c.y + c.h + 2)
    .map((b) => ({ x: b.left + b.width / 2, y: b.top + b.height / 2 }))
    .sort((a, b) => b.x - a.x), chart);
  const points = [...bars, ...Array.from({ length: 61 }, (_, i) => ({ x: chart.x + chart.w * (0.94 - i * 0.0145), y: chart.y + chart.h * 0.6 }))];
  let tip = null;
  for (let i = 0; i < points.length && !tip; i++) {
    await page.mouse.move(points[i].x, points[i].y);
    await sleep(350);
    tip = await page.evaluate((labels) => {
      const els = [...document.querySelectorAll("div, section")].filter((el) => {
        const t = el.innerText ?? "";
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.width < 420 && labels.every((l) => t.includes(l));
      });
      if (!els.length) return null;
      const el = els.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)[0];
      const r = el.getBoundingClientRect();
      return { text: el.innerText, x: r.left, y: r.top, w: r.width, h: r.height };
    }, labels);
    if (tip && !ok(tip.text)) tip = null;
  }
  if (!tip) throw new Error(`no ${tab} tooltip with ${labels.join(", ")}`);
  console.log(`  ${tab} tooltip:`, tip.text.replace(/\s+/g, " "));
  const P = found.panel;
  const x1 = Math.min(P.x, tip.x), y1 = Math.min(P.y, tip.y), x2 = Math.max(P.x + P.w, tip.x + tip.w), y2 = Math.max(P.y + P.h, tip.y + tip.h);
  const pad = Math.max(0, Math.min(28, x1));
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: x1 - pad, y: y1 - pad, width: x2 - x1 + 2 * pad, height: y2 - y1 + 2 * pad },
    captureBeyondViewport: false,
  });
  console.log("wrote", file, `(${Math.round(x2 - x1 + 2 * pad)}x${Math.round(y2 - y1 + 2 * pad)} css)`);
}

/** The number after `label` in a tooltip's text, or NaN. */
const after = (text, label) => {
  const m = new RegExp(`${label}\\s*:?\\s*\\$?([\\d,.]+)`).exec(text.replace(/\s+/g, " "));
  return m ? Number(m[1].replace(/,/g, "")) : NaN;
};

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
  if (wanted("menu")) await menu(page, "academy-menu-earn.png");
  if (wanted("vault-page")) await vaultPage(page, USDC_VAULT, "academy-vault-page.png");
  if (wanted("swap")) await swapCard(page, "academy-swap.png");

  // The stacked layout: one panel to a row, each the width of the page.
  await page.setViewport({ width: 1000, height: 1700, deviceScaleFactor: 2 });
  if (wanted("tab-deposit")) await actionTab(page, USDC_VAULT, "Deposit/Borrow", "academy-tab-deposit.png");
  if (wanted("tab-withdraw")) await actionTab(page, USDC_VAULT, "Withdraw", "academy-tab-withdraw.png");
  if (wanted("tab-repay")) await actionTab(page, USDC_VAULT, "Repay", "academy-tab-repay.png");

  await page.setViewport({ width: 1000, height: 2600, deviceScaleFactor: 2 });
  if (wanted("vault-info")) await panel(page, USDC_VAULT, "Info", "Risk Level", "academy-vault-info.png");
  if (wanted("visualizer")) await panel(page, USDC_VAULT, "Visualizer", "Yield APY", "academy-visualizer.png", { whole: true });
  if (wanted("earmarking")) await panel(page, USDC_VAULT, "Earmarking", "Earmarking Rate", "academy-earmarking.png", { whole: true });
  if (wanted("earmarking-hover")) {
    await hoverPanel(page, USDC_VAULT, "Earmarking", "Earmarking Rate", ["Matured", "Absorbed by cover", "Earmarked"], (t) => after(t, "Absorbed by cover") > 0, "academy-earmarking-hover.png");
  }
  if (wanted("redemptions")) {
    // The Ethereum USDC vault's Schedule read "No redemptions in the next 3
    // months" on 2026-11-07, so this one is the Optimism USDC vault's.
    await hoverPanel(page, `${APP}/vaults/0xAf510a560744880410f0f65e3341A020FBC2cA41`, "Redemptions", "Redemption Schedule", ["Maturing", "Cumulative", "Share of debt"], (t) => after(t, "Maturing") > 0, "academy-redemptions.png");
  }

  // Phones: the tiles two to a row, and each action panel on its own.
  await page.setViewport({ width: 390, height: 3000, deviceScaleFactor: 2 });
  if (wanted("phone-stats")) await phoneStats(page, USDC_VAULT, "academy-phone-stats.png");
  if (wanted("phone-tab-deposit")) await phoneTab(page, USDC_VAULT, "Deposit/Borrow", "academy-phone-tab-deposit.png");
  if (wanted("phone-tab-withdraw")) await phoneTab(page, USDC_VAULT, "Withdraw", "academy-phone-tab-withdraw.png");
  if (wanted("phone-tab-repay")) await phoneTab(page, USDC_VAULT, "Repay", "academy-phone-tab-repay.png");
} finally {
  await browser.close();
}
