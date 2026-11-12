import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import own from "../Intermediate/styles.module.css";
import { apiBase } from "../lib/api";
import {
  AppButton, AppFixedCard, AppFixedRow, AppInput, AppSwapCard, AppTokenPick, AppWallet, PracticeVault,
} from "../AppMock";
import { Body, ChoiceCheckpoint, Parts, Stages, Sub, Term } from "../kit";
import { Done, Ending, Next, Pair, Screen, Wait, useScreens } from "../Beginner";
import { BuyerCards, Formula, LessonSlider, LitSteps, PegLine, TAUGHT_ALL } from "../Intermediate";

/**
 * Intermediate lesson 6: The peg and the discount.
 *
 * Why alUSD sells under a dollar and what brings it back: the peg, the two
 * buyers, the Fixed Yield card's return from its price and term (0.96 on a
 * 4-month term is 4.17% a term, about 12.5% a year; 0.98 is about 6.1%), bad
 * debt and a reduced Claim, then repaying with alUSD bought at 0.98 (980 USDC
 * pays off 1,000) and Flash Repay doing the same in one transaction.
 * Rewritten 2026-11-06 from the lesson scripts.
 *
 * From Debt 5,000 with 208 earmarked: alUSD repays only the 4,792 not
 * earmarked, so 1,000 alUSD leaves Debt 4,000 and Earmarked 208. Flash Repay
 * borrows 980 USDC, buys 1,000 alUSD, repays 1,000 of Debt, withdraws the
 * 1,000 of deposit behind it, repays the 980 and sends 20 to the wallet.
 *
 * Sources: bad debt and how it is restored from transmuter.md, alAssets.md
 * and risk-considerations.md; the token picker and earmarked debt from
 * repay-loan.md; Flash Repay, and how it compares with self-liquidation, from
 * repay-loan.md#flash-repay in the main docs (this checkout's copy of
 * that tutorial has no Flash Repay section yet).
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const EARMARKED = 208;
const PRICE = 0.98;
const CHUNK = 1_000;
const COST = CHUNK * PRICE;
const WALLET = 4_900;
const VAULT = { apr: 0.05, redemptionRate: 0.5, earmarked: EARMARKED, taught: TAUGHT_ALL, health: true };
const AT_START = { deposit: DEPOSIT, debt: BORROW, earmarked: EARMARKED };
const CARD = { term: "4 Months", maturity: "Mar 04, 2027" };
const ROW = { transmuter: "alUSD 4 Months", apr: "6.12%", end: "Mar 04, 2027", deposit: "5,000 alUSD", profit: "100 USDC" };
const LEARN = "Stage 1 · Learn";
const TRY = "Stage 2 · Try";
/** The Fixed Yield card's return for one term, and three terms a year. */
const termReturn = (price) => (1 - price) / price;

