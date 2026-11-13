/**
 * Every user-facing string in the members area.
 *
 * DRAFT COPY. TOV pass 2026-10-21, then a microcopy cut the same day (issue 09
 * in Alchemix-Seasons/.scratch/members-area-v2/issues/). Still waiting on
 * Keenan and the TOV project at
 * C:\Users\Keenan\Documents\Claude\Projects\Alchemix TOV\ to sign it off.
 * When final copy arrives, it replaces the values here and nothing else needs
 * to change.
 *
 * Rules the copy follows, which the final copy must keep:
 * - No em dashes or en dashes anywhere. US spelling.
 * - Sentence case. Headings and labels are nouns, 1 to 3 words, no "your".
 *   Buttons are short verb phrases.
 * - Helper text only where a member would otherwise make a mistake or be
 *   surprised. A number shown on screen is not restated in a sentence.
 * - "Signing costs no gas and moves no funds" once per screen region, beside
 *   the first signing button (CLAIMS.signHint), and in the footer.
 * - Terms from CONTEXT.md: members area, essence (what members see for season
 *   standing; never "standing" or "points" on screen, walkthrough 2026-10-23),
 *   Inner Circle, tenure badge, past user, exit reason, shipped log.
 * - "Rung" stays out of what members read: say what it unlocks.
 * - In v3 debt falls only through redemptions or a manual repay. Nothing here
 *   may say or imply that yield repays debt.
 * - Standing unlocks access, never money. No prize or gambling language.
 * - Badges are a record. They add no standing, and nobody is ranked by them.
 *
 * Badge titles and how-to-earn lines come from the engine
 * (src/lib/achievements/copy.ts in Alchemix-Seasons). Only the words the page
 * adds around them live here (BADGES).
 *
 * Functions take the values they print, so every sentence stays in this file.
 */

export const APP_URL = "https://alchemix.fi";
export const LEGACY_DOCS_URL = "https://v2-docs.alchemix.fi/";
/**
 * The v2 app's Transmuter page, still deployed (checked 2026-10-24: /transmuter
 * answers 200 and the bundle holds the claim UI). A leftover v2 Transmuter
 * balance is claimed there. Click through it with a wallet before launch.
 */
export const V2_TRANSMUTER_URL = "https://v2.alchemix.fi/transmuter";
/**
 * Where "What changed since v1/v2" goes until the Academy's returning-users
 * piece exists (funnel review 2026-10-23): the docs' migration page, which
 * covers what carried over and how the loan comes down now. Swap for the
 * Academy lesson path once it ships.
 */
export const CHANGED_URL = "/user/v3-migration";
/** The public members area, for the link in a shared post. */
export const MEMBERS_URL = "https://docs.alchemix.fi/members";
/** The docs page with the borrowing guidance the next steps quote (about 20% LTV, 90% cap). */
export const BORROW_GUIDE = "/user/quick-start";

export const SHELL = {
  title: "Members area",
  description: "Any wallet's Alchemix history, essence and arcana.",
  brandWord: "Members",
  nav: {
    home: "Members",
    /** Feedback 2026-10-28 (Keenan): Badges takes Leaderboard's place in the nav. NEW, not through the TOV pass. */
    badges: "Arcana",
    /** Design notes 2026-11-03 (metalface 25): the store is its own page. NEW, not through the TOV pass. */
    store: "Store",
    leaderboard: "Leaderboard",
    feedback: "Feedback",
    academy: "Academy",
    docs: "Docs",
  },
  footerLinks: {
    feedback: "Send feedback",
    leaving: "Reason for leaving",
    leaderboard: "Leaderboard",
    view: "View any address",
    app: "App",
    /** Demo builds only (MEMBERS_SHOW_PROPOSALS=1): the footer switch that shows every badge as earned. */
    demoUnlock: "Demo: unlock all cards",
    demoRelock: "Demo: cards as earned",
  },
  footer: "Signing costs no gas and moves no funds.",
};

/** The connect button in the nav, its modal and the account menu. */
export const CONNECT = {
  button: "Connect wallet",
  connecting: "Connecting...",
  title: "Connect a wallet",
  body: "You sign only to claim something.",
  detected: "Wallets in this browser",
  browserWallet: "Browser wallet",
  none: "No wallet found. Install one, or view an address below.",
  waiting: "Confirm in your wallet",
  rejected: "Connection cancelled.",
  failed: "The wallet did not connect. Try again.",
  close: "Close",
  viewTitle: "View any address",
  viewHint: "Read only.",
  placeholder: "0x...",
  view: "View",
  badAddress: "A wallet address starts with 0x and has 42 characters.",
  menu: {
    viewMine: "Show this wallet",
    disconnect: "Disconnect",
  },
};

/**
 * Safes and multisigs (v3 backlog ticket 07): the "Using a Safe?" line on the
 * home page, the signing hint while a Safe is connected (a Safe that signs on
 * chain pays gas), and the "check again" step while its owners sign.
 *
 * NEW 2026-10-22, NOT YET THROUGH THE TOV PASS. Send to the TOV project with
 * the rest of this file.
 */
export const SAFE = {
  lead: "Using a Safe?",
  route: "In Safe{Wallet}, open Apps, then Add custom app, and paste this link:",
  url: "docs.alchemix.fi/members",
  gas: "Some Safe setups pay gas to sign.",
  /** Replaces CLAIMS.signHint and the footer line while a Safe is connected. */
  signHint: "Signing moves no funds. Some Safe setups pay gas to sign.",
  pending: "Waiting for the Safe's owners to sign in Safe{Wallet}.",
  pendingOnchain: "This Safe signs with a transaction. Check again once it runs.",
  checkAgain: "Check again",
  checking: "Checking...",
  notYet: "Not enough owner signatures yet.",
  notYetOnchain: "The signing transaction has not run yet.",
  openInSafe: "Open the members area inside Safe{Wallet} to check again.",
  /** Drops the waiting message, for a prompt that was really cancelled. */
  startOver: "Sign a new message",
};

/**
 * The members area's name and line where a wallet shows them: the
 * WalletConnect prompt. static/members/manifest.json (what Safe{Wallet} shows
 * for the custom app) repeats both by hand; change them together.
 * NEW 2026-10-22, NOT YET THROUGH THE TOV PASS.
 */
export const WALLET_APP = {
  name: "Alchemix members area",
  description: SHELL.description,
};

/** The small strip that says which address is on screen. */
export const VIEWING = {
  stop: "Stop viewing",
  /** The banner under the header (design notes 2026-11-03, notes 1 and 11). NEW, not through the TOV pass. */
  banner: (address) => `Viewing ${address}, read only`,
};

/**
 * Demo sign-in (demo walkthrough 2026-10-28): shown only when a demo engine
 * takes the stand-in signature (lib/member.js). Never on the real site.
 *
 * NEW 2026-10-28, NOT THROUGH THE TOV PASS. Demo only.
 */
export const DEMO_AS = {
  act: "Act as this wallet",
  tag: "Demo",
  modalTitle: "Act as any address",
  modalHint: "Demo only. Claims go through without a signature.",
  submit: "Act as",
  menuStop: "Stop acting as this wallet",
};

export const HERO = {
  eyebrow: "Members area",
  headline: "Alchemix record",
  lead: "You earn essence each day you hold a position and take part.",
  connect: "Connect wallet",
  loading: "Loading...",
  status: {
    rung: "Unlocked",
    noRung: "Nothing yet",
    top: "Everything unlocked",
    next: (label) => `Next: ${label}`,
    toNext: (needed, label) => `${needed} essence to ${label}`,
    signToSee: "See my essence",
    /** Funnel review 2026-10-23: days to the next unlock at the wallet's daily rate. NEW, not through the TOV pass. */
    daysToNext: (n) => (n <= 1 ? "about a day at your current size" : `about ${n} days at your current size`),
    positions: "Positions",
    positionsNone: "None",
    stakes: (n) => (n === 1 ? "1 Transmuter stake" : `${n} Transmuter stakes`),
    positionsOn: (asset, chains) => `${asset} on ${chains}`,
    positionsAcross: (assets, n) => `${assets} on ${n} ${n === 1 ? "chain" : "chains"}`,
    badges: "Arcana",
    badgesEarned: (earned, total) => `${earned} of ${total}`,
    season: "Season",
    notCounting: "Not counting yet",
    joinLabel: "Start counting",
    daysCounted: (n) => (n === 1 ? "1 day earning" : `${n} days earning`),
    countingSince: (date) => `Earning since ${date}`,
    /** Fifth round (persona walk). NEW, not through the TOV pass. */
    firstCredit: "First credit after tonight's sweep",
    beyond: "more than this season has left at your current size",
  },
};

/**
 * Essence: what members see for season standing (walkthrough 2026-10-23,
 * Keenan's pick, "points" as the fallback). `define` is the line shown the
 * first time a screen uses the word.
 *
 * NEW 2026-10-23, NOT YET THROUGH THE TOV PASS.
 */
export const ESSENCE = {
  define: "Essence builds each day you hold a position and take part. It unlocks access, never money, and restarts each season.",
  how: "How essence works",
};

/**
 * The home page before a wallet is on screen (walkthrough 2026-10-23): what
 * this is in one line, Connect, and how it works in three steps. Season
 * counts and the ladder wait for members and the leaderboard page.
 *
 * NEW 2026-10-23, NOT YET THROUGH THE TOV PASS.
 */
