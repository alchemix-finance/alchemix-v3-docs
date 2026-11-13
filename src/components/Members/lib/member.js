import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";
import {
  campaignQuery,
  claimMessage,
  listSeasons,
  lookupWallet,
  membersBase,
  readMembersConfig,
  readSeasonProgress,
  sendClaim,
  signedClaim,
} from "./api";
import {
  inFrame,
  isAddress,
  isSafeConnection,
  safeMessageHash,
  safeSignatureNow,
  sameAddress,
  setActiveProvider,
  signAsDemo,
  signWithSafe,
  walletConfig,
} from "./wallet";
import { ERRORS } from "../copy";

/**
 * Who the members area is looking at, shared by every members page.
 *
 * Two separate things:
 * - `address`: the address being viewed. Connected or pasted ("view any
 *   address"), it only drives read-only lookups, so viewing someone else's
 *   address is fine.
 * - `account`: the wallet connected through the Connect button (wagmi). Only
 *   it can sign, so a claim needs it to be the viewed address.
 *
 * Connecting views the connected wallet. The viewed address is remembered for
 * the tab (sessionStorage) so moving between members pages keeps it. A
 * `?address=` on the URL wins on load, which is what shareable links and
 * campaign links use.
 *
 * The landing URL's campaign parameters are kept next to it (gap audit item
 * 5). Every members page mounts its own provider and the URL loses the query
 * on the first click, so the campaign waits in sessionStorage until a lookup
 * sends it, once, and is then marked sent.
 *
 * A personal link (v3 backlog ticket 11) is a landing URL with both an
 * address and a campaign: the outreach export makes one per wallet. Its
 * address is kept for the tab too (`linkAddress`), so the home page can open
 * on the returning-user hero while that address is the one on screen.
 *
 * A referral link (v3 backlog ticket 08) is any members URL with `?ref=CODE`.
 * The code is kept in this browser (localStorage, so it outlives the tab)
 * until a join-season claim is signed, which sends it (Home/actions.jsx
 * JoinAction) and then drops it. A later `?ref` replaces an unsent one.
 *
 * Demo sign-in (demo walkthrough 2026-10-28): when the engine says
 * `demoSignIn` (a demo engine only), the page can act as any address. That
 * address becomes `account`, as if its wallet were connected, and its claims
 * go with the stand-in signature instead of a wallet prompt. Kept for the tab.
 * A claim on a viewed address acts as it on its own. Connecting a real wallet,
 * or Disconnect, ends it. Against any other engine none of this shows.
 */

const STORAGE_KEY = "alchemix-members-address-v1";
const CAMPAIGN_KEY = "alchemix-members-campaign-v1";
const LINK_KEY = "alchemix-members-link-v1";
const REF_KEY = "alchemix-members-ref-v1";
const DEMO_AS_KEY = "alchemix-members-demo-as-v1";

/** The address this tab acts as in demo sign-in, or null. */
function storedDemoAs() {
  try {
    const v = window.sessionStorage.getItem(DEMO_AS_KEY);
    return isAddress(v) ? v : null;
  } catch {
    return null;
  }
}

function storeDemoAs(address) {
  try {
    if (address) window.sessionStorage.setItem(DEMO_AS_KEY, address);
    else window.sessionStorage.removeItem(DEMO_AS_KEY);
  } catch {
    // Blocked storage: acting lasts until the page reloads.
  }
}

/** A referral code as the engine makes them: 10 characters, no 0, O, 1, I or L. */
export function referralCodeFrom(value) {
  const code = String(value ?? "").trim().toUpperCase();
  return /^[2-9A-Z_]{10}$/.test(code) ? code : null;
}

/** The referral code waiting for this browser's join, or null. */
function storedRef() {
  try {
    return referralCodeFrom(window.localStorage.getItem(REF_KEY));
  } catch {
    return null;
  }
}

