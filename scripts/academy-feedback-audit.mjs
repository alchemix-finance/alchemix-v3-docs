/**
 * Every note Keenan has given this session, checked against the current copy.
 *
 * GONE  = the flagged string no longer appears anywhere in learner-facing source
 * PRESENT = the thing he asked FOR is in place
 */
import fs from "node:fs";
import path from "node:path";

const HERE = path.resolve(import.meta.dirname, "..");
/**
 * Academy surface only. `src/components/LtvSensitivity` is a published-docs
 * component (used by docs/user/concepts/alAssets.md) and carries its own
 * register, so it is deliberately out of scope here. It still contains
 * "These numbers are illustrative", which is worth a separate decision.
 */
const ACADEMY = [
  path.join(HERE, "src", "components", "Academy"),
  path.join(HERE, "src", "pages", "academy"),
];
const ENGINE = path.resolve(HERE, "..", "Alchemix-Seasons", "src", "lib", "academy");

function readAll(dir) {
  let out = "";
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out += readAll(p);
    else if (/[.](jsx|mdx|js|ts|css)$/.test(e.name)) out += "\n" + fs.readFileSync(p, "utf8");
  }
  return out;
}
const SRC = ACADEMY.map(readAll).join("\n");
const ENG = fs.existsSync(ENGINE) ? readAll(ENGINE) : "";
/* The intermediate track alone, for the assertions written when the beginner
   track still had numeric checkpoints. Both tracks are all questions now. */
const ENG_INT = fs.existsSync(ENGINE) ? fs.readFileSync(path.join(ENGINE, "intermediate.ts"), "utf8") : "";

