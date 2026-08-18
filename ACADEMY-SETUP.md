# Alchemix Academy: wiring notes

Not published. Notes for whoever deploys this.

## What was added

| Path | Purpose |
| --- | --- |
| `src/pages/academy/` | The course UI: track map and lesson pages, served at `/academy` |
| `src/components/Academy/` | The academy shell, lesson interactives, lesson prose (MDX), and the API client |
| `docusaurus.config.js` | A navbar link, `customFields.academyApiBase`, and `indexPages: true` on the search plugin |
| `src/theme/Root.js` | The docs reading-progress bar is skipped on `/academy`, which renders its own progress |
| `vercel.json.example` | The API proxy. Rename to `vercel.json` once the engine host is known. |

The Academy is **not** a docs plugin instance. It renders its own shell with no
navbar, sidebar, footer or table of contents, because inheriting the docs layout
made a course read as documentation. Docusaurus still supplies the html document,
the global stylesheet and the fonts, so type and palette match the rest of the
site exactly.

Lesson prose is still Markdown. It lives in
`src/components/Academy/lessons/*.mdx` and is imported into the page, so writing a
lesson does not mean editing JSX.

No serverless functions were added to this repo, and the build stays fully
static. The only runtime dependency is the rewrite below.

## The one thing left to do

Grading runs on the season engine, not here. A static build cannot hold an answer
key. The docs proxy the API instead, so the browser only ever talks to
`docs.alchemix.fi`:

```json
{ "rewrites": [{ "source": "/api/academy/:path*", "destination": "https://<engine-host>/api/academy/:path*" }] }
```

That keeps requests same-origin, which is what avoids CORS and third-party cookie
blocking. `vercel.json.example` holds this with the host left as a placeholder,
so merging this branch cannot point the docs at a dead host by accident. Fill in
the host, rename the file, and verify the rewrite resolves on a preview
deployment before relying on it.

Until then the lesson pages render and the interactive stages work. Only the
checkpoint needs the API, and it reports the failure in place rather than
breaking the page.

## Running locally against the engine

The engine also defaults to port 3000, so give one of them another port.

```bash
# terminal 1, in the season engine repo
pnpm dev

# terminal 2, here
ACADEMY_API_BASE=http://localhost:3000 pnpm start --port 3001
```

The engine needs `ACADEMY_SECRET` set, and `ACADEMY_ALLOWED_ORIGIN=http://localhost:3001`
so its CORS check lets the docs origin through. Neither is needed in production,
where the rewrite makes everything same-origin.
