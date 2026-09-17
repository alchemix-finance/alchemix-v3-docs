/**
 * Academy copy check.
 *
 * Three rounds of tone feedback found the same class of defect, and no grep
 * used at the time could have caught it, because the defect is semantic: a
 * sentence whose subject is the lesson's own structure rather than anything in
 * Alchemix.
 *
 *   "Those three are the whole list, and two of them are your own choices."
 *
 * Delete that and the reader loses nothing. It is commentary on the teaching
 * rather than teaching. No regex decides that, and a checker that pretends
 * otherwise just produces noise nobody reads.
 *
 * So this script does three honest jobs and no more:
 *
 *   1. FAILURES   Mechanical and definitely wrong. Exits 1.
 *                 Banned phrasing, the two protocol claims that keep coming back
 *                 wrong, and a sentence paraphrased twice close together.
 *   2. REVIEW     A short queue where the subject slot looks like an abstraction
 *                 about the lesson. Some will be fine. Read them.
 *   3. INVENTORY  Every learner-facing sentence, numbered, written to
 *                 build/academy-sentences.txt.
 *
 * Job 3 is the real one. The reason bad sentences shipped three times is that
 * nobody read all of them in one sitting; each pass fixed the flagged examples
 * and whatever was greppable. The inventory makes the full read the cheap
 * default. It is ~500 sentences, about fifteen minutes.
 *
 * The test to apply to each: delete it. If the reader loses no fact about
 * Alchemix (a mechanism, a number, a name, an action they can take), cut it.
 *
 * Run:  pnpm copy:check
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const A = path.join(SRC, "components", "Academy");
const P = path.join(SRC, "pages", "academy");

/* ── Collect every learner-facing string ─────────────────── */

function sourceFiles() {
  const out = [];
  for (const d of fs.readdirSync(A, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const f = path.join(A, d.name, "index.jsx");
    if (fs.existsSync(f)) out.push(f);
  }
  for (const f of fs.readdirSync(path.join(A, "lessons"))) out.push(path.join(A, "lessons", f));
  out.push(path.join(A, "lib", "track.js"), path.join(A, "lib", "questions.js"));
  for (const f of fs.readdirSync(P)) if (f.endsWith(".jsx")) out.push(path.join(P, f));
  return out;
}

const PROSE = /<(Body|Sub|Hint|Question|Readout|Note)\b[^>]*>([\s\S]*?)<\/\1>/g;
const PROPS = new RegExp(
  '\\b(headline|title|passBody|passTitle|aside|note|detail|verdict|blurb|description|controlLabel|label|value|text)\\s*[=:]\\s*"([^"]{10,})"',
  "g",
);
const REVEAL = /className=\{styles\.(revealBody|revealHead|sub|headline|hint|question|readout|missBox|passHead)\}>([\s\S]*?)</g;

function sentences() {
  const rows = [];
  for (const f of sourceFiles()) {
    const src = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
    const name = path.relative(SRC, f).replace(/\\/g, "/");
    const chunks = [];
    if (f.endsWith(".mdx")) {
      for (const para of src.split(/\n\n+/)) {
        const t = para.trim();
        if (t && !t.startsWith("import") && !t.startsWith("<") && !t.startsWith(">")) chunks.push(t);
      }
    } else {
      for (const m of src.matchAll(PROSE)) chunks.push(m[2]);
      for (const m of src.matchAll(PROPS)) chunks.push(m[2]);
      for (const m of src.matchAll(REVEAL)) chunks.push(m[2]);
    }
    for (const c of chunks) {
      const clean = c.replace(/<[^>]+>/g, "").replace(/\{"\s*"\}/g, " ").replace(/\s+/g, " ").trim();
      if (clean.length < 12 || clean.startsWith("###")) continue;
      for (const s of clean.split(/(?<=[.?!])\s+(?=[A-Z{])/)) {
        const t = s.trim();
        if (t.length >= 12) rows.push({ file: name, s: t });
      }
    }
  }
  return rows;
}

/* ── Checks ──────────────────────────────────────────────── */

const rows = sentences();
const failures = [];
const review = [];

/** Phrasing Keenan has rejected by name. */
const BANNED = [
  [/\billustrative\b/i, "'illustrative' is a compliance hedge; write 'an example rate'"],
  [/\bprotocol conditions\b/i, "placeholder; name what the strategies earn and how fast redemptions run"],
  [/\blive pace\b/i, "invented; write 'the real rate'"],
  [/\bthe whole list\b/i, "commentary on the lesson's structure, not on Alchemix"],
  [/\b(the point is|that is the point|is the lesson)\b/i, "pre-labelled significance"],
  [/—/, "em dash (the TOV bans them)"],
  [/\b(favour|annualised|towards|optimise|behaviour|recognise)\b/i, "British spelling"],
  // Anti-cheat notices. The learner never asked, and it says nothing about Alchemix.
  [/\bevery learner gets\b/i, "quiz housekeeping the learner did not ask for"],
  // Personification. Alchemix is a technical protocol, not a place where money
  // carries things and collateral stands about. Keenan on "the USDC comes back
  // carrying everything it earned": "very claudish". Note "carries" is fine in
  // its finance sense (a loan carries no interest), so only the loose uses list.
  [/\b(carries|carried|carry) on earning\b/i, "personification; write 'keeps earning'"],
  [/\bstanding behind\b/i, "personification; write 'behind' or 'securing'"],
  [/\bcomes? back carrying\b/i, "personification; write 'is returned along with'"],
  [/\b(fee|cost|charge|payment|repayment)s? lands?\b/i, "personification; write 'is charged' or 'applies'"],
  [/\b(LTV|balance|figure|amount|number)s? climbs?\b/i, "personification; write 'rises'"],
];

/**
 * Stage directions: telling the reader to look at something the page is already
 * showing them, and already drawing their eye to. "so watch both figures on the
 * card" adds no fact; the card is right there and the figures are moving.
 *
 * A gating hint is different and allowed ("Move both controls to continue"),
 * because it tells the reader progress is blocked until they act. The giveaway
 * is the verb of perception, not the verb of action.
 */
const STAGE_DIRECTION = [
  // "notice period" is a noun phrase about the product, not an instruction.
  [/\b(watch|observe|keep an eye on)\b|\bnotice\b(?! period)/i, "stage direction: the page is already showing this"],
  [/\bsee (what|the|it|how) [a-z]/i, "stage direction: says what the reader is about to look at"],
  [/\blook at\b/i, "stage direction"],
];

/**
 * The two mechanisms that keep getting restated wrongly.
 * Redemptions repay debt out of the borrower's own collateral; yield raises the
 * MYT's value instead. The Transmuter is a fixed-yield product, and a borrower
 * who wants out repays and withdraws.
 * See docs/user/concepts/redemption-rate.md, transmuter.md, tutorials/repay-loan.md.
 */
const WRONG_MECHANISM = [
  [/(earnings|yield|what it earns|what your deposit earns)[^.]{0,45}\b(clears?|pays?)\b[^.]{0,25}\b(loan|balance|debt)\b/i,
   "redemptions repay the debt; yield raises the MYT's value"],
  [/\brepays? (it|the loan|the balance) (out of|from) (your|the) position\b/i,
   "name whose capital is spent: redemptions draw on the borrower's own collateral"],
  [/\bTransmuter\b[^.]{0,40}\b(takes|returns) (your|the) (alUSD|alETH)\b[^.]{0,30}\b(back|for USDC|1:1)\b/i,
   "the Transmuter is a fixed-yield product; a borrower repays and withdraws instead"],
];

for (const { file, s } of rows) {
  for (const [re, why] of BANNED) if (re.test(s)) failures.push({ file, s, why });
  for (const [re, why] of WRONG_MECHANISM) if (re.test(s)) failures.push({ file, s, why });
  if (!/\bto continue\b/.test(s)) {
    for (const [re, why] of STAGE_DIRECTION) if (re.test(s)) failures.push({ file, s, why });
  }
}

/**
 * The same point made twice within a few sentences.
 *
 * Compared on a sorted bag of content words, so a restatement in different
 * words collides with the original. Two guards keep this quiet: only within a
 * window of 8 sentences (a repeat across stages is usually deliberate
 * reinforcement), and identical text is allowed (two parallel UI rows saying
 * the same thing about two learners is on purpose).
 */
const STOP = new Set(
  "a an the and or of to in on at is are was were be been it its this that those these you your for with from as so but if then than".split(" "),
);
const key = (s) =>
  s.toLowerCase().replace(/\{[^}]*\}/g, "").replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).sort().join(" ");

