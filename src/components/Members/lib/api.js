/**
 * Talking to the season engine from the members area.
 *
 * Same arrangement as the Academy (src/components/Academy/lib/api.js). In
 * production every call is same-origin: the members API paths are proxied to
 * the engine by the rewrites in vercel.json, so the browser only ever sees the
 * docs domain, and the signed message names the docs domain too (ADR 0001).
 * Locally the docs and the engine run on different ports, which is the one case
 * that needs an absolute base: `customFields.membersApiBase`, from the
 * MEMBERS_API_BASE env var, and MEMBERS_ALLOWED_ORIGINS on the engine.
 *
 * Every route answers `{ error, code }` on failure (the engine's stable error
 * catalogue). Callers branch on `code`.
 */
import { claimChainId, signWith } from "./wallet";

export function membersBase(siteConfig) {
  return siteConfig?.customFields?.membersApiBase ?? "";
}

/** Campaign link parameters the lookup passes through (ticket 13). */
const CAMPAIGN_KEYS = ["campaign", "utm_campaign", "utm_source", "utm_medium"];

/** The campaign parameters on the current page's URL, as a query string, or "". */
export function campaignQuery(search) {
  const from = new URLSearchParams(search ?? "");
  const out = new URLSearchParams();
  for (const key of CAMPAIGN_KEYS) {
    const value = from.get(key);
    if (value) out.set(key, value);
  }
  const s = out.toString();
  return s ? `?${s}` : "";
}

/**
 * Pull a message and a code out of an error body. A gateway or Vercel itself
 * can answer with its own envelope, where `error` is an object, so neither is
 * trusted to be a string (the Academy learned this the hard way).
 */
function failureFrom(body, status) {
  let message = `The members service answered ${status}.`;
  let code;
  if (body && typeof body === "object") {
    if (typeof body.error === "string" && body.error.trim()) message = body.error;
    else if (body.error && typeof body.error.message === "string") message = body.error.message;
    if (typeof body.code === "string") code = body.code;
  }
  return Object.assign(new Error(message), { status, code });
}

async function request(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch {
    throw Object.assign(new Error("network"), { code: "network" });
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    // A proxy or gateway can answer with HTML.
  }
  if (!res.ok) throw failureFrom(body, res.status);
  if (body === null || typeof body !== "object") {
    throw Object.assign(new Error("The members service returned an unexpected response."), {
      status: res.status,
      code: "generic",
    });
  }
  return body;
}

const JSON_HEADERS = { "content-type": "application/json", accept: "application/json" };

/**
 * GET /api/wallets/:address. History, live v3 positions, group, rung and the
 * tenure badge, read only. `campaign` is the page's campaign query string.
 * `fresh` skips the browser cache, for the read right after a claim (review
 * 17): the engine answers `private, no-cache` and ends its own cached view on
 * every claim, so this read shows the change at once.
 */
export function lookupWallet(base, address, campaign = "", { fresh = false } = {}) {
  return request(`${base}/api/wallets/${encodeURIComponent(address)}${campaign}`, {
    headers: { accept: "application/json" },
    cache: fresh ? "no-store" : "default",
  });
}

/**
 * GET /api/seasons/current/progress (members area v2). Aggregates only: the
 * open season with its days left and share elapsed, wallets with standing,
 * members per rung and the rung thresholds. `season` is null when none is open.
 */
export function readSeasonProgress(base) {
  return request(`${base}/api/seasons/current/progress`, { headers: { accept: "application/json" } });
}

/** The history card PNG (ticket 21). 404 for an address with no past history. */
export function historyCardUrl(base, address) {
  return `${base}/api/members/history-card/${encodeURIComponent(address)}`;
}

/** The Transmuter card PNG (members area v2). 404 when the address has no claim that transmuted anything. */
export function transmuterCardUrl(base, address) {
  return `${base}/api/members/transmuter-card/${encodeURIComponent(address)}`;
}

/** GET /api/seasons. Every season, newest first, with its rungs and access end. */
export function listSeasons(base) {
  return request(`${base}/api/seasons`, { headers: { accept: "application/json" } });
}

/**
 * GET /api/members/config: `{ discordConfigured, telegramConfigured }`, read
 * before anyone is asked to sign, so a card can say "coming soon" up front.
 */
export function readMembersConfig(base) {
  return request(`${base}/api/members/config`, { headers: { accept: "application/json" }, cache: "no-store" });
}

