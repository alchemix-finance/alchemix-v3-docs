import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import BadgeCard, { cardFace } from "./BadgeCard";
import { fmtInt } from "../lib/format";
import { tierOf } from "../Home/model";
import { BADGES } from "../copy";
import { countVars, fitGap, fitStep, indexAt, shiftOf } from "./drawer";
import c from "./cards.module.css";

// One easing family for every settle (round two, 2026-11-05); cards.module.css has the same curve as --settle.
const SETTLE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const DRAW_MS = 380;

const stillMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One deck in the Arcana cabinet (Badges/Cabinet.jsx), 2026-11-05.
 *
 * Closed, the cards are a squared stack at the deck's left: the top card face
 * up, the rest behind it with a small offset and a faint copper edge so they
 * read as cards. The top card is the latest card when it is in this deck, else
 * the first earned one, else the first. The deck's label (name, the season's
 * line, how many are earned) sits beside the stack. Collapsed or open, the
 * label moves to a tab along the deck's top; the two labels cross-fade.
 *
 * Open, the same card buttons travel out of the stack to a fan across the
 * box, edge to edge. Moving the pointer along the fan (or a sideways touch
 * drag) lifts the card under it, and the cards after it slide aside when they
 * would cover it (drawer.js holds the math). One caption under the fan names
 * the lifted card. Every pixel of a card's slot takes the click.
 *
 * Round two (2026-11-05): a click on a card draws it. The card flies from its
 * slot to the reading spot and grows on the way. On a wide screen (round three)
 * the spot takes the left of the open deck and the fan moves aside into the
 * rest with smaller cards, so the box keeps its height; on a phone the spot
 * sits under the fan (a FLIP: measure
 * both boxes, start the large card at the slot's box, then ease it home), and
 * its facts fade and rise in beside it. The slot stays as a faint outline.
 * Putting a card back runs the same flight in reverse. Drawing another card
 * puts the first back.
 *
 * House look (2026-11-05, Keenan: the box's styling and padding read as
 * generic): the label is a small-caps marker (the deck's place, 01 to 05, and
 * its group) and a thin bar of earned over total. For the four plain decks the
 * marker is the whole label; the season deck adds its name and its line.
 * Collapsed or open, the label and the count share one line.
 *
 * Round six (2026-11-05, Keenan: no visible way back from an open deck): the
 * open deck's tab carries a "Close deck" text button after the count, which
 * does what a click on the open tab does. A drawn card's facts end with "Put
 * the card back", which does what Escape does once.
 *
 * Keyboard: the tab is a button (Enter or Space opens and closes, arrow up
 * and down move to the next deck's tab, arrow right steps into an open fan).
 * In the fan the cards are buttons in order; arrow left and right step along,
 * Enter or Space draws, arrow up and down go back to the tabs. Escape is
 * handled by the cabinet.
 */
export default function Deck({
  group,
  index,
  tab,
  slot,
  open,
  collapsed,
  lifted,
  phase,
  lookup,
  homeId,
  drawn,
  onDraw,
  labelOf,
  renderDetail,
  spotRef,
  onNeed,
  onToggle,
  onTabKey,
  onTabFocus,
  tabRef,
}) {
  const fanRef = useRef(null);
  const tabEl = useRef(null);
  const spotEl = useRef(null);
  const timer = useRef(null);
  const [hover, setHover] = useState(null);
  const badges = group.badges;
  const n = badges.length;
  const mid = (n - 1) / 2;
  const earned = badges.filter((b) => b.earned).length;

  const want = open && drawn && badges.some((b) => b.id === drawn) ? drawn : null;
  // The card in the reading spot: it trails `want` while a card flies back or the deck closes.
  const [shown, setShown] = useState(want);
  const [leaving, setLeaving] = useState(null);

  useEffect(() => {
    if (!open) setHover(null);
  }, [open]);

  const homeIdx = badges.findIndex((b) => b.id === homeId);
  const earnedIdx = badges.findIndex((b) => b.earned);
  const top = homeIdx >= 0 ? homeIdx : earnedIdx >= 0 ? earnedIdx : 0;
  const shownIdx = shown ? badges.findIndex((b) => b.id === shown) : -1;
  const h = open ? hover ?? (shownIdx >= 0 ? shownIdx : top) : null;
  const gap = fitGap(h, n);

  /** The transform that puts `card` (untransformed) over `box`, scaled from its top left corner. */
  function inverse(card, box) {
    const b = card.getBoundingClientRect();
    return `translate(${box.left - b.left}px, ${box.top - b.top}px) scale(${box.width / b.width}, ${box.height / b.height})`;
  }

  const spotCard = () => spotEl.current?.querySelector(`.${c.panelCard}`);
  const slotBox = (id) => fanRef.current?.querySelector(`[data-slot="${id}"]`)?.getBoundingClientRect();

  // Draw or put back when the wanted card changes.
  useEffect(() => {
    clearTimeout(timer.current);
    if (want) {
      setLeaving(null);
      setShown(want);
      return;
    }
    if (!shown) return;
    if (stillMotion()) {
      setShown(null);
      setLeaving(null);
      return;
    }
    if (open) {
      // Put back: the large card flies to its slot while the facts fade.
      const card = spotCard();
      const box = slotBox(shown);
      if (card && box) {
        card.style.transition = "none";
        card.style.transform = "none";
        const to = inverse(card, box);
        card.style.transformOrigin = "0 0";
        card.style.willChange = "transform";
        void card.offsetWidth;
        card.style.transition = `transform ${DRAW_MS}ms ${SETTLE}`;
        card.style.transform = to;
      }
      setLeaving("back");
      timer.current = setTimeout(() => {
        setShown(null);
        setLeaving(null);
      }, DRAW_MS);
    } else {
      // The deck is closing: the spot fades as the deck closes up.
      setLeaving("fade");
      timer.current = setTimeout(() => {
        setShown(null);
        setLeaving(null);
      }, 200);
    }
  }, [want, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(timer.current), []);

  // Draw: start the large card over its slot, then ease it to the reading spot.
  useLayoutEffect(() => {
    if (!shown || !open || stillMotion()) return;
    const card = spotCard();
    const box = slotBox(shown);
    if (!card || !box) return;
    card.style.transition = "none";
    card.style.transformOrigin = "0 0";
    card.style.transform = inverse(card, box);
    card.style.willChange = "transform";
    void card.offsetWidth;
    card.style.transition = `transform ${DRAW_MS}ms ${SETTLE}`;
    card.style.transform = "none";
    const done = () => {
      card.style.willChange = "";
    };
    card.addEventListener("transitionend", done, { once: true });
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tell the cabinet how far down the reading spot reaches, so the box grows to hold it.
  useEffect(() => {
    if (!open) return undefined;
    const el = spotEl.current;
    if (!el || !shown) {
      onNeed(0);
      return undefined;
    }
    const report = () => onNeed(el.offsetTop + el.offsetHeight + 24);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [shown, open]); // eslint-disable-line react-hooks/exhaustive-deps

  /** The card under the pointer, measured against the fan as it is laid out now. */
  function onPointerMove(e) {
    if (!open) return;
    const el = fanRef.current;
    const li = el?.querySelector("li");
    if (!li) return;
    // Measured from the first slot (never shifted), so this holds beside a drawn card too,
    // where the fan starts further right and its cards are smaller (round three).
    const left = el.getBoundingClientRect().left;
    const first = li.getBoundingClientRect();
    const x0 = first.left - left;
    const item = first.width;
    const { step, open: openLen } = fitStep(n, el.clientWidth - x0, item);
    const i = indexAt(e.clientX - left - x0, { n, step, item, open: openLen, gap });
    if (i !== null && i !== hover) setHover(i);
  }

  function onPointerLeave(e) {
    // After a touch drag the card stays lifted, so the last one sifted to is the one a tap draws.
    if (e.pointerType !== "touch") setHover(null);
  }

  function focusCard(i) {
    fanRef.current?.querySelectorAll("button")[i]?.focus();
  }

  function onCardKey(e, i) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      focusCard(e.key === "ArrowRight" ? Math.min(n - 1, i + 1) : Math.max(0, i - 1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      onTabKey(e);
    }
  }

  function onTab(e) {
    if (open && e.key === "ArrowRight") {
      e.preventDefault();
      focusCard(h ?? 0);
      return;
    }
    onTabKey(e);
  }

  // A click on a closed deck's body opens it too (the tab is the keyboard path).
  function onBodyClick(e) {
    if (open || e.target.closest("button")) return;
    onToggle();
  }

  // "Close deck": the same as a click on the open tab (a drawn card goes back, then the deck closes).
  // The focus returns to the tab, since the button fades out with the open state.
  function onClose() {
    onToggle();
    tabEl.current?.focus({ preventScroll: true });
  }

  // The slot takes the click, so a tilted card's corners respond; drawing the drawn card puts it back.
  function onSlot(id) {
    if (!open) return;
    onDraw(id === shown && !leaving ? null : id);
  }

  const shownBadge = shown ? badges.find((b) => b.id === shown) : null;
  const captioned = open && h !== null ? badges[h] : null;
  const caption = captioned ? labelOf(captioned) : null;
  const count = BADGES.deck.earned(earned, n);
  const cls = [
    c.drawer,
    open ? c.drawerOpen : "",
    collapsed ? c.drawerShut : "",
    lifted ? c.drawerLifted : "",
    phase === "opening" ? c.opening : "",
    phase === "closing" ? c.closing : "",
    open && shownBadge ? c.drawing : "",
  ].join(" ");

  // The marker: the deck's place in the cabinet and its group, in small caps. The numeral is only
  // for the eye. For a plain deck the group's name is the deck's name, so it takes the name's colors
  // (round five, 2026-11-05: no second name line under it).
  const marker = (
    <span className={c.tabMarker}>
      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <span className={`${c.tabGroup} ${tab.season ? "" : c.tabGroupName}`}>{BADGES.groups[group.group]}</span>
    </span>
  );
  const pct = n ? Math.round((earned / n) * 100) : 0;
  return (
    <div className={cls} style={{ ...slot, "--cards": n }} data-deck={group.group} onClick={onBodyClick}>
      <span className={c.liftShadow} aria-hidden="true" />
      <button
        type="button"
        ref={(el) => {
          tabEl.current = el;
          tabRef(el);
        }}
        className={c.tab}
        onClick={onToggle}
        onKeyDown={onTab}
        onFocus={onTabFocus}
        aria-expanded={open}
        data-deck-tab={group.group}
      >
        {/* Collapsed or open: the marker (for the season, its name and line after it) on one line, the count at the right. */}
        <span className={`${c.tabRow} ${tab.intro ? c.tabTwo : ""}`} aria-hidden={!(open || collapsed)}>
          <span className={c.rowText}>
            {marker}
            {tab.season ? <span className={c.tabSeason}>{tab.name}</span> : null}
            {tab.intro ? <span className={c.tabIntro}>{tab.intro}</span> : null}
          </span>
          <span className={c.tabCount}>{count}</span>
        </span>
        {/* Closed, beside the stack: the marker with the count on its line (for the season, its name
            and line under it), then a thin bar of earned over total that runs to the box's right inset. */}
        <span className={c.tabSide} aria-hidden={open || collapsed}>
          <span className={c.tabHead}>
            {marker}
            <span className={c.tabCount}>{count}</span>
          </span>
          {tab.season ? <span className={`${c.tabSeason} ${c.tabLine}`}>{tab.name}</span> : null}
          {tab.intro ? <span className={`${c.tabIntro} ${c.tabLine}`}>{tab.intro}</span> : null}
          <span className={c.tabBar} aria-hidden="true">
            {pct > 0 ? <span style={{ width: `${pct}%` }} /> : null}
          </span>
        </span>
      </button>
      {/* A sibling of the tab, not inside it (a button cannot hold a button). Only the open deck shows it. */}
      <button type="button" className={`${c.textButton} ${c.deckClose} ${tab.intro ? c.deckCloseTwo : ""}`} onClick={onClose} inert={!open}>
        {BADGES.deck.close}
      </button>

      <ul
        ref={fanRef}
        className={c.fan}
        style={countVars(n)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        inert={!open}
      >
        {badges.map((b, i) => {
          const { face, muted } = cardFace(b);
          const { state, title } = labelOf(b);
          const claims = b.key === "transmuted" && b.earned ? lookup.transmuterClaims?.count ?? 0 : 0;
          const depth = i === top ? 0 : i < top ? i + 1 : i;
          const liCls = [h === i ? c.lifted : "", b.id === shown ? c.empty : ""].join(" ");
          return (
            <li
              key={b.id}
              className={liCls}
              data-slot={b.id}
              onClick={() => onSlot(b.id)}
              style={{
                "--i": i,
                "--d": depth,
                "--b": depth > 0 ? 1 : 0,
                "--shift": shiftOf(i, gap),
                "--r": `${((i - mid) * 1.4).toFixed(1)}deg`,
              }}
            >
              <button
                type="button"
                className={`${c.deckCard} ${c[`state_${state}`] ?? ""}`}
                onFocus={() => setHover(i)}
                onKeyDown={(e) => onCardKey(e, i)}
                aria-pressed={b.id === shown}
                aria-label={title}
                data-badge-card={b.key}
              >
                <span className={`${c.card} ${muted ? c.muted : ""}`}>
                  <BadgeCard badgeKey={b.key} face={face} tier={tierOf(b) ?? 1} compact />
                  {claims > 1 ? <span className={c.deckCount}>{fmtInt(claims)}</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {open ? (
        <p className={c.deckCaption} aria-live="polite">
          {caption ? (
            <>
              <span className={`${c.deckName} ${c[`name_${caption.state}`] ?? ""}`}>{caption.title}</span>
              {caption.sub ? <span className={c.deckSub}>{caption.sub}</span> : null}
            </>
          ) : null}
        </p>
      ) : null}

      {shownBadge ? (
        <div
          key={shown}
          ref={(el) => {
            // Another deck's spot may already hold the shared ref; only clear it if it is still ours.
            if (spotRef && (el || spotRef.current === spotEl.current)) spotRef.current = el;
            spotEl.current = el;
          }}
          className={`${c.spot} ${leaving === "back" ? c.spotBack : ""} ${leaving === "fade" ? c.spotFade : ""}`}
          data-spot={shown}
        >
          {/* The deck's marker over the facts column (2026-11-05); Detail itself stays as it is. */}
          <span className={c.spotMark} aria-hidden="true">
            {marker}
          </span>
          {renderDetail(shownBadge)}
          {/* Under the facts: the same as Escape once. The card flies back to its slot; the deck stays open. */}
          <button type="button" className={`${c.textButton} ${c.putBack}`} onClick={() => onDraw(null)}>
            {BADGES.deck.putBack}
          </button>
        </div>
      ) : null}
    </div>
  );
}
