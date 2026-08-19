import React from "react";
import LessonPage from "@site/src/components/Academy/LessonPage";
import Lab from "@site/src/components/Academy/PegLab";
import Wrap from "@site/src/components/Academy/lessons/transmuterAndPeg.mdx";

export default function Lesson() {
  return (
    <LessonPage
      lessonId="transmuter-and-peg"
      description="Learn why an alAsset below face value is a price rather than a failure, and who closes the gap."
      Lab={Lab}
      Wrap={Wrap}
      deeper={[
        { to: "/user/concepts/transmuter", label: "The Transmuter" },
        { to: "/user/concepts/how-peg-is-maintained", label: "How the Peg Is Maintained" },
        { to: "/user/tutorials/redeem-alassets", label: "Redeem alAssets" },
        { to: "/user/concepts/alAssets", label: "alAssets" },
      ]}
    />
  );
}
