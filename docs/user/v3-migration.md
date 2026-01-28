---
hide_title: true
title: V3 Migration & Mana Program
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

#### alUSD

- Curve alUSD-3CRV 0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c
- Curve alUSD-FRAXBP 0xB30dA2376F63De30b42dC055C93fa474F31330A5
- Curve alUSD-sDOLA 0x460638e6F7605B866736e38045C0DE8294d7D87f
- Curve alUSD-fxUSD 0x27cB9629aE3Ee05cb266B99cA4124EC999303c9D

#### alETH

- Curve alETH-WETH 0x8eFD02a0a40545F32DbA5D664CbBC1570D3FedF6
- Curve alETH-frxETH 0xB657B895B265C38c53FFF00166cF7F6A3C70587d
- Curve alETH-pxETH 0x30bf3E17CAD0baF1d6B64079Ec219808d2708fEb

#### Other

- Balancer WETH-ALCX 0xf16aEe6a71aF1A9Bc8F56975A4c2705ca7A782Bc
- Balancer v3 WETH-ALCX 0x1535d7ca00323aa32bd62aeddf7ca651e4b95966
- Curve ALCX-FRAXBP 0xf985005a3793DbA4cCe241B3C19ddcd3Fe069ff4

### Optimism

#### alUSD

- Velodrome UniV2 alUSD-USDC 0x124D69DaeDA338b1b31fFC8e429e39c9A991164e
- Velodrome UniV2 alUSD-USDC.e 0x4d7959d17b9710be87e3657e69d946914221bb88
- Velodrome UniV2 alUSD-FRAX 0xaF03f51DE7a0E62BF061F6Fc3931cF79166B0a29
- Velodrome UniV2 alUSD-DOLA 0x67C253eB6C2e69F9E1114aEeAD0DB4FA8F417AC3
- Velodrome UniV2 alUSD-OP 0x60BE3FB22DDF30C17604b86eC005F6173B1170Aa
- Velodrome UniV2 alUSD-HAI 0x2408dc2b6cad3af2bd65474f0167a107b8b0be0b

#### alETH

- Velodrome UniV2 alETH-WETH 0xa1055762336F92b4B8d2eDC032A0Ce45ead6280a
- Velodrome UniV2 alETH-frxETH 0x1AD06Ca54de04DBe9e2817F4C13eCB406DCbeAf0
- Velodrome UniV2 alETH-pxETH 0x03799d6A59624AbDd50f8774D360A64f4FBfdCF5
- Velodrome UniV2 alETH-OP 0xA5EDb0EF932f7c2f37B8FC75CB01948F6258a4f8

#### Other

- Velodrome UniV2 ALCX-USDC 0x4b322314d6f7239f094f40d93e7d9c4a3081c625

### Arbitrum

#### alUSD

- Ramses UniV2 alUSD-FRAX 0xfd599db360cd9713657c95df66650a427d213010
- Ramses UniV2 alUSD-USDC 0xb1736c14d949c49668a280222888d3695e96c69a

#### alETH

- Ramses UniV2 alETH-frxETH 0xfb4fe921f724f3c7b610a826c827f9f6ecef6886
- Ramses UniV2 alETH-ALCX 0x9c99764ad164360cf85eda42fa2f4166b6cba2a4
- Ramses UniV2 alETH-WETH 0xeb047610c8d099aef19a7362ff3fb8cc56e7d5bb

### Linea

#### alUSD

- Nile UniV2 alUSD-frxUSD 0x6916e44Ce8BcEB671D96F4e837abE1920f723030
- Lynex UniV2 alUSD-USDC 0x5Db4533ECC4C455504821fA2dee56c2Ea459Ce37

#### alETH

- Nile UniV2 alETH-frxETH 0x2E7911dCDb6C638499522632976D8732CD62F7dd
- Lynex UniV2 alETH-WETH 0x51b41Ed7d7869B84bE5647e9BeEC9F8B7e70bA1D

#### Other

- Lynex UniV2 ALCX-USDC 0xaC73C5f3d110Bb051100cfD8Afa4aC4339f239E7

### Concentrated Liquidity Pools

- Velodrome CL alETH-alUSD 0x844BdA8C554D3F14C2C068314b294A5b0Ed2E0dF
- Ramses CL alETH-alUSD 0xb69d60d0690733c0cc4db1c1aedeeaa308f30328

---

### Resources

- [V2 dApp Migration Countdown](https://alchemix.fi)
- [AIP-123 Governance Proposal](https://snapshot.org/#/alchemixstakers.eth)
- [Mana Calculator & Tracking](https://alchemix.fi/mana)
