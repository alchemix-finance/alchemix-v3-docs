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

/**
 * The redemption rate the lessons project at.
 *
 * An example, and every screen that uses it says so, but it has to be a rate
 * the protocol plausibly runs at or the lessons teach the wrong shape. The
 * lessons used 35% for a year, which is roughly half the low end of what the
 * live vaults have been reading: checked 2026-09-17, Ethereum's USDC vault
 * showed 87.70% and its ETH vault 63.94%, the USDC vault's 30-day average
 * earmarking rate was 77.02%, and the capture in the borrowing tutorial shows
 * 58.61%. 70% sits in the middle of that band.
 *
 * The difference is not cosmetic. Left alone for a year, a 5,000 loan has 3,250
 * outstanding at 35% and 1,500 at 70% (the beginner track draws the rate at its
 * definition, see `simpleCurve` in model.js), so the old figure described a
 * product that repays itself half as fast as this one does.
 *
 * Any lesson that projects a balance reads this rather than declaring its own,
 * so the beginner and intermediate tracks cannot drift to different paces. It
 * is display only: every graded checkpoint gets its rate from the engine.
 */
export const EXAMPLE_REDEMPTION = 0.7;

/** What the lessons suppose the strategies earn. An example, like the rate above. */
export const EXAMPLE_YIELD = 0.05;

/**
 * The market price of an alAsset in the examples.
 *
 * Checked 2026-09-17: the Fixed Yield page quoted 0.959 on Ethereum and 0.950
 * on Optimism, and the vault visualizer read 0.958. Three lessons price the
 * discount and they each declared their own 0.97, which is outside that band in
 * the direction that flatters the protocol on the cost lesson and understates
 * it on the peg lesson. One constant so they cannot disagree.
 *
 * At 0.96 over a 20-week term the peg lesson annualizes to 10.83%, against the
 * 10.51% the Fixed Yield page was projecting on the same day.
 *
 * Since 2026-09-19 the four lessons that price the discount read the live
 * figure through `useAlUsdPrice` and show this one only until that read
 * resolves, or when it fails or returns a price the lessons cannot teach from.
 * The track map's Visualizer sheet still shows it, as the example it is.
 */
export const EXAMPLE_AL_PRICE = 0.96;

export const WEEKS_PER_YEAR = 52;

/**
 * The DAO's risk caps on an MYT, from `docs/user/concepts/myt-and-yield.md`.
 *
 * A cap counts its own class and every riskier one, so Aggressive is capped at
 * 20% on its own and Moderate at 60% across Moderate and Aggressive together.
 * Conservative is uncapped.
 *
 * `AGGRESSIVE_CAP` is what lets the beginner track answer "so what LTV should I
 * open at?" rather than deferring the whole question: the largest loss the
 * Aggressive class can inflict is its own cap, and `survivableLtv` turns that
 * into a starting LTV. Caps are checked when the DAO allocates, and a run of
 * withdrawals can leave an existing allocation above its cap until the DAO
 * rebalances, so this bounds the intent rather than every instant.
 */
export const AGGRESSIVE_CAP = 0.2;
export const MODERATE_CAP = 0.6;

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
