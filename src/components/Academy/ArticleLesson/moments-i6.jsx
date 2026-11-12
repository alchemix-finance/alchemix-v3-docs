import React, { useEffect, useRef, useState } from "react";
import app from "../AppMock/styles.module.css";
import { AppButton, AppDelta, AppFrame, AppInput, AppPanel, AppTabs, Grow, VAULT_TABS, useAppContext } from "../AppMock";
import { useMoment, useMomentNote } from "./position";
import { Stage } from "./index";
import { NOT_READY } from "./moments";
import { Fig, Num, Tile, Tiles, TimeSlider, cut, fmt, useSteps } from "./moments-i4";
import base from "./moments-i4.module.css";
import css from "./moments-i6.module.css";

/**
 * The practice moments and figures of intermediate lesson 6 (script I6,
 * "What a loan costs, and how to win the discount back"), imported by
 * lessons/intermediate/i6LoanCost.mdx.
 *
 * alUSD sells at 0.98 throughout. Enso's 0.05% swap fee is folded into the
 * quoted rate, 0.98 x 0.9995 = 0.97951, so 5,000 of debt brings 4,897.55.
 * Printed figures follow the app's formatNumber, which cuts to two decimals.
 */

const PRICE = 0.98;
const RATE = PRICE * (1 - 0.0005);
const BORROW = 5_000;
const CASH = 4_897.55;
const CAP = 0.9;
/**
 * The vault's stat tiles print as the app's do, and as the tiles of
 * "Getting money back" (moments-i3) do: amounts cut to two decimals
 * ("5,000.00 alUSD") and LTV over MAX LTV ("50.00/90.00%").
 */
const tileAmount = (v) => cut(v, 2);
const ltvShort = (v) => `${cut(v, 2)}%`;
const ltvTile = (v) => (
  <>
    {cut(v, 2)}
    <span className={app.ltvCap}>/{cut(CAP * 100, 2)}%</span>
  </>
);

/** A what-if frame: the app's ground, "What if" where the vault's name sits, and the Practice tag. */
function WhatIf({ aria, children }) {
  return (
    <section className={app.frame} aria-label={`Practice what-if: ${aria}`}>
      <div className={base.head}>
        <div className={base.whatIf}>What if</div>
        <div className={base.headRight}>
          <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
        </div>
      </div>
      {children}
    </section>
  );
}

/* ── Page 1: Borrow & Swap ───────────────────────────────── */

/**
 * "Pick USDC in the token picker on the Borrow tab." The tab turns into
 * Borrow & Swap one change at a time, half a second apart: the token, the
 * Available line in USDC, the Rate, Swap fee and Will mint rows with the
 * slippage setting under them (the rows lit in turn), and the button's
 * label. The whole run takes 2.7 s. It took 7.5 s at first, and the footer
 * went on asking for USDC, with the next instruction held back, long after
 * the reader had picked it. "Type 4,897.55 and press Borrow &
 * Swap": Will mint fills as the amount is typed and the stats preview the
 * debt; the press moves Debt, LTV and Borrowable, then the practice wallet.
 */
