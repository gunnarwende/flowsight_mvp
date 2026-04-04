#!/usr/bin/env node
/**
 * weekly_report.mjs — Weekly rapport per email to each active business.
 *
 * Sends a branded HTML email with the week's KPIs:
 * - New cases (Voice / Web / Manual)
 * - Cases completed
 * - Reviews received + average
 * - Google rating (from last crawl)
 * - Upcoming appointments
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/weekly_report.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/weekly_report.mjs --dry-run
 *
 * Cron: Monday 07:00 UTC via GH Actions
 */
import { createRequire } from "node:module";
import { sendEmail } from "./_lib/send_email.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const rel of ["../../.env.local", "../../src/web/.env.local"]) {
  const envPath = path.resolve(__dirname, rel);
  if (!fs.existsSync(envPath)) continue;
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

const dryRun = process.argv.includes("--dry-run");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date();
const weekAgo = new Date(now.getTime() - 7 * 86400000);
const weekAgoIso = weekAgo.toISOString();

async function buildReport(tenant) {
  const tid = tenant.id;
  const modules = tenant.modules || {};

  // Cases this week
  const { data: weekCases } = await sb.from("cases")
    .select("source, status, urgency, review_sent_at, review_rating, scheduled_at")
    .eq("tenant_id", tid)
    .gte("created_at", weekAgoIso);

  const cases = weekCases || [];
  const newCases = cases.length;
  const voice = cases.filter((c) => c.source === "voice").length;
  const web = cases.filter((c) => c.source === "wizard" || c.source === "website").length;
  const manual = cases.filter((c) => c.source === "manual").length;
  const notfaelle = cases.filter((c) => c.urgency === "notfall").length;

  // Completed this week (by updated_at)
  const { count: completedCount } = await sb.from("cases")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tid)
    .eq("status", "done")
    .gte("updated_at", weekAgoIso);
  const completed = completedCount ?? 0;

  // Reviews this week
  const reviewsSent = cases.filter((c) => c.review_sent_at).length;
  const reviewsReceived = cases.filter((c) => c.review_rating).length;
  const avgRating = reviewsReceived > 0
    ? (cases.filter((c) => c.review_rating).reduce((s, c) => s + c.review_rating, 0) / reviewsReceived).toFixed(1)
    : null;

  // Google data
  const googleAvg = modules.google_review_avg ?? null;
  const googleCount = modules.google_review_count ?? null;

  // Upcoming appointments (next 7 days)
  const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString();
  const { count: upcomingCount } = await sb.from("cases")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tid)
    .neq("status", "done")
    .neq("status", "archived")
    .not("scheduled_at", "is", null)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", nextWeek);
  const upcoming = upcomingCount ?? 0;

  return {
    newCases, voice, web, manual, notfaelle,
    completed, reviewsSent, reviewsReceived, avgRating,
    googleAvg, googleCount, upcoming,
  };
}

