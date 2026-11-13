import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BADGES, BADGE_POP } from "../copy";
import { fmtDate, fmtInt } from "../lib/format";
import BadgeCard, { cardFace } from "../Badges/BadgeCard";
import { bpsPercent, chainsWords, hasDebt, tierOf, transmutedWords } from "./model";
import shell from "../Shell/styles.module.css";
import s from "./home.module.css";
import c from "../Badges/cards.module.css";

/**
 * Fifth round (Keenan, 2026-10-28: badges should pop up on hover with how and
 * when they were earned, and feel good to look at). Wraps a badge's link or
 * button; pointing at it (or focusing it with the keyboard) opens a card over
 * the page with the badge, what earned it, the fact behind it and the date.
 * Since 2026-11-04 the badge on the card is a small card thumbnail at its
 * tier (Badges/BadgeCard.jsx); the seal stays the mark on the page itself.
 * Touch has no hover, so a tap still follows the link to the badges page.
 *
 * The card is placed with fixed coordinates in a portal, so the hero's
 * clipping never cuts it, and is kept inside the window. Scrolling closes it.
 * The portal sits in the members shell (its .page carries the colour tokens).
 */
export default function BadgePop({ badge, lookup, rungs, children, className }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState(null);
  const anchor = useRef(null);
  const card = useRef(null);
  const timer = useRef(null);
  const id = `pop${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 90);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 60);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    if (!open || !anchor.current || !card.current) return;
    const r = anchor.current.getBoundingClientRect();
    const w = card.current.offsetWidth;
    const h = card.current.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const left = Math.max(12, Math.min(vw - w - 12, r.left + r.width / 2 - w / 2));
    // Above the medal only when it clears the page header too, so the card never covers the nav or Connect wallet.
    const head = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const above = r.top - h - 12 >= Math.max(12, head + 8);
    setPlace({ left, top: above ? r.top - h - 12 : r.bottom + 12, above, arrow: r.left + r.width / 2 - left });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
      setPlace(null);
    };
  }, [open]);

  return (
    <span
      ref={anchor}
      className={`${s.popAnchor} ${className ?? ""}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onFocus={(e) => e.target.matches?.(":focus-visible") && show()}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={card}
              id={id}
              role="tooltip"
              className={`${s.popCard} ${place ? s.popCardIn : ""} ${place && !place.above ? s.popCardBelow : ""}`}
              style={place ? { left: place.left, top: place.top, "--arrow": `${place.arrow}px` } : { left: -9999, top: 0 }}
            >
              <PopBody badge={badge} lookup={lookup} rungs={rungs} />
            </div>,
            anchor.current?.closest(`.${CSS.escape(shell.page)}`) ?? document.body,
          )
        : null}
    </span>
  );
}

