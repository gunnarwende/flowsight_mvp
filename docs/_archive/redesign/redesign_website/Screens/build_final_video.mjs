/**
 * build_final_video.mjs — Complete Voice-Driven Visual Experience
 *
 * Scene 1: Panoramic "world without Leitsystem" with zoom choreography
 * Transition: Panorama → S1 Notification (the catch moment)
 * Scene 2: Screen choreography S1→S4→S5→S6→S7→S8→S9
 * Audio: Helmut turbo long voice (134.5s)
 *
 * Step 1: Generate panorama
 * Step 2: Build zoom segments
 * Step 3: Build screen segments
 * Step 4: Assemble with voice
 */

import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'final_video');
fs.mkdirSync(OUT, { recursive: true });

const VOICE = path.join(__dirname, 'voice_final', 'helmut_lang_v4_turbo_clean.mp3');
const SCREENS = __dirname; // S1-S9 PNGs are here

function loadApiKey() {
  const envPath = path.resolve(__dirname, '../../../../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
  if (!match) { console.error('❌ GEMINI_API_KEY not found'); process.exit(1); }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

function run(cmd, label) {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });
    if (label) console.log(`  ✅ ${label}`);
  } catch (e) {
    console.error(`  ❌ ${label}: ${e.stderr?.toString().substring(0, 400)}`);
    throw e;
  }
}

// ═══════════════════════════════════════════════
// STEP 1: Generate Panorama Image
// ═══════════════════════════════════════════════

const PANORAMA_PROMPT = `Create a premium, photorealistic ultra-wide cinematic panoramic image showing the daily reality of a Swiss trades business — the moment where everything happens at once and nobody can take a new incoming request.

This is ONE single wide image showing THREE simultaneous situations in the same Swiss neighborhood:

LEFT THIRD — THE CONSTRUCTION SITE:
Two technicians in dark navy workwear are working at a residential building entrance. One is crouching at an open technical panel, hands full with tools and components. The other carries materials. They are focused and physically occupied. A white delivery van with Swiss plates is parked nearby. Morning light. Real Swiss residential architecture — clean, well-maintained apartment building.

CENTER — THE OFFICE / BUSINESS:
Through a ground-floor window or glass door of a small office, we see a person at a desk, on the phone, papers in front of them. They are already occupied with something else. The office is modest, real, Swiss — not corporate. A small sign or logo area suggests this is the business headquarters.

RIGHT THIRD — FRAU BRUNNER:
A woman (35-50, casual everyday clothes, light-colored top) stands on the sidewalk or in front of her apartment entrance. She holds her smartphone to her ear, waiting. Her expression is patient but uncertain — she is calling the business, but nobody is picking up. She is not angry, not dramatic — just a customer who needs help and is not getting through right now.

THE CONNECTING ELEMENT:
A quiet Swiss residential street connects all three scenes. Trees, clean sidewalks, typical Zurich-area architecture. Morning or late morning light, warm but not dramatic. The street creates visual flow from left to right.

IMPORTANT ATMOSPHERE:
This is NOT chaos. This is NOT a comedy. This is the quiet, real, daily truth of a trades business where three things happen at the same time and the next incoming request simply cannot be taken right now. Professional people doing their best, but stretched thin.

STYLE:
Premium Swiss documentary photography. Wide cinematic composition. Warm natural daylight. Muted, controlled color palette — navy workwear, warm stone facades, green trees, light sidewalks. No bright colors, no neon, no advertising aesthetic. The image must feel expensive through taste, not through effects.

ABSOLUTELY FORBIDDEN:
No cartoon style. No illustration. No infographic. No split-screen effect. No text overlays. No logos. No obvious AI artifacts. No American suburban look. No glossy commercial feel. No stock photography aesthetic. No exaggerated expressions. No Hollywood drama.

This must look like one continuous photograph of a real Swiss street, taken by a premium documentary photographer. Every person, every building, every detail must feel real and Swiss.

16:9 aspect ratio. Ultra-high photorealism. Exceptional taste. Premium quality.`;

