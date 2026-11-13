import React, { useEffect } from "react";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useLookup, useMember, useSeasonProgress, useSeasons } from "./lib/member";
import { fmtDate, fmtInt, fmtMonthYear, fmtNative, fmtPct, fmtSpoken, fromWad, listWords, yearOf } from "./lib/format";
import { CHANGED_URL, HERO, ONBOARDING, SEASON, V2_TRANSMUTER_URL, WELCOME } from "./copy";
import { badgeList, depositUnit, earningsOf, fundedPositions, joinedSeason, rarestBadges, seasonRungs, tierOf, v2TransmuterWords, vaultRateFor } from "./Home/model";
import { latestVersion } from "./Home/Onboarding";
import { JoinAction } from "./Home/actions";
import SeasonModule from "./Home/SeasonModule";
import Medal from "./Home/Medal";
import BadgePop from "./Home/BadgePop";
import { Notice, Orbit, Section } from "./parts";
import h from "./Home/home.module.css";
import s from "./welcome.module.css";

/**
 * /members/welcome, where the outreach links land (the DeBank messages and
 * the app's pop-up). Seventh round (Keenan, 2026-10-28): the first visit and
 * the member page are two jobs, and they are two pages. Eighth round (Keenan,
 * 2026-10-29): the page has to draw the wallet back, so it reads top to bottom
 * as one short story:
 *
 *   the hero     the wallet's record and its return to Alchemix (Keenan,
 *                2026-11-04: not a yield estimate), with the record as a seal
 *                of badges
 *   the season   the season module: the days left, the unlocks, and the join.
 *                Design notes 2026-11-03 (metalface, note 19): straight under
 *                the hero, since joining is the first thing to ask for
 *   its story    since you were here, on one line: first use, the move to
 *                v3, and the season open today
 *   what is new  what is new in v3, three cards with a picture each, and the
 *                wallet's yield estimate or collateral growth as a muted line
 *                under the card it belongs to
 *
 * A wallet with nothing to tell (no v1 or v2 history and no v3 position), one
 * already joined, or any wallet while no season is open goes straight to
 * /members, as does a visitor with no address. The join hands over to it.
 */
