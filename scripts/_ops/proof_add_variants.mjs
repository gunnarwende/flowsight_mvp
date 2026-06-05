#!/usr/bin/env node
/**
 * proof_add_variants.mjs — lädt neue Take-Varianten zu Bunny + patcht die
 * proof_pages-Row (Phase-3-Erweiterung, Founder 04.06.).
 *
 * - Ersetzt T1 durch die face-only-Variante (screenflows/<slug>/take1_faceonly.mp4).
 * - Fügt eine Handy-Hochformat-T2 hinzu (screenflows/<slug>/take2_portrait.mp4)
 *   als videos.t2_portrait (die Querformat-t2 bleibt für Desktop erhalten).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/proof_add_variants.mjs \
 *     --slug doerfler-ag --token <token>
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { bunnyEnv, createAndUpload, CANONICAL_T1_GUID } from "./_lib/bunny.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const slug = arg("slug");
const token = arg("token");
if (!slug || !token) { console.error("ERROR: --slug and --token required"); process.exit(1); }

const SF = join("docs/gtm/pipeline/06_video_production/screenflows", slug);
const t2portrait = join(SF, "take2_portrait.mp4");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: row, error } = await sb
    .from("proof_pages").select("token, company_name, videos").eq("token", token).single();
  if (error || !row) { console.error(`ERROR: proof_pages ${token} nicht gefunden`); process.exit(2); }
  const env = bunnyEnv();
  const videos = { ...(row.videos || {}) };

  // T1 = canonical (betriebsübergreifend identisch) → keine Generierung/Upload pro Betrieb.
  videos.t1 = CANONICAL_T1_GUID;
  console.log(`✓ T1 = canonical (${CANONICAL_T1_GUID})`);

  if (existsSync(t2portrait)) {
    process.stdout.write("⬆️  T2 portrait … ");
    videos.t2_portrait = await createAndUpload(env, `${row.company_name} — T2 portrait/mobile (${slug})`, t2portrait);
    console.log(`ok (${videos.t2_portrait})`);
  } else { console.log("⚠ take2_portrait.mp4 fehlt — kein t2_portrait"); }

  const { error: upErr } = await sb.from("proof_pages").update({ videos }).eq("token", token);
  if (upErr) { console.error(`ERROR: update failed: ${upErr.message}`); console.error(JSON.stringify(videos)); process.exit(1); }
  console.log(`\n✅ proof_pages aktualisiert. videos = ${JSON.stringify(videos, null, 2)}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