function storeRef(code) {
  try {
    if (code) window.localStorage.setItem(REF_KEY, code);
    else window.localStorage.removeItem(REF_KEY);
  } catch {
    // Blocked storage: the code still goes with a join signed on this page.
  }
}

/** The address a personal link opened in this tab, or null. */
function rememberedLink() {
  try {
    const v = window.sessionStorage.getItem(LINK_KEY);
    return isAddress(v) ? v : null;
  } catch {
    return null;
  }
}

function rememberLink(address) {
  try {
    window.sessionStorage.setItem(LINK_KEY, address);
  } catch {
    // Blocked storage: the hero still shows on the landing page itself.
  }
}

/** The campaign query waiting to be sent with a lookup, or "". */
function pendingCampaign() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(CAMPAIGN_KEY) ?? "null");
    return parsed && !parsed.sent && typeof parsed.query === "string" ? parsed.query : "";
  } catch {
    return "";
  }
}

function storeCampaign(value) {
  try {
    window.sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(value));
  } catch {
    // Blocked storage: the campaign still goes with this page's first lookup.
  }
}

function remembered() {
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    if (!v) return null;
    const parsed = JSON.parse(v);
    return parsed && isAddress(parsed.address) ? parsed : null;
  } catch {
    return null;
  }
}

function remember(value) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the page still works, it just forgets.
  }
}

const MemberContext = createContext(null);

let queryClient = null;
function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  return (queryClient ??= new QueryClient());
}

