import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { useReducedMotion, useTween } from "./motion";

export { useBefore, useReducedMotion, useTween } from "./motion";

/**
 * What the page around a practice element asks of it (2026-11-07). The
 * article lessons set it (ArticleLesson); every other user of these parts
 * gets the default and draws as before.
 *
 *   stat     the stat the reader is pointing at in the text (`<Stat>`):
 *            a tile key, "wallet", "available", "manage", "maxltv" or
 *            "liqltv". That part is outlined in copper with a soft glow.
 *   hints    false keeps a switched-off button's reason off the element
 *            (it goes in the button's title; the lesson's footer says it).
 *   auto     amounts show two decimals when they are not whole (9,999.48)
 *            and none when they are, whatever `digits` a screen passes.
 *   slow     the tween and the wash run long enough to watch (1.6 s, 3 s),
 *            and a part that appears grows into place (`Grow`).
 */
const AppContext = React.createContext({ stat: null, statIn: null, hints: true, auto: false, slow: false });
export const AppContextProvider = AppContext.Provider;
export function useAppContext() {
  return React.useContext(AppContext);
}

/**
 * Where a `<Stat>` is aimed. `statIn` in the context
 * is null for a plain `<Stat name="deposit">`, which lights the tile on every
 * practice element on the page and the strip's field. `<Stat figure>` sets it
 * to "figure": the page's figures light and the strip does not, for a
 * sentence about a what-if copy whose numbers are not the wallet's.
 * `<Stat in="after">` sets it to a scope's name: only the tiles inside
 * `<StatScope name="after">` light, so a sentence can pick one of two copies
 * of the vault in one figure.
 */
const ScopeContext = React.createContext(null);

/** Marks part of a figure as the scope a `<Stat in="name">` lights. */
export function StatScope({ name, children }) {
  return <ScopeContext.Provider value={name}>{children}</ScopeContext.Provider>;
}

/**
 * `pointed(key)`: whether the text is pointing at this stat here, taking the
 * Stat's aim into account. Use it in a figure in place of `stat === key`.
 *
 *   const pointed = usePointed();
 *   <Tile lit={pointed("ltv")} />
 */
export function usePointed() {
  const { stat, statIn } = React.useContext(AppContext);
  const scope = React.useContext(ScopeContext);
  return React.useCallback(
    (key) => stat != null && stat === key && (statIn == null || statIn === "figure" || statIn === scope),
    [stat, statIn, scope],
  );
}

/**
 * The reason a switched-off control gives when an earlier moment is not done.
 * On the article lessons (`hints` false) it is never shown: the footer says
 * what to do next, and a moment that is done keeps its button switched off,
 * where this reason was wrong ("Finish the earlier step
 * first" on a button whose step was finished).
 */
export const NOT_READY = "Finish the earlier step first";

/** A control's reason, or nothing where the article lessons leave it out. */
export function useControlReason(disabled, hint) {
  const { hints } = React.useContext(AppContext);
  if (!disabled || !hint) return undefined;
  if (!hints && hint === NOT_READY) return undefined;
  return hint;
}

/** True when a figure has no cents worth showing. */
export const isWhole = (n) => !Number.isFinite(n) || Math.abs(n - Math.round(n)) < 0.005;
/** The decimals an amount shows under `auto`: none when whole, two when not. */
const autoDigits = (n, digits, auto) => (auto && digits < 2 && !isWhole(n) ? 2 : digits);
/** The tween's length on the article lessons: long enough to watch. */
export const SLOW_TWEEN = 1600;

/**
 * A practice copy of the app's vault screen, for a lesson to teach inside.
 *
 * The parts follow `src/components/vault/Vault.tsx` and
 * `src/components/common/UniversalInput.tsx` in the app's repo: the same labels,
 * order, icons and colors, so what a learner does here is what they find when
 * they open the app. The colors are the app's own (see styles.module.css) and
 * stay inside these parts. The rest of the Academy keeps its own palette.
 *
 * Nothing here holds state. A lab owns the numbers and passes them down, the
 * way it does for PositionCard, so a lesson can gate a stage on what the learner
 * entered. `AppFrame` carries the "Practice vault" tag, so a learner never
 * mistakes the copy for the app with real money in it. Where nothing can be
 * operated, pass `tag="Example"`. The frame sets the 2rem every lesson block ends
 * on; pass `tight` when a line of working sits directly under it.
 *
 *   <AppFrame asset="USDC">
 *     <AppStats asset="USDC" tiles={["deposit", "debt"]} deposit={d} debt={b} />
 *     <AppBar deposit={d} debt={b} marks={false} />
 *     <AppTabs tabs={["Deposit/Borrow", "Repay"]} active={tab} onChange={setTab} />
 *     <AppPanel>
 *       <AppInput token="USDC" amount={v} onChange={setV} balance={10000} />
 *       <AppButton onClick={...}>Deposit</AppButton>
 *     </AppPanel>
 *   </AppFrame>
 *
 * Showing a change. The app puts the new value beside the old one with an
 * arrow while an amount is typed (`ProjectedValue.tsx`), green when it rises
 * and red when it falls, the other way round for Debt, Earmarked and LTV.
 * `preview` draws that arrow. After the action, `prev` (the state just before
 * it, from `useBefore` in motion.js) leaves the trace: a chip with the change on
 * each tile that moved ("+4,500.00 alUSD", or "was 2.00" for a ratio), a dashed
 * outline of the bar's old fill, and a short tween from the old numbers to the
 * new ones. The tween runs only when `prev` changes, so a figure that follows a
 * slider jumps with it, and never under reduced motion. The chip is a figure:
 * a sentence beside the frame does not repeat it.
 *
 * The chips that stay after an action are one neutral grey by default, with
 * their sign: the tile chips, `AppInput`'s balance change, `AppDelta` and the
 * Fixed Yield card's "was" values. The learner's own borrow or withdrawal used
 * to land as a row of red, which read as a warning on a teaching screen. Red is
 * for a loss and a liquidation, and a lab that means one says so:
 * `chipTone="app"` on `AppStats` (or `AppInput`) brings back the app's green
 * and red, and `<AppDelta tone="bad">` marks one chip. The `preview` arrow
 * keeps the app's colors always, because it mirrors the app's own arrow.
 */

const iconPath = (name) => `/img/academy-app/${name}.svg`;

const number = (n, digits = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** The app's health factor: the cap over the LTV, and infinite with no debt. */
export function healthFactor(deposit, debt, capLtv = 0.9) {
  if (!(debt > 0)) return Infinity;
  if (!(deposit > 0)) return 0;
  return capLtv / (debt / deposit);
}

/**
 * Dollars as the Dashboard's summary bar prints them: compact, two decimals,
 * cut rather than rounded ($10.00K, $4.90K). The app's `formatNumber` with
 * `compact` and `isCurrency` (`DashboardSummary.tsx`, same in the live bundle
 * of 2026-11-10).
 */
export function compactUsd(n) {
  const v = Math.max(Number(n) || 0, 0);
  const cut = (x) => (Math.floor(x * 100 + 1e-6) / 100).toFixed(2);
  for (const [size, unit] of [[1e9, "B"], [1e6, "M"], [1e3, "K"]]) if (v >= size) return `$${cut(v / size)}${unit}`;
  return `$${cut(v)}`;
}

/** Ethereum's mark, white, as the app's chain icon draws it. */
function EthMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2 5 10.2l5 2.9 5-2.9z" fill="#fff" opacity="0.9" />
      <path d="M10 2v11.1l5-2.9z" fill="#fff" opacity="0.55" />
      <path d="M10 14.3 5 11.4 10 18l5-6.6z" fill="#fff" opacity="0.9" />
      <path d="M10 14.3V18l5-6.6z" fill="#fff" opacity="0.55" />
    </svg>
  );
}

/**
 * The chain flag every card in the app carries at its top left corner
 * (`VaultCard.tsx`, `TransmuterCard.tsx`, `VaultDashboardCard.tsx`): a 40 by
 * 24 tab in the chain's color with its icon. Ethereum's here, since every
 * practice position is on Ethereum.
 */
export function ChainFlag() {
  return (
    <span className={styles.flag} aria-hidden="true">
      <EthMark />
    </span>
  );
}

/** The chain line under a name: the chain's round icon and its name. */
export function ChainLine({ children = "Ethereum" }) {
  return (
    <span className={styles.chainLine}>
      <span className={styles.chainDot} aria-hidden="true">
        <EthMark size={12} />
      </span>
      {children}
    </span>
  );
}

