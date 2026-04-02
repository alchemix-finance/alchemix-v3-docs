---
sidebar_position: 1
hide_title: true
title: MYT Operator Cheatsheet
---

import PageBanner from "@site/src/components/PageBanner";
import AllocationFlow from "@site/src/components/AllocationFlow";

<PageBanner title="MYT Operator Cheatsheet" />

Quick reference for admins, curators, and allocators operating an MYT vault.

## Contract Structure and Roles

The MYT Admin assigns curators and allocators. Curators operate via the Curator contract. Allocators operate via the Allocator contract.

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'fontFamily': 'Montserrat',
    'primaryColor': '#141618',
    'primaryBorderColor': 'rgba(245,192,154,0.25)',
    'primaryTextColor': '#e8e8ea',
    'lineColor': '#f5c09a',
    'edgeLabelBackground': '#0d0e10',
    'tertiaryColor': '#141618',
    'fontSize': '18px'
  },
  'flowchart': { 'curve': 'basis', 'nodeSpacing': 80, 'rankSpacing': 90 }
}}%%
flowchart TD
    classDef default font-weight:bold;

    MYT_E("ETH Mix Yield Token")
    MYT_U("USDC Mix Yield Token")
    ADMIN("Admin (Owner)")
    CUR_ROLE("Curator Role")
    ALLOC_ROLE("Allocator Role")
    CUR_CONTRACT("Curator Contract")
    ALLOC_CONTRACT_E("ETH Allocator")
    ALLOC_CONTRACT_U("USDC Allocator")

    MYT_E --> ADMIN
    MYT_U --> ADMIN
    ADMIN -->|"setCurator()"| CUR_ROLE
    ADMIN -->|"setIsAllocator()"| ALLOC_ROLE
    CUR_ROLE -->|"uses"| CUR_CONTRACT
    ALLOC_ROLE -->|"uses"| ALLOC_CONTRACT_E
    ALLOC_ROLE -->|"uses"| ALLOC_CONTRACT_U

    linkStyle 0,1,2,3,4,5,6 stroke:#f5c09a,stroke-width:2px
```

## Allocation Flow

<AllocationFlow />

## Reference: Amount Encoding

| Token | Decimals | Example (1 unit) |
|-------|----------|-----------------|
| USDC  | 6        | `1_000_000`     |
| wETH  | 18       | `1_000_000_000_000_000_000` |
| Relative Cap (100%) | 18 | `1e18` |

All amounts are `uint256`.

## Quick Reference: Key Functions

### MYT Contract *(Owner only)*

| Function | Description |
|----------|-------------|
| `setKillSwitch(bool)` | Enable/disable the kill switch |
| `setCurator(address)` | Assign the Curator role |
| `setIsAllocator(address, bool)` | Assign/revoke the Allocator role |

### Curator Contract *(Curator role)*

| Step | Function | Notes |
|------|----------|-------|
| 1 of 2 | `submitIncreaseAbsoluteCap(strategy, amount)` | Must call before actual txn |
| 2 of 2 | `increaseAbsoluteCap(strategy, amount)` | Uses token decimals (USDC=6, wETH=18) |
| 1 of 2 | `submitIncreaseRelativeCap(strategy, amount)` | Must call before actual txn |
| 2 of 2 | `increaseRelativeCap(strategy, amount)` | 100% = `1e18` |

### Allocator Contract *(Allocator role)*

| Function | Notes |
|----------|-------|
| `allocate(strategy, amount)` | Contract address, uint256 amount (USDC = 6 decimals) |