/** wagmi and react-query around the members state. Mounted by the members shell only. */
export function MemberProvider({ children }) {
  const { siteConfig } = useDocusaurusContext();
  // Ticket 07: WalletConnect only when the build has a project id.
  const projectId = siteConfig?.customFields?.membersWalletConnectProjectId ?? "";
  const [config] = useState(() => walletConfig(projectId));
  const [client] = useState(getQueryClient);
  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={client}>
        <MemberState>{children}</MemberState>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function MemberState({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const base = membersBase(siteConfig);

  const connection = useConnection();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const { disconnectAsync } = useDisconnect();
  const walletAccount = connection.status === "connected" ? connection.address : null;

  // Demo sign-in: only once the engine says it takes the stand-in signature.
  const [demoSignIn, setDemoSignIn] = useState(false);
  const [demoAs, setDemoAs] = useState(null);
  useEffect(() => {
    let live = true;
    readMembersConfig(base)
      .then((data) => live && setDemoSignIn(data.demoSignIn === true))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [base]);
  const actingAs = demoSignIn ? demoAs : null;
  const account = actingAs ?? walletAccount;
  const actingRef = useRef(null);
  actingRef.current = actingAs;

  const [viewed, setViewed] = useState({ address: null, source: null });
  const [linkAddress, setLinkAddress] = useState(null);
  const [pendingRef, setPendingRef] = useState(null);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [connectError, setConnectError] = useState(null);
  const sourceRef = useRef(null);
  sourceRef.current = viewed.source;
  const viewedRef = useRef(null);
  viewedRef.current = viewed.address;
  // A claim waiting on the modal: resolved with the account, or null when the modal closes.
  const waiting = useRef(null);
  // The campaign query for the next lookup. A ref, so marking it sent never re-runs a lookup.
  const campaignRef = useRef("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromLanding = campaignQuery(window.location.search);
    if (fromLanding) storeCampaign({ query: fromLanding, sent: false });
    campaignRef.current = fromLanding || pendingCampaign();
    const fromUrl = params.get("address");
    if (isAddress(fromUrl)) {
      // Feedback 2026-10-28: remembered too, so a linked address survives the move to Badges or the leaderboard.
      const fromLink = { address: fromUrl.trim(), source: "paste" };
      setViewed(fromLink);
      remember(fromLink);
    } else {
      const saved = remembered();
      if (saved) setViewed(saved);
    }
    if (isAddress(fromUrl) && fromLanding) {
      rememberLink(fromUrl.trim());
      setLinkAddress(fromUrl.trim());
    } else setLinkAddress(rememberedLink());
    const ref = referralCodeFrom(params.get("ref"));
    if (ref) storeRef(ref);
    setPendingRef(ref ?? storedRef());
    setDemoAs(storedDemoAs());
    setReady(true);
  }, []);

  // Signing goes to the connected connector's own provider.
  useEffect(() => {
    let live = true;
    const connector = connection.status === "connected" ? connection.connector : null;
    if (!connector) {
      setActiveProvider(null);
      return undefined;
    }
    connector
      .getProvider()
      .then((p) => live && setActiveProvider(p, connector.type))
      .catch(() => live && setActiveProvider(null));
    return () => {
      live = false;
    };
  }, [connection.status, connection.connector]);

  const view = useCallback((address, source = "paste") => {
    const next = { address: address.trim(), source };
    setViewed(next);
    remember(next);
  }, []);

  // V3 backlog ticket 07: inside Safe{Wallet} (the members area added as a
  // custom app) the page connects as the Safe on its own, once, and shows it.
  // Outside a frame the Safe connector has no provider, so nothing happens.
  const [inSafe, setInSafe] = useState(false);
  const safeTried = useRef(false);
  useEffect(() => {
    if (!ready || safeTried.current || !inFrame()) return undefined;
    const safeConnector = connectors.find((c) => c.type === "safe");
    if (!safeConnector) return undefined;
    safeTried.current = true;
    (async () => {
      const p = await safeConnector.getProvider().catch(() => null);
      if (!p) return;
      setInSafe(true);
      try {
        const result = await connectAsync({ connector: safeConnector });
        setActiveProvider(p, safeConnector.type);
        const a = result.accounts?.[0];
        if (a) view(a, "wallet");
      } catch {
        // Already connected as the Safe (a reconnect got there first), or the
        // Safe refused: the Connect button still lists it.
      }
    })();
    return undefined;
  }, [ready, connectors, connectAsync, view]);

  const clear = useCallback(() => {
    setViewed({ address: null, source: null });
    remember(null);
  }, []);

  // A connected wallet is what the page shows, unless an address was pasted.
  // When the wallet switches account, a wallet view follows it.
  useEffect(() => {
    if (!ready || actingRef.current) return;
    if (account) {
      if (!viewedRef.current || sourceRef.current === "wallet") {
        if (!sameAddress(viewedRef.current, account)) view(account, "wallet");
      }
    } else if (connection.status === "disconnected" && sourceRef.current === "wallet") {
      clear();
    }
  }, [account, connection.status, ready, view, clear]);

  const openConnect = useCallback(() => {
    setConnectError(null);
    setModalOpen(true);
  }, []);

  const closeConnect = useCallback(() => {
    setModalOpen(false);
    setConnecting(null);
    if (waiting.current) {
      waiting.current(null);
      waiting.current = null;
    }
  }, []);

  /** Connect through one connector from the modal. */
  const connectWith = useCallback(
    async (connector) => {
      setConnectError(null);
      setConnecting(connector.uid);
      try {
        const result = await connectAsync({ connector });
        const a = result.accounts?.[0] ?? null;
        // A real wallet ends demo sign-in.
        setDemoAs(null);
        storeDemoAs(null);
        // Set the signing provider now, so a claim waiting on this connect can sign at once.
        try {
          setActiveProvider(await connector.getProvider(), connector.type);
        } catch {
          // The effect above sets it once wagmi reports the connection.
        }
        if (a && (!viewedRef.current || sourceRef.current === "wallet" || !waiting.current)) view(a, "wallet");
        setModalOpen(false);
        if (waiting.current) {
          waiting.current(a);
          waiting.current = null;
        }
        return a;
      } catch (e) {
        const rejected = e?.code === 4001 || /reject|denied|cancel/i.test(String(e?.message ?? e?.shortMessage));
        setConnectError(rejected ? "rejected" : "failed");
        return null;
      } finally {
        setConnecting(null);
      }
    },
    [connectAsync, view],
  );

  /** Demo sign-in: act as this address, as if its wallet were connected. */
  const actAs = useCallback(
    (address) => {
      const a = address.trim();
      setDemoAs(a);
      storeDemoAs(a);
      view(a, "wallet");
      setModalOpen(false);
      if (waiting.current) {
        waiting.current(a);
        waiting.current = null;
      }
    },
    [view],
  );

  const disconnect = useCallback(async () => {
    if (actingRef.current) {
      // Demo sign-in ends; a real wallet still connected stays connected.
      setDemoAs(null);
      storeDemoAs(null);
      if (sourceRef.current === "wallet") clear();
      return;
    }
    try {
      await disconnectAsync();
    } catch {
      // Nothing to undo.
    }
    if (sourceRef.current === "wallet") clear();
  }, [disconnectAsync, clear]);

  // For signing: the connected account, or the modal until one connects. The
  // viewed address does not change unless nothing was viewed yet.
  const ensureAccount = useCallback(() => {
    if (account) return Promise.resolve(account);
    return new Promise((resolve) => {
      waiting.current = resolve;
      setConnectError(null);
      setModalOpen(true);
    });
  }, [account]);

  /** The join-season claim sent the referral code (whatever the engine made of it): forget it. */
  const refSent = useCallback(() => {
    storeRef(null);
    setPendingRef(null);
  }, []);

  const takeCampaign = useCallback(() => campaignRef.current, []);
  const campaignSent = useCallback((query) => {
    if (!query || campaignRef.current !== query) return;
    campaignRef.current = "";
    storeCampaign({ query, sent: true });
  }, []);

  // Bumped after every successful claim, so views built on claim results
  // (the signed standing number) know they may be out of date.
  const [claimsVersion, setClaimsVersion] = useState(0);
  const claimed = useCallback(() => setClaimsVersion((v) => v + 1), []);

  const value = {
    base,
    ready,
    takeCampaign,
    campaignSent,
    claimsVersion,
    claimed,
    address: viewed.address,
    source: viewed.source,
    /** True while the address on screen is the one a personal link opened. */
    fromPersonalLink: Boolean(linkAddress && sameAddress(linkAddress, viewed.address)),
    /** The ?ref code waiting to go with this browser's join-season claim, or null. */
    pendingRef,
    refSent,
    account,
    /** Demo sign-in: the engine takes the stand-in signature, so the page offers "Act as this wallet". */
    demoSignIn,
    /** The address this tab acts as in demo sign-in, or null. */
    actingAs,
    actAs,
    connectionStatus: actingAs ? "connected" : connection.status,
    connectorName: actingAs ? null : connection.status === "connected" ? connection.connector?.name ?? null : null,
    /** Ticket 07: the page runs inside Safe{Wallet}. */
    inSafe,
    /** Ticket 07: the connected wallet is a Safe, through the Safe App. */
    safeConnected: !actingAs && connection.status === "connected" && connection.connector?.type === "safe",
    modalOpen,
    openConnect,
    closeConnect,
    connectWith,
    connecting,
    connectError,
    disconnect,
    view,
    clear,
    ensureAccount,
  };
  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMember needs a MemberProvider (the MembersShell provides one).");
  return ctx;
}

/** Plain words for a failure: the members copy for known codes, else the engine's message. */
export function errorText(e) {
  if (!e) return "";
  if (e.code && ERRORS[e.code]) return ERRORS[e.code];
  if (typeof e.message === "string" && e.message && e.message !== "network") return e.message;
  return ERRORS.generic;
}

/**
 * The wallet lookup for the viewed address. Re-reads when the address changes.
 * `refresh` re-reads past the browser cache, for right after a claim.
 */
export function useLookup() {
  const { base, address, ready, takeCampaign, campaignSent } = useMember();
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready || !address) {
      setState({ status: "idle", data: null, error: null });
      return undefined;
    }
    let live = true;
    const campaign = takeCampaign();
    setState((s) => ({ status: "loading", data: sameAddress(s.data?.address, address) ? s.data : null, error: null }));
    lookupWallet(base, address, campaign, { fresh: tick > 0 })
      .then((data) => {
        campaignSent(campaign);
        if (live) setState({ status: "ready", data, error: null });
      })
      .catch((error) => live && setState({ status: "error", data: null, error }));
    return () => {
      live = false;
    };
  }, [base, address, ready, tick, takeCampaign, campaignSent]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, refresh };
}

