import React, { useEffect, useRef, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { MAX_LTV } from "../lib/protocol";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, GuessSlider, Hint, Note, Notes,
  Panel,
  PositionCard, Primary, Question, Reveal, NARROW, SHOTS, Stage, Sub, money, said,
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
    <ChoiceCheckpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
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
        marks="cap"
        highlight="borrowed"
        note={revealed ? "In your wallet: 9,000 alUSD" : "Borrow tab open"}
      />

      <AppShot shot={SHOTS.depositBorrow}>
        The vault's Deposit/Borrow tab, with the Borrow tab beside it for a deposit already
        made. The lower field is the alUSD you are borrowing, and MAX beside it fills in the
        most your deposit allows.
      </AppShot>

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
            {said(guess, CAP, money)}
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
        showHealth
        marks="cap"
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

      <AppShot shot={SHOTS.statsBottom} narrow={NARROW.borrowableLtv}>
        A vault's second row of stats, with nothing borrowed yet. LTV, at the right, is
        written against the cap, 0.00 out of 90.00%, and the 90.00% is the same on every
        vault in the protocol. Borrowable beside it is what the cap still allows.
      </AppShot>

      <Notes>
        <Note label="What arrives">
          alUSD, minted to your wallet. On the open market it trades a little under 1.00.
        </Note>
        <Note label="Health factor">
          The borrowing cap divided by your LTV. It reads 1.80 at 5,000 borrowed and 1.00 at
          the cap, and the app prints it beside your LTV.
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
            borrowing more, and the deposit keeps earning. The health factor on the card is
            the same distance written as a multiple: 3.00 at 30% LTV, 1.00 at the cap.
          </Body>
        </Reveal>
      ) : (
        <Hint>Push the amount up to the cap to continue.</Hint>
      )}
    </Stage>
  );
}
