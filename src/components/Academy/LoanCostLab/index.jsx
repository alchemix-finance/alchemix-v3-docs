import React, { useEffect, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import beg from "../Beginner/styles.module.css";
import { apiBase } from "../lib/api";
import { PROTOCOL_FEE, simpleCurve } from "../lib/model";
import {
  AppButton, AppInput, AppSwapInfo, AppTokenPick, AppVaultRow, AppWallet, PracticeVault, useReducedMotion,
} from "../AppMock";
import { Body, ChoiceCheckpoint, LessonControl, LineChart, Parts, Stages, Sub, Term, money } from "../kit";
import { Ask, Done, Ending, Next, Screen, Wait, useScreens } from "../Beginner";
import { Fig, Formula, People, PersonCard, TAUGHT_ALL } from "../Intermediate";

/**
 * Intermediate lesson 3: What borrowing costs.
 *
 * Opens on a Try, so its stages are Try and Check. Back to the day you
 * deposited (10,000, no Debt): Borrow & Swap prices the discount on the
 * learner's own loan (5,000 alUSD at 0.98 is 4,900 USDC, 100), Net Value on
 * the Dashboard shows a redemption costs only its fee, the fee as a yearly
 * figure at most, then a year of both costs beside a 5,000 loan at 7%, and
 * Ana and Ben over two years. Rewritten 2026-11-06 from
 * the lesson scripts.
 *
 * The year is `simpleCurve` in lib/model.js at 50%: Debt from 5,000 to about
 * 3,000, so redemptions paid off about 2,000, and 0.25% of that is about 5.
 */

const DEPOSIT = 10_000;
const BORROW = 5_000;
const PRICE = 0.98;
const CASH = BORROW * PRICE;
const RATE = 0.5;
const MONTHS = 12;
const VAULT = { apr: 0.05, redemptionRate: RATE, deposit: DEPOSIT, taught: TAUGHT_ALL, health: true };
const BEFORE = { deposit: DEPOSIT, debt: 0 };

const CURVE = simpleCurve({ collateral: DEPOSIT, debt: BORROW, yieldAnnual: 0, redemptionAnnual: RATE, months: MONTHS });
const PAID_OFF = BORROW - CURVE[MONTHS].debt;
const FEES = PAID_OFF * PROTOCOL_FEE;
const COMPARE = 0.07;
const compareAt = (m) => BORROW * (1 + (COMPARE * m) / 12);
const COLORS = { debt: "oklch(0.78 0.15 228)", compare: "#f5c09a" };
const ten = (v) => Math.round(v / 10) * 10;

const TRY = "Stage 1 · Try";

export default function LoanCostLab({ lessonId, stage, onStage, done, onComplete }) {
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
            stageNumber={2} passTitle="Lesson 3 complete."
          />
        ),
      }}
    />
  );
}

