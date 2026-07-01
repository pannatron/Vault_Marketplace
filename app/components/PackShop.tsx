"use client";

import { useState } from "react";
import { packs } from "../lib/data";
import { RARITY_META, type Pack, type Pull } from "../lib/types";
import CardArt from "./CardArt";
import Money from "./Money";
import RipModal from "./RipModal";
import { IconPlus, IconMinus, IconBolt, IconShield } from "./Icons";

export default function PackShop({ onPulled }: { onPulled?: (p: Pull) => void }) {
  const [open, setOpen] = useState<Pack | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
        {packs.map((p) => (
          <PackCard key={p.id} pack={p} onOpen={() => !p.soldOut && setOpen(p)} />
        ))}
      </div>
      {open && (
        <RipModal pack={open} onClose={() => setOpen(null)} onPulled={onPulled} />
      )}
    </>
  );
}

function PackCard({ pack, onOpen }: { pack: Pack; onOpen: () => void }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const meta = RARITY_META[pack.topRarity];

  const buy = () => {
    if (pack.soldOut) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="hover-lift group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface hover:border-line">
      <button
        type="button"
        onClick={onOpen}
        disabled={pack.soldOut}
        aria-label={`Open ${pack.name}`}
        className="relative block w-full cursor-pointer p-3 text-left disabled:cursor-not-allowed"
      >
        <CardArt
          rarity={pack.topRarity}
          category={pack.category}
          label={pack.tier}
          grade="SEALED"
          slab={false}
          className={`aspect-[3/4] w-full ${pack.soldOut ? "opacity-45 grayscale" : ""}`}
        />
        <span
          className="absolute left-4 top-4 rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide text-black"
          style={{ background: `var(${meta.varName})` }}
        >
          {pack.tier}
        </span>
        {pack.soldOut ? (
          <span className="absolute right-4 top-4 rounded-full border border-line bg-bg/80 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-muted backdrop-blur">
            Sold out
          </span>
        ) : (
          <span className="pointer-events-none absolute inset-x-3 bottom-3 grid place-items-center rounded-xl bg-black/55 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            See inside
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5">
        <h3 className="text-[0.92rem] font-semibold leading-snug">{pack.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-muted">
          <IconShield width={12} height={12} className="shrink-0 text-primary/80" />
          {pack.odds}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <Money usd={pack.price} className="font-mono text-lg font-bold tracking-tight" />
          <Stepper qty={qty} setQty={setQty} disabled={!!pack.soldOut} />
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={pack.soldOut ? undefined : onOpen}
            disabled={pack.soldOut}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-[11px] text-sm font-bold transition-all ${
              pack.soldOut
                ? "cursor-not-allowed border border-line bg-transparent text-faint"
                : "bg-primary text-primary-ink hover:bg-primary-strong active:translate-y-px"
            }`}
          >
            {pack.soldOut ? (
              "Notify me"
            ) : (
              <>
                <IconBolt width={16} height={16} />
                Open &amp; rip
              </>
            )}
          </button>
          {!pack.soldOut && (
            <button
              onClick={buy}
              aria-label="Add to cart"
              className={`inline-flex h-10 items-center justify-center rounded-[11px] border px-3 text-sm font-bold transition-all ${
                added
                  ? "border-success bg-success/10 text-success"
                  : "border-line text-muted hover:border-line-soft hover:text-ink"
              }`}
            >
              {added ? "✓" : "Buy"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Stepper({
  qty,
  setQty,
  disabled,
}: {
  qty: number;
  setQty: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center rounded-[10px] border border-line bg-bg/50">
      <button
        onClick={() => setQty(Math.max(1, qty - 1))}
        disabled={disabled || qty <= 1}
        aria-label="Decrease quantity"
        className="grid h-8 w-8 place-items-center rounded-l-[10px] text-muted transition-colors hover:text-ink disabled:opacity-35"
      >
        <IconMinus width={15} height={15} />
      </button>
      <span className="w-6 text-center font-mono text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <button
        onClick={() => setQty(Math.min(99, qty + 1))}
        disabled={disabled}
        aria-label="Increase quantity"
        className="grid h-8 w-8 place-items-center rounded-r-[10px] text-muted transition-colors hover:text-ink disabled:opacity-35"
      >
        <IconPlus width={15} height={15} />
      </button>
    </div>
  );
}
