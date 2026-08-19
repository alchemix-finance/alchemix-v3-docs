/**
 * The track, as data.
 *
 * One source of truth for the track map and every lesson page, so a lesson's
 * number, title and blurb cannot drift between the places they appear.
 *
 * `id` must match the lesson id the season engine grades against
 * (`src/lib/academy/lessons.ts` there). A mismatch means a completed lesson never
 * shows as complete. Ids are topic slugs rather than numbers, so the order can
 * change without invalidating stored progress.
 */
export const TRACK = [
  {
    n: 1,
    id: "opening-a-position",
    slug: "/academy/opening-a-position",
    title: "What you actually get",
    blurb: "What a deposit turns into, what borrowing mints, and why you cannot take it all back.",
    minutes: 7,
    ready: true,
  },
  {
    n: 2,
    id: "pace-of-repayment",
    slug: "/academy/pace-of-repayment",
    title: "The pace of repayment",
    blurb: "What sets the pace a loan clears at, and what has no effect on it.",
    minutes: 8,
    ready: true,
  },
  {
    n: 3,
    id: "where-yield-comes-from",
    slug: "/academy/where-yield-comes-from",
    title: "Where the yield comes from",
    blurb: "Where your collateral works while the loan runs, and the ceilings the DAO puts on risk.",
    minutes: 8,
    ready: true,
  },
  {
    n: 4,
    id: "cost-of-borrowing",
    slug: "/academy/cost-of-borrowing",
    title: "What borrowing costs",
    blurb: "There is no interest rate, so working out what you pay instead, and when.",
    minutes: 8,
    ready: true,
  },
  {
    n: 5,
    id: "ltv-and-risk",
    slug: "/academy/ltv-and-risk",
    title: "LTV and what can go wrong",
    blurb: "Why a price move cannot liquidate you, and what actually can.",
    minutes: 9,
    ready: true,
  },
  {
    n: 6,
    id: "transmuter-and-peg",
    slug: "/academy/transmuter-and-peg",
    title: "The Transmuter and the peg",
    blurb: "How a discount on an alAsset closes, and how to be the one who closes it.",
    minutes: 9,
    ready: true,
  },
  {
    n: 7,
    id: "capstone",
    slug: "/academy/capstone",
    title: "Capstone",
    blurb: "One position, sized to raise what you need and survive what is coming.",
    minutes: 10,
    ready: true,
  },
];

export const TOTAL_POINTS = TRACK.length * 100;

export function lessonById(id) {
  return TRACK.find((l) => l.id === id) ?? null;
}

/**
 * Resolve each lesson to one of three display states.
 *
 * "current" is the first unfinished lesson that is built. Only one lesson is ever
 * current, because the track map's job is to leave no doubt about what to do next.
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
