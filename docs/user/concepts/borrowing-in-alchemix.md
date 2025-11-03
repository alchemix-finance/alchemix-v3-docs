---
sidebar_position: 2
hide_title: true
sidebar_label: Borrowing In Alchemix
---

import borrowing from '@site/static/img/borrowing-01.png';

<!-- TODO -->

<img src={borrowing} alt="Borrowing" class="banner-spacing" />

After converting ETH or USDC into the Mixed-Yield Token, the next step is borrowing. The vault keeps your collateral and lets you mint synthetic assets—alETH or alUSD respectively—worth up to ninety percent of the collateral’s face value.

## How borrowing works

![](/img/borrowing-in-alchemix-01.png)

1. Navigate to the Borrow panel in your vault.

2. Choose an amount of alAsset to mint. The “max” function will give the maximum value allowable within the bound of 90% LTV.

   **Note:** If a yield strategy loses money, you could be liquidated. The LTV at which a liquidation will occur is 95% LTV. Choose your LTV with this in mind.

3. Sign the transaction. Alchemix will mint the requested alAsset directly to your wallet.

4. Use the alAsset in any way you like—swap it for stablecoins, provide liquidity, or loop it back into the vault for further leverage.

## What repays the debt

Your collateral continues to earn yield in your vault. The DAO sets a period length for redemptions. When a Transmuter user completes a redemption, a slice of depositors’ MYT collateral is liquidated to fund the redemption, repaying debt equal to the redeemed amount in the process. Given enough time and redemptions, this will eventually clear a vault user’s entire debt.

[Learn more about redemptions →](./redemption-rate.md)

## Key Information

| Parameter               | Value or behavior                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Maximum LTV             | 90% of collateral value.                                                                                                                     |
| Interest Rate           | Zero. Debt balance only declines; it never accrues new interest.                                                                             |
| Repayment sources       | Vault yield, transmuter redemptions, manual repayments.                                                                                      |
| Early repayment options | Use alAssets to repay the debt at any time.                                                                                                  |
| Position NFT            | Your position is represented by an NFT available in your wallet after the transaction confirms.                                              |
| Liquidation             | Liquidations are extremely unlikely, but redemptions are applied to your share of the debt, thus affecting high LTV users more. Learn more → |

### Why borrow instead of selling?

- **Exposure** – Maintain exposure to the yield from your asset while deferring the actual sale of the underlying, supporting short-term cash needs.

- **Stable** – Avoid variable interest rates, price-based liquidations, and rollover risk common in other lending markets.

- **IL Protection** – Combine borrowing with like-for-like liquidity pools to generate fees without impermanent loss.

- **Leverage** – Loop alAssets back into the vault to amplify yield while the repayment mechanism remains self-managed.

Borrowing in Alchemix turns yield-bearing collateral into an immediate source of flexible liquidity, without sacrificing future upside or introducing unpredictable financing costs.
