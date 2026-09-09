---
sidebar_position: 1
hide_title: true
title: Architecture Overview
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Architecture Overview" />

Alchemix V3 is comprised of 3 core components: the Mix-Yield Token, the Alchemist, and the Transmuter.
The Mix-Yield token is an aggregated yield vault built on Morpho's [`Vault2 contract`](https://github.com/morpho-org/vault-v2/blob/main/src/VaultV2.sol). It is the yield-bearing collateral for the Alchemist.
The Alchemist is the Vault contract which accepts deposits of Mix-Yield Token, and allows minting of synthetic alAssets as debt.
The Transmuter is the fixed-duration mechanism for redeeming alAssets for their corresponding underlying asset at a 1:1 rate.
Each of these core components have their own contract, and surrounding contracts that control how we interact with, and manage them.

## Mix-Yield Token (MYT)

There are two instances of Morpho's [`Vault2 contract`](https://github.com/morpho-org/vault-v2/blob/main/src/VaultV2.sol) on each chain today. One (Mix ETH) is a collection of ETH-denominated yield strategies, and the other (Mix USDC) is a collection of USDC-denominated yield strategies.
Each strategy within an MYT has its own strategy adapter contract derived from our base [`MYTStrategy contract`](/dev/myt/myt-contract). These contracts define how individual allocation to, and deallocation from, the underlying strategy occur. It also reports back how many assets are held by the strategy so our vaults can track total value and calculate share price.
To interact with the MYT in a permissioned way, we have two utility contracts: the [`AlchemistCurator`](/dev/myt/alchemist-curator-contract), and the  [`AlchemistAllocator`](/dev/myt/alchemist-allocator-contract).
The AlchemistCurator manages which strategies exist on the vault in the first place, and how much capital they may hold. This can be thought of as the governance layer, and allows operators to add and remove strategies, and its admin to raise or lower caps on a per-strategy basis.
The AlchemistAllocator is the operational layer that actually moves funds between strategies. Admins and operators call `allocate` and `deallocate` with various arguments to rebalance capital across strategies, validated against multiple cap layers, and this in turn calls the proper MytStrategy adapter contract per strategy to perform its actions.
The [`AlchemistStrategyClassifier`](/dev/myt/alchemist-strategy-classifier-contract) is an additional utility contract which defines risk-based caps. It maps strategies to defined risk levels and sets caps per risk class.

## Alchemist

There are two [`Alchemist contract`](/dev/alchemist/alchemist-contract) instances deployed on each chain today. One accepts deposits of Mix ETH and mints alETH, and the other accepts deposits of Mix USDC and allows minting of alUSD. The Alchemist contracts are interacted directly by users.
The [`AlchemistRouter`](/dev/alchemist/alchemist-router-contract) is a convenience contract that can be used to batch multi-step flows within the Alchemist. It allows users to bundle the wrapping of ETH, depositing into a mix-yield-token, depositing mix-yield-token into the Alchemist, and borrowing; all in one transaction. It also handles repayments, withdrawals, and claims with a similar batching approach.
The [`AlchemistV3Position`](/dev/alchemist/alchemist-v3-position-contract) is an ERC721 NFT contract that represents users positions in the Alchemist. The Alchemist mints an NFT when the user opens a position. The NFT is not burned when a position is emptied or self-liquidated; its tokenID keeps mapping to the user's Account struct in the Alchemist contract and can receive new deposits.
The fee vaults: [`AlchemistETHVault`](/dev/alchemist/alchemist-eth-vault-contract) and [`AlchemistTokenVault`](/dev/alchemist/alchemist-token-vault-contract) are used to escrow funds which cover the Alchemist's liquidator-fee obligations when a position's collateral or the Alchemist's balance is insufficient.

## Transmuter

The [`Transmuter`](/dev/transmuter/transmuter-contract) handles redemptions of synthetic debt tokens back to underlying assets. Each Alchemist instance maps to one Transmuter instance. The Transmuter is not upgradeable; the redemption accounting it relies on lives in the upgradeable Alchemist.
For a Transmuter mapped to an Alchemist which mints alETH, users may deposit alETH to create a position that vests linearly over a fixed block count. A claim pays the vested portion in Mix ETH shares worth the same amount of WETH, less any transmutation fee, and scaled down if the Alchemist is in bad debt.
For a Transmuter mapped to an Alchemist which mints alUSD, users may deposit alUSD to create a position that vests linearly over a fixed block count. A claim pays the vested portion in Mix USDC shares worth the same amount of USDC, less any transmutation fee, and scaled down if the Alchemist is in bad debt.
When a Transmuter position is claimed, the Transmuter pays out Mix-Yield Token shares, using shares it already holds from repayments and liquidations first and calling `redeem()` on its corresponding Alchemist for the remainder. Converting those shares back to the underlying asset is a separate step, which the router can bundle. 