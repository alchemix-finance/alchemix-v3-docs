import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/BackLab";
import Wrap from "@site/src/components/Academy/lessons/gettingMoneyBack.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="getting-money-back"
      description="How to read a position: what is owed, what can be withdrawn now, and the two routes to the rest."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/tutorials/withdraw", label: "Withdraw" },
        { to: "/user/tutorials/repay-loan", label: "Repay Your Loan", note: "earmarked debt and which asset to use" },
      ]}
    />
  );
}
