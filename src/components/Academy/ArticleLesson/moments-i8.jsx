import React, { useEffect, useState } from "react";
import app from "../AppMock/styles.module.css";
import { AppDelta, PracticeVault, VAULT_TILES, useTween } from "../AppMock";
import { LessonControl } from "../kit";
import { useMoment, useMomentNote } from "./position";
import { FoldAway, Stage } from "./index";
import { NOT_READY } from "./moments";
import { Frame, Switch, Tile, Tiles, Tw, Window, f2, pct1, useChanged, useRun } from "./moments-i7";
import own from "./moments-i8.module.css";
import base from "./moments-i7.module.css";

/**
 * The practice moments and figures of intermediate lesson 8 (script I8,
 * "Choosing an LTV, and what happens when the vault loses money"), imported
 * by lessons/intermediate/i8ChoosingAnLtv.mdx. Every page but the
 * self-liquidation runs on figures of its own and leaves the practice wallet
 * as it is; the self-liquidation closes the practice position.
 *
 * The lesson's pages, as of 2026-11-09: 1 LossSlider, 2 LiquidationSteps,
 * 3 FullLiquidationCases, 4 SelfLiquidateMoment, 5 the bad-debt claim
 * (moments-i7's ShortClaimFigure). The full-liquidation page is page 3,
 * "When a liquidation takes the whole loan". LtvPlanner moved to the first
 * page of
 * the sizing lesson (i9SizingALoan.mdx). BadDebtFigure is no longer
 * imported; it is kept so it can come back with a one-line import.
 */

const MAX = 0.9;
const LIQ = 0.95;

/**
 * The health bar, drawn for these figures: the track is the deposit, the
 * fill the debt as a share of it (capped at the track's end), with the MAX
 * LTV and LIQ LTV markers. `point` puts the LTV's point at the fill's end.
 * `max` and `liq` light their marker: true for copper, "bad" for red.
 */
