import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i6LoanCost.mdx";

/* Intermediate lesson 4 (script I6) starts with 10,000 deposited and nothing borrowed yet. */
const START = { wallet: 0, walletAl: 0, deposit: 10_000, debt: 0, earmarked: 0, fixedYield: null };
const MOMENTS = ["pick-usdc", "borrow-swap", "fee-ways", "buyback", "flash-open", "flash-confirm"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="cost-of-borrowing"
      description="How Borrow & Swap borrows and sells in one step, what each cost of a loan is charged on, and how repaying with alUSD bought below a dollar, by hand or with Flash Repay, recovers the discount."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 4 complete."
      deeper={[
        { to: "/user/concepts/fees", label: "Fees" },
        { to: "/user/concepts/alAssets", label: "alAssets" },
        { to: "/user/tutorials/repay-loan", label: "Tutorial: Repay your loan" },
      ]}
    />
  );
}
