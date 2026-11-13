import React, { useEffect, useState } from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { MemberProvider, useMember } from "../lib/member";
import { HeaderLogo } from "../brand";
import { ConnectButton, ConnectModal, ViewAddressForm } from "./Connect";
import { APP_URL, DEMO_AS, SAFE, SHELL, VIEWING } from "../copy";
import { shortAddress } from "../lib/format";
import { isDemoUnlockAll, setDemoUnlockAll } from "../lib/demoUnlock";
import { sameAddress } from "../lib/wallet";
import styles from "./styles.module.css";

/**
 * The members area chrome. Same approach as the Academy shell: not
 * `@theme/Layout`, so no docs navbar, sidebar or footer, and no swizzle. The
 * docs still supply the html document, the global stylesheet and the fonts
 * (Beaufort Pro and Montserrat from src/css/custom.css).
 *
 * The look follows the Alchemix landing page: a blue-black ground, an
 * architectural grid of full-bleed hairlines with small dot nodes where they
 * cross. v2: sentence case in the nav, the Connect button at its end (the
 * standard connected-wallet flow), and "view any address" moved to the footer.
 */

const NAV = [
  { to: "/members", label: SHELL.nav.home },
  // Feedback 2026-10-28 (Keenan): Badges in the nav; the leaderboard is linked from the hero's rank, the footer and the Essence section.
  { to: "/members/badges", label: SHELL.nav.badges },
  // Design notes 2026-11-03 (metalface 25, 30): the store left the badges page's tabs for its own page.
  { to: "/members/store", label: SHELL.nav.store },
  { to: "/members/feedback", label: SHELL.nav.feedback },
];

export default function MembersShell({ title, description, children }) {
  return (
    <MemberProvider>
      <Head>
        <title>{title ? `${title} | Alchemix` : "Alchemix members area"}</title>
        <meta name="description" content={description ?? SHELL.description} />
      </Head>
      <Frame>{children}</Frame>
    </MemberProvider>
  );
}

function Frame({ children }) {
  const { pathname } = useLocation();
  const here = pathname.replace(/\/+$/, "") || "/";
  const { modalOpen } = useMember();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Node className={styles.nodeBL} />
          <Node className={styles.nodeBR} />
          <Link to="/members" className={styles.brand} aria-label="Alchemix members area">
            <HeaderLogo styles={styles} word={SHELL.brandWord} />
          </Link>

          <nav className={styles.nav} aria-label="Members area">
            <div className={styles.navLinks}>
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${styles.navLink} ${here === item.to ? styles.navActive : ""}`}
                  aria-current={here === item.to ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <span className={styles.navRule} aria-hidden="true" />
              <Link to="/academy" className={styles.navOut}>
                {SHELL.nav.academy}
              </Link>
              <Link to="/user" className={styles.navOut}>
                {SHELL.nav.docs}
              </Link>
            </div>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <ViewingBanner />
      <main className={styles.main}>{children}</main>

      <Footer />
      {modalOpen ? <ConnectModal /> : null}
    </div>
  );
}

function Footer() {
  // V3 backlog ticket 07: a connected Safe may pay gas to sign, so the line says so.
  const { safeConnected } = useMember();
  const [viewing, setViewing] = useState(false);
  // Demo builds only (Keenan, 2026-11-05): show every badge as earned, to see each card's design.
  const { siteConfig } = useDocusaurusContext();
  const demo = siteConfig?.customFields?.membersShowProposals === true;
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setUnlocked(isDemoUnlockAll());
  }, []);
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Node className={styles.nodeTL} />
        <Node className={styles.nodeTR} />
        <div className={styles.footerLinks}>
          <Link to="/members/leaderboard">{SHELL.footerLinks.leaderboard}</Link>
          <Link to="/members/feedback">{SHELL.footerLinks.feedback}</Link>
          <Link to="/members/leaving">{SHELL.footerLinks.leaving}</Link>
          <button
            type="button"
            className={styles.footerButton}
            aria-expanded={viewing}
            aria-controls="members-view-any"
            onClick={() => setViewing((v) => !v)}
          >
            {SHELL.footerLinks.view}
          </button>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">
            {SHELL.footerLinks.app}
          </a>
          {demo ? (
            <button type="button" className={styles.footerButton} aria-pressed={unlocked} onClick={() => setDemoUnlockAll(!unlocked)}>
              {unlocked ? SHELL.footerLinks.demoRelock : SHELL.footerLinks.demoUnlock}
            </button>
          ) : null}
        </div>
        {viewing ? (
          <div className={styles.footerView} id="members-view-any">
            <ViewAddressForm id="members-view-footer" onDone={() => setViewing(false)} />
          </div>
        ) : null}
        <p>{safeConnected ? SAFE.signHint : SHELL.footer}</p>
      </div>
    </footer>
  );
}

/**
 * The viewing banner (design notes 2026-11-03, metalface notes 1 and 11: the
 * per-page viewing strips were complex; one line, top and centre of every
 * page). It shows while the page is reading an address that is not the
 * connected wallet: "Viewing 0xa84a...0197, read only", then "Act as this
 * wallet" (only when a demo engine offers demo sign-in) and "Stop viewing".
 * The connected wallet, and an address the demo acts as, show in the header's
 * wallet button instead, where "Stop acting" lives.
 */
function ViewingBanner() {
  const { address, account, source, clear, demoSignIn, actAs } = useMember();
  if (!address || source === "wallet" || sameAddress(account, address)) return null;
  return (
    <div className={styles.viewing} role="status">
      <div className={styles.viewingInner}>
        <span className={styles.viewingText} title={address}>
          {VIEWING.banner(shortAddress(address))}
        </span>
        {demoSignIn ? (
          <button type="button" className={styles.viewingButton} onClick={() => actAs(address)}>
            {DEMO_AS.act}
          </button>
        ) : null}
        <button type="button" className={styles.viewingButton} onClick={clear}>
          {VIEWING.stop}
        </button>
      </div>
    </div>
  );
}

/** A dot where two hairlines cross. */
export function Node({ className }) {
  return <span className={`${styles.node} ${className ?? ""}`} aria-hidden="true" />;
}
