import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "../parts.module.css";
import { apiBase } from "../lib/api";
import { MAX_LTV, borrowable, ltvOf } from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Note, Notes,
  Panel, Primary, Question, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 3: borrowing against your deposit.
 *
 * One number to take away: 90%. Everything else here exists to stop that number
 * being misread. Hitting the cap does not close anything, the loan arrives as a
 * token rather than as dollars, and the deposit stays yours and keeps earning.
 *
 * The withdrawal side of the same rule is lesson 5, deliberately. Teaching both
 * directions at once is what made the first version of this material heavy.
 */

const DEPOSIT = 10_000;

export default function BorrowLab({ lessonId, stage, onStage, done, onComplete }) {
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
      headline="Find the most you could borrow."
      unit="amount"
      targetOf={(f) => f.deposit * MAX_LTV}
      computeOf={(f, v) => v}
      direct
      controlLabel="Most you can borrow"
      controlDisplay={(v) => money(v)}
      targetFoot="the borrowing cap on this position"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 3 complete."
      passBody="You know how much a deposit lets you borrow, what arrives when you do, and that reaching the cap costs you nothing. Next: what happens to the balance once it is open."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(DEPOSIT / 2);
  const [revealed, setRevealed] = useState(false);

  const truth = DEPOSIT * MAX_LTV;
  const close = Math.abs(guess - truth) <= 400;

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="How much can you borrow?">
      <Sub>
        Your {money(DEPOSIT)} is deposited and earning. You want to use some of its value
        without selling it, so you borrow against it.
      </Sub>

      <Panel>
        <Question>
          Alchemix will lend against your deposit. How much of the {money(DEPOSIT)} do you
          think you can borrow?
        </Question>
        <GuessSlider
          label="Most you can borrow"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={0}
          max={DEPOSIT}
          step={250}
          format={(v) => money(v)}
          scale={["Nothing", `All ${money(DEPOSIT)}`]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Most lending protocols allow far less than this one.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`Up to ${money(truth)}, which is 90% of what you deposited.`}
          onNext={onDone}
          nextLabel="See what the cap does"
        >
          <Body>
            {close ? "That is close. " : `You said ${money(guess)}. `}
            The limit is called your loan to value, or LTV: what you owe, divided by what
            you deposited. Alchemix lets that reach 90%.
          </Body>
          <Body>
            Borrowing mints you alUSD: a token created on the spot, worth one USDC inside
            the protocol. You can hold it, spend it, or swap it for something else.
            Lesson 7 covers where it comes from and how to turn it back.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [collateral, setCollateral] = useState(10_000);
  const [debt, setDebt] = useState(3_000);
  const [seenCap, setSeenCap] = useState(false);
  const [moved, setMoved] = useState({ deposit: false, borrow: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const ltv = ltvOf(collateral, debt);
  const atCap = ltv >= MAX_LTV - 1e-9;
  const room = borrowable(collateral, debt);

  React.useEffect(() => {
    if (atCap) setSeenCap(true);
  }, [atCap]);

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Push it to the limit and see what stops you.">
      <Sub>
        Move the deposit and the amount borrowed. Watch the bar, and try taking the borrow
        as high as it will go.
      </Sub>

      <div className={own.meterWrap}>
        <div className={own.meterHead}>
          <span className={styles.microLabel}>Loan to value</span>
          <span className={own.meterValue} style={{ color: atCap ? "#d4952a" : "#e8e8ea" }}>
            {(ltv * 100).toFixed(1)}%
          </span>
        </div>
        <div className={own.meter}>
          <span className={own.meterFill} style={{ width: `${Math.min(ltv * 100, 100)}%` }} />
          <span className={own.meterCap} style={{ left: `${MAX_LTV * 100}%` }} />
        </div>
        <div className={own.meterKey}>
          <span>0%</span>
          <span className={own.capMark}>Borrowing stops at {(MAX_LTV * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className={own.statRow}>
        <Stat label="Deposited" value={money(collateral)} />
        <Stat label="Borrowed" value={money(debt)} tone="#f5c09a" />
        <Stat label="Could still borrow" value={money(room)} tone={room > 0 ? "#5ba88a" : "#6b7078"} />
        <Stat label="Still earning" value={money(collateral)} tone="#5ba88a" />
      </div>

      <Controls>
        <Control
          label="Deposit"
          display={money(collateral)}
          min={2_000} max={50_000} step={500}
          value={collateral}
          onChange={(v) => {
            setCollateral(v);
            if (debt > v * MAX_LTV) setDebt(Math.floor(v * MAX_LTV));
            mark("deposit");
          }}
        />
        <Control
          label="Borrow"
          display={money(debt)}
          min={0} max={Math.floor(collateral * MAX_LTV)} step={250}
          value={debt}
          onChange={(v) => { setDebt(v); mark("borrow"); }}
          accent
          verdict={atCap ? "the cap stops you here" : null}
        />
      </Controls>

      <Notes>
        <Note label="Still earning">
          Look at the last tile. Borrowing did not take anything out of the vault. All
          {" "}{money(collateral)} is still deposited and still earning while the
          protocol pays this loan down.
        </Note>
        <Note label="At the cap">
          Reaching 90% stops you borrowing more. It does not close the position, sell
          anything, or charge you a penalty. You can sit there indefinitely.
        </Note>
      </Notes>

      {seenCap || (moved.deposit && moved.borrow) ? (
        <Reveal
          title="The cap is a limit on borrowing, and nothing more."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            The most you can borrow is always 90% of what you deposited. On {money(collateral)}
            {" "}that is {money(collateral * MAX_LTV)}.
          </Body>
          <Body>
            Whether you should borrow that much is a different question, and lesson 6 gets to
            it. For now the number to keep is nine tenths of what you put in.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls, and take the borrow up to the cap.</Hint>
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
