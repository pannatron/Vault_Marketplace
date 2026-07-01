import type { CSSProperties } from "react";
import { RARITY_META, type CategoryKey, type Rarity } from "../lib/types";

// monochrome geometric glyphs only — colored emoji would break the foil aesthetic
const CATEGORY_GLYPH: Record<CategoryKey, string> = {
  pokemon: "◓",
  onepiece: "☠",
  baseball: "⬡",
  basketball: "⬢",
  football: "◆",
  mtg: "✦",
  soccer: "⬟",
  marvel: "✷",
  lorcana: "❖",
};

const CATEGORY_TAG: Record<CategoryKey, string> = {
  pokemon: "POKÉMON",
  onepiece: "ONE PIECE",
  baseball: "BASEBALL",
  basketball: "BASKETBALL",
  football: "FOOTBALL",
  mtg: "MAGIC",
  soccer: "SOCCER",
  marvel: "MARVEL",
  lorcana: "LORCANA",
};

interface Props {
  rarity: Rarity;
  category: CategoryKey;
  /** small label printed across the card (set / pack name) */
  label?: string;
  grade?: string;
  className?: string;
  /** show the graded-slab chrome frame */
  slab?: boolean;
}

export default function CardArt({
  rarity,
  category,
  label,
  grade,
  className = "",
  slab = true,
}: Props) {
  const meta = RARITY_META[rarity];
  const foil = meta.tier >= 3; // rare+
  const lines = meta.tier >= 4; // epic+
  const style = {
    ["--rar" as string]: `var(${meta.varName})`,
    containerType: "inline-size",
  } as CSSProperties;

  return (
    <div
      style={style}
      className={`holo glow-rar grid place-items-center rounded-[10px] ${
        foil ? "holo--foil" : ""
      } ${className}`}
    >
      {lines && <span className="holo--lines pointer-events-none absolute inset-0 rounded-[10px]" />}

      {/* graded-slab inner frame */}
      {slab && (
        <span className="pointer-events-none absolute inset-[5%] rounded-[7px] border border-white/12" />
      )}

      {/* set tag */}
      {label && (
        <span className="pointer-events-none absolute left-0 right-0 top-[7%] px-[10%] text-center font-mono text-[clamp(7px,1.6cqw,11px)] font-medium uppercase tracking-[0.14em] text-white/70">
          {label}
        </span>
      )}

      {/* central emblem */}
      <span
        aria-hidden
        className="select-none text-[clamp(34px,16cqw,90px)] leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
        style={{ color: "color-mix(in oklch, var(--rar) 60%, white)" }}
      >
        {CATEGORY_GLYPH[category]}
      </span>

      {/* bottom plate: category + grade */}
      <span className="pointer-events-none absolute bottom-[7%] left-0 right-0 flex items-center justify-center gap-[4%] px-[8%]">
        <span className="font-mono text-[clamp(6px,1.5cqw,10px)] font-semibold uppercase tracking-[0.12em] text-white/65">
          {CATEGORY_TAG[category]}
        </span>
        {grade && (
          <span
            className="rounded-full px-[6%] py-[2px] font-mono text-[clamp(6px,1.5cqw,10px)] font-bold text-black"
            style={{ background: "color-mix(in oklch, var(--rar) 78%, white)" }}
          >
            {grade}
          </span>
        )}
      </span>
    </div>
  );
}
