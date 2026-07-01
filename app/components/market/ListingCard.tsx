"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Listing } from "../../lib/types";
import { RARITY_META } from "../../lib/types";
import CardArt from "../CardArt";
import Money from "../Money";
import GradedFrame from "./GradedFrame";
import { IconArrowR } from "../Icons";

export default function ListingCard({ item }: { item: Listing }) {
  const meta = RARITY_META[item.rarity];
  const detail = item.slug ? `/market/lorcana/${item.slug}` : null;
  const graded = item.grade != null;

  // Real source rarity (e.g. "Enchanted") beats the collapsed 5-tier label.
  const label = item.rarityLabel ?? meta.label;
  const rarVar =
    {
      enchanted: "--color-r-enchanted",
      iconic: "--color-r-iconic",
    }[label.toLowerCase()] ?? meta.varName;

  // Real eBay PSA 10. Bulk-attached for grails; the rest load lazily on scroll
  // so the grid matches the detail page. Never an estimate.
  const ref = useRef<HTMLElement>(null);
  const [psa, setPsa] = useState<number | null>(item.psa10Price ?? null);
  useEffect(() => {
    if (graded || psa != null) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const qs = new URLSearchParams({
          title: item.title,
          set: item.set ?? "",
          rarity: item.rarityLabel ?? "",
        });
        fetch(`/api/psa10?${qs}`)
          .then((r) => r.json())
          .then((d) => {
            if (d && typeof d.price === "number") setPsa(d.price);
          })
          .catch(() => {});
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [graded, psa, item.title, item.set, item.rarityLabel]);

  return (
    <article
      ref={ref}
      className="hover-lift group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-[color-mix(in_oklch,var(--rar)_55%,transparent)] hover:shadow-[0_10px_34px_-14px_var(--rar)]"
      style={{ ["--rar" as string]: `var(${rarVar})` }}
    >
      {detail && (
        <Link
          href={detail}
          aria-label={`${item.cardName ?? item.title} details and price history`}
          className="absolute inset-0 z-[1]"
        />
      )}

      <div className="relative p-2.5">
        {graded ? (
          <GradedFrame
            compact
            estimated={item.estimated}
            name={item.cardName ?? item.title}
            grade={item.grade!}
            gradeLabel={item.gradeLabel ?? ""}
            cert={item.cert}
            image={item.image}
            photo={item.isSlab}
            rarity={item.rarity}
            className="w-full"
          />
        ) : (
          <div className="relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-[10px] bg-bg/40">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote scan
              <img src={item.image} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
            ) : (
              <CardArt rarity={item.rarity} category="lorcana" label={item.set} className="h-full w-full" />
            )}
          </div>
        )}
        {/* graded cards carry the PSA chip on the frame; show rarity pill only for raw */}
        {!graded && (
          <span
            className="absolute left-3.5 top-3.5 z-[2] inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[0.56rem] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
            style={{
              color: `var(${rarVar})`,
              borderColor: `color-mix(in oklch, var(${rarVar}) 40%, transparent)`,
              background: `color-mix(in oklch, var(${rarVar}) 12%, color-mix(in oklch, var(--color-bg) 60%, transparent))`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: `var(${rarVar})`, boxShadow: `0 0 6px var(${rarVar})` }}
            />
            {label}
          </span>
        )}
        {item.psaCount && item.psaCount > 1 && (
          <span className="absolute right-4 top-4 rounded-full border border-line bg-bg/80 px-2 py-0.5 font-mono text-[0.56rem] font-semibold text-muted backdrop-blur">
            {item.psaCount} listed
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[0.85rem] font-semibold leading-snug">
          {item.cardName ?? item.title}
          {item.cardSub && <span className="text-muted"> — {item.cardSub}</span>}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-[0.7rem] text-muted">
          {item.set && <span className="truncate">{item.set}</span>}
        </div>

        <div className="mt-auto pt-3">
          {graded ? (
            <div className="flex items-baseline gap-2">
              <Money usd={item.price} className="truncate font-mono text-lg font-bold tracking-tight" />
              {item.marketPrice != null && !item.isSlab && (
                <span className="shrink-0 font-mono text-[0.7rem] text-faint">
                  raw <Money usd={item.marketPrice} />
                </span>
              )}
            </div>
          ) : psa != null ? (
            <div className="grid grid-cols-2 divide-x divide-line overflow-hidden rounded-xl border border-line">
              <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2">
                <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider text-faint">
                  Market
                </span>
                <Money usd={item.price} compact className="truncate font-mono text-[0.95rem] font-bold tabular-nums" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 bg-gold/[0.07] px-3 py-2">
                <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider text-gold/85">
                  PSA 10 from
                </span>
                <Money usd={psa} compact className="truncate font-mono text-[0.95rem] font-bold tabular-nums text-gold" />
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2">
                <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wider text-faint">
                  Market
                </span>
                <Money usd={item.price} className="truncate font-mono text-base font-bold tabular-nums" />
              </div>
            </div>
          )}
          {graded ? (
            <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-faint">
              {item.isSlab ? "highest PSA listing" : "est. PSA · highest in grade"}
              {detail && " · tap for history"}
            </p>
          ) : (
            <div className="relative z-[2] mt-0.5 flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wide text-faint">
              {item.tcgplayerUrl ? (
                <a
                  href={item.tcgplayerUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  TCGplayer market
                  <IconArrowR width={11} height={11} />
                </a>
              ) : (
                <span>{item.conditionLabel}</span>
              )}
              {item.soldUrl && (
                <>
                  <span aria-hidden>·</span>
                  <a
                    href={item.soldUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    Sold
                    <IconArrowR width={11} height={11} />
                  </a>
                </>
              )}
            </div>
          )}

          <a
            href={item.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="relative z-[2] mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[11px] bg-primary text-sm font-bold text-primary-ink transition-all hover:bg-primary-strong active:translate-y-px"
          >
            {graded ? `Find PSA ${item.grade} on eBay` : "View on eBay"}
            <IconArrowR width={15} height={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
