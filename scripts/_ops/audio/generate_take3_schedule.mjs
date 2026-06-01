#!/usr/bin/env node
/**
 * generate_take3_schedule.mjs — Leitet die per-Tenant take3.schedule aus der
 * Master-Schedule (Dörfler) + dem Recording-Event-Log ab. Macht build_take3_final
 * self-sufficient für NEUE Betriebe (vorher manuell → Stresstest-Blocker 01.06.).
 *
 * Einziges per-Tenant-Delta in der take3.schedule = die Beschreibungs-Tipp-Dauer
 * (wizard3_beschr_typing), weil die Demo-Case-Beschreibung pro Betrieb unterschiedlich
 * lang ist. Diese Dauer steht im Recording-Event-Log (desc_typing_start→desc_typing_done).
 * Wir setzen beschr_typing auf die ECHTE recorded Dauer und shiften alle Folge-Phasen
 * um das Delta — deterministisch, offset-safe (nur Dauer zählt).
 *
 * Usage:
 *   node scripts/_ops/audio/generate_take3_schedule.mjs --tenant <slug> [--master doerfler-ag]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const args = process.argv.slice(2);
const argVal = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const tenant = argVal("--tenant") || argVal("--slug");
const master = argVal("--master", "doerfler-ag");
if (!tenant) { console.error("usage: --tenant <slug> [--master <slug>]"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
const masterSched = join(PIPE, "_generated", "transcripts", master, "take3.schedule");
const eventLog = join(PIPE, "screenflows", tenant, "take3_wizard_event_log.json");
const outPath = join(PIPE, "_generated", "transcripts", tenant, "take3.schedule");

if (!existsSync(masterSched)) { console.error(`✗ master schedule missing: ${masterSched}`); process.exit(2); }
if (!existsSync(eventLog)) { console.error(`✗ event log missing: ${eventLog} (record_wizard_take3 zuerst laufen lassen)`); process.exit(2); }

// M:SS,T  (T = Zehntel) ↔ Sekunden
const parseT = (s) => { const [mn, rest] = s.split(":"); return (+mn) * 60 + parseFloat(rest.replace(",", ".")); };
const fmtT = (sec) => { const mn = Math.floor(sec / 60); const r = sec - mn * 60; const ss = Math.floor(r); const t = Math.round((r - ss) * 10); const ss2 = t === 10 ? ss + 1 : ss; const t2 = t === 10 ? 0 : t; return `${mn}:${String(ss2).padStart(2, "0")},${t2}`; };

// Parse master: behalte Header/Kommentare, parse Phasen-Zeilen.
const raw = readFileSync(masterSched, "utf8");
const lines = raw.split(/\r?\n/);
const phaseRe = /^(\S+)\s+(\d+:\d+,\d+)-(\d+:\d+,\d+)(.*)$/;
const parsed = lines.map((line) => {
  const m = line.match(phaseRe);
  if (!m) return { raw: line, isPhase: false };
  return { isPhase: true, name: m[1], start: parseT(m[2]), end: parseT(m[3]), tail: m[4] };
});

// Recorded Beschreibungs-Tipp-Dauer aus Event-Log.
const elog = JSON.parse(readFileSync(eventLog, "utf8"));
const evs = Array.isArray(elog) ? elog : (elog.events || []);
const ev = (n) => evs.find((e) => e.name === n)?.recording_t;
const descStart = ev("desc_typing_start"), descDone = ev("desc_typing_done");
if (descStart == null || descDone == null) { console.error("✗ desc_typing_start/done fehlen im Event-Log"); process.exit(3); }
const tenantDescDur = descDone - descStart;

const beschr = parsed.find((p) => p.isPhase && p.name === "wizard3_beschr_typing");
if (!beschr) { console.error("✗ wizard3_beschr_typing fehlt in master schedule"); process.exit(3); }
const masterDescDur = beschr.end - beschr.start;
const delta = tenantDescDur - masterDescDur;
const shiftFrom = beschr.start; // alles, was NACH beschr_typing-Start endet, wird geshiftet

console.log(`tenant: ${tenant} | master desc=${masterDescDur.toFixed(2)}s, recorded desc=${tenantDescDur.toFixed(2)}s → delta=${delta >= 0 ? "+" : ""}${delta.toFixed(2)}s`);

// Anwenden: beschr_typing.end += delta; jede Phase die NACH beschr_typing.start beginnt → +delta.
for (const p of parsed) {
  if (!p.isPhase) continue;
  if (p.name === "wizard3_beschr_typing") { p.end += delta; }
  else if (p.start >= shiftFrom + 0.001) { p.start += delta; p.end += delta; }
}

const out = parsed.map((p) => p.isPhase ? `${p.name.padEnd(26)} ${fmtT(p.start)}-${fmtT(p.end)}${p.tail || ""}` : p.raw).join("\n");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);
console.log(`✓ ${outPath} (beschr_typing → ${tenantDescDur.toFixed(2)}s, downstream +${delta.toFixed(2)}s)`);
