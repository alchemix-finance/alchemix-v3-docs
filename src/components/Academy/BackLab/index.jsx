import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "../parts.module.css";
import { apiBase } from "../lib/api";
import { MAX_LTV, ltvOf, withdrawable } from "../lib/protocol";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Note,
  Notes, Panel, PositionCard, Primary, Question, Reveal, SHOTS, Stage, Sub, money,
} from "../kit";

/**
 * Intermediate lesson 1: reading your position.
 *
 * Deposit 10,000, borrow 5,000, and the obvious guess is that 5,000 is still
 * free to withdraw. It is 4,444, because the debt left behind still has to sit
 * under the 90% cap. The learner reads the position card, commits to a figure,
 * then works both routes out: withdraw what is free, or repay to free more.
 *
 * The explore stage carries the full position card, health factor and earmarked
 * band included. This is the lesson about reading the screen, and it is the one
 * place every stat the app prints should appear at once.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;

/**
 * An example earmark: a fifth of the balance reserved for the next
 * redemption. A real one is sized to the position's share of total system debt,
 * so it depends on the whole market rather than on this position.
 */
const EARMARK_SHARE = 0.2;

/** What the guess slider moves in, and therefore what counts as landing on it. */
const STEP = 100;

export default function BackLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Learn onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Try onDone={() => onStage("checkpoint")} />;

  return (
    <Checkpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      passTitle="Lesson 1 complete."
      passBody="You can read a position card and say how much of the deposit you can withdraw today."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(BORROW);
  const [revealed, setRevealed] = useState(false);

  const truth = withdrawable(DEPOSIT, BORROW);
  // The slider moves in steps of 100, so the exact 4,444 is not on it. Landing on
  // the nearest position it does have is the right answer, and is graded as one.
  const nearest = Math.round(truth / STEP) * STEP;
  const exact = guess === nearest;
  const close = !exact && Math.abs(guess - truth) <= 300;

  return (
    <Stage eyebrow="Stage 1 · Predict" headline="You want part of the deposit back.">
      <Sub>
        Your position holds {money(DEPOSIT)} deposited with {money(BORROW)} borrowed
        against it, and you want to leave the loan open. One rule decides what can leave: your debt can never be more than 90% of your collateral, so enough of the deposit has to stay in the vault to keep the loan under the cap.
      </Sub>

      <Panel>
        <Question>
          How much of the {money(DEPOSIT)} can you withdraw with the {money(BORROW)} loan
          still open?
        </Question>
        <GuessSlider
          label="Withdrawable now"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={0}
          max={DEPOSIT}
          step={STEP}
          format={(v) => money(v)}
          scale={["Nothing", `All ${money(DEPOSIT)}`]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="The borrowed alUSD stays borrowed either way.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${money(truth)} is free to withdraw.`}
          onNext={onDone}
          nextLabel="See how to free the rest"
        >
          <Body>
            {exact
              ? "Right, and as close as this slider gets. "
              : close
                ? "That is close. "
                : `You said ${money(guess)}. `}
            Your loan reserves the collateral it needs to stay under the 90% cap, and that
            is always more than the loan is worth.
          </Body>
          <Body>
            {money(BORROW)} of debt needs {money(BORROW / MAX_LTV)} of collateral behind it
            at the cap. Everything above that, {money(truth)}, is free to withdraw.
          </Body>
          <Body>
            It is the same 90% cap that limits borrowing, read the other way. When you
            borrow, the cap sets the most you can take. When you withdraw, it sets the least
            you have to leave.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

/** What is free before a single unit is repaid, so the stage can show the gain. */
const START_FREE = withdrawable(DEPOSIT, BORROW);

function Try({ onDone }) {
  const [repaid, setRepaid] = useState(0);
  const [moved, setMoved] = useState(false);

  const debt = BORROW - repaid;
  const free = withdrawable(DEPOSIT, debt);
  const locked = DEPOSIT - free;
  const clear = debt <= 0;

  return (
    <Stage eyebrow="Stage 2 · Explore" headline="Every unit you repay frees more than a unit of collateral.">
      <Sub>
        At the 90% cap, one unit of debt reserves about 1.11 units of collateral, so every
        unit you repay frees about 1.11 back. Clear the loan and all {money(DEPOSIT)}{" "}
        unlocks.
      </Sub>

      {/* The whole card, with every stat the app prints, because this is the
          lesson about reading one. The health factor is the same distance to
          the cap the bar draws, written as a multiple, and it is the one stat
          the academy never showed anywhere. */}
      <PositionCard
        deposited={DEPOSIT}
        borrowed={debt}
        earmarked={debt * EARMARK_SHARE}
        asset="USDC"
        earning
        showHealth
        note={`${money(free)} USDC is free to withdraw right now.`}
        compact
      />

      <div className={own.meterWrap}>
        <div className={own.meterHead}>
          <span className={styles.microLabel}>Your {money(DEPOSIT)} deposit</span>
          <span className={own.meterValue} style={{ color: clear ? "#5ba88a" : "#e8e8ea" }}>
            {money(free)} free
          </span>
        </div>
        <div className={own.meter}>
          <span
            className={own.meterFill}
            style={{ width: `${(locked / DEPOSIT) * 100}%`, background: "#d4952a" }}
          />
        </div>
        <div className={own.meterKey}>
          <span>{money(locked)} held against the loan</span>
          <span>{money(free)} free to withdraw</span>
        </div>
      </div>

      <div className={own.statRow}>
        <Stat label="Still owed" value={money(debt)} tone={clear ? "#5ba88a" : "#f5c09a"} />
        <Stat label="LTV" value={`${(ltvOf(DEPOSIT, debt) * 100).toFixed(1)}%`} />
        <Stat label="Can withdraw" value={money(free)} tone="#5ba88a" />
        {/* The point of the stage, stated as a number rather than left to be
            inferred from two figures moving at different speeds. */}
        <Stat
          label="Freed by repaying"
          value={repaid > 0 ? `+${money(free - START_FREE)}` : "-"}
          tone={repaid > 0 ? "#5ba88a" : "#6b7078"}
        />
      </div>

      <Controls>
        <Control
          label="Repay by hand"
          display={money(repaid)}
          min={0} max={BORROW} step={100}
          value={repaid}
          onChange={(v) => { setRepaid(v); setMoved(true); }}
          accent
          verdict={clear ? "the loan is clear and the deposit is free" : null}
        />
      </Controls>

      <AppShot shot={SHOTS.withdrawTab}>
        The Withdraw tab. Available is the figure this stage has been working out, and the
        app has already run the arithmetic against your debt.
      </AppShot>

      <Notes>
        <Note label="Withdraw now">
          Take whatever is already free and leave the loan open. It costs nothing and goes
          through immediately.
        </Note>
        <Note label="Repay first">
          Repay some or all of the loan before you withdraw. Every unit repaid frees more
          than one unit of collateral, because each unit of debt holds about 1.11 units of
          collateral behind it at the cap.
        </Note>
        <Note label="Which asset repays">
          You can repay with alUSD, with the asset you deposited, or with MYT, the token
          your deposit is held as. One alUSD cancels one unit of debt. Part of the loan can
          show as earmarked in the app, meaning set aside for the next redemption cycle.
          Earmarked debt is repaid with MYT, and the repay menu offers you only the assets
          that are valid. Lesson 3 goes inside the MYT.
        </Note>
      </Notes>

      {moved ? (
        <Reveal
          title={`${money(free)} is free with ${money(debt)} still owed.`}
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            {money(debt)} of debt needs {money(debt / MAX_LTV)} of collateral behind it at
            the cap. The remaining {money(free)} of the {money(DEPOSIT)} can be withdrawn now.
          </Body>
          <Body>
            You can do this on any day. The app shows the withdrawable amount beside the debt.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the repay control to continue.</Hint>
      )}
    </Stage>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={own.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={own.statValue} style={tone ? { color: tone } : undefined}>{value}</div>
    </div>
  );
}
