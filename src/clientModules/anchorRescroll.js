// Re-scrolls to the hash target once mermaid diagrams finish rendering.
//
// Without this, clicking an anchor on a page with mermaid lands the user
// above their target because mermaid expands the page after the initial
// browser scroll.
//
// Strategy: poll for SVGs inside every .docusaurus-mermaid-container.
// Once they're all present (or we hit a 5s timeout), do a single scroll
// to the hash target. We deliberately ignore other DOM mutations so we
// don't fight with React hydration or other unrelated layout activity.

export function onRouteDidUpdate({ location }) {
  if (typeof window === "undefined" || !location.hash) return;

  const id = decodeURIComponent(location.hash.slice(1));

  function scrollToTarget() {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "auto" });
  }

  function allMermaidRendered() {
    const containers = document.querySelectorAll(
      ".docusaurus-mermaid-container"
    );
    if (containers.length === 0) return true;
    return Array.from(containers).every((c) => c.querySelector("svg"));
  }

  // No mermaid on this page (or it's already rendered). Docusaurus's own
  // anchor scroll is sufficient — do nothing.
  if (allMermaidRendered()) return;

  const start = Date.now();
  const interval = setInterval(() => {
    if (allMermaidRendered() || Date.now() - start > 5000) {
      clearInterval(interval);
      scrollToTarget();
    }
  }, 100);
}
