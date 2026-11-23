import { useEffect } from "react";

/* One round of the light, in seconds (`--cue-cycle` in the style sheet), and
   how far apart the labels on screen take their turns. */
const CYCLE = 3.6;
const STEP_MAX = 0.4;
const SPREAD = 2;

/* Things nothing can be drawn on, and things that take no pseudo-element (a
   typed field), which are ringed with their own shadow. */
const NO_MARK = "img, video, canvas, svg, svg *";
const NO_PSEUDO = "input, textarea, select";
/* A thing thinner than this in either direction (a marker on the bar) is a
   line: it glows, and gets no ring. */
const LINE_PX = 8;
/* The room a ring keeps around the words of a thing that has no box of its
   own, at a 16px root: this much where there is room for it, less only where
   it would run into what is drawn beside the thing (it stops `GAP_KEEP`
   short of that), never under the least. A ring is drawn to be seen as a
   highlight, with room in it; it is not fitted to the thing's edges. */
const PAD_X = 10;
const PAD_Y = 7;
const PAD_MIN = 2;
const GAP_KEEP = 2;
/* More names than this on screen, and the light goes through the text a
   paragraph at a time: the names in one paragraph, and what they name, are
   marked together, then the next paragraph's. Every element the page talks
   about lit at once told the reader nothing about which sentence it went
   with. */
const LIMIT = 3;
const BLOCK = "p, li, dt, dd, figcaption, h1, h2, h3, h4, h5";

/** The root's size against 16px: the lesson pages scale with the window, and so do these measures. */
const unit = () => (parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16) / 16;
/* Two rings nearer than this (at a 16px root) are crowded, and so is a ring
   inside another: several outlines set against each other read as stray
   boxes. Crowded things are not marked at once. They take turns, one round
   of the light each, and the turn changes this long before a round starts,
   while the light is off the page. */
const CROWD = 8;
const TURN_LEAD = 0.45;

/* On screen and in use. A part of a capture is a clear box hidden from
   screen readers itself (`self`), so only what is around it is asked. */
function shown(el, self = true) {
  if (el.getClientRects().length === 0) return false;
  const from = self ? el : el.parentElement;
  if (el.closest("[inert], [hidden]") || (from && from.closest("[aria-hidden='true']"))) return false;
  return window.getComputedStyle(el).visibility !== "hidden";
}

const solid = (color) => {
  if (!color || color === "transparent") return false;
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return true;
  const parts = m[1].split(/[,/ ]+/).filter(Boolean);
  return parts.length < 4 || parseFloat(parts[3]) > 0.02;
};

/* The box around what a thing shows: its words, and anything drawn in it (a
   rolling number is its own element). What is laid out but not drawn (a
   field's widest number) and what only visits (`data-cue-ignore`, a change
   tag) are left out. */
function inked(el) {
  let box = null;
  const add = (r) => {
    if (!r || !r.width || !r.height) return;
    box = box
      ? { left: Math.min(box.left, r.left), top: Math.min(box.top, r.top), right: Math.max(box.right, r.right), bottom: Math.max(box.bottom, r.bottom) }
      : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  };
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        if (!child.nodeValue.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(child);
        add(range.getBoundingClientRect());
      } else if (child.nodeType === 1) {
        if (child.hasAttribute("data-cue-ignore") || child.getClientRects().length === 0) continue;
        if (window.getComputedStyle(child).visibility === "hidden") continue;
        if (child.tagName.includes("-") || child.matches("img, svg, input, button, canvas")) add(child.getBoundingClientRect());
        else if (!child.textContent.trim()) {
          // A drawn box with no words in it (the swatch of a chart's key).
          const cs = window.getComputedStyle(child);
          if (solid(cs.backgroundColor) || cs.backgroundImage !== "none" || parseFloat(cs.borderTopWidth) > 0) add(child.getBoundingClientRect());
          // Or a wrapper round something drawn in its own tree (a rolling number).
          else walk(child);
        } else walk(child);
      }
    }
  };
  walk(el);
  return box;
}

/* How near the next thing is on each side of `c` among the thing's own
   neighbors and its parent's edges: the room a ring has to grow into. */
