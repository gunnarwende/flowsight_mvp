/**
 * generate_shot1_keyframe.mjs — Opening Shot 1: 3 Personen, Vor-Ort-Termin
 */
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadApiKey() {
  const envPath = path.resolve(__dirname, '../../../../../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
  if (!match) { console.error('❌ GEMINI_API_KEY not found'); process.exit(1); }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

const PROMPT = `Create a premium, photorealistic cinematic still frame for a Swiss business film.

Wide shot of a real on-site service appointment inside a clean, bright technical room at a customer's building. Three people are present:

Person 1 (foreground right): A technician in dark navy work polo and dark trousers, kneeling or crouching beside a technical installation on the wall. He is explaining something, gesturing toward the installation with one gloved hand. His black smartphone lies on top of his grey tool case on the floor beside him, screen dark. He is seen from the side, face partially visible in profile.

Person 2 (background left): A second technician or colleague in similar dark workwear, standing and working at a different point in the room. He is turned away, focused on his own task. Seen from behind.

Person 3 (foreground center-left): A customer, standing, listening to Person 1. Casual everyday clothes, light-colored top. Seen from the side or slightly from behind. Not a model, just a normal person. Arms crossed or one hand gesturing.

The room is a clean, bright technical service room in a Swiss residential or commercial building. Light-colored walls, good natural daylight from a window or door on the left. Not a bathroom. Not a kitchen. A neutral technical space that could belong to any building type. Some pipes or technical infrastructure visible on the wall, but not dominant. The room feels real, maintained, Swiss-standard.

Composition: wide enough to show all three people with space between them. The room has depth. Person 1 and Person 3 interact in the foreground. Person 2 works independently in the background. The tool case with the dark smartphone is clearly visible on the floor near Person 1. Upper portion of the frame has some breathing room.

Color: warm natural daylight, dark navy workwear anchoring the frame, light walls, subtle metallic tones from pipes or installation. Controlled, narrow palette.

Camera: eye-level or slightly elevated, observational, documentary. Not staged. Not posed. The three people look like they are in the middle of a real conversation and real work. No one looks at the camera.

This must feel like one frame from a premium Swiss documentary about a real service business. Not stock photography. Not an advertisement. Not staged. Three real people in a real work moment.

16:9 aspect ratio. Ultra-high realism. Restrained premium color. Exceptional photographic taste.`;

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');
  console.log('🎨 Generating Shot 1 keyframe (3 persons, on-site)...\n');

  const res = await ai.models.generateContent({
    model: 'nano-banana-pro-preview',
    contents: [{ parts: [{ text: PROMPT }] }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: '16:9' }
    }
  });

  const parts = res.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const outPath = path.join(__dirname, 'shot1_keyframe_3persons.jpg');
      fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
      console.log(`✅ shot1_keyframe_3persons.jpg (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
      console.log(`   ${outPath}`);
      return;
    }
  }
  for (const part of parts) {
    if (part.text) console.log('Text:', part.text.substring(0, 300));
  }
  console.error('❌ No image generated');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
