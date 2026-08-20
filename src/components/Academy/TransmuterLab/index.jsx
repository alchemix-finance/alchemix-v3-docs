import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import parts from "../parts.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, Body, ChoiceCheckpoint, Control, Controls, GuessSlider, Hint, Note,
  Notes, Panel, Primary, Question, Reveal, Stage, Sub, money, money2,
} from "../kit";

/**
 * Lesson 7: the Transmuter.
 *
 * The third product function, and the last thing a beginner needs before they
 * can read the rest of the docs without tripping. It also closes the loop on
 * lesson 3: alUSD arrived when you borrowed, and this is where it goes back.
 *
 * The peg, the discount arbitrage and the annualised return on buying below par
 * all live in the advanced track. What is here is the guarantee and its two
 * conditions: the term is set by governance and varies, and leaving early costs
 * a fee.
 *
 * No term length is stated as fact anywhere in this lesson. It is governance-set
 * per asset and per chain, so the lesson makes it a control the learner sets and
 * points at the app for the live figure.
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
      headline="The last question in the track."
      passTitle="Track complete."
      passBody="You have covered everything a first-time user needs: what Alchemix does, what your deposit becomes, how borrowing works, why the balance falls, how to get your money out, what can actually go wrong, and how alAssets turn back into the real thing."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(HOLDING * PRICE);
  const [revealed, setRevealed] = useState(false);

  const close = Math.abs(guess - HOLDING) <= 100;

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Turning alUSD back into USDC.">
      <Sub>
        You hold {money(HOLDING)} alUSD, either because you borrowed it or because you
        bought it. Today the market will pay {PRICE.toFixed(2)} USDC for each one, so
        selling the lot gets you {money(HOLDING * PRICE)}.
      </Sub>

      <Notes>
        <Note label="The other route">
          Hand your alUSD to the Transmuter instead. It exchanges alAssets for the real
          asset at an exact 1:1 rate: one alUSD for one USDC, one alETH for one ETH. The
          catch is that you wait a set period first.
        </Note>
      </Notes>

      <div className={parts.flow4}>
        <Step n="1" label="Deposit" value="alUSD goes in" note="You hand your alAssets to the Transmuter" />
        <FlowArrow />
        <Step n="2" label="Queue" value="The term runs" note="Your deposit waits out the governance-set term" />
        <FlowArrow />
        <Step n="3" label="Earmark" value="Collateral is reserved" note="Borrower collateral equal to your claim is set aside to guarantee it" />
        <FlowArrow />
        <Step n="4" label="Maturity" value="One for one" note="You receive full value, whatever the market price is" tone="#5ba88a" />
      </div>

      <Panel>
        <Question>
          You put all {money(HOLDING)} alUSD into the Transmuter and wait the full term. How
          much USDC comes back?
        </Question>
        <GuessSlider
          label="USDC received"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#8ea9d8"
          min={HOLDING * 0.9}
          max={HOLDING * 1.1}
          step={25}
          format={(v) => money(v)}
          scale={["Less than you put in", "More than you put in"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="The market price does not come into this one.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`Exactly ${money(HOLDING)}. One for one, every time.`}
          onNext={onDone}
          nextLabel="Compare the two routes"
        >
          <Body>
            {close ? "You had it. " : `You said ${money(guess)}. `}
            The Transmuter does not care what alUSD is trading at. It exchanges at 1:1 with
            no slippage, and waiting the full term costs you nothing.
          </Body>
          <Body>
            That guarantee is what holds the price of alUSD near 1.00 in the first place. If
            it drifts too far below, buying it and redeeming here becomes worth doing, and
            that buying pushes the price back up.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [price, setPrice] = useState(0.97);
  const [weeks, setWeeks] = useState(12);
  const [moved, setMoved] = useState({ price: false, weeks: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const sellNow = HOLDING * price;
  const wait = HOLDING;
  const gain = wait - sellNow;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Sell now, or wait and get the full amount.">
      <Sub>
        You are holding {money(HOLDING)} alUSD. Set what the market is paying, and how long
        the current term is. The term is set by governance and changes, so check the live
        figure in the app before you commit to anything.
      </Sub>

      <div className={own.routes}>
        <div className={own.route}>
          <div className={styles.microLabel}>Sell on the market</div>
          <div className={own.routeValue}>{money(sellNow)}</div>
          <div className={own.routeFoot}>USDC, today</div>
        </div>
        <div className={`${own.route} ${own.routeWait}`}>
          <div className={styles.microLabel}>Wait for the Transmuter</div>
          <div className={own.routeValue} style={{ color: "#8ea9d8" }}>{money(wait)}</div>
          <div className={own.routeFoot}>
            USDC, in {weeks} {weeks === 1 ? "week" : "weeks"}
          </div>
        </div>
      </div>

      <div className={styles.readout}>
        Waiting is worth <strong>{money(gain)}</strong> more than selling today, at a price
        of {money2(price)}. Whether that is worth the wait is your call, and the answer
        changes with both controls.
      </div>

      <Controls>
        <Control
          label="Market price of alUSD"
          display={money2(price)}
          min={0.9} max={1} step={0.005}
          value={price}
          onChange={(v) => { setPrice(v); mark("price"); }}
        />
        <Control
          label="Current term"
          display={`${weeks} weeks`}
          min={2} max={26} step={1}
          value={weeks}
          onChange={(v) => { setWeeks(v); mark("weeks"); }}
          accent
        />
      </Controls>

      <Notes>
        <Note label="Leaving early">
          You are not locked in. You can exit a Transmuter deposit before it matures, but an
          early-withdrawal fee applies and you give up part of the outcome.
        </Note>
        <Note label="Why it fills over time">
          Your claim is met from the collateral of people who borrowed. That is the same
          flow that pays their loans down, which is why the two sides of Alchemix are really
          one system.
        </Note>
        <Note label="Capacity">
          Each chain's Transmuter has a maximum it can hold. If one is full you may need to
          use another chain, so check capacity before buying alAssets to redeem.
        </Note>
      </Notes>

      {moved.price && moved.weeks ? (
        <Reveal
          title="The gap between the two numbers is the whole opportunity."
          onNext={onDone}
          nextLabel="Take the last check"
        >
          <Body>
            Move the price up and the gap closes. That is the mechanism working: the further
            alUSD drifts below 1.00, the more people want to buy it and redeem it here, and
            that buying pushes it back towards 1.00.
          </Body>
          <Body>
            Turning that gap into a rate you can compare against anything else is the
            advanced track's job. For now you have the guarantee, and you know what the two
            conditions on it are.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls to carry on.</Hint>
      )}
    </Stage>
  );
}

function Step({ n, label, value, note, tone }) {
  return (
    <div className={parts.step}>
      <div className={parts.stepNum}>{n}</div>
      <div className={parts.stepLabel}>{label}</div>
      <div className={parts.stepValue} style={tone ? { color: tone } : undefined}>{value}</div>
      <div className={parts.stepNote}>{note}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <svg className={parts.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,192,154,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
