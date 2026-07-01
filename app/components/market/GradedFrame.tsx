import type { CSSProperties } from "react";
import { RARITY_META, type Rarity } from "../../lib/types";
import CardArt from "../CardArt";

/**
 * Hero graded display: the full card image, big, inside a reflective
 * holo-lit PSA frame. Rarity drives the border + glow color.
 * - real eBay slab photo → show as-is (it already shows the grade).
 * - raw scan / art → frame it and overlay a PSA grade badge.
 */
export default function GradedFrame({
  name,
  grade,
  gradeLabel,
  cert,
  image,
  rarity,
  photo = false,
  compact = false,
  company = "PSA",
  estimated = false,
  className = "",
}: {
  name: string;
  grade: number;
  gradeLabel: string;
  cert?: string;
  image?: string;
  rarity: Rarity;
  /** image is already a real slab photo */
  photo?: boolean;
  /** thumbnail size — drops the holder label for a clean card + grade chip */
  compact?: boolean;
  /** grader shown on the chip; "RAW" = ungraded, no grade number */
  company?: "PSA" | "BGS" | "CGC" | "RAW";
  /** grade price is a model estimate → show an EST marker */
  estimated?: boolean;
  className?: string;
}) {
  const style = {
    ["--rar" as string]: `var(${RARITY_META[rarity].varName})`,
  } as CSSProperties;
  const gem = grade >= 10;
  const raw = company === "RAW";
  const showEst = estimated && !raw;

  return (
    <div style={style} className={`relative ${className}`}>
      {/* rarity glow bloom */}
      <div
        className={`pointer-events-none absolute opacity-60 ${
          compact ? "-inset-1 rounded-[16px] blur-md" : "-inset-3 rounded-[28px] blur-2xl"
        }`}
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--rar) 45%, transparent), transparent)",
        }}
      />

      <div className={`psa-frame ${compact ? "is-sm" : ""}`}>
        <div className={`relative overflow-hidden bg-black ${compact ? "rounded-[11px]" : "rounded-[16px]"}`}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote card/slab image
            <img src={image} alt={name} className="block w-full" />
          ) : (
            <CardArt rarity={rarity} category="lorcana" className="aspect-[5/7] w-full" />
          )}

          {/* glass reflections */}
          <div className="psa-sheen pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/8 via-transparent to-white/5" />

          {/* PSA badge — real slab photo shows its own grade, skip overlay */}
          {!photo &&
            (compact ? (
              <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 ring-1 ring-white/15 backdrop-blur">
                <span className="font-display text-[0.5rem] font-black leading-none text-white">
                  {company}
                </span>
                {!raw && (
                  <span
                    className={`font-display text-[0.62rem] font-black leading-none ${
                      gem ? "text-[oklch(0.84_0.14_86)]" : "text-white"
                    }`}
                  >
                    {grade}
                  </span>
                )}
                {showEst && (
                  <span className="font-mono text-[0.42rem] font-bold leading-none text-white/55">
                    EST
                  </span>
                )}
              </div>
            ) : (
              <div className="absolute left-[4%] top-[4%] flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
                <span className="font-display text-sm font-black leading-none tracking-tight text-white">
                  {company}
                </span>
                {!raw && (
                  <>
                    <span
                      className={`font-display text-base font-black leading-none ${
                        gem ? "text-[oklch(0.84_0.14_86)]" : "text-white"
                      }`}
                    >
                      {grade}
                    </span>
                    <span className="font-mono text-[0.55rem] font-bold uppercase tracking-wide text-white/55">
                      {gradeLabel}
                    </span>
                  </>
                )}
                {showEst && (
                  <span className="rounded bg-white/15 px-1 py-px font-mono text-[0.5rem] font-bold uppercase tracking-wide text-white/70">
                    est
                  </span>
                )}
              </div>
            ))}
          {!photo && !compact && cert && (
            <div className="absolute bottom-[3.5%] right-[4%] rounded-full bg-black/55 px-2 py-0.5 font-mono text-[0.5rem] tracking-wide text-white/60 backdrop-blur-sm">
              CERT {cert}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
