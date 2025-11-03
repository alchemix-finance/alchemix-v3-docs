---
sidebar_position: 4
---

# AlchemistAllocator

## Description

The AlchemistAllocator is a role-gated front controller for a specific Morpho V2 vault, allowing admins or operators to call `allocate(adapter, amount)` or `deallocate(adapter, amount)` and rebalance the allocations within the MYT.
Once calls to alloacte/deallocate are made, the MYT vault contract invokes individaul adapter’s (see MYTStrategy) allocate/deallocate functions to move funds in/out of individual strategies that comprise the MYT.<br/><br/>
**Note:** AlchemistAllocator inherits from PermissionedProxy, which provides it's access control system (admin and operator roles) and the deny-list used to restrict certain calls. For details on these variables and functions, see PermissionedProxy.

## Variables

<details>
  <summary>vault</summary>

  - **Description** - The immutable reference to the Morpho V2 vault that this allocator manages. All allocation and deallocation actions are performed through this vault.
  - **Type** - `IVaultV2`
  - **Used By**
    - [`allocate(address adapter, uint256 amount)`](/dev/myt/alchemist-allocator-contract#AdminActions_allocate)
    - [`deallocate(address adapter, uint256 amount)`](/dev/myt/alchemist-allocator-contract#AdminActions_deallocate)
  - **Updated By**
    - `constructor(address _vault, address _admin, address _operator)`
</details>

## Functions

<details id="AdminActions_allocate">
  <summary>allocate(address adapter, uint256 amount)</summary>

  - **Description** - Allocates funds from the connected Morpho V2 vault into a specific MYT strategy adapter. Callable only by the `admin` or an approved `operator`.<br/><br/>
	First fetches the adapter’s ID, then reads caps from the vault, encodes the adapter’s current allocation state, and calls `vault.allocate(adapter, oldAllocation, amount)`. This will call the individual strategy adapters allocate function under the hood. 
    - `@param adapter` - The address of the MYT strategy adapter to allocate funds to.  
    - `@param amount` - The amount of vault assets to allocate to the adapter. Denominated in the underlying erc20 token backing the vault.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is not authorized to make this call. (is not an admin or operator)  
    - With `"IV"` if the vault address is invalid.
  - **Emits** - none  
</details>
<details id="AdminActions_deallocate">
  <summary>deallocate(address adapter, uint256 amount)</summary>

  - **Description** - Deallocates funds from a specific MYT strategy adapter back to the Morpho V2 vault. Callable only by the `admin` or an approved `operator`.<br/><br/>
	First fetches the adapter’s ID, then reads caps from the vault, encodes the adapter’s current allocation state, and calls `vault.deallocate(adapter, oldAllocation, amount)`. This will call the individual strategy adapters deallocate function under the hood. 
    - `@param adapter` - The address of the MYT strategy adapter to withdraw funds from.  
    - `@param amount` - The amount of vault assets to deallocate (withdraw) from the adapter.  Denominated in the underlying erc20 token backing the vault. 
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender` is neither the admin nor an active operator.  
  - **Emits** - none
</details>






