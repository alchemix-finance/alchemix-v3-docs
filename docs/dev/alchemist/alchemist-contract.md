---
sidebar_position: 1
hide_title: true
title: AlchemistV3
---

import alchemist from '@site/static/img/alchemist-01.png';

<img src={alchemist} alt="AlchemistV3" class="banner-spacing" />

The Alchemist is the vault contract responsible for accepting deposits and issuing debt. It stores and tracks user accounts, earmarking and redemptions, and allows users to deposit, withdraw, and repay against their positions. Every Alchemist is associated with one Transmuter, one debt asset, (alAsset) and one MYT (yield strategy).

## Variables

### Initialization Parameters

> Set on contract deployment, configuring basic params for the Alchemist.

#### Addresses

<details>
  <summary>admin</summary>

- **Description** - The initial admin account. Can be used to perform any admin/guardian action.
- **Type** - Address
- **Used By**
  - [Admin Actions](/dev/alchemist/alchemist-contract#admin-actions)
  - [Guardian Actions](/dev/alchemist/alchemist-contract#guardian-actions)
- **Updated By**
  - [`acceptAdmin()`](/dev/alchemist/alchemist-contract#UserActions_acceptAdmin)
- **Read By** - `admin()`
</details>
<details>
  <summary>debtToken</summary>

- **Description** - the address of the ERC20 token used to represent debt. i.e. the alAsset.
- **Type** - Address
- **Used By**
  - [`underlyingConversionFactor`](/dev/alchemist/alchemist-contract#Variables_underlyingConversionFactor)
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`_mint(uint256 tokenId, uint256 amount, address recipient)`](/dev/alchemist/alchemist-contract#InternalOperations_mint)
- **Updated By**
  - NONE - immutable variable
- **Read By** - `debtToken()`
</details>
<details>
  <summary>underlyingToken</summary>

- **Description** - The address of the ERC20 base token/mirrored asset address; ie. USDC or WETH
- **Type** - Address
- **Used By**
  - [`underlyingConversionFactor`](/dev/alchemist/alchemist-contract#Variables_underlyingConversionFactor)
  - [`setAlchemistFeeVault(address value)`](/dev/alchemist/alchemist-contract#AdminActions_setAlchemistFeeVault)
- **Updated By**
  - NONE - immutable variable
- **Read By** - `underlyingToken()`
</details>
<details>
  <summary>yieldToken</summary>

- **Description** - the address of the yield token (MYT) being deposited into this contract. Actions against the contract (withdraw, deposit, etc.) operate on yield tokens.
- **Type** - Address
- **Used By**
  - [`setDepositCap(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setDepositCap)
  - `setTransmuter(address value)`
  - [`getTotalDeposited()`](/dev/alchemist/alchemist-contract#ReadingState_getTotalDeposited)
  - [`deposit(uint256 amount, address recipient, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
  - [`withdraw(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`convertYieldTokensToUnderlying(uint256 amount)`](/dev/alchemist/alchemist-contract#ReadingState_convertYieldTokensToUnderlying)
  - [`convertUnderlyingTokensToYield(uint256 amount)`](/dev/alchemist/alchemist-contract#ReadingState_convertUnderlyingTokensToYield)
  - [`_forceRepay(uint256 accountId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_forceRepay)
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`_getTotalUnderlyingValue()`](/dev/alchemist/alchemist-contract#ReadingState_getTotalUnderlyingValue)
- **Updated By**
  - NONE - immutable variable
- **Read By** - `yieldToken()`
</details>
<details>
  <summary>tokenAdapter</summary>

- **Description** - token adapter used to get price for yield tokens.
- **Type** - Address
- **Used By**
  - [`convertYieldTokensToUnderlying(uint256 amount)`](/dev/alchemist/alchemist-contract#ReadingState_convertYieldTokensToUnderlying)
  - [`convertUnderlyingTokensToYield(uin256 amount)`](/dev/alchemist/alchemist-contract#ReadingState_convertUnderlyingTokensToYield)
- **Updated By**
  - [`setTokenAdapter(address value)`](/dev/alchemist/alchemist-contract#AdminActions_setTokenAdapter)
- **Read By**
  - `tokenAdapter()`
- **Notified By** - [`TokenAdapterUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_TokenAdapterUpdated)
</details>
<details>
  <summary>transmuter</summary>

- **Description** - address of the transmuter linked to this alchemist. Transmuter seizes collateral (denominated in yieldTokens) from the Alchemist to cover term obligations
- **Type** - Address
- **Used By**
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [Transmuter Actions`](/dev/alchemist/alchemist-contract#transmuter-actions)
  - [`deposit(uint256 amount, address recipient, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
  - [`withdraw(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`_liquidate(uint256 acountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By**
  - `setTransmuter(address value)`
- **Read By**
  - `transmuter()`
- **Notified By** - [`TransmuterUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_TransmuterUpdated)
</details>
<details>
  <summary>protocolFeeReceiver</summary>

- **Description** - the address that receives protocol fees.
- **Type** - Address
- **Used By**
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
- **Updated By**
  - [`setProtocolFeeReceiver(address reciever)`](/dev/alchemist/alchemist-contract#AdminActions_setProtocolFeeReceiver)
- **Read By**
  - `protocolFeeReceiver()`
- **Notified By** - [`ProtocolFeeReceiverUpdated(address reciever)`](/dev/alchemist/alchemist-contract#Events_ProtocolFeeReceiverUpdated)
</details>

#### Uint256

<details>
  <summary>depositCap</summary>

- **Description** - the global maximum amount of deposited collateral. AKA the max amount of deposited tokens that can be held by the contract, denomimated in yieldToken
- **Type** - uint256
- **Used By**
  - [`deposit(uint256 amount, address recipient, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
- **Updated By**
  - [`setDepositCap(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setDepositCap)
- **Read By**
  - `depositCap()`
- **Notified By** - [`DepositCapUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_DepositCapUpdated)
</details>

<details>
  <summary>minimumCollateralization</summary>
  
- **Description** - the minimum collateralization ratio for a specific account, or how much collateral over debt is allowed before liquidation. Inverse of LTV. Value > 1.
- **Type** - uint256
- **Used By**
  - [`setCollateralizationLowerBound(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setCollateralizationLowerBound)
  - [`getMaxBorrowable(uint256 tokenId)`](/dev/alchemist/alchemist-contract#ReadingState_getMaxBorrowable)
  - [`_liquidate(uint256 acountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt)
  - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
  - [`_isUnderCollateralized(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_isUnderCollateralized)
- **Updated By**
  - [`setMinimumCollateralization(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setMinimumCollateralization)
- **Read By**
  - `minimumCollateralization()`
- **Notified By** - [`MinimumCollateralizationUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_MinimumCollateralizationUpdated)
</details>
<details>
  <summary>globalMinimumCollateralization</summary>

- **Description** - represents the minimum allowed global collateralization ratio for the Alchemist. A threshold that if crossed will result in fully liquidating accounts to cover. Only accounts that are already eligible for standard (partial) liquidation can be fully liquidated as a result of the globalMinimumCollateralization.
- **Type** - uint256
- **Used By**
  - [`_doLiquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_doLiquidation)
- **Updated By**
  - [`setGlobalMinimumCollateralization(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setGlobalMinimumCollateralization)
- **Read By**
  - `globalMinimumCollateralization()`
- **Notified By** - [`GlobalMinimumCollateralizationUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_GlobalMinimumCollateralizationUpdated)
</details>
<details>
  <summary>collateralizationLowerBound</summary>

- **Description** - The minimum collateralization for liquidation eligibility. between 1 and minimumCollateralization inclusive.<br/><br/>
  If `collateral / debt` falls below this value, the account becomes eligible for liquidation. In LTV terms: `liquidation LTV = 1 / collateralizationLowerBound`.
- **Type** - uint256
- **Used By**
  - [`_liquidate(uint256 acountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
- **Updated By**
  - [`setCollateralizationLowerBound(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setCollateralizationLowerBound)
- **Read By**
  - `collateralizationLowerBound()`
- **Notified By** - [`CollateralizationLowerBoundUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_CollateralizationLowerBoundUpdated)
</details>
<details>
  <summary>protocolFee</summary>

- **Description** - the fee percentage (expressed in BPS) on users paid to the protocol. The fee is taken from collateral during redepmtions, or from collateral when users pay down their non-earmarked debt
- **Type** - uint256
- **Used By**
  - [`burn(uint256 acountId, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
- **Updated By**
  - [`setProtocolFee(uint256 fee)`](/dev/alchemist/alchemist-contract#AdminActions_setProtocolFee)
- **Read By**
  - `protocolFee()`
- **Notified By** - [`ProtocolFeeUpdated(uint256 fee)`](/dev/alchemist/alchemist-contract#Events_ProtocolFeeUpdated)
</details>
<details>
  <summary>liquidatorFee</summary>

- **Description** - fee percentage (expressed in BPS) paid to liquidators on liquidation. The fee amount (what this percentage is applied to) is denominated in debt token, which is then converted to yieldToken and taken from yieldToken. Also can be taken from underlying if feeBonus > 0.
- **Type** - uint256
- **Used By**
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
- **Updated By**
  - [`setLiquidatorFee(uint256 fee)`](/dev/alchemist/alchemist-contract#AdminActions_setLiquidatorFee)
- **Read By**
  - `liquidatorFee()`
- **Notified By** - [`LiquidatorFeeUpdated(uint256 fee)`](/dev/alchemist/alchemist-contract#Events_LiquidatorFeeUpdated)
</details>
<details>
  <summary>repaymentFee</summary>

- **Description** - fee percentage (expressed in BPS) paid to liquidators on repayment. The fee amount (which this percentage is applied to) is denominated in yieldToken.
- **Type** - uint256
- **Used By**
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
- **Updated By**
  - [`setRepaymentFee(uint256 fee)`](/dev/alchemist/alchemist-contract#AdminActions_setRepaymentFee)
- **Read By**
  - `repaymentFee()`
- **Notified By** - [`RepaymentFeeUpdated(uint256 fee)`](/dev/alchemist/alchemist-contract#Events_RepaymentFeeUpdated)
</details>

### Constants

> Immutable variables used as helpers or for informational purposes.

<details>
  <summary>BPS</summary>

- **Description** - Constant equaling 10_000. Used for any explicit decimal representation. Treats 100% as 10,000; meaning 10% would be expressed as 1000 BPS.
- **Type** - uint256
- **Updated By**
  - [`setProtocolFee(uint256 fee)`](/dev/alchemist/alchemist-contract#AdminActions_setProtocolFee)
  - [`setLiquidatorFee(uint256 fee)`](/dev/alchemist/alchemist-contract#AdminActions_setLiquidatorFee)
  - [`setRepaymentFee(uint256 fee)`](/dev/alchemist/alchemist-contract#AdminActions_setRepaymentFee)
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`calculateLiquidation(uint256 collateral, uint256 debt, uint256 targetCollateralization, uint256 alchemistCurrentCollateralization, uint256 alchemistMinimumCollateralization, uint256 feeBps)`](/dev/alchemist/alchemist-contract#ReadingState_calculateLiquidation)
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
- **Updated By** - NONE - immutable variable
</details>
<details>
  <summary>FIXED_POINT_SCALAR</summary>

- **Description** - A multiplier that is used to be able to do fixed point math, since solidity does not natively handle decimals. Like ERC20 tokens which typically use 18 decimals, it expresses 1 as 1e18. Anything less is a fraction of 1.
- **Type** - uint256
- **Updated By**
  - `setMinimumCollateralization(uint256 value)`
  - [`setCollateralizationLowerBound(uint256 value)`](/dev/alchemist/alchemist-contract#AdminActions_setCollateralizationLowerBound)
  - [`getMaxBorrowable(uint256 tokenId)`](/dev/alchemist/alchemist-contract#ReadingState_getMaxBorrowable)
  - [`withdraw(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw)
  - [`calculateLiquidation(uint256 collateral, uint256 debt, uint256 targetCollateralization, uint256 alchemistCurrentCollateralization, uint256 alchemistMinimumCollateralization, uint256 feeBps)`](/dev/alchemist/alchemist-contract#ReadingState_calculateLiquidation)
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt)
  - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
  - [`_isUnderCollateralized(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_isUnderCollateralized)
  - [`_doLiquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_doLiquidation)
  - [`_sync()`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
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

### Account

> A struct for variables related to per-user accounts and balances.

<details>
  <summary>collateralBalance</summary>

- **Description** - user deposits denominated in yieldTokens.
- **Type** - uint256
- **Used By**
  - [`\_calculateUnrealizedDebt(uint256 tokenId)](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`deposit(uint256 amount, address recipient, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_deposit) - [`withdraw(uint256 amount, address recipient, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw) - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn) - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay) - [`_forceRepay(uint256 accountId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_forceRepay) - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate) - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
</details>
<details>
  <summary>debt</summary>

- **Description** - denominated in alAsset
- **Type** - uint256
- **Used By**
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`_forceRepay(uint256 accountId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_forceRepay)
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`calculateLiquidation(uint256 collateral, uint256 debt, uint256 targetCollateralization, uint256 alchemistCurrentCollateralization, uint256 alchemistMinimumCollateralization, uint256 feeBps)`](/dev/alchemist/alchemist-contract#ReadingState_calculateLiquidation)
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
  - [`_isUnderCollateralized(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_isUnderCollateralized)
- **Updated By** - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt) - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt) - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)

</details>
<details>
  <summary>earmarked</summary>

- **Description** - denominated in alAsset. Earmarked funds refer to debt that is reserved to later be redeemed for collateral. Earmarked debt can only be repaid using yieldToken.
- **Type** - uint256
- **Used By**
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`_forceRepay(uint256 accountId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_forceRepay)
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt) - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay) - [`_forceRepay(uint256 accountId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_forceRepay) - [`\_sync(uint256 tokenId)](/dev/alchemist/alchemist-contract#InternalOperations_sync)

</details>
<details>
  <summary>freeCollateral</summary>

- **Description** - the portion of an accounts collateralBalance which can currently be used to take out new debt. Denominated in yieldToken
- **Type** - uint256
- **Used By**
  - [`withdraw(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw)
  - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt)
- **Updated By** - [`deposit(uint256 amount, uint256 recipient, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_deposit) - [`withdraw(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw) - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt) - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
</details>
<details>
  <summary>lastAccruedEarmarkWeight</summary>

- **Description** - Last weight of debt from the most recent account sync. This is a stored index used as a checkpoint of the last time a position had earmarking applied. The global earmark weight advances as new debt is added and as time in blocks passes (to model earmark progress). The difference between these weightings determines how much additional debt in the position needs to be earmarked.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
</details>
<details>
  <summary>lastAccruedRedemptionWeight</summary>

- **Description** - Last weight of redemption from most recent account sync. This is a stored index used as a checkpoint of the last time a position had redemptions applied. The global redemption weight advances as system-wide redemptions occur and as time in blocks passes (to model redemption progress). The difference between these weightings determines how much of the account’s earmarked debt should actually be redeemed.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
</details>
<details>
  <summary>lastCollateralWeight</summary>

- **Description** - Last weight of collateral from most recent account sync. This is a stored index used as a checkpoint of the last time a position had its locked collateral adjusted. The global collateral weight advances as system-wide redemptions are processed. The difference between these weightings determines how much of the account’s locked collateral should be reduced.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
</details>
<details>
  <summary>lastMintBlock</summary>

- **Description** - Block of the most recent mint.
- **Type** - uint256
- **Used By**
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
- **Updated By** - [`calculateLiquidation(uint256 collateral, uint256 debt, uint256 targetCollateralization, uint256 alchemistCurretnCollateralization, uint256 alchemistMinimumCollateralization, uint256 feeBps)`](/dev/alchemist/alchemist-contract#ReadingState_calculateLiquidation)
</details>
<details>
  <summary>lastRedemptionSync</summary>

- **Description** - Block the last redemption was synced to the account.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
- **Updated By** - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
</details>
<details>
  <summary>rawLocked</summary>

- **Description** - the portion of an accounts collateral balance that's already pledged to collateralize existing debt and can't be used for new borrows until debt is repaid or a position get's room. Denominated in yieldTokens
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt) - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt) - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
</details>
<details>
  <summary>mintAllowances</summary>

- **Description** - allowances for minting alAssets, per version. Indexing by allowances version allows for easy efficient clearing of the entire map if needed.
- **Type** - mapping(uint256 => mapping(address => uint256))
- **Updated By**
  - [`_approveMint(uint256 ownerTokenId, address spener, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_approveMint)
  - [`_decreaseMintAllowance(uint256 ownerTokenId, address spener, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_decreaseMintAllowance)
- **Read By**
  - [`mintAllowance(uint256 ownerTokenId, address spender)`](/dev/alchemist/alchemist-contract#ReadingState_mintAllowance)
- **Notified By** - [`MintAllowancesReset(uint256 tokenId)`](/dev/alchemist/alchemist-contract#Events_MintAllowancesReset)
</details>
<details>
  <summary>allowancesVersion</summary>

- **Description** - id used in the mintAllowances map which is incremented on reset.
- **Type** - uint256
- **Used By**
  - [`mintAllowance(uint256 ownerTokenId, address spender)`](/dev/alchemist/alchemist-contract#ReadingState_mintAllowance)
  - [`_approveMint(uint256 ownerTokenId, address spener, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_approveMint)
  - [`_decreaseMintAllowance(uint256 ownerTokenId, address spener, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_decreaseMintAllowance)
- **Updated By** - [`resetMintAllowances(uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_resetMintAllowances)
</details>

### RedemptionInfo

> Struct for variables related to redemption events.

<details>
  <summary>earmarkWeight</summary>

- **Description** - the snapshot of the global earmark index at the last redemption block. It’s used to rewind an account’s earmarked debt back to what it was when that redemption occurred, so the system can correctly apply the redemption against the right state.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
</details>

### Public State

> State that is available and can be read from outside of the contract.

#### Addresses

<details>
  <summary>pendingAdmin</summary>

- **Description** - The first step in a two-step process of setting a new administrator. The pendingAdmin is set by the current admin, then the pendingAdmin must accept the responsibility to lock in the change of admin.
- **Type** - address
- **Updated By**
  - [`setPendingAdmin(address value)`](/dev/alchemist/alchemist-contract#AdminActions_setPendingAdmin)
- **Read By**
  - `pendingAdmin()`
- **Notified By** - [`PendingAdminUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_PendingAdminUpdated)
</details>
<details>
  <summary>alchemistFeeVault</summary>

- **Description** - An external vault used to hold funds that can be used to pay liquidators in the event that Alchemist funds cannot cover the costs of liquidation. This would occur if (1) the account does not have enough funds to cover the liquidation, or (2) the entire Alchemist is undercollateralized.
- **Type** - address
- **Used By**
  - [`_`doliquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_doLiquidation)
- **Updated By**
  - [`setAlchemistFeeVault(address value)`](/dev/alchemist/alchemist-contract#AdminActions_setAlchemistFeeVault)
- **Read By**
  - `alchemistFeeVault()`
- **Notified By** - [`AlchemistFeeVaultUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_AlchemistFeeVaultUpdated)
</details>
<details>
  <summary>alchemistPositionNFT</summary>

- **Description** - the address of the NFT contract for this alchemist. Each position in the alchemist is tied to an NFT.
- **Type** - address
- **Used By**
  - [`deposit(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
  - [`withdraw(uint256 amount, address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw)
  - [`mint(uint256 tokenId, uint256 amount, address recipient)`](/dev/alchemist/alchemist-contract#UserActions_mint)
  - [`batchLiquidate(uint256[] memory accountIds)`](/dev/alchemist/alchemist-contract#UserActions_batchLiquidate)
  - [`approveMint(uint256 tokenId, address spender, uint256 amount)`](/dev/alchemist/alchemist-contract#UserActions_approveMint)
  - [`resetMintAllowances(uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_resetMintAllowances)
  - [`_checkForValidAccountId(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_checkForValidAccountId)
- **Updated By**
  - [`setAlchemistPositionNFT(address nft)`](/dev/alchemist/alchemist-contract#AdminActions_setAlchemistPositionNFT)
- **Read By** - `alchemistPositionNFT()`
</details>

#### Uint256

<details id="Variables_underlyingConversionFactor">
  <summary>underlyingConversionFactor</summary>

- **Description** - Set once on initialization, dependent on initialization params, then never again. Determines what you can multiply the underlying token decimals by in order to denominate similarly to alAsset; For example if USDC is 6 decimals and alUSD is 18, then the conversion factor is 10^12 to be able to denominate USDC the same way as alUSD. Used for mathematical operations
- **Type** - uint256
- **Used By**
  - [`normalizeUnderlyingTokensToDebt(uint256 amount)`](/dev/alchemist/alchemist-contract#ReadingState_normalizeUnderlyingTokensToDebt)
  - [`normalizeDebtTokensToUnderlying(uint256 amount)`](/dev/alchemist/alchemist-contract#ReadingState_normalizeDebtTokensToUnderlying)
- **Updated By**
  - `initialize(AlchemixInitializationParams memory params)`
- **Read By** - `underlyingConversionFactor()`
</details>
<details>
  <summary>cumulativeEarmarked</summary>

- **Description** - Global running total of system debt currently earmarked for redemption. Can be any amount 0 up to the amount of total system debt. Unearmarked debt = totalDebt - cumulativeEarmarked.
- **Type** - uint256
- **Used By**
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
  - [`_calculateUnrealizedDebt(int256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By**
  - [repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
- **Read By** - `cumulativeEarmarked()`
</details>
<details>
  <summary>lastEarmarkBlock</summary>

- **Description** - the block number when \_earmark() last updated global earmarking. Used to compute how much to earmark from the last time earmarking occured.
- **Type** - uint256
- **Used By**
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
  - [`_calculateUnrealizedDebt(int256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By**
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
- **Read By** - `lastEarmarkBlock()`
</details>
<details>
  <summary>lastRedemptionBlock</summary>

- **Description** - the block number of the most recent redemption that advanced global redemption state. Used to reference the snapshot of earmark and debt state at that block, so accounts can be updated consistently by applying the redemption against that state.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`]`(/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(int256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By**
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
- **Read By** - `lastEarmarkBlock()`
</details>
<details>
  <summary>lastTransmuterTokenBalance</summary>

- **Description** - the last recorded balance of yieldTokens in the Transmuter. It is periodically updated by a Transmuter call, and is used to help the Alchemist determine how much it needs to earmark.
- **Type** - uint256
- **Used By**
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
- **Updated By**
  - [`setLastTransmuterTokenBalance(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_setLastTransmuterTokenBalance)
- **Read By** - `lastTransmuterTokenBalance()`
</details>
<details>
  <summary>totalDebt</summary>

- **Description** - The total system-wide debt.
- **Type** - uint256
- **Used By**
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`_doLiquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_doLiquidation)
  - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By**
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`_addDebt(uint256 tokenUd, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt)
  - [`_subDebt(uint256 tokenUd, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
- **Read By** - `totalDebt()`
</details>
<details>
  <summary>totalSyntheticsIssued</summary>

- **Description** - The total system-wide debt tokens issued and circulating.
- **Type** - uint256
- **Used By**
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
- **Updated By**
  - [`burn(uint256 amount, uint256 recipientId)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`reduceSyntheticsIssued(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_reduceSyntheticsIssued)
  - [`_mint(uint256 tokenId, uint256 amount, address recipient)`](/dev/alchemist/alchemist-contract#InternalOperations_mint)
- **Read By** - `totalSyntheticsIssued()`
</details>

#### Booleans

<details>
  <summary>depositsPaused</summary>

- **Description** - A flag that prevents depositing by users when set to true. Can be toggled by an Admin or Guardian.
- **Type** - boolean
- **Used By**
  - [`deposit(uint256 amount, uint256 recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
- **Updated By**
  - [`pauseDeposits(bool isPaused)`](/dev/alchemist/alchemist-contract#GuardianActions_pauseDeposits)
- **Read By**
  - `depositsPaused()`
- **Notified By** - [`DepositsPaused(bool isPaused)`](/dev/alchemist/alchemist-contract#Events_DepositsPaused)
</details>
<details>
  <summary>loansPaused</summary>

- **Description** - A flag that prevents taking loans by users when set to true. Can be toggled by an Admin or Guardian.
- **Type** - boolean
- **Used By**
  - [`mint(uint256 tokenId, uint256 amount, uint256 recipient)`](/dev/alchemist/alchemist-contract#UserActions_mint)
  - [`mintFrom(uint256 tokenId, uint256 amount, uint256 recipient)`](/dev/alchemist/alchemist-contract#UserActions_mintFrom)
- **Updated By**
  - [`pauseLoans(bool isPaused)`](/dev/alchemist/alchemist-contract#GuardianActions_pauseLoans)
- **Read By**
  - `loansPaused()`
- **Notified By** - [`LoansPaused(bool isPaused)`](/dev/alchemist/alchemist-contract#Events_LoansPaused)
</details>

#### Mappings

<details>
  <summary>guardians</summary>

- **Description** - A mapping of addresses to true or false values, where true indicates that the address is enabled as having the guardian role (able to execute functions guarded by the `OnlyAdminOrGuardian` modifier), and false marks the address as not having the guardian role.
- **Type** - mapping(address => bool)
- **Used By**
  - [`Guardian Actions`](/dev/alchemist/alchemist-contract#guardian-actions)
- **Updated By**
  - [`setGuardian(address guardian, bool isActive)`](/dev/alchemist/alchemist-contract#AdminActions_setGuardian)
- **Read By**
  - `guardians(address guardian)`
- **Notified By** - [`GuardianSet(address guardian, bool state)`](/dev/alchemist/alchemist-contract#Events_GuardianSet)
</details>

### Private State

> Internal state of the contract. In most cases cannot be read from outside of the contract. In some cases, such as mappings or structs, certain aspects can be read using specific functions. (See ReadingState for more examples)

#### Uint256

<details>
  <summary>_earmarkWeight</summary>

- **Description** - A global cumulative scaling factor that increases whenever new debt is earmarked. Accounts use the difference between this value and their account-specific lastAccruedEarmarkWeight to determine how much of their outstanding debt should now be considered earmarked.
- **Type** - uint256
- **Used By**
  - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`_earmark()`](/dev/alchemist/alchemist-contract#InternalOperations_earmark)
</details>
<details>
  <summary>_redemptionWeight</summary>

- **Description** - A global cumulative scaling factor that increases whenever earmarked debt is redeemed. Accounts use the difference between this value and their account-specific lastAccruedRedemptionWeight to determine how much of their earmarked debt has been reconciled by redemptions.
- **Type** - uint256
- **Used By**
  - [`_validate(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_validate)
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
</details>
<details>
  <summary>_collateralWeight</summary>

- **Description** - A global cumulative scaling factor that increases whenever collateral is redeemed or fees are taken. Accounts use the difference between this value and their account-specific lastCollateralWeight to determine how much of their locked collateral should be seized in proportion to global redemptions.
- **Type** - uint256
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
</details>
<details>
  <summary>_totalLocked</summary>

- **Description** - total locked collateral; aka collateral that can't be withdrawn due to LTV constraints.
- **Type** - uint256
- **Used By**
  - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
- **Updated By** - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem) - [`_resolveRepaymentFee(uint256 accountId, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalActions_resolveRepaymentFee) - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt) - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
</details>

#### Mappings

<details>
  <summary>_accounts</summary>

- **Description** - tracks user accounts and balances.
- **Type** - mapping(uint256 => Account)
- **Used By**
  - [`mintAllowance(uint256 ownerTokenId, account spender)`](/dev/alchemist/alchemist-contract#ReadingState_mintAllowance)
  - [`deposit(uint256 amount, uint256 recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
  - [`burn(uint256 amount, uint256 recipient)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`repay(uint256 amount, uint256 recipientTokenId)`](/dev/alchemist/alchemist-contract#UserActions_repay)
  - [`_forceRepay(uint256 accountId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_forceRepay)
  - [`_liquidate(uint256 accountId)`](/dev/alchemist/alchemist-contract#InternalOperations_liquidate)
  - [`_doLiquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_doLiquidation)
  - [`_resolveRepaymentFee(uint256 accountId, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_resolveRepaymentFee)
  - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt)
  - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
  - [`_approveMint(uint256 ownerTokenId, address spender, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_approveMint)
  - [`_decreaseMintAllowance(uint256 ownerTokenId, address spender, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_decreaseMintAllowance)
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
  - [`_isUnderCollateralized(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_isUndercollateralized)
- **Updated By**
  - [`deposit(uint256 amount, uint256 recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_deposit)
  - [`withdraw(uint256 amount, uint256 recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_withdraw)
  - [`burn(uint256 amount, uint256 recipient)`](/dev/alchemist/alchemist-contract#UserActions_burn)
  - [`resetMintAllowances(uint256 tokenId)`](/dev/alchemist/alchemist-contract#UserActions_resetMintAllowances)
  - [`mint(uint256 tokenId, uint256 amount, uint256 recipient)`](/dev/alchemist/alchemist-contract#UserActions_mint)
  - [`_doLiquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalOperations_doLiquidation)
  - [`_resolveRepaymentFee(uint256 accountId, uint256 repaidAmountInYield)`](/dev/alchemist/alchemist-contract#InternalActions_resolveRepaymentFee)
  - [`_addDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_addDebt)
  - [`_subDebt(uint256 tokenId, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_subDebt)
  - [`_approveMint(uint256 ownerTokenId, address spender, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_approveMint)
  - [`_decreaseMintAllowance(uint256 ownerTokenId, address spender, uint256 amount)`](/dev/alchemist/alchemist-contract#InternalOperations_decreaseMintAllowance)
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
- **Read By** - [`getCDP(uint256 tokenId)`](/dev/alchemist/alchemist-contract#ReadingState_getCDP)
</details>
<details>
  <summary>_redemptions</summary>

- **Description** - tracks historic redemptions
- **Type** - mapping(uint256 => RedemptionInfo)
- **Used By**
  - [`_sync(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_sync)
  - [`_calculateUnrealizedDebt(uint256 tokenId)`](/dev/alchemist/alchemist-contract#InternalOperations_calculateUnrealizedDebt)
- **Updated By** - [`redeem(uint256 amount)`](/dev/alchemist/alchemist-contract#TransmuterActions_redeem)
</details>

## Functions

### User Actions

> Functions that can be called by external accounts which influence the state of the Alchemist.

<details id="UserActions_deposit">
  <summary>deposit(uint256 amount, address recipient, uint256 tokenId)</summary>

- **Description** - Allows a user to deposit yieldTokens into the Alchemist.<br/><br/> The passed uint256 for tokenId should be 0 for any new position, or the tokenId of the AlchemistV3PositionNFT if depositing into an existing position.
  - `@param recipient` - used to specify an address that will recieve the NFT position if minting a brand new position, which also requires tokenId == 0. Otherwise it won't be used
  - `@param tokenId` - 0 for a new position, or a valid id for an existing position
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - uint256 amountDepositedDenominatedInDebtTokens
- **Emits**
  - [`AlchemistV3PositionNFTMinted(address recipient, uint256 tokenId)`](/dev/alchemist/alchemist-contract#Events_AlchemistV3PositionNFTMinted)
  - [`Deposit(uint256 amount, uint256 tokenId)`](/dev/alchemist/alchemist-contract#Events_Deposit)
- **Reverts** - recipient == zero address - amount == 0 - depositsPaused - deposit would result in a total deposit that exceeeds the deposit cap\
- [`UnknownAccountOwnerIdError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) - passed tokenId does not correspond to an existing NFT and is not 0
</details>
<details id="UserActions_withdraw">
  <summary>withdraw(uint256 amount, address recipient, uint256 tokenId)</summary>

- **Description** - Allows the owner of an account to withdraw funds to a specfied recipient address. <br/><br/>First applies all earmarking, redemptions, and locked collateral adjustments to the account so it is up-to-date; then transfers funds if valid.
  - `@param amount` - the amount of yieldToken to withdraw
  - `@param recipient` - the address which will recieve the withdrawn assets
  - `@param tokenId` - the ID of the owner's account, assigned on creation of the AlchemistV3PositionNFT
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - uint256 amountOfYieldTokensWithdrawn
- **Emits**
  - [`Withdraw(uint256 amount, uint256 tokenId)`](/dev/alchemist/alchemist-contract#Events_Withdraw)
- **Reverts** - recipient == zero address - amount == 0 - attempted collateral withdrawn > user's unlocked collateral (collateral that isn't pledged to collateralize existing debt) - [`UnauthorizedAccountAccessError()`](/dev/alchemist/alchemist-contract#Error_UnauthorizedAccountAccessError) - msg.sender is not the owner of the account identified by the passed tokenId - [`UnknownAccountOwnerIdError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) - passed tokenId does not correspond to an existing NFT and is not 0 - [`Undercollateralized()`](/dev/alchemist/alchemist-contract#Error_Undercollateralized) - if the account is undercollateralized don't allow a withdraw
</details>
<details id="UserActions_mint">
  <summary>mint(uint256 tokenId, uint256 amount, address recipient)</summary>

- **Description** - Allows the owner of the account with the passed tokenId to mint debt. <br/><br/>First syncs global and account state, increases the account’s debt by amount, then mints amount of the debt token to the recipient address.
  - `@param tokenId` - the ID of the owner's account, assigned on creation of the AlchemistV3PositionNFT
  - `@param amount` - the amount of alAssets to mint
  - `@param recipient` - the address which will recieve the minted assets
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - uint256 totalTokenTVLInUnderlying
- **Emits**
  - [`Mint(uint256 tokenId, uint256 amount, address recipient)`](/dev/alchemist/alchemist-contract#Events_Mint)
- **Reverts** - recipient == zero address - amount == 0 - loansPaused - [`UnauthorizedAccountAccessError()`](/dev/alchemist/alchemist-contract#Error_UnauthorizedAccountAccessError) - msg.sender is not the owner of the account identified by the passed tokenId - [`UnknownAccountOwnerIdError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) - passed tokenId does not correspond to an existing NFT and is not 0 - [`Undercollateralized()`](/dev/alchemist/alchemist-contract#Error_Undercollateralized) - if the account would be undercollateralized don't allow minting more debt
</details>
<details id="UserActions_mintFrom">
  <summary>mintFrom(uint256 tokenId, uint256 amount, address recipient)</summary>

- **Description** - Borrow on behalf of tokenId using a mint allowance instead of ownership.<br/><br/> It first decreases msg.sender’s allowance for that account by amount, then performs the same actions as mint, minting debt tokens to the recipient address.
  - `@param tokenId` - the ID of the owner's account, assigned on creation of the AlchemistV3PositionNFT
  - `@param amount` - the amount of alAssets to mint
  - `@param recipient` - the address which will recieve the minted assets
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - uint256 totalTokenTVLInUnderlying
- **Emits**
  - [`Mint(uint256 tokenId, uint256 amount, address recipient)`](/dev/alchemist/alchemist-contract#Events_Mint)
- **Reverts** - recipient == zero address - amount == 0 - loansPaused - [`UnknownAccountOwnerIdError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) - passed tokenId does not correspond to an existing NFT and is not 0 - [`Undercollateralized()`](/dev/alchemist/alchemist-contract#Error_Undercollateralized) - if the account would be undercollateralized don't allow minting more debt
</details>
<details id="UserActions_burn">
  <summary>burn(uint256 amount, uint256 recipientId)</summary>

- **Description** - Burn debt tokens (alAssets) from the caller to repay the unearmarked portion of the position’s debt.<br/><br/>
  First syncs global/account state and makes sure it would not be burning debt that is locked for the transmuter, then burns the caller’s tokens. Charges a protocol fee in yield tokens against the account’s collateral.<br/><br/>
  Difference between `repay()` and `burn()`:<br/>
  `repay()` takes an amount of yieldTokens and can reconcile earmarked debt in addition to unearmarked debt. It does not actually reduce debtToken supply, it only reconciles accounts and collects funds that will be alter used to burn debt.<br/>
  `burn()` takes debt tokens and can only reconcile unearmarked debt of accounts. It actually removes debtTokens from circulation.
  - `@param recipientId` - the tokenId of the account for which debt is being repaid
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - uint256 debtUnitsRepaid
- **Emits**
  - [`Burn(address indexed sender, uint256 amount, uint256 indexed recipientId)`](/dev/alchemist/alchemist-contract#Events_Burn)
- **Reverts** - amount == 0 - No unearmarked debt to repay - insufficient balance/allowance - [`UnknownAccountOwnerIdError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) - passed tokenId does not correspond to an existing NFT and is not 0 - [`CannotRepayOnMintBlock()`](/dev/alchemist/alchemist-contract#Error_CannotRepayOnMintBlock) - same-block mint repay is disallowed - [`BurnLimitExceeded(uint256 amount, uint256 available)`](/dev/alchemist/alchemist-contract#Error_BurnLimitExceeded) - requested burn exceeds `totalSyntheticsIssued - transmuter.totalLocked()`
</details>
<details id="UserActions_repay">
  <summary>repay(uint256 amount, uint256 recipientTokenId)</summary>

- **Description** - Repay the position’s debt using yield tokens provided by the caller.<br/><br/>
  Syncs global/account state, converts the payment from yield units to debt units, consumes earmarked debt first, then repays accounts unearmarked debt, moves the repayment to the Transmuter, and moves the fee to the protocolFeeReciever. Protocol fee is charged in yield tokens against the account’s collateral.<br/><br/>
  Difference between `repay()` and `burn()`:<br/>
  `repay()` takes an amount of yieldTokens and can reconcile earmarked debt in addition to unearmarked debt. It reduces an accounts debt but does not actually reduce debtToken supply, it only reconciles accounts and collects funds for the Transmuter, which will eventually use them to burn the debt.<br/>
  `burn()` takes debt tokens and can only reconcile unearmarked debt of accounts. It removes debtTokens from circulation.
  - `@param amount` - the amount of yield tokens the caller provides as repayment
  - `@param recipientTokenId` - the tokenId of the account for which debt is being repaid
- **Visibility Specifier** - public
- **State Mutability Specifier** - nonpayable
- **Returns** - uint256 yieldTokensUsedToRepay
- **Emits**
  - [`Repay(address indexed sender, uint256 amount, uint256 indexed recipientId, uint256 credit)`](/dev/alchemist/alchemist-contract#Events_Repay)
- **Reverts** - amount == 0 - account lacks collateral to cover the protocol fee - No outstanding debt for the account of the passed recipientId - [`UnknownAccountOwnerIDError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) - passed tokenId does not correspond to an existing NFT - [`CannotRepayOnMintBlock()`](/dev/alchemist/alchemist-contract#Error_CannotRepayOnMintBlock) - same-block mint repay is disallowed. For flash loan protection.

</details>
<details id="UserActions_liquidate">
  <summary>liquidate(uint256 accountId)</summary>

- **Description** - Attempts to `_liquidate()` an undercollateralized position of the account identified by the passed accountId.<br/><br/>
  First syncs state and applys earmarking so the account is up to date, then repays earmarked debt if present. If that restores the position above the collateralization lower bound, a repayment fee denominated in yield is paid to the caller and no liquidation is performed. If the position remains below the lower bound, proceeds to liquidate, seizing yieldToken-denominated collateral and paying the liquidator fees. If the account does not have enough to cover liquidation fees, or the entire Alchemist is undercollateralized, then the liquidator will be paid using the funds from this Alchemist's `alchemistFeeVault`.
  - `@param accountId` - the tokenId of the account to liquidate
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns**
  - `yieldAmount` — if liquidation happened: collateral in yield seized; if only repayment happened: the repaid amount in yield
  - `feeInYield` — liquidator/repayment fee paid in yield tokens
  - `feeInUnderlying` — additional liquidator fee paid in underlying from this Alchemist's `alchemistFeeVault` (if needed)
- **Emits**
  - [`Liquidated(uint256 indexed accountId, address liquidator, uint256 amount, uint256 feeInYield, uint256 feeInUnderlying)`](/dev/alchemist/alchemist-contract#Events_Liquidated)
- **Reverts** - [UnknownAccountOwnerIDError()](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) — passed accountId does not correspond to an existing NFT - [LiquidationError()](/dev/alchemist/alchemist-contract#Error_LiquidationError) — no liquidation/repayment occurred, either because the account is healthy, the tokenAdapter has trouble pricing the yieldToken (price == 0), etc.
</details>

<details id="UserActions_batchLiquidate">
  <summary>batchLiquidate(uint256[] accountIds)</summary>

- **Description** - Attempts liquidation across multiple accounts.<br/><br/>
  Calls the internal `_liquidate` for each valid account, aggregates the total amount of yieldToken seized from collateral (earmarked repayment + liquidation seizure) along with the liquidator fees, and returns the totals.
  - `@param accountIds` - array of tokenIds to attempt liquidation on. Invalid IDs are skipped.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns**
  - `totalAmountLiquidated` — sum of per-account `yieldAmount` returned by `_liquidate` (i.e., total yield moved)
  - `totalFeesInYield` — sum of yield-denominated liquidator/repayment fees
  - `totalFeesInUnderlying` — sum of underlying-denominated liquidator fees paid from this Alchemist's `alchemistFeeVault` (see `_liquidate()` for when this would occur)
- **Emits** - none
- **Reverts** - [`MissingInputData()`](/dev/alchemist/alchemist-contract#Error_MissingInputData) — `accountIds` is empty - [`LiquidationError()`](/dev/alchemist/alchemist-contract#Error_LiquidationError) — no liquidation/repayment occurred for any account. See `liquidate()` under **User Actions** for why this might occur.

</details>
<details id="UserActions_poke">
  <summary>poke(uint256 tokenId)</summary>

- **Description** - Brings both global and account state up to date without changing balances.<br/><br/>
  Validates the account, applies global earmarking, and syncs the specified account’s debt/collateral state with the latest global weights.
  - `@param tokenId` - the tokenId of the account to sync
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - [`UnknownAccountOwnerIDError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) — passed tokenId does not correspond to an existing NFT
</details>
<details id="UserActions_approveMint">
  <summary>approveMint(uint256 tokenId, address spender, uint256 amount)</summary>

- **Description** - Grant or update a mint allowance so spender can mint debt tokens on behalf of the owner's position (via `mintFrom`) identified by `tokenId`, for up to `amount` of debtTokens.<br/><br/>
  Verifies the caller owns the position, then delegates to `_approveMint` to persist the allowance and emit the approval event.
  - `@param tokenId` - the id of the position whose minting rights are being delegated
  - `@param spender` - the address allowed to mint on behalf of the owner of the position identified by `tokenId`
  - `@param amount` - the maximum debt tokens the `spender` may mint
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ApproveMint(uint256 indexed ownerTokenId, address indexed spender, uint256 amount)`](/dev/alchemist/alchemist-contract#Events_ApproveMint) _(emitted by `_approveMint`)_
- **Reverts** - [`UnauthorizedAccountAccessError()`](/dev/alchemist/alchemist-contract#Error_UnauthorizedAccountAccessError) — caller is not the owner of the position identified by `tokenId`
</details>
<details id="UserActions_resetMintAllowances">
  <summary>resetMintAllowances(uint256 tokenId)</summary>

- **Description** - Clears all existing mint allowances for the position by bumping its `allowancesVersion`. Future `approveMint` entries are written under the new version. Old approvals become ineffective without needing to delete mappings. Callable by the NFT contract or by the current owner.
  - `@param tokenId` - the id of position for which mint allowances are being reset
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`MintAllowancesReset(uint256 indexed tokenId)`](/dev/alchemist/alchemist-contract#Events_MintAllowancesReset)
- **Reverts** - [`Unauthorized()`](/dev/alchemist/alchemist-contract#Error_Unauthorized) — caller is neither the NFT contract nor the position’s current owner
</details>
<details id="UserActions_acceptAdmin">
  <summary>acceptAdmin()</summary>

- **Description** - Can only be called by the current pendingAdmin. Used to accept the admin role.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`PendingAdminUpdated(address(0))`](/dev/alchemist/alchemist-contract#Events_PendingAdminUpdated)
  - [`AdminUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_AdminUpdated)
- **Reverts** - **Unauthorized()**
</details>

### Guardian Actions

> Functions that are guarded by the onlyAdminOrGuardian modifier.

<details id="GuardianActions_pauseDeposits">
  <summary>pauseDeposits(bool isPaused)</summary>

- **Description** - Sets the depositsPaused variable, preventing users from calling the deposit function.
  - `@param isPaused` - true/false value indicating whether or deposits should be accepted.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`DepositsPaused(bool isPaused)`](/dev/alchemist/alchemist-contract#Events_DepositsPaused)
- **Reverts** - none
</details>
<details id="GuardianActions_pauseLoans">
  <summary>pauseLoans(bool isPaused)</summary>

- **Description** - Sets the pauseLoans variable, preventing users from calling the mint and mintFrom functions.
  - `@param isPaused` - true/false value indicating whether or not to pause the ability to take loans
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`LoansPaused(bool isPaused)`](/dev/alchemist/alchemist-contract#Events_LoansPaused)
- **Reverts** - none
</details>

### Admin Actions

> Functions guarded by the onlyAdmin modifier.

<details id="AdminActions_setAlchemistPositionNFT">
  <summary>setAlchemistPositionNFT(address NFT)</summary>

- **Description** - Sets the NFT contract that will be used to represent NFT positions. Can only be set once.
  - `@param NFT` - the addressof the alchemistPositionNft contract.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - [`AlchemistV3NFTZeroAddressError`](/dev/alchemist/alchemist-contract#Errors_AlchemistV3NFTZeroAddressError) - if the NFT is set to the zero address - [`AlchemistV3NFTAlreadySetError`](/dev/alchemist/alchemist-contract#AlchemistV3NFTAlreadySetError) - if the NFT is set to the zero address
</details>
<details id="AdminActions_setAlchemistFeeVault">
  <summary>setAlchemistFeeVault(address value)</summary>

- **Description** - Sets the fee vault used for liquidations in the event of (1) an account not being able to cover, (2) the Alchemist itself being globally undercollateralized.
  - `@param value` - the address of the AlchemistFeeVault contract to use.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`AlchemistFeeVaultUpdated`](/dev/alchemist/alchemist-contract#Events_AlchemistFeeVaultUpdated)
- **Reverts** - [`AlchemistVaultTokenMismatchError`](/dev/alchemist/alchemist-contract#Errors_AlchemistVaultTokenMismatchError) - if the token of the fee vault doesn't match the underlying
</details>
<details id="AdminActions_setPendingAdmin">
  <summary>setPendingAdmin(address value)</summary>

- **Description** - Sets the pending admin. First part of a two-step process to change the admin. The second step is the pendingAdmin accepting the role by calling acceptAdmin.
  - `@param value` - the address of the EOA to set as the new pending admin
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`PendingAdminUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_PendingAdminUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setDepositCap">
  <summary>setDepositCap(uint256 value)</summary>

- **Description** - Sets the maximum number of yieldTokens that can be held by this contract. Must exceed the current balance of yield tokens.
  - `@param quantity of yield tokens to set as the new cap`
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`DepositCapUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_)
- **Reverts** - none
</details>
<details id="AdminActions_setProtocolFeeReceiver">
  <summary>setProtocolFeeReceiver(address value)</summary>

- **Description** - Sets the address which receives protocol fees.
  - `@param value` - the address to recieve fees.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ProtocolFeeReceiverUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_ProtocolFeeReceiverUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setProtocolFee">
  <summary>setProtocolFee(uint256 fee)</summary>

- **Description** - Sets the fee percentage paid to the protocol denominated in BPS.
  - `@param fee` - a uint number from 0 to 10_000
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ProtocolFeeUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_ProtocolFeeUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setLiquidatorFee">
  <summary>setLiquidatorFee(uint256 fee)</summary>

- **Description** - Sets the fee percentage paid to liquidators for liquidating an account denominated in BPS.
  - `@param fee` - a uint number from 0 to 10_000
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`LiquidatorFeeUpdated(uint256 fee)`](/dev/alchemist/alchemist-contract#Events_LiquidatorFeeUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setRepaymentFee">
  <summary>setRepaymentFee(uint256 fee)</summary>

- **Description** - Sets the fee percentage paid to liquidators for repaying an account denominated in BPS.
  - `@param fee` - a uint number from 0 to 10_000
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`RepaymentFeeUpdated(uint256 fee)`](/dev/alchemist/alchemist-contract#Events_RepaymentFeeUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setTokenAdapter">
  <summary>setTokenAdapter(address value)</summary>

- **Description** - Sets the tokenAdapter which is used to price yieldTokens.
  - `@param value` - the address of the contract to price yieldTokens.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`TokenAdapterUpdated(address value)`](/dev/alchemist/alchemist-contract#Events_TokenAdapterUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setGuardian">
  <summary>setGuardian(address guardian, bool isActive)</summary>

- **Description** - Sets an address as an active guardian in the guardians mapping.
  - `@param guardian` - the address to activate or de-actviate as a guardian
  - `@param isActive` - a true/false value indicating if the address should be an active guardian or not.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`GuardianSet(address guardian, bool isActive)`](/dev/alchemist/alchemist-contract#Events_GuardianSet)
- **Reverts** - none
</details>
<details id="AdminActions_setMinimumCollateralization">
  <summary>setMinimumCollateralization(uint256 value)</summary>

- **Description** - Sets the minimumCollateralization variable.
  - `@param value` - the value to use for the new minimumCollateralization variable. Must be >= 1e18. (1)
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`MinimumCollateralizationUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_MinimumCollateralizationUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setGlobalMinimumCollateralization">
  <summary>setGlobalMinimumCollateralization(uint256 value)</summary>

- **Description** - Sets the globalMinimumCollateralization variable.
  - `@param value` - the uint256 to set as globalMinCollateralization. Must be above minimumCollateralization
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`GlobalMinimumCollateralizationUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_GlobalMinimumCollateralizationUpdated)
- **Reverts** - none
</details>
<details id="AdminActions_setCollateralizationLowerBound">
  <summary>setCollateralizationLowerBound(uint256 value)</summary>

- **Description** - Sets the collateralizationLowerBound variable.
  - `@param value` - the uint256 to use as the new value.
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`CollateralizationLowerBoundUpdated(uint256 value)`](/dev/alchemist/alchemist-contract#Events_CollateralizationLowerBoundUpdated)
- **Reverts** - none
</details>

### Transmuter Actions

> Functions guarded by the onlyTransmuter modifier.

<details id="TransmuterActions_redeem">
  <summary>redeem(uint256 amount)</summary>

- **Description** - Fulfills a Transmuter-initiated redemption.<br/><br/>
  Updates global earmark, redemption, and collateral weights. Converts the requested debt amount to yield tokens, subtracts a protocol fee in yield tokens, and reduces `cumulativeEarmarked` and `totalDebt`. Records a redemption snapshot. Sends seized yieldTokens to the Transmuter, and the fee to the protocol.
  - `@param amount` - amount to redeem denominated in debt token
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`Redemption(uint256 amount)`](/dev/alchemist/alchemist-contract#Events_Redemption)
- **Reverts** - none
</details>
<details id="TransmuterActions_reduceSyntheticsIssued">
  <summary>reduceSyntheticsIssued(uint256 amount)</summary>

- **Description** - reduced `totalSyntheticsIssued` by amount
  - `@param amount` - amount denominated in debtToken
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none
</details>
<details id="TransmuterActions_setTransmuterTokenBalance">
  <summary>setTransmuterTokenBalance(uint256 amount)</summary>

- **Description** - sets the `lastTransmuterTokenBalance` variable, which tells the Alchemist how many yieldTokens are in the Transmuter.
  - `@param amount` - amount denominated in yieldToken
- **Visibility Specifier** - external
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none
</details>

### Internal Operations

> Functions that are cannot be called by other contracts or EOAs. Used only as helpers for performing internal logic.

<details id="InternalOperations_sync">
  <summary>_sync(uint256 tokenId)</summary>

- **Description** - Bring the account to the latest global state re. earmarking, redemptions, and collateral.<br/><br/>
  Advances earmark to the current global earmark weight, applies any past redemption not yet reflected on the account by rewinding its earmark to the redemption block and then applying the redemption, applies collateral decay via the collateral weight, and recomputs locked collateral for the remaining debt. Updates all account weights/checkpoints.
  - `@param tokenId` - the account to sync
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_earmark">
  <summary>_earmark()</summary>

- **Description** - Advance global earmarking for this block.<br/><br/>
  Computes the new earmark amount since the last run, subtracts Transmuter’s newly accrued yield, then increases `_earmarkWeight` and `cumulativeEarmarked`. Finally stamps `lastEarmarkBlock`.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none

</details>
<details id="InternalOperations_calculateUnrealizedDebt">
  <summary>_calculateUnrealizedDebt(uint256 tokenId)</summary>

- **Description** - Gets a snapshot of what account debt values will be after a sync occurs
  - `@param tokenId` - the id of the account owner used to access their account.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - a tuple (uint256, uint256, uint256) containing the following:
  - debt - the amount of debt the account will have after an update
  - earmarked - the amount of debt which is currently earmarked for redemption
  - collateral - the amount of collateral that has yet to be redeemed
- **Emits** - none
- **Reverts** - none

</details>
<details id="InternalOperations_liquidate">
  <summary>_liquidate(uint256 accountId)</summary>

- **Description** - Internal helper that performs the liquidation logic for an undercollateralized account.<br/><br/>
  First syncs state and applies earmarking so the account is up to date, then repays earmarked debt if present. If that restores the position above the collateralization lower bound, a repayment fee denominated in yield is paid to the caller and no liquidation is performed. If the position remains below the lower bound, proceeds to liquidate, seizing yieldToken-denominated collateral and paying the liquidator fees. If the account does not have enough to cover liquidation fees, or the entire Alchemist is undercollateralized, then the liquidator will be paid using the funds from this Alchemist's `alchemistFeeVault`.
  - `@param accountId` - the tokenId of the account to liquidate
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns**
  - `amountLiquidated` - if liquidation happened: collateral in yield seized; if only repayment happened: the repaid amount in yield; If the tokenAdapter prices the yieldToken at 0, returns 0
  - `feeInYield` - liquidator/repayment fee paid in yield tokens
  - `feeInUnderlying` - additional liquidator fee paid in underlying from this Alchemist's `alchemistFeeVault` (if needed)
- **Emits** - none
- **Reverts** - none
</details>

<details id="InternalOperations_doLiquidation">
  <summary>_doLiquidation(uint256 accountId, uint256 collateralInUnderlying, uint256 repaidAmountInYield)</summary>

- **Description** - Performs isolated liquidation logic. Occurring after `_liquidate()` handles syncing/earmarking, and once an account is already determined to be below the collateralization lower bound.<br/><br/>
  Calculates liquidation terms using account and global ratios, converts debt-denominated amounts to tokens, reduces account debt, and seizes collateral in yield tokens. It then transfers amount seized minus fees to the Transmuter, and pays the liquidator fees using user collateral, or from this Alchemist’s `alchemistFeeVault`.
  - `@param accountId` - the tokenId of the account being liquidated
  - `@param collateralInUnderlying` - the account’s collateral value expressed in underlying units (used for liquidation math)
  - `@param repaidAmountInYield` - the amount of debt paid off in yield token during earmarking settlement prior to this liquidation
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns**
  - `amountLiquidated` — the amount of yield tokens seized in \_doLiquidation, plus the amount seized prior to this function call for earmarking repayment (forwarded to this function as `repaidAmountInYield`)
  - `feeInYield` — base fee paid to the liquidator in yield tokens, coming from user collateral
  - `feeInUnderlying` — additional fee paid to the liquidator in underlying tokens, coming from the fee vault
- **Emits** - none
- **Reverts** - none

</details>
<details id="InternalOperations_approveMint">
  <summary>_approveMint(uint256 ownerTokenId, address spender, uint256 amount)</summary>

- **Description** - Isolated logic to overwrite the mint allowance for `spender` under the account’s current `allowancesVersion`, enabling `spender` to mint debt on behalf of `ownerTokenId`. Check and requires done outside of the scope of this call.
  - `@param ownerTokenId` - the Id of the account for which a new minting limit is being approved
  - `@param spender` - the address allowed to mint on behalf of owner of the position identified by `ownerTokenId`
  - `@param amount` - the maximum debt the `spender` may mint (for the current `allowancesVersion`)
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`ApproveMint(uint256 indexed ownerTokenId, address indexed spender, uint256 amount)`](/dev/alchemist/alchemist-contract#Events_ApproveMint)
- **Reverts** - none
</details>
<details id="InternalOperations_mint">
  <summary>_mint(uint256 tokenId, uint256 amount, address recipient)</summary>

- **Description** - Internal function for performing mint logic.<br/><br/>
  Adds debt to the account, validates collateralization, then mints debt tokens to `recipient`. Updates global issuance and records `lastMintBlock` to prevent same-block repay/burn exploits.
  - `@param tokenId` - the id of the position to mint debt for
  - `@param amount` - the amount of debt tokens to mint
  - `@param recipient` - address receiving the minted debt tokens
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits**
  - [`Mint(uint256 indexed tokenId, uint256 amount, address recipient)`](/dev/alchemist/alchemist-contract#Events_Mint)
- **Reverts** - [`Undercollateralized()`](/dev/alchemist/alchemist-contract#Error_Undercollateralized) — if minting would violate the minimum collateralization

</details>
<details id="InternalOperations_forceRepay">
  <summary>_forceRepay(uint256 accountId, uint256 amount)</summary>

- **Description** - Repays earmarked debt using the account’s collateral (denominated in yieldToken).<br/><br/>
  Earmarks and syncs to update global/account state, then reduces account debt through repayment. First consumes earmarked debt, then deducts the repayment from collateral. (yieldToken)<br/>
  Charges a protocol fee if collateral remains to pay it, and only after funding the repayment. Transfers the repaid yield to the Transmuter.<br/><br/>
  Difference between \_forceRepay and \_liquidate:<br/>
  Both use collateral to cover the cost, however for different purposes. ForceRepay is using collateral to reconcile earmarked debt. This may or may not bring collateralization ratio to the correct threshold. Liquidation occurs afterwords and uses collateral to reconcile LTV such that it meets the required threshold. ForceRepay occurs before Liquidations do.
  - `@param accountId` - the id of the position to repay debt for
  - `@param amount` - desired repayment in debt tokens
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 creditToYield` - amount of yield tokens that were repaid and sent to the Transmuter
- **Emits** - none
- **Reverts** - No outstanding debt in the account to repay - [`UnknownAccountOwnerIDError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) — invalid `accountId`

</details>
<details id="InternalOperations_addDebt">
  <summary>_addDebt(uint256 tokenId, uint256 amount)</summary>

- **Description** - Increase an account’s debt and lock the corresponding amount of collateral required by `minimumCollateralization`.<br/><br/>
  Ensures sufficient free collateral exists, then updates the account’s locked collateral `rawLocked`, and global `_totalLocked` collateral.
  - `@param tokenId` - the id of the account to modify
  - `@param amount` - the amount to increase debt by
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - [`Undercollateralized()`](/dev/alchemist/alchemist-contract#Error_Undercollateralized) - not enough free collateral to lock for the additional debt

</details>
<details id="InternalOperations_subDebt">
  <summary>_subDebt(uint256 tokenId, uint256 amount)</summary>

- **Description** - Decrease an account’s debt and free the corresponding portion of locked collateral.<br/><br/>
  Updates `rawLocked` and global `_totalLocked` collateral.
  - `@param tokenId` - the id of the account to modify
  - `@param amount` - the amount to increase debt by
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_checkAccountOwnership">
  <summary>_checkAccountOwnership(address owner, address user)</summary>

- **Description** - Confirms `user` is the same as `owner`. Reverts if not.
  - `@param owner` - the address of the owner of the account
  - `@param user` - the address attempting access
- **Visibility Specifier** - internal
- **State Mutability Specifier** - pure
- **Returns** - none
- **Emits** - none
- **Reverts** - [`UnauthorizedAccountAccessError()`](/dev/alchemist/alchemist-contract#Error_UnauthorizedAccountAccessError) - owner and user are not the same
</details>
<details id="InternalOperations_checkForValidAccountId">
  <summary>_checkForValidAccountId(uint256 tokenId)</summary>

- **Description** - Confirms the `tokenId` corresponds to an existing account NFT, or reverts.
  - `@param tokenId` - the account ID to check
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - none
- **Emits** - none
- **Reverts** - [`UnknownAccountOwnerIDError()`](/dev/alchemist/alchemist-contract#Error_UnknownAccountOwnerIDError) — tokenId not linked to a valid NFT
</details>
<details id="InternalOperations_tokenExists">
  <summary>_tokenExists(address nft, uint256 tokenId)</summary>

- **Description** - Utility to check if an alchemist NFT position exists for a given tokenId.
  - `@param nft` - the address of the AlchemistV3NFTPosition contract
  - `@param tokenId` - the tokenId to check for
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `bool exists`
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_checkState">
  <summary>_checkState(bool expression)</summary>

- **Description** - Guard for internal invariants. Reverts if `expression` evaluates false.
  - `@param expression` - boolean to assert
- **Visibility Specifier** - internal
- **State Mutability Specifier** - pure
- **Returns** - none
- **Emits** - none
- **Reverts** - [`IllegalState()`](/dev/alchemist/alchemist-contract#Error_IllegalState) — assertion failed
</details>
<details id="InternalOperations_validate">
  <summary>_validate(uint256 tokenId)</summary>

- **Description** - Verifies the account identified by `tokenId` meets minimum collateralization. Reverts if undercollateralized.
  - `@param tokenId` - the id of the account to validate
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - none
- **Emits** - none
- **Reverts** - [`Undercollateralized()`](/dev/alchemist/alchemist-contract#Error_Undercollateralized) — account not sufficiently collateralized
</details>
<details id="InternalOperations_isUnderCollateralized">
  <summary>_isUnderCollateralized(uint256 tokenId)</summary>

- **Description** - Returns true if the specified account is below the minimum collateralization ratio, otherwise returns false.
  - `@param tokenId` - the id of the account being checked
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `bool undercollateralized`
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_getTotalUnderlyingValue">
  <summary>_getTotalUnderlyingValue()</summary>

- **Description** - Calculates the total value of this Alchemist in underlying tokens by converting the yield tokens deposited into their equivalent underlying-denominated amount.
- **Visibility Specifier** - internal
- **State Mutability Specifier** - view
- **Returns** - `uint256 totalUnderlyingValue`
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_decreaseMintAllowance">
  <summary>_decreaseMintAllowance(uint256 ownerTokenId, address spender, uint256 amount)</summary>

- **Description** - Reduce a spender’s allowance to mint on behalf of an account. The reduction applies within the account’s current `allowancesVersion`. No checks or events are emitted; calling functions are responsible for validating sufficient allowance exists before this decrease.
  - `@param ownerTokenId` - the tokenId of the account for which allowance is granted
  - `@param spender` - the address whose allowance is being decreased
  - `@param amount` - the amount by which to decrease the allowance
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - none
- **Emits** - none
- **Reverts** - none
</details>
<details id="InternalOperations_resolveRepaymentFee">
  <summary>_resolveRepaymentFee(uint256 accountId, uint256 repaidAmountInYield) → (uint256 fee)</summary>

- **Description** - Calculates a repayment fee in yield tokens when debt is repaid.<br/><br/>
  Deducts the fee from the account’s collateral balance and returns the fee for transfer to the liquidator.
  - `@param accountId` - the tokenId of the account incurring the repayment fee
  - `@param repaidAmountInYield` - the repaid amount in yield tokens
- **Visibility Specifier** - internal
- **State Mutability Specifier** - nonpayable
- **Returns** - `uint256 fee` - repayment fee denominated in yield tokens
- **Emits** - none
- **Reverts** - none
</details>

### Reading State

> Reads derived, calculated, or internal state. For getters of public variables see the Variable section.

<details id="ReadingState_getCDP">
  <summary>getCDP(uint256 tokenId)</summary>

- **Description** - Gets an Account's simulated up-to-date collateral, debt, and earmarked amounts. (as if it were synced to be current with global state)
  - `@param tokenId` - the id used to identify the account.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - a tuple (uint256, uint256, uint256) containing the following:
  - debt - the amount of debt the account will have after an update
  - earmarked - the amount of debt which is currently earmarked for redemption
  - collateral - the amount of collateral that has yet to be redeemed
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_getTotalDeposited">
  <summary>getTotalDeposited()</summary>

- **Description** - Gets the Alchemist's balance of yieldTokens.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - uint256 balance
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_getMaxBorrowable">
  <summary>getMaxBorrowable(uint256 tokenId)</summary>

- **Description** - Gets an Account's max amount of debtTokens that they can borrow (mint) given their outstanding LTV and deposited collateral.
  - `@param tokenId` - the id used to identify the account.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - uint256 maxBorrowable
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_mintAllowance">
  <summary>mintAllowance(uint256 ownerTokenId, address spender)</summary>

- **Description** - Gets the max amount of debt an approved spender is allowed to mint on behalf of an owner's account.
  - `@param ownerTokenId` - the id used to identify the account of the owner.
  - `@param spender` - the address of the person being granted allowance to mint on behalf of the owner.
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - uint256 mintAllowance
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_getTotalUnderlyingValue">
  <summary>getTotalUnderlyingValue()</summary>

- **Description** - Calculates the total value of the alchemist in the underlying token
- **Visibility Specifier** - external
- **State Mutability Specifier** - view
- **Returns** - uint256 totalTokenTVLInUnderlying
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_totalValue">
  <summary>totalValue(uint256 tokenId)</summary>

- **Description** - Calculates the total value of a specific accounts up-to-date collateral value by first converting to underlying, and then denominating in debt tokens. Used internally during liquidations.
  - `@param tokenId` - the id used to identify the account.
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - uint256 totalTokenTVLInUnderlying
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_convertYieldTokensToUnderlying">
  <summary>convertYieldTokensToUnderlying(uint256 amount)</summary>

- **Description** - Convert yield tokens to underlying tokens using the adapter price and the yield token’s decimals. Returns the underlying-denominated amount
  - `@param amount` - yieldToken amount
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 underlyingAmount`
- **Emits** - none
- **Reverts** - none

</details>
<details id="ReadingState_normalizeUnderlyingTokensToDebt">
  <summary>normalizeUnderlyingTokensToDebt(uint256 amount)</summary>

- **Description** - Scale an underlyingToken-denominated amount into debt units via `underlyingConversionFactor`.
  - `@param amount` - underlying token amount
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 debtAmount`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_convertYieldTokensToDebt">
  <summary>convertYieldTokensToDebt(uint256 amount)</summary>

- **Description** - A multi-step conversion starting with an amount in yieldToken, converting to underlyingToken, and then finally from underlyingToken to debtToken.<br/><br/>
  First converts yield to underlying with the adapter price/decimals, then normalizes underlying to debt units with `underlyingConversionFactor`.
  - `@param amount` - yieldToken amount
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 debtAmount`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_normalizeDebtTokensToUnderlying">
  <summary>normalizeDebtTokensToUnderlying(uint256 amount)</summary>

- **Description** - Scale a debtToken-denominated amount into underlyingToken units via `underlyingConversionFactor`.
  - `@param amount` - debtToken amount
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 underlyingAmount`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_convertUnderlyingTokensToYield">
  <summary>convertUnderlyingTokensToYield(uint256 amount)</summary>

- **Description** - Convert underlying tokens to yield tokens using the adapter price and the yield token’s decimals. Returns 0 if adapter price is unavailable.
  - `@param amount` - underlyingToken amount
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 yieldAmount`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_convertDebtTokensToYield">
  <summary>convertDebtTokensToYield(uint256 amount)</summary>

- **Description** - A multi-step conversion starting with an amount in debtToken, converting to underlyingToken, and then finally from underlyingToken to yieldToken.<br/><br/>
  First normalizes debt to underlying with `underlyingConversionFactor`, then converts underlying to yield using the adapter price/decimals.
  - `@param amount` - debtToken amount
- **Visibility Specifier** - public
- **State Mutability Specifier** - view
- **Returns** - `uint256 yieldAmount`
- **Emits** - none
- **Reverts** - none
</details>
<details id="ReadingState_calculateLiquidation">
  <summary>calculateLiquidation(uint256 collateral, uint256 debt, uint256 targetCollateralization, uint256 alchemistCurrentCollateralization, uint256 alchemistMinimumCollateralization, uint256 feeBps)</summary>

- **Description** - Calculate how much debt to burn and collateral to seize to restore a position to `targetCollateralization`, including a fee on surplus collateral. (collateral - debt) Fully liquidates if position’s debt ≥ collateral, or the protocol’s global collateralization is below its minimum. Otherwise, charges a fee from surplus, checks if the target is already met, and if not, computes the minimal partial liquidation needed to reach the target.
  - `@param collateral` - position collateral denominated in underlying units
  - `@param debt` - position debt denonimated in debt units
  - `@param targetCollateralization` - per-position target collateral ratio
  - `@param alchemistCurrentCollateralization` - global current ratio
  - `@param alchemistMinimumCollateralization` - global minimum ratio
  - `@param feeBps` - fee in basis points taken from surplus
- **Visibility Specifier** - public
- **State Mutability Specifier** - pure
- **Returns**
  - `grossCollateralToSeize` — total collateral to seize including the fee, denominated in debt-units
  - `debtToBurn` — amount of debt to burn
  - `fee` — the fee taken from surplus
  - `outsourcedFee` — the fee charged in the event of a full-liquidation
- **Emits** - none
- **Reverts** - none
</details>

## Errors

- <span id="Error_Undercollateralized"><strong><code>Undercollateralized()</code></strong> - An error which is used to indicate that an operation failed because an account became undercollateralized.</span>
- <span id="Error_LiquidationError"><strong><code>LiquidationError()</code></strong> - An error which is used to indicate that a liquidate operation failed because an account is sufficiently collateralized.</span>
- <span id="Error_UnauthorizedAccountAccessError"><strong><code>UnauthorizedAccountAccessError()</code></strong> - An error which is used to indicate that a user is performing an action on an account that requires account ownership</span>
- <span id="Error_BurnLimitExceeded"><strong><code>BurnLimitExceeded(uint256 amount, uint256 available)</code></strong> - An error which is used to indicate that a burn operation failed because the transmuter requires more debt in the system.</span>
- <span id="Error_UnknownAccountOwnerIDError"><strong><code>UnknownAccountOwnerIDError()</code></strong> - An error which is used to indicate that the account id used is not linked to any owner</span>
- <span id="Error_AlchemistV3NFTZeroAddressError"><strong><code>AlchemistV3NFTZeroAddressError();</code></strong> - An error which is used to indicate that the NFT address being set is the zero address</span>
- <span id="Error_AlchemistV3NFTAlreadySetError"><strong><code>AlchemistV3NFTAlreadySetError()</code></strong> - An error which is used to indicate that the NFT address for the Alchemist has already been set</span>
- <span id="Error_AlchemistVaultTokenMismatchError"><strong><code>AlchemistVaultTokenMismatchError();</code></strong> - An error which is used to indicate that the token address for the AlchemistTokenVault does not match the underlyingToken</span>
- <span id="Error_CannotRepayOnMintBlock"><strong><code>CannotRepayOnMintBlock()</code></strong> - An error which is used to indicate that a user is trying to repay on the same block they are minting</span>

## Events

- <span id="Events_PendingAdminUpdated"><strong><code>PendingAdminUpdated(address pendingAdmin)</code></strong> - Emitted when the pending admin is updated.</span>
- <span id="Events_AlchemistFeeVaultUpdated"><strong><code>AlchemistFeeVaultUpdated(address alchemistFeeVault)</code></strong> - Emitted when the alchemist Fee vault is updated.</span>
- <span id="Events_AdminUpdated"><strong><code>AdminUpdated(address admin)</code></strong> - Emitted when the administrator is updated.</span>
- <span id="Events_DepositCapUpdated"><strong><code>DepositCapUpdated(uint256 value)</code></strong> - Emitted when the deposit cap is updated.</span>
- <span id="Events_GuardianSet"><strong><code>GuardianSet(address guardian, bool state)</code></strong> - Emitted when a guardian is added or removed from the alchemist.</span>
- <span id="Events_TokenAdapterUpdated"><strong><code>TokenAdapterUpdated(address adapter)</code></strong> - Emitted when a new token adapter is set in the alchemist.</span>
- <span id="Events_TransmuterUpdated"><strong><code>TransmuterUpdated(address transmuter)</code></strong> - Emitted when the transmuter is updated.</span>
- <span id="Events_MinimumCollateralizationUpdated"><strong><code>MinimumCollateralizationUpdated(uint256 minimumCollateralization)</code></strong> - Emitted when the minimum collateralization is updated.</span>
- <span id="Events_GlobalMinimumCollateralizationUpdated"><strong><code>GlobalMinimumCollateralizationUpdated(uint256 globalMinimumCollateralization)</code></strong> - Emitted when the global minimum collateralization is updated.</span>
- <span id="Events_CollateralizationLowerBoundUpdated"><strong><code>CollateralizationLowerBoundUpdated(uint256 collateralizationLowerBound)</code></strong> - Emitted when the collateralization lower bound (for a liquidation) is updated.</span>
- <span id="Events_DepositsPaused"><strong><code>DepositsPaused(bool isPaused)</code></strong> - Emitted when deposits are paused or unpaused in the alchemist.</span>
- <span id="Events_LoansPaused"><strong><code>LoansPaused(bool isPaused)</code></strong> - Emitted when loans are paused or unpaused in the alchemist.</span>
- <span id="Events_ApproveMint"><strong><code>ApproveMint(uint256 indexed ownerTokenId, address indexed spender, uint256 amount)</code></strong> - Emitted when `owner` grants `spender` the ability to mint debt tokens on its behalf.</span>
- <span id="Events_Deposit"><strong><code>Deposit(uint256 amount, uint256 indexed recipientId)</code></strong> - Emitted when a user deposits `amount` of yieldToken to `recipient`.</span>
- <span id="Events_Withdraw"><strong><code>Withdraw(uint256 amount, uint256 indexed tokenId, address recipient)</code></strong> - Emitted when yieldToken is withdrawn from the account owned by `owner` to `recipient`.</span>
- <span id="Events_Mint"><strong><code>Mint(uint256 indexed tokenId, uint256 amount, address recipient)</code></strong> - Emitted when `amount` debt tokens are minted to `recipient` using the account owned by `owner`.</span>
- <span id="Events_Burn"><strong><code>Burn(address indexed sender, uint256 amount, uint256 indexed recipientId)</code></strong> - Emitted when `sender` burns `amount` debt tokens to grant credit to account owner `recipientId`.</span>
- <span id="Events_Repay"><strong><code>Repay(address indexed sender, uint256 amount, uint256 indexed recipientId, uint256 credit)</code></strong> - Emitted when `amount` of `underlyingToken` are repaid to grant credit to account owned by `recipientId`.</span>
- <span id="Events_Redemption"><strong><code>Redemption(uint256 amount)</code></strong> - Emitted when the transmuter triggers a redemption.</span>
- <span id="Events_ProtocolFeeUpdated"><strong><code>ProtocolFeeUpdated(uint256 fee)</code></strong> - Emitted when the protocol debt fee is updated.</span>
- <span id="Events_LiquidatorFeeUpdated"><strong><code>LiquidatorFeeUpdated(uint256 fee)</code></strong> - Emitted when the liquidator fee is updated.</span>
- <span id="Events_RepaymentFeeUpdated"><strong><code>RepaymentFeeUpdated(uint256 fee)</code></strong> - Emitted when the repayment fee is updated.</span>
- <span id="Events_ProtocolFeeReceiverUpdated"><strong><code>ProtocolFeeReceiverUpdated(address receiver)</code></strong> - Emitted when the fee receiver is updated.</span>
- <span id="Events_Liquidated"><strong><code>Liquidated(uint256 indexed accountId, address liquidator, uint256 amount, uint256 feeInYield, uint256 feeInUnderlying)</code></strong> - Emitted when account owned by `accountId` has been liquidated.</span>
- <span id="Events_BatchLiquidated"><strong><code>BatchLiquidated(uint256[] indexed accounts, address liquidator, uint256 amount, uint256 feeInYield, uint256 feeInETH)</code></strong> - Emitted when accounts have been batch liquidated.</span>
- <span id="Events_MintAllowancesReset"><strong><code>MintAllowancesReset(uint256 indexed tokenId)</code></strong> - Emitted when all mint allowances for account managed by `tokenId` are reset.</span>
