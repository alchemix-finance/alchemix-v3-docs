---
sidebar_position: 2
hide_title: true
title: How the Peg Works
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="How the Peg Works" />

<Term id="alasset">alAssets</Term> are the tokens you borrow against your collateral. Their price floats near 1.00, but the protocol never forcibly pins it there. Market incentives and redemption mechanics do the work of pulling price back to parity after short-term drifts.

**How the soft-peg works:** Inside the vault 1 alAsset always cancels 1 unit of debt, even if that token trades at a discount on exchanges. Fixed-duration redemptions and arbitrage tighten the gap, so price tends to revert without an explicit hard-peg.

### Why price drifts happen

#### Expansion – Borrowing & sale

When vault yield and redemption terms look attractive, borrowing spikes. Newly minted alAssets are often sold for the underlying or supplied single-sided to LPs, creating sell pressure and widening the discount.

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'fontFamily': 'Montserrat',
    'primaryColor': '#141618',
    'primaryBorderColor': 'rgba(245,192,154,0.25)',
    'primaryTextColor': '#e8e8ea',
    'lineColor': '#f5c09a',
    'edgeLabelBackground': '#0d0e10',
    'tertiaryColor': '#141618',
    'fontSize': '18px'
  },
  'flowchart': { 'curve': 'monotoneX', 'nodeSpacing': 80, 'rankSpacing': 100 }
}}%%
flowchart LR
    classDef default font-weight:bold;
    A(Borrow) e1@--> B(Mint alAsset) e2@--> C(Sell alAsset) e3@--> D{{Price < 1.00}}
    D e4@-.->|contraction corrects| A
    style D fill:#f5c09a,stroke:#1b1b1d,stroke-width:2px,color:#1b1b1d
    linkStyle 0,1,2 stroke:#f5c09a,stroke-width:2px
    linkStyle 3 stroke:#f5c09a,stroke-width:1.5px,stroke-dasharray:6
    e1@{ animation: slow }
    e2@{ animation: slow }
    e3@{ animation: fast }
    e4@{ animation: slow }
```

#### Contraction – Transmuter demand

A wider discount plus a fixed-term <Term id="transmuter">Transmuter</Term> deposit produces a bond-like APR. Traders buy cheap alAssets, deposit them. The protocol earmarks an equal slice of collateral, transfers it to the Transmuter, and burns the alAssets at maturity. Supply contracts and price moves back towards peg.

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'fontFamily': 'Montserrat',
    'primaryColor': '#141618',
    'primaryBorderColor': 'rgba(245,192,154,0.25)',
    'primaryTextColor': '#e8e8ea',
    'lineColor': '#f5c09a',
    'edgeLabelBackground': '#0d0e10',
    'tertiaryColor': '#141618',
    'fontSize': '18px'
  },
  'flowchart': { 'curve': 'monotoneX', 'nodeSpacing': 60, 'rankSpacing': 100 }
}}%%
flowchart LR
    classDef default font-weight:bold;
    A(Buy alAsset at discount) e1@--> B(Deposit to Transmuter) e2@--> C(alAssets burned) e3@--> D{{Price recovers to 1.00}}
    D e4@-.->|expansion resumes| A
    style D fill:#f5c09a,stroke:#1b1b1d,stroke-width:2px,color:#1b1b1d
    linkStyle 0,1,2 stroke:#f5c09a,stroke-width:2px
    linkStyle 3 stroke:#f5c09a,stroke-width:1.5px,stroke-dasharray:6
    e1@{ animation: slow }
    e2@{ animation: slow }
    e3@{ animation: fast }
    e4@{ animation: slow }
```

Borrowing becomes less attractive while the redemption queue is large, so the system naturally flips between expansion and contraction until equilibrium is reached.

#### External utility – Holding instead of selling

alAssets are now externally priceable through dedicated [Chronicle Labs](./alAssets.md#using-alassets-across-defi) oracles, so holders can deploy them as collateral in other DeFi protocols rather than selling them. Every holder who puts an alAsset to work elsewhere instead of selling it removes a unit of sell pressure, reinforcing the price and supporting the peg alongside the Transmuter.

### Key points to remember

- Borrowing expands supply and can push alAsset price below par.

- Transmuter deposits contract supply and earn fixed yield, pulling price back.

- External composability (via Chronicle oracles) lets holders use alAssets elsewhere instead of selling, reducing sell pressure.
