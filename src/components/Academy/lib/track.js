/**
 * The tracks, as data.
 *
 * One source of truth for the track map and every lesson page, so a lesson's
 * number, title and blurb cannot drift between the places they appear.
 *
 * `id` must match the lesson id the season engine grades against
 * (`src/lib/academy/lessons.ts` there). A mismatch means a completed lesson never
 * shows as complete. Ids are topic slugs rather than numbers, so the order can
 * change without invalidating stored progress.
 *
 * Two tracks, and the split between them is deliberate. The beginner track
 * covers what a user does with the product and asks for at most one arithmetic
 * step. The advanced track goes after the mechanism underneath: inverting a
 * projection, optimising an allocation, pricing a discount. Both are worth
 * teaching. Teaching them in one track is what made the first version
 * overwhelming.
 */

export const BEGINNER = [
  {
    n: 1,
    id: "what-alchemix-does",
    slug: "/academy/what-alchemix-does",
    title: "What Alchemix does",
    blurb: "Three things the protocol offers, and the one that surprises people.",
    minutes: 5,
    ready: true,
  },
  {
    n: 2,
    id: "your-deposit",
    slug: "/academy/your-deposit",
    title: "Your deposit and what it earns",
    blurb: "Where your money goes when you deposit it, and who decides what it does.",
    minutes: 6,
    ready: true,
  },
  {
    n: 3,
    id: "borrowing",
    slug: "/academy/borrowing",
    title: "Borrowing against your deposit",
    blurb: "How much you can borrow, what you receive, and what it costs to hold.",
    minutes: 6,
    ready: true,
  },
  {
    n: 4,
    id: "self-repaying",
    slug: "/academy/self-repaying",
    title: "The loan repays itself",
    blurb: "Watch a balance go down on its own, and see what would push it back up.",
    minutes: 7,
    ready: true,
  },
  {
    n: 5,
    id: "getting-money-back",
    slug: "/academy/getting-money-back",
    title: "Getting your money back",
    blurb: "Two ways out, and why one of them gives you less than you expect.",
    minutes: 7,
    ready: true,
  },
  {
    n: 6,
    id: "what-can-go-wrong",
    slug: "/academy/what-can-go-wrong",
    title: "What can go wrong",
    blurb: "The risk that does not exist here, and the one that does.",
    minutes: 7,
    ready: true,
  },
  {
    n: 7,
    id: "the-transmuter",
    slug: "/academy/the-transmuter",
    title: "The Transmuter",
    blurb: "Turn alAssets back into the real thing at 1:1, once you have waited.",
    minutes: 6,
    ready: true,
  },
];

/**
 * The advanced track.
 *
 * Built, graded, and through the same tone pass the beginner track was written
 * under. Held back from the track map until the lessons have had a walkthrough;
 * flipping ready publishes one. Listed here so the map can show what is coming
 * next.
 */
export const ADVANCED = [
  {
    n: 1,
    id: "pace-of-repayment",
    slug: "/academy/pace-of-repayment",
    title: "The pace of repayment",
    blurb: "What sets the speed a loan clears at, and what has no effect on it.",
    minutes: 8,
    ready: false,
  },
  {
    n: 2,
    id: "where-yield-comes-from",
    slug: "/academy/where-yield-comes-from",
    title: "Inside the Mix-Yield Token",
    blurb: "The strategy mix, and the ceilings the DAO puts on risk.",
    minutes: 8,
    ready: false,
  },
  {
    n: 3,
    id: "cost-of-borrowing",
    slug: "/academy/cost-of-borrowing",
    title: "What borrowing really costs",
    blurb: "There is no interest rate, so working out what you pay instead, and when.",
    minutes: 8,
    ready: false,
  },
  {
    n: 4,
    id: "ltv-and-risk",
    slug: "/academy/ltv-and-risk",
    title: "Choosing an LTV",
    blurb: "How far a position can fall before the threshold reaches it.",
    minutes: 9,
    ready: false,
  },
  {
    n: 5,
    id: "transmuter-and-peg",
    slug: "/academy/transmuter-and-peg",
    title: "The peg and the discount",
    blurb: "How a discount on an alAsset closes, and how to be the one who closes it.",
    minutes: 9,
    ready: false,
  },
  {
    n: 6,
    id: "capstone",
    slug: "/academy/capstone",
    title: "Capstone",
    blurb: "One position, sized to raise what you need and survive what is coming.",
    minutes: 10,
    ready: false,
  },
];

/** The track graduation is measured against. */
export const TRACK = BEGINNER;

export const TOTAL_POINTS = BEGINNER.length * 100;

export function lessonById(id) {
  return [...BEGINNER, ...ADVANCED].find((l) => l.id === id) ?? null;
}

/**
 * Resolve each lesson to one of three display states.
 *
 * "current" is the first unfinished lesson that is built. Only one lesson is ever
 * current, because the track map's job is to leave no doubt about what to do next.
 */
export function trackState(completedIds, lessons = BEGINNER) {
  const done = new Set(completedIds);
  let currentTaken = false;

  return lessons.map((lesson) => {
    if (done.has(lesson.id)) return { ...lesson, state: "done" };
    if (!currentTaken && lesson.ready) {
      currentTaken = true;
      return { ...lesson, state: "current" };
    }
    return { ...lesson, state: "locked" };
  });
}
