import React, { useEffect, useRef, useState } from "react";
import own from "../Beginner/styles.module.css";
import ls from "../lesson.module.css";
import styles from "./styles.module.css";
import {
  AppButton, AppDelta, AppFixedCard, AppFixedRow, AppInput, AppSwapCard, AppVaultRow, PracticeVault, useReducedMotion,
} from "../AppMock";
import { LessonControl, StepList, money } from "../kit";
import { TAUGHT } from "../Beginner";
import { PROTOCOL_FEE, simpleCurve } from "../lib/model";
import useElementWidth from "../lib/useElementWidth";
import { useMoment, useMomentNote, usePosition } from "./position";
import { Stage } from "./index";
import { NOT_READY, OVER_WALLET } from "./moments";

/**
 * The practice moments of beginner lessons 3 to 8, set into each lesson's
 * MDX. The same rules as lesson 2's (moments.jsx): a moment reads the
 * live position from the lesson's store and writes to it once, on the app's
 * button or the lesson control; until the moments above it are done its
 * field and button are off; once done it keeps its after-state, with the
 * change chips and the copper wash. The words are the MDX's; a moment adds
 * only the app's own labels.
 *
 * One practice element per page, changing in place.
 * Lesson 3's MAX and Borrow share one vault (`BorrowMoment`, two moments on
 * one block); lesson 6's last page repays and then withdraws on one vault;
 * lesson 7's two what-ifs act on one vault without touching the practice
 * wallet, and its liquidation and lesson 8's loop are step sequences on a
 * Next step control. The figures that were drawn mocks (the LTV stats, the
 * Redemption Rate, the health bar) are real captures now, in the MDX.
 */

const APR = 0.05;
const RATE = 0.5;
const CAP = 0.9;
// alUSD's example market price. 0.97 since 2026-11-12 (the Ethereum card
// read 0.970 that day); it was 0.98. The intermediate and
// advanced moments keep their own constants.
const PRICE = 0.97;

/* ── Lesson 3: Borrow against it ─────────────────────────── */

const BORROW = 5_000;

/**
 * "Press MAX first. The alUSD field fills with 9,000 ... Now clear the
 * field, type 5,000 and press Borrow." One vault on the Borrow tab: MAX
 * previews the limit on the stats and is recorded as a moment with the
 * position unchanged; typing 5,000 replaces the preview; Borrow applies.
 */
export function BorrowMoment() {
  const max = useMoment("max-borrow");
  const m = useMoment("borrow");
  const [typed, setTyped] = useState("");
  const shown = m.done ? m.after : m.position;
  const n = Number(typed) || 0;
  const room = Math.max(m.position.deposit * CAP - m.position.debt, 0);
  const live = (max.ready || m.ready) && !m.done;
  const hint = m.done
    ? null
    : !live
      ? NOT_READY
      : !max.done
        ? "Press MAX first"
        : n === 0
          ? "Type 5,000"
          : n > room
            ? "That is more than the vault allows"
            : n !== BORROW
              ? "Clear the field and type 5,000"
              : null;
  useMomentNote("borrow", max.done && m.ready && n > room ? "That is more than the vault allows" : null);
  return (
    <Stage>
      <PracticeVault
        apr={APR}
        deposit={shown.deposit}
        debt={shown.debt}
        taught={TAUGHT.max}
        lit={live && n > 0 ? ["debt", "ltv", "borrowable"] : ["debt"]}
        prev={m.before}
        preview={live && n > 0 ? { debt: shown.debt + n } : null}
        tab="Borrow"
        wash
      >
        <AppInput
          token="alUSD"
          type="Available"
          amount={m.done ? "" : typed}
          onChange={live ? setTyped : undefined}
          balance={m.done ? Math.max(shown.deposit * CAP - shown.debt, 0) : room}
          max={room}
          digits={0}
          onMax={() => {
            if (!max.done) max.apply({ ...max.position });
          }}
        />
        <AppButton
          disabled={!m.ready || n !== BORROW}
          hint={hint}
          onClick={() => m.apply({ ...m.position, debt: m.position.debt + BORROW, walletAl: (m.position.walletAl ?? 0) + BORROW })}
        >
          Borrow
        </AppButton>
      </PracticeVault>
    </Stage>
  );
}
// The MDX holds "Clear the field, type 5,000 and press Borrow" behind MAX
// and marks the borrow with an `Await`, so the preview is explained after
// the reader has seen it, not before.
BorrowMoment.moment = "max-borrow";
BorrowMoment.hint = "Press MAX to continue";

/* ── Lesson 4: Spend the alUSD ───────────────────────────── */

/** "Type 5,000 in the alUSD field and press Swap." */
export function SwapMoment() {
  const m = useMoment("swap");
  const [typed, setTyped] = useState("");
  const shown = m.done ? m.after : m.position;
  const n = Number(typed) || 0;
  const have = m.position.walletAl ?? 0;
  const hint = m.done ? null : !m.ready ? NOT_READY : n > have ? "That is more than the alUSD you hold" : n !== 5_000 ? "Type 5,000" : null;
  useMomentNote("swap", m.ready && n > have ? "That is more than the alUSD you hold" : null);
  return (
    <div className={styles.swapPlace}>
      <AppSwapCard
        price={PRICE}
        amount={m.done ? "" : typed}
        onChange={m.ready ? setTyped : undefined}
        payBalance={shown.walletAl ?? 0}
        getBalance={shown.wallet ?? 0}
        prevPay={m.done ? m.before.walletAl ?? 0 : null}
        prevGet={m.done ? m.before.wallet ?? 0 : null}
        canSwap={m.ready && n === 5_000 && have >= n}
        hint={hint}
        onSwap={() => m.apply({ ...m.position, walletAl: have - n, wallet: (m.position.wallet ?? 0) + n * PRICE })}
      />
    </div>
  );
}
SwapMoment.moment = "swap";
SwapMoment.hint = "Type 5,000 and press Swap";

