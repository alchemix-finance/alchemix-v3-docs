import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import parts from "../parts.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, Gate, GuessSlider,
  Note, Notes, Panel, Primary, Question, Reveal, SHOTS, Stage, Sub, money, said,
} from "../kit";

/**
 * Lesson 2: your deposit.
 *
 * The 10,000 USDC deposit the rest of the track carries. Learn shows where it
 * goes and asks how much can come back out the next day. Try runs the months
 * forward: the count of MYT stays put while each one is worth more, which is
 * the fact about yield people most often get wrong. Check asks what the vault
 * did with it.
 *
 * Try used to end on a Withdraw control the learner had to push to 100%. It
 * taught nothing the Learn stage had not, and the first outside reader stalled
 * on it.
 *
 * The deposit is made on the Borrow page, not on Mixed Yield. Both pages hold
 * the same MYT, but this track carries one position through to a loan, and the
 * Borrow page's Deposit/Borrow tab does the deposit and the borrow in a single
 * transaction. Mixed Yield is the same vault for someone who does not want a
 * loan, which is worth naming here and not worth sending a borrower to.
 */

const DEPOSIT = 10_000;

export default function DepositLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Learn onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Try onDone={() => onStage("checkpoint")} />;

  return (
    <ChoiceCheckpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      passTitle="Lesson 2 complete."
      passBody="Your deposit becomes MYT and earns in strategies the Alchemix DAO selects. You can take it back any day you like."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const STEPS = [
  { n: 1, label: "You deposit", value: `${money(DEPOSIT)} USDC`, note: "Your wallet sends the USDC to the vault." },
  { n: 2, label: "You receive", value: "MYT", note: "Each Mix-Yield Token, or MYT, is a share of that vault.", tone: "#5ba88a" },
  { n: 3, label: "The DAO", value: "Runs the strategies", note: "It picks where the vault earns and rebalances as markets move.", tone: "#5ba88a" },
];

function Learn({ onDone }) {
  const [guess, setGuess] = useState(5_000);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Your USDC goes into a vault and starts earning.">
      <Sub>
        On the Borrow page you open a vault, the pool that holds deposits like yours, and
        put {money(DEPOSIT)} USDC into it. The Dashboard lists the position afterwards.
      </Sub>

      <FlowSteps steps={STEPS} />

      <Panel>
        <Question>
          Tomorrow you want it back. How much of the {money(DEPOSIT)} can you take out?
        </Question>
        <GuessSlider
          label="Available tomorrow"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#5ba88a"
          min={0}
          max={DEPOSIT}
          step={250}
          format={money}
          scale={["Nothing", `All ${money(DEPOSIT)}`]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Open the position from the Dashboard and switch to the Withdraw tab.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal title={`All ${money(DEPOSIT)} of it is returned.`} onNext={onDone} nextLabel="Let it earn">
          <Body>
            {said(guess, DEPOSIT, money)}
            The vault has no lock-up. Withdraw on any day and the full balance comes back
            with everything it earned. A very large withdrawal can depend on how much the
            strategies can release at once. Borrowing against the deposit is optional.
          </Body>
        </Reveal>
      )}

      <AppShot shot={SHOTS.withdrawTab}>
        The Withdraw tab on your position. Available is what the position will release
        today, and MAX fills the field with all of it.
      </AppShot>
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

/**
 * What the MYT is worth on the day of the deposit, in the example. The real
 * figure is whatever the vault's share price reads that day; 1.000 keeps the
 * count and the value the same number at the start, so the learner can watch
 * them come apart.
 */
const START_PRICE = 1;

function Try({ onDone }) {
  const [rate, setRate] = useState(5);
  const [months, setMonths] = useState(0);
  // Both latch: once each control has moved, the reveal stays open whatever
  // they are set to afterwards.
  const [movedRate, setMovedRate] = useState(false);
  const [movedMonths, setMovedMonths] = useState(false);

  const held = DEPOSIT / START_PRICE;
  const price = START_PRICE * Math.pow(1 + rate / 100, months / 12);
  const value = held * price;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Let it earn, and find where the yield goes.">
      <Sub>
        Suppose each MYT is worth 1.000 USDC the day you deposit, so your {money(DEPOSIT)}{" "}
        USDC buys {money(held)} MYT. Run the months forward and set what the strategies earn.
        Real rates move from day to day.
      </Sub>

      <div className={`${parts.statRow} ${parts.statRow3}`}>
        <div className={parts.stat}>
          <div className={styles.statLabel}>MYT you hold</div>
          <div className={parts.statValue}>{money(held)}</div>
        </div>
        <div className={parts.stat}>
          <div className={styles.statLabel}>Each MYT is worth</div>
          <div className={parts.statValue} style={{ color: "#5ba88a" }}>{price.toFixed(4)} USDC</div>
        </div>
        <div className={parts.stat}>
          <div className={styles.statLabel}>Your deposit is worth</div>
          <div className={parts.statValue}>{money(value)} USDC</div>
        </div>
      </div>

      <Controls>
        <Control
          label="Months passed"
          display={`${months} months`}
          min={0} max={12} step={1}
          value={months}
          onChange={(v) => { setMonths(v); setMovedMonths(true); }}
          accent
        />
        <Control
          label="Suppose it earns"
          display={`${rate.toFixed(1)}% a year`}
          min={1} max={15} step={0.5}
          value={rate}
          onChange={(v) => { setRate(v); setMovedRate(true); }}
        />
      </Controls>

      <Notes>
        <Note label="Who runs it">
          The Alchemix DAO chooses the strategies and rebalances them as markets move.
        </Note>
      </Notes>

      {movedRate && movedMonths ? (
        <Reveal
          title="The number of MYT never moved. Each one is worth more."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            Your yield shows up in the price of MYT, so the deposit grows without a single
            token arriving in your wallet. Withdraw and the whole of it comes back as USDC.
          </Body>
          <Body>
            Each vault carries a <strong>deposit cap</strong>, drawn on its card as a bar with
            how full it is, and a vault sitting at its cap takes nothing further until the DAO
            raises it. The Mixed Yield page, under Earn, holds the same vaults for anyone who
            wants the yield without a loan.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the check" hint="Run the months forward and set a rate to continue." />
      )}

      <AppShot shot={SHOTS.vaultCard}>
        A vault on the Borrow page. The figure above the bar is what it is earning right now,
        and the bar under its name is the deposit cap and how full it is.
      </AppShot>
    </Stage>
  );
}
