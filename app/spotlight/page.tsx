import type { Metadata } from "next";
import Link from "next/link";
import { getLorcastListings } from "../lib/lorcast";
import { getRecommendations, type Rec } from "../lib/recommend";
import { REASON, RAR_VAR, whyParagraph } from "../components/market/RecCard";
import { RARITY_META } from "../lib/types";
import Money from "../components/Money";
import CardArt from "../components/CardArt";
import Footer from "../components/Footer";
import { LiveBadge } from "../components/Section";
import { IconChevronL, IconArrowR } from "../components/Icons";

export const metadata: Metadata = {
  title: "Why these cards? — live market signals | Card Mania",
  description:
    "A running rundown of Disney Lorcana cards worth a look right now — thin supply, active bidding, price moves — with the reason for each. Information only, not investment advice.",
};

export const revalidate = 120;

const WINDOW = 30;

function Entry({ m, rank }: { m: Rec; rank: number }) {
  const meta = RARITY_META[m.rarity];
  const tierLabel = m.rarityLabel ?? meta.label;
  const rarVar = RAR_VAR[tierLabel] ?? meta.varName;
  const r = REASON[m.reason];
  const detail = m.slug ? `/market/lorcana/${m.slug}` : "/market/lorcana";

  return (
    <article
      style={{ ["--rar" as string]: `var(${rarVar})` }}
      className="flex gap-4 rounded-2xl border border-line bg-surface/50 p-4 transition-colors hover:border-[color-mix(in_oklch,var(--rar)_45%,transparent)] sm:gap-5 sm:p-5"
    >
      {/* rank */}
      <div className="hidden w-8 shrink-0 pt-1 text-center sm:block">
        <span className="font-display text-2xl font-extrabold leading-none text-faint">
          {rank}
        </span>
      </div>

      {/* card image */}
      <Link
        href={detail}
        className="relative grid aspect-[3/4] w-[104px] shrink-0 place-items-center self-start overflow-hidden rounded-[10px] border border-line bg-bg/40 sm:w-[120px]"
        style={{ boxShadow: `0 10px 28px -16px var(${rarVar})` }}
      >
        {m.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote scan
          <img
            src={m.image}
            alt={m.cardName ?? m.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain"
          />
        ) : (
          <CardArt rarity={m.rarity} category="lorcana" label={m.set} className="h-full w-full" />
        )}
      </Link>

      {/* body */}
      <div className="min-w-0 flex-1">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
          style={{ background: `color-mix(in oklch, ${r.color} 15%, transparent)`, color: r.color }}
        >
          {r.icon} {r.tag}
        </span>

        <h2 className="mt-1.5 text-[1.05rem] font-extrabold leading-tight sm:text-[1.15rem]">
          <span className="text-faint sm:hidden">#{rank} </span>
          <Link href={detail} className="transition-colors hover:text-primary">
            {m.cardName ?? m.title}
          </Link>
        </h2>
        <p className="text-[0.72rem] text-faint">
          {m.set} · {tierLabel}
        </p>

        {/* the editorial why */}
        <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink/90">
          {whyParagraph(m, WINDOW)}
        </p>

        {/* supporting numbers */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.72rem]">
          <span className="flex items-center gap-1.5">
            <span className="uppercase tracking-wide text-faint">Market</span>
            <Money usd={m.price} className="font-bold text-ink" />
          </span>
          {m.listings != null && (
            <span className="flex items-center gap-1.5">
              <span className="uppercase tracking-wide text-faint">On market</span>
              <span className="font-bold text-ink">{m.listings} listed</span>
            </span>
          )}
          {m.bids != null && m.bids > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="uppercase tracking-wide text-faint">Live bids</span>
              <span className="font-bold text-ink">{m.bids}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="uppercase tracking-wide text-faint">30d</span>
            <span
              className="font-bold"
              style={{ color: m.pct >= 0 ? "var(--color-success)" : "var(--color-accent)" }}
            >
              {m.pct >= 0 ? "+" : ""}
              {m.pct}%
            </span>
          </span>
        </div>

        <Link
          href={detail}
          className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-primary transition-colors hover:text-primary-strong"
        >
          View card &amp; price history
          <IconArrowR width={14} height={14} />
        </Link>
      </div>
    </article>
  );
}

export default async function SpotlightPage() {
  const listings = await getLorcastListings();
  const recs = await getRecommendations(listings, WINDOW);

  return (
    <>
      <div className="mx-auto max-w-[820px] px-5 pt-6 sm:px-8">
        <Link
          href="/market/lorcana"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <IconChevronL width={16} height={16} />
          Lorcana Marketplace
        </Link>

        <header className="mt-5 overflow-hidden rounded-[22px] border border-primary/25 bg-[radial-gradient(120%_140%_at_0%_0%,color-mix(in_oklch,var(--color-primary)_12%,transparent),transparent_55%)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span aria-hidden className="text-2xl">💡</span>
            <h1 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-extrabold leading-none tracking-tight">
              Why these cards?
            </h1>
            <LiveBadge />
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            A running rundown of Lorcana cards standing out right now — each one
            flagged by a live market signal, with the reason spelled out. Ranked by
            how strong the signal is.
          </p>
          <p className="mt-2 text-[0.78rem] text-faint">
            Information only · not investment advice. Prices are live eBay /
            TCGplayer data and can change fast.
          </p>
        </header>

        {recs.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-line bg-surface/40 py-20 text-center">
            <p className="text-base font-semibold">No standout signals right now</p>
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
          <>
            <p className="mt-6 mb-4 text-sm text-muted">
              <span className="font-mono font-semibold text-ink">{recs.length}</span>{" "}
              cards standing out today · ranked by signal strength
            </p>
            <div className="flex flex-col gap-3.5">
              {recs.map((m, i) => (
                <Entry key={m.id} m={m} rank={i + 1} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
