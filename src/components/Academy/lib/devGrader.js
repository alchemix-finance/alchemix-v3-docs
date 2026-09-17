import { debtRemainingPct } from "./model";
import { CAPS, bestBlend } from "./myt";
import {
  MAX_LTV,
  annualisedFromDiscount,
  minimumCollateral,
  survivableLtv,
  withdrawable,
} from "./protocol";
import { QUESTIONS, permutation } from "./questions";

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

/* ── Multiple choice, mirrored from the engine ───────────── */

/**
 * Build a challenge for a choice lesson.
 *
 * The variant and the seed are the only state: the variant picks the question,
 * the seed fixes the order its options are shown in. Both travel in `fields`, so
 * the grader below can rebuild the same order without storing anything.
 */
function choiceChallenge(lessonId) {
  const bank = QUESTIONS[lessonId];
  const variant = Math.floor(Math.random() * bank.length);
  const seed = 1 + Math.floor(Math.random() * 999_999);
  const q = bank[variant];
  const order = permutation(q.options.length, seed);

  return {
    fields: { variant, seed },
    prompt: q.prompt,
    controls: { choices: order.map((i) => q.options[i]) },
  };
}

function choiceGrade(lessonId, f, answer) {
  const q = QUESTIONS[lessonId][Math.trunc(f.variant)];
  const order = permutation(q.options.length, f.seed);
  const correctIndex = order.indexOf(q.correct);

  const offered = Number.isInteger(answer) && answer >= 0 && answer < order.length;
  if (!offered) return [-1, correctIndex, 0, "choice", "Pick one of the options."];

  const original = order[answer];
  return [answer, correctIndex, 0, "choice", q.explain[original]];
}

/* ── Per-lesson generators ───────────────────────────────── */

const GENERATORS = {
  /* Beginner track. */

  "what-alchemix-does": () => choiceChallenge("what-alchemix-does"),
  "self-repaying": () => choiceChallenge("self-repaying"),
  "what-can-go-wrong": () => choiceChallenge("what-can-go-wrong"),
  "the-transmuter": () => choiceChallenge("the-transmuter"),

  "your-deposit": () => {
    const deposit = pick([5000, 10000, 20000, 25000, 50000]);
    const ratePct = pick([3, 4, 5, 6, 8, 10]);
    return {
      fields: { deposit, ratePct },
      prompt:
        `You deposit ${money(deposit)} USDC. Suppose the vault earns ${ratePct}% ` +
        `over the next year. What is your deposit worth at the end of it?`,
      controls: { slider: { min: deposit, max: deposit * 1.15, step: deposit / 500 } },
    };
  },

  borrowing: () => {
    const deposit = pick([10000, 20000, 30000, 40000, 50000]);
    return {
      fields: { deposit },
      prompt:
        `Your position holds ${money(deposit)} of collateral and you have not borrowed ` +
        `anything yet. What is the most you can borrow against it?`,
      controls: { slider: { min: 0, max: deposit, step: deposit / 500 } },
    };
  },

  /* Intermediate track. */

  "getting-money-back": () => {
    const collateral = pick([10000, 20000, 25000, 40000, 50000]);
    const debt = Math.round(collateral * between(0.2, 0.6, 2));
    return {
      fields: { collateral, debt },
      prompt:
        `A position holds ${money(collateral)} of collateral against ${money(debt)} of debt. ` +
        `How much of that collateral can you withdraw right now, without repaying anything first?`,
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
        `Buying now and waiting for maturity returns what, annualized?`,
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
      controls: { slider: { min: 0, max: cashWanted * 4, step: cashWanted / 250 } },
    };
  },
};

/* ── Per-lesson graders. Each returns [actual, target, tolerance, unit]. ── */

const GRADERS = {
  /* Beginner track. */

  "what-alchemix-does": (f, a) => choiceGrade("what-alchemix-does", f, a),
  "self-repaying": (f, a) => choiceGrade("self-repaying", f, a),
  "what-can-go-wrong": (f, a) => choiceGrade("what-can-go-wrong", f, a),
  "the-transmuter": (f, a) => choiceGrade("the-transmuter", f, a),

  "your-deposit": (f, a) => [a, f.deposit * (1 + f.ratePct / 100), f.deposit * 0.004, "amount"],

  borrowing: (f, a) => [a, f.deposit * MAX_LTV, f.deposit * 0.004, "amount"],

  /* Intermediate track. */

  "getting-money-back": (f, a) => [
    a,
    withdrawable(f.collateral, f.debt),
    f.collateral * 0.004,
    "amount",
  ],

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

  const [actual, target, tolerance, unit, feedback] = grade(params.fields, answer);
  const passed = Number.isFinite(actual) && Math.abs(actual - target) <= tolerance;

  return {
    passed,
    actual: Number(actual.toFixed(2)),
    target: Number(target.toFixed(2)),
    tolerance: Number(tolerance.toFixed(2)),
    unit,
    feedback,
    local: true,
    // Never a valid signature. A locally graded lesson presented at graduation is
    // rejected, which is the correct outcome.
    completion: passed ? `${LOCAL_PREFIX}${lessonId}` : undefined,
  };
}
