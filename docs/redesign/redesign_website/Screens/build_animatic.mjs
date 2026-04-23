/**
 * build_animatic.mjs — Animatic v1: Voice + Screen-Stills + Timing
 *
 * Combines scratch voice segments with screen stills into a rough animatic.
 * Each chapter: screen image held for voice duration + breathing room.
 * No motion, no transitions yet — pure timing test.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOICE_DIR = path.join(__dirname, 'voice');

// Chapter mapping: voice file → screen image → hold time after voice
const CHAPTERS = [
  { voice: 'scratch_K1_verlust.mp3',      screen: 'S1_notification.png', holdAfter: 0.5, label: 'K1 — Verlorene Eingänge' },
  { voice: 'scratch_K2_auffangen.mp3',     screen: 'S5_leitzentrale.png', holdAfter: 2.0, label: 'K2 — Eingang aufgefangen' },
  { voice: 'scratch_K3_kunde.mp3',         screen: 'S4_sms.png',          holdAfter: 5.0, label: 'K3 — Kunde spürt Verbindlichkeit' },
  { voice: 'scratch_K4a_verwandlung.mp3',  screen: 'S6_case_detail.png',  holdAfter: 1.0, label: 'K4a — Aus Eingang wird Fall' },
  { voice: 'scratch_K4b_fuehrung.mp3',     screen: 'S5_leitzentrale.png', holdAfter: 5.0, label: 'K4b — Betrieb führt' },
  { voice: 'scratch_K5_erledigt.mp3',      screen: 'S7_case_done.png',    holdAfter: 3.0, label: 'K5 — Erledigt' },
  { voice: 'scratch_K6_bewertung.mp3',     screen: 'S8_review.png',       holdAfter: 5.0, label: 'K6 — Bewertung' },
  // Founder-Closer: silence + System Totale (placeholder for real video)
  { voice: null,                            screen: 'S9_system_totale.png', holdAfter: 8.0, label: 'K7 — Founder-Closer (placeholder)' },
  // CTA Frame
  { voice: null,                            screen: 'S9_system_totale.png', holdAfter: 3.0, label: 'CTA' },
];

function getDuration(file) {
  const result = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${file}"`, { encoding: 'utf-8' });
  return parseFloat(result.trim());
}

function main() {
  console.log('🎬 Building Animatic v1...\n');

  const outDir = path.join(__dirname, 'animatic');
  fs.mkdirSync(outDir, { recursive: true });

  // Build concat list and combined audio
  const segments = [];
  let totalDuration = 0;

  for (const ch of CHAPTERS) {
    const screenPath = path.join(__dirname, ch.screen);
    if (!fs.existsSync(screenPath)) {
      console.error(`❌ Screen not found: ${ch.screen}`);
      continue;
    }

    let voiceDuration = 0;
    if (ch.voice) {
      const voicePath = path.join(VOICE_DIR, ch.voice);
      if (!fs.existsSync(voicePath)) {
        console.error(`❌ Voice not found: ${ch.voice}`);
        continue;
      }
      voiceDuration = getDuration(voicePath);
    }

    const chapterDuration = voiceDuration + ch.holdAfter;
    totalDuration += chapterDuration;

    segments.push({
      ...ch,
      voiceDuration,
      chapterDuration,
      startTime: totalDuration - chapterDuration,
    });

    console.log(`  ${ch.label.padEnd(40)} ${voiceDuration.toFixed(1)}s voice + ${ch.holdAfter}s hold = ${chapterDuration.toFixed(1)}s`);
  }

  console.log(`\n  Total: ${totalDuration.toFixed(1)}s\n`);

  // Step 1: Build video segments (image → video for each chapter)
  const videoSegments = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segFile = path.join(outDir, `seg_${i}.mp4`);

    if (seg.voice) {
      const voicePath = path.join(VOICE_DIR, seg.voice);
      // Image + audio → video segment
      execSync(
        `ffmpeg -y -loop 1 -i "${path.join(__dirname, seg.screen)}" -i "${voicePath}" ` +
        `-c:v libx264 -tune stillimage -c:a aac -b:a 192k ` +
        `-t ${seg.chapterDuration.toFixed(2)} -pix_fmt yuv420p -vf "scale=1170:2532,setsar=1" ` +
        `-shortest "${segFile}"`,
        { stdio: 'pipe' }
      );
    } else {
      // Image only (silence) → video segment
      execSync(
        `ffmpeg -y -loop 1 -i "${path.join(__dirname, seg.screen)}" ` +
        `-f lavfi -i anullsrc=r=44100:cl=stereo ` +
        `-c:v libx264 -tune stillimage -pix_fmt yuv420p -vf "scale=1170:2532,setsar=1" ` +
        `-c:a aac -b:a 192k -t ${seg.chapterDuration.toFixed(2)} ` +
        `-shortest "${segFile}"`,
        { stdio: 'pipe' }
      );
    }
    videoSegments.push(segFile);
  }

  // Step 2: Concat all segments
  const concatList = path.join(outDir, 'concat.txt');
  fs.writeFileSync(concatList, videoSegments.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const finalPath = path.join(outDir, 'ANIMATIC_v1.mp4');
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -crf 20 -c:a aac -b:a 192k "${finalPath}"`,
    { stdio: 'pipe' }
  );

  const sizeMB = (fs.statSync(finalPath).size / 1024 / 1024).toFixed(1);
  const finalDur = getDuration(finalPath);

  console.log(`✅ ANIMATIC_v1.mp4 (${sizeMB} MB, ${finalDur.toFixed(1)}s)`);
  console.log(`   ${finalPath}`);
}

main();
