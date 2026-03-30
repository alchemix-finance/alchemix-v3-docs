---
sidebar_position: 1
hide_title: true
title: Mix-Yield Token
---

import PageBanner from "@site/src/components/PageBanner";
import FeatureCards from "@site/src/components/FeatureCards";

<PageBanner title="Mix-Yield Token" />

Mix-Yield Token (MYT) gives you passive exposure to a curated set of yield strategies without needing to manage positions yourself. Each token represents a share of assets that the Alchemix DAO allocates across multiple protocols.

[Explore technical documentation for MYT →](../../dev/myt/myt-contract)

### What is the MYT?

- **Tokenized basket** – MYT is a customized vault token utilizing Morpho V2's open-source infrastructure. It holds deposits of ETH or USDC and routes them into several yield sources.

- **DAO-managed allocation** – The Alchemix DAO selects strategies, sets target weights, and rebalances as markets shift.

- **Powered by open-source infrastructure** – The core Alchemix vault logic utilizes Morpho's open-source v2 vaults layer to optimize on-chain execution and safety.

### Why use the MYT?

<FeatureCards items={[
  {
    title: "Passive income",
    body: "Each deposit gives you diversified yield without manual re-staking.",
  },
  {
    title: "Risk management",
    body: "DAO oversight, strategy diversification and rebalancing reduce single-protocol exposure.",
  },
  {
    title: "Flexibility",
    body: "Choose the chain and bundle that suit your goals, redeem at any time.",
  },
]} />

### Per-chain variants

There is one ETH-denominated and one USDC-denominated MYT on every supported chain. Strategies differ by chain, letting you choose the profile that matches your preferences. These strategies can change with DAO-issued votes.

You can view the current strategy breakdowns [directly in the UI →](https://alchemix.fi/)

### Depositing and earning

1. Select the MYT that matches your base asset and preferred chain.

2. Deposit ETH or USDC, and the vault will mint MYT at the current exchange rate. As yield accrues, each MYT represents an increasing claim on the underlying asset.

3. Hold MYT. As strategies earn yield, the redemption value of each token increases.

4. Redeem at any time for your principal plus any accumulated yield.

There are no lock-ups, and yield compounds continuously.

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'fontFamily': 'Montserrat',
    'primaryColor': '#141618',
    'primaryBorderColor': 'rgba(245,192,154,0.25)',
    'primaryTextColor': '#e8e8ea',
    'lineColor': '#f5c09a',
    'edgeLabelBackground': 'transparent',
    'tertiaryColor': '#141618',
    'fontSize': '18px'
  },
  'flowchart': { 'curve': 'monotoneX', 'nodeSpacing': 60, 'rankSpacing': 90 }
}}%%
flowchart LR
    classDef default font-weight:bold;
    A(Deposit<br/>ETH / USDC) e1@--> B(MYT<br/>minted)
    B e2@--> C(Yield strategies<br/><span style='color:#8a8f99'>Strategy A · Strategy B · Strategy C</span>)
    C e3@--> D(Yield<br/>accrues)
    D e4@--> E{{MYT redemption<br/>value grows}}
    E e5@-.->|redeem anytime| A
    style E fill:#f5c09a,stroke:#1b1b1d,stroke-width:2px,color:#1b1b1d
    linkStyle 0,1,2,3 stroke:#f5c09a,stroke-width:2px
    linkStyle 4 stroke:#f5c09a,stroke-width:1.5px,stroke-dasharray:6
    e1@{ animation: slow }
    e2@{ animation: slow }
    e3@{ animation: fast }
    e4@{ animation: fast }
    e5@{ animation: slow }
```
