import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, GuessSlider, Hint,
  Note, Notes, Panel, PositionCard, Primary, Question, Readout, Reveal, SHOTS, Stage, Sub,
  money, said,
} from "../kit";

/**
 * Lesson 2: your deposit.
 *
 * The 10,000 USDC deposit the rest of the track carries. Learn shows where it
 * goes and asks how much can come back out the next day. Try applies a rate
 * once, then withdraws some or all of it, and nothing on the card holds the
 * withdrawal back. Check asks what the vault did with it.
 *
 * The deposit is made on the Borrow page, not on Mixed Yield. Both pages hold
 * the same MYT, but this track carries one position through to a loan, and the
 * Borrow page's Deposit/Borrow tab does the deposit and the borrow in a single
 * transaction. Mixed Yield is the same vault for someone who does not want a
 * loan, which is worth naming here and not worth sending a borrower to.
 */

const DEPOSIT = 10_000;

export default function DepositLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Lesson 2 complete."
      passBody="Your deposit becomes MYT and earns in strategies the Alchemix DAO selects. You can take it back any day you like."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const STEPS = [
  { n: 1, label: "You deposit", value: `${money(DEPOSIT)} USDC`, note: "Your wallet sends the USDC to the vault." },
  { n: 2, label: "You receive", value: "MYT", note: "Each Mix-Yield Token, or MYT, is a share of that vault.", tone: "#5ba88a" },
  { n: 3, label: "The DAO", value: "Runs the strategies", note: "It picks where the vault earns and rebalances as markets move.", tone: "#5ba88a" },
];

function Learn({ onDone }) {
  const [guess, setGuess] = useState(5_000);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Your USDC goes into a vault and starts earning.">
      <Sub>
        On the Borrow page you open a vault, the pool that holds deposits like yours, and
        put {money(DEPOSIT)} USDC into it. The Dashboard lists the position afterwards.
      </Sub>

      <FlowSteps steps={STEPS} />

      <PositionCard
        deposited={DEPOSIT}
        borrowed={0}
        asset="USDC"
        earning="Earning"
        highlight="deposited"
        marks="none"
        showLtv={false}
        note={revealed ? `Free to withdraw: ${money(DEPOSIT)} USDC` : "Deposited and earning."}
        compact
      />

      <AppShot shot={SHOTS.vaultCard}>
        A vault on the Borrow page. The bar under its name is the deposit cap and how full
        it is, and the figure above the bar is what it is earning right now.
      </AppShot>

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
        <Reveal title={`All ${money(DEPOSIT)} of it is returned.`} onNext={onDone} nextLabel="Let it earn">
          <Body>
            {said(guess, DEPOSIT, money)}
            Withdraw on any day, in any amount, and the full balance is returned to you
            along with anything it earned. Borrowing against the deposit is optional.
          </Body>
          <Body>
            Each vault carries a <strong>deposit cap</strong>, drawn on its card as a bar with
            how full it is, and a vault sitting at its cap takes nothing further until the DAO
            raises it. The Mixed Yield page, under Earn, holds the same vaults for anyone who
            wants the yield without a loan.
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
    <Stage eyebrow="Stage 2 · Try" headline="Earn for a year, then take it out.">
      <Sub>
        The first control is what the vault earns over the year, and the second is how
        much of the deposit you take out at the end of it. Real rates move with what the
        strategies earn.
      </Sub>

      <PositionCard
        deposited={remaining}
        borrowed={0}
        asset="USDC"
        earning={remaining > 0 ? "Earning" : "Nothing deposited"}
        highlight="deposited"
        marks="none"
        showLtv={false}
        note={full ? "Withdrawn in full, settled immediately." : `After one year at ${rate}%`}
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

      <AppShot shot={SHOTS.withdrawTab}>
        The Withdraw tab, which is the second control above. Available is what the position
        will release today, and MAX fills the field with all of it.
      </AppShot>

      <Notes>
        <Note label="How it reaches you">
          Each MYT becomes worth more USDC as the strategies earn. Your yield shows up in
          the value of what you already hold.
        </Note>
        <Note label="Who runs it">
          The Alchemix DAO chooses the strategies and rebalances them as markets move.
        </Note>
      </Notes>

      {movedRate && reachedFull ? (
        <Reveal
          title={`${money(DEPOSIT)} at ${rate}% is ${money(value)} after a year.`}
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            The withdrawal settled immediately, and the yield came with it.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the rate, then withdraw all of it to continue.</Hint>
      )}
    </Stage>
  );
}
