import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import AcademyShell from "@site/src/components/Academy/Shell";
import {
  apiBase, claimGraduation, completionsFor, isLocalCompletion, readCompletions,
} from "@site/src/components/Academy/lib/api";
import {
  LESSON_POINTS, TOTAL_POINTS, TRACKS, lessonById, trackBankedPoints, trackState, trackTotalPoints,
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
    "You put in a deposit, borrow up to 90% of it, and the balance starts falling from there. When you want out, the Transmuter takes your alUSD back at 1:1. The beginner track walks the same position through all of it, one app screen at a time.",
  intermediate:
    "Underneath the app sits a vault with hard caps on the risk it can hold. The protocol sets one repayment pace for everyone. The intermediate track works through that machinery a mechanic at a time, and ends with a position you size yourself.",
};

const fmt = (n) => n.toLocaleString("en-US");

export default function AcademyTrack() {
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);

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
      description="Learn how Alchemix works by using it. The beginner track walks one position from the deposit through the loan that repays itself. The intermediate track goes underneath. You need no wallet and no sign-in."
    >
      <section className={styles.intro}>
        <div className={styles.eyebrow}>Alchemix Academy</div>
        <h1 className={styles.headline}>Learn how Alchemix works by using it.</h1>
        <p className={styles.sub}>
          On most lending platforms your collateral sits idle while you pay interest on
          the loan. Alchemix pays the loan down with what your deposit earns. Both tracks
          below work through how that happens, on the same screens and with the same
          numbers the app uses.
        </p>
        <p className={styles.sub}>
          You don't need a wallet, a sign-in, or anything installed. Nothing here assumes
          you have used DeFi before.
        </p>

        <div className={styles.markets} aria-label="Where Alchemix runs">
          <div className={styles.market}>
            <span className={styles.marketChain}>Ethereum</span>
            <span className={styles.marketPair}>alETH · alUSD</span>
          </div>
          <div className={styles.market}>
            <span className={styles.marketChain}>Optimism</span>
            <span className={styles.marketPair}>alETH · alUSD</span>
          </div>
          <div className={styles.market}>
            <span className={styles.marketChain}>Arbitrum</span>
            <span className={styles.marketPair}>alETH · alUSD</span>
          </div>
        </div>
        <p className={styles.marketsNote}>
          Each chain runs an ETH market and a USDC market. Every mechanic works the same
          way in all six of them.
        </p>
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

      <section className={styles.reward}>
        <div className={styles.rewardCard}>
          <div className={styles.microLabel}>Rewards</div>
          <div className={styles.rewardTitle}>
            Each track earns a Discord role, and the founding class closes when season
            one opens
          </div>
          <p className={styles.rewardBody}>
            Each lesson banks {LESSON_POINTS} points. Finishing a track adds its bonus and
            the Discord role that comes with it. All of it converts to season points when
            season one opens, which is also the moment the founding class closes for good.
          </p>

          <div className={styles.rewardGrid}>
            {TRACKS.map((track) => (
              <div key={track.key} className={styles.rewardTrack}>
                <div className={styles.microLabel}>{track.label}</div>
                <div className={styles.rewardRole}>{track.roleLine}</div>
                <div className={styles.rewardPoints}>
                  Each of the {track.lessons.length} lessons pays {LESSON_POINTS} points,
                  and finishing the track adds {track.bonus} more. That comes to{" "}
                  {fmt(trackTotalPoints(track))}.
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pointsRow}>
            <span className={styles.points}>{fmt(banked)}</span>
            <span className={styles.pointsOf}>of {fmt(TOTAL_POINTS)} points banked</span>
          </div>
        </div>
      </section>
    </AcademyShell>
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
          <span className={styles.progressBar} aria-hidden="true">
            <span
              className={styles.progressFill}
              style={{ width: `${(doneCount / lessons.length) * 100}%` }}
            />
          </span>
          <span className={styles.progressPoints}>
            {fmt(banked)} of {fmt(trackTotalPoints(track))} points
          </span>
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
      "These completions were graded in the browser during development. They carry no signature, so the engine cannot verify them and there is nothing to claim.";
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
            The <Link to="/user/quick-start">quick start</Link> walks the same flow in the
            app.
          </span>
        ) : null}
      </div>
    </section>
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
        ) : state === "done" ? (
          // A finished lesson stays open for rereading. Revisiting never clears
          // the stored completion; the lesson page opens with every stage unlocked.
          <Link to={lesson.slug} className={styles.doneLink}>
            <div className={`${styles.microLabel} ${styles.doneLabel}`}>
              Lesson {lesson.n} · Complete
            </div>
            <div className={styles.rowTitle}>{lesson.title}</div>
            <div className={styles.rowBlurb}>{lesson.blurb}</div>
            <span className={styles.revisit}>
              Revisit lesson
              <ArrowIcon />
            </span>
          </Link>
        ) : (
          <div className={styles.muted}>
            <div className={styles.microLabel}>Lesson {lesson.n}</div>
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

/* ── Icons. Drawn, never emoji, so they scale and recolor. ── */

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
