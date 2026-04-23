/**
 * build_animatic_v2.mjs — Cinematic Animatic with focus, zoom, transitions
 *
 * Each screen is a "stage" with internal camera movement:
 * - Push-in to focus areas
 * - Pull-out for overview
 * - Crossfades between chapters
 * - Voice sync
 *
 * Screen coordinates (1170x2532 @ 3x):
 * - S1: notification card center ~(585, 1400)
 * - S4: SMS bubble ~(400, 900)
 * - S5: Brunner case card ~(585, 1800), KPI area ~(585, 700)
 * - S6: case detail card ~(585, 900)
 * - S7: checkmark ~(585, 600), timeline ~(585, 1600)
 * - S8: stars ~(585, 1100)
 * - S9: tagline ~(585, 1800)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOICE_DIR = path.join(__dirname, 'voice');
const OUT_DIR = path.join(__dirname, 'animatic');
fs.mkdirSync(OUT_DIR, { recursive: true });

const FPS = 30;
const W = 1170;
const H = 2532;
// Output in 16:9 landscape for website video (1920x1080)
const OW = 1920;
const OH = 1080;

function getDuration(file) {
  return parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${file}"`, { encoding: 'utf-8' }).trim());
}

function run(cmd, label) {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 60000 });
    if (label) console.log(`  ✅ ${label}`);
  } catch (e) {
    console.error(`  ❌ ${label || 'command'}: ${e.stderr?.toString().substring(0, 300)}`);
    throw e;
  }
}

/**
 * Build a segment with zoompan on a mobile screen, placed on dark bg
 * The mobile screen is placed center on a 1920x1080 dark canvas
 * with zoom/pan to focus on specific areas
 */
function buildSegment(idx, opts) {
  const {
    screen, voiceFile, duration,
    startZoom, endZoom, // 1.0 = full screen visible, 2.0 = 2x zoom
    startY, endY, // vertical pan (0=top, 1=bottom) relative to screen
    label, darkOverlay = false
  } = opts;

  const screenPath = path.join(__dirname, screen);
  const segPath = path.join(OUT_DIR, `seg_${String(idx).padStart(2, '0')}.mp4`);
  const frames = Math.round(duration * FPS);

  // Calculate zoompan parameters
  // We place the phone screen (390px wide conceptually) centered on 1920x1080
  // First scale phone screen to fit height: 1080px tall = phone fills screen vertically
  const phoneScale = OH / H; // ~0.427
  const phoneW = Math.round(W * phoneScale); // ~500px
  const phoneH = OH; // 1080px

  // Zoompan on the source image, then scale to output
  // zoom: pzoom interpolates from startZoom to endZoom
  const zoomStart = startZoom || 1.0;
  const zoomEnd = endZoom || 1.0;
  const yStart = (startY || 0.5) * H;
  const yEnd = (endY || 0.5) * H;

  // zoompan expression for smooth animation
  const zExpr = `${zoomStart}+(${zoomEnd}-${zoomStart})*on/${frames}`;
  const yExpr = `${yStart}+(${yEnd}-${yStart})*on/${frames}-(ih/zoom/2)`;
  const xExpr = `(iw/2)-(iw/zoom/2)`;

  // Build filter: zoompan on source → scale to phone size → pad onto dark bg
  const filter = [
    `[0:v]zoompan=z='${zExpr}':x='${xExpr}':y='max(0,${yExpr})':d=${frames}:s=${W}x${H}:fps=${FPS}`,
    `scale=${phoneW}:${phoneH}`,
    darkOverlay ? `colorbalance=bs=-0.1:bm=-0.1:bh=-0.05` : null,
    `pad=${OW}:${OH}:(${OW}-${phoneW})/2:0:color=0x0a0f1a`,
    `setsar=1`,
  ].filter(Boolean).join(',');

  let cmd;
  if (voiceFile && fs.existsSync(path.join(VOICE_DIR, voiceFile))) {
    const vPath = path.join(VOICE_DIR, voiceFile);
    // Image + voice, pad audio to match duration
    cmd = `ffmpeg -y -loop 1 -i "${screenPath}" -i "${vPath}" ` +
      `-filter_complex "${filter}[v];[1:a]apad=pad_dur=${duration}[a]" ` +
      `-map "[v]" -map "[a]" ` +
      `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k ` +
      `-t ${duration.toFixed(2)} "${segPath}"`;
  } else {
    // Image + silence
    cmd = `ffmpeg -y -loop 1 -i "${screenPath}" -f lavfi -i anullsrc=r=44100:cl=stereo ` +
      `-filter_complex "${filter}[v]" ` +
      `-map "[v]" -map 1:a ` +
      `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k ` +
      `-t ${duration.toFixed(2)} "${segPath}"`;
  }

  run(cmd, `${label} (${duration.toFixed(1)}s)`);
  return segPath;
}

