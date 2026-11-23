import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { AppVaultRow } from "../AppMock";
import { AlchemixLockup, AlchemixMark } from "../Logo";
import APP_LISTS from "../lib/app-lists.json";
import { useFooterAction, useMoment } from "./position";
import { Stage, useBeside, useRailSlot } from "./index";
import styles from "./tour.module.css";

/**
 * Lesson 1's tour of the app's pages: the four pages as a list in the page's
 * text column, one of them open on what the page is for, and a picture of
 * the open page beside the list, as every other lesson page is laid out.
 *
 * It follows a `Beside` in the MDX, so it is the row's element. The picture
 * (the app's top bar with the page's item lit, then the page) is drawn where it
 * stands, and the list goes to the row's text column (`useRailSlot`), under
 * the paragraph that opens the page. In a window too narrow for two columns
 * the picture is inside the open row, under its text, so a page's words and
 * its picture are never a list apart.
 *
 * The reader opens a page from the list, or presses the footer's button,
 * which names the next page not opened yet (`useFooterAction`); the lesson's
 * one step (the moment "tour") is done once all of them have been opened.
 * The moves are Motion's: the open row's text grows in as the last one
 * closes, the lit item in the picture's bar slides to its new place, and
 * the pictures cross-fade. The list is in the bar's order, so the lit item
 * moves left to right as the reader goes down the list. The picture
 * keeps one size, so nothing beside the list moves.
 *
 *   <Beside />
 *
 *   Here are the four pages ...
 *
 *   <PageTour>
 *   <TourStop name="Dashboard" menu="Dashboard" shot="dashboard">
 *
 *   Text about the page.
 *
 *   </TourStop>
 *   <TourStop name="Fixed Yield" menu="Earn" item="Fixed Rate" shot="fixedYield">...</TourStop>
 *   </PageTour>
 *
 * `menu` is the item in the app's top menu that leads to the page and `item`
 * the entry under it, when the page is inside a menu. `shot` names the
 * picture: a capture of the page ("borrow", "fixedYield", "mixedYield") or
 * "dashboard", a drawn copy of the Dashboard with an example position, tagged
 * "Example" (the reader has no position yet).
 */
// eslint-disable-next-line no-unused-vars
export function TourStop({ name, menu, item = null, shot, children }) {
  return null;
}

/* The app's top menu, as the live app orders it. */
const MENU = [
  { name: "Dashboard" },
  { name: "Borrow" },
  { name: "Earn", sub: ["Fixed Rate", "Variable Rate"] },
  { name: "Trade", sub: [] },
  { name: "Ecosystem", sub: [] },
];

/* Each page's captures, taken at the app's own layout for a window about as
   wide as a desktop window (1200px; 390px for a phone's column), so the page
   is shown at close to its own size: its heading, and under it the Ethereum
   cards from its list. The page's filters, between the two, are left out.
   The sizes are in `lib/app-lists.json`, written with the captures by
   `scripts/capture-app-lists.mjs`. */
const SHOTS = {
  borrow: {
    key: "borrow",
    alt: "The Borrow page: its heading, Self-Repaying Loans, with the app's description of it, and the vault cards for USDC and ETH on Ethereum",
  },
  fixedYield: {
    key: "fixed-yield",
    alt: "The Fixed Yield page: its heading, with the app's description of it, and the card for alUSD on Ethereum, with its projected fixed APR, term and maturity date",
  },
  mixedYield: {
    key: "mixed-yield",
    alt: "The Mixed Yield page: its heading, with the app's description of it, and the vaults for USDC and ETH on Ethereum, each with its APR and strategies",
  },
};

/* The picture's column narrower than this (at the browser's own type size) shows the phone captures. */
const PHONE_PX = 560;
/* The most the picture is drawn at (51.25rem), the width of the window the
   captures were taken in ("wide", the app's desktop layout, scaled down to
   the picture: at the picture's own width the app draws its tall stacked
   cards, which read as a bulky version of the page), and the tallest page
   (heading and cards) at that width. */
