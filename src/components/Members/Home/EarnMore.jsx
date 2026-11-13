import React, { useState } from "react";
import { Button, Section } from "../parts";
import { BORROW_GUIDE, EARN, NEXT, NUMBER_WORDS, RETURN_BONUS } from "../copy";
import { fmtInt } from "../lib/format";
import { AcademyAction, EventCodeCard } from "./actions";
import { StepAction } from "./NextSteps";
import { ReferralCard } from "./Detail";
import { UnlockGrid } from "./Unlocks";
import { TabList, TabPanel, useHashTabs } from "./Tabs";
import { REFERRAL_DEFAULTS, appVaultUrl, countsAsArbitrumOnly, dailyAt, fundedPositions, hasDebt, holdingNext, largestPositionMarket, ltvOf, rateText, returnBonusCard, sharePct, v2TransmuterWords } from "./model";
import s from "./home.module.css";

/**
 * ESSENCE (member journey 2026-10-28): for a joined wallet, in place of next
 * steps. From the lookup's `essence` (the engine's
 * src/lib/standing/walletEssence.ts).
 *
 * Feedback 2026-10-28, second round (Keenan: Earn more read as a wall of
 * rows, and could merge with What you get): one section, two tabs.
 *   Ways to earn   the two daily sources as cards with a picture each (the
 *                  size tiers as steps, the safe-loan band as a gauge with
 *                  the wallet's loans on it), then the capped sources as
 *                  tiles, each with its meter, one line and one action. The
 *                  tasks that earn nothing sit under them.
 * Third round the same day: the tabs are shared with Your season (./Tabs.jsx),
 * holding is drawn as a curve that carries the holding slope, and the tenure
 * claim moved to the badges page, where every claim now waits.
 *   What you get   a card per rung (./Unlocks.jsx).
 * "#unlocks" and "#earn" in the address pick the tab; the hero's
 * "N to <rung>" links to #unlocks.
 *
 * The copy never says yield repays debt: in v3 debt falls only through
 * redemptions or a manual repay.
 */
export default function EarnMore({ lookup, rungs, config, progressData, onChanged, referralBonus = null, bonus = null }) {
  const [tab, setTab] = useHashTabs(TABS, "essence");
  const essence = lookup.essence;
  if (!essence) return null;
  return (
    <Section
      label={EARN.section}
      id="essence"
      aside={<TabList prefix="essence" keys={TABS} labels={EARN.tabs} label={EARN.tabsLabel} tab={tab} onChange={setTab} />}
      /* Review 2026-11-13 (metalface): the docs link is a small "?" beside the title, in place of the long link at the right. */
      help={{ to: "/members/leaderboard#board", label: EARN.how }}
      className={s.essenceSection}
    >
      <TabPanel prefix="essence" k="earn" tab={tab}>
        <WaysToEarn lookup={lookup} config={config} onChanged={onChanged} referralBonus={referralBonus} bonus={bonus} />
      </TabPanel>
      <TabPanel prefix="essence" k="unlocks" tab={tab}>
        <UnlockGrid lookup={lookup} rungs={rungs} config={config} progressData={progressData} onChanged={onChanged} />
      </TabPanel>
    </Section>
  );
}

const TABS = ["earn", "unlocks"];

/** The 90% borrowing limit in v3 (docs: Maximum LTV 90%). The safe-loan band is quoted against it. */
const MAX_LTV = 0.9;

/** The invitee's newcomer bonus (engine RETURN_BONUS_DEFAULTS.newcomerRateBps, 0.5%), proposed with the return bonus. */
const NEWCOMER_RATE = 0.005;

/** Holding and the safe-loan bonus count Ethereum and Optimism only (engine STANDING_CHAIN_IDS). */
const STANDING_CHAINS = [1, 10];

