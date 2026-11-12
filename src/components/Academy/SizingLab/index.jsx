import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import own from "../Intermediate/styles.module.css";
import { apiBase } from "../lib/api";
import { Body, ChoiceCheckpoint, Parts, Stages, Sub, Term, money } from "../kit";
import { Ask, Done, Ending, Next, Screen, Wait, useScreens } from "../Beginner";
import { CashBox, Facts, Formula, LtvBar, People, PersonCard, SizingBox, Stats, sizeFor } from "../Intermediate";

/**
 * Intermediate lesson 7: Sizing a position.
 *
 * Working back from the cash you need to the smallest deposit that gets it
 * safely: the Debt is cash ÷ alUSD price, the loss you plan for sets the
 * deposit, Deposit = cash ÷ (price × 90% × (1 − loss)). Sizing aims for 90%
 * after the loss, as lesson 5 does, so the position ends at MAX LTV with 5
 * points left before the liquidation line (sizing to
 * 95% left the "safe" deposit liquidatable at the planned loss). The sizing
 * box is the typed number box and a one-line formula.
 * Then the price on the day you borrow, and Ana and Ben planning for
 * different losses. Rewritten 2026-11-06 from
 * the lesson scripts.
 *
 * 4,900 at 0.98 is 5,000 of Debt; at a 60% loss the smallest deposit is
 * 5,000 ÷ 0.36, 13,889 (LTV 36%, Health Factor 2.50). At 0% it is Debt ÷ 0.9,
 * 5,556 (LTV 90%). At 0.94 the Debt is about 5,213 and the deposit 14,480.
 * Ana (9,800, 60%) needs 27,778 (LTV 36%) and Ben (9,800, 30%) 15,873
 * (LTV 63%), about 11,900 apart.
 */

const CASH = 4_900;
const PRICE = 0.98;
const LOSS = 0.6;
const LEARN = "Stage 1 · Learn";
const TRY = "Stage 2 · Try";

export default function SizingLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  return (
    <Stages
      stage={stage}
      render={{
        predict: () => <Learn onDone={() => onStage("explore")} />,
        explore: () => <Try onDone={() => onStage("checkpoint")} />,
        checkpoint: () => (
          <ChoiceCheckpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} passTitle="Lesson 7 complete." />
        ),
      }}
    />
  );
}

