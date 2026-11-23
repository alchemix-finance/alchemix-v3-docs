/**
 * Captures of the app's list pages (Borrow, Fixed Yield, Mixed Yield) at the
 * widths the Academy shows them at, with the places a lesson's text points at.
 *
 *   node scripts/capture-app-lists.mjs [outDir] [dataFile]
 *
 * The 1600px captures of these pages (`capture-app-screens.mjs`) show a card
 * 1288px wide. Beside a lesson's text a figure has about 720px, so that card
 * came out at half size with labels a few pixels tall. The app has its own
 * layout for a window that wide, and for a phone, so each page is captured
 * again at 820px and at 390px, where the same card is drawn at a size that
 * reads, and the figure shows it at close to its own size. A third capture
 * at 1200px ("wide") is the desktop card at the narrowest window that draws
 * it whole.
 *
 * For each page and width it writes two files, 2x, dark, no wallet:
 *
 *   academy-<page>-<wide|mid|phone>-head.png   the page's heading: icon, title, description
 *   academy-<page>-<wide|mid|phone>-cards.png  the Ethereum cards (one on Fixed Yield)
 *
 * each with the page's own 12px around it, and one data file
 * (`src/components/Academy/lib/app-lists.json`): the size of every file,
 * where each card sits in its file, and
 * where the parts a lesson names are (`spots`, as shares of the file). The
 * kit's SHOTS and the tour read the figures from that file, so a recapture
 * needs no rectangle measured by hand.
 *
 * The Ethereum cards are found by what they hold (alUSD or alETH against
 * USDC or ETH, "ETH alUSD Price"), never by their place in the list, which
 * the app has changed before.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const OUT = path.resolve(process.argv[2] ?? "static/img");
const DATA = path.resolve(process.argv[3] ?? "src/components/Academy/lib/app-lists.json");
const APP = "https://app.alchemix.fi";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PAD = 12;
// "wide" is the app's desktop card (one row: the figures, then the form) at
// the narrowest window that draws it whole. The lesson 1 tour and the Fixed
// Yield figure show it scaled to their width: at 820px the Fixed Yield card
// is the app's tall stacked one, which read as a bulky version of the page.
const ALL_WIDTHS = [
  { key: "wide", width: 1200 },
  { key: "mid", width: 820 },
  { key: "phone", width: 390 },
];
// LAYOUTS=wide (or "mid,phone") retakes only those, and keeps the rest of the data file.
const ONLY = (process.env.LAYOUTS ?? "").split(",").map((k) => k.trim()).filter(Boolean);
const WIDTHS = ONLY.length ? ALL_WIDTHS.filter((w) => ONLY.includes(w.key)) : ALL_WIDTHS;
const PAGES = [
  { key: "borrow", path: "/vaults", title: "Self-Repaying Loans", kind: "vault" },
  { key: "fixed-yield", path: "/fixed-yield", title: "Fixed Yield", kind: "fixed" },
  { key: "mixed-yield", path: "/mixed-yield", title: "Mixed Yield", kind: "mixed" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Runs in the page: the heading block, the Ethereum cards and the parts inside them, in CSS px. */
