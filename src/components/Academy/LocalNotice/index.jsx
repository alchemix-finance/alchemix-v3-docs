import React from "react";
import styles from "./styles.module.css";

/**
 * Shown when a checkpoint was graded in the browser rather than by the engine.
 *
 * Local grading only happens in development, and it issues a completion that no
 * server will accept. Saying so on screen prevents the obvious confusion of
 * finishing a lesson locally and expecting the reward to follow.
 */
export default function LocalNotice({ show }) {
  // `show` is only ever set by the local grader, which cannot run in a
  // production build. See devGrader.js.
  if (!show) return null;

  return (
    <div className={styles.notice}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.01" />
      </svg>
      <span>
        The season engine is not running, so this checkpoint is graded in your
        browser. A completion recorded this way earns no reward.
      </span>
    </div>
  );
}
