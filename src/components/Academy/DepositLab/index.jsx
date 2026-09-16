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
      targetFoot="what the deposit grows to"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 2 complete."
      passBody="You know what a deposit becomes, who runs it, and that you can take it back at any time."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const STEPS = [
  { n: 1, label: "You deposit", value: `${money(DEPOSIT)} USDC`, note: "Into the vault, from your wallet" },
  { n: 2, label: "You receive", value: "MYT", note: "The Mix-Yield Token, a share of the vault", tone: "#5ba88a" },
  { n: 3, label: "The DAO", value: "runs the strategies", note: "It chooses where the vault earns and rebalances over time", tone: "#5ba88a" },
];

function Learn({ onDone }) {
  const [guess, setGuess] = useState(5_000);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Where the deposit goes.">
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
        note={revealed ? `Free to withdraw: ${money(DEPOSIT)} USDC` : "No loan against it"}
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
        <Reveal title={`All ${money(DEPOSIT)}.`} onNext={onDone} nextLabel="Watch it earn">
          <Body>
            There is no lock-up and no notice period. Withdraw at any time and the USDC comes
            back with whatever it earned. Depositing and borrowing are separate decisions, and
            a deposit on its own ties nothing up.
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
        the DAO's strategies, so this rate is an example. Then withdraw some or all of it.
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
        Worth <strong>{money(value)}</strong> after a year. Withdrawn:{" "}
        <strong>{money(withdrawn)}</strong>. Still in the vault and earning:{" "}
        <strong>{money(remaining)}</strong>.
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
          verdict={full ? "the whole deposit left at once" : null}
        />
      </Controls>

      <Notes>
        <Note label="How it reaches you">
          Each MYT becomes worth more USDC as the strategies earn. There is nothing to claim.
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
            That is the deposit plus the rate applied to it once. Nothing in the position held
            the withdrawal back at any point, and the USDC returned includes what was earned to
            that day.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the rate, then withdraw all of it to continue.</Hint>
      )}
    </Stage>
  );
}
