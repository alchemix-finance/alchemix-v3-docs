import React, { useEffect, useState } from "react";
import { useClaim, useMember } from "../lib/member";
import { fmtDate, fmtInt, fmtTime } from "../lib/format";
import { Button, Notice, SafePending, claimErrorText, isUnconfigured, stageText } from "../parts";
import { CLAIMS, CONNECT, MERCH, REFERRAL, SAFE } from "../copy";
import { completionsFor, isLocalCompletion } from "@site/src/components/Academy/lib/api";
import { TRACKS } from "@site/src/components/Academy/lib/track";
import { INNER_CIRCLE_RUNGS } from "./model";
import { useMyStanding } from "./standing";
import s from "./home.module.css";

/**
 * The signed claims, as small action blocks. Each is one personal_sign of
 * the engine's message, nothing on chain. They sit in the badge detail panel
 * (and the first ones in the hero and next steps), so a claim lives next to
 * the badge it earns. GET /api/members/config is read on load, so Discord
 * and Telegram say "coming soon" without asking for a signature when they
 * cannot work yet; the claim answering *_unconfigured says the same.
 */

function ClaimError({ claim }) {
  const { account, view } = useMember();
  // V3 backlog ticket 07: a Safe's message waiting on its owners says so here.
  if (claim.stage === "pending" || claim.stage === "checking") return <SafePending claim={claim} className={s.actionNote} />;
  if (claim.stage !== "error" || isUnconfigured(claim.error)) return null;
  // Walkthrough 2026-10-23: a personal link opened with another wallet connected
  // is no dead end. The connected wallet's own page is one click away.
  const switchTo =
    claim.error?.code === "wrong_account" && account ? (
      <Button kind="secondary" onClick={() => view(account, "wallet")}>
        {CONNECT.menu.viewMine}
      </Button>
    ) : null;
  return (
    <div className={s.actionNote}>
      <Notice tone={claim.error?.code === "cancelled" ? "info" : "error"} action={switchTo}>
        {claimErrorText(claim.error)}
      </Notice>
    </div>
  );
}

/**
 * "Signing costs no gas and moves no funds", beside the first signing button
 * of a region only. While a Safe is connected (ticket 07) it says instead that
 * some Safe setups pay gas to sign.
 */
function Hint({ show = true }) {
  const { safeConnected } = useMember();
  return show ? <span className={s.signHint}>{safeConnected ? SAFE.signHint : CLAIMS.signHint}</span> : null;
}

/** Tenure badge: one signature from a wallet that used v1 or v2. */
export function TenureAction({ lookup, onChanged, kind = "primary", label, hint = true }) {
  const claim = useClaim("tenure-badge");
  if (!lookup.history) return <p className={s.actionText}>{CLAIMS.badge.notPastUser}</p>;
  const claimedAt = lookup.tenureBadge?.claimedAt ?? claim.result?.badge?.claimedAt;
  if (lookup.tenureBadge?.claimed || claim.stage === "done") {
    return (
      <div className={s.actionNote}>
        <Notice tone="ok">{CLAIMS.badge.claimed(fmtDate(claimedAt))}</Notice>
      </div>
    );
  }
  return (
    <>
      <div className={s.actionRow}>
        <Button
          kind={kind}
          onClick={async () => {
            if (await claim.run()) onChanged?.();
          }}
          disabled={claim.busy}
        >
          {stageText(claim.stage) ?? label}
        </Button>
        <Hint show={hint} />
      </div>
      <ClaimError claim={claim} />
    </>
  );
}

/**
 * Join the season: one signature of the join-season claim, which answers
 * { seasonId, joinedAt, alreadyJoined, referral }. Standing counts from the
 * day a wallet joins. Any other signed claim joins too. On success the page
 * reads the wallet again, so the status strip shows it counting.
 *
 * V3 backlog ticket 08: a ?ref code this browser arrived with goes with the
 * claim as params.ref, and is dropped once the claim is through. `referral`
 * says what the engine made of it; the note under the join says it plainly.
 */
