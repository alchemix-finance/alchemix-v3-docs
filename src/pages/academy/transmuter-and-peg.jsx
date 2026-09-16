import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/PegLab";
import Wrap from "@site/src/components/Academy/lessons/transmuterAndPeg.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="transmuter-and-peg"
      description="An alUSD below a dollar pays whoever is willing to wait for the Transmuter to exchange it 1:1. Work out what that wait is worth."
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