function Try({ onDone }) {
  const [screen, go] = useScreens("s1");
  const [token, setToken] = useState("alUSD");
  const [typed, setTyped] = useState("");
  const [borrowed, setBorrowed] = useState(false);
  const [year, setYear] = useState(false);
  const n = Number(typed) || 0;
  const swap = token === "USDC";

  return (
    <Parts
      part={screen}
      render={{
        s1: () => (
          <Screen eyebrow={TRY} headline="Borrow & Swap">
            <Sub>
              An Alchemix loan charges no interest. Its two costs are the discount, paid once when you
              swap, and the redemption fee, paid each time a redemption pays part of the loan off. Your
              practice position starts this lesson on the day you deposited, with 10,000 deposited and
              nothing owed. The Borrow tab can borrow and <Term id="swap">swap</Term> in one step. Pick
              USDC in the token picker to receive USDC instead of alUSD, type 5,000 in the alUSD field and
              press Borrow & Swap.
            </Sub>
            <PracticeVault
              {...VAULT}
              debt={borrowed ? BORROW : 0}
              tab="Borrow"
              prev={borrowed ? BEFORE : null}
              preview={!borrowed && n > 0 ? { debt: n } : undefined}
              wallet={<AppWallet items={[{ token: "USDC", amount: borrowed ? CASH : 0, prev: borrowed ? 0 : null }]} />}
            >
              <AppTokenPick tokens={["alUSD", "USDC"]} value={token} onChange={borrowed ? undefined : setToken} />
              <AppInput
                token="alUSD" type="Available" amount={borrowed ? "" : typed}
                onChange={borrowed ? undefined : setTyped}
                balance={borrowed ? DEPOSIT * 0.9 - BORROW : DEPOSIT * 0.9} digits={0}
              />
              {swap ? <AppSwapInfo rate={`1 alUSD = ${PRICE.toFixed(2)} USDC`} mint={borrowed ? BORROW : n} /> : null}
              <AppButton onClick={() => setBorrowed(true)} disabled={borrowed || !swap || n !== BORROW}>
                {swap ? "Borrow & Swap" : "Borrow"}
              </AppButton>
            </PracticeVault>
            {borrowed ? (
              <Done title="You received 4,900 USDC, and your Debt is 5,000 alUSD" onNext={() => go("s2")}>
                <Body>
                  The app borrowed 5,000 alUSD and swapped it at 0.98, so you owe the full 5,000 and hold
                  100 less in USDC. That gap is the discount, Debt × (1 − alUSD price), and 5,000 × 0.02
                  is 100.
                </Body>
                <Body>You pay it once, on the day you swap, however long you keep the loan.</Body>
              </Done>
            ) : (
              <Wait />
            )}
          </Screen>
        ),
        s2: () => (
          <Screen eyebrow={TRY} headline="Net Value">
            <Sub>
              Net Value is your Deposit minus your Debt, the part of your deposit that is yours once the
              loan is paid off. The Dashboard shows it for each <Term id="position">position</Term> under
              Open Vault Positions, and yours is 10,000 − 5,000, so 5,000.
              A <Term id="redemption">redemption</Term> takes the same amount off your Deposit and your
              Debt, so your Net Value falls only by the redemption fee, which makes the fee the one cost
              of a redemption. The deposit it removes stops earning, but it paid off the same amount of
              your debt, so like repaying any loan it loses you no money.
            </Sub>
            <AppVaultRow deposit={DEPOSIT} debt={BORROW} lit={["vault", "deposit", "debt", "net"]} />
            <Next onNext={() => go("s3")} onBack={() => go("s1")} />
          </Screen>
        ),
        s3: () => (
          <Screen eyebrow={TRY} headline="The fee over a year">
            <Sub>
              The <Term id="redemptionFee">redemption fee</Term> is 0.25% of what each redemption pays
              off, taken from your deposit as it settles. Over a year, at the vault's Redemption Rate, it
              comes to at most this:
            </Sub>
            <Formula text="Yearly fee = 0.25% × Redemption Rate × Debt">0.25% × 50% × 5,000 is 6.25.</Formula>
            <Sub>The real figure is lower, because each redemption takes a share of what is left, so each month pays off less as your Debt falls.</Sub>
            <PracticeVault {...VAULT} debt={BORROW} lit={["redemption", "debt"]} />
            <Next onNext={() => go("s4")} onBack={() => go("s2")} />
          </Screen>
        ),
        s4: () => (
          <Screen eyebrow={TRY} headline="A year of both costs">
            <Sub>
              The chart follows your Debt for a year at a 50% Redemption Rate, beside
              a <Term id="loan">loan</Term> of 5,000 taken elsewhere at 7% interest on the same day. Press
              Skip ahead a year.
            </Sub>
            <YearChart run={year} />
            <div className={beg.costs}>
              <CostCard label="The discount" value={year ? "100" : "-"} />
              <CostCard label="Redemption fees" value={year ? money(FEES) : "-"} />
              <CostCard label="Interest at 7%" value={year ? money(compareAt(MONTHS) - BORROW) : "-"} />
            </div>
            <LessonControl onClick={() => setYear(true)} disabled={year}>Skip ahead a year</LessonControl>
            {year ? (
              <Done title="Your loan cost about 105 in a year" onNext={() => go("s5")} onBack={() => go("s3")}>
                <Body>
                  Alchemix charged <Term id="noInterest">no interest</Term>. Your two costs were the 100
                  discount and about 5 in redemption fees on the 2,000 that redemptions paid off.
                </Body>
                <Body>The 7% loan cost 350 in interest, which grew its debt to 5,350.</Body>
              </Done>
            ) : (
              <Wait onBack={() => go("s3")} />
            )}
          </Screen>
        ),
        s5: () => (
          <Screen eyebrow={TRY} headline="Ana and Ben, two years on">
            <Sub>
              Ana borrows 5,000 on Alchemix and swaps it at 0.98. Ben borrows 5,000 elsewhere at 7%
              interest. Both keep their loans for two years.
            </Sub>
            <People>
              <PersonCard name="Ana" note="Alchemix, swapped at 0.98">
                <Fig label="Debt" value="5,000" />
              </PersonCard>
              <PersonCard name="Ben" note="Elsewhere, 7% interest">
                <Fig label="Debt" value="5,000" />
              </PersonCard>
            </People>
            <Ask
              prompt="Whose loan costs more over two years?"
              options={["Ana's", "Ben's", "The same"]}
              correct={1}
              fact="Ben's costs 700 in interest, since interest grows every month he owes. Ana pays no interest, so her two costs are the 100 discount, paid once, and about 8 in redemption fees on what redemptions pay off over the two years."
              onNext={onDone}
              onBack={() => go("s4")}
              ending={
                <Ending
                  inApp="Borrow page, your vault, then the Borrow tab with USDC picked. Net Value is on the Dashboard, under Open Vault Positions."
                  caveat="0.98, 50% and 7% are examples. Your discount depends on the price on the day you swap, and the redemption fee is set per network."
                />
              }
            />
          </Screen>
        ),
      }}
    />
  );
}

