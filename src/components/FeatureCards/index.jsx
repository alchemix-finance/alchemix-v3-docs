import React from "react";
import styles from "./styles.module.css";

export default function FeatureCards({ items = [] }) {
  return (
    <div className={styles.grid}>
      {items.map((item, i) => {
        const inner = (
          <>
            <span className={styles.number}>0{i + 1}</span>
            <span className={styles.title}>{item.title}</span>
            <p className={styles.body}>{item.body}</p>
          </>
        );
        return item.href ? (
          <a key={i} className={`${styles.card} ${styles.cardLink}`} href={item.href}>
            {inner}
          </a>
        ) : (
          <div key={i} className={styles.card}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
