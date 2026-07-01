import type { PricePoint } from "./types";

/**
 * tcgpricelookup.com adapter (https://tcgpricelookup.com/docs).
 * Auth: X-API-Key. Base: https://api.tcgpricelookup.com/v1
 *
 * Plan capabilities (verified against the provided key):
 *  - FREE tier  → raw TCGplayer prices + card images + search (≈100 req/day)
 *  - TRADER plan → graded prices (PSA/BGS/CGC) + price history
 *
 * On the free tier graded/history calls return a "requires trader plan" error,
 * so getGraded()/getHistory() resolve to null and the app falls back to its
 * existing estimated-PSA + TCGCSV-history paths. Upgrade the key's plan and
 * these light up automatically — no code change.
 */

const API = "https://api.tcgpricelookup.com/v1";

export function tcgplKey(): string | undefined {
  return process.env.TCGPL_API_KEY;
}
export function tcgplEnabled(): boolean {
  return Boolean(tcgplKey());
}

function headers(): Record<string, string> {
  return { "X-API-Key": tcgplKey() ?? "" };
}

/** one grade entry, e.g. prices.graded.psa["10"] */
interface GradedEntry {
  market?: number;
  ebay?: { avg_7d?: number; avg_30d?: number };
}

export interface TcgplCard {
  id: string;
  tcgplayer_id?: string;
  name: string;
  number?: string;
  rarity?: string;
  variant?: string;
  image_url?: string;
  set?: { name?: string; slug?: string };
  prices?: {
    raw?: Record<string, { tcgplayer?: { market?: number; low?: number; high?: number } }>;
    // graded[grader][grade] → { ebay: { avg_7d }, market }
    graded?: Record<string, Record<string, GradedEntry>>;
  };
}

/** best real price out of a grade entry: 7d eBay avg → 30d → market */
function entryPrice(v: GradedEntry | undefined): number | undefined {
  return v?.ebay?.avg_7d ?? v?.ebay?.avg_30d ?? v?.market;
}

/** Raw card search (free tier). One page (≤100). */
export async function searchLorcana(
  q: string,
  offset = 0,
  limit = 100
): Promise<{ data: TcgplCard[]; total: number }> {
  const res = await fetch(
    `${API}/cards/search?q=${encodeURIComponent(q)}&game=lorcana&limit=${limit}&offset=${offset}`,
    { headers: headers(), next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`tcgpl search ${res.status}`);
  const json = (await res.json()) as { data?: TcgplCard[]; total?: number };
  return { data: json.data ?? [], total: json.total ?? 0 };
}

// --- Trader-plan endpoints (return null when not entitled) ---

let traderCap: boolean | null = null;

/** Probe once whether the key's plan unlocks graded/history. */
export async function traderAvailable(probeCardId: string): Promise<boolean> {
  if (traderCap !== null) return traderCap;
  if (!tcgplEnabled()) return (traderCap = false);
  try {
    const res = await fetch(`${API}/cards/${probeCardId}/history`, {
      headers: headers(),
      next: { revalidate: 86_400 },
    });
    traderCap = res.ok;
  } catch {
    traderCap = false;
  }
  return traderCap;
}

export interface GradedPrice {
  grader: string; // PSA / BGS / CGC
  grade: number;
  price: number;
}

function extractGraded(c: TcgplCard | undefined): GradedPrice[] | null {
  const g = c?.prices?.graded;
  if (!g) return null; // free tier omits graded
  const out: GradedPrice[] = [];
  for (const [grader, grades] of Object.entries(g)) {
    for (const [grade, v] of Object.entries(grades)) {
      const price = entryPrice(v);
      if (price && price > 0) {
        out.push({ grader: grader.toUpperCase(), grade: Number(grade), price });
      }
    }
  }
  return out.length ? out : null;
}

/** Graded prices per grade for a card id (Trader plan). */
export async function getGraded(cardId: string): Promise<GradedPrice[] | null> {
  if (!tcgplEnabled()) return null;
  try {
    const res = await fetch(`${API}/cards/${cardId}`, {
      headers: headers(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return extractGraded((await res.json()) as TcgplCard);
  } catch {
    return null;
  }
}

/**
 * Real graded prices for a card matched by name (+ set). One search call —
 * the search result already carries the graded block on a paid plan.
 */
export async function getGradedByName(
  name: string,
  setName?: string
): Promise<GradedPrice[] | null> {
  if (!tcgplEnabled()) return null;
  try {
    const { data } = await searchLorcana(name, 0, 20);
    if (!data.length) return null;
    const norm = (s?: string) => (s ?? "").trim().toLowerCase();
    const card =
      data.find((c) => norm(c.name) === norm(name) && (!setName || norm(c.set?.name) === norm(setName))) ||
      data.find((c) => norm(c.name) === norm(name)) ||
      data.find((c) => norm(c.name).includes(norm(name))) ||
      data[0];
    return extractGraded(card);
  } catch {
    return null;
  }
}

/** Graded price history (Trader plan). */
export async function getGradedHistory(
  cardId: string,
  grader = "PSA",
  grade = 10
): Promise<PricePoint[] | null> {
  if (!tcgplEnabled()) return null;
  try {
    const res = await fetch(
      `${API}/cards/${cardId}/history?grader=${grader}&grade=${grade}`,
      { headers: headers(), next: { revalidate: 3600 } }
    );
    if (!res.ok) return null; // free tier → "requires trader plan"
    const json = (await res.json()) as {
      data?: { date: string; price: number }[];
    };
    const pts = (json.data ?? [])
      .map((p) => ({ t: Date.parse(p.date), price: p.price }))
      .filter((p) => !Number.isNaN(p.t) && p.price > 0);
    return pts.length >= 2 ? pts : null;
  } catch {
    return null;
  }
}
