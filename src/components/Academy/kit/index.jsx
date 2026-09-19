import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../lesson.module.css";
import parts from "../parts.module.css";
import { fetchChallenge, saveCompletion, submitAnswer } from "../lib/api";
import useElementWidth from "../lib/useElementWidth";
import LocalNotice from "../LocalNotice";

/**
 * Shared parts every lesson is built from.
 *
 * Every lesson repeats the same three-stage shape, so the shape lives here and a
 * lesson supplies only what is different about it: the situation it sets up, the
 * model it lets you push on, and the question its checkpoint asks.
 *
 * The checkpoint also carries error states, expiry handling and completion
 * storage. Thirteen hand-written copies of that would drift apart.
 */

/* ── Typography and layout ───────────────────────────────── */

export function Stage({ eyebrow, headline, children }) {
  return (
    <>
      <div className={styles.eyebrow}>{eyebrow}</div>
      {headline ? <h1 className={styles.headline}>{headline}</h1> : null}
      {children}
    </>
  );
}

export const Sub = ({ children }) => <p className={styles.sub}>{children}</p>;
export const Hint = ({ children }) => <p className={styles.hint}>{children}</p>;

export function Panel({ children }) {
  return (
    <div className={styles.panel}>
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />
      {children}
    </div>
  );
}

export const Question = ({ children }) => <div className={styles.question}>{children}</div>;

export function Actions({ children, aside }) {
  return (
    <div className={styles.actions}>
      {children}
      {aside ? <span className={styles.aside}>{aside}</span> : null}
    </div>
  );
}

export function Primary({ onClick, disabled, children }) {
  return (
    <button type="button" className={styles.primary} onClick={onClick} disabled={disabled}>
      {children}
      <Arrow />
    </button>
  );
}

export function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * The panel that answers the stage's question.
 *
 * Two columns on anything wider than a tablet: the verdict and the button that
 * follows it on the left, the explanation on the right. The panel is as wide as
 * the lab, and a single column of prose inside it stopped at about two thirds
 * of that and left the rest of the box empty. Splitting it fills the box and
 * shortens the line at the same time.
 *
 * The children are written head, body, button so the one-column layout on a
 * phone reads in that order; the grid areas do the swapping.
 */
export function Reveal({ title, children, onNext, nextLabel }) {
  return (
    <div className={styles.reveal}>
      <div className={`${styles.resultHead} ${styles.revealHead}`}>{title}</div>
      <div className={styles.resultText}>{children}</div>
      {onNext ? (
        <div className={styles.resultAct}>
          <Primary onClick={onNext}>{nextLabel}</Primary>
        </div>
      ) : null}
    </div>
  );
}

export const Body = ({ children }) => <p className={styles.revealBody}>{children}</p>;

/**
 * The sentence a reveal opens on: what the learner said, before what is true.
 *
 * Stage one exists to get a commitment out of the learner before the answer
 * arrives, and eight labs used to state the answer without acknowledging the
 * commitment. That left the learner to remember their own number to find out
 * whether they had been wrong, which is the one thing the prediction was for.
 *
 * `within` is how close counts as close, in whatever units the guess is in.
 * Worth saying, because these sliders are coarse and an exact hit is often not
 * on offer.
 */
export function said(guess, truth, format = (v) => String(v), within = 0) {
  if (guess === truth) return `You said ${format(guess)}, which is exactly it. `;
  if (within > 0 && Math.abs(guess - truth) <= within) {
    return `You said ${format(guess)}, which is close. `;
  }
  return `You said ${format(guess)}. `;
}

export function Readout({ children }) {
  return <div className={styles.readout}>{children}</div>;
}

/* ── Controls ────────────────────────────────────────────── */

