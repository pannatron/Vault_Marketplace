import type { Metadata } from "next";
import Link from "next/link";
import { getLorcastListings } from "../lib/lorcast";
import { getCollectSections } from "../lib/collect";
import CollectExplorer from "../components/collect/CollectExplorer";
import Footer from "../components/Footer";
import { LiveBadge } from "../components/Section";
import { IconChevronL } from "../components/Icons";

export const metadata: Metadata = {
  title: "Event & Promo Exclusives — Lorcana | Card Mania",
  description:
    "Disney Lorcana cards you can't pull from a box — promo sets, Disney Cruise, D23, EPCOT, championship and tournament exclusives, grouped by event with live market prices. Information only, not investment advice.",
};

export const revalidate = 300;

export default async function CollectPage() {
  const listings = await getLorcastListings();
  const sections = getCollectSections(listings);

  return (
    <>
      <div className="mx-auto max-w-[1080px] px-5 pt-6 sm:px-8">
        <Link
          href="/market/lorcana"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <IconChevronL width={16} height={16} />
          Lorcana Marketplace
        </Link>

        <header className="mt-5 overflow-hidden rounded-[22px] border border-primary/25 bg-[radial-gradient(120%_140%_at_0%_0%,color-mix(in_oklch,var(--color-primary)_12%,transparent),transparent_55%)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span aria-hidden className="text-2xl">🏆</span>
            <h1 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-extrabold leading-none tracking-tight">
              Event &amp; Promo Exclusives
            </h1>
            <LiveBadge />
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            The Disney Lorcana cards you can&apos;t pull from a booster box — promo
            sets, Disney Cruise, D23, EPCOT, championship and tournament exclusives.
            Grouped by the event they came from, with rarity, a quick highlight and
            market price for each.
          </p>
          <p className="mt-2 text-[0.78rem] text-faint">
            Information only · not investment advice. Prices are live eBay /
            TCGplayer data and can change fast.
          </p>
        </header>

        {sections.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-line bg-surface/40 py-20 text-center">
            <p className="text-base font-semibold">No collectibles to show right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Check back soon — this updates as the market moves.
            </p>
            <Link
              href="/market/lorcana"
              className="mt-4 inline-flex h-9 items-center rounded-[11px] border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-primary/50"
            >
              Browse the market
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <CollectExplorer sections={sections} />
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
