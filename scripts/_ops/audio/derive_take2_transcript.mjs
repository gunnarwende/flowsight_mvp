#!/usr/bin/env node
// Komplettes Take 2 Transkript (A + Call + C + D + E + F) mit 0.5s Auflösung
// und Screenshot-Pre-Mapping. Plus Generierung eines Slideshow-Videos
// (Audio + Screenshots als statische Bilder pro Zeile) als 1. Iteration.
//
// Usage:
//   node scripts/_ops/audio/derive_take2_transcript.mjs --tenant doerfler-ag --variant notruf

import fs from "node:fs";
import path from "node:path";
import { loadEnv, GENERATED, CLEAN_ROOT, PIPELINE_ROOT } from "./_lib/env.mjs";
import { ffprobeInfo } from "./_lib/ffmpeg.mjs";
import { transcribeWithWordTimestamps } from "./_lib/whisper.mjs";

loadEnv();

const argv = process.argv.slice(2);
function argVal(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
}
const tenant = argVal("--tenant");
const variant = argVal("--variant");
const noVideo = argv.includes("--no-video");
if (!tenant || !["notruf", "preis"].includes(variant)) {
  console.error("usage: --tenant <slug> --variant <notruf|preis> [--no-video]");
  process.exit(1);
}

const variantCap = variant === "notruf" ? "Notruf" : "Preis";

// Take 2 input audio (already assembled)
const take2File = path.join(GENERATED, "takes", tenant, `take2_${variant}.wav`);
if (!fs.existsSync(take2File)) {
  console.error(`take2 file not found: ${take2File}. Run assemble_take2.mjs first.`);
  process.exit(1);
}
const take2Info = await ffprobeInfo(take2File);
console.log(`take2: ${take2File} (${take2Info.duration.toFixed(2)}s)`);

// Take 2 sequence (matches assemble_take2.mjs + assemble_call.mjs):
//   [800ms lead silence prepended]
//   A.wav  → call_<variant>.wav  → C.wav → D.wav → E.wav → F.wav
//   FB82 → FB83 (26.04.): per-segment gaps (Founder fine-tuned, Round 2).
//   D→E 1000ms (war 700), E→F 1500ms (war 800).
const SEGMENT_GAPS_MS = [250, 600, 1000, 1000, 1500, 0];
const LEAD_SILENCE_MS = 800;
const segments = [
  { name: "A", file: path.join(CLEAN_ROOT, "mini_takes", "Take2", "A.wav"), label: "Wrap A (Vor Anruf)", phase: "wrap_a" },
  { name: "Call", file: path.join(GENERATED, "calls", tenant, `call_${variant}.wav`), label: `Call ${variantCap}`, phase: "call" },
  { name: "C", file: path.join(CLEAN_ROOT, "mini_takes", "Take2", "C.wav"), label: "Wrap C (Nach Anruf)", phase: "wrap_c" },
  { name: "D", file: path.join(CLEAN_ROOT, "mini_takes", "Take2", "D.wav"), label: "Wrap D (Leitsystem)", phase: "wrap_d" },
  { name: "E", file: path.join(CLEAN_ROOT, "mini_takes", "Take2", "E.wav"), label: "Wrap E (KPIs)", phase: "wrap_e" },
  { name: "F", file: path.join(CLEAN_ROOT, "mini_takes", "Take2", "F.wav"), label: "Wrap F (Case Detail)", phase: "wrap_f" },
];

// Compute global offsets in take2 timeline
let cursor = LEAD_SILENCE_MS / 1000;
for (let i = 0; i < segments.length; i++) {
  const seg = segments[i];
  if (!fs.existsSync(seg.file)) {
    console.error(`missing: ${seg.file}`);
    process.exit(1);
  }
  const info = await ffprobeInfo(seg.file);
  seg.start = cursor;
  seg.duration = info.duration;
  seg.end = cursor + info.duration;
  cursor = seg.end + (SEGMENT_GAPS_MS[i] || 0) / 1000;
}

