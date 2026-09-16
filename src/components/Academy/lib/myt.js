/**
 * MYT composition rules.
 *
 * Source: `docs/governance/guides/myt-strategies.md`. Every strategy is
 * classified Conservative, Moderate or Aggressive, and each class carries a
 * ceiling on how much of the vault it may occupy:
 *
 *   Conservative   no cap
 *   Moderate       25% per strategy, 40% across all Moderate strategies
 *   Aggressive     10% per strategy, 10% across all Aggressive strategies
 *
 * The same file states why the caps exist: they are what lets a user set an LTV
 * that keeps liquidation risk low. The Mix-Yield Token lesson lands that point.
 *
 * The season engine mirrors these values and its test suite asserts them, so a
 * governance change fails a test rather than quietly teaching an old number.
 * This copy exists because the lesson has to render the rule before the grader
 * is ever contacted.
 */
export const CAPS = { moderate: 0.4, aggressive: 0.1 };

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
 * The best blended APR reachable without breaching a cap.
 *
 * Filling each class to its ceiling in yield order is optimal because the higher
 * risk class always carries the higher yield, which the challenge generator
 * guarantees by construction.
 */
export function bestBlend(aprs) {
  return blend(aprs, CAPS.moderate * 100, CAPS.aggressive * 100);
}
