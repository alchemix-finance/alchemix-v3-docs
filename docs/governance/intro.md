---
sidebar_position: 1
hide_title: true
sidebar_label: On-chain Governance
---

import governance from '@site/static/img/governance-01.png';

<img src={governance} alt="On-chain Governance" class="banner-spacing" />

:::note Transition Phase

On-chain governance for Alchemix v3 is currently expected shortly after launch. Until that upgrade is complete, all mentions of the DAO will be handled by the Alchemix multisig as existing in the current v2 deployment.

The material below describes the future fully on-chain framework so that contributors, token-holders, and auditors know what is coming. When governance goes live, this notice will be removed and the specification will be updated with final contract addresses, quorum context and voting timelines.
:::

## Why On-chain?

Alchemix v3 is built around three principles that define open finance:

- **Transparency** – every contract interaction is public and verifiable.

- **Decentralization** – no single party should control user funds or protocol parameters.

- **Immutability** – code that holds value should, wherever possible, be fixed and tamper-proof.

A large portion of DeFi still relies on multisignature wallets that can upgrade contracts at will. While a multisig is visible on-chain, it still grants a small group full custody of user assets and exposes the signers to regulatory obligations normally reserved for professional money managers. At the other extreme, a protocol that locks every variable forever can struggle to patch security issues or adapt to upstream changes.

Alchemix designed v3 with onchain governance specifically in mind, under the fundamental philosophy that anything that can be immutable, should be immutable. If it can’t be immutable, it should be done via onchain governance to maximize decentralization. If it can’t be done via onchain governance, then onchain governance can elect an entity to take on the responsibility in a centralized (but transparent onchain) manner.

However, if any of these activities would cause this centralized entity to be classified as a money manager (ie, in an oversimplified definition: is able to make biased decisions around user funds or fully control user access to their funds at any point in the process), then the designation is invalid.

## Layers of Governance

| Layer                                                                    | Control Model                              | Rationale                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| Core vault logic                                                         | Immutable contracts                        | Saftey first. Code that directly custodies deposits never changes. |
| Adjustable parameters (redemption periods, fee rates, collateral limits) | On-chain DAO vote                          | Keeps policy decisions in the hands of token holders.              |
| External Integrations                                                    | DAO-elected executor with a narrow mandate | Allows fast responses while remaining accountable to the DAO.      |

Our guiding rule is straightforward:

If a task can be trustlessly automated, it should be immutable. If it can’t be immutable, it should pass through on-chain governance to maximize decentralization. If it can’t be done through on-chain governance, then that governance can elect an entity to take responsibility in a transparent on-chain manner.

This framework ensures that Alchemix evolves without compromising user control or the protocols alignment with DeFi ideals.
