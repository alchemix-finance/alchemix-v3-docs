---
sidebar_position: 7
hide_title: true
title: Lending
---

import PageBanner from "@site/src/components/PageBanner";
import FramedImage from "@site/src/components/FramedImage";

<PageBanner title="Lending" />

The Lending page lists third-party lending markets that Alchemix links to but does not operate. One is live today: the **Euler 4-way market**, covering WETH, USDC, alETH, and alUSD.

Open it from the top navigation under **Ecosystem → Lending**, or go directly to [alchemix.fi/lending](https://alchemix.fi/lending), then click the card to expand it.

:::note Separate from the Ecosystem vaults
Lending is its own page. Vaults curated by the Alchemix team, such as the Alchemix Ecosystem ETH vault, live under Ecosystem → Vaults and are covered in [Ecosystem Vaults →](./ecosystem-vaults.md).
:::

### Prerequisites

- Connect your wallet.
- Confirm you have ETH for gas.
- Hold WETH, USDC, alETH, or alUSD to supply.

## Euler 4-way market

The Euler 4-way market is an Euler lending market covering four assets: WETH, USDC, alETH, and alUSD. You can supply any of them to earn yield from borrower demand, and you can borrow against collateral you have supplied.

Listing alETH and alUSD here is what lets you put an alAsset to work without selling it. See [alAssets →](../concepts/alAssets.md) for why that matters to the peg.

:::warning External market with liquidation risk
Euler is a third-party lending market, not operated by Alchemix. Borrowing against your collateral exposes you to liquidation. If your collateral value falls relative to your debt, part of your collateral can be liquidated to repay it. Keep an eye on your health factor. See [liquidation risk →](../safety/risk-considerations.md#liquidation-risk).

This is separate from Alchemix's own vaults, which carry no price-based liquidation. Borrowing on Euler does not behave like a self-repaying loan.
:::

### Step 1 – Open the market

<FramedImage src="/img/lending-01.png" alt="Lending page with the Euler 4-way market card" />

Open the Lending page from Ecosystem → Lending. The card header shows the market's total value locked, the four assets it covers, and the highest supply APY on offer. Below it sits the per-asset table, and below that the Borrow positions panel.

### Step 2 – Read the market

<FramedImage src="/img/lending-02.png" alt="Euler 4-way market per-asset rate table" />

Each row lists how much of that asset is supplied and borrowed across the market, your own supplied and borrowed balances, and the supply and borrow APY, with accompanying Supply and Borrow buttons. Compare the two rates to see what you would earn by lending against what you would pay to borrow.

### Step 3 – Lend

<FramedImage src="/img/lending-03.png" alt="Euler Lend panel and Borrow positions section" />

In the Lend panel on the left, choose your asset, enter an amount or click MAX, and supply it to start earning. Your supplied balance and its current APY appear above the input. Switch to the Withdraw tab to pull supplied assets back out, subject to available liquidity in the market.

### Step 4 – Borrow

Once you have supplied collateral, open a loan from the Borrow positions panel on the right. Each position is isolated, so you can run several at once against different collateral. Make sure you watch the health factor on every position. The closer it sits to the liquidation threshold, the smaller the drop in collateral value needed to trigger a liquidation.
