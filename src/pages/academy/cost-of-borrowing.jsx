import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/CostLab";
import Wrap from "@site/src/components/Academy/lessons/costOfBorrowing.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="cost-of-borrowing"
      description="An Alchemix loan charges no interest. Work out what you pay instead, and when it is charged."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/alAssets", label: "alAssets", note: "minting, selling, and the market discount" },
        { to: "/user/concepts/fees", label: "Fees", note: "live rates read from the contracts" },
        { to: "/user/tutorials/repay-loan", label: "Repay Your Loan" },
      ]}
    />
  );
}
