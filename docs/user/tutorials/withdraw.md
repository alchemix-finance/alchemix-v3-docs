---
sidebar_position: 4
hide_title: true
title: Withdraw
---

import PageBanner from "@site/src/components/PageBanner";
import FramedImage from "@site/src/components/FramedImage";
import VideoEmbed from "@site/src/components/VideoEmbed";

<PageBanner title="Withdraw" />

<VideoEmbed videoId="JWfYe6PJYZ4" title="Withdrawing Collateral" />

You can withdraw collateral from Alchemix at any time.

- **Vault deposits with a loan** – withdrawing reduces your collateral and raises your LTV. Check your position before pulling funds out.
- **Mixed Yield deposits without a loan** – there is no LTV to manage. Withdraw any amount up to your full balance.

### Prerequisites

- Connect your wallet and switch to the chain that holds the position.
- Confirm you have ETH for gas on that chain.

### Step 1 – Open the vault

<FramedImage src="/img/withdraw-01.png" alt="Vault detail page" />

Click Dashboard in the top navigation, then click the vault you want to withdraw from.

### Step 2 – Open the Withdraw tab

<FramedImage src="/img/withdraw-02.png" alt="Withdraw tab" />

On the left panel, switch to the Withdraw tab.

### Step 3 – Check your LTV

The health bar shows your current position relative to the 90% MAX LTV cap. Withdrawing does not touch your debt, but it shrinks your collateral pushing your LTV upward. If the amount you plan to withdraw will cross the MAX LTV line, repay a little first to give yourself headroom.

[Learn how to repay →](./repay-loan.md)

### Step 4 – Enter an amount

Type the amount you want to withdraw into the input field. The vault returns your underlying asset, including any yield the MYT has accrued.

### Step 5 – Confirm

Click Withdraw. Your wallet shows the network, gas estimate, and amounts. Approve the transaction.
