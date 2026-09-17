/**
 * MYT composition rules.
 *
 * Source: `docs/user/concepts/myt-and-yield.md` and
 * `docs/governance/guides/myt-strategies.md`. Every strategy is classified
 * Conservative, Moderate or Aggressive, and each class carries two ceilings:
 *
 *                  one strategy   all strategies at this level and riskier
 *   Conservative   none           none
 *   Moderate       40%            60%
 *   Aggressive     20%            20%
 *
 * The second column is cumulative, which is the part that is easy to read
 * wrongly. Moderate's 60% covers Moderate and Aggressive together, and
 * Aggressive's 20% covers Aggressive alone. Fill Aggressive to 20% and Moderate
 * has 40% of the 60% they share left to it.
 *
 * Caps are checked when the DAO allocates. Because they are relative to vault
 * size, a run of user withdrawals can leave an existing allocation above its cap
 * until the DAO rebalances.
 *
 * The lessons model one strategy per class, where the two ceilings on Moderate
 * happen to agree: 40% per strategy, and 40% left of the shared 60% once
 * Aggressive is full.
 *
 * The season engine mirrors these values and its test suite asserts them, so a
 * governance change fails a test rather than quietly teaching an old number.
 * This copy exists because the lesson has to render the rule before the grader
 * is ever contacted.
 */
export const CAPS = {
  moderate: { perStrategy: 0.4, cumulative: 0.6 },
  aggressive: { perStrategy: 0.2, cumulative: 0.2 },
};

/** The most a single Aggressive strategy can hold. Both of its ceilings agree. */
export const MAX_AGGRESSIVE_PCT = 100 * Math.min(CAPS.aggressive.perStrategy, CAPS.aggressive.cumulative);

/**
 * The most a single Moderate strategy can hold, given what Aggressive takes.
 *
 * Two ceilings bind: its own 40%, and whatever is left of the 60% it shares with
 * Aggressive.
 */
export function maxModeratePct(aggressivePct) {
  const shared = 100 * CAPS.moderate.cumulative - aggressivePct;
  return Math.max(Math.min(100 * CAPS.moderate.perStrategy, shared), 0);
}

/** Blended APR of an allocation, whether or not it is legal. */
export function blend(aprs, moderatePct, aggressivePct) {
  const conservativePct = 100 - moderatePct - aggressivePct;
  return (
    (aggressivePct / 100) * aprs.aggressive +
    (moderatePct / 100) * aprs.moderate +
    (conservativePct / 100) * aprs.conservative
  );
}

/**
 * Why an allocation is illegal, or null if it is not.
 *
 * Ordered riskiest first, so a composition that breaks two rules is reported
 * against the tighter one.
 */
export function capBreach(moderatePct, aggressivePct) {
  if (moderatePct + aggressivePct > 100) return "Allocation exceeds 100%";
  if (aggressivePct > MAX_AGGRESSIVE_PCT) {
    return `Breaches the ${MAX_AGGRESSIVE_PCT}% Aggressive cap`;
  }
  if (moderatePct > 100 * CAPS.moderate.perStrategy) {
    return `Breaches the ${100 * CAPS.moderate.perStrategy}% cap on one Moderate strategy`;
  }
  if (moderatePct + aggressivePct > 100 * CAPS.moderate.cumulative) {
    return `Breaches the ${100 * CAPS.moderate.cumulative}% cap on Moderate and Aggressive together`;
  }
  return null;
}

/**
 * The best blended APR reachable without breaching a cap.
 *
 * Filling each class to its ceiling in yield order is optimal because the higher
 * risk class always carries the higher yield, which the challenge generator
 * guarantees by construction.
 */
export function bestBlend(aprs) {
  return blend(aprs, maxModeratePct(MAX_AGGRESSIVE_PCT), MAX_AGGRESSIVE_PCT);
}
