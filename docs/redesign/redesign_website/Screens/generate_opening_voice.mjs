/**
 * generate_opening_voice.mjs — Opening Voice v2
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadApiKey() {
  const envPath = path.resolve(__dirname, '../../../../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^ELEVENLABS_API_KEY=(.+)$/m);
  if (!match) {
    const rootEnv = path.resolve(__dirname, '../../../../src/web/.env.local');
    const rootContent = fs.readFileSync(rootEnv, 'utf-8');
    const rootMatch = rootContent.match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (!rootMatch) { console.error('❌ ELEVENLABS_API_KEY not found'); process.exit(1); }
    return rootMatch[1].trim().replace(/^["']|["']$/g, '');
  }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

async function main() {
  const apiKey = loadApiKey();

  // Get Roger voice ID
  const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey }
  });
  const voices = (await voicesRes.json()).voices || [];
  const roger = voices.find(v => v.name.includes('Roger'));
  if (!roger) { console.error('❌ Roger voice not found'); process.exit(1); }

  const text = 'Gerade meldet sich jemand bei Ihrem Betrieb. Aber niemand kann jetzt rangehen. Genau solche Momente dürfen nicht verloren gehen.';

  console.log(`🎙️  Generating Opening Voice v2 with ${roger.name}...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${roger.voice_id}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.65, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true }
    }),
  });

  if (!res.ok) { console.error(`❌ ${res.status}: ${await res.text()}`); process.exit(1); }

  const outPath = path.join(__dirname, 'opening', 'voice_opening_v2.mp3');
  fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  console.log(`✅ ${outPath} (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
