#!/usr/bin/env node
/**
 * post_take_qg.mjs — Automatische Quality-Gates nach Take-Erstellung (FB3).
 *
 * Läuft als letzter Schritt in der Pipeline und prüft, dass keine typischen
 * Brüche im fertigen Take-Output stecken. Founder-Regel: "Wenn ein Punkt
 * verletzt, bekomme ich eine Rückmeldung mit dem Finding".
 *
 * Checks (pro Tenant + Take):
 *   [1] Phone-Case created_at = demoTime.phoneCaseSavedTime   (Konsistenz FB5+FB6)
 *   [2] Wizard-Case created_at = demoTime.wizardSubmitTime    (FB7 Root-Cause)
 *   [3] _seed_time = demoTime.phoneCallStartTime               (Samsung-Uhr-Source)
 *   [4] _completion_time = demoTime.completionTime
 *   [5] _review_sent_time = demoTime.reviewSmsSent             (FB11 +2 min)
 *   [6] status_bar.png + status_bar_detail.png existieren      (FB1 Switch)
 *   [7] _take2_detail_switch_sec > 0                           (FB1 Switch-Trigger)
 *   [8] take{N}_complete.mp4 existiert + Mindestdauer
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/post_take_qg.mjs \
 *     --slug=leins-ag --take=all
 *
 * Exit 0 = alle Checks PASS. Exit 1 = ≥1 FAIL (+ Report auf stderr).
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { getDemoTimes } from "./_lib/demo_time.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--slug"); return i >= 0 ? args[i + 1] : null; })();
const take = args.find((a) => a.startsWith("--take"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--take"); return i >= 0 ? args[i + 1] : null; })() || "all";

if (!slug) {
  console.error("Usage: post_take_qg.mjs --slug <slug> [--take 2|3|4|all]");
  process.exit(1);
}

const takes = take === "all" ? ["2", "3", "4"] : [take];
const screenflowDir = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const configPath = join("docs", "customers", slug, "tenant_config.json");

const demoTime = getDemoTimes({ skipGate: true });
const config = JSON.parse(await readFile(configPath, "utf-8"));
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const findings = [];
function check(label, passed, details = "") {
  const icon = passed ? "✅" : "❌";
  console.log(`  ${icon} ${label}${details ? `  — ${details}` : ""}`);
  if (!passed) findings.push({ label, details });
}

// ISO-Vergleich auf Minutenebene (ignoriere Sekunden/ms Drift)
function sameMinute(isoA, isoB) {
  if (!isoA || !isoB) return false;
  return isoA.slice(0, 16) === isoB.slice(0, 16);
}

console.log(`\n═══ Post-Take-QG: ${slug} ═══`);
console.log(`  demoTime.phoneCaseSavedTime = ${demoTime.iso.phoneCaseSavedTime}`);
console.log(`  demoTime.wizardSubmitTime   = ${demoTime.iso.wizardSubmitTime}`);
console.log(`  demoTime.completionTime     = ${demoTime.iso.completionTime}`);
console.log(`  demoTime.reviewSmsSent      = ${demoTime.iso.reviewSmsSent}`);

// ── [1]+[2]: DB-Case-Zeiten ──
const { data: tenantRow } = await sb.from("tenants").select("id").eq("slug", slug).single();
if (!tenantRow) {
  console.error(`❌ Tenant ${slug} nicht in DB`);
  process.exit(1);
}

const { data: phoneCase } = await sb.from("cases")
  .select("id, created_at")
  .eq("tenant_id", tenantRow.id)
  .eq("source", "voice")
  .eq("urgency", "dringend")
  .order("created_at", { ascending: false })
  .limit(1)
  .single();

check(
  "[1] Phone-Case created_at = demoTime.phoneCaseSavedTime (heute 08:08)",
  phoneCase && sameMinute(phoneCase.created_at, demoTime.iso.phoneCaseSavedTime),
  phoneCase ? `got=${phoneCase.created_at}, want=${demoTime.iso.phoneCaseSavedTime}` : "case not found"
);

if (config._wizard_case_id) {
  const { data: wizardCase } = await sb.from("cases")
    .select("created_at")
    .eq("id", config._wizard_case_id)
    .single();
  check(
    "[2] Wizard-Case created_at = demoTime.wizardSubmitTime (heute 08:56)",
    wizardCase && sameMinute(wizardCase.created_at, demoTime.iso.wizardSubmitTime),
    wizardCase ? `got=${wizardCase.created_at}, want=${demoTime.iso.wizardSubmitTime}` : "case not found"
  );
}

// ── [3]–[5]: Config-Zeiten ──
check(
  "[3] _seed_time = demoTime.phoneCallStartTime (heute 08:04)",
  sameMinute(config._seed_time, demoTime.iso.phoneCallStartTime),
  `got=${config._seed_time}, want=${demoTime.iso.phoneCallStartTime}`
);

if (config._completion_time) {
  check(
    "[4] _completion_time = demoTime.completionTime (heute 09:02)",
    sameMinute(config._completion_time, demoTime.iso.completionTime),
    `got=${config._completion_time}, want=${demoTime.iso.completionTime}`
  );
}

if (config._review_sent_time) {
  check(
    "[5] _review_sent_time = demoTime.reviewSmsSent (heute 09:04, +2 min — FB11)",
    sameMinute(config._review_sent_time, demoTime.iso.reviewSmsSent),
    `got=${config._review_sent_time}, want=${demoTime.iso.reviewSmsSent}`
  );
}

// ── [6]: Status-Bar-PNGs ──
if (takes.includes("2")) {
  const bar = join(screenflowDir, "status_bar.png");
  const barDetail = join(screenflowDir, "status_bar_detail.png");
  check("[6a] status_bar.png existiert", existsSync(bar), bar);
  check("[6b] status_bar_detail.png existiert (FB1 +1 min Switch)", existsSync(barDetail), barDetail);
}

// ── [7]: Switch-Sekunde ──
if (takes.includes("2")) {
  check(
    "[7] _take2_detail_switch_sec > 0 (Fall-Detail-Öffnen gemessen)",
    Number(config._take2_detail_switch_sec) > 0,
    `got=${config._take2_detail_switch_sec}`
  );
}

// ── [8]: Take-Videos ──
const minDuration = { "2": 70, "3": 50, "4": 90 };
for (const tk of takes) {
  const video = join(screenflowDir, `take${tk}_complete.mp4`);
  const exists = existsSync(video);
  check(`[8.${tk}] take${tk}_complete.mp4 existiert`, exists, video);
  if (exists) {
    const probe = spawnSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", video,
    ]);
    const dur = parseFloat(probe.stdout.toString().trim()) || 0;
    check(
      `[8.${tk}b] take${tk}_complete.mp4 Dauer ≥ ${minDuration[tk]}s`,
      dur >= minDuration[tk],
      `got=${dur.toFixed(1)}s, want=${minDuration[tk]}s`
    );
  }
}

// ── Zusammenfassung ──
console.log(`\n═══ QG-Ergebnis ═══`);
if (findings.length === 0) {
  console.log(`  ✅ ALL PASS (${slug})\n`);
  process.exit(0);
}

console.log(`  ❌ ${findings.length} FAIL(S) — Finding-Report:`);
for (const f of findings) {
  console.log(`     • ${f.label}`);
  if (f.details) console.log(`       → ${f.details}`);
}
console.log(`  → Founder-Aktion: Fixes anwenden und Pipeline erneut laufen lassen.\n`);
process.exit(1);
