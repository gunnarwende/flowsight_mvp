#!/usr/bin/env node
// ===========================================================================
// activate_prospect.mjs — Phase B-2: Prospect scharfschalten
//
// Wird ausgeführt wenn der Prospect sagt: "Ja, ich will testen."
// Voraussetzung: provision_trial.mjs --no-welcome-mail wurde bereits ausgeführt.
//
// Was es tut:
//   1. notification_email in tenant.modules setzen
//   2. OTP-Auth-User erstellen/aktualisieren auf die Prospect-Email
//   3. trial_status → trial_active, trial_start → jetzt, trial_end → +14 Tage
//   4. Welcome-Email mit Leitzentrale-Link senden
//   5. Pipeline-Status updaten
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/activate_prospect.mjs \
//     --slug=doerfler-ag \
//     --email=ramon@doerfler.ch \
//     [--dry-run]
//
// WICHTIG: Dieses Script DARF NUR ausgeführt werden wenn der Prospect
//          explizit bestätigt hat, dass er testen will + seine Email gegeben hat.
// ===========================================================================

import { createRequire } from "node:module";
import { sendEmail } from "./_lib/send_email.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

// ── Parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const prefix = `--${name}=`;
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}
const dryRun = args.includes("--dry-run");

const slug = getArg("slug");
const prospectEmail = getArg("email");

if (!slug || !prospectEmail) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/activate_prospect.mjs \\
    --slug=doerfler-ag \\
    --email=ramon@doerfler.ch \\
    [--dry-run]

This script activates a prospect for self-service testing (Phase B-2).
Run ONLY after the prospect confirms they want to test.
`);
  process.exit(1);
}

// ── ENV ─────────────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const appUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://flowsight.ch";

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const trialStart = new Date();
  const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000);
  const followUpAt = new Date(trialStart.getTime() + 10 * 24 * 60 * 60 * 1000);

  console.log("=".repeat(60));
  console.log("  FlowSight — Activate Prospect (Phase B-2)");
  console.log("=".repeat(60));
  console.log(`\n  Slug:     ${slug}`);
  console.log(`  Email:    ${prospectEmail}`);
  console.log(`  Trial:    ${trialStart.toISOString().slice(0, 10)} → ${trialEnd.toISOString().slice(0, 10)}`);
  console.log(`  Follow-up: ${followUpAt.toISOString().slice(0, 10)}`);
  if (dryRun) console.log("\n  DRY RUN — no changes\n");
  console.log();

  // ── Step 1: Load tenant ─────────────────────────────────────────────────
  console.log("── Step 1: Load Tenant ─────────────────────────────");

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, slug, name, modules, trial_status")
    .eq("slug", slug)
    .single();

  if (tenantErr || !tenant) {
    console.error(`  Tenant '${slug}' not found. Run provision_trial.mjs first.`);
    process.exit(1);
  }

  if (tenant.trial_status === "trial_active") {
    console.error(`  Tenant '${slug}' is already trial_active. Aborting to prevent double-activation.`);
    process.exit(1);
  }

  console.log(`  Found: ${tenant.name} (${tenant.id}) — status: ${tenant.trial_status}`);

  if (dryRun) {
    console.log("\n  DRY RUN complete. Would activate prospect.");
    return;
  }

  // ── Step 2: Set notification_email + activate trial ─────────────────────
  console.log("\n── Step 2: Activate Trial + Set Notification Email ─");

  const updatedModules = {
    ...(tenant.modules || {}),
    notification_email: prospectEmail,
  };

  const { error: updateErr } = await supabase
    .from("tenants")
    .update({
      modules: updatedModules,
      trial_status: "trial_active",
      trial_start: trialStart.toISOString(),
      trial_end: trialEnd.toISOString(),
      follow_up_at: followUpAt.toISOString(),
      prospect_email: prospectEmail,
    })
    .eq("id", tenant.id);

  if (updateErr) {
    console.error("  Failed:", updateErr.message);
    process.exit(1);
  }
  console.log(`  trial_status: ${tenant.trial_status} → trial_active`);
  console.log(`  notification_email: ${prospectEmail}`);
  console.log(`  trial: ${trialStart.toISOString().slice(0, 10)} → ${trialEnd.toISOString().slice(0, 10)}`);

  // ── Step 3: Create/update OTP auth user ─────────────────────────────────
  console.log("\n── Step 3: OTP Auth User ───────────────────────────");

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = users?.find((u) => u.email === prospectEmail);

  let userId;
  if (existing) {
    // Update: ensure correct tenant_id + role
    const { error: upErr } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { ...existing.app_metadata, role: "prospect", tenant_id: tenant.id },
    });
    if (upErr) {
      console.error("  Failed to update user:", upErr.message);
      process.exit(1);
    }
    userId = existing.id;
    console.log(`  Updated existing user: ${userId}`);
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: prospectEmail,
      email_confirm: true,
      app_metadata: { role: "prospect", tenant_id: tenant.id },
    });
    if (createErr) {
      console.error("  Failed to create user:", createErr.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`  Created user: ${userId}`);
  }

  // ── Step 4: Welcome Email ───────────────────────────────────────────────
  console.log("\n── Step 4: Welcome Email ───────────────────────────");

  const trialStartFmt = trialStart.toISOString().slice(0, 10);
  const trialEndFmt = trialEnd.toISOString().slice(0, 10);

  // Get phone number for the email
  const { data: phoneRows } = await supabase
    .from("tenant_numbers")
    .select("phone_number")
    .eq("tenant_id", tenant.id)
    .eq("active", true)
    .limit(1);
  const testPhone = phoneRows?.[0]?.phone_number;

  const welcomeHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1120;border-radius:8px;overflow:hidden">
<tr><td style="height:4px;background:#d4a853;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:20px 24px 12px;color:#d4a853;font-size:20px;font-weight:700;letter-spacing:0.5px">${tenant.name}</td></tr>
<tr><td style="padding:0 24px;color:#e2e8f0;font-size:22px;font-weight:700">Willkommen in Ihrer Leitzentrale</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Ihr Testzugang ist jetzt aktiv. So starten Sie:
</td></tr>
<tr><td style="padding:24px 24px 8px" align="center">
  <a href="${appUrl}/ops/login" target="_blank" style="display:inline-block;background:#d4a853;color:#0b1120;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px">Leitzentrale &ouml;ffnen</a>
</td></tr>
<tr><td style="padding:8px 24px 0;color:#64748b;font-size:13px;text-align:center">
Melden Sie sich mit <strong>${prospectEmail}</strong> an — Sie erhalten einen Code per E-Mail.
</td></tr>
${testPhone ? `<tr><td style="padding:20px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:6px">
  <tr><td style="padding:16px 20px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px">Ihre Testnummer</td></tr>
  <tr><td style="padding:0 20px 6px;color:#e2e8f0;font-size:20px;font-weight:700;letter-spacing:0.5px">${testPhone}</td></tr>
  <tr><td style="padding:0 20px 16px;color:#94a3b8;font-size:14px;line-height:1.5">Rufen Sie an und schildern Sie ein Anliegen — Ihre Assistentin nimmt alles auf.</td></tr>
  </table>
