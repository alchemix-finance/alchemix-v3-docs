/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarsGovernance = {
  tutorialSidebar: [
    "intro",

    {
      type: "category",
      label: "Key Concepts",
      className: "sidebarBold",
      collapsed: false,
      items: [
        // TODO
        // "onchain/how-to-vote",
        // "onchain/vqalcx",
        "onchain/onchain-governance-infrastructure",
      ],
    },
    {
      type: "category",
      label: "Guides",
      className: "sidebarBold",
      collapsed: false,
      items: ["guides/contract-roles", "onchain/governance-process"],
    },
  ],
};

module.exports = sidebarsGovernance;
