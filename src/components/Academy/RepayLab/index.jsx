import React, { useEffect, useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import { apiBase } from "../lib/api";
import { positionCurve } from "../lib/model";
import {
  EXAMPLE_REDEMPTION, EXAMPLE_YIELD, borrowable, withdrawable,
} from "../lib/protocol";
import {
  Actions, AppShot, Body, ChoiceCheckpoint, Control, Controls, GuessSlider, Hint, Legend,
  LineChart, Note, Notes, Panel, PositionCard, Primary, Question, Reveal, NARROW, SHOTS, Stage,
  Sub, money, said,
} from "../kit";

/**
 * Lesson 4: the loan repays itself.
 *
 * The carried position, 10,000 deposited and 5,000 borrowed, is left alone for
 * two years and the card ticks through the months while both figures fall. The
 * Try stage puts the three things that move a balance on the same card: time,
 * repaying by hand, and borrowing more.
 *
 * Every falling figure comes from the dApp's own projection, run at the example
 * redemption rate in `protocol.js`, and the copy says so on every screen that
 * shows one. A rate is not a schedule: the app reads the live one on the vault,
 * and nothing here implies a payoff date.
 *
 * This lesson owns the number. Lesson 1 shows the same balance falling but
 * never says where it lands, so the prediction here is still a prediction.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const MONTHS = 24;

/**
 * The position over two years for a given opening balance, sampled weekly
 * with a final point on month 24. The Try stage re-runs it for whatever the
 * repay and borrow-more controls leave, so the deposit, the balance and the
 * chart all come from one projection.
 */
const curveFor = (debt) =>
  positionCurve({
    collateral: DEPOSIT,
    debt,
    yieldAnnual: EXAMPLE_YIELD,
    redemptionAnnual: EXAMPLE_REDEMPTION,
    months: MONTHS,
  });

/** The untouched position: 5,000 borrowed and never repaid by hand. */
const CURVE = curveFor(BORROW);

/**
 * The reveal figure, rounded to the nearest hundred so the sentence reads like
 * a person said it. Derived rather than written down, because the example rate
 * is a constant someone may reasonably change again.
 */
const OWED_AT_END = Math.round(CURVE.at(-1).debt / 100) * 100;

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

/**
 * Where the balance stands after the first year, to the nearest hundred.
 *
 * The reveal needs it. A learner told the rate and then shown only the two-year
 * figure has no way to check the shape of the fall against what they guessed.
 */
const OWED_AT_YEAR = Math.round(sampleAt(12).debt / 100) * 100;

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
  // motion goes straight to month 24.
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
        Redemptions repay the loan out of your own collateral, and the redemption rate is
        the pace they run at: the share of what you owe that they clear over a year. The
        protocol sets one rate for every position at once, and the app prints it on your
        vault. This example runs at {RATE}.
      </Sub>

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
        <Question>Two years at {RATE}, and you never touch it. How much do you owe?</Question>
        <GuessSlider
          label="Owed after two years"
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
        <Actions aside="You do nothing at all for two years.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <Reveal
          title={`You owe about ${money(OWED_AT_END)}. You paid none of it.`}
          onNext={onDone}
          nextLabel="See what moves it"
        >
          <Body>
            {said(guess, OWED_AT_END, money, 250)}
            Two years went by and you never made a payment. The rate applies to whatever is still owed, so the balance falls fastest early on: about {money(OWED_AT_YEAR)} was outstanding after the first year, and the second year took most of what was left, out of collateral that kept earning the whole time.
          </Body>
          <Body>
            The band inside the bar is <strong>earmarked</strong> debt: the slice already set
            aside for the next redemption. That collateral stays in the vault earning until
            the claim settles, and it is repaid with MYT rather than alUSD. The app shows the
            same figure on your position.
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
  const [more, setMore] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  // Repaying by hand and borrowing more change what redemptions have left to
  // work on, so the projection is re-run for the balance they leave rather
  // than shifted after the fact. Shifting the 5,000 curve down by the
  // repayment kept redeeming collateral for debt that no longer existed: at
  // 24 months with 2,000 repaid the chart sat at zero while the card showed
  // the deposit still falling, 6,350 against a loan that had been 3,000.
  const opening = Math.max(BORROW - repay, 0);
  const baseCurve = useMemo(() => curveFor(opening), [opening]);
  const atBase = nearestMonth(baseCurve, m);

  // The cap from lesson 3, seen again: at month 0 with nothing repaid the
  // Borrow more thumb stops at 4,000. The cap is re-derived every render, so
  // a stored value the months or repay controls have since outgrown is
  // clamped back down rather than drawn past the cap.
  const cap = borrowable(atBase.collateral, atBase.debt);
  const moreShown = Math.min(more, cap);
  const capped = moreShown >= cap - 1e-9;

  const curve = useMemo(() => curveFor(opening + moreShown), [opening, moreShown]);
  const at = nearestMonth(curve, m);
  const balance = at.debt;
  const free = withdrawable(at.collateral, balance);

  // The line extends as the months slider moves, drawn from the projection
  // that already carries the current repayment and extra borrow.
  const points = curve
    .filter((p) => p.month <= m + 1e-9)
    .map((p) => ({ x: p.month, y: p.debt }));
  // At month 0 the series is one sample, and a one-point path draws nothing.
  // A duplicated point makes a zero-length segment, which the chart's round
  // line cap renders as a dot, so the starting balance shows before the
  // months slider moves.
  if (points.length === 1) points.push({ ...points[0] });

  const enough = m >= 6 && (repay > 0 || moreShown > 0);
  useEffect(() => {
    if (enough) setUnlocked(true);
  }, [enough]);

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Run the months, then move the balance yourself.">
      <Sub>
        The two amounts below are the same fields you use on the Repay tab and the
        Borrow tab.
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
          yMax={10_000}
          yTicks={4}
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
        <Control
          label="Borrow more"
          display={`${money(moreShown)} alUSD`}
          min={0} max={5_000} step={250}
          value={moreShown}
          onChange={(raw) => setMore(Math.min(raw, cap))}
          verdict={capped ? "the cap stops you here" : null}
        />
      </Controls>

      <Notes>
        <Note label="Time passing">
          Every month, redemptions clear a little more of the balance for you.
        </Note>
        <Note label="Where the money comes from">
          Savers deposit alUSD into the Transmuter and wait out a term. Their queue earmarks
          your collateral, and when it matures that collateral settles their claim and
          clears your debt. Lesson 6 takes the saver's side.
        </Note>
        <Note label="Repaying by hand">
          Repay at any time, in any amount. alUSD clears standard debt, and MYT is required
          for any debt already earmarked for redemption.
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
        <Hint>Run the months forward, then repay or borrow more, to continue.</Hint>
      )}

      <AppShot shot={SHOTS.repayTab}>
        The Repay tab, which is the second control above. Type an amount, or take the
        balance in your wallet with MAX, and the debt falls by what you send.
      </AppShot>
    </Stage>
  );
}
