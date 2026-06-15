#!/usr/bin/env node
/**
 * build_proof_page.mjs — Phase-3-Verpackung: ein abgenommener 4-Take-Satz wird
 * zur privaten Beweis-Seite /p/<token>.
 *
 * Modell (gelockt 03.06., siehe outreach_templates.md + project_email_phase_kickoff):
 *   "Mail = Deckel, Seite = Schatz." EIN privater Link pro Prospect, mobil-first,
 *   noindex, mit den 4 personalisierten Video-Takes (Bunny Stream) + Tracking.
 *
 * Was es tut:
 *   1. Liest tenant_config.json (Name, Inhaber, call_proof_variante).
 *   2. Findet die 4 Takes in 07_stresstest/abgenommen/<slug>/.
 *   3. Lädt jeden Take zu Bunny Stream hoch (createVideo + uploadVideo) → GUIDs.
 *   4. Erzeugt einen privaten Token + schreibt eine proof_pages-Row (Supabase).
 *   5. Gibt die fertige /p/<token>-URL aus.
 *
 * Idempotenz: Standardmässig wird pro Run eine NEUE Seite (neuer Token, neue
 * Bunny-Uploads) erzeugt. Das ist gewollt — Re-Builds eines Betriebs sollen den
 * bereits verschickten Link nicht überschreiben.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/build_proof_page.mjs \
 *     --slug walter-leuthold [--contact "Walter Leuthold"] [--salutation "Herr Leuthold"] \
 *     [--base-url https://flowsight.ch] [--dry-run]
 */

import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { bunnyEnv, createAndUpload, CANONICAL_T1_GUID } from "./_lib/bunny.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

// ── CLI ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function arg(name, def = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const slug = arg("slug");
const dryRun = !!arg("dry-run", false);
const baseUrl = (arg("base-url", "https://flowsight.ch") || "https://flowsight.ch").replace(/\/$/, "");
if (!slug) {
  console.error("ERROR: --slug required (e.g. --slug walter-leuthold)");
  process.exit(1);
}

const ROOT = join(process.cwd());
// Takes-Quelle: abgenommen/<slug>/ bevorzugt; sonst der Review-Stand 07_stresstest/<slug>/.
const ST_ROOT = join(ROOT, "docs/gtm/pipeline/07_stresstest");
const CONFIG_PATH = join(ROOT, "docs/customers", slug, "tenant_config.json");
function resolveTakesDir() {
  const abgenommen = join(ST_ROOT, "abgenommen", slug);
  const stresstest = join(ST_ROOT, slug);
  if (existsSync(join(abgenommen, "T1_intro.mp4"))) return abgenommen;
  if (existsSync(join(stresstest, "T1_intro.mp4"))) return stresstest;
  return abgenommen; // für Fehlermeldung
}
const ABGENOMMEN = resolveTakesDir();

// ── Helpers ────────────────────────────────────────────────────────────────
/** Derive a polite salutation from an owner full name → "Herr Nachname".
 *  Nimmt NUR den ersten Inhaber (vor Komma) und strippt Gewerk-Klammern
 *  (z. B. "Ramon Dörfler (Sanitärmeister), Luzian Dörfler (Spengler/Heizung)"
 *  → "Herr Dörfler"), damit nie ein Rollen-Text wie "(Spengler/Heizung)"
 *  in der Anrede landet. */