export const VISITOR = {
  headline: "Your Alchemix record",
  lead: "See your history, join the season, and earn essence that unlocks the Discord role, the Inner Circle and event access.",
  how: "How it works",
  steps: [
    { title: "See your record", body: "Your Alchemix history, from v1 to today. No signature needed." },
    { title: "Join the season", body: "One signature. No gas, and no funds move." },
    {
      title: "Earn essence",
      /** Review 2026-11-13 (metalface): no role names on this card, only that rewards come. NEW, not through the TOV pass. */
      body: "Every day you hold a v3 position, plus the Academy and events. Each milestone unlocks a reward.",
    },
  ],
  leaderboard: "See the leaderboard",
  /** Visual pass 2026-10-28 (Keenan: this page looked weaker than the member page). NEW, not through the TOV pass. */
  signLabel: "What you sign",
  seasonOpen: "Open now",
  /** Design notes 2026-11-03 (note 43): the season module's section, above How it works. NEW, not through the TOV pass. */
  season: "The season",
};

/**
 * Onboarding (walkthrough 2026-10-23): what a wallet that has not joined the
 * season sees at the top of the home page. A headline for who they are, a
 * short checklist (record, position, join, and the Academy for newcomers)
 * with one primary step, and what it unlocks. Replaces the returning-user
 * hero of v3 backlog ticket 11, for every wallet that has not joined, link or
 * no link.
 *
 *   lapsed    a past user with no v3 position
 *   dormant   a dormant v3 holder
 *   holder    any other wallet with a position
 *   newcomer  no history and no position
 *
 * `JOIN_MESSAGE` repeats the first sentence of the engine's join-season
 * statement (Alchemix-Seasons src/lib/engine/seasonJoin.ts). Change both together.
 *
 * NEW 2026-10-23, NOT YET THROUGH THE TOV PASS.
 */
export const JOIN_MESSAGE = "Join the Alchemix season with this wallet.";

export const ONBOARDING = {
  lapsed: {
    headline: "Welcome back",
    lead: (version) => `Your record is still here. A lot has changed since ${version}.`,
  },
  dormant: {
    headline: "Your position already counts",
    lead: "Join the season and every day you hold earns essence.",
  },
  holder: {
    headline: "Your position can earn essence",
    lead: "Join the season to start.",
  },
  /** Funnel review 2026-10-23: a Transmuter saver with no loan position. NEW, not through the TOV pass. */
  saver: {
    headline: "Your stake already counts",
    lead: "Join the season and every day you keep your Transmuter stake earns essence.",
  },
  /**
   * Funnel review 2026-10-23: a wallet whose only funded positions are on
   * Arbitrum, which is winding down and earns no essence. The page never
   * tells it that its position counts. NEW, not through the TOV pass.
   */
  arbitrum: {
    headline: "Your position is on Arbitrum",
    lead: "Arbitrum is winding down and earns no essence. Positions on Ethereum and Optimism do.",
  },
  newcomer: {
    headline: "Start your Alchemix record",
    lead: "Join the season, learn the basics, and earn essence with your first position.",
  },
  /**
   * Funnel review 2026-10-23: a wallet that withdrew from v3 since April and
   * holds nothing now (the "left" group). Its record stays; the asks are the
   * exit reason and a new position. NEW, not through the TOV pass.
   */
  left: {
    headline: "Your position is closed",
    lead: "Your record stays. Tell us why you left, or open a new position and start earning essence.",
  },
  checklist: "Getting started",
  done: "Done",
  steps: {
    record: {
      title: "Your record",
      body: (since, versions) => `Using Alchemix since ${since}, ${versions}.`,
    },
    position: {
      title: "Open a v3 position",
      doneTitle: "Your v3 position",
      body: "Every day you hold earns essence.",
      /** Page review 2026-10-24 (Keenan's note): a wallet that left is sent back to the vault it used. */
      leftBody: "Every day you hold earns essence. The link opens the vault you used last.",
      /** For a Transmuter saver (research note, 2026-10-24): collateral earns the vault's yield; a loan is optional. */
      saverBody: "Your deposit earns the vault's yield as collateral, and borrowing against it is optional. Every day you hold earns essence.",
      cta: "Open the app",
    },
    /** Funnel review 2026-10-23: the Arbitrum holder's own position (done) and its ask. NEW, not through the TOV pass. */
    arbitrumPosition: {
      title: "Your Arbitrum position",
      body: (where) => `${where}. It earns no essence while the market winds down.`,
    },
    mainnetPosition: {
      title: "Open a position on Ethereum or Optimism",
      body: "Every day you hold there earns essence.",
      cta: "Open the app",
    },
    /** Funnel review 2026-10-23: a saver's open Transmuter stake, already there. NEW, not through the TOV pass. */
    stake: {
      title: "Your Transmuter stake",
      body: (amounts) => `${amounts}. It counts toward essence after its first 7 days.`,
    },
    /**
     * Funnel review 2026-10-23: money left in a v2 Transmuter, the cheapest
     * ask in the win-back report. The legacy docs explain the claim until a
     * better path is confirmed. NEW, not through the TOV pass.
     */
    /** Funnel review 2026-10-23: the one-tap exit reason, for a wallet that left. NEW, not through the TOV pass. */
    leaving: {
      title: "Why did you leave?",
      body: "One answer, no signature. It helps the team fix it.",
      cta: "Give a reason",
    },
    claimV2: {
      title: "Claim your v2 Transmuter balance",
      body: (amount) => `${amount} is still waiting in a v2 Transmuter. Claim it in the v2 app.`,
      cta: "Open the v2 app",
    },
    join: {
      title: "Join the season",
      body: "One signature. No gas, and no funds move.",
      message: (text) => `Your wallet asks you to sign: “${text}”`,
      cta: "Join the season",
    },
    academy: {
      title: "Learn the basics",
      doneTitle: "Academy credit",
      body: "The Academy beginner track. Its essence carries into every season.",
      cta: "Open the Academy",
    },
  },
  /**
   * Funnel review 2026-10-23: the money fact under a holder's headline, from
   * the engine's value then and now (lookup.positions[].value) and vault
   * rates. Past performance, stated as such. NEW, not through the TOV pass.
   */
  earnings: {
    /** "Your collateral grew" + the amount (set in its own span) + "since it moved to v3 on Apr 18." */
    lead: "Your collateral grew",
    /**
     * Fifth round (Keenan, 2026-10-28): "the April handover" was our word. A
     * position that came over in the migration says when it moved to v3.
     * NEW, not through the TOV pass.
     */
    sinceMigrated: (date) => (date ? `since it moved to v3 on ${date}.` : "since it moved to v3 in April."),
    sinceFirstDeposit: "since your first deposit.",
    /**
     * Page review 2026-10-24 (batch item 2): a dated start in place of "since
     * you received it", for a start that is not the handover.
     */
    sinceDate: (date) => `since ${date}.`,
    sinceFirstDepositOn: (date) => `since your first deposit on ${date}.`,
    rate: (pct, days) => `The vault paid ${pct} a year over the last ${days} days.`,
    note: "Yield raises collateral. Debt falls only through redemptions or a repay.",
  },
  /**
   * Funnel review 2026-10-23, from the research note on money facts: for a
   * past user with no position, today's dated vault rate applied to their own
   * largest deposit, never a "would have earned since 2021" line (v3 has no
   * history before April 2026). Past performance, rates move. NEW, not
   * through the TOV pass.
   */
  rateLine: {
    /**
     * Page review 2026-10-24 (Keenan's note): the line says where the amount
     * comes from. It is the wallet's own largest deposit in v1 or v2, and the
     * figure is whole dollars.
     */
    line: (version, deposit, yearly, pct, vault, days) =>
      `Your largest ${version} deposit was ${deposit}. At the ${vault} vault's rate over the last ${days} days (${pct} a year), that earns about ${yearly} a year.`,
    note: (date) => `Past vault performance to ${date}, before fees. Rates change daily.`,
  },
  /**
   * Funnel review 2026-10-23: one line of social proof from the latest sweep.
   * Page review 2026-10-24 (Keenan's note): said for the reader, not as a
   * statistic. A past user sees it under the deposit step, as "people like
   * you came back"; a visitor sees it under the lead. NEW, not through the
   * TOV pass.
   */
  community: {
    lapsed: (pastUsers, date) => `${pastUsers} wallets that used v1 or v2 hold a v3 position today (as of ${date}).`,
    visitor: (holders, pastUsers, date) =>
      `${holders} wallets hold $100 or more in v3 today, ${pastUsers} of them from v1 or v2 (as of ${date}).`,
  },
  unlocks: {
    label: "What you unlock",
    line: (when) => `The Discord role ${when}, then the Inner Circle, then event VIP and seasonal merch.`,
    soon: "in a few days",
    inDays: (n) => (n <= 1 ? "after your first day" : `in about ${n} days`),
    /** An Arbitrum-only holder: no timing, since nothing there counts. */
    arbitrum: "Essence comes from positions on Ethereum and Optimism. The Discord role, then the Inner Circle, then event VIP and seasonal merch.",
  },
  /** Page review 2026-10-24 (Keenan's note): the label says where the link goes until the Academy piece exists. */
  changed: (version) => `What changed since ${version} (migration guide)`,
  badges: (n) => (n === 1 ? "You already hold 1 card." : `You already hold ${n} cards.`),
  noBadges: "Arcana are the cards a wallet earns with Alchemix. Each one marks something the wallet has done.",
  allBadges: (n) => `See all ${n}`,
  fewerBadges: "Show earned only",
};

export const SEASON = {
  runs: (start, end) => `${start} to ${end}`,
  daysLeft: (n) => (n === 1 ? "1 day left" : `${n} days left`),
  lastDay: "Last day",
  none: "No season is open.",
  elapsed: (pct) => `${pct} through the season`,
};

