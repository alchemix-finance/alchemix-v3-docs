import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i5RedemptionRate.mdx";

/* Advanced lesson 2 (script I5) starts with 10,000 deposited and 5,000 borrowed, and every figure in it
   is a what-if or a projection that leaves the strip as it is. */
const START = { wallet: 0, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: 0, fixedYield: null };
const MOMENTS = ["queue", "term", "debt", "rate-100", "cover", "rate-typed"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="pace-of-repayment"
      description="Work out the Redemption Rate from the Fixed Yield queue, its term and what borrowers owe, learn when a rate holds, read a 0% rate while cover lasts, and project your own loan in the Visualizer."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 2 complete."
      deeper={[
        { to: "/user/concepts/redemption-rate", label: "Redemption Rate" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
        { to: "/user/tutorials/redeem-alassets", label: "Tutorial: Fixed Yield" },
      ]}
    />
  );
}
