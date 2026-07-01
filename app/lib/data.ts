import type {
  CardSeed,
  Category,
  Deal,
  HeroSlide,
  Pack,
  Pull,
} from "./types";

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    kicker: "New Drop",
    title: "Pirates vs. Warlords",
    subtitle: "One Piece — battle for the seas. Chase the alt-art Hancock.",
    cta: "Rip now",
    category: "onepiece",
    rarity: "legendary",
    accent: "accent",
  },
  {
    id: "h2",
    kicker: "Featured",
    title: "Fire & Grass",
    subtitle: "Where flames meet roots. Pull a Gem Mint Charizard.",
    cta: "Rip now",
    category: "pokemon",
    rarity: "epic",
    accent: "primary",
  },
  {
    id: "h3",
    kicker: "Hall of Fame",
    title: "Vintage Diamond",
    subtitle: "Graded rookies from the golden era, vaulted and insured.",
    cta: "Reveal now",
    category: "baseball",
    rarity: "legendary",
    accent: "gold",
  },
  {
    id: "h4",
    kicker: "Hardwood",
    title: "Rookie Season",
    subtitle: "Prizm refractors and autos. The next franchise, sealed.",
    cta: "Grab a pack",
    category: "basketball",
    rarity: "rare",
    accent: "primary",
  },
];

export const packs: Pack[] = [
  { id: "p1", name: "Sealed Pokémon Booster", category: "pokemon", price: 15, tier: "Starter", topRarity: "uncommon", odds: "1 in 12 hits a Holo" },
  { id: "p2", name: "Wildcard Basic", category: "marvel", price: 15, tier: "Starter", topRarity: "common", odds: "Always a graded slab" },
  { id: "p3", name: "Sports Starter", category: "baseball", price: 25, tier: "Starter", topRarity: "rare", odds: "1 in 9 hits a Refractor" },
  { id: "p4", name: "One Piece Pro", category: "onepiece", price: 50, tier: "Pro", topRarity: "epic", odds: "1 in 6 hits an Alt-Art" },
  { id: "p5", name: "Pokémon Pro", category: "pokemon", price: 50, tier: "Pro", topRarity: "epic", odds: "1 in 5 hits an Illustration Rare" },
  { id: "p6", name: "Basketball Master", category: "basketball", price: 100, tier: "Master", topRarity: "legendary", odds: "1 in 4 hits an Auto" },
  { id: "p7", name: "Sealed MTG Booster", category: "mtg", price: 25, tier: "Starter", topRarity: "rare", odds: "1 in 8 hits a Mythic" },
  { id: "p8", name: "Pokémon Master", category: "pokemon", price: 100, tier: "Master", topRarity: "legendary", odds: "1 in 4 hits a Special IR" },
  { id: "p9", name: "One Piece Ultra", category: "onepiece", price: 250, tier: "Ultra", topRarity: "legendary", odds: "1 in 3 hits a Manga Rare" },
  { id: "p10", name: "Sports Legend", category: "football", price: 2500, tier: "Legend", topRarity: "legendary", odds: "Guaranteed PSA 9+", soldOut: true },
];

