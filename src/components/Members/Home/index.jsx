import React, { useEffect, useState } from "react";
import { useHistory } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useLookup, useMember, useMembersConfig, useSeasonProgress, useSeasons } from "../lib/member";
import Hero from "./Hero";
import SeasonProgress from "./SeasonProgress";
import Achievements from "./Achievements";
import NextSteps, { ReturnBonusSection, nextSteps } from "./NextSteps";
import { HistoryStrip, Positions, ShareCards, showsReferral } from "./Detail";
import { useDiscordReturn } from "./actions";
import { joinedSeason, returnBonusFor, seasonRungs } from "./model";
import { StandingProvider, useMyStanding, usePublicEssence } from "./standing";
import EarnMore from "./EarnMore";
import { YourSeason } from "./Unlocks";
import { HowItWorks, VisitorSeason, onboardingSteps } from "./Onboarding";

/**
 * /members, v2 (plan wireframe), in three modes since the walkthrough of
 * 2026-10-23 (Alchemix-Seasons .scratch/members-area-v3-backlog/
 * journey-redesign.md): the page follows the visitor, not the engine.
 *
 *   visitor     no wallet on screen: the hero (what this is, Connect) and
 *               how it works in three steps
 *   onboarding  a wallet that has not joined the open season: the hero's
 *               getting-started checklist, then the return bonus card,
 *               badges collapsed to the earned ones, history, positions and
 *               the share cards. No season counts and no next steps.
 *   member      joined (or no season open): the hero's status strip, next
 *               steps with the bonus card, season progress, every badge,
 *               history, positions, share and invite
 *
 * Member journey 2026-10-28: a joined wallet's lookup carries its essence,
 * so the member page leads with what it earned and how to earn more: the
 * hero's essence cell, Earn more (in place of next steps), What you get (a
 * card per rung) and Recent (the last two weeks of credits), then season
 * progress, badges and the rest as before.
 *
 * Feedback 2026-10-28 (Keenan): the hero carries the essence card and the
 * return bonus; Recent and season progress are one section (Your season);
 * positions come before badges, each with a Manage link to the app; history
 * and the share cards are one section (Your record), with the referral link
 * moved into Earn more. The member order is: Earn more, What you get, Your
 * season, Positions, Badges, Your record.
 *
 * Second round the same day: Earn more and What you get are one section,
 * Essence, with a tab each; the hero is one column with one panel. The order
 * is: Essence, Your season, Positions, Badges, Your record.
 *
 * Third round the same day: positions are a tab of Your season, and the
 * badges a strip under its tabs; every badge and claim lives on
 * /members/badges, which takes the leaderboard's place in the nav. The order
 * is: Essence, Your season, Your record. A link to a badge on this page
 * (#achievements, #badge-<key>, #event-code from the Academy) and a Discord
 * return (?discord=, the engine sends it here) move to /members/badges for a
 * joined member.
 *
 * Feedback and leaving are linked from the footer (plan item 20). The
 * proposed return bonus shows only in a build with MEMBERS_SHOW_PROPOSALS=1
 * (customFields.membersShowProposals).
 */
export default function MembersHome() {
  return (
    <StandingProvider>
      <Home />
    </StandingProvider>
  );
}

/** Which mode the home page is in. */
export function homeMode({ address, data, progress }) {
  if (!address) return "visitor";
  if (!data || (!progress.data && progress.status === "loading")) return "loading";
  const seasonOpen = Boolean(progress.data?.season);
  return seasonOpen && joinedSeason(data) === false ? "onboarding" : "member";
}

