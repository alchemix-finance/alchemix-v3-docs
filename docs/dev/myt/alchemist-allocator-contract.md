---
sidebar_position: 4
hide_title: true
title: AlchemistAllocator
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="AlchemistAllocator" />

## Description

The AlchemistAllocator is a role-gated front controller for a specific Morpho V2 vault, allowing admins or operators to allocate and deallocate funds across the MYT’s strategy adapters. Supports direct allocations, swap-based allocations via 0x, and unwrap-and-swap deallocations. Allocation calls enforce cap limits (absolute, relative, and risk-based) via the StrategyClassifier, while deallocations do not enforce caps.

**Note:** AlchemistAllocator inherits from PermissionedProxy, which provides its access control system (admin and operator roles) and the selector allowlist used to control which calls can be forwarded. For details on these variables and functions, see PermissionedProxy.

## Variables

<details>
  <summary>vault</summary>

  - **Description** - The immutable reference to the Morpho V2 vault that this allocator manages. All allocation and deallocation actions are performed through this vault.
  - **Type** - `IVaultV2`
  - **Used By**
    - [`allocate(address adapter, uint256 amount)`](/dev/myt/alchemist-allocator-contract#Functions_allocate)
    - [`deallocate(address adapter, uint256 amount)`](/dev/myt/alchemist-allocator-contract#Functions_deallocate)
    - [`allocateWithSwap(address adapter, uint256 amount, bytes memory txData)`](/dev/myt/alchemist-allocator-contract#Functions_allocateWithSwap)
    - [`deallocateWithSwap(address adapter, uint256 amount, bytes memory txData)`](/dev/myt/alchemist-allocator-contract#Functions_deallocateWithSwap)
    - [`deallocateWithUnwrapAndSwap(address adapter, uint256 amount, bytes memory txData, uint256 minIntermediateOut)`](/dev/myt/alchemist-allocator-contract#Functions_deallocateWithUnwrapAndSwap)
    - [`_validateCaps(address adapter, uint256 amount)`](/dev/myt/alchemist-allocator-contract#InternalOperations_validateCaps)
  - **Updated By** - none. Set once on deployment.
</details>
<details>
  <summary>strategyClassifier</summary>

  - **Description** - The immutable reference to the StrategyClassifier contract, which defines risk levels, global risk caps, and per-strategy caps. Used during allocation to enforce risk-based limits on how much capital can flow into a given strategy or risk class.
  - **Type** - `IStrategyClassifier`
  - **Used By**
    - [`_validateCaps(address adapter, uint256 amount)`](/dev/myt/alchemist-allocator-contract#InternalOperations_validateCaps)
  - **Updated By** - none. Set once on deployment.
</details>

## Functions

> All external functions require the caller to be either the admin or an active operator. There are no modifier-based access control sections. The check is performed inline via `require(msg.sender == admin || operators[msg.sender], "PD")`.

<details id="Functions_allocate">
  <summary>allocate(address adapter, uint256 amount)</summary>

  - **Description** - Allocates funds from the Morpho V2 vault into a specific MYT strategy adapter using a direct allocation (no swap).<br/><br/>
    First validates that the allocation would not exceed absolute, relative, or risk-based caps via `_validateCaps`. Then constructs a `VaultAdapterParams` with `ActionType.direct`, encodes it, and calls `vault.allocate(adapter, data, amount)`. The vault will invoke the adapter's `allocate` function under the hood.
    - `@param adapter` - The address of the MYT strategy adapter to allocate funds to.
    - `@param amount` - The amount of vault assets to allocate to the adapter, denominated in the underlying token backing the vault.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the admin or an active operator.
    - [`EffectiveCap(uint256 amount, uint256 limit)`](/dev/myt/alchemist-allocator-contract#Errors_EffectiveCap) — allocation would exceed cap limits.
  - **Emits** - none
</details>
<details id="Functions_deallocate">
  <summary>deallocate(address adapter, uint256 amount)</summary>

  - **Description** - Deallocates funds from a specific MYT strategy adapter back to the Morpho V2 vault using a direct deallocation (no swap). Does not enforce cap validation.<br/><br/>
    Constructs a `VaultAdapterParams` with `ActionType.direct`, encodes it, and calls `vault.deallocate(adapter, data, amount)`. The vault will invoke the adapter's `deallocate` function under the hood.
    - `@param adapter` - The address of the MYT strategy adapter to withdraw funds from.
    - `@param amount` - The amount of vault assets to deallocate from the adapter, denominated in the underlying token backing the vault.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the admin or an active operator.
  - **Emits** - none
</details>
<details id="Functions_allocateWithSwap">
  <summary>allocateWithSwap(address adapter, uint256 amount, bytes memory txData)</summary>

  - **Description** - Allocates funds from the Morpho V2 vault into a specific MYT strategy adapter using a DEX swap to convert between the vault's base asset and the token required by the strategy.<br/><br/>
    First validates caps via `_validateCaps`. Then constructs a `VaultAdapterParams` with `ActionType.swap` and the provided swap calldata, encodes it, and calls `vault.allocate(adapter, data, amount)`.
    - `@param adapter` - The address of the MYT strategy adapter to allocate funds to.
    - `@param amount` - The amount of vault assets to allocate.
    - `@param txData` - Encoded 0x swap calldata for the DEX trade.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the admin or an active operator.
    - [`EffectiveCap(uint256 amount, uint256 limit)`](/dev/myt/alchemist-allocator-contract#Errors_EffectiveCap) — allocation would exceed cap limits.
  - **Emits** - none
</details>
<details id="Functions_deallocateWithSwap">
  <summary>deallocateWithSwap(address adapter, uint256 amount, bytes memory txData)</summary>

  - **Description** - Deallocates funds from a specific MYT strategy adapter back to the vault using a DEX swap. Does not enforce cap validation.<br/><br/>
    Constructs a `VaultAdapterParams` with `ActionType.swap` and the provided swap calldata, encodes it, and calls `vault.deallocate(adapter, data, amount)`.
    - `@param adapter` - The address of the MYT strategy adapter to withdraw funds from.
    - `@param amount` - The amount of vault assets to deallocate.
    - `@param txData` - Encoded 0x swap calldata for the DEX trade.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the admin or an active operator.
  - **Emits** - none
</details>
<details id="Functions_deallocateWithUnwrapAndSwap">
  <summary>deallocateWithUnwrapAndSwap(address adapter, uint256 amount, bytes memory txData, uint256 minIntermediateOut)</summary>

  - **Description** - Deallocates funds from a specific MYT strategy adapter back to the vault by first unwrapping a protocol-specific token, then swapping the intermediate token to the vault's base asset via a DEX. Does not enforce cap validation.<br/><br/>
    Constructs a `VaultAdapterParams` with `ActionType.unwrapAndSwap`, the provided swap calldata, and the minimum intermediate output, encodes it, and calls `vault.deallocate(adapter, data, amount)`.
    - `@param adapter` - The address of the MYT strategy adapter to withdraw funds from.
    - `@param amount` - The amount of vault assets to deallocate.
    - `@param txData` - Encoded 0x swap calldata for the DEX trade.
    - `@param minIntermediateOut` - Minimum acceptable output from the unwrap step before the swap.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the admin or an active operator.
  - **Emits** - none
</details>

### Internal Operations

<details id="InternalOperations_validateCaps">
  <summary>_validateCaps(address adapter, uint256 amount)</summary>

  - **Description** - Internal helper that enforces allocation limits before funds are moved into a strategy. Checks four cap layers in order:<br/><br/>
    1. **Absolute cap** — the maximum quantity of underlying assets that may be allocated to the strategy, set on the vault.<br/>
    2. **Relative cap** — the maximum percentage of the vault's total assets that the strategy can hold, converted to an absolute value.<br/>
    3. **Global risk cap** — the maximum total allocation across all strategies in the same risk class, as defined by the StrategyClassifier.<br/>
    4. **Local risk cap** (operators only) — the per-strategy cap defined by the StrategyClassifier. Only applied when the caller is an operator, not the admin.<br/><br/>
    The effective individual strategy limit is the minimum of the absolute cap and absolute value of the relative cap. For operators, this is further constrained by the local risk cap. The function reverts if the proposed allocation would push the strategy or its risk class over any of these limits.
    - `@param adapter` - The strategy adapter address.
    - `@param amount` - The amount proposed for allocation.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - view
  - **Reverts**
    - [`EffectiveCap(uint256 amount, uint256 limit)`](/dev/myt/alchemist-allocator-contract#Errors_EffectiveCap) — the proposed allocation would exceed the remaining global risk cap or the individual strategy limit.
  - **Emits** - none
</details>

## Errors

- <span id="Errors_EffectiveCap"><strong><code>EffectiveCap(uint256 amount, uint256 limit)</code></strong> - An error which is used to indicate that a proposed allocation exceeds the effective cap limit. `amount` is the requested allocation and `limit` is the maximum allowed.</span>