import React, { useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import styles from "../lesson.module.css";
import parts from "../parts.module.css";
import { debtCurve, debtRemainingPct } from "../lib/model";
import { WEEKS_PER_YEAR } from "../lib/protocol";
import useElementWidth from "../lib/useElementWidth";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, Gate, GuessSlider, Panel, Primary,
  Question, Reveal, NARROW, SHOTS, Stage, Sub, said,
} from "../kit";

/**
 * Intermediate lesson 4: the pace of repayment.
 *
 * What sets the redemption rate. Nobody does: the docs work it out from three
 * figures (`docs/user/concepts/redemption-rate.md`). The alUSD waiting in the
 * Transmuter turns over once per term, so a year of repayments is the queue
 * times the terms in a year, and the rate is that against the total debt in
 * the market.
 *
 * The lesson used to ask Ana and Ben how much of two loans was left after a
 * year at 70%. Once the beginner track drew the rate at its definition, the
 * question answered itself (30%, for both), and the Explore stage's labels
 * announced the answer the moment a control moved. It also taught the rate as
 * something "the protocol sets", which the docs do not say. It comes right
 * after the peg lesson now, so the learner has just met the savers whose queue
 * this is.
 *
 * The size-of-loan point survives: every position clears at the same share,
 * because redemptions are spread in proportion to what each owes. It is in the
 * Predict reveal and on the Explore stage's fourth control.
 *
 * Stage state lives on the page, not here, because the header stepper is the
 * progress indicator for the whole lesson and the two must never disagree.
 */

/* The example market. 1,400,000 turning over twice a year repays 2,800,000,
   which is 70% of 4,000,000: the example rate the beginner track uses. */
const QUEUE = 1_400_000;
const TERM_WEEKS = 26;
const TOTAL_DEBT = 4_000_000;
const ADDED = 700_000;

const HORIZON = 24;
const CHECK_MONTH = 12;

const fmt = (n) => Math.round(n).toLocaleString("en-US");
const pct = (r) => `${Math.round(r * 100)}%`;

/** A year of repayments from the queue, and the rate that makes against the debt. */
const repaidPerYear = (queue, weeks) => queue * (WEEKS_PER_YEAR / weeks);
const rateOf = (queue, weeks, debt) => repaidPerYear(queue, weeks) / debt;

const BASE_RATE = rateOf(QUEUE, TERM_WEEKS, TOTAL_DEBT);
const NEW_RATE = rateOf(QUEUE + ADDED, TERM_WEEKS, TOTAL_DEBT);

