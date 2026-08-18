# Alchemix Academy: wiring notes

Not published. Notes for whoever deploys this.

## What was added

| Path | Purpose |
| --- | --- |
| `docs/academy/` | Lesson pages, served at `/academy` |
| `sidebars/sidebarsAcademy.js` | Sidebar for the academy docs instance |
| `src/components/Academy/` | Lesson interactives and the API client |
| `docusaurus.config.js` | A fourth docs plugin instance, a navbar entry, `customFields.academyApiBase`, and `academy` added to the search plugin's `docsRouteBasePath` |
| `vercel.json.example` | The API proxy. Rename to `vercel.json` once the engine host is known. |

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
