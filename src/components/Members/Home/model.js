/**
 * What the home page works out from the engine's answers, kept apart from
 * the components so each section reads the same facts.
 */
import { currentSeason } from "../lib/api";
import { isDemoUnlockAll, unlockForDemo } from "../lib/demoUnlock";
import { chainName, fmtInt, fmtNative, fmtToken, fmtUsd, fromWad, listWords, marketParts } from "../lib/format";
import { APP_URL, BADGES, HERO, RUNG_LABELS, RUNG_REQUIREMENTS } from "../copy";

export const RUNG_ORDER = ["discord_role", "inner_circle", "vip"];
export const INNER_CIRCLE_RUNGS = ["inner_circle", "vip"];
export const GROUP_ORDER = ["rungs", "history", "activity", "community"];

/**
 * V3 backlog ticket 08: the season one referral rule, for the words shown
 * before the owner signs. The signed my-standing answer carries the season's
 * own (referral.rule), which wins.
 */
export const REFERRAL_DEFAULTS = { share: 0.25, holdDays: 30, minUsd: 300 };

/** A referral share as a whole percent: 0.25 is "25%". */
export function sharePct(share) {
  return `${Math.round((Number(share) || 0) * 100)}%`;
}

/**
 * The referrer's status in one line: "2 referred, 1 counting (day 12 of 30)",
 * plus how many are past the hold and earning. Null with nobody invited.
 */
export function referralStatusLine(r, copy) {
  if (!r || r.invited === 0) return null;
  const parts = [copy.invited(fmtInt(r.invited))];
  if (r.counting > 0) parts.push(copy.counting(fmtInt(r.counting), fmtInt(r.countingDay), fmtInt(r.rule.holdDays)));
  if (r.earning > 0) parts.push(copy.earning(fmtInt(r.earning)));
  return parts.join(", ");
}

/**
 * The season's rungs, low to high, as { key, label, threshold }. From the
 * season list when it has answered, else from the progress route's
 * thresholds with the fallback labels.
 */
export function seasonRungs(seasons, progress) {
  const season = currentSeason(seasons?.data);
  if (season?.rungs?.length) {
    return season.rungs.slice().sort((a, b) => RUNG_ORDER.indexOf(a.key) - RUNG_ORDER.indexOf(b.key));
  }
  const t = progress?.data?.rungThresholds;
  if (!t) return [];
  return RUNG_ORDER.map((key) => ({ key, label: RUNG_LABELS[key], threshold: t[key] }));
}

/**
 * Where the positions are, kept to one line: "alUSD on Ethereum" or "alETH on
 * Ethereum and Optimism" for one asset, "alETH and alUSD on 3 chains" for more.
 */
export function positionsWhere(positions) {
  const assets = [];
  const chains = [];
  for (const p of positions) {
    const { asset, chain } = marketParts(p.marketId);
    if (!assets.includes(asset)) assets.push(asset);
    if (!chains.includes(chain)) chains.push(chain);
  }
  if (assets.length === 1 || chains.length === 1) return HERO.status.positionsOn(listWords(assets), listWords(chains));
  return HERO.status.positionsAcross(listWords(assets), chains.length);
}

/**
 * Demo walkthrough 2026-10-27: below this, a position is closed for the page.
 * A withdrawal can leave a few wei of collateral behind ($0.00075 in one
 * wallet, 0.00000000065 ETH in another), and those wallets read as holders
 * with "$0.00" collateral. One cent in a USD market, 0.00001 ETH (a few
 * cents) in an ETH one: anything that would show as zero. Far below the
 * engine's counting floor ($10 or 0.004 ETH), so a small real position still
 * shows as a position.
 */
const DUST_WAD = { USD: 10n ** 16n, ETH: 10n ** 13n };

/** Positions with collateral in them. The lookup lists empty ones too (an exited NFT, or dust), which count for nothing here. */
export function fundedPositions(positions) {
  return (positions ?? []).filter((p) => {
    try {
      return BigInt(p.collateralValue) >= (DUST_WAD[p.denomination] ?? 1n);
    } catch {
      return false;
    }
  });
}

/** True when every funded position is on Arbitrum (chain 42161), which earns no essence. */
export function arbitrumOnly(positions) {
  const funded = fundedPositions(positions);
  return funded.length > 0 && funded.every((p) => Number(p.chainId) === 42161);
}

