import type { Listing, Mover } from "./types";
import { getRealSeries } from "./real-history";
import { sliceRange } from "./price-history";

/**
 * Recommendations derived from REAL market price history (TCGplayer):
 *  - trending: biggest % gainers over the window (heating up)
 *  - watch:    biggest movers worth watching
 *  - cooling:  biggest % droppers (price falling)
 *
 * Price + image shown are the raw market card (Lorcast / TCGplayer).
 */
export interface Movers {
  trending: Mover[];
  watch: Mover[];
  cooling: Mover[];
  windowDays: number;
}

function build(listing: Listing, windowDays: number): Mover | null {
  const real = getRealSeries(listing.tcgplayerId);
  if (!real) return null;
  const series = real.normal.length >= 2 ? real.normal : real.foil;
  if (series.length < 2) return null;

  const stat = sliceRange(series, windowDays);
  if (stat.points.length < 2) return null;

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    set: listing.set,
    image: listing.image,
    rarity: listing.rarity,
    rarityLabel: listing.rarityLabel,
    price: listing.price, // raw market price
    marketPrice: listing.price,
    pct: stat.changePct,
    spark: stat.points.map((p) => p.price),
  };
}

export function getMovers(listings: Listing[], windowDays = 30): Movers {
  const all: Mover[] = [];
  for (const l of listings) {
    const m = build(l, windowDays);
    if (m) all.push(m);
  }

  // ignore sub-$3 raw noise: keep movers whose card is meaningfully priced
  const meaningful = all.filter((m) => m.price >= 3);

  const trending = meaningful
    .filter((m) => m.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 12);
  const trendIds = new Set(trending.map((m) => m.id));

  const cooling = meaningful
    .filter((m) => m.pct < 0)
    .sort((a, b) => a.pct - b.pct) // most negative first
    .slice(0, 12);
  const coolIds = new Set(cooling.map((m) => m.id));

  const watch = meaningful
    .filter((m) => Math.abs(m.pct) >= 5 && !trendIds.has(m.id) && !coolIds.has(m.id))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 12);

  return { trending, watch, cooling, windowDays };
}
