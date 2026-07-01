"use client";

import { useState } from "react";
import PackShop from "../components/PackShop";
import JustPulled from "../components/JustPulled";
import CardArt from "../components/CardArt";
import Money from "../components/Money";
import ScrollRow from "../components/ScrollRow";
import { SectionHead, LiveBadge } from "../components/Section";
import { RARITY_META, type Pull } from "../lib/types";

export default function PacksPage() {
  const [mine, setMine] = useState<Pull[]>([]);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-6 sm:px-8">
      <section className="pt-3">
        <SectionHead
          id="shop"
          title="Rip a pack"
          sub="Tap a pack to see what's inside, then rip for a weighted random pull"
        />
        <PackShop onPulled={(p) => setMine((prev) => [p, ...prev].slice(0, 12))} />
      </section>

      {mine.length > 0 && (
        <section className="pt-14">
          <SectionHead title="Your rips" badge={<LiveBadge />} />
          <ScrollRow>
            {mine.map((p) => {
              const meta = RARITY_META[p.rarity];
              return (
                <article
                  key={p.id}
                  className="animate-slide-in-left w-[170px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className="relative p-2.5">
                    <CardArt
                      rarity={p.rarity}
                      category={p.category}
                      grade={p.grade}
                      label={p.set}
                      className="aspect-[3/4] w-full"
                    />
                    <span
                      className="absolute right-3.5 top-3.5 rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide text-black"
                      style={{ background: `var(${meta.varName})` }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="px-3 pb-3">
                    <h3 className="line-clamp-2 min-h-[2.4em] text-[0.82rem] font-semibold leading-snug">
                      {p.card}
                    </h3>
                    <Money usd={p.value} className="mt-2 block font-mono text-sm font-bold text-primary" />
                    <p className="mt-2 truncate border-t border-line-soft pt-2 text-[0.68rem] text-muted">
                      from <span className="text-ink/80">{p.pack}</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </ScrollRow>
        </section>
      )}

      <section className="pt-14">
        <SectionHead
          title="Just pulled"
          sub="What collectors are ripping right now"
          badge={<LiveBadge />}
        />
        <JustPulled />
      </section>
    </div>
  );
}
