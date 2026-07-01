import type { Listing, Rarity } from "./types";
import { RARITY_META } from "./types";

/**
 * A collectible-spotlight profile — a scarce, desirable card presented with
 * the reasons a collector cares: what it is, how you get one, and how it maps
 * to competitive play. Copy is derived from real rarity/price data; we never
 * fabricate tournament results or population numbers we don't have.
 */
export interface Collectible {
  id: string;
  slug?: string;
  name: string;
  set?: string;
  /** true source rarity (Enchanted / Iconic / Legendary …) */
  rarityLabel: string;
  rarity: Rarity;
  tier: number;
  image?: string;
  price: number;
  url: string;
  /** why this one is worth collecting */
  why: string;
  /** how a copy is obtained */
  howToGet: string;
  /** competitive-play relevance — honest, no invented stats */
  play: string;
}

/** epic + legendary tiers = the chase/collectible end of the rarity ladder */
const COLLECTIBLE_MIN_TIER = 4;

function why(label: string): string {
  switch (label) {
    case "Enchanted":
      return "The Enchanted alt-art is the top chase of its set — borderless full-art treatment printed in tiny numbers. The trophy pull collectors build around.";
    case "Iconic":
      return "Iconic is the newest ultra-rare tier — premium alt-art with an extremely limited print run. Fresh demand, thin supply.";
    case "Legendary":
      return "Legendary is the highest standard rarity — marquee characters that stay in demand long after a set leaves shelves.";
    case "Super Rare":
      return "A Super Rare sits just below the chase cards: scarce enough to hold value, affordable enough to actually land.";
    default:
      return "A high-rarity card from its set — scarcer than the bulk, and a solid centrepiece for a themed collection.";
  }
}

function howToGet(label: string, set?: string): string {
  const from = set ? `sealed ${set} booster packs` : "sealed booster packs";
  const odds =
    label === "Enchanted" || label === "Iconic"
      ? "at very long odds"
      : "at long odds";
  return `Pulled from ${from} ${odds}. Most collectors buy the single on the secondary market (eBay / TCGplayer) rather than chase it in packs.`;
}

function play(label: string): string {
  if (label === "Legendary") {
    return "Legendaries can carry constructed decks — the standard print is the tournament workhorse, and this is the premium version of a card people actually play.";
  }
  return "Mechanically identical to its base print, which is what sees the table in tournaments — this copy is the display/collector piece.";
}

function toCollectible(l: Listing): Collectible {
  const label = l.rarityLabel ?? RARITY_META[l.rarity].label;
  return {
    id: l.id,
    slug: l.slug,
    name: l.cardName ?? l.title,
    set: l.set,
    rarityLabel: label,
    rarity: l.rarity,
    tier: RARITY_META[l.rarity].tier,
    image: l.image,
    price: l.price,
    url: l.url,
    why: why(label),
    howToGet: howToGet(label, l.set),
    play: play(label),
  };
}

/**
 * Curated collectible profiles: the priciest scarce cards, de-duped by card,
 * highest value first.
 */
export function getCollectibles(listings: Listing[], limit = 12): Collectible[] {
  const seen = new Set<string>();
  return listings
    .filter((l) => RARITY_META[l.rarity].tier >= COLLECTIBLE_MIN_TIER)
    .filter((l) => l.price > 0)
    .filter((l) => {
      const key = l.slug ?? l.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.price - a.price)
    .slice(0, limit)
    .map(toCollectible);
}
