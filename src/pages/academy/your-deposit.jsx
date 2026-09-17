import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/DepositLab";
import Wrap from "@site/src/components/Academy/lessons/yourDeposit.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="your-deposit"
      description="Your deposit becomes MYT and earns in strategies the Alchemix DAO selects. Take it back on any day you like."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token" },
        { to: "/user/tutorials/use-passive-myt", label: "Tutorial: Mixed Yield" },
        { to: "/user/tutorials/withdraw", label: "Tutorial: Withdraw" },
      ]}
    />
  );
}
