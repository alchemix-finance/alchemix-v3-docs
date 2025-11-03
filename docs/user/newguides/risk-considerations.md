---
sidebar_position: 4
hide_title: true
sidebar_label: Risk Considerations
---

import riskConsiderations from '@site/static/img/risk-considerations-01.png';

<img src={riskConsiderations} alt="Risk Considerations" class="banner-spacing" />

## Protocol Trust & Risk Mitigation

This section breaks down who controls what in the Alchemix V3 stack, and how different failure scenarios are handled.

## Governance & Operational Controls

| Actor        | Scope of control                                                                                                                                 | Safeguards                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Alchemix DAO | Owns core contracts. Can set or update parameters such as LTV limits, Transmutation time, strategy weights, fee rates, and sentinel permissions. | All parameter changes require on-chain proposals, quorum, and timelock. Emergency changes via developer multi-sig limited to parameter tuning. |
| Sentinels    | Whitelisted addresses able to pause specific modules (TODO) in the case of an exploit.                                                           | Pausing a module freezes actions but never locks user withdrawals. Users can always pull collateral and claim matured redemptions.             |

## L2 Bridging

TODO

## MYT Losses & Delayed Unwrapping

TODO

| Scenario                                           |     |     |
| -------------------------------------------------- | --- | --- |
| Strategy loss (EG: hack in an underlying protocol) |     |     |
| Extreme de-peg of underlying                       |     |     |
|                                                    |     |     |

## Vault Losses & Liquidations

TODO

### For Vault Users

### For Transmuter Users

## Trust Model Summary

TODO

| Layer            | Who you trust           | Worst-Case Outcome       | User Action Available           |
| ---------------- | ----------------------- | ------------------------ | ------------------------------- |
| Paramater tuning | DAO multisig + timelock | Fee/LTV tweak            | Exit vaults, claim redemptions  |
| Emergency pause  | Sentinels               | Contracts paused         | Withdraw collateral, unwrap MYT |
| Yield strategy   | DAO-approved protocols  | Underlying protocol hack |                                 |
| L2 bridge        |                         |                          |                                 |

In practice, the DAO and Sentinel layer can act only to stop new risk, not to move or seize user funds. This design minimises governance risk while still giving the community levers to respond quickly to edge cases.
