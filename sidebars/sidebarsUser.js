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
      label: "Key Concepts",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "concepts/alAssets",
        "concepts/myt-and-yield",
        "concepts/self-repaying-loans",
        "concepts/borrowing-in-alchemix",
        "concepts/liquidations",
        "concepts/transmuter",
        "concepts/redemption-rate",
        "concepts/fees",
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
        "tutorials/repay-loan",
        "tutorials/redeem-alassets",
        "newguides/how-peg-is-maintained",
        "newguides/risk-considerations",
      ],
    },
    "v3-migration",
    "faq",
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