/** GET /api/seasons/:id/results. A finalized season's frozen board, every row at once. */
export function readSeasonResults(base, seasonId) {
  return request(`${base}/api/seasons/${encodeURIComponent(seasonId)}/results`, {
    headers: { accept: "application/json" },
  });
}

/**
 * Whether a failure means the engine itself could not be reached or answered
 * with a server fault, as opposed to a normal refusal with its own code. A
 * chain read failing is the engine working, so it is not one of these.
 */
export function isEngineDown(e) {
  if (!e) return false;
  if (e.code === "network" || e.code === "internal") return true;
  return !e.code && typeof e.status === "number" && e.status >= 500;
}

/** The season running now, else the newest upcoming one, else null. */
export function currentSeason(listing) {
  const seasons = Array.isArray(listing?.seasons) ? listing.seasons : [];
  return seasons.find((s) => s.status === "open") ?? seasons.find((s) => s.status === "upcoming") ?? null;
}

/** GET /api/leaderboard. Pseudonymous: rank, name and standing only. */
export function readLeaderboard(base, { offset = 0, limit = 50, season } = {}) {
  const q = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (season) q.set("season", String(season));
  return request(`${base}/api/leaderboard?${q}`, { headers: { accept: "application/json" } });
}

/** GET /api/feedback/shipped. */
export function readShippedLog(base) {
  return request(`${base}/api/feedback/shipped`, { headers: { accept: "application/json" } });
}

/**
 * POST /api/feedback. Anonymous: no wallet, no signature. `noticeShown` says
 * the form showed the shipped log notice, which lets the log quote the text.
 */
export function sendFeedback(base, { category, body, noticeShown, topic }) {
  const payload = { category, body };
  if (noticeShown) payload.noticeShown = true;
  // The question slot's slug (FEEDBACK_QUESTION.topic), when answering it.
  if (topic) payload.topic = topic;
  return request(`${base}/api/feedback`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

/** POST /api/exit-reasons. Open, unsigned. */
export function sendExitReason(base, { address, reason, text }) {
  const payload = { address, reason };
  if (text && text.trim()) payload.text = text.trim();
  return request(`${base}/api/exit-reasons`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

/**
 * One signed claim, end to end, with one signature:
 *   1. POST /api/claims/:claim/message for the engine-composed message,
 *      naming this site's host as the domain
 *   2. personal_sign it in the wallet
 *   3. POST /api/claims/:claim with the message, the signature and any params
 *
 * `onStage` reports "sign" while the wallet prompt is open and "send" after.
 *
 * `sign` replaces the wallet prompt (the demo signer, lib/wallet.js signAsDemo).
 *
 * The discord-link claim answers with a Set-Cookie (the OAuth state the
 * Discord callback checks), so that one call sends credentials. Same-origin in
 * production it makes no difference; locally it lets the engine's cookie land.
 */
export async function signedClaim(base, claim, { address, params, onStage, sign = signWith } = {}) {
  // The ordinary flow sends params with the claim only, exactly as before ticket 07.
  const { message } = await claimMessage(base, claim, { address });

  onStage?.("sign");
  const signature = await sign(address, message);
  onStage?.("send");

  return sendClaim(base, claim, { message, signature, params });
}

/**
 * Step 1 of a claim on its own: POST /api/claims/:claim/message. The Safe App
 * flow passes `params` (v3 backlog ticket 07): the engine binds them to a
 * Safe's longer-lived message, so a message read from the Safe's public
 * message list cannot be sent with other details. The ordinary flow leaves
 * them out, which also keeps it working against an engine without ticket 07.
 * Answers `{ nonce, message, chainId }`, the chain id being the one the message names.
 */
export async function claimMessage(base, claim, { address, params }) {
  const chainId = await claimChainId();
  const domain = window.location.host;
  const body = { address, chainId, domain };
  if (params !== undefined) body.params = params;
  const answer = await request(`${base}/api/claims/${claim}/message`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return { ...answer, chainId };
}

/** Step 3 of a claim on its own: POST /api/claims/:claim with the signed message. */
export function sendClaim(base, claim, { message, signature, params }) {
  const payload = { message, signature };
  if (params !== undefined) payload.params = params;
  return request(`${base}/api/claims/${claim}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
    credentials: claim === "discord-link" ? "include" : "same-origin",
  });
}