/**
 * The season module (design notes 2026-11-03, metalface notes 2, 4, 19, 20,
 * 39, 43): one block for the season wherever it shows, with the time bar and,
 * for a wallet, the essence bar with the three unlocks on it. The dates, days
 * left and the "X to <unlock>" line reuse SEASON and ESSENCE_CELL.
 * NEW 2026-11-03, NOT THROUGH THE TOV PASS.
 */
export const SEASON_MODULE = {
  /** The essence bar's accessible name, with the wallet's total when there is one. */
  track: (now) => (now ? `Essence toward the unlocks, now ${now}` : "Essence toward the unlocks"),
  /** Screen readers only: a marker the wallet has reached. */
  reached: "unlocked",
};

export const SEASON_PROGRESS = {
  section: "Season progress",
  wallets: "Wallets",
  daysLeft: "Days left",
  perRung: "Members at each unlock",
  threshold: (n) => `${n} essence`,
  you: "You",
  /** The link under the section, to the explanation on the leaderboard page. */
  how: "How essence works",
  joined: "Joined",
  /** The season chain: this season, its access month, and the next season. */
  chain: {
    label: "Season timeline",
    started: (date) => `Started ${date}`,
    /** Bar keys. The banner above shows the season dates, so this one names the bar only. */
    ends: () => "This season",
    accessEnds: (date) => `Access ends ${date}`,
    /** The bar shows it opening before access ends, so the key names it only. */
    nextOpens: () => "Next season",
    today: "Today",
  },
  carries: {
    label: "Carries over",
    note: "Essence resets each season.",
    items: {
      academy: "Academy credit",
      tenure: "Tenure",
      badges: "Arcana",
    },
    academyCredit: (n) => `${n} Academy essence carries over.`,
  },
};

/**
 * What each rung asks for, in plain words. The engine's rungRequirements
 * (GET /api/seasons/current/progress) wins when it sends text; these are the
 * fallback, written for the season one rules (Discord role 500, Inner Circle
 * 3,000, VIP and merch 12,000). Shown on the leaderboard ladder and in the
 * rung badge panels.
 */
export const RUNG_REQUIREMENTS = {
  discord_role: "The Academy beginner track, or a few days of holding.",
  inner_circle: "Both Academy tracks, plus a day or two of holding or two event codes.",
  // Fifth round: the tenfold scale makes the time depend on size (about a month at $1,000, 400 a day).
  vip: "Weeks of holding and taking part, sooner with a larger position.",
};

/**
 * The proposed return bonus (strategy alignment, 2026-10-21). Shown only in
 * builds with MEMBERS_SHOW_PROPOSALS=1 and only while the engine says it is
 * proposed or live. Nothing pays it yet, so there is no claim button.
 *
 * V3 backlog ticket 09 (2026-10-22): a per-wallet view. A wallet with a bonus
 * base sees its own numbers, "if this goes live"; one with nothing eligible
 * sees the plain offer; a holdout wallet sees no card at all. Amounts are in
 * the market's unit (ETH, or USDC for alUSD). DRAFT: every string added for
 * ticket 09 (status.proposed, window, ifLive, yours, yoursLive, forfeit,
 * measured, newcomer, newcomerIncluded, stepsTitle, stepState, totals) is
 * waiting on the TOV pass. 2026-10-23: forfeit rewritten for the new rule (any
 * withdrawal or moving a position to another wallet after the window ends the
 * payments still to come; redemptions do not), and the "Keep N or more
 * deposited" line is gone.
 */
export const RETURN_BONUS = {
  status: {
    /** Design notes 2026-11-03 (note 35): "Coming soon" in place of "Proposed, not live". */
    proposed: "Coming soon",
    live: "Live",
  },
  title: "Return bonus",
  body: (rate, months) =>
    `${rate} of net new deposits, vested over ${months} months. Withdrawing forfeits the unvested part.`,
  /** The plain offer's dates, when the window is set. */
  window: (start, end) => `For deposits from ${start} to ${end}.`,
  /** Feedback 2026-10-28: the line beside "Deposit more" in the Holding card. NEW, not through the TOV pass. */
  line: (rate, months) => `Return bonus: ${rate} of new deposits back, paid over ${months} months.`,
  lineEnd: "Withdrawing cancels the rest.",
  /** One line beside the deposit step in onboarding (walkthrough 2026-10-23). */
  hint: (rate, months) => `${rate} bonus on new deposits, paid over ${months} months.`,
  /** Before the wallet's own numbers while the bonus is proposed. */
  ifLive: "If this goes live:",
  yours: (bonus, perStep, months) => `your bonus ${bonus}, ${perStep} a month for ${months} months.`,
  yoursLive: (bonus, perStep, months) => `Your bonus ${bonus}, ${perStep} a month for ${months} months.`,
  /** What forfeits it, for a wallet with its own numbers. */
  forfeit:
    "Any withdrawal from your position, or moving it to another wallet, before the last payment cancels the rest. Redemptions don't count as withdrawals.",
  /** Where the numbers come from while the window is open. Yield never counts. */
  measured: (start, day, end) => `From deposits since ${start}, as of ${day}. Deposits count until ${end}. Yield does not.`,
  /** An invitee from a referral (ticket 08): the 0.5% newcomer bonus, also proposed. */
  newcomer: (rate) => `Joined through a referral: another ${rate} on the same terms. Also coming soon.`,
  newcomerIncluded: (rate, amount) =>
    `Includes ${amount} from the ${rate} newcomer bonus for joining through a referral. Also coming soon.`,
  stepsTitle: "Monthly steps",
  stepState: {
    upcoming: "Due",
    vested: "Vested",
    forfeited: "Forfeited",
  },
  totals: (vested, forfeited) =>
    [vested ? `Vested ${vested}.` : null, forfeited ? `Forfeited ${forfeited}.` : null].filter(Boolean).join(" "),
};

/** Small counts in words, for "six months". */
export const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Rung names, for when the season list has not answered yet. */
export const RUNG_LABELS = {
  discord_role: "Discord role",
  inner_circle: "Inner Circle",
  vip: "Event VIP and merch",
};

export const BADGES = {
  section: "Arcana",
  groups: {
    season: "Season",
    rungs: "Access",
    history: "History",
    activity: "Activity",
    community: "Community",
  },
  /**
   * Round two, 2026-11-04 (Keenan: split badges into a per-season set and the
   * record). The season group's label is the season's name from the engine;
   * this line sits under it. NEW, not through the TOV pass.
   */
  seasonIntro: {
    open: "Only earned while this season runs.",
    past: "Earned that season, kept on the record.",
  },
  /** Round two, 2026-11-04: tiers are numbered until the lore names come. NEW, not through the TOV pass. */
  tier: (current, max) => `Tier ${current} of ${max}`,
  /**
   * Round two, 2026-11-04 (badge multipliers): under the how-to line of a
   * badge that carries an essence multiplier, on the hover card and in the
   * badge panel. `pct` is the percent ("10"). NEW, not through the TOV pass.
   */
  multiplier: (pct) => `+${pct}% essence while held`,
  hidden: {
    title: "Hidden",
    body: "Shown once earned.",
    hints: {
      v1_to_v3: "Time with Alchemix.",
      early_season: "A season's start.",
      season_marathon: "A whole season.",
    },
  },
  state: {
    /** Under an earned tile with no date. Empty: the lit medal says it. */
    earned: "",
    earnedOn: (date) => `Earned ${date}`,
    undated: "Earned",
    locked: "Locked",
  },
  progress: {
    held_30_days: (c, t) => `${c} of ${t} days`,
    two_chains: (c, t) => `${c} of ${t} chains`,
    academy_graduate: (c, t) => `${c} of ${t} tracks`,
    referrer: (c, t) => `${c} of ${t} referrals`,
    rung: (c, t) => `${c} of ${t} essence`,
  },
  /** What the record says, under an earned badge. */
  facts: {
    v1_era: (date) => `Started ${date}.`,
    v2_era: (date) => `Started ${date}.`,
    migrated: (date) => `Moved to v3 ${date}.`,
    transmuted: (count, amounts) => `${count} ${count === 1 ? "claim" : "claims"}: ${amounts}.`,
    two_chains: (chains) => `Positions on ${chains}.`,
    borrower: (n) => `Borrowing on ${n} ${n === 1 ? "position" : "positions"}.`,
    rung: (date) => `Access until ${date}.`,
  },
  tenure: {
    title: "Tenure card",
    description: "Claim with a v1 or v2 wallet.",
    fact: (date) => `Started ${date}.`,
    button: "Claim card",
    notPastUser: "Only v1 and v2 wallets can claim it.",
  },
  select: "Select a card.",
  /** The Arcana cabinet: on a deck's tab, how many of its cards are earned. NEW 2026-11-05, not through the TOV pass. */
  deck: {
    earned: (n, total) => `${n} of ${total} earned`,
    /** On the open deck's tab, after the count: closes the deck. NEW 2026-11-05, not through the TOV pass. */
    close: "Close deck",
    /** Under a drawn card's facts: returns the card to its slot, the deck stays open. NEW 2026-11-05, not through the TOV pass. */
    putBack: "Put the card back",
  },
  academyCarries: "Credit carries into every season.",
  standing: {
    button: "See my essence",
    noSeason: "No season is open.",
    rank: (rank, shared) => `Rank ${shared ? "=" : ""}${rank} this season`,
  },
  actions: {
    openApp: "Open the app",
    borrowGuide: "Borrowing guide",
    academy: "Open the Academy",
    feedback: "Send feedback",
    transmuterCard: "Transmuter card",
    eventCode: "Enter a code",
  },
};

