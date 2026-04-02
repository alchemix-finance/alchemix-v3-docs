---
sidebar_position: 7
---

# AlchemistStrategyClassifier

## Description

This contract defines risk classes and their caps, and maps each strategy to a risk level. Referenced by the AlchemistAllocator during allocation calls to enforce DAO-defined boundaries around risk management.

## Risk Class

> A struct that defines a risk class

<details>
  <summary>globalCap</summary>

  - **Description** - Max combined allocation across all strategies of this risk class.
  - **Type** - `uint256`
  - **Used By**
    - `getGlobalCap()`
</details>
<details>
  <summary>localCap</summary>

  - **Description** - Max allocation for a single strategy in the risk class.
  - **Type** - `uint256`
  - **Used By**
    - `getIndividualCap()`
</details>

## Variables

<details>
  <summary>admin</summary>

  - **Description** - The current admin. Only this address can modify caps and assignments.  
  - **Type** - `address`
  - **Updated By**
    - [`acceptOwnership()`](/dev/myt/alchemist-strategy-classifier-contract#AdminActions_acceptOwnership)
  - **Read By**
    - `admin()`
</details>
<details>
  <summary>pendingAdmin</summary>

  - **Description** - The first step in a two-step process of setting a new administrator. The pendingAdmin is set by the current admin, then the pendingAdmin must accept the responsibility to lock in the change of admin. 
  - **Type** - `address`
  - **Updated By**
    - [`transferOwnership(address _newAdmin)`](/dev/myt/alchemist-strategy-classifier-contract#AdminActions_transferOwnership)
    - [`acceptOwnership()`](/dev/myt/alchemist-strategy-classifier-contract#AdminActions_acceptOwnership)
  - **Read By**
    - `pendingAdmin()`
</details>
<details>
  <summary>riskClasses</summary>

  - **Description** - Mapping from riskLevel ID to a Risk Class. Initialized on deployment with three default risk levels (0 = Low, 1 = Medium, 2 = High), each with caps set to `type(uint256).max`.
  - **Type** - `mapping(uint8 => RiskClass)`
  - **Updated By**
    - [`setRiskClass(uint8 classId, uint256 globalCap, uint256 localCap)`](/dev/myt/alchemist-strategy-classifier-contract#RiskClassManagement_setRiskClass)
  - **Read By**
    - [`getGlobalCap(uint8 riskLevel)`](/dev/myt/alchemist-strategy-classifier-contract#ReadingState_getGlobalCap)
    - [`getIndividualCap(uint256 strategyId)`](/dev/myt/alchemist-strategy-classifier-contract#ReadingState_getIndividualCap)
</details>
<details>
  <summary>strategyRiskLevel</summary>

  - **Description** - Mapping of strategyID to riskLevel, used to look up caps for a strategy.  
  - **Type** - `mapping(uint256 => uint8)`
  - **Updated By**
    - [`assignStrategyRiskLevel(uint256 strategyId, uint8 riskLevel)`](/dev/myt/alchemist-strategy-classifier-contract#RiskClassManagement_assignStrategyRiskLevel)
  - **Read By**
    - [`getStrategyRiskLevel(uint256 strategyId)`](/dev/myt/alchemist-strategy-classifier-contract#ReadingState_getStrategyRiskLevel)
    - [`getIndividualCap(uint256 strategyId)`](/dev/myt/alchemist-strategy-classifier-contract#ReadingState_getIndividualCap)
</details>

## Functions

### Admin Actions

> Functions that can only be called by the current admin. Attempts to call using other addresses will revert with a message of `PD`.

<details id="AdminActions_transferOwnership">
  <summary>transferOwnership(address _newAdmin)</summary>

  - **Description** - Sets the pending admin. First part of a two-step process to change the admin. The second step is the pendingAdmin accepting the role by calling acceptOwnership. 
    - `@param _newAdmin` - Address of the new pendingAdmin.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the current admin.
  - **Emits** - none
</details>
<details id="AdminActions_acceptOwnership">
  <summary>acceptOwnership()</summary>

  - **Description** - Can only be called by the current `pendingAdmin`. Used to accept the admin role.
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the current `pendingAdmin`.
  - **Emits**
    - [`AdminChanged(address admin)`](/dev/myt/alchemist-strategy-classifier-contract#Events_AdminChanged)
</details>
<details id="RiskClassManagement_setRiskClass">
  <summary>setRiskClass(uint8 classId, uint256 globalCap, uint256 localCap)</summary>

  - **Description** - Sets caps for a given risk class.  
    - `@param classId` - The risk class ID.  
    - `@param globalCap` - Max combined allocation for all strategies in this class.  
    - `@param localCap` - Max allocation for a single strategy in this class.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the current admin.
  - **Emits**
    - [`RiskClassModified(uint256 classId, uint256 globalCap, uint256 localCap)`](/dev/myt/alchemist-strategy-classifier-contract#Events_RiskClassModified)
</details>
<details id="RiskClassManagement_assignStrategyRiskLevel">
  <summary>assignStrategyRiskLevel(uint256 strategyId, uint8 riskLevel)</summary>

  - **Description** - Assigns a risk level to a strategy.  
    - `@param strategyId` - The strategy ID.  
    - `@param riskLevel` - Risk level to assign.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - nonpayable  
  - **Reverts**
    - With `"PD"` if `msg.sender` is not the current admin.
  - **Emits** - none
</details>

### Reading State

> Reads derived, calculated, or internal state.

<details id="ReadingState_getIndividualCap">
  <summary>getIndividualCap(uint256 strategyId)</summary>

  - **Description** - Returns the local cap for the strategy's assigned risk class. The local cap is the max allocation for a single strategy in the risk class.
    - `@param strategyId` - The strategy identifier.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - view
</details>
<details id="ReadingState_getGlobalCap">
  <summary>getGlobalCap(uint8 riskLevel)</summary>

  - **Description** - Returns the global cap for the specified risk class. The global cap is the max combined allocation for strategies in a risk class.
    - `@param riskLevel` - Risk class ID.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - view
</details>
<details id="ReadingState_getStrategyRiskLevel">
  <summary>getStrategyRiskLevel(uint256 strategyId)</summary>

  - **Description** - Returns the risk level currently assigned to a strategy.  
    - `@param strategyId` - The strategy identifier.  
  - **Visibility Specifier** - external  
  - **State Mutability Specifier** - view
</details>

## Events

* <span id="Events_AdminChanged"><strong><code>AdminChanged(address indexed admin)</code></strong> - emitted when `admin` is updated via `acceptOwnership`.</span>  
* <span id="Events_RiskClassModified"><strong><code>RiskClassModified(uint256 indexed class, uint256 indexed globalCap, uint256 indexed localCap)</code></strong> - emitted when a risk class's caps are updated.</span>