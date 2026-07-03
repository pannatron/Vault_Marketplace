import Link from "next/link";
import {
  IconHome,
  IconPack,
  IconCoin,
  IconStore,
  IconTrophy,
  IconRaffle,
  IconBolt,
  IconSpark,
  IconShield,
} from "./Icons";
import type { AnchorHTMLAttributes, SVGProps } from "react";

/** Link for real routes (prefetched), plain anchor for placeholders / hashes. */
export function SmartLink({
  href,
  children,
  ...rest
}: { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: (p: SVGProps<SVGSVGElement>) => React.ReactNode;
  badge?: string;
}

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "My Vault", href: "/vault", icon: IconShield },
  { label: "Packs", href: "/packs", icon: IconPack },
  { label: "Just Pulled", href: "/packs", icon: IconCoin, badge: "LIVE" },
  { label: "Lorcana Market", href: "/market/lorcana", icon: IconStore },
  { label: "Spotlight", href: "/spotlight", icon: IconBolt, badge: "NEW" },
  { label: "Collect", href: "/collect", icon: IconSpark, badge: "NEW" },
  { label: "Leaderboard", href: "#", icon: IconTrophy },
];

export const eventsNav: NavItem[] = [
  { label: "Raffle", href: "#", icon: IconRaffle },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Card Mania home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-[11px] bg-primary text-primary-ink shadow-[0_0_22px_-4px_var(--color-primary)]">
        <span className="font-display text-xl font-extrabold leading-none">C</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
      </span>
      <span className="font-display text-[1.35rem] font-extrabold leading-none tracking-tight">
        Card<span className="text-primary">Mania</span>
      </span>
    </Link>
  );
}
