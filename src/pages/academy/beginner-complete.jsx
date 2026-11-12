import React from "react";
import Link from "@docusaurus/Link";
import AcademyShell, { MEMBERS_LIVE } from "@site/src/components/Academy/Shell";
import { FooterBar } from "@site/src/components/Academy/ArticleLesson";
import { Arrow } from "@site/src/components/Academy/kit";
import { useTrackDone } from "@site/src/components/Academy/TrackFinish";
import { INTERMEDIATE, trackByKey } from "@site/src/components/Academy/lib/track";
import lp from "@site/src/components/Academy/LessonPage/styles.module.css";
import ls from "@site/src/components/Academy/lesson.module.css";
import tm from "@site/src/pages/academy/track.module.css";
import styles from "@site/src/components/Academy/ArticleLesson/styles.module.css";
import own from "./beginner-complete.module.css";

/**
 * Where the beginner track ends. The last lesson's footer leads here once it
 * is passed, and the
 * map links here once every beginner lesson is complete. The same frame as a
 * lesson page: the pinned header, the column, the pinned footer with one
 * action.
 *
 * The old page was rigid and read like documentation, its lower half a
 * list of text with dots. The page now does
 * three things, top to bottom:
 *   1. marks the finish: a seal with one arc per lesson, the title, one line
 *      on what the learner can now do, and the lessons passed as green chips;
 *   2. the recap (its wording kept as it was) beside the Members card,
 *      which names what the track earns (the track's `roleLine`) and where it
 *      is claimed. Only the link to the members area waits on `MEMBERS_LIVE`;
 *   3. three choice cards for what comes next, each a title, one sentence and
 *      one action: the app (with what to have ready, where it is needed), the
 *      intermediate track (and the map), the docs.
 * Its own stylesheet; finish.module.css stays with the intermediate page.
 */

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** The seal's ring: one arc per lesson, a small gap between each. */
function arcs(count, r = 52, c = 60, gap = 7) {
  const step = 360 / count;
  const at = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return `${(c + r * Math.cos(rad)).toFixed(2)} ${(c + r * Math.sin(rad)).toFixed(2)}`;
  };
  return Array.from({ length: count }, (_, i) => {
    const a0 = -90 + i * step + gap / 2;
    const a1 = a0 + step - gap;
    return `M ${at(a0)} A ${r} ${r} 0 0 1 ${at(a1)}`;
  });
}

function Seal({ count }) {
  return (
    <svg className={own.seal} viewBox="0 0 120 120" aria-hidden="true">
      <circle className={own.sealCore} cx="60" cy="60" r="40" />
      {arcs(count).map((d, i) => (
        <path key={d} className={own.sealArc} d={d} pathLength="1" style={{ "--i": i }} />
      ))}
      <path className={own.sealCheck} d="M44 61l11 11 22-24" pathLength="1" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Ribbon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 13.9L7 22l5-2.8L17 22l-1.5-8.1" />
      <path d="M9.6 9.1l1.6 1.6 3.2-3.4" />
    </svg>
  );
}

