/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  devSidebar: [
    { type: "doc", id: "index", label: "Dev Overview" },
    {
      type: "category",
      label: "Architecture",
      collapsed: true,
      className: "sidebarBold",
      items: [
        "architecture/overview",
        // "architecture/redemptions",
        "architecture/security-model",
      ],
    },

    {
      type: "category",
      label: "Core Modules",
      collapsed: true,
      className: "sidebarBold",
      items: [
        {
          type: "category",
          label: "Alchemist",
          collapsed: true,
          items: [
            "alchemist/alchemist-contract",
            {
              type: "category",
              label: "Utilities",
              items: [
                "alchemist/alchemist-router-contract",
                "alchemist/alchemist-v3-position-contract",
              ]
            },
            {
              type: "category",
              label: "AlchemistFeeVault",
              items: [
                "alchemist/abstract-fee-vault-contract",
                "alchemist/alchemist-token-vault-contract",
                "alchemist/alchemist-eth-vault-contract",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "MYT",
          collapsed: true,
          items: [
            "myt/operator-cheatsheet",
            "myt/myt-contract",
            {
              type: "category",
              label: "Utilities",
              items: [
                "myt/permissioned-proxy-contract",
                "myt/alchemist-allocator-contract",
                "myt/alchemist-curator-contract",
                "myt/alchemist-strategy-classifier-contract",
              ],
            },
          ],
        },
        {
          type: "doc",
          id: "transmuter/transmuter-contract",
          label: "Transmuter",
        },
      ],
    },
    // {
    //   type: "category",
    //   label: "Deployed Contracts",
    //   collapsed: true,
    //   className: "sidebarBold",
    //   items: ["contracts/ethereum", "contracts/optimism", "contracts/arbitrum"],
    // },

    // Integrating Alchemix
    // {
    //   type: "category",
    //   label: "Integrating Alchemix",
    //   collapsed: true,
    //   className: "sidebarBold",
    //   items: [
    //     "integration/using-alassets",
    //     "integration/integrate-myt",
    //     "integration/integrate-transmuter",
    //     "integration/integrate-alchemist",
    //     "integration/grants-program",
    //   ],
    // },
    "faq",
  ],
};
