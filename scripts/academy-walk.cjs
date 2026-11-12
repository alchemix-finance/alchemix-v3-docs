#!/usr/bin/env node
/*
 * A headless learner walk of the Academy's intermediate and advanced tracks.
 *
 *   node scripts/academy-walk.cjs <width> <height> [lessonNumber ...]
 *
 * Lesson numbers run 1 to 10 in map order: the six intermediate lessons, then
 * the four advanced ones. Run from the repo root, with the dev server already
 * running (ACADEMY_BASE, default http://localhost:3061). Drives the installed
 * Chrome headless with a throwaway profile. Everything it writes goes to
 * ACADEMY_WALK_OUT, by default a folder named academy-walk in the system's
 * temporary directory, never into the repo. For each lesson it
 * seeds localStorage (every earlier lesson complete, this one not), then goes
 * page by page: screenshot as the page opens, do each moment the way the
 * lesson's `Do` text asks, screenshot after each, press Next, and finish on the
 * Check with both questions answered right.
 *
 * Writes, in that folder:
 *   shots/<width>/L<lesson>-p<page>-<nn>-<momentOrState>.png   full-page captures
 *   figs/<width>/<same name>.fig<k>.png                        each practice element cut out of that capture
 *   text/<width>/L<lesson>.txt        the visible text of every page state
 *   text/<width>/L<lesson>.read.txt   the same, with later states of a page as line diffs
 *   report-<width>.json               failures, console errors, per-state measurements
 *
 * Exit code 0 only when every lesson walked reached a passed Check.
 *
 * Environment overrides: ACADEMY_REPO, ACADEMY_BASE, CHROME.
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const REPO = process.env.ACADEMY_REPO || path.resolve(__dirname, "..");
const BASE = process.env.ACADEMY_BASE || "http://localhost:3061";
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = process.env.ACADEMY_WALK_OUT || path.join(require("os").tmpdir(), "academy-walk");
fs.mkdirSync(OUT, { recursive: true });

const COMPLETIONS_KEY = "alchemix-academy-completions-v1";
const POSITION_KEY = (id) => `alchemix-academy-position-v2:${id}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── What the repo says: lessons, moment order, question banks ─────────── */

/** An ES module with no imports, evaluated for the names asked for. */
function loadModule(file, names) {
  const src = fs.readFileSync(path.join(REPO, file), "utf8").replace(/^export\s+/gm, "");
  // eslint-disable-next-line no-new-func
  return new Function(`${src}\nreturn { ${names.join(", ")} };`)();
}

