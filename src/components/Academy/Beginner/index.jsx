import React, { useEffect, useRef, useState } from "react";
import own from "./styles.module.css";
import {
  Actions, Body, Caveat, Gate, GuessChoice, InApp, Panel, Primary, Question, Reveal, Stage,
  useStageActive, usePartScroll,
} from "../kit";

/**
 * The screen parts every beginner lesson is built from.
 *
 * The beginner track is written screen by screen in
 * the lesson scripts, and each screen has one shape: a
 * headline, a short body, one figure, then one action or one question, then
 * the reveal. The labs hold the words; these parts hold the shape, so a word
 * change is an edit to one string in one lab.
 *
 * - `useScreens(first)` keeps which screen of a stage is showing, and scrolls
 *   to the top when it changes (never from a hidden stage).
 * - `Next` is the way on from a Learn screen: one "Next", and the quiet
 *   "Back" on every screen after a stage's first.
 * - `Wait` is the same row before a Try screen's action: "Next" switched off.
 * - `Done` is a Try screen's reveal, brought into view when it opens.
 * - `Ask` is a question screen: three options, "Check my answer", and a
 *   reveal that opens "Right." or "Not quite." with the same fact after it.
 * - `Ending` is the lesson's "In the app" line and its caveat, the last two
 *   lines of the last screen before Check.
 */

/** Which tiles and markers each point in the track has taught, in order. */
const T_DEPOSIT = ["deposit"];
const T_APR = ["apr", "deposit"];
const T_DEBT = [...T_APR, "debt"];
const T_LTV = [...T_DEBT, "ltv"];
const T_MAX = [...T_LTV, "borrowable", "max", "health"];
const T_RATE = [...T_MAX, "redemption"];
const T_EARMARK = [...T_RATE, "earmarked"];
const T_LIQ = [...T_EARMARK, "liq"];

/**
 * What the practice vault may label, by the screen that taught it. Health
 * Factor joins with Borrowable: beginner lesson 3 says what it is (90% over
 * your LTV), so it reads from there on rather than sitting blank.
 */
export const TAUGHT = {
  /** Lesson 2, screen 2: the Deposit tile. */
  deposit: T_DEPOSIT,
  /** Lesson 2, screen 4 on: APR. */
  apr: T_APR,
  /** Lesson 3, screen 1 on: Debt. */
  debt: T_DEBT,
  /** Lesson 3, screen 3: LTV. */
  ltv: T_LTV,
  /** Lesson 3, screen 4 on: Borrowable and the MAX LTV marker. */
  max: T_MAX,
  /** Lesson 5, screen 2: the Redemption Rate. */
  rate: T_RATE,
  /** Lesson 5, screen 3 on: Earmarked. */
  earmarked: T_EARMARK,
  /** Lesson 7, screen 2 on: the LIQ LTV marker. */
  liq: T_LIQ,
};

export function useScreens(first) {
  const [screen, setScreen] = useState(first);
  usePartScroll(screen);
  return [screen, setScreen];
}

export function Screen({ eyebrow, headline, children }) {
  return (
    <Stage eyebrow={eyebrow} headline={headline}>
      {children}
    </Stage>
  );
}

export function Next({ onNext, onBack, children }) {
  return (
    <>
      <Actions onBack={onBack}>
        <Primary onClick={onNext}>Next</Primary>
      </Actions>
      {children}
    </>
  );
}

export function Wait({ onBack }) {
  return <Gate label="Next" onBack={onBack} />;
}

/**
 * Brings a reveal into view when it opens, since on a phone it sits under a
 * figure taller than the screen. Only from the stage on screen.
 */
function useIntoView(ref) {
  const active = useStageActive();
  useEffect(() => {
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (r.bottom > window.innerHeight || r.top < 0) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);
}

export function Done({ title, onNext, onBack, children }) {
  const ref = useRef(null);
  useIntoView(ref);
  return (
    <div ref={ref}>
      <Reveal title={title} onNext={onNext} nextLabel="Next" onBack={onBack}>
        {children}
      </Reveal>
    </div>
  );
}

/**
 * `onShow` runs when the reveal opens, for a figure that fills in with the
 * answer (the intermediate pace lesson's blank Redemption Rate).
 */
export function Ask({ prompt, options, correct, fact, onNext, onBack, ending = null, onShow = null }) {
  const [pick, setPick] = useState(null);
  const [shown, setShown] = useState(false);
  return (
    <>
      <Panel>
        <Question>{prompt}</Question>
        <GuessChoice
          label={prompt}
          options={options}
          value={pick}
          onChange={setPick}
          revealed={shown}
          correct={correct}
        />
      </Panel>
      {shown ? (
        <Done title={pick === correct ? "Right." : "Not quite."} onNext={onNext} onBack={onBack}>
          <Body>{fact}</Body>
          {ending}
        </Done>
      ) : (
        <Actions onBack={onBack}>
          <Primary
            onClick={() => {
              setShown(true);
              if (onShow) onShow();
            }}
            disabled={pick === null}
          >
            Check my answer
          </Primary>
        </Actions>
      )}
    </>
  );
}

export function Ending({ inApp, caveat = null }) {
  return (
    <>
      <InApp>{inApp}</InApp>
      {caveat ? <Caveat>{caveat}</Caveat> : null}
    </>
  );
}

/**
 * Two figures side by side on a wide screen, one over the other on a phone.
 * Side by side they share one height, so their top and bottom edges align.
 */
export function Pair({ children }) {
  return <div className={own.pair}>{children}</div>;
}
