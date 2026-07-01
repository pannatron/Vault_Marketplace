import { Logo } from "./nav";
import { IconShield, IconBolt, IconSpark } from "./Icons";

const cols: { title: string; links: string[] }[] = [
  { title: "Marketplace", links: ["Browse all", "Packs", "Graded cards", "Best deals", "Watches"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { title: "Support", links: ["Help center", "How vaulting works", "Shipping & redeem", "Contact"] },
  { title: "Legal", links: ["Terms of service", "Privacy", "Authenticity guarantee"] },
];

const trust = [
  { icon: IconShield, t: "Vaulted & insured", d: "Every card stored in a secured, insured facility." },
  { icon: IconBolt, t: "Rip in seconds", d: "Open packs instantly. Trade the hit or redeem it." },
  { icon: IconSpark, t: "Graded & real", d: "PSA, CGC & BGS slabs — authenticity guaranteed." },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line-soft bg-rail">
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">
        {/* trust row */}
        <div className="grid gap-3 sm:grid-cols-3">
          {trust.map((x) => (
            <div
              key={x.t}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface/50 p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <x.icon width={19} height={19} />
              </span>
              <div>
                <h3 className="text-[0.92rem] font-semibold">{x.t}</h3>
                <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted">{x.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* links */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">
              Rip digital packs. Reveal real, graded, vaulted trading cards. Own
              them digitally, trade instantly, redeem worldwide.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[0.72rem] text-muted">
                 App Store
              </span>
              <span className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[0.72rem] text-muted">
                ▶ Google Play
              </span>
            </div>
          </div>

          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h4 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-faint">
                {c.title}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[0.84rem] text-muted transition-colors hover:text-ink"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line-soft pt-6 text-[0.76rem] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} Card Mania, Inc. · 228 Park Ave S, New York, NY 10003</p>
          <p className="font-mono">contact@cardmania.io</p>
        </div>
      </div>
    </footer>
  );
}
