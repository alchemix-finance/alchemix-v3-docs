import React, { useEffect, useState } from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import { AcademyLogo, AcademyMark } from "../Logo";
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
 *
 * The header leads with the Academy lockup on every page. On the track map it
 * is the whole left side; on a lesson page `left` follows it, and below 1280px
 * the lockup gives way to the mark so the breadcrumb, the stepper and the docs
 * link still share one row.
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
          <div className={`${styles.headerInner} ${left ? styles.withCrumb : ""}`}>
            <div className={styles.headerLeft}>
              <Link to="/academy" className={styles.brand} aria-label="Alchemix Academy">
                <AcademyLogo className={styles.lockup} />
                <AcademyMark className={styles.mark} />
              </Link>
              {left}
            </div>

            <div className={styles.headerRight}>
              {right ?? (
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
              )}
              <Link to="/user" className={styles.exit}>
                Docs
              </Link>
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}
