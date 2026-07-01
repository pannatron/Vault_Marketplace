import { IconArrowR } from "./Icons";
import { SmartLink } from "./nav";

export function SectionHead({
  id,
  title,
  sub,
  actionLabel,
  actionHref = "#",
  badge,
}: {
  id?: string;
  title: string;
  sub?: string;
  actionLabel?: string;
  actionHref?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-5 flex items-end justify-between gap-4 scroll-mt-24">
      <div>
        <h2 className="flex items-center gap-2.5 text-[1.6rem] font-extrabold leading-tight sm:text-[1.9rem]">
          {title}
          {badge}
        </h2>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actionLabel && (
        <SmartLink
          href={actionHref}
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-ink sm:inline-flex"
        >
          {actionLabel}
          <IconArrowR
            width={16}
            height={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </SmartLink>
      )}
    </div>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 align-middle text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent">
      <span className="live-dot inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      Live
    </span>
  );
}
