import type { Currency } from "./fx";

/** Format a USD amount in the chosen currency using the given USD→cur rate. */
export function formatMoney(
  usd: number,
  currency: Currency = "USD",
  rate = 1
): string {
  const v = usd * (currency === "USD" ? 1 : rate);
  // drop cents entirely once numbers get large — keeps big localized values tidy
  const frac = v >= 100 ? 0 : 2;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });
}

/** Compact currency for tight spaces: ฿120k / $3.6k. Full format under 1,000. */
export function formatMoneyCompact(
  usd: number,
  currency: Currency = "USD",
  rate = 1
): string {
  const v = usd * (currency === "USD" ? 1 : rate);
  if (v < 1000) return formatMoney(usd, currency, rate);
  const sym = currency === "THB" ? "฿" : "$";
  const k = v / 1000;
  // 1 decimal only under 10k (keeps $3.6k precise); 10k+ rounds to whole so the
  // value stays ≤5 chars and fits a narrow split column (฿22k, ฿247k).
  const digits = k >= 10 ? 0 : 1;
  return `${sym}${k.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits })}k`;
}

export function money(n: number): string {
  const hasCents = n % 1 !== 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function compactMoney(n: number): string {
  if (n >= 1000) {
    return "$" + (n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "k";
  }
  return money(n);
}

export function discountPct(price: number, fmv: number): number {
  return Math.round((1 - price / fmv) * 100);
}

export function relativeTime(secondsAgo: number): string {
  if (secondsAgo < 5) return "just now";
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  const m = Math.floor(secondsAgo / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
