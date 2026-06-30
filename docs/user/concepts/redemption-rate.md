---
sidebar_position: 4
hide_title: true
title: Redemption Rate
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Redemption Rate" />

Redemptions convert earmarked collateral into the asset required to repay debt.

Two ideas matter:

- **Redemption rate** – how fast the system deleverages your position.
  - **Note:** Because debt and collateral are like kind, deleveraging does not lose the user any money (besides the redemption fee). This is different than many systems that charge interest rates that can at times be higher than the yield you are earning.

- **Temporal leverage** – the bonus yield you earn while waiting for an earmarked redemption to settle.

### The redemption rate

The redemption rate tells borrowers what share of total system debt redemptions will repay in one year through the <Term id="transmuter">Transmuter</Term>. A higher rate means loans clear more quickly.

#### Formula

<div style={{minHeight: '282px'}}>

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
  'flowchart': {
    'curve': 'monotoneX',
    'nodeSpacing': 100,
    'rankSpacing': 120
  }
}}%%
flowchart LR
    %% Font Weights
    classDef default font-weight:bold;

    %% Inputs
    A(Transmuter Balance)
    B(Transmutation Time)
    C(Total System Debt)
    D(Annual Redemptions)
    E{{Redemption Rate}}

    %% Connections
    A e1@--> D
    B e2@--> D
    D e3@--> E
    C e4@--> E

    %% Styling
    style E fill:#f5c09a,stroke:#1b1b1d,stroke-width:2px,color:#1b1b1d
    linkStyle 0,1,2,3 stroke:#f5c09a,stroke-width:2px
    e1@{ animation: slow }
    e2@{ animation: slow }
    e3@{ animation: fast }
    e4@{ animation: slow }
```

</div>

##### Understanding the inputs

The redemption rate formula calculates how much of the total system debt can be cleared in one year, based on current conditions.

- **The Inputs:** The formula takes the current **Transmuter Balance** and the **Transmutation Time** (how long it takes for one batch of assets to be exchanged).
- **The Frequency:** Count how many times the Transmuter can cycle its balance in a single year (EG; a 0.25-year duration means 4 cycles per year).
- **The Volume:** Multiplying the balance by the redemption frequency gives the **Projected Annual Redemptions**, the total value the system is on track to repay over the next 12 months.
- **The Rate:** Finally, that projected volume is compared against the **Total System Debt** to determine the percentage rate.

##### Example

The numbers below are illustrative. Actual Transmutation Times are governance-set and vary by asset and chain. If 1000 alETH sit in the Transmuter, the Transmutation Time is three months (0.25 years), and the Alchemist reports 1500 alETH of debt:

<div style={{minHeight: '365px'}}>

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
  'flowchart': {
    'curve': 'monotoneX',
    'nodeSpacing': 100,
    'rankSpacing': 120
  }
}}%%
flowchart LR
    classDef default font-weight:bold;
    %% Nodes
    A(Transmuter Balance<br/><b>1,000 <span style='color:#8a8f99'>alETH</span></b>)
    B(Transmutation Time<br/><b>0.25 <span style='color:#8a8f99'>Years</span></b>)
    C(Total System Debt<br/><b>1,500 <span style='color:#8a8f99'>alETH</span></b>)
    D(<b>Annualized Redemptions</b><br/>1,000 alETH / 0.25 years<br/>= <b>4,000 <span style='color:#8a8f99'>alETH/year</span></b>)
    E{{<b>Redemption Rate</b><br/>4,000 alETH / 1,500 alETH<br/>= <b>~267%</b>}}

    %% Logic
    A e1@--> D
    B e2@--> D
    D e3@==> E
    C e4@--> E

    %% Styling / Ani
    style E fill:#f5c09a,stroke:#1b1b1d,stroke-width:2px,color:#1b1b1d
    linkStyle 0,1,2,3 stroke:#f5c09a,stroke-width:2px
    e1@{ animation: slow }
    e2@{ animation: slow }
    e3@{ animation: fast }
    e4@{ animation: slow }
```

</div>

At that rate, the scheduled redemptions would repay roughly 2.67 times the current debt over a twelve-month horizon, meaning the average loan would clear well before a year has passed, assuming queue size, Transmutation Time, and debt levels remain unchanged.

#### What drives this number

| On-chain variable  | Effect on the rate           | Rationale                                                                                                                                          |
| ------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Queued alAssets    | ↑ Larger queue → higher rate | More alUSD or alETH waiting in the Transmuter funds more repayments. Arbitrage deposits enlarge this queue when the market price drifts below peg. |
| Total system debt  | ↓ More debt → lower rate     | A bigger denominator dilutes the impact of a fixed queue.                                                                                          |
| Transmutation time | ↑ Shorter term → higher rate | Each unit of queued alAsset cycles more often over a year.                                                                                         |

### Temporal leverage

Earmarking in Alchemix v3 differs from typical redemption systems. In many protocols, once debt is queued for repayment the matching collateral is sold immediately and stops earning. In v3, the system only flags (earmarks) the portion of collateral needed, but leaves it earning until a Transmuter position actually matures. The transfer out of the vault happens at that maturity moment, when the claim must be settled.

Throughout that waiting period your full deposit continues to earn yield, giving you an extra return called “temporal leverage”. The longer the gap between earmark and settlement, the more additional yield you collect before the earmarked amount finally goes toward your debt.

<div style={{minHeight: '118px'}}>

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
  'flowchart': { 'curve': 'monotoneX', 'nodeSpacing': 100, 'rankSpacing': 80 }
}}%%
flowchart LR
    classDef default font-weight:bold;

    A(Earmark<br/><b>T₀</b>) e1@--> B(Waiting period<br/><span style='color:#8a8f99'>Collateral still earning yield</span>) e2@--> C{{Settlement<br/><b>T₁</b>}}

    style C fill:#f5c09a,stroke:#1b1b1d,stroke-width:2px,color:#1b1b1d
    linkStyle 0,1 stroke:#f5c09a,stroke-width:2px
    e1@{ animation: slow }
    e2@{ animation: fast }
```

</div>

### Learn more

- [**Transmuter Mechanics**](./transmuter.md) – How earmarking and redemption batches work.

- [**Live Charts**](https://alchemix.fi/) – View past and present data directly in the dapp.
