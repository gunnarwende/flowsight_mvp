#!/usr/bin/env node
/**
 * swap_tenant_greeting.mjs — In-place Lisa-Greeting-Swap für Take 2.
 *
 * Founder-validiert (01.06.2026, stark-notruf 15s-Sample "sehr sehr stark"):
 * Das ausgelieferte T2-Audio = locked Master `_locked/audio/take2_<variant>.wav`.
 * Darin sitzt Lisas Greeting in einem FIXEN Slot [44.0s .. 51.0s] (7.0s): direkt
 * nach dem Connect/Beep, vor der ersten Anrufer-Line (@~51.4s).
 *
 * Dieser Swap ersetzt NUR dieses 7.0s-Segment durch den per-Tenant-Greeting
 * (auf exakt 7.0s gepaddet) → alles davor (Beep) + danach (Founder-Line + Rest
 * des Dialogs) bleibt byte-identisch → Face-Video + Screenflow zehntelsekunden-
 * synchron, egal wie lang der Firmenname (≤ Slot).
 *
 * Output: _generated/takes/<slug>/take2_<variant>.wav  (= per-Tenant-Audio-Master,
 * den build_from_phase_schedule bevorzugt vor dem locked Fallback).
 *
 * Usage:
 *   node scripts/_ops/audio/swap_tenant_greeting.mjs --slug <slug> --variant <notruf|preis>
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const PIPE = join(REPO_ROOT, "docs/gtm/pipeline/06_video_production");

const args = process.argv.slice(2);
const argVal = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const slug = argVal("--slug");
const variant = argVal("--variant");
if (!slug || !["notruf", "preis"].includes(variant)) {
  console.error("usage: --slug <slug> --variant <notruf|preis>");
  process.exit(1);
}

// Greeting-Slot ist VARIANT-SPEZIFISCH (per STT 01.06. verifiziert):
//   notruf: Lisa-Greeting ~44–50s, Anrufer-Line @~51.4s  → Slot [44.0, 51.0] (7.0s)
//   preis:  Lisa-Greeting ~40–46s, Anrufer-Line @~46.9s  → Slot [40.0, 46.5] (6.5s)
// Vorher FALSCH: [44,51] für beide → preis-Greeting (Leins) blieb stehen (Weinberger-Bug).
const SLOT = variant === "notruf" ? { start: 44.0, dur: 7.0 } : { start: 40.0, dur: 6.5 };
const G_START = SLOT.start;
const G_DUR = SLOT.dur;
const G_END = G_START + G_DUR;

function ff(argv, label) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: "inherit" });
  if (r.status !== 0) { console.error(`✗ ${label} failed`); process.exit(1); }
}
function probeDur(p) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", p]);
  return parseFloat((r.stdout || "").toString().trim()) || 0;
}

const base = join(PIPE, "_locked", "audio", `take2_${variant}.wav`);
if (!existsSync(base)) { console.error(`✗ no locked master: ${base}`); process.exit(2); }

// Greeting (generate-if-missing): per-Tenant TTS aus tenant.name (Ela-Stimme).
let greeting = join(PIPE, "_generated", "lisa_tts", "tenants", slug, "agent_01.wav");
if (!existsSync(greeting)) {
  console.log(`  greeting fehlt → generate_lisa_tts --tenant ${slug}`);
  const g = spawnSync("node", ["scripts/_ops/audio/generate_lisa_tts.mjs", "--tenant", slug],
    { cwd: REPO_ROOT, stdio: "inherit" });
  if (g.status !== 0 || !existsSync(greeting)) { console.error("✗ greeting generation failed"); process.exit(1); }
}

const grDur = probeDur(greeting);
console.log(`swap_tenant_greeting: ${slug}/${variant}`);
console.log(`  base   : ${base} (${probeDur(base).toFixed(2)}s)`);
console.log(`  greeting: ${greeting} (${grDur.toFixed(2)}s) → Slot ${G_START}–${G_END}s (${G_DUR}s)`);
if (grDur > G_DUR + 0.08) {
  console.warn(`  ⚠ GREETING ZU LANG (${grDur.toFixed(2)}s > ${G_DUR}s): Firmenname sprengt Slot → würde Sync brechen. Kürzeren Namen in voice_agent.company_name verwenden.`);
  process.exit(3);
}

const outDir = join(PIPE, "_generated", "takes", slug);
mkdirSync(outDir, { recursive: true });
const tmpGr = join(outDir, `_greeting_slot_${variant}.wav`);
const out = join(outDir, `take2_${variant}.wav`);

// 1) Greeting auf exakt G_DUR padden (trailing silence)
ff(["-i", greeting, "-af", `apad=whole_dur=${G_DUR}`, "-t", String(G_DUR), "-c:a", "pcm_s16le", tmpGr], "pad-greeting");

// 2) base[0:G_START] + padded_greeting + base[G_END:end]  → out (Rest byte-genau erhalten)
ff([
  "-i", base, "-i", tmpGr,
  "-filter_complex",
  `[0:a]asplit=2[b0][b1];` +
  `[b0]atrim=0:${G_START},asetpts=N/SR/TB,aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo[pre];` +
  `[1:a]aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo[grt];` +
  `[b1]atrim=${G_END},asetpts=N/SR/TB,aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo[post];` +
  `[pre][grt][post]concat=n=3:v=0:a=1[out]`,
  "-map", "[out]", "-c:a", "pcm_s16le", out,
], "splice");

// 3) Sync-Proof: out-Dauer MUSS base-Dauer matchen (sonst Face/Screenflow-Drift)
const baseDur = probeDur(base);
const outDur = probeDur(out);
const drift = Math.abs(outDur - baseDur);
console.log(`  out    : ${out} (${outDur.toFixed(3)}s)`);
console.log(`  SYNC   : base ${baseDur.toFixed(3)}s vs out ${outDur.toFixed(3)}s → drift ${(drift * 1000).toFixed(0)}ms`);
if (drift > 0.05) { console.error(`✗ SYNC-DRIFT ${(drift * 1000).toFixed(0)}ms > 50ms — abgebrochen, nicht ausliefern!`); process.exit(4); }
console.log(`  ✓ greeting swapped, sync erhalten (${slug}/${variant})`);
