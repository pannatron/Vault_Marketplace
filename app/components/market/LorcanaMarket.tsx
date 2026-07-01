"use client";

import { useMemo, useState } from "react";
import type { Listing } from "../../lib/types";
import ListingCard from "./ListingCard";
import { IconSearch } from "../Icons";

const PAGE = 24;

type Filter = "all" | 10 | 9 | 8;
type Sort = "new" | "price-asc" | "price-desc";
type Grader = "PSA" | "CGC" | "BGS";

const GRADERS: Grader[] = ["PSA", "CGC", "BGS"];
const GRADER_DISABLED: Grader[] = ["CGC", "BGS"]; // no data yet

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: 10, label: "10" },
  { key: 9, label: "9" },
  { key: 8, label: "8" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "new", label: "Top value" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
];

const RAR_ORDER = ["Iconic", "Enchanted", "Epic", "Legendary", "Super Rare", "Rare"];
const RAR_VAR: Record<string, string> = {
  Iconic: "--color-r-iconic",
  Enchanted: "--color-r-enchanted",
  Legendary: "--color-r-legendary",
  Epic: "--color-r-epic",
  "Super Rare": "--color-r-epic",
  Rare: "--color-r-rare",
};

export default function LorcanaMarket({
  listings,
  initialSet = "",
}: {
  listings: Listing[];
  initialSet?: string;
}) {
  const [q, setQ] = useState("");
  const [grader, setGrader] = useState<Grader>("PSA");
  const [filter, setFilter] = useState<Filter>("all");
  const [rar, setRar] = useState<string>("all");
  const [set, setSet] = useState<string>(initialSet || "all");
  const [sort, setSort] = useState<Sort>("new");
  const [shown, setShown] = useState(PAGE);

  // reset paging whenever the result set changes (derive during render)
  const key = `${q}|${grader}|${filter}|${rar}|${set}|${sort}`;
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setShown(PAGE);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: listings.length, 10: 0, 9: 0, 8: 0 };
    for (const l of listings) if (l.grade != null) c[l.grade] = (c[l.grade] ?? 0) + 1;
    return c;
  }, [listings]);

  // graded (PSA) controls only make sense when the data has graded cards
  const hasGraded = useMemo(() => listings.some((l) => l.grade != null), [listings]);

  const sets = useMemo(() => {
    const present = new Set(listings.map((l) => l.set).filter(Boolean) as string[]);
    return [...present].sort();
  }, [listings]);

  const rarities = useMemo(() => {
    const present = new Set(listings.map((l) => l.rarityLabel).filter(Boolean) as string[]);
    return RAR_ORDER.filter((r) => present.has(r));
  }, [listings]);

  const view = useMemo(() => {
    let r = listings;
    if (filter !== "all") r = r.filter((l) => l.grade === filter);
    if (rar !== "all") r = r.filter((l) => l.rarityLabel === rar);
    if (set !== "all") r = r.filter((l) => l.set === set);
    const term = q.trim().toLowerCase();
    if (term)
      r = r.filter(
        (l) =>
          l.title.toLowerCase().includes(term) ||
          l.set?.toLowerCase().includes(term)
      );
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [listings, filter, rar, set, q, sort]);

  return (
    <div>
      {/* toolbar */}
      <div className="sticky top-16 z-[var(--z-rail)] -mx-5 mb-6 border-b border-line-soft bg-bg/85 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3">
          {/* row 1 — search + sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex min-w-[180px] max-w-sm flex-1 items-center">
              <IconSearch
                width={17}
                height={17}
                className="pointer-events-none absolute left-3.5 text-faint"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by card or set…"
                aria-label="Filter listings"
                className="h-10 w-full rounded-[11px] border border-line bg-surface/70 pl-10 pr-3 text-sm text-ink placeholder:text-faint focus:border-primary/60 focus:bg-surface focus:outline-none"
              />
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full border border-line p-0.5">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                  className={`h-8 rounded-full px-3.5 text-[0.78rem] font-semibold transition-colors ${
                    sort === s.key ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* row 2 — filter groups */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            {hasGraded && (
              <>
            {/* grader */}
            <div className="flex items-center gap-2">
              <span className="text-[0.58rem] font-semibold uppercase tracking-wider text-faint">
                Grader
              </span>
              <div className="flex items-center gap-0.5 rounded-full border border-line p-0.5">
                {GRADERS.map((g) => {
                  const on = grader === g;
                  const dis = GRADER_DISABLED.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => setGrader(g)}
                      disabled={dis}
                      aria-pressed={on}
                      title={dis ? "No data yet" : undefined}
                      className={`h-7 rounded-full px-3 text-[0.76rem] font-bold transition-colors ${
                        on
                          ? "bg-primary text-primary-ink"
                          : dis
                          ? "cursor-not-allowed text-faint/35"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <span aria-hidden className="hidden h-5 w-px bg-line-soft sm:block" />

            {/* grade */}
            <div className="flex items-center gap-2">
              <span className="text-[0.58rem] font-semibold uppercase tracking-wider text-faint">
                Grade
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {FILTERS.map((f) => {
                  const on = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      aria-pressed={on}
                      className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[0.76rem] font-semibold transition-colors ${
                        on
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-line text-muted hover:text-ink"
                      }`}
                    >
                      {f.label}
                      <span className="font-mono text-[0.68rem] opacity-70">
                        {counts[f.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
              </>
            )}

            {sets.length > 0 && (
              <>
                <span aria-hidden className="hidden h-5 w-px bg-line-soft sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-wider text-faint">
                    Set
                  </span>
                  <div className="relative">
                    <select
                      value={set}
                      onChange={(e) => setSet(e.target.value)}
                      aria-label="Filter by set"
                      className="h-7 cursor-pointer appearance-none rounded-full border border-line bg-surface/70 pl-3 pr-8 text-[0.76rem] font-semibold text-ink focus:border-primary/60 focus:outline-none"
                    >
                      <option value="all">All sets</option>
                      {sets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] text-faint"
                    >
                      ▾
                    </span>
                  </div>
                </div>
              </>
            )}

            {rarities.length > 0 && (
              <>
                <span aria-hidden className="hidden h-5 w-px bg-line-soft sm:block" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-wider text-faint">
                    Rarity
                  </span>
                  {["all", ...rarities].map((r) => {
                    const on = rar === r;
                    const varName = r === "all" ? undefined : RAR_VAR[r];
                    return (
                      <button
                        key={r}
                        onClick={() => setRar(r)}
                        aria-pressed={on}
                        style={on && varName ? { background: `var(${varName})`, color: "#0b0b0b", borderColor: "transparent" } : undefined}
                        className={`inline-flex h-7 items-center rounded-full border px-3 text-[0.76rem] font-semibold transition-colors ${
                          on
                            ? varName
                              ? ""
                              : "border-primary bg-primary/15 text-primary"
                            : "border-line text-muted hover:text-ink"
                        }`}
                      >
                        {r === "all" ? "All" : r}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* result count */}
      <p className="mb-4 text-sm text-muted">
        Showing{" "}
        <span className="font-mono font-semibold text-ink">
          {Math.min(shown, view.length)}
        </span>{" "}
        of <span className="font-mono font-semibold text-ink">{view.length}</span>{" "}
        card{view.length === 1 ? "" : "s"}
        {q && (
          <>
            {" "}
            for “<span className="text-ink">{q}</span>”
          </>
        )}
      </p>

      {view.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface/40 py-20 text-center">
          <p className="text-base font-semibold">No matching listings</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Try a different keyword or clear the condition filter to see every
            Lorcana listing.
          </p>
          <button
            onClick={() => {
              setQ("");
              setFilter("all");
              setRar("all");
              setSet("all");
            }}
            className="mt-4 inline-flex h-9 items-center rounded-[11px] border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-primary/50"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(192px,1fr))]">
            {view.slice(0, shown).map((l) => (
              <ListingCard key={l.id} item={l} />
            ))}
          </div>

          {shown < view.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShown((s) => s + PAGE)}
                className="inline-flex h-11 items-center rounded-[12px] border border-line bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:border-primary/50 hover:bg-surface-2"
              >
                Load more ({view.length - shown} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