/**
 * Page review 2026-10-24: the sweep's own call. A wallet whose only money is
 * on Arbitrum, with dust elsewhere (one had $0.40 of alETH on Optimism), is
 * Arbitrum-only to the engine (group.flags.arbitrum, standingPerDay null),
 * and the page must not tell it that its position counts.
 */
export function countsAsArbitrumOnly(data) {
  const funded = fundedPositions(data?.positions);
  if (arbitrumOnly(funded)) return true;
  const perDay = typeof data?.standingPerDay === "number" ? data.standingPerDay : null;
  return Boolean(data?.group?.flags?.arbitrum) && funded.some((p) => Number(p.chainId) === 42161) && !(perDay > 0);
}

/**
 * Funnel review 2026-10-23: the vault a past deposit would go to, by its
 * unit, and that vault's recent rate from the season progress route
 * (vaultRates). Ethereum's markets stand in for "the ETH vault" and "the
 * USD vault". Null without a readable rate.
 */
export function vaultRateFor(progressData, unit) {
  const marketId = unit === "ETH" ? "ethereum-alETH" : "ethereum-alUSD";
  const r = (progressData?.vaultRates ?? []).find((x) => x.marketId === marketId);
  if (!r) return null;
  const value = typeof r.trailing30d === "number" ? r.trailing30d : typeof r.trailing7d === "number" ? r.trailing7d : null;
  if (value === null) return null;
  return { marketId, vault: unit === "ETH" ? "ETH" : "USD", value, days: typeof r.trailing30d === "number" ? 30 : 7, asOf: r.asOf };
}

/**
 * Funnel review 2026-10-23: a deep link into the app's deposit panel for one
 * vault (https://alchemix.fi/vaults/<MYT vault address>, checked 2026-10-24),
 * from the registry the engine serves in the members config. Picks, in
 * order: the given market, else the Ethereum market of the given unit (ETH
 * or USD). Falls back to the app's front door when the registry has not
 * loaded or nothing matches. Arbitrum is never linked: it earns nothing and
 * is winding down.
 */
export function appVaultUrl(markets, { marketId, unit } = {}) {
  const list = Array.isArray(markets) ? markets.filter((m) => Number(m.chainId) !== 42161) : [];
  const byId = marketId ? list.find((m) => m.id === marketId) : null;
  const byUnit = unit ? list.find((m) => Number(m.chainId) === 1 && m.denomination === unit) : null;
  const m = byId ?? byUnit;
  return m && /^0x[0-9a-fA-F]{40}$/.test(m.myt) ? `${APP_URL}/vaults/${m.myt}` : APP_URL;
}

/**
 * Page review 2026-10-24 (batch item 4): the vault a wallet that left should
 * land on: the market of its last position on Ethereum or Optimism, funded
 * or not, by last touched when known. Null with nothing to go on.
 */
export function lastPositionMarket(positions) {
  const list = (positions ?? []).filter((p) => Number(p.chainId) !== 42161);
  if (list.length === 0) return null;
  const funded = largestPositionMarket(list);
  if (funded) return funded;
  const sorted = [...list].sort((a, b) => String(b.lastTouched ?? "").localeCompare(String(a.lastTouched ?? "")));
  return sorted[0]?.marketId ?? null;
}

/**
 * Money left in a v2 Transmuter, in words, or null below the line worth a
 * step (about $100: 231 wallets have some balance, 47 have $100 or more).
 */
export function v2TransmuterWords(history) {
  const eth = Number(history?.v2Transmuter?.eth ?? 0);
  const usd = Number(history?.v2Transmuter?.usd ?? 0);
  if (!(eth >= 0.05 || usd >= 100)) return null;
  return listWords([eth > 0 ? fmtToken(eth, "ETH") : null, usd > 0 ? fmtUsd(usd) : null]) || null;
}

/** The largest funded position's market, for a top-up link, or null. */
export function largestPositionMarket(positions) {
  let best = null;
  for (const p of fundedPositions(positions)) {
    if (Number(p.chainId) === 42161) continue;
    let value;
    try {
      value = BigInt(p.collateralValue) * (p.denomination === "ETH" ? 2365n : 1n);
    } catch {
      continue;
    }
    if (!best || value > best.value) best = { marketId: p.marketId, value };
  }
  return best?.marketId ?? null;
}

