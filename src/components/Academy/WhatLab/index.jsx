import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import {
  Actions, Body, ChoiceCheckpoint, Control, Controls, Hint, LineChart, Legend,
  Note, Notes, Panel, Primary, Question, Reveal, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 1: what Alchemix does.
 *
 * The first lesson of the track, so it answers the question someone actually
 * arrives with: what is this, and why would I use it. No arithmetic, no
 * vocabulary the reader has not been given, and nothing that assumes they have
 * used a lending protocol before.
 *
 * The one fact worth the whole lesson is that the loan balance goes down on its
 * own. Stage 2 shows that against a normal loan, because the contrast is what
 * makes it land.
 */

export default function WhatLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

  if (stage === "predict") return <Learn onDone={() => onStage("explore")} />;
  if (stage === "explore") return <Compare onDone={() => onStage("checkpoint")} />;

  return (
    <ChoiceCheckpoint
      base={base}
      lessonId={lessonId}
      done={done}
      onPass={onComplete}
      headline="One question before you move on."
      passTitle="Lesson 1 complete."
      passBody="You can say what Alchemix offers and what makes its loans different from the ones you have met before. The rest of the track works through each piece in turn."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const PILLARS = [
  {
    id: "save",
    title: "Save",
    line: "Deposit ETH or USDC and earn on it.",
    body: "Your deposit goes into a vault that spreads it across several yield strategies. The Alchemix DAO picks those strategies and adjusts them over time, so there is nothing for you to manage. There is no lock-up, and you can take your money out whenever you want.",
    colour: "#5ba88a",
  },
  {
    id: "borrow",
    title: "Borrow",
    line: "Take a loan against that deposit, up to 90% of its value.",
    body: "You keep the deposit and it keeps earning. The loan charges no interest and has no payment schedule, and the balance goes down over time on its own. This is the part people find surprising, and it is what the next few lessons are about.",
    colour: "#f5c09a",
  },
  {
    id: "fixed",
    title: "Earn a fixed return",
    line: "Buy alUSD or alETH below face value and redeem it at full value later.",
    body: "Alchemix loans are issued as alUSD and alETH. Anyone can hand those back to the protocol and receive the real asset at an exact 1:1 rate, once a set waiting period is up. Buying below 1.00 and waiting is a return you can work out in advance. Lesson 7 covers it.",
    colour: "#8ea9d8",
  },
];

function Learn({ onDone }) {
  const [open, setOpen] = useState("save");
  const [seen, setSeen] = useState(() => new Set(["save"]));

  const show = (id) => {
    setOpen(id);
    setSeen((s) => (s.has(id) ? s : new Set([...s, id])));
  };

  const allSeen = seen.size === PILLARS.length;

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="Alchemix does three things.">
      <Sub>
        You can use any one of them on its own. Open each to see what it means, then
        move on to the one that makes Alchemix unusual.
      </Sub>

      <div className={own.pillars}>
        {PILLARS.map((p) => {
          const on = open === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`${own.pillar} ${on ? own.pillarOn : ""}`}
              onClick={() => show(p.id)}
              aria-expanded={on}
            >
              <span className={own.pillarBar} style={{ background: p.colour }} />
              <span className={own.pillarTitle} style={on ? { color: p.colour } : undefined}>
                {p.title}
              </span>
              <span className={own.pillarLine}>{p.line}</span>
              {seen.has(p.id) ? <span className={own.pillarSeen} aria-hidden="true">✓</span> : null}
            </button>
          );
        })}
      </div>

      <Panel>
        <div className={own.detail}>
          <div className={own.detailHead} style={{ color: PILLARS.find((p) => p.id === open).colour }}>
            {PILLARS.find((p) => p.id === open).title}
          </div>
          <p className={own.detailBody}>{PILLARS.find((p) => p.id === open).body}</p>
        </div>
      </Panel>

      {allSeen ? (
        <Reveal
          title="The second one is the reason the other two exist."
          onNext={onDone}
          nextLabel="See how that compares to a normal loan"
        >
          <Body>
            Everywhere else, borrowing costs you money for as long as you owe it. Interest
            is added to the balance, and the balance grows until you pay it down.
          </Body>
          <Body>
            An Alchemix loan works the other way round. Your deposit stays where it is and
            keeps earning, and that is what clears the balance. You are not paying the loan
            off out of your income. The deposit you borrowed against is doing it.
          </Body>
        </Reveal>
      ) : (
        <Hint>Open all three to continue.</Hint>
      )}
    </Stage>
  );
}

