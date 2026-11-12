import React, { useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { AlchemixMark } from "../Logo";
import { TRACKS } from "../lib/track";
import styles from "./styles.module.css";

/**
 * The hero picture on the track map: the whole course as rings around the
 * Academy mark, one ring per track, the beginner track innermost.
 *
 * Members has its orbit in the same place. This one does a job as well as
 * setting the look: each point is a lesson and a link to it, finished lessons
 * turn green and are joined along their ring, and the lesson the hero's button
 * starts is the copper one. It carries no protocol figures, since the map is
 * for finding and finishing lessons, and it hides at 900px
 * and under, where the hero's button has to stay near the top.
 *
 * Under it, one line names the rings (a name opens that track in the list
 * below, and pointing at it lights its ring), and a point shows its lesson's
 * name beside it the moment it is pointed at.
 *
 * Drawn to one set of rules, so numbers sit centered in their circles and
 * the circles line up with each other:
 *
 * - Every point is the same size on every ring. The next lesson is marked by
 *   its color and a ring round it, not by being bigger.
 * - The rings' radii are chosen so the points line up. With 8, 6 and 4 points
 *   spaced evenly from the top, the inner ring's diagonal points and the
 *   middle ring's sit on the same two rows when the middle radius is the
 *   inner one times the square root of 2, and the three rings are evenly
 *   spaced so the columns at the top and bottom are too. Before, those rows
 *   missed each other by about 4px.
 * - The lesson the button opens is a copper ring, never a fill: fill means
 *   passed (green), here and in each track's segments (a filled copper
 *   point read as a finished lesson). The mark at
 *   the middle is the brand's copper, like the header's lockup.
 *   The names under the picture stay neutral.
 * - Progress is not counted here. The picture shows it, the page header
 *   counts it, and each track's head below draws it.
 * - A track that is not open yet (`open` false, see lib/track.js) keeps its
 *   ring and points, faint, and none of them is a link. Its name in the key
 *   is grey and does nothing.
 */

const SIZE = 400;
const C = SIZE / 2;
const INNER = 96;
const STEP = INNER * (Math.SQRT2 - 1);
const RINGS = [INNER, INNER + STEP, INNER + 2 * STEP];
const DOT = 7;

/** Where lesson `k` of `n` sits: evenly round the ring, the first at the top. */
function at(k, n, r) {
  const a = (-90 + (k * 360) / n) * (Math.PI / 180);
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

/** The arc along a ring from lesson `k` to lesson `k + 1`, clockwise. */
function arc(k, n, r) {
  const [x1, y1] = at(k, n, r);
  const [x2, y2] = at(k + 1, n, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** The three rings in small, with one track's ring drawn in. */
function RingGlyph({ index, done }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
      {[3, 6, 9].map((r, i) => (
        <circle
          key={r}
          cx="10"
          cy="10"
          r={r}
          className={i === index ? `${styles.glyphOn} ${done ? styles.glyphDone : ""}` : styles.glyphOff}
        />
      ))}
    </svg>
  );
}

/**
 * A lesson named by its place in the course: its track and its number on one
 * small line, parted by the hairline the page header uses between its own
 * items, and the lesson's title under it. Type alone, with nothing drawn to
 * line up (the first version stacked a ring glyph over a numbered circle, two
 * sizes with their centers 2px apart). The hover label on the course picture
 * and the line beside the hero's button both use it; the picture's also says
 * when the lesson is complete.
 */
export function LessonTag({ lesson, state, className }) {
  const track = TRACKS.find((t) => t.key === lesson.track);
  return (
    <span className={`${styles.tag} ${className ?? ""}`}>
      <span className={styles.tagPlace}>
        <span>{track?.label}</span>{" "}
        <span className={styles.tagRule} aria-hidden="true" />
        <span>
          Lesson {lesson.n} of {track?.lessons.length}
        </span>
        {state === "done" ? (
          <>
            {" "}
            <span className={styles.tagRule} aria-hidden="true" />
            <span className={styles.tagDone}>Complete</span>
          </>
        ) : null}
      </span>
      <span className={styles.tagTitle}>{lesson.title}</span>
    </span>
  );
}

export default function CourseMap({ completedIds, nextId, onTrack, className }) {
  const done = new Set(completedIds);
  const base = useBaseUrl("/");
  // The track whose name is pointed at, and the point that is pointed at.
  const [hot, setHot] = useState(null);
  const [tip, setTip] = useState(null);

  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <nav className={styles.picture} aria-label="Every lesson in the Academy">
        <svg className={styles.svg} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none">
          {/* The frame of the picture: a slow dashed ring. */}
          <circle className={styles.drift} cx={C} cy={C} r={196} />

          {TRACKS.map((track, ti) => {
            const r = RINGS[ti];
            const lessons = track.lessons;
            const n = lessons.length;
            const allDone = lessons.every((l) => done.has(l.id));
            const dim = hot && hot !== track.key;
            if (!track.open) {
              return (
                <g key={track.key} className={`${styles.track} ${styles.trackClosed}`} aria-hidden="true">
                  <circle className={styles.ring} cx={C} cy={C} r={r} />
                  {lessons.map((l, k) => {
                    const [x, y] = at(k, n, r);
                    return <circle key={l.id} className={styles.dotClosed} cx={x} cy={y} r={DOT} />;
                  })}
                </g>
              );
            }
            return (
              <g key={track.key} className={`${styles.track} ${dim ? styles.trackDim : ""}`}>
                <circle className={`${styles.ring} ${hot === track.key ? styles.ringHot : ""}`} cx={C} cy={C} r={r} />
                {lessons.map((l, k) => {
                  const next = lessons[(k + 1) % n];
                  const joins = done.has(l.id) && done.has(next.id) && (k < n - 1 || allDone);
                  return joins ? <path key={`arc-${l.id}`} className={styles.arcDone} d={arc(k, n, r)} /> : null;
                })}
                {lessons.map((l, k) => {
                  const [x, y] = at(k, n, r);
                  const state = done.has(l.id) ? "done" : l.id === nextId ? "next" : "ahead";
                  // Read aloud in place of the drawn label.
                  const label = `${track.label}, lesson ${l.n}: ${l.title}${state === "done" ? ", complete" : state === "next" ? ", up next" : ""}`;
                  const show = () => setTip({ id: l.id, x, y, lesson: l, state });
                  const hide = () => setTip((t) => (t && t.id === l.id ? null : t));
                  return (
                    <a
                      key={l.id}
                      href={`${base.replace(/\/$/, "")}${l.slug}`}
                      className={`${styles.point} ${styles[`point_${state}`]}`}
                      aria-label={label}
                      onPointerEnter={show}
                      onPointerLeave={hide}
                      onFocus={show}
                      onBlur={hide}
                    >
                      <circle className={styles.hit} cx={x} cy={y} r={DOT + 8} />
                      {state === "next" ? <circle className={styles.halo} cx={x} cy={y} r={DOT + 5.5} /> : null}
                      <circle className={styles.dot} cx={x} cy={y} r={DOT} />
                    </a>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* The Alchemix mark at the picture's middle, drawn as its own SVG over
            the rings with nothing behind it. */}
        <AlchemixMark className={styles.mark} />

        {/* The pointed lesson's name, beside its point and reaching toward
            the page's text, so it never leaves the hero: to the left of a
            point on the picture's right half or its middle line, to the
            right of one on its left half. */}
        {tip ? (
          <span
            className={`${styles.tip} ${tip.x > C - 1 ? styles.tipLeft : styles.tipRight}`}
            style={{ left: `${(tip.x / SIZE) * 100}%`, top: `${(tip.y / SIZE) * 100}%` }}
            aria-hidden="true"
          >
            <LessonTag lesson={tip.lesson} state={tip.state} />
          </span>
        ) : null}
      </nav>

      <ul className={styles.key} aria-label="The three tracks, from the inner ring out">
        {TRACKS.map((track, ti) => {
          const total = track.lessons.length;
          const count = track.lessons.filter((l) => done.has(l.id)).length;
          const status = count === total ? "complete" : `${count} of ${total} lessons complete`;
          if (!track.open) {
            return (
              <li key={track.key}>
                <span className={`${styles.keyRow} ${styles.keyClosed}`} aria-label={`${track.label}: coming soon`}>
                  <RingGlyph index={ti} done={false} />
                  <span className={styles.keyName}>{track.short}</span>
                </span>
              </li>
            );
          }
          return (
            <li key={track.key}>
              <a
                href={`#track-${track.key}`}
                className={styles.keyRow}
                aria-label={`${track.label}: ${status}`}
                onClick={(e) => {
                  if (!onTrack) return;
                  e.preventDefault();
                  onTrack(track.key);
                }}
                onPointerEnter={() => setHot(track.key)}
                onPointerLeave={() => setHot((h) => (h === track.key ? null : h))}
                onFocus={() => setHot(track.key)}
                onBlur={() => setHot((h) => (h === track.key ? null : h))}
              >
                <RingGlyph index={ti} done={count === total} />
                <span className={styles.keyName}>{track.short}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
