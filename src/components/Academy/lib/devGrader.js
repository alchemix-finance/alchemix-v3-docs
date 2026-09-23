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

/** Questions per checkpoint, and the fields each travels under. Mirrors `choice.ts`. */
const QUESTIONS_PER_CHECKPOINT = 2;
const SLOTS = [
  { variant: "variant", seed: "seed" },
  { variant: "variant2", seed: "seed2" },
  { variant: "variant3", seed: "seed3" },
];

function shuffled(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a challenge for a choice lesson: two different questions from the bank.
 *
 * Each question's variant and seed are the only state: the variant picks the
 * question, the seed fixes the order its options are shown in. They travel in
 * `fields`, so the grader below can rebuild the same order without storing
 * anything.
 *
 * `avoid` lists the variants the learner has just missed, and they are drawn
 * last, the same rule the engine applies.
 */
function choiceChallenge(lessonId, avoid) {
  const bank = QUESTIONS[lessonId];
  const missed = new Set((Array.isArray(avoid) ? avoid : [avoid]).filter((v) => Number.isInteger(v)));
  const all = bank.map((_, i) => i);
  const variants = [
    ...shuffled(all.filter((i) => !missed.has(i))),
    ...shuffled(all.filter((i) => missed.has(i))),
  ].slice(0, QUESTIONS_PER_CHECKPOINT);

  const fields = {};
  const questions = variants.map((variant, slot) => {
    const seed = 1 + Math.floor(Math.random() * 999_999);
    fields[SLOTS[slot].variant] = variant;
    fields[SLOTS[slot].seed] = seed;
    const q = bank[variant];
    const order = permutation(q.options.length, seed);
    return { variant, prompt: q.prompt, choices: order.map((i) => q.options[i]) };
  });

  return { fields, prompt: questions[0].prompt, controls: { questions } };
}

/** Grade every question; the checkpoint passes only when each one is right. */
function choiceGrade(lessonId, f, answers) {
  const bank = QUESTIONS[lessonId];
  const given = Array.isArray(answers) ? answers : [answers];
  const results = SLOTS.filter((s) => s.variant in f).map((s, slot) => {
    const variant = Math.trunc(f[s.variant]);
    const q = bank[variant];
    const order = permutation(q.options.length, f[s.seed]);
    const correctIndex = order.indexOf(q.correct);
    const answer = given[slot];
    const offered = Number.isInteger(answer) && answer >= 0 && answer < order.length;
    if (!offered) return { variant, passed: false, correctIndex, feedback: "Pick one of the options." };
    const original = order[answer];
    return { variant, passed: original === q.correct, correctIndex, feedback: q.explain[original] };
  });
  return { passed: results.every((r) => r.passed), results };
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

/* ── Per-lesson graders. Each returns { passed, results }. ── */

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

  const { passed, results } = grade(params.fields, answer);

  return {
    passed,
    unit: "choice",
    feedback: results[0].feedback,
    // Same rule as the engine: which option was right only travels once every
    // question is.
    results: results.map((r) => ({ ...r, correctIndex: passed ? r.correctIndex : undefined })),
    local: true,
    // Never a valid signature. A locally graded lesson presented at graduation is
    // rejected, which is the correct outcome.
    completion: passed ? `${LOCAL_PREFIX}${lessonId}` : undefined,
  };
}
