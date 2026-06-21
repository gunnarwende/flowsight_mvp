/**
 * generate_shot1_v3.mjs — Opening Shot 1 v3: Variant 3 refined
 * 3 corrections: customer more natural, smartphone more casual, Patrick more active
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

Wide shot of a real on-site service appointment inside a clean, bright technical room in a Swiss building. Three people are simultaneously occupied. Nobody is available. A moment of professional parallel load.

Person 1 — lead technician (foreground right): Crouching beside an open technical panel. His left hand holds a component inside the panel. His right hand reaches sideways for a tool. He turns his head toward the customer behind him, listening to a question while his hands stay locked in the task. Dark navy work polo, dark trousers, grey work gloves. His face is visible in three-quarter profile — attentive but physically unable to stop.

Person 2 — the customer (center, standing): Leaning slightly toward the technician, one hand gesturing openly as if explaining or asking about something on the installation. Not pointing with one finger, but using an open palm to indicate an area. Natural, conversational body language. Light casual shirt, chinos, everyday shoes. He clearly needs an answer right now.

Person 3 — second technician (background left): Actively working on a pipe or conduit on the wall. Both hands occupied — one steadying a section of pipe, the other adjusting a fitting or connection with a tool. Slightly hunched forward in concentration. Dark navy workwear matching Person 1. Clearly in the middle of something that cannot be paused.

On the floor beside Person 1: a grey tool case, slightly open. A black smartphone lies casually on the closed half of the lid — slightly angled, not perfectly centered. It looks like it was put down quickly, not arranged. Screen is dark. The phone is reachable but clearly not being attended to.

The room: bright, clean technical service room. Light grey or white walls. Natural daylight from a window on the left. Pipes along the upper walls. Some electrical or technical panels on the right wall. Clean floor. Not a bathroom, not a home interior. A professional service space in a Swiss residential or commercial building.

Atmosphere: not chaos, not emergency, not comedy. Just a real Tuesday morning where three professionals are each doing something that requires their full attention. The tension is quiet and real: if something new comes in right now, nobody can take it.

Composition: wide enough for all three with space between them. Person 1 and 2 interact in the right half. Person 3 works independently in the left half. The tool case with smartphone is on the floor in the lower-center area. Upper portion has breathing room.

Camera: slightly elevated, observational, documentary. Nobody looks at camera. Mid-moment, not posed.

Color: warm natural daylight, dark navy workwear, light walls, muted metal tones. Narrow palette.

This must feel like a frame from a premium Swiss documentary. Real people in a real work moment. Not stock. Not staged. Not artificial.

16:9. Ultra-high realism. Restrained premium color. Exceptional photographic taste.`;

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');
  console.log('🎨 Generating Shot 1 v3 (3 variants, refined)...\n');

  for (let i = 1; i <= 3; i++) {
    console.log(`  Variant ${i}/3...`);
    try {
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
          const outPath = path.join(__dirname, `shot1_v3_variant${i}.jpg`);
          fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`  ✅ shot1_v3_variant${i}.jpg (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
          break;
        }
      }
    } catch (err) {
      console.error(`  ❌ Variant ${i}: ${err.message}`);
    }
  }
  console.log('\n🎯 Done. Review variants.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
