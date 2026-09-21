# Alchemix writing style

One voice runs across everything Alchemix publishes: someone who built the protocol, explaining it plainly to a person deciding where to put their money. This sheet is that voice written down. It replaces the v3 tone-of-voice framework, and the tweet conventions and the incident pattern from that framework are carried over below, so nothing else needs reading alongside it.

It governs three surfaces. The voice is the same on all three. What shifts is how much scenario, instruction and wit each one carries, which section 3 sets out.

| Surface | What it is | Where |
| --- | --- | --- |
| Articles and socials | Medium and X long-form pieces, threads, announcements | alchemixfi.medium.com, x.com/AlchemixFi |
| Docs | Reference pages: concepts, tutorials, safety, governance, dev | docs.alchemix.fi |
| Academy | Thirteen lessons that teach the protocol by having the reader use it | docs.alchemix.fi/academy |

The voice was read from what already sounds right, then checked against the review notes on what does not:

- [Diverse, risk-adjusted DeFi yield](https://alchemixfi.medium.com/diverse-risk-adjusted-defi-yield-12949e9ea209), [Master DeFi's new fixed yield primitive](https://alchemixfi.medium.com/master-defis-new-fixed-yield-primitive-2897fe8bb709) and [Introducing Alchemix v3](https://alchemixfi.medium.com/introducing-alchemix-v3-037a2ed26ab6), plus the approved liquidations, peg and Temporal Leverage drafts.
- The docs concept pages (self-repaying loans, Transmuter, liquidations, Mix-Yield Token, redemption rate), the FAQ and the safety pages.
- Every learner-facing sentence in the Academy, and the review notes on it from September 2026.

The two July articles are the everyday voice. The launch piece is a launch-day register, used once, and section 3 says what from it stays out of ordinary copy.

## 1. The voice

Alchemix speaks as the people who built it, to one reader who is about to do something with their money.

- **Who speaks.** The protocol's own people. "We" appears only where the team acted: we raised the fee, we announced the terms. Never a narrator with opinions about the reader.
- **Who reads.** One person, "you", about to deposit, borrow, buy below par or pick an LTV. A crypto-native reader gets the terms straight. A newcomer gets each term spelled out once, in the sentence where it first matters.
- **The stance.** Confident because the mechanism is on the page, calm about risk, and honest about cost in the same tone as benefit. Alchemix sells by stating what happens. "A price drop on its own cannot liquidate you" is the whole pitch.
- **The theme.** Alchemy lives in the names: Transmuter, Alchemist, alAssets, transmutation. It never gets into the verbs. Nothing brews or alchemizes, and nothing transmutes except the Transmuter.
- **The test.** Would the person who wrote the liquidations article have written this sentence? If it sounds like a press release, a chatbot or a compliance notice, it fails.

## 2. Sentence rules

1. **A named subject does a verb.** The protocol, the DAO, the Transmuter, the market, you. A sentence with no main verb is a label, and labels belong in tables.
   - Out: "Three things you can do here, and a loan balance that falls on its own."
   - In: "Redemptions pay the balance down for you. Borrowing more is the only thing that raises it."
2. **The positive carries Alchemix.** A negation describes the other system, the old version, or the answer the reader just got wrong. Delete every no, nothing, never and not in a paragraph. If it stops teaching, rewrite it.
   - Out: "No payout ever arrives for you to claim."
   - In: "Your yield shows up in the value of what you already hold."
   - One negation against a belief the reader already holds is fine: "A price drop on its own cannot liquidate you." Three in a row is not.
3. **Keep the concrete fact.** "Interest", not "a charge for time passing". "What the strategies earn and how fast redemptions run", not "protocol conditions". "It starts earning", not "it starts earning the same day".
4. **Stop at the fact.** No closing sentence that only completes a cadence, and no dimension the piece never uses. "The speed of that fall changes. The direction never does." loses its second sentence.
5. **Mechanism, then implication.** Say what happens, then what it means for the reader, then stop. "Each redemption takes the same value off both sides of your position. That is deleveraging, and because the two are like-kind it costs you only the redemption fee."
6. **Contrast points outward.** Open with what most lending platforms do, then what Alchemix does instead. Two descriptions of Alchemix are never set against each other ("not a punishment, but a safety valve").
7. **Nothing inanimate wants anything.** A track does not walk, a rate does not decide, a cost does not land, collateral does not stand behind a loan. People and the DAO act. The market trades. A control on screen moves.
8. **No stage directions.** The page is already showing it. "Notice", "watch", "look at" and "see how" go. A gating hint stays: "Move both controls to continue."
9. **One caveat, at the end, in a person's words.** "These figures use an example rate. Real rates move." Never inside the teaching sentence, never in a headline, and never the word "illustrative".
10. **Vary the length on purpose.** A short pivot between two longer builds: "Theory is cheap in DeFi." "Those numbers are the point." A run of same-length declaratives reads as flat, and flat is as off-spec as slop.
11. **Say it once.** A point restated within a few sentences is padding. Reinforcement across the stages of a lesson, or the takeaway at the end of an article, is not.
12. **No em dashes.** Commas, periods, colons, parentheses, or a rewrite.

Words that mark a sentence for a second look: actually, simply, genuinely, just (as an intensifier), essentially, ensure, utilize, seamless, robust, powerful, rigorous, comprehensive, cutting-edge, pivotal, journey, landscape, elevate, unleash, "the point is", "the good news is", "pro tip", "in order to", "it is important to note".

## 3. The register dial

| | Articles and socials | Docs | Academy | Incident notice |
| --- | --- | --- | --- | --- |
| Opens with | The reader's world, then what Alchemix does instead | The mechanism, in one sentence | A situation using numbers the reader has already met | Status, then what to do |
| Person and tense | "You", present. "We" where the team acted | "You", present. No "we" | "You", doing something on a named screen | "We", present |
| Allowed | One short pivot per section, a light forward look at the close, verbs like capture and lock in | Label lists, admonitions, tables | Named people in scenarios (Ana, Ben), a question before the answer, wrong-answer feedback that denies the click | Nothing else |
| Kept out | Hype, the theme on serious topics, unshipped features in the present tense | Pivots, wit, opinion, first person | Figures before the lesson has taught them, screenshots ahead of the action, quiz housekeeping | The theme, adjectives, speculation |
| Length | 800 to 1,100 words. One long post for a feature explainer | As long as the mechanism needs | Three to six sentences per stage | Three sentences |

The same fact on each surface:

- **Article.** "On most lending platforms, liquidation is a price problem. Deposit ETH, borrow against it, and if ETH falls far enough, the protocol sells your collateral to cover the loan. Alchemix v3 removes price from that equation. A price drop on its own cannot liquidate you."
- **Docs.** "Because loans and collateral are like-kind, with ETH backing alETH and USDC backing alUSD, a move in the price of ETH or USDC does not force positions to close."
- **Academy.** "ETH was 3,000 last night and 1,800 this morning. Where is the LTV in the morning?" The reader answers, then: "Your debt is recorded in alETH, the same kind of asset as your deposit. When ETH falls, both sides fall by the same share, so the ratio between them holds."
- **Incident.** "We've paused [X] while we investigate [Y]. Funds are safe. Updates to follow."

What the launch article did that ordinary copy does not: "changes everything", "unleashing", "the new standard", "welcome to the new Alchemix", and features described in the present tense before they had shipped. A launch gets one of these. An explainer gets none.

Social conventions carried over from the old framework: an educational feature post is one long-form post (hook "Learn how to [X] in 60 seconds", one paragraph, "The flow:" with numbered steps, one worth-knowing line, "Learn more about X:" and a 🔗 link). A thread only when one is asked for: 280 characters per tweet, one idea per tweet, 🧵 on the first. Icons only where the source draft has them. Partner handles verified before posting.

## 4. Words

Product terms, written the one way:

| Term | Form | Note |
| --- | --- | --- |
| alUSD, alETH, alAsset, alAssets | lowercase al, capital A | "synthetic debt tokens", never "algorithmic stablecoin" |
| Mix-Yield Token (MYT) | spelled out on first use, then MYT | mixETH and mixUSD are the Mainnet brands. MYT in prose about the mechanism |
| Transmuter, Alchemist | capitalized | the Alchemist is the contract that holds positions. A learner hears "vault" |
| Self-Repaying Loan | capitals when naming the product | lowercase when describing behavior: "a loan that repays itself" |
| Temporal Leverage | capitals in articles | see the open question at the end |
| Conservative, Moderate, Aggressive | capitalized | never low, medium, high |
| Borrow page, Fixed Yield page, Mixed Yield page, Dashboard, Visualizer, Info tab, Earmarking and Redemptions panels | as the app writes them | the app's nav reads Borrow, and Earn → Variable Rate / Fixed Rate |
| the app | | not dApp, dapp or UI in prose |
| Alchemix v3 | lowercase v | |
| earmark, earmarked, redemption, redemption rate, transmutation term, deposit cap, early exit fee, borrower redemption fee, performance fee | lowercase | fees are named as the Fees page names them |
| like-kind, deleverage, backing, collateral, face value, below par, the discount | | "the discount" is the alAsset's market gap. "The spread" only in a trading context |

- **Numbers.** Digits always: 90%, 1:1, 20 weeks, 3 months, 0.96. Thousands separators: 10,416. Prices as decimals with no currency sign when the sentence is about an alAsset against its underlying. "About" in prose, "~" in tables. "Annualized", with the term stated beside the rate.
- **Spelling.** US: annualized, favor, toward, behavior, optimize. British forms fail the Academy checker.
- **Acronyms.** Spelled out on first use per piece when the audience is not assumed crypto-native: loan to value (LTV), Mix-Yield Token (MYT). DAO, APR, ERC-4626 and DeFi stand alone.
- **Tense.** Present for what exists. What has not shipped is in the future, framed with a date ("in active development, targeted for later this year"), never in the present.
- **Out.** DeFi slang (moon, wen, ngmi, wagmi, "APY go brrr"), invented alchemy verbs, emoji in long-form, exclamation marks, "utilize", "leverage" as a verb meaning use, "ensure", and the adjectives listed in section 2.

## 5. Shapes

- **Opening.** The reader's world in one or two sentences, then Alchemix's fact. Or the product's job in one sentence: "The Transmuter is Alchemix v3's peg stability engine and a source of fixed yield for everyone." Never a sentence about the piece itself.
- **Headers.** Sentence case. A reader's question or a plain noun phrase: "What can liquidate", "Where returns come from", "Things to weigh before you enter". No "Introduction", "Overview" or "Conclusion".
- **Worked example.** One per mechanism with arithmetic. Round inputs, every figure derived from the one before, ending on the annualized number. "alUSD is trading at 0.96 with a 90-day term. You swap 10,000 USDC for around 10,416 alUSD. Deposit it, wait the term, and receive 10,416 USDC at maturity. That is 416 USDC, about 4.16% over three months, or roughly 16.6% annualized."
- **Caveat.** Once, after the example, as a person would say it. In the docs, a `:::warning` admonition for anything that can cost money (caps, bridging), never a hedge inside the explanation.
- **Costs and risks.** Stated in the same tone as the benefits, in their own section, before the close. "Early exit means giving up part of the fixed-rate outcome."
- **Closer.** One paragraph saying what the mechanism is for, then links, each on its own line with a verb-led label: "Capture the spread:", "Learn more about the Transmuter:".
- **Lists.** Only for parallel items that each carry a fact. Docs keep the `**Label** – text` en-dash pattern. Lessons use a bold lead. A list of nominalized nouns standing in for a sentence goes back to being a sentence.
- **Docs mechanics.** Curly apostrophes in body prose, straight quotes in code. Front matter, admonitions and components are untouched by a copy pass.

## 6. Facts and claims

Every number, name, firm, partner, handle and link is checked against the mechanism doc or the source draft before it ships. A reference that is in neither is flagged, never guessed.

Two mechanisms keep coming back wrong:

- **Redemptions repay the loan. Yield does not.** Debt falls because redemptions convert earmarked collateral into the asset that repays it. Yield raises the MYT's value on the collateral side. "The yield pays your loan down" is wrong. "Redemptions repay your debt out of your own collateral, and that collateral keeps earning" is right. Source: `docs/user/concepts/redemption-rate.md`.
- **The Transmuter is the saver's product. A borrower repays and withdraws.** One alUSD cancels one of debt inside the Alchemist, today. Sending borrowed alUSD through the Transmuter means waiting out a term for USDC while still carrying the debt. Source: `docs/user/concepts/transmuter.md` and `docs/user/tutorials/repay-loan.md`.

Figures that have drifted between pieces:

- **Risk caps.** The table in `docs/user/concepts/myt-and-yield.md` is the source: Aggressive 20% per strategy and 20% in total, Moderate 40% per strategy and 60% together with Aggressive, Conservative uncapped. The launch article and the earlier MYT drafts carry older figures.
- **Fees.** Quoted from the Fees page, which reads them live, never from memory.
- **Prices, APRs, terms.** Dated in the sentence ("as this is written", "today") and refreshed on publish day.
- **v2 against v3.** v2 already redeemed 1:1. What v3 adds is scheduled redemption of borrower collateral, which is what makes fixed-duration exits, 90% LTV and Temporal Leverage viable. Not "now there is redemption", and not "better UX".

Check the journey, not only the sentence. Every sentence about the Transmuter can be true while the path they describe is one the protocol does not recommend.

## 7. Before and after

| Where | Before | After |
| --- | --- | --- |
| Academy map | Six short lessons on the screens you use most: the deposit, the loan, the one real risk, and the swap back | The beginner track follows one position from the deposit through the loan that repays itself. |
| Academy lesson | No payout ever arrives for you to claim. | Your yield shows up in the value of what you already hold. |
| Academy lesson | About 2,000 is left, at an illustrative pace. | About 2,000 is left. Then, at the end of the lesson: These figures use an example rate. Real rates move. |
| Academy lesson | The USDC comes back carrying everything it earned. | The full balance is returned to you along with anything it earned. |
| Academy lesson | Repaying does more than reduce the balance. It frees collateral as well. | Repaying also frees collateral, so the amount you can withdraw rises immediately. |
| Docs, security | These independent reviews ensure the maximum possible integrity of our contracts before they are deployed. | Each firm reviewed the contracts before deployment. |
| Docs, security | Alchemix V3 is protected by a multi-layered internal defense strategy | Alongside the external audits, the team runs its own reviews. |
| Docs, risk | Users of any DeFi protocol are encouraged to Know Your Counterparty (the real KYC!). | Know who else is in the system, and where you sit in it. |
| Docs, risk | The good news is that Alchemix is designed to be a slow moving system especially at lower LTVs, so users who do not wish to constantly monitor positions can take loans at more conservative LTVs. | Alchemix moves slowly, and more slowly at lower LTVs. If you would rather not watch a position, open it at a conservative LTV. |
| Docs, intro card | Earn Competitive Risk-Adjusted Yield | Earn yield across a mix of strategies |
| Docs, FAQ | Alchemix V3 utilizes four primary fee parameters | Alchemix v3 charges four fees |
| Docs, repay tutorial | Pro tip: repaying with alAssets … allows you to clear your debt cheaper than 1:1! | alUSD and alETH often trade a little under 1.00 on Curve. Buy them there and repay with them, and each unit bought below par still clears a full unit of debt. |
| Launch article | How a Fixed-Duration Transmuter Changes Everything | What the fixed-duration Transmuter changes |
| Launch article | Unleashing 90% LTV | Borrowing to 90% LTV |

The docs lines show the rules at work. They are not a change list, and the docs get their own pass.

## 8. Checklist

- [ ] Every sentence has a named subject and a main verb.
- [ ] Delete test: if the reader loses no fact about Alchemix (a mechanism, a number, a name, an action), the sentence goes.
- [ ] Negations describe the other system, the old version, or a wrong answer. None stacks three deep.
- [ ] No em dashes. No "not X, but Y" about Alchemix. No "rather than" pivots.
- [ ] None of the flagged words in section 2 survive without a reason.
- [ ] Every figure, name and link checked against the mechanism doc or the source. Example figures caveated once, at the end.
- [ ] Present tense only for what exists.
- [ ] US spelling, digits for numbers, product terms as the table in section 4 has them.
- [ ] The user journey described is one the protocol recommends.
- [ ] Every sentence read in one sitting. For the Academy, `pnpm copy:check` writes the numbered inventory to `build/academy-sentences.txt` and fails on the mechanical defects.
- [ ] Every line the reviewer quoted has been grepped for. A hit means the pass is not finished.
- [ ] Per channel: 280 characters per tweet in a thread, verb-led link labels at the close, and a `:::warning` for anything that can cost money in the docs.

## Open question

"Temporal Leverage" and "Self-Repaying Loan" are capitalized as product names in the articles and lowercase in the docs body. This sheet capitalizes them when they name the product. Confirm that, or pick lowercase everywhere, and the docs pass follows the choice.
