/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  tutorialSidebar: [
    {
      type: "doc",
      id: "index",
      className: "sidebarBold",
      label: "Introduction",
    },
    {
      type: "doc",
      id: "quick-start",
      label: "Quick Start",
    },
    {
      type: "category",
      label: "What Is Alchemix",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "concepts/alAssets",
        "concepts/myt-and-yield",
        "concepts/self-repaying-loans",
      ],
    },
    {
      type: "category",
      label: "How It Works",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "concepts/liquidations",
        "concepts/transmuter",
        "concepts/redemption-rate",
        "concepts/fees",
        "concepts/how-peg-is-maintained",
      ],
    },
    {
      type: "category",
      label: "Tutorials",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "tutorials/use-passive-myt",
        // "tutorials/deposit-and-borrow", // hidden: superseded by "Take a Loan" (borrowing-in-alchemix)
        "tutorials/borrowing-in-alchemix",
        "tutorials/repay-loan",
        "tutorials/withdraw",
        "tutorials/redeem-alassets",
      ],
    },
    {
      type: "category",
      label: "Trust & Safety",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "safety/risk-considerations",
        "safety/security",
      ],
    },
    "faq",
    "glossary",
    {
      type: "category",
      label: "Resources",
      className: "sidebarBold",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "links",
          label: "Links & Resources",
        },
        {
          type: "link",
          href: "/governance/onchain/alcx-token",
          label: "ALCX Token",
        },
        {
          type: "doc",
          id: "financial-reports",
          label: "Financial Reports",
        },
        {
          type: "doc",
          id: "independent-research",
          label: "Independent Research",
        },
        {
          type: "doc",
          id: "marketing-material",
          label: "Marketing Material",
        },
        {
          type: "doc",
          id: "v3-migration",
          label: "V3 Migration & Mana",
        },
      ],
    },
  ],
};
