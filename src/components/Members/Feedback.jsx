import React, { useEffect, useState } from "react";
import { isEngineDown, readShippedLog, sendFeedback } from "./lib/api";
import { errorText, useClaim, useMember } from "./lib/member";
import { fmtDate } from "./lib/format";
import { Button, Caption, EngineDown, Notice, SafePending, Section, claimErrorText, stageText } from "./parts";
import { FEEDBACK, FEEDBACK_QUESTION, HERO, MINE, SECTIONS, SHIPPED } from "./copy";
import s from "./pages.module.css";

/**
 * /members/feedback. Send feedback anonymously (no wallet) or signed (one
 * signature, tagged and creditable), read your own signed submissions with
 * one signature, and the public shipped log.
 *
 * The form always shows the shipped log notice, so every submission goes with
 * noticeShown: true, which is what lets the log quote it (ticket 19). The
 * engine never quotes reasons for leaving, whatever the flag says.
 *
 * The question of the round (FEEDBACK_QUESTION in copy.js) is a callout in
 * the column beside the form, above the public notice, when its prompt is set
 * (design notes 2026-11-03, metalface 36; it sat above the form before). Answering it pre-fills the category, and while
 * the form is set up for the answer, both sends carry the question's topic
 * slug (FEEDBACK_QUESTION.topic, for example "aip-123"), so the team can
 * filter the answers in triage. Changing the category away drops it.
 */
const MIN = 10;
const MAX = 2000;
const CATEGORIES = ["bug", "idea", "confusing", "leaving"];

/** The fields every send carries, plus the question's topic while the form is set up for its answer. */
function fields(category, body, answering) {
  const topic = answering && FEEDBACK_QUESTION.prompt ? FEEDBACK_QUESTION.topic : "";
  return topic ? { category, body, noticeShown: true, topic } : { category, body, noticeShown: true };
}

export default function Feedback() {
  return (
    <>
      <section className={s.pageHead}>
        <div className={s.pageHeadInner}>
          <div className={s.eyebrow}>{HERO.eyebrow}</div>
          <h1 className={s.headline}>{FEEDBACK.headline}</h1>
          <p className={s.lead}>{FEEDBACK.intro}</p>
        </div>
      </section>
      <SendForm />
      <Mine />
      <Shipped />
    </>
  );
}

