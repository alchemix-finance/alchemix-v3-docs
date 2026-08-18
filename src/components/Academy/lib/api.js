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

async function request(url, init) {
  const res = await fetch(url, init);
  let body = null;
  try {
    body = await res.json();
  } catch {
    // Fall through: a proxy or gateway can answer with HTML on an error.
  }

  if (!res.ok) {
    const message = body?.error ?? `Request failed (${res.status}).`;
    throw Object.assign(new Error(message), { status: res.status, code: body?.code });
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
