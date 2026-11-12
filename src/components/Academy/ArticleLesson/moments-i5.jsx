import React, { useEffect, useRef, useState } from "react";
import app from "../AppMock/styles.module.css";
import { AppTabs, INFO_TABS, useReducedMotion } from "../AppMock";
import { LessonControl } from "../kit";
import useElementWidth from "../lib/useElementWidth";
import { useMoment } from "./position";
import { Stage } from "./index";
import { NOT_READY } from "./moments";
import { Capture, Fig, Flyer, Num, TimeSlider, cut, fmt, useSteps } from "./moments-i4";
import base from "./moments-i4.module.css";
import css from "./moments-i5.module.css";

/**
 * The practice moments and figures of intermediate lesson 5 (script I5,
 * "What sets the Redemption Rate"), imported by
 * lessons/intermediate/i5RedemptionRate.mdx. Every figure is a what-if on a
 * copy of the vault or a projection, so none of them changes the practice
 * wallet: each moment is written with the position as it was.
 *
 * The practice vault (script I5, front matter): 5,000 alUSD of Fixed Yield
 * deposits a month on a 4-month term, so 20,000 open and one 5,000 deposit
 * maturing in each of the next four months; borrowers owe 120,000; no cover
 * at the start; alUSD 0.98; the vault's APR 5%.
 */

const DAY = 86_400_000;

