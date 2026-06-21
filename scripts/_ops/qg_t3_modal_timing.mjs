#!/usr/bin/env node
/**
 * qg_t3_modal_timing.mjs — T3-Gate G_T3_MODAL_NOT_EARLY (event-basiert, 09.06.).
 *
 * Die "+ Neuer Fall"-Modal darf NICHT öffnen, bevor die universelle Maus den Button
 * erreicht hat. Die Maus (Dörfler take3.json) klickt @~128,17s → die Modal-Öffnung MUSS
 * dort liegen.
 *
 * ALT (verworfen): Helligkeit (YAVG) an FIXER Zeit 126s. Das war ein Proxy, kalibriert auf
 * Dörfler — bei leicht verschobenem Timing (Walter: Modal @126,6s, knapp NEBEN dem Mess-Punkt)
 * gab es falsch „PASS". Und es prüfte die Maus-Relation gar nicht.
 *
 * NEU: den ECHTEN Modal-Öffnungs-Frame per Scene-Change detektieren und gegen die SOLL-Zeit
 * (= Maus-Klick, 128,17s) prüfen. Zu früh ODER zu spät = Cursor/Modal-Desync = FAIL.
 * (Der Build pinnt das jetzt via anchor_t4_reveal.mjs deterministisch — dies ist die
 * unabhängige Bestätigung + Regressions-Schutz für ALLE Betriebe.)
 *
 * Usage: node scripts/_ops/qg_t3_modal_timing.mjs --video <pfad>   (oder --slug <slug>)
 */
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const arg = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const slug = arg("--slug");
let video = arg("--video");
if (!video && slug) {
  const ST = "docs/gtm/pipeline/07_stresstest";
  for (const base of [join(ST, "abgenommen", slug), join(ST, slug)]) {
    if (existsSync(join(base, "T3_wizard.mp4"))) { video = join(base, "T3_wizard.mp4"); break; }
  }
  if (!video) video = `docs/gtm/pipeline/06_video_production/master_takes/take3/${slug}_with_mouse.mp4`;
}
if (!video || !existsSync(video)) { console.error(`✗ video nicht gefunden: ${video}`); process.exit(2); }

const SOLL = 128.17;     // Maus-Klick-Zeit (Dörfler-Gold, wo Modal+Cursor synchron sind)
const TOL = 0.3;         // ±0,3s
const WIN_FROM = 124.0, WIN_TO = 131.0;

const run = (cmd) => { try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return (e.stdout || "") + (e.stderr || ""); } };

// Stärkster Scene-Change im Fenster = die Modal-Öffnung. Metadaten → relatives Tempfile
// (kein Laufwerks-Doppelpunkt → bricht die ffmpeg file=-Option nicht).
const meta = `_t3modal_${process.pid}.txt`;
run(`ffmpeg -hide_banner -ss ${WIN_FROM} -to ${WIN_TO} -i "${video}" -vf "select='gte(scene,0.05)',metadata=print:file=${meta}" -an -f null -`);
let modalT = null, score = null;
if (existsSync(meta)) {
  const txt = readFileSync(meta, "utf8");
  try { unlinkSync(meta); } catch {}
  const hits = [];
  const re = /pts_time:([0-9.]+)[\s\S]*?scene_score=([0-9.]+)/g;
  let m; while ((m = re.exec(txt))) hits.push({ t: WIN_FROM + parseFloat(m[1]), score: parseFloat(m[2]) });
  hits.sort((a, b) => b.score - a.score);
  if (hits.length) { modalT = hits[0].t; score = hits[0].score; }
}

console.log(`═══ QG T3 Modal-Timing (event-basiert): ${video} ═══`);
if (modalT == null) {
  console.log(`  ❌ G_T3_MODAL_NOT_EARLY — keine Modal-Öffnung in [${WIN_FROM},${WIN_TO}]s erkannt`);
  console.log("═══ ❌ FAIL ═══");
  process.exit(1);
}
const diff = modalT - SOLL;
const pass = Math.abs(diff) <= TOL;
console.log(`  ${pass ? "✅" : "❌"} G_T3_MODAL_NOT_EARLY  Modal @${modalT.toFixed(3)}s (score ${score.toFixed(3)}) · SOLL ${SOLL}s (Maus-Klick) · Δ${diff >= 0 ? "+" : ""}${diff.toFixed(3)}s (Toleranz ±${TOL}s)`);
console.log(pass ? "═══ ✅ PASS ═══" : `═══ ❌ FAIL — Modal ${diff < 0 ? "VOR" : "NACH"} dem Cursor (Anker/Recording prüfen) ═══`);
process.exit(pass ? 0 : 1);
