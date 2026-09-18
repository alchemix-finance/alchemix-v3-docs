# Alchemix Academy: wiring notes

This file is not published. It is notes for whoever deploys the Academy.

## What was added

| Path | Purpose |
| --- | --- |
| `src/pages/academy/` | The course UI: the track map and one page per lesson, served at `/academy` |
| `src/components/Academy/` | The academy shell, the lesson labs, the shared kit, lesson prose (MDX), and the API client |
| `src/components/Academy/lib/track.js` | The two tracks as data: ids, titles, blurbs, points |
| `src/components/Academy/lib/api.js` | Challenge, grade, and claim calls, plus completion storage |
| `docusaurus.config.js` | A navbar link, `customFields.academyApiBase`, and `indexPages: true` on the search plugin |
| `src/theme/Root.js` | The docs reading-progress bar is skipped on `/academy`, which renders its own progress |
| `vercel.json` | The API proxy. Points at the deployed season engine. |

The Academy is **not** a docs plugin instance. It renders its own shell with no
navbar, sidebar, footer, or table of contents, because inheriting the docs
layout made a course read as documentation. Docusaurus still supplies the html
document, the global stylesheet, and the fonts, so type and palette match the
rest of the site.

Lesson prose is Markdown. It lives in `src/components/Academy/lessons/*.mdx` and
is imported into the page, so writing a lesson does not mean editing JSX.

No serverless functions were added to this repo, and the build stays fully
static. The only runtime dependency is the rewrite below.

## Two tracks

Both tracks are defined in `src/components/Academy/lib/track.js` and appear on
the track map at `/academy`, beginner first.

| Track | Lessons | Stage labels | Bonus on finishing |
| --- | --- | --- | --- |
| Beginner | 6 | Learn / Try / Check | 400 points and the graduate Discord role |
| Intermediate | 7 | Predict / Explore / Checkpoint | 800 points and the intermediate Discord role |

Every lesson banks 100 points. The numbers mirror the engine's seed
(`scripts/seed.ts` there, which is authoritative). The intermediate bonus is
seeded under the key `academy.advanced.completed`; the key is deployed data and
keeps its name.

Lesson ids match the engine's registry (`src/lib/academy/lessons.ts` there) and
must not be renamed. The `getting-money-back` id is the intermediate track's
first lesson, titled "Reading your position". Its id and grader are unchanged.

### Reading ahead

Every lesson is reachable from the map, including ones the learner has not
got to yet. Opening one of those renders a **preview**: a banner saying the page
does not respond and naming the lesson they should be on, the lab below it
dimmed and made `inert`, the stage stepper disabled, and the same pointer
repeated at the foot of the page. The banner's link stays inside the track the
previewed lesson belongs to, so previewing an intermediate lesson does not send
someone back to a beginner track they skipped on purpose.

Nothing about grading changed. A preview never reaches a checkpoint, so it
cannot bank points or store a completion, and `trackState` still marks exactly
one lesson per track as current.

The `inert` attribute has to be passed as `inert={true}`. React treats it as a
boolean prop and drops the attribute for `inert=""`, which leaves the lab fully
clickable.

### Figures in the lessons

`src/components/Academy/lib/protocol.js` holds the illustrative constants every
lesson projects from: `EXAMPLE_REDEMPTION`, `EXAMPLE_YIELD` and
`EXAMPLE_AL_PRICE`. They were per-lab before and had drifted apart from each
other and from the protocol. They are display only; every graded checkpoint
takes its figures from the engine.

They are also the thing most likely to go stale. Each carries a comment with the
live readings it was set against and the date they were checked. When they are
next revisited, read the redemption rate off a couple of vaults in the app and
the alAsset price off the Fixed Yield page, and update the comments with them.

The track map also renders a live strip (`src/components/Academy/LiveFigures`)
reading TVL, the redemption fee, the early exit fee and the MYT performance fee
through the docs' existing `useAlchemixStats` and `useAlchemixFees` hooks.

### Screenshots

A lesson can name a screenshot in `lib/track.js` (`shot`, `shotAlt`,
`shotNote`), shown with the wrap-up after the lesson is passed. Only files
verified against the live app are used: several older captures in `static/img`
still show the pre-rename navigation (`Vaults`, `Mixed Yield`, `Fixed Yield` as
top-level items) and must not be added without re-checking. `deposit-and-borrow-*.png`
is one of those.

The app's navigation now reads Borrow, and Earn → Variable Rate / Fixed Rate.
The `app` field on each lesson is written that way; the page titles Mixed Yield
and Fixed Yield still exist and the prose names both where it helps.

