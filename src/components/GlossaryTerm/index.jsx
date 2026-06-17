import React, { useCallback, useId, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import { getTerm } from "@site/src/data/glossary";
import styles from "./styles.module.css";

// Delay before a hover-out closes the popover, so the pointer can travel from
// the term to the card (WCAG 2.1 SC 1.4.13: hoverable).
const CLOSE_DELAY = 120;

// Inline glossary term. Baseline behaviour is a plain link to the glossary
// entry, so a tap on touch always just navigates. On devices that can hover
// (and for keyboard focus) it additionally opens a definition popover. The
// popover is rendered only while open, so it never reaches the SSR HTML, the
// search index, or the "Copy for LLMs" markdown walk.
export default function GlossaryTerm({ id, children }) {
  const term = getTerm(id);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);
  const popoverId = `glossary-term-${useId()}`;

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openNow = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, [cancelClose]);

  const handleBlur = useCallback(
    (e) => {
      // Keep open if focus moved into the popover (e.g. tabbing to its link).
      if (wrapRef.current && wrapRef.current.contains(e.relatedTarget)) return;
      cancelClose();
      setOpen(false);
    },
    [cancelClose]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        cancelClose();
        setOpen(false);
      }
    },
    [cancelClose]
  );

  // Unknown id: degrade to plain text rather than break the page.
  if (!term) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`<Term>: unknown glossary id "${id}"`);
    }
    return <>{children}</>;
  }

  return (
    <span
      ref={wrapRef}
      className={styles.wrap}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      onFocus={openNow}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <Link
        to={`/user/glossary#${term.id}`}
        className={styles.term}
        aria-describedby={open ? popoverId : undefined}
      >
        {children ?? term.term}
      </Link>
      {open && (
        <span
          id={popoverId}
          role="tooltip"
          className={`${styles.popover} glossary-popover`}
        >
          <span className={styles.title}>{term.term}</span>
          <span className={styles.def}>{term.definition}</span>
          <Link to={term.href} className={styles.more}>
            {term.linkLabel} →
          </Link>
        </span>
      )}
    </span>
  );
}
