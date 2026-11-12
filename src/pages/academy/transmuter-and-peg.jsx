import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i7PegAndFixedYield.mdx";

/* Advanced lesson 3 (script I7) starts with 5,000 alUSD in the wallet and no vault position, so Deposit
   and Debt are left off the strip (null), and the strip has a Fixed Yield field. */
const START = { wallet: 0, walletAl: 5_000, deposit: null, debt: null, earmarked: null, fixedYield: 0 };
const MOMENTS = ["cycle", "price", "deposit", "cap", "claim"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="transmuter-and-peg"
      description="Why alUSD trades under a dollar and what pulls it back, how the price and the term set a Fixed Yield return, how much a card can take, and what a claim pays."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 3 complete."
      deeper={[
        { to: "/user/concepts/how-peg-is-maintained", label: "How the peg is maintained" },
        { to: "/user/concepts/transmuter", label: "Transmuter" },
        { to: "/user/tutorials/redeem-alassets", label: "Tutorial: Fixed Yield" },
      ]}
    />
  );
}
