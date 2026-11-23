import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { hasCompletion } from "../lib/api";

/**
 * The course's one position, per lesson, in one place.
 *
 * An article lesson shows the position twice: the strip at the top of the
 * page, and the practice vault at each moment where the reader acts. Both
 * read this store, so they cannot disagree. A moment records its change by
 * `apply(id, after)`, which keeps the state just before (for the vault's
 * change chips and the tween) and bumps `play`, the token every tween keys on.
 *
 * Every page has a fixed position. With one position following the whole
 * lesson, going Back after doing a later page showed that later page's
 * numbers. The position on a page is the lesson's `start`,
 * then, page by page up to that page and in page order, each `StripAt` set
 * and each done moment's `after`. The Pager reports each page's markers and
 * moments (`setLayout`), the frame reports the page on screen (`setPage`),
 * and the strip shows the position as of that page. A figure inside a page
 * reads the position as of its own page (`PageContext`), and a moment reads
 * the position just before itself, so going Back to page 1 after page 3
 * shows page 1's state with page 1's moments done.
 *
 * Only which moments are done (with their before and after) is kept, per
 * lesson in localStorage, under a key that names its version and with the
 * lesson's `start` beside it: a save made under another start or an older
 * key is ignored (an old saved earmark once showed 9,999.27 where the lesson
 * says 9,999.48). It is read after mount, never during render: these pages
 * are prerendered, and the first frame is the lesson's starting position.
 * `reset` puts the lesson back to that start. `redo(ids)` puts one page's
 * moments back ("Redo this page" in the footer): only those are no longer
 * done, and the moments remount with their boxes empty. Every step records
 * a fixed change, so the pages after it keep the numbers they had and the
 * reader loses nothing by doing a page twice. `undo(id)` puts the lesson
 * back to just before one moment, with every later one.
 *
 *   position  { wallet, walletAl, walletMyt, deposit, debt, earmarked,
 *             fixedYield } as of the page on screen. `walletAl` is the alUSD
 *             in the wallet; `walletMyt` is the mixUSDC in it (intermediate
 *             I1 only; absent or null elsewhere, and the strip shows it beside
 *             the USDC only while it is above 0); `earmarked` and `fixedYield`
 *             are null until a lesson gives the strip that field (lesson 5
 *             and lesson 8); `deposit` and `debt` are numbers on every
 *             beginner lesson, and null hides them (intermediate I7)
 *   done      { [momentId]: { before, after } }, one entry per finished moment
 *   shown     whether the strip is on the page (lesson 1 reveals it at its end)
 *   entered   true once the reader brought the strip in during this visit,
 *             never from a load, so only that arrival animates
 *   play      bumps on every action, never on a load
 *   moved     bumps on every action and every page the reader turns, for the
 *             strip, whose numbers also change when a page sets them
 *   version   bumps on reset and on undo, so the moments remount with their boxes empty
 *   notes     { [momentId]: text }, what a moment says is wrong right now
 *             ("Pick USDC first"), shown in the footer in place of its hint
 *   actions   { [momentId]: { label, disabled, kind } }, the press a moment
 *             offers for the footer's button while it is the page's next
 *             step (`useFooterAction`); `press(id)` calls it
 */

const KEY = (lessonId) => `alchemix-academy-position-v2:${lessonId}`;

const PositionContext = createContext(null);

/** The page a block sits on (1, 2, ...), set by the Pager around each page. */
export const PageContext = createContext(null);

function initial({ hidden }) {
  return { done: {}, shown: !hidden, entered: false, play: 0, moved: 0, version: 0 };
}

function reducer(state, action) {
  switch (action.type) {
    case "load":
      return { ...state, done: action.saved.done, shown: state.shown || action.saved.shown };
    case "apply":
      if (state.done[action.id]) return state;
      return {
        ...state,
        done: { ...state.done, [action.id]: { before: { ...action.before }, after: { ...action.after } } },
        play: state.play + 1,
        moved: state.moved + 1,
      };
    case "turn":
      return { ...state, moved: state.moved + 1 };
    case "reveal":
      return state.shown ? state : { ...state, shown: true, entered: true };
    case "undo": {
      const from = action.moments.indexOf(action.id);
      if (from < 0) return state;
      const drop = new Set(action.moments.slice(from));
      if (!Object.keys(state.done).some((m) => drop.has(m))) return state;
      const done = Object.fromEntries(Object.entries(state.done).filter(([m]) => !drop.has(m)));
      return { ...state, done, moved: state.moved + 1, version: state.version + 1 };
    }
    case "redo": {
      const drop = new Set(action.ids);
      if (!Object.keys(state.done).some((m) => drop.has(m))) return state;
      const done = Object.fromEntries(Object.entries(state.done).filter(([m]) => !drop.has(m)));
      return { ...state, done, moved: state.moved + 1, version: state.version + 1 };
    }
    case "reset":
      return { ...initial(action), play: state.play + 1, moved: state.moved + 1, version: state.version + 1 };
    default:
      return state;
  }
}

