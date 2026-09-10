---
sidebar_position: 8
hide_title: true
title: Liquidations
---

import PageBanner from "@site/src/components/PageBanner";
import StatStrip from "@site/src/components/StatStrip";
import HealthBar from "@site/src/components/HealthBar";

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

In a normal liquidation, any earmarked debt is first repaid from your collateral, then only enough additional collateral is taken to restore the position to the target ratio, at or below the 90% maximum. The rest of your position is untouched. If a position’s debt is at or above its collateral value, or the whole Alchemist has fallen below its global minimum collateralization, the position is liquidated in full. Collateral taken in a liquidation is sent to the Transmuter, where it backs redemptions, while the liquidator receives only the fee. In a partial liquidation that fee comes from the position’s surplus collateral. In a full liquidation, or when the position cannot safely cover the fee, the whole fee is paid from a separate fee vault that the DAO or anyone can fund.

Day-to-day most users will never see a liquidation. If MYT vaults experience a loss, these mechanisms ensure losses are covered in a transparent and proportional way.

Review the MYT strategy breakdown and risk categories before choosing your LTV. The DAO sets a maximum percentage of the MYT that may be allocated to Aggressive and Moderate risk categories, which gives you a basis for calculating a safe LTV below the liquidation threshold.
