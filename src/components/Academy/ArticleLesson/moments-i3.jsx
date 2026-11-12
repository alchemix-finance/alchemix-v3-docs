import React, { useEffect, useState } from "react";
import app from "../AppMock/styles.module.css";
import css from "./moments-i3.module.css";
import { AppButton, AppInput, AppPanel, AppTabs, VAULT_NAME, VAULT_TABS, useAppContext } from "../AppMock";
import { useMoment, useMomentNote } from "./position";
import { Stage } from "./index";
import { NOT_READY } from "./moments";
import { HealthBar, PracticeFrame, SHOW, Tile, Tiles, trunc, useRunner } from "./moments-i1";

/**
 * The practice figures of intermediate lesson 3 (script I3, "Reading your
 * position: Health Factor and the 90% to 95% band"), imported by
 * lessons/intermediate/i3ReadingYourPosition.mdx. Moments, in page order:
 * hf-slider, preview, borrow, currency, repay-alusd, repay-usdc.
 *
 * The stat tiles print figures as the app does, cut to two decimals
 * (`formatNumber`, "trunc"): Health Factor 1.2857 reads 1.28 and 0.977 reads
 * 0.97, as the lesson text says. The practice vault's own tiles round, so
 * this lesson draws its own (moments-i1.jsx `Tile`).
 */

const CAP = 0.9;
const AL_PRICE = 0.98;
const FRAME = { title: VAULT_NAME, sub: "Ethereum", icon: "USDC" };

const hfOf = (deposit, debt) => (debt > 0 ? (CAP * deposit) / debt : Infinity);
const roomOf = (deposit, debt) => Math.max(deposit * CAP - debt, 0);

/** The six position tiles the lesson reads, in the app's order. */
function PositionTiles({ p, ahead = null, prev = null, play, lit = [], show = {}, notes = {} }) {
  const chipAmount = (now, was, unit) =>
    was == null || Math.abs(now - was) < 0.005 ? null : { text: `${now > was ? "+" : "-"}${trunc(Math.abs(now - was))} ${unit}` };
  const chipWas = (now, was, f) => (was == null || Math.abs(now - was) < 0.0005 ? null : { text: `was ${f(was)}` });
  const ltv = (p.debt / p.deposit) * 100;
  const pltv = prev ? (prev.debt / prev.deposit) * 100 : null;
  const a = ahead ? { ...p, ...ahead } : null;
  return (
    <Tiles per={3}>
      <Tile k="deposit" label="Deposit" value={p.deposit} show={show.deposit ?? SHOW.usdc} play={play} lit={lit.includes("deposit")} ahead={a ? a.deposit : null} chip={prev ? chipAmount(p.deposit, prev.deposit, "USDC") : null} note={notes.deposit} />
      <Tile k="debt" label="Debt" value={p.debt} show={show.debt ?? SHOW.al} play={play} invert lit={lit.includes("debt")} ahead={a ? a.debt : null} chip={prev ? chipAmount(p.debt, prev.debt, "alUSD") : null} note={notes.debt} />
      <Tile k="health" label="Health Factor" value={hfOf(p.deposit, p.debt)} show={SHOW.hf} play={play} lit={lit.includes("health")} ahead={a ? hfOf(a.deposit, a.debt) : null} chip={prev ? chipWas(hfOf(p.deposit, p.debt), hfOf(prev.deposit, prev.debt), (v) => trunc(v)) : null} note={notes.health} />
      <Tile k="earmarked" label="Earmarked" value={p.earmarked ?? 0} show={show.earmarked ?? SHOW.al} play={play} invert lit={lit.includes("earmarked")} note={notes.earmarked} />
      <Tile k="borrowable" label="Borrowable" value={roomOf(p.deposit, p.debt)} show={show.borrowable ?? SHOW.al} play={play} lit={lit.includes("borrowable")} ahead={a ? roomOf(a.deposit, a.debt) : null} chip={prev ? chipAmount(roomOf(p.deposit, p.debt), roomOf(prev.deposit, prev.debt), "alUSD") : null} note={notes.borrowable} />
      <Tile k="ltv" label="LTV" value={ltv} show={SHOW.ltv} play={play} invert lit={lit.includes("ltv")} ahead={a ? (a.debt / a.deposit) * 100 : null} chip={pltv != null ? chipWas(ltv, pltv, (v) => `${trunc(v)}%`) : null} note={notes.ltv} />
    </Tiles>
  );
}

