---
sidebar_position: 10
hide_title: true
title: FAQ
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Integrator FAQ" />

Answers to the questions we hear most from projects, protocols, and treasuries evaluating an Alchemix V3 integration. For end-user questions, see the [user FAQ](/user/faq).

<details>

<summary>What is Alchemix V3, in one paragraph?</summary>

Alchemix V3 is a protocol for saving, borrowing, and earning fixed-yield returns. Users deposit ETH or USDC into a Mix-Yield Token (MYT), a DAO-curated basket of yield strategies, and can borrow synthetic alAssets (alETH or alUSD) against it at up to 90% LTV with 0% interest. Debt is repaid automatically by vault yield and scheduled Transmuter redemptions rather than monthly payments.

[Learn more about how Alchemix works →](/user)

</details>

<details>

<summary>Which assets and chains does V3 support?</summary>

V3 accepts ETH and USDC deposits and issues alETH and alUSD against them. The protocol is live on Ethereum Mainnet, Optimism, and Arbitrum, with alAssets bridgeable across supported chains (including Linea and Metis) via the Alchemix Bridge, a custom implementation of the LayerZero OFT standard.

An up-to-date list of networks is always visible in the [app](https://alchemix.fi).

</details>

<details>

<summary>How is V3 different from V2?</summary>

Three headline changes: the maximum LTV rose from 50% to 90%, collateral is now pooled in the Mix-Yield Token instead of single-strategy vaults, and the Transmuter moved to fixed-duration redemptions with known maturity dates. All V2 positions were migrated to V3 in April 2026.

[Read the migration record →](/user/v3-migration)

</details>

<details>

<summary>Can users be liquidated?</summary>

Not by price movements. Debt is denominated in the same asset as the collateral (like-kind borrowing), so market volatility does not change a position's LTV. Liquidation is only possible if the MYT itself loses backing — for example through a strategy exploit — and a position crosses the liquidation threshold above the 90% borrowing cap.

[Learn more about liquidations →](/user/concepts/liquidations)

</details>

<details>

<summary>What can integrators actually build on?</summary>

The main integration surfaces are:

- **MYT** – an ERC-4626-based yield token that wallets, aggregators, and treasuries can hold or route deposits into.
- **alAssets** – synthetic tokens with dedicated Chronicle Labs price feeds, usable as collateral or in liquidity pools on external protocols.
- **The Transmuter** – fixed-term 1:1 redemptions that create predictable, bond-like yield for treasuries and structured products.

[Explore the use cases →](/projects/why-integrate/use-cases)

</details>

<details>

<summary>How are alAssets priced by external protocols?</summary>

Each alAsset has a dedicated oracle feed provided by Chronicle Labs. This lets money markets and other protocols verifiably price alUSD and alETH, so they can be listed as productive collateral rather than only traded on DEXs.

[Learn more about alAssets across DeFi →](/user/concepts/alAssets#using-alassets-across-defi)

</details>

<details>

<summary>Is Alchemix V3 audited?</summary>

Yes. The V3 codebase was reviewed by Spearbit/Cantina, Nethermind, yAudit, an Immunefi audit competition, and independent researcher alpeh_v, alongside an in-house testing suite. Every new MYT strategy is audited by Nethermind before whitelisting, the protocol is monitored in real time by Hypernative with auto-pause capability, and an Immunefi bug bounty of up to $300,000 is active.

[Full audit reports and security practices →](/user/safety/security)

</details>

<details>

<summary>Can we fork Alchemix V3?</summary>

The V3 codebase is source-available under the Business Source License (BUSL) 1.1, so production deployments require a license agreement. The Friendly Fork Initiative provides that path: approved teams receive a commercial license, chain exclusivity for their target ecosystem, and direct technical advisory in exchange for revenue share and alignment with the Alchemix DAO.

[Read the Friendly Fork terms →](/projects/how-to/friendly-fork)

</details>

<details>

<summary>What marketing support do partners get?</summary>

Partners get a BD lead for launch coordination, co-authored announcements and threads, invitations to community events such as Fireside chats and X Spaces, and access to brand assets and templates.

[See co-marketing and BD support →](/projects/support/co-marketing)

</details>

<details>

<summary>How do we start a conversation?</summary>

Fill in the [partnership interest form](https://docs.google.com/forms/d/1QxQ2fjYckzqoAFAEY9xYXpXdw6zb4Z6o5NaIiUVhQlE/viewform), or reach the team directly in the [Alchemix Discord](https://discord.gg/alchemix). For Friendly Fork inquiries you can also contact our Partnerships Lead on Telegram: **@Ov3rkoalafied**.

[Apply to partner →](/projects/contact/apply-to-partner)

</details>
