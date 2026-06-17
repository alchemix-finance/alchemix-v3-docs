---
hide_title: true
title: Quick Start
---

import PageBanner from "@site/src/components/PageBanner";
import FramedImage from "@site/src/components/FramedImage";
import PositionTimeline from "@site/src/components/PositionTimeline";

<PageBanner title="Quick Start" />

This page walks through the core borrowing path. A small deposit, a modest borrow, and what to expect as redemptions reduce your balance over time.

- Deposit ETH or USDC to mint MYT and start earning yield.
- Borrow at about 20% LTV to mint alAssets, then swap them to USDC if you want working capital. (The protocol allows up to **90%** LTV; this guide uses ~20% as a conservative starting point.)
- Watch scheduled redemptions reduce your debt while your full collateral keeps earning until maturity.

If you already know what you're looking for, jump straight to the relevant tutorial:

- [Earn yield with Mixed Yield →](./tutorials/use-passive-myt.md)
- [Buy alAssets below peg for fixed returns →](./tutorials/redeem-alassets.md)

### Prerequisites

Connect a wallet on the target chain and keep a small balance of the native gas token. Hold ETH or USDC for your deposit.

### Step 1 – Deposit to the MYT

<FramedImage src="/img/quick-start-01.png" alt="Deposit to MYT" />

Open Vaults, select Mix ETH or Mix USDC on your chain, and deposit. The vault will mint MYT at a rate equivalent to your underlying assets. From here on out, each MYT represents a growing claim on the underlying as strategies earn.

### Step 2 – Borrow at 20% LTV

<FramedImage src="/img/quick-start-02.png" alt="Borrow at 20% LTV" />

:::tip Check the alAsset market price first
alAssets can trade slightly below 1:1 on the open market. If alUSD trades at 0.99 USDC, selling 200 alUSD yields ~198 USDC, which is a ~$2 upfront cost relative to your 200 alUSD of recorded debt. The dApp shows the current price and estimated proceeds before you confirm.
:::

On the same vault page stay on Deposit / Borrow. Enter a borrow near 20% LTV, then mint [alETH or alUSD](./concepts/alAssets.md), respectively.

If you need spendable funds, swap the alAsset to USDC. The borrower fee shown in the UI will apply when redemptions occur.

:::caution Before you confirm

- **Strategy mix:** open the vault details to see the current MYT weight and ceilings for higher-risk buckets.
- **Health bar:** note the Liquidation LTV marker. Keep a wide buffer to reduce the need for active position management.
  :::

### Step 3 – Let it run

The timeline below shows how this plays out in practice. Redemptions outpace yield in the first quarter, then yield overtakes — debt drops 57% in a year while collateral finishes above its starting value. No repayments, no interest, no action required.

<PositionTimeline />

### Next steps

Explore the concepts behind what you just did:

- [Mix-Yield Token →](./concepts/myt-and-yield.md)
- [Redemption Rate →](./concepts/redemption-rate.md)
- [Liquidations →](./concepts/liquidations.md)
- [The Transmuter →](./concepts/transmuter.md)

Or go deeper with the step-by-step tutorials:

- [Deposit & Borrow →](./tutorials/deposit-and-borrow.md)
- [Repay Loans →](./tutorials/repay-loan.md)
- [Redeem alAssets →](./tutorials/redeem-alassets.md)
