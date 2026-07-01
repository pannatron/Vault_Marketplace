import type { Listing, Rarity } from "./types";
import { RARITY_META } from "./types";
import { isEventSet } from "./lorcast";

/**
 * A collectible-spotlight profile — a scarce, desirable card presented with
 * the reasons a collector cares: what it is, how you get one, and how it maps
 * to competitive play. Copy is derived from real set/rarity/price data; we
 * never fabricate tournament results or population numbers we don't have.
 *
 * Crucially, "how to get one" is driven by the card's SET, not assumed to be a
 * booster pack — event and organized-play exclusives are never box-pullable.
 */
export interface Collectible {
  id: string;
  slug?: string;
  name: string;
  set?: string;
  /** true source rarity (Enchanted / Iconic / Legendary / Promo …) */
  rarityLabel: string;
  rarity: Rarity;
  tier: number;
  image?: string;
  price: number;
  url: string;
  /** where the card comes from — booster box vs a specific event */
  origin: Origin;
  /** why this one is worth collecting */
  why: string;
  /** how a copy is obtained */
  howToGet: string;
  /** competitive-play relevance — honest, no invented stats */
  play: string;
}

export interface Origin {
  /** short chip label, e.g. "Booster", "Challenge Promo", "D23 Expo" */
  label: string;
  /** box = pullable from packs; event = organized-play / convention exclusive */
  kind: "box" | "event";
}

/** classify how a card is obtained from its set code */
function originOf(setCode?: string): Origin {
  switch (setCode?.toLowerCase()) {
    case "cp":
      return { label: "Challenge Promo", kind: "event" };
    case "c2":
      return { label: "Lorcana Challenge", kind: "event" };
    case "d23":
      return { label: "D23 Expo", kind: "event" };
    case "dis":
      return { label: "EPCOT Festival", kind: "event" };
    case "p1":
    case "p2":
    case "p3":
      return { label: "Promo Set", kind: "event" };
    default:
      return { label: "Booster", kind: "box" };
  }
}

function why(label: string, origin: Origin): string {
  if (origin.kind === "event") {
    return "An event exclusive — its print run is capped by who showed up, not by a booster rarity slot. That scarcity, plus a design you can't pull from a pack, is what collectors chase.";
  }
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

function howToGet(label: string, origin: Origin, set?: string): string {
  switch (origin.label) {
    case "Challenge Promo":
      return "A Store/Set Championship prize card — handed out at organized-play events, never sold in packs. Copies reach collectors only through the secondary market.";
    case "Lorcana Challenge":
      return "Awarded to competitors at official Lorcana Challenge tournaments. Not part of any booster product — secondary market only.";
    case "D23 Expo":
      return "A D23 Expo exclusive, released at Disney's convention rather than in retail packs. You'll only find copies on the secondary market.";
    case "EPCOT Festival":
      return "An EPCOT Festival of the Arts exclusive, sold at the Disney parks event — not in any booster product.";
    case "Promo Set":
      return "A promo-set card distributed through league kits, prerelease/gateway events and box toppers rather than the main booster line.";
    default: {
      const from = set ? `sealed ${set} booster packs` : "sealed booster packs";
      const odds =
        label === "Enchanted" || label === "Iconic"
          ? "at very long odds"
          : "at long odds";
      return `Pulled from ${from} ${odds}. Most collectors buy the single on the secondary market (eBay / TCGplayer) rather than chase it in packs.`;
    }
  }
}

function play(label: string, origin: Origin): string {
  if (origin.label === "Challenge Promo" || origin.label === "Lorcana Challenge") {
    return "An organized-play card — it exists because of competitive Lorcana, and the printed version is tournament-legal alongside its base card.";
  }
  if (origin.kind === "event") {
    return "A collector/display exclusive tied to an event — mechanically identical to its standard print, which is what sees tournament play.";
  }
  if (label === "Legendary") {
    return "Legendaries can carry constructed decks — the standard print is the tournament workhorse, and this is the premium version of a card people actually play.";
  }
  return "Mechanically identical to its base print, which is what sees the table in tournaments — this copy is the display/collector piece.";
}

/** epic + legendary tiers = the chase/collectible end of the rarity ladder */
const COLLECTIBLE_MIN_TIER = 4;

function toCollectible(l: Listing): Collectible {
  const label = l.rarityLabel ?? RARITY_META[l.rarity].label;
  const origin = originOf(l.setCode);
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
    origin,
    why: why(label, origin),
    howToGet: howToGet(label, origin, l.set),
    play: play(label, origin),
  };
}

function pick(
  listings: Listing[],
  keep: (l: Listing) => boolean,
  limit: number
): Collectible[] {
  const seen = new Set<string>();
  return listings
    .filter((l) => l.price > 0 && keep(l))
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

/**
 * Box chase cards: the priciest scarce cards you can actually pull from a
 * booster (epic/legendary tier), de-duped, highest value first.
 */
export function getCollectibles(listings: Listing[], limit = 12): Collectible[] {
  return pick(
    listings,
    (l) => !isEventSet(l.setCode) && RARITY_META[l.rarity].tier >= COLLECTIBLE_MIN_TIER,
    limit
  );
}

/**
 * Event & tournament exclusives: cards from organized-play, convention and
 * promo sets — the ones you can't get from a box at all.
 */
export function getEventCards(listings: Listing[], limit = 12): Collectible[] {
  return pick(listings, (l) => isEventSet(l.setCode), limit);
}
