import dns from "node:dns";
import net from "node:net";
import type { CardDetail, Listing, Rarity } from "./types";

/**
 * Lorcast API (https://lorcast.com/docs/api) — free, no auth.
 * Real Disney Lorcana card images + market prices (USD, TCGplayer-derived).
 * Buy buttons send users to an eBay search for that exact card
 * (affiliate-wrapped when EBAY_CAMPAIGN_ID is set).
 */

// Some networks advertise a Cloudflare IPv6 that blackholes; undici then hangs
// the full connect timeout (~10s) before trying IPv4. Prefer IPv4 and race both.
try {
  dns.setDefaultResultOrder("ipv4first");
  net.setDefaultAutoSelectFamily?.(true);
} catch {
  /* older runtime — ignore */
}

const LORCAST = "https://api.lorcast.com/v0";

/** fetch that fails fast and never throws on network errors (returns null). */
async function safeFetch(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<Response | null> {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(8000), ...init });
  } catch {
    return null;
  }
}

interface LorcastCard {
  id: string;
  name: string;
  version?: string;
  rarity: string;
  collector_number?: string;
  cost?: number;
  ink?: string;
  type?: string[];
  text?: string;
  flavor_text?: string;
  set: { name: string; code: string };
  image_uris?: { digital?: { small?: string; normal?: string; large?: string } };
  prices?: { usd?: number | null; usd_foil?: number | null };
  purchase_uris?: { tcgplayer?: string };
  tcgplayer_id?: number;
}

function mapRarity(r: string): Rarity {
  switch (r.toLowerCase()) {
    case "iconic":
    case "promo":
    case "enchanted":
    case "legendary":
      return "legendary";
    case "epic":
    case "super_rare":
    case "super rare":
      return "epic";
    case "rare":
      return "rare";
    case "uncommon":
      return "uncommon";
    default:
      return "common";
  }
}

const RARITY_LABEL: Record<string, string> = {
  iconic: "Iconic",
  promo: "Promo",
  enchanted: "Enchanted",
  legendary: "Legendary",
  epic: "Epic",
  super_rare: "Super Rare",
  "super rare": "Super Rare",
  rare: "Rare",
  uncommon: "Uncommon",
  common: "Common",
};

/** premium tiers only — chase/graded collectors, no bulk playables */
const KEEP_RARITIES = new Set([
  "iconic",
  "promo",
  "enchanted",
  "legendary",
  "epic",
]);

/**
 * Event / organized-play / convention sets — cards you can't pull from a
 * booster box. Kept regardless of the premium-rarity allowlist so tournament
 * and event exclusives (many are just "Promo" rarity, some are Rare) still
 * surface. Codes are lower-cased for comparison.
 */
export const EVENT_SET_CODES = new Set(["p1", "p2", "p3", "cp", "c2", "d23", "dis"]);

export function isEventSet(code?: string): boolean {
  return !!code && EVENT_SET_CODES.has(code.toLowerCase());
}

/**
 * Premium tiers share a card name across prints (an Enchanted "Elsa" sits
 * alongside the Legendary "Elsa"; many names repeat across sets). A bare name
 * search returns the wrong / cheaper print, so tag the rarity into the query.
 *
 * Two tag sets: raw/sold searches tag every premium tier (sellers list them);
 * PSA slab searches tag ONLY the alt-art tiers — graders/sellers rarely print
 * "Legendary"/"Epic" on a slab title, so tagging those zeroes out the results.
 */
const EBAY_TAG_RARITIES = new Set(["enchanted", "iconic", "legendary", "epic"]);
const PSA_TAG_RARITIES = new Set(["enchanted", "iconic"]);

/** Build the eBay keyword query for a card, disambiguating shared names. */
export function lorcanaEbayQuery(
  title: string,
  set?: string,
  rarityLabel?: string,
  opts?: { psa?: boolean }
): string {
  const tags = opts?.psa ? PSA_TAG_RARITIES : EBAY_TAG_RARITIES;
  const r = rarityLabel?.toLowerCase();
  const tag = r && tags.has(r) ? ` ${rarityLabel}` : "";
  // PSA slab titles often omit/vary the set name, so including it over-narrows
  // the search to zero. The card's version (already in `title`) pins the set.
  const setPart = opts?.psa ? "" : ` ${set ?? ""}`;
  return `${title}${tag}${setPart}`.trim();
}

export function ebaySearchUrl(query: string, opts?: { sold?: boolean }): string {
  const u = new URL("https://www.ebay.com/sch/i.html");
  u.searchParams.set("_nkw", `Disney Lorcana ${query}`);
  if (opts?.sold) {
    // completed + sold listings = real recent sale prices
    u.searchParams.set("LH_Sold", "1");
    u.searchParams.set("LH_Complete", "1");
  }
  const campid = process.env.EBAY_CAMPAIGN_ID;
  if (campid) {
    u.searchParams.set("mkcid", "1");
    u.searchParams.set("mkrid", "711-53200-19255-0");
    u.searchParams.set("siteid", "0");
    u.searchParams.set("campid", campid);
    u.searchParams.set("toolid", "10001");
    u.searchParams.set("mkevt", "1");
  }
  return u.toString();
}