const TRACKJS = loadModule("src/components/Academy/lib/track.js", ["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const BEGINNER = TRACKJS.BEGINNER;
// The lessons walked, in map order: the intermediate track, then the advanced
// one. `n` here is the walk's own number, 1 to 10 (each track numbers its own
// lessons from 1), and names the capture files and the command-line picks.
const INTERMEDIATE = [...TRACKJS.INTERMEDIATE, ...TRACKJS.ADVANCED].map((l, i) => ({ ...l, n: i + 1 }));
const { QUESTIONS } = loadModule("src/components/Academy/lib/questions.js", ["QUESTIONS"]);

/** The lesson's moment ids in page order, read from its page file's MOMENTS list. */
function momentsOf(lesson) {
  const file = path.join(REPO, "src/pages/academy", `${lesson.slug.split("/").pop()}.jsx`);
  const m = /const MOMENTS = \[([^\]]*)\]/.exec(fs.readFileSync(file, "utf8"));
  if (!m) throw new Error(`No MOMENTS list in ${file}`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/* ── The steps: one entry per moment id, per lesson ────────────────────── */
/*
 * Each step does what the lesson's `Do` text tells the learner to do, with the
 * helpers below (`h`). A step only acts; the walk then waits for the moment to
 * be marked done. Keyed by moment id, so the table survives edits to the text.
 */
const STEPS = {
  "three-contracts": {
    // "Type 10,000 in the USDC field on the Deposit/Borrow tab and press Deposit."
    deposit: async (h) => {
      await h.type("USDC amount", "10,000");
      await h.click("Deposit");
    },
    // "Type 10,000 in the USDC field on the practice Mixed Yield card and press Deposit."
    "mixed-deposit": async (h) => {
      await h.type("USDC amount", "10,000");
      await h.click("Deposit");
    },
    // "On the Dashboard, press Manage on your USDC position. Pick mixUSDC in the token picker on the Deposit/Borrow tab, type 8,000 and press Deposit."
    "add-myt": async (h) => {
      await h.click("Manage");
      await h.pickToken("mixUSDC");
      await h.type("mixUSDC amount", "8,000");
      await h.click("Deposit");
    },
    // "Press ⋮ on your USDC position, choose Send, tick the confirmation checkbox and press Send position."
    send: async (h) => {
      await h.click("⋮", { label: "Position actions" });
      await h.click("Send");
      await h.shot("dialog");
      await h.tick("I verified this address");
      await h.click("Send position");
    },
    // "Send it back: press ⋮ on the position card in Wallet 2, choose Send, tick the confirmation checkbox and press Send position."
    "send-back": async (h) => {
      await h.click("⋮", { label: "Position actions" });
      await h.click("Send");
      await h.tick("I verified this address");
      await h.click("Send position");
    },
    // "Press Next step to follow one of each, contract by contract."
    loop: async (h) => {
      for (let i = 1; i <= 4; i++) {
        await h.click("Next step", { timeout: 15000 });
        await h.settle();
        if (i < 4) await h.shot(`step${i}`);
      }
    },
  },

  "where-yield-comes-from": {
    // "Press Before fee."
    "before-fee": async (h) => {
      await h.click("Before fee");
    },
    // "Set Withdrawal delay to Can take weeks."
    delay: async (h) => {
      await h.click("Can take weeks", { group: "Withdrawal delay" });
    },
    // "Now set Other factors to New strategy."
    new: async (h) => {
      await h.click("New strategy", { group: "Other factors" });
    },
    // "Press Drop B's market price 20%."
    "price-drop": async (h) => {
      await h.click("Drop B's market price 20%");
    },
    // "Press C loses half its funds."
    "loss-half": async (h) => {
      await h.click("C loses half its funds");
    },
    // "Drag C's loss to 100%."
    "loss-all": async (h) => {
      await h.range("C's loss", 100);
    },
    // "Press Move 5% into C."
    allocate: async (h) => {
      await h.click("Move 5% into C");
    },
    // "Press Depositors withdraw 20% of the vault."
    withdraw: async (h) => {
      await h.click("Depositors withdraw 20% of the vault");
    },
  },

  "getting-money-back": {
    // "Drag it until Health Factor reads 1.00."  (Health Factor is 90% / LTV, so 1.00 is LTV 90.)
    "hf-slider": async (h) => {
      await h.rangeUntil("LTV", async () => (await h.readStat("Health Factor")) === "1.00");
    },
    // "Type 2,000 in the alUSD field on the Borrow tab."
    preview: async (h) => {
      await h.type("alUSD amount", "2,000");
    },
    // "Press Borrow."
    borrow: async (h) => {
      await h.click("Borrow");
    },
    // "Turn on the USD switch."
    currency: async (h) => {
      await h.click("USD", { role: "switch" });
    },
    // "On the Repay tab, pick alUSD in the token picker, type 100 and press Repay."
    "repay-alusd": async (h) => {
      await h.pickToken("alUSD");
      await h.type("alUSD amount", "100");
      await h.click("Repay");
    },
    // "Switch the token picker to USDC, type 100 and press Repay."
    "repay-usdc": async (h) => {
      await h.pickToken("USDC");
      await h.type("USDC amount", "100");
      await h.click("Repay");
    },
  },

  "earmarking-and-cover": {
    // "Drag through the term to follow the deposit as it vests."
    vest: async (h) => {
      await h.range(0, "max");
    },
    // "Drag through the first month."
    "month-1": async (h) => {
      await h.range(0, "max");
    },
    // "Press B repays 6,000."
    "b-repays": async (h) => {
      await h.click("B repays 6,000");
    },
    // "Now drag through the second month."
    "month-2": async (h) => {
      await h.range(0, "max");
    },
    // "Press Claim on their Fixed Yield position."
    claim: async (h) => {
      await h.click("Claim");
    },
  },

  "pace-of-repayment": {
    // "Move Queue to 40,000."
    queue: async (h) => {
      await h.range("Queue", 40000);
    },
    // "Now pick a 2-month term."
    term: async (h) => {
      await h.click("2 months");
    },
    // "Now move Total Debt to 240,000."
    debt: async (h) => {
      await h.range("Total Debt", 240000);
    },
    // "Pick 100%."
    "rate-100": async (h) => {
      await h.click("100%");
    },
    // "Press A borrower repays 6,000."
    cover: async (h) => {
      await h.click("A borrower repays 6,000");
    },
    // "Type 100 in the Redemption (%) field."
    "rate-typed": async (h) => {
      await h.type("Redemption (%)", "100");
    },
  },

  "cost-of-borrowing": {
    // "Pick USDC in the token picker on the Borrow tab."
    "pick-usdc": async (h) => {
      await h.pickToken("USDC");
    },
    // "Type 4,897.55 and press Borrow & Swap."
    "borrow-swap": async (h) => {
      await h.type("USDC amount", "4,897.55");
      await h.click("Borrow & Swap");
    },
    // "Press each way of settling debt."
    "fee-ways": async (h) => {
      await h.clickEach({ within: "practice", except: [] });
    },
    // "Drag the alUSD price down to 0.96, then up to 1.00."
    buyback: async (h) => {
      await h.range(0, 0.96);
      await h.settle();
      await h.shot("at-0.96");
      await h.range(0, 1.0);
    },
    // "On the Repay tab, press MAX in the Flash Repay field, then press Flash Repay."
    "flash-open": async (h) => {
      await h.click("MAX");
      await h.click("Flash Repay");
    },
    // "Press View transaction details to read the seven steps, then press Confirm Flash Repay."
    "flash-confirm": async (h) => {
      await h.click("View transaction details");
      await h.settle();
      await h.shot("details");
      await h.click("Confirm Flash Repay");
    },
  },

  "transmuter-and-peg": {
    // "Step through what moves alUSD's price."
    cycle: async (h) => {
      await h.stepThrough();
    },
    // "Move the ETH alUSD Price ... on the practice card between 0.96 and 1.00."
    price: async (h) => {
      await h.range(0, 0.96);
      await h.settle();
      await h.shot("at-0.96");
      await h.range(0, 1.0);
    },
    // "Set the price back to 0.98 and press Deposit."
    deposit: async (h) => {
      await h.range(0, 0.98);
      await h.click("Deposit");
    },
    // "Open the Available space tooltip on the practice card, then press Mark matured deposits ..."
    cap: async (h) => {
      await h.click("Available space", { contains: true, any: true });
      await h.settle();
      await h.shot("tooltip");
      await h.click("Mark matured deposits");
    },
    // "Press Claim on your Fixed Yield position, then press Claim in the window, with Receive USDC upon claim on or off."
    claim: async (h) => {
      await h.click("Claim");
      await h.settle();
      await h.shot("window");
      await h.click("Claim", { last: true });
    },
  },

  "ltv-and-risk": {
    // "Drag the Loss slider until LTV reaches the LIQ LTV marker at 95%. Then pick another starting LTV and do it again."
    loss: async (h) => {
      const at95 = async () => /^95(\.0+)?%/.test((await h.readStat("LTV")) || "");
      await h.rangeUntil("Loss", at95);
      await h.settle();
      await h.shot("first-95");
      await h.click("70%", { group: "Starting LTV" });
      await h.rangeUntil("Loss", at95);
    },
    // "Step through the liquidation."
    liq: async (h) => {
      await h.stepThrough();
    },
    // "Press each case to step through what it does to the position."
    full: async (h) => {
      await h.click("Debt reaches the deposit");
      await h.settle();
      await h.shot("case-debt");
      // The second case's button is switched off until the first has finished playing.
      await h.click("Vault below its minimum", { timeout: 15000 });
    },
    // "On the Liquidate tab, press Self Liquidate."
    "self-open": async (h) => {
      await h.click("Self Liquidate");
    },
    // "Press Confirm Self Liquidate."
    "self-confirm": async (h) => {
      await h.click("Confirm Self Liquidate");
    },
    // "Press Claim, then choose Claim now or Wait."
    "bad-debt": async (h) => {
      await h.click("Claim");
      await h.settle();
      await h.shot("choice");
      await h.click("Claim now");
    },
  },

  capstone: {
    // "Press each planned loss and read the LTV it allows."
    plan: async (h) => {
      await h.clickEach({ within: "practice" });
    },
    // "Pick the LTV you would choose, and change the cash if you like."
    size: async (h) => {
      await h.click("36.8%", { contains: true });
    },
  },

  "yield-looping": {
    // "Type 10,000 in Deposit Amount, set Target LTV to 50%, then move Loop Multiplier to its maximum."
    "loop-set": async (h) => {
      await h.type("Deposit Amount", "10,000");
      await h.range("Target LTV", 50);
      await h.range("Loop Multiplier", "max");
    },
    // "Press View Transaction Details to read the steps, then press Boost Yield."
    "loop-go": async (h) => {
      await h.click("View Transaction Details");
      await h.settle();
      await h.shot("details");
      await h.click("Boost Yield");
    },
    // "Press Apply a 10% loss."
    "loop-loss": async (h) => {
      await h.click("Apply a 10% loss");
    },
  },
};

/* ── In the page ───────────────────────────────────────────────────────── */

/**
 * Installed before any page script: seeds localStorage once per tab, and
 * starts a frame sampler that logs a practice element whose top or height
 * changes by more than 12px between two frames (a jump or a snap) while the
 * walk has it switched on.
 */
function bootstrap(seed) {
  try {
    if (!/^https?:/.test(location.protocol)) return;
    if (!sessionStorage.getItem("__walk_seeded")) {
      localStorage.clear();
      localStorage.setItem(seed.completionsKey, JSON.stringify(seed.completions));
      localStorage.removeItem(seed.positionKey);
      sessionStorage.setItem("__walk_seeded", "1");
    }
  } catch (e) {
    /* about:blank and friends */
  }
  const W = (window.__walk = { on: false, jumps: [], under: [], resizes: 0, t0: 0 });
  window.addEventListener("resize", () => {
    W.resizes += 1;
  });
  const seen = new WeakMap();
  // Each element's change in the last frame, and a large change still waiting for the frame after it.
  const lastDelta = new WeakMap();
  const waiting = new WeakMap();
  let footWas = null;
  let lastFrame = 0;
  const frame = (ts) => {
    const dt = lastFrame ? ts - lastFrame : 16;
    lastFrame = ts;
    try {
      const main = document.querySelector("main");
      if (main) {
        const els = main.querySelectorAll('[class*="stage_"]');
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) {
            seen.delete(el);
            continue;
          }
          const now = { top: r.top + window.scrollY, h: r.height };
          const was = seen.get(el);
          if (W.on && was) {
            const dTop = now.top - was.top;
            const dH = now.h - was.h;
            const held = waiting.get(el);
            if (held) {
              held.nextTop = Math.round(dTop);
              held.nextHeight = Math.round(dH);
              waiting.delete(el);
            }
            // A late frame (the tab was busy) can hide a smooth move, so only frames on time count,
            // and a frame that ran long is measured as the change per 60th of a second.
            const perFrame = Math.min(1, 16.7 / Math.max(dt, 1));
            if (dt < 40 && (Math.abs(dTop) * perFrame > 12 || Math.abs(dH) * perFrame > 12)) {
              const sec = el.querySelector("section[aria-label]");
              const before = lastDelta.get(el) || { dTop: 0, dH: 0 };
              const j = {
                ms: Math.round(performance.now() - W.t0),
                what: sec ? sec.getAttribute("aria-label") : (el.innerText || "").slice(0, 40),
                dTop: Math.round(dTop),
                dHeight: Math.round(dH),
                prevTop: Math.round(before.dTop),
                prevHeight: Math.round(before.dH),
                nextTop: 0,
                nextHeight: 0,
                zoom: el.style.zoom || "1",
              };
              W.jumps.push(j);
              waiting.set(el, j);
            }
            lastDelta.set(el, { dTop, dH });
          }
          seen.set(el, now);
        }
        // What sits under the last figure while its text is still to come: the "Start over" row.
        const foot = main.querySelector('[class*="foot_"]');
        const ft = foot && foot.getBoundingClientRect().height ? foot.getBoundingClientRect().top + window.scrollY : null;
        if (W.on && ft != null && footWas != null && dt < 40 && Math.abs(ft - footWas) > 12) {
          W.under.push({ ms: Math.round(performance.now() - W.t0), d: Math.round(ft - footWas) });
        }
        footWas = ft;
      }
    } catch (e) {
      /* keep sampling */
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Runs in the page: find controls by what a learner would read on them. */
function findInPage(spec) {
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const low = (s) => norm(s).toLowerCase();
  const root = document.querySelector("main") || document.body;
  const shown = (el) => {
    if (!el.isConnected) return false;
    if (el.closest("[hidden], [inert], [aria-hidden='true']")) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  };
  const labelOf = (el) => {
    const out = [];
    const aria = el.getAttribute("aria-label");
    if (aria) out.push(aria);
    const by = el.getAttribute("aria-labelledby");
    if (by) out.push(by.split(/\s+/).map((id) => document.getElementById(id)?.innerText ?? "").join(" "));
    if (el.placeholder) out.push(el.placeholder);
    if (el.id) {
      const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (l) out.push(l.innerText);
    }
    const wrap = el.closest("label");
    if (wrap) out.push(wrap.innerText);
    if (el.tagName !== "INPUT" && el.tagName !== "SELECT" && el.tagName !== "TEXTAREA") out.push(el.innerText);
    if (el.title) out.push(el.title);
    return out.map(norm).filter(Boolean);
  };
  const describe = (el) => ({
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute("role"),
    type: el.getAttribute("type"),
    text: norm(el.innerText).slice(0, 80),
    label: el.getAttribute("aria-label"),
    disabled: Boolean(el.disabled) || el.getAttribute("aria-disabled") === "true",
    readOnly: Boolean(el.readOnly),
    pressed: el.getAttribute("aria-pressed"),
    checked: el.getAttribute("aria-checked") ?? (el.type === "checkbox" ? String(el.checked) : null),
    value: "value" in el ? String(el.value).slice(0, 40) : null,
    min: el.min || null,
    max: el.max || null,
    step: el.step || null,
    title: el.title || null,
    group: norm(el.closest("[role='group'], [role='radiogroup'], [role='tablist']")?.getAttribute("aria-label") ?? "") || null,
  });

  const CLICKABLE = "button, a[href], [role='button'], [role='tab'], [role='radio'], [role='menuitem'], [role='option'], [role='switch'], [role='checkbox'], summary, input[type='checkbox'], input[type='radio'], [tabindex]";
  const kind = spec.kind;

  if (kind === "probe") {
    const all = [...root.querySelectorAll(`${CLICKABLE}, input, select, textarea`)].filter(shown).filter((el) => !el.matches("span[data-stat], [class*='termWrap'] *"));
    return all.map(describe);
  }

  let pool = [];
  if (kind === "click") {
    pool = [...root.querySelectorAll(CLICKABLE)].filter(shown);
    if (spec.role) pool = pool.filter((el) => el.getAttribute("role") === spec.role);
    else if (!spec.any) pool = pool.filter((el) => !["tab"].includes(el.getAttribute("role")));
    // A stat's name and a glossary term in the text are focusable too ("Borrow & Swap" is a term and a button); a step never means those.
    pool = pool.filter((el) => !el.matches("span[data-stat]") && !el.closest("[class*='termWrap']"));
    if (spec.group) pool = pool.filter((el) => low(el.closest("[role='group'], [role='radiogroup']")?.getAttribute("aria-label") ?? "") === low(spec.group));
    const want = low(spec.label ?? spec.text);
    const exact = pool.filter((el) => labelOf(el).some((t) => low(t) === want) || (spec.label == null && low(el.innerText) === want));
    const loose = spec.contains ? pool.filter((el) => labelOf(el).some((t) => low(t).includes(want))) : [];
    pool = exact.length ? exact : loose;
    // Innermost match only: a label that wraps a button should not also count.
    pool = pool.filter((el) => !pool.some((o) => o !== el && el.contains(o)));
    // A control on a practice element (or the window it opens) comes before one with the same name
    // elsewhere on the page, as long as one of them is switched on.
    const off = (el) => el.disabled || el.getAttribute("aria-disabled") === "true";
    const staged = pool.filter((el) => el.closest('[class*="stage_"], [class*="window_"], [role="dialog"], figure'));
    if (staged.some((el) => !off(el))) pool = staged;
  } else if (kind === "field") {
    pool = [...root.querySelectorAll("input:not([type='range']):not([type='checkbox']):not([type='radio']), textarea")].filter(shown);
    const want = low(spec.label);
    const exact = pool.filter((el) => labelOf(el).some((t) => low(t) === want));
    const loose = pool.filter((el) => labelOf(el).some((t) => low(t).includes(want)));
    pool = exact.length ? exact : loose;
  } else if (kind === "range") {
    pool = [...root.querySelectorAll("input[type='range']")].filter(shown);
    if (typeof spec.label === "string") {
      const want = low(spec.label);
      const exact = pool.filter((el) => labelOf(el).some((t) => low(t) === want));
      const loose = pool.filter((el) => labelOf(el).some((t) => low(t).includes(want)));
      pool = exact.length ? exact : loose;
    } else {
      // By position among the ranges that are switched on, falling back to all of them.
      const live = pool.filter((el) => !el.disabled);
      pool = [(live.length ? live : pool)[spec.label ?? 0]].filter(Boolean);
    }
  } else if (kind === "checkbox") {
    pool = [...root.querySelectorAll("input[type='checkbox'], [role='checkbox']")].filter(shown);
    const want = low(spec.label);
    pool = pool.filter((el) => labelOf(el).some((t) => low(t).includes(want)));
  }

  const live = pool.filter((el) => !(el.disabled || el.getAttribute("aria-disabled") === "true" || (kind === "field" && el.readOnly)));
  const pick = (list) => (spec.last ? list[list.length - 1] : list[spec.nth ?? 0]);
  const el = pick(live) ?? null;
  window.__walkFound = el;
  return {
    found: pool.length,
    live: live.length,
    chosen: el ? describe(el) : null,
    blocked: !el && pool.length ? pool.map(describe).slice(0, 4) : null,
  };
}

/** Runs in the page: what a state measures. */
function measureInPage() {
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const de = document.documentElement;
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const main = document.querySelector("main");
  const hh = header ? header.getBoundingClientRect().height : 0;
  const fh = footer ? footer.getBoundingClientRect().height : 0;
  const room = window.innerHeight - hh - fh;
  const shown = (el) => {
    if (el.closest("[hidden]")) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const name = (el) => {
    const sec = el.matches("section[aria-label]") ? el : el.querySelector("section[aria-label]");
    if (sec) return sec.getAttribute("aria-label");
    const img = el.querySelector("img[alt]:not([alt=''])");
    if (img) return `image: ${img.getAttribute("alt").slice(0, 60)}`;
    return norm(el.innerText).slice(0, 60);
  };
  const tag = (el) => `${el.tagName.toLowerCase()}${typeof el.className === "string" && el.className ? "." + el.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".") : ""}`;
  // A practice element is a stage, or a figure, practice frame or window that stands outside one
  // (lesson 9's Yield Looping copy, the claim window that opens under a Fixed Yield row).
  const all = main ? [...main.querySelectorAll('[class*="stage_"], figure, section[aria-label^="Practice"], [role="dialog"], [class*="window_"]')].filter(shown) : [];
  const stages = all.filter((el) => !all.some((o) => o !== el && o.contains(el)));
  // The size of the lesson's own paragraphs on the page on screen.
  const inFigure = '[class*="stage_"], figure, section[aria-label^="Practice"], [role="dialog"], [class*="window_"]';
  const prose = main ? [...main.querySelectorAll('[class*="prose_"] p')].find((p) => shown(p) && !p.closest(inFigure)) : null;
  const lead = prose ? getComputedStyle(prose).fontSize : null;
  const practice = stages.map((el) => {
    const r = el.getBoundingClientRect();
    // Content clipped or scrolling inside the element, and parts that poke out of the window.
    const clipped = [];
    const offscreen = [];
    for (const c of el.querySelectorAll("*")) {
      if (clipped.length >= 6 && offscreen.length >= 5) break;
      const cr = c.getBoundingClientRect();
      if (!cr.width || !cr.height) continue;
      if (c.scrollWidth > c.clientWidth + 2 && c.clientWidth > 0) {
        const ox = getComputedStyle(c).overflowX;
        if (ox !== "visible" && clipped.length < 6) clipped.push({ el: tag(c), overflowX: ox, scrollWidth: c.scrollWidth, clientWidth: c.clientWidth, text: norm(c.innerText).slice(0, 50) });
      }
      // A box that shows only part of its content top to bottom (a list the learner has to scroll inside the figure).
      if (c.scrollHeight > c.clientHeight + 4 && c.clientHeight > 0 && c.tagName !== "INPUT") {
        const oy = getComputedStyle(c).overflowY;
        if (oy !== "visible" && clipped.length < 6) clipped.push({ el: tag(c), overflowY: oy, scrollHeight: c.scrollHeight, clientHeight: c.clientHeight, text: norm(c.innerText).slice(0, 50) });
      }
      if ((cr.right > de.clientWidth + 1.5 || cr.left < -1.5) && offscreen.length < 5) {
        let p = c.parentElement;
        let inScroller = false;
        while (p && p !== document.body) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") {
            inScroller = true;
            break;
          }
          p = p.parentElement;
        }
        if (!inScroller) offscreen.push({ el: tag(c), left: Math.round(cr.left), right: Math.round(cr.right), text: norm(c.innerText).slice(0, 50) });
      }
    }
    // Paragraphs and list items inside the element that are set in the lesson's body type (`.prose p`, `.prose li`).
    const bodyType = [];
    for (const c of el.querySelectorAll("p, li")) {
      if (!lead || !c.getBoundingClientRect().height) continue;
      if (getComputedStyle(c).fontSize === lead) bodyType.push({ el: tag(c), text: norm(c.innerText).slice(0, 50) });
    }
    return {
      name: name(el),
      bodyType,
      height: Math.round(r.height),
      width: Math.round(r.width),
      left: Math.round(r.left),
      docTop: Math.round(r.top + window.scrollY),
      zoom: el.style.zoom || "1",
      tallerThanRoom: r.height > room + 1,
      overBy: Math.max(0, Math.round(r.height - room)),
      clipped,
      offscreen,
    };
  });
  const bar = footer ? footer.querySelector("button[class*='primary'], a[class*='primaryLink'], a[class*='barLink']") : null;
  const reason = footer ? footer.querySelector("[class*='barReason']") : null;
  const place = footer ? footer.querySelector("[class*='barPlace']") : null;
  return {
    window: { width: window.innerWidth, height: window.innerHeight },
    headerHeight: Math.round(hh),
    footerHeight: Math.round(fh),
    room: Math.round(room),
    pageHeight: de.scrollHeight,
    scrollsHorizontally: de.scrollWidth > de.clientWidth + 1,
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    practice,
    leadType: lead,
    footer: {
      place: place ? norm(place.innerText) : null,
      hint: reason ? norm(reason.innerText) : null,
      action: bar ? norm(bar.innerText) : null,
      actionDisabled: bar ? Boolean(bar.disabled) : null,
      back: footer ? [...footer.querySelectorAll("button")].some((b) => norm(b.innerText).toLowerCase() === "back") : false,
    },
    strip: header ? norm(header.querySelector("dl")?.parentElement?.innerText ?? "") : "",
    preview: Boolean(main && main.querySelector("[inert]")),
    text: main ? main.innerText : "",
  };
}

/* ── The walk ──────────────────────────────────────────────────────────── */

class StepError extends Error {}

async function walkLesson(browser, lesson, width, height, report, stitch) {
  const n = lesson.n;
  const moments = momentsOf(lesson);
  const steps = STEPS[lesson.id] || {};
  const rec = { lesson: n, id: lesson.id, slug: lesson.slug, moments, passed: false, failures: [], workarounds: [], states: [] };
  report.lessons.push(rec);
  const shotDir = path.join(OUT, "shots", String(width));
  const figDir = path.join(OUT, "figs", String(width));
  fs.mkdirSync(figDir, { recursive: true });
  for (const f of fs.readdirSync(figDir)) if (f.startsWith(`L${n}-`)) fs.unlinkSync(path.join(figDir, f));
  const dsf = width < 640 ? 2 : 1;
  const textDir = path.join(OUT, "text", String(width));
  fs.mkdirSync(shotDir, { recursive: true });
  fs.mkdirSync(textDir, { recursive: true });
  for (const f of fs.readdirSync(shotDir)) if (f.startsWith(`L${n}-`)) fs.unlinkSync(path.join(shotDir, f));
  const textParts = [];
  const readParts = [];
  let lastText = { page: null, lines: [] };

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dsf, isMobile: width < 640, hasTouch: width < 640 });

  // Every beginner lesson and intermediate 1..N-1 complete, with the dev grader's unsigned tokens. Lesson N is not.
  const completions = {};
  for (const l of [...BEGINNER, ...INTERMEDIATE.filter((x) => x.n < n)]) completions[l.id] = `local:${l.id}`;
  await page.evaluateOnNewDocument(bootstrap, { completionsKey: COMPLETIONS_KEY, completions, positionKey: POSITION_KEY(lesson.id) });

  let where = "load";
  const fail = (kind, detail, extra = {}) => {
    rec.failures.push({ kind, where, detail, ...extra });
    console.log(`  FAIL [L${n} ${where}] ${kind}: ${detail}`);
  };
  page.on("console", (m) => {
    const type = m.type();
    if (type === "error" || type === "warn" || type === "warning") {
      const text = m.text();
      const loc = m.location() || {};
      report.console.push({ lesson: n, where, type, text: text.slice(0, 600), url: loc.url || null });
    }
  });
  page.on("pageerror", (e) => report.console.push({ lesson: n, where, type: "pageerror", text: String(e && e.stack ? e.stack : e).slice(0, 800) }));
  page.on("requestfailed", (r) => report.console.push({ lesson: n, where, type: "requestfailed", text: `${r.method()} ${r.url()} ${r.failure()?.errorText ?? ""}` }));
  page.on("response", (r) => {
    if (r.status() >= 400) report.console.push({ lesson: n, where, type: `http ${r.status()}`, text: `${r.request().method()} ${r.url()}` });
  });

  /* helpers */

  const measure = () => page.evaluate(measureInPage);
  const footer = async () => (await measure()).footer;
  const doneMoments = () =>
    page.evaluate((key) => {
      try {
        return Object.keys(JSON.parse(localStorage.getItem(key) || "{}").done || {});
      } catch {
        return [];
      }
    }, POSITION_KEY(lesson.id));
  const probe = () => page.evaluate(findInPage, { kind: "probe" });

  /** Wait until nothing on the page has changed for a while and no finite animation is running. */
  const settle = async ({ min = 350, quiet = 450, max = 9000 } = {}) => {
    await sleep(min);
    const t0 = Date.now();
    let last = null;
    let since = Date.now();
    while (Date.now() - t0 < max) {
      const sig = await page.evaluate(() => {
        const hash = (s) => {
          let h = 0;
          for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
          return h;
        };
        const running = document.getAnimations().filter((a) => {
          if (a.playState !== "running") return false;
          const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
          return !t || Number.isFinite(t.endTime);
        }).length;
        const main = document.querySelector("main");
        const header = document.querySelector("header");
        const foot = document.querySelector("footer");
        return `${running}|${hash((main ? main.innerHTML : "") + (header ? header.innerHTML : "") + (foot ? foot.innerHTML : ""))}|${document.documentElement.scrollHeight}`;
      });
      if (sig !== last || !sig.startsWith("0|")) {
        last = sig;
        since = Date.now();
      } else if (Date.now() - since >= quiet) {
        return true;
      }
      await sleep(120);
    }
    return false;
  };

  let pageNo = "1";
  let counter = 0;

  /** A full-page capture and the state's text and measurements. */
  const snap = async (label, { note = null } = {}) => {
    const settled = await settle();
    const jumps = await page.evaluate(() => {
      const W = window.__walk;
      if (!W) return [];
      return W.jumps.splice(0);
    });
    // The sampler reads each frame before the page's own resize observers run, so a part that
    // grows inside `Grow` shows as +N and, a frame later, -N: it was held at its old height
    // before anything was painted. Those pairs are dropped; what is left was on screen.
    for (let i = jumps.length - 1; i > 0; i--) {
      const a = jumps[i - 1];
      const b = jumps[i];
      if (a.what === b.what && b.ms - a.ms < 60 && Math.abs(a.dHeight + b.dHeight) <= 2 && Math.abs(a.dTop + b.dTop) <= 2) {
        jumps.splice(i - 1, 2);
        i -= 1;
      }
    }
    const partOfRun = (d, a, b) => Math.abs(d) <= 12 || [a, b].some((x) => Math.sign(x) === Math.sign(d) && Math.abs(x) >= Math.abs(d) * 0.4);
    const eased = jumps.filter((j) => partOfRun(j.dHeight, j.prevHeight, j.nextHeight) && partOfRun(j.dTop, j.prevTop, j.nextTop));
    for (const j of eased) jumps.splice(jumps.indexOf(j), 1);
    const under = await page.evaluate(() => (window.__walk ? window.__walk.under.splice(0) : []));
    const m = await measure();
    const nn = String(counter).padStart(2, "0");
    counter += 1;
    const safe = String(label).replace(/[^a-z0-9.+-]+/gi, "-").replace(/^-|-$/g, "");
    const file = `L${n}-p${pageNo}-${nn}-${safe}.png`;
    // A capture beyond the window makes Chrome resize the window the page sees
    // (to 1x1 and back), which re-runs the lesson's fit-to-room and its phone
    // layout. So the page is captured one window at a time at its real size and
    // the pieces are joined. The header and footer are sticky and would repeat
    // on every piece, so for the capture alone they take their place in the
    // flow (same layout: a sticky box keeps its space in the flow).
    const dims = await page.evaluate(() => {
      const y = window.scrollY;
      for (const el of document.querySelectorAll("header, footer")) {
        el.dataset.walkPos = el.style.position;
        el.style.position = "static";
      }
      return { y, H: document.documentElement.scrollHeight, vh: window.innerHeight, vw: window.innerWidth, resizes: window.__walk ? window.__walk.resizes : 0 };
    });
    const slices = [];
    for (let y = 0; y < dims.H; y += dims.vh) {
      const at = await page.evaluate(async (to) => {
        window.scrollTo(0, to);
        // Pictures that load as they come into the window get up to 3 s.
        const t0 = performance.now();
        const pending = () => [...document.images].some((i) => {
          const r = i.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight && r.width > 0 && !i.complete;
        });
        while (pending() && performance.now() - t0 < 3000) await new Promise((r) => setTimeout(r, 60));
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        return window.scrollY;
      }, y);
      slices.push({ y: at, b64: await page.screenshot({ encoding: "base64", type: "png" }) });
    }
    const resizesAfter = await page.evaluate((y) => {
      for (const el of document.querySelectorAll("header, footer")) {
        el.style.position = el.dataset.walkPos || "";
        delete el.dataset.walkPos;
      }
      window.scrollTo(0, y);
      return window.__walk ? window.__walk.resizes : 0;
    }, dims.y);
    const figs = m.practice.map((p, i) => ({ file: `L${n}-p${pageNo}-${nn}-${safe}.fig${i + 1}.png`, x: Math.max(0, p.left - 8), y: Math.max(0, p.docTop - 8), w: p.width + 16, h: p.height + 16 }));
    const joined = await stitch(slices, dims.vw, dims.H, dsf, figs);
    fs.writeFileSync(path.join(shotDir, file), Buffer.from(joined.full, "base64"));
    joined.figs.forEach((b64, i) => fs.writeFileSync(path.join(figDir, figs[i].file), Buffer.from(b64, "base64")));
    const before = dims.resizes;
    const after = resizesAfter;
    const { text, ...rest } = m;
    const state = { page: pageNo, state: `${nn}-${safe}`, shot: `shots/${width}/${file}`, settled, note, ...rest, jumps, eased, under, resizedDuringCapture: after !== before };
    rec.states.push(state);

    const head = `===== L${n} · page ${pageNo} · ${nn}-${safe} · "${m.footer.place ?? ""}" · footer: ${m.footer.hint ? `hint "${m.footer.hint}" · ` : ""}${m.footer.action ?? "(no action)"}${m.footer.actionDisabled ? " (disabled)" : ""} =====`;
    const stripLine = m.strip ? `[Practice wallet strip] ${m.strip}` : "[no strip]";
    textParts.push(`${head}\n${stripLine}\n\n${text.trim()}\n`);
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lastText.page !== pageNo) {
      readParts.push(`${head}\n${stripLine}\n\n${lines.join("\n")}\n`);
    } else {
      const was = new Set(lastText.lines);
      const now = new Set(lines);
      const gone = lastText.lines.filter((l) => !now.has(l)).map((l) => `  - ${l}`);
      const came = lines.filter((l) => !was.has(l)).map((l) => `  + ${l}`);
      readParts.push(`${head}\n${stripLine}\n${gone.length ? `gone:\n${gone.join("\n")}\n` : ""}${came.length ? `new:\n${came.join("\n")}\n` : "(no text change)\n"}`);
    }
    lastText = { page: pageNo, lines };

    const flags = [];
    if (m.scrollsHorizontally) flags.push(`page scrolls sideways (${m.scrollWidth} > ${m.clientWidth})`);
    for (const p of m.practice) if (p.tallerThanRoom) flags.push(`"${p.name}" is ${p.height}px tall, ${p.overBy}px more than the ${m.room}px between header and footer`);
    for (const p of m.practice) for (const b of p.bodyType || []) flags.push(`body type inside "${p.name}": ${b.el} "${b.text}"`);
    for (const what of new Set(eased.map((j) => j.what))) {
      const run = eased.filter((j) => j.what === what);
      flags.push(`eased: "${what}" moved over several frames, fastest ${Math.max(...run.map((j) => Math.max(Math.abs(j.dTop), Math.abs(j.dHeight))))}px in a frame (${run.length} frames over 12px)`);
    }
    // Text arriving under a figure moves "Start over" too, so this is printed only when asked for.
    if (process.env.WALK_UNDER) for (const u of under) flags.push(`under: "Start over" ${u.d >= 0 ? "+" : ""}${u.d}px in one frame at ${u.ms}ms`);
    for (const j of jumps) flags.push(`jump: "${j.what}" top ${j.dTop >= 0 ? "+" : ""}${j.dTop}px height ${j.dHeight >= 0 ? "+" : ""}${j.dHeight}px in one frame`);
    console.log(`  ${file}${flags.length ? "  <- " + flags.join("; ") : ""}`);
    return state;
  };

  /** Find a control, waiting for it to be there and switched on. Leaves it in window.__walkFound. */
  const find = async (spec, timeout = 8000) => {
    const t0 = Date.now();
    let res = null;
    for (;;) {
      res = await page.evaluate(findInPage, spec);
      if (res.chosen) break;
      if (Date.now() - t0 > timeout) break;
      await sleep(150);
    }
    if (!res.chosen) {
      const what = `${spec.kind} "${spec.label ?? spec.text}"${spec.group ? ` in "${spec.group}"` : ""}`;
      const controls = await probe();
      if (res.found) throw Object.assign(new StepError(`control is there but switched off: ${what}`), { kind: "control-disabled", blocked: res.blocked, controls });
      throw Object.assign(new StepError(`selector not found: ${what}`), { kind: "selector-not-found", controls });
    }
    const handle = (await page.evaluateHandle(() => window.__walkFound)).asElement();
    return { handle, info: res.chosen };
  };

  /** Bring a control to the middle of the room between header and footer, as a learner scrolls to it. */
  const bringIntoView = async (handle) => {
    // Where the first control of a moment sits on the page, to compare with where its instruction sits.
    if (currentMoment && !firstControl) {
      firstControl = await handle.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), what: (el.getAttribute("aria-label") || el.innerText || el.tagName).replace(/\s+/g, " ").trim().slice(0, 40) };
      });
    }
    await handle.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
    await sleep(120);
  };
  /** The `Do` instruction on screen for the pending moment: its text and where it sits on the page. */
  const instructionBox = () =>
    page.evaluate(() => {
      const main = document.querySelector("main");
      const els = [...main.querySelectorAll('[class*="do_"]')].filter((el) => !el.closest("[hidden], [aria-hidden='true']") && el.getBoundingClientRect().height > 0);
      const el = els[els.length - 1];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), text: el.innerText.replace(/\s+/g, " ").trim() };
    });

  /** A real click in the middle of the control, checked first for something lying over it. */
  const realClick = async (handle, what) => {
    await bringIntoView(handle);
    const hit = await handle.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const top = document.elementFromPoint(x, y);
      const ok = Boolean(top && (top === el || el.contains(top) || top.contains(el)));
      return { ok, x, y, w: r.width, h: r.height, over: ok || !top ? null : `${top.tagName.toLowerCase()}.${String(top.className).slice(0, 60)}` };
    });
    if (!hit.ok) throw Object.assign(new StepError(`"${what}" is covered by ${hit.over} at its centre`), { kind: "control-covered" });
    await page.mouse.move(hit.x, hit.y);
    await sleep(40);
    await page.mouse.down();
    await sleep(40);
    await page.mouse.up();
    await sleep(150);
    return hit;
  };

  const startSampler = () =>
    page.evaluate(() => {
      const W = window.__walk;
      if (W) {
        W.on = true;
        W.t0 = performance.now();
      }
    });
  const stopSampler = () =>
    page.evaluate(() => {
      const W = window.__walk;
      if (W) {
        W.on = false;
        W.jumps.length = 0;
        W.under.length = 0;
      }
    });

  let currentMoment = null;
  let firstControl = null;
  const h = {
    page,
    settle,
    wait: sleep,
    probe,
    /** Click the control a learner would read as `text`. Options: label (aria-label), role, group, contains, any, nth, last, timeout. */
    click: async (text, opts = {}) => {
      const { timeout, ...rest } = opts;
      const { handle, info } = await find({ kind: "click", text, ...rest }, timeout);
      await realClick(handle, text);
      return info;
    },
    /** Click a field found by its label or placeholder, clear it and type, key by key. */
    type: async (label, text, opts = {}) => {
      const { handle } = await find({ kind: "field", label, ...opts }, opts.timeout);
      await realClick(handle, label);
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.keyboard.type(String(text), { delay: 45 });
      await sleep(150);
      return handle.evaluate((el) => el.value);
    },
    /** Open the app's token picker and choose a token. */
    pickToken: async (token) => {
      const { handle } = await find({ kind: "click", text: "Token:", contains: true }, 8000);
      await realClick(handle, "token picker");
      const opt = await find({ kind: "click", text: token, role: "option" }, 1500).catch(() => null);
      if (opt) {
        // The option row holds a button; click what is inside it.
        const inner = (await opt.handle.$("button")) || opt.handle;
        await realClick(inner, token);
      } else {
        await h.click(token, { any: true });
      }
    },
    /** Tick a checkbox found by the text beside it. */
    tick: async (label) => {
      const { handle } = await find({ kind: "checkbox", label });
      await realClick(handle, label);
    },
    /**
     * Drag a range input to `value` ("max" and "min" allowed) with the mouse,
     * then land exactly with the arrow keys. `label` is its accessible name,
     * or its position among the ranges that are switched on.
     */
    range: async (label, value, opts = {}) => {
      const { handle } = await find({ kind: "range", label }, opts.timeout);
      await bringIntoView(handle);
      const read = () =>
        handle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { min: Number(el.min || 0), max: Number(el.max || 100), step: Number(el.step) || 1, value: Number(el.value), left: r.left, top: r.top, width: r.width, height: r.height };
        });
      let s = await read();
      const target = value === "max" ? s.max : value === "min" ? s.min : Number(value);
      const same = (a, b) => Math.abs(a - b) < s.step / 2 + 1e-9;
      const thumb = Math.min(20, s.height || 16);
      const xOf = (v) => s.left + thumb / 2 + (s.width - thumb) * ((v - s.min) / (s.max - s.min || 1));
      const y = s.top + s.height / 2;
      const from = xOf(s.value);
      const to = xOf(target) + (target >= s.max ? 6 : target <= s.min ? -6 : 0);
      await page.mouse.move(from, y);
      await page.mouse.down();
      const hops = 14;
      for (let i = 1; i <= hops; i++) {
        await page.mouse.move(from + ((to - from) * i) / hops, y);
        await sleep(35);
      }
      await page.mouse.up();
      await sleep(120);
      s = await read();
      let how = "drag";
      if (!same(s.value, target)) {
        await handle.focus();
        for (let i = 0; i < 600 && !same(s.value, target); i++) {
          const was = s.value;
          await page.keyboard.press(s.value < target ? "ArrowRight" : "ArrowLeft");
          s = await read();
          if (s.value === was) break;
        }
        how = "drag + arrow keys";
      }
      if (!same(s.value, target)) {
        // Last resort, and recorded as a workaround: the native setter plus an input event.
        await handle.evaluate((el, v) => {
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
          set.call(el, String(v));
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, target);
        s = await read();
        how = "native value setter";
        rec.workarounds.push({ where, what: `range "${label}" set to ${target} with the native value setter (drag and arrow keys did not land on it)` });
      }
      if (!same(s.value, target)) throw Object.assign(new StepError(`range "${label}" reads ${s.value}, wanted ${target}`), { kind: "range-not-set" });
      return { value: s.value, how };
    },
    /** The value a practice element shows beside a label ("LTV" gives "95.0%"), as the learner reads it. */
    readStat: (label) =>
      page.evaluate((label) => {
        const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
        const want = norm(label).toLowerCase();
        const main = document.querySelector("main");
        for (const st of main.querySelectorAll('[class*="stage_"]')) {
          if (st.closest("[hidden]") || !st.getBoundingClientRect().height) continue;
          for (const el of st.querySelectorAll("*")) {
            if (el.children.length || norm(el.textContent).toLowerCase() !== want || !el.getBoundingClientRect().height) continue;
            const next = el.nextElementSibling;
            if (next && norm(next.innerText)) return norm(next.innerText);
            const rest = norm(el.parentElement.innerText).slice(norm(el.innerText).length).trim();
            if (rest) return rest;
          }
        }
        return null;
      }, label),
    /**
     * Drag a range input a step at a time, from where it stands, until
     * `until()` is true ("drag it until Health Factor reads 1.00"). `dir` is 1
     * (right) or -1. The mouse does the drag; if a pixel of travel skips the
     * reading, the arrow keys walk back to it.
     */
    rangeUntil: async (label, until, { dir = 1 } = {}) => {
      const { handle } = await find({ kind: "range", label });
      await bringIntoView(handle);
      const read = () =>
        handle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { min: Number(el.min || 0), max: Number(el.max || 100), step: Number(el.step) || 1, value: Number(el.value), left: r.left, top: r.top, width: r.width, height: r.height };
        });
      const s = await read();
      if (await until()) return { value: s.value, how: "already there" };
      const thumb = Math.min(20, s.height || 16);
      const span = s.width - thumb;
      const xOf = (v) => s.left + thumb / 2 + span * ((v - s.min) / (s.max - s.min || 1));
      const y = s.top + s.height / 2;
      const hop = Math.max(1, (span * s.step) / (s.max - s.min || 1));
      let x = xOf(s.value);
      const end = dir > 0 ? s.left + s.width - 1 : s.left + 1;
      await page.mouse.move(x, y);
      await page.mouse.down();
      let hit = false;
      while (dir > 0 ? x < end : x > end) {
        x = dir > 0 ? Math.min(end, x + hop) : Math.max(end, x - hop);
        await page.mouse.move(x, y);
        await sleep(12);
        if (await until()) {
          hit = true;
          break;
        }
      }
      await page.mouse.up();
      await sleep(100);
      if (hit) return { value: (await read()).value, how: "drag" };
      // The drag passed it: walk back the other way with the arrow keys.
      await handle.focus();
      for (let i = 0; i < 2000; i++) {
        await page.keyboard.press(dir > 0 ? "ArrowLeft" : "ArrowRight");
        if (await until()) return { value: (await read()).value, how: "drag + arrow keys" };
        const v = (await read()).value;
        if (v <= s.min || v >= s.max) break;
      }
      throw Object.assign(new StepError(`range "${label}" never gave the reading the text asks for`), { kind: "range-not-set" });
    },
    /** Press every switched-on button inside the practice element, one after another, until none is left unpressed. */
    clickEach: async ({ except = [] } = {}) => {
      const pressed = [];
      for (let guard = 0; guard < 12; guard++) {
        const list = await page.evaluate(
          (skip) => {
            const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
            const main = document.querySelector("main");
            const out = [];
            for (const st of main.querySelectorAll('[class*="stage_"]')) {
              if (st.closest("[hidden]") || !st.getBoundingClientRect().height) continue;
              for (const b of st.querySelectorAll("button")) {
                if (b.disabled || !b.getBoundingClientRect().height) continue;
                if (["tab", "switch"].includes(b.getAttribute("role"))) continue;
                const t = norm(b.innerText) || norm(b.getAttribute("aria-label"));
                if (t && !skip.includes(t)) out.push(t);
              }
            }
            return out;
          },
          [...except, ...pressed],
        );
        if (!list.length) break;
        await h.click(list[0], { any: true });
        pressed.push(list[0]);
        await settle({ max: 6000 });
        if (currentMoment && (await doneMoments()).includes(currentMoment) && list.length === 1) break;
        await h.shot(`pressed-${pressed.length}`);
      }
      if (!pressed.length) throw Object.assign(new StepError("no button to press inside the practice element"), { kind: "selector-not-found", controls: await probe() });
      return pressed;
    },
    /** Press the figure's own step button ("Next step", "Next", "Step") until the moment is done. */
    stepThrough: async ({ names = ["Next step", "Next", "Step", "Continue"], max = 10 } = {}) => {
      let presses = 0;
      for (let i = 0; i < max; i++) {
        if (currentMoment && (await doneMoments()).includes(currentMoment)) break;
        let pressedOne = false;
        for (const name of names) {
          const res = await page.evaluate(findInPage, { kind: "click", text: name });
          if (res.chosen) {
            await h.click(name, { timeout: 15000 });
            pressedOne = true;
            break;
          }
        }
        if (!pressedOne) {
          // Maybe the step button is busy; give it a moment, then look once more.
          await sleep(1500);
          const again = await Promise.all(names.map((name) => page.evaluate(findInPage, { kind: "click", text: name })));
          if (!again.some((r) => r.chosen)) {
            if (presses === 0) throw Object.assign(new StepError(`no step button (${names.join(", ")}) on the figure`), { kind: "selector-not-found", controls: await probe() });
            break;
          }
          continue;
        }
        presses += 1;
        await settle({ max: 8000 });
        if (!(currentMoment && (await doneMoments()).includes(currentMoment))) await h.shot(`step${presses}`);
      }
      return presses;
    },
    /** An extra capture part way through a moment (a dialog, a tooltip). */
    shot: async (label) => snap(`${currentMoment ?? "state"}.${label}`),
  };

  /* load */

  console.log(`L${n} ${lesson.slug} (${lesson.id}) at ${width}x${height}`);
  try {
    await page.goto(`${BASE}${lesson.slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForFunction(() => document.querySelector("footer [class*='barPlace']") || document.querySelector("main [inert]"), { timeout: 45000 });
    await sleep(500);
    const first = await measure();
    if (first.preview || !first.footer.place) {
      fail("preview", "the lesson rendered as an inert preview, so it cannot be walked");
      await snap("preview");
      throw new StepError("preview");
    }
    const total = Number((/of (\d+)/.exec(first.footer.place) || [])[1]);
    rec.pages = total - 1;

    /* the pages */
    for (let p = 1; p <= total - 1; p++) {
      pageNo = String(p);
      counter = 0;
      where = `p${p} open`;
      const place = (await footer()).place;
      if (!place || !place.startsWith(`${p} of`)) fail("wrong-page", `expected page ${p}, the footer reads "${place}"`);
      await snap("open");

      for (let guard = 0; guard < 12; guard++) {
        const f = await footer();
        if (!f.actionDisabled) break;
        const done = await doneMoments();
        const pending = moments.find((id) => !done.includes(id));
        if (!pending) {
          fail("next-never-enabled", `Next is switched off (hint "${f.hint}") with every moment done`);
          break;
        }
        where = `p${p} ${pending}`;
        currentMoment = pending;
        const step = steps[pending];
        if (!step) {
          fail("no-step", `no step in the table for moment "${pending}" (footer hint "${f.hint}")`, { controls: await probe() });
          break;
        }
        console.log(`  moment ${pending}  (hint: ${f.hint})`);
        firstControl = null;
        const instruction = await instructionBox();
        const roomNow = (await measure()).room;
        // How long the learner waits after their last press before the lesson counts the moment done.
        let waitedMs = null;
        try {
          await startSampler();
          await step(h);
          // Done when the lesson's store has the moment, which is also when the footer's hint moves on.
          const t0 = Date.now();
          let ok = false;
          while (Date.now() - t0 < 25000) {
            if ((await doneMoments()).includes(pending)) {
              ok = true;
              waitedMs = Date.now() - t0;
              break;
            }
            await sleep(150);
          }
          if (!ok) {
            const f2 = await footer();
            fail("moment-never-completed", `"${pending}" was not marked done 25s after its step (footer hint "${f2.hint}")`, { controls: await probe() });
            await snap(`${pending}.STUCK`);
            break;
          }
          const f3 = await footer();
          if (f3.hint === f.hint && f3.actionDisabled) fail("hint-unchanged", `"${pending}" is done but the footer hint still reads "${f3.hint}"`);
        } catch (e) {
          if (!(e instanceof StepError)) throw e;
          fail(e.kind || "step-failed", `${pending}: ${e.message}`, { controls: e.controls, blocked: e.blocked });
          await snap(`${pending}.FAILED`).catch(() => {});
          break;
        }
        const after = await snap(pending);
        // The instruction and the first control it names: can a learner have both in the window at once?
        if (instruction && firstControl) {
          const span = Math.max(instruction.bottom, firstControl.bottom) - Math.min(instruction.top, firstControl.top);
          after.act = {
            moment: pending,
            instruction: instruction.text,
            hint: f.hint,
            firstControl: firstControl.what,
            instructionTop: instruction.top,
            controlTop: firstControl.top,
            controlIsAbove: firstControl.top < instruction.top,
            span,
            room: roomNow,
            fitTogether: span <= roomNow,
          };
          if (!after.act.fitTogether) console.log(`    instruction and "${firstControl.what}" are ${span}px apart, the window shows ${roomNow}px`);
        } else {
          after.act = { moment: pending, instruction: instruction ? instruction.text : null, hint: f.hint, firstControl: firstControl ? firstControl.what : null };
          if (!instruction) console.log(`    no instruction on screen for "${pending}" (footer hint: ${f.hint})`);
        }
        after.act.waitedMs = waitedMs;
        if (waitedMs > 4000) console.log(`    ${(waitedMs / 1000).toFixed(1)}s between the last press and the moment counting as done (the footer hint stays "${f.hint}" until then)`);
        currentMoment = null;
      }

      where = `p${p} next`;
      const f = await footer();
      if (f.actionDisabled) {
        fail("next-never-enabled", `page ${p}: "${f.action}" stayed switched off (hint "${f.hint}")`);
        throw new StepError("stuck");
      }
      // The footer's one action: Next, or Next: Check on the last page.
      const before = f.place;
      await stopSampler();
      const btn = await page.$("footer button[class*='primary']");
      if (!btn) {
        fail("selector-not-found", "the footer's Next button");
        throw new StepError("stuck");
      }
      await btn.click();
      const turned = await page
        .waitForFunction((was) => (document.querySelector("footer [class*='barPlace']")?.innerText ?? "").trim() !== was, { timeout: 8000 }, before)
        .then(() => true)
        .catch(() => false);
      if (!turned) {
        fail("next-did-nothing", `pressed "${f.action}" on page ${p} and the page did not change`);
        throw new StepError("stuck");
      }
      const y = await page.evaluate(() => window.scrollY);
      if (y > 2) fail("page-opened-scrolled", `page ${p + 1} opened scrolled to ${Math.round(y)}px, not at its top`);
    }

    /* the Check */
    pageNo = "check";
    counter = 0;
    where = "check";
    const gotCheck = await page
      .waitForFunction(() => document.querySelectorAll("main section[aria-label='Check']:not([hidden]) [role='radiogroup']").length >= 1, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    if (!gotCheck) {
      fail("check-missing", "the Check page showed no questions");
      await snap("no-questions");
      throw new StepError("stuck");
    }
    await snap("open");
    const bank = QUESTIONS[lesson.id] || [];
    const asked = await page.evaluate(() =>
      // The Check's own questions only: a hidden page's option groups are still in the document.
      [...document.querySelectorAll("main section[aria-label='Check']:not([hidden]) [role='radiogroup']")].map((g) => ({
        prompt: (g.previousElementSibling?.innerText ?? "").replace(/\s+/g, " ").trim(),
        choices: [...g.querySelectorAll("[role='radio']")].map((b) => (b.querySelector("span:last-child")?.innerText ?? b.innerText).replace(/\s+/g, " ").trim()),
      })),
    );
    rec.check = { asked: [], passed: false };
    for (let qi = 0; qi < asked.length; qi++) {
      const a = asked[qi];
      const key = (list) => [...list].map((s) => s.replace(/\s+/g, " ").trim()).sort().join(" || ");
      const q = bank.find((b) => key(b.options) === key(a.choices));
      if (!q) {
        fail("question-not-in-bank", `question ${qi + 1} ("${a.prompt}") has no entry in lib/questions.js with the same options`);
        continue;
      }
      const right = q.options[q.correct].replace(/\s+/g, " ").trim();
      const index = a.choices.indexOf(right);
      rec.check.asked.push({ prompt: a.prompt, choices: a.choices, right });
      const radios = await page.$$(`main section[aria-label='Check'] [role='radiogroup'][aria-label='Question ${qi + 1} options'] [role='radio']`);
      if (!radios[index]) {
        fail("selector-not-found", `the right option for question ${qi + 1}`);
        continue;
      }
      await realClick(radios[index], right);
    }
    await snap("answered");
    const send = await page.evaluate(() => {
      const b = document.querySelector("footer button[class*='primary']");
      return b ? { text: b.innerText.trim(), disabled: b.disabled } : null;
    });
    if (!send || send.disabled) {
      fail("check-cannot-send", `the footer's "${send ? send.text : "Check my answer"}" is switched off with both questions answered`);
      throw new StepError("stuck");
    }
    await (await page.$("footer button[class*='primary']")).click();
    const passed = await page
      .waitForFunction((key, id) => Boolean(JSON.parse(localStorage.getItem(key) || "{}")[id]), { timeout: 15000 }, COMPLETIONS_KEY, lesson.id)
      .then(() => true)
      .catch(() => false);
    await snap(passed ? "passed" : "not-passed");
    const end = await footer();
    rec.check.passed = passed;
    rec.check.footerAfter = end.action;
    if (!passed) fail("check-not-passed", "both bank answers were picked and the lesson was not marked complete");
    else if (!/next lesson|finish the track|back to the map/i.test(end.action || "")) fail("no-way-on", `passed, but the footer reads "${end.action}"`);
    rec.passed = passed;
  } catch (e) {
    if (!(e instanceof StepError)) {
      fail("walker-error", String(e && e.stack ? e.stack : e).slice(0, 600));
      await snap("ERROR").catch(() => {});
    }
  }

  fs.writeFileSync(path.join(textDir, `L${n}.txt`), textParts.join("\n"));
  fs.writeFileSync(path.join(textDir, `L${n}.read.txt`), readParts.join("\n"));
  await context.close().catch(() => {});
  console.log(`  => ${rec.passed ? "passed the Check" : "DID NOT FINISH"}, ${rec.failures.length} failure(s), ${rec.states.length} states`);
  return rec;
}

