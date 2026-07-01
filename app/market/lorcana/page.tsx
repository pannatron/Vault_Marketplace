import type { Metadata } from "next";
import { getLorcastListings } from "../../lib/lorcast";
import { getRecommendations } from "../../lib/recommend";
import LorcanaMarket from "../../components/market/LorcanaMarket";
import Trending from "../../components/market/Trending";
import Footer from "../../components/Footer";
import { IconShield, IconBolt } from "../../components/Icons";

export const metadata: Metadata = {
  title: "Disney Lorcana Marketplace — live market prices | Card Mania",
  description:
    "Browse Disney Lorcana singles with live market prices (Lorcast / TCGplayer). Compare cards and find where to buy on eBay and TCGplayer.",
};

// near-realtime: refresh market prices a couple times per minute
export const revalidate = 120;

export default async function LorcanaMarketPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const initialSet = (await searchParams)?.set ?? "";
  // raw market singles (image + price); PSA 10 loads per-card on scroll
  const cards = await getLorcastListings();
  const low = cards.reduce((m, l) => Math.min(m, l.price), Infinity);
  const recs = await getRecommendations(cards, 30);
  const real = cards.length > 0;

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-5 pt-8 sm:px-8">
        {/* page header */}
        <header className="overflow-hidden rounded-[22px] border border-line bg-surface/60 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden>❖</span> Disney Lorcana
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] ${
                real
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-line text-faint"
              }`}
            >
              <span
                className={`inline-flex h-1.5 w-1.5 rounded-full ${
                  real ? "live-dot bg-accent" : "bg-faint"
                }`}
              />
              {real ? "Live market prices" : "Market unavailable"}
            </span>
          </div>

          <h1 className="mt-4 text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-[1]">
            Lorcana Market
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Disney Lorcana singles with live market prices (Lorcast / TCGplayer).
            Tap a card for price history and where to buy.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5 text-[0.78rem]">
            <Stat icon={<IconBolt width={15} height={15} />} k={`${cards.length} cards`} />
            <Stat
              icon={<IconShield width={15} height={15} />}
              k={low === Infinity ? "—" : `from $${low.toFixed(2)}`}
            />
            <Stat k="Live market price · Lorcast" />
          </div>
        </header>

        {/* recommendations */}
        {recs.length > 0 && (
          <div className="pt-8">
            <Trending recs={recs} windowDays={30} />
          </div>
        )}

        {/* market */}
        <div className="pt-10">
          <LorcanaMarket listings={cards} initialSet={initialSet} />
        </div>

        {/* disclosure */}
        <p className="mt-8 rounded-xl border border-line-soft bg-surface/40 px-4 py-3 text-[0.72rem] leading-relaxed text-faint">
          Prices are <strong>real market values</strong> from Lorcast / TCGplayer.
          Tap any card to see price history and where to buy it — eBay listings,
          recent eBay sold comps, and TCGplayer. As an eBay Partner, Card Mania
          may earn a commission on qualifying purchases — at no extra cost to you.
          Final price and condition are set by the seller.
        </p>
      </div>

      <Footer />
    </>
  );
}

function Stat({ icon, k }: { icon?: React.ReactNode; k: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/40 px-3 py-1.5 font-mono font-semibold text-ink">
      {icon && <span className="text-primary">{icon}</span>}
      {k}
    </span>
  );
}
