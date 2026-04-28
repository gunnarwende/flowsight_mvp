#!/usr/bin/env node
// Derive a 0.1s-resolution transcript per call (notruf|preis) for a given tenant.
//
// Workflow:
//   1. Whisper transcribes the assembled call WAV with word-level timestamps.
//   2. We classify each word as Lisa (agent) / User (Founder) by overlapping with
//      known segment-times from assemble_call.mjs sequence.
//   3. We additionally annotate sound regions (pre-call silence, piep, hangup,
//      DE→EN switch pause, EN→DE switch pause).
//   4. Output: Markdown table + CSV — one row per 0.1s of the call audio.
//
// Founder fills the "Visual" column → that becomes the anchor-track for screenflow.
//
// Usage:
//   node scripts/_ops/audio/derive_transcript.mjs --tenant doerfler-ag --variant notruf

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
if (!tenant || !["notruf", "preis"].includes(variant)) {
  console.error("usage: --tenant <slug> --variant <notruf|preis>");
  process.exit(1);
}

const variantCap = variant === "notruf" ? "Notruf" : "Preis";
const callFile = path.join(GENERATED, "calls", tenant, `call_${variant}.wav`);
if (!fs.existsSync(callFile)) {
  console.error(`call file not found: ${callFile}. Run assemble_call.mjs first.`);
  process.exit(1);
}

console.log(`call: ${callFile}`);
const callInfo = await ffprobeInfo(callFile);
console.log(`duration: ${callInfo.duration.toFixed(2)}s`);

// We need the segment-start-times to classify Whisper-words as Lisa vs User.
// Re-derive the same sequence assemble_call.mjs uses.
const tenantGreeting = path.join(GENERATED, "lisa_tts", "tenants", tenant, "agent_01.wav");
const ringTone = path.join(PIPELINE_ROOT, "_assets", "ring_tone_swiss.wav");
const hangupTone = path.join(PIPELINE_ROOT, "_assets", "hangup_tone.wav");
const genericDir = path.join(GENERATED, "lisa_tts", "generic");
const userDir = path.join(CLEAN_ROOT, "mini_takes", "Take2", "call", variantCap, "Audio");

// Re-construct timing the same way assemble_call.mjs does
const PRE_CALL_SILENCE_S = 5.0;
const GREETING_END_ANCHOR_S = 14.30;
const piepInfo = await ffprobeInfo(ringTone);
const greetInfo = await ffprobeInfo(tenantGreeting);
const ringGapS = GREETING_END_ANCHOR_S - PRE_CALL_SILENCE_S - piepInfo.duration - greetInfo.duration;

