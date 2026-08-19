import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import AcademyShell from "@site/src/components/Academy/Shell";
import { readCompletions } from "@site/src/components/Academy/lib/api";
import { ADVANCED, BEGINNER, TOTAL_POINTS, trackState } from "@site/src/components/Academy/lib/track";
import styles from "./track.module.css";

/**
 * The track map: the academy's front door.
 *
 * The state on this page is the point. One lesson is live and carries the only
 * primary action on the screen; everything else is finished or waiting. A reader
 * should never have to work out what to do next, which is exactly what a
 * documentation sidebar makes them do.
 */
export default function AcademyTrack() {
  // Read after mount, never during render. These pages are prerendered at build
  // time, so localStorage does not exist when this component first runs.
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    setCompleted(Object.keys(readCompletions()));
  }, []);

  const lessons = trackState(completed, BEGINNER);
  const doneCount = lessons.filter((l) => l.state === "done").length;

  return (
    <AcademyShell
      title="Alchemix Academy"
      description="Learn how Alchemix works by using it. Seven short lessons, no wallet, no sign-in, and no prior experience assumed."
    >
      <section className={styles.intro}>
        <div className={styles.eyebrow}>Beginner track</div>
        <h1 className={styles.headline}>Learn how Alchemix works by using it.</h1>
        <p className={styles.sub}>
          Seven short lessons covering everything you need to use Alchemix: what it does,
          what happens to your deposit, how borrowing works, and what can go wrong. Each
          one gives you something to try before it tells you the answer.
        </p>
        <p className={styles.sub}>
          No wallet, no sign-in, and nothing to install. No prior experience with DeFi is
          assumed.
        </p>
      </section>

      <section className={styles.track}>
        {lessons.map((lesson, i) => (
          <TrackRow key={lesson.id} lesson={lesson} last={i === lessons.length - 1} />
        ))}
      </section>

      <section className={styles.next}>
        <div className={styles.nextHead}>
          <div className={styles.eyebrow}>Advanced track</div>
          <p className={styles.nextSub}>
            Coming after this one, for anyone who wants the arithmetic underneath. Not
            needed to use Alchemix, and not required to graduate.
          </p>
        </div>
        <ul className={styles.nextList}>
          {ADVANCED.map((lesson) => (
            <li key={lesson.id}>
              <span className={styles.nextTitle}>{lesson.title}</span>
              <span className={styles.nextBlurb}>{lesson.blurb}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.reward}>
        <div className={styles.rewardCard}>
          <div className={styles.microLabel}>On finishing the track</div>
          <div className={styles.rewardTitle}>A Discord role, and a place in the founding class</div>
          <p className={styles.rewardBody}>
            The founding class role is available only before season one opens. Once the
            season begins it can no longer be earned.
          </p>
        </div>
        <div className={styles.rewardCard}>
          <div className={styles.microLabel}>Banked for season one</div>
          <div className={styles.pointsRow}>
            <span className={styles.points}>{doneCount * 100}</span>
            <span className={styles.pointsOf}>of {TOTAL_POINTS} points</span>
          </div>
          <p className={styles.rewardBody}>
            Lesson points convert to season points when season one opens, so graduates
            begin the season with a balance already banked.
          </p>
        </div>
      </section>
    </AcademyShell>
  );
}

function TrackRow({ lesson, last }) {
  const { state } = lesson;

  return (
    <div className={styles.row}>
      <div className={styles.rail}>
        <span className={`${styles.node} ${styles[`node_${state}`]}`}>
          {state === "done" ? <CheckIcon /> : null}
          {state === "current" ? <span className={styles.dot} /> : null}
          {state === "locked" ? <LockIcon /> : null}
        </span>
        {!last ? <span className={`${styles.line} ${styles[`line_${state}`]}`} /> : null}
      </div>

      <div className={`${styles.body} ${last ? styles.bodyLast : ""}`}>
        {state === "current" ? (
          <CurrentCard lesson={lesson} />
        ) : (
          <div className={state === "locked" ? styles.muted : undefined}>
            <div className={`${styles.microLabel} ${state === "done" ? styles.doneLabel : ""}`}>
              Lesson {lesson.n}
              {state === "done" ? " · Complete" : ""}
            </div>
            <div className={styles.rowTitle}>{lesson.title}</div>
            <div className={styles.rowBlurb}>{lesson.blurb}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CurrentCard({ lesson }) {
  return (
    <div className={styles.card}>
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />

      <div className={`${styles.microLabel} ${styles.currentLabel}`}>
        Lesson {lesson.n} · Up next
      </div>
      <div className={styles.cardTitle}>{lesson.title}</div>
      <p className={styles.cardBlurb}>{lesson.blurb}</p>

      <div className={styles.cardActions}>
        <Link to={lesson.slug} className={styles.cta}>
          Start lesson
          <ArrowIcon />
        </Link>
        <span className={styles.minutes}>About {lesson.minutes} minutes</span>
      </div>
    </div>
  );
}

/* ── Icons. Drawn, never emoji, so they scale and recolour. ── */

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5ba88a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5 L9.5 18 L20 6.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="10.5" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
