---
hide_title: true
sidebar_label: Quick Start
---

import quickStartBanner from '@site/static/img/quick-start-banner-01.png';

<img src={quickStartBanner} alt="Quick Start" class="banner-spacing" />

This page gives you a low-risk way to see Alchemix at work. It will walk through a small deposit, a modest borrow, and what to expect as redemptions reduce your balance.

## What you will do

- Deposit ETH or USDC to mint MYT and start earning yield.
- Borrow at about 20% LTV to mint alAssets, then swap them to USDC if you want working capital.
- Watch scheduled redemptions reduce your debt while your full collateral keeps earning until maturity.

### Prerequisites

Connect a wallet on the target chain and keep a small balance of the native gas token. Hold ETH or USDC for your deposit.

### Step 1 – Deposit to MYT

![](/img/quick-start-01.png)

Open Vaults, select Mixed-ETH or Mixed-USDC on your chain, and deposit. The vault will mint MYT at a rate equivalent to your underlying assets. From here on out, each MYT represents a growing claim on the underlying as strategies earn.

### Step 2 – Borrow at 20% LTV

![](/img/quick-start-02.png)

On the same vault page stay on Deposit / Borrow. Enter a small borrow near 20% LTV, then mint alETH or alUSD, respectively.

If you need spendable funds, swap the alAsset to USDC. Ensure you check the alAsset market price first. If it is below 1.00, the gap is your up-front cost. The borrower fee shown in the UI will apply when redemptions occur.

## What happens next

Redemptions run on fixed terms set by the DAO. When a batch matures, the system uses earmarked collateral to repay part of your debt. Between batches, the entire collateral balance continues compounding. The result is gradual deleveraging without variable interest.

### Example

**Deposit**: 1,000 USDC  
**Borrow**: 200 alUSD (20% LTV)  
**alUSD market price**: 0.99 USDC  
**Up-front cost from the price gap**: about 2 USDC on a full sale of the 200 alUSD  
**Borrower fee**: shown in dapp. Applies only when redemptions settle.

You now hold MYT that keeps earning, plus 200 alUSD you can swap or deploy. As redemptions arrive, your debt steps down until it nears zero. Collateral remains in place and continues compounding, provided the yield rate remains above the redemption rate divided by 5. (Only the 20% LTV borrowed will be redeemed at the specified rate).

## Safety checks

- **Strategy mix:** open the vault details to see current MYT weight and ceilings for higher-risk buckets.
- **Health bar:** note the Liquidation LTV market. This is the live liquidation threshold. Ensure you keep a wide buffer to reduce the need for active position management.

## How to unwind

Repay any remaining alAssets, then withdraw your collateral from the vault. If you swapped your alAssets to USDC, you can swap back to alAssets to repay and withdraw.

## Next steps

This is only the basics! Next, dive into some of these core concepts:

[Learn more about MYT →](./concepts/myt-and-yield.md)

[Learn more about Redemptions →](./concepts/redemption-rate.md)

[Learn more about Liquidations →](./concepts/liquidations.md)
