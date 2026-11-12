import React from "react";
import { useLocation } from "@docusaurus/router";
import ReadingProgress from "@site/src/components/ReadingProgress";

// Wraps the entire app; persists across client-side route changes.
// Used to mount the global reading-progress bar above all page content.
//
// The Academy is excluded. It is a course rather than a document, it renders its
// own shell and its own progress, and a second scroll bar pinned above that reads
// as leftover documentation chrome.
export default function Root({ children }) {
  const { pathname } = useLocation();
  const isAcademy = pathname === "/academy" || pathname.startsWith("/academy/");

  return (
    <>
      {isAcademy ? null : <ReadingProgress />}
      {children}
    </>
  );
}
