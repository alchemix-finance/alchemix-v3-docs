/**
 * Drawer math, shared by the Arcana cabinet (decks top to bottom) and a deck's
 * fan (cards left to right), 2026-11-05. Written once so both axes behave the
 * same way.
 *
 * Items sit `step` apart along one axis and each is `item` long, so when
 * step < item they overlap and each later item covers the one before. One
 * item, the gap item, shows whole: every item after it moves on by `open`
 * (item - step), which opens a gap the length of one item. The component only
 * decides indices with these functions; CSS turns each slot's --i and
 * --shift into the same offsets (Badges/cards.module.css, .drawers and .fan).
 */

/**
 * The item under `pos` (px from the start of the axis), given the current gap
 * item. Inside the gap item's span the answer is always that item, so the
 * layout cannot flicker between two answers as the gap moves.
 */
export function indexAt(pos, { n, step, item, open, gap }) {
  if (!(n > 0) || !(step > 0)) return null;
  if (gap !== null && gap !== undefined && pos >= gap * step && pos < gap * step + item) return gap;
  const past = gap !== null && gap !== undefined && pos >= gap * step + item;
  const i = Math.floor((pos - (past ? open : 0)) / step);
  return Math.max(0, Math.min(n - 1, i));
}

/** 1 when slot i sits after the gap item (CSS adds one `open` to its offset), else 0. */
export function shiftOf(i, gap) {
  return gap !== null && gap !== undefined && i > gap ? 1 : 0;
}

/**
 * The cabinet clips its last deck at the bottom of the box: decks sit
 * (box - item) / (n - 1) apart, so at rest the bottom deck shows whole, and
 * with any deck lifted every other deck still shows one step.
 */
export function clipStep(n, length, item) {
  const step = (length - item) / Math.max(1, n - 1);
  return { step, open: Math.max(0, item - step) };
}

/**
 * The fan runs edge to edge with nothing clipped. With room to spare the cards
 * spread evenly ((length - item) / (n - 1) apart, no overlap). When they
 * overlap, the step shrinks so the open gap still fits: the first card starts
 * at 0 and the last ends at `length` whichever card is lifted. Mirrors the
 * --fan-step and --fan-open rules in cards.module.css.
 */
export function fitStep(n, length, item) {
  const even = (length - item) / Math.max(1, n - 1);
  const gapped = n > 2 ? (length - 2 * item) / (n - 2) : even;
  const step = Math.min(even, gapped);
  return { step, open: Math.max(0, item - step) };
}

/**
 * In the fan the last card has no cards after it to move, so lifting it opens
 * the gap before it instead (the gap item is the one before last). That keeps
 * the fan's two ends fixed.
 */
export function fitGap(h, n) {
  if (h === null || h === undefined) return null;
  return Math.min(h, Math.max(0, n - 2));
}

/** CSS counts for a slot list of n items: n - 1 and n - 2, never zero. */
export function countVars(n) {
  return { "--n": n, "--n1": Math.max(1, n - 1), "--n2": n > 2 ? n - 2 : 0.01 };
}
