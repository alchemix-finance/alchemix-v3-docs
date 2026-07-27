// Faithful port of the dApp vault visualizer model.
// Source: alchemix-v3-fe VaultVisualizationChart/calculations.ts
//
// Docs illustration note: the live tool overlays the real near-term redemption
// schedule from the Transmuter ("on chain data") before switching to the
// behavioural projection ("simulated data"). A static docs example has no real
// schedule, so the whole horizon uses the projection: the midpoint of an
// optimistic path (others relever, debt holds, redemption is a constant fraction
// of remaining debt, an exponential tail) and a pessimistic path (no one
// relevers, redemption is a constant amount, a straight line to zero).

const DAYS_PER_YEAR = 365;

// Deposit (collateral) and Debt lines fall on the left axis; Net Value on the right.
export function projectSeries({
  collateral, // initial deposit value
  debt, // initial borrowed amount
  leverage, // boost multiplier (1 = no looping)
  yieldAnnual, // e.g. 0.05
  redemptionAnnual, // e.g. 0.80
  months,
  protocolFee, // borrower redemption fee, e.g. 0.0025
}) {
  const totalDays = Math.max(1, Math.round((months * DAYS_PER_YEAR) / 12));

  let collO = collateral * leverage;
  let debtO = debt * leverage;
  let collP = collO;
  let debtP = debtO;

  const dailyYield = Math.pow(1 + yieldAnnual, 1 / DAYS_PER_YEAR);
  const dailyRed = redemptionAnnual / DAYS_PER_YEAR;
  // Pessimistic straight line: a constant daily amount fixed to the starting debt.
  const pessPerDay = dailyRed * debtP;

  const points = [];
  const push = (day) => {
    const c = (collO + collP) / 2;
    const d = (debtO + debtP) / 2;
    points.push({ month: (day * 12) / DAYS_PER_YEAR, collateral: c, debt: d, netValue: c - d });
  };

  push(0);
  for (let day = 1; day <= totalDays; day++) {
    collO *= dailyYield;
    collP *= dailyYield;

    // Optimistic: constant fraction of what remains (exponential decay).
    if (debtO > 0) {
      const r = Math.min(dailyRed * debtO, debtO);
      debtO -= r;
      collO = Math.max(collO - r * (1 + protocolFee), 0);
    }
    // Pessimistic: constant amount (straight line to zero).
    if (debtP > 0) {
      const r = Math.min(pessPerDay, debtP);
      debtP -= r;
      collP = Math.max(collP - r * (1 + protocolFee), 0);
    }

    if (day % 7 === 0 || day === totalDays) push(day);
  }

  return points;
}

// Source: computeVaultMetrics. The loan cost is the discount locked in when the
// borrowed alAsset is sold below peg; profit is the change in Net Value net of it.
export function computeMetrics({ points, collateral, debt, leverage, price }) {
  const startingNet = collateral * leverage - debt * leverage;
  const endingNet = points[points.length - 1]?.netValue ?? 0;
  const startingDebt = debt * leverage;

  const costOfLoan = startingDebt * (1 - price);
  const profit = endingNet - startingNet - costOfLoan;
  const profitPercent = startingNet !== 0 ? (profit / startingNet) * 100 : 0;

  return { costOfLoan, profit, profitPercent };
}
