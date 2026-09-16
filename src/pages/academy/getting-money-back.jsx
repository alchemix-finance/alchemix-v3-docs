import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/BackLab";
import Wrap from "@site/src/components/Academy/lessons/gettingMoneyBack.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="getting-money-back"
      description="Your loan holds back the collateral it needs to stay under the 90% cap. Everything above that can leave the position today."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/tutorials/withdraw", label: "Withdraw" },
        { to: "/user/tutorials/repay-loan", label: "Repay Your Loan", note: "which asset repays which part of a loan" },
      ]}
    />
  );
}
