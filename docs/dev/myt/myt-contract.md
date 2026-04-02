---
sidebar_position: 3
hide_title: true
title: MYTStrategy
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="MYTStrategy" />

The Alchemix V3 protocol introduces a modular system for yield generation centered around Morpho V2 Vaults. The core of this system
is a set of strategies that function as adapters for the Morpho Vault, managing user-deposited assets such as WETH and USDC. These
strategies are designed to allocate capital across a diverse range of third-party, yield-bearing DeFi protocols. Users deposit their assets
into the Morpho Vault and receive Mix-Yield Tokens (MYT), which represent a share of the vault’s underlying assets. The value of an MYT
share is designed to increase over time as the strategies accrue yield. The allocation of capital is managed by an Alchemix admin or
operator via the AlchemistAllocator contract to optimize returns and manage risk.

This MYTStrategy contract is the base contract from which all individual strategy adapters are derived. Each adapter defines one of the many strategies used by the same MYT.
This base contract defines the functions that allow allocation and deallocation into the strategy, in addition to claiming and withdrawing, and other general operations on the strategy.
For more specific operations tailored to individual strategies, see the contract specs in /strategies section of the docs. (coming soon)

## Variables

### StrategyParams

> A struct defining common properties between MYT strategies that must be set on initialization of the strategy contract. Params can be read by calling the `params()` function, which will return a tuple containing the value for each in the order they are listed below.

<details>
  <summary>owner</summary>

- **Description** - The owner of this MYT contract instance.
- **Type** - address
- **Used By** - none. Set once on contract deployment. NOTE: the param that is used to set this on deployment is also used to set the owner of the contract, which is used to restrict access to certain functions. This property param.owner shares that value, but not it's function.
- **Updated By** - none. Set once on contract deployment.
</details>
<details>
  <summary>name</summary>

- **Description** - The name of the MYT strategy
- **Type** - string
- **Used By** - none. This is just informative metadata
- **Updated By** - none. Set once on contract deployment.
</details>
<details>
  <summary>protocol</summary>

- **Description** - The name of the protocol running the underlying strategy.
- **Type** - string
- **Used By** - none. This is just informative metadata
- **Updated By** - none. Set once on contract deployment.
</details>
<details id="Variables_riskClass">
  <summary>riskClass</summary>

- **Description** - The risk classification for the underlying strategy. Used
- **Type** - RiskClass (an enum with possible values of LOW, MEDIUM, or HIGH)
- **Used By** - none. This is informative metadata.
- **Updated By**
  - `setRiskClass(RiskClass newClass)`
