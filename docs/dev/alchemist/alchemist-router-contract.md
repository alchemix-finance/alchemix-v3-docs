---
sidebar_position: 3
hide_title: true
title: AlchemistRouter
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="AlchemistRouter" />

The AlchemistRouter is a stateless convenience contract that batches multi-step user interactions with the Alchemist into single transactions. It handles wrapping ETH to WETH, depositing into the MYT vault, depositing MYT shares into the Alchemist, borrowing, repaying, withdrawing, and claiming transmuter positions all in one call. The router never holds tokens or NFTs between transactions.

All functions include a `deadline` parameter for transaction expiration, and deposit/withdraw functions include `minSharesOut` or `minAmountOut` parameters for slippage protection.

## Functions

### Deposit

> Functions that deposit assets into the Alchemist, optionally borrowing in the same transaction. For all deposit functions, pass `tokenId = 0` to create a new position, or an existing token ID to deposit into it. For existing positions the caller must own the NFT. If `borrowAmount > 0` on an existing position, the caller must have called `approveMint(tokenId, router, borrowAmount)` on the Alchemist beforehand.

<details id="Deposit_depositUnderlying">
  <summary>depositUnderlying(address alchemist, uint256 tokenId, uint256 amount, uint256 borrowAmount, uint256 minSharesOut, uint256 deadline)</summary>

  - **Description** - Deposits underlying tokens (e.g. WETH, USDC) into the MYT vault and then into the Alchemist, optionally borrowing debt tokens in the same transaction.<br/><br/>
    Transfers `amount` of the underlying token from the caller, deposits into the MYT vault to receive shares, then deposits those shares into the Alchemist. If `tokenId` is 0, a new position NFT is minted and transferred to the caller. If borrowing, mints debt tokens to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param tokenId` - Position NFT token ID. Pass 0 to create a new position.
    - `@param amount` - Amount of underlying token to deposit.
    - `@param borrowAmount` - Amount of debt tokens to borrow. Pass 0 to skip borrowing.
    - `@param minSharesOut` - Minimum MYT shares to receive from the vault deposit (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Returns** - `uint256` - the position NFT token ID (newly minted or same as input).
  - **Reverts**
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Zero amount"` if `amount == 0`
    - With `"Slippage"` if MYT shares received are less than `minSharesOut`
    - With `"Not position owner"` if `tokenId != 0` and the caller doesn't own the position NFT
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>
<details id="Deposit_depositETH">
  <summary>depositETH(address alchemist, uint256 tokenId, uint256 borrowAmount, uint256 minSharesOut, uint256 deadline)</summary>

  - **Description** - Deposits native ETH by wrapping it to WETH, depositing into the MYT vault, and then into the Alchemist, optionally borrowing debt tokens in the same transaction.<br/><br/>
    Wraps `msg.value` as WETH, deposits into the MYT vault to receive shares, then deposits those shares into the Alchemist. If `tokenId` is 0, a new position NFT is minted and transferred to the caller. If borrowing, mints debt tokens to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param tokenId` - Position NFT token ID. Pass 0 to create a new position.
    - `@param borrowAmount` - Amount of debt tokens to borrow. Pass 0 to skip borrowing.
    - `@param minSharesOut` - Minimum MYT shares to receive from the vault deposit (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - payable
  - **Returns** - `uint256` - the position NFT token ID (newly minted or same as input).
  - **Reverts**
    - With `"No ETH sent"` if `msg.value == 0`
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Slippage"` if MYT shares received are less than `minSharesOut`
    - With `"Not position owner"` if `tokenId != 0` and the caller doesn't own the position NFT
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>
<details id="Deposit_depositMYT">
  <summary>depositMYT(address alchemist, uint256 tokenId, uint256 shares, uint256 borrowAmount, uint256 deadline)</summary>

  - **Description** - Deposits MYT vault shares directly into the Alchemist, skipping the vault deposit step. Optionally borrows debt tokens in the same transaction.<br/><br/>
    Transfers `shares` of MYT from the caller, deposits them into the Alchemist. If `tokenId` is 0, a new position NFT is minted and transferred to the caller. If borrowing, mints debt tokens to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param tokenId` - Position NFT token ID. Pass 0 to create a new position.
    - `@param shares` - Amount of MYT shares to deposit.
    - `@param borrowAmount` - Amount of debt tokens to borrow. Pass 0 to skip borrowing.
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Returns** - `uint256` - the position NFT token ID (newly minted or same as input).
  - **Reverts**
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Zero shares"` if `shares == 0`
    - With `"Not position owner"` if `tokenId != 0` and the caller doesn't own the position NFT
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>
<details id="Deposit_depositETHToVaultOnly">
  <summary>depositETHToVaultOnly(address alchemist, uint256 minSharesOut, uint256 deadline)</summary>

  - **Description** - Deposits native ETH into the MYT vault only, without creating or depositing into an Alchemist position. MYT shares are sent directly to the caller.<br/><br/>
    Wraps `msg.value` as WETH and deposits into the MYT vault. The resulting MYT shares go to the caller, not the router.
    - `@param alchemist` - The Alchemist contract address (used to resolve the MYT vault and underlying token).
    - `@param minSharesOut` - Minimum MYT shares to receive (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - payable
  - **Returns** - `uint256 shares` - MYT shares received.
  - **Reverts**
    - With `"No ETH sent"` if `msg.value == 0`
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Slippage"` if MYT shares received are less than `minSharesOut`
  - **Emits** - none directly; the MYT vault emits its own events.
</details>

### Repay

> Functions that repay debt on an existing position. Any MYT shares not consumed by the repayment are returned to the caller as MYT vault shares. Callers must redeem those shares separately if they want the underlying back.

<details id="Repay_repayUnderlying">
  <summary>repayUnderlying(address alchemist, uint256 recipientTokenId, uint256 amount, uint256 minSharesOut, uint256 deadline)</summary>

  - **Description** - Repays debt on a position using underlying tokens.<br/><br/>
    Transfers `amount` of the underlying token from the caller, deposits into the MYT vault to receive shares, then uses those shares to repay debt on the specified position. Any unused MYT shares (if the repayment exceeds remaining debt) are returned to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param recipientTokenId` - The position NFT token ID to repay debt on.
    - `@param amount` - Amount of underlying token to use for repayment.
    - `@param minSharesOut` - Minimum MYT shares from vault deposit (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Zero amount"` if `amount == 0`
    - With `"Slippage"` if MYT shares received are less than `minSharesOut`
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>
<details id="Repay_repayETH">
  <summary>repayETH(address alchemist, uint256 recipientTokenId, uint256 minSharesOut, uint256 deadline)</summary>

  - **Description** - Repays debt on a position using native ETH.<br/><br/>
    Wraps `msg.value` as WETH, deposits into the MYT vault to receive shares, then uses those shares to repay debt on the specified position. Any unused MYT shares are returned to the caller as MYT vault shares, not as ETH.
    - `@param alchemist` - The Alchemist contract address.
    - `@param recipientTokenId` - The position NFT token ID to repay debt on.
    - `@param minSharesOut` - Minimum MYT shares from vault deposit (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - payable
  - **Reverts**
    - With `"No ETH sent"` if `msg.value == 0`
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Slippage"` if MYT shares received are less than `minSharesOut`
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>

### Withdraw

> Functions that withdraw collateral from an Alchemist position and redeem MYT shares back to the underlying asset. The caller must approve this contract for the position NFT (ERC721 approve). The NFT is temporarily held by the router during the withdrawal and returned afterwards.<br/><br/>**WARNING:** The NFT round-trip resets ALL mint allowances (`approveMint`) on the position.

<details id="Withdraw_withdrawUnderlying">
  <summary>withdrawUnderlying(address alchemist, uint256 tokenId, uint256 shares, uint256 minAmountOut, uint256 deadline)</summary>

  - **Description** - Withdraws MYT shares from an Alchemist position, redeems them from the MYT vault for underlying tokens, and sends the underlying directly to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param tokenId` - The position NFT token ID to withdraw from.
    - `@param shares` - Amount of MYT shares to withdraw from the Alchemist.
    - `@param minAmountOut` - Minimum underlying tokens to receive (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Zero shares"` if `shares == 0`
    - With `"Invalid tokenId"` if `tokenId == 0`
    - With `"Not position owner"` if the caller doesn't own the position NFT
    - With `"Slippage"` if underlying tokens received are less than `minAmountOut`
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>
<details id="Withdraw_withdrawETH">
  <summary>withdrawETH(address alchemist, uint256 tokenId, uint256 shares, uint256 minAmountOut, uint256 deadline)</summary>

  - **Description** - Withdraws MYT shares from an Alchemist position, redeems them from the MYT vault for WETH, unwraps to native ETH, and sends the ETH to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param tokenId` - The position NFT token ID to withdraw from.
    - `@param shares` - Amount of MYT shares to withdraw from the Alchemist.
    - `@param minAmountOut` - Minimum ETH to receive (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"Zero shares"` if `shares == 0`
    - With `"Invalid tokenId"` if `tokenId == 0`
    - With `"Not position owner"` if the caller doesn't own the position NFT
    - With `"Slippage"` if ETH received is less than `minAmountOut`
    - With `"ETH transfer failed"` if the native ETH transfer to the caller fails
  - **Emits** - none directly; underlying Alchemist and vault contracts emit their own events.
</details>

### Transmuter Claim

> Functions for claiming matured transmuter positions and redeeming the resulting MYT shares in a single transaction.

<details id="TransmuterClaim_claimRedemption">
  <summary>claimRedemption(address alchemist, uint256 positionId, uint256 minAmountOut, uint256 deadline, bool unwrapETH)</summary>

  - **Description** - Claims a matured transmuter position, redeems the MYT shares received, and sends the proceeds to the caller. Any untransmuted synthetic tokens returned by the transmuter are forwarded to the caller as-is.<br/><br/>
    Takes custody of the transmuter position NFT (caller must have approved the router), calls `claimRedemption` on the transmuter (which burns the NFT), then redeems the MYT shares. If `unwrapETH` is true, the underlying WETH is unwrapped and sent as native ETH. If false, the underlying token is sent directly to the caller.
    - `@param alchemist` - The Alchemist contract address (used to resolve transmuter and MYT vault).
    - `@param positionId` - The transmuter position NFT token ID to claim.
    - `@param minAmountOut` - Minimum underlying tokens (or ETH if `unwrapETH`) to receive (slippage protection).
    - `@param deadline` - Timestamp after which the transaction reverts.
    - `@param unwrapETH` - If true, redeem to WETH and unwrap to native ETH before sending.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - With `"Expired"` if `block.timestamp > deadline`
    - With `"No MYT to redeem"` if the transmuter claim returns zero yield shares
    - With `"Slippage"` if underlying tokens (or ETH) received are less than `minAmountOut`
    - With `"ETH transfer failed"` if `unwrapETH` is true and the native ETH transfer to the caller fails
  - **Emits** - none directly; underlying Transmuter and vault contracts emit their own events.
</details>

### Internal Operations

<details id="InternalOperations_depositAndBorrow">
  <summary>_depositAndBorrow(address alchemist, address mytVault, uint256 shares, uint256 tokenId, uint256 borrowAmount)</summary>

  - **Description** - Unified deposit and optional borrow logic used by all deposit functions. Assumes MYT shares are already held by the router.<br/><br/>
    When `tokenId == 0`, creates a new position (NFT minted to router, then transferred to caller). When `tokenId != 0`, deposits into the existing position (NFT stays with the caller). If `borrowAmount > 0`, mints debt tokens using `mint` for new positions or `mintFrom` for existing ones.
    - `@param alchemist` - The Alchemist contract address.
    - `@param mytVault` - The MYT vault address.
    - `@param shares` - Amount of MYT shares to deposit.
    - `@param tokenId` - Position NFT token ID. 0 to create a new position.
    - `@param borrowAmount` - Amount of debt tokens to borrow. 0 to skip.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Returns** - `uint256` - the position NFT token ID.
</details>
<details id="InternalOperations_repayAndRefund">
  <summary>_repayAndRefund(address alchemist, address mytVault, uint256 shares, uint256 recipientTokenId)</summary>

  - **Description** - Approves the Alchemist to spend MYT shares, calls `repay`, clears the approval, and returns any unconsumed MYT shares to the caller. Uses a balance delta (not absolute `balanceOf`) to be donation-resistant.
    - `@param alchemist` - The Alchemist contract address.
    - `@param mytVault` - The MYT vault address.
    - `@param shares` - Amount of MYT shares to use for repayment.
    - `@param recipientTokenId` - The position NFT token ID to repay debt on.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
</details>
<details id="InternalOperations_claimRedemption">
  <summary>_claimRedemption(address alchemist, uint256 positionId, uint256 minAmountOut, bool unwrapETH)</summary>

  - **Description** - Shared claim logic used by the external `claimRedemption`. Takes custody of the transmuter NFT, claims the position (transmuter burns the NFT), forwards any returned synthetic tokens to the caller, then redeems MYT shares. When `unwrapETH` is true, redeems MYT to WETH, unwraps, and sends native ETH. When false, redeems MYT and sends the underlying directly to the caller.
    - `@param alchemist` - The Alchemist contract address.
    - `@param positionId` - The transmuter position NFT token ID to claim.
    - `@param minAmountOut` - Minimum underlying tokens (or ETH) to receive.
    - `@param unwrapETH` - If true, unwrap WETH to native ETH before sending.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
</details>
<details id="InternalOperations_receive">
  <summary>receive()</summary>

  - **Description** - Fallback function that accepts native ETH, but only during withdraw flows when the router is unwrapping WETH. Reverts in all other cases to prevent accidental ETH deposits.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - payable
  - **Reverts**
    - With `"Use depositETH"` if called outside of a WETH unwrap flow.
</details>