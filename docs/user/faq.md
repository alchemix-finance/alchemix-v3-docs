---
hide_title: true
sidebar_label: FAQ
---

import faq from '@site/static/img/faq-01.png';

<img src={faq} alt="FAQ" class="banner-spacing" />
\
Use this page as a quick lookup for the questions we hear most often. It explains core ideas, such as borrowing limits, earmarked debt, the redemption rate, and how they show up in the interface. If you need deeper detail, each answer links back to the full guide or tutorial that covers the topic in depth.

<details>

<summary>
  What is an alAsset?
</summary>

An alAsset is the synthetic token you borrow from Alchemix.

- alUSD mirrors USDC.
- alETH mirrors ETH.

They track their underlying asset but can trade below, or in rare circumstances above, 1:1 on the open market.

[Learn more about alAssets →](./concepts/alAssets)

</details>

<details>

<summary>How much can I borrow?</summary>

You can borrow up to 90% loan-to-value (LTV) of your deposited collateral. The exact limit is shown on each vault page.

[Learn more about LTV →](./concepts/alAssets#ltv-sensitivity)

</details>

<details>

<summary>How does my loan repay itself?</summary>

Your MYT collateral grows in value as its underlying strategies earn yield. When a redemption occurs, the Transmuter swaps a portion of that collateral, equal in value to the queued alAssets earmarked for your position, and applies the proceeds to your outstanding debt.

Each position has a maturity date, but redemptions can happen earlier or later depending on user activity. Until a redemption takes place, your full collateral balance continues compounding, and your debt remains unchanged unless you choose to borrow more.

[Learn more about Self-Repaying Loans →](./concepts/self-repaying-loans.md)

</details>

<details>

<summary>What is earmarked debt?</summary>

When a redemption cycle begins, the protocol gradually reserves (earmarks) a portion of each open loan based on the borrower’s share of total system debt. This earmarked amount is fixed once assigned for the remainder of the cycle and continues earning yield until settlement. If you choose to repay an earmarked slice early, repayment must be made in MYT.

[Learn more about redemptions →](./concepts/redemption-rate.md)

</details>

<details>

<summary>
  Is it possible to exit or repay my loan before it is fully repaid?
</summary>

Absolutely! Alchemix allows you the flexibility to exit or repay your loan at any time, even before it is fully self-repaid. We offer a self-liquidation feature that can only be triggered by the depositor that enables you to repay outstanding loans by using a portion of your deposited collateral. Once the loan is repaid, you can withdraw the remaining collateral. There are no lock-in periods or penalties at all with Alchemix.

</details>

<details>

<summary>What is the redemption rate?</summary>

TODO

[Learn more about the redemption rate →](./concepts/redemption-rate.md)

</details>

<details>

<summary>Can I repay early?</summary>

Yes. Open the Repay tab in a vault and choose:

- alAsset to clear normal debt.
- MYT to clear earmarked or normal debt.
- ETH or USDC for convenience.

Bundling with the cart icon lets you combine several actions in one transaction.

</details>

<details>

<summary>What happens if I borrow alAssets and immediately deposit them in the Transmuter?</summary>

In this case, you interact with both sides of the system at once:

- **Borrower side** – You mint alAssets and may “pay” a market discount, assuming the alAsset is below 1:1 at the time.
- **Redeemer side** – You lock those alAssets for a fixed return and secure their full value.

Most of the time, the cost and reward cancel out, so the net effect is similar to leaving your collateral idle - if not net-negative due to fees. It can make sense when:

- The term is very short and you prefer a sure 1:1 rate on your loan compared to selling on a DEX, or;
- Liquidity is thin, and the market discount is unusually deep.

[Learn more about the transmuter and market discounts →](./concepts/transmuter.md)

</details>

<details>

<summary>Can I withdraw from the Transmuter early?</summary>

Yes, but an early exit applies a penalty that reduces your return. The pop-up shows the exact amount before you confirm.

[Learn more about early exits →](./tutorials/redeem-alassets#manage-or-close-a-position)

</details>

<details>

<summary>What fees does Alchemix charge?</summary>

TODO

[Learn more about fees →](./concepts/fees.md)

</details>

<details>

<summary>What if a vault strategy loses funds?</summary>

Loss handling is different for each participant:

- **Vault users** – If the MYT backing your collateral drops in value, the protocol can liquidate positions that exceed the liquidation LTV.
- **Transmuter users** – Redemptions continue at 1:1 unless the loss results in bad debt. In that case, you can claim a partial redemption immediately or wait until the bad debt is cleared for full value.

</details>

<details>

<summary>Do I ever lose yield if a portion of my debt is earmarked?</summary>

Never. Earmarked collateral continues to earn you yield until the moment it is redeemed. This delayed settlement creates the temporal advantage, extra yield you would not receive in most other lending platforms.

[Learn more about Temporal Advantage →](./concepts/redemption-rate#temporal-advantage)

</details>

<details>

<summary>Who controls the system?</summary>

TODO

[Learn more about security and permissions →](./newguides/risk-considerations.md)

</details>

<details>

<summary>
  Where can I see live data?
</summary>

Current redemption rate, queued alAssets, vault APRs, and historic term stats are displayed directly in the main dashboard and the Earn page.

[View live data →](https://alchemix.fi/)

</details>
