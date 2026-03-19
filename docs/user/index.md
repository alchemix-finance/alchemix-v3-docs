---
hide_title: true
title: Introduction
---

import AlchemixStat from "@site/src/components/AlchemixStat";
import PageBanner from "@site/src/components/PageBanner";
import DocCardList from '@theme/DocCardList';
import VisualizerFrame from '@site/src/components/VisualizerFrame';
import StatStrip from '@site/src/components/StatStrip';
import FeatureCards from '@site/src/components/FeatureCards';

<PageBanner title="Alchemix V3" />

Alchemix started with the self-repaying loan in 2021. V3 builds on that with three products: a yield vault, a borrowing system, and a fixed-rate redemption market. The protocol currently secures <AlchemixStat name="tvl" /> in total value locked, with ALCX priced at <AlchemixStat name="alcxPrice" /> and alETH trading at <AlchemixStat name="alEthRatio" />.

<FeatureCards items={[
  {
    title: "Save and grow",
    body: "Deposit ETH or USDC and earn yield across a mix of strategies chosen and rebalanced by the DAO. No lock-ups, withdraw at any time.",
    href: "./concepts/myt-and-yield",
  },
  {
    title: "Borrow up to 90% LTV",
    body: "Borrow against your deposit while it keeps earning yield. Scheduled redemptions chip away at your debt over time. No interest, no price-based liquidations.",
    href: "./concepts/self-repaying-loans",
  },
  {
    title: "Earn fixed-rate yield",
    body: "Deposit alETH or alUSD into the Transmuter and redeem the underlying asset after a fixed term. The rate is locked when you deposit.",
    href: "./concepts/transmuter",
  },
]} />

[Explore the Quick Start guide →](./quick-start.md)

<br />

### 1. Save and grow

Deposit ETH or USDC into a vault to receive Mix-Yield Tokens (MYT). Each MYT represents a share of a portfolio of yield strategies chosen and rebalanced by the Alchemix DAO.

<StatStrip items={[
  { label: "Management",  value: "DAO-selected and rebalanced, no active management needed" },
  { label: "Chains",      value: "One ETH and one USDC vault on every supported chain" },
  { label: "Lock-up",     value: "None, withdraw at any time" },
]} />

[Learn more about Vaults and MYT →](./concepts/myt-and-yield.md)

<br />

### 2. Borrow up to 90% LTV

Mint alETH or alUSD against your deposit and use it however you like: large purchases, yield looping, liquidity provision. Vault yield and scheduled redemptions chip away at the balance over time. The debt repays itself.

<StatStrip items={[
  { label: "Interest rate",   value: "0%, the balance only ever goes down" },
  { label: "Maximum LTV",     value: "90% of collateral" },
  { label: "Liquidations",    value: "Strategy loss only, not price swings" },
  { label: "Early repayment", value: "Optional at any time" },
]} />

[Learn more about Self-Repaying Loans →](./concepts/self-repaying-loans.md)

<br />

### 3. Earn fixed-rate yield

Buy alETH or alUSD below face value, deposit into the Transmuter, and receive the full underlying asset at maturity. If alUSD trades at 0.98 USDC with a three-month term, the annualized return is roughly 8%. No rate risk, no price-based liquidations.

<StatStrip items={[
  { label: "Deposit asset",   value: "alETH or alUSD" },
  { label: "Returns",         value: "Fixed rate, locked at time of deposit" },
  { label: "Exchange rate",   value: "1:1 guaranteed at maturity, no slippage" },
]} />

[Learn more about the Transmuter and Redemptions →](./concepts/transmuter.md)

<br />

### Next steps

1. Visit [https://alchemix.fi/](https://alchemix.fi).
2. Read the [FAQ →](./faq.md).
3. Follow along with our [Tutorials →](./tutorials/use-passive-myt.md).
4. Learn more with our [Key Concepts →](./concepts/myt-and-yield.md).

:::info V3 vs V2
This documentation covers **Alchemix V3**. If you are looking for information regarding legacy V2 contracts, please visit the [Legacy Docs](https://v2-docs.alchemix.fi/).
:::
