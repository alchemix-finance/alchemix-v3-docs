import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { AGGRESSIVE_CAP, LIQ_LTV, survivableLtv } from "../lib/protocol";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, GuessSlider, Hint, Note, Notes,
  Panel, PositionCard, Primary, Question, Reveal, SHOTS, Stage, Sub, assetAmount, money,
  said,
} from "../kit";

/**
 * Lesson 5: the one real risk.
 *
 * The carried position, shown in ETH so the price has something to move: 10 ETH
 * deposited, 5 alETH borrowed. Both prices are stated outright, 2,500 before and
 * 1,500 after, so the 40% in the headline is arithmetic the learner can check
 * rather than do. The guess is where the LTV lands, and it lands unchanged,
 * because the debt and the deposit are the same kind of asset. Then three
 * controls on the same card: the price moves only the dollar figures in the
 * note, a loss inside the vault slides the liquidation marker toward the fill,
 * and the starting LTV sets how much room there is before the two meet.
 */

const DEPOSIT = 10;
const BORROWED = 5;
const PRICE = 2_500;
const CRASH = 0.4;

/**
 * Where the slider starts: the answer an ordinary lending platform would give,
 * with the debt fixed in dollars while the collateral falls. Every other lab
 * starts its guess on the intuitive wrong answer, and this one used to start on
 * the right one, which printed 50% on screen before the learner guessed.
 */
const NAIVE_LTV = Math.round((BORROWED / (DEPOSIT * (1 - CRASH))) * 100);

/** The line under the card: what the two sides are worth at a given ETH price. */
function worthNote(price, borrowed) {
  return `At ${money(price)} per ETH, the deposit is worth ${money(DEPOSIT * price)} and the debt is worth ${money(borrowed * price)}.`;
}

export default function SafetyLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Lesson 5 complete."
      passBody="A price move cannot liquidate an Alchemix position. A real loss inside the vault is the one thing that can, and the lower your LTV, the more room you have before it reaches you."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(NAIVE_LTV);
  const [revealed, setRevealed] = useState(false);

  // The card itself never changes here. Only the note under it moves, from the
  // evening price to the morning one.
  const price = revealed ? PRICE * (1 - CRASH) : PRICE;

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="The price of ETH falls 40% overnight.">
      <Sub>
        USDC does not move in price, so this position is in ETH: {DEPOSIT} ETH deposited
        with {BORROWED} alETH borrowed against it, the same 50% LTV as before. ETH was{" "}
        {money(PRICE)} last night and {money(PRICE * (1 - CRASH))} this morning. Cross the{" "}
        <strong>liquidation</strong> marker and the protocol sells part of your deposit to
        cover the debt.
      </Sub>

      <PositionCard
        deposited={DEPOSIT}
        borrowed={BORROWED}
        asset="ETH"
        backingLoss={0}
        earning
        highlight="ltv"
        note={worthNote(price, BORROWED)}
      />

      <Panel>
        <Question>Where is the LTV in the morning?</Question>
        <GuessSlider
          label="LTV after the fall"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#d4952a"
          min={0}
          max={100}
          step={1}
          format={(v) => `${v}%`}
          scale={["0%", "Past liquidation"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Your deposit is ETH and your debt is recorded in alETH.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title="50%. Both sides fell together."
          onNext={onDone}
          nextLabel="Find what does move it"
        >
          <Body>
            {said(guess, 50, (v) => `${v}%`)}
            Your debt is recorded in alETH, the same kind of asset as your deposit. When ETH
            falls, both sides fall by the same share, so the ratio between them holds and your
            position sits exactly where it did last night. USDC and alUSD pair up the same way.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [ltv, setLtv] = useState(50);
  const [move, setMove] = useState(0);
  const [loss, setLoss] = useState(0);
  const [touched, setTouched] = useState({ price: false, loss: false });
  const mark = (k) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const borrowed = (DEPOSIT * ltv) / 100;
  const price = PRICE * (1 + move / 100);
  const ltvNow = ltv / 100;
  // The card slides the liquidation marker to liqLtv x (1 - loss). The marker
  // has reached the fill once that lands at or under the starting LTV.
  const crossed = LIQ_LTV * (1 - loss / 100) <= ltvNow;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Push the price, then push the vault.">
      <Sub>
        The bar measures your position against the 90% borrowing cap and the 95%
        liquidation marker.
      </Sub>

      <PositionCard
        deposited={DEPOSIT}
        borrowed={borrowed}
        asset="ETH"
        backingLoss={loss / 100}
        earning
        showHealth
        highlight="ltv"
        note={crossed ? "Past the marker. The protocol sells only enough to bring you back to a safe ratio." : worthNote(price, borrowed)}
      />

      <Controls>
        <Control
          label="Starting LTV"
          display={`${ltv}%, ${assetAmount(borrowed, "ETH")} alETH`}
          min={10} max={90} step={5}
          value={ltv}
          onChange={setLtv}
        />
        <Control
          label="Price of ETH"
          display={`${move > 0 ? "+" : ""}${move}%`}
          min={-60} max={60} step={1}
          value={move}
          onChange={(v) => { setMove(v); mark("price"); }}
          verdict={touched.price ? "the bar does not move" : null}
        />
        <Control
          label="Loss inside the vault"
          display={`${loss}%`}
          min={0} max={40} step={1}
          value={loss}
          onChange={(v) => { setLoss(v); mark("loss"); }}
          accent
          verdict={crossed ? "the marker has reached you" : null}
        />
      </Controls>

      <Notes>
        <Note label="A loss inside the vault">
          A strategy can be exploited, or it can simply lose money. Either way the same debt
          stands against less deposit.
        </Note>
        <Note label="Past the marker">
          The protocol sells only enough to bring the position back to a safe ratio. The rest
          stays yours and keeps earning.
        </Note>
      </Notes>

      {touched.price && touched.loss ? (
        <Reveal title="Only one thing moves the marker." onNext={onDone} nextLabel="Take the check">
          <Body>
            A price move changes both sides at once. A loss inside the strategies changes
            only the deposit, so the marker slides toward your position. The lower your LTV,
            the more loss you can absorb before it arrives. Reaching the 90% cap only stops
            you borrowing more.
          </Body>
          <Body>
            The DAO caps the riskiest class of strategy at{" "}
            {Math.round(AGGRESSIVE_CAP * 100)}% of the vault, which bounds how large that
            loss can get. Suppose the whole slice went to zero: liquidation begins at 95% of
            whatever backing is left, so a position opened at or below{" "}
            {Math.round(survivableLtv(AGGRESSIVE_CAP) * 100)}% survives it. Open lower and you have more room than that. The intermediate track derives the number for any
            loss you want to size against.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move the price, then the loss inside the vault, to continue.</Hint>
      )}

      <AppShot shot={SHOTS.positionBar}>
        The same bar in the app. Deposit, debt and the earmarked slice share one track, and
        MAX LTV and LIQ LTV are the two markers the card above draws.
      </AppShot>
    </Stage>
  );
}
