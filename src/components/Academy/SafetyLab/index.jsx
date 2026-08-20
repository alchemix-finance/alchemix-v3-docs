import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import parts from "../parts.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { LIQ_LTV, MAX_LTV, ltvAfterLoss } from "../lib/protocol";
import {
  Actions, Body, ChoiceCheckpoint, Control, Controls, Hint, Note, Notes, Panel,
  Primary, Question, Reveal, SetupCard, SetupGrid, Stage, Sub, money,
} from "../kit";

/**
 * Lesson 6: what can go wrong.
 *
 * The safety lesson, and the one a beginner most needs to get right. Everyone
 * arriving from another lending protocol carries the same fear, that a price
 * drop will close their position. Here it cannot, because debt and collateral
 * are the same kind of asset and move together.
 *
 * Saying that is not enough. The lesson lets them push the price as hard as they
 * like and watch nothing happen, then shows the thing that does move the
 * threshold, so the reassurance is earned rather than asserted.
 */

const DEPOSIT = 10_000;
const CAREFUL = 4_500;
const BOLD = 8_500;
const CRASH = 0.4;

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
      headline="One question before you move on."
      passTitle="Lesson 6 complete."
      passBody="You know which risk applies here, and you can tell the borrowing cap apart from the liquidation threshold. One lesson left."
    />
  );
}

/* ── Stage 1: learn ──────────────────────────────────────── */

const OUTCOMES = [
  { id: "both", label: "Both are liquidated" },
  { id: "ben", label: "Ben is liquidated, Ana is fine" },
  { id: "neither", label: "Neither is liquidated" },
  { id: "partial", label: "Both are partly sold to bring their ratios down" },
];

function Learn({ onDone }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage eyebrow="Stage 1 · Learn" headline="A very bad day for the price.">
      <Sub>
        Ana and Ben both deposited {money(DEPOSIT)} of ETH. Ana borrowed carefully. Ben
        borrowed close to the cap. Overnight, the price of ETH falls by{" "}
        {(CRASH * 100).toFixed(0)}%.
      </Sub>

      <SetupGrid>
        <SetupCard
          name="Ana"
          color="#5ba88a"
          stats={[
            { label: "Deposited", value: money(DEPOSIT) },
            { label: "Borrowed", value: money(CAREFUL), color: "#5ba88a" },
            { label: "LTV", value: `${((CAREFUL / DEPOSIT) * 100).toFixed(0)}%`, color: "#a8adb6" },
          ]}
        />
        <SetupCard
          name="Ben"
          color="#f5c09a"
          stats={[
            { label: "Deposited", value: money(DEPOSIT) },
            { label: "Borrowed", value: money(BOLD), color: "#f5c09a" },
            { label: "LTV", value: `${((BOLD / DEPOSIT) * 100).toFixed(0)}%`, color: "#a8adb6" },
          ]}
        />
      </SetupGrid>

      <Panel>
        <Question>What happens to the two positions?</Question>
        <div className={own.options}>
          {OUTCOMES.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`${own.option} ${pick === o.id ? own.optionOn : ""}`}
              onClick={() => setPick(o.id)}
              disabled={revealed}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Panel>

      {!revealed ? (
        <Actions aside="Guessing is free here. The graded question comes at the end.">
          <Primary onClick={() => setRevealed(true)} disabled={!pick}>
            Check my answer
          </Primary>
        </Actions>
      ) : (
        <Reveal
          title="Neither. The price fall changed nothing for either of them."
          onNext={onDone}
          nextLabel="See why, and what does matter"
        >
          <Body>
            {pick === "neither"
              ? "You had it, and it is the answer people find hardest to believe. "
              : "Almost everyone picks Ben, because that is how every other lending protocol works. "}
            Ana and Ben deposited ETH and borrowed alETH. When the price of ETH falls, the
            value of what they hold falls, and so does the value of what they owe. By the
            same amount, at the same moment.
          </Body>
          <Body>
            Their ratio is unchanged, so there is nothing to liquidate. It works the same way
            for USDC and alUSD. The docs call this pairing like-kind.
          </Body>
        </Reveal>
      )}
    </Stage>
  );
}

