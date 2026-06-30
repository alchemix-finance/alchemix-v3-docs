/**
 * Single source of truth for Alchemix glossary terms.
 *
 * Both the Glossary page (via <GlossaryEntry/>) and the inline <Term/> popover
 * read from this array, so a definition lives in exactly one place and the two
 * surfaces can never drift apart.
 *
 * @typedef {Object} GlossaryTerm
 * @property {string} id          Short, stable slug. Doubles as the Glossary
 *                                page heading anchor (/user/glossary#<id>) and
 *                                as the <Term id="..."> authoring key.
 * @property {string} term        Display name: the entry heading and the
 *                                popover title.
 * @property {string} definition  Plain-text definition (one to three sentences).
 * @property {string} href        Site-absolute path to the fuller concept page.
 * @property {string} linkLabel   Visible label for the concept-page link.
 */

/** @type {GlossaryTerm[]} */
export const GLOSSARY = [
  {
    id: "alasset",
    term: "alAsset",
    definition:
      "A synthetic token minted by borrowing against collateral in Alchemix. alUSD mirrors USDC; alETH mirrors ETH. Inside the protocol, 1 alAsset always cancels 1 unit of debt regardless of its external market price.",
    href: "/user/concepts/alAssets",
    linkLabel: "alAssets",
  },
  {
    id: "alchemist",
    term: "Alchemist",
    definition:
      "The core smart contract that accepts MYT collateral, issues alAsset loans, and manages LTV enforcement, earmarking, and liquidation logic.",
    href: "/user/concepts/self-repaying-loans",
    linkLabel: "Self-Repaying Loans",
  },
  {
    id: "earmarked-debt",
    term: "Earmarked debt",
    definition:
      "A fixed slice of a borrower's outstanding loan that the protocol reserves during a redemption cycle. Earmarked collateral continues earning yield until the moment of settlement. Earmarked debt must be repaid with MYT rather than alAssets.",
    href: "/user/concepts/redemption-rate",
    linkLabel: "Redemption Rate",
  },
  {
    id: "fundamental-oracle",
    term: "Fundamental oracle",
    definition:
      "A price feed that values a yield-bearing token by its underlying redemption value rather than its open-market trading price. Alchemix uses fundamental oracles for Conservative MYT strategies so that DEX price swings cannot trigger liquidations.",
    href: "/user/safety/risk-considerations",
    linkLabel: "Risk Considerations",
  },
  {
    id: "chronicle-oracle",
    term: "alAsset oracle (Chronicle)",
    definition:
      "A dedicated external price feed, provided by Chronicle Labs, for each alAsset (one per alUSD, alETH). Unlike the internal fundamental oracle (which values MYT collateral), these feeds let external protocols verifiably price alAssets so they can be used as collateral across DeFi.",
    href: "/user/concepts/alAssets#using-alassets-across-defi",
    linkLabel: "Using alAssets across DeFi",
  },
  {
    id: "ltv",
    term: "LTV (Loan-to-Value)",
    definition:
      "The ratio of outstanding debt to collateral value, expressed as a percentage. Alchemix allows borrowing up to 90% LTV. Liquidation is triggered at 95% LTV.",
    href: "/user/concepts/liquidations",
    linkLabel: "Liquidations",
  },
  {
    id: "myt",
    term: "Mix-Yield Token (MYT)",
    definition:
      "An ERC-20 token representing a share of a diversified portfolio of yield strategies managed by the Alchemix DAO. MYT is the collateral accepted by the Alchemist. Its redemption value grows continuously as underlying strategies earn yield.",
    href: "/user/concepts/myt-and-yield",
    linkLabel: "Mix-Yield Token",
  },
  {
    id: "redemption-rate",
    term: "Redemption rate",
    definition:
      "An annualized measure of how quickly borrower debt is being paid down through Transmuter redemptions. A higher rate means faster deleveraging. Calculated as annualized Transmuter volume divided by total system debt.",
    href: "/user/concepts/redemption-rate",
    linkLabel: "Redemption Rate",
  },
  {
    id: "self-repaying-loan",
    term: "Self-repaying loan",
    definition:
      "An Alchemix loan whose balance decreases over time without the borrower taking action, as vault yield and scheduled Transmuter redemptions service the debt. Interest rate is 0%; debt only moves downward unless the borrower mints more.",
    href: "/user/concepts/self-repaying-loans",
    linkLabel: "Self-Repaying Loans",
  },
  {
    id: "temporal-leverage",
    term: "Temporal leverage",
    definition:
      "The additional yield earned because earmarked collateral continues compounding from the moment debt is earmarked until the moment it is settled. This yield would not accrue in a system that converted collateral immediately at earmark time.",
    href: "/user/concepts/redemption-rate",
    linkLabel: "Redemption Rate",
  },
  {
    id: "transmuter",
    term: "Transmuter",
    definition:
      "A contract that accepts alAsset deposits and, after a fixed term set by the DAO, redeems them 1:1 for an equivalent value of MYT. The Transmuter is the primary mechanism for alAsset supply contraction and peg maintenance.",
    href: "/user/concepts/transmuter",
    linkLabel: "Transmuter",
  },
];

/**
 * Look up a single term by its id.
 * @param {string} id
 * @returns {GlossaryTerm | null}
 */
export function getTerm(id) {
  return GLOSSARY.find((t) => t.id === id) || null;
}
