---
sidebar_position: 1
hide_title: true
title: MYT Operator Cheatsheet
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="MYT Operator Cheatsheet" />

Quick reference for admins, curators, allocators, and sentinels operating an MYT vault.

---

## Contract Structure and Roles

There are four contract layers:

- **MYT Vault** (Morpho V2) — holds funds, enforces caps, manages roles
- **Curator Contract** — manages strategy registration and cap configuration (one per chain, shared by both MYTs)
- **Allocator Contract** — moves funds between the vault and strategy adapters (one per MYT)
- **MYT Strategy** — individual yield strategy adapters (one per yield source per MYT)

Each layer has its own role system. Holding a role on one contract does **not** grant access on another.

### Addresses Summary

| Address | Roles Held |
|---|---|
| **DAO Multisig** | MYT Owner · MYT Sentinel · Curator Admin · Curator Operator · Allocator Admin · Allocator Operator · Strategy Owner |
| **Alchemix Association** | MYT Sentinel |
| **EOA** | MYT Sentinel |

> **Note:** The DAO Multisig is **not** set as a direct Allocator on either MYT vault. Allocator-level MYT functions like `setMaxRate()` must be called via the Allocator Contract's proxy mechanism (see [Proxy Forwarding](#proxy-forwarding)).

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

> Call `readRoutes(strategy)` to check which paths are configured before executing.

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

The liquidity adapter is the default strategy the vault uses to service user deposits and withdrawals. It is set via `setLiquidityAdapterAndData()` (Allocator-level, via proxy).

**Critical:** The liquidity adapter **must** be a strategy that supports direct (non-swap) deposit and withdrawal paths. Swap-only strategies (e.g., sfrxETH) cannot be set as the liquidity adapter, because user `withdraw()`/`redeem()` calls do not pass swap calldata. If no strategy on a given chain supports direct paths, leave the liquidity adapter unset — the vault will operate with idle assets only.

---

## Deallocation Flow

<iframe src="/diagrams/deallocation-flow.html" width="100%" height="740" scrolling="no" style={{border:'none',display:'block'}} onLoad={(e)=>setTimeout(()=>{try{e.target.style.height=e.target.contentWindow.document.body.scrollHeight+'px'}catch(x){}},150)} />

---

## Constructing 0x txData

For swap-based allocation and deallocation, you need to pass `txData` — encoded calldata from the [0x Swap API](https://0x.org/docs/api).

1. Call the 0x API with: `sellToken`, `buyToken`, `sellAmount`, and `taker` = **strategy contract address** (not the allocator or multisig)
2. The API returns encoded calldata — pass this directly as `txData`
3. Quotes are time-sensitive — fetch and submit in the same session
4. For `deallocateWithUnwrapAndSwap()`: the swap is for the **intermediate** token (e.g., frxETH → WETH), not the held token (sfrxETH). Set `minIntermediateOut` to match the quote's `sellAmount`.

> **The Alchemix Admin UI should be used to construct txData when available.**

For a detailed walkthrough of the unwrap+swap path, see the [deallocateWithUnwrapAndSwap guide](https://github.com/alchemix-finance/v3/blob/y-monorepo/ALCHEMIST_ALLOCATOR_DEALLOCATE_WITH_UNWRAP_AND_SWAP.md).

---

## Proxy Forwarding

The Curator and Allocator contracts inherit from `PermissionedProxy`, which allows the admin to forward arbitrary calls to the MYT vault via `proxy()`. This is needed for MYT functions that are not natively wrapped by the utility contracts.

**Allocator proxy candidates:**

- `setMaxRate(uint256)` — [Morpho Vaults V2 docs](https://docs.morpho.org/get-started/resources/contracts/morpho-vaults-v2/#setmaxrate)
- `setLiquidityAdapterAndData(address, bytes)` — [Morpho Vaults V2 docs](https://docs.morpho.org/get-started/resources/contracts/morpho-vaults-v2/#setliquidityadapteranddata)

**Curator proxy:** Any [Morpho V2 curator function](https://docs.morpho.org/get-started/resources/contracts/morpho-vaults-v2/#curator-functions) not already wrapped by the AlchemistCurator contract can be forwarded via `proxy()` after whitelisting.

### Example: calling `setMaxRate()` via proxy

```solidity
// Step 1: Whitelist the setMaxRate selector on the proxy
allocator.setPermittedCall(0xa69fc423, true);  // 0xa69fc423 = setMaxRate(uint256) selector

// Step 2: Forward the call to the vault
allocator.proxy(abi.encodeWithSelector(bytes4(0xa69fc423), newMaxRate));
```

> Only the **admin** on the Allocator/Curator contract can call `setPermittedCall()` and `proxy()`.

---

## Troubleshooting: "I can't call this function"

| Error / Symptom | Likely Cause | Fix |
|---|---|---|
| Reverts with `"PD"` on Allocator Contract | Caller is not admin or operator on the Allocator Contract | Allocator Admin calls `setOperator(yourAddress, true)` |
| Reverts with `"PD"` on Curator Contract | Caller is not admin or operator on the Curator Contract | Curator Admin calls `setOperator(yourAddress, true)` |
| `EffectiveCap` revert on allocation | Allocation would exceed absolute, relative, or risk cap | Raise caps via Curator Contract admin functions, or reduce allocation amount |
| `StrategyAllocationPaused` on allocate | Strategy killSwitch is enabled | Strategy Owner calls `setKillSwitch(false)` on the MYT Strategy contract |
| `ActionNotSupported` on allocate/deallocate | Using a route not configured for this strategy | Call `readRoutes(strategy)` to check which paths are enabled |
| Can't call `setMaxRate()` on MYT | Not a native Allocator Contract function | Use proxy forwarding: whitelist the selector, then call `proxy()` (see above) |
| Can't call `setCurator()` or `setIsSentinel()` | Caller is not the MYT Owner | Must be called by the DAO Multisig as MYT Owner directly on the MYT |
| Timelocked function won't execute | `submit()` was not called first | Call the corresponding `submit*` function first, then the execution function |
