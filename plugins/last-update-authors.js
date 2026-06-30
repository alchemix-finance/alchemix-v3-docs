/**
 * Build-time plugin: derives a { gitAuthorName -> githubHandle } map from git
 * history and exposes it as global data for the swizzled @theme/LastUpdated.
 *
 * Handles are read from GitHub "noreply" commit emails, which encode the
 * account name as `<id>+<handle>@users.noreply.github.com` (or `<handle>@...`).
 * So new contributors get linked automatically with no code changes, as long
 * as they commit with their GitHub noreply email — GitHub's default for web
 * edits and the standard email-privacy setting.
 *
 * For the rare contributor who only ever commits with a personal email (no
 * derivable handle), add a manual fallback to OVERRIDES below.
 */
const { execSync } = require("child_process");

const NOREPLY = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i;

// gitAuthorName -> githubHandle. Manual fallbacks; these win over detection.
const OVERRIDES = {};

function deriveHandles() {
  let log;
  try {
    // One line per commit: "Author Name<TAB>author@email". Tab-separated so
    // names containing punctuation can't corrupt the split.
    log = execSync("git log --format=%an%x09%ae", {
      encoding: "utf8",
      maxBuffer: 100 * 1024 * 1024,
    });
  } catch (err) {
    console.warn(
      "[last-update-authors] git log unavailable; footer authors will show " +
        "plain names. " +
        err.message
    );
    return {};
  }

  // name -> { handle -> count }, so the most-used handle wins when a single
  // display name has committed under more than one noreply handle.
  const tally = {};
  for (const line of log.split("\n")) {
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    const name = line.slice(0, tab);
    const match = line.slice(tab + 1).match(NOREPLY);
    if (!match) continue;
    const handle = match[1];
    tally[name] = tally[name] || {};
    tally[name][handle] = (tally[name][handle] || 0) + 1;
  }

  const handles = {};
  for (const [name, counts] of Object.entries(tally)) {
    handles[name] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
  return { ...handles, ...OVERRIDES };
}

module.exports = function lastUpdateAuthors() {
  return {
    name: "last-update-authors",
    contentLoaded({ actions }) {
      actions.setGlobalData({ handles: deriveHandles() });
    },
  };
};