console.log(`\nsegment timing in take2 timeline:`);
for (const s of segments) {
  console.log(`  ${s.start.toFixed(2)}–${s.end.toFixed(2)}s (${s.duration.toFixed(2)}s)  ${s.label}`);
}

// Whisper-transcribe each Founder wrap (A, C, D, E, F).
// For the Call segment we re-use derive logic (per-turn whisper) to avoid drift over long silence.
const allWords = [];

// Re-derive call internal sub-segments (matches assemble_call.mjs)
// Call sequence inside call_<variant>.wav (5s pre-silence + ring + greeting + ... + hangup)
const tenantGreeting = path.join(GENERATED, "lisa_tts", "tenants", tenant, "agent_01.wav");
const ringTone = path.join(PIPELINE_ROOT, "_assets", "ring_tone_swiss.wav");
const hangupTone = path.join(PIPELINE_ROOT, "_assets", "hangup_tone.wav");
const genericDir = path.join(GENERATED, "lisa_tts", "generic");
const userDir = path.join(CLEAN_ROOT, "mini_takes", "Take2", "call", variantCap, "Audio");
const PRE_CALL_SILENCE_S = 5.0;
const GREETING_END_ANCHOR_S = 14.30;
const piepInfo = await ffprobeInfo(ringTone);
const greetInfo = await ffprobeInfo(tenantGreeting);
const ringGapS = GREETING_END_ANCHOR_S - PRE_CALL_SILENCE_S - piepInfo.duration - greetInfo.duration;

function callGapAfter(curRole, curId, nextRole, nextId) {
  if (!nextRole) return 0;
  if (nextRole === "hangup") return 0.6;
  if (curRole === "ring") return ringGapS;
  if (curRole === "user" && nextRole === "agent") {
    if (nextId === 7) return 2.2;
    if (nextId === 8) return 2.0;
    return 1.2;
  }
  if (curRole === "agent" && nextRole === "user") {
    if (curId === 1) return 0.4;
    return 0.65;
  }
  return 0.65;
}

const callSegment = segments.find((s) => s.name === "Call");
const callSequence = [
  { role: "ring", id: 0, file: ringTone },
  { role: "agent", id: 1, file: tenantGreeting, label: "Lisa #1 (Greeting)" },
];
for (let i = 1; i <= 10; i++) {
  callSequence.push({ role: "user", id: i, file: path.join(userDir, `${i}.wav`), label: `User #${i}` });
  const nextAgentId = i + 1;
  const agentFile = nextAgentId === 9
    ? path.join(genericDir, `agent_09_${variant}.wav`)
    : path.join(genericDir, `agent_${String(nextAgentId).padStart(2, "0")}.wav`);
  callSequence.push({ role: "agent", id: nextAgentId, file: agentFile, label: `Lisa #${nextAgentId}` });
}
callSequence.push({ role: "hangup", id: 99, file: hangupTone, label: "Auflegeton" });

// Compute call-internal offsets, then add callSegment.start for global take2-time
let callCursor = PRE_CALL_SILENCE_S;
for (let i = 0; i < callSequence.length; i++) {
  const seg = callSequence[i];
  const info = await ffprobeInfo(seg.file);
  seg.callStart = callCursor;
  seg.callEnd = callCursor + info.duration;
  seg.start = callSegment.start + seg.callStart;
  seg.end = callSegment.start + seg.callEnd;
  seg.duration = info.duration;
  const nxt = callSequence[i + 1];
  callCursor = seg.callEnd + callGapAfter(seg.role, seg.id, nxt?.role, nxt?.id);
}

console.log(`\ntranscribing per segment with Whisper...`);
// Founder wraps (whole segments)
for (const wrap of segments.filter((s) => s.name !== "Call")) {
  try {
    const ws = await transcribeWithWordTimestamps(wrap.file, {
      language: "de",
      prompt: "Founder Gunnar erklärt FlowSight, ein Sanitärbetrieb-Tool. Erwähnt Lisa, Anruf, SMS, Leitsystem, Cases, Bewertung.",
    });
    for (const w of ws.words) {
      allWords.push({
        word: w.word,
        start: w.start + wrap.start,
        end: w.end + wrap.start,
        role: "founder",
        phase: wrap.phase,
        segLabel: wrap.label,
      });
    }
    console.log(`  ${wrap.label.padEnd(28)} ${ws.words.length} words`);
  } catch (e) {
    console.log(`  ${wrap.label.padEnd(28)} FAILED: ${e.message.slice(0, 80)}`);
  }
}

