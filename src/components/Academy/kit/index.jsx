import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import styles from "../lesson.module.css";
import parts from "../parts.module.css";
import { fetchChallenge, saveCompletion, submitAnswer } from "../lib/api";
import useElementWidth from "../lib/useElementWidth";
import { TERMS } from "../lib/terms";
import { ALL_LESSONS } from "../lib/track";
import LocalNotice from "../LocalNotice";
import { useControlReason } from "../AppMock";

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

/**
 * `level` 2 sets the headline as an h2 in the same face, for a stage that sits
 * inside a page whose title is already the h1 (the article lessons'
 * Check). No eyebrow is drawn when `eyebrow` is empty.
 */
export function Stage({ eyebrow, headline, level = 1, children }) {
  const H = level === 2 ? "h2" : "h1";
  return (
    <>
      {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
      {headline ? <H className={styles.headline}>{headline}</H> : null}
      {children}
    </>
  );
}

/* ── Stages ──────────────────────────────────────────────── */

const StageActive = createContext(true);

/**
 * A lab's three stages, each kept once it has been reached.
 *
 *   <Stages
 *     stage={stage}
 *     render={{
 *       predict: () => <Learn onDone={() => onStage("explore")} />,
 *       explore: () => <Try onDone={() => onStage("checkpoint")} />,
 *       checkpoint: () => <ChoiceCheckpoint ... />,
 *     }}
 *   />
 *
 * A lab used to render one stage at a time, so going back to Learn mounted it
 * afresh with every guess cleared, and a learner could not re-read a reveal
 * without doing the stage again. Here a stage mounts the first time it is the
 * current one and then stays mounted, hidden (`display: none` and `inert`)
 * while another stage is current, so its guesses, reveals and passed gates are
 * there when the learner comes back. Nothing mounts before it is reached,
 * which matters most for the checkpoint: it fetches its questions on mount.
 *
 * `render` maps a stage id to a function, in stage order; a lab with two
 * stages (lesson 1) passes two. A part that does something to the page from
 * an effect, such as `window.scrollTo(0, 0)` when its part changes, checks
 * `useStageActive()` first, so a hidden stage never moves the page.
 */
export function Stages({ stage, render }) {
  const reached = useRef(new Set());
  if (render[stage]) reached.current.add(stage);
  return Object.keys(render).map((id) => {
    if (!reached.current.has(id)) return null;
    const on = id === stage;
    return (
      <div key={id} style={on ? undefined : { display: "none" }} inert={on ? undefined : true}>
        <StageActive.Provider value={on}>{render[id]()}</StageActive.Provider>
      </div>
    );
  });
}

/** True while the stage a part sits in is the one on screen (and outside `Stages`). */
export function useStageActive() {
  return useContext(StageActive);
}

/**
 * The screens inside one stage, kept the way `Stages` keeps stages.
 *
 *   <Parts part={part} render={{ deposit: () => <DepositPart ... />, borrow: () => ... }} />
 *
 * A Learn or Try with several screens used to replace each screen with the
 * next, so stepping back into the stage showed only its last screen and the
 * earlier ones were gone. Each screen after the first now carries a quiet
 * "Back" (`onBack` on `Actions`, `Gate` and `Reveal`), and the screen it goes
 * back to is the one the learner left, guesses and reveals intact, because a
 * reached part stays mounted and hidden like a reached stage.
 */
export function Parts({ part, render }) {
  const reached = useRef(new Set());
  if (render[part]) reached.current.add(part);
  return Object.keys(render).map((id) => {
    if (!reached.current.has(id)) return null;
    const on = id === part;
    return (
      <div key={id} style={on ? undefined : { display: "none" }} inert={on ? undefined : true}>
        {render[id]()}
      </div>
    );
  });
}

/**
 * Scrolls to the top when a stage's part changes, forward or back, but not on
 * the first render and never from a hidden stage.
 */
export function usePartScroll(part) {
  const active = useStageActive();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active) window.scrollTo(0, 0);
  }, [part]);
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

export function Actions({ children, aside, onBack }) {
  return (
    <div className={styles.actions}>
      {children}
      {onBack ? <BackLink onClick={onBack} /> : null}
      {aside ? <span className={styles.aside}>{aside}</span> : null}
    </div>
  );
}

/**
 * The way back to the screen before, inside a stage with several screens. A
 * quiet text link beside the primary button, in the style of the map's "Back
 * to the track", so it never reads as a second way on.
 */