/** seed pulls — JustPulled adds more live on the client */
export const initialPulls: Pull[] = [
  { id: "pl1", card: "Charizard ex — Special Illustration Rare", set: "Prismatic Evolutions", grade: "PSA 10", category: "pokemon", rarity: "legendary", pack: "Pokémon Master", secondsAgo: 8, value: 1840 },
  { id: "pl2", card: "Monkey D. Luffy — Manga Alt-Art", set: "Straw Hat Crew", grade: "PSA 9", category: "onepiece", rarity: "epic", pack: "One Piece Ultra", secondsAgo: 21, value: 720 },
  { id: "pl3", card: "Paul Skenes — Rookie Refractor", set: "Topps Chrome", grade: "PSA 9", category: "baseball", rarity: "rare", pack: "Sports Starter", secondsAgo: 34, value: 264 },
  { id: "pl4", card: "Cooper Flagg — Bowman Chrome", set: "Bowman U", grade: "PSA 10", category: "basketball", rarity: "epic", pack: "Basketball Master", secondsAgo: 47, value: 410 },
  { id: "pl5", card: "Sylveon — C-Gem", set: "Black Bolt", grade: "PSA 10", category: "pokemon", rarity: "rare", pack: "Wildcard Starter", secondsAgo: 58, value: 96 },
  { id: "pl6", card: "Boa Hancock — Parallel", set: "Seven Warlords", grade: "CGC 9.5", category: "onepiece", rarity: "uncommon", pack: "One Piece Pro", secondsAgo: 74, value: 58 },
  { id: "pl7", card: "Will Levis — Reactive Yellow", set: "Panini Mosaic", grade: "PSA 8", category: "football", rarity: "uncommon", pack: "Sports Starter", secondsAgo: 91, value: 41 },
  { id: "pl8", card: "Jolteon — Holo", set: "Prismatic", grade: "CGC 9", category: "pokemon", rarity: "common", pack: "Wildcard Basic", secondsAgo: 110, value: 22 },
];

/** pools the client samples from to fabricate new "live" pulls */
export const pullPool: Omit<Pull, "id" | "secondsAgo">[] = [
  { card: "Pikachu — Illustrator Promo", set: "151", grade: "PSA 10", category: "pokemon", rarity: "legendary", pack: "Pokémon Master", value: 2200 },
  { card: "Roronoa Zoro — Super Rare", set: "Kingdoms of Intrigue", grade: "PSA 9", category: "onepiece", rarity: "epic", pack: "One Piece Pro", value: 340 },
  { card: "Aaron Judge — Chrome Titans", set: "Topps Chrome", grade: "PSA 9", category: "baseball", rarity: "rare", pack: "Sports Pro", value: 188 },
  { card: "Ja Morant — Fast Break Prizm", set: "Panini Prizm", grade: "PSA 10", category: "basketball", rarity: "legendary", pack: "Basketball Master", value: 1450 },
  { card: "Mewtwo — Reverse Holo", set: "Mysterious Treasures", grade: "CGC 9", category: "pokemon", rarity: "uncommon", pack: "Pokémon Pro", value: 64 },
  { card: "Black Lotus — Mythic", set: "Tarkir Dragonstorm", grade: "CGC 9.5", category: "mtg", rarity: "legendary", pack: "Sealed MTG Booster", value: 980 },
  { card: "Nikola Jokić — Donruss RC", set: "Panini Donruss", grade: "PSA 9", category: "basketball", rarity: "rare", pack: "Basketball Ultra", value: 230 },
  { card: "Eevee — 1st Edition Jungle", set: "Jungle", grade: "PSA 8", category: "pokemon", rarity: "epic", pack: "Pokémon Pro", value: 410 },
  { card: "Trae Young — Red Wave", set: "Panini Select", grade: "PSA 10", category: "basketball", rarity: "epic", pack: "Sports Master", value: 520 },
  { card: "Blackbeard — Wanted Alt-Art", set: "Emperors", grade: "PSA 10", category: "onepiece", rarity: "legendary", pack: "One Piece Ultra", value: 1120 },
  { card: "Vaporeon ex — Holo", set: "Prismatic Evolutions", grade: "PSA 10", category: "pokemon", rarity: "rare", pack: "Pokémon Pro", value: 142 },
  { card: "Jackson Holliday — Pink Refractor", set: "Topps Chrome", grade: "PSA 10", category: "baseball", rarity: "rare", pack: "Sports Starter", value: 96 },
];

/**
 * Every card that can sit inside a pack, grouped by category + rarity.
 * The rip engine (`lib/rip.ts`) rolls a rarity from the pack's odds, then
 * pulls a random card matching the pack category + rolled rarity.
 * Keep ≥1 card per (category, rarity) the packs can reach, or the draw
 * falls back to any same-category card.
 */
