import React, { useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import styles from "../lesson.module.css";
import { debtCurve, debtRemainingPct } from "../lib/model";
import { EXAMPLE_REDEMPTION, EXAMPLE_YIELD } from "../lib/protocol";
import useElementWidth from "../lib/useElementWidth";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel, Primary,
  Question, Readout, Reveal, SHOTS, SetupCard, SetupGrid, Stage, Sub,
} from "../kit";

/**
 * Intermediate lesson 2: the pace of repayment.
 *
 * Three stages. The learner commits to a prediction before seeing anything, then
 * explores freely, then answers a server-set question to complete the lesson.
 *
 * The prediction stage does the teaching. The common assumption is that a smaller
 * loan clears sooner, and watching two very different loans trace the same curve
 * is what makes the mechanism stick.
 *
 * Built from the kit's shared parts. Only the chart is its own, because it draws
 * two curves with the learner's guesses marked on them, which the kit's line
 * chart does not do.
 *
 * Stage state lives on the page, not here, because the header stepper is the
 * progress indicator for the whole lesson and the two must never disagree.
 */

const COLLATERAL = 10_000;
const ANA_DEBT = 2_000;
const BEN_DEBT = 8_000;
// Both come from protocol.js. This lab used to declare its own 80% while the
// beginner track projected at 70%, so the two tracks described loans clearing at
// different speeds.
const YIELD = EXAMPLE_YIELD;
const REDEMPTION = EXAMPLE_REDEMPTION;
const HORIZON = 36;
const CHECK_MONTH = 12;

const fmt = (n) => n.toLocaleString("en-US");

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
      passTitle="Lesson 2 complete."
      passBody="You can read the pace of repayment off the redemption rate. It is the one input that moves the curve, and the protocol sets it for the whole market at once."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

/** The three figures a setup card shows for one position. */
function positionStats(deposit, borrow, color) {
  return [
    { label: "Deposited", value: fmt(deposit) },
    { label: "Borrowed", value: fmt(borrow), color },
    { label: "LTV", value: `${Math.round((borrow / deposit) * 100)}%`, color: "#a8adb6" },
  ];
}

const GUESS_SCALE = ["All repaid", "Nothing repaid"];

