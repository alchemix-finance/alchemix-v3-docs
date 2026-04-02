import React from "react";
import styles from "./styles.module.css";

function Chip({ children, variant = "default" }) {
  return (
    <div className={`${styles.chip} ${styles[`chip_${variant}`]}`}>
      {children}
    </div>
  );
}

function EdgeLabel({ children }) {
  return <span className={styles.edgeLabel}>{children}</span>;
}

/* ── Simple vertical connector with optional label ── */
function DownConnector({ label }) {
  return (
    <div className={styles.downWrap}>
      <div className={styles.seg} />
      {label && <EdgeLabel>{label}</EdgeLabel>}
      <div className={styles.seg} />
    </div>
  );
}

/* ── Allocator tree: one source → two labelled branches ── */
function AllocatorTree() {
  return (
    <div className={styles.treeWrap}>
      <div className={styles.treeTrunk} />
      <div className={styles.treeBranches}>
        <div className={styles.treeBranch}>
          <div className={styles.treeArm} />
          <EdgeLabel>uses</EdgeLabel>
          <Chip variant="contract">ETH Allocator</Chip>
        </div>
        <div className={styles.treeBranch}>
          <div className={styles.treeArm} />
          <EdgeLabel>uses</EdgeLabel>
          <Chip variant="contract">USDC Allocator</Chip>
        </div>
      </div>
    </div>
  );
}

export default function RolesHierarchy() {
  return (
    <div className={styles.wrap}>

      {/* Level 1 — MYT contracts */}
      <div className={styles.mytRow}>
        <Chip variant="myt">ETH Mix Yield Token</Chip>
        <Chip variant="myt">USDC Mix Yield Token</Chip>
      </div>

      {/* Merge: two arms converge → Admin */}
      <div className={styles.mergeWrap}>
        <div className={styles.mergeArms}>
          <div className={styles.mergeLeft} />
          <div className={styles.mergeRight} />
        </div>
        <div className={styles.seg} />
      </div>

      {/* Level 2 — Admin */}
      <Chip variant="admin">Admin (Owner)</Chip>

      {/* Split from Admin → two columns — adminSplit shares width with columns */}
      <div className={styles.lower}>
        <div className={styles.adminSplit}>
          <div className={styles.seg} />
          <div className={styles.splitBar} />
          <div className={styles.splitLegs}>
            <div className={styles.splitLeg}>
              <div className={styles.seg} />
              <EdgeLabel>setCurator()</EdgeLabel>
            </div>
            <div className={styles.splitLeg}>
              <div className={styles.seg} />
              <EdgeLabel>setIsAllocator()</EdgeLabel>
            </div>
          </div>
        </div>

        {/* Level 3 + 4 — two columns */}
        <div className={styles.columns}>

          {/* Curator column */}
          <div className={styles.column}>
            <Chip variant="role">Curator Role</Chip>
            <DownConnector label="uses" />
            <Chip variant="contract">Curator Contract</Chip>
          </div>

          {/* Allocator column */}
          <div className={styles.column}>
            <Chip variant="role">Allocator Role</Chip>
            <AllocatorTree />
          </div>

        </div>
      </div>

    </div>
  );
}
