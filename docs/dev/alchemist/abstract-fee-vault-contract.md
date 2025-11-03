---
sidebar_position: 4
---

# AbstractFeeVault

## Description

The base contract for holding vaults used to fulfill Alchemist obligations in the event that it's own funds are not sufficient

## Variables

<details>
  <summary>token</summary>

  - **Description** - The address of the asset this vault is parameterized for. For ERC-20 vaults this is the token address. For the ETH vault this holds the WETH address.
  - **Type** - `address`
  - **Read By**
    - `token()`
</details>
<details>
  <summary>authorized</summary>

  - **Description** - Allowlist of accounts permitted to withdraw from the vault, such as the Alchemist and owner.
  - **Type** - `mapping(address => bool)`
  - **Used By**
    - [`onlyAuthorized`](/dev/alchemist/abstract-fee-vault-contract#Modifiers_onlyAuthorized)
  - **Updated By**
    - [`setAuthorization(address account, bool status)`](/dev/alchemist/abstract-fee-vault-contract#OwnerActions_setAuthorization)
  - **Read By**
    - `authorized(address)`
</details>

## Modifiers

<details id="Modifiers_onlyAuthorized">
  <summary>onlyAuthorized</summary>

  - **Description** - Restricts function access to addresses enabled in the `authorized` mapping.
  - **Reverts**
    - `Unauthorized()` - when `msg.sender` is not authorized.
</details>

## Functions

### Owner Actions

> Functions guarded by the onlyOwner modifier

<details id="OwnerActions_setAuthorization">
  <summary>setAuthorization(address account, bool status)</summary>

  - **Description** - Enables or disables an address from the withdraw allowlist.
    - `@param account` - Address to authorize or de-authorize.
    - `@param status` - `true` to authorize, `false` to de-authorize.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `ZeroAddress()` - when `account == address(0)`.
  - **Emits**
    - [`AuthorizationUpdated(address indexed account, bool status)`](/dev/alchemist/abstract-fee-vault-contract#Events_AuthorizationUpdated)
</details>

### Internal Operations

<details id="InternalOperations_checkNonZeroAddress">
  <summary>_checkNonZeroAddress(address account)</summary>

  - **Description** - Validates `account != address(0)`.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - pure
  - **Reverts**
    - `ZeroAddress()` - when the address passed is the zero address.
</details>
<details id="InternalOperations_checkNonZeroAmount">
  <summary>_checkNonZeroAmount(uint256 amount)</summary>

  - **Description** - Validates `amount > 0`.
  - **Visibility Specifier** - internal (pure)
  - **State Mutability Specifier** - pure
  - **Reverts**
    - `ZeroAmount()` - when the amount passed is 0.
</details>

### Abstract Functions

> Virtual functions that should be implemented by child contracts

<details id="AbstractFunctions_withdraw">
  <summary>withdraw(address recipient, uint256 amount)</summary>

  - **Description** - Transfer `amount`, denominated in the contracts token, of vault asset to the `recipient`.
    - `@param recipient` - Destination address.
    - `@param amount` - Amount to withdraw denominated in `token` decimals.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
</details>
<details id="AbstractFunctions_totalDeposits">
  <summary>totalDeposits()</summary>

  - **Description** - Returns the total asset balance controlled by the vault.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - view
</details>

## Events

* <span id="Events_Deposited"><strong><code>Deposited(address indexed from, uint256 amount)</code></strong> - emitted when funds are deposited into a child vault.</span>  
* <span id="Events_Withdrawn"><strong><code>Withdrawn(address indexed to, uint256 amount)</code></strong> - emitted when funds are withdrawn by an authorized account.</span>  
* <span id="Events_AuthorizationUpdated"><strong><code>AuthorizationUpdated(address indexed account, bool status)</code></strong> - emitted when an account’s authorization state changes.</span>

## Errors

* <span id="Errors_Unauthorized"><strong><code>Unauthorized()</code></strong> - thrown when a caller attempts an action requiring authorization but is not enabled in the `authorized` mapping.</span>  
* <span id="Errors_ZeroAddress"><strong><code>ZeroAddress()</code></strong> - thrown when a zero address is provided where a valid nonzero address is required.</span>  
* <span id="Errors_ZeroAmount"><strong><code>ZeroAmount()</code></strong> - thrown when a function receives a zero amount where a positive value is required.</span>  
* <span id="Errors_InsufficientBalance"><strong><code>InsufficientBalance()</code></strong> - thrown when the vault does not hold enough assets to fulfill a withdrawal or transfer request.</span>
