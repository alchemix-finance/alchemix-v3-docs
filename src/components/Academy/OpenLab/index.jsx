import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { MAX_LTV, borrowable, ltvOf, withdrawable } from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel,
  Primary, Question, Readout, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 1: what you actually get.
 *
 * The first thing a beginner needs is vocabulary, and the fastest way to install
 * it is to make one wrong assumption visible. Almost everyone assumes that
 * depositing 10,000 and borrowing 5,000 leaves 5,000 they can take back. It does
 * not, because the debt left behind still has to sit under the borrowing cap.
 *
 * Getting that wrong once teaches deposit, debt, LTV, the cap and withdrawable in
 * a single move.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;

export default function OpenLab({ lessonId, stage, onStage, done, onComplete }) {
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
      headline="Work out the withdrawal."
      unit="amount"
      targetOf={(f) => withdrawable(f.collateral, f.debt)}
      computeOf={(f, v) => v}
      controlLabel="Withdraw"
      controlDisplay={(v) => money(v)}
      targetFoot="the most that can leave the position"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 1 complete."
      passBody="You can read a position: what is deposited, what is owed, and what is genuinely free to move. Every lesson after this one builds on those three numbers."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState(BORROW);
  const [revealed, setRevealed] = useState(false);

  const truth = withdrawable(DEPOSIT, BORROW);
  const close = Math.abs(guess - truth) <= 250;

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline="A deposit does not stay a deposit."
    >
      <Sub>
        You deposit {money(DEPOSIT)} USDC. The vault wraps it into MYT, which earns yield
        from that moment, and mints you a position NFT that represents the whole thing.
        You then borrow {money(BORROW)} alUSD against it.
      </Sub>

      <div className={own.flow}>
        <FlowStep n="1" label="You deposit" value={`${money(DEPOSIT)} USDC`} note="Your own capital" />
        <FlowArrow />
        <FlowStep n="2" label="You receive MYT" value={`${money(DEPOSIT)} of collateral`} note="Earning yield immediately" tone="#5ba88a" />
        <FlowArrow />
        <FlowStep n="3" label="You borrow" value={`${money(BORROW)} alUSD`} note="Newly minted, spendable" tone="#f5c09a" />
      </div>

      <Panel>
        <Question>
          You change your mind and want your USDC back. Without repaying anything first,
          how much of the {money(DEPOSIT)} can you withdraw?
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
          <Primary onClick={() => setRevealed(true)}>Commit and check</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`You can withdraw ${money(truth)}, not ${money(BORROW)}.`}
          onNext={onDone}
          nextLabel="See where the limit comes from"
        >
          <Body>
            {close
              ? "That is close to the mark. "
              : `You answered ${money(guess)}. `}
            Borrowing does not reserve an equal amount of collateral. It reserves however
            much is needed to keep the remaining position under the borrowing cap of{" "}
            {(MAX_LTV * 100).toFixed(0)}%.
          </Body>
          <Body>
            {money(BORROW)} of debt needs {money(BORROW / MAX_LTV)} of collateral standing
            behind it at the cap. Everything above that, {money(truth)}, is free to leave.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

function FlowStep({ n, label, value, note, tone }) {
  return (
    <div className={own.step}>
      <div className={own.stepNum}>{n}</div>
      <div className={own.stepLabel}>{label}</div>
      <div className={own.stepValue} style={tone ? { color: tone } : undefined}>{value}</div>
      <div className={own.stepNote}>{note}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <svg className={own.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,192,154,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [collateral, setCollateral] = useState(10_000);
  const [debt, setDebt] = useState(5_000);
  const [seenCap, setSeenCap] = useState(false);
  // Unlocking on exploration rather than on hitting an exact value. Precision is
  // the checkpoint's job; this stage only has to be understood.
  const [moved, setMoved] = useState({ deposit: false, borrow: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const ltv = ltvOf(collateral, debt);
  const atCap = ltv >= MAX_LTV - 1e-9;
  const free = withdrawable(collateral, debt);
  const room = borrowable(collateral, debt);

  React.useEffect(() => {
    if (atCap) setSeenCap(true);
  }, [atCap]);

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="Four numbers, and only two of them are yours to set."
    >
      <Sub>
        Move the deposit and the borrow. Watch what happens to the LTV, to how much more
        you could borrow, and to how much you could take back out.
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
        <Stat label="Owed" value={money(debt)} tone="#f5c09a" />
        <Stat label="Could still borrow" value={money(room)} tone={room > 0 ? "#5ba88a" : "#6b7078"} />
        <Stat label="Could withdraw" value={money(free)} tone={free > 0 ? "#5ba88a" : "#6b7078"} />
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
          verdict={atCap ? "at the borrowing cap" : null}
        />
      </Controls>

      <Readout>
        Withdrawing {money(free)} would leave {money(debt)} of debt against{" "}
        <strong>{money(collateral - free)}</strong> of collateral, which is exactly the{" "}
        {(MAX_LTV * 100).toFixed(0)}% cap.
      </Readout>

      {seenCap || (moved.deposit && moved.borrow) ? (
        <Reveal
          title="The cap is a floor under your collateral, not a wall around your deposit."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            Reaching {(MAX_LTV * 100).toFixed(0)}% stops further borrowing. It does not close
            the position, it does not sell anything, and the collateral underneath keeps
            earning. You simply cannot mint more against it.
          </Body>
          <Body>
            The same rule read the other way is your withdrawal limit. Whatever is not
            needed to hold the remaining debt under the cap is yours to move at any time.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls. Push the borrow up to the cap to see what stops you.</Hint>
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
