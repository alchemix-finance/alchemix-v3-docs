import React from "react";
import styles from "./styles.module.css";

function Connector() {
  return (
    <div className={styles.connector}>
      <div className={styles.connectorLine} />
      <div className={styles.connectorArrow} />
    </div>
  );
}

function ActionNode({ children }) {
  return (
    <div className={styles.actionNode}>
      <code className={styles.actionCode}>{children}</code>
    </div>
  );
}

function CheckStep({ label, yesContent }) {
  return (
    <div className={styles.checkCard}>
      <div className={styles.checkHeader}>
        <span className={styles.checkBadge}>Check</span>
        <span className={styles.checkLabel}>{label}</span>
      </div>
      <div className={styles.yesBranch}>
        <span className={styles.yesTag}>Yes</span>
        <div className={styles.yesContent}>{yesContent}</div>
      </div>
      <div className={styles.noBranch}>
        <span className={styles.noTag}>No</span>
        <span className={styles.noContinue}>Continue to next step</span>
      </div>
    </div>
  );
}

export default function AllocationFlow() {
  return (
    <div className={styles.wrap}>

      <div className={styles.startNode}>Start: Allocate to Strategy</div>

      <Connector />

      <CheckStep
        label="KillSwitch On?"
        yesContent={
          <ActionNode>setKillSwitch(false)</ActionNode>
        }
      />

      <Connector />

      <CheckStep
        label="Cap Needs Raising?"
        yesContent={
          <div className={styles.capSteps}>
            <ActionNode>submitIncreaseAbsoluteCap(strategy, amount)</ActionNode>
            <ActionNode>increaseAbsoluteCap(strategy, amount)</ActionNode>
            <ActionNode>submitIncreaseRelativeCap(strategy, amount)</ActionNode>
            <ActionNode>increaseRelativeCap(strategy, amount)</ActionNode>
          </div>
        }
      />

      <Connector />

      <div className={styles.allocateNode}>
        <span className={styles.allocateBadge}>Allocate</span>
        <code className={styles.allocateCode}>allocate(strategy, amount)</code>
      </div>

      <Connector />

      <div className={styles.doneNode}>Done</div>

    </div>
  );
}
