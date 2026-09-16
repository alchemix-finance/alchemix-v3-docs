import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/WhatLab";
import Wrap from "@site/src/components/Academy/lessons/whatAlchemixDoes.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="what-alchemix-does"
      description="An Alchemix loan charges no interest, and the balance falls without a payment from you."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user", label: "Alchemix v3 introduction" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
        { to: "/user/quick-start", label: "Quick start" },
      ]}
    />
  );
}