/** A read made once per page, with `retry`. */
function useRead(read) {
  const { base } = useMember();
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, status: "loading", error: null }));
    read(base)
      .then((data) => live && setState({ status: "ready", data, error: null }))
      .catch((error) => live && setState({ status: "error", data: null, error }));
    return () => {
      live = false;
    };
  }, [base, tick, read]);
  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, retry };
}

/** The season list (rungs, labels, access end). */
export function useSeasons() {
  return useRead(listSeasons);
}

/** GET /api/seasons/current/progress: the banner and the season progress section. */
export function useSeasonProgress() {
  return useRead(readSeasonProgress);
}

/**
 * Whether Discord and Telegram linking can work at all (GET
 * /api/members/config), read on load so a badge can say "coming soon" before
 * asking for a signature. Until it answers, or if it fails, both are treated
 * as configured: the claim itself still answers `*_unconfigured`.
 *
 * V3 backlog ticket 04: `merchDemo` is true when the engine's shirt claim
 * runs against the demo store (no Shopify settings), so the shirt panel says
 * the code is a sample. False until the engine says so; the claim's own
 * answer carries `demo` too.
 */
export function useMembersConfig() {
  const { base } = useMember();
  const [config, setConfig] = useState({
    status: "loading",
    discordConfigured: true,
    telegramConfigured: true,
    merchDemo: false,
    // Funnel review 2026-10-23: the markets with their MYT vault addresses, for deep links into the app.
    markets: [],
  });
  useEffect(() => {
    let live = true;
    readMembersConfig(base)
      .then((data) =>
        live &&
        setConfig({
          status: "ready",
          discordConfigured: data.discordConfigured === true,
          telegramConfigured: data.telegramConfigured === true,
          merchDemo: data.merchDemo === true,
          markets: Array.isArray(data.markets) ? data.markets : [],
        }),
      )
      .catch(() => live && setConfig((c) => ({ ...c, status: "error" })));
    return () => {
      live = false;
    };
  }, [base]);
  return config;
}

