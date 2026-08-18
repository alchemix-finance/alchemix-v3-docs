import { debtRemainingPct } from "./model";
import { CAPS, bestBlend } from "./myt";

/**
 * A grader that runs in the browser, for local development only.
 *
 * Why this exists: the checkpoint is the one part of a lesson that needs a
 * server, and requiring a second repo to be running before a lesson page works
 * made the Academy unusable for anyone editing docs. A writer fixing a typo
 * should not have to stand up the season engine to see the page they are
 * editing.
 *
 * Two guarantees, in order of importance:
 *
 * 1. It cannot run in production. Every entry point is behind
 *    `process.env.NODE_ENV !== "production"`, which the build replaces with a
 *    literal, so the branch folds to false in the deployed site. The module may
 *    still be bundled; the path is unreachable.
 * 2. What it issues is worthless. Completions carry a `local:` prefix that no
 *    server signature can match, so a locally finished lesson can never be
 *    redeemed at graduation. That is the safe direction to fail in.
 *
 * Note that this hides nothing that was secret. The lesson already computes the
 * same numbers in the browser to draw its chart and readouts, so the "answer" was
 * always derivable client-side. What the engine actually provides is a signature
 * on the completion, which is why local completions are inert rather than
 * equivalent.
 */
/** Written as a literal comparison so the build can fold it at each call site. */
export const devFallbackEnabled = () => process.env.NODE_ENV !== "production";

export const LOCAL_PREFIX = "local:";

/* ── Generation. Mirrors src/lib/academy/lessons.ts in the engine. ── */

const RATE_MIN = 0.35;
const RATE_MAX = 1.6;
const RATE_STEP = 0.005;
const YIELD_ANNUAL = 0.05;

const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
const between = (lo, hi, dp) => Number((lo + Math.random() * (hi - lo)).toFixed(dp));

function paceChallenge(lessonId) {
  const collateral = pick([10_000, 20_000, 25_000, 50_000]);
  const debt = Math.round(collateral * pick([0.2, 0.3, 0.4, 0.5]));
  const months = pick([12, 18, 24, 30, 36]);

  const rate = between(RATE_MIN, RATE_MAX, 4);
  const fields = { collateral, debt, yieldAnnual: YIELD_ANNUAL, months };
  const targetPct = Number(
    debtRemainingPct({ ...fields, redemptionAnnual: rate }).toFixed(1),
  );

  return {
    params: { lessonId, fields: { ...fields, targetPct } },
    challenge: `${LOCAL_PREFIX}challenge`,
    prompt:
      `A position holds ${collateral.toLocaleString()} of collateral against ` +
      `${debt.toLocaleString()} of debt. Find the redemption rate that leaves ` +
      `${targetPct.toFixed(1)}% of that debt outstanding after ${months} months.`,
    controls: { slider: { min: RATE_MIN, max: RATE_MAX, step: RATE_STEP } },
    local: true,
  };
}

function mixChallenge(lessonId) {
  const conservativeApr = between(3, 5, 1);
  const moderateApr = Number((conservativeApr + between(2, 5, 1)).toFixed(1));
  const aggressiveApr = Number((moderateApr + between(4, 10, 1)).toFixed(1));

  return {
    params: { lessonId, fields: { conservativeApr, moderateApr, aggressiveApr } },
    challenge: `${LOCAL_PREFIX}challenge`,
    prompt:
      `A proposed MYT holds three strategies: Conservative at ${conservativeApr.toFixed(1)}%, ` +
      `Moderate at ${moderateApr.toFixed(1)}%, and Aggressive at ${aggressiveApr.toFixed(1)}%. ` +
      `Find the highest blended APR the DAO could reach without breaching a risk cap.`,
    controls: { caps: CAPS, step: 1 },
    local: true,
  };
}

export function localChallenge(lessonId) {
  if (lessonId === "l1-pace-of-repayment") return paceChallenge(lessonId);
  if (lessonId === "l2-where-yield-comes-from") return mixChallenge(lessonId);
  throw new Error(`No local grader for ${lessonId}.`);
}

/* ── Grading ── */

export function localGrade(lessonId, params, answer) {
  const f = params.fields;

  if (lessonId === "l1-pace-of-repayment") {
    const actual = debtRemainingPct({
      collateral: f.collateral,
      debt: f.debt,
      yieldAnnual: f.yieldAnnual,
      redemptionAnnual: answer,
      months: f.months,
    });
    return outcome(actual, f.targetPct, 1.0, lessonId);
  }

  if (lessonId === "l2-where-yield-comes-from") {
    const target = bestBlend({
      conservative: f.conservativeApr,
      moderate: f.moderateApr,
      aggressive: f.aggressiveApr,
    });
    return outcome(answer, target, 0.05, lessonId);
  }

  throw new Error(`No local grader for ${lessonId}.`);
}

function outcome(actual, target, tolerance, lessonId) {
  const passed = Number.isFinite(actual) && Math.abs(actual - target) <= tolerance;
  return {
    passed,
    actual: Number(actual.toFixed(2)),
    target: Number(target.toFixed(2)),
    tolerance,
    local: true,
    // Never a valid signature. If a locally graded lesson is ever presented at
    // graduation the server rejects it, which is the correct outcome.
    completion: passed ? `${LOCAL_PREFIX}${lessonId}` : undefined,
  };
}