function read(lessonId, start) {
  try {
    const raw = window.localStorage.getItem(KEY(lessonId));
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !saved.done || typeof saved.done !== "object") return null;
    if (saved.start !== JSON.stringify(start)) return null;
    return { done: saved.done, shown: Boolean(saved.shown) };
  } catch {
    return null;
  }
}

function write(lessonId, start, state) {
  try {
    const { done, shown } = state;
    window.localStorage.setItem(KEY(lessonId), JSON.stringify({ start: JSON.stringify(start), done, shown }));
  } catch {
    // Private browsing or a full quota: the lesson still works, it just will not survive a reload.
  }
}

/* Whether the lesson on screen is the page the browser loaded by a reload or
   by Back, the first time it is asked. Every lesson opened after that was
   come to from another page of the site. */
let firstLesson = true;

function reloaded() {
  const first = firstLesson;
  firstLesson = false;
  if (!first) return false;
  try {
    const nav = window.performance.getEntriesByType("navigation")[0];
    return Boolean(nav) && (nav.type === "reload" || nav.type === "back_forward");
  } catch {
    return false;
  }
}

function forget(lessonId) {
  try {
    window.localStorage.removeItem(KEY(lessonId));
  } catch {
    /* as above */
  }
}

/**
 * The position after the events of pages 1 to `upto`, or, with `stop`, just
 * before that moment. `layout` is one list per page of `{ moment }` and
 * `{ strip, set }` events in page order; before the Pager has reported it,
 * the lesson's moments in order stand in for it.
 */
function fold(start, layout, momentIds, done, upto, stop = null) {
  const pages = layout ?? [momentIds.map((id) => ({ moment: id }))];
  let p = { ...start };
  for (let i = 0; i < pages.length && (stop != null || i < upto); i++) {
    for (const ev of pages[i]) {
      if (ev.moment != null) {
        if (ev.moment === stop) return p;
        if (done[ev.moment]) p = { ...done[ev.moment].after };
      } else if (ev.set) {
        p = { ...p, ...ev.set };
      }
    }
  }
  return p;
}

/**
 * `start` is the lesson's opening position, `hidden` keeps the strip off the
 * page until a `StripAppears` marker is reached, and `moments` lists the
 * lesson's moment ids in page order: a moment opens once every one before it
 * is done.
 */
export function PositionProvider({ lessonId, start, hidden = false, moments = [], children }) {
  const [state, dispatch] = useReducer(reducer, { hidden }, initial);
  const [layout, setLayoutState] = useState(null);
  const [page, setPageState] = useState(1);
  const [notes, setNotes] = useState({});

  // Restore after mount. `loaded` is not kept in state: writing before the
  // read would wipe what the reader saved, so the first write waits for it.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // A lesson the reader has passed opens as it did the first time, with
    // nothing done, whenever they come to it (from the map, from another
    // lesson, from a link). Its completion is kept apart from this
    // (lib/api), so nothing is lost. Restored, the lesson came back with
    // every step done and every part folded, a page of ticked lines. An
    // unfinished lesson is restored where the reader left it, and so is any
    // lesson when the page is reloaded.
    let saved = null;
    if (hasCompletion(lessonId) && !reloaded()) forget(lessonId);
    else saved = read(lessonId, start);
    if (saved) dispatch({ type: "load", saved });
    setLoaded(true);
    // `start` is a constant of the lesson's page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (loaded) write(lessonId, start, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, lessonId, state.done, state.shown]);

  const layoutKey = JSON.stringify(layout);
  const setLayout = useCallback((next) => {
    setLayoutState((cur) => (JSON.stringify(cur) === JSON.stringify(next) ? cur : next));
  }, []);
  // `turned` is true when the reader turned the page (Next, Back), so the
  // strip tweens to the new page's numbers; a reload's page restore does not.
  const setPage = useCallback((n, turned = false) => {
    setPageState(n);
    if (turned) dispatch({ type: "turn" });
  }, []);
  const note = useCallback((id, text) => {
    setNotes((cur) => ((cur[id] ?? null) === (text ?? null) ? cur : { ...cur, [id]: text ?? null }));
  }, []);
  // What each moment offers the footer's button. The handlers are kept out
  // of state (they are new on every render of the moment that offers them).
  const [actions, setActions] = useState({});
  const handlers = useRef({});
  const offer = useCallback((id, action) => {
    if (action) handlers.current[id] = action.onPress;
    else delete handlers.current[id];
    const next = action ? { label: action.label, disabled: Boolean(action.disabled), kind: action.kind ?? "step" } : null;
    setActions((cur) => {
      const was = cur[id] ?? null;
      if (JSON.stringify(was) === JSON.stringify(next)) return cur;
      const out = { ...cur };
      if (next) out[id] = next;
      else delete out[id];
      return out;
    });
  }, []);
  const press = useCallback((id) => {
    const run = handlers.current[id];
    if (run) run();
  }, []);

  const positionAt = useCallback(
    (n) => fold(start, layout, moments, state.done, n),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start, layoutKey, moments, state.done],
  );
  const positionBefore = useCallback(
    (id) => fold(start, layout, moments, state.done, Infinity, id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start, layoutKey, moments, state.done],
  );
  const position = useMemo(() => positionAt(page), [positionAt, page]);

  const apply = useCallback((id, after, before) => dispatch({ type: "apply", id, after, before: before ?? positionBefore(id) }), [positionBefore]);
  const reveal = useCallback(() => dispatch({ type: "reveal" }), []);
  const undo = useCallback((id) => dispatch({ type: "undo", id, moments }), [moments]);
  const redo = useCallback((ids) => dispatch({ type: "redo", ids }), []);
  const reset = useCallback(() => {
    forget(lessonId);
    setNotes({});
    dispatch({ type: "reset", hidden });
  }, [lessonId, hidden]);

  const value = useMemo(
    () => ({
      ...state,
      // Whether the saved steps have been read (after mount).
      loaded,
      position,
      positionAt,
      positionBefore,
      page,
      moments,
      notes,
      note,
      actions,
      offer,
      press,
      apply,
      reveal,
      undo,
      redo,
      reset,
      setLayout,
      setPage,
      started: Object.keys(state.done).length > 0,
    }),
    [state, loaded, position, positionAt, positionBefore, page, moments, notes, note, actions, offer, press, apply, reveal, undo, redo, reset, setLayout, setPage],
  );
  return <PositionContext.Provider value={value}>{children}</PositionContext.Provider>;
}