function SendForm() {
  const { base } = useMember();
  const signed = useClaim("feedback");
  const [category, setCategory] = useState("idea");
  const [answering, setAnswering] = useState(false);
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState({ stage: "idle", error: null });
  const [sent, setSent] = useState(null);
  const [short, setShort] = useState(false);

  const text = body.trim();
  const ok = text.length >= MIN && text.length <= MAX;

  function check() {
    if (!ok) {
      setShort(true);
      return false;
    }
    setShort(false);
    return true;
  }

  async function sendAnon() {
    if (!check()) return;
    setSent(null);
    setAnon({ stage: "send", error: null });
    try {
      await sendFeedback(base, fields(category, text, answering));
      setAnon({ stage: "idle", error: null });
      setSent("anon");
      setBody("");
      setAnswering(false);
    } catch (error) {
      setAnon({ stage: "error", error });
    }
  }

  async function sendSigned() {
    if (!check()) return;
    setSent(null);
    const value = await signed.run(fields(category, text, answering));
    if (value) {
      setSent("signed");
      setBody("");
      setAnswering(false);
    }
  }

  function answer() {
    if (CATEGORIES.includes(FEEDBACK_QUESTION.category)) setCategory(FEEDBACK_QUESTION.category);
    setAnswering(true);
    window.requestAnimationFrame(() => document.getElementById("feedback-body")?.focus());
  }

  return (
    <Section label={SECTIONS.sendFeedback} id="send">
      <div className={s.formLayout}>
      <div className={s.formGrid}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>{FEEDBACK.categoryLabel}</legend>
          <div className={s.segments}>
            {CATEGORIES.map((c) => (
              <label key={c} className={`${s.segment} ${category === c ? s.segmentOn : ""}`}>
                <input
                  type="radio"
                  name="feedback-category"
                  value={c}
                  checked={category === c}
                  onChange={() => {
                    setCategory(c);
                    if (c !== FEEDBACK_QUESTION.category) setAnswering(false);
                  }}
                  className={s.srOnly}
                />
                {FEEDBACK.categories[c]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className={s.legend} htmlFor="feedback-body">
            {FEEDBACK.bodyLabel}
          </label>
          <textarea
            id="feedback-body"
            className={s.textarea}
            value={body}
            maxLength={MAX}
            rows={6}
            placeholder={FEEDBACK.bodyPlaceholder}
            onChange={(e) => {
              setBody(e.target.value);
              setShort(false);
            }}
          />
          <div className={s.counter}>
            <span>{short ? FEEDBACK.tooShort(MIN) : ""}</span>
            <span>{FEEDBACK.count(text.length, MAX)}</span>
          </div>
        </div>

        <div className={s.sendRow}>
          <Button kind="secondary" onClick={sendAnon} disabled={anon.stage === "send" || signed.busy}>
            {anon.stage === "send" ? stageText("send") : FEEDBACK.sendAnon}
          </Button>
          <Button kind="primary" onClick={sendSigned} disabled={anon.stage === "send" || signed.busy}>
            {stageText(signed.stage) ?? FEEDBACK.sendSigned}
          </Button>
        </div>
        <p className={s.note}>{FEEDBACK.signedNote}</p>

        {sent ? <Notice tone="ok">{sent === "signed" ? FEEDBACK.sentSigned : FEEDBACK.sentAnon}</Notice> : null}
        {anon.stage === "error" ? (
          isEngineDown(anon.error) ? <EngineDown /> : <Notice tone="error">{errorText(anon.error)}</Notice>
        ) : null}
        {signed.stage === "error" ? (
          <Notice tone={signed.error?.code === "cancelled" ? "info" : "error"}>{claimErrorText(signed.error)}</Notice>
        ) : null}
        <SafePending claim={signed} />
      </div>
      {/* Design notes 2026-11-03 (metalface 36): the question is a callout in the side column, the form comes first. */}
      <div className={s.formSide}>
        {FEEDBACK_QUESTION.prompt ? (
          <aside className={`${s.question} ${answering ? s.questionOn : ""}`} aria-label={FEEDBACK_QUESTION.eyebrow}>
            <Caption className={s.questionEyebrow}>{FEEDBACK_QUESTION.eyebrow}</Caption>
            <p className={s.questionText}>{keepTokens(FEEDBACK_QUESTION.prompt)}</p>
            {answering ? (
              <p className={s.note}>{FEEDBACK_QUESTION.active}</p>
            ) : (
              <Button kind="secondary" onClick={answer}>
                {FEEDBACK_QUESTION.button}
              </Button>
            )}
          </aside>
        ) : null}
        <aside className={s.publicNotice} aria-label={FEEDBACK.publicNoticeTitle}>
          <Caption>{FEEDBACK.publicNoticeTitle}</Caption>
          <p>{FEEDBACK.publicNotice}</p>
        </aside>
      </div>
      </div>
    </Section>
  );
}

function Mine() {
  const claim = useClaim("my-feedback");
  const items = claim.result?.items ?? null;

  return (
    <Section label={SECTIONS.mySubmissions} id="mine">
      {items === null ? (
        <Button kind="secondary" onClick={() => claim.run()} disabled={claim.busy}>
          {stageText(claim.stage) ?? MINE.button}
        </Button>
      ) : items.length === 0 ? (
        <p className={s.intro}>{MINE.empty}</p>
      ) : (
        <ol className={s.list}>
          {items.map((item) => (
            <li key={item.id} className={s.item}>
              <div className={s.itemHead}>
                <span className={s.itemCategory}>{FEEDBACK.categories[item.category] ?? item.category}</span>
                <span className={`${s.status} ${s[`status_${item.status}`] ?? ""}`}>
                  {MINE.status[item.status] ?? item.status}
                </span>
                <span className={s.itemDate}>{MINE.sent(fmtDate(item.submittedAt, { short: true }))}</span>
              </div>
              <p className={s.itemBody}>{item.body}</p>
              {item.shipNote ? (
                <p className={s.itemNote}>
                  <span className={s.itemNoteLabel}>{MINE.shipNote}</span> {item.shipNote}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
      {claim.stage === "error" ? (
        <div className={s.noteBlock}>
          <Notice tone={claim.error?.code === "cancelled" ? "info" : "error"}>{claimErrorText(claim.error)}</Notice>
        </div>
      ) : null}
      <SafePending claim={claim} className={s.noteBlock} />
    </Section>
  );
}

function Shipped() {
  const { base } = useMember();
  const [state, setState] = useState({ status: "loading", items: [], error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setState((st) => ({ ...st, status: "loading" }));
    readShippedLog(base)
      .then((data) => live && setState({ status: "ready", items: data.items ?? [], error: null }))
      .catch((error) => live && setState({ status: "error", items: [], error }));
    return () => {
      live = false;
    };
  }, [base, tick]);

  return (
    <Section label={SECTIONS.shipped} id="shipped">
      <p className={s.intro}>{SHIPPED.intro}</p>
      {state.status === "error" && isEngineDown(state.error) ? (
        <EngineDown onRetry={() => setTick((n) => n + 1)} />
      ) : state.status === "error" ? (
        <Notice tone="error">{SHIPPED.loadFailed}</Notice>
      ) : state.status === "ready" && state.items.length === 0 ? (
        <div className={s.emptyLog}>
          <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={s.emptyGlyph}>
            <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.14)" strokeDasharray="2 5" />
            <circle cx="32" cy="32" r="16" stroke="#F5C09A" strokeOpacity="0.6" />
            <circle cx="32" cy="32" r="2.5" fill="#8FB2DE" />
          </svg>
          <p className={s.intro}>{SHIPPED.empty}</p>
        </div>
      ) : (
        <ol className={s.log}>
          {state.items.map((item) => (
            <li key={item.id} className={s.logItem}>
              <div className={s.logDate}>
                <Caption>{fmtDate(item.shippedOn, { short: true })}</Caption>
              </div>
              <div className={s.logBody}>
                {item.shipNote ? <p className={s.logNote}>{item.shipNote}</p> : null}
                {item.excerpt ? <p className={s.logExcerpt}>{item.excerpt}</p> : null}
                <div className={s.logCredit}>{item.credit ? SHIPPED.thanks(item.credit) : SHIPPED.anonymous}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

/** Keeps proposal tokens such as "AIP-123" on one line, so a narrow column never breaks them at the hyphen. */
function keepTokens(text) {
  return text.split(/(\bAIP-\d+\b)/).map((part, i) => (i % 2 ? <span key={i} style={{ whiteSpace: "nowrap" }}>{part}</span> : part));
}