export default function DiscountLab({ lessonId, stage, onStage, done, onComplete }) {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  return (
    <Stages
      stage={stage}
      render={{
        predict: () => <Learn onDone={() => onStage("explore")} />,
        explore: () => <Try onDone={() => onStage("checkpoint")} />,
        checkpoint: () => (
          <ChoiceCheckpoint base={base} lessonId={lessonId} done={done} onPass={onComplete} passTitle="Lesson 6 complete." />
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
          <Screen eyebrow={LEARN} headline="Why alUSD sells under a dollar">
            <Sub>
              The peg is alUSD's intended price, one dollar, which is what one alUSD is worth inside
              Alchemix. Borrowers typically sell their <Term id="alusd">alUSD</Term> for USDC to spend, as
              you did in the beginner track. When more people sell than buy, the price falls under the
              peg. For this example alUSD is at 0.98, the price from the beginner track.
            </Sub>
            <Pair>
              <AppSwapCard price={PRICE} payBalance={0} getBalance={0} lit={["price"]} />
              <PegLine />
            </Pair>
            <Next onNext={() => go("s2")} />
          </Screen>
        ),
        s2: () => (
          <Screen eyebrow={LEARN} headline="Two buyers bring it back">
            <Sub>
              Inside Alchemix, one alUSD always repays one dollar of debt, whatever it trades for, which
              gives two kinds of people a reason to buy it under the <Term id="peg">peg</Term>. A borrower
              buys it at 0.98 and repays a full dollar of debt with it. A Fixed Yield depositor buys it at
              0.98 and claims a full dollar at <Term id="maturityDate">maturity</Term>. Their buying
              pushes the price back toward a dollar. Alchemix also burns the alUSD both of them use, which
              shrinks its supply.
            </Sub>
            <BuyerCards />
            <Next onNext={onDone} onBack={() => go("s1")} />
          </Screen>
        ),
      }}
    />
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s3");
  // S3: the alUSD Price, in cents.
  const [cents, setCents] = useState(98);
  const [moved, setMoved] = useState(false);
  // S5: swap 960 USDC, then repay 1,000 alUSD.
  const [pay, setPay] = useState("");
  const [swapped, setSwapped] = useState(false);
  const [token, setToken] = useState("alUSD");
  const [repay, setRepay] = useState("");
  const [repaid, setRepaid] = useState(false);
  // S6: Flash Repay 1,000.
  const [flash, setFlash] = useState("");
  const [flashed, setFlashed] = useState(false);

  const price = cents / 100;
  const ret = termReturn(price);
  const alHeld = swapped && !repaid ? CHUNK : 0;
  const usdcHeld = swapped ? WALLET - COST : WALLET;

  return (
    <Parts
      part={screen}
      render={{
        s3: () => (
          <Screen eyebrow={TRY} headline="Price and term set the Fixed Yield APR">
            <Sub>A Fixed Yield card's return comes from the gap between the price you pay and the dollar you claim. At 0.98 you pay 0.98 for each alUSD and claim 1.00 at maturity, a gain of 0.02.</Sub>
            <Formula text="Return for the term = (1 − price) ÷ price">
              0.02 ÷ 0.98 is about 2.04% for 4 months. Three terms fit in a year, so about 6.1% a year.
            </Formula>
            <Sub>Drag the alUSD Price down to 0.96.</Sub>
            <AppFixedCard
              {...CARD} apr={ret * 3} price={`${price.toFixed(2)} USDC`} percent={ret}
              lit={["apr", "price", "percent", "term"]}
            />
            <LessonSlider
              label="alUSD Price" value={cents} display={price.toFixed(2)} min={90} max={99} step={1}
              onChange={(v) => {
                setCents(v);
                if (v === 96) setMoved(true);
              }}
            />
            {moved ? (
              <Done title="At 0.96 the card pays about 12.5% a year" onNext={() => go("s4")}>
                <Body>
                  A deeper <Term id="discount">discount</Term> pays more, so more people buy alUSD to
                  deposit it, and their buying lifts the price back up. A smaller discount pays less, so
                  fewer people buy.
                </Body>
                <Body>
                  Their deposits also add to the <Term id="alusdWaiting">alUSD waiting</Term>, which raises
                  the Redemption Rate from lesson 4 and pays borrowers' loans down faster.
                </Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s4: () => (
          <Screen eyebrow={TRY} headline="When the vault comes up short">
            <Sub>
              A <Term id="fixedYield">Fixed Yield</Term> depositor buys alUSD under the peg because each
              one claims a full dollar at maturity, and the claim pays less only when the vault has bad
              debt. Bad debt is when a vault's deposits are worth less than its <Term id="totalDebt">Total
              Debt</Term>, for example after a large strategy loss. While it lasts, Claim pays out pro
              rata, the same reduced share on every alUSD, so if the vault's deposits cover 97% of its
              debt, each alUSD claims 0.97 USDC. Liquidations and these reduced claims restore the balance
              between the vault's deposits and its debt. A depositor can claim at the reduced rate now, or
              leave the position unclaimed and claim the full dollar once the debt is restored.
            </Sub>
            <AppFixedRow
              {...ROW}
              lit={["transmuter", "deposit", "action"]}
              action={
                <span className={own.claimWrap}>
                  <span className={own.claimNote}>0.97 USDC per alUSD</span>
                  <AppButton disabled>Claim</AppButton>
                </span>
              }
            />
            <Next onNext={() => go("s5")} onBack={() => go("s3")} />
          </Screen>
        ),
        s5: () => (
          <Screen eyebrow={TRY} headline="Repay with alUSD bought under a dollar">
            <Sub>
              alUSD repays only debt that is not <Term id="earmarked">earmarked</Term>. Earmarked debt is
              already reserved for a Fixed Yield depositor and is settled in MYT out of your deposit, so it
              is repaid with USDC or <Term id="myt">MYT</Term>. The app swaps your USDC to MYT as you repay.
              Your Debt is 5,000, with 208 earmarked, so up to 4,792 can be repaid with alUSD. Swap 980
              USDC for 1,000 alUSD on the Trade page. Then pick alUSD in the token picker on the Repay
              tab, type 1,000 and press Repay.
            </Sub>
            <AppSwapCard
              price={1 / PRICE} priceLine={`1 alUSD = ${PRICE.toFixed(2)} USDC`}
              payToken="USDC" getToken="alUSD"
              amount={swapped ? "" : pay}
              onChange={swapped ? undefined : setPay}
              payBalance={usdcHeld}
              getBalance={swapped ? CHUNK : 0}
              prevPay={swapped ? WALLET : null}
              prevGet={swapped ? 0 : null}
              onSwap={() => setSwapped(true)}
              canSwap={!swapped && Number(pay) === COST}
            />
            <PracticeVault
              {...VAULT}
              deposit={DEPOSIT}
              debt={repaid ? BORROW - CHUNK : BORROW}
              prev={repaid ? AT_START : null}
              preview={!repaid && token === "alUSD" && Number(repay) > 0 ? { debt: BORROW - Number(repay) } : undefined}
              tab="Repay"
            >
              <AppTokenPick tokens={["alUSD", "USDC", "MYT"]} value={token} onChange={repaid ? undefined : setToken} />
              <AppInput
                token={token}
                amount={repaid ? "" : repay}
                onChange={repaid || !swapped ? undefined : setRepay}
                balance={token === "alUSD" ? alHeld : token === "USDC" ? usdcHeld : 0}
                max={token === "alUSD" ? Math.min(alHeld, BORROW - EARMARKED) : null}
                digits={0}
              />
              <AppButton
                onClick={() => setRepaid(true)}
                disabled={repaid || !swapped || token !== "alUSD" || Number(repay) !== CHUNK}
              >
                Repay
              </AppButton>
            </PracticeVault>
            {repaid ? (
              <Done title="980 USDC paid off 1,000 of Debt" onNext={() => go("s6")} onBack={() => go("s4")}>
                <Body>
                  Each alUSD cost 0.98 and repaid a full dollar of debt. You won back 20 of the 100
                  discount you paid when you swapped in lesson 3.
                </Body>
                <Body>If all of your debt is earmarked, the Repay tab says so, and only MYT or USDC will clear it.</Body>
              </Done>
            ) : (
              <Wait onBack={() => go("s4")} />
            )}
          </Screen>
        ),
        s6: () => (
          <Screen eyebrow={TRY} headline="Flash Repay">
            <Sub>
              The repayment above was for that step only, so your Debt is back at 5,000. Repaying that
              way needs USDC in your wallet first. A flash loan is money borrowed and repaid inside one
              transaction, the one action your wallet signs. Flash Repay uses one to buy alUSD at 0.98,
              repay your Debt with it, then withdraw the deposit behind that debt to pay the flash loan
              back, so you need no USDC in your wallet. Type 1,000 in the Flash Repay field and press
              Flash Repay alUSD.
            </Sub>
            <PracticeVault
              {...VAULT}
              deposit={flashed ? DEPOSIT - CHUNK : DEPOSIT}
              debt={flashed ? BORROW - CHUNK : BORROW}
              prev={flashed ? AT_START : null}
              tab="Repay"
              wallet={<AppWallet items={[{ token: "USDC", amount: flashed ? CHUNK - COST : 0, prev: flashed ? 0 : null }]} />}
            >
              <AppTokenPick tokens={["alUSD", "USDC", "MYT"]} value="alUSD" />
              <AppInput token="alUSD" dim />
              <div className={own.flashBox}>
                <div className={own.flashTitle}>Flash Repay</div>
                <AppInput
                  token="alUSD" amount={flashed ? "" : flash} onChange={flashed ? undefined : setFlash}
                  // Available is the debt not earmarked: 4,792 from Debt 5,000, then 3,792 once 1,000 is repaid.
                  balance={(flashed ? BORROW - CHUNK : BORROW) - EARMARKED} prevBalance={flashed ? BORROW - EARMARKED : null} type="Available" digits={0} label="Flash Repay amount"
                />
                <AppButton onClick={() => setFlashed(true)} disabled={flashed || Number(flash) !== CHUNK}>
                  Flash Repay alUSD
                </AppButton>
              </div>
            </PracticeVault>
            <LitSteps
              run={flashed}
              steps={[
                "Borrow 980 USDC",
                "Buy 1,000 alUSD",
                "Repay 1,000 of Debt",
                "Withdraw 1,000 of deposit",
                "Repay the 980 and send 20 to your wallet",
              ]}
            />
            {flashed ? (
              <Done title="Your Debt is 4,000, and 20 USDC came to your wallet" onNext={onDone} onBack={() => go("s5")}>
                <Body>
                  Flash Repay withdrew only the 1,000 of deposit behind the debt it repaid, and the gap
                  between 0.98 and a dollar came to you as USDC. The other 9,000 stays in the vault and
                  keeps earning.
                </Body>
                <Body>
                  Self-liquidation, from lesson 5, also repays your debt from your deposit, but at a full
                  dollar for each 1 of Debt, so it wins back none of the discount.
                </Body>
                <Ending
                  inApp="The Trade page for the price, the Fixed Yield page under Earn for the cards, and the Repay tab on your vault for Flash Repay."
                  caveat="0.98 and 0.96 are examples. The app quotes the real price, after a small swap fee, before you confirm."
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
