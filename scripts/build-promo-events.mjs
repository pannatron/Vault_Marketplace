#!/usr/bin/env node
/**
 * Build app/data/promo-events.json — maps each promo card (by Lorcast slug,
 * `${promoGrouping}-${number}`) to the real event / set-campaign it belongs to.
 *
 * Lorcast lumps every promo into "Promo Set 1/2/3"; it has no distribution
 * field. lorcanajson.org carries the real one: `promoSourceCategory` (Disney
 * 100, Disney Cruise, D23, Organized Play, ...) and a finer `promoSource`.
 * We key the map on the Lorcast slug and store the event category label.
 *
 * Re-run when new promo sets drop: `node scripts/build-promo-events.mjs`
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const SRC = "https://lorcanajson.org/files/current/en/allCards.json";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../app/data/promo-events.json");

/** lorcanajson promoSourceCategory -> display label used in the UI */
const CATEGORY_LABEL = {
  "Disney 100": "Disney100",
  "Disney Cruise": "Disney Cruise",
  D23: "D23 Expo",
  "Disney Parks & Stores": "Parks & Stores",
  "Organized Play": "Organized Play",
  Promo: "Promos",
  Challenge: "Challenge",
};

function eventOf(c) {
  return CATEGORY_LABEL[c.promoSourceCategory] ?? "Other promos";
}

const res = await fetch(SRC);
if (!res.ok) throw new Error(`lorcanajson ${res.status}`);
const { cards } = await res.json();

const map = {};
let n = 0;
for (const c of cards) {
  const pg = c.promoGrouping;
  if (pg !== "P1" && pg !== "P2" && pg !== "P3") continue;
  map[`${pg}-${c.number}`] = eventOf(c);
  n++;
}

await writeFile(OUT, JSON.stringify(map, null, 0) + "\n");
console.log(`wrote ${n} promo→event mappings to ${OUT}`);
