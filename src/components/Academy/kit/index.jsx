import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import styles from "../lesson.module.css";
import { fetchChallenge, saveCompletion, submitAnswer } from "../lib/api";
import LocalNotice from "../LocalNotice";

/**
 * Shared parts every lesson is built from.
 *
 * Seven lessons repeat the same three-stage shape, so the shape lives here and a
 * lesson supplies only what is different about it: the situation it sets up, the
 * model it lets you push on, and the number its checkpoint asks for.
 *
 * Repetition is the smaller reason. The checkpoint carries error states, expiry
 * handling and completion storage, and seven hand-written copies of that would
 * drift apart.
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

/* ── Checkpoint ──────────────────────────────────────────── */

/**
 * The graded stage.
 *
 * Every lesson's checkpoint has the same anatomy: a server-set prompt, a target,
 * a live readout of where the learner's current answer lands, one control, and a
 * submit. What differs is only how the readout is computed from the control, so
 * that is the one thing a lesson passes in.
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
  controlLabel,
  controlDisplay,
  targetFoot,
  landingFoot = "adjust until the two match",
  passTitle,
  passBody,
  children,
}) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
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

  const target = useMemo(() => (challenge ? targetOf(challenge.params.fields) : null), [challenge, targetOf]);
  const landing = useMemo(
    () => (challenge ? computeOf(challenge.params.fields, value) : null),
    [challenge, value, computeOf],
  );

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer(base, {
        challenge: challenge.challenge,
        params: challenge.params,
        answer: value,
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
      <Stage eyebrow="Stage 3 · Checkpoint">
        <Sub>Preparing your question...</Sub>
      </Stage>
    );
  }

  if (error && !challenge) {
    return (
      <Stage eyebrow="Stage 3 · Checkpoint" headline="The checkpoint is not answering.">
        <Sub>
          Everything you worked out in this lesson still stands. Only the graded question
          needs the server, so try again in a moment.
        </Sub>
        <Actions>
          <button type="button" className={styles.primary} onClick={load}>Try again</button>
        </Actions>
        <p className={styles.errorDetail}>{error}</p>
      </Stage>
    );
  }

  const passed = result?.passed || done;
  const tolerance = result?.tolerance ?? 0;
  const onTarget = landing != null && target != null && Math.abs(landing - target) <= (tolerance || Infinity);
  const slider = challenge.controls?.slider ?? { min: 0, max: 100, step: 1 };

  return (
    <Stage eyebrow="Stage 3 · Checkpoint" headline={headline}>
      <Sub>{challenge.prompt}</Sub>
      <LocalNotice show={challenge.local} />
      <Hint>
        Every learner is given different figures, so an answer shared with you will not fit
        your version of the question.
      </Hint>

      {children}

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

      <Controls>
        <Control
          label={controlLabel}
          display={controlDisplay(value)}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={value}
          onChange={setValue}
          accent
        />
      </Controls>

      {!passed ? (
        <Actions>
          <button type="button" className={styles.primary} onClick={onSubmit} disabled={submitting}>
            {submitting ? "Checking..." : "Submit answer"}
          </button>
        </Actions>
      ) : null}

      {error && challenge ? <p className={styles.errorDetail}>{error}</p> : null}

      {result && !result.passed ? (
        <div className={styles.missBox}>
          That gives {formatByUnit(result.actual, result.unit)} against a target of{" "}
          {formatByUnit(result.target, result.unit)}, accepted within{" "}
          {formatByUnit(result.tolerance, result.unit)}. Adjust and submit again.
        </div>
      ) : null}

      {passed ? (
        <div className={styles.passBox}>
          <div className={styles.passHead}>{passTitle}</div>
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
