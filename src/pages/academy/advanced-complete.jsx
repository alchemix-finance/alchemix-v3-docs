import React from "react";
import TrackFinish from "@site/src/components/Academy/TrackFinish";

/**
 * Where the advanced track ends (2026-11-09). The page is TrackFinish, shared
 * with the intermediate track. No track follows this one, so the way on is the
 * map, and no role is decided for it, so the page shows no Members card.
 */
export default function AdvancedComplete() {
  return (
    <TrackFinish
      trackKey="advanced"
      description="You followed a Fixed Yield deposit from vesting to claim, worked out a Redemption Rate, read a Fixed Yield card's return and looped a deposit."
      lead="You can now explain how redemptions reach your loan, work out what a Redemption Rate or a Fixed Yield card is telling you, and weigh a loop's yield against its cost and its risk."
      recap="In the app you can now follow a Fixed Yield deposit from vesting to claim on the Earmarking and Redemptions tabs, and tell when cover is paying depositors before any of your debt is earmarked. You can work out a Redemption Rate from the queue, the term and Total Debt, and project your loan in the Visualizer. You can read a Fixed Yield card's return, its Deposit Cap and what a claim pays, and set up a loop knowing its Loan Cost and what a loss in the vault would take from it."
      choices={[
        {
          kind: "app",
          label: "alchemix.fi",
          title: "Use the app",
          body: "Check a vault's Redemptions tab and its Fixed Yield card before you borrow or deposit.",
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
        {
          kind: "map",
          label: "Academy",
          title: "Back to the map",
          body: "Every lesson stays open to revisit, and your completions are saved in this browser.",
          action: "Open the map",
          to: "/academy",
        },
      ]}
    />
  );
}
