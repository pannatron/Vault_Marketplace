import type { Listing, Rarity } from "./types";
import { appToken, EBAY_API, EBAY_MARKETPLACE } from "./ebay";

/**
 * Real PSA-graded Lorcana listings from the eBay Browse API.
 * Groups by card + grade, keeps the HIGHEST current price per group, and uses
 * the seller's slab photo. Only runs when EBAY creds are configured.
 */

interface EbayItem {
  itemId: string;
  title: string;
  itemWebUrl: string;
  itemAffiliateWebUrl?: string;
  image?: { imageUrl: string };
  thumbnailImages?: { imageUrl: string }[];
  price?: { value: string; currency: string };
  currentBidPrice?: { value: string; currency: string };
  bidCount?: number;
}

const GRADE_LABEL: Record<number, string> = { 10: "GEM MT", 9: "MINT", 8: "NM-MT", 7: "NM" };

function parseGrade(title: string): number | null {
  const m = title.match(/PSA\s*(10|9|8|7)\b/i);
  return m ? Number(m[1]) : null;
}

/**
 * Crude card identity from a title — strips grading, set, rarity, and number
 * noise so an eBay listing title and a Lorcast card name collapse to the same
 * key. Used to join real eBay PSA prices onto Lorcast cards.
 */
export function lorcanaCardKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/psa\s*\d+(\.\d)?/g, "")
    .replace(/\bgem\s*mt\b|\bmint\b|\bnm-?mt\b|\bnm\b|\bgraded\b/gi, "")
    .replace(/\bdisney\b|\blorcana\b|\btcg\b|\bcard\b|\benglish\b/gi, "")
    .replace(/the first chapter|rise of the floodborn|into the inklands|ursula'?s return|shimmering skies|azurite sea|reign of jafar|fabled|whispers in the well/gi, "")
    .replace(/\benchanted\b|\biconic\b|\blegendary\b|\bepic\b|\bsuper\s*rare\b|\brare\b|\buncommon\b|\bcommon\b|\bpromo\b|\bcold\s*foil\b|\bfoil\b|\bholo\b/gi, "")
    .replace(/#?\d+\s*\/\s*\d+/g, "") // 211/204
    .replace(/#?\d{2,}/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rarityFromPrice(p: number): Rarity {
  if (p >= 200) return "legendary";
  if (p >= 60) return "epic";
  if (p >= 20) return "rare";
  return "uncommon";
}

export async function getEbayPsaCards(): Promise<Listing[]> {
  const token = await appToken();
  const params = new URLSearchParams({
    q: "Disney Lorcana PSA",
    category_ids: "183454", // CCG Individual Cards
    limit: "200",
    filter: "buyingOptions:{FIXED_PRICE}",
    sort: "-price",
  });
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE,
    "Content-Type": "application/json",
  };
  if (process.env.EBAY_CAMPAIGN_ID) {
    headers["X-EBAY-C-ENDUSERCTX"] = `affiliateCampaignId=${process.env.EBAY_CAMPAIGN_ID}`;
  }

  const res = await fetch(`${EBAY_API}/buy/browse/v1/item_summary/search?${params}`, {
    headers,
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`ebay-psa ${res.status}`);
  const json = (await res.json()) as { itemSummaries?: EbayItem[] };

  // group by card+grade, keep the highest-priced listing + count the group
  const groups = new Map<string, { item: EbayItem; price: number; grade: number; count: number }>();
  for (const it of json.itemSummaries ?? []) {
    const grade = parseGrade(it.title);
    if (grade == null) continue; // PSA only
    const price = it.price ? parseFloat(it.price.value) : 0;
    if (!price) continue;
    const key = `${lorcanaCardKey(it.title)}|${grade}`;
    const cur = groups.get(key);
    if (!cur) groups.set(key, { item: it, price, grade, count: 1 });
    else {
      cur.count++;
      if (price > cur.price) {
        cur.item = it;
        cur.price = price;
      }
    }
  }

  const cards: Listing[] = [];
  for (const [, g] of groups) {
    const img = g.item.image?.imageUrl || g.item.thumbnailImages?.[0]?.imageUrl;
    cards.push({
      id: g.item.itemId,
      title: g.item.title,
      cardName: g.item.title,
      price: g.price,
      marketPrice: g.price,
      shipping: 0,
      currency: "USD",
      grade: g.grade,
      gradeLabel: GRADE_LABEL[g.grade] ?? "",
      isSlab: true,
      psaCount: g.count,
      estimated: false, // real eBay graded listing
      conditionGroup: "graded",
      conditionLabel: `PSA ${g.grade}`,
      rarity: rarityFromPrice(g.price),
      image: img,
      url: g.item.itemAffiliateWebUrl || g.item.itemWebUrl,
      marketplace: "ebay",
    });
  }
  cards.sort((a, b) => b.price - a.price);
  return cards;
}

/** PSA cert only when the seller actually printed it in the title — never invented. */
function parseCert(title: string): string | undefined {
  const m = title.match(/cert(?:ification)?\.?\s*#?\s*(\d{7,9})\b/i);
  return m ? m[1] : undefined;
}

/** Drop lots / bundles / sealed — they inflate a single-card price. */
function isSingleSlab(title: string): boolean {
  return !/\b(lot|lots|bundle|sealed|booster|case|playset|set of|complete|x\s?[2-9]|[2-9]\s?x\b|\d+\s*cards?)\b/i.test(
    title
  );
}

/** Drop non-English prints (Japanese/Korean/Chinese) — different card, different price. */
function isEnglishPrint(title: string): boolean {
  return !/japan|japanese|\bjpn\b|\bja\s?\d|korean|korea|chinese|中文|日本|ジャパン|한국/i.test(
    title
  );
}

/**
 * Low percentile of the asks. eBay Browse only exposes ASKING prices (no sold),
 * and the cheapest live asks sit closest to what cards actually sell for — so a
 * low percentile (p25) is the best free proxy for market without paid sold data.
 */
function percentile(nums: number[], p: number): number {
  const s = [...nums].sort((a, b) => a - b);
  if (s.length === 1) return s[0];
  const idx = (s.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

/** One real, live PSA listing for the page's price box / buy link. */
export interface PsaComp {
  grade: number;
  gradeLabel: string;
  /** low percentile (p25) of live asks — cheapest realistic ask, a free sold proxy */
  price: number;
  /** how many live listings back it */
  count: number;
  /** total bids across this card's live auctions — a "heat" signal */
  bids: number;
  /** the actual eBay item nearest the median, not a search */
  url: string;
  image?: string;
  cert?: string;
}

/**
 * Real PSA listings for ONE card, grouped by grade. Each entry links to a
 * genuine eBay item with a real asking price — the evidence the detail page
 * needs instead of a synthesized estimate. Empty when nothing is listed.
 */
export async function getEbayPsaForCard(query: string): Promise<PsaComp[]> {
  const token = await appToken();
  const params = new URLSearchParams({
    q: `${query} PSA`,
    category_ids: "183454", // CCG Individual Cards
    limit: "100",
    // No buyingOptions filter → include BOTH fixed-price AND auctions. A live
    // auction with bids is the closest signal to a real sale; a just-started
    // 0-bid auction is noise and gets dropped below.
    // NOTE: do NOT add sort=price — it collapses results to ~1 item.
  });
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE,
    "Content-Type": "application/json",
  };
  if (process.env.EBAY_CAMPAIGN_ID) {
    headers["X-EBAY-C-ENDUSERCTX"] = `affiliateCampaignId=${process.env.EBAY_CAMPAIGN_ID}`;
  }

  const res = await fetch(`${EBAY_API}/buy/browse/v1/item_summary/search?${params}`, {
    headers,
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`ebay-psa-card ${res.status}`);
  const json = (await res.json()) as { itemSummaries?: EbayItem[] };

  // collect every single-slab ask per grade, then take the MEDIAN — one
  // overpriced "buy it now" listing no longer sets the price.
  const byGrade = new Map<number, { item: EbayItem; price: number }[]>();
  for (const it of json.itemSummaries ?? []) {
    const grade = parseGrade(it.title);
    if (grade == null) continue;
    if (!isSingleSlab(it.title)) continue;
    if (!isEnglishPrint(it.title)) continue;

    // pick the price that best reflects a real sale:
    //  - auction WITH bids → the current bid (climbs toward final value)
    //  - fixed-price / auction+BIN → the listed ask
    //  - auction with 0 bids → skip (just-started lowball = noise)
    const bids = it.bidCount ?? 0;
    let price = 0;
    if (it.currentBidPrice && bids >= 1) {
      price = parseFloat(it.currentBidPrice.value);
    } else if (it.price) {
      price = parseFloat(it.price.value);
    }
    if (!price) continue;

    const arr = byGrade.get(grade) ?? [];
    arr.push({ item: it, price });
    byGrade.set(grade, arr);
  }

  return [...byGrade.entries()]
    // need ≥2 listings before a price means anything — a lone listing at a
    // moon-shot ask is noise, but 2+ gives a defensible low end.
    .filter(([, items]) => items.length >= 2)
    .map(([grade, items]) => {
      const low = percentile(items.map((x) => x.price), 0.25);
      // representative listing = the one closest to that low ask
      const rep = items.reduce((best, x) =>
        Math.abs(x.price - low) < Math.abs(best.price - low) ? x : best
      );
      const bids = items.reduce((s, x) => s + (x.item.bidCount ?? 0), 0);
      return {
        grade,
        gradeLabel: GRADE_LABEL[grade] ?? "",
        price: low,
        count: items.length,
        bids,
        url: rep.item.itemAffiliateWebUrl || rep.item.itemWebUrl,
        image: rep.item.image?.imageUrl || rep.item.thumbnailImages?.[0]?.imageUrl,
        cert: parseCert(rep.item.title),
      };
    })
    .sort((a, b) => b.grade - a.grade);
}
