import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/TransmuterLab";
import Wrap from "@site/src/components/Academy/lessons/theTransmuter.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="the-transmuter"
      description="Swap alUSD for USDC at exactly 1:1 after a wait."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/transmuter", label: "The Transmuter" },
        { to: "/user/concepts/how-peg-is-maintained", label: "How the peg works" },
        { to: "/user/tutorials/redeem-alassets", label: "Tutorial: Fixed Yield" },
      ]}
    />
  );
}
