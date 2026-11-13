import React from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { historyCardUrl, membersBase } from "../lib/api";
import { fmtDate, fmtIn, fmtInt, fmtMonthYear, fmtNativeSigned, fmtPct, fmtSpoken, fromWad, listWords } from "../lib/format";
import { Button, Section } from "../parts";
import { useMember } from "../lib/member";
import Medal from "./Medal";
import SeasonModule from "./SeasonModule";
import {
  APP_URL,
  CHANGED_URL,
  ESSENCE,
  HERO,
  JOIN_MESSAGE,
  V2_TRANSMUTER_URL,
  NUMBER_WORDS,
  ONBOARDING,
  RETURN_BONUS,
  SHARE,
  UNKNOWN,
  VISITOR,
} from "../copy";
import {
  academyCredit,
  appVaultUrl,
  countsAsArbitrumOnly,
  depositUnit,
  earningsOf,
  fundedPositions,
  lastPositionMarket,
  positionsWhere,
  rateText,
  stakesWhere,
  v2TransmuterWords,
  vaultRateFor,
} from "./model";
import { AcademyAction, JoinAction } from "./actions";
import { CardImage } from "./Detail";
import s from "./home.module.css";

/**
 * Onboarding (walkthrough 2026-10-23). The home page runs in two modes:
 * onboarding for a wallet that has not joined the season, and the member view
 * once it has. Onboarding puts the wallet's own record first, then one line on
 * what is in it for them, then a short checklist with one primary step. The
 * season counts, the full badge grid and next steps wait for the member view.
 *
 * Who sees what (onboardingKind), since Keenan's 2026-11-04 call that joining
 * comes first for everyone (done steps keep their place above it):
 *   lapsed    a past user with no v3 position: record (done), join (primary,
 *             with the return bonus line on the position step), position
 *   dormant   a dormant v3 holder: record, position (both done), join (primary)
 *   holder    any other wallet with a position: as dormant
 *   saver     no position, but an open Transmuter stake (funnel review
 *             2026-10-23): record, stake (done), join (primary), position
 *   newcomer  no history and no position: join (primary), the Academy, position
 * Joining is free and essence counts from the day of the join, so nothing is
 * lost by joining before depositing.
 *
 * Funnel review 2026-10-23: a holder's headline is followed by the money
 * fact the engine already computes (collateral growth since the April
 * handover and the vault's recent rate), so the reason to keep or add money
 * comes before the mechanics of essence.
 *
 * This replaces the returning-user hero of v3 backlog ticket 11. It shows for
 * every wallet that has not joined, with or without a personal link.
 */

export function onboardingKind(data) {
  const funded = fundedPositions(data?.positions);
  if (funded.length > 0) {
    if (countsAsArbitrumOnly(data)) return "arbitrum";
    return data.group?.group === "dormant" ? "dormant" : "holder";
  }
  if ((data?.transmuterStakes ?? []).length > 0) return "saver";
  if (data?.group?.group === "left") return "left";
  return data?.history ? "lapsed" : "newcomer";
}

/** The latest version a past user used, for "since v2" (or "since v1" for a v1-only wallet). */
export function latestVersion(history) {
  const versions = history?.versions ?? [];
  return versions.includes("v2") ? "v2" : versions.includes("v1") ? "v1" : "v2";
}

/** The checklist for a wallet, in order, each { key, done }. */
export function onboardingSteps(data) {
  const kind = onboardingKind(data);
  const hasPosition = fundedPositions(data.positions).length > 0;
  const academyDone =
    (data.achievements ?? []).some((a) => a.key === "academy_graduate" && a.earned) || (academyCredit(data) ?? 0) > 0;
  const record = data.history ? [{ key: "record", done: true }] : [];
  // Money left in a v2 Transmuter is the cheapest money ask there is: it comes right after the join.
  const claimV2 = v2TransmuterWords(data.history) ? [{ key: "claimV2", done: false }] : [];
  // Keenan, 2026-11-04 (with metalface's note 40): joining comes first for
  // everyone. It is free, essence counts from the day of the join, and the
  // season is what sends people on to the Academy and the deposit. Steps the
  // wallet has already done keep their place above it. This reverses the
  // 2026-10-23 order (lapsed: deposit first; newcomer: Academy first).
  const join = { key: "join", done: false };
  if (kind === "newcomer") {
    return [join, { key: "academy", done: academyDone }, { key: "position", done: false }];
  }
  if (kind === "saver") {
    return [...record, { key: "stake", done: true }, join, ...claimV2, { key: "position", done: false }];
  }
  if (kind === "arbitrum") {
    return [...record, { key: "arbitrumPosition", done: true }, join, ...claimV2, { key: "mainnetPosition", done: false }];
  }
  if (kind === "left") {
    return [...record, join, ...claimV2, { key: "position", done: false }, { key: "leaving", done: false }];
  }
  if (hasPosition) return [...record, { key: "position", done: true }, join, ...claimV2];
  return [...record, join, ...claimV2, { key: "position", done: false }];
}

