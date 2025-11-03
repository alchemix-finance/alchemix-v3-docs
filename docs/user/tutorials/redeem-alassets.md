---
sidebar_position: 4
hide_title: true
sidebar_label: Redeem alAssets
---

import redeemAlassets from '@site/static/img/redeem-alassets-banner-01.png';

<img src={redeemAlassets} alt="Redeem alAssets" class="banner-spacing" />

The Earn page lists every fixed-rate term available on your current network. By depositing alAssets, or letting the interface swap ETH or USDC into their alAsset form, you lock in a known return that settles on the term’s maturity date.

While your position sits in the queue Alchemix earmarks matching collateral at 1:1 so your redemption is guaranteed once the term ends. Early exits are possible, but they forfeit part of the promised yield.

## Step 1 – Open the Earn page

![](/img/redeem-alassets-01.png)

**Earn page** – each panel shows a fixed-rate term you can enter.

## Step 2 – Pick a term

Each panel displays:

- Maturity Date

- Current alAsset price

- Projected fixed APR

- Deposit cap and remaining room

Click a term to select it.

## Step 3 – Choose a deposit asset

Use the dropdown on the right side of the panel to choose either alAsset, or its respective underlying asset. If you pick ETH or USDC, the interface swaps it to the matching alAsset before depositing automatically.

## Step 4 – Enter your amount

Type how much of the selected asset you want to commit. The panel instantly shows:

- Estimated percentage return

- Estimated asset return at maturity

## Step 5 – Submit or batch

- Click deposit to send a single transaction, or;

- Click the cart icon to add this deposit to a bundle you’ll submit later in a batch.

Approve the transaction in your wallet.

## Manage or close a position

Go to the Dashboard and scroll to Open Earn Positions.

![](/img/redeem-alassets-02.png)

| Function      | When to use                | Effect                                                                                                                                       |
| ------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Close         | Term ended                 | Receive underlying (or MYT if liquidity is tight).                                                                                           |
| Close (early) | Need funds before maturity | Receives a reduced amount, UI shows the penalty in advance. The penalty is a percentage set by the DAO, applying to untransmuted funds only. |

If the contract returns MYT due to temporary liquidity limits, you can unwrap it manually or wait until the queue clears.

## Key points

- Fixed-rate terms pay the displayed return only at maturity.

- Early closure invokes the penalty shown in the UI.

- Term yields and alAsset prices may differ by chain, always confirm panel values before depositing.