/**
 * The store. Inside a page of the lesson, `position` is the position as of
 * that page; outside one (the strip), as of the page on screen.
 */
export function usePosition() {
  const ctx = useContext(PositionContext);
  const own = useContext(PageContext);
  if (!ctx) throw new Error("usePosition needs a PositionProvider (ArticleLesson sets one)");
  const position = useMemo(() => (own != null && own !== ctx.page ? ctx.positionAt(own) : ctx.position), [ctx, own]);
  return position === ctx.position ? ctx : { ...ctx, position };
}

/**
 * One moment's view of the store: whether it is done (with the state before
 * and after it), whether it is open (every earlier moment done), the position
 * just before it, and `apply` bound to its id.
 */
export function useMoment(id) {
  const ctx = useContext(PositionContext);
  if (!ctx) throw new Error("useMoment needs a PositionProvider (ArticleLesson sets one)");
  const index = ctx.moments.indexOf(id);
  const ready = ctx.moments.slice(0, Math.max(index, 0)).every((m) => ctx.done[m]);
  const record = ctx.done[id] ?? null;
  const position = useMemo(() => ctx.positionBefore(id), [ctx, id]);
  return {
    done: Boolean(record),
    before: record ? record.before : null,
    after: record ? record.after : null,
    ready: ready && !record,
    position,
    // `before` replaces the position just before the moment as the state the
    // change is drawn from, for a moment set on another day (lesson 8's early claim).
    apply: (after, before) => ctx.apply(id, after, before ?? position),
  };
}

/**
 * What a moment says is wrong with what the reader has done so far ("Pick
 * USDC first", "That is more than your wallet holds"), for the footer to show
 * beside Next in place of the moment's hint while it is not done. Null when
 * nothing is wrong. The practice element itself does not print it (a line
 * in the element is read before the text that explains it).
 */
export function useMomentNote(id, text) {
  const ctx = useContext(PositionContext);
  const note = ctx?.note;
  useEffect(() => {
    if (!note) return undefined;
    note(id, text ?? null);
    return undefined;
  }, [note, id, text]);
  useEffect(() => () => note && note(id, null), [note, id]);
}

/**
 * A press that belongs to the lesson, not to the app: Continue at the end of
 * a part that is read, a lesson control ("Skip ahead a year"), the next step
 * of a sequence, the next page of lesson 1's tour. While `id` is the first
 * step not done on the page on screen, the footer's one button carries
 * `label` and calls `onPress`; once the page's steps are done the button is
 * Next again. So everything that moves a lesson on is pressed in one place.
 * Under the practice element or at the end of the text, the button sat
 * somewhere else on every page.
 *
 *   useFooterAction("year", done ? null : { label: "Skip ahead a year", onPress: run, disabled: !ready });
 *
 * `kind` picks the button's icon: "read" (Continue), "step" (a lesson
 * control, the default), "next" (on to another part of an element).
 */
export function useFooterAction(id, action) {
  const ctx = useContext(PositionContext);
  const offer = ctx?.offer;
  const label = action ? action.label : null;
  const disabled = action ? Boolean(action.disabled) : false;
  const kind = action ? action.kind ?? "step" : null;
  const latest = useRef(action);
  latest.current = action;
  useEffect(() => {
    if (!offer) return undefined;
    offer(id, label == null ? null : { label, disabled, kind, onPress: () => latest.current && latest.current.onPress && latest.current.onPress() });
    return undefined;
  }, [offer, id, label, disabled, kind]);
  useEffect(() => () => offer && offer(id, null), [offer, id]);
}
