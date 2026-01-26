---
sidebar_position: 2
hide_title: true
title: Transmuter
---

import transmuter from '@site/static/img/transmuter-01.png';

<img src={transmuter} alt="Transmuter" class="banner-spacing" />

The Transmuter is a contract that allows redemption of synthetic debt assets created by associated AlchemistV3 contracts for the underlying assets that back them at a 1 to 1 ratio. Deposits of synthetic debt assets into the Transmuter create demand for underlying assets from AlchemistV3 instances, which are obligated to service that demand across a pre-set time period. This creates fixed-duration fixed-rate terms. Each Transmuter takes one synthetic debt asset (alAsset) and can be associated with multiple AlchemistV3 instances, however only one AlchemistV3 instance is used for redemptions.

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

### TransmuterInititializationParams

> State set by params at creation-time of the transmuter to initially configure it.

<details>
  <summary>syntheticToken</summary>

- **Description** - the contract of the synthetic asset which will be accepted in staking positions
- **Type** - address
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - `syntheticToken()`
</details>
<details>
  <summary>timeToTransmute</summary>

- **Description** - the time in blocks that it will take to transmuter new staking positions
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Read By**
  - `timeToTransmute()`
- **Nofified By** - [`TransmutationTimeUpdated()`](/dev/transmuter/transmuter-contract#Events_TransmutationTimeUpdated)
</details>
<details>
  <summary>transmutationFee</summary>

- **Description** - the fee percentage on transmutation claims. Expressed in BPS.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`setTransmutationFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setTransmutationFee)
- **Read By**
  - `transmutationFee()`
- **Nofified By** - [`TransmutationFeeUpdated()`](/dev/transmuter/transmuter-contract#Events_TransmutationFeeUpdated)
</details>
<details>
  <summary>exitFee</summary>

- **Description** - the fee percentage on transmuter claims for early exits. Expressed in BPS.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`setExitFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setExitFee)
- **Read By**
  - `exitFee()`
