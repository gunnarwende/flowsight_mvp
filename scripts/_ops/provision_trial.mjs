#!/usr/bin/env node
// ===========================================================================
// provision_trial.mjs — Single-script Trial Setup
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/provision_trial.mjs \
//     --slug=weinberger-ag \
//     --name="Jul. Weinberger AG" \
//     --phone="+41441234567" \
//     --prospect-email=hans@weinberger.ch \
//     [--modules=voice,website_wizard,ops,reviews,sms] \
//     [--gewerk=sanitaer] \
//     [--seed-count=15] \
//     [--dry-run]
//
// What it does (in order):
//   1. Upsert tenant in Supabase (with trial fields)
//   2. Assign phone number to tenant
//   3. Seed demo data (15 cases)
//   4. Create prospect auth user + magic link
//   5. Set trial_status=trial_active, trial_start, trial_end, follow_up_at
//   6. Output: magic link + summary
//
// NOTE: Voice Agent (retell_sync.mjs) runs SEPARATELY because it requires
//       agent JSON files to be prepared first. This script handles everything
//       else. Typical workflow:
//       1. Prepare agent JSON (from template)
//       2. retell_sync.mjs --prefix <slug>
//       3. provision_trial.mjs --slug <slug> ... (this script)
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env
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
const name = getArg("name");
const phone = getArg("phone");
const prospectEmail = getArg("prospect-email");
const modulesInput = getArg("modules") || "voice,website_wizard,ops,reviews,sms";
const gewerk = getArg("gewerk") || "sanitaer";
const seedCount = parseInt(getArg("seed-count") || "15", 10);

if (!slug || !name || !prospectEmail) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/provision_trial.mjs \\
    --slug=firma-ag \\
    --name="Firma AG" \\
    --phone="+41441234567" \\
    --prospect-email=hans@firma.ch \\
    [--modules=voice,website_wizard,ops,reviews,sms] \\
    [--gewerk=sanitaer|heizung|allgemein] \\
    [--seed-count=15] \\
    [--dry-run]
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
  "https://flowsight-mvp.vercel.app";

