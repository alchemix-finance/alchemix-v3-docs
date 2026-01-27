---
sidebar_position: 3
hide_title: true
title: MYT Launch Strategies
---

import mytStrategies from '@site/static/img/myt-strategies-01.png';

<img src={mytStrategies} alt="MYT Launch Strategies" class="banner-spacing" />

Strategies receive risk classifications, and risk classifications create caps on MYT makeup. The available classifications are Low, Med, and High.

The general approach to classification is based on the table below.

| Classification Level | Wrap/Unwrap Approach | Pricing Approach | Duration Risk                | Other Factors |
| :------------------- | :------------------- | :--------------- | :--------------------------- | :------------ |
| **Low (1)**          | Contract             | Fundamental      | None or Utilization or Async | None          |
| **Med (2)**          | Dex                  | External         | MultiWeek                    | Discretion    |
| **High (3)**         | Dex                  | External         | MultiWeek                    | Discretion    |

The context for each column is as follows:

### Wrap/Unwrap Approach

This is how you enter or exit the strategy, Contract or Dex. The typical approach is through the contract directly, however some strategies require using a dex, which introduces additional risk due to third party dependencies and potential dex manipulation.

### Pricing Approach

This is how the strategy is priced - Fundamental Oracle, or Externally-Priced Oracle. A Fundamental Oracle simply reads the quantity of backing in a yield strategy and compares it to the quantity of outstanding yield token to determine price. This is more secure because it does not rely on externally determined prices, which could be subject to manipulations we've seen throughout DeFi in the past. Contrasted with a traditional oracle, which prices based on a number of factors which may include CEX prices, DEX prices, etc. The ideal approach is to prioritize strategies that can be priced using fundamental oracles wherever possible.

### Duration Risk

This is the risk that you may not be able to withdraw from the strategy immediately - None, Utilization, Async, or MultiWeek. No duration risk means you can be expected to withdraw from the strategy at all times. Utilization means there may be periods when liquidity is unavailable for withdrawal, but these are generally not expected to last long. Async means there is a standard delay between requesting a withdrawal and being able to withdraw. Multiweek means there are expected situations where withdrawal would not be possible for weeks at a time.

### Other Factors

Can include factors such as the age of the strategy, confidence in the team, unique mechanisms, etc. This column can ONLY be used to classify a strategy as riskier than it otherwise would be, NOT to reduce a risk classification.

Generally, a strategy is only classified as “Low” if it meets all three requirements of Contract wrap/unwraps, Fundamental pricing, and “No” or “Utilization duration” risk rating, with no other factors that would make it riskier.

As an example, if a strategy unwrap is “Contract”, pricing approach is “Fundamental”, and duration risk is “MultiWeek”, it would be classified as Medium. If the strategy is also newer and less proven, it could be bumped up to High.

Caps for each level are as follows. These caps ensure that users can set their LTV to minimize liquidation risk due to High and/or Med risk strategies.

| Classification Level | Max Individual Strategy | Max All Strategies |
| :------------------- | :---------------------- | :----------------- |
| Low                  | None                    | None               |
| Med                  | 25%                     | 25%                |
| High                 | 10%                     | 10%                |