function gapAfter(curRole, curId, nextRole, nextId) {
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

// Build sequence
const sequence = [
  { role: "ring", id: 0, file: ringTone },
  { role: "agent", id: 1, file: tenantGreeting, label: "Lisa #1 (Greeting)" },
];
for (let i = 1; i <= 10; i++) {
  sequence.push({ role: "user", id: i, file: path.join(userDir, `${i}.wav`), label: `User #${i}` });
  const nextAgentId = i + 1;
  const agentFile = nextAgentId === 9
    ? path.join(genericDir, `agent_09_${variant}.wav`)
    : path.join(genericDir, `agent_${String(nextAgentId).padStart(2, "0")}.wav`);
  sequence.push({ role: "agent", id: nextAgentId, file: agentFile, label: `Lisa #${nextAgentId}` });
}
sequence.push({ role: "hangup", id: 99, file: hangupTone, label: "Auflegeton" });

// Compute global start-times
let cursor = PRE_CALL_SILENCE_S;
for (let i = 0; i < sequence.length; i++) {
  const seg = sequence[i];
  const info = await ffprobeInfo(seg.file);
  seg.start = cursor;
  seg.end = cursor + info.duration;
  seg.duration = info.duration;
  const nxt = sequence[i + 1];
  const gap = gapAfter(seg.role, seg.id, nxt?.role, nxt?.id);
  cursor = seg.end + gap;
  seg.gapAfterS = gap;
}

console.log(`\nsegment timing (global call timeline):`);
for (const seg of sequence) {
  console.log(`  ${seg.start.toFixed(2)}–${seg.end.toFixed(2)}s  ${seg.role.padEnd(6)} #${String(seg.id).padStart(2)}  (gap_after=${seg.gapAfterS.toFixed(2)}s)`);
}

// Per-Segment Whisper transcription (more accurate than transcribing the whole call,
// because Whisper's word-timestamps drift over long silence regions).
console.log(`\ntranscribing per segment with Whisper...`);
const annotatedWords = [];
const speakingSegments = sequence.filter((s) => s.role === "agent" || s.role === "user");
for (const seg of speakingSegments) {
  try {
    const segWs = await transcribeWithWordTimestamps(seg.file, {
      language: seg.id === 7 ? "en" : "de",
      prompt: seg.role === "agent"
        ? "Lisa, digitale Assistentin einer Sanitärfirma am Telefon."
        : "Anrufer meldet einen Wasserschaden, Schweizer Adresse Seestrasse 14, 8942 Oberrieden.",
    });
    for (const w of segWs.words) {
      annotatedWords.push({
        word: w.word,
        start: w.start + seg.start,
        end: w.end + seg.start,
        role: seg.role,
        segId: seg.id,
        segLabel: seg.label,
      });
    }
    console.log(`  ${seg.label.padEnd(22)} ${segWs.words.length} words`);
  } catch (e) {
    console.log(`  ${seg.label.padEnd(22)} FAILED: ${e.message.slice(0, 80)}`);
  }
}
annotatedWords.sort((a, b) => a.start - b.start);
console.log(`total: ${annotatedWords.length} words`);

function classifyWordTime(t) {
  // pre-call silence
  if (t < PRE_CALL_SILENCE_S) return { role: "system", note: "Pre-Call (Handy tippen+anrufen)" };
  // piep region
  const ringSeg = sequence.find((s) => s.role === "ring");
  if (t >= ringSeg.start && t < ringSeg.end) return { role: "sound", note: "PIEP (Klingelton)" };
  // hangup region
  const hangupSeg = sequence.find((s) => s.role === "hangup");
  if (t >= hangupSeg.start && t < hangupSeg.end) return { role: "sound", note: "Auflegeton" };
  // language switches (the long pauses before agent #7 and #8)
  const agent7 = sequence.find((s) => s.role === "agent" && s.id === 7);
  const agent8 = sequence.find((s) => s.role === "agent" && s.id === 8);
  if (agent7 && t >= agent7.start - 2.2 && t < agent7.start) {
    return { role: "pause", note: "Sprachwechsel DE→EN" };
  }
  if (agent8 && t >= agent8.start - 2.0 && t < agent8.start) {
    return { role: "pause", note: "Sprachwechsel EN→DE" };
  }
  // ring→agent gap (Verbindungs-Wartezeit nach Piep, vor Lisa-Greeting)
  const agent1 = sequence.find((s) => s.role === "agent" && s.id === 1);
  if (agent1 && t >= ringSeg.end && t < agent1.start) {
    return { role: "pause", note: "Verbindung (Lisa hebt ab)" };
  }
  // find which sequence segment contains t (covers gaps within a segment)
  for (const seg of sequence) {
    if (t >= seg.start && t < seg.end) {
      return { role: seg.role, segId: seg.id, segLabel: seg.label };
    }
  }
  return { role: "pause", note: "Pause" };
}

// Now build 0.1s rows
const totalRows = Math.ceil(callInfo.duration * 10);
const rows = [];
for (let r = 0; r < totalRows; r++) {
  const t = r / 10;
  // find the word that contains/overlaps this 0.1s slice
  let activeWord = null;
  for (const w of annotatedWords) {
    if (t >= w.start - 0.05 && t < w.end + 0.05) {
      activeWord = w;
      break;
    }
  }
  // determine speaker label
  let speaker = "";
  let content = "";
  if (activeWord) {
    if (activeWord.role === "agent") {
      speaker = activeWord.segId === 7 ? "Lisa (EN)" : "Lisa";
      content = `"${activeWord.word.trim()}"`;
    } else if (activeWord.role === "user") {
      speaker = `User`;
      content = `"${activeWord.word.trim()}"`;
    } else {
      speaker = "?";
      content = `"${activeWord.word.trim()}"`;
    }
  } else {
    // No active word — classify the silence region
    const cls = classifyWordTime(t);
    if (cls.role === "system") {
      speaker = "—";
      content = `(${cls.note})`;
    } else if (cls.role === "sound") {
      speaker = "SOUND";
      content = `[${cls.note}]`;
    } else if (cls.role === "pause") {
      speaker = "—";
      content = `(${cls.note || "Stille"})`;
    } else if (cls.role === "agent") {
      speaker = "Lisa";
      content = "(Atempause)";
    } else if (cls.role === "user") {
      speaker = `User #${cls.segId}`;
      content = "(Atempause)";
    } else {
      speaker = "—";
      content = "(Stille)";
    }
  }
  rows.push({ t, speaker, content });
}

// Write Markdown
const mdLines = [];
mdLines.push(`# Take 2 ${variantCap} — Transkript (${tenant})`);
mdLines.push("");
mdLines.push(`**Audio-Master:** \`${callFile.replace(/\\/g, "/")}\``);
mdLines.push(`**Dauer:** ${callInfo.duration.toFixed(2)}s — ${totalRows} Zeilen à 0.1s`);
mdLines.push(`**Tenant:** ${tenant} (${variantCap}-Variante)`);
mdLines.push("");
mdLines.push(`Founder: trag in der Spalte **Visual** ein, was zu jedem Zehntelsekunden-Anchor zu sehen sein soll.`);
mdLines.push("");
mdLines.push("| Sek    | Sprecher       | Inhalt                                            | Visual (Founder) |");
mdLines.push("|--------|----------------|---------------------------------------------------|------------------|");
for (const row of rows) {
  const sec = row.t.toFixed(1).padStart(6);
  const spk = row.speaker.padEnd(14);
  const con = row.content.length > 49 ? row.content.slice(0, 46) + "..." : row.content.padEnd(49);
  mdLines.push(`| ${sec} | ${spk} | ${con} |                  |`);
}

const transcriptDir = path.join(GENERATED, "transcripts", tenant);
fs.mkdirSync(transcriptDir, { recursive: true });
const mdPath = path.join(transcriptDir, `take2_${variant}.md`);
fs.writeFileSync(mdPath, mdLines.join("\n"));

// Write CSV (Excel-friendly)
const csvLines = [];
csvLines.push("Sek,Sprecher,Inhalt,Visual");
for (const row of rows) {
  const sec = row.t.toFixed(1);
  const spk = row.speaker.replace(/"/g, '""');
  const con = row.content.replace(/"/g, '""');
  csvLines.push(`${sec},"${spk}","${con}",""`);
}
const csvPath = path.join(transcriptDir, `take2_${variant}.csv`);
fs.writeFileSync(csvPath, csvLines.join("\n"));

// Write JSON-meta (segments + words for tooling)
const metaPath = path.join(transcriptDir, `take2_${variant}_meta.json`);
fs.writeFileSync(metaPath, JSON.stringify({
  ts: new Date().toISOString(),
  tenant,
  variant,
  callFile,
  duration: callInfo.duration,
  segments: sequence,
  words: annotatedWords,
}, null, 2));

console.log("");
console.log(`✓ Markdown: ${mdPath}`);
console.log(`✓ CSV:      ${csvPath}`);
console.log(`✓ Meta:     ${metaPath}`);
console.log(`✓ Rows:     ${totalRows}  (${callInfo.duration.toFixed(2)}s @ 0.1s)`);
