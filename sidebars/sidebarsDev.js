/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  devSidebar: [
    { type: "doc", id: "index", label: "Dev Overview" },
    {
      type: "category",
      label: "Architecture",
      collapsed: false,
      items: [
        "architecture/overview",
        "architecture/redemptions",
        "architecture/security-model",
      ],
    },
    {
      type: "category",
      label: "Smart Contracts",
      collapsed: false,
      items: ["contracts/ethereum", "contracts/optimism", "contracts/arbitrum"],
    },
    {
      type: "category",
      label: "Core Modules",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Alchemist",
          collapsed: false,
          items: [
            "alchemist/alchemist-contract",
            {
              type: "category",
              label: "AlchemistFeeVault",
              items: [
                "alchemist/abstract-fee-vault-contract",
                "alchemist/alchemist-token-vault-contract",
                "alchemist/alchemist-eth-vault-contract",
              ],
            }
          ],
        },
        {
          type: "category",
          label: "MYT",
          collapsed: false,
          items: [
            "myt/myt-contract",
            {
              type: "category",
              label: "Operations",
              items: [
                "myt/permissioned-proxy-contract",
                "myt/alchemist-allocator-contract",
                "myt/alchemist-curator-contract",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Transmuter",
          collapsed: false,
          items: [
            "transmuter/transmuter-contract"
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Integrating Alchemix",
      collapsed: false,
      items: [
        "integration/using-alassets",
        "integration/integrate-myt",
        "integration/integrate-transmuter",
        "integration/integrate-alchemist",
        "integration/grants-program",
      ],
    },
    "faq",
  ],
};
