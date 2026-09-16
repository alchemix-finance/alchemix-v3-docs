import React, { useCallback, useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase, fetchChallenge, saveCompletion, submitAnswer } from "../lib/api";
import { CAPS, blend } from "../lib/myt";
import LocalNotice from "../LocalNotice";

/**
 * Intermediate lesson 3: inside the Mix-Yield Token.
 *
 * Your collateral does not sit still while a loan runs. It sits in the MYT,
 * spread across strategies the DAO classifies Conservative, Moderate or
 * Aggressive, and each class carries a cap on how much of the vault it may
 * occupy.
 *
 * The caps are the lesson. They are the reason a given LTV is safe, which is what
 * the LTV lesson builds on. The learner is put in the position of someone reading
 * a governance proposal: chase the yield, hit the cap, understand why it is there.
 *
 * Allocation is a DAO decision, never a user one. The copy is careful about that:
 * the learner reasons about a proposed allocation, they do not set their own.
 */

const DEMO = { conservative: 4.5, moderate: 9.0, aggressive: 18.0 };

export default function MixLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Predict onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Explore onDone={() => onStage("checkpoint")} />;
  return <Checkpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} />;
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState(50);
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <div className={styles.eyebrow}>Stage 1 · Predict</div>
      <h1 className={styles.headline}>Your collateral keeps working while the loan runs.</h1>
      <p className={styles.sub}>
        Deposits are held in the Mix-Yield Token, which spreads them across strategies
        the DAO has reviewed and classified. The Aggressive strategy below pays far more
        than the other two.
      </p>

      <div className={own.strategyGrid}>
        <StrategyCard klass="Conservative" apr={DEMO.conservative} note="The vault enters and exits directly, prices it off what it actually holds, and withdraws on demand." tone="cons" />
        <StrategyCard klass="Moderate" apr={DEMO.moderate} note="It leans on an outside market to price or to exit, or it can lock withdrawals for a time." tone="mod" />
        <StrategyCard klass="Aggressive" apr={DEMO.aggressive} note="It passes the Moderate tests and carries one factor more, such as being newer or less proven." tone="aggr" />
      </div>

      <div className={styles.panel}>
        <span className={`${styles.corner} ${styles.cornerTl}`} />
        <span className={`${styles.corner} ${styles.cornerTr}`} />
        <div className={styles.question}>
          If the goal were the highest possible yield, what share of the vault would go
          to the Aggressive strategy?
        </div>
        <div className={styles.guessHead}>
          <span className={styles.microLabel}>Share in Aggressive</span>
          <span className={styles.guessValue} style={{ color: "#d4952a" }}>{guess}%</span>
        </div>
        <input
          type="range" min={0} max={100} step={1} value={guess} disabled={revealed}
          onChange={(e) => setGuess(Number(e.target.value))}
          className={styles.range} style={{ accentColor: "#d4952a" }}
          aria-label="Share in Aggressive"
        />
      </div>

      {!revealed ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => setRevealed(true)}>
            Commit and check the rules
            <ArrowIcon />
          </button>
        </div>
      ) : (
        <div className={styles.reveal}>
          <div className={styles.revealHead}>
            The DAO caps Aggressive strategies at 10% of the vault.
          </div>
          <p className={styles.revealBody}>
            {guess > 10
              ? `Your ${guess}% is above the cap. `
              : `Your ${guess}% is within the cap. `}
            Every strategy is classified Conservative, Moderate or Aggressive, and each
            class carries a ceiling on how much of the Mix-Yield Token it may occupy.
          </p>

          <div className={own.capTable}>
            <div className={own.capRow}>
              <span className={own.capName}>Conservative</span>
              <span className={own.capValue}>No cap</span>
            </div>
            <div className={own.capRow}>
              <span className={own.capName}>Moderate</span>
              <span className={own.capValue}>25% per strategy, 40% in total</span>
            </div>
            <div className={own.capRow}>
              <span className={own.capName}>Aggressive</span>
              <span className={own.capValue}>10% per strategy, 10% in total</span>
            </div>
          </div>

          <p className={styles.revealBody}>
            The caps are what make a high LTV safe to borrow at. Your borrowing headroom
            rests on what the vault underneath is allowed to hold.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            Build a mix inside the caps
            <ArrowIcon />
          </button>
        </div>
      )}
    </>
  );
}

