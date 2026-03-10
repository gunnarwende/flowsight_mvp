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

  // ── Step 1b: Offboarding-Mail ─────────────────────────────────────────
  console.log("\n── Step 1b: Offboarding-Mail ───────────────────────");

  if (tenant.prospect_email) {
    const offboardHtml = `<!DOCTYPE html>
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
<!-- Body text -->
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Ihr 14-Tage Trial bei FlowSight ist abgelaufen. Vielen Dank f&uuml;r Ihr Interesse.
</td></tr>
<!-- What they experienced -->
<tr><td style="padding:20px 24px 0;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:1px">In den letzten 14 Tagen hatten Sie Zugang zu</td></tr>
<tr><td style="padding:8px 24px 0;color:#e2e8f0;font-size:14px;line-height:2">
&bull; Ihrer pers&ouml;nlichen KI-Assistentin Lisa<br>
&bull; Dem FlowSight Dashboard<br>
&bull; Automatisierten SMS-Best&auml;tigungen<br>
&bull; Dem Review-System
</td></tr>
<!-- Door stays open -->
<tr><td style="padding:24px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:6px">
  <tr><td style="padding:20px;color:#e2e8f0;font-size:15px;line-height:1.6">
Falls Sie FlowSight in Ihrem Betrieb einsetzen m&ouml;chten, melden Sie sich jederzeit.
  </td></tr>
  </table>
</td></tr>
<!-- Founder contact -->
<tr><td style="padding:28px 24px 20px;border-top:1px solid #1e293b;margin-top:24px">
  <div style="color:#64748b;font-size:13px;line-height:1.6;text-align:center">Gunnar Wende &mdash; 044 552 09 19 &mdash; gunnar@flowsight.ch</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const offboardText = [
      "Guten Tag",
      "",
      "Ihr 14-Tage Trial bei FlowSight ist abgelaufen. Vielen Dank für Ihr Interesse.",
      "",
      "In den letzten 14 Tagen hatten Sie Zugang zu:",
      "- Ihrer persönlichen KI-Assistentin Lisa",
      "- Dem FlowSight Dashboard",
      "- Automatisierten SMS-Bestätigungen",
      "- Dem Review-System",
      "",
      "Falls Sie FlowSight in Ihrem Betrieb einsetzen möchten, melden Sie sich jederzeit.",
      "",
      "---",
      "Gunnar Wende — 044 552 09 19 — gunnar@flowsight.ch",
    ].join("\n");

    if (dryRun) {
      console.log(`  Would send offboarding mail to: ${tenant.prospect_email}`);
    } else {
      const offboardResult = await sendEmail({
        to: tenant.prospect_email,
        subject: "Ihr FlowSight Trial — Danke für Ihr Interesse",
        html: offboardHtml,
        text: offboardText,
      });

      if (offboardResult.success) {
        console.log(`  Offboarding-Mail sent: ${offboardResult.messageId}`);
      } else {
        console.error(`  Offboarding-Mail failed (non-fatal): ${offboardResult.error}`);
      }
    }
  } else {
    console.log("  No prospect_email on tenant — skipping");
  }

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
