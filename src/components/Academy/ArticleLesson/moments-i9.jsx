import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import app from "../AppMock/styles.module.css";
import { AppButton, AppDelta, AppFrame, AppInput, AppPanel, AppStats, AppTabs, Grow, SLOW_TWEEN, VAULT_NAME, VAULT_TABS, useAppContext, usePointed, useTween, useWash } from "../AppMock";
import { LessonControl } from "../kit";
import { useMoment, useMomentNote } from "./position";
import { FoldAway, Stage } from "./index";
import { NOT_READY } from "./moments";
import { Frame, Hold, Slider, Tile, Tiles, Tw, f2, trunc2, useChanged, useRun } from "./moments-i7";
import base from "./moments-i7.module.css";
import own from "./moments-i9.module.css";

/**
 * The practice moments and figures of intermediate lesson 9 (script I9,
 * "Sizing a loan, and what Yield Looping does"), which is two lessons since
 * 2026-11-09: lessons/intermediate/i9SizingALoan.mdx imports SizingPlanner
 * (its page 2), and i10YieldLooping.mdx imports LoopPanel (page 1),
 * LoopingTabFigure (page 2) and LoopLossFigure (page 3). The section
 * headings below keep the script's page numbers. The planner and the loss
 * what-if leave the practice wallet as it is; the loop opens the practice
 * position.
 */

const iconPath = (name) => `/img/academy-app/${name}.svg`;

/* ── Page 1: sizing a loan ───────────────────────────────── */

/** Borrow & Swap's rate at a 0.98 market: 0.98 less the 0.05% swap fee. */
const RATE = 0.98 * (1 - 0.0005);
const WALLET = 10_000;
const LTVS = [
  { key: "72", label: "72% (plan for a 20% loss)", ltv: 0.72 },
  { key: "54", label: "54% (40% loss)", ltv: 0.54 },
  { key: "50", label: "50%", ltv: 0.5 },
  // Exactly 36.8%, the figure the label prints, so the worked sums compute
  // from what is on screen (with 36.828% the planner read "5,000.00 / 36.8% =
  // 13,576.63").
  { key: "36.8", label: "36.8% (in use today)", ltv: 0.368 },
  { key: "27", label: "27% (Ethereum caps)", ltv: 0.27 },
];
const ltvText = (l) => `${(Math.round(l * 1000) / 10).toFixed(1).replace(/\.0$/, "")}%`;

/**
 * "Pick the LTV you would choose, and change the cash if you like." The cash
 * you need, Borrow & Swap's rate, and the LTV you chose, worked through to
 * the debt and the deposit with each formula filled in, against your
 * 10,000. Past 10,000 the wallet marker turns amber and the third readout
 * works the other way: the most 10,000 can borrow at that LTV. Done once an
 * LTV is picked. The practice wallet does not change.
 */
