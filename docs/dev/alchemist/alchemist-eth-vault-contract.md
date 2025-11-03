---
sidebar_position: 6
---

# AlchemistETHVault

## Description

A minimal ETH/WETH  holding contract. It accepts native ETH or WETH, but always holds the balance as ETH, unwrapping the WETH if need be. Anyone can deposit, but only authorized callers can withdraw. It is used to escrow extra funds that may be used to cover obligations to liquidators and redeemers on the Alchemist. 
Inherits from `AbstractFeeVault` for authorization and helpers.

## Functions

### User Actions

<details id="UserActions_deposit">
  <summary>deposit()</summary>

  - **Description** - Used to deposit native ETH into the vault, using `msg.value` as the amount to deposit.
  - **Visibility Specifier** - external payable  
  - **State Mutability Specifier** - payable  
  - **Reverts**
    - `ZeroAmount()` - when `msg.value == 0`.  
  - **Emits**
    - [`Deposited(address indexed from, uint256 amount)`](/dev/alchemist/alchemist-eth-vault-contract#Events_Deposited)
</details>
<details id="UserActions_depositWETH">
  <summary>depositWETH(uint256 amount)</summary>

  - **Description** - Transfers WETH from the caller, unwraps to ETH, and records the deposit.
    - `@param amount` - Amount of WETH to deposit.
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `ZeroAmount()` - when `amount == 0`.  
    - If the sender has insufficient allowance/balance.  
  - **Emits**
    - [`Deposited(address indexed from, uint256 amount)`](/dev/alchemist/alchemist-eth-vault-contract#Events_Deposited)
</details>
<details id="UserActions_receive">
  <summary>receive()</summary>

  - **Description** - Fallback function to accept ETH transfers.
  - **Visibility Specifier** - external payable  
  - **State Mutability Specifier** - payable  
  - **Reverts** - none
  - **Emits** - none
</details>

### Authorized Actions

> Functions guarded by the `onlyAuthorized` modifier.

<details id="AuthorizedActions_withdraw">
  <summary>withdraw(address recipient, uint256 amount)</summary>

  - **Description** - Transfers native ETH to the `recipient`.
    - `@param recipient` - Address to receive ETH.  
    - `@param amount` - The amount of ETH to send.
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `ZeroAmount()` - when `amount == 0`.  
    - `InsufficientBalance()` - when `amount > address(this).balance`.  
    - `TransferFailed()` - when the ETH transfer fails.  
  - **Emits**
    - [`Withdrawn(address indexed recipient, uint256 amount)`](/dev/alchemist/alchemist-eth-vault-contract#Events_Withdrawn)
</details>

### Internal Operations

<details id="InternalOperations_deposit">
  <summary>_deposit(address depositor, uint256 amount)</summary>

  - **Description** - Internal functions that emits `Deposited(depositor, amount)`.
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts** - none  
  - **Emits**
    - [`Deposited(address indexed from, uint256 amount)`](/dev/alchemist/alchemist-eth-vault-contract#Events_Deposited)
</details>

### Reading State

> Reads derived, calculated, or internal state.

<details id="ReadingState_totalDeposits">
  <summary>totalDeposits()</summary>

  - **Description** - Returns current ETH balance of the vault.  
  - **Visibility Specifier** - public
  - **State Mutability Specifier** - view
</details>

## Events

* <span id="Events_Deposited"><strong><code>Deposited(address indexed from, uint256 amount)</code></strong> - emitted after a successful ETH/WETH deposit.</span>  
* <span id="Events_Withdrawn"><strong><code>Withdrawn(address indexed recipient, uint256 amount)</code></strong> - emitted after a successful authorized ETH withdrawal.</span>
