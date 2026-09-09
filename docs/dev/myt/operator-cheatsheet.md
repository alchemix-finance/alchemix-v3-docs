---
sidebar_position: 1
hide_title: true
title: MYT Operator Cheatsheet
description: "Quick reference for operating an MYT vault. Covers contract roles, allocation and deallocation flows, proxy forwarding, and common troubleshooting."
---

import PageBanner from "@site/src/components/PageBanner";
import IframeResizeListener from "@site/src/components/IframeResizeListener";

<IframeResizeListener />

<PageBanner title="MYT Operator Cheatsheet" />

Quick reference for admins, curators, allocators, and sentinels operating an MYT vault.

---

## Contract Structure and Roles

There are four contract layers:

- **MYT Vault** (Morpho V2) – holds funds, enforces caps, manages roles
- **Curator Contract** – manages strategy registration and cap configuration (one per chain, shared by both MYTs)
- **Allocator Contract** – moves funds between the vault and strategy adapters (one per MYT)
- **MYT Strategy** – individual yield strategy adapters (one per yield source per MYT)

Each layer has its own role system. Holding a role on one contract does **not** grant access on another.

### Addresses Summary

| Address | Roles Held |
|---|---|
| **v3 admin Safe** | MYT Owner · Curator Admin · Curator Operator · Allocator Admin · Allocator Operator · Strategy Owner (every adapter) |
| **DAO treasury multisig** | MYT Sentinel · Alchemist Guardian · Protocol fee receiver |
| **Alchemix Association** | MYT Sentinel |
| **EOA** | MYT Sentinel |

