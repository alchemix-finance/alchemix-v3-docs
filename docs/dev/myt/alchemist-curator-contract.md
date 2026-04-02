---
sidebar_position: 5
---

# AlchemistCurator

## Description

AlchemistCurator is the governance and configuration contract for MYT vaults. It allows admins and operators to register or remove strategy adapters for a given MYT and to adjust their absolute and relative caps. In short, it defines which strategies exist within the MYT and how much capital each can hold.<br/><br/>
**Note:** AlchemistCurator inherits from PermissionedProxy, which provides it's access control system for operator roles, and the selector allowlist used to control which calls can be forwarded. The admin role is set using the same pending/accept admin system as the Alchemist and is inherited from PermissionedProxy. For details on the operator role and logic, see PermissionedProxy.

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
  - [`transferAdminOwnerShip(address _newAdmin)`](/dev/myt/alchemist-curator-contract#AdminActions_transferAdminOwnerShip) (inherited from PermissionedProxy)
- **Read By**
  - `pendingAdmin()`
- **Notified By** - none
</details>

## Functions

### Admin Actions

<details id="AdminActions_transferAdminOwnerShip">
  <summary>transferAdminOwnerShip(address _newAdmin)</summary>

  - **Description** - Sets the pending admin. First part of a two-step process to change the admin. The second step is the pendingAdmin accepting the role by calling `acceptAdminOwnership()`. Inherited from PermissionedProxy.
    - `@param _newAdmin` - The address proposed to become the new admin.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**  
    - With `"PD"` if `msg.sender` is not the current admin.  
  - **Emits** - none
</details>
<details id="AdminActions_acceptAdminOwnership">
  <summary>acceptAdminOwnership()</summary>

  - **Description** - Finalizes an admin ownership transfer by assigning `pendingAdmin` as the new active admin. Afterwards the `pendingAdmin` is reset to the zero address. Inherited from PermissionedProxy.
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**  
    - With `"PD"` if `msg.sender` is not the current `pendingAdmin`.
  - **Emits**  
    - [`AdminChanged(address newAdmin)`](/dev/myt/alchemist-curator-contract#Events_AdminChanged)  
</details>
<details id="AdminActions_submitSetAllocator">
  <summary>submitSetAllocator(address myt, address allocator, bool v)</summary>

  - **Description** - Queues a change to a vault's allocator permissions via the vault's timelock mechanism. Encodes `IVaultV2.setIsAllocator(allocator, v)` and submits it directly to the specified MYT vault.
    - `@param myt` - The MYT vault address to submit the allocator change to.
    - `@param allocator` - The address to set or unset as a vault allocator.
    - `@param v` - `true` to enable as an allocator, `false` to disable.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts** - none
  - **Emits**
    - [`SubmitSetAllocator(address allocator, bool v)`](/dev/myt/alchemist-curator-contract#Events_SubmitSetAllocator)
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
    First runs address validity checks, then offloads to the internal [`_addStrategy(adapter, myt)`](/dev/myt/alchemist-curator-contract#InternalOperations_addStrategy) to register the MYT strategy with the vault as an active strategy.
    - `@param adapter` - The address of the MYT strategy adapter to register.  
    - `@param myt` - The address of the MYT vault that the adapter belongs to.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"INVALID_ADDRESS"` if either `adapter` or `myt` is the zero address.  
  - **Emits**  
    - [`StrategyAdded(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategyAdded) - emitted in the internal `_addStrategy()` call.
</details>
<details id="OperatorActions_removeStrategy">
  <summary>removeStrategy(address adapter, address myt)</summary>

  - **Description** - Deregisters a MYT strategy adapter from the specified MYT vault.<br/><br/>  
    First runs address validity checks, then offloads to the internal [`_removeStrategy(adapter, myt)`](/dev/myt/alchemist-curator-contract#InternalOperations_removeStrategy) to deregister the MYT strategy from the vault as an active strategy.
    - `@param adapter` - The address of the MYT strategy adapter to remove.  
    - `@param myt` - The address of the MYT vault that the adapter is currently linked to.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable 
  - **Reverts**  
    - With `"INVALID_ADDRESS"` if either `adapter` or `myt` is the zero address.  
  - **Emits**  
    - [`StrategyRemoved(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategyRemoved) - emitted in the internal `_removeStrategy()` call.
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
<details id="OperatorActions_submitRemoveStrategy">
  <summary>submitRemoveStrategy(address adapter, address myt)</summary>

  - **Description** - Queues the removal of a MYT strategy adapter from a specific MYT vault via the vault's timelock mechanism, to be executed at a later time.<br/><br/>
    Validates that `adapter` and `myt` are valid addresses, then delegates to the internal `_submitRemoveStrategy(adapter, myt)`, which encodes `IVaultV2.removeAdapter(adapter)` and calls `vault.submit(data)`.
    - `@param adapter` - The address of the strategy adapter to be removed.
    - `@param myt` - The MYT vault address to remove the adapter from.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"INVALID_ADDRESS"` if `adapter == address(0)` or `myt == address(0)`.
  - **Emits**
    - [`SubmitRemoveStrategy(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_SubmitRemoveStrategy) - from the internal `_submitRemoveStrategy` call
</details>

### Internal Operations

<details id="InternalOperations_addStrategy">
  <summary>_addStrategy(address adapter, address myt)</summary>

  - **Description** - Internal helper that registers a MYT strategy adapter with the specified MYT vault. Updates the `adapterToMYT` mapping to associate the adapter with the provided vault, then calls `vault.addAdapter(adapter)` to register it.
    - `@param adapter` - The address of the MYT strategy adapter being added.
    - `@param myt` - The address of the MYT vault that the adapter is being registered to.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Reverts** - none
  - **Emits**
    - [`StrategyAdded(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategyAdded)
</details>
<details id="InternalOperations_removeStrategy">
  <summary>_removeStrategy(address adapter, address myt)</summary>

  - **Description** - Internal helper that deregisters a MYT strategy adapter from the specified MYT vault. Calls `vault.removeAdapter(adapter)` to deregister the adapter, then deletes the adapter's entry from the `adapterToMYT` mapping.
    - `@param adapter` - The address of the MYT strategy adapter being removed.
    - `@param myt` - The address of the MYT vault that the adapter is being removed from.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Reverts** - none
  - **Emits**
    - [`StrategyRemoved(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_StrategyRemoved)
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
<details id="InternalOperations_submitRemoveStrategy">
  <summary>_submitRemoveStrategy(address adapter, address myt)</summary>

  - **Description** - Internal helper that encodes `IVaultV2.removeAdapter(adapter)` and submits it to the MYT vault's timelock queue for later execution.
    - `@param adapter` - The address of the strategy adapter to be removed.
    - `@param myt` - The address of the MYT vault to remove the strategy from.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Reverts** - none
  - **Emits**
    - [`SubmitRemoveStrategy(address adapter, address myt)`](/dev/myt/alchemist-curator-contract#Events_SubmitRemoveStrategy)
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
  - **State Mutability Specifier** - view
  - **Reverts**
    - `"INVALID_ADDRESS"` - if there is no MYT vault registered for the specified adapter in `adapterToMYT`.
  - **Emits** - none
</details>

## Events

* <span id="Events_IncreaseAbsoluteCap"><strong><code>IncreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the absolute cap for a strategy has been increased. The absolute cap represents the maximum quantity of underlying assets that may be allocated to the strategy.</span>  
* <span id="Events_SubmitIncreaseAbsoluteCap"><strong><code>SubmitIncreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when an increase to the strategy’s absolute cap has been queued via the vault’s timelock, to be executed later.</span>  
* <span id="Events_IncreaseRelativeCap"><strong><code>IncreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the relative cap for a strategy has been increased. The relative cap defines the maximum percentage of the vault’s total assets that the strategy can hold, scaled by 1e18 (1e18 = 100%).</span>  
* <span id="Events_SubmitIncreaseRelativeCap"><strong><code>SubmitIncreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when an increase to the strategy’s relative cap has been queued via the vault’s timelock, to be executed later.</span>  
* <span id="Events_AdminUpdated"><strong><code>AdminUpdated(address indexed admin)</code></strong> - emitted when the contract's admin address is updated. Inherited from PermissionedProxy.</span>
* <span id="Events_DecreaseRelativeCap"><strong><code>DecreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the relative cap for a strategy has been decreased. The relative cap defines the maximum percentage of the vault’s total assets that the strategy can hold, scaled by 1e18 (1e18 = 100%).</span>  
* <span id="Events_SubmitDecreaseRelativeCap"><strong><code>SubmitDecreaseRelativeCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when a decrease to the strategy’s relative cap has been queued via the vault’s timelock, to be executed later.</span>  
* <span id="Events_SubmitSetStrategy"><strong><code>SubmitSetStrategy(address indexed strategy, address indexed myt)</code></strong> - emitted when a strategy adapter has been queued for addition to a MYT vault via the vault’s timelock mechanism.</span>  
* <span id="Events_DecreaseAbsoluteCap"><strong><code>DecreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when the absolute cap for a strategy has been decreased. The absolute cap represents the maximum quantity of underlying assets that may be allocated to the strategy.</span>  
* <span id="Events_SubmitDecreaseAbsoluteCap"><strong><code>SubmitDecreaseAbsoluteCap(address indexed strategy, uint256 amount, bytes indexed id)</code></strong> - emitted when a decrease to the strategy’s absolute cap has been queued via the vault’s timelock, to be executed later.</span>
* <span id="Events_StrategyAdded"><strong><code>StrategyAdded(address indexed strategy, address indexed myt)</code></strong> - emitted when a strategy adapter has been registered to the specified MYT vault.</span>
* <span id="Events_StrategyRemoved"><strong><code>StrategyRemoved(address indexed strategy, address indexed myt)</code></strong> - emitted when a strategy adapter has been deregistered from the specified MYT vault.</span>
* <span id="Events_SubmitRemoveStrategy"><strong><code>SubmitRemoveStrategy(address indexed strategy, address indexed myt)</code></strong> - emitted when a strategy adapter removal has been queued via the vault's timelock mechanism.</span>
* <span id="Events_SubmitSetAllocator"><strong><code>SubmitSetAllocator(address indexed allocator, bool indexed v)</code></strong> - emitted when a vault allocator permission change has been queued via the vault's timelock mechanism.</span>
