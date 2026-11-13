import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useClaim, useMember } from "../lib/member";
import { sameAddress } from "../lib/wallet";

/**
 * The wallet's essence, shared by the hero's status strip, the rung badges,
 * the referral card and the leaderboard's ladder.
 *
 * Member journey 2026-10-28 (Keenan: show essence without a signature): the
 * public lookup now carries a joined wallet's essence (`essence`, from the
 * engine's src/lib/standing/walletEssence.ts), so the number, rank and what
 * the next rung needs show on sight. A page publishes its lookup's essence
 * with usePublicEssence. The signed my-standing claim (ticket 19) stays for
 * the referral code, which only the owner gets; once signed, its answer wins.
 * A later claim on the page (an event code, the Academy) can change the
 * number, so the signed answer is dropped then, and when the viewed address
 * changes; the page refreshes its lookup for the new number.
 */
const StandingContext = createContext(null);

/** The lookup's essence in the my-standing answer's shape (referral left to the signed claim). */
function fromPublic(essence) {
  if (!essence) return null;
  return {
    seasonId: essence.seasonId,
    standing: essence.standing,
    rank: essence.rank,
    tied: essence.tied,
    nextRung: essence.nextRung,
    joinedAt: null,
    daysCounted: essence.daysCounted,
    referral: null,
  };
}

export function StandingProvider({ children }) {
  const { claimsVersion, address } = useMember();
  const claim = useClaim("my-standing");
  const seen = useRef({ version: claimsVersion, address });
  const { reset } = claim;
  const [published, setPublished] = useState(null);

  useEffect(() => {
    if (seen.current.version !== claimsVersion || seen.current.address !== address) {
      seen.current = { version: claimsVersion, address };
      reset();
    }
  }, [claimsVersion, address, reset]);

  const signed = claim.stage === "done" ? claim.result : null;
  const pub = published && sameAddress(published.address, address) ? fromPublic(published.essence) : null;
  const value = {
    claim,
    result: signed ?? pub,
    signed,
    publish: setPublished,
    run: () => {
      seen.current = { version: claimsVersion, address };
      return claim.run();
    },
  };
  return <StandingContext.Provider value={value}>{children}</StandingContext.Provider>;
}

export function useMyStanding() {
  return useContext(StandingContext);
}

/** Hand the page's lookup to the provider, so every reader of useMyStanding sees its essence. */
export function usePublicEssence(lookupData) {
  const ctx = useContext(StandingContext);
  const publish = ctx?.publish;
  const address = lookupData?.address ?? null;
  const essence = lookupData?.essence ?? null;
  useEffect(() => {
    publish?.(address ? { address, essence } : null);
  }, [publish, address, essence]);
}