/* ── Lesson 5: The loan pays itself off ──────────────────── */

const slice = (debt) => Math.round((debt * RATE) / 12);

/**
 * "Press Run redemption." One vault with Earmarked lit, the control under
 * it. The redemption takes the earmarked slice (208 on 5,000 at 50%) off
 * both sides, plus the 0.25% fee off the deposit, and earmarks the next
 * month's share of what is left.
 */
export function RedeemMoment() {
  const m = useMoment("redeem");
  const shown = m.done ? m.after : m.position;
  const earmarked = shown.earmarked ?? slice(shown.debt);
  const run = () => {
    const p = m.position;
    const piece = p.earmarked ?? slice(p.debt);
    const debt = p.debt - piece;
    m.apply({ ...p, deposit: p.deposit - piece - piece * PROTOCOL_FEE, debt, earmarked: slice(debt) });
  };
  return (
    <Stage>
      <PracticeVault
        apr={APR}
        deposit={shown.deposit}
        debt={shown.debt}
        earmarked={earmarked}
        redemptionRate={RATE}
        taught={TAUGHT.earmarked}
        lit={m.done ? [] : ["earmarked"]}
        barLit={m.done ? undefined : ["earmarked"]}
        prev={m.before ? { ...m.before, earmarked: m.before.earmarked ?? slice(m.before.debt) } : m.before}
        chipDigits={2}
        ltvDigits={1}
        wash
      />
      <LessonControl disabled={!m.ready} hint={m.done ? null : NOT_READY} onClick={run}>
        Run redemption
      </LessonControl>
    </Stage>
  );
}
RedeemMoment.moment = "redeem";
RedeemMoment.hint = "Press Run redemption to continue";

/** The year from the day of borrowing: a 5% APR earned a twelfth at a time, and a redemption each month. */
const MONTHS = 12;
const START5 = { deposit: 10_000, debt: 5_000 };
const CURVE = simpleCurve({
  collateral: START5.deposit,
  debt: START5.debt,
  yieldAnnual: Math.pow(1 + APR / 12, 12) - 1,
  redemptionAnnual: RATE,
  months: MONTHS,
});
const YEAR_END = CURVE[CURVE.length - 1];
const COMPARE = 0.07;
const compareAt = (mo) => START5.debt * (1 + (COMPARE * mo) / 12);
const COLORS = { deposit: "oklch(0.65 0.1925 283.02)", debt: "oklch(0.78 0.15 228)", compare: "#f5c09a" };
/** The monthly growth `simpleCurve` applies before each redemption. */
const GROWTH = Math.pow(1 + (Math.pow(1 + APR / 12, 12) - 1), 1 / 12);

/**
 * The year as the chart draws it, month by month from `CURVE`: in each month
 * the deposit earns (`top` is the deposit just before the redemption), then
 * the redemption takes `redeemed` off both sides and the fee off the deposit.
 */
const MONTH_STEPS = CURVE.slice(1).map((p, i) => {
  const a = CURVE[i];
  const top = a.collateral * GROWTH;
  const redeemed = a.debt - p.debt;
  return { month: p.month, from: a, top, redeemed, fee: redeemed * PROTOCOL_FEE, earned: top - a.collateral, to: p };
});

/** The year in sums, rounded: what yield added and what redemptions and fees took. */
const YEAR_SUMS = {
  earned: Math.round(MONTH_STEPS.reduce((s, x) => s + x.earned, 0)),
  redeemed: Math.round(MONTH_STEPS.reduce((s, x) => s + x.redeemed, 0)),
  fees: Math.round(MONTH_STEPS.reduce((s, x) => s + x.fee, 0)),
};

/**
 * The year's end in whole numbers, as the lesson reads it (Deposit 8,456,
 * Debt 3,000): the model's 8,456.06 and 3,000.33 would otherwise show their
 * cents on the strip.
 */
const YEAR_DEPOSIT = Math.round(YEAR_END.collateral);
const YEAR_DEBT = Math.round(YEAR_END.debt);

/**
 * "Press Skip ahead a year." The chart draws the twelve months in, a step a
 * month; the strip moves to the year's end (8,456 and 3,000, with the next
 * share earmarked), and the year's sums appear under the chart.
 */
export function YearOfRedemptions() {
  const m = useMoment("year");
  // The press draws the chart; the position (and so the strip and the words
  // after the element) changes when the draw ends, so the reader watches the
  // lines first and the strip and the result follow.
  const [drawing, setDrawing] = useState(false);
  const finish = () => {
    setDrawing(false);
    if (!m.done) m.apply({ ...m.position, deposit: YEAR_DEPOSIT, debt: YEAR_DEBT, earmarked: slice(YEAR_DEBT) });
  };
  return (
    <>
      <YearChart run={drawing || m.done} onDone={finish} sums={m.done} />
      <LessonControl disabled={!m.ready || drawing} hint={m.done || drawing ? null : NOT_READY} onClick={() => setDrawing(true)}>
        Skip ahead a year
      </LessonControl>
    </>
  );
}
YearOfRedemptions.moment = "year";
YearOfRedemptions.hint = "Press Skip ahead a year to continue";