/** A part held lit for `ms` after its value changes (never on the first render). */
function useChangeLit(value, ms = 2000) {
  const [on, setOn] = useState(false);
  const last = useRef(value);
  useEffect(() => {
    if (last.current === value) return undefined;
    last.current = value;
    setOn(true);
    const t = window.setTimeout(() => setOn(false), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return on;
}

/** A progress from 0 to 1 over `ms`, started by `run()`; 1 at rest. */
function useDraw(ms = 1500) {
  const reduced = useReducedMotion();
  const [p, setP] = useState(1);
  const raf = useRef(0);
  useEffect(() => () => window.cancelAnimationFrame(raf.current), []);
  const run = (onEnd) => {
    window.cancelAnimationFrame(raf.current);
    if (reduced) {
      setP(1);
      if (onEnd) onEnd();
      return;
    }
    const t0 = performance.now();
    setP(0);
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      setP(t);
      if (t < 1) raf.current = window.requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    };
    raf.current = window.requestAnimationFrame(tick);
  };
  return [p, run];
}

/** A what-if frame: the app's ground, "What if" where the vault's name sits, and the Practice tag. */
function WhatIf({ aria, children }) {
  return (
    <section className={app.frame} aria-label={`Practice what-if: ${aria}`}>
      <div className={base.head}>
        <div className={base.whatIf}>What if</div>
        <div className={base.headRight}>
          <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

/* ── Page 1: what moves the rate ─────────────────────────── */

const pctText = (r) => `${fmt(r * 100, 2)}%`;

/**
 * "Move Queue to 40,000." "Now pick a 2-month term." "Now move Total Debt to
 * 240,000." Three controls feed the rate: a year of vesting (the queue over
 * the term in years) divided by Total Debt. The working line under the rate
 * shows the app's calculation, a week's vesting times 52, and each part that
 * changed is lit for 2 s. The controls open one at a time, in the text's
 * order, and are all free once the three are done.
 */
export function RateInputsFigure() {
  const q = useMoment("queue");
  const t = useMoment("term");
  const d = useMoment("debt");
  const all = q.done && t.done && d.done;
  const [queue, setQueue] = useState(20_000);
  const [term, setTerm] = useState(4);
  const [debt, setDebt] = useState(120_000);
  const [play, setPlay] = useState(0);
  // A page loaded with the moments done shows their state.
  useEffect(() => {
    if (q.done) setQueue((v) => (v === 20_000 ? 40_000 : v));
  }, [q.done]);
  useEffect(() => {
    if (t.done) setTerm((v) => (v === 4 ? 2 : v));
  }, [t.done]);
  useEffect(() => {
    if (d.done) setDebt((v) => (v === 120_000 ? 240_000 : v));
  }, [d.done]);
  const yearly = (queue * 12) / term;
  const weekly = yearly / 52;
  const rate = yearly / debt;
  const litWeek = useChangeLit(Math.round(weekly));
  const litYear = useChangeLit(Math.round(yearly));
  const litDebt = useChangeLit(debt);
  const litRate = useChangeLit(Math.round(rate * 10_000));
  const canQ = q.ready || all;
  const canT = t.ready || all;
  const canD = d.ready || all;
  const onQueue = (v) => {
    setQueue(v);
    setPlay((p) => p + 1);
    if (q.ready && v === 40_000) q.apply({ ...q.position });
  };
  const onTerm = (v) => {
    setTerm(v);
    setPlay((p) => p + 1);
    if (t.ready && v === 2) t.apply({ ...t.position });
  };
  const onDebt = (v) => {
    setDebt(v);
    setPlay((p) => p + 1);
    if (d.ready && v === 240_000) d.apply({ ...d.position });
  };
  const part = (lit, text) => <span className={`${css.part} ${lit ? css.partLit : ""}`}>{text}</span>;
  return (
    <Stage>
      <WhatIf aria="three things that move the Redemption Rate">
        <div className={css.inputs}>
          <div className={`${css.control} ${q.ready ? base.on : ""}`}>
            <TimeSlider
              label="Queue"
              head={`${fmt(queue)} alUSD`}
              value={queue}
              min={10_000}
              max={80_000}
              step={10_000}
              onChange={onQueue}
              disabled={!canQ}
              ticks={[
                { at: 10_000, label: "10,000" },
                { at: 80_000, label: "80,000" },
              ]}
              aria="Queue"
            />
          </div>
          <div className={`${css.control} ${t.ready ? base.on : ""}`}>
            <div className={css.controlHead}>
              <span>Term</span>
              <b>{term === 1 ? "1 month" : `${term} months`}</b>
            </div>
            <div className={css.segs} role="radiogroup" aria-label="Term">
              {[1, 2, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={term === n}
                  className={`${css.seg} ${term === n ? css.segOn : ""}`}
                  disabled={!canT}
                  onClick={() => onTerm(n)}
                >
                  {n === 1 ? "1 month" : `${n} months`}
                </button>
              ))}
            </div>
          </div>
          <div className={`${css.control} ${d.ready ? base.on : ""}`}>
            <TimeSlider
              label="Total Debt"
              head={`${fmt(debt)} alUSD`}
              value={debt}
              min={60_000}
              max={240_000}
              step={60_000}
              onChange={onDebt}
              disabled={!canD}
              ticks={[
                { at: 60_000, label: "60,000" },
                { at: 240_000, label: "240,000" },
              ]}
              aria="Total Debt"
            />
          </div>
          <div className={css.rateBox} data-fig="redemptionRate">
            <span className={css.rateLabel}>Redemption Rate</span>
            <span className={css.rateValue}>
              <Num value={rate * 100} play={play} format={(n) => `${fmt(n, 2)}%`} />
            </span>
            {/* Each term keeps its sign, so the line breaks between whole terms
                ("÷ 240,000" starts a line) and never inside one. */}
            <span className={css.calc}>
              <span className={css.term}>Next 7 days: {part(litWeek, `${fmt(Math.round(weekly), 0)} alUSD`)} x 52</span>{" "}
              <span className={css.term}>= {part(litYear, fmt(Math.round(yearly), 0))}</span>{" "}
              <span className={css.term}>÷ {part(litDebt, fmt(debt, 0))}</span>{" "}
              <span className={css.term}>= {part(litRate, `${fmt(Math.round(rate * 100), 0)}%`)}</span>
            </span>
          </div>
        </div>
      </WhatIf>
    </Stage>
  );
}
RateInputsFigure.moment = "queue";
RateInputsFigure.hint = "Move Queue to 40,000";

/* ── Page 2: when a rate holds ───────────────────────────── */

const START_DEBT = 5_000;
const YEAR_DAYS = 365;

/** Your 5,000 over a year, a day at a time: the rate held on what is left, and the same amount each day. */
function cases(r) {
  const holds = [START_DEBT];
  const same = [START_DEBT];
  let a = START_DEBT;
  let b = START_DEBT;
  const per = (r * START_DEBT) / YEAR_DAYS;
  for (let day = 1; day <= YEAR_DAYS; day++) {
    a -= (a * r) / YEAR_DAYS;
    b = Math.max(0, b - per);
    holds.push(a);
    same.push(b < 1e-6 ? 0 : b);
  }
  return { holds, same };
}
const CASES = { 0.5: cases(0.5), 1: cases(1) };
/** The day a month ends on, as the figures read it: month 3 is day 91, month 12 day 365. */
const monthDay = (m) => Math.floor((m * YEAR_DAYS) / 12);
const CURVE_COLORS = { holds: "oklch(0.78 0.15 228)", same: "#f5c09a" };

/**
 * "Pick 100%." Your 5,000 over 12 months in the first two cases at 50%, a
 * day at a time: the rate holding on a smaller debt (solid), and the same
 * amount each day (dashed). Picking 100% redraws both from the left over
 * 1.5 s and the readout counts to the new year-end figures. Pointing at the
 * chart (mouse, a tap, or the arrow keys once it has focus) reads any month.
 */
export function RateCurveFigure() {
  const m = useMoment("rate-100");
  const [rate, setRate] = useState(0.5);
  const [ghost, setGhost] = useState(null);
  const [p, draw] = useDraw(1500);
  const [play, setPlay] = useState(0);
  useEffect(() => {
    if (m.done) setRate((r) => (r === 0.5 && !ghost ? 1 : r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.done]);
  const pick = (r) => {
    if (r === rate || (!m.ready && !m.done)) return;
    setGhost(rate);
    setRate(r);
    setPlay((n) => n + 1);
    draw(() => {
      setGhost(null);
      if (r === 1 && m.ready) m.apply({ ...m.position });
    });
  };
  const c = CASES[rate];
  const end = { holds: c.holds[YEAR_DAYS], same: c.same[YEAR_DAYS] };

  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);
  const narrow = width < 560;
  const w = Math.max(width, 260);
  const h = narrow ? 250 : 320;
  const mg = { top: 14, right: narrow ? 52 : 168, bottom: 34, left: narrow ? 46 : 56 };
  const plotW = Math.max(w - mg.left - mg.right, 10);
  const plotH = Math.max(h - mg.top - mg.bottom, 10);
  const x = (day) => mg.left + (day / YEAR_DAYS) * plotW;
  const y = (v) => mg.top + (1 - v / 5_500) * plotH;
  const upto = Math.round(p * YEAR_DAYS);
  const path = (arr, n) => arr.slice(0, n + 1).map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const pickAt = (clientX) => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * w;
    setHover(Math.max(0, Math.min(12, Math.round(((px - mg.left) / plotW) * 12))));
  };
  const at = hover;
  const atDay = at != null ? monthDay(at) : null;
  return (
    <Stage>
      <WhatIf aria="your 5,000 over a year in two cases">
        <div className={css.chips}>
          <span className={css.chipLabel}>Redemption Rate</span>
          <div className={css.segs} role="radiogroup" aria-label="Redemption Rate" style={{ minWidth: "12rem" }}>
            {[0.5, 1].map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={rate === r}
                className={`${css.seg} ${rate === r ? css.segOn : ""} ${r === 1 && m.ready && rate !== 1 ? css.segTarget : ""}`}
                disabled={!m.ready && !m.done}
                onClick={() => pick(r)}
              >
                {r * 100}%
              </button>
            ))}
          </div>
        </div>
        <div
          ref={ref}
          className={css.chart}
          tabIndex={0}
          role="group"
          aria-label="Your Debt over 12 months: the rate holding, and the same amount each day. Use the left and right arrow keys to read each month."
          onPointerMove={(e) => pickAt(e.clientX)}
          onPointerDown={(e) => pickAt(e.clientX)}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setHover(null);
          }}
          onFocus={() => setHover((v) => (v == null ? 12 : v))}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              setHover((v) => Math.max(0, Math.min(12, (v ?? 12) + (e.key === "ArrowRight" ? 1 : -1))));
            } else if (e.key === "Escape") setHover(null);
          }}
        >
          {width > 0 ? (
            <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Debt falls from 5,000 over 12 months in both cases">
              {[0, 1_000, 2_000, 3_000, 4_000, 5_000].map((v) => (
                <g key={v}>
                  <line x1={mg.left} x2={mg.left + plotW} y1={y(v)} y2={y(v)} className={css.grid} />
                  <text x={mg.left - 8} y={y(v) + 4} className={css.axis} textAnchor="end">
                    {fmt(v, 0)}
                  </text>
                </g>
              ))}
              {[0, 3, 6, 9, 12].map((mo) => (
                <text key={mo} x={x(monthDay(mo))} y={h - 16} className={css.axis} textAnchor="middle">
                  {mo}
                </text>
              ))}
              <text x={mg.left + plotW} y={h - 2} className={css.axis} textAnchor="end">
                months
              </text>
              {at != null ? <line x1={x(atDay)} x2={x(atDay)} y1={mg.top} y2={mg.top + plotH} className={css.guide} /> : null}
              {ghost != null ? (
                <g opacity="0.22">
                  <path d={path(CASES[ghost].holds, YEAR_DAYS)} fill="none" stroke={CURVE_COLORS.holds} strokeWidth={2.5} />
                  <path d={path(CASES[ghost].same, YEAR_DAYS)} fill="none" stroke={CURVE_COLORS.same} strokeWidth={2.5} strokeDasharray="7 6" />
                </g>
              ) : null}
              <path d={path(c.same, upto)} fill="none" stroke={CURVE_COLORS.same} strokeWidth={2.5} strokeDasharray="7 6" strokeLinecap="round" />
              <path d={path(c.holds, upto)} fill="none" stroke={CURVE_COLORS.holds} strokeWidth={2.5} strokeLinecap="round" />
              {p >= 1 ? (
                <>
                  <circle cx={x(YEAR_DAYS)} cy={y(end.holds)} r={4} fill={CURVE_COLORS.holds} />
                  <text x={x(YEAR_DAYS) + 8} y={y(end.holds) + 4} className={css.endLabel}>
                    {narrow ? cut(end.holds, 0) : `Rate holds ${cut(end.holds, 0)}`}
                  </text>
                  <circle cx={x(YEAR_DAYS)} cy={y(end.same)} r={4} fill={CURVE_COLORS.same} />
                  <text x={x(YEAR_DAYS) + 8} y={y(end.same) + (end.same < 400 ? -6 : 4)} className={css.endLabel}>
                    {narrow ? cut(end.same, 0) : `Same amount ${cut(end.same, 0)}`}
                  </text>
                </>
              ) : null}
              {at != null ? (
                <>
                  <circle cx={x(atDay)} cy={y(c.holds[atDay])} r={4.5} fill={CURVE_COLORS.holds} stroke="var(--app-ground)" strokeWidth={2} />
                  <circle cx={x(atDay)} cy={y(c.same[atDay])} r={4.5} fill={CURVE_COLORS.same} stroke="var(--app-ground)" strokeWidth={2} />
                </>
              ) : null}
            </svg>
          ) : (
            <div style={{ height: 320 }} />
          )}
          {at != null && width > 0 ? (
            <div className={css.tip} role="status" style={{ top: mg.top, ...(x(atDay) > w / 2 ? { right: w - x(atDay) + 12 } : { left: x(atDay) + 12 }) }}>
              <div className={css.tipHead}>{at === 0 ? "The day you borrow" : `Month ${at}`}</div>
              <div>
                <i style={{ background: CURVE_COLORS.holds }} />
                Rate holds<b>{cut(c.holds[atDay], 0)}</b>
              </div>
              <div>
                <i style={{ background: CURVE_COLORS.same }} />
                Same amount each day<b>{cut(c.same[atDay], 0)}</b>
              </div>
            </div>
          ) : null}
        </div>
        <div className={css.key}>
          <span style={{ color: CURVE_COLORS.holds }}>
            <i />
            Rate holds
          </span>
          <span style={{ color: CURVE_COLORS.same }}>
            <i className={css.dashed} />
            Same amount each day
          </span>
        </div>
        <div className={`${css.readout} ${m.done ? css.readoutOn : ""}`} data-fig="yearEnd">
          <span>After 12 months:</span>
          <span>
            rate holds <b><Num value={end.holds} play={play} format={(n) => cut(n, 0)} /></b>
          </span>
          <span>·</span>
          <span>
            same amount <b><Num value={end.same} play={play} format={(n) => cut(n, 0)} /></b>
          </span>
        </div>
      </WhatIf>
    </Stage>
  );
}
RateCurveFigure.moment = "rate-100";
RateCurveFigure.hint = "Pick 100%";

