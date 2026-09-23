import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import AcademyShell from "@site/src/components/Academy/Shell";
import TrackLoop from "@site/src/components/Academy/TrackLoop";
import {
  apiBase, claimGraduation, clearCompletions, completeAllLocally, completionsFor,
  isLocalCompletion, readCompletions,
} from "@site/src/components/Academy/lib/api";
import {
  ALL_LESSONS, BEGINNER_BONUS, INTERMEDIATE_BONUS, LESSON_POINTS, TOTAL_POINTS, TRACKS,
  lessonById, trackBankedPoints, trackState, trackTotalPoints,
} from "@site/src/components/Academy/lib/track";
import styles from "./track.module.css";

/**
 * The track map: the academy's front door.
 *
 * Two tracks on one page, beginner first. Each has its own rail, and in each
 * rail one lesson is live and carries the primary action; everything else is
 * finished or waiting. A reader never has to work out what to do next.
 *
 * Progress is read from localStorage after mount. The page prerenders with zero
 * completions, then fills in.
 */

const INTRO = {
  beginner:
    "Deposit USDC or ETH and it starts earning. Borrow up to 90% of it as alUSD or alETH and sell that for cash. Redemptions then pay the balance down out of your own collateral, and the rest of it keeps earning. A price crash cannot liquidate you. When you want the deposit back, repay and withdraw.",
  intermediate:
    "Underneath the loan sit a discount on alUSD that borrowers and savers both buy, a Transmuter queue that sets one redemption rate for every loan in the market, and a vault with hard caps on the risk it can hold. Start with the beginner track if you have not borrowed before.",
};

const fmt = (n) => n.toLocaleString("en-US");


export default function AcademyTrack() {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  const testMode = siteConfig.customFields?.academyTestMode === true;

  // Read after mount, never during render. These pages are prerendered at build
  // time, so localStorage does not exist when this component first runs.
  const [completions, setCompletions] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCompletions(readCompletions());
    setLoaded(true);
  }, []);

  const completedIds = Object.keys(completions);
  const banked = TRACKS.reduce((sum, t) => sum + trackBankedPoints(t, completedIds), 0);

  return (
    <AcademyShell
      title="Alchemix Academy"
      description="Learn how Alchemix works by using it. The beginner track follows one position from the deposit through the loan that repays itself. The intermediate track covers the mechanics underneath it. Every lesson runs in the browser, with no wallet to connect."
    >
      <main>
        <section className={styles.intro}>
          <div className={styles.introText}>
            <h1 className={styles.headline}>Learn how Alchemix works by using it.</h1>
            <p className={styles.sub}>
              On most lending platforms your collateral sits idle while you pay interest on
              the loan. In Alchemix the collateral keeps earning, and redemptions clear the debt
              for you.
            </p>
            <p className={styles.sub}>
              Every lesson runs in the browser, with no wallet to connect. The beginner track
              starts from scratch and the intermediate track picks up where it ends. Read any
              lesson you like. The checkpoints open in order.
            </p>
          </div>

          <RewardCard completedIds={completedIds} banked={banked} />
        </section>

        <section className={styles.loopSection}>
          <TrackLoop completedIds={completedIds} />
        </section>

        {TRACKS.map((track) => (
          <TrackSection
            key={track.key}
            track={track}
            completions={completions}
            loaded={loaded}
            base={base}
          />
        ))}

        <ProgressNote
          started={loaded && completedIds.length > 0}
          finished={loaded && ALL_LESSONS.every((l) => Boolean(completions[l.id]))}
          localOnly={
            completedIds.length > 0 && completedIds.every((id) => isLocalCompletion(completions[id]))
          }
          onReset={() => {
            clearCompletions();
            setCompletions({});
          }}
          testMode={testMode}
          onFinish={() => {
            completeAllLocally(ALL_LESSONS.map((l) => l.id), { testMode });
            setCompletions(readCompletions());
          }}
        />
      </main>
    </AcademyShell>
  );
}

/**
 * A bar that fills as points are banked.
 *
 * Copper while a track is in progress and green once it is finished, so the
 * colour carries the same meaning as the check on a finished lesson's node. A
 * bar that was green from the first lesson had nothing left to say at the last.
 */
