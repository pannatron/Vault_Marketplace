import Link from "next/link";
import type { Rec } from "../../lib/recommend";
import RecCard from "./RecCard";
import { LiveBadge } from "../Section";
import { IconArrowR } from "../Icons";

/**
 * Home teaser for the spotlight. Auto-runs the signal-flagged cards as a
 * horizontal marquee (pauses on hover) and links to the full page.
 */
export default function Trending({ recs, windowDays }: { recs: Rec[]; windowDays: number }) {
  if (recs.length === 0) return null;

  // enough cards for a full-width loop, then duplicate the set so the
  // translateX(-50%) marquee wraps seamlessly
  const base =
    recs.length >= 6
      ? recs
      : Array.from({ length: Math.ceil(6 / recs.length) }, () => recs).flat();
  const track = [...base, ...base];
  const durSec = Math.max(28, base.length * 6);

  return (
    <section className="overflow-hidden rounded-[22px] border border-primary/25 bg-[radial-gradient(120%_140%_at_0%_0%,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_55%)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span aria-hidden className="text-lg">💡</span>
        <h2 className="text-[1.4rem] font-extrabold leading-none tracking-tight sm:text-[1.7rem]">
          Why these cards?
        </h2>
        <LiveBadge />
        <Link
          href="/spotlight"
          className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-strong"
        >
          See all {recs.length} picks
          <IconArrowR width={15} height={15} />
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Not a top-sellers list — each card is flagged by a live market signal, and
        we tell you exactly which one.{" "}
        <span className="text-faint">Information only · not investment advice.</span>
      </p>

      <div
        className="marquee mt-5 [--marquee-dur:var(--dur)]"
        style={{ ["--dur" as string]: `${durSec}s` }}
      >
        <ul className="marquee-track gap-3.5">
          {track.map((m, i) => (
            <li
              key={`${m.id}-${i}`}
              className="w-[320px] shrink-0"
              aria-hidden={i >= base.length}
            >
              <RecCard m={m} windowDays={windowDays} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
