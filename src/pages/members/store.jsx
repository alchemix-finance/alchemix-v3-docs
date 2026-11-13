import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import StorePage from "@site/src/components/Members/StorePage";
import { STORE } from "@site/src/components/Members/copy";

/** /members/store: what essence unlocks, and the claims on each item (design notes 2026-11-03, metalface 25 and 30). */
export default function MembersStorePage() {
  return (
    <MembersShell title={STORE.title} description={STORE.lead}>
      <StorePage />
    </MembersShell>
  );
}
