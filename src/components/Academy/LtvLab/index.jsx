import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { apiBase } from "../lib/api";
import { PROTOCOL_FEE } from "../lib/model";
import { AppButton, AppInfoTable, AppWallet, PracticeVault } from "../AppMock";
import { Body, ChoiceCheckpoint, Parts, Stages, StepList, Sub, Term } from "../kit";
import { Ask, Done, Ending, Next, Screen, Wait, useScreens } from "../Beginner";
import { Facts, Formula, LessonSlider, LtvBar, STRATS, Stats, TAUGHT_ALL } from "../Intermediate";

/**
 * Intermediate lesson 5: Choosing an LTV.
 *
 * Opens on a Try, so its stages are Try and Check. From Deposit 10,000, Debt
 * 5,000, Earmarked 208: the loss that takes the LTV to 95% (about 47%), the
 * LTV that survives the 60% the caps allow (36%) and why LTV falls on its own
 * after you borrow, the same rule on the lesson 1 vault (54%), what a
 * liquidation takes, when a whole position goes, and closing it yourself on
 * the Liquidate tab. Rewritten 2026-11-06 from
 * the lesson scripts.
 *
 * The liquidation (screen 4) follows liquidations.md: the earmarked 208 and
 * its 0.52 fee first (Deposit 4,991, Debt 4,792, still past 95%), then about
 * 2,997 more to bring the LTV back to 90% (Deposit 1,995, Debt 1,795).
 * Screen 5 states only what liquidations.md and calculateLiquidation say
 * about a full liquidation. Self-liquidation repays the 5,000 from the
 * deposit and charges only the 0.25% fee on the earmarked part, so 4,999
 * comes back. The beginner track's year (50% rate, 5% APR) ends at Debt
 * about 3,000 and Deposit about 8,460, an LTV of about 35%.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const EARMARKED = 208;
const FEE = EARMARKED * PROTOCOL_FEE;
const VAULT = { apr: 0.05, redemptionRate: 0.5, earmarked: EARMARKED, taught: TAUGHT_ALL, health: true };
const AT_START = { deposit: DEPOSIT, debt: BORROW, earmarked: EARMARKED };
const pct1 = (x) => `${(Math.round(x * 1000) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
const TRY = "Stage 1 · Try";

export default function LtvLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  return (
    <Stages
      stage={stage}
      render={{
        explore: () => <Try onDone={() => onStage("checkpoint")} />,
        checkpoint: () => (
          <ChoiceCheckpoint
            base={base} lessonId={lessonId} done={done} onPass={onComplete}
            stageNumber={2} passTitle="Lesson 5 complete."
          />
        ),
      }}
    />
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s1");
  // S1: the loss, in percent, half a point at a time.
  const [loss, setLoss] = useState(0);
  const [reached, setReached] = useState(false);
  // S2: the Debt, in hundreds.
  const [debt, setDebt] = useState(BORROW);
  const [sized, setSized] = useState(false);
  // S6: the self-liquidation.
  const [closed, setClosed] = useState(false);

  const deposit = DEPOSIT * (1 - loss / 100);
  const ltv = BORROW / deposit;

  return (
    <Parts
      part={screen}
      render={{
        s1: () => (
          <Screen eyebrow={TRY} headline="How big a loss reaches 95%?">
            <Sub>
              Your practice position starts this lesson with 10,000 deposited, 5,000 owed
              and 208 <Term id="earmarked">Earmarked</Term>, as lesson 4 left it. A loss inside the vault
              lowers your Deposit and leaves your Debt where it is, which makes it the one way your LTV
              can rise without you borrowing or withdrawing.
            </Sub>
            <Formula text="LTV after a loss = LTV ÷ (1 − loss)">At a 10% loss: 50% ÷ 0.9 is 55.6%.</Formula>
            <Sub>Drag the Loss slider until your LTV reaches 95%, the LIQ LTV line.</Sub>
            <PracticeVault {...VAULT} deposit={deposit} debt={BORROW} lit={["deposit", "ltv", "health"]} bar={false} />
            <LtvBar ltv={ltv} />
            <LessonSlider
              label="Loss" value={loss} display={`${loss}%`} min={0} max={70} step={0.5}
              onChange={(v) => {
                setLoss(v);
                if (BORROW / (DEPOSIT * (1 - v / 100)) >= 0.95) setReached(true);
              }}
            />
            {reached ? (
              <Done title="A loss of about 47% takes you to 95%" onNext={() => go("s2")}>
                <Body>
                  From 50%, the vault would have to lose almost half its value before anyone could
                  liquidate you. Next, the caps from lesson 1 set how large a loss you should plan for.
                </Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s2: () => (
          <Screen eyebrow={TRY} headline="The LTV that survives the caps">
            <Sub>
              The <Term id="cap">caps</Term> let the DAO put at most 60% of a vault
              outside <Term id="conservative">Conservative</Term>, so losing all of that 60% is the worst
              case the caps allow. Say it happened. Aiming for 90% after the loss instead of 95% leaves 5
              points of room in case the loss runs past what you planned. Drag the Debt slider until your
              LTV after that loss is 90%, which leaves you at MAX LTV and short of the 95% line.
            </Sub>
            <Facts items={[{ label: "Loss", value: "60%" }]} />
            <Stats
              items={[
                { label: "LTV now", value: pct1(debt / DEPOSIT) },
                { label: "LTV after a 60% loss", value: pct1(debt / (DEPOSIT * 0.4)), tone: debt / (DEPOSIT * 0.4) > 0.9 ? "bad" : null, on: true },
              ]}
            />
            <LessonSlider
              label="Debt" value={debt} display={debt.toLocaleString("en-US")} min={0} max={BORROW} step={100}
              onChange={(v) => {
                setDebt(v);
                if (v === 3_600) setSized(true);
              }}
            />
            {sized ? (
              <Done title="36% survives the worst the caps allow" onNext={() => go("s3")} onBack={() => go("s1")}>
                <Body>
                  A 60% loss leaves 4,000 of a 10,000 deposit, and a Debt of 3,600 is 90% of that 4,000.
                  You would end at <Term id="maxLtv">MAX LTV</Term>, still short of the 95% line, so
                  nobody could liquidate you.
                </Body>
                <Body>
                  The DAO checks the caps when it allocates, so withdrawals by other depositors can push a
                  share above its cap until the DAO rebalances. An LTV a little under 36% leaves room for
                  that.
                </Body>
                <Body>
                  Your LTV does not stay where you start it. Each redemption takes the same amount off your
                  Deposit and your Debt, which brings your LTV down. Yield lowers it further by adding to
                  your Deposit. In the beginner track, a year at a 50% Redemption Rate and a 5% APR took
                  your LTV from 50% to about 35%. Without a loss, a withdrawal or more borrowing, your LTV
                  is at its highest on the day you borrow.
                </Body>
              </Done>
            ) : (
              <Wait onBack={() => go("s1")} />
            )}
          </Screen>
        ),
        s3: () => (
          <Screen eyebrow={TRY} headline="This vault's worst case">
            <Sub>
              A vault's own worst case is typically smaller than the caps allow, since it depends on
              what the vault holds today. In the practice vault from lesson 1, <Term id="moderate">Moderate</Term> and
              {" "}<Term id="aggressive">Aggressive</Term> strategies hold 40%.
            </Sub>
            <AppInfoTable strategies={STRATS} lit={["strategy", "risk", "allocation"]} rows={["Strategy B", "Strategy C"]} />
            <Ask
              prompt="If all 40% were lost, what is the highest LTV that ends at 90%?"
              options={["36%", "54%", "60%"]}
              correct={1}
              fact="54%. A 40% loss leaves 60% of the deposit, and 90% of 60% is 54%. The DAO can change the shares, so a vault's own worst case can move toward the 60% the caps allow."
              onNext={() => go("s4")}
              onBack={() => go("s2")}
            />
          </Screen>
        ),
        s4: () => (
          <Screen eyebrow={TRY} headline="What a liquidation takes">
            <Sub>
              Say a 48% loss takes your Deposit to 5,200 against Debt 5,000. Your LTV is 96%, past the
              LIQ LTV line, so anyone can now <Term id="liquidation">liquidate</Term> your position. A
              liquidation settles your loan from your deposit in this order.
            </Sub>
            <StepList
              steps={[
                {
                  text: "Your Earmarked 208 is settled from your deposit first, with its 0.25% redemption fee. Had that brought your LTV under 95%, the liquidation would stop here.",
                  figures: [
                    { label: "Deposit", value: "4,991 USDC", tone: "bad" },
                    { label: "Debt", value: "4,792 alUSD" },
                    { label: "LTV", value: "96%", tone: "bad" },
                  ],
                },
                {
                  text: "Then just enough more deposit to bring your LTV back to 90%, about 2,997, which pays off the same amount of debt and goes to the Transmuter to fund redemptions.",
                  figures: [
                    { label: "Deposit", value: "1,995 USDC", tone: "bad" },
                    { label: "Debt", value: "1,795 alUSD" },
                    { label: "LTV", value: "90%" },
                  ],
                },
                { text: "The liquidator receives only a fee, paid from the deposit left above your Debt." },
                { text: "The rest of your position stays open, and your deposit keeps earning." },
              ]}
            />
            <Next onNext={() => go("s5")} onBack={() => go("s3")} />
          </Screen>
        ),
        s5: () => (
          <Screen eyebrow={TRY} headline="When the whole position goes">
            <Sub>
              A liquidation closes a <Term id="position">position</Term> in full in two cases: when its
              Debt is as large as its Deposit or larger, or when the vault as a whole falls below the least
              its deposits may be worth against its <Term id="totalDebt">Total Debt</Term>. In the second
              case, only a position already past the 95% line is closed in full. All of the deposit then
              goes toward the debt.
            </Sub>
            <LtvBar ltv={1} />
            <Facts items={[{ label: "Deposit", value: "0" }, { label: "Debt", value: "0" }]} />
            <Next onNext={() => go("s6")} onBack={() => go("s4")} />
          </Screen>
        ),
        s6: () => (
          <Screen eyebrow={TRY} headline="Close it yourself">
            <Sub>
              Self-liquidation is closing your own loan from your deposit, on the Liquidate tab, which
              acts on your position only. It suits a borrower who has spent the alUSD and wants the
              position closed without buying anything to repay it. The losses above were what-ifs, so
              your position is back at Deposit 10,000, Debt 5,000 and Earmarked 208. Say you spent the
              4,900 USDC from the swap and want out today. Press Liquidate.
            </Sub>
            <PracticeVault
              {...VAULT}
              deposit={closed ? 0 : DEPOSIT}
              debt={closed ? 0 : BORROW}
              earmarked={closed ? 0 : EARMARKED}
              prev={closed ? AT_START : null}
              tab="Liquidate"
              wallet={<AppWallet items={[{ token: "USDC", amount: closed ? DEPOSIT - BORROW - FEE : 0, prev: closed ? 0 : null }]} />}
            >
              <AppButton onClick={() => setClosed(true)} disabled={closed}>Liquidate</AppButton>
            </PracticeVault>
            {closed ? (
              <Done title="Your Debt is 0, and 4,999 came back to you" onNext={onDone} onBack={() => go("s5")}>
                <Body>
                  Your deposit repaid the 5,000, and the rest came to your wallet. The only charge was
                  0.52, the 0.25% redemption fee on the 208 earmarked part, since a self-liquidation pays
                  no liquidator fee.
                </Body>
                <Body>
                  The 100 <Term id="discount">discount</Term> from the day you swapped stays a cost.
                  Lesson 6 covers a way to win some of it back, by repaying with alUSD bought under a
                  dollar.
                </Body>
                <Ending
                  inApp="Borrow page, your vault: the health bar, the Info tab's Risk Level column, then the Liquidate tab."
                  caveat="These losses are examples. Strategy losses are rare, and a lower LTV leaves more room."
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
