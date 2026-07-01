import { primaryNav, eventsNav, SmartLink, type NavItem } from "./nav";
import { IconShield } from "./Icons";

function NavLink({ item }: { item: NavItem }) {
  return (
    <SmartLink
      href={item.href}
      className="group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
    >
      <item.icon className="shrink-0 text-faint transition-colors group-hover:text-primary" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="live-dot inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      )}
    </SmartLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[244px] shrink-0 flex-col border-r border-line-soft bg-rail px-3.5 pb-5 pt-5 lg:flex">
      <nav className="flex flex-1 flex-col gap-1">
        {primaryNav.map((i) => (
          <NavLink key={i.label} item={i} />
        ))}

        <div className="mt-5 mb-1 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-faint">
          Events
        </div>
        {eventsNav.map((i) => (
          <NavLink key={i.label} item={i} />
        ))}
      </nav>

      <a
        href="#"
        className="group mt-4 flex flex-col gap-2 rounded-xl border border-line bg-surface/60 p-3.5 transition-colors hover:border-primary/40"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <IconShield width={17} height={17} className="text-primary" />
          Submit collectibles
        </span>
        <span className="text-xs leading-relaxed text-muted">
          Ship & vault your cards free. Own and trade them digitally.
        </span>
      </a>
    </aside>
  );
}
