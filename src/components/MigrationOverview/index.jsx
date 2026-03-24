import React from "react";
import styles from "./styles.module.css";

/* ── Static data ─────────────────────────────────────────── */

const STEPS = [
  {
    num: "01",
    name: "Freeze",
    tag: "Protocol pause",
    text: "V2 contracts are paused and all functions disabled, freezing every position in place.",
  },
  {
    num: "02",
    name: "Snapshot",
    tag: "State capture",
    text: "Every user\u2019s collateral and debt balance is recorded from the frozen contracts.",
  },
  {
    num: "03",
    name: "Asset Conversion",
    tag: "Collateral move",
    text: (
      <>
        Collateral is converted to <strong>USDC</strong> and{" "}
        <strong>wETH</strong>. The DAO treasury covers up to{" "}
        <strong>0.25%</strong> slippage.
      </>
    ),
  },
  {
    num: "04",
    name: "Positions",
    tag: "V3 recreation",
    text: (
      <>
        The Alchemix multisig recreates each position in V3, matching the exact
        collateral and debt from the snapshot. Positions under{" "}
        <strong>$0.01</strong> are skipped.
      </>
    ),
  },
  {
    num: "05",
    name: "Initialization",
    tag: "V3 launch",
    text: "Position NFTs are sent to each owner\u2019s wallet. V3 is live.",
  },
];

const MANA_TIERS = [
  {
    label: "V2 Vault Deposits",
    rate: "1 / $100 / day",
    detail: (
      <>
        Earn 1 Mana for every $100 of vault deposit value per day.
        <br />
        <br />
        <strong>Requirement:</strong> Must complete the V2 &rarr; V3 migration
        to qualify.
      </>
    ),
  },
  {
    label: "Standard LP Pools",
    rate: "Retroactive",
    detail: (
      <>
        Based on average LP balance from <strong>Jan 15, 2025</strong> compared
        to current snapshot.
        <br />
        <br />
        <strong>Eligibility:</strong> Retroactive, based on on-chain history.
      </>
    ),
  },
  {
    label: "CL Pools",
    rate: "1,000 flat",
    detail: (
      <>
        One-time <strong>1,000 Mana</strong> bonus for any eligible concentrated
        liquidity pool position.
        <br />
        <br />
        <strong>Eligibility:</strong> Any eligible CL pool history.
      </>
    ),
  },
];

const MILESTONES = [
  { month: "Mo 1", pct: "16.7%" },
  { month: "Mo 2", pct: "33.3%" },
  { month: "Mo 3", pct: "50.0%" },
  { month: "Mo 4", pct: "66.7%" },
  { month: "Mo 5", pct: "83.3%" },
  { month: "Mo 6", pct: "100%", final: true },
];

/* ── Component ───────────────────────────────────────────── */

export default function MigrationOverview() {
  return (
    <div className={styles.wrap}>
      {/* ── Section 1: Migration Timeline ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Migration sequence &middot; AIP-123
        </div>
        <div className={styles.timeline}>
          {STEPS.map((step) => (
            <div key={step.num} className={styles.timelineStep}>
              <div className={styles.timelineMarker}>{step.num}</div>
              <div className={styles.timelineCard}>
                <div className={styles.timelineCardHeader}>
                  <span className={styles.stepName}>{step.name}</span>
                  <span className={styles.stepTag}>{step.tag}</span>
                </div>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Mana Earning ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Mana earning &middot; look-back from January 15, 2025
        </div>
        <div className={styles.manaGrid}>
          {MANA_TIERS.map((tier) => (
            <div key={tier.label} className={styles.manaTier}>
              <div className={styles.manaTierLabel}>{tier.label}</div>
              <div className={styles.manaRate}>{tier.rate}</div>
              <div className={styles.manaDetail}>{tier.detail}</div>
            </div>
          ))}
        </div>
        <div className={styles.manaMetaRow}>
          <div className={styles.manaMetaCell}>
            <div className={styles.manaMetaLabel}>Minimum threshold</div>
            <div className={styles.manaMetaVal}>1.337 Mana</div>
            <div className={styles.manaMetaSub}>
              Required for any reward distribution
            </div>
          </div>
          <div className={styles.manaMetaCell}>
            <div className={styles.manaMetaLabel}>Total reward pool</div>
            <div className={styles.manaMetaVal}>10,000 rALCX</div>
            <div className={styles.manaMetaSub}>
              Distributed proportional to total Mana
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: rALCX Vesting ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          rALCX vesting &middot; 6-month linear schedule
        </div>
        <div className={styles.vestingWrap}>
          <div className={styles.vestingTrackSection}>
            <div className={styles.vestingTrackLabel}>
              Claimable ALCX over time
            </div>
            <div className={styles.vestingBarOuter}>
              <div
                className={styles.vestingBarFill}
                style={{ width: "100%" }}
              />
            </div>
            <div className={styles.vestingTicks}>
              <span>Month 0</span>
              <span>Month 1</span>
              <span>Month 2</span>
              <span>Month 3</span>
              <span>Month 4</span>
              <span>Month 5</span>
              <span>Month 6 &#x2713;</span>
            </div>
          </div>
          <div className={styles.vestingMilestones}>
            {MILESTONES.map((m) => (
              <div
                key={m.month}
                className={`${styles.milestone} ${
                  m.final ? styles.milestoneFinal : ""
                }`}
              >
                <div className={styles.milestoneMonth}>{m.month}</div>
                <div className={styles.milestonePct}>{m.pct}</div>
              </div>
            ))}
          </div>
          <div className={styles.vestingCallouts}>
            <div className={`${styles.vestingCallout} ${styles.good}`}>
              <div className={styles.vcl}>Wait full term</div>
              <p className={styles.vcp}>
                After <strong>6 months</strong>, 100% of rALCX rewards can be
                claimed as ALCX with no penalty of any kind.
              </p>
            </div>
            <div className={`${styles.vestingCallout} ${styles.warn}`}>
              <div className={styles.vcl}>Early exit penalty</div>
              <p className={styles.vcp}>
                Claiming before 6 months pays out only the{" "}
                <strong>currently vested balance</strong>. All{" "}
                <strong>remaining unvested rewards are forfeited</strong>{" "}
                permanently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
