import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { simpleCurve } from "../lib/model";
import { AppFixedCard, AppVaultCard, PracticeVault } from "../AppMock";
import { Body, ChoiceCheckpoint, LessonControl, Parts, Stages, Sub, Term } from "../kit";
import { Ask, Done, Ending, Next, Screen, Wait, useScreens } from "../Beginner";
import {
  EarmarkingTab, Facts, Formula, RateInputs, RedemptionsTab, STRATS, TAUGHT_ALL, VisualizerTab,
} from "../Intermediate";

/**
 * Intermediate lesson 4: The pace of repayment.
 *
 * Where the learner's 50% and 208 come from. The practice vault's figures
 * are built to give them: 250,000 alUSD waiting on a 4-month term is paid out
 * three times a year, 750,000, against a Total Debt of 1,500,000, which is
 * 50%. A month of payouts is 62,500, and the learner's 5,000 is 1 in 300 of
 * the Total Debt, so 208 is earmarked. Then twice the alUSD waiting (100%),
 * twice the Total Debt (25%), earmarking and the Earmarking tab, the
 * Redemptions tab, and the Visualizer's range at 12 months. Rewritten
 * 2026-11-06 from the lesson scripts. The two tabs are
 * described as borrowing-in-alchemix.md describes them.
 *
 * Earmarked is 0 until screen 6 explains the 208, and 208 from there on.
 * The Visualizer's Debt is `simpleCurve` at the slider's rate, read at 12
 * months and rounded down (3,883 at 25%, 3,000 at 50%, 1,759 at 100%).
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const WAITING = 250_000;
const MONTHS = 4;
const TOTAL = 1_500_000;
const rateOf = (waiting, totalDebt) => (waiting * (12 / MONTHS)) / totalDebt;
const firstMonth = (rate) => Math.round((BORROW * rate) / 12);
const EARMARKED = firstMonth(rateOf(WAITING, TOTAL));
const CARD = { apr: (0.02 / 0.98) * 3, price: "0.98 USDC", term: "4 Months", maturity: "Mar 04, 2027" };
const LEARN = "Stage 1 · Learn";
const TRY = "Stage 2 · Try";

const curve = (pct) =>
  simpleCurve({ collateral: DEPOSIT, debt: BORROW, yieldAnnual: 0, redemptionAnnual: pct / 100, months: 12 })
    .map((p) => ({ ...p, debt: Math.floor(p.debt) }));

export default function RateLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  return (
    <Stages
      stage={stage}
      render={{
        predict: () => <Learn onDone={() => onStage("explore")} />,
        explore: () => <Try onDone={() => onStage("checkpoint")} />,
        checkpoint: () => (
          <ChoiceCheckpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} passTitle="Lesson 4 complete." />
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
          <Screen eyebrow={LEARN} headline="Redemptions pay Fixed Yield depositors">
            <Sub>
              Your practice position starts this lesson on the day you borrowed, with 10,000 deposited,
              5,000 owed and the 50% Redemption Rate from the beginner track.
              Every <Term id="redemption">redemption</Term> pays a Fixed Yield depositor whose alUSD has
              come due, so how fast your loan is paid down depends on how much alUSD people have
              deposited on the <Term id="fixedYield">Fixed Yield</Term> page. That amount, deposited and
              not yet paid out, is the alUSD waiting. In this practice vault 250,000 alUSD is waiting, on
              a 4-month term. The card's Deposit Cap row shows the alUSD deposited on that term against
              its cap, here 250.0K of 2.4M.
            </Sub>
            <AppFixedCard {...CARD} cap="250.0K/2.4M alUSD" capFill={WAITING / 2_400_000} lit={["term", "cap"]} />
            <Facts items={[{ label: "alUSD waiting:", value: "250,000", on: true }]} />
            <Next onNext={() => go("s2")} />
          </Screen>
        ),
        s2: () => (
          <Screen eyebrow={LEARN} headline="Total Debt">
            <Sub>
              The other input is Total Debt, what every <Term id="loan">loan</Term> in the vault owes
              together, shown on the vault's card on the Borrow page. Redemptions are shared across all
              of it, so the more borrowers owe, the slower each loan is paid down. Here Total Debt is
              1,500,000, and your 5,000 is 1 in every 300 of it.
            </Sub>
            <AppVaultCard lit={["totalDebt"]} figures={{ debt: "$1,500,000" }} apr="5.00%" strategies={STRATS} />
            <Next onNext={() => go("s3")} onBack={() => go("s1")} />
          </Screen>
        ),
        s3: () => (
          <Screen eyebrow={LEARN} headline="Where 50% comes from">
            <Sub>
              A 4-month <Term id="term">term</Term> is a third of a year, so the alUSD waiting can be
              paid out three times a year, 750,000 in all, assuming the amount waiting, the term and Total
              Debt stay the same. The Redemption Rate compares that year of payouts with Total Debt.
            </Sub>
            <Formula text="Redemption Rate = alUSD waiting ÷ term in years ÷ Total Debt">
              750,000 ÷ 1,500,000 is 50%, the Redemption Rate in your position stats.
            </Formula>
            <RateInputs waiting={WAITING} months={MONTHS} totalDebt={TOTAL} rate={rateOf(WAITING, TOTAL)} lit={["waiting", "term", "totalDebt"]} />
            <Next onNext={onDone} onBack={() => go("s2")} />
          </Screen>
        ),
      }}
    />
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s4");
  const [added, setAdded] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [pct, setPct] = useState(25);
  const [seen, setSeen] = useState(() => new Set([25]));
  const waiting = added ? WAITING * 2 : WAITING;
  const ranged = seen.has(25) && seen.has(100);

  return (
    <Parts
      part={screen}
      render={{
        s4: () => (
          <Screen eyebrow={TRY} headline="More alUSD waiting">
            <Sub>
              Say alUSD falls to 0.94. A Fixed Yield deposit now returns more, so more people deposit on
              the Fixed Yield page. Press Add 250,000 waiting.
            </Sub>
            <RateInputs
              waiting={waiting} months={MONTHS} totalDebt={TOTAL} rate={rateOf(waiting, TOTAL)} lit={["waiting"]}
              prev={added ? { waiting: WAITING, totalDebt: TOTAL, rate: rateOf(WAITING, TOTAL) } : null}
            />
            <Facts items={[{ label: "First month pays off:", value: String(firstMonth(rateOf(waiting, TOTAL))), on: added }]} />
            <LessonControl onClick={() => setAdded(true)} disabled={added}>Add 250,000 waiting</LessonControl>
            {added ? (
              <Done title="Your Redemption Rate doubled, to 100%" onNext={() => go("s5")}>
                <Body>
                  Twice the <Term id="alusdWaiting">alUSD waiting</Term> pays off twice as much each
                  year, so your first month would pay off 417 instead of 208.
                </Body>
                <Body>
                  A lower alUSD price typically brings more Fixed Yield deposits, which is why the rate
                  often rises when the price falls. Lesson 6 covers the price side of this.
                </Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s5: () => (
          <Screen eyebrow={TRY} headline="More borrowers">
            <Sub>
              With the alUSD waiting back at 250,000, new loans add 1,500,000 to the vault,
              so <Term id="totalDebt">Total Debt</Term> is now 3,000,000.
            </Sub>
            <RateInputs
              waiting={WAITING} months={MONTHS} totalDebt={TOTAL * 2} rate={rateOf(WAITING, TOTAL * 2)}
              lit={["totalDebt"]} blank={!answered}
            />
            <Ask
              prompt="What is the Redemption Rate now?"
              options={["25%", "50%", "100%"]}
              correct={0}
              fact="25%. The same 750,000 a year of payouts is shared across twice the debt, so each loan is paid down half as fast."
              onShow={() => setAnswered(true)}
              onNext={() => go("s6")}
              onBack={() => go("s4")}
            />
          </Screen>
        ),
        s6: () => (
          <Screen eyebrow={TRY} headline="Earmarking">
            <Sub>
              Earmarking is the vault reserving borrowers' debt for Fixed Yield deposits as they vest, a
              little every block until their <Term id="maturityDate">maturity date</Term>. Each time it
              earmarks, every loan has the same share of its unearmarked debt reserved, so a larger loan
              has more of its debt reserved. A month of payouts here is 62,500 (750,000 ÷ 12), and your
              share is 1 in 300, or 208. That is your <Term id="earmarked">Earmarked</Term> stat, the same
              208 the beginner track showed. The Earmarking tab charts the yearly rate at which the vault's
              debt has been earmarked over the last 30 days.
            </Sub>
            <PracticeVault
              apr={0.05} redemptionRate={rateOf(WAITING, TOTAL)} deposit={DEPOSIT} debt={BORROW}
              earmarked={EARMARKED} taught={TAUGHT_ALL} health lit={["earmarked"]} barLit={["earmarked"]}
            />
            <EarmarkingTab />
            <Next onNext={() => go("s7")} onBack={() => go("s5")} />
          </Screen>
        ),
        s7: () => (
          <Screen eyebrow={TRY} headline="The deposit behind it keeps earning">
            <Sub>
              The redemption settles when the Fixed Yield depositor presses <Term id="claim">Claim</Term>,
              which they can do on the maturity date or any time after it. Until then, the deposit behind
              your 208 of earmarked debt stays in your vault and keeps earning for you. The Redemptions
              tab lists the redemptions due over the next three months, along with what redemptions paid
              off over the last 30 days. When the amounts due shrink from month to month, fewer redemptions
              are on the way, so expect your loan to be paid down more slowly.
            </Sub>
            <RedemptionsTab />
            <Next onNext={() => go("s8")} onBack={() => go("s6")} />
          </Screen>
        ),
        s8: () => (
          <Screen eyebrow={TRY} headline="The Visualizer draws a range">
            <Sub>
              Since the rate moves with all three inputs, the Visualizer tab projects
              your <Term id="loan">loan</Term> at a Redemption % you choose. Drag Redemption % from 25% to
              100%, half and double this vault's rate, and read Debt at 12 months.
            </Sub>
            <VisualizerTab
              pct={pct}
              curve={curve}
              ghosts={ranged ? [25, 100].filter((g) => g !== pct) : []}
              onPct={(v) => {
                setPct(v);
                setSeen((s) => (s.has(v) ? s : new Set([...s, v])));
              }}
            />
            {ranged ? (
              <Done title="After a year you owe between 1,759 and 3,883" onNext={onDone} onBack={() => go("s7")}>
                <Body>
                  The real rate moves with the alUSD waiting, the term and Total Debt, so a single
                  projection is rarely exact. Reading Debt at half and double the rate gives you a range to
                  plan with.
                </Body>
                <Ending
                  inApp="Borrow page, the vault card's Total Debt. Then your vault: the Earmarked and Redemption Rate stats, and the Earmarking, Redemptions and Visualizer tabs."
                  caveat="250,000, 1,500,000 and 50% are examples. The live rate moves every day."
                />
              </Done>
            ) : (
              <Wait onBack={() => go("s7")} />
            )}
          </Screen>
        ),
      }}
    />
  );
}