/* ── Page 3: the rate while cover lasts ──────────────────── */

const TIP_COVER =
  "Cover is currently absorbing matured redemptions. At the current throughput, it is expected to deplete in ~36 days, after which the rate steps up to the future RR (52.63%).";
const TIP_RATE =
  "Redemption rate indicates the rate of collateral deleveraging in the system. A higher redemption rate means collateral and debt are being reduced faster.";

/**
 * "Press A borrower repays 6,000." In order, 1 s apart: the 6,000 USDC repayment reaches
 * the Transmuter as MYT and counts as 6,000 of cover (shown in alUSD, the
 * vested alUSD it can settle, as the Earmarking tab counts it); Total Debt falls to 114,000; the stat reads 0.00%
 * with the future rate beside it; and its (i) tooltip opens with the app's
 * wording, and stays open.
 */
export function RateCoverFigure() {
  const m = useMoment("cover");
  const box = useRef(null);
  const fromV = useRef(null);
  const toC = useRef(null);
  const [hover, setHover] = useState(false);
  const [step, start, playing] = useSteps(4, 1000, m.done, () => {
    if (!m.done) m.apply({ ...m.position });
  }, 1200);
  // Pointing at the (i) waits while the sequence plays: its third step adds a
  // paragraph, and an open tooltip would take it in one frame.
  const open = step >= 4 || (hover && !playing);
  // The tooltip eases open only when the reader opened it on this visit. A
  // page loaded with the moment done shows it open with nothing moving.
  const eased = useRef(false);
  const point = (on) => {
    eased.current = true;
    setHover(on);
  };
  return (
    <Stage>
      <div className={base.board} ref={box}>
        <WhatIf aria="a repayment that adds cover">
          <div className={css.coverGrid}>
            <div className={css.rateTile}>
              <div className={`${app.tile} ${app.tileOn}`} style={{ flex: "none" }} data-tile="redemption">
                <div className={app.tileText}>
                  <div className={app.tileLabel}>
                    <span className={css.rateLabel} style={{ opacity: 1 }}>
                      Redemption Rate
                      <button
                        type="button"
                        className={css.info}
                        aria-label="About the Redemption Rate"
                        onPointerEnter={() => point(true)}
                        onPointerLeave={() => point(false)}
                        onFocus={() => point(true)}
                        onBlur={() => point(false)}
                      >
                        <InfoIcon />
                      </button>
                    </span>
                  </div>
                  <div className={css.rateRow}>
                    <span className={css.rateValue}>{step >= 3 ? "0.00%" : "50.00%"}</span>
                    <span className={`${css.future} ${step >= 3 ? base.appear : base.held}`} aria-hidden={step >= 3 ? undefined : true}>
                      future: 52.63%
                    </span>
                  </div>
                </div>
              </div>
              {/* The tooltip takes no room until it opens, then its row eases to
                  its height (opening at once moved the page 109px in one frame,
                  181px on a phone, where a fixed room was too small for it). */}
              <div className={`${css.tipRoom} ${eased.current ? css.tipEase : ""} ${open ? css.tipRoomOpen : ""}`}>
                <div className={css.tipClip}>
                  <div className={`${css.tooltip} ${open ? css.tooltipOpen : ""}`} role="tooltip" aria-hidden={open ? undefined : true}>
                    {step >= 3 ? <p>{TIP_COVER}</p> : null}
                    <p>{TIP_RATE}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={base.panel}>
              <div className={base.panelHead}>
                <span className={base.panelName}>Transmuter</span>
              </div>
              <div className={base.figs}>
                <Fig label="Queue" value={20_000} unit="alUSD" play={step} keepNote={false} />
                <Fig label="Vesting" value="about 1,154 a week" play={step} keepNote={false} />
                <div ref={toC}>
                  <Fig id="cover" label="Cover" value={step >= 1 ? 6_000 : 0} unit="alUSD" play={step} on={step >= 1} keepNote={false} />
                </div>
              </div>
              <div className={base.panelHead} style={{ marginTop: "0.25rem" }}>
                <span className={base.panelName} ref={fromV}>Vault</span>
              </div>
              <div className={base.figs}>
                <Fig id="totalDebt" label="Total Debt" value={step >= 2 ? 114_000 : 120_000} unit="alUSD" play={step} on={step >= 2} keepNote={false} />
              </div>
            </div>
          </div>
          <div className={base.slot} style={{ minHeight: "3.25rem" }}>
            <LessonControl
              disabled={!m.ready || playing}
              hint={m.ready || playing || m.done ? null : NOT_READY}
              onClick={() => {
                eased.current = true;
                start();
              }}
            >
              A borrower repays 6,000
            </LessonControl>
          </div>
        </WhatIf>
        <Flyer box={box} from={fromV} to={toC} a="6,000 USDC" b="6,000 of cover" run={step >= 1 && !m.done} />
      </div>
    </Stage>
  );
}
RateCoverFigure.moment = "cover";
RateCoverFigure.hint = "Press A borrower repays 6,000";

