import React, { useState } from "react";
import { Section } from "../parts";
import { HERO, HERO_MONEY, ONBOARDING, RECENT, SEASON, SEASON_PROGRESS, SEASON_SUMMARY, UNLOCKS } from "../copy";
import { currentSeason } from "../lib/api";
import { fmtDate, fmtDayMonth, fmtInt, fmtNativeSigned, fmtPct, fromWad } from "../lib/format";
import { DiscordAction, MerchAction, TelegramAction } from "./actions";
import Medal from "./Medal";
import { academyCredit, carryItems, daysToNext, earningsOf, fundedPositions, pastSeasonEnd } from "./model";
import { PositionsBody, StatStrip } from "./Detail";
import { RateLine } from "./Onboarding";
import { CarryGlyph } from "./SeasonProgress";
import { TabList, TabPanel, useHashTabs } from "./Tabs";
import s from "./home.module.css";

/**
 * WHAT YOU GET (member journey 2026-10-28): one card per rung of the open
 * season, with what it gives, where the wallet stands against it, and, once
 * unlocked, how to use it (the Discord link, the Telegram group, the merch
 * claim; the same actions as the rung badges). Lines the team has yet to
 * confirm carry a "To confirm" tag (copy.js UNLOCKS).
 *
 * The members count per rung moved here from season progress.
 *
 * Feedback 2026-10-28, second round: the cards are the "What you get" tab of
 * the Essence section (./EarnMore.jsx); this section form stays for a page
 * without it.
 */
export default function Unlocks({ lookup, rungs, config, progressData, onChanged }) {
  if (!lookup.essence || rungs.length === 0) return null;
  return (
    <Section label={UNLOCKS.section} id="unlocks">
      <UnlockGrid lookup={lookup} rungs={rungs} config={config} progressData={progressData} onChanged={onChanged} />
    </Section>
  );
}

