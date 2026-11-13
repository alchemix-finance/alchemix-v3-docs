import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import Welcome from "@site/src/components/Members/Welcome";
import { WELCOME } from "@site/src/components/Members/copy";

/** /members/welcome: a wallet's record on its own, where the outreach links land (Keenan, 2026-10-28). */
export default function MembersWelcomePage() {
  return (
    <MembersShell title={WELCOME.title} description={WELCOME.description}>
      <Welcome />
    </MembersShell>
  );
}
