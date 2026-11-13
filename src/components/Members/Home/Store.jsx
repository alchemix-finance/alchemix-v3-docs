import React from "react";
import Link from "@docusaurus/Link";
import { Section } from "../parts";
import { HERO, STORE, UNLOCKS } from "../copy";
import { fmtInt } from "../lib/format";
import { DiscordAction, MerchAction, TelegramAction } from "./actions";
import Medal from "./Medal";
import { daysToNext, pastSeasonEnd } from "./model";
import s from "./home.module.css";

/**
 * The essence store (feedback 2026-10-28, fourth round, Keenan: the badges
 * page should switch between badges and their claims, and the essence store
 * and its claims; for showing only, for now). One shelf per rung, each with
 * the things that rung unlocks as items: a picture, what it is, the essence
 * it needs, where the wallet stands, and its claim once unlocked (the same
 * Discord, Telegram and merch actions as the rung badges). Essence is a
 * level here, never spent: reaching an item's level unlocks it. Items the
 * team has yet to confirm carry the "To confirm" tag, as in What you get.
 *
 * Design notes 2026-11-03 (metalface 25): the store is its own page
 * (../StorePage.jsx), whose hero carries the lead. With `lookup` null (no
 * wallet on screen) the shelves show what each level unlocks and nothing else.
 */
export default function Store({ lookup, config, rungs, onChanged, progressData = null }) {
  const wallet = Boolean(lookup);
  const essence = lookup?.essence ?? null;
  const standing = essence?.standing ?? 0;
  const heldIndex = lookup?.rung ? rungs.findIndex((r) => r.key === lookup.rung.key) : -1;
  const granted = new Set((essence?.unlocks ?? []).map((u) => u.key));
  const earned = (key) => (lookup?.achievements ?? []).some((a) => a.key === key && a.earned);

  return (
    <Section label={STORE.section} id="store-items" aside={<span className={s.storePreview}>{STORE.preview}</span>}>
      {rungs.map((r, i) => {
        const open = wallet && (i <= heldIndex || granted.has(r.key) || standing >= r.threshold);
        const prev = i > 0 ? rungs[i - 1].threshold : 0;
        const share = open ? 1 : Math.max(0, Math.min(1, (standing - prev) / Math.max(1, r.threshold - prev)));
        const needed = Math.max(0, r.threshold - standing);
        const days = open || !wallet ? null : daysToNext(needed, lookup.standingPerDay);
        const items = STORE.items.filter((it) => it.rung === r.key);
        return (
          <div key={r.key} className={`${s.storeShelf} ${open ? s.storeShelfOpen : ""}`} style={{ "--i": i }}>
            <div className={s.storeShelfHead}>
              <Medal badgeKey={r.key} state={open ? "earned" : "locked"} progress={open || !wallet ? null : share} className={s.storeShelfMedal} />
              <div className={s.storeShelfText}>
                <h3 className={s.storeShelfTitle}>{r.label}</h3>
                <div className={s.storeShelfPrice}>{UNLOCKS.needs(fmtInt(r.threshold))}</div>
              </div>
              <div className={s.storeShelfState}>
                {!wallet ? null : open ? (
                  <span className={s.unlockOn}>{STORE.unlocked}</span>
                ) : (
                  <>
                    <span>
                      {UNLOCKS.toGo(fmtInt(needed))}
                      {days !== null ? `, ${pastSeasonEnd(days, progressData?.season?.endsAt) ? HERO.status.beyond : STORE.days(days)}` : ""}
                    </span>
                    <span className={s.storeBar} aria-hidden="true">
                      <span style={{ width: `${share * 100}%` }} />
                    </span>
                  </>
                )}
              </div>
            </div>
            <ul className={s.storeGrid}>
              {items.map((it) => {
                const claimed = it.claimedBy ? earned(it.claimedBy) : false;
                return (
                  <li key={it.key} className={`${s.storeItem} ${open ? s.storeItemOpen : ""}`}>
                    <div className={s.storeArt}>
                      <ItemGlyph kind={it.glyph} />
                    </div>
                    <div className={s.storeBody}>
                      <h4 className={s.storeTitle}>
                        {it.title}
                        {it.placeholder ? <span className={s.unlockTag}>{UNLOCKS.toConfirm}</span> : null}
                      </h4>
                      <p className={s.storeText}>{it.body}</p>
                    </div>
                    <div className={s.storeFoot}>
                      {!wallet ? null : !open ? (
                        <span className={s.storeLocked}>{STORE.locked}</span>
                      ) : claimed ? (
                        <span className={s.storeDone}>{STORE.claimed}</span>
                      ) : it.claim === "discord" ? (
                        <DiscordAction configured={config?.discordConfigured !== false} linked={false} onChanged={onChanged} returned={null} hint={false} />
                      ) : it.claim === "telegram" ? (
                        <TelegramAction lookup={lookup} configured={config?.telegramConfigured !== false} onChanged={onChanged} showAccess={false} />
                      ) : it.claim === "merch" ? (
                        <MerchAction key={lookup.address} earned demo={config?.merchDemo === true} />
                      ) : (
                        <span className={s.storeDone}>{STORE.included}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className={s.storeNote}>
        {STORE.merchNote}{" "}
        <Link to="/members/merch" className={s.textLink}>
          {STORE.merchLink}
        </Link>
      </p>
    </Section>
  );
}

/** Line pictures in the medal style: a role badge, channels, a paper plane, an eye, a shirt, a ticket. */
function ItemGlyph({ kind }) {
  return (
    <svg className={s.storeGlyph} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="rgba(245,192,154,0.08)" stroke="rgba(245,192,154,0.4)" />
      <g stroke="#f5c09a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {kind === "role" ? (
          <>
            <path d="M24 13.5 32.5 17v6.4c0 5.4-3.6 9.3-8.5 11.1-4.9-1.8-8.5-5.7-8.5-11.1V17z" />
            <path d="m20.2 24 2.7 2.7 5-5.2" />
          </>
        ) : kind === "channels" ? (
          <>
            <path d="M21.5 15.5 19 32.5M29 15.5l-2.5 17M15.5 21h18M14.5 27h18" />
          </>
        ) : kind === "telegram" ? (
          <>
            <path d="M14 23.5 33.5 15l-4 19-7-5.2-3.6 3.6.6-6z" />
            <path d="m19.5 26.4 10-8" />
          </>
        ) : kind === "preview" ? (
          <>
            <path d="M12.5 24s4.2-7.5 11.5-7.5S35.5 24 35.5 24 31.3 31.5 24 31.5 12.5 24 12.5 24z" />
            <circle cx="24" cy="24" r="3.4" />
          </>
        ) : kind === "shirt" ? (
          <>
            <path d="m19 14.5-6.5 3.6 2.4 5.4 3-1.3V34h12.2V22.2l3 1.3 2.4-5.4-6.5-3.6c-.6 1.8-2.6 3.1-5 3.1s-4.4-1.3-5-3.1z" />
          </>
        ) : (
          <>
            <path d="M13.5 19.5h21v3a2.5 2.5 0 0 0 0 5v3h-21v-3a2.5 2.5 0 0 0 0-5z" />
            <path d="M28.5 19.5v11" strokeDasharray="1.5 2" />
          </>
        )}
      </g>
    </svg>
  );
}
