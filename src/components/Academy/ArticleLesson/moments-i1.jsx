import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import app from "../AppMock/styles.module.css";
import parts from "../parts.module.css";
import css from "./moments-i1.module.css";
import {
  AppButton, AppInput, AppPanel, AppPositionCard, AppTabs, Grow, INFO_TABS, SLOW_TWEEN, VAULT_NAME, VAULT_TABS,
  useAppContext, usePointed, useReducedMotion, useTween, useWash,
} from "../AppMock";
import { StepList } from "../kit";
import { useMoment, useMomentNote } from "./position";
import { FoldAway, Stage } from "./index";
import { NOT_READY, OVER_WALLET } from "./moments";

/**
 * The practice moments and figures of intermediate lesson 1 (script I1,
 * "The three contracts behind your position"), imported by
 * lessons/intermediate/i1ThreeContracts.mdx. Each moment's id is in the page
 * file's MOMENTS list, in page order: deposit, mixed-deposit, add-myt, send,
 * send-back, loop.
 *
 * The first half of this file is shared with I2 and I3 (moments-i2.jsx and
 * moments-i3.jsx import it): a practice frame, figures in which a token
 * travels from one contract to another (measured, so it works side by side
 * at a desktop width and stacked on a phone), stat tiles that print numbers
 * the way the app does (cut to two decimals, as `formatNumber` does), the
 * health bar, and the Dashboard's position card.
 *
 * The rules are the beginner moments' (moments.jsx): a moment reads the
 * position just before it, writes once, and keeps its after-state; motion
 * starts only from something the reader did, runs slowly enough to watch,
 * and the reader's result (the text after the element, the strip) arrives
 * when the motion has ended.
 */

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Numbers ─────────────────────────────────────────────── */

export const fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/** As the app prints a figure: cut (not rounded) to `d` decimals. 1.2857 reads 1.28. */
export function trunc(n, d = 2) {
  if (!Number.isFinite(n)) return "∞";
  const f = 10 ** d;
  const t = Math.trunc(n * f + (n >= 0 ? 1e-6 : -1e-6)) / f;
  return fmt(t, d);
}

const near = (a, b) => (Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b) < 0.0005 : a === b);

/* ── The frame ───────────────────────────────────────────── */

/**
 * A practice figure: the app's ground and border, a heading on the left and
 * the copper Practice tag on the right. `label` finishes the section's
 * accessible name ("Practice copy of ...").
 */
export function PracticeFrame({ label, heading = null, title = null, sub = null, icon = null, aside = null, className = "", children }) {
  const src = useBaseUrl(icon ? `/img/academy-app/${icon}.svg` : "/");
  return (
    <section className={`${app.frame} ${css.frame} ${className}`} aria-label={`Practice copy of ${label}`}>
      <div className={app.top}>
        <div className={app.vault}>
          {icon ? <img src={src} alt="" className={app.vaultIcon} width="40" height="40" /> : null}
          <div>
            {heading ? <div className={css.heading}>{heading}</div> : null}
            {title ? <div className={app.vaultName}>{title}</div> : null}
            {sub ? <div className={app.vaultChain}>{sub}</div> : null}
          </div>
        </div>
        <span className={css.topRight}>
          {aside}
          <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
        </span>
      </div>
      {children}
    </section>
  );
}

/* ── Things that travel ──────────────────────────────────── */

const FlowContext = createContext(null);

/**
 * The tokens in flight on a figure, and `send`, which puts one in flight and
 * resolves when it lands. Under reduced motion nothing flies and `send`
 * resolves at once, so the figure goes straight to each end state.
 */
export function useTokens() {
  const reduced = useReducedMotion();
  const [tokens, setTokens] = useState([]);
  const count = useRef(0);
  const send = useCallback(
    (spec) =>
      new Promise((resolve) => {
        if (reduced) {
          resolve();
          return;
        }
        count.current += 1;
        const key = count.current;
        const done = () => {
          setTokens((ts) => ts.filter((t) => t.key !== key));
          resolve();
        };
        setTokens((ts) => [...ts, { ...spec, key, done }]);
      }),
    [reduced],
  );
  return [tokens, send];
}

/** Pauses between steps (none under reduced motion), and whether the figure is still mounted. */
export function useRunner() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const reduced = useReducedMotion();
  const wait = useCallback((ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms)), [reduced]);
  return { alive, wait, reduced };
}

/**
 * The box tokens travel in. Each place a token can start or land registers
 * itself (`useNode(id)`); a token measures both at take-off, so the path is
 * right whether the places sit side by side or stacked.
 */
export function FlowArea({ tokens = [], className = "", children }) {
  const box = useRef(null);
  const nodes = useRef({});
  const refs = useRef({});
  const reg = useCallback((id) => {
    if (!refs.current[id]) {
      refs.current[id] = (el) => {
        if (el) nodes.current[id] = el;
        else delete nodes.current[id];
      };
    }
    return refs.current[id];
  }, []);
  const value = useMemo(() => ({ reg, nodes, box }), [reg]);
  return (
    <FlowContext.Provider value={value}>
      <div ref={box} className={`${css.flow} ${className}`}>
        {children}
        {tokens.map(({ key, ...t }) => (
          <Token key={key} {...t} />
        ))}
      </div>
    </FlowContext.Provider>
  );
}

export function useNode(id) {
  return useContext(FlowContext).reg(id);
}

/**
 * One token in flight: it fades in on its start, travels (through `via`: a
 * node id, or `{ id, below: true }` for a lane under that node, used only
 * when the trip runs sideways), and fades out on its end, over `ms`.
 * Positions are measured in the box's own pixels, so a stage zoomed to fit
 * the window does not throw them off.
 */
