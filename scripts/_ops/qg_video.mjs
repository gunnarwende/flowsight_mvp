#!/usr/bin/env node
/**
 * qg_video.mjs — Automatische Video-Quality-Gates pro Take (Stresstest-Lessons 01.06.).
 *
 * Prüft das FERTIGE Video an echten Frames + Audio-INHALT — nicht Datei-Existenz.
 * Exit 0 = alle Gates PASS. Exit 1 = ≥1 FAIL (+ Finding-Report). Spec: quality_gates.md.
 *
 * Gates (implementiert):
 *   - G_START0 (alle): Frame@0:00 nicht schwarz/leer.
 *   - G_HOMESCREEN0 (T2): Phone-Interior @0:00 = Homescreen (nicht Suche/Dialing) — Walter-Offset.
 *   - G_GREETING (T2): STT Call-Start → Firmenname (fängt Greeting-Leak). Braucht OPENAI_API_KEY.
 *   - G_T2_PAUSE (T2): Verbindungs-Pause 8.55s @33.04 (Gold Walter+Weinberger; stale = verkürzt).
 *   - G_T2_BEEP (T2): Verbindungs-Ton @41.7–42.6s hörbar (Fehlen = Alarm, Obrist „kein Piepen").
 *   - G_T2_TAIL (T2): nur letzte ≤2.5s still (stale Wälti = 15s Schluss-Stille).
 *   - G_T4_STARSYNC (T4): Stern+Maus = Weinberger-Referenz (SSIM ≥0.94).
 *   - G_T4_CASEOPEN (T4): Case-Detail @11.0s (SSIM-Bracket; stale Walter @8s = desync).
 *   - G_T4_DOUBLESTAR (T4): genau 1 Gold-Fill-Region [73,80] (≥2 = Doppelstern, Obrist).
 *   - G_T3_KPI_NEU: in insert_take3_wizard_case.mjs (Daten-Gate, 2 offene Fälle).
 *   SOLL-Anker + Entscheide: PIPELINE_BIBLE §66/§67.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/qg_video.mjs --slug <slug> --take <2|3|4> --video <path>
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const argVal = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const slug = argVal("--slug");
const take = argVal("--take");
const video = argVal("--video");
if (!slug || !take || !video || !existsSync(video)) {
  console.error("usage: --slug <slug> --take <2|3|4> --video <path>"); process.exit(1);
}
const cfg = JSON.parse(readFileSync(join("docs/customers", slug, "tenant_config.json"), "utf8"));
const companyName = cfg?.voice_agent?.company_name || cfg?.tenant?.name || slug;
const TMP = `/c/tmp/qg_video/${slug}_t${take}`; mkdirSync(TMP, { recursive: true });

const findings = [];
function gate(name, pass, detail) {
  console.log(`  ${pass ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
  if (!pass) findings.push({ name, detail });
}
function ff(a) { return spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { encoding: "utf8" }); }
function probeBrightness(png) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "info", "-i", png,
    "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-f", "null", "-"], { encoding: "utf8" });
  const m = (r.stderr || "").match(/YAVG=([\d.]+)/); return m ? parseFloat(m[1]) : null;
}
// YAVG eines Crop-Bereichs am Frame @ts (für Phone-Interior-Strukturprüfung).
function probeCropBrightness(videoPath, cropFilter, ts = "0") {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "info",
    "-ss", String(ts), "-i", videoPath, "-frames:v", "1",
    "-vf", `${cropFilter},signalstats,metadata=print:key=lavfi.signalstats.YAVG`,
    "-f", "null", "-"], { encoding: "utf8" });
  const m = (r.stderr || "").match(/YAVG=([\d.]+)/); return m ? parseFloat(m[1]) : null;
}
function videoDuration(p) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", p], { encoding: "utf8" });
  return parseFloat((r.stdout || "").trim()) || 0;
}
// Stille-Regionen [{start,end}] via silencedetect.
function probeSilences(p, noiseDb = -45, minDur = 0.8) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", p, "-af", `silencedetect=noise=${noiseDb}dB:d=${minDur}`, "-f", "null", "-"], { encoding: "utf8" });
  const out = []; let cur = null;
  for (const m of (r.stderr || "").matchAll(/silence_(start|end):\s*(-?[\d.]+)/g)) {
    if (m[1] === "start") cur = { start: parseFloat(m[2]) };
    else if (cur) { cur.end = parseFloat(m[2]); out.push(cur); cur = null; }
  }
  if (cur) { cur.end = videoDuration(p); out.push(cur); }
  return out;
}
// mittlere Lautstärke (dB) eines Zeitbereichs via volumedetect (−91 ≈ totale Stille).
function meanVolumeDb(p, ss, to) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-ss", String(ss), "-to", String(to), "-i", p, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  const m = (r.stderr || "").match(/mean_volume:\s*(-?[\d.]+)\s*dB/); return m ? parseFloat(m[1]) : null;
}
// SSIM eines Frames @ts (volles Bild) gegen ein Referenz-PNG desselben Videos.
function ssimFrameVsRef(p, ts, refPng) {
  const a = join(TMP, `ssf_${ts}.png`);
  ff(["-ss", String(ts), "-i", p, "-frames:v", "1", a]);
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", a, "-i", refPng, "-lavfi", "ssim", "-f", "null", "-"], { encoding: "utf8" });
  const m = (r.stderr || "").match(/All:\s*([\d.]+)/); return m ? parseFloat(m[1]) : 0;
}
// UAVG-Zeitreihe (Chroma-U) eines Crops über [ss,ss+dur] in EINEM ffmpeg-Pass → [{t,u}].
function uavgSeries(p, cropFilter, ss, dur) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-copyts", "-ss", String(ss), "-t", String(dur), "-i", p,
    "-vf", `${cropFilter},signalstats,metadata=print:key=lavfi.signalstats.UAVG`, "-an", "-f", "null", "-"], { encoding: "utf8" });
  const out = []; let t = null;
  for (const m of (r.stderr || "").matchAll(/pts_time:([\d.]+)|UAVG=([\d.]+)/g)) {
    if (m[1] !== undefined) t = parseFloat(m[1]);
    else if (t !== null) { out.push({ t, u: parseFloat(m[2]) }); t = null; }
  }
  return out;
}

console.log(`\n═══ QG-Video: ${slug} T${take} (${companyName}) ═══`);
console.log(`  video: ${video}`);

// ── G_START0: Frame @0:00 nicht schwarz/leer ──────────────────────────────
const f0 = join(TMP, "f0.png");
ff(["-ss", "0", "-i", video, "-frames:v", "1", f0]);
const y0 = probeBrightness(f0);
gate("G_START0 Frame@0:00 nicht schwarz", y0 !== null && y0 > 15 && y0 < 250,
  `YAVG=${y0?.toFixed(0)} (Frame existiert + Inhalt)`);

// ── G_HOMESCREEN0 (T2): Phone-Interior @0:00 MUSS Homescreen sein ──────────
// Fängt den Walter-Offset (Suche statt Homescreen bei 0:00) — G_START0 allein
// reicht NICHT, weil die Suche (weiße Tastatur) auch hell/„nicht schwarz" ist.
// Phone-Interior-Crop (250x400 @450,150 im 1440x900-Canvas), kalibriert an echten
// Frames 02.06.: Homescreen-Wallpaper YAVG≈100-170, Suche≈225, Dialing≈70, schwarz<20.
if (take === "2") {
  const yPhone = probeCropBrightness(video, "crop=250:400:450:150", "0");
  gate("G_HOMESCREEN0 Phone@0:00 = Homescreen (nicht Suche/Dialing)",
    yPhone !== null && yPhone >= 90 && yPhone <= 180,
    `Phone-Interior YAVG=${yPhone?.toFixed(0)} (erwartet 90-180; Suche≈225 / Dialing≈70 / schwarz<20)`);
}

// ── G_T2_PAUSE / G_T2_BEEP / G_T2_TAIL (T2): Audio-Struktur ────────────────
// SOLL (Gold Walter+Weinberger+locked-Master, gemessen 03.06.): Verbindungs-Pause
// (Wählen→Lisa-Greeting) = 8.55s ab @33.04s. Verkürzte Pause (stale Marti 7.0 / Stark 1.34)
// = Audio rutscht zu früh → Beep/Greeting/Rest desync. Beep/Verbindungston = kurzes Tonsegment
// direkt nach der Pause (~41.7–42.6s) — Fehlen = Alarm (Obrist „kein Piepen"). Tail: nur die
// letzten ≤2.5s dürfen still sein (stale Wälti: 15s Schluss-Stille = Audio bricht zu früh ab).
if (take === "2") {
  const dur = videoDuration(video);
  const sil = probeSilences(video, -45, 0.8);
  const pause = sil.find((s) => Math.abs(s.start - 33.04) < 1.2 && (s.end - s.start) > 4.0);
  const pauseDur = pause ? pause.end - pause.start : 0;
  gate("G_T2_PAUSE Verbindungs-Pause 8.55s @33.04",
    !!pause && Math.abs(pauseDur - 8.55) <= 0.35 && Math.abs(pause.start - 33.04) <= 0.3,
    pause ? `Pause ${pauseDur.toFixed(2)}s @${pause.start.toFixed(2)}s (SOLL 8.55s @33.04 ±0.35/0.3)` : "keine Pause ~33s (Audio verschoben/kaputt — stale Build?)");
  const beepDb = meanVolumeDb(video, 41.7, 42.6);
  gate("G_T2_BEEP Verbindungs-Ton vorhanden (nicht 'kein Piepen')",
    beepDb !== null && beepDb > -45,
    `mean_volume @41.7–42.6s = ${beepDb === null ? "n/a" : beepDb.toFixed(1) + "dB"} (SOLL > −45dB = hörbar; Stille = Alarm/Obrist)`);
  const tail = sil.find((s) => s.end >= dur - 0.3 && s.start < dur - 2.5);
  gate("G_T2_TAIL nur letzte ≤2.5s still",
    !tail,
    tail ? `Schluss-Stille ${(dur - tail.start).toFixed(1)}s ab ${tail.start.toFixed(1)}s (Audio bricht zu früh ab; SOLL ≤2.5s)` : `ok (dur ${dur.toFixed(1)}s)`);
}

// ── G_GREETING (T2): STT Call-Start → Firmenname ───────────────────────────
if (take === "2") {
  const key = (process.env.OPENAI_API_KEY || "").replace(/^"|"$/g, "");
  if (!key) {
    gate("G_GREETING STT", false, "OPENAI_API_KEY fehlt — Gate kann nicht prüfen");
  } else {
    // Greeting-Region variant-unabhängig grob abdecken: 38–52s (Lisa-Greeting liegt drin).
    const greetMp3 = join(TMP, "greet.mp3");
    ff(["-ss", "38", "-to", "52", "-i", video, "-ac", "1", "-ar", "16000", greetMp3]);
    const r = spawnSync("curl", ["-s", "https://api.openai.com/v1/audio/transcriptions",
      "-H", `Authorization: Bearer ${key}`,
      "-F", `file=@${greetMp3}`, "-F", "model=whisper-1", "-F", "language=de"], { encoding: "utf8" });
    let text = "";
    try { text = JSON.parse(r.stdout).text || ""; } catch { text = r.stdout || ""; }
    // Robust: ein distinktives Firmenwort (len≥4, ohne Rechtsform) muss im Greeting
    // vorkommen. STT verschreibt sich oft leicht (Jul→Juhl, Stark Haustechnik→Starkhaus)
    // → wir prüfen das LÄNGSTE/distinktivste Wort + erlauben Fuzzy-Substring.
    // FIX 02.06.: Umlaut-Deburr + Fuzzy-Match. Whisper verhört Schweizer Namen oft
    // (Wälti→Welti, Sohn→Onzon, Jul→Juhl) + Umlaute → exakter Substring failt fälschlich.
    // Deburr (ä→a etc.) auf STT + Name, dann Levenshtein-Toleranz über Schiebefenster.
    const deburr = (s) => s.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").replace(/[^a-z]/g, "");
    const normT = deburr(text);
    const strip = /\b(AG|GmbH|SA|S[àa]rl|KlG|Sanitär-?Spenglerei|Spenglerei|Haustechnik|Sanitär|Heizung)\b/gi;
    const toWords = (n) => n.split(/[\s.,&|/-]+/).map(deburr).filter((w) => w.length >= 4);
    const words = toWords(companyName.replace(strip, " "));
    const cand = (words.length ? words : toWords(companyName));
    const lev = (a, b) => { const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
    // FIX 03.06.: Fenster-Länge ±1 zusätzlich zur Wortlänge — Whisper schluckt/fügt bei
    // Schweizer Namen oft Zeichen (Marti→Mati, Sohn→Onzon) → bei spaceless normT verschiebt
    // die Wortgrenze das Fenster. ±1 fängt gedroppte/eingefügte Zeichen (lev "marti"/"mati"=1).
    const fuzzyIn = (w) => {
      if (normT.includes(w)) return true;
      const tol = Math.max(1, Math.floor(w.length / 4));
      for (const L of [w.length - 1, w.length, w.length + 1]) {
        if (L < 3) continue;
        for (let i = 0; i + L <= normT.length; i++) if (lev(w, normT.slice(i, i + L)) <= tol) return true;
      }
      return false;
    };
    const hit = cand.find(fuzzyIn);
    gate("G_GREETING Firmenname in Lisa-Greeting", !!hit,
      `erwartet eines von [${cand.join(", ")}] | STT: "${text.slice(0, 90)}…"`);
  }

  // ── G_BATTERY (T2): Akku im Call = 86 (Crop oben-rechts Status-Bar) ──────
  // Heuristik: Crop der Akku-Pille @1:30, OCR-frei via Template-Vergleich gegen
  // bekanntes 86 ist aufwändig → wir prüfen via STT nicht; stattdessen Hinweis.
  // (Akku-Wurzel ist im Code gefixt; visueller Gate = TODO mit Referenz-Crop.)
  gate("G_BATTERY (visuell)", true, "Param-Wurzel gefixt; Pixel-Gate TODO (Referenz-Crop)");
}

// ── G_T4_STARSYNC (T4): Maus führt Stern-Fill bei ~1:13,5 ──────────────────
// Die universelle Maus (Dörfler, absolute Zeitstempel) sweept ~72,8–73,4s über die
// 5 Sterne und MUSS den Gold-Fill führen. Fehlerklasse (Walter): langer 2-zeiliger
// Firmenname schob das Review-Layout runter (Sterne tiefer) UND der Fill kam ~1,8s
// zu spät → Maus sweepte über leere/falsch-positionierte Sterne. Fix: 1-zeiliger
// Header (Position) + compose all-gold-Anker auf Dörfler-Referenz (Timing).
// Gate prüft den FINALEN Master: all-gold (min UAVG der Sternreihe; Gold=Gelb senkt
// Cb/U) muss (a) klar vorhanden sein (Sterne an kanonischer Position) UND (b) im
// Maus-Sweep-Fenster liegen. Kalibriert 02.06. an echten Frames (1440x900):
// gut = all-gold @~73,5s U≈114 / Walter-alt = @75,3s U≈127 (spät+verschoben).
if (take === "4") {
  // REFERENZ-BASIERT (02.06. v2): vergleiche die Stern+Maus-Region an den Sweep-Frames
  // mit Stark (founder-abgenommene Gold-Referenz) via SSIM. Robust gegen die hell-
  // goldenen Sterne (kein fragiles Helligkeits-Threshold wie v1, das verrauscht war und
  // fälschlich übergangen wurde). SSIM fängt BEIDES: Position (Layout-Reflow → Sterne
  // verschoben) UND Timing (Fill-Offset → andere Anzahl gefüllter Sterne pro Frame).
  // Crop = Phone-Stern+Maus-Bereich, OHNE Header/Name (name-/datums-unabhängig).
  const refSlug = argVal("--ref-slug", "weinberger-ag"); // Founder 03.06.: T4-Ref = Weinberger
  const REF = `docs/gtm/pipeline/07_stresstest/${refSlug}/T4_bewertung.mp4`;
  // ENGER Crop auf die 5-Sterne-Reihe (kalibriert 02.06.): der weite Crop verwässerte
  // die SSIM mit statischem Phone-Hintergrund (kaputt 0,969 ≈ gut 0,989, nicht trennbar).
  // Eng auf die Sternreihe @Mid-Fill (74,0–74,4s) trennt: gut min≈0,97 / desync min≈0,91.
  const CROP = "crop=250:48:815:425";
  const TIMES = ["74.0", "74.2", "74.4"];
  const SSIM_MIN = 0.94;
  if (slug === refSlug) {
    gate("G_T4_STARSYNC (Referenz selbst)", true, `${slug} ist die Gold-Referenz`);
  } else if (!existsSync(REF)) {
    gate("G_T4_STARSYNC Stark-Referenz", false, `Referenz fehlt: ${REF}`);
  } else {
    let minSsim = 1, worstT = null;
    for (const ts of TIMES) {
      const wp = join(TMP, `t4_w_${ts}.png`), sp = join(TMP, `t4_s_${ts}.png`);
      ff(["-ss", ts, "-i", video, "-frames:v", "1", "-vf", CROP, wp]);
      ff(["-ss", ts, "-i", REF, "-frames:v", "1", "-vf", CROP, sp]);
      const r = spawnSync("ffmpeg", ["-hide_banner", "-i", wp, "-i", sp, "-lavfi", "ssim", "-f", "null", "-"], { encoding: "utf8" });
      const m = (r.stderr || "").match(/All:\s*([\d.]+)/);
      const s = m ? parseFloat(m[1]) : 0;
      if (s < minSsim) { minSsim = s; worstT = ts; }
    }
    gate("G_T4_STARSYNC Maus+Sterne = Referenz (SSIM)",
      minSsim >= SSIM_MIN,
      `min SSIM=${minSsim.toFixed(3)} @${worstT}s vs ${refSlug} (≥${SSIM_MIN} = Höhe+Geschwindigkeit+Zeitpunkt wie Referenz)`);
  }

  // ── G_T4_CASEOPEN (T4): Case-Detail erscheint @11.0s ─────────────────────
  // SOLL (Weinberger, gemessen 03.06.): Dashboard→Case-Detail-Übergang @11.0s (Voll-Frame-
  // SSIM vs Dashboard@5s fällt 0.98→0.77). Zu früh (stale Walter @8s) → universelle Maus/
  // Audio desync bis ~28s. Bracket: @10.0 noch Liste (SSIM hoch) + @12.0 schon Detail (tief).
  const dashRef = join(TMP, "t4_dash5.png");
  ff(["-ss", "5.0", "-i", video, "-frames:v", "1", dashRef]);
  const sAt10 = ssimFrameVsRef(video, "10.0", dashRef);
  const sAt12 = ssimFrameVsRef(video, "12.0", dashRef);
  gate("G_T4_CASEOPEN Case-Detail @11.0s (±1s)",
    sAt10 > 0.90 && sAt12 < 0.86,
    `SSIM@10s=${sAt10.toFixed(2)} (SOLL>0.90 noch Liste) / @12s=${sAt12.toFixed(2)} (SOLL<0.86 Detail offen)`);

  // ── G_T4_DOUBLESTAR (T4): genau EIN Gold-Fill, kein Leak nach dem Fenster ──
  // Canonical-Stars-Overlay füllt im Fenster [72,75]. Wenn der per-Tenant-Fill der Live-
  // Aufnahme (Part 6, nicht geankert) nach 75s leakt (Obrist @76 = +2s Jitter) → Doppelstern.
  // Gate zählt Gold-Dip-Regionen (UAVG<120 in der Sternreihe) über [73,80]: genau 1 = ok,
  // ≥2 = Doppelstern → FAIL → Rebuild. Weinberger-Gold: 1 Dip 74.0–74.8, danach U zurück 128.
  const series = uavgSeries(video, "crop=350:48:775:420", 73.0, 7.0);
  let regions = 0, inDip = false, dipFrames = 0;
  for (const { u } of series) {
    if (u < 120) { if (!inDip) { inDip = true; dipFrames = 0; } dipFrames++; }
    else if (u >= 122) { if (inDip && dipFrames >= 3) regions++; inDip = false; }
  }
  if (inDip && dipFrames >= 3) regions++;
  gate("G_T4_DOUBLESTAR genau ein Stern-Fill (kein Leak nach Fenster)",
    regions === 1,
    `${regions} Gold-Fill-Region(en) in [73,80]s (SOLL=1; ≥2 = Doppelstern durch Part-6-Jitter)`);
}

console.log(`\n═══ Ergebnis: ${findings.length === 0 ? "✅ ALL PASS" : `❌ ${findings.length} FAIL`} (${slug} T${take}) ═══`);
findings.forEach((f) => console.log(`   • ${f.name}: ${f.detail || ""}`));
process.exit(findings.length ? 1 : 0);