function room(el, c) {
  const out = { top: Infinity, right: Infinity, bottom: Infinity, left: Infinity };
  const parent = el.parentElement;
  if (!parent) return out;
  for (const sib of parent.children) {
    if (sib === el || sib.getClientRects().length === 0) continue;
    const ink = inked(sib) ?? sib.getBoundingClientRect();
    const across = ink.left < c.right && ink.right > c.left;
    const down = ink.top < c.bottom && ink.bottom > c.top;
    if (across && ink.bottom <= c.top + 1) out.top = Math.min(out.top, c.top - ink.bottom);
    if (across && ink.top >= c.bottom - 1) out.bottom = Math.min(out.bottom, ink.top - c.bottom);
    if (down && ink.right <= c.left + 1) out.left = Math.min(out.left, c.left - ink.right);
    if (down && ink.left >= c.right - 1) out.right = Math.min(out.right, ink.left - c.right);
  }
  return out;
}

/* ── A part of a capture ──
   A part of a picture of the app (`data-spot`, a clear box over it) is where
   the app laid the thing out: a heading's box reaches up into the icons over
   it, a row's box runs the width of its column. A ring on that box sat loose
   on one side and ran into the next part's ring on another. So the ring is
   fitted to what the picture shows there, read from its pixels.

   A pixel this far from the ground on any channel is drawn (`INK`, fine
   enough to see a panel a shade lighter than its card; `INK_BOLD` for words
   and pictures, which leaves out the faint lines the app draws behind a
   page); this many CSS px around the part are read for what is near it; a
   round thing (icons, a chart) keeps this much room. */
const INK = 6;
const INK_BOLD = 40;
const REACH = 26;
const PAD_ROUND = 5;
const SPOT_PX_MAX = 2.5e6;
const spotRead = new Map();

/* What is drawn in the part, in the capture's own pixels: the box around it
   (`box`), whether it is a filled shape with an edge of its own (`solid`,
   with the radius of each corner), whether it is round, and how far it is to
   the next drawn thing on each side (`clear`, Infinity for none in reach). */
