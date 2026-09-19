import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "../lesson.module.css";
import own from "./styles.module.css";
import { apiBase } from "../lib/api";
import { LIQ_LTV, MAX_LTV, ltvAfterLoss, survivableLtv, survivesLoss } from "../lib/protocol";
import {
  Actions, AppShot, Body, Checkpoint, Control, Controls, GuessSlider, Hint, Panel, Primary,
  Question, Readout, Reveal, SHOTS, Stage, Sub,
} from "../kit";

/**
 * Intermediate lesson 5: choosing an LTV.
 *
 * The misconception this exists to break is the one imported from every other
 * lending protocol: that a price crash liquidates you. It cannot here, because
 * debt and collateral are like-kind and move together.
 *
 * The lesson applies a large price crash first and shows nothing happening, then
 * applies a much smaller loss of MYT backing and shows a position failing. Same
 * LTV, two very different threats.
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
      passTitle="Lesson 5 complete."
      passBody="A loss inside the Mix-Yield Token is the only thing that can push a position past the threshold. Every loss has a highest starting LTV that survives it, and the DAO's risk caps bound how large a loss is plausible."
    />
  );
}

/* ── Stage 1: predict ────────────────────────────────────── */

/**
 * Stage 1: predict.
 *
 * This used to open by asking which of two positions a price crash liquidates,
 * which is the question the beginner track's fifth lesson opens with and
 * answers. Anyone arriving here in order had answered it twice by the time they
 * reached the explore stage.
 *
 * So the price crash is now the contrast rather than the question: the lesson
 * asks the harder one first, which of the two survives a loss of backing, and
 * runs the crash afterwards to show what the other kind of shock does. A
 * learner who skipped the beginner track still meets both, in one sitting.
 */
/** The three answers, in the order the panel offers them. */
const PICKS = [
  ["ben", "Ben only"],
  ["both", "Both of them"],
  ["neither", "Neither of them"],
];

function Predict({ onDone }) {
  // Starts empty rather than on an answer. A pre-selected option is one the
  // reveal would have to credit the learner with, and they never chose it.
  const [guess, setGuess] = useState(null);
  const [stage2, setStage2] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <Stage
      eyebrow="Stage 1 · Predict"
      headline="A strategy inside the vault loses money."
    >
      <Sub>
        Ana borrowed to {pct(SAFE_LTV)} LTV. Ben went to {pct(RISKY_LTV)}, near the{" "}
        {pct(MAX_LTV)} borrowing cap. Neither has touched their position since. The MYT
        holding both deposits reports a {pct(MYT_LOSS)} loss of backing, and the price of
        the underlying asset has not moved at all.
      </Sub>

      <div className={own.pair}>
        <PositionCard name="Ana" ltv={SAFE_LTV} color="#5ba88a" />
        <PositionCard name="Ben" ltv={RISKY_LTV} color="#f5c09a" />
      </div>

      <AppShot shot={SHOTS.positionBar}>
        The two markers the cards above draw, on a real position. MAX LTV is where
        borrowing stops and LIQ LTV is the {pct(LIQ_LTV)} this lesson sizes against.
      </AppShot>

      {!revealed ? (
        <>
          <Panel>
            <Question>Which of them gets liquidated?</Question>
            <div className={own.choices}>
              {PICKS.map(([id, label]) => (
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
          <Actions aside={guess ? "Liquidation begins at 95% LTV." : "Pick one before the loss lands."}>
            <Primary onClick={() => setRevealed(true)} disabled={!guess}>
              Commit and apply the loss
            </Primary>
          </Actions>
        </>
      ) : (
        <>
          <div className={own.outcome}>
            <OutcomeRow
              name="Ana"
              text={`The LTV moves to ${pct(ltvAfterLoss(SAFE_LTV, MYT_LOSS))}, which is still well short of the threshold.`}
              ok
            />
            <OutcomeRow
              name="Ben"
              text={`The LTV moves to ${pct(ltvAfterLoss(RISKY_LTV, MYT_LOSS))}, past the ${pct(LIQ_LTV)} threshold, so enough collateral is sold to bring it back under the cap.`}
              ok={survivesLoss(RISKY_LTV, MYT_LOSS)}
            />
          </div>

          <Reveal title={`Ben only. A ${pct(MYT_LOSS)} loss of backing raises every LTV at once.`}>
            <Body>
              {guess === "ben"
                ? "You said Ben only, and that is where the loss lands. "
                : guess === "both"
                  ? "You said both of them. Ana survived it. "
                  : "You said neither of them. Ben was liquidated. "}
              When a strategy reports a loss, the backing behind every position falls and
              the same debt stands against less collateral. Your LTV rises while the price
              of ETH or USDC sits exactly where it was.
            </Body>
            <Body>
              Ana absorbed the loss with room to spare. Ben had almost none. The higher you
              borrow, the smaller the loss it takes to reach you, and that margin is what
              your starting LTV buys.
            </Body>
          </Reveal>

          {!stage2 ? (
            <Actions aside="Now the same two positions, with the shock coming from the market.">
              <Primary onClick={() => setStage2(true)}>Crash the price instead</Primary>
            </Actions>
          ) : (
            <>
              <div className={own.outcome}>
                <OutcomeRow name="Ana" text={`The asset falls ${pct(PRICE_CRASH)} and the LTV does not move.`} ok />
                <OutcomeRow name="Ben" text={`The asset falls ${pct(PRICE_CRASH)} and the LTV does not move.`} ok />
              </div>

              <Reveal
                title="A price crash reaches neither of them."
                onNext={onDone}
                nextLabel="Find the highest LTV that survives"
              >
                <Body>
                  alETH is backed by ETH and alUSD by USDC. When the collateral falls, the
                  debt denominated in it falls by exactly as much. The ratio between them
                  holds.
                </Body>
                <Body>
                  The market moves both sides of the position together, which is why it cannot liquidate you. A loss inside the vault moves the collateral side alone,
                  and that is the shock your LTV has to be sized against.
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
      headline="Every loss of backing has a highest LTV that survives it."
    >
      <Sub>
        The bar shows where the position sits against the {pct(LIQ_LTV)} threshold that
        closes it.
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

      <AppShot shot={SHOTS.healthFactor}>
        Health Factor states the same distance the other way up: the borrowing cap over your
        LTV, so 3.00 is a position at 30% against a 90% cap, and it falls as you borrow.
      </AppShot>

      {seenFail || (moved.ltv && moved.loss) ? (
        <Reveal
          title="A loss shrinks your collateral, and the 95% threshold applies to what is left."
          onNext={onDone}
          nextLabel="Take the checkpoint"
        >
          <Body>
            A loss of {pct(loss)} leaves {pct(1 - loss)} of the collateral behind
            the same debt. The position survives while the debt still sits under{" "}
            {pct(LIQ_LTV)} of what remains, which puts the ceiling at {pct(LIQ_LTV)} of{" "}
            {pct(1 - loss)}, or {pct(ceiling)}.
          </Body>
          <Body>
            The risk caps inside the Mix-Yield Token bound this number. At most 20% of the
            vault can sit in Aggressive strategies and at most 60% in Moderate and Aggressive
            together, which is what gives you a worst case to size against.
          </Body>
          <Body>
            Even then, the protocol liquidates only enough to restore a healthy ratio. The
            rest of the position stays open and keeps earning.
          </Body>
        </Reveal>
      ) : (
        <Hint>Move both controls. Push the LTV up until the position fails.</Hint>
      )}
    </Stage>
  );
}
