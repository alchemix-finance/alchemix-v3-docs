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
      direct
      controlLabel="Annualized return"
      controlDisplay={(v) => `${v.toFixed(2)}%`}
      targetFoot="what the wait is worth, annualized"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 6 complete."
      passBody="You can price a discount against the time you wait for it. The buyers who close the gap run the same calculation."
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
      headline="alUSD is trading at 0.97 and redeems at 1.00."
    >
      <Sub>
        Every alUSD in circulation is backed by at least one USDC of collateral inside
        Alchemix, and the Transmuter will exchange it for the underlying at exactly 1:1
        after a governance-set term. This lesson uses a term of {WEEKS} weeks.
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
          title={`${annual.toFixed(2)}% annualized, from a ${perTerm.toFixed(2)}% gain over the term.`}
          onNext={onDone}
          nextLabel="See who buys the discount"
        >
          <Body>
            {close ? "That is close. " : `You answered ${guess.toFixed(1)}%. `}
            Buying at {PRICE.toFixed(2)} and receiving 1.00 is a gain of{" "}
            {perTerm.toFixed(2)}% on what you put in. That gain arrives in {WEEKS} weeks,
            which is {annual.toFixed(2)}% annualized.
          </Body>
          <Body>
            The shorter the term, the more the same discount is worth. That relationship
            makes a persistent discount hard to sustain.
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
      headline="Two buyers take the discount for different reasons."
    >
      <Sub>
        Both buy alUSD below face value. One buys a return. The other buys back their
        own debt. Their buying closes the gap.
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
            <div className={styles.microLabel}>Annualized return on the wait</div>
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
          verdict={role === "saver" ? (weeks <= 10 ? "short wait, higher annualized return" : null) : undefined}
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
            Both buy alUSD when it is cheap. That demand pushes the price back toward face
            value. The Transmuter guarantees the 1:1 exchange at the end of a known wait,
            which puts a floor under the discount.
          </Body>
          <Body>
            alAssets are synthetic debt tokens. The peg is held by the exchange mechanism
            and the collateral behind every unit. The protocol does not mint or burn
            against a market price to hold it.
          </Body>
        </Reveal>
      ) : (
        <Hint>Look at both roles to continue.</Hint>
      )}
    </Stage>
  );
}
