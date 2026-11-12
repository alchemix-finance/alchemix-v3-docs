import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/borrowAgainstIt.mdx";

/* Lesson 3 opens where lesson 2 ended: 10,000 in the vault and 500 in the
   wallet, nothing owed. */
const START = { wallet: 500, walletAl: 0, deposit: 10_000, debt: 0, earmarked: null, fixedYield: null };
const MOMENTS = ["max-borrow", "borrow"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="borrowing"
      description="You borrow 5,000 alUSD against your deposit, which stays in the vault and keeps earning."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 3 complete."
      deeper={[
        { to: "/user/concepts/alAssets", label: "alAssets" },
        { to: "/user/tutorials/borrowing-in-alchemix", label: "Tutorial: Take a loan" },
      ]}
    />
  );
}
