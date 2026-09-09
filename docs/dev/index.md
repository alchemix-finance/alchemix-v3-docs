---
sidebar_position: 1
hide_title: true
title: Developer Docs
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Developer Docs" />

This section of the docs contains contract descriptions and architecture describing how Alchemix contracts work and interact on a technical level. For the authoritative contract source, see [github.com/alchemix-finance/v3](https://github.com/alchemix-finance/v3).

### Quick start guide

1. **Deposit to Earn & Borrow**

   Deposit ETH or USDC into a Mix-Yield Token (MYT) to start earning yield, then deposit the MYT into the Alchemist to open a position. Borrow alAssets against it while the MYT keeps earning.

2. **Swap alAsset**

   Swap the alAsset to any other token via a DEX or DEX Aggregator to access the value of your loan. alAssets can also be used directly on some DeFi protocols.

3. **Wait, Withdraw, Borrow, Repay, or Self-Liquidate**

   Your MYT keeps earning on the full deposit. As Transmuter positions mature, redemptions draw MYT from your collateral and cancel the same amount of debt, so the loan pays down over time without action from you. Manage your loan as needed, with the flexibility to withdraw collateral your debt doesn't need, borrow more, repay, or self-liquidate at any time.
