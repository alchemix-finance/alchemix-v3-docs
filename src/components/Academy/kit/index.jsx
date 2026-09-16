import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import styles from "../lesson.module.css";
import parts from "../parts.module.css";
import { fetchChallenge, saveCompletion, submitAnswer } from "../lib/api";
import useElementWidth from "../lib/useElementWidth";
import LocalNotice from "../LocalNotice";

/**
 * Shared parts every lesson is built from.
 *
 * Every lesson repeats the same three-stage shape, so the shape lives here and a
 * lesson supplies only what is different about it: the situation it sets up, the
 * model it lets you push on, and the question its checkpoint asks.
 *
 * The checkpoint also carries error states, expiry handling and completion
 * storage. Thirteen hand-written copies of that would drift apart.
 */

/* ── Typography and layout ───────────────────────────────── */

export function Stage({ eyebrow, headline, children }) {
  return (
    <>
      <div className={styles.eyebrow}>{eyebrow}</div>
      {headline ? <h1 className={styles.headline}>{headline}</h1> : null}
      {children}
    </>
  );
}

export const Sub = ({ children }) => <p className={styles.sub}>{children}</p>;
export const Hint = ({ children }) => <p className={styles.hint}>{children}</p>;

export function Panel({ children }) {
  return (
    <div className={styles.panel}>
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />
      {children}
    </div>
  );
}

export const Question = ({ children }) => <div className={styles.question}>{children}</div>;

export function Actions({ children, aside }) {
  return (
    <div className={styles.actions}>
      {children}
      {aside ? <span className={styles.aside}>{aside}</span> : null}
    </div>
  );
}

export function Primary({ onClick, disabled, children }) {
  return (
    <button type="button" className={styles.primary} onClick={onClick} disabled={disabled}>
      {children}
      <Arrow />
    </button>
  );
}

export function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function Reveal({ title, children, onNext, nextLabel }) {
  return (
    <div className={styles.reveal}>
      <div className={styles.revealHead}>{title}</div>
      {children}
      {onNext ? <Primary onClick={onNext}>{nextLabel}</Primary> : null}
    </div>
  );
}

export const Body = ({ children }) => <p className={styles.revealBody}>{children}</p>;

export function Readout({ children }) {
  return <div className={styles.readout}>{children}</div>;
}

/* ── Controls ────────────────────────────────────────────── */

