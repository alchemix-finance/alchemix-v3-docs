import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { useConnectors } from "wagmi";
import { useMember } from "../lib/member";
import { isAddress, listedConnectors, sameAddress } from "../lib/wallet";
import { shortAddress } from "../lib/format";
import { CONNECT, DEMO_AS } from "../copy";
import { SafeHint } from "../parts";
import styles from "./styles.module.css";

/**
 * The standard connected-wallet flow (members area v2, plan item 5): a
 * Connect button at the end of the nav opens a modal that lists the wallets
 * this browser announced (EIP-6963), or the plain browser wallet. Once
 * connected, the button becomes the short address with a small menu.
 * "View any address" sits at the foot of the modal and in the page footer.
 */
export function ConnectButton() {
  const { account, actingAs, connectionStatus, openConnect, disconnect, view, address } = useMember();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!account) {
    const busy = connectionStatus === "connecting" || connectionStatus === "reconnecting";
    return (
      <button type="button" className={styles.connect} onClick={openConnect}>
        {busy ? CONNECT.connecting : CONNECT.button}
      </button>
    );
  }

  return (
    <div className={styles.account} ref={ref}>
      <button
        type="button"
        className={styles.accountChip}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={account}
      >
        <span className={styles.accountDot} aria-hidden="true" />
        {shortAddress(account)}
        {actingAs ? <span className={styles.demoTag}>{DEMO_AS.tag}</span> : null}
      </button>
      {open ? (
        <div className={styles.menu} role="menu">
          {!sameAddress(address, account) ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                view(account, "wallet");
                setOpen(false);
              }}
            >
              {CONNECT.menu.viewMine}
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              disconnect();
            }}
          >
            {actingAs ? DEMO_AS.menuStop : CONNECT.menu.disconnect}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ConnectModal() {
  const { closeConnect, connectWith, connecting, connectError, inSafe, demoSignIn } = useMember();
  // Ticket 07: the Safe is listed inside Safe{Wallet}; WalletConnect only with a project id.
  const connectors = listedConnectors(useConnectors(), { inSafe });
  const panel = useRef(null);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeConnect();
    document.addEventListener("keydown", esc);
    const first = panel.current?.querySelector("button, input");
    first?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [closeConnect]);

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && closeConnect()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="members-connect-title" ref={panel}>
        <div className={styles.modalHead}>
          <h2 id="members-connect-title" className={styles.modalTitle}>
            {CONNECT.title}
          </h2>
          <button type="button" className={styles.modalClose} onClick={closeConnect} aria-label={CONNECT.close}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className={styles.modalBody}>{CONNECT.body}</p>

        {connectors.length > 0 ? (
          <>
            <div className={styles.modalCaption}>{CONNECT.detected}</div>
            <ul className={styles.wallets}>
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    className={styles.wallet}
                    onClick={() => connectWith(c)}
                    disabled={connecting !== null}
                  >
                    {c.icon ? (
                      <img src={c.icon} alt="" className={styles.walletIcon} />
                    ) : (
                      <span className={styles.walletGlyph} aria-hidden="true" />
                    )}
                    <span className={styles.walletName}>{c.id === "injected" ? CONNECT.browserWallet : c.name}</span>
                    {connecting === c.uid ? <span className={styles.walletState}>{CONNECT.waiting}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.modalNone}>{CONNECT.none}</p>
        )}
        {connectError ? (
          <p className={styles.modalError} role="alert">
            {connectError === "rejected" ? CONNECT.rejected : CONNECT.failed}
          </p>
        ) : null}
        {/* Ticket 07: a Safe signs from inside Safe{Wallet}, not from this list. */}
        <SafeHint />

        <div className={styles.modalView}>
          <div className={styles.modalCaption}>{CONNECT.viewTitle}</div>
          <p className={styles.modalHint}>{CONNECT.viewHint}</p>
          <ViewAddressForm id="members-view-modal" onDone={closeConnect} />
        </div>
        {demoSignIn ? (
          <div className={styles.modalView}>
            <div className={styles.modalCaption}>{DEMO_AS.modalTitle}</div>
            <p className={styles.modalHint}>{DEMO_AS.modalHint}</p>
            <ViewAddressForm id="members-act-modal" act onDone={closeConnect} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Paste any address to view it read only. Off the home page, it goes to the
 * home page. With `act` (demo sign-in only), the page acts as it instead.
 */
export function ViewAddressForm({ id, onDone, act = false }) {
  const { view, account, actAs } = useMember();
  const history = useHistory();
  const { pathname } = useLocation();
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);

  function submit(e) {
    e.preventDefault();
    const value = text.trim();
    if (!isAddress(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (act) actAs(value);
    else view(value, sameAddress(value, account) ? "wallet" : "paste");
    onDone?.();
    // A claim waiting on the modal (the feedback page) stays on its page.
    if (act && (pathname.replace(/\/+$/, "") || "/") !== "/members") return;
    if ((pathname.replace(/\/+$/, "") || "/") !== "/members") history.push("/members");
  }

  return (
    <form className={styles.viewForm} onSubmit={submit} noValidate>
      <label className={styles.srOnly} htmlFor={id}>
        {act ? DEMO_AS.modalTitle : CONNECT.viewTitle}
      </label>
      <div className={styles.viewRow}>
        <input
          id={id}
          className={styles.viewInput}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setInvalid(false);
          }}
          placeholder={CONNECT.placeholder}
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
        />
        <button type="submit" className={styles.viewSubmit}>
          {act ? DEMO_AS.submit : CONNECT.view}
        </button>
      </div>
      {invalid ? (
        <p className={styles.viewError} id={`${id}-error`} role="alert">
          {CONNECT.badAddress}
        </p>
      ) : null}
    </form>
  );
}
