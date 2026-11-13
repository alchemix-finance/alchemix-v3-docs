/**
 * Formatting for engine values. Amounts arrive as strings: 18 decimal fixed
 * point for v3 positions, plain decimals for the past-user snapshot.
 */

const WAD = 10n ** 18n;

/** An 18dp integer string as a Number, good to about 4 decimals for display. */
export function fromWad(s) {
  try {
    const v = BigInt(s);
    return Number(v / 10n ** 14n) / 1e4;
  } catch {
    return 0;
  }
}

export function isZeroWad(s) {
  try {
    return BigInt(s) === 0n;
  } catch {
    return true;
  }
}

const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function fmtInt(n) {
  return int.format(Math.round(Number(n) || 0));
}

/** USD with cents under $1,000 and whole dollars above. */
export function fmtUsd(n) {
  const v = Number(n) || 0;
  const digits = Math.abs(v) >= 1000 ? 0 : 2;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** A short USD figure for asides: $14.1M, $930k, $420. */
export function fmtUsdShort(n) {
  const v = Number(n) || 0;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e4) return `$${Math.round(v / 1e3)}k`;
  return fmtUsd(v);
}

/** A token amount: more decimals for small numbers, fewer for big ones. */
export function fmtToken(n, unit) {
  const v = Number(n) || 0;
  const digits = v === 0 ? 0 : Math.abs(v) >= 1000 ? 0 : Math.abs(v) >= 1 ? 2 : 4;
  return `${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${unit}`;
}

/** An amount as a person says it: whole dollars, ETH to two places with no trailing zeros, whole ETH from 100. */
export function fmtSpoken(n, unit) {
  if (unit === "USD") return `$${fmtInt(Math.round(n))}`;
  const v = n >= 100 ? fmtInt(Math.round(n)) : Number(n.toFixed(2)).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${v} ${unit}`;
}

/** An amount in its own unit: "USD" as dollars, "ETH" as ETH. */
export function fmtIn(n, unit) {
  return unit === "USD" ? fmtUsd(n) : fmtToken(n, unit);
}

const DATE = { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
const SHORT_DATE = { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" };

/** "2021-06-08" or an ISO time as "June 8, 2021" (UTC, so a date never shifts a day). */
export function fmtDate(s, { short = false } = {}) {
  if (!s) return "";
  const d = new Date(s.length === 10 ? `${s}T00:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", short ? SHORT_DATE : DATE);
}

export function fmtTime(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function yearOf(s) {
  return s ? String(s).slice(0, 4) : "";
}

export function shortAddress(a) {
  return typeof a === "string" && a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a ?? "";
}

const CHAINS = { 1: "Ethereum", 10: "Optimism", 250: "Fantom", 42161: "Arbitrum" };

export function chainName(id) {
  return CHAINS[id] ?? `Chain ${id}`;
}

/** "ethereum-alUSD" as { asset: "alUSD", chain: "Ethereum" }. */
export function marketParts(marketId) {
  const [chain, asset] = String(marketId).split("-");
  return { asset: asset ?? marketId, chain: chain ? chain[0].toUpperCase() + chain.slice(1) : "" };
}

export function marketLabel(marketId) {
  const { asset, chain } = marketParts(marketId);
  return chain ? `${asset} on ${chain}` : asset;
}

/** A list in words: "a", "a and b", "a, b and c". */
export function listWords(items) {
  const xs = items.filter(Boolean);
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

export { WAD };

/** A fraction as a percent with two decimals: 0.054 as "5.40%", -0.005 as "-0.50%". */
export function fmtPct(x) {
  const v = Number(x) || 0;
  return `${(v * 100).toFixed(2)}%`;
}

/** An 18dp amount in a market's own unit: dollars for a USD market, ETH for an ETH one. */
export function fmtNative(wad, denomination) {
  if (denomination === "USD") return fmtUsd(fromWad(wad));
  // Small ETH amounts (a dust position's growth) keep two significant digits instead of rounding to 0.
  let v;
  try {
    v = Number(BigInt(wad)) / 1e18;
  } catch {
    v = 0;
  }
  if (v !== 0 && Math.abs(v) < 0.0001) {
    // Below 0.00000001 the eight places are all zeros: say 0, never "0." (demo walkthrough 2026-10-27).
    const text = Number(v.toPrecision(2)).toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
    return `${text === "-0" ? "0" : text} ETH`;
  }
  return fmtToken(fromWad(wad), "ETH");
}

/** The same with a sign in front: "+$3.60", "-0.0012 ETH". */
export function fmtNativeSigned(wad, denomination) {
  let v;
  try {
    v = BigInt(wad);
  } catch {
    v = 0n;
  }
  const text = fmtNative((v < 0n ? -v : v).toString(), denomination);
  return `${v < 0n ? "-" : "+"}${text}`;
}

/** "June 8, 2021" style month and year: "June 2021" (UTC). */
export function fmtMonthYear(s) {
  if (!s) return "";
  const d = new Date(s.length === 10 ? `${s}T00:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", timeZone: "UTC" });
}

/** "Jun 2021" (UTC), for the small date under a badge. */
export function fmtMonthShort(s) {
  if (!s) return "";
  const d = new Date(s.length === 10 ? `${s}T00:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" });
}

/** "Oct 5" (UTC), for the season banner. */
export function fmtDayMonth(s) {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