async function generatePanorama(ai) {
  console.log('\n🎨 STEP 1: Generating panorama image...');

  // Generate 3 variants
  for (let i = 1; i <= 3; i++) {
    console.log(`  Variant ${i}/3...`);
    try {
      const res = await ai.models.generateContent({
        model: 'nano-banana-pro-preview',
        contents: [{ parts: [{ text: PANORAMA_PROMPT }] }],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio: '16:9' }
        }
      });

      const parts = res.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const outPath = path.join(OUT, `panorama_v${i}.jpg`);
          fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`  ✅ panorama_v${i}.jpg (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
          break;
        }
      }
    } catch (err) {
      console.error(`  ❌ Variant ${i}: ${err.message}`);
    }
  }
}

// ═══════════════════════════════════════════════
// STEP 2: Build zoom segments from panorama
// ═══════════════════════════════════════════════

function buildZoomSegments(panoramaPath) {
  console.log('\n🎬 STEP 2: Building zoom segments from panorama...');

  const W = 1920, H = 1080; // Output size
  const FPS = 30;

  // Zoom choreography: each segment zooms to a different area
  // Coordinates are relative to the source image (which is 16:9)
  // zoom=1.0 = full image, zoom=2.0 = 2x crop
  const segments = [
    // 0-8s: Wide establishing shot, very slow push in
    { id: 'z1_wide', dur: 8, zStart: 1.0, zEnd: 1.15, xStart: 0.5, xEnd: 0.5, yStart: 0.5, yEnd: 0.5 },
    // 8-18s: Zoom to right — Frau Brunner calling, nobody picks up
    { id: 'z2_brunner', dur: 10, zStart: 1.15, zEnd: 1.8, xStart: 0.5, xEnd: 0.75, yStart: 0.5, yEnd: 0.5 },
    // 18-28s: Pan to left — construction site, technicians busy
    { id: 'z3_baustelle', dur: 10, zStart: 1.8, zEnd: 1.8, xStart: 0.75, xEnd: 0.25, yStart: 0.5, yEnd: 0.5 },
    // 28-35s: Pan to center — office, person on phone
    { id: 'z4_buero', dur: 7, zStart: 1.8, zEnd: 1.6, xStart: 0.25, xEnd: 0.5, yStart: 0.5, yEnd: 0.45 },
    // 35-42s: Slow zoom out — "die Unruhe die Kraft kostet" — the whole picture
    { id: 'z5_pullback', dur: 7, zStart: 1.6, zEnd: 1.0, xStart: 0.5, xEnd: 0.5, yStart: 0.45, yEnd: 0.5 },
    // 42-52s: Hold wide with very subtle drift — transition zone
    { id: 'z6_hold', dur: 10, zStart: 1.0, zEnd: 1.05, xStart: 0.5, xEnd: 0.5, yStart: 0.5, yEnd: 0.5 },
  ];

  for (const seg of segments) {
    const frames = seg.dur * FPS;
    const outPath = path.join(OUT, `${seg.id}.mp4`);

    // zoompan expressions
    const z = `${seg.zStart}+(${seg.zEnd}-${seg.zStart})*on/${frames}`;
    const x = `(${seg.xStart}+(${seg.xEnd}-${seg.xStart})*on/${frames})*iw-(iw/zoom/2)`;
    const y = `(${seg.yStart}+(${seg.yEnd}-${seg.yStart})*on/${frames})*ih-(ih/zoom/2)`;

    const filter = `zoompan=z='${z}':x='max(0,min(iw-iw/zoom,${x}))':y='max(0,min(ih-ih/zoom,${y}))':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p`;

    run(
      `ffmpeg -y -loop 1 -i "${panoramaPath}" -filter_complex "${filter}" -c:v libx264 -preset fast -crf 20 -t ${seg.dur} -an "${outPath}"`,
      `${seg.id} (${seg.dur}s)`
    );
  }
}

// ═══════════════════════════════════════════════
// STEP 3: Build screen segments (Scene 2)
// ═══════════════════════════════════════════════

function buildScreenSegments() {
  console.log('\n🎬 STEP 3: Building screen segments (Scene 2)...');

  const W = 1920, H = 1080;
  const FPS = 30;

  // Phone screen dimensions on dark canvas
  const phoneW = Math.round(H * 0.85 * (390/844)); // ~430px
  const phoneH = Math.round(H * 0.85); // ~918px
  const phoneX = Math.round((W - phoneW) / 2);
  const phoneY = Math.round((H - phoneH) / 2);

  // Screen segments with zoom focus areas (relative to phone screen)
  const screens = [
    // 52-60s: S1 Notification (the CATCH moment) → S4 SMS
    { id: 'sc1_notification', screen: 'S1_notification.png', dur: 4,
      zStart: 1.0, zEnd: 1.3, yStart: 0.45, yEnd: 0.55 },
    { id: 'sc2_sms', screen: 'S4_sms.png', dur: 4,
      zStart: 1.0, zEnd: 1.3, yStart: 0.30, yEnd: 0.38 },

    // 60-72s: S5 Leitzentrale → S6 Case Detail
    { id: 'sc3_leitzentrale', screen: 'S5_leitzentrale.png', dur: 6,
      zStart: 1.0, zEnd: 1.2, yStart: 0.50, yEnd: 0.60 },
    { id: 'sc4_case_detail', screen: 'S6_case_detail.png', dur: 6,
      zStart: 1.0, zEnd: 1.3, yStart: 0.30, yEnd: 0.45 },

    // 72-82s: S7 Case Done
    { id: 'sc5_done', screen: 'S7_case_done.png', dur: 10,
      zStart: 1.0, zEnd: 1.2, yStart: 0.35, yEnd: 0.55 },

    // 82-90s: S8 Review
    { id: 'sc6_review', screen: 'S8_review.png', dur: 8,
      zStart: 1.0, zEnd: 1.3, yStart: 0.35, yEnd: 0.45 },

    // 90-100s: S9 System Totale
    { id: 'sc7_totale', screen: 'S9_system_totale.png', dur: 10,
      zStart: 1.0, zEnd: 1.1, yStart: 0.55, yEnd: 0.60 },
  ];

  for (const sc of screens) {
    const screenPath = path.join(SCREENS, sc.screen);
    if (!fs.existsSync(screenPath)) {
      console.error(`  ❌ Screen not found: ${sc.screen}`);
      continue;
    }

    const frames = sc.dur * FPS;
    const outPath = path.join(OUT, `${sc.id}.mp4`);

    // Scale phone screen and place on navy background with zoompan
    const z = `${sc.zStart}+(${sc.zEnd}-${sc.zStart})*on/${frames}`;
    const y = `(${sc.yStart}+(${sc.yEnd}-${sc.yStart})*on/${frames})*ih-(ih/zoom/2)`;

    const filter = [
      `scale=${phoneW}:${phoneH}`,
      `pad=${W}:${H}:${phoneX}:${phoneY}:color=0x111827`,
      `zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='max(0,min(ih-ih/zoom,${y}))':d=${frames}:s=${W}x${H}:fps=${FPS}`,
      `format=yuv420p`
    ].join(',');

    run(
      `ffmpeg -y -i "${screenPath}" -filter_complex "${filter}" -c:v libx264 -preset fast -crf 20 -t ${sc.dur} -an "${outPath}"`,
      `${sc.id} — ${sc.screen} (${sc.dur}s)`
    );
  }
}

// ═══════════════════════════════════════════════
// STEP 4: Assemble everything with transitions + voice
// ═══════════════════════════════════════════════

function assembleVideo() {
  console.log('\n📦 STEP 4: Assembling final video...');

  const segments = [
    // Scene 1: Panorama zooms
    'z1_wide', 'z2_brunner', 'z3_baustelle', 'z4_buero', 'z5_pullback', 'z6_hold',
    // Scene 2: Screens
    'sc1_notification', 'sc2_sms', 'sc3_leitzentrale', 'sc4_case_detail',
    'sc5_done', 'sc6_review', 'sc7_totale'
  ];

  // Concat with crossfades
  const XFADE = 0.4;
  let inputArgs = '';
  let filterParts = [];
  let prevStream = '[0:v]';
  let offset = 0;

  for (let i = 0; i < segments.length; i++) {
    const segPath = path.join(OUT, `${segments[i]}.mp4`);
    inputArgs += ` -i "${segPath}"`;

    if (i === 0) {
      const dur = parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${segPath}"`, { encoding: 'utf-8' }).trim());
      offset = dur;
      continue;
    }

    const dur = parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${segPath}"`, { encoding: 'utf-8' }).trim());

    // Special transition: panorama → screens (at z6_hold → sc1_notification)
    const transition = (segments[i] === 'sc1_notification') ? 'fadeblack' : 'fade';
    const fadeDur = (segments[i] === 'sc1_notification') ? 0.8 : XFADE;

    const outLabel = i < segments.length - 1 ? `[v${i}]` : `[vout]`;
    const actualOffset = (offset - fadeDur).toFixed(2);
    filterParts.push(`${prevStream}[${i}:v]xfade=transition=${transition}:duration=${fadeDur}:offset=${actualOffset}${outLabel}`);
    prevStream = outLabel;
    offset = parseFloat(actualOffset) + dur;
  }

  if (segments.length === 1) {
    filterParts.push('[0:v]copy[vout]');
  }

  const filterStr = filterParts.join(';');

  // First pass: video only
  const videoOnly = path.join(OUT, '_video_only.mp4');
  run(
    `ffmpeg -y${inputArgs} -filter_complex "${filterStr}" -map "[vout]" -c:v libx264 -preset slow -crf 18 -an "${videoOnly}"`,
    'Video assembled'
  );

  // Second pass: add voice audio
  const finalPath = path.join(OUT, 'FLOWSIGHT_FINAL.mp4');
  run(
    `ffmpeg -y -i "${videoOnly}" -i "${VOICE}" -c:v copy -c:a aac -b:a 192k -shortest "${finalPath}"`,
    'Audio added'
  );

  const sizeMB = (fs.statSync(finalPath).size / 1024 / 1024).toFixed(1);
  const dur = parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${finalPath}"`, { encoding: 'utf-8' }).trim());

  console.log(`\n✅ FLOWSIGHT_FINAL.mp4 (${sizeMB} MB, ${dur.toFixed(1)}s)`);
  console.log(`   ${finalPath}`);
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');
  console.log('🎬 Building FlowSight Final Video...\n');

  // Step 1: Generate panorama
  await generatePanorama(ai);

  console.log('\n📋 3 panorama variants generated.');
  console.log('   Please review and rename the best one to: panorama_final.jpg');
  console.log('   Then run: node build_final_video.mjs --assemble\n');

  // If --assemble flag, skip panorama generation and go straight to build
  if (process.argv.includes('--assemble')) {
    const panoramaPath = path.join(OUT, 'panorama_final.jpg');
    if (!fs.existsSync(panoramaPath)) {
      console.error('❌ panorama_final.jpg not found. Please select the best variant and rename it.');
      process.exit(1);
    }

    buildZoomSegments(panoramaPath);
    buildScreenSegments();
    assembleVideo();
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
