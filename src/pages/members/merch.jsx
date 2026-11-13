import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import Merch from "@site/src/components/Members/Merch";
import { MERCH_PAGE } from "@site/src/components/Members/copy";

/** /members/merch: the proof-of-concept store side of the merch claim (demo walkthrough 2026-10-27). Not in the navigation. */
export default function MembersMerchPage() {
  return (
    <MembersShell title={MERCH_PAGE.title} description={MERCH_PAGE.lead}>
      <Merch />
    </MembersShell>
  );
}
