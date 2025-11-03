---
sidebar_position: 6
---

# PermissionedProxy

## Description

`PermissionedProxy` is a minimal access-control contract. It defines a single admin, an operator allowlist, and a deny-list of function selectors. Meant to be inherited by other contracts. 

## Variables

<details>
  <summary>admin</summary>

  - **Description** - The admin with ability to perform any action, including setting a new admin admin, managing operators, and managing the deny-list.
  - **Type** - `address`
  - **Used By**
    - `onlyAdmin`
  - **Updated By**
    - [`setAdmin(address _admin)`](/dev/myt/permissioned-proxy-contract#AdminActions_setAdmin)
  - **Read By**
    - `admin()`
</details>
<details>
  <summary>operators</summary>

  - **Description** - A mapping of addresses to operator status. Each address in the mapping that maps to true is enabled as an operator.
  - **Type** - `mapping(address => bool)`
  - **Used By**
    - `onlyOperator`
  - **Updated By**
    - [`setOperator(address _operator, bool value)`](/dev/myt/permissioned-proxy-contract#AdminActions_setOperator)
  - **Read By**
    - `operators(address)`
</details>
<details>
  <summary>permissionedCalls</summary>

  - **Description** - A mapping of function selectors to true/false value. If the mapping of a function selector is true, then the proxied call is not allowed for that function.
  - **Type** - `mapping(bytes4 => bool)`
  - **Used By**
    - [`proxy(address vault, bytes data)`](/dev/myt/permissioned-proxy-contract#AdminActions_proxy)
  - **Updated By**
    - [`setPermissionedCall(bytes4 sig, bool value)`](/dev/myt/permissioned-proxy-contract#AdminActions_setPermissionedCall)
  - **Read By**
    - `permissionedCalls(bytes4)`
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

<details id="AdminActions_setAdmin">
  <summary>setAdmin(address _admin)</summary>

  - **Description** - Sets the admin to a new address.
    - `@param _admin` - The new admin address.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"zero"` if `_admin == address(0)`.
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
  - **Reverts**
    - With `"zero"` if `_operator == address(0)`.
  - **Emits**
    - [`OperatorUpdated(address operator)`](/dev/myt/permissioned-proxy-contract#Events_OperatorUpdated)
</details>
<details id="AdminActions_setPermissionedCall">
  <summary>setPermissionedCall(bytes4 sig, bool value)</summary>

  - **Description** - Marks a function selector as denied (`true`) or allowed (`false`) for `proxy(...)` forwarding.
    - `@param sig` - The function selector to modify.
    - `@param value` - A true/false value. `true` to disable proxied calls, `false` to allow proxied calls.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Emits**
    - [`AddedPermissionedCall(bytes4 sig)`](/dev/myt/permissioned-proxy-contract#Events_AddedPermissionedCall)
</details>
<details id="AdminActions_proxy">
  <summary>proxy(address vault, bytes data)</summary>

  - **Description** - Forwards a call to the `vault` with the passed `data`. The function must not be disabled for proxied calls through the deny list. ETH is also forwarded.
    - `@param vault` - The address of the vault contract to call.
    - `@param data` - ABI-encoded calldata indiciating the selector of the function to call on the vault.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - payable
  - **Access Control** - `onlyAdmin`
  - **Reverts**
    - With `"SEL"` if `data.length < 4`.
    - With `"PD"` if the selector is on the deny list.
    - With `"failed"` if the forwarded call returns `success == false`.
  - **Emits** - none
</details>

## Events

* <span id="Events_AdminUpdated"><strong><code>AdminUpdated(address indexed admin)</code></strong> - emitted when the admin address is updated.</span>  
* <span id="Events_OperatorUpdated"><strong><code>OperatorUpdated(address indexed operator)</code></strong> - emitted when an operator address is added or removed.</span>  
* <span id="Events_AddedPermissionedCall"><strong><code>AddedPermissionedCall(bytes4 indexed sig)</code></strong> - emitted when a function selector’s deny list status is updated.</span>






