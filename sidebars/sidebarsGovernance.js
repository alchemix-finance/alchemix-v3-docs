/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarsGovernance = {
  tutorialSidebar: [
    "intro",

    {
      type: "category",
      label: "Key Concepts",
      className: "sidebarBold",
      collapsed: true,
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
      collapsed: true,
      items: ["onchain/governance-process", "guides/contract-roles"],
    },
  ],
};

module.exports = sidebarsGovernance;