function Home() {
  const { address } = useMember();
  const lookup = useLookup();
  const seasons = useSeasons();
  const progress = useSeasonProgress();
  const config = useMembersConfig();
  const discordReturn = useDiscordReturn();
  const { siteConfig } = useDocusaurusContext();
  const showProposals = siteConfig?.customFields?.membersShowProposals === true;
  const { result: standing } = useMyStanding();
  const rungs = seasonRungs(seasons, progress);
  const data = address && lookup.data ? lookup.data : null;
  usePublicEssence(data);
  const essence = data?.essence ?? null;
  const seasonOpen = Boolean(progress.data?.season);
  const mode = homeMode({ address, data, progress });
  const steps =
    data && mode === "member"
      ? nextSteps(data, { discordConfigured: config.discordConfigured, signedStanding: Boolean(standing), seasonOpen })
      : [];
  const bonus = data ? returnBonusFor(data, progress.data, showProposals) : null;
  // Feedback 2026-10-28: the invitee's bonus shows on the invite row whenever the return bonus is proposed or live.
  const seasonBonus = progress.data?.returnBonus;
  const referralBonus = showProposals && seasonBonus && (seasonBonus.status === "proposed" || seasonBonus.status === "live") ? seasonBonus : null;
  const onChanged = lookup.refresh;
  const history = useHistory();
  // Read on arrival: the Discord return drops ?discord= from the address on mount, before the lookup answers.
  const [arrival] = useState(() => (typeof window === "undefined" ? null : { hash: window.location.hash, search: window.location.search }));
  useEffect(() => {
    if (!essence || !arrival) return;
    const { hash, search } = arrival;
    const discord = new URLSearchParams(search).has("discord");
    if (discord) history.replace(`/members/badges${search}#badge-discord_linked`);
    else if (hash === "#achievements") history.replace("/members/badges");
    else if (hash.startsWith("#badge-")) history.replace(`/members/badges${hash}`);
    else if (hash === "#event-code") history.replace("/members#earn");
  }, [Boolean(essence)]); // eslint-disable-line react-hooks/exhaustive-deps

  // V3 backlog ticket 08: a joined wallet's referral link sits in the share section too.
  const hasShare = Boolean(data && (data.history || (data.transmuterClaims?.count ?? 0) > 0 || showsReferral(data)));

  const hero = (
    <Hero mode={mode} lookup={lookup} progress={progress} rungs={rungs} steps={steps} config={config} onChanged={onChanged} bonus={bonus} />
  );
  const badges = (collapsed) => (
    <Achievements
      key={data.address}
      lookup={data}
      config={config}
      rungs={rungs}
      progressData={progress.data}
      onChanged={onChanged}
      discordReturn={discordReturn}
      collapsed={collapsed}
      eventCard={!essence}
    />
  );
  const detail = () => (
    <>
      <HistoryStrip lookup={data} />
      <Positions lookup={data} markets={config?.markets} />
      {hasShare ? <ShareCards lookup={data} /> : null}
    </>
  );

  if (mode === "visitor") {
    return (
      <>
        {hero}
        <VisitorSeason progress={progress} />
        <HowItWorks rungs={rungs} />
      </>
    );
  }
  if (mode === "loading") return hero;
  if (mode === "onboarding") {
    // Page review 2026-10-24 (Keenan's layout note): no section that only repeats the checklist.
    // The bonus card stays when the deposit step is done (a top-up still earns it); when the
    // step is open, its own line already carries the bonus. Positions show only with something in them.
    const bonusInStep = onboardingSteps(data).some((st) => (st.key === "position" || st.key === "mainnetPosition") && !st.done);
    const hasPositions = (data.positions?.length ?? 0) > 0 || (data.transmuterStakes?.length ?? 0) > 0;
    return (
      <>
        {hero}
        {bonus && !bonusInStep ? <ReturnBonusSection bonus={bonus} /> : null}
        {badges(true)}
        <HistoryStrip lookup={data} />
        {hasPositions ? <Positions lookup={data} markets={config?.markets} /> : null}
        {hasShare ? <ShareCards lookup={data} /> : null}
      </>
    );
  }
  if (essence) {
    return (
      <>
        {hero}
        <EarnMore
          lookup={data}
          rungs={rungs}
          config={config}
          progressData={progress.data}
          onChanged={onChanged}
          referralBonus={referralBonus}
          bonus={bonus}
        />
        <YourSeason lookup={data} progress={progress} seasons={seasons} markets={config?.markets} />
        {hasShare ? <ShareCards lookup={data} record /> : null}
      </>
    );
  }
  return (
    <>
      {hero}
      {steps.length || bonus ? (
        <NextSteps steps={steps} lookup={data} config={config} onChanged={onChanged} bonus={bonus} />
      ) : null}
      <SeasonProgress
        progress={progress}
        seasons={seasons}
        rungs={rungs}
        held={data?.rung?.key ?? null}
        lookup={data}
      />
      {data ? (
        <>
          {badges(false)}
          {detail()}
        </>
      ) : null}
    </>
  );
}
