/**
 * The browser wallet, through wagmi (members area v2).
 *
 * The live Alchemix dapp connects with plain wagmi and its own modal (checked
 * 2026-10-20: injected, Coinbase, Base and WalletConnect connectors, no
 * RainbowKit, ConnectKit, AppKit, Privy, Dynamic or Web3-Onboard). Its
 * WalletConnect connector needs the dapp's own project id, so the members
 * area does the same thing without it: wagmi with EIP-6963 discovery (every
 * wallet extension that announces itself gets its own row in the modal) plus
 * the plain injected connector for older wallets that only set
 * window.ethereum. No WalletConnect until a project id of our own exists.
 *
 * The members area needs three things from a wallet: its account, its chain
 * and one personal_sign per claim. wagmi tracks the account; the signing goes
 * straight to the connected connector's EIP-1193 provider, as before.
 *
 * Everything here is imported by the members pages only, so wagmi never
 * reaches another docs route. The config is made once in the browser; the
 * prerender gets its own, which never touches a wallet.
 *
 * V3 backlog ticket 07, Safes and multisigs:
 * - Safe App. Opened inside Safe{Wallet} (Apps, Add custom app, the members
 *   URL), the page connects as the Safe on its own (the `safe` connector,
 *   through the Safe Apps SDK). static/members/manifest.json is what
 *   Safe{Wallet} reads when the app is added. Outside a Safe iframe the
 *   connector finds nothing and never shows.
 * - WalletConnect, only with a project id (MEMBERS_WALLETCONNECT_PROJECT_ID
 *   at build time, customFields.membersWalletConnectProjectId). Without one
 *   it is not in the config at all, so the modal cannot list it.
 * - A Safe signs through the SDK (signClaimMessage), not personal_sign, so the
 *   page can tell a finished signature from one still waiting on owners or on
 *   a transaction, and check again later (safeSignatureNow).
 */
import { createConfig, createStorage, http, injected, noopStorage } from "wagmi";
import { arbitrum, mainnet, optimism } from "wagmi/chains";
import { safe } from "wagmi/connectors/safe";
import { walletConnect } from "wagmi/connectors/walletConnect";
import { getAddress, hashMessage, hashTypedData } from "viem";
import { WALLET_APP } from "../copy";

/** The chains a claim message may name (the engine's markets). */
const CLAIM_CHAINS = [1, 10, 42161];

/** Where Safe{Wallet} runs. The Safe Apps SDK only listens to messages from these. */
const SAFE_ORIGINS = [/^https:\/\/app\.safe\.global$/];

let browserConfig = null;
let serverConfig = null;

function makeConfig(ssr, walletConnectProjectId) {
  const connectors = [
    // The plain injected connector, for wallets that only set window.ethereum.
    injected({ shimDisconnect: true }),
  ];
  if (!ssr) {
    // Ticket 07: the Safe App. getInfo answers in a few ms inside Safe{Wallet};
    // wagmi's default 10 ms wait is raised so a busy first load still finds it.
    connectors.push(safe({ allowedDomains: SAFE_ORIGINS, shimDisconnect: true, unstable_getInfoTimeout: 1000 }));
    if (walletConnectProjectId) {
      connectors.push(
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: true,
          metadata: {
            name: WALLET_APP.name,
            description: WALLET_APP.description,
            url: window.location.origin,
            icons: [`${window.location.origin}/members/safe-app-icon.svg`],
          },
        }),
      );
    }
  }
  return createConfig({
    chains: [mainnet, optimism, arbitrum],
    // EIP-6963: each announced wallet becomes its own connector.
    multiInjectedProviderDiscovery: !ssr,
    connectors,
    // No chain reads go through wagmi; these exist because wagmi needs one per chain.
    transports: { [mainnet.id]: http(), [optimism.id]: http(), [arbitrum.id]: http() },
    storage: createStorage({
      key: "alchemix-members",
      storage: ssr || typeof window === "undefined" ? noopStorage : window.localStorage,
    }),
    ssr: true,
  });
}

