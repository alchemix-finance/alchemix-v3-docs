import React from "react";
import { useAlchemixFees } from "./useAlchemixFees";

const pct = (v) => (v == null ? "—" : (v * 100).toFixed(2) + "%");

const CHAIN_LABELS = { ethereum: "Ethereum", optimism: "Optimism", arbitrum: "Arbitrum" };
const ASSET_LABELS = { eth: "ETH", usdc: "USDC" };

// Inline live fee value.
//   <FeeValue metric="redemption" />                 -> reads Ethereum (uniform)
//   <FeeValue metric="earlyExit" asset="eth" />      -> single asset
//   <FeeValue metric="earlyExit" />                  -> both, if they differ
export function FeeValue({ metric, chain = "ethereum", asset }) {
  const fees = useAlchemixFees();
  const row = fees[chain];
  if (!row) return <span>—</span>;

  if (asset) {
    return <span>{pct(row[asset]?.[metric])}</span>;
  }

  const ethVal = row.eth?.[metric];
  const usdcVal = row.usdc?.[metric];
  if (ethVal === usdcVal) return <span>{pct(ethVal)}</span>;
  return (
    <span>
      {pct(ethVal)} (alETH), {pct(usdcVal)} (alUSD)
    </span>
  );
}

// Full live fee schedule table.
export function FeeSchedule() {
  const fees = useAlchemixFees();
  const rows = [];
  for (const chain of ["ethereum", "optimism", "arbitrum"]) {
    for (const asset of ["eth", "usdc"]) {
      const cell = fees[chain]?.[asset];
      if (!cell) continue;
      rows.push({ chain, asset, ...cell });
    }
  }
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Chain</th>
          <th style={{ textAlign: "left" }}>Base Asset</th>
          <th style={{ textAlign: "left" }}>Redemption Fee</th>
          <th style={{ textAlign: "left" }}>Transmuter Fee</th>
          <th style={{ textAlign: "left" }}>Early Transmutation Fee</th>
          <th style={{ textAlign: "left" }}>MYT Yield Fee</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.chain + r.asset}>
            <td>
              <strong>{CHAIN_LABELS[r.chain]}</strong>
            </td>
            <td>{ASSET_LABELS[r.asset]}</td>
            <td>{pct(r.redemption)}</td>
            <td>{pct(r.transmuter)}</td>
            <td>{pct(r.earlyExit)}</td>
            <td>{pct(r.myt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FeeValue;
