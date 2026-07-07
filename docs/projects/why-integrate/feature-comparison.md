---
sidebar_position: 4
hide_title: true
title: Feature Comparison
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Feature Comparison" />

DeFi credit comes in a few structural flavors. The table below compares Alchemix V3 against the two most common lending models — variable-rate money markets and CDP stablecoin systems — on the properties that matter to integrators and their users.

This is a comparison of *mechanisms*, not of live rates. Rates, fees, and parameters change; the structural differences below do not.

| Property | Alchemix V3 | Money markets (e.g., Aave, Compound) | CDP stablecoins (e.g., Sky/Maker, Liquity) |
| --- | --- | --- | --- |
| **Interest on debt** | 0%. Debt only moves down unless the user mints more. | Variable, set by pool utilization. Can spike without warning. | Stability fee (variable) or one-time minting fee. |
| **Repayment** | Automatic. Vault yield and scheduled Transmuter redemptions retire debt over time. | Manual. Borrower must repay principal plus accrued interest. | Manual. Borrower must repay to unlock collateral. |
| **Liquidation trigger** | Strategy loss only. Like-kind borrowing means price swings cannot move LTV. | Price-based. Collateral price drops force liquidation. | Price-based against the collateral ratio. |
| **Maximum LTV** | Up to 90%. | Typically 50–80% depending on asset. | Varies; overcollateralization is usually mandatory well below 90%. |
| **Collateral productivity** | Collateral keeps earning inside the MYT while borrowed against. | Supplied assets earn the pool's supply rate. | Collateral generally sits idle (some vault types excepted). |
| **Borrowable asset** | Like-kind synthetic (alETH against ETH, alUSD against USDC). | Any listed asset (cross-collateral risk). | Protocol stablecoin only. |
| **Fixed-rate instrument** | Built in. Transmuter deposits lock a known 1:1 redemption at a known maturity. | Not native; requires third-party protocols. | Not native. |
| **Position management burden** | Low. No interest accrual or price liquidations to monitor. | High. Rates and health factor need active monitoring. | Medium. Collateral ratio needs monitoring in volatile markets. |

### What this means in practice

- **For end users**, an Alchemix loan is closer to "sell a slice of future yield" than to a margin account. There is no scenario where a user wakes up to an interest bill or a price-triggered liquidation.
- **For integrators**, like-kind borrowing plus fundamental oracles mean positions built on Alchemix have fewer external dependencies to monitor — no utilization curves, no cross-collateral contagion.
- **For treasuries**, the Transmuter's fixed-duration redemptions offer something neither model provides natively: a known return at a known date, backed by protocol collateral rather than counterparty credit.

### Where other models win

Alchemix is not a universal replacement. Money markets support a much wider range of collateral and let users borrow assets other than a like-kind synthetic. CDP stablecoins offer deeper liquidity in their native stablecoin. If a user needs to borrow an arbitrary third asset against arbitrary collateral, a money market is the right tool; Alchemix is the right tool when the goal is liquidity against ETH or USDC without selling, without interest, and without price-liquidation risk.

### Learn more

- [Use cases →](./use-cases.md)
- [Self-repaying loans explained →](/user/concepts/self-repaying-loans)
- [Liquidation mechanics →](/user/concepts/liquidations)
