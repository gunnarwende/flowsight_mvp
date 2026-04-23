#!/usr/bin/env node
/**
 * insert_take3_wizard_case.mjs — Adds the Take 3 Wizard-Case to existing seed state.
 *
 * Idempotent: deletes prior Take-3 wizard-case (if any) before inserting.
 * The Take-2 seed leaves the Phone-Case as highest seq_number (e.g. DA-0049).
 * This script inserts a Wizard-Case with seq = max + 1 (e.g. DA-0050),
 * created_at = _seed_time + 30 min, with 2 case_events.
 *
 * Writes _wizard_time ISO into tenant_config.json for produce_screenflow sync.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/insert_take3_wizard_case.mjs --slug doerfler-ag
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--slug"); return i >= 0 ? args[i + 1] : null; })();

if (!slug) {
  console.error("Usage: insert_take3_wizard_case.mjs --slug <slug>");
  process.exit(1);
}

// Reporter is ALWAYS Gunnar Wende (founder as sample customer, consistent with Take 2 Phone-Case name).
const REPORTER_NAME = "Gunnar Wende";
const REPORTER_PHONE = "076 489 89 80";
const REPORTER_EMAIL = "gunnar.wende@flowsight.ch";

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const seed = config.seed || {};
const wizCase = seed.wizard_demo_case || {};

console.log(`\n=== Take 3 Wizard-Case Insert: ${t.name} (${slug}) ===\n`);

// ── Resolve tenant ──
const { data: tenant, error: tErr } = await sb
  .from("tenants")
  .select("id, case_id_prefix")
  .eq("slug", slug)
  .single();

if (tErr || !tenant) {
  console.error(`Tenant ${slug} not found:`, tErr?.message);
  process.exit(1);
}

const TID = tenant.id;
const PREFIX = tenant.case_id_prefix || t.case_id_prefix || "FS";

// ── _seed_time must exist (from seed_screenflow_from_config.mjs) ──
if (!config._seed_time) {
  console.error("Missing _seed_time in tenant_config.json — run seed_screenflow_from_config.mjs first.");
  process.exit(1);
}

const seedTime = new Date(config._seed_time);
// Phone-Case is seedTime + ~4min (191s call + 60s buffer). Wizard-Case is seedTime + 30min.
const wizardTime = new Date(seedTime.getTime() + 30 * 60 * 1000);
console.log(`  Seed-Time (Phone-Case): ${seedTime.toISOString()}`);
console.log(`  Wizard-Time (+30min):   ${wizardTime.toISOString()}`);

// ── Delete prior Take-3 wizard-case (idempotent re-run) ──
// Identify by reporter_name + reporter_phone + source="wizard" + street="Bahnhofstrasse"
// + house_number="15" — unique combination for this scripted demo case.
const { error: delErr } = await sb
  .from("cases")
  .delete()
  .eq("tenant_id", TID)
  .eq("source", "wizard")
  .eq("reporter_name", REPORTER_NAME)
  .eq("street", "Bahnhofstrasse")
  .eq("house_number", "15");

if (delErr) {
  console.warn("Prior wizard-case delete warning:", delErr.message);
}

// ── Insert Wizard-Case (becomes new highest seq_number automatically) ──
const wizardCaseData = {
  tenant_id: TID,
  category: wizCase.kategorie || "Leck",
  status: "new",
  urgency: "normal",
  source: "wizard",
  reporter_name: REPORTER_NAME,
  contact_phone: REPORTER_PHONE,
  contact_email: REPORTER_EMAIL,
  street: "Bahnhofstrasse",
  house_number: "15",
  city: "Oberrieden",
  plz: "8942",
  // Take-3-Story: Kunde tippt live "Irgendetwas scheint undicht zu sein".
  // Muss identisch sein zu record_wizard_take3.mjs DESCRIPTION, damit das
  // Leitsystem-Case-Detail die GLEICHE Beschreibung zeigt wie die getippte.
  description: "Irgendetwas scheint undicht zu sein",
  created_at: wizardTime.toISOString(),
  updated_at: wizardTime.toISOString(),
  is_demo: false,
};

const { data: inserted, error: insErr } = await sb
  .from("cases")
  .insert(wizardCaseData)
  .select("id, seq_number")
  .single();

if (insErr || !inserted) {
  console.error("Insert wizard-case failed:", insErr?.message);
  process.exit(1);
}

const caseIdLabel = `${PREFIX}-${String(inserted.seq_number).padStart(4, "0")}`;
console.log(`✓ Wizard-Case inserted: ${caseIdLabel} (id=${inserted.id})`);

// ── 2 Case-Events (mirrors Take 3 Script narrative) ──
// Event 1: "Fall erstellt via Website-Formular" at wizardTime
// Event 2: "Bestätigungs-SMS an Kunden gesendet" at wizardTime + 1s
const events = [
  {
    case_id: inserted.id,
    tenant_id: TID,
    event_type: "case_created",
    title: "Fall erstellt via Website-Formular",
    created_at: wizardTime.toISOString(),
  },
  {
    case_id: inserted.id,
    tenant_id: TID,
    event_type: "sms_sent",
    title: "Bestätigungs-SMS an Kunden gesendet",
    created_at: new Date(wizardTime.getTime() + 1000).toISOString(),
  },
];

const { error: evtErr } = await sb.from("case_events").insert(events);
if (evtErr) {
  console.warn("Case-Events insert warning:", evtErr.message);
} else {
  console.log(`✓ 2 Case-Events angelegt (Fall erstellt + SMS gesendet)`);
}

// ── Persist wizard timing + case-id into tenant_config.json ──
const configUpdate = {
  ...config,
  _wizard_time: wizardTime.toISOString(),
  _wizard_case_id: inserted.id,
  _wizard_seq_number: inserted.seq_number,
  _wizard_case_label: caseIdLabel,
};
await writeFile(configPath, JSON.stringify(configUpdate, null, 2), "utf-8");
console.log(`✓ _wizard_time + _wizard_case_label geschrieben in tenant_config.json`);

console.log(`\n=== DONE ===\n`);
