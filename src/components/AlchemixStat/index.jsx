import React from "react";
import { useAlchemixStats } from "./useAlchemixStats";

const formatters = {
  tvl: (v) =>
    "$" +
    (v >= 1e9
      ? (v / 1e9).toFixed(2) + "B"
      : (v / 1e6).toFixed(1) + "M"),
  alcxPrice: (v) =>
    "$" +
    v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  alEthRatio: (v) => v.toFixed(3) + " ETH",
};

export default function AlchemixStat({ name }) {
  const { stats, error } = useAlchemixStats();
  if (error || !stats || stats[name] == null) return <span>—</span>;
  const fmt = formatters[name] ?? String;
  return <span>{fmt(stats[name])}</span>;
}
