import React, { useEffect, useId, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import TierFrame, { ARCH_BOX } from "./TierFrame";
import CardBack from "./CardBack";

/**
 * One badge as a card (Keenan, 2026-11-04: badges become tarot-style cards
 * in the live flow). The vector frame (TierFrame.jsx) carries the numeral,
 * the name and the tier; the picture inside the arch is the badge's plate,
 * static/img/members/plates/<key>.webp, made by
 * .scratch/members-feedback-2026-11-04/art-tests/make.py in the engine repo
 * (toned to the frame's copper on the card's own ink, framed to one subject
 * box, 2x of the arch at 14rem).
 *
 *   face    "up" draws the plate in the frame at the badge's tier; "down"
 *           draws the card back (an unearned or hidden badge)
 *   muted   a face-up card not earned yet (the Access row, a claim that is
 *           ready): the same card, dimmed and desaturated in CSS
 *   compact the grid and hover size (no numeral or name in the frame)
 *
 * The four tiered badges keep one plate at every tier; above Tier I a soft
 * light is screened over the plate where GLOWS anchors it, stronger at
 * Tier III.
 */

/**
 * The catalog order the numerals count in, I to XXV: the engine's catalog
 * (src/lib/engine/achievements.ts) with the tenure badge first in history,
 * as badgeList() in Home/model.js places it.
 */
const ORDER = [
  "season_member",
  "early_season",
  "season_marathon",
  "discord_role",
  "inner_circle",
  "vip",
  "tenure",
  "v1_era",
  "v2_era",
  "migrated",
  "patron",
  "v1_to_v3",
  "first_v3_deposit",
  "borrower",
  "held_30_days",
  "returned",
  "transmuter",
  "transmuted",
  "two_chains",
  "discord_linked",
  "inner_circle_joined",
  "event_attendee",
  "academy_graduate",
  "feedback_shipped",
  "referrer",
];

const ROMAN = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function roman(n) {
  let out = "";
  let left = n;
  for (const [v, s] of ROMAN) {
    while (left >= v) {
      out += s;
      left -= v;
    }
  }
  return out;
}

/** The card's numeral: the badge's place in the catalog, or null for a key the list does not know. */
export function numeralOf(key) {
  const i = ORDER.indexOf(key);
  return i < 0 ? null : roman(i + 1);
}

/** Badges with a plate (every key in the catalog). */
const PLATES = new Set(ORDER);

/**
 * Where the tier light sits on each tiered plate, in the card's viewBox
 * units (read off the plates against a 20 unit grid). Each spot is an
 * ellipse: center, radii.
 */
const GLOWS = {
  // The furnace door.
  held_30_days: [{ cx: 100, cy: 256, rx: 22, ry: 28 }],
  // Where the two spheres overlap.
  two_chains: [{ cx: 104, cy: 199, rx: 22, ry: 30 }],
  // The open pages.
  academy_graduate: [{ cx: 97, cy: 184, rx: 50, ry: 28 }],
  // The two flames.
  referrer: [
    { cx: 80, cy: 147, rx: 16, ry: 20 },
    { cx: 115, cy: 147, rx: 20, ry: 22 },
  ],
};

/**
 * How a badge's card lies: face up at its tier once earned; face up and muted
 * when it is readable but not earned (the Access row, a claim that is ready,
 * see veil() in Home/Achievements.jsx); face down otherwise (veiled or hidden).
 */
export function cardFace(b) {
  if (b.earned) return { face: "up", muted: false };
  if (b.hidden) return { face: "down", muted: false };
  return { face: "up", muted: true };
}

export default function BadgeCard({ badgeKey, face = "up", tier = 1, name, compact = false }) {
  if (face === "down") return <CardBack compact={compact} />;
  const t = Math.max(1, Math.min(3, Math.floor(tier || 1)));
  return (
    <TierFrame tier={t} numeral={numeralOf(badgeKey)} name={name} compact={compact}>
      {PLATES.has(badgeKey) ? <Plate badgeKey={badgeKey} /> : null}
      <Glow badgeKey={badgeKey} tier={t} />
    </TierFrame>
  );
}

// The card's ink under the arch, top to foot (make.py tones every plate's ground to it).
const INK_TOP = "#0f171c";
const INK_FOOT = "#0a0e12";

/**
 * The plate, filling the arch's box (the frame clips it to the arch). The
 * arch holds the ink until the image is near the viewport and loaded, then
 * the plate fades in over it, so nothing flashes. Loaded when it comes within
 * 400px of the viewport.
 */
function Plate({ badgeKey }) {
  const href = useBaseUrl(`/img/members/plates/${badgeKey}.webp`);
  const id = `pi${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
    <g ref={ref}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={INK_TOP} />
          <stop offset="100%" stopColor={INK_FOOT} />
        </linearGradient>
      </defs>
      <rect {...ARCH_BOX} fill={`url(#${id})`} />
      {near ? (
        <image
          href={href}
          {...ARCH_BOX}
          preserveAspectRatio="xMidYMid slice"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        />
      ) : null}
    </g>
  );
}

/** Light screened over a tiered plate above Tier I, so it only ever brightens. */
function Glow({ badgeKey, tier }) {
  const id = `pg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const spots = GLOWS[badgeKey];
  if (!spots || tier < 2) return null;
  const strong = tier >= 3;
  const grow = strong ? 1.3 : 1;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a8" stopOpacity={strong ? 0.95 : 0.75} />
          <stop offset="0.45" stopColor="#f5a066" stopOpacity={strong ? 0.5 : 0.34} />
          <stop offset="1" stopColor="#b45a2e" stopOpacity="0" />
        </radialGradient>
      </defs>
      {spots.map((g) => (
        <ellipse key={`${g.cx}-${g.cy}`} cx={g.cx} cy={g.cy} rx={g.rx * grow} ry={g.ry * grow} fill={`url(#${id})`} />
      ))}
    </g>
  );
}
