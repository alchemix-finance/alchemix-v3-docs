import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/repayWithdraw.mdx";

/* Lesson 6 starts on the position from lesson 3, before any redemption:
   10,000 deposited, 5,000 owed with 208 of it earmarked, and 5,350 USDC in
   the wallet (the 500 from lesson 2 and the 4,850 from the swap). */
const START = { wallet: 5_350, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: 208, fixedYield: null };
const MOMENTS = ["repay-part", "repay-rest", "withdraw-all"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="repay-and-withdraw"
      description="You can repay your loan yourself, any day, in part or in full, and withdraw your deposit."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 6 complete."
      deeper={[
        { to: "/user/tutorials/repay-loan", label: "Tutorial: Repay your loan" },
        { to: "/user/tutorials/withdraw", label: "Tutorial: Withdraw" },
      ]}
    />
  );
}
