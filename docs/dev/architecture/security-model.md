---
sidebar_position: 3
hide_title: true
title: Security Model
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Security Model" />

Alchemix V3 uses a layered approach to access control, emergency response, and risk management across its contracts. Each layer is designed to limit the blast radius of any single failure point, whether that's a compromised key, a bad strategy, or a systemic market event.

## Access control

### Alchemist

The Alchemist uses a two-step admin transfer pattern (`setPendingAdmin` + `acceptAdmin`) to prevent accidental or malicious ownership transfers. Admin functions control protocol parameters like collateralization ratios, fees, and contract references. Guardians are a secondary role set by the admin. They can pause and unpause deposits and loans but cannot change protocol parameters or access funds.

### MYT management

The MYT management layer (AlchemistCurator and AlchemistAllocator) inherits from PermissionedProxy, which defines two roles: admin and operator. The admin manages the operator set and controls which function selectors operators can forward via `proxy()`. Operators handle day-to-day operations like allocating funds between strategies.

The Curator uses the admin role for cap adjustments and the operator role for strategy additions and removals. The Allocator allows both admins and operators to move funds, but operators are further constrained by local risk caps from the StrategyClassifier. The admin can allocate up to the full cap limits, while operators are capped per-strategy based on their risk classification.

Individual MYTStrategy contracts use an `onlyOwner` pattern (via OpenZeppelin's Ownable) for configuration like setting the kill switch, adjusting slippage tolerance, rescuing stray tokens, and claiming rewards.

### Timelocks

Cap increases and strategy additions/removals on the MYT vault go through the Morpho VaultV2 timelock system. The Curator submits a change in one transaction and executes it in a second, and both must carry the same parameters. Every timelock duration is currently set to zero, so no waiting period separates the two steps. The two-step flow still provides a double confirmation: a change only takes effect if it is executed exactly as it was submitted. Durations are set per function and can be raised on-chain through `increaseTimelock`. Lowering one again is subject to whatever duration is currently in place. Cap decreases bypass the timelock since they only restrict exposure, never expand it.

## Emergency response

### Alchemist pausing

The Alchemist has two independent pause flags: `depositsPaused` and `loansPaused`. Both can be toggled by the admin or any active guardian. Pausing deposits prevents new collateral from entering the system. Pausing loans prevents new borrowing. Neither pause affects withdrawals, repayments, or liquidations. Users can always exit and positions can always be made healthy.

### MYT kill switch

Each MYT strategy has a `killSwitch` that can be toggled by the strategy owner. When enabled, allocations to the strategy revert and reward claims are blocked. Deallocations are not affected, which means funds can always be pulled out of a strategy in emergency mode. The kill switch is a circuit breaker. It stops new capital from flowing in but doesn't automatically withdraw anything.

### Transmuter

The Transmuter has no pause mechanism. Positions continue to vest regardless of market conditions. Claims can always be executed. The `pokeMatured` function allows anyone to free up deposit cap space from fully matured positions without requiring the position owner to act.

## Risk management

### Collateralization

The Alchemist enforces several collateralization parameters. `minimumCollateralization` is the borrowing limit: `mint` and `withdraw` revert if they would leave a position below it (the inverse of the 90% maximum LTV). `collateralizationLowerBound` is the liquidation threshold: a position whose collateral to debt ratio is at or below it is unhealthy and can be liquidated by anyone (the inverse of the 95% liquidation LTV). `globalMinimumCollateralization` is a system-wide ratio: when the Alchemist as a whole is below it, positions that are already liquidatable are liquidated in full instead of partially, and the per-position minimum cannot be set above it. `liquidationTargetCollateralization` is the ratio a partial liquidation restores a position to, and must be at or above the minimum.

### MYT cap enforcement

The AlchemistAllocator validates allocations against four layers of caps before any capital moves into a strategy: the vault's absolute cap (max assets per strategy), the vault's relative cap (max percentage of total vault assets), the global risk cap (max combined allocation across all strategies in a risk class), and the local risk cap (per-strategy limit, applied only to operators). Deallocations bypass cap validation entirely since removing funds can only reduce risk.

### Bad debt handling

The Transmuter accounts for bad debt when settling claims. If the Alchemist's total synthetic debt exceeds the underlying collateral value, the Transmuter scales down the vested payout proportionally via a `badDebtRatio` calculation. This prevents the Transmuter from paying out more than the system can back.

### Fee vaults

The AlchemistETHVault and AlchemistTokenVault escrow funds outside of the Alchemist that the Alchemist draws on to pay liquidator fees when a position's collateral or the Alchemist's own balance cannot cover them. Only authorized addresses (the Alchemist and the owner) can withdraw from these vaults.