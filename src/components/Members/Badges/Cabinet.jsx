import React, { useEffect, useRef, useState } from "react";
import Deck from "./Deck";
import { clipStep, countVars, indexAt, shiftOf } from "./drawer";
import c from "./cards.module.css";

/**
 * The Arcana cabinet (Keenan, 2026-11-05: "have decks visible from top to
 * bottom of that space, while the hover effect maximizes the deck of choice
 * ... Then clicking on it fans out and reveals its cards"). A bounded box
 * holding every group as a deck (Badges/Deck.jsx), stacked top to bottom like
 * folders in a filing cabinet.
 *
 * Closed, the decks overlap so each shows the top of its stack with its label
 * beside it. Moving the pointer down the box lifts the deck under it: it shows
 * whole and comes forward, and the decks below ease down to make room. This is
 * the fan's drawer turned vertical, with the same math (drawer.js). With the
 * pointer away, the deck holding the latest card stays lifted. On touch the
 * cabinet leaves vertical drags to the page; a tap opens a deck.
 *
 * A click on a deck fans it out across the box. The other decks collapse to
 * their tabs, above it at the top and below it at the bottom, and stay
 * clickable. Round two (Keenan, 2026-11-05: "lose this right section ...
 * incorporate into this deck opening process"): a card drawn from the fan
 * lands in a reading spot under it with its facts, and the box grows to hold
 * it. Escape puts a drawn card back, then closes the deck. The open deck's tab
 * closes both; another deck's tab opens that one instead.
 *
 * Motion (round two): every move is a transform or an opacity. `phase` marks
 * the deck whose cards are travelling out (opening) or home (closing), so
 * cards.module.css can stagger them, and `shutting` holds the decks until the
 * cards are back in their stack.
 *
 *   groups        from groupBadges(), in page order
 *   tabOf         (group) => { name, intro, season } for the tab
 *   homeId        the latest card: its deck is lifted at rest, its card tops its stack
 *   drawn         the drawn card's id, or null
 *   onDraw        (id or null) draws a card or puts it back
 *   renderDetail  (badge) => the card's facts for the reading spot
 *   spotRef       ref set to the reading spot, for scrolling it into view
 *   the rest      passed through to each Deck
 */