/* ── Page 4: the Redemptions tab ─────────────────────────── */

/**
 * The Redemptions tab on a live USDC vault, Schedule selected, hovered on a
 * day (`pnpm capture:app static/img redemptions`, no wallet). The Ethereum
 * vault's schedule was empty on 2026-11-07, so this is the Optimism vault's.
 */
const REDEMPTIONS_SHOT = {
  src: "/img/academy-redemptions.png",
  size: [2000, 952],
  narrow: {
    crop: { x: 1440 / 2000, y: 455 / 952, w: 450 / 2000, h: 230 / 952 },
    alt: "One day's tooltip on the Redemptions tab's Schedule: Maturing, Cumulative and Share of debt",
  },
  alt: "The Redemptions tab on a vault, Schedule selected: the Redemption Schedule heading and its description, and the next three months of maturing alUSD, with one day's tooltip showing Maturing, Cumulative and Share of debt",
};

export function RedemptionsTabShot({ children }) {
  return <Capture shot={REDEMPTIONS_SHOT}>{children}</Capture>;
}

/* ── Page 5: the Visualizer ──────────────────────────────── */

/** The Visualizer's own day 0, so every run draws the same dates. */
const NOW = Date.UTC(2026, 10, 7, 12);
const addMonths = (ms, n) => {
  const d = new Date(ms);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.getTime();
};
/** One 5,000 deposit maturing in each of the next four months: days 30, 61, 91 and 122. */
const SCHEDULE = [
  [30, 5_000],
  [61, 5_000],
  [91, 5_000],
  [122, 5_000],
];
const VIZ = { deposit: 10_000, debt: 5_000, apr: 0.05, systemDebt: 120_000, fee: 0.0025 };