const WINDOW = 8;
const byLesson = new Map();
for (const r of rows) {
  const lesson = r.file.replace(/\/index\.jsx$/, "");
  if (!byLesson.has(lesson)) byLesson.set(lesson, []);
  byLesson.get(lesson).push(r);
}
for (const [lesson, rs] of byLesson) {
  for (let i = 0; i < rs.length; i += 1) {
    const k = key(rs[i].s);
    if (k.split(" ").length < 4) continue;
    for (let j = Math.max(0, i - WINDOW); j < i; j += 1) {
      if (rs[j].s === rs[i].s) continue; // identical text: deliberate parallelism
      if (key(rs[j].s) === k) {
        failures.push({ file: lesson, s: rs[i].s, why: `restates "${rs[j].s}"` });
        break;
      }
    }
  }
}

/** Subject slot looks like an abstraction about the lesson. Read these. */
const META_SUBJECT =
  /^(Those|These|That|This|Both|Either|Neither|All|None|Each|One|Two|Three|The rest|The others?|The first|The second)\b[^.?!]{0,45}\b(is|are|was|were|comes?|goes?|means?|counts?|applies|stands?|does|do|have|has)\b/i;

for (const { file, s } of rows) {
  if (s.includes("{")) continue;
  if (META_SUBJECT.test(s)) review.push({ file, s });
}

/* ── Report ──────────────────────────────────────────────── */

const inv = path.join(ROOT, "build", "academy-sentences.txt");
fs.mkdirSync(path.dirname(inv), { recursive: true });
fs.writeFileSync(
  inv,
  rows.map((r, i) => `${String(i + 1).padStart(3)}  ${r.file.padEnd(40).slice(0, 40)}  ${r.s}`).join("\n"),
);

const pad = (f) => f.padEnd(40).slice(0, 40);
console.log(failures.length ? `\nFAILURES (${failures.length})\n` : "\nFAILURES: none");
for (const f of failures) console.log(`  ${pad(f.file)} ${f.why}\n    ${f.s}\n`);

console.log(review.length ? `\nREVIEW (${review.length}) — subject may be the lesson, not Alchemix\n` : "REVIEW: none");
for (const r of review) console.log(`  ${pad(r.file)} ${r.s}`);

console.log(`\n${rows.length} learner-facing sentences. Full inventory: build/academy-sentences.txt`);
console.log(
  "Read it whole. The test per sentence: delete it. If the reader loses no fact\n" +
  "about Alchemix (a mechanism, a number, a name, an action they can take), cut it.\n",
);
process.exit(failures.length ? 1 : 0);