function Predict({ onDone }) {
  const [ana, setAna] = useState(50);
  const [ben, setBen] = useState(50);
  const [revealed, setRevealed] = useState(false);

  const truth = useMemo(
    () =>
      debtRemainingPct({
        collateral: COLLATERAL,
        debt: ANA_DEBT,
        yieldAnnual: YIELD,
        redemptionAnnual: REDEMPTION,
        months: CHECK_MONTH,
      }),
    [],
  );

  const curves = useMemo(() => {
    const shape = { collateral: COLLATERAL, yieldAnnual: YIELD, redemptionAnnual: REDEMPTION, months: HORIZON };
    return [
      { id: "ben", label: `Ben, borrowed ${fmt(BEN_DEBT)}`, color: "#f5c09a", width: 3.5, points: debtCurve({ ...shape, debt: BEN_DEBT }) },
      { id: "ana", label: `Ana, borrowed ${fmt(ANA_DEBT)}`, color: "#5ba88a", width: 2, dashed: true, points: debtCurve({ ...shape, debt: ANA_DEBT }) },
    ];
  }, []);

  const guessedSame = Math.abs(ana - ben) <= 5;

  return (
    <Stage eyebrow="Stage 1 · Predict" headline="Ana and Ben open positions in the same vault on the same day.">
      <Sub>
        They deposit the same amount, and Ben borrows four times what Ana does. Both then
        leave the position alone, and redemptions run at {Math.round(REDEMPTION * 100)}% a
        year. Set both answers before the projection runs.
      </Sub>

      <SetupGrid>
        <SetupCard name="Ana" color="#5ba88a" stats={positionStats(COLLATERAL, ANA_DEBT, "#5ba88a")} />
        <SetupCard name="Ben" color="#f5c09a" stats={positionStats(COLLATERAL, BEN_DEBT, "#f5c09a")} />
      </SetupGrid>

      <Panel>
        <Question>After {CHECK_MONTH} months, how much of each loan is still outstanding?</Question>
        <div className={styles.guessGrid}>
          <GuessSlider label="Ana's debt left" value={ana} onChange={setAna} disabled={revealed} color="#5ba88a" scale={GUESS_SCALE} />
          <GuessSlider label="Ben's debt left" value={ben} onChange={setBen} disabled={revealed} color="#f5c09a" scale={GUESS_SCALE} />
        </div>
      </Panel>

      {!revealed ? (
        <Actions aside="You can adjust either answer until you commit.">
          <Primary onClick={() => setRevealed(true)}>Commit and run the projection</Primary>
        </Actions>
      ) : null}

      <div className={revealed ? styles.chartLive : styles.chartDimmed} aria-hidden={!revealed}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>Debt remaining, months 0 to {HORIZON}</span>
          {!revealed ? <span className={styles.aside}>Revealed after you commit</span> : null}
        </div>
        <Chart
          curves={curves}
          horizon={HORIZON}
          highlightMonth={CHECK_MONTH}
          markers={
            revealed
              ? [
                  { month: CHECK_MONTH, pct: ana, color: "#5ba88a" },
                  { month: CHECK_MONTH, pct: ben, color: "#f5c09a" },
                ]
              : []
          }
        />
      </div>

      {revealed ? (
        <Reveal
          title={
            <>
              After {CHECK_MONTH} months, both positions have{" "}
              <strong>{truth.toFixed(1)}%</strong> of their debt left.
            </>
          }
          onNext={onDone}
          nextLabel="Find what sets the pace"
        >
          <Body>
            {guessedSame
              ? "Your two answers match, and so does the projection. The two curves sit exactly on top of each other."
              : `You put the two answers ${Math.abs(ana - ben)} points apart. The projection puts them in the same place, with the two curves exactly on top of each other.`}{" "}
            Ben borrowed four times what Ana did, and after {CHECK_MONTH} months the same
            share of each loan remains.
          </Body>
          <Body>
            On a conventional loan, interest accrues on the balance, so a larger balance
            takes longer to clear. Alchemix debt carries no interest at all. It clears at a
            rate the protocol sets, and that rate is the same for everyone in the market.
          </Body>
        </Reveal>
      ) : null}
    </Stage>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [debt, setDebt] = useState(2_000);
  const [yieldAnnual, setYield] = useState(YIELD);
  const [redemptionAnnual, setRedemption] = useState(REDEMPTION);

  // Which levers the learner has tried. The reveal waits until all three have
  // moved, so the two that leave the curve alone get pushed as well.
  const [touched, setTouched] = useState({ debt: false, yield: false, redemption: false });
  const mark = (k) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const shape = { collateral: COLLATERAL, debt, yieldAnnual, redemptionAnnual };
  const curve = useMemo(() => debtCurve({ ...shape, months: HORIZON }), [debt, yieldAnnual, redemptionAnnual]);
  const atCheck = useMemo(() => debtRemainingPct({ ...shape, months: CHECK_MONTH }), [debt, yieldAnnual, redemptionAnnual]);

  const tried = Object.values(touched).filter(Boolean).length;
  const found = tried === 3;

  return (
    <Stage eyebrow="Stage 2 · Explore" headline="Push each input and find the one that moves the curve.">
      <Sub>The position is the same one Ana opened.</Sub>

      <div className={styles.chartLive}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>Debt remaining, months 0 to {HORIZON}</span>
        </div>
        <Chart
          curves={[{ id: "debt", label: "Debt remaining", color: "#f5c09a", width: 3.5, points: curve }]}
          horizon={HORIZON}
          highlightMonth={CHECK_MONTH}
        />
      </div>

      <Readout>
        After {CHECK_MONTH} months, <strong>{atCheck.toFixed(1)}%</strong> of the debt is left.
      </Readout>

      <Controls>
        <Control
          label="Borrowed"
          display={fmt(debt)}
          min={1_000} max={9_000} step={500} value={debt}
          onChange={(v) => { setDebt(v); mark("debt"); }}
          verdict={touched.debt ? "no change" : null}
        />
        <Control
          label="Vault yield"
          display={`${(yieldAnnual * 100).toFixed(0)}% a year`}
          min={0} max={0.2} step={0.01} value={yieldAnnual}
          onChange={(v) => { setYield(v); mark("yield"); }}
          verdict={touched.yield ? "no change" : null}
        />
        <Control
          label="Redemption rate"
          display={`${(redemptionAnnual * 100).toFixed(0)}% a year`}
          min={0.2} max={2} step={0.05} value={redemptionAnnual}
          onChange={(v) => { setRedemption(v); mark("redemption"); }}
          verdict={touched.redemption ? "sets the pace" : null}
          accent
        />
      </Controls>

      <AppShot shot={SHOTS.redemptionRate}>
        The third control, on a real vault. Every position in that market is repaid at this
        one rate, so it is the figure to read before you judge how fast a loan will clear.
      </AppShot>

      {found ? (
        <Reveal
          title="The redemption rate sets the pace."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            Redemptions repay a share of total system debt each year, and every position
            is repaid at that rate whatever its size. One rate applied to Ana and Ben alike,
            so their loans cleared in lockstep even though one was four times the other.
          </Body>
          <Body>
            What you do control is repaying by hand, which clears debt the moment you
            choose to.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move all three inputs to continue. {tried} of 3 so far.</Hint>
      )}
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