/* ── Page 1: Health Factor ───────────────────────────────── */

function band(ltv) {
  if (ltv < 90) return "Under 90%: borrowing and withdrawals open";
  if (ltv === 90) return "At 90%: Borrowable and Available read 0";
  if (ltv < 95) return "90% to 95%: no liquidation, no new borrowing or withdrawals";
  return "95% or more: can be liquidated";
}

/**
 * "Drag it until Health Factor reads 1.00." A what-if on a copy of the
 * position: LTV, Health Factor and the loss the deposit could take before
 * 90%, over the health bar and a band label, with an LTV slider from 10% to
 * 97% (1% steps, marks at 90% and 95%). The figures follow the slider. The
 * moment is done the first time Health Factor reads 1.00 or less.
 */
export function HealthFactorFigure() {
  const m = useMoment("hf-slider");
  const { stat } = useAppContext();
  const [ltv, setLtv] = useState(50);
  useEffect(() => {
    if (m.done) setLtv((l) => (l < 90 ? 90 : l));
  }, [m.done]);
  const hf = CAP / (ltv / 100);
  const loss = ltv < 90 ? `${Math.floor((1 - ltv / 90) * 100 + 1e-9)}%` : ltv === 90 ? "0%" : "past the limit";
  const live = m.ready || m.done;
  return (
    <Stage>
      <PracticeFrame label="your position at another LTV" heading="What if your LTV were...">
        <Tiles per={3}>
          <Tile k="ltv" label="LTV" value={ltv} show={SHOW.ltv} play={0} lit={stat === "ltv"} />
          <Tile k="health" label="Health Factor" value={hf} show={SHOW.hf} play={0} lit={ltv >= 90} />
          <div className={`${app.tile} ${css.readout}`}>
            <div className={app.tileText}>
              <div className={app.tileLabel}>Loss your deposit could take before 90%</div>
              <div className={app.tileValue}>{loss}</div>
              <div className={app.tileNote} />
            </div>
          </div>
        </Tiles>
        <HealthBar ltv={ltv / 100} play={0} redZone={ltv >= 95} legend={false} />
        <div className={`${css.band} ${ltv >= 95 ? css.bandLiq : ltv >= 90 ? css.bandCap : ""}`}>{band(ltv)}</div>
        <label className={css.slider}>
          <span>LTV</span>
          <input
            type="range"
            min="10"
            max="97"
            step="1"
            value={ltv}
            list="i3-ltv-marks"
            disabled={!live}
            aria-label="LTV"
            onChange={(e) => {
              const v = Number(e.target.value);
              setLtv(v);
              if (v >= 90 && m.ready && !m.done) m.apply({ ...m.position });
            }}
          />
          <datalist id="i3-ltv-marks">
            <option value="90" />
            <option value="95" />
          </datalist>
          <b>{ltv}%</b>
        </label>
      </PracticeFrame>
    </Stage>
  );
}
HealthFactorFigure.moment = "hf-slider";
HealthFactorFigure.hint = "Drag the slider until Health Factor reads 1.00";

/* ── Page 2: the preview ─────────────────────────────────── */

const MORE = 2_000;

/**
 * "Type 2,000 in the alUSD field on the Borrow tab", then "Press Borrow."
 * The vault page: six stats, the health bar, the Borrow tab with Available
 * under its field. Typing shows the app's arrow and the new value beside
 * each stat it would change, in red, and a dashed outline on the bar at the
 * new LTV; more than Available turns the field red and Borrow off. Borrow
 * folds the arrows into the stats, which count to their new values; a
 * second later the practice wallet takes the 2,000 alUSD.
 */
