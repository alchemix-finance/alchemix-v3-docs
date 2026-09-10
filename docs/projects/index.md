---
sidebar_position: 1
hide_title: true
title: Welcome
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Why Integrate Alchemix?" />

Alchemix V3 transforms a single deposit of ETH or USDC into two complementary, capital-efficient positions. First, funds are wrapped into a **Mix-Yield Token (MYT)**, which earns yield across a diversified set of strategies curated and risk-managed by the Alchemix DAO. This same collateral simultaneously unlocks a flexible credit line, allowing users to mint synthetic **alAssets (alETH or alUSD)** worth up to 90% of the initial deposit.

The redesigned **Transmuter** accepts these alAssets and, on a fixed schedule, returns MYT at a 1:1 ratio. This redemption path anchors alAsset prices near their underlying assets and creates predictable, bond-like yield opportunities for users who acquire alAssets below par.

## Why integrate Alchemix?

Integrating with Alchemix V3 provides a combination of capital efficiency that traditional lending protocols cannot match. With **interest-free debt** and **industry-leading LTVs**, users can unlock liquidity without sacrificing their underlying yield. Because the protocol uses like-kind borrowing (e.g., borrowing ETH against ETH), liquidation risk remains significantly lower than traditional cross-collateral looping, creating a superior risk-adjusted yield profile. The Transmuter adds a **fixed-yield arbitrage** opportunity on top, letting integrators capture a predictable spread. By building on V3, partners and users effectively piggyback off the protocol's growth and its battle-tested security framework.

## Where the platform fits

- **DAO Treasuries** – Raise operating capital without liquidating long-term holdings. DAOs can mint alAssets, exchange them for their required spending currency, and let scheduled redemptions repay the debt from collateral over time while the collateral keeps earning.

- **Yield Strategists** – Thanks to Alchemix's like-kind borrowing and 0% interest on its debt, users can loop alAssets back into the vault to generate reliable and highly competitive yield for both ETH and USD.

- **Liquidity Providers** – LPs can pair alAssets with another token that tracks the same price (for example, alETH with frxETH) and keep impermanent-loss risk on the alAsset side low, since 1:1 redemptions through the Transmuter limit how far the alAsset can trade from its underlying.

## Core features

| Feature                    | Purpose                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Alchemist                  | The core borrowing engine. Deposit MYT collateral to mint alAssets. Each position is an NFT.          |
| Mix-Yield Token (MYT)      | ERC-4626 basket of yield strategies, which can be unwrapped for the underlying assets, subject to strategy liquidity. |
| Transmuter                 | Fixed-duration redemptions that stabilize alAsset prices and create predictable return opportunities. |
| Self-repaying CDP          | Debt is retired by scheduled Transmuter redemptions drawn from collateral, while the collateral keeps earning yield. |

## What integrators gain

By building on top of the V3 stack, projects gain a single-token gateway to highly competitive ETH and USD yield. Integrators can offer returns managed by a diversified set of DAO-curated strategies without the overhead of building internal yield infrastructure.

Beyond yield, integrating alAssets as collateral or within liquidity pools gives projects direct exposure to the growth of the Alchemix V3 economy. Partners benefit from increased Total Value Locked (TVL), simplified liquidity management thanks to the low impermanent loss of like-for-like pairs, and joint marketing opportunities across the Alchemix ecosystem. As V3 scales, integrators are positioned to capture the value flowing through one of DeFi's most sustainable synthetic-asset engines.

## Who benefits most

End users seeking passive yield, money-market protocols in search of high-quality collateral, vault curators adding new strategies, DAO treasuries managing runway, leverage-oriented yield farmers, and liquidity providers who want prices on both sides of a pool to move together.
