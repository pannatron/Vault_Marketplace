"use client";

import { useMemo, useState } from "react";
import type { PricePoint } from "../../lib/types";
import { sliceRange } from "../../lib/price-history";
import { useCurrency } from "../CurrencyProvider";

const RANGES = [
  { key: 7, label: "1W" },
  { key: 30, label: "1M" },
  { key: 90, label: "3M" },
  { key: 365, label: "1Y" },
] as const;

const W = 760;
const H = 260;
const PAD = { t: 18, r: 14, b: 26, l: 50 };

interface Props {
  normal: PricePoint[];
  foil?: PricePoint[];
  hasFoil: boolean;
  /** label for the base series (foil-only cards show "Foil") */
  baseLabel?: string;
  /** true = real TCGplayer history; false = estimated */
  real?: boolean;
}

export default function PriceChart({
  normal,
  foil,
  hasFoil,
  baseLabel = "Normal",
  real = false,
}: Props) {
  const [range, setRange] = useState<number>(90);
  const [variant, setVariant] = useState<"normal" | "foil">("normal");

  const { format: money } = useCurrency();
  const series = variant === "foil" && foil?.length ? foil : normal;
  const stat = useMemo(() => sliceRange(series, range), [series, range]);
  const [hover, setHover] = useState<number | null>(null);

  const pts = stat.points;
  const up = stat.change >= 0;
  const stroke = up ? "var(--color-success)" : "var(--color-accent)";

  const { line, area, xy, lo, hi } = useMemo(() => {
    if (pts.length === 0)
      return { line: "", area: "", xy: [] as [number, number][], lo: 0, hi: 0 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of pts) {
      if (p.price < lo) lo = p.price;
      if (p.price > hi) hi = p.price;
    }
    const pad = (hi - lo) * 0.12 || hi * 0.1 || 1;
    lo -= pad;
    hi += pad;
    const iw = W - PAD.l - PAD.r;
    const ih = H - PAD.t - PAD.b;
    const xy = pts.map((p, i) => {
      const x = PAD.l + (pts.length === 1 ? iw / 2 : (i / (pts.length - 1)) * iw);
      const y = PAD.t + ih - ((p.price - lo) / (hi - lo || 1)) * ih;
      return [x, y] as [number, number];
    });
    const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const area =
      `${line} L${xy[xy.length - 1][0].toFixed(1)} ${H - PAD.b} L${xy[0][0].toFixed(1)} ${H - PAD.b} Z`;
    return { line, area, xy, lo, hi };
  }, [pts]);

  const fmtDate = (t: number) =>
    new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const iw = W - PAD.l - PAD.r;
    const ratio = Math.min(1, Math.max(0, (x - PAD.l) / iw));
    setHover(Math.round(ratio * (pts.length - 1)));
  };

  const hi3 = [hi, (hi + lo) / 2, lo];

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
      {/* header: change + controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">
              {money(pts[pts.length - 1]?.price ?? 0)}
            </span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: stroke }}
            >
              {up ? "▲" : "▼"} {money(Math.abs(stat.change))} ({up ? "+" : "−"}
              {Math.abs(stat.changePct)}%)
            </span>
          </div>
          <p className="mt-0.5 text-[0.72rem] text-faint">
            {variant === "foil" ? "Foil" : baseLabel} · last{" "}
            {RANGES.find((r) => r.key === range)?.label} ·{" "}
            {real ? "TCGplayer market" : "est. trend"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {hasFoil && (
            <div className="flex rounded-full border border-line p-0.5">
              {(["normal", "foil"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  aria-pressed={variant === v}
                  className={`h-7 rounded-full px-3 text-[0.72rem] font-semibold capitalize transition-colors ${
                    variant === v ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          <div className="flex rounded-full border border-line p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
                className={`h-7 rounded-full px-3 text-[0.72rem] font-semibold transition-colors ${
                  range === r.key ? "bg-primary/15 text-primary" : "text-muted hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label="Price history chart"
        >
          <defs>
            <linearGradient id="pc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* gridlines + y labels */}
          {hi3.map((v, i) => {
            const y = PAD.t + (i * (H - PAD.t - PAD.b)) / 2;
            return (
              <g key={i}>
                <line
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y}
                  y2={y}
                  stroke="var(--color-line-soft)"
                  strokeDasharray="3 4"
                />
                <text
                  x={PAD.l - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[var(--color-faint)] font-mono text-[10px]"
                >
                  {money(v)}
                </text>
              </g>
            );
          })}

          {area && <path d={area} fill="url(#pc-fill)" />}
          {line && (
            <path d={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* x labels */}
          {pts.length > 1 && (
            <>
              <text x={PAD.l} y={H - 8} className="fill-[var(--color-faint)] font-mono text-[10px]">
                {fmtDate(pts[0].t)}
              </text>
              <text x={W - PAD.r} y={H - 8} textAnchor="end" className="fill-[var(--color-faint)] font-mono text-[10px]">
                {fmtDate(pts[pts.length - 1].t)}
              </text>
            </>
          )}

          {/* hover guide */}
          {hover != null && xy[hover] && (
            <g>
              <line
                x1={xy[hover][0]}
                x2={xy[hover][0]}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="var(--color-line)"
              />
              <circle cx={xy[hover][0]} cy={xy[hover][1]} r={4.5} fill={stroke} stroke="var(--color-bg)" strokeWidth={2} />
            </g>
          )}

          {/* last-point dot */}
          {xy.length > 0 && hover == null && (
            <circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r={4} fill={stroke} />
          )}
        </svg>

        {/* tooltip */}
        {hover != null && pts[hover] && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-center shadow-xl"
            style={{
              left: `${PAD.l / W * 100 + (hover / Math.max(1, pts.length - 1)) * ((W - PAD.l - PAD.r) / W) * 100}%`,
              top: `${(xy[hover]?.[1] ?? 0) / H * 100}%`,
            }}
          >
            <div className="font-mono text-sm font-bold">{money(pts[hover].price)}</div>
            <div className="font-mono text-[0.62rem] text-faint">{fmtDate(pts[hover].t)}</div>
          </div>
        )}
      </div>

      <p className="mt-3 flex items-center justify-between gap-2 text-[0.68rem] text-faint">
        <span>
          Range low <span className="font-mono text-muted">{money(stat.low)}</span> · high{" "}
          <span className="font-mono text-muted">{money(stat.high)}</span>
        </span>
        <span className="italic">{real ? "TCGplayer market history" : "estimated trend"}</span>
      </p>
    </div>
  );
}
