import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { annualisedFromDiscount, termReturn } from "../lib/protocol";
import { priceText, useAlUsdPrice } from "../lib/useAlUsdPrice";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, GuessSlider,
  Hint, Panel, Primary, Question, Readout, Reveal, SHOTS, Stage, Sub, money, said,
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
 * The learner buys at a discount and guesses what comes out after the term.
 * Then, in Try, they move the two figures the card's rate is built from, the
 * price and the term, and the projected fixed APR follows. Try used to
 * weigh selling the alUSD on the market against waiting, which is a decision
 * the saver never faces: they bought at the market price, so selling back
 * returns what they paid, and the only question they have is what the wait is
 * worth. It also had an amount control that scaled both figures together and
 * taught nothing.
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

/**
 * The term Try starts on. The intermediate peg lesson runs the same 20 weeks,
 * which is the term the protocol constants were checked against.
 */
const WEEKS = 20;

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
          nextLabel="See what sets the rate"
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

/**
 * The card's projected fixed APR, built from its two ingredients. The learner
 * does not set either in the app: the market sets the price and the DAO sets
 * the term. Both controls are worded as suppositions for that reason, and the
 * figure that answers them is the one the card prints.
 */
function Try({ market, onDone }) {
  const [price, setPrice] = useState(market);
  const [weeks, setWeeks] = useState(WEEKS);
  const [moved, setMoved] = useState({ price: false, weeks: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const cost = HOLDING * price;
  const gain = termReturn(price);
  const apr = annualisedFromDiscount(price, weeks);

  const priceVerdict = !moved.price || price === market
    ? null
    : price < market ? "a wider discount, a higher rate" : "a narrower discount, a lower rate";
  const weeksVerdict = !moved.weeks || weeks === WEEKS
    ? null
    : weeks < WEEKS ? "a shorter wait, a higher rate" : "a longer wait, a lower rate";

  return (
    <Stage eyebrow="Stage 2 · Try" headline="The price and the term set the rate on the card.">
      <Sub>
        The same {money(HOLDING)} USDC comes back whatever the two say. What they decide is
        what the wait is worth, and the card prints that as a projected fixed APR.
      </Sub>

      <div className={own.routes}>
        <div className={own.route}>
          <div className={styles.microLabel}>You pay</div>
          <div className={own.routeValue} style={{ color: "#d4952a" }}>{money(cost)}</div>
          <div className={own.routeFoot}>USDC, at {price.toFixed(3)} each</div>
        </div>
        <div className={own.route}>
          <div className={styles.microLabel}>You receive</div>
          <div className={own.routeValue} style={{ color: "#8ea9d8" }}>{money(HOLDING)}</div>
          <div className={own.routeFoot}>USDC, after {weeks} weeks</div>
        </div>
        <div className={`${own.route} ${own.routeRate}`}>
          <div className={styles.microLabel}>Projected fixed APR</div>
          <div className={own.routeValue} style={{ color: "#5ba88a" }}>{apr.toFixed(2)}%</div>
          <div className={own.routeFoot}>{gain.toFixed(2)}% over the term, as a yearly rate</div>
        </div>
      </div>

      <Readout>
        Buying at {price.toFixed(3)} and receiving 1.00 is a gain of{" "}
        <strong>{gain.toFixed(2)}%</strong> over {weeks} weeks. The card states that as a yearly
        rate, <strong>{apr.toFixed(2)}%</strong>.
      </Readout>

      <Controls>
        <Control
          label="Suppose alUSD trades at"
          display={price.toFixed(3)}
          min={0.9} max={0.999} step={0.001}
          value={price}
          onChange={(v) => { setPrice(v); mark("price"); }}
          accent
          verdict={priceVerdict}
        />
        <Control
          label="Suppose the term is"
          display={`${weeks} weeks`}
          min={4} max={40} step={1}
          value={weeks}
          onChange={(v) => { setWeeks(v); mark("weeks"); }}
          verdict={weeksVerdict}
        />
      </Controls>

      {moved.price && moved.weeks ? (
        <Reveal
          title="A wide discount pays too well to last."
          onNext={onDone}
          nextLabel="Take the last check"
        >
          <Body>
            The further alUSD trades below 1.00, the more the wait pays, so buyers step in
            for it, and their buying pushes the price back toward 1.00. That is why the
            discount is usually small, and why the rate on the card changes from one day to
            the next.
          </Body>
          <Body>
            The DAO sets the term. A longer wait spreads the same gain over more of the year,
            so the rate falls, and the maturity date on the card names the day the exchange
            opens. You can leave before that day, and the early exit fee on the card is what
            it costs.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls to continue.</Hint>
      )}

      <AppShot shot={SHOTS.fixedYieldCard}>
        One card on the Fixed Yield page. Its projected fixed APR is the two controls above
        combined: the alUSD price is what you buy at, the term is the wait, and the maturity
        date is the day it ends. The early exit fee and the deposit cap sit on the same card.
        The DAO sets the term and the fee, and the market sets the price, so read the card
        before you deposit.
      </AppShot>
    </Stage>
  );
}
