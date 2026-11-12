import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i3ReadingYourPosition.mdx";

/* Intermediate lesson 3 (script I3) starts with 10,000 deposited, 5,000 borrowed and 2,000 USDC in the wallet,
   with Earmarked shown at 0 so the reader sees no debt is earmarked. */
const START = { wallet: 2_000, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: 0, fixedYield: null };
const MOMENTS = ["hf-slider", "preview", "borrow", "currency", "repay-alusd", "repay-usdc"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="getting-money-back"
      description="Read Health Factor as the room your position has before 90%, preview an action before you send it, see your position in dollars, and learn exactly what still works once your LTV passes 90%."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 3 complete."
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations" },
        { to: "/user/tutorials/withdraw", label: "Tutorial: Withdraw" },
        { to: "/user/tutorials/repay-loan", label: "Tutorial: Repay your loan" },
      ]}
    />
  );
}
