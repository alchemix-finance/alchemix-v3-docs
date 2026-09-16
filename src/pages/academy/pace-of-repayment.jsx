import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import PaceLab from "@site/src/components/Academy/PaceLab";
import Wrap from "@site/src/components/Academy/lessons/paceOfRepayment.mdx";

export default function PaceOfRepaymentLesson() {
  return (
    <LessonPage
      lessonId="pace-of-repayment"
      description="Borrowing more does not make a loan take longer to clear. One protocol-level rate sets the pace for every position in the market."
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
