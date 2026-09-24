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
- **Mixed Yield deposits without a loan** – there is no LTV to manage. Withdraw any amount up to your full balance. These deposits are not vault positions, so they are managed from a different place. See [Withdrawing an MYT deposit that has no loan](#withdrawing-an-myt-deposit-that-has-no-loan) below.

### Prerequisites

- Connect your wallet and switch to the chain that holds the position.
- Confirm you have ETH for gas on that chain.

### Step 1 – Open the vault

<FramedImage src="/img/withdraw-01.png" alt="Dashboard showing open vault positions" />

Click Dashboard in the top navigation, then click **Manage** on the vault position you want to withdraw from.

### Step 2 – Open the Withdraw tab

<FramedImage src="/img/withdraw-02.png" alt="Withdraw tab" />

On the left panel, switch to the Withdraw tab.

### Step 3 – Check your LTV

The health bar shows your current position relative to the 90% MAX LTV cap. Withdrawing does not touch your debt, but it shrinks your collateral pushing your LTV upward. If the amount you plan to withdraw will cross the MAX LTV line, repay a little first to give yourself headroom.

[Learn how to repay →](./repay-loan.md)

[Learn more about LTV and liquidations →](../concepts/liquidations.md)

### Step 4 – Enter an amount

Type the amount you want to withdraw into the input field. The vault returns your underlying asset, including any yield the MYT has accrued.

### Step 5 – Confirm

Click Withdraw. Your wallet shows the network, gas estimate, and amounts. Approve the transaction.

### Withdrawing an MYT deposit that has no loan

Deposits made on the Mixed Yield page do not appear under Open Vault Positions. On the Dashboard, scroll to Mixed Yield Token Holdings and click **Manage** on the row you want. The Manage MYT Position window has Deposit and Withdraw tabs. Open Withdraw, enter the amount, and confirm.

The expanded vault card on the Mixed Yield page, under Earn → Variable Rate, has the same Withdraw tab. Choosing ETH instead of WETH adds an unwrap step to the transaction flow.
