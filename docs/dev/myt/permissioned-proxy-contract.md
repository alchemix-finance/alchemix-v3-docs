---
sidebar_position: 6
hide_title: true
title: PermissionedProxy
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="PermissionedProxy" />

## Description

`PermissionedProxy` is a minimal access-control contract. It defines a single admin, an operator allowlist, and a selector allowlist controlling which functions can be forwarded via `proxy()`. Meant to be inherited by other contracts. 

## Variables

<details>
  <summary>admin</summary>

  - **Description** - The admin with ability to perform any action, including transferring admin ownership, managing operators, and managing the selector allowlist.
  - **Type** - `address`
  - **Visibility** - internal
  - **Used By**
    - `onlyAdmin`
  - **Updated By**
    - [`acceptAdminOwnership()`](/dev/myt/permissioned-proxy-contract#AdminActions_acceptAdminOwnership)
</details>
<details>
  <summary>pendingAdmin</summary>

  - **Description** - The first step in a two-step process to transfer admin ownership. The current admin sets a pendingAdmin, then the pendingAdmin must call `acceptAdminOwnership()` to complete the transfer.
  - **Type** - `address`
  - **Used By**
    - [`acceptAdminOwnership()`](/dev/myt/permissioned-proxy-contract#AdminActions_acceptAdminOwnership)
  - **Updated By**
    - [`transferAdminOwnerShip(address _newAdmin)`](/dev/myt/permissioned-proxy-contract#AdminActions_transferAdminOwnerShip)
    - [`acceptAdminOwnership()`](/dev/myt/permissioned-proxy-contract#AdminActions_acceptAdminOwnership)
  - **Read By**
    - `pendingAdmin()`
</details>
<details>
  <summary>operators</summary>

  - **Description** - A mapping of addresses to operator status. Each address in the mapping that maps to true is enabled as an operator.
  - **Type** - `mapping(address => bool)`
  - **Visibility** - internal (no public getter)
  - **Used By**
    - `onlyOperator`
  - **Updated By**
    - [`setOperator(address _operator, bool value)`](/dev/myt/permissioned-proxy-contract#AdminActions_setOperator)
</details>
<details>
  <summary>permissionedCalls</summary>

  - **Description** - A mapping of function selectors to true/false values. If the mapping of a function selector is true, then the proxied call is allowed for that function. Selectors must be explicitly enabled before they can be forwarded via `proxy()`.
  - **Type** - `mapping(bytes4 => bool)`
  - **Visibility** - internal
  - **Used By**
    - [`proxy(address vault, bytes data)`](/dev/myt/permissioned-proxy-contract#OperatorActions_proxy)
  - **Updated By**
    - [`setPermissionedCall(bytes4 sig, bool value)`](/dev/myt/permissioned-proxy-contract#AdminActions_setPermissionedCall)
</details>

## Modifiers

<details id="Modifiers_onlyAdmin">
  <summary>onlyAdmin</summary>

  - **Description** - Restricts function execution to the `admin` address.
  - **Reverts**
    - With `"PD"` if `msg.sender != admin`.
</details>

<details id="Modifiers_onlyOperator">
  <summary>onlyOperator</summary>

  - **Description** - Restricts function execution to addresses with `operators[msg.sender] == true`. 
  - **Reverts**
    - With `"PD"` if `operators[msg.sender] != true`.
</details>

## Functions

### Admin Actions

<details id="AdminActions_transferAdminOwnerShip">
  <summary>transferAdminOwnerShip(address _newAdmin)</summary>

  - **Description** - Sets the pending admin to a new address. First step of a two-step admin transfer process. The pending admin must then call `acceptAdminOwnership()` to complete the transfer.
    - `@param _newAdmin` - The address to set as the pending admin.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Access Control** - `onlyAdmin`
  - **Emits** - none
  - **Reverts** - none
</details>
<details id="AdminActions_acceptAdminOwnership">
  <summary>acceptAdminOwnership()</summary>

  - **Description** - Completes the two-step admin transfer. Can only be called by the current `pendingAdmin`. Sets `admin` to the caller and clears `pendingAdmin`.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"PD"` if `msg.sender != pendingAdmin`.
  - **Emits**
    - [`AdminUpdated(address admin)`](/dev/myt/permissioned-proxy-contract#Events_AdminUpdated)
</details>
<details id="AdminActions_setOperator">
  <summary>setOperator(address _operator, bool value)</summary>

  - **Description** - Adds or removes an address from the operator allowlist.
    - `@param _operator` - Address to update.
    - `@param value` - `true` to enable as an operator, `false` to disable as an operator.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Access Control** - `onlyAdmin`
  - **Reverts**
    - With `"zero"` if `_operator == address(0)`.
  - **Emits**
    - [`OperatorUpdated(address operator)`](/dev/myt/permissioned-proxy-contract#Events_OperatorUpdated)
</details>
<details id="AdminActions_setPermissionedCall">
  <summary>setPermissionedCall(bytes4 sig, bool value)</summary>

  - **Description** - Marks a function selector as allowed (`true`) or disallowed (`false`) for `proxy()` forwarding.
    - `@param sig` - The function selector to modify.
    - `@param value` - `true` to allow proxied calls for this selector, `false` to disallow.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Access Control** - `onlyAdmin`
  - **Emits**
    - [`AddedPermissionedCall(bytes4 sig)`](/dev/myt/permissioned-proxy-contract#Events_AddedPermissionedCall)
</details>

### Operator Actions

<details id="OperatorActions_proxy">
  <summary>proxy(address vault, bytes data)</summary>

  - **Description** - Forwards a call to the `vault` with the passed `data`. The function selector must be explicitly enabled in the `permissionedCalls` allowlist. ETH is also forwarded.
    - `@param vault` - The address of the vault contract to call.
    - `@param data` - ABI-encoded calldata indicating the selector of the function to call on the vault.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - payable
  - **Access Control** - `onlyOperator`
  - **Reverts**
    - With `"SEL"` if `data.length < 4`.
    - With `"PD"` if the selector is not enabled in the allowlist.
    - With `"failed"` if the forwarded call returns `success == false`.
  - **Emits** - none
</details>

## Events

* <span id="Events_AdminUpdated"><strong><code>AdminUpdated(address indexed admin)</code></strong> - emitted when the admin address is updated via `acceptAdminOwnership()`.</span>  
* <span id="Events_OperatorUpdated"><strong><code>OperatorUpdated(address indexed operator)</code></strong> - emitted when an operator address is added or removed.</span>  
* <span id="Events_AddedPermissionedCall"><strong><code>AddedPermissionedCall(bytes4 indexed sig)</code></strong> - emitted when a function selector's allowlist status is updated.</span>