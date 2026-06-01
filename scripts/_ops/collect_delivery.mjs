#!/usr/bin/env node
/**
 * collect_delivery.mjs — Sammelt die 4 FINALEN Take-Videos eines Betriebs an EINEN
 * klar benannten Ort. Behebt das "Ablageorte katastrophal"-Problem: die Build-Scripts
 * schreiben historisch in 3 verschiedene Strukturen (screenflows/, _generated/previews/,
 * master_takes/). Dieser Collector lässt die internen Pfade unberührt und liefert
 * eine saubere Delivery-Sicht — die Quelle für Founder-Review + E-Mail-Versand.
 *
 * Quellen (Stand 01.06.2026):
 *   T1 → screenflows/<slug>/take1_complete.mp4
 *   T2 → _generated/previews/<slug>/take2_<variant>_FINAL_v102_<YYYYMMDD>.mp4 (neueste, ohne _preloom)
 *   T3 → master_takes/take3/<slug>_with_mouse.mp4
 *   T4 → master_takes/take4/<slug>_with_mouse.mp4
 *
 * Ziel: master_takes/_delivery/<slug>/{01_intro,02_anruf,03_wizard,04_bewertung}.mp4 + index.md
 *
 * Usage:
 *   node scripts/_ops/collect_delivery.mjs --slug leins-ag
 */
import { existsSync, mkdirSync, copyFileSync, statSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const argVal = (f) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null; };
const slug = argVal("--slug");
if (!slug) { console.error("usage: --slug <slug>"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";

// T2 variant-aware + date-aware: neueste FINAL_v102 (ohne _preloom).
function latestTake2(slug) {
  const dir = join(PIPE, "_generated", "previews", slug);
  if (!existsSync(dir)) return null;
  const cands = readdirSync(dir)
    .filter((f) => /^take2_.*_FINAL_v102_\d+\.mp4$/.test(f) && !f.includes("_preloom"))
    .map((f) => ({ f, m: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  return cands.length ? join(dir, cands[0].f) : null;
}

const SOURCES = [
  { take: "T1", label: "01_intro",      src: join(PIPE, "screenflows", slug, "take1_complete.mp4") },
  { take: "T2", label: "02_anruf",      src: latestTake2(slug) },
  { take: "T3", label: "03_wizard",     src: join(PIPE, "master_takes", "take3", `${slug}_with_mouse.mp4`) },
  { take: "T4", label: "04_bewertung",  src: join(PIPE, "master_takes", "take4", `${slug}_with_mouse.mp4`) },
];

const outDir = join(PIPE, "master_takes", "_delivery", slug);
mkdirSync(outDir, { recursive: true });

let indexMd = `# Delivery — ${slug}\n\nFinale Take-Videos für Founder-Review + E-Mail. Gesammelt via collect_delivery.mjs.\n\n| Take | Datei | Quelle | Stand |\n|------|------|--------|-------|\n`;
let missing = 0;
for (const s of SOURCES) {
  if (!s.src || !existsSync(s.src)) {
    console.log(`  ⚠ ${s.take}: Quelle fehlt (${s.src || "—"})`);
    indexMd += `| ${s.take} | — | ⚠️ FEHLT | — |\n`;
    missing++;
    continue;
  }
  const dst = join(outDir, `${s.label}.mp4`);
  copyFileSync(s.src, dst);
  const mt = statSync(s.src).mtime.toISOString().replace("T", " ").slice(0, 16);
  const mb = (statSync(s.src).size / 1024 / 1024).toFixed(1);
  console.log(`  ✓ ${s.take} → ${dst} (${mb} MB)`);
  indexMd += `| ${s.take} | ${s.label}.mp4 | \`${s.src.replace(/\\/g, "/")}\` | ${mt} (${mb} MB) |\n`;
}
writeFileSync(join(outDir, "index.md"), indexMd);

console.log(`\n${missing ? "⚠" : "✓"} Delivery → ${outDir}${missing ? ` (${missing} Take(s) fehlen)` : " (alle 4 Takes)"}`);
