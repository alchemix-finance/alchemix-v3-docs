---
sidebar_position: 8
hide_title: true
sidebar_label: The Future of Onchain Governance
---

import futureGov from '@site/static/img/future-of-gov-01.png';

<img src={futureGov} alt="The Future of Onchain Governance" class="banner-spacing" />

Alchemix v3 is built around the below principles:

- **Transparency** – every contract interaction is public and verifiable.

- **Decentralization** – no single party should control or have biased power over user funds.

- **Immutability** – code that holds value should, wherever possible, be fixed and tamper-proof.

A large portion of DeFi still relies on multisignature wallets that can upgrade contracts at will. Even in instances of non-upgradeable contracts, these wallets often take on full ownership of having power and bias over user funds. This is typically a better choice than immutable code due to the sheer number of dependencies that DeFi protocols often have, but DeFi can do better.

Alchemix v3 has been designed with onchain governance specifically in mind, under the fundamental philosophy of the design flowchart below:

- Anything that can be immutable, should be immutable
- Anything that cannot be immutable should be managed by Decentralized Autonomous Organization
  - **Decentralized:** controlled by several local offices or authorities rather than one single one.
  - **Autonomous:** having the freedom to govern itself or control its own affairs.
- Anything non-fiduciary duties that cannot be done by the DAO shall allow the DAO to elect a centralized service provider to carry out the duty
- Scenarios where fiduciary duties are required and cannot be done by the DAO represent flawed design and should be eliminated

When this design flow is followed, then protocol users are primarily trusting the EVM (Ethereum Virtual Machine) and the DAO with control over their funds, and centralized entities are only used for onchain responsibilities such as protocol efficiency and an extra layer of security, and offchain responsibilities such as payroll, marketing, and product development.

This approach maximizes what DeFi is good at, without creating scenarios that are worse for users than the traditional finance system.

The onchain governance system for AlchemixDAO is being built to on the Aragon OSX Dao Framework, with a new ALCX staking system that will administer the contracts.
