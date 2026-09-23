import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, Gate, GuessSlider, Panel, Primary,
  Question, Reveal, SHOTS, Stage, Sub, said,
} from "../kit";
import { MAX_AGGRESSIVE_PCT, maxModeratePct } from "../lib/myt";

/**
 * Intermediate lesson 5: inside the Mix-Yield Token.
 *
 * Your collateral does not sit still while a loan runs. It sits in the MYT,
 * spread across strategies the DAO classifies Conservative, Moderate or
 * Aggressive, and each class carries a cap on how much of the vault it may
 * occupy.
 *
 * The learner reads an allocation the way the vault's Info tab shows it and
 * works out what a failed class would cost the vault: today, and at the most
 * the caps allow. That is the reading a borrower does before choosing an LTV,
 * which is the next lesson.
 *
 * It used to put the learner in the DAO's seat, allocating strategies to chase
 * the highest blended APR inside the caps. No user makes that decision, and the
 * opening question ("for the highest yield, how much goes in Aggressive?") had
 * an obvious answer the reveal did not address.
 *
 * Allocation is a DAO decision, never a user one. The copy is careful about that.
 */

/** Example APRs for the three class cards. Riskier pays more. */
const DEMO = { conservative: 4.5, moderate: 9.0, aggressive: 18.0 };

/** An example of today's mix, the kind the Info tab lists. Well under the caps. */
const TODAY = { moderate: 28, aggressive: 12 };

/** The riskiest mix the caps allow: Aggressive full, Moderate the rest of the shared 60%. */
const AT_CAPS = { moderate: maxModeratePct(MAX_AGGRESSIVE_PCT), aggressive: MAX_AGGRESSIVE_PCT };

