import React, { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import styles from "../lesson.module.css";
import { debtCurve, debtRemainingPct } from "../lib/model";
import useElementWidth from "../lib/useElementWidth";
import { Checkpoint } from "../kit";

/**
 * Lesson 1: the pace of repayment.
 *
 * Three stages. The learner commits to a prediction before seeing anything, then
 * explores freely, then answers a server-set challenge to complete the lesson.
 *
 * The prediction stage is doing the teaching. Almost everyone assumes a smaller
 * loan clears sooner, and watching two very different loans trace the same curve
 * is what makes the mechanism stick. A paragraph saying so does not.
 *
 * Stage state lives on the page, not here, because the header stepper is the
 * progress indicator for the whole lesson and the two must never disagree.
 */

const COLLATERAL = 10_000;
const ANA_DEBT = 2_000;
const BEN_DEBT = 8_000;
const YIELD = 0.05;
const REDEMPTION = 0.8;
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
      headline="Work out the redemption rate."
      unit="pct"
      targetOf={(f) => f.targetPct}
      computeOf={(f, v) =>
        debtRemainingPct({
          collateral: f.collateral,
          debt: f.debt,
          yieldAnnual: f.yieldAnnual,
          redemptionAnnual: v,
          months: f.months,
        })
      }
      controlLabel="Redemption rate"
      controlDisplay={(v) => `${(v * 100).toFixed(1)}% a year`}
      targetFoot="debt still outstanding"
      landingFoot="adjust until the two match"
      passTitle="Lesson 1 complete."
      passBody="You worked the mechanism out for yourself. The pace of repayment is set by the protocol, and now you can read it."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

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
    <>
      <div className={styles.eyebrow}>Stage 1 · Predict</div>
      <h1 className={styles.headline}>Two positions open in the same vault on the same day.</h1>
      <p className={styles.sub}>
        Ana and Ben deposit the same amount. Ben borrows four times what Ana does.
        Neither repays anything by hand. Record what you expect before you run the
        projection.
      </p>

      <div className={styles.setupGrid}>
        <SetupCard name="Ana" color="#5ba88a" deposit={COLLATERAL} borrow={ANA_DEBT} />
        <SetupCard name="Ben" color="#f5c09a" deposit={COLLATERAL} borrow={BEN_DEBT} />
      </div>

      <div className={styles.panel}>
        <span className={`${styles.corner} ${styles.cornerTl}`} />
        <span className={`${styles.corner} ${styles.cornerTr}`} />

        <div className={styles.question}>
          After {CHECK_MONTH} months, how much of each loan is still outstanding?
        </div>

        <div className={styles.guessGrid}>
          <GuessSlider who="Ana's debt left" value={ana} onChange={setAna} disabled={revealed} color="#5ba88a" />
          <GuessSlider who="Ben's debt left" value={ben} onChange={setBen} disabled={revealed} color="#f5c09a" />
        </div>
      </div>

      {!revealed ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => setRevealed(true)}>
            Commit and run the projection
            <ArrowIcon />
          </button>
          <span className={styles.aside}>You can adjust either answer until you commit.</span>
        </div>
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
        <div className={styles.reveal}>
          <div className={styles.revealHead}>
            After {CHECK_MONTH} months, both positions have <strong>{truth.toFixed(1)}%</strong> of
            their debt left.
          </div>
          <p className={styles.revealBody}>
            {guessedSame
              ? "Your two answers agree with each other, and so does the projection. The curves sit exactly on top of one another, which is why only the dashed line reveals there are two."
              : `You separated the two answers by ${Math.abs(ana - ben)} points. The projection puts them in the same place, with the curves exactly on top of one another.`}{" "}
            Ben borrowed four times what Ana did, and after {CHECK_MONTH} months the same
            share of each loan remains. Borrowing more did not extend his loan.
          </p>
          <p className={styles.revealBody}>
            A conventional loan behaves the other way around, because interest accrues on
            the balance and a larger balance takes longer to clear. Alchemix debt carries
            no interest, and it clears on a schedule set elsewhere in the protocol.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            Find what sets the schedule
            <ArrowIcon />
          </button>
        </div>
      ) : null}
    </>
  );
}