export default function BeginnerComplete() {
  const track = trackByKey("beginner");
  const intermediate = INTERMEDIATE[0];
  // An unfinished track goes to the map; the body waits for the answer.
  const done = useTrackDone(track);
  return (
    <AcademyShell
      title="You finished the beginner track · Alchemix Academy"
      description="You deposited, borrowed, swapped, ran redemptions, repaid, withdrew, and took the other side of your own loan."
      pinned
      footer={
        <FooterBar
          place=""
          action={
            // While the intermediate track is not open (OPEN_TRACKS in
            // lib/track.js), the way on is the map.
            <Link to={intermediate.ready ? intermediate.slug : "/academy"} className={`${ls.primaryLink} ${styles.barLink}`}>
              {intermediate.ready ? "Start the intermediate track" : "Back to the map"}
              <Arrow />
            </Link>
          }
        />
      }
      left={
        <Link to="/academy" className={lp.back}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H6M11 18l-6-6 6-6" />
          </svg>
          <span className={lp.backLesson}>
            <span className={`${lp.backTrack} ${styles.headTrack}`}>{track ? track.label : "Academy"}</span>
            <span className={`${lp.backSep} ${styles.headTrack}`}> · </span>
            Finished
          </span>
        </Link>
      }
    >
      <main className={styles.body}>
        {done ? (
        <>
        {/* 1. The finish itself. */}
        <header className={own.hero}>
          <div className={own.heroSeal}>
            <Seal count={track.lessons.length} />
          </div>
          <div className={own.heroText}>
            <div className={`${tm.microLabel} ${tm.doneLabel} ${own.in}`} style={{ "--d": "0s" }}>
              Track complete
            </div>
            <h1 className={`${styles.title} ${own.title} ${own.in}`} style={{ "--d": "0.06s" }}>
              You finished the beginner track
            </h1>
            <p className={`${own.lead} ${own.in}`} style={{ "--d": "0.12s" }}>
              You can now borrow on Alchemix with your own wallet, from the first deposit to the last withdrawal.
            </p>
          </div>
        </header>

        <ol className={`${own.lessons} ${own.in}`} style={{ "--d": "0.2s" }} aria-label="Lessons passed">
          {track.lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link to={lesson.slug} className={own.lesson}>
                <span className={own.lessonCheck}>
                  <Check />
                </span>
                {lesson.title}
              </Link>
            </li>
          ))}
        </ol>

        {/* 2. What they did, and what it earns. */}
        <div className={own.split}>
          <div className={`${styles.prose} ${own.recap} ${own.in}`} style={{ "--d": "0.28s" }}>
            <p>
              Using the practice wallet, you deposited 10,000 USDC into a vault, borrowed 5,000 alUSD against it and
              swapped it for USDC. You watched redemptions pay the loan down out of your deposit, repaid the rest and
              withdrew, saw what can liquidate a position, and took the other side of a loan on Fixed Yield. That is
              how an Alchemix loan works: your deposit keeps earning, Alchemix charges no interest beyond the redemption fee, and redemptions
              that pay Fixed Yield depositors pay the loan down over time.
            </p>
          </div>
          <section
            className={`${tm.graduate} ${own.reward} ${own.in}`}
            style={{ "--d": "0.36s" }}
            aria-labelledby="reward-title"
          >
            <span className={own.rewardIcon}>
              <Ribbon />
            </span>
            <div className={own.rewardText}>
              <div className={tm.microLabel}>Members</div>
              <h2 id="reward-title" className={`${tm.graduateTitle} ${own.rewardTitle}`}>
                {track.roleLine}
              </h2>
              {MEMBERS_LIVE ? (
                <>
                  <p className={tm.graduateBody}>
                    Your completions are saved in this browser, so open the members area from here to claim the role.
                  </p>
                  <div className={tm.graduateActions}>
                    <Link to="/members" className={tm.cta}>
                      Open the members area
                      <Arrow />
                    </Link>
                  </div>
                </>
              ) : (
                <p className={tm.graduateBody}>
                  Your completions are saved in this browser. Once the members area opens, claim the beginner track
                  there from this browser to receive the role.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* 3. What comes next, as three choices. */}
        <section className={`${own.next} ${own.in}`} style={{ "--d": "0.44s" }} aria-labelledby="next-title">
          <h2 id="next-title" className={own.nextTitle}>
            Where to go next
          </h2>
          <div className={own.choices}>
            <article className={own.choice} data-choice="app">
              <div className={tm.microLabel}>alchemix.fi</div>
              <h3 className={own.choiceTitle}>Use the app</h3>
              <p className={own.choiceBody}>You take the same steps in the app that you took with the practice wallet.</p>
              <div className={own.ready}>
                <div className={own.readyLabel}>Before you start</div>
                <ul className={own.readyList}>
                  <li>A wallet on the vault's chain</li>
                  <li>The USDC or ETH you want to deposit</li>
                  <li>A little ETH for gas</li>
                </ul>
              </div>
              <a href="https://alchemix.fi" className={own.choiceAction} target="_blank" rel="noopener noreferrer">
                Open alchemix.fi
                <Arrow />
              </a>
            </article>

            <article className={own.choice} data-choice="intermediate">
              <div className={tm.microLabel}>Intermediate track</div>
              <h3 className={own.choiceTitle}>Keep learning</h3>
              {intermediate.ready ? (
                <>
                  <p className={own.choiceBody}>
                    {WORDS[INTERMEDIATE.length] || INTERMEDIATE.length} lessons go one level deeper, starting with lesson 1:{" "}
                    <Link to={intermediate.slug}>{intermediate.title}</Link>. <Link to="/academy">The map</Link> lists
                    them all.
                  </p>
                  <Link to={intermediate.slug} className={own.choiceAction}>
                    Start the first lesson
                    <Arrow />
                  </Link>
                </>
              ) : (
                <>
                  <p className={own.choiceBody}>
                    {WORDS[INTERMEDIATE.length] || INTERMEDIATE.length} lessons go one level deeper, starting with lesson 1:{" "}
                    {intermediate.title}.
                  </p>
                  <span className={`${tm.soon} ${own.choiceSoon}`}>Coming soon</span>
                </>
              )}
            </article>

            <article className={own.choice} data-choice="docs">
              <div className={tm.microLabel}>Docs</div>
              <h3 className={own.choiceTitle}>Read the docs</h3>
              <p className={own.choiceBody}>
                The quick start goes through a first deposit and a small borrow in the app, one step at a time.
              </p>
              <Link to="/user/quick-start" className={own.choiceAction} target="_blank" rel="noopener noreferrer">
                Open the quick start
                <Arrow />
              </Link>
            </article>
          </div>
        </section>
        </>
        ) : null}
      </main>
    </AcademyShell>
  );
}