export const cardPool: CardSeed[] = [
  // --- pokemon (reaches up to legendary) ---
  { card: "Rattata — Base Common", set: "151", grade: "PSA 8", category: "pokemon", rarity: "common", value: 6 },
  { card: "Magikarp — Splash Holo", set: "Prismatic", grade: "CGC 9", category: "pokemon", rarity: "common", value: 11 },
  { card: "Mewtwo — Reverse Holo", set: "Mysterious Treasures", grade: "CGC 9", category: "pokemon", rarity: "uncommon", value: 64 },
  { card: "Snorlax — Jungle Holo", set: "Jungle", grade: "PSA 8", category: "pokemon", rarity: "uncommon", value: 48 },
  { card: "Vaporeon ex — Holo", set: "Prismatic Evolutions", grade: "PSA 10", category: "pokemon", rarity: "rare", value: 142 },
  { card: "Sylveon — C-Gem", set: "Black Bolt", grade: "PSA 10", category: "pokemon", rarity: "rare", value: 96 },
  { card: "Eevee — 1st Edition Jungle", set: "Jungle", grade: "PSA 8", category: "pokemon", rarity: "epic", value: 410 },
  { card: "Umbreon ex — Moonbreon", set: "Evolving Skies", grade: "PSA 9", category: "pokemon", rarity: "epic", value: 560 },
  { card: "Charizard ex — Special Illustration Rare", set: "Prismatic Evolutions", grade: "PSA 10", category: "pokemon", rarity: "legendary", value: 1840 },
  { card: "Pikachu — Illustrator Promo", set: "151", grade: "PSA 10", category: "pokemon", rarity: "legendary", value: 2200 },

  // --- one piece (up to legendary) ---
  { card: "Buggy — Starter Common", set: "Romance Dawn", grade: "PSA 9", category: "onepiece", rarity: "common", value: 7 },
  { card: "Nami — Paramount War", set: "Paramount War", grade: "CGC 9", category: "onepiece", rarity: "uncommon", value: 34 },
  { card: "Boa Hancock — Parallel", set: "Seven Warlords", grade: "CGC 9.5", category: "onepiece", rarity: "uncommon", value: 58 },
  { card: "Roronoa Zoro — Super Rare", set: "Kingdoms of Intrigue", grade: "PSA 9", category: "onepiece", rarity: "rare", value: 188 },
  { card: "Monkey D. Luffy — Manga Alt-Art", set: "Straw Hat Crew", grade: "PSA 9", category: "onepiece", rarity: "epic", value: 720 },
  { card: "Blackbeard — Wanted Alt-Art", set: "Emperors", grade: "PSA 10", category: "onepiece", rarity: "legendary", value: 1120 },
  { card: "Shanks — Leader Manga Rare", set: "Emperors", grade: "PSA 10", category: "onepiece", rarity: "legendary", value: 1480 },

  // --- baseball (up to rare) ---
  { card: "Common Veteran — Base", set: "Topps Series 1", grade: "PSA 8", category: "baseball", rarity: "common", value: 5 },
  { card: "Will Levis — Reactive Yellow", set: "Panini Mosaic", grade: "PSA 8", category: "baseball", rarity: "uncommon", value: 41 },
  { card: "Jackson Holliday — Pink Refractor", set: "Topps Chrome", grade: "PSA 10", category: "baseball", rarity: "rare", value: 96 },
  { card: "Paul Skenes — Rookie Refractor", set: "Topps Chrome", grade: "PSA 9", category: "baseball", rarity: "rare", value: 264 },

  // --- basketball (up to legendary) ---
  { card: "Bench Rookie — Base", set: "Panini Hoops", grade: "PSA 8", category: "basketball", rarity: "common", value: 6 },
  { card: "Trae Young — Red Wave", set: "Panini Select", grade: "PSA 9", category: "basketball", rarity: "uncommon", value: 70 },
  { card: "Nikola Jokić — Donruss RC", set: "Panini Donruss", grade: "PSA 9", category: "basketball", rarity: "rare", value: 230 },
  { card: "Cooper Flagg — Bowman Chrome", set: "Bowman U", grade: "PSA 10", category: "basketball", rarity: "epic", value: 410 },
  { card: "Ja Morant — Fast Break Prizm", set: "Panini Prizm", grade: "PSA 10", category: "basketball", rarity: "legendary", value: 1450 },

  // --- mtg (up to rare) ---
  { card: "Llanowar Elves — Common", set: "Foundations", grade: "CGC 9", category: "mtg", rarity: "common", value: 4 },
  { card: "Counterspell — Retro Frame", set: "Innistrad Remastered", grade: "CGC 9", category: "mtg", rarity: "uncommon", value: 22 },
  { card: "Ragavan — Mythic", set: "Modern Horizons 2", grade: "CGC 9.5", category: "mtg", rarity: "rare", value: 130 },
  { card: "Black Lotus — Mythic", set: "Tarkir Dragonstorm", grade: "CGC 9.5", category: "mtg", rarity: "legendary", value: 980 },

  // --- football (up to legendary) ---
  { card: "Special Teams — Base", set: "Panini Score", grade: "PSA 8", category: "football", rarity: "common", value: 5 },
  { card: "Niles Kinnick — All-American", set: "Panini", grade: "PSA 8", category: "football", rarity: "uncommon", value: 38 },
  { card: "Fran Tarkenton — 1962 Topps", set: "Topps", grade: "PSA 7", category: "football", rarity: "rare", value: 200 },
  { card: "Caleb Williams — Silver Prizm", set: "Panini Prizm", grade: "PSA 10", category: "football", rarity: "epic", value: 480 },
  { card: "Patrick Mahomes — Rookie Auto", set: "National Treasures", grade: "PSA 9", category: "football", rarity: "legendary", value: 3200 },

  // --- marvel (up to common — wildcard packs) ---
  { card: "Spider-Man — Base", set: "Marvel Metal", grade: "CGC 9", category: "marvel", rarity: "common", value: 9 },
  { card: "Wolverine — Base Holo", set: "Marvel Masterpieces", grade: "CGC 9", category: "marvel", rarity: "common", value: 14 },
  { card: "Infinity Gauntlet #2 — CGC 9.8", set: "Marvel Comics", grade: "CGC 9.8", category: "marvel", rarity: "legendary", value: 112 },
];