/** The unit (ETH or USD) a wallet's money speaks in: its largest past deposit, else its Transmuter stake, else null. */
export function depositUnit(lookup) {
  const unit = lookup?.history?.largestDeposit?.unit;
  if (unit === "ETH" || unit === "USD") return unit;
  const stake = (lookup?.transmuterStakes ?? [])[0];
  return stake?.denomination === "ETH" || stake?.denomination === "USD" ? stake.denomination : null;
}

/** Where the Transmuter stakes are, in one line: "2.5 alETH on Ethereum", "2.5 alETH and 400 alUSD on Optimism". */
export function stakesWhere(stakes) {
  const byAsset = new Map();
  const chains = [];
  for (const st of stakes ?? []) {
    const { asset, chain } = marketParts(st.marketId);
    byAsset.set(asset, (byAsset.get(asset) ?? 0) + fromWad(st.amount));
    if (!chains.includes(chain)) chains.push(chain);
  }
  const amounts = listWords([...byAsset].map(([asset, n]) => fmtToken(n, asset)));
  return chains.length ? `${amounts} on ${listWords(chains)}` : amounts;
}

/**
 * Funnel review 2026-10-23: what a holder's collateral earned, summed per
 * unit over every position with a value then and now, plus the best rate
 * among the markets it holds. Null when no position has usable history.
 *   since   "handover" when every start is the April handover, else "first_deposit"
 *   growth  [{ denomination, amount }] with amount an 18dp signed string
 *   rate    { value, days } from the 30-day figure when there is one
 */
export function earningsOf(lookup, extraRates) {
  const positions = (lookup?.positions ?? []).filter((p) => p.value);
  if (positions.length === 0) return null;
  const totals = new Map();
  const kinds = new Set();
  for (const p of positions) {
    try {
      const then = BigInt(p.value.valueThen);
      const now = BigInt(p.value.valueNow);
      if (then <= 0n) continue;
      totals.set(p.denomination, (totals.get(p.denomination) ?? 0n) + (now - then));
    } catch {
      continue;
    }
    kinds.add(p.value.sinceKind);
  }
  if (totals.size === 0) return null;
  // One start kind for the sentence: the handover when every position has it, else the most careful wording.
  const since = kinds.size === 1 && kinds.has("handover") ? "handover" : kinds.has("owner_since") ? "owner_since" : "first_deposit";
  // Page review 2026-10-24: the earliest start, for a dated sentence.
  const sinceDate = positions.map((p) => p.value.since).filter(Boolean).sort()[0] ?? null;
  const rates = [...(lookup.rates ?? []), ...(extraRates ?? [])]
    .filter((r) => positions.some((p) => p.marketId === r.marketId))
    .map((r) => (typeof r.trailing30d === "number" ? { value: r.trailing30d, days: 30 } : typeof r.trailing7d === "number" ? { value: r.trailing7d, days: 7 } : null))
    .filter(Boolean)
    .sort((a, b) => b.value - a.value);
  return {
    since,
    sinceDate,
    growth: [...totals].map(([denomination, amount]) => ({ denomination, amount: amount.toString() })),
    rate: rates[0] ?? null,
  };
}

/**
 * Holding slope (Keenan, 2026-10-28): a size tier may carry `slope: true`, and
 * then its daily amount rises in a straight line from its own `daily` at its
 * `fromUsd` to the next tier's `daily` at the next tier's `fromUsd` (the
 * engine's dailyForSize, src/lib/standing/estimate.ts). Tiers lowest first.
 * The daily holding amount at a size, floored as the accrual floors it, or
 * null with no size.
 */
export function dailyAt(tiers, usd) {
  if (!(usd > 0) || !tiers?.length) return null;
  let out = null;
  tiers.forEach((t, i) => {
    if (usd < t.fromUsd) return;
    const next = tiers[i + 1];
    out = t.slope && next ? t.daily + ((Math.min(usd, next.fromUsd) - t.fromUsd) * (next.daily - t.daily)) / (next.fromUsd - t.fromUsd) : t.daily;
  });
  return out === null ? null : Math.floor(out);
}

