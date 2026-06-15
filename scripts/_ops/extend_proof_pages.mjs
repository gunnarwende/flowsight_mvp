#!/usr/bin/env node
/**
 * extend_proof_pages.mjs — zieht aktive Beweis-Seiten auf die aktuelle
 * 30-Tage-Lifecycle-Politik nach (Policy-Wechsel 15.06.2026, vorher 14d).
 *
 * Setzt expires_at = created_at + 30 Tage für alle status='active'-Seiten,
 * deren aktuelles expires_at FRÜHER liegt (idempotent — verkürzt nie).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/extend_proof_pages.mjs [--dry-run]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const DRY = process.argv.includes("--dry-run");
const DAYS = 30;

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: rows, error } = await sb
  .from("proof_pages")
  .select("token, tenant_slug, created_at, expires_at, status")
  .eq("status", "active");

if (error) {
  console.error(`ERROR: select failed: ${error.message}`);
  process.exit(1);
}

let changed = 0;
for (const r of rows ?? []) {
  const created = new Date(r.created_at);
  const target = new Date(created.getTime() + DAYS * 24 * 60 * 60 * 1000);
  const current = r.expires_at ? new Date(r.expires_at) : null;
  const needs = !current || current < target;
  const tag = needs ? (DRY ? "WÜRDE →" : "→") : "ok  ";
  console.log(
    `  ${tag} ${r.tenant_slug.padEnd(18)} ${r.token.slice(0, 8)}  ` +
      `${String(r.expires_at).slice(0, 10)} ⇒ ${target.toISOString().slice(0, 10)}`
  );
  if (needs && !DRY) {
    const { error: uErr } = await sb
      .from("proof_pages")
      .update({ expires_at: target.toISOString() })
      .eq("token", r.token);
    if (uErr) {
      console.error(`     FEHLER update ${r.token.slice(0, 8)}: ${uErr.message}`);
      continue;
    }
    changed++;
  } else if (needs) {
    changed++;
  }
}

console.log(`\n── ${DRY ? "DRY-RUN" : "Fertig"} ── aktive Seiten: ${rows?.length ?? 0} · ${DRY ? "zu ändern" : "geändert"}: ${changed}`);
