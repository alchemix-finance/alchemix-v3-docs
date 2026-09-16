/**
 * The beginner track's multiple-choice banks, mirrored for local development.
 *
 * The season engine is authoritative. `src/lib/academy/beginner.ts` there holds
 * the same questions, and its grader is what decides a real completion. This copy
 * exists so a lesson page still works when the engine is not running, which is
 * the difference between someone being able to edit Academy prose and not.
 *
 * If the two ever disagree, the engine wins and this file is the one to fix. A
 * mismatch shows up locally as a lesson whose options read differently from the
 * deployed site, and it cannot affect a graded completion either way: everything
 * this file feeds is issued as an inert `local:` token.
 */

export const QUESTIONS = {
  "what-alchemix-does": [
    {
      prompt:
        "You borrow against a deposit in Alchemix and then leave it alone. What happens to the amount you owe?",
      options: [
        "It goes down over time, without you doing anything",
        "It goes up, because interest is added to the balance",
        "It stays exactly the same until you repay it",
        "It moves up and down with the market price of your collateral",
      ],
      correct: 0,
      explain: [
        "Right. Redemptions repay it out of your own collateral, so the balance falls while you do nothing.",
        "Alchemix charges no interest. The only direction that balance moves on its own is down.",
        "The balance does not sit still. Redemptions repay it from your collateral the whole time the loan is open.",
        "The amount you owe is recorded in alUSD or alETH and does not follow the market price of your collateral.",
      ],
    },
    {
      prompt: "What are you charged for an Alchemix loan?",
      options: [
        "No interest. The protocol pays the loan down for you over time",
        "A variable rate that rises when more people are borrowing",
        "A fixed annual rate, agreed at the moment you borrow",
        "A daily fee for every day the loan stays open",
      ],
      correct: 0,
      explain: [
        "Right. An Alchemix loan has no interest rate at all.",
        "There is no variable rate here, or any rate at all. Redemptions pay the loan down instead of a lender charging you.",
        "There is no fixed rate either. An Alchemix loan carries no rate of any kind.",
        "Nothing is charged per day. Hold the loan for a decade and redemptions still only push the balance down.",
      ],
    },
    {
      prompt: "What happens to your deposit while a loan is open against it?",
      options: [
        "It stays in the vault and keeps earning the whole time",
        "It is locked and stops earning until the loan is repaid",
        "It is sold, and the proceeds are handed to you as the loan",
        "It is lent out to other users and returned when you repay",
      ],
      correct: 0,
      explain: [
        "Exactly. Your deposit stays in the vault and keeps earning the whole time it backs the loan.",
        "It keeps earning the whole time. An open loan gives your deposit a job as collateral, and it carries on earning in that job.",
        "Nothing is sold. You keep your deposit, and it keeps earning while the loan is open.",
        "Your deposit is not lent to anyone. It stays yours and keeps earning in the vault.",
      ],
    },
  ],

  "self-repaying": [
    {
      prompt:
        "Starting from an open loan you leave alone, which of these makes the amount you owe go up?",
      options: [
        "Borrowing more against the same position",
        "Time passing",
        "The price of your collateral falling",
        "Yield accruing in the vault",
      ],
      correct: 0,
      explain: [
        "Right. Borrowing more is the only thing that raises what you owe.",
        "Time alone lowers the balance, because redemptions keep clearing a little more of it for you.",
        "A price move does not change what you owe. Your debt is recorded in alUSD or alETH, and that number does not follow the price of your collateral.",
        "Yield works in your favor. It never raises what you owe.",
      ],
    },
    {
      prompt:
        "You want your loan cleared sooner than the protocol will clear it on its own. What can you do?",
      options: [
        "Repay some or all of it yourself, at any time",
        "Nothing. The schedule is fixed once the loan is open",
        "Borrow more, which speeds up the rate of repayment",
        "Withdraw collateral, which forces an early repayment",
      ],
      correct: 0,
      explain: [
        "Yes. You can repay any amount whenever you want, and the collateral it was holding frees up immediately.",
        "You are never locked in. You can repay part or all of the balance whenever you want.",
        "Borrowing more raises what you owe. It does not clear the loan faster.",
        "Withdrawing moves collateral out of the position, and only the part that is already free. Your balance stays exactly where it was.",
      ],
    },
    {
      prompt:
        "You open a loan and do not touch it for a year. Which description fits what happened to the balance?",
      options: [
        "It fell, and it never rose at any point along the way",
        "It rose steadily as interest was added",
        "It stayed flat, because nothing was repaid",
        "It rose and fell as the market moved",
      ],
      correct: 0,
      explain: [
        "Exactly. Left alone, the balance only moves down.",
        "An Alchemix loan carries no interest, so the only direction it travelled was down.",
        "It did not stay flat. The protocol was repaying it the whole time.",
        "The balance does not track the market. It is recorded in alUSD or alETH and only moves as it is repaid.",
      ],
    },
  ],

  "what-can-go-wrong": [
    {
      prompt: "Which of these can put an Alchemix position at risk of liquidation?",
      options: [
        "A loss in the yield strategies holding your collateral",
        "A sharp fall in the price of ETH",
        "alUSD trading below 1.00 on an exchange",
        "Reaching the 90% borrowing cap",
      ],
      correct: 0,
      explain: [
        "Right. A real loss in the strategies behind your collateral is the one thing that can move you toward liquidation.",
        "A price fall moves your debt and your collateral together, so the ratio between them holds.",
        "The protocol values alAssets at face value for repayment, whatever an exchange is charging for them.",
        "Reaching the cap only stops further borrowing. The position stays open and keeps earning.",
      ],
    },
    {
      prompt: "Your position reaches the 90% borrowing cap. What happens next?",
      options: [
        "Borrowing stops. The position stays open and the collateral keeps earning",
        "The position is closed and your collateral is sold",
        "You are charged a fee until the ratio comes back down",
        "Part of your collateral is liquidated to bring the ratio down",
      ],
      correct: 0,
      explain: [
        "Yes. The cap limits borrowing and does nothing else.",
        "Nothing is closed or sold at the cap. It stops you borrowing more, and the position carries on earning.",
        "Sitting at the cap is free. Borrowing stops there and the position keeps earning.",
        "Nothing is liquidated at the cap. Liquidation is a separate mechanism, and it needs a loss of backing.",
      ],
    },
    {
      prompt: "Why can a swing in the price of your collateral not liquidate an Alchemix loan?",
      options: [
        "Your debt and your collateral are the same kind of asset, so they move together",
        "The protocol pauses positions during volatile markets",
        "Alchemix uses a fixed price for collateral instead of the market price",
        "An insurance fund absorbs price losses on behalf of borrowers",
      ],
      correct: 0,
      explain: [
        "Exactly. ETH backs alETH and USDC backs alUSD, so a price move changes both sides by the same amount and the ratio holds.",
        "Nothing is paused. The price move leaves the position exactly where it was.",
        "The price is not fixed or ignored. It applies to your debt and your collateral equally.",
        "There is no insurance fund doing this. A price move leaves both sides of your position in the same ratio, so there is no loss to absorb.",
      ],
    },
  ],

  "the-transmuter": [
    {
      prompt: "You put 5,000 alUSD into the Transmuter and wait the full term. What do you get back?",
      options: [
        "5,000 USDC worth, an exact 1:1 exchange",
        "5,000 USDC worth, minus an exchange fee",
        "Whatever 5,000 alUSD is trading for on the day it matures",
        "5,000 USDC worth, plus the yield earned while you waited",
      ],
      correct: 0,
      explain: [
        "Right. The exchange is exactly 1:1, and that guarantee is what holds the peg.",
        "Wait the full term and you keep the whole 1:1. A fee applies only if you leave before it is up.",
        "The market price does not apply. The Transmuter exchanges at 1:1 regardless of what an exchange is charging.",
        "Your alAssets do not earn while they wait. The return comes from buying below 1.00 and receiving 1.00 at maturity.",
      ],
    },
    {
      prompt: "What decides how long you wait for a Transmuter deposit to mature?",
      options: [
        "A term set by the Alchemix DAO, which varies by asset and chain",
        "The size of your deposit, with larger deposits taking longer",
        "How far below 1.00 the alAsset is currently trading",
        "The order deposits arrive in, with no fixed length",
      ],
      correct: 0,
      explain: [
        "Yes. The Alchemix DAO sets the term and adjusts it over time, so check the current one in the app before you deposit.",
        "Deposit size does not change the term. Everyone in the queue waits the same set duration.",
        "The market price does not set the term. The Alchemix DAO does.",
        "Deposits do queue, but the wait has a set length. Your place in line does not decide it.",
      ],
    },
    {
      prompt:
        "You need your funds back before your Transmuter deposit has matured. What are your options?",
      options: [
        "Exit early and pay an early transmutation fee, giving up part of the outcome",
        "Nothing. The deposit is locked until it matures",
        "Sell your place in the queue to another user",
        "Withdraw free of charge, as long as you do it in the first week",
      ],
      correct: 0,
      explain: [
        "Right. You can leave early whenever you need to, and the fee is what not waiting costs you.",
        "You are never locked in. Exit early whenever you need to, and the fee is what not waiting costs you.",
        "Queue positions are not traded between users. You exit your own deposit and pay the fee.",
        "There is no free window. The early transmutation fee applies whenever you leave before maturity.",
      ],
    },
  ],
};

/**
 * The same deterministic shuffle the engine uses, so a locally generated question
 * behaves the way the deployed one does.
 *
 * Returns display position to original index.
 */
export function permutation(n, seed) {
  const order = Array.from({ length: n }, (_, i) => i);

  let state = (Math.abs(Math.trunc(seed)) % 2147483647) + 1;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