/**
 * The app's projection (`calculations.ts` projectVaultLines, ported in
 * scratchpad viz-replica) of Deposit and Debt: the schedule first, each
 * deposit redeemed whole on its maturity day and shared by your Debt / (your
 * Debt + Total Debt); after the last maturity, the rate held on what is left
 * (optimistic) and the same amount each day (pessimistic), and the lines draw
 * the middle of the two.
 */
function project(rate, months) {
  const totalDays = Math.max(1, Math.round((addMonths(NOW, months) - NOW) / DAY));
  const due = new Map(SCHEDULE.filter(([d]) => d <= totalDays));
  const K = Math.max(0, ...due.keys());
  const dyf = Math.pow(1 + VIZ.apr, 1 / 365);
  const dr = rate / 365;
  let cO = VIZ.deposit;
  let dO = VIZ.debt;
  let cP = cO;
  let dP = dO;
  let per = 0;
  let sys = VIZ.systemDebt;
  const pts = [{ c: cO, d: dO }];
  for (let day = 1; day <= totalDays; day++) {
    cO *= dyf;
    cP *= dyf;
    if (day <= K) {
      const m = due.get(day) ?? 0;
      if (m > 0 && dO > 0) {
        const eff = dO + sys;
        const demand = Math.min(m, eff);
        const pr = Math.min((demand * dO) / eff, dO);
        const sr = Math.min((demand * sys) / eff, sys);
        dO -= pr;
        dP -= pr;
        sys -= sr;
        cO = Math.max(cO - pr * (1 + VIZ.fee), 0);
        cP = Math.max(cP - pr * (1 + VIZ.fee), 0);
      }
    } else {
      if (day === K + 1) per = dr * dP;
      if (dO > 0) {
        const r = Math.min(dr * dO, dO);
        dO -= r;
        cO = Math.max(cO - r * (1 + VIZ.fee), 0);
      }
      if (dP > 0) {
        const r = Math.min(per, dP);
        dP -= r;
        cP = Math.max(cP - r * (1 + VIZ.fee), 0);
      }
    }
    pts.push({ c: (cO + cP) / 2, d: (dO + dP) / 2 });
  }
  return { pts, totalDays, K };
}