> **Note:** The admin Safe is **not** set as a direct Allocator on either MYT vault. Allocator-level MYT functions are called through the Allocator Contract: `allocate`, `deallocate`, the swap variants and `setLiquidityAdapter` by the admin or an operator, and `setMaxRate` by the admin. Only vault functions the Allocator does not wrap need [proxy forwarding](#proxy-forwarding).

<iframe src="/diagrams/myt-operator-diagram.html" width="100%" height="1100" scrolling="no" style={{border:'none',display:'block'}} onLoad={(e)=>setTimeout(()=>{try{e.target.style.height=e.target.contentWindow.document.body.scrollHeight+'px'}catch(x){}},300)} />

---

## Allocation Flow

<iframe src="/diagrams/allocation-flow.html" width="100%" height="860" scrolling="no" style={{border:'none',display:'block'}} onLoad={(e)=>setTimeout(()=>{try{e.target.style.height=e.target.contentWindow.document.body.scrollHeight+'px'}catch(x){}},150)} />

### Strategy Route Examples

Each strategy configures which allocation and deallocation paths it supports. Using an unsupported route will revert.

| Strategy | allocate() | allocateWithSwap() | deallocate() | deallocateWithSwap() | deallocateWithUnwrapAndSwap() |
|---|---|---|---|---|---|
| wstETH | Yes | Yes | No | Yes | No |
| sfrxETH | Yes | Yes | No | No | Yes |

> Check the documentation for which direct / swap paths are enabled for this strategy before executing.

---

## Allocate Reference: Amount Encodings

| Token | Decimals | Example (1 unit) |
|---|---|---|
| USDC | 6 | `1_000_000` |
| wETH | 18 | `1_000_000_000_000_000_000` |
| Relative Cap (100%) | 18 | `1e18` |

All amounts are `uint256`.

---

## Liquidity Adapter

The liquidity adapter is the default strategy the vault uses to service user deposits and withdrawals. It is set with `setLiquidityAdapter(adapter, data)` on the Allocator Contract (admin or operator), which calls the vault's `setLiquidityAdapterAndData`.

**Critical:** The liquidity adapter **must** be a strategy that supports direct (non-swap) deposit and withdrawal paths. Swap-only strategies (e.g., sfrxETH) cannot be set as the liquidity adapter, because user `withdraw()`/`redeem()` calls do not pass swap calldata. If no strategy on a given chain supports direct paths, leave the liquidity adapter unset; the vault will operate with idle assets only.

---

## Deallocation Flow

<iframe src="/diagrams/deallocation-flow.html" width="100%" height="740" scrolling="no" style={{border:'none',display:'block'}} onLoad={(e)=>setTimeout(()=>{try{e.target.style.height=e.target.contentWindow.document.body.scrollHeight+'px'}catch(x){}},150)} />

---

## Constructing 0x txData

For swap-based allocation and deallocation, you need to pass `txData`, the encoded calldata from the [0x Swap API](https://0x.org/docs/api).

1. Call the 0x API with: `sellToken`, `buyToken`, `sellAmount`, and `taker` = **strategy contract address** (not the allocator or multisig)
2. The API returns encoded calldata. Pass this directly as `txData`
3. Quotes are time-sensitive, so fetch and submit in the same session
4. For `deallocateWithUnwrapAndSwap()`: the swap is for the **intermediate** token (e.g., frxETH → WETH), not the held token (sfrxETH). Set `minIntermediateOut` to match the quote's `sellAmount`.

> **The Alchemix Admin UI should be used to construct txData when available.**

For a detailed walkthrough of the unwrap+swap path, see the [deallocateWithUnwrapAndSwap guide](https://github.com/alchemix-finance/v3/blob/master/ALCHEMIST_ALLOCATOR_RUNBOOK.md#deallocatewithunwrapandswap).

---

## Proxy Forwarding

The Curator and Allocator contracts inherit from `PermissionedProxy`. The admin enables a vault function selector with `setPermissionedCall(selector, true)`, and an operator can then forward a call to the MYT vault with `proxy(vault, data)`. This is only needed for MYT functions that the utility contracts do not wrap natively.

**Natively wrapped (no proxy needed):** the Allocator exposes `setMaxRate(uint256)` (admin only) and `setLiquidityAdapter(address, bytes)` (admin or operator), which calls the vault's `setLiquidityAdapterAndData`. See the [Allocator reference](/dev/myt/alchemist-allocator-contract).

**Curator proxy:** Any [Morpho V2 curator function](https://docs.morpho.org/get-started/resources/contracts/morpho-vaults-v2/#curator-functions) not already wrapped by the AlchemistCurator contract (for example the timelock functions) can be forwarded via `proxy()` after the admin has enabled its selector.

### Example: forwarding an unwrapped call

```solidity
// Step 1 (admin): enable the selector on the proxy
curator.setPermissionedCall(selector, true);

// Step 2 (operator): forward the call to the vault
curator.proxy(mytVault, abi.encodeWithSelector(selector, args));
```

> `setPermissionedCall()` is admin-only. `proxy()` is operator-only; the admin can use it only if it is also set as an operator.

---

## Troubleshooting: "I can't call this function"

| Error / Symptom | Likely Cause | Fix |
|---|---|---|
| Reverts with `"PD"` on Allocator Contract | Caller is not admin or operator on the Allocator Contract | Allocator Admin calls `setOperator(yourAddress, true)` |
| Reverts with `"PD"` on Curator Contract | Caller is not admin or operator on the Curator Contract | Curator Admin calls `setOperator(yourAddress, true)` |
| `EffectiveCap` revert on allocation | Allocation would exceed absolute, relative, or risk cap | Raise the absolute or relative cap via the Curator admin (submit, then execute), raise the risk-class cap via the StrategyClassifier admin, or reduce the amount. Local risk caps bind operators only |
| `StrategyAllocationPaused` on allocate | Strategy killSwitch is enabled | Strategy Owner calls `setKillSwitch(false)` on the MYT Strategy contract |
| `ActionNotSupported` on allocate/deallocate | Using a route not configured for this strategy | Check the documentation for which direct / swap paths are enabled for this strategy |
| Can't call `setMaxRate()` | Caller is not the Allocator admin, or is calling the vault directly | Allocator admin calls `allocator.setMaxRate(rate)` |
| Can't call `setCurator()` or `setIsSentinel()` | Caller is not the MYT Owner | Must be called by the v3 admin Safe as MYT Owner directly on the MYT |
| Timelocked function won't execute | `submit()` was not called first | Call the corresponding `submit*` function first, then the execution function |