/**
 * What adding money does at this size: on a sloped tier, how much a round
 * step of money adds a day ("slope": `step` is the tier's own power of ten,
 * or ten times it while that adds under 5, so the tenfold scale reads "each
 * $1,000 more adds about 33 a day" and `cap` is the top tier); on a flat one,
 * the gap to the next tier up ("step"); at the top, nothing ("top"). Null
 * with no size.
 */
export function holdingNext(tiers, usd) {
  if (!(usd > 0) || !tiers?.length) return null;
  let i = -1;
  tiers.forEach((t, k) => {
    if (usd >= t.fromUsd) i = k;
  });
  if (i < 0) return { kind: "step", gapUsd: tiers[0].fromUsd - usd, to: tiers[0] };
  const t = tiers[i];
  const next = tiers[i + 1];
  if (!next) return { kind: "top" };
  const slopeOf = (k) => {
    const a = tiers[k];
    const b = tiers[k + 1];
    const perUsd = (b.daily - a.daily) / (b.fromUsd - a.fromUsd);
    let step = 10 ** Math.floor(Math.log10(Math.max(10, a.fromUsd)));
    while (perUsd * step < 5 && step < 1e9) step *= 10;
    return { kind: "slope", step, perStep: perUsd * step, perThousand: perUsd * 1000, to: b, cap: tiers[tiers.length - 1] };
  };
  if (t.slope) return slopeOf(i);
  // Fifth round (persona walk): under $100 on the tenfold scale the next line is a slope from the same amount, so
  // the ask is to pass it ("from $100, each $100 more adds about 33 a day"), not to reach the $1k line.
  if (next.slope && next.daily === t.daily && tiers[i + 2]) return { ...slopeOf(i + 1), startsAt: next.fromUsd };
  const up = tiers.slice(i + 1).find((x) => x.daily > t.daily);
  return up ? { kind: "step", gapUsd: up.fromUsd - usd, to: up } : { kind: "top" };
}

/**
 * Fifth round (persona walk, 2026-10-28): whether `days` runs past the end of
 * the season (`endsAt`, ISO). A $37 holder was told "about 87 days" with 55
 * left; the page says it will not land this season at this rate instead.
 */
export function pastSeasonEnd(days, endsAt) {
  if (typeof days !== "number" || !endsAt) return false;
  const left = Math.ceil((Date.parse(endsAt) - Date.now()) / 86_400_000);
  return Number.isFinite(left) && days > Math.max(0, left);
}

/** Days to the next unlock at the wallet's daily rate, or null when either is unknown. */
export function daysToNext(needed, perDay) {
  if (!(typeof needed === "number" && needed > 0) || !(typeof perDay === "number" && perDay > 0)) return null;
  return Math.ceil(needed / perDay);
}

/** Debt over collateral value, both in the market's own units, or null without collateral. */
export function ltvOf(p) {
  try {
    const coll = BigInt(p.collateralValue);
    const debt = BigInt(p.debt);
    if (coll <= 0n) return null;
    return Number((debt * 1_000_000n) / coll) / 1e6;
  } catch {
    return null;
  }
}

export function hasDebt(p) {
  try {
    return BigInt(p.debt) > 0n;
  } catch {
    return false;
  }
}

/**
 * The tenure badge as a tile in the history group (plan item 16: it moves
 * into the badge system while its redesign is pending). It is the one badge
 * the page adds itself; the engine's tenureBadge field says whether it is claimed.
 */
function tenureTile(lookup) {
  const t = lookup.tenureBadge ?? {};
  return {
    key: "tenure",
    group: "history",
    title: BADGES.tenure.title,
    description: BADGES.tenure.description,
    earned: Boolean(t.claimed),
    earnedAt: t.claimedAt ?? null,
    progress: null,
    hidden: false,
    local: true,
  };
}

/**
 * Every badge in display order: the engine's catalog with the tenure tile
 * first in history.
 *
 * Round two, 2026-11-04: season badges come once per season (the open
 * season's set first, then what each past season left on the record), so a
 * key can repeat. Each badge gets an `id` for selection, React keys and
 * "#badge-<id>" links: the key itself the first time (the open season's, so
 * "#badge-season_member" still works), then "<key>-<seasonId>".
 */
