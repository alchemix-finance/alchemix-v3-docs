import React, { useEffect, useRef, useState } from "react";
import s from "./home.module.css";

/**
 * Tabs in a section head (feedback 2026-10-28). `useHashTabs` picks the tab
 * from the address ("#earn", "#positions") on load and on every hash change,
 * and scrolls the section into view; `TabList` is the pill row with arrow
 * keys; `TabPanel` hides the others. Ids are `<prefix>-tab-<key>` and
 * `<prefix>-panel-<key>`.
 */
export function useHashTabs(keys, sectionId) {
  const [tab, setTab] = useState(keys[0]);
  useEffect(() => {
    const pick = () => {
      const h = window.location.hash.slice(1);
      if (!keys.includes(h)) return;
      setTab(h);
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [tab, setTab];
}

export function TabList({ prefix, keys, labels, label, tab, onChange }) {
  const refs = useRef({});
  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = keys.indexOf(tab);
    const next = keys[(i + (e.key === "ArrowRight" ? 1 : keys.length - 1)) % keys.length];
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div className={s.tabs} role="tablist" aria-label={label}>
      {keys.map((k) => (
        <button
          key={k}
          ref={(el) => {
            refs.current[k] = el;
          }}
          type="button"
          role="tab"
          id={`${prefix}-tab-${k}`}
          aria-selected={tab === k}
          aria-controls={`${prefix}-panel-${k}`}
          tabIndex={tab === k ? 0 : -1}
          className={`${s.tab} ${tab === k ? s.tabOn : ""}`}
          onClick={() => onChange(k)}
          onKeyDown={onKey}
        >
          {labels[k]}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ prefix, k, tab, children }) {
  return (
    <div
      role="tabpanel"
      id={`${prefix}-panel-${k}`}
      aria-labelledby={`${prefix}-tab-${k}`}
      hidden={tab !== k}
      className={s.tabPanel}
    >
      {tab === k ? children : null}
    </div>
  );
}
