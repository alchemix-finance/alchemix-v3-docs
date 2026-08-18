/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  academySidebar: [
    {
      type: "doc",
      id: "index",
      className: "sidebarBold",
      label: "Overview",
    },
    {
      type: "category",
      label: "Track One",
      className: "sidebarBold",
      collapsed: false,
      items: ["pace-of-repayment"],
    },
  ],
};
