"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVault, vaultTotals, VAULT_EVENT, type VaultCard } from "../../lib/vault";
import { RARITY_META } from "../../lib/types";
import CardArt from "../CardArt";
import Money from "../Money";
import { IconShield, IconBolt } from "../Icons";

function ago(ms: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function VaultView() {
  const [cards, setCards] = useState<VaultCard[] | null>(null);

  useEffect(() => {
    const load = () => setCards(getVault());
    load();
    window.addEventListener(VAULT_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(VAULT_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // first paint (pre-hydration read) — keep it calm, avoids layout flash
  if (cards === null) return <div className="min-h-[40vh]" />;

  if (cards.length === 0) {
    return (
      <div className="relative mt-8 grid place-items-center overflow-hidden rounded-[22px] border border-line bg-surface/40 px-6 py-20 text-center">
        {/* faint stacked-card motif */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.07]">
          <div className="flex gap-2">
            {[-8, 0, 8].map((r, i) => (
              <div
                key={i}
                className="h-40 w-28 rounded-xl border border-ink"
                style={{ transform: `rotate(${r}deg)` }}
              />
            ))}
          </div>
        </div>
        <div className="relative">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-bg/60 text-primary">
            <IconShield width={26} height={26} />
          </span>
          <h2 className="mt-4 text-lg font-extrabold">Your vault is empty</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Rip a pack and keep what you pull — your cards land here, vaulted and
            ready to trade or redeem.
          </p>
          <Link
            href="/packs"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-ink transition-all hover:bg-primary-strong active:translate-y-px"
          >
            <IconBolt width={16} height={16} />
            Rip your first pack
          </Link>
        </div>
      </div>
    );
  }

  const { count, value } = vaultTotals(cards);
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  const top = sorted[0];

  return (
    <>
      {/* portfolio summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/25 bg-[radial-gradient(120%_140%_at_0%_0%,color-mix(in_oklch,var(--color-primary)_12%,transparent),transparent_60%)] p-5 sm:col-span-1">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
            Vault value
          </p>
          <Money usd={value} className="mt-1 block font-mono text-3xl font-extrabold tracking-tight" />
        </div>
        <div className="rounded-2xl border border-line bg-surface/50 p-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Cards held</p>
          <p className="mt-1 font-mono text-3xl font-extrabold tabular-nums">{count}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface/50 p-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Top card</p>
          <p className="mt-1 line-clamp-1 text-base font-bold">{top.card}</p>
          <Money usd={top.value} className="font-mono text-sm font-semibold text-primary" />
        </div>
      </div>

      {/* holdings */}
      <div className="mt-8 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
        {sorted.map((c) => {
          const meta = RARITY_META[c.rarity];
          return (
            <article
              key={c.id}
              style={{ ["--rar" as string]: `var(${meta.varName})` }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-[color-mix(in_oklch,var(--rar)_55%,transparent)] hover:shadow-[0_16px_44px_-20px_var(--rar)]"
            >
              <div className="relative aspect-[3/4] border-b border-line-soft bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklch,var(--rar)_22%,transparent),transparent_60%)] p-2">
                <CardArt rarity={c.rarity} category={c.category} label={c.set} className="h-full w-full" />
                <span
                  className="absolute left-2 top-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-wide backdrop-blur-sm"
                  style={{
                    background: "color-mix(in oklch, var(--rar) 22%, var(--color-bg))",
                    borderColor: "color-mix(in oklch, var(--rar) 45%, transparent)",
                    color: "color-mix(in oklch, var(--rar) 55%, white)",
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <h3 className="line-clamp-1 text-[0.88rem] font-bold leading-tight">{c.card}</h3>
                <span className="truncate text-[0.68rem] text-faint">
                  {c.set} · from {c.pack}
                </span>
                <div className="mt-auto flex items-center justify-between pt-1.5">
                  <Money usd={c.value} className="font-mono text-base font-bold tracking-tight" />
                  <span className="font-mono text-[0.62rem] text-faint">{ago(c.acquiredAt)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