/** Signed claims: one personal_sign each, never a transaction. */
export const CLAIMS = {
  /** Beside the first signing button in a region only (Home/actions.jsx `hint`). */
  signHint: "Signing costs no gas and moves no funds.",
  connectFirst: "Connect the wallet you are viewing to sign.",
  wrongAccount: (connected) => `Connected as ${connected}. Switch to the address you are viewing.`,
  waiting: "Confirm in your wallet...",
  sending: "Sending...",
  cancelled: "Signature cancelled. Nothing was sent.",

  badge: {
    claimed: (date) => `Claimed ${date}.`,
    notPastUser: "Only wallets that used Alchemix v1 or v2 can claim a tenure card.",
  },

  discord: {
    button: "Link Discord",
    redirecting: "Opening Discord...",
    unconfigured: "Discord linking opens soon.",
    unlinkButton: "Unlink",
    unlinked: "Discord unlinked. The role comes off at the next role update.",
    notLinked: "This wallet had no Discord account linked.",
    /** One message per ?discord=<code> the engine's callback sends back. */
    returned: {
      linked: "Discord linked. Join the Alchemix server to get the role once your essence reaches it.",
      discord_taken: "That Discord account is already linked to another wallet.",
      already_linked_other: "This wallet is linked to a different Discord account. Unlink it, then link again.",
      bad_state: "The link request expired or started in another browser. Start again here.",
      link_failed: "Discord did not confirm the link. Try again.",
      discord_unconfigured: "Discord linking opens soon.",
      rate_limited: "Too many link attempts. Wait a minute and try again.",
      unknown: "The Discord link did not finish. Try again.",
    },
  },

  innerCircle: {
    access: (date) => `Access until ${date}.`,
    noAccess: "Access opens when you reach the Inner Circle.",
    checkButton: "Check early access",
    claimed: (date) => `Access granted until ${date}.`,
    alreadyClaimed: (date) => `Access until ${date}.`,
    notEligible: "This wallet is not on this month's early access list. Reach the Inner Circle to join.",
    linkButton: "Link Telegram",
    startLink: "Open Telegram",
    startNote: (time) => `The Telegram link works once and expires at ${time}.`,
    joinButton: "Request to join",
    noInvite: "The group link appears once this wallet has access.",
    unconfigured: "Telegram linking opens soon.",
  },

  join: {
    joined: (date) => `Joined ${date}. You earn essence from today.`,
    already: (date) => `Joined ${date}.`,
  },

  event: {
    title: "Event code",
    body: "",
    label: "Event code",
    placeholder: "6 characters",
    button: "Redeem",
    redeemed: (label, amount) => `${amount} essence added for ${label}.`,
    empty: "Enter a code.",
  },

  academy: {
    button: (track) => `Claim the ${track.toLowerCase()}`,
    claimed: (track, amount) => `${track} claimed. ${amount} essence, carried into every season.`,
    already: (track) => `This wallet already claimed the ${track.toLowerCase()}.`,
    none: "Finish a track in this browser to claim it.",
  },
};

/**
 * Member journey 2026-10-28 (Alchemix-Seasons reports/Member journey day to
 * day 2026-10-28.md): a joined wallet's page answers three questions on one
 * screen. What did I earn (the essence cell and Recent), how do I earn more
 * (Earn more, one row per way to earn), and what do I get (What you get, one
 * card per rung). Essence shows without a signature.
 *
 * NEW 2026-10-28, NOT YET THROUGH THE TOV PASS.
 */
export const ESSENCE_CELL = {
  label: "Your essence",
  /** Feedback 2026-10-28, third round: the hero's rank line and its small link to the board. NEW, not through the TOV pass. */
  rank: (n, tied) => `Rank ${tied ? "=" : ""}${n} this season`,
  board: "Leaderboard",
  toNext: (needed, label) => `${needed} to ${label}`,
  days: (n) => (n <= 1 ? "about a day" : `about ${n} days`),
  /** Fifth round (persona walk): when today's rate would not get there before the season ends. NEW, not through the TOV pass. */
  beyond: "more than this season has left at today's rate",
  /** Feedback 2026-10-28: the hero's essence card. */
  perDay: (n) => `${n} a day`,
  /** Round two, 2026-11-04: after the daily rate when the wallet's badges carry a multiplier. NEW, not through the TOV pass. */
  fromBadges: (pct) => `incl. +${pct}% from cards`,
  all: "Everything unlocked this season.",
};

/**
 * The hero's essence panel with nothing earned yet. Design notes 2026-11-03
 * (note 4): the season chart became the essence bar, so these no longer name
 * a chart. Fifth round (persona walk) wording otherwise. NEW, not through the
 * TOV pass.
 */
export const CHART = {
  empty: "Essence starts with your first credit. A v3 position on Ethereum or Optimism earns every day you hold it.",
  emptyArbitrum: "Positions on Arbitrum earn no essence. A position on Ethereum or Optimism starts your season.",
};

/**
 * The hero's record half (fourth round, Keenan: make it feel accomplished and
 * tenured): the tenure line, the three rarest badges, the count. NEW, not
 * through the TOV pass.
 */
export const RECORD = {
  label: "Your record",
  since: (monthYear) => `Using Alchemix since ${monthYear}`,
  inV3Since: (monthYear) => `In v3 since ${monthYear}`,
  joined: (date) => `Member since ${date}`,
  versions: (list, migrated) => `${list.join(" and ")}${migrated ? ", migrated to v3" : ""}`,
  claimTenure: "Claim your tenure card",
  rarest: "Rarest cards",
  none: "No cards yet. The first ones come from holding and the Academy.",
  count: (n, total) => `${n} of ${total} cards`,
};

/**
 * /members/welcome, where the outreach links land. Seventh round (Keenan,
 * 2026-10-28): the record on its own page. Eighth round (Keenan, 2026-10-29:
 * "this page isn't serving its function, of actually drawing in the users we
 * are trying to outreach"): the wallet's own offer first, then its story with
 * Alchemix, what is new in v3, and the season it can join. 2026-11-04 (Keenan):
 * the hero leads with the record and the return instead; the money facts sit
 * under the v3 cards.
 *
 * Mechanism lines checked against the v3 docs on 2026-10-29: 90% maximum LTV
 * (concepts/alAssets.md), no interest (user/index.md), the DAO-managed MYT
 * (concepts/myt-and-yield.md), redemptions cancelling debt from collateral
 * (concepts/self-repaying-loans.md, and the "What changed since v2" draft);
 * v2's 50% from the legacy v2 docs, as cited in that draft.
 *
 * NEW, not through the TOV pass.
 */
export const WELCOME = {
  title: "Your record",
  description: "What this wallet has done with Alchemix, what is new in v3, and the season it can join.",
  eyebrow: "Welcome back",
  /**
   * The headline leads with the wallet's record and the return to Alchemix
   * (Keenan, 2026-11-04: yield is not the selling point; this reverses the
   * 2026-10-23 "money fact first" call). Each headline returns [before, the
   * accent, after]. Design notes 2026-11-03 (metalface, note 13): one headline
   * and one supporting line, no trailing period on the headline.
   *
   * Checked against STYLE.md 2026-11-04 (Keenan asked for deliberate, clear
   * v3 TOV): a named subject does a verb in every sentence, the positive
   * carries Alchemix, the concrete fact stays (90% of the deposit, no
   * interest on the loan, one vault per asset run by the DAO), nothing
   * inanimate acts on the reader. NEW 2026-11-04, still to go through the
   * TOV project: record, recordLead, holder, holderLead.
   */
  record: (year) => (year ? ["Your Alchemix record since ", year, " carries into v3"] : ["Your Alchemix record carries into v3"]),
  recordLead:
    "That record earns a tenure card, and every day you hold a v3 position this season earns essence. v3 lends up to 90% of your deposit with no interest on the loan, from one vault per asset that the DAO runs.",
  holder: "Your position already counts",
  holderLead: "Join, and from today every day you hold it earns essence. The position stays as it is.",
  plain: "Welcome back to Alchemix",
  plainLead: "Here is what changed while you were away, and what is open now.",
  story: {
    /** Keenan, 2026-11-04: only one of the three points is the wallet's own event. NEW 2026-11-04, not through the TOV pass. */
    section: "Since you were here",
    first: {
      title: "You first used Alchemix",
      body: (versions, deposit) => (deposit ? `${versions}, largest deposit ${deposit}` : versions),
    },
    firstV3: { title: "You opened a v3 position" },
    v3: {
      date: "April 2026",
      title: "Alchemix moved to v3",
      moved: "Your v2 position moved over with it.",
      closed: "v2 closed, and its open positions moved over.",
    },
    today: { date: "Today", body: (end, left) => `Open now, to ${end}. ${left}.` },
  },
  news: {
    section: "What is new in v3",
    cards: [
      { title: "Borrow up to 90%", body: "Up from 50% before v3. The loan charges no interest." },
      {
        title: "One vault, run by the DAO",
        body: "Your deposit becomes the Mix-Yield Token. The DAO picks its strategies and rebalances them, so there is no yield token to choose.",
      },
      {
        title: "Redemptions pay the loan down",
        body: "As savers redeem in the Transmuter, part of your debt is cancelled from your collateral. Yield tops the collateral back up.",
      },
    ],
    /**
     * One muted fact line under a card, moved out of the hero on 2026-11-04:
     * the yield estimate under the vault card, the collateral growth under the
     * redemptions card. Yield raises collateral; debt falls only through
     * redemptions or a repay. NEW 2026-11-04, not through the TOV pass.
     */
    estimate: (version, deposit, yearly, vault, days, date, pct) =>
      `Your largest ${version} deposit, ${deposit}, would earn about ${yearly} a year at the ${vault} vault's rate over the ${days} days to ${date} (${pct} a year, before fees). Rates change daily.`,
    grown: (amounts, date, pct, days) =>
      `Your collateral has grown ${amounts} since ${date}. ${pct ? `The vault paid ${pct} a year over the last ${days} days. ` : ""}Yield raises collateral, and debt falls only through redemptions or a repay.`,
    /** Design notes 2026-11-03 (note 17): the bar is labeled v2. */
    limitBefore: "v2",
    limitNow: "v3",
    collateral: "Collateral",
    debt: "Debt",
    arbitrum: "v3 is winding down on Arbitrum (AIP-124). Positions on Ethereum and Optimism earn essence.",
  },
  season: {
    section: "The season",
    lead: "Join, then every day you hold a v3 position earns essence toward three unlocks. Essence unlocks access, never money.",
  },
};