The shell's header counts completions across both tracks. Each track on the map
has its own progress line and its own done / current / ahead rail.

## The proxy

Grading runs on the season engine. A static build cannot hold an answer key, so
the docs proxy the API and the browser only ever talks to the docs origin:

```json
{ "rewrites": [{ "source": "/api/academy/:path*", "destination": "https://alchemix-seasons.vercel.app/api/academy/:path*" }] }
```

That keeps requests same-origin, which avoids CORS and third-party cookie
blocking. `vercel.json` holds this with the deployed engine host filled in.
`vercel.json.example` keeps the placeholder form for reference. Verify the
rewrite resolves on a preview deployment before relying on it: a missing rewrite
makes every checkpoint report a failure in place, and makes the claim panel say
the claim is not open yet.

## Completions and the claim

A passed checkpoint returns a signed completion token, which the browser stores
in `localStorage["alchemix-academy-completions-v1"]` as `{ [lessonId]: token }`.
The tokens are the proof; the progress shown on screen is a reading of them.

When every lesson in a track is done, the track map shows a graduation panel
with a "Claim your role" button. The button calls `claimGraduation` in
`lib/api.js`, which POSTs to `/api/academy/claim`:

```json
{ "track": "beginner", "completions": ["<lessonId>.<exp>.<sig>", "..."] }
```

The engine answers `{ eligible, track, completed, missing }`. The endpoint is
verify-only: it checks each token's signature against the track's lesson ids,
grants nothing, and touches no database. It is the seam the Discord bot
integration plugs into. A `local:` prefixed token comes from the dev-only grader
and never verifies.

If the engine answers 404, the endpoint is not deployed yet. `claimGraduation`
resolves `{ notOpen: true }`, and the panel says the claim opens with the
Discord link and that the completions stay in this browser. Nothing else on the
page changes. Any other failure shows the engine's message and a retry.

## Running locally

```bash
pnpm start
```

Checkpoints grade in the browser when the season engine is not running, so
every lesson page is usable for docs work without standing up a second repo. A
dashed notice on the checkpoint says when that is happening, and the completion
it records carries a `local:` prefix that no signature can match, so it is never
worth a reward. When every token in a track is local, the graduation panel says
so and disables the claim button.

This cannot happen in a deployed build. Every entry point is behind
`process.env.NODE_ENV !== "production"`, which the build replaces with a
literal. A production build with no engine reachable refuses to grade and shows
the failure; `pnpm start` grades locally and marks it.

### Against the real grader

You only need this when you are changing grading itself. The engine also defaults
to port 3000, so give one of them another port.

```bash
# terminal 1, in the season engine repo
pnpm dev

# terminal 2, here
ACADEMY_API_BASE=http://localhost:3000 pnpm start --port 3001
```

The engine needs `ACADEMY_SECRET` set, and `ACADEMY_ALLOWED_ORIGIN=http://localhost:3001`
so its CORS check lets the docs origin through. Neither is needed in production,
where the rewrite makes everything same-origin.

## Demo build

What has to be true before the link goes out.

- [ ] `vercel.json` points at the engine host that is serving the Academy
      routes. `GET /api/academy/challenge?lesson=your-deposit` through the docs
      origin returns JSON with `challenge` and `controls`.
- [ ] `ACADEMY_SECRET` is set on the engine deployment. Without it every grade
      call fails with a 500, and the checkpoint shows the engine's message.
- [ ] `POST /api/academy/claim` is deployed on the engine. Until it is, the
      graduation panel reports that the claim is not open yet. That state is
      safe to ship; it is what the panel shows on the 404.
- [ ] `pnpm build` is green here.

What a tester sees:

1. The track map at `/academy` shows a beginner track of six lessons and an
   intermediate track of seven, each with one live lesson and a progress line.
   The header counts lessons complete out of 13. The hero carries a diagram of
   the position the beginner track builds, which fills in as lessons are
   finished, and a live figures strip sits under it.
2. Each lesson has three stages. The last stage asks a question the engine set
   and grades the answer. A pass stores a token in the browser, marks the
   lesson done on the map, and offers the next lesson directly.
3. Any lesson further down a track can be opened and read. It renders as an
   inert preview that names the lesson to go to instead.
4. Finishing every lesson in a track shows the graduation panel for that track,
   which names the role it earns, the points banked, and the claim button. With
   the claim endpoint deployed, the button reports whether the engine verified
   the set and lists any lesson it could not verify. Without it, the panel says
   the claim opens with the Discord link.
5. Progress lives in the tester's browser. A different browser or a cleared
   site starts from zero.