/** The app's compact dollars in a tooltip, cut to two decimals: "$2.90K". */
const compact = (v) => (Math.abs(v) >= 1000 ? `$${cut(v / 1000, 2)}K` : `$${cut(v, 2)}`);
const VIZ_COLORS = { deposit: "oklch(0.72 0.17 160)", debt: "oklch(0.64 0.21 25)" };
const dateText = (day, opts = { month: "short", day: "2-digit", year: "numeric" }) =>
  new Date(NOW + day * DAY).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

/** One input of the Visualizer's row: its label with the (i) mark, and the field. */
function VizField({ label, value, onChange, live = false, lit = false }) {
  return (
    <label className={css.vizField}>
      <span className={css.vizLabel}>
        {label}
        <InfoIcon />
      </span>
      <input
        type="text"
        inputMode="decimal"
        className={`${css.vizInput} ${lit ? css.vizInputLit : ""}`}
        value={value}
        readOnly={!live}
        tabIndex={live ? 0 : -1}
        aria-label={label}
        onFocus={(e) => {
          if (live) e.target.select();
        }}
        onChange={(e) => {
          const v = e.target.value;
          if (live && /^\d*\.?\d*$/.test(v)) onChange(v);
        }}
      />
    </label>
  );
}

/**
 * A field's text, and the number it stands for once the reader stops typing
 * (0.4 s), so "1", "10" and "100" do not each redraw the chart.
 */
function useTyped(initial) {
  const [text, setText] = useState(initial);
  const [value, setValue] = useState(Number(initial));
  useEffect(() => {
    const n = Number(text);
    if (text === "" || !Number.isFinite(n)) return undefined;
    const t = window.setTimeout(() => setValue(n), 400);
    return () => window.clearTimeout(t);
  }, [text]);
  return [text, setText, value, setValue];
}

