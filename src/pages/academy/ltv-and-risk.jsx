import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/RiskLab";
import Wrap from "@site/src/components/Academy/lessons/ltvAndRisk.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="ltv-and-risk"
      description="Price cannot force you out of an Alchemix position. A loss inside the Mix-Yield Token can, and every loss has a highest starting LTV that survives it."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations", note: "what happens at each threshold" },
        { to: "/user/safety/risk-considerations", label: "Risk Considerations" },
        { to: "/governance/guides/myt-strategies", label: "MYT Strategies", note: "the caps that bound a plausible loss" },
      ]}
    />
  );
}
