import MobileNav from "./MobileNav";
import { Logo } from "./nav";
import { IconSearch } from "./Icons";
import CurrencySelect from "./CurrencySelect";

export default function Header() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-line-soft bg-rail/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <MobileNav />
        <Logo className="lg:hidden" />

        {/* search */}
        <div className="relative ml-1 hidden max-w-md flex-1 items-center sm:flex lg:ml-0">
          <IconSearch
            width={18}
            height={18}
            className="pointer-events-none absolute left-3.5 text-faint"
          />
          <input
            type="search"
            placeholder="Search cards, players, sets…"
            aria-label="Search"
            className="h-10 w-full rounded-[11px] border border-line bg-surface/70 pl-10 pr-4 text-sm text-ink placeholder:text-faint transition-colors focus:border-primary/60 focus:bg-surface focus:outline-none"
          />
          <kbd className="absolute right-3 hidden items-center rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[0.65rem] text-faint md:inline-flex">
            /
          </kbd>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <button
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-[10px] text-ink transition-colors hover:bg-white/[0.06] sm:hidden"
          >
            <IconSearch width={18} height={18} />
          </button>
          <CurrencySelect />
          <button className="hidden h-10 rounded-[11px] px-4 text-sm font-medium text-muted transition-colors hover:text-ink sm:inline-flex sm:items-center">
            Log in
          </button>
          <button className="inline-flex h-10 items-center rounded-[11px] bg-ink px-4 text-sm font-semibold text-bg transition-transform hover:-translate-y-px active:translate-y-0">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
