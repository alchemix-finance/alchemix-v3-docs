import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i10YieldLooping.mdx";

/* Advanced lesson 4 (the Yield Looping pages of script I9, a lesson of their own since 2026-11-09) starts with
   10,000 USDC in the wallet and nothing in a vault. */
const START = { wallet: 10_000, walletAl: 0, deposit: 0, debt: 0, earmarked: null, fixedYield: null };
const MOMENTS = ["loop-set", "loop-go", "loop-loss"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="yield-looping"
      description="Yield Looping puts borrowed money back into the vault so a larger deposit earns. Loop a deposit, work out what the loop costs and earns, and learn what a loss in the vault takes from it."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 4 complete."
      deeper={[
        { to: "/user/tutorials/borrowing-in-alchemix", label: "Tutorial: Take a loan" },
        { to: "/user/concepts/alAssets", label: "alAssets" },
        { to: "/user/safety/risk-considerations", label: "Risk considerations" },
      ]}
    />
  );
}