export function JoinAction({ lookup, onChanged, kind = "primary", label, hint = true }) {
  const claim = useClaim("join-season");
  const { pendingRef, refSent } = useMember();
  const done = claim.stage === "done" ? claim.result : null;
  const joinedAt = done?.joinedAt ?? (lookup.season?.joined ? lookup.season.joinedAt : null);
  if (joinedAt) {
    const referral = done?.referral && done.referral !== "already_joined" ? done.referral : null;
    return (
      <>
        <div className={s.actionNote}>
          <Notice tone="ok">
            {done && !done.alreadyJoined ? CLAIMS.join.joined(fmtDate(joinedAt)) : CLAIMS.join.already(fmtDate(joinedAt))}
          </Notice>
        </div>
        {referral ? (
          <div className={s.actionNote}>
            <Notice tone={referral === "attributed" ? "ok" : "info"}>
              {REFERRAL.outcome[referral] ?? REFERRAL.outcome.other}
            </Notice>
          </div>
        ) : null}
      </>
    );
  }
  return (
    <>
      <div className={s.actionRow}>
        <Button
          kind={kind}
          onClick={async () => {
            const sent = pendingRef;
            const result = await claim.run(sent ? { ref: sent } : undefined);
            if (result) {
              if (sent) refSent();
              onChanged?.();
            }
          }}
          disabled={claim.busy}
        >
          {stageText(claim.stage) ?? label}
        </Button>
        <Hint show={hint} />
      </div>
      {pendingRef ? <p className={s.actionFine}>{REFERRAL.pending}</p> : null}
      <ClaimError claim={claim} />
    </>
  );
}

/** The ?discord=<code> outcomes the engine's callback sends (src/app/api/auth/discord/callback). */
function discordOutcome(code) {
  const text = CLAIMS.discord.returned[code] ?? CLAIMS.discord.returned.unknown;
  const tone = code === "linked" ? "ok" : code === "discord_unconfigured" ? "soon" : "error";
  return { code, text, tone };
}

/**
 * Discord sends the browser back with ?discord=<code> after its consent
 * page. Read once, then the parameter comes off the URL, so a reload or a
 * shared link does not repeat it. Returns the outcome, or null.
 */
