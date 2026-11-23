import React, { useEffect, useRef } from "react";
import { useAppContext } from "../AppMock";
import styles from "./changes.module.css";

/**
 * What a step changed, one stat to a row: the stat as the practice vault
 * shows it, beside the sentence that explains it.
 *
 * A paragraph under the vault put each explanation a form's height from the
 * number it was about, and on a phone the stats alone fill the window, so the
 * two were never on screen together. Here every row carries its own number,
 * so the row reads whole at any window size.
 *
 *   <Changes>
 *   <Change stat="debt">
 *
 *   <Stat name="debt">Debt</Stat> reads 5,000, one USDC of debt for each alUSD you received.
 *
 *   </Change>
 *   </Changes>
 *
 * `stat` is a tile key of the practice vault ("deposit", "debt", "health",
 * "earmarked", "borrowable", "ltv"). The row mirrors that tile on the
 * practice element above it on the page: the same figure and change chip,
 * following it as it counts. Pointing at a row lights its tile on the vault
 * and its field on the strip, as a `Stat` does.
 *
 * Where the page's text sits beside the practice element (`Bench`), the stat
 * itself is next to the row, so the row drops its copy and keeps a rule on
 * its left that lights with the stat.
 */
export function Changes({ children }) {
  return (
    <div className={styles.changes} data-changes="">
      {children}
    </div>
  );
}

export function Change({ stat, children }) {
  const { pointer, setPointer } = useAppContext();
  // Lit while its stat is pointed at, from here, from a `Stat` or from the
  // stat itself on the practice element.
  const on = Boolean(pointer) && pointer.name === stat && pointer.scope == null;
  const row = useRef(null);
  const slot = useRef(null);

  useEffect(() => {
    const el = row.current;
    const into = slot.current;
    if (!el || !into || typeof MutationObserver === "undefined") return undefined;
    // The practice element this row is about: the last one before it on its page.
    const marks = [...document.querySelectorAll("main [data-step]")].filter(
      (m) => m.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const stage = marks.length ? marks[marks.length - 1].nextElementSibling : null;
    const tile = stage ? stage.querySelector(`[data-tile="${stat}"]`) : null;
    if (!tile) return undefined;
    let raf = 0;
    const copy = () => {
      raf = 0;
      const c = tile.cloneNode(true);
      c.removeAttribute("data-tile");
      // The wash is the vault's own signal that a number is moving.
      c.querySelectorAll('[class*="wash_"]').forEach((n) => n.remove());
      into.replaceChildren(c);
    };
    const mo = new MutationObserver(() => {
      if (!raf) raf = window.requestAnimationFrame(copy);
    });
    mo.observe(tile, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    copy();
    return () => {
      mo.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [stat]);

  const set = setPointer ?? (() => {});
  return (
    <div
      ref={row}
      className={`${styles.change} ${on ? styles.changeOn : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") set({ name: stat, scope: null });
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") set((p) => (p && p.name === stat && p.scope == null ? null : p));
      }}
    >
      <div ref={slot} className={styles.slot} aria-hidden="true" />
      <div className={styles.why}>{children}</div>
    </div>
  );
}
