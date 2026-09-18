import React from "react";
import Link from "@docusaurus/Link";
import { useAlchemixFees } from "@site/src/components/FeeValue/useAlchemixFees";
import { useAlchemixStats } from "@site/src/components/AlchemixStat/useAlchemixStats";
import { MAX_LTV } from "../lib/protocol";
import styles from "./styles.module.css";

/**
 * The figures the lessons teach, read from the protocol rather than written
 * down here.
 *
 * Every lesson works an example, and an example is the only honest way to teach
 * arithmetic a learner has to be able to follow. The cost of that is a course
 * full of numbers that are true of a hypothetical position and nobody's real
 * one. This strip is the correction: the same quantities, live, on the front
 * door, so the examples inside are read as examples.
 *
 * Both readers already exist in the docs and are used on the fees and concept
 * pages. `useAlchemixFees` calls the contracts directly over public RPCs and
 * seeds itself with confirmed on-chain values, so a blocked RPC shows the seed
 * rather than a dash. `useAlchemixStats` reads DefiLlama, which can fail, and
 * renders a dash when it does.
 *
 * The borrowing cap is not read: it is a protocol constant the lessons build
 * on, and it is here because a learner comparing this strip with the app should
 * find every headline number in one place.
 */

const pct = (v, places = 2) => (v == null ? "—" : `${(v * 100).toFixed(places)}%`);

const tvl = (v) =>
  v == null
    ? "—"
    : `$${v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : `${(v / 1e6).toFixed(1)}M`}`;

export default function LiveFigures() {
  const fees = useAlchemixFees();
  const { stats } = useAlchemixStats();

  // Ethereum's USDC market. The redemption fee and the MYT performance fee are
  // uniform across chains; the early exit fee is not, which is why it names the
  // chain it came from.
  const row = fees?.ethereum?.usdc ?? {};

  const items = [
    { label: "Total value locked", value: tvl(stats?.tvl), foot: "across every market" },
    { label: "Borrowing cap", value: pct(MAX_LTV, 0), foot: "liquidation at 95%" },
    { label: "Redemption fee", value: pct(row.redemption), foot: "on the amount redeemed" },
    { label: "Early exit fee", value: pct(row.earlyExit), foot: "leaving the Transmuter early" },
    { label: "MYT performance fee", value: pct(row.myt, 0), foot: "of what the strategies earn" },
  ];

  return (
    <section className={styles.wrap} aria-label="Live protocol figures">
      <div className={styles.head}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.headText}>
          Read from the protocol just now. Every figure inside a lesson is an example, and
          the app shows your own.
        </span>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.value}>{item.value}</div>
            <div className={styles.foot}>{item.foot}</div>
          </div>
        ))}
      </div>

      <div className={styles.note}>
        Fees are governance parameters and the <Link to="/user/concepts/fees">fees page</Link>{" "}
        reads the full schedule live. The redemption rate, the pace your own loan clears at,
        sits on your vault in the app and moves with the Transmuter queue.
      </div>
    </section>
  );
}