export default function PaceLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Predict onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Explore onDone={() => onStage("checkpoint")} />;

  return (
    <Checkpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      passTitle="Lesson 4 complete."
      passBody="The redemption rate is a year of repayments from the Transmuter queue, against the total debt in the market. The queue, the term and the total debt move it, and every loan clears at it, whatever its size."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function MarketTiles({ queue, weeks, debt }) {
  return (
    <div className={`${parts.statRow} ${parts.statRow3}`}>
      <div className={parts.stat}>
        <div className={styles.statLabel}>alUSD in the Transmuter</div>
        <div className={parts.statValue} style={{ color: "#8ea9d8" }}>{fmt(queue)}</div>
      </div>
      <div className={parts.stat}>
        <div className={styles.statLabel}>Term</div>
        <div className={parts.statValue}>{weeks} weeks</div>
      </div>
      <div className={parts.stat}>
        <div className={styles.statLabel}>Total debt in the market</div>
        <div className={parts.statValue} style={{ color: "#f5c09a" }}>{fmt(debt)}</div>
      </div>
    </div>
  );
}

function Predict({ onDone }) {
  const [guess, setGuess] = useState(Math.round(BASE_RATE * 100));
  const [revealed, setRevealed] = useState(false);

  const curves = useMemo(
    () => [
      { id: "after", label: `${pct(NEW_RATE)} a year`, color: "#5ba88a", width: 3.5, points: debtCurve({ redemptionAnnual: NEW_RATE, months: HORIZON }) },
      { id: "before", label: `${pct(BASE_RATE)} a year`, color: "#f5c09a", width: 2, dashed: true, points: debtCurve({ redemptionAnnual: BASE_RATE, months: HORIZON }) },
    ],
    [],
  );

  return (
    <Stage eyebrow="Stage 1 · Predict" headline="Your loan is repaid out of the Transmuter queue.">
      <Sub>
        Savers have {fmt(QUEUE)} alUSD waiting in the Transmuter on a {TERM_WEEKS}-week term,
        so the queue turns over twice a year and repays {fmt(repaidPerYear(QUEUE, TERM_WEEKS))}.
        Every loan in the market adds up to {fmt(TOTAL_DEBT)}, so a year of redemptions clears{" "}
        {pct(BASE_RATE)} of it. That share is the redemption rate.
      </Sub>

      <MarketTiles queue={QUEUE} weeks={TERM_WEEKS} debt={TOTAL_DEBT} />

      <Panel>
        <Question>
          Savers add another {fmt(ADDED)} alUSD to the queue. What redemption rate does your
          vault show now?
        </Question>
        <GuessSlider
          label="Redemption rate"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#5ba88a"
          min={0}
          max={150}
          step={5}
          format={(v) => `${v}% a year`}
          scale={["0%", "150%"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Nothing else in the market changes.">
          <Primary onClick={() => setRevealed(true)}>Commit and run it</Primary>
        </Actions>
      ) : null}

      <div className={revealed ? styles.chartLive : styles.chartDimmed} aria-hidden={!revealed}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>Your loan left, months 0 to {HORIZON}</span>
          {!revealed ? <span className={styles.aside}>Revealed after you commit</span> : null}
        </div>
        <Chart curves={curves} horizon={HORIZON} highlightMonth={CHECK_MONTH} />
      </div>

      {revealed ? (
        <Reveal
          title={`${pct(NEW_RATE)}. More alUSD waiting repays more debt in a year.`}
          onNext={onDone}
          nextLabel="Find what else moves it"
        >
          <Body>
            {said(guess, Math.round(NEW_RATE * 100), (v) => `${v}%`, 5)}
            {fmt(QUEUE + ADDED)} alUSD turning over twice a year repays{" "}
            {fmt(repaidPerYear(QUEUE + ADDED, TERM_WEEKS))}, which is {pct(NEW_RATE)} of the{" "}
            {fmt(TOTAL_DEBT)} owed, so your loan clears within the year. No one set that
            figure: the rate is worked out from the queue, and it moved because savers deposited.
          </Body>
          <Body>
            Every loan clears at the same rate, whatever its size. Redemptions are spread across
            positions in proportion to what each one owes, so a loan four times the size has four
            times as much repaid, and the same share of it is left.
          </Body>
        </Reveal>
      ) : null}
    </Stage>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [queue, setQueue] = useState(QUEUE);
  const [weeks, setWeeks] = useState(TERM_WEEKS);
  const [debt, setDebt] = useState(TOTAL_DEBT);
  const [loan, setLoan] = useState(2_000);

  // Which inputs the learner has tried. The reveal waits until all four have
  // moved, so the one that leaves the pace alone gets pushed as well.
  const [touched, setTouched] = useState({ queue: false, weeks: false, debt: false, loan: false });
  const mark = (k) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const rate = rateOf(queue, weeks, debt);
  const curve = useMemo(() => debtCurve({ redemptionAnnual: rate, months: HORIZON }), [rate]);
  const leftPct = debtRemainingPct({ redemptionAnnual: rate, months: CHECK_MONTH });
  const left = (loan * leftPct) / 100;

  const tried = Object.values(touched).filter(Boolean).length;
  const found = tried === 4;

  return (
    <Stage eyebrow="Stage 2 · Explore" headline="Push each input and find what moves the rate.">
      <Sub>
        The same market, and a loan of your own in it. The rate is a year of repayments from the
        queue against the total debt.
      </Sub>

      <div className={`${parts.statRow} ${parts.statRow3}`}>
        <div className={parts.stat}>
          <div className={styles.statLabel}>Repaid in a year</div>
          <div className={parts.statValue} style={{ color: "#8ea9d8" }}>{fmt(repaidPerYear(queue, weeks))}</div>
        </div>
        <div className={parts.stat}>
          <div className={styles.statLabel}>Redemption rate</div>
          <div className={parts.statValue} style={{ color: "#5ba88a" }}>{pct(rate)}</div>
        </div>
        <div className={parts.stat}>
          <div className={styles.statLabel}>Your loan after a year</div>
          <div className={parts.statValue} style={{ color: "#f5c09a" }}>{fmt(left)} of {fmt(loan)}</div>
        </div>
      </div>

      <div className={styles.chartLive}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>Your loan left, months 0 to {HORIZON}</span>
        </div>
        <Chart
          curves={[{ id: "debt", label: "Your loan left", color: "#f5c09a", width: 3.5, points: curve }]}
          horizon={HORIZON}
          highlightMonth={CHECK_MONTH}
        />
      </div>

      <Controls>
        <Control
          label="alUSD waiting"
          display={fmt(queue)}
          min={200_000} max={3_000_000} step={100_000} value={queue}
          onChange={(v) => { setQueue(v); mark("queue"); }}
          accent
          verdict={touched.queue ? (queue > QUEUE ? "more waiting, faster" : queue < QUEUE ? "less waiting, slower" : null) : null}
        />
        <Control
          label="Term"
          display={`${weeks} weeks`}
          min={4} max={52} step={1} value={weeks}
          onChange={(v) => { setWeeks(v); mark("weeks"); }}
          verdict={touched.weeks ? (weeks < TERM_WEEKS ? "shorter term, faster" : weeks > TERM_WEEKS ? "longer term, slower" : null) : null}
        />
        <Control
          label="Total debt"
          display={fmt(debt)}
          min={1_000_000} max={8_000_000} step={250_000} value={debt}
          onChange={(v) => { setDebt(v); mark("debt"); }}
          verdict={touched.debt ? (debt > TOTAL_DEBT ? "more debt, slower" : debt < TOTAL_DEBT ? "less debt, faster" : null) : null}
        />
        <Control
          label="Your loan"
          display={fmt(loan)}
          min={1_000} max={9_000} step={500} value={loan}
          onChange={(v) => { setLoan(v); mark("loan"); }}
          verdict={touched.loan ? "same share left" : null}
        />
      </Controls>

      {found ? (
        <Reveal
          title="The queue, the term and the total debt set the pace. Your loan does not."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            More alUSD waiting, or a shorter term, repays more in a year. More debt in the
            market spreads the same repayments thinner. The size of your own loan changes how
            much is repaid, never the share, and the vault's yield plays no part: it raises what
            your MYT is worth.
          </Body>
          <Body>
            The rate on your vault is a projection that assumes all three stay where they are
            today, and they move as savers deposit, as borrowers borrow and as the DAO sets the
            term. What you control is repaying by hand, which clears debt the moment you choose
            to.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the checkpoint" hint={`Move all four inputs to continue. ${tried} of 4 so far.`} />
      )}

      <AppShot shot={SHOTS.statsBottom} narrow={NARROW.earmarkedRedemption}>
        Redemption Rate, second from the left, on a real vault: this stage's figure, worked out
        from that market's queue, term and debt. Earmarked, beside it, is the slice of a loan
        already set aside for savers whose alUSD has matured.
      </AppShot>
    </Stage>
  );
}

/* ── Chart ───────────────────────────────────────────────── */

/**
 * The viewBox tracks the rendered width so one user unit is one pixel. A fixed
 * viewBox would scale the axis labels down with everything else, which on a phone
 * rendered them at about 4px.
 */
function chartGeometry(width) {
  const narrow = width < 520;
  const w = Math.max(width, 260);
  // Taller proportion on a phone, where a 16:6 plot collapses to a sliver.
  const h = narrow ? Math.round(w * 0.82) : Math.round(w * 0.4);

  return {
    w,
    h,
    narrow,
    m: narrow
      ? { top: 26, right: 12, bottom: 40, left: 38 }
      : { top: 30, right: 60, bottom: 46, left: 60 },
    // Every 6 months is unreadable once the plot is phone width.
    tickEvery: narrow ? 12 : 6,
  };
}

function Chart({ curves, horizon, markers = [], highlightMonth }) {
  const [ref, width] = useElementWidth();
  const { w, h, narrow, m, tickEvery } = chartGeometry(width);

  const plotW = w - m.left - m.right;
  const plotH = h - m.top - m.bottom;

  const x = (month) => m.left + (month / horizon) * plotW;
  const y = (pct) => m.top + (1 - pct / 100) * plotH;

  const path = (points) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.month).toFixed(2)},${y(p.pct).toFixed(2)}`).join(" ");

  const yTicks = narrow ? [0, 50, 100] : [0, 25, 50, 75, 100];
  const xTicks = Array.from({ length: Math.floor(horizon / tickEvery) + 1 }, (_, i) => i * tickEvery);

  return (
    <div ref={ref}>
      {/* Nothing to draw until measured. Rendering at a guessed width first would
          show the chart jumping into place on every load. */}
      {width > 0 ? (
        <svg viewBox={`0 0 ${w} ${h}`} className={styles.chart} role="img" aria-label="Debt remaining over time">
          {yTicks.map((pct) => (
            <g key={pct}>
              <line x1={m.left} x2={w - m.right} y1={y(pct)} y2={y(pct)} className={styles.grid} />
              <text x={m.left - 10} y={y(pct) + 4} className={styles.axisText} textAnchor="end">{pct}%</text>
            </g>
          ))}

          {xTicks.map((month) => (
            <text key={month} x={x(month)} y={h - 18} className={styles.axisText} textAnchor="middle">{month}</text>
          ))}
          <text x={w - m.right} y={h - 2} className={styles.axisText} textAnchor="end">months</text>

          {highlightMonth != null ? (
            <>
              <line x1={x(highlightMonth)} x2={x(highlightMonth)} y1={m.top} y2={m.top + plotH} className={styles.highlight} />
              <text x={x(highlightMonth)} y={m.top - 10} className={styles.axisText} textAnchor="middle">
                {narrow ? `${highlightMonth} mo` : `${highlightMonth} months`}
              </text>
            </>
          ) : null}

          {curves.map((c) => (
            <path
              key={c.id}
              d={path(c.points)}
              fill="none"
              stroke={c.color}
              strokeWidth={c.width}
              strokeDasharray={c.dashed ? "7 6" : undefined}
              strokeLinecap="round"
            />
          ))}

          {markers.map((mk, i) => (
            <circle key={i} cx={x(mk.month)} cy={y(mk.pct)} r={5.5} fill="none" stroke={mk.color} strokeWidth={2} />
          ))}
        </svg>
      ) : (
        <div className={styles.chartPlaceholder} />
      )}

      <div className={styles.legend}>
        {curves.map((c) => (
          <span key={c.id} className={styles.legendItem}>
            <span
              className={styles.swatch}
              style={{
                background: c.dashed
                  ? `repeating-linear-gradient(90deg, ${c.color} 0 5px, transparent 5px 9px)`
                  : c.color,
              }}
            />
            {c.label}
          </span>
        ))}
        {markers.length ? <span className={styles.legendItem}>Circles mark your guesses</span> : null}
      </div>
    </div>
  );
}