// Call internal (Lisa + User per segment)
for (const cs of callSequence.filter((s) => s.role === "agent" || s.role === "user")) {
  try {
    const ws = await transcribeWithWordTimestamps(cs.file, {
      language: cs.id === 7 ? "en" : "de",
      prompt: cs.role === "agent"
        ? "Lisa, digitale Assistentin einer Sanitärfirma am Telefon."
        : "Anrufer meldet einen Wasserschaden, Schweizer Adresse Seestrasse 14, 8942 Oberrieden.",
    });
    for (const w of ws.words) {
      allWords.push({
        word: w.word,
        start: w.start + cs.start,
        end: w.end + cs.start,
        role: cs.role,
        segId: cs.id,
        phase: "call",
        segLabel: cs.label,
      });
    }
    console.log(`  ${cs.label.padEnd(28)} ${ws.words.length} words`);
  } catch (e) {
    console.log(`  ${cs.label.padEnd(28)} FAILED: ${e.message.slice(0, 80)}`);
  }
}
allWords.sort((a, b) => a.start - b.start);
console.log(`total: ${allWords.length} words`);

// Find piep + hangup regions in global timeline (for sound markers)
const ringInCall = callSequence.find((s) => s.role === "ring");
const hangupInCall = callSequence.find((s) => s.role === "hangup");
const agent1 = callSequence.find((s) => s.role === "agent" && s.id === 1);
const agent7 = callSequence.find((s) => s.role === "agent" && s.id === 7);
const agent8 = callSequence.find((s) => s.role === "agent" && s.id === 8);

