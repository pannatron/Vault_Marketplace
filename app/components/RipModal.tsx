"use client";

import { useEffect, useRef, useState } from "react";
import { chaseOdds, packOdds, packPreview, ripPack, toPull } from "../lib/rip";
import { addToVault } from "../lib/vault";
import { RARITY_META, type CardSeed, type Pack, type Pull } from "../lib/types";
import CardArt from "./CardArt";
import Money from "./Money";
import { IconBolt, IconClose, IconShield } from "./Icons";

type Phase = "inside" | "ripping" | "result";

// Fallback only: reveal is normally driven by the pack-opening video's `ended`
// event. This fires if the video fails to load or `ended` never arrives.
const RIP_FALLBACK_MS = 12000;

export default function RipModal({
  pack,
  onClose,
  onPulled,
}: {
  pack: Pack;
  onClose: () => void;
  onPulled?: (p: Pull) => void;
}) {
  const [phase, setPhase] = useState<Phase>("inside");
  const [result, setResult] = useState<CardSeed | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settled = useRef(false);
  const pending = useRef<CardSeed | null>(null);

  // esc to close + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  // reveal the pull; guarded so the video's `ended` and the fallback timer
  // can race without double-firing
  const finish = () => {
    if (settled.current) return;
    settled.current = true;
    clearTimeout(timer.current ?? undefined);
    const card = pending.current;
    if (!card) return;
    setResult(card);
    setPhase("result");
    onPulled?.(toPull(card, pack));
  };

  const rip = () => {
    const card = ripPack(pack);
    pending.current = card;
    settled.current = false;
    // always enter the ripping phase so the pack-opening video plays; the
    // video's `ended` event (or the fallback timer) drives the reveal
    setPhase("ripping");
    timer.current = setTimeout(finish, RIP_FALLBACK_MS);
  };

  // ripping plays fullscreen — its own top-level layer, not inside the modal box
  if (phase === "ripping") {
    return <Ripping onDone={finish} onClose={onClose} />;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Open ${pack.name}`}
      onMouseDown={onClose}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-rise-in relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-bg/60 text-muted backdrop-blur transition-colors hover:text-ink"
        >
          <IconClose width={16} height={16} />
        </button>

        {phase === "inside" && <Inside pack={pack} onRip={rip} />}
        {phase === "result" && result && (
          <Result
            card={result}
            pack={pack}
            onAgain={() => {
              setResult(null);
              setPhase("inside");
            }}
            onKeep={() => {
              addToVault(toPull(result, pack));
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- inside view: odds + chase preview ---------- */

function Inside({ pack, onRip }: { pack: Pack; onRip: () => void }) {
  const odds = packOdds(pack).filter((o) => o.p > 0);
  const chase = chaseOdds(pack);
  const preview = packPreview(pack);

  return (
    <div className="p-6">
      <header className="flex items-start gap-4">
        <div className="w-24 shrink-0">
          <CardArt
            rarity={pack.topRarity}
            category={pack.category}
            label={pack.tier}
            grade="SEALED"
            slab={false}
            className="aspect-[3/4] w-full"
          />
        </div>
        <div className="min-w-0 pt-1">
          <h2 className="text-lg font-extrabold leading-tight">{pack.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-muted">
            <IconShield width={12} height={12} className="shrink-0 text-primary/80" />
            {pack.odds}
          </p>
          <p className="mt-2 font-mono text-[0.72rem] text-faint">
            1 in {chase.oneIn} hits {RARITY_META[chase.rarity].label}
          </p>
          <Money usd={pack.price} className="mt-2 block font-mono text-2xl font-bold tracking-tight" />
        </div>
      </header>

      {/* odds bars */}
      <div className="mt-5">
        <h3 className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
          Drop rates
        </h3>
        <div className="space-y-1.5">
          {odds.map((o) => {
            const meta = RARITY_META[o.rarity];
            return (
              <div key={o.rarity} className="flex items-center gap-2.5">
                <span className="w-20 shrink-0 text-[0.72rem] font-semibold">{meta.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg/60">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(2, o.p * 100)}%`,
                      background: `var(${meta.varName})`,
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[0.72rem] tabular-nums text-muted">
                  {(o.p * 100).toFixed(o.p < 0.01 ? 2 : 1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* what's inside */}
      <div className="mt-5">
        <h3 className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
          Chase cards inside
        </h3>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {preview.map((c) => {
            const meta = RARITY_META[c.rarity];
            return (
              <div key={c.card} className="w-[88px] shrink-0">
                <CardArt
                  rarity={c.rarity}
                  category={c.category}
                  grade={c.grade}
                  label={c.set}
                  className="aspect-[3/4] w-full"
                />
                <p className="mt-1 line-clamp-2 text-[0.62rem] leading-tight text-muted">
                  {c.card.split(" — ")[0]}
                </p>
                <span className="text-[0.58rem] font-bold" style={{ color: `var(${meta.varName})` }}>
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRip}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-ink transition-all hover:bg-primary-strong active:translate-y-px"
      >
        <IconBolt width={18} height={18} />
        Rip this pack
      </button>
    </div>
  );
}

/* ---------- ripping suspense ---------- */

function Ripping({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // some browsers ignore the autoplay attribute; kick playback explicitly
    const p = v.play();
    if (p && typeof p.catch === "function") {
      // autoplay blocked → reveal after a short beat instead of hanging
      p.catch(() => {
        fallback.current = setTimeout(onDone, 1600);
      });
    }
    return () => clearTimeout(fallback.current ?? undefined);
  }, [onDone]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ripping pack"
      className="fixed inset-0 z-[120] grid place-items-center bg-black"
    >
      <video
        ref={videoRef}
        src="/pack-opening.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onDone}
        onError={() => {
          fallback.current = setTimeout(onDone, 1200);
        }}
        className="h-full w-full object-cover"
      />

      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/40 text-white/85 backdrop-blur transition-colors hover:text-white"
      >
        <IconClose width={18} height={18} />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-4">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow">
          Ripping…
        </p>
        <button
          onClick={onDone}
          className="pointer-events-auto rounded-full border border-white/30 bg-black/40 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur transition-colors hover:bg-black/60"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

/* ---------- result reveal ---------- */

function Result({
  card,
  pack,
  onAgain,
  onKeep,
}: {
  card: CardSeed;
  pack: Pack;
  onAgain: () => void;
  onKeep: () => void;
}) {
  const meta = RARITY_META[card.rarity];
  const hit = meta.tier >= 3; // rare+
  return (
    <div className="p-6 text-center">
      <p
        className="animate-rise-in text-[0.72rem] font-bold uppercase tracking-[0.2em]"
        style={{ color: `var(${meta.varName})` }}
      >
        {hit ? "★ You hit a" : "You pulled a"} {meta.label}
      </p>

      <div className="animate-rise-in mx-auto mt-3 w-52">
        <CardArt
          rarity={card.rarity}
          category={card.category}
          grade={card.grade}
          label={card.set}
          className="aspect-[3/4] w-full"
        />
      </div>

      <h2 className="mt-4 text-lg font-extrabold leading-tight">{card.card}</h2>
      <p className="mt-1 text-[0.72rem] text-muted">
        {card.set} · from {pack.name}
      </p>
      <Money usd={card.value} className="mt-2 block font-mono text-2xl font-bold text-primary" />

      <div className="mt-6 flex gap-3">
        <button
          onClick={onAgain}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-primary-ink transition-all hover:bg-primary-strong active:translate-y-px"
        >
          <IconBolt width={16} height={16} />
          Rip again
        </button>
        <button
          onClick={onKeep}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-transparent text-sm font-bold text-ink transition-colors hover:border-primary/50"
        >
          <IconShield width={15} height={15} />
          Keep in vault
        </button>
      </div>
    </div>
  );
}
