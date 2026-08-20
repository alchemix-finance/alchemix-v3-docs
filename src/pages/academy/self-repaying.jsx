import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/RepayLab";
import Wrap from "@site/src/components/Academy/lessons/selfRepaying.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="self-repaying"
      description="Watch a loan balance fall on its own, and find out which of four events moves it."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/self-repaying-loans", label: "Self-Repaying Loans" },
        { to: "/user/concepts/redemption-rate", label: "Redemption Rate", note: "what sets the pace" },
        { to: "/user/tutorials/repay-loan", label: "Repay a Loan" },
      ]}
    />
  );
}
