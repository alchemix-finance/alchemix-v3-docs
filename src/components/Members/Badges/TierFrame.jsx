import React, { useId } from "react";

/**
 * The badge card's frame (from the art pass on the tarot exploration,
 * 2026-11-04; live on the Badges page since the same day). Draws the card
 * ground, the border and corner ornaments, the numeral, the arched panel and
 * the foot (diamonds and name); whatever is passed as children is drawn
 * inside the arch, clipped to it, under the arch line, so the frame always
 * sits over the picture (BadgeCard.jsx passes the plate and the tier glow).
 *
 * What each tier adds to the frame:
 *   I    plain double border, a dot at each corner
 *   II   ornaments at the corners, a second arch line
 *   III  rich corners, the border band filled, the numeral in a cartouche, a keystone
 * The foot carries one, two or three diamonds for the tier.
 *
 * `compact` is the grid and hover size: no numeral and no name (the name sits
 * under the card in the page's own type), the top hairline closed with a
 * diamond, the foot diamonds centered in the band under the arch, and the
 * lines drawn heavier so they hold at about 6rem wide.
 *
 * Children draw in the card's 200 by 350 viewBox; the arch box is ARCH_BOX.
 */

export const COPPER = "#f5c09a";
export const COPPER_HI = "#fee3cf";
export const INK = "#090d10";
const SERIF = '"Beaufort Pro", "Beaufort", Georgia, serif';

const ARCH = "M24 296V128A76 76 0 0 1 176 128V296Z";
const ARCH_IN = "M27.5 296V128A72.5 72.5 0 0 1 172.5 128V296";
const BAND =
  "M12 7H188A5 5 0 0 1 193 12V338A5 5 0 0 1 188 343H12A5 5 0 0 1 7 338V12A5 5 0 0 1 12 7ZM13.5 10.5A3 3 0 0 0 10.5 13.5V336.5A3 3 0 0 0 13.5 339.5H186.5A3 3 0 0 0 189.5 336.5V13.5A3 3 0 0 0 186.5 10.5Z";

/** The panel the picture fills: x, y, width and height of the arch's bounding box. */
export const ARCH_BOX = { x: 24, y: 52, width: 152, height: 244 };

/** The ornament for the top left corner (the others are mirrored): light at Tier II, full at Tier III. */
function Corner({ rich, k }) {
  if (!rich) {
    return (
      <g fill="none" stroke={COPPER} strokeLinecap="round">
        <path d="M24 10.5A13.5 13.5 0 0 1 10.5 24" strokeOpacity="0.6" strokeWidth={0.6 * k} />
        <path d="M20.3 20.3Q25.6 21.4 27.6 27.6Q21.4 25.6 20.3 20.3Z" fill={COPPER} fillOpacity="0.7" stroke="none" />
        <circle cx="10.5" cy="10.5" r="1.6" fill={COPPER} fillOpacity="0.8" stroke="none" />
      </g>
    );
  }
  return (
    <g fill="none" stroke={COPPER} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 10.5H24A13.5 13.5 0 0 1 10.5 24Z" fill={COPPER} fillOpacity="0.14" stroke="none" />
      <path d="M24 10.5A13.5 13.5 0 0 1 10.5 24" strokeOpacity="0.85" strokeWidth={0.7 * k} />
      <path d="M28.5 10.5A18 18 0 0 1 10.5 28.5" strokeOpacity="0.45" strokeWidth={0.5 * k} />
      {/* A leaf on the diagonal, pointing in, with its rib engraved. */}
      <path d="M21.2 21.2Q28.6 22.6 31.6 31.6Q22.6 28.6 21.2 21.2Z" fill={COPPER} fillOpacity="0.85" stroke="none" />
      <path d="M22.8 22.8L29.6 29.6" stroke={INK} strokeOpacity="0.55" strokeWidth="0.45" />
      {/* Scrolls where the outer arc meets the border. */}
      <path d="M28.5 10.5C28.5 14.2 31.2 15.6 33.4 14.6C35.1 13.8 34.9 11.6 33.3 11.4" strokeOpacity="0.75" strokeWidth={0.6 * k} />
      <path d="M10.5 28.5C14.2 28.5 15.6 31.2 14.6 33.4C13.8 35.1 11.6 34.9 11.4 33.3" strokeOpacity="0.75" strokeWidth={0.6 * k} />
      <path d="M38 10.5H44M10.5 38V44" strokeOpacity="0.45" strokeWidth={0.6 * k} />
      <circle cx="10.5" cy="10.5" r="2.1" fill={COPPER} stroke="none" />
    </g>
  );
}

