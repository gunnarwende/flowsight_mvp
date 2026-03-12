#!/usr/bin/env node
/**
 * Onboard a new tenant: create tenant record, set modules, register phone numbers.
 *
 * Idempotent — safe to re-run (uses PostgREST upsert on all inserts).
 * Zero npm dependencies — uses native fetch against Supabase REST API.
 *
 * Usage (from repo root):
 *   node --env-file=src/web/.env.local scripts/_ops/onboard_tenant.mjs \
 *     --name "Muster Sanitär AG" \
 *     --slug muster-sanitaer \
 *     --phone "+41441234567" \
 *     --modules voice,website_wizard,ops
 *
 * Options:
 *   --name     Tenant display name (required)
 *   --slug     URL slug, lowercase-kebab (required)
 *   --phone    Phone number(s), E.164 format. Repeat for multiple: --phone "+41..." --phone "+41..."
 *   --modules  Comma-separated modules to enable: voice,website_wizard,ops,reviews (default: all)
 *   --dry-run  Show what would be done without writing to DB
 */

// ── CLI args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(flag) {
  const values = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1]) {
      values.push(args[i + 1]);
    }
  }
  return values;
}

function getFlag(flag) {
  return args.includes(flag);
}

const name = getArg("--name")[0];
const slug = getArg("--slug")[0];
const phones = getArg("--phone");
const modulesArg = getArg("--modules")[0] ?? "voice,website_wizard,ops,reviews";
const dryRun = getFlag("--dry-run");

if (!name || !slug) {
  console.error(`
Usage: node --env-file=src/web/.env.local scripts/_ops/onboard_tenant.mjs \\
  --name "Firma AG" --slug firma-ag --phone "+41441234567" [--modules voice,ops] [--dry-run]

Required:
  --name     Tenant display name
  --slug     URL slug (lowercase-kebab)

Optional:
  --phone    Phone number (E.164), repeatable
  --modules  Comma-separated: voice,website_wizard,ops,reviews (default: all)
  --dry-run  Preview without DB writes
`);
  process.exit(1);
}

// Validate slug format
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`ERROR: Invalid slug "${slug}". Must be lowercase-kebab (e.g. "muster-sanitaer").`);
  process.exit(1);
}

// Validate phone format
for (const p of phones) {
  if (!/^\+\d{8,15}$/.test(p)) {
    console.error(`ERROR: Invalid phone "${p}". Must be E.164 format (e.g. "+41441234567").`);
    process.exit(1);
  }
}

// Parse modules
const ALL_MODULES = ["voice", "website_wizard", "ops", "reviews"];
const modules = {};
for (const m of ALL_MODULES) {
  modules[m] = modulesArg.split(",").map((s) => s.trim()).includes(m);
}

// ── Env ─────────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
  console.error("Run with: node --env-file=src/web/.env.local scripts/_ops/onboard_tenant.mjs ...");
  process.exit(1);
}

const REST = `${url}/rest/v1`;
const HEADERS = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

// ── Helper ──────────────────────────────────────────────────────────────
async function query(path, opts = {}) {
  const res = await fetch(`${REST}${path}`, { ...opts, headers: { ...HEADERS, ...opts.headers } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.status >= 200 && res.status < 300, data };
}

// ── Preview ─────────────────────────────────────────────────────────────
console.log("\n╔════════════════════════════════════════════════════╗");
console.log("║          FlowSight — Tenant Onboarding            ║");
console.log("╚════════════════════════════════════════════════════╝\n");

console.log(`  Name:       ${name}`);
console.log(`  Slug:       ${slug}`);
console.log(`  Modules:    ${Object.entries(modules).filter(([, v]) => v).map(([k]) => k).join(", ")}`);
console.log(`  Phones:     ${phones.length > 0 ? phones.join(", ") : "(none)"}`);
console.log(`  Dry-run:    ${dryRun ? "YES" : "no"}`);
console.log("");

if (dryRun) {
  console.log("  [DRY-RUN] No changes will be written.\n");
}

// ── Step 1: Upsert tenant ───────────────────────────────────────────────
console.log("━━━ Step 1: Create/update tenant ━━━\n");

if (!dryRun) {
  const tenantRes = await query("/tenants?on_conflict=slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ name, slug, modules }),
  });

  if (!tenantRes.ok) {
    console.error(`  FAILED (HTTP ${tenantRes.status}):`, tenantRes.data);
    process.exit(1);
  }

  const tenant = Array.isArray(tenantRes.data) ? tenantRes.data[0] : tenantRes.data;
  console.log(`  Tenant upserted: ${tenant.id}`);
  console.log(`  Slug:    ${tenant.slug}`);
  console.log(`  Modules: ${JSON.stringify(tenant.modules)}\n`);

  // Store tenant_id for next steps
  globalThis.__tenantId = tenant.id;
} else {
  console.log(`  Would upsert tenant: name="${name}", slug="${slug}", modules=${JSON.stringify(modules)}\n`);
}

