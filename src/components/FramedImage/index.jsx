import React from "react";
import styles from "./styles.module.css";

export default function FramedImage({ src, alt = "" }) {
  return (
    <div className={styles.frame}>
      {/* Fill — dark mat behind the image, inset by corner positions */}
      <div className={styles.bg} />

      {/* Lines — run full frame width/height; overhang outside the fill is the bracket mark */}
      <div className={`${styles.lineH} ${styles.lineTop}`} />
      <div className={`${styles.lineH} ${styles.lineBottom}`} />
      <div className={`${styles.lineV} ${styles.lineLeft}`} />
      <div className={`${styles.lineV} ${styles.lineRight}`} />

      {/* Corner dots — centred on line intersections */}
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <img src={src} alt={alt} className={styles.img} />
    </div>
  );
}
