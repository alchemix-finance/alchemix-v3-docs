import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { AppInfoTable, PracticeVault } from "../AppMock";
import { Body, ChoiceCheckpoint, LessonControl, Parts, Stages, Sub, Term } from "../kit";
import { Ask, Done, Ending, Next, Pair, Screen, Wait, useScreens } from "../Beginner";
import { CapTable, Facts, Formula, STRATS, TAUGHT_ALL } from "../Intermediate";

/**
 * Intermediate lesson 1: Inside the Mix-Yield Token.
 *
 * The practice vault's Info tab with Strategy A, B and C (Conservative 60%,
 * Moderate 30%, Aggressive 10%): who picks the strategies, the 15%
 * performance fee, the three Risk Levels and their caps, then Strategy C
 * losing half its value, and the worst case in this vault. Rewritten
 * 2026-11-06 from the lesson scripts. The practice vault
 * shows the 50% Redemption Rate the rest of the course uses.
 *
 * The day you borrowed: Deposit 10,000, Debt 5,000. Health Factor stays
 * dimmed until lesson 2. A 5% APR paid 500 in a year, so before the 15% fee
 * the strategies earned 500 ÷ 0.85, about 588. Strategy C's loss is 10% ×
 * half, 5% of the vault: Deposit 9,500, LTV 52.6%, in the app's red.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const LOSS = 0.1 * 0.5;
const VAULT = { apr: 0.05, redemptionRate: 0.5, debt: BORROW, taught: TAUGHT_ALL };
const AT_START = { deposit: DEPOSIT, debt: BORROW };
const LEARN = "Stage 1 · Learn";
const TRY = "Stage 2 · Try";

export default function StrategyLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  return (
    <Stages
      stage={stage}
      render={{
        predict: () => <Learn onDone={() => onStage("explore")} />,
        explore: () => <Try onDone={() => onStage("checkpoint")} />,
        checkpoint: () => (
          <ChoiceCheckpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} passTitle="Lesson 1 complete." />
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
          <Screen eyebrow={LEARN} headline="The DAO picks the strategies">
            <Sub>
              This track goes one level deeper into the position you built in the beginner track. Your
              practice position starts this lesson on the day you borrowed, with 10,000 deposited and
              5,000 owed. Your deposit is held as <Term id="myt">MYT</Term>, the Mix-Yield Token, a vault
              token built on Morpho Vaults V2 that holds every depositor's USDC and routes it into
              several <Term id="strategy">strategies</Term>. Each MYT is a share of the whole vault, so your
              deposit earns what those strategies earn. The Alchemix DAO, which governs the protocol, picks
              the strategies
              your <Term id="vault">vault</Term> uses and how much of the vault goes to each. The Info
              tab's Allocation column shows those shares, which in this practice vault are 60%, 30% and
              10%.
            </Sub>
            <AppInfoTable strategies={STRATS} lit={["strategy", "allocation"]} />
            <Next onNext={() => go("s2")} />
          </Screen>
        ),
        s2: () => (
          <Screen eyebrow={LEARN} headline="The vault keeps 15% of what the strategies earn">
            <Sub>
              Before yield is added to the MYT price, the vault keeps a performance fee of 15% of what
              the strategies earn, which funds strategy maintenance and protocol development.
              The <Term id="apr">APR</Term> stat is what is left after the fee, so the 5% you earned in
              the beginner track already had the fee taken out. A year at 5% added 500 to your Deposit, which
              means the strategies earned about 588 and the vault kept about 88.
            </Sub>
            <PracticeVault {...VAULT} deposit={DEPOSIT} lit={["apr"]} />
            <Facts
              items={[
                { label: "Strategies earned", value: "588" },
                { label: "Performance fee", value: "88" },
                { label: "Your Deposit", value: "+500", on: true },
              ]}
            />
            <Next onNext={() => go("s3")} onBack={() => go("s1")} />
          </Screen>
        ),
        s3: () => (
          <Screen eyebrow={LEARN} headline="Each strategy has a Risk Level">
            <Sub>
              A strategy's code has to be covered by an independent audit before it can join a vault.
              The <Term id="dao">DAO</Term> then gives it a Risk Level, based on how money enters and
              leaves it, how it is priced and how long a withdrawal can take. A Conservative strategy is
              entered and exited through its own contract, takes its price from what it holds against the
              shares it has issued, and has no meaningful wait to withdraw. A Moderate strategy depends on
              a DEX to enter or exit, takes its price from an outside source, or can lock withdrawals for a
              period. An Aggressive strategy meets the Moderate criteria and
              carries one more risk, such as being newer or less proven.
            </Sub>
            <AppInfoTable strategies={STRATS} lit={["strategy", "risk"]} />
            <Next onNext={() => go("s4")} onBack={() => go("s2")} />
          </Screen>
        ),
        s4: () => (
          <Screen eyebrow={LEARN} headline="Caps limit the riskier strategies">
            <Sub>
              A cap is the most of a vault the <Term id="dao">DAO</Term> may put into one strategy or one
              Risk Level, which limits how much of every deposit the riskier strategies can put at
              risk. <Term id="aggressive">Aggressive</Term> strategies can hold at most 20% of a vault, in
              one strategy or in total. A <Term id="moderate">Moderate</Term> strategy can hold at most
              40%, and Moderate and Aggressive together at most 60%. <Term id="conservative">Conservative</Term> has
              no cap. The DAO checks the caps when it allocates, so withdrawals by other depositors can
              leave a share above its cap until the DAO rebalances.
            </Sub>
            <Pair>
              <CapTable />
              <AppInfoTable strategies={STRATS} lit={["strategy", "risk", "allocation"]} rows={["Strategy B", "Strategy C"]} />
            </Pair>
            <Next onNext={onDone} onBack={() => go("s3")} />
          </Screen>
        ),
      }}
    />
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s5");
  const [lost, setLost] = useState(false);

  return (
    <Parts
      part={screen}
      render={{
        s5: () => (
          <Screen eyebrow={TRY} headline="A strategy loses money">
            <Sub>
              Every deposit in a vault holds the same mix of strategies, so a loss in one strategy is
              shared by every depositor. Say Strategy C, which holds 10% of the vault, loses half its
              value. The vault falls by the strategy's share times its loss.
            </Sub>
            <Formula text="Vault loss = the strategy's share × its loss">
              {lost ? "10% × half = 5%" : null}
            </Formula>
            <Sub>Press Apply the loss.</Sub>
            <AppInfoTable strategies={STRATS} lit={["strategy", "risk", "allocation"]} rows={["Strategy C"]} />
            <PracticeVault
              {...VAULT}
              deposit={lost ? DEPOSIT * (1 - LOSS) : DEPOSIT}
              lit={["deposit", "debt", "ltv"]}
              prev={lost ? AT_START : null}
              chipTone="app"
            />
            <LessonControl onClick={() => setLost(true)} disabled={lost}>Apply the loss</LessonControl>
            {lost ? (
              <Done title="The vault lost 5%, and your Deposit is 9,500" onNext={() => go("s6")}>
                <Body>10% × half is 5%, so every deposit in the vault fell by 5%, yours included.</Body>
                <Body>
                  A loss inside the vault lowers deposits and leaves debt where it is. Your Debt stayed
                  5,000, so your <Term id="ltv">LTV</Term> rose to 53%. Every other borrower in the vault
                  saw their LTV rise by the same proportion.
                </Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s6: () => (
          <Screen eyebrow={TRY} headline="The worst case in this vault">
            <Sub>
              The loss above was a what-if, so the vault holds its usual shares again: Strategy B, which
              is Moderate, holds 30%, and Strategy C, which is Aggressive, holds 10%.
            </Sub>
            <Pair>
              <AppInfoTable strategies={STRATS} lit={["strategy", "risk", "allocation"]} rows={["Strategy B", "Strategy C"]} />
              <CapTable lit={["moderate", "aggressive"]} />
            </Pair>
            <Ask
              prompt="If every Moderate and Aggressive strategy here lost everything, how much would the vault lose?"
              options={["10%", "40%", "100%"]}
              correct={1}
              fact="This vault would lose 40%, since Moderate and Aggressive strategies hold 40% and Conservative strategies hold the other 60%. The caps let the DAO put up to 60% of any vault outside Conservative, so 60% is the most a vault could lose this way. Lesson 5 uses that 60% to choose an LTV that survives it."
              onNext={onDone}
              onBack={() => go("s5")}
              ending={
                <Ending
                  inApp="Borrow page, your vault, then the Info tab's Risk Level and Allocation columns. The Mixed Yield page shows the same list on each card."
                  caveat="These shares are an example. The DAO changes them, so check the Info tab before you deposit."
                />
              }
            />
          </Screen>
        ),
      }}
    />
  );
}
