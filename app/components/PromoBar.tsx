"use client";

import { useState } from "react";
import { IconBolt, IconClose } from "./Icons";

export default function PromoBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="relative z-[var(--z-sticky)] flex items-center justify-center gap-2.5 border-b border-line-soft bg-[linear-gradient(90deg,oklch(0.17_0.015_255),oklch(0.22_0.05_320),oklch(0.17_0.015_255))] px-10 py-2 text-center">
      <IconBolt width={15} height={15} className="shrink-0 text-accent" />
      <p className="text-[0.8rem] font-medium text-ink/90">
        The thrill of the rip — now in your pocket.{" "}
        <a href="#" className="font-semibold text-primary underline-offset-2 hover:underline">
          Get the app →
        </a>
      </p>
      <button
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-ink"
      >
        <IconClose width={15} height={15} />
      </button>
    </div>
  );
}
