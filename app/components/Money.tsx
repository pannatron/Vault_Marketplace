"use client";

import { useCurrency } from "./CurrencyProvider";

/** Renders a USD amount in the user's selected currency. */
export default function Money({
  usd,
  className,
  compact,
}: {
  usd: number;
  className?: string;
  /** compact form for tight spaces: ฿120k / $3.6k */
  compact?: boolean;
}) {
  const { format, formatCompact } = useCurrency();
  return <span className={className}>{(compact ? formatCompact : format)(usd)}</span>;
}
