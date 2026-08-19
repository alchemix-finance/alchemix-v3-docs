import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/WhatLab";
import Wrap from "@site/src/components/Academy/lessons/whatAlchemixDoes.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="what-alchemix-does"
      description="The three things Alchemix does, and why its loans behave differently from every other loan you have taken."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/quick-start", label: "Quick Start", note: "open a position in a few minutes" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-Repaying Loans" },
        { to: "/user/glossary", label: "Glossary", note: "every term in one place" },
      ]}
    />
  );
}
