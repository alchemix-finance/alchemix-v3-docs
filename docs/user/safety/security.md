---
sidebar_position: 2
hide_title: true
title: Security & Audits
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Security & Audits" />

Alchemix V3 is designed with security at every layer. The approach combines an external audit suite, real-time automated threat monitoring, ongoing strategy review by Nethermind, and a bug bounty program.

### Audit coverage & reports

All core smart contracts for Alchemix V3 have undergone testing and audits by external security firms, alongside an in-house security suite (see [Internal security practices](#internal-security-practices)).

#### Core protocol audits

- **Spearbit/Cantina**
  - Reviewed: May 2025
  - Focus: Security review of Alchemix V3 mechanics, specifically protocol fees, liquidation logic, and debt-redemption accounting.
  - [View Report](https://cantina.xyz/portfolio/f638950d-a8ad-4df8-a6ec-8b067e416d7b)
- **Immunefi audit competition**
  - Reviewed: October–November 2025
  - Focus: Time-limited community audit competition covering the core Alchemist, Transmuter, and MYT contracts.
  - [View Report](https://drive.google.com/file/d/18LmIajwn6NOCbxKQJ49MVLyLSKb9gmD1/view)
- **alpeh_v** (independent researcher)
  - Reviewed: October–November 2025
  - Focus: Earmarking and transmutation accounting system including debt decay logic.
  - [View Report](https://hackmd.io/@geistermeister/SkSZiU9ybe)
- **yAudit (yAuditDAO)**
  - Reviewed: March 2026
  - [View Report](/audits/v3-yearn.pdf)

#### Strategy audits

MYT access control and strategy contracts received dedicated reviews:

- **Nethermind**
  - Reviewed: February 2026
  - Focus: MYT access control (`myt-ac`) and strategy (`myt`) repositories.
  - [View Report](/audits/v3-nethermind.pdf)
- **yAudit (yAuditDAO)**
  - Reviewed: April 2026
  - [Strategies report (April 15–17, 2026)](/audits/v3-strategies-yaudit.pdf)
  - [Strategies follow-up report (April 23–24, 2026)](/audits/v3-strategies-yaudit-followup.pdf)

#### Continuous MYT strategy audits

To ensure the safety of user collateral, Alchemix has established a **long-term partnership with Nethermind**. Every new yield strategy considered for inclusion in a Mix-Yield Token (MYT) must undergo a dedicated audit by Nethermind before being whitelisted. This ensures that the risk profile of the MYT remains consistent even as the underlying strategy landscape evolves.

### Internal security practices

Beyond external reviews, Alchemix V3 is protected by a multi-layered internal defense strategy:

- **Extensive Testing Suites:** 100% unit test coverage combined with advanced invariant testing (Scribble/Diligent) to ensure protocol properties hold under all conditions.
- **Simulation & Fuzzing:** Continuous mainnet-fork testing and fuzzing via Foundry to stress-test the protocol against real-world market volatility and edge cases.
- **Multi-Stage Code Reviews:** Every line of code is reviewed by multiple internal contributors before moving to external audit.

### Real-time threat monitoring

Alchemix uses Hypernative for real-time threat detection across its contracts and dependencies, with pre-configured automation that can **auto-pause the protocol** the moment suspicious on-chain activity is detected. This complements the manual Guardian circuit breaker described below.

This has already mattered in practice. In the March 2026 DolaSavings/sDOLA price-manipulation incident, Alchemix had indirect exposure through Curve liquidity pools. Hypernative detected the attacker's preparation phase, automation paused the protocol, and treasury funds were withdrawn before the exploit landed, resulting in **zero losses for Alchemix**.

### Bug bounties

We encourage the stress-testing of our code. Our program is hosted on **Immunefi**, the leading platform for DeFi security, and was relaunched for the V3 contracts.

- **Max Bounty:** Up to **$300,000** for critical vulnerabilities.
- **Scope:** All core Alchemist, Transmuter, and MYT contracts.
- **Link:** [View Alchemix on Immunefi](https://immunefi.com/bug-bounty/alchemix-1/information/)

### Governance & timelocks

To prevent "flash-upgrades" and ensure community oversight, Alchemix V3 uses a timelock system.

- **Upgradeability:** Critical contracts are upgradeable only via the DAO.
- **Timelock Delay:** Set by governance. This delay provides users and third-party monitors time to exit or react before any code changes are executed.
- **Guardian Role:** A dedicated Guardian address can pause deposits and loans in an emergency but **cannot** unpause them or access funds, serving as a circuit breaker during volatility.


### Learn more

- [Alchemix GitHub](https://github.com/alchemix-finance)
- [Audit Archive Summary](https://github.com/alchemix-finance/audits)
- [FAQ](../faq.md)
