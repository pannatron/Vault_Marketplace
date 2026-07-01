"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronL, IconChevronR } from "./Icons";

export default function ScrollRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<{ l: boolean; r: boolean }>({
    l: false,
    r: true,
  });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const l = el.scrollLeft > 4;
    const r = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setEdge({ l, r });
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        onScroll={update}
        className={`scrollrow flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-3 ${className}`}
      >
        {children}
      </div>

      <Arrow side="l" show={edge.l} onClick={() => nudge(-1)} />
      <Arrow side="r" show={edge.r} onClick={() => nudge(1)} />
    </div>
  );
}

function Arrow({
  side,
  show,
  onClick,
}: {
  side: "l" | "r";
  show: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "l" ? "Scroll left" : "Scroll right"}
      tabIndex={show ? 0 : -1}
      className={`absolute top-[42%] z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface-2/90 text-ink shadow-xl backdrop-blur transition-all duration-200 hover:border-primary/50 hover:bg-surface-2 md:grid ${
        side === "l" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      } ${show ? "opacity-0 group-hover/row:opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {side === "l" ? (
        <IconChevronL width={18} height={18} />
      ) : (
        <IconChevronR width={18} height={18} />
      )}
    </button>
  );
}
