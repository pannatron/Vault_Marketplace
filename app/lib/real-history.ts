import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { PricePoint } from "./types";

/**
 * Real Lorcana price history, sourced from TCGplayer daily snapshots
 * (built offline by scripts/build-price-history.mjs from tcgcsv.com archives).
 * Keyed by TCGplayer productId, which equals Lorcast's tcgplayer_id.
 */

interface HistoryFile {
  generatedAt: number;
  source: string;
  dates: string[];
  points: Record<string, { n?: [number, number][]; f?: [number, number][] }>;
}

let cache: { mtime: number; data: HistoryFile | null } | null = null;

function load(): HistoryFile | null {
  const file = join(process.cwd(), "app", "data", "price-history.json");
  let mtime = 0;
  try {
    mtime = statSync(file).mtimeMs;
  } catch {
    return null;
  }
  // reload only when the file changes (daily cron rewrites it)
  if (cache && cache.mtime === mtime) return cache.data;
  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as HistoryFile;
    cache = { mtime, data };
  } catch {
    cache = { mtime, data: null };
  }
  return cache.data;
}

const toPoints = (pairs?: [number, number][]): PricePoint[] =>
  (pairs ?? []).map(([t, price]) => ({ t, price }));

export interface RealSeries {
  normal: PricePoint[];
  foil: PricePoint[];
  source: string;
  asOf: number;
}

/** Append the live price as the freshest point when the snapshot is stale. */
export function appendLive(
  pts: PricePoint[],
  live?: number
): PricePoint[] {
  if (!live || live <= 0) return pts;
  const now = Date.now();
  const last = pts[pts.length - 1];
  if (last && now - last.t > 6 * 3_600_000) {
    return [...pts, { t: now, price: live }];
  }
  return pts;
}

/** Returns real history for a TCGplayer product id, or null when unavailable. */
export function getRealSeries(
  tcgplayerId?: string | number | null
): RealSeries | null {
  if (tcgplayerId == null) return null;
  const data = load();
  if (!data) return null;
  const rec = data.points[String(tcgplayerId)];
  if (!rec) return null;
  const normal = toPoints(rec.n);
  const foil = toPoints(rec.f);
  if (normal.length < 2 && foil.length < 2) return null;
  return {
    normal,
    foil,
    source: data.source,
    asOf: data.dates[data.dates.length - 1]
      ? Date.parse(data.dates[data.dates.length - 1] + "T00:00:00Z")
      : data.generatedAt,
  };
}
