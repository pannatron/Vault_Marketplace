import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLorcanaCardBySlug, ebaySearchUrl, lorcanaEbayQuery } from "../../../lib/lorcast";
import { isEbayLive } from "../../../lib/ebay";
import { getEbayPsaForCard, type PsaComp } from "../../../lib/ebay-psa";
import { generateHistory } from "../../../lib/price-history";
import { getRealSeries, appendLive } from "../../../lib/real-history";
import { RARITY_META, type PricePoint } from "../../../lib/types";
import Money from "../../../components/Money";
import CardArt from "../../../components/CardArt";
import PriceChart from "../../../components/market/PriceChart";
import Footer from "../../../components/Footer";
import { IconChevronL, IconArrowR } from "../../../components/Icons";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const card = await getLorcanaCardBySlug(slug);
  if (!card) return { title: "Card not found | Card Mania" };
  return {
    title: `${card.name}${card.version ? " — " + card.version : ""} price | Card Mania`,
    description: `Live market price and history for ${card.name} (${card.set}). See where to buy on eBay and TCGplayer.`,
  };
}

export default async function CardDetailPage({ params }: Params) {
  const { slug } = await params;
  const card = await getLorcanaCardBySlug(slug);
  if (!card) notFound();

  const meta = RARITY_META[card.rarity];
  const primary = card.priceUsd ?? card.priceFoil ?? 0;
  // Epic and up (epic / legendary / enchanted / iconic) are foil-only prints —
  // there's no separate raw vs foil, so show a single market price.
  const foilOnly = card.rarity === "epic" || card.rarity === "legendary";

  // eBay search query for this exact card — tags alt-art rarity (Enchanted /
  // Iconic) so sold/active comps don't return the cheaper base print.
  const cardTitle = card.version ? `${card.name} - ${card.version}` : card.name;
  const ebayQuery = lorcanaEbayQuery(cardTitle, card.set, card.rarityLabel);
  // PSA slab search tags only alt-art tiers (see lorcanaEbayQuery)
  const psaQuery = lorcanaEbayQuery(cardTitle, card.set, card.rarityLabel, { psa: true });

  // real eBay PSA listing for this card (lowest live ask per grade) — never estimated
  let psa10: PsaComp | null = null;
  if (isEbayLive()) {
    try {
      const comps = await getEbayPsaForCard(psaQuery);
      psa10 = comps.find((c) => c.grade === 10) ?? comps[0] ?? null;
    } catch {
      /* leave null — show no PSA rather than a fake one */
    }
  }

  // "Where to buy" — eBay active, eBay sold comps, real PSA slab, TCGplayer
  const buyLinks: { title: string; sub: string; cta: string; href: string }[] = [
    {
      title: "eBay",
      sub: "Browse active listings for this card",
      cta: "Shop",
      href: ebaySearchUrl(ebayQuery),
    },
    {
      title: "eBay · Sold",
      sub: "Recent completed sales — real price check",
      cta: "View comps",
      href: ebaySearchUrl(ebayQuery, { sold: true }),
    },
    ...(psa10
      ? [
          {
            title: `PSA ${psa10.grade} slab`,
            sub: `Lowest live eBay ask${psa10.count > 1 ? ` · ${psa10.count} listed` : ""}`,
            cta: "View slab",
            href: psa10.url,
          },
        ]
      : []),
    ...(card.tcgplayerUrl
      ? [
          {
            title: "TCGplayer",
            sub: "Market listings on TCGplayer",
            cta: "Open",
            href: card.tcgplayerUrl,
          },
        ]
      : []),
  ];

  // prefer REAL TCGplayer history; fall back to an estimated trend
  const real = getRealSeries(card.tcgplayerId);
  const isReal = !!real;

  let normalSeries: PricePoint[];
  let foilSeries: PricePoint[] | undefined;
  let hasFoil: boolean;
  let baseLabel: string;

  if (real) {
    const hasN = real.normal.length >= 2;
    const hasF = real.foil.length >= 2;
    hasFoil = hasN && hasF;
    baseLabel = hasN ? "Normal" : "Foil";
    normalSeries = appendLive(hasN ? real.normal : real.foil, hasN ? card.priceUsd : card.priceFoil);
    foilSeries = hasFoil ? appendLive(real.foil, card.priceFoil) : undefined;
  } else {
    hasFoil = card.priceUsd != null && card.priceFoil != null;
    baseLabel = card.priceUsd != null ? "Normal" : "Foil";
    normalSeries = generateHistory(`${card.id}-n`, primary);
    foilSeries =
      card.priceFoil != null && hasFoil
        ? generateHistory(`${card.id}-f`, card.priceFoil)
        : undefined;
  }

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-5 pt-6 sm:px-8">
        <Link
          href="/market/lorcana"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <IconChevronL width={16} height={16} />
          Lorcana Marketplace
        </Link>

        <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* card — big image with rarity glow */}
          <div className="mx-auto w-full max-w-[360px]">
            <div
              className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-2xl border border-line bg-bg/40"
              style={{ boxShadow: `0 24px 70px -34px var(${meta.varName})` }}
            >
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote scan
                <img
                  src={card.image}
                  alt={card.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain"
                />
              ) : (
                <CardArt rarity={card.rarity} category="lorcana" label={card.set} className="h-full w-full" />
              )}
            </div>
          </div>

          {/* info */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-black"
                style={{ background: `var(${meta.varName})` }}
              >
                {card.rarityLabel}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-[0.68rem] font-medium text-muted">
                {card.set} · #{card.number}
              </span>
              {card.ink && (
                <span className="rounded-full border border-line px-2.5 py-1 text-[0.68rem] font-medium text-muted">
                  {card.ink} ink
                </span>
              )}
            </div>

            <h1 className="mt-3 text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold leading-[1.02]">
              {card.name}
              {card.version && <span className="block text-muted">{card.version}</span>}
            </h1>

            {card.type && (
              <p className="mt-2 text-sm text-muted">
                {card.type}
                {card.cost != null && ` · ${card.cost} ink`}
              </p>
            )}

            {/* price chips — market (raw/foil split only below Epic) + PSA 10 */}
            <div className="mt-5 flex flex-wrap gap-3">
              {foilOnly ? (
                <PriceChip label="Market · foil" value={primary} accent={false} primary />
              ) : (
                <>
                  <PriceChip label="Market · raw" value={card.priceUsd} accent={false} primary />
                  <PriceChip label="Foil" value={card.priceFoil} accent />
                </>
              )}
              <PriceChip
                label={psa10 ? `PSA ${psa10.grade} · from` : "PSA 10 · from"}
                value={psa10?.price}
                accent={false}
                gold
              />
            </div>

            {/* where to buy */}
            <div className="mt-6">
              <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-faint">
                Where to buy
              </h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {buyLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-[13px] border border-line bg-surface/60 px-4 py-3 transition-all hover:border-primary/50 hover:bg-surface-2 active:translate-y-px"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[0.95rem] font-bold text-ink">{link.title}</span>
                      <span className="truncate text-[0.72rem] text-muted">{link.sub}</span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[0.82rem] font-semibold text-primary">
                      {link.cta}
                      <IconArrowR width={15} height={15} />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {(card.text || card.flavor) && (
              <div className="mt-6 space-y-2 rounded-2xl border border-line-soft bg-surface/40 p-4 text-sm leading-relaxed">
                {card.text && <p className="text-ink/90">{card.text}</p>}
                {card.flavor && <p className="italic text-faint">{card.flavor}</p>}
              </div>
            )}
          </div>
        </div>

        {/* chart */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Price history</h2>
          {normalSeries.length >= 2 ? (
            <PriceChart
              normal={normalSeries}
              foil={foilSeries}
              hasFoil={hasFoil}
              baseLabel={baseLabel}
              real={isReal}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-line bg-surface/40 px-4 py-10 text-center text-sm text-muted">
              No market price available for this card yet.
            </p>
          )}
        </section>

        <p className="mt-6 rounded-xl border border-line-soft bg-surface/40 px-4 py-3 text-[0.72rem] leading-relaxed text-faint">
          {isReal ? (
            <>
              Price history is <strong>real TCGplayer market data</strong> (daily
              snapshots via tcgcsv.com), with the latest point being the live price.
            </>
          ) : (
            <>
              No recorded history for this card yet, so the line is an{" "}
              <strong>estimated trend</strong> anchored to the live price.
            </>
          )}{" "}
          “Where to buy” links open active eBay listings, recent eBay sold comps,
          and TCGplayer for this card. As an eBay Partner, Card Mania may earn a
          commission on qualifying purchases.
        </p>
      </div>

      <Footer />
    </>
  );
}

function PriceChip({
  label,
  value,
  accent,
  primary,
  gold,
}: {
  label: string;
  value?: number;
  accent: boolean;
  primary?: boolean;
  gold?: boolean;
}) {
  const has = value != null && value > 0;
  return (
    <div
      className={`flex flex-col rounded-2xl border px-4 py-3 ${
        primary
          ? "border-primary/40 bg-primary/5"
          : gold
          ? "border-gold/40 bg-gold/5"
          : accent
          ? "border-accent/30 bg-accent/5"
          : "border-line bg-surface/60"
      }`}
    >
      <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-faint">
        {label}
      </span>
      <span
        className={`font-mono text-xl font-bold tabular-nums ${
          has
            ? primary
              ? "text-primary"
              : gold
              ? "text-gold"
              : accent
              ? "text-accent"
              : "text-ink"
            : "text-faint"
        }`}
      >
        {has ? <Money usd={value!} /> : "—"}
      </span>
    </div>
  );
}
