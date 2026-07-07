# Alchemix V3 Docs

Documentation site for Alchemix V3, built with [Docusaurus](https://docusaurus.io/).

## Installation

```
pnpm install
```

## Local Development

```
pnpm start
```

Starts a local development server and opens a browser window. Most changes are reflected live without restarting the server.

## Build

```
pnpm build
```

Generates static content into the `build` directory.

## LLM export

`static/llms.txt` (index) and `static/llms-full.txt` (full concatenated docs) are served to AI crawlers and the "Copy for LLMs" audience. After meaningful content changes, regenerate the full export:

```
node scripts/generate-llms-full.js
```

`llms.txt` is maintained by hand — update it when pages are added or removed.

## Deployment

The site is deployed on [Vercel](https://vercel.com/). Pushes to `main` trigger automatic deployments.