function slugOf(c: LorcastCard): string {
  return `${c.set?.code}-${c.collector_number ?? "0"}`;
}

function toListing(c: LorcastCard): Listing | null {
  const usd = c.prices?.usd ?? null;
  const foil = c.prices?.usd_foil ?? null;
  const price = usd ?? foil;
  if (!price || price <= 0) return null;

  const isFoilOnly = usd == null && foil != null;
  const img = c.image_uris?.digital?.normal || c.image_uris?.digital?.large;
  const title = c.version ? `${c.name} - ${c.version}` : c.name;
  const ebayQuery = lorcanaEbayQuery(
    title,
    c.set?.name,
    RARITY_LABEL[c.rarity?.toLowerCase()] ?? c.rarity
  );

  return {
    id: c.id,
    slug: slugOf(c),
    setCode: c.set?.code,
    title,
    set: c.set?.name,
    price,
    priceFoil: foil != null && foil !== usd ? foil : undefined,
    shipping: 0,
    currency: "USD",
    conditionLabel: isFoilOnly ? "Foil · market" : "Market price",
    conditionGroup: "single",
    rarity: mapRarity(c.rarity),
    rarityLabel: RARITY_LABEL[c.rarity?.toLowerCase()] ?? c.rarity,
    image: img,
    url: ebaySearchUrl(ebayQuery),
    soldUrl: ebaySearchUrl(ebayQuery, { sold: true }),
    marketplace: "ebay",
    tcgplayerId: c.tcgplayer_id,
    tcgplayerUrl: c.purchase_uris?.tcgplayer,
  };
}

async function search(q: string, revalidate = 300): Promise<LorcastCard[]> {
  const res = await safeFetch(
    `${LORCAST}/cards/search?q=${encodeURIComponent(q)}`,
    { next: { revalidate } }
  );
  if (!res || !res.ok) throw new Error(`lorcast ${res?.status ?? "timeout"}`);
  const json = (await res.json()) as { results?: LorcastCard[] };
  return json.results ?? [];
}

/**
 * Pull a large, value-ranked catalogue. We query several rarities and merge —
 * Lorcast returns the full result set per query (hundreds each), so this
 * yields ~1000+ priced cards refreshed every few minutes.
 */
export async function getLorcastListings(): Promise<Listing[]> {
  const queries = [
    "rarity:Enchanted",
    "rarity:Legendary",
    "rarity:Iconic",
    "rarity:Epic",
    "rarity:Promo",
    // event / organized-play / convention exclusives (not box-pullable)
    "set:cp",
    "set:C2",
    "set:D23",
    "set:DIS",
  ];
  const batches = await Promise.all(queries.map((q) => search(q).catch(() => [])));

  const seen = new Set<string>();
  const listings: Listing[] = [];
  for (const card of batches.flat()) {
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    // keep premium rarities, plus anything from an event set regardless of tier
    const keep =
      KEEP_RARITIES.has((card.rarity ?? "").toLowerCase()) ||
      isEventSet(card.set?.code);
    if (!keep) continue;
    const l = toListing(card);
    if (l) listings.push(l);
  }

  listings.sort((a, b) => b.price - a.price);
  return listings;
}

/** Realtime single-card lookup for the detail route. slug = `${setCode}-${number}`. */
export async function getLorcanaCardBySlug(
  slug: string
): Promise<CardDetail | null> {
  const i = slug.lastIndexOf("-");
  if (i < 1) return null;
  const setCode = slug.slice(0, i);
  const number = slug.slice(i + 1);

  const res = await safeFetch(
    `${LORCAST}/cards/${encodeURIComponent(setCode)}/${encodeURIComponent(number)}`,
    { next: { revalidate: 60 } } // near-realtime price
  );
  if (!res || !res.ok) return null;
  const c = (await res.json()) as LorcastCard;
  if (!c?.id) return null;

  const title = c.version ? `${c.name} - ${c.version}` : c.name;
  return {
    id: c.id,
    slug,
    name: c.name,
    version: c.version,
    set: c.set?.name,
    setCode: c.set?.code,
    number: c.collector_number ?? number,
    rarity: mapRarity(c.rarity),
    rarityLabel: RARITY_LABEL[c.rarity?.toLowerCase()] ?? c.rarity,
    ink: c.ink,
    cost: c.cost,
    type: c.type?.join(" · "),
    text: c.text,
    flavor: c.flavor_text,
    image: c.image_uris?.digital?.large || c.image_uris?.digital?.normal,
    priceUsd: c.prices?.usd ?? undefined,
    priceFoil: c.prices?.usd_foil ?? undefined,
    ebayUrl: ebaySearchUrl(
      lorcanaEbayQuery(title, c.set?.name, RARITY_LABEL[c.rarity?.toLowerCase()] ?? c.rarity)
    ),
    tcgplayerUrl: c.purchase_uris?.tcgplayer,
    tcgplayerId: c.tcgplayer_id,
  };
}
