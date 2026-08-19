/**
 * The protocol arithmetic the lessons are built on.
 *
 * Every constant and formula here is sourced from the v3 docs and mirrored by the
 * season engine, whose test suite asserts them. The lessons need their own copy
 * because a lesson has to show the working live, long before the grader is ever
 * contacted.
 *
 * Nothing here states a fee rate. The docs render those live through <FeeValue>
 * because governance can change them, so a lesson teaches the shape of a cost
 * rather than a number that could go stale.
 */

/** Borrowing stops here. Hitting it does not close a position. */
export const MAX_LTV = 0.9;

/** Only ever reached because the MYT lost backing, never because a price moved. */
export const LIQ_LTV = 0.95;

export const WEEKS_PER_YEAR = 52;

/**
 * Collateral you can take back right now, with no repayment first.
 *
 * The remaining debt still has to sit at or under the borrowing cap once the
 * withdrawal is done, which is what makes this less than the obvious answer.
 * Verified against the team's own tutorial fixture: 5 WETH against 2 alETH of
 * debt gives 2.78, landing the position exactly at the cap.
 */
export function withdrawable(collateral, debt) {
  return Math.max(collateral - debt / MAX_LTV, 0);
}

/** How much more can be borrowed before the cap stops you. */
export function borrowable(collateral, debt) {
  return Math.max(collateral * MAX_LTV - debt, 0);
}

export function ltvOf(collateral, debt) {
  return collateral > 0 ? debt / collateral : 0;
}

/**
 * alAssets are minted at face value and may trade below it, so raising a given
 * amount of spendable capital means borrowing more than that amount.
 */
export function borrowNeededFor(cashWanted, price) {
  return price > 0 ? cashWanted / price : 0;
}

/** What the discount costs a borrower up front, in units of the underlying. */
export function discountCost(borrowed, price) {
  return borrowed * (1 - price);
}

/**
 * The highest starting LTV that survives a given loss of MYT backing.
 *
 * If backing falls by `loss`, collateral value falls with it and the ratio
 * becomes debt / (collateral * (1 - loss)). Setting that equal to the liquidation
 * threshold gives the survivable starting LTV. The borrowing cap applies too, so
 * the answer is never above it.
 */
export function survivableLtv(loss) {
  return Math.min(LIQ_LTV * (1 - loss), MAX_LTV);
}

/** Where a position's LTV lands after the MYT reports a loss. */
export function ltvAfterLoss(startingLtv, loss) {
  return loss >= 1 ? Infinity : startingLtv / (1 - loss);
}

export function survivesLoss(startingLtv, loss) {
  return ltvAfterLoss(startingLtv, loss) <= LIQ_LTV;
}

/**
 * Annualised return on buying an alAsset below par and redeeming 1:1 at maturity.
 *
 * Stated simple rather than compounded, because that is how a fixed-term rate is
 * quoted and because compounding would assume a reinvestment the learner has not
 * been shown.
 */
export function annualisedFromDiscount(price, weeks) {
  if (price <= 0 || weeks <= 0) return 0;
  return ((1 - price) / price) * (WEEKS_PER_YEAR / weeks) * 100;
}

/** The gain over one term, before annualising. */
export function termReturn(price) {
  return price > 0 ? ((1 - price) / price) * 100 : 0;
}

/**
 * The smallest deposit that raises a required amount of capital and still
 * survives a coming loss of backing.
 *
 * Composes the two lessons before it: the borrow needed once the discount is
 * accounted for, divided by the highest LTV that survives the loss.
 */
export function minimumCollateral(cashWanted, price, loss) {
  return borrowNeededFor(cashWanted, price) / survivableLtv(loss);
}
