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
 * The intermediate track covers every important mechanic and how it
 * functions, for a learner committed to understanding the protocol: reading a
 * position, the pace of repayment, the strategy mix, the cost of borrowing,
 * choosing an LTV, the peg, and a capstone that sizes a position. Seven
 * lessons, all published.
 *
 * `app` is the route a learner clicks to reach the screen, written the way the
 * app's own navigation writes it. The app renamed Vaults to Borrow and moved
 * Mixed Yield and Fixed Yield under an Earn menu, so a chip reading "Vaults"
 * named a page title nobody sees any more. The docs make the same translation
 * in prose ("the Mixed Yield page, under Earn → Variable Rate").
 *
 * `shot` is a screenshot of that screen, shown once per lesson under the lab.
 * Every file listed here was checked against the live app: several older
 * captures in `static/img` still show the pre-rename navigation and are not
 * used. `shotAlt` describes it, and `shotNote` says what to look at.
 */

export const BEGINNER = [
  {
    n: 1,
    id: "what-alchemix-does",
    slug: "/academy/what-alchemix-does",
    title: "What Alchemix does",
    blurb: "Borrow against a deposit that keeps earning, and redemptions clear the balance for you.",
    minutes: 5,
    ready: true,
    track: "beginner",
  },
  {
    n: 2,
    id: "your-deposit",
    slug: "/academy/your-deposit",
    app: "Borrow",
    title: "Your deposit",
    blurb: "Your deposit earns in a vault the Alchemix DAO manages. Withdraw any amount on any day.",
    minutes: 6,
    ready: true,
    track: "beginner",
    shot: "/img/quick-start-02.png",
    shotAlt: "A vault page with the Deposit/Borrow tab open",
    shotNote:
      "The Deposit/Borrow tab on a vault. The top field takes the asset you are depositing and the one under it the alAsset you are borrowing, so one transaction can do both.",
  },
  {
    n: 3,
    id: "borrowing",
    slug: "/academy/borrowing",
    app: "Borrow",
    title: "Borrowing against it",
    blurb: "Borrow up to 90% of your deposit. It keeps earning the whole time.",
    minutes: 6,
    ready: true,
    track: "beginner",
    shot: "/img/borrowing-in-alchemix-01.png",
    shotAlt: "The Borrow page listing the available vaults",
    shotNote:
      "The Borrow page. Each card is one vault: its APR, how full its deposit cap is, and the strategies behind it. LTV on every card reads 90.00%, the cap you just found.",
  },
  {
    n: 4,
    id: "self-repaying",
    slug: "/academy/self-repaying",
    app: "Borrow",
    title: "The loan repays itself",
    blurb: "Redemptions pay the balance down for you. Borrowing more is the only thing that raises it.",
    minutes: 7,
    ready: true,
    track: "beginner",
    shot: "/img/repay-loan-01.png",
    shotAlt: "A vault page with the Repay tab open",
    shotNote:
      "The Repay tab. Redemption Rate is the pace the protocol is clearing debt at right now, and Earmarked is the slice of this loan already set aside for the next one.",
  },
  {
    n: 5,
    id: "what-can-go-wrong",
    slug: "/academy/what-can-go-wrong",
    app: "Borrow",
    title: "The one real risk",
    blurb: "A price crash leaves your position exactly where it was. A loss inside the vault is the one thing that moves it.",
    minutes: 7,
    ready: true,
    track: "beginner",
    shot: "/img/borrowing-in-alchemix-02.png",
    shotAlt: "The position stats and health bar at the top of a vault page",
    shotNote:
      "The real bar. MAX LTV and LIQ LTV are the two markers you have been pushing against, and Health Factor is the same distance written as a multiple.",
  },
  {
    n: 6,
    id: "the-transmuter",
    slug: "/academy/the-transmuter",
    app: "Earn · Fixed Rate",
    title: "The Transmuter",
    blurb: "Buy alUSD under a dollar, wait out the term, and redeem each one for a full USDC.",
    minutes: 6,
    ready: true,
    track: "beginner",
    shot: "/img/redeem-alassets-01.png",
    shotAlt: "The Fixed Yield page listing Transmuter positions",
    shotNote:
      "The Fixed Yield page. Each card states a projected fixed APR, the maturity date, the term, the early exit fee, and the alAsset price it is quoting against.",
  },
];

