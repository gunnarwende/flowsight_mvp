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

// 8. Health check
let healthOk = false;
try {
  const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight-mvp.vercel.app";
  const res = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
  healthOk = res.ok;
} catch {
  healthOk = false;
}

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

const isRed = (stuck48h ?? 0) > 0 || !healthOk;
const isYellow = (backlogNew ?? 0) > 5 || notfallCount > 0;
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
  `health:         ${healthOk ? "OK" : "FAIL"}`,
  `━━━━━━━━━━━━━━━━━━━`,
].join("\n");

const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight-mvp.vercel.app";
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
