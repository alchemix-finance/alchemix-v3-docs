# Academy Read-Through

Every word a learner meets in the beginner track, in the order they meet it,
word for word with the live site. Read it here, or walk the real thing at
https://alchemix-docs-academy.vercel.app/academy with this open beside it.

**How to review, in three lines**

- Rewrite anything, directly in this doc. You cannot break anything: every
  change is reconciled against the code afterwards, applied to the site and the
  grading server together, and anything that cannot ship as written gets flagged
  back instead of silently dropped.

- Google comments are fine for discussing with each other, but only the text of
  this doc comes back to Claude. A decision has to land as an edit to the text.

- Anything in {curly braces} is a number the app fills in live; keep those. In
  the graded questions, ✓ marks the correct answer and the ↳ line under each
  option is the feedback a learner sees after picking it. Reword freely, keep
  four options per question. Small italic lines describe buttons and sliders;
  everything else is copy.

---

## The front door

*The track map, what a visitor sees first. The promise: learn by doing. Seven
short lessons, no wallet, nothing to install, no experience assumed.*

**Learn how Alchemix works by using it.**

Seven short lessons covering everything you need to use Alchemix: what it does,
what happens to your deposit, how borrowing works, and what can go wrong. Each
one gives you something to try before it tells you the answer.

No wallet, no sign-in, and nothing to install. No prior experience with DeFi is
assumed.

*Markets strip: Ethereum, Optimism, Arbitrum, each labelled alETH · alUSD*

Six markets on three chains: an ETH and a USDC market on each. Everything in
these lessons applies to all six.

**Advanced track teaser**

Coming after this one, for anyone who wants the arithmetic underneath.
Graduation asks for the beginner track alone. Finishing this one earns a second
Discord role and banks another {400} season points.

The six advanced lessons listed under it:

- The pace of repayment · What sets the speed a loan clears at, and what has no effect on it.
- Inside the Mix-Yield Token · The strategy mix, and the ceilings the DAO puts on risk.
- What borrowing really costs · There is no interest rate, so working out what you pay instead, and when.
- Choosing an LTV · How far a position can fall before the threshold reaches it.
- The peg and the discount · How a discount on an alAsset closes, and how to be the one who closes it.
- Capstone · One position, sized to raise what you need and survive what is coming.

**Reward card · On finishing the track**

The graduate role, and a place in the founding class

Each track has its own Discord role. The founding class role is available only
before season one opens. Once the season begins it can no longer be earned.

**Reward card · Banked for season one · {points} of {total} points**

Each lesson banks {100} points, and finishing the track banks {200} more.
Everything converts to season points when season one opens, so graduates begin
the season with a balance already banked.

**Once all seven are passed · Every lesson passed.**

The next step is the real thing. The quick start walks the same flow in the
interface, with real numbers and screenshots, and the app itself is at
alchemix.fi.

*Row chrome: "Lesson 3 · Up next", "Start lesson", "About 6 minutes",
"Lesson 1 · Complete", "Revisit lesson"*

---

## Lesson 1 · What Alchemix does

*Three things the protocol offers, and the one that surprises people. About 5
minutes. What this lesson must accomplish: the learner opens three product
pillars, then plots a normal loan against an Alchemix loan. The claim: the
balance falls on its own, no interest, no schedule. They leave believing: this
is not the loan I know, and the difference is the product.*

### Stage 1 · Learn

**Alchemix does three things.**

You can use any one of them on its own. Open each to see what it means, then
move on to the one that makes Alchemix unusual.

**Save · Deposit ETH or USDC and earn on it.**

Your deposit goes into a vault that spreads it across several yield strategies.
The Alchemix DAO, the community that governs the protocol, picks those
strategies and adjusts them over time, so there is nothing for you to manage.
There is no lock-up, and you can take your money out whenever you want.

**Borrow · Take a loan against that deposit, up to 90% of its value.**

You keep the deposit and it keeps earning. The loan charges no interest and has
no payment schedule, and the balance goes down over time on its own. Most people
find this surprising, and the next few lessons show how it works.

**Earn a fixed return · Buy alUSD or alETH below face value and redeem it at full value later.**

Alchemix loans are issued as alUSD and alETH. Anyone can hand those back to the
protocol and receive the real asset at an exact 1:1 rate, once a set waiting
period is up. Buying below 1.00 and waiting is a return you can work out in
advance. Lesson 7 covers it.

*Nudge until all three are opened: "Open all three to continue."*

**Reveal · The second one is the reason the other two exist.**

Everywhere else, borrowing costs you money for as long as you owe it. Interest
is added to the balance, and the balance grows until you pay it down.

An Alchemix loan works the other way round. Your deposit stays where it is and
keeps earning, and the protocol repays the balance from the position itself.
Nothing comes out of your income.

*Button: "See how that compares to a normal loan"*

### Stage 2 · Try

**The same loan, two ways.**

Both lines start at $10,000 borrowed. Set a rate you might be charged elsewhere,
and how long you want to look ahead.

*Chart "What you still owe", legend "A normal loan" and "An Alchemix loan",
sliders "Rate on a normal loan" and "Looking ahead"*

**Tile · Normal loan**