// ── Modules parsing ─────────────────────────────────────────────────────────
function parseModules(input) {
  const mods = {};
  for (const m of input.split(",")) {
    mods[m.trim()] = true;
  }
  return mods;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const trialStart = new Date();
  const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000);
  const followUpAt = new Date(trialStart.getTime() + 10 * 24 * 60 * 60 * 1000);

  console.log("=".repeat(60));
  console.log("  FlowSight — Trial Provisioning");
  console.log("=".repeat(60));
  console.log(`\n  Slug:     ${slug}`);
  console.log(`  Name:     ${name}`);
  console.log(`  Phone:    ${phone || "(none)"}`);
  console.log(`  Prospect: ${prospectEmail}`);
  console.log(`  Gewerk:   ${gewerk}`);
  console.log(`  Seed:     ${seedCount} cases`);
  console.log(`  Trial:    ${trialStart.toISOString().slice(0, 10)} → ${trialEnd.toISOString().slice(0, 10)}`);
  console.log(`  Follow-up: ${followUpAt.toISOString().slice(0, 10)}`);
  if (dryRun) console.log("\n  DRY RUN — no changes\n");
  console.log();

  // ── Step 1: Upsert Tenant ────────────────────────────────────────────────
  console.log("── Step 1: Tenant ─────────────────────────────────");

  const modules = parseModules(modulesInput);
  // Add SMS sender name from slug
  if (modules.sms) {
    modules.sms_sender_name = slug.replace(/-/g, "").slice(0, 11); // alphanumeric, max 11 chars
  }

  if (dryRun) {
    console.log(`  Would upsert tenant: ${slug} (${name})`);
  } else {
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .upsert(
        {
          slug,
          name,
          modules,
          trial_status: "trial_active",
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
          follow_up_at: followUpAt.toISOString(),
          prospect_email: prospectEmail,
        },
        { onConflict: "slug" }
      )
      .select("id, slug, name")
      .single();

    if (tenantErr) {
      console.error("  Failed:", tenantErr.message);
      process.exit(1);
    }
    console.log(`  Tenant: ${tenant.name} (${tenant.id})`);

    // ── Step 2: Assign phone number ──────────────────────────────────────
    console.log("\n── Step 2: Phone Number ────────────────────────────");

    if (phone) {
      const { error: phoneErr } = await supabase
        .from("tenant_numbers")
        .upsert(
          { tenant_id: tenant.id, phone_number: phone, active: true },
          { onConflict: "phone_number" }
        );
      if (phoneErr) {
        console.error("  Failed:", phoneErr.message);
      } else {
        console.log(`  Assigned: ${phone} → ${slug}`);
      }
    } else {
      console.log("  Skipped (no --phone provided)");
    }

    // ── Step 3: Seed demo data ───────────────────────────────────────────
    console.log("\n── Step 3: Demo Data ───────────────────────────────");

    // Import seed function inline (reuse logic from seed_demo_data.mjs)
    const { execSync } = await import("node:child_process");
    try {
      const seedCmd = `node --env-file=src/web/.env.local scripts/_ops/seed_demo_data.mjs --tenant=${tenant.id} --gewerk=${gewerk} --count=${seedCount}`;
      execSync(seedCmd, { cwd: process.cwd(), stdio: "inherit" });
    } catch (e) {
      console.error("  Seed failed (non-fatal):", e.message);
    }

    // ── Step 4: Create prospect access ───────────────────────────────────
    console.log("\n── Step 4: Prospect Access ─────────────────────────");

    // Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 });
    const existing = users?.find((u) => u.email === prospectEmail);

    let userId;
    if (existing) {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        app_metadata: { ...existing.app_metadata, role: "prospect", tenant_id: tenant.id },
      });
      if (updateErr) {
        console.error("  Failed to update user:", updateErr.message);
        process.exit(1);
      }
      userId = existing.id;
      console.log(`  Updated existing user: ${existing.id}`);
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

    // Generate magic link
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: prospectEmail,
      options: { redirectTo: `${appUrl}/ops/welcome` },
    });

    if (linkErr) {
      console.error("  Failed to generate magic link:", linkErr.message);
      process.exit(1);
    }

    const props = linkData.properties;
    const magicLink = `${url}/auth/v1/verify?token=${props.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${appUrl}/ops/welcome`)}`;

    // ── Step 5: Welcome-Mail ─────────────────────────────────────────────
    console.log("\n── Step 5: Welcome-Mail ────────────────────────────");

    const trialStartFmt = trialStart.toISOString().slice(0, 10);
    const trialEndFmt = trialEnd.toISOString().slice(0, 10);

    const phoneSection = phone
      ? `<!-- Trial phone -->
<tr><td style="padding:20px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:6px">
  <tr><td style="padding:16px 20px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px">Ihre Testnummer</td></tr>
  <tr><td style="padding:0 20px 6px;color:#e2e8f0;font-size:20px;font-weight:700;letter-spacing:0.5px">${phone}</td></tr>
  <tr><td style="padding:0 20px 16px;color:#94a3b8;font-size:14px;line-height:1.5">Rufen Sie jetzt an und sprechen Sie mit Ihrer pers&ouml;nlichen KI-Assistentin Lisa.</td></tr>
  </table>
