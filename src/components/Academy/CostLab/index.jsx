import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { EXAMPLE_AL_PRICE, borrowNeededFor, discountCost } from "../lib/protocol";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel, Primary,
  Question, Readout, Reveal, SHOTS, Stage, Sub, money, money2, said,
} from "../kit";

/**
 * Intermediate lesson 4: what borrowing really costs.
 *
 * There is no interest rate, which regularly gets read as "there is no cost".
 * There is one, it is just charged differently: alAssets are minted at face value
 * and can trade below it, so selling them for working capital realizes the gap
 * immediately while the recorded debt stays at face.
 *
 * The lesson lands by making the learner short of the amount they wanted. Asking
 * for 5,000 and receiving 4,850 is a more durable explanation than a paragraph
 * about market discounts.
 */

const WANT = 5_000;
const PRICE = EXAMPLE_AL_PRICE;

export default function CostLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Lesson 4 complete."
      passBody="You can size a borrow against the price you will sell it at, so the amount you receive matches what you needed. You owe the larger number as debt, and the gap between the two is what borrowing costs you."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState(WANT);
  const [revealed, setRevealed] = useState(false);

  const received = WANT * PRICE;
  const shortfall = WANT - received;

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline="An Alchemix loan charges no interest. You pay the cost when you sell the alUSD."
    >
      <Sub>
        You borrow {money(WANT)} alUSD against your position, and the debt recorded
        against you is {money(WANT)}. What you actually want is spendable USDC, so you
        sell the alUSD on the open market, where it is trading at {PRICE.toFixed(2)}.
      </Sub>

      <AppShot shot={SHOTS.alAssetPrice}>
        The app quotes the same price this lesson is charging you. Every Fixed Yield card
        prints what the alAsset is trading at, which is what a buyer pays and therefore
        what you receive when you sell.
      </AppShot>

      <Panel>
        <Question>How much USDC do you receive?</Question>
        <GuessSlider
          label="USDC received"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={4_000}
          max={5_500}
          step={10}
          format={(v) => money(v)}
          scale={["4,000", "5,500"]}
        />
      </Panel>

      {!revealed ? (
        <Actions>
          <Primary onClick={() => setRevealed(true)}>Commit and sell</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`You receive ${money(received)}, and you owe ${money(WANT)}.`}
          onNext={onDone}
          nextLabel="See what sets the gap"
        >
          <Body>
            {said(guess, received, money, 60)}
            The {money(shortfall)} difference is the market discount, and it is what
            borrowing costs you here. You pay it once, at the moment you sell.
          </Body>
          <Body>
            Inside Alchemix, 1 alUSD still cancels exactly 1 of debt. The discount exists
            only on the open market. Buying alUSD back below 1.00 clears debt for less
            than face value.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [want, setWant] = useState(5_000);
  const [price, setPrice] = useState(EXAMPLE_AL_PRICE);
  const [moved, setMoved] = useState({ want: false, price: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const naiveReceived = want * price;
  const needToBorrow = borrowNeededFor(want, price);
  const cost = discountCost(needToBorrow, price);

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="To receive the full amount, you have to borrow more than it."
    >
      <Sub>
        The gap between what you borrow and what you receive is what the discount costs
        you.
      </Sub>

      <div className={own.compare}>
        <div className={own.side}>
          <div className={styles.microLabel}>Borrow exactly what you want</div>
          <div className={own.big}>{money(want)}</div>
          <div className={own.sideNote}>alUSD borrowed</div>
          <div className={own.sideResult} style={{ color: "#d4645a" }}>
            You receive {money(naiveReceived)}
          </div>
          <div className={own.sideNote}>short by {money(want - naiveReceived)}</div>
        </div>

        <div className={`${own.side} ${own.sideGood}`}>
          <div className={styles.microLabel}>Borrow enough to receive it</div>
          <div className={own.big} style={{ color: "#5ba88a" }}>{money2(needToBorrow)}</div>
          <div className={own.sideNote}>alUSD borrowed</div>
          <div className={own.sideResult} style={{ color: "#5ba88a" }}>
            You receive {money(want)}
          </div>
          <div className={own.sideNote}>debt is {money2(needToBorrow)}, cost {money2(cost)}</div>
        </div>
      </div>

      <Controls>
        <Control
          label="Capital you need"
          display={money(want)}
          min={1_000} max={20_000} step={250}
          value={want}
          onChange={(v) => { setWant(v); mark("want"); }}
        />
        <Control
          label="alUSD price"
          display={price.toFixed(3)}
          min={0.9} max={1} step={0.001}
          value={price}
          onChange={(v) => { setPrice(v); mark("price"); }}
          accent
          verdict={price >= 0.999 ? "at par, no discount" : null}
        />
      </Controls>

      <Readout>
        At {price.toFixed(3)}, raising {money(want)} costs you{" "}
        <strong>{money2(cost)}</strong> in extra debt you will have to clear.
      </Readout>

      {moved.want && moved.price ? (
        <Reveal
          title="The discount is the cost, and it grows with the size of the borrow."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            The price you sold at settles your cost. Hold the loan for as long as you like
            and that figure stays where it is, because Alchemix charges no interest.
          </Body>
          <Body>
            The other cost is the borrower redemption fee. When redemptions repay your debt
            out of your collateral, the protocol takes a small share of the amount repaid.
            Like the discount, it is charged on an event rather than by the calendar.
            Governance sets the rate, and the fee schedule in the docs shows the live one.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls to continue.</Hint>
      )}
    </Stage>
  );
}