export function PreviewFigure() {
  const pv = useMoment("preview");
  const b = useMoment("borrow");
  const [typed, setTyped] = useState("");
  const [committed, setCommitted] = useState(false);
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (b.done) setCommitted(true);
  }, [b.done]);
  const base = pv.position;
  const n = Number(typed) || 0;
  const room = roomOf(base.deposit, base.debt);
  const after = { ...base, debt: base.debt + MORE };
  const shown = committed ? after : base;
  const typing = !committed && n > 0;
  const live = (pv.ready || pv.done) && !committed;
  useMomentNote("preview", pv.ready && n > room ? "That is more than Available" : null);
  useMomentNote("borrow", b.ready && n > room ? "That is more than Available" : null);
  const borrow = async () => {
    setCommitted(true);
    setTyped("");
    await wait(1200);
    if (alive.current) b.apply({ ...b.position, debt: b.position.debt + MORE, walletAl: (b.position.walletAl ?? 0) + MORE });
  };
  return (
    <Stage>
      <PracticeFrame label="the vault page's Borrow tab" {...FRAME}>
        <PositionTiles
          p={shown}
          ahead={typing ? { debt: base.debt + n } : null}
          prev={committed ? base : null}
          play={committed ? 1 : 0}
          lit={committed || typing ? ["debt", "ltv", "health", "borrowable"] : []}
        />
        <HealthBar ltv={shown.debt / shown.deposit} play={committed ? 1 : 0} ghost={typing ? (base.debt + n) / base.deposit : committed ? base.debt / base.deposit : null} />
        <AppTabs tabs={VAULT_TABS} live="Borrow" lit />
        <AppPanel>
          <AppInput
            token="alUSD"
            type="Available"
            amount={committed ? "" : typed}
            onChange={
              live
                ? (v) => {
                    setTyped(v);
                    if (Number(v) === MORE && pv.ready && !pv.done) pv.apply({ ...pv.position });
                  }
                : undefined
            }
            balance={roomOf(shown.deposit, shown.debt)}
            digits={2}
          />
          <AppButton disabled={!(b.ready && !committed && n === MORE)} hint={committed ? null : !pv.done ? NOT_READY : n > room ? "That is more than Available" : n !== MORE ? "Type 2,000" : null} onClick={borrow}>
            Borrow
          </AppButton>
        </AppPanel>
      </PracticeFrame>
    </Stage>
  );
}
PreviewFigure.moment = "preview";
PreviewFigure.hint = "Type 2,000 in the alUSD field";

/* ── Page 3: dollars ─────────────────────────────────────── */

/**
 * "Turn on the USD switch." The stats as page 2 left them with the switch
 * under them, over the Dashboard's summary bar. On, 0.8 s apart: Deposit to
 * $10,000.00, Debt to $6,860.00 (lit), Earmarked to $0.00, Borrowable to
 * $1,960.00 (lit), then LTV, outlined for 2 s with "LTV is in tokens"; then
 * the moment is done and the summary bar fades in, Net Value lit for 2 s.
 * Off turns the stats back; the Dashboard does not move.
 *
 * The Dashboard panel holds its place from the start with only its title,
 * and its dollar figures stay off the page until the moment is done: they
 * used to show, dimmed, before the reader had touched the switch or read
 * what they mean. The panel sits under the stats at
 * the figure's full width with the four figures in one row, as the app's
 * summary bar is. Beside the stats, with a position card under the bar, it
 * was more than twice their height and left the figure's left half empty;
 * the card repeated the stats above it in tokens, and the text never points
 * at it, so it is gone.
 */
