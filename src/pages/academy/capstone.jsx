import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/CapstoneLab";
import Wrap from "@site/src/components/Academy/lessons/capstone.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="capstone"
      description="The price you can sell at decides what you borrow, and the loss you have to survive decides what must stand behind it. One deposit has to satisfy both."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/quick-start", label: "Quick Start", note: "how the same steps look in the app" },
        { to: "/user/safety/risk-considerations", label: "Risk Considerations" },
        { to: "/user/faq", label: "FAQ" },
      ]}
    />
  );
}
