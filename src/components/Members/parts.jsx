import React, { useEffect, useRef } from "react";
import Link from "@docusaurus/Link";
import { Node } from "./Shell";
import { CenterLogo } from "./brand";
import { CLAIMS, ENGINE_DOWN, SAFE } from "./copy";
import { errorText, useMember } from "./lib/member";
import { shortAddress } from "./lib/format";
import s from "./parts.module.css";
import o from "./orbit.module.css";

/**
 * Building blocks shared by the members pages: the numbered section frame,
 * buttons, notices, stats, and the hero graphic.
 */

/**
 * The season engine could not be reached (review 16). Said plainly, so a
 * server problem never reads as "no season is open" or "nothing on record".
 */
export function EngineDown({ onRetry }) {
  return (
    <Notice
      tone="error"
      action={
        onRetry ? (
          <Button kind="secondary" onClick={onRetry}>
            {ENGINE_DOWN.retry}
          </Button>
        ) : null
      }
    >
      <strong className={s.noticeTitle}>{ENGINE_DOWN.title}.</strong> {ENGINE_DOWN.body}
    </Notice>
  );
}

/**
 * A section: a full-bleed rule with nodes where it meets the column, and the
 * title. Design notes 2026-11-03 (metalface, notes 6, 14, 27, 32): no section
 * number ("01 -") before the title any more.
 *
 * Props:
 *   label      the section title (an h2, id `${id}-title`)
 *   id         the section's anchor
 *   aside      anything for the right of the head (a count, tabs)
 *   link       optional docs link at the top right of the head, as
 *              { to, label } (note 18). `to` is a site route ("/user/...") or
 *              a full URL; a full URL opens in a new tab. Sits after `aside`
 *              when both are given.
 *   help       optional { to, label }: a small "?" beside the title that
 *              links to the explainer, with the label as its name and
 *              tooltip (review 2026-11-13, in place of a long text link)
 *   className  extra class on the section
 */
