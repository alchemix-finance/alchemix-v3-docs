---
sidebar_position: 2
hide_title: true
title: Contract Roles
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Contract Roles" />

This section is meant to describe all roles with access to call private functions in the Alchemix contracts.

### Who holds the roles

On Ethereum, Optimism, and Arbitrum, two multisigs hold roles. The **v3 admin Safe** (3-of-7) administers the Alchemist, the Transmuter, the Mix-Yield Token vault, and the MYT management contracts. The **DAO treasury multisig** on each of those chains holds the Guardian and Sentinel circuit-breaker roles and receives protocol fees. On Base, the v3 admin Safe holds the admin roles and the Guardian and Sentinel roles, and receives protocol fees. Seven individual contributor wallets also hold the Guardian role on every chain.

| Chain | v3 admin Safe | DAO treasury multisig (Guardian, Sentinel, fee receiver) |
| :---- | :------------ | :------------------------------------------------------- |
| Ethereum | [0xF56D660138815fC5d7a06cd0E1630225E788293D](https://etherscan.io/address/0xF56D660138815fC5d7a06cd0E1630225E788293D) | [0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9](https://etherscan.io/address/0x9e2b6378ee8ad2A4A95Fe481d63CAba8FB0EBBF9) |
| Optimism | [0x3Dda174aa9E897e18b8E10e6Ce39c2a52398181d](https://optimistic.etherscan.io/address/0x3Dda174aa9E897e18b8E10e6Ce39c2a52398181d) | [0xC224bf25Dcc99236F00843c7D8C4194abE8AA94a](https://optimistic.etherscan.io/address/0xC224bf25Dcc99236F00843c7D8C4194abE8AA94a) |
| Arbitrum | [0xeE1Aa1C3D0622fCeD823c7720cf9E8079558484b](https://arbiscan.io/address/0xeE1Aa1C3D0622fCeD823c7720cf9E8079558484b) | [0x7e108711771DfdB10743F016D46d75A9379cA043](https://arbiscan.io/address/0x7e108711771DfdB10743F016D46d75A9379cA043) |
| Base | [0x24E9cbB9DdDa1247ae4b4eEEE3C569A2190ac401](https://basescan.org/address/0x24E9cbB9DdDa1247ae4b4eEEE3C569A2190ac401) | None. The v3 admin Safe is the Guardian, Sentinel, and fee receiver. |

Contract addresses for each chain are listed in the developer docs: [Ethereum](/dev/contracts/ethereum), [Optimism](/dev/contracts/optimism), [Arbitrum](/dev/contracts/arbitrum), [Base](/dev/contracts/base).

### Role 1: Admin (Alchemist and Transmuter)

**Addresses with this role:** the v3 admin Safe on each chain (see the table above).

An Admin can call every admin and guardian function on the Alchemist (fees, collateralization ratios, deposit cap, guardians, fee vault, position NFT) and every admin function on the Transmuter (fees, transmutation time, deposit cap, fee receiver). Contract upgrades are handled separately through the proxy admin and are not an Admin function. Admin transfer is a two-step process: the current admin nominates a pending admin, and the nominee must accept.

### Role 2: Guardian (Alchemist)

**Addresses with this role:** the DAO treasury multisig on Ethereum, Optimism, and Arbitrum, the v3 admin Safe on Base (see the table above), and seven individual contributor wallets on every chain. Each Guardian acts alone, with no multisig approval, and can both set and clear either pause.

The seven individual Guardian wallets are the same on Ethereum, Optimism, Arbitrum, and Base:

- `0xf1C5fBf9612b572bc4e2F8c046088aa68f6b4304`
- `0xFfaA3CdA4f169d33291Dd9ddbea8578d1398430E`
- `0xf872703F1C8f93fA186869Bac83BAC5A0c87C3c8`
- `0xf0daAa720286868c8C7B235f450429c197CD579B`
- `0xD5D6433B4D3e7507623a1A549aCeDF55e07cAd14`
- `0x5788F90196954A272347aEe78c3b3F86F548D0a9`
- `0x954b066e4bDD3A2d8F15dd6CF8110A002d0853e6`

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

**Addresses with this role:** the [AlchemistCurator](/dev/myt/alchemist-curator-contract) contract on each chain (one per chain, shared by the MYTs on that chain). The v3 admin Safe is its admin and operator.

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

**Addresses with this role:** the DAO treasury multisig on Ethereum, Optimism, and Arbitrum, and the v3 admin Safe on Base. The Ethereum ETH MYT vault has two more Sentinels, both individual wallets: `0xc2A9f37e725428aF9f67AD8Ad4C9d79B47cC0cde` and `0xD5D6433B4D3e7507623a1A549aCeDF55e07cAd14`.

| Function                                                           | What it Does                                                                                                                            | Link                                             |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Deallocate Funds, Decrease Caps, Revoke Submitted Changes | The safety-focused role that can reactively reduce risk by deallocating funds, decreasing caps, or revoking changes that have been submitted but not yet executed. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
Sentinels are set directly on the MYT vault by the Owner and hold the standard Morpho Vault V2 sentinel powers: deallocate, decrease caps, and revoke submitted changes. There is no Alchemix wrapper contract for this role.
:::