// Phase classifier (used for screenshot pre-fill)
function classifyTime(t) {
  // Lead silence (Founder schaut in Kamera vor Wrap A)
  if (t < LEAD_SILENCE_MS / 1000) {
    return { phase: "intro_silence", note: "Vor Wrap A (in Kamera schauen)", screenshot: "1" };
  }
  // FB81b (26.04.): "Anruf beendet"-Screen muss 3s sichtbar bleiben (matcht Original-Flow).
  // Extension geht in den Beginn von Wrap C rein → Founder spricht während Anruf-Beendet-Screen.
  const HANGUP_SHOW_DUR = 3.0;
  if (t >= hangupInCall.start && t < hangupInCall.start + HANGUP_SHOW_DUR) {
    return { phase: "call_ending", note: "Anruf beendet (Screen sichtbar)", screenshot: "5" };
  }
  // Find which take2-segment we're in
  const segMatch = segments.find((s) => t >= s.start && t < s.end);
  if (!segMatch) {
    // FB64 (26.04.): Wir sind in einem 0.25s-Gap zwischen zwei Segmenten.
    // Statt BLACK FALLBACK: die Klassifikation vom Ende des vorigen Segments erben
    // (= das letzte sichtbare Bild bleibt, kein schwarzer Sprung).
    let prev = null;
    for (const s of segments) {
      if (s.end <= t && (!prev || s.end > prev.end)) prev = s;
    }
    if (prev) {
      return classifyTime(prev.end - 0.01);
    }
    return { phase: "gap", note: "Übergang", screenshot: "" };
  }
  if (segMatch.name === "A") {
    return { phase: "wrap_a", note: "Founder zeigt Handy + erklärt", screenshot: "1" };
  }
  if (segMatch.name === "Call") {
    // pre-call silence
    if (t < callSegment.start + PRE_CALL_SILENCE_S) {
      return { phase: "call_pre_silence", note: "Founder tippt + drückt Anruf", screenshot: "2" };
    }
    // ring (piep)
    if (t >= ringInCall.start && t < ringInCall.end) {
      return { phase: "call_piep", note: "PIEP (Wählton)", screenshot: "3" };
    }
    // verbindung-wartezeit (between piep and lisa)
    if (t >= ringInCall.end && t < agent1.start) {
      return { phase: "call_ringing", note: "Verbindung (Lisa nimmt ab)", screenshot: "3" };
    }
    // hangup region (already handled by global override at top of classifyTime)
    // language switch pauses
    if (agent7 && t >= agent7.start - 2.2 && t < agent7.start) {
      return { phase: "call_active_de_en", note: "Lisa wechselt zu Englisch", screenshot: "4" };
    }
    if (agent8 && t >= agent8.start - 2.0 && t < agent8.start) {
      return { phase: "call_active_en_de", note: "Lisa zurück zu Deutsch", screenshot: "4" };
    }
    // anything else inside call = active conversation
    return { phase: "call_active", note: "Anruf aktiv (Konversation)", screenshot: "4" };
  }
  if (segMatch.name === "C") {
    // Wrap C ist ~28s long. Roughly: erstes Drittel Homescreen mit SMS, mittleres Drittel SMS Thread, letztes Drittel Homescreen vor App-Open
    const local = (t - segMatch.start) / segMatch.duration;
    if (local < 0.33) return { phase: "wrap_c_sms_arrives", note: "SMS angekommen", screenshot: "6" };
    if (local < 0.75) return { phase: "wrap_c_sms_thread", note: "SMS gelesen", screenshot: "7" };
    return { phase: "wrap_c_pre_app", note: "Vor App-Open", screenshot: "8" };
  }
  if (segMatch.name === "D") {
    // Wrap D: dashboard + scroll choreo
    const local = (t - segMatch.start) / segMatch.duration;
    if (local < 0.30) return { phase: "wrap_d_dashboard", note: "Dashboard mit KPIs", screenshot: "9" };
    if (local < 0.55) return { phase: "wrap_d_scroll_down", note: "Liste scroll down", screenshot: "10" };
    if (local < 0.80) return { phase: "wrap_d_scroll_bottom", note: "Liste weit unten", screenshot: "10.1" };
    return { phase: "wrap_d_scroll_up", note: "Scroll zurück", screenshot: "10.2" };
  }
  if (segMatch.name === "E") {
    // Wrap E: 4 KPI clicks + filter reset
    const local = (t - segMatch.start) / segMatch.duration;
    if (local < 0.18) return { phase: "wrap_e_neu", note: "KPI NEU klicken", screenshot: "11" };
    if (local < 0.36) return { phase: "wrap_e_bei_uns", note: "KPI BEI UNS klicken", screenshot: "12" };
    if (local < 0.54) return { phase: "wrap_e_erledigt", note: "KPI ERLEDIGT klicken", screenshot: "13" };
    if (local < 0.72) return { phase: "wrap_e_bewertung", note: "KPI BEWERTUNG klicken", screenshot: "14" };
    if (local < 0.86) return { phase: "wrap_e_filter_reset", note: "Filter zurücksetzen", screenshot: "15.1" };
    return { phase: "wrap_e_filter_done", note: "Filter zurück, Liste normal", screenshot: "15.2" };
  }
  if (segMatch.name === "F") {
    // Wrap F: case open, scroll, back to dashboard
    const local = (t - segMatch.start) / segMatch.duration;
    if (local < 0.25) return { phase: "wrap_f_case_open", note: "Case geöffnet — Übersicht", screenshot: "16" };
    if (local < 0.55) return { phase: "wrap_f_case_scroll", note: "Case scroll — Verlauf+Anhänge", screenshot: "16.1" };
    if (local < 0.80) return { phase: "wrap_f_case_back_top", note: "Case scroll back-top", screenshot: "16.2" };
    return { phase: "wrap_f_dashboard_back", note: "Zurück Dashboard", screenshot: "17" };
  }
  return { phase: "unknown", note: "?", screenshot: "" };
}

