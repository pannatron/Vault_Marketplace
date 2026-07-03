"use client";

import { useState } from "react";
import type { CollectGroup } from "../../lib/collect";
import CollectCard from "./CollectCard";

function Tab({
  group,
  active,
  onClick,
}: {
  group: CollectGroup;
  active: boolean;
  onClick: () => void;
}) {
  const accent = group.kind === "event" ? "var(--color-accent)" : "var(--color-primary)";
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`group relative flex shrink-0 items-center gap-2 whitespace-nowrap px-1 pb-3 pt-1 text-sm font-semibold transition-colors ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: accent, opacity: active ? 1 : 0.5 }}
      />
      {group.label}
      <span
        className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 font-mono text-[0.68rem] tabular-nums ${
          active ? "text-ink" : "text-faint"
        }`}
        style={active ? { background: `color-mix(in oklch, ${accent} 18%, transparent)` } : undefined}
      >
        {group.cards.length}
      </span>
      {/* active underline */}
      <span
        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity"
        style={{ background: accent, opacity: active ? 1 : 0 }}
      />
    </button>
  );
}

export default function CollectExplorer({ sections }: { sections: CollectGroup[] }) {
  const [active, setActive] = useState<string>(sections[0]?.key ?? "");
  const current = sections.find((s) => s.key === active) ?? sections[0];
  if (!current) return null;

  const accent = current.kind === "event" ? "var(--color-accent)" : "var(--color-primary)";

  return (
    <>
      {/* tab strip — sits under the app header, scrolls horizontally on mobile */}
      <div
        role="tablist"
        aria-label="Collectible categories"
        className="no-scrollbar sticky top-16 z-[var(--z-rail)] -mx-5 flex gap-5 overflow-x-auto border-b border-line-soft bg-bg/85 px-5 backdrop-blur-xl sm:-mx-8 sm:px-8"
      >
        {sections.map((g) => (
          <Tab key={g.key} group={g} active={g.key === current.key} onClick={() => setActive(g.key)} />
        ))}
      </div>

      {/* active category */}
      <section role="tabpanel" className="mt-6">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight">{current.label}</h2>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold"
            style={{ background: `color-mix(in oklch, ${accent} 14%, transparent)`, color: accent }}
          >
            <span className="font-mono tabular-nums">{current.cards.length}</span> cards
          </span>
          <span
            className="rounded-full border border-line px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-faint"
          >
            {current.kind === "event" ? "Event exclusive" : "In booster boxes"}
          </span>
          <p className="w-full text-sm text-muted sm:w-auto">{current.blurb}</p>
        </div>

        <div
          key={current.key}
          className="animate-rise-in grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
        >
          {current.cards.map((c) => (
            <CollectCard key={c.id} c={c} />
          ))}
        </div>
      </section>
    </>
  );
}
