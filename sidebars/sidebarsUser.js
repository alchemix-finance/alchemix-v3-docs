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
      type: "doc",
      id: "links",
      label: "Links & Resources",
    },
    {
      type: "category",
      label: "Key Concepts",
      className: "sidebarBold",
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Assets",
          items: ["concepts/alAssets", "concepts/myt-and-yield"],
        },
        {
          type: "category",
          label: "Borrowing & Loans",
          items: [
            "concepts/self-repaying-loans",
            "concepts/borrowing-in-alchemix",
            "concepts/liquidations",
          ],
        },
        {
          type: "category",
          label: "System Mechanics",
          items: [
            "concepts/transmuter",
            "concepts/redemption-rate",
            "concepts/fees",
          ],
        },
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
      ],
    },
    {
      type: "category",
      label: "Guides",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "newguides/how-peg-is-maintained",
        "newguides/risk-considerations",
      ],
    },
    "faq",
  ],
};
