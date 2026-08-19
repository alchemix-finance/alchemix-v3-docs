import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/BackLab";
import Wrap from "@site/src/components/Academy/lessons/gettingMoneyBack.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="getting-money-back"
      description="Two ways to get your deposit back, and why the amount you can withdraw is smaller than you expect."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/tutorials/withdraw", label: "Withdraw Funds" },
        { to: "/user/tutorials/repay-loan", label: "Repay a Loan" },
      ]}
    />
  );
}
