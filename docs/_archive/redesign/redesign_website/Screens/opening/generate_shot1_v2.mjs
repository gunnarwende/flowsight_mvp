/**
 * generate_shot1_v2.mjs — Opening Shot 1 v2: More tension, all 3 bound
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

Wide shot of a real on-site service appointment inside a clean, bright technical room. Three people are visibly occupied at the same time. Nobody is idle. Nobody is available. This is a moment of simultaneous demand.

Person 1 — the lead technician (foreground right): Crouching beside an open technical panel on the wall. Both hands are inside the panel — one holding a component, the other reaching for a wrench. He is physically locked into the task. At the same time he turns his head slightly toward the customer behind him, because the customer is asking him something. He cannot let go. His grey tool case sits on the floor beside him with a black smartphone lying on top, screen dark.

Person 2 — the customer (center, standing): Leaning slightly forward toward the technician, pointing at something on the installation, clearly asking a question or requesting clarification. He needs the technician's attention right now. Light casual clothes, everyday appearance. Not a model.

Person 3 — the second technician (background left): Standing at a different section of the room, holding a testing device or measurement tool against a pipe or conduit on the wall. Focused, slightly tense posture. Both hands occupied. Turned away from the others. Clearly doing his own critical task.

The room: a bright, clean technical service room in a Swiss building. Light walls, clean floor, natural daylight from a window on the left side. Pipes and technical infrastructure along the upper walls. Not a bathroom, not a kitchen. A neutral service space. Well-maintained, Swiss-standard.

The mood is not chaos. It is professional simultaneous load. Three competent people, each bound by their current task. If one more thing comes in right now, nobody can take it. That is the tension.

Composition: wide enough to see all three people clearly with space between them. Person 1 and Person 2 interact in the foreground right. Person 3 works independently in the background left. The grey tool case with the black smartphone is visible on the floor. Enough headroom above.

The smartphone on the tool case must be clearly visible but not prominent. It is dark, lying flat, waiting. It is not the subject — the three occupied people are.

Color: warm natural daylight, dark navy workwear, light walls, muted metallic tones. Controlled palette.

Camera: slightly elevated eye-level, observational, documentary. Nobody looks at camera. The scene feels caught mid-moment, not posed.

This must feel like a frame from a high-end Swiss documentary. Real people. Real work. Real load. Not stock. Not staged. Not artificial.

16:9. Ultra-high realism. Restrained premium color. Exceptional taste.`;

async function main() {
  const apiKey = loadApiKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log('🔑 API Key loaded');
  console.log('🎨 Generating Shot 1 v2 (tension, all 3 bound)...\n');

  // Generate 3 variants, pick the best
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
          const outPath = path.join(__dirname, `shot1_v2_variant${i}.jpg`);
          fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`  ✅ shot1_v2_variant${i}.jpg (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
          break;
        }
      }
    } catch (err) {
      console.error(`  ❌ Variant ${i}: ${err.message}`);
    }
  }

  console.log('\n🎯 3 variants generated. Review and pick the strongest.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
