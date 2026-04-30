// Re-scrolls to the hash target after async content (mermaid diagrams,
// lazy-loaded components, images without dimensions) finishes rendering.
//
// Without this, clicking an anchor on a page with mermaid often lands the
// user above their target because mermaid expands the page after scroll.

export function onRouteDidUpdate({ location }) {
  if (typeof window === "undefined" || !location.hash) return;

  const id = decodeURIComponent(location.hash.slice(1));

  function scrollToTarget() {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scrollToTarget, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => {
    observer.disconnect();
    clearTimeout(debounceTimer);
  }, 5000);
}