/** Backing lost, in percent of the vault, when each class loses the given share of itself. */
const lostOf = (mix, aggrLoss, modLoss) => (mix.aggressive * aggrLoss + mix.moderate * modLoss) / 100;

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
      passTitle="Lesson 5 complete."
      passBody="You can read what a vault holds today, work out what a failed class would cost it, and say the most the DAO's caps allow it to put at risk."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState(30);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Predict" headline="Your collateral is spread across three classes of strategy.">
      <Sub>
        Deposits are held in the Mix-Yield Token, which spreads them across strategies the DAO
        has reviewed and sorted into three classes by risk. A vault's Info tab lists each
        strategy, its class and its share of the vault. This one holds{" "}
        {100 - TODAY.moderate - TODAY.aggressive}% Conservative, {TODAY.moderate}% Moderate and{" "}
        {TODAY.aggressive}% Aggressive.
      </Sub>

      <div className={own.strategyGrid}>
        <StrategyCard klass="Conservative" apr={DEMO.conservative} note="Simple to enter and exit, priced off its own backing, and withdrawable on demand." tone="cons" />
        <StrategyCard klass="Moderate" apr={DEMO.moderate} note="Depends on an outside market to price or to exit, or can lock withdrawals for a time." tone="mod" />
        <StrategyCard klass="Aggressive" apr={DEMO.aggressive} note="Has Moderate's risks and one more, such as being newer or less proven." tone="aggr" />
      </div>

      <MixBar mix={TODAY} />

      <Panel>
        <Question>
          Every Aggressive strategy in this vault fails and goes to zero. How much of the
          vault's backing is lost?
        </Question>
        <GuessSlider
          label="Backing lost"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#d4952a"
          min={0}
          max={60}
          format={(v) => `${v}%`}
          scale={["Nothing", "60%"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Only the Aggressive strategies fail.">
          <Primary onClick={() => setRevealed(true)}>Commit and fail them</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${TODAY.aggressive}%. A failed class costs the vault the share it holds.`}
          onNext={onDone}
          nextLabel="Fail a class at the caps"
        >
          <Body>
            {said(guess, TODAY.aggressive, (v) => `${v}%`)}
            Today Aggressive holds {TODAY.aggressive}% of this vault, so losing all of it costs
            the vault {TODAY.aggressive}% of its backing, and every position in it loses the
            same share of its collateral.
          </Body>
          <Body>
            The DAO can move the mix, up to a cap on each class. The riskier the class, the
            less of the vault it may hold:
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
            Today's mix is what your collateral is in now. The caps are how far the DAO can
            take it while your loan is open, without asking you.
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

/** An allocation drawn the way the Info tab lists it, as one bar with a key. */
function MixBar({ mix }) {
  const cons = 100 - mix.moderate - mix.aggressive;
  return (
    <>
      <div className={own.bar} role="img" aria-label={`Conservative ${cons}%, Moderate ${mix.moderate}%, Aggressive ${mix.aggressive}%`}>
        <span className={`${own.seg} ${own.segCons}`} style={{ width: `${cons}%` }} />
        <span className={`${own.seg} ${own.segMod}`} style={{ width: `${mix.moderate}%` }} />
        <span className={`${own.seg} ${own.segAggr}`} style={{ width: `${mix.aggressive}%` }} />
      </div>
      <div className={own.barKey}>
        <span><i className={own.dotCons} />Conservative {cons}%</span>
        <span><i className={own.dotMod} />Moderate {mix.moderate}%</span>
        <span><i className={own.dotAggr} />Aggressive {mix.aggressive}%</span>
      </div>
    </>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [aggrLoss, setAggrLoss] = useState(100);
  const [modLoss, setModLoss] = useState(0);
  const [moved, setMoved] = useState({ aggr: false, mod: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const today = lostOf(TODAY, aggrLoss, modLoss);
  const atCaps = lostOf(AT_CAPS, aggrLoss, modLoss);

  return (
    <Stage eyebrow="Stage 2 · Explore" headline="Fail a class, and read what the vault loses.">
      <Sub>
        The same two classes can fail in part or in full. Read the loss against today's mix
        and against the riskiest mix the caps allow, {100 - AT_CAPS.moderate - AT_CAPS.aggressive}%
        Conservative, {AT_CAPS.moderate}% Moderate and {AT_CAPS.aggressive}% Aggressive.
      </Sub>

      <div className={own.mixes}>
        <div className={own.mixPanel}>
          <div className={styles.microLabel}>Today's mix</div>
          <MixBar mix={TODAY} />
          <div className={styles.statLabel}>Backing lost</div>
          <div className={own.mixLost}>{today.toFixed(1)}%</div>
        </div>
        <div className={own.mixPanel}>
          <div className={styles.microLabel}>At the caps</div>
          <MixBar mix={AT_CAPS} />
          <div className={styles.statLabel}>Backing lost</div>
          <div className={own.mixLost} style={{ color: "#d4952a" }}>{atCaps.toFixed(1)}%</div>
        </div>
      </div>

      <Controls>
        <Control
          label="Aggressive strategies lose"
          display={`${aggrLoss}% of their value`}
          min={0} max={100} step={5}
          value={aggrLoss}
          onChange={(v) => { setAggrLoss(v); mark("aggr"); }}
          accent
        />
        <Control
          label="Moderate strategies lose"
          display={`${modLoss}% of their value`}
          min={0} max={100} step={5}
          value={modLoss}
          onChange={(v) => { setModLoss(v); mark("mod"); }}
        />
      </Controls>

      {moved.aggr && moved.mod ? (
        <Reveal
          title="The loss is each class's share of the vault, times how much of it failed."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            Today's mix is what you are exposed to now. The caps are the most the DAO can put
            at risk while your loan is open, so they give the worst case: {MAX_AGGRESSIVE_PCT}%
            of the vault if every Aggressive strategy fails, and 60% if the Moderate ones fail
            with them.
          </Body>
          <Body>
            The caps are checked when the DAO allocates, and they are measured against the
            size of the vault. A run of withdrawals can leave an existing allocation above its
            cap until the DAO rebalances.
          </Body>
          <Body>
            A loss of backing is the one thing that can push a position toward liquidation.
            The next lesson turns the loss you plan for into the highest LTV that survives it.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the checkpoint" hint="Move both controls to continue." />
      )}

      <AppShot shot={SHOTS.strategies}>
        A real allocation, on a vault's Info tab. Each strategy is listed with its risk level,
        what it earns, and how much of the vault it holds.
      </AppShot>
    </Stage>
  );
}
