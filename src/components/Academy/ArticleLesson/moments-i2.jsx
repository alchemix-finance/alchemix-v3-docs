import React, { useEffect, useState } from "react";
import app from "../AppMock/styles.module.css";
import frame from "./styles.module.css";
import css from "./moments-i2.module.css";
import { AppTabs, INFO_TABS, StatScope, VAULT_NAME, useTween } from "../AppMock";
import { AppShot, LessonControl } from "../kit";
import { useMoment } from "./position";
import { FoldAway, Stage } from "./index";
import { NOT_READY } from "./moments";
import { HealthBar, PracticeFrame, SHOW, Tile, Tiles, fmt, trunc, useRunner } from "./moments-i1";

/**
 * The practice figures of intermediate lesson 2 (script I2, "Inside MYT:
 * where your yield and your risk come from"), imported by
 * lessons/intermediate/i2InsideMyt.mdx. Moments, in page order: before-fee,
 * delay, new, price-drop, loss-half, loss-all, allocate, withdraw.
 *
 * Every figure is a what-if on a copy of the vault's strategies, headed
 * "What if": each moment is recorded with the position unchanged, so the
 * practice wallet stays at Deposit 10,000 and Debt 5,000 throughout, as the
 * lesson's first page says. One set of practice strategies serves the whole
 * lesson: A, Conservative, 40% of the vault at 4.50% after the fee; B,
 * Moderate, 40% at 5.50%; C, Moderate, 20% at 5.00%. The vault's APR is
 * 5.00% and MYT's price 1.25 USDC, so the 10,000 deposit is 8,000 MYT.
 */

const FEE = 0.15;
const PRICE = 1.25;
const DEPOSIT = 10_000;
const DEBT = 5_000;
const COLOR = { Conservative: "oklch(0.78 0.15 228)", Moderate: "oklch(0.65 0.1925 283.02)", Moderate2: "oklch(0.55 0.12 300)", Aggressive: "oklch(0.704 0.191 22.216)" };
const STRATS = [
  { key: "A", name: "Strategy A", risk: "Conservative", apr: 4.5, alloc: 40, color: COLOR.Conservative },
  { key: "B", name: "Strategy B", risk: "Moderate", apr: 5.5, alloc: 40, color: COLOR.Moderate },
  { key: "C", name: "Strategy C", risk: "Moderate", apr: 5.0, alloc: 20, color: COLOR.Moderate2 },
];
const VAULT_APR = STRATS.reduce((s, x) => s + (x.apr * x.alloc) / 100, 0);

/** An allocation as the lesson reads it: whole numbers bare (40%), others to one decimal (44.4%). */
const share = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? `${fmt(Math.round(v))}%` : `${trunc(v, 1)}%`);

/* ── The Info tab ────────────────────────────────────────── */

/** The allocation ring, one slice per strategy; `on` keeps one slice bright and fades the rest. */
function Ring({ weights, on = null }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const total = weights.reduce((s, w) => s + Math.max(w, 0), 0) || 1;
  let start = 0;
  return (
    <svg className={app.ring} width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
      {STRATS.map((s, i) => {
        const len = (Math.max(weights[i], 0) / total) * C;
        const el = (
          <circle
            key={s.key}
            cx="48" cy="48" r={R} fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={`${Math.max(len - 2, 0)} ${C}`} strokeDashoffset={-start}
            transform="rotate(-90 48 48)"
            className={on && on !== s.key ? css.sliceFade : css.slice}
          />
        );
        start += len;
        return el;
      })}
    </svg>
  );
}

/**
 * The practice Info tab: the ring and the strategy table. `cols` names the
 * columns ("risk", "apr", "allocation"); `aprs` and `allocs` are the figures
 * on show (tweened by the caller); `marks` puts a chip in a row's Strategy
 * cell; `after` adds a row under the one it names. Pointing at a row lights
 * its slice, as in the app.
 */
