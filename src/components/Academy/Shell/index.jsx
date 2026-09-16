import React, { useEffect, useState } from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import { readCompletions } from "../lib/api";
import { ALL_LESSONS, LESSON_COUNT } from "../lib/track";

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
 */
export default function AcademyShell({ title, description, children, left, right }) {
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
    const n = ALL_LESSONS.filter((l) => Boolean(all[l.id])).length;
    setCompleted((prev) => (prev === n ? prev : n));
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>

      <div className={styles.page}>
        <div className={styles.glow} aria-hidden="true" />

        <header className={styles.header}>
          {left ?? (
            <Link to="/academy" className={styles.brand}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5c09a" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
                <path d="M12 8 L16.5 10.5 L16.5 15 L12 17.5 L7.5 15 L7.5 10.5 Z" stroke="rgba(245,192,154,0.45)" />
              </svg>
              <span className={styles.brandText}>Alchemix Academy</span>
            </Link>
          )}

          <div className={styles.headerRight}>
            {right ?? (
              <>
                <span className={styles.progressLabel}>
                  {completed} of {LESSON_COUNT} lessons
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
            )}
            <Link to="/user" className={styles.exit}>
              Docs
            </Link>
          </div>
        </header>

        {children}
      </div>
    </>
  );
}