You owe {amount} after {n} years, having borrowed $10,000. Nothing was repaid,
so interest kept being added.

**Tile · Alchemix**

You owe nothing by then, and you never made a payment. Your deposit is still
yours, and it was earning the whole time.

*Nudge: "Move either control to carry on."*

**Reveal · No rate you pick makes the orange line go down.**

A normal loan balance only falls when you pay it. An Alchemix balance falls
because the protocol repays it for you, out of the position rather than out of
your pocket.

How quickly it falls depends on conditions that change, so no lesson can promise
you a date. The direction does not change. Left alone, the balance only moves
down.

*Button: "Answer one question"*

### Stage 3 · Check

*One of these three questions, drawn at random. Headline: "One question before
you move on."*

**You borrow against a deposit in Alchemix and then leave it alone. What happens to the amount you owe?**

- ✓ It goes down over time, without you doing anything
    - ↳ Right. The protocol repays the loan from the position itself, and that clears the balance over time.
- It goes up, because interest is added to the balance
    - ↳ Alchemix charges no interest, so nothing is being added to your balance.
- It stays exactly the same until you repay it
    - ↳ The balance does not sit still. The protocol repays it from the position while the loan is open.
- It moves up and down with the market price of your collateral
    - ↳ The amount you owe is recorded in alUSD or alETH and does not follow the market price of your collateral.

**What are you charged for an Alchemix loan?**

- ✓ No interest. The protocol pays the loan down for you over time
    - ↳ Right. There is no interest rate on an Alchemix loan.
- A variable rate that rises when more people are borrowing
    - ↳ There is no variable rate here. Alchemix loans do not accrue interest at all.
- A fixed annual rate, agreed at the moment you borrow
    - ↳ There is no fixed rate either. Alchemix loans do not accrue interest at all.
- A daily fee for every day the loan stays open
    - ↳ Nothing is charged per day. The loan does not accrue interest.

**What happens to your deposit while a loan is open against it?**

- ✓ It stays in the vault and keeps earning the whole time
    - ↳ Right. That is the point of the design: the position you borrowed against is what repays the loan.
- It is locked and stops earning until the loan is repaid
    - ↳ It keeps earning the whole time. Nothing about an open loan stops the deposit working.
- It is sold, and the proceeds are handed to you as the loan
    - ↳ Nothing is sold. You keep your deposit, which is the point of borrowing against it in the first place.
- It is lent out to other users and returned when you repay
    - ↳ Your deposit is not lent to anyone. It stays yours and keeps earning in the vault.

**On passing · Lesson 1 complete.**

You can say what Alchemix offers and what makes its loans different from the
ones you have met before. The rest of the track works through each piece in
turn.

### Wrap-up · "What you just worked out"

Alchemix offers three things, and you can use any one of them without the
others. You can deposit and earn. You can borrow against a deposit. You can buy
alUSD or alETH below face value and redeem them at full value later.

The protocol is best known for the second. Borrowing elsewhere costs you money
for as long as you owe it, because interest is added to the balance. An Alchemix
loan charges no interest at all, and the balance falls over time on its own.

**Why the balance falls**

Your deposit does not leave when you borrow against it. It stays in the vault
and keeps earning, and the protocol repays the loan from the position itself, so
nothing comes out of your income.

That also explains why there is no payment schedule. Nothing is waiting on you,
so there is nothing to miss.

How quickly a balance clears depends on conditions that change over time, so no
lesson can give you a date. The direction does not change. Left alone, a loan
balance only moves down.

*Go deeper in the docs: Quick Start (open a position in a few minutes),
Self-Repaying Loans, Glossary (every term in one place)*

---

## Lesson 2 · Your deposit and what it earns

*Where your money goes when you deposit it, and who decides what it does. About
6 minutes. What this lesson must accomplish: the learner guesses next-day
availability, then grows a deposit on a chart. The claim: deposits become MYT,
the DAO steers the strategies, there is no lock-up. They leave believing: I know
where my money is, and I can leave whenever I want.*

### Stage 1 · Learn

**Where your money goes.**

You deposit $10,000 USDC. The vault wraps it into a token called the Mix-Yield
Token, or MYT, and the MYT does the earning.

*Flow diagram: 1 You deposit, $10,000 USDC, "Your own money" · 2 The vault
gives you, MYT, "A share of the whole pot" · 3 The MYT earns, Continuously,
"From the moment it is minted"*

**Who chooses**

The Alchemix DAO picks which strategies the pot is spread across, and moves the
weights around as conditions change. You do not choose them, and you do not have
to watch them.

**How you earn**

There is no payout to claim. Each MYT you hold becomes worth more of the
underlying asset over time.

**Getting out**

There is no lock-up. You can redeem your MYT for the underlying asset plus
whatever it earned, at any time.

**Guess question**

Before we look at the numbers: of your $10,000, how much do you think you can
take back out on the day after you deposit it?

*Slider "Available the next day", scale Nothing to All $10,000, beside the
button: "This one is not a trick."*

**Reveal · All of it. There is nothing holding your deposit in.**

*If the guess was right: "You had it." Otherwise: "You said {guess}."*

A deposit on its own carries no lock-up and no notice period. That changes only
when you borrow against it, which is lesson 3, and even then you choose how much
to tie up.

