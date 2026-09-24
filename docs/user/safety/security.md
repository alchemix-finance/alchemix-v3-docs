---
sidebar_position: 2
hide_title: true
title: Security & Audits
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Security & Audits" />

Alchemix V3 is designed with security at every layer. The approach combines an external audit suite, real-time automated threat monitoring, independent review of every yield strategy before it is whitelisted, and a bug bounty program.

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
  - Reviewed: February 2026, final report August 2026
  - Focus: MYT access-control logic and the yield-strategy adapter contracts.
  - [View Report](/audits/v3-nethermind.pdf)
- **Nethermind**
  - Reviewed: July–August 2026, final report August 10, 2026
  - Focus: the ERC-4626 adapter used for Fluid USDC, and the Stake DAO WETH strategy (WETH into the Curve ETH+/WETH pool, LP staked in a Stake DAO RewardVault).
  - [View Report](/audits/v3-nethermind-stakedao-fluid.pdf)
- **yAudit (yAuditDAO)**
  - Reviewed: April 2026
  - [Strategies report (April 15–17, 2026)](/audits/v3-strategies-yaudit.pdf)
  - [Strategies follow-up report (April 23–24, 2026)](/audits/v3-strategies-yaudit-followup.pdf)

#### Strategy audit coverage

The table below maps every whitelisted MYT strategy to the audit that reviewed its adapter contract. Whitelisted means the strategy has passed review and is registered on the vault. It does not mean the strategy currently holds an allocation: weights change as the DAO rebalances, and the live composition of each MYT is shown on the [Mixed Yield page](https://alchemix.fi/mixed-yield), under Earn → Variable Rate. Strategies that share an implementation are covered by the same report.

| Strategy (provider)    | Whitelisted on                        | Reviewed by                             |
| :--------------------- | :------------------------------------ | :-------------------------------------- |
| Aave V3                | Mainnet (ETH), Arbitrum (USDC, ETH), Optimism (ETH, USDC) | [Nethermind (Feb 2026)](/audits/v3-nethermind.pdf), [yAudit (Mar 2026)](/audits/v3-yearn.pdf) |
| Euler                  | Mainnet (USDC), Arbitrum (USDC, ETH)  | [Nethermind (Feb 2026)](/audits/v3-nethermind.pdf), [yAudit (Mar 2026)](/audits/v3-yearn.pdf) |
| Fluid                  | Mainnet (USDC), Arbitrum (USDC), Base (USDC) | [Nethermind (Feb 2026)](/audits/v3-nethermind.pdf), [yAudit (Mar 2026)](/audits/v3-yearn.pdf), [Nethermind (Aug 2026)](/audits/v3-nethermind-stakedao-fluid.pdf) |
| Auto Finance (Tokemak) | Mainnet (USDC, ETH)                   | [Nethermind (Feb 2026)](/audits/v3-nethermind.pdf), [yAudit (Mar 2026)](/audits/v3-yearn.pdf) |
| Yearn (yvWETH)         | Mainnet (ETH)                         | [Nethermind (Feb 2026)](/audits/v3-nethermind.pdf), [yAudit (Mar 2026)](/audits/v3-yearn.pdf) |
| Stake DAO (ETH+/WETH)  | Mainnet (ETH)                         | [Nethermind (Aug 2026)](/audits/v3-nethermind-stakedao-fluid.pdf) |
| Lido (wstETH)          | Mainnet (ETH), Optimism (ETH)         | [yAudit strategies (Apr 2026)](/audits/v3-strategies-yaudit.pdf) |
| Ether.fi (weETH)       | Mainnet (ETH)                         | [yAudit strategies (Apr 2026)](/audits/v3-strategies-yaudit.pdf) |
| Frax (sfrxETH)         | Mainnet (ETH)                         | [yAudit strategies (Apr 2026)](/audits/v3-strategies-yaudit.pdf) |
| InfiniFi (siUSD)       | Mainnet (USDC)                        | [yAudit strategies (Apr 2026)](/audits/v3-strategies-yaudit.pdf) |
| Yearn (yvUSD)\*        | Mainnet (USDC)                        | [yAudit strategies (Apr 2026)](/audits/v3-strategies-yaudit.pdf) |
| Morpho Vaults V2 (Steakhouse, Gauntlet, Yearn OG, Re7) | Base (USDC), Optimism (ETH) | Covered by the Fluid audits above (same ERC-4626 adapter) |

\* Yearn's yvUSD held iUSD in the past but no longer does.

{/* This table has to match the adapters that are actually registered on the vaults, and that set changes whenever a strategy is added or retired. Check it against the live vaults before each release. A strategy earns a row here once it has been announced and its audit is published, so a strategy can be whitelisted on-chain for a while before it belongs in this table. Pending additions and the reasoning behind each row are kept in the maintainer notes outside this repo. */}

Every strategy is audited before it is whitelisted, under the continuous program described below.

#### Continuous MYT strategy audits

To ensure the safety of user collateral, Alchemix has established a **long-term partnership with Nethermind**. Every new yield strategy considered for inclusion in a Mix-Yield Token (MYT) must be covered by an independent audit, by Nethermind or yAudit, before being whitelisted. New adapter code gets its own review; a strategy that reuses an adapter already covered by one of the reports above inherits that coverage. This keeps a consistent review standard for adapter code as strategies are added. Exposure limits are set separately through the risk-class caps.

### Internal security practices

Beyond external reviews, Alchemix V3 is protected by a multi-layered internal defense strategy:

- **Extensive Testing Suites:** A large unit test suite alongside Foundry invariant suites, including per-chain multi-strategy invariants that exercise each MYT configuration.
- **Simulation & Fuzzing:** Continuous mainnet-fork testing and fuzzing via Foundry to stress-test the protocol against real-world market volatility and edge cases.
- **Multi-Stage Code Reviews:** Every line of code is reviewed by multiple internal contributors before moving to external audit.

### Real-time threat monitoring

Alchemix uses Hypernative for real-time threat detection across its contracts and dependencies. Alerts feed the Guardian circuit breaker described below, which can pause new deposits and loans. Withdrawals, repayments, liquidations, and Transmuter claims are never blocked by a pause.

This has already mattered in practice. In the March 2026 DolaSavings/sDOLA price-manipulation incident, before the v3 launch, Alchemix had indirect exposure through Curve liquidity pools. Hypernative detected the attacker's preparation phase and treasury funds were withdrawn before the exploit landed, resulting in **zero losses for Alchemix**.

### Bug bounties

We encourage the stress-testing of our code. Our program is hosted on **Immunefi**, the leading platform for DeFi security, and was relaunched for the V3 contracts.

- **Max Bounty:** Up to **$150,000** for critical vulnerabilities.
- **Scope:** All core Alchemist, Transmuter, and MYT contracts.
- **Link:** [View Alchemix on Immunefi](https://immunefi.com/bug-bounty/alchemix-1/information/)

### Governance & protocol changes

Protocol changes go through DAO governance (Snapshot vote, multisig execution). Management actions on the MYT vault additionally use an on-chain submit-and-execute two-step; Alchemist and Transmuter parameter changes are executed directly by the admin multisig.

- **Upgradeability:** The Transmuter and the MYT vaults are not upgradeable; their code is fixed at deployment. The Alchemist runs behind an upgradeable proxy whose ProxyAdmin is held by the v3 admin multisig, acting under DAO governance.
- **Two-Step Confirmation:** Management actions on the MYT vault, such as adding a strategy or raising a cap, must be submitted in one transaction and executed in a second, and the parameters of both must match. This double confirmation guards against mistaken or malformed changes.
- **Timelock Durations:** The MYT vault inherits Morpho Vault V2’s timelock system, but all timelock durations are currently set to zero, so there is no enforced waiting period between submitting and executing a change. Governance can raise these durations on-chain if a delay is ever needed.
- **Guardian Role:** A dedicated Guardian address can pause and unpause deposits and new loans in an emergency. It cannot change protocol parameters, access funds, or affect withdrawals, repayments, or liquidations, so it is a circuit breaker only.


### Learn more

- [Alchemix GitHub](https://github.com/alchemix-finance)
- [Audit archive (v2 era)](https://v2-docs.alchemix.fi/resources/audits-and-reports)
- [FAQ](../faq.md)
