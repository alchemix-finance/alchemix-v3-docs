import React, { useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import AcademyShell from "../Shell";
import { LessonProvider } from "../kit";
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
 * The stage labels, the same on both tracks: Learn, Try, Check (the kit's
 * `BEGINNER_STAGES`, which beginner pages pass by name). The intermediate
 * track said Predict, Explore, Checkpoint until 2026-11-03. The ids
 * stay, because the engine and the labs key on them; the address follows the
 * label (#try, #check). Lesson 1 passes its own two.
 */
const DEFAULT_STAGES = [
  { id: "predict", label: "Learn" },
  { id: "explore", label: "Try" },
  { id: "checkpoint", label: "Check" },
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
    const finished = hasCompletion(lessonId);
    if (finished) setDone(true);
    const current = finished ? null : currentLesson(Object.keys(completions), lessonId);
    const reading = current && current.id !== lessonId ? current : null;
    setAhead(reading);
    // A reload keeps the stage. It sent everyone back to stage 1, wherever
    // they were. A preview stays on the first stage,
    // since none of its stages is reachable.
    if (!reading) {
      const fromHash = stageFromHash(window.location.hash, STAGES);
      if (fromHash) setStage(fromHash);
    }
  }, [isBrowser, lessonId]);

  // The stage is written into the address as #try or #check, so the reload
  // above can find it. Stage 1 keeps the plain address. replaceState rather
  // than the router, which would treat the hash as an anchor to scroll to.
  const firstWrite = useRef(true);
  useEffect(() => {
    if (firstWrite.current) {
      firstWrite.current = false;
      return;
    }
    const { pathname, search } = window.location;
    const hash = stage === STAGES[0].id ? "" : `#${hashOf(stage, STAGES)}`;
    window.history.replaceState(window.history.state, "", `${pathname}${search}${hash}`);
  }, [stage]);

  const preview = Boolean(ahead);

  // Each stage starts at the top of the page. The stages replace one another
  // in place, so a learner who pressed "Next: Check" at the foot of a long
  // Try stage was left at the foot of the checkpoint, with its question out of
  // view above them. The first render is left alone, so a reload keeps the
  // position the browser restored.
  const firstStage = useRef(true);
  useEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [stage]);

  // The recap shows once the learner has passed, and to a reader previewing a
  // lesson they cannot answer yet (the preview banner promises it). It used to
  // show on the checkpoint stage too, as the lesson written down before the
  // test. With each recap one bullet per thing the
  // checkpoint asks, it sat under the questions reading like their answers.
  const showNotes = preview || done;

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
            const state = !reachable ? "off" : s.id === stage ? "on" : visited ? "seen" : "ahead";
            return (
              <React.Fragment key={s.id}>
                {i > 0 ? <span className={styles.rule} /> : null}
                <button
                  type="button"
                  className={`${styles.step} ${styles[`step_${state}`]}`}
                  onClick={() => reachable && setStage(s.id)}
                  disabled={!reachable}
                  title={reachable && s.id !== stage ? `Go to stage ${i + 1}, ${s.label}` : undefined}
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
            {/* Tells each Term in the lab which lesson it is read in. */}
            <LessonProvider value={lessonId}>
              <Lab
                lessonId={lessonId}
                stage={stage}
                onStage={setStage}
                done={done}
                onComplete={() => setDone(true)}
              />
            </LessonProvider>
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
                        <Link to={d.to} target="_blank" rel="noopener noreferrer">{d.label}</Link>
                        {d.note ? `, ${d.note}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* On the last lesson there is no next one. A track with a finish
                page (track.js `finish`) goes there, as the beginner track's
                last lesson does; otherwise the way back takes the button. As
                a text link it was the one lesson that ended with nothing to
                press. */}
            {done ? (
              <div className={styles.wrapActions}>
                {next ? (
                  <>
                    <Link to={next.slug} className={styles.wrapNext}>
                      Next: {next.title}
                      <ArrowIcon />
                    </Link>
                    <Link to="/academy" className={styles.wrapBack}>
                      Back to the track
                    </Link>
                  </>
                ) : track?.finish ? (
                  <>
                    <Link to={track.finish} className={styles.wrapNext}>
                      Finish the track
                      <ArrowIcon />
                    </Link>
                    <Link to="/academy" className={styles.wrapBack}>
                      Back to the track
                    </Link>
                  </>
                ) : (
                  <Link to="/academy" className={styles.wrapNext}>
                    Back to the track
                    <ArrowIcon />
                  </Link>
                )}
              </div>
            ) : null}
          </section>
        ) : null}

        {preview ? <PreviewFooter current={ahead} /> : null}
      </main>
    </AcademyShell>
  );
}

/** A stage's place in the address: its label, lowercased ("try", "check"). */
function hashOf(id, stages) {
  const s = stages.find((x) => x.id === id);
  return s ? s.label.toLowerCase() : "";
}

/* The id is accepted too, so an address saved under the intermediate track's
   old labels (#explore, #checkpoint) still opens its stage. */
function stageFromHash(hash, stages) {
  const want = decodeURIComponent(String(hash).replace(/^#/, "")).toLowerCase();
  const s = want ? stages.find((x) => x.label.toLowerCase() === want || x.id === want) : null;
  return s ? s.id : null;
}

/**
 * Shown above a lesson the learner has reached out of order.
 *
 * It has one job beyond saying what is happening, which is to name the lesson
 * they should be on and link to it. A preview that only said "locked" would
 * leave someone who followed a link from Discord with nowhere to go.
 */
export function PreviewBanner({ lesson, current }) {
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
          Lesson {lesson.n} is yours to read: the write-up and the reading list are below.
          The controls stay switched off until you get here, because each lesson sets up
          the one after it and the check grades against that setup.
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
export function PreviewFooter({ current }) {
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

export function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
