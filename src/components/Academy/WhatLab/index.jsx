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
 * The falling balance is the dApp's own projection at an illustrative pace.
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
  { n: 1, label: "Deposit", value: "10,000 USDC", note: "Mixed Yield page. Into a vault, the pool that holds deposits. You receive MYT, a share of it.", tone: "#5ba88a" },
  { n: 2, label: "Earn", value: "MYT grows", note: "The DAO runs the strategies", tone: "#5ba88a" },
  { n: 3, label: "Borrow", value: "5,000 alUSD", note: "Vaults page. Up to 90% of the deposit, which stays in and keeps earning", tone: "#f5c09a" },
  { n: 4, label: "Balance falls", value: "no payments", note: "Repaid out of the position", tone: "#f5c09a" },
  { n: 5, label: "alUSD returns", value: "1:1 for USDC", note: "Fixed Yield page. Through the Transmuter, after a wait", tone: "#8ea9d8" },
];

/** After the reveal, step 4 carries the answer. Nothing else in the picture changes. */
const LOOP_REVEALED = LOOP.map((s) =>
  s.n === 4 ? { ...s, value: "no interest, no payments", tone: "#5ba88a" } : s,
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
      headline="Answer the question."
      passTitle="Lesson 1 complete."
      passBody="You can say what Alchemix offers, and you know the loan balance falls without payments."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(7);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Alchemix does three things.">
      <Sub>
        Deposit and earn. Borrow against the deposit. Turn alUSD back into USDC. Each one
        has its own page in the app.
      </Sub>

      <div className={own.loop}>
        <FlowSteps steps={revealed ? LOOP_REVEALED : LOOP} />
      </div>
      <Hint>The alUSD from step 3 is what step 5 takes back.</Hint>

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
        <Actions aside="Set the rate you would expect.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title="0%. The balance falls on its own."
          onNext={onDone}
          nextLabel="See it against a loan with interest"
        >
          <Body>
            No interest is added to an Alchemix loan, and there is no payment schedule. The
            protocol repays the balance out of the position, and the deposit keeps earning
            while it does. How fast the balance falls depends on protocol conditions that
            change, so no date can be promised.
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
    <Stage eyebrow="Stage 2 · Try" headline="The same 5,000, two ways.">
      <Sub>
        Both loans start at 5,000 owed, with nothing repaid by hand. Set the rate a lender
        might charge you elsewhere.
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
        <Hint>Illustrative pace. The live pace moves with protocol conditions.</Hint>
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
          {money(interestAt(MONTHS))} owed after two years at {rate}%, with nothing repaid.
        </Note>
        <Note label="Alchemix">
          About {money(Math.round(OWED_AT_END / 100) * 100)} owed after two years at the
          illustrative pace, with nothing repaid.
        </Note>
      </Notes>

      {moved ? (
        <Reveal
          title="One balance grows. The other is repaid from the position."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            A loan with interest rises until you pay it. An Alchemix balance falls because
            the protocol repays it from the position, while the deposit underneath keeps
            earning. The pace changes with protocol conditions. The direction does not.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the rate control to continue.</Hint>
      )}
    </Stage>
  );
}
