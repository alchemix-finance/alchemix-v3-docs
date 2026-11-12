import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import AcademyShell, { MEMBERS_LIVE } from "@site/src/components/Academy/Shell";
import { readCompletions } from "@site/src/components/Academy/lib/api";
import { FooterBar } from "@site/src/components/Academy/ArticleLesson";
import { Arrow } from "@site/src/components/Academy/kit";
import TrackClosed from "@site/src/components/Academy/TrackClosed";
import { trackByKey } from "@site/src/components/Academy/lib/track";
import lp from "@site/src/components/Academy/LessonPage/styles.module.css";
import ls from "@site/src/components/Academy/lesson.module.css";
import tm from "@site/src/pages/academy/track.module.css";
import styles from "@site/src/components/Academy/ArticleLesson/styles.module.css";
import own from "@site/src/pages/academy/beginner-complete.module.css";

/**
 * Where the intermediate and the advanced track end.
 *
 * Built on the beginner track's finish page (beginner-complete.jsx,
 * 2026-11-06, laid out 2026-11-07): the same frame, a ring with one arc per
 * lesson, one line on what the learner can now do, the lessons passed as
 * chips, a recap beside the Members card, and three choice cards. It shares
 * beginner-complete.module.css. A track's last lesson leads here once it is
 * passed (ArticleLesson reads the track's `finish`), and the map links here
 * once every lesson on the track is complete.
 *
 * It was the intermediate track's own page until 2026-11-09, when that track
 * became two; the page moved here so the two share it. The words are each
 * page's own (`lead`, `recap`, `choices`). The Members card shows only for a
 * track with a role (`roleLine` in track.js), and only its link waits on
 * `MEMBERS_LIVE`. `next` is the footer's way on: the first lesson of the track
 * after this one, or the map.
 */

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

/**
 * One "Where to go next" card. `href` leaves the site and `to` is a route on
 * it. A link that leaves the Academy (the app, the docs) opens in a new tab;
 * a link to another Academy page stays in this one.
 */
function Choice({ kind, label, title, body, action, to, href, soon = false }) {
  return (
    <article className={own.choice} data-choice={kind}>
      <div className={tm.microLabel}>{label}</div>
      <h3 className={own.choiceTitle}>{title}</h3>
      <p className={own.choiceBody}>{body}</p>
      {soon ? (
        // The card's track is not open yet (OPEN_TRACKS in lib/track.js).
        <span className={`${tm.soon} ${own.choiceSoon}`}>Coming soon</span>
      ) : href ? (
        <a href={href} className={own.choiceAction} target="_blank" rel="noopener noreferrer">
          {action}
          <Arrow />
        </a>
      ) : (
        <Link to={to} className={own.choiceAction} {...(String(to).startsWith("/academy") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
          {action}
          <Arrow />
        </Link>
      )}
    </article>
  );
}

/**
 * Whether every lesson on the track is complete in this browser: null until
 * the page has mounted (these pages are prerendered, and localStorage does
 * not exist then), then true or false.
 *
 * A finish page opened by its address before the track was finished said "You
 * finished the beginner track" under a header reading "2 of 8 lessons
 * complete". That visitor now
 * goes to the map, which shows what is left. The page draws its body only
 * once this is true, so nobody sees the finish for a moment first.
 */
export function useTrackDone(track) {
  const history = useHistory();
  const [done, setDone] = useState(null);
  useEffect(() => {
    if (!track.open) return;
    const all = readCompletions();
    const ok = track.lessons.every((lesson) => Boolean(all[lesson.id]));
    setDone(ok);
    if (!ok) history.replace("/academy");
    // Once, on arrival: the track and the router do not change under a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return done;
}

export default function TrackFinish({ trackKey, description, lead, recap, choices, next = null }) {
  const track = trackByKey(trackKey);
  const done = useTrackDone(track);
  if (!track.open) return <TrackClosed track={track} />;
  const name = track.short.toLowerCase();
  const heading = `You finished the ${name} track`;
  return (
    <AcademyShell
      title={`${heading} · Alchemix Academy`}
      description={description}
      pinned
      footer={
        <FooterBar
          place=""
          action={
            <Link to={next ? next.to : "/academy"} className={`${ls.primaryLink} ${styles.barLink}`}>
              {next ? next.label : "Back to the map"}
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
            <span className={`${lp.backTrack} ${styles.headTrack}`}>{track.label}</span>
            <span className={`${lp.backSep} ${styles.headTrack}`}> · </span>
            Finished
          </span>
        </Link>
      }
    >
      <main className={styles.body}>
        {done ? (
        <>
        <header className={own.hero}>
          <div className={own.heroSeal}>
            <Seal count={track.lessons.length} />
          </div>
          <div className={own.heroText}>
            <div className={`${tm.microLabel} ${tm.doneLabel} ${own.in}`} style={{ "--d": "0s" }}>
              Track complete
            </div>
            <h1 className={`${styles.title} ${own.title} ${own.in}`} style={{ "--d": "0.06s" }}>
              {heading}
            </h1>
            <p className={`${own.lead} ${own.in}`} style={{ "--d": "0.12s" }}>
              {lead}
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

        <div className={track.roleLine ? own.split : undefined}>
          <div className={`${styles.prose} ${own.recap} ${own.in}`} style={{ "--d": "0.28s" }}>
            <p>{recap}</p>
          </div>
          {track.roleLine ? (
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
                      Claim it in the members area from this browser, where your completions are saved.
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
                    Your completions are saved in this browser. When Members opens, claim the {name} track there and
                    the role is yours.
                  </p>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <section className={`${own.next} ${own.in}`} style={{ "--d": "0.44s" }} aria-labelledby="next-title">
          <h2 id="next-title" className={own.nextTitle}>
            Where to go next
          </h2>
          <div className={own.choices}>
            {choices.map((c) => (
              <Choice key={c.kind} {...c} />
            ))}
          </div>
        </section>
        </>
        ) : null}
      </main>
    </AcademyShell>
  );
}
