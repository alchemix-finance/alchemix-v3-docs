import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { priceText, useAlUsdPrice } from "../lib/useAlUsdPrice";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, GuessSlider,
  Hint, Note, Notes, Panel, Primary, Question, Readout, Reveal, SHOTS, Stage, Sub, money,
  said,
} from "../kit";

/**
 * Lesson 6: the Transmuter.
 *
 * Framed as what it is, a fixed-rate yield product: buy alAssets below face
 * value, wait out a governance-set term, collect 1:1. NOT as the borrower's
 * exit. A borrower holding alUSD repays with it, since 1 alUSD cancels 1 of
 * debt inside the Alchemist, and routing it through the Transmuter would mean
 * waiting out a term for USDC while still carrying the debt.
 *
 * The learner buys at a discount, guesses what comes out after the term, then
 * sets an amount and a market price and watches the two routes side by side.
 * The one-for-one tile shows exactly the amount put in; only the sell-now tile
 * follows the price.
 *
 * The lesson names the fields on the Fixed Yield card and not their values. The
 * DAO sets the term and the fees and both vary by asset and chain, but the card
 * itself is stable: a projected fixed APR, a maturity date, a term, an early
 * exit fee, a deposit cap, and the alAsset price it quotes against. Knowing
 * what to read is the part that survives a governance vote.
 *
 * Buying and depositing is one action in the app, "Swap & Deposit", not two.
 * The flow below draws it that way.
 */

const HOLDING = 5_000;

export default function TransmuterLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  const { price, live } = useAlUsdPrice();

  if (stage === "predict") return <Learn price={price} live={live} onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Try market={price} onDone={() => onStage("checkpoint")} />;

  return (
    <ChoiceCheckpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      passTitle="Track complete."
      passBody="You can now deposit, borrow against it, leave redemptions to clear the balance, identify the one risk that can reach you, and earn a fixed rate through the Transmuter."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ price, live, onDone }) {
  const cost = HOLDING * price;
  const [guess, setGuess] = useState(() => Math.round(cost / 25) * 25);
  const [revealed, setRevealed] = useState(false);

  // Step 3 is the only part of the picture the reveal changes.
  const steps = [
    {
      n: 1,
      label: "Swap & deposit",
      value: `${money(cost)} USDC`,
      note: "One button on the Fixed Yield page buys the alUSD at the market price and deposits it.",
      tone: "#8ea9d8",
    },
    {
      n: 2,
      label: "Wait",
      value: "The term",
      note: "The DAO sets it. The card names the maturity date before you commit.",
      tone: "#8ea9d8",
    },
    {
      n: 3,
      label: "Receive",
      value: revealed ? `${money(HOLDING)} USDC` : "USDC",
      note: "Payment arrives as MYT and the app turns it into USDC.",
      tone: revealed ? "#5ba88a" : "#8ea9d8",
    },
  ];

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Buy alUSD below a dollar, redeem it for a full USDC.">
      <Sub>
        alUSD trades a little below face value, because borrowers sell the alUSD they mint.{" "}
        {live ? (
          <>Today each one costs {priceText(price, live)} USDC, so {money(HOLDING)} alUSD comes to {money(cost)}.</>
        ) : (
          <>At {priceText(price, live)} USDC each, {money(HOLDING)} alUSD comes to {money(cost)}.</>
        )}{" "}
        On the Fixed Yield page, Swap &amp; Deposit does the purchase and the deposit in one
        go, and then you wait out the term.
      </Sub>

      <FlowSteps steps={steps} />

      <AppShot shot={SHOTS.fixedYieldCard}>
        One card on the Fixed Yield page. The alUSD price is what you buy at, the term is
        how long you wait, and the projected fixed APR is the first two annualized.
      </AppShot>

      <Panel>
        <Question>You wait the full term. How much USDC do you receive?</Question>
        <GuessSlider
          label="USDC received"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#8ea9d8"
          min={4_500}
          max={5_500}
          step={25}
          format={(v) => money(v)}
          scale={["Less than went in", "More than went in"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside={`You paid ${money(cost)} USDC for it.`}>
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${money(HOLDING)} USDC comes back, one for one.`}
          onNext={onDone}
          nextLabel="Compare it with selling"
        >
          <Body>
            {said(guess, HOLDING, money)}
            The Transmuter ignores the market price entirely. One alUSD returns one USDC,
            one alETH returns one ETH, once the term is up. You paid{" "}
            {money(cost)} and receive {money(HOLDING)}, so the discount you bought
            at is your return. The Alchemix DAO sets the term and it varies, so check the
            current one in the app before you deposit.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ market, onDone }) {
  const [amount, setAmount] = useState(HOLDING);
  const [price, setPrice] = useState(market);
  const [moved, setMoved] = useState({ amount: false, price: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const sellNow = amount * price;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Weigh selling now against waiting.">
      <Sub>
        Only the sell-now figure follows the market price.
      </Sub>

      <div className={own.routes}>
        <div className={own.route}>
          <div className={styles.microLabel}>Sell on the market</div>
          <div className={own.routeValue} style={{ color: "#d4952a" }}>{money(sellNow)}</div>
          <div className={own.routeFoot}>USDC, today</div>
        </div>
        <div className={`${own.route} ${own.routeWait}`}>
          <div className={styles.microLabel}>Transmuter</div>
          <div className={own.routeValue} style={{ color: "#8ea9d8" }}>{money(amount)}</div>
          <div className={own.routeFoot}>USDC, after the term</div>
        </div>
      </div>

      <Readout>Waiting returns {money(amount - sellNow)} more.</Readout>

      <Controls>
        <Control
          label="alUSD in"
          display={`${money(amount)} alUSD`}
          min={0} max={HOLDING} step={250}
          value={amount}
          onChange={(v) => { setAmount(v); mark("amount"); }}
          accent
        />
        <Control
          label="Market price of alUSD"
          display={price.toFixed(3)}
          min={0.9} max={1} step={0.001}
          value={price}
          onChange={(v) => { setPrice(v); mark("price"); }}
        />
      </Controls>

      <Notes>
        <Note label="Reading the card">
          Each Fixed Yield card carries a projected fixed APR, the maturity date, the term,
          the early exit fee, the deposit cap, and the alAsset price it is quoting against.
          Those figures are live and the DAO changes them.
        </Note>
        <Note label="Leaving early">
          You can close a Transmuter position before it matures. The early exit fee on the card is what it costs, and it exists to keep deposits committed for the term.
        </Note>
      </Notes>

      {moved.amount && moved.price ? (
        <Reveal
          title="The guarantee holds the price near 1.00."
          onNext={onDone}
          nextLabel="Take the last check"
        >
          <Body>
            The further alUSD trades below 1.00, the more it pays to buy it and wait out the
            term, and that buying pulls the price back up.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls to continue.</Hint>
      )}
    </Stage>
  );
}
