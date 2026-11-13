import React from "react";
import { Button, Section } from "../parts";
import { BORROW_GUIDE, NEXT, NUMBER_WORDS, RETURN_BONUS, V2_TRANSMUTER_URL } from "../copy";
import { fmtDate } from "../lib/format";
import { DiscordAction, JoinAction, StandingAction, TenureAction } from "./actions";
import {
  INNER_CIRCLE_RUNGS,
  academyFull,
  appVaultUrl,
  countsAsArbitrumOnly,
  depositUnit,
  fundedPositions,
  hasDebt,
  joinedSeason,
  largestPositionMarket,
  lastPositionMarket,
  rateText,
  returnBonusCard,
  v2TransmuterWords,
} from "./model";
import s from "./home.module.css";

/**
 * NEXT STEPS (plan items 6 and 9, strategy alignment 2026-10-21): at most
 * three asks, picked from the wallet's state. The first one is also the
 * hero's primary action. The order:
 *   1. Join the season, while the wallet has not (nothing counts before).
 *      Then, for a past user or a Transmuter saver with no position, open
 *      one, and for a dormant holder, top up (walkthrough and funnel review
 *      2026-10-23: the money action before the Academy for those audiences).
 *   2. The Academy, for anyone not yet in the Inner Circle: the fast lane,
 *      and its credit carries into every season. Dropped once the wallet
 *      carries the full Academy credit.
 *   3. A safe borrow where it fits (a position with collateral and no debt),
 *      quoting the docs quick start (about 20% loan to value, 90% cap).
 * then the rest as before. The copy never says yield repays debt: in v3
 * debt falls only through redemptions or a manual repay.
 */
export function nextSteps(lookup, { discordConfigured, signedStanding, seasonOpen = true }) {
  const out = [];
  const positions = lookup.positions ?? [];
  // Demo walkthrough 2026-10-27: the same rule as everywhere else on the page, so dust counts as closed.
  const funded = fundedPositions(positions);
  const group = lookup.group?.group;
  const earned = (key) => (lookup.achievements ?? []).some((a) => a.key === key && a.earned);
  const joined = joinedSeason(lookup);
  const inCircle = Boolean(lookup.rung && INNER_CIRCLE_RUNGS.includes(lookup.rung.key));
  // Before the engine sent the join state, the Academy step went by the badge.
  const academyDone = joined === null ? earned("academy_graduate") : academyFull(lookup);

  // Funnel review 2026-10-23: an empty position (an exited NFT) and an Arbitrum-only holding count as no position here.
  const counting = countsAsArbitrumOnly(lookup) ? [] : funded.filter((p) => Number(p.chainId) !== 42161);
  if (seasonOpen && joined === false) out.push("join_season");
  // Walkthrough 2026-10-23: a past user with no position is asked to deposit before the Academy.
  // Funnel review 2026-10-23: so is a Transmuter saver, and a dormant holder is asked to top up
  // before the Academy (the shape's dormant ask is "add to the position").
  if (counting.length === 0 && (lookup.history || (lookup.transmuterStakes ?? []).length > 0 || funded.length > 0)) out.push("open_position");
  if (group === "dormant") out.push("top_up");
  // Page review 2026-10-24 (batch item 3): money left in a v2 Transmuter stays an ask after the join.
  if (v2TransmuterWords(lookup.history)) out.push("claim_v2");
  if (!inCircle && !academyDone) out.push("academy");
  if (counting.length > 0 && !counting.some(hasDebt)) out.push("borrow");
  if (group === "left") out.push("left");
  if (counting.length === 0) out.push("open_position");
  else if (group === "dormant") out.push("top_up");
  if (lookup.history && !lookup.tenureBadge?.claimed) out.push("claim_tenure");
  if (discordConfigured && !earned("discord_linked") && positions.length > 0) out.push("link_discord");
  // Fifth round (persona walk): the lookup carries the essence now, so the signature only helps without it.
  if (!signedStanding && !lookup.essence && (positions.length > 0 || joined)) out.push("see_standing");
  out.push("leaderboard");
  return [...new Set(out)].slice(0, 3);
}

