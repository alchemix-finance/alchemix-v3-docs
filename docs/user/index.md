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

Alchemix is your unified platform for saving, borrowing, and earning fixed-term fixed-yield opportunities all in one place. Built on years of iteration since launching the original self-repaying loan in 2021, Alchemix v3 brings all three pillars together with a smarter, more flexible design. The protocol currently secures <AlchemixStat name="tvl" /> in total value locked, with ALCX priced at <AlchemixStat name="alcxPrice" /> and alETH trading at <AlchemixStat name="alEthRatio" />.

<FeatureCards items={[
{
title: "Earn Competitive Risk-Adjusted Yield",
body: "Deposit ETH or USDC and earn yield across a mix of strategies chosen and rebalanced by the DAO. No lock-ups, withdraw at any time.",
href: "./concepts/myt-and-yield",
},
{
title: "Borrow up to 90%, Interest Free",
body: "Borrow against your deposit while it keeps earning yield. Scheduled redemptions chip away at your debt over time. No interest, no price-based liquidations.",
href: "./concepts/self-repaying-loans",
},
{
title: "Unlock Fixed Yield Opportunities",
body: "Deposit alETH or alUSD into the Transmuter and redeem the underlying asset after a fixed term. The rate is locked when you deposit.",
href: "./concepts/transmuter",
},
]} />

[Explore the Quick Start guide →](./quick-start.md)

<br />

### 1. Grow savings with vaults

Deposit ETH or USDC into a vault to receive Mix-Yield Tokens (MYT). Each MYT represents a share of a portfolio of yield strategies chosen by the Alchemix DAO and is rebalanced over time. Yield accrues continuously and is reflected in the redemption value of MYT.

<StatStrip items={[
{ label: "Asset types", value: "ETH, USDC" },
{ label: "Strategy", value: "Diversified, tuned for risk-adjusted returns" },
{ label: "Lock-up", value: "None, withdraw at any time" },
]} />

[Learn more about Vaults and MYT →](./concepts/myt-and-yield.md)

<br />

### 2. Access credit with self-repaying loans

Need liquidity but don’t want to sell your assets? Borrow Alchemix’s synthetic counterpart of your deposit and let your future yield repay the balance.

<StatStrip items={[
{ label: "Borrowable asset", value: "alETH or alUSD" },
{ label: "Maximum LTV", value: "90% of collateral" },
{ label: "Liquidations", value: "Strategy loss only, not price swings" },
{ label: "Early repayment", value: "Optional at any time" },
]} />

[Learn more about Self-Repaying Loans →](./concepts/self-repaying-loans.md)
<br />

### 3. Lock in fixed returns with the Transmuter

Deposit alETH or alUSD and, after a fixed term, redeem an equivalent amount of the underlying asset. The rate is locked at deposit. If alUSD trades at 0.98 USDC with a three-month term, the annualized return is roughly 8%.

<StatStrip items={[
{ label: "Deposit asset", value: "alETH or alUSD" },
{ label: "Returns", value: "Fixed rate, locked at time of deposit" },
{ label: "Peg stability", value: "Arbitrage keeps alAssets near parity" },
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
