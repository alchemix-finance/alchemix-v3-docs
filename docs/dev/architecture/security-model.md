---
sidebar_position: 3
hide_title: true
title: Security Model
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Security Model" />

Alchemix V3 uses a layered approach to access control, emergency response, and risk management across its contracts. Each layer is designed to limit the blast radius of any single failure point, whether that's a compromised key, a bad strategy, or a systemic market event.

## Access Control

### Alchemist

The Alchemist uses a two-step admin transfer pattern (`setPendingAdmin` + `acceptAdmin`) to prevent accidental or malicious ownership transfers. Admin functions control protocol parameters like collateralization ratios, fees, and contract references. Guardians are a secondary role set by the admin. They can pause deposits and loans but cannot change protocol parameters, access funds, or unpause without the admin.

### MYT Management

The MYT management layer (AlchemistCurator and AlchemistAllocator) inherits from PermissionedProxy, which defines two roles: admin and operator. The admin manages the operator set and controls which function selectors operators can forward via `proxy()`. Operators handle day-to-day operations like allocating funds between strategies.

The Curator uses the admin role for cap adjustments and the operator role for strategy additions and removals. The Allocator allows both admins and operators to move funds, but operators are further constrained by local risk caps from the StrategyClassifier. The admin can allocate up to the full cap limits, while operators are capped per-strategy based on their risk classification.

Individual MYTStrategy contracts use an `onlyOwner` pattern (via OpenZeppelin's Ownable) for configuration like setting the kill switch, managing whitelisted allocators, and claiming rewards.

### Timelocks

Cap increases and strategy additions/removals on the MYT vault go through the Morpho VaultV2 timelock system. The Curator must first submit a change, wait for the timelock period to elapse, then execute it in a second transaction. Cap decreases bypass the timelock since they only restrict exposure, never expand it.

## Emergency Response

### Alchemist Pausing

The Alchemist has two independent pause flags: `depositsPaused` and `loansPaused`. Both can be toggled by the admin or any active guardian. Pausing deposits prevents new collateral from entering the system. Pausing loans prevents new borrowing. Neither pause affects withdrawals, repayments, or liquidations. Users can always exit and positions can always be made healthy.

### MYT Kill Switch

Each MYT strategy has a `killSwitch` that can be toggled by the strategy owner. When enabled, allocations to the strategy revert and reward claims are blocked. Deallocations are not affected, which means funds can always be pulled out of a strategy in emergency mode. The kill switch is a circuit breaker, but not an unwinder. It stops new capital from flowing in but doesn't automatically withdraw anything.

### Transmuter

The Transmuter has no pause mechanism. Positions continue to vest regardless of market conditions. Claims can always be executed. The `pokeMatured` function allows anyone to free up deposit cap space from fully matured positions without requiring the position owner to act.

## Risk Management

### Collateralization

The Alchemist enforces multiple collateralization layers. The `minimumCollateralization` is the per-instance ratio below which positions can be liquidated. The `globalMinimumCollateralization` is a protocol-wide floor that the per-instance minimum can never drop below. The `collateralizationLowerBound` defines the lowest ratio at which deposits can still be made. Once the system reaches this threshold, new deposits are rejected. The `liquidationTargetCollateralization` is the ratio that liquidations restore positions to, which must always be at or above the minimum.

### MYT Cap Enforcement

The AlchemistAllocator validates allocations against four layers of caps before any capital moves into a strategy: the vault's absolute cap (max assets per strategy), the vault's relative cap (max percentage of total vault assets), the global risk cap (max combined allocation across all strategies in a risk class), and the local risk cap (per-strategy limit, applied only to operators). Deallocations bypass cap validation entirely since removing funds can only reduce risk.

### Bad Debt Handling

The Transmuter accounts for bad debt when settling claims. If the Alchemist's total synthetic debt exceeds the underlying collateral value, the Transmuter scales down the vested payout proportionally via a `badDebtRatio` calculation. This prevents the Transmuter from paying out more than the system can back.

### Fee Vaults

The AlchemistETHVault and AlchemistTokenVault escrow funds outside of the Alchemist that can be drawn on to cover obligations to liquidators and redeemers when the Alchemist's own balance is insufficient. Only authorized addresses (the Alchemist and the owner) can withdraw from these vaults.