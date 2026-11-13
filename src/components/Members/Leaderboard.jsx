import React, { useEffect, useMemo, useState } from "react";
import { currentSeason, isEngineDown, readLeaderboard, readSeasonResults } from "./lib/api";
import { errorText, useLookup, useMember, useSeasonProgress, useSeasons } from "./lib/member";
import { fmtDate, fmtInt } from "./lib/format";
import { Button, Caption, EngineDown, Notice, Section } from "./parts";
import SeasonModule from "./Home/SeasonModule";
import { HERO, LEADERBOARD, SECTIONS } from "./copy";
import s from "./pages.module.css";

/**
 * /members/leaderboard. The season, then the pseudonymous board: rank, name
 * and essence, never an address. No Discord needed.
 *
 * Past seasons (gap audit item 8): when the season list has a finalized
 * season, a picker above the board switches to its frozen results from
 * GET /api/seasons/:id/results. With no past season the picker is not shown.
 *
 * Design notes 2026-11-03 (metalface 38): the Access ladder section is gone.
 * The hero's season module carries the wallet's essence bar with the three
 * unlocks, and the claims live on /members/store. The hero keeps the "ladder"
 * id, so an old "#ladder" link still lands on that bar.
 *
 * Design notes 2026-11-03 (metalface 37): sortable columns (rank, name,
 * essence), a search by pseudonym and a page size (20, 50, 100) with "Show
 * more". The engine pages the live board at 100 rows a request at most
 * (LeaderboardQuery in Alchemix-Seasons src/lib/engine/seasons.ts), so the
 * page reads it 100 rows at a time and sorts and searches the rows it has;
 * "Show more" reads the next 100 when the shown rows run out. A past season's
 * results come whole, so there everything covers the full board.
 */
const CHUNK = 100;
const SIZES = [20, 50, 100];
/** The first direction a column sorts in when picked. */
const FIRST_DIR = { rank: "asc", name: "asc", essence: "desc" };

function sortRows(rows, key, dir) {
  const sign = dir === "asc" ? 1 : -1;
  const out = rows.map((e, i) => ({ e, i }));
  out.sort((a, b) => {
    let d = 0;
    if (key === "name") d = String(a.e.displayName).localeCompare(String(b.e.displayName));
    else if (key === "essence") d = a.e.standing - b.e.standing;
    else d = a.e.rank - b.e.rank;
    return d * sign || a.i - b.i;
  });
  return out.map((x) => x.e);
}

export default function Leaderboard() {
  return <LeaderboardPage />;
}

/**
 * The hero's season module (design notes 2026-11-03, note 39): the dates, the
 * time bar and "Access until ..." as its note, and the essence bar with the
 * three unlocks. With a wallet on screen that has essence, the bar fills to
 * it and says how far the next unlock is, so the page keeps what the Access
 * ladder showed.
 */
function HeroSeason({ season, progress }) {
  const { address } = useMember();
  const lookup = useLookup();
  const data = address && lookup.data ? lookup.data : null;
  const essence = data?.essence ?? null;
  // The engine's progress figures for the open season, when this is it.
  const live = progress.data?.season && progress.data.season.id === season.id ? progress.data.season : null;
  const shown = live ? { ...season, progress: live.progress, daysLeft: live.daysLeft } : season;
  return (
    <SeasonModule
      season={shown}
      tag={LEADERBOARD.status[season.status] ?? season.status}
      note={LEADERBOARD.accessUntil(fmtDate(season.accessExpiresAt))}
      rungs={season.rungs ?? []}
      standing={typeof essence?.standing === "number" ? essence.standing : null}
      perDay={data?.standingPerDay ?? null}
      showNext={Boolean(essence)}
    />
  );
}

