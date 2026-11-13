import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import MembersHome from "@site/src/components/Members/Home";
import { SHELL } from "@site/src/components/Members/copy";

/**
 * /members: the members area home (ticket 15). Paste or connect an address to
 * see its history, v3 positions, next step and season standing, all read only;
 * the claims at the foot each take one signature (ticket 16). Built like the
 * Academy: a custom page with its own shell and no docs chrome.
 */
export default function MembersPage() {
  return (
    <MembersShell title={SHELL.title} description={SHELL.description}>
      <MembersHome />
    </MembersShell>
  );
}
