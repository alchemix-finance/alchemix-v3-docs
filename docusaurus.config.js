// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Alchemix Docs",
  tagline: "Alchemix V3 Documentation",
  favicon: "img/favicon.png",

  // Set the production url of your site here
  url: "https://alchemix-v3-docs.vercel.app/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "alchemix-finance", // Usually your GitHub org/user name.
  projectName: "alchemix-v3-docs", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
  },
  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        docsRouteBasePath: ["user", "dev", "governance", "projects"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          id: "default",
          path: "docs/user",
          routeBasePath: "user",
          sidebarPath: require.resolve("./sidebars/sidebarsUser.js"),
          editUrl:
            "https://github.com/alchemix-finance/alchemix-v3-docs/edit/main/",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  plugins: [
    // — DEV docs @ /dev
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "dev",
        path: "docs/dev",
        routeBasePath: "dev",
        sidebarPath: require.resolve("./sidebars/sidebarsDev.js"),
        editUrl:
          "https://github.com/alchemix-finance/alchemix-v3-docs/edit/main/docs/dev/",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],

    // — Governance docs @ /governance
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "governance",
        path: "docs/governance",
        routeBasePath: "governance",
        sidebarPath: require.resolve("./sidebars/sidebarsGovernance.js"),
        editUrl:
          "https://github.com/alchemix-finance/alchemix-v3-docs/edit/main/docs/governance/",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],

    // — PROJECTS docs @ /projects
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "projects",
        path: "docs/projects",
        routeBasePath: "projects",
        sidebarPath: require.resolve("./sidebars/sidebarsProjects.js"),
        editUrl:
          "https://github.com/alchemix-finance/alchemix-v3-docs/edit/main/docs/projects/",
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],

    // Redirect  root `/` → `/user`
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/",
            to: "/user",
          },
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: "beta-2025-audit",
        content:
          "🚧 <strong>Public BETA:</strong> These docs are in active development. Expect gaps and changes. " +
          '<a href="https://discord.gg/E9eGjttFCB">Get support</a> · ' +
          '<a href="https://github.com/alchemix-finance/alchemix-v3-docs/issues/new">Report an issue</a>',
        backgroundColor: "#FFF4E5",
        textColor: "#3D2C00",
        isCloseable: false,
      },
      //   announcementBar: {
      //   id: "v3_launch2",
      //   content:
      //     '🎉 <b>Alchemix V3 is live! </b><a target="_blank" rel="noopener noreferrer" href="https://app.alchemix.fi">Launch App</a>',
      //   backgroundColor: "#f5c09a",
      //   textColor: "#1b1b1d",
      //   isCloseable: true,
      // },
      image: "img/social-card.png",
      colorMode: {
        defaultMode: "dark", // start in dark
        disableSwitch: true, // hide the light/dark toggle
        respectPrefersColorScheme: false, // ignore OS preference
      },
      navbar: {
        // title: "Alchemix",
        logo: {
          alt: "Alchemix Logo",
          src: "img/alchemix-full.svg",
          href: "/user",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Users",
          },
          {
            type: "docSidebar",
            sidebarId: "devSidebar",
            docsPluginId: "dev",
            position: "left",
            label: "Developers",
          },
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            docsPluginId: "governance",
            position: "left",
            label: "Governance",
          },
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            docsPluginId: "projects",
            position: "left",
            label: "Integrations",
          },
          {
            href: "https://github.com/alchemix-finance/alchemix-v3-docs",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "User",
                to: "/user",
              },
              {
                label: "Developer",
                to: "/dev",
              },
              {
                label: "Governance",
                to: "/governance/intro",
              },
              {
                label: "Integrations",
                to: "/projects",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Live dAPP",
                href: "https://alchemix.fi/",
              },
              {
                label: "Discord",
                href: "https://discord.gg/E9eGjttFCB",
              },
              {
                label: "X (Prev. Twitter)",
                href: "https://x.com/AlchemixFi",
              },
              {
                label: "Newsletter",
                href: "https://alchemixfi.substack.com/",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/alchemix-finance",
              },
              {
                label: "Forum",
                href: "https://forum.alchemix.fi/public/",
              },
              {
                label: "DefiLlama",
                href: "https://defillama.com/",
              },
              {
                label: "Snapshot",
                href: "https://snapshot.org/",
              },
            ],
          },
        ],
        logo: {
          alt: "Alchemix Logo",
          src: "img/alchemix-full.svg",
          href: "https://alchemix.fi/",
          width: 160,
        },
        copyright: `Copyright © 2020 - ${new Date().getFullYear()} Alchemix Labs.
        <br>
        <span style="font-size: 0.6em; opacity: 0.8;">
        All rights reserved, no guarantees given. DeFi tools are not toys. Use at your own risk.
      </span>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
