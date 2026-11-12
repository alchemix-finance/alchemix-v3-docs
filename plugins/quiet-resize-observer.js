/**
 * Dev-only plugin: keeps the dev server's full-screen error overlay from
 * opening on Chrome's "ResizeObserver loop completed with undelivered
 * notifications".
 *
 * That message is not a crash. When a size change made during one round of
 * ResizeObserver callbacks moves an element further up the page, Chrome
 * delivers that element's new size on the next frame and reports the delay as
 * an error event. The Academy's practice vault animates its height and its
 * charts measure their width, so on some frames a real browser hits it. A
 * production build has no overlay and nothing shows; under `docusaurus start`
 * the overlay covered the lesson.
 *
 * The listener has to be on window before webpack-dev-server's own: on window,
 * Chrome runs error listeners in the order they were added, capture or not,
 * so a client module (loaded after the dev client) is too late. A script in
 * <head> runs before any bundle. Only this one message is stopped; every other
 * runtime error still opens the overlay.
 */
module.exports = function quietResizeObserver() {
  return {
    name: "quiet-resize-observer",
    injectHtmlTags() {
      if (process.env.NODE_ENV !== "development") return {};
      return {
        headTags: [
          {
            tagName: "script",
            innerHTML:
              'window.addEventListener("error",function(e){if(/^ResizeObserver loop/.test(e.message||""))e.stopImmediatePropagation();});',
          },
        ],
      };
    },
  };
};