const PIC_W = 820;
const CAP_W = APP_LISTS["borrow-wide"].cards.size[0] / 2;
const CAP_H = Math.max(...Object.values(SHOTS).map((s) => (APP_LISTS[`${s.key}-wide`].head.size[1] + APP_LISTS[`${s.key}-wide`].cards.size[1]) / 2));

/* What a window's height goes to around the page in the picture, where the
   picture stands beside the text: the pinned header, the page's breadcrumb
   and title, the picture's menu row and the pinned footer, with the room
   kept over the footer. And the least width the page is drawn at. */
const AROUND = "26rem";
const FLOOR_W = 37.5;

/* The width the practice Dashboard is drawn at before it is scaled to the picture: the captures' window less the page's margins, so it comes out at their scale. */
const DRAWN = CAP_W - 72;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* One spring for everything the tour moves. */
const GLIDE = { type: "spring", duration: 0.5, bounce: 0 };

/** The small mark after an item that opens a menu: a chevron, or a dash while the menu is open (as the app draws it). */
function Opens({ open = false }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={open ? "M7 12h10" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

/**
 * The app's top bar, laid out as the live app lays it out: the logo on the
 * left, the menu in the middle, the theme button and Connect Wallet on the
 * right. The open page's item stands on the app's own filled ground, one
 * element that slides from the last page's item to this one's. A page inside
 * a menu (Earn's two) has that menu open under its item, over the top of the
 * page as in the app, with the page's entry lit. The bar is the same height
 * for every page. In a phone's column the open menu is a line of its own
 * under the bar's items, since over the page it covered the page's name.
 *
 * It was a row of four items on the left, the lit one ringed in copper and
 * Earn's entries set out on the same line, which was not the app's bar.
 */
function Menu({ menu, item, phone = false }) {
  const entries = (sub) =>
    sub.map((s) => (
      <span key={s} className={`${styles.menuEntry} ${s === item ? styles.menuEntryOn : ""}`}>
        {s === item ? <motion.span layoutId="tour-menu-entry" className={styles.menuEntryLit} transition={GLIDE} aria-hidden="true" /> : null}
        <span className={styles.menuText}>{s}</span>
      </span>
    ));
  const opened = MENU.find((m) => m.name === menu && item && m.sub?.length);
  return (
    <LayoutGroup id="tour-menu">
      <div className={styles.menu} role="img" aria-label={`The app's top bar, with ${item ? `${menu} open on ${item}` : menu} lit`}>
        <span className={styles.menuBrand}>
          <AlchemixLockup className={styles.menuLockup} />
          <AlchemixMark className={styles.menuMark} />
          <Opens />
        </span>
        <span className={styles.menuItems}>
          {MENU.map((m) => {
            const on = m.name === menu;
            const open = on && Boolean(item) && Boolean(m.sub?.length);
            return (
              <span key={m.name} className={`${styles.menuItem} ${on ? styles.menuOn : ""}`}>
                {on ? <motion.span layoutId="tour-menu-lit" className={styles.menuLit} transition={GLIDE} aria-hidden="true" /> : null}
                <span className={styles.menuText}>
                  {m.name}
                  {m.sub ? <Opens open={open} /> : null}
                </span>
                <AnimatePresence initial={false}>
                  {open && !phone ? (
                    <motion.span
                      key="panel"
                      className={styles.menuPanel}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.2 } }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    >
                      {entries(m.sub)}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </span>
            );
          })}
        </span>
        {phone && opened ? <span className={`${styles.menuPanel} ${styles.menuPanelRow}`}>{entries(opened.sub)}</span> : null}
        <span className={styles.menuRight}>
          <span className={styles.menuTheme}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
            </svg>
          </span>
          <span className={styles.menuWallet}>Connect Wallet</span>
        </span>
      </div>
    </LayoutGroup>
  );
}

/** One file of a capture, or the top of it down to `h` (a share of its height). */
function Part({ file, alt = "", h = 1 }) {
  const src = useBaseUrl(file.src);
  return (
    <div className={styles.part} style={{ aspectRatio: `${file.size[0]} / ${file.size[1] * h}` }}>
      <img src={src} alt={alt} loading="eager" />
    </div>
  );
}

/** A page of the app: its heading, then its cards (on a phone, the first card). */
function Capture({ shot, phone }) {
  const data = APP_LISTS[`${shot.key}-${phone ? "phone" : "wide"}`];
  const first = data.cards.items[0].rect;
  const one = Math.min(1, first.y + first.h + (data.cards.pad * 2) / data.cards.size[1]);
  return (
    <div className={styles.capture}>
      <Part file={data.head} alt={shot.alt} />
      <Part file={data.cards} h={phone ? one : 1} />
    </div>
  );
}

/**
 * The practice copy of the Dashboard with an example position, drawn at the
 * width it has on a lesson's page and scaled to the picture's. On a phone
 * it is drawn at the picture's own width, where it stacks as the app does.
 */
function Drawn({ phone }) {
  const box = useRef(null);
  const inner = useRef(null);
  useIsoLayoutEffect(() => {
    const el = box.current;
    const fig = inner.current;
    if (!el || !fig || typeof ResizeObserver === "undefined") return undefined;
    const fit = () => {
      if (phone) {
        fig.style.transform = "";
        el.style.height = "";
        return;
      }
      // The copy is drawn 53.75rem wide, in the page's own type size.
      const root = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      const k = el.clientWidth / ((DRAWN * root) / 16);
      if (!k) return;
      fig.style.transform = `scale(${k})`;
      el.style.height = `${Math.round(fig.offsetHeight * k)}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(fig);
    fit();
    return () => ro.disconnect();
  }, [phone]);
  return (
    <div className={styles.drawn}>
      <div ref={box} className={styles.drawnBox}>
        <div ref={inner} className={styles.drawnInner} style={phone ? undefined : { width: `${DRAWN / 16}rem` }}>
          <AppVaultRow deposit={10000} debt={5000} alPrice={0.97} tag="Example" />
        </div>
      </div>
    </div>
  );
}

/**
 * The picture's width at the browser's own type size, for choosing between
 * the desktop and the phone captures. In one column the picture is drawn
 * inside the open row, so it is a new element each time a row opens: the
 * width is read from whichever element is on the page (a callback ref), and
 * the last width read is kept while there is none. Read once from the first
 * element, the width fell to 0 when that element left, and a phone's column
 * showed the desktop captures on every page after the first.
 */
function usePictureWidth() {
  const [width, setWidth] = useState(0);
  const watch = useRef(null);
  const ref = useCallback((el) => {
    if (watch.current) {
      watch.current.disconnect();
      watch.current = null;
    }
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      if (!w) return;
      const root = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      setWidth((w * 16) / root);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    watch.current = new ResizeObserver(measure);
    watch.current.observe(el);
  }, []);
  return [ref, width];
}

export function PageTour({ children }) {
  const stops = React.Children.toArray(children)
    .filter((c) => React.isValidElement(c) && c.type === TourStop)
    .map((c) => c.props);
  const m = useMoment("tour");
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState([0]);
  const all = m.done || seen.length >= stops.length;
  // The step is done once every page has been opened.
  useEffect(() => {
    if (all && !m.done && m.ready) m.apply({ ...m.position });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, m.done, m.ready]);
  const list = useRef(null);
  const open = (i) => {
    if (i === at) return;
    setAt(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
    // A row that closes above the one opened takes its height out from over
    // it. Once the rows have settled, a row that ended up out of the window
    // (under the pinned header, or past the footer) is brought back into it.
    window.setTimeout(() => {
      const row = list.current?.querySelector(`[data-tour-row="${i}"]`);
      if (!row) return;
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const top = header ? header.getBoundingClientRect().bottom : 0;
      const bottom = footer ? footer.getBoundingClientRect().top : window.innerHeight;
      const r = row.getBoundingClientRect();
      if (r.top >= top && r.top <= bottom - 96) return;
      const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollIntoView({ block: "start", behavior: still ? "instant" : "smooth" });
    }, 540);
  };
  // The next page not opened yet, from the one on screen on.
  const order = stops.map((_, i) => (at + 1 + i) % stops.length);
  const next = m.done ? null : order.find((i) => !seen.includes(i)) ?? null;
  useFooterAction("tour", next != null ? { label: `Next page: ${stops[next].name}`, kind: "next", disabled: !m.ready, onPress: () => open(next) } : null);

  const slot = useRailSlot();
  const beside = useBeside();
  const [picture, width] = usePictureWidth();
  const phone = width > 0 && width < PHONE_PX;
  const stop = stops[at];

  const shot = (
    <section ref={picture} className={`${styles.picture} ${phone ? styles.picturePhone : ""}`} aria-label={`The ${stop.name} page in the app`}>
      <Menu menu={stop.menu} item={stop.item ?? null} phone={phone} />
      {/* As tall as the tallest page, so the picture keeps its size from
          one page to the next. Beside the text it is also no taller than
          the window has room for under the page's title (its height
          follows its width, so the width is what is held back), down to
          a width the captures still read at. A phone's column shows each
          page at its own height. */}
      <div
        className={styles.page}
        style={phone ? undefined : { aspectRatio: `${CAP_W} / ${CAP_H}`, ...(beside ? { maxWidth: `min(${PIC_W / 16}rem, max(${FLOOR_W}rem, calc((100dvh - ${AROUND}) * ${CAP_W / CAP_H})))` } : {}) }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={stop.name}
            className={styles.pageIn}
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ ...GLIDE, opacity: { duration: 0.3, delay: 0.08 } }}
          >
            {stop.shot === "dashboard" ? <Drawn phone={phone} /> : <Capture shot={SHOTS[stop.shot]} phone={phone} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );

  const words = (
    <>
      <div ref={list} className={styles.list} role="tablist" aria-orientation="vertical" aria-label="The app's pages">
        {stops.map((s, i) => {
          const on = i === at;
          const done = (m.done || seen.includes(i)) && !on;
          return (
            <div key={s.name} className={`${styles.row} ${on ? styles.rowOn : ""}`} data-tour-row={i}>
              <AnimatePresence initial={false}>
                {on ? (
                  <motion.span
                    key="rule"
                    className={styles.rule}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    aria-hidden="true"
                  />
                ) : null}
              </AnimatePresence>
              <button
                type="button"
                role="tab"
                id={`tour-tab-${i}`}
                aria-selected={on}
                aria-controls={`tour-panel-${i}`}
                className={styles.head}
                data-tour-tab=""
                onClick={() => open(i)}
              >
                <span className={styles.name}>{s.name}</span>
                <span className={styles.mark} aria-hidden="true">
                  {done ? (
                    <svg className={styles.tick} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  ) : on ? null : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  )}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {on ? (
                  <motion.div
                    key="panel"
                    role="tabpanel"
                    id={`tour-panel-${i}`}
                    aria-labelledby={`tour-tab-${i}`}
                    className={styles.panel}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1, transition: { ...GLIDE, opacity: { duration: 0.3, delay: 0.12 } } }}
                    exit={{ height: 0, opacity: 0, transition: { ...GLIDE, opacity: { duration: 0.12 } } }}
                  >
                    <div className={styles.panelIn}>
                      <div className={styles.where}>
                        <span className={styles.whereLabel}>In the menu</span>
                        <span className={styles.wherePath}>
                          {s.menu}
                          {s.item ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m9 6 6 6-6 6" />
                              </svg>
                              {s.item}
                            </>
                          ) : null}
                        </span>
                      </div>
                      <div className={styles.text}>{s.children}</div>
                      {beside ? null : <div className={styles.inRow}>{shot}</div>}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </>
  );

  if (!beside) return words;
  return (
    <>
      {slot ? createPortal(words, slot) : null}
      <Stage>{shot}</Stage>
    </>
  );
}
PageTour.moment = "tour";
PageTour.hint = "Open all four pages to continue";
