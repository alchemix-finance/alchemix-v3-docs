import React from "react";
import DocBreadcrumbs from "@theme-original/DocBreadcrumbs";
import CopyForLLMButton from "../../components/CopyForLLMButton";
import styles from "./styles.module.css";

export default function DocBreadcrumbsWrapper(props) {
  return (
    <div className={styles.row}>
      <DocBreadcrumbs {...props} />
      <CopyForLLMButton />
    </div>
  );
}
