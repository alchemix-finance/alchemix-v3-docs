import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/loanPaysItselfOff.mdx";

/* Lesson 5 opens after the swap: the 500 from lesson 2 and the 4,900 from
   lesson 4 in the wallet, 10,000 deposited, 5,000 owed. The strip gains its
   Earmarked field as page 2 opens. */
const START = { wallet: 5_350, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: null, fixedYield: null };
const MOMENTS = ["redeem", "year"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="self-repaying"
      description="After you borrow, the loan gets paid off automatically through Alchemix v3's redemption system."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 5 complete."
      deeper={[
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
        { to: "/user/concepts/redemption-rate", label: "Redemption Rate" },
      ]}
    />
  );
}
