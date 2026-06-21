/**
 * generate_opening_shots.mjs — Shot 1 + Shot 2 from same keyframe via Veo I2V
 */
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEYFRAME = path.join(__dirname, 'shot1_FINAL_v2.jpg');
const MODEL = 'veo-3.1-generate-preview';

function loadApiKey() {
  const envPath = path.resolve(__dirname, '../../../../../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
  if (!match) { console.error('❌ GEMINI_API_KEY not found'); process.exit(1); }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

const SHOTS = [
  {
    id: 'opening_shot1',
    prompt: `The scene is alive with quiet professional activity. The crouching technician on the right works inside the electrical panel with both hands, occasionally turning his head to listen to the customer standing behind him. The customer gestures with an open hand, explaining something about the installation. In the background left, the second technician adjusts a valve on the wall pipes, focused and steady. All three are occupied. The smartphone on the tool case remains dark and still. Camera holds mostly steady with a very subtle slow drift. Natural daylight, documentary, real. 5 seconds.`
  },
  {
    id: 'opening_shot2',
    prompt: `Same scene continues. All three people remain in their positions, working and talking. Around second 1.5, the black smartphone on the tool case lights up — the screen glows with a warm light. The crouching technician notices it from the corner of his eye — his gaze drops briefly toward the phone for half a second, then returns to the customer. His hands never leave the panel. He does not reach for the phone. The customer keeps talking, unaware. The second technician in the background keeps working. The phone screen stays lit. Camera drifts very slowly downward and slightly toward the tool case, making the glowing phone gradually more prominent in the frame. 5 seconds.`
  }
];

async function generateShot(ai, apiKey, shot, imageBase64) {
  console.log(`\n🎬 ${shot.id}...`);

  let operation = await ai.models.generateVideos({
    model: MODEL,
    prompt: shot.prompt,
    image: { imageBytes: imageBase64, mimeType: 'image/jpeg' },
    config: {
      aspectRatio: '16:9',
      resolution: '1080p',
      numberOfVideos: 1,
      personGeneration: 'allow_adult',
    },
  });

  console.log(`   ⏳ ${operation.name}`);
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
  if (!videos.length) throw new Error('No video');

  const video = videos[0].video;
  const outPath = path.join(__dirname, `${shot.id}.mp4`);

  if (video.uri) {
    console.log(`\n   📥 Downloading...`);
    const res = await fetch(video.uri, { headers: { 'x-goog-api-key': apiKey } });
    fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  } else if (video.videoBytes) {
    fs.writeFileSync(outPath, video.videoBytes);
  }

  console.log(`   ✅ ${shot.id}.mp4 (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
  return outPath;
}

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');

  const imageBase64 = fs.readFileSync(KEYFRAME).toString('base64');
  console.log(`🖼️  Keyframe loaded (${Math.round(imageBase64.length * 0.75 / 1024)} KB)`);

  for (const shot of SHOTS) {
    await generateShot(ai, apiKey, shot, imageBase64);
  }

  console.log('\n🎯 Both opening shots generated from same keyframe.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
