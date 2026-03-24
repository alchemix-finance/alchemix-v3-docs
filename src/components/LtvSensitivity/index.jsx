import React from "react";
import styles from "./styles.module.css";

/* ── Static data ─────────────────────────────────────────── */

const SETUP = {
  high: {
    label: "High LTV: 90%",
    rows: [
      ["Collateral", "$1,000"],
      ["Debt (alAssets)", "$900"],
      ["Equity", "$100"],
      ["Capital received", "~$882"],
      ["Yield buffer", "Thin"],
    ],
  },
  low: {
    label: "Low LTV: 45%",
    rows: [
      ["Collateral", "$1,000"],
      ["Debt (alAssets)", "$450"],
      ["Equity", "$550"],
      ["Capital received", "~$441"],
      ["Yield buffer", "Ample"],
    ],
  },
};

/* bars normalised to $1,100 */
const QUARTERS = {
  high: [
    {
      label: "Start \u00b7 T = 0",
      bars: { col: [91, "$1,000"], dbt: [82, "$900"], eqt: [9, "$100"] },
      ltv: "90.0%",
      delta: "Baseline",
    },
    {
      label: "After Q1 \u00b7 +$30 yield \u00b7 \u2212$56 redemption",
      bars: { col: [89, "$974"], dbt: [77, "$844"], eqt: [12, "$130"] },
      ltv: "86.6%",
      delta: "\u2212$26 collateral net",
    },
    {
      label: "After Q2 \u00b7 +$29 yield \u00b7 \u2212$53 redemption",
      bars: { col: [86, "$950"], dbt: [72, "$791"], eqt: [14, "$159"] },
      ltv: "83.3%",
      delta: "\u2212$24 collateral net",
    },
    {
      label: "After Q3 \u00b7 +$29 yield \u00b7 \u2212$49 redemption",
      bars: { col: [85, "$929"], dbt: [67, "$742"], eqt: [17, "$187"] },
      ltv: "79.9%",
      delta: "\u2212$21 collateral net",
    },
    {
      label: "After 1 year \u00b7 +$28 yield \u00b7 \u2212$46 redemption",
      bars: { col: [83, "$911"], dbt: [63, "$695"], eqt: [20, "$216"] },
      ltv: "76.3%",
      delta: "\u2212$89 collateral over 1yr",
    },
  ],
  low: [
    {
      label: "Start \u00b7 T = 0",
      bars: { col: [91, "$1,000"], dbt: [41, "$450"], eqt: [50, "$550"] },
      ltv: "45.0%",
      delta: "Baseline",
    },
    {
      label: "After Q1 \u00b7 +$30 yield \u00b7 \u2212$28 redemption",
      bars: { col: [91, "$1,002"], dbt: [38, "$422"], eqt: [53, "$580"] },
      ltv: "42.1%",
      delta: "+$2 collateral net",
    },
    {
      label: "After Q2 \u00b7 +$30 yield \u00b7 \u2212$26 redemption",
      bars: { col: [91, "$1,006"], dbt: [36, "$396"], eqt: [55, "$610"] },
      ltv: "39.4%",
      delta: "+$4 collateral net",
    },
    {
      label: "After Q3 \u00b7 +$30 yield \u00b7 \u2212$25 redemption",
      bars: { col: [92, "$1,011"], dbt: [34, "$371"], eqt: [58, "$640"] },
      ltv: "36.7%",
      delta: "+$5 collateral net",
    },
    {
      label: "After 1 year \u00b7 +$30 yield \u00b7 \u2212$23 redemption",
      bars: { col: [93, "$1,018"], dbt: [32, "$348"], eqt: [61, "$670"] },
      ltv: "34.2%",
      delta: "+$18 collateral over 1yr",
    },
  ],
};

const CALLOUTS = {
  high: {
    title: "High LTV: 90% \u2014 more capital, more exposure",
    items: [
      "~$882 USDC deployed upfront \u2014 twice the capital of a 45% position",
      "That capital can earn in yield strategies, liquidity pools, or wherever you put it",
      "Each redemption removes more collateral than vault yield replaces; collateral erodes over time",
      "LTV falls slowly; re-borrow more often to maintain leverage",
      "Worth it when returns on deployed capital exceed the collateral erosion cost",
    ],
  },
  low: {
    title: "Low LTV: 45% \u2014 less capital, lower maintenance",
    items: [
      "~$441 USDC deployed \u2014 less upfront, but the position largely manages itself",
      "Vault yield outpaces each redemption; collateral grows while debt falls",
      "LTV improves every quarter; the position gets safer as it deleverages",
      "More flexibility on when or whether to re-leverage",
      "Good fit for long-duration positions where low maintenance matters",
    ],
  },
};

