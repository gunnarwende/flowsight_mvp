#!/usr/bin/env node
// ===========================================================================
// create_prospect_access.mjs — Generate a Magic-Link for prospect demo access
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/create_prospect_access.mjs \
//     --email=prospect@example.com --tenant=weinberger-ag [--expires=24h]
//
// What it does:
//   1. Resolves tenant by slug or UUID
//   2. Creates (or updates) Supabase Auth user with role=prospect + tenant_id
//   3. Generates a magic link (OTP) via admin API
//   4. Outputs the magic link URL ready to send to the prospect
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

const email = getArg("email");
const tenantInput = getArg("tenant");
const expiresInput = getArg("expires") || "24h";

if (!email || !tenantInput) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/create_prospect_access.mjs \\
    --email=prospect@example.com --tenant=weinberger-ag [--expires=24h]

Options:
  --email     Prospect's email address (required)
  --tenant    Tenant slug or UUID (required)
  --expires   Link expiry: 24h, 48h, 7d (default: 24h)
`);
  process.exit(1);
}

// Parse expiry to seconds
function parseExpiry(input) {
  const match = input.match(/^(\d+)(h|d)$/);
  if (!match) return 86400; // default 24h
  const [, num, unit] = match;
  return unit === "h" ? Number(num) * 3600 : Number(num) * 86400;
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
  console.log("--- FlowSight — Prospect Access ---\n");

  // 1. Resolve tenant
  const isUuid = /^[0-9a-f]{8}-/.test(tenantInput);
  const { data: tenant, error: tenantErr } = isUuid
    ? await supabase.from("tenants").select("id, slug, name").eq("id", tenantInput).single()
    : await supabase.from("tenants").select("id, slug, name").eq("slug", tenantInput).single();

  if (tenantErr || !tenant) {
    console.error(`Tenant not found: ${tenantInput}`);
    process.exit(1);
  }
  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`Email:  ${email}`);

  // 2. Check if user already exists
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 });
  const existing = users?.find((u) => u.email === email);

  let userId;

  if (existing) {
    // Update existing user's metadata
    console.log(`User exists (${existing.id}) — updating metadata...`);
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: {
        ...existing.app_metadata,
        role: "prospect",
        tenant_id: tenant.id,
      },
    });
    if (updateErr) {
      console.error("Failed to update user:", updateErr.message);
      process.exit(1);
    }
    userId = existing.id;
  } else {
    // Create new user (no password — magic-link only)
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // auto-confirm so magic link works
      app_metadata: {
        role: "prospect",
        tenant_id: tenant.id,
      },
    });
    if (createErr) {
      console.error("Failed to create user:", createErr.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`User created: ${userId}`);
  }

  // 3. Generate magic link
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/ops/cases`,
    },
  });

  if (linkErr) {
    console.error("Failed to generate magic link:", linkErr.message);
    process.exit(1);
  }

  // The generated link contains hashed_token and other params.
  // We need to construct the full verification URL.
  const props = linkData.properties;
  const verificationUrl = `${url}/auth/v1/verify?token=${props.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${appUrl}/ops/cases`)}`;

  const expirySeconds = parseExpiry(expiresInput);
  const expiryHuman = expirySeconds >= 86400
    ? `${Math.round(expirySeconds / 86400)}d`
    : `${Math.round(expirySeconds / 3600)}h`;

  console.log(`\n${"=".repeat(60)}`);
  console.log("  PROSPECT MAGIC LINK");
  console.log("=".repeat(60));
  console.log(`\nTenant:  ${tenant.name}`);
  console.log(`Email:   ${email}`);
  console.log(`Role:    prospect`);
  console.log(`User ID: ${userId}`);
  console.log(`Expiry:  ${expiryHuman} (Supabase default)`);
  console.log(`\nLink:\n`);
  console.log(verificationUrl);
  console.log(`\n${"=".repeat(60)}`);
  console.log("\nProspect permissions:");
  console.log("  - View cases (own tenant only)");
  console.log("  - Change case status");
  console.log("  - Trigger review requests");
  console.log("  - NO: edit details, delete, create cases");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
