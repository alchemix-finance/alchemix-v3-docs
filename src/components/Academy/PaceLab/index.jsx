import React, { useCallback, useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import { debtCurve, debtRemainingPct } from "../lib/model";
import { apiBase, fetchChallenge, saveCompletion, submitAnswer } from "../lib/api";
import useElementWidth from "../lib/useElementWidth";

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
  return <Checkpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} />;
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
      <h1 className={styles.headline}>Two people. Same vault, same day, very different loans.</h1>
      <p className={styles.sub}>
        Neither of them repays anything by hand. Before you look at anything, say what
        you think happens.
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
            Lock it in and run the projection
            <ArrowIcon />
          </button>
          <span className={styles.aside}>You can change your mind until you lock in.</span>
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
              ? "You called it. The two lines sit on top of each other, which is why only one is visible until you look for the dashes."
              : `You put them ${Math.abs(ana - ben)} points apart. They are not apart at all. The two lines sit exactly on top of each other.`}{" "}
            Ben borrowed four times what Ana did and cleared the same share of it in the
            same time. Borrowing more did not make his loan take longer.
          </p>
          <p className={styles.revealBody}>
            That is worth sitting with, because it is the opposite of how a normal loan
            behaves. Find out what does move it in the next stage.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            So what does move it?
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
      <h1 className={styles.headline}>Three levers. Two of them do nothing.</h1>
      <p className={styles.sub}>
        Same position as before. Move each one and watch the curve.
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
          verdict={touched.debt ? "no effect" : null}
        />
        <Control
          label="Vault yield"
          display={`${(yieldAnnual * 100).toFixed(0)}% a year`}
          min={0} max={0.2} step={0.01} value={yieldAnnual}
          onChange={(v) => { setYield(v); mark("yield"); }}
          verdict={touched.yield ? "no effect" : null}
        />
        <Control
          label="Redemption rate"
          display={`${(redemptionAnnual * 100).toFixed(0)}% a year`}
          min={0.2} max={2} step={0.05} value={redemptionAnnual}
          onChange={(v) => { setRedemption(v); mark("redemption"); }}
          verdict={touched.redemption ? "this is the one" : null}
          accent
        />
      </div>

      {found ? (
        <div className={styles.reveal}>
          <div className={styles.revealHead}>The redemption rate sets the pace.</div>
          <p className={styles.revealBody}>
            How much you borrowed does not change how fast it clears. Neither does the
            yield your collateral earns. Redemptions repay a share of total system debt
            each year, and your loan is deleveraged at that rate whatever its size, which
            is why Ana and Ben traced the same line.
          </p>
          <p className={styles.revealBody}>
            The rate is a property of the protocol. You do not set it and you cannot rush
            it. What your own choices change is how much collateral is left working for
            you while it happens, which is what lesson 3 is about.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            Take the checkpoint
            <ArrowIcon />
          </button>
        </div>
      ) : (
        <p className={styles.hint}>Move all three to continue. {tried} of 3 tried.</p>
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

/* ── Stage 3: checkpoint ─────────────────────────────────── */

function Checkpoint({ base, lessonId, done, onPass }) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(0.8);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    fetchChallenge(base, lessonId)
      .then((c) => {
        setChallenge(c);
        setRate(c.slider.min + (c.slider.max - c.slider.min) / 2);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [base, lessonId]);

  useEffect(load, [load]);

  const landing = useMemo(() => {
    if (!challenge) return null;
    const { collateral, debt, yieldAnnual, months } = challenge.params;
    return debtRemainingPct({ collateral, debt, yieldAnnual, redemptionAnnual: rate, months });
  }, [challenge, rate]);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer(base, {
        challenge: challenge.challenge,
        params: challenge.params,
        answer: rate,
      });
      setResult(res);
      if (res.passed && res.completion) {
        saveCompletion(lessonId, res.completion);
        onPass();
      }
    } catch (e) {
      setError(e.message);
      // An expired challenge is the common case, and it is recoverable.
      if (e.code === "bad_challenge") load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className={styles.eyebrow}>Stage 3 · Checkpoint</div>
        <p className={styles.sub}>Setting your challenge...</p>
      </>
    );
  }

  if (error && !challenge) {
    // A learner does not need the server's wording, which is written for an
    // operator. Tell them what it means for them, and keep the detail secondary.
    return (
      <>
        <div className={styles.eyebrow}>Stage 3 · Checkpoint</div>
        <h1 className={styles.headline}>The checkpoint is not answering.</h1>
        <p className={styles.sub}>
          Everything you worked out in this lesson still stands. Only the graded
          question needs the server, so try again in a moment.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={load}>Try again</button>
        </div>
        <p className={styles.errorDetail}>{error}</p>
      </>
    );
  }

  const passed = result?.passed || done;
  const tol = result?.tolerancePct ?? 1;
  const onTarget = landing != null && Math.abs(landing - challenge.params.targetPct) <= tol;

  return (
    <>
      <div className={styles.eyebrow}>Stage 3 · Checkpoint</div>
      <h1 className={styles.headline}>Find the rate.</h1>
      <p className={styles.sub}>{challenge.prompt}</p>
      <p className={styles.hint}>
        These numbers are generated for you, so a friend's answer will not fit your
        question.
      </p>

      <div className={styles.checkGrid}>
        <div className={styles.checkCard}>
          <div className={styles.microLabel}>Target</div>
          <div className={styles.bigNumber}>{challenge.params.targetPct.toFixed(1)}%</div>
          <div className={styles.checkFoot}>after {challenge.params.months} months</div>
        </div>
        <div className={styles.checkCard}>
          <div className={styles.microLabel}>Your rate lands at</div>
          <div className={styles.bigNumber} style={{ color: onTarget ? "#5ba88a" : "#f5c09a" }}>
            {landing == null ? "-" : `${landing.toFixed(1)}%`}
          </div>
          <div className={styles.checkFoot}>keep adjusting until it matches</div>
        </div>
      </div>

      <div className={styles.controls}>
        <Control
          label="Redemption rate"
          display={`${(rate * 100).toFixed(1)}% a year`}
          min={challenge.slider.min}
          max={challenge.slider.max}
          step={challenge.slider.step}
          value={rate}
          onChange={setRate}
          accent
        />
      </div>

      {!passed ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onSubmit} disabled={submitting}>
            {submitting ? "Checking..." : "Submit answer"}
          </button>
        </div>
      ) : null}

      {error && challenge ? <p className={styles.errorBox}>{error}</p> : null}

      {result && !result.passed ? (
        <div className={styles.missBox}>
          Not yet. That rate leaves {result.actualPct}% outstanding, and the target is{" "}
          {result.targetPct}% (within {result.tolerancePct} point). Adjust and submit again.
        </div>
      ) : null}

      {passed ? (
        <div className={styles.passBox}>
          <div className={styles.passHead}>Lesson 1 complete.</div>
          <p className={styles.revealBody}>
            You found the rate that produces the target, which means you can read the
            mechanism rather than recite it. Your progress is saved in this browser.
          </p>
          <Link to="/academy" className={styles.primaryLink}>
            Back to the track
            <ArrowIcon />
          </Link>
        </div>
      ) : null}
    </>
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
