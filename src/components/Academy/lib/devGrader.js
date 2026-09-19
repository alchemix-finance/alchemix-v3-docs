import { QUESTIONS, permutation } from "./questions";

/**
 * A grader that runs in the browser, for local development only.
 *
 * Why this exists: the checkpoint is the one part of a lesson that needs a
 * server, and requiring a second repo to be running before a lesson page works
 * made the Academy unusable for anyone editing docs. Someone fixing a typo should
 * not have to stand up the season engine to see the page they are editing.
 *
 * Two guarantees, in order of importance:
 *
 * 1. It cannot run in production. Every entry point is behind
 *    `process.env.NODE_ENV !== "production"`, which the build replaces with a
 *    literal, so the branch folds to false in the deployed site.
 * 2. What it issues is worthless. Completions carry a `local:` prefix that no
 *    server signature can match, so a locally finished lesson can never be
 *    redeemed at graduation. That is the safe direction to fail in.
 *
 * This hides nothing that was secret. Each lesson already computes the same
 * numbers in the browser to draw its own readouts, so the answer was always
 * derivable client-side. What the engine actually provides is a signature on the
 * completion, which is why local ones are inert rather than equivalent.
 *
 * Generation mirrors `src/lib/academy/lessons.ts` in the engine, which stays
 * authoritative. This is a stand-in.
 */
export const devFallbackEnabled = () => process.env.NODE_ENV !== "production";

export const LOCAL_PREFIX = "local:";

/* ── Multiple choice, mirrored from the engine ───────────── */

/**
 * Build a challenge for a choice lesson.
 *
 * The variant and the seed are the only state: the variant picks the question,
 * the seed fixes the order its options are shown in. Both travel in `fields`, so
 * the grader below can rebuild the same order without storing anything.
 *
 * `avoid` names the variant the learner has just missed, and the draw excludes
 * it. Four options and unlimited attempts made a choice checkpoint answerable by
 * elimination, so a miss costs the question.
 */
function choiceChallenge(lessonId, avoid) {
  const bank = QUESTIONS[lessonId];
  const skip =
    Number.isInteger(avoid) && avoid >= 0 && avoid < bank.length && bank.length > 1 ? avoid : -1;
  // Draw from the bank with the missed entry removed, then map back. Same rule
  // the engine applies, so a locally redrawn question behaves the deployed way.
  const variant =
    skip < 0
      ? Math.floor(Math.random() * bank.length)
      : (() => {
          const i = Math.floor(Math.random() * (bank.length - 1));
          return i >= skip ? i + 1 : i;
        })();
  const seed = 1 + Math.floor(Math.random() * 999_999);
  const q = bank[variant];
  const order = permutation(q.options.length, seed);

  return {
    fields: { variant, seed },
    prompt: q.prompt,
    controls: { choices: order.map((i) => q.options[i]) },
  };
}

function choiceGrade(lessonId, f, answer) {
  const q = QUESTIONS[lessonId][Math.trunc(f.variant)];
  const order = permutation(q.options.length, f.seed);
  const correctIndex = order.indexOf(q.correct);

  const offered = Number.isInteger(answer) && answer >= 0 && answer < order.length;
  if (!offered) return [-1, correctIndex, 0, "choice", "Pick one of the options."];

  const original = order[answer];
  return [answer, correctIndex, 0, "choice", q.explain[original]];
}

/* ── Per-lesson generators ───────────────────────────────── */

const GENERATORS = {
  /* Beginner track. Every checkpoint is a question. Lessons 2 and 3 were sums
     (deposit times a rate, deposit times the cap) until 2026-09-19. */

  "what-alchemix-does": (avoid) => choiceChallenge("what-alchemix-does", avoid),
  "your-deposit": (avoid) => choiceChallenge("your-deposit", avoid),
  borrowing: (avoid) => choiceChallenge("borrowing", avoid),
  "self-repaying": (avoid) => choiceChallenge("self-repaying", avoid),
  "what-can-go-wrong": (avoid) => choiceChallenge("what-can-go-wrong", avoid),
  "the-transmuter": (avoid) => choiceChallenge("the-transmuter", avoid),

  /* Intermediate track. Every checkpoint here is a question, not a number to
     land on, so all seven route through the same choice bank. */

  "getting-money-back": (avoid) => choiceChallenge("getting-money-back", avoid),
  "pace-of-repayment": (avoid) => choiceChallenge("pace-of-repayment", avoid),
  "where-yield-comes-from": (avoid) => choiceChallenge("where-yield-comes-from", avoid),
  "cost-of-borrowing": (avoid) => choiceChallenge("cost-of-borrowing", avoid),
  "ltv-and-risk": (avoid) => choiceChallenge("ltv-and-risk", avoid),
  "transmuter-and-peg": (avoid) => choiceChallenge("transmuter-and-peg", avoid),
  capstone: (avoid) => choiceChallenge("capstone", avoid),
};

/* ── Per-lesson graders. Each returns [actual, target, tolerance, unit]. ── */

const GRADERS = {
  /* Beginner track. */

  "what-alchemix-does": (f, a) => choiceGrade("what-alchemix-does", f, a),
  "your-deposit": (f, a) => choiceGrade("your-deposit", f, a),
  borrowing: (f, a) => choiceGrade("borrowing", f, a),
  "self-repaying": (f, a) => choiceGrade("self-repaying", f, a),
  "what-can-go-wrong": (f, a) => choiceGrade("what-can-go-wrong", f, a),
  "the-transmuter": (f, a) => choiceGrade("the-transmuter", f, a),

  /* Intermediate track. Every checkpoint here is a question, not a number to
     land on, so all seven route through the same choice bank. */

  "getting-money-back": (f, a) => choiceGrade("getting-money-back", f, a),
  "pace-of-repayment": (f, a) => choiceGrade("pace-of-repayment", f, a),
  "where-yield-comes-from": (f, a) => choiceGrade("where-yield-comes-from", f, a),
  "cost-of-borrowing": (f, a) => choiceGrade("cost-of-borrowing", f, a),
  "ltv-and-risk": (f, a) => choiceGrade("ltv-and-risk", f, a),
  "transmuter-and-peg": (f, a) => choiceGrade("transmuter-and-peg", f, a),
  capstone: (f, a) => choiceGrade("capstone", f, a),
};

export function localChallenge(lessonId, avoid) {
  const generate = GENERATORS[lessonId];
  if (!generate) throw new Error(`No local grader for ${lessonId}.`);

  const { fields, prompt, controls } = generate(avoid);
  return {
    params: { lessonId, fields },
    challenge: `${LOCAL_PREFIX}challenge`,
    prompt,
    controls,
    local: true,
  };
}

export function localGrade(lessonId, params, answer) {
  const grade = GRADERS[lessonId];
  if (!grade) throw new Error(`No local grader for ${lessonId}.`);

  const [actual, target, tolerance, unit, feedback] = grade(params.fields, answer);
  const passed = Number.isFinite(actual) && Math.abs(actual - target) <= tolerance;

  return {
    passed,
    actual: Number(actual.toFixed(2)),
    target: Number(target.toFixed(2)),
    tolerance: Number(tolerance.toFixed(2)),
    unit,
    feedback,
    local: true,
    // Never a valid signature. A locally graded lesson presented at graduation is
    // rejected, which is the correct outcome.
    completion: passed ? `${LOCAL_PREFIX}${lessonId}` : undefined,
  };
}