function Token({ from, to, via = [], label, kind = "coin", ms = 1200, done }) {
  const { nodes, box } = useContext(FlowContext);
  const el = useRef(null);
  useIso(() => {
    const b = box.current;
    const t = el.current;
    const at = (id) => nodes.current[id];
    if (!b || !t || !at(from) || !at(to)) {
      done();
      return undefined;
    }
    const br = b.getBoundingClientRect();
    const scale = br.width / (b.offsetWidth || br.width) || 1;
    const rect = (id) => {
      const r = at(id).getBoundingClientRect();
      return { x: (r.left - br.left) / scale, y: (r.top - br.top) / scale, w: r.width / scale, h: r.height / scale };
    };
    const centre = (id) => {
      const r = rect(id);
      return [r.x + r.w / 2, r.y + r.h / 2];
    };
    const a = centre(from);
    const z = centre(to);
    const sideways = Math.abs(z[0] - a[0]) > Math.abs(z[1] - a[1]);
    const mid = via
      .map((v) => {
        if (typeof v === "string") return at(v) ? centre(v) : null;
        if (!at(v.id)) return null;
        if (v.below && !sideways) return null;
        const r = rect(v.id);
        return [r.x + r.w / 2, r.y + r.h + 16];
      })
      .filter(Boolean);
    const pts = [a, ...mid, z];
    const w = t.offsetWidth;
    const h = t.offsetHeight;
    const tr = ([x, y]) => `translate(${x - w / 2}px, ${y - h / 2}px)`;
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const total = seg.reduce((s, v) => s + v, 0) || 1;
    let acc = 0;
    const frames = [
      { transform: tr(pts[0]), opacity: 0, offset: 0 },
      { transform: tr(pts[0]), opacity: 1, offset: 0.1 },
    ];
    pts.slice(1).forEach((p, i) => {
      acc += seg[i];
      frames.push({ transform: tr(p), opacity: 1, offset: 0.1 + 0.8 * (acc / total) });
    });
    frames.push({ transform: tr(pts[pts.length - 1]), opacity: 0, offset: 1 });
    t.style.transform = tr(pts[0]);
    const anim = t.animate(frames, { duration: ms, easing: "ease-in-out", fill: "forwards" });
    anim.onfinish = () => done();
    return () => anim.cancel();
    // A token flies once, measured as it takes off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={el} className={`${css.token} ${css[kind] ?? ""}`} aria-hidden="true">
      {label}
    </span>
  );
}

/** A contract, a wallet or a person on a flow figure: a titled box that lights and dims. */
export function Box({ id, title, lit = false, dim = false, className = "", children }) {
  const ref = useNode(id);
  return (
    <div ref={ref} className={`${css.box} ${lit ? css.lit : ""} ${dim ? css.dim : ""} ${className}`}>
      <div className={css.boxTitle}>{title}</div>
      <div className={css.boxBody}>{children}</div>
    </div>
  );
}

/** The arrow between two boxes, lit while a token travels it; `back` points it the other way. */
export function Connector({ lit = false, back = false }) {
  return (
    <div className={`${css.connector} ${lit ? css.connectorLit : ""}`} aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={back ? css.arrowBack : css.arrow}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

/**
 * A token held in a box: an amount, an NFT card, a chip. One that arrives
 * later is on the figure from the start with `hide` set, so it holds its
 * place and its arrival changes no box's height (added on arrival, it moved
 * the page 32px in one frame on page 1 and 26px on page 4).
 */
export function Holding({ kind = "coin", fresh = false, gone = false, hide = false, children }) {
  return (
    <div
      className={`${css.holding} ${css[kind] ?? ""} ${fresh && !hide ? css.fresh : ""} ${gone ? css.gone : ""}`}
      style={hide ? { visibility: "hidden" } : undefined}
      aria-hidden={hide ? true : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Parts that take turns in one place (a box's "No position" and the position
 * that replaces it). They share one cell, as large as the largest of them,
 * and only the one with `show` is visible, so a swap moves nothing.
 */
function Turns({ children }) {
  return <div className={css.turns}>{children}</div>;
}

/** A quiet line in a box ("No position"), which can hold its place hidden. */
function Empty({ hide = false, children }) {
  return (
    <span className={css.empty} style={hide ? { visibility: "hidden" } : undefined} aria-hidden={hide ? true : undefined}>
      {children}
    </span>
  );
}

/* ── Stat tiles as the app prints them ───────────────────── */

const TILE_ICON = { deposit: "deposited", debt: "debt", health: "health", apr: "apr" };

/** Formats for a tile: `show(value, short)`; `short` is the figure after the app's arrow. */
export const SHOW = {
  usdc: (v) => `${trunc(v)} USDC`,
  al: (v) => `${trunc(v)} alUSD`,
  usd: (v) => `$${trunc(v)}`,
  hf: (v) => trunc(v),
  ltv: (v, short) =>
    short ? (
      `${trunc(v)}%`
    ) : (
      <>
        {trunc(v)}
        <span className={app.ltvCap}>/90.00%</span>
      </>
    ),
};

/**
 * One stat tile, in the app's look (the practice vault's classes), with
 * figures cut to two decimals as the app cuts them (Health Factor 1.2857
 * reads 1.28, not 1.29). `ahead` draws the app's arrow and the projected
 * figure, red where it adds risk (`invert` for Debt, Earmarked and LTV);
 * `chip` is the grey trace an action leaves ({ text, tone }). The figure
 * tweens and the tile takes the copper wash when `play` changes and the
 * value moved. `k` is the tile's stat name, so a `Stat` in the text lights it.
 */
export function Tile({ k, label, value, show, ahead = null, invert = false, chip = null, lit = false, play, wash = true, icon = TILE_ICON[k], note = null }) {
  const isPointed = usePointed();
  const src = useBaseUrl(icon ? `/img/academy-app/${icon}.svg` : "/");
  const finite = Number.isFinite(value);
  const shown = useTween(finite ? value : 0, play, SLOW_TWEEN);
  const was = useRef(value);
  const changed = !near(was.current, value);
  useEffect(() => {
    was.current = value;
  }, [value]);
  const washKey = useWash(wash, play, changed);
  // A Stat aimed at a figure or at one copy of it (`StatScope`) lights only that copy's tile.
  const pointed = isPointed(k);
  let line = note;
  if (!line && ahead != null && !near(ahead, value)) {
    const up = !Number.isFinite(ahead) || ahead > value;
    const good = up !== invert;
    line = (
      <span className={`${app.ahead} ${good ? app.good : app.bad}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {show(ahead, true)}
      </span>
    );
  } else if (!line && chip) {
    line = <span className={`${app.delta} ${chip.tone === "bad" ? app.bad : chip.tone === "good" ? app.good : ""}`}>{chip.text}</span>;
  }
  return (
    <div className={`${app.tile} ${lit || pointed ? app.tileOn : ""} ${pointed ? app.pointed : ""}`} data-tile={k}>
      {washKey ? <span key={washKey} className={app.wash} aria-hidden="true" /> : null}
      {icon ? <img src={src} alt="" className={app.tileIcon} width="40" height="40" /> : null}
      <div className={app.tileText}>
        <div className={app.tileLabel}>{label}</div>
        <div className={app.tileValue}>{finite ? show(shown) : show(value)}</div>
        <div className={app.tileNote}>{line}</div>
      </div>
    </div>
  );
}

/** A row of tiles, `per` to a row (the app's four, or three for six tiles). */
export function Tiles({ per = 3, children }) {
  return (
    <div className={app.stats} style={{ "--app-tiles": per }}>
      {children}
    </div>
  );
}

/**
 * The health bar: the deposit as the track, the debt as the fill (`ltv`, a
 * fraction), MAX LTV at 90% and LIQ LTV at 95%. `ghost` is a dashed outline
 * at another LTV (the app's preview, or where the fill stood before).
 * `redZone` reddens the bar past LIQ LTV. `lit` names parts to keep bright
 * ("debt", "max", "liq"); with it set, the rest fade.
 */
export function HealthBar({ ltv, earmarked = 0, ghost = null, play, redZone = false, legend = true, lit = null }) {
  const { stat, slow } = useAppContext();
  const fill = useTween(ltv, play, slow ? SLOW_TWEEN : 700);
  const pct = (x) => `${Math.min(Math.max(x, 0), 1) * 100}%`;
  const fading = Boolean(lit && lit.length);
  const fade = (k) => (fading && !lit.includes(k) && stat !== `${k}ltv` ? app.barFade : "");
  return (
    <div className={app.barWrap}>
      <div className={app.bar} role="img" aria-label={`Debt is ${(ltv * 100).toFixed(1)}% of the deposit`}>
        <span className={`${app.barDebt} ${fade("debt")}`} style={{ width: pct(fill) }} />
        {earmarked > 0.0005 ? <span className={app.barEarmark} style={{ left: pct(fill - earmarked), width: pct(earmarked) }} /> : null}
        {redZone ? <span className={css.barRed} /> : null}
        {ghost != null && Math.abs(ghost - ltv) > 0.0005 ? <span className={app.barGhost} style={{ width: pct(ghost) }} /> : null}
        <span className={`${app.barMax} ${fade("max")} ${stat === "maxltv" ? app.markPointed : ""}`} style={{ left: "90%" }} />
        <span className={`${app.barLiq} ${fade("liq")} ${stat === "liqltv" ? app.markPointed : ""}`} style={{ left: "95%" }} />
      </div>
      <div className={`${app.barTags} ${app.barTagsBoth}`}>
        <span className={`${app.tagMax} ${fade("max")} ${stat === "maxltv" ? app.tagPointed : ""}`} style={{ right: "calc(10% + 0.5rem)" }}>MAX LTV</span>
        <span className={`${app.tagLiq} ${fade("liq")} ${stat === "liqltv" ? app.tagPointed : ""}`} style={{ right: 0 }}>LIQ LTV</span>
      </div>
      {legend ? (
        <div className={app.legend}>
          <span><i className={app.dotDeposit} />Deposit</span>
          <span><i className={app.dotDebt} />Debt</span>
          <span><i className={app.dotEarmark} />Earmarked</span>
        </div>
      ) : null}
    </div>
  );
}

/* ── The Dashboard ───────────────────────────────────────── */

/**
 * One card under the Dashboard's Open Vault Positions, as the app draws it
 * (`VaultDashboardCard.tsx`): the chain, the ⋮ menu at the top right, the
 * token, then Deposit, Debt, APR, LTV and Earmarked, the bar, and Manage.
 * No position number: the card does not show one. `menu` and `manage` are
 * the card's two controls when a moment uses them. The APR is the course's
 * example 5.00%.
 */
export function DashCard({ deposit, debt = 0, earmarked = 0, apr = "5.00%", menu = null, manage = null, lit = [], dim = false }) {
  const ltv = deposit > 0 ? debt / deposit : 0;
  // AppMock's card, the one the beginner track's Dashboard shows (2026-11-10):
  // the chain flag at the corner, the token over its symbol, the five rows,
  // the bar with its legend, and Manage. It was a drawing of its own here,
  // with the chain as a word and no legend.
  return (
    <AppPositionCard
      compact
      className={css.cardFit}
      deposit={`${trunc(deposit)} USDC`}
      debt={`${trunc(debt)} alUSD`}
      apr={apr}
      ltv={`${trunc(ltv * 100)}/90.00%`}
      earmarked={`${trunc(earmarked)} alUSD`}
      fill={ltv}
      mark={deposit > 0 ? Math.min(earmarked, debt) / deposit : 0}
      lit={lit}
      on={lit.includes("card")}
      dim={dim}
      menu={menu ?? undefined}
      manage={manage}
    />
  );
}

/** A Dashboard section heading, as the app writes them ("Open Vault Positions"). */
export function DashHeading({ lit = false, children }) {
  return <div className={`${css.dashHeading} ${lit ? css.dashHeadingLit : ""}`}>{children}</div>;
}

/** The vault's name as its page heads it, with the position number when the page was opened through Manage. */
export function VaultHead({ id = null, idLit = false }) {
  const src = useBaseUrl("/img/academy-app/USDC.svg");
  return (
    <div className={css.vaultHead}>
      <img src={src} alt="" width="32" height="32" />
      <div>
        <div className={css.vaultHeadName}>{VAULT_NAME}</div>
        <div className={css.vaultHeadSub}>
          Ethereum
          {id ? <span className={`${css.posId} ${idLit ? css.posIdLit : ""}`}>#{id}</span> : null}
        </div>
      </div>
    </div>
  );
}

/* ── Lesson 1, page 1: a deposit from the Borrow page ────── */

const MYT_PRICE = 1.25;
const FIRST = 10_000;
const MINTED = FIRST / MYT_PRICE;

/** The position NFT, as it sits in a wallet. */
function NftCard({ fresh = false, hide = false }) {
  return (
    <Holding kind="nft" fresh={fresh} hide={hide}>
      Position #1234
    </Holding>
  );
}

function RouterChip({ lit }) {
  const ref = useNode("router");
  return (
    <span ref={ref} className={`${css.router} ${lit ? css.routerLit : ""}`}>
      Router
    </span>
  );
}

/**
 * "Type 10,000 in the USDC field on the Deposit/Borrow tab and press
 * Deposit." Three boxes, the wallet, the MYT vault and the Alchemist, with
 * the Router under them, over the vault's Deposit/Borrow tab. The press runs
 * the router's three steps 1.5 s apart: the USDC into the MYT vault, the
 * 8,000 mixUSDC it mints on to the Alchemist, and the new position's NFT
 * back to the wallet through the Router. The strip moves when the last one
 * lands. No position number under the vault's name: the app shows one only
 * on a page opened through the Dashboard's Manage.
 */
export function DepositPathFigure() {
  const m = useMoment("deposit");
  const [typed, setTyped] = useState("");
  // 0 at rest; 1 to 3 while a step runs; 9 once done. `landed` counts the steps whose token has arrived.
  const [phase, setPhase] = useState(0);
  const [landed, setLanded] = useState(0);
  const [tokens, send] = useTokens();
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (m.done) {
      setPhase(9);
      setLanded(3);
    }
  }, [m.done]);
  const base = m.done ? m.before : m.position;
  const n = Number(typed) || 0;
  const live = m.ready && phase === 0;
  const ok = live && n === FIRST && base.wallet >= FIRST;
  useMomentNote("deposit", live && n > base.wallet ? OVER_WALLET : null);
  const run = async () => {
    setPhase(1);
    await send({ from: "wallet", to: "vault", label: "10,000 USDC" });
    if (!alive.current) return;
    setLanded(1);
    await wait(400);
    setPhase(2);
    await send({ from: "vault", to: "alchemist", label: "8,000 mixUSDC", kind: "myt" });
    if (!alive.current) return;
    setLanded(2);
    await wait(400);
    setPhase(3);
    await send({ from: "alchemist", to: "wallet", via: ["router"], label: "Position #1234", kind: "nft", ms: 1600 });
    if (!alive.current) return;
    setLanded(3);
    await wait(500);
    setPhase(9);
    m.apply({ ...m.position, wallet: m.position.wallet - FIRST, deposit: m.position.deposit + FIRST });
  };
  const walletUsdc = phase >= 1 ? base.wallet - FIRST : base.wallet;
  const shownUsdc = useTween(walletUsdc, phase, SLOW_TWEEN);
  const deposit = landed >= 2 ? base.deposit + FIRST : base.deposit;
  return (
    <Stage>
      <PracticeFrame label="a deposit from the Borrow page" title={VAULT_NAME} sub="Ethereum" icon="USDC">
        <FlowArea tokens={tokens} className={css.withRouter}>
          <div className={css.columns}>
            <Box id="wallet" title="Your wallet" lit={phase === 1 || phase === 3}>
              <Holding>{fmt(shownUsdc)} USDC</Holding>
              <NftCard fresh={phase === 3 || phase === 9} hide={landed < 3} />
            </Box>
            <Connector lit={phase === 1} />
            <Box id="vault" title="MYT vault" lit={phase === 1 || phase === 2}>
              <Holding kind="chip">1 mixUSDC = 1.25 USDC</Holding>
              <Holding kind="myt" fresh hide={landed < 1}>Minted {fmt(MINTED)} mixUSDC</Holding>
            </Box>
            <Connector lit={phase === 2} />
            <Box id="alchemist" title="Alchemist" lit={phase === 2 || phase === 3}>
              <Turns>
                <Holding kind="row" fresh hide={landed < 2}>
                  Position #1234 · {fmt(MINTED)} mixUSDC · Deposit {fmt(FIRST)} USDC
                </Holding>
                <Empty hide={landed >= 2}>No position</Empty>
              </Turns>
            </Box>
          </div>
          <div className={css.routerLane}>
            <RouterChip lit={phase === 3} />
          </div>
        </FlowArea>
        <Tiles per={2}>
          <Tile k="deposit" label="Deposit" value={deposit} show={SHOW.usdc} play={landed} lit={phase === 9} />
          <Tile k="debt" label="Debt" value={0} show={SHOW.al} play={landed} />
        </Tiles>
        <div className={css.appCard}>
          <AppTabs tabs={VAULT_TABS} live="Deposit/Borrow" lit />
          <AppPanel>
            <AppInput
              token="USDC"
              amount={phase === 0 ? typed : ""}
              onChange={live ? setTyped : undefined}
              balance={walletUsdc}
              prevBalance={m.done ? base.wallet : null}
              digits={2}
            />
            <AppButton disabled={!ok} hint={m.done ? null : !m.ready ? NOT_READY : n !== FIRST ? "Type 10,000" : null} onClick={run}>
              Deposit
            </AppButton>
          </AppPanel>
        </div>
      </PracticeFrame>
    </Stage>
  );
}
DepositPathFigure.moment = "deposit";
DepositPathFigure.hint = "Type 10,000 and press Deposit";

/* ── Lesson 1, page 2: Mixed Yield, then adding to the position ── */

const MIX_MINTED = 8_000;

/**
 * Page 2's one element. "Type 10,000 in the USDC field on the practice Mixed
 * Yield card and press Deposit": the USDC goes into the MYT vault and the
 * mixUSDC it mints comes back to the wallet; the Alchemist stays dim. Then a
 * mini Dashboard comes in beside the card with the position under Open Vault
 * Positions and the mixUSDC under Mixed Yield Token Holdings.
 *
 * "On the Dashboard, press Manage on your USDC position. Pick mixUSDC ...,
 * type 8,000 and press Deposit": Manage opens the vault's Deposit/Borrow tab
 * with #1234 under its name; the mixUSDC goes straight to the Alchemist,
 * round the MYT vault, and the position's Deposit reads 20,000.
 */
export function MixedYieldPathFigure() {
  const mix = useMoment("mixed-deposit");
  const add = useMoment("add-myt");
  const [typed, setTyped] = useState("");
  const [typed2, setTyped2] = useState("");
  const [token, setToken] = useState("USDC");
  const [managed, setManaged] = useState(false);
  const [flashId, setFlashId] = useState(false);
  const [mp, setMp] = useState(0);
  const [ml, setMl] = useState(0);
  const [ap, setAp] = useState(0);
  const [al, setAl] = useState(0);
  const [tokens, send] = useTokens();
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (mix.done) {
      setMp(9);
      setMl(2);
    }
  }, [mix.done]);
  useEffect(() => {
    if (add.done) {
      setAp(9);
      setAl(1);
      setManaged(true);
      setToken("mixUSDC");
    }
  }, [add.done]);

  const base = mix.done ? mix.before : mix.position;
  const n = Number(typed) || 0;
  const n2 = Number(typed2) || 0;
  const mixLive = mix.ready && mp === 0;
  const walletUsdc = mp >= 1 ? base.wallet - FIRST : base.wallet;
  const walletMyt = ap >= 1 ? 0 : ml >= 2 ? MIX_MINTED : 0;
  const shownUsdc = useTween(walletUsdc, mp, SLOW_TWEEN);
  const posDeposit = al >= 1 ? base.deposit + FIRST : base.deposit;
  const addLive = add.ready && managed && ap === 0;
  const bal2 = token === "mixUSDC" ? walletMyt : walletUsdc;

  useMomentNote("mixed-deposit", mixLive && n > walletUsdc ? OVER_WALLET : null);
  useMomentNote("add-myt", addLive && n2 > 0 && token !== "mixUSDC" ? "Pick mixUSDC first" : addLive && n2 > bal2 ? OVER_WALLET : null);

  const runMix = async () => {
    setMp(1);
    await send({ from: "wallet", to: "vault", label: "10,000 USDC" });
    if (!alive.current) return;
    setMl(1);
    await wait(400);
    setMp(2);
    await send({ from: "vault", to: "wallet", label: "8,000 mixUSDC", kind: "myt" });
    if (!alive.current) return;
    setMl(2);
    await wait(500);
    setMp(3);
    await wait(1400);
    if (!alive.current) return;
    setMp(9);
    mix.apply({ ...mix.position, wallet: mix.position.wallet - FIRST, walletMyt: (mix.position.walletMyt ?? 0) + MIX_MINTED });
  };
  const manage = () => {
    setManaged(true);
    setFlashId(true);
    setTimeout(() => {
      if (alive.current) setFlashId(false);
    }, 2000);
  };
  const runAdd = async () => {
    setAp(1);
    await send({ from: "wallet", to: "alchemist", via: [{ id: "vault", below: true }], label: "8,000 mixUSDC", kind: "myt", ms: 1600 });
    if (!alive.current) return;
    setAl(1);
    await wait(900);
    if (!alive.current) return;
    setAp(9);
    add.apply({ ...add.position, walletMyt: 0, deposit: add.position.deposit + FIRST });
  };

  const showDash = mp >= 3;
  const mixLit = mp === 1 || mp === 2;
  // While the page reads the two Dashboard sections, both are lit.
  const readDash = mix.done && !managed;
  return (
    <Stage>
      <PracticeFrame label="a Mixed Yield deposit and the Dashboard" title={VAULT_NAME} sub="Ethereum" icon="USDC">
        <FlowArea tokens={tokens} className={css.withLane}>
          <div className={`${css.columns} ${css.columnsTall}`}>
            <Box id="wallet" title="Your wallet" lit={mixLit || ap === 1}>
              <Holding>{fmt(shownUsdc)} USDC</Holding>
              {walletMyt > 0 ? <Holding kind="myt" fresh={mp === 3}>{fmt(walletMyt)} mixUSDC</Holding> : null}
              <NftCard />
            </Box>
            <Connector lit={mixLit} back={mp === 2} />
            <Box id="vault" title="MYT vault" lit={mixLit} dim={ap === 1}>
              <Holding kind="chip">1 mixUSDC = 1.25 USDC</Holding>
              {ml >= 1 && mp < 9 ? <Holding kind="myt" fresh>Minted {fmt(MIX_MINTED)} mixUSDC</Holding> : null}
            </Box>
            <Connector />
            <Box id="alchemist" title="Alchemist" lit={ap === 1} dim={mp >= 1 && mp < 9}>
              <Holding kind="row" fresh={al >= 1 && ap === 1}>
                Position #1234 · {fmt(al >= 1 ? MINTED + MIX_MINTED : MINTED)} mixUSDC · Deposit {fmt(posDeposit)} USDC
              </Holding>
            </Box>
          </div>
        </FlowArea>
        <Grow>
          <div className={css.pair}>
            <div className={css.screen}>
              {!managed ? (
                <div className={`${css.appCard} ${mixLive ? css.appCardOn : ""}`}>
                  <div className={css.screenLabel}>Mixed Yield</div>
                  <VaultHead />
                  <AppTabs tabs={["Deposit", "Withdraw"]} live="Deposit" lit />
                  <AppInput
                    token="USDC"
                    amount={mp === 0 ? typed : ""}
                    onChange={mixLive ? setTyped : undefined}
                    balance={walletUsdc}
                    prevBalance={mix.done ? base.wallet : null}
                    digits={2}
                  />
                  <AppButton disabled={!(mixLive && n === FIRST && walletUsdc >= FIRST)} hint={mix.done ? null : !mix.ready ? NOT_READY : n !== FIRST ? "Type 10,000" : null} onClick={runMix}>
                    Deposit
                  </AppButton>
                </div>
              ) : (
                <div className={`${css.appCard} ${ap === 0 ? css.appCardOn : ""}`}>
                  <VaultHead id="1234" idLit={flashId} />
                  <AppTabs tabs={VAULT_TABS} live="Deposit/Borrow" lit />
                  <AppInput
                    token={token}
                    tokens={["USDC", "mixUSDC"]}
                    onToken={
                      addLive
                        ? (t) => {
                            setToken(t);
                            setTyped2("");
                          }
                        : undefined
                    }
                    amount={ap === 0 ? typed2 : ""}
                    onChange={addLive ? setTyped2 : undefined}
                    balance={bal2}
                    prevBalance={add.done ? MIX_MINTED : null}
                    digits={2}
                  >
                    {/* Inside the amount box, where the app's button is (live vault page, 2026-11-10). */}
                    <AppButton disabled={!(addLive && token === "mixUSDC" && n2 === MIX_MINTED)} hint={add.done ? null : token !== "mixUSDC" ? "Pick mixUSDC first" : n2 !== MIX_MINTED ? "Type 8,000" : null} onClick={runAdd}>
                      Deposit
                    </AppButton>
                  </AppInput>
                </div>
              )}
            </div>
            <div className={`${css.dash} ${showDash ? css.dashIn : css.dashOut}`} aria-hidden={showDash ? undefined : true}>
              <div className={css.dashTitle}>Dashboard</div>
              <div className={css.dashCols}>
                <div className={css.dashCol}>
                  <DashHeading lit={readDash}>Open Vault Positions</DashHeading>
                  <DashCard
                    deposit={posDeposit}
                    lit={readDash || al >= 1 ? ["deposit"] : []}
                    manage={
                      <AppButton disabled={!(add.ready && !managed)} lit={add.ready && !managed} onClick={manage}>
                        Manage
                      </AppButton>
                    }
                  />
                </div>
                <div className={css.dashCol}>
                  <DashHeading lit={readDash}>Mixed Yield Token Holdings</DashHeading>
                  <div className={css.mytTable}>
                    <div className={css.mytHead}>
                      <span>MYT Position</span>
                      <span>Deposit</span>
                    </div>
                    <div className={`${css.mytRow} ${walletMyt > 0 ? "" : css.mytRowGone}`}>
                      <span className={css.mytName}>
                        <b>USDC</b>
                        <small>Ethereum</small>
                      </span>
                      <span className={css.mytDeposit}>
                        <b>${trunc(FIRST)}</b>
                        <small>{trunc(MIX_MINTED)} mixUSDC</small>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Grow>
      </PracticeFrame>
    </Stage>
  );
}
MixedYieldPathFigure.moment = "mixed-deposit";
MixedYieldPathFigure.hint = "Type 10,000 and press Deposit";

/**
 * Page 2's Dashboard capture (script I1: a vault position and a Mixed Yield
 * deposit, which needs a wallet that holds both). The figure above draws the same two
 * sections, practice-tagged and changing with the page's two actions, so a
 * second, static copy here would repeat it and then go stale after the add.
 * Nothing is drawn until the capture exists.
 */
export function DashboardBothShot() {
  return null;
}

/* ── Lesson 1, page 3: send the position ─────────────────── */

const MOVES = {
  send: { from: "you", to: "w2", recipient: "Wallet 2" },
  "send-back": { from: "w2", to: "you", recipient: "Your wallet" },
};

/**
 * "Press ⋮ on your USDC position, choose Send, tick the confirmation
 * checkbox and press Send position." Two mini Dashboards, your wallet and
 * Wallet 2. The ⋮ menu has Send; the dialog is the app's
 * (`SendPositionDialog.tsx`), its description without the dash. On Send
 * position the button reads Sent, the dialog closes and the card slides
 * across. The second moment sends it back the same way.
 */
export function SendPositionFigure() {
  const first = useMoment("send");
  const back = useMoment("send-back");
  const activeId = !first.done ? "send" : !back.done ? "send-back" : null;
  const active = activeId === "send" ? first : activeId === "send-back" ? back : null;
  const move = activeId ? MOVES[activeId] : null;
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [ticked, setTicked] = useState(false);
  const [sent, setSent] = useState(false);
  const [moving, setMoving] = useState(false);
  const [tokens, send] = useTokens();
  const { alive, wait } = useRunner();
  const home = back.done ? "you" : first.done ? "w2" : "you";
  const deposit = (first.done ? first.before : first.position).deposit;
  const canAct = Boolean(active && active.ready && !moving);

  const press = async () => {
    setSent(true);
    await wait(700);
    if (!alive.current) return;
    setDialog(false);
    setSent(false);
    setTicked(false);
    setMoving(true);
    await send({ from: `card-${move.from}`, to: `card-${move.to}`, label: <MovingCard deposit={deposit} />, kind: "slide", ms: 1000 });
    if (!alive.current) return;
    active.apply({ ...active.position, deposit: activeId === "send" ? 0 : deposit });
    setMoving(false);
  };

  const side = (who, label) => {
    const here = home === who && !moving;
    const mine = Boolean(move && move.from === who);
    return (
      <div className={css.sendSide}>
        <div className={css.dashTitle}>{label}</div>
        <DashHeading>Open Vault Positions</DashHeading>
        <CardSlot id={`card-${who}`}>
          {here ? (
            <DashCard
              deposit={deposit}
              lit={["card"]}
              menu={
                <span className={css.menuWrap}>
                  <button
                    type="button"
                    aria-label="Position actions"
                    className={`${css.dots} ${canAct && mine && !dialog ? css.dotsLit : ""}`}
                    disabled={!(canAct && mine)}
                    onClick={() => setMenu((o) => !o)}
                  >
                    ⋮
                  </button>
                  {menu && mine ? (
                    <span className={css.menu} role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenu(false);
                          setDialog(true);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                        </svg>
                        Send
                      </button>
                    </span>
                  ) : null}
                </span>
              }
            />
          ) : (
            <span className={css.noPositions}>No open positions</span>
          )}
        </CardSlot>
      </div>
    );
  };

  return (
    <Stage>
      <PracticeFrame label="two wallets' Dashboards">
        <FlowArea tokens={tokens}>
          <div className={css.sendPair}>
            {side("you", "Your wallet")}
            {side("w2", "Wallet 2")}
          </div>
          {dialog && move ? (
            <div className={css.dialogBack}>
              <div className={css.dialog} role="dialog" aria-label="Send USDC position #1234">
                <div className={css.dialogTitle}>Send USDC position #1234</div>
                <div className={css.dialogText}>
                  Transfer this position NFT to another address. Whoever holds the NFT controls the deposit and debt. This action is irreversible.
                </div>
                <label className={css.dialogLabel}>
                  Recipient address
                  <input className={css.dialogField} type="text" readOnly value={move.recipient} />
                </label>
                <label className={css.check}>
                  <input type="checkbox" checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
                  <span>I verified this address and understand the position will be transferred.</span>
                </label>
                <AppButton disabled={!ticked || sent} lit={ticked && !sent} onClick={press}>
                  {sent ? "Sent" : "Send position"}
                </AppButton>
              </div>
            </div>
          ) : null}
        </FlowArea>
      </PracticeFrame>
    </Stage>
  );
}
SendPositionFigure.moment = "send";
SendPositionFigure.hint = "Press ⋮, choose Send, tick the box and press Send position";

function CardSlot({ id, children }) {
  const ref = useNode(id);
  return (
    <div ref={ref} className={css.cardSlot}>
      {children}
    </div>
  );
}

/** The card as it slides from one Dashboard to the other. */
function MovingCard({ deposit }) {
  return <DashCard deposit={deposit} lit={["card"]} menu={<span className={css.dots}>⋮</span>} />;
}

/* ── Lesson 1, page 4: the three contracts together ──────── */

/**
 * Your share of the depositor's 5,000, as a fraction of your 20,000 deposit:
 * a small slice, drawn with no number. Every borrower carries a share in
 * proportion to their debt, so yours is a sliver of the vault's total.
 */
const SHARE = 0.03;

/** Each step's end state on the loop figure; `k` is the number of steps done. */
function loopState(k) {
  return {
    youAl: k >= 1,
    debt: k >= 1 ? 5_000 : 0,
    trAl: k >= 2,
    nft: k >= 2 && k < 4 ? "depositor" : null,
    vest: k >= 3 ? 1 : 0,
    earmarked: k === 3 ? 1 : 0,
    claimed: k >= 4,
    burned: k >= 4,
    usdc: k >= 4,
  };
}

/**
 * "Press Next step to follow one of each, contract by contract." The numbered
 * list in the MDX, one step at a time, on Next step and Previous step (not
 * "Back", which is the page footer's button a few lines under it), over one figure: the
 * Alchemist, the Transmuter and the MYT vault, with you on the left and a
 * Fixed Yield depositor on the right. Each step lights only the contracts
 * that act and sends its tokens; the fourth runs its parts 1 s apart.
 * Nothing here touches the practice wallet.
 */
export function ContractLoopSequence({ children }) {
  const m = useMoment("loop");
  const list = React.Children.toArray(children).find((c) => React.isValidElement(c));
  const items = list ? React.Children.toArray(list.props.children).filter((c) => React.isValidElement(c)) : [];
  const total = items.length;
  const [step, setStep] = useState(0);
  const [view, setView] = useState(loopState(0));
  const [lit, setLit] = useState([]);
  const [busy, setBusy] = useState(false);
  const [play, setPlay] = useState(0);
  const [tokens, send] = useTokens();
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (m.done && step === 0) {
      setStep(total);
      setView(loopState(total));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.done]);

  const patch = (p) => setView((v) => ({ ...v, ...p }));
  const forward = async () => {
    const k = step + 1;
    setBusy(true);
    setStep(k);
    if (k === 1) {
      setLit(["alchemist"]);
      setPlay((x) => x + 1);
      patch({ debt: 5_000 });
      await send({ from: "alchemist", to: "you", label: "5,000 alUSD", kind: "al" });
      if (!alive.current) return;
      patch({ youAl: true });
    } else if (k === 2) {
      setLit(["transmuter"]);
      await send({ from: "depositor", to: "transmuter", label: "5,000 alUSD", kind: "al", ms: 1500 });
      if (!alive.current) return;
      patch({ trAl: true });
      await wait(300);
      await send({ from: "transmuter", to: "depositor", label: "Fixed Yield NFT", kind: "nft", ms: 1500 });
      if (!alive.current) return;
      patch({ nft: "depositor" });
    } else if (k === 3) {
      setLit(["transmuter", "alchemist"]);
      setPlay((x) => x + 1);
      patch({ vest: 1, earmarked: 1 });
      await wait(1800);
    } else if (k === 4) {
      setLit(["alchemist"]);
      setPlay((x) => x + 1);
      patch({ earmarked: 0, claimed: true });
      await wait(1000);
      if (!alive.current) return;
      setLit(["alchemist", "transmuter"]);
      await send({ from: "alchemist", to: "transmuter", label: "MYT", kind: "myt" });
      if (!alive.current) return;
      setLit(["transmuter", "vault"]);
      await send({ from: "transmuter", to: "vault", label: "MYT", kind: "myt" });
      if (!alive.current) return;
      await send({ from: "vault", to: "depositor", label: "USDC", ms: 1300 });
      if (!alive.current) return;
      patch({ usdc: true, nft: null });
      await wait(300);
      setLit(["transmuter"]);
      patch({ burned: true });
      await wait(1000);
    }
    if (!alive.current) return;
    setView(loopState(k));
    setLit([]);
    setBusy(false);
    if (k === total && !m.done) m.apply({ ...m.position });
  };
  const backward = () => {
    const k = Math.max(step - 1, 0);
    setStep(k);
    setView(loopState(k));
    setLit([]);
  };

  const on = (id) => lit.includes(id);
  const ltv = view.debt / 20_000;
  return (
    <>
      <Stage>
        <PracticeFrame label="a loan and a Fixed Yield deposit" heading="What if">
          <FlowArea tokens={tokens}>
            <div className={css.loop}>
              {/* Every part a step adds is in its box from the start, hidden
                  until its step, and parts that replace each other share one
                  place (`Turns`), so no step changes the figure's height. */}
              <Box id="you" title="You" className={css.person}>
                <Turns>
                  <Holding kind="al" fresh hide={!view.youAl}>5,000 alUSD</Holding>
                  <Empty hide={view.youAl}>Nothing borrowed</Empty>
                </Turns>
              </Box>
              <Box id="alchemist" title="Alchemist" lit={on("alchemist")} dim={busy && !on("alchemist")}>
                <div className={css.loopRow}>
                  <b>Position #1234</b>
                  <Turns>
                    <span className={css.loopLegend} style={view.vest ? undefined : { visibility: "hidden" }} aria-hidden={view.vest ? undefined : true}>
                      <span><i className={app.dotDeposit} />Deposit</span>
                      <span><i className={app.dotDebt} />Debt</span>
                      <span><i className={app.dotEarmark} />Earmarked</span>
                    </span>
                    <span style={view.vest ? { visibility: "hidden" } : undefined} aria-hidden={view.vest ? true : undefined}>
                      Deposit 20,000 · Debt {fmt(view.debt)} · LTV {fmt(ltv * 100)}%
                    </span>
                  </Turns>
                </div>
                <LoopBar
                  deposit={view.claimed ? 1 - SHARE : 1}
                  debt={view.claimed ? ltv - SHARE : ltv}
                  earmarked={view.claimed ? 0 : SHARE * view.earmarked}
                  play={play}
                />
              </Box>
              <Box id="transmuter" title="Transmuter" lit={on("transmuter")} dim={busy && !on("transmuter")}>
                {/* The deposit, then its vesting bar, then the burned NFT, whose
                    place is the empty foot of the box until the claim. */}
                <Turns>
                  <Holding kind="al" hide={!view.trAl || view.burned}>5,000 alUSD</Holding>
                  <Holding kind="al" gone hide={!view.burned}>5,000 alUSD · burned</Holding>
                  <Empty hide={view.trAl}>No deposits</Empty>
                </Turns>
                <div className={css.vest} style={view.trAl ? undefined : { visibility: "hidden" }} aria-hidden={view.trAl ? undefined : true}>
                  <span className={css.vestLabel}>vesting</span>
                  <span className={css.vestTrack}>
                    <i style={{ width: `${view.vest * 100}%` }} />
                  </span>
                </div>
                <Holding kind="nft" gone hide={!view.burned}>
                  Fixed Yield NFT · burned
                </Holding>
              </Box>
              <Box id="vault" title="MYT vault" lit={on("vault")} dim={busy && !on("vault")}>
                <Holding kind="chip">MYT to USDC</Holding>
              </Box>
              <Box id="depositor" title="Depositor" className={css.person}>
                <Turns>
                  <Holding kind="nft" fresh hide={view.nft !== "depositor"}>Fixed Yield NFT</Holding>
                  <Holding fresh hide={!view.usdc}>USDC</Holding>
                  <Holding kind="al" hide={view.trAl}>5,000 alUSD</Holding>
                </Turns>
              </Box>
            </div>
          </FlowArea>
        </PracticeFrame>
      </Stage>
      {step > 0 ? (
        <div className={css.steps}>
          <StepList steps={items.slice(0, step).map((li) => ({ text: li.props.children }))} />
        </div>
      ) : null}
      <div className={parts.controlRow}>
        <button type="button" className={`${parts.lessonControl} ${css.backStep}`} disabled={step === 0 || busy} onClick={backward}>
          Previous step
        </button>
        {/* Gone after the last step, and back if the reader steps back. */}
        <FoldAway show={step < total}>
          <button type="button" className={parts.lessonControl} disabled={!(m.ready || m.done) || busy || step >= total} onClick={forward}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 5v14l8-7zM12 5v14l8-7z" />
            </svg>
            Next step
          </button>
        </FoldAway>
      </div>
    </>
  );
}
ContractLoopSequence.moment = "loop";
ContractLoopSequence.hint = "Step through the loan and the deposit to continue";

/**
 * The position's bar on the loop figure, every part a fraction of the 20,000
 * deposit it starts with: the deposit as the track, the debt as the fill and
 * the earmarked part at the fill's edge. At the claim the redemption takes the
 * earmarked slice off both sides, so the fill and the track shorten together
 * and a faint outline keeps the deposit's old length.
 */
function LoopBar({ deposit, debt, earmarked, play }) {
  const track = useTween(deposit, play, SLOW_TWEEN);
  const fill = useTween(debt, play, SLOW_TWEEN);
  const mark = useTween(earmarked, play, SLOW_TWEEN);
  const of = (x) => `${(Math.max(x, 0) / Math.max(track, 0.001)) * 100}%`;
  return (
    <div className={css.loopBar} aria-hidden="true">
      <div className={`${app.bar} ${css.loopTrack}`} style={{ width: `${track * 100}%` }}>
        <span className={app.barDebt} style={{ width: of(fill) }} />
        {mark > 0.001 ? <span className={app.barEarmark} style={{ left: of(fill - mark), width: of(mark) }} /> : null}
      </div>
    </div>
  );
}

/* ── Lesson 1, page 4: the Contracts tab ─────────────────── */

/** The Ethereum USDC vault's rows, read from the live Contracts tab (2026-11-07, no wallet). */
const CONTRACTS = [
  ["Alchemist V3", "0xeB83112d925268BeDe86654C13D423a987587e3E"],
  ["mixUSDC MYT", "0x9B44efCa3e2a707B63Dc00CE79d646E5E5D24bA5"],
  ["alUSD", "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9"],
  ["Transmuter", "0x2584E8b0616b3E750492c9629a3b27679C410cb9"],
  ["Yearn yvUSD", "0xdFDC17F784e16D7634AC270911D98755C68Ae220"],
  ["SiUSD USDC", "0x688Af26Bb164FDA2C9c87FCb9066e38eF28Fc3eF"],
  ["Fluid Lite USDC", "0x320e38ca23FB11cC1f673b204E301210d3758653"],
];

/**
 * The Contracts tab, opened through Manage so the position is selected (the
 * capture needs a wallet with a position; a page opened without a position
 * reads N/A on the last row). The rows and addresses are the live tab's,
 * read on 2026-11-07; the position number is the lesson's example, #1234.
 * The children are the caption.
 */
export function ContractsTabFigure({ children }) {
  return (
    <Stage>
      <PracticeFrame label="the vault page's Contracts tab" title={VAULT_NAME} sub="Ethereum" icon="USDC" className={css.contractsFrame}>
        <AppTabs tabs={INFO_TABS} live="Contracts" lit />
        <div className={`${app.panel} ${css.contracts}`}>
          {CONTRACTS.map(([name, address]) => (
            <div key={name} className={css.contractRow}>
              <span className={css.contractName}>{name}</span>
              <code className={css.contractAddress}>{address}</code>
            </div>
          ))}
          <div className={`${css.contractRow} ${css.contractLit}`}>
            <span className={css.contractName}>Alchemist Position ID</span>
            <code>1234</code>
          </div>
        </div>
        {children ? <div className={css.caption}>{children}</div> : null}
      </PracticeFrame>
    </Stage>
  );
}
