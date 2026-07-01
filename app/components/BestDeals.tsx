import { deals } from "../lib/data";
import { discountPct } from "../lib/format";
import CardArt from "./CardArt";
import Money from "./Money";
import ScrollRow from "./ScrollRow";

export default function BestDeals() {
  return (
    <ScrollRow>
      {deals.map((d) => {
        const off = discountPct(d.price, d.fmv);
        return (
          <article
            key={d.id}
            className="hover-lift group w-[178px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="relative p-2.5">
              <CardArt
                rarity={d.rarity}
                category={d.category}
                className="aspect-[3/4] w-full"
              />
              <span className="absolute right-3.5 top-3.5 rounded-full bg-success px-2 py-0.5 font-mono text-[0.62rem] font-bold text-primary-ink">
                {off}% off
              </span>
            </div>
            <div className="px-3 pb-3.5">
              <h3 className="line-clamp-2 min-h-[2.4em] text-[0.82rem] font-semibold leading-snug">
                {d.card}
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <Money usd={d.price} className="font-mono text-base font-bold text-success" />
                <Money usd={d.fmv} className="font-mono text-[0.72rem] text-faint line-through" />
              </div>
              <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-faint">
                FMV
              </p>
            </div>
          </article>
        );
      })}
    </ScrollRow>
  );
}
