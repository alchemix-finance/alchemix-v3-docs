import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import AcademyShell from "../Shell";
import { hasCompletion, readCompletions } from "../lib/api";
import { currentLesson, lessonById, nextLesson, trackByKey } from "../lib/track";
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
 * in one place instead of being copied per page.
 */

/**
 * The intermediate track's stage labels. Beginner lessons pass `BEGINNER_STAGES`
 * from the kit (Learn / Try / Check), which say what the learner is about to do
 * in plainer words. The stage ids are the same in both, so a lab never needs to
 * know which track it is on.
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
  const track = trackByKey(lesson.track);
  const next = nextLesson(lessonId);
  const isBrowser = useIsBrowser();
  const [stage, setStage] = useState(STAGES[0].id);
  const [done, setDone] = useState(false);
  // Who this learner should be working instead, or null when this lesson is it.
  // Null until the effect below has read storage, which is also what renders the
  // lesson as interactive on the server and on the first client frame.
  const [ahead, setAhead] = useState(null);

  // Read after mount, never during render. These pages are prerendered at build
  // time, so localStorage does not exist when this component first runs. The
  // first frame is therefore the ordinary interactive lesson, and a preview
  // resolves a frame later rather than flashing a banner at the learner whose
  // lesson this actually is.
  useEffect(() => {
    if (!isBrowser) return;
    const completions = readCompletions();
    if (hasCompletion(lessonId)) {
      setDone(true);
      setAhead(null);
      return;
    }
    const current = currentLesson(Object.keys(completions), lessonId);
    setAhead(current && current.id !== lessonId ? current : null);
  }, [isBrowser, lessonId]);

  const preview = Boolean(ahead);

  // The wrap-up prose is where the lesson is actually written down. It shows
  // for a reader who is previewing, for a learner who has passed, and for a
  // learner who has reached the checkpoint. Gating it on a pass put the clearest
  // explanation in the academy behind the test. By the third stage every reveal
  // in the lab has been shown, so nothing here is an answer the checkpoint was
  // holding back: the questions ask what is true, and the write-up is what the
  // learner was meant to have read before being asked.
  const showNotes = preview || done || stage === STAGES[STAGES.length - 1].id;

  // How far into the lesson this learner has got, which is what the stepper
  // colours. Every stage is clickable either way: see the stepper below.
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
          <span className={styles.backLesson}>
            <span className={styles.backTrack}>{track ? track.label : "Academy"}</span>
            <span className={styles.backSep}> · </span>
            Lesson {lesson.n}
          </span>
          <span className={styles.divider} />
          <span className={styles.backTitle}>{lesson.title}</span>
        </Link>
      }
      right={
        <nav className={styles.stepper} aria-label="Lesson stages">
          {STAGES.map((s, i) => {
            // A preview shows the stages so the shape of the lesson is visible,
            // but none of them is reachable: the lab below it is inert, and a
            // stepper that still moved would be the one way around that.
            //
            // Inside a lesson the learner has actually reached, every stage is.
            // Order is enforced between lessons, where it earns its keep: a
            // checkpoint answered before its setup banks points for a lesson
            // nobody saw. Within one lesson it only taxed the people who already
            // know the material, and the checkpoint is server-graded, so passing
            // it cold demonstrates exactly what the lesson claims to teach.
            // `reached` still drives the styling, so the stepper goes on showing
            // how far in they are.
            const reachable = !preview;
            const visited = done || i <= reached;
            const state = !reachable ? "off" : s.id === stage ? "on" : visited ? "seen" : "off";
            return (
              <React.Fragment key={s.id}>
                {i > 0 ? <span className={styles.rule} /> : null}
                <button
                  type="button"
                  className={`${styles.step} ${styles[`step_${state}`]}`}
                  onClick={() => reachable && setStage(s.id)}
                  disabled={!reachable}
                  aria-current={s.id === stage && !preview ? "step" : undefined}
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
        {preview ? <PreviewBanner lesson={lesson} current={ahead} /> : null}

        {/* Two wrappers, because they do different jobs. The outer one carries
            the not-allowed cursor, which the inner one could not show once it
            stops taking pointer events. The inner one is the block itself:
            `inert` takes the subtree out of the tab order and away from
            assistive tech, and pointer-events backs it up in anything that does
            not support inert. It must be `inert={true}`, not `inert=""`: React
            treats it as a boolean prop and drops the attribute for an empty
            string, which left the lab fully clickable. */}
        <div className={preview ? styles.previewLabWrap : undefined}>
          <div
            className={preview ? styles.previewLab : undefined}
            inert={preview ? true : undefined}
          >
            <Lab
              lessonId={lessonId}
              stage={stage}
              onStage={setStage}
              done={done}
              onComplete={() => setDone(true)}
            />
          </div>
        </div>

        {showNotes ? (
          <section className={styles.wrap}>
            <h2 className={styles.wrapHead}>
              {done ? "What you just worked out" : "What this lesson covers"}
            </h2>
            {/* The write-up and the reading list share a row. Stacked, the
                list sat under a column of prose that stops well short of the
                page, so the foot of every finished lesson was half empty. */}
            <div className={styles.wrapBody}>
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
            </div>

            {done ? (
              <div className={styles.wrapActions}>
                {next ? (
                  <Link to={next.slug} className={styles.wrapNext}>
                    Next: {next.title}
                    <ArrowIcon />
                  </Link>
                ) : null}
                <Link to="/academy" className={styles.wrapBack}>
                  Back to the track
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {preview ? <PreviewFooter current={ahead} /> : null}
      </main>
    </AcademyShell>
  );
}

/**
 * Shown above a lesson the learner has reached out of order.
 *
 * It has one job beyond saying what is happening, which is to name the lesson
 * they should be on and link to it. A preview that only said "locked" would
 * leave someone who followed a link from Discord with nowhere to go.
 */
function PreviewBanner({ lesson, current }) {
  return (
    <aside className={styles.preview} aria-labelledby="preview-title">
      <div className={styles.previewBar} aria-hidden="true" />
      <div className={styles.previewBody}>
        <div className={styles.previewLabel}>
          <EyeIcon />
          Preview
        </div>
        <h2 className={styles.previewTitle} id="preview-title">
          You are reading ahead.
        </h2>
        <p className={styles.previewText}>
          Lesson {lesson.n} is yours to read: the write-up, the app screen and the reading
          list are all below. The controls stay switched off until you get here, because
          each lesson sets up the one after it and the checkpoint grades against that
          setup. Working them in order is what banks the points.
        </p>
        <div className={styles.previewActions}>
          <Link to={current.slug} className={styles.previewCta}>
            Go to lesson {current.n}: {current.title}
            <ArrowIcon />
          </Link>
          <Link to="/academy" className={styles.previewBack}>
            Back to the track
          </Link>
        </div>
      </div>
    </aside>
  );
}

/** The same pointer again at the foot of a long preview. */
function PreviewFooter({ current }) {
  return (
    <div className={styles.previewFoot}>
      <span className={styles.previewFootText}>
        That is the whole lesson. The controls switch on once you reach it:
      </span>
      <Link to={current.slug} className={styles.previewCta}>
        Lesson {current.n}: {current.title}
        <ArrowIcon />
      </Link>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
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
