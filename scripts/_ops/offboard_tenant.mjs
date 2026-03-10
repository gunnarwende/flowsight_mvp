#!/usr/bin/env node
// ===========================================================================
// offboard_tenant.mjs — Clean Delete for Trial Offboarding
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/offboard_tenant.mjs \
//     --slug=weinberger-ag \
//     [--keep-agents]       # Skip Retell agent deactivation
//     [--dry-run]
//
// What it does (in order):
//   1. Resolve tenant by slug
//   2. Delete case_attachments for tenant cases
//   3. Delete case_events for tenant
//   4. Delete cases for tenant
//   5. Delete tenant_numbers
//   6. Deactivate Retell agents (DE + INTL) — unless --keep-agents
//   7. Delete prospect auth user (by prospect_email)
//   8. Set tenant trial_status = 'offboarded'
//   9. Output cleanup summary
//
// NOTE: This does NOT delete the tenant row (keeps audit trail).
//       To hard-delete, use --hard-delete flag.
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env
// ===========================================================================

import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
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
const dryRun = args.includes("--dry-run");
const keepAgents = args.includes("--keep-agents");
const hardDelete = args.includes("--hard-delete");

const slug = getArg("slug");
if (!slug) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/offboard_tenant.mjs \\
    --slug=firma-ag \\
    [--keep-agents] \\
    [--dry-run] \\
    [--hard-delete]
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

