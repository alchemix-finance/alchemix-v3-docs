import React, { useId, useState } from "react";
import styles from "./figures.module.css";

/**
 * Small figures for a page's text column: sums and comparisons drawn as what
 * they are. A paragraph that walked through four numbers, or a table of
 * five rows of them, gave the reader figures with nothing to hold them by.
 */

/**
 * A sum, one line to an amount, with the result under a rule: what the
 * reader started with, each thing that changed it, and what is left.
 *
 *   <Breakdown
 *     rows={[["Deposit a year ago", "10,000"], ["Yield earned", "+461"], ["Paid to redemptions", "-2,000"]]}
 *     total={["Deposit now", "8,456"]}
 *   />
 *
 * An amount that starts with "+" is drawn as a gain and one that starts with
 * "-" as a loss (typed as a hyphen, drawn as a minus sign). `unit` follows
 * every amount ("USDC").
 */
export function Breakdown({ rows = [], total = null, unit = null }) {
  const tone = (v) => (/^\+/.test(v) ? styles.up : /^[-−]/.test(v) ? styles.down : "");
  const show = (v) => String(v).replace(/^-/, "−");
  return (
    <dl className={styles.breakdown}>
      {rows.map(([label, value], i) => (
        <div key={i} className={styles.row}>
          <dt>{label}</dt>
          <dd className={tone(String(value))}>
            {show(value)}
            {unit ? <span className={styles.unit}> {unit}</span> : null}
          </dd>
        </div>
      ))}
      {total ? (
        <div className={`${styles.row} ${styles.total}`}>
          <dt>{total[0]}</dt>
          <dd>
            {show(total[1])}
            {unit ? <span className={styles.unit}> {unit}</span> : null}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

/**
 * Two things side by side on the same few questions: a column to each, a
 * line to each question.
 *
 *   <Versus
 *     heads={["A lender at 7%", "Alchemix"]}
 *     rows={[["You owe after a year", "5,350", "3,000"], ["What the loan cost you", "350", "206"]]}
 *   />
 */
export function Versus({ heads = ["", ""], rows = [] }) {
  return (
    <div className={styles.versus} role="table">
      <div className={styles.vHead} role="row">
        <span role="columnheader" />
        <span role="columnheader">{heads[0]}</span>
        <span role="columnheader">{heads[1]}</span>
      </div>
      {rows.map(([label, a, b], i) => (
        <div key={i} className={styles.vRow} role="row">
          <span role="rowheader">{label}</span>
          <span role="cell">{a}</span>
          <span role="cell">{b}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * How a figure in the text is worked out, closed until the reader asks. The
 * text says what the figure means; the arithmetic is here for whoever wants
 * to check it.
 *
 *   <Work title="How the 4,444.44 is worked out">
 *
 *   5,000 divided by 0.9 is 5,555.56 ...
 *
 *   </Work>
 */
export function Work({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`${styles.work} ${open ? styles.workOpen : ""}`}>
      <button type="button" className={styles.workLine} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
        {title}
      </button>
      {open ? (
        <div id={id} className={styles.workBody}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
