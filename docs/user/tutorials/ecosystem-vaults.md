---
sidebar_position: 6
hide_title: true
title: Ecosystem Vaults
---

import PageBanner from "@site/src/components/PageBanner";
import FramedImage from "@site/src/components/FramedImage";

<PageBanner title="Ecosystem Vaults" />

The Ecosystem page collects vaults and markets that sit alongside the core Alchemix protocol. Some are curated by the Alchemix team, others are third-party protocols that Alchemix links to but does not operate. Two are live today:

- **Alchemix Ecosystem ETH vault** – a curated WETH vault run by the Alchemix team.
- **Euler 4-way market** – a third-party Euler lending market for WETH, USDC, alETH, and alUSD.

Open both from the top navigation under Ecosystem → Vaults, or go directly to [alchemix.fi/ecosystem](https://alchemix.fi/ecosystem). Click any card to expand it.

### Prerequisites

- Connect your wallet.
- Confirm you have ETH for gas.
- For the Ecosystem ETH vault you need WETH. For the Euler market you can supply WETH, USDC, alETH, or alUSD.

## Alchemix Ecosystem ETH vault

This vault is curated by the Alchemix team. It puts your deposited WETH to work across the Alchemix ecosystem to earn a blended yield, and rebalances the allocation over time. The expanded card shows the current APR, total value locked, and a breakdown of where the capital is deployed.

The vault takes a 20% share of the yield it earns before crediting the remainder to depositors. See the [ecosystem vault fee →](../concepts/fees.md#ecosystem-vault-fee) for details.

:::info Deposits and withdrawals run on a cycle
Deposits settle on the next epoch, and withdrawals are processed fortnightly. To withdraw, you first claim your vault shares, then withdraw once the cycle processes. Plan around this if you may need the funds at short notice.
:::

### Step 1 – Open the vault

<FramedImage src="/img/ecosystem-vaults-01.png" alt="Ecosystem page with the ETH vault card" />

On the Ecosystem page, click the Alchemix Ecosystem ETH vault card to expand it.

### Step 2 – Review the vault

<FramedImage src="/img/ecosystem-vaults-02.png" alt="Expanded ETH vault showing APR, TVL, allocation, and the deposit form" />

Check the APR and TVL at the top of the card. The deposit form is on the left. The allocation chart on the right lists each protocol the vault is deployed in along with its current value and percentage, and these weights shift as the team rebalances.

### Step 3 – Deposit WETH

Stay on the Deposit tab. Enter the amount of WETH you want to deposit, or click MAX to use your full balance, then confirm the transaction in your wallet. Your deposit settles on the next epoch.

### Step 4 – Withdraw

Switch to the Withdraw tab when you want to exit. Claim your vault shares first, then submit the withdrawal. Withdrawals are batched and processed on the fortnightly cycle, so the funds return to your wallet once the next processing window completes.

## Euler 4-way market

The Euler 4-way market is an Euler lending market covering four assets: WETH, USDC, alETH, and alUSD. You can supply any of them to earn yield from borrower demand, and you can borrow against collateral you have supplied. The expanded card shows each asset’s total supplied, supply APY, and borrow APY.

:::warning External market with liquidation risk
Euler is a third-party lending market, not operated by Alchemix. Borrowing against your collateral exposes you to liquidation: if your collateral value falls relative to your debt, part of your collateral can be seized to repay it. Keep an eye on your health factor. See [liquidation risk →](../safety/risk-considerations.md#liquidation-risk) for background.
:::

### Step 1 – Read the market

<FramedImage src="/img/ecosystem-vaults-03.png" alt="Euler 4-way market per-asset rate table" />

Expand the Euler 4-way market card. The table lists supply APY and borrow APY for each asset so you can compare what you would earn by lending against what you would pay to borrow.

### Step 2 – Lend

<FramedImage src="/img/ecosystem-vaults-04.png" alt="Euler Lend panel and Borrow positions section" />

In the Lend panel on the left, choose your asset, enter an amount or click MAX, and supply it to start earning. Your supplied balance and its current APY appear above the input. Switch to the Withdraw tab to pull supplied assets back out, subject to available liquidity in the market.

### Step 3 – Borrow

Once you have supplied collateral, open a loan from the Borrow positions panel on the right. Each position is isolated, so you can run several at once against different collateral. Watch the health factor on every position: the closer it sits to the liquidation threshold, the smaller the drop in collateral value needed to trigger a liquidation.