const retellApiKey = process.env.RETELL_API_KEY;

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("  FlowSight — Tenant Offboarding");
  console.log("=".repeat(60));
  console.log(`\n  Slug:         ${slug}`);
  console.log(`  Keep Agents:  ${keepAgents}`);
  console.log(`  Hard Delete:  ${hardDelete}`);
  if (dryRun) console.log("\n  DRY RUN — no changes\n");
  console.log();

  const summary = { attachments: 0, events: 0, cases: 0, numbers: 0, agents: 0, authUser: false, tenant: false };

  // ── Step 1: Resolve tenant ──────────────────────────────────────────────
  console.log("── Step 1: Resolve Tenant ─────────────────────────");

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, slug, name, prospect_email, trial_status")
    .eq("slug", slug)
    .single();

  if (tenantErr || !tenant) {
    console.error(`  Tenant '${slug}' not found.`);
    process.exit(1);
  }
  console.log(`  Found: ${tenant.name} (${tenant.id})`);
  console.log(`  Status: ${tenant.trial_status || "(none)"}`);
  console.log(`  Prospect: ${tenant.prospect_email || "(none)"}`);

  // ── Step 2: Delete case_attachments ─────────────────────────────────────
  console.log("\n── Step 2: Case Attachments ────────────────────────");

  // Get case IDs first
  const { data: cases } = await supabase
    .from("cases")
    .select("id")
    .eq("tenant_id", tenant.id);

  const caseIds = (cases || []).map((c) => c.id);

  if (caseIds.length > 0) {
    if (dryRun) {
      console.log(`  Would delete attachments for ${caseIds.length} cases`);
    } else {
      const { count } = await supabase
        .from("case_attachments")
        .delete({ count: "exact" })
        .in("case_id", caseIds);
      summary.attachments = count || 0;
      console.log(`  Deleted: ${summary.attachments} attachments`);
    }
  } else {
    console.log("  No cases found — skipping");
  }

  // ── Step 3: Delete case_events ──────────────────────────────────────────
  console.log("\n── Step 3: Case Events ─────────────────────────────");

  if (dryRun) {
    console.log(`  Would delete events for tenant ${tenant.id}`);
  } else {
    const { count } = await supabase
      .from("case_events")
      .delete({ count: "exact" })
      .eq("tenant_id", tenant.id);
    summary.events = count || 0;
    console.log(`  Deleted: ${summary.events} events`);
  }

  // ── Step 4: Delete cases ────────────────────────────────────────────────
  console.log("\n── Step 4: Cases ───────────────────────────────────");

  if (dryRun) {
    console.log(`  Would delete ${caseIds.length} cases`);
  } else {
    const { count } = await supabase
      .from("cases")
      .delete({ count: "exact" })
      .eq("tenant_id", tenant.id);
    summary.cases = count || 0;
    console.log(`  Deleted: ${summary.cases} cases`);
  }

  // ── Step 5: Delete tenant_numbers ───────────────────────────────────────
  console.log("\n── Step 5: Phone Numbers ───────────────────────────");

  if (dryRun) {
    console.log(`  Would delete numbers for tenant ${tenant.id}`);
  } else {
    const { count } = await supabase
      .from("tenant_numbers")
      .delete({ count: "exact" })
      .eq("tenant_id", tenant.id);
    summary.numbers = count || 0;
    console.log(`  Deleted: ${summary.numbers} numbers`);
  }

  // ── Step 6: Deactivate Retell agents ────────────────────────────────────
  console.log("\n── Step 6: Retell Agents ───────────────────────────");

  if (keepAgents) {
    console.log("  Skipped (--keep-agents)");
  } else {
    const idsPath = resolve(process.cwd(), "retell/agent_ids.json");
    let agentIds;
    try {
      agentIds = JSON.parse(readFileSync(idsPath, "utf-8"));
    } catch {
      console.log("  No agent_ids.json found — skipping");
      agentIds = {};
    }

    const entry = agentIds[slug];
    if (!entry) {
      console.log(`  No agents registered for '${slug}' — skipping`);
    } else if (!retellApiKey) {
      console.log("  No RETELL_API_KEY — cannot deactivate agents");
    } else {
      const agentsToDelete = [
        { id: entry.de_agent_id, label: "DE Agent" },
        { id: entry.intl_agent_id, label: "INTL Agent" },
      ].filter((a) => a.id);

      for (const agent of agentsToDelete) {
        if (dryRun) {
          console.log(`  Would delete ${agent.label}: ${agent.id}`);
        } else {
          try {
            const resp = await fetch(`https://api.retellai.com/v2/delete-agent/${agent.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${retellApiKey}` },
            });
            if (resp.ok || resp.status === 404) {
              console.log(`  Deleted ${agent.label}: ${agent.id}`);
              summary.agents++;
            } else {
              console.error(`  Failed ${agent.label}: ${resp.status} ${resp.statusText}`);
            }
          } catch (e) {
            console.error(`  Error ${agent.label}: ${e.message}`);
          }
        }
      }

      // Also delete conversation flows
      const flowsToDelete = [
        { id: entry.de_flow_id, label: "DE Flow" },
        { id: entry.intl_flow_id, label: "INTL Flow" },
      ].filter((f) => f.id);

      for (const flow of flowsToDelete) {
        if (dryRun) {
          console.log(`  Would delete ${flow.label}: ${flow.id}`);
        } else {
          try {
            const resp = await fetch(`https://api.retellai.com/v2/delete-conversation-flow/${flow.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${retellApiKey}` },
            });
            if (resp.ok || resp.status === 404) {
              console.log(`  Deleted ${flow.label}: ${flow.id}`);
            } else {
              console.error(`  Failed ${flow.label}: ${resp.status} ${resp.statusText}`);
            }
          } catch (e) {
            console.error(`  Error ${flow.label}: ${e.message}`);
          }
        }
      }

      // Remove from agent_ids.json
      if (!dryRun) {
        delete agentIds[slug];
        writeFileSync(idsPath, JSON.stringify(agentIds, null, 2) + "\n");
        console.log(`  Removed '${slug}' from agent_ids.json`);
      }
    }
  }

  // ── Step 7: Delete prospect auth user ───────────────────────────────────
  console.log("\n── Step 7: Prospect Auth User ──────────────────────");

  if (tenant.prospect_email) {
    if (dryRun) {
      console.log(`  Would delete auth user: ${tenant.prospect_email}`);
    } else {
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 });
      const user = users?.find((u) => u.email === tenant.prospect_email);

      if (user) {
        const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
        if (delErr) {
          console.error(`  Failed to delete user: ${delErr.message}`);
        } else {
          summary.authUser = true;
          console.log(`  Deleted: ${user.email} (${user.id})`);
        }
      } else {
        console.log(`  No auth user found for ${tenant.prospect_email}`);
      }
    }
  } else {
    console.log("  No prospect_email on tenant — skipping");
  }

  // ── Step 8: Update tenant status ────────────────────────────────────────
  console.log("\n── Step 8: Tenant Status ───────────────────────────");

  if (hardDelete) {
    if (dryRun) {
      console.log(`  Would hard-delete tenant: ${tenant.slug}`);
    } else {
      const { error } = await supabase.from("tenants").delete().eq("id", tenant.id);
      if (error) {
        console.error(`  Failed: ${error.message}`);
      } else {
        summary.tenant = true;
        console.log(`  Hard-deleted tenant: ${tenant.slug}`);
      }
    }
  } else {
    if (dryRun) {
      console.log(`  Would set trial_status = 'offboarded'`);
    } else {
      const { error } = await supabase
        .from("tenants")
        .update({ trial_status: "offboarded" })
        .eq("id", tenant.id);
      if (error) {
        console.error(`  Failed: ${error.message}`);
      } else {
        console.log(`  Set trial_status = 'offboarded'`);
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log(dryRun ? "  DRY RUN SUMMARY" : "  OFFBOARDING COMPLETE");
  console.log("=".repeat(60));
  console.log(`\n  Tenant:       ${tenant.name} (${tenant.slug})`);
  console.log(`  Attachments:  ${summary.attachments} deleted`);
  console.log(`  Events:       ${summary.events} deleted`);
  console.log(`  Cases:        ${summary.cases} deleted`);
  console.log(`  Numbers:      ${summary.numbers} freed`);
  console.log(`  Agents:       ${summary.agents} deactivated`);
  console.log(`  Auth User:    ${summary.authUser ? "deleted" : "skipped"}`);
  console.log(`  Tenant:       ${hardDelete ? (summary.tenant ? "hard-deleted" : "failed") : "offboarded (kept)"}`);
  console.log(`\n${"=".repeat(60)}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
