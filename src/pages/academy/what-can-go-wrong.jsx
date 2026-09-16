import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/SafetyLab";
import Wrap from "@site/src/components/Academy/lessons/whatCanGoWrong.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="what-can-go-wrong"
      description="A price crash cannot liquidate an Alchemix position. A real loss inside the vault is the one thing that can."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/liquidations", label: "Liquidations" },
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/user/safety/risk-considerations", label: "Risk considerations" },
      ]}
    />
  );
}
