import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/OpenLab";
import Wrap from "@site/src/components/Academy/lessons/openingAPosition.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="opening-a-position"
      description="See what a deposit turns into, what borrowing mints, and why your withdrawable balance is smaller than you expect."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/self-repaying-loans", label: "Self-Repaying Loans" },
        { to: "/user/concepts/myt-and-yield", label: "Mix-Yield Token", note: "what your collateral becomes" },
        { to: "/user/tutorials/borrowing-in-alchemix", label: "Take a Loan" },
        { to: "/user/tutorials/withdraw", label: "Withdraw Funds" },
      ]}
    />
  );
}
