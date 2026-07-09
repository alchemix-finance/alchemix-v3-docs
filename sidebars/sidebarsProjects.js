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
      collapsed: true,
      items: ["why-integrate/use-cases", "why-integrate/feature-comparison"],
    },

    //  How to Integrate
    {
      type: "category",
      label: "How to Integrate",
      className: "sidebarBold",
      collapsed: true,
      items: ["how-to/getting-started", "how-to/friendly-fork"],
    },

    //   Support
    {
      type: "category",
      label: "Support",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "support/co-marketing",
        "support/brand-assets",
        "support/security",
      ],
    },

    //   Contact & Onboarding
    {
      type: "category",
      label: "Contact & Onboarding",
      className: "sidebarBold",
      collapsed: true,
      items: [
        "contact/apply-to-partner", // Apply to Partner
      ],
    },

    "faq",
  ],
};
