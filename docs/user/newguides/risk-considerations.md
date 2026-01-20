---
sidebar_position: 4
hide_title: true
sidebar_label: Protocol Trust & Risk Mitigation
---

import riskConsiderations from '@site/static/img/risk-considerations-01.png';

<img src={riskConsiderations} alt="Risk Considerations" class="banner-spacing" />

This section breaks down who controls what in the Alchemix V3 stack, the various risks and counterparties that makeup the Alchemix System, and how different failure scenarios are handled.

## Counterparties

Users of any DeFi protocol are encouraged to Know Your Counterparty (the real KYC!). Simply put, users should understand what other types of users make up the system they are opting into and where they fit in that system. Alchemix has a few primary counterparties:

### MYT Depositors

MYT Depositors provide collateral to and are thus exposed to the yield strategies that make up the MYT. If the MYT suffers a loss, that loss is distributed to all MYT Depositors. MYT Depositors are encouraged to monitor which yield strategies make up the MYT they are holding to ensure the exposure is in line with their own strategy.

### Alchemist Borrowers

Borrowers supply MYT to the Alchemists in order to take alAsset loans. Unless a depositor also wishes to act as a liquidity provider, they will typically swap their alAsset to another asset soon after taking the loan. Therefore, they are not exposed to the price of alAssets over time.

The primary risks a borrower takes are liquidation risk and redemption risk.

## Liquidation Risk

If the MYT suffers a loss then the LTV of a borrower's position may increase beyond the maximum LTV. Each Alchemist has a set liquidation LTV at which the user’s position is eligible for liquidation, which will use collateral to repay debt, and pay the liquidator, until the user’s position is down to the target LTV.

Users can mitigate liquidation risk by using a conservative LTV based on the risk levels of the strategies that make up each MYT. The High and Medium risk strategies in each MYT are limited to 10% and 25% of the MYT, respectively. If the liquidation LTV is 95% then the user can take a 60% LTV. In this scenario, even if all of the High and Medium risk strategies suffer 100% losses, the user will still have a 92% LTV and therefore not be subject to liquidation.

