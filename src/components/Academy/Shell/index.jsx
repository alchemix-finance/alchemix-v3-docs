import React, { useEffect, useState } from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import { AlchemixLockup, AlchemixMark } from "../Logo";
import { readCompletions } from "../lib/api";
import { LESSON_COUNT, OPEN_LESSONS } from "../lib/track";

/**
 * The academy chrome.
 *
 * Not `@theme/Layout`. The docs layout is what made the academy read as
 * documentation: a sidebar tree, a table of contents, breadcrumbs, and a reader
 * who can wander sideways at any moment. A course wants the opposite, so these
 * pages render their own shell and the only way out is the one link back to the
 * docs.
 *
 * Docusaurus still supplies the html document, the global stylesheet, and the
 * fonts, so the type and palette stay identical to the rest of the site.
 *
 * The header leads with the Academy lockup on every page. On the track map it
 * is the whole left side; on a lesson page `left` follows it, and below 1280px
 * the lockup gives way to the mark so the breadcrumb, the stepper and the docs
 * link still share one row.
 */
/**
 * The members area lives on its own branch (feat/members-area-v2), so on this
 * one /members is a 404. The link stays out of the header until the two
 * branches meet; flip this then. The track map reads it too: a finished
 * track's panel points to the members area, where a track is claimed.
 */
export const MEMBERS_LIVE = false;

/**
 * Opt-in, for the article lessons (and nothing else, so the map and
 * the LessonPage lessons render as before): `pinned` keeps the header at the
 * top of the window, `below` is a second row inside it (the position strip),
 * and `footer` is a bar kept at the foot of the window. The footer is the
 * page column's last child and sticks to the bottom, so it takes its own
 * room in the flow and nothing in the body ever sits behind it.
 */
export default function AcademyShell({ title, description, children, left, right, pinned = false, below = null, footer = null }) {
  // Counted in an effect, never during render. These pages are prerendered at
  // build time, so localStorage does not exist the first time this runs.
  //
  // The effect has no dependency list. A checkpoint that passes re-renders the
  // lesson page, and the count in the header should follow without a
  // navigation. The state only changes when the number does, so the re-run
  // costs one localStorage read and no render.
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const all = readCompletions();
    const n = OPEN_LESSONS.filter((l) => Boolean(all[l.id])).length;
    setCompleted((prev) => (prev === n ? prev : n));
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        {/* The link preview's title: without this a pasted Academy link
            unfurls under the site's default, "Alchemix Docs". */}
        <meta property="og:title" content={title} />
        {description ? <meta name="description" content={description} /> : null}
        {description ? <meta property="og:description" content={description} /> : null}
      </Head>

      <div className={`${styles.page} ${pinned ? styles.pageWide : ""}`}>
        <header className={`${styles.header} ${pinned ? styles.headerPinned : ""}`}>
          <div className={`${styles.headerInner} ${left ? styles.withCrumb : ""}`}>
            <span className={`${styles.node} ${styles.nodeBL}`} aria-hidden="true" />
            <span className={`${styles.node} ${styles.nodeBR}`} aria-hidden="true" />
            <div className={styles.headerLeft}>
              <Link to="/academy" className={styles.brand} aria-label="Alchemix Academy">
                <span className={styles.logoSlot}>
                  <AlchemixLockup className={styles.lockup} />
                  <AlchemixMark className={styles.mark} />
                  <span className={styles.brandRule} aria-hidden="true" />
                  <span className={styles.brandWord}>Academy</span>
                </span>
              </Link>
              {left}
            </div>

            <div className={styles.headerRight}>
              {/* On the map, the count waits for the first finished lesson.
                  "0 of 13" before anyone has started was one of seven zeros on
                  a fresh map (2026-10-30). */}
              {right ?? (completed > 0 ? (
                <>
                  <span className={styles.progressLabel}>
                    {completed} of {LESSON_COUNT} lessons complete
                  </span>
                  <span className={styles.progressShort}>
                    {completed}/{LESSON_COUNT}
                  </span>
                  <span className={styles.progressTrack}>
                    <span
                      className={styles.progressFill}
                      style={{ width: `${(completed / LESSON_COUNT) * 100}%` }}
                    />
                  </span>
                </>
              ) : null)}
              {/* New tabs, so stepping out to the docs or the members area
                  mid-lesson keeps the stage the learner is on. */}
              <span className={styles.navLinks}>
                {right || completed > 0 ? <span className={styles.navRule} aria-hidden="true" /> : null}
                {MEMBERS_LIVE ? (
                  <Link to="/members" className={styles.exit} target="_blank" rel="noopener noreferrer">
                    Members
                  </Link>
                ) : null}
                <Link to="/user" className={styles.exit} target="_blank" rel="noopener noreferrer">
                  Docs
                </Link>
                {/* The way back to the main site.
                    The small arrow marks the one link here that leaves the
                    docs site. */}
                <a href="https://alchemix.fi" className={`${styles.exit} ${styles.exitOut}`} target="_blank" rel="noopener noreferrer">
                  alchemix.fi
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                  </svg>
                </a>
              </span>
            </div>
          </div>
          {below ? <div className={styles.below}>{below}</div> : null}
        </header>

        <div className={styles.content}>{children}</div>

        {footer ? (
          <footer className={styles.footer}>
            <div className={styles.footerInner}>{footer}</div>
          </footer>
        ) : null}
      </div>
    </>
  );
}