- **Nofified By** - [`ExitFeeUpdated()`](/dev/transmuter/transmuter-contract#Events_ExitFeeUpdated)
</details>
<details>
  <summary>protocolFeeReceiver</summary>

- **Description** - the contract of the synthetic asset which will be accepted in staking positions
- **Type** - address
- **Used By**
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setProtocolFeeReceiver(address receiver)`](/dev/transmuter/transmuter-contract#AdminActions_setProtocolFeeReceiver)
- **Read By**
  - `protocolFeeReceiver()`
- **Nofified By** - [`ProtocolFeeReceiverUpdated()`](/dev/transmuter/transmuter-contract#Events_ProtocolFeeReceiverUpdated)
</details>
<details>
  <summary>admin</summary>

- **Description** - the contract of the synthetic asset which will be accepted in staking positions
- **Type** - address
- **Used By**
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setProtocolFeeReceiver(address receiver)`](/dev/transmuter/transmuter-contract#AdminActions_setProtocolFeeReceiver)
- **Read By**
  - `protocolFeeReceiver()`
- **Nofified By** - [`ProtocolFeeReceiverUpdated()`](/dev/transmuter/transmuter-contract#Events_ProtocolFeeReceiverUpdated)
</details>
<details>
  <summary>graphSize</summary>

- **Description** - the size in blocks of the transmuter staking graph. Used to optimize the amount of reads and writes made to the graph and can be extended over time.
- **Type** - address
- **Used By**
  - TODO - doesn't seem to be used anywhere
- **Updated By**
  - TODO - doesn't seem to be used anywhere
- **Read By**
  - `graphSize()`
- **Nofified By** - [`GraphSizeUpdated()`](/dev/transmuter/transmuter-contract#Events_GraphSizeUpdated)
</details>

### Constants

> Immutable variables used as helpers or for informational purposes.

<details>
  <summary>BPS</summary>

- **Description** - Constant equaling 10_000. Used for any explicit decimal representation. Treats 100% as 10,000; meaning 10% would be expressed as 1000 BPS.
- **Type** - uint256
- **Used By**
  - [`setTransmutationFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setTransmutationFee)
  - [`setExitFee(uint256)`](/dev/transmuter/transmuter-contract#AdminActions_setExitFee)
  - [`claimRedemption(uint256)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By** - NONE - immutable variable
</details>
<details>
  <summary>FIXED_POINT_SCALAR</summary>

- **Description** - A multiplier that is used to be able to do fixed point math, since solidity does not natively handle decimals. Like ERC20 tokens which typically use 18 decimals, it expresses 1 as 1e18. Anything less is a fraction of 1.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By** - NONE - immutable variable
</details>
<details>
  <summary>BLOCK_SCALING_FACTOR</summary>

- **Description** - A constant set to 1e18. Used as a fixed-point scaling factor when dividing token amounts by block counts, allowing precise ratios to be stored in the staking graph.
- **Type** - uint256
- **Used By**
  - [`claimRedemption(uint256)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By** - NONE - immutable variable
</details>
<details>
  <summary>version</summary>

- **Description** - Constant expressing Alchemix version. Not used for anything in the contract.
- **Type** - uint256
- **Updated By**
  - NONE - immutable variable
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
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`setDepositCap(uint256 cap)`](/dev/transmuter/transmuter-contract#AdminActions_setDepositCap)
- **Read By**
  - `depositCap()`
- **Notified By** - [`DepositCapUpdated(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
</details>
<details>
  <summary>totalLocked</summary>

- **Description** - The fee in BPS for exiting a transmuter staking position early/
- **Type** - uint256
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - `totalLocked()`
</details>

#### Addresses

<details>
  <summary>pendingAdmin</summary>

- **Description** - The address of the pending admin. Part of a two step process where the admin sets a new pendingAdmin, and the pendingAdmin must then accept the role to transition to the actual admin.
- **Type** - address
- **Used By**
  - [`acceptAdmin()`](/dev/transmuter/transmuter-contract#UserActions_acceptAdmin)
- **Updated By**
  - [`setPendingAdmin(uint256 cap)`](/dev/transmuter/transmuter-contract#AdminActions_setPendingAdmin)
- **Read By**
  - `pendingAdmin()`
- **Notified By** - [`PendingAdminUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_PendingAdminUpdated)
</details>
<details>
  <summary>alchemist</summary>

- **Description** - The address of the alchemist instance used for redemptions.
- **Type** - address
- **Used By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`setAlchemist(uint256 cap)`](/dev/transmuter/transmuter-contract#AdminActions_setAlchemist)
- **Read By**
  - `alchemist()`
- **Notified By** - [`AlchemistUpdated(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
</details>
<details>
  <summary>alchemists</summary>

- **Description** - An array of alchemists associated with this Transmuter.
- **Type** - address[]
- **Used By**
  - TODO - not used anywhere?
- **Updated By**
  - TODO - not updated anywhere
- **Read By** - `alchemists()`
</details>

### Private State

> Internal state of the contract. In most cases cannot be read from outside of the contract. In some cases certain aspects can be read using specific functions. (See ReadingState)

<details>
  <summary>_positions</summary>

- **Description** - A mapping of IDs to StakingPositions. Used to track individual staking positions.
- **Type** - mapping(uint256 => StakingPosition)
- **Used By**
  - [`getPosition(uint256 id)`](/dev/transmuter/transmuter-contract#ReadingState_getPosition)
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - [`getPosition(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
</details>
<details>
  <summary>_stakingGraph</summary>

- **Description** - A graph of transmuter staking positions. Stored as a double fenwick tree. The Graph data type is composed of a uint256 size, depicting the size of the tree as a power of two, and a state index g. (TODO is this right? Learn more and correct)
- **Type** - StakingGraph.Graph
- **Used By**
  - [`getPosition(uint256 id)`](/dev/transmuter/transmuter-contract#ReadingState_getPosition)
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - [`getPosition(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
</details>
<details>
  <summary>_nonce</summary>

- **Description** - An incrimeneting counter used for minting of new Transmuter NFT positions so that each has it's own unique id.
- **Type** - uint256
- **Used By**
  - [`getPosition(uint256 id)`](/dev/transmuter/transmuter-contract#ReadingState_getPosition)
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`_mint(address sender, uint256 nonce)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Updated By**
  - [`createRedemption(uint256 syntheticDepositAmount)`](/dev/transmuter/transmuter-contract#UserActions_createRedemption)
  - [`claimRedemption(uint256 id)`](/dev/transmuter/transmuter-contract#UserActions_claimRedemption)
- **Read By** - [`getPosition(uint256 cap)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
</details>

## Functions

### User Actions

> Functions that can be called by external accounts which influence the state or balance of the Transmuter.

<details id="UserActions_createRedemption">
  <summary>createRedemption(uint256 syntheticDepositAmount)</summary>

- **Description** - Creates a time-locked redemption staked position that linearly vests over `timeToTransmute` blocks.<br/><br/>
  Validates the deposit amount and capacity against both `depositCap` and `alchemist.totalSyntheticsIssued()`. Transfers the `syntheticDepositAmount` of alAsset from the function caller. Records a new `StakingPosition` to Transmuter from `block.number` to `block.number + timeToTransmute`. Updates the staking graph with the per-block redemption rate contributed by this position, adding it to the existing global rate so that redemptions for all positions can be served correctly. Mints a new position token and updates `totalLocked`.<br/><br/>
  - `@param syntheticDepositAmount` - amount of `syntheticToken` deposited in this staking position, to be locked until transmutation is finished or early exit is executed.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - `PositionCreated(address owner, uint256 amount, uint256 tokenId)`
- **Reverts** - `DepositZeroAmount()` - if `syntheticDepositAmount == 0` - `DepositCapReached()` - if `totalLocked + syntheticDepositAmount` exceeds `depositCap` or `alchemist.totalSyntheticsIssued()`. In the latter case there must be enough debt in the system to be able to service redemptions, and this check ensures that more deposits are not accepted than there is debt for service them.
</details>
<details id="UserActions_claimRedemption">
  <summary>claimRedemption(uint256 id)</summary>

- **Description** - Settles and closes the redemption for the staked position identified by id, paying out the vested portion in yield tokens and returning any unvested synthetics minus fees applied.<br/><br/>
  Validates the position exists and is not being claimed in its creation block. Computes the vested vs. unvested split using block-based linear vesting. Verifies ownership and burns the position token. Calculates bad debt from Alchemist state and scales down vested payout if necessary. First uses yield from prior repayments to reduce redemptions, then redeems the rest from the Alchemist. (calls `alchemist.redeem()`) Applies the transmutation fee to "transmuted" or vested debt, and an exit fee to synthetics returned (unvested debt). If the staked position was not fully transmuted (vested) then the staking graph is updated to to remove the remaining per block rate. Transfers yield and synthetic payouts/fees, burns the transmuted synthetics, reduces `totalSyntheticsIssued`, (calls `alchemist.reduceSyntheticsIssued()`) decrements `totalLocked`, and deletes the position. Informs the alchemist of it's yieldToken quantity. (calls `alchemist.setTrasnmuterTokenBalance()`)<br/><br/>
  - `@param id` - the id of the staked position to claim and close
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - `PositionClaimed(address owner, uint256 claimDebt, uint256 syntheticReturned)`
- **Reverts** - `PositionNotFound()` - if no position for `id` - `PrematureClaim()` - if claiming in the same block the position was opened - `CallerNotOwner()` - if the message sender does not own the position
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
- **Reverts** - **Unauthorized()**
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
- **Reverts** - none
</details>
<details id="AdminActions_setAlchemist">
  <summary>setAlchemist(address value)</summary>

- **Description** - Sets the address of the AlchemistV3 contract that will be used to redeem against for this Transmuter.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`AlchemistUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_AlchemistUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setDepositCap">
  <summary>setDepositCap(uint256 cap)</summary>

- **Description** - Sets the deposit cap variable, or maximum amount of synthetics that can be staked in the transmuter at any one time.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`DepositCapUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_DepositCapUpdated)
- **Reverts** - If the cap is greater than or equal to the max value of uint256.
</details>
<details id="AdminActions_setTransmutationFee">
  <summary>setTransmutationFee(uint256 fee)</summary>

- **Description** - Sets the fee as a percentage in BPS for transmutation.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`TransmutationFeeUpdated(uint256 fee)`](/dev/transmuter/transmuter-contract#Events_TransmutationFeeUpdated)
- **Reverts** - If the fee is greater than or equal to the max of BPS (>= 100%)
</details>
<details id="AdminActions_setExitFee">
  <summary>setExitFee(uint256 fee)</summary>

- **Description** - Sets the fee as a percentage in BPS for early exits from positions staked for transmutation.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ExitFeeUpdated(uint256 fee)`](/dev/transmuter/transmuter-contract#Events_ExitFeeUpdated)
- **Reverts** - If the fee is greater than or equal to the max of BPS (>= 100%)
</details>
<details id="AdminActions_setTransmutationTime">
  <summary>setTransmutationTime(uint256 time)</summary>

- **Description** - Sets the duration of time it takes for new staked positions of synthetic assets to be transmuted in blocks.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`TransmutationTimeUpdated(uint256 fee)`](/dev/transmuter/transmuter-contract#Events_TransmutationTimeUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setProtocolFeeReceiver">
  <summary>setProtocolFeeReceiver(address value)</summary>

- **Description** - Sets the address that wil recieve fees from the Transmuter.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ProtocolFeeReceiverUpdated(address value)`](/dev/transmuter/transmuter-contract#Events_Events_ProtocolFeeReceiverUpdated)
- **Reverts** - none
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

<details id="ReadingState_tokenUri">
  <summary>tokenUri(uint256 id)</summary>

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
  Queries the staking graph to calculate the total redemption amount that is scheduled to be applied for all staked positions between two block numbers by delegating to `_stakingGraph.queryStake(startBlock, endBlock)`. If the query does not find an amount for that block span then it returns 0. Otherwise, it divides the queried amount to be redeemed (stored as a scaled uint256) by `BLOCK_SCALING_FACTOR` to restore to token units and returns the result.<br/><br/>
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
- <span id="Events_PositionCreated"><strong><code>PositionCreated(address indexed creator, uint256 amountStaked, uint256 nftId)</code></strong> - Emitted when a position is created.</span>
- <span id="Events_PositionClaimed"><strong><code>PositionClaimed(address indexed claimer, uint256 amountClaimed, uint256 amountUnclaimed)</code></strong> - Emitted when a position is claimed.</span>
- <span id="Events_GraphSizeUpdated"><strong><code>GraphSizeUpdated(uint256 size)</code></strong> - Emitted when the graph size is extended.</span>
- <span id="Events_DepositCapUpdated"><strong><code>DepositCapUpdated(uint256 cap)</code></strong> - Emitted when the deposit cap is updated.</span>
- <span id="Events_TransmutationTimeUpdated"><strong><code>TransmutationTimeUpdated(uint256 time)</code></strong> - Emitted when the transmutation time is updated.</span>
- <span id="Events_TransmutationFeeUpdated"><strong><code>TransmutationFeeUpdated(uint256 fee)</code></strong> - Emitted when the transmutation fee is updated.</span>
- <span id="Events_ExitFeeUpdated"><strong><code>ExitFeeUpdated(uint256 fee)</code></strong> - Emitted when the early exit fee is updated.</span>
- <span id="Events_ProtocolFeeReceiverUpdated"><strong><code>ProtocolFeeReceiverUpdated(address receiver)</code></strong> - Emitted when the fee receiver is updated.</span>
