import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import app from "../AppMock/styles.module.css";
import { AppButton, AppDelta, AppFixedRow, AppInput, usePointed, useReducedMotion, useTween, useWash } from "../AppMock";
import { AppShot, LessonControl } from "../kit";
import { useMoment, useMomentNote } from "./position";
import { FoldAway, Stage } from "./index";
import { NOT_READY } from "./moments";
import frame from "./styles.module.css";
import own from "./moments-i7.module.css";

/**
 * The practice moments and figures of intermediate lesson 7 (script I7,
 * "The peg, and what sets a Fixed Yield return"), imported by
 * lessons/intermediate/i7PegAndFixedYield.mdx, and the small parts lessons
 * I7 to I9 share (the stepped run, a figure tile, the slider, the window).
 *
 * The rules are the beginner moments' (moments-3-8.jsx): a moment reads the
 * position from the lesson's store and writes to it once; one practice
 * element per page, changing in place; every change starts from the
 * reader's action and runs slowly enough to watch (the strip takes 1.6 s);
 * a part the text names is lit; nothing on the element jumps on an action (a
 * part that comes later holds its place, hidden, or grows into place). A
 * figure that plays a sequence plays it on the element first and writes the
 * position at its end, so the practice wallet moves last.
 */

/* ── Shared parts (I7 to I9) ─────────────────────────────── */

const iconPath = (name) => `/img/academy-app/${name}.svg`;

/** "5,000.00": two decimals, rounded, as a lesson figure prints a worked amount. */
export const f2 = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "5,000": whole. */
export const f0 = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
/** The app's own truncation to two decimals (formatNumber, roundingMode "trunc"). */
export const trunc2 = (n) => Math.floor(Number(n) * 100 + 1e-7) / 100;
/** A ratio as a percentage to one decimal, rounded ("96.2%"). */
export const pct1 = (x) => `${(Math.round(x * 1000) / 10).toFixed(1)}%`;

/**
 * A run of numbered states played one after another, `gap` ms apart, from a
 * press. `at` is the state on screen (0 before the press), `play` a token
 * that bumps with every state so a tween or a wash keyed on it runs. With
 * reduced motion the run lands on its last state at once. `onDone` runs a
 * gap after the last state, so the last change is seen before the text that
 * explains it arrives. `done` is the moment's record: a lesson reloaded with
 * the moment done shows the last state with nothing played.
 */
export function useRun({ count, gap, onDone, done = false }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(done ? count : 0);
  const [play, setPlay] = useState(0);
  const timers = useRef([]);
  const after = useRef(onDone);
  after.current = onDone;
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  // The store restores after mount: a moment done on an earlier visit lands on its end.
  useEffect(() => {
    if (done && step === 0 && !timers.current.length) setStep(count);
  }, [done, step, count]);
  const start = useCallback(
    (from = 0) => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      if (reduced) {
        setStep(count);
        setPlay((p) => p + 1);
        if (after.current) after.current();
        return;
      }
      for (let k = from + 1; k <= count; k++) {
        timers.current.push(
          window.setTimeout(() => {
            setStep(k);
            setPlay((p) => p + 1);
          }, (k - from - 1) * gap),
        );
      }
      timers.current.push(window.setTimeout(() => after.current && after.current(), (count - from) * gap));
    },
    [count, gap, reduced],
  );
  return { at: step, play, start, running: step > 0 && step < count, setAt: setStep };
}

/** A tweened number, formatted. It eases only when `play` changes. */
export function Tw({ value, play, fmt = f2, ms = 900 }) {
  const shown = useTween(value, play, ms);
  return <>{fmt(shown)}</>;
}

/**
 * One figure on a practice element, drawn as the app draws a stat tile:
 * label, value, and a fixed line under it for a change chip (reserved, so a
 * chip never makes the tile taller). `lit` outlines it in copper; `washKey`
 * runs the copper wash; `stat` lights it while the reader points at that
 * name in the text.
 */
export function Tile({ label, children, note = null, lit = false, washKey = 0, stat = null, dim = false, tone = null }) {
  const pointed = usePointed();
  const on = stat != null && pointed(stat);
  return (
    <div className={`${app.tile} ${lit || on ? app.tileOn : ""} ${on ? app.pointed : ""} ${dim ? app.fade : ""}`}>
      {washKey ? <span key={washKey} className={app.wash} aria-hidden="true" /> : null}
      <div className={app.tileText}>
        <div className={app.tileLabel}>{label}</div>
        <div className={`${app.tileValue} ${tone === "bad" ? app.bad : tone === "good" ? app.good : ""}`}>{children}</div>
        <div className={app.tileNote}>{note}</div>
      </div>
    </div>
  );
}

