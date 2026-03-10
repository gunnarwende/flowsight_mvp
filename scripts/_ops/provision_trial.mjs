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
      options: { redirectTo: `${appUrl}/ops/cases` },
    });

    if (linkErr) {
      console.error("  Failed to generate magic link:", linkErr.message);
      process.exit(1);
    }

    const props = linkData.properties;
    const magicLink = `${url}/auth/v1/verify?token=${props.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${appUrl}/ops/cases`)}`;

    // ── Summary ──────────────────────────────────────────────────────────
    console.log(`\n${"=".repeat(60)}`);
    console.log("  TRIAL PROVISIONED");
    console.log("=".repeat(60));
    console.log(`\n  Tenant:       ${tenant.name} (${tenant.slug})`);
    console.log(`  Tenant ID:    ${tenant.id}`);
    console.log(`  Phone:        ${phone || "(none)"}`);
    console.log(`  Prospect:     ${prospectEmail}`);
    console.log(`  User ID:      ${userId}`);
    console.log(`  Trial:        ${trialStart.toISOString().slice(0, 10)} → ${trialEnd.toISOString().slice(0, 10)} (14 days)`);
    console.log(`  Follow-up:    ${followUpAt.toISOString().slice(0, 10)} (day 10)`);
    console.log(`  Demo Cases:   ${seedCount}`);
    console.log(`\n  Magic Link:`);
    console.log(`  ${magicLink}`);
    console.log(`\n${"=".repeat(60)}`);
    console.log("\n  Next steps:");
    console.log("  1. Send magic link to prospect (Welcome-Mail)");
    console.log("  2. First-Call-Moment within 48h (call prospect number)");
    console.log("  3. Follow-up on " + followUpAt.toISOString().slice(0, 10));
    console.log("  4. Decision Day: " + trialEnd.toISOString().slice(0, 10));
    console.log(`\n  Offboard (if needed):`);
    console.log(`  node --env-file=src/web/.env.local scripts/_ops/offboard_tenant.mjs --slug=${slug}`);
    console.log("=".repeat(60));
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
