---
sidebar_position: 4
hide_title: true
title: Base
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Base" />

Alchemix v3 contract addresses deployed on Base (chain ID 8453). Each address links to BaseScan. For what each contract does, see the [Core Modules](/dev/alchemist/alchemist-contract) section.

Base runs a single USDC market. There is no Mix ETH vault, alETH Alchemist, or alETH Transmuter on Base. The Base Alchemist mints alUSDb, which is a separate token from alUSD.

The same deployer address was used on every chain, so several Base addresses are identical to unrelated contracts on Ethereum, Optimism, or Arbitrum. Always look up a Base address on a Base explorer.

## Mix USDC (alUSDb)

| Contract               | Address                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| MYT Vault              | [0xb8BeFE5a6941ca4022a52042075ff269C3C67467](https://basescan.org/address/0xb8BeFE5a6941ca4022a52042075ff269C3C67467) |
| Alchemist              | [0xEb380d86EeD275C9F2eD77745aB1B2ccf364BF7A](https://basescan.org/address/0xEb380d86EeD275C9F2eD77745aB1B2ccf364BF7A) |
| Alchemist Position NFT | [0xDeD3A04612FF12b57317abE38e68026Fc9D28114](https://basescan.org/address/0xDeD3A04612FF12b57317abE38e68026Fc9D28114) |
| Transmuter             | [0x5B1c7180C630d3B2b6782Df70f43aE5Ea80425ba](https://basescan.org/address/0x5B1c7180C630d3B2b6782Df70f43aE5Ea80425ba) |
| Allocator              | [0x347371c17D14Ee7943943995E2A0A9Df4FD83d50](https://basescan.org/address/0x347371c17D14Ee7943943995E2A0A9Df4FD83d50) |
| Curator                | [0x073598132f37756a7E665FB52f1757463120bd3C](https://basescan.org/address/0x073598132f37756a7E665FB52f1757463120bd3C) |
| Router                 | [0x720D1F945279A6D82EeDcC9B7f85767279Ea2F96](https://basescan.org/address/0x720D1F945279A6D82EeDcC9B7f85767279Ea2F96) |
| Fee Vault              | [0xB0Bb4D5e1713a8BDFf73cd67B43730c74aa1F3aB](https://basescan.org/address/0xB0Bb4D5e1713a8BDFf73cd67B43730c74aa1F3aB) |
| alUSDb (synth)         | [0x877014E21c32feA108B6A1f45f367efc9a2d9B9F](https://basescan.org/address/0x877014E21c32feA108B6A1f45f367efc9a2d9B9F) |

## Shared contracts

| Contract                                    | Address |
| ------------------------------------------- | ------- |
| [Strategy Classifier](/dev/myt/alchemist-strategy-classifier-contract) | [0x930750a3510E703535e943E826ABa3c364fFC1De](https://basescan.org/address/0x930750a3510E703535e943E826ABa3c364fFC1De) |
| v3 admin Safe (Alchemist and Transmuter admin, MYT owner, protocol fee receiver) | [0x24E9cbB9DdDa1247ae4b4eEEE3C569A2190ac401](https://basescan.org/address/0x24E9cbB9DdDa1247ae4b4eEEE3C569A2190ac401) |