/* ── Stage 2: compare ────────────────────────────────────── */

const LOAN = 10_000;

function Compare({ onDone }) {
  const [ratePct, setRatePct] = useState(7);
  const [years, setYears] = useState(5);
  const [moved, setMoved] = useState(false);

  // Both sides are the learner's own suppositions rather than claims about the
  // protocol. The rate on a normal loan varies by lender, and how fast an
  // Alchemix balance clears depends on conditions no lesson should pin a number
  // to. What is being taught here is the direction each one moves in.
  const months = Math.round(years * 12);
  const normalAt = (m) => LOAN * Math.pow(1 + ratePct / 100, m / 12);
  const alchemixAt = (m) => Math.max(LOAN * (1 - m / months), 0);

  const points = Array.from({ length: 61 }, (_, i) => (i / 60) * months);
  const yMax = Math.max(normalAt(months), LOAN) * 1.05;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="The same loan, two ways.">
      <Sub>
        Both lines start at {money(LOAN)} borrowed. Set a rate you might be charged
        elsewhere, and how long you want to look ahead.
      </Sub>

      <div className={styles.chartLive}>
        <div className={styles.chartHead}>
          <span className={styles.microLabel}>What you still owe</span>
        </div>
        <LineChart
          label="What you owe over time, on a normal loan and on an Alchemix loan"
          series={[
            { id: "normal", color: "#d4952a", points: points.map((m) => ({ x: m, y: normalAt(m) })) },
            { id: "alch", color: "#5ba88a", points: points.map((m) => ({ x: m, y: alchemixAt(m) })) },
          ]}
          xMax={months}
          yMax={yMax}
          xLabel="months"
          formatY={(v) => money(v)}
          formatX={(v) => String(Math.round(v))}
        />
        <Legend
          items={[
            { label: "A normal loan", color: "#d4952a" },
            { label: "An Alchemix loan", color: "#5ba88a" },
          ]}
        />
      </div>

      <Controls>
        <Control
          label="Rate on a normal loan"
          display={`${ratePct.toFixed(1)}%`}
          min={2} max={18} step={0.5}
          value={ratePct}
          onChange={(v) => { setRatePct(v); setMoved(true); }}
        />
        <Control
          label="Looking ahead"
          display={`${years} years`}
          min={1} max={10} step={1}
          value={years}
          onChange={(v) => { setYears(v); setMoved(true); }}
          accent
        />
      </Controls>

      <Notes>
        <Note label="Normal loan">
          You owe {money(normalAt(months))} after {years} {years === 1 ? "year" : "years"},
          having borrowed {money(LOAN)}. Nothing was repaid, so interest kept being added.
        </Note>
        <Note label="Alchemix">
          You owe nothing by then, and you never made a payment. Your deposit is still
          yours, and it was earning the whole time.
        </Note>
      </Notes>

      {moved ? (
        <Reveal
          title="No rate you pick makes the orange line go down."
          onNext={onDone}
          nextLabel="Answer one question"
        >
          <Body>
            That is the difference worth remembering. A normal loan balance only falls when
            you pay it. An Alchemix balance falls because the deposit behind it is working.
          </Body>
          <Body>
            How quickly it falls depends on conditions that change, so no lesson can promise
            you a date. What does not change is the direction. Left alone, the balance only
            moves down.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move either control to carry on.</Hint>
      )}
    </Stage>
  );
}
