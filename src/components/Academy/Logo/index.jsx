import React from "react";

/**
 * The Academy lockup, and the mark on its own.
 *
 * Both are Keenan's Illustrator export, kept as delivered at
 * static/img/BrandAssets/Svg/Alchemix_Academy_01.svg and redrawn here as JSX
 * so the logo renders inline. Inline, it scales with the header it sits in and
 * uses the fonts the page has loaded, which an <img> of the file could not.
 *
 * ACADEMY is the one part of the export that is live type rather than an
 * outline. The file sets it in Reem Kufi Medium, which the site does not ship,
 * so the text carries a fallback and renders in Montserrat 500 at the same size
 * and tracking until the word is outlined in the source file. Nothing else here
 * depends on a font.
 */

const COPPER = "#f5c09a";

/* The circle mark, 45 units square, shared by both drawings. Hairline strokes
   as designed: at the header's size they come out a little under a pixel, the
   same weight the site logo's mark has in the docs navbar. */
function MarkPaths() {
  return (
    <g fill="none" stroke={COPPER} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22.5" cy="22.5" r="22" />
      <line x1="22.5" y1="28.8" x2="22.5" y2="44.4" />
      <line x1="22.5" y1=".5" x2="22.5" y2="5.1" />
      <polyline points="22.5 28.8 7.5 17 22.5 5.1 37.4 17 30.7 22.3" />
      <polyline points="35.1 29.9 37.4 28 37.4 17" />
      <polyline points="7.5 17 7.5 28 22.5 39.9 29.2 34.5" />
      <polyline points="10.1 30.1 7.6 34.5 15.7 34.5" />
      <polyline points="22.5 34.5 37.4 34.5 22.5 8.7 14.7 22.2" />
    </g>
  );
}

/** The mark, a rule, ALCHEMIX, and ACADEMY set beneath it. 259.2 by 50.8. */
export function AcademyLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 259.2 50.8" overflow="visible" aria-hidden="true" focusable="false">
      <MarkPaths />
      <line x1="54" y1=".4" x2="54" y2="44.4" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth=".5" />
      <g fill={COPPER}>
        <path d="M76.1.9h-.7l-10.8,24.8h4.3l2.4-6h8.4l2.3,6h4.8L76.2,1.1v-.2ZM72.8,15.9l2.8-6,2.7,6h-5.5Z" />
        <polygon points="97 .8 92.8 .8 92.8 25.6 108.9 25.6 108.9 21.5 97 21.5 97 .8" />
        <path d="M131,20.1c-.6.5-1.3.9-2.2,1.2h0c-.9.4-1.9.5-3.1.5s-3.1-.4-4.3-1.1c-1.2-.7-2.2-1.8-2.8-3-.7-1.3-1-2.8-1-4.4s.4-3.1,1.1-4.4c.7-1.3,1.7-2.3,2.9-3.1,1.2-.8,2.5-1.1,4-1.1s2.1.2,3,.6c.9.4,1.7.8,2.3,1.2l.4.3,1.7-4-.3-.2c-.8-.5-1.9-1-3.1-1.4-1.2-.4-2.6-.6-4.1-.6s-3.4.3-4.9,1c-1.5.6-2.8,1.6-3.9,2.7-1.1,1.2-2,2.5-2.6,4.1-.6,1.6-.9,3.3-.9,5.2s.3,3.3.9,4.8c.6,1.5,1.4,2.8,2.5,4,1.1,1.2,2.4,2.1,3.9,2.7,1.5.7,3.3,1,5.2,1,0,0,.2,0,.3,0,1,0,2-.1,2.9-.3,1-.3,1.8-.6,2.5-.9.7-.3,1.3-.7,1.7-.9l.3-.2-1.9-3.9-.4.3Z" />
        <polygon points="156.4 11.1 145 11.1 145 .8 140.8 .8 140.8 25.6 145 25.6 145 15.2 156.4 15.2 156.4 25.6 160.6 25.6 160.6 .8 156.4 .8 156.4 11.1" />
        <rect x="168.9" y=".8" width="16.4" height="4.1" />
        <polygon points="184 11.2 168.9 11.2 168.9 15.3 182.1 15.3 184 11.2" />
        <rect x="168.9" y="21.5" width="16.8" height="4.1" />
        <polygon points="206.3 16.9 194.7 .8 194.1 .8 194.1 25.6 198.2 25.6 198.2 12.5 206 23.1 206.4 23.1 214.5 12 214.5 25.6 218.6 25.6 218.6 .8 218 .8 206.3 16.9" />
        <rect x="226.7" y=".8" width="4.2" height="24.8" />
        <polygon points="251.1 13.1 258.9 .8 253.8 .8 248.8 9.4 243.2 .8 237.9 .8 245.7 12.9 237.6 25.6 242.8 25.6 248.1 16.6 253.9 25.6 259.2 25.6 251.1 13.1" />
      </g>
      <text
        x="64.6"
        y="44.4"
        fill="#fff"
        fontFamily='"Reem Kufi", ReemKufi-Medium, Montserrat, sans-serif'
        fontSize="15.8"
        fontWeight="500"
        letterSpacing=".2em"
      >
        ACADEMY
      </text>
    </svg>
  );
}

/** The mark alone, for a header that has to share its row. 45 by 45. */
export function AcademyMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 45 45" overflow="visible" aria-hidden="true" focusable="false">
      <MarkPaths />
    </svg>
  );
}
