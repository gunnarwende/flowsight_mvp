#!/usr/bin/env node
/**
 * build_take4_final.mjs — V2j-style Single-Command T4 Pipeline.
 *
 * Architektur (analog T3 V2j):
 *   1. record_take4 (6 parts)
 *   2. compose_take4_final → take4_complete.mp4 (no loom)
 *   3. Swap: take4_with_loom ← take4_complete (no-loom build input)
 *   4. build_from_phase_schedule → take4_anchor.mp4 (177s with sliced phases)
 *   5. Restore take4_with_loom
 *   6. Mux locked universal audio
 *   7. apply_loom_take4_grow → master_takes/take4/<slug>.mp4
 *   8. Mouse layer (universal Dörfler JSON)
 *   9. QG (existing qg_t4_compare)
 *
 * Usage:
 *   node scripts/_ops/build_take4_final.mjs --slug <slug> [--skip-record] [--skip-qg]
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

const args = process.argv.slice(2);
const argVal = (f, def) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : def; };
const hasFlag = (f) => args.includes(f);

const slug = argVal("--slug");
if (!slug) { console.error("usage: --slug <slug> [--skip-record] [--skip-qg]"); process.exit(1); }
const skipRecord = hasFlag("--skip-record");
const skipQg = hasFlag("--skip-qg");
// 31.05. PM: Default = skip mouse-layer (4 min savings per iteration).
// Only render mouse when explicitly requested (--with-mouse) — i.e., at FINAL approval.
const withMouse = hasFlag("--with-mouse");

const PIPE = "docs/gtm/pipeline/06_video_production";
const sfDir = join(PIPE, "screenflows", slug);
const previewDir = join(PIPE, "_generated", "previews", slug);
const masterDir = join(PIPE, "master_takes", "take4");
mkdirSync(previewDir, { recursive: true });
mkdirSync(masterDir, { recursive: true });

const LOCKED_AUDIO = join(PIPE, "_locked", "audio", "take4.m4a");

// 31.05. PM: Auto-backup vor jedem Build — Founder verlor R21-Master als R22 überschrieb.
// Backup-Pfad: master_takes/take4/_backups/<slug>_YYYYMMDD_HHMMSS.mp4
const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);  // YYYYMMDD_HHMMSS
const backupDir = join(masterDir, "_backups");
mkdirSync(backupDir, { recursive: true });
const existingMaster = join(masterDir, `${slug}.mp4`);
const existingMouse = join(masterDir, `${slug}_with_mouse.mp4`);
if (existsSync(existingMaster)) {
  const stat = statSync(existingMaster);
  copyFileSync(existingMaster, join(backupDir, `${slug}_${ts}_no-mouse.mp4`));
  console.log(`  💾 Backup pre-build: ${slug}_${ts}_no-mouse.mp4 (${(stat.size/1024/1024).toFixed(1)} MB)`);
}
if (existsSync(existingMouse)) {
  copyFileSync(existingMouse, join(backupDir, `${slug}_${ts}_with-mouse.mp4`));
  console.log(`  💾 Backup pre-build: ${slug}_${ts}_with-mouse.mp4`);
}

function logStep(n, title) {
  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║ STEP ${n}: ${title.padEnd(43)} ║`);
  console.log(`╚════════════════════════════════════════════════════╝`);
}
// Pass env required by T4 (Workday/Demo flags)
const T4_ENV = {
  ...process.env,
  SKIP_WORKDAY_GATE: process.env.SKIP_WORKDAY_GATE || "1",
  DEMO_NO_DISPATCH: process.env.DEMO_NO_DISPATCH || "1",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
};
function run(cmd, argv) {
  console.log(`  $ ${cmd} ${argv.join(" ")}`);
  const r = spawnSync(cmd, argv, { stdio: "inherit", env: T4_ENV });
  if (r.status !== 0) { console.error(`✗ failed: ${cmd}`); process.exit(r.status || 1); }
}

const startTime = Date.now();
console.log(`\n╔════════════════════════════════════════════════════╗`);
console.log(`║  build_take4_final.mjs — ${slug.padEnd(26)} ║`);
console.log(`║  V2j-style Phase-Schedule Architecture            ║`);
console.log(`╚════════════════════════════════════════════════════╝`);

// ── STEP 1-2: Record + Compose (via existing rebuild_tenant_take4 with skip-loom-step) ──
// Reuse the proven recording flow but stop AT compose, not at loom.
// Simpler: just run record_take4 + compose_take4_final directly.
if (!skipRecord) {
  logStep(1, "Insert lifecycle case + Record 6 parts");
  run("node", ["--env-file=src/web/.env.local", "scripts/_ops/insert_take3_wizard_case.mjs", `--slug=${slug}`]);
  run("node", ["--env-file=src/web/.env.local", "scripts/_ops/insert_take4_lifecycle.mjs", `--slug=${slug}`]);
  run("node", ["--env-file=src/web/.env.local", "scripts/_ops/record_take4.mjs", `--slug=${slug}`]);

  logStep(2, "Compose V4 phone-overlay + spec-aligned segments → take4_complete.mp4");
  // V4 (30.05.): Phone-PiP wird als Overlay über Leitsystem-Hintergrund composited (spec-conform).
  // V3 stretched Phone fullscreen → fixed in v4.
  if (existsSync(join(sfDir, "take4_event_log.json"))) {
    run("node", ["scripts/_ops/compose_take4_v4_phone_overlay.mjs", "--slug", slug]);
  } else {
    console.log("  ⚠ no event log → fallback to compose_take4_final");
    run("node", ["scripts/_ops/compose_take4_final.mjs", `--slug=${slug}`]);
  }
} else {
  console.log("\n  --skip-record: reusing existing take4_complete.mp4");
  if (!existsSync(join(sfDir, "take4_complete.mp4"))) {
    console.error(`✗ missing: ${join(sfDir, "take4_complete.mp4")}`);
    process.exit(2);
  }
}

// ── STEP 3 (V3): Skip phase_schedule — recording IS schedule-conform.
// take4_complete.mp4 (compose_v3 output) is directly the schedule-aligned video.
// Just copy it to anchor path as input for next steps.
logStep(3, "V3: Use take4_complete directly as anchor (no phase_schedule)");
const tComplete = join(sfDir, "take4_complete.mp4");
if (!existsSync(tComplete)) { console.error(`✗ missing: ${tComplete}`); process.exit(2); }
const anchorPath = join(previewDir, "take4_anchor.mp4");
copyFileSync(tComplete, anchorPath);
console.log(`  ✓ anchor: ${anchorPath}`);

// ── STEP 5: Mux locked universal audio ──
logStep(5, "Mux locked universal audio (1ms-genau)");
const anchorWithAudio = join(previewDir, "take4_anchor_with_audio.mp4");
run("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", anchorPath,
  "-i", LOCKED_AUDIO,
  "-map", "0:v", "-map", "1:a",
  "-c:v", "copy", "-c:a", "copy", "-shortest",
  anchorWithAudio,
]);
copyFileSync(anchorWithAudio, anchorPath);
console.log(`  ✓ audio muxed`);

// ── STEP 6: apply_loom_take4_grow (overwrites anchor in-place) ──
logStep(6, "apply_loom_take4_grow (hflip + big loom + iris)");
run("node", ["scripts/_ops/apply_loom_take4_grow.mjs", `--slug=${slug}`]);
// V3-fix: apply_loom renames its output → take4_anchor.mp4 (overwrite).
// Mouse layer reads from master_takes/take4/<slug>.mp4 → copy anchor there.
const masterPath = join(masterDir, `${slug}.mp4`);
copyFileSync(anchorPath, masterPath);
console.log(`  ✓ anchor → master: ${masterPath}`);

// ── STEP 7: Mouse layer (universal Dörfler take4.json) ──
// 31.05. PM: Default-skip during iteration (4 min savings). Re-enable with --with-mouse
// for final delivery. apply_toast_overlay reads _with_mouse.mp4 — create from _with_loom.
if (withMouse) {
  logStep(7, "Mouse layer (universal Dörfler JSON)");
  const doerflerJson = join(REPO_ROOT, PIPE, "_generated", "mouse_recordings", "doerfler-ag", "take4.json");
  const tenantJsonDir = join(REPO_ROOT, PIPE, "_generated", "mouse_recordings", slug);
  mkdirSync(tenantJsonDir, { recursive: true });
  copyFileSync(doerflerJson, join(tenantJsonDir, "take4.json"));
  run("node", ["scripts/_ops/mouse_layer/render.mjs", "--slug", slug, "--take", "4"]);
} else {
  logStep(7, "Mouse layer SKIPPED (use --with-mouse for final delivery)");
  // Copy master to _with_mouse output so downstream steps work
  const masterSrc = join(masterDir, `${slug}.mp4`);
  const mouseDst = join(masterDir, `${slug}_with_mouse.mp4`);
  copyFileSync(masterSrc, mouseDst);
  console.log(`  ✓ stub _with_mouse.mp4 = copy of master (no mouse layer)`);
}

// ── STEP 9+10: Toast + Dev-Badge-Cover (NUR final delivery, NACH Mouse) ──
// 01.06.2026: Diese beiden waren früher manuelle Nachsätze → der Mouse-Layer
// (Step 7) lief danach und überschrieb sie → Founder sah fehlenden Toast +
// sichtbaren "3 Issues"-Badge im finalen Build. Jetzt fest verkettet, in
// korrekter Reihenfolge: Mouse → Toast → Badge-Cover (allerletzter Schritt).
if (withMouse) {
  logStep(9, 'Toast "Bewertung erhalten" (FB29 — Review-Notification)');
  run("node", ["scripts/_ops/apply_toast_overlay.mjs", "--slug", slug]);

  logStep(10, 'Dev-Badge "3 Issues" cover (ALLERLETZTER Schritt)');
  run("node", ["scripts/_ops/apply_devbadge_cover.mjs", "--slug", slug]);

  // STEP 11: Deterministischer Stern/Maus-Sync — farb-neutrale Stern-Innenregion der
  // Gold-Referenz (Stark) im fixen Fill-Fenster über den Master legen. Macht den Stern-
  // Slot millisekunde-gleich für ALLE Betriebe (Maus trifft immer), Header/Brand/Fall
  // bleiben per-Tenant. Löst den recordVideo-Jitter deterministisch + skalierbar.
  logStep(11, "Canonical Stern/Maus-Sync (farb-neutrale Stark-Region im Fill-Fenster)");
  run("node", ["scripts/_ops/apply_canonical_stars.mjs", "--slug", slug]);
}

// ── STEP 8: QG ──
if (!skipQg) {
  logStep(8, "QG vs Schablone");
  const qgResult = spawnSync("node", ["scripts/_ops/qg_t4_compare.mjs", `--target=${slug}`],
    { stdio: "inherit" });
  if (qgResult.status !== 0) console.log("\n  ⚠ QG had findings — review above");
}

const finalOut = join(masterDir, `${slug}_with_mouse.mp4`);
const sizeKb = existsSync(finalOut) ? Math.round(statSync(finalOut).size / 1024) : 0;
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

console.log(`\n╔════════════════════════════════════════════════════╗`);
console.log(`║  ✓ build_take4_final COMPLETE                     ║`);
console.log(`╚════════════════════════════════════════════════════╝`);
console.log(`  output  : ${finalOut} (${sizeKb} KB)`);
console.log(`  elapsed : ${elapsed}s`);
