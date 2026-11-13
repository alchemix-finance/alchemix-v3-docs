import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import Badges from "@site/src/components/Members/Badges";
import { BADGES_PAGE } from "@site/src/components/Members/copy";

/** /members/badges: every badge and claim (feedback 2026-10-28). In the nav where the leaderboard was. */
export default function MembersBadgesPage() {
  return (
    <MembersShell title={BADGES_PAGE.title} description={BADGES_PAGE.lead}>
      <Badges />
    </MembersShell>
  );
}
