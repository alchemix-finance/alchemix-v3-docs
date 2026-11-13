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
 * Three tracks.
 *
 * The beginner track is a basic understanding of the app and its functions:
 * eight lessons, one app screen each, in the order a user meets them (the
 * menu, a deposit, a loan, spending it, redemptions, repaying, what can
 * liquidate you, Fixed Yield), with one 10,000 USDC deposit carried across
 * them. Every word a learner reads comes from
 * the lesson scripts, and the ids of the
 * three new lessons (what-you-can-do-here, spend-the-alusd,
 * repay-and-withdraw) are in the engine's bank as well.
 *
 * The intermediate and advanced tracks are for a learner who has finished the
 * beginner track and wants to reason about the product. They were one track
 * of nine article lessons (the 2026-11 rebuild, scripts I1 to I9) until
 * 2026-11-09, when it became two: nine
 * lessons of about eleven minutes each read as a wall after the beginner
 * track, and they divide cleanly by subject.
 *
 *   Intermediate, six lessons on your own position: the three contracts
 *   behind it, where a vault's yield and risk come from, reading a position,
 *   what a loan costs, what happens when the vault loses money, and choosing
 *   an LTV and sizing a loan. Everything the beginner track promises "the
 *   intermediate track" will cover is here (Risk Levels and caps, choosing an
 *   LTV, full liquidation, bad debt).
 *
 *   Advanced, four lessons on how the system runs: how debt is earmarked and
 *   redeemed, what sets the Redemption Rate, the peg and a Fixed Yield
 *   return, and Yield Looping. It leans on the intermediate track (the
 *   Alchemist, MYT's price, Loan Cost, flash loans).
 *
 * Two lessons were recut in the split so each teaches one thing. I8's LTV
 * planner page and I9's sizing page are now the intermediate track's last
 * lesson (id `capstone`, which keeps its /academy/sizing-a-position address),
 * and I9's three Yield Looping pages are a lesson of their own (id
 * `yield-looping`, new). The other eight ids and addresses are unchanged, so
 * stored progress still counts.
 *
 * `app` is the route a learner clicks to reach the screen, written the way the
 * app's own navigation writes it. The app renamed Vaults to Borrow and moved
 * Mixed Yield and Fixed Yield under an Earn menu, so a chip reading "Vaults"
 * named a page title nobody sees any more. The docs make the same translation
 * in prose ("the Mixed Yield page, under Earn → Variable Rate").
 */

/**
 * The tracks that are open. A track left out of this list is on the map,
 * greyed out and marked "Coming soon": its lessons cannot be opened from the
 * map or by address, and they are left out of the progress count and the
 * hero's button. The launch opens the beginner track alone. To open a track,
 * add its key: "intermediate", "advanced".
 */
export const OPEN_TRACKS = ["beginner"];

/**
 * A track's lessons, numbered in order: `n` is the lesson's number on its own
 * track. `ready` is whether the lesson can be opened, which is whether its
 * track is open.
 */
const lessonsOf = (track, lessons) =>
  lessons.map((l, i) => ({ ...l, n: i + 1, ready: OPEN_TRACKS.includes(track), track }));

export const BEGINNER = lessonsOf("beginner", [
  {
    id: "what-you-can-do-here",
    slug: "/academy/what-you-can-do-here",
    app: "Dashboard",
    title: "What you can do here",
    blurb: "Alchemix lets you borrow against a deposit that keeps earning, and the loan pays itself off over time.",
    minutes: 4,
  },
  {
    id: "your-deposit",
    slug: "/academy/your-deposit",
    app: "Borrow",
    title: "Deposit and earn",
    blurb: "Your deposit gives you MYT, the Mix-Yield Token, which rises in value as the vault's strategies earn.",
    minutes: 5,
  },
  {
    id: "borrowing",
    slug: "/academy/borrowing",
    app: "Borrow",
    title: "Borrow against it",
    blurb: "You borrow 5,000 alUSD against your deposit, which stays in the vault and keeps earning.",
    minutes: 5,
  },
  {
    id: "spend-the-alusd",
    slug: "/academy/spend-the-alusd",
    app: "Trade · Swap",
    title: "Spend the alUSD",
    blurb: "Most borrowers swap their alUSD for USDC to spend, and the discount on that swap is the first cost of a loan.",
    minutes: 4,
  },
  {
    id: "self-repaying",
    slug: "/academy/self-repaying",
    app: "Borrow",
    title: "The loan pays itself off",
    blurb: "After you borrow, the loan gets paid off automatically through Alchemix v3's redemption system.",
    minutes: 7,
  },
  {
    id: "repay-and-withdraw",
    slug: "/academy/repay-and-withdraw",
    app: "Borrow",
    title: "Repay and withdraw",
    blurb: "You can repay your loan yourself, any day, in part or in full, and withdraw your deposit.",
    minutes: 5,
  },
  {
    id: "what-can-go-wrong",
    slug: "/academy/what-can-go-wrong",
    app: "Borrow",
    title: "What can liquidate you",
    blurb: "A liquidation can settle part of your loan once your LTV reaches 95%, and a loss of funds in one of the vault's strategies can raise your LTV to 95%.",
    minutes: 5,
  },
  {
    id: "the-transmuter",
    slug: "/academy/the-transmuter",
    app: "Earn · Fixed Rate",
    title: "The other side of your loan",
    blurb: "On Fixed Yield you deposit alUSD for a set term and receive one USDC for each alUSD at the end, taking the other side of a borrower's loan.",
    minutes: 6,
  },
]);