The yield and the borrowing are two separate decisions. Plenty of people use the
vault and never take a loan at all.

*Button: "See what it earns over time"*

### Stage 2 · Try

**What it grows to.**

Set a deposit and a rate. The real rate moves with the strategies the DAO is
running, so the number here is yours to pick and the live one will differ.

*Chart "Value of your deposit", tiles "Deposited", "After one year", "After 5
years", "Earned", sliders "Deposit" and "Suppose it earns {rate}% a year"*

**Reveal · One year of growth is the only number the checkpoint asks for.**

A deposit of {amount} earning {rate}% is worth {amount} after a year. That is
the deposit plus the rate applied to it, and nothing else.

Later years grow faster than the first, because what was earned starts earning
too. That is why the line bends upwards as it goes.

*Button: "Take the check"*

### Stage 3 · Check

*A number to work out, fresh figures per learner. Headline: "Work out what the
deposit is worth."*

**You deposit {amount} USDC. Suppose the vault earns {rate}% over the next year. What is your deposit worth at the end of it?**

*Slider "Worth after a year"*

**On passing · Lesson 2 complete.**

You know where a deposit goes, who decides what it does, and that you can take
it back whenever you want. Next: borrowing against it without giving it up.

### Wrap-up · "What you just worked out"

When you deposit, the vault wraps the asset into the Mix-Yield Token, usually
shortened to MYT, and the MYT does the earning.

Each MYT is a share of a pot spread across several yield strategies. The
Alchemix DAO chooses those strategies and adjusts the weights as conditions
change, so there is nothing for you to manage or monitor.

**How the earning reaches you**

There is no payout to claim. Each MYT you hold becomes worth more of the
underlying asset as the strategies earn, and what was earned starts earning too.
That is why growth speeds up the longer you leave it.

**Getting out**

There is no lock-up and no notice period. You can redeem your MYT for the
underlying asset plus whatever it earned, at any time.

That only changes once you borrow against the deposit, and even then you choose
how much to tie up. Depositing and borrowing are two separate decisions, and
plenty of people only ever make the first one.

*Go deeper in the docs: Mix-Yield Token (what your deposit becomes), Use
Passive MYT*

---

## Lesson 3 · Borrowing against your deposit

*How much you can borrow, what you receive, and what it costs to hold. About 6
minutes. What this lesson must accomplish: the learner guesses the borrowing
cap, then pushes a position up to it. The claim: borrow up to 90%, you receive
freshly minted alUSD, the deposit keeps earning, and the swap gap is the real
cost. They leave believing: I know what I get, what it costs, and that hitting
the cap is harmless.*

### Stage 1 · Learn

**How much can you borrow?**

Your $10,000 is deposited and earning. You want to use some of its value without
selling it, so you borrow against it.

**Guess question**

Alchemix will lend against your deposit. How much of the $10,000 do you think
you can borrow?

*Slider "Most you can borrow", scale Nothing to All $10,000, beside the button:
"Most lending protocols allow far less than this one."*

**Reveal · Up to $9,000, which is 90% of what you deposited.**

*If close: "That is close." Otherwise: "You said {guess}."*

The limit is called your loan to value, or LTV: what you owe, divided by what
you deposited. Alchemix lets that reach 90%.

Borrowing mints you alUSD: a token created on the spot, worth one USDC inside
the protocol. You can hold it, spend it, or swap it for something else. Lesson 7
covers where it comes from and how to turn it back.

*Button: "See what the cap does"*

### Stage 2 · Try

**Push it to the limit and see what stops you.**

Move the deposit and the amount borrowed. Watch the bar, and try taking the
borrow as high as it will go.

*Meter "Loan to value" with "Borrowing stops at 90%", tiles "Deposited",
"Borrowed", "Could still borrow", "Still earning", sliders "Deposit" and
"Borrow". At the cap the borrow slider reads "the cap stops you here".*

**Still earning**

Look at the last tile. Borrowing did not take anything out of the vault. All
{amount} is still deposited and still earning while the protocol pays this loan
down.

**At the cap**

Reaching 90% stops you borrowing more. It does not close the position, sell
anything, or charge you a penalty. You can sit there indefinitely.

*Nudge: "Move both controls, and take the borrow up to the cap."*

**Reveal · The cap is a limit on borrowing, and nothing more.**

The most you can borrow is always 90% of what you deposited. On {amount} that is
{amount}.

Whether you should borrow that much is a different question, and lesson 6 gets
to it. For now the number to keep is nine tenths of what you put in.

*Button: "Take the check"*

### Stage 3 · Check

*A number to work out, fresh figures per learner. Headline: "Find the most you
could borrow."*

**Your position holds {amount} of collateral and you have not borrowed anything yet. What is the most you can borrow against it?**

*Slider "Most you can borrow"*

**On passing · Lesson 3 complete.**

You know how much a deposit lets you borrow, what arrives when you do, and that
reaching the cap costs you nothing. Next: what happens to the balance once it is
open.

### Wrap-up · "What you just worked out"

You can borrow up to 90% of what your collateral is worth. That limit is your
loan to value, or LTV: the amount you owe divided by the amount you deposited.

