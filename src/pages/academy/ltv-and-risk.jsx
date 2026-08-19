import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/RiskLab";
import Wrap from "@site/src/components/Academy/lessons/ltvAndRisk.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="ltv-and-risk"
      description="Find out why a price crash cannot liquidate an Alchemix position, and what actually can."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations", note: "the two thresholds and what triggers them" },
        { to: "/user/safety/risk-considerations", label: "Risk Considerations" },
        { to: "/governance/guides/myt-strategies", label: "MYT Strategies", note: "the caps that bound a plausible loss" },
      ]}
    />
  );
}
