export type Currency = "USD" | "THB";

export interface Rates {
  USD: number;
  THB: number;
  updated?: string;
}

const FALLBACK: Rates = { USD: 1, THB: 33.4 };

/** USD-based FX rates, refreshed daily. Free, no key (open.er-api.com). */
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86_400 }, // once a day
    });
    if (!res.ok) throw new Error(`fx ${res.status}`);
    const json = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    const thb = json.rates?.THB;
    if (json.result !== "success" || !thb) return FALLBACK;
    return { USD: 1, THB: thb, updated: json.time_last_update_utc };
  } catch {
    return FALLBACK;
  }
}