export function Section({ label, id, children, aside, link, help, className }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className={`${s.section} ${className ?? ""}`} id={id} aria-labelledby={headingId}>
      <div className={s.inner}>
        <Node className={s.nodeTL} />
        <Node className={s.nodeTR} />
        <div className={s.head}>
          {help ? (
            <div className={s.headStart}>
              <SectionLabel label={label} id={headingId} />
              <Link to={help.to} className={s.headHelp} aria-label={help.label} title={help.label}>
                <span aria-hidden="true">?</span>
              </Link>
            </div>
          ) : (
            <SectionLabel label={label} id={headingId} />
          )}
          {aside || link ? (
            <div className={s.headEnd}>
              {aside ? <div className={s.headAside}>{aside}</div> : null}
              {link ? <SectionLink {...link} /> : null}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** The docs link in a section head: internal routes through Link, full URLs in a new tab. */
function SectionLink({ to, label }) {
  if (/^https?:\/\//.test(to)) {
    return (
      <a href={to} className={s.headLink} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return (
    <Link to={to} className={s.headLink}>
      {label}
    </Link>
  );
}

export function SectionLabel({ label, id }) {
  return (
    <h2 className={s.label} id={id}>
      <span>{label}</span>
    </h2>
  );
}

/** A small caption over a value. */
export function Caption({ children, className }) {
  return <div className={`${s.caption} ${className ?? ""}`}>{children}</div>;
}

export function Stat({ label, value, note, big }) {
  return (
    <div className={s.stat}>
      <Caption>{label}</Caption>
      <div className={big ? s.statBig : s.statValue}>{value}</div>
      {note ? <div className={s.statNote}>{note}</div> : null}
    </div>
  );
}

/** Buttons. `to` is an internal route, `href` external, neither a button. */
export function Button({ kind = "primary", to, href, children, className, ...rest }) {
  const cls = `${s.button} ${s[kind] ?? ""} ${className ?? ""}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

/** A quiet line of status: info, ok, error or soon. */
export function Notice({ tone = "info", children, action }) {
  return (
    <div className={`${s.notice} ${s[`notice_${tone}`] ?? ""}`} role={tone === "error" ? "alert" : "status"}>
      <span className={s.noticeDot} aria-hidden="true" />
      <div className={s.noticeBody}>
        {children}
        {action ? <div className={s.noticeAction}>{action}</div> : null}
      </div>
    </div>
  );
}

/** The words for a failed claim, including the wallet states the engine never sees. */
export function claimErrorText(e) {
  if (!e) return "";
  if (e.code === "cancelled") return CLAIMS.cancelled;
  if (e.code === "connect_first") return CLAIMS.connectFirst;
  if (e.code === "wrong_account") return CLAIMS.wrongAccount(shortAddress(e.account));
  return errorText(e);
}

export function isUnconfigured(e) {
  return e?.code === "discord_unconfigured" || e?.code === "telegram_unconfigured";
}

/** The stage of a claim in words, for the button while it runs. */
export function stageText(stage) {
  if (stage === "connect" || stage === "sign") return CLAIMS.waiting;
  if (stage === "send") return CLAIMS.sending;
  // V3 backlog ticket 07: a Safe's message waiting on its owners.
  if (stage === "pending") return SAFE.checkAgain;
  if (stage === "checking") return SAFE.checking;
  return null;
}

/**
 * V3 backlog ticket 07: "Using a Safe?" and the custom app route
 * (Safe{Wallet}, Apps, Add custom app, the members link), with the gas line.
 * Nothing inside Safe{Wallet}, where the page is already the Safe App.
 */
export function SafeHint({ className }) {
  const { inSafe } = useMember();
  if (inSafe) return null;
  return (
    <p className={`${s.safeHint} ${className ?? ""}`}>
      <strong>{SAFE.lead}</strong> {SAFE.route} <code>{SAFE.url}</code>
      <span>{SAFE.gas}</span>
    </p>
  );
}

/**
 * V3 backlog ticket 07: what a Safe's claim is waiting for, under its button
 * (which says "Check again"), and what the last check found.
 */
export function SafePending({ claim, className }) {
  if (!claim.pending || (claim.stage !== "pending" && claim.stage !== "checking")) return null;
  return (
    <div className={className}>
      <Notice
        tone="info"
        action={
          <Button kind="secondary" onClick={claim.discard} disabled={claim.busy}>
            {SAFE.startOver}
          </Button>
        }
      >
        {claim.note === "notYet"
          ? claim.pending.kind === "onchain"
            ? SAFE.notYetOnchain
            : SAFE.notYet
          : claim.note === "openInSafe"
            ? SAFE.openInSafe
            : claim.pending.kind === "onchain"
              ? SAFE.pendingOnchain
              : SAFE.pending}
      </Notice>
    </div>
  );
}

/* ── The hero graphic ──────────────────────────────────────── */

/**
 * The hero graphic. Plan items 12 and 13 set filled discs, a vesica pair and
 * nodes around the Alchemix mark. Keenan, 2026-10-29: too geometric and still,
 * so it now follows the card back's construction linework and moves slowly:
 * a nebula drifting behind, a tick ring, a dashed ring and a hexagram turning
 * at different speeds, a copper node and a blue node orbiting with short
 * trails, a pulse from the core with embers rising past it, and the mark
 * drawing itself in. The whole graphic shifts a little with the pointer, as
 * one piece, so every ring stays centred on the mark (Keenan, 2026-10-29: the
 * per-layer shift pulled the rings off the core). The nebula sits on the
 * vertical axis. Under reduced motion it is still. Decorative only.
 */
const ORBIT_NODES = [
  [200, 50],
  [350, 200],
  [200, 350],
  [50, 200],
  [306, 94],
  [94, 306],
];
// [x, y, drift x, drift y, delay s]: embers start around the core and rise.
const EMBERS = [
  [128, 236, -10, -120, 0],
  [272, 232, 12, -110, 1.3],
  [140, 262, -6, -130, 2.5],
  [262, 258, 8, -124, 3.6],
  [118, 206, -14, -96, 4.8],
  [284, 204, 14, -100, 5.9],
  [156, 282, -4, -140, 7.1],
  [246, 280, 6, -136, 8.2],
  [200, 296, 0, -150, 9.3],
];
const TICKS = Array.from({ length: 90 }, (_, i) => {
  const a = (i / 90) * Math.PI * 2;
  const r1 = i % 5 === 0 ? 178 : 182;
  return [200 + Math.cos(a) * r1, 200 + Math.sin(a) * r1, 200 + Math.cos(a) * 186, 200 + Math.sin(a) * 186];
});
const tri = (start) =>
  [0, 1, 2]
    .map((k) => {
      const a = ((start + k * 120) * Math.PI) / 180;
      return `${(200 + Math.cos(a) * 150).toFixed(1)},${(200 + Math.sin(a) * 150).toFixed(1)}`;
    })
    .join(" ");

export function Orbit({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const clamp = (v) => Math.max(-1, Math.min(1, v));
        el.style.setProperty("--px", clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 1.5)).toFixed(3));
        el.style.setProperty("--py", clamp((e.clientY - (r.top + r.height / 2)) / (r.height * 1.5)).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <svg ref={ref} className={`${o.orbit} ${className ?? ""}`} viewBox="0 0 400 400" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="orbit-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c09a" stopOpacity="0.26" />
          <stop offset="70%" stopColor="#f5c09a" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#f5c09a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbit-blue" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#8fb2de" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#8fb2de" stopOpacity="0.07" />
        </radialGradient>
        <radialGradient id="orbit-teal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4e9a92" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4e9a92" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbit-ember" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c09a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f5c09a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbit-glow-copper" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c09a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f5c09a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbit-glow-blue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8fb2de" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8fb2de" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orbit-tail-copper" gradientUnits="userSpaceOnUse" x1="103.6" y1="85.1" x2="200" y2="50">
          <stop offset="0%" stopColor="#f5c09a" stopOpacity="0" />
          <stop offset="100%" stopColor="#f5c09a" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="orbit-tail-blue" gradientUnits="userSpaceOnUse" x1="290.4" y1="275.8" x2="318" y2="200">
          <stop offset="0%" stopColor="#8fb2de" stopOpacity="0" />
          <stop offset="100%" stopColor="#8fb2de" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Atmosphere: the nebula, deepest layer. */}
      <g>
        <g className={o.nebula}>
          <circle cx="200" cy="232" r="168" fill="url(#orbit-teal)" />
          <circle cx="200" cy="176" r="118" fill="url(#orbit-core)" />
        </g>
      </g>

      {/* Construction: axes, rings, the hexagram and the vesica pair. */}
      <g>
        <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.07)" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.07)" />
        <circle cx="200" cy="200" r="190" fill="rgba(255,255,255,0.02)" />
        <g className={o.spinSlow} stroke="rgba(245,192,154,0.22)" strokeWidth="0.75">
          {TICKS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <circle cx="200" cy="200" r="150" fill="url(#orbit-blue)" />
        <circle className={o.spinBack} cx="200" cy="200" r="150" stroke="rgba(245,192,154,0.3)" strokeWidth="0.75" strokeDasharray="1.5 7" />
        <g className={o.spinHex} stroke="rgba(255,255,255,0.06)" strokeWidth="0.75">
          <polygon points={tri(-90)} />
          <polygon points={tri(90)} />
        </g>
        <circle cx="200" cy="200" r="118" fill="rgba(245,192,154,0.04)" />
        <circle cx="200" cy="200" r="118" stroke="rgba(143,178,222,0.28)" strokeWidth="1" strokeDasharray="0.1 6" strokeLinecap="round" />
        <circle cx="148" cy="200" r="72" fill="rgba(237,194,159,0.05)" stroke="rgba(237,194,159,0.12)" strokeWidth="0.75" />
        <circle cx="252" cy="200" r="72" fill="rgba(143,178,222,0.05)" stroke="rgba(143,178,222,0.12)" strokeWidth="0.75" />
        {ORBIT_NODES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" style={{ fill: "var(--m-node)" }} />
        ))}
      </g>

      {/* Orbiters: a copper node on the outer ring, a blue one on the inner, each with a trail. */}
      <g>
        <g className={o.orbitCopper}>
          <path d="M103.6 85.1 A150 150 0 0 1 200 50" stroke="url(#orbit-tail-copper)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="200" cy="50" r="12" fill="url(#orbit-glow-copper)" />
          <circle cx="200" cy="50" r="4.5" style={{ fill: "var(--m-copper)" }} />
        </g>
        <g className={o.orbitBlue}>
          <path d="M290.4 275.8 A118 118 0 0 0 318 200" stroke="url(#orbit-tail-blue)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="318" cy="200" r="11" fill="url(#orbit-glow-blue)" />
          <circle cx="318" cy="200" r="4" style={{ fill: "var(--m-blue)" }} />
        </g>
      </g>

      {/* The core: a slow pulse, the glow, embers, and the mark. */}
      <circle className={o.pulse} cx="200" cy="200" r="86" stroke="rgba(245,192,154,0.5)" strokeWidth="1" />
      <circle className={`${o.pulse} ${o.pulseLate}`} cx="200" cy="200" r="86" stroke="rgba(245,192,154,0.5)" strokeWidth="1" />
      <circle className={o.breathe} cx="200" cy="200" r="96" fill="url(#orbit-core)" />
      {EMBERS.map(([x, y, dx, dy, delay]) => (
        <g key={`${x}-${y}`} className={o.ember} style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, animationDelay: `${delay}s` }}>
          <circle cx={x} cy={y} r="5" fill="url(#orbit-ember)" />
          <circle cx={x} cy={y} r="1.2" fill="#f5c09a" />
        </g>
      ))}
      <g className={o.mark}>
        <CenterLogo cx={200} cy={200} size={104} strokeClass={o.markStrokes} />
      </g>
    </svg>
  );
}
