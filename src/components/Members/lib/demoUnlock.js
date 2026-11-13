/**
 * Demo only (Keenan, 2026-11-05): a footer switch that shows every badge as
 * earned, so the team can see each card's design, tier frame and panel
 * without a wallet that holds it. It only exists on builds with
 * MEMBERS_SHOW_PROPOSALS=1 (the footer draws the switch) and it only changes
 * what this browser draws: the setting lives in localStorage, badgeList() in
 * Home/model.js reads it, and the engine never hears of it. Points, claims
 * and roles are untouched.
 *
 * Flipping the switch reloads the page, so every list that was built from
 * the lookup is rebuilt. Hidden badges have no title until earned, so the
 * three hidden keys carry their titles here (from the engine's
 * src/lib/achievements/copy.ts).
 */
const KEY = "members.demoUnlockAll";

const HIDDEN_TITLES = {
  v1_to_v3: { title: "v1 to v3", description: "Used v1 and holds v3 today." },
  early_season: { title: "First week", description: "Held a v3 position in week one." },
  season_marathon: { title: "Whole season", description: "Held a v3 position all season." },
};

export function isDemoUnlockAll() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setDemoUnlockAll(on) {
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing to do, the page stays as it is.
  }
  window.location.reload();
}

/** One badge as if earned today, at its top tier. */
export function unlockForDemo(b) {
  const fallback = HIDDEN_TITLES[b.key] ?? {};
  return {
    ...b,
    earned: true,
    earnedAt: b.earnedAt ?? new Date().toISOString(),
    hidden: false,
    progress: null,
    tier: b.tier ? { current: b.tier.max, max: b.tier.max } : null,
    title: b.title ?? fallback.title ?? b.key,
    description: b.description ?? fallback.description ?? "",
  };
}