function deriveSalutation(ownerName) {
  if (!ownerName || typeof ownerName !== "string") return null;
  const firstOwner = ownerName.split(/[,(]/)[0].trim(); // erster Inhaber, ohne Klammer-Gewerk
  if (!firstOwner) return null;
  const parts = firstOwner.split(/\s+/);
  const last = parts[parts.length - 1];
  return last ? `Herr ${last}` : null;
}

function mb(p) {
  try {
    return (statSync(p).size / 1024 / 1024).toFixed(1);
  } catch {
    return "?";
  }
}

async function main() {
  // 1) Config
  if (!existsSync(CONFIG_PATH)) {
    console.error(`ERROR: tenant_config.json not found: ${CONFIG_PATH}`);
    process.exit(1);
  }
  const config = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  const companyName = config?.tenant?.name;
  if (!companyName) {
    console.error("ERROR: config.tenant.name missing");
    process.exit(1);
  }
  const ownerName =
    config?.voice_agent?.owner_names || config?.seed?.owner_names || config?.owner_names || null;
  const ownerStr = Array.isArray(ownerName) ? ownerName[0] : ownerName;
  const contact = arg("contact") || ownerStr || null;
  const salutation = arg("salutation") || deriveSalutation(contact) || null;

  // C = notruf, B = preis (PIPELINE_BIBLE §2)
  const cpv = String(config?.video?.call_proof_variante || "B").toUpperCase();
  const variant = cpv === "C" ? "notruf" : "preis";

  // 2) Takes
  const takeFiles = {
    t1: "T1_intro.mp4",
    t2: variant === "notruf" ? "T2_anruf_notruf.mp4" : "T2_anruf_preis.mp4",
    t3: "T3_wizard.mp4",
    t4: "T4_bewertung.mp4",
  };
  const paths = {};
  for (const [key, file] of Object.entries(takeFiles)) {
    const p = join(ABGENOMMEN, file);
    if (!existsSync(p)) {
      console.error(`ERROR: take missing: ${p}`);
      console.error(`  (Betrieb in 07_stresstest/abgenommen/${slug}/ abgenommen?)`);
      process.exit(1);
    }
    paths[key] = p;
  }

  console.log(`\n📦 Proof-Seite für: ${companyName} (${slug})`);
  console.log(`   Variante: ${variant} (call_proof_variante=${cpv})`);
  console.log(`   Ansprache: ${salutation || "—"}  Inhaber: ${contact || "—"}`);
  console.log(`   Takes:`);
  for (const [key, file] of Object.entries(takeFiles)) {
    console.log(`     ${key.toUpperCase()}  ${file}  (${mb(paths[key])} MB)`);
  }

  if (dryRun) {
    console.log(`\n🟡 --dry-run: kein Upload, keine DB-Row.`);
    return;
  }

  // 3) Bunny upload
  const env = bunnyEnv();
  console.log(`\n⬆️  Upload zu Bunny Stream (Library ${env.libraryId}) …`);
  // T1 = canonical (betriebsübergreifend identisch) → KEIN per-Betrieb-Upload.
  const videos = { t1: CANONICAL_T1_GUID };
  console.log(`   T1 … canonical (${CANONICAL_T1_GUID}) — kein Upload`);
  for (const key of ["t2", "t3", "t4"]) {
    const title = `${companyName} — ${key.toUpperCase()} (${slug})`;
    process.stdout.write(`   ${key.toUpperCase()} … `);
    const guid = await createAndUpload(env, title, paths[key]);
    videos[key] = guid;
    console.log(`ok (${guid})`);
  }

  // 4) Token + DB row
  const token = randomBytes(12).toString("hex"); // 24 hex chars
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 Tage

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await sb.from("proof_pages").insert({
    token,
    tenant_slug: slug,
    company_name: companyName,
    contact_name: contact,
    contact_salutation: salutation,
    variant,
    videos,
    bunny_library_id: env.libraryId,
    status: "active",
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  if (error) {
    console.error(`\nERROR: proof_pages insert failed: ${error.message}`);
    console.error(`  Bunny-GUIDs (manuell verwertbar): ${JSON.stringify(videos)}`);
    process.exit(1);
  }

  const url = `${baseUrl}/p/${token}`;
  console.log(`\n✅ Beweis-Seite erstellt:`);
  console.log(`   ${url}`);
  console.log(`   gültig bis ${expiresAt.toISOString().slice(0, 10)} (30 Tage)`);
  console.log(`\n   Lokal testen: http://localhost:3000/p/${token}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