/** How long the year takes to draw: a quarter second a month, so each step can be seen. */
const DRAW_MS = 3000;
/** The share of a month's time spent on its yield before the redemption's drop is drawn. */
const RISE = 0.75;

/**
 * Deposit and Debt for the year as monthly steps, beside a 5,000 USDC loan
 * from a
 * lender at 7% simple interest. Within a month the deposit rises with its
 * yield; at the month's redemption both lines drop straight down by what was
 * redeemed, the deposit also by the fee. Drawn in over 3 seconds, at a steady
 * pace so every step shows (at once under reduced motion). Pointing at the
 * chart (mouse, a tap, or the arrow keys once it has focus) draws a guide
 * at the nearest month and a readout of that month's three figures.
 */
function YearChart({ run, onDone, sums = false }) {
  const reduced = useReducedMotion();
  // Mounted with the year already run (a reload): drawn in full, no replay.
  const [shown, setShown] = useState(run ? MONTHS : 0);
  const played = useRef(run);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!run || played.current) return undefined;
    played.current = true;
    if (reduced) {
      setShown(MONTHS);
      if (done.current) done.current();
      return undefined;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DRAW_MS);
      setShown(t * MONTHS);
      if (t < 1) raf = window.requestAnimationFrame(tick);
      else if (done.current) done.current();
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [run, reduced]);

  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);
  const narrow = width < 480;
  const w = Math.max(width, 260);
  const h = narrow ? 250 : 340;
  const mg = { top: 18, right: narrow ? 40 : 52, bottom: 34, left: narrow ? 46 : 58 };
  const plotW = Math.max(w - mg.left - mg.right, 10);
  const plotH = Math.max(h - mg.top - mg.bottom, 10);
  const Y0 = 2_000;
  const Y1 = 11_000;
  const x = (v) => mg.left + (v / MONTHS) * plotW;
  const y = (v) => mg.top + (1 - (v - Y0) / (Y1 - Y0)) * plotH;

  // The paths up to `shown` months: each month a rise (or flat debt) over its
  // first part, then the drop at its end.
  const depositPts = [[0, START5.deposit]];
  const debtPts = [[0, START5.debt]];
  for (const st of MONTH_STEPS) {
    const into = shown - (st.month - 1);
    if (into <= 0) break;
    const part = Math.min(into, 1);
    const rise = Math.min(part / RISE, 1);
    const xm = st.month - 1 + rise;
    depositPts.push([xm, st.from.collateral * Math.pow(GROWTH, rise)]);
    debtPts.push([xm, st.from.debt]);
    if (part > RISE) {
      const drop = Math.min((part - RISE) / (1 - RISE), 1);
      depositPts.push([st.month, st.top - (st.top - st.to.collateral) * drop]);
      debtPts.push([st.month, st.from.debt - st.redeemed * drop]);
    }
  }
  const lenderEnd = Math.min(shown, MONTHS);
  const path = (pts) => pts.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(2)},${y(b).toFixed(2)}`).join(" ");
  const full = shown >= MONTHS;

  // The month the reader points at, among the months drawn so far.
  const drawnMonths = Math.floor(Math.min(shown, MONTHS) + 1e-9);
  const pick = (clientX) => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * w;
    const mo = Math.round(((px - mg.left) / plotW) * MONTHS);
    setHover(Math.max(0, Math.min(drawnMonths, mo)));
  };
  const at = hover != null && hover <= drawnMonths ? hover : null;
  const point = at != null ? CURVE[at] : null;

  const yTicks = [2_000, 5_000, 8_000, 11_000];
  const endLabel = (v, color, dy = 4) => (
    <g>
      <circle cx={x(MONTHS)} cy={y(v)} r={4} fill={color} />
      <text x={x(MONTHS) + 8} y={y(v) + dy} className={ls.markerText} textAnchor="start">
        {money(Math.round(v))}
      </text>
    </g>
  );

  return (
    <div className={own.chartCard}>
      <div
        ref={ref}
        className={styles.yearChart}
        tabIndex={0}
        role="group"
        aria-label="Deposit and Debt over 12 months, beside a lender loan of 5,000 USDC at 7%. Use the left and right arrow keys to read each month."
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHover(null);
        }}
        onFocus={() => setHover((v) => (v == null ? drawnMonths : v))}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            setHover((v) => Math.max(0, Math.min(drawnMonths, (v ?? drawnMonths) + (e.key === "ArrowRight" ? 1 : -1))));
          } else if (e.key === "Escape") setHover(null);
        }}
      >
        {width > 0 ? (
          <svg viewBox={`0 0 ${w} ${h}`} className={ls.chart} role="img" aria-label="Deposit and Debt step down at each month's redemption">
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={mg.left} x2={w - mg.right} y1={y(v)} y2={y(v)} className={ls.grid} />
                <text x={mg.left - 8} y={y(v) + 4} className={ls.axisText} textAnchor="end">
                  {money(v)}
                </text>
              </g>
            ))}
            {/* A faint line at each month: where each redemption lands. */}
            {Array.from({ length: MONTHS + 1 }, (_, i) => (
              <line key={i} x1={x(i)} x2={x(i)} y1={mg.top} y2={mg.top + plotH} className={styles.yearMonth} />
            ))}
            {[0, 3, 6, 9, 12].map((v) => (
              <text key={v} x={x(v)} y={h - 16} className={ls.axisText} textAnchor="middle">
                {v}
              </text>
            ))}
            <text x={w - mg.right} y={h - 2} className={ls.axisText} textAnchor="end">
              months
            </text>

            {at != null ? <line x1={x(at)} x2={x(at)} y1={mg.top} y2={mg.top + plotH} className={styles.yearGuide} /> : null}

            <path
              d={`M${x(0)},${y(START5.debt)} L${x(lenderEnd)},${y(compareAt(lenderEnd))}`}
              fill="none" stroke={COLORS.compare} strokeWidth={2} strokeDasharray="7 6" strokeLinecap="round"
            />
            <path d={path(debtPts)} fill="none" stroke={COLORS.debt} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            <path d={path(depositPts)} fill="none" stroke={COLORS.deposit} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

            <circle cx={x(0)} cy={y(START5.deposit)} r={4} fill={COLORS.deposit} />
            <text x={x(0) + 8} y={y(START5.deposit) - 9} className={ls.markerText} textAnchor="start">{money(START5.deposit)}</text>
            <circle cx={x(0)} cy={y(START5.debt)} r={4} fill={COLORS.debt} />
            <text x={x(0) + 8} y={y(START5.debt) + 17} className={ls.markerText} textAnchor="start">{money(START5.debt)}</text>
            {full ? (
              <>
                {endLabel(YEAR_END.collateral, COLORS.deposit)}
                {endLabel(compareAt(MONTHS), COLORS.compare)}
                {endLabel(YEAR_END.debt, COLORS.debt)}
              </>
            ) : null}

            {point ? (
              <>
                <circle cx={x(at)} cy={y(point.collateral)} r={4.5} fill={COLORS.deposit} stroke="var(--m-card)" strokeWidth={2} />
                <circle cx={x(at)} cy={y(point.debt)} r={4.5} fill={COLORS.debt} stroke="var(--m-card)" strokeWidth={2} />
                <circle cx={x(at)} cy={y(compareAt(at))} r={4.5} fill={COLORS.compare} stroke="var(--m-card)" strokeWidth={2} />
              </>
            ) : null}
          </svg>
        ) : (
          <div className={styles.yearPlaceholder} style={{ height: 340 }} />
        )}
        {point && width > 0 ? (
          <div
            className={styles.yearTip}
            role="status"
            style={{
              top: mg.top,
              ...(x(at) > w / 2 ? { right: w - x(at) + 12 } : { left: x(at) + 12 }),
            }}
          >
            <div className={styles.yearTipHead}>{at === 0 ? "The day you borrow" : `Month ${at}`}</div>
            <div><i style={{ background: COLORS.deposit }} />Deposit<b>{money(Math.round(point.collateral))}</b></div>
            <div><i style={{ background: COLORS.debt }} />Debt<b>{money(Math.round(point.debt))}</b></div>
            <div><i style={{ background: COLORS.compare }} />Lender loan<b>{money(Math.round(compareAt(at)))}</b></div>
          </div>
        ) : null}
      </div>
      <div className={own.key}>
        <span style={{ color: COLORS.deposit }}><i />Deposit</span>
        <span style={{ color: COLORS.debt }}><i />Debt</span>
        <span style={{ color: COLORS.compare }}><i className={own.dashed} />Lender loan, 5,000 USDC at 7%</span>
      </div>
      {sums ? (
        // The year in sums: the text gives the yield and the fees, so the
        // figure shows them.
        <div className={styles.yearSums}>
          <span className={styles.yearSum}>
            <span className={styles.yearSumLabel}>Deposit</span>
            <AppDelta>yield +{money(YEAR_SUMS.earned)}</AppDelta>
            <AppDelta>redemptions −{money(YEAR_SUMS.redeemed)}</AppDelta>
            <AppDelta>fees −{money(YEAR_SUMS.fees)}</AppDelta>
            <span className={styles.yearSumTo}>→ {money(YEAR_DEPOSIT)}</span>
          </span>
          <span className={styles.yearSum}>
            <span className={styles.yearSumLabel}>Debt</span>
            <AppDelta>redemptions −{money(YEAR_SUMS.redeemed)}</AppDelta>
            <span className={styles.yearSumTo}>→ {money(YEAR_DEBT)}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ── Lesson 6: Repay and withdraw ────────────────────────── */

/** What the vault lets out while a loan is open: it keeps the Debt over 90%. */
const kept = (debt) => debt / CAP;
const free = (deposit, debt) => (debt > 0 ? deposit - kept(debt) : deposit);
const V6 = { apr: APR, redemptionRate: RATE, taught: TAUGHT.earmarked };

/**
 * The Withdraw tab with Available at 4,444.44: the limit the page explains,
 * on the position as it stands, as a what-if the reader can try.
 * Typing an amount previews Deposit and LTV on the stats; MAX fills the
 * Available amount and the LTV preview reaches 90%; more than Available
 * turns the field red and the preview passes 90%. Withdraw stays off, since
 * nothing here is applied: no moment, nothing written to the position, and
 * the footer's Next is never held by it.
 */
export function AvailableFigure() {
  const m = useMoment("repay-part");
  const { position } = m;
  const [typed, setTyped] = useState("");
  const t = Number(typed) || 0;
  return (
    <Stage>
      <PracticeVault
        {...V6}
        deposit={position.deposit}
        debt={position.debt}
        earmarked={position.earmarked ?? 0}
        lit={t > 0 ? ["deposit", "ltv"] : ["ltv"]}
        barLit={["max", "debt"]}
        preview={t > 0 ? { deposit: position.deposit - t } : null}
        tab="Withdraw"
      >
        <AppInput
          token="USDC"
          type="Available"
          amount={typed}
          onChange={setTyped}
          balance={free(position.deposit, position.debt)}
          digits={0}
        />
        <AppButton disabled hint="This one is a what-if">
          Withdraw
        </AppButton>
      </PracticeVault>
    </Stage>
  );
}

/**
 * "Pick USDC in the token picker, type 1,000 in the field and press Repay."
 * The picker opens on USDC, the token the text names (opened on alUSD,
 * Repay stayed off with no word why).
 */
export function RepayPartMoment() {
  const m = useMoment("repay-part");
  const [token, setToken] = useState("USDC");
  const [typed, setTyped] = useState("");
  const shown = m.done ? m.after : m.position;
  const n = Number(typed) || 0;
  const hint = m.done
    ? null
    : !m.ready
      ? NOT_READY
      : token !== "USDC"
        ? "Pick USDC first"
        : n > m.position.wallet
          ? "That is more than the USDC you hold"
          : n !== 1_000
            ? "Type 1,000"
            : null;
  useMomentNote(
    "repay-part",
    m.ready && token !== "USDC" ? "Pick USDC first" : m.ready && n > m.position.wallet ? "That is more than the USDC you hold" : null,
  );
  const pay = () => {
    const p = m.position;
    // repay(): earmarked debt first, and the protocol fee on that part comes
    // out of the deposit, as in a redemption.
    const fromEarmark = Math.min(n, p.earmarked ?? 0);
    m.apply({ ...p, deposit: p.deposit - fromEarmark * PROTOCOL_FEE, debt: p.debt - n, earmarked: Math.max((p.earmarked ?? 0) - n, 0), wallet: p.wallet - n });
  };
  return (
    <Stage>
      <PracticeVault
        {...V6}
        deposit={shown.deposit}
        debt={shown.debt}
        earmarked={shown.earmarked ?? 0}
        lit={m.done ? [] : ["debt", "earmarked"]}
        prev={m.before}
        preview={m.ready && token === "USDC" && n > 0 ? { debt: shown.debt - n, earmarked: Math.max((shown.earmarked ?? 0) - n, 0) } : undefined}
        tab="Repay"
        wash
      >
        <AppInput
          token={m.done ? "USDC" : token}
          tokens={["alUSD", "USDC", "MYT"]}
          onToken={m.ready && !m.done ? setToken : undefined}
          amount={m.done ? "" : typed}
          onChange={m.ready ? setTyped : undefined}
          balance={token === "USDC" || m.done ? shown.wallet : token === "alUSD" ? shown.walletAl ?? 0 : 0}
          max={token === "USDC" ? Math.min(shown.debt, shown.wallet) : 0}
          digits={0}
        />
        <AppButton disabled={!m.ready || token !== "USDC" || n !== 1_000} hint={hint} onClick={pay}>
          Repay
        </AppButton>
      </PracticeVault>
    </Stage>
  );
}
RepayPartMoment.moment = "repay-part";
RepayPartMoment.hint = "Type 1,000 and press Repay";

/**
 * Lesson 6's last page on one element. "On the Repay tab press MAX ... then
 * press Repay" clears the loan; the same vault then opens on the Withdraw
 * tab for "press MAX, and press Withdraw". The MDX puts an `Await` marker
 * for the withdraw after the paragraph that asks for it.
 */
export function RepayRestThenWithdrawMoment() {
  const pay = useMoment("repay-rest");
  const out = useMoment("withdraw-all");
  const [typed, setTyped] = useState("");
  const [taking, setTaking] = useState("");
  const onRepay = !pay.done;
  const shown = out.done ? out.after : pay.done ? pay.after : pay.position;
  const prev = out.done ? out.before : pay.done ? pay.before : null;
  const n = Number(typed) || 0;
  const owed = pay.position.debt;
  const avail = free(out.position.deposit, out.position.debt);
  const t = Number(taking) || 0;
  // MAX fills to the cent, so an amount is right when it matches to the cent.
  const near = (a, b) => Math.abs(a - b) < 0.005;
  const payHint = pay.done ? null : !pay.ready ? NOT_READY : owed <= 0 ? "Nothing is owed" : !near(n, owed) ? "Press MAX to fill what you owe" : null;
  const outHint = out.done ? null : !out.ready ? NOT_READY : !near(t, avail) ? "Press MAX to fill the full amount" : null;
  return (
    <Stage>
      <PracticeVault
        {...V6}
        deposit={shown.deposit}
        debt={shown.debt}
        earmarked={shown.earmarked ?? 0}
        lit={out.done ? [] : onRepay ? ["debt"] : ["deposit"]}
        prev={prev}
        preview={
          onRepay && pay.ready && n > 0
            ? { debt: shown.debt - n }
            : !onRepay && out.ready && t > 0
              ? { deposit: shown.deposit - t }
              : undefined
        }
        tab={onRepay ? "Repay" : "Withdraw"}
        wash
      >
        {onRepay ? (
          <>
            <AppInput
              token="USDC"
              amount={typed}
              onChange={pay.ready ? setTyped : undefined}
              balance={shown.wallet}
              max={Math.min(shown.debt, shown.wallet)}
              digits={0}
            />
            <AppButton
              disabled={!pay.ready || owed <= 0 || !near(n, owed)}
              hint={payHint}
              onClick={() => pay.apply({ ...pay.position, debt: 0, earmarked: 0, wallet: pay.position.wallet - owed })}
            >
              Repay
            </AppButton>
          </>
        ) : (
          <>
            <AppInput
              token="USDC"
              type="Available"
              amount={out.done ? "" : taking}
              onChange={out.ready ? setTaking : undefined}
              balance={out.done ? 0 : avail}
              digits={0}
            />
            <AppButton
              disabled={!out.ready || t <= 0 || !near(t, avail)}
              hint={outHint}
              onClick={() => out.apply({ ...out.position, deposit: 0, wallet: out.position.wallet + out.position.deposit })}
            >
              Withdraw
            </AppButton>
          </>
        )}
      </PracticeVault>
    </Stage>
  );
}
RepayRestThenWithdrawMoment.moment = "repay-rest";
RepayRestThenWithdrawMoment.hint = "Press MAX, then Repay";

/* ── Lesson 7: What can liquidate you ────────────────────── */

const V7 = { apr: APR, redemptionRate: RATE, ltvDigits: 0 };

/**
 * Lesson 7's two what-ifs on one vault. "Press Drop the price" shows the
 * stats in dollars at USDC 0.90, with the LTV unchanged; "Press Apply a 10%
 * loss" takes 10% off the Deposit on the element and the LTV rises. Both
 * are recorded with the practice wallet unchanged: they are what-ifs, as
 * the page's last paragraph says. The MDX puts an `Await` marker for the
 * loss after the paragraph that asks for it.
 */
export function WhatIfMoment() {
  const drop = useMoment("drop");
  const loss = useMoment("loss");
  const { position } = drop;
  const dropped = drop.done && !loss.done;
  const deposit = loss.done ? position.deposit * 0.9 : position.deposit;
  return (
    <Stage>
      <PracticeVault
        {...V7}
        deposit={deposit}
        debt={position.debt}
        earmarked={position.earmarked ?? 0}
        taught={TAUGHT.liq}
        lit={loss.done ? ["deposit", "ltv"] : dropped ? ["deposit", "debt", "ltv"] : ["ltv"]}
        price={dropped ? 0.9 : null}
        prevPrice={dropped ? 1 : null}
        prev={loss.done ? { deposit: position.deposit } : dropped ? { deposit: position.deposit, debt: position.debt } : undefined}
        chipTone="app"
        wash
        // The price row is there from the start, at 1.00, so the drop changes
        // a figure and nothing moves (a row added on the press changed the
        // element's size in one frame).
        wallet={
          <div className={styles.priceNote}>
            <span>USDC price</span>
            {dropped ? <AppDelta tone="bad">0.90, was 1.00</AppDelta> : <span className={styles.priceValue}>1.00</span>}
          </div>
        }
      />
      {!drop.done ? (
        <LessonControl disabled={!drop.ready} hint={NOT_READY} onClick={() => drop.apply({ ...drop.position })}>
          Drop the price
        </LessonControl>
      ) : !loss.done ? (
        <LessonControl disabled={!loss.ready} hint={NOT_READY} onClick={() => loss.apply({ ...loss.position })}>
          Apply a 10% loss
        </LessonControl>
      ) : null}
    </Stage>
  );
}
WhatIfMoment.moment = "drop";
WhatIfMoment.hint = "Press Drop the price to continue";

/**
 * A numbered list from the MDX shown one step at a time on a Next step
 * control, with the kit's step list for the steps shown so far. The last
 * step records the moment `id` with the position unchanged, so the footer's
 * Next opens with it. `states` gives a practice vault per step (lesson 7's
 * liquidation), each with the index of the state its chips are drawn from;
 * `figures` gives chips under each step instead (lesson 8's loop).
 *
 *   <LiquidationSequence>
 *
 *   1. The same 10% loss leaves Deposit at 9,000 against Debt 8,600. ...
 *   ...
 *
 *   </LiquidationSequence>
 */
function Sequence({ id, states = null, figures = [], children }) {
  const m = useMoment(id);
  const list = React.Children.toArray(children).find((c) => React.isValidElement(c));
  const items = list ? React.Children.toArray(list.props.children).filter((c) => React.isValidElement(c)) : [];
  const total = items.length;
  // A sequence with vault states opens on the state before its first step, so
  // the first press shows the first change on the vault (lesson 7's loss).
  const [step, setStep] = useState(m.done ? total : states ? 0 : 1);
  const shown = Math.min(step, total);
  const state = states ? states[shown] : null;
  const from = state && state.prev != null ? states[state.prev] : null;
  return (
    <>
      {state ? (
        <Stage>
          <PracticeVault
            {...V7}
            deposit={state.deposit}
            debt={state.debt}
            taught={TAUGHT.liq}
            lit={state.lit ?? []}
            prev={from ? { deposit: from.deposit, debt: from.debt } : undefined}
            chipTone="app"
            wash
          />
        </Stage>
      ) : null}
      {shown > 0 ? (
        <div className={styles.steps}>
          <StepList steps={items.slice(0, shown).map((li, i) => ({ text: li.props.children, figures: figures[i] ?? [] }))} />
        </div>
      ) : null}
      {shown < total ? (
        <LessonControl
          disabled={!m.ready}
          hint={m.ready ? null : NOT_READY}
          onClick={() => {
            const next = shown + 1;
            setStep(next);
            if (next === total) m.apply({ ...m.position });
          }}
        >
          Next step
        </LessonControl>
      ) : null}
    </>
  );
}

/**
 * The vault at each step of lesson 7's liquidation; index 0 is the position
 * before the loss.
 *
 * A position that borrowed 8,600 against 10,000, under the same 10% loss the
 * page before applies to the learner's own vault. It was
 * the learner's 5,000 loan under a 48% loss, which would
 * not end this way: a loss that large across a vault puts the whole vault past
 * its 95% bound, and the contract then settles the full debt
 * (calculateLiquidation's global branch). A 10% loss leaves every live vault
 * under that bound (read 2026-11-12).
 */
const LIQUIDATION_STATES = [
  { deposit: 10_000, debt: 8_600, lit: ["ltv"] },
  { deposit: 9_000, debt: 8_600, prev: 0, lit: ["deposit", "ltv"] },
  // calculateLiquidation: fee 1.5% of the 400 surplus (6), 5,054 of debt
  // burned, 5,060 seized, exactly 90% after.
  { deposit: 3_940, debt: 3_546, prev: 1, lit: ["deposit", "debt", "ltv"] },
  { deposit: 3_940, debt: 3_546, prev: 1, lit: ["deposit", "debt", "ltv"] },
];

/**
 * Under step 2, where the deposit is taken: what the borrower still holds.
 * The borrower still holds the alUSD they borrowed, which lowers their net
 * loss. The
 * vault's tiles show only the two sides of the position, so the borrowed
 * alUSD needs its own figure.
 */
const LIQUIDATION_FIGURES = [[], [{ label: "Their wallet", value: "8,600 alUSD" }], []];

export function LiquidationSequence({ children }) {
  return (
    <Sequence id="liquidation" states={LIQUIDATION_STATES} figures={LIQUIDATION_FIGURES}>
      {children}
    </Sequence>
  );
}
LiquidationSequence.moment = "liquidation";
LiquidationSequence.hint = "Step through the liquidation to continue";

/* ── Lesson 8: The other side of your loan ───────────────── */

const SPEND = 4_850;
const ALUSD = Math.round(SPEND / PRICE);
// The app: (1/price - 1) x 365 / days to maturity (120 here), cut to two decimals.
// The app prints the card's price to three decimals (0.970) and the
// Dashboard's Profit in dollars (checked against the live app, 2026-11-10).
// The cap is the live Ethereum card's on 2026-11-12, the one in the capture
// above the practice card; the advanced lessons keep the kit's 2.4M default.
const CARD = { apr: Math.floor((((ALUSD - SPEND) / SPEND) * 365) / 120 * 10000) / 10000, price: "0.970 USDC", term: "4 Months", maturity: "Mar 04, 2027", early: "1.00%", cap: "2.4M/2.5M alUSD", capFill: 0.96 };
const ROW = { apr: "9.40%", end: "Mar 04, 2027", deposit: "5,000 alUSD", profit: "$150" };
const EARLY_FEE = 0.01;

/** "Type it in the card's USDC field and press Swap & Deposit." */
export function BuyFixedMoment() {
  const m = useMoment("buy");
  const [typed, setTyped] = useState("");
  const shown = m.done ? m.after : m.position;
  const n = m.done ? SPEND : Number(typed) || 0;
  const buys = n / PRICE;
  const figures = n > 0 ? { output: buys, percent: (buys - n) / n, gain: buys - n } : {};
  const hint = m.done ? null : !m.ready ? NOT_READY : n > m.position.wallet ? OVER_WALLET : n !== SPEND ? "Type 4,850" : null;
  useMomentNote("buy", m.ready && !m.done && n > m.position.wallet ? OVER_WALLET : null);
  return (
    <Stage>
      <AppFixedCard
        {...CARD}
        {...figures}
        amount={m.done ? "" : typed}
        onChange={m.ready ? setTyped : undefined}
        balance={shown.wallet}
        prevBalance={m.done ? m.before.wallet : null}
        buys={buys}
        spent={m.done ? SPEND : null}
        // Lit, every figure the text reads at that point (greyed out, the
        // card hid figures the text described): the price and
        // the box before, the figures the box moves as it is typed in, and
        // after the deposit every figure the result paragraph reads.
        lit={
          m.done
            ? ["amount", "price", "output", "gain", "percent", "apr", "term", "maturity"]
            : n > 0
              ? ["amount", "price", "output", "gain", "percent"]
              : ["amount", "price"]
        }
        action={
          <AppButton
            disabled={!m.ready || Number(typed) !== SPEND || m.position.wallet < SPEND}
            hint={hint}
            onClick={() => m.apply({ ...m.position, wallet: m.position.wallet - SPEND, fixedYield: (m.position.fixedYield ?? 0) + ALUSD })}
          >
            Swap & Deposit
          </AppButton>
        }
      />
    </Stage>
  );
}
BuyFixedMoment.moment = "buy";
BuyFixedMoment.hint = "Type 4,850 and press Swap & Deposit";

/** "Press Claim." The Dashboard row on Mar 04, 2027. */
export function ClaimMoment() {
  const m = useMoment("claim");
  const shown = m.done ? m.after : m.position;
  return (
    <Stage>
      <AppFixedRow
        {...ROW}
        transmuter={null}
        deposit={m.done ? "0 alUSD" : ROW.deposit}
        date="Mar 04, 2027"
        lit={["apr", "end", "deposit", "profit", "action"]}
        // Held in place (hidden) before the claim, so the row does not grow.
        wallet={
          <div className={styles.priceNote} style={m.done ? undefined : { visibility: "hidden" }} aria-hidden={m.done ? undefined : true}>
            <span>Paid out</span>
            <AppDelta tone="good">+5,000 USDC</AppDelta>
            <AppDelta tone="bad">5,000 alUSD burned</AppDelta>
          </div>
        }
        action={
          <AppButton
            disabled={!m.ready || !((m.position.fixedYield ?? 0) > 0)}
            hint={m.done ? null : !m.ready ? NOT_READY : !((m.position.fixedYield ?? 0) > 0) ? "Nothing in Fixed Yield to claim" : null}
            onClick={() => m.apply({ ...m.position, wallet: m.position.wallet + m.position.fixedYield, fixedYield: 0 })}
          >
            {m.done ? "Claimed" : "Claim"}
          </AppButton>
        }
      />
    </Stage>
  );
}
ClaimMoment.moment = "claim";
ClaimMoment.hint = "Press Claim to continue";

/** The figures under each step of lesson 8's loop: the practice wallet's own numbers. */
const LOOP_FIGURES = [
  [
    { label: "Borrowers' Debt", value: "5,000 alUSD" },
    { label: "Borrowers' wallet", value: "+4,850 USDC" },
    { label: "Discount", value: "150 USDC", tone: "bad" },
  ],
  [
    { label: "Your wallet", value: "-4,850 USDC", tone: "bad" },
    { label: "Fixed Yield", value: "5,000 alUSD" },
  ],
  [
    { label: "Borrowers' Earmarked", value: "5,000 alUSD" },
  ],
  [
    { label: "Borrowers' Deposit", value: "-5,012.50 USDC", tone: "bad" },
    { label: "Borrowers' Debt", value: "-5,000 alUSD" },
    { label: "Your wallet", value: "+5,000 USDC" },
    { label: "Burned", value: "5,000 alUSD" },
  ],
];

export function LoopSequence({ children }) {
  return (
    <Sequence id="loop" figures={LOOP_FIGURES}>
      {children}
    </Sequence>
  );
}
LoopSequence.moment = "loop";
LoopSequence.hint = "Step through the loop to continue";

/**
 * "Press Claim with Penalty." Halfway through, on Jan 03, 2027 (day 60 of 120): the same
 * deposit claimed early. The MDX sets the strip back to the 5,000 alUSD in
 * Fixed Yield as the page opens (a StripAt), and the claim is drawn from
 * that state, not from the claim at maturity above it.
 */
export function ClaimEarlyMoment() {
  const m = useMoment("claim-early");
  const half = ALUSD / 2;
  const left = m.done;
  const shown = left ? m.after : null;
  return (
    <Stage>
      <AppFixedRow
        {...ROW}
        deposit={left ? "0 alUSD" : ROW.deposit}
        profit={left ? "--" : ROW.profit}
        date="Jan 03, 2027"
        lit={["apr", "end", "deposit", "profit", "action"]}
        // What was paid, and the fee as a note on the alUSD rather than a
        // second red chip, which read as two charges. Held in place (hidden)
        // before the claim.
        wallet={
          <div className={styles.priceNote} style={left ? undefined : { visibility: "hidden" }} aria-hidden={left ? undefined : true}>
            <span>Paid out</span>
            <AppDelta tone="good">+{money(half)} USDC</AppDelta>
            <AppDelta tone="good">+{money(half * (1 - EARLY_FEE))} alUSD</AppDelta>
            <span className={styles.paidNote}>
              {money(half)} alUSD less the {money(half * EARLY_FEE)} alUSD early exit fee
            </span>
          </div>
        }
        action={
          <AppButton
            disabled={!m.ready}
            hint={m.done ? null : NOT_READY}
            onClick={() =>
              m.apply(
                { ...m.position, wallet: half, walletAl: half * (1 - EARLY_FEE), fixedYield: 0 },
                { ...m.position, wallet: 0, walletAl: 0, fixedYield: ALUSD },
              )
            }
          >
            {left ? "Claimed" : "Claim with Penalty"}
          </AppButton>
        }
      />
    </Stage>
  );
}
ClaimEarlyMoment.moment = "claim-early";
ClaimEarlyMoment.hint = "Press Claim with Penalty to continue";

/* ── Figures with nothing to press ───────────────────────── */

/**
 * The Dashboard's Open Vault Positions for the practice position, under the
 * sentence that names it (lesson 3 after the borrow, lesson 6's route to the
 * vault page). The figure shows where the position is, so the text does not
 * have to say where.
 *
 * Drawn as the app draws the section: the summary bar in dollars, with alUSD
 * at the course's
 * market price, over the position's card with Manage. Lesson 3 comes before
 * Earmarked is taught and its position has none, so the card's Earmarked row
 * is faint there.
 */
export function VaultRowFigure({ lit = [] }) {
  const { position } = usePosition();
  return (
    <Stage>
      <AppVaultRow deposit={position.deposit} debt={position.debt} earmarked={position.earmarked ?? null} apr={APR} alPrice={PRICE} lit={lit} />
    </Stage>
  );
}

/**
 * Lesson 3, page 1: the position stats and the health bar on the practice
 * vault, where a capture of the app stood (a live element in place of a
 * screenshot). The
 * position as the page has it (10,000 deposited, nothing owed), nothing to
 * press, tiles taught through Borrowable and Health Factor, with the four
 * the page explains lit and the MAX LTV marker on the bar.
 */
export function StatsFigure() {
  const { position } = usePosition();
  return (
    <Stage>
      <PracticeVault
        apr={APR}
        deposit={position.deposit}
        debt={position.debt}
        earmarked={position.earmarked ?? 0}
        taught={TAUGHT.max}
        lit={["debt", "ltv", "borrowable", "health"]}
        barLit={["max", "debt"]}
      />
    </Stage>
  );
}

/**
 * Lesson 5, page 1: the practice vault with the Redemption Rate lit among
 * its stats, in place of a capture made with no position open.
 */
export function RateFigure() {
  const { position } = usePosition();
  return (
    <Stage>
      <PracticeVault
        apr={APR}
        redemptionRate={RATE}
        deposit={position.deposit}
        debt={position.debt}
        earmarked={position.earmarked ?? 0}
        taught={TAUGHT.rate}
        lit={["redemption"]}
        ltvDigits={1}
      />
    </Stage>
  );
}
