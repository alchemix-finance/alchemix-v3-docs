import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import own from "./styles.module.css";
import app from "../AppMock/styles.module.css";
import { AppTabs, INFO_TABS, useReducedMotion } from "../AppMock";
import { LineChart, money } from "../kit";
import { TAUGHT } from "../Beginner";

/**
 * The parts the intermediate lessons add to the beginner track's.
 *
 * The intermediate track is written screen by screen in
 * the lesson scripts and uses the beginner track's screen
 * shape (`useScreens`, `Screen`, `Next`, `Wait`, `Done`, `Ask`, `Ending` from
 * ../Beginner) and its practice vault. What is here is what the deeper lessons
 * need on top: a formula set apart with the learner's numbers beneath it,
 * lesson sliders drawn apart from the app's controls, the practice Info tab's
 * Strategy A, B and C, the cap table, the LTV bar with its point, the
 * Redemption Rate's three inputs, the Earmarking, Redemptions and Visualizer
 * tabs, the five lit steps of a Flash Repay, and the sizing box. The labs hold
 * the words; these hold the shape.
 */

/** A lesson that opens on a Try has two stages, Try and Check (lessons 3 and 5). */
export const TRY_STAGES = [
  { id: "explore", label: "Try" },
  { id: "checkpoint", label: "Check" },
];

/** Every tile and marker the beginner track taught. Health Factor joins from lesson 2. */
export const TAUGHT_ALL = TAUGHT.liq;

/**
 * The practice vault's strategies (script notes): Strategy A, Conservative,
 * 60%; B, Moderate, 30%; C, Aggressive, 10%. Practice names, so no real
 * strategy is shown losing money. The APR column is an example and stays
 * dimmed: before the 15% performance fee the three blend to about 5.88%,
 * which is the course's 5% after it.
 */
export const STRATS = [
  { name: "Strategy A", risk: "Conservative", apr: "5.50%", allocation: 60, color: "oklch(0.78 0.15 228)" },
  { name: "Strategy B", risk: "Moderate", apr: "6.20%", allocation: 30, color: "oklch(0.65 0.1925 283.02)" },
  { name: "Strategy C", risk: "Aggressive", apr: "7.20%", allocation: 10, color: "oklch(0.85 0.0792 57.05)" },
];

/**
 * A formula on its own line, set apart from the body, with the learner's
 * numbers filled in beneath it.
 *
 *   <Formula text="Available = Deposit − Debt ÷ 0.9">10,000 − 5,556 is 4,444.</Formula>
 */
export function Formula({ text, children = null }) {
  return (
    <div className={own.formula}>
      <div className={own.rule}>{text}</div>
      {children ? <div className={own.worked}>{children}</div> : null}
    </div>
  );
}

/** A short list in the body's own type, for a screen whose body is a list. */
export function Points({ children }) {
  return <ul className={own.points}>{children}</ul>;
}

export function Point({ children }) {
  return <li>{children}</li>;
}

/**
 * One line of figures under a figure ("Strategies earned 588. Performance fee
 * 88. Your Deposit +500."): each a label and its value.
 */
