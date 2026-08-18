/**
 * Talking to the season engine from a static docs page.
 *
 * In production these are same-origin requests. `/api/academy/*` is proxied to
 * the engine by a Vercel rewrite in this repo's vercel.json, so the browser only
 * ever sees docs.alchemix.fi. That is what keeps cookies first-party and avoids
 * CORS entirely. Running the two locally on different ports is the one case that
 * needs an absolute base, hence `customFields.academyApiBase`.
 */
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
 * caller reaches this from an effect.
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
 * Pull a human-readable message out of an error body.
 *
 * The engine answers `{error: "some string"}`, but nothing guarantees the engine
 * is what answered. A proxy, a gateway, or Vercel itself can return its own
 * envelope, and Vercel's is `{error: {code, message}}` with an OBJECT there. The
 * first version of this trusted `body.error` to be a string and passed it
 * straight to `new Error`, which rendered as "[object Object]" in the lesson.
 *
 * That is not a hypothetical: a misconfigured rewrite produces exactly it.
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

export function fetchChallenge(base, lessonId) {
  return request(`${base}/api/academy/challenge?lesson=${encodeURIComponent(lessonId)}`, {
    headers: { accept: "application/json" },
  });
}

export function submitAnswer(base, { challenge, params, answer }) {
  return request(`${base}/api/academy/grade`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ challenge, params, answer }),
  });
}
