/**
 * Talking to the season engine from a static docs page.
 *
 * In production these are same-origin requests. `/api/academy/*` is proxied to
 * the engine by a Vercel rewrite in this repo's vercel.json, so the browser only
 * ever sees docs.alchemix.fi. That is what keeps cookies first-party and avoids
 * CORS entirely. Running the two locally on different ports is the one case that
 * needs an absolute base, hence `customFields.academyApiBase`.
 */
import { LOCAL_PREFIX, devFallbackEnabled, localChallenge, localGrade } from "./devGrader";

export function apiBase(siteConfig) {
  return siteConfig?.customFields?.academyApiBase ?? "";
}

/** Where completion receipts live. Progress is a UI concern; the tokens are the proof. */
const STORAGE_KEY = "alchemix-academy-completions-v1";

/**
 * Read stored completion tokens.
 *
 * Never called during server-side rendering. Docusaurus prerenders every page, so
 * a bare localStorage reference at module scope would break the build. Every
 * caller reaches this from an effect or an event handler.
 */
export function readCompletions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    // Private browsing, a full quota, or hand-edited junk. Losing progress is
    // annoying; throwing inside a lesson is worse.
    return {};
  }
}

export function saveCompletion(lessonId, token) {
  try {
    const all = readCompletions();
    all[lessonId] = token;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function hasCompletion(lessonId) {
  return Boolean(readCompletions()[lessonId]);
}

/**
 * The stored tokens for a set of lesson ids, in the order the ids were given.
 * Ids with no stored token are skipped, so the result is what a claim can send.
 * Same rule as `readCompletions`: call it from an effect or a handler.
 */
export function completionsFor(lessonIds) {
  const all = readCompletions();
  return lessonIds.map((id) => all[id]).filter((t) => typeof t === "string" && t.length > 0);
}

/**
 * A completion issued by the dev-only grader. It carries no signature, so the
 * engine will never count it. The track map uses this to say so before a claim
 * is attempted.
 */
export function isLocalCompletion(token) {
  return typeof token === "string" && token.startsWith(LOCAL_PREFIX);
}

/**
 * Pull a human-readable message out of an error body.
 *
 * The engine answers `{error: "some string"}`, but nothing guarantees the engine
 * is what answered. A proxy, a gateway, or Vercel itself can return its own
 * envelope, and Vercel's is `{error: {code, message}}` with an OBJECT there. The
 * first version of this trusted `body.error` to be a string and passed it
 * straight to `new Error`, which rendered as "[object Object]" in the lesson.
 *
 * A misconfigured rewrite produces exactly that.
 */
function messageFrom(body, status) {
  const fallback = `The checkpoint could not be reached (${status}).`;
  if (!body || typeof body !== "object") return fallback;

  const { error } = body;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

async function request(url, init) {
  const res = await fetch(url, init);
  let body = null;
  try {
    body = await res.json();
  } catch {
    // Fall through: a proxy or gateway can answer with HTML on an error.
  }

  if (!res.ok) {
    throw Object.assign(new Error(messageFrom(body, res.status)), {
      status: res.status,
      code: typeof body?.code === "string" ? body.code : undefined,
    });
  }

  // A 200 that is not JSON means something other than the engine answered, most
  // likely a single-page-app fallback. Treat it as a failure rather than handing
  // null to a caller that will dereference it.
  if (body === null || typeof body !== "object") {
    throw Object.assign(new Error("The checkpoint returned an unexpected response."), {
      status: res.status,
    });
  }

  return body;
}

/**
 * In development, a checkpoint falls back to grading in the browser when the
 * engine is not running.
 *
 * Without this, every lesson page is broken for anyone who has not also started
 * the season engine, which is an unreasonable thing to ask of someone editing
 * prose. The fallback is compiled out of production builds, and the completions
 * it issues carry a `local:` prefix that no signature can match, so a locally
 * finished lesson is never worth a reward.
 */
async function withDevFallback(lessonId, run, fallback) {
  try {
    return await run();
  } catch (e) {
    if (!devFallbackEnabled()) throw e;
    console.warn(
      `[academy] the engine did not answer (${e.message}). Grading lesson ` +
        `"${lessonId}" in the browser instead. This only happens in development, ` +
        `and the completion it issues is not valid for a reward. ` +
        `To use the real grader, run the season engine and set ACADEMY_API_BASE.`,
    );
    return fallback();
  }
}

export function fetchChallenge(base, lessonId) {
  return withDevFallback(
    lessonId,
    () =>
      request(`${base}/api/academy/challenge?lesson=${encodeURIComponent(lessonId)}`, {
        headers: { accept: "application/json" },
      }),
    () => localChallenge(lessonId),
  );
}

export function submitAnswer(base, { challenge, params, answer }) {
  // A locally issued challenge was never signed, so there is nothing for the
  // server to verify. Grade it where it came from.
  if (devFallbackEnabled() && String(challenge).startsWith(LOCAL_PREFIX)) {
    return Promise.resolve(localGrade(params.lessonId, params, answer));
  }

  return withDevFallback(
    params.lessonId,
    () =>
      request(`${base}/api/academy/grade`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challenge, params, answer }),
      }),
    () => localGrade(params.lessonId, params, answer),
  );
}

/**
 * Ask the engine to verify a finished track.
 *
 * POSTs `{ track, completions }` to `/api/academy/claim`. The engine checks each
 * token's signature against the track's lesson ids and answers
 * `{ eligible, track, completed, missing }`. It grants nothing; the Discord
 * link is what turns an eligible claim into a role, and that step plugs in
 * behind this endpoint.
 *
 * A 404 means the endpoint is not deployed yet. That resolves to
 * `{ notOpen: true }` so the track map can say the claim opens later without
 * treating it as a failure. Every other non-OK status throws with the engine's
 * message, the same as a checkpoint.
 */
export async function claimGraduation(base, { track, completions }) {
  try {
    return await request(`${base}/api/academy/claim`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ track, completions }),
    });
  } catch (e) {
    if (e?.status === 404) return { notOpen: true };
    throw e;
  }
}
