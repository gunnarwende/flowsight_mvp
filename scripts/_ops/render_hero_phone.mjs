#!/usr/bin/env node
/**
 * render_hero_phone.mjs — Hero Phone-Visual (Samsung: ring → call-active → beendet)
 * als SAUBERER PHONE-SCREEN, OHNE Gesicht/Bezel (Immunsystem: Gesicht = Post-Layer).
 *
 * Nutzt die bestehende take2_samsung.html-Engine (kein Fork), aber gibt nur den
 * Phone-Screen aus (das rohe Recording — Bezel/Face kamen früher erst im Composite).
 * Dauer wird auf die Hero-Call-Audio getaktet (Master-Uhr): ring + call_dur + ended.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/render_hero_phone.mjs \
 *     --slug doerfler-ag --call-dur 29.9 [--ring 1.74] [--ended 1.0] [--out <mp4>]
 */
import { readFile, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const getArg = (n) => { const p = `--${n}=`; const a = args.find((x) => x.startsWith(p)); if (a) return a.slice(p.length); const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null; };

const slug = getArg("slug") || "doerfler-ag";
const callDur = Number(getArg("call-dur") || 30);
const ringSec = Number(getArg("ring") || 1.74);
const endedSec = Number(getArg("ended") || 1.0);
const OUT_W = 392, OUT_H = 852; // = Leitzentrale-Block (Concat braucht gleiche Maße)

const cfg = JSON.parse(await readFile(join(repoRoot, "docs", "customers", slug, "tenant_config.json"), "utf-8"));
const t = cfg.tenant, va = cfg.voice_agent || {}, vid = cfg.video || {};
const firma = va.company_name || t.name || slug;
const telefon = vid.display_phone || vid.telefon_display || va.phone || "+41 44 505 74 21";
const initial = (firma.charAt(0) || "?").toUpperCase();
const brandColor = t.brand_color || "#003478";
// Ort des Betriebs aus voice_agent.address ableiten (Skalierung: Dörfler=Oberrieden,
// nicht hardcoded "Zürich"). Fallback: leer → Call-Screen blendet die Zeile aus.
const ortMatch = (va.address || "").match(/\d{4}\s+([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ\s\-]+?)(?:,|$)/);
const ort = ortMatch ? ortMatch[1].trim() : "";

const outDir = join(repoRoot, "docs", "gtm", "pipeline", "06_video_production", "_generated", "hero_montage");
await mkdir(outDir, { recursive: true });
const outFile = getArg("out") || join(outDir, "block_phone.mp4");
const tmpDir = join(outDir, "_tmp_phone");
await mkdir(tmpDir, { recursive: true });

const htmlPath = join(repoRoot, "scripts", "_ops", "screen_templates", "sequences", "take2_samsung.html");
const fileUrl = "file:///" + htmlPath.split(sep).join("/");
const params = new URLSearchParams({
  firma, telefon, sms_sender: t.name, case_ref: t.case_id_prefix || "XX",
  uhrzeit: "08:04", datum: "Dienstag, 1. Juli", initial, ort,
  anruf_dauer: String(Math.round(callDur)),
  ring_duration: String(Math.round(ringSec * 1000)),
  dial_delay: "600",
  brand_color: brandColor, battery: "86", playwright: "true",
});

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
  recordVideo: { dir: tmpDir, size: { width: 412, height: 915 } },
});
const page = await ctx.newPage();
console.log(`[phone] render · firma="${firma}" · call=${callDur}s · ring=${ringSec}s`);
const t0 = Date.now();
await page.goto(`${fileUrl}?${params}`, { waitUntil: "domcontentloaded" });

// Anker (state, nicht blind): warte bis #call-screen aktiv ist (Ring beginnt)
let tRing = null;
for (let i = 0; i < 200; i++) {
  const active = await page.evaluate(() => document.querySelector("#call-screen")?.classList.contains("active")).catch(() => false);
  if (active) { tRing = (Date.now() - t0) / 1000; break; }
  await page.waitForTimeout(100);
}
if (tRing == null) { console.error("[phone] call-screen nie aktiv geworden"); process.exit(1); }
console.log(`[phone] call-screen @ ${tRing.toFixed(2)}s → ring+aktiv ${(ringSec + callDur).toFixed(1)}s`);
// ring + call-active abwarten (autoplay ruft startTimer nach ringDuration selbst)
await page.waitForTimeout((ringSec + callDur) * 1000);
await page.evaluate(() => window.endCall());
await page.waitForTimeout(endedSec * 1000 + 300);
const rawPath = await page.video().path();
await ctx.close();
await browser.close();

const rawWebm = join(tmpDir, "phone_raw.webm");
await copyFile(rawPath, rawWebm);

// Trim ab call-screen-Start, Länge = ring + call + ended; scale→pad auf OUT (gleiche Maße
// wie Leitzentrale-Block). Ein Encode. Video-only (Audio = Master-Uhr in der Montage).
const total = ringSec + callDur + endedSec;
const vf = `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=decrease,pad=${OUT_W}:${OUT_H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30`;
const r = spawnSync("ffmpeg", ["-hide_banner", "-y",
  "-ss", tRing.toFixed(3), "-i", rawWebm, "-t", total.toFixed(3),
  "-vf", vf, "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
  outFile], { stdio: "inherit" });
await rm(tmpDir, { recursive: true, force: true });
if (r.status !== 0) { console.error("[phone] ffmpeg trim/scale failed"); process.exit(1); }

const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", outFile]);
console.log(`[phone] ✅ ${outFile} · ${parseFloat(probe.stdout.toString().trim()).toFixed(2)}s (${OUT_W}x${OUT_H}, ohne Gesicht)`);
