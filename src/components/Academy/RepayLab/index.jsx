import React, { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import { apiBase } from "../lib/api";
import { simpleCurve } from "../lib/model";
import { EXAMPLE_REDEMPTION, EXAMPLE_YIELD, withdrawable } from "../lib/protocol";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, FlowSteps, Gate, GuessSlider,
  Hint, Legend, LineChart, Note, Notes, Panel, PositionCard, Primary, Question, Reveal, NARROW,
  SHOTS, Stage, Sub, money, said,
} from "../kit";

/**
 * Lesson 4: the loan repays itself.
 *
 * The carried position, 10,000 deposited and 5,000 borrowed, is left alone for
 * a year and the card ticks through the months while both figures fall. The
 * Learn stage says who repays the loan before it asks about the balance:
 * savers queueing alUSD in the Transmuter, whose claims are settled out of
 * borrower collateral. "Redemptions" was a black box from lesson 1 until then.
 * The reveal says what happened to the deposit, which paid for all of it.
 *
 * The Try stage runs time and repaying by hand on the same card. It used to
 * carry a Borrow more control as well, which repeated lesson 3 on the busiest
 * screen in the track; a note names it instead.
 *
 * Every falling figure is the redemption rate taken at its definition, the
 * share of the loan that redemptions clear in a year, drawn as a straight line
 * (`simpleCurve`, which says why the app's own projection is not used here).
 * It runs at the example rate in `protocol.js`, and the copy says so on every
 * screen that shows one. A rate is not a schedule: the app reads the live one
 * on the vault, and nothing here implies a payoff date. One year, not two: a
 * second year at the same rate invites compounding the rate against itself,
 * and the first reviewer did exactly that.
 *
 * This lesson owns the number. Lesson 1 shows the same balance falling but
 * never says where it lands, so the prediction here is still a prediction.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const MONTHS = 12;

/**
 * The position over the year for a given opening balance, sampled monthly.
 * The Try stage re-runs it for whatever the repay and borrow-more controls
 * leave, so the deposit, the balance and the chart all come from one line.
 */
const curveFor = (debt) =>
  simpleCurve({
    collateral: DEPOSIT,
    debt,
    yieldAnnual: EXAMPLE_YIELD,
    redemptionAnnual: EXAMPLE_REDEMPTION,
    months: MONTHS,
  });

/** The untouched position: 5,000 borrowed and never repaid by hand. */
const CURVE = curveFor(BORROW);

/** Where the deposit ends the year, and roughly what it earned on the way. */
const DEPOSIT_AT_END = CURVE.at(-1).collateral;
const YIELDED = DEPOSIT * EXAMPLE_YIELD;

/** Who repays the loan, drawn before the question so the answer has a cause. */
const WHO_PAYS = [
  {
    n: 1,
    label: "Savers",
    value: "Queue alUSD",
    note: "They buy it below a dollar and wait out a term in the Transmuter to redeem it 1:1.",
    tone: "#8ea9d8",
  },
  {
    n: 2,
    label: "Your loan",
    value: "Is earmarked",
    note: "As their alUSD matures, the protocol sets a slice of every loan aside for it.",
    tone: "#f5c09a",
  },
  {
    n: 3,
    label: "Your collateral",
    value: "Repays the slice",
    note: "The collateral behind that slice settles their claim, and your debt falls by the same amount.",
    tone: "#5ba88a",
  },
];

/**
 * The reveal figure: what is left after the year, to the nearest hundred.
 * Derived rather than written down, because the example rate is a constant
 * someone may reasonably change again. At 70% it is 1,500, which is the
 * arithmetic a learner who has just read "70% a year" will do.
 */
const OWED_AT_END = Math.round(CURVE.at(-1).debt / 100) * 100;
const CLEARED = BORROW - OWED_AT_END;

/**
 * An example earmark: a fifth of the balance set aside for the next
 * redemption. The protocol sizes it to the position's share of total system
 * debt, so a real one depends on the whole market. It is drawn here because the
 * app shows Earmarked on every position and this track never did.
 */
const EARMARK_SHARE = 0.2;

/** The sample nearest a whole month. */
const nearestMonth = (curve, m) =>
  curve.reduce((best, p) => (Math.abs(p.month - m) < Math.abs(best.month - m) ? p : best));
const sampleAt = (m) => nearestMonth(CURVE, m);

/** The example rate, written the way the app writes it. */
const RATE = `${+(EXAMPLE_REDEMPTION * 100).toFixed(1)}%`;

