---
sidebar_position: 3
hide_title: true
title: MYTStrategy
---

import mytstrategy from '@site/static/img/mytstrategy-01.png';

<img src={mytstrategy} alt="MYTStrategy" class="banner-spacing" />

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
  - [`snapshotYield()`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Updated By** - `setAdditionalIncentives(bool newValue)`
</details>

### Public State

> State that is available and can be read from outside of the contract.

#### Constants

<details>
  <summary>SECONDS_PER_YEAR</summary>

- **Description** - Set to 365 days. Used in yield calculations.
- **Type** - uint256
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
  - [`_approxAPY`](/dev/myt/myt-contract#InternalOperations_approxAPY)
- **Updated By** - none. Contant variable
- **Read By** - `SECONDS_PER_YEAR()` - will return a uint256 value representing seconds
</details>
<details>
  <summary>FIXED_POINT_SCALAR</summary>

- **Description** - A multiplier that is used to be able to do fixed point math, since solidity does not natively handle decimals. Like ERC20 tokens which typically use 18 decimals, it expresses 1 as 1e18. Anything less is a fraction of 1.
- **Type** - uint256
- **Used By**
  - [`_approxAPY`](/dev/myt/myt-contract#InternalOperations_approxAPY)
  - [`_lerp`](/dev/myt/myt-contract#InternalOperations_lerp)
- **Updated By** - none. Constant varible.
- **Read By** - `FIXED_POINT_SCALAR()`
</details>
<details>
  <summary>MIN_SNAPSHOT_INTERVAL</summary>

- **Description** - A value in seconds set to 1 day.
- **Type** - uint256
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Updated By** - none. Constant varible.
- **Read By** - `MIN_SNAPSHOT_INTERVAL()` - returns a uint representing seconds
</details>

#### Immutable State

> State that is set once on contract deployment

<details>
  <summary>MYT</summary>

- **Description** - A Morpho VaultV2 contract which manages and allocates to individual strategies through adapters such as this one.
- **Type** - IVault2
- **Used By**
  - [Vault Actions](/dev/myt/myt-contract#VaultActions)
- **Updated By** - none
- **Read By** - `MYT()` - will return the address of the Vault2 contract, since MYT is a contract type.
</details>
<details>
  <summary>receiptToken</summary>

- **Description** - The address of the erc20 token contract for the reciept token users get for depositing into the MYT contract.
- **Type** - address
- **Used By**
  - [`deallocateDex(bytes calldata quote, bool prevSettler)`](/dev/myt/myt-contract#UserActions_deallocateDex)
  - [`setPermit2Address(address newAddress)`](/dev/myt/myt-contract#OwnerActions_setPermit2Address)
- **Updated By** - none
- **Read By** - `receiptToken()`
</details>
<details id="Variables_adapterId">
  <summary>adapterId</summary>

- **Description** - A hash of the protocol serving as an id for reporting on allocations/deallocations to the strategy.
- **Type** - bytes32
- **Used By**
  - [`allocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_allocate)
  - [`deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)`](/dev/myt/myt-contract#VaultActions_deallocate)
- **Updated By** - none
- **Read By** - `ids()` - returns an array of size 1, where the first index contains this id.
</details>

### Updateable State

<details>
  <summary>params</summary>

- **Description** - The list of params passed at deployment-time describing the strategy. Some can be edited. For more information see the StrategyParams type above.
- **Type** - StrategyParams
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
  - [`getIdData()`](/dev/myt/myt-contract#ReadingState_getIdData)
  - [`getCap()`](/dev/myt/myt-contract#ReadingState_getCap)
  - [`getGlobalCap()`](/dev/myt/myt-contract#ReadingState_getGlobalCap)
- **Updated By**
  - `setRiskClass()`
  - `setAdditionalIncentives()`
- **Read By** - `params()` - returns a tuple containing all StrategyParam property values in the order listed in the Struct definition above.
</details>
<details>
  <summary>lastSnapshotTime</summary>

- **Description** - The last time the `snapshotYield()` function was successfully run.
- **Type** - uint256
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Updated By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Read By** - `lastSnapshotTime()`
</details>
<details>
  <summary>lastIndex</summary>

- **Description** - The last recorded price-per-share of the underlying strategy. Each time `snapshotYield()` is called, the strategy implementation (derivation of this base contract) `_computeBaseRatePerSecond()` is called which calculates the base yield rate, in addition to getting the new price-per-share value for the strategy. That is then recorded as the lastIndex. This value is used to help calculate total yield earned since that last snapshot.
- **Type** - uint256
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Updated By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Read By** - `lastIndex()`
</details>
<details>
  <summary>estApr</summary>

- **Description** - The last recorded estimated non-compounding APR of the underlying strategy. Scaled by 1e18. (1e18 = 100%, 5e17 = 50%, etc.)
- **Type** - uint256
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Updated By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Read By** - `estApr()`
</details>
<details>
  <summary>estApy</summary>

- **Description** - The last recorded estimated compounding APY for the underlying strategy. Scaled by 1e18. (1e18 = 100%, 5e17 = 50%, etc.)
- **Type** - uint256
- **Used By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Updated By**
  - [`snapshotYield`](/dev/myt/myt-contract#UserActions_snapshotYield)
- **Read By** - `estApy()`
</details>
<details>
  <summary>killswitch</summary>

- **Description** - A true/false toggle that freezes all fund-moving actions. Vault allocate/deallocate simply exit with no operations done, and operator-initiated moves revert. Nothing is auto-unstaked or withdrawn. It’s a circuit breaker, not an unwinder.
- **Type** - bool
- **Used By**
  - [`allocate`](/dev/myt/myt-contract#VaultActions_allocate)
  - [`deallocate`](/dev/myt/myt-contract#VaultActions_deallocate)
  - [`deallocateDex`](/dev/myt/myt-contract#VaultActions_deallocateDex)
  - [`claimWithdrawalQueue`](/dev/myt/myt-contract#UserActions_claimWithdrawalQueue)
  - [`claimRewards`](/dev/myt/myt-contract#UserActions_claimRewards)
- **Updated By**
  - `setKillswitch(bool value)`
- **Read By** - `killswitch()`
</details>
<details>
  <summary>whitelistedAllocators</summary>

- **Description** - A mapping of addresses which are allowed to call functions that move funds.
- **Type** - mapping(address => bool)
- **Used By**
  - [`deallocateDex`](/dev/myt/myt-contract#UserActions_deallocateDex)
  - [`claimWithdrawalQueue`](/dev/myt/myt-contract#UserActions_claimWithdrawalQueue)
- **Updated By**
  - `setWhitelistedAllocator(address to, bool val)`
- **Read By** - `whitelistedAllocators(address)` - returns a true/false value indicating whether or not the address passed is a whitelisted allocator
</details>
<details>
  <summary>permit2Address</summary>

- **Description** - The address of the Permit2 router contract to be used. Permit2 is a universal approval and transfer router that standardizes those processes through one contract.  
  Instead of granting separate approvals to each DEX or contract, the strategy grants a single allowance to Permit2, which then validates signed off-chain transfer authorizations.
- **Type** - address
- **Used By**
  - `constructor(address _myt, StrategyParams memory _params, address _permit2address, address_receiptToken)`
  - [`setPermit2Address(address newAddress)`](/dev/myt/myt-contract#OwnerActions_setPermit2Address)
  - [`isValidSignature(bytes32 _hash, bytes memory _signature)`](/dev/myt/myt-contract#UserActions_isValidSignature)
- **Updated By**
  - [`setPermit2Address(address newAddress)`](/dev/myt/myt-contract#OwnerActions_setPermit2Address)
- **Read By** - `permit2Address()`
</details>

## Functions

### User Actions

> Actions that are performed by any external callers. In some cases this may be necessitate elevated permissions or restrict user access, but these are one-offs rather than patterns of actors decsribed by traditional only\_ modifiers.

<details id="UserActions_deallocateDex">
  <summary>deallocateDex(bytes calldata quote, bool prevSettler)</summary>

- **Description** - Executes a deallocation through the 0x DEX Settler contract, allowing whitelistedAllocators to move or sell assets directly from the strategy. This bypasses standard withdrawal queue logic and is typically used in emergency or rebalancing scenarios.
  - `@param quote` - ABI-encoded calldata for a verified 0x swap quote, representing the DEX trade to perform.
  - `@param prevSettler` - Boolean flag indicating whether to use the previous Settler contract (`true`) or the current one (`false`).
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 ret` - The amount of receipt tokens deallocated through the DEX trade. (the amount that balance of receipt tokens has increase by)
- **Emits**
  - [`DeallocateDex(uint256 amountDeallocated)`](/dev/myt/myt-contract#Events_DeallocateDex)
- **Reverts** - With `"emergency"` if `killswitch == true` - With `"PD"` if `msg.sender` is not an active whitelistedAllocator - With `"SF"` if the Settler call fails
- If the 0x swap parameters or slippage creates an invalid swap quote
</details>
<details id="UserActions_claimWithdrawalQueue">
  <summary>claimWithdrawalQueue(uint256 positionId)</summary>

- **Description** - Handles claiming withdrawals from strategies that implement a withdrawal queue system.<br/><br/>
  First checks that the caller is a whitelistedAllocator and that the strategy is not in emergency mode, then delegates to the internal function `_claimWithdrawalQueue()` which is overrideen and defined in derived strategy implementations.
  - `@param positionId` - The ID of the position to claim for from the underlying protocol.
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 ret` - The amount of assets claimed from the withdrawal queue (returned by the strategy-specific implementation).
- **Emits** - none
- **Reverts** - With `"PD"` if `msg.sender` is not whitelisted
- With `"emergency"` if `killSwitch == true`
</details>
<details id="UserActions_claimRewards">
  <summary>claimRewards()</summary>

- **Description** - Claims any pending reward tokens from the underlying strategy’s protocol<br/><br/>
  First verifies that the strategy is not in emergency mode then delegates to the internal `_claimRewards()` implementation, which must be overrideen in derived contracts to define protocol-specific claiming logic.
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256` - The amount of reward tokens claimed, as defined by the derived implementation.
- **Emits** - none
- **Reverts** - With `"emergency"` if `killSwitch == true`
</details>
<details id="UserActions_snapshotYield">
  <summary>snapshotYield()</summary>

- **Description** - Recomputes the strategies estimated rates for base yield and incentives yield and returns an aggregate estimated apy scaled by 1e18. (1e18 = 100%)<br/><br/>
  First ensures that the `MINIMUM_SNAPSHOT_INTERVAL` has passed since the last call to prevent griefing, then calls internal functions `_computeBaseRatePerSecond()` and `_computeRewardsRatePerSecond()`, both of which are implemented in derived contracts, to calculate the most up-to-date current rates. Then those rates are combined and projected out a year. A smoothign rate of .7 is then applied, and passed with the newly calculated rates to the internal `_lerp()` function to calculate estimated rates from the new snapshot and the previously snaphshotted rate.
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 estApy`
- **Emits**
  - [`YieldUpdated(uint256 estApy)`](/dev/myt/myt-contract#Events_YieldUpdated)
- **Reverts** - none
</details>

### Owner Actions

> Actions guarded by the onlyOwner modifier, which restricts access to the owner set at deployment time

<details id="OwnerActions_setPermit2Address">
  <summary>setPermit2Address(address newAddress)</summary>

- **Description** - Updates the [`permit2Address`](/dev/myt/myt-contract#Variables_permit2Address) used for token transfer approvals through the Permit2 router contract.<br/><br/>
  First revokes existing token approvals from the old Permit2 address, grants maximum allowance to the new Permit2 address for the MYT `receiptToken`, and then updates the stored `permit2Address` value.
  - `@param newAddress` - the new Permit2 router contract address
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Emits** - none
- **Reverts**
- With `"Zero address"` if `newAddress` is the zero address
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

- **Description** - Toggles the emergency stop (`killSwitch`) for this strategy. When enabled many operations such as allocations, deallocations, and reward claims are halted to prevent further activity.
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
  Assets are allocated using an internal call to `_allocate()` which is overrideen and defined in derived strategy contract implementations. If `killSwitch` is enabled, the simply exits with a change of 0.
  - `@param data` - a bytes-encoded representation of the old (current) allocation. Later decoded into an uint256.
  - `@param assets` - the amount of tokens the vault is requesting to allocated to the strategy.
  - `@param selector` - Unused, but in place to match the Morpho V2 spec. May be used in the future.
  - `@param sender` - Unused, but in place to match the Morpho V2 spec. May be used in the future.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - (bytes32[] memory strategyIds, int256 change) - A tuple where the first value is an array of size 1 containing the [`adapterId`](/dev/myt/myt-contract#Variables_adapterId), and the second value is a signed 256 bit integer containing the difference between the new allocation and the old allocation
- **Emits**
  - [`Allocate(uint256 amountAllocated, address this)`](/dev/myt/myt-contract#Events_Allocate)
- **Reverts** - none
</details>
<details id="VaultActions_deallocate">
  <summary>deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)</summary>

- **Description** - Deallocates `assets` from the underlying strategy back to the vault, computes the delta between the new allocation and previous allocation, and reports the change.<br/><br/>
  Assets are withdrawn using an internal call to `_deallocate()` which is overridden and defined in derived strategy contract implementations. If `killSwitch` is enabled, the function exits early with a change of 0.
  - `@param data` - a bytes-encoded representation of the old (current) allocation. Later decoded into an uint256.
  - `@param assets` - the amount of tokens the vault is requesting to deallocate from the strategy.
  - `@param selector` - TODO unused and not inherited. Do we need?
  - `@param sender` - TODO unused and not inherited. Do we need?
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - (bytes32[] memory strategyIds, int256 change) - A tuple where the first value is an array of size 1 containing the [`adapterId`](/dev/myt/myt-contract#Variables_adapterId), and the second value is a signed 256 bit integer containing the difference between the new allocation and the old allocation
- **Emits**
  - [`Deallocate(uint256 amountDeallocated, address this)`](/dev/myt/myt-contract#Events_Deallocate)
  - [`MYTLog(string message, uint256 value)`](/dev/myt/myt-contract#Events_MYTLog) - emit old allocation, amount deallocated, and resulting new allocation for transparency.
- **Reverts** - none
</details>

### Internal Operations

<details id="InternalOperations_allocate">
  <summary>_allocate(uint256 amount)</summary>

- **Description** - An empty virtual function defining internal logic for how to allocate to a strategy. Must be overridden by derived contracts.
  - `@param amount` - The amount of assets to allocate into the underlying protocol.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 depositReturn` - The amount of assets successfully allocated by the protocol.
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="InternalOperations_deallocate">
  <summary>_deallocate(uint256 amount)</summary>

- **Description** - An empty virtual function defining internal logic for how to deallocate from a strategy. Must be overridden by derived contracts.
  - `@param amount` - The amount of assets to deallocate or withdraw from the underlying protocol.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 withdrawReturn` - The amount of assets successfully withdrawn from the protocol.
- **Emits** - none
- **Reverts** - implmentation-dependent
</details>
<details id="InternalOperations_claimWithdrawalQueue">
  <summary>_claimWithdrawalQueue(uint256 positionId)</summary>

- **Description** - An empty virtual function defining internal logic for how to claim or withdraw from strategies that utilize a withdrawal queue. Must be overridden by derived contracts.
  - `@param positionId` - The ID of position to claim or withdraw for from the underlying protocol.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 claimAmount` - The amount of assets successfully claimed from the withdrawal queue.
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="InternalOperations_claimRewards">
  <summary>_claimRewards()</summary>

- **Description** - An empty virtual function defining internal logic for how to claim from a strategy. Must be overridden by derived contracts.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 rewardAmount` - The amount of reward tokens claimed from the protocol.
- **Emits** - none
- **Reverts** - implementation-dependent
</details>

<details id="InternalOperations_computeBaseRatePerSecond">
  <summary>_computeBaseRatePerSecond()</summary>

- **Description** - An empty virtual function defining internal logic for how to compute base per-second yield rate from the underlying protocol. Must be overridden by derived contracts.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `(uint256 ratePerSec, uint256 newIndex)` - a tupe where:
  - The first value `ratePerSec` is the rate of yield per second scaled to 1e18. (1e18 = 100% per second, 1e16 = 1% per second, etc.)
  - The second value `newIndex` is the most up-to-date price-per-share value of the MYT shares
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="InternalOperations_computeRewardsRatePerSecond">
  <summary>_computeRewardsRatePerSecond()</summary>

- **Description** - An empty virtual function defining internal logic for how to compute incentive/reward per-second yield rate from the underlying protocol. Must be overridden by derived contracts.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 ratePerSec` - the rate of yield per second scaled to 1e18. (1e18 = 100% per second, 1e16 = 1% per second, etc.)
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="InternalOperations_approxAPY">
  <summary>_approxAPY(uint256 ratePerSecWad)</summary>

- **Description** - Approximates the APY from a given per-second WAD-scaled (1e18) rate.<br/><br/>  
  First multiplies the per-second rate by the number of seconds in a year to estimate APR. Then approxiamtes compounding using a formula of `APR^2 / (2 × SECONDS_PER_YEAR)`
  - `@param ratePerSecWad` — per-second yield rate (1e18 = 100% per second)
- **Visibility Specifier** - internal
- **State Mutability Specifier** - pure
- **Returns** - `uint256 approxApyPercentage` - a percentage scaled by 1e18 (1e18 = 100% per year)
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_lerp">
  <summary>_lerp(uint256 oldVal, uint256 newVal, uint256 alpha)</summary>

- **Description** - A smoothing function to blend `oldVal` and `newVal` using a weighted average, in order to calculate a new yield rate without sharp differences.<br/><br/>
  Uses a factor `alpha` to determine how much of the previous value to retain vs. how much of the new value to apply. This is currently set to 70% (7e17) in [`snapshotYield()`](/dev/myt/myt-contract#UserActions_snapshotYield), the only caller of this function.
  This means newly calculated results will use approximately 70% of `oldVal` and 30% of `newVal`, in order to prevent sudden jumps in estimated APR and APY.
  - `@param oldVal` — previous recorded value (scaled by 1e18)
  - `@param newVal` — new calculated value (scaled by 1e18)
  - `@param alpha` — smoothing factor between 0 and 1e18 (7e17 = 70%)
- **Visibility Specifier** - internal
- **State Mutability Specifier** - pure
- **Returns** - `uint256 smoothedYieldRate`
- **Emits** - none
- **Reverts** - none
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

- **Description** - An empty virtual function defining internal logic for getting the actual amount of underlying assets currently held or represented by this strategy. Must be overridden by derived contracts.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `uint256 assets`
- **Emits** - none
- **Reverts** - implementation-dependent
</details>
<details id="ReadingState_isValidSignature">
  <summary>isValidSignature(bytes32 _hash, bytes memory _signature)</summary>

- **Description** - Definistion for ERC721 interface for Permit2 signature verification. It allows callers to confirm that this strategy contract has validly authorized a specific operation for [`permit2Address`](/dev/myt/myt-contract#Variables_permit2Address) via signature.
  - `@param _hash`
  - `@param _signature`
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `bytes4 isValid` - The ERC721 defined value of 0x1626ba7e to indicated a signature is valid. Any other return value indicates an invalid signature.
- **Emits** - none
- **Reverts** - none
</details>

## Errors

- <span id="Errors_CounterfeitSettler"><strong><code>CounterfeitSettler(address)</code></strong> - TODO not used anywhere?</span>

## Events

- <span id="Events_Allocate"><strong><code>Allocate(uint256 indexed amount, address indexed strategy)</code></strong> - emitted when funds have been allocated to the strategy described by this adapter.</span>
- <span id="Events_Deallocate"><strong><code>Deallocate(uint256 indexed amount, address indexed strategy)</code></strong> - emmitted when funds have been de-alloacted or removed from the strategy described by this adapter.</span>
- <span id="Events_DeallocateDex"><strong><code>DeallocateDex(uint256 indexed amount)</code></strong> - emitted when funds have been deallocated via DEX swap.</span>
- <span id="Events_YieldUpdated"><strong><code>YieldUpdated(uint256 indexed yield)</code></strong> - emitted after taking a yield snapshot.</span>
- <span id="Events_RiskClassUpdated"><strong><code>RiskClassUpdated(RiskClass indexed class)</code></strong> - emitted when updating the params.riskClass to recalify the strategies risk level.</span>
- <span id="Events_IncentivesUpdated"><strong><code>IncentivesUpdated(bool indexed enabled)</code></strong> - emitted when the additionalIncentives flag is set.</span>
- <span id="Events_Emergency"><strong><code>Emergency(bool indexed isEmergency)</code></strong> - emitted after enabling the killswitch on this strategy.</span>
- <span id="Events_MYTLog"><strong><code>MYTLog(string message, uint256 value)</code></strong> - debug logging used to output a message and value from the contract.</span>
