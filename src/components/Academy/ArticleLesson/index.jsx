import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import AcademyShell from "../Shell";
import TrackClosed from "../TrackClosed";
import { PreviewBanner, PreviewFooter } from "../LessonPage";
import lp from "../LessonPage/styles.module.css";
import ls from "../lesson.module.css";
import { AppShot, Arrow, ChoiceCheckpoint, LessonProvider, SHOTS } from "../kit";
import { useReducedMotion } from "../AppMock/motion";
import { AppContextProvider, isWhole, useAppContext, useWash } from "../AppMock";
import { apiBase, hasCompletion, readCompletions, reportEvent } from "../lib/api";
import { currentLesson, lessonById, nextLesson, trackByKey } from "../lib/track";
import { PageContext, PositionProvider, useFooterAction, useMoment, usePosition } from "./position";
import { cueOf, labelFor, useCues } from "./cue";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./styles.module.css";

export { usePosition, useMoment, useMomentNote, useFooterAction } from "./position";

// A layout effect where there is a layout, so the strip changes with the page
// in the same frame; the server takes the plain effect.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A lesson as a short run of pages in a fixed frame.
 *
 * It replaces screen-by-screen click-throughs, which were too terse and gave
 * no context. Lessons not rebuilt yet stay on `LessonPage`.
 *
 * The text is MDX (`Content`), with the figures and moments imported into it,
 * so a word change is an edit to prose. The MDX marks each page break with
 * `<PageBreak />` (one long page was too much at once), and the Check has a
 * page of its own. This keeps what LessonPage does for completions, the
 * preview banner for a learner who is ahead of themselves, the LessonProvider
 * for terms, and the Shell.
 *
 * The frame: the Shell's header is pinned to the top of the window and
 * carries the position strip as its second row, and a footer pinned to the
 * bottom carries the page's one action: Back on the left, the page's place
 * ("2 of 3") in the middle, and on the right Next, "Next: Check", the Check's
 * "Check my answer", or after a pass the next lesson. The body scrolls
 * between them. The lesson title heads page 1; every page after it has a
 * title of its own, in the same style, from its PageBreak (a page that
 * opened on a bare instruction above a stage read as unanchored), and the
 * Check page opens on the Check's own heading. The header names the lesson
 * throughout.
 *
 * A page's moments gate it (a page reached with an earlier moment undone
 * showed dead controls, which read as missing). Each
 * moment component carries a static `moment` (its id in the store) and a
 * `hint` ("Press Repay to continue"); the Pager reads them off the blocks.
 * Every block after a moment stays off the page until that moment is done,
 * so a result paragraph never reads ahead of its action, and the footer's
 * Next is switched off, with the hint beside it, until every moment on the
 * page is done. The page is written into the address (#2, #check) so a
 * reload keeps the place, and a page change starts at the top.
 *
 * `start` is the position the lesson opens on, `hidden` keeps the strip off
 * the page until the MDX's `StripAppears` marker is reached (lesson 1), and
 * `moments` names the practice moments in page order.
 */
export default function ArticleLesson({ start, hidden = false, moments = [], lessonId, ...rest }) {
  // A lesson on a track that is not open yet renders none of itself.
  const lesson = lessonById(lessonId);
  if (lesson && !lesson.ready) return <TrackClosed track={trackByKey(lesson.track)} />;
  return (
    <PositionProvider lessonId={lessonId} start={start} hidden={hidden} moments={moments}>
      <LessonFrame lessonId={lessonId} {...rest} />
    </PositionProvider>
  );
}

function LessonFrame({ lessonId, description, Content, deeper = [], passTitle }) {
  const lesson = lessonById(lessonId);
  const track = trackByKey(lesson.track);
  const next = nextLesson(lessonId);
  const isBrowser = useIsBrowser();
  const { siteConfig } = useDocusaurusContext();
  const base = apiBase(siteConfig);
  const { shown, done: moments, play, notes, loaded, setPage: positionPage, redo, actions, press } = usePosition();
  const [done, setDone] = useState(false);
  // The stat the reader is pointing at in the text (`Stat`), for every
  // practice element and the strip to light: `{ name, scope }`, where scope
  // is null (everywhere), "figure" (the figures, not the strip) or the name
  // of a `StatScope` (see AppMock's usePointed).
  const [pointer, setPointer] = useState(null);
  const app = useMemo(
    () => ({ stat: pointer ? pointer.name : null, statIn: pointer ? pointer.scope : null, pointer, setPointer, hints: false, auto: true, slow: true, reserve: true, Fold: StageFold }),
    [pointer],
  );
  // Pointing at a label, or at the thing it names, lights both in full: the
  // label through its own state (`Stat`), the thing through `data-pointed`
  // on everything the label's key was marked on (cue.js). Only a thing that
  // a label on screen names is marked, so nothing else on the page answers
  // to the pointer.
  useEffect(() => {
    if (!pointer || typeof document === "undefined") return undefined;
    const key = `${pointer.name}|${pointer.scope ?? ""}`;
    const lit = [];
    for (const el of document.querySelectorAll("[data-cue-key]")) {
      if (el.hasAttribute("data-stat") || el.getAttribute("data-cue-key") !== key) continue;
      el.setAttribute("data-pointed", "");
      lit.push(el);
    }
    // While one thing is pointed at, every other marked thing and label drops
    // its rim and its light (`data-cue-quiet`): the one highlight on screen
    // is the one the reader asked for.
    const root = document.documentElement;
    root.setAttribute("data-cue-quiet", "");
    return () => {
      lit.forEach((el) => el.removeAttribute("data-pointed"));
      root.removeAttribute("data-cue-quiet");
    };
  }, [pointer]);
  // While a label is on screen, a band of light keeps crossing it and the
  // thing it names (see cue.js).
  useCues();
  const [ahead, setAhead] = useState(null);

  // Read after mount: the page is prerendered, and the first frame is the
  // ordinary interactive lesson (see LessonPage).
  useEffect(() => {
    if (!isBrowser) return;
    const finished = hasCompletion(lessonId);
    if (finished) setDone(true);
    const current = finished ? null : currentLesson(Object.keys(readCompletions()), lessonId);
    const reading = Boolean(current && current.id !== lessonId);
    setAhead(reading ? current : null);
    // Counted once per browser, and not for a lesson read ahead as a preview.
    if (!reading) reportEvent(base, "lesson_opened", lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser, lessonId]);

  // Each practice step the reader does is counted once per browser. `play`
  // counts actions in this visit, so a step restored on load is not sent
  // again, and one run again is already on the browser's list.
  useEffect(() => {
    if (!play) return;
    for (const id of Object.keys(moments)) reportEvent(base, "step_done", lessonId, id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  const preview = Boolean(ahead);

  // The page on screen: "1", "2", ... or "check". `total` is the number of
  // content pages, which the MDX's wrapper counts once it has rendered.
  const [page, setPage] = useState("1");
  const [total, setTotal] = useState(null);
  // The Check mounts the first time it is reached and stays, so going Back
  // to read a page does not cost the reader their questions.
  const [checkSeen, setCheckSeen] = useState(false);
  // What the Check reports for the footer's button: the press it is waiting
  // for (check this answer, the next question, try again), or none.
  const [check, setCheck] = useState(null);
  const onCheckState = useCallback((s) => setCheck(s), []);
  const place = page === CHECK ? (total ?? 0) + 1 : Number(page);
  // Each page's moments, in order, with their hints: what the Pager found on
  // the blocks. The first one not done on the page on screen holds Next.
  const [pages, setPages] = useState([]);
  const onPages = useCallback((p) => setPages(p), []);
  const pending = page === CHECK ? null : (pages[Number(page) - 1] ?? []).find((m) => !moments[m.id]) ?? null;
  // The pending moment's next action: an `Await`'s hint from the MDX, or the
  // moment's own, unless the moment says what the reader did is wrong
  // ("Pick USDC first"), which the practice element no longer prints.
  // A step that is pressed in the footer (Continue, a lesson control, a
  // sequence's next step) puts its own label on the footer's button.
  const offered = pending ? actions[pending.id] ?? null : null;
  const reason = !pending || (offered && !offered.disabled) ? null : notes[pending.id] ?? (offered ? null : pending.hint ?? "Finish the step above to continue");

  // The store shows the position as of the page on screen. A page the reader
  // turned to tweens the strip to its numbers; a reload's restore does not.
  const turned = useRef(false);
  useIsoLayoutEffect(() => {
    positionPage(place, turned.current);
    turned.current = false;
  }, [place, positionPage]);

  // A reload keeps the page (read after mount, as the completions are).
  useEffect(() => {
    if (!isBrowser) return;
    const fromHash = pageFromHash(window.location.hash);
    if (fromHash) setPage(fromHash);
  }, [isBrowser]);

  // An address past the last page (#9 on a two-page lesson) opens the last.
  useEffect(() => {
    if (total && page !== CHECK && Number(page) > total) setPage(String(total));
  }, [total, page]);

  // An address that names a page past a step the reader has not done (a link
  // to #3 opened in a browser that has not done page 2's steps) opens the
  // page with that step. Every control on a later page waits for it, so the
  // page named would open with nothing on it that can be pressed. Next only
  // opens once a page's steps are done, so a reader turning pages is never
  // past that page; this waits for the saved steps and the pages to be known.
  useEffect(() => {
    if (!loaded || !total || pages.length < total || preview) return;
    const open = pages.findIndex((ms) => ms.some((m) => !moments[m.id]));
    if (open < 0) return;
    const at = page === CHECK ? total + 1 : Number(page);
    if (at > open + 1) {
      setPage(String(open + 1));
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", `${pathname}${search}${open === 0 ? "" : `#${open + 1}`}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, total, pages, preview, page, moments]);

  useEffect(() => {
    if (page === CHECK) setCheckSeen(true);
  }, [page]);

  // The Check follows each review and the result into the window, which can
  // stop with the breadcrumb cut through by the header. Once that scroll has
  // run, the page moves the little further that takes the line out whole, or
  // back to where it shows whole.
  const checkStep = check?.action?.kind ?? null;
  useEffect(() => {
    if (page !== CHECK) return undefined;
    const t = window.setTimeout(() => {
      const crumbLine = [...document.querySelectorAll(`main .${styles.crumb}`)].find((el) => el.getClientRects().length > 0);
      if (!crumbLine) return;
      const edge = roomNow().top;
      const r = crumbLine.getBoundingClientRect();
      // Whole and clear of the header, or out of the window: nothing to do.
      if (r.bottom <= edge || r.top >= edge + 8) return;
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const down = r.bottom - edge + LINE_OUT;
      const move = down <= left ? down : r.top - edge - BENCH_GAP;
      const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollBy({ top: move, behavior: still ? "instant" : "smooth" });
    }, 750);
    return () => window.clearTimeout(t);
  }, [page, checkStep, done]);

  // replaceState rather than the router, which would treat the hash as an
  // anchor to scroll to. Page 1 keeps the plain address.
  const go = (p) => {
    turned.current = true;
    setPage(p);
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}${p === "1" ? "" : `#${p}`}`);
    window.scrollTo(0, 0);
  };

  // The steps on the page on screen, for "Redo this page": there once one of
  // them is done.
  const here = page === CHECK ? [] : (pages[Number(page) - 1] ?? []).map((m) => m.id);
  const redoPage = here.some((id) => moments[id])
    ? () => {
        redo(here);
        window.scrollTo(0, 0);
      }
    : null;

  const crumb = { track: track ? track.label : "Academy", place: `Lesson ${lesson.n}` };

  const footer = preview || !total ? null : (
    <FooterBar
      onBack={page === "1" ? null : () => go(page === CHECK ? String(total) : String(Number(page) - 1))}
      aside={redoPage ? <RedoPage onRedo={redoPage} /> : null}
      place={`${place} of ${total + 1}`}
      reason={reason}
      action={
        page === CHECK ? (
          <CheckAction check={check} done={done} next={next && next.track === lesson.track ? next : null} finish={track?.finish ?? null} />
        ) : offered ? (
          <button type="button" className={ls.primary} disabled={offered.disabled} data-footer-action={pending.id} onClick={() => press(pending.id)}>
            {offered.label}
            <ActionIcon kind={offered.kind} />
          </button>
        ) : (
          <button
            type="button"
            className={ls.primary}
            data-footer-next=""
            disabled={Boolean(pending)}
            onClick={() => go(Number(page) === total ? CHECK : String(Number(page) + 1))}
          >
            {Number(page) === total ? "Next: Check" : "Next"}
            <Arrow />
          </button>
        )
      }
    />
  );

  return (
    <AppContextProvider value={app}>
    <AcademyShell
      title={`${lesson.title} · Alchemix Academy`}
      description={description}
      pinned
      below={shown ? <PositionStrip /> : null}
      footer={footer}
    >
      <main className={styles.body} data-lesson="">
        {preview ? <PreviewBanner lesson={lesson} current={ahead} /> : null}

        {/* Where the reader is and the page's title head each page (the
            Pager draws them, so a page laid out in two columns can put them
            at the top of its text). The frame draws them for the Check,
            over the Check's column, and for a preview. Past page 1 the
            lesson's heading stays for a screen reader only. */}
        {preview || page === CHECK ? (
          <Crumb track={crumb.track} place={crumb.place} title={preview ? null : lesson.title} center={page === CHECK} />
        ) : null}
        {preview ? <h1 className={styles.title}>{lesson.title}</h1> : page === "1" ? null : <h1 className={styles.srOnly}>{lesson.title}</h1>}

        {page === CHECK ? <RevealStrip /> : null}

        <PagerContext.Provider value={{ page, setTotal, setPages: onPages, preview, frame: `${Boolean(footer)}|${shown}`, lessonTitle: lesson.title, crumb }}>
          <div className={preview ? lp.previewLabWrap : undefined}>
            <div className={preview ? lp.previewLab : undefined} inert={preview ? true : undefined}>
              <LessonProvider value={lessonId}>
                <Article>
                  <Content components={{ wrapper: Pager }} />
                </Article>

                {checkSeen && !preview ? (
                  <section className={styles.check} hidden={page !== CHECK} aria-label="Check">
                    <ChoiceCheckpoint
                      inline
                      liftSubmit
                      onSubmitState={onCheckState}
                      base={base}
                      lessonId={lessonId}
                      done={done}
                      onPass={() => setDone(true)}
                      passTitle={passTitle}
                    />

                    {done && deeper.length ? (
                      <div className={`${lp.deeper} ${styles.deeper}`}>
                        <div className={lp.deeperLabel}>Go deeper in the docs</div>
                        <ul className={lp.deeperList}>
                          {deeper.map((d) => (
                            <li key={d.to}>
                              <Link to={d.to} target="_blank" rel="noopener noreferrer">{d.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </LessonProvider>
            </div>
          </div>
        </PagerContext.Provider>

        {preview && deeper.length ? (
          <div className={`${lp.deeper} ${styles.deeper}`}>
            <div className={lp.deeperLabel}>Go deeper in the docs</div>
            <ul className={lp.deeperList}>
              {deeper.map((d) => (
                <li key={d.to}>
                  <Link to={d.to} target="_blank" rel="noopener noreferrer">{d.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {preview ? <PreviewFooter current={ahead} /> : null}
      </main>
    </AcademyShell>
    </AppContextProvider>
  );
}

/**
 * Where the reader is: the way back to the map (the track, and the lesson's
 * number or the page's own word), then the lesson's name. It stands in the
 * page over the title, on the column's left edge. In the nav row it shared a
 * line with the track's progress, the site's links and the logo, and read as
 * part of the site's menu.
 */
export function Crumb({ track, place = null, title = null, center = false }) {
  return (
    <nav className={`${styles.crumb} ${center ? styles.crumbCenter : ""}`} aria-label="Where you are">
      <Link to="/academy" className={styles.crumbBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H6M11 18l-6-6 6-6" />
        </svg>
        <span>
          {track}
          {place ? ` · ${place}` : ""}
        </span>
      </Link>
      {title ? (
        <>
          <span className={styles.crumbRule} aria-hidden="true" />
          <span className={styles.crumbTitle}>{title}</span>
        </>
      ) : null}
    </nav>
  );
}

/* ── The footer ──────────────────────────────────────────── */

/**
 * One row: the quiet Back, the page's place, the page's one action. `reason`
 * is the one line beside a switched-off Next that says what still has to
 * happen ("Press Repay to continue"). `aside` follows Back on the left (the
 * lessons' "Redo this page").
 */
export function FooterBar({ onBack, place, action, reason = null, aside = null }) {
  return (
    <div className={styles.bar}>
      <span className={styles.barLeft}>
        {onBack ? (
          <button type="button" className={`${ls.back} ${styles.barBack}`} onClick={onBack}>
            Back
          </button>
        ) : null}
        {aside}
      </span>
      <span className={styles.barPlace}>{place}</span>
      <span className={styles.barRight}>
        {reason ? <span className={styles.barReason}>{reason}</span> : null}
        {action}
      </span>
    </div>
  );
}

/** The icon after a step's label on the footer's button: down for Continue, the lesson's skip mark for a lesson control, an arrow for the next part. */
function ActionIcon({ kind }) {
  if (kind === "next") return <Arrow />;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "read" ? <path d="M12 5v13M6 13l6 6 6-6" /> : <path d="m5 6 6 6-6 6M13 6l6 6-6 6" />}
    </svg>
  );
}

/**
 * The Check page's action. While the Check is waiting for a press it is
 * that press (`check.action`): "Check my answer" for the question on screen,
 * "Next question" once its explanation shows, "Try again" after a try that
 * missed. Once the lesson is passed it is the way on: the next lesson, or
 * after a track's last lesson the track's finish page (`finish`, from
 * track.js), or the map for a track without one (the beginner track's lesson
 * 8 does not run on into the intermediate track). A reader back on a lesson
 * they passed earlier keeps the way on until they pick an answer.
 */
function CheckAction({ check, done, next, finish = null }) {
  const action = check?.action ?? null;
  if (action) {
    return (
      <button type="button" className={ls.primary} disabled={action.disabled} data-check-action={action.kind} onClick={() => action.press()}>
        {action.label}
        <Arrow />
      </button>
    );
  }
  if (done) {
    return next ? (
      <Link to={next.slug} className={`${ls.primaryLink} ${styles.barLink}`}>
        Next lesson
        <Arrow />
      </Link>
    ) : finish ? (
      <Link to={finish} className={`${ls.primaryLink} ${styles.barLink}`}>
        Finish the track
        <Arrow />
      </Link>
    ) : (
      <Link to="/academy" className={`${ls.primaryLink} ${styles.barLink}`}>
        Back to the map
        <Arrow />
      </Link>
    );
  }
  return (
    <button type="button" className={ls.primary} disabled>
      Check my answer
      <Arrow />
    </button>
  );
}

/* ── Pages ───────────────────────────────────────────────── */

const CHECK = "check";

/**
 * Where one page of a lesson's MDX ends and the next begins. Renders nothing
 * itself; `title` heads the page that follows it.
 */
// eslint-disable-next-line no-unused-vars
export function PageBreak({ title }) {
  return null;
}

const PagerContext = createContext(null);

/** The page on screen ("1", "2", ... or "check"), for a part that resets when the reader moves on. */
export function useCurrentPage() {
  return useContext(PagerContext)?.page ?? null;
}

/**
 * The MDX's top-level children, cut at each PageBreak.
 *
 * MDX hands its wrapper one element, the compiled content, rather than the
 * paragraphs. That element is a plain function component (it reads the MDX
 * components from context and returns a fragment of the page's blocks), so it
 * is called here in place, which is what rendering it would do, and the
 * fragment's children are the blocks to cut.
 */
function blocks(children) {
  const only = React.Children.toArray(children);
  if (only.length === 1 && React.isValidElement(only[0]) && typeof only[0].type === "function" && only[0].type !== PageBreak) {
    const out = only[0].type(only[0].props);
    if (React.isValidElement(out)) return React.Children.toArray(out.props.children);
  }
  return only;
}

function split(children) {
  const pages = [{ title: null, blocks: [] }];
  blocks(children).forEach((child) => {
    if (React.isValidElement(child) && child.type === PageBreak) pages.push({ title: child.props.title ?? null, blocks: [] });
    else pages[pages.length - 1].blocks.push(child);
  });
  return pages.filter((p) => p.blocks.length);
}

/**
 * The moments a block carries, in order, as `{ id, hint }`. A moment
 * component sets a static `moment` and `hint`. An element that carries two
 * actions before any text (lesson 3's MAX, then Borrow) sets a static
 * `moments` list instead. An `Await` marker names a moment through its
 * props: the second action on the one element above it, after the paragraph
 * that asks for it (one practice element per page).
 */
function momentsOf(block) {
  if (!React.isValidElement(block)) return [];
  const t = block.type;
  // A `Do` is not a moment and gates nothing; a marker written inside one
  // still counts, as if it stood just after it.
  if (t === Do) return React.Children.toArray(block.props.children).flatMap((c) => momentsOf(c));
  if (t === Await) return typeof block.props.moment === "string" ? [{ id: block.props.moment, hint: block.props.hint ?? null }] : [];
  if (t === ReadOn) return typeof block.props.moment === "string" ? [{ id: block.props.moment, hint: "Press Continue to read on" }] : [];
  if (typeof t !== "function") return [];
  if (Array.isArray(t.moments)) return t.moments.map((m) => ({ id: m.id, hint: m.hint ?? null }));
  return typeof t.moment === "string" ? [{ id: t.moment, hint: typeof t.hint === "string" ? t.hint : null }] : [];
}

/**
 * A marker in the MDX for a second action on the element above it: the
 * blocks after it wait for `moment`, and the footer's Next shows `hint`
 * until it is done. Renders nothing.
 *
 *   <YearThenWithdrawMoment />
 *   Deposit reads 10,500. Open the Withdraw tab, type 500 and press Withdraw.
 *   <Await moment="withdraw" hint="Press Withdraw to continue" />
 *   The vault sends 500 USDC to your wallet.
 */
// eslint-disable-next-line no-unused-vars
export function Await({ moment, hint }) {
  return null;
}

/**
 * The MDX's wrapper. Every page stays mounted, so a moment keeps what the
 * reader typed on the way back, and only the current one shows. A preview
 * shows every page in a row with no way on, the inert read it always was.
 *
 * Each page's moments are reported to the frame (their ids and hints), and
 * on a live page the blocks after a moment wait for it (`Gated`).
 */
function Pager({ children }) {
  const { page, setTotal, setPages, preview, lessonTitle, crumb } = useContext(PagerContext);
  const { done, play, setLayout } = usePosition();
  const pages = split(children);
  const total = pages.length;
  useEffect(() => setTotal(total), [total, setTotal]);
  const found = JSON.stringify(pages.map((p) => p.blocks.flatMap((b) => momentsOf(b))));
  useEffect(() => {
    if (setPages) setPages(JSON.parse(found));
  }, [found, setPages]);
  // Each page's position events in order, for the store to fold: the
  // moments, and each StripAt's numbers.
  const events = JSON.stringify(pages.map((p) => p.blocks.flatMap((b) => eventsOf(b))));
  useEffect(() => {
    setLayout(JSON.parse(events));
  }, [events, setLayout]);
  // What heads a page: where the reader is, then the page's title. Page 1's
  // title is the lesson's own, so its breadcrumb stops at the lesson's
  // number. A preview has the frame's breadcrumb and title over all of it.
  const head = (p, i) =>
    preview ? (
      i > 0 && p.title ? <h2 className={styles.title}>{p.title}</h2> : null
    ) : (
      <React.Fragment key="head">
        <Crumb track={crumb.track} place={crumb.place} title={i === 0 ? null : lessonTitle} />
        {i === 0 ? <h1 className={styles.title}>{lessonTitle}</h1> : p.title ? <h2 className={styles.title}>{p.title}</h2> : null}
      </React.Fragment>
    );
  return pages.map((p, i) => (
    <PageContext.Provider key={i} value={i + 1}>
      <div className={styles.page} hidden={preview ? undefined : page !== String(i + 1)}>
        {preview ? (
          <>
            {head(p, i)}
            {p.blocks}
          </>
        ) : (
          <Gated head={head(p, i)} blocks={p.blocks} done={done} play={play} />
        )}
      </div>
    </PageContext.Provider>
  ));
}

/**
 * A marker in a page: the blocks after it are laid out beside the first
 * practice element or figure that follows, where the window is wide enough
 * for both (see `Bench`). The row ends at a `Below`, at the next `Beside`, at
 * a second element, or with the page. Renders nothing.
 *
 *   <Beside />
 *
 *   Type 10,000 in the USDC field and press Deposit.
 *
 *   <DepositMoment />
 *
 *   The vault deposited your 10,000 USDC into MYT...
 *
 * A row sizes itself to an element narrower than its column (the Swap card,
 * a capture at a reading width). `full` keeps the row at the full width with
 * the element filling its column, for a page with two rows whose edges should
 * line up.
 */
// eslint-disable-next-line no-unused-vars
export function Beside({ full = false }) {
  return null;
}

/**
 * A marker that ends a `Beside` row: the blocks after it are under the
 * element and its text, at the page's full width (a figure of another
 * screen, and the text about that figure). Renders nothing.
 */
export function Below() {
  return null;
}

const isMarker = (block, type) => React.isValidElement(block) && block.type === type;

/** A figure with nothing to press that a `Beside` row can stand its text beside (it sets a static `figure`). */
const isFigure = (block) => React.isValidElement(block) && typeof block.type === "function" && block.type.figure === true;

/** How wide a row's element is when it is narrower than its column (the Swap card, a capture at a reading width). */
function benchWidth(block) {
  if (!React.isValidElement(block) || typeof block.type !== "function") return null;
  if (block.type === Shot) return block.props.column ? "46rem" : null;
  return typeof block.type.benchWidth === "string" ? block.type.benchWidth : null;
}

/** A block's position events: `{ moment }` for each moment, `{ strip, set }` for a StripAt. */
function eventsOf(block) {
  if (React.isValidElement(block) && block.type === StripAt) return [{ strip: block.props.id ?? "", set: block.props.set ?? {} }];
  return momentsOf(block).map((m) => ({ moment: m.id }));
}

/**
 * A page's blocks, cut after each moment. The blocks up to and including the
 * first moment are always on the page; every block after a moment is off the
 * page until that moment is done (an element with two moments gates on its
 * last). Blocks that arrive because the reader
 * just acted fade in (`play` counts actions in this visit, never a load,
 * so a reload shows what was done with no fade). A marker like StripAt has
 * no `moment` static, so nothing waits on it.
 *
 * The page is a column of parts in the order written: its own blocks at the
 * page's width, and each `Beside` row (the row's element, the text before
 * it and the text after it).
 */
function Gated({ head = null, blocks, done, play }) {
  // The steps the page asks for, in order (each `Do`), for a step's label.
  const steps = [];
  blocks.forEach((b) => {
    if (isMarker(b, Do)) steps.push({ id: b.props.moment, title: b.props.title ?? null });
  });
  // What was done when the page's blocks mounted. A block behind one of those
  // moments is simply there: "Redo this page" remounts the blocks in the
  // middle of a visit, and blocks the reader had already read would fade in
  // again.
  const [atMount] = useState(done);
  const parts = [];
  // The row being filled, if the last marker was a `Beside`.
  let bench = null;
  // The moment the blocks from here on wait for.
  let gate = null;
  // The practice element the markers after it belong to: its own moments and
  // each `Await` up to the next element. A `ReadOn` after it is not one of
  // its steps (the element is finished before the reader reads on).
  let step = null;
  const plain = () => {
    const last = parts[parts.length - 1];
    if (last && last.kind === "plain") return last.items;
    const part = { kind: "plain", items: [] };
    parts.push(part);
    return part.items;
  };
  blocks.forEach((b) => {
    // The line break the MDX leaves between two blocks.
    if (typeof b === "string" && !b.trim()) return;
    if (isMarker(b, Beside)) {
      bench = { kind: "bench", before: [], card: null, width: null, full: Boolean(b.props.full), after: [] };
      parts.push(bench);
      return;
    }
    if (isMarker(b, Below)) {
      bench = null;
      return;
    }
    const ms = momentsOf(b);
    const element = isPractice(b) && ms.length > 0;
    let node = b;
    if (element) {
      step = { id: ms[0].id, ids: ms.map((m) => m.id) };
      node = (
        <React.Fragment key={`step:${step.id}`}>
          <StepMark id={step.id} ids={step.ids} />
          <StepState ids={step.ids}>{b}</StepState>
        </React.Fragment>
      );
    } else if (step && !isMarker(b, ReadOn)) step.ids.push(...ms.map((m) => m.id));
    // A row has one element. A second one ends the row and takes the page's width.
    if (bench && bench.card && (element || isFigure(b))) bench = null;
    if (bench && !bench.card && (element || isFigure(b))) {
      bench.card = node;
      bench.width = bench.full ? null : benchWidth(b);
      // An element stepped through with its steps written in the text's
      // column (lesson 7's liquidation). The text before it and its steps
      // fold together, to a line with the element's `stepsTitle`, when the
      // reader presses the Continue that follows it (`fold`, set below).
      // Folding as the last step was done hid that step before it was read.
      bench.seq = element && typeof b.type.stepsTitle === "string" ? { last: ms[ms.length - 1].id, title: b.type.stepsTitle, fold: null } : null;
    } else {
      if (bench && bench.card && bench.seq && !bench.seq.fold && gate === bench.seq.last && (isMarker(b, ReadOn) || isMarker(b, Do))) bench.seq.fold = b.props.moment;
      (bench ? (bench.card ? bench.after : bench.before) : plain()).push({ gate, node });
    }
    if (ms.length) gate = ms[ms.length - 1].id;
  });
  // Blocks in order, each run of blocks behind the same moment in one `Reveal`.
  // `tail` is a row's place for its element's steps (see `Bench`), which goes
  // at the end of the text before the element. `seq` names the element when
  // that text and those steps fold once it is done.
  const show = (items, name, tail = null, seq = null) => {
    const out = [];
    items.forEach((it) => {
      if (it.gate && !done[it.gate]) return;
      const last = out[out.length - 1];
      if (last && last.gate === it.gate) last.nodes.push(it.node);
      else out.push({ gate: it.gate, nodes: [it.node] });
    });
    return out.map((g, i) => {
      const key = `${name}:${g.gate ?? ""}:${i}`;
      const fade = Boolean(g.gate) && !atMount[g.gate];
      // The step this run of text asks for (its `Do`). Once that step is
      // done the run has been used: it folds to one line naming the step,
      // and the text the step revealed is what the reader sees.
      const mark = g.nodes.filter((n) => isMarker(n, Do) || isMarker(n, ReadOn)).pop() ?? null;
      const end = i === out.length - 1;
      // A step with no title folds to "Step done"; a Continue with none folds without a line.
      const asked = mark ? { moment: mark.props.moment, title: mark.props.title ?? (isMarker(mark, Do) ? "Step done" : null) } : end ? seq : null;
      const nodes = end && tail ? [...g.nodes, tail] : g.nodes;
      // Text that asks for nothing and waits for nothing (a page that is
      // only read) is the page's own blocks.
      if (!asked && !g.gate) {
        return (
          <Reveal key={key} fade={fade} play={play}>
            {nodes}
          </Reveal>
        );
      }
      return (
        <StepGroup key={key} past={Boolean(asked && done[asked.moment])} title={asked ? asked.title : null} fade={fade} play={play}>
          {nodes}
        </StepGroup>
      );
    }).concat(tail && !out.length ? [tail] : []);
  };
  // The page's breadcrumb and title go to its row, which puts them at the
  // top of the text's column. A page with no row has them over its text.
  const row = parts.findIndex((part) => part.kind === "bench" && part.card);
  const page = parts.map((part, i) => {
    if (part.kind === "plain") return <React.Fragment key={i}>{show(part.items, `p${i}`)}</React.Fragment>;
    // A row whose element never came (a `Beside` with no element after it) is its text.
    if (!part.card) return <React.Fragment key={i}>{show(part.before, `p${i}`)}</React.Fragment>;
    return (
      <Bench
        key={i}
        width={part.width}
        head={i === row ? head : null}
        before={(slot) => show(part.before, "before", slot, part.seq && part.seq.fold ? { moment: part.seq.fold, title: part.seq.title } : null)}
        after={show(part.after, "after")}
        card={part.card}
      />
    );
  });
  return (
    <StepsContext.Provider value={steps}>
      {row < 0 ? head : null}
      {page}
    </StepsContext.Provider>
  );
}

/** The steps the page around a `Do` asks for, in order: `{ id, title }`. */
const StepsContext = createContext([]);

/**
 * A run of a page's text that ends in a step (`Do`): what the reader needs
 * to read before acting, and the instruction. The text a page's last step
 * reveals is a run too, one that asks for nothing and so never folds.
 *
 * Until the step is done it is on the page as written. Once it is done the
 * run folds to one line, a tick and the step's `title`, and the text the
 * step revealed stands under it. Left on the page, each step's text stacked
 * under the last: after two steps the column held four runs of text and the
 * reader had to find the one that was new. The line opens the run again for
 * a reader who wants to reread it.
 */
function StepGroup({ past, title, fade, play, children }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const body = useRef(null);
  const line = useRef(null);
  // Whether the run has finished folding behind its line.
  const [gone, setGone] = useState(past);
  const [fresh, setFresh] = useState(false);
  const was = useRef(past);
  const born = useRef(0);
  useEffect(() => {
    born.current = Date.now();
  }, []);
  // The run folds into its line in one motion: the line opens from nothing
  // as the run closes, over the same time and on the same curve, so what is
  // under them rides up once. The line used to arrive at once and the run
  // fade before it folded, three movements where the reader did one thing.
  useIsoLayoutEffect(() => {
    if (past === was.current) return undefined;
    was.current = past;
    if (!past) {
      setGone(false);
      return undefined;
    }
    const el = body.current;
    const ln = line.current;
    // Done within a moment of the page loading: restored from an earlier visit.
    if (reduced || !el || justBorn(born)) {
      setGone(true);
      return undefined;
    }
    if (ln) {
      const full = ln.offsetHeight;
      ln.style.height = "0px";
      ln.style.opacity = "0";
      void ln.offsetHeight;
      ln.style.transition = `height ${FOLD_S}s ${FOLD_EASE}, opacity ${FOLD_S}s ease`;
      ln.style.height = `${full}px`;
      ln.style.opacity = "1";
    }
    // The run keeps the room it had over it while it folds: its own line,
    // now in front of it, would otherwise give it the room a run has after
    // the lines of earlier steps, 20px in one frame.
    const after = [...el.parentElement.children].some((c) => c !== ln && c.classList.contains(styles.pastWrap) && c.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    el.style.paddingTop = after ? "1.25rem" : "0px";
    foldOut(el, FOLD_S, FOLD_EASE);
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    setFresh(true);
    const t = window.setTimeout(() => {
      if (ln) {
        ln.style.transition = "";
        ln.style.height = "";
        ln.style.opacity = "";
      }
      setGone(true);
    }, FOLD_S * 1000 + 20);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [past]);
  const folded = past && gone;
  return (
    <>
      {past && title ? (
        <div ref={line} className={styles.pastWrap}>
          <button type="button" className={`${styles.pastLine} ${fresh ? styles.pastFresh : ""}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg className={styles.pastTick} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" pathLength="1" />
            </svg>
            <span className={styles.pastTitle}>{title}</span>
            <svg className={styles.pastChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      ) : null}
      {folded ? (
        <FoldAway show={open} className={`${styles.group} ${styles.groupPast}`}>
          {children}
        </FoldAway>
      ) : (
        <div ref={body} className={styles.group} data-current="" aria-hidden={past ? true : undefined}>
          <Reveal fade={fade} play={play}>
            {children}
          </Reveal>
        </div>
      )}
    </>
  );
}

/** How long a finished run takes to fold into its line, and the curve it folds on. */
const FOLD_S = 0.36;
const FOLD_EASE = "cubic-bezier(0.3, 0.7, 0.2, 1)";

/** Whether the practice element around this sits beside its text (`Bench`), for the stage to size itself by. */
const BenchContext = createContext(false);

/**
 * A page's practice element with the page's text beside it.
 *
 * Under the element, the text that explains a step was a form's height from
 * the stats it names, and no window showed both. Where the window is wide
 * enough (the style sheet decides, and `side` reads its answer), the page's
 * text takes the left of a wider row, under the page's breadcrumb and title
 * (`head`), and the element the right, from the top of the page. With the
 * title over the whole row the element started 160px lower, and in a laptop's
 * window its button was under the footer when the page opened. Each
 * column stays in the window while the longer one scrolls, so the stats and
 * the sentence about them are on screen together. Pointing at a stat on the
 * element lights its row in the text, as pointing at the row lights the stat.
 *
 * In a narrower window the same blocks are in the page's one column, in the
 * order they are written: the text before the element, the element, the text
 * after it. The element keeps its place in the tree either way, so what the
 * reader typed stays through a resize.
 */
function Bench({ width = null, head = null, before, after, card }) {
  const ref = useRef(null);
  const cardRef = useRef(null);
  // Where an element puts the part of itself that is text (a sequence's
  // steps), in the text's column between what is written before the element
  // and after it.
  const [slot, setSlot] = useState(null);
  // "Redo this page" remounts the page's blocks, this with them. It
  // starts from the last answer read (`besideSeen`), so the page is drawn in
  // the same layout it had and the element can be held where it was. The
  // first draw of a visit is the one-column order, as the server drew it.
  const [side, setSide] = useState(besideSeen);
  const { setPointer } = useAppContext();
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const read = () => {
      // A page that is not the one shown is not laid out, and its row would
      // answer for the one-column order whatever the window's width. It keeps
      // the answer it had until its page is turned to.
      if (el.getClientRects().length === 0) return;
      besideSeen = window.getComputedStyle(el).getPropertyValue("--side").trim() === "1";
      setSide(besideSeen);
      // Where the columns stop under the pinned header (in a short window
      // only its strip stays pinned, see `useFitRoom`).
      const header = document.querySelector("header");
      const pinned = header ? Math.max(0, header.getBoundingClientRect().height + Math.min(0, parseFloat(window.getComputedStyle(header).top) || 0)) : 0;
      el.style.setProperty("--bench-top", `${Math.round(pinned) + BENCH_GAP}px`);
      // The room an element leaves under itself (a figure's 2rem, a vault
      // frame's) is taken off the column's height. The column stops moving
      // when its foot meets the foot of the row, and with that room counted
      // the figure stopped 32px short of the foot of the text beside it.
      const box = cardRef.current;
      if (box) {
        let trail = 0;
        if (besideSeen) {
          const foot = box.getBoundingClientRect().bottom;
          let lowest = -Infinity;
          for (const n of box.querySelectorAll("*")) {
            if (n.offsetHeight === 0) continue;
            lowest = Math.max(lowest, n.getBoundingClientRect().bottom);
          }
          if (Number.isFinite(lowest)) trail = Math.max(0, Math.round(foot - lowest));
        }
        box.style.setProperty("--trail", `${trail}px`);
        // An element taller than the window's room (a laptop's short window,
        // where the vault cannot shrink any further) stops with its foot
        // above the footer instead of its head under the header. Held by its
        // head, its form's button stayed under the footer for as long as the
        // text beside it was scrolling, and no scrolling brought it up.
        const footer = document.querySelector("footer");
        const floor = (footer ? footer.getBoundingClientRect().top : window.innerHeight) - HOLD_GAP;
        const tall = box.offsetHeight - trail;
        const head = Math.round(pinned) + BENCH_GAP;
        el.style.setProperty("--card-top", `${Math.min(head, Math.round(floor - tall))}px`);
        // A row whose element or text ends under the footer as the page
        // opens (both start under the page's title) is shown whole only
        // where its columns stop under the header, with the title out of
        // the window. The row is given the height that lets the page scroll
        // that far; short of it, the page ended with the title cut through.
        const over = el.querySelector(`:scope > .${styles.benchHead}`);
        const lead = over ? over.offsetHeight : 0;
        const text = el.querySelector(`:scope > .${styles.rail}`);
        const most = Math.max(tall, text ? text.offsetHeight : 0);
        let least = 0;
        // Where the row starts as the page opens: under the room the page
        // keeps over its breadcrumb, which is more than the columns keep
        // under the header once they stop there.
        const body = el.closest(`.${styles.body}`);
        const start = Math.round(pinned) + Math.max(BENCH_GAP, body ? parseFloat(window.getComputedStyle(body).paddingTop) || 0 : 0);
        if (besideSeen && lead && lead + most > floor - start) {
          const under = body ? parseFloat(window.getComputedStyle(body).paddingBottom) || 0 : 0;
          const bar = footer ? footer.getBoundingClientRect().height : 0;
          least = Math.max(0, Math.ceil(lead + window.innerHeight - head - bar - under));
        }
        el.style.setProperty("--row-least", `${least}px`);
      }
    };
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (cardRef.current) ro.observe(cardRef.current);
    const header = document.querySelector("header");
    if (header) ro.observe(header);
    window.addEventListener("resize", read);
    read();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    };
  }, []);
  const set = setPointer ?? (() => {});
  const fromTile = (p) => Boolean(p) && p.from === "tile";
  // An element that fits the window's room starts under the page's title, so
  // in a window just tall enough for it the foot of its form opens under the
  // footer. When the reader starts using the element (a click in it), the
  // page moves up to where the element stops under the header, which shows
  // it whole. An element taller than the room is left to the reader: no
  // place shows it whole.
  const bringWhole = () => {
    const box = cardRef.current;
    if (!side || !box) return;
    const room = roomNow();
    const trail = parseFloat(box.style.getPropertyValue("--trail")) || 0;
    const r = box.getBoundingClientRect();
    const tall = r.height - trail;
    const line = room.top + BENCH_GAP;
    const floor = room.bottom - HOLD_GAP;
    // Nothing to do for an element whose foot is over the footer, or under
    // it by less than the room kept between the two.
    if (tall > floor - line || r.top + tall - floor <= 8 || r.top <= line) return;
    // To where the columns stop under the header: the one place the page
    // rests with the title out of the window whole and the element whole.
    const move = r.top - line;
    const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: move, behavior: still ? "instant" : "smooth" });
  };
  return (
    <BenchContext.Provider value={side}>
      <RailSlotContext.Provider value={side ? slot : null}>
      <div
        ref={ref}
        className={`${styles.bench} ${width ? styles.benchFit : ""}`}
        style={width ? { "--card": width } : undefined}
        data-bench=""
        data-side={side ? "" : undefined}
      >
        {/* The breadcrumb and the title head the row, over both columns, so
            the text and the element start on one line under them. */}
        {side && head ? (
          <div key="head" className={styles.benchHead}>
            {head}
          </div>
        ) : null}
        {side ? (
          <div key="rail" className={styles.rail}>
            {/* The place for the element's steps ends the text before the
                element, so the two fold together. */}
            <React.Fragment key="before">{before(<div key="slot" ref={setSlot} className={styles.railSlot} />)}</React.Fragment>
            <React.Fragment key="after">{after}</React.Fragment>
          </div>
        ) : null}
        {side ? null : head}
        {side ? null : <React.Fragment key="before">{before(null)}</React.Fragment>}
        <div
          key="card"
          ref={cardRef}
          className={styles.benchCard}
          data-bench-card=""
          onClick={bringWhole}
          onPointerOver={(e) => {
            if (e.pointerType !== "mouse") return;
            const named = cueOf(e.target);
            if (named) set((p) => (fromTile(p) && p.name === named.name && p.scope === named.scope ? p : { ...named, from: "tile", id: labelFor(named) }));
            else set((p) => (fromTile(p) ? null : p));
          }}
          onPointerLeave={() => set((p) => (fromTile(p) ? null : p))}
        >
          {card}
        </div>
        {side ? null : <React.Fragment key="after">{after}</React.Fragment>}
      </div>
      </RailSlotContext.Provider>
    </BenchContext.Provider>
  );
}

/**
 * The place in a `Bench`'s text column for the part of an element that is
 * text, or null where the element and its text are in one column. A sequence
 * draws its steps there (`useRailSlot`, with a portal), so each step is read
 * beside the vault it describes.
 */
const RailSlotContext = createContext(null);
export function useRailSlot() {
  return useContext(RailSlotContext);
}

/** Whether the element around this sits beside its text. Its steps' place is null there while the text before it is folded. */
export function useBeside() {
  return useContext(BenchContext);
}

/**
 * Where the page's element is from the text that introduces it: "On the
 * right" where the two are side by side; where the page is one column (a
 * phone, a narrow window), "Below" for text written before the element and
 * "Above" for text that comes after it. `low` gives it in lower case for the
 * middle of a sentence.
 *
 *   <There /> is a practice copy of the app's Dashboard.
 *   The practice vault <There low /> holds your deposit.
 */
export function There({ low = false }) {
  const side = useContext(BenchContext);
  const ref = useRef(null);
  const [above, setAbove] = useState(false);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    const bench = el ? el.closest("[data-bench]") : null;
    const card = bench ? bench.querySelector(":scope > [data-bench-card]") : null;
    setAbove(Boolean(card) && Boolean(card.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
  }, [side]);
  const words = side ? "On the right" : above ? "Above" : "Below";
  return <span ref={ref}>{low ? words.toLowerCase() : words}</span>;
}

/** Whether the last `Bench` measured had its element beside its text. */
let besideSeen = false;

/**
 * The room between the pinned header and the top of a `Bench`'s columns once
 * the page's title has scrolled away. Less than the room over the page's
 * breadcrumb as the page opens (the body's padding in the style sheet) and
 * than the room under the title, so the title is out of the window whole by
 * the time the columns stop.
 */
const BENCH_GAP = 24;
/** The share of the window's room a step's revealed text is given beside its element. */
const BESIDE_LEAD = 0.6;

/** Whether every step on the practice element around this is done. */
const StepContext = createContext(false);

/** Tells a practice element when its last step is done (`ids`: every moment acted on it). */
function StepState({ ids, children }) {
  const { done } = usePosition();
  return <StepContext.Provider value={ids.every((m) => done[m])}>{children}</StepContext.Provider>;
}

/**
 * The mark in front of a practice element (`data-step`), and what keeps the
 * element in view when the reader does one of its steps.
 *
 * A step changes what is above the element: its instruction folds away, and
 * everything under the instruction rides up with it, about 100px. A reader
 * who had scrolled down to reach the button (any window too short to show
 * the whole element under the text) watched the element slide under the
 * pinned header, and the stat that had just changed went with it. So for the
 * half second after a step the window is scrolled, frame by frame, to hold
 * the element where it was, and if the stats that changed are cut off by the
 * header or the footer it is eased just far enough to show them. A reader who
 * scrolls in that half second takes over.
 */
function StepMark({ id, ids }) {
  const { done, play } = usePosition();
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const count = ids.filter((m) => done[m]).length;
  const was = useRef({ count, play });
  useIsoLayoutEffect(() => {
    const before = was.current;
    was.current = { count, play };
    // Only a step the reader just did: a load restores what was done without
    // an action (`play` stays), and "Redo this page" lowers the count.
    if (count <= before.count || play === before.play) return undefined;
    const el = ref.current ? ref.current.nextElementSibling : null;
    if (!el) return undefined;
    // Beside its text the element stays in the window by itself; the window
    // only has to show the text the step revealed.
    const bench = el.closest("[data-side]");
    return bench ? settleBeside(bench, reduced) : holdInView(el, reduced);
    // `ids` is rebuilt on every render; the count is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, play]);
  return <div ref={ref} hidden data-step={id} />;
}

/** How long the element is held after a step: a little longer than the instruction (0.4s) and a used panel (0.66s) take to fold. */
const HOLD_MS = 740;
/** The room kept between a changed stat and the header or the footer. */
const HOLD_GAP = 12;
/** How much of the text a step reveals is brought above the footer: about three lines. */
const HOLD_TEXT = 96;

/**
 * The window's room for the page: from the foot of the pinned header to the
 * top of the pinned footer. In a short window only the header's strip stays
 * pinned (the Shell lets the row above it scroll away), so the header's foot
 * is read where it is now.
 */
function roomNow() {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  return {
    top: Math.max(0, header ? header.getBoundingClientRect().bottom : 0),
    bottom: footer ? Math.min(window.innerHeight, footer.getBoundingClientRect().top) : window.innerHeight,
  };
}

/**
 * Where a move the page makes by itself should stop, so that no line that
 * heads the page is left cut through by the pinned header: the breadcrumb,
 * the page's title, the line a finished step folds to. A move down goes on
 * until the line it would cut is out of the window whole, and no further
 * than `most` (past that the text being brought into view starts to leave).
 * A move up goes on until the line shows whole.
 */
export function wholeLines(move, most = Infinity) {
  const main = typeof document === "undefined" ? null : document.querySelector("main");
  if (!main || !move) return move;
  const edge = roomNow().top;
  const lines = [...main.querySelectorAll(`.${styles.crumb}, .${styles.title}, .${styles.pastLine}`)].filter((el) => el.getClientRects().length > 0);
  let d = move;
  if (d > 0) {
    for (const el of lines) {
      const t = el.getBoundingClientRect();
      if (t.top - d < edge - LINE_OUT - 1 && t.bottom - d > edge - LINE_OUT + 1 && t.bottom - edge + LINE_OUT <= most) d = t.bottom - edge + LINE_OUT;
    }
  } else {
    for (const el of lines.reverse()) {
      const t = el.getBoundingClientRect();
      // The breadcrumb comes back with the room it has over it at the top of the page.
      if (t.top - d < edge - LINE_OUT - 1 && t.bottom - d > edge + 1) d = t.top - edge - (el.matches(`.${styles.crumb}`) ? BENCH_GAP : 0);
    }
  }
  return d;
}

/** How far past the header's edge a line is taken (a title's descenders hang under its box). */
const LINE_OUT = 6;

/** The first block with a box after a practice element: the text its step reveals. */
function blockAfter(el) {
  let n = el;
  while (n) {
    let next = n.nextElementSibling;
    // The end of a run that faded in, or of the box a `Bench` keeps its
    // element in: on to what follows it.
    while (!next && n.parentElement && n.parentElement.matches(`.${styles.reveal}, [data-bench-card]`)) {
      n = n.parentElement;
      next = n.nextElementSibling;
    }
    if (!next) return null;
    if (next.matches(`.${styles.reveal}`) && next.firstElementChild) next = next.firstElementChild;
    if (!next.hidden && next.offsetHeight > 0) return next;
    n = next;
  }
  return null;
}

/**
 * Hold `el` where it is in the window while the page around it settles, and
 * ease it to where its changed stats (the tiles carrying a change chip) are
 * between the header and the footer, and the start of the text the step
 * revealed is above the footer when that takes no changed stat out of view.
 * Returns the way to stop.
 *
 * Where the element should end is worked out again on every frame, from
 * where its parts are then: a used panel folding away inside the element
 * brings the text up by itself, and the window follows only as far as is
 * still needed.
 */
function holdInView(el, reduced) {
  const from = el.getBoundingClientRect().top;
  // The stats that changed. A chip outside a tile (the wallet balance under
  // a field) does not count: it sits by the button the reader just pressed.
  const tiles = [...el.querySelectorAll('[class*="delta_"]')].map((chip) => chip.closest('[class*="tile_"]')).filter(Boolean);
  const text = blockAfter(el);
  // Parts of the element that are folding away (`FoldAway`). The text under
  // the element ends up higher by what is left of them, so it is placed
  // where it will be, and the element does not rise to meet text that is
  // about to come up by itself.
  const folding = [...el.querySelectorAll("[data-folding]")];
  const goal = () => {
    // The room is read on every frame too: on a phone the strip can take a
    // second line while its numbers run, and the header grows with it.
    const room = roomNow();
    const roomTop = room.top + HOLD_GAP;
    const roomBottom = room.bottom - HOLD_GAP;
    const at = el.getBoundingClientRect().top;
    let to = from;
    // The highest the element may sit before a changed stat goes under the header.
    let least = -Infinity;
    if (tiles.length) {
      const rects = tiles.map((t) => t.getBoundingClientRect());
      const top = Math.min(...rects.map((r) => r.top)) - at;
      const bottom = Math.max(...rects.map((r) => r.bottom)) - at;
      least = roomTop - top;
      if (from < least) to = least;
      else if (from + bottom > roomBottom) to = Math.max(least, roomBottom - bottom);
    }
    if (text && text.isConnected) {
      // A list of changes (`Changes`) carries each stat beside its sentence,
      // so its start is shown even where the vault's own stats cannot all
      // stay in the window with it (a phone, where they fill it).
      if (text.matches("[data-changes]")) least = -Infinity;
      const r = text.getBoundingClientRect();
      const toFold = folding.reduce((sum, f) => sum + (f.isConnected ? f.getBoundingClientRect().height : 0), 0);
      const most = roomBottom - Math.min(HOLD_TEXT, r.height) - (r.top - at - toFold);
      if (to > most) to = Math.max(least, most);
    }
    return to;
  };
  let raf = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
    window.cancelAnimationFrame(raf);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchmove", stop);
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) stop();
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchmove", stop, { passive: true });
  window.addEventListener("keydown", onKey);
  const start = performance.now();
  const tick = (now) => {
    if (stopped) return;
    const t = Math.min((now - start) / HOLD_MS, 1);
    const eased = reduced ? 1 : 1 - Math.pow(1 - t, 3);
    const want = from + (goal() - from) * eased;
    const off = el.getBoundingClientRect().top - want;
    if (Math.abs(off) >= 0.5) window.scrollBy({ top: off, behavior: "instant" });
    if (t < 1) raf = window.requestAnimationFrame(tick);
    else stop();
  };
  raf = window.requestAnimationFrame(tick);
  return stop;
}

/**
 * After a step on an element that sits beside its text (`Bench`): bring the
 * start of the text the step revealed into the window, and no further. The
 * element needs no holding there, since its column stays in the window by
 * itself.
 *
 * A reader in a short window has scrolled down the element to reach its
 * button, so the text's column has gone up with the page. The window is
 * eased back to where the revealed text starts under the header (and to the
 * top of the row when the text still shows from there). A reader whose
 * window already shows the text is not moved. Where things are is read on
 * every frame, because an instruction folding away above the text brings it
 * up by itself. Returns the way to stop.
 */
function settleBeside(bench, reduced) {
  const rail = bench.querySelector(`.${styles.rail}`);
  const runs = rail ? rail.querySelectorAll(`.${styles.reveal}`) : [];
  const run = runs.length ? runs[runs.length - 1] : null;
  let text = run ? run.firstElementChild : null;
  while (text && text.offsetHeight === 0) text = text.nextElementSibling;
  if (!text) return undefined;
  // Where the move would leave the page's title cut through by the header,
  // it goes on until the title is out of the window whole, as long as the
  // revealed text's start stays under the header (`wholeLines`).
  const whole = (d, room, most) => (d > 0 ? Math.max(d, wholeLines(d, most)) : d);
  const delta = () => {
    const room = roomNow();
    const line = room.top + BENCH_GAP;
    const foot = room.bottom - HOLD_GAP;
    const r = text.getBoundingClientRect();
    let rising = 0;
    for (const d of rail.querySelectorAll(`[data-folding], .${styles.do}[aria-hidden="true"]`)) {
      // A step's instruction inside a run that is folding is counted with the run.
      if (!d.matches("[data-folding]") && d.closest("[data-folding]")) continue;
      if (d.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING) rising += d.getBoundingClientRect().height;
    }
    const top = r.top - rising;
    // Scrolling down by more than `most` puts the text's start under the
    // header; by less than `least` leaves it under the footer.
    const most = top - line;
    // How much of the revealed text is brought above the footer: all of a
    // short run, and of a long one enough to fill most of the room (the
    // element stays where it is, so nothing is lost by moving the text up).
    const lead = Math.max(Math.min(HOLD_TEXT, r.height), Math.min(run.getBoundingClientRect().bottom - r.top, (foot - line) * BESIDE_LEAD));
    const least = top + lead - foot;
    // Back to where the row's columns stop under the header when the text
    // shows from there: under the breadcrumb and the title, which have
    // scrolled away by then. Going back to the top of the page instead put
    // the foot of the element under the footer again after every step.
    const over = bench.querySelector(`:scope > .${styles.benchHead}`);
    const up = (over ? over.getBoundingClientRect().bottom : bench.getBoundingClientRect().top) - line;
    if (up < 0 && up >= least) return up;
    if (most < 0) return whole(Math.max(least, Math.min(most, up)), room, most);
    if (least > 0) return whole(Math.min(least, most), room, most);
    // The text shows where the page is: all that is left is a line that
    // heads the page and is cut through by the header.
    const tidy = wholeLines(0.01, most);
    return tidy > 1 ? tidy : 0;
  };
  let raf = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
    window.cancelAnimationFrame(raf);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchmove", stop);
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) stop();
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchmove", stop, { passive: true });
  window.addEventListener("keydown", onKey);
  const start = performance.now();
  let last = start;
  // The part of a pixel not yet moved. A screen that draws 120 frames a
  // second asks for a smaller share on each one, and a move of under half a
  // pixel was dropped, which left the page some pixels short of where it
  // was going.
  let carry = 0;
  const tick = (now) => {
    if (stopped) return;
    const d = delta();
    // A share of what is left on each frame, so the move slows as it lands.
    const share = reduced ? 1 : 1 - Math.exp(-(now - last) / 110);
    last = now;
    if (Math.abs(d) >= 0.5) {
      const want = d * share + carry;
      const step = Math.abs(d) < 1.5 ? Math.round(d) : Math.trunc(want);
      carry = step === Math.round(d) && Math.abs(d) < 1.5 ? 0 : want - step;
      if (step) window.scrollBy({ top: step, behavior: "instant" });
    } else carry = 0;
    // A step that is still opening when the hold ends (a sequence's last
    // step) goes on pushing the text down, so the window follows for as long
    // as there is something left to make up, and for twice the hold at most.
    const spent = now - start;
    if (spent < HOLD_MS || (Math.abs(d) >= 0.5 && spent < 2 * HOLD_MS)) raf = window.requestAnimationFrame(tick);
    else stop();
  };
  raf = window.requestAnimationFrame(tick);
  return stop;
}

/** A block that is a practice element with moments of its own, not a marker (`Await`) or a `Do`. */
function isPractice(block) {
  return React.isValidElement(block) && typeof block.type === "function" && block.type !== Do && block.type !== Await && block.type !== ReadOn;
}


function Reveal({ fade, play, children }) {
  // Decided once, when the run mounts: a run that was done on an earlier
  // visit mounts at play 0 and is simply there.
  const [animate] = useState(() => fade && play > 0);
  return animate ? <div className={styles.reveal}>{children}</div> : <>{children}</>;
}

/** The page in the address: "" for page 1, "#2", "#check". */
function pageFromHash(hash) {
  const want = decodeURIComponent(String(hash).replace(/^#/, "")).toLowerCase();
  if (want === CHECK) return CHECK;
  return /^[1-9]\d*$/.test(want) ? want : null;
}

/** Lesson 1's strip is on the page by the Check, however the reader got there. */
function RevealStrip() {
  const { reveal } = usePosition();
  useEffect(() => reveal(), [reveal]);
  return null;
}

/**
 * The prose column. The moments remount when a page is put back ("Redo this
 * page"), so their boxes empty.
 */
function Article({ children }) {
  const { version } = usePosition();
  return (
    <div className={styles.prose} key={version}>
      {children}
    </div>
  );
}

/**
 * The lesson's one way to do something again: it puts the steps on the page
 * on screen back to how the page opened, so the reader can do them and watch
 * the change a second time. It stands in the footer after Back once a step
 * on the page is done. The pages after it keep what was done on them, so
 * nothing is lost and it does not ask first.
 *
 * It replaces two controls that did nearly the same thing in two places: a
 * "Run again" under the practice element, and a Start over that cleared the
 * whole lesson and sent the reader back to page 1.
 */
function RedoPage({ onRedo }) {
  return (
    <button type="button" className={`${ls.back} ${styles.barReset}`} aria-label="Redo this page" onClick={onRedo}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
      <span className={styles.barResetLabel}>Redo this page</span>
    </button>
  );
}

/* ── The position strip ──────────────────────────────────── */

/**
 * A strip amount: no decimals when the number is whole, two when it is not
 * (a fee leaves 9,999.48).
 * `places` is decided from where the number is going, so a tween never
 * flickers between the two.
 */
const amount = (n, places) => Number(n).toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places });

/**
 * The strip's fields, in order. Wallet is always there, and so are Deposit
 * and Debt on every beginner lesson; an intermediate lesson can leave those
 * two out by starting them at null (I7 starts with no vault position).
 * Earmarked joins in lesson 5 and Fixed Yield in lesson 8, each from the
 * moment the lesson sets a number for it (null until then).
 */
const FIELDS = [
  { key: "wallet", label: "Wallet", unit: "USDC", wide: "10,000.00" },
  { key: "deposit", label: "Deposit", unit: "USDC", optional: true, wide: "10,000.00" },
  { key: "debt", label: "Debt", unit: "alUSD", optional: true, wide: "5,000.00" },
  { key: "earmarked", label: "Earmarked", unit: "alUSD", optional: true, wide: "1,000.00" },
  { key: "fixedYield", label: "Fixed Yield", unit: "alUSD", optional: true, wide: "5,000.00" },
];

/**
 * The course's position, the pinned header's second row. Its numbers tween
 * when a moment changes them, and the field that changed is lit for a moment.
 *
 * On lesson 1 it is off the page until the reader reaches the paragraph that
 * introduces it. The header then grows by the row's height, which pushes the
 * body down; when the reader has scrolled, the page is scrolled by the same
 * height in the same frame, so the text under their eyes stays where it was.
 */
function PositionStrip() {
  const { position, moved: play, play: acts, entered } = usePosition();
  const row = useRef(null);

  useLayoutEffect(() => {
    if (!entered || !row.current) return;
    const band = row.current.parentElement ?? row.current;
    if (window.scrollY > 0) window.scrollBy(0, band.offsetHeight);
  }, []);

  return (
    <div ref={row} className={`${styles.strip} ${entered ? styles.stripIn : ""}`}>
      <motion.span layout="position" transition={STRIP_GLIDE} className={styles.stripLabel}>
        Practice wallet
      </motion.span>
      <dl className={styles.stripRow} data-fields={FIELDS.filter((f) => !f.optional || position[f.key] != null).length}>
        {FIELDS.filter((f) => !f.optional || position[f.key] != null).map((f) => (
          <StripField
            key={f.key}
            label={f.label}
            unit={f.unit}
            wide={f.wide}
            value={position[f.key] ?? 0}
            // The wallet's alUSD, when it holds any, follows its USDC: "500 USDC and 5,000 alUSD".
            also={f.key === "wallet" ? position.walletAl ?? 0 : null}
            // So does its mixUSDC (I1, `walletMyt`), when a lesson gives the
            // strip that key and the wallet holds some: "0 USDC and 8,000 mixUSDC".
            alsoMyt={f.key === "wallet" ? position.walletMyt ?? null : null}
            play={play}
            name={f.key}
            acts={acts}
          />
        ))}
      </dl>
    </div>
  );
}

/* How a field moves to its new place on the rare step that changes what a
   field holds (the wallet's alUSD joining its USDC), and how long a change
   tag stays. */
const STRIP_GLIDE = { type: "spring", duration: 0.6, bounce: 0 };
const DELTA_MS = 4600;
const FLOW = {
  0: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
  2: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

/**
 * One field, label and value on one line ("Wallet 10,000 USDC"). When a
 * moment or a turned page changes the value its digits roll to the new one
 * (NumberFlow) and the number is copper for a moment.
 *
 * Every field keeps its place whatever its number is: the value's box is as
 * wide as the widest number the field holds on this track (`wide`, never
 * drawn), so a number gaining or losing digits moves nothing. After a step
 * the reader took, what the step did to the field ("+4,850") is shown on a
 * small tag right under the number, lying across the header's lower edge. It
 * takes none of the row's room, so it moves nothing either, and however long
 * it is it never meets the next field (beside the number, a tag with two
 * amounts ran into the next label).
 */
function StripField({ name, label, unit, wide = "10,000.00", value, also = null, alsoMyt = null, play, acts = 0 }) {
  // Pointing at a field does something only when a label on screen names it.
  const { setPointer } = useAppContext();
  const aim = setPointer ?? (() => {});
  const fromStrip = (p) => Boolean(p) && p.from === "strip" && p.name === name;
  const places = isWhole(value) ? 0 : 2;
  const was = useRef({ value, also, alsoMyt });
  const changed = was.current.value !== value || was.current.also !== also || was.current.alsoMyt !== alsoMyt;
  useEffect(() => {
    was.current = { value, also, alsoMyt };
  }, [value, also, alsoMyt]);
  // What follows the USDC, in order: "10,000 USDC and 8,000 mixUSDC", or with
  // both, "500 USDC, 5,000 alUSD and 8,000 mixUSDC". Each shows while the
  // wallet holds some.
  const extras = [];
  if (also > 0) extras.push({ unit: "alUSD", value: also });
  if (alsoMyt > 0) extras.push({ unit: "mixUSDC", value: alsoMyt });
  const washKey = useWash(true, play, changed);
  // What the reader's last step did to this field, for a few seconds. The
  // strip is at the top of the window and the step is taken lower down, so a
  // number changing there was missed. A turned page changes the numbers too,
  // with no tag: nothing was done.
  const seen = useRef({ acts, value, also: also ?? 0 });
  const [delta, setDelta] = useState(null);
  useEffect(() => {
    const before = seen.current;
    seen.current = { acts, value, also: also ?? 0 };
    if (acts === before.acts) {
      if (value !== before.value || (also ?? 0) !== before.also) setDelta(null);
      return;
    }
    const parts = [];
    if (Math.abs(value - before.value) >= 0.005) parts.push({ n: value - before.value, unit });
    if (Math.abs((also ?? 0) - before.also) >= 0.005) parts.push({ n: (also ?? 0) - before.also, unit: "alUSD" });
    setDelta(parts.length ? { key: acts, parts } : null);
  }, [acts, value, also, unit]);
  useEffect(() => {
    if (!delta) return undefined;
    const t = window.setTimeout(() => setDelta(null), DELTA_MS);
    return () => window.clearTimeout(t);
  }, [delta]);
  // The numbers a returning reader's saved place puts in the strip are set,
  // not rolled to: nothing happened.
  const [live, setLive] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLive(true), 900);
    return () => window.clearTimeout(t);
  }, []);
  // The unit is named on the tag only where the field shows two amounts.
  const named = extras.length > 0 || (delta ? delta.parts.length > 1 : false);
  const signed = (d) => `${d.n > 0 ? "+" : "\u2212"}${amount(Math.abs(d.n), isWhole(d.n) ? 0 : 2)}${named ? ` ${d.unit}` : ""}`;
  return (
    <motion.div
      layout="position"
      transition={STRIP_GLIDE}
      className={styles.field}
      data-point={name}
      onPointerEnter={(e) => {
        const named = e.pointerType === "mouse" ? cueOf(e.currentTarget) : null;
        if (named) aim({ ...named, from: "strip", id: labelFor(named) });
      }}
      onPointerLeave={() => aim((p) => (fromStrip(p) ? null : p))}
    >
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue} data-tint={washKey ? (washKey % 2 ? "a" : "b") : undefined}>
        <span className={styles.fieldWide} aria-hidden="true">
          {wide} <span className={styles.fieldUnit}>{unit}</span>
        </span>
        <span className={styles.fieldNow}>
          <NumberFlow className={styles.fieldFlow} value={value} format={FLOW[places]} suffix={`\u00a0${unit}`} animated={live} />
          {extras.map((x, i) => (
            <React.Fragment key={x.unit}>
              {i < extras.length - 1 ? (
                <span className={styles.fieldUnit}>,</span>
              ) : (
                <>
                  {" "}<span className={styles.fieldUnit}>and</span>
                </>
              )}{" "}
              <NumberFlow className={styles.fieldFlow} value={x.value} format={FLOW[isWhole(x.value) ? 0 : 2]} suffix={`\u00a0${x.unit}`} animated={live} />
            </React.Fragment>
          ))}
          <AnimatePresence initial={false}>
            {delta ? (
              <motion.span
                key={`delta-${delta.key}`}
                className={styles.fieldDelta}
                role="status"
                data-cue-ignore=""
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.25, delay: 0 } }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.2, delay: 0.2 }}
              >
                {delta.parts.map((d) => (
                  <span key={d.unit}>{signed(d)}</span>
                ))}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </dd>
    </motion.div>
  );
}

