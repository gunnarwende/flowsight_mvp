#!/usr/bin/env node
/**
 * anchor_t4_reveal.mjs — pinnt den T4 Fall-Reveal (Dashboard → Fall-Detail) auf
 * eine exakte SOLL-Zeit (CASE_REVEAL_T = 11,0s), tenant-agnostisch.
 *
 * Warum: Die Live-Aufnahme driftet pro Betrieb (Dashboard-Ladezeit). Der V3-Compose
 * verankert NICHTS mehr → der Reveal landet je nach Betrieb ±1-2s daneben (Walter
 * 09.06.: ~9,6s statt 11,0s). Alles danach (Audio/Loom) ist dann desynct.
 *
 * Robuster Fix (kein fixer Zeit-Proxy): den ECHTEN Reveal-Frame per Scene-Change
 * detektieren, dann längen-erhaltend auf 11,0s schieben:
 *   - Reveal zu früh (δ>0): δ-Sekunden Dashboard-Freeze VOR dem Reveal einfügen,
 *     δ-Sekunden vom statischen Closing-Tail abschneiden → Gesamtlänge bleibt.
 *   - Reveal zu spät (δ<0): symmetrisch.
 *
 * Shell-agnostisch (kein /dev/null, keine Pipes, kein rm — läuft auch unter cmd.exe).
 * Usage: node scripts/_ops/anchor_t4_reveal.mjs --in <mp4> [--out <mp4>] [--target 11.0]
 */