function buildHtml(tenant, r) {
  const name = tenant.name;
  const modules = tenant.modules || {};
  const color = modules.primary_color || "#1a2744";

  const weekLabel = `${weekAgo.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" })} – ${now.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" })}`;

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

<!-- Header -->
<tr><td style="background:${color};padding:24px 32px">
  <span style="font-size:20px;font-weight:700;color:#ffffff">${name}</span>
  <br><span style="font-size:13px;color:rgba(255,255,255,0.7)">Wochenrapport ${weekLabel}</span>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:24px 32px 16px">
  <p style="font-size:15px;color:#334155;margin:0;line-height:1.6">
    Guten Morgen,<br>hier ist Ihre Zusammenfassung der letzten Woche.
  </p>
</td></tr>

<!-- KPIs -->
<tr><td style="padding:0 32px">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
  <td style="width:33%;text-align:center;padding:16px 8px;background:#f8fafc;border-radius:8px">
    <span style="font-size:28px;font-weight:800;color:#0f172a">${r.newCases}</span>
    <br><span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Neue F&auml;lle</span>
    <br><span style="font-size:10px;color:#94a3b8">${r.voice} Tel / ${r.web} Web / ${r.manual} Manuell</span>
  </td>
  <td style="width:8px"></td>
  <td style="width:33%;text-align:center;padding:16px 8px;background:#f8fafc;border-radius:8px">
    <span style="font-size:28px;font-weight:800;color:#0f172a">${r.completed}</span>
    <br><span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Erledigt</span>
  </td>
  <td style="width:8px"></td>
  <td style="width:33%;text-align:center;padding:16px 8px;background:#f8fafc;border-radius:8px">
    <span style="font-size:28px;font-weight:800;color:#c8965a">${r.reviewsReceived}</span>
    <br><span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Bewertungen</span>
    ${r.avgRating ? `<br><span style="font-size:10px;color:#94a3b8">&Oslash; ${r.avgRating}&#9733;</span>` : ""}
  </td>
</tr>
</table>
</td></tr>

<!-- Google Rating -->
${r.googleAvg ? `
<tr><td style="padding:20px 32px 0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:8px;border:1px solid #fde68a">
  <tr><td style="padding:12px 16px">
    <span style="font-size:13px;color:#92400e;font-weight:600">Google Bewertung</span>
    <br><span style="font-size:22px;font-weight:800;color:#92400e">${r.googleAvg}&#9733;</span>
    <span style="font-size:12px;color:#a16207;margin-left:8px">${r.googleCount ?? "–"} Bewertungen</span>
  </td></tr>
  </table>
</td></tr>
` : ""}

<!-- Upcoming -->
${r.upcoming > 0 ? `
<tr><td style="padding:16px 32px 0">
  <p style="font-size:13px;color:#64748b;margin:0">
    <strong>${r.upcoming}</strong> ${r.upcoming === 1 ? "Termin" : "Termine"} in den n&auml;chsten 7 Tagen geplant.
  </p>
</td></tr>
` : ""}

${r.notfaelle > 0 ? `
<tr><td style="padding:12px 32px 0">
  <p style="font-size:13px;color:#dc2626;font-weight:600;margin:0">
    ${r.notfaelle} Notfall-${r.notfaelle === 1 ? "Fall" : "F&auml;lle"} diese Woche.
  </p>
</td></tr>
` : ""}

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e2e8f0;margin-top:16px">
  <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.6">
    Dieser Rapport wird automatisch jeden Montag versendet.<br>
    Fragen? Gunnar Wende &mdash; 044 552 09 19 &mdash; flowsight.ch
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  Weekly Rapport                      ║");
  console.log("╚══════════════════════════════════════╝\n");

  // Get tenants with notification_email (= active, Phase B)
  const { data: tenants } = await sb
    .from("tenants")
    .select("id, slug, name, modules, prospect_email")
    .in("trial_status", ["trial_active", "converted", "live_dock"]);

  if (!tenants?.length) {
    console.log("No active tenants to report on.");
    return;
  }

  console.log(`${tenants.length} tenants to process.\n`);

  for (const tenant of tenants) {
    const modules = tenant.modules || {};
    const email = modules.notification_email || tenant.prospect_email;

    if (!email) {
      console.log(`${tenant.name}: No email configured — skipping.`);
      continue;
    }

    console.log(`── ${tenant.name} → ${email} ──`);

    const report = await buildReport(tenant);
    const html = buildHtml(tenant, report);
    const subject = `${tenant.name} — Wochenrapport`;

    console.log(`  Fälle: ${report.newCases} neu, ${report.completed} erledigt`);
    console.log(`  Reviews: ${report.reviewsReceived} erhalten${report.avgRating ? ` (Ø ${report.avgRating}★)` : ""}`);
    console.log(`  Google: ${report.googleAvg ?? "–"}★`);

    if (dryRun) {
      console.log("  DRY RUN — email not sent.\n");
      continue;
    }

    const result = await sendEmail({
      to: email,
      subject,
      html,
      fromName: `${tenant.name} via FlowSight`,
    });

    if (result.success) {
      console.log(`  ✅ Email sent: ${result.messageId}\n`);
    } else {
      console.error(`  ❌ Email failed: ${result.error}\n`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
