/**
 * Academy copy check.
 *
 * One class of tone defect keeps coming back, and no grep
 * can catch it, because the defect is semantic: a
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
 * Job 3 is the real one. Bad sentences ship when nobody reads all of them
 * in one sitting and a pass fixes only the known examples
 * and whatever is greppable. The inventory makes the full read the cheap
 * default. It is ~500 sentences, about fifteen minutes.
 *
 * The test to apply to each: delete it. If the reader loses no fact about
 * Alchemix (a mechanism, a number, a name, an action they can take), cut it.
 *
 * Run:  pnpm copy:check
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const A = path.join(SRC, "components", "Academy");
const P = path.join(SRC, "pages", "academy");

/* ── Collect every learner-facing string ─────────────────── */

/**
 * The component folders no live page uses. The old
 * intermediate labs (LtvLab, RateLab, StrategyLab, SizingLab, DiscountLab,
 * LoanCostLab, PositionLab, and the Intermediate parts only they import)
 * stayed in the inventory after the track moved to the article lessons, and
 * their 280-odd sentences buried the live ones in the REVIEW list. A folder
 * is left out when nothing outside the left-out folders imports it, worked
 * out from the imports on each run, so a lab that comes back into use comes
 * back into the inventory.
 */
function unusedFolders() {
  const dirs = fs
    .readdirSync(A, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(A, d.name, "index.jsx")))
    .map((d) => d.name);
  const files = [];
  const walk = (dir) => {
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, d.name);
      if (d.isDirectory()) walk(f);
      else if (/\.(jsx?|mdx|tsx?)$/.test(d.name)) files.push(f);
    }
  };
  walk(SRC);
  const folderOf = (f) => {
    const rel = path.relative(A, f).split(path.sep);
    return rel.length > 1 && rel[0] !== ".." ? rel[0] : null;
  };
  const importers = new Map(dirs.map((d) => [d, []]));
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    for (const d of dirs) {
      if (folderOf(f) === d) continue;
      if (new RegExp(`from\\s+["'][^"']*/${d}(/[^"']*)?["']`).test(src)) importers.get(d).push(f);
    }
  }
  const unused = new Set();
  for (let changed = true; changed; ) {
    changed = false;
    for (const d of dirs) {
      if (unused.has(d)) continue;
      if (importers.get(d).every((f) => unused.has(folderOf(f)))) {
        unused.add(d);
        changed = true;
      }
    }
  }
  return unused;
}
const UNUSED = unusedFolders();

function sourceFiles() {
  const out = [];
  for (const d of fs.readdirSync(A, { withFileTypes: true })) {
    if (!d.isDirectory() || UNUSED.has(d.name)) continue;
    const f = path.join(A, d.name, "index.jsx");
    if (fs.existsSync(f)) out.push(f);
  }
  // The lesson MDX, with the intermediate track's in lessons/intermediate/
  // since the 2026-11 rebuild.
  for (const d of fs.readdirSync(path.join(A, "lessons"), { withFileTypes: true })) {
    const f = path.join(A, "lessons", d.name);
    if (d.isFile()) out.push(f);
    else if (d.isDirectory()) for (const g of fs.readdirSync(f)) if (g.endsWith(".mdx")) out.push(path.join(f, g));
  }
  // questions.js and terms.js are read through the module instead: see
  // bankRows and termRows below.
  out.push(path.join(A, "lib", "track.js"));
  // The article lessons' practice elements (see momentChunks).
  for (const f of fs.readdirSync(path.join(A, "ArticleLesson"))) {
    if (/^moments.*\.jsx$/.test(f)) out.push(path.join(A, "ArticleLesson", f));
  }
  for (const f of fs.readdirSync(P)) if (f.endsWith(".jsx")) out.push(path.join(P, f));
  return out;
}

const PROSE = /<(Body|Sub|Hint|Question|Readout|Note)\b[^>]*>([\s\S]*?)<\/\1>/g;
/* `nextLabel`, the home page's track intros (`beginner`, `intermediate`), the
   claim panel's `body` and `message`, and the preview banner and home page
   paragraphs in REVEAL were added 2026-10-15. A full read of the inventory
   missed "Push it to the cap" (a nextLabel) and a points line in the preview
   banner, because neither was in it. */
const PROPS = new RegExp(
  '\\b(headline|title|passBody|passTitle|aside|hint|note|detail|verdict|blurb|description|controlLabel|label|value|text|nextLabel|beginner|intermediate|body|message)\\s*[=:]\\s*"([^"]{10,})"',
  "g",
);
const REVEAL = /className=\{styles\.(revealBody|revealHead|sub|headline|hint|question|readout|missBox|passHead|previewText|previewTitle|previewFootText|rewardBody|rewardNote|rewardTitle|progressNoteText|graduateBody|resetWarn)\}>([\s\S]*?)</g;

