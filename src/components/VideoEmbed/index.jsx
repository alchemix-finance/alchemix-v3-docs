import React from "react";
import styles from "./styles.module.css";

export default function VideoEmbed({ videoId, title }) {
  return (
    <>
      <div className={styles.wrapper}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className={styles.divider}>
        <span>Written walkthrough</span>
      </div>
    </>
  );
}