export function badgeList(lookup) {
  const list = Array.isArray(lookup?.achievements) ? lookup.achievements : [];
  const out = [];
  const seen = new Set();
  let placed = false;
  const add = (b) => {
    const id = seen.has(b.key) ? `${b.key}-${b.seasonId ?? out.length}` : b.key;
    seen.add(b.key);
    out.push({ ...b, id });
  };
  for (const a of list) {
    if (!placed && a.group === "history") {
      add(tenureTile(lookup));
      placed = true;
    }
    add(a);
  }
  if (!placed && lookup) add(tenureTile(lookup));
  // Demo only (2026-11-05): the footer's switch shows every badge as earned. See lib/demoUnlock.js.
  return isDemoUnlockAll() ? out.map(unlockForDemo) : out;
}

/** The tier an earned badge holds, for the seal (2 and 3 draw extra rings), or null. */
export function tierOf(b) {
  return b?.earned && b.tier ? b.tier.current : null;
}

/**
 * Round two, 2026-11-04 (badge multipliers): basis points as the percent the
 * copy shows ("10" for 1000, "2.5" for 250), or null for none.
 */
export function bpsPercent(bps) {
  return typeof bps === "number" && bps > 0 ? String(Number((bps / 100).toFixed(2))) : null;
}

/**
 * The badges by group, in GROUP_ORDER. Season badges make one group per
 * season, in the engine's order, labelled with the season's name. A season
 * group is the open one when it holds an unearned badge: the engine lists a
 * past season's badges only once earned, and "Whole season" cannot be earned
 * before the season ends, so the open season always has one.
 */
export function groupBadges(badges) {
  const seasons = [];
  for (const b of badges) {
    if (b.group !== "season") continue;
    let g = seasons.find((x) => x.seasonId === b.seasonId);
    if (!g) {
      g = { group: "season", id: `season-${b.seasonId}`, seasonId: b.seasonId, seasonName: b.seasonName, badges: [] };
      seasons.push(g);
    }
    g.badges.push(b);
  }
  for (const g of seasons) g.open = g.badges.some((b) => !b.earned);
  const record = GROUP_ORDER.map((group) => ({ group, id: group, badges: badges.filter((b) => b.group === group) }));
  return [...seasons, ...record].filter((g) => g.badges.length > 0);
}

/** "302.97 alETH and 561,655 alUSD": what the wallet's claims transmuted. */
export function transmutedWords(summary) {
  return listWords((summary?.totals ?? []).map((t) => fmtToken(fromWad(t.transmuted), t.synth)));
}

/** The chains the wallet holds positions on, in words. */
export function chainsWords(positions) {
  const ids = [...new Set(positions.map((p) => p.chainId))];
  return listWords(ids.map(chainName));
}

/* ── Joining the season (strategy alignment, 2026-10-21) ───────── */

/**
 * Whether the wallet has joined the open season: true or false from the
 * lookup's `season` block, or null when the engine does not send one (an
 * engine from before join-season), in which case the page acts as before.
 */
export function joinedSeason(lookup) {
  const j = lookup?.season?.joined;
  return typeof j === "boolean" ? j : null;
}

/** The Academy standing this wallet carries into every season it joins, or null when unknown. */
export function academyCredit(lookup) {
  const v = lookup?.season?.academyCarryOver;
  if (typeof v === "number") return v;
  if (v && typeof v === "object") {
    const n = v.credit ?? v.amount ?? v.standing;
    return typeof n === "number" ? n : null;
  }
  return null;
}

/**
 * The most Academy credit a wallet can carry (season one: beginner 1,000
 * plus intermediate 1,500). Past it, the Academy adds nothing more, so the
 * next steps stop offering it. The engine's own cap wins when it sends one.
 */
export const ACADEMY_CREDIT_CAP = 2500;

export function academyFull(lookup) {
  const credit = academyCredit(lookup);
  if (credit === null) return false;
  const cap = lookup?.season?.academyCarryOver?.cap;
  return credit >= (typeof cap === "number" ? cap : ACADEMY_CREDIT_CAP);
}

/**
 * A rung's plain requirement: the engine's text from the progress route's
 * rungRequirements (src/lib/access/rungCopy.ts) when it sends text, else the
 * copy's fallback.
 */