/**
 * V3 backlog ticket 07: a Safe's claim message while its owners sign. Kept in
 * this browser per (address, claim) until it is sent, refused for good, or
 * past the message's own Expiration Time, so a page reloaded inside
 * Safe{Wallet} can still check again. `kind` is "offchain" (owners sign a
 * Safe message) or "onchain" (the Safe signs with a transaction);
 * `messageHash` is where Safe{Wallet} files an off-chain message.
 */
const SAFE_PENDING_KEY = "alchemix-members-safe-pending-v1";

function pendingAll() {
  try {
    const all = JSON.parse(window.localStorage.getItem(SAFE_PENDING_KEY) ?? "{}");
    return all && typeof all === "object" ? all : {};
  } catch {
    return {};
  }
}

function pendingKey(address, claim) {
  return `${String(address).toLowerCase()}:${claim}`;
}

/** The waiting Safe message for this address and claim, or null (also once it expired). */
function readPending(address, claim) {
  if (!address) return null;
  const entry = pendingAll()[pendingKey(address, claim)];
  if (!entry || typeof entry.message !== "string") return null;
  const expires = Date.parse(/Expiration Time: (\S+)/.exec(entry.message)?.[1] ?? "");
  if (Number.isFinite(expires) && expires <= Date.now()) {
    storePending(address, claim, null);
    return null;
  }
  return entry;
}

