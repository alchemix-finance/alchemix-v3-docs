import React from "react";
import styles from "./styles.module.css";

export default function PageBanner({ title }) {
  return (
    <div className={styles.banner}>
      {/* Fill — stops exactly at the corner dot positions */}
      <div className={styles.bg} />

      {/* Lines — span the full banner; the portions outside the fill
          are the "bleed" that reads as overhanging marks */}
      <div className={`${styles.lineH} ${styles.lineTop}`} />
      <div className={`${styles.lineH} ${styles.lineBottom}`} />
      <div className={`${styles.lineV} ${styles.lineLeft}`} />
      <div className={`${styles.lineV} ${styles.lineRight}`} />

      {/* Dots — solid, centred on the line intersections */}
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <span className={styles.title}>{title}</span>
    </div>
  );
}
