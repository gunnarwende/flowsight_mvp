#!/usr/bin/env node
// generate_take2_schedule.mjs
//
// SKALIERBARE Take-2-Schedule-Generierung pro Tenant.
//
// Architektur (Founder-Decision 27.04.):
//   - Dörfler-NOTRUF Schedule = Master für Post-Hangup (alle Animationen, Scrolls)
//   - Dörfler-PREIS Schedule  = Master für Pre-Call+Call-Section (Founder-getuned)
//   - Variant-Decision = tenant_config.voice_agent.emergency_policy
//       leer  → preis  (Fallback)
//       voll  → notruf
//
// Generation für preis-Tenant:
//   - Pre-Call+Call: kopiert von Dörfler-preis Schedule
//   - Post-Hangup: kopiert von Dörfler-notruf Schedule + shift mit
//                   (preis.phone_call_ended.end - notruf.phone_call_ended.end)
//                   typisch -3.5s
//
// Output: _generated/transcripts/<tenant>/take2_<variant>.schedule
//
// Usage:
//   node scripts/_ops/audio/generate_take2_schedule.mjs --tenant leins-ag

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED, REPO_ROOT } from "./_lib/env.mjs";
import { parseTime, formatTime } from "./_lib/time_format.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag, defVal = null) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : defVal;
}
const tenant = argVal("--tenant");
const masterTenant = argVal("--master", "doerfler-ag");
if (!tenant) {
  console.error("usage: --tenant <slug> [--master doerfler-ag]");
  process.exit(1);
}

// Variant-Decision via emergency_policy
const cfgPath = path.join(REPO_ROOT, "docs", "customers", tenant, "tenant_config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const emergencyPolicy = (cfg.voice_agent?.emergency_policy || "").trim();
const variant = emergencyPolicy ? "notruf" : "preis";
console.log(`tenant: ${tenant}`);
console.log(`emergency_policy: ${emergencyPolicy ? "VOLL → notruf" : "LEER → preis (fallback)"}`);
console.log(`variant: ${variant}`);

// Parse helpers
function parseScheduleFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  const entries = [];
  const headerLines = [];
  let inHeader = true;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      if (inHeader) headerLines.push(line);
      continue;
    }
    inHeader = false;
    const m = trimmed.match(/^(\S+)\s+(\S+)\s*-\s*(\S+?)\s*(?:#(.*))?$/);
    if (!m) continue;
    const [, name, startStr, endStr, comment] = m;
    entries.push({
      name,
      start: parseTime(startStr),
      end: parseTime(endStr),
      comment: comment ? comment.trim() : null,
    });
  }
  return { headerLines, entries };
}

function fmtScheduleLine(entry) {
  const startStr = formatTime(entry.start);
  const endStr = formatTime(entry.end);
  const comment = entry.comment ? `    # ${entry.comment}` : "";
  return `${entry.name.padEnd(26)} ${startStr}-${endStr}${comment}`;
}

// Find phase index by name
function findIdx(entries, name) {
  return entries.findIndex((e) => e.name === name);
}

// Master schedules
const masterNotrufPath = path.join(GENERATED, "transcripts", masterTenant, "take2_notruf.schedule");
const masterPreisPath = path.join(GENERATED, "transcripts", masterTenant, "take2_preis.schedule");
if (!fs.existsSync(masterNotrufPath)) {
  console.error(`Master notruf schedule missing: ${masterNotrufPath}`);
  process.exit(1);
}
if (!fs.existsSync(masterPreisPath)) {
  console.error(`Master preis schedule missing: ${masterPreisPath}`);
  process.exit(1);
}

const notruf = parseScheduleFile(masterNotrufPath);
const preis = parseScheduleFile(masterPreisPath);

const HANGUP_PHASE = "phone_call_ended";
const notrufHangupIdx = findIdx(notruf.entries, HANGUP_PHASE);
const preisHangupIdx = findIdx(preis.entries, HANGUP_PHASE);
if (notrufHangupIdx === -1 || preisHangupIdx === -1) {
  console.error(`hangup phase '${HANGUP_PHASE}' missing in master schedules`);
  process.exit(1);
}

