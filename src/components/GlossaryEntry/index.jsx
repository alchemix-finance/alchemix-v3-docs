import React from "react";
import Link from "@docusaurus/Link";
import { getTerm } from "@site/src/data/glossary";

// Renders one glossary entry's body (definition + concept link) from the shared
// glossary data. The heading above it stays in the Markdown source so the
// right-rail table of contents and the #anchor are generated normally.
export default function GlossaryEntry({ id }) {
  const term = getTerm(id);
  if (!term) return null;

  return (
    <>
      <p>{term.definition}</p>
      <p>
        <Link to={term.href}>{term.linkLabel} →</Link>
      </p>
    </>
  );
}
