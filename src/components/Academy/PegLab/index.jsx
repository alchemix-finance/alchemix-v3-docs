import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { annualisedFromDiscount, termReturn } from "../lib/protocol";
import { priceText, useAlUsdPrice } from "../lib/useAlUsdPrice";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, Gate, GuessSlider, Panel, Primary,
  Question, Reveal, SHOTS, Stage, Sub, money, money2, said,
} from "../kit";

/**
 * Intermediate lesson 3: the peg and the discount.
 *
 * A synthetic trading under a dollar looks like a failure to anyone who has
 * watched an algorithmic stablecoin come apart. alAssets are different: every one
 * is backed by at least one unit of collateral, and the Transmuter will exchange
 * it 1:1 after a known wait.
 *
 * It follows the cost lesson, where the learner sold borrowed alUSD below a
 * dollar, so it opens on the other side of that trade: buying alUSD back below
 * a dollar clears a full dollar of debt. That is the idea the beginner track
 * never taught. It used to open by asking for the saver's annualized return to
 * two decimals, which is arithmetic, and which the beginner Transmuter lesson's
 * Try had already shown moving with the price and the term.
 *
 * Explore puts the saver and the borrower side by side on the same two
 * controls, so the learner sees both reasons to buy the discount at once. It
 * used to hide one behind a toggle and gate on clicking it.
 */

const WEEKS = 20;
const OWED = 5_000;
const STAKE = 10_000;

export default function PegLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  const { price, live } = useAlUsdPrice();

  if (stage === "predict") return <Predict price={price} live={live} onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Explore market={price} onDone={() => onStage("checkpoint")} />;

  return (
    <Checkpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      passTitle="Lesson 3 complete."
      passBody="A discount on an alAsset pays whoever buys it: the saver who waits out the term, and the borrower who repays with it. Their buying is what pulls the price back toward 1.00."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ price, live, onDone }) {
  const [guess, setGuess] = useState(OWED);
  const [revealed, setRevealed] = useState(false);

  const cost = OWED * price;

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline={`You owe 5,000, and alUSD is trading at ${priceText(price, live)}${live ? " today" : ""}.`}
    >
      <Sub>
        In the last lesson you borrowed alUSD and sold it at the market price. Now you want to
        clear the debt. Inside Alchemix one alUSD cancels one of debt, whatever you paid for it.
      </Sub>

      <Panel>
        <Question>You buy alUSD on the market and repay with it. How much USDC does clearing the 5,000 cost?</Question>
        <GuessSlider
          label="USDC spent"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={4_500}
          max={5_500}
          /* The price is quoted to three decimals, so 5,000 times it is a
             multiple of 5. */
          step={5}
          format={(v) => money(v)}
          scale={["4,500", "5,500"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="The debt is recorded at face value.">
          <Primary onClick={() => setRevealed(true)}>Commit and repay</Primary>
        </Actions>
      ) : (
        <>
          <div className={own.tradeRow}>
            <TradeStep label="You spend" value={`${money(cost)} USDC`} />
            <TradeStep label="You receive" value={`${money(OWED)} alUSD`} tone="#f5c09a" />
            <TradeStep label="Debt cleared" value={money(OWED)} tone="#5ba88a" />
          </div>
          <Reveal
            title={`${money(cost)} USDC clears all 5,000.`}
            onNext={onDone}
            nextLabel="See who else buys the discount"
          >
            <Body>
              {said(guess, cost, money, 25)}
              You buy alUSD at the market price and repay at face value, so buying it back
              below 1.00 clears debt for less than was recorded. You win back the discount
              you gave up when you sold.
            </Body>
            <Body>
              Savers want the same cheap alUSD for another reason: the Transmuter exchanges
              it 1:1 after a governance-set term. Every alUSD in circulation is backed by at
              least one USDC of collateral inside Alchemix, and that collateral is what the
              exchange is paid from.
            </Body>
          </Reveal>
        </>
      )}
    </Stage>
  );
}

function TradeStep({ label, value, tone }) {
  return (
    <div className={own.trade}>
      <div className={styles.statLabel}>{label}</div>
      <div className={own.tradeValue} style={tone ? { color: tone } : undefined}>{value}</div>
    </div>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ market, onDone }) {
  const [price, setPrice] = useState(market);
  const [weeks, setWeeks] = useState(WEEKS);
  const [moved, setMoved] = useState({ price: false, weeks: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const annual = annualisedFromDiscount(price, weeks);
  const perTerm = termReturn(price);
  const extra = STAKE / price - STAKE;

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="A saver and a borrower both want alUSD below face value."
    >
      <Sub>
        The saver buys the return on the wait. The borrower buys back a dollar of debt for less
        than a dollar. Each figure below is what one of them gets for {money(STAKE)} USDC at the price
        and term you set.
      </Sub>

      <div className={own.results}>
        <div className={own.result}>
          <div className={styles.microLabel}>The saver: yearly return on the wait</div>
          <div className={own.resultBig} style={{ color: "#5ba88a" }}>{annual.toFixed(2)}%</div>
          <div className={own.resultNote}>
            {perTerm.toFixed(2)}% over {weeks} weeks, redeemed 1:1 at maturity.
          </div>
        </div>
        <div className={own.result}>
          <div className={styles.microLabel}>The borrower: debt cleared</div>
          <div className={own.resultBig} style={{ color: "#f5c09a" }}>{money2(STAKE / price)}</div>
          <div className={own.resultNote}>
            {money2(extra)} more than the same USDC would clear at 1.00. The term does not
            touch it: repaying settles today.
          </div>
        </div>
      </div>

      <Controls>
        <Control
          label="alUSD price"
          display={price.toFixed(3)}
          min={0.9} max={0.999} step={0.001}
          value={price}
          onChange={(v) => { setPrice(v); mark("price"); }}
          accent
          verdict={moved.price ? (price < market ? "a wider discount pays both of them more" : price > market ? "a narrower discount pays both of them less" : null) : null}
        />
        <Control
          label="Transmutation term"
          display={`${weeks} weeks`}
          min={4} max={40} step={1}
          value={weeks}
          onChange={(v) => { setWeeks(v); mark("weeks"); }}
          verdict={moved.weeks ? "moves the saver only" : null}
        />
      </Controls>

      {moved.price && moved.weeks ? (
        <Reveal
          title="Both kinds of buying push the price back toward 1.00."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            Demand for cheap alUSD is what closes the gap. The wider the discount, the more it
            pays the saver and the borrower alike, so the faster buyers step in, and their
            buying lifts the price.
          </Body>
          <Body>
            The peg rests on two things: the collateral behind every alUSD, and the
            Transmuter's promise to exchange it 1:1 at maturity. Borrower collateral is what
            funds that promise. As each alUSD in the queue matures it earmarks an equal value
            of it inside the Alchemist, and when the saver claims, that collateral settles the
            claim. An algorithmic stablecoin defends its price by minting and burning against
            the market. Alchemix never has to.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the checkpoint" hint="Move the price and the term to continue." />
      )}

      <AppShot shot={SHOTS.fixedPositions}>
        Two saver positions, open. APR is the yearly return the saver's figure above works
        out, fixed at the price each one bought in at, and Profit is what has accrued against
        it so far.
      </AppShot>
    </Stage>
  );
}
