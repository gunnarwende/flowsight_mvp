/**
 * generate_opening.mjs — Opening Prototyp: Keyframe + 2 Veo Shots
 *
 * Step 1: Generate Marco-Hands keyframe via Nano Banana
 * Step 2: Generate Shot 1 (work) and Shot 2 (phone lights up) via Veo I2V
 * Step 3: Extract frames for review
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'opening');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Model config — switch to GA when available
const IMAGE_MODEL = 'nano-banana-pro-preview';
const VIDEO_MODEL = 'veo-3.1-generate-preview';
// GA alternatives (uncomment when available):
// const VIDEO_MODEL = 'veo-3.1-generate-001';

function loadApiKey() {
  const envPath = path.resolve(__dirname, '../../../../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
  if (!match) { console.error('❌ GEMINI_API_KEY not found'); process.exit(1); }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

// ═══════════════════════════════════════
// STEP 1: Marco-Hands Keyframe
// ═══════════════════════════════════════

const KEYFRAME_PROMPT = `Create a premium, photorealistic cinematic still frame.

A skilled technician's hands working on brass pipe fittings in a bright modern Swiss bathroom. Close-up framing: only forearms, gloved hands, tools, and pipes visible. No face, no torso above elbows.

The hands wear grey knit work gloves with black rubber grip on the fingers. The right hand holds a chrome combination wrench, tightening a brass compression fitting on a copper pipe. The left hand steadies the pipe. A short section of grey foam pipe insulation is pulled back, exposing bright copper.

A black smartphone lies on a small warm oak shelf nearby, screen completely dark and off.

The setting is a real Swiss residential bathroom: warm grey stone-look floor tiles, white wall tiles, natural daylight from the left. A white ceramic wall-mounted washbasin is partially visible above, providing context. A roll of white thread seal tape sits near the work area.

Composition: hands and brass fitting sharp in the center. Smartphone and shelf in the lower-left third. Upper area has calm wall surface for breathing room. Everything in the central safe zone for 16:9 crop.

Depth of field: moderately shallow. Hands tack sharp, surroundings softly falling off.

Color: warm brass and copper tones in focus, cool white tiles around, dark navy sleeve fabric on the right. Narrow controlled palette.

This must feel like a frame from a Swiss documentary film. Not stock. Not catalog. Not advertisement. Real, quiet, precise, premium.

16:9 aspect ratio. Ultra-high realism. Exceptional photographic taste.`;

// ═══════════════════════════════════════
// STEP 2: Veo Shots
// ═══════════════════════════════════════

const SHOT_1_PROMPT = `The gloved hands work steadily on the brass fitting, making small precise turns with the chrome wrench. Focused, deliberate, unhurried movements. The copper pipe is held firmly. The smartphone on the oak shelf remains dark and still. Natural daylight, calm atmosphere. Camera holds very still with only the subtlest forward drift. Documentary, real, quiet. 5 seconds.`;

const SHOT_2_PROMPT = `Continuing the same scene. The gloved hands keep working on the brass fitting without pause. Around second 2, the smartphone on the oak shelf activates — the screen glows with a warm light for about 3 seconds. The hands never stop, never pause, never react to the phone. The work continues as if the phone didn't light up. Then the screen dims back to dark. Camera holds steady. Same lighting, same calm atmosphere. 5 seconds.`;

async function generateKeyframe(ai, apiKey) {
  console.log('\n🎨 STEP 1: Generating Marco-Hands keyframe...');

  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ parts: [{ text: KEYFRAME_PROMPT }] }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: '16:9' }
    }
  });

  const parts = res.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const outPath = path.join(OUT_DIR, 'keyframe_marco_hands.jpg');
      fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
      console.log(`   ✅ keyframe_marco_hands.jpg (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
      return outPath;
    }
  }
  throw new Error('No image in keyframe response');
}

async function generateShot(ai, apiKey, keyframePath, prompt, shotName) {
  console.log(`\n🎬 Generating ${shotName}...`);
  const imageBase64 = fs.readFileSync(keyframePath).toString('base64');

  let operation = await ai.models.generateVideos({
    model: VIDEO_MODEL,
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: 'image/jpeg',
    },
    config: {
      aspectRatio: '16:9',
      resolution: '1080p',
      numberOfVideos: 1,
      personGeneration: 'allow_adult',
    },
  });

  console.log(`   ⏳ Operation: ${operation.name}`);

  let attempts = 0;
  while (!operation.done && attempts < 60) {
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
    operation = await ai.operations.getVideosOperation({ operation });
    process.stdout.write(`\r   ⏳ (${attempts}/60)`);
  }

  if (!operation.done) throw new Error('Timeout');
  if (operation.error) throw new Error(JSON.stringify(operation.error));

  const videos = operation.response?.generatedVideos || [];
  if (!videos.length) throw new Error('No video generated');

  const video = videos[0].video;
  const outPath = path.join(OUT_DIR, `${shotName}.mp4`);

  if (video.uri) {
    console.log(`\n   📥 Downloading...`);
    const res = await fetch(video.uri, { headers: { 'x-goog-api-key': apiKey } });
    fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  } else if (video.videoBytes) {
    fs.writeFileSync(outPath, video.videoBytes);
  }

  console.log(`\n   ✅ ${shotName}.mp4 (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
  return outPath;
}

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');

  // Step 1: Keyframe
  const keyframePath = await generateKeyframe(ai, apiKey);

  // Step 2: Two shots from same keyframe
  const shot1Path = await generateShot(ai, apiKey, keyframePath, SHOT_1_PROMPT, 'shot_1_work');
  const shot2Path = await generateShot(ai, apiKey, keyframePath, SHOT_2_PROMPT, 'shot_2_notification');

  console.log('\n════════════════════════════════════');
  console.log('📊 Opening Prototyp Assets:');
  console.log(`  🖼️  ${keyframePath}`);
  console.log(`  🎬 ${shot1Path}`);
  console.log(`  🎬 ${shot2Path}`);
  console.log('════════════════════════════════════');
  console.log('\nNext: Remotion overlay + Voice + Assembly');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
