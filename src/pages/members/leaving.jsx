import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import Leaving from "@site/src/components/Members/Leaving";
import { LEAVING } from "@site/src/components/Members/copy";

/** /members/leaving: the standalone exit reason form (ticket 16). */
export default function MembersLeavingPage() {
  return (
    <MembersShell title={LEAVING.headline} description={LEAVING.intro}>
      <Leaving />
    </MembersShell>
  );
}
