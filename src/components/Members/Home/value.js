/**
 * Ticket 21: the numbers the page shows from the engine's value then and now
 * (lookup.positions[].value) and vault rates (lookup.rates). Amounts stay
 * BigInt until they are formatted, so nothing rounds on the way.
 */

/** Growth of one position's collateral since its start: the amount (18dp string) and the fraction. */
export function growthOf(value) {
  if (!value) return null;
  try {
    const then = BigInt(value.valueThen);
    const now = BigInt(value.valueNow);
    if (then <= 0n) return null;
    const amount = now - then;
    return { amount: amount.toString(), fraction: Number((amount * 1_000_000n) / then) / 1e6 };
  } catch {
    return null;
  }
}

/** The rate to quote for a market: the 30-day figure when there is one, else the 7-day. */
export function quotedRate(rate) {
  if (!rate) return null;
  if (typeof rate.trailing30d === "number") return { value: rate.trailing30d, days: 30 };
  if (typeof rate.trailing7d === "number") return { value: rate.trailing7d, days: 7 };
  return null;
}
