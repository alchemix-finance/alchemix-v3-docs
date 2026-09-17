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
  ["product anchor 'In Alchemix, redemptions'", "present", "In Alchemix, redemptions"],
  ["deleveraging named", "present", "deleverages your position"],
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
  ["whole-percent rates in the engine", "present-engine", "[3, 4, 5, 6, 8, 10]"],
  ["round beginner deposits in the engine", "present-engine", "[10_000, 20_000, 30_000, 40_000, 50_000]"],
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
  ["'Today each one costs', which implies a live price", "gone", "Today each one costs"],
  ["round ETH deposit in lesson 5", "present", "const DEPOSIT = 10;"],
  ["round alETH debt in lesson 5", "present", "const BORROWED = 5;"],
  ["the morning price stated, so the 40% is checkable", "present", "this morning"],
  ["'which is why the bar sat still'", "gone", "which is why the bar sat still"],
  ["'the second marker on the bar'", "gone", "the second marker on the bar"],
  ["old beginner track intro", "gone", "You put in a deposit"],
  ["old intermediate track intro", "gone", "Underneath the app is a vault"],

  /* App surfaces named on the track card and in the lesson header. */
  ["lessons carry the app screen they are about", "present", 'app: "Mixed Yield"'],
  ["the Vaults surface is named", "present", 'app: "Vaults"'],
  ["the Fixed Yield surface is named", "present", 'app: "Fixed Yield"'],
  ["a quick start that 'walks'", "gone", "quick start</Link> walks"],
];

let fails = 0;
for (const [label, kind, needle] of CHECKS) {
  const hay = kind.endsWith("engine") ? ENG : SRC;
  const found = hay.includes(needle);
  const want = kind.startsWith("present") ? found : !found;
  if (!want) fails += 1;
  console.log(`${want ? "  ok  " : "  FAIL"}  ${label}`);
}
console.log(`\n${CHECKS.length - fails}/${CHECKS.length} of Keenan's notes verified in the current copy.`);
process.exit(fails ? 1 : 0);
