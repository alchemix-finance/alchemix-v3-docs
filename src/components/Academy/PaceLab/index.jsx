import React, { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useIsBrowser from "@docusaurus/useIsBrowser";
import styles from "./styles.module.css";
import { debtCurve, debtRemainingPct } from "../lib/model";
import { apiBase, fetchChallenge, hasCompletion, saveCompletion, submitAnswer } from "../lib/api";

/**
 * Lesson 1: the pace of repayment.
 *
 * Three stages. The learner commits to a prediction before seeing anything, then
 * explores freely, then answers a server-set challenge to complete the lesson.
 *
 * The prediction stage is doing the teaching. Almost everyone assumes a smaller
 * loan clears sooner, and watching two very different loans trace the same curve
 * is what makes the mechanism stick. A paragraph saying so does not.
 */

const COLLATERAL = 10_000;
const ANA_DEBT = 2_000;
const BEN_DEBT = 8_000;
const YIELD = 0.05;
const REDEMPTION = 0.8;
const HORIZON = 36;
const CHECK_MONTH = 12;

const fmt = (n) => n.toLocaleString("en-US");

export default function PaceLab({ lessonId = "l1-pace-of-repayment" }) {
  const { siteConfig } = useDocusaurusContext();
  const isBrowser = useIsBrowser();
  const base = apiBase(siteConfig);

  const [stage, setStage] = useState("predict");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isBrowser && hasCompletion(lessonId)) setDone(true);
  }, [isBrowser, lessonId]);

  return (
    <div className={styles.wrap}>
      <StageBar stage={stage} onJump={setStage} done={done} />

      {stage === "predict" && <Predict onDone={() => setStage("explore")} />}
      {stage === "explore" && <Explore onDone={() => setStage("checkpoint")} />}
      {stage === "checkpoint" && (
        <Checkpoint
          base={base}
          lessonId={lessonId}
          done={done}
          onPass={() => setDone(true)}
        />
      )}
    </div>
  );
}

/* ── Stage indicator ─────────────────────────────────────── */

const STAGES = [
  ["predict", "1. Predict"],
  ["explore", "2. Explore"],
  ["checkpoint", "3. Checkpoint"],
];