export const INTERMEDIATE = lessonsOf("intermediate", [
  {
    id: "three-contracts",
    slug: "/academy/three-contracts",
    app: "Borrow · Contracts",
    title: "The three contracts behind your position",
    blurb: "The MYT vault turns your deposit into MYT, the Alchemist holds that MYT and records your position under an NFT, and the Transmuter holds the alUSD deposited on Fixed Yield while it vests.",
    minutes: 9,
  },
  {
    id: "where-yield-comes-from",
    slug: "/academy/where-yield-comes-from",
    app: "Borrow · Info",
    title: "Inside MYT: where your yield and your risk come from",
    blurb: "A vault's yield and its losses both come from the strategies the DAO chooses, and the risk caps limit how much of the vault its riskier strategies can hold.",
    minutes: 12,
  },
  // The slug predates the 2026-11 rebuild and is kept so existing links work.
  {
    id: "getting-money-back",
    slug: "/academy/getting-money-back",
    app: "Borrow",
    title: "Reading your position: Health Factor and the 90% to 95% band",
    blurb: "Health Factor tells you how large a loss inside the vault your position can take before your LTV reaches 90%, and between 90% and 95% LTV you can repay but cannot borrow or withdraw.",
    minutes: 11,
  },
  {
    id: "cost-of-borrowing",
    slug: "/academy/cost-of-borrowing",
    app: "Borrow · Repay",
    title: "What a loan costs, and how to recover the discount",
    blurb: "A loan costs the discount when you sell the alUSD and the redemption fee when earmarked debt is settled, and repaying with alUSD bought under a dollar recovers the discount.",
    minutes: 10,
  },
  {
    id: "ltv-and-risk",
    slug: "/academy/ltv-and-risk",
    app: "Borrow · Liquidate",
    title: "What happens when the vault loses money",
    blurb: "A loss inside the vault raises your LTV, and if it reaches 95% a liquidation settles part of your debt out of your deposit, unless you have repaid or closed the loan first.",
    minutes: 12,
  },
  // The id is engine data (the grader keys its questions and receipts on it)
  // and keeps its name. The title and the URL are the learner's.
  {
    id: "capstone",
    slug: "/academy/sizing-a-position",
    app: "Borrow",
    title: "Choosing an LTV and sizing a loan",
    blurb: "You choose an LTV from the loss you want your position to survive, then work out the deposit from that LTV and the cash you need.",
    minutes: 7,
  },
]);