</td></tr>`
      : "";

    const welcomeHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1120;border-radius:8px;overflow:hidden">
<!-- Gold accent bar -->
<tr><td style="height:4px;background:#d4a853;font-size:0;line-height:0">&nbsp;</td></tr>
<!-- Logo -->
<tr><td style="padding:20px 24px 12px;color:#d4a853;font-size:20px;font-weight:700;letter-spacing:0.5px">FlowSight</td></tr>
<!-- Heading -->
<tr><td style="padding:0 24px;color:#e2e8f0;font-size:22px;font-weight:700">Guten Tag</td></tr>
<!-- Welcome text -->
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Ihr FlowSight Trial ist aktiv. Ab sofort k&ouml;nnen Sie unser System testen.
</td></tr>
<!-- CTA button -->
<tr><td style="padding:24px 24px 8px" align="center">
  <a href="${magicLink}" target="_blank" style="display:inline-block;background:#d4a853;color:#0b1120;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px">Dashboard &ouml;ffnen</a>
</td></tr>
${phoneSection}
<!-- Trial period -->
<tr><td style="padding:20px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:6px">
  <tr><td style="padding:16px 20px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px">Trial-Zeitraum</td></tr>
  <tr><td style="padding:0 20px 16px;color:#e2e8f0;font-size:15px;font-weight:600">${trialStartFmt} bis ${trialEndFmt} (14 Tage)</td></tr>
  </table>
</td></tr>
<!-- What's included -->
<tr><td style="padding:20px 24px 0;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px">Das ist enthalten</td></tr>
<tr><td style="padding:8px 24px 0;color:#e2e8f0;font-size:14px;line-height:2">
&bull; Dashboard mit Demo-F&auml;llen<br>
&bull; Pers&ouml;nliche KI-Assistentin (Lisa)<br>
&bull; SMS-Best&auml;tigung nach jedem Anruf<br>
&bull; Review-System
</td></tr>
<!-- Footer -->
<tr><td style="padding:28px 24px 20px;border-top:1px solid #1e293b;margin-top:24px">
  <div style="color:#64748b;font-size:13px;line-height:1.6;text-align:center">Fragen? Gunnar Wende &mdash; 044 552 09 19 &mdash; flowsight.ch</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const welcomeText = [
      "Guten Tag",
      "",
      "Ihr FlowSight Trial ist aktiv. Ab sofort können Sie unser System testen.",
      "",
      `Dashboard öffnen: ${magicLink}`,
      "",
      ...(phone
        ? [`Ihre Testnummer: ${phone}`, "Rufen Sie jetzt an und sprechen Sie mit Ihrer persönlichen KI-Assistentin Lisa.", ""]
        : []),
      `Trial-Zeitraum: ${trialStartFmt} bis ${trialEndFmt} (14 Tage)`,
      "",
      "Das ist enthalten:",
      "- Dashboard mit Demo-Fällen",
      "- Persönliche KI-Assistentin (Lisa)",
      "- SMS-Bestätigung nach jedem Anruf",
      "- Review-System",
      "",
      "---",
      "Fragen? Gunnar Wende — 044 552 09 19 — flowsight.ch",
    ].join("\n");

    const welcomeResult = await sendEmail({
      to: prospectEmail,
      subject: "Willkommen — Ihr 14-Tage Trial bei FlowSight",
      html: welcomeHtml,
      text: welcomeText,
    });

    if (welcomeResult.success) {
      console.log(`  Welcome-Mail sent: ${welcomeResult.messageId}`);
    } else {
      console.error(`  Welcome-Mail failed (non-fatal): ${welcomeResult.error}`);
    }

    // ── Summary ──────────────────────────────────────────────────────────
    console.log(`\n${"=".repeat(60)}`);
    console.log("  TRIAL PROVISIONED");
    console.log("=".repeat(60));
    console.log(`\n  Tenant:       ${tenant.name} (${tenant.slug})`);
    console.log(`  Tenant ID:    ${tenant.id}`);
    console.log(`  Phone:        ${phone || "(none)"}`);
    console.log(`  Prospect:     ${prospectEmail}`);
    console.log(`  User ID:      ${userId}`);
    console.log(`  Trial:        ${trialStartFmt} → ${trialEndFmt} (14 days)`);
    console.log(`  Follow-up:    ${followUpAt.toISOString().slice(0, 10)} (day 10)`);
    console.log(`  Demo Cases:   ${seedCount}`);
    console.log(`  Welcome-Mail: ${welcomeResult.success ? "sent" : "failed"}`);
    console.log(`\n  Magic Link:`);
    console.log(`  ${magicLink}`);
    console.log(`\n${"=".repeat(60)}`);
    console.log("\n  Next steps:");
    console.log("  1. Welcome-Mail sent automatically (contains magic link)");
    console.log("  2. First-Call-Moment within 48h (call prospect number)");
    console.log("  3. Follow-up on " + followUpAt.toISOString().slice(0, 10));
    console.log("  4. Decision Day: " + trialEndFmt);
    console.log(`\n  Offboard (if needed):`);
    console.log(`  node --env-file=src/web/.env.local scripts/_ops/offboard_tenant.mjs --slug=${slug}`);
    console.log("=".repeat(60));
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