function StageBar({ stage, onJump, done }) {
  return (
    <div className={styles.stageBar}>
      {STAGES.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`${styles.stageTab} ${stage === id ? styles.stageTabOn : ""}`}
          onClick={() => onJump(id)}
        >
          {label}
          {id === "checkpoint" && done ? <span className={styles.tick}> ✓</span> : null}
        </button>
      ))}
    </div>
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

  const curves = useMemo(
    () => [
      {
        id: "ben",
        label: `Ben, borrowed ${fmt(BEN_DEBT)}`,
        color: "#f5c09a",
        width: 3,
        points: debtCurve({
          collateral: COLLATERAL,
          debt: BEN_DEBT,
          yieldAnnual: YIELD,
          redemptionAnnual: REDEMPTION,
          months: HORIZON,
        }),
      },
      {
        id: "ana",
        label: `Ana, borrowed ${fmt(ANA_DEBT)}`,
        color: "#5ba88a",
        width: 2,
        dashed: true,
        points: debtCurve({
          collateral: COLLATERAL,
          debt: ANA_DEBT,
          yieldAnnual: YIELD,
          redemptionAnnual: REDEMPTION,
          months: HORIZON,
        }),
      },
    ],
    [],
  );

  const guessedSame = Math.abs(ana - ben) <= 5;

  return (
    <div className={styles.stage}>
      <p className={styles.lede}>
        Two people open a position in the same vault on the same day. Both deposit{" "}
        <strong>{fmt(COLLATERAL)} USDC</strong>. Ana borrows{" "}
        <strong>{fmt(ANA_DEBT)} alUSD</strong>. Ben borrows{" "}
        <strong>{fmt(BEN_DEBT)} alUSD</strong>, four times as much.
      </p>
      <p className={styles.lede}>
        Neither of them repays anything by hand. Before you look at the chart, say
        what you think happens.
      </p>

      <div className={styles.guessGrid}>
        <GuessSlider
          label={`Ana's debt left after ${CHECK_MONTH} months`}
          value={ana}
          onChange={setAna}
          disabled={revealed}
          color="#5ba88a"
        />
        <GuessSlider
          label={`Ben's debt left after ${CHECK_MONTH} months`}
          value={ben}
          onChange={setBen}
          disabled={revealed}
          color="#f5c09a"
        />
      </div>

      {!revealed ? (
        <button type="button" className={styles.primary} onClick={() => setRevealed(true)}>
          Lock it in and run the projection
        </button>
      ) : null}

      {revealed ? (
        <>
          <Chart
            curves={curves}
            horizon={HORIZON}
            markers={[
              { month: CHECK_MONTH, pct: ana, color: "#5ba88a", label: "your guess, Ana" },
              { month: CHECK_MONTH, pct: ben, color: "#f5c09a", label: "your guess, Ben" },
            ]}
            highlightMonth={CHECK_MONTH}
          />

          <div className={styles.reveal}>
            <div className={styles.revealHead}>
              After {CHECK_MONTH} months, both positions have{" "}
              <strong>{truth.toFixed(1)}%</strong> of their debt left.
            </div>
            <p className={styles.revealBody}>
              {guessedSame
                ? "You called it. The two lines sit on top of each other, which is why only one is visible until you look for the dashes."
                : `You put them ${Math.abs(ana - ben)} points apart. They are not apart at all. The two lines sit exactly on top of each other.`}{" "}
              Ben borrowed four times what Ana did and cleared the same share of it
              in the same time. Borrowing more did not make his loan take longer.
            </p>
            <p className={styles.revealBody}>
              That is worth sitting with, because it is the opposite of how a
              normal loan behaves. Find out what does move it in the next stage.
            </p>
            <button type="button" className={styles.primary} onClick={onDone}>
              So what does move it?
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function GuessSlider({ label, value, onChange, disabled, color }) {
  return (
    <div className={styles.guess}>
      <div className={styles.guessLabel}>{label}</div>
      <div className={styles.guessValue} style={{ color }}>
        {value}%
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
      />
    </div>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

const EXPLORE_DEFAULTS = { debt: 2_000, yieldAnnual: 0.05, redemptionAnnual: 0.8 };

function Explore({ onDone }) {
  const [debt, setDebt] = useState(EXPLORE_DEFAULTS.debt);
  const [yieldAnnual, setYield] = useState(EXPLORE_DEFAULTS.yieldAnnual);
  const [redemptionAnnual, setRedemption] = useState(EXPLORE_DEFAULTS.redemptionAnnual);

  // Which levers the learner has actually tried. The checklist below is the
  // lesson: two of these do nothing to the curve and one does everything.
  const [touched, setTouched] = useState({ debt: false, yield: false, redemption: false });
  const mark = (k) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const shape = { collateral: COLLATERAL, debt, yieldAnnual, redemptionAnnual };
  const curve = useMemo(() => debtCurve({ ...shape, months: HORIZON }), [debt, yieldAnnual, redemptionAnnual]);
  const atCheck = useMemo(() => debtRemainingPct({ ...shape, months: CHECK_MONTH }), [debt, yieldAnnual, redemptionAnnual]);

  const found = touched.debt && touched.yield && touched.redemption;

  return (
    <div className={styles.stage}>
      <p className={styles.lede}>
        Same position, three levers. Watch the curve. Two of these will not move it
        at all.
      </p>

      <Chart
        curves={[{ id: "debt", label: "Debt remaining", color: "#f5c09a", width: 3, points: curve }]}
        horizon={HORIZON}
        highlightMonth={CHECK_MONTH}
      />

      <div className={styles.readout}>
        After {CHECK_MONTH} months, <strong>{atCheck.toFixed(1)}%</strong> of the debt
        is left.
      </div>

      <div className={styles.controls}>
        <Control
          label="Borrowed"
          display={fmt(debt)}
          min={1_000}
          max={9_000}
          step={500}
          value={debt}
          onChange={(v) => {
            setDebt(v);
            mark("debt");
          }}
          verdict={touched.debt ? "no effect" : null}
        />
        <Control
          label="Vault yield"
          display={`${(yieldAnnual * 100).toFixed(0)}% a year`}
          min={0}
          max={0.2}
          step={0.01}
          value={yieldAnnual}
          onChange={(v) => {
            setYield(v);
            mark("yield");
          }}
          verdict={touched.yield ? "no effect" : null}
        />
        <Control
          label="Redemption rate"
          display={`${(redemptionAnnual * 100).toFixed(0)}% a year`}
          min={0.2}
          max={2}
          step={0.05}
          value={redemptionAnnual}
          onChange={(v) => {
            setRedemption(v);
            mark("redemption");
          }}
          verdict={touched.redemption ? "this is the one" : null}
          accent
        />
      </div>

      {found ? (
        <div className={styles.reveal}>
          <div className={styles.revealHead}>The redemption rate sets the pace.</div>
          <p className={styles.revealBody}>
            How much you borrowed does not change how fast it clears. Neither does
            the yield your collateral earns. Redemptions repay a share of total
            system debt each year, and your loan is deleveraged at that rate
            whatever its size, which is why Ana and Ben traced the same line.
          </p>
          <p className={styles.revealBody}>
            The rate is a property of the protocol. You do not set it and you
            cannot rush it. What your own choices change is how much collateral is
            left working for you while it happens, which is what lesson 3 is
            about.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            Take the checkpoint
          </button>
        </div>
      ) : (
        <p className={styles.hint}>
          Move all three to continue. ({Object.values(touched).filter(Boolean).length} of 3 tried)
        </p>
      )}
    </div>
  );
}

function Control({ label, display, min, max, step, value, onChange, verdict, accent }) {
  return (
    <div className={`${styles.control} ${accent ? styles.controlAccent : ""}`}>
      <div className={styles.controlHead}>
        <span className={styles.controlLabel}>{label}</span>
        <span className={styles.controlValue}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
      />
      {verdict ? (
        <div className={accent ? styles.verdictOn : styles.verdictOff}>{verdict}</div>
      ) : (
        <div className={styles.verdictGap} />
      )}
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

  const load = React.useCallback(() => {
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

  if (loading) return <div className={styles.stage}>Loading your challenge...</div>;

  if (error && !challenge) {
    return (
      <div className={styles.stage}>
        <p className={styles.errorBox}>{error}</p>
        <button type="button" className={styles.primary} onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  const passed = result?.passed;

  return (
    <div className={styles.stage}>
      <p className={styles.lede}>{challenge.prompt}</p>
      <p className={styles.hint}>
        These numbers are generated for you, so a friend's answer will not fit your
        question.
      </p>

      <div className={styles.checkGrid}>
        <div className={styles.checkTarget}>
          <div className={styles.controlLabel}>Target</div>
          <div className={styles.bigNumber}>{challenge.params.targetPct.toFixed(1)}%</div>
          <div className={styles.controlLabel}>after {challenge.params.months} months</div>
        </div>
        <div className={styles.checkTarget}>
          <div className={styles.controlLabel}>Your rate lands at</div>
          <div
            className={styles.bigNumber}
            style={{
              color:
                landing != null &&
                Math.abs(landing - challenge.params.targetPct) <= (result?.tolerancePct ?? 1)
                  ? "#5ba88a"
                  : "#f5c09a",
            }}
          >
            {landing == null ? "-" : `${landing.toFixed(1)}%`}
          </div>
          <div className={styles.controlLabel}>keep adjusting until it matches</div>
        </div>
      </div>

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

      {!passed ? (
        <button
          type="button"
          className={styles.primary}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Checking..." : "Submit answer"}
        </button>
      ) : null}

      {error && challenge ? <p className={styles.errorBox}>{error}</p> : null}

      {result && !result.passed ? (
        <div className={styles.missBox}>
          Not yet. That rate leaves {result.actualPct}% outstanding, and the target
          is {result.targetPct}% (within {result.tolerancePct} point). Adjust and
          submit again.
        </div>
      ) : null}

      {passed || done ? (
        <div className={styles.passBox}>
          <div className={styles.revealHead}>Lesson 1 complete.</div>
          <p className={styles.revealBody}>
            You found the rate that produces the target, which means you can read
            the mechanism rather than recite it. Your completion is saved in this
            browser. Finish the track to claim the role.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ── Chart ───────────────────────────────────────────────── */

const W = 720;
const H = 240;
const M = { top: 16, right: 18, bottom: 30, left: 46 };

function Chart({ curves, horizon, markers = [], highlightMonth }) {
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const x = (month) => M.left + (month / horizon) * plotW;
  const y = (pct) => M.top + (1 - pct / 100) * plotH;

  const path = (points) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.month).toFixed(2)},${y(p.pct).toFixed(2)}`).join(" ");

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Debt remaining over time">
        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={pct}>
            <line x1={M.left} x2={W - M.right} y1={y(pct)} y2={y(pct)} className={styles.grid} />
            <text x={M.left - 8} y={y(pct) + 4} className={styles.axisText} textAnchor="end">
              {pct}%
            </text>
          </g>
        ))}

        {Array.from({ length: horizon / 6 + 1 }, (_, i) => i * 6).map((month) => (
          <text key={month} x={x(month)} y={H - 8} className={styles.axisText} textAnchor="middle">
            {month}
          </text>
        ))}

        {highlightMonth != null ? (
          <line
            x1={x(highlightMonth)}
            x2={x(highlightMonth)}
            y1={M.top}
            y2={M.top + plotH}
            className={styles.highlight}
          />
        ) : null}

        {curves.map((c) => (
          <path
            key={c.id}
            d={path(c.points)}
            fill="none"
            stroke={c.color}
            strokeWidth={c.width}
            strokeDasharray={c.dashed ? "7 5" : undefined}
            strokeLinecap="round"
          />
        ))}

        {markers.map((m, i) => (
          <g key={i}>
            <circle cx={x(m.month)} cy={y(m.pct)} r={5} fill="none" stroke={m.color} strokeWidth={2} />
            <circle cx={x(m.month)} cy={y(m.pct)} r={1.5} fill={m.color} />
          </g>
        ))}

        <text x={M.left} y={H - 8} className={styles.axisText} textAnchor="start" dx={-30}>
          months
        </text>
      </svg>

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
        {markers.length ? <span className={styles.legendItem}>○ your guess</span> : null}
      </div>
    </div>
  );
}
