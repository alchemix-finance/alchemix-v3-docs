import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/whatCanLiquidate.mdx";

/* Lesson 7 starts on the position from lesson 3 again: 10,000 deposited,
   5,000 owed, and the wallet as lesson 6 starts it. The page's what-ifs act
   on the practice vault and leave this position alone. */
const START = { wallet: 5_350, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: null, fixedYield: null };
const MOMENTS = ["drop", "loss", "liquidation"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="what-can-go-wrong"
      description="A liquidation can settle part of your loan once your LTV reaches 95%, and only a loss inside the vault can push it there."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 7 complete."
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations" },
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
      ]}
    />
  );
}
