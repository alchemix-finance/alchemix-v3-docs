import React from "react";
import styles from "./styles.module.css";

export default function HealthBar({
  currentLtv = 62,
  maxLtv = 90,
  liqLtv = 95,
}) {
  const fillClass =
    currentLtv >= liqLtv
      ? styles.fillDanger
      : currentLtv >= maxLtv * 0.85
        ? styles.fillWarning
        : styles.fillSafe;

  return (
    <div className={styles.wrap}>
      {/* ── Health bar ── */}
      <div className={styles.barSection}>
        <div className={styles.barLabel}>Position health</div>

        <div style={{ padding: "1.25rem 0 1.75rem" }}>
          <div className={styles.track}>
            <div
              className={`${styles.fill} ${fillClass}`}
              style={{ width: `${currentLtv}%` }}
            />

            {/* Current LTV */}
            <div
              className={`${styles.marker} ${styles.markerCurrent}`}
              style={{ left: `${currentLtv}%` }}
            >
              <div className={styles.markerLine} />
              <span className={styles.markerLabel}>Current</span>
              <span className={styles.markerValue}>{currentLtv}%</span>
            </div>

            {/* Max LTV */}
            <div
              className={`${styles.marker} ${styles.markerMax}`}
              style={{ left: `${maxLtv}%` }}
            >
              <div className={styles.markerLine} />
              <span className={styles.markerLabel}>Max</span>
              <span className={styles.markerValue}>{maxLtv}%</span>
            </div>

            {/* Liquidation LTV */}
            <div
              className={`${styles.marker} ${styles.markerLiq}`}
              style={{ left: `${liqLtv}%` }}
            >
              <div className={styles.markerLine} />
              <span className={styles.markerLabel}>Liq</span>
              <span className={styles.markerValue}>{liqLtv}%</span>
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: "#7c5cfc" }} />
            Your live leverage
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: "#4ade80" }} />
            Max LTV — borrowing ceiling
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: "#ef4444" }} />
            Liq LTV — liquidation threshold
          </div>
        </div>
      </div>

      {/* ── Liquidation flow ── */}
      <div className={styles.flowSection}>
        <div className={styles.flowLabel}>When LTV crosses 95%</div>

        <div className={styles.flow}>
          <div className={styles.flowNode}>
            <div className={styles.flowNodeTitle}>LTV exceeds 95%</div>
            <div className={styles.flowNodeSub}>Position flagged</div>
          </div>

          <div className={styles.flowArrow}>&#x2192;</div>

          <div className={styles.flowNode}>
            <div className={styles.flowNodeTitle}>Redemption check</div>
            <div className={styles.flowNodeSub}>Can early redemption restore 85%?</div>
          </div>

          <div className={styles.flowArrow}>&#x2192;</div>

          <div className={styles.flowBranch}>
            <div className={`${styles.flowBranchNode} ${styles.flowBranchYes}`}>
              <div className={styles.branchDot} style={{ background: "#5ba88a" }} />
              <div className={styles.branchText}>Yes — early redemption only</div>
            </div>
            <div className={`${styles.flowBranchNode} ${styles.flowBranchNo}`}>
              <div className={styles.branchDot} style={{ background: "#dc6060" }} />
              <div className={styles.branchText}>No — redemption + collateral used</div>
            </div>
          </div>

          <div className={styles.flowArrow}>&#x2192;</div>

          <div className={`${styles.flowNode} ${styles.flowResult}`}>
            <div className={styles.flowResultTitle}>Restored to 85%</div>
            <div className={styles.flowResultSub}>Remaining position untouched</div>
          </div>
        </div>
      </div>
    </div>
  );
}
