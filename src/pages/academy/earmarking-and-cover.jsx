import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i4EarmarkingAndCover.mdx";

/* Advanced lesson 1 (script I4) starts with 10,000 deposited, 5,000 borrowed and nothing earmarked yet. */
const START = { wallet: 0, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: 0, fixedYield: null };
const MOMENTS = ["vest", "month-1", "b-repays", "month-2", "claim"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="earmarking-and-cover"
      description="Follow one Fixed Yield deposit as it vests and earmarks borrowers' debt block by block, learn how cover pauses earmarking, and what the claim does to your position."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 1 complete."
      deeper={[
        { to: "/user/concepts/redemption-rate", label: "Redemption Rate" },
        { to: "/user/concepts/transmuter", label: "Transmuter" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
      ]}
    />
  );
}
