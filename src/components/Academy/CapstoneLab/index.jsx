import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  LIQ_LTV, MAX_LTV, borrowNeededFor, ltvAfterLoss, minimumCollateral, survivableLtv,
  survivesLoss,
} from "../lib/protocol";
import { priceText, useAlUsdPrice } from "../lib/useAlUsdPrice";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, FlowSteps, Gate, GuessSlider, Panel, Primary,
  Question, Readout, Reveal, SHOTS, Stage, Sub, money, money2, said,
} from "../kit";

/**
 * Intermediate lesson 7: sizing a position.
 *
 * No new mechanism. Two earlier answers now have to be used together, because in
 * practice they constrain each other: the discount decides how much you must
 * borrow, and the loss you size against decides how much collateral that borrow
 * needs behind it.
 *
 * A learner who only sizes the borrow against the discount gets liquidated. One
 * who only picks a safe LTV comes up short of the capital. Neither half is
 * sufficient on its own.
 *
 * The scenario is the one every borrower faces before the first deposit: how
 * much to put in. It used to be worded as a loss the vault was "about to
 * report", which nobody can know in advance, and the first reviewer could not
 * see when it would ever come up. The loss is now the learner's own choice of
 * how much they are willing to sit through, which is what the LTV lesson
 * before it taught them to pick.
 */

const WANT = 10_000;
const LOSS = 0.12;

const pct = (n) => `${(n * 100).toFixed(1)}%`;

export default function CapstoneLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  const { price, live } = useAlUsdPrice();

  if (stage === "predict") return <Predict price={price} live={live} onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Explore market={price} onDone={() => onStage("checkpoint")} />;

  return (
    <Checkpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      passTitle="Track complete."
      passBody="The market sets how much you must borrow, the vault sets how much collateral that needs, and the deposit follows from both."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ price, live, onDone }) {
  const [guess, setGuess] = useState(12_000);
  const [revealed, setRevealed] = useState(false);

  const borrow = borrowNeededFor(WANT, price);
  const ceiling = survivableLtv(LOSS);
  /**
   * The deposit someone lands on who sizes against the cap and forgets the loss.
   *
   * This used to be the borrow itself, which put the counter-example at 100% LTV:
   * a position the cap forbids and nobody could open. Sizing to the cap is the
   * mistake people actually make, it is legal, and it still fails.
   */
  const naive = borrow / MAX_LTV;
  const truth = minimumCollateral(WANT, price, LOSS);
  const naiveLtv = borrow / naive;

  // The working, as three stops, shown once the learner has committed.
  const working = [
    { n: 1, label: "You must borrow", value: `${money2(borrow)} alUSD`, note: `${money(WANT)} divided by ${priceText(price, live)}, the price it sells at.`, tone: "#f5c09a" },
    { n: 2, label: "Highest LTV that survives", value: pct(ceiling), note: `${pct(LIQ_LTV)} of the ${pct(1 - LOSS)} of backing left after the loss.`, tone: "#d4645a" },
    { n: 3, label: "So you deposit", value: `${money2(truth)} USDC`, note: `${money2(borrow)} divided by ${pct(ceiling)}.`, tone: "#5ba88a" },
  ];

  return (
    <Stage eyebrow="Stage 1 · Predict" headline="How much do you deposit?">
      <Sub>
        You are about to open a position, and the one number you choose is the size of the
        deposit. You need {money(WANT)} of spendable capital, and alUSD is trading at{" "}
        {priceText(price, live)}{live ? " today" : ""}, so the alUSD you borrow sells for
        less than face value. You have also decided the position must survive a{" "}
        {pct(LOSS)} loss of backing inside the vault, the most you are willing to sit
        through.
      </Sub>

      <div className={own.brief}>
        <BriefRow label="Capital required" value={`${money(WANT)} USDC`} note="what you need in hand after selling" />
        <BriefRow label="alUSD price" value={priceText(price, live)} note="what the market will pay you" tone="#f5c09a" />
        <BriefRow label="Loss to survive" value={pct(LOSS)} note="the most you are willing to sit through" tone="#d4645a" />
      </div>

      <Panel>
        <Question>What is the smallest deposit that raises the capital and survives that loss?</Question>
        <GuessSlider
          label="Deposit"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={8_000}
          max={20_000}
          step={100}
          format={(v) => money(v)}
          scale={["8,000", "20,000"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="A deposit that only does one of the two fails.">
          <Primary onClick={() => setRevealed(true)}>Commit and stress it</Primary>
        </Actions>
      ) : (
        <>
          <FlowSteps steps={working} />
          <Reveal
            title={`The smallest deposit is ${money2(truth)}.`}
            onNext={onDone}
            nextLabel="Work both checks at once"
          >
            <Body>
              {said(guess, truth, money, 100)}
              Two steps. Raising {money(WANT)} at {priceText(price, live)} means borrowing{" "}
              {money2(borrow)}, because each alUSD sells for {priceText(price, live)}. Then
              the deposit has to be large enough that {money2(borrow)} of debt survives the
              loss: liquidation starts at {pct(LIQ_LTV)} LTV, a {pct(LOSS)} loss leaves{" "}
              {pct(1 - LOSS)} of the backing, so the debt can be at most {pct(ceiling)} of
              the deposit to begin with. {money2(borrow)} divided by {pct(ceiling)} is{" "}
              {money2(truth)}.
            </Body>
            <Body>
              Size against the cap alone and you get liquidated: the cap lets you borrow{" "}
              {money2(borrow)} against {money2(naive)}, at {pct(naiveLtv)} LTV, and the{" "}
              {pct(LOSS)} loss moves that to {pct(ltvAfterLoss(naiveLtv, LOSS))}, past the
              threshold. Forget the discount instead and you borrow only {money(WANT)}, which
              sells for {money(WANT * price)}, short of the {money(WANT)} you need.
            </Body>
          </Reveal>
        </>
      )}

      <AppShot shot={SHOTS.visualizer}>
        The Visualizer tab on any vault. Its four inputs run along the top, and three of
        them are what this track has taught: the yield, the redemption rate, and the alUSD
        price. External APY is what you earn on the cash you raise, which is yours to
        decide. Under the chart it reports the loan cost, the yield, and the projected
        profit. This capture has no loan open, so its loan cost reads zero.
      </AppShot>
    </Stage>
  );
}

