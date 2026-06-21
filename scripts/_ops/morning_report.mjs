#!/usr/bin/env node
/**
 * Morning Report — Daily summary of case activity + system health.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/morning_report.mjs
 *   node --env-file=src/web/.env.local scripts/_ops/morning_report.mjs --send
 *
 * Without --send: prints report to stdout only.
 * With --send: also sends via WhatsApp (requires TWILIO_* + FOUNDER_WHATSAPP_* env vars).
 *
 * All queries exclude status='archived' (test data).
 * No PII in output — only counts, ages, and IDs (truncated).
 */

import { writeFileSync } from "node:fs";
import { createClient } from "../../src/web/node_modules/@supabase/supabase-js/dist/index.mjs";
import { classifyLead, render } from "./_lib/morning_report_render.mjs";

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exitCode = 1;
  throw new Error("env");
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const now = new Date();
const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
const h6ago = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
const d7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

// Production-tenant scope: only `trial_status = 'converted'` counts as live operating.
// Prospect/demo tenants (trial_status='interested' or null) carry seed/demo data
// that would otherwise dominate stuck_48h and backlog counts and cause false RED alerts.
const { data: prodTenants, error: ePT } = await supabase
  .from("tenants")
  .select("id, slug, modules")
  .eq("trial_status", "converted");
if (ePT) console.error("Query production tenants:", ePT.message);

const prodTenantIds = prodTenants?.map((t) => t.id) ?? [];
const sanitaerTenantIds = (prodTenants ?? [])
  .filter((t) => t.modules?.website_wizard || t.modules?.voice)
  .filter((t) => !(t.modules?.events || t.modules?.reservations))
  .map((t) => t.id);
const pubTenantIds = (prodTenants ?? [])
  .filter((t) => t.modules?.events || t.modules?.reservations)
  .map((t) => t.id);

// If no production tenants yet: skip the cases queries entirely and leave counts at 0.
// (Was previously aggregating across all tenants → demo seed pollution.)
const hasSanitaerProd = sanitaerTenantIds.length > 0;

