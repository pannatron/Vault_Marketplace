#!/usr/bin/env node
/**
 * Build app/data/promo-events.json — maps each promo card (by Lorcast slug,
 * `${promoGrouping}-${number}`) to the real event / set-campaign it belongs to.
 *
 * Lorcast lumps every promo into "Promo Set 1/2/3"; it has no distribution
 * field. lorcanajson.org does carry per-card `setCode` (the base set a promo
 * released alongside) plus `foilTypes` + tournament-legal dates, which lets us
 * recover a genuine, named grouping — and pull out the Disney100 launch set
 * (its distinctive cold "Lava" foil, legal 2023-09-08).
 *
 * Re-run when new promo sets drop: `node scripts/build-promo-events.mjs`
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const SRC = "https://lorcanajson.org/files/current/en/allCards.json";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../app/data/promo-events.json");

const SET_NAME = {
  "1": "The First Chapter",
  "2": "Rise of the Floodborn",
  "3": "Into the Inklands",
  "4": "Ursula's Return",
  "5": "Shimmering Skies",
  "6": "Azurite Sea",
  "7": "Archazia's Island",
  "8": "Reign of Jafar",
  "9": "Fabled",
  "10": "Whispers in the Well",
  "11": "Winterspell",
  "12": "Wilds Unknown",
  "13": "Attack of the Vine!",
};

function eventOf(c) {
  const foils = c.foilTypes || [];
  // Disney100 = the P1 cold-foil launch promos (legal from 2023-09-08)
  if (
    c.promoGrouping === "P1" &&
    foils.includes("Lava") &&
    c.allowedInTournamentsFromDate === "2023-09-08"
  ) {
    return "Disney100";
  }
  return SET_NAME[String(c.setCode)] ?? "Other promos";
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
