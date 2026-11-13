import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Section } from "../parts";
import { fmtDate, fmtInt, fmtMonthShort, yearOf } from "../lib/format";
import { APP_URL, BADGES, BORROW_GUIDE, ONBOARDING } from "../copy";
import Medal from "./Medal";
import { factOf } from "./BadgePop";
import Cabinet from "../Badges/Cabinet";
import { badgeList, bpsPercent, groupBadges, readyToClaim, rungRequirement, tierOf } from "./model";
import { AcademyAction, DiscordAction, EventCodeCard, MerchAction, StandingAction, TelegramAction, TenureAction } from "./actions";
import { useMyStanding } from "./standing";
import BadgeCard, { cardFace } from "../Badges/BadgeCard";
import s from "./home.module.css";
import c from "../Badges/cards.module.css";

/**
 * 03 - ACHIEVEMENTS (plan items 2, 3, 4, 16). One section for the access
 * ladder, history, activity and community: a grid of medals grouped by kind,
 * and a large panel for the selected one (the medal collection screen the
 * team referenced, kept serious). Locked badges show greyed with how to earn
 * them; the three hidden ones show as "?" with a hint until earned. The
 * claims and links live in the panel of the badge they earn. The event code
 * card sits under the grid.
 *
 * Badges are recognition: nothing here ranks wallets by badges or adds standing.
 *
 * Walkthrough 2026-10-23: `collapsed` (onboarding, before the wallet joins)
 * shows only the earned badges in a row and "See all", so a new visitor is not
 * met with 22 medals. A Discord return, or a link to #achievements or
 * #event-code (the Academy's "claim this track" link), opens it in full.
 *
 * Design notes 2026-11-03 (metalface 41): a badge stays obscured until it is
 * earned. See veil() below for what stays readable.
 *
 * Cards, 2026-11-04 (Keenan: badges become tarot-style cards in the live
 * flow): the full grid draws each badge as a card at its tier
 * (../Badges/BadgeCard.jsx), face down until earned except the readable ones,
 * and the panel shows the card large beside the facts. The collapsed row
 * keeps the seals, as the hero and Your record do.
 */
