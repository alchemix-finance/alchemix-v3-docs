import React, { useEffect, useState } from "react";
import { isEngineDown, sendExitReason } from "./lib/api";
import { errorText, useMember } from "./lib/member";
import { isAddress } from "./lib/wallet";
import { Button, EngineDown, Notice, Section } from "./parts";
import { CONNECT, HERO, LEAVING, SECTIONS } from "./copy";
import s from "./pages.module.css";

/**
 * /members/leaving. The standalone exit reason form: the fallback for the FE
 * team's exit question, and where DeBank messages to recent exits point. No
 * signature: the address is unproven, so it never earns anything.
 */
const REASONS = [
  "better_rate_elsewhere",
  "peg_or_transmuter",
  "closing_loan",
  "needed_funds",
  "risk_concern",
  "moving_chains",
  "other",
];
const TEXT_MAX = 500;

export default function Leaving() {
  const { base, address: viewed } = useMember();
  const [address, setAddress] = useState("");
  const [reason, setReason] = useState(null);
  const [text, setText] = useState("");
  const [state, setState] = useState({ stage: "idle", error: null });
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    if (viewed && !address) setAddress(viewed);
  }, [viewed]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    if (!isAddress(address)) {
      setProblem(CONNECT.badAddress);
      return;
    }
    if (!reason) {
      setProblem(LEAVING.pickReason);
      return;
    }
    setProblem(null);
    setState({ stage: "send", error: null });
    try {
      await sendExitReason(base, { address: address.trim(), reason, text });
      setState({ stage: "done", error: null });
    } catch (error) {
      setState({ stage: "error", error });
    }
  }

  return (
    <>
      <section className={s.pageHead}>
        <div className={s.pageHeadInner}>
          <div className={s.eyebrow}>{HERO.eyebrow}</div>
          <h1 className={s.headline}>{LEAVING.headline}</h1>
          <p className={s.lead}>{LEAVING.intro}</p>
        </div>
      </section>

      <Section label={SECTIONS.leaving} id="reason">
        {state.stage === "done" ? (
          <div className={s.formGrid}>
            <Notice tone="ok">{LEAVING.thanks}</Notice>
            {/* Page review 2026-10-24 (batch item 5): the thank-you leads back to the record. */}
            <div className={s.sendRow}>
              <Button kind="primary" to="/members">
                {LEAVING.back}
              </Button>
              <Button
                kind="secondary"
                onClick={() => {
                  setReason(null);
                  setText("");
                  setState({ stage: "idle", error: null });
                }}
              >
                {LEAVING.another}
              </Button>
            </div>
          </div>
        ) : (
          <form className={s.formGrid} onSubmit={submit} noValidate>
            <div>
              <label className={s.legend} htmlFor="exit-address">
                {LEAVING.addressLabel}
              </label>
              <input
                id="exit-address"
                className={s.textInput}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={CONNECT.placeholder}
                spellCheck="false"
                autoComplete="off"
              />
            </div>

            <fieldset className={s.fieldset}>
              <legend className={s.legend}>{LEAVING.reasonLabel}</legend>
              <div className={s.reasons}>
                {REASONS.map((code) => (
                  <label key={code} className={`${s.reason} ${reason === code ? s.reasonOn : ""}`}>
                    <input
                      type="radio"
                      name="exit-reason"
                      value={code}
                      checked={reason === code}
                      onChange={() => setReason(code)}
                      className={s.srOnly}
                    />
                    <span className={s.reasonMark} aria-hidden="true" />
                    {LEAVING.reasons[code]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className={s.legend} htmlFor="exit-text">
                {LEAVING.textLabel}
              </label>
              <textarea
                id="exit-text"
                className={s.textarea}
                rows={3}
                maxLength={TEXT_MAX}
                value={text}
                placeholder={LEAVING.textPlaceholder}
                onChange={(e) => setText(e.target.value)}
              />
              <p className={`${s.note} ${s.fieldNote}`}>{LEAVING.textPrivate}</p>
            </div>

            <div className={s.sendRow}>
              <Button kind="primary" type="submit" disabled={state.stage === "send"}>
                {LEAVING.submit}
              </Button>
            </div>
            {problem ? <Notice tone="error">{problem}</Notice> : null}
            {state.stage === "error" ? (
              isEngineDown(state.error) ? (
                <EngineDown />
              ) : (
                <Notice tone="error">{errorText(state.error)}</Notice>
              )
            ) : null}
          </form>
        )}
      </Section>
    </>
  );
}
