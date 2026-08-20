import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import MixLab from "@site/src/components/Academy/MixLab";
import Wrap from "@site/src/components/Academy/lessons/whereYieldComesFrom.mdx";

export default function WhereYieldComesFromLesson() {
  return (
    <LessonPage
      lessonId="where-yield-comes-from"
      description="See where your collateral works while a loan runs, and the ceilings the DAO puts on how much risk the vault may hold."
      Lab={MixLab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/governance/guides/myt-strategies", label: "MYT Strategies", note: "the classification rules and the cap table" },
        { to: "/user/concepts/liquidations", label: "Liquidations", note: "what a vault loss does to a position" },
        { to: "/user/tutorials/use-passive-myt", label: "Earn Passive Yield with Mixed Yield" },
      ]}
    />
  );
}
