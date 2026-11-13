import React from "react";
import Link from "@docusaurus/Link";
import { currentSeason } from "../lib/api";
import { fmtDate, fmtInt } from "../lib/format";
import { Section } from "../parts";
import { SEASON_PROGRESS } from "../copy";
import { academyCredit, carryItems } from "./model";
import s from "./home.module.css";

/**
 * SEASON PROGRESS (everyone, plan item 1, strategy alignment 2026-10-21):
 * wallets that joined, days left and members per rung with each rung's plain
 * requirement, from GET /api/seasons/current/progress. Counts only, no
 * wallet. Higher rungs count toward lower ones, as the ladder works.
 *
 * Under it, how seasons chain: this season, the month of access after it,
 * and the next season opening before that access ends, then what carries
 * over (Academy credit, tenure, badges). For a viewed wallet with Academy
 * credit, the amount it carries.
 *
 * Feedback 2026-10-28: a member with essence sees Your season (./Unlocks.jsx,
 * with its own season summary) in place of this section.
 */
export default function SeasonProgress({ progress, seasons, rungs, held, lookup }) {
  const data = progress.data;
  const season = data?.season;
  if (!season) return null;
  const joined = typeof data.walletsJoined === "number" ? data.walletsJoined : null;
  const total = Math.max(1, joined ?? data.walletsWithStanding);

  return (
    <Section label={SEASON_PROGRESS.section} id="season">
      <div className={s.progressGrid}>
        <div className={s.progressStats}>
          <div className={s.bigStat}>
            <div className={s.bigNumber}>{fmtInt(joined ?? data.walletsWithStanding)}</div>
            <div className={s.bigLabel}>{joined !== null ? SEASON_PROGRESS.joined : SEASON_PROGRESS.wallets}</div>
          </div>
          <div className={s.bigStat}>
            <div className={s.bigNumber}>{fmtInt(season.daysLeft)}</div>
            <div className={s.bigLabel}>{SEASON_PROGRESS.daysLeft}</div>
          </div>
        </div>

        <div className={s.rungBars}>
          <div className={s.rungBarsLabel}>{SEASON_PROGRESS.perRung}</div>
          {rungs.map((r) => {
            const count = data.membersPerRung?.[r.key] ?? 0;
            const pct = Math.min(100, (count / total) * 100);
            const mine = held === r.key;
            return (
              <div key={r.key} className={`${s.rungBar} ${mine ? s.rungBarMine : ""}`}>
                <div className={s.rungBarName}>
                  <span>{r.label}</span>
                  <span className={s.rungBarThreshold}>{SEASON_PROGRESS.threshold(fmtInt(r.threshold))}</span>
                </div>
                <div className={s.rungBarTrack}>
                  <span style={{ width: `${Math.max(pct, 0.8)}%` }} />
                </div>
                <div className={s.rungBarCount}>{fmtInt(count)}</div>
                <div className={s.rungBarYou}>
                  {mine ? <span className={s.youTag}>{SEASON_PROGRESS.you}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SeasonChain season={season} data={data} seasons={seasons} lookup={lookup} />

      <p className={s.howNote}>
        <Link to="/members/leaderboard#board" className={s.textLink}>
          {SEASON_PROGRESS.how}
        </Link>
      </p>
    </Section>
  );
}

/**
 * One bar for this season and the month of access after it, a second for
 * the next season, which opens before that access ends. Then what carries
 * over. The access end comes from the season list, else the progress route's
 * nextSeasonOpensBefore.
 */
function SeasonChain({ season, data, seasons, lookup }) {
  const listed = currentSeason(seasons?.data);
  const accessEnd = (listed && listed.id === season.id && listed.accessExpiresAt) || data.nextSeasonOpensBefore || null;
  const nextBefore = data.nextSeasonOpensBefore || accessEnd;
  const start = new Date(season.startsAt).getTime();
  const end = new Date(season.endsAt).getTime();
  const access = accessEnd ? new Date(accessEnd).getTime() : null;
  const span = access && access > end ? access - start : null;
  const seasonPct = span ? ((end - start) / span) * 100 : 100;
  const todayPct = span ? Math.min(100, Math.max(0, ((Date.now() - start) / span) * 100)) : season.progress * 100;
  const items = carryItems(data.carriesOver);
  const credit = academyCredit(lookup);
  const C = SEASON_PROGRESS.chain;

  return (
    <div className={s.chain}>
      <div className={s.chainMain}>
        <div className={s.chainLabel}>{C.label}</div>
        <div className={s.chainBars} aria-hidden="true">
          <div className={s.chainRow}>
            <span className={s.chainSeason} style={{ width: `${seasonPct}%` }}>
              <span className={s.chainElapsed} style={{ width: `${Math.min(100, (todayPct / seasonPct) * 100)}%` }} />
            </span>
            {span ? <span className={s.chainAccess} style={{ width: `${100 - seasonPct}%` }} /> : null}
          </div>
          {span ? (
            <div className={s.chainRow}>
              <span className={s.chainNext} style={{ marginLeft: `${seasonPct}%`, width: `${100 - seasonPct}%` }} />
            </div>
          ) : null}
          <span className={s.chainToday} style={{ left: `${todayPct}%` }} />
        </div>
        <ul className={s.chainKey}>
          <li>
            <span className={`${s.keyDot} ${s.keySeason}`} aria-hidden="true" />
            <span className={s.keyName}>{C.ends()}</span>
          </li>
          {accessEnd ? (
            <li>
              <span className={`${s.keyDot} ${s.keyAccess}`} aria-hidden="true" />
              <span className={s.keyName}>{C.accessEnds(fmtDate(accessEnd, { short: true }))}</span>
            </li>
          ) : null}
          {nextBefore ? (
            <li>
              <span className={`${s.keyDot} ${s.keyNext}`} aria-hidden="true" />
              <span className={s.keyName}>{C.nextOpens()}</span>
            </li>
          ) : null}
        </ul>
      </div>

      <div className={s.carry}>
        <div className={s.chainLabel}>{SEASON_PROGRESS.carries.label}</div>
        <ul className={s.carryList}>
          {items.map((k) => (
            <li key={k} className={s.carryItem}>
              <CarryGlyph k={k} />
              <span>{SEASON_PROGRESS.carries.items[k]}</span>
            </li>
          ))}
        </ul>
        <p className={s.chainNote}>
          {SEASON_PROGRESS.carries.note}
          {credit && credit > 0 ? <> {SEASON_PROGRESS.carries.academyCredit(fmtInt(credit))}</> : null}
        </p>
      </div>
    </div>
  );
}

/** Small line glyphs in the medal style: a mortarboard, a clock seal, a medal. Also on Your season's carry line. */
export function CarryGlyph({ k }) {
  return (
    <svg className={s.carryGlyph} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="rgba(245,192,154,0.1)" stroke="rgba(245,192,154,0.45)" />
      <g stroke="#f5c09a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {k === "academy" ? (
          <>
            <path d="M5.5 10.5 12 7.5l6.5 3-6.5 3z" />
            <path d="M8.5 12v3c1 1 2.2 1.4 3.5 1.4s2.5-.4 3.5-1.4v-3" />
          </>
        ) : k === "tenure" ? (
          <>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 9.5V12l1.8 1.2" />
          </>
        ) : (
          <>
            <circle cx="12" cy="11" r="3.6" />
            <path d="M9.8 14 8.8 18l3.2-1.5 3.2 1.5-1-4" />
          </>
        )}
      </g>
    </svg>
  );
}
