---
sidebar_position: 1
hide_title: true
title: Welcome
---

import integrations from '@site/static/img/integrations-01.png';

<img src={integrations} alt="Why Integrate Alchemix?" fetchpriority="high" class="banner-spacing" />

Alchemix V3 transforms a single deposit of ETH or USDC into two complementary, capital-efficient positions. First, funds are wrapped into a **Mix-Yield Token (MYT)**, which earns yield across a diversified set of strategies curated and risk-managed by the Alchemix DAO. This same collateral simultaneously unlocks a flexible credit line, allowing users to mint synthetic **alAssets (alETH or alUSD)** worth up to 90% of the initial deposit.

The redesigned **Transmuter** accepts these alAssets and, on a fixed schedule, returns MYT at a 1:1 ratio. This mechanism ensures alAssets maintain tight price parity with their underlying assets while creating predictable, bond-like yield opportunities for users who acquire alAssets at a market discount.

## Why Integrate Alchemix?

Integrating with Alchemix V3 provides a unique "triple-threat" of capital efficiency that traditional lending protocols cannot match. By utilizing **interest-free debt** and **industry-leading LTVs**, users can unlock liquidity without sacrificing their underlying yield. Because the protocol uses "like-kind" borrowing (EG, borrowing ETH against ETH), liquidation risk remains significantly lower than traditional cross-collateral looping, creating a superior risk-adjusted yield profile. Furthermore, the Transmuter offers a **fixed-yield arbitrage** opportunity, allowing integrators to capture a predictable spread. By building on V3, partners and users effectively piggyback off the protocol's growth and its battle-tested security framework.

## Where the Platform Fits

- **DAO Treasuries** – Raise operating capital without liquidating long-term holdings. DAO’s can mint alAssets, exchange them for their required spending currency, and let the vault yield repay their debt over time.

- **Yield Strategists** – Thanks to Alchemix's like-kind borrowing and 0% interest on its debt, users can use our looping tool to generate reliable and highly competitive yield for both ETH and USD.

- **Liquidity Providers** – LPs can pair alAssets with another token that tracks the same price (for example, alETH with frxETH) and eliminate impermanent-loss risk on the alAsset side thanks to 1 to 1 redemptions through the Transmuter.

## Core Features

| Feature                    | Purpose                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Alchemist Vault (ERC-4626) | The core borrowing engine. Deposit collateral to mint alAssets.                                       |
| Mix-Yield Token (MYT)      | Tokenized basket of yield strategies, which can be unwrapped for the underlying assets at any time.   |
| Transmuter                 | Fixed-duration redemptions that stabilise alAsset prices and create predictable return opportunities. |
| Self-repaying CDP          | Debt is automatically retired by vault yield and scheduled redemptions.                               |

## Why Integrate

Integrating with Alchemix V3 provides partners with a capital-efficient framework to unlock liquidity and offer superior value to their users. By building on top of the V3 stack, projects gain a single-token gateway to highly competitive ETH and USD yield. This allows integrators to offer "best-in-class" returns managed by a diversified set of DAO-curated strategies, without the overhead of building internal yield infrastructure.

Beyond yield, integrating alAssets as collateral or within liquidity pools gives projects direct exposure to the growth of the Alchemix V3 economy. Partners benefit from increased Total Value Locked (TVL), simplified liquidity management due to the absence of impermanent loss on like-for-like pairs, and joint marketing opportunities across the Alchemix ecosystem. As V3 scales, integrators are positioned to capture the value flowing through one of DeFi's most sustainable synthetic-asset engines.

## Who Benefits Most

End users seeking passive yield, money-market protocols in search of high-quality collateral, vault curators adding new strategies, DAO treasuries managing runway, leverage-oriented yield farmers, and liquidity providers who want prices on both sides of a pool to move together.
