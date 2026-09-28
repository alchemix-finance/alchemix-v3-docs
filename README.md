# Alchemix V3 Docs

This repo is the source for [docs.alchemix.fi](https://docs.alchemix.fi). Every page on the site is a plain text file in here, and when a change lands on the `main` branch the live site updates by itself a few minutes later.

## Getting access

You need two things:

1. A GitHub account.
2. Write access to this repo. Ask one of the admins of the [alchemix-finance](https://github.com/alchemix-finance) GitHub organization to add you. Without write access you can still suggest changes, but someone else has to approve them before they go live.

## Fixing a page 

Say a page has a wrong number, a typo, or a sentence that's out of date.

1. **Open the page** on [docs.alchemix.fi](https://docs.alchemix.fi) and scroll to the bottom.
2. **Click "Edit this page".** GitHub opens that page's file in an editor. If it asks you to sign in, do that first.
3. **Make your change.** It's just text. See [What not to touch](#what-not-to-touch) below for the few bits that aren't.
4. **Click the green "Commit changes..." button** at the top right. In the box that pops up:
   - Write a short note about what you changed, like "Fix redemption fee on Fees page".
   - Pick **"Create a new branch for this commit and start a pull request"**.
   - Click **"Propose changes"**.
5. **Click "Create pull request"** on the next screen.
6. **Check the preview.** Within a couple of minutes a bot called `vercel` leaves a comment on your pull request with a **Preview** link. That link is a full copy of the site with your change in it. Click it, find your page, and make sure it looks right.
7. **Click "Merge pull request"**, then **"Confirm merge"**. The live site updates a few minutes later.

If something looks off in the preview, you can go back to the file, edit it again, and commit to the same branch. The preview refreshes on its own.

## In a real emergency

If there's no time for a pull request, in step 4 you can pick **"Commit directly to the main branch"** instead. The change goes straight to the live site with no preview.

This is safe in one important way: if your change breaks the build, the site doesn't go down. It just keeps showing the last good version, and you'll see a red ✗ next to your commit on GitHub. Fix the mistake and commit again.

It's still worth using the pull request route when you can. The preview catches things like broken links, which make the build fail.

### Put a warning at the top of one page

Paste this near the top of the page, just under the `<PageBanner ... />` line:

```
:::danger

Withdrawals are paused while we investigate an issue. Funds are safe. Updates in Discord.

:::
```

Swap `danger` for `warning` or `info` if you want something softer.

### Put a banner across the whole site

There's a site-wide banner already written and switched off in [`docusaurus.config.js`](docusaurus.config.js). This file is code, so be a bit more careful here. Find the line that says `themeConfig:` and paste this right under the `({` line that follows it:

```js
      announcementBar: {
        id: "incident-2026-01-01",
        content: "Withdrawals are paused while we investigate. Updates in <a href=\"https://discord.gg/alchemix\">Discord</a>.",
        backgroundColor: "#f5c09a",
        textColor: "#1b1b1d",
        isCloseable: true,
      },
```

Change the message, and change the `id` to something new each time (today's date works). If the `id` stays the same, anyone who closed an earlier banner won't see the new one. Use the pull request route for this one so you can check the preview.

To take the banner down, delete those lines again.

### Undo a change

Go to the pull request that made the change (they're all listed under the **Pull requests** tab, in the **Closed** filter). Near the bottom there's a **Revert** button. Click it, then click **"Create pull request"**, then merge it like any other. Everything goes back to how it was.

## Finding the right file

"Edit this page" takes you straight to the right file, so you rarely need this. But if you're browsing the repo, the web address maps to a folder:

| On the site | In this repo |
| --- | --- |
| docs.alchemix.fi/user/... | `docs/user/...` |
| docs.alchemix.fi/dev/... | `docs/dev/...` |
| docs.alchemix.fi/governance/... | `docs/governance/...` |
| docs.alchemix.fi/projects/... | `docs/projects/...` |

For example, `docs.alchemix.fi/user/concepts/fees` lives in `docs/user/concepts/fees.md`.

## What not to touch

Most of a page is ordinary text. A few parts look like text but do a job, and changing them can break the page:

- **The block at the very top between two `---` lines.** That's the page's settings (its title, where it sits in the menu). Leave it alone unless you mean to change the title.
- **Lines starting with `import`.** These load pieces the page needs.
- **Anything in angle brackets**, like `<PageBanner title="FAQ" />`. 
  - `<FeeValue ... />` pulls a live fee straight from the blockchain. If a fee changes, the page updates itself. Don't type the number in by hand.
  - `<Term id="...">earmarked debt</Term>` is a word with a pop-up definition. You can change the words in the middle. Leave the tags on either side.

If you're not sure whether something is safe to change, use the pull request route and check the preview. 

## Things that need a developer

These are doable, just fiddly enough that it's better to ask for help:

- Adding a brand new page (it also has to be added to the menu).
- Adding or swapping images.
- Changing the menu, the layout, or anything in the `src/` folder.
- Reading the logs when a build fails. The Vercel project that hosts the site belongs to the Alchemix org, so only people with access there can see why a build broke.

---

## For developers

Built with [Docusaurus](https://docusaurus.io/). Needs Node 20 or newer and pnpm.

```
pnpm install    # install dependencies
pnpm start      # local dev server with live reload
pnpm build      # production build into build/
```

`onBrokenLinks` is set to `throw`, so `pnpm build` is the real check for broken links and MDX errors. Run it before merging anything bigger than a text fix.

### LLM export

`static/llms.txt` (index) and `static/llms-full.txt` (full concatenated docs) are served to AI crawlers and the "Copy for LLMs" audience. After meaningful content changes, regenerate the full export:

```
node scripts/generate-llms-full.js
```

`llms.txt` is maintained by hand. Update it when pages are added or removed.

### Deployment

The site deploys on [Vercel](https://vercel.com/). Pushes to `main` deploy to production, and every pull request gets a preview deployment.