function storePending(address, claim, entry) {
  try {
    const all = pendingAll();
    if (entry) all[pendingKey(address, claim)] = entry;
    else delete all[pendingKey(address, claim)];
    window.localStorage.setItem(SAFE_PENDING_KEY, JSON.stringify(all));
  } catch {
    // Blocked storage: check again still works until the page reloads.
  }
}

/** Engine answers that end a waiting Safe message for good: ask for a new one. */
const PENDING_DEAD = new Set(["nonce_used", "nonce_expired", "nonce_invalid", "params_mismatch", "claim_mismatch"]);

/**
 * One signed claim for the viewed address. `stage` is idle, connect, sign,
 * send, done or error. The connected wallet must be the viewed address: a
 * signature from another wallet would claim for that wallet instead, which is
 * never what the person looking at this page means.
 *
 * V3 backlog ticket 07, a Safe through the Safe App: two more stages.
 * "pending" while the Safe's owners sign (or its signing transaction waits) in
 * Safe{Wallet}; the button then says "Check again", and `run` checks instead
 * of asking for a new message. "checking" while it does. `pending` is the
 * waiting message (its `kind`), `note` is "notYet" or "openInSafe" after a
 * check that found nothing to send.
 */
const READ_ONLY_CLAIMS = new Set(["my-standing", "my-feedback"]);

