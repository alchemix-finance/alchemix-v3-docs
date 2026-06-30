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
            <div className={styles.manaMetaVal}>10,000 ALCX</div>
            <div className={styles.manaMetaSub}>
              Distributed proportional to total Mana
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
