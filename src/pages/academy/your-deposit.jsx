import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/depositAndEarn.mdx";

/* Lesson 2 starts with the 10,000 USDC lesson 1 handed the reader. */
const START = { wallet: 10_000, deposit: 0, debt: 0 };
const MOMENTS = ["deposit", "year", "withdraw"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="your-deposit"
      description="Your deposit gives you MYT, the Mix-Yield Token, which rises in value as the vault's strategies earn."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 2 complete."
      deeper={[
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/user/tutorials/use-passive-myt", label: "Tutorial: Mixed Yield" },
        { to: "/user/tutorials/withdraw", label: "Tutorial: Withdraw" },
      ]}
    />
  );
}