function SetupCard({ name, color, deposit, borrow }) {
  return (
    <div className={styles.setupCard}>
      <div className={styles.setupName}>
        <span className={styles.setupDot} style={{ background: color }} />
        <span style={{ color }}>{name}</span>
      </div>
      <div className={styles.setupStats}>
        <Stat label="Deposited" value={fmt(deposit)} />
        <Stat label="Borrowed" value={fmt(borrow)} color={color} />
        <Stat label="LTV" value={`${Math.round((borrow / deposit) * 100)}%`} color="#a8adb6" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function GuessSlider({ who, value, onChange, disabled, color }) {
  return (
    <div>
      <div className={styles.guessHead}>
        <span className={styles.microLabel}>{who}</span>
        <span className={styles.guessValue} style={{ color }}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={{ accentColor: color }}
        aria-label={who}
      />
      <div className={styles.guessScale}>
        <span>All repaid</span>
        <span>Nothing repaid</span>
      </div>
    </div>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [debt, setDebt] = useState(2_000);
  const [yieldAnnual, setYield] = useState(0.05);
  const [redemptionAnnual, setRedemption] = useState(0.8);

  // Which levers the learner has actually tried. The checklist is the lesson:
  // two of these do nothing to the curve and one does everything.
  const [touched, setTouched] = useState({ debt: false, yield: false, redemption: false });
  const mark = (k) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const shape = { collateral: COLLATERAL, debt, yieldAnnual, redemptionAnnual };
  const curve = useMemo(() => debtCurve({ ...shape, months: HORIZON }), [debt, yieldAnnual, redemptionAnnual]);
  const atCheck = useMemo(() => debtRemainingPct({ ...shape, months: CHECK_MONTH }), [debt, yieldAnnual, redemptionAnnual]);

  const tried = Object.values(touched).filter(Boolean).length;
  const found = tried === 3;

  return (
    <>
      <div className={styles.eyebrow}>Stage 2 · Explore</div>
      <h1 className={styles.headline}>Three inputs feed this projection, and one of them sets the pace.</h1>
      <p className={styles.sub}>
        The position is the same as before. Move each input and watch what happens to
        the curve.
      </p>

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

      <div className={styles.readout}>
        After {CHECK_MONTH} months, <strong>{atCheck.toFixed(1)}%</strong> of the debt is left.
      </div>

      <div className={styles.controls}>
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
      </div>

      {found ? (
        <div className={styles.reveal}>
          <div className={styles.revealHead}>The redemption rate sets the pace.</div>
          <p className={styles.revealBody}>
            How much you borrow does not change how quickly it clears, and neither does
            the yield your collateral earns. Redemptions repay a share of total system
            debt each year, and every position is deleveraged at that rate regardless of
            its size. That is why Ana and Ben traced the same curve.
          </p>
          <p className={styles.revealBody}>
            The redemption rate is a property of the protocol, applied equally to
            everyone in the market. You do not set it and you cannot accelerate it. Your
            own choices change how much collateral keeps working for you while redemptions
            run, which the next lesson covers.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            Take the checkpoint
            <ArrowIcon />
          </button>
        </div>
      ) : (
        <p className={styles.hint}>Move all three inputs to continue. {tried} of 3 so far.</p>
      )}
    </>
  );
}

function Control({ label, display, min, max, step, value, onChange, verdict, accent }) {
  return (
    <div className={`${styles.control} ${accent ? styles.controlAccent : ""}`}>
      <div className={styles.controlHead}>
        <span className={styles.microLabel}>{label}</span>
        <span className={styles.controlValue}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        aria-label={label}
      />
      {/* Explore passes null before a lever is touched, so the line stays reserved
          and the cards do not jump as verdicts appear. The checkpoint passes
          nothing at all, and should not carry an empty row. */}
      {verdict !== undefined ? (
        <div className={accent ? styles.verdictOn : styles.verdictOff}>{verdict ?? " "}</div>
      ) : null}
    </div>
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

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
