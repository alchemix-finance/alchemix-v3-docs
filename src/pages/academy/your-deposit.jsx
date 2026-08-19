import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/DepositLab";
import Wrap from "@site/src/components/Academy/lessons/yourDeposit.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="your-deposit"
      description="What your deposit turns into, who decides where it earns, and how quickly you can take it back."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token", note: "what your deposit becomes" },
        { to: "/user/tutorials/use-passive-myt", label: "Use Passive MYT" },
      ]}
    />
  );
}
