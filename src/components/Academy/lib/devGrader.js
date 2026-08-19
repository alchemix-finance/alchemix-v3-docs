import { debtRemainingPct } from "./model";
import { CAPS, bestBlend } from "./myt";
import {
  annualisedFromDiscount,
  minimumCollateral,
  survivableLtv,
  withdrawable,
} from "./protocol";

/**
 * A grader that runs in the browser, for local development only.
 *
 * Why this exists: the checkpoint is the one part of a lesson that needs a
 * server, and requiring a second repo to be running before a lesson page works
 * made the Academy unusable for anyone editing docs. Someone fixing a typo should
 * not have to stand up the season engine to see the page they are editing.
 *
 * Two guarantees, in order of importance:
 *
 * 1. It cannot run in production. Every entry point is behind
 *    `process.env.NODE_ENV !== "production"`, which the build replaces with a
 *    literal, so the branch folds to false in the deployed site.
 * 2. What it issues is worthless. Completions carry a `local:` prefix that no
 *    server signature can match, so a locally finished lesson can never be
 *    redeemed at graduation. That is the safe direction to fail in.
 *
 * This hides nothing that was secret. Each lesson already computes the same
 * numbers in the browser to draw its own readouts, so the answer was always
 * derivable client-side. What the engine actually provides is a signature on the
 * completion, which is why local ones are inert rather than equivalent.
 *
 * Generation mirrors `src/lib/academy/lessons.ts` in the engine, which stays
 * authoritative. This is a stand-in.
 */
export const devFallbackEnabled = () => process.env.NODE_ENV !== "production";

export const LOCAL_PREFIX = "local:";

const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
const between = (lo, hi, dp) => Number((lo + Math.random() * (hi - lo)).toFixed(dp));
const money = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const RATE_MIN = 0.35;
const RATE_MAX = 1.6;
const RATE_STEP = 0.005;
const YIELD_ANNUAL = 0.05;

/* ── Per-lesson generators ───────────────────────────────── */

const GENERATORS = {
  "opening-a-position": () => {
    const collateral = pick([10000, 20000, 25000, 40000, 50000]);
    const debt = Math.round(collateral * between(0.2, 0.6, 2));
    return {
      fields: { collateral, debt },
      prompt:
        `A position holds ${money(collateral)} of collateral against ${money(debt)} of debt. ` +
        `How much of that collateral can be withdrawn right now, without repaying anything first?`,
      controls: { slider: { min: 0, max: collateral, step: collateral / 500 } },
    };
  },

  "pace-of-repayment": () => {
    const collateral = pick([10000, 20000, 25000, 50000]);
    const debt = Math.round(collateral * pick([0.2, 0.3, 0.4, 0.5]));
    const months = pick([12, 18, 24, 30, 36]);
    const rate = between(RATE_MIN, RATE_MAX, 4);
    const base = { collateral, debt, yieldAnnual: YIELD_ANNUAL, months };
    const targetPct = Number(debtRemainingPct({ ...base, redemptionAnnual: rate }).toFixed(1));
    return {
      fields: { ...base, targetPct },
      prompt:
        `A position holds ${money(collateral)} of collateral against ${money(debt)} of debt. ` +
        `Find the redemption rate that leaves ${targetPct.toFixed(1)}% of that debt outstanding ` +
        `after ${months} months.`,
      controls: { slider: { min: RATE_MIN, max: RATE_MAX, step: RATE_STEP } },
    };
  },

  "where-yield-comes-from": () => {
    const conservativeApr = between(3, 5, 1);
    const moderateApr = Number((conservativeApr + between(2, 5, 1)).toFixed(1));
    const aggressiveApr = Number((moderateApr + between(4, 10, 1)).toFixed(1));
    return {
      fields: { conservativeApr, moderateApr, aggressiveApr },
      prompt:
        `A proposed MYT holds three strategies: Conservative at ${conservativeApr.toFixed(1)}%, ` +
        `Moderate at ${moderateApr.toFixed(1)}%, and Aggressive at ${aggressiveApr.toFixed(1)}%. ` +
        `Find the highest blended APR the DAO could reach without breaching a risk cap.`,
      controls: { caps: CAPS, step: 1 },
    };
  },

  "cost-of-borrowing": () => {
    const cashWanted = pick([2000, 5000, 8000, 10000, 15000]);
    const price = between(0.94, 0.99, 3);
    return {
      fields: { cashWanted, price },
      prompt:
        `You need ${money(cashWanted)} of working capital, and alUSD is trading at ` +
        `${price.toFixed(3)}. How much alUSD do you have to borrow to walk away with that amount?`,
      controls: { slider: { min: 0, max: cashWanted * 1.5, step: cashWanted / 500 } },
    };
  },

  "ltv-and-risk": () => {
    const loss = between(0.08, 0.25, 3);
    return {
      fields: { loss },
      prompt:
        `The MYT reports a loss of ${(loss * 100).toFixed(1)}% of its backing. What is the ` +
        `highest starting LTV that survives it without crossing the liquidation threshold?`,
      controls: { slider: { min: 0, max: 95, step: 0.1 } },
    };
  },

  "transmuter-and-peg": () => {
    const price = between(0.93, 0.99, 3);
    const weeks = pick([8, 10, 12, 16, 20, 26]);
    return {
      fields: { price, weeks },
      prompt:
        `alUSD is trading at ${price.toFixed(3)} and the transmutation term is ${weeks} weeks. ` +
        `Buying now and waiting for maturity returns what, annualised?`,
      controls: { slider: { min: 0, max: 60, step: 0.05 } },
    };
  },

  capstone: () => {
    const cashWanted = pick([5000, 10000, 12000, 20000, 25000]);
    const price = between(0.94, 0.99, 3);
    const loss = between(0.08, 0.25, 3);
    const target = minimumCollateral(cashWanted, price, loss);
    return {
      fields: { cashWanted, price, loss },
      prompt:
        `You need ${money(cashWanted)} of working capital. alUSD trades at ${price.toFixed(3)}, ` +
        `and the MYT is about to report a loss of ${(loss * 100).toFixed(1)}% of its backing. ` +
        `What is the smallest deposit that raises the capital and still survives the loss?`,
      controls: { slider: { min: 0, max: target * 2, step: target / 500 } },
    };
  },
};