export function CurrencySwitchFigure() {
  const c = useMoment("currency");
  const p = c.position;
  const [on, setOn] = useState(false);
  const [step, setStep] = useState(0);
  const [net, setNet] = useState(false);
  const [busy, setBusy] = useState(false);
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (c.done) {
      setOn(true);
      setStep(6);
    }
  }, [c.done]);
  const turnOn = async () => {
    setOn(true);
    setBusy(true);
    for (let s = 1; s <= 5; s++) {
      setStep(s);
      await wait(800);
      if (!alive.current) return;
    }
    await wait(1200);
    if (!alive.current) return;
    setStep(6);
    setNet(true);
    setTimeout(() => {
      if (alive.current) setNet(false);
    }, 2000);
    setBusy(false);
    // The summary bar shows once the moment is done, so the two happen together.
    if (!c.done) c.apply({ ...c.position });
  };
  const toggle = () => {
    if (busy || !(c.ready || c.done)) return;
    if (on) {
      setOn(false);
      setStep(0);
    } else if (!c.done) turnOn();
    else {
      setOn(true);
      setStep(6);
    }
  };
  const usd = (v) => `$${trunc(v)}`;
  const shownP = {
    ...p,
    debt: step >= 2 ? p.debt * AL_PRICE : p.debt,
  };
  // Borrowable in dollars is the alUSD room at the market price.
  const show = {
    deposit: step >= 1 ? usd : SHOW.usdc,
    debt: step >= 2 ? usd : SHOW.al,
    earmarked: step >= 3 ? usd : SHOW.al,
    borrowable: step >= 4 ? () => usd(roomOf(p.deposit, p.debt) * AL_PRICE) : SHOW.al,
  };
  const tokens = { ...p };
  return (
    <Stage>
      <PracticeFrame label="the vault's stats in dollars, and the Dashboard" {...FRAME}>
        <PositionTiles
          p={tokens}
          play={step}
          show={{ ...show, debt: step >= 2 ? () => usd(shownP.debt) : SHOW.al }}
          lit={[step === 2 ? "debt" : null, step === 4 ? "borrowable" : null, step === 5 ? "ltv" : null].filter(Boolean)}
          notes={step === 5 ? { ltv: <span className={app.delta}>LTV is in tokens</span> } : {}}
        />
        <div className={css.switchRow}>
          <span className={css.price}>
            alUSD market price <b>0.98</b>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="USD"
            className={`${css.switch} ${on ? css.switchOn : ""} ${!on && c.ready ? css.switchCall : ""}`}
            disabled={!(c.ready || c.done) || busy}
            onClick={toggle}
          >
            <i />
          </button>
          <span className={css.switchLabel}>USD</span>
        </div>
        <div className={`${css.dash} ${c.done ? css.dashOn : ""}`}>
          <div className={css.dashTitle}>Dashboard</div>
          <dl className={css.summary} aria-hidden={c.done ? undefined : true}>
            <div><dt>Total Deposit</dt><dd>${trunc(p.deposit)}</dd></div>
            <div><dt>Total Debt</dt><dd>${trunc(p.debt * AL_PRICE)}</dd></div>
            <div><dt>Available to Borrow</dt><dd>${trunc(roomOf(p.deposit, p.debt) * AL_PRICE)}</dd></div>
            <div className={net ? css.netLit : ""}><dt>Net Value</dt><dd>${trunc(p.deposit - p.debt * AL_PRICE)}</dd></div>
          </dl>
        </div>
      </PracticeFrame>
    </Stage>
  );
}
CurrencySwitchFigure.moment = "currency";
CurrencySwitchFigure.hint = "Turn on the USD switch";

/* ── Page 4: the band ────────────────────────────────────── */

const PAY = 100;
const REFUSED = "This action would leave your position undercollateralized. Reduce the amount or add more collateral.";

/**
 * "On the Repay tab, pick alUSD in the token picker, type 100 and press
 * Repay", then "Switch the token picker to USDC, type 100 and press Repay."
 * The vault page in the band: LTV 92.10%, Health Factor 0.97, Borrowable 0,
 * the Borrow and Withdraw tabs each marked "Available 0", the Repay tab
 * open with its token picker. Typing previews Debt and LTV. The alUSD
 * repayment spins, then fails with the app's tracker line and Retry Repay;
 * nothing changes. The USDC one goes through: Debt 6,900, LTV 90.78%,
 * Health Factor 0.99, and the wallet pays 100 USDC.
 */
