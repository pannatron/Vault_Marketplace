import Link from "next/link";
import { RARITY_META } from "../../lib/types";
import type { Rec, RecReason } from "../../lib/recommend";
import Money from "../Money";
import CardArt from "../CardArt";

export const RAR_VAR: Record<string, string> = {
  Iconic: "--color-r-iconic",
  Enchanted: "--color-r-enchanted",
  Legendary: "--color-r-legendary",
  Epic: "--color-r-epic",
  "Super Rare": "--color-r-epic",
  Rare: "--color-r-rare",
};

export const REASON: Record<RecReason, { tag: string; icon: string; color: string }> = {
  hotbids: { tag: "In demand", icon: "🔨", color: "var(--color-accent)" },
  scarce: { tag: "Scarce", icon: "✦", color: "var(--color-primary)" },
  up: { tag: "Heating up", icon: "▲", color: "var(--color-success)" },
  down: { tag: "Cooling off", icon: "▼", color: "var(--color-accent)" },
  watch: { tag: "Volatile", icon: "◆", color: "var(--color-gold)" },
};

/** Longer, editorial "why" — for the spotlight thread. */
export function whyParagraph(m: Rec, windowDays: number): string {
  switch (m.reason) {
    case "hotbids":
      return `${m.bids} live bids are in across its open auctions — collectors are actively competing for this one right now, a sign demand is outrunning supply.`;
    case "scarce":
      return `Only ${m.listings} graded ${m.listings === 1 ? "copy is" : "copies are"} listed on eBay right now. Supply this thin means even a little fresh demand can move the price quickly.`;
    case "up":
      return `Up ${Math.abs(m.pct)}% over the last ${windowDays} days — one of the set's faster climbers lately. Momentum like this can keep running, or cool off just as fast.`;
    case "down":
      return `Down ${Math.abs(m.pct)}% over the last ${windowDays} days, cooling from a recent high — worth a look if you've had your eye on it.`;
    case "watch":
      return `Its price has swung ${Math.abs(m.pct)}% lately — unsettled, and worth keeping on your radar either way.`;
  }
}

/** Plain-language "why we surfaced this card" line. */
export function whyText(m: Rec, windowDays: number): string {
  switch (m.reason) {
    case "hotbids":
      return `${m.bids} live bids right now — people are buying it up`;
    case "scarce":
      return `Only ${m.listings} graded ${m.listings === 1 ? "copy" : "copies"} left on the market`;
    case "up":
      return `Price up ${Math.abs(m.pct)}% in the last ${windowDays} days`;
    case "down":
      return `Price down ${Math.abs(m.pct)}% in the last ${windowDays} days`;
    case "watch":
      return `Swinging ${Math.abs(m.pct)}% lately — worth keeping an eye on`;
  }
}

export default function RecCard({ m, windowDays }: { m: Rec; windowDays: number }) {
  const meta = RARITY_META[m.rarity];
  const detail = m.slug ? `/market/lorcana/${m.slug}` : null;
  const tierLabel = m.rarityLabel ?? meta.label;
  const rarVar = RAR_VAR[tierLabel] ?? meta.varName;
  const r = REASON[m.reason];
  const why = whyText(m, windowDays);

  const inner = (
    <div className="flex h-full gap-4 p-4">
      <div
        className="relative grid aspect-[3/4] w-[96px] shrink-0 place-items-center overflow-hidden rounded-[10px] border border-line bg-bg/40"
        style={{ boxShadow: `0 8px 24px -16px var(${rarVar})` }}
      >
        {m.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote scan
          <img
            src={m.image}
            alt={m.cardName ?? m.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain"
          />
        ) : (
          <CardArt rarity={m.rarity} category="lorcana" label={m.set} className="h-full w-full" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide"
          style={{ background: `color-mix(in oklch, ${r.color} 15%, transparent)`, color: r.color }}
        >
          {r.icon} {r.tag}
        </span>

        <h3 className="mt-1.5 line-clamp-1 text-[1rem] font-bold leading-tight">
          {m.cardName ?? m.title}
        </h3>
        <span className="truncate text-[0.7rem] text-faint">
          {m.set} · {tierLabel}
        </span>

        {/* the WHY — front and centre */}
        <p
          className="mt-2 line-clamp-2 text-[0.82rem] font-semibold leading-snug"
          style={{ color: r.color }}
        >
          {why}
        </p>

        <div className="mt-auto pt-2">
          <Money usd={m.price} className="font-mono text-lg font-bold tracking-tight" />
          <span className="ml-1 text-[0.62rem] text-faint">market price</span>
        </div>
      </div>
    </div>
  );

  return (
    <article
      style={{ ["--rar" as string]: `var(${rarVar})` }}
      className="hover-lift relative h-full overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-[color-mix(in_oklch,var(--rar)_55%,transparent)] hover:shadow-[0_12px_36px_-16px_var(--rar)]"
    >
      {detail ? (
        <Link href={detail} aria-label={`${m.cardName ?? m.title} — ${why}`} className="block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </article>
  );
}
