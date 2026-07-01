import Link from "next/link";
import type { Listing } from "../../lib/types";
import { RARITY_META } from "../../lib/types";
import Money from "../Money";
import { IconArrowR, IconBolt } from "../Icons";

/** Rarity color var for a card — alt-art tiers beat the collapsed 5-tier. */
function rarVarOf(card: Listing): string {
  const label = (card.rarityLabel ?? "").toLowerCase();
  const special = (
    { enchanted: "--color-r-enchanted", iconic: "--color-r-iconic" } as Record<string, string>
  )[label];
  return special ?? RARITY_META[card.rarity].varName;
}

// fan geometry per slot (render order: back-left, back-right, front)
const FAN = [
  "rotate-[-12deg] -translate-x-[48%] scale-[0.88] z-10",
  "rotate-[10deg] translate-x-[48%] scale-[0.88] z-10",
  "rotate-0 scale-100 z-20",
];

/** Home hero featuring real top-value Disney Lorcana cards. */
export default function LorcanaHero({ cards }: { cards: Listing[] }) {
  const [a, b, c] = cards;
  const fan = [c, b, a]; // render back-to-front so the center card sits on top
  const glowVar = a ? rarVarOf(a) : "--color-primary";

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-line bg-gradient-to-br from-surface to-bg p-6 sm:p-10">
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
      />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
            <span aria-hidden>❖</span> Disney Lorcana
          </span>
          <h1 className="mt-4 text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[0.98] tracking-tight text-balance">
            Every Lorcana card,
            <span className="block text-primary">priced live.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Real TCGplayer market values and year-long price history for the
            whole set. Spot what&apos;s heating up before it pops.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/market/lorcana"
              className="inline-flex h-12 items-center gap-2 rounded-[13px] bg-primary px-6 text-[0.95rem] font-bold text-primary-ink transition-all hover:bg-primary-strong active:translate-y-px"
            >
              Browse the market
              <IconArrowR width={17} height={17} />
            </Link>
            {a?.slug && (
              <Link
                href={`/market/lorcana/${a.slug}`}
                className="inline-flex h-12 items-center gap-2 rounded-[13px] border border-line bg-white/5 px-5 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-white/10"
              >
                <IconBolt width={16} height={16} className="text-primary" />
                Top card: {a.title.split(" - ")[0]}
              </Link>
            )}
          </div>
        </div>

        {/* fanned featured cards */}
        <div className="relative mx-auto flex h-[360px] w-full max-w-[480px] items-center justify-center sm:h-[480px]">
          {/* soft rarity-keyed backlight behind the center card */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[72%] w-[58%] rounded-[40%] opacity-50 blur-[60px]"
            style={{
              background: `radial-gradient(circle, color-mix(in oklch, var(${glowVar}) 55%, transparent), transparent 72%)`,
            }}
          />

          {fan.filter(Boolean).map((card, i) => {
            const rarVar = rarVarOf(card);
            const isCenter = i === 2;
            return (
              <div
                key={card.id}
                className={`group absolute aspect-[3/4] w-[56%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-30 hover:rotate-0 hover:scale-100 ${FAN[i]}`}
              >
                <Link
                  href={card.slug ? `/market/lorcana/${card.slug}` : "/market/lorcana"}
                  aria-label={`${card.title} — view price`}
                  className="block h-full w-full"
                >
                  <div
                    className="hero-card relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-bg"
                    style={{ "--rar": `var(${rarVar})` } as React.CSSProperties}
                  >
                    {card.image && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote scan
                      <img
                        src={card.image}
                        alt={card.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    )}
                    {isCenter && (
                      <span className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-center bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 pt-8">
                        <Money usd={card.price} className="font-mono text-base font-bold tracking-tight text-white drop-shadow" />
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
