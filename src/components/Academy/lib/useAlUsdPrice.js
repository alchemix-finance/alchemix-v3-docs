/**
 * The market price of alUSD, read live for the lessons that teach the discount.
 *
 * Four lessons price the gap between what alUSD is minted at and what it sells
 * for: the Transmuter lesson on the beginner track, and the cost, peg and
 * capstone lessons on the intermediate track. Each one asks the learner to work
 * a number from that price, so the price is part of what is being taught, and
 * the real one teaches more than an example does. A learner who reads that
 * alUSD costs 0.957 today and then opens the Fixed Yield page finds the same
 * figure on the card.
 *
 * The read is DefiLlama's price feed, the same host the docs' stats component
 * already uses, so it works from the browser with no proxy. The lessons keep
 * working without it: until the read resolves, and whenever it fails, they use
 * `EXAMPLE_AL_PRICE` and word the price as an example rather than as today's.
 *
 * Two guards keep a bad read out of the copy. A price older than a day is not
 * "today", and a price at or above par would leave the discount lessons
 * teaching a discount that does not exist. Either falls back to the example.
 * The figure is rounded to the three decimals the app quotes before any lesson
 * multiplies by it, so the number a learner reads and the number in the
 * arithmetic are the same number.
 */
import { useEffect, useState } from "react";
import { EXAMPLE_AL_PRICE } from "./protocol";

const FEED = "https://coins.llama.fi/prices/current/coingecko:alchemix-usd";
const COIN = "coingecko:alchemix-usd";

const MAX_AGE_SECONDS = 24 * 60 * 60;
const LOWEST_SANE = 0.8;
const HIGHEST_DISCOUNT = 0.999;

const FALLBACK = Object.freeze({ price: EXAMPLE_AL_PRICE, live: false });

// One read per page load, shared by every lesson that mounts.
let cached = null;
let inflight = null;

async function readPrice() {
  const res = await fetch(FEED, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`price feed answered ${res.status}`);
  const body = await res.json();
  const coin = body?.coins?.[COIN];
  const raw = Number(coin?.price);
  const ageSeconds = Date.now() / 1000 - Number(coin?.timestamp ?? 0);
  if (!Number.isFinite(raw) || ageSeconds > MAX_AGE_SECONDS) throw new Error("price missing or stale");

  const price = Math.round(raw * 1000) / 1000;
  if (price < LOWEST_SANE || price > HIGHEST_DISCOUNT) throw new Error("price outside the band the lessons assume");
  return { price, live: true };
}

/**
 * `{ price, live }`. `live` is true only when `price` came from the feed just
 * now. Server-side rendering and the first client paint both return the
 * example, so nothing here touches `fetch` outside an effect.
 */
export function useAlUsdPrice() {
  const [state, setState] = useState(cached ?? FALLBACK);

  useEffect(() => {
    if (cached) {
      setState(cached);
      return undefined;
    }
    let mounted = true;
    if (!inflight) inflight = readPrice().catch(() => FALLBACK);
    inflight.then((value) => {
      cached = value;
      if (mounted) setState(value);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

/**
 * How a lesson prints the price in prose. The live figure shows the three
 * decimals the app quotes; the example shows two, the way the write-ups state
 * it, so a reader can tell the two apart without being told.
 */
export function priceText(price, live) {
  return price.toFixed(live ? 3 : 2);
}