function StrategyCard({ klass, apr, note, tone }) {
  return (
    <div className={`${own.strategy} ${own[tone]}`}>
      <div className={own.strategyClass}>{klass}</div>
      <div className={own.strategyApr}>{apr.toFixed(1)}%</div>
      <div className={own.strategyNote}>{note}</div>
    </div>
  );
}

/* ── Shared allocation control ───────────────────────────── */

function Allocator({ aprs, mod, aggr, setMod, setAggr }) {
  const consPct = 100 - mod - aggr;
  const modOver = mod > CAPS.moderate * 100;
  const aggrOver = aggr > CAPS.aggressive * 100;
  const negative = consPct < 0;
  const legal = !modOver && !aggrOver && !negative;
  const apr = blend(aprs, mod, aggr);

  return (
    <>
      <div className={own.bar} role="img" aria-label={`Conservative ${consPct}%, Moderate ${mod}%, Aggressive ${aggr}%`}>
        <span className={`${own.seg} ${own.segCons}`} style={{ width: `${Math.max(consPct, 0)}%` }} />
        <span className={`${own.seg} ${own.segMod}`} style={{ width: `${mod}%` }} />
        <span className={`${own.seg} ${own.segAggr}`} style={{ width: `${aggr}%` }} />
      </div>
      <div className={own.barKey}>
        <span><i className={own.dotCons} />Conservative {Math.max(consPct, 0)}%</span>
        <span><i className={own.dotMod} />Moderate {mod}%</span>
        <span><i className={own.dotAggr} />Aggressive {aggr}%</span>
      </div>

      <div className={own.blendRow}>
        <div>
          <div className={styles.microLabel}>Blended APR</div>
          <div className={own.blendValue} style={{ color: legal ? "#5ba88a" : "#d4645a" }}>
            {apr.toFixed(2)}%
          </div>
        </div>
        <div className={legal ? own.legalOk : own.legalBad}>
          {negative
            ? "Allocation exceeds 100%"
            : aggrOver
              ? "Breaches the 10% Aggressive cap"
              : modOver
                ? "Breaches the 40% Moderate cap"
                : "Within every cap"}
        </div>
      </div>

      <div className={styles.controls}>
        <AllocSlider
          label="Moderate" value={mod} onChange={setMod} max={60} cap={CAPS.moderate * 100} over={modOver}
        />
        <AllocSlider
          label="Aggressive" value={aggr} onChange={setAggr} max={30} cap={CAPS.aggressive * 100} over={aggrOver}
        />
      </div>
    </>
  );
}

