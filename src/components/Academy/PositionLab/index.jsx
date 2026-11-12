import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { AppButton, AppInput, AppTokenPick, PracticeVault } from "../AppMock";
import { Body, ChoiceCheckpoint, Parts, Stages, Sub, Term } from "../kit";
import { Ask, Done, Ending, Next, Screen, Wait, useScreens } from "../Beginner";
import { Formula, LtvBar, Point, Points, TAUGHT_ALL } from "../Intermediate";

/**
 * Intermediate lesson 2: Reading your position.
 *
 * The day you borrowed (Deposit 10,000, Debt 5,000), with Health Factor lit
 * for the first time: what it is, what borrowing 2,500 more would do to it,
 * the bar's three parts, the most you can withdraw, how repaying frees
 * deposit, and how much to repay for a withdrawal you want. Rewritten
 * 2026-11-06 from the lesson scripts.
 *
 * Screens 2 and 4 teach the preview: typing an amount shows its effect on the
 * position stats before anything is pressed, and the field empties on Next.
 * While a loan is open the vault keeps Debt ÷ 0.9, so the Withdraw tab's
 * Available is 10,000 − 5,556, 4,444, and after repaying 900 it is 5,444.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const MORE = 2_500;
const REPAY = 900;
const WALLET = 4_900;
const kept = (debt) => Math.ceil(debt / 0.9);
const free = (deposit, debt) => deposit - kept(debt);
const VAULT = { apr: 0.05, redemptionRate: 0.5, deposit: DEPOSIT, taught: TAUGHT_ALL, health: true };
const AT_START = { deposit: DEPOSIT, debt: BORROW };
const LEARN = "Stage 1 · Learn";
const TRY = "Stage 2 · Try";

export default function PositionLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  return (
    <Stages
      stage={stage}
      render={{
        predict: () => <Learn onDone={() => onStage("explore")} />,
        explore: () => <Try onDone={() => onStage("checkpoint")} />,
        checkpoint: () => (
          <ChoiceCheckpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} passTitle="Lesson 2 complete." />
        ),
      }}
    />
  );
}

function Learn({ onDone }) {
  return (
    <Screen eyebrow={LEARN} headline="Health Factor">
      <Sub>
        Your practice position starts this lesson on the day you borrowed, with 10,000 deposited and
        5,000 owed. The beginner track covered every position stat here but one. Health Factor shows
        how far your <Term id="ltv">LTV</Term> sits from the 90% limit, as 90% divided by your LTV. At
        50% it reads 1.80, at <Term id="maxLtv">MAX LTV</Term> it reads 1.00, and with no Debt the app
        shows ∞. The closer it gets to 1.00, the less room you have to borrow or withdraw.
      </Sub>
      <PracticeVault {...VAULT} debt={BORROW} lit={["health"]} />
      <Next onNext={onDone} />
    </Screen>
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s2");
  // S2: 2,500 more, typed and never borrowed.
  const [more, setMore] = useState("");
  // S4: MAX on Withdraw, nothing withdrawn.
  const [peek, setPeek] = useState("");
  const [peekSeen, setPeekSeen] = useState(false);
  // S5: repay 900 with USDC, then MAX on Withdraw.
  const [token, setToken] = useState("alUSD");
  const [repay, setRepay] = useState("");
  const [paid, setPaid] = useState(false);
  const [after, setAfter] = useState("");
  const [afterSeen, setAfterSeen] = useState(false);

  const moreN = Number(more) || 0;
  const peekN = Number(peek) || 0;
  const debtPaid = BORROW - REPAY;

  return (
    <Parts
      part={screen}
      render={{
        s2: () => (
          <Screen eyebrow={TRY} headline="Borrowing more lowers it">
            <Sub>
              Say you want to borrow 2,500 more. In the app, typing an amount previews it on your position
              stats before you press anything. Type 2,500 in the alUSD field on the Borrow tab and read
              Health Factor.
            </Sub>
            <PracticeVault
              {...VAULT} debt={BORROW} tab="Borrow"
              preview={moreN > 0 ? { debt: BORROW + moreN } : undefined}
            >
              <AppInput
                token="alUSD" type="Available" amount={more} onChange={setMore}
                balance={DEPOSIT * 0.9 - BORROW} digits={0}
              />
              <AppButton disabled>Borrow</AppButton>
            </PracticeVault>
            {moreN === MORE ? (
              <Done
                title="Health Factor would fall to 1.20"
                onNext={() => {
                  // Nothing is borrowed: the box empties on Next.
                  setMore("");
                  go("s3");
                }}
              >
                <Body>
                  The extra 2,500 would take your Debt to 7,500 and your LTV to 75%. 90% ÷ 75% is 1.20.
                  Borrowing more always lowers Health Factor, moving you closer
                  to <Term id="maxLtv">MAX LTV</Term>.
                </Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s3: () => (
          <Screen eyebrow={TRY} headline="The health bar's three ranges">
            <Sub>The health bar's two markers, MAX LTV at 90% and LIQ LTV at 95%, split your LTV into three ranges, each allowing different actions.</Sub>
            <Points>
              <Point>
                Under 90%, with <Term id="healthFactor">Health Factor</Term> above 1.00, you can borrow
                and withdraw up to the 90% line.
              </Point>
              <Point>
                From 90% to 95%, with Health Factor from 1.00 down to about 0.95, the vault stops new
                borrowing and withdrawals. Your loan stays open, and your deposit keeps earning.
              </Point>
              <Point>Past 95%, with Health Factor under about 0.95, anyone can liquidate the position, taking only enough deposit to bring it back to 90%. Lesson 5 of this track covers what a liquidation takes.</Point>
            </Points>
            <LtvBar ltv={BORROW / DEPOSIT} zones />
            <Next onNext={() => go("s4")} onBack={() => go("s2")} />
          </Screen>
        ),
        s4: () => (
          <Screen eyebrow={TRY} headline="The most you can withdraw">
            <Sub>
              While you owe anything, the vault keeps enough deposit to hold
              your <Term id="ltv">LTV</Term> at 90% or under, which is your Debt divided by 0.9.
              Everything above that is yours to withdraw, and the Withdraw tab shows it as Available.
            </Sub>
            <Formula text="Available = Deposit − Debt ÷ 0.9">10,000 − 5,556 is 4,444.</Formula>
            <Sub>Press MAX on the Withdraw tab and read the preview.</Sub>
            <PracticeVault
              {...VAULT} debt={BORROW} tab="Withdraw"
              // At MAX the vault keeps exactly Debt ÷ 0.9, so the LTV previews 90%.
              preview={peekN > 0 ? { deposit: peekN === free(DEPOSIT, BORROW) ? BORROW / 0.9 : DEPOSIT - peekN } : undefined}
            >
              <AppInput
                token="USDC" type="Available" amount={peek} onChange={() => {}}
                balance={free(DEPOSIT, BORROW)} digits={0}
                onMax={() => {
                  setPeek(String(free(DEPOSIT, BORROW)));
                  setPeekSeen(true);
                }}
              />
              <AppButton disabled>Withdraw</AppButton>
            </PracticeVault>
            {peekSeen ? (
              <Done
                title="MAX fills 4,444, and Health Factor would be 1.00"
                onNext={() => {
                  // Nothing is withdrawn: the box empties on Next.
                  setPeek("");
                  go("s5");
                }}
                onBack={() => go("s3")}
              >
                <Body>Withdrawing the most you can puts your LTV exactly on the MAX LTV line, with no room left to borrow.</Body>
              </Done>
            ) : (
              <Wait onBack={() => go("s3")} />
            )}
          </Screen>
        ),
        s5: () => (
          <Screen eyebrow={TRY} headline="Repaying frees deposit">
            <Sub>Repaying lowers your Debt, so the vault needs to keep less deposit behind it. Pick USDC in the token picker on the Repay tab, type 900 in the field and press Repay. Then press MAX on the Withdraw tab.</Sub>
            {paid ? (
              <PracticeVault
                {...VAULT} debt={debtPaid} tab="Withdraw" prev={AT_START}
                preview={Number(after) > 0 ? { deposit: debtPaid / 0.9 } : undefined}
              >
                <AppInput
                  token="USDC" type="Available" amount={after} onChange={() => {}}
                  balance={free(DEPOSIT, debtPaid)} digits={0}
                  onMax={() => {
                    setAfter(String(free(DEPOSIT, debtPaid)));
                    setAfterSeen(true);
                  }}
                />
                <AppButton disabled>Withdraw</AppButton>
              </PracticeVault>
            ) : (
              <PracticeVault
                {...VAULT} debt={BORROW} tab="Repay"
                preview={token === "USDC" && Number(repay) > 0 ? { debt: BORROW - Number(repay) } : undefined}
              >
                <AppTokenPick tokens={["alUSD", "USDC", "MYT"]} value={token} onChange={setToken} />
                <AppInput
                  token={token} amount={repay} onChange={setRepay}
                  balance={token === "USDC" ? WALLET : 0} max={token === "USDC" ? WALLET : 0} digits={0}
                />
                <AppButton onClick={() => setPaid(true)} disabled={token !== "USDC" || Number(repay) !== REPAY}>
                  Repay
                </AppButton>
              </PracticeVault>
            )}
            {afterSeen ? (
              <Done
                title="Available rose by 1,000, to 5,444"
                onNext={() => {
                  // Nothing is withdrawn: the box empties on Next.
                  setAfter("");
                  go("s6");
                }}
                onBack={() => go("s4")}
              >
                <Body>
                  Repaying 900 freed 1,000 of deposit. The vault keeps 1 ÷ 0.9, about 1.11, of deposit for
                  each 1 you owe, so each 1 you <Term id="repay">repay</Term> frees about 1.11.
                </Body>
              </Done>
            ) : (
              <Wait onBack={() => go("s4")} />
            )}
          </Screen>
        ),
        s6: () => (
          <Screen eyebrow={TRY} headline="How much to repay?">
            <Sub>Your position is set back to Debt 5,000, with 4,444 Available on the Withdraw tab.</Sub>
            <PracticeVault {...VAULT} debt={BORROW} tab="Withdraw">
              <AppInput token="USDC" type="Available" amount={String(free(DEPOSIT, BORROW))} balance={free(DEPOSIT, BORROW)} digits={0} />
              <AppButton disabled>Withdraw</AppButton>
            </PracticeVault>
            <Ask
              prompt="You want to withdraw 2,000 more than 4,444. How much should you repay first?"
              options={["2,000", "1,800", "2,222"]}
              correct={1}
              fact="Repay 1,800. Each 1 repaid frees 1 ÷ 0.9 of deposit, and 1,800 ÷ 0.9 is 2,000, so Available rises to 6,444."
              onNext={onDone}
              onBack={() => go("s5")}
              ending={
                <Ending
                  inApp="Borrow page, your vault: the position stats and the health bar, then the Withdraw and Repay tabs."
                  caveat="These amounts are an example. In the app, MAX on the Withdraw tab shows your own limit."
                />
              }
            />
          </Screen>
        ),
      }}
    />
  );
}
