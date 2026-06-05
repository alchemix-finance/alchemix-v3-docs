---
sidebar_position: 1
hide_title: true
title: ALCX Token
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="ALCX Token" />

ALCX is an ERC-20 token that serves as both the **governance** and **incentive** token for the Alchemix protocol. It was launched without presales or external funding, allocating the majority of supply to the people who contribute to the protocol through work or liquidity provision.

The token does not have a hard cap, but it follows a carefully crafted emissions schedule that gradually reduced issuance over its first three years and now continues with a fixed long-tail emission. This page covers how ALCX is emitted, how it was distributed, and where to find the token contracts.

## Utility

ALCX gives holders governance rights over the direction of the protocol and the use of the treasury. Holders can create and vote on proposals covering vault strategies, MYT allocation and risk limits, protocol fees, collateral and LTV parameters, and protocol upgrades.

As Alchemix transitions to fully on-chain governance, ALCX is staked into [vqALCX](./vqalcx.md) to represent voting power and earn protocol rewards. See [The Future of Onchain Governance](./onchain-governance-infrastructure.md) for the target end state.

## Emissions Schedule

Emissions are the rate at which new ALCX tokens are minted. They are distributed to liquidity providers, the treasury, and contributors to the protocol.

ALCX emissions (slow minting) gradually reduced issuance over three years, continuing with a long tail of fixed weekly emissions. Alchemix is now in the **long-tail period**, where **2,200 ALCX are minted per week** indefinitely — increasing total supply by **114,400 ALCX annually**.

- During the first three years, the staking pools distributed approximately **22,344 ALCX** in their first week, with a **130 ALCX weekly decrease**. Calculations are approximate, as ALCX rewards are computed per block and network conditions, though negligible, may slightly affect the schedule.
- At the three-year point, this represented roughly **4.5% annual inflation** of supply, which has gradually decreased over time as total supply grows against a fixed weekly emission.

:::note No hard cap
ALCX has no protocol-level hard cap. Instead, the fixed long-tail emission means percentage inflation continues to fall as total supply increases.
:::

## Distribution

The token distribution allocates the majority of tokens to those who contribute to the Alchemix protocol through working or liquidity provision. It ensures no one from the development team holds enough tokens to control the protocol, while still rewarding and incentivizing contributors.

An initial supply of **478,612 ALCX** was minted as a pre-mine. Alchemix calculated that there would be approximately **2,393,060 ALCX** in circulation after three years, distributed as follows:

| Allocation | Share | Tokens (after 3 yrs) | Notes |
| --- | --- | --- | --- |
| LP staking & stakers | 80% of emissions | ~64% of supply | Stakers and liquidity providers earn 80% of the ALCX block reward; a portion is redirected to the treasury. |
| Founders, devs & contributors | 20% of emissions | ~16% of supply | An exclusive staking pool for founders, developers, and community contributors. |
| DAO treasury | 15% pre-mine | 358,959 | Pre-mined for the Alchemix DAO. |
| Bug bounties | 5% pre-mine | 119,653 | Reserved for the bug bounty program. |

In short: **15%** pre-mine for the DAO, **5%** for bug bounties, and **80%** of tokens made available through LP staking.

## Contract Addresses

| Network | Address |
| --- | --- |
| **Mainnet** | `0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF` |
| **Optimism** | `0xe974b9b31dbff4369b94a1bab5e228f35ed44125` |
| **Arbitrum** | `0x27b58d226fe8f792730a795764945cf146815aa7` |

:::info
ALCX is minted exclusively on Ethereum Mainnet. The circulating supply on L2s is purely bridge-derived and cannot exceed the Ethereum-side ceiling. See [Risk Considerations](/user/safety/risk-considerations) for details on the bridge model.
:::