/** Steps whose button asks for a signature. */
const SIGNED_STEPS = ["join_season", "claim_tenure", "see_standing", "link_discord"];

const LINKS = {
  borrow: { to: BORROW_GUIDE },
  academy: { to: "/academy" },
  left: { to: "/members/leaving" },
  leaderboard: { to: "/members/leaderboard" },
};

/** One step's button: a link, or the signed claim it names. */
export function StepAction({ step, lookup, config, onChanged, kind = "secondary", hint = true, label }) {
  const copy = NEXT.steps[step];
  // Feedback 2026-10-28: the hero names a deposit button by its step ("Deposit more").
  const cta = label ?? copy.cta;
  if (step === "claim_tenure") return <TenureAction lookup={lookup} onChanged={onChanged} kind={kind} label={copy.cta} hint={hint} />;
  if (step === "join_season") return <JoinAction lookup={lookup} onChanged={onChanged} kind={kind} label={copy.cta} hint={hint} />;
  if (step === "see_standing") return <StandingAction kind={kind} label={copy.cta} hint={hint} />;
  if (step === "link_discord") {
    return (
      <DiscordAction
        configured={config?.discordConfigured !== false}
        linked={false}
        onChanged={onChanged}
        returned={null}
        kind={kind}
        label={copy.cta}
        hint={hint}
      />
    );
  }
  if (step === "claim_v2") {
    return (
      <Button kind={kind} href={V2_TRANSMUTER_URL}>
        {copy.cta}
      </Button>
    );
  }
  // Funnel review 2026-10-23: the money actions deep link into the app's deposit panel for the right vault.
  // Page review 2026-10-24: a wallet that left lands on the vault of its last position.
  if (step === "top_up" || step === "open_position") {
    const marketId =
      step === "top_up" ? largestPositionMarket(lookup?.positions) : lookup?.group?.group === "left" ? lastPositionMarket(lookup?.positions) : null;
    const unit = depositUnit(lookup) ?? fundedPositions(lookup?.positions)[0]?.denomination ?? null;
    return (
      <Button kind={kind} href={appVaultUrl(config?.markets, { marketId, unit })}>
        {cta}
      </Button>
    );
  }
  return (
    <Button kind={kind} {...LINKS[step]}>
      {copy.cta}
    </Button>
  );
}

export default function NextSteps({ steps, lookup, config, onChanged, bonus }) {
  if (steps.length === 0 && !bonus) return null;
  // The gas line goes beside the first signing step only.
  const firstSigned = steps.find((step) => SIGNED_STEPS.includes(step));
  return (
    <Section label={NEXT.section} id="next">
      <ol className={s.steps}>
        {steps.map((step, i) => (
          <li key={step} className={s.step}>
            <span className={s.stepNum}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={s.stepTitle}>{NEXT.steps[step].title}</h3>
            <p className={s.stepBody}>
              {step === "claim_v2" && v2TransmuterWords(lookup?.history)
                ? NEXT.steps.claim_v2.bodyWith(v2TransmuterWords(lookup.history))
                : NEXT.steps[step].body}
            </p>
            <div className={s.stepAction}>
              <StepAction step={step} lookup={lookup} config={config} onChanged={onChanged} kind={i === 0 ? "primary" : "secondary"} hint={step === firstSigned} />
            </div>
          </li>
        ))}
      </ol>
      {bonus ? <ReturnBonusCard bonus={bonus} /> : null}
    </Section>
  );
}


