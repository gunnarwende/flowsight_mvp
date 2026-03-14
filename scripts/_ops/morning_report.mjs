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

import { createClient } from "../../src/web/node_modules/@supabase/supabase-js/dist/index.mjs";

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
const d7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

// 1. Cases created in last 24h (by source), excluding archived
const { data: recent, error: e1 } = await supabase
  .from("cases")
  .select("id, source, urgency")
  .neq("status", "archived")
  .gte("created_at", h24ago);
if (e1) console.error("Query recent:", e1.message);

const cases24h = recent?.length ?? 0;
const voiceCount = recent?.filter((c) => c.source === "voice").length ?? 0;
const wizardCount = recent?.filter((c) => c.source === "wizard").length ?? 0;
const notfallCount = recent?.filter((c) => c.urgency === "notfall").length ?? 0;

// 2. Backlog: status = 'new'
const { count: backlogNew, error: e2 } = await supabase
  .from("cases")
  .select("id", { count: "exact", head: true })
  .eq("status", "new");
if (e2) console.error("Query backlog:", e2.message);

// 3. Stuck: status = 'new' AND created > 48h ago
const { count: stuck48h, error: e3 } = await supabase
  .from("cases")
  .select("id", { count: "exact", head: true })
  .eq("status", "new")
  .lt("created_at", h48ago);
if (e3) console.error("Query stuck:", e3.message);

// 4. Scheduled today (excluding archived)
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);
const todayEnd = new Date(now);
todayEnd.setHours(23, 59, 59, 999);
const { count: scheduledToday, error: e4 } = await supabase
  .from("cases")
  .select("id", { count: "exact", head: true })
  .neq("status", "archived")
  .gte("scheduled_at", todayStart.toISOString())
  .lte("scheduled_at", todayEnd.toISOString());
if (e4) console.error("Query scheduled:", e4.message);

// 5. Done in last 7 days
const { count: done7d, error: e5 } = await supabase
  .from("cases")
  .select("id", { count: "exact", head: true })
  .eq("status", "done")
  .gte("updated_at", d7ago);
if (e5) console.error("Query done:", e5.message);

// 6. Review requests sent in last 7 days
const { count: reviewsSent7d, error: e6 } = await supabase
  .from("cases")
  .select("id", { count: "exact", head: true })
  .not("review_sent_at", "is", null)
  .gte("review_sent_at", d7ago);
if (e6) console.error("Query reviews:", e6.message);

// 7. Oldest open case
const { data: oldestRow, error: e7 } = await supabase
  .from("cases")
  .select("id, created_at")
  .eq("status", "new")
  .order("created_at", { ascending: true })
  .limit(1)
  .maybeSingle();
if (e7) console.error("Query oldest:", e7.message);

let oldestAge = "none";
if (oldestRow) {
  const ageMs = now.getTime() - new Date(oldestRow.created_at).getTime();
  const ageH = Math.floor(ageMs / (1000 * 60 * 60));
  const ageD = Math.floor(ageH / 24);
  oldestAge = ageD > 0 ? `${ageD}d ${ageH % 24}h` : `${ageH}h`;
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
let resendOk = false;
try {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const rRes = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
      signal: AbortSignal.timeout(5000),
    });
    resendOk = rRes.ok;
  }
} catch {
  resendOk = false;
}

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

const isRed = (stuck48h ?? 0) > 0 || !healthOk || !resendOk || expiring24h.length > 0 || staleCount > 0;
const isYellow = (backlogNew ?? 0) > 5 || notfallCount > 0 || followUpDueCount > 0;
const severity = isRed ? "🔴" : isYellow ? "🟡" : "🟢";

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

const dateStr = now.toLocaleDateString("de-CH", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Zurich",
});

const report = [
  `${severity} DAILY ${dateStr}`,
  `━━━━━━━━━━━━━━━━━━━`,
  `cases_24h:      ${cases24h} (voice:${voiceCount} wizard:${wizardCount})`,
  `notfall_24h:    ${notfallCount}`,
  `backlog_new:    ${backlogNew ?? "?"}`,
  `stuck_48h:      ${stuck48h ?? "?"}`,
  `scheduled_today:${scheduledToday ?? "?"}`,
  `done_7d:        ${done7d ?? "?"}`,
  `reviews_7d:     ${reviewsSent7d ?? "?"}`,
  `oldest_open:    ${oldestAge}`,
  `━━━ TRIALS ━━━━━━━━━`,
  `active_trials:  ${activeTrialCount}`,
  `follow_up_due:  ${followUpDueCount}${followUpNames ? ` (${followUpNames})` : ""}`,
  `expiring_48h:   ${expiring48hCount}${expiringNames ? ` (${expiringNames})` : ""}`,
  `zombie_trials:  ${zombieCount}`,
  `tick_stale:     ${staleCount}${staleNames ? ` (${staleNames})` : ""}`,
  `━━━ HEALTH ━━━━━━━━━`,
  `api:            ${healthOk ? "OK" : "FAIL"}`,
  `db:             ${healthDb}`,
  `email_key:      ${healthEmail}`,
  `resend_api:     ${resendOk ? "OK" : "FAIL"}`,
  `━━━━━━━━━━━━━━━━━━━`,
].join("\n");

const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight.ch";
const fullReport = `${report}\n→ ${baseUrl}/ops/cases`;

console.log("\n" + fullReport + "\n");

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