Borrowing mints new alUSD or alETH to you: freshly created tokens Alchemix
issues that are each worth one unit of the underlying asset inside the protocol.
You can hold them, spend them, or swap them for something else. If you swap them
below face value, the gap is the real cost of the loan, and the advanced track
prices it. The position itself is recorded as an NFT, which appears in your
wallet once the transaction confirms.

**Reaching the cap**

Hitting 90% stops you borrowing more, and that is all it does. The position
stays open, nothing is sold, and your collateral keeps earning underneath. You
can sit at the cap for as long as you like.

**Your deposit stays yours**

Borrowing takes nothing out of the vault. The full amount you deposited is still
there and still earning while the protocol pays the loan down. Selling the asset
would have given all of that up.

Whether you should borrow the full 90% is a separate question, and how far you
sit below the cap decides how much room you have if anything goes wrong.

*Go deeper in the docs: Take a Loan, alAssets (what borrowing mints),
Self-Repaying Loans*

---

## Lesson 4 · The loan repays itself

*Watch a balance go down on its own, and see what would push it back up. About 7
minutes. What this lesson must accomplish: the learner guesses a balance after
two untouched years, then applies four events and watches which ones move it.
The claim: only your own choices move the balance, price and time do not. They
leave believing: I can leave it alone and trust the direction.*

### Stage 1 · Learn

**You borrow, then you do nothing.**

You borrowed $9,000 against your deposit. You make no payments, you do not
borrow again, and you leave the position completely alone for two years.

**Guess question**

After those two years, how much do you still owe?

*Slider "Still owed after two years", scale Nothing to More than you borrowed,
beside the button: "Nothing was repaid by hand, and no interest was charged."
The chart "What you owe, doing nothing" appears with the answer.*

**Reveal · Less than you borrowed, without you doing anything.**

*If close: "You were in the right area." Otherwise: "You said {guess}."*

Your deposit stayed in the vault the whole time, earning, while the protocol
brought the balance down. It happens whether you are watching or not.

The exact pace depends on conditions that move, so the shape of this line is the
lesson and the dates on it will differ. What holds in every case is the
direction. Left alone, the balance goes down.

*Button: "Find out what would change it"*

### Stage 2 · Try

**Which of these moves the line?**

Same loan as before. Apply any of these to the position and watch what the
balance does. Two of them change it. Two do not.

**Borrow another 2,000** · The only thing you can do that raises the balance.

**Repay 2,000 by hand** · Allowed at any time, in any amount.

**Collateral price drops 30%** · No effect. The debt is recorded in alUSD, so a
collateral price move never touches it.

**Wait six months** · No effect beyond the fall already happening. Nothing is
added for time passing.

*Also on this screen: a "Start over" link, "That is four changes. Start over if
you want to try the others.", and the nudge "Try at least three of them to
carry on."*

**Reveal · Only your own choices move it, and only one of them moves it up.**

Borrowing more raises the balance, because you asked for more. Repaying lowers
it, because you paid. Everything else leaves it alone and lets the decline carry
on.

Price moves · Your debt is recorded in alUSD or alETH, the same kind of asset
you deposited. When the price moves, both sides move together, so what you owe
relative to what you hold does not change.

Time · No interest is added for time passing. Time only ever brings the balance
down.

*Button: "Answer one question"*

### Stage 3 · Check

*One of these three questions, drawn at random. Headline: "One question before
you move on."*

**Starting from an open loan you leave alone, which of these makes the amount you owe go up?**

- ✓ Borrowing more against the same position
    - ↳ Right. Choosing to mint more alAssets is the only thing that raises what you owe.
- Time passing
    - ↳ Time alone lowers the balance. No interest accrues, so nothing is pushing it up.
- The price of your collateral falling
    - ↳ A price move does not change what you owe. Your debt is recorded in alUSD or alETH, not in dollars of collateral.
- Yield accruing in the vault
    - ↳ Yield works in your favour. It never raises what you owe.

**You want your loan cleared sooner than the protocol will clear it on its own. What can you do?**

- ✓ Repay some or all of it yourself, at any time
    - ↳ Right. Early repayment is always available, and it unlocks your collateral immediately.
- Nothing. The schedule is fixed once the loan is open
    - ↳ You are never locked in. You can repay part or all of the balance whenever you want.
- Borrow more, which speeds up the rate of repayment
    - ↳ Borrowing more raises what you owe. It does not clear the loan faster.
- Withdraw collateral, which forces an early repayment
    - ↳ Withdrawing collateral does not repay anything. It only moves collateral out, and only what is free to move.

**You open a loan and do not touch it for a year. Which description fits what happened to the balance?**

- ✓ It fell, and it never rose at any point along the way
    - ↳ Right. Left alone, the balance only moves in one direction.
- It rose steadily as interest was added
    - ↳ No interest is added to an Alchemix loan, so nothing pushed the balance up.
- It stayed flat, because nothing was repaid
    - ↳ It did not stay flat. The protocol was repaying it the whole time.
- It rose and fell as the market moved
    - ↳ The balance does not track the market. It is recorded in alUSD or alETH and only moves as it is repaid.

**On passing · Lesson 4 complete.**

You know what moves a loan balance and what leaves it alone. Next: how to get
your money back out, by two different routes.

