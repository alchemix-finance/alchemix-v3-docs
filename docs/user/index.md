---
hide_title: true
title: Introduction
---

import AlchemixStats from "@site/src/components/AlchemixStats";
import Hero from '@site/static/img/landing-01.png';
import DocCardList from '@theme/DocCardList';
import VisualizerFrame from '@site/src/components/VisualizerFrame';

<img src={Hero} alt="Alchemix v3" class="banner-spacing" />

Alchemix is your unified platform for saving, borrowing, and earning fixed-term fixed-yield opportunities all in one place. Built on years of iteration since launching the original self-repaying loan in 2021, Alchemix v3 brings all three pillars together with a smarter, more flexible design.

The protocol allows you to:

- **Save and grow –** deposit ETH or USDC and let our vault invest and earn yield across diversified strategies.

- **Borrow up to 90% LTV –** access liquidity now while your collateral grows with yield and your leverage is reduced over time through scheduled redemptions. No interest rates to monitor, no price-based liquidations.

- **Earn fixed-rate yield –** lock in predictable returns through fixed-term redemptions of alETH or alUSD.

[Explore the Quick Start guide →](./quick-start.md)

## 1. Grow Savings with Vaults

**How it works**

Deposit ETH or USDC into a vault to receive Mix-Yield Tokens (MYT). Each MYT represents a share of a portfolio of yield strategies chosen by the Alchemix DAO and is rebalanced over time. Yield accrues continuously and is reflected in the redemption value of MYT.

### Key Points

|             |                                              |
| ----------- | -------------------------------------------- |
| Asset types | ETH, USDC                                    |
| Strategy    | Diversified, tuned for risk-adjusted returns |
| Lock-up     | None, withdraw at any time                   |

[Learn more about Vaults and MYT →](./concepts/myt-and-yield.md)

## 2. Access Credit with Self-Repaying Loans

Need liquidity but don’t want to sell your assets? Borrow Alchemix’s synthetic counterpart of your deposit and let your future yield repay the balance.

### Key Points

|                  |                                                                                                                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Borrowable asset | alETH or alUSD                                                                                                                                                                                                                                                                                               |
| Maximum LTV      | 90% of deposited collateral                                                                                                                                                                                                                                                                                  |
| Liquidations     | Liquidations only apply if the MYT value drops below your loan value **plus a buffer**. This occurs if a strategy returns a negative yield or, for example, a strategy gets hacked. Your ETH or USD is deposited into the MYT and the MYT becomes your collateral. [Learn more.](./concepts/liquidations.md) |
| Early Repayment  | Optional at any time                                                                                                                                                                                                                                                                                         |

Typical uses include financing a purchase, leveraging/looping yield, or bridging short-term opportunities without disrupting long-term holdings.

[Learn more about Self-Repaying Loans →](./concepts/self-repaying-loans.md)

<!-- <VisualizerFrame
  url="https://v3-flow-visualizer.vercel.app/"
  title="V3 Flow Visualizer"
/> -->

## 3. Lock In Fixed Returns with the Transmuter

The Transmuter lets users deposit alAssets and, after a fixed term, redeem an equivalent amount of the underlying asset—via Mix-Yield Tokens (MYT), which act as an intermediary claim.

- **Predictable returns** – redemption price and date are known upfront.
- **Peg stability** – arbitrage incentives help to keep alAssets near parity.
- **Protection for LPs** – stable asset prices and redemption opportunities help offset impermanent loss.

**Example**: If alUSD trades at 0.98 USDC and the current redemption period is three months, purchasing alUSD and redeeming it yields an annualised return of roughly 8%.

Under normal conditions, the interface unwraps that MYT to the underlying token for you. If liquidity is momentarily tight **or has unexpected slippage**, the contract may return the MYT itself. You can either hold it until unwrapping is available or unwrap manually once the queue clears.

[Learn more about the Transmuter and Redemptions →](./concepts/transmuter.md)

:::info V3 vs V2
This documentation covers **Alchemix V3**. If you are looking for information regarding legacy V2 contracts, please visit the [Legacy Docs](https://docs.alchemix.fi/).
:::

## Next Steps

1. Visit [https://alchemix.fi/](https://alchemix.fi).
2. Stay informed with our [Guides](./newguides/risk-considerations.md).
3. Follow along with our [Tutorials](./tutorials/use-passive-myt.md).
4. Learn more with our [Key Concepts](./concepts/myt-and-yield.md).

<!-- ## Alchemix Stats Fetch Test

<AlchemixStats /> -->