export function rungRequirement(progressData, key) {
  const r = progressData?.rungRequirements?.[key];
  // The engine's text opens with the threshold ("500 standing. ..."), which
  // the page already shows beside it, so that lead is dropped here.
  if (typeof r === "string" && r.trim()) return r.trim().replace(/^[\d,]+ (?:standing|essence)\.\s*/, "") || r.trim();
  if (r && typeof r === "object") {
    const t = r.text ?? r.summary ?? r.label;
    if (typeof t === "string" && t.trim()) return t.trim();
  }
  return RUNG_REQUIREMENTS[key] ?? "";
}

/** What carries from one season into the next, as copy keys (academy, tenure, badges). */
export function carryItems(carriesOver) {
  const known = (k) => {
    const v = String(k).toLowerCase();
    if (v.includes("academy")) return "academy";
    if (v.includes("tenure")) return "tenure";
    if (v.includes("badge")) return "badges";
    return null;
  };
  let keys = [];
  if (Array.isArray(carriesOver)) keys = carriesOver.map(known);
  else if (carriesOver && typeof carriesOver === "object") {
    keys = Object.entries(carriesOver)
      .filter(([, on]) => Boolean(on))
      .map(([k]) => known(k));
  }
  const out = [...new Set(keys.filter(Boolean))];
  return out.length ? out : ["academy", "tenure", "badges"];
}

/**
 * Who the proposed return bonus is for, before the engine sent a per-wallet
 * answer (an engine older than v3 backlog ticket 09): returning past users
 * (lapsed, dormant, or left and told us why) and newcomers (the "new" group,
 * or a wallet with no record at all).
 */
const RETURN_BONUS_GROUPS = ["lapsed", "dormant", "left", "new"];

/**
 * The return bonus to show, or null. Only in a build with the proposals flag
 * on, and only while the engine says it is proposed or live.
 *
 * V3 backlog ticket 09: the wallet lookup carries the wallet's own bonus
 * (lookup.returnBonus). Null there means no offer at all: the bonus is off,
 * or the wallet is in the holdout (the page never says which). Any other
 * wallet sees it: its own numbers when it has a bonus base, else the plain
 * offer. The answer is the lookup's view with the season progress config
 * folded in for the plain offer's words.
 */
export function returnBonusFor(lookup, progressData, showProposals) {
  if (!showProposals) return null;
  const mine = lookup?.returnBonus;
  if (mine === null) return null;
  if (mine && (mine.status === "proposed" || mine.status === "live")) return mine;
  const bonus = progressData?.returnBonus;
  if (!bonus || (bonus.status !== "proposed" && bonus.status !== "live")) return null;
  const group = lookup?.group?.group;
  const nothing = !lookup?.history && (lookup?.positions ?? []).length === 0;
  return RETURN_BONUS_GROUPS.includes(group) || nothing
    ? { status: bonus.status, rate: bonus.rate, steps: bonus.vestMonths, newcomerRate: 0.005, window: null, units: [], newcomer: false, settled: false }
    : null;
}

/** A return bonus amount (18dp string) in its unit: "0.0283 ETH", "28.35 USDC". */
export function bonusAmount(wad, unit) {
  return unit === "ETH" ? fmtNative(wad, "ETH") : fmtToken(fromWad(wad), unit);
}

/** Amounts across units in words: "0.17 ETH and 28.35 USDC". */
export function bonusAmounts(units, pick) {
  return listWords(units.map((u) => bonusAmount(pick(u), u.unit)));
}

/**
 * What the return bonus card shows for one wallet's view (from
 * returnBonusFor), as plain values for the copy:
 *   mine        the wallet has a bonus base (else the plain offer)
 *   bonus       the whole bonus, every unit
 *   perStep     the first monthly step, every unit
 *   newcomer    the newcomer part, or null when no referral brought it in
 *   settled     the window's end is settled: steps have outcomes
 *   vested / forfeited  the settled totals, or null when none
 *   steps       per step: due date, amount in words, state
 */
