import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i2InsideMyt.mdx";

/* Intermediate lesson 2 (script I2) starts with 10,000 deposited and 5,000 borrowed, and every figure in it
   is a what-if that leaves the strip as it is. */
const START = { wallet: 0, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: null, fixedYield: null };
const MOMENTS = ["before-fee", "delay", "new", "price-drop", "loss-half", "loss-all", "allocate", "withdraw"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="where-yield-comes-from"
      description="Learn who runs a vault's strategies, what the performance fee takes, how a strategy's Risk Level and price source are set, and how a loss or the risk caps reach your deposit."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 2 complete."
      deeper={[
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/user/concepts/fees", label: "Fees" },
        { to: "/governance/guides/myt-strategies", label: "MYT strategies" },
      ]}
    />
  );
}
