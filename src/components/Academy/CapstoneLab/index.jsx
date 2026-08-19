import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  LIQ_LTV, borrowNeededFor, ltvAfterLoss, minimumCollateral, survivableLtv, survivesLoss,
} from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel,
  Primary, Question, Readout, Reveal, Stage, Sub, money, money2,
} from "../kit";

/**
 * Lesson 7: the capstone.
 *
 * No new mechanism. The whole point is that two earlier answers now have to be
 * used together, because in practice they constrain each other: the discount
 * decides how much you must borrow, and the coming loss decides how much
 * collateral that borrow needs standing behind it.
 *
 * A learner who only took lesson 4 sizes the borrow and gets liquidated. One who
 * only took lesson 5 picks a safe LTV and comes up short of the capital. Neither
 * half is sufficient, which is what makes it a capstone rather than a review.
 */

const WANT = 10_000;
const PRICE = 0.96;
const LOSS = 0.12;

const pct = (n) => `${(n * 100).toFixed(1)}%`;

export default function CapstoneLab({ lessonId, stage, onStage, done, onComplete }) {
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
      headline="Size the whole position."
      unit="amount"
      targetOf={(f) => minimumCollateral(f.cashWanted, f.price, f.loss)}
      computeOf={(f, v) => v}
      controlLabel="Deposit"
      controlDisplay={(v) => money(v)}
      targetFoot="the smallest deposit that works"
      landingFoot="set the slider to your answer"
      passTitle="Track complete."
      passBody="You sized a position against a discount you cannot control and a loss you cannot predict, using nothing but what the earlier lessons established. That is the whole beginner track."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState(12_000);
  const [revealed, setRevealed] = useState(false);

  const borrow = borrowNeededFor(WANT, PRICE);
  const naive = borrow; // the answer someone gives who forgets the loss entirely
  const truth = minimumCollateral(WANT, PRICE, LOSS);
  const naiveLtv = borrow / naive;

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline="One position, two constraints, and they pull against each other."
    >
      <Sub>
        You need {money(WANT)} of spendable capital. alUSD is trading at {PRICE.toFixed(2)},
        and the MYT is about to report a loss of {pct(LOSS)} of its backing. You get to
        choose one number: how much to deposit.
      </Sub>

      <div className={own.brief}>
        <BriefRow label="Capital required" value={`${money(WANT)} USDC`} note="in hand, after selling" />
        <BriefRow label="alUSD price" value={PRICE.toFixed(2)} note="what the market will pay you" tone="#f5c09a" />
        <BriefRow label="Coming loss of backing" value={pct(LOSS)} note="the vault is about to report it" tone="#d4645a" />
      </div>

      <Panel>
        <Question>What is the smallest deposit that gets you the capital and survives the loss?</Question>
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
        <Actions aside="Both conditions have to hold at once.">
          <Primary onClick={() => setRevealed(true)}>Commit and stress it</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`${money2(truth)}, and the obvious answer is not close.`}
          onNext={onDone}
          nextLabel="See both constraints at once"
        >
          <Body>
            Raising {money(WANT)} at {PRICE.toFixed(2)} means borrowing {money2(borrow)},
            which lesson 4 covers. Depositing exactly that much would put you at{" "}
            {pct(naiveLtv)} LTV, and a {pct(LOSS)} loss takes that to{" "}
            {pct(ltvAfterLoss(naiveLtv, LOSS))}, well past the {pct(LIQ_LTV)} threshold.
          </Body>
          <Body>
            Lesson 5 gives the ceiling: at a {pct(LOSS)} loss, the highest starting LTV
            that survives is {pct(survivableLtv(LOSS))}. The deposit has to be large enough
            that {money2(borrow)} of debt sits at or under it, which puts the floor at{" "}
            {money2(truth)}.
          </Body>
        </Reveal>
      )}
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

function Explore({ onDone }) {
  const [deposit, setDeposit] = useState(11_000);
  const [price, setPrice] = useState(0.96);
  const [loss, setLoss] = useState(0.12);
  const [solved, setSolved] = useState(false);

  const borrow = borrowNeededFor(WANT, price);
  const ltv = borrow / deposit;
  const raisesEnough = deposit > 0 && borrow <= deposit * 0.9;
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
      headline="Both lights have to be green at once."
    >
      <Sub>
        You still need {money(WANT)} of capital. Move the deposit until the position both
        raises it and survives the loss, then find the smallest deposit that manages both.
      </Sub>

      <div className={own.checks}>
        <CheckRow
          ok={raisesEnough}
          title={`Raises ${money(WANT)}`}
          detail={
            raisesEnough
              ? `Borrowing ${money2(borrow)} at ${price.toFixed(3)} puts ${money(WANT)} in hand.`
              : `Borrowing ${money2(borrow)} would need ${money2(borrow / 0.9)} of collateral to stay under the cap.`
          }
        />
        <CheckRow
          ok={survives}
          title={`Survives a ${pct(loss)} loss`}
          detail={
            survives
              ? `Starting at ${pct(ltv)}, a ${pct(loss)} loss moves it to ${pct(ltvAfterLoss(ltv, loss))}.`
              : `Starting at ${pct(ltv)}, a ${pct(loss)} loss moves it to ${pct(ltvAfterLoss(ltv, loss))}, past ${pct(LIQ_LTV)}.`
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
          verdict={works ? (tight ? "smallest that works" : "works, but larger than needed") : "does not work yet"}
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
          label="Loss of backing"
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
          title="The discount sets the numerator, the loss sets the denominator."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            How much you must borrow is decided by the price you can sell at, and nothing
            about your position changes it. How much collateral that borrow needs behind it
            is decided by the loss you have to survive, and nothing about the market
            changes that. The deposit is simply the first divided by the second.
          </Body>
          <Body>
            Notice what moving the price does. A worse discount means borrowing more to
            raise the same capital, which raises the LTV, which needs more collateral to
            survive the same loss. The two constraints are not independent, and that is
            the thing worth carrying away from this track.
          </Body>
        </Reveal>
      ) : (
        <Hint>Raise the deposit until both checks turn green.</Hint>
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
