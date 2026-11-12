import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import AcademyShell from "../Shell";
import TrackClosed from "../TrackClosed";
import { PreviewBanner, PreviewFooter } from "../LessonPage";
import lp from "../LessonPage/styles.module.css";
import ls from "../lesson.module.css";
import { AppShot, Arrow, ChoiceCheckpoint, LessonProvider, SHOTS } from "../kit";
import { useReducedMotion, useTween } from "../AppMock/motion";
import { AppContextProvider, SLOW_TWEEN, isWhole, useAppContext, useWash } from "../AppMock";
import { apiBase, hasCompletion, readCompletions } from "../lib/api";
import { currentLesson, lessonById, nextLesson, trackByKey } from "../lib/track";
import { PageContext, PositionProvider, usePosition } from "./position";
import styles from "./styles.module.css";

export { usePosition, useMoment, useMomentNote } from "./position";

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
  const { shown, done: moments, notes, setPage: positionPage } = usePosition();
  const [done, setDone] = useState(false);
  // The stat the reader is pointing at in the text (`Stat`), for every
  // practice element and the strip to light: `{ name, scope }`, where scope
  // is null (everywhere), "figure" (the figures, not the strip) or the name
  // of a `StatScope` (see AppMock's usePointed).
  const [pointer, setPointer] = useState(null);
  const app = useMemo(
    () => ({ stat: pointer ? pointer.name : null, statIn: pointer ? pointer.scope : null, pointer, setPointer, hints: false, auto: true, slow: true }),
    [pointer],
  );
  const [ahead, setAhead] = useState(null);

  // Read after mount: the page is prerendered, and the first frame is the
  // ordinary interactive lesson (see LessonPage).
  useEffect(() => {
    if (!isBrowser) return;
    const finished = hasCompletion(lessonId);
    if (finished) setDone(true);
    const current = finished ? null : currentLesson(Object.keys(readCompletions()), lessonId);
    setAhead(current && current.id !== lessonId ? current : null);
  }, [isBrowser, lessonId]);

  const preview = Boolean(ahead);

  // The page on screen: "1", "2", ... or "check". `total` is the number of
  // content pages, which the MDX's wrapper counts once it has rendered.
  const [page, setPage] = useState("1");
  const [total, setTotal] = useState(null);
  // The Check mounts the first time it is reached and stays, so going Back
  // to read a page does not cost the reader their questions.
  const [checkSeen, setCheckSeen] = useState(false);
  // What the Check reports for the footer's button: whether an answer can be
  // sent, and the submit the Check's own button would have called.
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
  const reason = pending ? notes[pending.id] ?? pending.hint ?? "Finish the step above to continue" : null;

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

  useEffect(() => {
    if (page === CHECK) setCheckSeen(true);
  }, [page]);

  // replaceState rather than the router, which would treat the hash as an
  // anchor to scroll to. Page 1 keeps the plain address.
  const go = (p) => {
    turned.current = true;
    setPage(p);
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}${p === "1" ? "" : `#${p}`}`);
    window.scrollTo(0, 0);
  };

  const footer = preview || !total ? null : (
    <FooterBar
      onBack={page === "1" ? null : () => go(page === CHECK ? String(total) : String(Number(page) - 1))}
      place={`${place} of ${total + 1}`}
      reason={reason}
      action={
        page === CHECK ? (
          <CheckAction check={check} done={done} next={next && next.track === lesson.track ? next : null} finish={track?.finish ?? null} />
        ) : (
          <button
            type="button"
            className={ls.primary}
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
      left={
        <Link to="/academy" className={lp.back}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H6M11 18l-6-6 6-6" />
          </svg>
          <span className={lp.backLesson}>
            <span className={`${lp.backTrack} ${styles.headTrack}`}>{track ? track.label : "Academy"}</span>
            <span className={`${lp.backSep} ${styles.headTrack}`}> · </span>
            Lesson {lesson.n}
          </span>
          <span className={`${lp.divider} ${styles.headDivider}`} />
          <span className={`${lp.backTitle} ${styles.headTitle}`}>{lesson.title}</span>
        </Link>
      }
    >
      <main className={styles.body}>
        {preview ? <PreviewBanner lesson={lesson} current={ahead} /> : null}

        {/* The title on page 1. After it the header names the lesson, and the
            heading stays for a screen reader only. */}
        <h1 className={preview || page === "1" ? styles.title : styles.srOnly}>{lesson.title}</h1>

        {page === CHECK ? <RevealStrip /> : null}

        <PagerContext.Provider value={{ page, setTotal, setPages: onPages, preview, frame: `${Boolean(footer)}|${shown}` }}>
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

        {preview ? <PreviewFooter current={ahead} /> : <StartOver onReset={() => go("1")} />}
      </main>
    </AcademyShell>
    </AppContextProvider>
  );
}

/* ── The footer ──────────────────────────────────────────── */

/**
 * One row: the quiet Back, the page's place, the page's one action. `reason`
 * is the one line beside a switched-off Next that says what still has to
 * happen ("Press Repay to continue").
 */
export function FooterBar({ onBack, place, action, reason = null }) {
  return (
    <div className={styles.bar}>
      <span className={styles.barLeft}>
        {onBack ? (
          <button type="button" className={`${ls.back} ${styles.barBack}`} onClick={onBack}>
            Back
          </button>
        ) : null}
      </span>
      <span className={styles.barPlace}>{place}</span>
      <span className={styles.barRight}>
        {reason ? <span className={styles.barReason}>{reason}</span> : null}
        {action}
      </span>
    </div>
  );
}

/**
 * The Check page's action. "Check my answer" sends the answers the reader
 * picked, through the Check's own submit. Once the lesson is passed it is
 * the way on: the next lesson, or after a track's last lesson the track's
 * finish page (`finish`, from track.js), or the map for a track without one
 * (the beginner track's lesson 8 does not run on into the intermediate
 * track). A reader back on a lesson they passed earlier, who picks a new
 * answer for every question, gets "Check my answer" again.
 */
function CheckAction({ check, done, next, finish = null }) {
  if (check?.canSend) {
    return (
      <button type="button" className={ls.primary} onClick={() => check.submit()}>
        Check my answer
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
  const { page, setTotal, setPages, preview } = useContext(PagerContext);
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
  return pages.map((p, i) => (
    <PageContext.Provider key={i} value={i + 1}>
      <div className={styles.page} hidden={preview ? undefined : page !== String(i + 1)}>
        {i > 0 && p.title ? <h2 className={styles.title}>{p.title}</h2> : null}
        {preview ? p.blocks : <Gated blocks={p.blocks} done={done} play={play} />}
      </div>
    </PageContext.Provider>
  ));
}

/** A block's position events: `{ moment }` for each moment, `{ strip, set }` for a StripAt. */
function eventsOf(block) {
  if (React.isValidElement(block) && block.type === StripAt) return [{ strip: block.props.id ?? "", set: block.props.set ?? {} }];
  return momentsOf(block).map((m) => ({ moment: m.id }));
}

/**
 * A page's blocks, cut after each moment. The run up to and including the
 * first moment is always on the page; every run after a moment is off the
 * page until that moment is done (an element with two moments gates on its
 * last). A run that arrives because the reader
 * just acted fades in (`play` counts actions in this visit, never a load,
 * so a reload shows what was done with no fade). A marker like StripAt has
 * no `moment` static, so nothing waits on it.
 */
function Gated({ blocks, done, play }) {
  const runs = [{ gate: null, blocks: [] }];
  blocks.forEach((b) => {
    runs[runs.length - 1].blocks.push(b);
    const ms = momentsOf(b);
    if (ms.length) runs.push({ gate: ms[ms.length - 1].id, blocks: [] });
  });
  return runs.map((r, i) => {
    if (!r.blocks.length || (r.gate && !done[r.gate])) return null;
    return (
      <Reveal key={i} fade={Boolean(r.gate)} play={play}>
        {r.blocks}
      </Reveal>
    );
  });
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

/** The prose column. The moments remount on Start over, so their boxes empty. */
function Article({ children }) {
  const { version } = usePosition();
  return (
    <div className={styles.prose} key={version}>
      {children}
    </div>
  );
}

/**
 * Puts the lesson's position back to its start, in the map's quiet restart
 * style, and the reader back on page 1.
 */
function StartOver({ onReset }) {
  const { started, reset } = usePosition();
  if (!started) return null;
  return (
    <div className={styles.foot}>
      <button
        type="button"
        className={styles.reset}
        onClick={() => {
          reset();
          onReset();
        }}
      >
        Start over
      </button>
    </div>
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
  { key: "wallet", label: "Wallet", unit: "USDC" },
  { key: "deposit", label: "Deposit", unit: "USDC", optional: true },
  { key: "debt", label: "Debt", unit: "alUSD", optional: true },
  { key: "earmarked", label: "Earmarked", unit: "alUSD", optional: true },
  { key: "fixedYield", label: "Fixed Yield", unit: "alUSD", optional: true },
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
  const { position, moved: play, entered } = usePosition();
  // A Stat aimed at a figure (`figure`, `scope`) leaves the strip alone.
  const { stat, statIn } = useAppContext();
  const row = useRef(null);

  useLayoutEffect(() => {
    if (!entered || !row.current) return;
    const band = row.current.parentElement ?? row.current;
    if (window.scrollY > 0) window.scrollBy(0, band.offsetHeight);
  }, []);

  return (
    <div ref={row} className={`${styles.strip} ${entered ? styles.stripIn : ""}`}>
      <span className={styles.stripLabel}>Practice wallet</span>
      <dl className={styles.stripRow}>
        {FIELDS.filter((f) => !f.optional || position[f.key] != null).map((f) => (
          <StripField
            key={f.key}
            label={f.label}
            unit={f.unit}
            value={position[f.key] ?? 0}
            // The wallet's alUSD, when it holds any, follows its USDC: "500 USDC and 5,000 alUSD".
            also={f.key === "wallet" ? position.walletAl ?? 0 : null}
            // So does its mixUSDC (I1, `walletMyt`), when a lesson gives the
            // strip that key and the wallet holds some: "0 USDC and 8,000 mixUSDC".
            alsoMyt={f.key === "wallet" ? position.walletMyt ?? null : null}
            play={play}
            pointed={statIn == null && stat === f.key}
          />
        ))}
      </dl>
    </div>
  );
}

/**
 * One field, label and value on one line ("Wallet 10,000 USDC"). The value
 * tweens over 1.6 seconds when a moment or a turned page changes it, and the
 * field takes the same copper wash as a practice vault tile, held and then
 * faded over 3 seconds (a shorter wash was too fast to register). `pointed`
 * lights it while the reader points at its name in the text (`Stat`).
 */
function StripField({ label, unit, value, also = null, alsoMyt = null, play, pointed = false }) {
  const shown = useTween(value, play, SLOW_TWEEN);
  const shownAl = useTween(also ?? 0, play, SLOW_TWEEN);
  const shownMyt = useTween(alsoMyt ?? 0, play, SLOW_TWEEN);
  const places = isWhole(value) ? 0 : 2;
  const placesAl = isWhole(also ?? 0) ? 0 : 2;
  const placesMyt = isWhole(alsoMyt ?? 0) ? 0 : 2;
  const was = useRef({ value, also, alsoMyt });
  const changed = was.current.value !== value || was.current.also !== also || was.current.alsoMyt !== alsoMyt;
  useEffect(() => {
    was.current = { value, also, alsoMyt };
  }, [value, also, alsoMyt]);
  // What follows the USDC, in order: "10,000 USDC and 8,000 mixUSDC", or with
  // both, "500 USDC, 5,000 alUSD and 8,000 mixUSDC". Each shows while the
  // wallet holds some, or while its number is still tweening down to 0.
  const extras = [];
  if (also > 0 || (also != null && Math.round(shownAl) > 0)) extras.push({ unit: "alUSD", shown: shownAl, places: placesAl });
  if (alsoMyt > 0 || (alsoMyt != null && Math.round(shownMyt) > 0)) extras.push({ unit: "mixUSDC", shown: shownMyt, places: placesMyt });
  const washKey = useWash(true, play, changed);
  return (
    <div className={`${styles.field} ${pointed ? styles.fieldPointed : ""}`}>
      {washKey ? <span key={washKey} className={styles.fieldWash} aria-hidden="true" /> : null}
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>
        {amount(shown, places)} <span className={styles.fieldUnit}>{unit}</span>
        {extras.map((x, i) => (
          <React.Fragment key={x.unit}>
            {i < extras.length - 1 ? (
              <span className={styles.fieldUnit}>,</span>
            ) : (
              <>
                {" "}<span className={styles.fieldUnit}>and</span>
              </>
            )}{" "}
            {amount(x.shown, x.places)} <span className={styles.fieldUnit}>{x.unit}</span>
          </React.Fragment>
        ))}
      </dd>
    </div>
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
 *   <Do moment="max-borrow">
 *
 *   On the Borrow tab, press MAX.
 *
 *   </Do>
 */
export function Do({ moment, children }) {
  const { done } = usePosition();
  const reduced = useReducedMotion();
  const isDone = Boolean(done[moment]);
  // "shown", "going" (folding away) or "gone". Decided at mount from the
  // store, so a reload with the moment done draws nothing.
  const [phase, setPhase] = useState(isDone ? "gone" : "shown");
  const box = useRef(null);
  const born = useRef(0);
  useEffect(() => {
    born.current = Date.now();
  }, []);
  useIsoLayoutEffect(() => {
    if (!isDone) {
      if (phase !== "shown") setPhase("shown");
      return undefined;
    }
    if (phase !== "shown") return undefined;
    const el = box.current;
    // A moment that is done within a moment of the page loading was done on
    // an earlier visit (the store restores just after mount): no fold then.
    if (reduced || !el || justBorn(born)) {
      setPhase("gone");
      return undefined;
    }
    foldOut(el, 0.4);
    el.style.opacity = "0";
    setPhase("going");
    const t = window.setTimeout(() => setPhase("gone"), 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);
  if (phase === "gone") return null;
  return (
    <div ref={box} className={styles.do} aria-hidden={phase === "going" ? true : undefined}>
      {children}
    </div>
  );
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
function foldOut(el, seconds) {
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
  el.style.transition = `height ${seconds}s ease, margin ${seconds}s ease, opacity ${Math.max(seconds - 0.1, 0.1)}s ease`;
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
export function FoldAway({ show, children }) {
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
    // visit, so it simply is not there.
    if (reduced || !el || justBorn(born)) {
      setMounted(false);
      return undefined;
    }
    el.style.transition = "opacity 0.18s ease";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    const fold = window.setTimeout(() => foldOut(el, 0.3), 190);
    const gone = window.setTimeout(() => setMounted(false), 510);
    return () => {
      window.clearTimeout(fold);
      window.clearTimeout(gone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);
  if (!mounted) return null;
  return (
    <div ref={box} aria-hidden={show ? undefined : true}>
      {children}
    </div>
  );
}

/**
 * A stat's name in the text that lights the same stat on the practice
 * element. A dotted underline in copper, apart from
 * a `Term`'s grey one. Pointing at it (hover, keyboard focus, or a tap on a
 * touch screen) outlines the matching tile on every practice vault on the
 * page and the matching field in the strip. `name` is a tile ("apr",
 * "deposit", "debt", "health", "earmarked", "redemption", "borrowable",
 * "ltv"), "wallet", "available" (the Withdraw tab's Available line),
 * "manage" (the Dashboard row's button), "maxltv" or "liqltv" (the health
 * bar's markers).
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
export function Stat({ name, figure = false, scope = null, children }) {
  const { pointer, setPointer } = useAppContext();
  const aim = scope ?? (figure ? "figure" : null);
  const mine = (p) => Boolean(p) && p.name === name && p.scope === aim;
  const on = mine(pointer);
  const touch = useRef(false);
  const ref = useRef(null);
  const set = setPointer ?? (() => {});
  const point = () => set({ name, scope: aim });
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
      onPointerDown={(e) => {
        touch.current = e.pointerType !== "mouse";
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
        if (touch.current) set((p) => (mine(p) ? null : { name, scope: aim }));
      }}
    >
      {children}
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

function useFitRoom() {
  const ref = useRef(null);
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
      const room =
        window.innerHeight -
        (header ? header.getBoundingClientRect().height : 0) -
        (footer ? footer.getBoundingClientRect().height : 0) -
        24;
      const current = Number(el.style.zoom) || 1;
      // A phone keeps the app's own tall layout and scrolls it, as the app
      // does (the kit switches to its narrow figures under 640px).
      if (room <= 0 || window.innerWidth < 640) {
        if (current !== 1) set(1);
        return;
      }
      // The height at full size and the column's width, so the answer does
      // not depend on the zoom it had (a widened stage is a little shorter,
      // and measuring that would let the zoom drift back and forth).
      if (current !== 1) set(1);
      const natural = el.getBoundingClientRect().height;
      if (!natural) return;
      const next = Math.max(FIT_FLOOR, Math.min(1, Math.floor((room / natural) * 1000) / 1000));
      set(Math.abs(next - current) < 0.003 ? current : next);
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
  }, [frame]);
  return ref;
}

/**
 * App-sized things (a capture of the app, a practice vault) break out of the
 * text column into the wider stage, so they read at the app's own scale,
 * and never taller than the window's room (`useFitRoom`).
 */
export function Stage({ children }) {
  const ref = useFitRoom();
  return (
    <div ref={ref} className={styles.stage}>
      {children}
    </div>
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
  const ref = useFitRoom();
  return (
    <div ref={ref} className={`${column ? styles.column : styles.stage} ${styles.shot}`}>
      <AppShot shot={SHOTS[name]} label={null}>
        {children}
      </AppShot>
    </div>
  );
}
