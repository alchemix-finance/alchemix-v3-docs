import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/TransmuterLab";
import Wrap from "@site/src/components/Academy/lessons/theTransmuter.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="the-transmuter"
      description="Turn alAssets back into the underlying asset at an exact 1:1 rate, once you have waited out the term."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/transmuter", label: "Transmuter" },
        { to: "/user/tutorials/redeem-alassets", label: "Redeem alAssets" },
        { to: "/user/concepts/how-peg-is-maintained", label: "How the Peg is Maintained" },
      ]}
    />
  );
}
