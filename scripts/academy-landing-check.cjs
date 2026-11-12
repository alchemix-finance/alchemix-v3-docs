// Usage: node scripts/academy-landing-check.cjs <width> <height> <state>
// state: empty | mid | intmid | all | <comma separated lesson ids>
// Measures the Academy landing page's alignments in the browser, against the dev
// server (ACADEMY_BASE, default http://localhost:3061), with every open track expanded, and prints every miss over 0.6px:
// the hero's button and label, the course picture's points and key, each track's
// name against its sentence, and each lesson's circle, title and meta.
const puppeteer = require("puppeteer-core");
const path = require("path");
const os = require("os");
const BASE = process.env.ACADEMY_BASE || "http://localhost:3061";
const BEG = ["what-you-can-do-here","your-deposit","borrowing","spend-the-alusd","self-repaying","repay-and-withdraw","what-can-go-wrong","the-transmuter"];
const INT = ["three-contracts","where-yield-comes-from","getting-money-back","cost-of-borrowing","ltv-and-risk","capstone","earmarking-and-cover","pace-of-repayment","transmuter-and-peg","yield-looping"];
(async () => {
  const [w, h, state] = process.argv.slice(2);
  const ids = state === "empty" ? [] : state === "mid" ? BEG.slice(0, 3) : state === "intmid" ? [...BEG, ...INT.slice(0, 3)] : state === "all" ? [...BEG, ...INT] : state.split(",");
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", userDataDir: path.join(os.tmpdir(), "academy-landing-check-profile"), args: ["--no-first-run"] });
  const page = await browser.newPage();
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
  await page.goto(BASE + "/academy", { waitUntil: "networkidle2", timeout: 120000 });
  await page.evaluate((ids) => {
    localStorage.clear();
    const all = {}; ids.forEach((id) => { all[id] = "local:" + id; });
    if (ids.length) localStorage.setItem("alchemix-academy-completions-v1", JSON.stringify(all));
  }, ids);
  await page.reload({ waitUntil: "networkidle2", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 1000));
  // A track that is not open yet (OPEN_TRACKS in lib/track.js) has no button.
  await page.evaluate(() => document.querySelectorAll('button[class*="trackToggle"]').forEach((b) => b.click()));
  await new Promise((r) => setTimeout(r, 900));
  const out = await page.evaluate(() => {
    const TOL = 0.6;
    const miss = [];
    const note = [];
    const q = (root, sel) => root.querySelector(`[class*="${sel}"]`);
    const qa = (root, sel) => [...root.querySelectorAll(`[class*="${sel}"]`)];
    const firstLine = (el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const rects = [...r.getClientRects()].filter((x) => x.width > 0);
      return rects[0];
    };
    const cy = (r) => r.top + r.height / 2;
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && getComputedStyle(el).display !== "none"; };
    const check = (name, a, b) => { if (Math.abs(a - b) > TOL) miss.push(`${name}: ${a.toFixed(2)} vs ${b.toFixed(2)} (off ${(a - b).toFixed(2)})`); };

    // Hero: button and the lesson label share a center line (side by side only).
    const actions = document.querySelector('[class*="heroActions"]');
    const cta = actions && actions.querySelector("a");
    const tag = actions && actions.querySelector('[class*="heroNext_"],[class*="heroNext__"]');
    if (cta && tag) {
      const a = cta.getBoundingClientRect(), b = tag.getBoundingClientRect();
      if (b.left > a.right) check("hero button center vs label center (y)", cy(a), cy(b));
      else check("hero label left vs button left (stacked)", b.left, a.left);
      const h1 = firstLine(document.querySelector("h1"));
      check("hero button left vs headline left", a.left, h1.left);
    }

    // Picture.
    const art = document.querySelector('[class*="heroArt"]');
    if (art && vis(art)) {
      const svg = art.querySelector("svg");
      const dots = [...svg.querySelectorAll('circle[class*="dot"]')].map((c) => ({ x: +c.getAttribute("cx"), y: +c.getAttribute("cy"), r: +c.getAttribute("r") }));
      const radii = [...new Set(dots.map((d) => d.r))];
      if (radii.length !== 1) miss.push(`picture points come in ${radii.length} sizes: ${radii.join(", ")}`);
      let near = 0;
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dx = Math.abs(dots[i].x - dots[j].x), dy = Math.abs(dots[i].y - dots[j].y);
        if ((dy > 0.05 && dy < 8) || (dx > 0.05 && dx < 8)) near++;
      }
      if (near) miss.push(`picture: ${near} pairs of points nearly share a row or column (under 8 units apart, not 0)`);
      const rows = new Set(dots.map((d) => d.y.toFixed(1))).size, cols = new Set(dots.map((d) => d.x.toFixed(1))).size;
      note.push(`picture: ${dots.length} points on ${rows} rows and ${cols} columns, radius ${radii.join("/")}`);
      const pic = svg.getBoundingClientRect();
      const mark = art.querySelector('[class*="mark"]').getBoundingClientRect();
      check("mark center vs picture center (x)", mark.left + mark.width / 2, pic.left + pic.width / 2);
      check("mark center vs picture center (y)", cy(mark), cy(pic));
      const keyRows = qa(art, "keyRow");
      const g0 = keyRows[0].querySelector("svg").getBoundingClientRect();
      const nLast = firstLine(keyRows[keyRows.length - 1].querySelector('[class*="keyName"]'));
      check("legend first glyph left vs picture left", g0.left, pic.left);
      check("legend last name right vs picture right", nLast.right, pic.right);
      const tops = keyRows.map((k) => k.getBoundingClientRect().top);
      if (new Set(tops.map((t) => t.toFixed(1))).size !== 1) miss.push("legend wraps onto more than one line");
      keyRows.forEach((k) => {
        const g = k.querySelector("svg").getBoundingClientRect();
        const n = firstLine(k.querySelector('[class*="keyName"]'));
        check(`legend glyph center vs name center (${k.textContent})`, cy(g), cy(n));
      });
    }

    // Tracks.
    document.querySelectorAll('section[id^="track-"]').forEach((sec) => {
      const id = sec.id;
      const title = firstLine(q(sec, "label").lastElementChild);
      const intro = firstLine(q(sec, "trackIntro"));
      check(`${id} title left vs sentence left`, title.left, intro.left);
      // A closed track: its "Coming soon" pill ends where an open track's
      // chevron does, when the two are side by side with the words.
      const soon = q(sec, "soon");
      if (soon) {
        const s = soon.getBoundingClientRect();
        const anyChev = document.querySelector('[class*="chevron"]');
        if (anyChev && s.left > title.left + 200) check(`${id} "Coming soon" right vs chevron right`, s.right, anyChev.getBoundingClientRect().right);
        else check(`${id} "Coming soon" left vs title left (stacked)`, s.left, title.left);
        note.push(`${id}: closed`);
        return;
      }
      const seg = q(sec, "segments").getBoundingClientRect();
      const chev = q(sec, "chevron").getBoundingClientRect();
      const stacked = seg.top > chev.bottom;
      if (!stacked) check(`${id} segments center vs chevron center (y)`, cy(seg), cy(chev));
      qa(sec, "row_").concat([]).length;
      [...sec.querySelectorAll('[class*="rail"]')].forEach((rail, i) => {
        const row = rail.parentElement;
        const node = rail.querySelector('[class*="node"]').getBoundingClientRect();
        const titleEl = row.querySelector('[class*="rowTitle"],[class*="cardTitle"]');
        const t = firstLine(titleEl);
        check(`${id} row ${i + 1} circle left vs track title left`, node.left, title.left);
        check(`${id} row ${i + 1} circle center vs lesson title center (y)`, cy(node), cy(t));
        if (Math.abs(node.width - node.height) > 0.1) miss.push(`${id} row ${i + 1} circle is not round: ${node.width}x${node.height}`);
        const inner = rail.querySelector('[class*="node"] > *');
        if (inner) {
          const ir = inner.getBoundingClientRect();
          check(`${id} row ${i + 1} icon center vs circle center (x)`, ir.left + ir.width / 2, node.left + node.width / 2);
          check(`${id} row ${i + 1} icon center vs circle center (y)`, cy(ir), cy(node));
        }
        const meta = row.querySelector('[class*="rowMeta"]');
        if (meta) {
          const m = meta.getBoundingClientRect();
          if (m.left > t.left + 200 && m.top < t.bottom) check(`${id} row ${i + 1} meta center vs lesson title center (y)`, cy(m), cy(t));
          const chevR = chev.right;
          check(`${id} row ${i + 1} meta right vs chevron right`, m.right, chevR);
        }
        const btn = row.querySelector('[class*="cardActions"] a');
        if (btn) {
          const b = btn.getBoundingClientRect();
          if (b.left > t.left + 200 && b.top < t.bottom) check(`${id} row ${i + 1} card button center vs card title center (y)`, cy(b), cy(t));
        }
      });
    });

    // Any number sitting in a circle, anywhere on the page.
    document.querySelectorAll("body *").forEach((el) => {
      if (!/^\d{1,2}$/.test(el.textContent.trim()) || el.children.length) return;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width && Math.abs(r.width - r.height) < 2 && parseFloat(cs.borderTopLeftRadius) >= r.width / 2 - 1) note.push(`number in a circle: "${el.textContent.trim()}" ${el.className}`);
    });

    // What is copper in the first screen.
    const copper = "rgb(245, 192, 154)";
    const cu = new Set();
    document.querySelectorAll("main *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || r.top > window.innerHeight || r.bottom < 0 || !vis(el)) return;
      const cs = getComputedStyle(el);
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if ((own && cs.color === copper) || cs.backgroundColor === copper || cs.fill === copper || (cs.stroke === copper && el.tagName !== "svg" && el.tagName !== "g")) {
        cu.add(`${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(" ")[0].replace(/_[A-Za-z0-9-]+$/, "")}`);
      }
    });
    note.push(`copper in the first screen: ${[...cu].join(", ") || "none"}`);
    note.push(`page scroll width ${document.documentElement.scrollWidth} at viewport ${window.innerWidth}`);
    if (document.documentElement.scrollWidth > window.innerWidth) miss.push("page scrolls sideways");
    return { miss, note };
  });
  console.log(`== ${w}x${h} ${state}`);
  out.note.forEach((n) => console.log("  note:", n));
  if (out.miss.length) out.miss.forEach((m) => console.log("  MISS:", m)); else console.log("  no misses");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