export function useClaim(claim) {
  const { base, address, account, ensureAccount, view, claimed, demoSignIn, actingAs, actAs } = useMember();
  const [stage, setStage] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPendingState] = useState(null);
  const [note, setNote] = useState(null);
  const pendingRef = useRef(null);

  const setPending = useCallback(
    (owner, entry) => {
      pendingRef.current = entry;
      setPendingState(entry);
      if (owner) storePending(owner, claim, entry);
    },
    [claim],
  );

  // A Safe message waiting for this address and claim, from an earlier visit.
  useEffect(() => {
    const entry = readPending(address, claim);
    pendingRef.current = entry;
    setPendingState(entry);
    setNote(null);
    setStage((s) => (entry && (s === "idle" || s === "pending") ? "pending" : s === "pending" ? "idle" : s));
  }, [address, claim]);

  /** Send a finished signature for the waiting message. */
  const sendPending = useCallback(
    async (owner, entry, signature) => {
      setStage("send");
      try {
        const value = await sendClaim(base, claim, { message: entry.message, signature, params: entry.params });
        setPending(owner, null);
        setNote(null);
        setResult(value);
        setStage("done");
        if (!READ_ONLY_CLAIMS.has(claim)) claimed();
        return value;
      } catch (e) {
        if (e?.code === "signature_invalid") {
          // The Safe does not accept it yet; a contract wallet's message stays usable.
          setNote("notYet");
          setStage("pending");
          return null;
        }
        if (PENDING_DEAD.has(e?.code)) setPending(owner, null);
        setStage("error");
        setError(e);
        return null;
      }
    },
    [base, claim, claimed, setPending],
  );

  /**
   * "Check again": send the waiting message once the Safe accepts it. `quiet`
   * (the check right after Safe{Wallet} answers) says nothing when it finds
   * nothing yet.
   */
  const checkAgain = useCallback(
    async (owner, entry, { quiet = false } = {}) => {
      setError(null);
      setStage("checking");
      let signature = null;
      try {
        signature = await safeSignatureNow(entry);
      } catch (e) {
        setNote(e?.code === "not_in_safe" ? "openInSafe" : quiet ? null : "notYet");
        setStage("pending");
        return null;
      }
      if (!signature) {
        if (!quiet) setNote("notYet");
        setStage("pending");
        return null;
      }
      return sendPending(owner, entry, signature);
    },
    [sendPending],
  );

  /** A new claim through the Safe App: message, then Safe{Wallet}'s own signing flow. */
  const runSafe = useCallback(
    async (signer, params) => {
      setStage("sign");
      let entry;
      try {
        // The params go with the message request, so the engine binds them to the Safe's message.
        const { message, chainId } = await claimMessage(base, claim, { address: signer, params });
        entry = {
          message,
          params,
          kind: "offchain",
          messageHash: safeMessageHash({ safeAddress: signer, chainId, message }),
        };
      } catch (e) {
        setStage("error");
        setError(e);
        return null;
      }
      // Kept before the prompt opens, and the button already offers "Check
      // again": with more than one owner Safe{Wallet} may not answer until all
      // have signed, and the page may be reloaded by then.
      setPending(signer, entry);
      setNote(null);
      setStage("pending");
      let answer;
      try {
        answer = await signWithSafe(entry.message);
      } catch (e) {
        if (pendingRef.current?.message !== entry.message) return null;
        if (e?.code === "cancelled") {
          // Safe{Wallet} answers "rejected" whenever its signing window closes
          // before every owner signed, including right after the first owner
          // signed. So the message stays: "Check again" finds it once the
          // owners are done, and "Sign a new message" drops it.
          setStage("pending");
          return null;
        }
        setStage("error");
        setError(e);
        return null;
      }
      // A "check again" may have sent it while the prompt was open.
      if (pendingRef.current?.message !== entry.message) return null;
      if (answer.signature) return sendPending(signer, entry, answer.signature);
      const next = {
        ...entry,
        kind: answer.pending,
        ...(answer.messageHash ? { messageHash: answer.messageHash } : {}),
      };
      setPending(signer, next);
      // A one-owner Safe may be done already.
      return checkAgain(signer, next, { quiet: true });
    },
    [base, claim, setPending, sendPending, checkAgain],
  );

  const run = useCallback(
    async (params) => {
      setError(null);
      setResult(null);
      // Ticket 07: a Safe message is waiting for this address: check it, never ask twice.
      if (pendingRef.current && address) return checkAgain(address, pendingRef.current);
      let signer = account;
      // Demo sign-in: a claim on the viewed address acts as it, no wallet asked.
      let demo = Boolean(actingAs && sameAddress(actingAs, signer));
      if (demoSignIn && address && !sameAddress(signer, address)) {
        actAs(address);
        signer = address;
        demo = true;
      }
      if (!signer || !sameAddress(signer, address)) {
        setStage("connect");
        signer = await ensureAccount();
        if (!signer) {
          setStage("error");
          setError({ code: "connect_first" });
          return null;
        }
        // The modal's demo form acts as an address; its wallet list connects one.
        demo = demoSignIn && sameAddress(storedDemoAs(), signer);
        if (!address) {
          // Nothing viewed yet (the feedback page): the connected wallet becomes the view.
          view(signer, "wallet");
        } else if (!sameAddress(signer, address)) {
          setStage("error");
          setError({ code: "wrong_account", account: signer });
          return null;
        }
      }
      if (!demo && isSafeConnection()) return runSafe(signer, params);
      try {
        const value = await signedClaim(base, claim, {
          address: signer,
          params,
          sign: demo ? signAsDemo : undefined,
          onStage: (s) => setStage(s),
        });
        setResult(value);
        setStage("done");
        if (!READ_ONLY_CLAIMS.has(claim)) claimed();
        return value;
      } catch (e) {
        setStage("error");
        setError(e);
        return null;
      }
    },
    [base, claim, address, account, ensureAccount, view, claimed, checkAgain, runSafe, demoSignIn, actingAs, actAs],
  );

  const reset = useCallback(() => {
    // A waiting Safe message survives a reset: the button goes back to "Check again".
    setStage(pendingRef.current ? "pending" : "idle");
    setResult(null);
    setError(null);
  }, []);

  /** Ticket 07: drop the waiting Safe message, so the next run asks for a new one. */
  const discard = useCallback(() => {
    setPending(address, null);
    setNote(null);
    setError(null);
    setStage("idle");
  }, [address, setPending]);

  return {
    stage,
    result,
    error,
    run,
    reset,
    pending,
    note,
    discard,
    busy: stage === "connect" || stage === "sign" || stage === "send" || stage === "checking",
  };
}
