import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/spendAlusd.mdx";

/* Lesson 4 opens with the loan from lesson 3: 500 USDC and 5,000 alUSD in
   the wallet, 10,000 deposited, 5,000 owed. */
const START = { wallet: 500, walletAl: 5_000, deposit: 10_000, debt: 5_000, earmarked: null, fixedYield: null };
const MOMENTS = ["swap"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="spend-the-alusd"
      description="Most borrowers swap their alUSD for USDC to spend, and the discount on that swap is the first cost of a loan."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 4 complete."
      deeper={[
        { to: "/user/concepts/alAssets", label: "alAssets" },
        { to: "/user/concepts/fees", label: "Fees" },
      ]}
    />
  );
}
