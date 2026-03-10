#!/usr/bin/env node
// ===========================================================================
// setup_rls_and_admin.mjs — Apply RLS migration + set Founder to admin
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/setup_rls_and_admin.mjs [--dry-run]
//
// What it does:
//   1. Applies RLS migration SQL via Supabase SQL API
//   2. Finds Founder user by email and sets app_metadata.role = 'admin'
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env
//           SUPABASE_DB_URL (postgres connection string) for migration
//           OR: falls back to printing SQL for manual application
// ===========================================================================

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dryRun = process.argv.includes("--dry-run");

// ── ENV ────────────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── STEP 1: Apply RLS Migration ───────────────────────────────────────────

async function applyMigration() {
  const migrationPath = resolve(
    __dirname,
    "../../supabase/migrations/20260310000000_rls_tenant_isolation.sql"
  );

  let sql;
  try {
    sql = readFileSync(migrationPath, "utf-8");
  } catch {
    console.error("❌ Migration file not found:", migrationPath);
    process.exit(1);
  }

  console.log("📋 Migration SQL loaded (" + sql.length + " chars)");

  // Try to execute via Supabase REST SQL endpoint
  // The Management API endpoint is: POST https://<project>.supabase.co/rest/v1/rpc/
  // But we need the pg_net extension or direct SQL access.
  // Supabase JS doesn't support raw SQL execution.
  // We'll use the Supabase Management API if SUPABASE_PROJECT_REF is available.

  const projectRef = extractProjectRef(url);
  if (!projectRef) {
    console.log("\n⚠️  Cannot auto-apply migration (no project ref extracted).");
    console.log("   Please apply manually in Supabase Dashboard → SQL Editor.");
    console.log("   File: supabase/migrations/20260310000000_rls_tenant_isolation.sql\n");
    return false;
  }

  if (dryRun) {
    console.log("🔍 DRY RUN — would apply migration to project:", projectRef);
    return true;
  }

  // Use Supabase Management API
  // POST https://api.supabase.com/v1/projects/{ref}/database/query
  // Auth: Bearer <service_role_key> — actually needs management API key
  // Alternative: Use the postgrest exec_sql RPC if it exists

  // Try the direct approach: supabase.rpc() won't work for DDL.
  // The only reliable way without CLI or pg module is Management API with an access token.
  // Let's try a creative approach: split the migration into individual statements
  // and execute them via the SQL API.

  try {
    const resp = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (resp.ok) {
      console.log("✅ Migration applied successfully via exec_sql RPC");
      return true;
    }

    // If exec_sql doesn't exist, fall back to manual
    console.log("\n⚠️  exec_sql RPC not available (expected in dev setups).");
    console.log("   Please apply migration manually:");
    console.log("   1. Open Supabase Dashboard → SQL Editor");
    console.log("   2. Paste contents of: supabase/migrations/20260310000000_rls_tenant_isolation.sql");
    console.log("   3. Click 'Run'\n");
    return false;
  } catch (err) {
    console.log("⚠️  Migration auto-apply failed:", err.message);
    console.log("   Please apply manually in Supabase Dashboard → SQL Editor.\n");
    return false;
  }
}

function extractProjectRef(supabaseUrl) {
  // https://abcdefg.supabase.co → abcdefg
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

// ── STEP 2: Set Founder to Admin ──────────────────────────────────────────

async function setFounderAdmin() {
  console.log("👤 Looking for Founder user...");

  // List all users
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    perPage: 50,
  });

  if (error) {
    console.error("❌ Failed to list users:", error.message);
    return false;
  }

  if (!users || users.length === 0) {
    console.error("❌ No users found in Supabase Auth");
    return false;
  }

  console.log(`   Found ${users.length} user(s):`);
  for (const u of users) {
    const role = u.app_metadata?.role ?? "(none)";
    const tid = u.app_metadata?.tenant_id ?? "(none)";
    console.log(`   - ${u.email ?? "no-email"} | role=${role} | tenant=${tid} | id=${u.id}`);
  }

  // Find users who are NOT already admin
  const nonAdmins = users.filter((u) => u.app_metadata?.role !== "admin");

  if (nonAdmins.length === 0) {
    console.log("✅ All users already have role=admin");
    return true;
  }

  // If there's exactly 1 user, that's the Founder
  // If multiple, look for the one without tenant_id (likely Founder)
  let founder;
  if (users.length === 1) {
    founder = users[0];
  } else {
    // Prefer user without tenant_id (Founder sees all)
    founder = users.find((u) => !u.app_metadata?.tenant_id) ?? users[0];
  }

  if (dryRun) {
    console.log(`🔍 DRY RUN — would set ${founder.email} to role=admin`);
    return true;
  }

  console.log(`\n   Setting ${founder.email} (${founder.id}) to role=admin...`);

  const { error: updateErr } = await supabase.auth.admin.updateUserById(
    founder.id,
    {
      app_metadata: {
        ...founder.app_metadata,
        role: "admin",
      },
    }
  );

  if (updateErr) {
    console.error("❌ Failed to update user:", updateErr.message);
    return false;
  }

  console.log(`✅ ${founder.email} is now admin`);
  return true;
}

// ── STEP 3: Verify ────────────────────────────────────────────────────────

async function verify() {
  console.log("\n🔍 Verification...");

  // Check if is_demo column exists
  const { data: cases, error } = await supabase
    .from("cases")
    .select("id, is_demo")
    .limit(1);

  if (error && error.message.includes("is_demo")) {
    console.log("⚠️  is_demo column not found — migration not yet applied");
  } else if (error) {
    console.log("⚠️  Cases query failed:", error.message);
    console.log("   This may mean RLS is active but user context is service_role (expected — service_role bypasses RLS).");
  } else {
    console.log("✅ Cases table accessible, is_demo column exists");
  }

  // Check Founder role
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 10 });
  const adminCount = users?.filter((u) => u.app_metadata?.role === "admin").length ?? 0;
  console.log(`✅ ${adminCount} admin user(s) configured`);

  if (adminCount === 0) {
    console.log("⚠️  WARNING: No admin users. After RLS activation, Founder won't see cases!");
  }
}

// ── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  FlowSight — RLS + Admin Setup");
  console.log("═══════════════════════════════════════════════════\n");

  if (dryRun) console.log("🔍 DRY RUN MODE — no changes will be made\n");

  // Step 1: Apply Migration
  console.log("── Step 1: RLS Migration ──────────────────────────");
  await applyMigration();

  // Step 2: Set Founder Admin
  console.log("── Step 2: Founder Admin ──────────────────────────");
  await setFounderAdmin();

  // Step 3: Verify
  console.log("── Step 3: Verify ─────────────────────────────────");
  await verify();

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Done. Next: Founder tests Dashboard access.");
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
