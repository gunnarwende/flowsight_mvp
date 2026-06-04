#!/usr/bin/env node
/**
 * expire_proof_pages.mjs — Lifecycle-Cleanup der Beweis-Seiten.
 *
 * Strategie (project_email_phase_kickoff): „Video löschen nach 14 Tagen OHNE
 * Engagement." Pro Beweis-Seite ist `expires_at` = created + 14d gesetzt.
 *
 * Dieser Job (idempotent, als Cron gedacht — z.B. täglich):
 *   1. Findet aktive proof_pages mit abgelaufenem `expires_at`.
 *   2. „Ohne Engagement" (view_count = 0): Bunny-Videos löschen + status='expired'.
 *      Die token-private Seite zeigt danach automatisch „nicht mehr aktiv"
 *      (page.tsx prüft status + expiry).
 *   3. „Mit Engagement" (view_count > 0): NICHT automatisch löschen — der Founder
 *      ist evtl. im Gespräch. Wird nur gelistet (manuelle Entscheidung), außer
 *      --include-engaged ist gesetzt.
 *
 * Spart Bunny-Speicher (skaliert bei 10 Betrieben/Tag) ohne aktive Leads zu kappen.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/expire_proof_pages.mjs [--dry-run] [--include-engaged]
 */

import { createRequire } from "node:module";
import { bunnyEnv, deleteVideo } from "./_lib/bunny.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeEngaged = args.includes("--include-engaged");

async function main() {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const nowIso = new Date().toISOString();

  const { data, error } = await sb
    .from("proof_pages")
    .select("token, tenant_slug, videos, view_count, expires_at")
    .eq("status", "active")
    .lt("expires_at", nowIso);
  if (error) {
    console.error(`ERROR: query failed: ${error.message}`);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log("✓ Keine abgelaufenen aktiven Beweis-Seiten. Nichts zu tun.");
    return;
  }

  const env = bunnyEnv();
  let expired = 0,
    keptEngaged = 0,
    failed = 0;

  for (const row of data) {
    const engaged = (row.view_count ?? 0) > 0;
    if (engaged && !includeEngaged) {
      console.log(
        `⏸  ${row.tenant_slug} (${row.token.slice(0, 8)}…): abgelaufen, aber ENGAGED ` +
          `(${row.view_count} Views) → behalten (manuell entscheiden / --include-engaged).`
      );
      keptEngaged++;
      continue;
    }

    const guids = Object.values(row.videos || {}).filter(Boolean);
    console.log(
      `🗑  ${row.tenant_slug} (${row.token.slice(0, 8)}…): abgelaufen seit ` +
        `${String(row.expires_at).slice(0, 10)}, ${row.view_count} Views → ${guids.length} Videos löschen` +
        (dryRun ? "  [DRY-RUN]" : "")
    );
    if (dryRun) {
      expired++;
      continue;
    }

    try {
      for (const guid of guids) await deleteVideo(env, guid);
      const { error: upErr } = await sb
        .from("proof_pages")
        .update({ status: "expired" })
        .eq("token", row.token);
      if (upErr) throw new Error(upErr.message);
      expired++;
    } catch (e) {
      console.error(`   ✗ Fehler bei ${row.tenant_slug}: ${e.message}`);
      failed++;
    }
  }

  console.log(
    `\n── Summary ──\n  expired: ${expired} | engaged-kept: ${keptEngaged} | failed: ${failed}` +
      (dryRun ? "  (DRY-RUN — nichts verändert)" : "")
  );
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