function readSpot(img, x0, y0, x1, y1, m, shown) {
  // Only what the figure shows of the capture (`shown`) is read: what the
  // crop cuts off is near nothing.
  const [LX0, LY0, LX1, LY1] = shown;
  const X0 = Math.max(LX0, x0 - m);
  const Y0 = Math.max(LY0, y0 - m);
  const X1 = Math.min(LX1, x1 + m);
  const Y1 = Math.min(LY1, y1 + m);
  const w = X1 - X0;
  const h = Y1 - Y0;
  if (w < 4 || h < 4 || w * h > SPOT_PX_MAX) return null;
  let data;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, X0, Y0, w, h, 0, 0, w, h);
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
  // The part's own rectangle, in the read region.
  const sx0 = x0 - X0;
  const sy0 = y0 - Y0;
  const sx1 = x1 - X0;
  const sy1 = y1 - Y0;

  // The ground: the colors of a band just outside the part.
  const tally = new Map();
  let band = 0;
  const count = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4;
    const key = ((data[i] >> 2) << 12) | ((data[i + 1] >> 2) << 6) | (data[i + 2] >> 2);
    const t = tally.get(key);
    if (t) t.n += 1;
    else tally.set(key, { n: 1, c: [data[i], data[i + 1], data[i + 2]] });
    band += 1;
  };
  for (let d = 1; d <= 3; d++) {
    for (let x = sx0 - d; x < sx1 + d; x++) {
      count(x, sy0 - d);
      count(x, sy1 - 1 + d);
    }
    for (let y = sy0; y < sy1; y++) {
      count(sx0 - d, y);
      count(sx1 - 1 + d, y);
    }
  }
  if (!band) return null;
  const ranked = [...tally.values()].sort((a, b) => b.n - a.n);
  const ground = ranked.filter((t, i) => i === 0 || t.n >= band * 0.12).map((t) => t.c);

  // What is drawn, taking a pixel as drawn when it is `far` from the ground.
  const measure = (far) => {
    const ink = new Uint8Array(w * h);
    for (let p = 0, i = 0; p < w * h; p++, i += 4) {
      let drawn = 1;
      for (const g of ground) {
        if (Math.abs(data[i] - g[0]) < far && Math.abs(data[i + 1] - g[1]) < far && Math.abs(data[i + 2] - g[2]) < far) {
          drawn = 0;
          break;
        }
      }
      ink[p] = drawn;
    }
    const rowInk = (y, a, b) => {
      if (y < 0 || y >= h) return 0;
      let n = 0;
      for (let x = Math.max(0, a); x < Math.min(w, b); x++) n += ink[y * w + x];
      return n;
    };
    const colInk = (x, a, b) => {
      if (x < 0 || x >= w) return 0;
      let n = 0;
      for (let y = Math.max(0, a); y < Math.min(h, b); y++) n += ink[y * w + x];
      return n;
    };

    // The part's own ink. A sliver at an edge that carries on outside it, with
    // clear ground between it and the rest, is the next thing reaching in.
    let bx0 = sx0;
    let by0 = sy0;
    let bx1 = sx1;
    let by1 = sy1;
    // How much of the ink on one line (a row, or a column when `upright`)
    // carries straight on into the line beside it.
    const joined = (at, to, lo, hi, upright) => {
      let n = 0;
      for (let v = Math.max(0, lo); v < Math.min(upright ? h : w, hi); v++) {
        const a = upright ? v * w + at : at * w + v;
        const b = upright ? v * w + to : to * w + v;
        if (ink[a] && ink[b]) n += 1;
      }
      return n;
    };
    const trim = (at, step, end, across, lo, hi, extent, upright) => {
      let run = 0;
      while (at + run * step !== end && across(at + run * step, lo, hi) > 0) run += 1;
      const out = at - step;
      if (!run || run > extent * 0.25 || out < 0 || out >= (upright ? w : h)) return 0;
      const on = across(at, lo, hi);
      if (joined(at, out, lo, hi, upright) < Math.max(2, on * 0.5)) return 0;
      // More of it inside the part than outside: the part's own, cut by its box.
      let past = 0;
      while (out - past * step >= 0 && out - past * step < (upright ? w : h) && across(out - past * step, lo, hi) > 0) past += 1;
      if (past <= run) return 0;
      let gap = 0;
      while (at + (run + gap) * step !== end && across(at + (run + gap) * step, lo, hi) === 0) gap += 1;
      return gap >= 2 && at + (run + gap) * step !== end ? run + gap : 0;
    };
    by0 += trim(by0, 1, by1, rowInk, bx0, bx1, by1 - by0, false);
    by1 -= trim(by1 - 1, -1, by0 - 1, rowInk, bx0, bx1, by1 - by0, false);
    bx0 += trim(bx0, 1, bx1, colInk, by0, by1, bx1 - bx0, true);
    bx1 -= trim(bx1 - 1, -1, bx0 - 1, colInk, by0, by1, bx1 - bx0, true);
    while (by0 < by1 && rowInk(by0, bx0, bx1) === 0) by0 += 1;
    while (by1 > by0 && rowInk(by1 - 1, bx0, bx1) === 0) by1 -= 1;
    while (bx0 < bx1 && colInk(bx0, by0, by1) === 0) bx0 += 1;
    while (bx1 > bx0 && colInk(bx1 - 1, by0, by1) === 0) bx1 -= 1;
    if (bx1 - bx0 < 2 || by1 - by0 < 2) return null;
    // Ink of its own that the part's box cuts through (a row of a table
    // measured a little short) is taken in, a little way.
    const grow = (edge, step, across, lo, hi, upright) => {
      const size = upright ? w : h;
      let n = 0;
      while (n < m / 2 && edge + (n + 1) * step >= 0 && edge + (n + 1) * step < size) {
        const at = edge + n * step;
        if (joined(at, at + step, lo, hi, upright) < Math.max(1, across(at, lo, hi) * 0.25)) break;
        n += 1;
      }
      return n;
    };
    by0 -= grow(by0, -1, rowInk, bx0, bx1, false);
    by1 += grow(by1 - 1, 1, rowInk, bx0, bx1, false);
    bx0 -= grow(bx0, -1, colInk, by0, by1, true);
    bx1 += grow(bx1 - 1, 1, colInk, by0, by1, true);

    const bw = bx1 - bx0;
    const bh = by1 - by0;
    const edge = rowInk(by0, bx0, bx1) + rowInk(by1 - 1, bx0, bx1) + colInk(bx0, by0, by1) + colInk(bx1 - 1, by0, by1);
    const solid = edge / (2 * (bw + bh)) >= 0.6;

    // Each corner: how far along the edge, and how far in on the diagonal, the
    // ground runs before the ink starts.
    const corner = (cx, cy, dx, dy) => {
      let along = 0;
      while (along < bw / 2 && !ink[cy * w + cx + along * dx]) along += 1;
      let down = 0;
      while (down < bh / 2 && !ink[(cy + down * dy) * w + cx]) down += 1;
      let diag = 0;
      while (diag < Math.min(bw, bh) / 2 && !ink[(cy + diag * dy) * w + cx + diag * dx]) diag += 1;
      return { along, down, diag };
    };
    const corners = [corner(bx0, by0, 1, 1), corner(bx1 - 1, by0, -1, 1), corner(bx1 - 1, by1 - 1, -1, -1), corner(bx0, by1 - 1, 1, -1)];
    const radii = corners.map(({ along, down }) => (along < 2 || down < 2 ? 0 : Math.min(Math.min(bw, bh) / 2, (along + Math.sqrt(along) + down + Math.sqrt(down)) / 2)));
    const round = !solid && corners.every(({ diag }) => diag >= Math.min(bw, bh) * 0.1);

    // The clear ground on each side, out to the next thing drawn.
    // A side that stops at the picture's own edge is not open: the ring stays in the picture.
    const side = (at, step, end, across, lo, hi, atEdge) => {
      let n = 0;
      while (at + n * step !== end && across(at + n * step, lo, hi) < 2) n += 1;
      return at + n * step === end && !atEdge ? Infinity : n;
    };
    const clear = [
      side(by0 - 1, -1, -1, rowInk, bx0, bx1, Y0 === LY0),
      side(bx1, 1, w, colInk, by0, by1, X1 === LX1),
      side(by1, 1, h, rowInk, bx0, bx1, Y1 === LY1),
      side(bx0 - 1, -1, -1, colInk, by0, by1, X0 === LX0),
    ];
    return { box: [bx0 + X0, by0 + Y0, bx1 + X0, by1 + Y0], solid, radii, round, clear };
  };
  // A filled shape first, at the fine measure; anything else by its bold ink.
  const fine = measure(INK);
  return fine && fine.solid ? fine : measure(INK_BOLD);
}

