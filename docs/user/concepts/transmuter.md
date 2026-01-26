---
sidebar_position: 6
hide_title: true
sidebar_label: Transmuter
---

import transmuter from '@site/static/img/transmuter-01.png';

<!-- TODO -->

<img src={transmuter} alt="Transmuter" class="banner-spacing" />

The Transmuter lets you redeem alAssets (alUSD, alETH) 1:1 for their underlying asset after a known waiting period. Purchase below face value, and receive the full value on the maturity date.

:::tip Instant vs. Guaranteed Liquidity
The Transmuter guarantees a **1:1 exchange rate** (no slippage) but works over time as redemptions mature.

- **Want it now?** Use external liquidity pools (Curve, Balancer) which are instant but may have slight price slippage.
- **Want 1:1 value?** Deposit into the Transmuter and wait for redemptions to clear over a fixed period to fill your order.
  :::

## How Transmutations Flow

| Flow     | Context                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Deposit  | Send alUSD or alETH to the Transmuter contract.                                                                                                                                |
| Queue    | Each deposit matures after the Transmutation Time set by the DAO. You can exit early, but an early-withdrawal fee applies and you give up a portion of the fixed-rate outcome. |
| Earmark  | The protocol reserves an equal value of MYT from borrower collateral to guarantee your claim.                                                                                  |
| Maturity | You receive 1 asset-worth of MYT from borrowers for every 1 alAsset.                                                                                                           |

All redeemed alAssets are burned, contracting their supply.

## Why Discounts Exist

Borrowers often sell newly minted alAssets for working capital, pushing market price slightly below par. The spread between that market price and the Transmuter’s guaranteed 1:1 accounting creates a fixed-rate opportunity for buyers.

Inside Alchemix, 1 alUSD always offsets 1 USD worth of debt, regardless of its external market price.

### Fixed-Rate Yield Example

**Market**: alUSD = 0.96USDC

**Term**: 90 days

| Action                  | Outcome                                    |
| ----------------------- | ------------------------------------------ |
| Buy alUSD               | Spend 10,000 USDC → receive \~10,416 alUSD |
| Deposit into Transmuter | Locks the 10,416 alUSD for 90 days.        |
| At maturity             | Receive 10,416 USDC (via MYT)              |
| Profit                  | 416 USDC = 4.16% in 3 mo = \~16.6% APR     |

:::warning Transmuter Deposit Caps
The Transmuter has a maximum deposit cap based on the total alAssets minted on its specific chain. If a Transmuter is full, you may need to bridge alAssets to another chain to deposit.

**Always verify available Transmuter capacity on your target chain before purchasing alAssets.**
:::

## Edge-Case Handling

| Scenario                             | Result                                                                                                                | Your Options                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Bad debt in Alchemist (exploit, etc) | Redemption pays pro-rata (EG: 0.97:1) until debt is restored.                                                         | Claim now and take a haircut, or leave unclaimed. Once debt clears, you may redeem full 1:1.                   |
| MYT unwrap slippage                  | In some scenarios MYT may not be able to be immediately unwrapped for the underlying. (EG: UI detects high slippage). | Withdraw MYT from tramsmuter to begin earning yield from it, manually unwrap later facilitated directly by UI. |

There is no variable interest and no price-based liquidation affecting Transmuter positions.

## Strategic Uses

- **Arbitrage & peg maintenance** - capture fixed yield while pulling alAssets back to parity.

- **LP protection** - LPs can move alAssets from liquidity pools into the Transmuter to erase impermanent loss if the peg widens.

- **Treasury management** - DAOs can park stable reserves for a known return without rate risk.

- **Diversified yield stacking** - pair Transmuter returns with base vault yield for stacked APR.
