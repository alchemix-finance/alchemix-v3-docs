import siteConfig from "@generated/docusaurus.config";
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
export const devFallbackEnabled = () =>
  process.env.NODE_ENV !== "production" || browserGradingOnly();

/**
 * A share-link build made with ACADEMY_LOCAL_GRADER=1 grades every Check here
 * and never asks the engine, for previews built before the engine's banks are
 * deployed. Its completions carry the same worthless `local:` prefix.
 */
export const browserGradingOnly = () => siteConfig?.customFields?.academyLocalGrader === true;

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
/**
 * A local credit for a question answered right on an attempt that missed:
 * "local-credit:<lessonId>:<variant>". Unsigned, like everything else here.
 * Mirrors `signCredit` in the engine's tokens.ts.
 */
const CREDIT_PREFIX = "local-credit:";
const KEPT_FIELD = "kept";

function creditVariant(keep, lessonId) {
  if (typeof keep !== "string" || !keep.startsWith(CREDIT_PREFIX)) return null;
  const [id, v] = keep.slice(CREDIT_PREFIX.length).split(":");
  const variant = Number(v);
  return id === lessonId && Number.isInteger(variant) && variant >= 0 ? variant : null;
}

function choiceChallenge(lessonId, avoid, keep) {
  const bank = QUESTIONS[lessonId];
  const missed = new Set((Array.isArray(avoid) ? avoid : [avoid]).filter((v) => Number.isInteger(v)));
  const credited = creditVariant(keep, lessonId);
  const kept = credited !== null && credited < bank.length && !missed.has(credited) ? credited : null;
  const all = bank.map((_, i) => i).filter((i) => i !== kept);
  const variants = [
    ...(kept === null ? [] : [kept]),
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
    const served = { variant, prompt: q.prompt, choices: order.map((i) => q.options[i]) };
    return variant === kept ? { ...served, kept: true, correctIndex: order.indexOf(q.correct) } : served;
  });
  if (kept !== null) fields[KEPT_FIELD] = kept;

  return { fields, prompt: questions[0].prompt, controls: { questions } };
}

/** Grade every question; the checkpoint passes only when each one is right. */
function choiceGrade(lessonId, f, answers) {
  const bank = QUESTIONS[lessonId];
  const given = Array.isArray(answers) ? answers : [answers];
  const keptVariant = KEPT_FIELD in f ? Math.trunc(f[KEPT_FIELD]) : null;
  const results = SLOTS.filter((s) => s.variant in f).map((s, slot) => {
    const variant = Math.trunc(f[s.variant]);
    const q = bank[variant];
    const order = permutation(q.options.length, f[s.seed]);
    const correctIndex = order.indexOf(q.correct);
    // Answered right on the attempt before: it stands, as on the engine.
    if (variant === keptVariant) {
      return { variant, passed: true, correctIndex, feedback: q.explain[q.correct] };
    }
    const answer = given[slot];
    const offered = Number.isInteger(answer) && answer >= 0 && answer < order.length;
    if (!offered) return { variant, passed: false, correctIndex, feedback: "Pick one of the options." };
    const original = order[answer];
    return { variant, passed: original === q.correct, correctIndex, feedback: q.explain[original] };
  });
  return { passed: results.every((r) => r.passed), results };
}

/* ── Per-lesson generators and graders ───────────────────── */

/*
 * Every checkpoint on both tracks is a set of questions from its bank, so a
 * lesson needs no entry of its own here: any id in QUESTIONS is generated and
 * graded the same way, as the engine's `choiceLesson` does. The beginner
 * track's eight banks came in through the mirror alone.
 */
const GENERATORS = Object.fromEntries(
  Object.keys(QUESTIONS).map((id) => [id, (avoid, keep) => choiceChallenge(id, avoid, keep)]),
);

const GRADERS = Object.fromEntries(
  Object.keys(QUESTIONS).map((id) => [id, (f, a) => choiceGrade(id, f, a)]),
);

export function localChallenge(lessonId, avoid, keep = null) {
  const generate = GENERATORS[lessonId];
  if (!generate) throw new Error(`No local grader for ${lessonId}.`);

  const { fields, prompt, controls } = generate(avoid, keep);
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
    // On a miss, a credit for each question answered right, as the engine issues.
    credits: !passed && results.some((r) => r.passed)
      ? results.filter((r) => r.passed).map((r) => `${CREDIT_PREFIX}${lessonId}:${r.variant}`)
      : undefined,
  };
}
