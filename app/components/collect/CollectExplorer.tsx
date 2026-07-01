"use client";

import { useState } from "react";
import type { CollectGroup } from "../../lib/collect";
import CollectCard from "./CollectCard";

const ALL = "all";

function Chip({
  label,
  count,
  kind,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  kind: "all" | "box" | "event";
  active: boolean;
  onClick: () => void;
}) {
  const dot =
    kind === "box"
      ? "bg-primary"
      : kind === "event"
        ? "bg-accent"
        : "bg-ink";
  const activeCls =
    kind === "event"
      ? "border-accent/60 bg-accent/15 text-accent"
      : kind === "box"
        ? "border-primary/60 bg-primary/15 text-primary"
        : "border-transparent bg-ink text-bg";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.78rem] font-semibold transition-colors ${
        active
          ? activeCls
          : "border-line text-muted hover:border-line-soft hover:text-ink"
      }`}
    >
      {kind !== "all" && (
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "opacity-80" : ""} ${dot}`} />
      )}
      {label}
      {count != null && (
        <span className="font-mono text-[0.7rem] tabular-nums opacity-70">{count}</span>
      )}
    </button>
  );
}

export default function CollectExplorer({ sections }: { sections: CollectGroup[] }) {
  const [active, setActive] = useState<string>(ALL);

  const box = sections.filter((s) => s.kind === "box");
  const events = sections.filter((s) => s.kind === "event");
  const total = sections.reduce((n, s) => n + s.cards.length, 0);
  const visible = active === ALL ? sections : sections.filter((s) => s.key === active);

  return (
    <>
      {/* category filter bar — sits under the app header */}
      <div className="sticky top-16 z-[var(--z-rail)] -mx-5 mb-8 border-b border-line-soft bg-bg/85 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            label="All"
            count={total}
            kind="all"
            active={active === ALL}
            onClick={() => setActive(ALL)}
          />

          {box.length > 0 && <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />}
          {box.map((g) => (
            <Chip
              key={g.key}
              label={g.label}
              count={g.cards.length}
              kind="box"
              active={active === g.key}
              onClick={() => setActive(g.key)}
            />
          ))}

          {events.length > 0 && <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />}
          {events.map((g) => (
            <Chip
              key={g.key}
              label={g.label}
              count={g.cards.length}
              kind="event"
              active={active === g.key}
              onClick={() => setActive(g.key)}
            />
          ))}
        </div>
      </div>

      {/* grouped sections — re-keyed on filter change for a subtle settle */}
      <div key={active} className="animate-rise-in space-y-12">
        {visible.map((g) => (
          <section key={g.key} id={g.key} className="scroll-mt-32">
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-soft pb-3">
              <h2 className="text-xl font-bold tracking-tight">{g.label}</h2>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide ${
                  g.kind === "event"
                    ? "bg-accent/12 text-accent"
                    : "bg-primary/12 text-primary"
                }`}
              >
                {g.kind === "event" ? "Event" : "Box"} · {g.cards.length}
              </span>
              <p className="text-sm text-muted">{g.blurb}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {g.cards.map((c) => (
                <CollectCard key={c.id} c={c} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