// Build 0.5s rows
const ROW_RES_S = 0.5;
const totalRows = Math.ceil(take2Info.duration / ROW_RES_S);
const rows = [];
for (let r = 0; r < totalRows; r++) {
  const t = r * ROW_RES_S;
  // Find active words within this 0.5s slice
  const activeWords = allWords.filter((w) => w.start < t + ROW_RES_S && w.end > t);
  // Determine speaker label + content
  let speaker = "";
  let content = "";
  if (activeWords.length > 0) {
    const main = activeWords[0];
    if (main.role === "agent") {
      speaker = main.segId === 7 ? "Lisa (EN)" : "Lisa";
    } else if (main.role === "user") {
      speaker = `User #${main.segId}`;
    } else if (main.role === "founder") {
      speaker = "Founder";
    } else {
      speaker = "?";
    }
    content = activeWords.map((w) => w.word.trim()).join(" ");
  } else {
    const cls = classifyTime(t);
    speaker = "—";
    content = `(${cls.note})`;
  }
  const phaseInfo = classifyTime(t);
  rows.push({
    t,
    speaker,
    content,
    phase: phaseInfo.phase,
    screenshot: phaseInfo.screenshot,
  });
}

// Write Markdown
const transcriptDir = path.join(GENERATED, "transcripts", tenant);
fs.mkdirSync(transcriptDir, { recursive: true });
const mdPath = path.join(transcriptDir, `take2_${variant}_full.md`);
const mdLines = [];
mdLines.push(`# Take 2 ${variantCap} — Komplettes Transkript (${tenant})`);
mdLines.push("");
mdLines.push(`**Audio:** \`${take2File.replace(/\\/g, "/")}\`  | **Dauer:** ${take2Info.duration.toFixed(2)}s | **Auflösung:** 0.5s | **Zeilen:** ${totalRows}`);
mdLines.push("");
mdLines.push("Spalte **Screenshot** ist von mir vor-gemappt basierend auf Audio-Phase. Founder: passe an wenn Mismatch.");
mdLines.push("Screenshots-Ordner: `docs/gtm/pipeline/06_video_production/master_takes/pictureflow/take2/<nr>.png`");
mdLines.push("");
mdLines.push("| Sek    | Sprecher    | Inhalt                                              | Phase                  | Screenshot |");
mdLines.push("|--------|-------------|-----------------------------------------------------|------------------------|------------|");
for (const row of rows) {
  const sec = row.t.toFixed(1).padStart(6);
  const spk = row.speaker.padEnd(11);
  const con = (row.content.length > 51 ? row.content.slice(0, 48) + "..." : row.content).padEnd(51);
  const ph = row.phase.padEnd(22);
  const ss = row.screenshot.padEnd(10);
  mdLines.push(`| ${sec} | ${spk} | ${con} | ${ph} | ${ss} |`);
}
fs.writeFileSync(mdPath, mdLines.join("\n"));

// Write CSV
const csvPath = path.join(transcriptDir, `take2_${variant}_full.csv`);
const csvLines = ["Sek,Sprecher,Inhalt,Phase,Screenshot"];
for (const row of rows) {
  const fields = [
    row.t.toFixed(1),
    `"${row.speaker.replace(/"/g, '""')}"`,
    `"${row.content.replace(/"/g, '""')}"`,
    `"${row.phase}"`,
    `"${row.screenshot}"`,
  ];
  csvLines.push(fields.join(","));
}
fs.writeFileSync(csvPath, csvLines.join("\n"));

// Write meta JSON
const metaPath = path.join(transcriptDir, `take2_${variant}_full_meta.json`);
fs.writeFileSync(metaPath, JSON.stringify({
  ts: new Date().toISOString(),
  tenant,
  variant,
  audioFile: take2File,
  duration: take2Info.duration,
  segments,
  callSequence,
  rows,
}, null, 2));

console.log("");
console.log(`✓ Markdown: ${mdPath}`);
console.log(`✓ CSV:      ${csvPath}`);
console.log(`✓ Meta:     ${metaPath}`);
console.log(`✓ Rows:     ${totalRows}  (${take2Info.duration.toFixed(2)}s @ 0.5s)`);