export const INTERMEDIATE = [
  {
    n: 1,
    id: "getting-money-back",
    slug: "/academy/getting-money-back",
    app: "Borrow",
    title: "Reading your position",
    blurb: "Your position reserves the collateral your loan needs. The rest is yours to withdraw today.",
    minutes: 8,
    ready: true,
    track: "intermediate",
    shot: "/img/repay-loan-01.png",
    shotAlt: "A vault page showing every position stat",
    shotNote:
      "Every stat this lesson works through, on one screen: Deposit, Debt, Health Factor, Earmarked, Redemption Rate, Borrowable and LTV, over a bar that splits the deposit into what is free, what is owed, and what is earmarked.",
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
    app: "Earn · Variable Rate",
    title: "Inside the Mix-Yield Token",
    blurb: "The DAO caps how much of your collateral can sit in riskier strategies. Those caps are what make a high LTV safe.",
    minutes: 8,
    ready: true,
    track: "intermediate",
    shot: "/img/use-passive-myt-02.png",
    shotAlt: "The Mixed Yield page listing MYT vaults",
    shotNote:
      "The Mixed Yield page, the same vault without a loan against it. A vault's Info tab lists every strategy with the risk level this lesson caps.",
  },
  {
    n: 4,
    id: "cost-of-borrowing",
    slug: "/academy/cost-of-borrowing",
    app: "Borrow",
    title: "What borrowing really costs",
    blurb: "An Alchemix loan costs you in two places, and neither is a monthly payment. Find both.",
    minutes: 8,
    ready: true,
    track: "intermediate",
  },
  {
    n: 5,
    id: "ltv-and-risk",
    slug: "/academy/ltv-and-risk",
    app: "Borrow",
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
    app: "Earn · Fixed Rate",
    title: "The peg and the discount",
    blurb: "An alUSD below a dollar pays whoever is willing to wait. Price the wait.",
    minutes: 9,
    ready: true,
    track: "intermediate",
    shot: "/img/redeem-alassets-01.png",
    shotAlt: "The Fixed Yield page listing Transmuter positions",
    shotNote:
      "The alAsset price each card quotes against is the discount this lesson priced, and the projected fixed APR next to it is that discount annualized over the term.",
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
 *
 * The bonuses are set so each track totals a round number: 6 lessons plus 400 is
 * 1,000, and 7 lessons plus 800 is 1,500. Per-lesson points are the same for both
 * tracks because one seeded key, `academy.module.completed`, covers every lesson.
 */
export const LESSON_POINTS = 100;
export const BEGINNER_BONUS = 400;
export const INTERMEDIATE_BONUS = 800;

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
 *
 * "ahead" was "locked", and the rename is the point. Every lesson is now
 * reachable: someone arriving from a link can read any of them, which is what a
 * course posted in a Discord channel has to allow. What an "ahead" lesson does
 * not allow is working it, because a checkpoint answered out of order teaches
 * nothing and banks points for a lesson whose setup the learner never saw. The
 * lesson page renders it as a preview instead, and `currentLesson` below is who
 * it points at.
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
    return { ...lesson, state: "ahead" };
  });
}

/**
 * The lesson a learner should be working, on the track that holds `lessonId`.
 *
 * The first unfinished lesson of that track, or null once the track is
 * finished. Preview mode needs this to name where to go instead, and it stays
 * inside one track on purpose: someone previewing intermediate lesson 6 is sent
 * back to their place in the intermediate track, not to the beginner track they
 * may have deliberately skipped.
 */
export function currentLesson(completedIds, lessonId) {
  const lesson = lessonById(lessonId);
  const track = lesson ? trackByKey(lesson.track) : null;
  if (!track) return null;

  const done = new Set(completedIds);
  return track.lessons.find((l) => l.ready && !done.has(l.id)) ?? null;
}

/**
 * Where "Next lesson" goes after a checkpoint passes.
 *
 * The next lesson in the same track, then the first lesson of the track after
 * it, then null on the last lesson of the last track, where the track map's
 * graduation panel is the right destination instead.
 */
export function nextLesson(lessonId) {
  const i = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  if (i < 0) return null;
  return ALL_LESSONS.slice(i + 1).find((l) => l.ready) ?? null;
}
