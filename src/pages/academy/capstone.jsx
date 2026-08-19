import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/CapstoneLab";
import Wrap from "@site/src/components/Academy/lessons/capstone.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="capstone"
      description="Size one position against a discount you cannot control and a loss you cannot predict."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/quick-start", label: "Quick Start", note: "the same steps in the interface" },
        { to: "/user/safety/risk-considerations", label: "Risk Considerations" },
        { to: "/user/faq", label: "FAQ" },
      ]}
    />
  );
}
