---
sidebar_position: 5
---

# AlchemistAllocator

## Description

AlchemistCurator is the governance and configuration contract for MYT vaults. It allows admins and operators to register or remove strategy adapters for a given MYT and to adjust their absolute and relative caps. In short, it defines which strategies exist within the MYT and how much capital each can hold.<br/><br/>
**Note:** AlchemistCurator inherits from PermissionedProxy, which provides it's access control system for operator roles, and the deny-list used to restrict certain calls. The admin role is set using the same pending/admin admin system as the Alchemist and is handled in this child contract. For details on the operator role and logic, see PermissionedProxy.

## Variables

<details>
  <summary>adapterToMYT</summary>

  - **Description** - A mapping that associates each MYT strategy adapter address with the specific MYT vault address it is a part of. This is how the curator knows which vault to target when adding, removing, or adjusting caps for a given strategy.  
  - **Type** - `mapping(address => address)`  
  - **Used By**
    - [`_vault(address adapter)`](/dev/myt/alchemist-curator-contract#InternalOperations_vault)
    - [`_setStrategy(address adapter, address myt, bool remove)`](/dev/myt/alchemist-curator-contract#InternalOperations_setStrategy)
  - **Updated By**
    - `setStrategy(address adapter, address myt, bool remove)` - cannot use the zero address for the adapter or myt
  - **Read By**
    - `adapterToMYT(address)`
</details>
<details>
  <summary>pendingAdmin</summary>

- **Description** - The first step in a two-step process of setting a new administrator. The pendingAdmin is set by the current admin, then the pendingAdmin must accept the responsibility to lock in the change of admin.
- **Type** - address
- **Updated By**
  - [`transferAdminOwnership(address _newAdmin)`](/dev/alchemist/alchemist-curator-contract#AdminActions_transferAdminOwnership)
- **Read By**
  - `pendingAdmin()`
- **Notified By** - none
</details>

## Functions

### Admin Actions

<details id="AdminActions_transferAdminOwnerShip">
  <summary>transferAdminOwnerShip(address _newAdmin)</summary>

  - **Description** - Sets the pending admin. First part of a two-step process to change the admin. The second step is the pendingAdmin accepting the role by calling acceptAdmin.
    - `@param _newAdmin` - The address proposed to become the new admin.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**  
    - With `"PD"` if `msg.sender` is not the current admin.  
  - **Emits** - none
</details>
<details id="AdminActions_acceptAdminOwnership">
  <summary>acceptAdminOwnership()</summary>

  - **Description** - Finalizes an admin ownership transfer by assigning `pendingAdmin` as the new active admin. Afterwards the `pendingAdmin` is reset to the zero address. 
  	TODO - this is currently only callable by admin, but should probably be callable by pendingAdmin and be a user action
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**  
    - With `"PD"` if `msg.sender` is not the current admin.  
  - **Emits**  
    - [`AdminChanged(address newAdmin)`](/dev/myt/alchemist-curator-contract#Events_AdminChanged)  
</details>
<details id="AdminActions_decreaseAbsoluteCap">
  <summary>decreaseAbsoluteCap(address adapter, uint256 amount)</summary>

  - **Description** - Delegates to the internal [`_decreaseAbsoluteCap(adapter, id, amount)`](/dev/myt/alchemist-curator-contract#InternalOperations_decreaseAbosluteCap) to immediately lowers the absolute cap for a given strategy on its MYT vault. The absolute cap is the maximum quanitity of underlying assets that may be allocated to the strategy.
    - `@param adapter` - The strategy adapter address.
    - `@param amount` - The amount denominated in underlying assets to decrease the absolute cap by.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `AbsoluteCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`DecreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_DecreaseAbsoluteCap)
</details>
<details id="AdminActions_submitDecreaseAbsoluteCap">
  <summary>submitDecreaseAbsoluteCap(address adapter, uint256 amount)</summary>

  - **Description** - Queues up a decrease of a strategy’s absolute cap on the MYT vault via the vault’s timelock, to be executed at a later date.
    - `@param adapter` - The strategy adapter address.
    - `@param amount` - The amount denominated in underlying asset to decrease the absolute cap by.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  -  **Reverts**
    - `AbsoluteCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitDecreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitDecreaseAbsoluteCap)
</details>
<details id="AdminActions_decreaseRelativeCap">
  <summary>decreaseRelativeCap(address adapter, uint256 amount)</summary>

  - **Description** - Immediately decreases the relative cap for a given strategy on its MYT vault. The relative cap represents the strategy’s maximum allowed proportion of the vault’s total assets.<br/><br/>
  	Gets the ID from the adapter address, and calls the internal `_decreaseRelativeCap(adapter, id, amount)` to immediately decrease the cap.  
    - `@param adapter` - The strategy adapter address.  
    - `@param amount` - The new percentage, expressed as an 18 decimal scaled number, (1e18 = 100%) to set as the relative cap. Must be lower than the previous relative cap.
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `RelativeCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`DecreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_DecreaseRelativeCap)
</details>
<details id="AdminActions_submitDecreaseRelativeCap">
  <summary>submitDecreaseRelativeCap(address adapter, uint256 amount)</summary>

  - **Description** - Queues a decrease of the strategy’s relative cap on the MYT vault through the vault’s timelock mechanism, to be executed at a later time.<br/><br/>
	Calls the internal `_submitDecreaseRelativeCap(adapter, id, amount)` to queue the decrease.
    - `@param adapter` - The strategy adapter address.  
    - `@param amount` - The new percentage to set the relative cap to, expressed as a uint256 scaled by 1e18. (1e18 = 100%) Must be lower than the previous relative cap. 
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `RelativeCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitDecreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitDecreaseRelativeCap)
</details>
<details id="AdminActions_increaseAbsoluteCap">
  <summary>increaseAbsoluteCap(address adapter, uint256 amount)</summary>

  - **Description** - Delegates to the internal [`_increaseAbsoluteCap(adapter, id, amount)`](/dev/myt/alchemist-curator-contract#InternalOperations_increaseAbsoluteCap) to raise the absolute cap for a given strategy on its MYT vault.  
    The absolute cap is the maximum quantity of underlying assets that may be allocated to the strategy.  
    - `@param adapter` - The strategy adapter address.  
    - `@param amount` - The amount denominated in underlying asset units to increase the absolute cap by.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `AbsoluteCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.  
  - **Emits**
    - [`IncreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_IncreaseAbsoluteCap)
</details>
<details id="AdminActions_increaseRelativeCap">
  <summary>increaseRelativeCap(address adapter, uint256 amount)</summary>

  - **Description** - Immediately raises the relative cap for a given strategy on its MYT vault.  
    The relative cap defines the maximum percentage of the vault’s total assets that the strategy can hold.<br/><br/>
    Gets the ID from the adapter address and calls the internal `_increaseRelativeCap(adapter, id, amount)` to raise the cap.  
    - `@param adapter` - The strategy adapter address.  
    - `@param amount` - The new percentage, expressed as an 18-decimal scaled number (1e18 = 100%), to set as the relative cap. Must be higher than the previous relative cap.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `RelativeCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.  
  - **Emits**
    - [`IncreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_IncreaseRelativeCap)
</details>
<details id="AdminActions_submitIncreaseAbsoluteCap">
  <summary>submitIncreaseAbsoluteCap(address adapter, uint256 amount)</summary>

  - **Description** - Queues up an increase of a strategy’s absolute cap on the MYT vault via the vault’s timelock, to be executed at a later date.<br/><br/>
    Calls the internal `_submitIncreaseAbsoluteCap(adapter, id, amount)` to queue the change.
    - `@param adapter` - The strategy adapter address.
    - `@param amount` - The amount denominated in underlying asset units to increase the absolute cap by.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `AbsoluteCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitIncreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitIncreaseAbsoluteCap)
</details>
<details id="AdminActions_submitIncreaseRelativeCap">
  <summary>submitIncreaseRelativeCap(address adapter, uint256 amount)</summary>

  - **Description** - Queues an increase of the strategy’s relative cap on the MYT vault through the vault’s timelock mechanism, to be executed at a later time.<br/><br/>
    Calls the internal `_submitIncreaseRelativeCap(adapter, id, amount)` to enqueue the update.
    - `@param adapter` - The strategy adapter address.  
    - `@param amount` - The new percentage to set the relative cap to, expressed as a uint256 scaled by 1e18 (1e18 = 100%). Must be higher than the previous relative cap. 
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `RelativeCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitIncreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitIncreaseRelativeCap)
</details>

### Operator Actions

> Functions guarded by the onlyOperator modifier.

<details id="OperatorActions_setStrategy">
  <summary>setStrategy(address adapter, address myt)</summary>

  - **Description** - Registers a MYT strategy adapter with the specified MYT vault.<br/><br/>  
    First runs address validity checks, then offloads to the internal [`_setStrategy(adapter, myt, false)`](/dev/myt/alchemist-curator-contract#InternalOperations_setStrategy) to register the MYT strategy with the vault as an active strategy.
    - `@param adapter` - The address of the MYT strategy adapter to register.  
    - `@param myt` - The address of the MYT vault that the adapter belongs to.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"INVALID_ADDRESS"` if either `adapter` or `myt` is the zero address.  
  - **Emits**  
    - [`StrategySet(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategySet) - emitted in the internal _setStrategy() call.
</details>
<details id="OperatorActions_removeStrategy">
  <summary>removeStrategy(address adapter, address myt)</summary>

  - **Description** - Deregisters a MYT strategy adapter from the specified MYT vault.<br/><br/>  
    First runs address validity checkts, then offloads to the internal [`_setStrategy(adapter, myt, true)`](/dev/myt/alchemist-curator-contract#InternalOperations_setStrategy) to deregister the MYT strategy from the vault as an active strategy.
    - `@param adapter` - The address of the MYT strategy adapter to remove.  
    - `@param myt` - The address of the MYT vault that the adapter is currently linked to.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable 
  - **Reverts**  
    - With `"INVALID_ADDRESS"` if either `adapter` or `myt` is the zero address.  
  - **Emits**  
    - [`StrategySet(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategySet) - emitted in the internal _setStrategy() call.
</details>
<details id="OperatorActions_submitSetStrategy">
  <summary>submitSetStrategy(address adapter, address myt)</summary>

  - **Description** - Queues the addition of a MYT strategy adapter to a specific MYT vault via the vault’s timelock mechanism to be executed at a later time.<br/><br/>
  	Validates that passed `adapter` and `myt` are valid addresses, delegates to the internal `_submitSetStrategy(adapter, myt)`, which encodes `IVaultV2.addAdapter(adapter)` and calls `vault.submit(data)`, which enqueues the strategy to be added after the timelock period.
    - `@param adapter` - The address of the strategy adapter to be registered.  
    - `@param myt` - The MYT vault address to add the adapter to.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"INVALID_ADDRESS"` if `adapter == address(0)` or `myt == address(0)`.  
  - **Emits**
    - [`SubmitSetStrategy(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_SubmitSetStrategy) - from the internal _submitSetStrategy call
</details>

### Internal Operations

<details id="InternalOperations_setStrategy">
  <summary>_setStrategy(address adapter, address myt, bool remove)</summary>

  - **Description** - Internal helper function used to add or remove a MYT strategy adapter from the specified MYT vault. Called by both [`setStrategy(address, myt)`](/dev/myt/alchemist-curator-contract#OperatorActions_setStrategy) and [`removeStrategy(address, myt)`](/dev/myt/alchemist-curator-contract#OperatorActions_removeStrategy).<br/><br/>
  	First updates the `adapterToMYT` mapping to associate the adapter with the provided MYT vault. Then retrieves the vault reference using the internal [`_vault(adapter)`](/dev/myt/alchemist-curator-contract#InternalActions_vault) function, and finally calls either `vault.removeAdapter(adapter)` to deregister the adapter, or `vault.addAdapter(adapter)` to register it. 
    - `@param adapter` - The address of the MYT strategy adapter being added or removed.  
    - `@param myt` - The address of the MYT vault that the adapter is associated with.  
    - `@param remove` - True/false flag indicating whether to remove or add the adapter.  
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable
  - **Reverts** - none
  - **Emits**  
    - [`StrategySet(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategySet)
</details>
<details id="InternalOperations_submitSetStrategy">
  <summary>_submitSetStrategy(address adapter, address myt)</summary>

  - **Description** - Internal helper that calls the MorphoV2 Vault submit() function, which enqueues the adding of an adapter to the target MYT vault to the vault's timelock queue to be executed at a later time.  
    - `@param adapter` - The address of the strategy adapter to be added.  
    - `@param myt` - The address of the MYT vault to add the strategy to.  
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable
  - **Reverts** - none
  - **Emits**
    - [`SubmitSetStrategy(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_SubmitSetStrategy) 
</details>
<details id="InternalOperations_decreaseAbsoluteCap">
  <summary>_decreaseAbsoluteCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that immediately calls decreases a strategy’s absolute cap on the vault.
    - `@param adapter` - The strategy adapter address.
    - `@param id` - The encoded MYT strategy ID.
    - `@param amount` - The amount denominated in underlying units to decrease the absolute cap by.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `AbsoluteCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`DecreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_DecreaseAbsoluteCap)
</details>
<details id="InternalOperations_submitDecreaseAbsoluteCap">
  <summary>_submitDecreaseAbsoluteCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that enqueues a cap decrease on the MYT vault by encoding `IVaultV2.decreaseAbsoluteCap(id, amount)` and delegating to the internal [`_vaultSubmit(data)`](/dev/myt/alchemist-curator-contract#InternalOperations_vaultSubmit).
    - `@param adapter` - The strategy adapter address (used to resolve its vault).
    - `@param id` - The encoded MYT strategy ID as bytes.
    - `@param amount` - The amount denominated in underlying units to decrease the absolute cap by.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `AbsoluteCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitDecreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitDecreaseAbsoluteCap)
</details>
<details id="InternalOperations_decreaseRelativeCap">
  <summary>_decreaseRelativeCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that calls the `vault.decreaseRelativeCap(id, amount)` to immediately decrease a strategy’s relative cap. The relative cap is the maximum percentage of total assets the strategy can make up. 
    - `@param adapter` - The strategy adapter address
    - `@param id` - The encoded MYT strategy ID  
    - `@param amount` - The new percentage of maximum assets that the strategy can make up. Scaled by 1e18. (1e18 = 100%)
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `RelativeCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`DecreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_DecreaseRelativeCap)
</details>
<details id="Internal_submitDecreaseRelativeCap">
  <summary>_submitDecreaseRelativeCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that enqueues a cap decrease on the MYT vault by encoding `IVaultV2.decreaseRelativeCap(id, amount)` and delegating to the internal [`_vaultSubmit(data)`](/dev/myt/alchemist-curator-contract#InternalOperations_vaultSubmit).
    - `@param adapter` - Strategy adapter address (used to resolve its vault).  
    - `@param id` - Strategy ID blob (`IMYTStrategy.getIdData()`).  
    - `@param amount` - Amount (underlying or relative value basis) to decrease the relative cap by.  
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `RelativeCapNotDecreasing()` - if the new cap is higher than the previous. Propgated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitDecreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitDecreaseRelativeCap) 
</details>
<details id="InternalOperations_increaseAbsoluteCap">
  <summary>_increaseAbsoluteCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that immediately calls `vault.increaseAbsoluteCap(id, amount)` to raise a strategy’s absolute cap. The absolute cap is the maximum quantity of underlying assets that may be allocated to the strategy.  
    - `@param adapter` - The strategy adapter address.  
    - `@param id` - The encoded MYT strategy ID.  
    - `@param amount` - The amount denominated in underlying asset units to increase the absolute cap by.  
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `AbsoluteCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.  
  - **Emits**
    - [`IncreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_IncreaseAbsoluteCap)
</details>
<details id="InternalOperations_increaseRelativeCap">
  <summary>_increaseRelativeCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that immediately calls `vault.increaseRelativeCap(id, amount)` to raise a strategy’s relative cap. The relative cap defines the maximum percentage of the vault’s total assets that the strategy can hold.  
    - `@param adapter` - The strategy adapter address.  
    - `@param id` - The encoded MYT strategy ID.  
    - `@param amount` - The new percentage, expressed as an 18-decimal scaled number (1e18 = 100%), to set as the relative cap. Must be higher than the previous relative cap.  
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `RelativeCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.  
  - **Emits**
    - [`IncreaseRelativeCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_IncreaseRelativeCap)
</details>
<details id="InternalOperations_submitIncreaseAbsoluteCap">
  <summary>_submitIncreaseAbsoluteCap(address adapter, bytes id, uint256 amount)</summary>

  - **Description** - Internal helper that enqueues a cap increase on the MYT vault by encoding `IVaultV2.increaseAbsoluteCap(id, amount)` and delegating to the internal [`_vaultSubmit(data)`](/dev/myt/alchemist-curator-contract#InternalOperations_vaultSubmit).
    - `@param adapter` - The strategy adapter address.
    - `@param id` - The encoded MYT strategy ID.
    - `@param amount` - The amount denominated in underlying asset units to increase the absolute cap by.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `AbsoluteCapNotIncreasing()` - if the new cap is lower than the previous. Propagated from the MorphoV2 vault call.
  - **Emits**
    - [`SubmitIncreaseAbsoluteCap(address adapter, uint256 amount, bytes id)`](/dev/myt/alchemist-curator-contract#Events_SubmitIncreaseAbsoluteCap)
</details>
<details id="InternalOperations_vaultSubmit">
  <summary>_vaultSubmit(address adapter, bytes data)</summary>

  - **Description** - Internal helper that resolves the MYT vault associated with the provided adapter and calls its `submit(bytes)` function to queue a governance action via the vault’s timelock.
    - `@param adapter` - The strategy adapter address, used to look up its corresponding MYT vault.  
    - `@param data` - The ABI-encoded function to be submitted to the vault.  
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - With `"INVALID_ADDRESS"` if the adapter has no registered MYT vault in the `adapterToMYT` mapping. 
  - **Emits** - none
</details>
<details id="InternalOperations_vault">
  <summary>_vault(address adapter)</summary>

  - **Description** - Internal helper that retrieves the MYT vault contract associated with a given strategy adapter from the `adapterToMYT` mapping.
    - `@param adapter` - The strategy adapter address.
  - **Visibility Specifier** - internal  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - `"INVALID_ADDRESS"` - if there is no MYT vault registered for the specified adapter in `adapterToMYT`.
  - **Emits** - none
</details>

## Events

* <span id="Events_IncreaseAbsoluteCap"><strong><code>IncreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the absolute cap for a strategy has been increased. The absolute cap represents the maximum quantity of underlying assets that may be allocated to the strategy.</span>  
* <span id="Events_SubmitIncreaseAbsoluteCap"><strong><code>SubmitIncreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when an increase to the strategy’s absolute cap has been queued via the vault’s timelock, to be executed later.</span>  
* <span id="Events_IncreaseRelativeCap"><strong><code>IncreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the relative cap for a strategy has been increased. The relative cap defines the maximum percentage of the vault’s total assets that the strategy can hold, scaled by 1e18 (1e18 = 100%).</span>  
* <span id="Events_SubmitIncreaseRelativeCap"><strong><code>SubmitIncreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when an increase to the strategy’s relative cap has been queued via the vault’s timelock, to be executed later.</span>  
* <span id="Events_OperatorChanged"><strong><code>OperatorChanged(address indexed operator)</code></strong> - emitted when the contract’s operator address is updated.</span>  
* <span id="Events_AdminChanged"><strong><code>AdminChanged(address indexed admin)</code></strong> - emitted when the contract’s admin address is updated.</span>
* <span id="Events_DecreaseRelativeCap"><strong><code>DecreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the relative cap for a strategy has been decreased. The relative cap defines the maximum percentage of the vault’s total assets that the strategy can hold, scaled by 1e18 (1e18 = 100%).</span>  
* <span id="Events_SubmitDecreaseRelativeCap"><strong><code>SubmitDecreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when a decrease to the strategy’s relative cap has been queued via the vault’s timelock, to be executed later.</span>  
* <span id="Events_StrategySet"><strong><code>StrategySet(address indexed strategy, address indexed myt)</code></strong> - emitted when a strategy adapter has been added to or removed from the specified MYT vault.</span>  
* <span id="Events_SubmitSetStrategy"><strong><code>SubmitSetStrategy(address indexed strategy, address indexed myt)</code></strong> - emitted when a strategy adapter has been queued for addition to a MYT vault via the vault’s timelock mechanism.</span>  
* <span id="Events_DecreaseAbsoluteCap"><strong><code>DecreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the absolute cap for a strategy has been decreased. The absolute cap represents the maximum quantity of underlying assets that may be allocated to the strategy.</span>  
* <span id="Events_SubmitDecreaseAbsoluteCap"><strong><code>SubmitDecreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when a decrease to the strategy’s absolute cap has been queued via the vault’s timelock, to be executed later.</span>