/** A row of tiles, `n` to a row as the app lays them. */
export function Tiles({ n, children }) {
  return (
    <div className={app.stats} style={{ "--app-tiles": n }}>
      {children}
    </div>
  );
}

/** A wash key for a figure that changed with the last `play`. */
export function useChanged(value, play) {
  const was = useRef(value);
  const changed = was.current !== value;
  useEffect(() => {
    was.current = value;
  }, [value]);
  return useWash(true, play, changed);
}

/**
 * A practice figure in the app's frame. `title` heads it, `tag` is the pill
 * (Practice, What if, Example), and `label` names it for a screen reader:
 * every practice element's name starts "Practice", which is how a walk
 * counts one element per page.
 */
export function Frame({ title, tag = "Practice", label, children, className = "" }) {
  return (
    <section className={`${app.frame} ${className}`} aria-label={`Practice copy of ${label ?? title}`}>
      <div className={app.top}>
        <div className={app.vaultName}>{title}</div>
        <span className={`${app.practice} ${app.practiceStrong}`}>{tag}</span>
      </div>
      {children}
    </section>
  );
}

/**
 * A range slider in the app's look, with its label and value on one line
 * above it and the ends (or ticks) under it. `lit` outlines it in copper.
 */
export function Slider({ label, value, display, min, max, step, onChange, disabled = false, lit = false, ticks = null, ends = null, name }) {
  return (
    <div className={`${own.slider} ${lit ? own.rowLit : ""} ${disabled ? own.sliderOff : ""}`}>
      <div className={own.sliderHead}>
        <span className={own.sliderLabel}>{label}</span>
        <span className={own.sliderValue}>{display}</span>
      </div>
      <input
        type="range"
        className={own.range}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={name ?? label}
        aria-valuetext={display}
        style={{ "--fill": `${max > min ? Math.min(Math.max((value - min) / (max - min), 0), 1) * 100 : 0}%` }}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
      />
      {ticks ? (
        <div className={own.ticks}>
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      ) : ends ? (
        <div className={own.ticks}>
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

/** The app's switch, with its label. */
export function Switch({ on, onChange, label, disabled = false }) {
  return (
    <span className={`${own.switchRow} ${disabled ? own.switchOff : ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        className={`${own.switch} ${on ? own.switchOn : ""}`}
        onClick={() => onChange && onChange(!on)}
      >
        <i />
      </button>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

/**
 * A dialog the app opens over the page, drawn in place on the practice
 * element under the part that opened it: its title and description, then
 * its rows.
 */
export function Window({ title, description = null, inPanel = false, children }) {
  return (
    <div className={`${own.window} ${inPanel ? own.windowInPanel : ""}`} role="dialog" aria-label={title}>
      <div className={own.windowTitle}>{title}</div>
      {description ? <div className={own.windowText}>{description}</div> : null}
      {children}
    </div>
  );
}

/** One "label ........ value" row of a window, as the app's claim window prints them. */
export function Dotted({ label, children, lit = false, dim = false }) {
  return (
    <div className={`${own.dotted} ${lit ? own.rowLit : ""} ${dim ? app.fade : ""}`}>
      <span>{label}</span>
      <i aria-hidden="true" />
      <b>{children}</b>
    </div>
  );
}

/**
 * A capture in place of the frame's `Shot`, whose list of captures (the
 * kit's SHOTS) is shared: the same card, in the stage or the column.
 */
export function LocalShot({ shot, column = false, children }) {
  return (
    <div className={`${column ? frame.column : frame.stage} ${frame.shot}`}>
      <AppShot shot={shot} label={null}>
        {children}
      </AppShot>
    </div>
  );
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** A part that comes later, holding its place while hidden, so its arrival moves nothing. */
export function Hold({ show, children, className = "" }) {
  return (
    <div className={className} style={show ? undefined : { visibility: "hidden" }} aria-hidden={show ? undefined : true}>
      {children}
    </div>
  );
}

/**
 * A part that appears on the element after an action and goes again (a
 * window): it eases open and shut over 0.45 s (at once under reduced
 * motion), so the element grows to its new height instead of snapping.
 * `seconds` slows it for a tall part, which would otherwise cover a lot of
 * height in each frame.
 */
export function GrowIn({ show, children, seconds = 0.45 }) {
  const reduced = useReducedMotion();
  const box = useRef(null);
  const inner = useRef(null);
  const [mounted, setMounted] = useState(show);
  const first = useRef(true);
  useIsoLayoutEffect(() => {
    if (show && !mounted) setMounted(true);
  }, [show, mounted]);
  useIsoLayoutEffect(() => {
    const el = box.current;
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (show && !mounted) return undefined;
    if (!el || reduced) {
      if (!show) setMounted(false);
      return undefined;
    }
    const to = show ? (inner.current ? inner.current.offsetHeight : 0) : 0;
    const from = show ? 0 : el.offsetHeight;
    el.style.height = `${from}px`;
    el.style.overflow = "hidden";
    el.style.opacity = show ? "0" : "1";
    void el.offsetHeight;
    el.style.transition = `height ${seconds}s ease, opacity ${Math.max(seconds - 0.1, 0.1)}s ease`;
    el.style.height = `${to}px`;
    el.style.opacity = show ? "1" : "0";
    const t = window.setTimeout(() => {
      el.style.transition = "";
      el.style.overflow = "";
      el.style.height = "";
      el.style.opacity = "";
      if (!show) setMounted(false);
    }, seconds * 1000 + 20);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, mounted]);
  return (
    <div ref={box} className={own.growIn}>
      <div ref={inner}>{mounted ? children : null}</div>
    </div>
  );
}

/* ── Page 1: what moves alUSD's price ────────────────────── */

/** Where the marker sits on the line: 0.97 at the left edge, 1.005 at the right. */
const LO = 0.97;
const HI = 1.005;
const xAt = (p) => `${((p - LO) / (HI - LO)) * 100}%`;

/**
 * The four steps, each a whole state: the caption, the price, how much alUSD
 * is for sale (a share of the bar), and the chips. Only 1.00 and 0.98 are
 * labeled on the line.
 */
const CYCLE = [
  { caption: null, price: 1, sale: 0.18, apr: false, buyers: false, burn: false, label: null, lit: [] },
  { caption: "Borrowers mint alUSD and sell it for USDC, so more is for sale than buyers want at a dollar.", price: 0.98, sale: 0.78, apr: false, buyers: false, burn: false, label: "0.98", lit: ["sale", "price"] },
  { caption: "Under the peg, each alUSD costs less and still claims one USDC, so a Fixed Yield deposit earns more.", price: 0.98, sale: 0.78, apr: true, buyers: false, burn: false, label: "0.98", lit: ["apr"] },
  { caption: "Fixed Yield depositors and borrowers repaying debt buy alUSD under a dollar.", price: 0.991, sale: 0.5, apr: true, buyers: true, burn: false, label: null, lit: ["buyers", "price", "sale"] },
  { caption: "With that alUSD off the market, less is for sale, and the price moves back toward the peg.", price: 0.998, sale: 0.24, apr: true, buyers: true, burn: true, label: null, lit: ["burn", "sale", "price"] },
];

/**
 * "Step through what moves alUSD's price." A price line with the peg at 1.00
 * and alUSD's market price on it, and a Next step control through the four
 * steps at the reader's pace. Each step's changes ease over 600 ms. The
 * position does not change.
 */
export function PegCycle() {
  const m = useMoment("cycle");
  const [step, setStep] = useState(m.done ? 4 : 0);
  useEffect(() => {
    if (m.done && step === 0) setStep(4);
  }, [m.done, step]);
  const s = CYCLE[step];
  const lit = (k) => s.lit.includes(k);
  return (
    <>
    <Stage>
      <Frame title="alUSD's market price" tag="What if" label="a figure of alUSD's market price">
        <div className={own.cycleCaption} aria-live="polite">
          {s.caption ? (
            <>
              <span className={own.cycleNum}>{step}</span>
              <span>{s.caption}</span>
            </>
          ) : null}
        </div>
        <div className={own.priceLine}>
          <div className={own.priceTrack} />
          <div className={own.peg} style={{ left: xAt(1) }}>
            <span>Peg 1.00</span>
          </div>
          <div className={`${own.marker} ${lit("price") ? own.markerLit : ""}`} style={{ left: xAt(s.price) }}>
            <span style={{ visibility: s.label ? "visible" : "hidden" }}>{s.label ?? "0.98"}</span>
            <i />
          </div>
        </div>
        <div className={own.cycleRow}>
          <div className={`${own.sale} ${lit("sale") ? own.partLit : ""}`}>
            <span className={own.saleLabel}>alUSD for sale</span>
            <span className={own.saleBar}>
              <i style={{ width: `${s.sale * 100}%` }} />
            </span>
            <span className={own.burn} style={{ visibility: s.burn ? "visible" : "hidden" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              Off the market
            </span>
          </div>
          <div className={own.cycleChips}>
            <span className={`${own.fyChip} ${lit("apr") ? own.partLit : ""}`} style={{ visibility: s.apr ? "visible" : "hidden" }}>
              Fixed Yield card
              <b>
                Projected Fixed APR
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </b>
            </span>
            <span className={`${own.buyer} ${lit("buyers") ? own.partLit : ""}`} style={{ visibility: s.buyers ? "visible" : "hidden" }}>
              Fixed Yield deposit
            </span>
            <span className={`${own.buyer} ${lit("buyers") ? own.partLit : ""}`} style={{ visibility: s.buyers ? "visible" : "hidden" }}>
              Repay debt
            </span>
          </div>
        </div>
      </Frame>
    </Stage>
      {/* Folds away after the last step, so what is under the figure slides
          up. It sits after the stage, not inside it. FoldAway measures what
          is under the control to end its fold on the final layout, and as
          the last thing in a stage it had only the stage's own bottom edge,
          which the frame's and the control's bottom margins fall outside
          of, and the page moved 32px in one frame at the end of
          the fold. Out here the layout is the same and the fold ends where
          it should. */}
      <FoldAway show={step < 4}>
        <LessonControl
          disabled={!m.ready}
          hint={m.ready || m.done ? null : NOT_READY}
          onClick={() => {
            const next = step + 1;
            setStep(next);
            if (next === 4) m.apply({ ...m.position });
          }}
        >
          Next step
        </LessonControl>
      </FoldAway>
    </>
  );
}
PegCycle.moment = "cycle";
PegCycle.hint = "Step through all four";

/* ── Page 2: what sets a Fixed Yield return ──────────────── */

const ALUSD = 5_000;
const DAYS = 121;
const PRICES = [0.96, 0.97, 0.98, 0.99, 1];
/** The card's figures at a price, as the app prints them: truncated, over the days to maturity. */
function cardAt(p) {
  const ret = (1 - p) / p;
  return { percent: trunc2(ret * 100), apr: trunc2(((ret * 365) / DAYS) * 100), gain: ALUSD * (1 - p) };
}

/**
 * The practice Fixed Yield card with alUSD picked: the app's layout (the
 * kit's AppFixedCard, adapted here for an alUSD field, the ETH alUSD Price
 * row with its slider, and amounts to the cent). "Move the ETH alUSD Price"
 * is the first moment; "Set the price back to 0.98 and press Deposit" the
 * second, on the same card.
 */
export function FixedYieldPriceCard() {
  const m = useMoment("price");
  const dep = useMoment("deposit");
  const [price, setPrice] = useState(0.98);
  const [moved, setMoved] = useState(m.done);
  useEffect(() => {
    if (m.done) setMoved(true);
  }, [m.done]);
  const deposited = dep.done;
  const p = deposited ? 0.98 : price;
  const fig = cardAt(p);
  const alUsdIcon = useBaseUrl(iconPath("alUSD"));
  const usdcIcon = useBaseUrl(iconPath("USDC"));
  const wallet = deposited ? dep.after.walletAl ?? 0 : m.position.walletAl ?? 0;
  const atPrice = Math.abs(price - 0.98) < 0.001;
  const depositHint = deposited ? null : !dep.ready ? "Move the alUSD price first" : !atPrice ? "Set the price back to 0.98" : null;
  useMomentNote("deposit", dep.ready && !atPrice ? "Set the price back to 0.98" : null);
  const lit = deposited ? ["maturity", "output"] : moved ? ["price", "percent", "gain", "apr"] : ["price", "gain", "amount"];
  const f = (k) => `${own.cardRow} ${lit.includes(k) ? own.rowLit : ""}`;
  const onSlide = (v) => {
    setPrice(v);
    if (!moved) setMoved(true);
    if (!m.done && m.ready && Math.abs(v - 0.98) > 0.001) m.apply({ ...m.position });
  };
  return (
    <Stage>
      <section className={`${app.frame} ${app.fixed}`} aria-label="Practice copy of a card on the app's Fixed Yield page">
        <div className={app.fixedLeft}>
          <div className={app.fixedHead}>
            <span className={app.fixedIcons}>
              <img src={alUsdIcon} alt="" width="40" height="40" />
              <img src={usdcIcon} alt="" width="40" height="40" />
            </span>
            <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
          </div>
          <div className={`${own.aprBlock} ${f("apr")}`}>
            <div className={app.fixedApr}>USDC {fig.apr.toFixed(2)}%</div>
            <div className={app.fixedAprLabel}>Projected Fixed APR</div>
          </div>
          <div className={app.vcardCap}>
            <span className={app.capBar}>
              <i style={{ width: "96%" }} />
            </span>
          </div>
          <dl className={app.fixedRows}>
            <div>
              <dt>Deposit Cap</dt>
              <dd>2.3M/2.4M alUSD</dd>
            </div>
            <div>
              <dt>Term</dt>
              <dd>4 Months</dd>
            </div>
            <div>
              <dt>Early Exit Fee</dt>
              <dd>1.00%</dd>
            </div>
          </dl>
        </div>
        <dl className={`${app.fixedRows} ${app.fixedRight}`}>
          <div className={f("maturity")}>
            <dt>Maturity Date</dt>
            <dd>Mar 08, 2027</dd>
          </div>
          <div className={`${own.priceRow} ${f("price")}`}>
            <div className={own.priceRowHead}>
              <dt>ETH alUSD Price</dt>
              <dd>{p.toFixed(3)} USDC</dd>
            </div>
            <input
              type="range"
              className={own.range}
              min={0.96}
              max={1}
              step={0.01}
              value={p}
              disabled={deposited || (!m.ready && !m.done)}
              aria-label="ETH alUSD Price"
              aria-valuetext={`${p.toFixed(3)} USDC`}
              style={{ "--fill": `${((p - 0.96) / 0.04) * 100}%` }}
              onChange={(e) => onSlide(Math.round(Number(e.target.value) * 100) / 100)}
            />
            <div className={own.ticks}>
              {PRICES.map((v) => (
                <span key={v}>{v.toFixed(2)}</span>
              ))}
            </div>
          </div>
          <div className={moved && !deposited ? `${own.cardRow} ${own.rowHeld}` : f("output")}>
            <dt>Expected Output</dt>
            <dd>
              5,000.00 USDC
              <span className={app.was} style={{ visibility: moved ? "visible" : "hidden" }}>
                one USDC per alUSD
              </span>
            </dd>
          </div>
          <div className={f("percent")}>
            <dt>Percentage Return</dt>
            <dd>{fig.percent.toFixed(2)}%</dd>
          </div>
          <div className={f("gain")}>
            <dt>Asset Gain</dt>
            <dd>{f2(fig.gain)} USDC</dd>
          </div>
        </dl>
        <div className={`${app.fixedAmount} ${f("amount")}`}>
          <AppInput
            token="alUSD"
            amount={deposited ? "" : String(ALUSD)}
            balance={wallet}
            prevBalance={deposited ? dep.before.walletAl ?? 0 : null}
            digits={2}
            label="alUSD to deposit"
          />
          <AppButton
            disabled={!dep.ready || !atPrice}
            hint={depositHint}
            onClick={() => dep.apply({ ...dep.position, walletAl: (dep.position.walletAl ?? 0) - ALUSD, fixedYield: (dep.position.fixedYield ?? 0) + ALUSD })}
          >
            Deposit
          </AppButton>
        </div>
      </section>
    </Stage>
  );
}
FixedYieldPriceCard.moment = "price";
FixedYieldPriceCard.hint = "Move the alUSD price";

/* ── Page 3: what a card will take ───────────────────────── */

const CAP = 2_400_000;
const FREED = 100_000;
/** The app's compact figure: one decimal, truncated ("2.3M"). */
const compact = (n) => `${(Math.floor((n / 1e6) * 10 + 1e-6) / 10).toFixed(1)}M`;

/**
 * The practice card again, now full, headed as page 2's card and the app's
 * are (the two icons, then "USDC" with the Projected Fixed APR): the
 * Deposit Cap row with its (i) tooltip, which
 * reads Available space. Opening the tooltip, then pressing Mark matured
 * deposits, is one moment: 100,000 alUSD that finished vesting drops out of
 * the first figure, the bar shrinks, and the tooltip reads the room. The
 * position does not change.
 */
export function CapRoom() {
  const m = useMoment("cap");
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(m.done);
  const [play, setPlay] = useState(0);
  const [freed, setFreed] = useState(m.done);
  const [chip, setChip] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (m.done) {
      setSeen(true);
      setFreed(true);
    }
  }, [m.done]);
  useMomentNote("cap", m.ready && !seen ? "Open Available space" : m.ready && seen && !freed ? "Press Mark matured deposits" : null);
  const total = freed ? CAP - FREED : CAP;
  const shown = useTween(total, play, 800);
  const shownRoom = CAP - shown;
  const wash = useChanged(total, play);
  const alUsdIcon = useBaseUrl(iconPath("alUSD"));
  const usdcIcon = useBaseUrl(iconPath("USDC"));
  const toggle = () => {
    setOpen((o) => !o);
    if (m.ready && !seen) setSeen(true);
  };
  const mark = () => {
    setBusy(true);
    setChip(true);
    window.setTimeout(() => {
      setFreed(true);
      setPlay((x) => x + 1);
      window.setTimeout(() => {
        setChip(false);
        m.apply({ ...m.position });
      }, 1100);
    }, 900);
  };
  return (
    <>
    <Stage>
      <section className={`${app.frame} ${own.capCard}`} aria-label="Practice copy of a Fixed Yield card's Deposit Cap">
        <div>
          <div className={app.fixedHead}>
            <span className={app.fixedIcons}>
              <img src={alUsdIcon} alt="" width="40" height="40" />
              <img src={usdcIcon} alt="" width="40" height="40" />
            </span>
            <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
          </div>
          <div className={app.fixedApr}>USDC {cardAt(0.98).apr.toFixed(2)}%</div>
          <div className={app.fixedAprLabel}>Projected Fixed APR</div>
        </div>
        <div className={own.capChipRow}>
          <span className={`${own.freedChip} ${chip ? own.freedIn : ""}`} aria-hidden={chip ? undefined : true}>
            100,000 alUSD finished vesting
          </span>
        </div>
        <div className={`${own.capBox} ${seen ? own.rowLit : ""}`}>
          {wash ? <span key={wash} className={app.wash} aria-hidden="true" /> : null}
          <span className={app.capBar}>
            <i style={{ width: `${(shown / CAP) * 100}%`, transition: "none" }} />
          </span>
          <div className={own.capRow}>
            <span className={own.capLabel}>
              Deposit Cap
              <span className={own.tipWrap}>
                <button
                  type="button"
                  className={`${own.info} ${!seen && m.ready ? own.infoLit : ""}`}
                  aria-label="Deposit Cap: Available space"
                  aria-expanded={open}
                  onClick={toggle}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpen(false);
                  }}
                >
                  i
                </button>
                {open ? (
                  <span className={own.tip} role="tooltip">
                    Available space: {f2(shownRoom)} alUSD
                  </span>
                ) : null}
              </span>
            </span>
            <b className={own.capFigure}>
              {compact(shown)}/{compact(CAP)} alUSD
            </b>
          </div>
        </div>
        <dl className={app.fixedRows}>
          <div>
            <dt>Term</dt>
            <dd>4 Months</dd>
          </div>
        </dl>
        <div className={own.capAction}>
          <AppButton disabled>Deposit</AppButton>
          <span className={own.lessonCaption}>{freed ? "100,000 alUSD of space" : "No space left"}</span>
        </div>
      </section>
    </Stage>
      {/* Held in its place until the tooltip is open. Once pressed it folds
          away, so what is under the card slides up. After the stage, not
          inside it, for the reason given at PegCycle's control. */}
      <FoldAway show={!m.done && !freed && !busy}>
        <Hold show={seen}>
          <LessonControl disabled={!m.ready || !seen || busy} onClick={mark}>
            Mark matured deposits
          </LessonControl>
        </Hold>
      </FoldAway>
    </>
  );
}
CapRoom.moment = "cap";
CapRoom.hint = "Open Available space, then press Mark matured deposits";

/**
 * The live Ethereum alUSD card's Deposit Cap row with Available space open,
 * captured headless at 2x with no wallet on 2026-11-07 (it read 27,721.49 alUSD of room). Its own entry
 * here rather than in the kit's shared list of captures.
 */
const CAP_SHOT = {
  src: "/img/academy-fixed-yield-cap.png",
  size: [602, 384],
  alt: "The Deposit Cap row on a Fixed Yield card, with its Available space tooltip open",
};

export function CapTooltipShot({ children }) {
  return (
    <LocalShot shot={CAP_SHOT} column>
      {children}
    </LocalShot>
  );
}

/* ── Page 4: what a claim pays ───────────────────────────── */

/** The example MYT price (I1's): 1.25 USDC per MYT. */
const MYT_PRICE = 1.25;
// The Dashboard prints Profit in dollars (live bundle, 2026-11-10); it falls back to the token only when the price feed fails.
const ROW = { apr: "6.15%", end: "Mar 08, 2027", profit: "$100.00" };

/**
 * The Dashboard row with the claim window over it. The app opens the window
 * as a dialog over the page, and the course draws its other two windows
 * (Flash Repay, Self Liquidate) over their figure behind a scrim, so this
 * one opens the same way. The row is shorter than the window, so the row,
 * the scrim and the window share one grid cell: the figure is as tall as the
 * taller of them, and it eases to the window's height as the window eases
 * open (`GrowIn`) and back as it shuts. It takes the stage's width without
 * the stage's fit-to-room, so the window opening never zooms the row.
 */
function ClaimOver({ open, row, seconds, children }) {
  return (
    <div className={`${frame.stage} ${own.over}`}>
      {row}
      <div className={`${own.scrim} ${open ? own.scrimOn : ""}`} aria-hidden="true" />
      <div className={own.overWindow}>
        <GrowIn show={open} seconds={seconds}>
          <div className={own.overPad}>{children}</div>
        </GrowIn>
      </div>
    </div>
  );
}

/**
 * "Press Claim on your Fixed Yield position, then press Claim in the
 * window." The practice Dashboard's Open Fixed Yield Positions row on
 * Mar 08, 2027. Claim opens the app's claim window over the row; the
 * switch can be flipped first (off, the window reads the MYT amount). On
 * Claim the window closes, the row burns the 5,000 alUSD, and then the
 * practice wallet takes the payout.
 */
export function ClaimMoment() {
  const m = useMoment("claim");
  const [open, setOpen] = useState(false);
  const [usdc, setUsdc] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [burned, setBurned] = useState(m.done);
  const [play, setPlay] = useState(0);
  useEffect(() => {
    if (m.done) setBurned(true);
  }, [m.done]);
  useMomentNote("claim", m.ready && open ? "Press Claim in the dialog" : null);
  const deposit = burned ? 0 : ALUSD;
  const shownDeposit = useTween(deposit, play, 1200);
  const tookMyt = m.done ? (m.after.walletMyt ?? 0) > 0 : !usdc;
  const claim = () => {
    const p = m.position;
    const paidMyt = !usdc;
    setOpen(false);
    setBurned(true);
    setPlay((x) => x + 1);
    window.setTimeout(() => {
      m.apply(
        paidMyt
          ? { ...p, walletMyt: (p.walletMyt ?? 0) + ALUSD / MYT_PRICE, fixedYield: 0 }
          : { ...p, wallet: (p.wallet ?? 0) + ALUSD, fixedYield: 0 },
      );
    }, 1400);
  };
  return (
    <ClaimOver
      open={open}
      row={
        <AppFixedRow
          {...ROW}
          deposit={`${f2(shownDeposit)} alUSD`}
          date="Mar 08, 2027"
          lit={burned ? ["deposit"] : ["deposit", "end", "action"]}
          wallet={
            <div className={own.paidLine} style={burned ? undefined : { visibility: "hidden" }} aria-hidden={burned ? undefined : true}>
              <span>Claimed</span>
              <AppDelta tone="bad">5,000 alUSD burned</AppDelta>
              <AppDelta tone="good">{tookMyt ? "+4,000.00 MYT" : "+5,000.00 USDC"}</AppDelta>
            </div>
          }
          action={
            <AppButton disabled={!m.ready || open} lit={m.ready && !open} hint={m.ready || m.done ? null : NOT_READY} onClick={() => setOpen(true)}>
              {burned ? "Claimed" : "Claim"}
            </AppButton>
          }
        />
      }
    >
      <Window inPanel title="Claim Transmuted Assets" description="This will exit your fully matured transmuter position and claim your transmuted tokens.">
        <div className={own.windowRows}>
          <Dotted label="Receive Transmuted" lit>
            {usdc ? "5,000.00 USDC" : "4,000.00 MYT"}
          </Dotted>
          <div className={own.windowNote} style={{ visibility: flipped && !usdc ? "visible" : "hidden" }}>
            <AppDelta>at an example 1.25 USDC per MYT</AppDelta>
          </div>
        </div>
        <Switch
          on={usdc}
          label="Receive USDC upon claim"
          onChange={(v) => {
            setUsdc(v);
            setFlipped(true);
          }}
        />
        <div className={own.windowActions}>
          <AppButton lit onClick={claim}>
            Claim
          </AppButton>
        </div>
      </Window>
    </ClaimOver>
  );
}
ClaimMoment.moment = "claim";
ClaimMoment.hint = "Press Claim";

/* ── I8, last page: a claim while the vault is in bad debt ── */

/**
 * The Dashboard row for the bad-debt what-if: AppMock's AppFixedRow, drawn
 * here because the shared row's tag is fixed at "Practice" and this
 * position (5,000 alUSD on Fixed Yield) is not in the practice wallet. It
 * prints no Profit figure. The row's 100.00 USDC was the profit of a claim
 * paid in full, which this claim is not (it pays 4,500 against the 4,900
 * paid), and what the app's column reads while a vault is in bad debt has
 * not been checked, so the column is there, dimmed, with a dash.
 */
function WhatIfFixedRow({ deposit, note, action }) {
  // The shared row takes its tag since 2026-11-10, so this is the app's
  // table too: the column names over the position's row.
  return (
    <AppFixedRow
      tag="What if"
      label="Practice copy of the Dashboard's Open Fixed Yield Positions, as a what-if"
      apr="6.15%"
      end="Mar 08, 2027"
      deposit={deposit}
      profit={<>&ndash;</>}
      lit={["deposit", "action"]}
      wallet={note}
      action={action}
    />
  );
}

/**
 * Used by I8's bad-debt page (it sits there rather than in I7, so the reader
 * decides only after bad debt is taught). A what-if: 5,000 alUSD matured while the vault is in bad debt,
 * with backing at 90%. Claim opens the window over the row, which reads
 * 4,500.00 USDC and then the app's bad-debt notice, word for word; the
 * reader chooses Claim now or Wait under it. The position does not change.
 */
export function ShortClaimFigure() {
  const m = useMoment("bad-debt");
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [choice, setChoice] = useState(null);
  useMomentNote("bad-debt", m.ready && open ? "Choose Claim now or Wait" : null);
  const openWindow = () => {
    setOpen(true);
    window.setTimeout(() => setNotice(true), 1000);
  };
  // The text under the figure arrives once the window has shut (0.65 s).
  const pick = (c) => {
    setOpen(false);
    setChoice(c);
    window.setTimeout(() => m.apply({ ...m.position }), 800);
  };
  const claimed = choice === "now";
  const chose = choice === "now" || choice === "wait";
  return (
    <ClaimOver
      open={open}
      // With the notice this window is about twice the claim window's height, so it takes longer over it.
      seconds={0.65}
      row={
        <WhatIfFixedRow
          deposit={claimed ? "0.00 alUSD" : "5,000.00 alUSD"}
          note={
            <div className={own.paidLine} style={chose ? undefined : { visibility: "hidden" }} aria-hidden={chose ? undefined : true}>
              {choice === "wait" ? (
                <AppDelta>Still 5,000 alUSD. Claims pay in full once backing is restored.</AppDelta>
              ) : (
                <AppDelta tone="bad">Received 4,500 USDC; 5,000 alUSD burned</AppDelta>
              )}
            </div>
          }
          action={
            <AppButton disabled={!m.ready || open || chose} lit={m.ready && !open && !chose} hint={m.ready || m.done ? null : NOT_READY} onClick={openWindow}>
              {claimed ? "Claimed" : "Claim"}
            </AppButton>
          }
        />
      }
    >
      <>
        <Window inPanel title="Claim Transmuted Assets" description="This will exit your fully matured transmuter position and claim your transmuted tokens.">
          <div className={own.windowRows}>
            <Dotted label="Receive Transmuted" lit={!notice}>
              4,500.00 USDC
            </Dotted>
          </div>
          <div className={`${own.notice} ${notice ? own.noticeLit : ""}`}>
            <div className={own.noticeTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
              </svg>
              <span>System is in bad debt state</span>
            </div>
            <div>You have two options:</div>
            <ul>
              <li>Claim now (take a haircut on your claim amount)</li>
              <li>Wait to claim (hope that bad debt gets resolved)</li>
            </ul>
            <div>
              Claiming now means you get less than you would if the system was healthy. Waiting means you might get more later, but you
              risk further losses if the situation worsens.
            </div>
          </div>
        </Window>
        <div className={own.choiceRow}>
          <LessonControl disabled={!notice} onClick={() => pick("now")}>
            Claim now
          </LessonControl>
          <LessonControl disabled={!notice} onClick={() => pick("wait")}>
            Wait
          </LessonControl>
        </div>
      </>
    </ClaimOver>
  );
}
ShortClaimFigure.moment = "bad-debt";
ShortClaimFigure.hint = "Press Claim, then choose";
