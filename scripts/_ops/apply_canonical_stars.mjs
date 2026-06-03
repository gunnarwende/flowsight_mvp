#!/usr/bin/env node
/**
 * apply_canonical_stars.mjs — Deterministischer T4-Stern/Maus-Sync (02.06.2026).
 *
 * PROBLEM: Der Stern-Fill-Zeitpunkt der per-Tenant-Live-Review-Aufnahme jittert pro Build
 * (Playwright recordVideo-Start-Latenz, ~±0,5–2s) → die universelle Dörfler-Maus (fixe
 * Zeitstempel) trifft die Sterne mal früher/später → „Maus führt Fill" stimmt nicht zuverlässig.
 * Mehrere Quell-Härtungen (Warm-up, Trim-Anker) waren fummelig/nicht skalierbar.
 *
 * LÖSUNG: Die Stern-INNENREGION ist farb-NEUTRAL (gold/grau/weiss) — Brand-Farbe sitzt nur
 * im Header-Balken (oben) + Chips/Button (unten, erst NACH dem Fill). Wir legen die farb-
 * neutrale Stern-Region der founder-abgenommenen Gold-Referenz (Jul. Weinberger) im FIXEN
 * Fenster über den Master jedes Betriebs:
 *   - Stern-Fill-Timing = Weinberger (millisekunde-gleich für ALLE Betriebe, Maus trifft immer).
 *   - Header/Name/Brand-Farbe/Fall-Daten/Chips = bleiben per-Tenant natürlich (ausserhalb der Region).
 *   - Nahtlos: farb-neutrale Region auf weissem, positions-gleichem Review-Card.
 * Skalierbar (gleiche Referenz + gleiches Fenster für jeden Betrieb), kein Aufnahme-Lotto.
 *
 * Layout-Voraussetzung: 1-zeiliger Review-Header (kurzer Firmenname) → Sterne auf kanonischer y.
 *
 * Usage: node scripts/_ops/apply_canonical_stars.mjs --slug <slug>
 *   Überschreibt master_takes/take4/<slug>_with_mouse.mp4 in-place (Backup _pre_stars).
 */
import { spawnSync } from "node:child_process";
import { existsSync, copyFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const argVal = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const slug = argVal("--slug");
if (!slug) { console.error("usage: --slug <slug>"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
// Gold-Referenz: Jul. Weinberger (Founder 03.06. — T4 ausschliesslich Weinberger), founder-
// abgenommen. Stern-Fill-Onset @ master 74,13s. (Alt: Stark → canonical_stars_ref_STARK_old.mp4.)
const REF = join(REPO_ROOT, PIPE, "_locked", "take4", "canonical_stars_ref.mp4");
// Referenz-Clip ist die Stern-Innenregion ab Master 71,5s (crop 350x340 @ x=775,y=362).
const REF_START = 71.5;       // Master-Zeit, bei der der Referenz-Clip beginnt
const OV_X = 775, OV_Y = 362; // Overlay-Position (= Crop-Ursprung der Region im 1440x900-Master)
const WIN_START = 72.0, WIN_END = 75.0; // Fill-Fenster (Maus-Sweep) — danach per-Tenant-Chips

const master = join(REPO_ROOT, PIPE, "master_takes", "take4", `${slug}_with_mouse.mp4`);
if (!existsSync(master)) { console.error(`✗ master fehlt: ${master}`); process.exit(2); }
if (!existsSync(REF)) { console.error(`✗ canonical reference fehlt: ${REF}`); process.exit(2); }

const backup = master.replace(/\.mp4$/, "_pre_stars.mp4");
copyFileSync(master, backup);
const tmp = master.replace(/\.mp4$/, "_stars_tmp.mp4");

console.log(`── T4 canonical stars overlay: ${slug}`);
console.log(`   ref=${REF} window=[${WIN_START},${WIN_END}]s @${OV_X},${OV_Y}`);

// Referenz-Clip auf Master-Zeit schieben (Clip-t=0 → Master ${REF_START}) + im Fenster overlayen.
const r = spawnSync("ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-i", backup,
  "-i", REF,
  "-filter_complex",
  `[1:v]setpts=PTS-STARTPTS+${REF_START}/TB[ref];` +
  `[0:v][ref]overlay=${OV_X}:${OV_Y}:enable='between(t\\,${WIN_START}\\,${WIN_END})'[out]`,
  "-map", "[out]", "-map", "0:a?",
  "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "copy", "-movflags", "+faststart",
  tmp,
], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ overlay failed"); process.exit(r.status || 1); }

copyFileSync(tmp, master);
const { rmSync } = await import("node:fs");
rmSync(tmp, { force: true });
console.log(`   ✓ canonical stars applied → ${master} (${(statSync(master).size / 1024 / 1024).toFixed(1)} MB; backup ${backup})`);
