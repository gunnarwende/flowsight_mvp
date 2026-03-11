#!/usr/bin/env node
/**
 * Pre-Contact Quality Gate — verifies everything a prospect will see.
 *
 * Maps to §14 Pflichtbestandteile-Checkliste (gold_contact.md).
 * Prevents the 5 "Vertrauensbruch" Kill-Points.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/pre_contact_check.mjs --slug=weinberger-ag
 */

import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

// ── Parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const prefix = `--${name}=`;
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const slug = getArg("slug");
if (!slug) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/pre_contact_check.mjs --slug=weinberger-ag
`);
  process.exit(1);
}

// ── ENV ─────────────────────────────────────────────────────────────────────
const supaUrl = process.env.SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supaUrl || !supaKey) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
  process.exit(1);
}

const supabase = createClient(supaUrl, supaKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const appUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://flowsight-mvp.vercel.app";

// ── Report state ────────────────────────────────────────────────────────────
const checks = [];

function pass(name, detail) {
  checks.push({ status: "pass", name, detail });
  console.log(`  ✅  ${name} — ${detail}`);
}
function fail(name, detail) {
  checks.push({ status: "fail", name, detail });
  console.log(`  ❌  ${name} — ${detail}`);
}
function warn(name, detail) {
  checks.push({ status: "warn", name, detail });
  console.log(`  ⚠️  ${name} — ${detail}`);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("  FlowSight — Pre-Contact Quality Gate");
  console.log("=".repeat(60));
  console.log(`  Slug: ${slug}`);
  console.log(`  Date: ${new Date().toISOString().slice(0, 10)}`);
  console.log();

  // ── 0. Resolve tenant ─────────────────────────────────────────────────
  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, slug, name, modules")
    .eq("slug", slug)
    .single();

  if (tenantErr || !tenant) {
    console.error(`  FATAL: Tenant '${slug}' not found in Supabase.`);
    process.exit(1);
  }
  console.log(`  Tenant: ${tenant.name} (${tenant.id})\n`);

  // ── 1. Website 200 OK ────────────────────────────────────────────────
  const websiteUrl = `${appUrl}/kunden/${slug}`;
  try {
    const r = await fetch(websiteUrl, { signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      pass("Website", `${websiteUrl} → ${r.status}`);
    } else {
      fail("Website", `${websiteUrl} → ${r.status}`);
    }
  } catch (e) {
    fail("Website", `${websiteUrl} → ${e.message}`);
  }

  // ── 2. Wizard 200 OK ─────────────────────────────────────────────────
  const wizardUrl = `${appUrl}/kunden/${slug}/meldung`;
  try {
    const r = await fetch(wizardUrl, { signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      pass("Wizard", `${wizardUrl} → ${r.status}`);
    } else {
      fail("Wizard", `${wizardUrl} → ${r.status}`);
    }
  } catch (e) {
    fail("Wizard", `${wizardUrl} → ${e.message}`);
  }

  // ── 3. SMS Config ────────────────────────────────────────────────────
  const modules = tenant.modules || {};
  if (modules.sms === true && modules.sms_sender_name) {
    pass("SMS Config", `sms=true, sender="${modules.sms_sender_name}"`);
  } else if (modules.sms === true && !modules.sms_sender_name) {
    fail("SMS Config", "sms=true but sms_sender_name is missing");
  } else {
    fail("SMS Config", "sms module not enabled");
  }

  // ── 4. Voice Agent Published (config check) ──────────────────────────
  const agentIdsPath = resolve("retell/agent_ids.json");
  try {
    const agentIds = JSON.parse(readFileSync(agentIdsPath, "utf-8"));
    const entry = agentIds[slug];
    if (entry && entry.de_agent_id) {
      pass("Voice Agent", `de_agent_id=${entry.de_agent_id.slice(0, 20)}…`);
    } else {
      fail("Voice Agent", `No entry for '${slug}' in agent_ids.json`);
    }
  } catch (e) {
    fail("Voice Agent", `Cannot read agent_ids.json: ${e.message}`);
  }

  // ── 5. Phone Number Assigned ─────────────────────────────────────────
  const { data: numbers, error: numErr } = await supabase
    .from("tenant_numbers")
    .select("phone_number, active")
    .eq("tenant_id", tenant.id);

  if (numErr) {
    fail("Phone Number", `Query error: ${numErr.message}`);
  } else if (!numbers || numbers.length === 0) {
    fail("Phone Number", "No phone number assigned");
  } else {
    const active = numbers.filter((n) => n.active);
    if (active.length > 0) {
      pass("Phone Number", `${active.length} active: ${active.map((n) => n.phone_number).join(", ")}`);
    } else {
      fail("Phone Number", `${numbers.length} number(s) found but none active`);
    }
  }

  // ── 6. Demo Cases Count ──────────────────────────────────────────────
  const { count: caseCount, error: caseErr } = await supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);

  if (caseErr) {
    fail("Demo Cases", `Query error: ${caseErr.message}`);
  } else {
    // Load prospect_card.json for team_size heuristic
    let recommendation = "";
    const cardPath = resolve(`docs/customers/${slug}/prospect_card.json`);
    try {
      if (existsSync(cardPath)) {
        const card = JSON.parse(readFileSync(cardPath, "utf-8"));
        const teamSize = card.company?.employees_estimate || card.team?.length || null;
        if (teamSize && teamSize <= 8) {
          recommendation = ` (Meister-Betrieb ≤8 → 0-2 OK)`;
        } else if (teamSize && teamSize > 8) {
          recommendation = ` (Betrieb >8 → recommend 3-5)`;
        }
      }
    } catch { /* skip */ }

    if (caseCount > 0) {
      pass("Demo Cases", `${caseCount} cases${recommendation}`);
    } else {
      warn("Demo Cases", `0 cases — consider seeding demo data${recommendation}`);
    }
  }

  // ── 7. Magic Link ────────────────────────────────────────────────────
  const { data: accessRows, error: accessErr } = await supabase
    .from("prospect_access")
    .select("id, magic_token")
    .eq("tenant_id", tenant.id);

  if (accessErr) {
    // prospect_access table might not exist — treat as warning
    warn("Magic Link", `Query error: ${accessErr.message}`);
  } else if (!accessRows || accessRows.length === 0) {
    fail("Magic Link", "No prospect_access row found");
  } else {
    const withToken = accessRows.filter((r) => r.magic_token);
    if (withToken.length > 0) {
      pass("Magic Link", `${withToken.length} magic token(s) found`);
    } else {
      fail("Magic Link", "prospect_access row exists but magic_token is null");
    }
  }

  // ── 8. Review URL ────────────────────────────────────────────────────
  if (modules.google_review_url) {
    pass("Review URL", modules.google_review_url.slice(0, 60) + "…");
  } else {
    fail("Review URL", "modules.google_review_url not set");
  }

  // ── 9. Links Page ────────────────────────────────────────────────────
  const linksPath = resolve(`docs/customers/${slug}/links.md`);
  if (existsSync(linksPath)) {
    pass("Links Page", linksPath);
  } else {
    fail("Links Page", `Missing: docs/customers/${slug}/links.md`);
  }

  // ── Verdict ───────────────────────────────────────────────────────────
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;

  console.log(`\n${"=".repeat(60)}`);
  if (fails > 0) {
    console.log(`  ❌  NO-GO  —  ${fails} check(s) failed, ${warns} warning(s)`);
    console.log("=".repeat(60));
    console.log("\n  Fix the ❌ items above before contacting the prospect.\n");
    process.exitCode = 1;
  } else if (warns > 0) {
    console.log(`  ⚠️  GO (with ${warns} warning(s))`);
    console.log("=".repeat(60));
    console.log("\n  All critical checks passed. Review ⚠️ items above.\n");
  } else {
    console.log("  ✅  GO  —  All checks passed");
    console.log("=".repeat(60));
    console.log("\n  Ready to contact the prospect.\n");
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
