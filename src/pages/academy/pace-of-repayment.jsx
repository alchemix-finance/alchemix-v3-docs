import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import PaceLab from "@site/src/components/Academy/PaceLab";
import Wrap from "@site/src/components/Academy/lessons/paceOfRepayment.mdx";

export default function PaceOfRepaymentLesson() {
  return (
    <LessonPage
      lessonId="l1-pace-of-repayment"
      description="Work out what decides how fast an Alchemix loan clears, and what has no effect on it."
      Lab={PaceLab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/redemption-rate", label: "Redemption Rate", note: "including how the rate is derived" },
        { to: "/user/concepts/self-repaying-loans", label: "Self-Repaying Loans" },
        { to: "/user/concepts/transmuter", label: "The Transmuter" },
        { to: "/user/tutorials/repay-loan", label: "Repay Your Loan", note: "to clear a balance by hand" },
      ]}
    />
  );
}
