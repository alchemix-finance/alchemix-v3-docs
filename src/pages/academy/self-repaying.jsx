import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/RepayLab";
import Wrap from "@site/src/components/Academy/lessons/selfRepaying.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="self-repaying"
      description="Left alone for two years, an Alchemix loan only falls. Repaying and borrowing more are the two levers you hold."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
        { to: "/user/tutorials/repay-loan", label: "Tutorial: Repay your loan" },
        { to: "/user/tutorials/withdraw", label: "Tutorial: Withdraw" },
      ]}
    />
  );
}
