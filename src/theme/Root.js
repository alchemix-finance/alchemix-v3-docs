import React from "react";
import ReadingProgress from "@site/src/components/ReadingProgress";

// Wraps the entire app; persists across client-side route changes.
// Used to mount the global reading-progress bar above all page content.
export default function Root({ children }) {
  return (
    <>
      <ReadingProgress />
      {children}
    </>
  );
}
