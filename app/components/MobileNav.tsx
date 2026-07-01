"use client";

import { useEffect, useState } from "react";
import { primaryNav, eventsNav, Logo, SmartLink } from "./nav";
import { IconMenu, IconClose, IconShield } from "./Icons";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center rounded-[10px] text-ink transition-colors hover:bg-white/[0.06] lg:hidden"
      >
        <IconMenu />
      </button>

      {/* backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[var(--z-drawer-backdrop)] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed inset-y-0 left-0 z-[var(--z-drawer)] flex w-[280px] max-w-[82vw] flex-col border-r border-line bg-rail px-3.5 pb-5 pt-4 transition-transform duration-300 [transition-timing-function:var(--ease-out-expo)] lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {primaryNav.map((i) => (
            <SmartLink
              key={i.label}
              href={i.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[10px] px-3 py-3 text-[0.95rem] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
            >
              <i.icon className="text-faint" />
              <span className="flex-1">{i.label}</span>
              {i.badge && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </SmartLink>
          ))}
          <div className="mt-4 mb-1 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-faint">
            Events
          </div>
          {eventsNav.map((i) => (
            <SmartLink
              key={i.label}
              href={i.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[10px] px-3 py-3 text-[0.95rem] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
            >
              <i.icon className="text-faint" />
              {i.label}
            </SmartLink>
          ))}
        </nav>

        <button className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-ink">
          <IconShield width={17} height={17} />
          Submit collectibles
        </button>
      </div>
    </>
  );
}