export const categories: Category[] = [
  { key: "pokemon", label: "Pokémon", rarity: "legendary", count: "48.2k cards" },
  { key: "lorcana", label: "Disney Lorcana", rarity: "epic", count: "live eBay" },
  { key: "onepiece", label: "One Piece", rarity: "epic", count: "9.1k cards" },
  { key: "basketball", label: "Basketball", rarity: "rare", count: "31.7k cards" },
  { key: "baseball", label: "Baseball", rarity: "uncommon", count: "27.4k cards" },
  { key: "football", label: "Football", rarity: "rare", count: "22.9k cards" },
  { key: "soccer", label: "Soccer", rarity: "uncommon", count: "14.3k cards" },
  { key: "mtg", label: "Magic", rarity: "epic", count: "11.8k cards" },
  { key: "marvel", label: "Marvel", rarity: "common", count: "6.2k cards" },
];

export const deals: Deal[] = [
  { id: "d1", card: "Explosive Walker — Sealed Booster", category: "pokemon", rarity: "uncommon", price: 8.4, fmv: 11.3 },
  { id: "d2", card: "Thunderclap Spark — JP Booster", category: "pokemon", rarity: "uncommon", price: 18.0, fmv: 24.0 },
  { id: "d3", card: "Rebellion Crash — JP Booster", category: "pokemon", rarity: "rare", price: 14.95, fmv: 19.9 },
  { id: "d4", card: "Fran Tarkenton — 1962 Topps", category: "football", rarity: "rare", price: 200, fmv: 264 },
  { id: "d5", card: "Niles Kinnick — All-American", category: "football", rarity: "epic", price: 107, fmv: 141 },
  { id: "d6", card: "Innistrad Remastered — Collector", category: "mtg", rarity: "epic", price: 34.42, fmv: 45.3 },
  { id: "d7", card: "Infinity Gauntlet #2 — CGC 9.8", category: "marvel", rarity: "legendary", price: 85, fmv: 112 },
  { id: "d8", card: "March of the Machine — Set Booster", category: "mtg", rarity: "uncommon", price: 7.5, fmv: 9.8 },
];
