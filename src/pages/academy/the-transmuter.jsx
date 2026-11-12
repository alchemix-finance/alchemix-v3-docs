import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/fixedYield.mdx";

/* Lesson 8 starts with no vault position and the 4,900 USDC the swap gave,
   and gives the strip a Fixed Yield field. */
const START = { wallet: 4_850, walletAl: 0, deposit: 0, debt: 0, earmarked: null, fixedYield: 0 };
const MOMENTS = ["buy", "claim", "loop", "claim-early"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="the-transmuter"
      description="On Fixed Yield you deposit alUSD for a set term and receive one USDC for each alUSD at the end, taking the other side of a borrower's loan."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 8 complete."
      deeper={[
        { to: "/user/concepts/transmuter", label: "Transmuter" },
        { to: "/user/tutorials/redeem-alassets", label: "Tutorial: Fixed Yield" },
        { to: "/user/quick-start", label: "Quick start" },
      ]}
    />
  );
}
