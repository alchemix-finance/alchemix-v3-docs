import React from "react";

/**
 * The two logo slots in the members area, kept in one file so a final file
 * can drop in without touching the pages.
 *
 * HEADER_LOGO_SRC  the header logo. Waiting on the coworker's file (plan item
 *                  14). Null draws the lockup alchemix.fi uses in its header
 *                  (mark and ALCHEMIX wordmark, the same paths, in
 *                  currentColor so it takes the copper token).
 * CENTER_LOGO_SRC  the logo at the center of the hero graphic (plan item 13).
 *                  Null draws the Alchemix mark inline on a filled disc.
 *
 * To swap either one: put the SVG in static/img/members/ and set the path
 * here, for example "/img/members/header-logo.svg". Nothing else changes.
 * The header slot is 2rem tall (phones show the mark alone at 1.75rem) and
 * the image keeps its own aspect ratio. (static/img/logo.svg is the stock Docusaurus logo, not
 * the Alchemix one, so it is not used.)
 */
export const HEADER_LOGO_SRC = null;
export const CENTER_LOGO_SRC = null;

/** The header logo slot. `word` is the area name set beside the logo. */
export function HeaderLogo({ styles, word }) {
  return (
    <span className={styles.logoSlot} data-slot="header-logo">
      {HEADER_LOGO_SRC ? (
        <img src={HEADER_LOGO_SRC} alt="Alchemix" className={styles.logoImage} />
      ) : (
        <>
          <AlchemixLockup className={styles.lockup} />
          <AlchemixMark className={styles.logoMark} />
        </>
      )}
      {word ? (
        <>
          <span className={styles.brandRule} aria-hidden="true" />
          <span className={styles.brandWord}>{word}</span>
        </>
      ) : null}
    </span>
  );
}

/* The mark's strokes in its 61 unit box, as the alchemix.fi header draws it. */
const MARK_PATHS = [
  "M30.39 60.03C46.76 60.03 60.03 46.76 60.03 30.39C60.03 14.02 46.76 0.75 30.39 0.75C14.02 0.75 0.75 14.02 0.75 30.39C0.75 46.76 14.02 60.03 30.39 60.03Z",
  "M30.39 38.97V60.04",
  "M30.39 0.75V6.99",
  "M30.39 38.97L10.19 22.98L30.39 6.99L50.59 22.98L41.57 30.12",
  "M47.49 40.37L50.59 37.92V22.98",
  "M10.19 22.98V37.92L30.39 53.9L39.51 46.69",
  "M13.74 40.72L10.29 46.69H21.28",
  "M30.39 46.69H50.5L30.39 11.87L19.88 30.07",
];

function MarkStrokes({ width = 2, className }) {
  return (
    <g className={className} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} pathLength={1} />
      ))}
    </g>
  );
}

/** The mark on its own, for phones where the lockup does not fit. */
export function AlchemixMark({ className }) {
  return (
    <svg className={className} viewBox="-0.5 -0.5 62 62" role="img" aria-label="Alchemix" focusable="false">
      <MarkStrokes width={2.4} />
    </svg>
  );
}

/** The Alchemix lockup from the alchemix.fi header, 358 by 61. */
export function AlchemixLockup({ className }) {
  return (
    <svg className={className} viewBox="0 0 358 61" role="img" aria-label="Alchemix" focusable="false">
      <g fill="currentColor">
        <path d="M249.76 12.18H225.81V18.2H249.76V12.18Z" />
        <path d="M247.84 27.32H225.81V33.34H245.01L247.84 27.32Z" />
        <path d="M250.43 42.45H225.81V48.47H250.43V42.45Z" />
        <path d="M89.88 12.25H88.85L73.04 48.53H79.26L82.84 39.78H95.2L98.63 48.53H105.68L90.02 12.59L89.87 12.25H89.88ZM85.07 34.34L89.15 25.5L93.06 34.34H85.07Z" />
        <path d="M120.42 12.12H114.3V48.54H137.92V42.48H120.42V12.12Z" />
        <path d="M170.33 40.35C169.5 41.03 168.41 41.64 167.09 42.17C165.78 42.69 164.24 42.96 162.5 42.96C160.08 42.96 157.94 42.41 156.16 41.33C154.37 40.25 152.98 38.75 152 36.87C151.02 34.98 150.53 32.8 150.53 30.4C150.53 28 151.07 25.88 152.14 24C153.21 22.11 154.66 20.58 156.44 19.47C158.21 18.36 160.17 17.8 162.26 17.8C163.87 17.8 165.34 18.08 166.65 18.63C167.99 19.2 169.13 19.8 170.04 20.43L170.61 20.83L173.13 14.96L172.71 14.7C171.47 13.93 169.94 13.24 168.15 12.64C166.34 12.04 164.31 11.73 162.11 11.73C159.51 11.73 157.08 12.21 154.88 13.14C152.69 14.08 150.76 15.41 149.15 17.1C147.54 18.79 146.28 20.81 145.4 23.09C144.52 25.37 144.07 27.91 144.07 30.64C144.07 33.11 144.49 35.47 145.33 37.65C146.17 39.84 147.4 41.81 148.99 43.5C150.58 45.19 152.52 46.54 154.77 47.51C157.01 48.48 159.58 48.99 162.4 49.02C162.54 49.02 162.67 49.02 162.81 49.02C164.33 49.02 165.76 48.85 167.07 48.51C168.49 48.14 169.74 47.7 170.79 47.18C171.83 46.67 172.65 46.22 173.22 45.85L173.64 45.58L170.91 39.89L170.35 40.35H170.33Z" />
        <path d="M207.46 27.25H190.75V12.12H184.63V48.54H190.75V33.26H207.46V48.54H213.63V12.12H207.46V27.25Z" />
        <path d="M280.46 35.7L263.52 12.12H262.62V48.54H268.59V29.23L280.05 44.86H280.72L292.46 28.49V48.54H298.58V12.12H297.63L280.46 35.7Z" />
        <path d="M316.52 12.18H310.4V48.53H316.52V12.18Z" />
        <path d="M346.13 30.13L357.51 12.18H350.11L342.69 24.82L334.54 12.18H326.86L338.17 29.82L326.39 48.54H333.93L341.68 35.3L350.17 48.54H358L346.13 30.13Z" />
      </g>
      <MarkStrokes />
    </svg>
  );
}

/**
 * The logo at the center of the hero graphic, drawn inside an SVG at (cx, cy):
 * the Alchemix mark in copper on a filled disc, as the mark files in
 * static/img/BrandAssets/Svg have it.
 */
export function CenterLogo({ cx, cy, size, strokeClass }) {
  const x = cx - size / 2;
  const y = cy - size / 2;
  if (CENTER_LOGO_SRC) {
    return <image href={CENTER_LOGO_SRC} x={x} y={y} width={size} height={size} />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={size * 0.64} style={{ fill: "var(--m-ground)" }} />
      <circle cx={cx} cy={cy} r={size * 0.64} style={{ fill: "var(--m-copper-fill)" }} />
      <svg x={x} y={y} width={size} height={size} viewBox="-0.5 -0.5 62 62" overflow="visible" style={{ color: "var(--m-copper)" }}>
        <MarkStrokes width={1.4} className={strokeClass} />
      </svg>
    </g>
  );
}