function PopBody({ badge, lookup, rungs }) {
  const hiddenLocked = badge.hidden && !badge.earned;
  const tenureReady = badge.key === "tenure" && !badge.earned && Boolean(lookup.history);
  // The migrated fact repeats the date the card already gives.
  const fact = (badge.earned || tenureReady) && badge.key !== "migrated" ? factOf(badge, lookup) : null;
  const threshold = rungs?.find((r) => r.key === badge.key)?.threshold ?? null;
  const how = hiddenLocked
    ? BADGES.hidden.hints[badge.key] ?? BADGES.hidden.body
    : badge.earned
      ? BADGE_POP.how(badge.key, threshold === null ? null : fmtInt(threshold)) ?? badge.description
      : tenureReady
        ? BADGE_POP.tenureReady
        : badge.description;
  const progress = !badge.earned && badge.progress && badge.progress.target > 0 ? badge.progress : null;
  // Round two, 2026-11-04: an earned badge with tiers says which, and how far the next one is (nothing at the top tier).
  const tier = badge.earned && badge.tier && badge.tier.max > 1 ? badge.tier : null;
  const next = tier && badge.progress && badge.progress.target > 0 ? badge.progress : null;
  const nextText = next && BADGES.progress[badge.key] ? BADGES.progress[badge.key](fmtInt(next.current), fmtInt(next.target)) : null;
  const group = badge.group === "season" ? badge.seasonName ?? BADGES.groups.season : BADGES.groups[badge.group];
  const kicker = [group, badge.hidden && badge.earned ? BADGE_POP.found : null].filter(Boolean).join(", ");
  // Round two, 2026-11-04: the essence multiplier a badge carries, under the how-to line (not on a veiled badge).
  const boost = hiddenLocked ? null : bpsPercent(badge.multiplierBps);
  // Cards, 2026-11-04: a small card at the badge's tier in place of the medal (a ready tenure claim lies face up).
  const { face, muted } = tenureReady ? { face: "up", muted: false } : cardFace(badge);
  return (
    <>
      <span className={`${c.popThumb} ${muted ? c.muted : ""}`} aria-hidden="true">
        <BadgeCard badgeKey={badge.key} face={face} tier={tierOf(badge) ?? 1} compact />
      </span>
      <span className={s.popText}>
        {kicker ? <span className={s.popKicker}>{kicker}</span> : null}
        <span className={s.popTitle}>{hiddenLocked ? BADGES.hidden.title : badge.title}</span>
        {how ? <span className={s.popHow}>{how}</span> : null}
        {boost ? <span className={s.popMultiplier}>{BADGES.multiplier(boost)}</span> : null}
        {fact ? <span className={s.popFact}>{fact}</span> : null}
        {badge.earned ? (
          <span className={s.popWhen}>
            {badge.earnedAt ? BADGES.state.earnedOn(fmtDate(badge.earnedAt)) : BADGES.state.undated}
            {badge.earnedAt && agoText(badge.earnedAt) ? <span className={s.popAgo}>{agoText(badge.earnedAt)}</span> : null}
          </span>
        ) : tenureReady ? (
          <span className={s.popReady}>{BADGE_POP.ready}</span>
        ) : progress ? (
          <span className={s.popProgress}>
            <span className={s.popBar} aria-hidden="true">
              <span style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }} />
            </span>
            {BADGE_POP.progress(fmtInt(progress.current), fmtInt(progress.target))}
          </span>
        ) : (
          <span className={s.popLocked}>{BADGES.state.locked}</span>
        )}
        {tier ? <span className={s.popTier}>{BADGES.tier(tier.current, tier.max)}</span> : null}
        {next && nextText ? (
          <span className={s.popProgress}>
            <span className={s.popBar} aria-hidden="true">
              <span style={{ width: `${Math.min(100, (next.current / next.target) * 100)}%` }} />
            </span>
            {nextText}
          </span>
        ) : null}
      </span>
    </>
  );
}

/** "6 months ago", from whole days, months and years (UTC). */
function agoText(iso) {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  const a = BADGE_POP.ago;
  if (days < 1) return a.today;
  if (days < 45) return a.days(days);
  if (days < 548) return a.months(Math.round(days / 30.44));
  // Whole years only: April 2022 reads "4 years ago" in November 2026, not 5.
  return a.years(Math.floor(days / 365.25));
}

/** The line under an earned badge: the fact behind it, from the lookup. Shared with the badges page. */
export function factOf(b, lookup) {
  const h = lookup.history;
  const positions = lookup.positions ?? [];
  switch (b.key) {
    case "tenure":
      return h?.firstUsedOn ? BADGES.tenure.fact(fmtDate(h.firstUsedOn)) : null;
    case "v1_era":
      return h?.firstUsedOn ? BADGES.facts.v1_era(fmtDate(h.firstUsedOn)) : null;
    case "v2_era":
      return h?.firstUsedOn && h.versions?.length === 1 ? BADGES.facts.v2_era(fmtDate(h.firstUsedOn)) : null;
    case "migrated":
      return b.earnedAt ? BADGES.facts.migrated(fmtDate(b.earnedAt)) : null;
    case "transmuted": {
      const c = lookup.transmuterClaims;
      return c?.count ? BADGES.facts.transmuted(fmtInt(c.count), transmutedWords(c)) : null;
    }
    case "two_chains":
      return positions.length ? BADGES.facts.two_chains(chainsWords(positions)) : null;
    case "borrower": {
      const n = positions.filter(hasDebt).length;
      return n ? BADGES.facts.borrower(n) : null;
    }
    // Feedback 2026-10-28, third round: every rung states its access end the same way, in the fact line.
    case "discord_role":
    case "inner_circle":
    case "vip":
      return lookup.rung?.expiresAt ? BADGES.facts.rung(fmtDate(lookup.rung.expiresAt)) : null;
    default:
      return null;
  }
}
