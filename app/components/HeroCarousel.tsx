"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { heroSlides } from "../lib/data";
import CardArt from "./CardArt";
import { IconChevronL, IconChevronR, IconBolt } from "./Icons";

const ACCENT_VAR: Record<string, string> = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  gold: "var(--color-gold)",
};

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = heroSlides.length;
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const t = setInterval(() => setI((p) => (p + 1) % n), reduce ? 9000 : 6000);
    return () => clearInterval(t);
  }, [paused, n]);

  const go = (d: number) => setI((p) => (p + d + n) % n);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured packs"
      className="relative overflow-hidden rounded-[22px] border border-line"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-[450ms] [transition-timing-function:var(--ease-out-expo)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {heroSlides.map((s, idx) => (
          <Slide key={s.id} slide={s} active={idx === i} />
        ))}
      </div>

      {/* controls */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55"
      >
        <IconChevronL />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55"
      >
        <IconChevronR />
      </button>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {heroSlides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === i}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === i ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function Slide({
  slide,
  active,
}: {
  slide: (typeof heroSlides)[number];
  active: boolean;
}) {
  const accent = ACCENT_VAR[slide.accent];
  const style = { ["--ac" as string]: accent } as CSSProperties;

  return (
    <div
      aria-hidden={!active}
      style={style}
      className="relative grid min-w-full grid-cols-1 items-center gap-6 overflow-hidden px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16"
    >
      {/* ambient wash */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 120% at 80% 10%, color-mix(in oklch, var(--ac) 28%, transparent), transparent 55%), radial-gradient(90% 90% at 0% 100%, color-mix(in oklch, var(--ac) 14%, transparent), transparent 60%), var(--color-surface)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--ac)" }}
      />

      <div className="max-w-xl">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em]"
          style={{
            color: "var(--ac)",
            borderColor: "color-mix(in oklch, var(--ac) 40%, transparent)",
            background: "color-mix(in oklch, var(--ac) 12%, transparent)",
          }}
        >
          <IconBolt width={13} height={13} />
          {slide.kicker}
        </span>
        <h1 className="mt-4 text-[clamp(2.2rem,6vw,3.7rem)] font-extrabold leading-[0.98]">
          {slide.title}
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          {slide.subtitle}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-12 items-center gap-2 rounded-[13px] px-6 text-[0.95rem] font-bold text-primary-ink transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "var(--ac)" }}
          >
            <IconBolt width={18} height={18} />
            {slide.cta}
          </button>
          <button className="inline-flex h-12 items-center rounded-[13px] border border-line bg-white/5 px-5 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-white/10">
            View odds
          </button>
        </div>
      </div>

      {/* pack art */}
      <div className="relative mx-auto hidden w-full max-w-[260px] md:block">
        <div
          className="absolute inset-x-6 bottom-2 top-6 -z-10 rounded-[20px] opacity-30 blur-2xl"
          style={{ background: "var(--ac)" }}
        />
        <CardArt
          rarity={slide.rarity}
          category={slide.category}
          label={slide.kicker}
          grade="SEALED"
          slab={false}
          className="aspect-[3/4] w-full rotate-3 transition-transform duration-500 hover:rotate-0"
        />
      </div>
    </div>
  );
}