function Meter({ value, total, complete, label }) {
  const pct = total > 0 ? Math.min(value / total, 1) * 100 : 0;
  return (
    <span
      className={styles.meter}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <span
        className={`${styles.meterFill} ${complete ? styles.meterDone : ""}`}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

function DonePill() {
  return (
    <span className={styles.donePill}>
      <CheckIcon />
      Complete
    </span>
  );
}

/**
 * The rewards panel, at the top of the page beside the headline.
 *
 * It used to sit at the foot of the map, under both tracks, which is the one
 * place a reader deciding whether to start would never have reached. What the
 * course pays is part of the pitch, so it opens the page.
 *
 * Each track carries a bar rather than a sentence of arithmetic. The figures are
 * still there underneath it, but the thing a returning learner wants is how far
 * along they are, and that reads faster as a bar than as two numbers.
 */
function RewardCard({ completedIds, banked }) {
  const done = new Set(completedIds);
  const full = banked >= TOTAL_POINTS;

  return (
    <aside className={styles.rewardCard} aria-labelledby="rewards-title">
      <div className={styles.microLabel}>Rewards</div>
      <h2 className={styles.rewardTitle} id="rewards-title">
        Each track earns a Discord role
      </h2>
      <p className={styles.rewardBody}>
        Every lesson banks {LESSON_POINTS} points. Finishing the beginner track adds{" "}
        {BEGINNER_BONUS} more and the intermediate track {INTERMEDIATE_BONUS}, along with the
        role each one carries. It all converts to season points when season one opens.
      </p>
      <p className={styles.rewardNote}>
        Completions are kept in this browser until you claim them, so finish a track where
        you started it.
      </p>

      <div className={styles.rewardTracks}>
        {TRACKS.map((track) => {
          const finished = track.lessons.filter((l) => done.has(l.id)).length;
          const complete = finished === track.lessons.length;
          const points = trackBankedPoints(track, completedIds);
          const total = trackTotalPoints(track);

          return (
            <div key={track.key} className={styles.rewardTrack}>
              <div className={styles.rewardTrackHead}>
                <span className={styles.microLabel}>{track.label}</span>
                {complete ? (
                  <span className={styles.rewardDone} role="img" aria-label="Complete">
                    <CheckIcon />
                  </span>
                ) : null}
              </div>
              <div className={styles.rewardRole}>{track.roleLine}</div>
              <Meter
                value={points}
                total={total}
                complete={complete}
                label={`${track.label} points banked`}
              />
              <div className={styles.rewardMeta}>
                <span>{finished} of {track.lessons.length} lessons</span>
                <span className={styles.rewardFigure}>
                  {fmt(points)} of {fmt(total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.pointsRow}>
        <span className={`${styles.points} ${full ? styles.pointsDone : ""}`}>{fmt(banked)}</span>
        <span className={styles.pointsOf}>of {fmt(TOTAL_POINTS)} points banked</span>
      </div>
      <Meter value={banked} total={TOTAL_POINTS} complete={full} label="Points banked" />
    </aside>
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
 * The confirm is not politeness. These receipts are the only proof of points
 * that have not been claimed, and deleting them deletes the points. Receipts
 * that are all local prove nothing, so deleting those skips it.
 *
 * In development a second control sits beside it and marks every lesson
 * complete with the same unsigned `local:` receipts the dev grader issues.
 * Showing someone the finished map used to mean working thirteen checkpoints
 * first. The two controls swap the map between empty and finished in one
 * click each. The control is compiled out of production unless the build set
 * `customFields.academyTestMode`, which the share link does for the team's
 * feel-test: see the note on it.
 */
function ProgressNote({ started, finished, localOnly, testMode, onReset, onFinish }) {
  const [asking, setAsking] = useState(false);

  return (
    <section className={styles.progressNote}>
      <p className={styles.progressNoteText}>
        Your progress is stored in this browser. Open the Academy on another device and it
        starts from zero, and clearing your site data clears your completions with it.
      </p>

      {started ? (
        asking ? (
          <div className={styles.resetAsk} role="alertdialog" aria-label="Delete your progress">
            <span className={styles.resetWarn}>
              This deletes every completion and the points they carry, and nothing restores
              them.
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
    </section>
  );
}

function TrackSection({ track, completions, loaded, base }) {
  const completedIds = Object.keys(completions);
  const lessons = trackState(completedIds, track.lessons);
  const doneCount = lessons.filter((l) => l.state === "done").length;
  const complete = loaded && doneCount === lessons.length;
  const banked = trackBankedPoints(track, completedIds);
  const headingId = `track-${track.key}`;

  return (
    <section className={styles.trackSection} aria-labelledby={headingId}>
      <div className={styles.trackHead}>
        <h2 className={styles.eyebrow} id={headingId}>{track.label}</h2>
        <p className={styles.trackIntro}>{INTRO[track.key]}</p>
        <div className={styles.progress}>
          <span className={styles.progressCount}>
            {doneCount} of {lessons.length} lessons complete
          </span>
          <Meter
            value={doneCount}
            total={lessons.length}
            complete={complete}
            label={`${track.label} lessons complete`}
          />
          <span className={styles.progressPoints}>
            {fmt(banked)} of {fmt(trackTotalPoints(track))} points
          </span>
          {complete ? <DonePill /> : null}
        </div>
      </div>

      {complete ? (
        <GraduationPanel track={track} completions={completions} base={base} banked={banked} />
      ) : null}

      <div className={styles.track}>
        {lessons.map((lesson, i) => (
          <TrackRow key={lesson.id} lesson={lesson} last={i === lessons.length - 1} />
        ))}
      </div>
    </section>
  );
}

/**
 * Shown once every lesson in a track is done.
 *
 * The claim is a verification call: the engine checks the stored tokens against
 * the track and answers whether the set is complete. It grants nothing on its
 * own; the Discord link is what turns an eligible claim into the role. Until the
 * engine deploys the endpoint it answers 404, which lands in `notOpen` here.
 */
function GraduationPanel({ track, completions, base, banked }) {
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
        message: e?.message || "The season engine could not be reached.",
      });
    }
  }

  const { status } = claim;
  const busy = status === "loading";
  const settled = status === "eligible" || status === "notOpen";

  let body;
  let tone = "";
  if (localOnly) {
    body =
      "These completions were marked in the browser, for testing, not graded by the season engine. They carry no signature, so there is nothing to claim.";
    tone = styles.statusWarn;
  } else if (status === "loading") {
    body = "The season engine is checking your completions.";
  } else if (status === "notOpen") {
    body =
      "The claim opens with the Discord link. Your completions are stored in this browser and will be ready when it does.";
    tone = styles.statusWarn;
  } else if (status === "eligible") {
    body =
      "The season engine verified every completion on this track. Linking Discord is the next step.";
    tone = styles.statusOk;
  } else if (status === "ineligible") {
    body = "The season engine could not verify every completion. Redo the lessons below, then check again.";
    tone = styles.statusErr;
  } else if (status === "error") {
    body = claim.message;
    tone = styles.statusErr;
  } else {
    body = "Claiming sends the completions stored in this browser to the season engine for verification.";
  }

  let buttonLabel = "Claim your role";
  if (busy) buttonLabel = "Checking";
  else if (status === "error") buttonLabel = "Try again";
  else if (status === "ineligible") buttonLabel = "Check again";

  return (
    <section className={styles.graduate}>
      <div className={styles.microLabel}>Track complete</div>
      <div className={styles.graduateTitle}>You passed every lesson.</div>
      <div className={styles.graduateMeta}>
        <span className={styles.graduateRole}>{track.roleLine}</span>
        <span className={styles.graduatePoints}>{fmt(banked)} points banked</span>
      </div>

      <p className={`${styles.graduateBody} ${tone}`} aria-live="polite">{body}</p>

      {status === "ineligible" && claim.missing.length ? (
        <ul className={styles.missingList}>
          {claim.missing.map((id) => (
            <li key={id}>{lessonById(id)?.title ?? id}</li>
          ))}
        </ul>
      ) : null}

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
        {track.key === "beginner" ? (
          <span className={styles.graduateAside}>
            The <Link to="/user/quick-start">quick start</Link> covers the same flow in the
            app.
          </span>
        ) : null}
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

function TrackRow({ lesson, last }) {
  const { state } = lesson;

  return (
    <div className={styles.row}>
      <div className={styles.rail}>
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
          <Link to={lesson.slug} className={styles.doneLink}>
            <div className={`${styles.microLabel} ${styles.doneLabel}`}>
              Lesson {lesson.n} <Surface lesson={lesson} /> · Complete
            </div>
            <div className={styles.rowTitle}>{lesson.title}</div>
            <div className={styles.rowBlurb}>{lesson.blurb}</div>
            <span className={styles.revisit}>
              Revisit lesson
              <ArrowIcon />
            </span>
          </Link>
        ) : (
          // Readable, not workable. Someone who arrived from a link should be
          // able to see what the course covers before committing to it, and the
          // lesson page says plainly that a preview does not respond.
          <Link to={lesson.slug} className={styles.aheadLink}>
            <div className={styles.microLabel}>
              Lesson {lesson.n} <Surface lesson={lesson} />
            </div>
            <div className={styles.rowTitle}>{lesson.title}</div>
            <div className={styles.rowBlurb}>{lesson.blurb}</div>
            <span className={styles.peek}>
              Read ahead
              <ArrowIcon />
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
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />

      <div className={`${styles.microLabel} ${styles.currentLabel}`}>
        Lesson {lesson.n} <Surface lesson={lesson} /> · Up next
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
