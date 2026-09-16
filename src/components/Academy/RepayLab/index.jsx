import React, { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import { apiBase } from "../lib/api";
import { positionCurve } from "../lib/model";
import { borrowable, withdrawable } from "../lib/protocol";
import {
  Actions, Body, ChoiceCheckpoint, Control, Controls, GuessSlider, Hint, Legend,
  LineChart, Note, Notes, Panel, PositionCard, Primary, Question, Reveal, Stage,
  Sub, money,
} from "../kit";

/**
 * Lesson 4: the loan repays itself.
 *
 * The carried position, 10,000 deposited and 5,000 borrowed, is left alone for
 * two years and the card ticks through the months while both figures fall. The
 * Try stage puts the three things that move a balance on the same card: time,
 * repaying by hand, and borrowing more.
 *
 * Every falling figure comes from the dApp's own projection, run at an example
 * rate. Forty percent of the balance is still standing at two years, so nothing
 * on screen implies a payoff date.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const YIELD = 0.05;
const ILLUSTRATIVE_PACE = 0.35;
const MONTHS = 24;

/** The position over two years, sampled weekly with a final point on month 24. */
const CURVE = positionCurve({
  collateral: DEPOSIT,
  debt: BORROW,
  yieldAnnual: YIELD,
  redemptionAnnual: ILLUSTRATIVE_PACE,
  months: MONTHS,
});

/** The sample nearest a whole month. */
const sampleAt = (m) =>
  CURVE.reduce((best, p) => (Math.abs(p.month - m) < Math.abs(best.month - m) ? p : best));

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
      passBody="Left alone, the balance falls on its own. Repay by hand and it falls faster, and the position card shows you how much of the deposit that frees up."
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
        Your position holds 10,000 deposited and 5,000 borrowed. Now walk away for two
        years. The deposit keeps earning the whole time, and what it earns goes to
        repaying the loan, so watch both figures on the card.
      </Sub>

      <PositionCard
        deposited={at.collateral}
        borrowed={at.debt}
        asset="USDC"
        earning
        highlight="borrowed"
        note={
          revealed
            ? `Month ${month}`
            : "Month 0"
        }
      />

      <Panel>
        <Question>After two years, how much do you owe?</Question>
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
          title="You owe about 2,000. You paid none of it."
          onNext={onDone}
          nextLabel="See what moves it"
        >
          <Body>
            Two years went by and you never touched the position. The yield your deposit
            earned did the paying, a little at a time, while the deposit itself stayed put
            and carried on working. Real rates move up and down, so your own loan will run
            faster or slower than this one.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [m, setM] = useState(0);
  const [repay, setRepay] = useState(0);
  const [more, setMore] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const at = sampleAt(m);

  // The cap from lesson 3, seen again: at month 0 with nothing repaid the
  // Borrow more thumb stops at 4,000. The cap is re-derived every render, so
  // a stored value the months or repay controls have since outgrown is
  // clamped back down rather than drawn past the cap.
  const cap = borrowable(at.collateral, at.debt - repay);
  const moreShown = Math.min(more, cap);
  const capped = moreShown >= cap - 1e-9;

  const balance = Math.max(at.debt - repay + moreShown, 0);
  const free = withdrawable(at.collateral, balance);

  // The line extends as the months slider moves, with the current repay and
  // borrow-more applied at every drawn month.
  const points = CURVE.filter((p) => p.month <= m + 1e-9).map((p) => ({
    x: p.month,
    y: Math.max(p.debt - repay + moreShown, 0),
  }));
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
        Same position, your hands on the controls. Push the months forward, then try the
        two amounts below. They are the same fields you use on the Repay tab and the
        Borrow tab.
      </Sub>

      <PositionCard
        deposited={at.collateral}
        borrowed={balance}
        asset="USDC"
        earning
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
        <Hint>An example rate, so your own position runs faster or slower than this.</Hint>
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
        <Note label="Repaying by hand">
          You can repay at any time, in any amount, with alUSD, MYT, or USDC.
        </Note>
      </Notes>

      {unlocked ? (
        <Reveal
          title="Time and repayment both lower it. Only borrowing more raises it."
          onNext={onDone}
          nextLabel="Take the check"
        >
          <Body>
            Those three are the whole list, and two of them are yours to make. Repay any
            part of the balance whenever you want, with alUSD, MYT, or USDC, and the amount
            free to withdraw climbs the moment you do.
          </Body>
        </Reveal>
      ) : null}
    </Stage>
  );
}