/* ── Stage 2: try ────────────────────────────────────────── */

function Try({ onDone }) {
  const [startLtv, setStartLtv] = useState(60);
  const [pricePct, setPricePct] = useState(0);
  const [lossPct, setLossPct] = useState(0);
  const [touched, setTouched] = useState({ price: false, loss: false });
  const mark = (k) => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  // The price control is wired to nothing on purpose. A learner who drags it
  // expecting the bar to move, and watches it sit still, has learned the lesson
  // in a way no sentence achieves.
  const now = ltvAfterLoss(startLtv / 100, lossPct / 100) * 100;
  const liquidated = now > LIQ_LTV * 100;

  return (
    <Stage eyebrow="Stage 2 · Try" headline="One of these controls does nothing.">
      <Sub>
        Set a starting LTV, then try both. The bar shows where the position sits against
        the {(LIQ_LTV * 100).toFixed(0)}% threshold that would close it.
      </Sub>

      <div className={parts.meterWrap}>
        <div className={parts.meterHead}>
          <span className={styles.microLabel}>Loan to value now</span>
          <span
            className={parts.meterValue}
            style={{ color: liquidated ? "#d4952a" : "#e8e8ea" }}
          >
            {now > 200 ? "over 200" : now.toFixed(1)}%
          </span>
        </div>
        <div className={parts.meter}>
          <span
            className={parts.meterFill}
            style={{
              width: `${Math.min(now, 100)}%`,
              background: liquidated ? "#d4952a" : undefined,
            }}
          />
          <span className={parts.meterCap} style={{ left: `${MAX_LTV * 100}%` }} />
          <span className={parts.meterLiq} style={{ left: `${LIQ_LTV * 100}%` }} />
        </div>
        <div className={parts.meterKey}>
          <span>0%</span>
          <span className={parts.capMark}>
            Cap {(MAX_LTV * 100).toFixed(0)}% · Liquidation {(LIQ_LTV * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <Controls>
        <Control
          label="Starting LTV"
          display={`${startLtv}%`}
          min={10} max={90} step={1}
          value={startLtv}
          onChange={setStartLtv}
        />
        <Control
          label="Price of your collateral"
          display={`${pricePct > 0 ? "+" : ""}${pricePct}%`}
          min={-70} max={70} step={1}
          value={pricePct}
          onChange={(v) => { setPricePct(v); mark("price"); }}
          verdict={touched.price ? "no effect on the bar" : null}
        />
        <Control
          label="Loss inside the vault"
          display={`${lossPct}%`}
          min={0} max={40} step={1}
          value={lossPct}
          onChange={(v) => { setLossPct(v); mark("loss"); }}
          accent
          verdict={liquidated ? "threshold crossed" : null}
        />
      </Controls>

      <Notes>
        <Note label="The price control">
          Drag it as far as you like. The bar does not move, because your debt moved with
          your collateral. That is how the real position behaves.
        </Note>
        <Note label="The loss control">
          This is a loss inside the strategies your deposit is invested in, from something
          like an exploit or a strategy reporting a negative return. Your collateral is
          worth less while your debt is unchanged, so the ratio climbs.
        </Note>
        <Note label="If it does cross">
          Only the minimum needed to bring the position back to a healthy LTV is
          liquidated. The rest is untouched, and a fee vault covers any shortfall.
        </Note>
      </Notes>

      {touched.price && touched.loss ? (
        <Reveal
          title="One real risk, and most people arrive worried about a different one."
          onNext={onDone}
          nextLabel="Answer one question"
        >
          <Body>
            Price volatility cannot force an Alchemix position to close. A loss in the
            strategies holding your collateral can, and that is the risk worth reading about
            before you choose how much to borrow.
          </Body>
          <Body>
            The further you sit below the threshold, the larger a loss you can absorb.
            Choose your LTV with that in mind. The advanced track works out exactly how
            much room a given LTV buys you.
          </Body>
        </Reveal>
      ) : (
        <Hint>Try both of the lower controls to carry on.</Hint>
      )}
    </Stage>
  );
}