function main() {
  console.log('🎬 Building Animatic v2 — Cinematic Focus + Transitions\n');

  const segments = [];

  // ═══════════════════════════════════════════════════
  // K1: Verlorene Eingänge (0–8.3s)
  // Start: full lockscreen. Push in to notification card.
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(1, {
    screen: 'S1_notification.png',
    voiceFile: 'scratch_K1_verlust.mp3',
    duration: 8.3,
    startZoom: 1.0, endZoom: 1.8,
    startY: 0.45, endY: 0.58,
    label: 'K1 — Push in to notification (loss)'
  }));

  // ═══════════════════════════════════════════════════
  // K2a: Auffangen — Wizard (customer side, 4s)
  // Show the wizard briefly — one way in
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(2, {
    screen: 'S2_wizard.png',
    voiceFile: 'scratch_K2_auffangen.mp3',
    duration: 5.0,
    startZoom: 1.2, endZoom: 1.5,
    startY: 0.35, endY: 0.45,
    label: 'K2a — Wizard (customer entry point)'
  }));

  // ═══════════════════════════════════════════════════
  // K2b: Auffangen — Manual Entry (team side, 3.5s)
  // Another way in — team captures directly
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(3, {
    screen: 'S3_manual_entry.png',
    voiceFile: null,
    duration: 3.5,
    startZoom: 1.3, endZoom: 1.6,
    startY: 0.55, endY: 0.60,
    label: 'K2b — Manual entry (team captures)'
  }));

  // ═══════════════════════════════════════════════════
  // K2c: Auffangen — Leitzentrale shows Brunner arrived (5s)
  // All paths lead here: "Kein Eingang geht mehr unter."
  // Push in on Brunner's "Neu" badge
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(4, {
    screen: 'S5_leitzentrale.png',
    voiceFile: null,
    duration: 5.0,
    startZoom: 1.0, endZoom: 1.5,
    startY: 0.55, endY: 0.65,
    label: 'K2c — Leitzentrale: Brunner arrived (Neu)'
  }));

  // ═══════════════════════════════════════════════════
  // K3: Kunde spürt Verbindlichkeit (8.7s)
  // SMS confirmation. Push in on the message.
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(5, {
    screen: 'S4_sms.png',
    voiceFile: 'scratch_K3_kunde.mp3',
    duration: 8.7,
    startZoom: 1.0, endZoom: 1.6,
    startY: 0.30, endY: 0.38,
    label: 'K3 — SMS confirmation (customer verbindlichkeit)'
  }));

  // ═══════════════════════════════════════════════════
  // K4a: Verwandlung — from Notification to Case Detail (18.2s)
  // THE HEART: Start on notification (the signal), transition to case detail (the order)
  // Part 1: Hold notification zoomed in (4s)
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(6, {
    screen: 'S1_notification.png',
    voiceFile: 'scratch_K4a_verwandlung.mp3',
    duration: 6.0,
    startZoom: 1.8, endZoom: 1.8,
    startY: 0.58, endY: 0.58,
    label: 'K4a-1 — Notification held (the signal)',
    darkOverlay: true
  }));

  // K4a Part 2: Case Detail — the ordered case (12.2s)
  // Push in from overview to detail, showing all structured data
  segments.push(buildSegment(7, {
    screen: 'S6_case_detail.png',
    voiceFile: null,
    duration: 12.2,
    startZoom: 1.0, endZoom: 1.4,
    startY: 0.30, endY: 0.42,
    label: 'K4a-2 — Case Detail: the ordered case (TRANSFORMATION)'
  }));

  // ═══════════════════════════════════════════════════
  // K4b: Betrieb führt (14.4s)
  // Pull back to Leitzentrale — Brunner among others
  // Then push into the einsatz/assignment area
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(8, {
    screen: 'S5_leitzentrale.png',
    voiceFile: 'scratch_K4b_fuehrung.mp3',
    duration: 8.0,
    startZoom: 1.5, endZoom: 1.0,
    startY: 0.65, endY: 0.50,
    label: 'K4b-1 — Leitzentrale: Brunner in context (pull back)'
  }));

  // K4b Part 2: Back to case detail — assignment visible
  segments.push(buildSegment(9, {
    screen: 'S6_case_detail.png',
    voiceFile: null,
    duration: 6.4,
    startZoom: 1.2, endZoom: 1.6,
    startY: 0.60, endY: 0.72,
    label: 'K4b-2 — Assignment: Gerber, 10:30, Route'
  }));

  // ═══════════════════════════════════════════════════
  // K5: Erledigt (9.9s)
  // Push in on checkmark, then timeline
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(10, {
    screen: 'S7_case_done.png',
    voiceFile: 'scratch_K5_erledigt.mp3',
    duration: 5.0,
    startZoom: 1.0, endZoom: 1.5,
    startY: 0.30, endY: 0.30,
    label: 'K5-1 — Checkmark: Fall abgeschlossen'
  }));

  // K5 Part 2: Timeline
  segments.push(buildSegment(11, {
    screen: 'S7_case_done.png',
    voiceFile: null,
    duration: 4.9,
    startZoom: 1.3, endZoom: 1.6,
    startY: 0.60, endY: 0.68,
    label: 'K5-2 — Timeline: erstellt → geplant → erledigt'
  }));

  // ═══════════════════════════════════════════════════
  // K6: Bewertung (8.2s)
  // Start on "Bewertung anfragen" button, transition to review surface
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(12, {
    screen: 'S7_case_done.png',
    voiceFile: 'scratch_K6_bewertung.mp3',
    duration: 3.0,
    startZoom: 1.6, endZoom: 1.8,
    startY: 0.82, endY: 0.85,
    label: 'K6-1 — "Bewertung anfragen" button focus'
  }));

  // K6 Part 2: Review surface — 5 stars
  segments.push(buildSegment(13, {
    screen: 'S8_review.png',
    voiceFile: null,
    duration: 5.2,
    startZoom: 1.0, endZoom: 1.4,
    startY: 0.40, endY: 0.48,
    label: 'K6-2 — Review: 5 Sterne, Kreisschluss'
  }));

  // ═══════════════════════════════════════════════════
  // K7: Founder-Closer placeholder (8s)
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(14, {
    screen: 'S9_system_totale.png',
    voiceFile: null,
    duration: 8.0,
    startZoom: 1.0, endZoom: 1.2,
    startY: 0.65, endY: 0.70,
    label: 'K7 — Founder-Closer (placeholder)'
  }));

  // ═══════════════════════════════════════════════════
  // CTA (3s)
  // ═══════════════════════════════════════════════════
  segments.push(buildSegment(15, {
    screen: 'S9_system_totale.png',
    voiceFile: null,
    duration: 3.0,
    startZoom: 1.2, endZoom: 1.2,
    startY: 0.70, endY: 0.70,
    label: 'CTA — System Totale held'
  }));

  console.log('\n📦 Concatenating with crossfades...');

  // Build crossfade chain
  // Each segment gets 0.3s xfade with the next
  const XFADE = 0.3;
  let filterComplex = '';
  let inputArgs = '';
  let currentStream = '[0:v]';
  let audioStreams = [];
  let offset = 0;

  for (let i = 0; i < segments.length; i++) {
    inputArgs += ` -i "${segments[i]}"`;
    audioStreams.push(`[${i}:a]`);
  }

  // Video: chain xfades
  // [0:v][1:v]xfade=transition=fade:duration=0.3:offset=X[v01]; ...
  let prevDur = 0;
  for (let i = 0; i < segments.length; i++) {
    const dur = getDuration(segments[i]);
    if (i === 0) {
      prevDur = dur;
      currentStream = `[0:v]`;
      continue;
    }

    offset = prevDur - XFADE;
    const outLabel = i < segments.length - 1 ? `[v${i}]` : `[vout]`;
    filterComplex += `${currentStream}[${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${offset.toFixed(2)}${outLabel};`;
    currentStream = outLabel;
    prevDur = offset + getDuration(segments[i]);
  }

  if (segments.length === 1) {
    filterComplex = '[0:v]copy[vout];';
  }

  // Audio: concat all
  filterComplex += audioStreams.join('') + `concat=n=${segments.length}:v=0:a=1[aout]`;

  const finalPath = path.join(OUT_DIR, 'ANIMATIC_v2.mp4');

  const cmd = `ffmpeg -y${inputArgs} -filter_complex "${filterComplex}" ` +
    `-map "[vout]" -map "[aout]" ` +
    `-c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k ` +
    `"${finalPath}"`;

  run(cmd, 'ANIMATIC_v2.mp4');

  const sizeMB = (fs.statSync(finalPath).size / 1024 / 1024).toFixed(1);
  const finalDur = getDuration(finalPath);
  console.log(`\n✅ ANIMATIC_v2.mp4 (${sizeMB} MB, ${finalDur.toFixed(1)}s)`);
  console.log(`   ${finalPath}\n`);
}

main();
