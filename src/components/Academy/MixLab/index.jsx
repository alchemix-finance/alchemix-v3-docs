import React, { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { Checkpoint } from "../kit";
import { CAPS, MAX_AGGRESSIVE_PCT, blend, capBreach, maxModeratePct } from "../lib/myt";

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
 *
 * The Moderate ceiling shown on its control moves as Aggressive fills, because
 * the two share one. That is the rule the docs state in a footnote, and a control
 * that visibly tightens teaches it better than the footnote does.
 */

const DEMO = { conservative: 4.5, moderate: 9.0, aggressive: 18.0 };

export default function MixLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Lesson 3 complete."
      passBody="You can say what the DAO is allowed to hold, and why that ceiling is what makes a given LTV safe to borrow at."
    />
  );
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
        <StrategyCard klass="Moderate" apr={DEMO.moderate} note="It depends on an outside market to price or to exit, or it can lock withdrawals for a time." tone="mod" />
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
            The DAO caps Aggressive strategies at {MAX_AGGRESSIVE_PCT}% of the vault.
          </div>
          <p className={styles.revealBody}>
            {guess > MAX_AGGRESSIVE_PCT
              ? `Your ${guess}% is above the cap. `
              : `Your ${guess}% is within the cap. `}
            Every strategy is classified Conservative, Moderate or Aggressive, and each
            class carries two ceilings: one on a single strategy, and one on everything at
            that risk level and above.
          </p>

          <div className={own.capTable}>
            <div className={own.capRow}>
              <span className={own.capName}>Conservative</span>
              <span className={own.capValue}>No cap</span>
            </div>
            <div className={own.capRow}>
              <span className={own.capName}>Moderate</span>
              <span className={own.capValue}>40% per strategy, 60% with Aggressive</span>
            </div>
            <div className={own.capRow}>
              <span className={own.capName}>Aggressive</span>
              <span className={own.capValue}>20% per strategy, 20% in total</span>
            </div>
          </div>

          <p className={styles.revealBody}>
            The second figure counts everything at that level and riskier. Moderate's 60%
            covers Moderate and Aggressive together, so filling Aggressive to 20% leaves
            Moderate 40% of the 60% they share.
          </p>
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
  // The ceiling on Moderate depends on what Aggressive already takes, because the
  // two share one. It tightens on screen as Aggressive fills.
  const modCap = maxModeratePct(aggr);
  const modOver = mod > modCap;
  const aggrOver = aggr > MAX_AGGRESSIVE_PCT;
  const breach = capBreach(mod, aggr);
  const legal = !breach;
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
          {breach ?? "Within every cap"}
        </div>
      </div>

      <div className={styles.controls}>
        <AllocSlider
          label="Moderate" value={mod} onChange={setMod} max={80} cap={modCap} over={modOver}
        />
        <AllocSlider
          label="Aggressive" value={aggr} onChange={setAggr} max={40} cap={MAX_AGGRESSIVE_PCT} over={aggrOver}
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

  const over = capBreach(mod, aggr) !== null;
  useEffect(() => {
    if (over) setSawBreach(true);
  }, [over]);

  const best = useMemo(
    () => blend(DEMO, maxModeratePct(MAX_AGGRESSIVE_PCT), MAX_AGGRESSIVE_PCT),
    [],
  );
  const atBest = Math.abs(blend(DEMO, mod, aggr) - best) < 0.005 && !over;

  return (
    <>
      <div className={styles.eyebrow}>Stage 2 · Explore</div>
      <h1 className={styles.headline}>Raise the yield until a ceiling stops you.</h1>
      <p className={styles.sub}>
        Push a class past its ceiling and the vault turns the composition away. Moderate and
        Aggressive share a ceiling, so filling one tightens the other.
      </p>

      <Allocator aprs={DEMO} mod={mod} aggr={aggr} setMod={setMod} setAggr={setAggr} />

      {atBest || sawBreach ? (
        <div className={styles.reveal}>
          <div className={styles.revealHead}>
            {best.toFixed(2)}% is the highest blended APR inside every cap.
          </div>
          <p className={styles.revealBody}>
            That mix fills Aggressive to its {MAX_AGGRESSIVE_PCT}% ceiling and gives Moderate
            the {maxModeratePct(MAX_AGGRESSIVE_PCT)}% left of the 60% those two share, leaving
            the rest in Conservative, which has no cap at all. Anything higher needs a
            composition the DAO could not allocate.
            {!sawBreach ? " Push either slider past a ceiling as well." : ""}
          </p>
          <p className={styles.revealBody}>
            Your collateral earns this blend while your loan clears. A vault free to hold
            100% Aggressive would make a high LTV genuinely dangerous, and those same
            ceilings are what prevent it.
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

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
