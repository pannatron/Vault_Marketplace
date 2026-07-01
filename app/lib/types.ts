export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type CategoryKey =
  | "pokemon"
  | "onepiece"
  | "baseball"
  | "basketball"
  | "football"
  | "mtg"
  | "soccer"
  | "marvel"
  | "lorcana";

export const RARITY_META: Record<
  Rarity,
  { label: string; tier: number; varName: string }
> = {
  common: { label: "Common", tier: 1, varName: "--color-r-common" },
  uncommon: { label: "Uncommon", tier: 2, varName: "--color-r-uncommon" },
  rare: { label: "Rare", tier: 3, varName: "--color-r-rare" },
  epic: { label: "Epic", tier: 4, varName: "--color-r-epic" },
  legendary: { label: "Legendary", tier: 5, varName: "--color-r-legendary" },
};

export interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  category: CategoryKey;
  rarity: Rarity;
  accent: "primary" | "accent" | "gold";
}

export interface Pack {
  id: string;
  name: string;
  category: CategoryKey;
  price: number;
  tier: "Starter" | "Pro" | "Master" | "Ultra" | "Legend";
  /** highest rarity reachable — drives art + glow */
  topRarity: Rarity;
  odds: string;
  soldOut?: boolean;
}

export interface Pull {
  id: string;
  card: string;
  set: string;
  grade: string;
  category: CategoryKey;
  rarity: Rarity;
  pack: string;
  /** seconds ago at render time */
  secondsAgo: number;
  value: number;
}

/** one possible card sitting inside a pack — the rip engine draws from these */
export interface CardSeed {
  card: string;
  set: string;
  grade: string;
  category: CategoryKey;
  rarity: Rarity;
  value: number;
}

export interface Deal {
  id: string;
  card: string;
  category: CategoryKey;
  rarity: Rarity;
  price: number;
  fmv: number;
}

export interface Category {
  key: CategoryKey;
  label: string;
  rarity: Rarity;
  count: string;
}

/** condition buckets used for filtering external marketplace listings */
export type ConditionGroup = "sealed" | "graded" | "single";

export interface Listing {
  id: string;
  title: string;
  set?: string;
  /** USD price of the item itself (normal/lowest) */
  price: number;
  /** foil market price when the card has a separate foil value */
  priceFoil?: number;
  /** shipping cost; 0 = free */
  shipping: number;
  currency: string;
  conditionLabel: string;
  conditionGroup: ConditionGroup;
  rarity: Rarity;
  /** true source rarity (e.g. "Enchanted") — keeps granularity the 5-tier `rarity` drops */
  rarityLabel?: string;
  /** real marketplace photo; when absent we render holo art */
  image?: string;
  /** outbound link (affiliate-wrapped when a campaign id is configured) */
  url: string;
  marketplace: "ebay" | "amazon";
  seller?: string;
  /** seller positive-feedback %, 0–100 */
  feedback?: number;
  /** detail-route slug = `${setCode}-${number}` (Lorcast cards) */
  slug?: string;
  /** set code (e.g. "4", "P2", "cp", "D23") — classifies how a card is obtained */
  setCode?: string;
  /** TCGplayer product id — joins to real price history */
  tcgplayerId?: number;
  /** source page for the displayed market price (TCGplayer product) */
  tcgplayerUrl?: string;
  /** eBay completed+sold search — real recent sale prices */
  soldUrl?: string;

  // --- PSA graded fields (set when this is a graded card) ---
  /** numeric grade, e.g. 10 */
  grade?: number;
  /** grade word, e.g. "GEM MT" */
  gradeLabel?: string;
  /** underlying raw market price the PSA price is derived from / compared to */
  marketPrice?: number;
  /** true = `image` is a real eBay slab photo; false = raw scan to frame */
  isSlab?: boolean;
  /** PSA cert number */
  cert?: string;
  /** slab label parts */
  cardName?: string;
  cardSub?: string;
  setLine?: string;
  /** real recorded PSA listings count behind the "highest in group" price */
  psaCount?: number;
  /** PSA price is a model estimate (raw × premium), not a real graded sale */
  estimated?: boolean;

  // --- real eBay PSA 10, attached server-side when creds are live ---
  /** lowest live eBay PSA 10 asking price for this card (real, not estimated) */
  psa10Price?: number;
  /** link to that eBay PSA 10 listing */
  psa10Url?: string;
  /** how many live PSA 10 listings back it */
  psa10Count?: number;
}

export interface Mover {
  id: string;
  slug?: string;
  title: string;
  set?: string;
  image?: string;
  rarity: Rarity;
  /** true source rarity label (Iconic / Enchanted / Legendary …) for filtering */
  rarityLabel?: string;
  /** displayed price (PSA est. or real) */
  price: number;
  /** raw (ungraded) market price — used by the RAW grade view */
  marketPrice?: number;
  /** % change over the window (from market history) */
  pct: number;
  /** sparkline prices (oldest → newest) */
  spark: number[];
  // PSA slab display
  grade?: number;
  gradeLabel?: string;
  cardName?: string;
  cardSub?: string;
  setLine?: string;
  cert?: string;
  /** PSA price is a model estimate, not a real graded sale */
  estimated?: boolean;
}

export interface CardDetail {
  id: string;
  slug: string;
  name: string;
  version?: string;
  set: string;
  setCode: string;
  number: string;
  rarity: Rarity;
  rarityLabel: string;
  ink?: string;
  cost?: number;
  type?: string;
  text?: string;
  flavor?: string;
  image?: string;
  priceUsd?: number;
  priceFoil?: number;
  ebayUrl: string;
  tcgplayerUrl?: string;
  tcgplayerId?: number;
}

export interface PricePoint {
  /** ms epoch */
  t: number;
  price: number;
}
