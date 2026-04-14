---
sidebar_position: 1
hide_title: true
title: Architecture Overview
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Architecture Overview" />

Alchemix V3 is comprised of 3 core components: the Mix-Yield Token, the Alchemist, and the Transmuter. 
The Mix-Yield token is an aggregated yield vault built on Morpho's [`Vault2 contract`](https://github.com/morpho-org/vault-v2/blob/main/src/VaultV2.sol). It serves as the yield-bearing collateral for the Alchemist.
The Alchemist is the Vault contract which accepts deposits of Mix-Yield Token, and allows minting of synthetic alAssets as debt. 
The Transmuter is the fixed-duration mechanism for redeeming alAssets for their corresponding underlying asset at a 1:1 rate.
Each of these core components have their own contract, and surrounding contracts that control how we interact with, and manage them.

## Mix-Yield Token (MYT)

There will be two instances of Morpho's [`Vault2 contract`](https://github.com/morpho-org/vault-v2/blob/main/src/VaultV2.sol) per chain. One (Mix ETH) will be a collection of ETH-denominated yield strategies, and the other (Mix USDC) will be a collection of USDC-denominated yield strategies.
Each strategy within an MYT will have its own strategy adapter contract derived from our base [`MYTStrategy contract`](/myt/myt-contract.md). These contracts define how individual allocation to, and deallocation from, the underlying strategy occur. It also reports back how many assets are held by the strategy so our vaults can track total value and calculate share price.
In order to interact with the MYT in a permissioned way, we have two utility contracts: the [`AlchemistCurator`](/myt/alchemist-curator-contract.md), and the  [`AlchemistAllocator`](/myt/alchemist-allocator-contract.md).
The AlchemistCurator manages which strategies exist on the vault in the first place, and how much capital they may hold. This can be thought of as the governance layer, and allows operators to add and remove strategies, and influence caps on a per-strategy basis.
The AlchemistAllocator is the operational layer that actually moves funds between strategies. Admins and operators call `allocate` and `deallocate` with various arguments to rebalance capital across strategies, validated against multiple cap layers, and this in turn calls the proper MytStrategy adapter contract per strategy to perform its actions.
The [`AlchemistStrategyClassifier`](/myt/alchemist-strategy-classifier-contract.md) is an additional utility contract which defines risk-based caps. It maps strategies to defined risk levels and sets caps per risk class.

## Alchemist

There will be two [`Alchemist contract`](/alchemist/alchemist-contract.md) instances deployed on each chain we deploy to. One which will accept deposits of Mix ETH and mint alETH, and another which will accept deposits of Mix USDC and allow minting of alUSD. The Alchemist contracts are interacted directly by users.
The [`AlchemistRouter`](/alchemist/alchemist-router-contract.md) is a convenience contract that can be used to batch multi-step flows within the Alchemist. It allows users to bundle the wrapping of ETH, depositing into a mix-yield-token, depositing mix-yield-token into the Alchemist, and borrowing; all in one transaction. It also handles repayments, withdrawals, and claims with a similar batching approach.
The [`AlchemistV3Position`](/alchemist/alchemist-v3-position-contract.md) is an ERC721 NFT contract that represents users positions in the Alchemist. The Alchemist mints an NFT when the user opens a position, and burns their NFT when the position is closed. The tokenID maps to the user's Account struct in the Alchemist contract.
The fee vaults: [`AlchemistETHVault`](/alchemist/alchemist-eth-vault-contract.md) and [`AlchemistTokenVault`](/alchemist/alchemist-token-vault-contract.md) are used to escrow funds which cover Alchemist obligations to liquidators and redeemers when the Alchemist's balance is insufficient.

## Transmuter

The [`Transmuter`](/dev/transmuter/transmuter-contract) handles redemptions of synthetic debt tokens back to underlying assets. Each Alchemist instance maps to one Transmuter instance. 
For a Transmuter mapped to an Alchemist which mints alETH, users may deposit alETH to create a time-locked position which linearly vests into a position of exactly the same amount of underlying (Mix ETH) in a fixed pre-determined time period. 
For a Transmuter mapped to an Alchemist which mints alUSD, users may deposit alUSD to create a time-locked position which linearly vests into a position of exactly the same amount of underlying (Mix USDC) in a fixed pre-determined time period.
When Transmuter positions are closed (claimed), the Transmuter pulls yield tokens from its corresponding Alchemist via the `redeem()` function on the Alchemist and converts them to pay out the user. 