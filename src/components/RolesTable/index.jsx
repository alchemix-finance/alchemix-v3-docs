import React from "react";
import styles from "./styles.module.css";

const ROLES = [
  {
    role: "Admin (Owner)",
    assignedBy: "Deployer",
    assignedByIsCode: false,
    governs: ["ETH Mix Yield Token", "USDC Mix Yield Token"],
    governsLabel: "Governs",
    isRoot: true,
  },
  {
    role: "Curator",
    assignedBy: "setCurator(address)",
    assignedByIsCode: true,
    governs: ["Curator Contract"],
    governsLabel: "Contract",
    isRoot: false,
  },
  {
    role: "Allocator",
    assignedBy: "setIsAllocator(address, bool)",
    assignedByIsCode: true,
    governs: ["ETH Allocator Contract", "USDC Allocator Contract"],
    governsLabel: "Contracts",
    isRoot: false,
  },
];

export default function RolesTable() {
  return (
    <div className={styles.wrap}>
      {ROLES.map((r, i) => (
        <div
          key={r.role}
          className={`${styles.row} ${r.isRoot ? styles.rowRoot : ""} ${i < ROLES.length - 1 ? styles.rowBorder : ""}`}
        >
          <div className={styles.roleCol}>
            <span className={styles.roleBadge}>{r.role}</span>
          </div>
          <div className={styles.detailCol}>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Assigned by</span>
              {r.assignedByIsCode
                ? <code className={styles.detailCode}>{r.assignedBy}</code>
                : <span className={styles.detailValue}>{r.assignedBy}</span>
              }
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>{r.governsLabel}</span>
              <span className={styles.detailValue}>{r.governs.join(" · ")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
