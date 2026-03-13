import { useState, useEffect } from "react";

// Module-level cache — all AlchemixStat instances on a page share one fetch
let _promise = null;
let _cache = null;

async function fetchStats() {
  const [tvlRes, pricesRes] = await Promise.all([
    fetch("https://api.llama.fi/tvl/alchemix"),
    fetch(
      "https://coins.llama.fi/prices/current/coingecko:alchemix,coingecko:alchemix-eth,coingecko:ethereum"
    ),
  ]);
  const tvl = await tvlRes.json();
  const { coins } = await pricesRes.json();
  const alcxPrice = coins["coingecko:alchemix"]?.price ?? null;
  const alEthUsd = coins["coingecko:alchemix-eth"]?.price ?? null;
  const ethUsd = coins["coingecko:ethereum"]?.price ?? null;
  return {
    tvl,
    alcxPrice,
    alEthRatio: alEthUsd != null && ethUsd != null ? alEthUsd / ethUsd : null,
  };
}

export function useAlchemixStats() {
  const [stats, setStats] = useState(_cache);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (_cache) {
      setStats(_cache);
      return;
    }
    if (!_promise) {
      _promise = fetchStats();
    }
    _promise
      .then((data) => {
        _cache = data;
        setStats(data);
      })
      .catch(() => setError(true));
  }, []);

  return { stats, error };
}
