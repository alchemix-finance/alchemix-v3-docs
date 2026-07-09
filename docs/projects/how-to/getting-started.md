---
sidebar_position: 2
hide_title: true
title: Getting Started
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Getting Started" />

Most integrations follow one of four paths. Find yours below, then reach out — every integration gets a direct line to the core team, so you never have to reverse-engineer the protocol alone.

### 1. Route deposits into the MYT

**For:** wallets, yield aggregators, onboarding platforms.

The Mix-Yield Token is a customized vault token built on Morpho Vaults V2 (ERC-4626). It holds ETH or USDC deposits and spreads them across DAO-curated strategies, compounding continuously with no lock-ups. If your product can hold or route into an ERC-4626-style vault, it can offer Alchemix yield as a single standardized asset.

- [How MYT works →](/user/concepts/myt-and-yield)
- [Live vaults and current strategy mix →](https://alchemix.fi/mixed-yield)

### 2. List alAssets as collateral or liquidity

**For:** money markets, DEXs, liquidity managers.

alUSD and alETH each have a dedicated Chronicle Labs oracle feed, so external protocols can price them verifiably. Like-for-like pools (alETH/ETH-family pairs) avoid impermanent loss on the alAsset side because the Transmuter redeems 1:1 at maturity.

- [alAssets and external pricing →](/user/concepts/alAssets#using-alassets-across-defi)
- [How the peg holds →](/user/concepts/how-peg-is-maintained)

### 3. Build fixed-income products on the Transmuter

**For:** treasuries, structured-product designers, fixed-income desks.

Deposit alAssets into the Transmuter and receive a guaranteed 1:1 redemption at a known maturity date. Acquiring alAssets below par turns that into a fixed rate known at entry — a bond-like primitive that can be wrapped, tranched, or laddered.

- [Transmuter mechanics →](/user/concepts/transmuter)
- [Live terms and rates →](https://alchemix.fi/fixed-yield)

### 4. Deploy your own fork

**For:** teams bringing the Alchemix engine to a new chain or asset class.

Alchemix V3 is source-available under BUSL 1.1. The Friendly Fork Initiative licenses the codebase for production use, with chain exclusivity and direct technical advisory from the core team.

- [Friendly Fork terms →](./friendly-fork.md)

### Before you build

- **Read the protocol docs.** The [user documentation](/user) covers mechanics; the [developer section](/dev) covers contracts and is being expanded.
- **Check the code.** The V3 contracts are public at [github.com/alchemix-finance/v3](https://github.com/alchemix-finance/v3).
- **Understand the risk model.** [Risk considerations](/user/safety/risk-considerations) explains counterparty exposure for each role in the system, and [Security & audits](/user/safety/security) covers the audit suite and monitoring.

### Talk to us

Fill in the [partnership form](https://docs.google.com/forms/d/1QxQ2fjYckzqoAFAEY9xYXpXdw6zb4Z6o5NaIiUVhQlE/viewform) or find us in [Discord](https://discord.gg/alchemix). We pair every serious integration with a BD lead and technical contact.

[Apply to partner →](../contact/apply-to-partner.md)
