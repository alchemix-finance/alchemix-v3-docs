#!/usr/bin/env node
/**
 * Regenerates static/llms-full.txt from the markdown sources in docs/.
 *
 * Usage:  node scripts/generate-llms-full.js
 *
 * Scope: the user and projects sections (the completed, user-facing docs).
 * Dev and governance sections are still being written; add their dirs to
 * SECTIONS below once their content is final.
 *
 * The script strips Docusaurus-specific syntax (frontmatter, imports, JSX
 * components) so the output is plain markdown an LLM can ingest, and inlines
 * glossary definitions where the page uses <GlossaryEntry/>.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "static", "llms-full.txt");
const SITE = "https://docs.alchemix.fi";

const SECTIONS = [
  { dir: "docs/user", route: "/user", label: "User Documentation" },
  { dir: "docs/projects", route: "/projects", label: "Projects & Integrators" },
];

/* ── Glossary definitions (for <GlossaryEntry id="..."/>) ── */
function loadGlossary() {
  const src = fs.readFileSync(
    path.join(ROOT, "src", "data", "glossary.js"),
    "utf8"
  );
  const terms = {};
  const re =
    /id: "([^"]+)",\s*term: "([^"]+)",\s*definition:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    terms[m[1]] = { term: m[2], definition: m[3] };
  }
  return terms;
}

/* ── Markdown/MDX → plain markdown ── */
function cleanDoc(raw, glossary) {
  // Strip a UTF-8 BOM if present (some source files carry one), then
  // normalize Windows line endings.
  let s = raw.replace(new RegExp("^\\uFEFF"), "").replace(/\r\n/g, "\n");

  // Frontmatter → title
  let title = null;
  s = s.replace(/^---\n([\s\S]*?)\n---\n/, (_, fm) => {
    const t = fm.match(/^title:\s*(.+)$/m);
    if (t) title = t[1].trim().replace(/^["']|["']$/g, "");
    return "";
  });

  // import lines
  s = s.replace(/^import .*$\n?/gm, "");

  // Mermaid init boilerplate (keep the diagram body — it reads fine as text)
  s = s.replace(/%%\{init:[\s\S]*?\}%%\n?/g, "");

  // <PageBanner title="X" /> → drop (title is emitted separately)
  s = s.replace(/<PageBanner[^>]*\/>\n?/g, "");

  // Content-less embeds
  s = s.replace(/<FramedImage[^>]*\/>\n?/g, "");
  s = s.replace(/<VideoEmbed[^>]*\/>\n?/g, "");

  // Live stats placeholder
  s = s.replace(/<AlchemixStat[^>]*\/>/g, "[live figure]");

  // Glossary entries → inline the definition
  s = s.replace(/<GlossaryEntry id="([^"]+)"\s*\/>/g, (_, id) => {
    const t = glossary[id];
    return t ? t.definition : "";
  });

  // <Term id="x">text</Term> → text ; self-closing → the term name
  s = s.replace(/<Term id="[^"]*">([\s\S]*?)<\/Term>/g, "$1");
  s = s.replace(/<Term id="([^"]+)"\s*\/>/g, (_, id) =>
    glossary[id] ? glossary[id].term : id
  );

  // Illustrative React components: note their presence rather than dropping silently
  s = s.replace(
    /<(PositionTimeline|LtvSensitivity|HealthBar|MigrationOverview)[^>]*\/>\n?/g,
    "*(An interactive $1 illustration appears here in the web version.)*\n"
  );

  // FeatureCards / StatStrip: extract the text out of the props
  s = s.replace(/<(FeatureCards|StatStrip)[\s\S]*?\/>/g, (block) => {
    const items = [];
    const pairRe =
      /(?:title|label):\s*"([^"]+)",[\s\S]*?(?:body|value):\s*"([^"]+)"/g;
    let m;
    while ((m = pairRe.exec(block)) !== null) items.push(`- **${m[1]}:** ${m[2]}`);
    return items.join("\n");
  });

  // <details>/<summary> → plain markdown Q&A
  s = s.replace(/<details>\s*/g, "");
  s = s.replace(/<\/details>/g, "");
  s = s.replace(/<summary>\s*([\s\S]*?)\s*<\/summary>/g, (_, q) =>
    `**Q: ${q.replace(/\s+/g, " ").trim()}**\n`
  );

  // Inline style/JSX wrappers that only exist for layout
  s = s.replace(/<style>\{`[\s\S]*?`\}<\/style>\n?/g, "");
  s = s.replace(/<div[^>]*>\n?/g, "");
  s = s.replace(/<\/div>\n?/g, "");
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, "");

  // Collapse leftover blank lines
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return { title, body: s };
}

/* Rewrite relative .md links to absolute site URLs so they work out of context */
function absolutizeLinks(body, pageUrl) {
  return body.replace(/\]\((\.\.?\/[^)#]+?)\.md(#[^)]*)?\)/g, (_, rel, hash) => {
    const resolved = new URL(rel, pageUrl + "/").href;
    return `](${resolved}${hash || ""})`;
  });
}

/* ── Collect files: index.md first, then sidebar_position, then name ── */
function collect(dir) {
  const abs = path.join(ROOT, dir);
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    )) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) files.push(p);
    }
  })(abs);

  const pos = (f) => {
    const m = fs.readFileSync(f, "utf8").match(/^sidebar_position:\s*(\d+)/m);
    return m ? Number(m[1]) : 999;
  };
  return files.sort((a, b) => {
    const ia = path.basename(a) === "index.md" ? 0 : 1;
    const ib = path.basename(b) === "index.md" ? 0 : 1;
    if (ia !== ib) return ia - ib;
    const da = path.dirname(a), db = path.dirname(b);
    if (da !== db) return da.localeCompare(db);
    return pos(a) - pos(b);
  });
}

function routeFor(file, section) {
  const rel = path
    .relative(path.join(ROOT, section.dir), file)
    .replace(/\\/g, "/")
    .replace(/\.md$/, "")
    .replace(/(^|\/)index$/, "");
  return `${SITE}${section.route}${rel ? "/" + rel : ""}`;
}

/* ── Main ── */
const glossary = loadGlossary();
const today = new Date().toISOString().slice(0, 10);

let out = `# Alchemix Documentation — Full Reference

> This file contains the Alchemix V3 user and integrator documentation concatenated for AI consumption.
> Developer and governance sections are still being expanded and are indexed at ${SITE}/llms.txt.
> Source: ${SITE}
> Generated: ${today}
`;

for (const section of SECTIONS) {
  out += `\n\n---\n\n# ${section.label}\n`;
  for (const file of collect(section.dir)) {
    const { title, body } = cleanDoc(fs.readFileSync(file, "utf8"), glossary);
    const name = title || path.basename(file, ".md");
    const url = routeFor(file, section);
    out += `\n\n---\n\n## ${name}\n\nSource: ${url}\n\n${absolutizeLinks(body, url)}\n`;
  }
}

fs.writeFileSync(OUT, out.trim() + "\n");
console.log(
  `Wrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`
);
