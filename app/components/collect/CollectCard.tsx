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

function Block({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <h4 className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-faint">
        {label}
      </h4>
      <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export default function CollectCard({ c }: { c: Collectible }) {
  const rarVar = RAR_VAR[c.rarityLabel] ?? RARITY_META[c.rarity].varName;
  const detail = c.slug ? `/market/lorcana/${c.slug}` : null;

  return (
    <article
      style={{ ["--rar" as string]: `var(${rarVar})` }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-[color-mix(in_oklch,var(--rar)_55%,transparent)] hover:shadow-[0_16px_44px_-20px_var(--rar)]"
    >
      <div className="flex gap-4 p-4">
        <div
          className="relative aspect-[3/4] w-[112px] shrink-0 overflow-hidden rounded-[11px] border border-line bg-bg/40"
          style={{ boxShadow: `0 10px 30px -18px var(--rar)` }}
        >
          {c.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote card scan
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain"
            />
          ) : (
            <CardArt rarity={c.rarity} category="lorcana" label={c.set ?? ""} className="h-full w-full" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide"
            style={{ background: `color-mix(in oklch, var(--rar) 16%, transparent)`, color: `var(--rar)` }}
          >
            {c.rarityLabel}
          </span>
          <h3 className="mt-1.5 line-clamp-2 text-[1.05rem] font-extrabold leading-tight">
            {c.name}
          </h3>
          {c.set && <span className="truncate text-[0.72rem] text-faint">{c.set}</span>}
          <div className="mt-auto pt-2">
            <Money usd={c.price} className="font-mono text-xl font-bold tracking-tight" />
            <span className="ml-1 text-[0.62rem] text-faint">market price</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-line-soft px-4 py-4">
        <Block label="Why collect">{c.why}</Block>
        <Block label="How to get one">{c.howToGet}</Block>
        <Block label="In competitive play">{c.play}</Block>
      </div>

      {detail && (
        <Link
          href={detail}
          className="mt-auto flex items-center justify-between border-t border-line-soft px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          View price history &amp; where to buy
          <span aria-hidden>→</span>
        </Link>
      )}
    </article>
  );
}
