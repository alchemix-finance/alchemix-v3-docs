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
        "onchain/alcx-token",
        "onchain/onchain-governance-infrastructure",
      ],
    },
    {
      type: "category",
      label: "Guides",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "onchain/governance-process",
        "guides/contract-roles",
        "guides/myt-strategies",
      ],
    },
  ],
};

module.exports = sidebarsGovernance;