// 1. Cases created in last 24h (by source), excluding archived — sanitaer-prod only
const { data: recent, error: e1 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id, source, urgency")
      .neq("status", "archived")
      .in("tenant_id", sanitaerTenantIds)
      .gte("created_at", h24ago)
  : { data: [], error: null };
if (e1) console.error("Query recent:", e1.message);

const cases24h = recent?.length ?? 0;
const voiceCount = recent?.filter((c) => c.source === "voice").length ?? 0;
const wizardCount = recent?.filter((c) => c.source === "wizard").length ?? 0;
const notfallCount = recent?.filter((c) => c.urgency === "notfall").length ?? 0;

// 2. Backlog: status = 'new' — sanitaer-prod only
const { count: backlogNew, error: e2 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .in("tenant_id", sanitaerTenantIds)
  : { count: 0, error: null };
if (e2) console.error("Query backlog:", e2.message);

// 3. Stuck: status = 'new' AND created > 48h ago — sanitaer-prod only
const { count: stuck48h, error: e3 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .in("tenant_id", sanitaerTenantIds)
      .lt("created_at", h48ago)
  : { count: 0, error: null };
if (e3) console.error("Query stuck:", e3.message);

// 4. Scheduled today (excluding archived) — sanitaer-prod only
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);
const todayEnd = new Date(now);
todayEnd.setHours(23, 59, 59, 999);
const { count: scheduledToday, error: e4 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .neq("status", "archived")
      .in("tenant_id", sanitaerTenantIds)
      .gte("scheduled_at", todayStart.toISOString())
      .lte("scheduled_at", todayEnd.toISOString())
  : { count: 0, error: null };
if (e4) console.error("Query scheduled:", e4.message);

// 5. Done in last 7 days — sanitaer-prod only
const { count: done7d, error: e5 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "done")
      .in("tenant_id", sanitaerTenantIds)
      .gte("updated_at", d7ago)
  : { count: 0, error: null };
if (e5) console.error("Query done:", e5.message);

// 6. Review requests sent in last 7 days — sanitaer-prod only
const { count: reviewsSent7d, error: e6 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .not("review_sent_at", "is", null)
      .in("tenant_id", sanitaerTenantIds)
      .gte("review_sent_at", d7ago)
  : { count: 0, error: null };
if (e6) console.error("Query reviews:", e6.message);

// 7. Oldest open case — sanitaer-prod only
const { data: oldestRow, error: e7 } = hasSanitaerProd
  ? await supabase
      .from("cases")
      .select("id, created_at")
      .eq("status", "new")
      .in("tenant_id", sanitaerTenantIds)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  : { data: null, error: null };
if (e7) console.error("Query oldest:", e7.message);

let oldestAge = "none";
if (oldestRow) {
  const ageMs = now.getTime() - new Date(oldestRow.created_at).getTime();
  const ageH = Math.floor(ageMs / (1000 * 60 * 60));
  const ageD = Math.floor(ageH / 24);
  oldestAge = ageD > 0 ? `${ageD}d ${ageH % 24}h` : `${ageH}h`;
}

// ---------------------------------------------------------------------------
// Voice Agent Health: agent_hangup detection (last 24h)
// ---------------------------------------------------------------------------

let agentHangupCount = 0;
let agentHangupCalls = [];
try {
  const retellKey = process.env.RETELL_API_KEY?.replace(/^"|"$/g, "");
  if (retellKey) {
    const retellResp = await fetch("https://api.retellai.com/v3/list-calls", {
      method: "POST",
      headers: { "Authorization": `Bearer ${retellKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 100, sort_order: "descending" }),
    });
    if (retellResp.ok) {
      // v3 list-calls: { items, pagination_key, has_more } statt Top-Level-Array.
      const _cr = await retellResp.json();
      const calls = _cr.items ?? _cr;
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
      agentHangupCalls = (calls || []).filter(c => {
        const start = c.start_timestamp || 0;
        const end = c.end_timestamp || 0;
        const dur = end - start;
        return c.disconnection_reason === "agent_hangup"
          && start > cutoff
          && dur > 0
          && dur < 120_000;
      });
      agentHangupCount = agentHangupCalls.length;
    }
  }
} catch (e) {
  console.error("Retell agent_hangup check failed:", e.message);
}

// ---------------------------------------------------------------------------
// Pub-Mode: pending reservations + age (production-pub tenants only)
// Catches the "Damien Cusack scenario" — a real customer reservation that
// sits PENDING because the operator never confirmed it.
// ---------------------------------------------------------------------------

let pubPendingTotal = 0;
let pubPendingStale = 0; // older than 6h
let pubOldestPendingAge = "none";

if (pubTenantIds.length > 0) {
  const { data: pubPending, error: ePub } = await supabase
    .from("pub_reservations")
    .select("id, created_at")
    .eq("status", "pending")
    .in("tenant_id", pubTenantIds);
  if (ePub) console.error("Query pub pending:", ePub.message);

  pubPendingTotal = pubPending?.length ?? 0;
  pubPendingStale = (pubPending ?? []).filter(
    (r) => new Date(r.created_at).getTime() < new Date(h6ago).getTime(),
  ).length;

  const oldest = (pubPending ?? []).reduce(
    (acc, r) => (!acc || new Date(r.created_at) < new Date(acc.created_at) ? r : acc),
    null,
  );
  if (oldest) {
    const ageMs = now.getTime() - new Date(oldest.created_at).getTime();
    const ageH = Math.floor(ageMs / (1000 * 60 * 60));
    const ageD = Math.floor(ageH / 24);
    pubOldestPendingAge = ageD > 0 ? `${ageD}d ${ageH % 24}h` : `${ageH}h`;
  }
}

// ---------------------------------------------------------------------------
// Trial Lifecycle Queries
// ---------------------------------------------------------------------------

const h24ahead = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const h48ahead = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

// T1. Active trials: trial_status IN ('trial_active', 'live_dock')
const { data: activeTrials, error: eT1 } = await supabase
  .from("tenants")
  .select("slug, trial_status")
  .in("trial_status", ["trial_active", "live_dock"]);
if (eT1) console.error("Query active trials:", eT1.message);

const activeTrialCount = activeTrials?.length ?? 0;

// T2. Follow-ups due: follow_up_at within last 3 days AND trial_status = 'trial_active'
// After 3 days without action the flag auto-expires (Founder either called or skipped)
const d3ago = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
const { data: followUpsDue, error: eT2 } = await supabase
  .from("tenants")
  .select("slug")
  .eq("trial_status", "trial_active")
  .gte("follow_up_at", d3ago)
  .lte("follow_up_at", todayEnd.toISOString());
if (eT2) console.error("Query follow-ups:", eT2.message);

const followUpDueCount = followUpsDue?.length ?? 0;
const followUpNames = followUpsDue?.map((t) => t.slug).join(", ") ?? "";

// T3. Expiring within 48h: trial_end <= now + 48h AND trial_status IN ('trial_active', 'live_dock')
const { data: expiring48h, error: eT3 } = await supabase
  .from("tenants")
  .select("slug, trial_end")
  .in("trial_status", ["trial_active", "live_dock"])
  .lte("trial_end", h48ahead);
if (eT3) console.error("Query expiring:", eT3.message);

const expiring48hCount = expiring48h?.length ?? 0;
const expiringNames = expiring48h?.map((t) => t.slug).join(", ") ?? "";

// T3b. Subset: expiring within 24h (for RED severity)
const expiring24h = expiring48h?.filter(
  (t) => t.trial_end && new Date(t.trial_end).getTime() <= new Date(h24ahead).getTime()
) ?? [];

// T4. Zombie trials: trial_active but trial_start > 7 days ago (no activity signal)
const { data: zombieTrials, error: eT4 } = await supabase
  .from("tenants")
  .select("slug")
  .eq("trial_status", "trial_active")
  .lt("trial_start", d7ago);
if (eT4) console.error("Query zombies:", eT4.message);

const zombieCount = zombieTrials?.length ?? 0;

// T5. Lifecycle tick errors: milestone columns that should be set but aren't
// Check for trials past Day 14 still in trial_active (tick may have failed)
const { data: staleTrials, error: eT5 } = await supabase
  .from("tenants")
  .select("slug, trial_start, day14_marked_at")
  .eq("trial_status", "trial_active")
  .is("day14_marked_at", null)
  .lt("trial_start", new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString());
if (eT5) console.error("Query stale lifecycle:", eT5.message);

const staleCount = staleTrials?.length ?? 0;
const staleNames = staleTrials?.map((t) => t.slug).join(", ") ?? "";

// 8. Health check (deep — DB + email via /api/health)
let healthOk = false;
let healthDb = "?";
let healthEmail = "?";
try {
  const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight.ch";
  const res = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
  if (res.ok) {
    const body = await res.json();
    healthOk = body.ok === true;
    healthDb = body.db ?? "?";
    healthEmail = body.email ?? "?";
  }
} catch {
  healthOk = false;
}

// 9. Resend API key validation (lightweight — call /domains, no quota cost)
// Restricted send-only keys (best practice) return 401 with body
// `{ name: "restricted_api_key" }` on /domains; that is still a VALID key
// for sending. Treat it as OK to avoid false RED alerts.
let resendOk = false;
try {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const rRes = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (rRes.ok) {
      resendOk = true;
    } else if (rRes.status === 401) {
      const body = await rRes.json().catch(() => ({}));
      resendOk = body?.name === "restricted_api_key";
    }
  }
} catch {
  resendOk = false;
}

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

// Severity (🟢/🟡/🔴) + nachvollziehbarer Grund werden in
// morning_report_render.render() aus dem Modell unten berechnet.
// pubPendingStale (BigBen) ist KEIN Rot-Trigger mehr → FYI im Betrieb-Block.

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

const dateStr = now.toLocaleDateString("de-CH", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Zurich",
});

// ── Beweis-Seiten: kanonische Kadenz (Tag 0/3/6-7, max 3 Touches, Tag 14 Ablauf) ──
// Verlässliches Signal: opened? (view_count), Alter seit Versand (created_at), Aktualität
// (last_viewed_at). Watch-Tiefe (per-Take-%) bewusst weggelassen bis MR2 (sauberes Tracking):
// T1 ist EIN geteiltes canonical Video → %-Wert wertlos; Rest verrauscht durch eigene Views.
let leads = [];
try {
  const { data: leadPages } = await supabase
    .from("proof_pages")
    .select("token, tenant_slug, company_name, created_at, view_count, last_viewed_at")
    .eq("status", "active");
  leads = (leadPages || []).map((p) => classifyLead(p, now.getTime()));
} catch (e) {
  console.error("Query proof_pages (leads):", e.message);
}

// ── Modell bauen + rendern (Severity + Kadenz + Mobil-HTML in morning_report_render) ──
const sysProblems = [];
if (!healthOk) sysProblems.push("API/Health");
if (healthDb && healthDb !== "ok" && healthDb !== "?") sysProblems.push("Datenbank");
if (!resendOk) sysProblems.push("E-Mail (Resend)");
if (staleCount > 0) sysProblems.push("Lifecycle-Tick");

const model = {
  dateStr,
  appUrl: process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight.ch",
  leads,
  overview: {
    cases24h,
    backlogNew: backlogNew ?? 0,
    done7d: done7d ?? 0,
    activeTrials: activeTrialCount,
    followUpDue: followUpDueCount,
  },
  customerHealth: { bigbenPendingStale: pubPendingStale },
  system: { ok: sysProblems.length === 0, problems: sysProblems },
  alerts: {
    notfall: notfallCount,
    agentHangup: agentHangupCount,
    stuck48h: stuck48h ?? 0,
    expiring24h: expiring24h.length,
  },
};

const { subject: subjectLine, text: reportText, html: reportHtml } = render(model);
const fullReport = reportText;

// Artefakte für den Workflow: der E-Mail-Step liest Subject/HTML/Text aus diesen Dateien.
try {
  writeFileSync("/tmp/morning_report.subject", subjectLine);
  writeFileSync("/tmp/morning_report.txt", reportText);
  writeFileSync("/tmp/morning_report.html", reportHtml);
} catch (e) {
  console.error("write report artifacts:", e.message);
}

console.log(`\n${subjectLine}\n\n${reportText}\n`);

// ---------------------------------------------------------------------------
// Optional: send via WhatsApp
// ---------------------------------------------------------------------------

const shouldSend = process.argv.includes("--send");

if (shouldSend) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.FOUNDER_WHATSAPP_TO;
  const enabled = process.env.FOUNDER_WHATSAPP_ENABLED;

  if (enabled !== "true") {
    console.log("WhatsApp disabled (FOUNDER_WHATSAPP_ENABLED !== 'true'). Skipping send.");
  } else if (!accountSid || !authToken || !from || !to) {
    console.log("Missing Twilio env vars. Skipping send.");
  } else {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: fullReport }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✓ WhatsApp sent: ${data.sid}`);
      } else {
        console.log(`✗ WhatsApp failed: HTTP ${res.status}`);
      }
    } catch (err) {
      console.log(`✗ WhatsApp error: ${err.message}`);
    }
  }
} else {
  console.log("(Use --send to also send via WhatsApp)");
}