export default function Cabinet({ groups, tabOf, homeId, drawn, onDraw, lookup, labelOf, renderDetail, spotRef }) {
  const ref = useRef(null);
  const cabSize = useRef(null);
  const deckSize = useRef(null);
  const tabs = useRef([]);
  const timers = useRef({});
  const boxReadNow = useRef(0);
  const n = groups.length;
  const deckOf = (id) => (id ? groups.findIndex((g) => g.badges.some((b) => b.id === id)) : -1);
  const home = Math.max(0, deckOf(homeId));
  const [lift, setLift] = useState(null);
  const [open, setOpen] = useState(() => (deckOf(drawn) >= 0 ? deckOf(drawn) : null));
  const [opening, setOpening] = useState(null);
  const [closing, setClosing] = useState(null);
  const [shutting, setShutting] = useState(false);
  // How far the reading spot pushes the decks below the open one (read), and the box's own
  // extra height (boxRead), which shrinks only once those decks have moved back up.
  const [read, setRead] = useState(0);
  const [boxRead, setBoxRead] = useState(0);
  const lifted = open === null ? lift ?? home : null;

  function later(key, ms, fn) {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(fn, ms);
  }
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  function setExtra(extra) {
    setRead(extra);
    if (extra >= boxReadNow.current) {
      clearTimeout(timers.current.box);
      boxReadNow.current = extra;
      setBoxRead(extra);
    } else {
      later("box", 340, () => {
        boxReadNow.current = extra;
        setBoxRead(extra);
      });
    }
  }

  function openDeck(i) {
    const prev = open;
    setOpen(i);
    setLift(i);
    setShutting(false);
    setOpening(i);
    later("opening", 1000, () => setOpening(null));
    if (prev !== null && prev !== i) {
      setClosing(prev);
      later("closing", 560, () => setClosing(null));
    }
    setExtra(0);
  }

  function closeDeck() {
    if (open === null) return;
    const i = open;
    if (drawn) onDraw(null);
    setOpen(null);
    setLift(i);
    setOpening(null);
    setClosing(i);
    setShutting(true);
    later("closing", 560, () => setClosing(null));
    later("shutting", 560, () => setShutting(false));
    setExtra(0);
  }

  // A drawn card opens its deck (a #badge-<key> arrival, a Discord return, the collapsed row).
  useEffect(() => {
    const i = deckOf(drawn);
    if (i >= 0 && i !== open) openDeck(i);
  }, [drawn]); // eslint-disable-line react-hooks/exhaustive-deps

  /** The open deck reports how far down its reading spot reaches (px from the deck's top). */
  function onNeed(need) {
    const cab = cabSize.current?.offsetHeight ?? 0;
    const tab = tabs.current[0]?.offsetHeight ?? 0;
    setExtra(need > 0 ? Math.max(0, Math.ceil(need - (cab - (n - 1) * tab))) : 0);
  }

  function onPointerMove(e) {
    // Touch: vertical drags scroll the page (round two); a tap opens a deck.
    if (open !== null || e.pointerType === "touch") return;
    const el = ref.current;
    const box = cabSize.current?.offsetHeight;
    const item = deckSize.current?.offsetHeight;
    if (!el || !box || !item) return;
    const { step, open: openLen } = clipStep(n, box, item);
    const i = indexAt(e.clientY - el.getBoundingClientRect().top, { n, step, item, open: openLen, gap: lifted });
    if (i !== null && i !== lift) setLift(i);
  }

  function toggle(i) {
    if (open === i) closeDeck();
    else {
      if (drawn) onDraw(null);
      openDeck(i);
    }
  }

  function onTabKey(e, i) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const j = e.key === "ArrowDown" ? Math.min(n - 1, i + 1) : Math.max(0, i - 1);
    tabs.current[j]?.focus();
  }

  // Escape puts a drawn card back first, then closes the deck. It listens on the window while a
  // deck is open, since a click on a card's slot leaves the focus on the page rather than in the cabinet.
  const escape = useRef(null);
  escape.current = onKeyDown;
  useEffect(() => {
    if (open === null) return undefined;
    const on = (e) => escape.current(e);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open]);

  function onKeyDown(e) {
    if (e.key !== "Escape" || open === null || e.defaultPrevented) return;
    e.preventDefault();
    if (drawn && deckOf(drawn) === open) {
      onDraw(null);
      return;
    }
    const i = open;
    closeDeck();
    tabs.current[i]?.focus();
  }

  const busy = opening !== null || closing !== null;
  const cls = [c.drawers, open !== null ? c.fanned : "", shutting ? c.shutting : "", busy ? c.busy : ""].join(" ");

  return (
    <div className={c.cabinet}>
      <div
        ref={ref}
        className={cls}
        style={{ ...countVars(n), "--read": `${read}px`, "--box-read": `${boxRead}px` }}
        onPointerMove={onPointerMove}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setLift(null);
        }}
      >
        {/* Measures for the pointer math: the box and one whole deck, as CSS sizes them. */}
        <span ref={cabSize} className={c.sizeCab} aria-hidden="true" />
        <span ref={deckSize} className={c.sizeDeck} aria-hidden="true" />
        {groups.map((g, i) => (
          <Deck
            key={g.id}
            index={i}
            group={g}
            tab={tabOf(g)}
            slot={{ "--i": i, "--shift": lifted === null ? 0 : shiftOf(i, lifted), "--after": open !== null && i > open ? 1 : 0 }}
            open={open === i}
            collapsed={open !== null && open !== i}
            lifted={lifted === i}
            phase={opening === i ? "opening" : closing === i ? "closing" : null}
            lookup={lookup}
            homeId={homeId}
            drawn={open === i ? drawn : null}
            onDraw={onDraw}
            labelOf={labelOf}
            renderDetail={renderDetail}
            spotRef={spotRef}
            onNeed={onNeed}
            onToggle={() => toggle(i)}
            onTabKey={(e) => onTabKey(e, i)}
            onTabFocus={() => {
              if (open === null) setLift(i);
            }}
            tabRef={(el) => {
              tabs.current[i] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
