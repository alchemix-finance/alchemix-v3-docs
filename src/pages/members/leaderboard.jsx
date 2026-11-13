import React from "react";
import MembersShell from "@site/src/components/Members/Shell";
import Leaderboard from "@site/src/components/Members/Leaderboard";
import { LEADERBOARD, SECTIONS } from "@site/src/components/Members/copy";

/** /members/leaderboard: the season's pseudonymous leaderboard (ticket 16). */
export default function MembersLeaderboardPage() {
  return (
    <MembersShell title={SECTIONS.leaderboard} description={LEADERBOARD.intro}>
      <Leaderboard />
    </MembersShell>
  );
}
