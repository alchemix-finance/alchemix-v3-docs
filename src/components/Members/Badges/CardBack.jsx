import React, { useEffect, useId, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { CenterLogo } from "../brand";
import { COPPER } from "./TierFrame";

/**
 * The face-down badge card. An unearned or hidden badge lies face down in
 * the grid, the panel and the hover card, as an unearned seal shows "?".
 *
 * Keenan, 2026-11-05: the vector back (three stacked circles over a
 * procedural stipple, from the tarot exploration) looked out of place beside
 * the engraved plates, so the back is now a plate too:
 * static/img/members/plates/back.webp, a stipple engraving from the same
 * image model and prompt as the fronts (a lattice of alchemical glyphs and
 * stars, mirrored both ways, with a bare circle at the center), made by
 * .scratch/members-feedback-2026-11-04/art-tests/backs.py in the engine repo.
 * It fills the inner rule of the frame, under the same double rule and corner
 * dots as a Tier I front, and the Alchemix mark sits in the bare circle.
 *
 * The same lazy load as the front plate (BadgeCard.jsx): the ink holds the
 * rect until the image is near the viewport and loaded, then it fades in.
 * `compact` (grid and hover sizes) draws the rules a little heavier. The
 * plate is drawn at 80% so a face-down card sits a step behind the earned
 * fronts in the grid.
 */
const BOX = { x: 10.5, y: 10.5, width: 179, height: 329 };

export default function CardBack({ compact = false }) {
  const id = `cb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const href = useBaseUrl("/img/members/plates/back.webp");
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const k = compact ? 1.6 : 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg viewBox="0 0 200 350" aria-hidden="true" focusable="false" ref={ref}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10181d" />
          <stop offset="100%" stopColor="#0a0e11" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect {...BOX} rx="3" />
        </clipPath>
      </defs>
      <rect x="0.5" y="0.5" width="199" height="349" rx="9" fill={`url(#${id}g)`} stroke={COPPER} strokeOpacity="0.11" />
      <g clipPath={`url(#${id}c)`}>
        {near ? (
          <image
            href={href}
            {...BOX}
            preserveAspectRatio="xMidYMid slice"
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 0.8 : 0, transition: "opacity 0.3s ease" }}
          />
        ) : null}
      </g>
      <rect x="7" y="7" width="186" height="336" rx="5" fill="none" stroke={COPPER} strokeOpacity="0.43" strokeWidth={0.8 * k} />
      <rect {...BOX} rx="3" fill="none" stroke={COPPER} strokeOpacity="0.21" strokeWidth={0.5 * k} />
      <g fill={COPPER} fillOpacity="0.52">
        <circle cx="10.5" cy="10.5" r="1.6" />
        <circle cx="189.5" cy="10.5" r="1.6" />
        <circle cx="10.5" cy="339.5" r="1.6" />
        <circle cx="189.5" cy="339.5" r="1.6" />
      </g>
      {/* The mark in the plate's bare circle (about 33 units across at the center). */}
      <circle cx="100" cy="175" r="30" fill="#0b1014" />
      <CenterLogo cx={100} cy={175} size={46} />
    </svg>
  );
}