async function main() {
  const [w, hgt, ...rest] = process.argv.slice(2);
  const width = Number(w);
  const height = Number(hgt);
  if (!width || !height) {
    console.error("usage: node walk.cjs <width> <height> [lessonNumber ...]   (default sizes: 1440 900 and 390 844)");
    process.exit(2);
  }
  const wanted = rest.length ? rest.map(Number) : INTERMEDIATE.map((l) => l.n);
  const lessons = INTERMEDIATE.filter((l) => wanted.includes(l.n));

  const reportFile = path.join(OUT, `report-${width}.json`);
  // A run of some lessons keeps the others' results from the last run at this width.
  let report = { width, height, base: BASE, startedAt: new Date().toISOString(), lessons: [], console: [] };
  if (rest.length && fs.existsSync(reportFile)) {
    try {
      const old = JSON.parse(fs.readFileSync(reportFile, "utf8"));
      if (old.height === height) {
        report.lessons = old.lessons.filter((l) => !wanted.includes(l.lesson));
        report.console = (old.console || []).filter((c) => !wanted.includes(c.lesson));
      }
    } catch {
      /* start a new report */
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    userDataDir: path.join(OUT, "chrome-profile", `${width}x${height}`),
    args: ["--no-first-run", "--no-default-browser-check", "--disable-extensions", "--mute-audio", `--window-size=${width},${height}`],
  });
  const walked = [];
  try {
    // A blank page that joins the window-sized captures into one picture and cuts out each practice element.
    const joiner = await browser.newPage();
    const stitch = (slices, w, h, scale, figs) =>
      joiner.evaluate(
        async (slices, w, h, scale, figs) => {
          const c = document.createElement("canvas");
          c.width = Math.round(w * scale);
          c.height = Math.round(h * scale);
          const g = c.getContext("2d");
          for (const s of slices) {
            const img = new Image();
            img.src = `data:image/png;base64,${s.b64}`;
            await img.decode();
            g.drawImage(img, 0, Math.round(s.y * scale));
          }
          const cut = (f) => {
            const k = document.createElement("canvas");
            k.width = Math.max(1, Math.round(Math.min(f.w, w - f.x) * scale));
            k.height = Math.max(1, Math.round(Math.min(f.h, h - f.y) * scale));
            k.getContext("2d").drawImage(c, -Math.round(f.x * scale), -Math.round(f.y * scale));
            return k.toDataURL("image/png").split(",")[1];
          };
          return { full: c.toDataURL("image/png").split(",")[1], figs: figs.map(cut) };
        },
        slices,
        w,
        h,
        scale,
        figs,
      );
    for (const lesson of lessons) walked.push(await walkLesson(browser, lesson, width, height, report, stitch));
  } finally {
    await browser.close().catch(() => {});
  }

  report.lessons.sort((a, b) => a.lesson - b.lesson);
  report.finishedAt = new Date().toISOString();
  report.summary = {
    walked: walked.map((l) => l.lesson),
    passed: walked.filter((l) => l.passed).map((l) => l.lesson),
    failures: report.lessons.reduce((s, l) => s + l.failures.length, 0),
    consoleErrors: report.console.filter((c) => c.type === "error" || c.type === "pageerror").length,
    sidewaysScroll: report.lessons.flatMap((l) => l.states.filter((s) => s.scrollsHorizontally).map((s) => `L${l.lesson} p${s.page} ${s.state}`)),
    tallerThanRoom: report.lessons.flatMap((l) =>
      l.states.flatMap((s) => s.practice.filter((p) => p.tallerThanRoom).map((p) => `L${l.lesson} p${s.page} ${s.state}: "${p.name}" ${p.height}px in ${s.room}px (zoom ${p.zoom})`)),
    ),
    jumps: report.lessons.flatMap((l) => l.states.flatMap((s) => s.jumps.map((j) => `L${l.lesson} p${s.page} ${s.state}: "${j.what}" top ${j.dTop} height ${j.dHeight} at ${j.ms}ms`))),
    instructionAndControlApart: report.lessons.flatMap((l) =>
      l.states
        .filter((s) => s.act && s.act.fitTogether === false)
        .map((s) => `L${l.lesson} p${s.page} ${s.act.moment}: the instruction and "${s.act.firstControl}" span ${s.act.span}px, the window shows ${s.act.room}px${s.act.controlIsAbove ? " (the control is above the instruction)" : ""}`),
    ),
    slowToCount: report.lessons.flatMap((l) =>
      l.states.filter((s) => s.act && s.act.waitedMs > 4000).map((s) => `L${l.lesson} p${s.page} ${s.act.moment}: ${(s.act.waitedMs / 1000).toFixed(1)}s after the last press before the footer hint "${s.act.hint}" moves on`),
    ),
    boxesThatCutTheirContent: report.lessons.flatMap((l) =>
      l.states.flatMap((s) =>
        s.practice.flatMap((p) => p.clipped.filter((c) => c.overflowY).map((c) => `L${l.lesson} p${s.page} ${s.state}: ${c.el} shows ${c.clientHeight}px of ${c.scrollHeight}px ("${c.text}")`)),
      ),
    ),
    workarounds: report.lessons.flatMap((l) => l.workarounds.map((x) => `L${l.lesson} ${x.where}: ${x.what}`)),
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  const ok = walked.length === lessons.length && walked.every((l) => l.passed);
  console.log(`\n${walked.filter((l) => l.passed).length} of ${lessons.length} lessons walked to a passed Check at ${width}x${height}. Report: ${reportFile}`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
