import Link from "next/link";

const SETS: { code: string; name: string; tint: string }[] = [
  { code: "12", name: "Wilds Unknown", tint: "oklch(0.62 0.16 150)" },
  { code: "11", name: "Winterspell", tint: "oklch(0.66 0.14 250)" },
  { code: "10", name: "Whispers in the Well", tint: "oklch(0.6 0.13 300)" },
  { code: "9", name: "Fabled", tint: "oklch(0.72 0.15 85)" },
  { code: "8", name: "Reign of Jafar", tint: "oklch(0.64 0.19 25)" },
  { code: "7", name: "Archazia's Island", tint: "oklch(0.66 0.14 200)" },
  { code: "6", name: "Azurite Sea", tint: "oklch(0.66 0.15 230)" },
  { code: "5", name: "Shimmering Skies", tint: "oklch(0.74 0.13 210)" },
  { code: "4", name: "Ursula's Return", tint: "oklch(0.6 0.16 320)" },
  { code: "3", name: "Into the Inklands", tint: "oklch(0.64 0.14 180)" },
  { code: "2", name: "Rise of the Floodborn", tint: "oklch(0.62 0.15 260)" },
  { code: "1", name: "The First Chapter", tint: "oklch(0.72 0.15 60)" },
];

export default function SetsRail({ covers = {} }: { covers?: Record<string, string> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {SETS.map((s) => {
        const cover = covers[s.name];
        return (
          <Link
            key={s.code}
            href={`/market/lorcana?set=${encodeURIComponent(s.name)}`}
            className="hover-lift group relative flex h-[124px] items-end overflow-hidden rounded-2xl border border-line bg-surface p-3.5"
          >
            {cover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- remote card art */}
                <img
                  src={cover}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-top opacity-55 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100 group-hover:brightness-110"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/10 transition-opacity duration-500 group-hover:opacity-60" />
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-85"
                  style={{ background: s.tint }}
                />
                <span
                  aria-hidden
                  className="absolute right-3 top-2.5 font-display text-3xl font-extrabold leading-none opacity-25"
                  style={{ color: s.tint }}
                >
                  {s.code}
                </span>
              </>
            )}
            <div className="relative">
              <div
                className="text-[0.6rem] font-bold uppercase tracking-wide"
                style={{ color: s.tint }}
              >
                Set {s.code}
              </div>
              <div className="text-[0.92rem] font-bold leading-tight drop-shadow">{s.name}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
