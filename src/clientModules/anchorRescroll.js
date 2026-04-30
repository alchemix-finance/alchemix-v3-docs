// Re-scrolls to the hash target after async content (mermaid diagrams,
// lazy-loaded components, images without dimensions) finishes rendering.
//
// Without this, clicking an anchor on a page with mermaid often lands the
// user above their target because mermaid expands the page after scroll.
//
// Strategy: watch the DOM and only re-scroll once mutations have stopped
// for 300ms. This avoids the visible "jumping" that comes from re-scrolling
// on every mutation while content is still rendering.

export function onRouteDidUpdate({ location }) {
  if (typeof window === "undefined" || !location.hash) return;

  const id = decodeURIComponent(location.hash.slice(1));

  function scrollToTarget() {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  let settleTimer;
  let scrolled = false;

  function finalize() {
    if (scrolled) return;
    scrolled = true;
    observer.disconnect();
    clearTimeout(settleTimer);
    clearTimeout(hardTimeout);
    scrollToTarget();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finalize, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Hard timeout: if the page never settles, scroll anyway after 3s.
  const hardTimeout = setTimeout(finalize, 3000);
}
