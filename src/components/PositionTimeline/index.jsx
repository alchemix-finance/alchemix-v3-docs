import React from "react";
import styles from "./styles.module.css";

const ASSUMPTIONS = [
  { label: "Initial deposit", value: "$1,000 USDC" },
  { label: "Borrow", value: "200 alUSD" },
  { label: "Starting LTV", value: "20%" },
  { label: "Vault APY", value: "12%" },
  { label: "Redemption rate", value: "40% annual" },
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

/* Bar widths normalised to $1,110 max across all quarters */
const TIMELINE = [
  {
    nodeLabel: "Start",
    nodeVal: "T\u2080",
    final: false,
    title: "Day 1: Loan opened",
    events: ["200 alUSD minted", "MYT earning yield"],
    bars: { col: [90.1, "$1,000"], dbt: [18.0, "$200"], eqt: [72.1, "$800"] },
    ltv: "20.0%",
    ltvLow: false,
    note: (
      <>
        You receive 200 alUSD. Swap it to USDC if you want working capital.
        The full $1,000 is earning in the MYT vault from day one.
      </>
    ),
  },
  {
    nodeLabel: "Q1",
    nodeVal: "3mo",
    final: false,
    title: "First redemption cycle",
    events: ["+$30 yield", "\u2212$20 redeemed"],
    bars: { col: [91.0, "$1,010"], dbt: [16.2, "$180"], eqt: [74.8, "$830"] },
    ltv: "17.8%",
    ltvLow: false,
    note: (
      <>
        Debt steps down on its own.{" "}
        <strong>Yield is already outpacing the redemption</strong>; collateral
        is up while the debt shrinks. Nothing for the borrower to do.
      </>
    ),
  },
  {
    nodeLabel: "Q2",
    nodeVal: "6mo",
    final: false,
    title: "Second redemption cycle",
    events: ["+$30.30 yield", "\u2212$18 redeemed"],
    bars: {
      col: [92.1, "$1,022"],
      dbt: [14.6, "$162"],
      eqt: [77.5, "$860"],
    },
    ltv: "15.9%",
    ltvLow: false,
    note: (
      <>
        Debt is down 19% from the start. Each cycle takes a smaller bite since
        redemptions are based on the remaining balance, not the original.
      </>
    ),
  },
  {
    nodeLabel: "Q3",
    nodeVal: "9mo",
    final: false,
    title: "Third redemption cycle",
    events: ["+$30.67 yield", "\u2212$16.20 redeemed"],
    bars: {
      col: [93.4, "$1,037"],
      dbt: [13.1, "$146"],
      eqt: [80.3, "$891"],
    },
    ltv: "14.1%",
    ltvLow: false,
    note: (
      <>
        Debt is down 27% and you haven't made a single payment. Collateral is
        still growing past what you put in.
      </>
    ),
  },
  {
    nodeLabel: "1 yr",
    nodeVal: "Q4",
    final: true,
    title: "End of year one",
    events: ["+$31.10 yield", "\u2212$14.58 redeemed"],
    bars: {
      col: [94.9, "$1,053"],
      dbt: [11.8, "$131"],
      eqt: [83.1, "$922"],
    },
    ltv: "12.5%",
    ltvLow: true,
    note: (
      <>
        <strong>Debt down 34%</strong> without a single payment.{" "}
        <strong>Collateral up $53 from where you started.</strong> Equity up
        $122. Re-borrow whenever you want more capital.
      </>
    ),
  },
];

const SUMMARY = [
  { label: "Debt cleared", value: "\u221234%", sub: "$200 → $131 without repayment" },
  { label: "Collateral change", value: "+$53", sub: "Grew above original deposit" },
  { label: "Equity gain", value: "+$122", sub: "$800 → $922 (+15.3%)" },
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
          At 12% APY, the vault earns faster than redemptions draw out, so{" "}
          <strong>
            collateral keeps growing even as the debt falls
          </strong>
          . You borrow upfront, the position handles itself, and you end the
          year with more collateral than you started with. When the debt gets
          low, borrow again.
        </p>
      </div>

      {/* ── Legend ── */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div
            className={styles.legendDot}
            style={{ background: "#4ade80" }}
          />
          Collateral (MYT value)
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendDot}
            style={{ background: "#dc6060" }}
          />
          Outstanding debt (alUSD)
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendDot}
            style={{ background: "#60a5fa" }}
          />
          Equity (collateral &minus; debt)
        </div>
        <span className={styles.legendNote}>
          12% vault APY &middot; 40% annual redemption rate &middot;
          illustrative only
        </span>
      </div>
    </div>
  );
}
