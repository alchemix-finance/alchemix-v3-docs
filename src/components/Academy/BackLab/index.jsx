import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "../parts.module.css";
import { apiBase } from "../lib/api";
import { MAX_LTV, ltvOf, withdrawable } from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Note, Notes,
  Panel, Primary, Question, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Intermediate lesson 1: reading your position.
 *
 * Deposit 10,000, borrow 5,000, and the obvious guess is that 5,000 is still
 * free to withdraw. It is 4,444, because the debt left behind still has to sit
 * under the 90% cap. The learner reads the position card, commits to a figure,
 * then works both routes out: withdraw what is free, or repay to free more.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;

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
      headline="Work out what you can withdraw."
      unit="amount"
      targetOf={(f) => withdrawable(f.collateral, f.debt)}
      computeOf={(f, v) => v}
      direct
      controlLabel="Withdraw"
      controlDisplay={(v) => money(v)}
      targetFoot="the most that can leave the position today"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 1 complete."
      passBody="You can read a position card and say how much of the deposit is free to leave today. The next lesson works out what sets the speed your debt clears at."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(BORROW);
  const [revealed, setRevealed] = useState(false);

  const truth = withdrawable(DEPOSIT, BORROW);
  const close = Math.abs(guess - truth) <= 300;

  return (
    <Stage eyebrow="Stage 1 · Predict" headline="Read the position card.">
      <Sub>
        The card in the app shows {money(DEPOSIT)} deposited and {money(BORROW)} borrowed
        against it. You want some of that deposit back, and you want to leave the loan
        open.
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
          step={100}
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
            {close ? "That is close. " : `You said ${money(guess)}. `}
            Your loan holds back the collateral it needs to stay under the 90% cap, and that
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
        Move the repay control and watch the free share of the deposit grow faster than
        the amount you hand back. Clear the loan and all {money(DEPOSIT)} unlocks.
      </Sub>

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
        <Stat label="Must stay" value={money(locked)} tone={locked > 0 ? "#d4952a" : "#6b7078"} />
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
          You can repay with alUSD, with MYT, or with the asset you deposited. One alUSD
          cancels one unit of debt. Part of the loan can show as earmarked in the app,
          meaning set aside for the next redemption cycle. Earmarked debt is repaid with
          MYT, and the repay menu offers you only the assets that are valid.
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
            You can do this on any day you like, with no schedule to meet first. The app
            shows the withdrawable amount right beside the debt, so it has already run this
            arithmetic for you.
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