/* The same room over and under a thing, and on its left and its right (all
   round for a round thing): the least of each pair, and no more at the ends
   of a line of words than about twice what it has over it. */
function even([t, r, b, l], round = false) {
  const y = Math.min(t, b);
  const x = Math.min(r, l);
  if (round) return [Math.min(x, y), Math.min(x, y), Math.min(x, y), Math.min(x, y)];
  const ends = Math.min(x, y * 2 + 2);
  return [y, ends, y, ends];
}

/* The ring for a part of a capture, as the room it keeps from the part's own
   box (`inset`, negative where the ring is outside it) and its corners. */
function spotShape(el, again) {
  const img = el.parentElement ? el.parentElement.querySelector("img") : null;
  if (!img) return null;
  if (!img.complete || !img.naturalWidth) {
    if (again) img.addEventListener("load", again, { once: true });
    return null;
  }
  const ir = img.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (!ir.width || !r.width) return null;
  const k = img.naturalWidth / ir.width;
  const x0 = Math.max(0, Math.round((r.left - ir.left) * k));
  const y0 = Math.max(0, Math.round((r.top - ir.top) * k));
  const x1 = Math.min(img.naturalWidth, Math.round((r.right - ir.left) * k));
  const y1 = Math.min(img.naturalHeight, Math.round((r.bottom - ir.top) * k));
  const m = Math.ceil((REACH * k) / 8) * 8;
  const win = el.parentElement.getBoundingClientRect();
  const shown = [
    Math.max(0, Math.round((win.left - ir.left) * k)),
    Math.max(0, Math.round((win.top - ir.top) * k)),
    Math.min(img.naturalWidth, Math.round((win.right - ir.left) * k)),
    Math.min(img.naturalHeight, Math.round((win.bottom - ir.top) * k)),
  ];
  const sig = `${img.currentSrc || img.src}|${x0},${y0},${x1},${y1}|${m}|${shown.join(",")}`;
  if (!spotRead.has(sig)) spotRead.set(sig, readSpot(img, x0, y0, x1, y1, m, shown));
  const read = spotRead.get(sig);
  if (!read) return null;

  const [bx0, by0, bx1, by1] = read.box;
  let pads = [0, 0, 0, 0];
  let radius;
  if (read.solid) {
    radius = read.radii.map((n) => `${(n / k).toFixed(1)}px`).join(" ");
  } else {
    const u = unit();
    const want = (read.round ? [PAD_ROUND, PAD_ROUND, PAD_ROUND, PAD_ROUND] : [PAD_Y, PAD_X, PAD_Y, PAD_X]).map((n) => n * u);
    pads = even(read.clear.map((gap, i) => (Number.isFinite(gap) ? Math.max(PAD_MIN * u, Math.min(want[i], gap / k - GAP_KEEP * u)) : want[i])), read.round);
    if (read.round) radius = "999px";
  }
  // Never past the window the picture is cropped to.
  const ring = {
    top: Math.max(win.top + 1, ir.top + by0 / k - pads[0]),
    right: Math.min(win.right - 1, ir.left + bx1 / k + pads[1]),
    bottom: Math.min(win.bottom - 1, ir.top + by1 / k + pads[2]),
    left: Math.max(win.left + 1, ir.left + bx0 / k - pads[3]),
  };
  return {
    kind: "words",
    inset: [ring.top - r.top, r.right - ring.right, r.bottom - ring.bottom, ring.left - r.left].map((n) => `${n.toFixed(1)}px`).join(" "),
    radius,
  };
}