export const EARN = {
  /** Feedback 2026-10-28, second round: Earn more and What you get are one section with two tabs. */
  section: "Essence",
  tabsLabel: "Essence",
  tabs: { earn: "Ways to earn", unlocks: "What you get" },
  /** Design notes 2026-11-03 (note 21): the two group labels, short, as labels. */
  daily: "Every day",
  capped: "Every season",
  lands: "Holding essence is added once a day, after the 23:00 UTC sweep. A deposit counts in full from the next day's credit.",
  /** Design notes 2026-11-03 (note 18): the section's docs link, top right. */
  how: "How essence works",
  ofCap: (n, cap) => `${n} of ${cap}`,
  full: "All of it earned",
  rows: {
    holding: {
      title: "Holding",
      rate: (n) => `${n} a day`,
      none: "Not earning yet",
      tiers: "Daily essence by size, on Ethereum and Optimism",
      tierUnder: (usd) => `Under ${usd}`,
      tierRange: (from, to) => `${from} to ${to}`,
      tierFrom: (usd) => `${usd} and up`,
      tierDaily: (n) => `${n} a day`,
      you: (usd) => `You, ${usd}`,
      next: (usd, line, daily) => `Add about ${usd} to pass ${line} and earn ${daily} a day.`,
      /** Holding slope (Keenan, 2026-10-28), then the tenfold scale the same day. NEW, not through the TOV pass. */
      scale: (base, baseUsd, step, cap, capUsd) =>
        `${base} a day up to ${baseUsd}, then ${step} more for each tenfold, to ${cap} a day from ${capUsd}.`,
      capAt: (n) => `${n} cap`,
      /** Fifth round: pointing at the curve. NEW, not through the TOV pass. */
      probeLabel: "Daily essence at any size. Point at the curve, or use the arrow keys.",
      probe: (usd, n) => `${usd} earns ${n} a day`,
      probeMore: (n) => `${n} more a day than now`,
      probeLess: (n) => `${n} less a day than now`,
      cap: (n) => `${n} a day cap`,
      rising: (from, to) => `${from} rising to ${to}`,
      open: "Open a v3 position on Ethereum or Optimism to start.",
    },
    /**
     * Review 2026-11-13 (metalface, Keenan): the card is "Borrowing". The season's rule comes from the engine: a floor,
     * and a ceiling that sits under the borrowing limit (`earning`, `idle`) or at it (`earningOpen`, `idleOpen`).
     * The button uses the Holding card's verbs. NEW, not through the TOV pass.
     */
    safe_loan: {
      title: "Borrowing",
      rate: (n) => `+${n} a day`,
      earning: (min, max) => `Earning. Keep your loan between ${min} and ${max} loan to value.`,
      idle: (min, max) => `Borrow after you join and keep the loan between ${min} and ${max} loan to value. Debt from before you joined earns none.`,
      earningOpen: (min) => `Earning. Any loan from ${min} loan to value up counts.`,
      idleOpen: (min) => `Borrow after you join. Any loan from ${min} loan to value up earns this. Debt from before you joined earns none.`,
      limit: (pct) => `${pct} limit`,
      yours: (list) => `Your loans: ${list}`,
      noLoan: "No loan yet.",
      /** Fifth round (persona walk). NEW, not through the TOV pass. */
      arbitrumOnly: "Your loans are on Arbitrum, which earns no essence.",
      more: "Borrow more",
      first: "Take a loan",
      guide: "Borrowing guide",
    },
    academy: {
      title: "Academy",
      body: "100 for each lesson, plus a bonus for each track. It carries into every season.",
      cta: "Open the Academy",
    },
    event: {
      title: "Event codes",
      body: "Codes are handed out at community calls and events.",
    },
    referral: {
      title: "Referrals",
      body: (usd, days, pct) => `Once they hold ${usd} or more for ${days} days, you both get ${pct} of their daily essence.`,
      /**
       * Feedback 2026-10-28: the money side of a referral, behind the
       * proposals flag with the return bonus. The invitee's 0.5% newcomer
       * bonus (engine RETURN_BONUS_DEFAULTS.newcomerRateBps), on the same
       * vesting and forfeit terms. Needs metalface's sign-off with the
       * return bonus.
       */
      proposal: (rate, base, months) =>
        `The person you invite also gets ${rate} of their new deposits, on top of the ${base} return bonus, paid over ${months} months. It stops if they withdraw.`,
    },
    feedback: {
      title: "Feedback",
      body: "Signed feedback earns 50 when the team acknowledges it and 200 if your feedback is actioned.",
      cta: "Send feedback",
    },
    community: {
      title: "Community help",
      body: "Mods award 100 to 250 for helping others in the Discord.",
      /** Review 2026-11-13: stands where a button would be. Mods hand this out, so it never says "automatic". NEW, not through the TOV pass. */
      tag: "Awarded by mods",
    },
  },
  also: "Also on your list",
};

/**
 * What each rung gives. Lines marked `placeholder` are stand-ins until the
 * team says what the Inner Circle and the VIP event hold (Keenan, 2026-10-28:
 * "We can use placeholders"); the page tags them "To confirm".
 */
export const UNLOCKS = {
  section: "What you get",
  needs: (n) => `${n} essence`,
  unlocked: (date) => `Unlocked ${date}`,
  unlockedNoDate: "Unlocked",
  toGo: (n) => `${n} essence to go`,
  later: "After the unlock before it",
  members: (n) => (n === 1 ? "1 member so far" : `${n} members so far`),
  access: (date) => `Access until ${date}`,
  toConfirm: "To confirm",
  rungs: {
    discord_role: [
      { text: "The members role in the Alchemix Discord." },
      { text: "Members-only channels.", placeholder: true },
    ],
    inner_circle: [
      { text: "The Inner Circle Telegram group, for the season plus one month." },
      { text: "Early looks at what ships next.", placeholder: true },
    ],
    vip: [
      { text: "VIP access at Alchemix events.", placeholder: true },
      { text: "This season's merch, claimed here and shipped to you." },
    ],
  },
};

export const RECENT = {
  /** Feedback 2026-10-28: Recent and season progress are one section. */
  section: "Your season",
  /** Third round the same day: positions are a tab of Your season (the badge strip under the tabs went to the hero in the fourth). NEW, not through the TOV pass. */
  tabsLabel: "Your season",
  tabs: { activity: "Activity", positions: "Positions" },
  credits: "Recent credits",
  accessUntil: (date) => `Access from this season lasts until ${date}, and the next season opens before then.`,
  /** Fourth round: every day on its own row, the last 7 first. NEW, not through the TOV pass. */
  more: (n) => (n === 1 ? "Show 1 more day" : `Show ${n} more days`),
  fewer: "Show fewer",
  /** Design notes 2026-11-03 (note 7): the list folds to the latest day; these open and close it. */
  showAll: "Show recent credits",
  hideAll: "Hide recent credits",
  empty: "Nothing credited yet. Holding essence lands after the next sweep.",
  /** Fifth round (persona walk): for a wallet with nothing that counts. NEW, not through the TOV pass. */
  emptyNoPosition: "Nothing credited yet. A v3 position on Ethereum or Optimism earns essence every day you hold it.",
  sources: {
    holding: "Holding",
    safe_loan: "Borrowing",
    academy: "Academy",
    event: "Event code",
    referral: "Referral",
    feedback: "Feedback",
    community: "Community help",
  },
  unlocked: (label) => `${label} unlocked`,
};

/** Your season's four figures (fourth round). NEW, not through the TOV pass. */
export const SEASON_SUMMARY = {
  days: "Days earning",
  standing: "Among members",
  top: (pct) => `Top ${pct}%`,
  rank: (n, tied) => `Rank ${tied ? "=" : ""}${n}`,
  members: "Members",
  joinedThis: "joined this season",
  ends: "Season ends",
};

/**
 * Next steps: at most three, picked from the wallet's state (Home/NextSteps.jsx).
 * The title names the task, the body gives the one reason to do it (empty
 * when the title says enough; the empty line keeps the buttons aligned), and
 * the button is the verb. The first step's title also labels the hero's action.
 */