// ── Step 2: Register phone numbers ──────────────────────────────────────
if (phones.length > 0) {
  console.log("━━━ Step 2: Register phone numbers ━━━\n");

  for (const phone of phones) {
    if (!dryRun) {
      const tenantId = globalThis.__tenantId;
      const numRes = await query("/tenant_numbers?on_conflict=phone_number", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ phone_number: phone, tenant_id: tenantId, active: true }),
      });

      if (!numRes.ok) {
        console.error(`  FAILED for ${phone} (HTTP ${numRes.status}):`, numRes.data);
        process.exit(1);
      }

      const row = Array.isArray(numRes.data) ? numRes.data[0] : numRes.data;
      console.log(`  ${phone} → tenant ${row.tenant_id} (id: ${row.id}, active: ${row.active})`);
    } else {
      console.log(`  Would register: ${phone} → tenant "${slug}"`);
    }
  }
  console.log("");
} else {
  console.log("━━━ Step 2: No phone numbers — skipped ━━━\n");
}

// ── Step 3: Verification ────────────────────────────────────────────────
if (!dryRun) {
  console.log("━━━ Step 3: Verification ━━━\n");

  // Verify tenant exists
  const verifyTenant = await query(`/tenants?slug=eq.${encodeURIComponent(slug)}&select=id,name,slug,modules`);
  if (!verifyTenant.ok || !Array.isArray(verifyTenant.data) || verifyTenant.data.length === 0) {
    console.error("  Tenant verification FAILED:", verifyTenant.data);
    process.exit(1);
  }
  const t = verifyTenant.data[0];
  console.log(`  Tenant:   ${t.name} (${t.slug}) — ${t.id}`);

  // Verify phone numbers resolve correctly
  if (phones.length > 0) {
    let allPass = true;
    for (const phone of phones) {
      const resolve = await query(
        `/tenant_numbers?phone_number=eq.${encodeURIComponent(phone)}&active=eq.true&select=tenant_id&limit=1`
      );
      if (!resolve.ok || !Array.isArray(resolve.data) || resolve.data.length === 0) {
        console.error(`  Phone ${phone}: FAILED (not found)`);
        allPass = false;
        continue;
      }
      const match = resolve.data[0].tenant_id === t.id;
      console.log(`  Phone ${phone}: ${match ? "PASS" : "FAIL"}`);
      if (!match) allPass = false;
    }

    if (!allPass) {
      console.error("\n  Some verifications FAILED.");
      process.exit(1);
    }
  }

  // Module check
  const enabledModules = Object.entries(t.modules || {}).filter(([, v]) => v).map(([k]) => k);
  console.log(`  Modules:  ${enabledModules.join(", ") || "(none)"}`);

  console.log("\n━━━ Onboarding complete ━━━\n");
  console.log("  Next steps:");
  console.log(`  1. Create customer config:  src/web/src/lib/customers/${slug}.ts`);
  console.log(`  2. Register in:             src/web/src/lib/customers/registry.ts`);
  if (phones.length > 0) {
    console.log("  3. Configure Twilio SIP trunk → Retell Agent");
    console.log("  4. Import Retell agent JSONs (see retell/templates/README.md)");
  }
  console.log(`  5. Create status doc:       docs/customers/${slug}/status.md`);
  console.log(`  6. Update:                  docs/STATUS.md + docs/ticketlist.md`);
  console.log("");
} else {
  console.log("━━━ Step 3: Verification — skipped (dry-run) ━━━\n");
}
