import React from "react";
import Link from "@docusaurus/Link";
import { fmtDate, fmtDayMonth, fmtInt } from "../lib/format";
import { ESSENCE_CELL, SEASON, SEASON_MODULE } from "../copy";
import { daysToNext, pastSeasonEnd } from "./model";
import s from "./season.module.css";

const DAY_MS = 86_400_000;

/**
 * The season module (design notes 2026-11-03, metalface notes 2, 4, 19, 20,
 * 39, 43: "only use one throughout"). One block wherever the season shows:
 *
 *   name     the season's name, shown only when `name` is set (the member
 *            hero and the leaderboard already have it as the page title)
 *   tag      a small pill before the dates ("Open now", "Open")
 *   time     the date range, the days left, and a featured progress bar for
 *            how far through the season it is
 *   essence  with `rungs`: one bar with a marker for each unlock (500 Discord
 *            role, 3,000 Inner Circle, 12,000 Event VIP and merch). With a
 *            `standing` it also fills to the wallet's essence and marks where
 *            it is; with `showNext`, "X to <next unlock>, about N days." under
 *            it (needs `perDay` for the days)
 *   lead     a line under the name (card variant)
 *   note     a quiet line under the time bar ("Access until ...")
 *   action   a button (Join the season, Deposit more)
 *   link     { to, label }, a text link beside the action (See the leaderboard)
 *
 * Variants: `line` sits in a hero with no box; `card` is the boxed version
 * (the Welcome season card, the visitor page).
 *
 * The member hero splits the two halves: the time bar under its title
 * (SeasonModule with no rungs) and the essence bar inside the essence panel
 * (EssenceTrack), where the season chart was (note 4).
 *
 * The essence bar is drawn in equal thirds, one per unlock, so the first
 * unlock at 500 is not squeezed against the start; the fill moves through
 * each third in proportion to the essence between its two thresholds.
 */
export default function SeasonModule({
  season,
  variant = "line",
  name = false,
  tag = null,
  lead = null,
  note = null,
  rungs = null,
  standing = null,
  perDay = null,
  showNext = false,
  action = null,
  link = null,
  className,
}) {
  if (!season) return null;
  const card = variant === "card";
  // Review 2026-11-13 (metalface): a card with a link and no button puts the link up beside
  // the name, so nothing sits to the right of the time bar and it runs the full width.
  const linkUp = card && name && link && !action;
  const side = linkUp ? null : action || link;
  const linkEl = link ? (
    <Link to={link.to} className={s.link}>
      {link.label}
    </Link>
  ) : null;
  return (
    <div className={`${s.module} ${card ? s.card : s.line} ${linkUp ? s.cardLinked : ""} ${className ?? ""}`}>
      <div className={s.body}>
        {linkUp ? (
          <div className={s.cardHead}>
            <h3 className={s.name}>{season.name}</h3>
            {linkEl}
          </div>
        ) : name ? (
          <h3 className={s.name}>{season.name}</h3>
        ) : null}
        {lead ? <p className={s.lead}>{lead}</p> : null}
        <SeasonTime season={season} tag={tag} />
        {note ? <p className={s.note}>{note}</p> : null}
        {rungs?.length ? (
          <EssenceTrack
            rungs={rungs}
            standing={standing}
            perDay={perDay}
            endsAt={season.endsAt}
            showNext={showNext}
            className={s.trackGap}
          />
        ) : null}
      </div>
      {side ? (
        <div className={s.side}>
          {action ? <div className={s.action}>{action}</div> : null}
          {linkEl}
        </div>
      ) : null}
    </div>
  );
}

/** How far through the season, from the engine's figures when it sends them, else from the dates. */
function timeOf(season) {
  const start = Date.parse(season.startsAt);
  const end = Date.parse(season.endsAt);
  const now = Date.now();
  const share =
    typeof season.progress === "number"
      ? season.progress
      : end > start
        ? Math.max(0, Math.min(1, (now - start) / (end - start)))
        : 0;
  const daysLeft = typeof season.daysLeft === "number" ? season.daysLeft : Math.max(0, Math.ceil((end - now) / DAY_MS));
  return { pct: Math.round(share * 100), daysLeft };
}

