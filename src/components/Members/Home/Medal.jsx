import React, { useId } from "react";

/**
 * One badge medal. Every badge has the same shape (research: one consistent
 * shape, meaning carried by tone, no cartoon metals): a tick ring, a filled
 * disc, a thin rim and a line glyph in the middle.
 *
 *   earned  copper disc and glyph, lit
 *   locked  dim disc, grey glyph, and a blue arc for progress where there is some
 *   hidden  a quiet silhouette with "?" (the hidden badges, and since the
 *           design notes of 2026-11-03, note 41, every unearned badge outside
 *           the Access row; see veil() in Achievements.jsx)
 *
 * `year` replaces the glyph on the tenure badge, as the v1 seal did.
 *
 * Round two, 2026-11-04 (tiered badges): `tier` is the tier an earned badge
 * holds. Tier 1 is the seal as it was. Tier 2 adds a thin inner ring inside
 * the rim; tier 3 a second inner ring and a filled rim. A small "II" or "III"
 * sits under the glyph (or the year) in the seal's lettering. Same copper,
 * nothing louder.
 */
const NUMERALS = { 2: "II", 3: "III" };

export default function Medal({ badgeKey, state, progress = null, year = null, tier = null, className, title }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const earned = state === "earned";
  const hidden = state === "hidden";
  const ink = earned ? "#f5c09a" : hidden ? "rgba(250,250,250,0.42)" : "rgba(161,161,161,0.6)";

  const ticks = [];
  for (let i = 0; i < 60; i += 1) {
    const a = (i / 60) * Math.PI * 2;
    const r1 = i % 5 === 0 ? 53.5 : 55;
    ticks.push(
      <line key={i} x1={60 + Math.cos(a) * r1} y1={60 + Math.sin(a) * r1} x2={60 + Math.cos(a) * 57} y2={60 + Math.sin(a) * 57} />,
    );
  }

  const arc = typeof progress === "number" && progress > 0 && !earned ? Math.min(progress, 1) : 0;
  const level = earned && tier >= 2 ? Math.min(3, Math.floor(tier)) : 1;
  const R = 50;
  const C = 2 * Math.PI * R;

  return (
    <svg className={className} viewBox="0 0 120 120" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`m${id}`} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#f5c09a" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#f5c09a" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#f5c09a" stopOpacity="0.04" />
        </radialGradient>
      </defs>
      <g stroke={earned ? "rgba(245,192,154,0.55)" : "rgba(255,255,255,0.1)"} strokeWidth="0.8">
        {ticks}
      </g>
      <circle
        cx="60"
        cy="60"
        r={R}
        fill={earned ? `url(#m${id})` : hidden ? "rgba(255,255,255,0.012)" : "rgba(255,255,255,0.03)"}
        stroke={earned ? "#f5c09a" : hidden ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.14)"}
        strokeWidth="1"
        strokeDasharray={hidden ? "2 4" : undefined}
      />
      {level >= 3 ? <circle cx="60" cy="60" r="48.4" fill="none" stroke="#f5c09a" strokeOpacity="0.2" strokeWidth="3.2" /> : null}
      {level >= 2 ? <circle cx="60" cy="60" r="44.5" fill="none" stroke="#f5c09a" strokeOpacity="0.5" strokeWidth="0.7" /> : null}
      {level >= 3 ? <circle cx="60" cy="60" r="41.6" fill="none" stroke="#f5c09a" strokeOpacity="0.38" strokeWidth="0.6" /> : null}
      {arc ? (
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="#8fb2de"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${C * arc} ${C}`}
          transform="rotate(-90 60 60)"
        />
      ) : null}
      <circle cx="60" cy="60" r="38" fill={earned ? "rgba(23,30,34,0.45)" : "rgba(0,0,0,0.12)"} />
      {hidden ? (
        <text x="60" y="71" textAnchor="middle" fill={ink} fontFamily='"Beaufort Pro", Georgia, serif' fontSize="30" fontWeight="300">
          ?
        </text>
      ) : year ? (
        <text x="60" y="66" textAnchor="middle" fill={ink} fontFamily='"Beaufort Pro", Georgia, serif' fontSize="19" fontWeight="300" letterSpacing="1">
          {year}
        </text>
      ) : (
        <g transform={level >= 2 ? "translate(41.5 35.5) scale(0.925)" : "translate(40 40)"} fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <Glyph k={badgeKey} ink={ink} />
        </g>
      )}
      {level >= 2 && !hidden ? (
        <text
          x="60"
          y={year ? 83 : 90.5}
          textAnchor="middle"
          fill={ink}
          fillOpacity="0.85"
          fontFamily='"Beaufort Pro", Georgia, serif'
          fontSize="12"
          fontWeight="400"
          letterSpacing="1.5"
        >
          {NUMERALS[level]}
        </text>
      ) : null}
    </svg>
  );
}

function Chevrons({ n }) {
  const ys = n === 1 ? [16] : n === 2 ? [11, 20] : [7, 15.5, 24];
  return ys.map((y) => <polyline key={y} points={`9,${y + 8} 20,${y} 31,${y + 8}`} />);
}

function Word({ text, ink, size = 15 }) {
  return (
    <text
      x="20"
      y={20 + size * 0.36}
      textAnchor="middle"
      fill={ink}
      stroke="none"
      fontFamily='"Beaufort Pro", Georgia, serif'
      fontSize={size}
      fontWeight="400"
      letterSpacing="0.5"
    >
      {text}
    </text>
  );
}

/** The line glyph for each badge, drawn in a 40 unit box. */
function Glyph({ k, ink }) {
  switch (k) {
    case "discord_role":
      return <Chevrons n={1} />;
    case "inner_circle":
      return <Chevrons n={2} />;
    case "vip":
      return <Chevrons n={3} />;
    case "tenure":
      return <Word text="est." ink={ink} />;
    case "v1_era":
      return <Word text="v1" ink={ink} size={17} />;
    case "v2_era":
      return <Word text="v2" ink={ink} size={17} />;
    case "migrated":
      return (
        <>
          <circle cx="9" cy="20" r="5" />
          <circle cx="31" cy="20" r="5" />
          <line x1="15" y1="20" x2="24" y2="20" />
          <polyline points="21,16.5 24.5,20 21,23.5" />
        </>
      );
    case "v1_to_v3":
      return <Word text="v1 v3" ink={ink} size={12} />;
    case "first_v3_deposit":
      return (
        <>
          <line x1="20" y1="6" x2="20" y2="23" />
          <polyline points="13.5,16.5 20,23 26.5,16.5" />
          <polyline points="8,25 8,33 32,33 32,25" />
        </>
      );
    case "borrower":
      return (
        <>
          <line x1="6" y1="31" x2="21" y2="31" />
          <line x1="6" y1="25.5" x2="21" y2="25.5" />
          <line x1="6" y1="20" x2="21" y2="20" />
          <line x1="29" y1="31" x2="29" y2="9" />
          <polyline points="24.5,13.5 29,9 33.5,13.5" />
        </>
      );
    case "held_30_days":
      return (
        <>
          <circle cx="20" cy="20" r="13.5" />
          <line x1="20" y1="20" x2="20" y2="11" />
          <line x1="20" y1="20" x2="26.5" y2="23.5" />
        </>
      );
    case "returned":
      return (
        <>
          <path d="M31 22 A12 12 0 1 1 27.5 11.5" />
          <polyline points="28.5,5.5 28,11.8 21.8,11.8" />
        </>
      );
    case "transmuter":
      return (
        <>
          <rect x="7" y="7" width="26" height="26" rx="7" />
          <polyline points="13.5,27.5 20,13 26.5,27.5" />
          <line x1="15.8" y1="22.5" x2="24.2" y2="22.5" />
        </>
      );
    case "transmuted":
      return (
        <>
          <polyline points="6,30 14,12 22,30" />
          <line x1="8.7" y1="24" x2="19.3" y2="24" />
          <line x1="24" y1="20" x2="34" y2="20" />
          <polyline points="30.5,16.5 34,20 30.5,23.5" />
        </>
      );
    case "two_chains":
      return (
        <>
          <circle cx="15" cy="20" r="9.5" />
          <circle cx="25" cy="20" r="9.5" />
        </>
      );
    case "season_member":
      // Round two, 2026-11-04: a pennant on its staff, for joining the season.
      return (
        <>
          <line x1="12" y1="6" x2="12" y2="34" />
          <path d="M12 8 L31 13.5 L12 19" />
        </>
      );
    case "referrer":
      // Round two, 2026-11-04: one point passing to a second.
      return (
        <>
          <circle cx="11" cy="20" r="5" />
          <circle cx="29" cy="20" r="5" />
          <path d="M16 17 Q20 12 24 17" />
          <polyline points="21.5,15.5 24,17 24.5,14" />
        </>
      );
    case "early_season":
      return (
        <>
          <line x1="6" y1="28" x2="34" y2="28" />
          <path d="M11 28 A9 9 0 0 1 29 28" />
          <line x1="20" y1="9" x2="20" y2="14" />
          <line x1="9" y1="14.5" x2="11.8" y2="17.3" />
          <line x1="31" y1="14.5" x2="28.2" y2="17.3" />
        </>
      );
    case "season_marathon":
      return (
        <>
          <circle cx="20" cy="20" r="13.5" strokeDasharray="2.2 2.6" />
          <circle cx="20" cy="20" r="5.5" />
        </>
      );
    case "discord_linked":
      return (
        <>
          <rect x="5" y="15" width="17" height="10" rx="5" />
          <rect x="18" y="15" width="17" height="10" rx="5" />
        </>
      );
    case "inner_circle_joined":
      return (
        <>
          <circle cx="20" cy="20" r="13.5" />
          <circle cx="20" cy="20" r="7" />
          <circle cx="20" cy="20" r="1.6" fill={ink} />
        </>
      );
    case "event_attendee":
      return (
        <>
          <path d="M7 12 H33 V17 A3 3 0 0 0 33 23 V28 H7 V23 A3 3 0 0 0 7 17 Z" />
          <line x1="24" y1="13.5" x2="24" y2="26.5" strokeDasharray="1.5 2.2" />
        </>
      );
    case "academy_graduate":
      return (
        <>
          <polygon points="20,9 35,16 20,23 5,16" />
          <path d="M11 19 V26 Q20 31 29 26 V19" />
          <line x1="35" y1="16" x2="35" y2="24" />
        </>
      );
    case "feedback_shipped":
      return (
        <>
          <path d="M7 9 H33 V26 H18 L12 32 V26 H7 Z" />
          <polyline points="14,17.5 18,21.5 26,13.5" />
        </>
      );
    case "patron":
      // Round two, 2026-11-04: a shield holding the ether diamond, for the Patron NFT (alETH returned or ETH donated, 2021).
      return (
        <>
          <path d="M20 6 L32 10 V20 Q32 29 20 34 Q8 29 8 20 V10 Z" />
          <polygon points="20,13 25,20.5 20,27.5 15,20.5" />
          <line x1="15" y1="20.5" x2="25" y2="20.5" />
        </>
      );
    default:
      return <circle cx="20" cy="20" r="6" />;
  }
}
