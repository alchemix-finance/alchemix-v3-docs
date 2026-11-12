import React, { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import app from "../AppMock/styles.module.css";
import { AppButton, AppDelta, AppFrame, SLOW_TWEEN, isWhole, useAppContext, useReducedMotion, useTween, useWash } from "../AppMock";
import { AppShot, LessonControl } from "../kit";
import { useMoment } from "./position";
import { Stage } from "./index";
import { NOT_READY } from "./moments";
import own from "./styles.module.css";
import css from "./moments-i4.module.css";

/**
 * The practice moments and figures of intermediate lesson 4 (script I4,
 * "How your debt is earmarked and redeemed"), imported by
 * lessons/intermediate/i4EarmarkingAndCover.mdx, and the small parts that
 * lessons 5 and 6 (moments-i5, moments-i6) share with it.
 *
 * Every figure follows the beginner moments' rules (moments.jsx,
 * moments-3-8.jsx): one element per page that changes in place, a moment
 * written once with `apply`, nothing on load that moves, a change tweened
 * slowly (SLOW_TWEEN) with the copper wash, and the parts the text names lit.
 * A sequence that plays after a press records its moment when it ends, so the
 * text after it waits until the reader has watched the change.
 */

/* ── Shared parts (lessons 4 to 6) ───────────────────────── */

/** An amount as the strip prints it: no decimals when whole, two when not. */
export const fmt = (n, places = isWhole(n) ? 0 : 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places });

/** An amount cut (not rounded) to `places` decimals, as the app's formatNumber prints it. */
export const cut = (n, places = 2) => {
  const f = 10 ** places;
  // Rounded to a ten-thousandth of the last place first, so 4,999.99999... (a
  // division's float error) reads 5,000.00 and not 4,999.99.
  const v = Math.floor(Math.round(Number(n) * f * 1e4) / 1e4) / f;
  return v.toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places });
};

/**
 * A run of steps a press starts, `gap` ms apart: 0 before the press, then 1
 * to `total`. `onEnd` runs a beat after the last step, when its tweens have
 * had time to land. A figure whose moment is already done mounts at the last
 * step; under reduced motion the press goes straight there. Returns the step,
 * the press, and whether the run is playing.
 */
export function useSteps(total, gap, done, onEnd, tail = 1700) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(done ? total : 0);
  const [playing, setPlaying] = useState(false);
  const timers = useRef([]);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    if (done) setStep(total);
  }, [done, total]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const start = () => {
    if (step > 0 || playing) return;
    if (reduced) {
      setStep(total);
      end.current();
      return;
    }
    setPlaying(true);
    setStep(1);
    for (let i = 2; i <= total; i++) timers.current.push(window.setTimeout(() => setStep(i), gap * (i - 1)));
    timers.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        end.current();
      }, gap * (total - 1) + tail),
    );
  };
  return [step, start, playing];
}

/** True for `ms` after `key` changes to a new truthy value: a part held lit after a change. */
export function useHold(key, ms = 2000) {
  const [on, setOn] = useState(false);
  const last = useRef(key);
  useEffect(() => {
    if (key === last.current) return undefined;
    last.current = key;
    if (!key) return undefined;
    setOn(true);
    const t = window.setTimeout(() => setOn(false), ms);
    return () => window.clearTimeout(t);
  }, [key, ms]);
  return on;
}

/** A number that tweens when `play` changes with it, and follows a slider otherwise. */
export function Num({ value, play, places, format, ms = SLOW_TWEEN }) {
  const shown = useTween(value, play, ms);
  const p = places ?? (isWhole(value) ? 0 : 2);
  return <>{format ? format(shown) : fmt(shown, p)}</>;
}

/** Whether `value` changed on the last render, for a wash keyed on `play`. */
function useChanged(value) {
  const was = useRef(value);
  const changed = Math.abs((was.current ?? 0) - (value ?? 0)) > 0.004;
  useEffect(() => {
    was.current = value;
  }, [value]);
  return changed;
}

/**
 * A label over a value in a figure's panel ("Cover 5,000 alUSD"). `id` is the
 * name a `Stat` in the text points with. `on` outlines it in copper; `note`
 * is the line under the value, kept so a chip arriving moves nothing.
 */