/** The dates, the days left, and the season's progress bar. */
export function SeasonTime({ season, tag = null }) {
  const { pct, daysLeft } = timeOf(season);
  return (
    <div className={s.time}>
      <div className={s.timeHead}>
        <span className={s.dates}>
          {tag ? <span className={s.tag}>{tag}</span> : null}
          {SEASON.runs(fmtDayMonth(season.startsAt), fmtDate(season.endsAt, { short: true }))}
        </span>
        <span className={s.left}>{daysLeft > 0 ? SEASON.daysLeft(daysLeft) : SEASON.lastDay}</span>
      </div>
      <div
        className={s.timeBar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={SEASON.elapsed(`${pct}%`)}
      >
        <span style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
    </div>
  );
}

/** Where `standing` sits on a bar of equal thirds, one per unlock, from 0 to 1. */
function fillOf(sorted, standing) {
  if (typeof standing !== "number" || !(standing > 0)) return 0;
  const n = sorted.length;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const at = sorted[i].threshold;
    if (standing < at) return (i + (standing - prev) / Math.max(1, at - prev)) / n;
    prev = at;
  }
  return 1;
}

/**
 * The essence bar: a marker for each unlock, the fill to the wallet's essence
 * and a dot where it is, and (with `showNext`) the line under it. Without a
 * `standing` it is the unlocks alone, for a wallet that has not joined.
 */
export function EssenceTrack({ rungs, standing = null, perDay = null, endsAt = null, showNext = false, nextHref = null, onNext, className }) {
  const sorted = [...(rungs ?? [])].filter((r) => typeof r.threshold === "number").sort((a, b) => a.threshold - b.threshold);
  if (!sorted.length) return null;
  const has = typeof standing === "number";
  const fill = fillOf(sorted, standing);
  const pct = fill * 100;
  const next = has ? sorted.find((r) => r.threshold > standing) ?? null : null;
  const needed = next ? next.threshold - standing : null;
  const days = next ? daysToNext(needed, perDay) : null;
  return (
    <div className={`${s.track} ${className ?? ""}`}>
      <div
        className={s.trackBar}
        role={has ? "progressbar" : "img"}
        aria-valuemin={has ? 0 : undefined}
        aria-valuemax={has ? sorted[sorted.length - 1].threshold : undefined}
        aria-valuenow={has ? standing : undefined}
        aria-label={SEASON_MODULE.track(has ? fmtInt(standing) : null)}
      >
        <span className={s.trackFill} style={{ width: `${pct}%` }} />
        {sorted.map((r, i) => {
          const done = has && standing >= r.threshold;
          return (
            <span
              key={r.key}
              className={`${s.marker} ${done ? s.markerDone : ""}`}
              style={{ left: `${((i + 1) / sorted.length) * 100}%` }}
              aria-hidden="true"
            />
          );
        })}
        {has && standing > 0 && fill < 1 ? <span className={s.you} style={{ left: `${pct}%` }} aria-hidden="true" /> : null}
      </div>
      {/* Each label is centred on its marker (two of 2n columns), the last one right aligned at the end of the bar.
          On a phone every label ends at its marker instead, so the names never run into each other. */}
      <ol className={s.marks} style={{ gridTemplateColumns: `repeat(${sorted.length * 2}, minmax(0, 1fr))` }}>
        {sorted.map((r, i) => {
          const done = has && standing >= r.threshold;
          const last = i === sorted.length - 1;
          return (
            <li
              key={r.key}
              className={`${s.mark} ${last ? s.markLast : ""} ${done ? s.markDone : ""}`}
              style={{ "--at": `${last ? 2 * sorted.length - 1 : 2 * i + 2} / span 2` }}
            >
              <span className={s.markAt}>{fmtInt(r.threshold)}</span>
              <span className={s.markName}>
                {r.label}
                {done ? <span className={s.srOnly}> ({SEASON_MODULE.reached})</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      {showNext && has ? (
        <p className={s.next}>
          {next ? (
            <>
              {nextHref ? (
                <a className={s.nextLink} href={nextHref} onClick={onNext}>
                  {ESSENCE_CELL.toNext(fmtInt(needed), next.label)}
                </a>
              ) : (
                ESSENCE_CELL.toNext(fmtInt(needed), next.label)
              )}
              {days !== null ? `, ${pastSeasonEnd(days, endsAt) ? ESSENCE_CELL.beyond : ESSENCE_CELL.days(days)}` : ""}.
            </>
          ) : (
            ESSENCE_CELL.all
          )}
        </p>
      ) : null}
    </div>
  );
}