/* ── Per-lesson graders. Each returns [actual, target, tolerance, unit]. ── */

const GRADERS = {
  "opening-a-position": (f, a) => [a, withdrawable(f.collateral, f.debt), f.collateral * 0.004, "amount"],

  "pace-of-repayment": (f, a) => [
    debtRemainingPct({
      collateral: f.collateral,
      debt: f.debt,
      yieldAnnual: f.yieldAnnual,
      redemptionAnnual: a,
      months: f.months,
    }),
    f.targetPct,
    1.0,
    "pct",
  ],

  "where-yield-comes-from": (f, a) => [
    a,
    bestBlend({
      conservative: f.conservativeApr,
      moderate: f.moderateApr,
      aggressive: f.aggressiveApr,
    }),
    0.05,
    "apr",
  ],

  "cost-of-borrowing": (f, a) => [a * f.price, f.cashWanted, f.cashWanted * 0.004, "amount"],

  "ltv-and-risk": (f, a) => [a, survivableLtv(f.loss) * 100, 0.3, "pct"],

  "transmuter-and-peg": (f, a) => [a, annualisedFromDiscount(f.price, f.weeks), 0.25, "apr"],

  capstone: (f, a) => {
    const target = minimumCollateral(f.cashWanted, f.price, f.loss);
    return [a, target, target * 0.005, "amount"];
  },
};

export function localChallenge(lessonId) {
  const generate = GENERATORS[lessonId];
  if (!generate) throw new Error(`No local grader for ${lessonId}.`);

  const { fields, prompt, controls } = generate();
  return {
    params: { lessonId, fields },
    challenge: `${LOCAL_PREFIX}challenge`,
    prompt,
    controls,
    local: true,
  };
}

export function localGrade(lessonId, params, answer) {
  const grade = GRADERS[lessonId];
  if (!grade) throw new Error(`No local grader for ${lessonId}.`);

  const [actual, target, tolerance, unit] = grade(params.fields, answer);
  const passed = Number.isFinite(actual) && Math.abs(actual - target) <= tolerance;

  return {
    passed,
    actual: Number(actual.toFixed(2)),
    target: Number(target.toFixed(2)),
    tolerance: Number(tolerance.toFixed(2)),
    unit,
    local: true,
    // Never a valid signature. A locally graded lesson presented at graduation is
    // rejected, which is the correct outcome.
    completion: passed ? `${LOCAL_PREFIX}${lessonId}` : undefined,
  };
}
