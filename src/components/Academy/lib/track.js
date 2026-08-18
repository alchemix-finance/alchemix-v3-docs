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
    blurb: "What decides how fast a loan clears, and what has no effect on it at all.",
    minutes: 8,
    ready: true,
  },
  {
    n: 2,
    id: "l2-where-yield-comes-from",
    title: "Where the yield comes from",
    blurb: "Your collateral is not sitting still. Build an allocation that hits a target return without breaking the risk ceiling.",
    minutes: 8,
    ready: false,
  },
  {
    n: 3,
    id: "l3-ltv-and-redemption-pressure",
    title: "LTV and redemption pressure",
    blurb: "Why a high LTV changes your exposure even though the price cannot liquidate you.",
    minutes: 10,
    ready: false,
  },
  {
    n: 4,
    id: "l4-alassets-and-the-peg",
    title: "alAssets and the peg",
    blurb: "What closes the gap when alUSD trades under a dollar.",
    minutes: 9,
    ready: false,
  },
  {
    n: 5,
    id: "l5-redemptions-and-earmarking",
    title: "Redemptions and earmarking",
    blurb: "Where your debt sits in the queue, and why earmarked debt needs MYT.",
    minutes: 9,
    ready: false,
  },
  {
    n: 6,
    id: "l6-capstone",
    title: "Capstone",
    blurb: "Run a position through a full cycle, start to finish.",
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