### Wrap-up · "What you just worked out"

Left alone, an Alchemix loan balance only moves in one direction. Nothing is
added for time passing, because no interest accrues, and nothing is added when
markets move.

Two things change the balance, and both are your own choices:

Borrowing more · Minting further alAssets against the same position raises what
you owe.

Repaying · You can repay part or all of the balance at any time, in any amount,
which unlocks collateral immediately.

**What does not change it**

A fall in the price of your collateral has no effect on what you owe. Your debt
is recorded in alUSD or alETH, the same kind of asset you deposited, so a price
move changes both sides together and leaves the ratio between them alone.

Time passing has no effect beyond the decline already under way. There is no
interest, no fee for holding the loan open, and no schedule to keep.

The pace at which a balance clears depends on conditions that move, so the shape
is the lesson and any particular date will differ.

*Go deeper in the docs: Self-Repaying Loans, Redemption Rate (what sets the
pace), Repay a Loan*

---

## Lesson 5 · Getting your money back

*Two ways out, and why one of them gives you less than you expect. About 7
minutes. What this lesson must accomplish: the learner guesses the withdrawable
amount, then repays and watches collateral unlock. The claim: the 90% rule read
backwards, every unit repaid frees more than a unit. They leave believing: I can
get out, and the smaller number will not surprise me.*

### Stage 1 · Learn

**You want some of your deposit back.**

You deposited $10,000 and borrowed $5,000 against it. Now you want to take some
of the deposit out, and you are not repaying the loan first.

**Guess question**

How much of the $10,000 can you withdraw, with the $5,000 loan still open?

*Slider "Withdrawable now", scale Nothing to All $10,000, beside the button:
"Your borrowed alUSD stays borrowed either way."*

**Reveal · $4,444 is free to move.**

*If close: "That is close." Otherwise: "You said {guess}."*

Borrowing $5,000 did not set aside $5,000 of your deposit. It set aside however
much that loan needs behind it to stay within the 90% cap.

$5,000 of debt needs $5,556 of collateral standing behind it at the cap.
Everything above that, $4,444, is free to leave.

It is the same 90% rule from lesson 3, read backwards. When you borrowed, it set
the most you could take. Withdrawing, it sets the least you have to leave.

*Button: "See both ways out"*

### Stage 2 · Try

**Two ways out, and one unlocks the other.**

Repay part of the loan and watch how much of your deposit comes free. Take the
loan all the way to zero to see everything unlock.

*Meter "Your $10,000 deposit" with "{amount} free", then "{amount} held against
the loan" and "{amount} yours to move", tiles "Still owed", "LTV", "Can
withdraw", "Must leave", slider "Repay by hand". When the loan clears it reads
"loan cleared, everything is free".*

**Route one**

Withdraw what is already free and leave the loan running. Costs you nothing and
takes no waiting.

**Route two**

Repay some or all of the loan first. Every unit you repay releases more than a
unit of collateral, because the debt was only holding back what the cap
required.

**Repaying**