export default function Achievements({ lookup, config, rungs, progressData, onChanged, discordReturn, collapsed = false, eventCard = true }) {
  const badges = useMemo(() => veil(badgeList(lookup), lookup, config, discordReturn), [lookup, config, discordReturn]);
  const groups = groupBadges(badges);
  const [expanded, setExpanded] = useState(!collapsed || Boolean(discordReturn));
  // Round two, 2026-11-05: the card drawn into the open deck's reading spot (Badges/Cabinet.jsx), or null.
  // A Discord return opens on Discord linked, so its outcome shows.
  const [drawn, setDrawn] = useState(discordReturn ? "discord_linked" : null);
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash;
      if (hash === "#achievements" || hash === "#event-code") setExpanded(true);
      // Page review 2026-10-24: the leaderboard's ladder links to a rung's badge panel as #badge-<key>.
      if (hash.startsWith("#badge-")) {
        const key = hash.slice("#badge-".length);
        if (badges.some((b) => b.id === key)) {
          setExpanded(true);
          // Feedback 2026-10-28: the panel is the point of the link. Round two, 2026-11-05: the link
          // opens that card's deck and draws the card; the reading spot comes into view once the deck is open.
          draw(key, 480, true);
        }
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { result: standing } = useMyStanding();
  const spotRef = useRef(null);

  // Start on the badge a Discord return is about, else the latest earned badge, else the first one.
  const [selected, setSelected] = useState(() => {
    if (discordReturn) return "discord_linked";
    const dated = badges.filter((b) => b.earned && b.earnedAt).sort((a, b) => (a.earnedAt < b.earnedAt ? 1 : -1));
    // Round two, 2026-11-04: with nothing earned, the first badge that is not veiled (the season set comes first now).
    return dated[0]?.id ?? badges.find((b) => b.earned)?.id ?? badges.find((b) => !b.hidden)?.id ?? badges[0]?.id ?? null;
  });
  const current = badges.find((b) => b.id === selected) ?? badges[0];

  const threshold = (key) => rungs.find((r) => r.key === key)?.threshold ?? null;
  const progressOf = (b) => {
    if (b.group === "rungs" && standing && standing.seasonId !== null) {
      const t = threshold(b.key);
      return t ? Math.min(1, standing.standing / t) : null;
    }
    return b.progress && b.progress.target > 0 ? b.progress.current / b.progress.target : null;
  };

  // What the deck's caption says for a badge: the name, then the month it was earned or how far along it is.
  const labelOf = (b) => {
    let sub = null;
    if (b.earned) sub = b.earnedAt ? fmtMonthShort(b.earnedAt) : BADGES.state.earned;
    else if (b.hidden) sub = BADGES.hidden.hints[b.key] ?? null;
    else {
      const p = progressOf(b);
      if (typeof p === "number" && p > 0) sub = `${Math.floor(p * 100)}%`;
    }
    return { title: tileTitle(b), sub, state: stateOf(b) };
  };

  // A deck's tab: the group's name, or for a season its name and its one line (round two, 2026-11-04).
  const tabOf = (g) =>
    g.group === "season"
      ? { name: g.seasonName ?? BADGES.groups.season, intro: g.open ? BADGES.seasonIntro.open : BADGES.seasonIntro.past, season: true }
      : { name: BADGES.groups[g.group] };

  /**
   * Draws a card (round two, 2026-11-05: the panel now opens inside the deck).
   * Brings it into view after `wait` ms, once it has landed. On a phone, the
   * reading spot's top (it sits under the fan). On a wide screen, a link
   * arrival (`arrival`) puts the open deck's tab at the top of the window
   * (round three); a click scrolls only as far as needed.
   */
  function draw(key, wait = 120, arrival = false) {
    setSelected(key);
    setDrawn(key);
    if (typeof window === "undefined") return;
    window.setTimeout(() => {
      const spot = spotRef.current;
      if (!spot) return;
      if (window.matchMedia("(max-width: 900px)").matches) spot.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (arrival) spot.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      else spot.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, wait);
  }

  // A card's facts in the reading spot: the panel the side column used to hold.
  const renderDetail = (b) => (
    <Detail
      badge={b}
      lookup={lookup}
      config={config}
      rungs={rungs}
      requirement={b.group === "rungs" ? rungRequirement(progressData, b.key) : null}
      progress={progressOf(b)}
      onChanged={onChanged}
      discordReturn={discordReturn}
    />
  );

  if (collapsed && !expanded) {
    const earned = badges.filter((b) => b.earned);
    return (
      <Section label={BADGES.section} id="achievements">
        <p className={s.badgeSummary}>{earned.length ? ONBOARDING.badges(earned.length) : ONBOARDING.noBadges}</p>
        {earned.length ? (
          <ul className={`${s.badgeGrid} ${s.badgeRow}`}>
            {earned.map((b) => (
              <li key={b.id}>
                <Tile
                  badge={b}
                  lookup={lookup}
                  progress={null}
                  selected={false}
                  onSelect={() => {
                    setExpanded(true);
                    draw(b.id, 480);
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
        <div className={s.actionRow}>
          <Button kind="secondary" onClick={() => setExpanded(true)}>
            {ONBOARDING.allBadges(badges.length)}
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section
      label={BADGES.section}
      id="achievements"
      aside={
        collapsed ? (
          <Button kind="quiet" onClick={() => setExpanded(false)}>
            {ONBOARDING.fewerBadges}
          </Button>
        ) : null
      }
    >
      {/* Round two, 2026-11-05 (Keenan: lose the right section, read a card inside its deck): one column. */}
      <div className={s.badgeLayoutOne}>
        <div className={s.badgeMain}>
          {/* The cabinet, 2026-11-05 (Keenan: every group a deck in one bounded box; a click fans it out). */}
          <Cabinet
            groups={groups}
            tabOf={tabOf}
            lookup={lookup}
            homeId={current?.id}
            drawn={drawn}
            onDraw={(key) => (key ? draw(key) : setDrawn(null))}
            labelOf={labelOf}
            renderDetail={renderDetail}
            spotRef={spotRef}
          />
        </div>

        {/* Member journey 2026-10-28: a joined wallet redeems codes in Earn more. */}
        {eventCard ? (
          <div className={s.badgeEvent}>
            <EventCodeCard onChanged={onChanged} />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

/**
 * Design notes 2026-11-03 (metalface 41: do not show the badges until they
 * are won). An unearned badge takes the hidden badges' treatment everywhere
 * it shows (tile, hover card, panel): a "?" medal, "Hidden", no name, no
 * how-to, no progress and no action. What stays readable:
 *   - the Access row (Discord role, Inner Circle, Event VIP and merch), since
 *     that ladder is public and its progress is the point;
 *   - a badge ready to claim (the tenure badge), so the claim still works;
 *   - Discord linked while a Discord return is on screen, so its outcome shows.
 * The badge keeps its key, so "#badge-<key>" links still select it.
 */
function veil(badges, lookup, config, discordReturn) {
  const open = new Set(readyToClaim(lookup, config));
  if (discordReturn) open.add("discord_linked");
  return badges.map((b) =>
    b.earned || b.hidden || b.group === "rungs" || open.has(b.key)
      ? b
      : { ...b, hidden: true, title: null, description: null, progress: null, multiplierBps: null },
  );
}

function stateOf(b) {
  if (b.earned) return "earned";
  return b.hidden ? "hidden" : "locked";
}

function tileTitle(b) {
  if (b.hidden && !b.earned) return BADGES.hidden.title;
  return b.title ?? "";
}

function Tile({ badge, lookup, progress, selected, onSelect }) {
  const state = stateOf(badge);
  const year = badge.key === "tenure" ? yearOf(lookup.history?.firstUsedOn) : null;
  const count = badge.key === "transmuted" && badge.earned ? lookup.transmuterClaims?.count ?? 0 : 0;
  let sub = null;
  if (badge.earned) sub = badge.earnedAt ? fmtMonthShort(badge.earnedAt) : BADGES.state.earned;
  else if (typeof progress === "number" && progress > 0) sub = `${Math.floor(progress * 100)}%`;

  return (
    <button
      type="button"
      className={`${s.tile} ${s[`tile_${state}`]} ${selected ? s.tileOn : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={s.tileMedal}>
        <Medal badgeKey={badge.key} state={state} progress={progress} year={year || null} tier={tierOf(badge)} />
        {count > 1 ? <span className={s.tileCount}>{fmtInt(count)}</span> : null}
      </span>
      <span className={s.tileTitle}>{tileTitle(badge)}</span>
      {sub ? <span className={s.tileSub}>{sub}</span> : null}
    </button>
  );
}

function progressText(b, standing, rungs) {
  if (b.group === "rungs") {
    if (!standing || standing.seasonId === null) return null;
    const t = rungs.find((r) => r.key === b.key)?.threshold;
    return t ? BADGES.progress.rung(fmtInt(Math.min(standing.standing, t)), fmtInt(t)) : null;
  }
  if (!b.progress) return null;
  const f = BADGES.progress[b.key];
  return f ? f(fmtInt(b.progress.current), fmtInt(b.progress.target)) : null;
}

function Detail({ badge, lookup, config, rungs, requirement, progress, onChanged, discordReturn }) {
  const { result: standing } = useMyStanding();
  const state = stateOf(badge);
  const hiddenLocked = badge.hidden && !badge.earned;
  const { face, muted } = cardFace(badge);
  const fact = badge.earned ? factOf(badge, lookup) : null;
  const pText = badge.earned ? null : progressText(badge, standing, rungs);
  // Round two, 2026-11-04: an earned badge with tiers shows its tier and the way to the next one.
  const tier = badge.earned && badge.tier && badge.tier.max > 1 ? badge.tier : null;
  const next = tier && badge.progress && badge.progress.target > 0 ? badge.progress : null;
  const nextText = next ? progressText(badge, standing, rungs) : null;

  return (
    <div className={`${s.detail} ${s[`detail_${state}`]} ${c.panel}`} aria-live="polite">
      {/* Cards, 2026-11-04: the card large on the left (numeral, name and tier in the frame), the facts on the right. */}
      <div className={`${c.panelCard} ${muted ? c.muted : ""}`} role="img" aria-label={hiddenLocked ? BADGES.hidden.title : badge.title}>
        <BadgeCard badgeKey={badge.key} face={face} tier={tierOf(badge) ?? 1} name={badge.title} />
      </div>
      <div className={c.panelFacts}>
        <h3 className={s.detailTitle}>{hiddenLocked ? BADGES.hidden.title : badge.title}</h3>
        <p className={s.detailBody}>{hiddenLocked ? BADGES.hidden.body : badge.description}</p>
        {/* Round two, 2026-11-04: the essence multiplier the badge carries, under the how-to line. */}
        {!hiddenLocked && bpsPercent(badge.multiplierBps) ? (
          <p className={s.detailMultiplier}>{BADGES.multiplier(bpsPercent(badge.multiplierBps))}</p>
        ) : null}
        {hiddenLocked && BADGES.hidden.hints[badge.key] ? <p className={s.detailHint}>{BADGES.hidden.hints[badge.key]}</p> : null}
        {requirement && !badge.earned ? <p className={s.detailHint}>{requirement}</p> : null}
        {badge.key === "academy_graduate" ? <p className={s.detailHint}>{BADGES.academyCarries}</p> : null}

        <div className={s.detailStatus}>
          <span className={badge.earned ? s.statusEarned : s.statusLocked}>
            {badge.earned
              ? badge.earnedAt
                ? BADGES.state.earnedOn(fmtDate(badge.earnedAt))
                : BADGES.state.undated
              : BADGES.state.locked}
          </span>
          {fact ? <span className={s.detailFact}>{fact}</span> : null}
          {tier ? <span className={s.detailTier}>{BADGES.tier(tier.current, tier.max)}</span> : null}
        </div>

        {next && nextText ? (
          <div className={s.detailProgress}>
            <div className={s.bar}>
              <span style={{ width: `${Math.max(2, Math.min(100, Math.round((next.current / next.target) * 100)))}%` }} />
            </div>
            <span className={s.detailProgressText}>{nextText}</span>
          </div>
        ) : null}

        {typeof progress === "number" && !badge.earned && pText ? (
          <div className={s.detailProgress}>
            <div className={s.bar}>
              <span style={{ width: `${Math.max(2, Math.round(progress * 100))}%` }} />
            </div>
            <span className={s.detailProgressText}>{pText}</span>
          </div>
        ) : null}

        <div className={s.detailActions}>
          <Actions badge={badge} lookup={lookup} config={config} onChanged={onChanged} discordReturn={discordReturn} />
        </div>
      </div>
    </div>
  );
}

/** What can be done from a badge's panel, if anything. */
function Actions({ badge, lookup, config, onChanged, discordReturn }) {
  const { result: standing } = useMyStanding();
  // A joined member redeems codes in the Essence section on the home page; anyone else in the card under the grid.
  const eventHref = lookup.essence ? "/members#earn" : "#event-code";
  const b = badge;
  const discordOn = config?.discordConfigured !== false;
  const telegramOn = config?.telegramConfigured !== false;
  const earned = (key) => lookup.achievements?.some((a) => a.key === key && a.earned);

  if (b.hidden && !b.earned) return null;

  switch (b.key) {
    case "tenure":
      return b.earned ? null : <TenureAction lookup={lookup} onChanged={onChanged} label={BADGES.tenure.button} />;
    case "discord_role":
    case "inner_circle":
    case "vip": {
      const rank = standing && standing.seasonId !== null && standing.rank ? BADGES.standing.rank(fmtInt(standing.rank), standing.tied) : null;
      return (
        <>
          {standing ? (
            standing.seasonId === null ? (
              <p className={s.actionText}>{BADGES.standing.noSeason}</p>
            ) : rank ? (
              <p className={s.actionText}>{rank}</p>
            ) : null
          ) : (
            <>
              <StandingAction label={BADGES.standing.button} />
            </>
          )}
          {b.key === "discord_role" && !earned("discord_linked") ? (
            <DiscordAction configured={discordOn} linked={false} onChanged={onChanged} returned={null} hint={false} />
          ) : null}
          {b.key === "inner_circle" ? <TelegramAction lookup={lookup} configured={telegramOn} onChanged={onChanged} showAccess={false} /> : null}
          {/* V3 backlog ticket 04: the season shirt lives on the VIP and merch rung. */}
          {b.key === "vip" ? <MerchAction key={lookup.address} earned={b.earned} demo={config?.merchDemo === true} /> : null}
        </>
      );
    }
    case "discord_linked":
      return <DiscordAction configured={discordOn} linked={b.earned} onChanged={onChanged} returned={discordReturn} />;
    case "inner_circle_joined":
      return b.earned ? null : <TelegramAction lookup={lookup} configured={telegramOn} onChanged={onChanged} />;
    case "academy_graduate":
      return <AcademyAction onChanged={onChanged} goLabel={BADGES.actions.academy} />;
    case "event_attendee":
      return b.earned ? null : (
        <a className={s.textLink} href={eventHref}>
          {BADGES.actions.eventCode}
        </a>
      );
    case "feedback_shipped":
      return b.earned ? null : (
        <Button kind="secondary" to="/members/feedback">
          {BADGES.actions.feedback}
        </Button>
      );
    case "borrower":
      return (
        <div className={s.actionRow}>
          {b.earned ? null : (
            <Button kind="primary" href={APP_URL}>
              {BADGES.actions.openApp}
            </Button>
          )}
          <Button kind="secondary" to={BORROW_GUIDE}>
            {BADGES.actions.borrowGuide}
          </Button>
        </div>
      );
    case "transmuted":
      return (lookup.transmuterClaims?.count ?? 0) > 0 ? (
        <a className={`${s.textLink}`} href="/members#share">
          {BADGES.actions.transmuterCard}
        </a>
      ) : (
        <Button kind="secondary" href={APP_URL}>
          {BADGES.actions.openApp}
        </Button>
      );
    case "first_v3_deposit":
    case "held_30_days":
    case "returned":
    case "transmuter":
    case "two_chains":
      return b.earned ? null : (
        <Button kind="secondary" href={APP_URL}>
          {BADGES.actions.openApp}
        </Button>
      );
    default:
      return null;
  }
}

