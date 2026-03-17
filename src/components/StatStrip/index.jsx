import React from "react";
import styles from "./styles.module.css";

export default function StatStrip({ items = [] }) {
  return (
    <div className={styles.strip}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className={styles.divider} />}
          <div className={styles.stat}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