export function GuessSlider({ label, value, onChange, disabled, color, min = 0, max = 100, step = 1, format, scale }) {
  return (
    <div>
      <div className={styles.guessHead}>
        <span className={styles.microLabel}>{label}</span>
        <span className={styles.guessValue} style={{ color }}>
          {format ? format(value) : `${value}%`}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={color ? { accentColor: color } : undefined}
        aria-label={label}
      />
      {scale ? (
        <div className={styles.guessScale}>
          <span>{scale[0]}</span>
          <span>{scale[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

export function Control({ label, display, min, max, step, value, onChange, verdict, accent, tone }) {
  return (
    <div className={`${styles.control} ${accent ? styles.controlAccent : ""}`}>
      <div className={styles.controlHead}>
        <span className={styles.microLabel}>{label}</span>
        <span className={styles.controlValue} style={tone ? { color: tone } : undefined}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={tone ? { accentColor: tone } : undefined}
        aria-label={label}
      />
      {verdict !== undefined ? (
        <div className={accent ? styles.verdictOn : styles.verdictOff}>{verdict ?? " "}</div>
      ) : null}
    </div>
  );
}

export const Controls = ({ children }) => <div className={styles.controls}>{children}</div>;

/* ── Setup display ───────────────────────────────────────── */

export function SetupGrid({ children }) {
  return <div className={styles.setupGrid}>{children}</div>;
}

export function SetupCard({ name, color, stats }) {
  return (
    <div className={styles.setupCard}>
      {name ? (
        <div className={styles.setupName}>
          <span className={styles.setupDot} style={{ background: color }} />
          <span style={{ color }}>{name}</span>
        </div>
      ) : null}
      <div className={styles.setupStats}>
        {stats.map((s) => (
          <div key={s.label}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue} style={s.color ? { color: s.color } : undefined}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Formatting ──────────────────────────────────────────── */

export const money = (n) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export const money2 = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatByUnit(value, unit) {
  if (value == null || !Number.isFinite(value)) return "-";
  if (unit === "amount") return money(value);
  return `${value.toFixed(unit === "apr" ? 2 : 1)}%`;
}

/** The alAsset a deposit asset borrows: alUSD against USDC, alETH against ETH. */
export function alAssetOf(asset = "USDC") {
  return /eth/i.test(String(asset)) ? "alETH" : "alUSD";
}

/** An amount in the deposit asset's own units: whole dollars, or ETH to four places. */
export function assetAmount(n, asset = "USDC") {
  if (n == null || !Number.isFinite(n)) return "-";
  return n.toLocaleString("en-US", { maximumFractionDigits: /eth/i.test(String(asset)) ? 4 : 0 });
}

/* ── Flow steps ──────────────────────────────────────────── */

/**
 * A left-to-right run of numbered stops with arrows between them.
 *
 * Takes three to five steps as `{ n, label, value, note, tone }`. `n` defaults
 * to the step's position. The grid classes carry the column template for each
 * count and collapse into one column on phones, where the arrows turn to point
 * down.
 */
export function FlowSteps({ steps }) {
  const count = steps.length;
  const cls = count === 4 ? parts.flow4 : count === 5 ? parts.flow5 : parts.flow;
  // Two stops, or more than five, are not in the stylesheet; build the template.
  const style =
    count >= 3 && count <= 5
      ? undefined
      : { gridTemplateColumns: Array.from({ length: count }, () => "1fr").join(" auto ") };

  return (
    <div className={cls} style={style}>
      {steps.map((s, i) => (
        <React.Fragment key={s.key ?? `${i}-${s.label ?? ""}`}>
          {i > 0 ? <FlowArrow /> : null}
          <FlowStep n={s.n ?? i + 1} label={s.label} value={s.value} note={s.note} tone={s.tone} />
        </React.Fragment>
      ))}
    </div>
  );
}

export function FlowStep({ n, label, value, note, tone }) {
  return (
    <div className={parts.step}>
      <div className={parts.stepNum}>{n}</div>
      <div className={parts.stepLabel}>{label}</div>
      <div className={parts.stepValue} style={tone ? { color: tone } : undefined}>{value}</div>
      {note ? <div className={parts.stepNote}>{note}</div> : null}
    </div>
  );
}

export function FlowArrow() {
  return (
    <svg className={parts.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,192,154,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── Position card ───────────────────────────────────────── */

const TONE = { ok: "#5ba88a", cap: "#d4952a", liq: "#d4645a" };

/** 0.9 -> "90%", 0.855 -> "85.5%". Trailing zeros dropped, so markers read clean. */
const markPct = (x) => `${+(x * 100).toFixed(1)}%`;

/**
 * The position card, drawn the way the app draws it.
 *
 * Deposited, Borrowed, LTV, a health bar with the borrowing cap and the
 * liquidation threshold marked on it, and whether the deposit is still earning.
 * The same card carries one position across the beginner track, so each lesson
 * changes a prop or two and the learner watches the same object move.
 *
 * How a loss of backing is drawn. The docs describe the app's bar this way: if
 * MYT records a loss, the Liq marker slides left. This card does the same. The
 * fill and the LTV figure stay at borrowed / deposited, and the liquidation
 * marker moves to liqLtv x (1 - backingLoss), which is the starting LTV that a
 * loss of that size liquidates (the same rule the ltv-and-risk grader uses).
 * The effective LTV, borrowed / (deposited x (1 - backingLoss)), is what the
 * color state is judged on, so the marker crossing the fill and the bar turning
 * red always happen together. While a loss is applied the LTV stat shows that
 * effective figure on a second line, so the number and the marker agree. The
 * cap marker stays where it is: it is a borrowing rule, and this card does not
 * model borrowing room after a loss.
 *
 * Colors: green under the cap, amber at the cap, red past the liquidation
 * threshold. `highlight` puts the copper accent on one stat ("deposited",
 * "borrowed" or "ltv"). `note` is one short line under the card.
 */
export function PositionCard({
  deposited,
  borrowed = 0,
  asset = "USDC",
  capLtv = 0.9,
  liqLtv = 0.95,
  backingLoss = 0,
  earning = true,
  highlight = null,
  note = null,
  compact = false,
  label = null,
}) {
  const dep = Math.max(Number(deposited) || 0, 0);
  const debt = Math.max(Number(borrowed) || 0, 0);
  const loss = Math.min(Math.max(Number(backingLoss) || 0, 0), 0.99);

  const ltv = dep > 0 ? debt / dep : 0;
  const effective = dep > 0 ? debt / (dep * (1 - loss)) : 0;
  const liqAt = liqLtv * (1 - loss);

  const state = effective >= liqLtv - 1e-9 ? "liq" : ltv >= capLtv - 1e-9 ? "cap" : "ok";
  const tone = TONE[state];
  const al = alAssetOf(asset);
  const earningText = earning === true ? "Still earning" : earning;

  const clamp = (x) => Math.min(Math.max(x, 0), 1) * 100;
  // A tag hangs to the left of its marker, since both markers live near the
  // right end. A marker that has slid far left flips its tag to the other side.
  const tagSide = (x) => (x < 0.3 ? parts.cardTagFlip : "");

  const stat = (key, text, value, valueTone, sub) => {
    const on = highlight === key;
    return (
      <div className={`${parts.cardStat} ${on ? parts.cardStatOn : ""}`}>
        <div className={parts.cardStatLabel}>{text}</div>
        <div className={parts.cardStatValue} style={{ color: valueTone ?? (on ? "#f5c09a" : undefined) }}>
          {value}
        </div>
        {sub ? <div className={parts.cardStatSub}>{sub}</div> : null}
      </div>
    );
  };

  const barLabel =
    `LTV ${markPct(ltv)}. Borrowing cap ${markPct(capLtv)}. Liquidation ${markPct(liqAt)}` +
    (loss > 0
      ? `, after a ${markPct(loss)} loss of backing. Effective LTV ${markPct(effective)}.`
      : ".");

  return (
    <div className={`${parts.card} ${compact ? parts.cardCompact : ""}`}>
      <div className={parts.cardHead}>
        <div className={parts.cardHeadLeft}>
          <span className={parts.cardLabel}>{label ?? "Your position"}</span>
          {loss > 0 ? <span className={parts.cardLoss}>Backing down {markPct(loss)}</span> : null}
        </div>
        {earningText ? (
          <span className={parts.cardEarning}>
            <span className={parts.cardEarningDot} />
            {earningText}
          </span>
        ) : null}
      </div>

      <div className={parts.cardStats}>
        {stat("deposited", "Deposited", (
          <>
            {assetAmount(dep, asset)}
            <span className={parts.cardUnit}>{asset}</span>
          </>
        ))}
        {stat("borrowed", "Borrowed", (
          <>
            {assetAmount(debt, asset)}
            <span className={parts.cardUnit}>{al}</span>
          </>
        ))}
        {/* The LTV figure keeps its state color even when highlighted; a warning
            should not be painted over by the accent. */}
        {stat(
          "ltv",
          "LTV",
          `${(ltv * 100).toFixed(1)}%`,
          state === "ok" && highlight === "ltv" ? "#f5c09a" : tone,
          loss > 0 ? `Effective ${(effective * 100).toFixed(1)}%` : null,
        )}
      </div>

      <div className={parts.cardBar}>
        <div className={parts.cardTrack} role="img" aria-label={barLabel}>
          <span
            className={`${parts.cardFill} ${state === "cap" ? parts.cardFillCap : state === "liq" ? parts.cardFillLiq : ""}`}
            style={{ width: `${clamp(ltv)}%` }}
          />
          <span className={`${parts.cardMark} ${parts.cardMarkCap} ${tagSide(capLtv)}`} style={{ left: `${clamp(capLtv)}%` }}>
            <span className={parts.cardTag}>Cap {markPct(capLtv)}</span>
          </span>
          <span className={`${parts.cardMark} ${parts.cardMarkLiq} ${tagSide(liqAt)}`} style={{ left: `${clamp(liqAt)}%` }}>
            <span className={parts.cardTag}>Liquidation {markPct(liqAt)}</span>
          </span>
        </div>
      </div>

      {note ? <div className={parts.cardNote}>{note}</div> : null}
    </div>
  );
}

/* ── Checkpoint ──────────────────────────────────────────── */

const KEYS = ["A", "B", "C", "D", "E"];

/**
 * The graded stage.
 *
 * The engine decides what kind of question a lesson asks. Its `controls` carry
 * either a slider (`{ slider: { min, max, step } }`) or a list of statements
 * (`{ choices: string[] }`), and this renders whichever arrives. A slider
 * lesson supplies how the value is read (`computeOf`) and what it is measured
 * against (`targetOf`). A choice lesson supplies neither.
 *
 * Choice options arrive in this learner's order and the answer goes back as the
 * index picked. Which option is right is never known here, so grading stays on
 * the server. A miss shows the feedback for the option picked and leaves the
 * rest alone.
 */
export function Checkpoint({
  base,
  lessonId,
  done,
  onPass,
  headline,
  targetOf,
  computeOf,
  unit,
  /* When the slider IS the answer (computeOf is the identity), showing the
     target card would print the solution. `direct` hides the compare cards,
     and a miss reveals the target but swaps the figures before the retry. */
  direct = false,
  controlLabel,
  controlDisplay = (v) => String(v),
  targetFoot,
  landingFoot = "adjust until the two match",
  /* Beginner lessons label this stage "Check". */
  stageLabel = "Checkpoint",
  passTitle,
  passBody,
  children,
}) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    setPicked(null);
    fetchChallenge(base, lessonId)
      .then((c) => {
        setChallenge(c);
        const s = c.controls?.slider;
        setValue(s ? s.min + (s.max - s.min) / 2 : 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [base, lessonId]);

  useEffect(load, [load]);

  const fields = challenge?.params?.fields;
  const target = useMemo(() => (fields && targetOf ? targetOf(fields) : null), [fields, targetOf]);
  const landing = useMemo(
    () => (fields && computeOf ? computeOf(fields, value) : null),
    [fields, value, computeOf],
  );

  const isChoice = Array.isArray(challenge?.controls?.choices);

  async function onSubmit() {
    if (isChoice && picked == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer(base, {
        challenge: challenge.challenge,
        params: challenge.params,
        answer: isChoice ? picked : value,
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

  const eyebrow = `Stage 3 · ${stageLabel}`;

  if (loading) {
    return (
      <Stage eyebrow={eyebrow}>
        <Sub>Your question is loading.</Sub>
      </Stage>
    );
  }

  if (error && !challenge) {
    return (
      <Stage eyebrow={eyebrow} headline="The checkpoint did not answer.">
        <Sub>
          Your work in this lesson is kept, and only the graded question needs the
          server. Try again in a moment.
        </Sub>
        <Actions>
          <button type="button" className={styles.primary} onClick={load}>Try again</button>
        </Actions>
        <p className={styles.errorDetail}>{error}</p>
      </Stage>
    );
  }

  const passed = Boolean(result?.passed || done);

  return (
    <Stage eyebrow={eyebrow} headline={isChoice ? challenge.prompt : headline}>
      {/* On a choice checkpoint the prompt is the headline, so a generic line
          never sits above the real question. A numeric checkpoint keeps both:
          the headline names the task, the prompt carries this learner's
          figures. */}
      {isChoice ? null : <Sub>{challenge.prompt}</Sub>}
      <LocalNotice show={challenge.local} />
      <Hint>
        {isChoice
          ? "Every learner gets the options in a different order, so a letter passed to you points at the wrong one."
          : "Every learner gets different figures, so an answer passed to you will fit their question and miss yours."}
      </Hint>

      {children}

      {isChoice ? (
        <ChoiceAnswer
          choices={challenge.controls.choices}
          picked={picked}
          onPick={(i) => {
            setPicked(i);
            // A new selection is a new attempt, so the old verdict goes away.
            if (result && !result.passed) setResult(null);
          }}
          result={result}
          passed={passed}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      ) : (
        <SliderAnswer
          slider={challenge.controls?.slider ?? { min: 0, max: 100, step: 1 }}
          value={value}
          onChange={setValue}
          target={target}
          landing={landing}
          unit={unit}
          direct={direct}
          controlLabel={controlLabel}
          controlDisplay={controlDisplay}
          targetFoot={targetFoot}
          landingFoot={landingFoot}
          result={result}
          passed={passed}
          submitting={submitting}
          onSubmit={onSubmit}
          onRetry={load}
        />
      )}

      {error && challenge ? <p className={styles.errorDetail}>{error}</p> : null}

      {passed ? (
        <div className={styles.passBox}>
          <div className={styles.passHead}>{passTitle}</div>
          {isChoice && result?.feedback ? <Body>{result.feedback}</Body> : null}
          <Body>{passBody}</Body>
          <Link to="/academy" className={styles.primaryLink}>
            Back to the track
            <Arrow />
          </Link>
        </div>
      ) : null}
    </Stage>
  );
}

/**
 * The same checkpoint with the beginner stage label as its default. Every choice
 * lesson sits in the beginner track and its callers never passed a label, so
 * this keeps them reading "Check". Any prop passed through wins.
 */
export function ChoiceCheckpoint(props) {
  return <Checkpoint stageLabel="Check" {...props} />;
}

/** The slider body of a checkpoint: the compare cards, the control, and the verdict. */
function SliderAnswer({
  slider, value, onChange, target, landing, unit, direct,
  controlLabel, controlDisplay, targetFoot, landingFoot,
  result, passed, submitting, onSubmit, onRetry,
}) {
  const tolerance = result?.tolerance ?? 0;
  const onTarget = landing != null && target != null && Math.abs(landing - target) <= (tolerance || Infinity);
  const missed = Boolean(result && !result.passed);

  return (
    <>
      {!direct ? (
        <div className={styles.checkGrid}>
          <div className={styles.checkCard}>
            <div className={styles.microLabel}>Target</div>
            <div className={styles.bigNumber}>{formatByUnit(target, unit)}</div>
            <div className={styles.checkFoot}>{targetFoot}</div>
          </div>
          <div className={styles.checkCard}>
            <div className={styles.microLabel}>Your answer gives</div>
            <div className={styles.bigNumber} style={{ color: onTarget ? "#5ba88a" : "#f5c09a" }}>
              {formatByUnit(landing, unit)}
            </div>
            <div className={styles.checkFoot}>{landingFoot}</div>
          </div>
        </div>
      ) : null}

      <Controls>
        <Control
          label={controlLabel}
          display={controlDisplay(value)}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={value}
          onChange={onChange}
          accent
        />
      </Controls>

      {!passed && !(direct && missed) ? (
        <Actions>
          <button type="button" className={styles.primary} onClick={onSubmit} disabled={submitting}>
            {submitting ? "Checking..." : "Submit answer"}
          </button>
        </Actions>
      ) : null}

      {missed ? (
        <div className={styles.missBox}>
          {direct
            ? `You answered ${formatByUnit(result.actual, result.unit)}. The target was ${formatByUnit(result.target, result.unit)}, accepted within ${formatByUnit(result.tolerance, result.unit)}. The next question uses new figures.`
            : `That gives ${formatByUnit(result.actual, result.unit)}. The target is ${formatByUnit(result.target, result.unit)}, accepted within ${formatByUnit(result.tolerance, result.unit)}. Adjust and submit again.`}
        </div>
      ) : null}

      {!passed && direct && missed ? (
        <Actions>
          <button type="button" className={styles.primary} onClick={onRetry}>
            Try a new question
          </button>
        </Actions>
      ) : null}
    </>
  );
}

/** The choice body of a checkpoint: the option list and the verdict. */
function ChoiceAnswer({ choices, picked, onPick, result, passed, submitting, onSubmit }) {
  // Only revealed once the answer is settled, so a miss does not hand it over.
  const correct = passed && typeof result?.target === "number" ? result.target : null;
  const missed = Boolean(result && !result.passed);

  return (
    <>
      <div className={styles.choices} role="radiogroup" aria-label="Answer options">
        {choices.map((text, i) => {
          const state =
            correct === i ? styles.choiceRight
            : missed && picked === i ? styles.choiceWrong
            : picked === i ? styles.choiceOn
            : "";
          return (
            <button
              key={text}
              type="button"
              role="radio"
              aria-checked={picked === i}
              className={`${styles.choice} ${state}`}
              disabled={passed}
              onClick={() => onPick(i)}
            >
              <span className={styles.choiceKey}>{KEYS[i] ?? i + 1}</span>
              <span>{text}</span>
            </button>
          );
        })}
      </div>

      {!passed ? (
        <Actions aside={picked == null ? "Choose an option." : null}>
          <button
            type="button"
            className={styles.primary}
            onClick={onSubmit}
            disabled={submitting || picked == null}
          >
            {submitting ? "Checking..." : "Submit answer"}
          </button>
        </Actions>
      ) : null}

      {missed ? (
        <div className={styles.missBox}>
          {result.feedback ?? "That one is wrong. Try another option."}
        </div>
      ) : null}
    </>
  );
}

/* ── Beginner explainers ─────────────────────────────────── */

/**
 * A labeled fact.
 *
 * The beginner lessons carry more plain statement and less live model than the
 * intermediate ones, so they need somewhere to put a sentence that matters
 * without dressing it up as a readout.
 */
export function Notes({ children }) {
  return <div className={styles.notes}>{children}</div>;
}

export function Note({ label, children }) {
  return (
    <div className={styles.note}>
      <span className={styles.noteLabel}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

/* ── Charts ──────────────────────────────────────────────── */

/**
 * A small line chart, sized to whatever width it is given.
 *
 * The beginner lessons show shapes rather than values: a balance going down, a
 * balance going up, a bar filling toward a marker. So this takes series in the
 * caller's own units and handles only the drawing.
 *
 * The viewBox tracks the measured width rather than a fixed number. A fixed
 * viewBox on a phone squeezes the plot and leaves the labels overlapping.
 */
export function LineChart({
  series,
  xMax,
  yMax,
  xLabel,
  yTicks = 3,
  xTicks = 4,
  formatY = (v) => String(Math.round(v)),
  formatX = (v) => String(Math.round(v)),
  label = "Chart",
  markLine,
}) {
  const [ref, width] = useElementWidth();

  const narrow = width < 480;
  const w = Math.max(width, 260);
  const h = narrow ? 190 : 240;
  const m = { top: 18, right: 14, bottom: 34, left: narrow ? 46 : 58 };

  const plotW = Math.max(w - m.left - m.right, 10);
  const plotH = Math.max(h - m.top - m.bottom, 10);

  const x = (v) => m.left + (xMax > 0 ? v / xMax : 0) * plotW;
  const y = (v) => m.top + (1 - (yMax > 0 ? v / yMax : 0)) * plotH;

  const path = (points) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`)
      .join(" ");

  const ys = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);
  const xs = Array.from({ length: xTicks + 1 }, (_, i) => (xMax / xTicks) * i);

  return (
    <div ref={ref}>
      {/* Nothing to draw until measured. Rendering at a guessed width first would
          show the chart jumping into place on every load. */}
      {width > 0 ? (
        <svg viewBox={`0 0 ${w} ${h}`} className={styles.chart} role="img" aria-label={label}>
          {ys.map((v) => (
            <g key={v}>
              <line x1={m.left} x2={w - m.right} y1={y(v)} y2={y(v)} className={styles.grid} />
              <text x={m.left - 8} y={y(v) + 4} className={styles.axisText} textAnchor="end">
                {formatY(v)}
              </text>
            </g>
          ))}

          {xs.map((v) => (
            <text key={v} x={x(v)} y={h - 16} className={styles.axisText} textAnchor="middle">
              {formatX(v)}
            </text>
          ))}
          {xLabel ? (
            <text x={w - m.right} y={h - 2} className={styles.axisText} textAnchor="end">
              {xLabel}
            </text>
          ) : null}

          {markLine != null ? (
            <line
              x1={m.left}
              x2={w - m.right}
              y1={y(markLine)}
              y2={y(markLine)}
              className={styles.highlight}
            />
          ) : null}

          {series.map((s) => (
            <path
              key={s.id}
              d={path(s.points)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width ?? 2.5}
              strokeDasharray={s.dashed ? "7 6" : undefined}
              strokeLinecap="round"
            />
          ))}
        </svg>
      ) : (
        <div className={styles.chartPlaceholder} />
      )}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className={styles.legend}>
      {items.map((i) => (
        <span key={i.label} className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** The stage labels the beginner track uses. Plainer than the intermediate three. */
export const BEGINNER_STAGES = [
  { id: "predict", label: "Learn" },
  { id: "explore", label: "Try" },
  { id: "checkpoint", label: "Check" },
];

/** The stage labels the intermediate track uses. LessonPage's default matches. */
export const INTERMEDIATE_STAGES = [
  { id: "predict", label: "Predict" },
  { id: "explore", label: "Explore" },
  { id: "checkpoint", label: "Checkpoint" },
];
