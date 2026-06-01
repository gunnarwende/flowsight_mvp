#!/usr/bin/env node
/**
 * apply_devbadge_cover.mjs
 *
 * LETZTER Pipeline-Schritt für Take 4: covert den Next.js-16 "3 Issues"
 * Dev-Badge (links unten, Sidebar-Bottom) deterministisch via ffmpeg drawbox.
 *
 * WARUM eigenständig (statt in apply_toast_overlay.mjs gekoppelt):
 *   Der Badge-Cover MUSS nach dem Mouse-Layer laufen. War er in der
 *   Toast-Stufe gebacken und der Mouse-Build lief danach, hat der
 *   Mouse-Build den Cover überschrieben → Badge wieder sichtbar (01.06. Fall).
 *   Deshalb: Cover = allerletzter Post-Process-Schritt, idempotent über Backup.
 *
 * Der Badge-Text ("3 Issues") ist Next.js-konstant — tenant-unabhängig.
 * Die Cover-FARBE wird per Tenant aus dem eigenen Video gesampelt (Sidebar-bg),
 * damit Betriebe mit nicht-navy Brand-Color nicht brechen.
 *
 * Usage:
 *   node scripts/_ops/apply_devbadge_cover.mjs --slug doerfler-ag
 *   node scripts/_ops/apply_devbadge_cover.mjs --slug X --cover-end 98.7 --color 0x00050f
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const argVal = (f, def) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : def; };
const slug = argVal("--slug");
if (!slug) { console.error("usage: --slug <slug>"); process.exit(1); }

const PIPE = "docs/gtm/pipeline/06_video_production";
const input = argVal("--input", join(PIPE, "master_takes", "take4", `${slug}_with_mouse.mp4`));
if (!existsSync(input)) { console.error(`✗ missing input: ${input}`); process.exit(2); }

// Cover-Region (Badge sitzt auf der "Abmelden"-Zeile der Sidebar). Tenant-konstant,
// weil der Next.js-Badge immer dieselbe Größe/Position hat (1440×900 canvas).
// Y=842 (nicht 845): der Badge-Glow/Rand lugt bis ~844 → 845 ließ eine feine
// rote Linie durch. 842 fängt den Rand, lässt die "admin@..."-Zeile (endet ~841) frei.
const COVER_X = 0, COVER_Y = 842, COVER_W = 130, COVER_H = 58;
// Aktiv bis iris-open komplett (T4-Schablone: xfade @97s, voll offen ~98.7s).
// Danach füllt das Loom-Face den ganzen Frame → keine Sidebar, kein Cover nötig.
const COVER_END = parseFloat(argVal("--cover-end", "98.7"));

// Cover-Farbe: per-Tenant aus dem Sidebar-Bottom sampeln (t=45s, Pixel-Region
// unter "Abmelden" = pure Sidebar-bg). Fallback #00050f (Dörfler-Navy).
function sampleSidebarColor(video) {
  try {
    const r = spawnSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", "45", "-i", video,
      "-frames:v", "1",
      "-vf", "crop=4:4:8:892,scale=1:1",  // 4×4 region @ (8,892) bottom-left → 1×1 avg
      "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ], { maxBuffer: 1 << 20 });
    if (r.status === 0 && r.stdout && r.stdout.length >= 3) {
      const [rr, gg, bb] = [r.stdout[0], r.stdout[1], r.stdout[2]];
      const hex = "0x" + [rr, gg, bb].map(v => v.toString(16).padStart(2, "0")).join("");
      return hex;
    }
  } catch { /* fall through */ }
  return null;
}

const color = argVal("--color", sampleSidebarColor(input) || "0x00050f");
console.log(`Cover color (sidebar-bg, auto-sampled): ${color}`);

// Backup Original EINMAL (oldest pre-cover state bleibt erhalten).
const backupDir = join(PIPE, "master_takes", "take4", "_backups");
mkdirSync(backupDir, { recursive: true });
const backup = join(backupDir, `${slug}_with_mouse_pre_devbadge.mp4`);
if (!existsSync(backup)) { copyFileSync(input, backup); console.log(`✓ backup → ${backup}`); }
else { console.log(`• backup already exists (kept): ${backup}`); }

const outPath = input.replace(/\.mp4$/, "_devbadge.mp4");
console.log(`Covering "3 Issues" dev-badge: x=${COVER_X} y=${COVER_Y} w=${COVER_W} h=${COVER_H} until t<${COVER_END}s`);

const r = spawnSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-i", input,
  "-vf", `drawbox=x=${COVER_X}:y=${COVER_Y}:w=${COVER_W}:h=${COVER_H}:color=${color}@1.0:t=fill:enable='lt(t,${COVER_END})'`,
  "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
  "-c:a", "copy",
  outPath,
], { stdio: "inherit" });
if (r.status !== 0) { console.error("✗ ffmpeg drawbox cover failed"); process.exit(r.status); }

copyFileSync(outPath, input);
rmSync(outPath);
console.log(`\n✓ Dev-badge covered → ${input}`);
