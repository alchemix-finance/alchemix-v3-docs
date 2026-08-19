import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { LIQ_LTV, MAX_LTV, ltvAfterLoss, survivableLtv, survivesLoss } from "../lib/protocol";
import {
  Actions, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel,
  Primary, Question, Readout, Reveal, Stage, Sub,
} from "../kit";

/**
 * Lesson 5: LTV and what can go wrong.
 *
 * The misconception this exists to break is the one imported from every other
 * lending protocol: that a price crash liquidates you. It cannot here, because
 * debt and collateral are like-kind and move together.
 *
 * So the lesson applies a brutal price crash first and shows nothing happening,
 * which is the surprise, then applies a much smaller loss of MYT backing and
 * shows a position failing. Same LTV, two very different threats.
 */

const SAFE_LTV = 0.3;
const RISKY_LTV = 0.85;
const PRICE_CRASH = 0.4;
const MYT_LOSS = 0.12;

const pct = (n) => `${(n * 100).toFixed(1)}%`;

export default function RiskLab({ lessonId, stage, onStage, done, onComplete }) {
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
      headline="Find the surviving LTV."
      unit="pct"
      targetOf={(f) => survivableLtv(f.loss) * 100}
      computeOf={(f, v) => v}
      controlLabel="Starting LTV"
      controlDisplay={(v) => `${v.toFixed(1)}%`}
      targetFoot="the highest LTV that survives"
      landingFoot="set the slider to your answer"
      passTitle="Lesson 5 complete."
      passBody="You can size a position against the only thing that can actually close it. That is the number the risk caps in lesson 3 were protecting, and the capstone puts both to work."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

function Predict({ onDone }) {
  const [guess, setGuess] = useState("both");
  const [stage2, setStage2] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline="Two positions, and a very bad day for the collateral price."
    >
      <Sub>
        Ana is at {pct(SAFE_LTV)} LTV. Ben is at {pct(RISKY_LTV)}, close to the{" "}
        {pct(MAX_LTV)} borrowing cap. Overnight the price of the deposited asset falls by{" "}
        {pct(PRICE_CRASH)}.
      </Sub>

      <div className={own.pair}>
        <PositionCard name="Ana" ltv={SAFE_LTV} color="#5ba88a" />
        <PositionCard name="Ben" ltv={RISKY_LTV} color="#f5c09a" />
      </div>

      {!revealed ? (
        <>
          <Panel>
            <Question>Which of them gets liquidated?</Question>
            <div className={own.choices}>
              {[
                ["ben", "Ben only"],
                ["both", "Both of them"],
                ["neither", "Neither of them"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${own.choice} ${guess === id ? own.choiceOn : ""}`}
                  onClick={() => setGuess(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </Panel>
          <Actions>
            <Primary onClick={() => setRevealed(true)}>Commit and run the crash</Primary>
          </Actions>
        </>
      ) : (
        <>
          <div className={own.outcome}>
            <OutcomeRow name="Ana" text="Untouched. Debt and collateral fell together." ok />
            <OutcomeRow name="Ben" text="Untouched. Debt and collateral fell together." ok />
          </div>

          <Reveal title="Neither. A price move cannot liquidate an Alchemix position.">
            <Body>
              {guess === "neither"
                ? "You called it. "
                : "Most people expect at least Ben to go. "}
              alETH is backed by ETH and alUSD by USDC, so when the collateral falls the
              debt denominated in it falls by exactly as much. The ratio between them does
              not move, and a ratio that does not move cannot cross a threshold.
            </Body>
            <Body>
              Hitting the {pct(MAX_LTV)} cap stops further borrowing. It does not close
              anything, and the collateral underneath keeps earning.
            </Body>
          </Reveal>

          {!stage2 ? (
            <Actions aside="Same two positions, a different kind of bad day.">
              <Primary onClick={() => setStage2(true)}>Now try something else</Primary>
            </Actions>
          ) : (
            <>
              <div className={own.outcome}>
                <OutcomeRow
                  name="Ana"
                  text={`LTV moves to ${pct(ltvAfterLoss(SAFE_LTV, MYT_LOSS))}. Still far from the threshold.`}
                  ok
                />
                <OutcomeRow
                  name="Ben"
                  text={`LTV moves to ${pct(ltvAfterLoss(RISKY_LTV, MYT_LOSS))}, past the ${pct(LIQ_LTV)} threshold. Liquidated.`}
                  ok={survivesLoss(RISKY_LTV, MYT_LOSS)}
                />
              </div>

              <Reveal
                title={`A ${pct(MYT_LOSS)} loss inside the MYT does what a ${pct(PRICE_CRASH)} crash could not.`}
                onNext={onDone}
                nextLabel="Find where the line sits"
              >
                <Body>
                  This is the threat that is real. If a strategy inside the vault reports a
                  loss, the backing behind every position falls, and the liquidation
                  marker slides towards you. Nothing about the price of ETH or USDC is
                  involved.
                </Body>
                <Body>
                  Ana absorbed it with room to spare. Ben had almost none, which is what a
                  high LTV actually costs you: not exposure to the market, exposure to the
                  vault.
                </Body>
              </Reveal>
            </>
          )}
        </>
      )}
    </Stage>
  );
}

function PositionCard({ name, ltv, color }) {
  return (
    <div className={own.position}>
      <div className={own.positionName} style={{ color }}>{name}</div>
      <div className={own.positionLtv}>{pct(ltv)}</div>
      <div className={styles.statLabel}>starting LTV</div>
    </div>
  );
}

function OutcomeRow({ name, text, ok }) {
  return (
    <div className={own.outcomeRow}>
      <span className={ok ? own.badgeOk : own.badgeBad}>{ok ? "Survives" : "Liquidated"}</span>
      <span className={own.outcomeName}>{name}</span>
      <span className={own.outcomeText}>{text}</span>
    </div>
  );
}

/* ── Stage 2: explore ────────────────────────────────────── */

function Explore({ onDone }) {
  const [ltv, setLtv] = useState(0.6);
  const [loss, setLoss] = useState(0.1);
  const [seenFail, setSeenFail] = useState(false);
  const [moved, setMoved] = useState({ ltv: false, loss: false });
  const mark = (k) => setMoved((m) => (m[k] ? m : { ...m, [k]: true }));

  const after = ltvAfterLoss(ltv, loss);
  const survives = survivesLoss(ltv, loss);
  const ceiling = survivableLtv(loss);

  React.useEffect(() => {
    if (!survives) setSeenFail(true);
  }, [survives]);

  const atCeiling = Math.abs(ltv - ceiling) < 0.002;

  return (
    <Stage
      eyebrow="Stage 2 · Explore"
      headline="Every loss has an LTV that survives it."
    >
      <Sub>
        Set a starting LTV and a loss of backing. The bar shows where the position lands,
        against the {pct(LIQ_LTV)} threshold that closes it.
      </Sub>

      <div className={own.healthWrap}>
        <div className={own.healthHead}>
          <span className={styles.microLabel}>LTV after the loss</span>
          <span className={own.healthValue} style={{ color: survives ? "#5ba88a" : "#d4645a" }}>
            {after > 5 ? "over 500%" : pct(after)}
          </span>
        </div>
        <div className={own.health}>
          <span
            className={own.healthFill}
            style={{
              width: `${Math.min(after * 100, 100)}%`,
              background: survives ? "linear-gradient(90deg,#5ba88a,#f5c09a)" : "#d4645a",
            }}
          />
          <span className={own.healthMark} style={{ left: `${MAX_LTV * 100}%`, background: "rgba(245,192,154,0.5)" }} />
          <span className={own.healthMark} style={{ left: `${LIQ_LTV * 100}%`, background: "#d4645a" }} />
        </div>
        <div className={own.healthKey}>
          <span>Started at {pct(ltv)}</span>
          <span className={own.liqMark}>Liquidation at {pct(LIQ_LTV)}</span>
        </div>
      </div>

      <Controls>
        <Control
          label="Starting LTV"
          display={pct(ltv)}
          min={0.05} max={0.9} step={0.005}
          value={ltv}
          onChange={(v) => { setLtv(v); mark("ltv"); }}
          tone={survives ? undefined : "#d4645a"}
        />
        <Control
          label="Loss of MYT backing"
          display={pct(loss)}
          min={0} max={0.4} step={0.005}
          value={loss}
          onChange={(v) => { setLoss(v); mark("loss"); }}
          accent
          verdict={survives ? "position survives" : "position is liquidated"}
        />
      </Controls>

      <Readout>
        At a {pct(loss)} loss, the highest starting LTV that survives is{" "}
        <strong>{pct(ceiling)}</strong>.
      </Readout>

      {seenFail || (moved.ltv && moved.loss) ? (
        <Reveal
          title="The threshold divided by what is left of the backing."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            A loss of {pct(loss)} leaves {pct(1 - loss)} of the collateral standing behind
            the same debt. The position survives while the debt still sits under{" "}
            {pct(LIQ_LTV)} of what remains, which puts the ceiling at {pct(LIQ_LTV)} of{" "}
            {pct(1 - loss)}, or {pct(ceiling)}.
          </Body>
          <Body>
            This is what the risk caps in lesson 3 were doing. By limiting how much of the
            vault can sit in higher risk strategies, the DAO limits how large a loss is
            plausible, which is what makes a given LTV a reasonable choice rather than a
            guess.
          </Body>
          <Body>
            Only the minimum needed to restore a healthy ratio is liquidated. The rest of
            the position stays open and keeps earning.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls. Push the LTV up until the position fails.</Hint>
      )}
    </Stage>
  );
}
