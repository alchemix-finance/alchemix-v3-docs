import React, { useEffect, useRef, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { MAX_LTV } from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Note, Notes,
  Panel, PositionCard, Primary, Question, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 3: borrowing against the deposit.
 *
 * The carried position, 10,000 USDC deposited, takes its loan here. The learner
 * guesses what the Borrow tab's Max button fills in, watches the card fill to
 * the 90% cap, then pushes the Borrow control to the cap and feels it stop.
 * The Try reveal returns the position to 5,000 borrowed, which is where
 * lesson 4 picks it up.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const CAP = DEPOSIT * MAX_LTV;

/* Once the cap has been reached, the position returns to 5,000 after the
   control has rested at the cap for this long. Returning in the same event
   that hit the cap would hide the cap state the stage exists to show, and
   would fight a drag still in progress. Moving below the cap cancels the
   pending return, so a value the learner settles on is kept. */
const RETURN_AFTER_MS = 1_200;

export default function BorrowLab({ lessonId, stage, onStage, done, onComplete }) {
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
      headline="Find the most you can borrow."
      unit="amount"
      targetOf={(f) => f.deposit * MAX_LTV}
      computeOf={(f, v) => v}
      direct
      controlLabel="Most you can borrow"
      controlDisplay={money}
      targetFoot="the cap stops borrowing here"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 3 complete."
      passBody="Borrowing stops at 90% of the deposit. The alUSD or alETH is minted to your wallet, and the deposit stays in the vault earning the whole time."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(BORROW);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="How much can you borrow?">
      <Sub>
        Your 10,000 USDC is in the vault, earning. On the Borrow page, the vault's Borrow tab
        asks for an amount and offers a Max button.
      </Sub>

      <PositionCard
        deposited={DEPOSIT}
        borrowed={revealed ? CAP : 0}
        asset="USDC"
        earning
        highlight="borrowed"
        note={revealed ? "In your wallet: 9,000 alUSD" : "Borrow tab open"}
      />

      <Panel>
        <Question>You press Max. How much alUSD does the app fill in?</Question>
        <GuessSlider
          label="Most you can borrow"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={0}
          max={DEPOSIT}
          step={250}
          format={money}
          scale={["Nothing", "All 10,000"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Whatever you fill in, the 10,000 stays in the vault.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title="The app fills in 9,000, or 90% of the deposit."
          onNext={onDone}
          nextLabel="Push it to the cap"
        >
          <Body>
            Your <strong>loan to value</strong>, or LTV, is what you owe divided by what you
            deposited. Alchemix caps it at 90%.
          </Body>
          <Body>
            Borrowing mints new alUSD directly to your wallet. Inside the protocol one alUSD
            always cancels one USDC of debt.
          </Body>
          <Body>
            Your deposit becomes the <strong>collateral</strong> securing that loan. It stays
            in the vault and keeps earning the whole time.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [borrow, setBorrow] = useState(BORROW);
  const [reached, setReached] = useState(false);
  const [returned, setReturned] = useState(false);
  const [justReturned, setJustReturned] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const atCap = borrow >= CAP - 1e-9;

  function onChange(raw) {
    const next = Math.min(raw, CAP);
    setBorrow(next);
    setJustReturned(false);
    if (returned) return;
    if (next >= CAP - 1e-9) {
      setReached(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setBorrow(BORROW);
        setReturned(true);
        setJustReturned(true);
      }, RETURN_AFTER_MS);
    } else {
      clearTimeout(timer.current);
    }
  }

  const note = atCap
    ? "Borrowing stops here. The position keeps earning."
    : justReturned
      ? "The loan is back at 5,000 alUSD."
      : `In your wallet: ${money(borrow)} alUSD`;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Push the borrow to the cap.">
      <Sub>
        Move the amount the way you would type it into the Borrow tab.
      </Sub>

      <PositionCard
        deposited={DEPOSIT}
        borrowed={borrow}
        asset="USDC"
        earning
        highlight="borrowed"
        note={note}
      />

      <Controls>
        <Control
          label="Borrow"
          display={`${money(borrow)} alUSD`}
          min={0} max={DEPOSIT} step={250}
          value={borrow}
          onChange={onChange}
          accent
          verdict={atCap ? "Borrowing stops at 9,000" : null}
        />
      </Controls>

      <Notes>
        <Note label="What arrives">
          alUSD is minted directly to your wallet. Inside the protocol one of them cancels
          one USDC of debt. On the open market it trades a little under 1.00.
        </Note>
        <Note label="At the cap">
          Borrowing stops. The position stays open and keeps earning.
        </Note>
      </Notes>

      {reached ? (
        <Reveal
          title="The cap is 90% of whatever you deposit."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            On 10,000 that is 9,000. On 4,000 it would be 3,600. Reaching the cap stops you
            borrowing more. The position stays open and the deposit keeps earning.
          </Body>
        </Reveal>
      ) : null}
    </Stage>
  );
}
