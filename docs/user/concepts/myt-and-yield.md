---
sidebar_position: 1
hide_title: true
sidebar_label: Mix-Yield Token
---

import MYT from '@site/static/img/MYT-banner.png';

<img src={MYT} alt="Mix-Yield Token" class="banner-spacing" />

Mix-Yield Token (MYT) gives you passive exposure to a curated set of yield strategies without needing to manage positions yourself. Each token represents a share of assets that Alchemix allocates across multiple protocols.

[Explore technical documentation for MYT →](../../dev/myt/myt-contract)

## What is MYT?

- **Tokenised basket.** MYT is a Morpho V2 Vault token that holds deposits of ETH or USDC and routes them into several yield sources.

- **DAO-managed allocation.** The Alchemix DAO selects strategies, sets target weights, and rebalances as markets shift.

- **Built on Morpho V2.** The core vault logic uses Morpho’s v2 vaults layer to optimise on-chain execution and safety.

## Why Use MYT?

|                 |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| Passive income  | Each deposit gives you diversified yield without manual re-staking.                      |
| Risk management | DAO oversight, strategy diversification and rebalancing reduce single-protocol exposure. |
| Flexibility     | Choose the chain and bundle that suit your goals, redeem at any time.                    |

## Per-Chain Variants

There is one ETH-denominated and one USDC-denominated MYT on every supported chain. Strategies differ by chain, letting you choose the profile that matches your preferences. These strategies can change with DAO-issued votes.

You can view the current strategy breakdowns directly in the UI →

## Depositing and Earning

1. Select the MYT that matches your base asset and preferred chain.

2. Deposit ETH or USDC, and the vault will mint MYT at the current exchange rate. As yield accrues, each MYT represents an increasing claim on the underlying asset.

3. Hold MYT. As strategies earn yield, the redemption value of each token increases.

4. Redeem at any time for your principal plus any accumulated yield.

There are no lock-ups, and yield compounds continuously.
