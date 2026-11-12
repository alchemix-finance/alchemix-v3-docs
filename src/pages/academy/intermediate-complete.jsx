import React from "react";
import TrackFinish from "@site/src/components/Academy/TrackFinish";
import { ADVANCED } from "@site/src/components/Academy/lib/track";

/**
 * Where the intermediate track ends. The page is TrackFinish, shared with the
 * advanced track since 2026-11-09, when the nine-lesson intermediate track
 * became an intermediate track of six lessons and an advanced track of four.
 * The words here are this track's own, and the way on is the advanced track.
 */
export default function IntermediateComplete() {
  const first = ADVANCED[0];
  return (
    <TrackFinish
      trackKey="intermediate"
      description="You followed a deposit through the three contracts, read a vault's strategies and your own position, priced a loan, worked through a liquidation, chose an LTV and sized a loan."
      lead="You can now read a vault's page, price a loan before you take it, and choose an LTV and a deposit for the cash you need."
      recap="In the app you can now follow your money through the MYT vault, the Alchemist and the Transmuter, and check a vault's strategies, Risk Levels and caps on the Info tab. You can read Health Factor and the 90% to 95% band, price a loan and recover part of the discount with Flash Repay, and work out what a liquidation or a self-liquidation would take. You can choose an LTV from the loss you plan to survive, and size the deposit a loan needs."
      next={first.ready ? { to: first.slug, label: "Start the advanced track" } : null}
      choices={[
        {
          kind: "advanced",
          label: "Advanced track",
          title: "Keep learning",
          body: `Four lessons on how the system behind your loan runs, starting with lesson 1: ${first.title}.`,
          action: "Start the first lesson",
          to: first.slug,
          soon: !first.ready,
        },
        {
          kind: "app",
          label: "alchemix.fi",
          title: "Use the app",
          body: "Open a position with the LTV you chose, and check the vault's Info tab before you deposit.",
          action: "Open alchemix.fi",
          href: "https://alchemix.fi",
        },
        {
          kind: "risks",
          label: "Docs",
          title: "Read the risks",
          body: "The docs' risk considerations page covers what can go wrong in more depth than this track.",
          action: "Open risk considerations",
          to: "/user/safety/risk-considerations",
        },
      ]}
    />
  );
}