export function GuessSlider({ label, value, onChange, disabled, color, min = 0, max = 100, step = 1, format, scale }) {
  return (
    <div>
      <div className={styles.guessHead}>
        <span className={styles.microLabel}>{label}</span>
        <span className={styles.guessValue} style={{ color }}>
          {format ? format(value) : `${value}%`}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={color ? { accentColor: color } : undefined}
        aria-label={label}
      />
      {scale ? (
        <div className={styles.guessScale}>
          <span>{scale[0]}</span>
          <span>{scale[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

export function Control({ label, display, min, max, step, value, onChange, verdict, accent, tone }) {
  return (
    <div className={`${styles.control} ${accent ? styles.controlAccent : ""}`}>
      <div className={styles.controlHead}>
        <span className={styles.microLabel}>{label}</span>
        <span className={styles.controlValue} style={tone ? { color: tone } : undefined}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={tone ? { accentColor: tone } : undefined}
        aria-label={label}
      />
      {verdict !== undefined ? (
        <div className={accent ? styles.verdictOn : styles.verdictOff}>{verdict ?? " "}</div>
      ) : null}
    </div>
  );
}

export const Controls = ({ children }) => <div className={styles.controls}>{children}</div>;

/* ── Setup display ───────────────────────────────────────── */

export function SetupGrid({ children }) {
  return <div className={styles.setupGrid}>{children}</div>;
}

export function SetupCard({ name, color, stats }) {
  return (
    <div className={styles.setupCard}>
      {name ? (
        <div className={styles.setupName}>
          <span className={styles.setupDot} style={{ background: color }} />
          <span style={{ color }}>{name}</span>
        </div>
      ) : null}
      <div className={styles.setupStats}>
        {stats.map((s) => (
          <div key={s.label}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue} style={s.color ? { color: s.color } : undefined}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Formatting ──────────────────────────────────────────── */

export const money = (n) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export const money2 = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatByUnit(value, unit) {
  if (value == null || !Number.isFinite(value)) return "-";
  if (unit === "amount") return money(value);
  return `${value.toFixed(unit === "apr" ? 2 : 1)}%`;
}

/** The alAsset a deposit asset borrows: alUSD against USDC, alETH against ETH. */
export function alAssetOf(asset = "USDC") {
  return /eth/i.test(String(asset)) ? "alETH" : "alUSD";
}

/** An amount in the deposit asset's own units: whole dollars, or ETH to four places. */
export function assetAmount(n, asset = "USDC") {
  if (n == null || !Number.isFinite(n)) return "-";
  return n.toLocaleString("en-US", { maximumFractionDigits: /eth/i.test(String(asset)) ? 4 : 0 });
}

/* ── Flow steps ──────────────────────────────────────────── */

/**
 * A left-to-right run of numbered stops with arrows between them.
 *
 * Takes three to five steps as `{ n, label, value, note, tone }`. `n` defaults
 * to the step's position. The grid classes carry the column template for each
 * count and collapse into one column on phones, where the arrows turn to point
 * down.
 */
export function FlowSteps({ steps }) {
  const count = steps.length;
  const cls = count === 4 ? parts.flow4 : count === 5 ? parts.flow5 : parts.flow;
  // Two stops, or more than five, are not in the stylesheet; build the template.
  const style =
    count >= 3 && count <= 5
      ? undefined
      : { gridTemplateColumns: Array.from({ length: count }, () => "1fr").join(" auto ") };

  return (
    <div className={cls} style={style}>
      {steps.map((s, i) => (
        <React.Fragment key={s.key ?? `${i}-${s.label ?? ""}`}>
          {i > 0 ? <FlowArrow /> : null}
          <FlowStep n={s.n ?? i + 1} label={s.label} value={s.value} note={s.note} tone={s.tone} />
        </React.Fragment>
      ))}
    </div>
  );
}

export function FlowStep({ n, label, value, note, tone }) {
  return (
    <div className={parts.step}>
      <div className={parts.stepNum}>{n}</div>
      <div className={parts.stepLabel}>{label}</div>
      <div className={parts.stepValue} style={tone ? { color: tone } : undefined}>{value}</div>
      {note ? <div className={parts.stepNote}>{note}</div> : null}
    </div>
  );
}

export function FlowArrow() {
  return (
    <svg className={parts.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,192,154,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── The app, inline ─────────────────────────────────────── */

/**
 * A detail of the real app, cropped out of a full screen capture.
 *
 * Every lesson already ends with the whole screen it is about. This is the
 * other half of that: the one control or one stat the learner is pushing on
 * right now, beside the model of it, so the slider they just moved has a face
 * in the app.
 *
 * A crop is a fraction of the capture ({ x, y, w, h }, all 0 to 1). The frame
 * takes its aspect ratio from the crop against the file's own pixel size, and
 * the image inside is blown up to 1/w of the frame and shifted into place, so
 * no files had to be re-cut and a crop can be nudged by editing four numbers.
 */
function cropStyle(shot) {
  const [W, H] = shot.size;
  const c = shot.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  return {
    frame: { aspectRatio: `${(c.w * W) / (c.h * H)}` },
    img: {
      width: `${100 / c.w}%`,
      left: `${(-c.x / c.w) * 100}%`,
      top: `${(-c.y / c.h) * 100}%`,
    },
  };
}

/**
 * The frame every app image in the academy sits in.
 *
 * One treatment for all of them, whether it is a cropped detail beside the
 * control it explains or the whole screen at the foot of a lesson. The geometry
 * is in fixed pixels rather than percentages, which is the reason the frame is
 * drawn here instead of being a border on the image: the corner marks then read
 * the same on a wide thin strip and on a tall panel, and a page of screenshots
 * at six different aspect ratios still looks like one set.
 *
 * The docs do this too, in their own palette (`src/components/FramedImage`).
 * Same idea, different marks: rules that overhang the picture at every corner,
 * and a dot where they cross.
 */
function Frame({ children }) {
  return (
    <div className={parts.figFrame}>
      <span className={parts.figMat} aria-hidden="true" />
      <span className={`${parts.figRule} ${parts.figTop}`} aria-hidden="true" />
      <span className={`${parts.figRule} ${parts.figBottom}`} aria-hidden="true" />
      <span className={`${parts.figUpright} ${parts.figLeft}`} aria-hidden="true" />
      <span className={`${parts.figUpright} ${parts.figRight}`} aria-hidden="true" />
      <span className={`${parts.figDot} ${parts.figTl}`} aria-hidden="true" />
      <span className={`${parts.figDot} ${parts.figTr}`} aria-hidden="true" />
      <span className={`${parts.figDot} ${parts.figBl}`} aria-hidden="true" />
      <span className={`${parts.figDot} ${parts.figBr}`} aria-hidden="true" />
      {children}
    </div>
  );
}

/**
 * One caption shape for every figure: a label, then what to look at.
 *
 * Always under the picture. The crops used to sit in a two-column figure with
 * the caption beside them, which gave the academy two different-looking figures
 * on the same page depending on how wide the crop was.
 */
function Caption({ label, children }) {
  return (
    <figcaption className={parts.figCap}>
      <span className={parts.figLabel}>{label}</span>
      {children ? <span className={parts.figText}>{children}</span> : null}
    </figcaption>
  );
}

export function AppShot({ shot, label = "In the app", children }) {
  const { frame, img } = cropStyle(shot);

  return (
    <figure
      className={parts.fig}
      style={shot.max ? { "--fig-max": `${shot.max}rem` } : undefined}
    >
      <Frame>
        <div className={parts.figWindow} style={frame}>
          <img className={parts.figCrop} style={img} src={shot.src} alt={shot.alt} loading="lazy" />
        </div>
      </Frame>
      <Caption label={label}>{children}</Caption>
    </figure>
  );
}

/**
 * A whole capture rather than a crop of one, in the same frame.
 *
 * What the foot of a lesson shows: the entire screen the lesson is about, after
 * the crops have pointed at the parts of it. `max` caps the figure for a capture
 * narrower than the column, so it is never blown up past its own resolution.
 */
export function ScreenShot({ src, alt, max, label = "The whole screen, in the app", children }) {
  return (
    <figure className={parts.fig} style={max ? { "--fig-max": `${max}rem` } : undefined}>
      <Frame>
        <div className={parts.figWindow}>
          <img className={parts.figWhole} src={src} alt={alt} loading="lazy" />
        </div>
      </Frame>
      <Caption label={label}>{children}</Caption>
    </figure>
  );
}

/**
 * The crops the lessons use, with the pixel size of each capture beside it.
 *
 * Every file here was checked against the live app: the older captures in
 * static/img predate the navigation rename and none of them is used. The
 * `academy-*.png` files are 2x captures of the screens that need no wallet,
 * taken headless in dark mode by `scripts/capture-app-screens.mjs`; the rest
 * are 1x captures of a real position. Every crop keeps a margin around the
 * element it shows, so a card's own border and corners sit inside the window
 * rather than on its edge. The
 * screens are the ETH market, so a caption describes the screen rather than
 * claiming it is the learner's own position.
 */
const STATS = [1610, 591];

/** One stat tile on a vault, by column and row of the app's four-by-two grid. */
const tile = (col, row) => ({
  // 16px of the surrounding panel on every side, so the tile's own border
  // and rounded corners are inside the window rather than on its edge.
  x: ([48, 432, 815, 1197][col] - 16) / STATS[0],
  y: ([140, 268][row] - 16) / STATS[1],
  w: (366 + 32) / STATS[0],
  h: (118 + 32) / STATS[1],
});

export const SHOTS = {
  depositBorrow: {
    src: "/img/quick-start-02.png",
    size: [1872, 966],
    crop: { x: 0.203, y: 0.5135, w: 0.2991, h: 0.4803 },
    max: 22,
    alt: "The Deposit/Borrow tab: a field for the asset you are depositing above a field for the alAsset you are borrowing, then a Deposit button",
  },
  vaultCard: {
    src: "/img/academy-borrow.png",
    size: [3200, 2500],
    crop: { x: 0.0944, y: 0.382, w: 0.8113, h: 0.2036 },
    alt: "A vault card on the Borrow page: its name, APR and deposit cap, then total deposits, total debt, earmarked, and LTV 90.00%",
  },
  redemptionRate: {
    src: "/img/borrowing-in-alchemix-02.png",
    size: STATS,
    crop: tile(1, 1),
    max: 21,
    alt: "The Redemption Rate stat on a vault, reading 58.61%",
  },
  depositCap: {
    src: "/img/academy-borrow.png",
    size: [3200, 2500],
    crop: { x: 0.1766, y: 0.416, w: 0.2559, h: 0.1344 },
    max: 22,
    alt: "The left of a vault card on the Borrow page: its APR over a bar showing how full its deposit cap is",
  },
  healthFactor: {
    src: "/img/borrowing-in-alchemix-02.png",
    size: STATS,
    crop: tile(3, 0),
    max: 21,
    alt: "The Health Factor stat on a vault, reading 3.00",
  },
  ltv: {
    src: "/img/borrowing-in-alchemix-02.png",
    size: STATS,
    crop: tile(3, 1),
    max: 21,
    alt: "The LTV stat on a vault, reading 30.00 out of 90.00%",
  },
  positionBar: {
    src: "/img/borrowing-in-alchemix-02.png",
    size: STATS,
    crop: { x: 0.0161, y: 0.7411, w: 0.9677, h: 0.1997 },
    alt: "A vault's bar, split into deposit, debt and earmarked, with MAX LTV and LIQ LTV marked near the right end",
  },
  repayTab: {
    src: "/img/repay-loan-01.png",
    size: [2038, 1270],
    crop: { x: 0.1727, y: 0.5276, w: 0.3248, h: 0.222 },
    max: 24,
    alt: "The Repay tab on a vault, with an amount field and a Repay button",
  },
  withdrawTab: {
    src: "/img/withdraw-02.png",
    size: [2060, 1239],
    crop: { x: 0.1845, y: 0.5246, w: 0.3155, h: 0.226 },
    max: 24,
    alt: "The Withdraw tab on a vault, showing the amount available and a MAX button",
  },
  fixedYieldCard: {
    src: "/img/academy-fixed-yield.png",
    size: [3200, 2500],
    crop: { x: 0.0944, y: 0.3712, w: 0.8113, h: 0.2252 },
    alt: "A card on the Fixed Yield page: projected fixed APR, deposit cap, term, early exit fee, maturity date and the alUSD price it quotes against",
  },
  alAssetPrice: {
    src: "/img/academy-fixed-yield.png",
    size: [3200, 2500],
    crop: { x: 0.3719, y: 0.394, w: 0.1938, h: 0.18 },
    max: 20,
    alt: "The detail panel of a Fixed Yield card: the maturity date, the alUSD price it is quoting, and the fields that fill in once you enter an amount",
  },
  fixedPositions: {
    src: "/img/redeem-alassets-02.png",
    size: [1557, 506],
    crop: { x: 0.0424, y: 0.0909, w: 0.9159, h: 0.8221 },
    alt: "Open Fixed Yield positions, each with the APR it locked in, its end date, the alETH deposited, and the profit standing on it",
  },
  visualizerOut: {
    src: "/img/academy-visualizer.png",
    size: [1336, 1470],
    crop: { x: 0.0449, y: 0.8163, w: 0.9132, h: 0.0884 },
    alt: "What the Visualizer reports under its chart: loan cost, aggregate yield, and projected profit",
  },
  strategies: {
    src: "/img/academy-vault-info.png",
    size: [1336, 1160],
    crop: { x: 0.0299, y: 0.0431, w: 0.9431, h: 0.5086 },
    alt: "The Info tab on a vault, listing each strategy with its risk level, APR and allocation",
  },
};

/* ── Position card ───────────────────────────────────────── */

const TONE = { ok: "#5ba88a", cap: "#d4952a", liq: "#d4645a" };

/** 0.9 -> "90%", 0.855 -> "85.5%". Trailing zeros dropped, so markers read clean. */
const markPct = (x) => `${+(x * 100).toFixed(1)}%`;

/**
 * The position card, drawn the way the app draws it.
 *
 * Deposited, Borrowed, LTV, a health bar with the borrowing cap and the
 * liquidation threshold marked on it, and whether the deposit is still earning.
 * The same card carries one position across the beginner track, so each lesson
 * changes a prop or two and the learner watches the same object move.
 *
 * Earmarked and Health Factor are opt-in, because the app shows both on every
 * position and this card used to show neither. `earmarked` draws the slice of
 * the debt already set aside for the next redemption, as a lighter band inside
 * the fill, and adds it as a stat; the LTV reading is unaffected, since
 * earmarked debt is debt. `showHealth` adds the Health Factor, which is the
 * distance to the borrowing cap written as a multiple: 3.00 at 30% against a
 * 90% cap, 1.00 at the cap itself, and unbounded with no debt at all.
 *
 * How a loss of backing is drawn. The docs describe the app's bar this way: if
 * MYT records a loss, the Liq marker slides left. This card does the same. The
 * fill and the LTV figure stay at borrowed / deposited, and the liquidation
 * marker moves to liqLtv x (1 - backingLoss), which is the starting LTV that a
 * loss of that size liquidates (the same rule the ltv-and-risk grader uses).
 * The effective LTV, borrowed / (deposited x (1 - backingLoss)), is what the
 * color state is judged on, so the marker crossing the fill and the bar turning
 * red always happen together. While a loss is applied the LTV stat shows that
 * effective figure on a second line, so the number and the marker agree. The
 * cap marker stays where it is: it is a borrowing rule, and this card does not
 * model borrowing room after a loss.
 *
 * Colors: green under the cap, amber at the cap, red past the liquidation
 * threshold. `highlight` puts the copper accent on one stat ("deposited",
 * "borrowed" or "ltv"). `note` is one short line under the card.
 */
export function PositionCard({
  deposited,
  borrowed = 0,
  earmarked = 0,
  /**
   * The protocol's redemption rate, as a decimal, when a lesson is teaching it.
   * The app prints this on every vault and the card used to leave it out, which
   * made "the balance falls" a claim with no number behind it.
   */
  redemption = null,
  asset = "USDC",
  capLtv = 0.9,
  liqLtv = 0.95,
  backingLoss = 0,
  earning = true,
  showHealth = false,
  /**
   * Which threshold markers the bar is allowed to draw: "all", "cap", or "none".
   *
   * A card that always drew both put "Liquidation 95%" in front of a beginner on
   * lesson 2, three lessons before anything explains it, on a position with no
   * debt. A lesson shows the markers it has taught and no others.
   */
  marks = "all",
  /** Off until a lesson has said what the ratio is. Same reason as `marks`. */
  showLtv = true,
  highlight = null,
  note = null,
  compact = false,
  label = null,
}) {
  const dep = Math.max(Number(deposited) || 0, 0);
  const debt = Math.max(Number(borrowed) || 0, 0);
  const mark = Math.min(Math.max(Number(earmarked) || 0, 0), debt);
  const loss = Math.min(Math.max(Number(backingLoss) || 0, 0), 0.99);

  const ltv = dep > 0 ? debt / dep : 0;
  const effective = dep > 0 ? debt / (dep * (1 - loss)) : 0;
  const liqAt = liqLtv * (1 - loss);
  // Reads the way the app prints it: a multiple of the borrowing cap, and the
  // infinity glyph rather than a number once there is no debt to measure.
  const health = debt > 0 ? capLtv / ltv : Infinity;

  const state = effective >= liqLtv - 1e-9 ? "liq" : ltv >= capLtv - 1e-9 ? "cap" : "ok";
  const tone = TONE[state];
  const al = alAssetOf(asset);
  const earningText = earning === true ? "Still earning" : earning;

  const clamp = (x) => Math.min(Math.max(x, 0), 1) * 100;
  // A tag hangs to the left of its marker, since both markers live near the
  // right end. A marker that has slid far left flips its tag to the other side.
  const tagSide = (x) => (x < 0.3 ? parts.cardTagFlip : "");

  const stat = (key, text, value, valueTone, sub) => {
    const on = highlight === key;
    return (
      <div className={`${parts.cardStat} ${on ? parts.cardStatOn : ""}`}>
        <div className={parts.cardStatLabel}>{text}</div>
        <div className={parts.cardStatValue} style={{ color: valueTone ?? (on ? "#f5c09a" : undefined) }}>
          {value}
        </div>
        {sub ? <div className={parts.cardStatSub}>{sub}</div> : null}
      </div>
    );
  };

  const showCap = marks === "all" || marks === "cap";
  const showLiq = marks === "all";
  // With no markers and no debt there is nothing for the bar to say, so the card
  // drops it rather than drawing an empty track.
  const showBar = showCap || showLiq || debt > 0;

  // The label describes what is actually drawn. Announcing a liquidation
  // threshold the bar is not showing would put the term back in front of a
  // learner using a screen reader.
  const barLabel =
    `LTV ${markPct(ltv)}.` +
    (showCap ? ` Borrowing cap ${markPct(capLtv)}.` : "") +
    (showLiq
      ? ` Liquidation ${markPct(liqAt)}${
          loss > 0 ? `, after a ${markPct(loss)} loss of backing` : ""
        }.`
      : "") +
    (loss > 0 ? ` Effective LTV ${markPct(effective)}.` : "") +
    (mark > 0 ? ` ${markPct(dep > 0 ? mark / dep : 0)} of the deposit is earmarked.` : "");

  return (
    <div className={`${parts.card} ${compact ? parts.cardCompact : ""}`}>
      <div className={parts.cardHead}>
        <div className={parts.cardHeadLeft}>
          <span className={parts.cardLabel}>{label ?? "Your position"}</span>
          {loss > 0 ? <span className={parts.cardLoss}>Backing down {markPct(loss)}</span> : null}
        </div>
        {earningText ? (
          <span className={parts.cardEarning}>
            <span className={parts.cardEarningDot} />
            {earningText}
          </span>
        ) : null}
      </div>

      <div className={parts.cardStats}>
        {stat("deposited", "Deposited", (
          <>
            {assetAmount(dep, asset)}
            <span className={parts.cardUnit}>{asset}</span>
          </>
        ))}
        {stat("borrowed", "Borrowed", (
          <>
            {assetAmount(debt, asset)}
            <span className={parts.cardUnit}>{al}</span>
          </>
        ))}
        {mark > 0
          ? stat("earmarked", "Earmarked", (
              <>
                {assetAmount(mark, asset)}
                <span className={parts.cardUnit}>{al}</span>
              </>
            ), "#8ea9d8")
          : null}
        {redemption != null
          ? stat("redemption", "Redemption rate", `${+(redemption * 100).toFixed(1)}%`, "#8ea9d8")
          : null}
        {showHealth
          ? stat(
              "health",
              "Health factor",
              Number.isFinite(health) ? health.toFixed(2) : "∞",
              state === "ok" && highlight === "health" ? "#f5c09a" : tone,
            )
          : null}
        {/* The LTV figure keeps its state color even when highlighted; a warning
            should not be painted over by the accent. */}
        {showLtv
          ? stat(
              "ltv",
              "LTV",
              `${(ltv * 100).toFixed(1)}%`,
              state === "ok" && highlight === "ltv" ? "#f5c09a" : tone,
              loss > 0 ? `Effective ${(effective * 100).toFixed(1)}%` : null,
            )
          : null}
      </div>

      {showBar ? (
      <div className={parts.cardBar}>
        <div className={parts.cardTrack} role="img" aria-label={barLabel}>
          <span
            className={`${parts.cardFill} ${state === "cap" ? parts.cardFillCap : state === "liq" ? parts.cardFillLiq : ""}`}
            style={{ width: `${clamp(ltv)}%` }}
          />
          {/* Earmarked debt is drawn at the leading edge of the fill, which is
              where the next redemption takes it from. It is a band inside the
              debt rather than beside it, because it is already counted in the
              LTV the fill measures. */}
          {mark > 0 ? (
            <span
              className={parts.cardEarmark}
              style={{
                left: `${clamp(ltv - mark / (dep || 1))}%`,
                width: `${clamp(mark / (dep || 1))}%`,
              }}
            />
          ) : null}
          {showCap ? (
            <span className={`${parts.cardMark} ${parts.cardMarkCap} ${tagSide(capLtv)}`} style={{ left: `${clamp(capLtv)}%` }}>
              <span className={parts.cardTag}>Cap {markPct(capLtv)}</span>
            </span>
          ) : null}
          {showLiq ? (
            <span className={`${parts.cardMark} ${parts.cardMarkLiq} ${tagSide(liqAt)}`} style={{ left: `${clamp(liqAt)}%` }}>
              <span className={parts.cardTag}>Liquidation {markPct(liqAt)}</span>
            </span>
          ) : null}
        </div>
      </div>
      ) : null}

      {mark > 0 ? (
        <div className={parts.cardKey}>
          <span className={parts.cardKeyItem}>
            <span className={parts.cardKeyDotDebt} />
            Borrowed
          </span>
          <span className={parts.cardKeyItem}>
            <span className={parts.cardKeyDotMark} />
            Earmarked for the next redemption
          </span>
        </div>
      ) : null}

      {note ? <div className={parts.cardNote}>{note}</div> : null}
    </div>
  );
}

/* ── Checkpoint ──────────────────────────────────────────── */

const KEYS = ["A", "B", "C", "D", "E"];

/**
 * The graded stage.
 *
 * The engine decides what kind of question a lesson asks. Its `controls` carry
 * either a slider (`{ slider: { min, max, step } }`) or a list of statements
 * (`{ choices: string[] }`), and this renders whichever arrives. A slider
 * lesson supplies how the value is read (`computeOf`) and what it is measured
 * against (`targetOf`). A choice lesson supplies neither.
 *
 * Choice options arrive in this learner's order and the answer goes back as the
 * index picked. Which option is right is never known here, so grading stays on
 * the server.
 *
 * A miss ends the question. The learner reads why the option they picked is
 * wrong, and the next attempt draws a different variant from the bank. Leaving
 * the same four options on screen made the checkpoint answerable by elimination,
 * and handed over an explanation on every attempt while it happened. The numeric
 * checkpoints already worked this way.
 */
export function Checkpoint({
  base,
  lessonId,
  done,
  onPass,
  headline,
  targetOf,
  computeOf,
  unit,
  /* When the slider IS the answer (computeOf is the identity), showing the
     target card would print the solution. `direct` hides the compare cards,
     and a miss reveals the target but swaps the figures before the retry. */
  direct = false,
  controlLabel,
  controlDisplay = (v) => String(v),
  targetFoot,
  landingFoot = "adjust until the two match",
  /* Beginner lessons label this stage "Check". */
  stageLabel = "Checkpoint",
  passTitle,
  passBody,
  children,
}) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Ask for a question, optionally excluding the variant just missed.
   *
   * A choice checkpoint passes the variant it is holding, so a miss costs the
   * learner the question rather than one of four options.
   */
  const load = useCallback(
    (avoid) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setPicked(null);
      fetchChallenge(base, lessonId, avoid)
        .then((c) => {
          setChallenge(c);
          const s = c.controls?.slider;
          setValue(s ? s.min + (s.max - s.min) / 2 : 0);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [base, lessonId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const fields = challenge?.params?.fields;
  const target = useMemo(() => (fields && targetOf ? targetOf(fields) : null), [fields, targetOf]);
  const landing = useMemo(
    () => (fields && computeOf ? computeOf(fields, value) : null),
    [fields, value, computeOf],
  );

  const isChoice = Array.isArray(challenge?.controls?.choices);

  async function onSubmit() {
    if (isChoice && picked == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswer(base, {
        challenge: challenge.challenge,
        params: challenge.params,
        answer: isChoice ? picked : value,
      });
      setResult(res);
      if (res.passed && res.completion) {
        saveCompletion(lessonId, res.completion);
        onPass();
      }
    } catch (e) {
      setError(e.message);
      // An expired challenge is the common case, and it is recoverable.
      if (e.code === "bad_challenge") load();
    } finally {
      setSubmitting(false);
    }
  }

  const eyebrow = `Stage 3 · ${stageLabel}`;

  if (loading) {
    return (
      <Stage eyebrow={eyebrow}>
        <Sub>Your question is loading.</Sub>
      </Stage>
    );
  }

  if (error && !challenge) {
    return (
      <Stage eyebrow={eyebrow} headline="The checkpoint did not answer.">
        <Sub>
          Your work in this lesson is kept, and only the graded question needs the
          server. Try again in a moment.
        </Sub>
        <Actions>
          <button type="button" className={styles.primary} onClick={load}>Try again</button>
        </Actions>
        <p className={styles.errorDetail}>{error}</p>
      </Stage>
    );
  }

  const passed = Boolean(result?.passed || done);

  return (
    <Stage eyebrow={eyebrow} headline={isChoice ? challenge.prompt : headline}>
      {/* On a choice checkpoint the prompt is the headline, so a generic line
          never sits above the real question. A numeric checkpoint keeps both:
          the headline names the task, the prompt carries this learner's
          figures. */}
      {isChoice ? null : <Sub>{challenge.prompt}</Sub>}
      <LocalNotice show={challenge.local} />
      {children}

      {isChoice ? (
        <ChoiceAnswer
          choices={challenge.controls.choices}
          picked={picked}
          onPick={setPicked}
          result={result}
          passed={passed}
          submitting={submitting}
          onSubmit={onSubmit}
          onRetry={() => load(fields?.variant)}
        />
      ) : (
        <SliderAnswer
          slider={challenge.controls?.slider ?? { min: 0, max: 100, step: 1 }}
          value={value}
          onChange={setValue}
          target={target}
          landing={landing}
          unit={unit}
          direct={direct}
          controlLabel={controlLabel}
          controlDisplay={controlDisplay}
          targetFoot={targetFoot}
          landingFoot={landingFoot}
          result={result}
          passed={passed}
          submitting={submitting}
          onSubmit={onSubmit}
          onRetry={() => load()}
        />
      )}

      {error && challenge ? <p className={styles.errorDetail}>{error}</p> : null}

      {/* No onward links here. They used to sit in this panel, which put them
          above the write-up of the lesson the learner had just finished: the
          way out was offered before the summary of what they had worked out.
          The write-up below carries the next lesson and the way back to the
          map, so the reading order is verdict, screen, summary, onward. */}
      {passed ? (
        <div className={styles.passBox}>
          <div className={`${styles.resultHead} ${styles.passHead}`}>{passTitle}</div>
          <div className={styles.resultText}>
            {isChoice && result?.feedback ? <Body>{result.feedback}</Body> : null}
            <Body>{passBody}</Body>
          </div>
        </div>
      ) : null}
    </Stage>
  );
}

/**
 * The same checkpoint with the beginner stage label as its default. Every choice
 * lesson sits in the beginner track and its callers never passed a label, so
 * this keeps them reading "Check". Any prop passed through wins.
 */
export function ChoiceCheckpoint(props) {
  return <Checkpoint stageLabel="Check" {...props} />;
}

/** The slider body of a checkpoint: the compare cards, the control, and the verdict. */
function SliderAnswer({
  slider, value, onChange, target, landing, unit, direct,
  controlLabel, controlDisplay, targetFoot, landingFoot,
  result, passed, submitting, onSubmit, onRetry,
}) {
  const tolerance = result?.tolerance ?? 0;
  const onTarget = landing != null && target != null && Math.abs(landing - target) <= (tolerance || Infinity);
  const missed = Boolean(result && !result.passed);

  return (
    <>
      {!direct ? (
        <div className={styles.checkGrid}>
          <div className={styles.checkCard}>
            <div className={styles.microLabel}>Target</div>
            <div className={styles.bigNumber}>{formatByUnit(target, unit)}</div>
            <div className={styles.checkFoot}>{targetFoot}</div>
          </div>
          <div className={styles.checkCard}>
            <div className={styles.microLabel}>Your answer gives</div>
            <div className={styles.bigNumber} style={{ color: onTarget ? "#5ba88a" : "#f5c09a" }}>
              {formatByUnit(landing, unit)}
            </div>
            <div className={styles.checkFoot}>{landingFoot}</div>
          </div>
        </div>
      ) : null}

      <Controls>
        <Control
          label={controlLabel}
          display={controlDisplay(value)}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={value}
          onChange={onChange}
          accent
        />
      </Controls>

      {!passed && !(direct && missed) ? (
        <Actions>
          <button type="button" className={styles.primary} onClick={onSubmit} disabled={submitting}>
            {submitting ? "Checking..." : "Submit answer"}
          </button>
        </Actions>
      ) : null}

      {missed ? (
        <div className={styles.missBox}>
          {direct
            ? `You answered ${formatByUnit(result.actual, result.unit)}. The target was ${formatByUnit(result.target, result.unit)}, accepted within ${formatByUnit(result.tolerance, result.unit)}. The next question uses new figures.`
            : `That gives ${formatByUnit(result.actual, result.unit)}. The target is ${formatByUnit(result.target, result.unit)}, accepted within ${formatByUnit(result.tolerance, result.unit)}. Adjust and submit again.`}
        </div>
      ) : null}

      {!passed && direct && missed ? (
        <Actions>
          <button type="button" className={styles.primary} onClick={onRetry}>
            Try a new question
          </button>
        </Actions>
      ) : null}
    </>
  );
}

/** The choice body of a checkpoint: the option list and the verdict. */
function ChoiceAnswer({ choices, picked, onPick, result, passed, submitting, onSubmit, onRetry }) {
  // Only revealed once the answer is settled, so a miss does not hand it over.
  const correct = passed && typeof result?.target === "number" ? result.target : null;
  const missed = Boolean(result && !result.passed);
  // A settled question, either way. The options stop taking clicks, because the
  // way on from a miss is a new question rather than a second guess at this one.
  const settled = passed || missed;

  return (
    <>
      <div className={styles.choices} role="radiogroup" aria-label="Answer options">
        {choices.map((text, i) => {
          const state =
            correct === i ? styles.choiceRight
            : missed && picked === i ? styles.choiceWrong
            : picked === i ? styles.choiceOn
            : "";
          return (
            <button
              key={text}
              type="button"
              role="radio"
              aria-checked={picked === i}
              className={`${styles.choice} ${state}`}
              disabled={settled}
              onClick={() => onPick(i)}
            >
              <span className={styles.choiceKey}>{KEYS[i] ?? i + 1}</span>
              <span>{text}</span>
            </button>
          );
        })}
      </div>

      {!settled ? (
        <Actions aside={picked == null ? "Choose an option." : null}>
          <button
            type="button"
            className={styles.primary}
            onClick={onSubmit}
            disabled={submitting || picked == null}
          >
            {submitting ? "Checking..." : "Submit answer"}
          </button>
        </Actions>
      ) : null}

      {missed ? (
        <>
          <div className={styles.missBox}>
            {result.feedback ?? "That one is wrong."}
          </div>
          <Actions aside="Your next question covers the same ground from another angle.">
            <button type="button" className={styles.primary} onClick={onRetry}>
              Try a new question
            </button>
          </Actions>
        </>
      ) : null}
    </>
  );
}

/* ── Beginner explainers ─────────────────────────────────── */

/**
 * A labeled fact.
 *
 * The beginner lessons carry more plain statement and less live model than the
 * intermediate ones, so they need somewhere to put a sentence that matters
 * without dressing it up as a readout.
 */
export function Notes({ children }) {
  return <div className={styles.notes}>{children}</div>;
}

export function Note({ label, children }) {
  return (
    <div className={styles.note}>
      <span className={styles.noteLabel}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

/* ── Charts ──────────────────────────────────────────────── */

/**
 * A small line chart, sized to whatever width it is given.
 *
 * The beginner lessons show shapes rather than values: a balance going down, a
 * balance going up, a bar filling toward a marker. So this takes series in the
 * caller's own units and handles only the drawing.
 *
 * The viewBox tracks the measured width rather than a fixed number. A fixed
 * viewBox on a phone squeezes the plot and leaves the labels overlapping.
 */
export function LineChart({
  series,
  xMax,
  yMax,
  xLabel,
  yTicks = 3,
  xTicks = 4,
  formatY = (v) => String(Math.round(v)),
  formatX = (v) => String(Math.round(v)),
  label = "Chart",
  markLine,
}) {
  const [ref, width] = useElementWidth();

  const narrow = width < 480;
  const w = Math.max(width, 260);
  const h = narrow ? 190 : 240;
  const m = { top: 18, right: 14, bottom: 34, left: narrow ? 46 : 58 };

  const plotW = Math.max(w - m.left - m.right, 10);
  const plotH = Math.max(h - m.top - m.bottom, 10);

  const x = (v) => m.left + (xMax > 0 ? v / xMax : 0) * plotW;
  const y = (v) => m.top + (1 - (yMax > 0 ? v / yMax : 0)) * plotH;

  const path = (points) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`)
      .join(" ");

  const ys = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);
  const xs = Array.from({ length: xTicks + 1 }, (_, i) => (xMax / xTicks) * i);

  return (
    <div ref={ref}>
      {/* Nothing to draw until measured. Rendering at a guessed width first would
          show the chart jumping into place on every load. */}
      {width > 0 ? (
        <svg viewBox={`0 0 ${w} ${h}`} className={styles.chart} role="img" aria-label={label}>
          {ys.map((v) => (
            <g key={v}>
              <line x1={m.left} x2={w - m.right} y1={y(v)} y2={y(v)} className={styles.grid} />
              <text x={m.left - 8} y={y(v) + 4} className={styles.axisText} textAnchor="end">
                {formatY(v)}
              </text>
            </g>
          ))}

          {xs.map((v) => (
            <text key={v} x={x(v)} y={h - 16} className={styles.axisText} textAnchor="middle">
              {formatX(v)}
            </text>
          ))}
          {xLabel ? (
            <text x={w - m.right} y={h - 2} className={styles.axisText} textAnchor="end">
              {xLabel}
            </text>
          ) : null}

          {markLine != null ? (
            <line
              x1={m.left}
              x2={w - m.right}
              y1={y(markLine)}
              y2={y(markLine)}
              className={styles.highlight}
            />
          ) : null}

          {series.map((s) => (
            <path
              key={s.id}
              d={path(s.points)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width ?? 2.5}
              strokeDasharray={s.dashed ? "7 6" : undefined}
              strokeLinecap="round"
            />
          ))}
        </svg>
      ) : (
        <div className={styles.chartPlaceholder} />
      )}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className={styles.legend}>
      {items.map((i) => (
        <span key={i.label} className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** The stage labels the beginner track uses. Plainer than the intermediate three. */
export const BEGINNER_STAGES = [
  { id: "predict", label: "Learn" },
  { id: "explore", label: "Try" },
  { id: "checkpoint", label: "Check" },
];

/** The stage labels the intermediate track uses. LessonPage's default matches. */
export const INTERMEDIATE_STAGES = [
  { id: "predict", label: "Predict" },
  { id: "explore", label: "Explore" },
  { id: "checkpoint", label: "Checkpoint" },
];