You can repay with alUSD, with MYT, or with the asset you deposited. One alUSD
clears exactly one unit of debt. If part of the loan shows as earmarked in the
app (set aside for the protocol's next repayment cycle), that part is repaid
with MYT, and the asset menu only offers what is valid.

*Nudge: "Move the repay control to carry on."*

**Reveal · What is free is whatever the cap does not need.**

Your {amount} of debt needs {amount} standing behind it, so {amount} of the
$10,000 is yours to move right now.

You never have to repay on a schedule to get at your money. The position tells
you what is free, and the app shows both numbers, so none of it has to be worked
out by hand. Knowing where it comes from keeps the smaller number from being a
shock.

*Button: "Take the check"*

### Stage 3 · Check

*A number to work out, fresh figures per learner. Headline: "Work out the
withdrawal."*

**A position holds {amount} of collateral against {amount} of debt. How much of that collateral can you withdraw right now, without repaying anything first?**

*Slider "Withdraw"*

**On passing · Lesson 5 complete.**

You can read a position: what is in it, what is owed, and what is free to move.
Next: what can and cannot force a position to close.

### Wrap-up · "What you just worked out"

There are two ways to get at a deposit you have borrowed against, and one of
them unlocks the other.

The first is to withdraw whatever is already free. Any collateral not needed to
keep the remaining debt under the 90% cap can leave at any time, at no cost.

The second is to repay first. Every unit you repay releases more than a unit of
collateral, because the debt was only ever holding back what the cap required.
Repay the balance in full and the whole deposit is free.

**Why the free amount is smaller than you expect**

A position with 10,000 deposited and 5,000 borrowed does not have 5,000
available to withdraw. The 5,000 of debt needs about 5,556 of collateral
standing behind it at the cap, which leaves roughly 4,444.

It is the same 90% rule you met when borrowing, read backwards. When you
borrowed, the rule set the most you could take. When you withdraw, it sets the
least you have to leave.

Both numbers are shown in the vault interface, so none of this has to be worked
out by hand. Knowing where the smaller one comes from keeps it from being a
surprise.

**Two details the app will show you**

Earmarked debt · The protocol repays loans in cycles, and while one is under way
part of your loan can show as earmarked, meaning set aside for the next
repayment. That part is repaid with MYT instead of alUSD, and the asset menu in
the repay tab only offers what is valid. Earmarked collateral keeps earning
right up until it settles.

Closing in one step · A self-liquidation, which only you can trigger, repays the
remaining loan from your collateral in one transaction, leaving the rest of the
deposit free to withdraw.

*Go deeper in the docs: Withdraw Funds, Repay a Loan*

---

## Lesson 6 · What can go wrong

*Why a price crash cannot close your position, and what can. About 7 minutes.
What this lesson must accomplish: the learner predicts the outcome of a 40%
crash for two borrowers, then drags a price control that does nothing and a
vault-loss control that does. The claim: price cannot liquidate, a loss inside
the vault can, and the cap and the threshold are different lines. They leave
believing: I know the one real risk and how to size against it.*

### Stage 1 · Learn

**A very bad day for the price.**

Ana and Ben both deposited $10,000 of ETH. Ana borrowed carefully. Ben borrowed
close to the cap. Overnight, the price of ETH falls by 40%.

*Setup cards: Ana, deposited $10,000, borrowed $4,500, LTV 45% · Ben, deposited
$10,000, borrowed $8,500, LTV 85%*

**What happens to the two positions?** *(a warm-up, not graded)*

- Both are liquidated
- Ben is liquidated, Ana is fine
- ✓ Neither is liquidated
- Both are partly sold to bring their ratios down

*Beside the button: "Guessing is free here. The graded question comes at the
end."*

**Reveal · Neither. The price fall changed nothing for either of them.**

*If they picked "neither": "You had it, and it is the answer people find hardest
to believe." Otherwise: "Almost everyone picks Ben, because that is how every
other lending protocol works."*

Ana and Ben deposited ETH and borrowed alETH. When the price of ETH falls, the
value of what they hold falls, and so does the value of what they owe. By the
same amount, at the same moment.

Their ratio is unchanged, so there is nothing to liquidate. It works the same
way for USDC and alUSD. The docs call this pairing like-kind.

*Button: "See why, and what does matter"*

### Stage 2 · Try

**One of these controls does nothing.**

Set a starting LTV, then try both. The bar shows where the position sits against
the 95% threshold that would close it.

*Meter "Loan to value now" with "Cap 90% · Liquidation 95%", sliders "Starting
LTV", "Price of your collateral" (after moving it: "no effect on the bar"), and
"Loss inside the vault" (past the line: "threshold crossed")*

**The price control**

Drag it as far as you like. The bar does not move, because your debt moved with
your collateral. That is how the real position behaves.

**The loss control**

This is a loss inside the strategies your deposit is invested in, from something
like an exploit or a strategy reporting a negative return. Your collateral is
worth less while your debt is unchanged, so the ratio climbs.

**If it does cross**

Only the minimum needed to bring the position back to a healthy LTV is
liquidated. The rest is untouched, and a fee vault covers any shortfall.

*Nudge: "Try both of the lower controls to carry on."*

**Reveal · One real risk, and most people arrive worried about a different one.**

Price volatility cannot force an Alchemix position to close. A loss in the
strategies holding your collateral can, and that is the risk worth reading about
before you choose how much to borrow.

The further you sit below the threshold, the larger a loss you can absorb.
Choose your LTV with that in mind. The advanced track works out exactly how much
room a given LTV buys you.

*Button: "Answer one question"*

### Stage 3 · Check

*One of these three questions, drawn at random. Headline: "One question before
you move on."*

**Which of these can put an Alchemix position at risk of liquidation?**

- ✓ A loss in the yield strategies holding your collateral
    - ↳ Right. A loss inside the vault is the one thing that moves the threshold towards you.
- A sharp fall in the price of ETH
    - ↳ A price fall moves your debt and your collateral together, so the ratio between them does not change.
- alUSD trading below 1.00 on an exchange
    - ↳ The protocol values alAssets at face value for repayment, whatever an exchange is charging for them.
- Reaching the 90% borrowing cap
    - ↳ Reaching the cap only stops further borrowing. The position stays open and keeps earning.

**Your position reaches the 90% borrowing cap. What happens next?**

- ✓ Borrowing stops. The position stays open and the collateral keeps earning
    - ↳ Right. The cap is a limit on minting, and nothing more than that.
- The position is closed and your collateral is sold
    - ↳ Nothing is closed or sold at the cap. You simply cannot mint more against the position.
- You are charged a fee until the ratio comes back down
    - ↳ No fee is charged for sitting at the cap. Borrowing just stops there.
- Part of your collateral is liquidated to bring the ratio down
    - ↳ Nothing is liquidated at the cap. Liquidation is a separate mechanism, and it needs a loss of backing.

**Why can a swing in the price of your collateral not liquidate an Alchemix loan?**

- ✓ Your debt and your collateral are the same kind of asset, so they move together
    - ↳ Right. ETH backs alETH and USDC backs alUSD, so a price move changes both sides by the same amount.
- The protocol pauses positions during volatile markets
    - ↳ Nothing pauses. The position is unaffected by the price move in the first place.
- Alchemix uses a fixed price for collateral instead of the market price
    - ↳ The price is not fixed or ignored. It simply applies to your debt and your collateral equally.
- An insurance fund absorbs price losses on behalf of borrowers
    - ↳ There is no insurance fund doing this. A price move does not create a loss to absorb.

**On passing · Lesson 6 complete.**

You know which risk applies here, and you can tell the borrowing cap apart from
the liquidation threshold. One lesson left.

### Wrap-up · "What you just worked out"

Price volatility cannot force an Alchemix position to close. Loans and
collateral are like-kind, with ETH backing alETH and USDC backing alUSD, so when
a price moves, what you hold and what you owe move together and the ratio
between them is unchanged.

Most borrowers arrive worried about price risk, and the like-kind pairing
removes it.

**What can trigger a liquidation**

A loss inside the Mix-Yield Token. If a strategy is exploited or reports a
negative return, the collateral behind every position is worth less while the
debt is unchanged, so ratios climb. A position that crosses the 95% liquidation
threshold is brought back into line.

Only the minimum needed to restore the position to a healthy LTV is liquidated.
The rest is untouched, and where collateral cannot cover the liquidator fee, a
separate fee vault covers the difference.

**The cap and the threshold are different things**

Reaching the 90% borrowing cap stops you borrowing more. Nothing is sold and no
fee is charged, and you can stay there indefinitely. The 95% threshold is a
separate line that only a loss of backing can bring you to.

The further below the threshold you sit, the larger a loss your position can
absorb. Choose your LTV with that in mind before you borrow.

This lesson covered the one risk that can close a position. The other kinds,
such as contract risk and the price of an alAsset while you hold it, are
catalogued on the risk considerations page linked below.

*Go deeper in the docs: Liquidations, Risk Considerations, Mix-Yield Token
(where a loss would come from)*

---

## Lesson 7 · The Transmuter

*Turn alAssets back into the real thing at 1:1, once you have waited. About 6
minutes. What this lesson must accomplish: the learner guesses the redemption
amount, then compares selling now against waiting for par. The claim: 1:1 after
a governance-set term, an early exit costs a fee, capacity is per chain, and the
guarantee is what holds the peg. They leave believing: I can close the loop, and
the two halves are one system.*

### Stage 1 · Learn

**Turning alUSD back into USDC.**

You hold $5,000 alUSD, either because you borrowed it or because you bought it.
Today the market will pay 0.97 USDC for each one, so selling the lot gets you
$4,850.

**The other route**

Hand your alUSD to the Transmuter instead. It exchanges alAssets for the real
asset at an exact 1:1 rate: one alUSD for one USDC, one alETH for one ETH. The
catch is that you wait a set period first.

*Flow diagram: 1 Deposit, alUSD goes in, "You hand your alAssets to the
Transmuter" · 2 Queue, the term runs, "Your deposit waits out the
governance-set term" · 3 Earmark, collateral is reserved, "Borrower collateral
equal to your claim is set aside to guarantee it" · 4 Maturity, one for one,
"You receive full value, whatever the market price is"*

**Guess question**

You put all $5,000 alUSD into the Transmuter and wait the full term. How much
USDC comes back?

*Slider "USDC received", scale Less than you put in to More than you put in,
beside the button: "The market price does not come into this one."*

**Reveal · Exactly $5,000. One for one.**

*If close: "You had it." Otherwise: "You said {guess}."*

The Transmuter does not care what alUSD is trading at. It exchanges at 1:1 with
no slippage, and waiting the full term costs you nothing.

That guarantee holds the price of alUSD near 1.00 in the first place. If it
drifts too far below, buying it and redeeming here becomes worth doing, and that
buying pushes the price back up.

*Button: "Compare the two routes"*

### Stage 2 · Try

**Sell now, or wait and get the full amount.**

You are holding $5,000 alUSD. Set what the market is paying, and how long the
current term is. The term is set by governance and changes, so check the live
figure in the app before you commit to anything.

*The two routes: "Sell on the market, {amount}, USDC today" against "Wait for
the Transmuter, $5,000, USDC in {n} weeks", sliders "Market price of alUSD" and
"Current term"*

Waiting is worth {amount} more than selling today, at a price of {price}.
Whether that is worth the wait is your call, and the answer changes with both
controls.

**Leaving early**

You are not locked in. You can exit a Transmuter deposit before it matures, but
an early transmutation fee applies and you give up part of the outcome.

**Why it fills over time**

Your claim is met from the collateral of people who borrowed. That is the same
flow that pays their loans down, which is why the two sides of Alchemix are
really one system.

**Capacity**

Each chain's Transmuter has a maximum it can hold. If one is full you may need
to use another chain, so check capacity before buying alAssets to redeem.

*Nudge: "Move both controls to carry on."*

**Reveal · The gap between the two numbers is the opportunity.**

Move the price up and the gap closes. The further alUSD drifts below 1.00, the
more people want to buy it and redeem it here, and that buying pushes it back
towards 1.00.

Turning that gap into a rate you can compare against anything else is the
advanced track's job. For now you have the guarantee, and you know what the two
conditions on it are.

*Button: "Take the last check"*

### Stage 3 · Check

*One of these three questions, drawn at random. Headline: "The last question in
the track."*

**You put 5,000 alUSD into the Transmuter and wait the full term. What do you get back?**

- ✓ 5,000 USDC worth, an exact 1:1 exchange
    - ↳ Right. The exchange is 1:1 and there is no slippage. That guarantee is what holds the peg together.
- 5,000 USDC worth, minus a redemption fee
    - ↳ Waiting the full term costs you nothing. A fee applies only if you leave before it is up.
- Whatever 5,000 alUSD is trading for on the day it matures
    - ↳ The market price is exactly what the Transmuter lets you ignore. It exchanges at 1:1 regardless.
- 5,000 USDC worth, plus the yield earned while you waited
    - ↳ Your alAssets do not earn while they wait. The return comes from buying below 1.00, not from yield on the queue.

**What decides how long you wait for a Transmuter deposit to mature?**

- ✓ A term set by governance, which varies by asset and chain
    - ↳ Right. It is a governance-set duration, adjusted over time, so check the current term in the app before you deposit.
- The size of your deposit, with larger deposits taking longer
    - ↳ Deposit size does not change the term. Everyone in the queue waits the same governance-set duration.
- How far below 1.00 the alAsset is currently trading
    - ↳ The market price does not set the term. Governance does.
- The order deposits arrive in, with no fixed length
    - ↳ Deposits do queue, but the wait has a set length. Your place in line does not decide it.

**You need your funds back before your Transmuter deposit has matured. What are your options?**

- ✓ Exit early and pay an early transmutation fee, giving up part of the outcome
    - ↳ Right. Leaving early is always possible, and the fee is the cost of not waiting.
- Nothing. The deposit is locked until it matures
    - ↳ You are not locked in. Early exit is available, it just costs you part of the fixed-rate outcome.
- Sell your place in the queue to another user
    - ↳ Queue positions are not traded between users. You exit your own deposit and pay the fee.
- Withdraw free of charge, as long as you do it in the first week
    - ↳ There is no free window. The early transmutation fee applies whenever you leave before maturity.

**On passing · Track complete.**

You have covered everything a first-time user needs: what Alchemix does, what
your deposit becomes, how borrowing works, why the balance falls, how to get
your money out, what can go wrong, and how alAssets turn back into the real
thing.

### Wrap-up · "What you just worked out"

The Transmuter exchanges alAssets for the real thing at a guaranteed 1:1 rate:
one alUSD for one USDC, one alETH for one ETH. There is no slippage (the amount
you exchange never moves the rate), and the market price of the alAsset makes no
difference to what you receive.

The condition is that you wait. Each deposit matures after a term set by
governance, which varies by asset and by chain and is adjusted over time. Always
check the current term in the app before you deposit.

**Where your redemption comes from**

Your claim is met from the collateral of people who have borrowed. That is the
same flow paying their loans down, which is why the borrowing side and the
redemption side of Alchemix are really one system.

The whole loop, in one picture (a styled diagram on the site):

- Borrow · alUSD is minted · A borrower mints it against a deposit that keeps earning.
- Sell · usually just under 1.00 · Sold for working capital, which opens the discount.
- Buy · the discount changes hands · A buyer takes the cheap alUSD to the Transmuter.
- Wait · collateral is earmarked · Borrower collateral is reserved for the claim, and keeps earning until it settles.
- Redeem · 1:1 at maturity · The buyer is paid in full, the borrower's debt falls, and the alUSD is burned.

The burn shrinks the supply, the price moves back towards 1.00, and the loop
starts again.

**Two things to know before using it**

Leaving early · You can exit before maturity, but an early transmutation fee
applies and you give up part of the fixed-rate outcome.

Capacity · Each chain’s Transmuter has a maximum it can hold. If one is full,
you may need to use another chain, so check capacity before buying alAssets to
redeem.

**Why alAssets trade below 1.00**

Borrowers often sell newly minted alAssets for working capital, which pushes the
market price slightly under par. A small discount is normal while borrowers are
selling. The 1:1 guarantee pulls the price back: the further it drifts, the more
worthwhile buying and redeeming becomes, and that buying closes the gap.

**Put it to use**

The quick start walks the same flow in the interface, with real numbers and
screenshots, and the tutorials cover each screen step by step. The app itself is
at alchemix.fi. When you want the arithmetic underneath what you just used, the
advanced track on the academy page picks it up.

*Go deeper in the docs: Transmuter, Redeem alAssets, How the Peg is Maintained*

---

## Shared interface copy

*Lines that appear in every lesson. One edit changes them everywhere.*

Stage names · Learn · Try · Check

Wrap-up heading · What you just worked out

Reading list label · Go deeper in the docs

While a question loads · Preparing your question...

If the grading server cannot be reached · "The checkpoint is not answering." ·
"Everything you worked out in this lesson still stands. Only the graded question
needs the server, so try again in a moment." · button "Try again"

Anti-sharing note on number questions · Every learner is given different
figures, so an answer shared with you will not fit your version of the question.

Anti-sharing note on multiple-choice questions · The options are ordered
differently for every learner, so an answer shared with you will not match your
version.

After a wrong number · Your answer was {x}. This question wanted {y}, accepted
within {z}. The next question uses fresh figures, so the number above will not
fit it. · button "Try a new question"

Buttons · Check my answer · Submit answer · Checking... · Back to the track

Before an option is picked · Pick an option to answer.