/**
 * The hero's text column for a wallet that has not joined. Page review
 * 2026-10-24 (Keenan's layout note): the text column holds the headline, the
 * money fact and the checklist only. What joining unlocks and the migration
 * link sit in the right column under the card (OnboardingAside), so the two
 * columns fill the hero together instead of the text running long beside an
 * empty column. The social proof line moved from the hero stack to the
 * deposit step, where it argues for the ask.
 */
export function OnboardingHero({ data, bonus, onChanged, progress, markets }) {
  const kind = onboardingKind(data);
  const copy = ONBOARDING[kind];
  const steps = onboardingSteps(data);
  // The v2 claim and the exit reason are asides: the primary action stays the one that counts here.
  const primary = steps.find((st) => !st.done && st.key !== "claimV2" && st.key !== "leaving")?.key ?? null;
  const lead = kind === "lapsed" ? copy.lead(latestVersion(data.history)) : copy.lead;

  return (
    <>
      <div className={s.eyebrow}>{HERO.eyebrow}</div>
      <h1 className={s.headline}>{copy.headline}</h1>
      <p className={s.lead}>{lead}</p>
      {kind === "dormant" || kind === "holder" ? <EarningsLine data={data} vaultRates={progress?.data?.vaultRates} /> : null}
      {kind === "lapsed" ? <RateLine data={data} progress={progress} /> : null}
      {kind === "newcomer" ? <p className={s.stripNote}>{UNKNOWN.body}</p> : null}

      <ol className={s.checklist} aria-label={ONBOARDING.checklist}>
        {steps.map((st, i) => (
          <Step
            key={st.key}
            n={i + 1}
            step={st}
            primary={st.key === primary}
            data={data}
            bonus={bonus}
            onChanged={onChanged}
            markets={markets}
            progress={progress}
          />
        ))}
      </ol>
    </>
  );
}

