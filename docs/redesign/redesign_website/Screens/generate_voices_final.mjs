/**
 * generate_voices_final.mjs — Final Voice Generation with Helmut
 * EXACT text as provided by Founder. Not one word changed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadApiKey() {
  // Try multiple locations
  for (const envPath of [
    path.resolve(__dirname, '../../../../.env.local'),
    path.resolve(__dirname, '../../../../src/web/.env.local'),
  ]) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  console.error('❌ ELEVENLABS_API_KEY not found');
  process.exit(1);
}

const HELMUT_VOICE_ID = 'JiW03c2Gt43XNUQAumRP';

const VOICES = [
  {
    id: 'voice_kurz_final',
    text: `Im Handwerk geht selten die Arbeit verloren.
Verloren geht der Moment, in dem sich jemand bei Ihnen meldet und gerade niemand sauber reagieren kann.

Dann ruft ein Kunde nochmals an.
Dann fehlt die saubere Rückmeldung.
Dann bleibt der nächste Schritt wieder an einzelnen Personen hängen.

Ihr Leitsystem hält genau diese Momente.
Es sorgt dafür, dass Eingänge nicht untergehen, Kunden Rückmeldung bekommen und aus einer Meldung ein Fall wird, mit dem Ihr Betrieb sauber weiterarbeiten kann.

So bleibt weniger liegen.
Der Betrieb bleibt geführt.
Und er wirkt nach aussen so verlässlich, wie er intern arbeitet.`
  },
  {
    id: 'voice_lang_final',
    text: `Im Handwerk geht selten die Arbeit verloren.
Verloren geht der Moment, in dem sich jemand bei Ihnen meldet und gerade niemand sauber reagieren kann.

Ein Anruf kommt im falschen Moment.
Eine Meldung bleibt irgendwo hängen.
Ein Rückruf ist vorgenommen, aber nicht sauber übernommen.
Und aus einem kleinen Moment wird Unruhe im ganzen Betrieb.

Dann ruft ein Kunde nochmals an.
Dann fehlt die saubere Rückmeldung.
Dann wird im Büro, im Kopf oder unterwegs nach Informationen gesucht.
Und wieder hängt zu viel an einzelnen Personen.

Dann fährt jemand los, obwohl noch nicht alles vollständig ist.
Dann wird vor Ort erst klar, was schon vorher sauber hätte vorliegen müssen.
Dann geht Zeit verloren, obwohl die eigentliche Arbeit gut gemacht wird.

Genau dort setzt Ihr Leitsystem an.

Es hält Eingänge fest, bevor sie im Alltag untergehen.
Es sorgt dafür, dass Kunden Rückmeldung bekommen, ohne dass im Betrieb zuerst alles zusammengesucht werden muss.
Und es macht aus einer Meldung einen Fall, mit dem Ihr Betrieb sauber weiterarbeiten kann.

Das heisst:
Ihr Team weiss, was neu ist.
Ihr Betrieb sieht, was läuft.
Und was erledigt ist, bleibt nicht lose zurück.

Der aktuelle Stand bleibt dort verfügbar, wo weitergearbeitet wird.
Im Büro.
Unterwegs.
Vor Ort.

So muss nicht alles wieder zurück ins Office, damit es weitergeht.
So bleibt der Betrieb auch draussen auf dem gleichen Stand.
Und so entsteht Führung im Ablauf — nicht nur beim ersten Kontakt, sondern bis zum Abschluss.

Dazu gehört auch, dass Termine sauber vorbereitet sind, dass Erinnerungen unnötige Leerfahrten vermeiden und dass Informationen dort ankommen, wo sie gebraucht werden.
Weniger Hinterhertelefonieren.
Weniger Rückfragen im falschen Moment.
Weniger Dinge, die am Abend noch an einzelnen Personen hängen bleiben.

Und wenn gute Arbeit sauber geführt wurde, wirkt sie auch nach aussen verlässlich weiter.
Nicht aufdringlich.
Nicht bei jedem Kunden.
Sondern gezielt dort, wo es passt — als ruhiger Abschluss guter Arbeit.

Das ist nicht einfach ein weiteres Tool.
Das ist Ihr Leitsystem.
FlowSight.

Mein Name ist Gunnar Wende. Ich freue mich darauf, Ihr persönliches Leitsystem einzurichten.`
  }
];

async function generateVoice(voice, apiKey) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${HELMUT_VOICE_ID}`;

  console.log(`\n🎙️  Generating ${voice.id}...`);
  console.log(`   Text length: ${voice.text.length} chars`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: voice.text,
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
    console.error(`   ❌ ${res.status}: ${err.substring(0, 300)}`);
    return null;
  }

  const outDir = path.join(__dirname, 'voice_final');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${voice.id}.mp3`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buffer);

  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`   ✅ ${voice.id}.mp3 (${sizeKB} KB)`);
  return outPath;
}

async function main() {
  const apiKey = loadApiKey();
  console.log('🔑 ElevenLabs API Key loaded');
  console.log(`🎤 Voice: Helmut (${HELMUT_VOICE_ID})`);

  for (const voice of VOICES) {
    const outPath = await generateVoice(voice, apiKey);
    if (outPath) {
      // Check duration
      const { execSync } = await import('child_process');
      const dur = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${outPath}"`, { encoding: 'utf-8' }).trim();
      console.log(`   ⏱️  Duration: ${parseFloat(dur).toFixed(1)}s`);
    }
  }

  console.log('\n🎯 Done.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
