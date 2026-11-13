/**
 * Every word the course defines, with the lesson that owns it and its one
 * definition.
 *
 * Beginner entries are the glossary's definitions: each says what the thing
 * is, what it does and why the reader cares, in the words the app and the
 * docs use, and each is sourced to the docs page or the app. Only
 * Alchemix's own terms are tappable. General words (loan, swap, repay,
 * position, term, borrow, vault, token, USDC, yield, deposit) have no entry
 * and are defined in the sentence where they first matter; a Term with an
 * id that is not here renders as plain text.
 *
 * `docs` is the docs page that covers the term, shown as "Read more in the
 * docs" at the foot of its popover. A term with no page of its own has none.
 *
 * `Term` in the kit reads this. A term is tappable in lesson text from its
 * owning lesson on, and a tap shows `text`. Change a definition here and in
 * the glossary together. The intermediate and advanced entries sit below
 * the beginner ones and follow the same rule (a term is tappable from its
 * owning lesson on, in the map's order: beginner, intermediate, advanced). Since the 2026-11 rebuild they are the
 * popover definitions in the lesson scripts I1 to I9, word for word, each
 * owned by the lesson that teaches it.
 */

export const TERMS = {
  /* ── Beginner 1: What you can do here ── */
  mixedYield: {
    term: "Mixed Yield",
    lesson: "what-you-can-do-here",
    text: "Mixed Yield is the Earn page, listed in the menu as Variable Rate, where you deposit USDC or ETH into a vault to earn a variable yield without taking a loan.\n\nYour deposit gives you MYT, the Mix-Yield Token, which you hold in your wallet. Its value rises as the vault's strategies earn and falls if one records a loss.",
    docs: "/user/tutorials/use-passive-myt",
  },

  /* ── Beginner 2: Deposit and earn ── */
  myt: {
    term: "MYT",
    lesson: "what-you-can-do-here",
    text: "The Mix-Yield Token (MYT) is an ERC-20 token representing a share of a diversified portfolio of yield strategies managed by the Alchemix DAO.\n\nIts value rises as the strategies earn yield and falls if a strategy records a loss.\n\nMYT is the collateral Alchemix lends against, so the vaults on the Borrow page hold every deposit as MYT.",
    docs: "/user/concepts/myt-and-yield",
  },
  apr: {
    term: "APR",
    lesson: "your-deposit",
    text: "A vault's APR is the annualized rate its strategies are earning right now. It changes as the strategies' own rates change, so a year at today's APR is an estimate.",
    docs: "/user/concepts/myt-and-yield",
  },

  /* ── Beginner 3: Borrow against it ── */
  alusd: {
    term: "alUSD",
    lesson: "what-you-can-do-here",
    text: "alUSD is the synthetic debt token Alchemix mints when you borrow against a USDC deposit. Inside Alchemix one alUSD always counts as exactly one USDC of debt, whatever it trades for.\n\nOn exchanges it typically trades for a little under a dollar, because borrowers sell it for USDC to spend.",
    docs: "/user/concepts/alAssets",
  },
  debt: {
    term: "Debt",
    lesson: "borrowing",
    text: "Your Debt is the alUSD you owe, counted at face value.\n\nIt falls when a redemption cancels part of it, when you repay, or when a liquidation settles part of it. Borrowing more is the only thing that raises it, since Alchemix adds no interest.",
    docs: "/user/concepts/self-repaying-loans",
  },
  ltv: {
    term: "LTV",
    lesson: "borrowing",
    text: "Loan to value (LTV) is your Debt divided by your Deposit, the share of your deposit's value that you owe.\n\nAlchemix lends up to 90% LTV, the MAX LTV marker on the health bar, where new borrowing and withdrawals stop. A position at or above 95% LTV, the LIQ LTV marker, can be partly liquidated.",
    docs: "/user/concepts/liquidations",
  },
  borrowable: {
    term: "Borrowable",
    lesson: "borrowing",
    text: "Borrowable is how much more alUSD you can borrow before your LTV reaches the 90% limit. It rises as redemptions or repayments lower your debt, and as yield raises your deposit.",
    docs: "/user/tutorials/borrowing-in-alchemix",
  },

  /* ── Beginner 4: Spend the alUSD ── */
  discount: {
    term: "the discount",
    lesson: "spend-the-alusd",
    text: "The discount is the gap between a dollar and what alUSD sells for on an exchange. It exists because borrowers sell newly minted alUSD for USDC to spend.\n\nFor a borrower who swaps, it is the first cost of a loan: you owe the full amount you borrowed and receive a little less in USDC. For a Fixed Yield depositor, it is the return.",
    docs: "/user/concepts/alAssets",
  },

  /* ── Beginner 5: The loan pays itself off ── */
  redemption: {
    term: "redemption",
    lesson: "self-repaying",
    text: "A redemption removes MYT from your deposit and cancels the same amount of your debt, effectively deleveraging your position. The MYT pays a Fixed Yield depositor when they claim.\n\nSince both sides of your position fall by the same amount, a redemption costs you only the redemption fee. Redemptions are how an Alchemix loan pays itself off over time.",
    docs: "/user/concepts/redemption-rate",
  },
  earmarked: {
    term: "Earmarked",
    lesson: "self-repaying",
    text: "Earmarked is the part of your debt reserved for upcoming redemptions. It grows as alUSD deposits on the Fixed Yield page vest toward their maturity date, less any MYT already waiting to pay them.\n\nEarmarked debt is still your debt, and the part of your deposit set aside to pay it keeps earning until the Fixed Yield depositor claims. It can be repaid only with MYT, or with USDC the app deposits into MYT for you.",
    docs: "/user/concepts/redemption-rate",
  },
  redemptionRate: {
    term: "Redemption Rate",
    lesson: "self-repaying",
    text: "The Redemption Rate is a projection of how fast redemptions are paying down debt in the vault: the alUSD set to vest on the Fixed Yield page over the next week, scaled up to a year, divided by everything borrowers owe.\n\nIt rises and falls with how much alUSD is waiting there, so it differs from vault to vault and chain to chain.\n\nWhile MYT that borrowers already repaid is covering depositors' claims, the stat reads 0%, and the rate that will apply once it is used up is shown beside it as future.",
    docs: "/user/concepts/redemption-rate",
  },
  redemptionFee: {
    term: "redemption fee",
    lesson: "self-repaying",
    text: "The redemption fee is a small percentage of each redemption, taken from your deposit as the redemption happens and paid to the protocol. The same fee applies when you repay earmarked debt yourself.\n\nIt is the second cost of an Alchemix loan after the discount. The rate is set per chain under DAO governance.",
    docs: "/user/concepts/fees",
  },

  /* ── Beginner 7: What can liquidate you ── */
  liquidation: {
    term: "liquidation",
    lesson: "what-can-go-wrong",
    text: "A liquidation is anyone settling part of your loan out of your deposit once your LTV reaches 95%. A loss of funds in one of the vault's strategies can push your LTV to 95%. A price drop cannot, since the vault counts your deposit and your debt in the same asset.\n\nA liquidation first settles any earmarked debt out of your deposit, and if your LTV is then under 95%, the liquidation ends with nothing more taken. Otherwise the liquidation takes enough deposit to bring your LTV back to 90%, and the deposit taken goes to the Transmuter.\n\nThe liquidator receives a fee of 1.5% of what your deposit exceeded your debt by, and the rest of your position stays open and earning.",
    docs: "/user/concepts/liquidations",
  },
  strategy: {
    term: "strategy",
    lesson: "your-deposit",
    text: "A strategy is one of the yield sources on other protocols, such as lending markets, liquid staking or other vaults, that a vault spreads its deposits across, chosen and weighted by the Alchemix DAO. Your deposit earns what the strategies earn.\n\nIf one experiences a loss of funds, every deposit in the vault is worth less. Besides borrowing more or withdrawing, that is one thing that can raise your LTV.",
    docs: "/user/concepts/myt-and-yield",
  },

  /* ── Beginner 8: The other side of your loan ── */
  fixedYield: {
    term: "Fixed Yield",
    lesson: "the-transmuter",
    text: "Fixed Yield is the Earn page, listed in the menu as Fixed Rate, where you deposit alUSD for a set term and receive one USDC for each alUSD at the end.\n\nSince alUSD typically trades for slightly less than a dollar, each alUSD returns more than it cost, and you know the cost, the return and the maturity date on the day you deposit.",
    docs: "/user/concepts/transmuter",
  },
  transmuter: {
    term: "Transmuter",
    lesson: "the-transmuter",
    text: "The Transmuter is the Alchemix contract that holds Fixed Yield deposits while they vest and pays depositors when they claim. As deposits vest, the same amount of borrowers' debt is earmarked.\n\nWhen a depositor claims, it pays first from MYT it already holds from borrowers' repayments and from liquidations, and redeems the rest from borrowers' deposits. It pays the depositor in MYT, which the app unwraps to USDC, and the claimed alUSD is burned.",
    docs: "/user/concepts/transmuter",
  },
  earlyExitFee: {
    term: "early exit fee",
    lesson: "the-transmuter",
    text: "The early exit fee is a percentage of your unvested alUSD, charged when you claim before the maturity date. The button for an early claim reads Claim with Penalty.\n\nThe vested share is still paid in full as USDC, and the unvested remainder is returned as alUSD less the fee. Each card shows its fee, which is set per chain. The fee discourages depositors from leaving before the term ends.",
    docs: "/user/concepts/fees",
  },

  /* ── Intermediate 1: The three contracts behind your position ── */
  mytVault: {
    term: "MYT vault",
    lesson: "three-contracts",
    text: "The MYT vault is the contract that issues MYT. It takes USDC or ETH, mints MYT for it at MYT's current price, and spreads the deposits across the strategies the Alchemix DAO chooses.\n\nIt is built on Morpho Vaults V2. Withdrawing from a position or from Mixed Yield turns MYT back into USDC or ETH through this vault.",
    docs: "/user/concepts/myt-and-yield",
  },
  alchemist: {
    term: "Alchemist",
    lesson: "three-contracts",
    text: "The Alchemist is the contract that holds the MYT behind every position in a vault and lends against it. It mints alUSD, records each position's Deposit, Debt and Earmarked, and stops borrowing and withdrawing past 90% LTV.\n\nIt also earmarks debt as Fixed Yield deposits vest, and carries out redemptions and liquidations. Today each chain has one Alchemist for USDC and one for ETH, except Base, which has USDC only.",
    docs: "/dev/architecture/overview",
  },
  positionNft: {
    term: "position NFT",
    lesson: "three-contracts",
    text: "A position NFT is the token the Alchemist mints when you open a position, and it lands in your wallet. Its number is the position's ID, shown on the vault's page when you open the position from the Dashboard, in the Send dialog and on the Contracts tab.\n\nWhoever holds the NFT controls the position: only that wallet can withdraw from it, only that wallet or one it has approved can borrow against it, and sending the NFT sends the deposit and the debt with it.\n\nThe NFT stays in your wallet after the position is emptied, and can take new deposits.",
    docs: "/user/concepts/self-repaying-loans",
  },

  /* ── Intermediate 2: Inside MYT: where your yield and your risk come from ── */
  // Kept from the old track; no 2026-11 script defines or uses it.
  dao: {
    term: "DAO",
    lesson: "where-yield-comes-from",
    text: "The Alchemix DAO governs the protocol. It picks the strategies in each vault, sets each one's share and the caps on the riskier ones, and rebalances them as markets shift.\n\nUntil governance is fully on-chain, the DAO's multisig wallet carries out those allocations.",
  },
  performanceFee: {
    term: "performance fee",
    lesson: "where-yield-comes-from",
    text: "The performance fee is the share of a vault's yield that the protocol takes before the rest raises the MYT price. It is taken from yield only, so a vault that earns nothing pays nothing.\n\nEach vault has its own rate. It is 15% on most vaults, 5% on Ethereum's ETH vault and 17.5% on Base's USDC vault. The APR the app shows is what is left after the fee.",
    docs: "/user/concepts/fees",
  },
  riskLevel: {
    term: "Risk Level",
    lesson: "where-yield-comes-from",
    text: "A Risk Level is the class each strategy is given before it joins a vault: Conservative, Moderate or Aggressive.\n\nThe level depends on how money enters and leaves the strategy, how the strategy is priced, and how long a withdrawal can take. A strategy is Conservative only if all three are the safest kind, and any one that is riskier makes it at least Moderate. The DAO can also raise a level for other factors, such as a strategy's age, but never lower it.\n\nModerate and Aggressive strategies are capped at a share of the vault.",
    docs: "/governance/guides/myt-strategies",
  },
  priceSource: {
    term: "fundamental oracle",
    lesson: "where-yield-comes-from",
    text: "A fundamental oracle prices a strategy from its own accounting: the assets backing the strategy's token divided by the tokens it has issued. If that token trades lower on an exchange while its backing is intact, MYT's price holds.\n\nA strategy priced at market uses an outside price feed instead, so a drop in its token's market price lowers MYT and raises every LTV in the vault.\n\nToday every strategy in the USDC vaults is priced from its own accounting.",
    docs: "/governance/guides/myt-strategies",
  },
  // The docs page's caps table is out of date (script I2's note).
  cap: {
    term: "risk cap",
    lesson: "where-yield-comes-from",
    text: "A risk cap is the largest share of a vault the DAO can move into Moderate or Aggressive strategies when it allocates. Conservative strategies have no cap.\n\nOn Ethereum, Moderate strategies can hold up to 60% of the vault and Aggressive strategies up to 10%, so riskier strategies together can hold up to 70%. On Optimism and Base the two together can hold up to 60%, and on Arbitrum up to 50%.\n\nCaps are checked only when the DAO allocates, so withdrawals can leave a share above its cap until the DAO rebalances. The Info tab shows the share in use.",
    docs: "/user/concepts/myt-and-yield",
  },

  /* ── Intermediate 3: Reading your position: Health Factor and the 90% to 95% band ── */
  healthFactor: {
    term: "Health Factor",
    lesson: "getting-money-back",
    text: "Health Factor is 90% divided by your LTV, so it shows how far your position is from the 90% limit. It reads 1.00 when your LTV is at that limit, above 1 while you can still borrow and withdraw, and about 0.95 at the 95% liquidation line. With no debt it reads ∞.\n\nIt also tells you how large a loss in the vault your position can take before its LTV reaches 90%: 1 divided by your Health Factor is the share of today's Deposit that must remain. At 1.8 that is about 56%, so a loss of about 44% would take you to the limit.",
    docs: "/user/tutorials/borrowing-in-alchemix",
  },
  netValue: {
    term: "Net Value",
    lesson: "getting-money-back",
    text: "The Dashboard's Net Value, in its summary bar, is the dollar value of your deposits minus the dollar value of your debts, across the positions shown. It prices your debt at alUSD's market price, so while alUSD trades under a dollar it reads a little more than your Deposit minus your Debt.",
    docs: "/user/quick-start",
  },

  /* ── Advanced 1: How your debt is earmarked and redeemed ── */
  earmarking: {
    term: "earmarking",
    lesson: "earmarking-and-cover",
    text: "Earmarking is how the Alchemist reserves borrowers' debt for Fixed Yield claims. As each deposit on the Fixed Yield page vests, block by block, the Alchemist earmarks an equal amount of borrowers' debt, minus whatever cover can pay. It takes the same share of every borrower's unearmarked debt, so a larger loan has more earmarked.\n\nYour Earmarked stat includes everything earmarked up to the current block. The MYT behind earmarked debt stays in your deposit and keeps earning until the Fixed Yield depositor claims.",
    docs: "/user/concepts/redemption-rate",
  },
  cover: {
    term: "cover",
    lesson: "earmarking-and-cover",
    text: "Cover is MYT the Transmuter already holds, which the Alchemist uses before it earmarks anyone's debt. It comes from repayments of debt that was not earmarked, made with USDC or MYT, and from deposit taken in liquidations.\n\nWhile cover lasts, newly vested Fixed Yield deposits are settled from it, no new debt is earmarked, and the Redemption Rate reads 0%. At a claim, the Transmuter pays from the MYT it holds before it redeems from borrowers.",
    docs: "/user/concepts/redemption-rate",
  },

  /* ── Advanced 2: What sets the Redemption Rate ── */
  totalDebt: {
    term: "Total Debt",
    lesson: "pace-of-repayment",
    text: "Total Debt is everything a vault's borrowers owe together, in alUSD. The Redemption Rate divides a year of projected redemptions by it, so when borrowers owe more, the same Fixed Yield queue pays down a smaller share of each loan and the rate falls.\n\nThe vault's card on the Borrow page shows it in dollars, with alUSD at its market price.",
    docs: "/user/concepts/redemption-rate",
  },
  queue: {
    term: "queue",
    lesson: "pace-of-repayment",
    text: "The queue is the alUSD in open deposits on a vault's Fixed Yield page, deposited and not yet claimed. Each deposit vests a little every block until its maturity date, and borrowers' debt is earmarked as it does.\n\nA larger queue, or a shorter term, means more alUSD vests each week, so the Redemption Rate rises.",
    docs: "/user/concepts/redemption-rate",
  },

  /* ── Intermediate 4: What a loan costs, and how to recover the discount ── */
  borrowAndSwap: {
    term: "Borrow & Swap",
    lesson: "cost-of-borrowing",
    text: "Borrow & Swap is the Borrow tab with USDC picked in its token picker. You type the USDC you want, and in one transaction the app borrows enough alUSD to get that much USDC at the quoted rate and swaps it.\n\nYour Debt is the alUSD minted, one USDC of debt for each. The quoted rate already includes a 0.05% swap fee, and the slippage setting, 1% by default, limits how far the price may move before the transaction fails.",
    docs: "/user/tutorials/borrowing-in-alchemix#step-4--enter-a-borrow-amount",
  },
  loanCost: {
    term: "Loan Cost",
    lesson: "cost-of-borrowing",
    text: "Loan Cost is the discount you paid by selling borrowed alUSD under a dollar. For each borrow, it is the amount borrowed times the gap between a dollar and alUSD's market price at that moment. It counts every borrow on the position and leaves out swap fees. Flash Repay shows it as Current Loan Cost before you confirm.\n\nYou can recover part or all of it by repaying debt that is not yet earmarked with alUSD bought under a dollar, by hand or with Flash Repay, since each of those alUSD clears a full dollar of debt. Earmarked debt can be repaid only with MYT or USDC, and a redemption settles it at a full dollar, so the discount on that part is locked in.\n\nThe Visualizer's Loan Cost is worked out another way: your starting Debt times the gap between a dollar and the price in its alUSD:USDC field.",
    docs: "/user/tutorials/repay-loan#loan-cost",
  },
  globalBurnable: {
    term: "Global Burnable",
    lesson: "cost-of-borrowing",
    text: "Global Burnable is the most alUSD that can still repay debt on a chain: the alUSD that chain's Alchemist has issued, minus the alUSD waiting in its Transmuter. Each alUSD waiting there needs a dollar of borrowers' debt to be earmarked as it vests and redeemed when it is claimed, so the Alchemist keeps that much debt in place.\n\nOn Optimism, Arbitrum and Base, the Repay tab shows it when it is lower than your unearmarked debt. When it reads 0, loans there can be repaid only with USDC or MYT.",
    docs: "/user/tutorials/repay-loan#limits",
  },
  flashLoan: {
    term: "flash loan",
    lesson: "cost-of-borrowing",
    text: "A flash loan is a loan borrowed and paid back inside a single transaction. If it is not paid back by the end, the whole transaction fails and nothing happens, so the lender needs no collateral.\n\nFlash Repay and Yield Looping both borrow USDC this way from Morpho, and the app adds no fee for it.",
    docs: "/user/tutorials/repay-loan#flash-repay",
  },
  flashRepay: {
    term: "Flash Repay",
    lesson: "cost-of-borrowing",
    text: "In one transaction, Flash Repay borrows USDC with a flash loan, buys alUSD on the market with it, and repays the part of your debt that is not earmarked. It then withdraws as much of your deposit as the debt it cleared and uses that to repay the flash loan.\n\nEach alUSD cost less than a dollar and cleared a full dollar of debt, so the difference comes to your wallet, recovering part or all of your Loan Cost. It needs alUSD to trade under a dollar, and it is limited by Global Burnable.",
    docs: "/user/tutorials/repay-loan#flash-repay",
  },

  /* ── Advanced 3: The peg, and what sets a Fixed Yield return ── */
  peg: {
    term: "peg",
    lesson: "transmuter-and-peg",
    text: "alUSD's peg is one USDC, the price it is designed to trade at. Inside Alchemix it always counts at that price: one alUSD cancels one USDC of debt, and a Fixed Yield claim pays one USDC for each alUSD.\n\nOn exchanges the price floats. Borrowers selling alUSD push it under a dollar, and buyers who deposit it on Fixed Yield or repay debt with it pull it back.\n\nNo contract fixes the market price at a dollar, so it is called a soft peg.",
    docs: "/user/concepts/how-peg-is-maintained",
  },
  repaymentArbitrage: {
    term: "repayment arbitrage",
    lesson: "transmuter-and-peg",
    text: "Repayment arbitrage is buying alUSD under a dollar and repaying debt with it at a full dollar. The alUSD used is burned, and the buying pulls the price back toward the peg.\n\nIt works only on debt that is not earmarked, since earmarked debt can be repaid only with MYT or USDC, and only up to Global Burnable on that chain.",
    docs: "/user/concepts/alAssets#mechanisms-that-close-the-discount",
  },
  fixedYieldCap: {
    term: "Deposit Cap",
    lesson: "transmuter-and-peg",
    text: "A Fixed Yield card's Deposit Cap shows the alUSD on that card not yet marked matured, against the most the card can hold. The (i) tooltip beside it shows Available space, how much more alUSD the card can take.\n\nThe most a card can hold is the smaller of two limits: the cap the DAO sets for that chain's Transmuter, and the alUSD that chain's Alchemist has issued. A deposit larger than Available space fails, so check it before you buy alUSD for a card.",
    docs: "/user/concepts/transmuter",
  },
  alUSDb: {
    term: "alUSDb",
    lesson: "transmuter-and-peg",
    text: "alUSDb is Base's own version of alUSD, the synthetic debt token you receive when you borrow against USDC in the Base vault. On Base's Fixed Yield card, a deposit of alUSDb can be claimed for USDC after a 28-day term.\n\nIt is minted and burned only by Base's own Alchemix contracts and cannot be bridged. alUSD that reached Base from another chain is a different token: it cannot repay alUSDb debt or be deposited on the Base card.",
    docs: "/user/concepts/alAssets#alusdb-on-base",
  },

  /* ── Intermediate 5: What happens when the vault loses money ── */
  // Defined in scripts I7 and I8 with one text, I7's. Owned by I8 per the
  // fix plan (section A), so I7's mention renders as plain text.
  badDebt: {
    term: "bad debt",
    lesson: "ltv-and-risk",
    text: "A vault is in bad debt when the alUSD it has issued is worth more than the collateral backing its loans plus the MYT its Transmuter holds from repayments and liquidations. This can happen when a loss in the vault comes too fast for liquidations to keep every loan backed.\n\nWhile it lasts, the vault rejects new deposits and new loans. Withdrawals, repayments and liquidations keep working, and every Fixed Yield claim pays the same reduced share. A depositor can claim at that rate, or wait for the backing to be restored and claim in full.",
    docs: "/user/safety/risk-considerations#myt-loss--price-reported-correctly",
  },
  selfLiquidation: {
    term: "self-liquidation",
    lesson: "ltv-and-risk",
    text: "Self-liquidation is paying off your whole loan out of your own deposit, on the Liquidate tab. It settles any earmarked debt first with the redemption fee, clears the rest of your debt with the same amount of deposit, and returns what is left, as USDC by default or as MYT.\n\nIt works while your LTV is under 95% and charges no liquidator fee. Each alUSD of debt is cleared with a full dollar of deposit, so the Loan Cost you paid when you sold the alUSD stays a cost.",
    docs: "/user/tutorials/borrowing-in-alchemix#reading-the-vault-page",
  },
  globalMinimum: {
    term: "global minimum",
    lesson: "ltv-and-risk",
    text: "A vault is below its global minimum when its total debt reaches 95% of the value of all the MYT deposited in it. While it is below it, any position already at 95% LTV or over is liquidated in full: its whole debt is canceled with collateral worth the same, and the owner keeps the rest.\n\nPositions under 95% LTV stay as they are.",
    docs: "/user/concepts/liquidations#how-a-liquidation-runs",
  },
  feeVault: {
    term: "fee vault",
    lesson: "ltv-and-risk",
    text: "The fee vault is a separate fund that pays a liquidator's fee when a position is liquidated in full. In that case the fee is 1.5% of the debt, and nothing beyond the seized collateral is taken from the position.\n\nAnyone can add to it.",
    docs: "/user/concepts/fees#liquidator-fee",
  },
  guardian: {
    term: "Guardian",
    lesson: "ltv-and-risk",
    text: "A Guardian is one of several wallets that can each pause new deposits or new loans in a vault on its own, for example when a strategy may be reporting more than it is worth. Withdrawals, repayments and liquidations keep working while it does.",
    docs: "/governance/guides/contract-roles",
  },

  /* ── Intermediate 6: Choosing an LTV and sizing a loan ── */
  // No terms of its own. "Sizing a position" had a popover until 2026-11-09;
  // it is a general phrase, and the lesson defines it in its own sentence.

  /* ── Advanced 4: Yield Looping: what it earns and what it risks ── */
  yieldLooping: {
    term: "Yield Looping",
    lesson: "yield-looping",
    text: "Yield Looping borrows against your deposit and adds the borrowed money to that same deposit, in one transaction from the Yield Looping tab. A flash loan of USDC is deposited with yours, alUSD is borrowed against the larger deposit and sold, and the USDC from that sale pays back the flash loan.\n\nIt opens a position, or adds to the one you have. You end with a larger deposit earning and a larger debt, at about the LTV you target.\n\nYou pay the discount on the alUSD it sells, and a loss in the vault falls on the whole larger deposit.",
    docs: "/user/tutorials/borrowing-in-alchemix#reading-the-vault-page",
  },
  boostedApr: {
    term: "Boosted APR",
    lesson: "yield-looping",
    text: "Boosted APR, on the Yield Looping tab, is the vault's APR times the Loop Multiplier. It is the yield on your own money once the loop's extra deposit earns too.\n\nIt leaves out the discount paid on the alUSD the loop sells, and it falls back toward the vault's APR as redemptions pay the loop's debt down.",
    docs: "/user/concepts/alAssets#ltv-sensitivity",
  },
};
