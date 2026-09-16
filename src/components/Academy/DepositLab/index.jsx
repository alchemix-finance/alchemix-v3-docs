import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import {
  Actions, Body, Checkpoint, Control, Controls, FlowSteps, GuessSlider, Hint, Note,
  Notes, Panel, PositionCard, Primary, Question, Readout, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 2: your deposit.
 *
 * The 10,000 USDC deposit the rest of the track carries. Learn shows where it
 * goes and asks how much can come back out the next day. Try applies a rate
 * once, then withdraws some or all of it, and nothing on the card holds the
 * withdrawal back. Check asks for the deposit after one year at the engine's
 * rate.
 */

const DEPOSIT = 10_000;

export default function DepositLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Learn onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Try onDone={() => onStage("checkpoint")} />;

  return (
    <Checkpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      stageLabel="Check"
      headline="Work out what the deposit is worth."
      unit="amount"
      targetOf={(f) => f.deposit * (1 + f.ratePct / 100)}
      computeOf={(f, v) => v}
      direct
      controlLabel="Worth after a year"
      controlDisplay={money}
      targetFoot="the deposit grows to this in a year"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 2 complete."
      passBody="Your deposit becomes MYT and earns in strategies the Alchemix DAO steers. You can take it back any day you like."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const STEPS = [
  { n: 1, label: "You deposit", value: `${money(DEPOSIT)} USDC`, note: "Your wallet sends the USDC to the vault." },
  { n: 2, label: "You receive", value: "MYT", note: "Each Mix-Yield Token, or MYT, is a share of that vault.", tone: "#5ba88a" },
  { n: 3, label: "The DAO", value: "runs the strategies", note: "It picks where the vault earns and rebalances as conditions change.", tone: "#5ba88a" },
];

function Learn({ onDone }) {
  const [guess, setGuess] = useState(5_000);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Your USDC goes into a vault and starts earning.">
      <Sub>
        On the Mixed Yield page you deposit {money(DEPOSIT)} USDC into a vault, the pool that
        holds deposits like yours. The Dashboard then shows this card under Open Mixed Yield
        Positions.
      </Sub>

      <FlowSteps steps={STEPS} />

      <PositionCard
        deposited={DEPOSIT}
        borrowed={0}
        asset="USDC"
        earning="Earning"
        highlight="deposited"
        note={revealed ? `Free to withdraw: ${money(DEPOSIT)} USDC` : "Nothing is borrowed against it."}
        compact
      />

      <Panel>
        <Question>
          Tomorrow you want it back. How much of the {money(DEPOSIT)} can you take out?
        </Question>
        <GuessSlider
          label="Available tomorrow"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#5ba88a"
          min={0}
          max={DEPOSIT}
          step={250}
          format={money}
          scale={["Nothing", `All ${money(DEPOSIT)}`]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Open the position from the Dashboard and switch to the Withdraw tab.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal title={`All ${money(DEPOSIT)} of it comes back.`} onNext={onDone} nextLabel="Watch it earn">
          <Body>
            Nothing locks the deposit in, and no notice period stands in front of it.
            Withdraw whenever you like and the USDC comes back with everything it earned.
            Borrowing is a separate decision you have not made yet.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [rate, setRate] = useState(5);
  const [share, setShare] = useState(0);
  // Both latch: once the rate has moved and the withdrawal has reached 100%,
  // the reveal stays open whatever the controls are set to afterwards.
  const [movedRate, setMovedRate] = useState(false);
  const [reachedFull, setReachedFull] = useState(false);

  const value = DEPOSIT * (1 + rate / 100);
  const remaining = value * (1 - share / 100);
  const withdrawn = value - remaining;
  const full = share >= 100;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Watch it earn, then take it out.">
      <Sub>
        Pick a rate and see what the deposit is worth after a year. The live rate moves with
        the DAO's strategies, so treat this one as an example. Then withdraw some of it, or
        all of it.
      </Sub>

      <PositionCard
        deposited={remaining}
        borrowed={0}
        asset="USDC"
        earning={remaining > 0 ? "Earning" : "Nothing deposited"}
        highlight="deposited"
        note={full ? "Withdrawn in full. Nothing held it back." : `After one year at ${rate}%`}
      />

      <Readout>
        After a year the deposit is worth <strong>{money(value)}</strong>. You have taken out{" "}
        <strong>{money(withdrawn)}</strong>, and <strong>{money(remaining)}</strong> is still
        in the vault earning.
      </Readout>

      <Controls>
        <Control
          label="Suppose it earns"
          display={`${rate.toFixed(1)}% a year`}
          min={1} max={15} step={0.5}
          value={rate}
          onChange={(v) => { setRate(v); setMovedRate(true); }}
          accent
        />
        <Control
          label="Withdraw"
          display={`${share}% of the deposit`}
          min={0} max={100} step={5}
          value={share}
          onChange={(v) => { setShare(v); if (v >= 100) setReachedFull(true); }}
          verdict={full ? "The whole deposit came out at once" : null}
        />
      </Controls>

      <Notes>
        <Note label="How it reaches you">
          Each MYT becomes worth more USDC as the strategies earn, so you never claim a
          payout.
        </Note>
        <Note label="Who runs it">
          The Alchemix DAO chooses the strategies and rebalances them as conditions change.
        </Note>
      </Notes>

      {movedRate && reachedFull ? (
        <Reveal
          title={`${money(DEPOSIT)} at ${rate}% is ${money(value)} after a year.`}
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            That is the deposit plus one year of that rate. At no point did the position hold
            the withdrawal back, and the USDC that came out carried everything the deposit had
            earned up to that day.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the rate, then withdraw all of it to continue.</Hint>
      )}
    </Stage>
  );
}
