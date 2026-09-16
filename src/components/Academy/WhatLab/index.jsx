import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { positionCurve } from "../lib/model";
import {
  Actions, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, GuessSlider, Hint,
  Legend, LineChart, Note, Notes, Panel, Primary, Question, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 1: what Alchemix does.
 *
 * The whole loop in one picture before any of it is explained: deposit, earn,
 * borrow, the balance falling, alUSD turned back. The learner guesses the
 * interest rate on the loan, finds it is zero, then watches the balance fall
 * next to a loan with interest.
 *
 * The falling balance is the dApp's own projection, run at an example rate.
 * Forty percent of it is still standing at two years, so nothing on screen
 * implies a payoff date.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const YIELD = 0.05;
const ILLUSTRATIVE_PACE = 0.35;
const MONTHS = 24;

/** The Alchemix balance, sampled weekly with a final point on month 24. */
const ALCHEMIX = positionCurve({
  collateral: DEPOSIT,
  debt: BORROW,
  yieldAnnual: YIELD,
  redemptionAnnual: ILLUSTRATIVE_PACE,
  months: MONTHS,
});

const OWED_AT_END = ALCHEMIX.reduce((best, p) =>
  Math.abs(p.month - MONTHS) < Math.abs(best.month - MONTHS) ? p : best,
).debt;

/* ── The loop ────────────────────────────────────────────── */

/** Green marks the saving side, copper the loan, blue the Transmuter side. */
const LOOP = [
  { n: 1, label: "Deposit", value: "10,000 USDC", note: "On the Mixed Yield page your USDC joins a vault, and you receive MYT, a share of it.", tone: "#5ba88a" },
  { n: 2, label: "Earn", value: "MYT grows", note: "The DAO picks the strategies the vault earns from.", tone: "#5ba88a" },
  { n: 3, label: "Borrow", value: "5,000 alUSD", note: "On the Vaults page you borrow up to 90%, and the deposit stays in and keeps earning.", tone: "#f5c09a" },
  { n: 4, label: "Balance falls", value: "on its own", note: "The protocol repays it out of your position.", tone: "#f5c09a" },
  { n: 5, label: "alUSD returns", value: "1:1 for USDC", note: "The Transmuter takes it back on the Fixed Yield page once the wait is up.", tone: "#8ea9d8" },
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
      passBody="An Alchemix loan charges no interest. Your deposit keeps earning while you borrow against it, and those earnings are what clear the balance."
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
        Deposit USDC on the Mixed Yield page and it starts earning the same day. Borrow
        alUSD against it on the Vaults page. When you want USDC again, the Transmuter takes
        the alUSD back on Fixed Yield.
      </Sub>

      <div className={own.loop}>
        <FlowSteps steps={revealed ? LOOP_REVEALED : LOOP} />
      </div>
      <Hint>The alUSD you borrow in step 3 is the alUSD the Transmuter takes back in step 5.</Hint>

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
          title="0%. The balance falls on its own."
          onNext={onDone}
          nextLabel="See it against a loan with interest"
        >
          <Body>
            Your deposit does the paying instead. It keeps earning the whole time it backs
            the loan, and the protocol puts those earnings straight against your balance.
            How fast that runs depends on what the strategies earn and how quickly
            redemptions come round, so nobody can promise you a date.
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
    <Stage eyebrow="Stage 2 · Try" headline="Put the same 5,000 next to a loan with interest.">
      <Sub>
        Both loans start at 5,000 owed, and both are left completely alone. Set the rate a
        lender somewhere else might charge you.
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
        <Hint>The green line uses an example rate. Real rates move with what the strategies earn.</Hint>
      </div>

      <Controls>
        <Control
          label="Rate on a loan with interest"
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
          Two years at an example rate and you owe about{" "}
          {money(Math.round(OWED_AT_END / 100) * 100)}, having never made a payment either.
        </Note>
      </Notes>

      {moved ? (
        <Reveal
          title="One balance grows. The other gets paid down for you."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            A loan with interest climbs until you pay it down. An Alchemix balance falls
            instead, because the protocol is repaying it from the position while the deposit
            underneath carries on earning. The speed of that fall changes. The direction
            never does.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the rate control to continue.</Hint>
      )}
    </Stage>
  );
}
