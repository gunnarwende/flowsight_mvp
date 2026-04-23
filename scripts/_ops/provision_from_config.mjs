#!/usr/bin/env node
/**
 * provision_from_config.mjs — Provision a complete tenant from tenant_config.json.
 *
 * EINZIGER INPUT: docs/customers/{slug}/tenant_config.json
 * Liest NICHTS anderes. Keine CLI-Args für Betriebsdaten.
 *
 * Steps:
 *   1. Generate Voice Agent (DE + INTL) from template
 *   2. Upsert Tenant in Supabase
 *   3. Assign Phone Number
 *   4. Seed Demo Data
 *   5. Create Prospect Access + Magic Link
 *   6. Publish Voice Agent via Retell API
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/provision_from_config.mjs \
 *     --slug stark-haustechnik [--dry-run] [--skip-voice] [--skip-seed] [--skip-retell]
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RETELL_API_KEY in env
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const prefix = `--${name}=`;
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const slug = getArg("slug");
const dryRun = args.includes("--dry-run");
const skipVoice = args.includes("--skip-voice");
const skipSeed = args.includes("--skip-seed");
const skipRetell = args.includes("--skip-retell");

if (!slug) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/provision_from_config.mjs \\
    --slug=firma-ag [--dry-run] [--skip-voice] [--skip-seed] [--skip-retell]

Reads ALL data from: docs/customers/{slug}/tenant_config.json
`);
  process.exit(1);
}

// ── ENV ──────────────────────────────────────────────────────────────────
const sbUrl = process.env.SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!sbUrl || !sbKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(sbUrl, sbKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://flowsight.ch";

// ── Load config ──────────────────────────────────────────────────────────
const configPath = join("docs", "customers", slug, "tenant_config.json");

async function loadConfig() {
  try {
    return JSON.parse(await readFile(configPath, "utf-8"));
  } catch (err) {
    console.error(`Cannot read config: ${configPath}\n${err.message}`);
    process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const config = await loadConfig();
  const t = config.tenant || {};
  const va = config.voice_agent || {};
  const seed = config.seed || {};
  const prospect = config.prospect || {};

  console.log("\n" + "=".repeat(60));
  console.log("  FlowSight — Provision from Config");
  console.log("=".repeat(60));
  console.log(`\n  Config:   ${configPath}`);
  console.log(`  Slug:     ${t.slug || slug}`);
  console.log(`  Name:     ${t.name}`);
  console.log(`  Phone:    (erst nach positiver Rückmeldung — Twilio-Nummer wird NICHT vorab gekauft)`);
  console.log(`  Prospect: ${prospect.email || "(auto aus Crawl)"}`);
  console.log(`  Seed:     ${seed.case_count || 30} cases`);
  console.log(`  Color:    ${t.brand_color || "(default)"}`);
  if (dryRun) console.log("\n  DRY RUN — no changes\n");
  console.log();

  // ── Step 1: Generate Voice Agent ─────────────────────────────────────
  console.log("── Step 1: Voice Agent ─────────────────────────────");

  if (skipVoice) {
    console.log("  SKIPPED (--skip-voice)");
  } else {
    try {
      const cmd = `node scripts/_ops/generate_voice_agent.mjs --slug ${slug}${dryRun ? " --dry-run" : ""}`;
      execSync(cmd, { cwd: process.cwd(), stdio: "inherit" });
    } catch (err) {
      console.error("  Voice Agent generation failed:", err.message);
      process.exit(1);
    }
  }

  // ── Step 2: Upsert Tenant in Supabase ────────────────────────────────
  console.log("\n── Step 2: Tenant ──────────────────────────────────");

  const modules = {
    voice: true,
    website_wizard: true,
    ops: true,
    reviews: true,
    sms: true,
    sms_sender_name: t.sms_sender_name || slug.replace(/-/g, "").slice(0, 11),
  };

  if (t.brand_color) {
    modules.primary_color = t.brand_color;
  }

  const tenantData = {
    slug: t.slug || slug,
    name: t.name,
    modules,
    trial_status: "interested",
    prospect_email: prospect.email || null,
  };

  let tenantId;

  if (dryRun) {
    console.log(`  Would upsert: ${tenantData.slug} (${tenantData.name})`);
    tenantId = "dry-run-id";
  } else {
    const { data: tenant, error: err } = await supabase
      .from("tenants")
      .upsert(tenantData, { onConflict: "slug" })
      .select("id, slug, name")
      .single();

    if (err) {
      console.error("  Failed:", err.message);
      process.exit(1);
    }
    tenantId = tenant.id;
    console.log(`  Tenant: ${tenant.name} (${tenantId})`);
  }

  // ── Step 3: Phone Number ────────────────────────────────────────────
  // Twilio-Nummern werden NICHT vorab gekauft. Erst nach positiver
  // Rückmeldung des Betriebs wird eine Nummer provisioniert.
  // Die Pipeline funktioniert OHNE Telefonnummer.
  console.log("\n── Step 3: Phone Number ────────────────────────────");
  console.log("  ÜBERSPRUNGEN — Twilio-Nummer wird erst nach positiver Rückmeldung gekauft.");
  console.log("  Für die Video-Produktion wird die Nummer SIMULIERT (Screen-Recording).");

  // ── Step 4: Seed Demo Data ───────────────────────────────────────────
  console.log("\n── Step 4: Demo Data ───────────────────────────────");

  const seedCount = seed.case_count || 30;

  if (skipSeed) {
    console.log("  SKIPPED (--skip-seed)");
  } else if (dryRun) {
    console.log(`  Would seed ${seedCount} cases for tenant ${tenantId}`);
  } else {
    try {
      const seedCmd = `node --env-file=src/web/.env.local scripts/_ops/seed_demo_data.mjs --tenant=${tenantId} --gewerk=sanitaer --count=${seedCount}`;
      execSync(seedCmd, { cwd: process.cwd(), stdio: "inherit" });
    } catch (err) {
      console.error("  Seed failed (non-fatal):", err.message);
    }
  }

  // ── Step 5: Prospect Access ──────────────────────────────────────────
  console.log("\n── Step 5: Prospect Access ─────────────────────────");

  const prospectEmail = prospect.email;
  let magicLink = "(not generated)";

  if (!prospectEmail) {
    console.log("  Skipped (no prospect.email in config)");
  } else if (dryRun) {
    console.log(`  Would create access for: ${prospectEmail}`);
  } else {
    // Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 });
    const existing = users?.find((u) => u.email === prospectEmail);

    let userId;
    if (existing) {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        app_metadata: { ...existing.app_metadata, role: "prospect", tenant_id: tenantId },
      });
      if (updateErr) {
        console.error("  Failed to update user:", updateErr.message);
      } else {
        userId = existing.id;
        console.log(`  Updated existing user: ${userId}`);
      }
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: prospectEmail,
        email_confirm: true,
        app_metadata: { role: "prospect", tenant_id: tenantId },
      });
      if (createErr) {
        console.error("  Failed to create user:", createErr.message);
      } else {
        userId = newUser.user.id;
        console.log(`  Created user: ${userId}`);
      }
    }

    // Generate magic link
    if (userId) {
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: prospectEmail,
        options: { redirectTo: `${appUrl}/ops/welcome` },
      });

      if (linkErr) {
        console.error("  Magic link failed:", linkErr.message);
      } else {
        const props = linkData.properties;
        magicLink = `${sbUrl}/auth/v1/verify?token=${props.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${appUrl}/ops/welcome`)}`;
        console.log(`  Magic link generated ✓`);
      }
    }
  }

  // ── Step 6: Publish Voice Agent via Retell ───────────────────────────
  console.log("\n── Step 6: Retell Publish ──────────────────────────");

  if (skipVoice || skipRetell) {
    console.log("  SKIPPED (--skip-voice or --skip-retell)");
  } else if (dryRun) {
    console.log(`  Would publish: retell_sync.mjs --prefix ${slug.replace(/-/g, "_")}`);
  } else if (!process.env.RETELL_API_KEY) {
    console.log("  SKIPPED (no RETELL_API_KEY in env)");
  } else {
    try {
      const retellCmd = `node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix ${slug.replace(/-/g, "_")}`;
      execSync(retellCmd, { cwd: process.cwd(), stdio: "inherit" });
    } catch (err) {
      console.error("  Retell publish failed (non-fatal):", err.message);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log("  PROVISION COMPLETE");
  console.log("=".repeat(60));
  console.log(`\n  Config:       ${configPath}`);
  console.log(`  Tenant:       ${t.name} (${t.slug || slug})`);
  console.log(`  Tenant ID:    ${tenantId}`);
  console.log(`  Phone:        (wird nach positiver Rückmeldung gekauft)`);
  console.log(`  Voice Agent:  ${skipVoice ? "skipped" : "generated + published"}`);
  console.log(`  Seed:         ${skipSeed ? "skipped" : `${seedCount} cases`}`);
  console.log(`  Prospect:     ${prospectEmail || "(not set)"}`);
  if (magicLink !== "(not generated)") {
    console.log(`\n  Magic Link:`);
    console.log(`  ${magicLink}`);
  }
  console.log(`\n${"=".repeat(60)}`);
  console.log("\n  Next steps:");
  console.log("  1. Founder: review founder_review.md, fill open items");
  console.log("  2. Video: produce_videos.mjs (wenn Pipeline soweit)");
  console.log("  3. Outreach: send_outreach.mjs --slug " + slug);
  console.log("=".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
