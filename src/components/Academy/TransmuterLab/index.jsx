import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, GuessSlider, Hint,
  Note, Notes, Panel, Primary, Question, Readout, Reveal, Stage, Sub, money, money2,
} from "../kit";

/**
 * Lesson 6: turning alAssets back.
 *
 * The 5,000 alUSD borrowed in lesson 3 goes back through the Transmuter. The
 * learner guesses what comes out after the term, then sets an amount and a
 * market price and watches the two routes side by side. The one-for-one tile
 * shows exactly the amount put in; only the sell-now tile follows the price.
 *
 * This lesson states no term length and no fee rate. The DAO sets both and both
 * vary, so the copy points at the app for the live figures instead.
 */

const HOLDING = 5_000;
const PRICE = 0.97;

export default function TransmuterLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Track complete."
      passBody="You can now deposit, borrow against it, leave the balance to fall on its own, name the one risk that can actually reach you, and turn alUSD back into USDC. That covers everything the app asks of a first-time user."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(HOLDING * PRICE);
  const [revealed, setRevealed] = useState(false);

  // Step 3 is the only part of the picture the reveal changes.
  const steps = [
    {
      n: 1,
      label: "Deposit",
      value: `${money(HOLDING)} alUSD`,
      note: "You deposit it on the Fixed Yield page",
      tone: "#8ea9d8",
    },
    {
      n: 2,
      label: "Wait",
      value: "The term",
      note: "The Alchemix DAO sets it and the app shows it",
      tone: "#8ea9d8",
    },
    {
      n: 3,
      label: "Receive",
      value: revealed ? `${money(HOLDING)} USDC` : "USDC",
      note: "Payment arrives as MYT and the app turns it into USDC",
      tone: revealed ? "#5ba88a" : "#8ea9d8",
    },
  ];

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Now turn the alUSD back into USDC.">
      <Sub>
        You are holding the {money(HOLDING)} alUSD you borrowed. On the open market today, each
        one sells for {money2(PRICE)} USDC. The Transmuter is the other way out, and the app
        puts it on the Fixed Yield page.
      </Sub>

      <FlowSteps steps={steps} />

      <Panel>
        <Question>You wait the full term. How much USDC comes back?</Question>
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
        <Actions aside={`Selling it today would return ${money(HOLDING * PRICE)} USDC.`}>
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${money(HOLDING)} USDC comes back, one for one.`}
          onNext={onDone}
          nextLabel="Compare it with selling"
        >
          <Body>
            The Transmuter ignores the market price entirely. One alUSD returns one USDC,
            one alETH returns one ETH, once the term is up. Wait it out and you keep the full
            amount. Leave early and you pay a fee. Check the current term in the app before
            you deposit.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [amount, setAmount] = useState(HOLDING);
  const [price, setPrice] = useState(PRICE);
  const [moved, setMoved] = useState({ amount: false, price: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const sellNow = amount * price;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Weigh selling now against waiting.">
      <Sub>Set the amount and the market price, and both routes update as you go.</Sub>

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
          display={money2(price)}
          min={0.9} max={1} step={0.005}
          value={price}
          onChange={(v) => { setPrice(v); mark("price"); }}
        />
      </Controls>

      <Notes>
        <Note label="Leaving early">
          You can close a Transmuter position before it matures. An early exit fee applies,
          and the app shows it in advance.
        </Note>
        <Note label="The term">
          The term differs by asset and by chain, and the app shows it before you deposit.
        </Note>
      </Notes>

      {moved.amount && moved.price ? (
        <Reveal
          title="The guarantee holds the price near 1.00."
          onNext={onDone}
          nextLabel="Take the last check"
        >
          <Body>
            Move the price down and the gap widens. The further alUSD trades below 1.00, the
            more it pays to buy it and wait out the term, and that buying pulls the price back
            up.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls to continue.</Hint>
      )}
    </Stage>
  );
}
