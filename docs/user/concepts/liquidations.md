---
sidebar_position: 8
hide_title: true
sidebar_label: Liquidations
---

import liquidations from '@site/static/img/liquidations-01.png';

<!-- TODO -->

<img src={liquidations} alt="Liquidations" class="banner-spacing" />

Liquidations in Alchemix v3 are a system-wide safety valve, not a per-account punishment. Because loans and collateral are like-kind, with ETH backing alETH and USDC backing alUSD, market price swings do **not** force positions to close. The back-stop only activates if the Mix-Yield Token itself loses backing.

## When liquidation does not occur

| Event                              | Effect on your loan                                               |
| ---------------------------------- | ----------------------------------------------------------------- |
| ETH or USDC price volatility       | None, debt and collateral move together.                          |
| alAsset drifting below peg on DEXs | None, protocol still values alAssets at face value for repayment. |
| Hitting the 90% LTV borrowing cap  | Borrowing stops, the position stays open and keeps earning yield. |

## What can trigger liquidation

| Event                                                 | Detection Method                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| Strategy loss, exploit, or severe slippage inside MYT | Oracle shows MYT NAV is less than system debt.                   |
| Position exceeds liquidation threshold (95% LTV)      | Oracle shows collateral value vs. debt ratio breaching threshold |

## How the process works

- **Max LTV** – If a position exceeds the max LTV (currently set at 95%), it is eligible for liquidations.

- **Partial liquidation only** – The protocol liquidates only the amount required to adjust the user’s position back to the defined target LTV, currently set at 85%.

- **Multi-step liquidations** – If a position can be made healthy by simply triggering a redemption early, then that is all that will happen and the liquidator will receive a small fee. Otherwise, the early redemption will occur and then the user’s collateral will be used to repay debt, along with a fee paid to the liquidator, down to the target LTV.

- **Liquidator Fee Vault** – Should the user’s collateral not be sufficient on its own to pay a liquidator, there is a separate fee vault that may be funded by any entity (including the DAO) that may be drawn from to pay liquidators.

## Reading the health bar

The colored bar in the vault UI gives an at-a-glance view of three numbers:

- **Current LTV** – your live leverage, updated in real time.

- **Max LTV** – the borrowing ceiling on the vault. You cannot mint alAssets beyond this green marker.

- **Liq LTV** – the red marker shows the liquidation threshold right now. If MYT ever records a loss, the marker slides left to reflect the reduced backing. If your current LTV remains below this marker, you will not be liquidated.

Day-to-day most users will never see a liquidation. If MYT vaults experience a loss, these mechanisms ensure losses are covered in a transparent and proportional way.

Users are encouraged to study the makeup of the MYT, as well as the risk categories. The DAO sets a maximum % of the MYT that may be allocated to high and medium risk categories. This allows users to set LTVs below liquidation thresholds based on those makeups.

TODO

The current settings are as follows:  
etc
