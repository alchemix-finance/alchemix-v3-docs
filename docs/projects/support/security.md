---
sidebar_position: 2
hide_title: true
title: Security & Audits
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Security & Audits" />

This is a summary of Alchemix security. Full reports, bug bounty details, internal practices, and governance controls are maintained in the [user-facing security page](/user/safety/security).

### Audits

- **Spearbit/Cantina**, May 2025: protocol fees, liquidation logic, and debt-redemption accounting.
- **Immunefi audit competition**, October to November 2025: core Alchemist, Transmuter, and MYT contracts.
- **alpeh_v** (independent researcher), October to November 2025: earmarking and transmutation accounting.
- **Nethermind**, February 2026 with a final report in August 2026: MYT access control and yield-strategy adapters.
- **yAudit**, March and April 2026: core contracts and the strategy adapters.

Every yield strategy is independently audited before it is whitelisted on a Mix-Yield Token. The [strategy audit coverage](/user/safety/security#strategy-audit-coverage) table maps each whitelisted strategy to its report.

### Monitoring and response

- **Hypernative** monitors the contracts and their dependencies in real time. The Guardian role can pause new deposits and loans when suspicious activity is detected.
- A **Guardian** role can pause and unpause deposits and new loans. It cannot change parameters or access funds, and pauses never block withdrawals, repayments, or liquidations.
- Management actions on the MYT vault use a two-step submit-and-execute flow with matching parameters. Timelock durations are currently set to zero.

### Bug bounty

An Immunefi program covers the core Alchemist, Transmuter, and MYT contracts, with a maximum payout of $150,000 for critical vulnerabilities. [View Alchemix on Immunefi](https://immunefi.com/bug-bounty/alchemix-1/information/).

### Oracles

Each alAsset has a dedicated Chronicle Labs price feed, so external protocols can price alUSD and alETH without relying on DEX prices. See [using alAssets across DeFi](/user/concepts/alAssets#using-alassets-across-defi).

[Full audit reports and security practices →](/user/safety/security)