export const NEXT = {
  section: "Next steps",
  steps: {
    join_season: {
      title: "Join the season",
      body: "You earn essence from the day you join.",
      cta: "Join season",
    },
    open_position: {
      title: "Open a v3 position",
      /** Fifth round (persona walk): for a wallet whose positions are all on Arbitrum. NEW, not through the TOV pass. */
      titleArbitrum: "Open a position on Ethereum or Optimism",
      body: "Each day you hold earns essence.",
      cta: "Open the app",
    },
    top_up: {
      /** Design notes 2026-11-03 (note 34): "Deposit more" in place of "Top up", which left out what to top up. */
      title: "Deposit more",
      body: "Essence rises from the day you add.",
      cta: "Open the app",
    },
    borrow: {
      title: "Start borrowing",
      body: "Aim near 20% loan to value. Redemptions pay the loan down.",
      cta: "Borrowing guide",
    },
    link_discord: {
      title: "Discord role",
      body: "Get the Members role at the first unlock.",
      cta: "Link Discord",
    },
    claim_tenure: {
      title: "Tenure card",
      body: "",
      cta: "Claim card",
    },
    /** Page review 2026-10-24 (batch item 3): the v2 claim stays an ask after the join. NEW, not through the TOV pass. */
    claim_v2: {
      title: "Claim your v2 Transmuter balance",
      body: "Still waiting in a v2 Transmuter. Claim it in the v2 app.",
      bodyWith: (amount) => `${amount} is still waiting in a v2 Transmuter. Claim it in the v2 app.`,
      cta: "Open the v2 app",
    },
    see_standing: {
      title: "Your essence",
      body: "",
      cta: "See my essence",
    },
    academy: {
      title: "Finish the Academy",
      body: "Both tracks cover most of what the Inner Circle needs.",
      cta: "Open the Academy",
    },
    left: {
      title: "Why did you leave?",
      body: "One answer, no signature.",
      cta: "Give a reason",
    },
    leaderboard: {
      title: "Leaderboard",
      body: "",
      cta: "Open leaderboard",
    },
  },
};

export const DETAIL = {
  history: "History",
  positions: "Positions",
  /** Feedback 2026-10-28: history and the share cards in one section. NEW, not through the TOV pass. */
  record: "Your record",
  share: "Share cards",
  /** The same section when it also holds the referral link (v3 backlog ticket 08). NEW 2026-10-22, not through the TOV pass. */
  shareInvite: "Share and referrals",
};

export const HISTORY = {
  firstUsed: "First used",
  unknownDate: "Unknown",
  versions: "Versions",
  chains: "Chains",
  largestDeposit: "Largest deposit",
  aboutUsd: (usd) => `about ${usd} then`,
  migrated: "Migrated",
  yes: "Yes",
  no: "No",
  none: "No v1 or v2 history.",
  transmuter: (amount) => `${amount} is still in a v2 Transmuter.`,
  transmuterLink: "Legacy docs",
};

export const POSITIONS = {
  none: "No open v3 position.",
  /** Page review 2026-10-24 (batch item 4): exited positions fold into one line. NEW, not through the TOV pass. */
  closed: (n, where) => (n === 1 ? `1 closed position, ${where}.` : `${n} closed positions, ${where}.`),
  position: (id) => `#${id}`,
  collateral: "Collateral",
  debt: "Debt",
  ltv: "Loan to value",
  lastTouched: "Last touched",
  noDebt: "None",
  earmarked: (amount) => `${amount} earmarked`,
  details: "Details",
  hideDetails: "Hide",
  /** Feedback 2026-10-28: each row links to its vault in the app. NEW, not through the TOV pass. */
  manage: "Manage",
  manageTitle: (vault, chain) => `Manage your ${vault} position on ${chain} in the app`,
  /** Review 2026-11-13: a row is named for its vault ("ETH vault", "USDC vault"), as the user docs name them. NEW, not through the TOV pass. */
  vault: (underlying) => `${underlying} vault`,
  unreadable: (markets) => `${markets} did not load. Try again soon.`,
  /**
   * Funnel review 2026-10-23: collateral growth in the row itself (it was in
   * the details only), and the wallet's Transmuter stakes under the table.
   * NEW, not through the TOV pass.
   */
  earned: "Collateral growth",
  earnedSince: {
    handover: "since its move to v3",
    first_deposit: "since first deposit",
    owner_since: "since received",
  },
  /** The positions loaded, their history did not: growth and rates may be missing or a day old. Quiet, not an error. */
  historyUnavailable: (markets) =>
    `History for ${markets} is slow to load right now. Growth, rates and last touched may be missing or a day old.`,
  /** Review 2026-11-13: the app's own name for Transmuter deposits (its Dashboard lists "Fixed Yield Positions"). NEW, not through the TOV pass. */
  stakes: "Fixed Yield positions",
  stakeAmount: "Staked",
  stakeNote: "A stake counts toward essence at par once held 7 days. It is redeemed 1:1 at maturity.",
  value: {
    atHandover: "Moved to v3",
    atFirstDeposit: "First deposit",
    atOwnerSince: "When received",
    today: "Today",
    change: "Change",
    note: "Yield raises collateral value. Only redemptions and repays lower debt.",
    changedSince: "Both values use today's share count.",
  },
  rate: {
    days7: "7-day vault rate",
    days30: "30-day vault rate",
    perYear: (pct) => `${pct} a year`,
    notYet: "Not enough history",
    note: (date) => `Annualized to ${date}. Rates change.`,
  },
};

/**
 * Share cards. Nothing is earned for sharing (X's rules), so nothing here may
 * suggest a reward. The card images carry their own words, so the page adds
 * only a title.
 */
export const SHARE = {
  history: {
    title: "History card",
    alt: (since) => `History card: using Alchemix since ${since}`,
    postText: (since) => `Using Alchemix since ${since}.`,
    fileName: "alchemix-history.png",
  },
  transmuter: {
    title: "Transmuter card",
    alt: (amounts) => `Transmuter card: transmuted ${amounts}`,
    postText: (amounts) => `Transmuted ${amounts} on Alchemix.`,
    fileName: "alchemix-transmuter.png",
  },
  download: "Download",
  downloading: "Preparing...",
  /** While the engine draws a card (walkthrough 2026-10-23). Not through the TOV pass. */
  loading: "Drawing your card...",
  post: "Post on X",
  failed: "Download failed. Try again.",
};

/**
 * Referrals (v3 backlog ticket 08): the referral link beside the share
 * cards, the invitee's line, and the note under the join. The rule is the
 * engine's (share, hold days, size); the numbers come in as arguments, with
 * the season one values as the fallback before the owner signs.
 *
 * NEW 2026-10-22, NOT YET THROUGH THE TOV PASS. Send to the TOV project with
 * the rest of this file. Standing only: no money, no prize. No "Post on X"
 * for the link, since sharing itself earns nothing.
 */
export const REFERRAL = {
  title: "Referral link",
  /** Fourth round: the card in Your record, the rule as three steps. NEW, not through the TOV pass. */
  invite: "Referrals",
  steps: (usd, days, pct) => [
    "Share your link with someone new to Alchemix.",
    `They join the season and hold ${usd} or more for ${days} days.`,
    `From then on, you both get ${pct} of their daily essence.`,
  ],
  body: (usd, days, pct) =>
    `Invite someone new to Alchemix. Once they have held ${usd} or more for ${days} days, you both get ${pct} of their daily essence.`,
  show: "Show link",
  label: "Referral link",
  copy: "Copy link",
  copied: "Copied",
  copyFailed: "Copy did not work. Select the link and copy it.",
  none: "No one has joined through this link yet.",
  invited: (n) => `${n} referred`,
  counting: (n, day, days) => `${n} counting (day ${day} of ${days})`,
  earning: (n) => `${n} earning`,
  credited: (n, cap) => (cap ? `${n} of ${cap} referral essence this season.` : `${n} referral essence this season.`),
  /** The invitee's line, shown to a wallet that joined through a referral. */
  invitee: (pct) => `Joined through a referral, +${pct} while you hold.`,
  inviteeDay: (day, days) => `Day ${day} of ${days}.`,
  /** Under the join button while this browser holds a ?ref code. */
  pending: "You came through a referral link. Join before you deposit so it counts.",
  /** Under the join, from the claim's referral answer. */
  outcome: {
    attributed: "Joined through a referral.",
    live_position: "Referral links count for wallets with no open position, so this one adds no referral essence.",
    self: "That referral link is this wallet's own.",
    other: "That referral link could not be used.",
  },
};

/**
 * The season shirt (v3 backlog ticket 04, ADR 0004 in Alchemix-Seasons): the
 * claim on the VIP and merch rung's badge panel, the notice with its tick
 * box, and the code. One signature gets a single-use code for the Alchemix
 * store; Shopify's checkout takes the address and Printful ships. Alchemix
 * never sees the address.
 *
 * NEW 2026-10-22, NOT YET THROUGH THE TOV PASS. Send to the TOV project with
 * the rest of this file. The notice is a placeholder for the TOV project's
 * wording (reports/Merch fulfillment and claim flow.md lists what it must
 * say). Two lines wait on Keenan: who the data controller is and who to
 * contact for early deletion (both shown as [to be confirmed]). No prize
 * language: the merch marks taking part. Page review 2026-10-24 (Keenan's
 * note): the copy says "merch", never a specific item.
 */
