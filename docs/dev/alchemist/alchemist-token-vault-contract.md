---
sidebar_position: 5
---

# AlchemistTokenVault

## Description

A minimal ERC-20 holding contract. Anyone can deposit, but only authorized callers can withdraw. It is used to escrow extra funds that may be used to cover obligations to liquidators and redeemers on the Alchemist. 
Inherits from `AbstractFeeVault` for authorization and helpers.

## Functions

### User Actions

> Functions that can be called by anyone.

<details id="UserActions_deposit">
  <summary>deposit(uint256 amount)</summary>

  - **Description** - Transfers an amount, denominated in the contract token from the caller into this contract.
    - `@param amount` - Quantity of ERC-20 tokens to deposit (in underlying token units).
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - If `amount == 0`.
    - If the caller has insufficient allowance/balance.
  - **Emits**
    - [`Deposited(address indexed from, uint256 amount)`](/dev/alchemist/alchemist-token-vault-contract#Events_Deposited)
</details>

### Authorized Actions

> Functions guarded by the `onlyAuthorized` modifier.

<details id="AuthorizedActions_withdraw">
  <summary>withdraw(address recipient, uint256 amount)</summary>

  - **Description** - Transfers an amount denominated in the contract token to the `recipient` address.
    - `@param recipient` - Destination address to receive tokens.  
    - `@param amount` - Quantity to withdraw denominated in underlying token units.
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - If `recipient == address(0)`.
    - If `amount == 0`.
    - If the contract has insufficient balance.
  - **Emits**
    - [`Withdrawn(address indexed recipient, uint256 amount)`](/dev/alchemist/alchemist-token-vault-contract#Events_Withdrawn)
</details>

### Reading State

> Reads derived, calculated, or internal state.

<details id="ReadingState_totalDeposits">
  <summary>totalDeposits()</summary>

  - **Description** - Returns the vault’s current ERC-20 balance of contract token.
  - **Visibility Specifier** - public (view)  
  - **State Mutability Specifier** - view
</details>

## Events

* <span id="Events_Deposited"><strong><code>Deposited(address indexed from, uint256 amount)</code></strong> - emitted after a successful deposit.</span>  
* <span id="Events_Withdrawn"><strong><code>Withdrawn(address indexed recipient, uint256 amount)</code></strong> - emitted after a successful withdrawal.</span>