function measure({ title, kind, viewport }) {
  const box = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.x, y: b.y + window.scrollY, w: b.width, h: b.height };
  };
  const union = (list) => {
    const rs = list.filter(Boolean);
    if (!rs.length) return null;
    const x = Math.min(...rs.map((r) => r.x));
    const y = Math.min(...rs.map((r) => r.y));
    return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
  };
  const trimTop = (r, share) => (r ? { x: r.x, y: r.y + r.h * share, w: r.w, h: r.h * (1 - share) } : null);
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
  const all = (root) => [...root.querySelectorAll("*")];
  const withText = (root, re) => all(root).filter((e) => re.test(own(e)));

  // The heading: the title, climbed to the row that also holds the icon.
  const h1 = withText(document, new RegExp(`^${title}$`))[0];
  let head = h1;
  while (head && head.parentElement && !(head.getBoundingClientRect().x <= 24 && head.getBoundingClientRect().width > 0.8 * viewport)) head = head.parentElement;

  // Every card: from an "APR" label up to the box that spans the page.
  const cards = [];
  for (const a of withText(document, /^(APR|Projected Fixed APR)$/)) {
    let c = a;
    while (c && !(c.getBoundingClientRect().width > viewport - 40)) c = c.parentElement;
    if (c && !cards.includes(c)) cards.push(c);
  }
  const srcs = (c) => [...c.querySelectorAll("img")].map((i) => (i.getAttribute("src") || "").split("/").pop());
  const text = (c) => c.innerText;
  // Ethereum's cards borrow alUSD or alETH (Base's borrow alUSDb), and come before the other chains'.
  let picked;
  if (kind === "fixed") picked = cards.filter((c) => /ETH alUSD Price/.test(text(c))).slice(0, 1);
  else {
    const usdc = cards.find((c) => srcs(c).includes("USDC.svg") && (kind === "mixed" || srcs(c).includes("alUSD.svg")) && cards.indexOf(c) > 0);
    const eth = usdc ? cards[cards.indexOf(usdc) + 1] : null;
    picked = [usdc, eth].filter(Boolean);
  }

  // A line of a card: a label and the value on its line. The two are in one
  // row box, or are cells of a grid, where the value is whatever else in the
  // grid is on the label's line.
  const lineOf = (card, re) => {
    const label = withText(card, re)[0];
    if (!label) return null;
    const l = label.getBoundingClientRect();
    let scope = label.parentElement;
    while (scope !== card && (scope.innerText || "").trim() === (label.innerText || "").trim()) scope = scope.parentElement;
    if (scope.getBoundingClientRect().height < 2.2 * l.height) return box(scope);
    const mid = (l.top + l.bottom) / 2;
    const same = all(scope).filter((e) => {
      if (e.children.length && !own(e)) return false;
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && b.height < 2.2 * l.height && b.top < mid && b.bottom > mid;
    });
    return union([box(label), ...same.map(box)]);
  };
  // The bar over a line: a thin, wide box that ends just above it.
  const barOver = (card, line) => {
    if (!line) return null;
    const bar = all(card).find((e) => {
      const b = e.getBoundingClientRect();
      const top = b.top + window.scrollY;
      return b.height >= 6 && b.height <= 18 && b.width > 180 && top + b.height <= line.y + 2 && top + b.height > line.y - 24;
    });
    return bar ? box(bar) : null;
  };
  // The lighter panel a label sits in.
  const panelOf = (card, re) => {
    let p = withText(card, re)[0];
    while (p && p.parentElement !== card && !(p.getBoundingClientRect().height > 120 && window.getComputedStyle(p).borderRadius !== "0px")) p = p.parentElement;
    return p && p !== card ? box(p) : null;
  };

  const parts = (card) => {
    const flag = all(card).find((e) => {
      const b = e.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      return b.width >= 24 && b.width <= 60 && b.height >= 16 && b.height <= 40 && Math.abs(b.left - c.left) < 3 && Math.abs(b.top - c.top) < 3;
    });
    const icons = [...card.querySelectorAll("img")].filter((i) => / icon$/.test(i.alt || "") && i.getBoundingClientRect().width > 0).slice(0, 2);
    // The smallest box whose whole text matches.
    const whole = (re) => all(card).filter((e) => re.test((e.innerText || "").trim())).pop() ?? null;
    if (kind === "fixed") {
      const apr = lineOf(card, /^Projected Fixed APR$/);
      const name = whole(/^(USDC|WETH)\s+[\d.]+%$/);
      const cap = lineOf(card, /^Available Space$/);
      return {
        "fy-chain": flag ? box(flag) : null,
        "fy-asset": union(icons.map(box)),
        // The heading's own box has its leading over the letters, which
        // reaches up into the token icons: the top sixth is left off.
        "fy-apr": trimTop(union([name ? box(name) : null, apr]), 0.17),
        "fy-cap": union([barOver(card, cap), cap]),
        "fy-term": lineOf(card, /^Term$/),
        "fy-fee": lineOf(card, /^Early Exit Fee$/),
        "fy-maturity": lineOf(card, /^Maturity Date$/),
        "fy-price": lineOf(card, /alUSD Price$/),
        "fy-output": lineOf(card, /^Expected Output$/),
        "fy-percent": lineOf(card, /^Percentage Return$/),
        "fy-gain": lineOf(card, /^Asset Gain$/),
      };
    }
    const name = withText(card, /^Risk-adjusted Mix (USDC|ETH)$/)[0];
    const aprLabel = withText(card, /^APR$/)[0];
    const out = {
      "card-chain": flag ? box(flag) : null,
      "card-asset": union(icons.map(box)),
      "card-name": name ? box(name) : null,
      "card-apr": aprLabel ? box(aprLabel.parentElement) : null,
    };
    if (kind === "vault") {
      const cap = lineOf(card, /^Available Space$/);
      out["card-cap"] = union([barOver(card, cap), cap]);
      out["card-totals"] = panelOf(card, /^Total Deposits$/);
    } else {
      out["card-strategies"] = panelOf(card, /^STRATEGIES$/i);
    }
    return out;
  };

  return {
    head: head ? box(head) : null,
    cards: picked.map((c) => ({ rect: box(c), name: (text(c).split("\n")[0] || "").trim(), parts: parts(c) })),
    count: cards.length,
  };
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const data = ONLY.length && fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : {};
try {
  for (const { key: size, width } of WIDTHS) {
    for (const pg of PAGES) {
      const page = await browser.newPage();
      // Tall enough for the cards wanted, so a clip never leaves the viewport
      // (a clip past it resizes the page's containers mid-capture).
      await page.setViewport({ width, height: 3600, deviceScaleFactor: 2 });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.goto(APP + pg.path, { waitUntil: "networkidle2", timeout: 90_000 });
      await sleep(5000);
      const m = await page.evaluate(measure, { title: pg.title, kind: pg.kind, viewport: width });
      if (!m.head) throw new Error(`${pg.key} ${size}: no heading "${pg.title}"`);
      if (m.cards.length !== (pg.kind === "fixed" ? 1 : 2)) throw new Error(`${pg.key} ${size}: found ${m.cards.length} Ethereum cards of ${m.count}`);
      const clipOf = (r) => ({ x: 0, y: Math.round(r.y - PAD), width, height: Math.round(r.h + 2 * PAD) });
      const share = (r, clip) => (r ? { x: (r.x - clip.x) / clip.width, y: (r.y - clip.y) / clip.height, w: r.w / clip.width, h: r.h / clip.height } : null);

      const headClip = clipOf(m.head);
      const headFile = `academy-${pg.key}-${size}-head.png`;
      await page.screenshot({ path: path.join(OUT, headFile), clip: headClip });

      const top = Math.min(...m.cards.map((c) => c.rect.y));
      const bottom = Math.max(...m.cards.map((c) => c.rect.y + c.rect.h));
      const cardsClip = clipOf({ y: top, h: bottom - top });
      const cardsFile = `academy-${pg.key}-${size}-cards.png`;
      await page.screenshot({ path: path.join(OUT, cardsFile), clip: cardsClip });

      data[`${pg.key}-${size}`] = {
        head: { src: `/img/${headFile}`, size: [headClip.width * 2, headClip.height * 2] },
        cards: {
          src: `/img/${cardsFile}`,
          size: [cardsClip.width * 2, cardsClip.height * 2],
          pad: PAD,
          items: m.cards.map((c) => ({
            name: c.name,
            rect: share(c.rect, cardsClip),
            spots: Object.fromEntries(Object.entries(c.parts).map(([k, r]) => [k, share(r, cardsClip)]).filter(([, r]) => r)),
          })),
        },
      };
      console.log(`${pg.key} ${size}: head ${headClip.width}x${headClip.height}, cards ${cardsClip.width}x${cardsClip.height} (${m.cards.map((c) => c.name).join(", ")})`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
const round = (v) => (typeof v === "number" ? Math.round(v * 1e5) / 1e5 : v);
fs.writeFileSync(DATA, `${JSON.stringify(data, (k, v) => round(v), 1)}\n`);
console.log(`wrote ${DATA}`);
