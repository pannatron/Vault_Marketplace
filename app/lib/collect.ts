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
  /** set code (e.g. "P2", "D23") */
  setCode?: string;
  /** collector number within the set */
  number?: string;
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
    // cp (2024) and C2 ("Year 3", 2026) are the same organized-play series —
    // Lorcast just names them differently. Merge under one label; the per-card
    // set code (CP / C2) shows which season.
    case "cp":
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
    case "Lorcana Challenge":
      return "A Lorcana Challenge prize card — handed to competitors at official organized-play tournaments (a different set each season). Never sold in packs; copies reach collectors only through the secondary market.";
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
  if (origin.label === "Lorcana Challenge") {
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
    setCode: l.setCode,
    number: l.slug ? l.slug.slice(l.slug.lastIndexOf("-") + 1) : undefined,
    origin,
    why: why(label, origin),
    howToGet: howToGet(label, origin, l.set),
    play: play(label, origin),
  };
}

function pick(
  listings: Listing[],
  keep: (l: Listing) => boolean,
  limit: number,
  allowUnpriced = false
): Collectible[] {
  const seen = new Set<string>();
  return listings
    .filter((l) => (allowUnpriced || l.price > 0) && keep(l))
    .filter((l) => {
      const key = l.slug ?? l.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    // priced first (desc); unpriced exclusives fall to the end
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
  return pick(listings, (l) => isEventSet(l.setCode), limit, true);
}

/* ------------------------------------------------------------------ *
 * Grouped view — the page is organised into categories rather than one
 * flat pile: box cards by rarity, event cards by the event they came from.
 * ------------------------------------------------------------------ */

export interface CollectSubgroup {
  key: string;
  /** set display name, e.g. "Promo Set 2" */
  label: string;
  cards: Collectible[];
}

export interface CollectGroup {
  /** stable key for filtering */
  key: string;
  label: string;
  kind: "box" | "event";
  /** one-line description of the category */
  blurb: string;
  cards: Collectible[];
  /** when a category spans several sets, split it with a header per set */
  subgroups?: CollectSubgroup[];
}

/** event categories, in a sensible reading order (marquee events first) */
const EVENT_GROUPS: { label: string; blurb: string }[] = [
  { label: "Promo Set", blurb: "League, prerelease, Disney Cruise, gateway & box-topper promos." },
  { label: "D23 Expo", blurb: "Disney D23 convention exclusives, incl. first-print variants." },
  { label: "EPCOT Festival", blurb: "Disney parks EPCOT Festival of the Arts exclusives." },
  { label: "Lorcana Challenge", blurb: "Tournament prize cards from every Lorcana Challenge season (CP & C2)." },
];

const groupKey = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

/**
 * Split a category's cards into per-set subgroups (labelled by set name),
 * priced-first within each. Returns undefined when the cards all share one set
 * — nothing to divide.
 */
function buildSubgroups(cards: Collectible[]): CollectSubgroup[] | undefined {
  const bySet = new Map<string, { label: string; cards: Collectible[] }>();
  for (const c of cards) {
    const code = c.setCode ?? "other";
    const entry = bySet.get(code) ?? { label: c.set ?? code, cards: [] };
    entry.cards.push(c);
    bySet.set(code, entry);
  }
  if (bySet.size < 2) return undefined;
  return [...bySet.entries()]
    .map(([code, { label, cards }]) => ({
      key: groupKey(code),
      label,
      cards: cards.slice().sort((a, b) => b.price - a.price),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Build the categorised sections for the collect page — event / promo /
 * organized-play exclusives only (booster-box chase cards are intentionally
 * excluded; those live in the market). Each card lands in exactly one group;
 * empty groups are dropped.
 */
export function getCollectSections(
  listings: Listing[],
  perGroup = 200
): CollectGroup[] {
  const events = getEventCards(listings, 1000);

  const groups: CollectGroup[] = [];
  for (const g of EVENT_GROUPS) {
    const cards = events.filter((c) => c.origin.label === g.label).slice(0, perGroup);
    if (cards.length) {
      groups.push({
        key: groupKey(g.label),
        label: g.label,
        kind: "event",
        blurb: g.blurb,
        cards,
        subgroups: buildSubgroups(cards),
      });
    }
  }
  return groups;
}
