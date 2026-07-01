import type { PricePoint } from "./types";

/**
 * Price history.
 *
 * No free historical price API exists for Lorcana, so this synthesizes a
 * DETERMINISTIC series (same card → same curve every load) anchored so the
 * final point equals the real current market price from Lorcast. It models a
 * plausible market: per-card drift, volatility scaled to price, and occasional
 * spikes. The UI labels it as an estimate.
 *
 * To wire real data later, replace generateHistory() with a provider call
 * (e.g. PriceCharting / TCGplayer history) keyed by the same card.
 */

function hash(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;

export function generateHistory(
  seed: string,
  current: number,
  days = 365
): PricePoint[] {
  if (!current || current <= 0) return [];
  // anchored to the current day; impurity isolated to this lib function
  const now = Date.now();
  const rnd = mulberry32(hash(seed));

  // per-card character
  const drift = (rnd() - 0.45) * 0.004; // slight bias up or down
  const vol = 0.018 + rnd() * 0.04; // daily volatility

  // build a multiplicative random walk, then rescale so the last point == current
  const raw: number[] = new Array(days);
  let p = 1;
  for (let i = 0; i < days; i++) {
    let step = drift + (rnd() - 0.5) * vol;
    // occasional spike / dip
    if (rnd() > 0.985) step += (rnd() - 0.5) * 0.5;
    p *= Math.exp(step);
    raw[i] = p;
  }
  const scale = current / raw[days - 1];

  // align series end to today (midnight-ish)
  const end = Math.floor(now / DAY) * DAY;
  const out: PricePoint[] = new Array(days);
  for (let i = 0; i < days; i++) {
    const price = Math.max(0.01, raw[i] * scale);
    out[i] = {
      t: end - (days - 1 - i) * DAY,
      price: Math.round(price * 100) / 100,
    };
  }
  // guarantee exact current at the end
  out[days - 1].price = Math.round(current * 100) / 100;
  return out;
}

export interface RangeStat {
  points: PricePoint[];
  change: number; // absolute
  changePct: number;
  low: number;
  high: number;
}

/**
 * Slice to the last N days by TIMESTAMP (data may be irregularly spaced — real
 * history is sparse in the past, daily recently). Downsample only dense series.
 */
export function sliceRange(all: PricePoint[], days: number): RangeStat {
  if (all.length === 0)
    return { points: [], change: 0, changePct: 0, low: 0, high: 0 };

  const end = all[all.length - 1].t;
  const start = end - days * DAY;
  let tail = all.filter((p) => p.t >= start);
  if (tail.length < 2) tail = all.slice(-2); // always enough for a line

  // thin out only when there are far more points than pixels need
  const points =
    tail.length > 90
      ? tail.filter((_, i) => i % Math.ceil(tail.length / 90) === 0 || i === tail.length - 1)
      : tail;

  const first = tail[0]?.price ?? 0;
  const last = tail[tail.length - 1]?.price ?? 0;
  let low = Infinity;
  let high = -Infinity;
  for (const p of tail) {
    if (p.price < low) low = p.price;
    if (p.price > high) high = p.price;
  }
  return {
    points,
    change: Math.round((last - first) * 100) / 100,
    changePct: first ? Math.round(((last - first) / first) * 1000) / 10 : 0,
    low: low === Infinity ? 0 : low,
    high: high === -Infinity ? 0 : high,
  };
}
