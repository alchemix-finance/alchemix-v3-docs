import React, { useEffect } from "react";
import Link from "@docusaurus/Link";
import { isEngineDown } from "./lib/api";
import { errorText, useLookup, useMember, useMembersConfig, useSeasonProgress, useSeasons } from "./lib/member";
import { yearOf } from "./lib/format";
import { EngineDown, Notice, Section } from "./parts";
import { BADGES_PAGE, HERO } from "./copy";
import { useHistory } from "@docusaurus/router";
import Achievements from "./Home/Achievements";
import Medal from "./Home/Medal";
import { useDiscordReturn } from "./Home/actions";
import { badgeList, readyToClaim, seasonRungs } from "./Home/model";
import { StandingProvider, usePublicEssence } from "./Home/standing";
import { ConnectButton } from "./Shell/Connect";
import p from "./pages.module.css";
import s from "./Home/home.module.css";

/**
 * /members/badges (feedback 2026-10-28, third round, Keenan: every badge on
 * the home page was too much, and the leaderboard sat oddly in the nav). The
 * nav's second page. How many badges the wallet holds, then "Ready to claim"
 * (each card opens the badge's panel, where the claim lives), then every
 * badge in its group with the large panel, as the home page had them. The
 * home page keeps a strip of earned badges in Your season.
 *
 * A Discord return for a joined member lands here (Home/index.jsx forwards
 * ?discord=), and a link to #badge-<key> opens that badge's panel.
 *
 * Fourth round (Keenan: switch between badges and their claims, and the
 * essence store and its claims): two tabs under the headline. Badges holds
 * the tenure claim and every badge; Store (./Home/Store.jsx) holds what each
 * rung unlocks, with the Discord, Telegram and merch claims on the items.
 * "#badges" and "#store" pick the tab; "#badge-<key>" and "#ready" open
 * Badges.
 *
 * Design notes 2026-11-03 (metalface 25, 26, 30): the tabs are gone. The
 * store is its own page, /members/store, and an old "#store" link forwards
 * there. The hero's count is a featured figure with a ring. Claims that
 * belong to a store item show as one link to the store under Ready to claim.
 */
export default function Badges() {
  return (
    <StandingProvider>
      <BadgesPage />
    </StandingProvider>
  );
}

/** Claims that belong to a store item rather than a badge. */
const STORE_CLAIMS = ["vip", "inner_circle", "discord_role"];

function BadgesPage() {
  const { address, ready } = useMember();
  const lookup = useLookup();
  const seasons = useSeasons();
  const progress = useSeasonProgress();
  const config = useMembersConfig();
  const discordReturn = useDiscordReturn();
  const rungs = seasonRungs(seasons, progress);
  const data = address && lookup.data ? lookup.data : null;
  usePublicEssence(data);
  const badges = data ? badgeList(data) : [];
  const earned = badges.filter((b) => b.earned).length;
  const waiting = data ? readyToClaim(data, config) : [];
  const claims = waiting.filter((k) => !STORE_CLAIMS.includes(k));
  const storeClaims = waiting.filter((k) => STORE_CLAIMS.includes(k));
  const history = useHistory();
  // The store tab became /members/store: an old "#store" link (or "badges#store") forwards there.
  useEffect(() => {
    if (window.location.hash === "#store") history.replace(`/members/store${window.location.search}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <section className={p.pageHead}>
        <div className={`${p.pageHeadInner} ${data ? p.badgesHead : ""}`}>
          <div>
            <div className={p.eyebrow}>{HERO.eyebrow}</div>
            <h1 className={p.headline}>{BADGES_PAGE.headline}</h1>
            <p className={p.lead}>{BADGES_PAGE.lead}</p>
            <div className={p.seasonMeta}>
              <Link to="/members/leaderboard" className={s.textLink}>
                {BADGES_PAGE.board}
              </Link>
            </div>
          </div>
          {data ? <EarnedFigure earned={earned} total={badges.length} /> : null}
        </div>
      </section>

      {!ready ? null : !address ? (
        <Section label={BADGES_PAGE.title} id="achievements">
          <p className={s.bodySmall}>{BADGES_PAGE.empty}</p>
          <div className={s.actionRow}>
            <ConnectButton />
          </div>
        </Section>
      ) : lookup.status === "error" ? (
        <Section label={BADGES_PAGE.title} id="achievements">
          {isEngineDown(lookup.error) ? <EngineDown onRetry={lookup.refresh} /> : <Notice tone="error">{errorText(lookup.error)}</Notice>}
        </Section>
      ) : !data ? (
        <Section label={BADGES_PAGE.title} id="achievements">
          <div className={`${s.strip} ${s.stripLoading}`} aria-busy="true">
            <span className={s.loadingOrbit} aria-hidden="true" />
            <span className={s.bodySmall}>{HERO.loading}</span>
          </div>
        </Section>
      ) : (
        <>
          {claims.length || storeClaims.length ? (
            <Section label={BADGES_PAGE.ready} id="ready">
              {claims.length ? (
              <ul className={s.claimGrid}>
                {claims.map((key) => {
                  const b = badges.find((x) => x.key === key);
                  if (!b) return null;
                  return (
                    <li key={key}>
                      <a className={s.claimCard} href={`#badge-${key}`}>
                        <Medal badgeKey={key} state={b.earned ? "earned" : "locked"} year={key === "tenure" ? yearOf(data.history?.firstUsedOn) || null : null} />
                        <span className={s.claimText}>
                          <span className={s.claimTitle}>{BADGES_PAGE.claims[key] ?? b.title}</span>
                          <span className={s.claimBody}>{b.description}</span>
                        </span>
                        <span className={s.claimGo} aria-hidden="true">
                          →
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              ) : null}
              {storeClaims.length ? (
                <p className={p.storeClaims}>
                  <Link to="/members/store" className={s.textLink}>
                    {BADGES_PAGE.storeClaims(storeClaims.length)}
                  </Link>
                </p>
              ) : null}
            </Section>
          ) : null}
          <Achievements
            key={data.address}
            lookup={data}
            config={config}
            rungs={rungs}
            progressData={progress.data}
            onChanged={lookup.refresh}
            discordReturn={discordReturn}
            eventCard={!data.essence}
          />
        </>
      )}
    </>
  );
}

/**
 * The hero's featured figure (design notes 2026-11-03, metalface 26: the small
 * "7 of 22 earned" pill, made more of). A ring that fills with the share of
 * badges earned, the count large in light Beaufort inside it, and "of 22
 * badges earned" beside it. A record, not a rank.
 */
function EarnedFigure({ earned, total }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const share = total > 0 ? Math.min(1, earned / total) : 0;
  return (
    <div className={p.earnedFigure} role="img" aria-label={BADGES_PAGE.earned(earned, total)}>
      <span className={p.earnedRing} aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} className={p.earnedTrack} />
          {share > 0 ? (
            <circle
              cx="60"
              cy="60"
              r={R}
              className={p.earnedArc}
              strokeDasharray={`${C * share} ${C}`}
              transform="rotate(-90 60 60)"
            />
          ) : null}
        </svg>
        <span className={p.earnedCount}>{earned}</span>
      </span>
      <span className={p.earnedText} aria-hidden="true">
        {BADGES_PAGE.earnedOf(total)}
      </span>
    </div>
  );
}