export function BorrowSwapMoment() {
  const pick = useMoment("pick-usdc");
  const m = useMoment("borrow-swap");
  const [token, setToken] = useState("alUSD");
  const [typed, setTyped] = useState("");
  const [pstep, pstart] = useSteps(5, 500, pick.done, () => {
    if (!pick.done) pick.apply({ ...pick.position });
  }, 700);
  const [bstep, bstart, bplaying] = useSteps(4, 1500, m.done, () => {
    if (!m.done) {
      m.apply({ ...m.position, debt: m.position.debt + BORROW, wallet: (m.position.wallet ?? 0) + CASH });
      setTyped("");
    }
  }, 300);
  useEffect(() => {
    if (pick.done) setToken("USDC");
  }, [pick.done]);
  const p = m.position;
  const deposit = p.deposit;
  const debt = bstep >= 1 ? p.debt + BORROW : p.debt;
  const ltv = bstep >= 2 ? ((p.debt + BORROW) / deposit) * 100 : (p.debt / deposit) * 100;
  const borrowable = bstep >= 3 ? deposit * CAP - p.debt - BORROW : deposit * CAP - p.debt;
  const room = Math.max(deposit * CAP - debt, 0);
  const usdc = token === "USDC";
  const available = usdc && pstep >= 2 ? room * RATE : room;
  const n = Number(typed) || 0;
  const mint = n / RATE;
  const typing = m.ready && usdc && n > 0 && bstep === 0;
  const near = Math.abs(n - CASH) < 0.005;
  const hint = m.done ? null : !m.ready ? (pick.done ? NOT_READY : "Pick USDC first") : n > available + 0.005 ? "That is more than the vault allows" : !near ? "Type 4,897.55" : null;
  useMomentNote("borrow-swap", m.ready && n > available + 0.005 ? "That is more than the vault allows" : null);
  const litRow = pstep >= 3 && !pick.done ? pstep - 3 : typing ? 2 : -1;
  const play = pstep * 10 + bstep;
  return (
    <Stage>
      <AppFrame title="Risk-adjusted Mix USDC" tag="Practice" strong>
        <Tiles per={4}>
          <Tile k="deposit" label="Deposit" unit="USDC" value={deposit} play={play} format={tileAmount} />
          <Tile k="debt" label="Debt" unit="alUSD" value={debt} play={play} on={bstep === 1 || typing} ahead={typing ? `${tileAmount(p.debt + mint)} alUSD` : null} format={tileAmount} />
          <Tile k="ltv" label="LTV" value={ltv} play={play} on={bstep === 2 || typing} ahead={typing ? ltvShort(((p.debt + mint) / deposit) * 100) : null} format={ltvTile} icon={false} />
          <Tile k="borrowable" label="Borrowable" unit="alUSD" value={borrowable} play={play} on={bstep === 3} format={tileAmount} icon={false} />
        </Tiles>
        <Grow>
          <AppTabs tabs={VAULT_TABS} live="Borrow" lit />
          <AppPanel>
            <AppInput
              token={token}
              tokens={["alUSD", "USDC"]}
              onToken={
                pick.ready && pstep === 0
                  ? (t) => {
                      setToken(t);
                      if (t === "USDC") pstart();
                    }
                  : undefined
              }
              type="Available"
              amount={m.done ? "" : typed}
              onChange={m.ready && usdc && bstep === 0 ? setTyped : undefined}
              balance={m.done ? Math.max(deposit * CAP - (p.debt + BORROW), 0) * RATE : available}
              max={available}
              digits={0}
            />
            {usdc && pstep >= 3 ? (
              <>
                <dl className={css.swapRows}>
                  <div className={`${css.swapRow} ${litRow === 0 ? css.rowLit : ""} ${base.appear}`}>
                    {/* The app names the swap's route here ("Rate (via ...)") when Enso returns one, and reads plain "Rate" when it does not (SwapInfo.tsx). */}
                    <dt>Rate</dt>
                    <dd>1 alUSD ≈ 0.9795 USDC</dd>
                  </div>
                  <div className={`${css.swapRow} ${litRow === 1 ? css.rowLit : ""} ${base.appear}`}>
                    <dt>Swap fee</dt>
                    <dd>0.05%</dd>
                  </div>
                  <div className={`${css.swapRow} ${litRow === 2 ? css.rowLit : ""} ${base.appear}`}>
                    <dt>Will mint</dt>
                    <dd>{n > 0 && !m.done ? `${cut(mint, 2)} alUSD` : "-- alUSD"}</dd>
                  </div>
                </dl>
                {/* With the rows, so the panel grows once. */}
                <div className={`${css.slippage} ${base.appear}`} aria-label="Slippage 1%">
                  <span>Slippage</span>
                  {["0.5%", "1%", "3%", "5%"].map((v) => (
                    <span key={v} className={`${css.slipPill} ${v === "1%" ? css.slipOn : ""}`}>
                      {v}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
            <AppButton disabled={!m.ready || !usdc || !near || bplaying || bstep > 0} hint={hint} lit={m.ready && near && bstep === 0} onClick={bstart}>
              {usdc && pstep >= 5 ? "Borrow & Swap" : "Borrow"}
            </AppButton>
          </AppPanel>
        </Grow>
      </AppFrame>
    </Stage>
  );
}
BorrowSwapMoment.moment = "pick-usdc";
BorrowSwapMoment.hint = "Pick USDC in the token picker";

/* ── Page 2: what the redemption fee is charged on ───────── */

const EARMARKED = 208;
const FEE = 0.0025;
/** The fee figure's numbers land within a step (0.8 s), so a reader never reads a value between two. */
const FEE_TWEEN = 700;
const WAYS = [
  { id: "redeem", label: "A redemption settles the 208", steps: 4 },
  { id: "usdc", label: "You repay 1,000 in USDC", steps: 5 },
  { id: "alusd", label: "You repay 1,000 in alUSD", steps: 4 },
];

/** What each way shows at each of its steps. */
function wayState(id, s) {
  const st = { earm: EARMARKED, plain: BORROW - EARMARKED, debt: BORROW, deposit: 10_000, settled: null, fee: null, lit: null, chips: [], depChip: null, outline: false };
  if (id === "redeem") {
    if (s >= 1) Object.assign(st, { earm: 0, lit: "bar" });
    if (s >= 2) Object.assign(st, { debt: BORROW - EARMARKED, lit: "debt" });
    if (s >= 3) Object.assign(st, { deposit: 10_000 - EARMARKED * (1 + FEE), depChip: "208 to the Transmuter", lit: "deposit" });
    if (s >= 4) Object.assign(st, { settled: EARMARKED, fee: EARMARKED * FEE, lit: "readouts" });
  } else if (id === "usdc") {
    if (s >= 1) Object.assign(st, { earm: 0, chips: ["first 208: earmarked"], lit: "bar" });
    if (s >= 2) Object.assign(st, { plain: BORROW - 1_000, chips: ["first 208: earmarked", "next 792: not earmarked"] });
    if (s >= 3) Object.assign(st, { debt: BORROW - 1_000, lit: "debt" });
    if (s >= 4) Object.assign(st, { deposit: 10_000 - EARMARKED * FEE, lit: "deposit" });
    if (s >= 5) Object.assign(st, { settled: EARMARKED, fee: EARMARKED * FEE, lit: "readouts" });
  } else if (id === "alusd") {
    if (s >= 1) Object.assign(st, { plain: BORROW - EARMARKED - 1_000, chips: ["alUSD cannot clear earmarked debt"], outline: true, lit: "bar" });
    if (s >= 2) Object.assign(st, { debt: BORROW - 1_000, lit: "debt" });
    if (s >= 3) Object.assign(st, { depChip: "unchanged", lit: "deposit" });
    if (s >= 4) Object.assign(st, { settled: 0, fee: 0, lit: "readouts" });
  }
  return st;
}

/**
 * "Press each way of settling debt." A what-if beside the strip: Debt with
 * its earmarked 208 drawn as a darker part of the bar, and Deposit. Each
 * press starts the figure again and plays, 0.8 s apart, what that way
 * settles, then its two results under its own button: the earmarked debt it
 * settled and the fee it paid. A way's results stay once it has played, so
 * all three can be read side by side when the text compares them (the
 * figure used to show only the last one pressed). Their room is there from
 * the start, reading "--". The moment is done once all three have played;
 * the practice wallet does not change.
 */
export function FeeWaysFigure() {
  const m = useMoment("fee-ways");
  const [active, setActive] = useState(null);
  const [step, setStep] = useState(0);
  const [pressed, setPressed] = useState([]);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  // A page loaded with the moment done shows all three results, as the text under it recaps them.
  useEffect(() => {
    if (m.done) setPressed(WAYS.map((w) => w.id));
  }, [m.done]);
  const left = WAYS.filter((w) => !pressed.includes(w.id));
  useMomentNote(
    "fee-ways",
    m.ready && pressed.length > 0 && left.length ? (left.length === 1 ? `Now press ${left[0].label}` : "Press the other two") : null,
  );
  const run = (w) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setActive(w.id);
    setStep(0);
    for (let i = 1; i <= w.steps; i++) timers.current.push(window.setTimeout(() => setStep(i), 300 + 800 * (i - 1)));
    timers.current.push(
      window.setTimeout(() => {
        setPressed((cur) => {
          const next = cur.includes(w.id) ? cur : [...cur, w.id];
          if (next.length === WAYS.length && m.ready) m.apply({ ...m.position });
          return next;
        });
      }, 300 + 800 * (w.steps - 1) + 600),
    );
  };
  const st = active ? wayState(active, step) : wayState(null, 0);
  const play = `${active}:${step}`;
  const busy = active != null && step < (WAYS.find((w) => w.id === active)?.steps ?? 0);
  return (
    <Stage>
      <WhatIf aria="three ways of settling debt and the fee each pays">
        <div className={css.feeStats}>
          <div className={`${css.debtBox} ${st.lit === "bar" || st.lit === "debt" ? base.on : ""}`} data-fig="feeDebt">
            <div className={base.panelHead}>
              <span className={base.figLabel} style={{ opacity: 0.6 }}>Debt</span>
              <span className={base.figValue}>
                <Num value={st.debt} play={play} ms={FEE_TWEEN} /> alUSD
              </span>
            </div>
            <div className={css.debtBar} role="img" aria-label={`Debt ${fmt(st.debt)}, of it ${fmt(st.earm)} earmarked`}>
              <span className={css.plain} style={{ width: `${(st.plain / BORROW) * 100}%` }} />
              <span className={`${css.earmark} ${st.outline ? css.earmarkOutlined : ""}`} style={{ width: `${(st.earm / BORROW) * 100}%` }} />
            </div>
            <div className={css.barKey}>
              <span>
                <i style={{ background: "var(--app-debt)" }} />
                Not earmarked
              </span>
              <span>
                <i className={css.earmarkKey} />
                Earmarked {fmt(st.earm)}
              </span>
            </div>
            <div className={css.chipLine}>
              {/* The longest pair of chips, unseen, so the line has their room
                  from the start: on a phone they take two lines. */}
              <span className={css.chipSizer} aria-hidden="true">
                <span>
                  <AppDelta>first 208: earmarked</AppDelta>
                </span>
                <span>
                  <AppDelta>next 792: not earmarked</AppDelta>
                </span>
              </span>
              <span className={css.chipLive}>
                {st.chips.map((c) => (
                  <span key={c} className={base.appear}>
                    <AppDelta>{c}</AppDelta>
                  </span>
                ))}
              </span>
            </div>
          </div>
          <Fig
            id="feeDeposit"
            label="Deposit"
            value={st.deposit}
            unit="USDC"
            play={play}
            ms={FEE_TWEEN}
            on={st.lit === "deposit"}
            note={st.depChip ? <AppDelta>{st.depChip}</AppDelta> : null}
          />
        </div>
        <div className={css.ways}>
          {WAYS.map((w) => {
            const end = wayState(w.id, w.steps);
            const mine = active === w.id;
            // Shown from this way's last step, and kept while the others play.
            const shown = pressed.includes(w.id) || (mine && step >= w.steps);
            return (
              <div key={w.id} className={css.wayCol}>
                <button
                  type="button"
                  className={`${css.way} ${mine ? css.wayOn : pressed.includes(w.id) ? css.wayDone : ""}`}
                  disabled={(!m.ready && !m.done) || busy}
                  onClick={() => run(w)}
                >
                  {w.label}
                </button>
                <dl className={`${css.wayResult} ${mine && st.lit === "readouts" ? css.wayResultOn : ""}`} data-fig={`fee-${w.id}`}>
                  <div>
                    <dt>Earmarked debt settled</dt>
                    <dd>{shown ? fmt(end.settled) : "--"}</dd>
                  </div>
                  <div>
                    <dt>Redemption fee</dt>
                    <dd>{shown ? fmt(end.fee, 2) : "--"}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </WhatIf>
    </Stage>
  );
}

/* ── Page 3: buying the discount back ────────────────────── */

/**
 * "Move the alUSD price between 0.96 and 1.00." What 5,000 alUSD costs at
 * that price, the 5,000 of debt it clears, and what that recovers against
 * the 100 discount paid at 0.98, drawn as two bars on one scale. Done once
 * the slider has moved; the practice wallet does not change.
 */
export function BuybackFigure() {
  const m = useMoment("buyback");
  const [price, setPrice] = useState(0.98);
  const [play, setPlay] = useState(0);
  const cost = BORROW * price;
  const recovered = BORROW - cost;
  const discount = BORROW * (1 - PRICE);
  const diff = Math.round(recovered - discount);
  const verdict = diff === 0 ? "Discount fully recovered" : diff > 0 ? `The loan paid you: +${fmt(diff)}` : `Still a cost: ${fmt(-diff)}`;
  const move = (v) => {
    const p = Math.round(v * 100) / 100;
    setPrice(p);
    setPlay((n) => n + 1);
    if (m.ready) m.apply({ ...m.position });
  };
  const scale = 200;
  return (
    <Stage>
      <WhatIf aria="buying alUSD back below a dollar">
        <TimeSlider
          label="alUSD price"
          head={`${price.toFixed(2)} USDC`}
          value={price}
          min={0.96}
          max={1}
          step={0.01}
          onChange={move}
          disabled={!m.ready && !m.done}
          lit={!m.done}
          ticks={[0.96, 0.97, 0.98, 0.99, 1].map((v) => ({ at: v, label: v.toFixed(2) }))}
          aria="alUSD price"
        />
        <div className={css.buyReadouts}>
          <Fig id="buyCost" label="Buying 5,000 alUSD costs" value={cost} unit="USDC" play={play} on keepNote={false} ms={400} format={(v) => fmt(Math.round(v))} />
          <Fig id="buyClears" label="Debt it clears" value={BORROW} unit="alUSD" play={0} keepNote={false} />
          <Fig id="buyRecovered" label="Recovered" value={recovered} unit="USDC" play={play} on keepNote={false} ms={400} format={(v) => fmt(Math.max(0, Math.round(v)))} />
        </div>
        <div className={css.bars}>
          <div className={css.barRow}>
            <span className={css.barLabel}>Discount you paid: 100</span>
            <span className={css.barTrack}>
              <span className={`${css.barFill} ${css.barNeutral}`} style={{ width: `${(discount / scale) * 100}%`, display: "block" }} />
            </span>
          </div>
          <div className={css.barRow}>
            <span className={css.barLabel}>Recovered: {fmt(Math.max(0, Math.round(recovered)))}</span>
            <span className={css.barTrack}>
              <span
                className={`${css.barFill} ${diff > 0 ? css.barGood : css.barRecovered}`}
                style={{ width: `${(Math.max(0, recovered) / scale) * 100}%`, display: "block" }}
              />
            </span>
          </div>
        </div>
        <div className={css.verdict}>
          <AppDelta tone={diff > 0 ? "good" : undefined}>{verdict}</AppDelta>
        </div>
        <div className={css.foot}>Before swap fees</div>
      </WhatIf>
    </Stage>
  );
}

/* ── Page 4: Flash Repay ─────────────────────────────────── */

const FLASH_TARGET = 4_792;
const ROWS = [
  { id: "flashCurrent", label: "Current Loan Cost", value: "(2.0000%) 100.00 USDC", draw: "Nov 7, 2026 · 5,000.00 alUSD@0.98 · 100.00 USDC" },
  { id: "flashPrice", label: "Flash Repay alUSD Price", value: "0.98 USDC" },
  { id: "flashTarget", label: "Flash Repay alUSD Target", value: "4,792.00 alUSD" },
  { id: "flashRecovered", label: "Recovered Loan Cost", value: "(1.8698%) 93.4907 USDC", info: "Includes a swap fee of 0.05%." },
  { id: "flashAfter", label: "Loan Cost After Repay", value: "(0.1301%) 6.5092 USDC" },
  { id: "flashReturned", label: "Returned to Wallet", value: "~93.4907 USDC" },
];
const STEPS = [
  "Flashloan 4,698.50 USDC from Morpho",
  "Swap USDC to alUSD at 0.98 USDC market rate",
  "Burn alUSD to settle debt at a discount",
  "Withdraw the freed collateral as MixUSDC",
  "Withdraw USDC from MixUSDC",
  "Repay the flashloan",
  "Return ~93.49 USDC to your wallet",
];
const FLASH_LOAN = 4_698.5;
const RETURNED = 93.49;

/**
 * "On the Repay tab, press MAX in the Flash Repay field below the main
 * field, then press Flash Repay." The confirmation window opens over the
 * vault and its rows arrive one at a time, 1.5 s apart, each lit as it
 * arrives; a row named in the text lights when the reader points at it.
 * "Press View transaction details to read the seven steps, then press
 * Confirm Flash Repay." The window closes and the seven steps play on a line
 * above the stats, 1.2 s each, each lighting what it moves; the last one
 * brings the 93.49 to the practice wallet.
 */
export function FlashRepayMoment() {
  const open = useMoment("flash-open");
  const go = useMoment("flash-confirm");
  const { stat } = useAppContext();
  const [amount, setAmount] = useState("");
  const [shown, setShown] = useState(false);
  const [details, setDetails] = useState(false);
  const [seen, setSeen] = useState(false);
  const [ostep, ostart, oplaying] = useSteps(ROWS.length, 1500, open.done, () => {
    if (!open.done) open.apply({ ...open.position });
  }, 900);
  const [cstep, cstart, cplaying] = useSteps(STEPS.length, 1200, go.done, () => {
    if (!go.done) go.apply({ ...go.position, deposit: go.position.deposit - FLASH_TARGET, debt: go.position.debt - FLASH_TARGET, wallet: (go.position.wallet ?? 0) + RETURNED });
  }, 200);
  useEffect(() => {
    if (open.done && !go.done) setShown(true);
  }, [open.done, go.done]);
  const p = open.position;
  const n = Number(amount) || 0;
  const avail = Math.max(Math.min(p.debt - (p.earmarked ?? 0), 2_457_651), 0);
  const ready = open.ready && Math.abs(n - FLASH_TARGET) < 0.005 && ostep === 0;
  useMomentNote("flash-open", open.ready && n > avail + 0.005 ? "That is more than you can Flash Repay" : null);
  const windowOpen = shown && cstep === 0 && !go.done;
  const deposit = cstep >= 4 || go.done ? p.deposit - FLASH_TARGET : p.deposit;
  const debt = cstep >= 3 || go.done ? p.debt - FLASH_TARGET : p.debt;
  const earmarked = p.earmarked ?? 0;
  const ltv = deposit > 0 ? (debt / deposit) * 100 : 0;
  const play = cstep;
  const confirm = () => {
    setShown(false);
    cstart();
  };
  // The line above the stats: which step is playing, and what is held in the transaction.
  const s = go.done ? STEPS.length : cstep;
  const loanChip = s >= 1 && s <= 5 ? `Flash loan ${cut(FLASH_LOAN, 2)} USDC` : null;
  const holding = s === 2 ? "4,792 alUSD" : s === 3 ? "4,792 alUSD burned" : s === 4 ? "mixUSDC worth 4,792" : s === 5 ? "4,792 USDC" : s >= 6 ? `${cut(RETURNED, 2)} USDC left` : null;
  return (
    <Stage>
      <div className={`${base.board} ${css.flashBoard}`}>
        <AppFrame title="Risk-adjusted Mix USDC" tag="Practice" strong>
          <div className={`${css.stepStrip} ${s > 0 ? (go.done ? "" : css.stepStripOn) : css.stepStripIdle}`} aria-live="polite">
            {s > 0 ? (
              <>
                <span className={css.stepNum}>
                  Step {s} of {STEPS.length}
                </span>
                <span>{STEPS[s - 1]}</span>
                {loanChip ? <AppDelta>{loanChip}</AppDelta> : null}
                {holding ? <AppDelta>{holding}</AppDelta> : null}
              </>
            ) : (
              <span className={base.held} aria-hidden="true">
                Step 0 of 7
              </span>
            )}
          </div>
          <Tiles per={4}>
            <Tile k="deposit" label="Deposit" unit="USDC" value={deposit} play={play} on={cstep === 4} format={tileAmount} />
            <Tile k="debt" label="Debt" unit="alUSD" value={debt} play={play} on={cstep === 3 || (cstep === 0 && !go.done)} format={tileAmount} />
            <Tile k="earmarked" label="Earmarked" unit="alUSD" value={earmarked} play={play} on={cstep === 3 || (cstep === 0 && !go.done)} note={cstep >= 3 && !go.done ? <AppDelta>unchanged</AppDelta> : null} format={tileAmount} icon={false} />
            <Tile k="ltv" label="LTV" value={ltv} play={play} format={ltvTile} icon={false} />
          </Tiles>
          <AppTabs tabs={VAULT_TABS} live="Repay" lit />
          <AppPanel>
            <AppInput token="alUSD" dim />
            <span className={css.flashSub}>Flash Repay</span>
            <p className={css.flashHint}>Flash Repay buys alUSD below par to settle your debt and pays you the spread as profit.</p>
            <AppInput
              token="alUSD"
              type="Available"
              label="Flash Repay alUSD amount"
              amount={go.done ? "" : amount}
              onChange={open.ready && ostep === 0 ? setAmount : undefined}
              balance={go.done ? Math.max(debt - earmarked, 0) : avail}
              max={avail}
              digits={0}
            />
            <AppButton
              disabled={!ready && !(open.done && !shown && !go.done && cstep === 0)}
              hint={open.done ? null : !open.ready ? NOT_READY : "Press MAX to fill 4,792"}
              lit={ready}
              onClick={() => {
                setShown(true);
                if (!open.done) ostart();
              }}
            >
              Flash Repay
            </AppButton>
          </AppPanel>
        </AppFrame>
        {/* The window is on the page from the start, unseen until it opens,
            in the same grid cell as the vault (`.flashBoard`). So the figure
            is as tall as the taller of the two before anything is pressed:
            the window is never cut off (on a phone it was, with Cancel and
            Confirm sliced by the figure's foot) and opening it moves nothing. */}
        <div className={`${css.overlay} ${windowOpen ? css.overlayOpen : ""}`} aria-hidden={windowOpen ? undefined : true}>
            <div className={css.dialog} role="dialog" aria-modal="false" aria-label="Flash Repay">
              <h3 className={css.dialogTitle}>Flash Repay</h3>
              <p className={css.dialogText}>
                This will flashloan USDC to purchase alUSD at a discount and repay your loan. The freed up collateral will be withdrawn and used to pay off the
                flashloan, with the savings returned to your wallet. Any excess unburnt alUSD is returned to your wallet.
              </p>
              {/* The rows and the seven steps share one cell, the one not on
                  show unseen, so the window keeps its height when the reader
                  switches between them. */}
              <div className={css.swap}>
                <ol className={`${css.details} ${details ? "" : css.swapHeld}`} aria-hidden={details ? undefined : true}>
                  {STEPS.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                <dl className={`${css.rows} ${details ? css.swapHeld : ""}`} aria-hidden={details ? true : undefined}>
                  {ROWS.map((r, i) => {
                    const arrived = open.done || i < ostep;
                    const appearing = !open.done && i === ostep - 1;
                    return (
                      <div
                        key={r.id}
                        data-row={r.id}
                        className={`${css.row} ${arrived ? "" : css.rowHeld} ${appearing ? css.rowAppear : ""} ${stat === r.id ? css.rowPointed : ""}`}
                        aria-hidden={arrived ? undefined : true}
                      >
                        <dt>
                          {r.label}
                          {r.info ? (
                            <span title={r.info} aria-label={r.info} style={{ display: "inline-flex" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                              </svg>
                            </span>
                          ) : null}
                        </dt>
                        <dd>{r.value}</dd>
                        {r.draw ? <span className={css.rowDraw}>{r.draw}</span> : null}
                      </div>
                    );
                  })}
                </dl>
              </div>
              <button
                type="button"
                className={css.link}
                disabled={!open.done}
                onClick={() => {
                  setDetails((d) => !d);
                  setSeen(true);
                }}
              >
                {details ? "Hide transaction details" : "View transaction details"}
              </button>
              <div className={css.switchRow}>
                <span className={css.switch} role="switch" aria-checked="false" aria-label="Keep savings in position as collateral" />
                Keep savings in position as collateral
              </div>
              <div className={css.buttons}>
                <button
                  type="button"
                  className={css.btn}
                  disabled={oplaying}
                  onClick={() => {
                    setShown(false);
                    setDetails(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${css.btn} ${css.btnPrimary} ${go.ready && seen ? css.btnLit : ""}`}
                  disabled={!go.ready || !seen || cplaying}
                  title={!seen ? "Press View transaction details first" : undefined}
                  onClick={confirm}
                >
                  Confirm Flash Repay
                </button>
              </div>
            </div>
        </div>
      </div>
    </Stage>
  );
}
FlashRepayMoment.moment = "flash-open";
FlashRepayMoment.hint = "Press MAX, then Flash Repay";