/**
 * The wagmi config: one per browser tab, a separate inert one for the
 * prerender. `walletConnectProjectId` (ticket 07) adds WalletConnect; empty
 * leaves it out.
 */
export function walletConfig(walletConnectProjectId = "") {
  if (typeof window === "undefined") return (serverConfig ??= makeConfig(true, ""));
  return (browserConfig ??= makeConfig(false, walletConnectProjectId));
}

/**
 * The connected connector's EIP-1193 provider, set by the member provider
 * whenever the connection changes. Null when no wallet is connected.
 * `activeType` is that connector's type ("safe" inside Safe{Wallet}).
 */
let activeProvider = null;
let activeType = null;

export function setActiveProvider(p, type = null) {
  activeProvider = p ?? null;
  activeType = p ? type : null;
}

function provider() {
  return activeProvider;
}

/** True while the connected wallet is a Safe, through the Safe App. */
export function isSafeConnection() {
  return activeType === "safe" && Boolean(activeProvider?.sdk);
}

/** True when this page is inside a frame, which is the only place the Safe App can be. */
export function inFrame() {
  return typeof window !== "undefined" && window.parent !== window;
}

/**
 * The connectors to list in the modal: the Safe when the page runs inside
 * Safe{Wallet} (`inSafe`), every EIP-6963 wallet by its own name and icon (or
 * the plain injected one when nothing announced itself but window.ethereum
 * exists), then WalletConnect when the build has a project id. Without any,
 * the list is empty.
 */
export function listedConnectors(connectors, { inSafe = false } = {}) {
  const safeOne = inSafe ? connectors.filter((c) => c.type === "safe") : [];
  const announced = connectors.filter((c) => c.type === "injected" && c.id !== "injected");
  const plain = connectors.find((c) => c.id === "injected");
  const browser =
    announced.length > 0 ? announced : plain && typeof window !== "undefined" && window.ethereum ? [plain] : [];
  const remote = connectors.filter((c) => c.type === "walletConnect");
  return [...safeOne, ...browser, ...remote];
}

/**
 * The chain id the claim message names. The wallet's own chain when it is one
 * of the engine's, else Ethereum. A signature is chain-agnostic; the id only
 * has to be one the engine accepts.
 */
export async function claimChainId() {
  const p = provider();
  if (!p) return 1;
  try {
    const id = Number.parseInt(await p.request({ method: "eth_chainId" }), 16);
    return CLAIM_CHAINS.includes(id) ? id : 1;
  } catch {
    return 1;
  }
}

