/**
 * The track, as data.
 *
 * One source of truth for both the track map and the lesson pages, so a lesson's
 * number, title and blurb cannot drift between the two places they appear.
 *
 * `id` must match the lesson id the season engine grades against
 * (`src/lib/academy/lessons.ts` there). A mismatch means a completed lesson never
 * shows as complete.
 */
export const TRACK = [
  {
    n: 1,
    id: "l1-pace-of-repayment",
    slug: "/academy/pace-of-repayment",
    title: "The pace of repayment",
    blurb: "What sets the pace a loan clears at, and what has no effect on it.",
    minutes: 8,
    ready: true,
  },
  {
    n: 2,
    id: "l2-where-yield-comes-from",
    title: "Where the yield comes from",
    blurb: "Where your collateral works while the loan runs, and what the risk mix costs you.",
    minutes: 8,
    ready: false,
  },
  {
    n: 3,
    id: "l3-ltv-and-redemption-pressure",
    title: "LTV and redemption pressure",
    blurb: "How your LTV changes your exposure to redemptions, with no price liquidation involved.",
    minutes: 10,
    ready: false,
  },
  {
    n: 4,
    id: "l4-alassets-and-the-peg",
    title: "alAssets and the peg",
    blurb: "How the Transmuter closes the gap when an alAsset trades below face value.",
    minutes: 9,
    ready: false,
  },
  {
    n: 5,
    id: "l5-redemptions-and-earmarking",
    title: "Redemptions and earmarking",
    blurb: "Where your debt sits in the redemption queue, and why earmarked debt is repaid with MYT.",
    minutes: 9,
    ready: false,
  },
  {
    n: 6,
    id: "l6-capstone",
    title: "Capstone",
    blurb: "Take a position through a full cycle, from deposit to withdrawal.",
    minutes: 15,
    ready: false,
  },
];

export const TOTAL_POINTS = TRACK.length * 100;

export function lessonById(id) {
  return TRACK.find((l) => l.id === id) ?? null;
}

/**
 * Resolve each lesson to one of three display states.
 *
 * "current" is the first unfinished lesson that is actually built. Only one
 * lesson is ever current, because the track map's whole job is to leave no doubt
 * about what to do next.
 */
export function trackState(completedIds) {
  const done = new Set(completedIds);
  let currentTaken = false;

  return TRACK.map((lesson) => {
    if (done.has(lesson.id)) return { ...lesson, state: "done" };
    if (!currentTaken && lesson.ready) {
      currentTaken = true;
      return { ...lesson, state: "current" };
    }
    return { ...lesson, state: "locked" };
  });
}
