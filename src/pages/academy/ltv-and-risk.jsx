import React from "react";
import ArticleLesson from "@site/src/components/Academy/ArticleLesson";
import Content from "@site/src/components/Academy/lessons/intermediate/i8ChoosingAnLtv.mdx";

/* Intermediate lesson 5 (script I8, less its LTV planner page, which moved to the track's last lesson on
   2026-11-09, and with its full-liquidation page) starts with
   10,000 deposited, 5,000 borrowed and 208 of it earmarked. */
const START = { wallet: 0, walletAl: 0, deposit: 10_000, debt: 5_000, earmarked: 208, fixedYield: null };
const MOMENTS = ["loss", "liq", "full", "self-open", "self-confirm", "bad-debt"];

export default function Lesson() {
  return (
    <ArticleLesson
      lessonId="ltv-and-risk"
      description="Work out what a loss inside the vault does to your LTV, follow a liquidation step by step, close a loan yourself, and learn what happens to loans and Fixed Yield claims if losses outrun liquidations."
      Content={Content}
      start={START}
      moments={MOMENTS}
      passTitle="Lesson 5 complete."
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations" },
        { to: "/user/safety/risk-considerations", label: "Risk considerations" },
        { to: "/user/concepts/fees", label: "Fees" },
      ]}
    />
  );
}