const SUMMARY = [
  {
    label: "Collateral change",
    high: "\u2212$89",
    low: "+$18",
    sub: "High erodes \u00b7 Low grows",
  },
  {
    label: "Equity growth",
    high: "+$116",
    low: "+$120",
    sub: "Similar nominal gain",
  },
  {
    label: "LTV improvement",
    high: "90% \u2192 76%",
    low: "45% \u2192 34%",
    sub: "14 pts vs 11 pts",
  },
  {
    label: "Debt remaining",
    high: "$695",
    low: "$348",
    sub: "76% vs 34% of collateral",
  },
];

const BAR_LABELS = { col: "Collateral", dbt: "Debt", eqt: "Equity" };
const BAR_STYLES = { col: styles => styles.col, dbt: styles => styles.dbt, eqt: styles => styles.eqt };

/* ── Sub-components ──────────────────────────────────────── */

function BarGroup({ bars }) {
  return (
    <div className={styles.barGroup}>
      {Object.entries(bars).map(([type, [width, value]]) => (
        <div key={type} className={styles.barRow}>
          <div className={styles.barLabel}>{BAR_LABELS[type]}</div>
          <div className={styles.barTrack}>
            <div
              className={`${styles.barFill} ${styles[type]}`}
              style={{ width: `${width}%` }}
            />
          </div>
          <div className={styles.barValue}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Quarter({ data, variant }) {
  return (
    <div className={styles.quarter}>
      <div className={styles.quarterLabel}>{data.label}</div>
      <BarGroup bars={data.bars} />
      <div className={styles.quarterFooter}>
        <div className={`${styles.ltvBadge} ${styles[variant]}`}>
          LTV {data.ltv}
        </div>
        <div className={styles.deltaTag}>{data.delta}</div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function LtvSensitivity() {
  return (
    <div className={styles.wrap}>
      {/* ── Setup cards ── */}
      <div className={styles.sectionTitle}>
        Starting conditions: same $1,000 collateral, different leverage
      </div>
      <div className={styles.setupGrid}>
        {["high", "low"].map((v) => (
          <div key={v} className={`${styles.setupCard} ${styles[v]}`}>
            <div className={styles.setupCardLabel}>{SETUP[v].label}</div>
            {SETUP[v].rows.map(([key, val]) => (
              <div key={key} className={styles.setupRow}>
                <span className={styles.setupKey}>{key}</span>
                <span className={styles.setupVal}>{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className={styles.sectionTitle} style={{ marginTop: "1.5rem" }}>
        Position evolution &middot; 12% vault APY &middot; 25% annual
        redemption rate
      </div>
      <div className={styles.timelineWrap}>
        {["high", "low"].map((v) => (
          <div key={v} className={`${styles.timelineCol} ${styles[v]}`}>
            <div className={styles.timelineColHeader}>
              <div className={styles.dot} />
              {v === "high" ? "High LTV: 90%" : "Low LTV: 45%"}
            </div>
            {QUARTERS[v].map((q, i) => (
              <Quarter key={i} data={q} variant={v} />
            ))}
          </div>
        ))}
      </div>

      {/* ── Callouts ── */}
      <div className={styles.sectionTitle}>Position trade-offs</div>
      <div className={styles.calloutGrid}>
        {["high", "low"].map((v) => (
          <div key={v} className={`${styles.callout} ${styles[v]}`}>
            <div className={styles.calloutTitle}>{CALLOUTS[v].title}</div>
            <ul>
              {CALLOUTS[v].items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Summary ── */}
      <div className={styles.sectionTitle} style={{ marginTop: "1.5rem" }}>
        After 1 year: side by side
      </div>
      <div className={styles.summary}>
        <div className={styles.summaryTitle}>1-year outcome comparison</div>
        <div className={styles.summaryGrid}>
          {SUMMARY.map((s) => (
            <div key={s.label} className={styles.summaryCell}>
              <div className={styles.scLabel}>{s.label}</div>
              <div className={styles.scHigh}>{s.high}</div>
              <div className={styles.scLow}>{s.low}</div>
              <div className={styles.scSub}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#4ade80" }} />
          Collateral (MYT value)
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#dc6060" }} />
          Debt (alAsset balance)
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#60a5fa" }} />
          Equity (collateral &minus; debt)
        </div>
      </div>

      <div className={styles.assumptions}>
        Assumptions: $1,000 initial collateral &middot; 12% vault APY &middot;
        25% annual redemption rate &middot; quarterly compounding
        <br />
        These numbers are illustrative. Actual redemption rates vary based on
        Transmuter queue depth and system debt.
      </div>
    </div>
  );
}