/**
 * The article lessons' practice elements. Their labels,
 * captions, change chips, result lines and footer hints are written in
 * `ArticleLesson/moments*.jsx` as JSX text and plain strings, which the
 * patterns above never see: a
 * misleading chip ("Paid to borrow") sat in a file this check could not read.
 * Comments are dropped, then every string literal of two words or more (a
 * template's `${...}` read as {x}) and every run of JSX text is taken, less
 * class names, aria labels, keys and other strings no reader sees.
 */
const NOT_SHOWN =
  /\b(className|aria-label|aria|key|id|role|type|href|to|src|d|viewBox|fill|stroke|moment|tone|kind|name|stat|icon|asset|token|unit|tab|variant|mode)\s*[=:]\s*\{?\s*$/;
const LOOKS_LIKE_CODE = /calc\(|var\(--|rgba?\(|oklch\(|hsla?\(|translate[XY]?\(|rotate\(|[\d}](px|rem|em|ms|vw|vh)\b|=>|&&|\|\||===|^[a-z][\w-]*( [a-z][\w-]*)*$|^[\w.-]+\.(css|svg|png|js|jsx)$/;

/** A JS source's string literals, in order, and the source with each one replaced by "S<n>". Comments dropped. */
function scanJs(src) {
  const strings = [];
  let code = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/" && src[i - 1] !== ":") {
      while (i < n && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && d === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let text = "";
      while (j < n) {
        const e = src[j];
        if (e === "\\") {
          text += src[j + 1];
          j += 2;
          continue;
        }
        if (c === "`" && e === "$" && src[j + 1] === "{") {
          let depth = 1;
          j += 2;
          while (j < n && depth) {
            if (src[j] === "{") depth += 1;
            else if (src[j] === "}") depth -= 1;
            j += 1;
          }
          text += "{x}";
          continue;
        }
        if (e === c) break;
        // An apostrophe in JSX text ("the app's") opens no string: a quoted
        // string never runs past the end of its line.
        if (c !== "`" && e === "\n") break;
        text += e;
        j += 1;
      }
      if (src[j] === c) {
        strings.push({ text, before: code.slice(-40) });
        code += `"S${strings.length - 1}"`;
        i = j + 1;
        continue;
      }
    }
    code += c;
    i += 1;
  }
  return { code, strings };
}

function momentChunks(src) {
  const { code, strings } = scanJs(src);
  const out = [];
  for (const { text, before } of strings) {
    const t = text.replace(/\s+/g, " ").trim();
    if (!/[A-Za-z]/.test(t) || !/\s/.test(t) || NOT_SHOWN.test(before) || LOOKS_LIKE_CODE.test(t)) continue;
    out.push(t);
  }
  // JSX text: what sits between a tag's ">" and the next "<". An arrow's or a
  // comparison's ">" is not a tag's: a tag's follows a word, a quote, a brace
  // or a slash with no space, or stands first on its line.
  const str = (k) => strings[Number(k)].text;
  for (const m of code.matchAll(/>([^<>]*)</g)) {
    const at = m.index;
    const prev = code[at - 1] ?? "";
    if (prev === "=" || prev === "-") continue;
    const line = code.slice(code.lastIndexOf("\n", at - 1) + 1, at);
    if (/\s/.test(prev) && line.trim() !== "") continue;
    let body = m[1];
    if (!/[A-Za-z]{2}/.test(body.replace(/"S\d+"/g, ""))) continue;
    // {expressions} in the text read as {x}; a string alone in one ({" "}) reads as itself.
    for (let k = 0; k < 4; k += 1) body = body.replace(/\{\s*"S(\d+)"\s*\}/g, (_, q) => str(q)).replace(/\{[^{}]*\}/g, "{x}");
    // What is left of an expression that spans tags ("{done ? (") is code.
    if (/[;={}]|\breturn\b|\bconst\b|"S\d+"|^\s*[:)?]/.test(body.replace(/\{x\}/g, ""))) continue;
    const t = body.replace(/\s+/g, " ").trim();
    if (/[A-Za-z]{2}/.test(t)) out.push(t);
  }
  return out;
}

function sentences() {
  const rows = [];
  for (const f of sourceFiles()) {
    const src = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
    const name = path.relative(SRC, f).replace(/\\/g, "/");
    const chunks = [];
    if (f.endsWith(".mdx")) {
      for (const para of src.split(/\n\n+/)) {
        const t = para.trim();
        // A paragraph led by a tag is read too, with the tags stripped below:
        // the article lessons put captions inside <Shot>, and a
        // bare component such as <DepositMoment /> cleans to nothing.
        if (t && !t.startsWith("import") && !t.startsWith(">")) chunks.push(t);
      }
    } else if (/[\\/]ArticleLesson[\\/]moments[^\\/]*\.jsx$/.test(f)) {
      chunks.push(...momentChunks(src));
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

/**
 * The multiple-choice banks.
 *
 * Around 250 sentences of learner-facing copy that neither extractor above can
 * see: a bank entry is a `prompt:` plus two arrays of bare strings, with no tag
 * and no prop name on any item. So the whole of both question banks shipped
 * unchecked, which is exactly the kind of blind spot this script exists to close.
 *
 * Read through the module rather than by regex, so a change to how a bank is
 * written cannot quietly drop it back out of the inventory.
 */
async function bankRows() {
  const file = path.join(A, "lib", "questions.js");
  const { QUESTIONS } = await import(url.pathToFileURL(file).href);
  const name = path.relative(SRC, file).replace(/\\/g, "/");
  const out = [];
  for (const [lessonId, bank] of Object.entries(QUESTIONS)) {
    for (const q of bank) {
      for (const text of [q.prompt, ...q.options, ...q.explain]) {
        for (const s of String(text).split(/(?<=[.?!])\s+(?=[A-Z])/)) {
          const t = s.trim();
          if (t.length >= 12) out.push({ file: name, s: t, lesson: lessonId });
        }
      }
    }
  }
  return out;
}

/**
 * The popovers: every `Term` definition in
 * lib/terms.js, read through the module as the banks are. One held a wrong
 * fact (the Guardian as a multisig), and
 * none had ever been checked.
 */
async function termRows() {
  const file = path.join(A, "lib", "terms.js");
  const { TERMS } = await import(url.pathToFileURL(file).href);
  const name = path.relative(SRC, file).replace(/\\/g, "/");
  const out = [];
  for (const [id, entry] of Object.entries(TERMS)) {
    for (const s of String(entry.text).replace(/\s+/g, " ").split(/(?<=[.?!])\s+(?=[A-Z])/)) {
      const t = s.trim();
      if (t.length >= 12) out.push({ file: name, s: t, term: id });
    }
  }
  return out;
}

/* ── Checks ──────────────────────────────────────────────── */

const rows = [...sentences(), ...(await bankRows()), ...(await termRows())];
const failures = [];
const review = [];

/** Phrasing rejected by name. */
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
  // carries things and collateral stands about ("the USDC comes back
  // carrying everything it earned"). Note "carries" is fine in
  // its finance sense (a loan carries no interest), so only the loose uses list.
  [/\b(carries|carried|carry) on earning\b/i, "personification; write 'keeps earning'"],
  [/\b(standing|stands|stood) behind\b/i, "personification; write 'behind' or 'securing'"],
  [/\bcomes? back carrying\b/i, "personification; write 'is returned along with'"],
  [/\b(fee|cost|charge|payment|repayment)s? lands?\b/i, "personification; write 'is charged' or 'applies'"],
  [/\b(LTV|balance|figure|amount|number)s? climbs?\b/i, "personification; write 'rises'"],
];

/**
 * Personification as a CLASS, not a word list.
 *
 * A word list covers "carrying", "standing", "lands" and "climbs" and leaves
 * the rule unwritten, so "The beginner track walks the same position through all
 * of it" passed it. A track cannot walk.
 *
 * The test: an inanimate subject (a track, a lesson, a rate, a cap, a card, a
 * cost) paired with a verb that needs a will behind it. People and governing
 * bodies are exempt, so is market language where trading is the actor, and so
 * are UI elements that literally move on screen.
 */
const INANIMATE =
  "track|tracks|lesson|lessons|tutorial|tutorials|rate|cap|caps|ceiling|ceilings|loan|cost|costs|discount|card|number|numbers|check|checks|composition|fee|balance|position|price|figure|chart|bar|app|page|" +
  "quick start|guide|guides|docs|documentation|article|articles|section|sections|screen|screens|" +
  "slider|sliders|control|controls|panel|panels|queue|vault|vaults|strategy|strategies|protocol|" +
  "marker|markers|note|notes|graph|graphs|curve|curves";
const VOLITIONAL =
  "walks?|walking|works? through|worked through|wants?|likes?|says?|tells?|decides?|chooses?|refuses?|forbids?|protects?|guards?|holds? back|feels?|knows?|waits?|leans?|steers?|hunts?|chases?|thinks?|prefers?|tries|remembers?";
/**
 * A noun inside a prepositional phrase is not the subject of the verb after it.
 * "Everyone in the queue waits the same set duration" is people waiting, not a
 * queue waiting, and the first draft of this rule flagged it.
 */
const OBLIQUE = "in|on|at|of|from|to|with|inside|through|into|across|behind|under|over|within|among";
const PERSONIFIED = new RegExp(
  `(?<!\\b(?:${OBLIQUE})\\s(?:the|a|an|your|its|their|this|that|every|each)\\s)\\b(${INANIMATE})\\s+(${VOLITIONAL})\\b`,
  "i",
);

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
 * The mechanisms that keep getting restated wrongly.
 * Redemptions repay debt out of the borrower's own collateral; yield raises the
 * MYT's value instead. The Transmuter is a fixed-yield product, and a borrower
 * who wants out repays and withdraws.
 * Nobody sets the redemption rate: it is worked out from the Transmuter queue,
 * the term and the total debt, and two graded questions taught otherwise until
 * 2026-09-23. Earmarking accrues as Transmuter deposits vest block by block;
 * there are no redemption cycles.
 * See docs/user/concepts/redemption-rate.md, transmuter.md, tutorials/repay-loan.md.
 */
const WRONG_MECHANISM = [
  [/(earnings|yield|what it earns|what your deposit earns)[^.]{0,45}\b(clears?|pays?)\b[^.]{0,25}\b(loan|balance|debt)\b/i,
   "redemptions repay the debt; yield raises the MYT's value"],
  [/\brepays? (it|the loan|the balance) (out of|from) (your|the) position\b/i,
   "name whose capital is spent: redemptions draw on the borrower's own collateral"],
  [/\bTransmuter\b[^.]{0,40}\b(takes|returns) (your|the) (alUSD|alETH)\b[^.]{0,30}\b(back|for USDC|1:1)\b/i,
   "the Transmuter is a fixed-yield product; a borrower repays and withdraws instead"],
  [/\b(protocol|DAO|governance)\b[^.]{0,30}\b(sets|raises|lowers|picks|chooses)\b[^.]{0,20}\bredemption rate\b|\bredemption rate\b[^.]{0,40}\b(parameter|the protocol sets|set by the (protocol|DAO))\b/i,
   "nobody sets the redemption rate: it comes from the Transmuter queue, the term and the total debt"],
  [/\b(redemption|earmark(ing)?)s? cycles?\b|\bcycles? (begins?|starts?|is under way)\b|\bin cycles\b/i,
   "earmarking accrues as Transmuter deposits vest; there are no redemption cycles"],
];

for (const { file, s } of rows) {
  for (const [re, why] of BANNED) if (re.test(s)) failures.push({ file, s, why });
  for (const [re, why] of WRONG_MECHANISM) if (re.test(s)) failures.push({ file, s, why });
  const person = s.match(PERSONIFIED);
  if (person) failures.push({ file, s, why: `personification: a ${person[1]} cannot "${person[2]}"` });
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
// Thousands separators are dropped first, so "Debt 2,000" and "Debt 5,000"
// keep their numbers apart. Split on the comma, both read "000" and two
// different sums in the beginner bank collided.
const key = (s) =>
  s.toLowerCase().replace(/\{[^}]*\}/g, "").replace(/(\d),(?=\d{3})/g, "$1").replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).sort().join(" ");

const WINDOW = 8;
const PRESS = /^(then )?press\b/i;
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
      // Two screens that use the same button each say to press it ("Press MAX
      // on the Withdraw tab." and "Then press MAX on the Withdraw tab.",
      // intermediate lesson 2). An instruction is not a point made twice.
      if (PRESS.test(rs[j].s) && PRESS.test(rs[i].s)) continue;
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
  // A footer note on a typed amount ("That is more than your wallet holds")
  // is about the amount, not the lesson.
  if (/^That is more than\b/.test(s)) continue;
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

console.log(review.length ? `\nREVIEW (${review.length}): subject may be the lesson, not Alchemix\n` : "REVIEW: none");
for (const r of review) console.log(`  ${pad(r.file)} ${r.s}`);

console.log(`\n${rows.length} learner-facing sentences. Full inventory: build/academy-sentences.txt`);
if (UNUSED.size) console.log(`Left out, imported by no live page: ${[...UNUSED].sort().join(", ")}.`);
console.log(
  "Read it whole. The test per sentence: delete it. If the reader loses no fact\n" +
  "about Alchemix (a mechanism, a number, a name, an action they can take), cut it.\n",
);
process.exit(failures.length ? 1 : 0);
