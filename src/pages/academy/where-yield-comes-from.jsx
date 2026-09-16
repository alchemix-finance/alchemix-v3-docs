import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import MixLab from "@site/src/components/Academy/MixLab";
import Wrap from "@site/src/components/Academy/lessons/whereYieldComesFrom.mdx";

export default function WhereYieldComesFromLesson() {
  return (
    <LessonPage
      lessonId="where-yield-comes-from"
      description="Your collateral earns in a basket of strategies the DAO curates. The DAO caps how much of it can sit in the riskier ones, and those caps are what make a high LTV safe."
      Lab={MixLab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/governance/guides/myt-strategies", label: "MYT Launch Strategies", note: "where the classification rules and the caps are set" },
        { to: "/user/concepts/liquidations", label: "Liquidations", note: "what a vault loss does to a position" },
        { to: "/user/tutorials/use-passive-myt", label: "Mixed Yield", note: "the deposit tutorial" },
      ]}
    />
  );
}
