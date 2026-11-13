import React, { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import { AlchemixMark } from "./brand";
import { Button, Notice, Section } from "./parts";
import { HERO, MERCH_PAGE, SECTIONS } from "./copy";
import s from "./pages.module.css";
import m from "./merch.module.css";

/**
 * /members/merch (demo walkthrough 2026-10-27). A proof of concept of the
 * store side of the merch claim, not in the navigation. The claim itself
 * stays where it was: one signature on the Event VIP and merch badge answers
 * a single-use code, and on the demo store "Open the store" lands here with
 * ?code=. Without a code the page offers a sample one, so the checkout can be
 * shown before any wallet reaches the rung.
 *
 * Nothing here talks to the engine or anyone else. The form fields live in
 * React state only, are never written to storage, and are cleared on "Place
 * order". In the real flow the shipping step is the print partner's own
 * checkout, so an address never passes through Alchemix (ADR 0004).
 */
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const FIELDS = ["name", "line1", "line2", "city", "region", "postal", "country", "contact"];
const OPTIONAL = new Set(["line2"]);
const CODE_SHAPE = /^[A-Z0-9][A-Z0-9-]{3,39}$/;
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function sampleCode() {
  const group = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
  return `DEMO-${group()}-${group()}-${group()}`;
}

const EMPTY = Object.fromEntries(FIELDS.map((k) => [k, ""]));

export default function Merch() {
  const location = useLocation();
  const [code, setCode] = useState(null);
  const [size, setSize] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [problem, setProblem] = useState(null);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(location.search).get("code");
    const c = raw ? raw.trim().toUpperCase() : "";
    setCode(CODE_SHAPE.test(c) ? c : null);
  }, [location.search]);

  function submit(e) {
    e.preventDefault();
    if (!size) {
      setProblem(MERCH_PAGE.item.pickSize);
      return;
    }
    if (FIELDS.some((k) => !OPTIONAL.has(k) && form[k].trim() === "")) {
      setProblem(MERCH_PAGE.ship.missing);
      return;
    }
    // Nothing is sent: the details are dropped here, and the page only says the order went through.
    setForm(EMPTY);
    setProblem(null);
    setPlaced(true);
  }

  function startAgain() {
    setPlaced(false);
    setSize(null);
    setForm(EMPTY);
    setProblem(null);
  }

  return (
    <>
      <section className={s.pageHead}>
        <div className={s.pageHeadInner}>
          <div className={s.eyebrow}>{HERO.eyebrow}</div>
          <h1 className={s.headline}>{MERCH_PAGE.title}</h1>
          <p className={s.lead}>{MERCH_PAGE.lead}</p>
          <div className={m.poc}>
            <Notice tone="soon">{MERCH_PAGE.poc}</Notice>
          </div>
        </div>
      </section>

      <Section label={SECTIONS.merchCode} id="code">
        {code ? (
          <div className={m.codeCard}>
            <div className={m.codeLabel}>{MERCH_PAGE.code.label}</div>
            <div className={m.code}>{code}</div>
            <p className={m.fine}>{MERCH_PAGE.code.applied}</p>
          </div>
        ) : (
          <div className={s.formGrid}>
            <p className={s.note}>{MERCH_PAGE.code.none}</p>
            <div className={s.sendRow}>
              <Button kind="primary" onClick={() => setCode(sampleCode())}>
                {MERCH_PAGE.code.sample}
              </Button>
              <Button kind="secondary" to="/members/badges#badge-vip">
                {MERCH_PAGE.code.badge}
              </Button>
            </div>
          </div>
        )}
      </Section>

      {code && placed ? (
        <Section label={SECTIONS.merchItem} id="done">
          <div className={s.formGrid}>
            <Notice tone="ok">
              <strong>{MERCH_PAGE.done.title}.</strong> {MERCH_PAGE.done.body}
            </Notice>
            <div className={s.sendRow}>
              <Button kind="primary" to="/members">
                {MERCH_PAGE.done.back}
              </Button>
              <Button kind="secondary" onClick={startAgain}>
                {MERCH_PAGE.done.again}
              </Button>
            </div>
          </div>
        </Section>
      ) : null}

      {code && !placed ? (
        <form onSubmit={submit} noValidate>
          <Section label={SECTIONS.merchItem} id="item">
            <div className={m.item}>
              <div className={m.art} aria-hidden="true">
                <AlchemixMark className={m.mark} />
                <span className={m.artSeason}>Season One</span>
              </div>
              <div className={m.itemBody}>
                <h2 className={m.itemName}>{MERCH_PAGE.item.name}</h2>
                <p className={s.note}>{MERCH_PAGE.item.body}</p>
                <fieldset className={s.fieldset}>
                  <legend className={s.legend}>{MERCH_PAGE.item.size}</legend>
                  <div className={s.segments}>
                    {SIZES.map((x) => (
                      <label key={x} className={`${s.segment} ${size === x ? s.segmentOn : ""}`}>
                        <input
                          type="radio"
                          name="merch-size"
                          value={x}
                          checked={size === x}
                          onChange={() => setSize(x)}
                          className={s.srOnly}
                        />
                        {x}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <dl className={m.lines}>
                  {MERCH_PAGE.item.lines.map(([k, v]) => (
                    <div key={k} className={m.line}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                  <div className={`${m.line} ${m.total}`}>
                    <dt>{MERCH_PAGE.item.total}</dt>
                    <dd>{MERCH_PAGE.item.totalValue}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Section>

          <Section label={SECTIONS.merchShip} id="shipping">
            <div className={s.formGrid}>
              <p className={m.mailbox}>{MERCH_PAGE.ship.mailbox}</p>
              <div className={m.fields}>
                {FIELDS.map((k) => (
                  <div key={k} className={k === "line1" || k === "name" ? m.wide : undefined}>
                    <label className={s.legend} htmlFor={`merch-${k}`}>
                      {MERCH_PAGE.ship.fields[k]}
                    </label>
                    <input
                      id={`merch-${k}`}
                      className={s.textInput}
                      value={form[k]}
                      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                ))}
              </div>
              <p className={`${s.note} ${s.fieldNote}`}>{MERCH_PAGE.ship.private}</p>
              <div className={s.sendRow}>
                <Button kind="primary" type="submit">
                  {MERCH_PAGE.ship.submit}
                </Button>
              </div>
              {problem ? <Notice tone="error">{problem}</Notice> : null}
            </div>
          </Section>
        </form>
      ) : null}
    </>
  );
}