/** The app's small "i" beside a label that has a tooltip. Drawn, not operable. */
export function AppInfo() {
  return (
    <svg className={styles.infoIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

/** The app's Slippage line under an amount box: the setting and its icon. Drawn, not operable. */
export function AppSlippage({ value = "0.5%" }) {
  return (
    <div className={styles.slip} aria-hidden="true">
      <span>Slippage</span>
      <b>{value}</b>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-9M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
      </svg>
    </div>
  );
}

/**
 * `strong` draws the tag in copper, for the beginner track's practice vault,
 * whose first appearance has to say plainly that it is not the app. `head`
 * is anything to sit under the vault's name, such as the learner's wallet.
 */
export function AppFrame({ title, asset = "USDC", tag = "Practice vault", tight = false, strong = false, head = null, children }) {
  const icon = useBaseUrl(iconPath(asset));
  const name = title ?? `Risk-adjusted Mix ${asset}`;
  return (
    <section
      className={`${styles.frame} ${tight ? styles.frameTight : ""}`}
      aria-label={`Practice copy of the app's ${name} vault`}
    >
      <div className={styles.top}>
        <div className={styles.vault}>
          <img src={icon} alt="" className={styles.vaultIcon} width="40" height="40" />
          <div>
            <div className={styles.vaultName}>{name}</div>
            <div className={styles.vaultChain}><ChainLine /></div>
          </div>
        </div>
        <span className={`${styles.practice} ${strong ? styles.practiceStrong : ""}`}>{tag}</span>
      </div>
      {head}
      {children}
    </section>
  );
}

/**
 * The stat tiles, in the app's order. `tiles` names the ones a lesson has
 * taught, so a beginner never sees a term before the lesson reaches it.
 * `highlight` names a tile to outline in copper.
 *
 * `preview` is the state the typed amount would make (`{ debt: debt + typed }`),
 * drawn as the app's arrow. `prev` is the state before the last action, drawn as
 * the chip under each tile that moved. Passing either prop, even as null,
 * reserves the line under the values so nothing below jumps when one appears.
 * `price` shows the token amounts in dollars, as the app's currency switch does.
 * `chipTone` colors the `prev` chips: "neutral" (the default) draws them grey
 * with their sign; "app" draws them in the app's green and red, for a lab that
 * marks a loss or a gain on purpose (a liquidation, a loss inside the vault).
 */
export function AppStats({
  tiles = ["deposit", "debt"],
  asset = "USDC",
  al = asset === "USDC" ? "alUSD" : "alETH",
  apr = null,
  deposit = 0,
  debt = 0,
  earmarked = 0,
  redemptionRate = null,
  capLtv = 0.9,
  highlight = null,
  preview,
  prev,
  price = null,
  /** The price the `prev` state was shown at, for a chip that says what the dollars were. */
  prevPrice = null,
  chipTone = "neutral",
  /**
   * The tiles a lesson has taught, for a frame that shows all eight in the
   * app's order. A tile left out is drawn dimmed with no label and no figure,
   * so the screen keeps the app's shape without naming a term too early.
   * Left undefined, every tile in `tiles` is shown in full.
   */
  taught,
  /** Decimals on amounts, on APR and Redemption Rate, and on LTV. The app shows two of each. */
  digits = 2,
  ratioDigits = 2,
  ltvDigits = 2,
  /** Decimals a change chip may show, when it differs from `digits`. */
  chipDigits = null,
  /**
   * A soft copper wash over each tile the last action changed, fading over
   * about 1.2 seconds, on top of the tween and the chip (the article
   * lessons). Off by default, so other labs are as they were.
   */
  wash = false,
}) {
  const base = { apr, deposit, debt, earmarked, redemptionRate, capLtv };
  const now = figures(base);
  const ahead = preview ? figures({ ...base, ...preview }) : null;
  const before = prev ? figures({ ...base, ...prev }) : null;
  const reserve = preview !== undefined || prev !== undefined;
  const unit = { asset, al };
  const lit = Array.isArray(highlight) ? highlight : highlight ? [highlight] : [];
  const places = { digits, ratioDigits, ltvDigits, chipDigits };
  const pointed = usePointed();
  // Eight tiles sit four to a row as in the app, and six three to a row. Fewer share one row.
  const perRow = tiles.length === 8 ? 4 : tiles.length === 6 ? 3 : tiles.length;
  return (
    <div className={styles.stats} style={{ "--app-tiles": perRow }}>
      {tiles.map((key) =>
        taught && !taught.includes(key) ? (
          <DimTile key={key} kind={key} />
        ) : (
          <AppTile
            key={key}
            kind={key}
            value={now[key]}
            ahead={ahead ? ahead[key] : null}
            before={before ? before[key] : null}
            play={prev}
            unit={unit}
            price={price}
            prevPrice={prevPrice}
            chipTone={chipTone}
            capLtv={capLtv}
            reserve={reserve}
            on={lit.includes(key)}
            pointed={pointed(key)}
            places={places}
            wash={wash}
          />
        ),
      )}
    </div>
  );
}

/**
 * A counter that steps each time `play` changes and `changed` is true, so a
 * span keyed on it remounts and its fade runs again. Never on the first
 * render, so a page that loads with a moment already done plays nothing.
 */
export function useWash(on, play, changed) {
  const [key, setKey] = React.useState(0);
  const last = React.useRef(play);
  React.useEffect(() => {
    if (on && play !== last.current && changed) setKey((k) => k + 1);
    last.current = play;
  }, [on, play, changed]);
  return key;
}

/** A tile the lesson has not taught yet: its place on the page, and nothing to read. */
function DimTile({ kind }) {
  const spec = TILES[kind];
  const src = useBaseUrl(spec.icon ? iconPath(spec.icon) : "/");
  return (
    <div className={`${styles.tile} ${styles.tileDim}`} aria-hidden="true">
      {spec.icon ? <img src={src} alt="" className={styles.tileIcon} width="40" height="40" /> : null}
      <div className={styles.tileText}>
        <div className={styles.tileLabel}>{spec.label}</div>
        <div className={styles.tileValue}>&ndash;</div>
      </div>
    </div>
  );
}

/** Each tile's figure as a plain number, so an old and a new one can be compared. */
function figures({ apr, deposit, debt, earmarked, redemptionRate, capLtv }) {
  const ltv = deposit > 0 ? debt / deposit : 0;
  return {
    apr: apr == null ? null : apr * 100,
    deposit,
    debt,
    health: healthFactor(deposit, debt, capLtv),
    earmarked,
    redemption: redemptionRate == null ? null : redemptionRate * 100,
    borrowable: Math.max(deposit * capLtv - debt, 0),
    ltv: ltv * 100,
  };
}

/**
 * Each tile's label, icon and unit, and whether a rise is bad news (the app's
 * `invertColors`). A ratio's trace reads "was 2.00"; an amount's is the signed
 * change.
 */
const TILES = {
  apr: { label: "APR", icon: "apr", unit: "%", ratio: true },
  deposit: { label: "Deposit", icon: "deposited", unit: "asset" },
  debt: { label: "Debt", icon: "debt", unit: "al", invert: true },
  health: { label: "Health Factor", icon: "health", unit: "", ratio: true },
  earmarked: { label: "Earmarked", unit: "al", invert: true },
  redemption: { label: "Redemption Rate", unit: "%", ratio: true, neutral: true },
  borrowable: { label: "Borrowable", unit: "al" },
  ltv: { label: "LTV", unit: "%", ratio: true, invert: true },
};

function same(a, b) {
  if (a == null || b == null) return a == null && b == null;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  return Math.abs(a - b) < 0.005;
}

function tone(spec, from, to) {
  if (spec.neutral || same(from, to)) return "";
  const up = !Number.isFinite(to) || (Number.isFinite(from) && to > from);
  return up !== Boolean(spec.invert) ? styles.good : styles.bad;
}

function AppTile({ kind, value, ahead, before, play, unit, price, prevPrice = null, capLtv, reserve, on, pointed = false, chipTone, places = {}, wash = false }) {
  const spec = TILES[kind];
  const src = useBaseUrl(spec.icon ? iconPath(spec.icon) : "/");
  const { auto, slow } = useAppContext();
  const shown = useTween(value ?? 0, play, slow ? SLOW_TWEEN : 700);
  const washKey = useWash(wash, play, before != null && value != null && !same(before, value));
  const inDollars = price != null && (spec.unit === "asset" || spec.unit === "al");
  // Under `auto` the decimals follow where the number is going, not the
  // tween's in-between values, so the format never flickers.
  const amountDigits = autoDigits(value ?? 0, places.digits ?? 2, auto);
  const pctDigits = kind === "ltv" ? places.ltvDigits ?? 2 : places.ratioDigits ?? 2;
  const amount = (n) => (inDollars ? `$${number(n * price)}` : number(n, amountDigits));
  // A change chip can carry cents the tile rounds away (a 0.73 fee), up to
  // `chipDigits` places with trailing zeros dropped.
  const chipAmount = (n) =>
    inDollars
      ? amount(n)
      : places.chipDigits != null
        ? Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: places.chipDigits })
        : auto
          ? number(n, isWhole(n) ? 0 : 2)
          : amount(n);
  const symbol = !inDollars && spec.unit === "asset" ? unit.asset : !inDollars && spec.unit === "al" ? unit.al : "";
  const plain = (n) => {
    if (n == null) return "-";
    if (!Number.isFinite(n)) return "∞";
    // Cut to two decimals, not rounded, as the app prints it: a live position
    // whose 0.9 / LTV came to 2.0484 read 2.04 (2026-11-12). The intermediate
    // tiles already cut (`trunc`). The small term keeps an exact 1.62 from
    // landing on 1.61.
    if (kind === "health") return number(Math.floor(n * 100 + 1e-9) / 100, 2);
    return spec.unit === "%" ? `${number(n, pctDigits)}%` : amount(n);
  };

  let main;
  if (value == null) main = "-";
  else if (kind === "ltv")
    main = (
      <>
        {number(shown, pctDigits)}
        <span className={styles.ltvCap}>/{number(capLtv * 100, pctDigits)}%</span>
      </>
    );
  else main = symbol ? `${plain(shown)} ${symbol}` : plain(Number.isFinite(value) ? shown : value);

  let note = null;
  if (ahead != null && !same(value, ahead)) {
    note = (
      <span className={`${styles.ahead} ${tone(spec, value, ahead)}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {plain(ahead)}
      </span>
    );
  } else if (inDollars && prevPrice != null && before != null && (kind === "deposit" || kind === "debt")) {
    // A price move: the token amount is the same, so the chip says what the dollars were (the two sides only).
    note = <span className={`${styles.delta} ${chipTone === "app" ? tone(spec, before * prevPrice, value * price) : ""}`}>{`was $${number(before * prevPrice)}`}</span>;
  } else if (kind === "ltv" && price != null && before != null && value != null && same(before, value)) {
    note = <span className={styles.delta}>unchanged</span>;
  } else if (before != null && value != null && !same(before, value)) {
    const text = spec.ratio
      ? `was ${plain(before)}`
      : `${value > before ? "+" : "-"}${chipAmount(Math.abs(value - before))}${symbol ? ` ${symbol}` : ""}`;
    note = <span className={`${styles.delta} ${chipTone === "app" ? tone(spec, before, value) : ""}`}>{text}</span>;
  }

  return (
    <div className={`${styles.tile} ${on || pointed ? styles.tileOn : ""} ${pointed ? styles.pointed : ""}`}>
      {washKey ? <span key={washKey} className={styles.wash} aria-hidden="true" /> : null}
      {spec.icon ? <img src={src} alt="" className={styles.tileIcon} width="40" height="40" /> : null}
      <div className={styles.tileText}>
        <div className={styles.tileLabel}>{spec.label}</div>
        <div className={styles.tileValue}>{main}</div>
        {reserve || note ? <div className={styles.tileNote}>{note}</div> : null}
      </div>
    </div>
  );
}

/**
 * The app's position bar. The whole track is the deposit, the blue fill is the
 * debt as a share of it, and the earmarked part sits at the fill's leading edge.
 * `marks` draws both limits: true, "cap" for MAX LTV alone, or false until a
 * lesson has taught them.
 *
 * `prev` leaves a dashed outline of the fill before the last action and eases
 * the fill from there. The fill is a ratio, so a withdrawal (a smaller deposit)
 * lengthens it with the debt unchanged: pair the outline with the tiles' chips.
 */
/**
 * For the beginner track's practice vault, `taught` names what the bar may
 * label ("debt", "earmarked", "max", "liq"). With it set, both markers are
 * always drawn, as the app draws them, and a marker not yet taught is dimmed
 * with no tag; the legend names only the bands taught. `lit` names the parts
 * a screen is about ("deposit", "debt", "earmarked", "max", "liq"); the rest
 * fade while it is set. Callers that pass neither get the bar as before.
 */
export function AppBar({ deposit = 0, debt = 0, earmarked = 0, capLtv = 0.9, liqLtv = 0.95, marks = true, legend = true, prev, taught, lit }) {
  const pct = (x) => `${Math.min(Math.max(x, 0), 1) * 100}%`;
  const ratio = (dep, d) => (dep > 0 ? d / dep : 0);
  const target = ratio(deposit, debt);
  const { slow } = useAppContext();
  const fill = useTween(target, prev, slow ? SLOW_TWEEN : 700);
  const mark = useTween(deposit > 0 ? Math.min(earmarked, debt) / deposit : 0, prev, slow ? SLOW_TWEEN : 700);
  const was = prev ? ratio(prev.deposit ?? deposit, prev.debt ?? debt) : null;
  // No outline for an empty bar: from nothing, the fill itself is the change.
  const moved = was != null && was > 0.0005 && Math.abs(was - target) > 0.0005;
  if (taught) {
    return (
      <TaughtBar
        fill={fill} mark={mark} was={was} moved={moved} target={target} deposit={deposit} earmarked={earmarked}
        capLtv={capLtv} liqLtv={liqLtv} taught={taught} lit={lit} pct={pct}
      />
    );
  }
  return (
    <div className={styles.barWrap}>
      <div
        className={`${styles.bar} ${deposit > 0 ? "" : styles.barEmpty}`}
        role="img"
        aria-label={`Debt is ${(target * 100).toFixed(1)}% of the deposit${moved ? `, from ${(was * 100).toFixed(1)}%` : ""}.`}
      >
        <span className={styles.barDebt} style={{ width: pct(fill) }} />
        {mark > 0.0005 ? (
          <span className={styles.barEarmark} style={{ left: pct(fill - mark), width: pct(mark) }} />
        ) : null}
        {moved ? <span className={styles.barGhost} style={{ width: pct(was) }} /> : null}
        {marks ? <span className={styles.barMax} style={{ left: pct(capLtv) }} /> : null}
        {marks === true ? <span className={styles.barLiq} style={{ left: pct(liqLtv) }} /> : null}
      </div>
      {marks ? (
        <div className={`${styles.barTags} ${marks === true ? styles.barTagsBoth : ""}`}>
          <span className={styles.tagMax} style={{ right: `calc(${(1 - capLtv) * 100}% + 0.5rem)` }}>MAX LTV</span>
          {marks === true ? (
            <span className={styles.tagLiq} style={liqLtv > 0.9 ? { right: 0 } : { left: pct(liqLtv) }}>LIQ LTV</span>
          ) : null}
        </div>
      ) : null}
      {legend ? (
        <div className={styles.legend}>
          <span><i className={styles.dotDeposit} />Deposit</span>
          <span><i className={styles.dotDebt} />Debt</span>
          {earmarked > 0 ? <span><i className={styles.dotEarmark} />Earmarked</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function TaughtBar({ fill, mark, was, moved, target, deposit, earmarked, capLtv, liqLtv, taught, lit, pct }) {
  const has = (k) => taught.includes(k);
  const isPointed = usePointed();
  // `<Stat name="maxltv">` in the text lights the MAX LTV marker and its tag.
  const pointed = (k) => has(k) && isPointed(`${k}ltv`);
  const fading = Boolean(lit && lit.length);
  const fade = (k) => (pointed(k) ? "" : fading && !lit.includes(k) ? styles.barFade : "");
  const markCls = (k) => `${has(k) ? fade(k) : styles.barMarkDim} ${pointed(k) ? styles.markPointed : ""}`;
  return (
    <div className={styles.barWrap}>
      <div
        className={`${styles.bar} ${deposit > 0 ? "" : styles.barEmpty} ${fading && !lit.includes("deposit") ? styles.barTrackFade : ""}`}
        role="img"
        aria-label={`Debt is ${(target * 100).toFixed(1)}% of the deposit${moved ? `, from ${(was * 100).toFixed(1)}%` : ""}.`}
      >
        <span className={`${styles.barDebt} ${fade("debt")}`} style={{ width: pct(fill) }} />
        {mark > 0.0005 ? (
          <span className={`${styles.barEarmark} ${fade("earmarked")}`} style={{ left: pct(fill - mark), width: pct(mark) }} />
        ) : null}
        {moved ? <span className={styles.barGhost} style={{ width: pct(was) }} /> : null}
        <span className={`${styles.barMax} ${markCls("max")}`} style={{ left: pct(capLtv) }} />
        <span className={`${styles.barLiq} ${markCls("liq")}`} style={{ left: pct(liqLtv) }} />
      </div>
      {has("max") || has("liq") ? (
        <div className={`${styles.barTags} ${has("max") && has("liq") ? styles.barTagsBoth : ""}`}>
          {has("max") ? (
            <span className={`${styles.tagMax} ${fade("max")} ${pointed("max") ? styles.tagPointed : ""}`} style={{ right: `calc(${(1 - capLtv) * 100}% + 0.5rem)` }}>MAX LTV</span>
          ) : null}
          {has("liq") ? (
            <span className={`${styles.tagLiq} ${fade("liq")} ${pointed("liq") ? styles.tagPointed : ""}`} style={liqLtv > 0.9 ? { right: 0 } : { left: pct(liqLtv) }}>LIQ LTV</span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.legend}>
        <span className={fade("deposit")}><i className={styles.dotDeposit} />Deposit</span>
        {has("debt") ? <span className={fade("debt")}><i className={styles.dotDebt} />Debt</span> : null}
        {has("earmarked") ? <span className={fade("earmarked")}><i className={styles.dotEarmark} />Earmarked</span> : null}
      </div>
    </div>
  );
}

/**
 * The action tabs. Pass only the tabs a lesson uses, in the app's order, or
 * pass all six with `live` naming the one the screen uses: the rest are shown
 * as the app shows them, quiet and switched off. `lit` outlines the live tab
 * in copper, as a lit tile is, so a reader sees which tab they are on.
 */
export function AppTabs({ tabs, active, onChange, live, lit = false }) {
  const on = live ?? active;
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((t) => {
        const quiet = live != null && t !== live;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === on}
            disabled={quiet}
            className={`${styles.tab} ${t === on ? styles.tabOn : ""} ${quiet ? styles.tabQuiet : ""} ${lit && t === on ? styles.tabLit : ""}`}
            onClick={() => onChange && onChange(t)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The panel under the tabs: the card the inputs and the button sit in.
 *
 * In the app the action button is part of the last amount box, inside its
 * border (live vault page, 2026-11-10: Deposit/Borrow's button sits in the
 * alUSD box, Withdraw's and Repay's in their one box). A lesson passes the
 * input and the button as siblings, so the panel moves a button that directly
 * follows an input into that input's box. Anything else is left where it is.
 */
export function AppPanel({ children }) {
  const items = React.Children.toArray(children);
  const out = [];
  for (const item of items) {
    const last = out[out.length - 1];
    if (React.isValidElement(item) && item.type === AppButton && React.isValidElement(last) && last.type === AppInput) {
      out[out.length - 1] = React.cloneElement(last, {}, last.props.children, item);
    } else out.push(item);
  }
  return <div className={styles.panel}>{out}</div>;
}

/**
 * One amount row: token, amount, dollar value, balance and MAX. `type` is the
 * app's word for the limit, "Balance" or "Available". An amount over the limit
 * turns red, as it does in the app. Leave `onChange` off for a read-only row.
 * `max` is what MAX fills when that is less than the balance, as when alUSD can
 * repay only the debt that is not yet earmarked. `prevBalance` is the balance
 * before the last action, drawn as the change beside it: a grey chip with its
 * sign, or green and red with `chipTone="app"`, as on `AppStats`.
 */
/**
 * An amount as the app's box shows it: the whole part in thousands, the
 * decimals as typed ("1000" reads "1,000", "1000." stays "1,000."). The box
 * strips the commas again on the way in, so a lab's state is always the bare
 * number. A prefilled 10000 used to read "10000" beside tiles that read
 * "10,000.00".
 */
function grouped(amount) {
  const s = String(amount ?? "");
  const m = /^(\d*)(\.\d*)?$/.exec(s);
  if (!m) return s;
  return m[1].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (m[2] ?? "");
}

/**
 * `digits` sets the decimals on the dollar value and the balance (two, as
 * the app prints them, unless a lesson rounds to whole numbers). `dim` draws
 * a box the screen does not use, faded and read-only, with `tag` in place of
 * its balance. `onMax` runs after MAX fills the box, for a screen whose
 * action is pressing MAX.
 *
 * `children` are drawn inside the box under the balance line. The app's box
 * (`UniversalInput.tsx`) holds its own Slippage row and action button, so a
 * panel's button belongs in there (checked against the live vault page,
 * 2026-11-10). `bare` drops the box's border and padding, for a card that
 * frames the input itself (the Fixed Yield card).
 */
export function AppInput({ token = "USDC", amount = "", onChange, balance, max = null, type = "Balance", usd = null, label, prevBalance = null, chipTone = "neutral", digits: asked = 2, dim = false, tag = null, onMax, tokens = null, onToken, bare = false, children = null }) {
  const icon = useBaseUrl(iconPath(token));
  const { auto } = useAppContext();
  const pointed = usePointed();
  // With `tokens` and `onToken` the token box is the app's token picker: it
  // opens a list under it, as the Repay tab's does in the app. It closes on a
  // pick, on Escape (focus back on the box) and on a press anywhere outside it.
  const [open, setOpen] = React.useState(false);
  const picker = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (picker.current && !picker.current.contains(e.target)) setOpen(false);
    };
    const key = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      const box = picker.current && picker.current.querySelector("button");
      if (box) box.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const n = Number(amount) || 0;
  // Only a box the learner types in is held to its balance: a read-only box
  // (what a swap returns) shows an amount that is on its way in.
  const over = Boolean(onChange) && balance != null && n > balance + 0.000001;
  const dollars = usd ?? n;
  const digits = autoDigits(dollars, asked, auto);
  const balanceDigits = autoDigits(balance ?? 0, asked, auto);
  // MAX fills what the line shows, to the cent at most, so a limit of
  // 4,444.444... fills 4444.44 and never more than the vault allows.
  const fill = (v) => (auto ? String(Math.floor(v * 100 + 1e-6) / 100) : String(v));
  if (dim) {
    // The faded part is the row and its foot, so a button the box holds
    // (`children`) keeps its own strength.
    return (
      <div className={`${styles.input} ${bare ? styles.inputBare : ""}`}>
        <div className={`${styles.inputDimPart} ${styles.inputDim}`}>
          <div className={styles.inputRow}>
            <div className={styles.token}>
              <img src={icon} alt="" className={styles.tokenIcon} width="36" height="36" />
              <span>{token}</span>
            </div>
            <input className={styles.amount} type="text" placeholder="0" aria-label={label ?? `${token} amount`} readOnly tabIndex={-1} value="" />
          </div>
          <div className={styles.inputFoot}>
            <span />
            {tag ? <span className={styles.inputTag}>{tag}</span> : null}
          </div>
        </div>
        {children ? <div className={styles.inputExtra}>{children}</div> : null}
      </div>
    );
  }
  return (
    <div className={`${styles.input} ${bare ? styles.inputBare : ""}`}>
      <div className={styles.inputRow}>
        {tokens && onToken ? (
          <div className={styles.tokenWrap} ref={picker}>
            <button type="button" className={`${styles.token} ${styles.tokenButton}`} aria-haspopup="listbox" aria-expanded={open} aria-label={`Token: ${token}`} onClick={() => setOpen((o) => !o)}>
              <img src={icon} alt="" className={styles.tokenIcon} width="36" height="36" />
              <span>{token}</span>
              <svg className={styles.chev} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open ? (
              <ul className={styles.tokenMenu} role="listbox" aria-label="Token">
                {tokens.map((t) => (
                  <li key={t} role="option" aria-selected={t === token}>
                    <TokenOption token={t} on={t === token} onClick={() => { onToken(t); setOpen(false); }} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <div className={styles.token}>
            <img src={icon} alt="" className={styles.tokenIcon} width="36" height="36" />
            <span>{token}</span>
            <svg className={styles.chev} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
        <input
          className={`${styles.amount} ${over ? styles.amountOver : ""}`}
          type="text"
          inputMode="decimal"
          placeholder={digits === 0 ? "0" : "0.00"}
          aria-label={label ?? `${token} amount`}
          value={grouped(amount)}
          readOnly={!onChange}
          onChange={(e) => {
            const v = e.target.value.replace(/,/g, "");
            if (onChange && /^\d*\.?\d*$/.test(v)) onChange(v);
          }}
        />
      </div>
      <div className={styles.inputFoot}>
        <span>${number(dollars, digits)}</span>
        <span className={styles.inputLimit}>
          {balance != null ? (
            <span className={pointed("available") && type === "Available" ? styles.limitPointed : undefined}>
              {type}: {number(balance, balanceDigits)}
            </span>
          ) : null}
          {balance != null && prevBalance != null && !same(prevBalance, balance) ? (
            <span className={`${styles.delta} ${chipTone === "app" ? (balance > prevBalance ? styles.good : styles.bad) : ""}`}>
              {balance > prevBalance ? "+" : "-"}{number(Math.abs(balance - prevBalance), autoDigits(Math.abs(balance - prevBalance), asked, auto))}
            </span>
          ) : null}
          {balance != null && onChange ? (
            <button
              type="button"
              className={styles.max}
              onClick={() => {
                onChange(fill(max ?? balance));
                if (onMax) onMax();
              }}
            >
              MAX
            </button>
          ) : null}
        </span>
      </div>
      {children ? <div className={styles.inputExtra}>{children}</div> : null}
    </div>
  );
}

/**
 * The panel's action button, outlined as the app draws it. `hint` is the one
 * line under it while it is switched off, saying why ("Pick USDC first");
 * nothing is drawn when the button is live or no hint is given. On the
 * article lessons the line is not drawn (it was read before
 * the text that gives it context; the lesson's footer says what to do next):
 * the hint is the button's title and accessible description instead. `lit`
 * outlines the button in copper, as a lit tile is.
 */
export function AppButton({ onClick, disabled, hint = null, lit = false, children }) {
  const { hints } = useAppContext();
  const why = useControlReason(disabled, hint);
  return (
    <>
      <button
        type="button"
        className={`${styles.cta} ${lit ? styles.ctaLit : ""}`}
        onClick={onClick}
        disabled={disabled}
        title={why}
        aria-description={why}
      >
        {children}
      </button>
      {hints && why ? <p className={styles.ctaHint}>{why}</p> : null}
    </>
  );
}

/**
 * A part of a practice element that appears or goes after an action (the
 * tabs and panel after lesson 2's year, a note under the vault's name) grows
 * or shrinks to its new height instead of snapping (any change to an
 * element's size is animated). A change
 * of width (a turned phone) is not animated, and nothing moves under reduced
 * motion. Only on a page that asks for `slow`; elsewhere it adds nothing.
 */
export function Grow({ children }) {
  const { slow } = useAppContext();
  const reduced = useReducedMotion();
  const outer = React.useRef(null);
  const inner = React.useRef(null);
  const on = slow && !reduced;
  React.useLayoutEffect(() => {
    const box = outer.current;
    const el = inner.current;
    if (!on || !box || !el || typeof ResizeObserver === "undefined") return undefined;
    let last = { w: el.offsetWidth, h: el.offsetHeight };
    let timer = 0;
    const end = () => {
      window.clearTimeout(timer);
      box.style.height = "";
      box.style.overflow = "";
      box.style.transition = "";
    };
    const ro = new ResizeObserver(() => {
      const now = { w: el.offsetWidth, h: el.offsetHeight };
      const was = last;
      last = now;
      if (was.w !== now.w || Math.abs(was.h - now.h) < 1) return;
      // Measured after layout and before paint: hold the old height for this
      // frame, then ease to the new one.
      end();
      box.style.height = `${was.h}px`;
      box.style.overflow = "hidden";
      void box.offsetHeight;
      box.style.transition = "height 0.4s ease";
      box.style.height = `${now.h}px`;
      timer = window.setTimeout(end, 450);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      end();
    };
  }, [on]);
  if (!slow) return <>{children}</>;
  return (
    <div ref={outer} className={styles.grow}>
      <div ref={inner} className={styles.growInner}>
        {children}
      </div>
    </div>
  );
}

/** The small rows under a Borrow & Swap amount: the Rate and what will be minted. */
export function AppSwapInfo({ rate, mint, al = "alUSD" }) {
  return (
    <dl className={styles.swap}>
      <div>
        <dt>Rate</dt>
        <dd>{rate}</dd>
      </div>
      <div>
        <dt>Will mint</dt>
        <dd>{number(mint)} {al}</dd>
      </div>
    </dl>
  );
}

/* ── The beginner track's practice vault and app figures ─────────────── */

/** The vault page's tiles, in the app's order. */
export const VAULT_TILES = ["apr", "deposit", "debt", "health", "earmarked", "redemption", "borrowable", "ltv"];

/** The vault page's action tabs, by the app's names, in its order. */
export const VAULT_TABS = ["Deposit/Borrow", "Borrow", "Withdraw", "Repay", "Liquidate", "Yield Looping"];

/** The Trade page's two tabs, over its card. */
export const TRADE_TABS = ["Swap", "Limit Orders"];

/** The vault's name as the beginner track writes it. */
export const VAULT_NAME = "Risk-adjusted Mix USDC";

/** A part of a figure a screen is not about: faded, as the scripts say "dimmed". */
const fadeIf = (lit, key) => (lit && lit.length && !lit.includes(key) ? styles.fade : "");

/**
 * The practice vault as the beginner track draws it: the real vault page,
 * top to bottom. All eight tiles in the app's order, with the ones the course
 * has not taught dimmed and unlabeled (Health Factor on every screen), the
 * bar with both markers, all six action tabs with only `tab` live, then the
 * screen's amount boxes and button as `children`. Amounts are whole numbers.
 *
 * `taught` lists tile keys plus "max" and "liq" for the bar's markers. `lit`
 * outlines tiles in copper, and `barLit` fades the bar parts a screen is not
 * about. `wallet` is an `AppWallet`, drawn under the vault's name.
 *
 * `health` lights the Health Factor tile, which the intermediate track
 * teaches in its lesson 2 and shows from then on; it reads two
 * decimals, as the app's does. `ltvDigits` sets the LTV tile's decimals, two
 * as the app shows them unless a screen's working uses one.
 */
export function PracticeVault({
  deposit = 0, debt = 0, earmarked = 0, apr = null, redemptionRate = null,
  taught = [], lit = [], barLit, prev, preview, chipTone = "neutral", chipDigits = null,
  tab = null, wallet = null, bar = true, health = false, ltvDigits = 2, wash = false, price = null, prevPrice = null, children,
}) {
  const tiles = health || taught.includes("health") ? [...taught.filter((k) => k !== "health"), "health"] : taught.filter((k) => k !== "health");
  // A vault that shows changes keeps the line under its values from the
  // start, so the first chip does not push the frame taller (2026-11-07).
  const keep = wash && prev === undefined ? null : prev;
  return (
    <AppFrame title={VAULT_NAME} tag="Practice" strong head={wallet == null ? null : <Grow>{wallet}</Grow>}>
      <AppStats
        tiles={VAULT_TILES} taught={tiles} highlight={lit}
        apr={apr} deposit={deposit} debt={debt} earmarked={earmarked} redemptionRate={redemptionRate}
        prev={keep} preview={preview} chipTone={chipTone} price={price} prevPrice={prevPrice}
        digits={0} ratioDigits={0} ltvDigits={ltvDigits} chipDigits={chipDigits}
        wash={wash}
      />
      {bar ? (
        <AppBar deposit={deposit} debt={debt} earmarked={earmarked} prev={prev} taught={taught} lit={barLit} />
      ) : null}
      <Grow>
        {tab ? <AppTabs tabs={VAULT_TABS} live={tab} lit /> : null}
        {children ? <AppPanel>{children}</AppPanel> : null}
      </Grow>
    </AppFrame>
  );
}

/**
 * The learner's wallet, one line: each token they hold, with the change the
 * last action made beside it (grey, as every chip that stays).
 */
export function AppWallet({ items, label = "Wallet" }) {
  return (
    <div className={styles.wallet}>
      {label ? <span className={styles.walletLabel}>{label}</span> : null}
      {items.map((it) => (
        <WalletItem key={it.token} {...it} />
      ))}
    </div>
  );
}

/**
 * The learner's wallet on its own, for a screen that shows what they hold and
 * nothing of the vault (beginner lesson 4's "What do you owe now?").
 */
export function AppWalletCard({ items }) {
  return (
    <section className={styles.frame} aria-label="Practice copy of your wallet">
      <div className={styles.top}>
        <div className={styles.vaultName}>Wallet</div>
        <span className={`${styles.practice} ${styles.practiceStrong}`}>Practice</span>
      </div>
      <AppWallet items={items} label={null} />
    </section>
  );
}

function WalletItem({ token, amount, prev = null }) {
  const icon = useBaseUrl(iconPath(token));
  return (
    <span className={styles.walletItem}>
      <img src={icon} alt="" width="20" height="20" />
      <span className={styles.walletValue}>{number(amount, 0)} {token}</span>
      {prev != null && !same(prev, amount) ? (
        <span className={styles.delta}>{amount > prev ? "+" : "-"}{number(Math.abs(amount - prev), 0)}</span>
      ) : null}
    </span>
  );
}

/**
 * The app's top menu, as a picture: the five items, with Earn's or Trade's
 * menu open under it. `lit` and `dim` take item names (and the names inside
 * a menu); anything in neither is drawn plain.
 */
const MENU = [
  { name: "Dashboard" },
  { name: "Borrow" },
  { name: "Earn", sub: ["Variable Rate", "Fixed Rate"] },
  { name: "Trade", sub: ["Swap", "Limit Orders"] },
  { name: "Ecosystem", sub: [] },
];

export function AppMenu({ lit = [], dim = [], open = null }) {
  const state = (n) => (lit.includes(n) ? styles.menuLit : dim.includes(n) ? styles.menuDim : "");
  return (
    <div className={`${styles.frame} ${styles.menuFrame}`} role="img" aria-label={`The app's top menu${lit.length ? `, with ${lit.join(", ")} lit` : ""}`}>
      <div className={styles.menuBrand}>ALCHEMIX</div>
      <div className={`${styles.menuItems} ${open ? styles.menuItemsOpen : ""}`}>
        {MENU.map((m) => (
          <span key={m.name} className={styles.menuWrap}>
            <span className={`${styles.menuItem} ${state(m.name)}`}>
              {m.name}
              {m.sub ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              ) : null}
            </span>
            {open === m.name && m.sub?.length ? (
              <span className={styles.menuDrop}>
                {m.sub.map((s) => (
                  <span key={s} className={`${styles.menuSub} ${state(s)}`}>{s}</span>
                ))}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * One vault's card on the Borrow page, from the live card (2026-11-04).
 * `lit` names the parts to keep bright ("name", "apr", "cap", "figures",
 * "strategies"); the rest are dimmed. Total Debt and Earmarked were not
 * read from the live card and are example figures; they are dimmed
 * on the one screen that shows the card.
 *
 * `figures` replaces the card's four figures for a lesson that sets its own
 * (the intermediate pace lesson's Total Debt of 1,500,000), `apr` its APR and
 * `strategies` its strategy list. Lighting one figure ("deposits",
 * "totalDebt", "earmarkedTotal", "ltv") dims the other three.
 *
 * `bare` draws the card with its name and strategy list only: no APR, no
 * Deposit Cap, no figures. Beginner lesson 2 opens on it, before any of
 * those words is taught.
 */
const CARD_FIGURES = { deposits: "$2.40M", debt: "$1.31M", earmarked: "$112.40K", ltv: "90.00%" };

export function AppVaultCard({ lit = ["name"], figures = null, apr = "5.10%", strategies = null, bare = false }) {
  const fig = { ...CARD_FIGURES, ...(figures ?? {}) };
  // One figure lit ("totalDebt") keeps that row bright and dims the other three.
  const CELLS = ["deposits", "totalDebt", "earmarkedTotal", "ltv"];
  const oneLit = CELLS.some((k) => lit.includes(k));
  const cell = (k) => (oneLit && !lit.includes(k) ? styles.fade : "");
  const usdc = useBaseUrl(iconPath("USDC"));
  const alusd = useBaseUrl(iconPath("alUSD"));
  const f = (k) => fadeIf(lit, k);
  return (
    <section className={`${styles.frame} ${styles.vcard}`} aria-label="Practice copy of a vault card on the app's Borrow page">
      <div className={styles.vcardLeft}>
        <div className={styles.fixedHead}>
          <span className={styles.fixedIcons}>
            <img src={usdc} alt="" width="40" height="40" />
            {bare ? null : <img src={alusd} alt="" width="40" height="40" />}
          </span>
          <span className={`${styles.practice} ${styles.practiceStrong}`}>Practice</span>
        </div>
        <div className={`${styles.vcardName} ${f("name")}`}>{VAULT_NAME}</div>
        {bare ? null : (
          <>
            <div className={`${styles.vcardApr} ${f("apr")}`}>{apr} <span>APR</span></div>
            <div className={`${styles.vcardCap} ${f("cap")}`}>
              <span className={styles.capBar}><i style={{ width: "24%" }} /></span>
              <span className={styles.vcardCapRow}><span>Deposit Cap</span><b>2.40M/10.05M USDC</b></span>
            </div>
          </>
        )}
      </div>
      <div className={styles.vcardRight}>
        {bare ? null : (
          <dl className={`${styles.fixedRows} ${oneLit ? "" : f("figures")}`}>
            <div className={cell("deposits")}><dt>Total Deposits</dt><dd>{fig.deposits}</dd></div>
            <div className={cell("totalDebt")}><dt>Total Debt</dt><dd>{fig.debt}</dd></div>
            <div className={cell("earmarkedTotal")}><dt>Earmarked</dt><dd>{fig.earmarked}</dd></div>
            <div className={cell("ltv")}><dt>LTV</dt><dd>{fig.ltv}</dd></div>
          </dl>
        )}
        <div className={`${styles.vcardStrats} ${f("strategies")}`}>
          <span className={styles.vcardStratHead}>Strategy</span>
          {(strategies ?? STRATEGIES).map((s) => (
            <span key={s.name} className={styles.vcardStrat}><i style={{ background: s.color }} />{s.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The USDC vault's strategies. Steakhouse High Yield's row is the live
 * reading (2026-11-04); the other three rows are examples that
 * sum to 100%, and `example` marks them on the Info tab.
 */
export const STRATEGIES = [
  { name: "Steakhouse High Yield", risk: "Conservative", apr: "5.20%", allocation: 70.33, color: "oklch(0.78 0.15 228)" },
  { name: "Gauntlet Frontier", risk: "Moderate", apr: "5.65%", allocation: 14.12, color: "oklch(0.65 0.1925 283.02)", example: true },
  { name: "Yearn OG V2", risk: "Conservative", apr: "4.90%", allocation: 9.85, color: "oklch(0.55 0.12 300)", example: true },
  { name: "Fluid Base", risk: "Moderate", apr: "5.05%", allocation: 5.7, color: "oklch(0.85 0.0792 57.05)", example: true },
];

export const INFO_TABS = ["Info", "Visualizer", "Earmarking", "Redemptions", "History", "Contracts"];

/**
 * The vault page's Info tab: its tab strip with Info live, the allocation
 * ring, and the strategy table. `lit` names the columns to keep bright
 * ("strategy", "risk", "apr", "allocation"); the rest are dimmed.
 *
 * `strategies` replaces the USDC vault's list with a lesson's own (the
 * intermediate track's practice Strategy A, B and C), and `rows` names the
 * rows a screen is about; the others dim.
 */
export function AppInfoTable({ lit = ["strategy", "allocation"], strategies = STRATEGIES, rows = null }) {
  const f = (k) => fadeIf(lit, k);
  const r = (name) => (rows && !rows.includes(name) ? styles.fade : "");
  const digits = strategies.every((s) => Number.isInteger(s.allocation)) ? 0 : 2;
  let start = 0;
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <section className={`${styles.frame} ${styles.info}`} aria-label="Practice copy of the Info tab on the app's vault page">
      <div className={styles.top}>
        <AppTabs tabs={INFO_TABS} live="Info" />
        <span className={`${styles.practice} ${styles.practiceStrong}`}>Practice</span>
      </div>
      <div className={styles.infoBody}>
        <svg className={styles.ring} width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
          {strategies.map((s) => {
            const len = (s.allocation / 100) * C;
            const el = (
              <circle
                key={s.name} cx="48" cy="48" r={R} fill="none" stroke={s.color} strokeWidth="16"
                strokeDasharray={`${Math.max(len - 2, 0)} ${C}`} strokeDashoffset={-start}
                transform="rotate(-90 48 48)"
              />
            );
            start += len;
            return el;
          })}
        </svg>
        <div className={styles.infoScroll}>
          <table className={styles.infoTable}>
            <thead>
              <tr>
                <th className={f("strategy")}>Strategy</th>
                <th className={f("risk")}>Risk Level</th>
                <th className={f("apr")}>APR</th>
                <th className={f("allocation")}>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s) => (
                <tr key={s.name}>
                  <td className={f("strategy") || r(s.name)}><i style={{ background: s.color }} />{s.name}</td>
                  <td className={f("risk") || r(s.name)}>{s.risk}</td>
                  <td className={f("apr") || r(s.name)}>{s.apr}</td>
                  <td className={f("allocation") || r(s.name)}>
                    {number(s.allocation, digits)}%
                    {/* A real space before the tag, so the figure never reads "14.12%example". */}
                    {s.example ? <>{" "}<span className={styles.example}>example</span></> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/**
 * The Trade page's Swap card, as the live card draws it (2026-11-10): the
 * page's Swap and Limit Orders tabs, the box you pay from, the app's
 * up-and-down arrow, then the box you receive in, which holds the Slippage
 * line and the Swap button. The app's card has no title and no "You pay" or
 * "You receive" labels, so the practice card has none. The lab owns the
 * amount and the balances. `lit` names the parts to keep bright ("pay",
 * "receive", "price", "button").
 */
export function AppSwapCard({
  amount = "", onChange, price, payToken = "alUSD", getToken = "USDC",
  payBalance = null, getBalance = null, prevPay = null, prevGet = null,
  onSwap, canSwap = false, hint = null, lit = [], priceLine = null,
}) {
  const n = Number(amount) || 0;
  const out = n * price;
  const f = (k) => fadeIf(lit, k);
  return (
    <section className={`${styles.frame} ${styles.swapCard}`} aria-label="Practice copy of the Swap card on the app's Trade page">
      <div className={styles.top}>
        {/* Drawn, not operable: a second control named "Swap" would stand
            beside the card's own Swap button. */}
        <div className={styles.tabs} aria-hidden="true">
          {TRADE_TABS.map((t) => (
            <span key={t} className={`${styles.tab} ${t === "Swap" ? styles.tabOn : styles.tabQuiet}`}>{t}</span>
          ))}
        </div>
        <span className={`${styles.practice} ${styles.practiceStrong}`}>Practice</span>
      </div>
      <div className={f("pay")}>
        <AppInput
          token={payToken} amount={amount} onChange={onChange} balance={payBalance} prevBalance={prevPay}
          digits={0} label={`${payToken} to swap`}
        />
      </div>
      <div className={styles.swapArrow} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 7 4-4 4 4M12 3v18M8 17l4 4 4-4" /></svg>
      </div>
      <div className={f("receive")}>
        <AppInput
          token={getToken} amount={n > 0 ? String(Math.round(out)) : ""} balance={getBalance} prevBalance={prevGet}
          digits={0} label={`${getToken} received`}
        >
          <AppSlippage value="0.5%" />
          {/* Not on the app's card, which shows the rate only through the two
              amounts. The lesson's text reads the rate, so the practice card
              states it, set apart as a note. */}
          <div className={`${styles.swapPrice} ${f("price")}`}>{priceLine ?? `1 ${payToken} = ${price.toFixed(2)} ${getToken}`}</div>
          <div className={f("button")}>
            <AppButton onClick={onSwap} disabled={!canSwap} hint={hint}>Swap</AppButton>
          </div>
        </AppInput>
      </div>
    </section>
  );
}

/**
 * One card from the Fixed Yield page, laid out as the live card is
 * (2026-11-10, and `TransmuterCard.tsx`): the chain flag at the top left
 * corner; the two token icons, large, with the alAsset's half off the card's
 * left edge; the name and rate with Projected Fixed APR, the cap bar, Deposit
 * Cap, Term and Early Exit Fee; then one panel that holds Maturity Date, the
 * price, Expected Output, Percentage Return and Asset Gain as labels with
 * their values beside them, and the amount box with its Slippage line and
 * button. On a narrower card the icons shrink to a pair over the name and
 * the panel's two halves stack, as the app's do.
 *
 * The line that shows what the USDC buys (so the card shows both
 * figures) is the lesson's, not the app's: the app shows the alUSD only as
 * Expected Output.
 *
 * `lit` names the figures a screen is about ("apr", "cap", "term", "early",
 * "maturity", "price", "output", "percent", "gain", "amount"); the rest are
 * dimmed. An empty `lit` dims nothing. Output, return and gain read "--"
 * until an amount is typed, as the app's do. `chain` is the chain's short
 * name in the price's label ("ETH alUSD Price").
 */
export function AppFixedCard({
  apr, price, term, maturity, cap = "2.3M/2.4M alUSD", capFill = 0.92, early = "1.00%",
  amount = "", onChange, balance = null, prevBalance = null, buys = null,
  output = null, percent = null, gain = null,
  asset = "USDC", al = "alUSD", lit = [], action = null, chain = "ETH", slippage = "0.1%",
  /** What the "buys" line shows when the box is empty: the amount just spent, after the deposit. */
  spent = null,
}) {
  const assetIcon = useBaseUrl(iconPath(asset));
  const alIcon = useBaseUrl(iconPath(al));
  const f = (k) => fadeIf(lit, k);
  const row = (key, name, value, info = false) => (
    <div className={f(key)}>
      <dt>{name}{info ? <AppInfo /> : null}</dt>
      <dd>{value}</dd>
    </div>
  );
  const n = Number(amount) || spent || 0;
  return (
    <section className={`${styles.frame} ${styles.fxCard}`} aria-label="Practice copy of a card on the app's Fixed Yield page">
      <ChainFlag />
      <span className={`${styles.practice} ${styles.practiceStrong} ${styles.fxTag}`}>Practice</span>
      <div className={styles.fxBody}>
        <img src={alIcon} alt="" className={styles.fxBigAl} width="96" height="96" />
        <img src={assetIcon} alt="" className={styles.fxBigAsset} width="96" height="96" />
        <div className={styles.fxLeft}>
          <span className={styles.fxIcons}>
            <img src={alIcon} alt="" width="32" height="32" />
            <img src={assetIcon} alt="" width="32" height="32" />
          </span>
          <div className={f("apr")}>
            <div className={styles.fxApr}>{asset} {number(apr * 100)}%</div>
            <div className={styles.fxAprLabel}>Projected Fixed APR<AppInfo /></div>
          </div>
          <span className={`${styles.capBar} ${styles.fxCapBar} ${f("cap")}`}><i style={{ width: `${Math.round(capFill * 100)}%` }} /></span>
          <dl className={styles.fxRows}>
            {row("cap", "Deposit Cap", cap, true)}
            {row("term", "Term", term)}
            {row("early", "Early Exit Fee", early, true)}
          </dl>
        </div>
        <div className={styles.fxPanel}>
          <dl className={styles.fxGrid}>
            {row("maturity", "Maturity Date", maturity)}
            {row("price", `${chain} ${al} Price`, price, true)}
            {row("output", "Expected Output", output == null ? "--" : `${number(output, 0)} ${asset}`)}
            {row("percent", "Percentage Return", percent == null ? "-- %" : `${number(percent * 100)}%`)}
            {row("gain", "Asset Gain", gain == null ? `-- ${asset}` : `${number(gain, 0)} ${asset}`)}
          </dl>
          <div className={`${styles.fxAmount} ${f("amount")}`}>
            <AppInput
              token={asset} amount={amount} onChange={onChange} balance={balance} prevBalance={prevBalance}
              digits={0} label={`${asset} to spend`} bare
            >
              <AppSlippage value={slippage} />
              {buys != null ? (
                // Held in place before an amount is typed, so the card does not grow
                // on the first keystroke and shrink after the deposit (2026-11-07).
                <div className={styles.buys} style={n > 0 ? undefined : { visibility: "hidden" }} aria-hidden={n > 0 ? undefined : true}>
                  <span><img src={assetIcon} alt="" width="18" height="18" />{number(n, 0)} {asset}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
                  <span><img src={alIcon} alt="" width="18" height="18" />{number(buys, 0)} {al}</span>
                </div>
              ) : null}
              {action}
            </AppInput>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The Dashboard's Open Fixed Yield Positions with one position, as the app
 * draws it (`TransmutersTable.tsx`, same in the live bundle of 2026-11-10):
 * a table with one row of column names (Transmuter, APR, End Date, Deposit,
 * Profit) over the position's row, whose first cell is the two token icons,
 * the alAsset's name and the chain, and whose last is the row's button.
 * `date` is the day the screen is set on, shown at the top right. `lit` as
 * on the card: a column that is not lit is dimmed, name and value together.
 * `tag` replaces the word in the pill ("What if") and `label` the section's
 * accessible name, for a row that is not the practice wallet's.
 *
 * On a phone the app's table scrolls sideways, which would put the button a
 * learner has to press off the screen. There each value sits under its own
 * column name instead, and the button takes the last line.
 */
export function AppFixedRow({ transmuter, apr, end, deposit, profit, date = null, lit = [], action = null, wallet = null, asset = "USDC", al = "alUSD", chain = "ETH", tag = "Practice", label = "Practice copy of the Dashboard's Open Fixed Yield Positions" }) {
  const f = (k) => fadeIf(lit, k);
  const assetIcon = useBaseUrl(iconPath(asset));
  const alIcon = useBaseUrl(iconPath(al));
  const COLS = [
    ["transmuter", "Transmuter"],
    ["apr", "APR"],
    ["end", "End Date"],
    ["deposit", "Deposit"],
    ["profit", "Profit"],
  ];
  const values = {
    transmuter: transmuter ?? (
      <span className={styles.fyToken}>
        <span className={styles.fyIcons}>
          <img src={alIcon} alt="" width="32" height="32" />
          <img src={assetIcon} alt="" width="32" height="32" />
        </span>
        <span>
          <span className={styles.fyName}>{al}</span>
          <ChainLine>{chain}</ChainLine>
        </span>
      </span>
    ),
    apr, end, deposit, profit,
  };
  return (
    <section className={`${styles.frame} ${styles.fyFrame}`} aria-label={label}>
      <div className={styles.top}>
        <div className={`${styles.vaultName} ${styles.dashTitle}`}>Open Fixed Yield Positions</div>
        <span className={styles.topRight}>
          {date ? (
            <span className={styles.dateChip}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
              {date}
            </span>
          ) : null}
          <span className={`${styles.practice} ${styles.practiceStrong}`}>{tag}</span>
        </span>
      </div>
      {wallet}
      <div className={styles.fyTable} role="table" aria-label="Open Fixed Yield Positions">
        <div className={styles.fyHead} role="row">
          {COLS.map(([key, name]) => (
            <span key={key} role="columnheader" className={f(key)}>{name}</span>
          ))}
          <span role="columnheader" aria-hidden="true" />
        </div>
        <div className={styles.fyRow} role="row">
          {COLS.map(([key, name]) => (
            <div key={key} role="cell" className={`${styles.fyCell} ${f(key)}`}>
              <span className={styles.fyLabel} aria-hidden="true">{name}</span>
              <span className={styles.fyValue}>{values[key]}</span>
            </div>
          ))}
          <div role="cell" className={`${styles.rowAction} ${f("action")}`}>{action}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * One card under the Dashboard's Open Vault Positions, as the app draws it
 * (`VaultDashboardCard.tsx`, same in the live bundle of 2026-11-10, which
 * adds the menu at the top right): the chain flag, the token's icon over its
 * symbol, a panel with Deposit, Debt, APR, LTV and Earmarked and the small
 * bar with its legend, then Manage across the foot. 302 by 384, as the app
 * sizes it.
 *
 * The figures come in as the strings to print, so a lesson keeps its own
 * number format. `fill` and `mark` are the bar's debt and earmarked shares of
 * the deposit (0 to 1). `lit` names rows to outline in copper; `dimRows`
 * names rows the course has not taught, drawn faint with no figure. `menu`
 * and `manage` replace the card's two controls when a moment uses them.
 * `compact` keeps every part and its order but lets the card be as short as
 * its content, for a figure that shows the card beside other things.
 */
export function AppPositionCard({
  asset = "USDC", deposit, debt, apr, ltv, earmarked, fill = 0, mark = 0,
  lit = [], dimRows = [], on = false, dim = false, menu, manage = null, className = "", compact = false,
}) {
  const icon = useBaseUrl(iconPath(asset));
  const pct = (x) => `${Math.min(Math.max(x, 0), 1) * 100}%`;
  const row = (key, name, value) => (
    <div className={`${lit.includes(key) ? styles.posRowLit : ""} ${dimRows.includes(key) ? styles.posRowDim : ""}`}>
      <dt>{name}</dt>
      <dd>{dimRows.includes(key) ? "\u2013" : value}</dd>
    </div>
  );
  return (
    <div className={`${styles.posCard} ${compact ? styles.posCardCompact : ""} ${on ? styles.posCardOn : ""} ${dim ? styles.fade : ""} ${className}`}>
      <ChainFlag />
      {menu === undefined ? (
        <span className={styles.posMenu} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>
        </span>
      ) : <span className={styles.posMenuSlot}>{menu}</span>}
      <div className={styles.posToken}>
        <img src={icon} alt="" width="44" height="44" />
      </div>
      <div className={styles.posName}>{asset}</div>
      <div className={styles.posPanel}>
        <dl className={styles.posRows}>
          {row("deposit", "Deposit:", deposit)}
          {row("debt", "Debt:", debt)}
          {row("apr", "APR:", apr)}
          {row("ltv", "LTV:", ltv)}
          {row("earmarked", "Earmarked:", earmarked)}
        </dl>
        <div className={styles.posBarWrap}>
          <div className={styles.posBar} aria-hidden="true">
            <i style={{ width: pct(fill) }} />
            {mark > 0.0005 ? <b style={{ left: pct(fill - mark), width: pct(mark) }} /> : null}
          </div>
          <div className={styles.posLegend} aria-hidden="true">
            <span><i className={styles.dotDeposit} />Deposit</span>
            <span><i className={styles.dotDebt} />Debt</span>
            <span><i className={styles.dotEarmark} />Earmarked</span>
          </div>
        </div>
      </div>
      <div className={styles.posManage}>
        {manage ?? (
          <button type="button" className={styles.cta} disabled>
            Manage
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The Dashboard's Open Vault Positions for the practice position, as the app
 * draws the section (`Dashboard.tsx`, `DashboardSummary.tsx`,
 * `VaultDashboardCard.tsx`; same in the live bundle of 2026-11-10): the
 * summary bar with Total Deposit, Total Debt, Available to Borrow and Net
 * Value in dollars, then the position's card with Manage, and the dashed card
 * that opens a new position beside it.
 *
 * The summary bar is in dollars and compact, as the app's is, with alUSD
 * counted at `alPrice`, its market price (the course's example 0.98). The
 * card is in tokens. Whole amounts drop their cents, as on the practice
 * vault. `earmarked` left out draws the card's Earmarked row faint with no
 * figure, for a lesson that comes before the one that teaches it.
 *
 * `lit` names the parts to keep bright: "deposit", "debt", "available" and
 * "net" in the summary bar, "vault" for the card, "action" for Manage. The
 * section's filters (asset, chain) are not drawn.
 */
export function AppVaultRow({ deposit, debt, earmarked = null, apr = 0.05, alPrice = 0.98, lit = [] }) {
  const f = (k) => fadeIf(lit, k);
  const { auto } = useAppContext();
  const pointed = usePointed();
  const amt = (n) => number(n, autoDigits(n, 0, auto));
  const room = Math.max(deposit * 0.9 - debt, 0);
  const ltv = deposit > 0 ? debt / deposit : 0;
  const marked = Math.min(earmarked ?? 0, debt);
  const cell = (key, name, value) => (
    <div className={f(key)}>
      <dt>{name}</dt>
      <dd>{value}</dd>
    </div>
  );
  return (
    <section className={`${styles.frame} ${styles.dashFrame}`} aria-label="Practice copy of the Dashboard's Open Vault Positions">
      <div className={styles.top}>
        <div className={`${styles.vaultName} ${styles.dashTitle}`}>Open Vault Positions</div>
        <span className={`${styles.practice} ${styles.practiceStrong}`}>Practice</span>
      </div>
      <dl className={styles.summary}>
        {cell("deposit", "Total Deposit", compactUsd(deposit))}
        {cell("debt", "Total Debt", compactUsd(debt * alPrice))}
        {cell("available", "Available to Borrow", compactUsd(room * alPrice))}
        {cell("net", "Net Value", compactUsd(deposit - debt * alPrice))}
      </dl>
      <div className={styles.posCards}>
        <AppPositionCard
          className={f("vault")}
          deposit={`${amt(deposit)} USDC`}
          debt={`${amt(debt)} alUSD`}
          apr={`${number(apr * 100, 0)}%`}
          ltv={`${number(ltv * 100, 2)}/90.00%`}
          earmarked={`${amt(marked)} alUSD`}
          dimRows={earmarked == null ? ["earmarked"] : []}
          fill={ltv}
          mark={deposit > 0 ? marked / deposit : 0}
          manage={
            // Lit, the button the sentence names is outlined in copper.
            <span className={pointed("manage") ? "" : f("action")}>
              <AppButton disabled lit={lit.includes("action") || pointed("manage")}>
                Manage
              </AppButton>
            </span>
          }
        />
        <div className={`${styles.posNew} ${f("new")}`} aria-hidden="true">
          <svg className={styles.posNewRing}>
            <rect x="0.5" y="0.5" rx="12" ry="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 12" style={{ width: "calc(100% - 1px)", height: "calc(100% - 1px)" }} />
          </svg>
          <svg className={styles.posNewPlus} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M5 12h14M12 5v14" /></svg>
          <span>Open New Position</span>
        </div>
      </div>
    </section>
  );
}

/**
 * The Repay tab's token picker, opened: the tokens it takes, the one chosen
 * outlined. Plain buttons with `aria-pressed`, one per token.
 */
function TokenOption({ token, on, onClick }) {
  const icon = useBaseUrl(iconPath(token));
  return (
    <button type="button" className={`${styles.tokenOption} ${on ? styles.pickOn : ""}`} onClick={onClick}>
      <img src={icon} alt="" width="24" height="24" />
      {token}
    </button>
  );
}

export function AppTokenPick({ tokens, value, onChange }) {
  return (
    <div className={styles.pick} aria-label="Token to repay with">
      {tokens.map((t) => (
        <PickToken key={t} token={t} on={t === value} onClick={() => onChange && onChange(t)} />
      ))}
    </div>
  );
}

function PickToken({ token, on, onClick }) {
  const icon = useBaseUrl(iconPath(token));
  return (
    <button type="button" className={`${styles.pickToken} ${on ? styles.pickOn : ""}`} aria-pressed={on} onClick={onClick}>
      <img src={icon} alt="" width="24" height="24" />
      {token}
    </button>
  );
}

/**
 * A change chip, for a figure a lab draws inside a frame itself. Grey by
 * default, like every chip that stays after an action. `tone="good"` or
 * `tone="bad"` puts it in the app's green or red, for a lab that marks a gain
 * or a loss on purpose.
 */
export function AppDelta({ tone: t, children }) {
  return <span className={`${styles.delta} ${t === "good" ? styles.good : t === "bad" ? styles.bad : ""}`}>{children}</span>;
}