export function HealthBar({ ltv, play, max = false, liq = false, small = false, lit = false, ms = 900 }) {
  // The track is the deposit, as the app's bar is: an LTV at or past 100%
  // fills it.
  const shown = useTween(Math.min(ltv, 1), play, ms);
  const pos = (x) => `${Math.min(Math.max(x, 0), 1) * 100}%`;
  const tone = ltv >= LIQ ? own.fillBad : ltv >= MAX ? own.fillWarn : "";
  return (
    <div className={`${own.bar} ${small ? own.barSmall : ""}`}>
      <div className={`${own.track} ${lit ? own.trackLit : ""}`} role="img" aria-label={`LTV ${pct1(ltv)}, with MAX LTV at 90% and LIQ LTV at 95%`}>
        <span className={`${own.fill} ${tone}`} style={{ width: pos(shown) }} />
        <span className={`${own.mark} ${own.markMax} ${max ? own.markOn : ""}`} style={{ left: pos(MAX) }} />
        <span className={`${own.mark} ${own.markLiq} ${liq === "bad" ? own.markBad : liq ? own.markOn : ""}`} style={{ left: pos(LIQ) }} />
        <span className={`${own.point} ${tone}`} style={{ left: pos(shown) }} />
      </div>
      {small ? null : (
        <div className={own.tags}>
          <span className={`${own.tag} ${max ? own.tagOn : ""}`} style={{ right: `calc(${(1 - MAX) * 100}% + 0.5rem)` }}>
            MAX LTV
          </span>
          <span className={`${own.tag} ${own.tagLow} ${liq === "bad" ? own.tagBad : liq ? own.tagOn : ""}`} style={{ right: 0 }}>
            LIQ LTV
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Page 1: what a loss does to your LTV ────────────────── */

const DEP = 10_000;
const STARTS = [0.3, 0.5, 0.7];
/** The loss that brings a starting LTV to `line`. */
const lossTo = (start, line) => 1 - start / line;

/**
 * "Drag the Loss slider until LTV reaches the LIQ LTV marker at 95%. Then
 * pick another starting LTV and do it again." A what-if copy of a position
 * on a 10,000 deposit, at 30%, 50% or 70%: Deposit falls with the loss, Debt
 * stays, and LTV's point moves along the health bar. Reaching 95% from two
 * starting LTVs is the moment. The practice wallet does not change.
 */
export function LossSlider() {
  const m = useMoment("loss");
  const [start, setStart] = useState(0.5);
  const [loss, setLoss] = useState(0);
  const [reached, setReached] = useState(m.done ? [0.5, 0.3] : []);
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    if (m.done && reached.length < 2) setReached([0.5, 0.3]);
  }, [m.done, reached.length]);
  const debt = DEP * start;
  const to95 = lossTo(start, LIQ);
  // Within 0.2 points of the loss that reaches 95%, the readout snaps to it.
  const snapped = Math.abs(loss - to95 * 100) < 0.2;
  const l = snapped ? to95 : loss / 100;
  const deposit = DEP * (1 - l);
  const ltv = snapped ? LIQ : debt / deposit;
  const atMax = ltv >= MAX - 1e-9;
  const atLiq = ltv >= LIQ - 1e-9;
  const here = reached.includes(start);
  const need = reached.length === 0 ? "Drag Loss until LTV reaches 95%" : reached.length === 1 && here ? "Pick another starting LTV" : reached.length === 1 ? "Drag Loss until LTV reaches 95%" : null;
  useMomentNote("loss", m.ready ? need : null);
  const slide = (v) => {
    setLoss(v);
    setMoving(true);
    const s = Math.abs(v - to95 * 100) < 0.2;
    const r = s ? LIQ : debt / (DEP * (1 - v / 100));
    if (m.ready && r >= LIQ - 1e-9 && !reached.includes(start)) {
      const next = [...reached, start];
      setReached(next);
      if (next.length >= 2) window.setTimeout(() => m.apply({ ...m.position }), 900);
    }
  };
  return (
    <Stage>
      <Frame title="What if" label="a what-if position on the vault">
        <div className={own.chips} role="group" aria-label="Starting LTV">
          <span className={own.chipsLabel}>Starting LTV</span>
          {STARTS.map((s) => (
            <button
              key={s}
              type="button"
              className={`${own.chip} ${s === start ? own.chipOn : ""} ${reached.includes(s) ? own.chipDone : ""}`}
              aria-pressed={s === start}
              disabled={!m.ready && !m.done}
              onClick={() => {
                setStart(s);
                setLoss(0);
                setMoving(false);
              }}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>
        <Tiles n={3}>
          <Tile label="Deposit" lit={moving} stat="deposit">
            {f2(deposit)} USDC
          </Tile>
          <Tile label="Debt" stat="debt">
            {f2(debt)} alUSD
          </Tile>
          <Tile label="LTV" lit={moving} stat="ltv" tone={atLiq ? "bad" : null}>
            {pct1(ltv)}
          </Tile>
        </Tiles>
        <HealthBar ltv={ltv} play={0} max={atMax} liq={atLiq ? "bad" : false} />
        <div className={own.stateChips}>
          <span className={own.greyChip} style={{ visibility: atMax ? "visible" : "hidden" }}>
            Borrowing stops
          </span>
          <span className={own.greyChip} style={{ visibility: atMax ? "visible" : "hidden" }}>
            Withdrawing stops
          </span>
          <span className={own.redChip} style={{ visibility: atLiq ? "visible" : "hidden" }}>
            Can be liquidated
          </span>
        </div>
        <div className={own.lossSlider}>
          <div className={base.sliderHead}>
            <span className={base.sliderLabel}>Loss</span>
            <span className={base.sliderValue}>{(Math.round(l * 1000) / 10).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            className={base.range}
            min={0}
            max={80}
            step={0.1}
            value={loss}
            aria-label="Loss"
            aria-valuetext={`${(Math.round(l * 1000) / 10).toFixed(1)}%`}
            disabled={!m.ready && !m.done}
            style={{ "--fill": `${(loss / 80) * 100}%` }}
            onChange={(e) => slide(Number(e.target.value))}
          />
          <div className={base.ticks}>
            <span>0%</span>
            <span>80%</span>
          </div>
        </div>
      </Frame>
    </Stage>
  );
}
LossSlider.moment = "loss";
LossSlider.hint = "Reach 95% from a second starting LTV";

/* ── The sizing lesson's page 1: choosing an LTV for the loss you plan for ── */

const PLANS = [
  { key: "20", label: "20%", loss: 0.2 },
  { key: "40", label: "40%", loss: 0.4 },
  { key: "59", label: "In use today: 59.08%", loss: 0.5908 },
  { key: "70", label: "Ethereum caps: 70%", loss: 0.7 },
];

/**
 * "Press each planned loss and read the LTV it allows." Four planned losses;
 * each fills in the two formulas: the highest starting LTV that lands at 90%
 * after it, and what the loss does to a loan opened at 50%, with a small
 * health bar. Done once all four are pressed. The practice wallet does not
 * change. Since 2026-11-09 it sits on the first page of the intermediate
 * track's last lesson (lessons/intermediate/i9SizingALoan.mdx), where the
 * learner has no loan yet, so its second row reads "A 50% loan".
 */
export function LtvPlanner() {
  const m = useMoment("plan");
  const [pick, setPick] = useState(null);
  const [seen, setSeen] = useState(m.done ? PLANS.map((p) => p.key) : []);
  const [play, setPlay] = useState(0);
  useEffect(() => {
    if (m.done && seen.length < PLANS.length) setSeen(PLANS.map((p) => p.key));
  }, [m.done, seen.length]);
  const plan = PLANS.find((p) => p.key === pick) ?? null;
  const highest = plan ? MAX * (1 - plan.loss) : 0;
  const yours = plan ? 0.5 / (1 - plan.loss) : 0.5;
  const left = PLANS.length - seen.length;
  useMomentNote("plan", m.ready && seen.length > 0 && left > 0 ? `Press the other ${left === 1 ? "planned loss" : `${left} planned losses`}` : null);
  const w1 = useChanged(pick, play);
  const shownHigh = useTween(highest, play, 500);
  const shownYours = useTween(yours, play, 500);
  const press = (k) => {
    setPick(k);
    setPlay((x) => x + 1);
    if (!seen.includes(k)) {
      const next = [...seen, k];
      setSeen(next);
      if (m.ready && next.length === PLANS.length) window.setTimeout(() => m.apply({ ...m.position }), 900);
    }
  };
  const share = plan ? (1 - plan.loss).toFixed(plan.key === "59" ? 4 : 2) : "?";
  const tone = yours >= LIQ ? "bad" : yours >= MAX ? "warn" : null;
  return (
    <Stage>
      <Frame title="Choosing an LTV" tag="Planner" label="a planner for the LTV a loss allows">
        <div className={own.chips} role="group" aria-label="Planned loss">
          <span className={own.chipsLabel}>Planned loss</span>
          {PLANS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`${own.chip} ${p.key === pick ? own.chipOn : ""} ${seen.includes(p.key) ? own.chipDone : ""}`}
              aria-pressed={p.key === pick}
              disabled={!m.ready && !m.done}
              onClick={() => press(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={own.readouts}>
          <div className={`${own.readout} ${plan ? base.rowLit : ""}`}>
            {w1 ? <span key={w1} className={app.wash} aria-hidden="true" /> : null}
            <div className={own.formula}>Highest starting LTV = 90% x (1 - loss)</div>
            <div className={own.worked}>
              {plan ? (
                <>
                  90% x {share} = <b>{(shownHigh * 100).toFixed(1)}%</b>
                </>
              ) : (
                <b className={own.blank}>&ndash;</b>
              )}
            </div>
          </div>
          <div className={`${own.readout} ${plan ? base.rowLit : ""}`}>
            {w1 ? <span key={w1} className={app.wash} aria-hidden="true" /> : null}
            <div className={own.formula}>A 50% loan after this loss = 50% / (1 - loss)</div>
            <div className={own.worked}>
              {plan ? (
                <>
                  50% / {share} ={" "}
                  <b className={tone === "bad" ? own.textBad : tone === "warn" ? own.textWarn : ""}>{(shownYours * 100).toFixed(1)}%</b>
                </>
              ) : (
                <b className={own.blank}>&ndash;</b>
              )}
            </div>
            <HealthBar ltv={plan ? yours : 0.5} play={play} small ms={500} max={yours >= MAX} liq={yours >= LIQ ? "bad" : false} />
            <div className={own.readoutChip}>
              <span className={own.redChip} style={{ visibility: plan && yours > 1 ? "visible" : "hidden" }}>
                Debt above deposit
              </span>
            </div>
          </div>
        </div>
      </Frame>
    </Stage>
  );
}
LtvPlanner.moment = "plan";
LtvPlanner.hint = "Press all four";

/* ── Page 2: what a liquidation takes ────────────────────── */

/** Each state of the liquidation; `chips` are what left the position in this step. */
const L0 = { d: 5200, b: 5000, e: 208, lit: [], chips: [], check: null };
const LIQ_STEPS = [
  {
    caption: "Earmarked debt is settled first",
    states: [
      { ...L0, e: 0, lit: ["e"] },
      { ...L0, e: 0, b: 4792, lit: ["b"] },
      { ...L0, e: 0, b: 4792, d: 4991.48, lit: ["d"], chips: [["208 to the Transmuter"], ["0.52 redemption fee"]] },
      { ...L0, e: 0, b: 4792, d: 4991.48, lit: ["ltv"], chips: [["208 to the Transmuter"], ["0.52 redemption fee"], ["Liquidator: 0"]] },
      { ...L0, e: 0, b: 4792, d: 4991.48, lit: ["ltv"], chips: [["208 to the Transmuter"], ["0.52 redemption fee"], ["Liquidator: 0"]], check: true },
    ],
  },
  {
    caption: "Collateral is seized to bring the position to 90%",
    states: [
      { ...L0, e: 0, b: 4792, d: 1964.88, lit: ["d"], chips: [["3,023.61 to the Transmuter"], ["2.99 liquidator fee", "bad"]] },
      { ...L0, e: 0, b: 1768.39, d: 1964.88, lit: ["b"], chips: [["3,023.61 to the Transmuter"], ["2.99 liquidator fee", "bad"]] },
      { ...L0, e: 0, b: 1768.39, d: 1964.88, lit: ["ltv"], chips: [["3,023.61 to the Transmuter"], ["2.99 liquidator fee", "bad"]], max: true },
    ],
  },
  {
    caption: "What the position kept",
    states: [{ ...L0, e: 0, b: 1768.39, d: 1964.88, lit: ["kept"], chips: [["Redemption fee 0.52"], ["Liquidator fee 2.99"]], max: true, kept: true }],
  },
];

/**
 * "Step through the liquidation." One figure, apart from the practice
 * wallet: a position at 5,200 against 5,000 with 208 earmarked, past 95%. A
 * Next step control steps through the two steps of a liquidation and what
 * the position kept; within a step, figures change in order, 700 ms apart,
 * each lit as it moves.
 */
export function LiquidationSteps() {
  const m = useMoment("liq");
  const [step, setStep] = useState(m.done ? 3 : 0);
  const [sub, setSub] = useState(m.done ? 0 : -1);
  const [play, setPlay] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (m.done && step === 0) {
      setStep(3);
      setSub(0);
    }
  }, [m.done, step]);
  const s = step === 0 ? L0 : LIQ_STEPS[step - 1].states[Math.max(sub, 0)];
  const ltv = s.b / s.d;
  const lit = (k) => s.lit.includes(k);
  const wD = useChanged(s.d, play);
  const wB = useChanged(s.b, play);
  const wE = useChanged(s.e, play);
  const wL = useChanged(Math.round(ltv * 1000), play);
  const next = () => {
    const n = step + 1;
    const states = LIQ_STEPS[n - 1].states;
    setStep(n);
    setSub(0);
    setPlay((x) => x + 1);
    setBusy(true);
    states.slice(1).forEach((_, i) =>
      window.setTimeout(() => {
        setSub(i + 1);
        setPlay((x) => x + 1);
      }, (i + 1) * 700),
    );
    window.setTimeout(() => {
      setBusy(false);
      if (n === 3) m.apply({ ...m.position });
    }, states.length * 700 + 300);
  };
  return (
    <>
    <Stage>
      <Frame title="Risk-adjusted Mix USDC" tag="What if" label="a liquidation on a what-if position">
        <div className={own.caption} aria-live="polite">
          {step > 0 ? (
            <>
              <span className={base.cycleNum}>{step}</span>
              <span>{LIQ_STEPS[step - 1].caption}</span>
            </>
          ) : null}
        </div>
        <Tiles n={4}>
          <Tile label="Deposit" lit={lit("d")} washKey={wD}>
            <Tw value={s.d} play={play} /> USDC
          </Tile>
          <Tile label="Debt" lit={lit("b")} washKey={wB}>
            <Tw value={s.b} play={play} /> alUSD
          </Tile>
          <Tile label="Earmarked" lit={lit("e")} washKey={wE}>
            <Tw value={s.e} play={play} /> alUSD
          </Tile>
          <Tile label="LTV" lit={lit("ltv")} washKey={wL} tone={ltv >= LIQ ? "bad" : null}>
            <Tw value={ltv} play={play} fmt={pct1} />
          </Tile>
        </Tiles>
        <HealthBar ltv={ltv} play={play} max={Boolean(s.max)} liq={ltv >= LIQ ? "bad" : false} ms={700} />
        <div className={own.outRow}>
          <div className={own.outChips}>
            {s.chips.map(([text, t]) => (
              <AppDelta key={text} tone={t}>
                {text}
              </AppDelta>
            ))}
          </div>
          <span className={own.redChip} style={{ visibility: s.check ? "visible" : "hidden" }}>
            LTV still 95% or over, so step 2 runs
          </span>
        </div>
        <div className={`${own.kept} ${s.kept ? base.rowLit : ""}`} style={{ visibility: s.kept ? "visible" : "hidden" }} aria-hidden={s.kept ? undefined : true}>
          <span>
            Deposit minus Debt: <b>200.00</b> to <b>196.49</b>
          </span>
          <span className={own.keptNote}>The cash you borrowed, or what you bought with it, is still yours</span>
        </div>
      </Frame>
    </Stage>
      {/* Folds away after the last step, so what is under the figure slides
          up. After the stage, not inside it, for the reason given at
          PegCycle's control in moments-i7. */}
      <FoldAway show={step < 3}>
        <LessonControl disabled={!m.ready || busy} hint={m.ready || m.done ? null : NOT_READY} onClick={next}>
          Next step
        </LessonControl>
      </FoldAway>
    </>
  );
}
LiquidationSteps.moment = "liq";
LiquidationSteps.hint = "Step through to the end";

/* ── Page 3: when a liquidation takes the whole loan ─────── */

const CASES = {
  debt: {
    button: "Debt reaches the deposit",
    start: { d: 4900, b: 5000, e: 208, chips: [] },
    steps: [
      { d: 4691.48, b: 4792, e: 0, chips: [["208 to the Transmuter"], ["0.52 redemption fee"]], lit: ["d", "b", "e"] },
      { d: 0, b: 100.52, e: 0, chips: [["4,691.48 to the Transmuter"]], lit: ["d", "b"] },
      { d: 0, b: 0, e: 0, chips: [["100.52 alUSD left unbacked", "warn"]], lit: ["b"] },
    ],
    close: "Deposit minus Debt: -100.00 to 0.00",
  },
  vault: {
    button: "Vault below its minimum",
    start: { d: 5200, b: 5000, e: 208, chips: [], vault: true },
    steps: [
      { d: 4991.48, b: 4792, e: 0, chips: [["208 to the Transmuter"], ["0.52 redemption fee"]], lit: ["d", "b", "e"], vault: true },
      { d: 199.48, b: 0, e: 0, chips: [["4,792 to the Transmuter"]], lit: ["d", "b"], vault: true },
    ],
    close: "Deposit minus Debt: 200.00 to 199.48",
  },
};

/** The liquidator's fee in both cases: 1.5% of the 4,792 of debt left once the earmarked 208 is settled. */
const FULL_FEE = 4792 * 0.015;

/**
 * Page 3, "When a liquidation takes the whole loan": "Press each case to
 * step through what it does to the position." Two buttons, each playing its
 * case on the same figures, 900 ms apart, with the fee from the fee vault at
 * the end and a closing line for each case under the figures. While a case
 * plays, both buttons are switched off and the one playing stays lit. Every
 * part that comes later holds its place from the start, so nothing moves
 * while a case plays. Done once both have played. The practice wallet does
 * not change.
 */
export function FullLiquidationCases() {
  const m = useMoment("full");
  const [which, setWhich] = useState(m.done ? "vault" : null);
  const [at, setAt] = useState(m.done ? CASES.vault.steps.length + 1 : 0);
  const [played, setPlayed] = useState(m.done ? ["debt", "vault"] : []);
  const [play, setPlay] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (m.done && !which) {
      setWhich("vault");
      setAt(CASES.vault.steps.length + 1);
      setPlayed(["debt", "vault"]);
    }
  }, [m.done, which]);
  const c = which ? CASES[which] : null;
  const s = !c ? { d: 0, b: 0, e: 0, chips: [] } : at === 0 ? c.start : c.steps[Math.min(at, c.steps.length) - 1];
  const fee = c && at > c.steps.length;
  const ltv = s.d > 0 ? s.b / s.d : null;
  const lit = (k) => (s.lit ?? []).includes(k);
  const wD = useChanged(s.d, play);
  const wB = useChanged(s.b, play);
  const wE = useChanged(s.e, play);
  const left = ["debt", "vault"].filter((k) => !played.includes(k));
  useMomentNote("full", m.ready && played.length === 1 && !busy ? `Press ${CASES[left[0]].button}` : null);
  const run = (k) => {
    const cs = CASES[k];
    setWhich(k);
    setAt(0);
    setBusy(true);
    setPlay((x) => x + 1);
    for (let i = 1; i <= cs.steps.length + 1; i++) {
      window.setTimeout(() => {
        setAt(i);
        setPlay((x) => x + 1);
      }, i * 900);
    }
    window.setTimeout(() => {
      setBusy(false);
      setPlayed((p) => {
        const next = p.includes(k) ? p : [...p, k];
        if (m.ready && next.length === 2) window.setTimeout(() => m.apply({ ...m.position }), 400);
        return next;
      });
    }, (cs.steps.length + 2) * 900);
  };
  return (
    <Stage>
      <Frame title="Risk-adjusted Mix USDC" tag="What if" label="two full liquidations on a what-if position">
        <div className={own.caseButtons}>
          {Object.entries(CASES).map(([k, cs]) => (
            <button
              key={k}
              type="button"
              className={`${own.chip} ${which === k ? own.chipOn : ""} ${busy && which === k ? own.chipPlaying : ""} ${played.includes(k) ? own.chipDone : ""}`}
              aria-pressed={which === k}
              disabled={(!m.ready && !m.done) || busy}
              onClick={() => run(k)}
            >
              {cs.button}
            </button>
          ))}
        </div>
        <div className={own.vaultChipRow}>
          <span className={own.warnChip} style={{ visibility: c && s.vault ? "visible" : "hidden" }}>
            Vault: total debt is 95% of its MYT
          </span>
        </div>
        <Tiles n={4}>
          <Tile label="Deposit" lit={lit("d")} washKey={wD} dim={!c}>
            {c ? (
              <>
                <Tw value={s.d} play={play} /> USDC
              </>
            ) : (
              "-"
            )}
          </Tile>
          <Tile label="Debt" lit={lit("b")} washKey={wB} dim={!c}>
            {c ? (
              <>
                <Tw value={s.b} play={play} /> alUSD
              </>
            ) : (
              "-"
            )}
          </Tile>
          <Tile label="Earmarked" lit={lit("e")} washKey={wE} dim={!c}>
            {c ? (
              <>
                <Tw value={s.e} play={play} /> alUSD
              </>
            ) : (
              "-"
            )}
          </Tile>
          <Tile label="LTV" dim={!c} tone={ltv != null && ltv >= LIQ ? "bad" : null}>
            {c && ltv != null ? pct1(ltv) : c && s.b === 0 ? "0.0%" : "-"}
          </Tile>
        </Tiles>
        <div className={own.outRow}>
          <div className={own.outChips}>
            {s.chips.map(([text, t]) =>
              t === "warn" ? (
                <span key={text} className={own.warnChip}>
                  {text}
                </span>
              ) : (
                <AppDelta key={text} tone={t}>
                  {text}
                </AppDelta>
              ),
            )}
          </div>
          <span className={`${own.greyChip} ${own.feeChip}`} style={{ visibility: fee ? "visible" : "hidden" }}>
            Liquidator fee {f2(FULL_FEE)} (1.5% of 4,792), from the fee vault
          </span>
        </div>
        <div className={own.closes}>
          {Object.entries(CASES).map(([k, cs]) => (
            <div key={k} className={`${own.close} ${which === k && fee ? base.rowLit : ""}`} style={{ visibility: played.includes(k) || (which === k && fee) ? "visible" : "hidden" }}>
              <span className={own.closeName}>{cs.button}</span>
              <span>{cs.close}</span>
            </div>
          ))}
        </div>
      </Frame>
    </Stage>
  );
}
FullLiquidationCases.moment = "full";
FullLiquidationCases.hint = "Press both cases";

/* ── Page 4: closing the loan yourself ───────────────────── */

const FEE = 0.0025;
/** The lesson's example MYT price, 1.25 USDC per MYT, for the MYT path. */
const MYT_PRICE = 1.25;
const TAUGHT = [...VAULT_TILES, "max", "liq"];

/**
 * "On the Liquidate tab, press Self Liquidate." then "Press Confirm Self
 * Liquidate." The practice vault on the Liquidate tab with the position from
 * the practice wallet. Self Liquidate opens the app's confirmation window in
 * the panel, its rows lit top to bottom; Confirm closes it and plays the
 * self-liquidation on the stats, then writes the practice wallet.
 */
export function SelfLiquidateMoment() {
  const open = useMoment("self-open");
  const conf = useMoment("self-confirm");
  const p = open.position;
  const [win, setWin] = useState(false);
  const [row, setRow] = useState(-1);
  const [usdc, setUsdc] = useState(true);
  const fee = (p.earmarked ?? 0) * FEE;
  const states = [
    { deposit: p.deposit, debt: p.debt, earmarked: p.earmarked ?? 0 },
    { deposit: p.deposit - (p.earmarked ?? 0) - fee, debt: p.debt - (p.earmarked ?? 0), earmarked: 0 },
    { deposit: p.deposit - p.debt - fee, debt: 0, earmarked: 0 },
    { deposit: 0, debt: 0, earmarked: 0 },
  ];
  const [S] = useState(() => states);
  const run = useRun({
    count: 3,
    gap: 1300,
    done: conf.done,
    // With Receive USDC on liquidation off, what is left comes as MYT, at the
    // lesson's example price of 1.25 USDC per MYT (the strip lists it as mixUSDC).
    onDone: () => {
      const left = S[0].deposit - S[0].debt - fee;
      const paid = usdc
        ? { wallet: (conf.position.wallet ?? 0) + left }
        : { walletMyt: Math.round(((conf.position.walletMyt ?? 0) + left / MYT_PRICE) * 100) / 100 };
      conf.apply({ ...conf.position, deposit: 0, debt: 0, earmarked: 0, ...paid });
    },
  });
  // `ran` is this visit's run: a lesson reloaded with the moment done shows
  // the closed position with no chips and nothing played.
  const [ran, setRan] = useState(false);
  const shown = ran ? S[run.at] : conf.done ? S[3] : S[0];
  // Each step's chips show what that step changed; the last one shows the
  // whole change from the open position (Deposit -10,000, Borrowable -4,000).
  const prev = ran && run.at > 0 ? (run.at === 3 ? S[0] : S[run.at - 1]) : conf.done ? null : undefined;
  const openWindow = () => {
    setWin(true);
    setRow(0);
    for (let i = 1; i < 5; i++) window.setTimeout(() => setRow(i), i * 1200);
    if (!open.done) open.apply({ ...open.position });
  };
  const confirm = () => {
    setWin(false);
    setRan(true);
    window.setTimeout(() => run.start(), 500);
  };
  const cleared = conf.done || run.at > 0;
  const back = S[0].deposit - S[0].debt - fee;
  const lit = cleared ? (run.at === 1 ? ["debt", "earmarked"] : run.at === 2 ? ["debt"] : ["deposit"]) : ["deposit", "debt", "earmarked", "ltv"];
  const windowEl = (
    <Window inPanel title="Confirm Self Liquidation" description="This will use your deposited collateral to pay off your entire debt. This action cannot be undone.">
      <div className={own.confirmRows}>
        <ConfirmRow label="Collateral" on={row === 0}>
          {f2(S[0].deposit)} USDC
        </ConfirmRow>
        <ConfirmRow label="Debt to repay" on={row === 1}>
          {f2(S[0].debt)} alUSD
        </ConfirmRow>
        <ConfirmRow label="Earmarked (cleared)" on={row === 2}>
          {f2(S[0].earmarked)} alUSD
        </ConfirmRow>
        <ConfirmRow label="Protocol fee on earmarked" on={row === 3}>
          ~{f2(fee)} USDC
        </ConfirmRow>
        <div className={`${own.returnRow} ${row >= 4 ? base.rowLit : ""}`}>
          <div className={own.confirmRow}>
            <b>Estimated return</b>
            <b className={app.good}>~{f2(back)} USDC</b>
          </div>
          <div className={own.returnAs}>{usdc ? "Returned as USDC" : "Returned as MYT (redeemable for USDC)"}</div>
        </div>
      </div>
      <Switch on={usdc} onChange={setUsdc} label="Receive USDC on liquidation" />
      <div className={own.confirmActions}>
        <button type="button" className={own.cancel} onClick={() => setWin(false)}>
          Cancel
        </button>
        <button type="button" className={own.danger} disabled={!conf.ready} onClick={confirm}>
          Confirm Self Liquidate
        </button>
      </div>
    </Window>
  );
  // The app's confirmation is a dialog over the page: here it opens over the
  // practice vault, so the vault keeps its size (and its zoom) as it opens.
  return (
    <Stage>
      <div className={own.dialogHost}>
        <PracticeVault
          apr={0.05}
          redemptionRate={0.5}
          deposit={shown.deposit}
          debt={shown.debt}
          earmarked={shown.earmarked}
          taught={TAUGHT}
          lit={lit}
          prev={prev}
          chipDigits={2}
          tab="Liquidate"
          wash
        >
          {cleared ? (
            <div className={own.infoCard}>
              <div className={own.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>Nothing to liquidate</span>
              </div>
              <div>You have no active debt position to self liquidate.</div>
            </div>
          ) : (
            <div className={own.dangerCard}>
              <div className={own.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
                </svg>
                <span>Danger Zone</span>
              </div>
              <div>Self liquidation allows you to use your deposited collateral to pay off your entire debt. This action will burn your collateral to clear your debt position.</div>
            </div>
          )}
          <div>
            <button
              type="button"
              className={cleared ? own.quiet : own.danger}
              disabled={cleared || win || !(open.ready || open.done)}
              title={!open.ready && !open.done ? NOT_READY : undefined}
              onClick={openWindow}
            >
              {conf.done || run.at === 3 ? "Self Liquidated" : "Self Liquidate"}
            </button>
          </div>
        </PracticeVault>
        {win ? <div className={own.dialog}>{windowEl}</div> : null}
      </div>
    </Stage>
  );
}
SelfLiquidateMoment.moment = "self-open";
SelfLiquidateMoment.hint = "Press Self Liquidate";

function ConfirmRow({ label, on, children }) {
  return (
    <div className={`${own.confirmRow} ${on ? base.rowLit : ""}`}>
      <span className={own.confirmLabel}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

/* ── Not in use (page 5 runs on moments-i7's ShortClaimFigure): if losses outrun liquidations ── */


const ACTIONS = [
  { key: "deposit", label: "Deposit", stops: true },
  { key: "borrow", label: "Borrow", stops: true },
  { key: "withdraw", label: "Withdraw" },
  { key: "repay", label: "Repay" },
  { key: "liquidate", label: "Liquidate" },
];

/**
 * "Press Losses outrun liquidations." The vault's alUSD issued against its
 * backing, on one scale, and the five actions: the backing shrinks under the
 * alUSD issued, then Deposit and Borrow are rejected and the rest still
 * work, then a Fixed Yield claim's reduced share appears, 1 s apart. The
 * practice wallet does not change.
 */
export function BadDebtFigure() {
  const m = useMoment("bad-debt");
  const run = useRun({ count: 4, gap: 1000, done: m.done, onDone: () => m.apply({ ...m.position }) });
  const s = run.at;
  const backing = s >= 1 ? 0.9 : 1.18;
  return (
    <Stage>
      <Frame title="Risk-adjusted Mix USDC" tag="What if" label="a vault in bad debt, as a what-if">
        <div className={own.bars}>
          <div className={own.barLine}>
            <span className={own.barName}>alUSD issued</span>
            <span className={own.barTrack}>
              <i className={own.issued} style={{ width: `${(1 / 1.2) * 100}%` }} />
            </span>
          </div>
          <div className={own.barLine}>
            <span className={own.barName}>Backing: collateral + Transmuter MYT</span>
            <span className={`${own.barTrack} ${s >= 1 ? base.rowLit : ""}`}>
              <i className={own.backing} style={{ width: `${(backing / 1.2) * 100}%` }} />
            </span>
          </div>
          <div className={`${own.backLabel} ${s >= 1 ? own.textWarn : ""}`}>{s >= 1 ? "Bad debt: backing covers 90%" : "Backed"}</div>
        </div>
        <div className={own.actions}>
          {ACTIONS.map((a) => {
            const shownState = a.stops ? s >= 2 : s >= 3;
            return (
              <span key={a.key} className={`${own.action} ${shownState ? (a.stops ? own.actionNo : own.actionYes) : ""}`}>
                {a.label}
                <small style={{ visibility: shownState ? "visible" : "hidden" }}>{a.stops ? "Rejected" : "Still works"}</small>
              </span>
            );
          })}
          <span className={`${own.action} ${own.actionWarn}`} style={{ visibility: s >= 4 ? "visible" : "hidden" }} aria-hidden={s >= 4 ? undefined : true}>
            Fixed Yield claim: 0.90 USDC per alUSD
          </span>
        </div>
      </Frame>
      {run.at || m.done ? null : (
        <LessonControl disabled={!m.ready} hint={m.ready || m.done ? null : NOT_READY} onClick={() => run.start()}>
          Losses outrun liquidations
        </LessonControl>
      )}
    </Stage>
  );
}
BadDebtFigure.moment = "bad-debt";
BadDebtFigure.hint = "Press Losses outrun liquidations";

