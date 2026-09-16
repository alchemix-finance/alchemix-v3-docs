import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/PegLab";
import Wrap from "@site/src/components/Academy/lessons/transmuterAndPeg.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="transmuter-and-peg"
      description="Why a discount on an alAsset is a price on waiting, and who closes the gap."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/transmuter", label: "The Transmuter" },
        { to: "/user/concepts/how-peg-is-maintained", label: "How the Peg Works" },
        { to: "/user/tutorials/redeem-alassets", label: "Fixed Yield", note: "depositing alAssets into the Transmuter, step by step" },
        { to: "/user/concepts/alAssets", label: "alAssets" },
      ]}
    />
  );
}
