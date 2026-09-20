import React from "react";
import { BEGINNER } from "../lib/track";
import styles from "./styles.module.css";

/**
 * The beginner track's one position, as a picture, on the front door.
 *
 * The track map used to open with two paragraphs against an empty right half of
 * the viewport, and the beginner track's whole claim, one position carried
 * across six lessons, was asserted in prose and drawn nowhere. This is that
 * claim drawn.
 *
 * It doubles as the progress display. Each stop is one beginner lesson, six
 * in all, and lights when that lesson is finished, so the picture fills in as
 * the position gets built. The stop a learner is on carries a ring. Nothing
 * here is a link: the rails below are where lessons are opened, and a second
 * set of targets for the same six destinations would only split the click.
 *
 * Lesson 1 is the idea the other five build, so it is the first stop rather
 * than a frame around them. A strip that said "six lessons" over five numbered
 * boxes read as a mistake, whatever the frame was doing.
 *
 * Figures match the carried position the lessons use, and the copy says
 * "example" where a real one would vary. The live strip under the hero is what
 * carries the protocol's actual numbers.
 */

const STOPS = [
  {
    id: "what-alchemix-does",
    label: "The idea",
    value: "A loan that repays itself",
    note: "Deposit, borrow against it, and redemptions clear the debt.",
    tone: "#5ba88a",
  },
  {
    id: "your-deposit",
    label: "Deposit",
    value: "10,000 USDC",
    note: "It becomes MYT and starts earning.",
    tone: "#5ba88a",
  },
  {
    id: "borrowing",
    label: "Borrow",
    value: "5,000 alUSD",
    note: "Up to 90% of the deposit, minted to your wallet.",
    tone: "#f5c09a",
  },
  {
    id: "self-repaying",
    label: "Repay",
    value: "No payments due",
    note: "Redemptions clear the balance from collateral that keeps earning.",
    tone: "#f5c09a",
  },
  {
    id: "what-can-go-wrong",
    label: "Hold",
    value: "No price liquidation",
    note: "Debt and collateral are priced in the same asset, so they move together.",
    tone: "#8ea9d8",
  },
  {
    id: "the-transmuter",
    label: "Or save",
    value: "1:1 at maturity",
    note: "Buy alUSD under a dollar and redeem it in full.",
    tone: "#8ea9d8",
  },
];

export default function TrackLoop({ completedIds = [] }) {
  const done = new Set(completedIds);
  // The stop a learner is about to reach: the first one not finished.
  const currentId = STOPS.find((s) => !done.has(s.id))?.id ?? null;
  const finished = STOPS.filter((s) => done.has(s.id)).length;

  return (
    <figure
      className={`${styles.wrap} ${finished > 0 ? styles.wrapOn : ""}`}
      aria-label={`The position the beginner track builds. ${finished} of ${STOPS.length} lessons complete.`}
    >
      <figcaption className={styles.head}>
        <span className={styles.headLabel}>One position, six lessons</span>
        <span className={styles.headCount}>
          {finished}/{STOPS.length}
        </span>
      </figcaption>

      <div className={styles.loop} role="list">
        {STOPS.map((stop, i) => {
          const isDone = done.has(stop.id);
          const isCurrent = stop.id === currentId;
          const n = BEGINNER.findIndex((l) => l.id === stop.id) + 1;

          return (
            <React.Fragment key={stop.id}>
              {i > 0 ? <Arrow on={isDone} /> : null}
              <div
                className={`${styles.stop} ${isDone ? styles.stopDone : ""} ${
                  isCurrent ? styles.stopCurrent : ""
                }`}
                role="listitem"
              >
                <div className={styles.stopTop}>
                  <span
                    className={styles.stopNum}
                    style={isDone ? { borderColor: stop.tone, color: stop.tone } : undefined}
                  >
                    {n}
                  </span>
                  <span
                    className={styles.stopLabel}
                    style={isDone ? { color: stop.tone } : undefined}
                  >
                    {stop.label}
                  </span>
                </div>
                <div className={styles.stopValue}>{stop.value}</div>
                <div className={styles.stopNote}>{stop.note}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </figure>
  );
}

function Arrow({ on }) {
  return (
    <svg
      className={`${styles.arrow} ${on ? styles.arrowOn : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