function LeaderboardPage() {
  const { base } = useMember();
  const seasons = useSeasons();
  const progress = useSeasonProgress();
  const season = currentSeason(seasons.data);
  const past = (seasons.data?.seasons ?? []).filter((x) => x.finalized && x.id !== season?.id);
  const [picked, setPicked] = useState(null);
  const [tick, setTick] = useState(0);
  const [board, setBoard] = useState({ status: "loading", data: null, error: null });
  const [more, setMore] = useState({ busy: false, error: null });
  const [size, setSize] = useState(SIZES[0]);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "rank", dir: "asc" });
  const pickedSeason = past.find((x) => x.id === picked) ?? null;

  useEffect(() => {
    let live = true;
    setBoard((b) => ({ ...b, status: "loading" }));
    setMore({ busy: false, error: null });
    const read =
      picked === null
        ? readLeaderboard(base, { offset: 0, limit: CHUNK })
        : readSeasonResults(base, picked).then((r) => ({
            total: r.total,
            finalizedAt: r.finalizedAt,
            entries: r.results ?? [],
          }));
    read
      .then((data) => live && setBoard({ status: "ready", data, error: null }))
      .catch((error) => live && setBoard({ status: "error", data: null, error }));
    return () => {
      live = false;
    };
  }, [base, picked, tick]);

  function pick(id) {
    setPicked(id);
    setPages(1);
    setQuery("");
  }

  const total = board.data?.total ?? 0;
  const rows = board.data?.entries ?? [];
  const down = board.status === "error" && isEngineDown(board.error);
  const partial = picked === null && rows.length < total;

  const q = query.trim().toLowerCase();
  const sorted = useMemo(() => {
    const found = q ? rows.filter((e) => String(e.displayName).toLowerCase().includes(q)) : rows;
    return sortRows(found, sort.key, sort.dir);
  }, [rows, q, sort.key, sort.dir]);
  const visible = size * pages;
  const shown = sorted.slice(0, visible);
  const canShowMore = sorted.length > visible || partial;

  /** The next 100 rows of the live board, after the ones already read. */
  async function readMore() {
    setMore({ busy: true, error: null });
    try {
      const data = await readLeaderboard(base, { offset: rows.length, limit: CHUNK });
      setBoard((b) => (b.data ? { ...b, data: { ...b.data, total: data.total, entries: [...b.data.entries, ...(data.entries ?? [])] } } : b));
      setMore({ busy: false, error: null });
    } catch (error) {
      setMore({ busy: false, error });
    }
  }

  function showMore() {
    setPages((n) => n + 1);
    if (partial && sorted.length < visible + size) readMore();
  }

  function sortBy(key) {
    setSort((cur) => (cur.key === key ? { key, dir: cur.dir === "asc" ? "desc" : "asc" } : { key, dir: FIRST_DIR[key] }));
    setPages(1);
  }

  const ariaSort = (key) => (sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none");
  const head = (key, label, className) => (
    <span role="columnheader" aria-sort={ariaSort(key)} className={className}>
      <button type="button" className={`${s.sortButton} ${sort.key === key ? s.sortOn : ""}`} onClick={() => sortBy(key)}>
        {label}
        <span className={s.sortMark} aria-hidden="true">
          {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </span>
  );

  return (
    <>
      <section className={s.pageHead}>
        <div className={s.pageHeadInner}>
          <div className={s.eyebrow}>{HERO.eyebrow}</div>
          <h1 className={s.headline}>{season ? season.name : SECTIONS.leaderboard}</h1>
          {season ? (
            <div id="ladder">
              <HeroSeason season={season} progress={progress} />
            </div>
          ) : null}
        </div>
      </section>

      <Section
        label={pickedSeason ? pickedSeason.name : SECTIONS.leaderboard}
        id="board"
        aside={total ? <span>{LEADERBOARD.total(fmtInt(total))}</span> : null}
      >
        <p className={s.intro}>{pickedSeason ? LEADERBOARD.introPast : LEADERBOARD.intro}</p>

        {past.length > 0 ? (
          <fieldset className={`${s.fieldset} ${s.seasonPicker}`}>
            <legend className={s.srOnly}>{SECTIONS.pastSeasons}</legend>
            <Caption>{LEADERBOARD.pastLabel}</Caption>
            <div className={s.segments}>
              {[{ id: null, label: LEADERBOARD.current }, ...past.map((x) => ({ id: x.id, label: x.name }))].map((o) => (
                <label key={o.id ?? "now"} className={`${s.segment} ${picked === o.id ? s.segmentOn : ""}`}>
                  <input
                    type="radio"
                    name="leaderboard-season"
                    checked={picked === o.id}
                    onChange={() => pick(o.id)}
                    className={s.srOnly}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {pickedSeason && board.data?.finalizedAt ? (
          <p className={s.finalNote}>{LEADERBOARD.finalOn(fmtDate(board.data.finalizedAt))}</p>
        ) : null}

        {down ? (
          <EngineDown onRetry={() => setTick((n) => n + 1)} />
        ) : board.status === "error" ? (
          <Notice tone={board.error?.code === "no_open_season" ? "info" : "error"}>
            {board.error?.code === "no_open_season"
              ? LEADERBOARD.noSeason
              : picked !== null
                ? LEADERBOARD.pastFailed
                : errorText(board.error)}
          </Notice>
        ) : board.status === "ready" && rows.length === 0 ? (
          <p className={s.intro}>{picked !== null ? LEADERBOARD.pastEmpty : LEADERBOARD.empty}</p>
        ) : (
          <>
          <div className={s.boardTools}>
            <div className={s.boardSearch}>
              <label className={s.srOnly} htmlFor="leaderboard-search">
                {LEADERBOARD.searchLabel}
              </label>
              <input
                id="leaderboard-search"
                type="search"
                className={s.textInput}
                value={query}
                placeholder={LEADERBOARD.searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPages(1);
                }}
              />
            </div>
            <fieldset className={`${s.fieldset} ${s.boardSize}`}>
              <legend className={s.srOnly}>{LEADERBOARD.sizeLabel}</legend>
              <Caption className={s.boardSizeLabel}>{LEADERBOARD.size}</Caption>
              <div className={s.segments}>
                {SIZES.map((n) => (
                  <label key={n} className={`${s.segment} ${size === n ? s.segmentOn : ""}`}>
                    <input
                      type="radio"
                      name="leaderboard-size"
                      value={n}
                      checked={size === n}
                      onChange={() => {
                        setSize(n);
                        setPages(1);
                        if (partial && sorted.length < n) readMore();
                      }}
                      className={s.srOnly}
                    />
                    {n}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {partial && (q || sort.key !== "rank" || sort.dir !== "asc") ? (
            <p className={s.boardNote}>{LEADERBOARD.partial(fmtInt(rows.length), fmtInt(total))}</p>
          ) : null}
          <div className={s.table} role="table" aria-label={SECTIONS.leaderboard} aria-busy={board.status === "loading"}>
            <div className={`${s.row} ${s.rowHead}`} role="row">
              {head("rank", LEADERBOARD.rank)}
              {head("name", LEADERBOARD.name)}
              {head("essence", LEADERBOARD.standing, s.right)}
            </div>
            {shown.map((e, i) => (
              <div
                key={`${e.rank}-${i}`}
                className={`${s.row} ${e.rank <= 3 ? s.rowTop : ""}`}
                role="row"
              >
                {/* A shared rank (equal standing, join date and first counted day) shows as "=12". */}
                <span role="cell" className={s.rank} aria-label={e.tied ? LEADERBOARD.sharedRankLabel(e.rank) : undefined}>
                  {e.tied ? LEADERBOARD.sharedRank(String(e.rank).padStart(2, "0")) : String(e.rank).padStart(2, "0")}
                </span>
                <span role="cell" className={s.name}>
                  {e.displayName}
                </span>
                <span role="cell" className={`${s.standing} ${s.right}`}>
                  {fmtInt(e.standing)}
                </span>
              </div>
            ))}
          </div>
          {q && shown.length === 0 && board.status === "ready" ? (
            <p className={s.boardEmpty}>{partial ? LEADERBOARD.noMatchYet(query.trim()) : LEADERBOARD.noMatch(query.trim())}</p>
          ) : null}
          <div className={s.pager}>
            <Caption className={s.pagerText}>
              {q ? LEADERBOARD.shownFound(fmtInt(shown.length), fmtInt(sorted.length)) : LEADERBOARD.shown(fmtInt(shown.length), fmtInt(total))}
            </Caption>
            {canShowMore ? (
              <Button kind="secondary" onClick={showMore} disabled={more.busy}>
                {LEADERBOARD.showMore}
              </Button>
            ) : null}
          </div>
          {more.error ? (
            <div className={s.noteBlock}>
              {isEngineDown(more.error) ? <EngineDown onRetry={readMore} /> : <Notice tone="error">{errorText(more.error)}</Notice>}
            </div>
          ) : null}
          </>
        )}
      </Section>
    </>
  );
}
