---
sidebar_position: 5
hide_title: true
title: alAssets
---

import PageBanner from "@site/src/components/PageBanner";
import LtvSensitivity from "@site/src/components/LtvSensitivity";

<!-- TODO -->

<PageBanner title="alAssets" />

alAssets (alUSD, alETH) are synthetic tokens that mirror the value of their underlying asset.

They serve two purposes:

1. **Borrowing unit:** When you open a loan, new alAssets are minted to you.

2. **Redemption instrument:** Anyone can deposit alAssets into the Transmuter to redeem 1 alAsset for the equivalent value of the MYT after a fixed term.

The protocol values 1 alAsset at 1 unit of its underlying, but market price can drift below that. Borrowing and redemption both create opportunities around that gap.

:::note Not an algorithmic stablecoin
alAssets are **synthetic debt tokens**, not algorithmic stablecoins. Every 1 alAsset in circulation is backed by at least 1 unit of collateral in the Alchemist system. The peg is maintained via the Transmuter’s 1:1 exchange mechanism, not by minting/burning algorithms.<br/><br/> [Learn more about the Transmuter](./transmuter.md).
:::

### Borrowing, selling, and the market discount

When you borrow, the protocol mints alAssets at face value. 1 alAsset offsets exactly 1 unit of debt inside Alchemix. Selling those tokens on an exchange may yield less than 1.00 since alAssets can trade at a market discount. For borrowers this is an upfront cost; for traders it can be a source of fixed return.

| Action        | Inside Alchemix            | On the open market                 |
| ------------- | -------------------------- | ---------------------------------- |
| Mint alAssets | 1 alAsset = 1 unit of debt | –                                  |
| Sell alAssets | –                          | Price < 1.00 → **market discount** |
| Deleveraging  | alAssets repay debt at 1:1 | Creates transmuter opportunities   |

#### Example

Deposit 1,000 USDC, mint 900 alUSD (90% LTV). If alUSD trades at 0.97 USDC, selling yields 873 USDC (a 27 USDC market discount) while your recorded debt inside the vault remains 900 USD.

### Why alAssets trade below par

- **Loan demand:** Borrowers mint and sell alAssets for working capital.

- **Liquidity:** Low liquidity can result in more dramatic price swings.

- **Market sentiment:** Traders may discount synthetic assets during volatility.

A small, predictable discount is healthy; large discrepancies invite arbitrage.

### Mechanisms that close the discount

| Mechanism           | How it helps                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Transmuter          | Fixed-duration redemptions let traders lock in the spread as a bond-like yield, burning alAssets at maturity. |
| Repayment arbitrage | Borrowers can buy alAssets cheaply on secondary markets and repay debt below face value.                      |

Together these forces pull market price toward 1.00 and keep borrowing capital-efficient.

### LTV sensitivity

A higher LTV does not, by itself, change the percentage discount an alAsset trades at. That spread is driven mainly by market liquidity and demand. What changes is your exposure to that discount and how yield interacts with redemptions over time.

Higher LTV means more capital deployed upfront. At 90% LTV on a $1,000 deposit you receive $900 in alAssets, twice what you’d get at 45%. That capital is yours to use anywhere: yield strategies, liquidity pools, purchases, or working capital. Whether high LTV makes sense depends on whether your deployed capital earns more than the collateral erosion it costs you over time.

Inside Alchemix, high LTV positions erode more collateral per redemption cycle than the vault yield replaces. Collateral and debt both fall, but the collateral falls faster, so you’ll need to re-borrow more often to maintain leverage. At lower LTV, vault yield can outpace redemptions entirely, letting collateral grow while debt falls.

The visualizer below shows only the internal Alchemix view. Returns on capital deployed outside the protocol are not included, and those returns are often the primary reason to borrow at higher leverage.

<LtvSensitivity />

### Learn more

[Open a Self-Repaying Loan →](./self-repaying-loans.md)

[Redeem via the Transmuter →](./transmuter.md)