export default function Welcome() {
  const { address, ready } = useMember();
  const lookup = useLookup();
  const progress = useSeasonProgress();
  const seasons = useSeasons();
  const history = useHistory();
  const data = address && lookup.data ? lookup.data : null;
  const funded = fundedPositions(data?.positions);
  const settled = Boolean(data) && progress.status !== "loading";
  const away =
    (ready && !address) ||
    lookup.status === "error" ||
    (settled && (!progress.data?.season || joinedSeason(data) !== false || (!data.history && funded.length === 0)));

  useEffect(() => {
    if (away) history.replace("/members");
  }, [away]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-demo check 2026-10-28: a cold read can take 20 seconds or more while the indexer is slow, so
  // the wait shows the members area's own loading line instead of an empty page.
  if (!settled || away) {
    return (
      <section className={`${h.hero} ${s.wait}`} aria-busy="true">
        <div className={`${h.heroInner} ${s.single}`}>
          <div className={`${h.heroText} ${s.waitNote}`}>
            <span className={h.loadingOrbit} aria-hidden="true" />
            <span className={h.bodySmall}>{HERO.loading}</span>
          </div>
        </div>
      </section>
    );
  }

  const season = progress.data.season;
  const rungs = seasonRungs(seasons, progress);
  const hero = heroOf(data, funded.length > 0);
  const facts = factsOf(data, progress.data, funded.length > 0);
  const join = <JoinAction lookup={data} onChanged={lookup.refresh} label={ONBOARDING.steps.join.cta} />;

  return (
    <>
      <section className={h.hero}>
        <div className={`${h.heroInner} ${s.heroInner}`}>
          <div className={h.heroText}>
            <div className={h.eyebrow}>{data.history ? WELCOME.eyebrow : WELCOME.title}</div>
            <h1 className={`${h.headline} ${s.headline}`}>
              {hero.headline[0]}
              {hero.headline[1] ? <span className={s.accent}>{hero.headline[1]}</span> : null}
              {hero.headline[2] ?? ""}
            </h1>
            {hero.lead ? <p className={`${h.lead} ${s.lead}`}>{hero.lead}</p> : null}
            <TransmuterLine history={data.history} />
            <div className={s.join}>{join}</div>
          </div>
          <div className={`${h.heroArt} ${s.art}`}>
            <Seal data={data} />
          </div>
        </div>
      </section>

      <Section label={WELCOME.season.section} id="season">
        <SeasonModule season={season} variant="card" name lead={WELCOME.season.lead} rungs={rungs} action={join} />
      </Section>

      <Section label={WELCOME.story.section} id="story">
        <Story data={data} season={season} />
      </Section>

      <Section
        label={WELCOME.news.section}
        id="new"
        link={data.history ? { to: CHANGED_URL, label: ONBOARDING.changed(latestVersion(data.history)) } : undefined}
      >
        <News data={data} facts={facts} />
      </Section>
    </>
  );
}

/** The year the wallet first used Alchemix, as the seal's tenure medal shows it, or null. */
function firstYear(hist) {
  return yearOf(hist?.firstUsedOn) || null;
}

/**
 * The headline (Keenan, 2026-11-04): the wallet's record and the return to
 * Alchemix, not a yield estimate. A v3 holder hears that its position already
 * counts; a past user, that its record (dated by its first year) carries into
 * v3; anyone else, a plain welcome.
 */
function heroOf(data, holds) {
  if (holds) return { headline: [WELCOME.holder], lead: WELCOME.holderLead };
  if (data.history) return { headline: WELCOME.record(firstYear(data.history)), lead: WELCOME.recordLead };
  return { headline: [WELCOME.plain], lead: WELCOME.plainLead };
}

/**
 * The money facts the hero used to lead with, now one muted line under a "What
 * is new in v3" card: a holder whose collateral grew sees the growth (under the
 * redemptions card); otherwise a past user sees their largest deposit at the
 * dated vault rate (a projection, so it is dated and called variable, under the
 * vault card). Indexed like WELCOME.news.cards.
 */
function factsOf(data, progressData, holds) {
  const e = holds ? earningsOf(data, progressData?.vaultRates) : null;
  // Growth shows only when it is worth saying (a dollar, or 0.001 ETH): a dust position's "+$0.03" is a weaker
  // fact than the wallet's own largest deposit at today's rate.
  const grown = (e?.growth ?? []).filter(
    (g) => !String(g.amount).startsWith("-") && fromWad(g.amount) >= (g.denomination === "USD" ? 1 : 0.001),
  );
  if (e && grown.length > 0) {
    const date = e.sinceDate ? fmtDate(e.sinceDate, { short: true }) : "April";
    const amounts = listWords(grown.map((g) => fmtNative(g.amount, g.denomination)));
    return [null, null, WELCOME.news.grown(amounts, date, e.rate ? fmtPct(e.rate.value) : null, e.rate?.days)];
  }
  const deposit = data.history?.largestDeposit;
  const amount = Number(deposit?.amount ?? 0);
  const rate = deposit && amount > 0 ? vaultRateFor(progressData, deposit.unit) : null;
  if (rate && rate.value > 0) {
    const yearly = amount * rate.value;
    return [
      null,
      WELCOME.news.estimate(
        latestVersion(data.history),
        fmtSpoken(amount, deposit.unit),
        deposit.unit === "USD" ? `$${fmtInt(yearly)}` : fmtSpoken(yearly, deposit.unit),
        rate.vault,
        rate.days,
        fmtDate(rate.asOf, { short: true }),
        fmtPct(rate.value),
      ),
      null,
    ];
  }
  return [];
}

/** Money still in a v2 Transmuter: the plainest reason to come back, under the hero line. */
function TransmuterLine({ history }) {
  const words = v2TransmuterWords(history);
  if (!words) return null;
  return (
    <p className={s.claim}>
      <span>{ONBOARDING.steps.claimV2.body(words)}</span>
      <a href={V2_TRANSMUTER_URL} className={h.textLink}>
        {ONBOARDING.steps.claimV2.cta}
      </a>
    </p>
  );
}

/**
 * The record as a seal: the tenure medal (its year in the middle) inside the
 * landing page's rings, and the wallet's rarest badges set on the outer ring.
 * Each opens its card on hover. A wallet with no badges gets the orbit. The
 * badges sit symmetrically about the vertical axis, like the orbit (Keenan,
 * 2026-10-29: the hero graphic has to read as symmetrical).
 *
 * Design notes 2026-11-03 (metalface, notes 10 and 12): one quiet ring for the
 * badges to sit on, no tick ring and no inner ring, and no status line under
 * it. The medals' hover cards carry what the line said.
 */
const SAT_ANGLES = { 1: [-90], 2: [-150, -30], 3: [-90, 30, 150] };

function Seal({ data }) {
  const hist = data.history;
  const year = firstYear(hist);
  const tenure = hist ? badgeList(data).find((b) => b.key === "tenure") : null;
  const others = rarestBadges(data, 3).filter((b) => b.key !== "tenure");
  const core = tenure ?? others[0] ?? null;
  const sats = (tenure ? others : others.slice(1)).slice(0, 3);
  if (!core) return <Orbit className={h.orbit} />;
  const angles = SAT_ANGLES[sats.length] ?? [];
  return (
    <figure className={s.seal}>
      <div className={s.sealArt}>
        <span className={`${s.ring} ${s.ringTrack}`} aria-hidden="true" />
        <span className={s.glow} aria-hidden="true" />
        <div className={s.core}>
          <BadgePop badge={core} lookup={data}>
            <Link to={`/members/badges#badge-${core.id ?? core.key}`} className={s.coreLink} aria-label={core.title}>
              <Medal badgeKey={core.key} state="earned" year={core.key === "tenure" ? year : null} tier={tierOf(core)} className={s.coreMedal} />
            </Link>
          </BadgePop>
        </div>
        {sats.map((b, i) => (
          <div key={b.id ?? b.key} className={s.sat} style={{ "--a": `${angles[i]}deg`, "--i": i }}>
            <BadgePop badge={b} lookup={data}>
              <Link to={`/members/badges#badge-${b.id ?? b.key}`} className={s.satLink} aria-label={b.title}>
                <Medal badgeKey={b.key} state="earned" tier={tierOf(b)} className={s.satMedal} />
              </Link>
            </BadgePop>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** The story: the wallet's time with Alchemix on one line, from its first use to the season open today. */
function Story({ data, season }) {
  const hist = data.history;
  const nodes = [];
  if (hist?.firstUsedOn) {
    const deposit = hist.largestDeposit ? fmtSpoken(Number(hist.largestDeposit.amount), hist.largestDeposit.unit) : null;
    nodes.push({
      key: "first",
      date: fmtMonthYear(hist.firstUsedOn),
      title: WELCOME.story.first.title,
      body: WELCOME.story.first.body(listWords(hist.versions ?? []), deposit),
    });
  }
  if (hist) {
    nodes.push({
      key: "v3",
      date: WELCOME.story.v3.date,
      title: WELCOME.story.v3.title,
      body: hist.migrated ? WELCOME.story.v3.moved : WELCOME.story.v3.closed,
    });
  } else {
    const firstV3 = (data.achievements ?? []).find((a) => a.key === "first_v3_deposit" && a.earned)?.earnedAt ?? null;
    if (firstV3) nodes.push({ key: "v3", date: fmtMonthYear(firstV3), title: WELCOME.story.firstV3.title, body: null });
  }
  nodes.push({
    key: "today",
    date: WELCOME.story.today.date,
    title: season.name,
    body: WELCOME.story.today.body(fmtDate(season.endsAt, { short: true }), season.daysLeft > 0 ? SEASON.daysLeft(season.daysLeft) : SEASON.lastDay),
    now: true,
  });
  return (
    <ol className={s.story} style={{ "--n": nodes.length }}>
      {nodes.map((n, i) => (
        <li key={n.key} className={`${s.event} ${n.now ? s.eventNow : ""}`} style={{ "--i": i }}>
          <span className={s.dot} aria-hidden="true" />
          <span className={s.eventDate}>{n.date}</span>
          <span className={s.eventTitle}>{n.title}</span>
          {n.body ? <span className={s.eventBody}>{n.body}</span> : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * What is new in v3, as the visitor page's cards, each with its picture. The
 * migration guide link sits at the section head's top right (design notes
 * 2026-11-03, note 18), not under the cards.
 */
function News({ data, facts }) {
  const pictures = [<LimitPicture key="limit" />, <VaultPicture key="vault" unit={depositUnit(data) ?? fundedPositions(data.positions)[0]?.denomination} />, <RedeemPicture key="redeem" />];
  return (
    <>
      <ol className={h.howGrid}>
        {WELCOME.news.cards.map((c, i) => (
          <li key={c.title} className={h.howCard} style={{ "--i": i }}>
            <div className={h.howPicture}>{pictures[i]}</div>
            <h3 className={h.stepTitle}>{c.title}</h3>
            <p className={h.howBody}>{c.body}</p>
            {facts[i] ? <p className={s.fact}>{facts[i]}</p> : null}
          </li>
        ))}
      </ol>
      {data.group?.flags?.arbitrum ? (
        <div className={s.newsNote}>
          <Notice tone="info">{WELCOME.news.arbitrum}</Notice>
        </div>
      ) : null}
    </>
  );
}

/** The borrowing limit before v3 and in it, as two bars. */
function LimitPicture() {
  const rows = [
    [WELCOME.news.limitBefore, 50, false],
    [WELCOME.news.limitNow, 90, true],
  ];
  return (
    <div className={s.limit} aria-hidden="true">
      {rows.map(([label, pct, now]) => (
        <div key={label} className={`${s.limitRow} ${now ? s.limitRowNow : ""}`}>
          <span className={s.limitLabel}>{label}</span>
          <span className={s.limitBar}>
            <span style={{ width: `${pct}%` }} />
          </span>
          <span className={s.limitPct}>{pct}%</span>
        </div>
      ))}
    </div>
  );
}

/**
 * One token in the middle, the DAO's strategies around it. The token is the
 * official Mix-Yield Token mark from static/img/BrandAssets (design notes
 * 2026-11-03, note 16): mixUSDC for a wallet whose money is in dollars,
 * mixWETH otherwise.
 */
const MYT_MARKS = { ETH: "/img/BrandAssets/Svg/mixWETH_01.svg", USD: "/img/BrandAssets/Svg/mixUSDC_01.svg" };

function VaultPicture({ unit }) {
  const mark = useBaseUrl(MYT_MARKS[unit] ?? MYT_MARKS.ETH);
  const pts = [-90, 30, 150].map((a) => [80 + Math.cos((a * Math.PI) / 180) * 44, 60 + Math.sin((a * Math.PI) / 180) * 44]);
  return (
    <svg className={s.vault} viewBox="0 0 160 120" aria-hidden="true">
      <g className={s.vaultSpin}>
        <circle className={s.vaultOrbit} cx="80" cy="60" r="44" />
        {pts.map(([x, y]) => (
          <line key={`l${x}`} x1="80" y1="60" x2={x} y2={y} stroke="rgba(143,178,222,0.3)" strokeWidth="0.75" />
        ))}
        {pts.map(([x, y], i) => (
          <circle key={`n${x}`} className={s.vaultNode} style={{ "--i": i }} cx={x} cy={y} r="5" />
        ))}
      </g>
      <image href={mark} x="58" y="38" width="44" height="44" className={s.vaultMark} />
    </svg>
  );
}

/** Collateral holding as yield tops it up, debt stepping down with each redemption. */
function RedeemPicture() {
  return (
    <svg className={s.redeem} viewBox="0 0 180 110" aria-hidden="true">
      <line x1="10" y1="96" x2="170" y2="96" stroke="rgba(255,255,255,0.1)" />
      <path className={s.redeemCollateral} d="M10 30 C 50 34, 70 26, 100 30 S 150 26, 170 24" />
      <path className={s.redeemDebt} d="M10 58 H40 V64 H70 V71 H100 V77 H130 V84 H170" />
      <text x="170" y="16" textAnchor="end" className={s.redeemLabel}>
        {WELCOME.news.collateral}
      </text>
      <text x="170" y="76" textAnchor="end" className={`${s.redeemLabel} ${s.redeemLabelDebt}`}>
        {WELCOME.news.debt}
      </text>
    </svg>
  );
}