It is worth noting that [MYT notes](../concepts/myt-and-yield.md#myt-launch-strategies) low risk strategies are only priced by fundamental oracles. This means only the underlying value of the strategy matters - not the dex or market price of the strategy token. Therefore, liquidation with these strategies can only occur if the contract loses value due to an exploit or other form of loss, NOT due to dex pricing, dex manipulation, or oracle manipulation. This means that liquidation risk due to LOW risk assets is significantly lower than HIGH and MEDIUM risk assets.

## Redemption Rate

All borrowers will experience redemptions based on the amount of claims that occur in the transmuter. Borrowers should understand the [redemption rate](../concepts/redemption-rate), which effectively will deleverage the user over time while also charging redemption fees. Users can only face losses in one of two ways - from redemption fees, and from selling alAssets. The yield the users earn in the system is expected to offset these losses, but users should be aware of extreme conditions where low alAsset prices and high redemption rates could create situations where loans may be less profitable or even unprofitable. The good news is that Alchemix is designed to be a slow moving system especially at lower LTVs, so users who do not wish to constantly monitor positions can take loans at more conservative LTVs.

## Liquidity Providers

alAsset liquidity providers are exposed to price fluctuations of alAssets. They create the liquidity for users to sell their alAssets for other tokens. alAssets can only be redeemed for underlying collateral in three ways:

1. **Loan repayment** (instant, 1 alAsset = 1 asset)
2. **Selling through a liquidity pool** (instant, price will fluctuate)
3. **Depositing in the Transmuter** (timeline is determined at time of deposit, 1 alAsset = 1 asset worth of MYT)

A liquidity provider / alUSD holder that does not have an Alchemix position in a yield strategy does not have option 1 at their disposal. A liquidity provider has three primary steps to consider when providing liquidity:

- Price / balance of liquidity pool when entering the pool
- Yield earned from providing liquidity over the life of the liquidity provision
- Price / balance of liquidity pool when leaving the pool

If the balance of the pool moves favorably for the LPer over time, they can earn yield as well as a net positive slippage from the difference between their exit and entry position. If the balance of the pool moves unfavorably, then the net negative slippage would be subtracted from the yield earned during their liquidity provision over time.

A user can hedge alAsset exposure exposure by using the Transmuter, or by being a depositor within Alchemix. If the alAsset pool shifts less favorably for the depositor/LPer, they can withdraw alUSD instead of stablecoins for a bonus positive slippage and repay their debt.

:::note
There are scenarios where alAssets may temporarily depeg or depeg for a longer period of time. LPers should understand future outcomes in both scenarios - see sections below for MYT losses. LPers especially should understand what conditions may result in temporary alAsset depegs vs more long-term depegs so they can re-evalute their positions accordingly.
:::

### Transmuter Users

Transmuter users will deposit alAssets with a promised timeline at which they can claim MYT tokens in exchange for burning their alAssets. The value of the MYT is priced based on the combination of all strategies in the MYT. Some strategies may be less liquid or have duration-based exits. This means that while the transmuter user may be able to claim 1 ETH/USDC worth of MYT per 1 alETH/alUSD they deposit, the 1 ETH or 1 USDC may not be immediately available to be unwrapped from the MYT itself.

Additionally, all Transmuter users are exposed to the global collateralization of the Alchemist. Should the Alchemist detect global bad debt (global collateral asset value is worth less than global outstanding debt), then all Transmuter claims will be distributed pro-rata based on the bad debt ratio. The user can choose whether to proceed with the claim (accepting the reduced MYT distribution), or wait to claim until the Alchemist is re-collateralized.

Lastly, exiting the transmuter prior to completion of the transmuter timeline will result in a fee on any untransmuted assets, meaning transmuter funds are always accessible but not without restrictions.

### DAO and ALCX Holders

The DAO may be forced to sell assets, including ALCX, if needed to cover protocol losses in some scenarios.

## Governance & Operational Controls

See [Contract Roles](../../governance/guides/contract-roles).

## Alchemix on Layer 2

### The Alchemix Bridge

The Alchemix Bridge is a custom implementation of the LayerZero OFT standard for cross-chain messaging. The system relies on DVNs, which are essentially 3rd party messaging services. For any bridge transaction to complete through the Alchemix Bridge, at least 2 of the 3 whitelisted DVNs must attest to the validity of the transaction. The DVNs currently in use are:

- **LayerZero** (All Chains)
- **Wormhole** (All chains except Metis and Linea)
- **Bware** (All chains)
- **Nethermind** (Metis and Linea only)

Currently, alUSD, alETH, and ALCX are bridgeable through the Alchemix bridge. Each combination of asset/chain has a rate limit of maximum assets that can be bridged in or out of the chain in a 24h period.

In this system, Ethereum assets are unique in that in addition to bridge limits in/out, the amount of any asset existing on Ethereum cannot exceed the amount of that asset that was minted on Ethereum by the Alchemix protocol. Put another way, the assets bridged into Ethereum cannot exceed the assets bridged out of Ethereum.

The AlchemixDAO owns the bridge contracts and thus has the ability to set the DVNs and rate limits on each chain. This approach means that no single messaging provider can compromise the system, and the DAO can swap out DVNs as needed if there are any issues without the system going offline.

More context on the bridging system can be found in [AIP-120](https://snapshot.org/#/s:alchemixstakers.eth/proposal/0xc1712a76c189e1188118e18a1ed90182360638f5ba7476ce36aa7f1ad4dc5347).

### ALCX Token and alAssets

The ALCX token can only be minted on Mainnet, thus it entirely follows the system outlined above.

alAssets (alETH and alUSD) can be minted by the Alchemist on each chain and burned by both the Alchemist and Transmuter (repaying debt and redeeming alAssets). Thus, any alAsset on any chain can be bridged to any other chain in order to repay debt or use the transmuter, within the limitations described in [The Alchemix Bridge](risk-considerations#the-alchemix-bridge).

This also means that while alAssets can always be bridged from any chain to any L2 chain, there is no guarantee that alAssets can be bridged back to Mainnet. This could result in alAssets having a lower price on L2 chains than on Mainnet. This system helps create more unified liquidity on L2 chains while ensuring that the primary Mainnet Alchemix deployment is insulated from any security incidents that occur on L2 chains.

### Transmuter and Alchemist

The Alchemist behaves the same on L2 as on Mainnet. The Transmuter (on all chains), however, has a maximum deposit cap that is dictated by the total alAssets minted by the Alchemist on that chain. Thus, there may be scenarios where alAssets purchased on one chain need to be bridged to another chain in order to be deposited to the transmuter. Users should always verify there is adequate space in the Transmuter they intend to use prior to purchasing alAssets.

## MYT Losses & Delayed Unwrapping

The sections below apply to users with Alchemix loans. For users simply holding the MYT, there are two primary risks:

1. Some strategies may have a time delay on when withdrawal is possible, and the DAO is ultimately responsible for ensuring there is underlying asset available to withdraw from the MYT. Thus, users should recognize that there are scenarios where the underlying value of the MYT may not be immediately accessible (ie, users may not always be able to immediately withdraw USDC or ETH from the respective MYTs).
2. If an MYT suffers a loss, MYT users will suffer the same loss pro-rata (ie, if a strategy that makes up 10% of the MYT suffers a 50% loss, then all MYT users will experience a 5% loss.)

### MYT Arbitrage - Large Depeg of Fundamental Oracles

Alchemix uses fundamental oracles wherever possible. This means that prices are determined by the underlying assets for each strategy, rather than the market price of the strategy token. As noted in the Transmuter section above, transmuter users receive MYT tokens, not underlying, from the transmuter. If the MYT is composed of assets that are not immediately withdrawable, users may require reduced alAsset prices in order to consider transmutation worthwhile.

If the assets that make up the MYT depeg significantly on the open market (DEXes and CEXes), then it could result in a more significant temporary depeg due to perceived arbitrage in the system - however, it is important to note that the system will not actually suffer any losses in this scenarios. The only losses/profits will be between users (LPers, arbitragers, transmuter users, borrowers) who elect to buy/sell alAssets during this period.

#### Example

stETH can typically be unwrapped into 1 ETH, but sometimes there is a delay in how long this unwrap takes. For this reason, stETH may trade on the open market for less than 1 ETH. For this example, we can assume the MYT is made up entirely of stETH. stETH has a withdrawal queue of 30 days, and thus is trading at 0.96 ETH.

Next, someone with a lot of stETH decides they can’t wait 30 days for their ETH, and sells it all now. stETH depegs down to 0.8 ETH per stETH. The following events occur:

- No liquidations occur, as the MYT is still priced at 1 stETH per ETH, thus 1 MYT = 1 ETH.
- Users may wish to arbitrage Alchemix, as they believe the MYT is mispriced, however, they cannot deposit stETH directly to the MYT. Thus, they deposit ETH:
  - They now have a share of the MYT
  - However, the MYT is now comprised of both ETH and stETH, thus the perceived value has moved closer to the fundamental value of 1:1
- The users who obtain MYT by depositing ETH can now take an alchemix loan of alETH. In their mind, they are collateralizing 0.8 ETH to mint 1 alETH, thus they will mint alETH and sell it, likely until alETh drops to 0.8 ETH or even lower
- As of now these users have generated no profit - they need to exit the system to generate profit. The only approaches they can take are:
  - Repay their loan with MYT - not viable, as the only way to get MYT is to deposit ETH, and they sold their loan for much less than 1 ETH per 1 alETH!
  - Repay their loan with alETH - not useful, as they just sold alETH!
- Thus, the user is now in the system with no profitable way - at best, they can reverse their actions
- stETH is still worth 1 ETH fundamentally, and thus as the dex price recovers, the price of the alAsset will also recover
- The alAsset may still suffer some weakness in market pricing while the stETH withdrawal queue is at 30 days. Borrowers may not wish to take new loans, and transmuter users will need to consider this additional unwrap time when purchasing alETH to transmute to MYT.

### MYT Loss - Price Reported Correctly

In some cases, a strategy may suffer a loss (due to an exploit or another reason) which means the MYT is truly fundamentally worth less than it was previously. In this scenario, the system checks users LTVs and makes users eligible for liquidation when they exceed the liquidation LTV set in the system.

If the losses are too severe or too rapid, liquidations may not properly trigger. In this scenario, users may end up with bad debt (user debt is worth more than user collateral). If this results in global bad debt (global debt is worth more than global user collateral), then the transmuter will enter an emergency mode. In this mode, any claim made MYT assets through the transmuter will distribute pro-rata to the bad debt. Ie, if the Alchemist is 90% collateralized, then transmuter claims will only distribute 0.9 ETH worth of MYT for each 1 alETH transmuted. Users have the choice to trigger the claim, or wait until the Alchemist is re-collateralized to claim at 1:1.

### MYT Loss - Price Reported Incorrectly

Incorrect pricing is the least expected risk in the Alchemist, but not outside the realm of possibility. If a strategy is reporting an invalid price that is higher than the actual value of the strategy (ie, the strategy suffers a loss but the loss is not reported to the MYT), then Guardians will need to step in and pause deposits and new loans in the Alchemist to ensure additional collateral is not added to the Alchemist.

Guardians may wish to de-allocate from the defunct strategy, on a case-by-case basis. De-allocating results in the loss being realized by the MYT, thus triggering liquidations and bad debt ratios. Depending on the nature of the loss, this may not always be the best option.

In this scenario borrowers essentially are in a state where they perhaps should be liquidated, but are not yet. They may wish to repay some debt or unwind their position to avoid liquidation when the price updates, or they may wish to do nothing if their position is already in a state of bad debt (ie, they have essentially profited by the failure in pricing).

Transmuter users may want to withdraw from the transmuter and sell their alAssets, or wait for resolution. If they make a claim on the transmuter, they will receive 1 asset worth of MYT, but this is according to the incorrect pricing. Thus, regardless of whether the pricing has been updated or not, they will be receiving potentially less than one asset worth of MYT per 1 alAsset redeemed, and thus may wish to wait for proper recollateralization.

Existing MYT depositors will suffer the loss, but arbitrageurs may seek to deposit ETH to the MYT in order to mint alAssets with mispriced collateral. Even so, depositing ETH to the MYT is risky as many other users will be seeking to withdraw from the MYT, so there is no guarantee the arbitrager can access their ETH after minting debt, especially because the Alchemist does not allow atomic (same block) deposit/withdraw txns as well as mint/repay debt txns.