/** One card per rung. */
export function UnlockGrid({ lookup, rungs, config, progressData, onChanged }) {
  const essence = lookup.essence;
  if (!essence || rungs.length === 0) return null;
  const heldIndex = lookup.rung ? rungs.findIndex((r) => r.key === lookup.rung.key) : -1;
  const grantedAt = Object.fromEntries((essence.unlocks ?? []).map((u) => [u.key, u.grantedAt]));
  const earned = (key) => (lookup.achievements ?? []).some((a) => a.key === key && a.earned);

  return (
    <ul className={s.unlockGrid}>
        {rungs.map((r, i) => {
          const held = i <= heldIndex || Boolean(grantedAt[r.key]);
          const prev = i > 0 ? rungs[i - 1].threshold : 0;
          const share = Math.max(0, Math.min(1, (essence.standing - prev) / Math.max(1, r.threshold - prev)));
          const needed = Math.max(0, r.threshold - essence.standing);
          const days = daysToNext(needed, lookup.standingPerDay);
          const next = !held && (i === 0 || i <= heldIndex + 1);
          const count = progressData?.membersPerRung?.[r.key];
          return (
            <li key={r.key} className={`${s.unlockCard} ${held ? s.unlockHeld : ""}`}>
              <div className={s.unlockTop}>
                <Medal badgeKey={r.key} state={held ? "earned" : "locked"} progress={held ? null : share} className={s.unlockMedal} />
                <div>
                  <h3 className={s.unlockTitle}>{r.label}</h3>
                  <div className={s.unlockNeeds}>{UNLOCKS.needs(fmtInt(r.threshold))}</div>
                </div>
              </div>

              <div className={s.unlockState}>
                {held ? (
                  <span className={s.unlockOn}>{grantedAt[r.key] ? UNLOCKS.unlocked(fmtDayMonth(grantedAt[r.key])) : UNLOCKS.unlockedNoDate}</span>
                ) : next ? (
                  <>
                    {UNLOCKS.toGo(fmtInt(needed))}
                    {days !== null ? `, ${pastSeasonEnd(days, progressData?.season?.endsAt) ? HERO.status.beyond : HERO.status.daysToNext(days)}` : ""}
                  </>
                ) : (
                  UNLOCKS.later
                )}
              </div>

              <ul className={s.unlockWhat}>
                {(UNLOCKS.rungs[r.key] ?? []).map((line) => (
                  <li key={line.text} className={line.placeholder ? s.unlockPlaceholder : ""}>
                    {line.text}
                    {line.placeholder ? <span className={s.unlockTag}>{UNLOCKS.toConfirm}</span> : null}
                  </li>
                ))}
              </ul>

              <div className={s.unlockFoot}>
                {held && lookup.rung?.expiresAt ? <div className={s.unlockAccess}>{UNLOCKS.access(fmtDate(lookup.rung.expiresAt, { short: true }))}</div> : null}
                {typeof count === "number" ? <div className={s.unlockAccess}>{UNLOCKS.members(fmtInt(count))}</div> : null}
                {held ? (
                  <div className={s.unlockAction}>
                    {r.key === "discord_role" && !earned("discord_linked") ? (
                      <DiscordAction configured={config?.discordConfigured !== false} linked={false} onChanged={onChanged} returned={null} hint={false} />
                    ) : null}
                    {r.key === "inner_circle" ? <TelegramAction lookup={lookup} configured={config?.telegramConfigured !== false} onChanged={onChanged} showAccess={false} /> : null}
                    {r.key === "vip" ? <MerchAction key={lookup.address} earned demo={config?.merchDemo === true} /> : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
    </ul>
  );
}

/**
 * YOUR SEASON (member journey 2026-10-28; feedback 2026-10-28 merged Recent
 * and season progress into it). Two tabs.
 *   Activity   the season so far in four figures (days earning, where the
 *              wallet ranks among members, how many joined, when it ends),
 *              what happens at the end with what carries over, then the
 *              credits, newest first. Fourth round (Keenan: no batching):
 *              every day is its own row and every credit its own entry, with
 *              the rungs unlocked on the day they came. The last 7 days show,
 *              and the rest of the 14 open on request.
 *   Positions  what the collateral grew, the vault rate and the guardrail
 *              line (moved from the hero), then the positions table.
 * The id stays "recent": older links point here.
 */
export function YourSeason({ lookup, progress, seasons, markets }) {
  const [tab, setTab] = useHashTabs(SEASON_TABS, "recent");
  const [all, setAll] = useState(false);
  // Design notes 2026-11-03 (note 7): the credits fold to the latest day, with its unlocks; the rest open on request.
  const [open, setOpen] = useState(false);
  const essence = lookup.essence;
  if (!essence) return null;
  const unlocks = (essence.unlocks ?? []).map((u) => ({ day: u.grantedAt.slice(0, 10), label: u.label }));
  const days = [...new Set([...essence.recent.map((d) => d.day), ...unlocks.map((u) => u.day)])].sort().reverse().slice(0, 14);
  const credited = Object.fromEntries(essence.recent.map((d) => [d.day, d]));
  // Folded, the line is the latest day with a credit, so it always carries a number; unlocks from later days ride on it.
  const foldDay = days.find((d) => credited[d]) ?? days[0];
  const shown = !open ? [foldDay] : all ? days : days.slice(0, RECENT_SHOWN);
  const label = (c) => RECENT.sources[c.source] ?? c.source;

  return (
    <Section
      label={RECENT.section}
      id="recent"
      className={s.essenceSection}
      aside={<TabList prefix="season" keys={SEASON_TABS} labels={RECENT.tabs} label={RECENT.tabsLabel} tab={tab} onChange={setTab} />}
    >
      <TabPanel prefix="season" k="activity" tab={tab}>
        <SeasonSummary lookup={lookup} progress={progress} seasons={seasons} />
        <div className={s.chainLabel}>{RECENT.credits}</div>
        {days.length === 0 ? (
          <p className={s.bodySmall}>{(lookup.essence?.size?.daily ?? 0) > 0 ? RECENT.empty : RECENT.emptyNoPosition}</p>
        ) : (
          <>
            <ol className={s.recentList} id="recent-credits">
              {shown.map((day, i) => {
                const d = credited[day];
                return (
                  <li key={day} className={s.recentRow} style={{ "--i": i }}>
                    <span className={s.recentDay}>{fmtDayMonth(day)}</span>
                    <span className={s.recentTotal}>{d ? `+${fmtInt(d.total)}` : ""}</span>
                    <span className={s.recentParts}>
                      {(d?.credits ?? []).map((c, k) => (
                        <span key={`${c.source}-${k}`} className={s.recentCredit}>
                          {label(c)} <span className={s.recentAmount}>+{fmtInt(c.amount)}</span>
                        </span>
                      ))}
                      {unlocks
                        .filter((u) => (open ? u.day === day : u.day >= day))
                        .map((u) => (
                          <span key={u.label} className={s.recentUnlock}>
                            {RECENT.unlocked(u.label)}
                          </span>
                        ))}
                    </span>
                  </li>
                );
              })}
            </ol>
            {days.length > 1 ? (
              <div className={s.recentControls}>
                <button
                  type="button"
                  className={s.recentMore}
                  onClick={() => {
                    setOpen((v) => !v);
                    setAll(false);
                  }}
                  aria-expanded={open}
                  aria-controls="recent-credits"
                >
                  {open ? RECENT.hideAll : RECENT.showAll}
                </button>
                {open && days.length > RECENT_SHOWN ? (
                  <button type="button" className={s.recentMore} onClick={() => setAll((v) => !v)} aria-expanded={all} aria-controls="recent-credits">
                    {all ? RECENT.fewer : RECENT.more(days.length - RECENT_SHOWN)}
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </TabPanel>
      <TabPanel prefix="season" k="positions" tab={tab}>
        <MoneyFacts data={lookup} progress={progress} />
        <PositionsBody lookup={lookup} markets={markets} />
      </TabPanel>
    </Section>
  );
}

/** "#activity" and "#positions" in the address pick the tab. */
const SEASON_TABS = ["activity", "positions"];

/** Days shown before "Show N more". */
const RECENT_SHOWN = 7;

/**
 * The season so far (fourth round, Keenan: "When the season ends" added
 * little on its own). Four figures, then one line on the end of the season
 * with what carries over.
 */
function SeasonSummary({ lookup, progress, seasons }) {
  const data = progress.data;
  const season = data?.season;
  const essence = lookup.essence;
  if (!season) return null;
  const listed = currentSeason(seasons?.data);
  const accessEnd = (listed && listed.id === season.id && listed.accessExpiresAt) || data.nextSeasonOpensBefore || null;
  const joined = typeof data.walletsJoined === "number" ? data.walletsJoined : null;
  const top = typeof essence.rank === "number" && essence.rank > 0 && joined ? Math.max(1, Math.ceil((essence.rank / joined) * 100)) : null;
  const items = carryItems(data.carriesOver);
  const credit = academyCredit(lookup);
  const stats = [
    [SEASON_SUMMARY.days, fmtInt(essence.daysCounted), null],
    top !== null ? [SEASON_SUMMARY.standing, SEASON_SUMMARY.top(top), SEASON_SUMMARY.rank(fmtInt(essence.rank), essence.tied)] : null,
    joined !== null ? [SEASON_SUMMARY.members, fmtInt(joined), SEASON_SUMMARY.joinedThis] : null,
    [SEASON_SUMMARY.ends, fmtDayMonth(season.endsAt), season.daysLeft > 0 ? SEASON.daysLeft(season.daysLeft) : SEASON.lastDay],
  ].filter(Boolean);
  return (
    <div className={s.seasonSummary}>
      {/* Design notes 2026-11-03 (note 8): the same strip as Your record's facts. */}
      <StatStrip items={stats} />
      <p className={s.seasonEnd}>
        <span>
          {SEASON_PROGRESS.carries.note} {accessEnd ? RECENT.accessUntil(fmtDate(accessEnd, { short: true })) : ""}
          {credit && credit > 0 ? ` ${SEASON_PROGRESS.carries.academyCredit(fmtInt(credit))}` : ""}
        </span>
        {items.length ? (
          <span className={s.seasonCarry}>
            <span className={s.seasonCarryLabel}>{SEASON_PROGRESS.carries.label}</span>
            {items.map((k) => (
              <span key={k} className={s.seasonCarryItem}>
                <CarryGlyph k={k} />
                {SEASON_PROGRESS.carries.items[k]}
              </span>
            ))}
          </span>
        ) : null}
      </p>
    </div>
  );
}

/**
 * The money facts over the positions table (moved from the hero, fourth
 * round): what the collateral grew and since when, the vault rate, and the
 * guardrail line (yield raises collateral; debt falls only through
 * redemptions or a repay). A past user with no position gets the rate line
 * on their own largest deposit.
 */
function MoneyFacts({ data, progress }) {
  const positions = fundedPositions(data.positions);
  if (!positions.length) return data.history ? <RateLine data={data} progress={progress} /> : null;
  const e = earningsOf(data, progress?.data?.vaultRates);
  const shown = (e?.growth ?? []).filter((g) => Math.abs(fromWad(g.amount)) >= (g.denomination === "USD" ? 0.005 : 0.00005));
  if (!shown.length && !e?.rate) return null;
  const date = e?.sinceDate ? fmtDate(e.sinceDate, { short: true }) : null;
  const since =
    e.since === "handover" || !date ? HERO_MONEY.sinceMigrated(date) : e.since === "owner_since" ? HERO_MONEY.sinceDate(date) : HERO_MONEY.sinceFirstDepositOn(date);
  return (
    <div className={s.moneyFacts}>
      <div className={s.moneyFactsMain}>
        <div className={s.cellLabel}>{HERO_MONEY.label}</div>
        {shown.length ? (
          <div className={s.moneyGrowth}>
            {shown.map((g) => (
              <span key={g.denomination} className={String(g.amount).startsWith("-") ? s.moneyAmount : `${s.moneyAmount} ${s.moneyUp}`}>
                {fmtNativeSigned(g.amount, g.denomination)}
              </span>
            ))}
            <span className={s.moneySince}>{since}</span>
          </div>
        ) : null}
      </div>
      {e?.rate ? (
        <div className={s.moneyFactsRate}>
          <div className={s.cellLabel}>{HERO_MONEY.rateLabel}</div>
          <div className={s.moneyRateValue}>{HERO_MONEY.perYear(fmtPct(e.rate.value))}</div>
          <div className={s.moneySub}>{HERO_MONEY.lastDays(e.rate.days)}</div>
        </div>
      ) : null}
      <p className={s.moneyNote}>{ONBOARDING.earnings.note}</p>
    </div>
  );
}