const MIRRORS = ["", "translate(200 0) scale(-1 1)", "translate(0 350) scale(1 -1)", "translate(200 350) scale(-1 -1)"];

/** The rounded cartouche round the numeral at Tier III, `h` units either side of the center. */
function cartouche(h, inset) {
  const l = 100 - h + inset;
  const r = 100 + h - inset;
  const t = 19.5 + inset;
  const b = 39.5 - inset;
  const c = 3.5 - inset * 0.4;
  return `M${l + c} ${t}H${r - c}A${c} ${c} 0 0 0 ${r} ${t + c}V${b - c}A${c} ${c} 0 0 0 ${r - c} ${b}H${l + c}A${c} ${c} 0 0 0 ${l} ${b - c}V${t + c}A${c} ${c} 0 0 0 ${l + c} ${t}Z`;
}

/** The name's size: 13.5 units, smaller for a long title so it stays inside the foot (about 150 units). */
function nameSize(name) {
  const n = String(name ?? "").length;
  return Math.min(13.5, (150 / Math.max(1, n) - 1.2) / 0.62);
}

export default function TierFrame({ tier = 1, numeral, name, compact = false, children }) {
  const id = `tf${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const lit = tier >= 2;
  const glow = tier >= 3;
  const k = compact ? 1.7 : 1;
  const pips = tier === 1 ? [100] : tier === 2 ? [96, 104] : [92, 100, 108];
  const gapL = pips[0] - 5;
  const gapR = pips[pips.length - 1] + 5;
  const footY = compact ? 320 : 306;
  // Half the width the numeral needs between the hairlines (I to XXV).
  const half = numeral ? Math.max(20, String(numeral).length * 5.6 + 7) : 0;
  const size = nameSize(name);

  return (
    <svg viewBox="0 0 200 350" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#152028" />
          <stop offset="100%" stopColor="#0b1014" />
        </linearGradient>
        <clipPath id={`${id}p`}>
          <path d={ARCH} />
        </clipPath>
      </defs>

      {/* Ground and border: a thin double rule; at Tier III the band between is filled and a third rule added. */}
      <rect x="0.5" y="0.5" width="199" height="349" rx="9" fill={`url(#${id}g)`} stroke={COPPER} strokeOpacity="0.16" />
      {glow ? <path d={BAND} fill={COPPER} fillOpacity="0.2" fillRule="evenodd" /> : null}
      <rect x="7" y="7" width="186" height="336" rx="5" fill="none" stroke={COPPER} strokeOpacity="0.62" strokeWidth={0.8 * k} />
      <rect x="10.5" y="10.5" width="179" height="329" rx="3" fill="none" stroke={COPPER} strokeOpacity={glow ? 0.7 : 0.3} strokeWidth={(glow ? 0.7 : 0.5) * k} />
      {glow ? <rect x="13.5" y="13.5" width="173" height="323" rx="2" fill="none" stroke={COPPER} strokeOpacity="0.28" strokeWidth={0.45 * k} /> : null}
      {tier === 1 ? (
        <g fill={COPPER} fillOpacity="0.75">
          <circle cx="10.5" cy="10.5" r="1.6" />
          <circle cx="189.5" cy="10.5" r="1.6" />
          <circle cx="10.5" cy="339.5" r="1.6" />
          <circle cx="189.5" cy="339.5" r="1.6" />
        </g>
      ) : (
        MIRRORS.map((m) => (
          <g key={m || "tl"} transform={m || undefined}>
            <Corner rich={glow} k={k} />
          </g>
        ))
      )}

      {/* The numeral: between hairlines, set in a cartouche at Tier III. Compact: one hairline and a diamond. */}
      {compact ? (
        <>
          <path d="M30 29.5H94M106 29.5H170" stroke={COPPER} strokeOpacity="0.5" strokeWidth={0.6 * k} />
          <path d="M100 26L103.5 29.5L100 33L96.5 29.5Z" fill={glow ? COPPER_HI : COPPER} fillOpacity={glow ? 1 : 0.8} />
          <g fill={COPPER} fillOpacity="0.7">
            <circle cx="30" cy="29.5" r="1.4" />
            <circle cx="170" cy="29.5" r="1.4" />
          </g>
        </>
      ) : glow ? (
        <>
          <path d={`M34 29.5H${100 - half - 6}M${100 + half + 6} 29.5H166`} stroke={COPPER} strokeOpacity="0.5" strokeWidth="0.6" />
          <path d={cartouche(half, 0)} fill="#0b1115" stroke={COPPER} strokeOpacity="0.85" strokeWidth="0.8" />
          <path d={cartouche(half, 2.5)} fill="none" stroke={COPPER} strokeOpacity="0.35" strokeWidth="0.45" />
          <g fill={COPPER}>
            <path d={`M${100 - half - 6} 29.5L${100 - half - 3} 27L${100 - half} 29.5L${100 - half - 3} 32Z`} />
            <path d={`M${100 + half + 6} 29.5L${100 + half + 3} 27L${100 + half} 29.5L${100 + half + 3} 32Z`} />
            <circle cx="34" cy="29.5" r="1.2" />
            <circle cx="166" cy="29.5" r="1.2" />
          </g>
        </>
      ) : (
        <>
          <path d={`M30 29.5H${100 - half}M${100 + half} 29.5H170`} stroke={COPPER} strokeOpacity="0.45" strokeWidth="0.6" />
          <g fill={COPPER} fillOpacity="0.7">
            <circle cx="30" cy="29.5" r="1.2" />
            <circle cx="170" cy="29.5" r="1.2" />
          </g>
        </>
      )}
      {!compact && numeral ? (
        <text x="100" y="35" textAnchor="middle" fill={glow ? COPPER_HI : COPPER} fontFamily={SERIF} fontSize="16" fontWeight="400" letterSpacing="1.5">
          {numeral}
        </text>
      ) : null}

      {/* The plate. */}
      <path d={ARCH} fill="rgba(0,0,0,0.24)" />
      <g clipPath={`url(#${id}p)`}>{children}</g>
      <path d={ARCH} fill="none" stroke={COPPER} strokeOpacity={glow ? 0.7 : 0.45} strokeWidth={0.7 * k} />
      {lit ? <path d={ARCH_IN} fill="none" stroke={COPPER} strokeOpacity="0.3" strokeWidth={0.5 * k} /> : null}
      {glow ? (
        <>
          <path d="M96.6 49.8H103.4L102.4 55H97.6Z" fill={COPPER} />
          <circle cx="24" cy="128" r="1.6" fill={COPPER} />
          <circle cx="176" cy="128" r="1.6" fill={COPPER} />
        </>
      ) : null}

      {/* The foot: a hairline with one diamond per tier, then the name. */}
      <path d={`M34 ${footY}H${gapL}M${gapR} ${footY}H166`} stroke={COPPER} strokeOpacity="0.4" strokeWidth={0.6 * k} />
      <g fill={COPPER} fillOpacity={glow ? 1 : 0.8}>
        {pips.map((x) => (
          <path key={x} d={`M${x} ${footY - 3.4}L${x + 3.1} ${footY}L${x} ${footY + 3.4}L${x - 3.1} ${footY}Z`} />
        ))}
      </g>
      {!compact && name ? (
        <text
          x="100"
          y={(326 - (13.5 - size) * 0.35).toFixed(2)}
          textAnchor="middle"
          fill={COPPER_HI}
          fontFamily={SERIF}
          fontSize={size.toFixed(2)}
          fontWeight="400"
          letterSpacing="1.2"
          style={{ fontVariantCaps: "small-caps" }}
        >
          {name}
        </text>
      ) : null}
    </svg>
  );
}