/* A field of the wallet strip: a line of light on the header's lower edge,
   under the field's words, and a faint wash rising from it. On a phone the
   strip wraps, and the line sits right under the field. */
function under(el, header) {
  const r = el.getBoundingClientRect();
  const c = inked(el) ?? r;
  const u = unit();
  const drop = header.getBoundingClientRect().bottom - r.bottom;
  const low = window.innerWidth > 600 && drop > 0 && drop < 24 * u ? drop : 2 * u;
  const px = (n) => `${n.toFixed(1)}px`;
  return { kind: "under", vars: { "--cue-l": px(c.left - r.left - 4 * u), "--cue-r": px(r.right - c.right - 4 * u), "--cue-drop": px(low), "--cue-rise": px(3 * u) } };
}

/**
 * How a thing is marked. A thing with a box of its own (a tile, a field, a
 * bordered button, a part of a capture) is ringed on that box. A thing that
 * is words alone (a line in a card, a figure with its label, a text button)
 * is ringed around the words, the same room on every side: its own box is
 * whatever the layout gave it, often tight on one side and loose on another,
 * and a ring on that box looked badly cropped. A thing too thin for a ring
 * is a line, and a typed field is ringed with its own shadow. A part of a
 * capture is ringed around what the picture shows there (`spotShape`). A
 * field of the wallet strip gets no ring: the strip is one slim row, and a
 * box in it sat against the row's own rules (`under`).
 */
function shape(el, again) {
  const r = el.getBoundingClientRect();
  if (Math.min(r.width, r.height) < LINE_PX) return { kind: "line" };
  if (el.matches(NO_PSEUDO)) return { kind: "ring" };
  if (el.hasAttribute("data-spot")) return spotShape(el, again) ?? { kind: "box" };
  const header = el.closest("header");
  if (header) return under(el, header);
  const cs = window.getComputedStyle(el);
  // An edge all the way round: one rule between two figures does not make a box.
  const edged = ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs[`border${s}Width`]) > 0 && solid(cs[`border${s}Color`]));
  const boxed = solid(cs.backgroundColor) || cs.backgroundImage !== "none" || edged;
  if (boxed || !el.textContent.trim()) return { kind: "box" };
  const c = inked(el);
  if (!c) return { kind: "box" };
  const near = room(el, c);
  const u = unit();
  const pad = (want, gap) => Math.max(PAD_MIN * u, Math.min(want * u, Number.isFinite(gap) ? gap - GAP_KEEP * u : want * u));
  const [t, rgt, btm, lft] = even([pad(PAD_Y, near.top), pad(PAD_X, near.right), pad(PAD_Y, near.bottom), pad(PAD_X, near.left)]);
  return {
    kind: "words",
    inset: [c.top - r.top - t, r.right - c.right - rgt, r.bottom - c.bottom - btm, c.left - r.left - lft].map((n) => `${n.toFixed(1)}px`).join(" "),
  };
}

