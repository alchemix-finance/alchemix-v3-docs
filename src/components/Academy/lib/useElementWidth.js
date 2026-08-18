import { useEffect, useRef, useState } from "react";

/**
 * Measure an element's rendered width.
 *
 * The chart needs this because an SVG viewBox scales its whole coordinate system,
 * including text. A fixed 960-unit viewBox rendered into a 335px phone shrinks
 * 11px axis labels to about 4px, which is not small, it is invisible. Sizing the
 * viewBox to the real width keeps one user unit equal to one pixel, so text lands
 * at the size it was written at on any screen.
 *
 * Returns 0 until measured, which is also what server-side rendering sees, so
 * callers must handle a zero width rather than dividing by it.
 */
export default function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();

    // ResizeObserver is in every browser this site targets, but a guard costs
    // nothing and keeps the lesson working rather than blank if it is missing.
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}
