---
sidebar_position: 8
hide_title: true
title: Liquidations
---

import PageBanner from "@site/src/components/PageBanner";
import StatStrip from "@site/src/components/StatStrip";
import HealthBar from "@site/src/components/HealthBar";
import { FeeValue } from "@site/src/components/FeeValue";

<PageBanner title="Liquidations" />

Liquidations in Alchemix v3 are a system-wide safety valve that activates only when the <Term id="myt">Mix-Yield Token</Term> loses backing. Because loans and collateral are like-kind, with ETH backing alETH and USDC backing alUSD, a move in the price of ETH or USDC does **not** force positions to close.

:::tip Liquidations in Alchemix are rare
Price volatility in ETH or USDC alone cannot trigger a liquidation. Only a fall in the value the MYT reports, such as an exploit, a strategy reporting negative returns, or an oracle-priced strategy (a liquid staking token, for example) trading below its underlying, can push your LTV toward the fixed 95% liquidation threshold. Day-to-day, most users will never encounter one.
:::

### When liquidation does not occur

<StatStrip items={[
  { label: "ETH or USDC price volatility",       value: "None, debt and collateral move together." },
  { label: "alAsset drifting below peg on DEXs", value: "None, protocol still values alAssets at face value for repayment." },
  { label: "Hitting the 90% LTV borrowing cap",  value: "Borrowing stops, the position stays open and keeps earning yield." },
]} />

### What can trigger liquidation

<StatStrip items={[
  { label: "Strategy loss, exploit, or severe slippage inside MYT", value: "The MYT share price falls, raising every position's LTV." },
  { label: "Position exceeds liquidation threshold (95% LTV)",      value: "Collateral, valued at the MYT share price, divided by debt reaches the 95% bound. Anyone can then liquidate the position." },
]} />

### Reading the health bar

The colored bar in the vault UI gives an at-a-glance view of your position. Keep your current LTV well below the liquidation marker. If MYT ever records a loss, the Liq marker slides left to reflect reduced backing.

<HealthBar currentLtv={62} maxLtv={90} liqLtv={95} />

### How a liquidation runs

A liquidation runs in two steps. The second runs only if the first leaves the position over the 95% threshold.

1. **Earmarked debt repayment:** Any <Term id="earmarked-debt">earmarked debt</Term> on the position is repaid 1:1 from its own collateral, and the only cost is the [borrower redemption fee](./fees.md#borrower-redemption-fee) on that amount, currently <FeeValue metric="redemption" />. That collateral was already due to leave the position through redemptions. If the repayment brings the position back under the 95% threshold, the process stops here. The rest of the collateral stays in the position and keeps earning, and redemptions continue to pay down the remaining debt.
2. **Liquidation:** If the position has no earmarked debt, or is still over the threshold after step 1, enough additional collateral is taken to bring it back to the target ratio, at or below the 90% maximum. The rest of your position is untouched.

If a position’s debt is at or above its collateral value, or the whole Alchemist has fallen below its global minimum collateralization, the position is liquidated in full. Collateral taken in a liquidation is sent to the Transmuter, where it backs redemptions, while the liquidator receives only the fee, currently <FeeValue metric="liquidator" />. In a partial liquidation that fee is charged on the position’s surplus collateral, the value above the debt, and comes out of the position. In a full liquidation it is charged on the debt instead, and, as with any fee the position cannot safely cover itself, it is paid from a separate fee vault that the DAO or anyone can fund.

You can clear earmarked debt yourself at any time. A repayment with MYT or the underlying asset on the [Repay tab](../tutorials/repay-loan.md) settles earmarked debt first and lowers your LTV. Any wallet can repay a position, so someone else can also repay on your behalf.

Day-to-day most users will never see a liquidation. If MYT vaults experience a loss, these mechanisms ensure losses are covered in a transparent and proportional way.

Review the MYT strategy breakdown and risk categories before choosing your LTV. The DAO sets a maximum percentage of the MYT that may be allocated to Aggressive and Moderate risk categories, which gives you a basis for calculating a safe LTV below the liquidation threshold.
