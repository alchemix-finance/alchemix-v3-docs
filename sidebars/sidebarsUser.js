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
        "tutorials/deposit-and-borrow",
        "tutorials/borrowing-in-alchemix",
        "tutorials/repay-loan",
        "tutorials/redeem-alassets",
        "v3-migration",
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
          type: "doc",
          id: "financial-reports",
          label: "Financial Reports",
        },
        {
          type: "doc",
          id: "marketing-material",
          label: "Marketing Material",
        },
      ],
    },
  ],
};
