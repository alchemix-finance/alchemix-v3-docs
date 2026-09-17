import { MAX_LTV } from "./protocol";
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

const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
const money = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

/* ── Multiple choice, mirrored from the engine ───────────── */

/**
 * Build a challenge for a choice lesson.
 *
 * The variant and the seed are the only state: the variant picks the question,
 * the seed fixes the order its options are shown in. Both travel in `fields`, so
 * the grader below can rebuild the same order without storing anything.
 */
function choiceChallenge(lessonId) {
  const bank = QUESTIONS[lessonId];
  const variant = Math.floor(Math.random() * bank.length);
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
  /* Beginner track. */

  "what-alchemix-does": () => choiceChallenge("what-alchemix-does"),
  "self-repaying": () => choiceChallenge("self-repaying"),
  "what-can-go-wrong": () => choiceChallenge("what-can-go-wrong"),
  "the-transmuter": () => choiceChallenge("the-transmuter"),

  "your-deposit": () => {
    const deposit = pick([5000, 10000, 20000, 25000, 50000]);
    const ratePct = pick([3, 4, 5, 6, 8, 10]);
    return {
      fields: { deposit, ratePct },
      prompt:
        `You deposit ${money(deposit)} USDC. Suppose the vault earns ${ratePct}% ` +
        `over the next year. What is your deposit worth at the end of it?`,
      controls: { slider: { min: deposit, max: deposit * 1.15, step: deposit / 500 } },
    };
  },

  borrowing: () => {
    const deposit = pick([10000, 20000, 30000, 40000, 50000]);
    return {
      fields: { deposit },
      prompt:
        `Your position holds ${money(deposit)} of collateral and you have not borrowed ` +
        `anything yet. What is the most you can borrow against it?`,
      controls: { slider: { min: 0, max: deposit, step: deposit / 500 } },
    };
  },

  /* Intermediate track. Every checkpoint here is a question, not a number to
     land on, so all seven route through the same choice bank. */

  "getting-money-back": () => choiceChallenge("getting-money-back"),
  "pace-of-repayment": () => choiceChallenge("pace-of-repayment"),
  "where-yield-comes-from": () => choiceChallenge("where-yield-comes-from"),
  "cost-of-borrowing": () => choiceChallenge("cost-of-borrowing"),
  "ltv-and-risk": () => choiceChallenge("ltv-and-risk"),
  "transmuter-and-peg": () => choiceChallenge("transmuter-and-peg"),
  capstone: () => choiceChallenge("capstone"),
};

/* ── Per-lesson graders. Each returns [actual, target, tolerance, unit]. ── */

const GRADERS = {
  /* Beginner track. */

  "what-alchemix-does": (f, a) => choiceGrade("what-alchemix-does", f, a),
  "self-repaying": (f, a) => choiceGrade("self-repaying", f, a),
  "what-can-go-wrong": (f, a) => choiceGrade("what-can-go-wrong", f, a),
  "the-transmuter": (f, a) => choiceGrade("the-transmuter", f, a),

  "your-deposit": (f, a) => [a, f.deposit * (1 + f.ratePct / 100), f.deposit * 0.004, "amount"],

  borrowing: (f, a) => [a, f.deposit * MAX_LTV, f.deposit * 0.004, "amount"],

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

export function localChallenge(lessonId) {
  const generate = GENERATORS[lessonId];
  if (!generate) throw new Error(`No local grader for ${lessonId}.`);

  const { fields, prompt, controls } = generate();
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
