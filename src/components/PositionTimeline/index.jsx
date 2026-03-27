import React from "react";
import styles from "./styles.module.css";

const ASSUMPTIONS = [
  { label: "Initial deposit", value: "$1,000 USDC" },
  { label: "Borrow", value: "200 alUSD" },
  { label: "Starting LTV", value: "20%" },
  { label: "Vault APY", value: "15%" },
  { label: "Redemption rate", value: "60% annual" },
];

const CONTEXT = [
  {
    bold: "alUSD market price",
    text: "0.99 USDC; selling 200 alUSD yields ~198 USDC (approx. $2 upfront cost vs recorded debt)",
  },
  {
    bold: "Borrower fee",
    text: "0.50% applied only at each redemption settlement, shown in dApp",
  },
];

/* Bar widths normalised to $1,050 max across all quarters */
const TIMELINE = [
  {
    nodeLabel: "Start",
    nodeVal: "T\u2080",
    final: false,
    title: "Day 1: Loan opened",
    events: ["200 alUSD minted", "MYT earning yield"],
    bars: { col: [95.2, "$1,000"], dbt: [19.0, "$200"], eqt: [76.2, "$800"] },
    ltv: "20.0%",
    ltvLow: false,
    note: (
      <>
        You receive 200 alUSD. Swap it to USDC if you want working capital. The
        full $1,000 is earning in the MYT vault from day one.
      </>
    ),
  },
  {
    nodeLabel: "Q1",
    nodeVal: "3mo",
    final: false,
    title: "First redemption cycle",
    events: ["+$35.56 yield", "\u2212$38.50 redeemed"],
    bars: { col: [94.9, "$996"], dbt: [15.4, "$162"], eqt: [79.4, "$834"] },
    ltv: "16.2%",
    ltvLow: false,
    note: (
      <>
        Redemptions outpaced yield this quarter and collateral dipped $4. But{" "}
        <strong>debt fell $38 while collateral only dropped $4</strong>. The
        asymmetry is already working.
      </>
    ),
  },
  {
    nodeLabel: "Q2",
    nodeVal: "6mo",
    final: false,
    title: "Second redemption cycle",
    events: ["+$35.41 yield", "\u2212$31.10 redeemed"],
    bars: {
      col: [95.2, "$1,000"],
      dbt: [12.4, "$130"],
      eqt: [82.9, "$870"],
    },
    ltv: "13.0%",
    ltvLow: false,
    note: (
      <>
        Yield flips ahead of redemptions.{" "}
        <strong>Debt is down 35% without a single payment.</strong> Collateral
        has recovered to its starting value.
      </>
    ),
  },
  {
    nodeLabel: "Q3",
    nodeVal: "9mo",
    final: false,
    title: "Third redemption cycle",
    events: ["+$35.56 yield", "\u2212$25.07 redeemed"],
    bars: {
      col: [96.2, "$1,010"],
      dbt: [10.0, "$105"],
      eqt: [86.2, "$905"],
    },
    ltv: "10.4%",
    ltvLow: false,
    note: (
      <>
        Yield is pulling further ahead. Collateral is above where it started
        while <strong>debt is nearly halved</strong>.
      </>
    ),
  },
  {
    nodeLabel: "1 yr",
    nodeVal: "Q4",
    final: true,
    title: "End of year one",
    events: ["+$35.91 yield", "\u2212$20.24 redeemed"],
    bars: {
      col: [97.6, "$1,025"],
      dbt: [8.1, "$85"],
      eqt: [89.5, "$940"],
    },
    ltv: "8.3%",
    ltvLow: true,
    note: (
      <>
        <strong>Debt down 57%</strong> without a single payment.{" "}
        <strong>Collateral 2.5% above day one.</strong> Equity up $140.
        Re-borrow whenever you want more capital.
      </>
    ),
  },
];

const SUMMARY = [
  {
    label: "Debt cleared",
    value: "\u221257.5%",
    sub: "$200 → $85 without repayment. Redemptions settled the balance automatically.",
  },
  {
    label: "Collateral",
    value: "+2.5%",
    sub: "$1,000 → $1,025. Borrowing did not erode the deposit, it finished above where it started.",
  },
  { label: "Equity gain", value: "+$140", sub: "$800 → $940 (+17.5%). Vault yield covered the redemption cost, while the base MYT return was not sacrificed." },
];

