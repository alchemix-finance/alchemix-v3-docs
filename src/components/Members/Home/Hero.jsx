import React, { useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import { isEngineDown } from "../lib/api";
import { errorText, useMember } from "../lib/member";
import { fmtDayMonth, fmtInt, fmtMonthYear, yearOf } from "../lib/format";
import { Button, EngineDown, Notice, Orbit } from "../parts";
import { BADGE_STRIP, CHART, ESSENCE_CELL, HERO, LOOKUP_FAILED, NEXT, RECORD, SEASON, UNKNOWN } from "../copy";
import { badgeList, bpsPercent, countsAsArbitrumOnly, daysToNext, fundedPositions, pastSeasonEnd, joinedSeason, positionsWhere, rarestBadges, readyToClaim, stakesWhere, tierOf } from "./model";
import { StepAction } from "./NextSteps";
import SeasonModule, { EssenceTrack } from "./SeasonModule";
import Medal from "./Medal";
import BadgePop from "./BadgePop";
import { GainChip, UnlockMoment, useLastVisit } from "./Moments";
import { useMyStanding } from "./standing";
import { EarningsLine, OnboardingAside, OnboardingCard, OnboardingHero, RateLine, VisitorHero } from "./Onboarding";
import s from "./home.module.css";

/**
 * The hero (plan items 1, 6, 7, 8): fits a 1440 by 900 screen without
 * scrolling. Walkthrough 2026-10-23: one hero per mode of the home page.
 *   visitor     no wallet on screen: what this is, Connect, the Safe line
 *   loading     a wallet is on screen and its lookup has not answered
 *   onboarding  the wallet has not joined the season: its headline, the
 *               getting-started checklist and what it unlocks
 *               (./Onboarding.jsx), with a past user's history card in
 *               place of the orbit
 *   member      joined (or no season open): the season banner and the status
 *               strip (what it has unlocked and what is next, positions,
 *               badges) with one primary next action
 * "View any address" lives in the connect modal and the footer, not here.
 *
 * Page review 2026-10-24 (Keenan's layout note): the hero is a two-column
 * grid with the text column spanning both rows on the left and, on the
 * right, the card (or the orbit) above the onboarding aside (what joining
 * unlocks). Before, the aside sat under the checklist in the text column and
 * the right column was empty below the card.
 *
 * Feedback 2026-10-28, second round (Keenan: the hero pulled the eye three
 * ways): a joined wallet with essence gets one column and one panel. The
 * season's name is the headline with its dates and days left on one line;
 * the essence panel holds the number, the track to each unlock, how far the
 * next one is, and the one action, with the return bonus on the action's
 * line because it pays on the same deposit. No orbit, no side cards, and the
 * latest credit stays in Your season.
 */
export default function Hero({ mode, lookup, progress, rungs, steps, config, onChanged, bonus }) {
  const { ready } = useMember();
  const data = lookup.data;
  const card = mode === "onboarding" && data?.history;
  const member = ready && mode === "member" && Boolean(data?.essence);

  if (member) {
    return (
      <section className={s.hero}>
        <div className={`${s.heroInner} ${s.heroInnerMember}`}>
          <div className={s.heroText}>
            <MemberHero lookup={lookup} progress={progress} rungs={rungs} steps={steps} config={config} onChanged={onChanged} bonus={bonus} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={s.hero}>
      <div className={`${s.heroInner} ${card ? s.heroInnerCard : ""}`}>
        <div className={s.heroText}>
          {!ready ? null : mode === "visitor" ? (
            <VisitorHero progress={progress} />
          ) : mode === "onboarding" ? (
            <>
              <OnboardingHero data={data} bonus={bonus} onChanged={onChanged} progress={progress} markets={config?.markets} />
            </>
          ) : (
            <>
              <div className={s.eyebrow}>{HERO.eyebrow}</div>
              <h1 className={s.headline}>{HERO.headline}</h1>
              {mode === "member" ? <p className={s.lead}>{HERO.lead}</p> : null}
              {mode === "member" ? <SeasonBanner progress={progress} /> : null}
              <StatusStrip
                lookup={lookup}
                rungs={rungs}
                steps={steps}
                config={config}
                onChanged={onChanged}
                seasonOpen={Boolean(progress.data?.season)}
                progress={progress}
              />
            </>
          )}
        </div>

        <div className={s.heroArt}>
          {card ? (
            <OnboardingCard data={data} />
          ) : (
            <Orbit className={s.orbit} aria-hidden="true" />
          )}
        </div>
        {ready && mode === "onboarding" && data ? (
          <div className={s.heroSide}>
            <OnboardingAside data={data} rungs={rungs} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The member hero. Feedback 2026-10-28, third round (Keenan: it looked better
 * but worked awkwardly; the growth line floated under it). The top line is
 * the eyebrow with who is on screen at the right; the season is the headline;
 * then one panel in two halves (EssencePanel). Fourth round: where the
 * wallet stands and its record, with the money facts moved to Positions.
 */
function MemberHero({ lookup, progress, rungs, steps, config, onChanged, bonus }) {
  const season = progress.data?.season ?? null;
  return (
    <>
      {/* Review 2026-11-13 (metalface): no "Members area" eyebrow here; the nav already says where this is. */}
      <h1 className={s.memberTitle}>{season?.name ?? HERO.headline}</h1>
      {/* Design notes 2026-11-03 (note 2): the season module's time bar in place of the thin date line. */}
      {season ? <SeasonModule season={season} /> : <SeasonBanner progress={progress} />}
      <EssencePanel data={lookup.data} rungs={rungs} steps={steps} config={config} onChanged={onChanged} progress={progress} />
    </>
  );
}

function SeasonBanner({ progress }) {
  if (progress.status === "error") {
    return (
      <div className={s.seasonBanner}>
        {isEngineDown(progress.error) ? <EngineDown onRetry={progress.retry} /> : <Notice tone="error">{errorText(progress.error)}</Notice>}
      </div>
    );
  }
  const season = progress.data?.season ?? null;
  if (progress.status === "ready" && !season) {
    return (
      <div className={s.seasonBanner}>
        <p className={s.seasonNone}>{SEASON.none}</p>
      </div>
    );
  }
  // Design notes 2026-11-03: one season module throughout; the banner keeps only its error, none and loading states.
  if (season) return <SeasonModule season={season} variant="card" name className={s.heroSeason} />;
  return (
    <div className={`${s.seasonBanner} ${s.seasonLoading}`} aria-busy="true">
      <div className={s.seasonTop}>
        <div className={s.seasonText}>
          <div className={s.seasonName}> </div>
          <div className={s.seasonDates}> </div>
        </div>
      </div>
      <div className={s.seasonBar} />
    </div>
  );
}

function StatusStrip({ lookup, rungs, steps, config, onChanged, seasonOpen, progress }) {
  const vaultRates = progress?.data?.vaultRates;
  if (lookup.status === "error") {
    return (
      <div className={s.stripError}>
        {isEngineDown(lookup.error) ? (
          <EngineDown onRetry={lookup.refresh} />
        ) : (
          <Notice tone="error" action={<Button kind="secondary" onClick={lookup.refresh}>{LOOKUP_FAILED.retry}</Button>}>
            <strong>{LOOKUP_FAILED.title}.</strong> {errorText(lookup.error)}
          </Notice>
        )}
      </div>
    );
  }
  const data = lookup.data;
  if (!data) {
    return (
      <div className={`${s.strip} ${s.stripLoading}`} aria-busy="true">
        <span className={s.loadingOrbit} aria-hidden="true" />
        <span className={s.bodySmall}>{HERO.loading}</span>
      </div>
    );
  }

  const positions = fundedPositions(data.positions);
  const stakes = data.transmuterStakes ?? [];
  const badges = badgeList(data);
  const earned = badges.filter((b) => b.earned).length;
  const unknown = !data.history && positions.length === 0 && stakes.length === 0 && !data.rung;
  const step = steps[0];

  return (
    <>
      {/* Feedback 2026-10-28: with essence, the essence card in the art column takes the strip's place. */}
      {data.essence ? null : (
        <div className={s.strip}>
          {joinedSeason(data) === false && seasonOpen ? <NotCountingCell /> : <RungCell data={data} rungs={rungs} />}
          <div className={s.cell}>
            <div className={s.cellLabel}>{HERO.status.positions}</div>
            <div className={s.cellValue}>{positions.length ? fmtInt(positions.length) : HERO.status.positionsNone}</div>
            {positions.length ? <div className={s.cellSub}>{positionsWhere(positions)}</div> : null}
            {/* Funnel review 2026-10-23: a saver's stake, and what a holder's collateral earned, in the strip. */}
            {!positions.length && stakes.length ? (
              <div className={s.cellSub}>
                {HERO.status.stakes(stakes.length)}, {stakesWhere(stakes)}
              </div>
            ) : null}
          </div>
          <a className={`${s.cell} ${s.cellLink}`} href="/members/badges">
            <div className={s.cellLabel}>{HERO.status.badges}</div>
            <div className={s.cellValue}>{HERO.status.badgesEarned(earned, badges.length)}</div>
            <div className={s.dots} aria-hidden="true">
              {badges.map((b) => (
                <span key={b.key} className={b.earned ? s.dotOn : b.hidden ? s.dotHidden : s.dotOff} />
              ))}
            </div>
          </a>
          {step ? (
            <div className={`${s.cell} ${s.cellAction}`}>
              <div className={s.cellLabel}>{step === "join_season" ? HERO.status.joinLabel : NEXT.steps[step].title}</div>
              <div className={s.cellButton}>
                <StepAction step={step} lookup={data} config={config} onChanged={onChanged} kind="primary" />
              </div>
            </div>
          ) : null}
        </div>
      )}
      {positions.length ? <EarningsLine data={data} className={s.stripEarn} vaultRates={vaultRates} /> : null}
      {/* Page review 2026-10-24 (batch item 3): a joined past user with no position keeps the rate line. */}
      {!positions.length && !stakes.length && data.history ? <RateLine data={data} progress={progress} /> : null}
      {unknown ? <p className={s.stripNote}>{UNKNOWN.body}</p> : null}
    </>
  );
}

/**
 * The essence panel. Feedback 2026-10-28, fourth round (Keenan: the hero
 * read as messy; make it feel accomplished and tenured). On the left, where
 * the wallet stands and where it is going: the number, the rate and the
 * rank, the essence bar with a marker for each unlock (design notes
 * 2026-11-03, note 4: it replaced the season chart), then the next unlock and
 * the one action. On the right, the record:
 * how long the wallet has used Alchemix, its three rarest badges, and how
 * many it holds, with anything waiting to be claimed. The money facts moved
 * to the Positions tab, and the return bonus to the Holding card, where a
 * deposit happens. Design notes 2026-11-03 (note 5): the record is its own
 * card beside the essence panel, which keeps only essence.
 */
function EssencePanel({ data, rungs, steps, config, onChanged, progress }) {
  const { result: standing } = useMyStanding();
  const essence = data.essence;
  const next = essence.nextRung;
  const days = next ? daysToNext(next.needed, data.standingPerDay) : null;
  // Round two, 2026-11-04: the daily amount with the badge multiplier, as the accrual pays it (the engine works it out).
  const holding = essence.size.dailyWithBadges ?? essence.size.daily;
  const daily = holding === null || holding === undefined ? null : holding + (essence.borrowBonus.earning ? essence.borrowBonus.daily : 0);
  const boost = daily !== null ? bpsPercent(data.badgeMultiplierBps) : null;
  const season = progress.data?.season ?? null;
  // Review 2026-11-13 (metalface: "deposit what?"): no deposit button in the hero. The Holding card
  // carries it, beside what a deposit earns. A first step that is not a deposit keeps its place here.
  const step = steps[0] === "top_up" || steps[0] === "open_position" ? null : steps[0];
  // Fifth round: what changed since the last visit, and a fresh unlock.
  const base = useLastVisit(data.address, essence.standing);
  return (
    <>
    <UnlockMoment data={data} rungs={rungs} base={base} config={config} />
    {/* Design notes 2026-11-03 (note 5): essence and the record are two cards side by side, each with its own border. */}
    <div className={s.heroPanels}>
    <div className={s.essencePanel}>
      <div className={s.essenceMain}>
        <div className={s.essenceHead}>
          <div className={s.cellLabel}>{ESSENCE_CELL.label}</div>
          {typeof essence.rank === "number" && essence.rank > 0 ? (
            <div className={s.essenceRank}>
              <span>{ESSENCE_CELL.rank(fmtInt(essence.rank), essence.tied)}</span>
              <Link to="/members/leaderboard#board" className={s.essenceRankLink}>
                {ESSENCE_CELL.board}
              </Link>
            </div>
          ) : null}
        </div>
        <div className={s.essenceFigure}>
          <div className={s.essenceNumber}>
            <CountUp value={essence.standing} />
          </div>
          {/* Design notes 2026-11-03 (note 3): one inline row beside the number, the parts joined by commas in CSS. */}
          <div className={s.essenceRate}>
            {daily !== null ? <span className={s.essenceRateValue}>{ESSENCE_CELL.perDay(fmtInt(daily))}</span> : null}
            {boost ? <span className={s.cellSub}>{ESSENCE_CELL.fromBadges(boost)}</span> : null}
            <CountedLine data={data} standing={standing} earning={daily !== null && daily > 0} />
            <GainChip essence={essence} base={base} />
          </div>
        </div>
        {/* Design notes 2026-11-03 (note 4): the season module's essence bar, with the three unlocks, in place of the chart. */}
        {rungs.length ? <EssenceTrack rungs={rungs} standing={essence.standing} className={s.essenceTrack} /> : null}
        {season && !(essence.standing > 0) && !((data.standingPerDay ?? daily ?? 0) > 0) ? (
          <p className={s.chartEmpty}>{countsAsArbitrumOnly(data) ? CHART.emptyArbitrum : CHART.empty}</p>
        ) : null}
        <div className={s.essenceFoot}>
          <p className={s.essenceNext}>
            {next ? (
              <>
                <a className={s.essenceNextLink} href="#unlocks" onClick={reopenHash}>
                  {ESSENCE_CELL.toNext(fmtInt(next.needed), next.label)}
                </a>
                {days !== null ? `, ${pastSeasonEnd(days, season?.endsAt) ? ESSENCE_CELL.beyond : ESSENCE_CELL.days(days)}` : ""}.
              </>
            ) : (
              ESSENCE_CELL.all
            )}
          </p>
          {step ? (
            <div className={s.essenceAct}>
              <StepAction step={step} lookup={data} config={config} onChanged={onChanged} kind="primary" hint={false} />
              {NEXT.steps[step].body ? <span className={s.essenceEffect}>{NEXT.steps[step].body}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
    <HeroRecord data={data} config={config} />
    </div>
    </>
  );
}

/**
 * The record half: the tenure line with its medal (the year the wallet first
 * used Alchemix, or when it came to v3, or when it joined the season), the
 * three rarest badges it holds, and the count with any claim waiting. Every
 * part links to the badges page.
 */
function HeroRecord({ data, config }) {
  const badges = badgeList(data);
  const earned = badges.filter((b) => b.earned).length;
  const ready = readyToClaim(data, config);
  const rare = rarestBadges(data, 3);
  const h = data.history;
  const tenure = badges.find((b) => b.key === "tenure");
  const firstV3 = (data.achievements ?? []).find((a) => a.key === "first_v3_deposit" && a.earned)?.earnedAt ?? null;
  const joinedAt = data.season?.joinedAt ?? null;
  const since = h?.firstUsedOn
    ? RECORD.since(fmtMonthYear(h.firstUsedOn))
    : firstV3
      ? RECORD.inV3Since(fmtMonthYear(firstV3))
      : joinedAt
        ? RECORD.joined(fmtDayMonth(joinedAt))
        : null;
  const sub = h ? RECORD.versions(h.versions ?? [], Boolean(h.migrated)) : null;
  const year = yearOf(h?.firstUsedOn) || null;
  return (
    <aside className={s.record} aria-labelledby="hero-record-title">
      <h2 className={s.recordHeading} id="hero-record-title">
        {RECORD.label}
      </h2>
      {since ? (
        <Link to="/members/badges#badge-tenure" className={s.recordTenure}>
          {tenure && h ? (
            <BadgePop badge={tenure} lookup={data} className={s.recordTenureMedal}>
              <Medal badgeKey="tenure" state={tenure.earned ? "earned" : "locked"} year={year} />
            </BadgePop>
          ) : (
            <Medal badgeKey="tenure" state={tenure?.earned || !h ? "earned" : "locked"} year={year} className={s.recordTenureMedal} />
          )}
          <span className={s.recordTenureText}>
            <span className={s.recordSince}>{since}</span>
            {sub ? <span className={s.recordSub}>{sub}</span> : null}
            {ready.includes("tenure") ? <span className={s.recordClaim}>{RECORD.claimTenure}</span> : null}
          </span>
        </Link>
      ) : null}
      {rare.length ? (
        <>
          <div className={s.recordRareLabel}>{RECORD.rarest}</div>
          <ul className={s.recordRare}>
            {rare.map((b, i) => (
              <li key={b.id ?? b.key} style={{ "--i": i }}>
                <BadgePop badge={b} lookup={data}>
                  <Link to={`/members/badges#badge-${b.id ?? b.key}`} className={s.recordBadge}>
                    <Medal badgeKey={b.key} state="earned" tier={tierOf(b)} />
                    <span className={s.recordBadgeName}>{b.title}</span>
                  </Link>
                </BadgePop>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={s.recordNone}>{RECORD.none}</p>
      )}
      <div className={s.recordFoot}>
        <Link to="/members/badges" className={s.recordAll}>
          {RECORD.count(earned, badges.length)}
          <span aria-hidden="true"> →</span>
        </Link>
        {ready.length ? (
          <Link to="/members/badges#ready" className={s.readyPill}>
            {BADGE_STRIP.ready(ready.length)}
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

/**
 * The essence number counts up from zero the first time it shows, and from
 * the old value when it changes. Still for anyone who asks for less motion.
 */
function CountUp({ value }) {
  const [shown, setShown] = useState(value);
  const last = useRef(null);
  useEffect(() => {
    const from = last.current ?? 0;
    last.current = value;
    const still = typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still || from === value) {
      setShown(value);
      return undefined;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 900);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <>
      <span aria-hidden="true">{fmtInt(shown)}</span>
      <span className={s.srOnly}>{fmtInt(value)}</span>
    </>
  );
}

/** A link to the hash the page already has still switches the tab: say it changed. */
function reopenHash(e) {
  if (typeof window !== "undefined" && window.location.hash === e.currentTarget.hash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
}

/** Before a wallet joins the season, nothing counts: the strip says so, and the action cell carries "Join the season". */
function NotCountingCell() {
  return (
    <div className={`${s.cell} ${s.cellWaiting}`}>
      <div className={s.cellLabel}>{HERO.status.season}</div>
      <div className={s.cellValue}>{HERO.status.notCounting}</div>
    </div>
  );
}

/**
 * Days counted: exact from the signed my-standing answer, else the day
 * counting started from the public lookup.
 */
function CountedLine({ data, standing, earning = true }) {
  if (joinedSeason(data) !== true) return null;
  // Fifth round (persona walk): the lookup's own count first, and never "Earning since" for a wallet that earns
  // nothing (no position, closed, Arbitrum only), which read against "Days earning 0" further down.
  const days = typeof standing?.daysCounted === "number" ? standing.daysCounted : typeof data.essence?.daysCounted === "number" ? data.essence.daysCounted : null;
  if (days !== null && days > 0) return <div className={s.cellSub}>{HERO.status.daysCounted(fmtInt(days))}</div>;
  if (!earning) return null;
  if (days === 0) return <div className={s.cellSub}>{HERO.status.firstCredit}</div>;
  const since = data.season?.countingSince ?? data.season?.joinedAt;
  if (!since) return null;
  return <div className={s.cellSub}>{HERO.status.countingSince(fmtDayMonth(since))}</div>;
}

function RungCell({ data, rungs }) {
  const { result: standing, run, claim } = useMyStanding();
  const rung = data.rung;
  const heldIndex = rung ? rungs.findIndex((r) => r.key === rung.key) : -1;
  const next = rungs[heldIndex + 1] ?? null;
  const top = rung && !next;

  let sub;
  if (top) sub = <div className={s.cellSub}>{HERO.status.top}</div>;
  else if (standing && standing.seasonId !== null && standing.nextRung) {
    const prev = heldIndex >= 0 ? rungs[heldIndex].threshold : 0;
    const span = Math.max(1, standing.nextRung.threshold - prev);
    const pct = Math.max(2, Math.min(100, Math.round(((standing.standing - prev) / span) * 100)));
    // Funnel review 2026-10-23: the gap in days at the wallet's daily rate, which reads better than a point count.
    const days = daysToNext(standing.nextRung.needed, data.standingPerDay);
    sub = (
      <>
        <div className={s.miniBar}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className={s.cellSub}>
          {HERO.status.toNext(fmtInt(standing.nextRung.needed), standing.nextRung.label)}
          {days !== null ? `, ${HERO.status.daysToNext(days)}` : ""}
        </div>
      </>
    );
  } else if (next && ((data.positions ?? []).length > 0 || rung || joinedSeason(data) === true)) {
    sub = (
      <div className={s.cellSub}>
        {HERO.status.next(next.label)}{" "}
        <button type="button" className={s.inlineButton} onClick={run} disabled={claim.busy}>
          {HERO.status.signToSee}
        </button>
      </div>
    );
  } else if (next) {
    sub = <div className={s.cellSub}>{HERO.status.next(next.label)}</div>;
  }

  return (
    <div className={s.cell}>
      <div className={s.cellLabel}>{HERO.status.rung}</div>
      <div className={s.cellValue}>{rung ? rung.label : HERO.status.noRung}</div>
      <CountedLine data={data} standing={standing} />
      {sub}
    </div>
  );
}