/**
 * The link between a label in the text (`Stat`) and the thing it names on
 * the page. While a label is on screen, a band of light keeps crossing it
 * and, in the same moment, the thing it names, which also keeps a faint rim
 * (the sweep and rim of React Bits' ShinyText and GlareHover, drawn in the
 * style sheet). The reader can see what the text in front of them is about,
 * and nothing else on the page is marked. Pointing at a label or at its
 * thing lights both in full (`data-pointed`, set by the frame); a thing no
 * label on screen names does nothing when pointed at.
 *
 * This marks what takes part. Every label on screen gets `data-cue`, its key
 * (`data-cue-key`, the name and the label's aim) and its turn
 * (`--cue-delay`); so does each thing that carries the name (`data-tile` or
 * `data-point`), with how it is marked (`data-cue="box" | "words" | "ring" |
 * "line" | "under"`).
 * A name is looked for in the page first, and in the wallet strip only when
 * nothing in the page carries it: a sentence about the vault's Deposit stat
 * is not about the strip's. The turn is counted from one clock, so a label
 * and its thing stay in step whenever either was drawn. The marks follow the
 * page: a part that folds away or a step that arrives changes them.
 *
 * Not everything is marked at once (`data-cue-turn`, `data-cue-wait`):
 *
 * - Things whose rings would sit against each other (a card's icons and the
 *   name under them, a panel and the figures in it) take turns, a round of
 *   the light each, each with its label.
 * - With more than `LIMIT` names on screen the light goes through the text
 *   a paragraph at a time: one paragraph's names and what they name, then
 *   the next's. While the pointer is on a paragraph, that paragraph's turn
 *   holds.
 *
 * Pointing at a label or a thing lights it at any time.
 */
