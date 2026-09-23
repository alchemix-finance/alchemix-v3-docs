import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { MAX_LTV } from "../lib/protocol";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, Gate, GuessSlider, Note, Notes,
  Panel,
  PositionCard, Primary, Question, Reveal, NARROW, SHOTS, Stage, Sub, money, said,
} from "../kit";

/**
 * Lesson 3: borrowing against the deposit.
 *
 * The carried position, 10,000 USDC deposited, takes its loan here. The learner
 * guesses what the Borrow tab's Max button fills in and watches the card fill
 * to the 90% cap. Try then puts the health factor to work: borrow until it
 * reads 2.00. It used to ask the learner to push the loan to the cap, which the
 * Learn reveal had just shown them, so the stage repeated itself and the health
 * factor only ever appeared in a note.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const CAP = DEPOSIT * MAX_LTV;

/** The health factor Try asks for, and the loan that gives it: 90% / 45% = 2.00. */
const TARGET_HEALTH = 2;
const TARGET_BORROW = (DEPOSIT * MAX_LTV) / TARGET_HEALTH;

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

      <AppShot shot={SHOTS.depositBorrow}>
        The vault's Deposit/Borrow tab, with the Borrow tab beside it for a deposit already
        made. The lower field is the alUSD you are borrowing, and MAX beside it fills in the
        most your deposit allows.
      </AppShot>
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [borrow, setBorrow] = useState(BORROW);
  const [found, setFound] = useState(false);

  const atCap = borrow >= CAP - 1e-9;
  const health = borrow > 0 ? (MAX_LTV * DEPOSIT) / borrow : Infinity;
  const onTarget = Math.abs(borrow - TARGET_BORROW) < 1e-9;

  function onChange(raw) {
    const next = Math.min(raw, CAP);
    setBorrow(next);
    if (Math.abs(next - TARGET_BORROW) < 1e-9) setFound(true);
  }

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Borrow until the health factor reads 2.00.">
      <Sub>
        The health factor is the 90% borrowing cap divided by your LTV. It reads 1.80 at 5,000
        borrowed and 1.00 at the cap. Move the amount the way you would type it into the Borrow
        tab.
      </Sub>

      <PositionCard
        deposited={DEPOSIT}
        borrowed={borrow}
        asset="USDC"
        earning
        showHealth
        marks="cap"
        highlight="borrowed"
        note={atCap ? "Borrowing stops here. The position keeps earning." : `In your wallet: ${money(borrow)} alUSD`}
      />

      <Controls>
        <Control
          label="Borrow"
          display={`${money(borrow)} alUSD`}
          min={0} max={DEPOSIT} step={250}
          value={borrow}
          onChange={onChange}
          accent
          verdict={
            atCap ? "Borrowing stops at 9,000"
            : onTarget ? "health factor 2.00"
            : borrow > 0 ? `health factor ${health.toFixed(2)}`
            : null
          }
        />
      </Controls>

      <Notes>
        <Note label="What arrives">
          alUSD, minted to your wallet. On the open market it trades a little under 1.00.
        </Note>
      </Notes>

      {found ? (
        <Reveal
          title={`${money(TARGET_BORROW)} borrowed is a 45% LTV, and 90% divided by 45% is 2.00.`}
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            Borrow more and the health factor falls toward 1.00, where borrowing stops. It
            measures how far you sit under the borrowing cap. Liquidation sits further out, at
            95%, and lesson 5 covers what can carry a position there.
          </Body>
          <Body>
            The next lesson picks the position up at 5,000 borrowed, a health factor of 1.80.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the check" hint="Set the loan so the health factor reads 2.00 to continue." />
      )}

      <AppShot shot={SHOTS.statsTop} narrow={NARROW.debtHealth}>
        A vault's first row of stats. Health Factor, at the right, is the borrowing cap over
        your LTV: 2.00 at 45%, 1.00 at the cap, and the infinity sign with nothing borrowed,
        as this vault shows.
      </AppShot>
    </Stage>
  );
}
