import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

// A layout effect updates before paint, so a value that follows a slider never
// shows one stale frame. The server has no layout, so it takes the plain effect.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The Academy's motion helpers: enough to show a change as a change, with no
 * library. The app itself tweens nothing on its vault screen; it shows the new
 * value beside the old one with an arrow (`ProjectedValue.tsx`), and the
 * practice vault copies that. A lesson adds movement only where the idea is a
 * cause and its effect, and the end state always teaches on its own, so a
 * learner with reduced motion, or one who looked away, reads the same thing.
 *
 * Three rules every caller keeps:
 * - Movement starts from something the learner did. Nothing plays on load.
 * - A tween runs only when the `play` token changes. A value that follows a
 *   slider jumps with the slider, so a drag never lags behind the hand.
 * - The server render, and every render under `prefers-reduced-motion`, is the
 *   end state.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.("change", onChange);
  return () => mq.removeEventListener?.("change", onChange);
}

/** True when the reader asked for less motion. The server snapshot is true, so no movement is ever rendered there. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(QUERY).matches : false),
    () => true,
  );
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/**
 * The value to show for `value`. When `play` changes, it eases from what was on
 * screen to the new value over `ms`; otherwise it is `value` itself. Values that
 * are not finite (an infinite health factor) jump.
 */
export function useTween(value, play, ms = 700) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  const lastPlay = useRef(play);
  const frame = useRef(0);

  useIsoLayoutEffect(() => {
    const animate = play !== lastPlay.current;
    lastPlay.current = play;
    cancelAnimationFrame(frame.current);
    const from = shownRef.current;
    if (!animate || reduced || !Number.isFinite(from) || !Number.isFinite(value) || from === value) {
      shownRef.current = value;
      setShown(value);
      return undefined;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / ms, 1);
      const v = from + (value - from) * easeOut(t);
      shownRef.current = t >= 1 ? value : v;
      setShown(shownRef.current);
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [value, play, reduced, ms]);

  return shown;
}

/**
 * The "before" a lab keeps for one action. Call `mark(state)` just before the
 * action changes the numbers; pass `before` as `prev` to AppStats and AppBar.
 * `clear()` removes the trace (a new amount typed, a tab changed, Start over).
 *
 *   const [before, mark, clear] = useBefore();
 *   const borrow = () => { mark({ deposit, debt }); setDebt(debt + amount); };
 */
export function useBefore() {
  const [before, setBefore] = useState(null);
  const mark = useCallback((state) => setBefore({ ...state }), []);
  const clear = useCallback(() => setBefore(null), []);
  return [before, mark, clear];
}