function BriefRow({ label, value, note, tone }) {
  return (
    <div className={own.briefRow}>
      <div className={styles.statLabel}>{label}</div>
      <div className={own.briefValue} style={tone ? { color: tone } : undefined}>{value}</div>
      <div className={own.briefNote}>{note}</div>
    </div>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ market, onDone }) {
  const [deposit, setDeposit] = useState(11_000);
  const [price, setPrice] = useState(market);
  const [loss, setLoss] = useState(0.12);
  const [solved, setSolved] = useState(false);

  const borrow = borrowNeededFor(WANT, price);
  const ltv = borrow / deposit;
  const raisesEnough = deposit > 0 && borrow <= deposit * MAX_LTV;
  const survives = survivesLoss(ltv, loss);
  const floor = minimumCollateral(WANT, price, loss);
  const works = raisesEnough && survives;
  const tight = works && deposit - floor < 150;

  React.useEffect(() => {
    if (works) setSolved(true);
  }, [works]);

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="Find the smallest deposit that passes both checks."
    >
      <Sub>
        You still need {money(WANT)} of capital. Raise the deposit until both checks pass,
        then bring it back down to the smallest number that still holds.
      </Sub>

      <div className={own.checks}>
        <CheckRow
          ok={raisesEnough}
          title={`Raises ${money(WANT)}`}
          detail={
            raisesEnough
              ? `Borrowing ${money2(borrow)} at ${price.toFixed(3)} puts ${money(WANT)} in hand.`
              : `Borrowing ${money2(borrow)} would need ${money2(borrow / MAX_LTV)} of collateral to stay under the cap.`
          }
        />
        <CheckRow
          ok={survives}
          title={`Survives a ${pct(loss)} loss`}
          detail={
            survives
              ? `Starting at ${pct(ltv)}, a ${pct(loss)} loss moves it to ${pct(ltvAfterLoss(ltv, loss))}.`
              : `Starting at ${pct(ltv)}, a ${pct(loss)} loss moves it to ${pct(ltvAfterLoss(ltv, loss))}, which is past the ${pct(LIQ_LTV)} threshold.`
          }
        />
      </div>

      <Controls>
        <Control
          label="Deposit"
          display={money(deposit)}
          min={8_000} max={25_000} step={50}
          value={deposit}
          onChange={setDeposit}
          accent
          verdict={works ? (tight ? "this is the smallest that works" : "it works, but it ties up more than you need") : "this one does not work yet"}
          tone={works ? undefined : "#d4645a"}
        />
        <Control
          label="alUSD price"
          display={price.toFixed(3)}
          min={0.9} max={0.999} step={0.001}
          value={price}
          onChange={setPrice}
        />
        <Control
          label="Loss to survive"
          display={pct(loss)}
          min={0.05} max={0.3} step={0.005}
          value={loss}
          onChange={setLoss}
        />
      </Controls>

      <Readout>
        The smallest deposit that satisfies both conditions here is{" "}
        <strong>{money2(floor)}</strong>.
      </Readout>

      {solved ? (
        <Reveal
          title="The deposit is what you have to borrow divided by the LTV you can afford."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            How much you must borrow is set by the price you can sell at. How much collateral
            that borrow needs behind it is set by the loss you want to survive, and the market
            price has no bearing on it. Divide the borrow by that LTV and you have the deposit.
          </Body>
          <Body>
            Push the price down and both checks respond. A worse discount means borrowing
            more to raise the same capital. The larger borrow lifts your LTV, so that same
            loss now needs more collateral behind it. You have to solve for both at
            once.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the checkpoint" hint="Raise the deposit until both checks turn green." />
      )}
    </Stage>
  );
}

function CheckRow({ ok, title, detail }) {
  return (
    <div className={`${own.check} ${ok ? own.checkOk : own.checkBad}`}>
      <span className={own.checkIcon} aria-hidden="true">
        {ok ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5ba88a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 L9.5 18 L20 6.5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4645a" strokeWidth="3" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        )}
      </span>
      <span className={own.checkBody}>
        <span className={own.checkTitle}>{title}</span>
        <span className={own.checkDetail}>{detail}</span>
      </span>
    </div>
  );
}
