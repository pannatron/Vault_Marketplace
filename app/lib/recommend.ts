import type { Listing, Mover } from "./types";
import { getMovers } from "./movers";
import { isEbayLive } from "./ebay";
import { getEbayPsaForCard } from "./ebay-psa";
import { lorcanaEbayQuery } from "./lorcast";

/**
 * Card spotlight — surfaces cards that are *interesting right now* from several
 * independent market signals (price momentum, thin supply, live bidding heat).
 * Descriptive only: this is market data, NOT investment advice.
 */
export type RecReason = "hotbids" | "scarce" | "up" | "down" | "watch";

export interface Rec extends Mover {
  reason: RecReason;
  /** live eBay PSA 10 listing count (low = scarce) */
  listings?: number;
  /** total live auction bids (high = hot) */
  bids?: number;
}

const HOT_BIDS = 4; // total live bids that count as "hot"
const SCARCE_MAX = 3; // ≤ this many live listings = "scarce"
const ENRICH = 14; // cap on eBay lookups per build

export async function getRecommendations(
  listings: Listing[],
  windowDays = 30
): Promise<Rec[]> {
  const m = getMovers(listings, windowDays);

  // candidate pool = the union of momentum movers, de-duped
  const seen = new Set<string>();
  const pool: Mover[] = [];
  for (const x of [...m.trending, ...m.cooling, ...m.watch]) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    pool.push(x);
  }
  const top = pool.slice(0, ENRICH);

  // enrich with real eBay supply + bidding signals (cached per card)
  const recs: Rec[] = await Promise.all(
    top.map(async (x) => {
      const rec: Rec = { ...x, reason: "watch" };
      if (isEbayLive()) {
        try {
          const q = lorcanaEbayQuery(x.title, x.set, x.rarityLabel, { psa: true });
          const comps = await getEbayPsaForCard(q);
          const c10 = comps.find((c) => c.grade === 10) ?? comps[0];
          if (c10) {
            rec.listings = c10.count;
            rec.bids = c10.bids;
          }
        } catch {
          /* signals optional — fall back to momentum only */
        }
      }
      return rec;
    })
  );

  // strongest signal wins the reason
  for (const r of recs) {
    if ((r.bids ?? 0) >= HOT_BIDS) r.reason = "hotbids";
    else if (r.listings != null && r.listings <= SCARCE_MAX) r.reason = "scarce";
    else if (r.pct > 0) r.reason = "up";
    else if (r.pct < 0) r.reason = "down";
    else r.reason = "watch";
  }

  // lead with bidding heat, then scarcity, then biggest movers
  const order: Record<RecReason, number> = { hotbids: 0, scarce: 1, up: 2, watch: 3, down: 4 };
  recs.sort(
    (a, b) => order[a.reason] - order[b.reason] || Math.abs(b.pct) - Math.abs(a.pct)
  );
  return recs.slice(0, 10);
}
