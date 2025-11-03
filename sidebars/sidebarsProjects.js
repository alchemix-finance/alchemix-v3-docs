/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  tutorialSidebar: [
    // —————————————————————————————
    // Landing page
    { type: "doc", id: "index", label: "Welcome" },

    //   Why Integrate
    {
      type: "category",
      label: "Why Integrate",
      className: "sidebarBold",
      collapsed: false,
      items: ["why-integrate/use-cases"],
    },

    //  How to Integrate
    {
      type: "category",
      label: "How to Integrate",
      className: "sidebarBold",
      collapsed: false,
      items: ["how-to/friendly-fork"],
    },

    //   Support
    {
      type: "category",
      label: "Support",
      className: "sidebarBold",
      collapsed: false,
      items: [
        "support/brand-assets",
        "support/co-marketing",
        "support/security",
      ],
    },

    //   Contact & Onboarding
    {
      type: "category",
      label: "Contact & Onboarding",
      className: "sidebarBold",
      collapsed: false,
      items: [
        "contact/apply-to-partner", // Apply to Partner
      ],
    },
  ],
};
