/**
 * The tracks, as data.
 *
 * One source of truth for the track map, the shell's progress count, and every
 * lesson page, so a lesson's number, title, and blurb cannot drift between the
 * places they appear.
 *
 * `id` must match the lesson id the season engine grades against
 * (`src/lib/academy/lessons.ts` there). A mismatch means a completed lesson never
 * shows as complete. Ids are topic slugs rather than numbers, so a lesson can
 * change track or order without invalidating stored progress.
 *
 * Two tracks.
 *
 * The beginner track is a brief look at the mechanics a typical user interacts
 * with: six lessons, one app screen each, and one $10,000 position carried
 * across them. Each lesson has one visual through-line that mirrors a real
 * screen in the app, and the learner pushes on it before being told the answer.
 *
 * The intermediate track walks through every important mechanic and how it
 * functions, for a learner committed to understanding the protocol: reading a
 * position, the pace of repayment, the strategy mix, the cost of borrowing,
 * choosing an LTV, the peg, and a capstone that sizes a position. Seven
 * lessons, all published.
 */

export const BEGINNER = [
  {
    n: 1,
    id: "what-alchemix-does",
    slug: "/academy/what-alchemix-does",
    title: "What Alchemix does",
    blurb: "Your deposit keeps earning while you borrow against it, and those earnings clear the loan.",
    minutes: 5,
    ready: true,
    track: "beginner",
  },
  {
    n: 2,
    id: "your-deposit",
    slug: "/academy/your-deposit",
    title: "Your deposit",
    blurb: "Your deposit earns in a vault the DAO steers, and you can pull it back out on any day.",
    minutes: 6,
    ready: true,
    track: "beginner",
  },
  {
    n: 3,
    id: "borrowing",
    slug: "/academy/borrowing",
    title: "Borrowing against it",
    blurb: "Borrow up to 90% of your deposit. It keeps earning the whole time.",
    minutes: 6,
    ready: true,
    track: "beginner",
  },
  {
    n: 4,
    id: "self-repaying",
    slug: "/academy/self-repaying",
    title: "The loan repays itself",
    blurb: "Left alone, the balance only falls. You are the only one who can push it back up.",
    minutes: 7,
    ready: true,
    track: "beginner",
  },
  {
    n: 5,
    id: "what-can-go-wrong",
    slug: "/academy/what-can-go-wrong",
    title: "The one real risk",
    blurb: "A price crash leaves your position exactly where it was. A loss inside the vault is the one thing that moves it.",
    minutes: 7,
    ready: true,
    track: "beginner",
  },
  {
    n: 6,
    id: "the-transmuter",
    slug: "/academy/the-transmuter",
    title: "Turning alAssets back",
    blurb: "The Transmuter takes your alUSD and returns USDC at exactly 1:1, once the term is up.",
    minutes: 6,
    ready: true,
    track: "beginner",
  },
];

export const INTERMEDIATE = [
  {
    n: 1,
    id: "getting-money-back",
    slug: "/academy/getting-money-back",
    title: "Reading your position",
    blurb: "Your position holds back the collateral your loan needs. The rest you can withdraw today.",
    minutes: 8,
    ready: true,
    track: "intermediate",
  },
  {
    n: 2,
    id: "pace-of-repayment",
    slug: "/academy/pace-of-repayment",
    title: "The pace of repayment",
    blurb: "The protocol clears every loan in the market at one rate, whatever its size. Find that rate.",
    minutes: 8,
    ready: true,
    track: "intermediate",
  },
  {
    n: 3,
    id: "where-yield-comes-from",
    slug: "/academy/where-yield-comes-from",
    title: "Inside the Mix-Yield Token",
    blurb: "The DAO caps how much of your collateral can sit in riskier strategies. Those caps are what make a high LTV safe.",
    minutes: 8,
    ready: true,
    track: "intermediate",
  },
  {
    n: 4,
    id: "cost-of-borrowing",
    slug: "/academy/cost-of-borrowing",
    title: "What borrowing really costs",
    blurb: "The cost of an Alchemix loan lands in two places, and neither is a monthly payment. Find both.",
    minutes: 8,
    ready: true,
    track: "intermediate",
  },
  {
    n: 5,
    id: "ltv-and-risk",
    slug: "/academy/ltv-and-risk",
    title: "Choosing an LTV",
    blurb: "Every loss of backing has a starting LTV that survives it. Find yours.",
    minutes: 9,
    ready: true,
    track: "intermediate",
  },
  {
    n: 6,
    id: "transmuter-and-peg",
    slug: "/academy/transmuter-and-peg",
    title: "The peg and the discount",
    blurb: "An alUSD below a dollar pays whoever is willing to wait. Price the wait.",
    minutes: 9,
    ready: true,
    track: "intermediate",
  },
  {
    n: 7,
    id: "capstone",
    slug: "/academy/capstone",
    title: "Capstone",
    blurb: "Raise the cash you need from a position that survives the loss you expect.",
    minutes: 10,
    ready: true,
    track: "intermediate",
  },
];

