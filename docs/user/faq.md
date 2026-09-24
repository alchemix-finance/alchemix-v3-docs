---
hide_title: true
title: FAQ
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="FAQ" />

Use this page as a quick lookup for the questions we hear most often. It explains core ideas, such as borrowing limits, earmarked debt, the redemption rate, and how they show up in the interface.

If you need deeper detail, each answer links back to the full guide or tutorial that covers the topic in depth.

<details>

<summary>
  What is an alAsset?
</summary>

An alAsset is the synthetic token you borrow from Alchemix.

- alUSD mirrors USDC.
- alETH mirrors ETH.

They track their underlying asset but can trade below, or in rare circumstances above, 1:1 on the open market.

[Learn more about alAssets →](./concepts/alAssets.md)

</details>

<details>

<summary>How much can I borrow?</summary>

You can borrow up to 90% loan-to-value (LTV) of your deposited collateral. The exact limit is shown on each vault page.

[Learn more about LTV →](./concepts/alAssets.md#ltv-sensitivity)

</details>

<details>

<summary>How does my loan repay itself?</summary>

Your MYT collateral grows in value as its underlying strategies earn yield. When a redemption occurs, the Transmuter swaps a portion of that collateral, equal in value to the queued alAssets earmarked for your position, and applies the proceeds to your outstanding debt.

Transmuter positions have maturity dates, but their owners can claim earlier or later, so the timing of redemptions against your loan varies with their activity. Until a redemption takes place, your full collateral balance continues compounding, and your debt remains unchanged unless you choose to borrow more.

[Learn more about Self-Repaying Loans →](./concepts/self-repaying-loans.md)

</details>

<details>

<summary>What is earmarked debt?</summary>

As Transmuter deposits vest, the protocol continuously reserves (earmarks) a matching amount of debt across all open loans, in proportion to each loan’s unearmarked debt. Earmarked debt stays earmarked until it is redeemed, and the collateral behind it continues earning yield until settlement. If you choose to repay an earmarked slice early, repayment must be made in MYT.

[Learn more about redemptions →](./concepts/redemption-rate.md)

</details>

<details>

<summary>
  Is it possible to exit or repay my loan before it is fully repaid?
</summary>

Yes. Alchemix allows you to exit or repay your loan at any time, even before it is fully self-repaid. A self-liquidation feature, which only the position owner can trigger, repays the outstanding loan from your deposited collateral and returns the remaining collateral to you in the same transaction. There are no lock-in periods and no early repayment penalty. The standard 0.25% borrower fee still applies to any earmarked portion of the debt settled from collateral.

</details>

<details>

<summary>What is the redemption rate?</summary>

Redemptions in Alchemix v3 deleverage your position by using collateral to repay debt without the cost of traditional interest rates. The Redemption Rate projects how quickly this occurs by comparing annualized Transmuter volume against total system debt, with a higher rate indicating faster loan clearance.

A vault page can show a live rate of 0% with a “future” rate beside it. That means MYT the Transmuter already holds, from repayments and liquidations, is covering matured redemptions, so no new debt is being earmarked. The rate steps up to the future figure once that cover is used up.

A key benefit is <Term id="temporal-leverage">Temporal Leverage</Term>, where earmarked collateral continues earning yield until the exact moment of settlement, maximizing total returns during the waiting period.

[Learn more about the redemption rate →](./concepts/redemption-rate.md)

</details>

<details>

<summary>Can I repay early?</summary>

Yes. Open the Repay tab in a vault and choose:

- alAsset to clear normal debt.
- MYT to clear earmarked or normal debt.
- ETH or USDC for convenience.

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

Yes. An early exit pays out the share that has already vested in full and charges the early exit penalty on the unvested share only, which is returned to you as alAssets. The pop-up shows the exact amount before you confirm.

[Learn more about early exits →](./tutorials/redeem-alassets.md#manage-or-exit-a-position)

</details>

<details>

<summary>What fees does Alchemix charge?</summary>

Alchemix V3 utilizes five primary fee parameters:

- Borrower Redemption Fee: 0.25% (0.10% on Base) of each amount of earmarked debt that is settled, whether through a Transmuter redemption, a force-repay during liquidation or self-liquidation, or your own MYT repayment of an earmarked amount. It is charged on that amount only. The rest of your collateral and debt carry no fee.

- MYT Yield Fee: 5.00% to 17.50%, set per vault (a performance fee on gross yield generated by strategies).

- Early Transmutation Fee: 1.00% on Ethereum, Optimism, and Base, 2.50% on Arbitrum (charged only on the unvested portion if you withdraw from the Transmuter queue before maturity; the vested portion is paid out in full; set per chain).

- Transmuter Fee: 0.00% (charged when claiming transmuted assets).

- Liquidator Fee: 1.50% (paid to whoever liquidates an unhealthy position, from the position’s surplus collateral in a partial liquidation and from the fee vault in a full one).

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

Never. Earmarked collateral continues to earn you yield until the moment it is redeemed. This delayed settlement creates the temporal leverage, extra yield you would not receive in most other lending platforms.

[Learn more about Temporal Leverage →](./concepts/redemption-rate.md#temporal-leverage)

</details>

<details>

<summary>Who controls the system?</summary>

Alchemix V3 is composed of several key counterparties. MYT Depositors, Borrowers, Liquidity Providers, and Transmuter Users. Each of these manage specific risks including strategy losses, liquidation at high LTVs, and potential redemption fees. Overall, these systems are governed by the Alchemix DAO.

The system is secured by cross-chain bridge controls using multiple decentralized verification networks (DVNs) and utilizes <Term id="fundamental-oracle">fundamental oracles</Term> to insulate users from market price volatility.

[Learn more about security and permissions →](./safety/risk-considerations.md)

</details>

<details>

<summary>Is Alchemix audited?</summary>

Yes. Alchemix V3 underwent its most comprehensive audit suite to date (Spearbit/Cantina, Nethermind, yAudit, Immunefi, and alpeh_v), alongside an extensive in-house security suite. A bug bounty of up to $150,000 is active on Immunefi, and the protocol is monitored in real time by Hypernative, with the Guardian multisig able to pause new deposits and loans if suspicious activity is detected.

[Audit reports, bounty details, and security practices →](./safety/security.md)

</details>

<details>

<summary>
  Where can I see live data?
</summary>

Vault APRs appear on the Borrow page and on your Dashboard. A vault's current redemption rate and earmarked balance sit at the top of that vault's own page, with fuller detail under its Earmarking, Redemptions, and History tabs. Fixed-rate terms and their projected APRs are on the Fixed Yield page, under Earn → Fixed Rate.

[View live data →](https://alchemix.fi/)

</details>
