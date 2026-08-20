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
 * Lesson 5: getting your money back.
 *
 * The one place a beginner is reliably caught out. Deposit 10,000, borrow 5,000,
 * and the obvious guess is that 5,000 is still yours to take. It is not, because
 * the debt left behind still has to sit under the 90% cap.
 *
 * This lands here rather than at lesson 1 on purpose. By now the cap has been
 * taught and used, so the surprise is a consequence the learner can follow
 * rather than a trick played on someone who was given no way to know.
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
      stageLabel="Check"
      headline="Work out the withdrawal."
      unit="amount"
      targetOf={(f) => withdrawable(f.collateral, f.debt)}
      computeOf={(f, v) => v}
      direct
      controlLabel="Withdraw"
      controlDisplay={(v) => money(v)}
      targetFoot="the most that can leave right now"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 5 complete."
      passBody="You can read a position: what is in it, what is owed, and what is free to move. Next: what can and cannot force a position to close."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(BORROW);
  const [revealed, setRevealed] = useState(false);

  const truth = withdrawable(DEPOSIT, BORROW);
  const close = Math.abs(guess - truth) <= 300;

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="You want some of your deposit back.">
      <Sub>
        You deposited {money(DEPOSIT)} and borrowed {money(BORROW)} against it. Now you want
        to take some of the deposit out, and you are not repaying the loan first.
      </Sub>

      <Panel>
        <Question>
          How much of the {money(DEPOSIT)} can you withdraw, with the {money(BORROW)} loan
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
        <Actions aside="Your borrowed alUSD stays borrowed either way.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${money(truth)} is free to move.`}
          onNext={onDone}
          nextLabel="See both ways out"
        >
          <Body>
            {close ? "That is close. " : `You said ${money(guess)}. `}
            Borrowing {money(BORROW)} did not set aside {money(BORROW)} of your deposit. It
            set aside however much that loan needs behind it to stay within the 90% cap.
          </Body>
          <Body>
            {money(BORROW)} of debt needs {money(BORROW / MAX_LTV)} of collateral standing
            behind it at the cap. Everything above that, {money(truth)}, is free to leave.
          </Body>
          <Body>
            It is the same 90% rule from lesson 3, read backwards. When you borrowed, it set
            the most you could take. Withdrawing, it sets the least you have to leave.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [repaid, setRepaid] = useState(0);
  const [moved, setMoved] = useState(false);

  const debt = BORROW - repaid;
  const free = withdrawable(DEPOSIT, debt);
  const locked = DEPOSIT - free;
  const clear = debt <= 0;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Two ways out, and one unlocks the other.">
      <Sub>
        Repay part of the loan and watch how much of your deposit comes free. Take the loan
        all the way to zero to see everything unlock.
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
          <span>{money(free)} yours to move</span>
        </div>
      </div>

      <div className={own.statRow}>
        <Stat label="Still owed" value={money(debt)} tone={clear ? "#5ba88a" : "#f5c09a"} />
        <Stat label="LTV" value={`${(ltvOf(DEPOSIT, debt) * 100).toFixed(1)}%`} />
        <Stat label="Can withdraw" value={money(free)} tone="#5ba88a" />
        <Stat label="Must leave" value={money(locked)} tone={locked > 0 ? "#d4952a" : "#6b7078"} />
      </div>

      <Controls>
        <Control
          label="Repay by hand"
          display={money(repaid)}
          min={0} max={BORROW} step={100}
          value={repaid}
          onChange={(v) => { setRepaid(v); setMoved(true); }}
          accent
          verdict={clear ? "loan cleared, everything is free" : null}
        />
      </Controls>

      <Notes>
        <Note label="Route one">
          Withdraw what is already free and leave the loan running. Costs you nothing and
          takes no waiting.
        </Note>
        <Note label="Route two">
          Repay some or all of the loan first. Every unit you repay releases more than a
          unit of collateral, because the debt was only holding back what the cap required.
        </Note>
        <Note label="Repaying">
          You can repay with alUSD, with MYT, or with the asset you deposited. One alUSD
          clears exactly one unit of debt. If part of the loan shows as earmarked in the
          app, that part is repaid with MYT, and the asset menu only offers what is valid.
        </Note>
      </Notes>

      {moved ? (
        <Reveal
          title="What is free is whatever the cap does not need."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            Your {money(debt)} of debt needs {money(debt / MAX_LTV)} standing behind it, so
            {" "}{money(free)} of the {money(DEPOSIT)} is yours to move right now.
          </Body>
          <Body>
            You never have to repay on a schedule to get at your money. The position tells
            you what is free, and the app shows both numbers, so none of it has to be worked
            out by hand. Knowing where it comes from keeps the smaller number from being a
            shock.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the repay control to carry on.</Hint>
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
