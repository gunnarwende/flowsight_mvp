#!/usr/bin/env node
/**
 * produce_videos.mjs — füllt den Orchestrator-TODO (pipeline_run Schritt 5).
 *
 * EIN Kommando: aus einem provisionierbaren tenant_config.json → fertige /p/-Beweis-Seite
 * inkl. Handy-Hochkant-Variante. Codiert die am 18.06. bewiesene kanonische Kette, damit kein
 * Schritt mehr vergessen wird (Lehre: portrait + collect→abgenommen-Staging fehlten → Mobile-Drift).
 *
 * Voraussetzung: Dev-Server auf http://localhost:3000, Config verifiziert (Variante/Name/Farbe/Inhaber).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/produce_videos.mjs --slug <slug> [--skip-provision]
 *
 * Kette: provision(skip voice/retell) → seed_screenflow → build_take2/3/4_final(--with-mouse)
 *        → collect_delivery → Staging nach abgenommen/ (T1 canonical + T2/T3/T4) → build_proof_page
 *        → make_t2_portrait → proof_add_variants  → gibt /p/-URL aus.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null; };
const slug = arg("slug");
const skipProvision = args.includes("--skip-provision");
if (!slug) { console.error("ERROR: --slug required"); process.exit(1); }

const ENVFILE = ["--env-file=src/web/.env.local"];
const APP = { ...process.env, APP_URL: process.env.APP_URL || "http://localhost:3000" };

function step(label, cmd, { env = process.env, capture = false } = {}) {
  console.log(`\n──────── ${label} ────────`);
  const r = spawnSync("node", [...ENVFILE, ...cmd], { cwd: ROOT, env, encoding: "utf8", stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit" });
  if (capture && r.stdout) process.stdout.write(r.stdout);
  if (r.status !== 0) { console.error(`\n✗ FEHLER bei: ${label} (exit ${r.status})`); process.exit(1); }
  return r.stdout || "";
}

// Variante aus Config (C=notruf, B=preis)
const cfg = JSON.parse(readFileSync(join(ROOT, "docs/customers", slug, "tenant_config.json"), "utf8"));
const cpv = cfg.video?.call_proof_variante || cfg.voice_agent?.call_proof_variante || "B";
const variant = cpv === "C" ? "notruf" : "preis";
console.log(`produce_videos: ${slug} | Variante ${cpv} (${variant})`);

// 1) Provision (video-sicher) + 2) Seed
if (!skipProvision) step("Provision (Tenant+Seed, keine Nummer/Retell)", ["scripts/_ops/provision_from_config.mjs", `--slug=${slug}`, "--skip-voice", "--skip-retell"]);
step("Screenflow-Seed", ["scripts/_ops/seed_screenflow_from_config.mjs", "--slug", slug]);

// 3) Takes (kanonisch, Dev-Server)
step("Take 2 (FINAL v102)", ["scripts/_ops/build_take2_final.mjs", "--slug", slug], { env: APP });
step("Take 3 (FINAL)", ["scripts/_ops/build_take3_final.mjs", "--slug", slug], { env: APP });
step("Take 4 (FINAL, --with-mouse)", ["scripts/_ops/build_take4_final.mjs", "--slug", slug, "--with-mouse"], { env: APP });

// 4) collect_delivery (legt _delivery/<slug>/{02_anruf,03_wizard,04_bewertung}.mp4)
step("collect_delivery", ["scripts/_ops/collect_delivery.mjs", "--slug", slug]); // exit≠0 nur wegen T1 (canonical) — egal, wir stagen T1 separat

// 5) Staging → abgenommen/<slug>/ (T1 canonical + T2/T3/T4 mit Lieferungs-Namen)
const ABG = join(ROOT, "docs/gtm/pipeline/07_stresstest/abgenommen", slug);
const DLV = join(ROOT, "docs/gtm/pipeline/06_video_production/master_takes/_delivery", slug);
const T1SRC = join(ROOT, "docs/gtm/pipeline/07_stresstest/abgenommen/leins-ag/T1_intro.mp4"); // canonical, bitgleich (D98)
mkdirSync(ABG, { recursive: true });
const cp = (src, dst) => { if (!existsSync(src)) { console.error(`✗ fehlt: ${src}`); process.exit(1); } copyFileSync(src, dst); };
cp(T1SRC, join(ABG, "T1_intro.mp4"));
cp(join(DLV, "02_anruf.mp4"), join(ABG, `T2_anruf_${variant}.mp4`));
cp(join(DLV, "03_wizard.mp4"), join(ABG, "T3_wizard.mp4"));
cp(join(DLV, "04_bewertung.mp4"), join(ABG, "T4_bewertung.mp4"));
console.log(`  ✓ Staging → abgenommen/${slug} (T1_intro, T2_anruf_${variant}, T3_wizard, T4_bewertung)`);

// 6) Beweis-Seite (Token aus Output ziehen)
const out = step("build_proof_page", ["scripts/_ops/build_proof_page.mjs", "--slug", slug], { capture: true });
const token = (out.match(/\/p\/([a-f0-9]{16,})/) || [])[1];
if (!token) { console.error("✗ Kein /p/-Token aus build_proof_page-Output gelesen."); process.exit(1); }

// 7) Handy-Hochkant-Variante (PFLICHT — sonst Mobile-Drift)
step("make_t2_portrait (Handy: gross + runder Loom)", ["scripts/_ops/make_t2_portrait.mjs", "--slug", slug]);
step("proof_add_variants (Bunny + t2_portrait setzen)", ["scripts/_ops/proof_add_variants.mjs", "--slug", slug, "--token", token]);

console.log(`\n✅ FERTIG: ${slug}\n   Beweis-Seite: https://flowsight.ch/p/${token}\n   (Desktop = Querformat, Handy = Hochkant mit grossem Screen + Loom)`);
console.log(`   Nächstes: email.json prüfen + 'send_outreach --slug ${slug} --to <founder>' zur Sichtung.`);
