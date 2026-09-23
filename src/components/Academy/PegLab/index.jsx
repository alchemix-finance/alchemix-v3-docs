import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { annualisedFromDiscount, termReturn } from "../lib/protocol";
import { priceText, useAlUsdPrice } from "../lib/useAlUsdPrice";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, Gate, GuessSlider, Panel, Primary,
  Question, Readout, Reveal, SHOTS, Stage, Sub, money, money2, said,
} from "../kit";

/**
 * Intermediate lesson 6: the peg and the discount.
 *
 * A synthetic trading under a dollar looks like a failure to anyone who has
 * watched an algorithmic stablecoin come apart. alAssets are different: every one
 * is backed by at least one unit of collateral, and the Transmuter will exchange
 * it 1:1 after a known wait.
 *
 * The discount is a price. The lesson asks the learner to work out the return at
 * that price, then shows the two buyers who take it and how their buying closes
 * the gap.
 */

const WEEKS = 20;
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
      passTitle="Lesson 6 complete."
      passBody="A discount on an alAsset is a rate, and the Transmuter is what makes that rate collectible. Savers and borrowers both run this arithmetic before they buy."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ price, live, onDone }) {
  const [guess, setGuess] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const perTerm = termReturn(price);
  const annual = annualisedFromDiscount(price, WEEKS);
  // The reveal quotes two decimals, so the slider moves in hundredths and the
  // guess is judged against the same two decimals. At tenths, 11.68% sat
  // between two positions and could not be chosen.
  const annualShown = Math.round(annual * 100) / 100;
  const bought = STAKE / price;

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline={`alUSD is trading at ${priceText(price, live)}${live ? " today" : ""} and redeems at 1.00.`}
    >
      <Sub>
        Every alUSD in circulation is backed by at least one USDC of collateral inside
        Alchemix, and the Transmuter will exchange it for the underlying at exactly 1:1
        once a governance-set term is up. Here that term runs {WEEKS} weeks. {money(STAKE)}{" "}
        USDC buys {money2(bought)} alUSD, which redeems for {money2(bought)} USDC: a gain of{" "}
        {perTerm.toFixed(2)}% over the term. The length of that term decides what the gain
        is worth per year.
      </Sub>

      <div className={own.tradeRow}>
        <TradeStep label="You spend" value={`${money(STAKE)} USDC`} />
        <TradeStep label="You receive" value={`${money2(bought)} alUSD`} tone="#f5c09a" />
        <TradeStep label={`After ${WEEKS} weeks`} value={`${money2(bought)} USDC`} tone="#5ba88a" />
      </div>

      <Panel>
        <Question>
          If you wait the full term and redeem 1:1, what is the annualized return?
        </Question>
        <GuessSlider
          label="Annualized return"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#5ba88a"
          min={0}
          max={30}
          step={0.01}
          format={(v) => `${v.toFixed(2)}%`}
          scale={["0%", "30%"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Wait the full term and the whole gain is yours.">
          <Primary onClick={() => setRevealed(true)}>Commit and hold to maturity</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`The wait is worth ${annual.toFixed(2)}% annualized, on a ${perTerm.toFixed(2)}% gain over the term.`}
          onNext={onDone}
          nextLabel="See who buys the discount"
        >
          <Body>
            {said(guess, annualShown, (v) => `${v.toFixed(2)}%`, 1.5)}
            Buying at {priceText(price, live)} and receiving 1.00 is a gain of{" "}
            {perTerm.toFixed(2)}% on what you put in. That gain arrives in {WEEKS} weeks,
            which is {annual.toFixed(2)}% annualized.
          </Body>
          <Body>
            The shorter the term, the more the same discount is worth. A wide discount pays
            too well to last.
          </Body>
        </Reveal>
      )}

      <AppShot shot={SHOTS.fixedPositions}>
        Two of these positions, open. APR is the annualized figure this stage asks you to
        work out, fixed at the price each one bought in at, and Profit is what has accrued
        against it so far.
      </AppShot>
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
  const [weeks, setWeeks] = useState(20);
  const [role, setRole] = useState("saver");
  const [seenBoth, setSeenBoth] = useState({ saver: true, borrower: false });

  const annual = annualisedFromDiscount(price, weeks);
  const perTerm = termReturn(price);
  const extra = STAKE / price - STAKE;

  const pickRole = (r) => {
    setRole(r);
    setSeenBoth((s) => ({ ...s, [r]: true }));
  };

  const both = seenBoth.saver && seenBoth.borrower;

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="A saver and a borrower both want alUSD below face value."
    >
      <Sub>
        The saver is buying the return on the wait. The borrower is buying back a dollar
        of their own debt for less than a dollar. Either way, the buying closes the gap.
      </Sub>

      <div className={own.roles}>
        <button type="button" className={`${own.role} ${role === "saver" ? own.roleOn : ""}`} onClick={() => pickRole("saver")}>
          <span className={own.roleName}>The saver</span>
          <span className={own.roleNote}>Waits out the term and redeems at 1.00</span>
        </button>
        <button type="button" className={`${own.role} ${role === "borrower" ? own.roleOn : ""}`} onClick={() => pickRole("borrower")}>
          <span className={own.roleName}>The borrower</span>
          <span className={own.roleNote}>Cancels a dollar of debt for less than a dollar</span>
        </button>
      </div>

      <div className={own.result}>
        {role === "saver" ? (
          <>
            <div className={styles.microLabel}>Annualized return on the wait</div>
            <div className={own.resultBig} style={{ color: "#5ba88a" }}>{annual.toFixed(2)}%</div>
            <div className={own.resultNote}>
              That is {perTerm.toFixed(2)}% over {weeks} weeks, redeemed 1:1 at maturity.
              Leaving the queue before it matures carries an early exit fee, so
              the figure assumes you wait.
            </div>
          </>
        ) : (
          <>
            <div className={styles.microLabel}>Debt cleared per {money(STAKE)} spent</div>
            <div className={own.resultBig} style={{ color: "#f5c09a" }}>{money2(STAKE / price)}</div>
            <div className={own.resultNote}>
              Every alUSD cancels exactly 1 of debt inside Alchemix, whatever you paid for
              it. Buying at {price.toFixed(3)} clears {money2(extra)} more debt than the
              same money would at par.
            </div>
          </>
        )}
      </div>

      <Controls>
        <Control
          label="alUSD price"
          display={price.toFixed(3)}
          min={0.9} max={0.999} step={0.001}
          value={price}
          onChange={setPrice}
          accent
        />
        <Control
          label="Transmutation term"
          display={`${weeks} weeks`}
          min={4} max={40} step={1}
          value={weeks}
          onChange={setWeeks}
          verdict={role === "saver" ? (weeks <= 10 ? "a shorter wait pays more" : null) : undefined}
        />
      </Controls>

      <Readout>
        At {price.toFixed(3)} over {weeks} weeks, the wait is worth{" "}
        <strong>{annual.toFixed(2)}%</strong> annualized.
      </Readout>

      {both ? (
        <Reveal
          title="Both kinds of buying push the price back toward 1.00."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            Demand for cheap alUSD is what closes the gap. The Transmuter guarantees the
            1:1 exchange at the end of a known wait, so the wider the discount, the better
            that trade pays and the faster buyers step in.
          </Body>
          <Body>
            alAssets are synthetic debt tokens. The peg rests on two things, the collateral
            behind every unit and the Transmuter's promise to exchange it 1:1 at
            maturity. Borrower collateral is what funds that promise: every alAsset in the
            queue earmarks an equal value of it inside the Alchemist, and at maturity that
            collateral settles the claim. An algorithmic stablecoin defends its price by
            minting and burning against the market. Alchemix never has to.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the checkpoint" hint="Open the other role to continue." />
      )}
    </Stage>
  );
}
