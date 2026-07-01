"use client";

import { useCurrency } from "./CurrencyProvider";
import type { Currency } from "../lib/fx";

const OPTS: { key: Currency; label: string; sym: string }[] = [
  { key: "USD", label: "USD", sym: "$" },
  { key: "THB", label: "THB", sym: "฿" },
];

export default function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div
      role="group"
      aria-label="Currency"
      className="flex items-center rounded-[10px] border border-line bg-surface/70 p-0.5"
    >
      {OPTS.map((o) => {
        const on = currency === o.key;
        return (
          <button
            key={o.key}
            onClick={() => setCurrency(o.key)}
            aria-pressed={on}
            title={o.label}
            className={`h-8 rounded-[8px] px-2.5 font-mono text-[0.72rem] font-bold transition-colors ${
              on ? "bg-primary/15 text-primary" : "text-muted hover:text-ink"
            }`}
          >
            {o.sym}
            <span className="ml-0.5 hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
