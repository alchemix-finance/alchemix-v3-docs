---
sidebar_position: 2
hide_title: true
title: Security & Audits
---

import securityAudits from '@site/static/img/security-audits-01.png';

<img src={securityAudits} alt="Security & Audits" class="banner-spacing" />

Security is the core pillar of Alchemix V3. Our approach to safeguarding the protocol combines exhaustive initial audits, a permanent partnership for continuous strategy review, and a high-incentive bug bounty program.

## Audit Coverage & Reports

All core smart contracts for Alchemix V3 have undergone rigorous testing and comprehensive audits by top-tier security firms.

### Core Protocol Audits

<!-- TODO links and dates-->

- **aleph_v** — December 15th, 2025
  - Focus: Earmarking and transmutation accounting system including debt decay logic.
  - [View Report](https://hackmd.io/@geistermeister/SkSZiU9ybe)
- **Spearbit/Cantina** — May 15th, 2025
  - Focus: Security review of Alchemix V3 mechanics, specifically protocol fees, liquidation logic, and debt-redemption accounting..
  - [View Report](https://cantina.xyz/portfolio/f638950d-a8ad-4df8-a6ec-8b067e416d7b)
- **Immunefi** — TBD
- **Nethermind** — TBD

### Continuous MYT Strategy Audits

To ensure the safety of user collateral, Alchemix has established a **long-term partnership with Nethermind**. Every new yield strategy considered for inclusion in a Mix-Yield Token (MYT) must undergo a dedicated audit by Nethermind before being whitelisted. This ensures that the risk profile of the MYT remains consistent even as the underlying strategy landscape evolves.

## Internal Security Practices

Beyond external reviews, Alchemix V3 is protected by a multi-layered internal defense strategy:

- **Extensive Testing Suites:** 100% unit test coverage combined with advanced invariant testing (Scribble/Diligent) to ensure protocol properties hold under all conditions.
- **Simulation & Fuzzing:** Continuous mainnet-fork testing and fuzzing via Foundry to stress-test the protocol against real-world market volatility and edge cases.
- **Multi-Stage Code Reviews:** Every line of code is reviewed by multiple internal contributors before moving to external audit.

## Bug Bounties

We believe in a "trust but verify" model and encourage the global security community to stress-test our code. Our program is hosted on **Immunefi**, the leading platform for DeFi security.

- **Max Bounty:** Up to **$300,000** for critical vulnerabilities.
- **Scope:** All core Alchemist, Transmuter, and MYT contracts.
- **Link:** [View Alchemix on Immunefi](https://immunefi.com/bounty/alchemix/)

## Governance & Timelocks

To prevent "flash-upgrades" and ensure community oversight, Alchemix V3 utilizes a robust timelock system.

- **Upgradeability:** Critical contracts are upgradeable only via the DAO.
- **Timelock Delay:** hours/days — This delay provides users and third-party monitors time to exit or react before any code changes are executed.
<!-- TODO date -->
- **Guardian Role:** A dedicated Guardian address can pause deposits and loans in an emergency but **cannot** unpause them or access funds, serving as a circuit breaker during volatility.

---

### Resources

- [GitHub - Alchemix V3 Contracts](https://github.com/alchemix-finance/alchemix-v3-contracts)
- [Audit Archive Summary](https://github.com/alchemix-finance/audits)
- [FAQ](../faq.md)
