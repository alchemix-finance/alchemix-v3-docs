import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import AcademyShell from "@site/src/components/Academy/Shell";
import PaceLab from "@site/src/components/Academy/PaceLab";
import Wrap from "@site/src/components/Academy/lessons/paceOfRepayment.mdx";
import { hasCompletion } from "@site/src/components/Academy/lib/api";
import { lessonById } from "@site/src/components/Academy/lib/track";
import styles from "./lesson.module.css";

const LESSON = lessonById("l1-pace-of-repayment");

const STAGES = [
  { id: "predict", label: "Predict" },
  { id: "explore", label: "Explore" },
  { id: "checkpoint", label: "Checkpoint" },
];

/**
 * Lesson 1.
 *
 * The page owns the stage, the header renders it as a stepper, and the lesson body
 * renders whichever stage is live. Nothing on screen competes with the current
 * stage: no sidebar, no table of contents, and one primary action at a time.
 */
export default function PaceOfRepaymentLesson() {
  const isBrowser = useIsBrowser();
  const [stage, setStage] = useState("predict");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isBrowser && hasCompletion(LESSON.id)) setDone(true);
  }, [isBrowser]);

  // Stages unlock in order on a first run, but stay open afterwards so a finished
  // lesson can be revisited without replaying it.
  const reached = done ? STAGES.length - 1 : STAGES.findIndex((s) => s.id === stage);

  return (
    <AcademyShell
      title={`${LESSON.title} · Alchemix Academy`}
      description="Work out what decides how fast an Alchemix loan clears, and what has no effect on it."
      left={
        <Link to="/academy" className={styles.back}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H6M11 18l-6-6 6-6" />
          </svg>
          <span className={styles.backLesson}>Lesson {LESSON.n}</span>
          <span className={styles.divider} />
          <span className={styles.backTitle}>{LESSON.title}</span>
        </Link>
      }
      right={
        <nav className={styles.stepper} aria-label="Lesson stages">
          {STAGES.map((s, i) => {
            const state = done || i <= reached ? (s.id === stage ? "on" : "seen") : "off";
            const reachable = done || i <= reached;
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
        <PaceLab
          lessonId={LESSON.id}
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

            <div className={styles.deeper}>
              <div className={styles.deeperLabel}>Go deeper in the docs</div>
              <ul className={styles.deeperList}>
                <li><Link to="/user/concepts/redemption-rate">Redemption Rate</Link>, including how the rate is derived</li>
                <li><Link to="/user/concepts/self-repaying-loans">Self-Repaying Loans</Link></li>
                <li><Link to="/user/concepts/transmuter">The Transmuter</Link></li>
                <li><Link to="/user/tutorials/repay-loan">Repay Your Loan</Link>, to clear a balance by hand</li>
              </ul>
            </div>
          </section>
        ) : null}
      </main>
    </AcademyShell>
  );
}
