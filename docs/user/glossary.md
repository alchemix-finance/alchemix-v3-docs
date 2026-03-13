---
hide_title: true
title: Glossary
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Glossary" />

Quick definitions for key terms used throughout the Alchemix V3 documentation. Each entry links to the full concept page where applicable.

---

**alAsset**
A synthetic token minted by borrowing against collateral in Alchemix. alUSD mirrors USDC; alETH mirrors ETH. Inside the protocol, 1 alAsset always cancels 1 unit of debt regardless of its external market price.
[→ alAssets](./concepts/alAssets.md)

---

**Alchemist**
The core smart contract that accepts MYT collateral, issues alAsset loans, and manages LTV enforcement, earmarking, and liquidation logic.

---

**Earmarked debt**
A fixed slice of a borrower's outstanding loan that the protocol reserves during a redemption cycle. Earmarked collateral continues earning yield until the moment of settlement. Earmarked debt must be repaid with MYT rather than alAssets.
[→ Redemption Rate](./concepts/redemption-rate.md)

---

**Fundamental oracle**
A price feed that values a yield-bearing token by its underlying redemption value rather than its open-market trading price. Alchemix uses fundamental oracles for low-risk MYT strategies so that DEX price swings cannot trigger liquidations.
[→ Risk Considerations](./safety/risk-considerations.md)

---

**LTV (Loan-to-Value)**
The ratio of outstanding debt to collateral value, expressed as a percentage. Alchemix allows borrowing up to 90% LTV. Liquidation is triggered at 95% LTV.

---

**Mix-Yield Token (MYT)**
An ERC-20 token representing a share of a diversified portfolio of yield strategies managed by the Alchemix DAO. MYT is the collateral accepted by the Alchemist. Its redemption value grows continuously as underlying strategies earn yield.
[→ Mix-Yield Token](./concepts/myt-and-yield.md)

---

**Redemption rate**
An annualized measure of how quickly borrower debt is being paid down through Transmuter redemptions. A higher rate means faster deleveraging. Calculated as annualized Transmuter volume divided by total system debt.
[→ Redemption Rate](./concepts/redemption-rate.md)

---

**Self-repaying loan**
An Alchemix loan whose balance decreases over time without the borrower taking action, as vault yield and scheduled Transmuter redemptions service the debt. Interest rate is 0%; debt only moves downward unless the borrower mints more.
[→ Self-Repaying Loans](./concepts/self-repaying-loans.md)

---

**Temporal leverage**
The additional yield earned because earmarked collateral continues compounding from the moment debt is earmarked until the moment it is settled. This yield would not accrue in a system that converted collateral immediately at earmark time.
[→ Redemption Rate](./concepts/redemption-rate.md)

---

**Transmuter**
A contract that accepts alAsset deposits and, after a fixed term set by the DAO, redeems them 1:1 for an equivalent value of MYT. The Transmuter is the primary mechanism for alAsset supply contraction and peg maintenance.
[→ Transmuter](./concepts/transmuter.md)