export function SizingPlanner() {
  const m = useMoment("size");
  const [cash, setCash] = useState("4897.55");
  const [pick, setPick] = useState(m.done ? "36.8" : null);
  const [play, setPlay] = useState(0);
  useEffect(() => {
    if (m.done && !pick) setPick("36.8");
  }, [m.done, pick]);
  const c = Number(cash) || 0;
  const debt = c / RATE;
  const row = LTVS.find((x) => x.key === pick) ?? null;
  const deposit = row ? debt / row.ltv : 0;
  const over = row && deposit > WALLET + 0.005;
  const shownLtv = row ? row.ltv : LTVS[3].ltv;
  const shownDeposit = useTween(deposit, play, 700);
  const scale = Math.max(20_000, deposit * 1.08);
  const wDebt = useChanged(Math.round(debt * 100), play);
  const wDep = useChanged(Math.round(deposit * 100), play);
  const choose = (k) => {
    setPick(k);
    setPlay((x) => x + 1);
    if (m.ready && !m.done) window.setTimeout(() => m.apply({ ...m.position }), 700);
  };
  return (
    <Stage>
      <Frame title="Sizing a loan" tag="Planner" label="a planner for the deposit a loan needs">
        <div className={own.planTop}>
          <div className={own.cashBox}>
            <span className={own.fieldLabel}>Cash you need</span>
            <AppInput token="USDC" amount={cash} onChange={setCash} digits={2} label="Cash you need" />
          </div>
          <span className={own.rateChip}>Borrow &amp; Swap rate 0.9795</span>
        </div>
        <div className={own.ltvChips} role="group" aria-label="LTV you chose">
          <span className={own.chipsLabel}>LTV you chose</span>
          {LTVS.map((x) => (
            <button
              key={x.key}
              type="button"
              className={`${own.chip} ${x.key === pick ? own.chipOn : ""}`}
              aria-pressed={x.key === pick}
              disabled={!m.ready && !m.done}
              onClick={() => choose(x.key)}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className={own.readouts}>
          <div className={`${own.readout} ${base.rowLit}`}>
            {wDebt ? <span key={wDebt} className={app.wash} aria-hidden="true" /> : null}
            <div className={own.formula}>Debt = cash / 0.9795</div>
            <div className={own.worked}>
              {f2(c)} / 0.9795 = <b>{f2(debt)}</b>
            </div>
          </div>
          <div className={`${own.readout} ${row ? base.rowLit : ""}`}>
            {wDep ? <span key={wDep} className={app.wash} aria-hidden="true" /> : null}
            <div className={own.formula}>Deposit = Debt / LTV</div>
            <div className={own.worked}>
              {row ? (
                <>
                  {f2(debt)} / {ltvText(row.ltv)} = <b className={over ? own.textWarn : ""}>{f2(shownDeposit)}</b>
                </>
              ) : (
                <b className={own.blank}>&ndash;</b>
              )}
            </div>
          </div>
          <Hold show={Boolean(over)} className={`${own.readout} ${own.third} ${over ? base.rowLit : ""}`}>
            <div className={own.formula}>Most you can borrow from 10,000 = 10,000 x LTV</div>
            <div className={own.worked}>
  {/* Held at its full text while hidden, so its arrival moves nothing. */}
              10,000 x {ltvText(shownLtv)} = <b>{f2(WALLET * shownLtv)}</b> of debt, which brings <b>{f2(WALLET * shownLtv * RATE)}</b> in cash
            </div>
          </Hold>
        </div>
        <div className={own.scale} aria-hidden="true">
          <div className={own.scaleTrack}>
            <i className={`${own.scaleFill} ${over ? own.scaleOver : ""}`} style={{ width: `${(Math.min(shownDeposit, scale) / scale) * 100}%` }} />
            <span className={`${own.walletMark} ${over ? own.walletOver : ""}`} style={{ left: `${(WALLET / scale) * 100}%` }}>
              <b>Your wallet: 10,000</b>
            </span>
          </div>
          <div className={own.scaleLegend}>
            <span>Deposit needed</span>
            <span>{row ? `${f2(deposit)} USDC` : ""}</span>
          </div>
        </div>
      </Frame>
    </Stage>
  );
}
SizingPlanner.moment = "size";
SizingPlanner.hint = "Pick an LTV";

/* ── Page 2: Yield Looping ───────────────────────────────── */

const APR = 5;
const PRICE = 0.98;
const SLIP = 0.01;
/** The rate the loop sizes its flash loan on: the quote less the whole slippage allowance. */
const EFF = PRICE * (1 - SLIP);
const BUFFER = 0.9995;

/** The app's loop for a new position (useBoostedVaultQuote's deriveBoostAmounts). */
function loopAt(amount, target, lev) {
  const t = target / 100;
  const headroom = amount * t;
  const ltvRate = t * EFF;
  const maxFlash = ltvRate < 1 && headroom > 0 ? (headroom * EFF) / (1 - ltvRate) : 0;
  const buffered = maxFlash * BUFFER;
  const maxLev = Math.min(1 / (1 - t), amount > 0 ? (amount + buffered) / amount : 1);
  const effLev = Math.min(lev, maxLev);
  const frac = maxLev > 1 ? (effLev - 1) / (maxLev - 1) : 0;
  const flash = buffered * frac;
  const borrow = flash / EFF;
  return { maxLev, lev: effLev, flash, borrow, deposit: amount + flash, swap: borrow * PRICE, apr: APR * effLev };
}

/** The app's step amounts: up to four decimals, no thousands separators. */
const fmt4 = (v) => Number(v.toFixed(4)).toString();

const LOOP = loopAt(10_000, 50, Infinity);
/** The loop's states on the stats, from the empty position to the end. Stable objects, so a tween keys on them. */
const S0 = { deposit: 0, debt: 0 };
const S1 = { deposit: Math.round(LOOP.deposit * 100) / 100, debt: 0 };
const S2 = { deposit: Math.round(LOOP.deposit * 100) / 100, debt: Math.round(LOOP.borrow * 100) / 100 };
const SPARE = Math.round((LOOP.swap - LOOP.flash) * 100) / 100;
const WALLET_START = 10_000;
/**
 * The state the stats' chips are drawn from: the empty position, as two
 * objects, so the deposit's step and the debt's step each give the tween a
 * new token.
 */
const FROM_A = { deposit: 0, debt: 0 };
const FROM_B = { deposit: 0, debt: 0 };

/** What each step of the run shows: the stats state, the wallet line, and the step lit in the list. */
const RUN = [
  null,
  { s: S0, wallet: 0, lit: "wallet" },
  { s: S0, wallet: 0, flash: true, lit: "flash" },
  { s: S1, wallet: 0, flash: true, lit: "deposit" },
  { s: S1, wallet: 0, flash: true, lit: "deposit" },
  { s: S2, wallet: 0, flash: true, lit: "debt" },
  { s: S2, wallet: 0, flash: true, swap: LOOP.swap, lit: "swap" },
  { s: S2, wallet: 0, swap: SPARE, lit: "swap" },
  { s: S2, wallet: 0, swap: SPARE, nft: true, lit: "nft" },
  { s: S2, wallet: SPARE, nft: true, lit: "wallet" },
];

/**
 * The practice vault's Yield Looping tab, as the app lays it out
 * (BoostedVaultYield.tsx): Deposit Amount, Target LTV, Loop Multiplier,
 * the slippage, the box with Boosted APR or the transaction's steps, and
 * Boost Yield. The stats preview the loop as the controls move. Setting the
 * three controls is the first moment; reading the steps and pressing Boost
 * Yield the second, which plays the eight steps a second each on the stats
 * and the wallet line, then writes the practice wallet.
 */
export function LoopPanel() {
  const set = useMoment("loop-set");
  const go = useMoment("loop-go");
  const [amount, setAmount] = useState(set.done ? "10000" : "");
  const [target, setTarget] = useState(set.done ? 50 : 10);
  // The multiplier as a share of its range, so the slider's end is the
  // range's exact top (1.94165 at 50%), as the app's quote uses it.
  const [share, setShare] = useState(set.done ? 1 : 0);
  const [details, setDetails] = useState(false);
  const [ran, setRan] = useState(false);
  useEffect(() => {
    if (set.done && amount === "") {
      setAmount("10000");
      setTarget(50);
      setShare(1);
    }
  }, [set.done, amount]);
  const n = Number(amount) || 0;
  const range = loopAt(n || 10_000, target, Infinity).maxLev;
  const lev = 1 + share * (range - 1);
  const q = loopAt(n, target, lev);
  const run = useRun({
    count: 9,
    gap: 1000,
    done: go.done,
    onDone: () => go.apply({ ...go.position, wallet: SPARE, deposit: S2.deposit, debt: S2.debt }),
  });
  const r = ran ? RUN[run.at] : null;
  const finished = go.done && !ran;
  const atMax = share >= 0.999;
  const setOk = n === 10_000 && target === 50 && atMax;
  useEffect(() => {
    if (setOk && set.ready && !set.done) set.apply({ ...set.position });
  }, [setOk, set]);
  const setNote = !set.ready ? null : n !== 10_000 ? "Type 10,000 in Deposit Amount" : target !== 50 ? "Set Target LTV to 50%" : !atMax ? "Move Loop Multiplier to its maximum" : null;
  useMomentNote("loop-set", setNote);
  useMomentNote("loop-go", go.ready && !ran ? (!details ? "Press View Transaction Details" : "Press Boost Yield") : null);
  // The step on screen, lit in the list. All eight show at once, so the lit
  // one is always in view.
  const litStep = r ? Math.min(run.at, 8) : null;
  const stats = finished ? S2 : r ? r.s : S0;
  const prev = r ? (r.s === S0 ? undefined : r.s === S1 ? FROM_A : FROM_B) : finished ? null : undefined;
  const preview = !ran && !finished && q.borrow > 0 ? { deposit: q.deposit, debt: q.borrow } : undefined;
  const wallet = finished ? SPARE : r ? r.wallet : WALLET_START;
  const shownWallet = useTween(wallet, run.play, 900);
  const steps = [
    `Pull ${fmt4(n || 10_000)} USDC from wallet`,
    `Flashloan ${fmt4(q.flash)} USDC from Morpho`,
    `Deposit ${fmt4(q.flash + (n || 0))} USDC into MYT`,
    "Deposit MYT into Alchemist vault",
    `Borrow ${fmt4(q.borrow)} alUSD against position`,
    `Swap ${fmt4(q.borrow)} alUSD for ~${fmt4(q.swap)} USDC via DEX`,
    `Repay ${fmt4(q.flash)} USDC flashloan`,
    "Transfer position NFT to wallet",
  ];
  const lit = r ? (r.lit === "deposit" ? ["deposit"] : r.lit === "debt" ? ["debt"] : run.at >= 9 ? ["deposit", "debt"] : []) : ["deposit", "debt", "ltv"];
  const usdcIcon = useBaseUrl(iconPath("USDC"));
  const boosting = ran && run.at < 9;
  const live = !boosting && !finished && !(ran && run.at >= 9);
  return (
    <Stage>
      <LoopVault
        deposit={stats.deposit}
        debt={stats.debt}
        lit={lit}
        prev={prev}
        preview={preview}
        wallet={
          <div className={own.walletLine}>
            <span className={own.walletLabel}>Wallet</span>
            <span className={`${own.walletItem} ${r && r.lit === "wallet" ? base.rowLit : ""}`}>
              <img src={usdcIcon} alt="" width="18" height="18" />
              {f2(shownWallet)} USDC
            </span>
            {/* The flash loan and the position NFT never show together, so they share one place. */}
            <span className={own.slot}>
              <span className={`${own.loopChip} ${r && r.lit === "flash" ? base.rowLit : ""}`} style={{ visibility: r && r.flash ? "visible" : "hidden" }}>
                Flash loan {f2(LOOP.flash)}
              </span>
              <span className={`${own.nft} ${r && r.lit === "nft" ? base.rowLit : ""}`} style={{ visibility: (r && r.nft) || finished ? "visible" : "hidden" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2 3 7v10l9 5 9-5V7z" />
                </svg>
                Position NFT
              </span>
            </span>
            <span className={`${own.loopChip} ${r && r.lit === "swap" ? base.rowLit : ""}`} style={{ visibility: r && r.swap ? "visible" : "hidden" }}>
              {r && r.swap ? f2(r.swap) : f2(LOOP.swap)} USDC
            </span>
          </div>
        }
      >
        <div className={own.loopGrid}>
        <div className={own.loopCol}>
        <div className={own.field}>
          <span className={own.fieldLabel}>Deposit Amount</span>
          <AppInput
            token="USDC"
            amount={finished || (ran && run.at >= 9) ? "" : amount}
            onChange={live && (set.ready || set.done) ? setAmount : undefined}
            balance={live ? WALLET_START : wallet}
            digits={2}
            label="Deposit Amount"
          />
        </div>
        <Slider
          label="Target LTV"
          display={`${target}%`}
          value={target}
          min={10}
          max={90}
          step={1}
          ticks={["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%"]}
          lit={set.ready && n === 10_000 && target !== 50}
          disabled={!live || !(set.ready || set.done)}
          onChange={(v) => setTarget(v)}
        />
        <Slider
          label="Loop Multiplier"
          display={`${trunc2(lev).toFixed(2)}×`}
          value={share}
          min={0}
          max={1}
          step={0.001}
          ends={["1×", `${trunc2(range).toFixed(2)}×`]}
          name="Loop Multiplier"
          lit={set.ready && n === 10_000 && target === 50 && !atMax}
          disabled={!live || !(set.ready || set.done)}
          onChange={(v) => setShare(v)}
        />
        </div>
        <div className={own.loopCol}>
        <div className={own.detailsRow}>
          <button
            type="button"
            className={`${own.detailsLink} ${go.ready && !details ? own.detailsLit : ""}`}
            style={{ visibility: q.borrow > 0 || finished ? "visible" : "hidden" }}
            onClick={() => setDetails((d) => !d)}
          >
            {details ? "Hide Transaction Details" : "View Transaction Details"}
          </button>
          <span className={own.slippage}>
            <span>Slippage</span>
            <b>1%</b>
          </span>
        </div>
        <div className={`${own.box} ${!details && q.borrow > 0 ? base.rowLit : ""}`}>
          {details ? (
            <ol className={own.stepList}>
              {steps.map((st, i) => (
                <li key={i} data-step={i + 1} className={litStep === i + 1 ? own.stepOn : litStep != null && i + 1 < litStep ? own.stepPast : ""}>
                  <span>{i + 1}.</span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className={own.aprBox}>
              <span className={own.aprLabel}>Boosted APR</span>
              <span className={own.aprValue}>
                {APR.toFixed(2)}% → {trunc2(q.borrow > 0 ? q.apr : APR).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <AppButton
          disabled={!go.ready || !details || ran || q.borrow <= 0}
          lit={go.ready && details && !ran}
          hint={go.done || ran ? null : !go.ready ? NOT_READY : !details ? "Press View Transaction Details first" : null}
          onClick={() => {
            setRan(true);
            run.start();
          }}
        >
          {boosting ? "Boosting..." : finished || (ran && run.at >= 9) ? "Boosted" : "Boost Yield"}
        </AppButton>
        </div>
        </div>
      </LoopVault>
    </Stage>
  );
}
LoopPanel.moment = "loop-set";
LoopPanel.hint = "Type 10,000, set Target LTV to 50%, then move Loop Multiplier to its maximum";

/** An LTV as the app prints it: truncated to two decimals (49.987% reads 49.98%). */
const ltvOf = (s) => (s && s.deposit > 0 ? (s.debt / s.deposit) * 100 : 0);
const ltv2 = (n) => trunc2(n).toFixed(2);

/**
 * The LTV tile in the shared tile's look, local to this lesson so it can
 * truncate as the app does (the shared AppStats rounds, and the beginner
 * track relies on that). It takes the same `prev` and `preview` as the
 * tiles beside it: the projected arrow while the controls move, a "was"
 * chip after the loop.
 */
function LtvTile({ deposit, debt, prev, preview, on }) {
  const { slow } = useAppContext();
  const pointed = usePointed()("ltv");
  const value = ltvOf({ deposit, debt });
  const before = prev ? ltvOf(prev) : null;
  const ahead = preview ? ltvOf(preview) : null;
  const shown = useTween(value, prev, slow ? SLOW_TWEEN : 700);
  const moved = before != null && Math.abs(before - value) > 0.005;
  const washKey = useWash(true, prev, moved);
  let note = null;
  if (ahead != null && Math.abs(ahead - value) > 0.005) {
    note = (
      <span className={`${app.ahead} ${ahead > value ? app.bad : app.good}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        {ltv2(ahead)}%
      </span>
    );
  } else if (moved) {
    note = <span className={app.delta}>was {ltv2(before)}%</span>;
  }
  return (
    <div className={`${app.tile} ${on || pointed ? app.tileOn : ""} ${pointed ? app.pointed : ""}`}>
      {washKey ? <span key={washKey} className={app.wash} aria-hidden="true" /> : null}
      <div className={app.tileText}>
        <div className={app.tileLabel}>LTV</div>
        <div className={app.tileValue}>
          {ltv2(shown)}
          <span className={app.ltvCap}>/90.00%</span>
        </div>
        <div className={app.tileNote}>{note}</div>
      </div>
    </div>
  );
}

/**
 * The practice vault (AppMock's PracticeVault, composed here) with the
 * three stats the page reads, Deposit, Debt and LTV, to the cent as the app
 * prints them (the loop's preview reads 19,416.54, not 19,417, and LTV
 * 49.98%, truncated), over the vault's tabs with Yield Looping live. The
 * other tiles and the bar are left off, so the tab fits the window at a
 * reading size.
 */
function LoopVault({ deposit, debt, lit, prev, preview, wallet, children }) {
  const keep = prev === undefined ? null : prev;
  return (
    <AppFrame title={VAULT_NAME} tag="Practice" strong head={<Grow>{wallet}</Grow>}>
      <div className={own.loopStats}>
        <AppStats tiles={["deposit", "debt"]} highlight={lit} deposit={deposit} debt={debt} prev={keep} preview={preview} wash />
        <LtvTile deposit={deposit} debt={debt} prev={keep} preview={preview} on={lit.includes("ltv")} />
      </div>
      <Grow>
        <AppTabs tabs={VAULT_TABS} live="Yield Looping" lit />
        <AppPanel>{children}</AppPanel>
      </Grow>
    </AppFrame>
  );
}

/* ── Page 3: what the loop costs and earns ───────────────── */

/**
 * The Visualizer's year for the loop at the lesson's example inputs (5% APR,
 * a 50% Redemption Rate, the 0.25% redemption fee, 12 months), as
 * calculations.ts runs it: two paths, the rate holding (a share of what is
 * left each day) and the same amount coming off each day, and the middle of
 * the two (I5 teaches this). Projected Profit is the end's Deposit minus
 * Debt, less the start's, less the Loan Cost. 654.38 (664.48 if the rate
 * holds, as the text's year does).
 */
function loopYear() {
  const day = Math.pow(1 + APR / 100, 1 / 365);
  const per = (LOOP.borrow * 0.5) / 365;
  let cH = LOOP.deposit;
  let dH = LOOP.borrow;
  let cS = cH;
  let dS = dH;
  for (let i = 0; i < 365; i++) {
    cH *= day;
    cS *= day;
    const rH = Math.min((dH * 0.5) / 365, dH);
    dH -= rH;
    cH -= rH * 1.0025;
    const rS = Math.min(per, dS);
    dS -= rS;
    cS -= rS * 1.0025;
  }
  const c = (cH + cS) / 2;
  const d = (dH + dS) / 2;
  return c - d - (LOOP.deposit - LOOP.borrow) - LOOP.borrow * (1 - PRICE);
}

/**
 * In place of a capture that needs a wallet holding USDC: a practice copy of
 * the Yield Looping tab with the loop set as on the last page, Boosted APR
 * on the left, and the Visualizer's row of figures beside it at this
 * lesson's example inputs, which the app fills with the vault's live
 * figures. Loan Cost and Projected Profit light when the text names them.
 */
export function LoopingTabFigure({ children }) {
  const cost = LOOP.borrow * (1 - PRICE);
  const profit = loopYear();
  return (
    <figure className={own.tabFigure}>
      <Frame title="Yield Looping" label="the Yield Looping tab with the Visualizer's figures">
        <div className={own.tabGrid}>
          <div className={own.tabLeft}>
            <dl className={own.tabRows}>
              <div>
                <dt>Deposit Amount</dt>
                <dd>10,000.00 USDC</dd>
              </div>
              <div>
                <dt>Target LTV</dt>
                <dd>50%</dd>
              </div>
              <div>
                <dt>Loop Multiplier</dt>
                <dd>{trunc2(LOOP.lev).toFixed(2)}×</dd>
              </div>
            </dl>
            <div className={`${own.aprBox} ${own.aprSmall} ${base.rowLit}`}>
              <span className={own.aprLabel}>Boosted APR</span>
              <span className={own.aprValue}>
                {APR.toFixed(2)}% → {trunc2(LOOP.apr).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className={own.tabRight}>
            <div className={own.vizLabel}>Visualizer</div>
            <div className={own.vizInputs}>
              <span>
                Yield APY (%) <b>5.00</b>
              </span>
              <span>
                Redemption (%) <b>50.00</b>
              </span>
              <span>
                alUSD:USDC <b>0.980</b>
              </span>
              <span>
                Duration (Months) <b>12</b>
              </span>
            </div>
            <Tiles n={2}>
              <Tile label="Starting Deposit">{f2(LOOP.deposit)} USDC</Tile>
              <Tile label="Starting Debt">{f2(LOOP.borrow)} alUSD</Tile>
              <Tile label="Loan Cost" lit stat="loopLoanCost" tone="bad">
                {f2(cost)} USDC
              </Tile>
              <Tile label="Projected Profit" stat="loopProfit" tone="good">
                {f2(profit)} USDC
              </Tile>
            </Tiles>
          </div>
        </div>
      </Frame>
      <figcaption className={own.tabCaption}>{children}</figcaption>
    </figure>
  );
}

/* ── Page 4: what a loss takes from a loop ───────────────── */

const LOOPED = { d: S2.deposit, b: S2.debt };
const LOST = { d: Math.round(LOOPED.d * 0.9 * 100) / 100 };

/**
 * "Press Apply a 10% loss." A what-if: the looped position beside the same
 * 10,000 deposited alone. The loss lands in order, a second apart, each
 * figure lit: the looped deposit, its unchanged debt, its LTV, its owner's
 * share; then the deposit alone and its owner's share. The practice wallet
 * does not change.
 */
export function LoopLossFigure() {
  const m = useMoment("loop-loss");
  const run = useRun({ count: 6, gap: 1000, done: m.done, onDone: () => m.apply({ ...m.position }) });
  const s = run.at;
  const p = run.play;
  const lD = s >= 1 ? LOST.d : LOOPED.d;
  const ltv = s >= 3 ? LOOPED.b / LOST.d : LOOPED.b / LOOPED.d;
  const yours = s >= 4 ? LOST.d - LOOPED.b : LOOPED.d - LOOPED.b;
  const aD = s >= 5 ? 9_000 : 10_000;
  const aY = s >= 6 ? 9_000 : 10_000;
  const w = [useChanged(lD, p), useChanged(Math.round(ltv * 1000), p), useChanged(Math.round(yours), p), useChanged(aD, p), useChanged(aY, p)];
  const chip = (cond, text, tone = "bad") => (cond ? <AppDelta tone={tone}>{text}</AppDelta> : null);
  return (
    <>
    <Stage>
      <Frame title="What a 10% loss takes" tag="What if" label="a looped position beside a deposit alone">
        <div className={own.columns}>
          <div className={own.column}>
            <div className={own.columnHead}>Looped</div>
            <Tiles n={2}>
              <Tile label="Deposit" lit={s === 1} washKey={w[0]} note={chip(s >= 1, "-1,941.65")}>
                <Tw value={lD} play={p} /> USDC
              </Tile>
              <Tile label="Debt" lit={false}>
                <span className={s === 2 ? own.heldOn : ""}>{f2(LOOPED.b)} alUSD</span>
              </Tile>
              {/* Truncated to two decimals, as the app prints an LTV and as the loop's page reads it (49.98%). */}
              <Tile label="LTV" lit={s === 3} washKey={w[1]} note={s >= 3 ? <AppDelta tone="bad">was {ltv2((LOOPED.b / LOOPED.d) * 100)}%</AppDelta> : null}>
                <Tw value={ltv} play={p} fmt={(x) => `${ltv2(x * 100)}%`} />
              </Tile>
              <Tile label="Yours: Deposit minus Debt" lit={s === 4} washKey={w[2]} note={chip(s >= 4, "-20%")}>
                <Tw value={yours} play={p} /> USDC
              </Tile>
            </Tiles>
          </div>
          <div className={own.column}>
            <div className={own.columnHead}>Deposited alone</div>
            <Tiles n={2}>
              <Tile label="Deposit" lit={s === 5} washKey={w[3]} note={chip(s >= 5, "-1,000.00")}>
                <Tw value={aD} play={p} /> USDC
              </Tile>
              <Tile label="Debt">0.00 alUSD</Tile>
              <Tile label="Yours" lit={s === 6} washKey={w[4]} note={chip(s >= 6, "-10%")}>
                <Tw value={aY} play={p} /> USDC
              </Tile>
            </Tiles>
          </div>
        </div>
      </Frame>
    </Stage>
      {/* Folds away once pressed, so what is under the figure slides up.
          After the stage, not inside it, for the reason given at PegCycle's
          control in moments-i7. */}
      <FoldAway show={!run.at && !m.done}>
        <LessonControl disabled={!m.ready} hint={m.ready || m.done ? null : NOT_READY} onClick={() => run.start()}>
          Apply a 10% loss
        </LessonControl>
      </FoldAway>
    </>
  );
}
LoopLossFigure.moment = "loop-loss";
LoopLossFigure.hint = "Press Apply a 10% loss";