export function Facts({ items }) {
  return (
    <div className={own.facts}>
      {items.map((it) => (
        <span key={it.label} className={`${own.fact} ${it.on ? own.factOn : ""} ${it.dim ? own.factDim : ""}`}>
          <span className={own.factLabel}>{it.label}</span>
          <span className={own.factValue}>{it.value}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Two or three big figures side by side, such as "LTV now" and "LTV after a
 * 60% loss". `tone: "bad"` draws a value in the app's red.
 */
export function Stats({ items }) {
  return (
    <div className={own.stats}>
      {items.map((it) => (
        <div key={it.label} className={`${own.stat} ${it.on ? own.statOn : ""}`}>
          <div className={own.statLabel}>{it.label}</div>
          <div className={`${own.statValue} ${it.tone === "bad" ? own.bad : it.tone === "good" ? own.good : ""}`}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * A slider for something the app has no control for (a loss, a Debt, the
 * alUSD price). Drawn as the lesson's controls are, in dashed copper, so no
 * learner takes it for part of the app.
 */
export function LessonSlider({ label, value, display, min, max, step, onChange, disabled = false, aria = null }) {
  return (
    <div className={own.slider}>
      <div className={own.sliderHead}>
        <span className={own.sliderLabel}>{label}</span>
        <span className={own.sliderValue}>{display}</span>
      </div>
      <input
        type="range" className={own.range} min={min} max={max} step={step} value={value}
        disabled={disabled} aria-label={aria ?? label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** A frame with the vault page's info tabs, one of them live, tagged Practice. */
export function InfoTab({ active, label, children }) {
  return (
    <section className={`${app.frame} ${app.info}`} aria-label={label}>
      <div className={app.top}>
        <AppTabs tabs={INFO_TABS} live={active} />
        <span className={`${app.practice} ${app.practiceStrong}`}>Practice</span>
      </div>
      <div className={own.tabBody}>{children}</div>
    </section>
  );
}

/**
 * The DAO's caps beside this vault's shares (lesson 1). `lit` names the rows
 * a screen is about ("aggressive", "moderate", "conservative").
 */
export function CapTable({ lit = null }) {
  const rows = [
    { key: "aggressive", level: "Aggressive", one: "20%", all: "20%", here: "10%" },
    { key: "moderate", level: "Moderate", one: "40%", all: "60% with Aggressive", here: "30%" },
    { key: "conservative", level: "Conservative", one: "No cap", all: "No cap", here: "60%" },
  ];
  return (
    <div className={own.card}>
      <table className={own.capTable}>
        <thead>
          <tr>
            <th>Risk Level</th>
            <th>One strategy</th>
            <th>In total</th>
            <th>This vault</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={lit && !lit.includes(r.key) ? own.dim : ""}>
              <td>{r.level}</td>
              <td>{r.one}</td>
              <td>{r.all}</td>
              <td className={r.key === "conservative" ? "" : own.inside}>
                {r.here}
                {r.key === "conservative" ? null : <Tick />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tick() {
  return (
    <svg className={own.tick} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="inside its cap">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * The LTV bar on its own: 0 to 100%, the MAX LTV and LIQ LTV lines, and the
 * learner's LTV as a point that moves along it. `zones` shades its three
 * parts (lesson 2); `lit` names the parts a screen is about ("max", "liq").
 * Leave `ltv` null for the bar with no point on it.
 */
export function LtvBar({ ltv = null, zones = false, lit = null, label = "LTV" }) {
  const point = ltv != null;
  const at = point ? Math.min(Math.max(ltv, 0), 1) * 100 : 0;
  const fade = (k) => (lit && !lit.includes(k) ? own.dim : "");
  const shown = point ? `${label} ${ltv >= 1 ? "100" : (Math.round(ltv * 1000) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 })}%` : "";
  return (
    <div className={own.card}>
      <div className={own.ltvTrack} role="img" aria-label={`${point ? `${shown}, against ` : ""}MAX LTV at 90% and LIQ LTV at 95%`}>
        {zones ? (
          <>
            <span className={`${own.zone} ${own.zoneOk}`} style={{ left: 0, width: "90%" }} />
            <span className={`${own.zone} ${own.zoneCap}`} style={{ left: "90%", width: "5%" }} />
            <span className={`${own.zone} ${own.zoneLiq}`} style={{ left: "95%", width: "5%" }} />
          </>
        ) : null}
        <span className={`${own.line} ${own.lineMax} ${fade("max")}`} style={{ left: "90%" }} />
        <span className={`${own.line} ${own.lineLiq} ${fade("liq")}`} style={{ left: "95%" }} />
        {point ? <span className={own.point} style={{ left: `${at}%` }} /> : null}
      </div>
      <div className={own.ltvTags}>
        {point ? (
          <span className={own.pointTag} style={{ left: `${at}%`, transform: `translateX(${at > 80 ? "-100%" : at < 10 ? "0" : "-50%"})` }}>{shown}</span>
        ) : null}
        <span className={`${own.markTag} ${fade("max")}`} style={{ right: "calc(10% + 0.375rem)" }}>MAX LTV</span>
        <span className={`${own.markTag} ${own.markLiq} ${fade("liq")}`} style={{ right: 0 }}>LIQ LTV</span>
      </div>
      {zones ? (
        <div className={own.zoneKey}>
          <span><i className={own.zoneOk} />Under 90%</span>
          <span><i className={own.zoneCap} />90% to 95%</span>
          <span><i className={own.zoneLiq} />Past 95%</span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The Redemption Rate's three inputs feeding its tile (lesson 4): alUSD
 * waiting, the term and Total Debt. `lit` names the inputs a screen moves;
 * `blank` hides the rate until a question is answered; `prev` holds the
 * figures before a lesson control, shown as "was".
 */
export function RateInputs({ waiting, months, totalDebt, rate, lit = [], blank = false, prev = null }) {
  const box = (key, name, value, was) => (
    <div className={`${own.input} ${lit.includes(key) ? own.inputOn : ""}`}>
      <div className={own.inputLabel}>{name}</div>
      <div className={own.inputValue}>{value}</div>
      {was != null ? <div className={own.was}>was {was}</div> : null}
    </div>
  );
  return (
    <div className={own.rateFlow}>
      <div className={own.rateInputs}>
        {box("waiting", "alUSD waiting", money(waiting), prev && prev.waiting !== waiting ? money(prev.waiting) : null)}
        {box("term", "Term", `${months} months`, null)}
        {box("totalDebt", "Total Debt", money(totalDebt), prev && prev.totalDebt !== totalDebt ? money(prev.totalDebt) : null)}
      </div>
      <svg className={own.rateArrow} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
      <div className={own.rateTile}>
        <div className={own.rateTileLabel}>Redemption Rate</div>
        <div className={own.rateTileValue}>{blank ? "?" : `${Math.round(rate * 100)}%`}</div>
        {prev && prev.rate !== rate && !blank ? <div className={own.wasApp}>was {Math.round(prev.rate * 100)}%</div> : null}
      </div>
    </div>
  );
}

/**
 * The Earmarking tab, as a simple mock: the annualized rate at which the
 * vault's debt has been earmarked over the last 30 days (borrowing-in-alchemix.md
 * in the docs). Practice figures, flat near the vault's 50%.
 */
export function EarmarkingTab() {
  const pts = [48, 49, 51, 50, 52, 50, 49, 50, 51, 50, 50].map((y, i) => ({ x: i * 3, y }));
  return (
    <InfoTab active="Earmarking" label="Practice copy of the Earmarking tab on the app's vault page">
      <div className={own.tabTitle}>Earmarking rate, last 30 days</div>
      <LineChart
        series={[{ id: "earmark", color: "oklch(0.85 0.0792 57.05)", points: pts }]}
        xMax={30} yMin={0} yMax={100} yTicks={2} xTicks={3}
        formatY={(v) => `${Math.round(v)}%`} formatX={(v) => (v === 30 ? "today" : `${30 - v}d`)}
        label="The vault's earmarking rate over the last 30 days, near 50%"
      />
    </InfoTab>
  );
}

/**
 * The Redemptions tab, as a simple mock: the redemptions due over the next
 * three months, and what redemptions paid off over the last 30 days. Practice
 * figures, a month of payouts each (62,500). The docs call the second part
 * Realized and describe it as a rate, where this mock shows an amount; open
 * until someone reads the live tab.
 */
export function RedemptionsTab() {
  const rows = [
    ["Dec 04, 2026", "62,500 alUSD"],
    ["Jan 04, 2027", "62,500 alUSD"],
    ["Feb 04, 2027", "62,500 alUSD"],
  ];
  return (
    <InfoTab active="Redemptions" label="Practice copy of the Redemptions tab on the app's vault page">
      <table className={own.schedule}>
        <thead>
          <tr><th>Due</th><th>Redemptions</th></tr>
        </thead>
        <tbody>
          {rows.map(([d, v]) => (
            <tr key={d}><td>{d}</td><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
      <div className={own.scheduleFoot}>
        <span>Paid off, last 30 days</span>
        <b>62,500 alUSD</b>
      </div>
    </InfoTab>
  );
}

/**
 * The Visualizer tab (lesson 4): Duration 12 months and the app's Redemption
 * % slider, with the Debt line over the year and its reading at 12 months.
 * `ghosts` are rates already visited, drawn faint, so the range shows.
 */
export function VisualizerTab({ pct, onPct, curve, ghosts = [] }) {
  const end = curve(pct)[12];
  const series = [
    ...ghosts.map((g) => ({ id: `g${g}`, color: "oklch(0.78 0.15 228)", ghost: true, points: curve(g).map((p) => ({ x: p.month, y: p.debt })) })),
    { id: "debt", color: "oklch(0.78 0.15 228)", points: curve(pct).map((p) => ({ x: p.month, y: p.debt })) },
  ];
  return (
    <InfoTab active="Visualizer" label="Practice copy of the Visualizer tab on the app's vault page">
      <div className={own.vizControls}>
        <label className={own.vizSlider}>
          <span className={own.vizHead}>
            <span>Redemption %</span>
            <b>{pct}%</b>
          </span>
          <input
            type="range" min={0} max={200} step={5} value={pct}
            aria-label="Redemption %" className={own.vizRange}
            onChange={(e) => onPct(Number(e.target.value))}
          />
        </label>
        <div className={own.vizStatic}>
          <span>Duration</span>
          <b>12 months</b>
        </div>
      </div>
      <LineChart
        series={series}
        xMax={12} yMin={0} yMax={6000} yTicks={3} xTicks={4} xLabel="months"
        formatY={(v) => money(v)}
        markers={[{ x: 12, y: end.debt, label: `Debt ${money(end.debt)}`, color: "oklch(0.78 0.15 228)" }]}
        label={`Debt over 12 months at a Redemption % of ${pct}: ${money(end.debt)} at 12 months`}
      />
    </InfoTab>
  );
}

/**
 * Steps that light in turn once `run` is set (Flash Repay's five, lesson 6),
 * then stay lit. All at once under reduced motion.
 */
export function LitSteps({ steps, run }) {
  const reduced = useReducedMotion();
  const [upto, setUpto] = useState(run ? steps.length : 0);
  useEffect(() => {
    if (!run) return undefined;
    if (reduced) {
      setUpto(steps.length);
      return undefined;
    }
    const t = setInterval(() => {
      setUpto((n) => {
        if (n >= steps.length) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 450);
    return () => clearInterval(t);
  }, [run, reduced]);
  return (
    <ol className={own.litSteps}>
      {steps.map((st, i) => (
        <li key={i} className={i < upto ? own.litOn : ""}>
          <span className={own.litNum}>{i + 1}</span>
          <span>{st}</span>
        </li>
      ))}
    </ol>
  );
}

/** A named card, for two people compared side by side (Ana and Ben). */
export function PersonCard({ name, note = null, children }) {
  return (
    <div className={own.person}>
      <div className={own.personHead}>
        <span className={own.personName}>{name}</span>
        {note ? <span className={own.personNote}>{note}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** One labeled figure inside a card: "Debt 5,000 alUSD". */
export function Fig({ label, value, tone = null }) {
  return (
    <div className={own.fig}>
      <span className={own.figLabel}>{label}</span>
      <span className={`${own.figValue} ${tone === "bad" ? own.bad : ""}`}>{value}</span>
    </div>
  );
}

export function People({ children }) {
  return <div className={own.people}>{children}</div>;
}

/* ── Sizing (lesson 7) ───────────────────────────────────── */

const MAX_LTV = 0.9;

/**
 * The smallest deposit for a cash need, price and loss: the deposit that
 * leaves the Debt at 90% LTV after the loss, as lesson 5 plans. With no loss
 * it is Debt ÷ 0.9, so no separate floor is needed.
 */
export function sizeFor(cash, price, loss) {
  const debt = cash / price;
  const deposit = debt / (MAX_LTV * (1 - loss));
  return { debt, deposit, ltv: deposit > 0 ? debt / deposit : 0 };
}

/** A whole-number LTV that never rounds up past what it is (66.5% reads 66%). */
export const ltvPct = (ltv) => Math.floor(ltv * 100 + 1e-6);

const pct = (x) => `${Math.round(x * 100)}%`;

/**
 * The sizing box: a lesson tool, drawn apart from the app. The cash box
 * (typed, USDC), the price and loss as chips or the loss as a slider, the
 * formula with the numbers filled in, and the result: Deposit, LTV and
 * Health Factor.
 */
export function SizingBox({
  cash, onCash = null, price, loss, onLoss = null, priceWas = null, hold = null,
  title = null, compact = false, cashless = false, lossLabel = "Loss",
}) {
  const s = sizeFor(cash, price, loss);
  const shown = hold ?? s;
  const formulaText = `${money(cash)} ÷ (${price.toFixed(2)} × 90% × (1 − ${pct(loss)})) = ${money(s.deposit)}`;
  return (
    <div className={`${own.sizing} ${compact ? own.sizingCompact : ""}`}>
      {title}
      <div className={own.sizingRow}>
        {cashless ? null : <CashBox cash={cash} onCash={onCash} />}
        <div className={own.chips}>
          <span className={own.chip}>
            Price {priceWas != null ? <s className={own.chipWas}>{priceWas.toFixed(2)}</s> : null}
            <b>{price.toFixed(2)}</b>
          </span>
          {onLoss ? null : <span className={own.chip}>Loss <b>{pct(loss)}</b></span>}
        </div>
      </div>
      {onLoss ? (
        <LessonSlider
          label="Loss" aria={lossLabel} value={Math.round(loss * 100)} display={pct(loss)} min={0} max={70} step={1}
          onChange={(v) => onLoss(v / 100)}
        />
      ) : null}
      <div className={own.sizingFormula}>{hold ? null : formulaText}</div>
      <div className={own.results}>
        <span><em>Deposit</em><b>{money(shown.deposit)}</b></span>
        <span><em>LTV</em><b>{ltvPct(shown.ltv)}%</b></span>
        <span><em>Health Factor</em><b>{(MAX_LTV / shown.ltv).toFixed(2)}</b></span>
      </div>
    </div>
  );
}

/** The sizing box's cash field: typed, in USDC. */
export function CashBox({ cash, onCash = null }) {
  return (
    <label className={own.cashBox}>
      <span className={own.sliderLabel}>Cash</span>
      <span className={own.cashField}>
        <CashInput value={cash} onChange={onCash} />
        <span className={own.cashUnit}>USDC</span>
      </span>
    </label>
  );
}

/**
 * The typed cash box: thousands separators as you type, committed once it
 * reads as a number. Read-only without `onChange`.
 */
function CashInput({ value, onChange }) {
  const fmt = (v) => (v ? Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }) : "");
  const [text, setText] = useState(fmt(value));
  useEffect(() => {
    setText((t) => (Number(t.replace(/,/g, "")) === value ? t : fmt(value)));
  }, [value]);
  return (
    <input
      type="text" inputMode="decimal" className={own.cashInput} value={text}
      readOnly={!onChange} aria-label="Cash, USDC"
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, "");
        if (!/^\d*\.?\d*$/.test(raw)) return;
        const m = /^(\d*)(\.\d*)?$/.exec(raw);
        setText(m[1].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (m[2] ?? ""));
        if (onChange) onChange(Number(raw) || 0);
      }}
    />
  );
}

/** The two buyers under the peg (lesson 6), with their icons. */
export function BuyerCards() {
  const al = useBaseUrl("/img/academy-app/alUSD.svg");
  const usdc = useBaseUrl("/img/academy-app/USDC.svg");
  return (
    <div className={own.people}>
      <div className={own.person}>
        <div className={own.personHead}><span className={own.personName}>Borrower</span></div>
        <div className={own.buyerRow}><img src={usdc} alt="" width="22" height="22" />pays 0.98</div>
        <div className={own.buyerRow}><img src={al} alt="" width="22" height="22" />repays 1.00 of debt</div>
      </div>
      <div className={own.person}>
        <div className={own.personHead}><span className={own.personName}>Fixed Yield depositor</span></div>
        <div className={own.buyerRow}><img src={usdc} alt="" width="22" height="22" />pays 0.98</div>
        <div className={own.buyerRow}><img src={usdc} alt="" width="22" height="22" />claims 1.00 USDC</div>
      </div>
    </div>
  );
}

/**
 * alUSD's price against the peg (lesson 6): a line under 1.00 ending at 0.98,
 * with the peg drawn as a dashed line at 1.00.
 */
export function PegLine() {
  const pts = [1, 0.998, 0.995, 0.992, 0.988, 0.985, 0.982, 0.98, 0.981, 0.98].map((y, i) => ({ x: i, y }));
  const peg = pts.map((p) => ({ x: p.x, y: 1 }));
  return (
    <div className={own.card}>
      <div className={own.cardHead}>alUSD: 0.98 USDC</div>
      <LineChart
        series={[
          { id: "peg", color: "#f5c09a", dashed: true, width: 2, points: peg },
          { id: "price", color: "oklch(0.78 0.15 228)", points: pts },
        ]}
        xMax={9} yMin={0.9} yMax={1.05} yTicks={3} xTicks={1}
        formatY={(v) => v.toFixed(2)} formatX={() => ""}
        markers={[
          { x: 0, y: 1, label: "peg 1.00", color: "#f5c09a" },
          { x: 9, y: 0.98, label: "0.98", color: "oklch(0.78 0.15 228)", below: true },
        ]}
        label="alUSD's price under the peg: 0.98 against 1.00"
      />
    </div>
  );
}
