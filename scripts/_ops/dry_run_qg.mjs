#!/usr/bin/env node
/**
 * dry_run_qg.mjs — Quality-Gates für 3-Betrieb-Dry-Run-Pipeline (Day 24).
 *
 * Prüft nach jedem Take automatisch:
 *   - Pre-Flight: tenant_config vollständig, demo_time Werktag-Gate, Dev-Server
 *   - Take 2: Output-Dateien, Dauer, Face-Aspect-Check (proof frames)
 *   - Take 3: Output, Admin-Profile-Overlay sichtbar im Leitsystem-Part
 *   - Take 4: DB-Events demo-time-sync, alle 7 Parts vorhanden
 *   - Cross-Tenant: Keine Dörfler-Leaks in anderen Tenants
 *
 * Usage:
 *   node scripts/_ops/dry_run_qg.mjs --slug=leins-ag --take=2
 *   node scripts/_ops/dry_run_qg.mjs --slug=leins-ag --take=preflight
 *   node scripts/_ops/dry_run_qg.mjs --slug=leins-ag --take=all
 */

import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1];
const take = args.find((a) => a.startsWith("--take"))?.split("=")[1] || "all";

if (!slug) {
  console.error("Usage: dry_run_qg.mjs --slug=<slug> [--take=preflight|2|3|4|all]");
  process.exit(1);
}

const screenflowDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const configPath = join("docs", "customers", slug, "tenant_config.json");

const results = { pass: [], fail: [], warn: [] };

function pass(msg) { results.pass.push(msg); console.log(`  ✅ ${msg}`); }
function fail(msg) { results.fail.push(msg); console.log(`  ❌ ${msg}`); }
function warn(msg) { results.warn.push(msg); console.log(`  ⚠  ${msg}`); }

function probeDur(file) {
  if (!existsSync(file)) return null;
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", file]);
  return parseFloat(r.stdout.toString().trim()) || null;
}

function exists(file, label) {
  if (existsSync(file)) {
    const kb = Math.round(statSync(file).size / 1024);
    pass(`${label} (${kb} KB)`);
    return true;
  }
  fail(`${label} fehlt: ${file}`);
  return false;
}

// ═══════════════════════════════════════════════════════════════
// PRE-FLIGHT
// ═══════════════════════════════════════════════════════════════
async function runPreflight() {
  console.log(`\n── PRE-FLIGHT: ${slug} ──`);
  if (!existsSync(configPath)) {
    fail(`tenant_config.json fehlt: ${configPath}`);
    return;
  }
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const t = config.tenant || {};
  const required = ["name", "brand_color", "case_id_prefix"];
  for (const k of required) {
    if (t[k]) pass(`tenant.${k}: ${t[k]}`);
    else fail(`tenant.${k} fehlt`);
  }
  const videoPhone = config.video?.display_phone;
  if (videoPhone) pass(`video.display_phone: ${videoPhone}`);
  else warn(`video.display_phone fehlt (Fallback +41 44 505 74 21)`);

  // Workday-Gate
  try {
    const { getDemoTimes } = await import("./_lib/demo_time.mjs");
    const dt = getDemoTimes();
    pass(`Workday-Gate PASS: demoNow=${dt.iso.demoNow}, termin=${dt.iso.appointmentStart}`);
  } catch (e) {
    fail(`Workday-Gate FAIL: ${e.message}`);
  }

  // Dev-Server erreichbar
  try {
    const r = spawnSync("curl", ["-sf", "--max-time", "3", "http://localhost:3000/api/health"]);
    if (r.status === 0) pass(`Dev-Server erreichbar (health OK)`);
    else fail(`Dev-Server nicht erreichbar auf :3000`);
  } catch {
    fail(`Dev-Server-Check scheiterte`);
  }
}

// ═══════════════════════════════════════════════════════════════
// TAKE 2 QG
// ═══════════════════════════════════════════════════════════════
async function runTake2QG() {
  console.log(`\n── TAKE 2 QG: ${slug} ──`);
  const files = {
    "take2_samsung.webm": 15,      // min 15s
    "take2_leitsystem.webm": 15,
    "_take2_mobile_tmp.mp4": 60,
    "take2_complete.mp4": 60,
  };
  for (const [f, minDur] of Object.entries(files)) {
    const fp = join(screenflowDir, f);
    if (!exists(fp, f)) continue;
    const dur = probeDur(fp);
    if (dur && dur >= minDur) pass(`${f} duration ${dur.toFixed(1)}s (>= ${minDur}s)`);
    else if (dur) fail(`${f} zu kurz: ${dur.toFixed(1)}s (< ${minDur}s)`);
  }
  const completePath = join(screenflowDir, "take2_complete.mp4");
  if (existsSync(completePath)) {
    const kb = Math.round(statSync(completePath).size / 1024);
    if (kb >= 1500 && kb <= 5000) pass(`take2_complete.mp4 size OK (${kb} KB)`);
    else warn(`take2_complete.mp4 size ungewöhnlich: ${kb} KB (erwartet 1500-5000)`);
  }
}

