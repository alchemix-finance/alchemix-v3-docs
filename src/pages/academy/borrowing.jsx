import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import { BEGINNER_STAGES } from "@site/src/components/Academy/kit";
import Lab from "@site/src/components/Academy/BorrowLab";
import Wrap from "@site/src/components/Academy/lessons/borrowing.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="borrowing"
      description="Borrow up to 90% of your deposit and the alUSD is minted to your wallet. The deposit keeps earning the whole time."
      stages={BEGINNER_STAGES}
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/self-repaying-loans", label: "Self-repaying loans" },
        { to: "/user/concepts/alAssets", label: "alAssets" },
        { to: "/user/tutorials/borrowing-in-alchemix", label: "Tutorial: Take a loan" },
      ]}
    />
  );
}
