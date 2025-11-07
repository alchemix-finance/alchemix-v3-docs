---
sidebar_position: 7
hide_title: true
sidebar_label: Fees
---

import fees from '@site/static/img/fees-01.png';

<!-- TODO -->

<img src={fees} alt="Fees" class="banner-spacing" />

Alchemix v3 keeps the cost structure transparent and predictable. Three parameters, each set by on-chain governance, clever every action a user can take. A redemption fee for borrowers, an optional redemption fee for Transmuter depositors, and a performance fee on Mix-Yield Token yield. No other fees apply.

## Borrower redemption fee

When the Transmuter converts queued alAssets into vault value it credits that amount against outstanding loans. At the same moment, it routes a small fraction of the repaid debt to the protocol treasury. The figure is currently set at 0.50%.

Because the charge is event-based rather than time-based, the effective borrowing cost depends on two factors:

- The length of the transmutation term.

- The loan-to-value (LTV) at which you start.

Effective APR ≈ Fee × (1 year ÷ Transmutation time) × Starting LTV

## Transmuter Redemption Fee

The protocol can apply a separate fee to each redemption claimed by a Transmuter depositor. The initial value is 0.00%. Any changes set by on-chain governance appear in the parameter list on-chain and in the UI before it takes effect.

## MYT Performance Fee

Each vault skims a small share of gross yield before crediting the remainder to depositors. This percentage funds strategy maintenance and ongoing protocol development. Rates can differ by chain or base asset and are displayed in the vault interface.

## Current Fee Schedule

TODO

| Chain    | Base Asset | Borrower Fee | Transmuter Fee | MYT Yield Fee |
| -------- | ---------- | ------------ | -------------- | ------------- |
| Ethereum | ETH        |              |                |               |
| Ethereum | USDC       |              |                |               |
| Optimism | ETH        |              |                |               |
| Optimism | USDC       |              |                |               |
| Arbitrum | ETH        |              |                |               |
| Arbitrum | USDC       |              |                |               |

Governance may adjust these numbers, but any update is on-chain, auditable, and visible in the app before users take an action.
