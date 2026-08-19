import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { annualisedFromDiscount, termReturn } from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel,
  Primary, Question, Readout, Reveal, Stage, Sub, money, money2,
} from "../kit";

/**
 * Lesson 5: the Transmuter and the peg.
 *
 * A synthetic trading under a dollar looks like a failure to anyone who has
 * watched an algorithmic stablecoin come apart. alAssets are not that: every one
 * is backed by at least one unit of collateral, and the Transmuter will exchange
 * it 1:1 after a known wait.
 *
 * So the discount is not damage, it is a price. The lesson asks the learner to
 * decide whether they would buy at that price, then shows the two people who
 * always do, and why their buying is what closes the gap.
 */

const PRICE = 0.97;
const WEEKS = 20;
const STAKE = 10_000;

export default function PegLab({ lessonId, stage, onStage, done, onComplete }) {
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
      headline="Price the wait."
      unit="apr"
      targetOf={(f) => annualisedFromDiscount(f.price, f.weeks)}
      computeOf={(f, v) => v}
      controlLabel="Annualised return"
      controlDisplay={(v) => `${v.toFixed(2)}%`}
      targetFoot="what the wait is worth, annualised"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 5 complete."
      passBody="You can price a discount against the time you have to wait for it, which is the same calculation the people who close the gap are running."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const perTerm = termReturn(PRICE);
  const annual = annualisedFromDiscount(PRICE, WEEKS);
  const bought = STAKE / PRICE;
  const close = Math.abs(guess - annual) <= 1.5;

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline="alUSD is trading at 0.97. Nothing is broken."
    >
      <Sub>
        Every alUSD in circulation is backed by at least one USDC of collateral inside
        Alchemix, and the Transmuter will exchange it for the underlying at exactly 1:1
        after a fixed term. In this lesson the term is {WEEKS} weeks.
      </Sub>

      <div className={own.tradeRow}>
        <TradeStep label="You spend" value={`${money(STAKE)} USDC`} />
        <TradeStep label="You receive" value={`${money2(bought)} alUSD`} tone="#f5c09a" />
        <TradeStep label={`After ${WEEKS} weeks`} value={`${money2(bought)} USDC`} tone="#5ba88a" />
      </div>

      <Panel>
        <Question>
          Waiting the full term and redeeming 1:1, what does that work out to annualised?
        </Question>
        <GuessSlider
          label="Annualised return"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#5ba88a"
          min={0}
          max={30}
          step={0.1}
          format={(v) => `${v.toFixed(1)}%`}
          scale={["0%", "30%"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Waiting the full term carries no exit fee.">
          <Primary onClick={() => setRevealed(true)}>Commit and hold to maturity</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${annual.toFixed(2)}% annualised, from a ${perTerm.toFixed(2)}% gain over the term.`}
          onNext={onDone}
          nextLabel="See who else is buying"
        >
          <Body>
            {close ? "That is close. " : `You answered ${guess.toFixed(1)}%. `}
            Buying at {PRICE.toFixed(2)} and receiving 1.00 is a gain of{" "}
            {perTerm.toFixed(2)}% on what you put in. Compressing that gain into {WEEKS} weeks is what lifts it to {annual.toFixed(2)}% annualised.
          </Body>
          <Body>
            The shorter the term, the more the same discount is worth. That relationship
            is what makes a persistent discount so hard to sustain.
          </Body>
        </Reveal>
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

function Explore({ onDone }) {
  const [price, setPrice] = useState(0.97);
  const [weeks, setWeeks] = useState(20);
  const [role, setRole] = useState("saver");
  const [seenBoth, setSeenBoth] = useState({ saver: true, borrower: false });

  const annual = annualisedFromDiscount(price, weeks);
  const perTerm = termReturn(price);
  const saved = STAKE * (1 - price);

  const pickRole = (r) => {
    setRole(r);
    setSeenBoth((s) => ({ ...s, [r]: true }));
  };

  const both = seenBoth.saver && seenBoth.borrower;

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="Two people want that discount, for completely different reasons."
    >
      <Sub>
        Both of them buy alUSD below face value. One is buying a return, the other is
        buying back their own debt. Their buying is what closes the gap.
      </Sub>

      <div className={own.roles}>
        <button type="button" className={`${own.role} ${role === "saver" ? own.roleOn : ""}`} onClick={() => pickRole("saver")}>
          <span className={own.roleName}>The saver</span>
          <span className={own.roleNote}>Buys the discount, waits for maturity</span>
        </button>
        <button type="button" className={`${own.role} ${role === "borrower" ? own.roleOn : ""}`} onClick={() => pickRole("borrower")}>
          <span className={own.roleName}>The borrower</span>
          <span className={own.roleNote}>Buys the discount to clear debt cheaply</span>
        </button>
      </div>

      <div className={own.result}>
        {role === "saver" ? (
          <>
            <div className={styles.microLabel}>Annualised return on the wait</div>
            <div className={own.resultBig} style={{ color: "#5ba88a" }}>{annual.toFixed(2)}%</div>
            <div className={own.resultNote}>
              {perTerm.toFixed(2)}% over {weeks} weeks, redeemed 1:1 at maturity. Leaving the
              queue before it matures carries an early transmutation fee, so the return
              assumes you wait.
            </div>
          </>
        ) : (
          <>
            <div className={styles.microLabel}>Debt cleared per {money(STAKE)} spent</div>
            <div className={own.resultBig} style={{ color: "#f5c09a" }}>{money2(STAKE / price)}</div>
            <div className={own.resultNote}>
              Every alUSD cancels exactly 1 of debt inside Alchemix, whatever you paid for
              it. Buying at {price.toFixed(3)} clears {money2(saved)} more debt than the
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
          verdict={role === "saver" ? (weeks <= 10 ? "short wait, higher annualised" : null) : undefined}
        />
      </Controls>

      <Readout>
        At {price.toFixed(3)} over {weeks} weeks, the wait is worth{" "}
        <strong>{annual.toFixed(2)}%</strong> annualised.
      </Readout>

      {both ? (
        <Reveal
          title="A discount is an offer, and two different people keep taking it."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            Both of them buy alUSD when it is cheap, which is buying pressure that pushes
            the price back towards face value. The Transmuter is what makes their buying
            rational: it guarantees the 1:1 exchange at the end of a known wait, so the discount has a floor under it.
          </Body>
          <Body>
            That is why alAssets are described as synthetic debt tokens. The peg is held by an exchange mechanism and real collateral, and no minting or burning against a market is involved.
          </Body>
        </Reveal>
      ) : (
        <Hint>Look at both roles to continue.</Hint>
      )}
    </Stage>
  );
}