export const MERCH = {
  title: "Season merch",
  body: "One item per wallet each season, printed and shipped by our print partner.",
  locked: "Seasonal merch opens with Event VIP and merch.",
  start: "Claim merch",
  notice: {
    title: "Before you claim",
    items: [
      "At checkout you give the store a name, a shipping address, and an email or phone for tracking.",
      "Our print partner runs the checkout, prints and ships. Your details may be handled in the US, Canada, the EU or the UK.",
      "They are used to ship one item. Nothing else, and never a marketing list.",
      "They are deleted about 30 days after delivery.",
      "Alchemix never sees them and never connects this wallet to an address.",
      "Outside the US, Canada, the EU, the UK, Australia and New Zealand, your country may charge an import fee.",
      "Data controller: [to be confirmed]. To have your details deleted sooner, contact [to be confirmed].",
    ],
    mailbox: "For your safety, we strongly encourage shipping to a PO box or mailbox service, not your home.",
    noTransaction:
      "Claiming is one signature. It never needs a transaction, gas or a token approval, so treat any merch claim that asks for one as a scam.",
    tick: "I understand",
    sign: "Sign and get code",
    cancel: "Not now",
  },
  code: {
    label: "Merch code",
    open: "Open the store",
    copy: "Copy code",
    copied: "Copied",
    until: (date) => `Works once, until ${date}.`,
    how: "The store applies the code. Pick a size, add a shipping address and check out at $0. Orders ship in weekly batches.",
    reissued: "The last code expired unused, so this is a new one. It is the last one this season.",
  },
  redeemed: (date) => `Merch ordered ${date}. It ships in the next weekly batch.`,
  expired: (date) => `This wallet's merch code expired unused on ${date}.`,
  /** Only when the engine runs against the demo store (no Shopify settings). */
  demo: "Demo store: this is a sample code, and the store is a mock that places no order.",
};

export const UNKNOWN = {
  body: "No Alchemix record. Used another wallet? View that address.",
};

export const LOOKUP_FAILED = {
  title: "Could not read this address",
  retry: "Try again",
};

/** When the season engine itself cannot be reached (review 16). Incident pattern: status, then what to do. */
export const ENGINE_DOWN = {
  title: "The members area cannot reach its server",
  body: "The problem is on our side. Funds are safe. Try again in a minute.",
  retry: "Try again",
};

/**
 * /members/merch (demo walkthrough 2026-10-27, Keenan: "a claim page of some
 * kind for the merch", proof of concept, not in the navigation). The store
 * side of the claim: the code, the item and size, and a mock checkout that
 * sends and stores nothing. In the real flow the shipping form is the print
 * partner's own checkout, so the address never reaches Alchemix (ADR 0004).
 * Provider-neutral: Keenan does not expect to use Shopify. NEW, NOT THROUGH
 * THE TOV PASS. "Merch", never a specific item.
 */
export const MERCH_PAGE = {
  title: "Season merch",
  lead: "One item per wallet each season, for members who reach Event VIP and merch.",
  poc: "Proof of concept. Nothing on this page is sent or saved, and no order is placed.",
  code: {
    label: "Merch code",
    applied: "Applied. It covers the item and shipping.",
    none: "Members at Event VIP and merch claim a code on that card with one signature. To try the checkout, use a sample code.",
    sample: "Use a sample code",
    badge: "See the card",
  },
  item: {
    name: "Season One merch",
    body: "Printed when you order, so every size is in stock. Orders ship in weekly batches.",
    size: "Size",
    pickSize: "Pick a size first.",
    lines: [
      ["Item", "Covered by your code"],
      ["Shipping", "Free"],
    ],
    total: "Total",
    totalValue: "$0.00",
  },
  ship: {
    mailbox: "For your safety, we strongly encourage shipping to a PO box or mailbox service, not your home.",
    fields: {
      name: "Full name",
      line1: "Street address",
      line2: "Box, suite or unit (optional)",
      city: "City",
      region: "State or region",
      postal: "Postal code",
      country: "Country",
      contact: "Email or phone, for tracking",
    },
    private: "In the real flow this is the print partner's own checkout. Your details go to them, never to Alchemix, and are deleted about 30 days after delivery.",
    missing: "Fill in every field except the box number.",
    submit: "Place order",
  },
  done: {
    title: "Order placed (demo)",
    body: "In the real flow it ships in the next weekly batch, and tracking goes to the email or phone you gave. Nothing was sent or saved.",
    back: "Back to your record",
    again: "Start again",
  },
};

export const SECTIONS = {
  merchCode: "Your code",
  merchItem: "Your merch",
  merchShip: "Shipping",
  leaderboard: "Leaderboard",
  sendFeedback: "Send feedback",
  mySubmissions: "Submissions",
  shipped: "Shipped log",
  leaving: "Reason for leaving",
  pastSeasons: "Past seasons",
};

export const FEEDBACK = {
  headline: "Feedback",
  intro: "Send it anonymously, or sign it to get credit if it ships.",
  categoryLabel: "Type",
  categories: {
    bug: "Bug",
    idea: "Idea",
    confusing: "Confusing",
    leaving: "Reason for leaving",
  },
  bodyLabel: "Feedback",
  bodyPlaceholder: "What happened, or what would help?",
  count: (n, max) => `${n} of ${max}`,
  tooShort: (min) => `At least ${min} characters.`,
  sendAnon: "Send anonymously",
  sendSigned: "Sign and send",
  signedNote: "Signing shares this wallet's group and position size. Signed feedback earns essence once the team acknowledges or ships it.",
  /** Shown beside the form. Sending with it on screen lets the shipped log quote the text (review 13). */
  publicNotice: "If your feedback ships, the public shipped log may quote it and credit your pseudonym. Quotes hide addresses. Reasons for leaving are never quoted.",
  publicNoticeTitle: "What may be public",
  sentAnon: "Sent. Thank you.",
  sentSigned: "Sent. Follow it under Submissions.",
};

/**
 * The question of the round (gap audit item 7). Leave `prompt` as "" to hide
 * the block. `category` is the form category it pre-fills.
 *
 * `topic` is not shown to anyone. It is the slug the engine stores with every
 * answer sent after "Answer this question", so the team can filter answers to
 * this question in triage. Give each new question its own slug: lowercase
 * letters and digits with single hyphens between them, 40 characters at most
 * (the engine refuses anything else). Leave it "" to send no topic.
 */
export const FEEDBACK_QUESTION = {
  topic: "aip-123",
  eyebrow: "This round's question",
  prompt:
    "The April migration to v3 (AIP-123) converted v2 collateral into USDC and WETH. How did it go for you, and did it change how you use Alchemix?",
  category: "confusing",
  button: "Answer",
  /** Design notes 2026-11-03 (metalface 36): the callout sits beside the form, or under it on a phone. */
  active: "Answer in the form.",
};

export const MINE = {
  button: "Sign to see submissions",
  empty: "No signed feedback yet.",
  status: {
    new: "New",
    duplicate: "Duplicate",
    acknowledged: "Acknowledged",
    shipped: "Shipped",
    not_planned: "Not planned",
  },
  sent: (date) => `Sent ${date}`,
  shipNote: "Ship note",
};

export const SHIPPED = {
  intro: "Changes from member feedback, newest first.",
  empty: "Nothing shipped yet.",
  thanks: (name) => `Thanks to ${name}`,
  anonymous: "From anonymous feedback",
  loadFailed: "The shipped log did not load. Try again in a minute.",
};

export const LEADERBOARD = {
  intro:
    "Essence builds each day a wallet holds a position after joining the season, and larger positions earn more a day, up to 10 times the smallest. It unlocks access, never money. Addresses show as pseudonyms. Most essence comes from public chain data, so a pseudonym is not anonymity.",
  introPast: "Addresses show as pseudonyms. Most essence comes from public chain data, so a pseudonym is not anonymity.",
  pastLabel: "Season",
  current: "This season",
  finalOn: (date) => `Frozen ${date}`,
  pastEmpty: "Nobody finished that season with essence.",
  pastFailed: "That season's results did not load. Try again in a minute.",
  rank: "Rank",
  /** A rank another wallet shares, shown as "=12". */
  sharedRank: (rank) => `=${rank}`,
  sharedRankLabel: (rank) => `Shared rank ${rank}`,
  name: "Name",
  standing: "Essence",
  total: (n) => `${n} wallets`,
  /**
   * Design notes 2026-11-03 (metalface 37): sort, search and page size. The
   * engine sends the live board 100 rows at a time, so sort and search cover
   * the rows read so far, and the note says so. NEW, not through the TOV pass.
   */
  searchLabel: "Search by pseudonym",
  searchPlaceholder: "Search pseudonyms",
  size: "Rows",
  sizeLabel: "Rows to show",
  showMore: "Show more",
  shown: (n, total) => `${n} of ${total}`,
  shownFound: (n, found) => `${n} of ${found} found`,
  partial: (n, total) => `Sorting and search cover the top ${n} of ${total}. Show more to reach further.`,
  noMatch: (q) => `No pseudonym matches "${q}".`,
  noMatchYet: (q) => `No pseudonym matches "${q}" yet. Show more to search further down the board.`,
  empty: "No essence yet this season.",
  noSeason: "No season is open.",
  accessUntil: (date) => `Access until ${date}`,
  status: {
    open: "Open",
    upcoming: "Upcoming",
    closed: "Closed",
    finalized: "Final",
  },
};

export const LEAVING = {
  headline: "Why did you leave?",
  intro: "One answer helps the team fix it. No signature needed.",
  addressLabel: "Address you withdrew from",
  reasonLabel: "Main reason",
  reasons: {
    better_rate_elsewhere: "Better rate elsewhere",
    peg_or_transmuter: "The alAsset peg or the Transmuter queue",
    closing_loan: "Done with the loan",
    needed_funds: "Needed the money",
    risk_concern: "Risk or security worries",
    moving_chains: "Moving to another chain",
    other: "Something else",
  },
  textLabel: "Details (optional)",
  textPlaceholder: "What would have kept you?",
  textPrivate: "Only the team reads this. It is never published.",
  submit: "Send",
  pickReason: "Pick a reason first.",
  thanks: "Sent. Thank you.",
  another: "Send another",
  /** Page review 2026-10-24 (batch item 5): the thank-you leads back to the record. NEW, not through the TOV pass. */
  back: "Back to your record",
};