/**
 * A strip change a page makes itself: lesson 5's Earmarked field, which
 * joins the strip with the page that names it, and lesson 8's position set
 * back to the day of an early claim. The numbers in `set` hold from this
 * page on, in page order with the moments (see position.js); the Pager reads
 * them off the block, so this renders only a marker. `id` names it.
 */
// eslint-disable-next-line no-unused-vars
export function StripAt({ id, set }) {
  return <div className={styles.marker} aria-hidden="true" />;
}

/* ── Text that points at the practice element ───────────── */

/**
 * Instructions that go once they are done (the text has no use after the
 * step). The paragraphs inside show
 * while `moment` is not done, then fold away (height and opacity, 0.4 s;
 * at once under reduced motion) and leave nothing. A page that loads with
 * the moment done shows nothing. It gates nothing and is not a moment: the
 * Pager treats it as one block, and a marker written inside it counts as if
 * it stood after it.
 *
 *   <Do moment="max-borrow" title="Check the most you can borrow">
 *
 *   On the Borrow tab, press MAX.
 *
 *   </Do>
 *
 * `title` names the step in a few words. It is the line the step's text
 * folds to once the step is done (see `StepGroup`).
 */
export function Do({ moment, title = null, children }) {
  const { done } = usePosition();
  // "Step 1 of 2" on a page with more than one step, "Try it" on a page with one.
  const steps = useContext(StepsContext);
  const at = steps.findIndex((s) => s.id === moment);
  const label = steps.length > 1 && at >= 0 ? `Step ${at + 1} of ${steps.length}` : "Try it";
  const isDone = Boolean(done[moment]);
  // The instruction stays in its run. The run folds to a line once the step
  // is done (`StepGroup`), and a reader who opens the line again finds the
  // instruction where it was, marked done.
  return (
    <div className={`${styles.do} ${isDone ? styles.doDone : ""}`}>
      <div className={styles.doBody} data-step-title={title ?? undefined}>
        <div className={styles.doLabel}>
          {label}
          {isDone ? " · done" : ""}
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * The end of one part of a page that is read, not acted on: a Continue
 * button, and the blocks after it wait for the press.
 *
 * A page that explains (what a redemption is, then what sets its rate) was
 * one long column of text beside its figure. Cut into parts, the reader has
 * one part in front of them at a time. Pressing Continue folds the part
 * just read to a line with a tick and its `title`, as a finished step's
 * text folds (`StepGroup`), and brings in the next. `moment` is the part's
 * id in the store, listed with the lesson's moments in its page file.
 *
 *   A redemption removes MYT from your deposit ...
 *
 *   <ReadOn moment="read-redemptions" title="What a redemption does" />
 *
 *   How fast redemptions pay your loan down ...
 *
 * With no `title` and nothing before it, it is the Continue after an element
 * that is stepped through (lesson 7's liquidation): the press folds the
 * element's steps, and the line they fold to is the element's own.
 */
export function ReadOn({ moment }) {
  const m = useMoment(moment);
  useFooterAction(
    moment,
    m.done
      ? null
      : {
          label: "Continue",
          kind: "read",
          onPress: () => {
            m.apply({ ...m.position });
            // Once the part just read has folded, see the next one into the window.
            window.setTimeout(settleRead, FOLD_S * 1000 + 80);
          },
        },
  );
  return null;
}

/**
 * After a Continue: bring the part it revealed into the window.
 *
 * The part just read folds to a line, so the next part starts higher than
 * the button that was pressed. A reader who had scrolled down to that button
 * would be left looking at the foot of the new part, or past it. And a part
 * a little taller than what is left of the window had its own Continue cut
 * through by the footer. So the window is moved up until the part's first
 * line is under the header (with room for the line of the part before it),
 * or down until its last line is over the footer, and never so far down that
 * its first line leaves.
 */
function settleRead() {
  const main = document.querySelector("main");
  if (!main) return;
  const parts = [...main.querySelectorAll(`.${styles.group}:not(.${styles.groupPast})`)].filter((g) => g.getClientRects().length > 0 && g.offsetHeight > 0);
  const part = parts[parts.length - 1];
  if (!part) return;
  const room = roomNow();
  const top = room.top + 12;
  const foot = room.bottom - 16;
  const r = part.getBoundingClientRect();
  // Up when the part's first line is under the header (to where the line of
  // the part before it shows too); otherwise down by what is under the footer.
  let move = 0;
  if (r.top < top) move = r.top - (top + 44);
  else if (r.bottom > foot) move = Math.min(r.bottom - foot, r.top - top);
  move = wholeLines(move, r.top - top);
  if (Math.abs(move) < 1) {
    // The part shows where the page is. The fold made the page shorter,
    // though, and a page that was scrolled further than it now goes is left
    // where it ends, which can be with the breadcrumb or the title cut
    // through by the header. On down until the line is out, if the page goes
    // that far; otherwise back up until it shows whole.
    const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    const down = wholeLines(0.01, r.top - top);
    move = down > 1 && down <= left ? down : wholeLines(-0.01);
    if (Math.abs(move) < 1) return;
  }
  const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollBy({ top: move, behavior: still ? "instant" : "smooth" });
}

/** Whether a part mounted less than half a second ago: nobody has acted on the page yet. */
const justBorn = (born) => born.current === 0 || Date.now() - born.current < 500;

/**
 * Fold a block to no height over `seconds`, ending on exactly the layout the
 * page has once the block is gone.
 *
 * Folding the height alone left a snap at the end (20px in one frame after
 * every `Do`): while the block is on the
 * page, even at no height, the margins above and below it stay apart, and the
 * moment it is removed they collapse into one, so everything under it moved
 * up by the smaller margin. So the two layouts are measured first, the block
 * at no height and the block gone, and the fold takes the difference off as a
 * bottom margin while it runs. The measuring happens before the browser
 * paints, so none of it shows.
 */
function foldOut(el, seconds, ease = "ease") {
  // What sits under the block: the next thing in the page that has a box.
  // A block that is the last child of its parent (a lesson control at the
  // foot of a stage) looks past the parent, because the margins under it
  // collapse through the parent's foot, and measuring the parent's own foot
  // left 32px to go in one frame at the end. Failing all that, the foot of
  // the block's parent.
  const boxed = (node) => {
    let n = node;
    while (n && n.offsetHeight === 0) n = n.nextElementSibling;
    return n;
  };
  let under = boxed(el.nextElementSibling);
  for (let up = el.parentElement; !under && up && !up.matches("main"); up = up.parentElement) under = boxed(up.nextElementSibling);
  const edge = () => (under ? under.getBoundingClientRect().top : el.parentElement.getBoundingClientRect().bottom);
  const before = edge();
  // Its own formatting context from here on, so its children's margins are
  // inside the height that folds. A block that was not one already (a lesson
  // control's row) would shift as it becomes one; a top margin puts it back.
  el.style.overflow = "hidden";
  const shift = before - edge();
  if (Math.abs(shift) > 0.5) el.style.marginTop = `${shift}px`;
  const full = el.offsetHeight;
  el.style.height = "0px";
  const folded = edge();
  el.style.display = "none";
  const gone = edge();
  el.style.display = "";
  el.style.height = `${full}px`;
  void el.offsetHeight;
  el.style.transition = `height ${seconds}s ${ease}, margin ${seconds}s ${ease}, opacity ${Math.max(seconds - 0.1, 0.1)}s ease`;
  el.style.height = "0px";
  el.style.marginTop = "0px";
  // `folded` was measured with the top margin above still on; it eases to
  // nothing too, so the bottom margin makes up for both.
  el.style.marginBottom = `${gone - folded + (Math.abs(shift) > 0.5 ? shift : 0)}px`;
}

/**
 * A part of a practice element that goes once it has been used, such as a
 * lesson control ("Apply a 10% loss") after its one press. It fades, then its
 * row folds to no height, so what is under the element slides up instead of
 * snapping (any change to an element's size is animated; removing a control's
 * row outright moved the page 60px in one frame). At once under reduced motion.
 * A part that was already gone when the page loaded draws nothing.
 *
 *   <FoldAway show={phase === 0}>
 *     <LessonControl onClick={run}>Apply a 10% loss</LessonControl>
 *   </FoldAway>
 */
export function FoldAway({ show, instant = false, seconds = 0.3, className = undefined, children }) {
  const reduced = useReducedMotion();
  const box = useRef(null);
  const [mounted, setMounted] = useState(show);
  const born = useRef(0);
  useEffect(() => {
    born.current = Date.now();
  }, []);
  useIsoLayoutEffect(() => {
    if (show) {
      if (!mounted) setMounted(true);
      return undefined;
    }
    if (!mounted) return undefined;
    const el = box.current;
    // Gone within a moment of the page loading: it was used on an earlier
    // visit, so it simply is not there. `instant` says the same of a part
    // that goes for another reason than the reader's last action.
    if (reduced || !el || instant || justBorn(born)) {
      setMounted(false);
      return undefined;
    }
    el.style.transition = "opacity 0.18s ease";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    const fold = window.setTimeout(() => foldOut(el, seconds), 190);
    const gone = window.setTimeout(() => setMounted(false), 210 + seconds * 1000);
    return () => {
      window.clearTimeout(fold);
      window.clearTimeout(gone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);
  if (!mounted) return null;
  return (
    <div ref={box} className={className} aria-hidden={show ? undefined : true} data-folding={show ? undefined : ""}>
      {children}
    </div>
  );
}

/**
 * A stat's name in the text that lights the same stat on the practice
 * element. A dotted underline in copper, apart from
 * a `Term`'s grey one. Pointing at it (hover, keyboard focus, or a tap on a
 * touch screen) lights whatever carries that name on the page on screen
 * (`data-tile` or `data-point`) and the matching field in the strip, and
 * pointing at the thing lights this. `name` is a tile ("apr", "deposit",
 * "debt", "health", "earmarked", "redemption", "borrowable", "ltv"),
 * "wallet", a part of the practice element ("field", "max-button",
 * "available", "action", "bar", "max", "liq", "tab-borrow"), or a part of a
 * figure or a capture (its `spots`).
 *
 *   Deposit fell by 208 plus 0.52, so <Stat name="deposit">Deposit</Stat> reads 9,791.48.
 *
 * A sentence about a what-if copy, whose numbers are not the wallet's,
 * aims the Stat at the figure. `figure` lights the
 * page's figures and leaves the strip alone. `scope` lights only the part
 * of a figure wrapped in AppMock's `<StatScope name="...">`, for a figure
 * that draws the vault twice:
 *
 *   On the copy, <Stat name="ltv" figure>LTV</Stat> reads 55.55%.
 *   After the loss, <Stat name="deposit" scope="after">Deposit</Stat> reads 9,000.
 *
 * A figure built in a moments file lights through AppMock's `usePointed()`
 * (`pointed("ltv")`), which follows the aim; one that still compares
 * `stat === "ltv"` lights for `figure` but ignores `scope`.
 */
/** Bring the thing a label names into the window, when none of it is between the header and the footer. */
function showThing(key) {
  const things = [...document.querySelectorAll("[data-cue-key]")].filter((el) => !el.hasAttribute("data-stat") && el.getAttribute("data-cue-key") === key);
  if (!things.length || things.some((el) => el.closest("header"))) return;
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const top = header ? header.getBoundingClientRect().bottom : 0;
  const bottom = footer ? footer.getBoundingClientRect().top : window.innerHeight;
  const seen = things.some((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > top + 8 && r.top < bottom - 8;
  });
  if (seen) return;
  const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  things[0].scrollIntoView({ block: "center", behavior: still ? "instant" : "smooth" });
}

export function Stat({ name, figure = false, scope = null, children }) {
  const { pointer, setPointer } = useAppContext();
  const id = useId();
  const aim = scope ?? (figure ? "figure" : null);
  // Lit while it is pointed at, and while the thing it names is pointed at
  // on the element or the strip. A name written more than once on a page
  // lights only the label under the pointer (or, from the thing, the one
  // label the frame picks, `labelFor`): the others would pull the eye to
  // themselves for nothing.
  const mine = (p) => Boolean(p) && p.name === name && p.scope === aim && (p.id == null || p.id === id);
  const on = mine(pointer);
  const touch = useRef(false);
  const lit = useRef(false);
  const ref = useRef(null);
  const set = setPointer ?? (() => {});
  const point = () => set({ name, scope: aim, id });
  const unpoint = () => set((p) => (mine(p) ? null : p));
  // A tap lights it until the next tap anywhere else.
  useEffect(() => {
    if (!on || !touch.current) return undefined;
    const away = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        touch.current = false;
        unpoint();
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, name, aim, set]);
  return (
    <span
      ref={ref}
      className={`${styles.stat} ${on ? styles.statOn : ""}`}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      data-stat={name}
      data-stat-scope={aim ?? undefined}
      data-stat-id={id}
      onPointerDown={(e) => {
        touch.current = e.pointerType !== "mouse";
        // Whether it was lit before this tap: the tap's own focus lights it
        // before the click arrives, so the click cannot ask.
        lit.current = on;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") point();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") unpoint();
      }}
      onFocus={point}
      onBlur={() => {
        if (!touch.current) unpoint();
      }}
      onClick={() => {
        if (!touch.current) return;
        // A tap lights it, and a tap on one already lit puts it out. On a
        // touch screen the element is under or over the text, often out of
        // the window: the tap that lights a label brings the thing it names
        // into view.
        if (lit.current) {
          unpoint();
          return;
        }
        point();
        window.requestAnimationFrame(() => showThing(`${name}|${aim ?? ""}`));
      }}
    >
      <span className={styles.statText}>{children}</span>
    </span>
  );
}

/**
 * A quiet panel for text about the course rather than about Alchemix, such
 * as lesson 1's paragraph on how the track works. The text
 * column's width, a hairline border on a slightly raised ground, and a small
 * label.
 *
 *   <Intro>
 *
 *   Every step uses the practice wallet at the top of the page...
 *
 *   </Intro>
 */
/**
 * A short heading inside a page, over the few paragraphs it names (long
 * runs of paragraphs read as walls of text). A block
 * like any paragraph, so it waits on a moment the same way.
 *
 *   <Sub>Redemptions</Sub>
 */
export function Sub({ children }) {
  return <h3 className={styles.sub}>{children}</h3>;
}

export function Intro({ label = "How this track works", children }) {
  return (
    <aside className={styles.intro} aria-label={label}>
      <div className={styles.introLabel}>{label}</div>
      {children}
    </aside>
  );
}

/**
 * Where lesson 1's strip comes in: a marker after the paragraph that
 * introduces the course's 10,000 USDC. Once it is in the window, or already
 * above it, the strip appears.
 */
export function StripAppears() {
  const { shown, reveal } = usePosition();
  const ref = useRef(null);
  useEffect(() => {
    if (shown || !ref.current || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) reveal();
      },
      // Any of it in the window counts. A short page (lesson 1's second, at a
      // desktop height) cannot scroll the marker far above the window's foot.
      { threshold: 0 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown, reveal]);
  return <div ref={ref} className={styles.marker} aria-hidden="true" />;
}

/**
 * Nothing app-sized is taller than the room between the pinned header and
 * the pinned footer, where a small shrink will do it. Unshrunk, the vault
 * page capture ran past a 1194px window, so no scroll position showed it
 * whole, and at 900px the practice vault did the same. The stage
 * measures itself at full size against that room (less a little air above
 * and below) and zooms down to fit, keeping its proportions; where it fits
 * already it is left alone. `zoom` rather than a transform, so the page lays
 * out around the smaller box. Measured again whenever the stage or the
 * window changes size: a moment that reveals its figures grows, a reader
 * who turns a phone changes the room.
 *
 * The shrink stops at FIT_FLOOR. Without a floor, Yield Looping came out
 * at 73% with 8.8px labels at 1440x900; past about 90%
 * the text gets too small to read, so a taller stage stays at 90% and the
 * page scrolls. A zoomed stage is widened by the same factor (`--fit`, see
 * `.stage`), so it still spans the column instead of ending short of its
 * right edge.
 */
const FIT_FLOOR = 0.9;

/**
 * What a practice element needs under itself for its text to start in the
 * window: the space under it and about three lines.
 */
const UNDER = 170;

/** What an element beside its text keeps under itself: a little air over the footer. */
const UNDER_BESIDE = 16;

/**
 * Whether the stage's practice vault has folded its used tabs and panel
 * away, and whether that happened in front of the reader (`live`) or was
 * simply so when the page was drawn. Outside a stage nothing folds.
 */
const FoldedContext = createContext({ folded: false, live: false });

/** How long a used panel takes to fold: it is over 300px tall, and at a lesson control's 0.3s it snapped shut. */
const FOLD_PANEL = 0.45;

/** What the practice vault wraps its tabs and panel in (the app context's `Fold`). */
function StageFold({ children }) {
  const { folded, live } = useContext(FoldedContext);
  return (
    <FoldAway show={!folded} instant={!live} seconds={FOLD_PANEL}>
      {children}
    </FoldAway>
  );
}

/**
 * `folded` (a ref) says the stage has folded part of itself away; its full
 * height is then the last one measured before the fold, so the zoom and the
 * answer do not change because of the fold itself. `onShort` is told whether
 * the stage at full height, with the start of the text under it, is more
 * than the room.
 */
function useFitRoom(folded = null, onShort = null, side = false) {
  const ref = useRef(null);
  const full = useRef(0);
  // Beside its text an element needs no room under itself for the text, only
  // to fit between the header and the footer.
  const under = side ? 0 : UNDER;
  const spare = side ? 0 : 24;
  // The footer arrives once the pager has counted the pages, and the strip
  // joins the header part way through lesson 1. Neither changes the stage's
  // own size, so the frame says when they come and go and the room is
  // measured again.
  const frame = useContext(PagerContext)?.frame ?? "";
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    let raf = 0;
    const set = (z) => {
      el.style.zoom = z === 1 ? "" : String(z);
      if (z === 1) el.style.removeProperty("--fit");
      else el.style.setProperty("--fit", String(z));
    };
    const fit = () => {
      raf = 0;
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      // The part of the header that stays pinned: all of it, or in a short
      // window its strip alone (the Shell pins it at a negative `top`).
      const pinned = header ? Math.max(0, header.getBoundingClientRect().height + Math.min(0, parseFloat(getComputedStyle(header).top) || 0)) : 0;
      // Beside its text the element starts under the room the page keeps
      // over its breadcrumb (the body's padding), then the row's breadcrumb
      // and title, so its size is worked out for the room under them: an
      // element that can fit there is whole when the page opens, without a
      // scroll.
      const page = side ? el.closest(`.${styles.body}`) : null;
      const over = Math.max(BENCH_GAP, page ? parseFloat(getComputedStyle(page).paddingTop) || 0 : 0);
      const room = window.innerHeight - pinned - (footer ? footer.getBoundingClientRect().height : 0) - (side ? over + UNDER_BESIDE : 24);
      const bench = side ? el.closest("[data-bench]") : null;
      const headBox = bench ? bench.querySelector(`:scope > .${styles.benchHead}`) : null;
      const head = headBox ? headBox.getBoundingClientRect().height : 0;
      const current = Number(el.style.zoom) || 1;
      const isFolded = Boolean(folded && folded.current);
      // A phone keeps the app's own tall layout and scrolls it, as the app
      // does (the kit switches to its narrow figures under 640px).
      if (room <= 0 || window.innerWidth < 640) {
        if (current !== 1) set(1);
        const tall = el.getBoundingClientRect().height;
        if (tall && !isFolded) full.current = tall;
        if (onShort && room > 0 && full.current) onShort(full.current + under > room + spare);
        return;
      }
      // The height at full size and the column's width, so the answer does
      // not depend on the zoom it had (a widened stage is a little shorter,
      // and measuring that would let the zoom drift back and forth).
      let natural = full.current;
      if (!isFolded || !natural) {
        if (current !== 1) set(1);
        natural = el.getBoundingClientRect().height;
        if (!natural) {
          if (current !== 1) set(current);
          return;
        }
        if (!isFolded) full.current = natural;
      }
      const next = Math.max(FIT_FLOOR, Math.min(1, Math.floor(((room - head) / natural) * 1000) / 1000));
      const zoom = Math.abs(next - current) < 0.003 ? current : next;
      set(zoom);
      if (onShort) onShort(natural * zoom + under > room + spare);
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(fit);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    for (const bar of document.querySelectorAll("header, footer")) ro.observe(bar);
    window.addEventListener("resize", schedule);
    fit();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [frame, side]);
  return ref;
}

/**
 * App-sized things (a capture of the app, a practice vault) break out of the
 * text column into the wider stage, so they read at the app's own scale,
 * and never taller than the window's room (`useFitRoom`).
 */
export function Stage({ children }) {
  const finished = useContext(StepContext);
  const { play } = usePosition();
  const [short, setShort] = useState(false);
  const folded = finished && short;
  const foldedRef = useRef(folded);
  foldedRef.current = folded;
  // The fold is shown as it happens only when the reader's own action
  // finished the element. One that is finished when the page is drawn, or
  // when its page is turned to, is simply folded.
  const was = useRef({ finished, play });
  const live = useRef(false);
  if (was.current.finished !== finished) {
    live.current = finished && play !== was.current.play;
    was.current = { finished, play };
  } else if (!finished) {
    was.current.play = play;
  }
  const side = useContext(BenchContext);
  const ref = useFitRoom(foldedRef, setShort, side);
  const fold = useMemo(() => ({ folded, live: live.current }), [folded]);
  return (
    <FoldedContext.Provider value={fold}>
      <div ref={ref} className={styles.stage}>
        {children}
      </div>
    </FoldedContext.Provider>
  );
}

/**
 * A real capture of the app, the width of the stage, with the draft's caption
 * as its foot. `name` is a key of the kit's SHOTS.
 */
export function Shot({ name, column = false, children }) {
  // `column` keeps a narrow capture (the Swap card) at a reading width on
  // the column's left edge, where it sits at its own size instead of
  // floating small in the middle of the stage.
  const side = useContext(BenchContext);
  const ref = useFitRoom(null, null, side);
  return (
    <div ref={ref} className={`${column ? styles.column : styles.stage} ${styles.shot}`}>
      <AppShot shot={SHOTS[name]} label={null}>
        {children}
      </AppShot>
    </div>
  );
}
Shot.figure = true;