/**
 * "Type 100 in the Redemption (%) field." A practice Visualizer for a
 * 10,000 / 5,000 position, drawing Deposit and Debt on one scale. Only
 * Redemption (%) can be typed in; typing 100 redraws the simulated stretch
 * over 1.5 s while Debt at the Duration counts to its new figure. Duration
 * drags the chart longer or shorter. The app also draws Net Value against a
 * second scale; the lesson leaves that line out, since where it crosses the
 * other two means nothing. External APY (%) shows the app's starting 4.00
 * and moves neither line. Nothing here changes the practice wallet.
 */
export function VisualizerFigure() {
  const m = useMoment("rate-typed");
  const [rText, setRText, rate] = useTyped("50.00");
  const [months, setMonths] = useState(12);
  const [shownRate, setShownRate] = useState(0.5);
  const [from, setFrom] = useState(null);
  const [p, draw] = useDraw(1500);
  const [play, setPlay] = useState(0);

  // A page loaded with its moment done shows the state it left.
  useEffect(() => {
    if (!m.done) return;
    setRText((t) => (t === "50.00" ? "100" : t));
    setShownRate((v) => (v === 0.5 ? 1 : v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.done]);

  // A committed number redraws the chart from what was on it.
  useEffect(() => {
    const r = rate / 100;
    if (Math.abs(r - shownRate) < 1e-9) return;
    setFrom(project(shownRate, months));
    setShownRate(r);
    setPlay((n) => n + 1);
    draw(() => {
      setFrom(null);
      if (Math.abs(r - 1) < 1e-9 && m.ready) m.apply({ ...m.position });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  const run = project(shownRate, months);
  const last = run.pts[run.pts.length - 1];

  // The chart.
  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);
  const narrow = width < 560;
  const w = Math.max(width, 260);
  const h = narrow ? 240 : 264;
  const mg = { top: 26, right: narrow ? 16 : 28, bottom: 30, left: narrow ? 46 : 64 };
  const plotW = Math.max(w - mg.left - mg.right, 10);
  const plotH = Math.max(h - mg.top - mg.bottom, 10);
  const T = run.totalDays;
  const x = (day) => mg.left + (day / T) * plotW;
  const yMax = Math.ceil((VIZ.deposit * 1.08) / 1000) * 1000;
  const yL = (v) => mg.top + (1 - v / yMax) * plotH;
  const line = (pts, key, a = 0, b = pts.length - 1) => {
    let s = "";
    for (let i = Math.max(0, a); i <= Math.min(b, pts.length - 1); i++) s += `${s ? "L" : "M"}${x(i).toFixed(1)},${yL(pts[i][key]).toFixed(1)}`;
    return s;
  };
  // What the redraw has reached: the simulated stretch.
  const reach = run.K + Math.round(p * (T - run.K));
  const ticks = [];
  const every = months <= (narrow ? 6 : 12) ? 1 : months <= (narrow ? 12 : 24) ? (narrow ? 3 : 2) : 4;
  for (let i = 0; i <= months; i += every) {
    const day = Math.round((addMonths(NOW, i) - NOW) / DAY);
    ticks.push({ day, label: dateText(day, { month: "short" }) });
  }
  const leftTicks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax];
  const pickAt = (clientX) => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * w;
    setHover(Math.max(0, Math.min(T, Math.round(((px - mg.left) / plotW) * T))));
  };
  const at = hover != null && hover <= T ? hover : null;
  return (
    <Stage>
      <section className={app.frame} aria-label="Practice copy of the Visualizer tab on the vault page">
        {/* The head row has a rule of its own for a phone, where six tabs and
            the tag do not fit one line (see `.vizTop`). */}
        <div className={css.vizTop}>
          <AppTabs tabs={INFO_TABS} live="Visualizer" />
          <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
        </div>
        <div className={css.vizInputs}>
          <VizField label="Yield APY (%)" value="5.00" />
          <VizField label="Redemption (%)" value={rText} onChange={setRText} live lit />
          <VizField label="alUSD:USDC" value="0.980" />
          <VizField label="External APY (%)" value="4.00" />
        </div>
        <TimeSlider
          label="Duration (Months)"
          head={String(months)}
          value={months}
          min={1}
          max={24}
          step={1}
          onChange={(v) => {
            setMonths(v);
            setHover(null);
          }}
          ticks={[1, 6, 12, 18, 24].map((v) => ({ at: v, label: String(v) }))}
          aria="Duration (Months)"
        />
        <div className={css.vizChart}>
          <div className={css.pills}>
            <span className={css.pill} style={{ color: VIZ_COLORS.deposit }}>
              <i />
              Deposit
            </span>
            <span className={css.pill} style={{ color: VIZ_COLORS.debt, boxShadow: "0 0 0 1px var(--app-alchemix)" }}>
              <i />
              Debt
            </span>
          </div>
          <div
            ref={ref}
            className={css.chart}
            tabIndex={0}
            role="group"
            aria-label="Projected Deposit and Debt. Use the left and right arrow keys to read the chart."
            onPointerMove={(e) => pickAt(e.clientX)}
            onPointerDown={(e) => pickAt(e.clientX)}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setHover(null);
            }}
            onFocus={() => setHover((v) => (v == null ? T : v))}
            onBlur={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const stepDays = Math.max(1, Math.round(T / months / 2));
                setHover((v) => Math.max(0, Math.min(T, (v ?? T) + (e.key === "ArrowRight" ? stepDays : -stepDays))));
              } else if (e.key === "Escape") setHover(null);
            }}
          >
            {width > 0 ? (
              <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Debt at ${months} months ${cut(last.d, 2)}`}>
                {run.K > 0 ? <rect x={x(0)} y={mg.top} width={x(run.K) - x(0)} height={plotH} fill="rgba(190, 160, 70, 0.16)" /> : null}
                {run.K > 0 ? <line x1={x(run.K)} x2={x(run.K)} y1={mg.top} y2={mg.top + plotH} stroke="rgba(255,255,255,0.25)" /> : null}
                {run.K > 0 ? (
                  <text x={(x(0) + x(run.K)) / 2} y={mg.top - 9} className={css.shadeLabel} textAnchor="middle">
                    on chain data
                  </text>
                ) : null}
                {run.K < T ? (
                  <text x={(x(run.K) + x(T)) / 2} y={mg.top - 9} className={css.shadeLabel} textAnchor="middle">
                    simulated data
                  </text>
                ) : null}
                {leftTicks.map((v) => (
                  <g key={`l${v}`}>
                    <line x1={mg.left} x2={mg.left + plotW} y1={yL(v)} y2={yL(v)} className={css.grid} />
                    <text x={mg.left - 8} y={yL(v) + 4} className={css.axis} textAnchor="end">
                      {v >= 1000 ? `${fmt(v / 1000, 2)}K` : fmt(v, 2)}
                    </text>
                  </g>
                ))}
                {ticks.map((t) => (
                  <text key={t.day} x={x(t.day)} y={h - 10} className={css.axis} textAnchor="middle">
                    {t.label}
                  </text>
                ))}
                {at != null ? <line x1={x(at)} x2={x(at)} y1={mg.top} y2={mg.top + plotH} className={css.guide} /> : null}
                {from ? (
                  <g opacity="0.25">
                    <path d={line(from.pts, "c", reach)} fill="none" stroke={VIZ_COLORS.deposit} strokeWidth={2} />
                    <path d={line(from.pts, "d", reach)} fill="none" stroke={VIZ_COLORS.debt} strokeWidth={2} />
                  </g>
                ) : null}
                <path d={line(run.pts, "c", 0, reach)} fill="none" stroke={VIZ_COLORS.deposit} strokeWidth={2.25} />
                <path d={line(run.pts, "d", 0, reach)} fill="none" stroke={VIZ_COLORS.debt} strokeWidth={2.25} />
                {at != null ? (
                  <>
                    <circle cx={x(at)} cy={yL(run.pts[at].c)} r={4} fill={VIZ_COLORS.deposit} />
                    <circle cx={x(at)} cy={yL(run.pts[at].d)} r={4} fill={VIZ_COLORS.debt} />
                  </>
                ) : null}
              </svg>
            ) : (
              <div style={{ height: 320 }} />
            )}
            {at != null && width > 0 ? (
              <div className={css.tip} role="status" style={{ top: mg.top, ...(x(at) > w / 2 ? { right: w - x(at) + 12 } : { left: x(at) + 12 }) }}>
                <div className={css.tipHead}>{dateText(at)}</div>
                <div>
                  <i style={{ background: VIZ_COLORS.deposit }} />
                  Deposit<b>{compact(run.pts[at].c)}</b>
                </div>
                <div>
                  <i style={{ background: VIZ_COLORS.debt }} />
                  Debt<b>{compact(run.pts[at].d)}</b>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className={`${css.readout} ${m.done ? css.readoutOn : ""}`} data-fig="debtAt">
          <span>Debt at {months} months</span>
          <b>
            <Num value={last.d} play={play} format={(n) => fmt(n, 2)} />
          </b>
        </div>
      </section>
    </Stage>
  );
}
