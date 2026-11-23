import React from "react";
import Link from "@docusaurus/Link";
import AcademyShell from "../Shell";
import { Arrow } from "../kit";
import article from "../ArticleLesson/styles.module.css";
import tm from "@site/src/pages/academy/track.module.css";
import styles from "./styles.module.css";

/**
 * What a lesson's address, or a track's finish page, shows while its track is
 * not open (`OPEN_TRACKS` in lib/track.js): the track's name, "Coming soon",
 * and the way back to the map. The lesson itself is not rendered, so none of
 * its text is in the page.
 */
export default function TrackClosed({ track }) {
  return (
    <AcademyShell
      title={`${track.label} · Alchemix Academy`}
      description={`The Alchemix Academy's ${track.short.toLowerCase()} track is not open yet.`}
      pinned
    >
      <main className={`${article.body} ${styles.closed}`}>
        <div className={tm.microLabel}>{track.label}</div>
        <h1 className={article.title}>Coming soon</h1>
        <p className={styles.line}>This track is not open yet.</p>
        <Link to="/academy" className={tm.cta}>
          Back to the map
          <Arrow />
        </Link>
      </main>
    </AcademyShell>
  );
}
