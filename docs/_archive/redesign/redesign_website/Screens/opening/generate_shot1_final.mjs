/**
 * generate_shot1_final.mjs — Opening Shot 1 FINAL keyframe
 * Based on V2 with 3 corrections: Patrick gloves, all long-sleeve navy, warmer room, phone more prominent
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

Wide shot of a real on-site service appointment inside a bright technical room in a Swiss building. Three people are simultaneously occupied. Nobody is available.

Person 1 — lead technician (foreground right): Crouching beside an open technical panel on the right wall. His left hand holds a component inside the panel. He turns his head toward the customer behind him, listening while his hands stay locked in the task. He wears a dark navy long-sleeve polo and dark navy trousers. Grey knit work gloves with black rubber grip on both hands. His face is visible in three-quarter profile.

Person 2 — customer (center, standing): Leaning slightly toward the technician, one hand open in a conversational gesture, explaining or asking about the installation. Natural, relaxed posture. Light casual button-down shirt, beige chinos, everyday shoes. Not pointing, not lecturing — just a real conversation between two adults.

Person 3 — second technician (background left): Bent forward, actively working on a valve or fitting on a pipe along the left wall. Both hands occupied — one steadying the pipe, the other using a wrench or adjusting tool. He wears the same dark navy long-sleeve polo as Person 1, dark navy trousers, and grey knit work gloves. Concentrated, clearly mid-task.

The smartphone: A black smartphone lies prominently on the grey tool case in the lower-center foreground of the frame, closer to camera than the people. It is angled slightly, as if set down quickly. Screen completely dark. The phone is clearly visible and recognizable — it is in the foreground plane of the image, not hidden behind anything. The tool case is partially open with some tools visible.

The room: a bright technical service room. Walls are warm light grey with slight texture, not sterile hospital white. Natural daylight from a window on the left, creating warm directional light. Pipes and conduits along the upper walls. Technical panels on the right wall. Clean but lived-in floor — light grey, not glossy. The room feels real and maintained, not freshly painted or showroom-clean.

Atmosphere: professional simultaneous load. Three competent people, each fully occupied. If one more thing comes in, nobody can take it.

Composition: wide enough to show all three people clearly. Person 1 and Person 2 interact in the right half. Person 3 works in the left half. The tool case with the black smartphone sits in the lower-center foreground, prominent and clearly readable. Upper portion has breathing room for text.

Camera: slightly elevated, observational, documentary. Nobody looks at camera. Mid-moment, not posed.

Color: warm natural daylight, dark navy workwear on all technicians, warm grey walls, light floor, muted metallic tones. Controlled warm palette — not cold, not sterile.

This must feel like a frame from a premium Swiss documentary. Real, warm, professional, unstaged.

16:9. Ultra-high realism. Restrained premium color. Exceptional photographic taste.`;

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');
  console.log('🎨 Generating Shot 1 FINAL (3 variants)...\n');

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
          const outPath = path.join(__dirname, `shot1_FINAL_v${i}.jpg`);
          fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`  ✅ shot1_FINAL_v${i}.jpg (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
          break;
        }
      }
    } catch (err) {
      console.error(`  ❌ Variant ${i}: ${err.message}`);
    }
  }
  console.log('\n🎯 Done.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
