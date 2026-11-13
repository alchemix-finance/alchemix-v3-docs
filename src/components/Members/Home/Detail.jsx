import React, { useEffect, useRef, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { historyCardUrl, membersBase, transmuterCardUrl } from "../lib/api";
import {
  chainName,
  fmtDate,
  fmtIn,
  fmtInt,
  fmtNative,
  fmtNativeSigned,
  fmtPct,
  fmtToken,
  fmtUsd,
  fmtUsdShort,
  fromWad,
  isZeroWad,
  listWords,
  marketLabel,
  marketParts,
  fmtMonthYear,
} from "../lib/format";
import { Button, Caption, Notice, Section } from "../parts";
import { DETAIL, HISTORY, LEGACY_DOCS_URL, MEMBERS_URL, POSITIONS, REFERRAL, SHARE } from "../copy";
import { growthOf } from "./value";
import { REFERRAL_DEFAULTS, appVaultUrl, fundedPositions, ltvOf, positionsWhere, referralStatusLine, sharePct, transmutedWords } from "./model";
import { useMyStanding } from "./standing";
import { StandingAction } from "./actions";
import s from "./home.module.css";

/**
 * 05 to 07 - DETAIL (plan items 18, 19, 21): history in one strip, each v3
 * position as one row with the rest on expand, and the share cards. Debt is
 * in the market's alAsset and falls only through redemptions or a manual
 * repay; the page shows the number and never says more.
 */

export function HistoryStrip({ lookup }) {
  const h = lookup.history;
  return (
    <Section label={DETAIL.history} id="history">
      {!h ? (
        <p className={s.bodySmall}>{HISTORY.none}</p>
      ) : (
        <HistoryFacts h={h} />
      )}
    </Section>
  );
}

/**
 * Design notes 2026-11-03 (note 8): the boxed strip of figures, one component
 * for Your season's summary (./Unlocks.jsx) and Your record's history facts.
 * `items` is a list of [label, value, sub]; the sub line is optional.
 */
export function StatStrip({ items, className }) {
  return (
    <dl className={`${s.seasonStats} ${className ?? ""}`} style={{ "--stat-count": items.length }}>
      {items.map(([label, value, sub]) => (
        <div key={label} className={s.seasonStat}>
          <dt>{label}</dt>
          <dd>
            {value}
            {sub ? <span className={s.seasonStatSub}>{sub}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function HistoryFacts({ h }) {
  const deposit = h.largestDeposit;
  const depositText = deposit ? fmtIn(deposit.amount, deposit.unit) : fmtUsd(h.largestDepositUsd);
  const depositNote =
    deposit && deposit.unit !== "USD" && h.largestDepositUsd > 0 ? HISTORY.aboutUsd(fmtUsdShort(h.largestDepositUsd)) : null;
  const tEth = Number(h.v2Transmuter?.eth ?? 0);
  const tUsd = Number(h.v2Transmuter?.usd ?? 0);
  const transmuter = listWords([tEth > 0 ? fmtToken(tEth, "ETH") : null, tUsd > 0 ? fmtUsd(tUsd) : null]);
  const facts = [
    [HISTORY.firstUsed, h.firstUsedOn ? fmtDate(h.firstUsedOn) : HISTORY.unknownDate],
    [HISTORY.versions, h.versions.join(" and ")],
    [HISTORY.chains, <ChainIcons key="chains" ids={h.chainIds} />],
    [HISTORY.largestDeposit, depositText, depositNote],
    [HISTORY.migrated, h.migrated ? HISTORY.yes : HISTORY.no],
  ];
  return (
    <>
      <StatStrip items={facts} />
      {transmuter ? (
        <div className={s.sectionNote}>
          <Notice
            tone="info"
            action={
              <a className={s.textLink} href={LEGACY_DOCS_URL} target="_blank" rel="noopener noreferrer">
                {HISTORY.transmuterLink}
              </a>
            }
          >
            {HISTORY.transmuter(transmuter)}
          </Notice>
        </div>
      ) : null}
    </>
  );
}

/** The chains with a logo in static/img/members/chains (the app's own files). Any other chain shows its name. */
const CHAIN_ICONS = { 1: "ethereum", 10: "optimism", 42161: "arbitrum" };

/**
 * Review 2026-11-13 (metalface): the chains as icons, not words. Each icon
 * carries the chain's name for screen readers and on hover.
 */
function ChainIcons({ ids }) {
  const base = useBaseUrl("/img/members/chains/");
  return (
    <span className={s.chainIcons}>
      {ids.map((id) =>
        CHAIN_ICONS[id] ? (
          <img key={id} className={s.chainIcon} src={`${base}${CHAIN_ICONS[id]}.svg`} alt={chainName(id)} title={chainName(id)} width={28} height={28} />
        ) : (
          <span key={id} className={s.chainText}>
            {chainName(id)}
          </span>
        )
      )}
    </span>
  );
}

/**
 * Feedback 2026-10-28 (Keenan): each row links to its vault in the app
 * ("Manage"), beside the details toggle. `markets` is the registry from the
 * members config, for the deep link.
 */
export function Positions({ lookup, markets }) {
  return (
    <Section label={DETAIL.positions} id="positions">
      <PositionsBody lookup={lookup} markets={markets} />
    </Section>
  );
}

/** The positions table and its notes, without the section (feedback 2026-10-28: a tab of Your season). */
export function PositionsBody({ lookup, markets }) {
  const positions = lookup.positions ?? [];
  const stakes = lookup.transmuterStakes ?? [];
  const dormant = lookup.group?.group === "dormant";
  const unreadable = (lookup.errors ?? []).map((e) => marketLabel(e.marketId));
  // Only markets with money in them: an exited, empty position has no history worth a note.
  const fundedMarkets = new Set(fundedPositions(positions).map((p) => p.marketId));
  const historySlow = (lookup.historyErrors ?? []).filter((e) => fundedMarkets.has(e.marketId)).map((e) => marketLabel(e.marketId));
  const rates = lookup.rates ?? [];
  const [open, setOpen] = useState(() => new Set());

  function toggle(key) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Page review 2026-10-24 (batch item 4): exited positions fold into one line under the table.
  const funded = fundedPositions(positions);
  const closed = positions.filter((p) => !funded.includes(p));

  return (
    <>
      {positions.length === 0 ? (
        <p className={s.bodySmall}>{POSITIONS.none}</p>
      ) : funded.length === 0 ? (
        <p className={s.bodySmall}>{POSITIONS.closed(closed.length, positionsWhere(closed))}</p>
      ) : (
        <div className={s.posTable} role="table" aria-label={DETAIL.positions}>
          <div className={`${s.posRow} ${s.posHead}`} role="row">
            <span role="columnheader" />
            <span role="columnheader">{POSITIONS.collateral}</span>
            <span role="columnheader">{POSITIONS.debt}</span>
            <span role="columnheader">{POSITIONS.ltv}</span>
            {/* Funnel review 2026-10-23: growth in the row; last touched moves into the details. */}
            <span role="columnheader">{POSITIONS.earned}</span>
            <span role="columnheader" />
          </div>
          {funded.map((p) => {
            const key = `${p.marketId}#${p.tokenId}`;
            return (
              <PositionRow
                key={key}
                id={`pos-${p.marketId}-${p.tokenId}`}
                p={p}
                dormant={dormant}
                rate={rates.find((r) => r.marketId === p.marketId) ?? null}
                open={open.has(key)}
                onToggle={() => toggle(key)}
                manageUrl={appVaultUrl(markets, { marketId: p.marketId })}
              />
            );
          })}
        </div>
      )}
      {funded.length > 0 && closed.length > 0 ? (
        <p className={`${s.bodySmall} ${s.posClosed}`}>{POSITIONS.closed(closed.length, positionsWhere(closed))}</p>
      ) : null}
      {stakes.length > 0 ? <Stakes stakes={stakes} /> : null}
      {unreadable.length > 0 ? (
        <div className={s.sectionNote}>
          <Notice tone="error">{POSITIONS.unreadable(listWords(unreadable))}</Notice>
        </div>
      ) : null}
      {/* Funnel review 2026-10-23: the positions loaded and only their history did not. Quiet, never red. */}
      {historySlow.length > 0 ? (
        <div className={s.sectionNote}>
          <Notice tone="info">{POSITIONS.historyUnavailable(listWords(historySlow))}</Notice>
        </div>
      ) : null}
    </>
  );
}

/** The wallet's open Transmuter stakes (funnel review 2026-10-23), under the positions. */
function Stakes({ stakes }) {
  return (
    <div className={s.stakes}>
      <Caption>{POSITIONS.stakes}</Caption>
      <ul className={s.stakeList}>
        {stakes.map((st) => {
          const { asset, chain } = marketParts(st.marketId);
          return (
            <li key={`${st.marketId}#${st.tokenId}`}>
              <span className={s.marketDot} aria-hidden="true" />
              <span>
                <span className={s.posAsset}>{asset}</span>
                <span className={s.posMeta}>
                  {chain} {POSITIONS.position(st.tokenId)}
                </span>
              </span>
              <span className={s.stakeAmount}>{fmtToken(fromWad(st.amount), asset)}</span>
            </li>
          );
        })}
      </ul>
      <p className={s.posFine}>{POSITIONS.stakeNote}</p>
    </div>
  );
}

function PositionRow({ id, p, dormant, rate, open, onToggle, manageUrl }) {
  const { asset, chain } = marketParts(p.marketId);
  const collateral = fromWad(p.collateralValue);
  const earmarked = fromWad(p.earmarked);
  const ltv = ltvOf(p);
  const growth = growthOf(p.value);
  const grew = growth ? !growth.amount.startsWith("-") : false;
  // Always: on a phone the row hides debt and growth until it is opened.
  const canExpand = true;

  return (
    <div className={`${s.posGroup} ${open ? s.posOpen : ""}`} role="rowgroup">
      <div className={s.posRow} role="row">
        <span role="cell" className={s.posMarket}>
          <span className={s.marketDot} aria-hidden="true" />
          <span>
            {/* Review 2026-11-13 (metalface read "alETH" as the product): the row is named for its vault, as the docs name it. The debt cell carries the alAsset. */}
            <span className={s.posAsset}>{POSITIONS.vault(p.denomination === "USD" ? "USDC" : "ETH")}</span>
            <span className={s.posMeta}>
              {chain} {POSITIONS.position(p.tokenId)}
            </span>
          </span>
        </span>
        <span role="cell" className={s.posCell} data-label={POSITIONS.collateral}>
          {p.denomination === "USD" ? fmtUsd(collateral) : fmtToken(collateral, "ETH")}
        </span>
        <span role="cell" className={`${s.posCell} ${s.posHideSm}`} data-label={POSITIONS.debt}>
          {isZeroWad(p.debt) ? POSITIONS.noDebt : fmtToken(fromWad(p.debt), asset)}
          {earmarked > 0 ? <span className={s.posNote}>{POSITIONS.earmarked(fmtToken(earmarked, asset))}</span> : null}
        </span>
        <span role="cell" className={s.posCell} data-label={POSITIONS.ltv}>
          {ltv === null ? "" : <LtvMeter ltv={ltv} />}
        </span>
        <span role="cell" className={`${s.posCell} ${s.posHideSm}`} data-label={POSITIONS.earned}>
          {growth ? (
            <>
              <span className={grew ? s.valueUp : ""}>{fmtNativeSigned(growth.amount, p.denomination)}</span>
              <span className={s.posNote}>{`${grew ? "+" : ""}${fmtPct(growth.fraction)} ${POSITIONS.earnedSince[p.value.sinceKind] ?? ""}`}</span>
            </>
          ) : (
            ""
          )}
        </span>
        <span role="cell" className={s.posToggleCell}>
          <a className={s.posManage} href={manageUrl} target="_blank" rel="noopener noreferrer" title={POSITIONS.manageTitle(POSITIONS.vault(p.denomination === "USD" ? "USDC" : "ETH"), chain)}>
            {POSITIONS.manage}
            <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
              <path d="M4 2h6v6M10 2 3 9" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </a>
          {canExpand ? (
            <button type="button" className={s.posToggle} aria-expanded={open} aria-controls={id} onClick={onToggle}>
              {open ? POSITIONS.hideDetails : POSITIONS.details}
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d={open ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"} fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
          ) : null}
        </span>
      </div>
      {open ? (
        <div className={s.posDetail} id={id}>
          {p.value ? <ValueThenNow value={p.value} denomination={p.denomination} /> : null}
          {rate || p.lastTouched ? <RateCells rate={rate} lastTouched={p.lastTouched} /> : null}
          <p className={s.posFine}>
            {POSITIONS.value.note}
            {p.value?.changedSince ? ` ${POSITIONS.value.changedSince}` : ""}
            {rate ? ` ${POSITIONS.rate.note(fmtDate(rate.asOf))}` : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Loan to value as a number and a short bar against the 90% borrowing cap. */
function LtvMeter({ ltv }) {
  const pct = Math.round(ltv * 1000) / 10;
  return (
    <span className={s.ltv}>
      <span className={s.ltvValue}>{`${pct.toFixed(pct < 10 ? 1 : 0)}%`}</span>
      <span className={s.ltvTrack} aria-hidden="true">
        <span style={{ width: `${Math.min(100, (ltv / 0.9) * 100)}%` }} />
      </span>
    </span>
  );
}

function ValueThenNow({ value, denomination }) {
  const growth = growthOf(value);
  if (!growth) return null;
  const up = !growth.amount.startsWith("-");
  return (
    <div className={s.detailCells}>
      <div>
        <Caption>
          {value.sinceKind === "handover"
            ? POSITIONS.value.atHandover
            : value.sinceKind === "owner_since"
              ? POSITIONS.value.atOwnerSince
              : POSITIONS.value.atFirstDeposit}
        </Caption>
        <div className={s.detailValue}>{fmtNative(value.valueThen, denomination)}</div>
        <div className={s.posNote}>{fmtDate(value.since, { short: true })}</div>
      </div>
      <div>
        <Caption>{POSITIONS.value.today}</Caption>
        <div className={s.detailValue}>{fmtNative(value.valueNow, denomination)}</div>
      </div>
      <div>
        <Caption>{POSITIONS.value.change}</Caption>
        <div className={`${s.detailValue} ${up ? s.valueUp : ""}`}>{fmtNativeSigned(growth.amount, denomination)}</div>
        <div className={s.posNote}>{`${up ? "+" : ""}${fmtPct(growth.fraction)}`}</div>
      </div>
    </div>
  );
}

/** The vault's recent rates, and (funnel review 2026-10-23) when the holder last touched the position, when known. */
function RateCells({ rate, lastTouched }) {
  const pct = (x) => (typeof x === "number" ? POSITIONS.rate.perYear(fmtPct(x)) : POSITIONS.rate.notYet);
  return (
    <div className={s.detailCells}>
      {rate ? (
        <>
          <div>
            <Caption>{POSITIONS.rate.days7}</Caption>
            <div className={s.detailValue}>{pct(rate.trailing7d)}</div>
          </div>
          <div>
            <Caption>{POSITIONS.rate.days30}</Caption>
            <div className={s.detailValue}>{pct(rate.trailing30d)}</div>
          </div>
        </>
      ) : null}
      {lastTouched ? (
        <div>
          <Caption>{POSITIONS.lastTouched}</Caption>
          <div className={s.detailValue}>{fmtDate(lastTouched, { short: true })}</div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The share cards: the history card for past users (ticket 21) and the
 * Transmuter card when the wallet has claims that transmuted something
 * (members area v2). A card the engine cannot draw hides itself.
 *
 * V3 backlog ticket 08: beside them, for a wallet that joined the season,
 * its referral link and how its referrals stand (ReferralCard). The section
 * then shows even with no card to share.
 *
 * Feedback 2026-10-28 (Keenan): for a member with essence the section is
 * "Your record": the history facts above the cards. `record` turns this on.
 * Fourth round (Keenan: this is the place for the referral context and its
 * call to action): the referral card sits beside the share cards here, and
 * Earn more's invite tile links to it. "Post on X" still carries no
 * referral link, since nothing may reward a post (X's rules).
 */
export function ShareCards({ lookup, record = false }) {
  const { siteConfig } = useDocusaurusContext();
  const base = membersBase(siteConfig);
  const h = lookup.history;
  const claims = lookup.transmuterClaims;
  const [gone, setGone] = useState({});

  const cards = [];
  if (h && !gone.history) {
    const since = h.firstUsedOn ? fmtMonthYear(h.firstUsedOn) : [...(h.versions ?? [])].sort()[0] ?? "";
    cards.push({
      key: "history",
      src: historyCardUrl(base, lookup.address),
      copy: SHARE.history,
      alt: SHARE.history.alt(since),
      post: SHARE.history.postText(since),
    });
  }
  if ((claims?.count ?? 0) > 0 && !gone.transmuter) {
    const amounts = transmutedWords(claims);
    cards.push({
      key: "transmuter",
      src: transmuterCardUrl(base, lookup.address),
      copy: SHARE.transmuter,
      alt: SHARE.transmuter.alt(amounts),
      post: SHARE.transmuter.postText(amounts),
    });
  }
  // Design notes 2026-11-03 (note 9): Your record drops the invite card, which repeated Essence > Ways to earn.
  // The link and its status now live in that card. Elsewhere (onboarding) the section still carries it.
  const referral = !record && showsReferral(lookup);
  if (cards.length === 0 && !referral && !(record && h)) return null;
  const items = cards.length + (referral ? 1 : 0);

  // Note 8: the facts always sit on top as the boxed strip, the cards under them.
  return (
    <Section label={record ? DETAIL.record : referral ? DETAIL.shareInvite : DETAIL.share} id="share">
      {record && h ? (
        <div className={s.recordFacts}>
          <HistoryFacts h={h} />
        </div>
      ) : null}
      {items > 0 ? (
        <div className={`${s.shareGrid} ${items === 1 ? s.shareOne : ""}`}>
          {cards.map((c) => (
            <ShareCard key={c.key} card={c} onGone={() => setGone((g) => ({ ...g, [c.key]: true }))} />
          ))}
          {referral ? <ReferralCard lookup={lookup} /> : null}
        </div>
      ) : null}
    </Section>
  );
}

/** Whether the share section carries the referral link: a wallet that joined the season can refer. */
export function showsReferral(lookup) {
  return Boolean(lookup?.season?.joined);
}

/**
 * The referral link (v3 backlog ticket 08). The code and the counts are the
 * owner's, so they come from the signed my-standing claim (shared with the
 * hero); before that, the rule in a line and a button to sign. The invitee's
 * line comes from the public lookup (season.referral), and its day count from
 * the signed answer. No invitee is ever named.
 *
 * `bare` (feedback 2026-10-28): inside Earn more's invite row, which carries
 * the title and the rule, so only the link, its status and the invitee line.
 * `steps` (fourth round, in Your record): the rule as three short steps.
 */
export function ReferralCard({ lookup, bare = false, steps = false, hint = !bare }) {
  const { result } = useMyStanding();
  const mine = result?.referral ?? null;
  const rule = mine?.rule ?? REFERRAL_DEFAULTS;
  const invitedBy = lookup.season?.referral ?? null;
  const own = mine?.invitedBy ?? null;
  const status = referralStatusLine(mine, REFERRAL);
  const link = mine?.code ? `${MEMBERS_URL}?ref=${mine.code}` : null;

  return (
    <div className={bare ? s.referralBare : s.referralCard}>
      {bare ? null : (
        <>
          <h3 className={s.referralTitle}>{steps ? REFERRAL.invite : REFERRAL.title}</h3>
          {steps ? (
            <ol className={s.referralSteps}>
              {REFERRAL.steps(`$${fmtInt(rule.minUsd)}`, fmtInt(rule.holdDays), sharePct(rule.share)).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          ) : (
            <p className={s.referralBody}>{REFERRAL.body(`$${fmtInt(rule.minUsd)}`, fmtInt(rule.holdDays), sharePct(rule.share))}</p>
          )}
        </>
      )}
      {link ? (
        <>
          <CopyLink link={link} />
          <p className={s.referralStatus}>{status ?? REFERRAL.none}</p>
          {mine.credited > 0 ? (
            <p className={s.referralFine}>{REFERRAL.credited(fmtInt(mine.credited), mine.cap ? fmtInt(mine.cap) : null)}</p>
          ) : null}
        </>
      ) : (
        <StandingAction label={REFERRAL.show} hint={hint} />
      )}
      {invitedBy ? (
        <p className={s.referralInvitee}>
          {REFERRAL.invitee(sharePct(invitedBy.share))}
          {own && own.countedDays > 0 && own.countedDays < invitedBy.holdDays ? ` ${REFERRAL.inviteeDay(fmtInt(own.countedDays), fmtInt(invitedBy.holdDays))}` : ""}
        </p>
      ) : null}
    </div>
  );
}

/** The link in a read-only field, and a button that copies it. */
function CopyLink({ link }) {
  const input = useRef(null);
  const [state, setState] = useState("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setState("copied");
      setTimeout(() => setState("idle"), 2_000);
    } catch {
      input.current?.select();
      setState("failed");
    }
  }

  return (
    <>
      <div className={s.referralLinkRow}>
        <label className={s.srOnly} htmlFor="members-referral-link">
          {REFERRAL.label}
        </label>
        <input
          id="members-referral-link"
          ref={input}
          className={s.referralLink}
          value={link}
          readOnly
          onFocus={(e) => e.target.select()}
          spellCheck="false"
        />
        <Button kind="secondary" onClick={copy}>
          {state === "copied" ? REFERRAL.copied : REFERRAL.copy}
        </Button>
      </div>
      {state === "failed" ? (
        <div className={s.actionNote}>
          <Notice tone="info">{REFERRAL.copyFailed}</Notice>
        </div>
      ) : null}
    </>
  );
}

/**
 * A card image in its frame, with a placeholder while the engine draws it
 * (walkthrough 2026-10-23: a cold card took about ten seconds and showed an
 * empty box). The frame keeps the card's shape, so nothing jumps on load.
 * `onGone` runs when the engine cannot draw it.
 */
export function CardImage({ src, alt, onGone, eager = false }) {
  const img = useRef(null);
  const [loaded, setLoaded] = useState(false);
  // A cached image can finish before hydration, so its load event is never seen.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true);
  }, [src]);
  return (
    <div className={`${s.shareFrame} ${loaded ? "" : s.shareLoading}`} aria-busy={!loaded || undefined}>
      {loaded ? null : <span className={s.shareLoadingText}>{SHARE.loading}</span>}
      <img
        ref={img}
        className={`${s.shareImage} ${loaded ? s.shareImageIn : ""}`}
        src={src}
        width={1200}
        height={630}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={onGone}
      />
    </div>
  );
}

function ShareCard({ card, onGone }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const intent = `https://x.com/intent/post?${new URLSearchParams({ text: card.post, url: MEMBERS_URL })}`;

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(card.src);
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = card.copy.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.shareCard}>
      <CardImage src={card.src} alt={card.alt} onGone={onGone} />
      {/* Feedback 2026-10-28: the card is a padded panel like the referral card, the title and buttons on one line. */}
      <div className={s.shareFoot}>
        <h3 className={s.shareTitle}>{card.copy.title}</h3>
        <div className={s.actionRow}>
          <Button kind="secondary" onClick={download} disabled={busy}>
            {busy ? SHARE.downloading : SHARE.download}
          </Button>
          {/* Review 2026-11-13 (metalface): a real button, like Download beside it. */}
          <Button kind="secondary" href={intent}>
            {SHARE.post}
          </Button>
        </div>
      </div>
      {failed ? (
        <div className={s.actionNote}>
          <Notice tone="error">{SHARE.failed}</Notice>
        </div>
      ) : null}
    </div>
  );
}