/* [label, kind, needle]  kind: "gone" | "present" | "gone-engine" | "present-engine" */
const CHECKS = [
  ["trailing 'on the same screens and with the same numbers'", "gone", "on the same screens and"],
  ["trailing 'one app screen at a time'", "gone", "one app screen at a time"],
  ["'You only act in steps 1, 3 and 5'", "gone", "You only act in steps"],
  ["track that 'walks'", "gone", "track walks"],
  ["tracks that 'work through'", "gone", "tracks below work through"],
  ["intermediate track that 'works through'", "gone", "track works through"],
  ["tutorials that 'walk through'", "gone", "tutorials](/user/quick-start) walk through"],
  ["DAO that 'steers'", "gone", "DAO steers"],
  ["the product is named in the lesson 1 reveal", "present", "Alchemix charges none"],
  ["deleveraging named", "present", "deleveraging: the debt shrinks"],
  ["'decides that' pointing at a heading", "gone", "rate decides that"],
  ["'The green line you watched'", "gone", "green line you watched"],
  ["'how much debt the system carries'", "gone", "debt the system carries"],
  ["anti-cheat notices", "gone", "Every learner gets"],
  ["lowercase flow value 'runs the strategies'", "gone", 'value: "runs the strategies"'],
  ["'comes back carrying'", "gone", "comes back carrying"],
  ["'you can skip it entirely'", "gone", "skip it entirely"],
  ["'The withdrawal went through the moment you asked'", "gone", "went through the moment you asked"],
  ["LTV + 90% cap bolted with 'and'", "gone", "deposited, and the protocol caps it at 90%"],
  ["mint + cancels bolted with 'and'", "gone", "into your\n            wallet, and inside the protocol"],
  ["'standing behind'", "gone", "standing behind"],
  ["'The quick start suggests'", "gone", "quick start suggests"],
  ["'at a pace the protocol sets for the whole market'", "gone", "at a pace the protocol sets for"],
  ["wrong MYT claim 'with alUSD, MYT, or USDC'", "gone", "alUSD, MYT, or USDC"],
  ["MYT earmark rule stated", "present", "MYT is required for"],
  ["two-sentence reveal title", "gone", "Time and repayment both lower it."],
  ["'climbs the moment the repayment lands'", "gone", "the moment the repayment lands"],
  ["stage direction 'watch both figures on the card'", "gone", "watch both figures"],
  ["stage directions generally ('and watch', 'see what')", "gone", "and watch the"],
  ["'Those three are the whole list'", "gone", "the whole list"],
  ["hedge 'illustrative'", "gone", "illustrative"],
  ["placeholder 'protocol conditions'", "gone", "protocol conditions"],
  ["Transmuter as the borrower's exit", "gone", "Transmuter takes your alUSD"],
  ["'earnings clear the loan'", "gone", "earnings clear the loan"],
  ["BackLab headline pointing at a card that is not rendered", "gone", 'headline="Read the position card."'],
  ["flow cards share a height (align-items: stretch)", "present", "align-items: stretch"],
  ["WhatLab slider labelled plainly", "present", 'label="Interest rate"'],
  ["fractional checkpoint rate in the engine", "gone-engine", "randomInt(0, 71) / 10"],
  ["your-deposit is a question, not a sum", "present-engine", 'choiceLesson("your-deposit"'],
  ["borrowing is a question, not a sum", "present-engine", 'choiceLesson("borrowing"'],
  ["fractional rate in the docs dev grader", "gone", "between(3, 10, 1)"],

  /* Second read-through of the beginner track. */
  ["'Left alone' twice on the lesson 4 checkpoint screen", "gone", "Left alone, the balance falls on its own"],
  ["'Left alone, the balance only moves down'", "gone", "Left alone, the balance only moves down"],
  ["'Left alone, the balance only moves down' in the engine", "gone-engine", "Left alone, the balance only moves down"],
  ["'Left alone' in the lesson 4 blurb", "gone", "Left alone, the balance only falls"],
  ["'a loan you never touch can only fall'", "gone", "can only fall"],
  ["a balance that 'falls on its own'", "gone", "falls on its own"],
  ["balance paid down, in financial terms", "present", "only ever paid down"],
  ["British 'travelled'", "gone", "travelled"],
  ["British 'travelled' in the engine", "gone-engine", "travelled"],
  ["Transmuter paying 'a full one'", "gone", "pays you a full one"],
  ["redeeming for 'a full one'", "gone", "for a full one."],
  ["'Today each one costs' is backed by a live read of the price", "present", "Today each one costs {priceText(price, live)}"],
  ["the discount lessons read the alUSD price live", "present", "useAlUsdPrice()"],
  ["round ETH deposit in lesson 5", "present", "const DEPOSIT = 10;"],
  ["round alETH debt in lesson 5", "present", "const BORROWED = 5;"],
  ["the morning price stated, so the 40% is checkable", "present", "this morning"],
  ["'which is why the bar sat still'", "gone", "which is why the bar sat still"],
  ["'the second marker on the bar'", "gone", "the second marker on the bar"],
  ["old beginner track intro", "gone", "You put in a deposit"],
  ["old intermediate track intro", "gone", "Underneath the app is a vault"],

  /* App surfaces named on the track card and in the lesson header. */
  ["lessons carry the app screen they are about", "present", 'app: "Borrow"'],
  ["the Variable Rate surface is named the way the app names it", "present", 'app: "Earn · Variable Rate"'],
  ["the Fixed Rate surface is named the way the app names it", "present", 'app: "Earn · Fixed Rate"'],
  ["a quick start that 'walks'", "gone", "quick start</Link> walks"],

  /* The intermediate track: checkpoints, caps, and the prose around them. */
  ["every intermediate checkpoint is a question, not a slider", "present-intermediate", 'choiceLesson('],
  ["no numeric target left in the intermediate lessons", "gone-intermediate", 'kind: "number"'],
  ["the pace checkpoint no longer inverts a projection", "gone-engine", "Find the redemption rate that leaves"],
  ["the capstone checkpoint no longer asks for a deposit figure", "gone-engine", "What is the smallest deposit"],
  ["the discount checkpoint no longer asks for an annualized return", "gone-engine", "returns what, annualized"],
  ["the withdraw checkpoint no longer asks for an amount", "gone-engine", "How much of that collateral can you withdraw"],
  ["the blend checkpoint no longer asks for an APR", "gone-engine", "Find the highest blended APR"],
  ["MixLab no longer grades an allocation", "gone", "Submit this allocation"],
  ["stale 10% Aggressive cap", "gone", "10% per strategy, 10% in total"],
  ["stale 25% Moderate cap", "gone", "25% per strategy, 40% in total"],
  ["stale cap figures in the MYT lesson", "gone", "capped at 25%"],
  ["current Aggressive cap", "present", "20% per strategy, 20% in total"],
  ["current Moderate cap, stated as cumulative", "present", "40% per strategy, 60% with Aggressive"],
  ["the cumulative rule is explained", "present", "covers Moderate and Aggressive together"],
  ["caps are checked at allocation, not on withdrawal", "present", "until the DAO rebalances"],
  ["'all10,000' space typo", "gone", "Clear the loan and all\n        {money(DEPOSIT)}"],
  ["the withdraw rule is stated before the guess", "present", "debt can never be more than 90%"],
  ["the nearest reachable answer counts as right", "present", "as close as this slider gets"],
  ["repaying shows what it freed", "present", 'label="Freed by repaying"'],
  ["'Another charge arrives later'", "gone", "Another charge arrives later"],
  ["'This is the loss to size a position against'", "gone", "loss to size a position against"],
  ["'the liquidation threshold applied to the backing that remains' as a title", "gone", "threshold applied to the backing that remains."],
  ["'The capstone puts both numbers to work'", "gone", "capstone puts both numbers to work"],
  ["liquidation described as total", "gone", "and the position is liquidated."],
  ["'the market has no effect in that one'", "gone", "in that one"],
  ["the term gain is stated before the annualized guess", "present", "{perTerm.toFixed(2)}% over the term. The length of that term"],
  ["'the founding class closes when season one opens' in the heading", "gone", "the founding class closes when season"],
  ["'which is also the moment the founding class closes for good'", "gone", "closes for good"],

  /* Demo pass, 2026-09-19: the full read before the demo. */
  ["referent chain 'Divide the first by the second'", "gone", "Divide the first by the second"],
  ["lesson-structure subject 'This track borrows'", "gone", "This track borrows"],
  ["lesson-structure subject 'This lesson needs a price that moves'", "gone", "This lesson needs a price"],
  ["en-dash definition lists in the write-ups", "gone", "** \u2013 "],
  ["unsourced Visualizer overlay claim", "gone", "overlays the real redemption schedule"],
  ["one name for the early exit fee in the peg lesson", "gone", "early transmutation fee, so"],
  ["hedge opening the deposit Try stage", "gone", "so treat this one as an"],
  ["dead slider props gone from the beginner checkpoints", "gone", 'headline="Work out what the deposit is worth."'],
  ["health factor taught in the borrowing lab before the check asks about it", "present", 'label="Health factor"'],
  ["caps-at-allocation rule taught in the MYT lab before the check asks about it", "present", "checked when the DAO allocates, and they are measured"],
  ["borrower collateral named as what funds the 1:1 in the peg lab", "present", "Borrower collateral is what funds that promise"],
  ["every Try stage says how to continue", "present", "Push the amount up to the cap to continue"],

  /* Sequential walkthrough, 2026-09-19: what a learner sees, in order. */
  ["the six-lessons strip has a stop for lesson 1", "present", 'id: "what-alchemix-does",\n    label: "The idea"'],
  ["the strip no longer counts five stops under a six-lesson heading", "gone", "repeat(5, minmax(0, 1fr))"],
  ["the local-grading notice does not say 'was graded' before grading", "gone", "so this was graded in your browser"],
  ["the pace reveal names both guesses before the truth", "present", "You said {ana}% for Ana and {ben}% for Ben."],
  ["the pace reveal no longer calls two different numbers a match", "gone", "Your two answers match, and so does the projection"],
  ["the capstone's Visualizer crop says why its loan cost reads zero", "present", "has no loan open, so its loan cost reads zero"],
  ["one name for the Transmuter's exit fee, in the banks too", "gone", "early transmutation fee"],
  ["the track map has a main landmark", "present", "      <main>\n        <section className={styles.intro}>"],

  /* Layout pass, 2026-09-20: the strip's cards sat at their own heights. */
  ["the strip's stops stretch to one row height", "gone", "repeat(6, minmax(0, 1fr));\n  align-items: start;"],
  ["no source comment still describes the removed live strip", "gone", "the live strip"],
  ["no source comment still measures a five-stop diagram", "gone", "five stops have"],

  /* Accuracy and tablet layout, 2026-09-20: figures a careful reader checks against the screen, and the 768px pass. */
  ["the peg lesson's borrower figure is what the same money buys, not the par saving", "present", "const extra = STAKE / price - STAKE;"],
  ["the peg lesson no longer prints 10,000 x the discount as debt cleared", "gone", "STAKE * (1 - price)"],
  ["the cost lesson's capture does not claim to quote today's price", "gone", "The app quotes the same price this lesson is charging you"],
  ["the cost lesson's reveal has an at-par title", "present", "At par there is no discount, so this borrow costs nothing up front."],
  ["setup-card figures are tightened from 900px, not only on phones", "present", "Tighten the padding and the figure from 900px"],
  ["the phone-only setup-card fix is gone", "gone", "Three figures across a phone-width card leaves about 85px each"],
  ["three controls lay out as three or one", "present", ".controls[data-count=\"3\"]"],
  ["the Controls wrapper reports its count", "present", "data-count={React.Children.toArray(children).length}"],

  /* Visual walk, 2026-09-20: every screen looked at, not read. Thumbnail crops, an ETH tab under a USDC lesson, a deposit that kept shrinking under a cleared loan. */
  ["the borrowing lesson's tab crop is the USDC vault, not an ETH capture", "present", 'depositBorrow: {\n    src: "/img/academy-tab-deposit.png"'],
  ["the whole-screen figure under every lesson is gone", "gone", "shotNote:"],
  ["no crop is a single 336px stat tile", "gone", "crop: tile("],
  ["the Repay and Withdraw crops come from the 2x USDC captures", "present", '"/img/academy-tab-repay.png"'],
  ["the redemption-rate caption quotes the figure in its capture", "present", "reading 90.61% the day this was captured"],
  ["the repay lab re-runs the projection for the balance a repayment leaves", "present", "const curve = useMemo(() => curveFor(opening + moreShown)"],
  ["the repay lab no longer shifts the un-repaid curve by the repayment", "gone", "y: Math.max(p.debt - repay + moreShown, 0)"],
  ["the map's carried position card is gone", "gone", "The position this track builds"],
  ["no figure is capped narrower than the column", "gone", "--fig-max"],

  // Keenan's read of lessons 1 to 3, 2026-09-21: the hero was not aligned, the
  // carried position pushed numbers at a learner who had not met them, the
  // whole-screen figures were bloat, and two crops were cut off and unaligned.
  ["the hero's pitch is centred against the rewards panel", "present", "37.5rem));\n  align-items: center;"],
  ["the whole-screen label is gone", "gone", "The whole screen, in the app"],
  ["the borrowing lesson shows the whole Deposit/Borrow panel", "present", '"/img/academy-tab-deposit.png"'],
  ["no single-tile or tile-pair crops", "gone", "crop: tiles("],
  ["no half-card crop of the vault card", "gone", "depositCap"],
  ["no half-card crop of the Fixed Yield card", "gone", "alAssetPrice"],
  ["figures sit on the column's own edges", "present", "padding: var(--fig-inset) 0;"],
  ["the stat tiles are the 2x USDC rows", "present", "const statsRow = (row) => ({"],
  ["phone-width columns get their own crop of each figure", "present", "const NARROW_PX = 640;"],
  ["the phone tab captures are in use", "present", '"/img/academy-phone-tab-deposit.png"'],

  // Keenan's second read, 2026-09-21: the hero still felt awkward, the app
  // figures sat ahead of the thing the learner was there to do, the Transmuter
  // lesson's Try stage weighed a sale the saver has no reason to make, and a
  // demo needed a way to show the finished map.
  ["the rewards panel is about half again as wide", "present", "clamp(25rem, 40vw, 37.5rem)"],
  ["the panel's two tracks sit side by side", "present", ".rewardTracks {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));"],
  ["no figure sits ahead of the question it is not needed for", "gone", "</AppShot>\n\n      <Panel>"],
  ["no figure sits between the controls and their notes", "gone", "</AppShot>\n\n      <Notes>"],
  ["figures follow the stage's reveal", "present", "      )}\n\n      <AppShot"],
  ["the Transmuter's Try no longer weighs a sale against the wait", "gone", "Weigh selling now against waiting."],
  ["the Transmuter's Try no longer has an amount control that teaches nothing", "gone", 'label="alUSD in"'],
  ["the Transmuter's Try builds the card's APR from the price and the term", "present", "Suppose the term is"],
  ["the Transmuter's Try names the card's field", "present", "Projected fixed APR"],
  ["a test-mode control finishes every lesson in development", "present", "export function completeAllLocally("],
  ["the test-mode receipts are inert in production", "present", "if (!devFallbackEnabled()) return false;"],
  ["the test-mode control folds out of the production bundle", "present", '{process.env.NODE_ENV !== "production" && !finished ? ('],
  ["a finished track's mark does not wrap its label", "gone", "{complete ? <DonePill /> : null}\n              </div>\n              <div className={styles.rewardRole}>"],
  ["the side-by-side tracks stack where they cannot fit", "present", "@media (min-width: 1001px) and (max-width: 1340px)"],
  ["deleting local-only receipts skips the confirm", "present", "localOnly ? onReset() : setAsking(true)"],

  // Keenan's logo (2026-09-21): the Academy lockup leads the shell's header
  // on every page, the hero no longer repeats it as an eyebrow, and the way
  // in from the docs is a button apart from the section links.
  ["the Academy lockup is drawn inline", "present", "export function AcademyLogo("],
  ["the mark stands in where a row cannot spare the lockup", "present", "export function AcademyMark("],
  ["the header leads with the lockup", "present", '<AcademyLogo className={styles.lockup} />'],
  ["the placeholder hexagon brand is gone", "gone", '<span className={styles.brandText}>Alchemix Academy</span>'],
  ["the hero no longer repeats the lockup as an eyebrow", "gone", '<div className={styles.eyebrow}>Alchemix Academy</div>'],
  ["the phone header wraps on the flex row, not its parent", "present", "@media (max-width: 480px) {\n  .headerInner {\n    flex-wrap: wrap;"],
  ["the lesson header swaps to the mark below 1440px", "present", ".withCrumb .lockup {\n    display: none;"],

  // Keenan's third read (2026-09-21): the last intermediate lesson is named
  // for what it teaches, and the map no longer carries the Visualizer sheet.
  ["the last intermediate lesson is named for what it teaches", "present", 'title: "Sizing a position"'],
  ["'Capstone' is gone as a lesson title", "gone", 'title: "Capstone"'],
  ["its URL follows the title", "present", 'slug: "/academy/sizing-a-position"'],
  ["the map's Visualizer sheet is gone", "gone", "What this track builds toward"],
  ["and so is the component that drew it", "gone", "function VisualizerSheet("],
  ["and its styles", "gone", ".sheetRow {"],

  // The lockup left the longest lesson titles cut at every width (found on
  // the third read): the app chip leaves the header, the lockup starts at
  // 1440 on lesson pages, and the stage labels give way before the title.
  ["the lesson header's app chip is gone", "gone", "{lesson.app ? <span className={styles.surface}>"],
  ["the lesson header carries the lockup from 1440", "present", "@media (max-width: 1439px)"],
  ["the stage labels give way at 1280, before the title", "present", `@media (max-width: 1279px) {
  .stepLabel {`],
  ["the title stays until 1000px", "present", `@media (max-width: 1000px) {
  .backTitle {`],
];

let fails = 0;
for (const [label, kind, needle] of CHECKS) {
  const hay = kind.endsWith("intermediate") ? ENG_INT : kind.endsWith("engine") ? ENG : SRC;
  const found = hay.includes(needle);
  const want = kind.startsWith("present") ? found : !found;
  if (!want) fails += 1;
  console.log(`${want ? "  ok  " : "  FAIL"}  ${label}`);
}
console.log(`\n${CHECKS.length - fails}/${CHECKS.length} of Keenan's notes verified in the current copy.`);
process.exit(fails ? 1 : 0);