function AllocSlider({ label, value, onChange, max, cap, over }) {
  return (
    <div className={`${styles.control} ${over ? own.controlOver : ""}`}>
      <div className={styles.controlHead}>
        <span className={styles.microLabel}>{label}</span>
        <span className={styles.controlValue} style={over ? { color: "#d4645a" } : undefined}>
          {value}%
        </span>
      </div>
      <input
        type="range" min={0} max={max} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={over ? { accentColor: "#d4645a" } : undefined}
        aria-label={`${label} allocation`}
      />
      {/* The slider travels past the cap on purpose. A control that simply
          stopped would hide the rule; one that turns red teaches it. */}
      <div className={over ? own.capWarn : own.capNote}>Cap {cap}%</div>
    </div>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [mod, setMod] = useState(20);
  const [aggr, setAggr] = useState(5);
  const [sawBreach, setSawBreach] = useState(false);

  const over = mod > CAPS.moderate * 100 || aggr > CAPS.aggressive * 100;
  useEffect(() => {
    if (over) setSawBreach(true);
  }, [over]);

  const best = useMemo(() => blend(DEMO, CAPS.moderate * 100, CAPS.aggressive * 100), []);
  const atBest = Math.abs(blend(DEMO, mod, aggr) - best) < 0.005 && !over;

  return (
    <>
      <div className={styles.eyebrow}>Stage 2 · Explore</div>
      <h1 className={styles.headline}>Raise the yield until a ceiling stops you.</h1>
      <p className={styles.sub}>
        Push a class past its ceiling and the vault turns the composition away.
      </p>

      <Allocator aprs={DEMO} mod={mod} aggr={aggr} setMod={setMod} setAggr={setAggr} />

      {atBest || sawBreach ? (
        <div className={styles.reveal}>
          <div className={styles.revealHead}>
            {best.toFixed(2)}% is the highest blended APR inside every cap.
          </div>
          <p className={styles.revealBody}>
            That mix fills Aggressive to its 10% ceiling and Moderate to its 40% ceiling,
            leaving the other 50% in Conservative, which is free to take as much as it
            likes. Anything higher needs a composition the DAO forbids.
            {!sawBreach
              ? " Push either slider past a ceiling as well."
              : ""}
          </p>
          <p className={styles.revealBody}>
            Your collateral earns this blend while your loan clears, and those same ceilings
            are protecting your borrowing headroom. A vault free to hold 100% Aggressive
            would make a high LTV genuinely dangerous.
          </p>
          <button type="button" className={styles.primary} onClick={onDone}>
            Take the checkpoint
            <ArrowIcon />
          </button>
        </div>
      ) : (
        <p className={styles.hint}>
          Find the highest blended APR that stays inside every cap.
          {!sawBreach ? " Push a slider past a ceiling as well." : ""}
        </p>
      )}
    </>
  );
}

/* ── Stage 3: checkpoint ─────────────────────────────────── */

/**
 * This lesson keeps its own checkpoint instead of using the shared one, because
 * the answer is produced by two controls working against each other, and the
 * shared checkpoint has a single slider. The allocator the learner already used
 * in stage 2 is the natural control, so the checkpoint reuses that.
 */

function Checkpoint({ base, lessonId, done, onPass }) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mod, setMod] = useState(20);
  const [aggr, setAggr] = useState(5);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    fetchChallenge(base, lessonId)
      .then(setChallenge)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [base, lessonId]);

  useEffect(load, [load]);

  const aprs = useMemo(() => {
    if (!challenge) return null;
    const f = challenge.params.fields;
    return { conservative: f.conservativeApr, moderate: f.moderateApr, aggressive: f.aggressiveApr };
  }, [challenge]);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer(base, {
        challenge: challenge.challenge,
        params: challenge.params,
        // The answer is the blended APR they reached, which is what the prompt
        // asks for. The grader recomputes the optimum from the same figures.
        answer: Number(blend(aprs, mod, aggr).toFixed(4)),
      });
      setResult(res);
      if (res.passed && res.completion) {
        saveCompletion(lessonId, res.completion);
        onPass();
      }
    } catch (e) {
      setError(e.message);
      if (e.code === "bad_challenge") load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className={styles.eyebrow}>Stage 3 · Checkpoint</div>
        <p className={styles.sub}>Preparing your question...</p>
      </>
    );
  }

  if (error && !challenge) {
    return (
      <>
        <div className={styles.eyebrow}>Stage 3 · Checkpoint</div>
        <h1 className={styles.headline}>The checkpoint is not answering.</h1>
        <p className={styles.sub}>
          Everything you worked out in this lesson still stands. Only the graded question
          needs the server, so try again in a moment.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={load}>Try again</button>
        </div>
        <p className={styles.errorDetail}>{error}</p>
      </>
    );
  }

  const passed = result?.passed || done;

  return (
    <>
      <div className={styles.eyebrow}>Stage 3 · Checkpoint</div>
      <h1 className={styles.headline}>Find the best composition inside the caps.</h1>
      <p className={styles.sub}>{challenge.prompt}</p>
      <LocalNotice show={challenge.local} />
      <p className={styles.hint}>
        Every learner gets different figures, so an answer someone passes you will fit
        their question and miss yours.
      </p>

      <Allocator aprs={aprs} mod={mod} aggr={aggr} setMod={setMod} setAggr={setAggr} />

      {!passed ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onSubmit} disabled={submitting}>
            {submitting ? "Checking..." : "Submit this allocation"}
          </button>
        </div>
      ) : null}

      {error && challenge ? <p className={styles.errorDetail}>{error}</p> : null}

      {result && !result.passed ? (
        <div className={styles.missBox}>
          That allocation blends to {result.actual}%. The best composition inside the caps
          reaches {result.target}%, accepted within {result.tolerance} of a percentage
          point. Check whether both ceilings are filled.
        </div>
      ) : null}

      {passed ? (
        <div className={styles.passBox}>
          <div className={styles.passHead}>Lesson 3 complete.</div>
          <p className={styles.revealBody}>
            You found the highest yield the risk caps allow. Those same caps are what make
            a given LTV safe to borrow at, because they give you a worst case to size
            against.
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

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
