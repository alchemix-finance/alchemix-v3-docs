---
sidebar_position: 2
hide_title: true
sidebar_label: Repay Loans
---

import repayLoans from '@site/static/img/repay-loans-01.png';

<img src={repayLoans} alt="Repay Loans" class="banner-spacing" />

## Why Repay?

Paying down or closing a loan does more than remove debt. It directly improves every metric that governs how much flexibility you still have inside the vault.

- **Lower LTV, higher health factor** – each repayment moves your loan health toward green and raises the liquidation buffer.

- **Collateral freedom** – collateral earmarked for the next redemption cycle is released proportionally, so you can withdraw it or redeploy it elsewhere.

- **Room for withdrawals** – if you need to pull principal out of the vault, reducing debt first keeps your LTV from spiking and prevents an accidental liquidation trigger.

Making even a small repayment secures more control over how and when you use your collateral.

![](/img/repay-loan-01.png)

The Repay tab accepts three asset types: alAssets, MYT, or the underlying token. You can use whichever is most convenient or cheapest at the moment.

## Earmarked vs non-earmarked debt

| Debt type     | How to identify                   | Repayment asset | Effect                                     |
| ------------- | --------------------------------- | --------------- | ------------------------------------------ |
| Non-earmarked | “Earmarked” counter = 0 in the UI | alAsset         | Reduces debt immediately.                  |
| Earmarked     | “Earmarked” shows a token amount  | MYT             | Repays the reserved slice. The MYT you use |

Repaying earmarked debt before maturity can keep your health factor higher.

## Step 1 – Choose what to repay with

| Option                   | When to use                          | Notes                                                                   |
| ------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| alAsset (alUSD or alETH) | Standard debt                        | Repays non-earmarked debt only.                                         |
| MYT (Mix-Yield Token)    | Earmarked debt and/oor standard debt | Required for any debt already earmarked for a redemption cycle.         |
| Underlying (ETH or USDC) | Convenience                          | Interface swaps to MYT behind the scenes before applying the repayment. |

The asset-selector dropdown (left side of the entry box) will only list what is valid for the current vault state.

:::tip Pro Tip: Repaying with alAssets
You can often buy alUSD or alETH on secondary markets (like Curve) for slightly less than $1.00. Using these discounted tokens to repay your loan allows you to clear your debt cheaper than 1:1!
:::

## Step 2 – Enter the amount

Type the number of tokens you want to use to repay debt. The “Max” function will attempt to use your entire wallet balance, or the remainder of the debt balance, whichever is lower.

## Step 3 – Send or batch the transaction

- Click Repay to send a single repayment, or;

- Click the cart icon to collect other Alchemix transactions, such as deposits, withdrawals, or other repayments.

Confirm the transaction in your wallet.

## Tips

- If you plan to close a position entirely, repay any earmarked debt first (MYT) and then clear the remainder with your choice of asset.

- Repaying earmarked debt with MYT can free up borrowable capacity sooner in a high redemption rate period.
