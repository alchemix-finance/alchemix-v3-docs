import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import AcademyShell from "../Shell";
import { hasCompletion } from "../lib/api";
import { lessonById } from "../lib/track";
import styles from "./styles.module.css";

/**
 * The shell every lesson shares.
 *
 * The page owns the stage, the header renders it as a stepper, and the lab
 * renders whichever stage is live. Nothing on screen competes with the current
 * stage: no sidebar, no table of contents, and one primary action at a time.
 *
 * A lesson supplies its own lab, its own wrap-up prose, and its own reading list.
 * Everything else here is identical from lesson to lesson, which is why it lives
 * in one place rather than being copied per page.
 */

/**
 * The advanced track's shape. The beginner lessons pass their own labels, which
 * say what the learner is about to do in plainer words.
 */
const DEFAULT_STAGES = [
  { id: "predict", label: "Predict" },
  { id: "explore", label: "Explore" },
  { id: "checkpoint", label: "Checkpoint" },
];

export default function LessonPage({
  lessonId,
  description,
  Lab,
  Wrap,
  deeper = [],
  stages: STAGES = DEFAULT_STAGES,
}) {
  const lesson = lessonById(lessonId);
  const isBrowser = useIsBrowser();
  const [stage, setStage] = useState(STAGES[0].id);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isBrowser && hasCompletion(lessonId)) setDone(true);
  }, [isBrowser, lessonId]);

  // Stages unlock in order on a first run, but stay open afterwards so a finished
  // lesson can be revisited without replaying it.
  const reached = done ? STAGES.length - 1 : STAGES.findIndex((s) => s.id === stage);

  return (
    <AcademyShell
      title={`${lesson.title} · Alchemix Academy`}
      description={description}
      left={
        <Link to="/academy" className={styles.back}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H6M11 18l-6-6 6-6" />
          </svg>
          <span className={styles.backLesson}>Lesson {lesson.n}</span>
          <span className={styles.divider} />
          <span className={styles.backTitle}>{lesson.title}</span>
        </Link>
      }
      right={
        <nav className={styles.stepper} aria-label="Lesson stages">
          {STAGES.map((s, i) => {
            const reachable = done || i <= reached;
            const state = reachable ? (s.id === stage ? "on" : "seen") : "off";
            return (
              <React.Fragment key={s.id}>
                {i > 0 ? <span className={styles.rule} /> : null}
                <button
                  type="button"
                  className={`${styles.step} ${styles[`step_${state}`]}`}
                  onClick={() => reachable && setStage(s.id)}
                  disabled={!reachable}
                  aria-current={s.id === stage ? "step" : undefined}
                >
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      }
    >
      <main className={styles.body}>
        <Lab
          lessonId={lessonId}
          stage={stage}
          onStage={setStage}
          done={done}
          onComplete={() => setDone(true)}
        />

        {done ? (
          <section className={styles.wrap}>
            <h2 className={styles.wrapHead}>What you just worked out</h2>
            <div className={styles.prose}>
              <Wrap />
            </div>

            {deeper.length ? (
              <div className={styles.deeper}>
                <div className={styles.deeperLabel}>Go deeper in the docs</div>
                <ul className={styles.deeperList}>
                  {deeper.map((d) => (
                    <li key={d.to}>
                      <Link to={d.to}>{d.label}</Link>
                      {d.note ? `, ${d.note}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </AcademyShell>
  );
}
