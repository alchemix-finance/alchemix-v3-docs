import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/whatAlchemixDoes.mdx";

/* Lesson 1 opens with no position on the page: the strip comes in at the
   paragraph that hands the reader 10,000 USDC. */
const START = { wallet: 10_000, deposit: 0, debt: 0 };

/* Page 1's two Continue presses (the parts of a reading page), then the
   lesson's one step: opening each page in the tour of the app's pages. */
const MOMENTS = ["read-wallet", "tour"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="what-you-can-do-here"
      description="Alchemix lets you borrow against a deposit that keeps earning, and the loan is paid down for you out of your deposit over time."
      Content={Content}
      start={START}
      hidden
      moments={MOMENTS}
      passTitle="Lesson 1 complete."
      deeper={[
        { to: "/user", label: "Introduction" },
        { to: "/user/quick-start", label: "Quick start" },
      ]}
    />
  );
}