</td></tr>` : ""}
<tr><td style="padding:20px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:6px">
  <tr><td style="padding:16px 20px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px">Testzeitraum</td></tr>
  <tr><td style="padding:0 20px 16px;color:#e2e8f0;font-size:15px;font-weight:600">${trialStartFmt} bis ${trialEndFmt} (14 Tage)</td></tr>
  </table>
</td></tr>
<tr><td style="padding:28px 24px 20px;border-top:1px solid #1e293b;margin-top:24px">
  <div style="color:#64748b;font-size:13px;line-height:1.6;text-align:center">Fragen? Gunnar Wende &mdash; 044 552 09 19 &mdash; flowsight.ch</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const welcomeText = [
    `Willkommen in Ihrer Leitzentrale`,
    "",
    `Ihr Testzugang ist jetzt aktiv.`,
    "",
    `Leitzentrale öffnen: ${appUrl}/ops/login`,
    `Anmelden mit: ${prospectEmail} (Code kommt per E-Mail)`,
    "",
    ...(testPhone ? [`Ihre Testnummer: ${testPhone}`, "Rufen Sie an und schildern Sie ein Anliegen.", ""] : []),
    `Testzeitraum: ${trialStartFmt} bis ${trialEndFmt} (14 Tage)`,
    "",
    "---",
    "Fragen? Gunnar Wende — 044 552 09 19 — flowsight.ch",
  ].join("\n");

  const result = await sendEmail({
    to: prospectEmail,
    subject: `${tenant.name} — Ihr Testzugang ist bereit`,
    html: welcomeHtml,
    text: welcomeText,
    fromName: `${tenant.name} via FlowSight`,
  });

  if (result.success) {
    console.log(`  Welcome-Email sent: ${result.messageId}`);
  } else {
    console.error(`  Welcome-Email failed (non-fatal): ${result.error}`);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log("  PROSPECT ACTIVATED (Phase B-2)");
  console.log("=".repeat(60));
  console.log(`\n  Tenant:       ${tenant.name} (${tenant.slug})`);
  console.log(`  Tenant ID:    ${tenant.id}`);
  console.log(`  Email:        ${prospectEmail}`);
  console.log(`  User ID:      ${userId}`);
  console.log(`  Trial:        ${trialStartFmt} → ${trialEndFmt} (14 days)`);
  console.log(`  Follow-up:    ${followUpAt.toISOString().slice(0, 10)} (day 10)`);
  console.log(`  Notification: ${prospectEmail} (ops emails go here now)`);
  console.log(`  Welcome-Email: ${result.success ? "sent" : "failed"}`);
  console.log(`\n${"=".repeat(60)}`);
  console.log("\n  What happens now:");
  console.log("  1. Prospect received welcome email with Leitzentrale link");
  console.log("  2. Prospect can log in with OTP (code sent to their email)");
  console.log("  3. Ops emails for new cases go to prospect (not founder)");
  console.log("  4. Trial expires in 14 days (lifecycle tick handles milestones)");
  console.log(`\n  Follow-up on: ${followUpAt.toISOString().slice(0, 10)} (day 10)`);
  console.log(`  Decision day: ${trialEndFmt} (day 14)`);
  console.log(`\n  Offboard (if needed):`);
  console.log(`  node --env-file=src/web/.env.local scripts/_ops/offboard_tenant.mjs --slug=${slug}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
