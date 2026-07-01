import { categories } from "../lib/data";
import { RARITY_META } from "../lib/types";
import CardArt from "./CardArt";
import { SmartLink } from "./nav";

export default function CategoryRail() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((c) => {
        const meta = RARITY_META[c.rarity];
        const href = c.key === "lorcana" ? "/market/lorcana" : "#deals";
        return (
          <SmartLink
            key={c.key}
            href={href}
            className="hover-lift group flex items-center gap-3.5 overflow-hidden rounded-2xl border border-line bg-surface p-3 hover:border-line"
          >
            <CardArt
              rarity={c.rarity}
              category={c.key}
              slab={false}
              className="aspect-square w-16 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="truncate text-[0.95rem] font-semibold">{c.label}</h3>
              <p className="mt-0.5 font-mono text-[0.72rem] text-muted">{c.count}</p>
              <span
                className="mt-1.5 inline-block text-[0.66rem] font-semibold uppercase tracking-wide"
                style={{ color: `var(${meta.varName})` }}
              >
                {c.key === "lorcana" ? "Shop now →" : `${meta.label} chase`}
              </span>
            </div>
          </SmartLink>
        );
      })}
    </div>
  );
}
