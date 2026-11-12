import React, { useCallback, useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import AcademyShell, { MEMBERS_LIVE } from "@site/src/components/Academy/Shell";
import CourseMap from "@site/src/components/Academy/CourseMap";
import {
  apiBase, claimGraduation, clearCompletions, completeAllLocally, completionsFor,
  isLocalCompletion, readCompletions,
} from "@site/src/components/Academy/lib/api";
import {
  ALL_LESSONS, OPEN_LESSONS, TRACKS, lessonById, trackState,
} from "@site/src/components/Academy/lib/track";
import styles from "./track.module.css";

/**
 * The track map: the academy's front door.
 *
 * Three tracks on one page, beginner first. Each is a section that opens and
 * closes. With eighteen lessons in three tracks, everything open was about
 * 4,000px of list. A closed track is one row: its name, its one sentence and
 * a row of segments, one per lesson, that shows at a glance how much of it is
 * done. Every track starts closed; the hero's
 * button is the way into the next lesson.
 *
 * Progress is read from localStorage after mount. The page prerenders with zero
 * completions, then fills in.
 */

/** Which tracks are open before anyone touches them: none. */
function openFor() {
  return Object.fromEntries(TRACKS.map((t) => [t.key, false]));
}

export default function AcademyTrack() {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  const testMode = siteConfig.customFields?.academyTestMode === true;

  // Read after mount, never during render. These pages are prerendered at build
  // time, so localStorage does not exist when this component first runs.
  const [completions, setCompletions] = useState({});
  const [loaded, setLoaded] = useState(false);
  // Which tracks are open. All start closed; an address that names a track
  // opens that one once the page has mounted. `settled` holds the open and
  // close animation back until then, so that track does not slide on load.
  const [open, setOpen] = useState(openFor);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const stored = readCompletions();
    setCompletions(stored);
    setLoaded(true);
    const want = openFor();
    // An address that names a track (#track-advanced) opens it as well.
    const named = TRACKS.find((t) => t.open && window.location.hash === `#track-${t.key}`);
    if (named) want[named.key] = true;
    setOpen(want);
    const id = window.requestAnimationFrame(() => setSettled(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const completedIds = Object.keys(completions);

  const toggle = useCallback((key) => setOpen((cur) => ({ ...cur, [key]: !cur[key] })), []);
  // From the course picture's key: open the track and bring it into view.
  // The scroll is asked for twice. A closed track near the foot of the page
  // has no room under it yet, so the first scroll stops short; the second,
  // once the track has opened, carries on to its head.
  const reveal = useCallback((key) => {
    setOpen((cur) => ({ ...cur, [key]: true }));
    const el = document.getElementById(`track-${key}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = () => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    go();
    window.setTimeout(go, 400);
    window.history.replaceState(window.history.state, "", `#track-${key}`);
  }, []);

  return (
    <AcademyShell
      title="Alchemix Academy"
      description="Go from your first deposit to opening, managing and closing a loan, in lessons that take a few minutes each. Every step happens in a simulated copy of the app, so you can learn without risking real funds."
    >
      <main>
        <section className={styles.intro}>
          <div className={styles.introInner}>
            <div className={styles.introText}>
              <h1 className={styles.headline}>Learn to use Alchemix v3.</h1>
              <p className={styles.sub}>
                Go from your first deposit to opening, managing and closing a loan, in lessons that
                take a few minutes each. Every step happens in a simulated copy of the app, so you
                can learn without risking real funds.
              </p>
              <HeroStart completedIds={completedIds} loaded={loaded} />
            </div>

            <div className={styles.heroArt}>
              <CourseMap completedIds={completedIds} nextId={nextLesson(completedIds)?.id} onTrack={reveal} />
            </div>
          </div>
        </section>

        {TRACKS.map((track, i) => (
          <TrackSection
            key={track.key}
            n={i + 1}
            track={track}
            completions={completions}
            loaded={loaded}
            nextId={nextLesson(completedIds)?.id}
            base={base}
            open={Boolean(open[track.key])}
            settled={settled}
            onToggle={() => toggle(track.key)}
          />
        ))}

        <ProgressNote
          started={loaded && completedIds.length > 0}
          finished={loaded && OPEN_LESSONS.every((l) => Boolean(completions[l.id]))}
          localOnly={
            completedIds.length > 0 && completedIds.every((id) => isLocalCompletion(completions[id]))
          }
          onReset={() => {
            clearCompletions();
            setCompletions({});
            setOpen(openFor());
          }}
          testMode={testMode}
          onFinish={() => {
            completeAllLocally(OPEN_LESSONS.map((l) => l.id), { testMode });
            setCompletions(readCompletions());
          }}
        />
      </main>
    </AcademyShell>
  );
}

/**
 * The hero's one button, into the lesson this learner is on across every
 * track, and beside it that lesson named by its track, number and title.
 *
 * The button used to carry the whole line ("Continue with intermediate
 * lesson 4: What a loan costs, and how to recover the discount"), which ran
 * to two lines on the longer titles, too much for one button. It now reads
 * Start the course or Continue, and the lesson
 * sits beside it in the same label the course picture shows on hover: its
 * track and number on a small line, its title under it, held to two lines.
 *
 * The row keeps one height whatever it holds, and stays transparent until
 * progress is read, so nothing below it moves when a returning learner's
 * lesson replaces the first one. Once every lesson is passed there is nothing
 * to start, and the row says so in the same space.
 */
function HeroStart({ completedIds, loaded }) {
  const lesson = nextLesson(completedIds);
  const shown = loaded ? "" : styles.heroActionsWaiting;
  if (!lesson) {
    // While only some tracks are open, the line names what was passed: the
    // one open track, or "every open lesson" when there are several.
    const open = TRACKS.filter((t) => t.open);
    const what =
      open.length === TRACKS.length
        ? "every lesson in the Academy"
        : open.length === 1
          ? `every lesson in the ${open[0].short.toLowerCase()} track`
          : "every open lesson";
    return (
      <div className={`${styles.heroActions} ${shown}`}>
        <span className={styles.heroDone}>
          <CheckIcon />
          You passed {what}.
        </span>
      </div>
    );
  }
  return (
    <div className={`${styles.heroActions} ${shown}`}>
      <Link to={lesson.slug} className={`${styles.cta} ${styles.heroCta}`} aria-describedby="academy-next-lesson">
        {completedIds.length ? "Continue" : "Start the course"}
        <ArrowIcon />
      </Link>
      <HeroNext lesson={lesson} />
    </div>
  );
}

/**
 * The lesson the button opens, on one line beside it: the course picture's
 * own mark for "next" (a copper ring), the lesson's place, its title.
 *
 * It was two lines of type, the track and "Lesson 1 of 8" over the title.
 * The same context is now carried by a mark. The ring is the one drawn round the
 * next lesson's point in the picture and on its segment in the track's row,
 * so the three name the same lesson with one mark, and the label is one
 * line.
 */
function HeroNext({ lesson }) {
  const track = TRACKS.find((t) => t.key === lesson.track);
  return (
    <span id="academy-next-lesson" className={styles.heroNext}>
      <svg className={styles.heroNextMark} viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5" />
      </svg>
      <span className={styles.heroNextPlace}>
        {track ? `${track.short} · ` : ""}Lesson {lesson.n}
      </span>
      <span className={styles.heroNextTitle}>{lesson.title}</span>
    </span>
  );
}

/** The lesson this learner is on, across every open track: the hero's button and the copper point in the course picture. */
function nextLesson(completedIds) {
  const done = new Set(completedIds);
  return ALL_LESSONS.find((l) => l.ready && !done.has(l.id)) ?? null;
}

/** Dots where a section's rule meets the frame's side hairlines. */
function Nodes() {
  return (
    <>
      <span className={`${styles.frameNode} ${styles.nodeTL}`} aria-hidden="true" />
      <span className={`${styles.frameNode} ${styles.nodeTR}`} aria-hidden="true" />
    </>
  );
}

/**
 * Where the learner stands on a track, drawn: one segment per lesson, green
 * once passed and copper for the lesson the hero's button opens, with a check
 * after the last segment when the whole track is passed. It replaced a count,
 * a bar and the track's total minutes, which crowded the navigation.
 *
 * The hero carried a line on the Discord role each track earns until
 * 2026-11-09. The role is now named
 * only in a finished track's panel.
 */
function Segments({ lessons, nextId, complete, label }) {
  const done = lessons.filter((l) => l.state === "done").length;
  return (
    <span
      className={styles.segments}
      role="img"
      aria-label={complete ? `${label}: complete` : `${label}: ${done} of ${lessons.length} lessons complete`}
    >
      {lessons.map((l) => (
        <span
          key={l.id}
          className={`${styles.segment} ${l.state === "done" ? styles.segmentDone : l.id === nextId ? styles.segmentNext : ""}`}
        />
      ))}
      <span className={`${styles.segmentsCheck} ${complete ? styles.segmentsCheckOn : ""}`} aria-hidden="true">
        <CheckIcon />
      </span>
    </span>
  );
}

/**
 * Where progress lives, and how to be rid of it.
 *
 * Two facts nothing on the page stated. Completions sit in this browser, so a
 * learner who opens the Academy on another device finds an empty map and no
 * explanation. And there was no way to clear them short of devtools, which made
 * the course impossible to retake and awkward to demonstrate at a community call.
 *
 * The confirm is not politeness. These receipts are the only proof of lessons
 * that have not been claimed, and deleting them deletes that proof. Receipts
 * that are all local prove nothing, so deleting those skips it.
 *
 * In development a second control sits beside it and marks every lesson
 * complete with the same unsigned `local:` receipts the dev grader issues.
 * Showing someone the finished map used to mean working thirteen checkpoints
 * first. The two controls swap the map between empty and finished in one
 * click each. The control is compiled out of production unless the build set
 * `customFields.academyTestMode`, which the share link does for testing:
 * see the note on it.
 */
function ProgressNote({ started, finished, localOnly, testMode, onReset, onFinish }) {
  const [asking, setAsking] = useState(false);

  return (
    <section className={styles.progressNote}>
      <div className={styles.progressNoteInner}>
      <Nodes />
      <p className={styles.progressNoteText}>
        Your progress is stored in this browser. Open the Academy on another device and it
        starts from zero, and clearing your site data clears your completions with it.
      </p>

      {started ? (
        asking ? (
          <div className={styles.resetAsk} role="alertdialog" aria-label="Delete your progress">
            <span className={styles.resetWarn}>
              This deletes every completion, including any you have not claimed a role with
              yet, and nothing restores them.
            </span>
            <span className={styles.resetButtons}>
              <button type="button" className={styles.resetGo} onClick={onReset}>
                Delete it
              </button>
              <button type="button" className={styles.resetKeep} onClick={() => setAsking(false)}>
                Keep it
              </button>
            </span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.resetLink}
            onClick={() => (localOnly ? onReset() : setAsking(true))}
          >
            Start over
          </button>
        )
      ) : null}

      {/* Written against `process.env` inline rather than through
          `devFallbackEnabled` or a module constant: the build replaces the
          expression with a literal right here and drops the branch, so the
          control and its label are absent from the production bundle. A call
          into another module, or a constant one line up, survived minification
          and only answered false at runtime. A test-mode build keeps it on
          purpose, from `customFields.academyTestMode`. */}
      {(process.env.NODE_ENV !== "production" || testMode) && !finished ? (
        <button
          type="button"
          className={`${styles.resetLink} ${styles.testLink}`}
          onClick={onFinish}
          title="For testing. Marks every lesson complete with an unsigned local receipt."
        >
          Test mode: finish every lesson
        </button>
      ) : null}
      </div>
    </section>
  );
}

/**
 * One track, as a section that opens and closes.
 *
 * Its head is always on the page: the number and name, the track's one
 * sentence, and its segments. The head is the button. Under it, the lessons,
 * and above them the Track complete panel once every lesson is passed.
 *
 * The lessons stay in the page when the track is closed (collapsed to no
 * height and `inert`, so nothing in them takes focus), which keeps every
 * lesson link in the prerendered page and lets the section slide open.
 */
function TrackSection({ n, track, completions, loaded, nextId, base, open, settled, onToggle }) {
  const completedIds = Object.keys(completions);
  const lessons = trackState(completedIds, track.lessons);
  const doneCount = lessons.filter((l) => l.state === "done").length;
  const complete = loaded && doneCount === lessons.length;
  const sectionId = `track-${track.key}`;
  const bodyId = `${sectionId}-lessons`;

  // A track that is not open yet (OPEN_TRACKS in lib/track.js): its name and
  // its one sentence, greyed out, with "Coming soon" where an open track
  // draws its progress. It does not open, and its lessons are not listed.
  if (!track.open) {
    return (
      <section id={sectionId} className={`${styles.trackSection} ${styles.trackClosed}`}>
        <div className={styles.inner}>
          <Nodes />
          <h2 className={styles.trackHeading}>
            <span className={`${styles.trackToggle} ${styles.trackStatic}`}>
              <span className={styles.trackTitle}>
                <span className={styles.label}>
                  <span className={styles.labelNum} aria-hidden="true">{String(n).padStart(2, "0")}</span>
                  <span>{track.label}</span>
                </span>
                <span className={styles.trackIntro}>{track.intro}</span>
              </span>
              <span className={styles.trackMeta}>
                <span className={styles.soon}>Coming soon</span>
              </span>
            </span>
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      className={`${styles.trackSection} ${open ? styles.trackOpen : ""} ${settled ? styles.trackSettled : ""}`}
    >
      <div className={styles.inner}>
      <Nodes />
      <h2 className={styles.trackHeading}>
        <button
          type="button"
          className={styles.trackToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <span className={styles.trackTitle}>
            <span className={styles.label}>
              <span className={styles.labelNum} aria-hidden="true">{String(n).padStart(2, "0")}</span>
              <span>{track.label}</span>
            </span>
            <span className={styles.trackIntro}>{track.intro}</span>
          </span>

          <span className={styles.trackMeta}>
            <Segments lessons={lessons} nextId={nextId} complete={complete} label={track.label} />
          </span>

          <span className={styles.chevron} aria-hidden="true">
            <ChevronIcon />
          </span>
        </button>
      </h2>

      <div id={bodyId} className={styles.trackBody} inert={open ? undefined : true}>
        <div className={styles.trackBodyInner}>
          <div className={styles.trackContent}>
            {complete ? (
              <GraduationPanel track={track} completions={completions} base={base} />
            ) : null}

            <div className={styles.track}>
              {lessons.map((lesson, i) => (
                <TrackRow
                  key={lesson.id}
                  lesson={lesson}
                  before={lessons[i - 1]?.state}
                  last={i === lessons.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/**
 * Whether the role claim is live. Off since 2026-10-15: the engine verifies a
 * claim, but nothing links Discord yet, so an eligible learner was told
 * "Linking Discord is the next step" with nothing to press. Until then it is
 * marked coming soon. Flip this when the Discord link ships.
 */
const CLAIM_OPEN = false;

/**
 * Shown once every lesson in a track is done, above the track's lessons.
 *
 * The claim is a verification call: the engine checks the stored tokens against
 * the track and answers whether the set is complete. It grants nothing on its
 * own; the Discord link is what turns an eligible claim into the role. Until the
 * engine deploys the endpoint it answers 404, which lands in `notOpen` here.
 *
 * A track with no role decided (`roleLine` null, the advanced track) names
 * none and offers no claim.
 */
function GraduationPanel({ track, completions, base }) {
  const ids = track.lessons.map((l) => l.id);
  const tokens = ids.map((id) => completions[id]).filter(Boolean);
  const localOnly = tokens.length > 0 && tokens.every(isLocalCompletion);
  const [claim, setClaim] = useState({ status: "idle" });

  async function onClaim() {
    setClaim({ status: "loading" });
    try {
      const res = await claimGraduation(base, {
        track: track.key,
        completions: completionsFor(ids),
      });
      if (res.notOpen) {
        setClaim({ status: "notOpen" });
      } else if (res.eligible) {
        setClaim({ status: "eligible" });
      } else {
        setClaim({ status: "ineligible", missing: Array.isArray(res.missing) ? res.missing : [] });
      }
    } catch (e) {
      setClaim({
        status: "error",
        message: e?.message || "The Academy could not be reached.",
      });
    }
  }

  const { status } = claim;
  const busy = status === "loading";
  const settled = status === "eligible" || status === "notOpen";

  const finish = track.finish ? (
    <Link to={track.finish} className={styles.finishLink}>
      What you did on this track
      <ArrowIcon />
    </Link>
  ) : null;

  if (!CLAIM_OPEN || !track.roleLine) {
    return (
      <section className={`${styles.graduate} ${styles.graduateBand}`}>
        <div className={styles.graduateText}>
          <div className={styles.microLabel}>Track complete</div>
          <div className={styles.graduateTitle}>You passed every lesson.</div>
          {track.roleLine ? (
            <div className={styles.graduateMeta}>
              <span className={styles.graduateRole}>{track.roleLine}</span>
            </div>
          ) : null}
          {/* Once members is live, the claim is made there: it reads the
              completions this browser holds, so the link opens in this tab. */}
          {!track.roleLine ? (
            <p className={styles.graduateBody}>Your completions are saved in this browser.</p>
          ) : MEMBERS_LIVE && !localOnly ? (
            <p className={styles.graduateBody}>Claim it from this browser, where your completions are saved.</p>
          ) : (
            <p className={styles.graduateBody}>
              Role claims open soon. Your completions stay saved in this browser until then.
            </p>
          )}
        </div>
        <div className={styles.graduateActions}>
          {track.roleLine && MEMBERS_LIVE && !localOnly ? (
            <Link to="/members" className={styles.cta}>
              Open the members area
              <ArrowIcon />
            </Link>
          ) : null}
          {finish}
        </div>
      </section>
    );
  }

  let body;
  let tone = "";
  if (localOnly) {
    body =
      "These completions were marked in the browser, for testing, not graded by the Academy. They carry no signature, so there is nothing to claim.";
    tone = styles.statusWarn;
  } else if (status === "loading") {
    body = "The Academy is checking your completions.";
  } else if (status === "notOpen") {
    body =
      "The claim opens with the Discord link. Your completions stay saved in this browser until then.";
    tone = styles.statusWarn;
  } else if (status === "eligible") {
    body =
      "The Academy verified every completion on this track. Linking Discord is the next step.";
    tone = styles.statusOk;
  } else if (status === "ineligible") {
    body = "The Academy could not verify every completion. Redo the lessons below, then check again.";
    tone = styles.statusErr;
  } else if (status === "error") {
    body = claim.message;
    tone = styles.statusErr;
  } else {
    body = "Claiming sends the completions stored in this browser to the Academy for verification.";
  }

  let buttonLabel = "Claim your role";
  if (busy) buttonLabel = "Checking";
  else if (status === "error") buttonLabel = "Try again";
  else if (status === "ineligible") buttonLabel = "Check again";

  return (
    <section className={`${styles.graduate} ${styles.graduateBand}`}>
      <div className={styles.graduateText}>
        <div className={styles.microLabel}>Track complete</div>
        <div className={styles.graduateTitle}>You passed every lesson.</div>
        <div className={styles.graduateMeta}>
          <span className={styles.graduateRole}>{track.roleLine}</span>
        </div>

        <p className={`${styles.graduateBody} ${tone}`} aria-live="polite">{body}</p>

        {status === "ineligible" && claim.missing.length ? (
          <ul className={styles.missingList}>
            {claim.missing.map((id) => (
              <li key={id}>{lessonById(id)?.title ?? id}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.graduateActions}>
        <button
          type="button"
          className={`${styles.cta} ${styles.claim}`}
          onClick={onClaim}
          disabled={localOnly || busy || settled}
        >
          {buttonLabel}
          {!busy && !settled ? <ArrowIcon /> : null}
        </button>
        {finish}
      </div>
    </section>
  );
}

/**
 * The app screen a lesson is about, written the way the app's navigation
 * writes it. Every lesson names one today; a lesson without a screen of its
 * own would carry none, and this renders nothing rather than guessing at one.
 */
function Surface({ lesson }) {
  if (!lesson.app) return null;
  return <>· <span className={styles.surface}>{lesson.app}</span> </>;
}

/**
 * One lesson on a track's rail: what it is on the left, how long it takes and
 * the way in on the right (under 700px the two stack).
 *
 * The rail's circle stands on the content's left edge, under the track's
 * name, and is centered on the lesson's title: the stretch of line above it
 * (`lead`) is as long as it takes to get there, and carries on the line from
 * the lesson before (`before` is that lesson's state).
 */
function TrackRow({ lesson, before, last }) {
  const { state } = lesson;

  return (
    <div className={`${styles.row} ${state === "current" ? styles.rowCurrent : ""}`}>
      <div className={styles.rail}>
        <span className={`${styles.lead} ${before ? styles[`line_${before}`] : ""}`} />
        <span className={`${styles.node} ${styles[`node_${state}`]}`}>
          {state === "done" ? <CheckIcon /> : null}
          {state === "current" ? <span className={styles.dot} /> : null}
          {state === "ahead" ? <EyeIcon /> : null}
        </span>
        {!last ? <span className={`${styles.line} ${styles[`line_${state}`]}`} /> : null}
      </div>

      <div className={`${styles.body} ${last ? styles.bodyLast : ""}`}>
        {state === "current" ? (
          <CurrentCard lesson={lesson} />
        ) : state === "done" ? (
          // A finished lesson stays open for rereading. Revisiting never clears
          // the stored completion; the lesson page opens with every stage unlocked.
          <Link to={lesson.slug} className={`${styles.rowLink} ${styles.doneLink}`}>
            <span className={styles.rowText}>
              <span className={`${styles.microLabel} ${styles.doneLabel}`}>
                Lesson {lesson.n} <Surface lesson={lesson} /> · Complete
              </span>
              <span className={styles.rowTitle}>{lesson.title}</span>
              <span className={styles.rowBlurb}>{lesson.blurb}</span>
            </span>
            <span className={styles.rowMeta}>
              <span className={styles.minutes}>{lesson.minutes} min</span>
              <span className={styles.revisit}>
                Revisit lesson
                <ArrowIcon />
              </span>
            </span>
          </Link>
        ) : (
          // Readable, not workable. Someone who arrived from a link should be
          // able to see what the course covers before committing to it, and the
          // lesson page says plainly that a preview does not respond.
          <Link to={lesson.slug} className={`${styles.rowLink} ${styles.aheadLink}`}>
            <span className={styles.rowText}>
              <span className={styles.microLabel}>
                Lesson {lesson.n} <Surface lesson={lesson} />
              </span>
              <span className={styles.rowTitle}>{lesson.title}</span>
              <span className={styles.rowBlurb}>{lesson.blurb}</span>
            </span>
            <span className={styles.rowMeta}>
              <span className={styles.minutes}>{lesson.minutes} min</span>
              <span className={styles.peek}>
                Read ahead
                <ArrowIcon />
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

function CurrentCard({ lesson }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardText}>
        <div className={`${styles.microLabel} ${styles.currentLabel}`}>
          Lesson {lesson.n} <Surface lesson={lesson} />
        </div>
        <div className={styles.cardTitle}>{lesson.title}</div>
        <p className={styles.cardBlurb}>{lesson.blurb}</p>
      </div>

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

/* ── Icons. Drawn, never emoji, so they scale and recolor. ── */

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5ba88a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5 L9.5 18 L20 6.5" />
    </svg>
  );
}

/* Replaced the padlock. Nothing here is locked any more: an unfinished lesson
   can be read, it just cannot be worked. */
function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
