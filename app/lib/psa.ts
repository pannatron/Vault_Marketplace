import type { Listing } from "./types";
import { getLorcastListings, ebaySearchUrl } from "./lorcast";
import { isEbayLive } from "./ebay";

/**
 * PSA-graded card prices.
 *
 * Real source = eBay Browse API graded listings (slab photos + sold/asking
 * prices). When EBAY creds are present we pull live PSA listings, group by
 * card, and surface the HIGHEST current price per card.
 *
 * Without creds we can't fetch real slab photos, so we synthesize a
 * representational PSA layer from the raw TCGplayer market price × a per-grade
 * premium, framed in a PSA holder and clearly labeled "est. PSA". Add eBay
 * creds to switch every card to real listings.
 */

const GRADE_LABEL: Record<number, string> = {
  10: "GEM MT",
  9: "MINT",
  8: "NM-MT",
};

/**
 * Estimated PSA 10 premium over raw market price (USD).
 * The premium tapers as raw price climbs — a flat ×7 over-inflates grails:
 * a $5 raw ≈ ×6.8, a $100 raw ≈ ×4, a $1000 raw ≈ ×1.8.
 */
function gemMintMultiple(rawUsd: number): number {
  return 1.7 + 5.3 * Math.exp(-rawUsd / 120);
}

function splitTitle(title: string): [string, string | undefined] {
  const i = title.indexOf(" - ");
  if (i < 0) return [title, undefined];
  return [title.slice(0, i), title.slice(i + 3)];
}

export function psaify(l: Listing): Listing | null {
  const market = l.price;
  if (!market || market < 1) return null; // not worth grading / noise

  // PSA 10 (Gem Mint) is the canonical reference grade collectors quote.
  const grade = 10;
  const psaPrice = Math.round(market * gemMintMultiple(market) * 100) / 100;
  const number = l.slug?.split("-").pop() ?? "";
  const [cardName, cardSub] = splitTitle(l.title);
  const setLine = `${l.set ?? "Disney Lorcana"}${number ? ` · #${number}` : ""}`;

  return {
    ...l,
    price: psaPrice,
    priceFoil: undefined,
    marketPrice: market,
    grade,
    gradeLabel: GRADE_LABEL[grade],
    cert: undefined, // estimate, not a real slab — never fake a cert number
    estimated: true,
    isSlab: false,
    cardName,
    cardSub,
    setLine,
    conditionGroup: "graded",
    conditionLabel: `PSA ${grade}`,
    url: ebaySearchUrl(`${l.title} ${l.set ?? ""} PSA ${grade}`),
  };
}

export interface PsaResult {
  cards: Listing[];
  /** "ebay" = real graded listings; "estimated" = market×premium */
  source: "ebay" | "estimated";
}

export async function getPsaCards(): Promise<PsaResult> {
  // (eBay Browse API path lights up here when creds exist — see ebay.ts)
  if (isEbayLive()) {
    try {
      const { getEbayPsaCards } = await import("./ebay-psa");
      const cards = await getEbayPsaCards();
      if (cards.length) return { cards, source: "ebay" };
    } catch {
      /* fall through to estimated */
    }
  }

  const base = await getLorcastListings();
  const cards: Listing[] = [];
  for (const l of base) {
    const p = psaify(l);
    if (p) cards.push(p);
  }
  cards.sort((a, b) => b.price - a.price);
  return { cards, source: "estimated" };
}
