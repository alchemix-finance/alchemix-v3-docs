---
sidebar_position: 2
hide_title: true
title: Transmuter
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Transmuter" />

Each Transmuter takes one synthetic debt asset (alAsset) and is associated with one AlchemistV3 instance used for redemptions.

## Variables

### StakingPosition

> A struct that describes a tranche of deposited synthetic debt assets which have an eventual claim to underlying.

<details>
  <summary>amount</summary>

- **Description** - The amount of debt tokens deposited and staked.
- **Type** - uint256
- **Used By** \* [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
</details>
<details>
  <summary>startBlock</summary>

- **Description** - Block when the position was opened
- **Type** - uint256
- **Used By** - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
</details>
<details>
  <summary>maturationBlock</summary>

- **Description** - Block at which the transmutation will be complete/claimable
- **Type** - uint256
- **Used By** - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
</details>

### TransmuterInitializationParams

> State set by params at creation-time of the transmuter to initially configure it.

<details>
  <summary>syntheticToken</summary>

- **Description** - the contract of the synthetic asset which will be accepted in staking positions
- **Type** - address
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - `syntheticToken()`
</details>
<details>
  <summary>timeToTransmute</summary>

- **Description** - the time in blocks that it will take to transmute new staking positions
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`setTransmutationTime(uint256 time)`](/dev/transmuter/transmuter-contract#AdminActions_setTransmutationTime)
- **Read By**
  - `timeToTransmute()`
- **Notified By** - [`TransmutationTimeUpdated()`](/dev/transmuter/transmuter-contract#Events_TransmutationTimeUpdated)
</details>
<details>
  <summary>transmutationFee</summary>

- **Description** - the fee percentage on transmutation claims. Expressed in BPS.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setTransmutationFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setTransmutationFee)
- **Read By**
  - `transmutationFee()`
- **Notified By** - [`TransmutationFeeUpdated()`](/dev/transmuter/transmuter-contract#Events_TransmutationFeeUpdated)
</details>
<details>
  <summary>exitFee</summary>

- **Description** - the fee percentage on transmuter claims for early exits. Expressed in BPS.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setExitFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setExitFee)
- **Read By**
  - `exitFee()`
- **Notified By** - [`ExitFeeUpdated()`](/dev/transmuter/transmuter-contract#Events_ExitFeeUpdated)
</details>
<details>
  <summary>feeReceiver</summary>

- **Description** - the address that receives protocol fees from transmutation claims and early exit fees. The constructor copies this value into the `protocolFeeReceiver` state variable. Must be non-zero or the constructor reverts with `IllegalArgument()`.
- **Type** - address
- **Used By**
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setProtocolFeeReceiver(address receiver)`](/dev/transmuter/transmuter-contract#AdminActions_setProtocolFeeReceiver)
- **Read By**
  - `protocolFeeReceiver()`
- **Notified By** - [`ProtocolFeeReceiverUpdated()`](/dev/transmuter/transmuter-contract#Events_ProtocolFeeReceiverUpdated)
</details>
<details>
  <summary>graphSize</summary>

- **Description** - Present in the `TransmuterInitializationParams` struct but not read by the constructor. It has no effect on the deployed contract.
- **Type** - uint256
- **Used By** - none
- **Updated By** - none
- **Read By** - none
</details>

### Constants

> Constant variables used as helpers or for informational purposes.

<details>
  <summary>BPS</summary>

- **Description** - Constant equaling 10_000. Used for any explicit decimal representation. Treats 100% as 10,000; meaning 10% would be expressed as 1000 BPS.
- **Type** - uint256
- **Used By**
  - [`constructor(TransmuterInitializationParams params)`](/dev/transmuter/transmuter-contract#Constructor_constructor)
  - [`setTransmutationFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setTransmutationFee)
  - [`setExitFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setExitFee)
  - [`claimRedemption(uint256)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By** - NONE - constant
</details>
<details>
  <summary>FIXED_POINT_SCALAR</summary>

- **Description** - A multiplier that is used to be able to do fixed point math, since solidity does not natively handle decimals. Like ERC20 tokens which typically use 18 decimals, it expresses 1 as 1e18. Anything less is a fraction of 1.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By** - NONE - constant
</details>
<details>
  <summary>BLOCK_SCALING_FACTOR</summary>

- **Description** - A constant set to 1e8. Used as a fixed-point scaling factor when dividing token amounts by block counts, allowing precise ratios to be stored in the staking graph.
- **Type** - int256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
  - [`queryGraph(uint256 startBlock, uint256 endBlock)`](/dev/transmuter/transmuter-contract#ReadingState_queryGraph)
- **Updated By** - NONE - constant
</details>
<details>
  <summary>version</summary>

- **Description** - Constant expressing Alchemix version. Not used for anything in the contract.
- **Type** - string
- **Updated By** - NONE - constant
- **Read By** - `version()`
</details>

### Public State

> State that is available and can be read from outside of the contract.

#### Uint256

<details>
  <summary>depositCap</summary>

- **Description** - The max number of debt tokens that can be deposited and staked
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`setDepositCap(uint256 cap)`](/dev/transmuter/transmuter-contract#AdminActions_setDepositCap)
- **Read By**
  - `depositCap()`
- **Notified By** - [`DepositCapUpdated(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
</details>
<details>
  <summary>totalLocked</summary>

- **Description** - The total amount of synthetic debt tokens currently locked across all staking positions in the transmuter.
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - `totalLocked()`
</details>
<details>
  <summary>totalActiveLocked</summary>

- **Description** - The total amount of synthetic debt tokens locked in positions that still count toward the deposit cap. Matured positions can be "poked" via `pokeMatured()` to remove them from this count, freeing deposit cap space without requiring the owner to claim.
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
  - [`pokeMatured(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_pokeMatured)
- **Read By** - `totalActiveLocked()`
</details>

#### Addresses

<details>
  <summary>pendingAdmin</summary>

- **Description** - The address of the pending admin. Part of a two step process where the admin sets a new pendingAdmin, and the pendingAdmin must then accept the role to transition to the actual admin.
- **Type** - address
- **Used By**
  - [`acceptAdmin()`](/dev/transmuter/transmuter-contract#UserActions_acceptAdmin)
- **Updated By**
  - [`setPendingAdmin(address value)`](/dev/transmuter/transmuter-contract#AdminActions_setPendingAdmin)
  - [`acceptAdmin()`](/dev/transmuter/transmuter-contract#UserActions_acceptAdmin) (resets it to the zero address)
- **Read By**
  - `pendingAdmin()`
- **Notified By** - [`PendingAdminUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_PendingAdminUpdated)
</details>
<details>
  <summary>alchemist</summary>

- **Description** - The AlchemistV3 contract instance used for redemptions.
- **Type** - IAlchemistV3
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setAlchemist(address value)`](/dev/transmuter/transmuter-contract#AdminActions_setAlchemist)
- **Read By**
  - `alchemist()`
- **Notified By** - [`AlchemistUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_AlchemistUpdated)
</details>
<details>
  <summary>admin</summary>

- **Description** - The current admin address. Set to `msg.sender` on deployment. Only this address can call functions guarded by the `onlyAdmin` modifier.
- **Type** - address
- **Used By**
  - `onlyAdmin`
  - [`acceptAdmin()`](/dev/transmuter/transmuter-contract#UserActions_acceptAdmin)
- **Updated By**
  - [`acceptAdmin()`](/dev/transmuter/transmuter-contract#UserActions_acceptAdmin)
- **Read By** - `admin()`
- **Notified By** - [`AdminUpdated(address admin)`](/dev/transmuter/transmuter-contract#Events_AdminUpdated)
</details>

### Private State

> Internal state of the contract. In most cases cannot be read from outside of the contract. In some cases certain aspects can be read using specific functions. (See ReadingState)

<details>
  <summary>_positions</summary>

- **Description** - A mapping of IDs to StakingPositions. Used to track individual staking positions.
- **Type** - `mapping(uint256 => StakingPosition)`
- **Used By**
  - [`getPosition(uint256 id)`](/dev/transmuter/transmuter-contract#ReadingState_getPosition)
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
  - [`pokeMatured(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_pokeMatured)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - [`getPosition(uint256 id)`](/dev/transmuter/transmuter-contract#ReadingState_getPosition)
</details>
<details>
  <summary>_stakingGraph</summary>

- **Description** - A graph of transmuter staking positions stored as a Fenwick tree. Tracks the per-block redemption rate across all active positions, enabling efficient range queries for scheduled redemptions.
- **Type** - StakingGraph.Graph
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
  - [`queryGraph(uint256 startBlock, uint256 endBlock)`](/dev/transmuter/transmuter-contract#ReadingState_queryGraph)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - [`queryGraph(uint256 startBlock, uint256 endBlock)`](/dev/transmuter/transmuter-contract#ReadingState_queryGraph)
</details>
<details>
  <summary>_nonce</summary>

- **Description** - An incrementing counter used for minting new Transmuter NFT positions so that each has its own unique id.
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Read By** - none
</details>
<details>
  <summary>_countsTowardCap</summary>

- **Description** - A mapping tracking whether a position's locked amount still counts toward the deposit cap (`totalActiveLocked`). Set to true when a position is created. Set to false when the position is claimed or when `pokeMatured()` is called on a fully matured position.
- **Type** - `mapping(uint256 => bool)`
- **Used By**
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
  - [`pokeMatured(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_pokeMatured)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount, address recipient)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
  - [`pokeMatured(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_pokeMatured)
</details>

## Functions

### Constructor

> Runs once at deployment. The deployer becomes the admin.

<details id="Constructor_constructor">
  <summary>constructor(TransmuterInitializationParams params)</summary>

- **Description** - Deploys the Transmuter and seeds its configuration from the `TransmuterInitializationParams` struct.<br/><br/>
  Sets `syntheticToken`, `timeToTransmute`, `transmutationFee`, `exitFee`, and `protocolFeeReceiver` (from `params.feeReceiver`), then sets `admin` to `msg.sender`. The `graphSize` field of the struct is ignored. `depositCap` is left at its default of 0, so `createRedemption` reverts with `DepositCapReached()` until the admin calls `setDepositCap`. `alchemist` is also unset at deployment and is configured through `setAlchemist`.<br/><br/>
  The contract inherits OpenZeppelin `ERC721Enumerable` and sets the ERC721 name to "Alchemix V3 Transmuter" and the symbol to "TRNSMTR". Position NFTs therefore expose the standard ERC721 functions (`balanceOf`, `ownerOf`, `transferFrom`, `approve`, and so on) plus the enumerable extension (`totalSupply`, `tokenByIndex`, `tokenOfOwnerByIndex`) in addition to the functions documented on this page.<br/><br/>
  - `@param params` - the `TransmuterInitializationParams` struct described in the Variables section
- **Visibility Specifier** - none (constructor)
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts**
  - `IllegalArgument()` - if `params.feeReceiver` is the zero address
  - `IllegalArgument()` - if `params.timeToTransmute` is 0
  - `IllegalArgument()` - if `params.timeToTransmute` exceeds `type(int256).max`
  - `IllegalArgument()` - if `params.transmutationFee` exceeds BPS (> 100%)
  - `IllegalArgument()` - if `params.exitFee` exceeds BPS (> 100%)
</details>

### User Actions

> Functions that can be called by external accounts which influence the state or balance of the Transmuter.

<details id="UserActions_createRedemption">
  <summary>createRedemption(uint256 syntheticDepositAmount, address recipient)</summary>

- **Description** - Creates a time-locked redemption staked position that linearly vests over `timeToTransmute` blocks.<br/><br/>
  Validates the deposit amount and capacity against both `depositCap` (using `totalActiveLocked`) and `alchemist.totalSyntheticsIssued()` (using `totalLocked`). Transfers the `syntheticDepositAmount` of alAsset from the function caller. Records a new `StakingPosition` from `block.number` to `block.number + timeToTransmute`. Updates the staking graph with the per-block redemption rate contributed by this position, adding it to the existing global rate so that redemptions for all positions can be served correctly. Mints a new position token to `recipient`, increments both `totalLocked` and `totalActiveLocked`, and marks the position as counting toward the deposit cap.<br/><br/>
  - `@param syntheticDepositAmount` - amount of `syntheticToken` deposited in this staking position, to be locked until transmutation is finished or early exit is executed.
  - `@param recipient` - the address that will own the minted redemption position NFT.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`PositionCreated(address indexed creator, uint256 amountStaked, uint256 nftId)`](/dev/transmuter/transmuter-contract#Events_PositionCreated) - `creator` is `msg.sender`, which may differ from `recipient` (the address that receives the NFT)
- **Reverts**
  - `DepositZeroAmount()` - if `syntheticDepositAmount == 0`
  - `IllegalArgument()` - if `recipient` is the zero address
  - `DepositCapReached()` - if `totalActiveLocked + syntheticDepositAmount` exceeds `depositCap`, or if `totalLocked + syntheticDepositAmount` exceeds `alchemist.totalSyntheticsIssued()`. The latter ensures that more deposits are not accepted than there is debt to service them.
</details>
<details id="UserActions_claimRedemption">
  <summary>claimRedemption(uint256 id)</summary>

- **Description** - Settles and closes the redemption for the staked position identified by id, paying out the vested portion in yield tokens and returning the unvested synthetics minus the exit fee. If the transmuter cannot deliver enough yield tokens to cover the vested portion, the uncovered debt is refunded as synthetics as well.<br/><br/>
  Validates the position exists and is not being claimed in its creation block. Computes the vested vs. unvested split using block-based linear vesting. Verifies ownership and burns the position token.<br/><br/>
  Checks for bad debt in the Alchemist. `badDebtRatio = mulDivUp(alchemist.totalSyntheticsIssued() * 10 ** underlyingDecimals, alchemist.getTotalLockedUnderlyingValue() + alchemist.convertYieldTokensToUnderlying(transmuter MYT balance))`, rounded up so the ratio is never understated. Only when this ratio exceeds `1e18` is the vested amount scaled down: `scaledTransmuted = amountTransmuted * 1e18 / badDebtRatio`. First uses yield tokens already held from prior repayments, then redeems the remainder from the Alchemist (calls `alchemist.redeem()`). The amount actually paid out, `distributable`, is the smaller of the yield value of `scaledTransmuted` and the yield tokens available (held balance plus `redeemedShares`). The transmutation fee is taken from `distributable` only, rounded down, and the claimant receives the remainder. If `distributable` is worth less than `scaledTransmuted` in debt terms, the shortfall is refunded to the claimant in synthetics on top of the unvested amount: `syntheticReturned = (amountNottransmuted - syntheticFee) + shortfallDebt`. The exit fee applies to the unvested portion only, so no exit fee is charged on a shortfall refund. Only `position.amount - (syntheticReturned + syntheticFee)` is burned.<br/><br/>
  If the position was not fully vested, the staking graph is updated to remove the remaining per-block rate. Transfers yield and synthetic payouts/fees, burns the transmuted synthetics, reduces `totalSyntheticsIssued` by the burned amount (calls `alchemist.reduceSyntheticsIssued()`), decrements `totalLocked`, removes the position from `totalActiveLocked` if it still counts toward the cap, and deletes the position. Informs the alchemist of its yieldToken quantity (calls `alchemist.setTransmuterTokenBalance()`).<br/><br/>
  - `@param id` - the id of the staked position to claim and close
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - `(uint256 claimYield, uint256 feeYield, uint256 syntheticReturned, uint256 syntheticFee)` - the amount of yield tokens sent to the claimant, the yield fee sent to the protocol, the amount of synthetic tokens returned to the claimant, and the synthetic exit fee sent to the protocol.
- **Emits**
  - [`PositionClaimed(address claimer, uint256 amountClaimed, uint256 amountUnclaimed)`](/dev/transmuter/transmuter-contract#Events_PositionClaimed)
- **Reverts**
  - `PositionNotFound()` - if no position exists for `id`
  - `PrematureClaim()` - if claiming in the same block the position was opened
  - `CallerNotOwner()` - if the message sender does not own the position
</details>
<details id="UserActions_acceptAdmin">
  <summary>acceptAdmin()</summary>

- **Description** - Can only be called by the current pendingAdmin. Used to accept the admin role.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`PendingAdminUpdated(address(0))`](/dev/transmuter/transmuter-contract#Events_PendingAdminUpdated)
  - [`AdminUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_AdminUpdated)
- **Reverts**
  - `IllegalState()` - if `pendingAdmin` is the zero address (no pending transfer)
  - `Unauthorized()` - if `msg.sender` is not the current `pendingAdmin`
</details>
<details id="UserActions_pokeMatured">
  <summary>pokeMatured(uint256 id)</summary>

- **Description** - Removes a fully matured position from the `totalActiveLocked` count, freeing up deposit cap space without requiring the position owner to claim. Can be called by anyone.<br/><br/>
  Checks that the position exists, is fully matured (current block >= maturation block), and hasn't already been poked. Sets `_countsTowardCap[id]` to false and decrements `totalActiveLocked` by the position's amount.
  - `@param id` - the id of the matured position to poke
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`PositionPoked(uint256 id, uint256 amountRemovedFromCap)`](/dev/transmuter/transmuter-contract#Events_PositionPoked)
- **Reverts**
  - `PositionNotFound()` - if no position exists for `id`
  - `PositionNotMatured(uint256 id, uint256 maturationBlock, uint256 currentBlock)` - if the position has not yet fully matured
  - `PositionAlreadyPoked(uint256 id)` - if the position has already been poked
</details>

### Admin Actions

> Functions guarded by the onlyAdmin modifier.

<details id="AdminActions_setPendingAdmin">
  <summary>setPendingAdmin(address value)</summary>

- **Description** - Sets the pending admin. First part of a two-step process to change the admin. The second step is the pendingAdmin accepting the role by calling acceptAdmin.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`PendingAdminUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_PendingAdminUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
</details>
<details id="AdminActions_setAlchemist">
  <summary>setAlchemist(address value)</summary>

- **Description** - Sets the address of the AlchemistV3 contract that will be used to redeem against for this Transmuter.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`AlchemistUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_AlchemistUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
</details>
<details id="AdminActions_setDepositCap">
  <summary>setDepositCap(uint256 cap)</summary>

- **Description** - Sets the deposit cap variable, or maximum amount of synthetics that can be staked in the transmuter at any one time.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`DepositCapUpdated(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
  - `IllegalArgument()` - if `cap` exceeds `type(int256).max`
</details>
<details id="AdminActions_setTransmutationFee">
  <summary>setTransmutationFee(uint256 fee)</summary>

- **Description** - Sets the fee as a percentage in BPS for transmutation.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`TransmutationFeeUpdated(uint256 fee)`](/dev/transmuter/transmuter-contract#Events_TransmutationFeeUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
  - `IllegalArgument()` - if `fee` exceeds BPS (> 100%)
</details>
<details id="AdminActions_setExitFee">
  <summary>setExitFee(uint256 fee)</summary>

- **Description** - Sets the fee as a percentage in BPS for early exits from positions staked for transmutation.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ExitFeeUpdated(uint256 fee)`](/dev/transmuter/transmuter-contract#Events_ExitFeeUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
  - `IllegalArgument()` - if `fee` exceeds BPS (> 100%)
</details>
<details id="AdminActions_setTransmutationTime">
  <summary>setTransmutationTime(uint256 time)</summary>

- **Description** - Sets the duration of time it takes for new staked positions of synthetic assets to be transmuted in blocks.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`TransmutationTimeUpdated(uint256 time)`](/dev/transmuter/transmuter-contract#Events_TransmutationTimeUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
  - `IllegalArgument()` - if `time` is 0
  - `IllegalArgument()` - if `time` exceeds `type(int256).max`
</details>
<details id="AdminActions_setProtocolFeeReceiver">
  <summary>setProtocolFeeReceiver(address value)</summary>

- **Description** - Sets the address that will receive fees from the Transmuter.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ProtocolFeeReceiverUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_ProtocolFeeReceiverUpdated)
- **Reverts**
  - `IllegalArgument()` - if `msg.sender` is not the current admin
  - `IllegalArgument()` - if `value` is the zero address
</details>

### Internal Operations

> Functions that are cannot be called by other contracts or EOAs. Used only as helpers for performing internal logic.

<details id="InternalOperations_updateStakingGraph">
  <summary>_updateStakingGraph(int256 amount, uint256 blocks)</summary>

- **Description** - Updates the staking graph with a new redemption schedule starting at the current block.<br/><br/>
  Delegates to `_stakingGraph.addStake(amount, block.number, blocks)`. Positive `amount` values add per-block redemption weight, negative values remove it. The change applies for the amount of passed in blocks.<br/><br/>
  - `@param amount` - scaled redemption amount to apply (scaled by `BLOCK_SCALING_FACTOR`)
  - `@param blocks` - number of blocks over which the amount should apply
- **Visibility Specifier** - private
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_checkArgument">
  <summary>_checkArgument(bool expression)</summary>

- **Description** - Validates a boolean condition intended to check arguments.
  - `@param expression` - the boolean expression to validate
- **Visibility Specifier** - internal
- **State Mutability Specifier** - pure
- **Returns** - none
- **Emits** - none
- **Reverts** - `IllegalArgument()` - if the expression evaluates to false
</details>
<details id="InternalOperations_checkState">
  <summary>_checkState(bool expression)</summary>

- **Description** - Validates a boolean condition intended to check state.
  - `@param expression` - the boolean expression to validate
- **Visibility Specifier** - internal
- **State Mutability Specifier** - pure
- **Returns** - none
- **Emits** - none
- **Reverts** - `IllegalState()` if the expression evaluates to false
</details>

### Reading State

> Reads derived, calculated, or internal state. For getters of public variables see the Variable section.

<details id="ReadingState_tokenURI">
  <summary>tokenURI(uint256 id)</summary>

- **Description** - Gets the token URI for a Transmuter NFT token with a specfic id.
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - string memory - the URI of the Transmuter NFT with the passed ID
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_getPosition">
  <summary>getPosition(uint256 id)</summary>

- **Description** - Gets the StakingPosition identified by id.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - StakingPosition memory
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_queryGraph">
  <summary>queryGraph(uint256 startBlock, uint256 endBlock)</summary>

- **Description** - Allows callers to see how much is scheduled to be redeemed between two blocks numbers.<br/><br/>
  Queries the staking graph to calculate the total redemption amount that is scheduled to be applied for all staked positions between two block numbers by delegating to `_stakingGraph.queryStake(startBlock, endBlock)`. Returns 0 if `endBlock` is less than `startBlock`, or if the query does not find an amount for that block span. Otherwise, it uses `FixedPointMath.mulDivUp` to scale the queried amount back down by `BLOCK_SCALING_FACTOR` to restore to token units and returns the result.<br/><br/>
  - `@param startBlock` - block number at which to start the query range
  - `@param endBlock` - block number at which to end the query range
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - `uint256 scheduledAmountToBeRedeemed` - total expected redemption amount of scheduled redemptions between the start and end blocks in token units.
- **Emits** - none
- **Reverts** - none
</details>

## Events

- <span id="Events_AdminUpdated"><strong><code>AdminUpdated(address admin)</code></strong> - Emitted when the admin address is updated.</span>
- <span id="Events_PendingAdminUpdated"><strong><code>PendingAdminUpdated(address pendingAdmin)</code></strong> - Emitted when the pending admin is updated.</span>
- <span id="Events_AlchemistUpdated"><strong><code>AlchemistUpdated(address alchemist)</code></strong> - Emitted when the associated alchemist is updated.</span>
- <span id="Events_PositionCreated"><strong><code>PositionCreated(address indexed creator, uint256 amountStaked, uint256 nftId)</code></strong> - Emitted when a position is created. `creator` is `msg.sender`, which may differ from the `recipient` that owns the minted NFT.</span>
- <span id="Events_PositionClaimed"><strong><code>PositionClaimed(address indexed claimer, uint256 amountClaimed, uint256 amountUnclaimed)</code></strong> - Emitted when a position is claimed.</span>
- <span id="Events_GraphSizeUpdated"><strong><code>GraphSizeUpdated(uint256 size)</code></strong> - Defined in the interface but not currently emitted by any function in the contract.</span>
- <span id="Events_DepositCapUpdated"><strong><code>DepositCapUpdated(uint256 cap)</code></strong> - Emitted when the deposit cap is updated.</span>
- <span id="Events_TransmutationTimeUpdated"><strong><code>TransmutationTimeUpdated(uint256 time)</code></strong> - Emitted when the transmutation time is updated.</span>
- <span id="Events_TransmutationFeeUpdated"><strong><code>TransmutationFeeUpdated(uint256 fee)</code></strong> - Emitted when the transmutation fee is updated.</span>
- <span id="Events_ExitFeeUpdated"><strong><code>ExitFeeUpdated(uint256 fee)</code></strong> - Emitted when the early exit fee is updated.</span>
- <span id="Events_ProtocolFeeReceiverUpdated"><strong><code>ProtocolFeeReceiverUpdated(address receiver)</code></strong> - Emitted when the fee receiver is updated.</span>
- <span id="Events_PositionPoked"><strong><code>PositionPoked(uint256 indexed id, uint256 amountRemovedFromCap)</code></strong> - Emitted when a fully matured position is poked, removing its amount from the active deposit cap count.</span>

## Errors

- <span id="Errors_DepositZeroAmount"><strong><code>DepositZeroAmount()</code></strong> - Reverts when attempting to create a redemption with a zero deposit amount.</span>
- <span id="Errors_DepositCapReached"><strong><code>DepositCapReached()</code></strong> - Reverts when a deposit would push `totalActiveLocked` above `depositCap`, or `totalLocked` above `alchemist.totalSyntheticsIssued()`.</span>
- <span id="Errors_PositionNotFound"><strong><code>PositionNotFound()</code></strong> - Reverts when referencing a position ID that does not exist.</span>
- <span id="Errors_PrematureClaim"><strong><code>PrematureClaim()</code></strong> - Reverts when attempting to claim a position in the same block it was created.</span>
- <span id="Errors_CallerNotOwner"><strong><code>CallerNotOwner()</code></strong> - Reverts when the caller does not own the position NFT they are trying to claim.</span>
- <span id="Errors_PositionNotMatured"><strong><code>PositionNotMatured(uint256 id, uint256 maturationBlock, uint256 currentBlock)</code></strong> - Reverts when attempting to poke a position that has not yet fully matured.</span>
- <span id="Errors_PositionAlreadyPoked"><strong><code>PositionAlreadyPoked(uint256 id)</code></strong> - Reverts when attempting to poke a position that has already been poked.</span>
- <span id="Errors_NotRegisteredAlchemist"><strong><code>NotRegisteredAlchemist()</code></strong> - Defined in `TransmuterErrors.sol` but not currently used by any function in the contract.</span>
- <span id="Errors_AlchemistDuplicateEntry"><strong><code>AlchemistDuplicateEntry()</code></strong> - Defined in `TransmuterErrors.sol` but not currently used by any function in the contract.</span>
- <span id="Errors_DepositTooLarge"><strong><code>DepositTooLarge()</code></strong> - Defined in `TransmuterErrors.sol` but not currently used by any function in the contract.</span>
- <span id="Errors_IllegalArgument"><strong><code>IllegalArgument()</code></strong> - Reverts when a function argument fails a validation check via `_checkArgument()`. Used across admin setter functions.</span>
- <span id="Errors_IllegalState"><strong><code>IllegalState()</code></strong> - Reverts when a state precondition fails via `_checkState()`. Used in `acceptAdmin()` to verify a pending admin exists.</span>
- <span id="Errors_Unauthorized"><strong><code>Unauthorized()</code></strong> - Reverts when `msg.sender` is not authorized. Used in `acceptAdmin()` when the caller is not the `pendingAdmin`.</span>
