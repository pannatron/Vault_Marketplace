#!/usr/bin/env node
/**
 * Build REAL Lorcana price history from TCGCSV daily archives (free).
 *
 *   https://tcgcsv.com/archive/tcgplayer/prices-YYYY-MM-DD.ppmd.7z
 *
 * Each archive is a 7z (PPMd) bundle of every TCGplayer category's prices for
 * that day. macOS `tar` (libarchive) reads it natively — no 7z install needed.
 * We extract only category 71 (Lorcana TCG), keyed by TCGplayer productId,
 * which equals Lorcast's `tcgplayer_id` — so the app maps cards → history
 * directly.
 *
 * Output: app/data/price-history.json
 *   { generatedAt, dates:[...], points: { [productId]: { n:[[t,price]], f:[[t,price]] } } }
 *
 * Usage:
 *   node scripts/build-price-history.mjs            # full rebuild (~1y sample)
 *   node scripts/build-price-history.mjs --daily 90 # last 90 days, daily
 *   node scripts/build-price-history.mjs --step 7 --days 365
 *   node scripts/build-price-history.mjs --append    # daily cron: add new days only
 */

import { execSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CAT = "71"; // Lorcana TCG
const ARCHIVE = (d) => `https://tcgcsv.com/archive/tcgplayer/prices-${d}.ppmd.7z`;
const DAY = 86_400_000;

// ---- args ----
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const append = args.includes("--append");
const dailyN = Number(opt("daily", 10)); // most-recent N days at daily resolution
const step = Number(opt("step", 12)); // older cadence (days between samples)
const totalDays = Number(opt("days", 365)); // how far back

// latest available archive is "yesterday" UTC-ish; back off 1 day to be safe
const end = Math.floor((Date.now() - DAY) / DAY) * DAY;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

// --- resolve output path + load existing (for append/merge) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "app", "data");
const outFile = join(dataDir, "price-history.json");

let existing = null;
if (existsSync(outFile)) {
  try {
    existing = JSON.parse(readFileSync(outFile, "utf8"));
  } catch {
    existing = null;
  }
}

const dates = new Set();
if (append) {
  // only fetch days newer than what we already have (default: last 14 days)
  const have = new Set(existing?.dates ?? []);
  for (let i = 0; i < 14; i++) {
    const d = iso(end - i * DAY);
    if (!have.has(d)) dates.add(d);
  }
  if (dates.size === 0) {
    console.log("[history] already up to date — nothing to append");
    process.exit(0);
  }
} else {
  for (let i = 0; i < dailyN; i++) dates.add(iso(end - i * DAY)); // recent daily
  for (let i = dailyN; i <= totalDays; i += step) dates.add(iso(end - i * DAY)); // sparse older
}
const dateList = [...dates].sort(); // ascending

console.log(`[history] ${dateList.length} snapshot dates (${dateList[0]} → ${dateList[dateList.length - 1]})`);

const work = mkdtempSync(join(tmpdir(), "cm-hist-"));
// points[pid] = { n: Map<ms,price>, f: Map<ms,price> }
const points = new Map();

// seed from existing data so append merges instead of replacing
if (existing?.points) {
  for (const [pid, rec] of Object.entries(existing.points)) {
    const n = new Map((rec.n ?? []).map(([t, p]) => [t, p]));
    const f = new Map((rec.f ?? []).map(([t, p]) => [t, p]));
    points.set(pid, { n, f });
  }
}

let ok = 0;
for (const date of dateList) {
  const file = join(work, `${date}.7z`);
  try {
    execSync(
      `curl -sS --max-time 45 -o "${file}" "${ARCHIVE(date)}"`,
      { stdio: ["ignore", "ignore", "ignore"] }
    );
    const out = join(work, date);
    mkdirSync(out, { recursive: true });
    // extract only Lorcana price files
    execSync(`tar -xf "${file}" -C "${out}" --include='*/${CAT}/*/prices'`, {
      stdio: ["ignore", "ignore", "ignore"],
    });

    const t = Date.parse(date + "T00:00:00Z");
    let rows = 0;
    for (const priceFile of walkPrices(out)) {
      const json = JSON.parse(readFileSync(priceFile, "utf8"));
      for (const r of json.results ?? []) {
        const mp = r.marketPrice;
        if (mp == null || mp <= 0) continue;
        const pid = String(r.productId);
        const variant = /foil/i.test(r.subTypeName ?? "") ? "f" : "n";
        let rec = points.get(pid);
        if (!rec) points.set(pid, (rec = { n: new Map(), f: new Map() }));
        // keep the cheaper "Normal"/first; for foil keep first foil seen
        if (!rec[variant].has(t)) rec[variant].set(t, Math.round(mp * 100) / 100);
        rows++;
      }
    }
    ok++;
    process.stdout.write(`  ✓ ${date} (${rows} rows)\n`);
  } catch (e) {
    process.stdout.write(`  ✗ ${date} skipped (${e.message.split("\n")[0]})\n`);
  } finally {
    rmSync(join(work, date), { recursive: true, force: true });
    rmSync(file, { force: true });
  }
}

// serialize → compact [t,price] pairs, sorted ascending
const outPoints = {};
let kept = 0;
for (const [pid, rec] of points) {
  const n = [...rec.n.entries()].sort((a, b) => a[0] - b[0]);
  const f = [...rec.f.entries()].sort((a, b) => a[0] - b[0]);
  if (n.length < 2 && f.length < 2) continue; // need a line
  outPoints[pid] = {};
  if (n.length) outPoints[pid].n = n;
  if (f.length) outPoints[pid].f = f;
  kept++;
}

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
const allDates = [...new Set([...(existing?.dates ?? []), ...dateList])].sort();
writeFileSync(
  outFile,
  JSON.stringify({
    generatedAt: Date.now(),
    source: "tcgcsv.com (TCGplayer market price)",
    dates: allDates,
    daysCovered: totalDays,
    points: outPoints,
  })
);

rmSync(work, { recursive: true, force: true });
console.log(`[history] ${ok}/${dateList.length} days fetched · ${kept} products with history`);
console.log(`[history] wrote ${outFile}`);

// --- helpers ---
function walkPrices(dir) {
  const found = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name === "prices") found.push(p);
    }
  }
  return found;
}