function InfoTab({ cols, aprs = STRATS.map((s) => s.apr), allocs = STRATS.map((s) => s.alloc), marks = {}, after = {}, head = null, foot = null, rowLit = [] }) {
  const [hover, setHover] = useState(null);
  return (
    <div className={css.info}>
      <AppTabs tabs={INFO_TABS} live="Info" />
      {head}
      <div className={`${app.infoBody} ${css.infoBody}`}>
        <Ring weights={allocs} on={hover} />
        <div className={app.infoScroll}>
          <table className={app.infoTable}>
            <thead>
              <tr>
                <th>Strategy</th>
                {cols.includes("risk") ? <th>Risk Level</th> : null}
                {cols.includes("apr") ? <th>APR</th> : null}
                {cols.includes("allocation") ? <th>Allocation</th> : null}
              </tr>
            </thead>
            <tbody>
              {STRATS.map((s, i) => (
                <React.Fragment key={s.key}>
                  <tr
                    className={`${css.row} ${hover === s.key || rowLit.includes(s.key) ? css.rowOn : ""}`}
                    onPointerEnter={() => setHover(s.key)}
                    onPointerLeave={() => setHover(null)}
                  >
                    <td>
                      <i style={{ background: s.color }} />
                      {s.name}
                      {marks[s.key] ?? null}
                    </td>
                    {cols.includes("risk") ? <td>{s.risk}</td> : null}
                    {cols.includes("apr") ? <td>{trunc(aprs[i])}%</td> : null}
                    {cols.includes("allocation") ? <td>{share(allocs[i])}</td> : null}
                  </tr>
                  {after[s.key] ? (
                    <tr className={css.afterRow}>
                      <td colSpan={cols.length + 1}>{after[s.key]}</td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {foot}
    </div>
  );
}

/** A small figure chip above a table ("Vault APR 5.00%"). */
function Chip({ label, value, lit = false, extra = null }) {
  return (
    <span className={`${css.chip} ${lit ? css.chipLit : ""}`}>
      <span className={css.chipLabel}>{label}</span>
      <b>{value}</b>
      {extra}
    </span>
  );
}

const FRAME = { heading: "What if", title: VAULT_NAME, sub: "Ethereum", icon: "USDC" };

/* ── Page 1 ──────────────────────────────────────────────── */

/** The vault's holdings, the reference for the pages after it. Nothing to press; a row lights its slice. */
export function VaultHoldingsFigure() {
  return (
    <Stage>
      <PracticeFrame label="the vault's Info tab" {...FRAME}>
        <InfoTab
          cols={["apr", "allocation"]}
          head={
            <div className={css.chips}>
              <Chip label="Vault APR" value={`${trunc(VAULT_APR)}%`} />
              <Chip label="MYT price" value={`${trunc(PRICE)} USDC`} />
            </div>
          }
        />
      </PracticeFrame>
    </Stage>
  );
}

/* ── Page 2: the performance fee ─────────────────────────── */

/**
 * "Press Before fee." The Info tab with a two-way switch over it. Before fee
 * counts each APR up to what the strategies earn before the 15% fee (4.50%
 * to 5.29%, 5.50% to 6.47%, 5.00% to 5.88%) and the vault's to 5.88%, puts a
 * "Performance fee 15%" chip between the switch and the table, lit for 3 s,
 * and shows the year on 10,000 under the table. After fee turns it back.
 */
export function FeeToggleFigure() {
  const m = useMoment("before-fee");
  const [before, setBefore] = useState(false);
  const [flips, setFlips] = useState(0);
  const [chipLit, setChipLit] = useState(false);
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (m.done) setBefore(true);
  }, [m.done]);
  const k = before ? 1 / (1 - FEE) : 1;
  const a0 = useTween(STRATS[0].apr * k, flips, 1500);
  const a1 = useTween(STRATS[1].apr * k, flips, 1500);
  const a2 = useTween(STRATS[2].apr * k, flips, 1500);
  const vault = useTween(VAULT_APR * k, flips, 1500);
  const pick = async (b) => {
    if (b === before) return;
    setBefore(b);
    setFlips((f) => f + 1);
    if (b) {
      setChipLit(true);
      setTimeout(() => {
        if (alive.current) setChipLit(false);
      }, 3000);
    }
    if (b && !m.done) {
      await wait(1600);
      if (alive.current) m.apply({ ...m.position });
    }
  };
  const live = m.ready || m.done;
  return (
    <Stage>
      <PracticeFrame label="the vault's Info tab, with and without the fee" {...FRAME}>
        <div className={css.toggle} role="group" aria-label="APR shown">
          {[false, true].map((b) => (
            <button
              key={String(b)}
              type="button"
              aria-pressed={before === b}
              className={`${css.toggleOption} ${before === b ? css.toggleOn : ""} ${b && !before && live ? css.toggleCall : ""}`}
              disabled={!live}
              onClick={() => pick(b)}
            >
              {b ? "Before fee" : "After fee"}
            </button>
          ))}
        </div>
        <InfoTab
          cols={["apr", "allocation"]}
          aprs={[a0, a1, a2]}
          rowLit={before ? ["A", "B", "C"] : []}
          head={
            <div className={css.chips}>
              <Chip label="Vault APR" value={`${trunc(vault)}%`} lit={before} />
              <Chip label="MYT price" value={`${trunc(PRICE)} USDC`} />
              <span className={`${css.feeChip} ${chipLit ? css.feeChipLit : ""}`} style={before ? undefined : { visibility: "hidden" }} aria-hidden={before ? undefined : true}>
                Performance fee 15%
              </span>
            </div>
          }
          foot={
            <div className={css.yearLine} style={before ? undefined : { visibility: "hidden" }} aria-hidden={before ? undefined : true}>
              On 10,000 USDC for a year: 588 earned · 88 to the protocol · 500 added to your deposit
            </div>
          }
        />
      </PracticeFrame>
    </Stage>
  );
}
FeeToggleFigure.moment = "before-fee";
FeeToggleFigure.hint = "Press Before fee to continue";

/* ── Page 3: Risk Level ──────────────────────────────────── */

const INPUTS = [
  { key: "entry", label: "Entry and exit", options: ["Own contract", "DEX swap"] },
  { key: "pricing", label: "Pricing", options: ["Own accounting", "Market price"] },
  { key: "delay", label: "Withdrawal delay", options: ["Any time", "Can take weeks"] },
  { key: "other", label: "Other factors", options: ["None", "New strategy"] },
];

/** The level the four inputs give: any riskier input is Moderate; a new strategy on top can be raised. */
function levelOf(v) {
  const riskier = v.entry || v.pricing || v.delay;
  if (riskier && v.other) return "split";
  if (riskier || v.other) return "Moderate";
  return "Conservative";
}

/**
 * "Set Withdrawal delay to Can take weeks", then "Now set Other factors to
 * New strategy." A card for a new strategy with its four inputs, every one
 * on its safest option to start, and the Risk Level they give at its top
 * right. Every input can be changed from the start: the text above the card
 * says any one riskier input makes a strategy Moderate, and rows that were
 * switched off with no reason shown read as broken. The
 * moments keep their meaning. `delay` is done when Withdrawal delay is set
 * to Can take weeks, and `new` when Other factors is set to New strategy
 * after that, so a reader who picked New strategy early presses it once more.
 */
export function RiskLevelFigure() {
  const delay = useMoment("delay");
  const other = useMoment("new");
  const [v, setV] = useState({ entry: false, pricing: false, delay: false, other: false });
  const [flash, setFlash] = useState(null);
  const { alive } = useRunner();
  useEffect(() => {
    if (delay.done) setV((x) => ({ ...x, delay: true }));
  }, [delay.done]);
  useEffect(() => {
    if (other.done) setV((x) => ({ ...x, other: true }));
  }, [other.done]);
  const live = delay.ready || delay.done;
  const set = (key, on) => {
    setV((x) => ({ ...x, [key]: on }));
    setFlash(key);
    setTimeout(() => {
      if (alive.current) setFlash((f) => (f === key ? null : f));
    }, 2000);
    if (key === "delay" && on && !delay.done && delay.ready) delay.apply({ ...delay.position });
    if (key === "other" && on && !other.done && other.ready) other.apply({ ...other.position });
  };
  const level = levelOf(v);
  const calling = !delay.done ? "delay" : !other.done ? "other" : null;
  return (
    <Stage>
      <PracticeFrame label="a new strategy's Risk Level" heading="What if">
        <div className={css.riskCard}>
          <div className={css.riskTop}>
            <span className={css.riskName}>A new strategy</span>
            <span key={level} className={`${css.badge} ${css[`badge${level}`] ?? ""}`}>
              {level === "split" ? (
                <>
                  Moderate · can be raised to <b className={css.badgeAggressive}>Aggressive</b>
                </>
              ) : (
                level
              )}
            </span>
          </div>
          {INPUTS.map((row) => (
            <div key={row.key} className={`${css.input} ${flash === row.key ? css.inputLit : ""}`}>
              <span className={css.inputLabel}>{row.label}</span>
              <span className={css.segment} role="group" aria-label={row.label}>
                {row.options.map((opt, i) => {
                  const on = v[row.key] === (i === 1);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={on}
                      disabled={!live}
                      className={`${css.segmentOption} ${on ? css.segmentOn : ""} ${calling === row.key && i === 1 && live ? css.segmentCall : ""}`}
                      onClick={() => set(row.key, i === 1)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </span>
            </div>
          ))}
        </div>
      </PracticeFrame>
    </Stage>
  );
}
RiskLevelFigure.moment = "delay";
RiskLevelFigure.hint = "Set Withdrawal delay to Can take weeks";

/**
 * The live Info tab's allocation, captured 2026-11-07 with no wallet
 * (`pnpm capture:app <dir> vault-info`): the ring and the table with Risk
 * Level, APR and Allocation, without "View all strategies" and the 30-day
 * chart. On a phone, the table alone. The children are the caption.
 */
const INFO_RISK = {
  src: "/img/academy-i2-info-risk.png",
  size: [1952, 432],
  crop: { x: 430 / 1952, y: 150 / 432, w: 1130 / 1952, h: 270 / 432 },
  alt: "The Info tab for Risk-adjusted Mix USDC on Ethereum: Yearn yvUSD, Conservative, 40.72%; SiUSD, Moderate, 40.08%; Fluid Lite, Moderate, 19.19%, each with its APR",
  narrow: {
    crop: { x: 760 / 1952, y: 185 / 432, w: 790 / 1952, h: 220 / 432 },
    alt: "The strategy table on the Info tab: Yearn yvUSD Conservative 40.72%, SiUSD Moderate 40.08%, Fluid Lite Moderate 19.19%",
  },
};

export function RiskInfoShot({ children }) {
  return (
    <Stage>
      <div className={frame.shot}>
        <AppShot shot={INFO_RISK} label={null}>
          {children}
        </AppShot>
      </div>
    </Stage>
  );
}

/**
 * The stage for a figure with a lesson control under it that folds away once
 * used. The figure and the control sit in one block that contains their
 * margins. `FoldAway` measures the foot of its parent when nothing follows
 * it, and in the bare stage the frame's bottom margin collapses through that
 * foot, so the fold stopped 32px short and the rest went in one frame when
 * the control was removed (seen at 1440).
 */
function ControlStage({ children }) {
  return (
    <Stage>
      <div className={css.withControl}>{children}</div>
    </Stage>
  );
}

/* ── Page 4: how a strategy is priced ────────────────────── */

/**
 * One side of the price figure: the strategy list, MYT's price, and the
 * position. Each strategy's bar and the figure beside it are its Allocation,
 * the share of the vault's deposits in it, which the price dip does not
 * change: B's bar used to shorten while its label still read 40%.
 * What the dip does to B is a chip on its row.
 */
function PricedSide({ label, marketPriced, phase, play, wash }) {
  const dropped = phase >= 1;
  const price = marketPriced && phase >= 3 ? 1.15 : PRICE;
  const deposit = marketPriced && phase >= 4 ? 9_200 : DEPOSIT;
  const ltv = DEBT / deposit;
  const shownPrice = useTween(price, play, 1500);
  return (
    <div className={css.side}>
      <div className={css.sideLabel}>{label}</div>
      <div className={css.strats}>
        {STRATS.map((s) => (
          <div key={s.key} className={css.strat}>
            <span className={css.stratName}>
              <i style={{ background: s.color }} />
              {s.name}
            </span>
            <span className={css.stratBar}>
              <i style={{ width: `${s.alloc * 2}%`, background: s.color }} />
            </span>
            <span className={css.stratShare}>{s.alloc}%</span>
            {s.key === "B" ? (
              <span className={css.stratNotes}>
                <span className={`${app.delta} ${app.bad}`} style={dropped ? undefined : { visibility: "hidden" }}>
                  Market price -20%
                </span>
                {marketPriced ? (
                  <span className={`${app.delta} ${app.bad}`} style={phase >= 2 ? undefined : { visibility: "hidden" }}>
                    Value -20%
                  </span>
                ) : (
                  <span className={css.backing} style={phase >= 2 ? undefined : { visibility: "hidden" }}>
                    Backing unchanged
                  </span>
                )}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className={css.chips}>
        <Chip
          label="MYT price"
          value={trunc(shownPrice, 4)}
          lit={marketPriced && phase === 3}
          extra={<span className={`${app.delta} ${app.bad}`} style={price < PRICE ? undefined : { visibility: "hidden" }}>-8%</span>}
        />
      </div>
      <Tiles per={3}>
        <Tile k="deposit" label="Deposit" value={deposit} show={SHOW.usdc} play={play} lit={marketPriced && phase >= 4} wash={wash} icon={null} />
        <Tile k="debt" label="Debt" value={DEBT} show={SHOW.al} play={play} lit={marketPriced && phase === 4} wash={wash} icon={null} />
        <Tile k="ltv" label="LTV" value={ltv * 100} show={SHOW.ltv} play={play} lit={marketPriced && phase >= 5} wash={wash} icon={null} />
      </Tiles>
      <HealthBar ltv={ltv} play={play} legend={false} />
    </div>
  );
}

/**
 * "Press Drop B's market price 20%." The vault twice: B priced from its own
 * accounting on the left, at market on the right. B's row gets the red
 * chip on both; then, 1 s apart, the left notes "Backing unchanged" while
 * the right notes "Value -20%", MYT's price counts from 1.2500 to 1.1500,
 * Deposit to 9,200 and LTV to 54.34%. Debt stays 5,000 on both.
 */
export function PriceSourceFigure() {
  const m = useMoment("price-drop");
  const [phase, setPhase] = useState(0);
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (m.done) setPhase(9);
  }, [m.done]);
  const run = async () => {
    for (let p = 1; p <= 5; p++) {
      setPhase(p);
      await wait(p === 1 ? 1000 : 1000);
      if (!alive.current) return;
    }
    await wait(600);
    if (!alive.current) return;
    setPhase(9);
    m.apply({ ...m.position });
  };
  return (
    <ControlStage>
      <PracticeFrame label="the vault priced two ways" {...FRAME}>
        <div className={css.sides}>
          <StatScope name="accounting">
            <PricedSide label="B priced from its own accounting" marketPriced={false} phase={phase} play={phase} wash={false} />
          </StatScope>
          <StatScope name="market">
            <PricedSide label="B priced at market" marketPriced phase={phase} play={phase} wash />
          </StatScope>
        </div>
      </PracticeFrame>
      <FoldAway show={phase === 0}>
        <LessonControl disabled={!m.ready || phase !== 0} hint={NOT_READY} onClick={run}>
          Drop B&apos;s market price 20%
        </LessonControl>
      </FoldAway>
    </ControlStage>
  );
}
PriceSourceFigure.moment = "price-drop";
PriceSourceFigure.hint = "Press Drop B's market price 20% to continue";

/* ── Page 5: what a loss takes ───────────────────────────── */

/** The vault after C loses `L` percent of its funds. */
function afterLoss(L) {
  const lost = (20 * L) / 100;
  const left = 100 - lost;
  const price = PRICE * (left / 100);
  const deposit = DEPOSIT * (left / 100);
  return { allocs: [(40 / left) * 100, (40 / left) * 100, ((20 - lost) / left) * 100], price, deposit, ltv: DEBT / deposit };
}

/**
 * "Press C loses half its funds", then "Drag C's loss to 100%." The Info tab
 * beside the position. The press runs 1 s apart: C's row gets "-50%", the
 * allocations re-weight (A 44.4%, B 44.4%, C 11.1%), MYT's price counts to
 * 1.1250, Deposit to 9,000 and LTV to 55.55%; then a slider for C's loss
 * appears under C's row at 50%, and the figures follow it live.
 */
export function LossShareFigure() {
  const half = useMoment("loss-half");
  const all = useMoment("loss-all");
  const [phase, setPhase] = useState(0);
  const [loss, setLoss] = useState(0);
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (half.done) {
      setPhase(9);
      setLoss((l) => (l === 0 ? 50 : l));
    }
  }, [half.done]);
  useEffect(() => {
    if (all.done) setLoss(100);
  }, [all.done]);
  const run = async () => {
    setPhase(1);
    await wait(1000);
    for (let p = 2; p <= 5; p++) {
      if (!alive.current) return;
      setPhase(p);
      await wait(1000);
    }
    await wait(700);
    if (!alive.current) return;
    setLoss(50);
    setPhase(9);
    half.apply({ ...half.position });
  };
  // Each part of the press changes one figure: the allocations at 2, the price at 3, Deposit at 4, LTV at 5.
  const L = phase >= 9 ? loss : 50;
  const at = (p) => (phase >= p ? afterLoss(L) : afterLoss(0));
  const play = phase;
  const a = at(2).allocs;
  const a0 = useTween(a[0], play, 1200);
  const a1 = useTween(a[1], play, 1200);
  const a2 = useTween(a[2], play, 1200);
  const price = at(3).price;
  const shownPrice = useTween(price, play, 1500);
  const deposit = at(4).deposit;
  const ltv = DEBT / at(5).deposit;
  const pct = Math.round((1 - price / PRICE) * 100);
  const slider = phase >= 9;
  const sliding = all.ready || all.done;
  return (
    <ControlStage>
      <PracticeFrame label="a loss in one strategy" {...FRAME}>
        <div className={css.lossPair}>
          <InfoTab
            cols={["allocation"]}
            allocs={[a0, a1, a2]}
            rowLit={phase >= 1 && phase < 9 ? ["C"] : []}
            marks={{
              C: (
                <span className={`${app.delta} ${app.bad} ${css.rowChip}`} style={phase >= 1 ? undefined : { visibility: "hidden" }}>
                  -{phase >= 9 ? loss : 50}%
                </span>
              ),
            }}
            after={{
              C: (
                <label className={css.slider} style={slider ? undefined : { visibility: "hidden" }} aria-hidden={slider ? undefined : true}>
                  <span>C&apos;s loss</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={loss}
                    disabled={!slider || !sliding}
                    aria-label="C's loss"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLoss(v);
                      if (v >= 100 && all.ready && !all.done) all.apply({ ...all.position });
                    }}
                  />
                  <b>{loss}%</b>
                </label>
              ),
            }}
          />
          <div className={css.lossStats}>
            <div className={css.chips}>
              <Chip
                label="MYT price"
                value={trunc(shownPrice, 4)}
                lit={phase === 3}
                extra={<span className={`${app.delta} ${app.bad}`} style={price < PRICE ? undefined : { visibility: "hidden" }}>-{pct}%</span>}
              />
            </div>
            <Tiles per={3}>
              <Tile k="deposit" label="Deposit" value={deposit} show={SHOW.usdc} play={play} lit={phase >= 4} icon={null} />
              <Tile k="debt" label="Debt" value={DEBT} show={SHOW.al} play={play} icon={null} />
              <Tile k="ltv" label="LTV" value={ltv * 100} show={SHOW.ltv} play={play} lit={phase >= 5} icon={null} />
            </Tiles>
            <HealthBar ltv={ltv} play={play} legend={false} />
          </div>
        </div>
      </PracticeFrame>
      <FoldAway show={phase === 0}>
        <LessonControl disabled={!half.ready || phase !== 0} hint={NOT_READY} onClick={run}>
          C loses half its funds
        </LessonControl>
      </FoldAway>
    </ControlStage>
  );
}
LossShareFigure.moment = "loss-half";
LossShareFigure.hint = "Press C loses half its funds to continue";

/* ── Page 6: the risk caps ───────────────────────────────── */

/** One cap meter: the share of the vault in that class against its cap line. */
function Meter({ label, value, cap, tone = null, note = null, hold = false }) {
  return (
    <div className={css.meter}>
      <div className={css.meterHead}>
        <span>{label}</span>
        <b>
          {fmt(value)}% of {fmt(cap)}% cap
        </b>
      </div>
      <div className={css.meterTrack}>
        <i className={tone ? css[`meter${tone}`] : ""} style={{ width: `${value}%` }} />
        <span className={css.capLine} style={{ left: `${cap}%` }} />
      </div>
      <div className={`${css.meterNote} ${hold ? css.meterNoteHold : ""} ${tone ? css[`note${tone}`] : ""}`}>{note ?? " "}</div>
    </div>
  );
}

/**
 * "Press Move 5% into C", then "Press Depositors withdraw 20% of the
 * vault." The vault as one bar colored by Risk Level, and the Moderate and
 * Aggressive meters against their Ethereum caps. The move flashes the
 * Moderate meter red at 65% and is refused. The withdrawal, all out of A,
 * shrinks the vault to 80%, re-labels the shares (A 25%, B 50%, C 25%) and
 * leaves the Moderate meter at 75%, past its cap, in amber.
 */
export function CapsFigure() {
  const alloc = useMoment("allocate");
  const out = useMoment("withdraw");
  const [mod, setMod] = useState(60);
  const [bad, setBad] = useState(false);
  const [refused, setRefused] = useState(false);
  const [wp, setWp] = useState(0);
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (alloc.done) setRefused(true);
  }, [alloc.done]);
  useEffect(() => {
    if (out.done) {
      setWp(9);
      setMod(75);
    }
  }, [out.done]);
  const move = async () => {
    setMod(65);
    setBad(true);
    await wait(1400);
    if (!alive.current) return;
    setMod(60);
    setBad(false);
    setRefused(true);
    await wait(700);
    if (alive.current) alloc.apply({ ...alloc.position });
  };
  const withdraw = async () => {
    setRefused(false);
    setWp(1);
    await wait(1000);
    if (!alive.current) return;
    setWp(2);
    await wait(1000);
    if (!alive.current) return;
    setWp(3);
    setMod(75);
    await wait(1400);
    if (!alive.current) return;
    setWp(9);
    out.apply({ ...out.position });
  };
  const shrunk = wp >= 1;
  const relabel = wp >= 2;
  const over = wp >= 3;
  const segs = [
    { key: "A", w: shrunk ? 20 : 40, label: relabel ? "25%" : "40%", color: COLOR.Conservative },
    { key: "B", w: 40, label: relabel ? "50%" : "40%", color: COLOR.Moderate },
    { key: "C", w: 20, label: relabel ? "25%" : "20%", color: COLOR.Moderate },
  ];
  return (
    <ControlStage>
      <PracticeFrame label="the vault's risk caps" {...FRAME}>
        <div className={css.caps}>
          <div className={css.vaultBar} aria-label={`The vault: A ${segs[0].label}, B ${segs[1].label}, C ${segs[2].label}`} role="img">
            <span className={css.vaultGhost} style={shrunk ? undefined : { visibility: "hidden" }} />
            <span className={css.vaultFill} style={{ width: shrunk ? "80%" : "100%" }}>
              {segs.map((s) => (
                <span key={s.key} className={css.seg} style={{ flexGrow: s.w, background: s.color }}>
                  {s.key} {s.label}
                </span>
              ))}
            </span>
          </div>
          <div className={css.capsLegend}>
            <span><i style={{ background: COLOR.Conservative }} />Conservative</span>
            <span><i style={{ background: COLOR.Moderate }} />Moderate</span>
            <span><i style={{ background: COLOR.Aggressive }} />Aggressive</span>
          </div>
          <Meter
            label="Moderate"
            value={mod}
            cap={60}
            tone={bad ? "Bad" : over ? "Over" : null}
            hold
            note={over ? "Above the cap until the DAO rebalances" : refused ? "Blocked: Moderate strategies would hold 65%, over the 60% cap" : null}
          />
          <Meter label="Aggressive" value={0} cap={10} />
        </div>
      </PracticeFrame>
      {/* Both controls share one place, so the second takes over from the
          first with a cross-fade and the row keeps its height. The one whose
          turn it is not is switched off and hidden. */}
      <FoldAway show={wp === 0}>
        <div className={css.controlSwap}>
          <div className={`${css.swapItem} ${alloc.done ? css.swapOff : ""}`} aria-hidden={alloc.done ? true : undefined}>
            <LessonControl disabled={!alloc.ready || bad} hint={alloc.ready ? null : NOT_READY} onClick={move}>
              Move 5% into C
            </LessonControl>
          </div>
          <div className={`${css.swapItem} ${alloc.done ? "" : css.swapOff}`} aria-hidden={alloc.done ? undefined : true}>
            <LessonControl disabled={!out.ready || wp !== 0} hint={NOT_READY} onClick={withdraw}>
              Depositors withdraw 20% of the vault
            </LessonControl>
          </div>
        </div>
      </FoldAway>
    </ControlStage>
  );
}
CapsFigure.moment = "allocate";
CapsFigure.hint = "Press Move 5% into C to continue";