/** Engine error codes (src/lib/engine/errors.ts) in plain words. Unknown codes use the engine's own message. */
export const ERRORS = {
  rate_limited: "Too many requests. Wait a minute and try again.",
  invalid_address: CONNECT.badAddress,
  chain_unavailable: "Position data did not load. Try again in a minute.",
  not_past_user: CLAIMS.badge.notPastUser,
  not_head_list: CLAIMS.innerCircle.notEligible,
  completion_used: "Those Academy completions already earned essence for another wallet.",
  unsupported_media_type: "Reload the page and try again.",
  telegram_unconfigured: CLAIMS.innerCircle.unconfigured,
  discord_unconfigured: CLAIMS.discord.unconfigured,
  unknown_event_code: "That code does not exist. Check it and try again.",
  event_code_not_open: "That code is not open yet.",
  event_code_closed: "That code has closed.",
  already_redeemed: "This wallet already redeemed that code.",
  no_open_season: SEASON.none,
  cap_reached: "This has reached its limit for now.",
  track_incomplete: "Finish every lesson in the track, then claim it.",
  discord_taken: "That Discord account is already linked to another wallet.",
  already_linked_other: "This wallet is already linked to a different Discord account.",
  nonce_expired: "The message expired before it was signed. Try again.",
  nonce_used: "That message was already used. Try again.",
  domain_mismatch: "Claims cannot be signed from this site.",
  signature_invalid: "The signature did not match. Try again from the wallet you are viewing.",
  // V3 backlog ticket 07. Not through the TOV pass.
  params_mismatch: "That message was made for different details. Try again.",
  unknown_exit_reason: LEAVING.pickReason,
  // V3 backlog ticket 04: the season merch. Not through the TOV pass.
  merch_below_rung: "Seasonal merch opens with Event VIP and merch.",
  merch_no_position: "Merch needs a live v3 position or Transmuter stake on Ethereum or Optimism.",
  merch_paused: "Merch claims are paused for now. Try again later.",
  merch_unavailable: "The store did not answer. Try again in a minute.",
  network: "The members area cannot reach its server. Try again in a minute.",
  generic: "Something went wrong. Try again.",
};

/**
 * The two links on the Academy's "Track complete" panel (gap audit item 2).
 * Imported by src/pages/academy/index.jsx.
 */
export const ACADEMY_LINKS = {
  lead: "Next, in the members area:",
  standing: "Claim this track's essence",
  feedback: "Tell the team what was unclear",
};

/**
 * Feedback 2026-10-28, third round (Keenan). NEW, NOT YET THROUGH THE TOV PASS.
 * HERO_MONEY: the money half of the member hero, where the collateral growth
 * line moved. BADGE_STRIP: the small badge row in Your season. BADGES_PAGE:
 * /members/badges, which holds every badge and claim and takes the
 * leaderboard's place in the nav.
 */
/**
 * Fifth round (Keenan, 2026-10-28): the card that pops over a badge on hover.
 * `how` is what earned it, in the past tense (the engine's description is
 * what to do). NEW, not through the TOV pass.
 */
export const BADGE_POP = {
  how: (key, threshold) =>
    ({
      tenure: "Claimed by the wallet that used Alchemix before v3.",
      v1_era: "Used Alchemix v1, the first version.",
      v2_era: "Used Alchemix v2.",
      migrated: "Held a v2 position when Alchemix moved to v3.",
      patron: "Holds an Alchemix Patron NFT.",
      v1_to_v3: "Used v1, and holds v3 today.",
      first_v3_deposit: "Opened a v3 position.",
      borrower: "Borrowed against a v3 position.",
      held_30_days: "Held a v3 position 30 days straight.",
      returned: "Added to a migrated position.",
      transmuter: "Deposited an alAsset in the Transmuter.",
      transmuted: "Claimed a converted Transmuter position.",
      two_chains: "Held v3 positions on two chains at once.",
      early_season: "Held a v3 position in the season's first week.",
      season_marathon: "Held a v3 position the whole season.",
      discord_linked: "Linked Discord to this wallet.",
      inner_circle_joined: "Joined the Inner Circle group.",
      event_attendee: "Redeemed an event code.",
      academy_graduate: "Claimed a finished Academy track.",
      feedback_shipped: "Sent feedback the team shipped.",
      referrer: "Had a referral credited.",
      season_member: "Joined the season.",
      discord_role: threshold ? `Reached ${threshold} essence this season.` : null,
      inner_circle: threshold ? `Reached ${threshold} essence this season.` : null,
      vip: threshold ? `Reached ${threshold} essence this season.` : null,
    })[key] ?? null,
  found: "hidden, found",
  tenureReady: "This wallet used Alchemix before v3. Sign once on the Arcana page to claim it. No gas.",
  ready: "Ready to claim",
  progress: (current, target) => `${current} of ${target}`,
  ago: {
    today: "today",
    days: (n) => `${n} ${n === 1 ? "day" : "days"} ago`,
    months: (n) => `${n} ${n === 1 ? "month" : "months"} ago`,
    years: (n) => `${n} ${n === 1 ? "year" : "years"} ago`,
  },
};

/**
 * Fifth round (Keenan, 2026-10-28): the hero moments (Home/Moments.jsx).
 * NEW, not through the TOV pass.
 */
export const MOMENTS = {
  sinceVisit: (n, date) => `+${n} since your visit on ${date}`,
  thisWeek: (n) => `+${n} in the last 7 days`,
  unlocked: "Unlocked",
  unlockedOn: (date) => `Unlocked ${date}`,
  claims: {
    discord_role: "Link Discord on the Arcana page to get the Members role.",
    inner_circle: "Your Inner Circle Telegram group link waits on the Arcana page.",
    vip: "Event VIP and merch are yours. Claim them on the Arcana page.",
  },
  soon: "Claims for this open soon. It is yours for the season.",
  open: "Claim it",
  see: "See it",
  dismiss: "Dismiss",
};

export const HERO_MONEY = {
  label: "Your deposits",
  /** Fifth round: in place of "since the April handover". NEW, not through the TOV pass. */
  sinceMigrated: (date) => (date ? `since moving to v3 on ${date}` : "since moving to v3 in April"),
  sinceDate: (date) => `since ${date}`,
  sinceFirstDepositOn: (date) => `since your first deposit on ${date}`,
  rateLabel: "Vault rate",
  perYear: (pct) => `${pct} a year`,
  lastDays: (days) => `Last ${days} days`,
};

export const BADGE_STRIP = {
  ready: (n) => (n === 1 ? "1 ready to claim" : `${n} ready to claim`),
};

export const BADGES_PAGE = {
  title: "Arcana",
  headline: "Your arcana",
  /**
   * Demo 2026-11-05 (Keenan: try "Arcana", and say what it means on the page). NEW, not through the TOV pass.
   * Last sentence rewritten for the cabinet. NEW 2026-11-05, not through the TOV pass.
   */
  lead: "Arcana are the cards of a tarot deck. Each one here is earned: it marks something this wallet has done with Alchemix. Open a deck to spread its cards, and open a card for the full account.",
  ready: "Ready to claim",
  empty: "Connect a wallet or view an address to see its cards.",
  board: "See the leaderboard",
  earned: (n, total) => `${n} of ${total} earned`,
  /** Design notes 2026-11-03 (metalface 26): the hero's figure, under the large count. NEW, not through the TOV pass. */
  earnedOf: (total) => `of ${total} cards earned`,
  /** Design notes 2026-11-03 (metalface 25, 30): store claims wait on the store page. NEW, not through the TOV pass. */
  storeClaims: (n) => (n === 1 ? "1 more to claim in the store" : `${n} more to claim in the store`),
  claims: {
    tenure: "Tenure card",
    vip: "Seasonal merch",
    inner_circle: "Inner Circle Telegram",
    discord_role: "Discord role",
  },
};

/**
 * The essence store (fourth round, Keenan: for showing only, for now; design
 * notes 2026-11-03, metalface 25: its own page, /members/store, in the nav).
 * Items follow the rung lines in UNLOCKS; `placeholder` ones are tagged "To
 * confirm" until the team says what they hold. NEW, not through the TOV pass.
 */
export const STORE = {
  title: "Store",
  headline: "Essence store",
  lead: "What essence unlocks this season. Nothing is spent: reaching an item's level unlocks it, and the essence stays.",
  empty: "Connect a wallet or view an address to see where it stands.",
  section: "Unlocks",
  preview: "Preview",
  unlocked: "Unlocked",
  locked: "Locked",
  claimed: "Claimed",
  included: "Included",
  days: (n) => (n <= 1 ? "about a day" : `about ${n} days`),
  merchNote: "The season shirt is claimed with one signature and checked out at $0.",
  merchLink: "See the shirt store",
  items: [
    { key: "role", rung: "discord_role", glyph: "role", title: "Members role", body: "The members role in the Alchemix Discord.", claim: "discord", claimedBy: "discord_linked" },
    { key: "channels", rung: "discord_role", glyph: "channels", title: "Members-only channels", body: "Channels in the Discord for members.", placeholder: true },
    { key: "telegram", rung: "inner_circle", glyph: "telegram", title: "Inner Circle Telegram", body: "The group, for the season plus one month.", claim: "telegram", claimedBy: "inner_circle_joined" },
    { key: "early", rung: "inner_circle", glyph: "preview", title: "Early looks", body: "A first look at what ships next.", placeholder: true },
    { key: "shirt", rung: "vip", glyph: "shirt", title: "Season shirt", body: "This season's merch, claimed here and shipped to you.", claim: "merch" },
    { key: "event", rung: "vip", glyph: "event", title: "Event VIP", body: "VIP access at Alchemix events.", placeholder: true },
  ],
};
