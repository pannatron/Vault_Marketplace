import Link from "next/link";
import { RARITY_META } from "../../lib/types";
import type { Collectible } from "../../lib/collect";
import CardArt from "../CardArt";
import Money from "../Money";

/** true-rarity label → holo colour var (falls back to the 5-tier meta) */
const RAR_VAR: Record<string, string> = {
  Iconic: "--color-r-iconic",
  Enchanted: "--color-r-enchanted",
  Legendary: "--color-r-legendary",
  Epic: "--color-r-epic",
  "Super Rare": "--color-r-epic",
  Rare: "--color-r-rare",
};

export default function CollectCard({ c }: { c: Collectible }) {
  const rarVar = RAR_VAR[c.rarityLabel] ?? RARITY_META[c.rarity].varName;
  const detail = c.slug ? `/market/lorcana/${c.slug}` : null;

  const body = (
    <article
      style={{ ["--rar" as string]: `var(${rarVar})` }}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-[color-mix(in_oklch,var(--rar)_55%,transparent)] hover:shadow-[0_16px_44px_-20px_var(--rar)]"
    >
      {/* art */}
      <div
        className="relative aspect-[3/4] overflow-hidden border-b border-line-soft bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklch,var(--rar)_22%,transparent),transparent_60%)]"
      >
        {c.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote card scan
          <img
            src={c.image}
            alt={c.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <CardArt rarity={c.rarity} category="lorcana" label={c.set ?? ""} className="h-full w-full" />
        )}

        {/* rarity — top-left, legible chip (never colour alone) */}
        <span
          className="absolute left-2 top-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide backdrop-blur-sm"
          style={{
            background: "color-mix(in oklch, var(--rar) 22%, var(--color-bg))",
            borderColor: "color-mix(in oklch, var(--rar) 45%, transparent)",
            color: "color-mix(in oklch, var(--rar) 55%, white)",
          }}
        >
          {c.rarityLabel}
        </span>
      </div>

      {/* facts — scannable */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 text-[0.92rem] font-bold leading-tight">{c.name}</h3>

        <div className="flex items-center gap-1.5 font-mono text-[0.66rem] text-faint">
          {c.setCode && <span className="uppercase">{c.setCode}</span>}
          {c.number && <span>· #{c.number}</span>}
          {c.set && <span className="truncate normal-case tracking-tight">· {c.set}</span>}
        </div>

        {/* จุดเด่น — one-line highlight */}
        <p className="line-clamp-2 text-[0.74rem] leading-snug text-muted">{c.why}</p>

        <div className="mt-auto flex items-center justify-between pt-1.5">
          {c.price > 0 ? (
            <Money usd={c.price} className="font-mono text-base font-bold tracking-tight" />
          ) : (
            <span className="font-mono text-[0.72rem] font-semibold text-faint">Not yet priced</span>
          )}
          {detail && (
            <span className="inline-flex items-center gap-0.5 text-[0.72rem] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Details <span aria-hidden>→</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );

  return detail ? (
    <Link href={detail} aria-label={`${c.name} — ${c.rarityLabel}, ${c.why}`} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