function Learn({ onDone }) {
  const [screen, go] = useScreens("s1");
  return (
    <Parts
      part={screen}
      render={{
        s1: () => (
          <Screen eyebrow={LEARN} headline="Start from the cash you need">
            <Sub>
              Sizing a <Term id="position">position</Term> is working back from the cash you need to the
              smallest <Term id="deposit">deposit</Term> that gets it safely. Most borrowers swap their alUSD for USDC, so the first step is the Debt it takes to
              end up with that cash at today's alUSD price.
            </Sub>
            <Formula text="Debt = cash ÷ alUSD price">You wanted 4,900 in USDC at 0.98, so 5,000 of Debt.</Formula>
            <Stats items={[{ label: "Cash", value: "4,900 USDC" }, { label: "Debt", value: "5,000 alUSD", on: true }]} />
            <Next onNext={() => go("s2")} />
          </Screen>
        ),
        s2: () => (
          <Screen eyebrow={LEARN} headline="Then the loss you want to survive">
            <Sub>
              Next, choose the loss you want your position to survive. After that loss your Deposit is
              Deposit × (1 − loss), so your LTV is your Debt divided by what is left. Lesson 5 planned for
              60%, the worst loss the <Term id="cap">caps</Term> allow, and aimed for 90% after it. Sizing
              does the same. At 90% you are at MAX LTV after the loss, with 5 points left before anyone
              can liquidate you.
            </Sub>
            <LtvBar lit={["max"]} />
            <Facts items={[{ label: "Loss", value: "60%", on: true }]} />
            <Next onNext={onDone} onBack={() => go("s1")} />
          </Screen>
        ),
      }}
    />
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s3");
  // S3: the cash, typed.
  const [cash, setCash] = useState(CASH);
  const [typed, setTyped] = useState(false);
  // S4: the loss, down to 0%.
  const [loss4, setLoss4] = useState(LOSS);
  const [atZero, setAtZero] = useState(false);
  // S5: the price falls to 0.94.
  const [answered, setAnswered] = useState(false);
  // S6: Ana and Ben.
  const [cash6, setCash6] = useState(CASH);
  const [ana, setAna] = useState(0.5);
  const [ben, setBen] = useState(0.5);
  const set6 = cash6 === 9_800 && Math.round(ana * 100) === 60 && Math.round(ben * 100) === 30;

  return (
    <Parts
      part={screen}
      render={{
        s3: () => (
          <Screen eyebrow={TRY} headline="The smallest deposit">
            <Sub>Put the two steps together into one formula.</Sub>
            <Formula text="Deposit = cash ÷ (price × 90% × (1 − loss))" />
            <Sub>
              The sizing tool starts at 4,900 of cash, with the price at 0.98 and the loss at 60%.
              Type the cash you need in the Cash field.
            </Sub>
            <SizingBox
              cash={cash} price={PRICE} loss={LOSS}
              onCash={(v) => {
                setCash(v);
                setTyped(true);
              }}
            />
            {typed && cash > 0 ? (
              // The title follows the typed cash: 9,800 reads "27,778 is the smallest deposit for 9,800".
              <Done title={`${money(sizeFor(cash, PRICE, LOSS).deposit)} is the smallest deposit for ${money(cash)}`} onNext={() => go("s4")}>
                <Body>
                  Your <Term id="ltv">LTV</Term> starts at 36%, the same LTV lesson 5 found. After a 60%
                  loss it would be 90%, at MAX LTV and still short of the <Term id="liqLtv">LIQ LTV</Term> line
                  at 95%.
                </Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s4: () => (
          <Screen eyebrow={TRY} headline="With no loss planned, MAX LTV sets the size">
            <Sub>Now drag the Loss slider down to 0%.</Sub>
            <SizingBox
              cash={CASH} price={PRICE} loss={loss4}
              onLoss={(v) => {
                setLoss4(v);
                if (v === 0) setAtZero(true);
              }}
            />
            {atZero ? (
              <Done title="The sizing tool shows 5,556" onNext={() => go("s5")} onBack={() => go("s3")}>
                <Body>
                  Alchemix lends up to 90% LTV, so with no loss planned the formula gives Debt ÷ 0.9,
                  which is 5,556 for 5,000 of Debt. That is the smallest deposit a 5,000 loan can have, and
                  it leaves no room for a loss.
                </Body>
              </Done>
            ) : (
              <Wait onBack={() => go("s3")} />
            )}
          </Screen>
        ),
        s5: () => (
          <Screen eyebrow={TRY} headline="The price on the day you borrow">
            <Sub>The sizing tool is set to 4,900 of cash and a 60% loss again.</Sub>
            <SizingBox
              cash={CASH} price={0.94} priceWas={PRICE} loss={LOSS}
              hold={answered ? null : sizeFor(CASH, PRICE, LOSS)}
            />
            <Ask
              prompt="alUSD falls to 0.94 the day you borrow. What happens to the deposit you need?"
              options={["It rises", "It falls", "It stays 13,889"]}
              correct={0}
              fact="It rises, to 14,480. At 0.94 you have to borrow about 5,213 alUSD to get the same 4,900 USDC, and more Debt needs more deposit to survive the same loss."
              onShow={() => setAnswered(true)}
              onNext={() => go("s6")}
              onBack={() => go("s4")}
            />
          </Screen>
        ),
        s6: () => (
          <Screen eyebrow={TRY} headline="Ana and Ben plan for different losses">
            <Sub>
              Ana and Ben each need 9,800 of cash at 0.98, so each will owe 10,000. Ana plans for a 60%
              loss, while Ben plans for 30%. Type 9,800 in the Cash field, then set the Loss slider for each.
            </Sub>
            <div className={own.sizing}>
              <CashBox cash={cash6} onCash={setCash6} />
            </div>
            <People>
              <PersonCard name="Ana">
                <SizingBox cash={cash6} price={PRICE} loss={ana} onLoss={setAna} lossLabel="Ana's loss" cashless compact />
              </PersonCard>
              <PersonCard name="Ben">
                <SizingBox cash={cash6} price={PRICE} loss={ben} onLoss={setBen} lossLabel="Ben's loss" cashless compact />
              </PersonCard>
            </People>
            {set6 ? (
              <Done title="Ana needs 27,778 and Ben needs 15,873" onNext={onDone} onBack={() => go("s5")}>
                <Body>
                  For the same cash, Ana's plan needs about 11,900 more deposit, which buys her room for
                  twice the loss. Ben starts at 63% LTV, so a 30% loss would take him to 90%, and a loss past
                  about 34% could get him liquidated.
                </Body>
                <Ending
                  inApp="Borrow page, your vault: the Borrow tab and the position stats. The sizing tool belongs to this course, so work the formula out yourself before you borrow in the app."
                  caveat="0.98 and these losses are examples. The alUSD price on the day you borrow sets your Debt."
                />
              </Done>
            ) : (
              <Wait onBack={() => go("s5")} />
            )}
          </Screen>
        ),
      }}
    />
  );
}
