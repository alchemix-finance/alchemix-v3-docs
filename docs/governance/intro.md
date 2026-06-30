---
sidebar_position: 1
hide_title: true
title: On-chain Governance
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="On-chain Governance" />

:::note Governance today

On-chain governance for Alchemix v3 is being introduced incrementally. Until it is fully live, DAO decisions are executed by the Alchemix multisig, with token holders signaling through Snapshot. See the [governance process](./onchain/governance-process.md) for how proposals work today. Final on-chain contract addresses, quorum context, and voting timelines will be added here as the on-chain system comes online.
:::

## Why on-chain governance

Alchemix v3 is built around transparency, decentralization, and immutability: every interaction is public, no single party should control user funds or protocol parameters, and code that holds value should be fixed wherever possible. [The Future of Onchain Governance](./onchain/onchain-governance-infrastructure.md) explains how these principles shape the protocol, along with the guiding rule behind its design: anything that can be immutable should be immutable; anything that cannot should pass through on-chain governance to maximize decentralization; and where neither is possible, governance can elect a transparent, accountable entity to carry out the task.

## Layers of governance

| Layer                                                                    | Control Model                              | Rationale                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| Core vault logic                                                         | Immutable contracts                        | Safety first. Code that directly custodies deposits never changes. |
| Adjustable parameters (redemption periods, fee rates, collateral limits) | On-chain DAO vote                          | Keeps policy decisions in the hands of token holders.              |
| External Integrations                                                    | DAO-elected executor with a narrow mandate | Allows fast responses while remaining accountable to the DAO.      |

This framework ensures that Alchemix evolves without compromising user control or the protocol’s alignment with DeFi ideals.
