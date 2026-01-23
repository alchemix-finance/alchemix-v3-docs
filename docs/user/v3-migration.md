---
hide_title: true
sidebar_label: V3 Migration & Mana Program
---

import v3Migration from '@site/static/img/migration-mana-01.png';

<img src={v3Migration} alt="V3 Migration & Mana Program" class="banner-spacing" />

To ensure a seamless transition to the capital-efficient architecture of Alchemix V3, the protocol is undergoing a comprehensive migration process. This transition consolidates liquidity, enables the 90% LTV framework, and initializes the Mix-Yield Token (MYT) system.

## The Great V2 to V3 Migration

Alchemix V2 and V3 operate on fundamentally different architectural logic. To prevent debt cannibalization and ensure all users benefit from the upgraded Transmuter and MYT vaults, V2 positions must be migrated into the V3 ecosystem.

### Migration Mechanics

The migration is conducted via a coordinated protocol upgrade (governance-approved under AIP-123). The process follows a strict operational sequence:

1.  **Freeze:** V2 smart contracts are paused, disabling user-facing functions to lock the state of all positions.
2.  **Snapshot:** A precise record of every user position (collateral and debt) is captured.
3.  **Asset Conversion:** Collateral is securely moved and converted into the primary underlying assets (USDC and wETH).
4.  **Positions:** The Alchemix multisig recreates every user position within the V3 architecture. Users are credited with the exact fundamental deposit value and debt recorded during the snapshot.
5.  **Initialization:** New V3 position NFTs are distributed to the respective owner wallets, and the protocol is formally launched.

### Key Parameters

- **Target Migration Date:** February 6th, 2026.
- **Estimated Duration:** Approximately one week.
- **Slippage Protection:** The Alchemix DAO treasury covers conversion slippage up to 0.25%.
- **Dust Threshold:** Positions valued at less than $0.01 USD at the time of the snapshot will not be migrated.

:::info User Action Required
**For most users, no action is required.** If you wish to migrate to V3, simply maintain your existing V2 deposits. If you prefer not to participate in the automated migration, you must wind down your positions and withdraw assets prior to **February 6th, 2026**.
:::

---

## The Migration Mana Program

**Mana** is a loyalty-reward system designed to incentivize a coordinated migration and reward long-term participation within the Alchemix ecosystem.

### Earning Logic

Mana is awarded proportionally based on historical and current participation across Alchemix vaults and Liquidity Provider (LP) positions.

| Participation Type    | Earning Rate / Logic                                      | Eligibility Requirement                       |
| :-------------------- | :-------------------------------------------------------- | :-------------------------------------------- |
| **V2 Vault Deposits** | 1 Mana per $100 value per day                             | Must complete the V2 to V3 migration.         |
| **Standard LP Pools** | Average balance Jan 15, 2025 compared to current snapshot | Retroactive, based on on-chain history.       |
| **CL Pools**          | Flat 1,000 Mana bonus                                     | One-time reward for eligible CL pool history. |

- **Look-back Period:** Retroactive rewards date back to January 15th, 2025.
- **Minimum Threshold:** A minimum of **1.337 Mana** is required to be eligible for reward distribution.

### Reward Distribution: rALCX

At the conclusion of the earning period, a fixed pool of **10,000 rALCX** will be distributed proportionally based on each participant's total Mana relative to the global total.

#### rALCX Vesting Schedule

To ensure long-term alignment, rALCX follows a six-month linear vesting schedule:

- **Full Term:** After 6 months, 100% of rewards can be claimed as ALCX with no penalty.
- **Early Exit:** Users may claim their currently vested balance at any time, but doing so **forfeits all remaining unvested rewards.**

---

## Eligible Strategies & Pools

### Ethereum

- **Vaults:** alUSD, alETH.
- **LP Pairs:** Curve (alUSD-3CRV, alUSD-FRAXBP, alETH-WETH, alETH-frxETH), Balancer (WETH-ALCX).

### Layer 2 & Alt-Chains (Optimism, Arbitrum, Linea)

- **Vaults:** alUSD, alETH.
- **LP Pairs:** Velodrome UniV2 (Optimism), Ramses UniV2 (Arbitrum), Nile/Lynex (Linea).
- **Concentrated Liquidity:** Velodrome and Ramses CL alETH-alUSD pools.

---

### Resources

- [V2 dApp Migration Countdown](https://alchemix.fi)
- [AIP-123 Governance Proposal](https://snapshot.org/#/alchemixstakers.eth)
- [Mana Calculator & Tracking](https://alchemix.fi/mana)
