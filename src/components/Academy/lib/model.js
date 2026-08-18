import { projectSeries } from "@site/src/components/VaultVisualizer/model";

/**
 * Debt remaining, as a share of what was borrowed.
 *
 * Reuses the visualizer model rather than restating it. That matters more than
 * usual here: the academy grades a learner's answer by re-running the same
 * projection on the server, so if this file drifted from that one the lesson
 * would mark correct answers wrong.
 *
 * The series is sampled weekly, but `projectSeries` always emits a final point at
 * the end of its horizon, so asking for exactly `months` puts a sample precisely
 * on the target. Reading a 12-month value off a 48-month series instead lands on
 * day 364 and reads about 0.2 points high. Harmless against a 1 point tolerance,
 * but there is no reason to introduce it.
 */
export const PROTOCOL_FEE = 0.0025;

export function debtRemainingPct({ collateral, debt, yieldAnnual, redemptionAnnual, months }) {
  if (debt <= 0) return 0;

  const points = projectSeries({
    collateral,
    debt,
    leverage: 1,
    yieldAnnual,
    redemptionAnnual,
    months,
    protocolFee: PROTOCOL_FEE,
  });

  const nearest = points.reduce((best, p) =>
    Math.abs(p.month - months) < Math.abs(best.month - months) ? p : best,
  );
  return (nearest.debt / debt) * 100;
}

/** The whole debt curve, as percentages, for charting. */
export function debtCurve({ collateral, debt, yieldAnnual, redemptionAnnual, months }) {
  if (debt <= 0) return [{ month: 0, pct: 0 }];

  return projectSeries({
    collateral,
    debt,
    leverage: 1,
    yieldAnnual,
    redemptionAnnual,
    months,
    protocolFee: PROTOCOL_FEE,
  }).map((p) => ({ month: p.month, pct: (p.debt / debt) * 100 }));
}