const notrufHangupEnd = notruf.entries[notrufHangupIdx].end;
const preisHangupEnd = preis.entries[preisHangupIdx].end;
const postHangupShift = preisHangupEnd - notrufHangupEnd; // typically -3.5s for preis

console.log(`master-notruf hangup ends at ${formatTime(notrufHangupEnd)} (${notrufHangupEnd.toFixed(2)}s)`);
console.log(`master-preis  hangup ends at ${formatTime(preisHangupEnd)} (${preisHangupEnd.toFixed(2)}s)`);
console.log(`post-hangup shift for preis variant: ${postHangupShift.toFixed(3)}s`);

// Build output schedule
let outputEntries;
if (variant === "notruf") {
  outputEntries = notruf.entries.map((e) => ({ ...e }));
} else {
  // PREIS: pre-call+call from preis-master + post-hangup from notruf-master + shift
  const preCallAndCall = preis.entries.slice(0, preisHangupIdx + 1).map((e) => ({ ...e }));
  const postHangup = notruf.entries.slice(notrufHangupIdx + 1).map((e) => ({
    ...e,
    start: e.start + postHangupShift,
    end: e.end + postHangupShift,
  }));
  outputEntries = [...preCallAndCall, ...postHangup];
}

// Sanity: continuity
let drift = 0;
for (let i = 0; i < outputEntries.length - 1; i++) {
  const cur = outputEntries[i], next = outputEntries[i + 1];
  const d = Math.abs(cur.end - next.start);
  if (d > 0.01) drift = Math.max(drift, d);
}
console.log(`continuity max drift: ${drift.toFixed(3)}s`);

// Render header
const header = [
  `# Take 2 ${variant.toUpperCase()} — ${tenant} (auto-generated ${new Date().toISOString().split("T")[0]})`,
  `# Generated by scripts/_ops/audio/generate_take2_schedule.mjs`,
  `# Master: ${masterTenant}/take2_notruf (post-hangup) + take2_preis (pre-call/call)`,
  variant === "preis"
    ? `# Variant=preis: post-hangup phases shifted by ${postHangupShift.toFixed(3)}s vs notruf master`
    : `# Variant=notruf: direct copy from notruf master`,
  `# Total duration: ${formatTime(outputEntries[outputEntries.length - 1].end)} (${outputEntries[outputEntries.length - 1].end.toFixed(2)}s)`,
  `# Build: node scripts/_ops/audio/build_from_phase_schedule.mjs --tenant ${tenant} --take 2 --variant ${variant}`,
  ``,
];

// Group phases for readability
function groupHeading(name) {
  if (name.startsWith("phone_homescreen") && !name.includes("post")) return "# === Phone — Homescreen + Anruf-Setup ===";
  if (name === "phone_search") return null;
  if (name === "phone_dialing") return null;
  if (name === "phone_call_active") return "# === Phone — Anruf aktiv (Lisa-Pickup → Hangup) ===";
  if (name === "phone_call_ended") return "# === Phone — Anruf beendet ===";
  if (name === "phone_homescreen_sms_notif") return "# === Phone — SMS-Notification + Thread ===";
  if (name === "app_open_animation") return "# === App-Open + Leitsystem-Tour ===";
  if (name === "leit_filter_reset") return "# === Leitsystem — Filter-Reset + Case-Detail ===";
  return null;
}

const lines = [...header];
for (const e of outputEntries) {
  const h = groupHeading(e.name);
  if (h) lines.push(h);
  lines.push(fmtScheduleLine(e));
}
lines.push("");

// Write
const outDir = path.join(GENERATED, "transcripts", tenant);
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `take2_${variant}.schedule`);
fs.writeFileSync(outPath, lines.join("\n"));

console.log(`\n✓ wrote ${outPath}`);
console.log(`  ${outputEntries.length} phases, total ${outputEntries[outputEntries.length - 1].end.toFixed(2)}s`);
