#!/usr/bin/env node
/**
 * insert_take4_lifecycle.mjs — Prepares case state & timestamps for Take 4.
 *
 * Writes appointment, completion, reminder + review timing into tenant_config.
 * Generates a valid HMAC review token so the Review-Link actually works (D17 fix).
 * Case-Status + appointment fields are NOT modified here — those happen LIVE
 * during Take 4 recording (real clicks in Leitsystem).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/insert_take4_lifecycle.mjs --slug doerfler-ag
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHmac } from "node:crypto";
import { getDemoTimes } from "./_lib/demo_time.mjs";
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
  console.error("Usage: insert_take4_lifecycle.mjs --slug <slug>");
  process.exit(1);
}

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));

console.log(`\n=== Take 4 Lifecycle Prep: ${config.tenant.name} (${slug}) ===\n`);

if (!config._wizard_time || !config._wizard_case_id) {
  console.error("Missing _wizard_time / _wizard_case_id — run insert_take3_wizard_case.mjs first.");
  process.exit(1);
}

// Reset wizard case to "Neu" state so Take 4 recording starts from clean slate.
// C3: Case creation time wird demo-time-basiert gesetzt (gestern Nachmittag),
// damit Verlauf konsistent demo-chronologisch erscheint.
{
  // Demo case creation: today 07:59 minus 15h = yesterday 16:59 local
  const dtLocal = await import("./_lib/demo_time.mjs");
  const dt = dtLocal.getDemoTimes({ skipGate: true });
  const caseCreatedAt = new Date(dt.demoNow.getTime() - 15 * 3600 * 1000);
  const smsSentAt = new Date(caseCreatedAt.getTime() + 30 * 1000);
  const caseCreatedIso = caseCreatedAt.toISOString();
  const smsSentIso = smsSentAt.toISOString();

  const { error: resetErr } = await sb.from("cases")
    .update({
      status: "new",
      assignee_text: null,
      scheduled_at: null,
      scheduled_end_at: null,
      review_sent_at: null,
      review_rating: null,
      review_received_at: null,
      review_text: null,
      created_at: caseCreatedIso,    // C3: demo-time Case-Creation
    })
    .eq("id", config._wizard_case_id);
  if (resetErr) {
    console.warn("Case reset warning:", resetErr.message);
  } else {
    console.log(`  ✓ Wizard-Case ${config._wizard_case_label} reset + created_at = ${caseCreatedIso}`);
  }
  // Wipe ALL case_events and re-seed with 2 initial events auf demo-time.
  await sb.from("case_events").delete().eq("case_id", config._wizard_case_id);
  const { data: caseAgain } = await sb.from("cases").select("tenant_id").eq("id", config._wizard_case_id).single();
  if (caseAgain) {
    const { data: inserted } = await sb.from("case_events").insert([
      {
        case_id: config._wizard_case_id, tenant_id: caseAgain.tenant_id,
        event_type: "case_created", title: "Fall erstellt via Website-Formular",
        created_at: caseCreatedIso,
      },
      {
        case_id: config._wizard_case_id, tenant_id: caseAgain.tenant_id,
        event_type: "sms_sent", title: "Bestätigungs-SMS an Kunden gesendet",
        created_at: smsSentIso,
      },
    ]).select();
    // DB-Trigger überschreibt ggf. created_at → per UPDATE erzwingen (Post-Insert).
    if (inserted) {
      for (const row of inserted) {
        const targetTime = row.event_type === "case_created" ? caseCreatedIso : smsSentIso;
        await sb.from("case_events").update({ created_at: targetTime }).eq("id", row.id);
      }
    }
    console.log(`  ✓ case_events rebuilt + UPDATE forced (fall=${caseCreatedIso}, sms=${smsSentIso})`);
  }
}

// A10: demo_time.mjs — fixed demo clock (today 07:59 / tomorrow 08:00).
// Workday-Gate: throws wenn heute ODER morgen kein CH-Werktag.
const dt = getDemoTimes();
const times = {
  demoNow: dt.iso.demoNow,
  start: dt.iso.appointmentStart,
  end: dt.iso.appointmentEnd,
  reminder: dt.iso.reminderSent,
  completion: dt.iso.completionTime,
  reviewSent: dt.iso.reviewSentTime,
  reviewRated: dt.iso.reviewRatedTime,
  confirmation: dt.iso.confirmationSent,
};
console.log(`  Demo-Jetzt (07:59):     ${times.demoNow}`);
console.log(`  Bestätigungs-SMS:       ${times.confirmation}`);
console.log(`  24h-Reminder (08:00):   ${times.reminder}`);
console.log(`  Termin Start (morgen):  ${times.start}`);
console.log(`  Termin Ende:            ${times.end}`);
console.log(`  Completion (+30 Min):   ${times.completion}`);
console.log(`  Bewertungsanfrage:      ${times.reviewSent}`);
console.log(`  Bewertung eingegangen:  ${times.reviewRated}`);

// Generate HMAC review token (D17 fix).
// Matches server-side algorithm in src/web/src/lib/sms/verifySmsToken.ts:
//   Secret: SMS_HMAC_SECRET
//   Payload: `{caseId}:{createdAt}` (ISO-format wie in DB gespeichert)
//   Short token: erste 8 Bytes (16 hex chars) von HMAC-SHA256.
const caseId = config._wizard_case_id;
// Secret handling: Try real SMS_HMAC_SECRET (production parity). If not set
// (local dev), fall back to demo-secret — review flow uses standalone HTML
// mock (take4_review.html) anyway, so token is only display text in SMS body.
const secret = process.env.SMS_HMAC_SECRET || "demo-take4-secret";
const { data: caseRow } = await sb.from("cases").select("created_at").eq("id", caseId).single();
if (!caseRow) {
  console.error(`Case ${caseId} not found in DB — run insert_take3_wizard_case.mjs first.`);
  process.exit(1);
}
const createdAtIso = caseRow.created_at;
const tokenFull = createHmac("sha256", secret).update(`${caseId}:${createdAtIso}`).digest();
const shortToken = tokenFull.subarray(0, 8).toString("hex");
const longToken = tokenFull.toString("hex");
console.log(`  Review-Short-Token:     ${shortToken} ${process.env.SMS_HMAC_SECRET ? "(real HMAC)" : "(demo)"}`);

// Ensure SMS-log table has the initial confirmation SMS (from Take 3) — idempotent.
// We add a new SMS-log placeholder for the 24h-Reminder + Review-Request here
// as references; the actual sending events will be written when Take 4
// records the real Leitsystem actions.
// For safety, no DB mutation of cases table — only write metadata to config.

const configUpdate = {
  ...config,
  _demo_now: times.demoNow,
  _confirmation_sent_time: times.confirmation,
  _appointment_start: times.start,
  _appointment_end: times.end,
  _reminder_time: times.reminder,
  _completion_time: times.completion,
  _review_sent_time: times.reviewSent,
  _review_rated_time: times.reviewRated,
  _review_token: shortToken,       // 16-hex für /r/[caseRef]?t=
  _review_token_long: longToken,   // 64-hex für /review/[id]?token=
  _case_created_at: createdAtIso,
};
await writeFile(configPath, JSON.stringify(configUpdate, null, 2), "utf-8");
console.log(`\n✓ Timing-Metadaten + Review-Token geschrieben in tenant_config.json`);
console.log(`=== DONE ===\n`);
