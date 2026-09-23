import React, { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, AppShot, Body, Checkpoint, Controls, Gate, GuessSlider, Panel, Primary, Question,
  Reveal, SHOTS, Stage, Sub,
} from "../kit";
import { MAX_AGGRESSIVE_PCT, blend, capBreach, maxModeratePct } from "../lib/myt";

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
 *
 * The stages are built from the kit. The allocator is this lesson's own control,
 * because each of its sliders carries a cap line that turns red past the ceiling,
 * which the kit's plain control has no place for.
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
    <Stage eyebrow="Stage 1 · Predict" headline="Your collateral keeps working while the loan runs.">
      <Sub>
        Deposits are held in the Mix-Yield Token, which spreads them across strategies
        the DAO has reviewed and sorted into three classes by risk. The Aggressive
        strategy below pays far more than the other two.
      </Sub>

      <div className={own.strategyGrid}>
        <StrategyCard klass="Conservative" apr={DEMO.conservative} note="Simple to enter and exit, priced off its own backing, and withdrawable on demand." tone="cons" />
        <StrategyCard klass="Moderate" apr={DEMO.moderate} note="Depends on an outside market to price or to exit, or can lock withdrawals for a time." tone="mod" />
        <StrategyCard klass="Aggressive" apr={DEMO.aggressive} note="Has Moderate's risks and one more, such as being newer or less proven." tone="aggr" />
      </div>

      <Panel>
        <Question>
          If the goal were the highest possible yield, what share of the vault would go
          to the Aggressive strategy?
        </Question>
        <GuessSlider
          label="Share in Aggressive"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#d4952a"
        />
      </Panel>

      {!revealed ? (
        <Actions>
          <Primary onClick={() => setRevealed(true)}>Commit and check the rules</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`The DAO caps Aggressive strategies at ${MAX_AGGRESSIVE_PCT}% of the vault.`}
          onNext={onDone}
          nextLabel="Build a mix inside the caps"
        >
          <Body>
            {guess > MAX_AGGRESSIVE_PCT
              ? `Your ${guess}% is above the cap. `
              : `Your ${guess}% is within the cap. `}
            The riskier the class, the less of the vault it may hold.
          </Body>

          <div className={own.capTable}>
            <div className={own.capRow}>
              <span className={own.capName}>Aggressive</span>
              <span className={own.capValue}>At most 20% of the vault</span>
            </div>
            <div className={own.capRow}>
              <span className={own.capName}>Moderate and Aggressive together</span>
              <span className={own.capValue}>At most 60% of the vault, and no single Moderate strategy above 40%</span>
            </div>
            <div className={own.capRow}>
              <span className={own.capName}>Conservative</span>
              <span className={own.capValue}>No limit, so at least 40% of the vault is always Conservative</span>
            </div>
          </div>

          <Body>
            Fill Aggressive to its 20% and the Moderate strategy can take 40%, which is what
            is left of the 60% the two share. That mix, 40% Conservative, 40% Moderate and
            20% Aggressive, is the riskiest vault the DAO could allocate.
          </Body>
          <Body>
            The caps are what make a high LTV safe to borrow at. Suppose the whole Aggressive
            slice went to zero: that is a 20% loss of backing, and a position opened low
            enough survives it. Your borrowing headroom depends on what the vault underneath
            is allowed to hold.
          </Body>
        </Reveal>
      )}
    </Stage>
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

      <Controls>
        <AllocSlider
          label="Moderate" value={mod} onChange={setMod} max={80} cap={modCap} over={modOver}
          note="the rest of the 60% shared with Aggressive"
        />
        <AllocSlider
          label="Aggressive" value={aggr} onChange={setAggr} max={40} cap={MAX_AGGRESSIVE_PCT} over={aggrOver}
        />
      </Controls>
    </>
  );
}

function AllocSlider({ label, value, onChange, max, cap, note, over }) {
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
      <div className={over ? own.capWarn : own.capNote}>Cap {cap}%{note ? `, ${note}` : ""}</div>
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
    <Stage eyebrow="Stage 2 · Explore" headline="Raise the yield until a ceiling stops you.">
      <Sub>
        Push a class past its cap and the DAO could not allocate that mix. Moderate and
        Aggressive share the 60% cap, so filling one tightens the other.
      </Sub>

      <Allocator aprs={DEMO} mod={mod} aggr={aggr} setMod={setMod} setAggr={setAggr} />

      {atBest || sawBreach ? (
        <Reveal
          title={`${best.toFixed(2)}% is the highest blended APR inside every cap.`}
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            That mix fills Aggressive to its {MAX_AGGRESSIVE_PCT}% ceiling and gives Moderate
            the {maxModeratePct(MAX_AGGRESSIVE_PCT)}% left of the 60% those two share, leaving
            the rest in Conservative, which has no cap at all. Anything higher needs a
            composition the DAO could not allocate.
            {!sawBreach ? " Push either slider past a ceiling as well." : ""}
          </Body>
          <Body>
            Your collateral earns this blend while your loan clears. A vault free to hold
            100% Aggressive would make a high LTV dangerous, and those same
            ceilings are what prevent it.
          </Body>
          <Body>
            The caps are checked when the DAO allocates, and they are measured against the
            size of the vault. A run of withdrawals can leave an existing allocation above
            its cap until the DAO rebalances.
          </Body>
        </Reveal>
      ) : (
        <Gate
          label="Take the checkpoint"
          hint={`Find the highest blended APR that stays inside every cap.${sawBreach ? "" : " Push a slider past a cap as well."}`}
        />
      )}

      <AppShot shot={SHOTS.strategies}>
        The real allocation, on a vault's Info tab. Each strategy is listed with the risk
        level these ceilings apply to, what it earns, and how much of the vault it holds.
      </AppShot>
    </Stage>
  );
}