/**
 * The return bonus card (strategy alignment; per wallet since v3 backlog
 * ticket 09). While proposed it carries a "Coming soon" tag (design notes 2026-11-03, note 35) and every
 * number is "if this goes live". A wallet with a bonus base sees its bonus,
 * the monthly step, and what forfeits it; once the window's end is settled,
 * each step's outcome (vested or forfeited). A wallet with nothing eligible
 * sees the plain offer. A referral invitee sees the newcomer line. Nothing
 * pays it yet, so there is no claim button, proposed or live.
 *
 * Feedback 2026-10-28: `compact` is the narrow version under the hero's
 * essence card. The "Not live." line is gone everywhere: the tag says it.
 */
export function ReturnBonusCard({ bonus, titled = true }) {
  const live = bonus.status === "live";
  const card = returnBonusCard(bonus);
  const months = NUMBER_WORDS[card.steps] ?? String(card.steps);
  const w = bonus.window;
  const newcomerRate = rateText(bonus.newcomerRate ?? 0.005);
  return (
    <aside className={`${s.bonus} ${live ? s.bonusLive : ""}`} aria-labelledby="return-bonus-title">
      <span className={live ? s.bonusTagLive : s.bonusTag}>{live ? RETURN_BONUS.status.live : RETURN_BONUS.status.proposed}</span>
      <div className={s.bonusText}>
        {/* Under its own "Return bonus" section label, the card needs no title of its own. */}
        <h3 className={titled ? s.bonusTitle : s.srOnly} id="return-bonus-title">
          {RETURN_BONUS.title}
        </h3>
        {card.mine ? (
          <>
            <p className={s.bonusMine}>
              {live ? (
                RETURN_BONUS.yoursLive(card.bonus, card.perStep, months)
              ) : (
                <>
                  <span className={s.bonusIf}>{RETURN_BONUS.ifLive}</span> {RETURN_BONUS.yours(card.bonus, card.perStep, months)}
                </>
              )}
            </p>
            <p className={s.bonusBody}>{RETURN_BONUS.forfeit}</p>
            {card.newcomer ? <p className={s.bonusWho}>{RETURN_BONUS.newcomerIncluded(newcomerRate, card.newcomer)}</p> : null}
            {card.settled ? (
              <>
                <p className={s.bonusWho}>{RETURN_BONUS.totals(card.vested, card.forfeited)}</p>
                <ol className={s.bonusSteps} aria-label={RETURN_BONUS.stepsTitle}>
                  {card.stepRows.map((r) => (
                    <li key={r.step} className={`${s.bonusStep} ${s[`bonusStep_${r.state}`] ?? ""}`}>
                      <span className={s.bonusStepDate}>{fmtDate(r.due, { short: true })}</span>
                      <span className={s.bonusStepAmount}>{r.amount}</span>
                      <span className={s.bonusStepState}>{RETURN_BONUS.stepState[r.state]}</span>
                    </li>
                  ))}
                </ol>
              </>
            ) : w && bonus.measuredOn ? (
              <p className={s.bonusWho}>
                {RETURN_BONUS.measured(fmtDate(w.startsOn, { short: true }), fmtDate(bonus.measuredOn, { short: true }), fmtDate(w.endsOn, { short: true }))}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className={s.bonusBody}>{RETURN_BONUS.body(rateText(bonus.rate), card.steps)}</p>
            {w ? <p className={s.bonusWho}>{RETURN_BONUS.window(fmtDate(w.startsOn, { short: true }), fmtDate(w.endsOn, { short: true }))}</p> : null}
            {bonus.newcomer ? <p className={s.bonusWho}>{RETURN_BONUS.newcomer(newcomerRate)}</p> : null}
          </>
        )}
      </div>
    </aside>
  );
}

/** The return bonus card on its own (onboarding, where next steps do not show). */
export function ReturnBonusSection({ bonus }) {
  if (!bonus) return null;
  return (
    <Section label={RETURN_BONUS.title} id="bonus">
      <ReturnBonusCard bonus={bonus} titled={false} />
    </Section>
  );
}