function CostCard({ label, value }) {
  return (
    <div className={`${beg.cost} ${value !== "-" ? beg.costLit : ""}`}>
      <div className={beg.costLabel}>{label}</div>
      <div className={beg.costValue}>{value}</div>
    </div>
  );
}

/**
 * The year on one chart: Debt month by month beside the dashed 5,000 at 7%.
 * Before the press it shows the starting point; the press draws the months
 * in, or all at once under reduced motion. Labels under the end points,
 * rounded to tens as the reveal rounds them.
 */
function YearChart({ run }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(run ? MONTHS : 0);

  useEffect(() => {
    if (!run) return undefined;
    if (reduced) {
      setShown(MONTHS);
      return undefined;
    }
    const t = setInterval(() => {
      setShown((m) => {
        if (m >= MONTHS) {
          clearInterval(t);
          return m;
        }
        return m + 1;
      });
    }, 90);
    return () => clearInterval(t);
  }, [run, reduced]);

  const upto = CURVE.slice(0, shown + 1);
  const end = upto[upto.length - 1];
  const series = [
    { id: "compare", color: COLORS.compare, dashed: true, width: 2, points: upto.map((p) => ({ x: p.month, y: compareAt(p.month) })) },
    { id: "debt", color: COLORS.debt, points: upto.map((p) => ({ x: p.month, y: p.debt })) },
  ];
  const markers = [{ x: 0, y: BORROW, label: money(BORROW), color: COLORS.debt, below: true }];
  if (shown === MONTHS) {
    markers.push(
      { x: MONTHS, y: end.debt, label: money(ten(end.debt)), color: COLORS.debt, below: true },
      { x: MONTHS, y: compareAt(MONTHS), label: money(compareAt(MONTHS)), color: COLORS.compare },
    );
  }

  return (
    <div className={beg.chartCard}>
      <LineChart
        series={series}
        xMax={MONTHS}
        yMin={2_000}
        yMax={6_000}
        yTicks={4}
        xTicks={4}
        xLabel="months"
        formatY={(v) => money(v)}
        markers={markers}
        label="Debt over 12 months, beside 5,000 at 7% interest"
      />
      <div className={beg.key}>
        <span style={{ color: COLORS.debt }}><i />Debt</span>
        <span style={{ color: COLORS.compare }}><i className={beg.dashed} />5,000 at 7% interest</span>
      </div>
    </div>
  );
}