function utf8Hex(text) {
  const bytes = new TextEncoder().encode(text);
  let hex = "0x";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/**
 * personal_sign the message as `address`. A cancelled prompt (EIP-1193 code
 * 4001) comes back as code "cancelled" so the page can say nothing was sent.
 */
/**
 * Demo sign-in (demo walkthrough 2026-10-28): the stand-in signature a demo
 * engine (DEMO_SIGN_IN=1, the engine's src/lib/auth/demoSignIn.ts) takes in
 * place of a real one. Any other engine refuses it like a bad signature.
 */
export const DEMO_SIGNATURE = `0x${"de30".repeat(16)}`;

/** The demo signer: answers the stand-in signature without asking any wallet. */
export async function signAsDemo() {
  return DEMO_SIGNATURE;
}

export async function signWith(address, message) {
  const p = provider();
  if (!p) throw Object.assign(new Error("no_wallet"), { code: "no_wallet" });
  try {
    return await p.request({ method: "personal_sign", params: [utf8Hex(message), address] });
  } catch (e) {
    if (e?.code === 4001 || /reject|denied|cancel/i.test(String(e?.message))) {
      throw Object.assign(new Error("cancelled"), { code: "cancelled" });
    }
    throw e;
  }
}

/* ── Safe signatures (ticket 07) ───────────────────────────────── */

function safeSdk() {
  return isSafeConnection() ? activeProvider.sdk : null;
}

/**
 * The Safe message hash Safe{Wallet} files an off-chain message under (EIP-712
 * SafeMessage over the EIP-191 hash of the text, Safe 1.3.0 and later).
 * Worked out up front, so a page reloaded while owners sign can still find
 * the message, whatever the signing prompt answered.
 */
export function safeMessageHash({ safeAddress, chainId, message }) {
  return hashTypedData({
    domain: { chainId, verifyingContract: getAddress(safeAddress) },
    types: { SafeMessage: [{ name: "message", type: "bytes" }] },
    primaryType: "SafeMessage",
    message: { message: hashMessage(message) },
  });
}

/**
 * Ask the Safe to sign `message` (Safe Apps SDK `txs.signMessage`). What
 * Safe{Wallet} does, read from its source (safe-wallet-monorepo,
 * apps/web/src/hooks/safe-apps/useCustomAppCommunicator.tsx, 2026-10-22):
 *   - Off-chain signing (the default for Safe 1.3.0 and later): it answers
 *     `{ messageHash, signature }` only once enough owners have signed, so a
 *     one-owner Safe gets `{ signature }` here at once.
 *   - On-chain signing (older Safes, or off-chain signing switched off): it
 *     answers `{ safeTxHash }` once the signing transaction is proposed (gas):
 *     `{ pending: "onchain", safeTxHash }`.
 *   - `{ messageHash }` alone is in the SDK's types; handled as
 *     `{ pending: "offchain", messageHash }`.
 *   - Closing its window before all owners signed answers "rejected", even
 *     when this owner did sign. That throws code "cancelled", like signWith;
 *     the caller keeps the message for "check again" (lib/member.js).
 */
export async function signWithSafe(message) {
  const sdk = safeSdk();
  if (!sdk) throw Object.assign(new Error("no_wallet"), { code: "no_wallet" });
  let r;
  try {
    r = await sdk.txs.signMessage(message);
  } catch (e) {
    if (/reject|denied|cancel/i.test(String(e?.message))) {
      throw Object.assign(new Error("cancelled"), { code: "cancelled" });
    }
    throw e;
  }
  if (typeof r?.signature === "string" && r.signature.length > 2) return { signature: r.signature };
  if (typeof r?.messageHash === "string") return { pending: "offchain", messageHash: r.messageHash };
  if (typeof r?.safeTxHash === "string") return { pending: "onchain", safeTxHash: r.safeTxHash };
  throw new Error("The Safe answered without a signature.");
}

/**
 * "Check again" for a message the Safe is still signing. The signature to
 * send once the Safe accepts the message, else null:
 *   - an off-chain message: Safe{Wallet}'s combined owner signature, which it
 *     gives only once the threshold is met (SDK getOffChainSignature);
 *   - a message signed on chain: "0x", once the Safe's isValidSignature
 *     accepts the empty signature (SDK isMessageSigned), meaning the
 *     transaction ran.
 * Throws code "not_in_safe" outside Safe{Wallet}, where neither can be read.
 */
export async function safeSignatureNow({ message, messageHash }) {
  const sdk = safeSdk();
  if (!sdk) throw Object.assign(new Error("not_in_safe"), { code: "not_in_safe" });
  if (messageHash) {
    try {
      const signature = await sdk.safe.getOffChainSignature(messageHash);
      if (typeof signature === "string" && signature.length > 2) return signature;
    } catch {
      // Not filed off chain (an on-chain Safe), or not found yet: try the chain.
    }
  }
  try {
    if (await sdk.safe.isMessageSigned(message)) return "0x";
  } catch {
    // The Safe's RPC did not answer: treat as not yet.
  }
  return null;
}

export function isAddress(s) {
  return typeof s === "string" && /^0x[0-9a-fA-F]{40}$/.test(s.trim());
}

export function sameAddress(a, b) {
  return typeof a === "string" && typeof b === "string" && a.toLowerCase() === b.toLowerCase();
}
