import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconHome = (p: P) => (
  <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>
);
export const IconPack = (p: P) => (
  <svg {...base} {...p}><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);
export const IconCoin = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.6-2.5 1.6-2.5.7-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.7 2.5-1.7" /></svg>
);
export const IconWatch = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="6.2" /><path d="M12 9.4v2.6l1.8 1.1" /><path d="M9 6.2 9.5 3h5l.5 3.2M9 17.8 9.5 21h5l.5-3.2" /></svg>
);
export const IconStore = (p: P) => (
  <svg {...base} {...p}><path d="M4 9h16l-1-5H5L4 9Z" /><path d="M5 9v10h14V9" /><path d="M9.5 19v-5h5v5" /></svg>
);
export const IconTrophy = (p: P) => (
  <svg {...base} {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4M9 21h6M10 17h4l.5 4h-5l.5-4Z" /></svg>
);
export const IconRaffle = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M3 12h6M15 12h6" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const IconMenu = (p: P) => (
  <svg {...base} {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconChevronL = (p: P) => (
  <svg {...base} {...p}><path d="m15 5-7 7 7 7" /></svg>
);
export const IconChevronR = (p: P) => (
  <svg {...base} {...p}><path d="m9 5 7 7-7 7" /></svg>
);
export const IconPlus = (p: P) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconMinus = (p: P) => (
  <svg {...base} {...p}><path d="M5 12h14" /></svg>
);
export const IconBolt = (p: P) => (
  <svg {...base} {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" /></svg>
);
export const IconArrowR = (p: P) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconShield = (p: P) => (
  <svg {...base} {...p}><path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" /><path d="m9.2 12 2 2 3.6-3.8" /></svg>
);
export const IconSpark = (p: P) => (
  <svg {...base} {...p}><path d="M12 3v4M12 17v4M5 12H1M23 12h-4M6.3 6.3 3.5 3.5M20.5 20.5l-2.8-2.8M17.7 6.3l2.8-2.8M3.5 20.5l2.8-2.8" /></svg>
);
