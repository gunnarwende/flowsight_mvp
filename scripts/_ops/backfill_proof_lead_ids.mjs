#!/usr/bin/env node
/**
 * backfill_proof_lead_ids.mjs — Customer-Journey Phase 2/Tranche 2b.
 *
 * Verknüpft bestehende proof_pages (versandte Beweis-Seiten) mit ihrem Lead in
 * der `leads`-Tabelle (setzt proof_pages.lead_id), via normalisiertem
 * Firmennamen-Match. So hängt das "Gesehen"-Signal (view_count) rückwirkend am
 * Lead und der Funnel kann pro Lead aufgelöst werden.
 *
 * Sicher: setzt lead_id NUR, wo es noch NULL ist und genau ein Lead matcht.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/backfill_proof_lead_ids.mjs [--dry-run]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const DRY = process.argv.includes("--dry-run");

function normName(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(gmbh|ag|sa|sàrl|sarl)\b/g, "").replace(/[^a-z0-9& ]/g, "").replace(/\s+/g, " ").trim();
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen (--env-file=src/web/.env.local?)"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const { data: leads, error: le } = await sb.from("leads").select("id, firma");
if (le) { console.error("leads:", le.message); process.exit(1); }
const { data: proofs, error: pe } = await sb.from("proof_pages").select("token, company_name, tenant_slug, lead_id");
if (pe) { console.error("proof_pages:", pe.message); process.exit(1); }

// Lead-Index nach normalisiertem Namen (nur eindeutige Namen → kein Fehlmatch)
const byName = new Map();
const dupes = new Set();
for (const l of leads) {
  const k = normName(l.firma);
  if (!k) continue;
  if (byName.has(k)) dupes.add(k); else byName.set(k, l.id);
}

let matched = 0, already = 0, ambiguous = 0, nomatch = 0;
const updates = [];
for (const p of proofs) {
  if (p.lead_id) { already++; continue; }
  const k = normName(p.company_name);
  if (dupes.has(k)) { ambiguous++; console.log(`  ⚠ mehrdeutig: ${p.company_name}`); continue; }
  let id = byName.get(k);
  // Fallback: Kurzname (proof) ist Präfix des vollen Lead-Namens — nur wenn EINDEUTIG.
  if (!id && k.length >= 4) {
    const hits = leads.filter((l) => normName(l.firma).startsWith(k + " ") || normName(l.firma) === k);
    if (hits.length === 1) { id = hits[0].id; console.log(`  ~ Präfix-Match: ${p.company_name} → ${hits[0].firma}`); }
    else if (hits.length > 1) { ambiguous++; console.log(`  ⚠ Präfix mehrdeutig: ${p.company_name} (${hits.length})`); continue; }
  }
  if (!id) { nomatch++; console.log(`  – kein Lead-Match: ${p.company_name} (${p.tenant_slug})`); continue; }
  updates.push({ token: p.token, lead_id: id, name: p.company_name });
  matched++;
}

console.log(`\nproof_pages: ${proofs.length} · bereits verknüpft ${already} · neu matchbar ${matched} · mehrdeutig ${ambiguous} · ohne Match ${nomatch}`);
if (DRY) { console.log("(DRY-RUN — nichts geschrieben)"); process.exit(0); }

for (const u of updates) {
  const { error } = await sb.from("proof_pages").update({ lead_id: u.lead_id }).eq("token", u.token);
  if (error) { console.error(`  Fehler ${u.name}:`, error.message); continue; }
  console.log(`  ✓ ${u.name} → lead_id gesetzt`);
}
console.log(`\n✅ Backfill fertig: ${updates.length} proof_pages verknüpft.`);
