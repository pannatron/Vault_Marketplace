import { lorcanaEbayQuery } from "../../lib/lorcast";
import { isEbayLive } from "../../lib/ebay";
import { getEbayPsaForCard } from "../../lib/ebay-psa";

/**
 * Real eBay PSA 10 price for ONE card. The grid attaches grail prices in bulk;
 * this fills the rest lazily (per card, as it scrolls into view) so coverage
 * matches the detail page. Never returns an estimate.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title")?.trim();
  const set = url.searchParams.get("set")?.trim() || undefined;
  const rarity = url.searchParams.get("rarity")?.trim() || undefined;

  if (!title || !isEbayLive()) return Response.json({});

  try {
    const comps = await getEbayPsaForCard(lorcanaEbayQuery(title, set, rarity, { psa: true }));
    const c = comps.find((x) => x.grade === 10) ?? comps[0] ?? null;
    return Response.json(
      c ? { price: c.price, url: c.url, count: c.count, grade: c.grade } : {}
    );
  } catch {
    return Response.json({});
  }
}
