---
sidebar_position: 8
hide_title: true
title: AlchemistV3Position
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="AlchemistV3Position" />

The AlchemistV3Position contract is an ERC721 NFT that represents individual user positions in the Alchemist. Each position has a unique token ID that maps to an Account in the AlchemistV3 contract, tracking the user's deposited collateral and outstanding debt. Only the associated AlchemistV3 contract can mint and burn position tokens. When a position NFT is transferred, all mint allowances (`approveMint`) on that position are automatically reset.

## Variables

<details>
  <summary>alchemist</summary>

  - **Description** - The address of the AlchemistV3 contract. Only this address can mint and burn position tokens. Set once on deployment.
  - **Type** - `address`
  - **Used By**
    - [`onlyAlchemist`](/dev/alchemist/alchemist-v3-position-contract#Modifiers_onlyAlchemist)
    - [`_update(address to, uint256 tokenId, address auth)`](/dev/alchemist/alchemist-v3-position-contract#InternalOperations_update)
  - **Read By** - `alchemist()`
</details>
<details>
  <summary>admin</summary>

  - **Description** - The address authorized to update the metadata renderer and transfer admin rights. Set on deployment.
  - **Type** - `address`
  - **Used By**
    - [`onlyAdmin`](/dev/alchemist/alchemist-v3-position-contract#Modifiers_onlyAdmin)
  - **Updated By**
    - [`setAdmin(address newAdmin)`](/dev/alchemist/alchemist-v3-position-contract#AdminActions_setAdmin)
  - **Read By** - `admin()`
</details>
<details>
  <summary>metadataRenderer</summary>

  - **Description** - The address of the external contract that generates tokenURI metadata (SVG artwork) for position NFTs. Can be updated by the admin.
  - **Type** - `address`
  - **Used By**
    - [`tokenURI(uint256 tokenId)`](/dev/alchemist/alchemist-v3-position-contract#ReadingState_tokenURI)
  - **Updated By**
    - [`setMetadataRenderer(address renderer)`](/dev/alchemist/alchemist-v3-position-contract#AdminActions_setMetadataRenderer)
  - **Read By** - `metadataRenderer()`
</details>

## Modifiers

<details id="Modifiers_onlyAlchemist">
  <summary>onlyAlchemist</summary>

  - **Description** - Restricts function execution to the `alchemist` address.
  - **Reverts**
    - `CallerNotAlchemist()` - when `msg.sender` is not the Alchemist contract.
</details>
<details id="Modifiers_onlyAdmin">
  <summary>onlyAdmin</summary>

  - **Description** - Restricts function execution to the `admin` address.
  - **Reverts**
    - `CallerNotAdmin()` - when `msg.sender` is not the admin.
</details>

## Functions

### Alchemist Actions

> Functions that can only be called by the AlchemistV3 contract.

<details id="AlchemistActions_mint">
  <summary>mint(address to)</summary>

  - **Description** - Mints a new position NFT to the specified address. Increments the internal token ID counter and assigns the new ID to the recipient.
    - `@param to` - The address to receive the newly minted position NFT.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Returns** - `uint256` - the unique token ID of the newly minted position.
  - **Reverts**
    - `CallerNotAlchemist()` - if `msg.sender` is not the Alchemist
    - `MintToZeroAddressError()` - if `to` is the zero address
  - **Emits** - ERC721 `Transfer(address(0), to, tokenId)`
</details>
<details id="AlchemistActions_burn">
  <summary>burn(uint256 tokenId)</summary>

  - **Description** - Burns a position NFT, permanently destroying it. Used by the Alchemist when a position is fully closed.
    - `@param tokenId` - The token ID of the position to burn.
  - **Visibility Specifier** - public
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `CallerNotAlchemist()` - if `msg.sender` is not the Alchemist
  - **Emits** - ERC721 `Transfer(owner, address(0), tokenId)`
</details>

### Admin Actions

> Functions that can only be called by the current admin.

<details id="AdminActions_setMetadataRenderer">
  <summary>setMetadataRenderer(address renderer)</summary>

  - **Description** - Sets or updates the external contract used to generate tokenURI metadata for position NFTs.
    - `@param renderer` - The address of the new metadata renderer contract.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `CallerNotAdmin()` - if `msg.sender` is not the admin
  - **Emits** - none
</details>
<details id="AdminActions_setAdmin">
  <summary>setAdmin(address newAdmin)</summary>

  - **Description** - Transfers admin rights to a new address. Unlike other contracts in the protocol, this is a single-step transfer with no pending/accept pattern.
    - `@param newAdmin` - The address of the new admin.
  - **Visibility Specifier** - external
  - **State Mutability Specifier** - nonpayable
  - **Reverts**
    - `CallerNotAdmin()` - if `msg.sender` is not the admin
  - **Emits** - none
</details>

### Internal Operations

<details id="InternalOperations_update">
  <summary>_update(address to, uint256 tokenId, address auth)</summary>

  - **Description** - Override of the ERC721 transfer hook that runs before every token transfer. When a position NFT is transferred (not during minting), this calls `alchemist.resetMintAllowances(tokenId)` to clear all mint allowances on that position. This prevents a previous owner's approved minters from borrowing against the position after it changes hands.
    - `@param to` - The address receiving the token.
    - `@param tokenId` - The token ID being transferred.
    - `@param auth` - The address authorized to perform the transfer.
  - **Visibility Specifier** - internal
  - **State Mutability Specifier** - nonpayable
  - **Returns** - `address` - the previous owner of the token.
</details>

### Reading State

<details id="ReadingState_tokenURI">
  <summary>tokenURI(uint256 tokenId)</summary>

  - **Description** - Returns the token URI containing embedded SVG metadata for a position NFT. Delegates to the external `metadataRenderer` contract.
    - `@param tokenId` - The token ID to get the URI for.
  - **Visibility Specifier** - public
  - **State Mutability Specifier** - view
  - **Returns** - `string memory` - the full token URI with embedded metadata.
  - **Reverts**
    - If the token does not exist (standard ERC721 revert)
    - `MetadataRendererNotSet()` - if `metadataRenderer` is the zero address
</details>

## Errors

- <span id="Errors_CallerNotAlchemist"><strong><code>CallerNotAlchemist()</code></strong> - Reverts when a function restricted to the Alchemist contract is called by any other address.</span>
- <span id="Errors_CallerNotAdmin"><strong><code>CallerNotAdmin()</code></strong> - Reverts when a function restricted to the admin is called by any other address.</span>
- <span id="Errors_AlchemistZeroAddressError"><strong><code>AlchemistZeroAddressError()</code></strong> - Reverts during construction if the Alchemist address is the zero address.</span>
- <span id="Errors_MintToZeroAddressError"><strong><code>MintToZeroAddressError()</code></strong> - Reverts when attempting to mint a position NFT to the zero address.</span>
- <span id="Errors_MetadataRendererNotSet"><strong><code>MetadataRendererNotSet()</code></strong> - Reverts when `tokenURI` is called but no metadata renderer has been set.</span>