/**
 * Reward figures, mirrored from the engine's action catalogue (`scripts/seed.ts`
 * there, which is authoritative). Each track carries its own Discord role, and
 * finishing a track banks a bonus on top of the per-lesson points. Mirrored here
 * so the track map can state the numbers without a request.
 *
 * The intermediate bonus is seeded under the key `academy.advanced.completed`.
 * The key is deployed data and keeps its name; the track it pays for is the
 * intermediate track.
 */
export const LESSON_POINTS = 100;
export const BEGINNER_BONUS = 200;
export const INTERMEDIATE_BONUS = 400;

/** Points available per track: every lesson plus the completion bonus. */
export const BEGINNER_TOTAL_POINTS = BEGINNER.length * LESSON_POINTS + BEGINNER_BONUS;
export const INTERMEDIATE_TOTAL_POINTS = INTERMEDIATE.length * LESSON_POINTS + INTERMEDIATE_BONUS;
export const TOTAL_POINTS = BEGINNER_TOTAL_POINTS + INTERMEDIATE_TOTAL_POINTS;

/**
 * The tracks in the order the map shows them.
 *
 * `key` is what the claim endpoint expects in its `track` field. `roleLine`
 * names the Discord role a finished track earns, worded for the graduation
 * panel and the rewards card.
 */
export const TRACKS = [
  {
    key: "beginner",
    label: "Beginner track",
    lessons: BEGINNER,
    bonus: BEGINNER_BONUS,
    roleLine: "Graduate role on Discord",
  },
  {
    key: "intermediate",
    label: "Intermediate track",
    lessons: INTERMEDIATE,
    bonus: INTERMEDIATE_BONUS,
    roleLine: "Intermediate role on Discord",
  },
];

/** Every lesson on the map, beginner first. */
export const ALL_LESSONS = [...BEGINNER, ...INTERMEDIATE];
export const LESSON_COUNT = ALL_LESSONS.length;

export function lessonById(id) {
  return ALL_LESSONS.find((l) => l.id === id) ?? null;
}

export function trackByKey(key) {
  return TRACKS.find((t) => t.key === key) ?? null;
}

/** Points available for one track: every lesson plus its bonus. */
export function trackTotalPoints(track) {
  return track.lessons.length * LESSON_POINTS + track.bonus;
}

/**
 * Points banked so far on one track. The bonus counts only once every lesson
 * in the track is done, which is the same rule the engine's seed applies.
 */
export function trackBankedPoints(track, completedIds) {
  const done = new Set(completedIds);
  const finished = track.lessons.filter((l) => done.has(l.id)).length;
  const bonus = finished === track.lessons.length ? track.bonus : 0;
  return finished * LESSON_POINTS + bonus;
}

/**
 * Resolve each lesson to one of three display states.
 *
 * "current" is the first unfinished lesson that is built. Only one lesson per
 * track is ever current, so the map leaves no doubt about what to do next.
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
