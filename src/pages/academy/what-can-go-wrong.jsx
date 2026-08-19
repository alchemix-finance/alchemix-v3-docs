import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/SafetyLab";
import Wrap from "@site/src/components/Academy/lessons/whatCanGoWrong.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="what-can-go-wrong"
      description="Why a price crash cannot liquidate an Alchemix position, and what can."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations" },
        { to: "/user/safety/risk-considerations", label: "Risk Considerations" },
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token", note: "where a loss would come from" },
      ]}
    />
  );
}