export function useCues() {
  useEffect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") return undefined;
    const main = document.querySelector("main");
    const header = document.querySelector("header");
    if (!main) return undefined;
    const born = new WeakMap();
    const styled = new WeakMap();
    let marked = new Map();
    // The round: how many turns it has, the turns of each paragraph, and
    // the paragraph the reader's pointer is on.
    let round = 1;
    let turnsOf = new Map();
    let held = null;

    const mark = (el, { delay, key, kind, inset, radius, turn, vars = {} }) => {
      // Counted back from when this one's animation began, so every element
      // is at the same point of the round at the same time.
      let t0 = born.get(el);
      if (t0 == null || !el.hasAttribute("data-cue")) {
        t0 = (performance.now() / 1000) % CYCLE;
        born.set(el, t0);
      }
      const set = { "--cue-delay": `${(delay - t0).toFixed(3)}s`, ...vars };
      if (inset) set["--cue-inset"] = inset;
      if (radius) set["--cue-radius"] = radius;
      for (const name of styled.get(el) ?? []) if (!(name in set)) el.style.removeProperty(name);
      for (const [name, value] of Object.entries(set)) if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
      styled.set(el, Object.keys(set));
      if ((kind === "box" || kind === "words") && window.getComputedStyle(el).position === "static") el.setAttribute("data-cue-rel", "");
      if (el.getAttribute("data-cue-key") !== key) el.setAttribute("data-cue-key", key);
      if (el.getAttribute("data-cue") !== kind) el.setAttribute("data-cue", kind);
      if (turn) {
        if (el.getAttribute("data-cue-turn") !== turn) el.setAttribute("data-cue-turn", turn);
      } else if (el.hasAttribute("data-cue-turn")) {
        el.removeAttribute("data-cue-turn");
        el.removeAttribute("data-cue-wait");
      }
    };
    const clear = (el) => {
      for (const name of ["data-cue", "data-cue-key", "data-cue-rel", "data-cue-turn", "data-cue-wait"]) el.removeAttribute(name);
      for (const name of styled.get(el) ?? []) el.style.removeProperty(name);
      styled.delete(el);
    };

    let timer = 0;
    let apply = () => {};
    const soon = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => apply(), 140);
    };

    // Whose turn it is. A thing or a label carries the turns it is marked in
    // (`data-cue-turn`, "2,3/5": turns 2 and 3 of a round of 5); in the
    // others it waits (`data-cue-wait`), with no rim and no light. The round
    // is counted on the same clock as the light.
    let turnTimer = 0;
    const turns = () => {
      window.clearTimeout(turnTimer);
      const now = performance.now() / 1000 + TURN_LEAD;
      const n = Math.floor(now / CYCLE);
      const own = held ? turnsOf.get(held) : null;
      const live = String(own && own.length ? own[n % own.length] : n % round);
      let any = false;
      for (const el of marked.keys()) {
        const turn = el.getAttribute("data-cue-turn");
        if (!turn) continue;
        any = true;
        const wait = !turn.split("/")[0].split(",").includes(live);
        if (wait !== el.hasAttribute("data-cue-wait")) {
          if (wait) el.setAttribute("data-cue-wait", "");
          else el.removeAttribute("data-cue-wait");
        }
      }
      if (any) turnTimer = window.setTimeout(turns, ((n + 1) * CYCLE - now) * 1000 + 20);
    };

    // Where a thing's ring is on screen, and whether it is drawn in open
    // space (around words, or a part of a capture) or on the thing's own box.
    const ringOf = (el, m) => {
      const r = el.getBoundingClientRect();
      if (m.kind !== "words" || !m.inset) return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, drawn: false };
      const [t, rgt, b, l] = m.inset.split(" ").map(parseFloat);
      return { left: r.left + l, top: r.top + t, right: r.right - rgt, bottom: r.bottom - b, drawn: true };
    };
    const inside = (p, q) => p.left >= q.left && p.right <= q.right && p.top >= q.top && p.bottom <= q.bottom;

    apply = () => {
      const order = [];
      const next = new Map();
      const things = new Map();
      for (const label of main.querySelectorAll("[data-stat]")) {
        if (!shown(label)) continue;
        const name = label.getAttribute("data-stat");
        const scope = label.getAttribute("data-stat-scope") ?? "";
        const key = `${name}|${scope}`;
        let i = order.indexOf(key);
        if (i < 0) i = order.push(key) - 1;
        next.set(label, { i, key, kind: "label" });
        // A label aimed at one named part of a figure is lit by the figure.
        if (scope && scope !== "figure") continue;
        const sel = window.CSS && window.CSS.escape ? window.CSS.escape(name) : name;
        const find = (root) => (root ? [...root.querySelectorAll(`[data-tile="${sel}"], [data-point="${sel}"]`)].filter((el) => !el.matches(NO_MARK) && shown(el, false)) : []);
        let found = find(main);
        if (!found.length && !scope) found = find(header);
        for (const el of found) {
          if (next.has(el)) continue;
          next.set(el, { i, key, ...shape(el, soon) });
          if (!things.has(key)) things.set(key, []);
          things.get(key).push(el);
        }
      }

      // The paragraphs that take a turn each: every paragraph with a name in
      // it, when there are many names; otherwise all the names are one set.
      const many = things.size > LIMIT;
      const blocks = [];
      const blockOf = new Map();
      if (many) {
        const paragraphs = new Map();
        for (const [label, m] of next) {
          if (m.kind !== "label" || !things.has(m.key)) continue;
          const el = label.closest(BLOCK) ?? label.parentElement;
          if (!paragraphs.has(el)) paragraphs.set(el, { el, keys: [], labels: [] });
          const p = paragraphs.get(el);
          if (!p.keys.includes(m.key)) p.keys.push(m.key);
          p.labels.push([label, m]);
        }
        // A paragraph that names more than `LIMIT` things takes them a few
        // at a time, in the order it names them.
        for (const p of paragraphs.values()) {
          const parts = Math.ceil(p.keys.length / LIMIT);
          const size = Math.ceil(p.keys.length / parts);
          for (let i = 0; i < parts; i++) blocks.push({ el: p.el, keys: p.keys.slice(i * size, (i + 1) * size) });
          for (const [label, m] of p.labels) blockOf.set(label, blocks[blocks.length - parts + Math.floor(p.keys.indexOf(m.key) / size)]);
        }
      } else blocks.push({ el: null, keys: [...things.keys()] });

      // Names whose rings would sit against each other, or one inside the
      // other, are not marked in the same turn.
      const near = CROWD * unit();
      const rings = new Map();
      for (const [el, m] of next) {
        if (m.kind !== "box" && m.kind !== "words") continue;
        if (!rings.has(m.key)) rings.set(m.key, []);
        rings.get(m.key).push(ringOf(el, m));
      }
      const crowd = (a, b) =>
        (rings.get(a) ?? []).some((p) =>
          (rings.get(b) ?? []).some((q) => {
            if (inside(p, q) || inside(q, p)) return true;
            // Two things each ringed on its own box (tiles in a row) are as the app set them.
            if (!p.drawn && !q.drawn) return false;
            return Math.max(p.left, q.left) - Math.min(p.right, q.right) < near && Math.max(p.top, q.top) - Math.min(p.bottom, q.bottom) < near;
          }),
        );
      const on = new Map();
      const nextTurns = new Map();
      let n = 0;
      for (const b of blocks) {
        const place = new Map();
        let most = 0;
        for (const key of b.keys) {
          const taken = new Set(b.keys.filter((k) => k !== key && place.has(k) && crowd(key, k)).map((k) => place.get(k)));
          const crowded = b.keys.some((k) => k !== key && crowd(key, k));
          if (!crowded) continue;
          let c = 0;
          while (taken.has(c)) c += 1;
          place.set(key, c);
          most = Math.max(most, c);
        }
        b.place = place;
        b.turns = [];
        for (let c = 0; c <= most; c++) {
          for (const key of b.keys) {
            if (place.has(key) && place.get(key) !== c) continue;
            if (!on.has(key)) on.set(key, []);
            on.get(key).push(n);
          }
          b.turns.push(n);
          n += 1;
        }
        if (b.el) nextTurns.set(b.el, [...(nextTurns.get(b.el) ?? []), ...b.turns]);
      }
      round = Math.max(1, n);
      turnsOf = nextTurns;
      if (held && !turnsOf.has(held)) held = null;
      const turnOf = (m) => {
        if (round < 2 || !on.has(m.key)) return undefined;
        let list = on.get(m.key);
        // A label is marked in its own paragraph's turns.
        if (m.kind === "label" && blockOf.has(m.el)) {
          const b = blockOf.get(m.el);
          list = b.turns.filter((t, c) => !b.place.has(m.key) || b.place.get(m.key) === c);
        }
        return list.length >= round ? undefined : `${list.join(",")}/${round}`;
      };

      const step = Math.min(STEP_MAX, SPREAD / Math.max(1, order.length));
      for (const el of marked.keys()) if (!next.has(el)) clear(el);
      // Things that take turns share one round, so a turn changes for all of them at once.
      for (const [el, m] of next) {
        const turn = turnOf({ ...m, el });
        mark(el, { ...m, turn, delay: turn ? 0 : Number((m.i * step).toFixed(3)) });
      }
      marked = next;
      turns();
    };

    // The paragraph under the pointer keeps its turn.
    const hold = (e) => {
      const b = e.target && e.target.closest ? e.target.closest(BLOCK) : null;
      const now = b && turnsOf.has(b) ? b : null;
      if (now === held) return;
      held = now;
      turns();
    };
    const release = () => {
      if (!held) return;
      held = null;
      turns();
    };

    const mo = new MutationObserver(soon);
    const watch = { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert", "aria-hidden", "class"] };
    mo.observe(main, watch);
    if (header) mo.observe(header, watch);
    window.addEventListener("resize", soon);
    main.addEventListener("pointerover", hold);
    main.addEventListener("pointerleave", release);
    apply();
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(turnTimer);
      mo.disconnect();
      window.removeEventListener("resize", soon);
      main.removeEventListener("pointerover", hold);
      main.removeEventListener("pointerleave", release);
      for (const el of marked.keys()) clear(el);
    };
  }, []);
}

