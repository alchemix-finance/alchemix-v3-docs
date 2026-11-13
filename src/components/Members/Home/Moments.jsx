import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import { MOMENTS } from "../copy";
import { fmtDayMonth, fmtInt } from "../lib/format";
import Medal from "./Medal";
import s from "./home.module.css";

const DAY_MS = 86_400_000;
const SESSION_MS = 6 * 3_600_000;
const UNLOCK_FRESH_DAYS = 7;

/**
 * Fifth round (Keenan, 2026-10-28: more life on the page, and members should
 * feel what they have built). Two moments in the hero, both from what the
 * lookup already says:
 *
 *   GainChip      what the total gained since the last visit ("+1,269 since
 *                 Oct 25"), or over the last 7 days on a first visit.
 *   UnlockMoment  a rung crossed since the last visit (or, on a first visit,
 *                 in the last 7 days), with its claim. Dismissed once per
 *                 rung and season.
 *
 * The last visit lives in this browser only (localStorage, wrapped so a
 * private window or blocked storage just shows the first-visit version). A
 * visit is a new one after six hours away, so a refresh keeps the same "since".
 */
export function useLastVisit(address, standing) {
  const [base, setBase] = useState(null);
  useEffect(() => {
    if (!address || typeof standing !== "number") return;
    const key = `members.visit.${address.toLowerCase()}`;
    let stored = null;
    try {
      stored = JSON.parse(window.localStorage.getItem(key) ?? "null");
    } catch {
      stored = null;
    }
    const now = Date.now();
    let prev = stored?.base ?? null;
    if (stored?.latest && now - stored.latest.at > SESSION_MS) prev = stored.latest;
    setBase(prev && typeof prev.standing === "number" ? prev : null);
    try {
      window.localStorage.setItem(key, JSON.stringify({ base: prev, latest: { standing, at: now } }));
    } catch {
      /* storage blocked: the first-visit version shows */
    }
  }, [address, standing]);
  return base;
}

/** "+1,269 since Oct 25", or "+2,961 this week" without a last visit; null when nothing was gained. */
export function GainChip({ essence, base }) {
  let gain = 0;
  let text = null;
  if (base && essence.standing > base.standing) {
    gain = essence.standing - base.standing;
    text = MOMENTS.sinceVisit(fmtInt(gain), fmtDayMonth(new Date(base.at).toISOString()));
  } else if (!base) {
    const from = new Date(Date.now() - 7 * DAY_MS).toISOString().slice(0, 10);
    const days = essence.series?.length ? essence.series : essence.recent ?? [];
    gain = days.filter((d) => d && d.day >= from).reduce((n, d) => n + (d.total ?? 0), 0);
    text = gain > 0 ? MOMENTS.thisWeek(fmtInt(gain)) : null;
  }
  if (!text || gain <= 0) return null;
  return (
    <span className={s.gainChip}>
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 9.5V2.5M2.75 5.75 6 2.5l3.25 3.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </span>
  );
}

/** The rung this wallet most recently crossed, when it is fresh and not yet dismissed. */
export function UnlockMoment({ data, rungs, base, config }) {
  const [gone, setGone] = useState(false);
  const [rung, setRung] = useState(null);
  const seasonId = data.essence?.seasonId ?? "season";
  const key = (r) => `members.unlocked.${String(data.address).toLowerCase()}.${seasonId}.${r.key}`;

  useEffect(() => {
    const standing = data.essence?.standing ?? 0;
    const earnedAt = (k) => (data.achievements ?? []).find((a) => a.key === k && a.earned)?.earnedAt ?? null;
    const fresh = [...rungs]
      .filter((r) => standing >= r.threshold)
      .filter((r) => {
        if (base) return base.standing < r.threshold;
        const at = earnedAt(r.key);
        return at ? Date.now() - Date.parse(at) <= UNLOCK_FRESH_DAYS * DAY_MS : false;
      })
      .sort((a, b) => b.threshold - a.threshold);
    const pick = fresh.find((r) => {
      try {
        return !window.localStorage.getItem(key(r));
      } catch {
        return true;
      }
    });
    setRung(pick ?? null);
  }, [data, rungs, base]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rung || gone) return null;
  const dismiss = () => {
    try {
      window.localStorage.setItem(key(rung), "1");
    } catch {
      /* storage blocked: it closes for this view */
    }
    setGone(true);
  };
  const earnedAt = (data.achievements ?? []).find((a) => a.key === rung.key && a.earned)?.earnedAt ?? null;
  // Persona walk: with Discord or Telegram not set up yet, the badges page says "opens soon", so say that here.
  const ready = rung.key === "discord_role" ? config?.discordConfigured !== false : rung.key === "inner_circle" ? config?.telegramConfigured !== false : true;
  const claim = ready ? MOMENTS.claims[rung.key] ?? null : MOMENTS.soon;
  return (
    <div className={s.unlock} role="status">
      <span className={s.unlockMedal} aria-hidden="true">
        <span className={s.unlockBurst} />
        <Medal badgeKey={rung.key} state="earned" />
      </span>
      <span className={s.unlockText}>
        <span className={s.unlockKicker}>{earnedAt ? MOMENTS.unlockedOn(fmtDayMonth(earnedAt)) : MOMENTS.unlocked}</span>
        <span className={s.unlockTitle}>{rung.label}</span>
        {claim ? <span className={s.unlockBody}>{claim}</span> : null}
      </span>
      <span className={s.unlockActs}>
        <Link to={`/members/badges#badge-${rung.key}`} className={s.unlockLink}>
          {ready ? MOMENTS.open : MOMENTS.see}
        </Link>
        <button type="button" className={s.unlockClose} onClick={dismiss} aria-label={MOMENTS.dismiss}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </span>
    </div>
  );
}
