# Design

## Theme
Dark, committed neon-on-ink. A deep cool-ink gallery surround lets card foil and a teal-cyan primary glow like a lit artifact. The "thrill of the rip" is carried by the brand colors, rarity glows, and an expressive display face — never by busy surfaces. One drenched moment (the hero) against otherwise restrained, product-grade panels.

## Color (OKLCH)
| Role | Value | Use |
|---|---|---|
| `bg` | `oklch(0.17 0.015 255)` | App body — deep cool ink |
| `surface` | `oklch(0.215 0.016 255)` | Cards, panels |
| `surface-2` | `oklch(0.255 0.018 255)` | Raised / hover |
| `rail` | `oklch(0.15 0.014 258)` | Sidebar, header, footer (cooler neutral layer) |
| `line` | `oklch(0.32 0.02 258)` | Borders, dividers |
| `ink` | `oklch(0.97 0.005 250)` | Primary text |
| `muted` | `oklch(0.745 0.012 258)` | Secondary text (≥4.5:1 on bg) |
| `faint` | `oklch(0.6 0.012 258)` | Tertiary / captions |
| `primary` | `oklch(0.74 0.14 195)` | Teal-cyan — primary actions, selection, links |
| `primary-ink` | `oklch(0.17 0.03 200)` | Text on primary fills (dark) |
| `accent` | `oklch(0.7 0.2 350)` | Holo-magenta — the "hit" / chase / live pulse |
| `gold` | `oklch(0.82 0.13 85)` | Legendary / platinum tiers |
| `success` | `oklch(0.8 0.17 155)` | Discount %, gains |

**Rarity ramp** (card art + glow + tier label): common `steel 0.62 0.02 258`, uncommon `teal 0.74 0.14 195`, rare `blue 0.66 0.16 250`, epic `violet 0.62 0.2 300`, legendary `gold 0.82 0.13 85`, holo `iridescent cyan→magenta sweep`.

Strategy: **Committed/Drenched at the hero, Restrained everywhere else.** Accent reserved for live/chase signals and one primary CTA per view.

## Typography
- **Display** — Bricolage Grotesque (variable). Logo, hero h1, section h2. Expressive, slightly quirky — carries the "mania". Letter-spacing -0.02 to -0.03em on large sizes; `text-wrap: balance`.
- **UI/Body** — Inter (variable). All labels, buttons, card titles, prose. Fixed rem scale, ratio ~1.2.
- **Data** — JetBrains Mono. Prices, FMV, %, IDs, relative pull times, ticker — monospaced so columns of numbers align and read as "collector data".
- Contrast axis: expressive grotesque display vs neutral grotesque sans vs mono — three distinct jobs, never two similar sans.

## Components
- **Pack card**: thumbnail + name + price (mono) + qty stepper + Buy. States: default/hover(lift+border glow)/focus/active/disabled/sold-out.
- **Pull card** (Just Pulled): holo card art with rarity glow, card name, pack source, relative time (mono, ticks live), rarity tier label.
- **Deal card**: card art, % off badge (success), price + FMV strikethrough (mono).
- **CardArt**: CSS-generated holographic placeholder keyed by rarity — layered conic/linear foil + shimmer sweep on rare+. No remote images.
- **ScrollRow**: horizontal scroll-snap with left/right arrow controls; consistent across Just Pulled, Grab a Pack, Best Deals.
- Buttons: primary (teal fill, dark ink), secondary (line border ghost), tertiary (text). Radius `--radius-md: 12px`.

## Layout
- App shell: fixed left rail (240px, ≥lg) + content column. Sticky header inside content. Mobile: rail → slide-in drawer via hamburger.
- Section rhythm varies (hero full-bleed → tight feed → roomy grids). Content max-width ~1280px.
- Responsive via structure (rail collapse, scroll rows, `auto-fill minmax` pack grid), not fluid type.

## Motion
- Hero carousel: 350ms ease-out-expo slide, 6s autoplay, pause on hover/focus, dot + arrow control.
- Foil shimmer: slow looping sweep on rare+ card art (mask/linear-gradient), GPU transform only.
- Live feed: new pull slides in at front (250ms), LIVE dot pulses, relative times tick each 10s.
- Hover lifts: 150ms transform + border/glow. All transitions 150–350ms ease-out.
- `prefers-reduced-motion`: carousel crossfades, shimmer freezes mid-sweep, live insert is instant, hover lifts removed.
