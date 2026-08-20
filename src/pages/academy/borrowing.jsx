import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/BorrowLab";
import Wrap from "@site/src/components/Academy/lessons/borrowing.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="borrowing"
      description="How much you can borrow against a deposit, what arrives when you do, and what reaching the cap means."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/tutorials/borrowing-in-alchemix", label: "Take a Loan" },
        { to: "/user/concepts/alAssets", label: "alAssets", note: "what borrowing mints" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-Repaying Loans" },
      ]}
    />
  );
}