export function returnBonusCard(view) {
  const units = Array.isArray(view?.units) ? view.units.filter((u) => BigInt(u.bonus || "0") > 0n) : [];
  const hasAny = (pick) => units.some((u) => BigInt(pick(u) || "0") > 0n);
  const steps = Number(view?.steps) > 0 ? Number(view.steps) : 6;
  const stepRows = units.length
    ? Array.from({ length: steps }, (_, i) => {
        const parts = units.map((u) => u.steps?.[i]).filter(Boolean);
        const state = parts.some((p) => p.state === "forfeited") ? "forfeited" : parts.some((p) => p.state === "vested") ? "vested" : "upcoming";
        return {
          step: i + 1,
          due: parts[0]?.due ?? null,
          amount: listWords(units.map((u) => (u.steps?.[i] ? bonusAmount(u.steps[i].amount, u.unit) : null))),
          state,
        };
      })
    : [];
  return {
    mine: units.length > 0,
    steps,
    bonus: bonusAmounts(units, (u) => u.bonus),
    perStep: bonusAmounts(units, (u) => u.steps?.[0]?.amount ?? "0"),
    newcomer: hasAny((u) => u.newcomerBonus) ? bonusAmounts(units.filter((u) => BigInt(u.newcomerBonus || "0") > 0n), (u) => u.newcomerBonus) : null,
    settled: Boolean(view?.settled) && units.length > 0,
    vested: hasAny((u) => u.vested) ? bonusAmounts(units.filter((u) => BigInt(u.vested || "0") > 0n), (u) => u.vested) : null,
    forfeited: hasAny((u) => u.forfeited) ? bonusAmounts(units.filter((u) => BigInt(u.forfeited || "0") > 0n), (u) => u.forfeited) : null,
    stepRows,
  };
}

/** "1%" from 0.01 or from 1. */
export function rateText(rate) {
  const n = typeof rate === "number" && rate > 0 ? (rate < 1 ? rate * 100 : rate) : 1;
  return `${Number(n.toFixed(2))}%`;
}

/**
 * Feedback 2026-10-28, third round: the badges with something waiting to be
 * claimed, in the order the badges page lists them. The tenure badge until it
 * is claimed; the merch claim on the VIP rung; the Telegram group on the
 * Inner Circle rung until joined; the Discord link on the Discord role rung
 * until linked. Telegram and Discord only where they are set up.
 */
/**
 * Rarest first (feedback 2026-10-28, fourth round: the hero shows the
 * wallet's three rarest badges). The engine does not count holders per badge
 * yet, so this is our order: the hidden ones, then the oldest eras and the
 * rarer acts, then the common ones. Rung badges are on the hero's chart and
 * the tenure badge has its own line, so neither is listed here.
 */
const RARITY = [
  "season_marathon",
  "v1_to_v3",
  "early_season",
  // Round two, 2026-11-04: the Patron NFT went only to the wallets that helped after the alETH incident.
  "patron",
  "v1_era",
  "feedback_shipped",
  "transmuted",
  "academy_graduate",
  "event_attendee",
  "two_chains",
  "inner_circle_joined",
  "v2_era",
  "returned",
  "migrated",
  "transmuter",
  "held_30_days",
  "borrower",
  "discord_linked",
  "first_v3_deposit",
];

/** The wallet's earned badges, rarest first, at most `n`, rungs and tenure left out. */
export function rarestBadges(lookup, n = 3) {
  const rank = (k) => {
    const i = RARITY.indexOf(k);
    return i < 0 ? RARITY.length : i;
  };
  return badgeList(lookup)
    .filter((b) => b.earned && b.group !== "rungs" && b.key !== "tenure")
    .sort((a, b) => rank(a.key) - rank(b.key))
    .slice(0, n);
}

export function readyToClaim(lookup, config) {
  if (!lookup) return [];
  const earned = (key) => (lookup.achievements ?? []).some((a) => a.key === key && a.earned);
  const rungs = new Set((lookup.achievements ?? []).filter((a) => a.earned).map((a) => a.key));
  const out = [];
  if (lookup.history && !lookup.tenureBadge?.claimed) out.push("tenure");
  if (rungs.has("vip")) out.push("vip");
  if (rungs.has("inner_circle") && !earned("inner_circle_joined") && config?.telegramConfigured) out.push("inner_circle");
  if (rungs.has("discord_role") && !earned("discord_linked") && config?.discordConfigured) out.push("discord_role");
  return out;
}
