---
sidebar_position: 2
hide_title: true
title: Take a Loan
---

import PageBanner from "@site/src/components/PageBanner";
import FramedImage from "@site/src/components/FramedImage";
import VideoEmbed from "@site/src/components/VideoEmbed";

<PageBanner title="Take a Loan" />

<VideoEmbed videoId="AGpP3SAmKLc" title="Take A Loan" />

After depositing into a Mix-Yield Token, you can borrow alAssets against your position. The vault keeps your collateral earning yield and lets you mint synthetic assets (alETH or alUSD respectively) worth up to 90% of your collateral's face value.

:::tip You are in control
You can manually repay part or all of your debt at any time to unlock your collateral. [Learn more about self-repaying loans →](../concepts/self-repaying-loans.md)
:::

### Prerequisites

- Connect your wallet and switch to the chain that holds your MYT deposit.
- Confirm you have ETH for gas on that chain.
- If you don't have an MYT deposit yet, complete the [Mixed Yield tutorial →](./use-passive-myt.md) first.

### Step 1 – Open the vault

<FramedImage src="/img/borrowing-in-alchemix-01.png" alt="Vault detail page" />

Click Vaults in the top navigation, then click the vault you want to borrow against.

### Step 2 – Select the Borrow tab

Open the Borrow tab on the vault page. If you don't already have a corresponding MYT deposit for this vault, you can use the Deposit/Borrow tab to deposit and borrow in one transaction.

### Step 3 – Review position stats

<FramedImage src="/img/borrowing-in-alchemix-02.png" alt="Vault position stats" />

The top of the detail page shows your current position: APR, Deposit, Debt, Health Factor, Earmarked, Redemption Rate, Borrowable, and LTV. The health bar shows your position relative to the MAX LTV and liquidation LTV markers.

:::caution Liquidation risk
Alchemix does not use price-based liquidations. Liquidation risk comes from a yield strategy losing value, which can reduce your collateral below the liquidation threshold (95% LTV). Keeping LTV low reduces your exposure. <br/><br/>[Learn more about Liquidations →](../concepts/liquidations.md)
:::

### Step 4 – Enter a borrow amount

Type the alAsset amount you want to borrow, or click Max to borrow the maximum within the current LTV limit.

### Step 5 – Confirm

Approve the transaction in your wallet. Once it completes, the position stats update to reflect your new debt.

### Step 6 – Track your position

The position is visible on the vault detail page and from your Dashboard. Use the alAsset however you like. Swap it for stablecoins, provide liquidity, or loop it back into the vault for further leverage.

### What repays the debt

Your collateral continues to earn yield in your vault. The DAO sets a period length for redemptions. When a Transmuter user completes a redemption, a slice of depositors' MYT collateral is liquidated to fund the redemption, repaying debt equal to the redeemed amount in the process. Given enough time and redemptions, this will eventually clear a vault user's entire debt.

[Learn more about redemptions →](../concepts/redemption-rate.md)

### Key information

| Parameter               | Value or behavior                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maximum LTV             | 90% of collateral value.                                                                                                                                          |
| Interest Rate           | Zero. Debt balance only declines; it never accrues new interest.                                                                                                  |
| Repayment sources       | Vault yield, transmuter redemptions, manual repayments.                                                                                                           |
| Early repayment options | Use alAssets to repay the debt at any time.                                                                                                                       |
| Position NFT            | Your position is represented by an NFT available in your wallet after the transaction confirms.                                                                   |
| Liquidation             | Liquidations are extremely unlikely, but redemptions are applied to your share of the debt, thus affecting high LTV users more. [Learn more →](../concepts/liquidations.md) |

#### Why borrow instead of selling?

- **Exposure** – Maintain exposure to the yield from your asset while deferring the actual sale of the underlying, supporting short-term cash needs.

- **Stable** – Avoid variable interest rates, price-based liquidations, and rollover risk common in other lending markets.

- **IL Protection** – Combine borrowing with like-for-like liquidity pools to generate fees without impermanent loss.

- **Leverage** – Loop alAssets back into the vault to amplify yield while the repayment mechanism remains self-managed.

Borrowing lets you access liquidity from your collateral while it keeps earning yield.
