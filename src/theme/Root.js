import React from "react";
import { useLocation } from "@docusaurus/router";
import ReadingProgress from "@site/src/components/ReadingProgress";

// Wraps the entire app; persists across client-side route changes.
// Used to mount the global reading-progress bar above all page content.
//
// The Academy is excluded. It is a course rather than a document, it renders its
// own shell and its own progress, and a second scroll bar pinned above that reads
// as leftover documentation chrome. The members area is excluded for the same
// reason: it has its own shell, and the bar crossed its season progress bar.
export default function Root({ children }) {
  const { pathname } = useLocation();
  const own = (base) => pathname === base || pathname.startsWith(`${base}/`);
  const hasOwnShell = own("/academy") || own("/members");

  return (
    <>
      {hasOwnShell ? null : <ReadingProgress />}
      {children}
    </>
  );
}
