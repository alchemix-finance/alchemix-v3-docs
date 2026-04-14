import React, { useState, useCallback } from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";

function getPageMarkdown(): string {
  const article = document.querySelector("article");
  if (!article) return document.title + "\n\n(No content found)";

  const clone = article.cloneNode(true) as HTMLElement;

  // Remove interactive / non-content elements
  clone
    .querySelectorAll("nav, .theme-doc-toc-mobile, .theme-doc-breadcrumbs, .copy-for-llm-btn")
    .forEach((el) => el.remove());

  const lines: string[] = [];

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text.trim()) lines.push(text);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;

    // Headings
    if (/^H[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      lines.push("\n" + "#".repeat(level) + " " + el.textContent?.trim());
      return;
    }

    // Code blocks
    if (tag === "PRE") {
      const code = el.querySelector("code");
      const lang = code?.className?.match(/language-(\w+)/)?.[1] ?? "";
      lines.push("\n```" + lang + "\n" + (code ?? el).textContent?.trim() + "\n```\n");
      return;
    }

    // Inline code
    if (tag === "CODE") {
      lines.push("`" + el.textContent?.trim() + "`");
      return;
    }

    // Tables
    if (tag === "TABLE") {
      const rows = el.querySelectorAll("tr");
      rows.forEach((row, i) => {
        const cells = Array.from(row.querySelectorAll("th, td")).map(
          (c) => c.textContent?.trim() ?? ""
        );
        lines.push("| " + cells.join(" | ") + " |");
        if (i === 0) {
          lines.push("|" + cells.map(() => "---").join("|") + "|");
        }
      });
      lines.push("");
      return;
    }

    // List items
    if (tag === "LI") {
      lines.push("- " + el.textContent?.trim());
      return;
    }

    // Links
    if (tag === "A") {
      const href = el.getAttribute("href") ?? "";
      lines.push("[" + el.textContent?.trim() + "](" + href + ")");
      return;
    }

    // Bold / strong
    if (tag === "STRONG" || tag === "B") {
      lines.push("**" + el.textContent?.trim() + "**");
      return;
    }

    // Blockquotes
    if (tag === "BLOCKQUOTE") {
      const text = el.textContent?.trim() ?? "";
      lines.push(
        "\n" +
          text
            .split("\n")
            .map((l) => "> " + l.trim())
            .join("\n") +
          "\n"
      );
      return;
    }

    // Paragraphs and divs get line breaks
    if (tag === "P" || tag === "DIV") {
      lines.push("");
    }

    // Recurse for everything else
    el.childNodes.forEach(walk);

    if (tag === "P") lines.push("");
  }

  clone.childNodes.forEach(walk);

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function CopyForLLMButton() {
  const isBrowser = useIsBrowser();
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    const title = document.title.replace(/ \|.*$/, "");
    const url = window.location.href;

    const preamble =
      `This is a page from the Alchemix v3 documentation (https://docs.alchemix.fi).\n` +
      `Alchemix is a DeFi protocol that lets users deposit collateral into yield strategies ` +
      `and take out self-repaying loans backed by future yield.\n\n` +
      `Source: ${url}\n\n---\n\n`;

    const content = preamble + "# " + title + "\n\n" + getPageMarkdown();

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  if (!isBrowser) return null;

  return (
    <button
      onClick={handleClick}
      className="button button--primary copy-for-llm-btn"
      title="Copy this page as markdown for use with any LLM model"
    >
      {copied ? "Copied!" : "Copy for LLMs"}
    </button>
  );
}