export function Fig({ id, label, value, unit = "", play, on = false, note = null, keepNote = true, places, format, wash = true, className = "", ms }) {
  const { stat } = useAppContext();
  const changed = useChanged(typeof value === "number" ? value : 0);
  const washKey = useWash(wash, play, changed);
  const pointed = id != null && stat === id;
  return (
    <div className={`${css.fig} ${on ? css.on : ""} ${pointed ? css.pointed : ""} ${className}`} data-fig={id ?? undefined}>
      {washKey ? <span key={washKey} className={app.wash} aria-hidden="true" /> : null}
      <span className={css.figLabel}>{label}</span>
      <span className={css.figValue}>
        {typeof value === "number" ? <Num value={value} play={play} places={places} format={format} ms={ms} /> : value}
        {unit ? ` ${unit}` : ""}
      </span>
      {keepNote || note ? <span className={css.figNote}>{note}</span> : null}
    </div>
  );
}

const ICON = { deposit: "deposited", debt: "debt" };

/**
 * One of the vault's stat tiles, drawn as the practice vault draws them
 * (AppMock's tile), for a figure that changes them one at a time. `k` is the
 * tile's name for a `Stat` in the text ("deposit", "debt", "earmarked", "ltv").
 */
export function Tile({ k, label, value, unit, play, on = false, note = null, ahead = null, places, format, wash = true, icon = true }) {
  const { stat } = useAppContext();
  const src = useBaseUrl(`/img/academy-app/${ICON[k] ?? "deposited"}.svg`);
  const changed = useChanged(typeof value === "number" ? value : 0);
  const washKey = useWash(wash, play, changed);
  const pointed = stat === k;
  return (
    <div className={`${app.tile} ${on || pointed ? app.tileOn : ""} ${pointed ? app.pointed : ""}`} data-tile={k}>
      {washKey ? <span key={washKey} className={app.wash} aria-hidden="true" /> : null}
      {icon && ICON[k] ? <img src={src} alt="" className={app.tileIcon} width="40" height="40" /> : null}
      <div className={app.tileText}>
        <div className={app.tileLabel}>{label}</div>
        <div className={app.tileValue}>
          {typeof value === "number" ? <Num value={value} play={play} places={places} format={format} /> : value}
          {unit ? ` ${unit}` : ""}
        </div>
        <div className={app.tileNote}>
          {ahead != null ? (
            // The app's projected value while an amount is typed (ProjectedValue.tsx).
            <span className={`${app.ahead} ${app.bad}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {ahead}
            </span>
          ) : (
            note
          )}
        </div>
      </div>
    </div>
  );
}

export function Tiles({ per, children }) {
  return (
    <div className={app.stats} style={{ "--app-tiles": per ?? React.Children.count(children) }}>
      {children}
    </div>
  );
}

/**
 * A slider in the app's colors, with labeled ticks under it. `ticks` are
 * `{ at, label }` on the slider's own scale; `head` is the value it reads.
 */
export function TimeSlider({ label, value, min, max, step, onChange, disabled = false, ticks = [], head = null, lit = false, aria }) {
  const pct = (v) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className={css.sliderRow}>
      <div className={css.sliderHead}>
        <span>{label}</span>
        {head ? <b>{head}</b> : null}
      </div>
      <input
        type="range"
        className={`${css.slider} ${lit ? css.sliderLit : ""}`}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={aria ?? label}
        aria-valuetext={head ?? undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {ticks.length ? (
        <div className={css.ticks} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t.label} style={{ left: pct(t.at) }}>
              {t.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A chip that travels from one part of a figure to another ("6,000 USDC"
 * leaving B's row and arriving at the Transmuter as "4,800 MYT"). `box` is the
 * figure's own box (position: relative), `from` and `to` the two parts. It
 * reads `a` for the first half of the trip and `b` for the rest, and is gone
 * when it lands, where the figure draws the chip in its place. The stage may
 * be zoomed to fit the window, so measured distances are scaled back to the
 * box's own pixels.
 */
export function Flyer({ box, from, to, a, b, run, ms = 1000 }) {
  const reduced = useReducedMotion();
  const [st, setSt] = useState(null);
  useEffect(() => {
    if (!run || reduced || !box.current || !from.current || !to.current) return undefined;
    const B = box.current.getBoundingClientRect();
    const z = B.width / (box.current.offsetWidth || B.width) || 1;
    const at = (el) => {
      const r = el.getBoundingClientRect();
      return { x: (r.left - B.left) / z, y: (r.top - B.top) / z };
    };
    const p0 = at(from.current);
    const p1 = at(to.current);
    setSt({ ...p0, text: a });
    let raf = window.requestAnimationFrame(() => {
      raf = window.requestAnimationFrame(() => setSt({ ...p1, text: a }));
    });
    const t1 = window.setTimeout(() => setSt((s) => (s ? { ...s, text: b } : s)), ms / 2);
    const t2 = window.setTimeout(() => setSt(null), ms + 60);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
  if (!st) return null;
  return (
    <span className={css.flyer} style={{ transform: `translate(${st.x}px, ${st.y}px)`, transitionDuration: `${ms}ms` }} aria-hidden="true">
      {st.text}
    </span>
  );
}

/**
 * A real capture of the app that the kit's SHOTS does not carry, the width of
 * the stage, with its caption as its foot: the frame's `Shot`, composed here
 * so a lesson can bring its own capture.
 */
export function Capture({ shot, children }) {
  return (
    <Stage>
      <div className={own.shot}>
        <AppShot shot={shot} label={null}>
          {children}
        </AppShot>
      </div>
    </Stage>
  );
}

/* ── Lesson 4: the practice vault ────────────────────────── */

/** Borrowers' debt in the practice vault: 120,000 in all. */
const ROWS = [
  { key: "you", name: "You", debt: 5_000 },
  { key: "b", name: "Borrower B", debt: 24_000 },
  { key: "others", name: "Other borrowers", debt: 91_000 },
];
const TOTAL = 120_000;
const DEPOSIT = 10_000;
/** The deposit on the Fixed Yield page: 20,000 alUSD over 4 months, 5,000 a month. */
const FIXED = 20_000;
const MONTHLY = 5_000;
const FEE = 0.0025;
/** Your share of each month's earmark, 5,000 x 5,000 / 120,000. */
const YOUR_MONTH = (MONTHLY * 5_000) / TOTAL;

/** The days in each month of the term, Nov 04 to Mar 04. */
const MONTH_DAYS = [30, 31, 31, 28];
const DAY = 86_400_000;

/** The date at `months` into the term (0 to 4), each month a quarter of the slider. */
function dateAt(months) {
  const i = Math.min(Math.floor(months + 1e-9), 4);
  const days = i < 4 ? Math.round((months - i) * MONTH_DAYS[i]) : 0;
  return new Date(Date.UTC(2026, 10 + i, 4) + days * DAY).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
}

/**
 * The practice vault the lesson follows, top to bottom: the Transmuter, the
 * vault's borrowers, and your position. `children` is the control under it.
 */
function Board({ box, transmuter, total, earmarked, rows, litCol = false, play, stats, children, flyer = null }) {
  return (
    <Stage>
      <div className={css.board} ref={box}>
        <AppFrame title="Risk-adjusted Mix USDC" tag="Practice" strong>
          <div className={css.panel}>
            <div className={css.panelHead}>
              <span className={css.panelName}>Transmuter</span>
            </div>
            {transmuter}
          </div>
          <div className={css.panel}>
            <div className={css.panelHead}>
              <span className={css.panelName}>Vault</span>
              <span className={css.panelNote}>
                Total Debt <b><Num value={total} play={play} /></b> alUSD · Earmarked <b><Num value={earmarked} play={play} /></b> alUSD
              </span>
            </div>
            <div className={css.tableWrap}>
              <table className={css.table}>
                <thead>
                  <tr>
                    <th scope="col">Borrower</th>
                    <th scope="col">Debt</th>
                    <th scope="col" className={litCol ? css.colOn : undefined}>Earmarked</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className={r.key === "you" ? css.rowYou : undefined}>
                      <td>
                        <span ref={r.ref}>{r.name}</span>
                        {r.chips ? <span className={css.cellChips}>{r.chips}</span> : null}
                      </td>
                      <td>
                        <Num value={r.debt} play={play} />
                      </td>
                      <td className={litCol ? css.colOn : undefined}>
                        {r.after ?? null}
                        <Num value={r.earmarked} play={play} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={css.panel}>
            <div className={css.panelHead}>
              <span className={css.panelName}>Your position</span>
            </div>
            <Tiles per={3}>
              <Tile k="deposit" label="Deposit" unit="USDC" value={stats.deposit} play={play} on={stats.lit?.includes("deposit")} note={stats.notes?.deposit} />
              <Tile k="debt" label="Debt" unit="alUSD" value={stats.debt} play={play} on={stats.lit?.includes("debt")} note={stats.notes?.debt} />
              <Tile k="earmarked" label="Earmarked" unit="alUSD" value={stats.earmarked} play={play} on={stats.lit?.includes("earmarked")} note={stats.notes?.earmarked} />
            </Tiles>
            {/* Room kept for the chips a change leaves, so their arrival moves nothing. */}
            {stats.chips !== undefined ? <div className={css.chipRow}>{stats.chips}</div> : null}
          </div>
          {children}
        </AppFrame>
        {flyer}
      </div>
    </Stage>
  );
}

/* ── Page 1: the deposit vests ───────────────────────────── */

const TERM_TICKS = [0, 1, 2, 3, 4].map((at) => ({ at, label: dateAt(at).replace(/, \d{4}$/, "") }));

/**
 * "Drag through the term to follow the deposit as it vests." The Transmuter
 * with the one deposit, a slider from Nov 04 to Mar 04, and the vested bar
 * filling a block's slice at a time. Done when the slider reaches Mar 04; the
 * practice wallet does not change.
 */
export function VestingFigure() {
  const m = useMoment("vest");
  const [v, setV] = useState(m.done ? 4 : 0);
  useEffect(() => {
    if (m.done) setV(4);
  }, [m.done]);
  const move = (x) => {
    setV(x);
    if (x >= 4 - 1e-9 && m.ready) m.apply({ ...m.position });
  };
  const vested = MONTHLY * v;
  return (
    <Stage>
      <section className={app.frame} aria-label="Practice copy of the Transmuter's schedule for one Fixed Yield deposit">
        <div className={css.head}>
          <div className={css.headText}>
            <div className={css.headName}>Transmuter</div>
            <div className={css.headSub}>Fixed Yield deposit · 20,000 alUSD · Term 4 months · Nov 04, 2026 to Mar 04, 2027</div>
          </div>
          <div className={css.headRight}>
            <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
          </div>
        </div>
        <div className={css.panel}>
          <div className={`${css.readout} ${css.on}`} data-fig="vested">
            <span>Vested</span>
            <b>{fmt(Math.round(vested), 0)}</b>
            <span>of 20,000 alUSD</span>
          </div>
          <div className={`${css.vestTrack} ${css.boxOn}`} role="img" aria-label={`Vested ${fmt(Math.round(vested), 0)} of 20,000 alUSD`}>
            <span className={css.vestFill} style={{ width: `${(v / 4) * 100}%` }} />
            <span className={css.vestMarks}>
              {[1, 2, 3].map((i) => (
                <span key={i} style={{ left: `${i * 25}%` }} />
              ))}
            </span>
          </div>
        </div>
        <TimeSlider
          label="Date"
          head={dateAt(v)}
          value={v}
          min={0}
          max={4}
          step={0.025}
          onChange={move}
          disabled={!m.ready && !m.done}
          ticks={TERM_TICKS}
          lit={!m.done}
          aria="Date in the deposit's term"
        />
      </section>
    </Stage>
  );
}
VestingFigure.moment = "vest";
VestingFigure.hint = "Drag the slider to Mar 04";

/* ── Page 2: the first month's earmark ───────────────────── */

/**
 * "Drag through the first month." As 5,000 vests, each borrower's Earmarked
 * grows by the same share of their debt; your Deposit and Debt stay put and
 * say so at the end. Done at Dec 04, when the strip's Earmarked reads 208.33.
 */
export function EarmarkFigure() {
  const m = useMoment("month-1");
  const [s, setS] = useState(m.done ? 1 : 0);
  useEffect(() => {
    if (m.done) setS(1);
  }, [m.done]);
  const hold = useHold(m.done ? "done" : null);
  const move = (x) => {
    setS(x);
    if (x >= 1 - 1e-9 && m.ready) m.apply({ ...m.position, earmarked: YOUR_MONTH });
  };
  const vested = MONTHLY * s;
  const rows = ROWS.map((r) => ({ ...r, earmarked: (vested * r.debt) / TOTAL }));
  const unchanged = m.done ? <AppDelta>unchanged</AppDelta> : null;
  return (
    <Board
      transmuter={
        <div className={css.figs}>
          <Fig label="Vesting" value={FIXED} unit="alUSD" play={0} keepNote={false} />
          <Fig id="vested" label="Vested this month" value={vested} unit="alUSD" play={0} on keepNote={false} format={(n) => fmt(Math.round(n), 0)} />
        </div>
      }
      total={TOTAL}
      earmarked={vested}
      rows={rows}
      litCol
      play={0}
      stats={{
        deposit: DEPOSIT,
        debt: 5_000,
        earmarked: (vested * 5_000) / TOTAL,
        lit: hold ? ["deposit", "debt", "earmarked"] : ["earmarked"],
        notes: { deposit: unchanged, debt: unchanged },
      }}
    >
      <TimeSlider
        label="Date"
        head={dateAt(s)}
        value={s}
        min={0}
        max={1}
        step={0.01}
        onChange={move}
        disabled={!m.ready && !m.done}
        ticks={[
          { at: 0, label: "Nov 04" },
          { at: 1, label: "Dec 04" },
        ]}
        lit={!m.done}
        aria="Date in the first month"
      />
    </Board>
  );
}
EarmarkFigure.moment = "month-1";
EarmarkFigure.hint = "Drag the slider to Dec 04";

/* ── Page 3: cover ───────────────────────────────────────── */

/** The vault on Dec 04, after the first month: what page 3 starts from. */
const DEC = ROWS.map((r) => ({ ...r, earmarked: (MONTHLY * r.debt) / TOTAL }));
const B_REPAYS = 6_000;
const B_EARMARKED = (MONTHLY * 24_000) / TOTAL;
/** The example MYT price the lesson states on the cover page: 1 MYT = 1.25 USDC. */
const MYT_PRICE = 1.25;

/**
 * "Press B repays 6,000." Four changes 1.2 s apart: the USDC leaves B's row
 * and reaches the Transmuter as 4,800 MYT (at the example 1.25); B's earmark
 * is settled (with the fee);
 * B's Debt and the vault's totals fall; the rest becomes cover. Your row and
 * stats do not move. Then a slider through the second month: what vests is
 * settled from cover, and every Earmarked stays where it is.
 */
export function CoverFigure() {
  const pay = useMoment("b-repays");
  const mo = useMoment("month-2");
  const box = useRef(null);
  const fromB = useRef(null);
  const toT = useRef(null);
  const [step, start, playing] = useSteps(4, 1200, pay.done, () => {
    if (!pay.done) pay.apply({ ...pay.position });
  });
  const [s, setS] = useState(mo.done ? 1 : 0);
  useEffect(() => {
    if (mo.done) setS(1);
  }, [mo.done]);
  const hold = useHold(mo.done ? "done" : null);
  const move = (x) => {
    setS(x);
    if (x >= 1 - 1e-9 && mo.ready) mo.apply({ ...mo.position });
  };
  const rows = DEC.map((r) =>
    r.key === "b"
      ? {
          ...r,
          debt: step >= 3 ? 24_000 - B_REPAYS : 24_000,
          earmarked: step >= 2 ? 0 : B_EARMARKED,
          ref: fromB,
          chips: step >= 2 ? <AppDelta>fee 2.50 from B's deposit</AppDelta> : null,
        }
      : r.key === "you" && mo.done
        ? { ...r, after: <span className={css.ghost} style={{ marginRight: "0.5rem" }}>417 without cover</span> }
        : r,
  );
  const coverStart = step >= 4 ? B_REPAYS - B_EARMARKED : 0;
  const cover = pay.done ? coverStart * (1 - s) : coverStart;
  const vested = pay.done ? MONTHLY * s : 0;
  return (
    <Board
      box={box}
      transmuter={
        <>
          <div className={css.figs}>
            <Fig id="vestedMonth" label="Vested this month" value={vested} unit="alUSD" play={step} on={pay.done && !mo.done} keepNote={false} format={(n) => fmt(Math.round(n), 0)} />
            <Fig id="mytHeld" label="MYT held" value={step >= 1 ? B_REPAYS / MYT_PRICE : 0} unit="MYT" play={step} keepNote={false} />
            <Fig id="cover" label="Cover" value={cover} unit="alUSD" play={step} on={step >= 4} keepNote={false} format={(n) => fmt(Math.round(n), 0)} />
          </div>
          {/* Where the repayment lands, held in place until it does. */}
          <div className={css.position} ref={toT} style={{ minHeight: "1.5rem" }}>
            {step === 1 ? <AppDelta>4,800 MYT</AppDelta> : null}
            {step >= 2 ? <AppDelta>800 MYT settles B's earmark</AppDelta> : null}
            {step >= 4 ? <AppDelta>4,000 MYT becomes 5,000 of cover</AppDelta> : step >= 2 ? <AppDelta>4,000 MYT</AppDelta> : null}
          </div>
        </>
      }
      total={step >= 3 ? TOTAL - B_REPAYS : TOTAL}
      earmarked={step >= 3 ? MONTHLY - B_EARMARKED : MONTHLY}
      rows={rows}
      play={step}
      stats={{
        deposit: DEPOSIT,
        debt: 5_000,
        earmarked: YOUR_MONTH,
        lit: hold ? ["earmarked"] : [],
      }}
      flyer={<Flyer box={box} from={fromB} to={toT} a="6,000 USDC" b="4,800 MYT" run={step >= 1 && !pay.done} />}
    >
      <div className={css.slot}>
        {!pay.done ? (
          <LessonControl disabled={!pay.ready || playing} hint={pay.ready || playing ? null : NOT_READY} onClick={start}>
            B repays 6,000
          </LessonControl>
        ) : (
          <TimeSlider
            label="Date"
            head={dateAt(1 + s)}
            value={s}
            min={0}
            max={1}
            step={0.01}
            onChange={move}
            disabled={!mo.ready && !mo.done}
            ticks={[
              { at: 0, label: "Dec 04" },
              { at: 1, label: "Jan 04" },
            ]}
            lit={!mo.done}
            aria="Date in the second month"
          />
        )}
      </div>
    </Board>
  );
}
CoverFigure.moment = "b-repays";
CoverFigure.hint = "Press B repays 6,000";

/* ── Page 4: the claim ───────────────────────────────────── */

/** Each borrower's earmark on the maturity date: four months of 5,000, 20,000 in all. */
const MAR = ROWS.map((r) => ({ ...r, earmarked: (FIXED * r.debt) / TOTAL }));
const YOUR_TERM = (FIXED * 5_000) / TOTAL;

/**
 * "Press Claim on their Fixed Yield position." Four changes 1.2 s apart: the
 * Transmuter, holding no MYT, asks the vault to redeem 20,000; every earmark
 * is canceled with the same amount of debt; your Deposit pays your 833.33 and
 * the fee; the MYT reaches the depositor as USDC and their alUSD and NFT are
 * burned. The strip moves when the sequence ends.
 */
export function ClaimFigure() {
  const m = useMoment("claim");
  const box = useRef(null);
  const fromT = useRef(null);
  const toD = useRef(null);
  const [step, start, playing] = useSteps(4, 1200, m.done, () => {
    if (!m.done) m.apply({ ...m.position, deposit: DEPOSIT - YOUR_TERM * (1 + FEE), debt: 5_000 - YOUR_TERM, earmarked: 0 });
  });
  const rows = MAR.map((r) => ({
    ...r,
    debt: step >= 2 ? r.debt - r.earmarked : r.debt,
    earmarked: step >= 2 ? 0 : r.earmarked,
  }));
  const gone = step >= 4;
  return (
    <Board
      box={box}
      transmuter={
        <>
          <div className={css.figs}>
            <Fig label="Vested" value={FIXED} unit="alUSD" play={step} keepNote={false} />
            <Fig id="mytHeld" label="MYT held" value={0} unit="MYT" play={step} on={step >= 1 && step < 4} keepNote={false} />
            <div ref={fromT} className={`${css.arrow} ${step >= 1 ? css.appear : css.held}`} aria-hidden={step >= 1 ? undefined : true}>
              <span>redeem 20,000 from the vault</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </div>
          </div>
          <div className={css.position}>
            <span className={css.panelNote}>Depositor's Fixed Yield position</span>
            <span className={gone ? css.fadeOut : undefined}>
              <AppDelta>20,000 alUSD</AppDelta>
            </span>
            <span className={`${css.nft} ${gone ? css.fadeOut : ""}`}>
              <i />
              Fixed Yield NFT
            </span>
            <span className={`${css.burned} ${gone ? css.appear : css.held}`} aria-hidden={gone ? undefined : true}>
              burned
            </span>
            <span ref={toD} style={{ minWidth: "10rem" }}>
              {gone ? (
                <span className={css.appear}>
                  <AppDelta tone="good">+20,000 USDC to the depositor</AppDelta>
                </span>
              ) : null}
            </span>
            <span className={css.positionAction}>
              <AppButton disabled={!m.ready || playing || m.done} hint={m.done ? null : !m.ready ? NOT_READY : null} lit={!m.done && !playing && step === 0} onClick={start}>
                {m.done ? "Claimed" : "Claim"}
              </AppButton>
            </span>
          </div>
        </>
      }
      total={step >= 2 ? TOTAL - FIXED : TOTAL}
      earmarked={step >= 2 ? 0 : FIXED}
      rows={rows}
      litCol={!m.done}
      play={step}
      stats={{
        deposit: step >= 3 ? DEPOSIT - YOUR_TERM * (1 + FEE) : DEPOSIT,
        debt: step >= 2 ? 5_000 - YOUR_TERM : 5_000,
        earmarked: step >= 2 ? 0 : YOUR_TERM,
        lit: step >= 2 ? ["deposit", "debt", "earmarked"] : ["earmarked"],
        chips:
          step >= 3 ? (
            <span className={css.appear}>
              <span className={css.panelNote}>Deposit</span> <AppDelta>833.33 to the Transmuter</AppDelta> <AppDelta>2.08 redemption fee</AppDelta>
            </span>
          ) : null,
      }}
      flyer={<Flyer box={box} from={fromT} to={toD} a="16,000 MYT" b="20,000 USDC" run={step >= 4 && !m.done} />}
    />
  );
}
ClaimFigure.moment = "claim";
ClaimFigure.hint = "Press Claim to continue";

/* ── Page 5: the Earmarking tab ──────────────────────────── */

/**
 * The Earmarking tab on the live USDC vault, hovered on a day whose tooltip
 * splits Matured into Absorbed by cover and Earmarked (`pnpm capture:app
 * static/img earmarking-hover`, no wallet). The size is the capture's.
 */
const EARMARK_SHOT = {
  src: "/img/academy-earmarking-hover.png",
  size: [2000, 888],
  // On a phone, the day's tooltip with the bars beside it.
  narrow: {
    crop: { x: 1330 / 2000, y: 395 / 888, w: 560 / 2000, h: 320 / 888 },
    alt: "One day's tooltip on the Earmarking tab: Earmarking rate 0.00%, Gross (before cover), Matured, Absorbed by cover and Earmarked",
  },
  alt: "The Earmarking tab on a vault: the Earmarking Rate heading and its description, and the last 30 days of bars with one day's tooltip showing Earmarking rate, Gross (before cover), Matured, Absorbed by cover and Earmarked",
};

export function EarmarkingTabShot({ children }) {
  return <Capture shot={EARMARK_SHOT}>{children}</Capture>;
}