/** The label a marked thing belongs to, as a pointer (`{ name, scope }`), or null for a thing no label on screen names. */
export function cueOf(el) {
  const thing = el && el.closest ? el.closest("[data-cue-key]:not([data-stat])") : null;
  if (!thing) return null;
  const [name, scope] = thing.getAttribute("data-cue-key").split("|");
  return { name, scope: scope || null };
}

/**
 * The one label to light when a thing is pointed at (its `data-stat-id`): of
 * the labels that name it, the one whose turn it is, or the first in the
 * window, or the first on the page. A name written three times in a page
 * lit three labels for one pointer, and drew the eye to all three.
 */
export function labelFor({ name, scope }) {
  if (typeof document === "undefined") return null;
  const key = `${name}|${scope ?? ""}`;
  const labels = [...document.querySelectorAll("main [data-stat][data-cue-key]")].filter((l) => l.getAttribute("data-cue-key") === key && l.getClientRects().length);
  if (!labels.length) return null;
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const top = header ? header.getBoundingClientRect().bottom : 0;
  const bottom = footer ? footer.getBoundingClientRect().top : window.innerHeight;
  const seen = labels.filter((l) => {
    const r = l.getBoundingClientRect();
    return r.top >= top && r.bottom <= bottom;
  });
  const pick = seen.find((l) => !l.hasAttribute("data-cue-wait")) ?? seen[0] ?? labels[0];
  return pick.getAttribute("data-stat-id");
}
