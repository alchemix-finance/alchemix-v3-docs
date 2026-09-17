---
sidebar_position: 6
hide_title: true
title: Ecosystem Vaults
---

import PageBanner from "@site/src/components/PageBanner";
import FramedImage from "@site/src/components/FramedImage";

<PageBanner title="Ecosystem Vaults" />

Ecosystem vaults are curated by the Alchemix team and sit alongside the core protocol. One is live today: the **Alchemix Ecosystem ETH vault**, a WETH vault that earns a blended yield from across the Alchemix ecosystem.

Open it from the top navigation under **Ecosystem → Vaults**, or go directly to [alchemix.fi/ecosystem](https://alchemix.fi/ecosystem), then click the card to expand it.

:::note Looking for the Euler market?
Third-party lending markets are not on this page. The Euler 4-way market has its own page under **Ecosystem → Lending** — see [Lending →](./lending.md).
:::

### Prerequisites

- Connect your wallet.
- Confirm you have ETH for gas.
- Hold WETH to deposit.

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

Switch to the Withdraw tab when you want to exit. Claim your vault shares first, then click **Request Withdraw**. Withdrawals are batched and processed on the fortnightly cycle, so the funds return to your wallet once the next processing window completes.