function BackLink({ onClick }) {
  return (
    <button type="button" className={styles.back} onClick={onClick}>
      Back
    </button>
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

/**
 * The way on from a Try stage before its condition is met: the button the
 * reveal will carry, switched off, with the condition beside it.
 *
 * These stages used to show a grey one-line hint and no button at all until the
 * learner had done what the hint asked. On lesson 2 that read as
 * a page with no way forward. A button that is there and visibly off says the
 * way forward exists and that something still has to happen first, and the
 * hint beside it says what.
 */
export function Gate({ label, hint, onBack }) {
  return (
    <Actions aside={hint} onBack={onBack}>
      <Primary disabled>{label}</Primary>
    </Actions>
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
export function Reveal({ title, children, onNext, nextLabel, onBack }) {
  return (
    <div className={styles.reveal}>
      <div className={`${styles.resultHead} ${styles.revealHead}`}>{title}</div>
      <div className={styles.resultText}>{children}</div>
      {onNext || onBack ? (
        <div className={styles.resultAct}>
          {onNext ? <Primary onClick={onNext}>{nextLabel}</Primary> : null}
          {onBack ? <BackLink onClick={onBack} /> : null}
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
  // A miss says so. It used to be the guess alone, which read as
  // neither right nor wrong.
  return `You said ${format(guess)}. Not quite. `;
}

/**
 * Marks a figure the lesson has just read from the market, beside the figure
 * itself. Lessons render it only when the read succeeded, so the example price
 * never carries it. "Today" in the sentence alone did not show that the
 * price was live.
 */
export function LiveTag() {
  return <span className={styles.liveTag} title="Read from the market when this page loaded">Live</span>;
}

/**
 * A bank prompt with a figure read from the live app marks it "(LIVE)" (the
 * intermediate track's 442% and 0.968). The checkpoint draws the
 * mark as the LIVE tag beside the figure, so it reads the same as a live
 * figure anywhere else in a lesson.
 */
export function withLive(text) {
  if (typeof text !== "string" || !text.includes("(LIVE)")) return text;
  const parts = text.split("(LIVE)");
  return parts.map((p, i) => (
    <React.Fragment key={i}>
      {i > 0 ? <LiveTag /> : null}
      {/* One real space before the tag, so the figure never reads "442%LIVE". */}
      {i > 0 ? p : `${p.replace(/\s+$/, "")} `}
    </React.Fragment>
  ));
}

/**
 * A label for the small capitals styles, with alUSD and alETH kept in their own
 * case. Uppercased, they read "ALUSD", which is no token's name.
 */
export function caps(text) {
  if (typeof text !== "string") return text;
  const parts = text.split(/(al(?:USD|ETH))/);
  if (parts.length === 1) return text;
  return parts.map((p, i) => (i % 2 ? <span key={i} className={styles.asIs}>{p}</span> : p));
}

/**
 * A Learn-stage question with options rather than a slider, for a prediction
 * that is a direction or a kind of thing rather than a number. Uses the
 * checkpoint's option styles. Once `revealed`, the right option turns green and
 * a wrong pick is marked, so the reveal never has to restate what was picked.
 */
export function GuessChoice({ label, options, value, onChange, revealed = false, correct }) {
  return (
    <div className={`${styles.choices} ${styles.choicesInPanel}`} role="radiogroup" aria-label={label}>
      {options.map((text, i) => {
        const mine = value === i;
        const state =
          revealed && i === correct ? styles.choiceRight
          : revealed && mine ? styles.choiceWrong
          : mine ? styles.choiceOn
          : "";
        return (
          <button
            key={text}
            type="button"
            role="radio"
            aria-checked={mine}
            className={`${styles.choice} ${state}`}
            disabled={revealed}
            onClick={() => onChange(i)}
          >
            <span className={styles.choiceKey}>{KEYS[i] ?? i + 1}</span>
            <span>{text}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Readout({ children }) {
  return <div className={styles.readout}>{children}</div>;
}

/* ── Controls ────────────────────────────────────────────── */

/**
 * A typed number box beside a slider, for answers a slider cannot land on.
 *
 * The sizing lesson's answer is 12,512.26 and its slider moves in hundreds, and
 * both of its sliders made the right amount hard to
 * enter. The box takes any value in range, decimals included, and the slider
 * follows it. Typing is never interrupted: a value is committed only once it is
 * in range, and the box goes back to the committed value when it loses focus.
 *
 * A text box, not a number box, so it can print thousands separators like every
 * other figure on the page ("12,000", where a number box showed "12000"). Commas
 * are stripped before the typed value is read.
 */
const entryText = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

function Entry({ value, onChange, min, max, disabled, label, className, color }) {
  const [text, setText] = useState(entryText(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(entryText(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      disabled={disabled}
      aria-label={`${label}, typed`}
      className={`${styles.entry} ${className ?? ""}`}
      style={color ? { color } : undefined}
      onFocus={() => { focused.current = true; }}
      onChange={(e) => {
        setText(e.target.value);
        const raw = e.target.value.replace(/,/g, "").trim();
        const n = Number(raw);
        if (raw !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(n);
      }}
      onBlur={() => {
        focused.current = false;
        setText(entryText(value));
      }}
    />
  );
}

/**
 * `answer`, passed once the reveal is up, puts a tick on the track at the right
 * value, with `answerLabel` under it, so the guess and the answer read on one
 * line without being held in memory.
 */
export function GuessSlider({ label, value, onChange, disabled, color, min = 0, max = 100, step = 1, format, scale, typeable = false, answer = null, answerLabel }) {
  const at = answer == null || max <= min ? null : Math.min(Math.max((answer - min) / (max - min), 0), 1);
  return (
    <div>
      <div className={styles.guessHead}>
        <span className={styles.microLabel}>{caps(label)}</span>
        {typeable ? (
          <Entry
            value={value} onChange={onChange} min={min} max={max} disabled={disabled}
            label={label} className={styles.entryGuess} color={color}
          />
        ) : (
          <span className={styles.guessValue} style={{ color }}>
            {format ? format(value) : `${value}%`}
          </span>
        )}
      </div>
      <div className={`${styles.rangeWrap} ${at != null ? styles.rangeWrapAnswer : ""}`}>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.range}
          style={color ? { accentColor: color } : undefined}
          aria-label={label}
        />
        {at != null ? (
          <span className={styles.answerTick} style={{ "--at": at }} aria-hidden="true">
            <span className={styles.answerLabel}>{answerLabel ?? (format ? format(answer) : `${answer}%`)}</span>
          </span>
        ) : null}
      </div>
      {scale ? (
        <div className={styles.guessScale}>
          <span>{scale[0]}</span>
          <span>{scale[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

export function Control({ label, display, min, max, step, value, onChange, verdict, accent, tone, bad, typeable = false }) {
  return (
    <div className={`${styles.control} ${accent ? styles.controlAccent : ""}`}>
      <div className={styles.controlHead}>
        <span className={styles.microLabel}>{caps(label)}</span>
        {typeable ? (
          <Entry
            value={value} onChange={onChange} min={min} max={max}
            label={label} className={styles.entryControl} color={tone}
          />
        ) : (
          <span className={styles.controlValue} style={tone ? { color: tone } : undefined}>{display}</span>
        )}
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
        <div className={bad ? styles.verdictBad : accent ? styles.verdictOn : styles.verdictOff}>{verdict ?? " "}</div>
      ) : null}
    </div>
  );
}

/* The count lets the stylesheet lay three controls out as three or one, never
   two and an orphan. Conditional children that render nothing are not counted. */
export const Controls = ({ children }) => (
  <div className={styles.controls} data-count={React.Children.toArray(children).length}>
    {children}
  </div>
);

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
            <div className={styles.statLabel}>{caps(s.label)}</div>
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
/**
 * `active` is the index of a step to light up, for a stage whose buttons walk
 * through the cards one at a time. The others dim.
 */
export function FlowSteps({ steps, active = null }) {
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
          <FlowStep
            n={s.n ?? i + 1} label={s.label} value={s.value} note={s.note} tone={s.tone}
            state={active == null ? null : i === active ? "on" : "off"}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

export function FlowStep({ n, label, value, note, tone, state = null }) {
  return (
    <div className={`${parts.step} ${state === "on" ? parts.stepOn : state === "off" ? parts.stepOff : ""}`}>
      <div className={parts.stepNum}>{n}</div>
      <div className={parts.stepLabel}>{caps(label)}</div>
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
 * A piece of the real app, cropped out of a capture.
 *
 * The one control, row of stats or card the learner is pushing on right now,
 * beside the model of it, so the slider they just moved has a face in the app.
 * Always a complete element with a margin around it, never a detail cut out of
 * one. The lessons used to end with the whole screen as well; that was a
 * second picture of the same thing and taught nothing the crop had not.
 *
 * A crop is a fraction of the capture ({ x, y, w, h }, all 0 to 1). The window
 * takes its aspect ratio from the crop against the file's own pixel size, and
 * the image inside is blown up to 1/w of the window and shifted into place, so
 * no files had to be re-cut and a crop can be nudged by editing four numbers.
 *
 * The crop shows at the size the app draws it: its width in capture pixels
 * over the capture's pixel ratio (`dpr` on the shot, 2 unless it says 1),
 * centered in the card, and never wider than the column, so it shrinks on a
 * phone. Stretched to the column, a narrow crop's type came out larger than
 * the lesson's headline (2026-11-03).
 *
 * The picture sits in the same card as the rest of the lesson: one rounded
 * border at the position card's tint, the crop centered in it, and the
 * caption as its foot. The figures used to borrow the docs' frame
 * (`src/components/FramedImage`: hairlines overhanging each corner, a dot
 * where they cross). That was the one element on the page not drawn as a
 * card, and its rules stuck out past the column edge everything else sits on.
 *
 * The image is given its height as well as its width, and it is not lazy
 * loaded. Until a lazy image has loaded it has no height of its own, and one
 * shifted up inside a clipped window then has no box in view for the browser
 * to test against, so it never loads: Safari showed every figure as an empty
 * card on that account while Chrome, which reads ahead of the viewport, loaded
 * them anyway. The frame already knows the crop's proportions, so the image's
 * box is written down before the file arrives, and each stage mounts one
 * figure, so lazy loading had nothing to save.
 */
function cropStyle(shot) {
  const [W, H] = shot.size;
  const c = shot.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const natural = (c.w * W) / (shot.dpr ?? 2);
  return {
    frame: { aspectRatio: `${(c.w * W) / (c.h * H)}`, width: `${natural}px` },
    img: {
      width: `${100 / c.w}%`,
      height: `${100 / c.h}%`,
      left: `${(-c.x / c.w) * 100}%`,
      top: `${(-c.y / c.h) * 100}%`,
    },
  };
}

/**
 * One caption shape for every figure: a label, then what to look at.
 *
 * Always under the picture, as the foot of its card. The crops used to sit in
 * a two-column figure with the caption beside them, which gave the academy two
 * different-looking figures on the same page depending on how wide the crop
 * was.
 */
function Caption({ label, children }) {
  return (
    <figcaption className={parts.figCap}>
      {label ? <span className={parts.figLabel}>{caps(label)}</span> : null}
      {children ? <span className={parts.figText}>{children}</span> : null}
    </figcaption>
  );
}

/**
 * Where this happens in the app, in one line: a small "In the app" label and
 * the path, page first and tab last, in the quiet style of a capture's
 * caption. Beginner lessons end their Try reveal or their recap on one.
 *
 *   <InApp>Borrow, open a vault, Deposit/Borrow tab.</InApp>
 *
 * A line of text, never a figure: no icon and no box. It is a block of its
 * own, so it sits after a reveal's last `Body`, never inside one. In an mdx
 * recap, keep it on one line, so MDX does not wrap the text in a paragraph.
 */
export function InApp({ label = "In the app", children }) {
  return (
    <div className={parts.inApp}>
      <span className={parts.figLabel}>{caps(label)}</span>
      <span className={parts.inAppText}>{children}</span>
    </div>
  );
}

/**
 * Below this figure width a shot's narrow variant is shown instead: a crop of
 * the one thing the caption points at, or the app's own phone layout of the
 * same panel. A desktop-width element in a phone's column is a thumbnail with
 * text a few pixels tall. 640px sits under a tablet's column (about 690px at
 * a 768px viewport, where the desktop crops still read) and over a phone's.
 */
const NARROW_PX = 640;

/**
 * `narrow` overrides the shot's own narrow variant, for a figure two lessons
 * share where each points at a different part of it (the stat rows).
 *
 *   <AppShot shot={SHOTS.strategies}>The allocation: each strategy's share of the vault.</AppShot>
 *
 * The children are the caption. The size comes from the shot; there is no
 * size prop.
 */
export function AppShot({ shot, narrow, label = "In the app", children }) {
  const [ref, width] = useElementWidth();
  const variant = narrow ?? shot.narrow;
  const shown = variant && width > 0 && width < NARROW_PX
    ? { src: shot.src, size: shot.size, alt: shot.alt, dpr: shot.dpr, ...variant }
    : shot;
  const { frame, img } = cropStyle(shown);

  return (
    <figure className={`${parts.fig} ${shot.hideNarrow ? parts.figHideNarrow : ""}`} ref={ref}>
      <div className={parts.figCard}>
        <div className={parts.figStage}>
          <div className={parts.figWindow} style={frame}>
            <img className={parts.figCrop} style={img} src={shown.src} alt={shown.alt} loading="eager" />
          </div>
        </div>
        <Caption label={label}>{children}</Caption>
      </div>
    </figure>
  );
}

/**
 * The figures the lessons show, with the pixel size of each capture beside it.
 *
 * Every file here was checked against the live app: the older captures in
 * static/img predate the navigation rename and none of them is used. The
 * `academy-*.png` files are 2x captures of the screens that need no wallet,
 * taken headless in dark mode by `scripts/capture-app-screens.mjs`: the list
 * pages and the USDC vault page at a desktop width, and the vault's action
 * tabs and info panels at a 1000px viewport, where each panel runs the width
 * of the page and ends under its own content. The rest (the bar with a debt
 * on it, the open Fixed Yield positions) are 1x captures of a real ETH
 * position, so their captions describe the screen rather than claiming it is
 * the learner's own. Those two carry `dpr: 1`, so `AppShot` sizes them at their
 * own pixels rather than half of them.
 *
 * Every figure is a complete element with a margin around it: a card, a row
 * of stat tiles, a tab with its panel. A single tile came out as a thumbnail,
 * and half a card read as a picture cut in half.
 *
 * Each shot can carry a `narrow` variant for a phone's column ({ src, size,
 * crop, alt }, each falling back to the shot's own): the detail the caption
 * points at, cropped inside the element so no edge of it is cut, or the
 * app's own phone layout of the panel from the 390px pass of the capture
 * script (`academy-phone-*.png`). The stat rows have no default, because the
 * lessons that share a row point at different tiles of it; they pass one of
 * `NARROW` instead.
 */

/** The USDC vault page at 1600 CSS px, and where its two rows of stat tiles sit. */
const VAULT = [3200, 2500];
const statsRow = (row) => ({
  src: "/img/academy-vault-usdc.png",
  size: VAULT,
  // The four tiles of one row, with 12 CSS px of the panel around them.
  crop: { x: 368 / VAULT[0], y: [528, 736][row] / VAULT[1], w: 2464 / VAULT[0], h: 224 / VAULT[1] },
});

/** The Withdraw and Repay tabs, each the tab strip and its whole panel. */
const TAB = [2000, 580];

/** The same panels at 390px, without the tab strip, which scrolls sideways there. */
const PHONE_TAB = [780, 460];

/**
 * The stat tiles at 390px, two to a row: row 0 APR and Deposit, 1 Debt and
 * Health Factor, 2 Earmarked and Redemption Rate, 3 Borrowable and LTV. The
 * rows are not the same height (Redemption Rate wraps), so each has its own.
 */
const PHONE_STATS = [684, 864];
const phoneRow = (top, bottom, alt) => ({
  src: "/img/academy-phone-stats.png",
  size: PHONE_STATS,
  crop: { x: 12 / PHONE_STATS[0], y: top / PHONE_STATS[1], w: 660 / PHONE_STATS[0], h: (bottom - top) / PHONE_STATS[1] },
  alt,
});

/** The app's header with Earn open, at 1600 CSS px (`pnpm capture:app static/img menu`). */
const MENU = [3200, 344];

export const SHOTS = {
  /**
   * The app's top menu with Earn open, on the Mixed Yield page: Dashboard to
   * Ecosystem, with the dropdown, 21 capture px (about 10 CSS px) of the
   * header above and below, and the whole header across, from the lockup to
   * Connect Wallet (1560 CSS px), so it fills the article lessons' 1200px
   * stage edge to edge. The narrow variant stops after Trade, the
   * first whole item past Earn's dropdown, so a phone shows Dashboard to
   * Trade at a size that reads.
   */
  menu: {
    src: "/img/academy-menu-earn.png",
    size: MENU,
    crop: { x: 40 / MENU[0], y: 19 / MENU[1], w: 3120 / MENU[0], h: 325 / MENU[1] },
    alt: "The app's top menu: Dashboard, Borrow, Earn, Trade and Ecosystem, with Earn open on Fixed Rate and Variable Rate",
    narrow: {
      crop: { x: 981 / MENU[0], y: 19 / MENU[1], w: 896 / MENU[0], h: 325 / MENU[1] },
      alt: "The app's top menu: Dashboard, Borrow, Earn and Trade, with Earn open on Fixed Rate and Variable Rate",
    },
  },
  /**
   * The Borrow page's two Ethereum vault cards, Risk-adjusted Mix USDC on
   * top, with the same 30 capture px around them as `vaultCard`.
   *
   * Recaptured 2026-11-12 (`pnpm capture:app static/img borrow fixed-yield`).
   * The page now lists Base first, so the Ethereum cards are the second and
   * third: every crop on this file and on the Fixed Yield one starts one card
   * lower than it did (472 px here, 536 px there). If the app's order moves
   * again, find the Ethereum cards before trusting these rectangles.
   */
  borrowCards: {
    src: "/img/academy-borrow.png",
    size: [3200, 2500],
    crop: { x: 312 / 3200, y: 1436 / 2500, w: 2576 / 3200, h: 1024 / 2500 },
    alt: "Vault cards on the Borrow page: Risk-adjusted Mix USDC at 5.92% APR, then Risk-adjusted Mix ETH, each with its deposit cap, totals and strategies",
    narrow: {
      crop: { x: 580 / 3200, y: 1532 / 2500, w: 790 / 3200, h: 310 / 2500 },
      alt: "The top left of the Risk-adjusted Mix USDC card on the Borrow page: its name, its APR and a bar showing how full its deposit cap is",
    },
  },
  /**
   * The USDC vault page at 1600 CSS px (`pnpm capture:app static/img
   * vault-page`, 2026-11-05): the name, the stat tiles with the APR at the
   * top, the bar, and the panels with the Info tab open, in one picture, 1304
   * CSS px with the page's own 24px around it. Shown at the article lessons'
   * stage width. On a phone, the Info tab's strategy table alone.
   */
  vaultPage: {
    src: "/img/academy-vault-page.png",
    size: [2608, 2140],
    alt: "The USDC vault page: its stat tiles, APR first, the position bar, and below them the Deposit/Borrow tab beside the Info tab, which lists the vault's strategies with their risk level, APR and allocation",
    narrow: {
      crop: { x: 1690 / 2608, y: 1255 / 2140, w: 800 / 2608, h: 250 / 2140 },
      alt: "The strategy list on the vault's Info tab: each strategy with its risk level, APR and allocation",
    },
  },
  /**
   * The same capture cropped to the Info tab (2026-11-06): the tab row, the
   * strategy table with Risk Level, APR and Allocation, and the vault's 30-day
   * APR chart. Lesson 2 shows only what it teaches; the stats above it are
   * taught from lesson 3 on. On a phone, the strategy table alone.
   */
  vaultInfo: {
    src: "/img/academy-vault-page.png",
    size: [2608, 2140],
    crop: { x: 1330 / 2608, y: 1100 / 2140, w: 1240 / 2608, h: 1000 / 2140 },
    alt: "The vault's Info tab: three strategies with their risk level, APR and allocation, and a chart of the vault's APR over 30 days",
    narrow: {
      crop: { x: 1690 / 2608, y: 1255 / 2140, w: 800 / 2608, h: 250 / 2140 },
      alt: "The strategy list on the vault's Info tab: each strategy with its risk level, APR and allocation",
    },
  },
  /**
   * The Trade page's Swap card with alUSD in and USDC out (`pnpm capture:app
   * static/img swap`, 2026-11-05): the card with 24px of the page above and
   * below and 112px either side, 736 CSS px, the width of a lesson's text
   * column. On a phone, the card alone.
   */
  swapCard: {
    src: "/img/academy-swap.png",
    size: [1472, 912],
    alt: "The Swap card on the app's Trade page: alUSD in the top box, USDC in the bottom one, with the slippage under them and the button that sends it",
    narrow: {
      crop: { x: 250 / 1472, y: 70 / 912, w: 972 / 1472, h: 780 / 912 },
      alt: "The Swap card on the app's Trade page, alUSD in and USDC out",
    },
  },
  /**
   * The position stats and the health bar, cut from the vault page capture
   * (2026-11-06): the eight stat tiles and the bar with its MAX LTV
   * and LIQ LTV markers, inside the panel's own edge. On a phone, the
   * second row's last two tiles, Borrowable and LTV.
   */
  statsBar: {
    src: "/img/academy-vault-page.png",
    size: [2608, 2140],
    crop: { x: 36 / 2608, y: 286 / 2140, w: 2528 / 2608, h: 742 / 2140 },
    alt: "The USDC vault's position stats, APR, Deposit, Debt, Health Factor, Earmarked, Redemption Rate, Borrowable and LTV 0.00 out of 90.00%, with the health bar under them marking MAX LTV and LIQ LTV",
    narrow: {
      crop: { x: 1300 / 2608, y: 532 / 2140, w: 1230 / 2608, h: 210 / 2140 },
      alt: "Borrowable and LTV on the USDC vault: 0.00 alUSD to borrow, and LTV 0.00 out of 90.00%",
    },
  },
  /** The second row's first two tiles, Earmarked and Redemption Rate, from the same capture. */
  rateEarmarked: {
    src: "/img/academy-vault-page.png",
    size: [2608, 2140],
    crop: { x: 78 / 2608, y: 532 / 2140, w: 1222 / 2608, h: 210 / 2140 },
    alt: "Earmarked and Redemption Rate on the USDC vault: 0.00 alUSD earmarked, and the rate reading 0.00% with a future rate beside it",
  },
  /** The health bar alone, from the same capture: the bar, its two markers and the legend. */
  healthBar: {
    src: "/img/academy-vault-page.png",
    size: [2608, 2140],
    crop: { x: 60 / 2608, y: 835 / 2140, w: 2490 / 2608, h: 150 / 2140 },
    alt: "The USDC vault's health bar, with MAX LTV and LIQ LTV marked near its right end and a legend reading Deposit, Debt, Earmarked",
    narrow: {
      crop: { x: 2100 / 2608, y: 835 / 2140, w: 440 / 2608, h: 150 / 2140 },
      alt: "The right end of the health bar, where MAX LTV and LIQ LTV are marked",
    },
  },
  vaultCard: {
    src: "/img/academy-borrow.png",
    size: [3200, 2500],
    // The card with 30 capture px (15 CSS px) of the page around it on every
    // side. The next row of cards starts 35 px under this one, so a deeper
    // margin took their top edge in.
    // The Ethereum USDC card, the second on the page since 2026-11-12 (see
    // `borrowCards`).
    crop: { x: 312 / 3200, y: 1436 / 2500, w: 2576 / 3200, h: 488 / 2500 },
    alt: "A vault card on the Borrow page: its name, APR and deposit cap, then total deposits, total debt, earmarked, and LTV 90.00%",
    narrow: {
      crop: { x: 580 / 3200, y: 1532 / 2500, w: 790 / 3200, h: 310 / 2500 },
      alt: "The top left of a vault card on the Borrow page: its name, its APR, and a bar showing how full its deposit cap is",
    },
  },
  depositBorrow: {
    src: "/img/academy-tab-deposit.png",
    size: [2000, 840],
    alt: "The Deposit/Borrow tab on the USDC vault: a USDC field for the deposit above an alUSD field for the borrow, each with a MAX button, over the button that sends both",
    narrow: { src: "/img/academy-phone-tab-deposit.png", size: [780, 704] },
  },
  withdrawTab: {
    src: "/img/academy-tab-withdraw.png",
    size: TAB,
    alt: "The Withdraw tab on the USDC vault: a USDC amount field showing what is available, with a MAX button, over the button that sends it",
    narrow: { src: "/img/academy-phone-tab-withdraw.png", size: PHONE_TAB },
  },
  repayTab: {
    src: "/img/academy-tab-repay.png",
    size: TAB,
    alt: "The Repay tab on the USDC vault: an alUSD amount field with a MAX button, over the button that sends it",
    narrow: { src: "/img/academy-phone-tab-repay.png", size: PHONE_TAB },
  },
  statsTop: {
    ...statsRow(0),
    alt: "The first row of the USDC vault's stats: APR 5.91%, Deposit 0.00 USDC, Debt 0.00 alUSD, and a Health Factor of infinity with nothing borrowed",
  },
  statsBottom: {
    ...statsRow(1),
    alt: "The second row of the USDC vault's stats: Earmarked 0.00 alUSD, Redemption Rate 90.61%, Borrowable 0.00 alUSD, and LTV 0.00 out of 90.00%",
  },
  positionBar: {
    src: "/img/borrowing-in-alchemix-02.png",
    size: [1610, 591],
    crop: { x: 0.0161, y: 0.7411, w: 0.9677, h: 0.1997 },
    alt: "A vault's bar, split into deposit, debt and earmarked, with MAX LTV and LIQ LTV marked near the right end",
    // No phone crop: this is a 1x capture, and at 390px the whole bar came out
    // about 25px tall. Half of it cut a legend word in two. It is hidden on
    // phones instead (`hideNarrow`).
    hideNarrow: true,
    dpr: 1,
  },
  fixedYieldCard: {
    src: "/img/academy-fixed-yield.png",
    size: [3200, 2500],
    // The same 30 px around the card as the vault card above. The Ethereum
    // alUSD card, the second on the page since 2026-11-12 (see `borrowCards`):
    // 4 Months, Mar 13, 2027, 9.10%, which lesson 8's caption quotes.
    crop: { x: 312 / 3200, y: 1472 / 2500, w: 2576 / 3200, h: 552 / 2500 },
    alt: "A card on the Fixed Yield page: projected fixed APR, deposit cap, term, early exit fee, maturity date and the alUSD price it quotes against",
    narrow: {
      crop: { x: 580 / 3200, y: 1566 / 2500, w: 600 / 3200, h: 390 / 2500 },
      alt: "The left of a Fixed Yield card: its projected fixed APR, deposit cap, term and early exit fee",
    },
  },
  fixedPositions: {
    src: "/img/redeem-alassets-02.png",
    size: [1557, 506],
    crop: { x: 0.0424, y: 0.0909, w: 0.9159, h: 0.8221 },
    dpr: 1,
    alt: "Open Fixed Yield positions, each with the APR it locked in, its end date, the alETH deposited, and the profit standing on it",
    narrow: {
      crop: { x: 104 / 1557, y: 196 / 506, w: 640 / 1557, h: 155 / 506 },
      alt: "Open Fixed Yield positions, each with the APR it locked in and its end date",
    },
  },
  strategies: {
    src: "/img/academy-vault-info.png",
    size: [1952, 432],
    // Inside the panel, under the tab strip: the capture ends under the
    // strategy list, so showing the panel's top edge without its bottom read
    // as a picture cut in half. The allocation alone, with the panel's own
    // background as its margin, reads as the detail it is.
    crop: { x: 240 / 1952, y: 150 / 432, w: 1472 / 1952, h: 282 / 432 },
    alt: "The allocation on a vault's Info tab: a chart of how the vault is split between its strategies, and each strategy listed with its risk level, APR and allocation",
    narrow: {
      crop: { x: 750 / 1952, y: 190 / 432, w: 790 / 1952, h: 210 / 432 },
      alt: "The strategy list on a vault's Info tab: each strategy with its risk level, APR and allocation",
    },
  },
  visualizer: {
    src: "/img/academy-visualizer.png",
    size: [2000, 1406],
    alt: "The Visualizer tab on a vault: four inputs (Yield APY, Redemption, alUSD:USDC and External APY), a duration slider, a projection of deposit, net value and debt, and under it the loan cost, aggregate yield and projected profit",
  },
};

/**
 * Narrow variants a lesson passes by hand, where the shot it uses is shared
 * with a lesson that points at a different part of it.
 */
export const NARROW = {
  debtHealth: phoneRow(212, 404, "Debt and Health Factor on the USDC vault: 0.00 alUSD owed, and a health factor of infinity with nothing borrowed"),
  earmarkedRedemption: phoneRow(412, 644, "Earmarked and Redemption Rate on the USDC vault: 0.00 alUSD earmarked, and the rate reading 90.61%"),
  borrowableLtv: phoneRow(652, 852, "Borrowable and LTV on the USDC vault: 0.00 alUSD to borrow, and LTV 0.00 out of 90.00%"),
  fixedPrice: {
    crop: { x: 1250 / 3200, y: 1040 / 2500, w: 540 / 3200, h: 350 / 2500 },
    alt: "The middle of a Fixed Yield card: its maturity date and the alUSD price it is quoting",
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
 * How a loss of backing is drawn, for a caller that passes `backingLoss` (no
 * lesson does now: since 2026-10-30 they show a loss in the practice vault, as
 * the app does, with the LTV rising to fixed markers). The fill and the LTV
 * figure stay at borrowed / deposited, and the liquidation
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
  // Measured on the effective LTV, because a loss inside the vault lowers what
  // the collateral is worth and the app's figure falls with it. It used to use
  // the LTV before the loss, so lesson 5 showed 1.00 in red beside "Effective
  // 150%", where the app would read 0.60.
  const health = debt > 0 ? capLtv / effective : Infinity;

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
        <div className={parts.cardStatLabel}>{caps(text)}</div>
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
            ), "var(--m-blue)")
          : null}
        {redemption != null
          ? stat("redemption", "Redemption rate", `${+(redemption * 100).toFixed(1)}%`, "var(--m-blue)")
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
            {/* The fill is the LTV, green while it is healthy. It was keyed
                "Borrowed", which put green on the loan (2026-10-30). */}
            <span className={parts.cardKeyDotDebt} />
            LTV
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
 * either a slider (`{ slider: { min, max, step } }`) or a set of questions
 * (`{ questions: [{ variant, prompt, choices }] }`), and this renders whichever
 * arrives. A choice checkpoint asks two questions and passes only when both are
 * right. A slider
 * lesson supplies how the value is read (`computeOf`) and what it is measured
 * against (`targetOf`). A choice lesson supplies neither.
 *
 * Choice options arrive in this learner's order and the answer goes back as the
 * index picked. Which option is right is never known here, so grading stays on
 * the server.
 *
 * A miss ends the attempt. The learner reads why each option they picked is
 * right or wrong, and the next attempt asks other questions from the bank
 * first. Leaving the same options on screen made the checkpoint answerable by
 * elimination. The numeric checkpoints already worked this way.
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
  /* Both tracks label this stage "Check". */
  stageLabel = "Check",
  /* Lesson 1 has two stages, so its checkpoint is stage 2. */
  stageNumber = 3,
  passTitle,
  passBody,
  /* Set on an article lesson: no "Stage 3 · Check" eyebrow, and the
     headline is an h2 under the page's own title. */
  inline = false,
  /* A frame that carries the submit button itself (the article
     lessons' footer). `liftSubmit` hides the body's button; `onSubmitState`
     hears whether an answer can be sent and gets the same submit the body's
     button would call. The retry stays in the body. */
  liftSubmit = false,
  onSubmitState,
  children,
}) {
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Which try this is, sent with each submission for the engine's answer log.
  const attempt = useRef(0);

  /**
   * Ask for questions, optionally excluding the variants just missed.
   *
   * A choice checkpoint passes the variants it missed, so a miss costs the
   * learner those questions rather than one of four options. `keep` is the
   * credit the miss returned for a question answered right: the engine serves
   * that question again as passed, and only the missed one is new.
   * A kept question arrives with its right option, which is
   * picked for the learner so the form is complete once they answer the rest.
   */
  const load = useCallback(
    (avoid, keep = null) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setPicked([]);
      fetchChallenge(base, lessonId, avoid, keep)
        .then((c) => {
          setChallenge(c);
          const qs = c.controls?.questions;
          if (Array.isArray(qs)) setPicked(qs.map((q) => (q.kept ? q.correctIndex : undefined)));
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

  const questions = challenge?.controls?.questions;
  const isChoice = Array.isArray(questions);
  const allPicked = isChoice && questions.every((_, i) => Number.isInteger(picked[i]));
  const settledNow = Boolean(result);
  const submitRef = useRef(null);
  submitRef.current = () => onSubmit();
  const canSend = Boolean(challenge) && isChoice && allPicked && !settledNow && !submitting;
  const passedNow = Boolean(result?.passed);
  useEffect(() => {
    if (onSubmitState) onSubmitState({ canSend, submitting, passed: passedNow, submit: () => submitRef.current() });
  }, [onSubmitState, canSend, submitting, passedNow]);

  async function onSubmit() {
    if (isChoice && !allPicked) return;
    setSubmitting(true);
    setError(null);
    attempt.current += 1;
    try {
      const res = await submitAnswer(base, {
        challenge: challenge.challenge,
        params: challenge.params,
        answer: isChoice ? questions.map((_, i) => picked[i]) : value,
        attempt: attempt.current,
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

  const eyebrow = inline ? null : `Stage ${stageNumber} · ${stageLabel}`;
  const level = inline ? 2 : 1;

  if (loading) {
    return (
      <Stage eyebrow={eyebrow} level={level}>
        <Sub>Your question is loading.</Sub>
      </Stage>
    );
  }

  if (error && !challenge) {
    return (
      <Stage eyebrow={eyebrow} level={level} headline="The check did not answer.">
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

  // Passed in this visit. A learner who finished the lesson earlier and comes
  // back gets a fresh draw they can answer: it used to arrive already settled,
  // options switched off and no answer marked, which read as broken.
  // Answering again changes nothing about their progress.
  const passed = Boolean(result?.passed);
  const again = done && !passed;
  const n = isChoice ? questions.length : 0;
  // "more", not "new": a lesson's bank holds three questions and a Check draws
  // two, so one of them has been asked before (2026-11-12).
  const title = isChoice
    ? again
      ? `You passed. Try ${n === 2 ? "two" : n} more questions.`
      : `Answer ${n === 2 ? "both questions" : `all ${n} questions`} to finish the lesson.`
    : headline;

  return (
    <Stage eyebrow={eyebrow} level={level} headline={title}>
      {/* A numeric checkpoint keeps a headline and a prompt: the headline names
          the task, the prompt carries this learner's figures. A choice
          checkpoint's prompts sit above each question's options instead. */}
      {isChoice ? null : <Sub>{challenge.prompt}</Sub>}
      <LocalNotice show={challenge.local} />
      {children}

      {isChoice ? (
        <ChoiceAnswer
          liftSubmit={liftSubmit}
          questions={questions}
          picked={picked}
          onPick={(slot, i) => setPicked((p) => { const next = [...p]; next[slot] = i; return next; })}
          allPicked={allPicked}
          result={result}
          passed={passed}
          submitting={submitting}
          onSubmit={onSubmit}
          onRetry={() =>
            load(
              (result?.results ?? []).filter((r) => !r.passed).map((r) => r.variant),
              result?.credits?.[0] ?? null,
            )
          }
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
        <div className={`${styles.passBox} ${passBody ? "" : styles.passBare}`}>
          <div className={`${styles.resultHead} ${styles.passHead}`}>{passTitle}</div>
          {passBody ? (
            <div className={styles.resultText}>
              <Body>{passBody}</Body>
            </div>
          ) : null}
        </div>
      ) : null}
    </Stage>
  );
}

/**
 * The same checkpoint. It used to set the beginner label "Check" as its
 * default; since both tracks say "Check" it is the plain checkpoint under the
 * name the beginner labs import. Any prop passed through wins.
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

/**
 * The choice body of a checkpoint: each question with its options, then one
 * submit for all of them.
 *
 * Once graded, every question shows the explanation for the option picked.
 * A question answered right marks that option green; one answered wrong marks
 * it amber, and which option was right stays hidden, because the next attempt
 * may ask it again.
 */
/**
 * The explanation under a graded question, marked right or wrong by a sign and
 * a word as well as by its color. A missed answer's card was only a different
 * tint with nothing saying it was wrong. The signs are the Academy's own
 * strokes rather than emoji, so they look the same on every
 * machine. The bank's right-answer text already opens with "Right.", which
 * becomes the label; a missed one gets "Not quite."
 */
function GradedNote({ right, text }) {
  const opens = right && typeof text === "string" && text.startsWith("Right. ");
  const label = right ? (opens ? "Right." : null) : "Not quite.";
  const body = opens ? text.slice("Right. ".length) : text;
  return (
    <div className={`${right ? styles.rightNote : styles.missBox} ${styles.gradedNote}`}>
      <span className={`${styles.gradedSign} ${right ? styles.gradedSignRight : styles.gradedSignMiss}`} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {right ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />}
        </svg>
      </span>
      <span>
        {label ? <strong className={styles.gradedLabel}>{label} </strong> : null}
        {body}
      </span>
    </div>
  );
}

function ChoiceAnswer({ questions, picked, onPick, allPicked, result, passed, submitting, onSubmit, onRetry, liftSubmit = false }) {
  const missed = Boolean(result && !result.passed);
  // A settled attempt, either way. The options stop taking clicks, because the
  // way on from a miss is new questions rather than a second guess at these.
  const settled = passed || missed;
  const wrong = (result?.results ?? []).filter((r) => !r.passed).length;
  // A miss that credits a question answered right: the retry keeps it.
  const kept = missed && (result?.credits?.length ?? 0) > 0;

  return (
    <>
      {questions.map((q, slot) => {
        const graded = result?.results?.[slot];
        return (
          <div key={`${q.variant}-${slot}`} className={styles.checkQuestion}>
            <div className={styles.checkQuestionHead}>
              <span className={styles.microLabel}>
                Question {slot + 1} of {questions.length}{q.kept ? " · Right last time" : ""}
              </span>
            </div>
            <div className={styles.question}>{withLive(q.prompt)}</div>
            <div className={styles.choices} role="radiogroup" aria-label={`Question ${slot + 1} options`}>
              {q.choices.map((text, i) => {
                const mine = picked[slot] === i;
                const state =
                  graded && mine ? (graded.passed ? styles.choiceRight : styles.choiceWrong)
                  : passed && graded?.correctIndex === i ? styles.choiceRight
                  : q.kept && mine ? styles.choiceRight
                  : mine ? styles.choiceOn
                  : "";
                return (
                  <button
                    key={text}
                    type="button"
                    role="radio"
                    aria-checked={mine}
                    className={`${styles.choice} ${state}`}
                    disabled={settled || Boolean(q.kept)}
                    onClick={() => onPick(slot, i)}
                  >
                    <span className={styles.choiceKey}>{KEYS[i] ?? i + 1}</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
            {graded?.feedback ? <GradedNote right={graded.passed} text={graded.feedback} /> : null}
          </div>
        );
      })}

      {!settled && !liftSubmit ? (
        <Actions aside={allPicked ? null : "Choose an option for each question."}>
          <button
            type="button"
            className={styles.primary}
            onClick={onSubmit}
            disabled={submitting || !allPicked}
          >
            {submitting ? "Checking..." : "Submit answers"}
          </button>
        </Actions>
      ) : null}

      {missed ? (
        <Actions
          aside={
            // The kept line and its button say what is saved and what comes
            // next: the old ones read "The one you got
            // right stays; ..." under a button saying "Try the other again".
            kept
              ? "Your correct answer is saved. The next attempt asks a new question in place of the one you missed."
              : `${wrong === 1 ? "One answer was" : "Both answers were"} wrong. The next attempt asks new questions on the same ground.`
          }
        >
          <button type="button" className={styles.primary} onClick={onRetry}>
            {kept ? "Try another question" : "Try new questions"}
          </button>
        </Actions>
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
      <span className={styles.noteLabel}>{caps(label)}</span>
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
  markers = [],
  /** The foot of the y axis. Zero unless a chart needs a lower bound to show its shape. */
  yMin = 0,
}) {
  // A series with `ghost` is drawn faint, for where a line stood before the
  // learner moved a control. `markers` are labeled points: { x, y, label, color },
  // with `below: true` to set the label under the point.
  const [ref, width] = useElementWidth();

  const narrow = width < 480;
  const w = Math.max(width, 260);
  const h = narrow ? 190 : 240;
  const m = { top: 18, right: 14, bottom: 34, left: narrow ? 46 : 58 };

  const plotW = Math.max(w - m.left - m.right, 10);
  const plotH = Math.max(h - m.top - m.bottom, 10);

  const x = (v) => m.left + (xMax > 0 ? v / xMax : 0) * plotW;
  const span = yMax - yMin;
  const y = (v) => m.top + (1 - (span > 0 ? (v - yMin) / span : 0)) * plotH;

  const path = (points) =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)}`)
      .join(" ");

  const ys = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (span / yTicks) * i);
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
              opacity={s.ghost ? 0.35 : undefined}
            />
          ))}

          {markers.map((p) => (
            <g key={`${p.x}-${p.y}-${p.label}`}>
              <circle cx={x(p.x)} cy={y(p.y)} r={4} fill={p.color ?? "var(--m-copper)"} />
              {p.label ? (
                <text
                  x={x(p.x)}
                  y={p.below ? y(p.y) + 17 : y(p.y) - 9}
                  className={styles.markerText}
                  textAnchor={x(p.x) > w - 60 ? "end" : x(p.x) < m.left + 40 ? "start" : "middle"}
                >
                  {p.label}
                </text>
              ) : null}
            </g>
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

/* ── Beginner track parts ────────────────────────────────── */

/**
 * A lesson control: a button for something the app has no button for, such
 * as time passing or a price moving ("Skip ahead a year", "Run redemption",
 * "Drop the price", "Apply a 10% loss"). Drawn apart from the app's buttons,
 * which the practice vault draws in the app's outline style, and from the
 * lesson's own copper "Next": a dashed copper outline with a skip glyph, on
 * its own row under the figure, so no learner takes it for a button in the app.
 */
export function LessonControl({ onClick, disabled, hint = null, children }) {
  // On the article lessons a control does not say "Finish the earlier step
  // first": the footer says what to do, and a done moment's control kept it.
  const why = useControlReason(disabled, hint);
  return (
    <div className={parts.controlRow}>
      <button type="button" className={parts.lessonControl} onClick={onClick} disabled={disabled}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 5v14l8-7zM12 5v14l8-7z" />
        </svg>
        {children}
      </button>
      {why ? <p className={parts.controlHint}>{why}</p> : null}
    </div>
  );
}

/**
 * The lesson's caveat, under its "In the app" line: one sentence in the same
 * small style, on the last screen before Check.
 */
export function Caveat({ children }) {
  return <p className={parts.caveat}>{children}</p>;
}

/**
 * A numbered list of steps, each a sentence with its figures under it, for a
 * sequence that has to be read in order (what a liquidation takes, where a
 * Fixed Yield claim's USDC comes from). A figure is `{ label, value, tone }`;
 * `tone: "bad"` draws it in the app's red, for a loss or a liquidation.
 */
export function StepList({ steps }) {
  return (
    <ol className={parts.stepList}>
      {steps.map((st, i) => (
        <li key={i} className={parts.stepItem}>
          <span className={parts.stepItemNum}>{i + 1}</span>
          <div className={parts.stepItemBody}>
            <div className={parts.stepItemText}>{st.text}</div>
            {st.figures?.length ? (
              <div className={parts.stepFigs}>
                {st.figures.map((f) => (
                  <span key={f.label} className={parts.stepFig}>
                    <span className={parts.stepFigLabel}>{f.label}</span>
                    <span className={`${parts.stepFigValue} ${f.tone === "bad" ? parts.stepFigBad : ""}`}>{f.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Which lesson the text on screen belongs to, for `Term`. LessonPage sets it
 * around the lab.
 */
/** A layout effect in the browser; the server takes the plain effect. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const LessonContext = createContext(null);
export const LessonProvider = LessonContext.Provider;

const lessonIndex = (id) => ALL_LESSONS.findIndex((l) => l.id === id);

/**
 * A defined word in lesson text, tappable from its owning lesson onward.
 *
 *   <Sub>A vault is where your <Term id="deposit">deposit</Term> goes.</Sub>
 *
 * A quiet dotted underline, no color change. A tap, a click or Enter opens its
 * one definition sentence (from lib/terms.js) in a small popover, which closes
 * on a tap anywhere else or Escape. Wrapped by hand where the word occurs:
 * never on a headline, a button, or the screen that defines the word, which is
 * the definition. Before its owning lesson the word renders as plain text.
 */
export function Term({ id, children }) {
  const lesson = useContext(LessonContext);
  const entry = TERMS[id];
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const [above, setAbove] = useState(false);
  const wrap = useRef(null);
  const pop = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    const key = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  // Keep the popover inside the window: a word near the right edge of a
  // phone's column would push it past the screen. And keep it clear of a
  // pinned footer (lesson 1's Mixed Yield, in a caption
  // near the foot of the window, opened under the article lessons' pinned
  // footer): a popover that would run under it opens above the word
  // instead, when there is more room above, below any pinned header.
  // Measured before paint, so it never shows in the wrong place first.
  useIsoLayoutEffect(() => {
    if (!open || !pop.current || !wrap.current) return;
    const r = pop.current.getBoundingClientRect();
    const room = window.innerWidth - 12;
    if (r.right > room) setShift(room - r.right);
    else if (r.left < 12) setShift(12 - r.left);
    const pinned = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const pos = getComputedStyle(el).position;
      return pos === "fixed" || pos === "sticky" ? el.getBoundingClientRect() : null;
    };
    const foot = pinned("footer");
    const head = pinned("header");
    const floor = (foot ? foot.top : window.innerHeight) - 8;
    const ceiling = (head ? head.bottom : 0) + 8;
    const word = wrap.current.getBoundingClientRect();
    setAbove(r.bottom > floor && word.top - ceiling > floor - word.bottom);
  }, [open]);

  const live = entry && lessonIndex(lesson) >= 0 && lessonIndex(lesson) >= lessonIndex(entry.lesson);
  if (!live) return <>{children}</>;

  return (
    <span className={parts.termWrap} ref={wrap}>
      <button
        type="button"
        className={parts.term}
        aria-expanded={open}
        data-term={id}
        onClick={() => {
          setShift(0);
          setAbove(false);
          setOpen((o) => !o);
        }}
      >
        {children}
      </button>
      {open ? (
        <span
          className={`${parts.termPop} ${above ? parts.termPopAbove : ""}`}
          role="note"
          ref={pop}
          style={shift ? { transform: `translateX(${shift}px)` } : undefined}
        >
          {/* A blank line in a term's text starts a new paragraph (a long
              definition in one block is hard to take in). */}
          {String(entry.text)
            .split(/\n\s*\n/)
            .map((para, i) => (
              <span key={i} className={parts.termPara}>
                {para.trim()}
              </span>
            ))}
          {/* The docs page that covers the word, in a new tab so the lesson
              keeps its place (as the header's Docs link does). */}
          {entry.docs ? (
            <Link to={entry.docs} className={parts.termMore} target="_blank" rel="noopener noreferrer">
              Read more in the docs
            </Link>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/**
 * The stage labels. Both tracks say Learn, Try, Check (since 2026-11-03);
 * the intermediate track said Predict, Explore, Checkpoint until then. The ids
 * stay as they were, because the engine and the pages key on them, and the
 * address follows the label (#try, #check). LessonPage's default matches.
 */
export const BEGINNER_STAGES = [
  { id: "predict", label: "Learn" },
  { id: "explore", label: "Try" },
  { id: "checkpoint", label: "Check" },
];

export const INTERMEDIATE_STAGES = BEGINNER_STAGES;
