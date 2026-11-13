import React from "react";
import { isEngineDown } from "./lib/api";
import { errorText, useLookup, useMember, useMembersConfig, useSeasonProgress, useSeasons } from "./lib/member";
import { EngineDown, Notice, Section } from "./parts";
import { HERO, STORE } from "./copy";
import Store from "./Home/Store";
import { seasonRungs } from "./Home/model";
import { ConnectButton } from "./Shell/Connect";
import p from "./pages.module.css";
import s from "./Home/home.module.css";

/**
 * /members/store (design notes 2026-11-03, metalface 25 and 30: the store was
 * a tab on the badges page; it is its own page in the nav now). The standard
 * page hero, then the store itself (./Home/Store.jsx): one shelf per unlock,
 * with the Discord, Telegram and merch claims on its items. With no wallet on
 * screen the shelves still show what each level unlocks, without progress.
 *
 * A Discord return still lands on /members/badges (Home/index.jsx forwards
 * ?discord= there), where the Discord linked badge's panel shows the outcome.
 */
export default function StorePage() {
  const { address, ready } = useMember();
  const lookup = useLookup();
  const seasons = useSeasons();
  const progress = useSeasonProgress();
  const config = useMembersConfig();
  const rungs = seasonRungs(seasons, progress);
  const data = address && lookup.data ? lookup.data : null;

  return (
    <>
      <section className={p.pageHead}>
        <div className={p.pageHeadInner}>
          <div className={p.eyebrow}>{HERO.eyebrow}</div>
          <h1 className={p.headline}>{STORE.headline}</h1>
          <p className={p.lead}>{STORE.lead}</p>
          {ready && !address ? (
            <div className={p.headAction}>
              <p className={s.bodySmall}>{STORE.empty}</p>
              <ConnectButton />
            </div>
          ) : null}
        </div>
      </section>

      {!ready ? null : !address ? (
        <Store lookup={null} config={config} rungs={rungs} />
      ) : lookup.status === "error" ? (
        <Section label={STORE.section} id="store-items">
          {isEngineDown(lookup.error) ? <EngineDown onRetry={lookup.refresh} /> : <Notice tone="error">{errorText(lookup.error)}</Notice>}
        </Section>
      ) : !data ? (
        <Section label={STORE.section} id="store-items">
          <div className={`${s.strip} ${s.stripLoading}`} aria-busy="true">
            <span className={s.loadingOrbit} aria-hidden="true" />
            <span className={s.bodySmall}>{HERO.loading}</span>
          </div>
        </Section>
      ) : (
        <Store key={data.address} lookup={data} config={config} rungs={rungs} onChanged={lookup.refresh} progressData={progress.data} />
      )}
    </>
  );
}
