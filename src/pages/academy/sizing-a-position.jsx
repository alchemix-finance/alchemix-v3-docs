import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i9SizingALoan.mdx";

/* Intermediate lesson 6 (script I8's LTV planner page and script I9's sizing page, joined 2026-11-09) starts
   with 10,000 USDC in the wallet and nothing in a vault. Both pages are planners that leave the strip as it is. */
const START = { wallet: 10_000, walletAl: 0, deposit: 0, debt: 0, earmarked: null, fixedYield: null };
const MOMENTS = ["plan", "size"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="capstone"
      description="Choose an LTV from the loss you plan for, then work back from the cash you need and that LTV to the deposit the loan takes."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 6 complete."
      deeper={[
        { to: "/user/tutorials/borrowing-in-alchemix", label: "Tutorial: Take a loan" },
        { to: "/user/concepts/liquidations", label: "Liquidations" },
        { to: "/user/safety/risk-considerations", label: "Risk considerations" },
      ]}
    />
  );
}
