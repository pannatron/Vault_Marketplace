import type { ConditionGroup, Listing, Rarity } from "./types";
import { lorcanaMock } from "./lorcana-mock";
import { getLorcastListings } from "./lorcast";

export type ListingSource = "ebay" | "lorcast" | "mock";

/**
 * eBay Browse API adapter.
 *
 * Live data turns on automatically when these env vars are present:
 *   EBAY_CLIENT_ID       — App ID (Client ID) from developer.ebay.com
 *   EBAY_CLIENT_SECRET   — Cert ID (Client Secret)
 *   EBAY_CAMPAIGN_ID     — (optional) eBay Partner Network campaign id → affiliate links + commission
 *   EBAY_MARKETPLACE     — (optional) marketplace id, defaults to EBAY_US
 *   EBAY_ENV             — (optional) "sandbox" to hit sandbox endpoints
 *
 * Without credentials it serves realistic mock listings so the page renders.
 */

const isSandbox = process.env.EBAY_ENV === "sandbox";
export const EBAY_API = isSandbox
  ? "https://api.sandbox.ebay.com"
  : "https://api.ebay.com";
export const EBAY_MARKETPLACE = process.env.EBAY_MARKETPLACE || "EBAY_US";
const API = EBAY_API;
const MARKETPLACE = EBAY_MARKETPLACE;

export function isEbayLive(): boolean {
  return Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
}

interface TokenResp {
  access_token: string;
  expires_in: number;
}

export async function appToken(): Promise<string> {
  const basic = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${API}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    // app token lives ~2h; reuse for an hour
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`eBay token ${res.status}`);
  const json = (await res.json()) as TokenResp;
  return json.access_token;
}

// eBay item_summary shape (only the fields we read)
interface EbayItem {
  itemId: string;
  title: string;
  itemWebUrl: string;
  itemAffiliateWebUrl?: string;
  image?: { imageUrl: string };
  thumbnailImages?: { imageUrl: string }[];
  price?: { value: string; currency: string };
  shippingOptions?: { shippingCost?: { value: string } }[];
  condition?: string;
  seller?: { username?: string; feedbackPercentage?: string };
}

function conditionGroup(condition: string, title: string): ConditionGroup {
  const c = `${condition} ${title}`.toLowerCase();
  if (/(sealed|booster box|booster pack|trove|collection|bundle)/.test(c))
    return "sealed";
  if (/(psa|cgc|bgs|graded|gem mint|slab)/.test(c)) return "graded";
  return "single";
}

function rarityFromTitle(title: string, price: number): Rarity {
  const t = title.toLowerCase();
  if (/enchanted|gem mint|psa 10/.test(t) || price >= 90) return "legendary";
  if (/legendary/.test(t)) return "legendary";
  if (/super rare|epic/.test(t) || price >= 25) return "epic";
  if (/\brare\b/.test(t) || price >= 8) return "rare";
  if (/uncommon|promo|foil/.test(t)) return "uncommon";
  return "common";
}

function normalize(item: EbayItem): Listing {
  const price = item.price ? parseFloat(item.price.value) : 0;
  const ship = item.shippingOptions?.[0]?.shippingCost?.value;
  const title = item.title ?? "Untitled";
  return {
    id: item.itemId,
    title,
    price,
    shipping: ship ? parseFloat(ship) : 0,
    currency: item.price?.currency ?? "USD",
    conditionLabel: item.condition || "See listing",
    conditionGroup: conditionGroup(item.condition ?? "", title),
    rarity: rarityFromTitle(title, price),
    image:
      item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || undefined,
    url: item.itemAffiliateWebUrl || item.itemWebUrl,
    marketplace: "ebay",
    seller: item.seller?.username,
    feedback: item.seller?.feedbackPercentage
      ? parseFloat(item.seller.feedbackPercentage)
      : undefined,
  };
}

export async function getLorcanaListings(): Promise<{
  listings: Listing[];
  source: ListingSource;
}> {
  // No eBay app creds → use Lorcast for real images + market prices,
  // with buy buttons pointing at eBay searches.
  if (!isEbayLive()) {
    try {
      const listings = await getLorcastListings();
      if (listings.length) return { listings, source: "lorcast" };
    } catch (err) {
      console.error("[lorcast] falling back to mock:", err);
    }
    return { listings: lorcanaMock, source: "mock" };
  }

  try {
    const token = await appToken();

    const params = new URLSearchParams({
      q: "Disney Lorcana",
      category_ids: "2536", // Collectible Card Games
      limit: "48",
      sort: "newlyListed",
      filter: "buyingOptions:{FIXED_PRICE}",
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE,
      "Content-Type": "application/json",
    };
    if (process.env.EBAY_CAMPAIGN_ID) {
      headers["X-EBAY-C-ENDUSERCTX"] =
        `affiliateCampaignId=${process.env.EBAY_CAMPAIGN_ID}`;
    }

    const res = await fetch(
      `${API}/buy/browse/v1/item_summary/search?${params}`,
      { headers, next: { revalidate: 900 } } // refresh every 15 min
    );

    if (!res.ok) throw new Error(`eBay browse ${res.status}`);
    const json = (await res.json()) as { itemSummaries?: EbayItem[] };
    const listings = (json.itemSummaries ?? []).map(normalize);

    // if eBay returns nothing, fall back so the page is never empty
    if (listings.length === 0) {
      const lc = await getLorcastListings().catch(() => []);
      if (lc.length) return { listings: lc, source: "lorcast" };
      return { listings: lorcanaMock, source: "mock" };
    }
    return { listings, source: "ebay" };
  } catch (err) {
    console.error("[ebay] falling back:", err);
    const lc = await getLorcastListings().catch(() => []);
    if (lc.length) return { listings: lc, source: "lorcast" };
    return { listings: lorcanaMock, source: "mock" };
  }
}