/** The hero's right column under the card or the orbit: what joining unlocks, and the migration link for a past user. */
export function OnboardingAside({ data, rungs }) {
  const kind = onboardingKind(data);
  return (
    <div className={s.heroAside}>
      <Unlocks data={data} rungs={rungs} kind={kind} />
      {kind === "lapsed" ? (
        <p className={s.onboardMore}>
          <Link to={CHANGED_URL} className={s.textLink}>
            {ONBOARDING.changed(latestVersion(data.history))}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

/**
 * The money fact for a holder (funnel review 2026-10-23): collateral growth
 * since the position moved to v3 in the migration (or the first deposit), summed per unit, and the
 * vault's recent rate. From the engine's value then and now; nothing is
 * projected. Renders nothing when the engine could not read the history.
 */
export function EarningsLine({ data, className, vaultRates }) {
  const e = earningsOf(data, vaultRates);
  if (!e) return null;
  // Page review 2026-10-24 (batch item 2): growth that rounds to nothing is left out, and the start is dated.
  const shown = e.growth.filter((g) => Math.abs(fromWad(g.amount)) >= (g.denomination === "USD" ? 0.005 : 0.00005));
  const amounts = listWords(shown.map((g) => fmtNativeSigned(g.amount, g.denomination)));
  const grew = shown.some((g) => !String(g.amount).startsWith("-"));
  const date = e.sinceDate ? fmtDate(e.sinceDate, { short: true }) : null;
  const since =
    e.since === "handover" || !date
      ? ONBOARDING.earnings.sinceMigrated(date)
      : e.since === "owner_since"
        ? ONBOARDING.earnings.sinceDate(date)
        : ONBOARDING.earnings.sinceFirstDepositOn(date);
  if (shown.length === 0 && !e.rate) return null;
  return (
    <div className={`${s.earnLine} ${className ?? ""}`}>
      <p className={s.earnFact}>
        {shown.length > 0 ? (
          <>
            {ONBOARDING.earnings.lead} {grew ? <strong>{amounts}</strong> : amounts} {since}
          </>
        ) : null}
        {e.rate ? `${shown.length > 0 ? " " : ""}${ONBOARDING.earnings.rate(fmtPct(e.rate.value), e.rate.days)}` : ""}
      </p>
      <p className={s.earnNote}>{ONBOARDING.earnings.note}</p>
    </div>
  );
}

/**
 * The rate line for a past user with no position (funnel review 2026-10-23):
 * today's dated vault rate applied to their own largest deposit. Never a
 * "would have earned since 2021": v3 has no history before April 2026. Renders
 * nothing without a readable rate or a known deposit.
 */
export function RateLine({ data, progress }) {
  const deposit = data?.history?.largestDeposit;
  const amount = Number(deposit?.amount ?? 0);
  if (!deposit || !(amount > 0)) return null;
  const rate = vaultRateFor(progress?.data, deposit.unit);
  if (!rate || !(rate.value > 0)) return null;
  // Page review 2026-10-24: whole dollars, and the sentence names the deposit as the wallet's own.
  // The deposit reads as the welcome page's facts row does ("355 ETH", not "355.00 ETH").
  const yearly = amount * rate.value;
  const whole = (n) => (deposit.unit === "USD" ? `$${fmtInt(n)}` : fmtIn(n, deposit.unit));
  return (
    <div className={s.earnLine}>
      <p className={s.earnFact}>
        {ONBOARDING.rateLine.line(
          latestVersion(data.history),
          fmtSpoken(amount, deposit.unit),
          whole(yearly),
          fmtPct(rate.value),
          rate.vault,
          rate.days,
        )}
      </p>
      <p className={s.earnNote}>{ONBOARDING.rateLine.note(fmtDate(rate.asOf, { short: true }))}</p>
    </div>
  );
}

/**
 * One line of social proof from the latest sweep (funnel review 2026-10-23).
 * Nothing without the numbers. `variant` picks the sentence: "lapsed" under a
 * past user's deposit step, "visitor" under the visitor lead.
 */
export function CommunityLine({ progress, className, variant = "visitor" }) {
  const c = progress?.data?.community;
  if (!c || !(c.holders > 0)) return null;
  const date = fmtDate(c.asOf, { short: true });
  return (
    <p className={`${s.communityLine} ${className ?? ""}`}>
      {variant === "lapsed"
        ? ONBOARDING.community.lapsed(fmtInt(c.pastUsersInV3), date)
        : ONBOARDING.community.visitor(fmtInt(c.holders), fmtInt(c.pastUsersInV3), date)}
    </p>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Step({ n, step, primary, data, bonus, onChanged, markets, progress }) {
  const c = ONBOARDING.steps[step.key];
  const kind = primary ? "primary" : "secondary";
  const who = onboardingKind(data);
  let title = c.title;
  let body = c.body;
  let extra = null;
  let action = null;

  if (step.key === "record") {
    const h = data.history;
    const since = h.firstUsedOn ? fmtMonthYear(h.firstUsedOn) : [...(h.versions ?? [])].sort()[0] ?? "";
    body = c.body(since, listWords(h.versions ?? []));
  } else if (step.key === "position" || step.key === "mainnetPosition") {
    if (step.done) {
      title = c.doneTitle;
      body = positionsWhere(fundedPositions(data.positions));
    } else {
      if (step.key === "position" && who === "saver") body = c.saverBody;
      // Deep link to the vault the wallet's money speaks in (an Arbitrum holder's asset, on Ethereum),
      // or, for a wallet that left, the vault of its last position (page review 2026-10-24). A wallet
      // that left Arbitrum gets the Ethereum vault of the same asset, and the plain body.
      const arb = fundedPositions(data.positions)[0];
      const marketId = who === "left" ? lastPositionMarket(data.positions) : null;
      const unit = depositUnit(data) ?? arb?.denomination ?? (who === "left" ? (data.positions ?? [])[0]?.denomination ?? null : null);
      if (step.key === "position" && who === "left" && marketId) body = c.leftBody;
      action = (
        <Button kind={kind} href={appVaultUrl(markets, { marketId, unit })}>
          {c.cta}
        </Button>
      );
      // The bonus line, then one line of social proof for a past user: people like them came back.
      const social = (who === "lapsed" || who === "left") && data.history ? <CommunityLine progress={progress} variant="lapsed" className={s.checkSocial} /> : null;
      extra = bonus || social ? (
        <>
          {bonus ? <BonusLine bonus={bonus} /> : null}
          {social}
        </>
      ) : null;
    }
  } else if (step.key === "arbitrumPosition") {
    body = c.body(positionsWhere(fundedPositions(data.positions)));
  } else if (step.key === "stake") {
    body = c.body(stakesWhere(data.transmuterStakes ?? []));
  } else if (step.key === "leaving") {
    action = (
      <Button kind="secondary" to="/members/leaving">
        {c.cta}
      </Button>
    );
  } else if (step.key === "claimV2") {
    body = c.body(v2TransmuterWords(data.history));
    action = (
      <Button kind="secondary" href={V2_TRANSMUTER_URL}>
        {c.cta}
      </Button>
    );
  } else if (step.key === "join") {
    extra = <p className={s.checkFine}>{c.message(JOIN_MESSAGE)}</p>;
    action = <JoinAction lookup={data} onChanged={onChanged} kind={kind} label={c.cta} hint={false} />;
  } else if (step.key === "academy") {
    if (step.done) title = c.doneTitle;
    else action = <AcademyAction onChanged={onChanged} goLabel={c.cta} quiet={!primary} hideNone />;
  }

  return (
    <li className={`${s.check} ${step.done ? s.checkDone : ""} ${primary ? s.checkNow : ""}`}>
      <span className={s.checkMark} aria-hidden="true">
        {step.done ? <Tick /> : n}
      </span>
      <div className={s.checkText}>
        <div className={s.checkTitle}>
          {title}
          {step.done ? <span className={s.srOnly}> ({ONBOARDING.done})</span> : null}
        </div>
        <p className={s.checkBody}>{body}</p>
        {extra}
      </div>
      {action ? <div className={s.checkAction}>{action}</div> : null}
    </li>
  );
}

/** The return bonus in one tagged line, beside the deposit step. */
function BonusLine({ bonus }) {
  const live = bonus.status === "live";
  const steps = Number(bonus.steps) > 0 ? Number(bonus.steps) : 6;
  return (
    <p className={s.checkBonus}>
      <span className={live ? s.bonusTagLive : s.bonusTag}>{live ? RETURN_BONUS.status.live : RETURN_BONUS.status.proposed}</span>
      <span>{RETURN_BONUS.hint(rateText(bonus.rate), NUMBER_WORDS[steps] ?? String(steps))}</span>
    </p>
  );
}

/** What joining and holding unlock, with the first unlock's timing from the wallet's daily rate. */
function Unlocks({ data, rungs, kind }) {
  const first = rungs[0]?.threshold ?? null;
  const perDay = typeof data.standingPerDay === "number" && data.standingPerDay > 0 ? data.standingPerDay : null;
  // A saver's size is all Transmuter stake, which counts only once held 7 days.
  const stakeWait = fundedPositions(data.positions).length === 0 && (data.transmuterStakes ?? []).length > 0 ? 7 : 0;
  const when = first && perDay ? ONBOARDING.unlocks.inDays(Math.ceil(first / perDay) + stakeWait) : ONBOARDING.unlocks.soon;
  return (
    <div className={s.unlocks}>
      <div className={s.unlocksLabel}>{ONBOARDING.unlocks.label}</div>
      <p className={s.unlocksLine}>{kind === "arbitrum" ? ONBOARDING.unlocks.arbitrum : ONBOARDING.unlocks.line(when)}</p>
      <p className={s.unlocksDefine}>
        {ESSENCE.define}{" "}
        {/* Design notes 2026-11-03 (metalface 38): the leaderboard's ladder is gone; the store shows what each level unlocks. */}
        <Link to="/members/store" className={s.textLink}>
          {ESSENCE.how}
        </Link>
      </p>
    </div>
  );
}

/** The hero's right column for a past user in onboarding: their history card in place of the orbit. */
export function OnboardingCard({ data }) {
  const { siteConfig } = useDocusaurusContext();
  const base = membersBase(siteConfig);
  const h = data.history;
  const since = h.firstUsedOn ? fmtMonthYear(h.firstUsedOn) : [...(h.versions ?? [])].sort()[0] ?? "";
  return (
    <div className={s.heroCard}>
      <CardImage src={historyCardUrl(base, data.address)} alt={SHARE.history.alt(since)} eager />
    </div>
  );
}

/**
 * The visitor hero's text column: what this is, and Connect. Keenan, 2026-10-29: no community figures here.
 * Review 2026-11-13 (metalface): no "Using a Safe?" button; few visitors use one, and the connect modal
 * carries the Safe route (SafeHint).
 */
export function VisitorHero({ progress }) {
  const { openConnect } = useMember();
  return (
    <>
      <div className={s.eyebrow}>{HERO.eyebrow}</div>
      <h1 className={s.headline}>{VISITOR.headline}</h1>
      <p className={s.lead}>{VISITOR.lead}</p>
      <div className={s.heroConnect}>
        <Button kind="primary" onClick={openConnect}>
          {HERO.connect}
        </Button>
      </div>
    </>
  );
}

/**
 * The open season on the visitor page, between the hero and How it works
 * (design notes 2026-11-03, note 43): the shared season module, with the
 * link to the leaderboard. Nothing while no season is open.
 */
export function VisitorSeason({ progress }) {
  const season = progress.data?.season ?? null;
  if (!season) return null;
  return (
    <Section label={VISITOR.season} id="season">
      <SeasonModule
        season={season}
        variant="card"
        name
        tag={VISITOR.seasonOpen}
        link={{ to: "/members/leaderboard", label: VISITOR.leaderboard }}
      />
    </Section>
  );
}

/**
 * "How it works" under the visitor hero (visual pass 2026-10-28): the three
 * steps as cards in the member page's card style, each with its picture (the
 * medals a record earns, the message the join signs, the unlocks and what
 * they take). The open season sits above it now (VisitorSeason).
 */
export function HowItWorks({ rungs = [] }) {
  const pictures = [<RecordPicture key="record" />, <SignPicture key="sign" />, <UnlockPicture key="unlock" rungs={rungs} />];
  return (
    <Section label={VISITOR.how} id="how">
      <ol className={s.howGrid}>
        {VISITOR.steps.map((st, i) => (
          <li key={st.title} className={s.howCard} style={{ "--i": i }}>
            <div className={s.howPicture}>{pictures[i]}</div>
            <span className={s.stepNum}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={s.stepTitle}>{st.title}</h3>
            <p className={s.howBody}>{st.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** Three history medals, fanned: what a record turns into. */
function RecordPicture() {
  return (
    <div className={s.howMedals} aria-hidden="true">
      {["v1_era", "tenure", "v2_era"].map((k) => (
        <Medal key={k} badgeKey={k} state="earned" className={s.howMedal} />
      ))}
    </div>
  );
}

/** The join message itself, as the wallet shows it. */
function SignPicture() {
  return (
    <figure className={s.howSign}>
      <figcaption className={s.howSignLabel}>{VISITOR.signLabel}</figcaption>
      <blockquote className={s.howSignText}>{JOIN_MESSAGE}</blockquote>
    </figure>
  );
}

/**
 * The season's unlocks on one track, each with the essence it takes.
 * Review 2026-11-13 (metalface): no role names under the figures; the medals
 * and the amounts hint at the rewards, and the names wait for the member page.
 */
function UnlockPicture({ rungs }) {
  if (!rungs.length) return null;
  return (
    <ol className={s.howRungs}>
      {rungs.map((r) => (
        <li key={r.key} className={s.howRung}>
          <Medal badgeKey={r.key} state="earned" className={s.howRungMedal} />
          <span className={s.howRungAt}>{fmtInt(r.threshold)}</span>
          <span className={s.srOnly}>{r.label}</span>
        </li>
      ))}
    </ol>
  );
}
