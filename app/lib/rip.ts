import { cardPool } from "./data";
import type { CardSeed, Pack, Pull, Rarity } from "./types";

const RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

/**
 * Relative drop weights per pack tier — index aligns with RARITIES.
 * Higher tiers skew toward the top end. Weights above a pack's
 * `topRarity` are zeroed and the rest renormalized, so a Starter pack
 * with topRarity "uncommon" never rolls rare+.
 */
const TIER_CURVE: Record<Pack["tier"], number[]> = {
  // [common, uncommon, rare, epic, legendary]
  Starter: [62, 27, 8, 2.4, 0.6],
  Pro: [34, 33, 23, 8, 2],
  Master: [16, 26, 31, 19, 8],
  Ultra: [7, 17, 30, 28, 18],
  Legend: [2, 7, 21, 39, 31],
};

export interface Odd {
  rarity: Rarity;
  /** probability 0–1 */
  p: number;
}

/** Per-rarity probabilities for a pack, capped at its topRarity, summing to 1. */
export function packOdds(pack: Pack): Odd[] {
  const cap = RARITIES.indexOf(pack.topRarity);
  const raw = TIER_CURVE[pack.tier].map((w, i) => (i <= cap ? w : 0));
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  return RARITIES.map((rarity, i) => ({ rarity, p: raw[i] / sum }));
}

/** "1 in N" headline for a pack's top reachable rarity (the chase). */
export function chaseOdds(pack: Pack): { rarity: Rarity; oneIn: number } {
  const odds = packOdds(pack).filter((o) => o.p > 0);
  const top = odds[odds.length - 1];
  return { rarity: top.rarity, oneIn: Math.max(2, Math.round(1 / top.p)) };
}

function rollRarity(pack: Pack, rnd: number): Rarity {
  let acc = 0;
  for (const o of packOdds(pack)) {
    acc += o.p;
    if (rnd <= acc) return o.rarity;
  }
  return pack.topRarity;
}

/**
 * Draw one card from a pack: roll a rarity from the pack odds, then pick a
 * random card matching the pack category + rolled rarity. Falls back to any
 * same-category card, then to anything, so a draw never fails.
 */
export function ripPack(pack: Pack): CardSeed {
  const rarity = rollRarity(pack, Math.random());
  const exact = cardPool.filter(
    (c) => c.category === pack.category && c.rarity === rarity,
  );
  const sameCat = cardPool.filter((c) => c.category === pack.category);
  const pool = exact.length ? exact : sameCat.length ? sameCat : cardPool;
  return pool[Math.floor(Math.random() * pool.length)];
}

let pullSeq = 0;

/** Turn a drawn card into a Pull feed entry. */
export function toPull(card: CardSeed, pack: Pack): Pull {
  pullSeq += 1;
  return {
    id: `rip-${pullSeq}`,
    card: card.card,
    set: card.set,
    grade: card.grade,
    category: card.category,
    rarity: card.rarity,
    pack: pack.name,
    secondsAgo: 0,
    value: card.value,
  };
}

/** A few highest-value cards in a pack — shown as the "chase" preview. */
export function packPreview(pack: Pack, n = 6): CardSeed[] {
  return cardPool
    .filter((c) => c.category === pack.category)
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}