export function useDiscordReturn() {
  const [returned, setReturned] = useState(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const v = url.searchParams.get("discord");
    if (!v) return;
    setReturned(discordOutcome(v));
    url.searchParams.delete("discord");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  return returned;
}

/** Link Discord (and unlink once linked). */
export function DiscordAction({ configured, linked, onChanged, returned, kind = "secondary", label, hint = true }) {
  const claim = useClaim("discord-link");
  const unlink = useClaim("discord-unlink");

  useEffect(() => {
    if (claim.stage === "done" && claim.result?.authorizeUrl) window.location.assign(claim.result.authorizeUrl);
  }, [claim.stage, claim.result]);

  const soon = !configured || isUnconfigured(claim.error);
  const busy = claim.busy || unlink.busy;
  const unlinked = unlink.stage === "done" ? unlink.result : null;

  return (
    <>
      {returned && !(soon && returned.code === "discord_unconfigured") ? (
        <div className={s.actionNote}>
          <Notice tone={returned.tone}>{returned.text}</Notice>
        </div>
      ) : null}
      {soon ? (
        <div className={s.actionNote}>
          <Notice tone="soon">{CLAIMS.discord.unconfigured}</Notice>
        </div>
      ) : claim.stage === "done" ? (
        <div className={s.actionNote}>
          <Notice tone="info">{CLAIMS.discord.redirecting}</Notice>
        </div>
      ) : (
        <div className={s.actionRow}>
          {linked ? null : (
            <Button kind={kind} onClick={() => claim.run()} disabled={busy}>
              {stageText(claim.stage) ?? label ?? CLAIMS.discord.button}
            </Button>
          )}
          {linked ? (
            <Button
              kind="secondary"
              onClick={async () => {
                if (await unlink.run()) onChanged?.();
              }}
              disabled={busy}
            >
              {stageText(unlink.stage) ?? CLAIMS.discord.unlinkButton}
            </Button>
          ) : (
            <Hint show={hint} />
          )}
        </div>
      )}
      {unlinked ? (
        <div className={s.actionNote}>
          <Notice tone={unlinked.unlinked ? "ok" : "info"}>
            {unlinked.unlinked ? CLAIMS.discord.unlinked : CLAIMS.discord.notLinked}
          </Notice>
        </div>
      ) : null}
      <ClaimError claim={claim} />
      <ClaimError claim={unlink} />
    </>
  );
}

/** The Inner Circle: early access check, Telegram link, request to join. */
export function TelegramAction({ lookup, configured, onChanged, showAccess = true }) {
  const link = useClaim("telegram-link");
  const access = useClaim("inner-circle");

  const fromRung = lookup.rung && INNER_CIRCLE_RUNGS.includes(lookup.rung.key) ? lookup.rung.expiresAt : null;
  const endsAt = access.result?.access?.endsAt ?? link.result?.access?.endsAt ?? fromRung;
  const soon = !configured || isUnconfigured(link.error);
  // The head list is not in the public lookup (review 14), so whether this
  // wallet can claim early is only known after it signs.
  const notEligible = access.stage === "error" && access.error?.code === "not_head_list";
  const linked = link.stage === "done" ? link.result : null;
  const canCheck = !soon && !endsAt && !notEligible && access.stage !== "done";

  return (
    <>
      {/* Feedback 2026-10-28: a What you get card states the access end itself, in the same words as the other cards. */}
      {showAccess || !endsAt ? (
        <p className={endsAt ? s.actionOk : s.actionText}>
          {endsAt ? CLAIMS.innerCircle.access(fmtDate(endsAt)) : CLAIMS.innerCircle.noAccess}
        </p>
      ) : null}
      {soon ? (
        <div className={s.actionNote}>
          <Notice tone="soon">{CLAIMS.innerCircle.unconfigured}</Notice>
        </div>
      ) : (
        <div className={s.actionRow}>
          {canCheck ? (
            <Button
              kind="secondary"
              onClick={async () => {
                if (await access.run()) onChanged?.();
              }}
              disabled={access.busy || link.busy}
            >
              {stageText(access.stage) ?? CLAIMS.innerCircle.checkButton}
            </Button>
          ) : null}
          {linked?.startUrl ? (
            <>
              <Button kind="primary" href={linked.startUrl}>
                {CLAIMS.innerCircle.startLink}
              </Button>
              {linked.inviteLink ? (
                <Button kind="secondary" href={linked.inviteLink}>
                  {CLAIMS.innerCircle.joinButton}
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              kind={endsAt ? "primary" : "secondary"}
              onClick={async () => {
                if (await link.run()) onChanged?.();
              }}
              disabled={link.busy || access.busy}
            >
              {stageText(link.stage) ?? CLAIMS.innerCircle.linkButton}
            </Button>
          )}
        </div>
      )}
      {notEligible ? (
        <div className={s.actionNote}>
          <Notice tone="info">{CLAIMS.innerCircle.notEligible}</Notice>
        </div>
      ) : null}
      {access.stage === "done" && access.result?.access?.endsAt ? (
        <div className={s.actionNote}>
          <Notice tone="ok">
            {access.result.alreadyClaimed
              ? CLAIMS.innerCircle.alreadyClaimed(fmtDate(access.result.access.endsAt))
              : CLAIMS.innerCircle.claimed(fmtDate(access.result.access.endsAt))}
          </Notice>
        </div>
      ) : null}
      {linked ? (
        <div className={s.actionNote}>
          <Notice tone="ok">
            {CLAIMS.innerCircle.startNote(fmtTime(linked.expiresAt))}
            {linked.inviteLink ? "" : ` ${CLAIMS.innerCircle.noInvite}`}
          </Notice>
        </div>
      ) : null}
      {notEligible ? null : <ClaimError claim={access} />}
      <ClaimError claim={link} />
    </>
  );
}

/**
 * The season shirt (v3 backlog ticket 04), on the VIP and merch badge. "Claim
 * shirt" opens the notice; once "I understand" is ticked, one signature of
 * the merch claim answers a single-use code and the store link with the code
 * applied (a repeat claim answers the same code). Never a transaction. The
 * engine checks standing and the live position again at claim time, so a
 * refusal comes back as merch_below_rung or merch_no_position.
 *
 * `demo` (GET /api/members/config merchDemo, or the claim's own `demo`) adds
 * the line that the code is a sample and the link goes nowhere.
 */
export function MerchAction({ earned, demo = false }) {
  const claim = useClaim("merch");
  const [open, setOpen] = useState(false);
  const [ticked, setTicked] = useState(false);
  const [copied, setCopied] = useState(false);
  const done = claim.stage === "done" ? claim.result : null;
  const isDemo = demo || done?.demo === true;

  if (!earned) return <p className={s.actionText}>{MERCH.locked}</p>;

  if (done) {
    if (done.status === "redeemed") {
      return (
        <div className={s.actionNote}>
          <Notice tone="ok">{MERCH.redeemed(fmtDate(done.redeemedAt ?? done.issuedAt))}</Notice>
        </div>
      );
    }
    if (done.status === "expired" || !done.code) {
      return (
        <div className={s.actionNote}>
          <Notice tone="info">{MERCH.expired(fmtDate(done.expiresAt))}</Notice>
        </div>
      );
    }
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(done.code);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    };
    return (
      <div className={s.merch}>
        <div className={s.merchCodeLabel}>{MERCH.code.label}</div>
        <div className={s.merchCode}>{done.code}</div>
        <p className={s.actionFine}>{MERCH.code.until(fmtDate(done.expiresAt))}</p>
        <div className={s.actionRow}>
          {/* Demo walkthrough 2026-10-27: the demo store opens the mock checkout at /members/merch. */}
          {isDemo ? (
            <Button kind="primary" to={`/members/merch/?code=${encodeURIComponent(done.code)}`}>
              {MERCH.code.open}
            </Button>
          ) : done.storeUrl ? (
            <Button kind="primary" href={done.storeUrl}>
              {MERCH.code.open}
            </Button>
          ) : null}
          <Button kind="secondary" onClick={copy}>
            {copied ? MERCH.code.copied : MERCH.code.copy}
          </Button>
        </div>
        <p className={s.actionText}>{MERCH.code.how}</p>
        {done.reissued ? <p className={s.actionText}>{MERCH.code.reissued}</p> : null}
        {isDemo ? (
          <div className={s.actionNote}>
            <Notice tone="soon">{MERCH.demo}</Notice>
          </div>
        ) : null}
      </div>
    );
  }

  if (!open) {
    return (
      <div className={s.merch}>
        <div className={s.merchTitle}>{MERCH.title}</div>
        <p className={s.actionText}>{MERCH.body}</p>
        <div className={s.actionRow}>
          <Button kind="primary" onClick={() => setOpen(true)}>
            {MERCH.start}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.merch}>
      <div className={s.merchNotice} role="region" aria-labelledby="merch-notice-title">
        <h4 className={s.merchTitle} id="merch-notice-title">
          {MERCH.notice.title}
        </h4>
        <p className={s.merchStrong}>{MERCH.notice.mailbox}</p>
        <ul className={s.merchList}>
          {MERCH.notice.items.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className={s.merchSafe}>{MERCH.notice.noTransaction}</p>
        {isDemo ? (
          <div className={s.actionNote}>
            <Notice tone="soon">{MERCH.demo}</Notice>
          </div>
        ) : null}
        <label className={s.merchTick}>
          <input type="checkbox" checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
          <span>{MERCH.notice.tick}</span>
        </label>
        <div className={s.actionRow}>
          <Button kind="primary" onClick={() => claim.run()} disabled={!ticked || claim.busy}>
            {stageText(claim.stage) ?? MERCH.notice.sign}
          </Button>
          <Button
            kind="quiet"
            onClick={() => {
              setOpen(false);
              setTicked(false);
              claim.reset();
            }}
            disabled={claim.busy}
          >
            {MERCH.notice.cancel}
          </Button>
        </div>
      </div>
      <ClaimError claim={claim} />
    </div>
  );
}

/** Academy tracks finished in this browser, with the tokens a claim sends. */
function finishedTracks() {
  return TRACKS.map((track) => {
    const ids = track.lessons.map((l) => l.id);
    const real = completionsFor(ids).filter((t) => !isLocalCompletion(t));
    return { track, tokens: real, finished: real.length === ids.length };
  }).filter((t) => t.finished);
}

/**
 * Claim a finished Academy track, or go to the Academy. `quiet` makes the
 * Academy link secondary; `hideNone` drops the "finish a track" line (the
 * onboarding checklist already says what the step is).
 */
export function AcademyAction({ onChanged, goLabel, quiet = false, hideNone = false }) {
  const claim = useClaim("academy-graduation");
  const [ready, setReady] = useState([]);
  const [claimedKey, setClaimedKey] = useState(null);

  // localStorage, so after mount only (the page is prerendered).
  useEffect(() => {
    setReady(finishedTracks());
  }, []);

  const done = claim.stage === "done" ? claim.result : null;
  const doneLabel = TRACKS.find((t) => t.key === done?.track)?.label ?? "";

  return (
    <>
      <div className={s.actionRow}>
        {ready.map((t) => (
          <Button
            key={t.track.key}
            kind="primary"
            onClick={async () => {
              setClaimedKey(t.track.key);
              if (await claim.run({ track: t.track.key, completions: t.tokens })) onChanged?.();
            }}
            disabled={claim.busy || (done && done.track === t.track.key)}
          >
            {claim.busy && claimedKey === t.track.key ? stageText(claim.stage) : CLAIMS.academy.button(t.track.label)}
          </Button>
        ))}
        <Button kind={ready.length ? "quiet" : hideNone && !quiet ? "primary" : "secondary"} to="/academy">
          {goLabel}
        </Button>
      </div>
      {ready.length === 0 && !hideNone ? <p className={s.actionText}>{CLAIMS.academy.none}</p> : null}
      {done ? (
        <div className={s.actionNote}>
          <Notice tone="ok">
            {done.alreadyClaimed ? CLAIMS.academy.already(doneLabel) : CLAIMS.academy.claimed(doneLabel, fmtInt(done.credited))}
          </Notice>
        </div>
      ) : null}
      <ClaimError claim={claim} />
    </>
  );
}

/** "Sign to see progress": the shared my-standing claim. */
export function StandingAction({ kind = "secondary", label, hint = true }) {
  const { claim, run } = useMyStanding();
  return (
    <>
      <div className={s.actionRow}>
        <Button kind={kind} onClick={run} disabled={claim.busy}>
          {stageText(claim.stage) ?? label}
        </Button>
        <Hint show={hint} />
      </div>
      <ClaimError claim={claim} />
    </>
  );
}

/**
 * The event code card (kept from v1, plan item 4). `bare` (member journey
 * 2026-10-28): the form alone, for the event codes row of Earn more.
 */
export function EventCodeCard({ onChanged, bare = false }) {
  const claim = useClaim("event-code");
  const [code, setCode] = useState("");
  const [empty, setEmpty] = useState(false);

  async function redeem(e) {
    e.preventDefault();
    const value = code.trim();
    if (!value) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    const result = await claim.run({ code: value });
    if (result) {
      setCode("");
      onChanged?.();
    }
  }

  return (
    <div className={bare ? s.eventBare : s.eventCard} id="event-code">
      {bare ? null : (
        <div className={s.eventText}>
          <h3 className={s.eventTitle}>{CLAIMS.event.title}</h3>
          <p className={s.eventBody}>{CLAIMS.event.body}</p>
        </div>
      )}
      <form className={s.codeForm} onSubmit={redeem} noValidate>
        <label className={s.srOnly} htmlFor="members-event-code">
          {CLAIMS.event.label}
        </label>
        <input
          id="members-event-code"
          className={s.codeInput}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={CLAIMS.event.placeholder}
          maxLength={32}
          autoComplete="off"
          spellCheck="false"
        />
        <Button kind="secondary" type="submit" disabled={claim.busy}>
          {stageText(claim.stage) ?? CLAIMS.event.button}
        </Button>
      </form>
      {empty ? (
        <div className={s.eventNote}>
          <Notice tone="info">{CLAIMS.event.empty}</Notice>
        </div>
      ) : null}
      {claim.stage === "done" && claim.result ? (
        <div className={s.eventNote}>
          <Notice tone="ok">{CLAIMS.event.redeemed(claim.result.label, fmtInt(claim.result.amount))}</Notice>
        </div>
      ) : null}
      {claim.stage === "error" ? (
        <div className={s.eventNote}>
          <Notice tone={claim.error?.code === "cancelled" ? "info" : "error"}>{claimErrorText(claim.error)}</Notice>
        </div>
      ) : null}
      <SafePending claim={claim} className={s.eventNote} />
    </div>
  );
}
