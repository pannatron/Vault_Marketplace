import type { CSSProperties } from "react";
import { RARITY_META, type Rarity } from "../../lib/types";
import CardArt from "../CardArt";

/**
 * Renders a card inside a PSA-style graded slab.
 * - real eBay slab photos are already a slab → pass `photo` to show as-is.
 * - otherwise we frame the raw card scan in a PSA holder (representational).
 */
export default function Slab({
  name,
  sub,
  setLine,
  grade,
  gradeLabel,
  cert,
  image,
  rarity,
  category = "lorcana",
  photo = false,
  className = "",
}: {
  name: string;
  sub?: string;
  setLine: string;
  grade: number;
  gradeLabel: string;
  cert?: string;
  image?: string;
  rarity: Rarity;
  category?: "lorcana";
  /** image is already a real slab photo → render full-bleed */
  photo?: boolean;
  className?: string;
}) {
  if (photo && image) {
    return (
      <div className={`overflow-hidden rounded-[10px] bg-black/30 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote eBay slab photo */}
        <img src={image} alt={`${name} ${gradeLabel}`} loading="lazy" className="h-full w-full object-contain" />
      </div>
    );
  }

  const style = {
    ["--rar" as string]: `var(${RARITY_META[rarity].varName})`,
    containerType: "inline-size",
  } as CSSProperties;

  const gem = grade >= 10;

  return (
    <div
      style={style}
      className={`relative flex flex-col overflow-hidden rounded-[13px] bg-gradient-to-b from-[oklch(0.91_0.006_255)] via-[oklch(0.83_0.009_255)] to-[oklch(0.74_0.012_255)] p-[4%] shadow-[0_12px_34px_-12px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/45 ${className}`}
    >
      {/* rarity-tinted slab edge */}
      <div className="pointer-events-none absolute inset-0 z-20 rounded-[13px] ring-1 ring-[color-mix(in_oklch,var(--rar)_45%,transparent)]" />
      {/* plastic gloss + diagonal shine */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/22 via-transparent to-black/10" />
      <div className="pointer-events-none absolute -left-1/3 top-0 z-20 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* PSA label */}
      <div className="relative z-0 flex items-stretch gap-[3%] rounded-[5px] bg-gradient-to-b from-white to-[oklch(0.95_0.004_255)] px-[3.5%] py-[3%] text-black shadow-sm ring-1 ring-black/10">
        {/* red PSA logo block */}
        <div className="flex shrink-0 items-center justify-center rounded-[3px] bg-[oklch(0.5_0.2_25)] px-[2.5%] text-white shadow-inner">
          <span className="font-display text-[clamp(8px,3.6cqw,17px)] font-black leading-none tracking-tight">
            PSA
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="truncate font-mono text-[clamp(5px,2cqw,9px)] font-bold uppercase leading-tight tracking-tight text-black/65">
            {setLine}
          </span>
          <span className="truncate font-mono text-[clamp(6px,2.5cqw,12px)] font-extrabold uppercase leading-tight">
            {name}
          </span>
          {sub && (
            <span className="truncate font-mono text-[clamp(4px,1.7cqw,8px)] font-semibold uppercase leading-tight text-black/55">
              {sub}
            </span>
          )}
          {cert && (
            <span className="mt-[1px] font-mono text-[clamp(4px,1.5cqw,7px)] tracking-wide text-black/45">
              CERT {cert}
            </span>
          )}
        </div>

        {/* grade — gold for Gem Mint, red otherwise */}
        <div
          className={`flex shrink-0 flex-col items-center justify-center rounded-[4px] px-[3.5%] text-center shadow-inner ${
            gem
              ? "bg-gradient-to-b from-[oklch(0.86_0.14_88)] to-[oklch(0.71_0.14_70)] text-black ring-1 ring-[oklch(0.6_0.13_70)]"
              : "bg-[oklch(0.5_0.2_25)] text-white"
          }`}
        >
          <span className="font-mono text-[clamp(4px,1.5cqw,7px)] font-bold uppercase leading-none">
            {gradeLabel}
          </span>
          <span className="font-display text-[clamp(12px,5cqw,26px)] font-black leading-none">
            {grade}
          </span>
        </div>
      </div>

      {/* card window — inset behind plastic */}
      <div className="relative z-0 mt-[4%] flex-1 overflow-hidden rounded-[5px] bg-black p-[3%] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),inset_0_3px_10px_rgba(0,0,0,0.65)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote raw card scan
          <img src={image} alt={name} loading="lazy" className="h-full w-full rounded-[3px] object-contain" />
        ) : (
          <CardArt rarity={rarity} category={category} slab={false} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
