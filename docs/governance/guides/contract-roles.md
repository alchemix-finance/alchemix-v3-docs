---
sidebar_position: 2
hide_title: true
title: Contract Roles
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Contract Roles" />

This section is meant to describe all roles with access to call private functions in the Alchemix contracts.

### Who holds the roles

Two multisigs hold roles on each chain. The **v3 admin Safe** (3-of-7) administers the Alchemist, the Transmuter, the Mix-Yield Token vault, and the MYT management contracts. The **DAO treasury multisig** on each chain holds the Guardian and Sentinel circuit-breaker roles and receives protocol fees.

| Chain | v3 admin Safe | DAO treasury multisig (Guardian, Sentinel, fee receiver) |
| :---- | :------------ | :------------------------------------------------------- |
| Ethereum | [0xF56D660138815fC5d7a06cd0E1630225E788293D](https://etherscan.io/address/0xF56D660138815fC5d7a06cd0E1630225E788293D) | [0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9](https://etherscan.io/address/0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9) |
| Optimism | [0x3Dda174aa9E897e18b8E10e6Ce39c2a52398181d](https://optimistic.etherscan.io/address/0x3Dda174aa9E897e18b8E10e6Ce39c2a52398181d) | [0xC224bf25Dcc99236F00843c7D8C4194abE8AA94a](https://optimistic.etherscan.io/address/0xC224bf25Dcc99236F00843c7D8C4194abE8AA94a) |
| Arbitrum | [0xeE1Aa1C3D0622fCeD823c7720cf9E8079558484b](https://arbiscan.io/address/0xeE1Aa1C3D0622fCeD823c7720cf9E8079558484b) | [0x7e108711771DfdB10743F016D46d75A9379cA043](https://arbiscan.io/address/0x7e108711771DfdB10743F016D46d75A9379cA043) |

Contract addresses for each chain are listed in the developer docs: [Ethereum](/dev/contracts/ethereum), [Optimism](/dev/contracts/optimism), [Arbitrum](/dev/contracts/arbitrum).

### Role 1: Admin (Alchemist and Transmuter)

**Addresses with this role:** the v3 admin Safe on each chain (see the table above).

An Admin can call every admin and guardian function on the Alchemist (fees, collateralization ratios, deposit cap, guardians, fee vault, position NFT) and every admin function on the Transmuter (fees, transmutation time, deposit cap, fee receiver). Contract upgrades are handled separately through the proxy admin and are not an Admin function. Admin transfer is a two-step process: the current admin nominates a pending admin, and the nominee must accept.

### Role 2: Guardian (Alchemist)

**Addresses with this role:** the DAO treasury multisig on each chain (see the table above).

| Function      | What it Does                                                                                                              | Link                        |
| :------------ | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------- |
| pauseDeposits | Sets or clears the deposit pause. Withdrawals, repayments, and liquidations are unaffected.                          | [Alchemist contract](/dev/alchemist/alchemist-contract) |
| pauseLoans    | Sets or clears the loan pause, which blocks new minting only. | [Alchemist contract](/dev/alchemist/alchemist-contract) |

### Role 3: Owner (Mix Yield Token)

**Addresses with this role:** the v3 admin Safe on each chain.

| Function         | What it Does                                                                                             | Link                                             |
| :--------------- | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Appointing Roles | The owner can appoint the Curator and Sentinels and has no direct control over funds or risk parameters. | https://docs.morpho.org/learn/concepts/vault-v2/ |

### Role 4: Curator (Mix Yield Token Access Control)

**Addresses with this role:** the [AlchemistCurator](/dev/myt/alchemist-curator-contract) contract on each chain (one per chain, shared by both MYTs). The v3 admin Safe is its admin and operator.

| Function      | What it Does                                                                                                | Link                                             |
| :------------ | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Managing Risk | The primary risk manager. Sets adapters, caps, the force-deallocate penalty, and the performance fee. Strategy additions and removals and cap increases are submitted in one transaction and executed in a second, with matching parameters; cap decreases take effect immediately. Timelock durations are currently set to zero. The vault’s max rate is set through the Allocator contract. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
This role has a “middleman” contract by Alchemix that further restricts what those assigned to this role can do compared to the base open-source configuration, specifically:

- **Admin** – can do everything except add or remove strategy adapters
- **Operator** – can only add or remove strategy adapters
  :::

### Role 5: Allocator (Mix Yield Token Access Control)

**Addresses with this role:** the [AlchemistAllocator](/dev/myt/alchemist-allocator-contract) contract for each MYT (one per vault). The v3 admin Safe is its admin and operator.

| Function                                   | What it Does                                                                                        | Link                                             |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Allocating and Deallocating Funds from MYT | The active portfolio manager. Allocates funds to enabled adapters and manages the liquidityAdapter. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
This role has a “middleman” contract by Alchemix that further restricts what those assigned to this role can do compared to the base open-source configuration, specifically:

- **Admin** – can do everything, including setting the max rate
- **Operator** – can allocate and deallocate funds and set the liquidity adapter
  :::

### Role 6: Sentinel (Mix Yield Token Access Control)

**Addresses with this role:** the DAO treasury multisig on each chain, plus the additional sentinels listed in the [MYT operator cheatsheet](/dev/myt/operator-cheatsheet#addresses-summary).

| Function                                                           | What it Does                                                                                                                            | Link                                             |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Deallocate Funds, Decrease Caps, Revoke Submitted Changes | The safety-focused role that can reactively reduce risk by deallocating funds, decreasing caps, or revoking changes that have been submitted but not yet executed. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
Sentinels are set directly on the MYT vault by the Owner and hold the standard Morpho Vault V2 sentinel powers: deallocate, decrease caps, and revoke submitted changes. There is no Alchemix wrapper contract for this role.
:::
