/**
 * How a loan left alone repays itself, for every lesson that draws it.
 *
 * The redemption rate is a pace: the share of debt that redemptions would clear
 * in a year at today's queue. The contract earmarks the same fraction of every
 * position's remaining debt each window (`_earmark` in AlchemistV3.sol), so with
 * the rate held steady a loan falls by a share of what is LEFT, not by a fixed
 * amount. At 70% a 5,000 loan loses 70% / 12 of its balance each month: 292 the
 * first month, 275 the next, and about 2,430 is still owed after a year.
 *
 * From 2026-09-22 to 2026-10-08 the lessons drew a straight line instead (1,500
 * after a year), because "70% a year" is easy to read as 70% of
 * the original loan. That line is
 * only possible if the rate climbs all year. The lessons now teach the rule in
 * the question rather than bending the model to the misreading.
 *
 * Monthly steps on purpose: a learner can check them with a calculator. The
 * contract works per block, which reads about 2,480 on the same inputs; the gap
 * is far smaller than any real month-to-month move in the rate.
 */

/** The borrower redemption fee, spent from collateral on each redemption. */
export const PROTOCOL_FEE = 0.0025;

/** The share of what is left that one month of redemptions clears. */
const monthly = (redemptionAnnual) => redemptionAnnual / 12;

/**
 * Deposited and borrowed over time, in the caller's own units, sampled monthly.
 *
 * Each month redemptions clear a twelfth of the annual rate from the balance
 * that is left. Collateral compounds the yield and is spent on each redemption
 * plus the fee.
 */
export function simpleCurve({ collateral, debt, yieldAnnual, redemptionAnnual, months }) {
  const share = monthly(redemptionAnnual);
  const growth = Math.pow(1 + yieldAnnual, 1 / 12);
  const points = [{ month: 0, debt, collateral }];
  let d = debt;
  let c = collateral;
  for (let m = 1; m <= months; m++) {
    c *= growth;
    const redeemed = Math.min(d * share, d);
    d -= redeemed;
    c = Math.max(c - redeemed * (1 + PROTOCOL_FEE), 0);
    points.push({ month: m, debt: d, collateral: c });
  }
  return points;
}

/**
 * The same curve as a share of what was borrowed, for charting. It does not
 * depend on the size of the loan, which is what the pace lesson teaches.
 */
export function debtCurve({ redemptionAnnual, months }) {
  return simpleCurve({ collateral: 0, debt: 1, yieldAnnual: 0, redemptionAnnual, months })
    .map((p) => ({ month: p.month, pct: p.debt * 100 }));
}

/** Debt left after `months`, as a share of what was borrowed. */
export function debtRemainingPct({ redemptionAnnual, months }) {
  return 100 * Math.pow(Math.max(1 - monthly(redemptionAnnual), 0), months);
}