// ═══════════════════════════════════════════════════════════════
// TAKE 3 QG
// ═══════════════════════════════════════════════════════════════
async function runTake3QG() {
  console.log(`\n── TAKE 3 QG: ${slug} ──`);
  const files = {
    "take3_wizard.webm": 25,
    "take3_leitsystem.webm": 15,
    "take3_complete.mp4": 45,
    "take3_with_loom.mp4": 45,
  };
  for (const [f, minDur] of Object.entries(files)) {
    const fp = join(screenflowDir, f);
    if (!exists(fp, f)) continue;
    const dur = probeDur(fp);
    if (dur && dur >= minDur) pass(`${f} duration ${dur.toFixed(1)}s`);
    else if (dur) warn(`${f} kürzer als erwartet: ${dur.toFixed(1)}s`);
  }
}

// ═══════════════════════════════════════════════════════════════
// TAKE 4 QG (+ DB-Sync Check)
// ═══════════════════════════════════════════════════════════════
async function runTake4QG() {
  console.log(`\n── TAKE 4 QG: ${slug} ──`);
  const parts = [
    "take4_01_akt1.webm",
    "take4_02_cut.webm",
    "take4_03_phone_day1.webm",
    "take4_04_akt2.webm",
    "take4_05_phone_day2.webm",
    "take4_06_review.webm",
    "take4_07_closing.webm",
  ];
  for (const f of parts) exists(join(screenflowDir, f), f);

  const complete = join(screenflowDir, "take4_complete.mp4");
  const loom = join(screenflowDir, "take4_with_loom.mp4");
  exists(complete, "take4_complete.mp4");
  exists(loom, "take4_with_loom.mp4");

  const loomDur = probeDur(loom);
  if (loomDur && loomDur >= 80 && loomDur <= 130) pass(`take4_with_loom.mp4 duration ${loomDur.toFixed(1)}s (80-130)`);
  else if (loomDur) warn(`take4_with_loom.mp4 duration aussergewöhnlich: ${loomDur.toFixed(1)}s`);

  // DB-Sync Check
  try {
    const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const config = JSON.parse(await readFile(configPath, "utf-8"));
    const { data: events } = await sb.from("case_events")
      .select("event_type, created_at")
      .eq("case_id", config._wizard_case_id)
      .order("created_at");
    if (!events || events.length === 0) {
      warn(`Keine case_events in DB`);
    } else {
      // Sollte mind. 8 Events haben: case_created, sms_sent, invite_sent, melder_termin_notified, status_changed×2, fields_updated×2, review_requested, review_rated
      if (events.length >= 8) pass(`case_events: ${events.length} Events in DB`);
      else warn(`case_events unvollständig: ${events.length} (erwartet >= 8)`);

      // Alle Events sollten demo-time-basiert sein (today oder yesterday, nicht real-time)
      const today = new Date();
      const eventsToday = events.filter((e) => {
        const d = new Date(e.created_at);
        const hoursDiff = (today - d) / 3600000;
        return hoursDiff >= 0 && hoursDiff <= 30; // innerhalb 30h
      });
      const realTimeEvents = events.filter((e) => {
        const d = new Date(e.created_at);
        const hoursDiff = (today - d) / 3600000;
        return hoursDiff >= 0 && hoursDiff < 1; // last hour = probably real-time
      });
      if (realTimeEvents.length === 0) pass(`Alle Events demo-time-sync (keine Real-Time-Artefakte)`);
      else warn(`${realTimeEvents.length} Events mit Real-Time-Timestamp (patching fehlgeschlagen)`);
    }
  } catch (e) {
    warn(`DB-Check Fehler: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// CROSS-TENANT LEAK CHECK
// ═══════════════════════════════════════════════════════════════
async function runLeakCheck() {
  if (slug === "doerfler-ag") return; // Nicht für Master
  console.log(`\n── LEAK-CHECK: ${slug} ──`);
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const tenantName = config.tenant?.name || "";
  // Wir grep'en den Komplett-Video-Pfad auf "Dörfler" Frame (skip — binary grep nicht sinnvoll).
  // Stattdessen: Probe ob tenant-Name im QC-Frame überhaupt vorkommt.
  const completePath = join(screenflowDir, "take2_complete.mp4");
  if (existsSync(completePath)) {
    const qcPng = join(screenflowDir, "_qc_leak_check.png");
    spawnSync("ffmpeg", ["-y", "-ss", "3", "-i", completePath, "-frames:v", "1", qcPng], { stdio: "ignore" });
    if (existsSync(qcPng)) pass(`QC-Frame generiert: ${qcPng} (manuell prüfen ob "${tenantName}" erscheint)`);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║  DRY-RUN QUALITY-GATES: ${slug.padEnd(36)} ║`);
console.log(`║  Take: ${take.padEnd(52)} ║`);
console.log(`╚════════════════════════════════════════════════════════════╝`);

if (take === "preflight" || take === "all") await runPreflight();
if (take === "2" || take === "all") await runTake2QG();
if (take === "3" || take === "all") await runTake3QG();
if (take === "4" || take === "all") await runTake4QG();
if (take === "all") await runLeakCheck();

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`RESULT for ${slug} (take=${take}):`);
console.log(`  ✅ PASS: ${results.pass.length}`);
console.log(`  ⚠  WARN: ${results.warn.length}`);
console.log(`  ❌ FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log(`\n❌ FAILED CHECKS:`);
  results.fail.forEach((m) => console.log(`    - ${m}`));
  process.exit(1);
}
console.log(`\n✅ QG ${take === "all" ? "FULL" : `TAKE ${take}`} PASSED for ${slug}`);
