/**
 * How a loan left alone repays itself, for every lesson that draws it.
 *
 * The docs define the redemption rate as the share of debt that redemptions
 * repay in one year, so at 70% a loan of 5,000 has 1,500 left after twelve
 * months. The lessons draw exactly that: a straight line, the path the vault
 * visualizer draws as its pessimistic one.
 *
 * The visualizer's own projection (`VaultVisualizer/model.js`) averages that
 * line with a curve that redeems a share of whatever remains, and on the same
 * inputs it reads about 2,000 at twelve months. The Academy used it until the
 * first outside reviewer, told "70% a year", did the arithmetic, got 1,500, and
 * asked which answer was wrong. A learner handed two answers to one sum learns
 * neither, so every lesson now draws the rate at its definition, and none of
 * the engine's questions depends on the curve's shape.
 */

/** The borrower redemption fee, spent from collateral on each redemption. */
export const PROTOCOL_FEE = 0.0025;

/**
 * Deposited and borrowed over time, in the caller's own units, sampled monthly.
 *
 * The debt falls by the same amount each month until it is gone. Collateral
 * compounds the yield and is spent on each redemption plus the fee.
 */
export function simpleCurve({ collateral, debt, yieldAnnual, redemptionAnnual, months }) {
  const perMonth = (debt * redemptionAnnual) / 12;
  const points = [];
  for (let m = 0; m <= months; m++) {
    const redeemed = Math.min(perMonth * m, debt);
    const grown = collateral * Math.pow(1 + yieldAnnual, m / 12);
    points.push({
      month: m,
      debt: debt - redeemed,
      collateral: Math.max(grown - redeemed * (1 + PROTOCOL_FEE), 0),
    });
  }
  return points;
}

/**
 * The same line as a share of what was borrowed, for charting. It does not
 * depend on the size of the loan, which is what the pace lesson teaches.
 *
 * The month the loan is cleared rarely falls on a whole month, so that point is
 * added exactly; monthly samples alone draw a kink just short of zero.
 */
export function debtCurve({ redemptionAnnual, months }) {
  const points = simpleCurve({ collateral: 0, debt: 1, yieldAnnual: 0, redemptionAnnual, months })
    .map((p) => ({ month: p.month, pct: p.debt * 100 }));
  const cleared = 12 / redemptionAnnual;
  if (cleared < months && !Number.isInteger(cleared)) {
    points.push({ month: cleared, pct: 0 });
    points.sort((a, b) => a.month - b.month);
  }
  return points;
}

/** Debt left after `months`, as a share of what was borrowed. */
export function debtRemainingPct({ redemptionAnnual, months }) {
  return Math.max(0, 100 - redemptionAnnual * 100 * (months / 12));
}
