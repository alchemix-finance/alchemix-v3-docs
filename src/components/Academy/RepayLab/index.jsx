import React, { useMemo, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, Body, ChoiceCheckpoint, GuessSlider, Hint, LineChart, Note, Notes,
  Panel, Primary, Question, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 4: the loan repays itself.
 *
 * The claim from lesson 1, made concrete. A learner should leave able to say
 * which things move a balance and which do not, because that is the difference
 * between trusting the mechanism and hoping about it.
 *
 * Nothing here states how fast a balance clears. The pace depends on conditions
 * that change, and the docs and the dApp's own projection model do not currently
 * agree on the split between the flows that drive it. That question belongs to
 * the advanced track. What this lesson teaches survives either answer: left
 * alone, the balance only moves down.
 */

const START = 9_000;
const TERM = 48;

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
      headline="One question before you move on."
      passTitle="Lesson 4 complete."
      passBody="You know what moves a loan balance and what leaves it alone. Next: how to get your money back out, by two different routes."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

function Learn({ onDone }) {
  const [guess, setGuess] = useState(START);
  const [revealed, setRevealed] = useState(false);

  const AT = 24;
  const truth = START * (1 - AT / TERM);
  const close = Math.abs(guess - truth) <= 1_200;

  const points = Array.from({ length: 49 }, (_, i) => ({
    x: i,
    y: Math.max(START * (1 - i / TERM), 0),
  }));

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="You borrow, then you do nothing.">
      <Sub>
        You borrowed {money(START)} against your deposit. You make no payments, you do not
        borrow again, and you leave the position completely alone for two years.
      </Sub>

      <Panel>
        <Question>After those two years, how much do you still owe?</Question>
        <GuessSlider
          label="Still owed after two years"
          value={guess}
          onChange={setGuess}
          disabled={revealed}
          color="#f5c09a"
          min={0}
          max={START * 1.5}
          step={250}
          format={(v) => money(v)}
          scale={["Nothing", "More than you borrowed"]}
        />
      </Panel>

      {!revealed ? (
        <Actions aside="Nothing was repaid by hand, and no interest was charged.">
          <Primary onClick={() => setRevealed(true)}>Check my answer</Primary>
        </Actions>
      ) : (
        <>
          <div className={styles.chartLive}>
            <div className={styles.chartHead}>
              <span className={styles.microLabel}>What you owe, doing nothing</span>
            </div>
            <LineChart
              label="Loan balance falling over four years while untouched"
              series={[{ id: "d", color: "#f5c09a", points }]}
              xMax={TERM}
              yMax={START * 1.05}
              xLabel="months"
              formatY={(v) => money(v)}
              xTicks={4}
            />
          </div>

          <Reveal
            title="Less than you borrowed, without you doing anything."
            onNext={onDone}
            nextLabel="Find out what would change it"
          >
            <Body>
              {close ? "You were in the right area. " : `You said ${money(guess)}. `}
              Your deposit stayed in the vault the whole time, earning, while the protocol
              brought the balance down. It happens whether you are watching or not.
            </Body>
            <Body>
              The exact pace depends on conditions that move, so the shape of this line is
              the lesson and the dates on it will differ. What holds in every case is the
              direction. Left alone, the balance goes down.
            </Body>
          </Reveal>
        </>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

/**
 * Four things a learner might expect to matter. Two of them do.
 *
 * Getting the two that do nothing wrong is the common beginner mistake, so they
 * are here as buttons that visibly do nothing rather than as a sentence saying
 * they do nothing.
 */
const EVENTS = [
  {
    id: "borrow",
    label: "Borrow another 2,000",
    delta: 2_000,
    note: "The only thing you can do that raises the balance.",
  },
  {
    id: "repay",
    label: "Repay 2,000 by hand",
    delta: -2_000,
    note: "Allowed at any time, in any amount.",
  },
  {
    id: "price",
    label: "Collateral price drops 30%",
    delta: 0,
    note: "No effect. The debt is recorded in alUSD, so a collateral price move never touches it.",
  },
  {
    id: "wait",
    label: "Wait six months",
    delta: 0,
    note: "No effect beyond the fall already happening. Nothing is added for time passing.",
  },
];

function Try({ onDone }) {
  const [log, setLog] = useState([]);

  const add = (event) => {
    setLog((l) => (l.length >= 4 ? l : [...l, { ...event, at: 6 + l.length * 8 }]));
  };

  const points = useMemo(() => {
    const rate = START / TERM;
    return Array.from({ length: 97 }, (_, i) => {
      const m = i / 2;
      const added = log.filter((e) => e.at <= m).reduce((sum, e) => sum + e.delta, 0);
      return { x: m, y: Math.max(START + added - rate * m, 0) };
    });
  }, [log]);

  const tried = new Set(log.map((e) => e.id));
  const enough = tried.has("borrow") || tried.has("repay") ? tried.size >= 2 : tried.size >= 3;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="Which of these moves the line?">
      <Sub>
        Same loan as before. Apply any of these to the position and watch what the balance
        does. Two of them change it. Two do not.
      </Sub>

      <div className={styles.chartLive}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>What you owe</span>
          {log.length ? (
            <button type="button" className={own.reset} onClick={() => setLog([])}>
              Start over
            </button>
          ) : null}
        </div>
        <LineChart
          label="Loan balance responding to the actions applied"
          series={[{ id: "d", color: "#f5c09a", points }]}
          xMax={TERM}
          yMax={START * 1.35}
          xLabel="months"
          formatY={(v) => money(v)}
          xTicks={4}
        />
      </div>

      <div className={own.buttons}>
        {EVENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`${own.event} ${tried.has(e.id) ? own.eventDone : ""}`}
            onClick={() => add(e)}
            disabled={log.length >= 4}
          >
            <span className={own.eventLabel}>{e.label}</span>
            {tried.has(e.id) ? <span className={own.eventNote}>{e.note}</span> : null}
          </button>
        ))}
      </div>

      {log.length >= 4 ? (
        <Hint>That is four changes. Start over if you want to try the others.</Hint>
      ) : null}

      {enough ? (
        <Reveal
          title="Only your own choices move it, and only one of them moves it up."
          onNext={onDone}
          nextLabel="Answer one question"
        >
          <Body>
            Borrowing more raises the balance, because you asked for more. Repaying lowers
            it, because you paid. Everything else leaves it alone and lets the decline
            carry on.
          </Body>
          <Notes>
            <Note label="Price moves">
              Your debt is recorded in alUSD or alETH, the same kind of asset you deposited.
              When the price moves, both sides move together, so what you owe relative to
              what you hold does not change.
            </Note>
            <Note label="Time">
              No interest is added for time passing. Time only ever brings the balance
              down.
            </Note>
          </Notes>
        </Reveal>
      ) : (
        <Hint>Try at least three of them to carry on.</Hint>
      )}
    </Stage>
  );
}
