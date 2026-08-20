import React from "react";
import styles from "./styles.module.css";

/**
 * The whole system as one loop.
 *
 * Both tracks teach the two halves separately: borrowing opens a discount, the
 * Transmuter closes it. Nothing else on the site joins them in one picture, so
 * this component does. It renders in wrap-up prose, where the learner has
 * already met every word it uses.
 *
 * A styled component instead of a mermaid block on purpose. The academy shell
 * is dark regardless of the site theme, and the site's mermaid theming follows
 * the site theme, so a mermaid diagram here could render light-on-dark.
 */

const STOPS = [
  {
    label: "Borrow",
    value: "alUSD is minted",
    note: "A borrower mints it against a deposit that keeps earning.",
    tone: "#f5c09a",
  },
  {
    label: "Sell",
    value: "usually just under 1.00",
    note: "Sold for working capital, which is what opens the discount.",
    tone: "#d4952a",
  },
  {
    label: "Buy",
    value: "the discount changes hands",
    note: "A buyer takes the cheap alUSD to the Transmuter.",
    tone: "#8ea9d8",
  },
  {
    label: "Wait",
    value: "collateral is earmarked",
    note: "Borrower collateral is reserved for the claim, and keeps earning until it settles.",
    tone: "#8ea9d8",
  },
  {
    label: "Redeem",
    value: "1:1 at maturity",
    note: "The buyer is paid in full, the borrower's debt falls, and the alUSD is burned.",
    tone: "#5ba88a",
  },
];

export default function SystemLoop() {
  return (
    <figure className={styles.wrap}>
      <div className={styles.loop} role="list">
        {STOPS.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 ? <Arrow /> : null}
            <div className={styles.stop} role="listitem">
              <div className={styles.stopLabel} style={{ color: s.tone }}>
                {s.label}
              </div>
              <div className={styles.stopValue}>{s.value}</div>
              <div className={styles.stopNote}>{s.note}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <figcaption className={styles.back}>
        <ReturnArrow />
        <span>
          The burn shrinks the supply, the price moves back towards 1.00, and the
          loop starts again.
        </span>
      </figcaption>
    </figure>
  );
}

function Arrow() {
  return (
    <svg
      className={styles.arrow}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(245,192,154,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function ReturnArrow() {
  return (
    <svg
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
      <path d="M19 12H6M11 18l-6-6 6-6" />
    </svg>
  );
}
