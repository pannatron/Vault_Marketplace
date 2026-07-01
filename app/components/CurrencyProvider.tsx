"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Currency, Rates } from "../lib/fx";
import { formatMoney, formatMoneyCompact } from "../lib/format";

interface Ctx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  format: (usd: number) => string;
  formatCompact: (usd: number) => string;
}

const CurrencyCtx = createContext<Ctx | null>(null);

export function CurrencyProvider({
  rates,
  children,
}: {
  rates: Rates;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  // restore saved choice after mount (external store sync; SSR starts at USD)
  useEffect(() => {
    const saved = localStorage.getItem("cm-currency");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "USD" || saved === "THB") setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("cm-currency", c);
  }, []);

  const format = useCallback(
    (usd: number) => formatMoney(usd, currency, rates[currency]),
    [currency, rates]
  );
  const formatCompact = useCallback(
    (usd: number) => formatMoneyCompact(usd, currency, rates[currency]),
    [currency, rates]
  );

  return (
    <CurrencyCtx.Provider value={{ currency, setCurrency, rates, format, formatCompact }}>
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency(): Ctx {
  const c = useContext(CurrencyCtx);
  if (!c) throw new Error("useCurrency must be used within CurrencyProvider");
  return c;
}
