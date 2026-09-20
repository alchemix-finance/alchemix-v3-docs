import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { positionCurve } from "../lib/model";
import { EXAMPLE_REDEMPTION, EXAMPLE_YIELD } from "../lib/protocol";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, GuessSlider,
  Hint, Legend, LineChart, Note, Notes, Panel, Primary, Question, Reveal, SHOTS, Stage,
  Sub, money, said,
} from "../kit";

/**
 * Lesson 1: what Alchemix does.
 *
 * The whole loop in one picture before any of it is explained: deposit, earn,
 * borrow, the balance falling, repay and withdraw. The learner guesses the
 * interest rate on the loan, finds it is zero, then watches the balance fall
 * next to a loan with interest.
 *
 * The loop deliberately ends on repay-and-withdraw, not on the Transmuter. A
 * borrower holding alUSD repays with it, since 1 alUSD cancels 1 of debt
 * inside the Alchemist. Routing it through the Transmuter would mean waiting
 * out a term for USDC while still carrying the debt. The Transmuter is a
 * fixed-yield product and gets its own lesson.
 *
 * The falling balance is the dApp's own projection, run at an example
 * redemption rate, and nothing on screen implies a payoff date.
 *
 * This lesson owns the direction and lesson 4 owns the quantity. It used to own
 * both: it projected the same 10,000 / 5,000 position over the same two years
 * and printed "you owe about 2,000", which is the figure lesson 4 then asks the
 * learner to predict. The chart here therefore reads the balance but never
 * labels where it lands, so the discovery in lesson 4 is still a discovery.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const MONTHS = 24;

/** The Alchemix balance, sampled weekly with a final point on month 24. */
const ALCHEMIX = positionCurve({
  collateral: DEPOSIT,
  debt: BORROW,
  yieldAnnual: EXAMPLE_YIELD,
  redemptionAnnual: EXAMPLE_REDEMPTION,
  months: MONTHS,
});

/* ── The loop ────────────────────────────────────────────── */

/**
 * Green marks the saving side, copper the loan.
 *
 * Five stops, and every name in them is one this lesson can carry. MYT and the
 * DAO used to appear here and belong to lesson 2, which left the opening screen
 * naming most of the protocol to teach one fact about interest.
 *
 * The third stop is why anyone does this. The loop used to run deposit, earn,
 * borrow, repay, and a reader could finish lesson 1 without being told the money
 * is for spending. The exit still ends on repay and withdraw, which is the
 * borrower's actual way out.
 */
const LOOP = [
  { n: 1, label: "Deposit", value: "10,000 USDC", note: "It goes into a vault on the Borrow page and starts earning.", tone: "#5ba88a" },
  { n: 2, label: "Borrow", value: "5,000 alUSD", note: "Up to 90% of the deposit, from the same screen.", tone: "#f5c09a" },
  { n: 3, label: "Spend it", value: "5,000 in hand", note: "Sell the alUSD and use the cash. Your 10,000 never leaves the vault.", tone: "#f5c09a" },
  { n: 4, label: "Balance", value: "paid down", note: "Redemptions clear it out of your own collateral. You make no payment.", tone: "#f5c09a" },
  { n: 5, label: "Close it out", value: "repay, withdraw", note: "Repay what is left, then take the deposit back.", tone: "#5ba88a" },
];

/** After the reveal, step 4 carries the answer. Nothing else in the picture changes. */
const LOOP_REVEALED = LOOP.map((s) =>
  s.n === 4 ? { ...s, value: "0% interest, repaid for you", tone: "#5ba88a" } : s,
);

export default function WhatLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Lesson 1 complete."
      passBody="An Alchemix loan charges no interest. Redemptions clear the balance for you, drawing on collateral that keeps earning the whole time."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(7);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Your deposit keeps earning while you borrow against it.">
      <Sub>
        Deposit USDC on the Borrow page and it starts earning. Borrow against it from the
        same screen, in a token called alUSD that sells for dollars. When you want the
        deposit back, repay the loan and withdraw.
      </Sub>

      <div className={own.loop}>
        <FlowSteps steps={revealed ? LOOP_REVEALED : LOOP} />
      </div>

      <AppShot shot={SHOTS.vaultCard}>
        A vault on the Borrow page, with what the whole market has deposited against it,
        what it has borrowed, and the 90.00% of a deposit anyone may borrow.
      </AppShot>

      <Panel>
        <Question>
          You borrow 5,000 alUSD against the deposit. What interest rate does the loan
          charge?
        </Question>
        <GuessSlider
          label="Interest rate"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={0}
          max={20}
          step={0.5}
          format={(v) => `${v}% a year`}
          scale={["0%", "20%"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Set the rate you would expect a lender to charge.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title="0%. Redemptions pay the balance down instead."
          onNext={onDone}
          nextLabel="See it against a loan with interest"
        >
          <Body>
            {said(guess, 0, (v) => `${v}% a year`)}
            On most lending platforms you pay interest for as long as the loan is open.
            Alchemix charges none. The protocol spends a little of your own deposit to
            clear the balance instead, and the rest of it keeps earning the whole way down.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [rate, setRate] = useState(7);
  const [moved, setMoved] = useState(false);

  // The amber line is the learner's own supposition about a lender elsewhere.
  // The green line is fixed: only the rate control moves anything.
  const interestAt = (m) => BORROW * Math.pow(1 + rate / 100, m / 12);
  const interest = Array.from({ length: MONTHS + 1 }, (_, m) => ({ x: m, y: interestAt(m) }));
  const alchemix = ALCHEMIX.map((p) => ({ x: p.month, y: p.debt }));

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Put the same 5,000 next to a loan that charges interest.">
      <Sub>
        The amber line is 5,000 borrowed from a lender that charges interest. Set the rate
        it charges. The green line is your Alchemix loan, and nothing on this screen moves
        it. Both are left alone for two years.
      </Sub>

      <div className={styles.chartLive}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>What you owe</span>
        </div>
        <LineChart
          label="What you owe"
          series={[
            { id: "interest", color: "#d4952a", points: interest },
            { id: "alchemix", color: "#5ba88a", points: alchemix },
          ]}
          xMax={MONTHS}
          xTicks={4}
          xLabel="months"
          yMax={7_500}
          yTicks={3}
          formatY={(v) => money(v)}
        />
        <Legend
          items={[
            { label: "A loan with interest", color: "#d4952a" },
            { label: "Alchemix", color: "#5ba88a" },
          ]}
        />
        <Hint>The green line uses an example redemption rate. Real rates move.</Hint>
      </div>

      <Controls>
        <Control
          label="Interest rate"
          display={`${rate.toFixed(1)}% a year`}
          min={2} max={18} step={0.5}
          value={rate}
          onChange={(v) => { setRate(v); setMoved(true); }}
          accent
        />
      </Controls>

      <Notes>
        <Note label="With interest">
          Two years at {rate}% and you owe {money(interestAt(MONTHS))}, having never made a
          payment.
        </Note>
        <Note label="Alchemix">
          Two years and you owe less than you borrowed, having never made a payment either.
          Lesson 4 works out how much less.
        </Note>
      </Notes>

      {moved ? (
        <Reveal
          title="One balance grows. The other gets paid down for you."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            A loan with interest grows until you pay it down. An Alchemix balance is repaid
            out of your own collateral instead, and that collateral earns the whole time it
            is doing so. The redemption rate sets the pace, and the app prints it on your vault.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the rate control to continue.</Hint>
      )}
    </Stage>
  );
}
