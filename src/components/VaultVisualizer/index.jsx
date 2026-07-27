import React, { useMemo, useState } from "react";
import styles from "./styles.module.css";
import { projectSeries, computeMetrics } from "./model";

// Illustrative example position. In the dApp these come from your actual
// deposit/borrow; here they are fixed so the projection tells the loan story.
const DEPOSIT = 10000; // USDC collateral
const DEBT = 2000; // alUSD borrowed (20% LTV)
const PROTOCOL_FEE = 0.0025; // borrower redemption fee (live: 0.25%)
const UNDERLYING = "USDC";
const SYNTH = "alUSD";

const LINES = {
  deposit: { label: "Deposit", color: "#34d399", axis: "left" },
  netValue: { label: "Net Value", color: "#60a5fa", axis: "right" },
  debt: { label: "Debt", color: "#f87171", axis: "left" },
};

const W = 720;
const H = 260;
const M = { top: 16, right: 54, bottom: 30, left: 58 };

function niceMax(v) {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function fmtMoney(v) {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtFull(v) {
  return `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function NumberField({ label, value, onChange, step, min, max, hint }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel} title={hint}>
        {label}
      </span>
      <input
        className={styles.fieldInput}
        type="number"
        inputMode="decimal"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function VaultVisualizer() {
  const [yieldPct, setYieldPct] = useState("5");
  const [redemptionPct, setRedemptionPct] = useState("80");
  const [price, setPrice] = useState("0.95");
  const [months, setMonths] = useState("12");
  const [boost, setBoost] = useState(1);
  const [hidden, setHidden] = useState({});

  const y = Math.max(0, parseFloat(yieldPct) || 0) / 100;
  const r = Math.max(0, parseFloat(redemptionPct) || 0) / 100;
  const p = Math.min(1, Math.max(0, parseFloat(price) || 0));
  const mo = Math.min(120, Math.max(1, Math.round(parseFloat(months) || 12)));

  const { points, metrics } = useMemo(() => {
    const pts = projectSeries({
      collateral: DEPOSIT,
      debt: DEBT,
      leverage: boost,
      yieldAnnual: y,
      redemptionAnnual: r,
      months: mo,
      protocolFee: PROTOCOL_FEE,
    });
    return {
      points: pts,
      metrics: computeMetrics({ points: pts, collateral: DEPOSIT, debt: DEBT, leverage: boost, price: p }),
    };
  }, [y, r, p, mo, boost]);

  // Scales
  const px0 = M.left;
  const px1 = W - M.right;
  const py0 = H - M.bottom;
  const py1 = M.top;

  const leftMaxRaw = Math.max(...points.map((d) => Math.max(d.collateral, d.debt)), 1);
  const leftMax = niceMax(leftMaxRaw);
  const netVals = points.map((d) => d.netValue);
  let rMin = Math.min(...netVals);
  let rMax = Math.max(...netVals);
  const pad = (rMax - rMin || rMax || 1) * 0.15;
  rMin -= pad;
  rMax += pad;

  const xOf = (month) => px0 + (month / mo) * (px1 - px0);
  const leftYOf = (v) => py0 - (v / leftMax) * (py0 - py1);
  const rightYOf = (v) => py0 - ((v - rMin) / (rMax - rMin || 1)) * (py0 - py1);

  const pathFor = (key) => {
    const acc = LINES[key].axis === "left" ? leftYOf : rightYOf;
    const valOf =
      key === "deposit" ? (d) => d.collateral : key === "debt" ? (d) => d.debt : (d) => d.netValue;
    return points.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(d.month).toFixed(1)},${acc(valOf(d)).toFixed(1)}`).join(" ");
  };

  const leftTicks = [0, leftMax / 2, leftMax];
  const rightTicks = [rMin + pad, (rMin + rMax) / 2, rMax - pad];
  const xStep = mo <= 6 ? 1 : mo <= 24 ? 2 : Math.ceil(mo / 12);
  const xTicks = [];
  for (let t = 0; t <= mo; t += xStep) xTicks.push(t);

  const toggle = (key) => setHidden((h) => ({ ...h, [key]: !h[key] }));

  return (
    <div className={styles.wrap}>
      {/* Inputs */}
      <div className={styles.inputs}>
        <NumberField label="Yield APY (%)" value={yieldPct} onChange={setYieldPct} step="0.5" min="0"
          hint="The assumed APY earned from collateral deposited into the MYT." />
        <NumberField label="Redemption (%)" value={redemptionPct} onChange={setRedemptionPct} step="5" min="0"
          hint="The assumed yearly rate at which your collateral repays your debt." />
        <NumberField label={`${SYNTH}:${UNDERLYING}`} value={price} onChange={setPrice} step="0.01" min="0" max="1"
          hint="The market price of alUSD. Below 1.00 means a discount when you sell the loan." />
        <NumberField label="Months" value={months} onChange={setMonths} step="1" min="1" max="120"
          hint="The duration in months to track vault performance." />
      </div>

      <div className={styles.boostRow}>
        <span className={styles.fieldLabel} title="Simulates levering up: sell debt for underlying, redeposit, borrow again at the same LTV, and repeat.">
          Boost Multiplier
        </span>
        <input className={styles.slider} type="range" min="1" max="5" step="0.1" value={boost}
          onChange={(e) => setBoost(parseFloat(e.target.value))} />
        <span className={styles.boostVal}>{boost.toFixed(2)}&times;</span>
      </div>

      <div className={styles.scenario}>
        Example position: deposit {fmtFull(DEPOSIT * boost)} {UNDERLYING}, borrow {fmtFull(DEBT * boost)} {SYNTH} (20% LTV)
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(LINES).map(([key, cfg]) => (
          <button key={key} type="button" onClick={() => toggle(key)}
            className={`${styles.chip} ${hidden[key] ? styles.chipOff : ""}`}
            style={hidden[key] ? undefined : { borderColor: cfg.color, color: cfg.color }}>
            <span className={styles.dot} style={{ background: hidden[key] ? "transparent" : cfg.color }} />
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className={styles.chartBox}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
          aria-label="Projected deposit, net value and debt over the loan term">
          {/* gridlines + left axis ticks */}
          {leftTicks.map((v, i) => (
            <g key={`l${i}`}>
              <line x1={px0} x2={px1} y1={leftYOf(v)} y2={leftYOf(v)} className={styles.grid} />
              <text x={px0 - 8} y={leftYOf(v)} className={styles.axisText} textAnchor="end" dominantBaseline="middle">
                {fmtMoney(v)}
              </text>
            </g>
          ))}
          {/* right axis ticks (net value) */}
          {rightTicks.map((v, i) => (
            <text key={`r${i}`} x={px1 + 8} y={rightYOf(v)} className={styles.axisTextRight}
              textAnchor="start" dominantBaseline="middle">
              {fmtMoney(v)}
            </text>
          ))}
          {/* x ticks */}
          {xTicks.map((t) => (
            <text key={`x${t}`} x={xOf(t)} y={py0 + 18} className={styles.axisText} textAnchor="middle">
              {t}
            </text>
          ))}
          <text x={(px0 + px1) / 2} y={H - 2} className={styles.axisUnit} textAnchor="middle">
            months
          </text>

          {/* lines */}
          {Object.entries(LINES).map(([key, cfg]) =>
            hidden[key] ? null : (
              <path key={key} d={pathFor(key)} fill="none" stroke={cfg.color} strokeWidth="2.5"
                strokeLinejoin="round" strokeLinecap="round" />
            )
          )}
        </svg>
      </div>

      {/* Metrics */}
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Loan Cost</span>
          <span className={`${styles.metricVal} ${metrics.costOfLoan > 0 ? styles.neg : ""}`}>
            {fmtFull(metrics.costOfLoan)} {UNDERLYING}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Projected Profit</span>
          <span className={`${styles.metricVal} ${metrics.profit >= 0 ? styles.pos : styles.neg}`}>
            {fmtFull(metrics.profit)} {UNDERLYING} ({metrics.profitPercent >= 0 ? "+" : ""}
            {metrics.profitPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className={styles.warning}>
        <strong>Educational illustration only.</strong> The defaults reflect protocol state as of July 27, 2026
        and will drift over time. For an accurate, position-aware projection, always use the live visualizer in
        the{" "}
        <a href="https://alchemix.fi" target="_blank" rel="noreferrer">
          Alchemix dApp
        </a>
        , which will always be the most accurate if you are looking to build a position.
      </div>

      <div className={styles.note}>
        Deposit and Debt use the left axis; Net Value (deposit minus debt) uses the right. Adjust the inputs to
        explore.
      </div>
    </div>
  );
}
