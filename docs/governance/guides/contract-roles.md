---
sidebar_position: 2
hide_title: true
sidebar_label: Contract Roles
---

import contractRoles from '@site/static/img/contract-roles-01.png';

<img src={contractRoles} alt="Contract Roles" class="banner-spacing" />

This section is meant to describe all roles with access to call private functions in the Alchemix contracts.

### Role 1: Admin (Alchemist and Transmuter)

**Addresses with this role:** 0x…

<!-- TODO -->

An Admin can call all private functions including contract upgrades.

### Role 2: Guardian (Alchemist)

**Addresses with this role:** 0x…

| Function      | What it Does                                                                                                              | Link                        |
| :------------ | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------- |
| pauseDeposits | Prevents users from depositing funds to the Alchemist. The guardian can only pause, not unpause.                          | `[pauseDeposits docs link]` |
| pauseLoans    | Prevents users from minting alAssets from their Alchemist collateral positions. The guardian can only pause, not unpause. | `[pauseLoans docs link]`    |

### Role 3: Owner (Mix Yield Token)

**Addresses with this role:** 0x…

| Function         | What it Does                                                                                             | Link                                             |
| :--------------- | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Appointing Roles | The owner can appoint the Curator and Sentinels and has no direct control over funds or risk parameters. | https://docs.morpho.org/learn/concepts/vault-v2/ |

### Role 3: Curator (Mix Yield Token Access Control)

**Addresses with this role:** 0x…

| Function      | What it Does                                                                                                | Link                                             |
| :------------ | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Managing Risk | The primary risk manager. Sets adapters, caps, fees, and interest rate limits. Most actions are timelocked. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
This role has a “middleman” contract by Alchemix that further restricts what those assigned to this role can do beyond the Morpho default, specifically:

- **Curator** - can do everything except set adapters
- **Curator Proxy** - can only set adapters
  :::

### Role 3: Allocator (Mix Yield Token Access Control)

| Function                                   | What it Does                                                                                        | Link                                             |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Allocating and Deallocating Funds from MYT | The active portfolio manager. Allocates funds to enabled adapters and manages the liquidityAdapter. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
This role has a “middleman” contract by Alchemix that further restricts what those assigned to this role can do beyond the Morpho default, specifically:

- **Allocator** - can do everything including set the liquidityAdapter and the liquidityData
- **Allocator Proxy** - can only allocate and deallocate funds
  :::

### Role 4: Sentinel (Mix Yield Token Access Control)

| Function                                                           | What it Does                                                                                                                            | Link                                             |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| Deallocate Funds, Decrease Caps, Revoke Pending Timelocked Actions | The safety-focused role that can reactively reduce risk by deallocating funds, decreasing caps, or revoking pending timelocked actions. | https://docs.morpho.org/learn/concepts/vault-v2/ |

:::note
This role has a “middleman” contract by Alchemix that further restricts what those assigned to this role can do beyond the Morpho default, specifically, the Sentinel can do everything except revoke pending timelocked actions.
:::