export const ADVANCED = lessonsOf("advanced", [
  {
    id: "earmarking-and-cover",
    slug: "/academy/earmarking-and-cover",
    app: "Borrow · Earmarking",
    title: "How your debt is earmarked and redeemed",
    blurb: "As a Fixed Yield deposit vests, the Alchemist pays for it from other borrowers' repayments first and earmarks a proportional share of every borrower's debt for the rest, which the depositor's claim then redeems out of borrowers' deposits.",
    minutes: 11,
  },
  {
    id: "pace-of-repayment",
    slug: "/academy/pace-of-repayment",
    app: "Borrow · Redemptions",
    title: "What sets the Redemption Rate",
    blurb: "The Redemption Rate is worked out from how much alUSD on Fixed Yield vests this week and how much borrowers owe in total, so it shows how fast debt is being repaid today and moves as both change.",
    minutes: 13,
  },
  {
    id: "transmuter-and-peg",
    slug: "/academy/transmuter-and-peg",
    app: "Earn · Fixed Rate",
    title: "The peg, and what sets a Fixed Yield return",
    blurb: "Borrowers selling alUSD push its price under a dollar, Fixed Yield depositors and repaying borrowers buy it back toward a dollar, and a Fixed Yield deposit earns the gap between the price you paid and a dollar over its term.",
    minutes: 11,
  },
  {
    id: "yield-looping",
    slug: "/academy/yield-looping",
    app: "Borrow · Yield Looping",
    title: "Yield Looping: what it earns and what it risks",
    blurb: "A loop sells the alUSD you borrow and deposits the USDC back into the vault so a larger deposit earns, and in exchange you pay the discount on everything it sells and a loss takes more of your own money.",
    minutes: 9,
  },
]);

/**
 * Not shown anywhere since 2026-10-08: the Academy names the Discord roles and
 * no points, until the team decides what points should mean. Kept so they can
 * come back without touching the engine.
 *
 * Reward figures, mirrored from the engine's action catalogue (`scripts/seed.ts`
 * there, which is authoritative). Each track carries its own Discord role, and
 * finishing a track banks a bonus on top of the per-lesson points. Mirrored here
 * so the track map can state the numbers without a request.
 *
 * The intermediate bonus is seeded under the key `academy.advanced.completed`.
 * The key is deployed data and keeps its name; the track it pays for is the
 * intermediate track. The engine still counts all ten intermediate and
 * advanced lessons as its one `intermediate` track; an advanced bonus and role
 * are not decided, so the advanced track carries neither here.
 *
 * Per-lesson points are the same for every track because one seeded key,
 * `academy.module.completed`, covers every lesson.
 */
export const LESSON_POINTS = 100;
export const BEGINNER_BONUS = 400;
export const INTERMEDIATE_BONUS = 800;
export const ADVANCED_BONUS = 0;

/**
 * The tracks in the order the map shows them.
 *
 * `key` is what the claim endpoint expects in its `track` field. `roleLine`
 * names the Discord role a finished track earns, worded for the graduation
 * panel and the rewards card; null where no role is decided. `finish` is the
 * page a track's last lesson leads to once it is passed, and the map links to
 * it when every lesson on the track is complete. `intro` is the track's one
 * line on the map, and `short` is its name without "track". `open` is whether
 * the track is in OPEN_TRACKS.
 */
export const TRACKS = [
  {
    key: "beginner",
    label: "Beginner track",
    short: "Beginner",
    intro: "If you are new to Alchemix, these lessons teach you to use it, from your first deposit to repaying your loan.",
    lessons: BEGINNER,
    bonus: BEGINNER_BONUS,
    roleLine: "Graduate role on Discord",
    finish: "/academy/beginner-complete",
  },
  {
    key: "intermediate",
    label: "Intermediate track",
    short: "Intermediate",
    intro: "Once you know the app, these lessons teach you how your own position works, from the contracts that hold it to choosing an LTV and sizing a loan.",
    lessons: INTERMEDIATE,
    bonus: INTERMEDIATE_BONUS,
    roleLine: "Intermediate role on Discord",
    finish: "/academy/intermediate-complete",
  },
  {
    key: "advanced",
    label: "Advanced track",
    short: "Advanced",
    intro: "After the intermediate track, these lessons teach you how the protocol works behind every position, from earmarking and redemptions to the peg and Yield Looping.",
    lessons: ADVANCED,
    bonus: ADVANCED_BONUS,
    roleLine: null,
    finish: "/academy/advanced-complete",
  },
].map((t) => ({ ...t, open: OPEN_TRACKS.includes(t.key) }));

/** Every lesson on the map, in track order. */
export const ALL_LESSONS = [...BEGINNER, ...INTERMEDIATE, ...ADVANCED];
/** The lessons a learner can take: those on open tracks. Progress is counted against these. */
export const OPEN_LESSONS = ALL_LESSONS.filter((l) => l.ready);
export const LESSON_COUNT = OPEN_LESSONS.length;

/** A track's reading time: the sum of its lessons' minutes. */
export function trackMinutes(track) {
  return track.lessons.reduce((sum, l) => sum + l.minutes, 0);
}

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