export function BandFigure() {
  const ra = useMoment("repay-alusd");
  const ru = useMoment("repay-usdc");
  const { stat } = useAppContext();
  const [token, setToken] = useState("USDC");
  const [typed, setTyped] = useState("");
  const [state, setState] = useState("idle");
  const { alive, wait } = useRunner();
  useEffect(() => {
    if (ra.done && !ru.done) {
      setToken("alUSD");
      setTyped(String(PAY));
      setState("failed");
    }
    if (ru.done) {
      setToken("USDC");
      setTyped("");
      setState("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ra.done, ru.done]);
  const base = ra.position;
  const shown = ru.done ? ru.after : base;
  const n = Number(typed) || 0;
  const balance = token === "alUSD" ? shown.walletAl ?? 0 : token === "USDC" ? shown.wallet : 0;
  const pending = !ra.done ? "alusd" : !ru.done ? "usdc" : null;
  const want = pending === "alusd" ? "alUSD" : "USDC";
  const ok = pending && state !== "pending" && n === PAY && balance >= PAY && (token === want || (token === "alUSD" && ra.done && !ru.done));
  const wrong = pending && n > 0 && token !== want && !(state === "failed" && token === "alUSD");
  useMomentNote("repay-alusd", ra.ready && n > 0 && token !== "alUSD" ? "Pick alUSD first" : null);
  useMomentNote("repay-usdc", ru.ready && n > 0 && token !== "USDC" && state !== "failed" ? "Pick USDC first" : null);
  const press = async () => {
    if (token === "alUSD") {
      setState("pending");
      await wait(900);
      if (!alive.current) return;
      setState("failed");
      if (!ra.done) ra.apply({ ...ra.position });
      return;
    }
    setState("idle");
    setTyped("");
    ru.apply({ ...ru.position, debt: ru.position.debt - PAY, wallet: ru.position.wallet - PAY });
  };
  const pick = (t) => {
    setToken(t);
    setTyped("");
    setState("idle");
  };
  const typing = n > 0 && state === "idle" && !ru.done;
  const tabs = [
    { name: "Borrow", badge: true, pointed: stat === "borrowable" },
    { name: "Withdraw", badge: true, pointed: stat === "available" },
    { name: "Repay", on: true },
  ];
  return (
    <Stage>
      <PracticeFrame label="the vault page between 90% and 95%" {...FRAME}>
        <PositionTiles
          p={shown}
          ahead={typing ? { debt: shown.debt - n } : null}
          prev={ru.done ? ru.before : null}
          play={ru.done ? 1 : 0}
          lit={ru.done ? ["debt", "ltv", "health"] : typing ? ["debt", "ltv"] : ["ltv", "health", "borrowable"]}
        />
        <HealthBar ltv={shown.debt / shown.deposit} play={ru.done ? 1 : 0} ghost={typing ? (shown.debt - n) / shown.deposit : ru.done ? base.debt / base.deposit : null} />
        <div className={css.tabs} role="tablist">
          {tabs.map((t) => (
            <span key={t.name} role="tab" aria-selected={Boolean(t.on)} className={`${css.tab} ${t.on ? css.tabOn : ""}`}>
              {t.name}
              {t.badge ? <span className={`${css.badge} ${t.pointed ? css.badgeLit : ""}`}>Available 0</span> : null}
            </span>
          ))}
        </div>
        <AppPanel>
          <AppInput
            token={token}
            tokens={["alUSD", "USDC", "mixUSDC"]}
            onToken={pending && state !== "pending" ? pick : undefined}
            amount={typed}
            onChange={pending && state !== "pending" ? (v) => { setTyped(v); if (state === "failed") setState("idle"); } : undefined}
            balance={balance}
            prevBalance={ru.done && token === "USDC" ? ru.before.wallet : null}
            max={Math.min(balance, shown.debt)}
            digits={2}
          />
          <AppButton disabled={!ok || wrong} hint={ru.done ? null : !ra.ready && !ra.done ? NOT_READY : wrong ? `Pick ${want} first` : n !== PAY ? "Type 100" : null} onClick={press}>
            {state === "pending" ? (
              <span className={css.spin}>
                <i aria-hidden="true" />
                Repay
              </span>
            ) : state === "failed" && token === "alUSD" ? (
              "Retry Repay"
            ) : (
              "Repay"
            )}
          </AppButton>
          <div className={css.tracker} style={state === "failed" && token === "alUSD" ? undefined : { visibility: "hidden" }} aria-hidden={state === "failed" && token === "alUSD" ? undefined : true} role="status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6M12 16.5v.5" />
            </svg>
            {REFUSED}
          </div>
        </AppPanel>
      </PracticeFrame>
    </Stage>
  );
}
BandFigure.moment = "repay-alusd";
BandFigure.hint = "Pick alUSD, type 100 and press Repay";