- **Notified By** - [`RiskClassUpdated()`](/dev/myt/myt-contract#Events_RiskClassUpdated)
</details>
<details>
  <summary>cap</summary>

- **Description** - TODO unused
- **Type** - uint256
- **Used By** - none. TODO
- **Updated By** - none TODO
- **Read By** - `getCap()`
</details>
<details>
  <summary>globalCap</summary>

- **Description** - TODO unused
- **Type** - uint256
- **Used By** - none. TODO
- **Updated By** - none TODO
- **Read By** - [`getGlobalCap()`](/dev/myt/myt-contract#ReadingState_getGlobalCap)
</details>
<details>
  <summary>estimatedYield</summary>

- **Description** - The estimated yield of the strategy. TODO what is this denominated in?
- **Type** - uint256
- **Used By** - none. This is informative metadata.
- **Updated By** - none. This is informative metatdata. TODO - confirm
- **Read By** - [`getEstimatedYield()`](/dev/myt/myt-contract#ReadingState_getEstimatedYield)
</details>
<details>
  <summary>additionalIncentives</summary>

- **Description** - A true/false value indicating whether or not there are additional incentives on top of the base functioning of the strategy
- **Type** - bool
- **Used By**
  - None in the base contract. May be consumed by derived strategy implementations.
- **Updated By**
  - `setAdditionalIncentives(bool newValue)`
</details>
<details>
  <summary>slippageBPS</summary>

- **Description** - The slippage tolerance for this strategy expressed in BPS. Used during swaps and adjusted withdrawals to account for price impact, protocol fees, and rounding. Validated on deployment to be below 5000 (50%).
- **Type** - uint256
- **Used By**
  - Strategy-specific derived implementations (swap and withdrawal logic)
- **Updated By**
  - [`setSlippageBPS(uint256 newSlippageBPS)`](/dev/myt/myt-contract#OwnerActions_setSlippageBPS)
- **Read By** - via `params()` tuple
- **Notified By** - [`SlippageBPSUpdated(uint256 newSlippageBPS)`](/dev/myt/myt-contract#Events_SlippageBPSUpdated)
</details>

### Public State

> State that is available and can be read from outside of the contract.

#### Constants

<details>
  <summary>SECONDS_PER_YEAR</summary>

- **Description** - Set to 365 days. Used in yield calculations.
- **Type** - uint256
- **Used By**
  - None in the base contract. Available for use by derived strategy implementations.
- **Updated By** - none. Contant variable
- **Read By** - `SECONDS_PER_YEAR()` - will return a uint256 value representing seconds
</details>
<details>
  <summary>FIXED_POINT_SCALAR</summary>

- **Description** - A multiplier that is used to be able to do fixed point math, since solidity does not natively handle decimals. Like ERC20 tokens which typically use 18 decimals, it expresses 1 as 1e18. Anything less is a fraction of 1.
- **Type** - uint256
- **Used By**
  - None in the base contract. Available for use by derived strategy implementations.
- **Updated By** - none. Constant varible.
- **Read By** - `FIXED_POINT_SCALAR()`
</details>
<details>
  <summary>FORCE_DEALLOCATE_SELECTOR</summary>

- **Description** - A bytes4 constant set to 0xe4d38cd8. When passed as the `selector` param to [`deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_deallocate), swap-based and unwrap-based withdrawal routes are bypassed, allowing only the direct withdrawal path.
- **Type** - bytes4
- **Used By**
  - [`deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_deallocate)
- **Updated By** - none. Constant variable.
- **Read By** - `FORCE_DEALLOCATE_SELECTOR()`
</details>

#### Immutable State

> State that is set once on contract deployment

<details>
  <summary>MYT</summary>

- **Description** - A Morpho VaultV2 contract which manages and allocates to individual strategies through adapters such as this one.
- **Type** - IVaultV2
- **Used By**
  - [Vault Actions](/dev/myt/myt-contract#VaultActions)
  - [`withdrawToVault()`](/dev/myt/myt-contract#OwnerActions_withdrawToVault)
  - [`allocation()`](/dev/myt/myt-contract#ReadingState_allocation)
  - [`_isProtectedToken(address token)`](/dev/myt/myt-contract#InternalOperations_isProtectedToken)
- **Updated By** - none
- **Read By** - `MYT()` - will return the address of the Vault2 contract, since MYT is a contract type.
</details>
<details id="Variables_adapterId">
  <summary>adapterId</summary>

- **Description** - A hash of the string "this" and this contract's address, serving as a unique id for reporting on allocations/deallocations to the strategy.
- **Type** - bytes32
- **Used By**
  - [`allocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_allocate)
  - [`deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_deallocate)
  - [allocation()](/dev/myt/myt-contract#ReadingState_allocation)
- **Updated By** - none
- **Read By** - `ids()` - returns an array of size 1, where the first index contains this id.
</details>

### Updateable State

<details>
  <summary>params</summary>

- **Description** - The list of params passed at deployment-time describing the strategy. Some can be edited. For more information see the StrategyParams type above.
- **Type** - StrategyParams
- **Used By**
  - [`getEstimatedYield()`](/dev/myt/myt-contract#ReadingState_getEstimatedYield)
  - [`getIdData()`](/dev/myt/myt-contract#ReadingState_getIdData)
  - [`getCap()`](/dev/myt/myt-contract#ReadingState_getCap)
  - [`getGlobalCap()`](/dev/myt/myt-contract#ReadingState_getGlobalCap)
- **Updated By**
  - `setRiskClass()`
  - `setAdditionalIncentives()`
  - [`setSlippageBPS(uint256 newSlippageBPS)`](/dev/myt/myt-contract#OwnerActions_setSlippageBPS)
- **Read By**
  - `params()` - returns a tuple containing all StrategyParam property values in the order listed in the Struct definition above.
</details>
<details>
  <summary>killSwitch</summary>

- **Description** - A true/false toggle that acts as a circuit breaker. When enabled, allocations revert and reward claims are blocked. Deallocations are not affected. Nothing is auto-unstaked or withdrawn
- **Type** - bool
- **Used By**
  - [`allocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_allocate)
  - [`claimRewards(address token, bytes memory quote, uint256 minAmountOut)`](/dev/myt/myt-contract#UserActions_claimRewards)
- **Updated By**
  - `setKillSwitch(bool value)`
- **Read By** - `killSwitch()`
</details>
<details>
  <summary>whitelistedAllocators</summary>

- **Description** - A mapping of addresses which are allowed to call functions that move funds.
- **Type** - `mapping(address => bool)`
- **Used By**
  - [`claimWithdrawalQueue(uint256 positionId)`](/dev/myt/myt-contract#UserActions_claimWithdrawalQueue)
- **Updated By**
  - `setWhitelistedAllocator(address to, bool val)`
- **Read By** 
  - `whitelistedAllocators(address)` - returns a true/false value indicating whether or not the address passed is a whitelisted allocator
</details>
<details>
  <summary>allowanceHolder</summary>

- **Description** - The address of the 0x AllowanceHolder contract. The strategy approves this contract once, so it can handle swaps for whichever DEX routes swap through. Used during allocations and deallocations when the strategy needs to convert between the vault's base asset and the token required by the underlying protocol.
- **Type** - address
- **Used By**
  - [`dexSwap(address to, address from, uint256 amount, uint256 minAmountOut, bytes memory callData)`](/dev/myt/myt-contract#InternalOperations_dexSwap)
- **Updated By**
  - [`setAllowanceHolder(address _new)`](/dev/myt/myt-contract#OwnerActions_setAllowanceHolder)
- **Read By** - `allowanceHolder()`
</details>

## Functions

### User Actions

> Actions that are performed by any external callers. In some cases this may be necessitate elevated permissions or restrict user access, but these are one-offs rather than patterns of actors decsribed by traditional only\_ modifiers.

<details id="UserActions_claimWithdrawalQueue">
  <summary>claimWithdrawalQueue(uint256 positionId)</summary>

- **Description** - Handles claiming withdrawals from strategies that implement a withdrawal queue system.<br/><br/>
  First checks that the caller is a whitelistedAllocator, then delegates to the internal function `_claimWithdrawalQueue()` which is overridden and defined in derived strategy implementations.
  - `@param positionId` - The ID of the position to claim for from the underlying protocol.
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 ret` - The amount of assets claimed from the withdrawal queue (returned by the strategy-specific implementation).
- **Emits** - none
- **Reverts** - With `"PD"` if `msg.sender` is not whitelisted
</details>

### Owner Actions

> Actions guarded by the onlyOwner modifier, which restricts access to the owner set at deployment time

<details id="OwnerActions_claimRewards">
  <summary>claimRewards(address token, bytes memory quote, uint256 minAmountOut)</summary>

- **Description** - Claims pending reward tokens from the underlying strategy's protocol and converts them to the vault's base asset.<br/><br/>
  First verifies that the strategy is not in emergency mode, then delegates to the internal `_claimRewards()` implementation, which must be overridden in derived contracts to define protocol-specific claiming and conversion logic.
  - `@param token` - the address of the reward token to claim
  - `@param quote` - encoded swap calldata for converting the reward token to the vault's base asset
  - `@param minAmountOut` - minimum acceptable output from the conversion
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256` - The amount of reward tokens claimed, as defined by the derived implementation.
- **Emits** - none
- **Reverts** - With `"emergency"` if `killSwitch == true`
</details>
<details id="OwnerActions_setAllowanceHolder">
  <summary>setAllowanceHolder(address _new)</summary>

- **Description** - Updates the 0x AllowanceHolder contract address used for DEX swap approvals.
  - `@param _new` - the new AllowanceHolder contract address
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - _new == zero address
</details>
<details id="OwnerActions_setSlippageBPS">
  <summary>setSlippageBPS(uint256 newSlippageBPS)</summary>

- **Description** - Updates the slippage tolerance for this strategy, expressed in BPS.
  - `@param newSlippageBPS` - the new slippage value. Must be below 9999.
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`SlippageBPSUpdated(uint256 newSlippageBPS)`](/dev/myt/myt-contract#Events_SlippageBPSUpdated)
- **Reverts** - newSlippageBPS >= 9999 (99.9%)
</details>
<details id="OwnerActions_withdrawToVault">
  <summary>withdrawToVault()</summary>

- **Description** - Transfers any leftover base asset balance held by this strategy contract back to the vault. Useful for sweeping idle funds that aren't actively allocated to the underlying protocol.
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256` - the amount of assets transferred back to the vault
- **Emits**
  - [`WithdrawToVault(uint256 amount)`](/dev/myt/myt-contract#Events_WithdrawToVault)
- **Reverts** - none
</details>
<details id="OwnerActions_rescueTokens">
  <summary>rescueTokens(address token, address to, uint256 amount)</summary>

- **Description** - Rescues arbitrary ERC20 tokens that were sent to this contract by mistake. Cannot be used to withdraw protected tokens (such as the vault's base asset). Protected tokens are defined by the internal `_isProtectedToken()` function, which can be extended by derived contracts to include protocol-specific tokens like receipt tokens or staking tokens.
  - `@param token` - the address of the token to rescue
  - `@param to` - the address to send the rescued tokens to
  - `@param amount` - the amount of tokens to rescue
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`TokensRescued(address token, address to, uint256 amount)`](/dev/myt/myt-contract#Events_TokensRescued)
- **Reverts** - to == zero address - token is a protected token - amount exceeds the contract's balance of that token
</details>
<details id="OwnerActions_setRiskClass">
  <summary>setRiskClass(RiskClass newClass)</summary>

- **Description** - Updates the [`params.riskClass`](/dev/myt/myt-contract#Variables_riskClass) to recategorize the strategy under a new risk class
  - `@param newClass` - new risk category for the strategy (LOW, MEDIUM, HIGH)
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Emits**
  - [`RiskClassUpdated(RiskClass newClass)`](/dev/myt/myt-contract#Events_RiskClassUpdated)
- **Reverts** - none
</details>
<details id="OwnerActions_setAdditionalIncentives">
  <summary>setAdditionalIncentives(bool newValue)</summary>

- **Description** - Enables or disables tracking of additional incentive tokens earned by the strategy in yield calculations.
  - `@param newValue` - true or false value to enable or disable
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Emits**
  - [`IncentivesUpdated(bool newValue)`](/dev/myt/myt-contract#Events_IncentivesUpdated)
- **Reverts** - none
</details>
<details id="OwnerActions_setWhitelistedAllocator">
  <summary>setWhitelistedAllocator(address to, bool val)</summary>

- **Description** - Sets or unsets an address as a whitelisted allocator authorized to call various functions listed under [`UserActions`](/dev/myt/myt-contract#user-actions)
  - `@param to` — address to set or unset as a whitelisted allocator
  - `@param val` — true or false value to set or unset as a whitelisted alloactor
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Emits** - none
- **Reverts**
- if `to` is the zero address
</details>
<details id="OwnerActions_setKillSwitch">
  <summary>setKillSwitch(bool val)</summary>

- **Description** - Toggles the emergency stop (`killSwitch`) for this strategy. When enabled, allocations and reward claims are halted to prevent further activity.
  - `@param val` - true to activate emergency mode, false to resume normal operation
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Modifiers** - [`onlyOwner`](/dev/myt/myt-contract#AccessControl_onlyOwner)
- **Emits**
  - [`Emergency(bool val)`](/dev/myt/myt-contract#Events_Emergency)
- **Reverts** - none
</details>

### Vault Actions

> Functions guarded by the onlyVault modifier, which restricts access to the vault managed by the MYT contract (Referenced by the MYT variable, not referring to this MYTStrategyContract)

<details id="VaultActions_allocate">
  <summary>allocate(bytes memory data, uint256 assets, bytes4 selector, address sender)</summary>

- **Description** - Allocates `assets` from the vault into the underlying strategy, computes the delta between the new allocation and previous allocation, and reports the change.<br/><br/>
  Decodes `data` as a `VaultAdapterParams` struct to determine the action type. If the action is `direct`, calls the single-param `_allocate(assets)`. If the action is `swap`, calls `_allocate(assets, swapCalldata)` with the encoded swap data. Both `_allocate` variants are overridden and defined in derived strategy implementations. Reverts if `killSwitch` is enabled or if `assets` is 0.
  - `@param data` - ABI-encoded `VaultAdapterParams` struct containing the action type and optional swap parameters.
  - `@param assets` - the amount of tokens the vault is requesting to allocate to the strategy.
  - `@param selector` - Unused, but in place to match the Morpho V2 spec. May be used in the future.
  - `@param sender` - Unused, but in place to match the Morpho V2 spec. May be used in the future.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - (bytes32[] memory strategyIds, int256 change) - A tuple where the first value is an array of size 1 containing the [`adapterId`](/dev/myt/myt-contract#Variables_adapterId), and the second value is a signed 256 bit integer containing the difference between the new allocation and the old allocation
- **Emits**
  - [`Allocate(uint256 amountAllocated, address this)`](/dev/myt/myt-contract#Events_Allocate)
- **Reverts**
  - [`StrategyAllocationPaused(address)`](/dev/myt/myt-contract#Errors_StrategyAllocationPaused) — killSwitch is enabled
  - [`InvalidAmount(uint256, uint256)`](/dev/myt/myt-contract#Errors_InvalidAmount) — assets is 0
  - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — unrecognized action type
</details>
<details id="VaultActions_deallocate">
  <summary>deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)</summary>

- **Description** - Deallocates `assets` from the underlying strategy back to the vault, computes the delta between the new allocation and previous allocation, and reports the change.<br/><br/>
  Decodes `data` as a `VaultAdapterParams` struct to determine the action type. If `direct`, calls `_deallocate(assets)`. If `swap` (and the selector is not `FORCE_DEALLOCATE_SELECTOR`), calls `_deallocate(assets, swapCalldata)`. If `unwrapAndSwap` (and the selector is not `FORCE_DEALLOCATE_SELECTOR`), calls `_deallocate(assets, swapCalldata, minIntermediateOut)`. All `_deallocate` variants are overridden and defined in derived strategy implementations. Does not check `killSwitch`. Reverts if `assets` is 0.
  - `@param data` - ABI-encoded `VaultAdapterParams` struct containing the action type and optional swap parameters.
  - `@param assets` - the amount of tokens the vault is requesting to deallocate from the strategy.
  - `@param selector` - A bytes4 value passed by the vault. When equal to [`FORCE_DEALLOCATE_SELECTOR`](/dev/myt/myt-contract#Constants_FORCE_DEALLOCATE_SELECTOR), swap-based and unwrap-based routes are bypassed.
  - `@param sender` - Unused, but in place to match the Morpho V2 spec. May be used in the future.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - (bytes32[] memory strategyIds, int256 change) - A tuple where the first value is an array of size 1 containing the [`adapterId`](/dev/myt/myt-contract#Variables_adapterId), and the second value is a signed 256 bit integer containing the difference between the new allocation and the old allocation
- **Emits**
  - [`Deallocate(uint256 amountDeallocated, address this)`](/dev/myt/myt-contract#Events_Deallocate)
- **Reverts**
  - [`InvalidAmount(uint256, uint256)`](/dev/myt/myt-contract#Errors_InvalidAmount) — assets is 0
  - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — unrecognized action type, or swap/unwrapAndSwap used with FORCE_DEALLOCATE_SELECTOR
  - With `"inconsistent totalValue"` if `_totalValue()` after deallocation is less than `assets`
</details>

### Internal Operations

<details id="InternalOperations_allocate">
  <summary>_allocate(uint256 amount)</summary>

- **Description** - Virtual function defining internal logic for how to allocate to a strategy. The base implementation reverts with `ActionNotSupported()`. Must be overridden by derived contracts that support direct allocation.
  - `@param amount` - The amount of assets to allocate into the underlying protocol.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 depositReturn` - The amount of assets successfully allocated by the protocol.
- **Emits** - none
- **Reverts**
  - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — base implementation always reverts. Derived contracts override with protocol-specific logic.
</details>
<details id="InternalOperations_allocateSwap">
  <summary>_allocate(uint256 amount, bytes memory callData)</summary>

- **Description** - Virtual function defining internal logic for how to allocate to a strategy using a DEX swap. The base implementation reverts with `ActionNotSupported()`. Must be overridden by derived contracts that support swap-based allocation.
  - `@param amount` - The amount of assets to allocate into the underlying protocol.
  - `@param callData` - Encoded swap calldata for the DEX trade.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 depositReturn` - The amount of assets successfully allocated by the protocol.
- **Emits** - none
- **Reverts** - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — base implementation always reverts. Derived contracts override with protocol-specific logic.
</details>
<details id="InternalOperations_deallocate">
  <summary>_deallocate(uint256 amount)</summary>

- **Description** - Virtual function defining internal logic for how to deallocate from a strategy. The base implementation reverts with `ActionNotSupported()`. Must be overridden by derived contracts that support direct deallocation.
  - `@param amount` - The amount of assets to deallocate or withdraw from the underlying protocol.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 withdrawReturn` - The amount of assets successfully withdrawn from the protocol.
- **Emits** - none
- **Reverts**
  - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — base implementation always reverts. Derived contracts override with protocol-specific logic.
</details>
<details id="InternalOperations_deallocateSwap">
  <summary>_deallocate(uint256 amount, bytes memory callData)</summary>

- **Description** - Virtual function defining internal logic for how to deallocate from a strategy using a DEX swap. The base implementation reverts with `ActionNotSupported()`. Must be overridden by derived contracts that support swap-based deallocation.
  - `@param amount` - The amount of assets to deallocate from the underlying protocol.
  - `@param callData` - Encoded swap calldata for the DEX trade.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 withdrawReturn` - The amount of assets successfully withdrawn from the protocol.
- **Emits** - none
- **Reverts** - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — base implementation always reverts. Derived contracts override with protocol-specific logic.
</details>
<details id="InternalOperations_deallocateUnwrapAndSwap">
  <summary>_deallocate(uint256 amount, bytes memory callData, uint256 minIntermediateOutAmount)</summary>

- **Description** - Virtual function defining internal logic for how to deallocate from a strategy by first unwrapping a protocol-specific token, then swapping the intermediate token to the vault's base asset via a DEX. The base implementation reverts with `ActionNotSupported()`. Must be overridden by derived contracts that support this two-step withdrawal path.
  - `@param amount` - The amount of the vault's base asset expected to be returned.
  - `@param callData` - Encoded swap calldata for the DEX trade.
  - `@param minIntermediateOutAmount` - Minimum acceptable output from the unwrap step before the swap.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 withdrawReturn` - The amount of assets successfully withdrawn from the protocol.
- **Emits** - none
- **Reverts** - [`ActionNotSupported()`](/dev/myt/myt-contract#Errors_ActionNotSupported) — base implementation always reverts. Derived contracts override with protocol-specific logic.
</details>
<details id="InternalOperations_dexSwap">
  <summary>dexSwap(address to, address from, uint256 amount, uint256 minAmountOut, bytes memory callData)</summary>

- **Description** - Internal helper that executes a token swap through the 0x AllowanceHolder. Approves the AllowanceHolder to spend the `from` token, executes the swap via the provided calldata, then revokes the approval. Verifies that the output meets the minimum threshold.
  - `@param to` - the address of the token being received
  - `@param from` - the address of the token being sold
  - `@param amount` - the amount of `from` token to approve for the swap
  - `@param minAmountOut` - minimum acceptable amount of `to` token to receive
  - `@param callData` - encoded calldata for the 0x swap
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256` - the amount of `to` token received from the swap
- **Emits** - none
- **Reverts**
  - [`CounterfeitSettler(address)`](/dev/myt/myt-contract#Errors_CounterfeitSettler) — the swap call to AllowanceHolder failed
  - [`InvalidAmount(uint256, uint256)`](/dev/myt/myt-contract#Errors_InvalidAmount) — amount received is less than `minAmountOut`
</details>
<details id="InternalOperations_ensureIdleBalance">
  <summary>_ensureIdleBalance(address asset, uint256 amount)</summary>

- **Description** - Internal helper that checks if this strategy contract holds at least `amount` of the given `asset` as idle balance. Used to verify funds are available before transfers.
  - `@param asset` - the token address to check the balance of
  - `@param amount` - the minimum required balance
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - none
- **Emits** - none
- **Reverts** - [`InsufficientBalance(uint256, uint256)`](/dev/myt/myt-contract#Errors_InsufficientBalance) — balance is less than `amount`
</details>
<details id="InternalOperations_isProtectedToken">
  <summary>_isProtectedToken(address token)</summary>

- **Description** - Virtual function that returns whether a token is protected from being rescued via `rescueTokens()`. In the base contract, the vault's base asset is protected. Derived contracts can override this to add protocol-specific tokens like receipt tokens, aTokens, or staking tokens.
  - `@param token` - the token address to check
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `bool` - true if the token is protected
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_totalValue">
  <summary>_totalValue()</summary>

- **Description** - Virtual function that returns the total underlying value of this strategy's position, denominated in the vault's base asset (e.g. USDC or WETH). Returns 0 by default. Must be overridden by derived contracts.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `uint256` - total underlying value of the strategy
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_idleAssets">
  <summary>_idleAssets()</summary>

- **Description** - Virtual function that returns the amount of idle (unallocated) assets held by this strategy contract. Returns 0 by default. Must be overridden by derived contracts.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `uint256` - amount of idle assets
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_previewAdjustedWithdraw">
  <summary>_previewAdjustedWithdraw(uint256 amount)</summary>

- **Description** - Virtual function that estimates the correct amount that can be fully withdrawn from the strategy, accounting for losses due to slippage, protocol fees, and rounding differences. Returns 0 by default. Must be overridden by derived contracts.
  - `@param amount` - the desired withdrawal amount
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `uint256` - the adjusted withdrawal amount
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_claimWithdrawalQueue">
  <summary>_claimWithdrawalQueue(uint256 positionId)</summary>

- **Description** - Virtual function defining internal logic for how to claim or withdraw from strategies that utilize a withdrawal queue. Returns 0 by default. Overridden by derived contracts that interact with protocols using withdrawal queues.
  - `@param positionId` - The ID of position to claim or withdraw for from the underlying protocol.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 claimAmount` - The amount of assets successfully claimed from the withdrawal queue.
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="InternalOperations_claimRewards">
  <summary>_claimRewards(address token, bytes memory quote, uint256 minAmountOut)</summary>

- **Description** - Virtual function defining internal logic for how to claim reward tokens from the underlying protocol and convert them to the vault's base asset. Returns 0 by default. Overridden by derived contracts to define protocol-specific claiming and conversion logic.
  - `@param token` - the address of the reward token to claim
  - `@param quote` - encoded swap calldata for converting the reward token
  - `@param minAmountOut` - minimum acceptable output from the conversion
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 rewardAmount` - The amount of reward tokens claimed and converted.
- **Emits** - none
- **Reverts** - implementation-dependent
</details>

### Reading State

> Reads derived, calculated, or internal state. For getters of public variables see the Variable section.

<details id="ReadingState_getEstimatedYield">
  <summary>getEstimatedYield()</summary>

- **Description** - Returns the last recorded estimated yield value for this strategy. This value may not reflect the most recent on-chain state and could differ from live protocol values.
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 estimatedYield` - last snapshotted yield value (1e18 = 100%)
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_getCap">
  <summary>getCap()</summary>

- **Description** - Returns the `params.cap` variable, which describes the max allocation to a specific strategy in a specific risk class
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `uint256 cap`
- **Emits** - none
- **Reverts** - none
</details>

<details id="ReadingState_getGlobalCap">
  <summary>getGlobalCap()</summary>

- **Description** - Returns the `params.globalCap` variable.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `uint256 globalCap`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_ids">
  <summary>ids()</summary>

- **Description** - Returns an array of size 1 where the value at the first index is the [`adapterId`](/dev/myt/myt-contract#Variables_adapterId) associated with this strategy.
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `bytes32[] memory ids`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_getIdData">
  <summary>getIdData()</summary>

- **Description** - Returns the ABI-encoded protocol identifier and address for this adapter.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `bytes memory abiEncodedValue`
- **Emits** - none
- **Reverts** - none

</details>

<details id="ReadingState_realAssets">
  <summary>realAssets()</summary>

- **Description** - Returns the total underlying value of this strategy's position by calling the internal `_totalValue()`. Since `_totalValue()` is virtual, the result depends on the derived contract's implementation.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `uint256 assets`
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="ReadingState_previewAdjustedWithdraw">
  <summary>previewAdjustedWithdraw(uint256 amount)</summary>

- **Description** - Returns an estimate of the correct amount that can be fully withdrawn from the strategy, accounting for losses due to slippage, protocol fees, and rounding differences. Delegates to the internal `_previewAdjustedWithdraw()` which is overridden in derived contracts.
  - `@param amount` - the desired withdrawal amount
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `uint256` - the adjusted withdrawal amount
- **Emits** - none
- **Reverts** - [`InvalidAmount(uint256, uint256)`](/dev/myt/myt-contract#Errors_InvalidAmount) — amount is 0
</details>
<details id="ReadingState_allocation">
  <summary>allocation()</summary>

- **Description** - Returns the vault's current allocation tracking for this adapter. Queries the MYT vault using this strategy's `adapterId`.
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256` - the vault's recorded allocation for this strategy
- **Emits** - none
- **Reverts** - none
</details>

## Errors

- <span id="Errors_CounterfeitSettler"><strong><code>CounterfeitSettler(address)</code></strong> - An error which is used to indicate that a swap call to the AllowanceHolder contract failed.</span>
- <span id="Errors_StrategyAllocationPaused"><strong><code>StrategyAllocationPaused(address strategy)</code></strong> - An error which is used to indicate that allocation was attempted while the strategy's killSwitch is enabled.</span>
- <span id="Errors_ActionNotSupported"><strong><code>ActionNotSupported()</code></strong> - An error which is used to indicate that the requested action type is not supported by this strategy, or that a base virtual function has not been overridden by a derived contract.</span>
- <span id="Errors_InvalidAmount"><strong><code>InvalidAmount(uint256 min, uint256 received)</code></strong> - An error which is used to indicate that an amount provided was below the required minimum. Used for zero-amount checks and swap output validation.</span>
- <span id="Errors_InsufficientBalance"><strong><code>InsufficientBalance(uint256 required, uint256 available)</code></strong> - An error which is used to indicate that the strategy contract does not hold enough of a token to fulfill the requested operation.</span>

## Events

- <span id="Events_Allocate"><strong><code>Allocate(uint256 indexed amount, address indexed strategy)</code></strong> - emitted when funds have been allocated to the strategy described by this adapter.</span>
- <span id="Events_Deallocate"><strong><code>Deallocate(uint256 indexed amount, address indexed strategy)</code></strong> - emmitted when funds have been de-alloacted or removed from the strategy described by this adapter.</span>
- <span id="Events_DeallocateDex"><strong><code>DeallocateDex(uint256 indexed amount)</code></strong> - Defined in the interface but not currently emitted by any function in the base contract. Emitted when funds have been deallocated via DEX swap.</span>
- <span id="Events_YieldUpdated"><strong><code>YieldUpdated(uint256 indexed yield)</code></strong> - Defined in the interface but not currently emitted by any function in the base contract. Emitted after taking a yield snapshot.</span>
- <span id="Events_RiskClassUpdated"><strong><code>RiskClassUpdated(RiskClass indexed class)</code></strong> - emitted when updating the params.riskClass to recalify the strategies risk level.</span>
- <span id="Events_IncentivesUpdated"><strong><code>IncentivesUpdated(bool indexed enabled)</code></strong> - emitted when the additionalIncentives flag is set.</span>
- <span id="Events_Emergency"><strong><code>Emergency(bool indexed isEmergency)</code></strong> - emitted after enabling the killswitch on this strategy.</span>
- <span id="Events_SlippageBPSUpdated"><strong><code>SlippageBPSUpdated(uint256 indexed newSlippageBPS)</code></strong> - Emitted when the slippage tolerance is updated.</span>
- <span id="Events_MinAllocationOutBpsUpdated"><strong><code>MinAllocationOutBpsUpdated(uint256 indexed newMinAllocationOutBps)</code></strong> - Emitted when the minimum allocation output BPS is updated.</span>
- <span id="Events_StrategyAllocationLoss"><strong><code>StrategyAllocationLoss(string message, uint256 amountRequested, uint256 actualAmountAllocated)</code></strong> - Emitted when the amount actually allocated to the underlying protocol is less than what was requested, typically due to rounding or protocol fees.</span>
- <span id="Events_WithdrawToVault"><strong><code>WithdrawToVault(uint256 indexed amount)</code></strong> - Emitted when leftover idle assets are transferred back to the vault.</span>
- <span id="Events_RewardsClaimed"><strong><code>RewardsClaimed(address indexed token, uint256 indexed amount)</code></strong> - Emitted when reward tokens are claimed from the underlying protocol.</span>
- <span id="Events_TokensRescued"><strong><code>TokensRescued(address indexed token, address indexed to, uint256 amount)</code></strong> - Emitted when mistakenly sent ERC20 tokens are rescued from the strategy contract.</span>