import { existsSync, readFileSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const inPath = arg("--in");
const outPath = arg("--out", inPath);
const TARGET = parseFloat(arg("--target", "11.0"));
// SEG_END: lokaler Umverteil-Horizont. Inhalt ab SEG_END bleibt 1:1 (T4: 29.0s, weil der
// Telefon-Teil unabhängig positioniert ist). Für globalen Shift (T3: das ganze maus-getriebene
// Formular folgt dem Modal) SEG_END = Video-Dauer setzen → Trim kommt aus dem Closing-Tail.
let SEG_END = parseFloat(arg("--seg-end", "29.0"));
// --no-trim: NUR Freeze einfügen (kein Tail-Trim). Das Video wächst; ein nachgelagerter
// Audio-Mux mit -shortest richtet die Länge dann exakt auf die (Schablonen-)Audio-Länge aus.
// Für T3 korrekt (Audio = 1ms-Locked-SOLL); für T4 NICHT nutzen (dort Segment-A-lokal).
const noTrim = args.includes("--no-trim");
const TOL = 0.12;
// Detektionsfenster für den Event-Scene-Change (T4-Reveal: [8,12.5]; T3-Modal: [124,131]).
const WIN_FROM = parseFloat(arg("--win-from", "8.0"));
const WIN_TO = parseFloat(arg("--win-to", "12.5"));
if (!inPath || !existsSync(inPath)) { console.error(`✗ --in nicht gefunden: ${inPath}`); process.exit(2); }

const run = (cmd) => { try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return (e.stdout || "") + (e.stderr || ""); } };
const probeDur = (p) => parseFloat(run(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${p}"`).trim());

/** Reveal-Zeit via stärkstem Scene-Change im Fenster (Metadaten → relatives Tempfile,
 *  kein Laufwerks-Doppelpunkt → bricht die ffmpeg file=-Filteroption nicht). */
let _metaCtr = 0;
function detectReveal(p) {
  const meta = `_t4scene_${process.pid}_${_metaCtr++}.txt`; // relativ zu cwd, kein ":"
  run(`ffmpeg -hide_banner -ss ${WIN_FROM} -to ${WIN_TO} -i "${p}" -vf "select='gte(scene,0.02)',metadata=print:file=${meta}" -an -f null -`);
  if (!existsSync(meta)) return null;
  const txt = readFileSync(meta, "utf8");
  try { unlinkSync(meta); } catch {}
  const hits = [];
  const re = /pts_time:([0-9.]+)[\s\S]*?scene_score=([0-9.]+)/g;
  let m; while ((m = re.exec(txt))) hits.push({ t: WIN_FROM + parseFloat(m[1]), score: parseFloat(m[2]) });
  hits.sort((a, b) => b.score - a.score);
  return hits.length ? hits[0] : null;
}

const dur = probeDur(inPath);
const hit = detectReveal(inPath);
if (!hit) { console.error(`✗ kein Reveal-Scene-Change in [${WIN_FROM},${WIN_TO}]s`); process.exit(3); }
const reveal = hit.t;
const delta = TARGET - reveal;
console.log(`═══ T4 Reveal-Anker: ${inPath} ═══`);
console.log(`  Reveal @${reveal.toFixed(3)}s (score ${hit.score.toFixed(3)}) · SOLL ${TARGET}s · δ=${delta >= 0 ? "+" : ""}${delta.toFixed(3)}s`);

if (Math.abs(delta) <= TOL) {
  console.log(`  ✓ in Toleranz (±${TOL}s) — kein Eingriff.`);
  process.exit(0);
}

// LOKAL innerhalb [0, SEG_END] umverteilen; Rest [SEG_END, dur] bleibt 1:1.
// SEG_END ≥ dur → globaler Shift (Segment C entfällt, Trim aus dem Closing-Tail).
if (SEG_END > dur - 0.02) SEG_END = dur;
const global = SEG_END >= dur || noTrim;
const useC = !global; // Segment C nur im LOKALEN Modus
const cSeg = useC ? `[0:v]trim=${SEG_END.toFixed(3)}:${dur.toFixed(3)},setpts=PTS-STARTPTS[c];` : "";
const cLbl = useC ? "[c]" : "";
const nSeg = useC ? 3 : 2;
// CUT = sauberer Pre-Event-Frame (PRE davor). tpad klont DIESEN Frame, nicht den
// Event-Frame selbst — sonst bliebe der Szenenwechsel an der alten Stelle kleben.
const PRE = 0.07;
const tmp = join(tmpdir(), `t4anchored_${process.pid}.mp4`);
let fc;
if (delta > 0) {
  // Event zu früh: bis CUT halten + Freeze bis TARGET, dann ab CUT weiter (Event landet @TARGET+PRE).
  const cut = Math.max(0, reveal - PRE);
  // no-trim: b läuft bis dur (Video wächst, -shortest downstream richtet aus).
  const bEnd = noTrim ? dur : cut + (SEG_END - TARGET);
  fc =
    `[0:v]trim=0:${cut.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${(TARGET - cut).toFixed(3)}[a];` +
    `[0:v]trim=${cut.toFixed(3)}:${bEnd.toFixed(3)},setpts=PTS-STARTPTS[b];` +
    cSeg + `[a][b]${cLbl}concat=n=${nSeg}:v=1:a=0[v]`;
} else {
  // Event zu spät: den statischen Dwell VOR dem Event kürzen, sodass das Event exakt auf
  // TARGET fällt. a = [0, TARGET] (endet im Dashboard, da TARGET<reveal → sauberer Frame);
  // b = ab dem Event. bEnd respektiert no-trim/global (dur) bzw. lokal (SEG_END).
  const bEnd = noTrim ? dur : SEG_END;
  fc =
    `[0:v]trim=0:${TARGET.toFixed(3)},setpts=PTS-STARTPTS[a];` +
    `[0:v]trim=${reveal.toFixed(3)}:${bEnd.toFixed(3)},setpts=PTS-STARTPTS[b];` +
    cSeg + `[a][b]${cLbl}concat=n=${nSeg}:v=1:a=0[v]`;
}
const cmd = `ffmpeg -hide_banner -loglevel error -y -i "${inPath}" -filter_complex "${fc}" -map "[v]" -r 30 -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -movflags +faststart "${tmp}"`;
run(cmd);
if (!existsSync(tmp)) { console.error(`✗ ffmpeg-Anker fehlgeschlagen`); process.exit(1); }
renameSync(tmp, outPath);

const newDur = probeDur(outPath);
const v = detectReveal(outPath);
console.log(`  ✓ verankert → ${outPath}`);
console.log(`    Dauer ${dur.toFixed(2)}s → ${newDur.toFixed(2)}s (Δ${(newDur - dur).toFixed(2)}s) · Reveal jetzt @${v ? v.t.toFixed(3) : "?"}s`);
// Hartes Gate G_T4_REVEAL_T: nach dem Anker MUSS der Reveal auf 11,0±0,1s sitzen.
if (!v || Math.abs(v.t - TARGET) > TOL) {
  console.error(`✗ G_T4_REVEAL_T FAIL: Reveal @${v ? v.t.toFixed(3) : "?"}s ≠ ${TARGET}±${TOL}s`);
  process.exit(1);
}
console.log(`  ✅ G_T4_REVEAL_T PASS (@${v.t.toFixed(3)}s)`);
process.exit(0);
