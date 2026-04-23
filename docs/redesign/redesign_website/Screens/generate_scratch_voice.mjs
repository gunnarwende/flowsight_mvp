/**
 * generate_scratch_voice.mjs — Scratch-Voice for Animatic v1
 *
 * Generates per-chapter voice segments via ElevenLabs TTS.
 * Uses a new voice (not Daniel) — tries "Antoni" or similar professional male DE voice.
 *
 * Usage: node generate_scratch_voice.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadApiKey() {
  const envPath = path.resolve(__dirname, '../../../../src/web/.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^ELEVENLABS_API_KEY=(.+)$/m);
  if (!match) {
    // Try root .env.local
    const rootEnv = path.resolve(__dirname, '../../../../.env.local');
    const rootContent = fs.readFileSync(rootEnv, 'utf-8');
    const rootMatch = rootContent.match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (!rootMatch) { console.error('❌ ELEVENLABS_API_KEY not found'); process.exit(1); }
    return rootMatch[1].trim().replace(/^["']|["']$/g, '');
  }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

// Scratch-Voice v3 — final text
const CHAPTERS = [
  {
    id: 'K1_verlust',
    text: 'Gerade meldet sich jemand bei Ihrem Betrieb. Aber niemand kann jetzt rangehen. Der Moment verstreicht. Und nichts davon kommt je an.',
  },
  {
    id: 'K2_auffangen',
    text: 'FlowSight fängt auf, was sonst verloren geht. Jede Meldung — ob per Telefon, über die Website oder direkt aufgenommen — landet an einem Ort. Kein Eingang geht mehr unter.',
  },
  {
    id: 'K3_kunde',
    text: 'Und Ihr Kunde? Der weiss sofort: Seine Meldung ist angekommen.',
  },
  {
    id: 'K4a_verwandlung',
    text: 'Was eben noch eine Meldung war, ist jetzt ein Fall, den Ihr Betrieb führen kann. Wer hat sich gemeldet, wo ist das Problem, wie dringend ist es. Alles an seinem Platz. Nicht auf einem Zettel. Nicht im Kopf von jemandem. Sondern dort, wo Ihr Betrieb damit weiterarbeiten kann.',
  },
  {
    id: 'K4b_fuehrung',
    text: 'Und ab hier führt der Betrieb. Wer fährt hin, wann ist der Termin, was ist vor Ort zu erwarten. Kein Nachfragen. Kein Suchen. Einfach Überblick.',
  },
  {
    id: 'K5_erledigt',
    text: 'Wenn der Auftrag erledigt ist, ist er erledigt. Dokumentiert. Abgeschlossen. Nichts bleibt offen.',
  },
  {
    id: 'K6_bewertung',
    text: 'Und wenn der Ablauf stimmt, merken das auch Ihre Kunden.',
  },
];

// Founder-Closer is NOT part of TTS — recorded by Founder himself
// "Ich bin Gunnar Wende. Ich richte Ihr Leitsystem persönlich ein. Sie erreichen mich direkt."

async function generateVoice(chapter, apiKey, voiceId) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  console.log(`  🎙️  ${chapter.id}: "${chapter.text.substring(0, 60)}..."`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: chapter.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.75,
        style: 0.15,
        use_speaker_boost: true,
      }
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ ${chapter.id}: ${res.status} — ${err.substring(0, 200)}`);
    return null;
  }

  const outDir = path.join(__dirname, 'voice');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `scratch_${chapter.id}.mp3`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`  ✅ scratch_${chapter.id}.mp3 (${sizeKB} KB)`);
  return outPath;
}

async function main() {
  const apiKey = loadApiKey();
  console.log('🔑 ElevenLabs API Key loaded');

  // Try to find a good German male voice
  // First list available voices to find a professional DE male
  const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey }
  });
  const voicesData = await voicesRes.json();
  const voices = voicesData.voices || [];

  // Find a German-capable professional male voice
  // Prioritize: not Daniel, male, multilingual
  console.log(`\n📋 Available voices: ${voices.length}`);

  // Use "Antoni" (professional male) or fall back to first available male
  let voiceId = null;
  let voiceName = null;

  // Try known good voices for professional DE
  const preferred = ['Antoni', 'Arnold', 'Josh', 'Adam', 'Bill'];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) {
      voiceId = v.voice_id;
      voiceName = v.name;
      break;
    }
  }

  if (!voiceId && voices.length > 0) {
    // Just use first available
    voiceId = voices[0].voice_id;
    voiceName = voices[0].name;
  }

  if (!voiceId) {
    console.error('❌ No voices available');
    process.exit(1);
  }

  console.log(`🎤 Using voice: ${voiceName} (${voiceId})\n`);

  const results = [];
  for (const chapter of CHAPTERS) {
    const result = await generateVoice(chapter, apiKey, voiceId);
    results.push({ id: chapter.id, ok: !!result, path: result });
  }

  console.log('\n════════════════════════════════════');
  for (const r of results) {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.id}`);
  }
  console.log('════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
