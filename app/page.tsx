import { getLorcastListings } from "./lib/lorcast";
import { getRecommendations } from "./lib/recommend";
import LorcanaHero from "./components/home/LorcanaHero";
import SetsRail from "./components/home/SetsRail";
import Trending from "./components/market/Trending";
import ListingCard from "./components/market/ListingCard";
import ScrollRow from "./components/ScrollRow";
import Footer from "./components/Footer";
import { SectionHead } from "./components/Section";
import { IconShield, IconBolt, IconPack } from "./components/Icons";

export const revalidate = 300;

export default async function Home() {
  const listings = await getLorcastListings(); // clean official card art + market prices
  const recs = await getRecommendations(listings, 30);

  const featured = listings.slice(0, 3);
  const justListed = listings.slice(12, 30);
  const topValue = listings.slice(0, 10);

  // set → signature card art (highest-value card with an image in that set)
  const setCovers: Record<string, string> = {};
  for (const l of listings) {
    if (l.set && l.image && !setCovers[l.set]) setCovers[l.set] = l.image;
  }

  const stats = [
    { icon: IconShield, k: `${listings.length.toLocaleString()}`, v: "Lorcana cards priced" },
    { icon: IconBolt, k: "Live", v: "TCGplayer market values" },
    { icon: IconPack, k: "1 year", v: "of real price history" },
  ];

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-5 pt-6 sm:px-8">
        <LorcanaHero cards={featured} />

        {/* market signals — lead section */}
        {recs.length > 0 && (
          <section className="pt-3">
            <Trending recs={recs} windowDays={30} />
          </section>
        )}

        {/* trust strip */}
        <div className="mt-14 grid grid-cols-3 divide-x divide-line-soft overflow-hidden rounded-2xl border border-line bg-surface/50">
          {stats.map((s) => (
            <div key={s.v} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
              <s.icon className="hidden shrink-0 text-primary sm:block" width={20} height={20} />
              <div className="min-w-0">
                <div className="font-mono text-base font-bold tabular-nums sm:text-lg">{s.k}</div>
                <div className="truncate text-[0.72rem] text-muted">{s.v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* just listed strip */}
        <section className="pt-14">
          <SectionHead
            id="pulled"
            title="Hot in the market"
            sub="Real Disney Lorcana cards, live TCGplayer prices"
            actionLabel="Browse all"
            actionHref="/market/lorcana"
          />
          <ScrollRow>
            {justListed.map((c) => (
              <div key={c.id} className="w-[190px] shrink-0 snap-start">
                <ListingCard item={c} />
              </div>
            ))}
          </ScrollRow>
        </section>

        {/* top value grid */}
        <section className="pt-14">
          <SectionHead
            id="shop"
            title="Top value cards"
            sub="The priciest grails across every Lorcana set"
            actionLabel="See the market"
            actionHref="/market/lorcana"
          />
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
            {topValue.map((c) => (
              <ListingCard key={c.id} item={c} />
            ))}
          </div>
        </section>

        {/* sets */}
        <section className="pt-14">
          <SectionHead
            title="Explore sets"
            sub="From The First Chapter to Wilds Unknown"
          />
          <SetsRail covers={setCovers} />
        </section>
      </div>

      <Footer />
    </>
  );
}
