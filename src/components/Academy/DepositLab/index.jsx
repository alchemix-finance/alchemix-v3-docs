import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "../parts.module.css";
import { apiBase } from "../lib/api";
import {
  Body, Checkpoint, Control, Controls, Hint, LineChart, Note, Notes, Panel,
  Primary, Question, Reveal, Stage, Sub, money, GuessSlider, Actions,
} from "../kit";

/**
 * Lesson 2: your deposit and what it earns.
 *
 * Lesson 1 said the deposit keeps earning while a loan runs against it. This one
 * says what the deposit actually becomes and who is steering it, because a
 * beginner should know the answer to "where is my money" before being invited to
 * borrow against it.
 *
 * The Mix-Yield Token is named here and nowhere earlier. A term introduced two
 * lessons before it is explained is a term the reader has to carry, and the
 * first version of this track made that mistake.
 */

export default function DepositLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Learn onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Grow onDone={() => onStage("checkpoint")} />;

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
      controlLabel="Worth after a year"
      controlDisplay={(v) => money(v)}
      targetFoot="what the deposit grows to"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 2 complete."
      passBody="You know where a deposit goes, who decides what it does, and that you can take it back whenever you want. Next: borrowing against it without giving it up."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const START = 10_000;

function Learn({ onDone }) {
  const [guess, setGuess] = useState(0);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Where your money goes.">
      <Sub>
        You deposit {money(START)} USDC. It does not sit there as USDC. The vault wraps it
        into a token called the Mix-Yield Token, or MYT, and that token is what earns.
      </Sub>

      <div className={own.flow}>
        <Step n="1" label="You deposit" value={`${money(START)} USDC`} note="Your own money" />
        <Arrow />
        <Step n="2" label="The vault gives you" value="MYT" note="A share of the whole pot" tone="#5ba88a" />
        <Arrow />
        <Step n="3" label="The MYT earns" value="Continuously" note="From the moment it is minted" tone="#5ba88a" />
      </div>

      <Notes>
        <Note label="Who chooses">
          The Alchemix DAO picks which strategies the pot is spread across, and moves
          the weights around as conditions change. You do not choose them, and you do
          not have to watch them.
        </Note>
        <Note label="How you earn">
          Nothing is paid out to you. Each MYT you hold simply becomes worth more of
          the underlying asset over time.
        </Note>
        <Note label="Getting out">
          There is no lock-up. You can redeem your MYT for the underlying asset plus
          whatever it earned, at any time.
        </Note>
      </Notes>

      <Panel>
        <Question>
          Before we look at the numbers: of your {money(START)}, how much do you think you
          can take back out on the day after you deposit it?
        </Question>
        <GuessSlider
          label="Available the next day"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#5ba88a"
          min={0}
          max={START}
          step={250}
          format={(v) => money(v)}
          scale={["Nothing", `All ${money(START)}`]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="This one is not a trick.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`All of it. There is nothing holding your deposit in.`}
          onNext={onDone}
          nextLabel="See what it earns over time"
        >
          <Body>
            {guess >= START * 0.95
              ? "You had it. "
              : `You said ${money(guess)}. `}
            A deposit on its own carries no lock-up and no notice period. That changes only
            when you borrow against it, which is lesson 3, and even then you choose how much
            to tie up.
          </Body>
          <Body>
            This matters more than it sounds. It means the yield and the borrowing are two
            separate decisions. Plenty of people use the vault and never take a loan at all.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

function Step({ n, label, value, note, tone }) {
  return (
    <div className={own.step}>
      <div className={own.stepNum}>{n}</div>
      <div className={own.stepLabel}>{label}</div>
      <div className={own.stepValue} style={tone ? { color: tone } : undefined}>{value}</div>
      <div className={own.stepNote}>{note}</div>
    </div>
  );
}

function Arrow() {
  return (
    <svg className={own.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,192,154,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── Stage 2: grow ───────────────────────────────────────── */

function Grow({ onDone }) {
  const [deposit, setDeposit] = useState(10_000);
  const [ratePct, setRatePct] = useState(6);
  const [moved, setMoved] = useState({ deposit: false, rate: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const YEARS = 5;
  // Compounding, because the docs are explicit that yield compounds continuously
  // and nothing is paid out along the way. The rate is the learner's supposition,
  // not a figure this lesson is claiming.
  const at = (years) => deposit * Math.pow(1 + ratePct / 100, years);
  const points = Array.from({ length: 61 }, (_, i) => (i / 60) * YEARS);

  const afterOne = at(1);
  const afterFive = at(YEARS);

  return (
    <Stage eyebrow="Stage 2 · Try" headline="What it grows to.">
      <Sub>
        Set a deposit and a rate. The real rate moves with the strategies the DAO is
        running, so the number here is yours to pick and the live one will differ.
      </Sub>

      <div className={styles.chartLive}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>Value of your deposit</span>
          <span className={styles.aside}>{YEARS} years</span>
        </div>
        <LineChart
          label="Deposit value over five years"
          series={[{ id: "v", color: "#5ba88a", points: points.map((y) => ({ x: y, y: at(y) })) }]}
          xMax={YEARS}
          yMax={Math.max(at(YEARS) * 1.05, deposit * 1.1)}
          xLabel="years"
          formatY={(v) => money(v)}
          formatX={(v) => String(Math.round(v))}
          xTicks={5}
        />
      </div>

      <div className={own.statRow}>
        <Stat label="Deposited" value={money(deposit)} />
        <Stat label="After one year" value={money(afterOne)} tone="#5ba88a" />
        <Stat label={`After ${YEARS} years`} value={money(afterFive)} tone="#5ba88a" />
        <Stat label="Earned" value={money(afterFive - deposit)} tone="#5ba88a" />
      </div>

      <Controls>
        <Control
          label="Deposit"
          display={money(deposit)}
          min={1_000} max={50_000} step={500}
          value={deposit}
          onChange={(v) => { setDeposit(v); mark("deposit"); }}
        />
        <Control
          label="Suppose it earns"
          display={`${ratePct.toFixed(1)}% a year`}
          min={1} max={15} step={0.5}
          value={ratePct}
          onChange={(v) => { setRatePct(v); mark("rate"); }}
          accent
        />
      </Controls>

      {moved.deposit && moved.rate ? (
        <Reveal
          title="One year of growth is the only number the checkpoint asks for."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            A deposit of {money(deposit)} earning {ratePct.toFixed(1)}% is worth{" "}
            {money(afterOne)} after a year. That is the deposit plus the rate applied to
            it, and nothing else.
          </Body>
          <Body>
            Later years grow faster than the first, because what was earned starts earning
            too. That is why the line bends upwards as it goes.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls to carry on.</Hint>
      )}
    </Stage>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={own.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={own.statValue} style={tone ? { color: tone } : undefined}>{value}</div>
    </div>
  );
}