function WaysToEarn({ lookup, config, onChanged, referralBonus, bonus }) {
  const essence = lookup.essence;
  const by = Object.fromEntries(essence.sources.map((x) => [x.source, x]));
  const chores = choresOf(lookup, config);

  return (
    <>
      <p className={s.earnLands}>{EARN.lands}</p>

      {/* Design notes 2026-11-03 (note 21): the group names read as labels. */}
      <h3 className={s.earnGroup}>
        <span className={s.earnGroupLabel}>{EARN.daily}</span>
      </h3>
      <div className={s.dailyGrid}>
        <HoldingCard lookup={lookup} config={config} source={by.holding} size={essence.size} bonus={bonus} />
        <LoanCard lookup={lookup} config={config} band={essence.borrowBonus} />
      </div>

      <h3 className={s.earnGroup}>
        <span className={s.earnGroupLabel}>{EARN.capped}</span>
      </h3>
      <ul className={s.capGrid}>
        <CapTile
          source={by.referral}
          copy={EARN.rows.referral}
          wide
          body={
            <>
              {EARN.rows.referral.body(`$${fmtInt(REFERRAL_DEFAULTS.minUsd)}`, fmtInt(REFERRAL_DEFAULTS.holdDays), sharePct(REFERRAL_DEFAULTS.share))}
              {referralBonus ? <ReferralProposal bonus={referralBonus} /> : null}
            </>
          }
          /* Design notes 2026-11-03 (note 9): the link itself lives here now, since Your record lost its invite card. */
          action={<ReferralCard lookup={lookup} bare hint />}
          always
        />
        <CapTile
          source={by.academy}
          copy={EARN.rows.academy}
          action={<AcademyAction onChanged={onChanged} goLabel={EARN.rows.academy.cta} quiet hideNone />}
        />
        <CapTile source={by.event} copy={EARN.rows.event} action={<EventCodeCard onChanged={onChanged} bare />} />
        <CapTile
          source={by.feedback}
          copy={EARN.rows.feedback}
          action={
            <Button kind="secondary" to="/members/feedback">
              {EARN.rows.feedback.cta}
            </Button>
          }
        />
        {/* Review 2026-11-13 (metalface): a tile with no button says why it has none. */}
        <CapTile source={by.community} copy={EARN.rows.community} tag={EARN.rows.community.tag} />
      </ul>

      {chores.length ? (
        <div className={s.chores}>
          <div className={s.choresLabel}>{EARN.also}</div>
          <ul className={s.choreList}>
            {chores.map((step) => (
              <li key={step} className={s.chore}>
                <span className={s.choreTitle}>
                  {step === "claim_v2" && v2TransmuterWords(lookup.history) ? NEXT.steps.claim_v2.bodyWith(v2TransmuterWords(lookup.history)) : NEXT.steps[step].title}
                </span>
                <StepAction step={step} lookup={lookup} config={config} onChanged={onChanged} kind="secondary" hint={false} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

/** The tasks that earn no essence, in the order next steps used. */
function choresOf(lookup, config) {
  const earned = (key) => (lookup.achievements ?? []).some((a) => a.key === key && a.earned);
  const out = [];
  if (v2TransmuterWords(lookup.history)) out.push("claim_v2");
  if (config?.discordConfigured && !earned("discord_linked") && (lookup.positions ?? []).length > 0) out.push("link_discord");
  // Fifth round (persona walk): a wallet that left keeps the question after it joins.
  if (lookup.group?.group === "left") out.push("left");
  return out;
}

const pct = (x) => `${Math.round(Number(x) * 100)}%`;

/** "$300", "$10k": the tier lines. */
const tierUsd = (usd) => (usd >= 1000 ? `$${fmtInt(usd / 1000)}k` : `$${fmtInt(usd)}`);

/**
 * A daily source: title, what it gives a day, a picture, one line, one action.
 * Design notes 2026-11-03 (note 33): the "so far" line under the title is gone from Holding and Safe loan.
 */
function DailyCard({ title, value, sub, on, children, note, extra = null, action }) {
  return (
    <article className={`${s.earnCard} ${on ? s.earnCardOn : ""}`}>
      <div className={s.earnCardHead}>
        <h4 className={s.earnTitle}>
          {on ? <span className={s.earnOn} aria-hidden="true" /> : null}
          {title}
        </h4>
        <div className={s.earnCardValue}>{value}</div>
      </div>
      {sub ? <div className={s.earnSub}>{sub}</div> : null}
      <div className={s.earnCardPicture}>{children}</div>
      {note ? <p className={s.earnCardNote}>{note}</p> : null}
      {extra}
      {action ? <div className={s.earnCardAction}>{action}</div> : null}
    </article>
  );
}

/**
 * Holding: daily essence by size as a curve (feedback 2026-10-28, third
 * round), the wallet's own size marked on it, and what a top-up would change.
 * Each tier gets an equal width; a sloped tier draws a ramp to the next
 * tier's amount, a flat one a level line, so the same picture serves the
 * holding slope and plain tiers. Holding has no season cap.
 */
function HoldingCard({ lookup, config, source, size, bonus }) {
  const c = EARN.rows.holding;
  const counting = fundedPositions(lookup.positions).length > 0 || (lookup.transmuterStakes ?? []).length > 0;
  const tiers = size.tiers ?? [];
  const next = size.daily === null ? null : holdingNext(tiers, size.usd);
  let note;
  let step = "top_up";
  if (size.daily === null) {
    note = c.open;
    step = "open_position";
  } else if (next?.kind === "step") {
    note = c.next(`$${fmtInt(Math.max(10, Math.ceil(next.gapUsd / 10) * 10))}`, tierUsd(next.to.fromUsd), fmtInt(next.to.daily));
  } else {
    // Sixth round (Keenan): on a sloped scale the curve, its readout and the rule line already say what more money
    // adds, so no sentence re-says it. A stepped scale still names the gap to the next step.
    note = null;
  }
  return (
    <DailyCard
      title={c.title}
      value={size.daily !== null ? c.rate(fmtInt(size.daily)) : c.none}
      on={size.daily !== null}
      note={note}
      extra={bonus && (step === "open_position" || (next && next.kind !== "top")) ? <BonusLine bonus={bonus} /> : null}
      action={
        (next && next.kind !== "top") || !counting ? (
          <StepAction
            step={step}
            lookup={lookup}
            config={config}
            kind={size.daily === null ? "primary" : "secondary"}
            hint={false}
            label={step === "open_position" && countsAsArbitrumOnly(lookup) ? NEXT.steps.open_position.titleArbitrum : NEXT.steps[step].title}
          />
        ) : null
      }
    >
      {tiers.length ? <SizeCurve tiers={tiers} usd={size.daily === null ? null : size.usd} daily={size.daily} /> : null}
    </DailyCard>
  );
}

/**
 * Feedback 2026-10-28, fourth round (Keenan: the tier numbers read oddly):
 * the curve names the amount at each tier line ("400" at $1k) instead of a
 * label per stretch, and the line under it says the rule in words when the
 * tiers make a tenfold scale ("100 a day up to $100, then 300 more for each
 * tenfold, to 1,000 a day from $100k").
 */
function SizeCurve({ tiers, usd, daily }) {
  const c = EARN.rows.holding;
  // Fifth round (Keenan, 2026-10-28): point at the curve (or use the arrow keys) to read the daily amount at any size.
  const [probe, setProbe] = useState(null);
  const top = Math.max(1, ...tiers.map((t) => t.daily));
  const seg = 100 / tiers.length;
  const y = (d) => 100 - (d / top) * 80;
  const x = (v) => {
    let i = 0;
    tiers.forEach((t, k) => {
      if (v >= t.fromUsd) i = k;
    });
    const from = tiers[i].fromUsd;
    const to = tiers[i + 1]?.fromUsd ?? from * 2.5;
    return Math.min(100, i * seg + (Math.min(Math.max(v - from, 0), to - from) / Math.max(1, to - from)) * seg);
  };
  const pts = [];
  tiers.forEach((t, i) => {
    const end = t.slope && tiers[i + 1] ? tiers[i + 1].daily : t.daily;
    pts.push([i * seg, y(t.daily)], [(i + 1) * seg, y(end)]);
  });
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(2)} ${py.toFixed(2)}`).join(" ");
  const area = `${line} L100 100 L0 100 Z`;
  // The amount where each tier starts, on its line; the first tier's own amount at the left when it differs.
  const knots = tiers.slice(1).map((t, k) => ({
    key: t.fromUsd,
    left: (k + 1) * seg,
    top: y(t.daily),
    text: k + 2 === tiers.length ? c.capAt(fmtInt(t.daily)) : fmtInt(t.daily),
  }));
  if (tiers.length > 1 && tiers[1].daily !== tiers[0].daily) knots.unshift({ key: "start", left: 0, top: y(tiers[0].daily), text: fmtInt(tiers[0].daily) });
  const you = usd !== null && daily !== null ? { left: x(usd), top: y(daily) } : null;
  const rule = scaleWords(tiers);
  // The size at a point across the plot (the inverse of x), rounded to two figures.
  const probeAt = (p) => {
    const at = Math.max(0, Math.min(100, p));
    const i = Math.min(tiers.length - 1, Math.floor(at / seg));
    const from = tiers[i].fromUsd;
    const to = tiers[i + 1]?.fromUsd ?? from * 2.5;
    const raw = Math.max(1, from + ((at - i * seg) / seg) * (to - from));
    const step = Math.max(1, 10 ** Math.floor(Math.log10(raw)) / 10);
    const size = Math.round(raw / step) * step;
    const perDay = dailyAt(tiers, size) ?? 0;
    return { at, usd: size, daily: perDay, left: x(size), top: y(perDay) };
  };
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    setProbe(probeAt(((e.clientX - box.left) / Math.max(1, box.width)) * 100));
  };
  const onKey = (e) => {
    const by = { ArrowRight: 2, ArrowUp: 2, ArrowLeft: -2, ArrowDown: -2 }[e.key];
    if (!by) return;
    e.preventDefault();
    setProbe((p) => probeAt((p ? p.at : you ? you.left : 50) + by));
  };
  const probeText = probe ? c.probe(`$${fmtInt(probe.usd)}`, fmtInt(probe.daily)) : null;
  const delta = probe && daily !== null ? probe.daily - daily : 0;
  return (
    <figure className={s.curve} aria-label={c.tiers}>
      <div
        className={`${s.curvePlot} ${probe ? s.curveProbing : ""}`}
        onPointerMove={onMove}
        onPointerLeave={() => setProbe(null)}
        onKeyDown={onKey}
        onBlur={() => setProbe(null)}
        tabIndex={0}
        role="slider"
        aria-label={c.probeLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(probe ? probe.at : you ? you.left : 0)}
        aria-valuetext={probeText ?? (you ? c.you(`$${fmtInt(Math.round(usd))}`) : c.probeLabel)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(245,192,154,0.28)" />
              <stop offset="1" stopColor="rgba(245,192,154,0)" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#curveFill)" className={s.curveArea} />
          {tiers.slice(1).map((t, i) => (
            <line key={t.fromUsd} x1={(i + 1) * seg} x2={(i + 1) * seg} y1="0" y2="100" className={s.curveGrid} vectorEffect="non-scaling-stroke" />
          ))}
          <path d={line} fill="none" className={s.curveLine} vectorEffect="non-scaling-stroke" />
        </svg>
        {knots.map((k) => (
          <span key={k.key} className={`${s.curveKnot} ${k.left === 0 ? s.curveKnotStart : ""}`} style={{ left: `${k.left}%`, top: `${k.top}%` }} aria-hidden="true">
            <span className={s.curveKnotLabel}>{k.text}</span>
          </span>
        ))}
        {you ? (
          <span className={s.curveYou} style={{ left: `${you.left}%`, top: `${you.top}%` }}>
            <span className={s.curveDot} aria-hidden="true" />
            <span className={s.curveYouLabel}>{c.you(`$${fmtInt(Math.round(usd))}`)}</span>
          </span>
        ) : null}
        {probe ? (
          <>
            <span className={s.curveProbeLine} style={{ left: `${probe.left}%` }} aria-hidden="true" />
            <span className={s.curveProbe} style={{ left: `${probe.left}%`, top: `${probe.top}%` }} aria-hidden="true">
              <span className={`${s.curveProbeTip} ${probe.left > 70 ? s.curveProbeTipLeft : probe.left < 18 ? s.curveProbeTipRight : ""} ${probe.top < 50 ? s.curveProbeTipBelow : ""}`}>
                <strong>{`$${fmtInt(probe.usd)}`}</strong>
                <span>{c.tierDaily(fmtInt(probe.daily))}</span>
                {you && delta !== 0 ? (
                  <span className={delta > 0 ? s.curveProbeUp : s.curveProbeDown}>{delta > 0 ? c.probeMore(fmtInt(delta)) : c.probeLess(fmtInt(-delta))}</span>
                ) : null}
              </span>
            </span>
          </>
        ) : null}
      </div>
      <div className={s.curveAxis} aria-hidden="true">
        {tiers.slice(1).map((t, i) => (
          <span key={t.fromUsd} style={{ left: `${(i + 1) * seg}%` }}>
            {tierUsd(t.fromUsd)}
          </span>
        ))}
      </div>
      {rule ? <p className={s.curveRule}>{rule}</p> : null}
      <figcaption className={s.srOnly}>
        {tiers
          .map((t, i) => {
            const nextFrom = tiers[i + 1]?.fromUsd ?? null;
            const range = i === 0 && t.fromUsd === 0 && nextFrom !== null ? c.tierUnder(tierUsd(nextFrom)) : nextFrom === null ? c.tierFrom(tierUsd(t.fromUsd)) : c.tierRange(tierUsd(t.fromUsd), tierUsd(nextFrom));
            const amount = i === tiers.length - 1 ? c.cap(fmtInt(t.daily)) : t.slope && tiers[i + 1] ? c.rising(fmtInt(t.daily), fmtInt(tiers[i + 1].daily)) : c.tierDaily(fmtInt(t.daily));
            return `${range}: ${amount}`;
          })
          .join(". ")}
        .
      </figcaption>
    </figure>
  );
}

/** The rule in words when the tiers are a flat start, then equal rises for each tenfold, then a cap; else null. */
function scaleWords(tiers) {
  if (tiers.length < 4 || tiers[0].fromUsd !== 0) return null;
  const rises = tiers.slice(1, -1);
  if (!rises.every((t) => t.slope)) return null;
  const step = tiers[2].daily - tiers[1].daily;
  for (let i = 1; i < tiers.length - 1; i += 1) {
    if (tiers[i + 1].fromUsd !== tiers[i].fromUsd * 10 || tiers[i + 1].daily - tiers[i].daily !== step) return null;
  }
  const cap = tiers[tiers.length - 1];
  return EARN.rows.holding.scale(fmtInt(tiers[0].daily), tierUsd(tiers[1].fromUsd), fmtInt(step), fmtInt(cap.daily), tierUsd(cap.fromUsd));
}

/** The return bonus in the Holding card, beside Deposit more (moved from the hero, fourth round): coming soon or live, what it pays, and the wallet's own figure once it has one. */
function BonusLine({ bonus }) {
  const live = bonus.status === "live";
  const card = returnBonusCard(bonus);
  const months = NUMBER_WORDS[card.steps] ?? String(card.steps);
  return (
    <p className={s.bonusLine}>
      <span className={live ? s.bonusTagLive : s.bonusTag}>{live ? RETURN_BONUS.status.live : RETURN_BONUS.status.proposed}</span>
      <span>
        {card.mine
          ? live
            ? RETURN_BONUS.yoursLive(card.bonus, card.perStep, months)
            : `${RETURN_BONUS.ifLive} ${RETURN_BONUS.yours(card.bonus, card.perStep, months)}`
          : RETURN_BONUS.line(rateText(bonus.rate), months)}{" "}
        {RETURN_BONUS.lineEnd}
      </span>
    </p>
  );
}

/**
 * Borrowing: a gauge from no loan to the 90% borrowing limit with the part
 * that earns shaded, and a mark for each of the wallet's loans on Ethereum
 * and Optimism (each position's own loan to value, as the positions table
 * shows it).
 *
 * Review 2026-11-13 (metalface, Keenan): the card is "Borrowing", its button
 * uses the Holding card's verbs ("Borrow more" with a loan, "Take a loan"
 * without) and opens the vault in the app, and the guide is a quiet link
 * beside it. The season's rule comes from the engine (essence.borrowBonus):
 * with a ceiling under the borrowing limit the card names the range, and
 * with none it says any loan from the floor up earns.
 */
function LoanCard({ lookup, config, band }) {
  const c = EARN.rows.safe_loan;
  const funded = fundedPositions(lookup.positions);
  const loans = funded
    .filter((p) => STANDING_CHAINS.includes(p.chainId) && hasDebt(p))
    .map((p) => ({ key: `${p.marketId}-${p.tokenId}`, name: String(p.marketId).split("-").pop(), ltv: ltvOf(p) }))
    .filter((l) => l.ltv !== null);
  // Persona walk: loans on Arbitrum earn nothing, and "No loan yet" read as if they were not there.
  const arbitrumLoans = funded.some((p) => Number(p.chainId) === 42161 && hasDebt(p));
  const at = (ltv) => `${Math.max(0, Math.min(100, (ltv / MAX_LTV) * 100))}%`;
  const capped = band.maxLtv < MAX_LTV;
  const note = capped
    ? (band.earning ? c.earning : c.idle)(pct(band.minLtv), pct(band.maxLtv))
    : (band.earning ? c.earningOpen : c.idleOpen)(pct(band.minLtv));
  const vault = appVaultUrl(config?.markets, { marketId: largestPositionMarket(lookup.positions), unit: funded[0]?.denomination ?? null });
  return (
    <DailyCard
      title={c.title}
      value={c.rate(fmtInt(band.daily))}
      on={band.earning}
      note={note}
      action={
        <div className={s.actionRow}>
          <Button kind="secondary" href={vault}>
            {loans.length ? c.more : c.first}
          </Button>
          <Button kind="quiet" to={BORROW_GUIDE}>
            {c.guide}
          </Button>
        </div>
      }
    >
      <div className={s.gauge}>
        <div className={s.gaugeTrack} aria-hidden="true">
          <span className={s.gaugeBand} style={{ left: at(band.minLtv), width: `calc(${at(band.maxLtv)} - ${at(band.minLtv)})` }} />
          {loans.map((l) => (
            <span key={l.key} className={s.gaugeMark} style={{ left: at(l.ltv) }} />
          ))}
        </div>
        <div className={s.gaugeScale} aria-hidden="true">
          <span style={{ left: at(band.minLtv) }}>{pct(band.minLtv)}</span>
          {capped ? <span style={{ left: at(band.maxLtv) }}>{pct(band.maxLtv)}</span> : null}
          <span className={s.gaugeEnd}>{c.limit(pct(MAX_LTV))}</span>
        </div>
        <p className={s.gaugeLegend}>
          {loans.length ? c.yours(loans.map((l) => `${l.name} ${pct(l.ltv)}`).join(", ")) : arbitrumLoans ? c.arbitrumOnly : c.noLoan}
        </p>
      </div>
    </DailyCard>
  );
}

/**
 * A source with a season cap: what it gave of the cap, one line, one action. `always` keeps the action once the cap is full.
 * `tag` stands where the button would be on a tile that has none, greyed, and says how the essence arrives.
 */
function CapTile({ source, copy, body, action, tag = null, wide = false, always = false }) {
  const got = source?.standing ?? 0;
  const cap = source?.cap ?? null;
  const full = cap !== null && got >= cap;
  const share = cap !== null ? got / cap : null;
  return (
    <li className={`${s.capTile} ${wide ? s.capTileWide : ""} ${got > 0 ? s.capTileOn : ""}`}>
      <div className={s.capHead}>
        <h4 className={s.earnTitle}>
          {got > 0 ? <span className={s.earnOn} aria-hidden="true" /> : null}
          {copy.title}
        </h4>
        <span className={s.capValue}>{cap !== null ? EARN.ofCap(fmtInt(got), fmtInt(cap)) : fmtInt(got)}</span>
      </div>
      {share !== null ? (
        <div className={s.capMeter} aria-hidden="true">
          <span style={{ width: `${Math.max(share > 0 ? 3 : 0, Math.min(100, share * 100))}%` }} />
        </div>
      ) : null}
      <div className={s.capBody}>{full ? EARN.full : body ?? copy.body}</div>
      {(!full || always) && action ? <div className={s.capAction}>{action}</div> : null}
      {!full && !action && tag ? (
        <div className={s.capAction}>
          <span className={s.capTag}>{tag}</span>
        </div>
      ) : null}
    </li>
  );
}

/** The proposed money side of a referral: what the person invited gets on top of the return bonus. */
function ReferralProposal({ bonus }) {
  const live = bonus.status === "live";
  const months = NUMBER_WORDS[bonus.vestMonths] ?? String(bonus.vestMonths ?? 6);
  return (
    <span className={s.earnProposal}>
      <span className={live ? s.bonusTagLive : s.bonusTag}>{live ? RETURN_BONUS.status.live : RETURN_BONUS.status.proposed}</span>
      <span>{EARN.rows.referral.proposal(rateText(NEWCOMER_RATE), rateText(bonus.rate), months)}</span>
    </span>
  );
}