const BAR_LABELS = { col: "Collateral", dbt: "Debt", eqt: "Equity" };

function Bar({ type, width, value }) {
  return (
    <div className={styles.barRow}>
      <div className={styles.barLbl}>{BAR_LABELS[type]}</div>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${styles[type]}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className={styles.barVal}>{value}</div>
    </div>
  );
}

export default function PositionTimeline() {
  return (
    <div className={styles.wrap}>
      {/* ── Assumptions ── */}
      <div className={styles.assumptions}>
        <div className={styles.assumptionsMain}>
          {ASSUMPTIONS.map((a) => (
            <div key={a.label} className={styles.assumption}>
              <span className={styles.assumptionLabel}>{a.label}</span>
              <span className={styles.assumptionVal}>{a.value}</span>
            </div>
          ))}
          <div className={styles.illustrativeNote}>
            Illustrative only.
            <br />
            Actual rates vary with
            <br />
            Transmuter activity.
          </div>
        </div>
        <div className={styles.assumptionsFooter}>
          {CONTEXT.map((c) => (
            <div key={c.bold} className={styles.contextItem}>
              <strong>{c.bold}</strong>
              <span className={styles.separator}>&middot;</span>
              {c.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className={styles.sectionTitle}>
        Position state &middot; quarterly snapshots
      </div>

      <div className={styles.timelineOuter}>
        <div className={styles.timelineSpine} />

        {TIMELINE.map((row, i) => (
          <div key={i} className={styles.timelineRow}>
            <div
              className={`${styles.timelineNode} ${
                row.final ? styles.final : ""
              }`}
            >
              <span className={styles.nodeLabel}>{row.nodeLabel}</span>
              <span className={styles.nodeVal}>{row.nodeVal}</span>
            </div>

            <div className={styles.timelineCard}>
              <div className={styles.tcHeader}>
                <span className={styles.tcTitle}>{row.title}</span>
                {row.events.map((e) => (
                  <span key={e} className={styles.tcEvent}>
                    {e}
                  </span>
                ))}
              </div>

              <div className={styles.tcBars}>
                {Object.entries(row.bars).map(([type, [width, value]]) => (
                  <Bar key={type} type={type} width={width} value={value} />
                ))}
              </div>

              <div className={styles.tcFooter}>
                <div
                  className={`${styles.ltvBadge} ${
                    row.ltvLow ? styles.ltvLow : ""
                  }`}
                >
                  LTV {row.ltv}
                </div>
                <div className={styles.tcNote}>{row.note}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Summary ── */}
      <div className={styles.sectionTitle}>1-Year summary</div>
      <div className={styles.summaryRow}>
        {SUMMARY.map((s) => (
          <div key={s.label} className={styles.sumCell}>
            <div className={styles.sumLabel}>{s.label}</div>
            <div className={styles.sumVal}>{s.value}</div>
            <div className={styles.sumSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Takeaway ── */}
      <div className={styles.takeaway}>
        <div className={styles.takeawayLabel}>Key insight</div>
        <p>
          In Q1 redemptions slightly outpace yield while collateral dips just $4.
          From Q2 onwards yield overtakes redemptions as debt shrinks, and
          collateral climbs back above its starting value.{" "}
          <strong>
            Debt drops 57% while collateral finishes 2.5% above day one.
          </strong>{" "}
          The asymmetry is the core of self-repaying loans. And throughout all
          of it,{" "}
          <strong>
            the $200 you borrowed on day one has been yours to use.
          </strong>{" "}
          This capital cost you nothing net, because your deposit is worth
          more than when you started.
        </p>
      </div>

      {/* ── Legend ── */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#4ade80" }} />
          Collateral (MYT value)
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#dc6060" }} />
          Outstanding debt (alUSD)
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: "#60a5fa" }} />
          Equity (collateral &minus; debt)
        </div>
        <span className={styles.legendNote}>
          15% vault APY &middot; 60% annual redemption rate &middot;
          illustrative only
        </span>
      </div>
    </div>
  );
}