export default function RepayLab({ lessonId, stage, onStage, done, onComplete }) {
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
      passTitle="Lesson 4 complete."
      passBody="Redemptions pay the balance down for you. Repay by hand and it clears faster. The position card shows how much of the deposit that frees."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const TICK_MS = 120;

function Learn({ onDone }) {
  const [guess, setGuess] = useState(BORROW);
  const [revealed, setRevealed] = useState(false);
  const [month, setMonth] = useState(0);

  // The reveal appears at once; only the card waits on the tick. Reduced
  // motion goes straight to month 12.
  useEffect(() => {
    if (!revealed) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMonth(MONTHS);
      return undefined;
    }
    const id = setInterval(() => {
      setMonth((m) => {
        if (m >= MONTHS) {
          clearInterval(id);
          return m;
        }
        return m + 1;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [revealed]);

  const at = sampleAt(month);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="You borrow, then do nothing.">
      <Sub>
        Savers queue alUSD in the Transmuter to redeem it for a full dollar, and that queue
        is what repays your loan. The redemption rate is how fast: the share of what you owe
        it clears over a year. Every position runs at the same rate, and the app prints it on
        your vault. This example runs at {RATE}.
      </Sub>

      <FlowSteps steps={WHO_PAYS} />

      <PositionCard
        deposited={at.collateral}
        borrowed={at.debt}
        earmarked={revealed && month > 0 ? at.debt * EARMARK_SHARE : 0}
        redemption={EXAMPLE_REDEMPTION}
        asset="USDC"
        earning
        marks="cap"
        highlight="borrowed"
        note={
          revealed
            ? `Month ${month}`
            : "Month 0"
        }
      />

      <Panel>
        <Question>One year at {RATE}, and you never touch it. How much do you owe?</Question>
        <GuessSlider
          label="Owed after a year"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={0}
          max={7_500}
          step={250}
          format={money}
          scale={["Nothing", "More than you borrowed"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="You do nothing at all for a year.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`You owe ${money(OWED_AT_END)}. You paid none of it.`}
          onNext={onDone}
          nextLabel="See what moves it"
        >
          <Body>
            {said(guess, OWED_AT_END, money, 250)}
            A year went by and you never made a payment. At {RATE}, redemptions cleared{" "}
            {RATE} of the {money(BORROW)} you borrowed, which is {money(CLEARED)}.
          </Body>
          <Body>
            Your deposit paid for it. It earned about {money(YIELDED)} and gave{" "}
            {money(CLEARED)} to the redemptions, so it reads about {money(DEPOSIT_AT_END)}. What
            is yours, the deposit less what you owe, is where it started plus the yield, less a
            small redemption fee.
          </Body>
          <Body>
            The band inside the bar is <strong>earmarked</strong> debt: the slice already set
            aside for the next redemption. That collateral stays in the vault earning until
            the claim settles. The app shows the same figure on your position.
          </Body>
        </Reveal>
      )}

      <AppShot shot={SHOTS.statsBottom} narrow={NARROW.earmarkedRedemption}>
        The rate on a live vault, reading 90.61% the day this was captured. It rises and
        falls with how much alUSD is waiting to be redeemed, so the {RATE} above is an
        example rather than a schedule. Earmarked, beside it, is the slice of a loan already
        set aside for the next redemption.
      </AppShot>
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [m, setM] = useState(0);
  const [repay, setRepay] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  // Repaying by hand changes what redemptions have left to work on, so the
  // projection is re-run for the balance it leaves rather than shifted after
  // the fact. Shifting the 5,000 curve down by the repayment kept redeeming
  // collateral for debt that no longer existed.
  const opening = Math.max(BORROW - repay, 0);
  const curve = useMemo(() => curveFor(opening), [opening]);
  const at = nearestMonth(curve, m);
  const balance = at.debt;
  const free = withdrawable(at.collateral, balance);

  // The line extends as the months slider moves.
  const points = curve
    .filter((p) => p.month <= m + 1e-9)
    .map((p) => ({ x: p.month, y: p.debt }));
  // At month 0 the series is one sample, and a one-point path draws nothing.
  // A duplicated point makes a zero-length segment, which the chart's round
  // line cap renders as a dot, so the starting balance shows before the
  // months slider moves.
  if (points.length === 1) points.push({ ...points[0] });

  const enough = m >= 6 && repay > 0;
  useEffect(() => {
    if (enough) setUnlocked(true);
  }, [enough]);

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Run the months, then repay some of it yourself.">
      <Sub>
        The repay amount is the same field you use on the Repay tab.
      </Sub>

      <PositionCard
        deposited={at.collateral}
        borrowed={balance}
        earmarked={m > 0 ? balance * EARMARK_SHARE : 0}
        redemption={EXAMPLE_REDEMPTION}
        asset="USDC"
        earning
        marks="cap"
        highlight="borrowed"
        note={`${money(free)} USDC is free to withdraw.`}
        compact
      />

      <div className={styles.chartLive}>
        <LineChart
          label="What you owe"
          series={[{ id: "balance", color: "#f5c09a", points }]}
          xMax={MONTHS}
          xTicks={4}
          xLabel="months"
          yMax={7_500}
          yTicks={3}
          formatY={money}
        />
        <Legend items={[{ label: "Balance", color: "#f5c09a" }]} />
        <Hint>These figures use an example redemption rate. Real rates move.</Hint>
      </div>

      <Controls>
        <Control
          label="Months passed"
          display={`${m} months`}
          min={0} max={MONTHS} step={1}
          value={m}
          onChange={setM}
          accent
        />
        <Control
          label="Repay by hand"
          display={`${money(repay)} alUSD`}
          min={0} max={5_000} step={250}
          value={repay}
          onChange={setRepay}
          verdict={repay > 0 ? "this frees more of your deposit" : null}
        />
      </Controls>

      <Notes>
        <Note label="Time passing">
          Every month, redemptions clear a little more of the balance for you.
        </Note>
        <Note label="Repaying by hand">
          Repay at any time, in any amount, from the Repay tab. It takes effect at once.
        </Note>
        <Note label="Borrowing more">
          The one thing that raises the balance. It is the Borrow tab from lesson 3.
        </Note>
      </Notes>

      {unlocked ? (
        <Reveal
          title="Time and repayment lower the balance, and only borrowing more raises it."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            Repaying also frees collateral, so the
            amount you can withdraw rises immediately.
          </Body>
        </Reveal>
      ) : (
        <Gate label="Take the check" hint="Run the months forward, then repay some of the loan, to continue." />
      )}

      <AppShot shot={SHOTS.repayTab}>
        The Repay tab, which is the second control above. Type an amount, or take the
        balance in your wallet with MAX, and the debt falls by what you send.
      </AppShot>
    </Stage>
  );
}
