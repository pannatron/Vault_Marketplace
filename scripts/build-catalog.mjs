#!/usr/bin/env node
/**
 * Pull the full Disney Lorcana catalogue from tcgpricelookup.com (real card
 * images + raw TCGplayer prices) into app/data/lorcana-cards.json.
 *
 * Free tier = raw prices only (graded needs Trader plan). Rate limit ~100/day,
 * so this runs as a batch job (≈58 calls) rather than per request.
 *
 *   node scripts/build-catalog.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// read key from .env.local
function readKey() {
  if (process.env.TCGPL_API_KEY) return process.env.TCGPL_API_KEY;
  try {
    const env = readFileSync(join(ROOT, ".env.local"), "utf8");
    const m = env.match(/^TCGPL_API_KEY=(.+)$/m);
    return m?.[1]?.trim();
  } catch {
    return undefined;
  }
}
const KEY = readKey();
if (!KEY) {
  console.error("Missing TCGPL_API_KEY (.env.local)");
  process.exit(1);
}

const API = "https://api.tcgpricelookup.com/v1";
const headers = { "X-API-Key": KEY };

// tcgpricelookup set name → Lorcana set code (for detail-route slugs)
const SET_CODE = {
  "The First Chapter": "1",
  "Rise of the Floodborn": "2",
  "Into the Inklands": "3",
  "Ursula's Return": "4",
  "Shimmering Skies": "5",
  "Azurite Sea": "6",
  "Archazia's Island": "7",
  "Reign of Jafar": "8",
  Fabled: "9",
  "Whispers in the Well": "10",
  Winterspell: "11",
  "Wilds Unknown": "12",
};

const nmMarket = (c) =>
  c.prices?.raw?.near_mint?.tcgplayer?.market ??
  c.prices?.raw?.lightly_played?.tcgplayer?.market ??
  null;

const isFoil = (v) => /foil/i.test(v ?? "");

async function page(offset) {
  const res = await fetch(
    `${API}/cards/search?q=&game=lorcana&limit=100&offset=${offset}`,
    { headers }
  );
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error(`search ${res.status}`);
  return res.json();
}

const first = await page(0);
const total = first.total ?? first.data.length;
console.log(`[catalog] total ${total} cards — paging…`);

const rows = [...first.data];
for (let off = 100; off < total; off += 100) {
  try {
    const j = await page(off);
    rows.push(...(j.data ?? []));
    process.stdout.write(`  offset ${off} (+${j.data?.length ?? 0})\r`);
  } catch (e) {
    console.error(`\n[catalog] stop at offset ${off}: ${e.message}`);
    break;
  }
}
console.log(`\n[catalog] fetched ${rows.length} rows`);

// reduce → one card per (set, number); keep Normal as base, capture foil price
const byCard = new Map();
for (const c of rows) {
  const num = (c.number ?? "").split("/")[0];
  if (!num) continue; // skip inserts / non-numbered
  if (/puzzle insert|\(set of/i.test(c.name)) continue;
  const market = nmMarket(c);
  if (!market || market <= 0) continue;

  const key = `${c.set?.name}|${num}`;
  let rec = byCard.get(key);
  if (!rec) {
    rec = {
      id: c.id,
      name: c.name,
      number: num,
      rarity: c.rarity,
      setName: c.set?.name,
      setCode: SET_CODE[c.set?.name] ?? null,
      tcgplayerId: c.tcgplayer_id,
      image: c.image_url,
      price: null,
      priceFoil: null,
    };
    byCard.set(key, rec);
  }
  if (isFoil(c.variant)) {
    rec.priceFoil = Math.max(rec.priceFoil ?? 0, market) || market;
  } else {
    rec.price = market;
    rec.image = c.image_url; // prefer the normal art
    rec.tcgplayerId = c.tcgplayer_id;
  }
}

// build final list; if a card only had a foil variant, use foil as price
const cards = [];
for (const rec of byCard.values()) {
  const price = rec.price ?? rec.priceFoil;
  if (!price) continue;
  cards.push({
    id: rec.id,
    name: rec.name,
    number: rec.number,
    rarity: rec.rarity,
    set: rec.setName,
    slug: rec.setCode ? `${rec.setCode}-${rec.number}` : null,
    tcgplayerId: rec.tcgplayerId,
    image: rec.image,
    price: Math.round(price * 100) / 100,
    priceFoil:
      rec.priceFoil && rec.priceFoil !== rec.price
        ? Math.round(rec.priceFoil * 100) / 100
        : null,
  });
}
cards.sort((a, b) => b.price - a.price);

const dataDir = join(ROOT, "app", "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
writeFileSync(
  join(dataDir, "lorcana-cards.json"),
  JSON.stringify({
    generatedAt: Date.now(),
    source: "tcgpricelookup.com (TCGplayer raw market)",
    count: cards.length,
    cards,
  })
);
console.log(`[catalog] wrote ${cards.length} cards → app/data/lorcana-cards.json`);
