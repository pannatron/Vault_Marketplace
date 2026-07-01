"use client";

import { useEffect, useRef, useState } from "react";
import { initialPulls, pullPool } from "../lib/data";
import { RARITY_META, type Pull } from "../lib/types";
import { relativeTime } from "../lib/format";
import CardArt from "./CardArt";
import Money from "./Money";
import ScrollRow from "./ScrollRow";

const MAX = 16;

export default function JustPulled() {
  const [pulls, setPulls] = useState<Pull[]>(initialPulls);
  const idc = useRef(1000);

  useEffect(() => {
    // age every pull
    const tick = setInterval(() => {
      setPulls((prev) => prev.map((p) => ({ ...p, secondsAgo: p.secondsAgo + 5 })));
    }, 5000);

    // fabricate a fresh pull at the front
    const feed = setInterval(() => {
      const seed = pullPool[Math.floor(Math.random() * pullPool.length)];
      idc.current += 1;
      const fresh: Pull = { ...seed, id: `live-${idc.current}`, secondsAgo: 1 };
      setPulls((prev) => [fresh, ...prev].slice(0, MAX));
    }, 6500);

    return () => {
      clearInterval(tick);
      clearInterval(feed);
    };
  }, []);

  return (
    <ScrollRow>
      {pulls.map((p, idx) => (
        <PullCard key={p.id} pull={p} fresh={p.id.startsWith("live-") && idx === 0} />
      ))}
    </ScrollRow>
  );
}

function PullCard({ pull, fresh }: { pull: Pull; fresh: boolean }) {
  const meta = RARITY_META[pull.rarity];
  return (
    <article
      className={`hover-lift group w-[178px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface ${
        fresh ? "animate-slide-in-left" : ""
      }`}
    >
      <div className="relative p-2.5">
        <CardArt
          rarity={pull.rarity}
          category={pull.category}
          grade={pull.grade}
          label={pull.set}
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
          {pull.card}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <Money usd={pull.value} className="font-mono text-sm font-bold text-primary" />
          <time className="font-mono text-[0.68rem] text-faint">
            {relativeTime(pull.secondsAgo)}
          </time>
        </div>
        <div className="mt-2 truncate border-t border-line-soft pt-2 text-[0.68rem] text-muted">
          from <span className="text-ink/80">{pull.pack}</span>
        </div>
      </div>
    </article>
  );
}
