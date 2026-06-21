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
import { bunnyEnv, getVideo, getStatistics, sumChart } from "./_lib/bunny.mjs";

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

const isRed = (stuck48h ?? 0) > 0 || !healthOk || !resendOk || expiring24h.length > 0 || staleCount > 0 || agentHangupCount > 0 || pubPendingStale > 0;
const isYellow = (backlogNew ?? 0) > 5 || notfallCount > 0 || followUpDueCount > 0 || pubPendingTotal > 0;
const severity = isRed ? "🔴" : isYellow ? "🟡" : "🟢";

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

const dateStr = now.toLocaleDateString("de-CH", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Zurich",
});

// ── Outreach / Watch-Signal: Bunny-Watch-Statistik × proof_pages ──
// Pro aktive Beweis-Seite: geöffnet? welche Takes wie tief? Gerät? + ausgeschriebene
// Handlung (anrufen / Reminder). Guarded: fehlt IRGENDEIN Bunny-Env (API-Key, Library-ID
// oder CDN-Hostname), wird die Watch-Sektion still übersprungen — der Tagesüberblick darf
// NIE an einer optionalen Integration crashen (bunnyEnv() wirft sonst weiter unten).
async function buildWatchSignalLines() {
  if (
    !process.env.BUNNY_STREAM_API_KEY ||
    !process.env.BUNNY_STREAM_LIBRARY_ID ||
    !process.env.BUNNY_STREAM_CDN_HOSTNAME
  ) {
    return [];
  }
  let pages = [];
  try {
    const { data } = await supabase
      .from("proof_pages")
      .select("company_name,videos,view_count")
      .eq("status", "active");
    pages = data || [];
  } catch {
    return [];
  }
  if (!pages.length) return [];
  const env = bunnyEnv();
  const now = new Date();
  const from = new Date(now.getTime() - 14 * 864e5);
  const d10 = (d) => d.toISOString().slice(0, 10);
  const TAKES = [["t1", "T1"], ["t2", "T2"], ["t2_portrait", "T2📱"], ["t3", "T3"], ["t4", "T4"]];
  const rows = [];
  for (const p of pages) {
    let signal = 0, mobile = 0, desktop = 0;
    const parts = [];
    for (const [k, lbl] of TAKES) {
      const guid = p.videos?.[k];
      if (!guid) continue;
      try {
        const len = (await getVideo(env, guid)).length || 0;
        const s = await getStatistics(env, { guid, dateFrom: d10(from), dateTo: d10(now) });
        const views = sumChart(s.viewsChart);
        const watch = sumChart(s.watchTimeChart);
        if (views > 0 && len > 0) parts.push(`${lbl} ${Math.min(100, Math.round((watch / views / len) * 100))}%`);
        signal += watch;
        if (k === "t2_portrait") mobile += watch;
        if (k === "t2") desktop += watch;
      } catch { /* noop */ }
    }
    const dev = mobile > desktop ? "📱" : desktop > 0 ? "💻" : "·";
    const opened = p.view_count ?? 0;
    const actionShort = opened === 0 ? "Reminder senden (Link)"
      : signal < 60 ? "Reminder: erster Eindruck?"
      : "anrufen (warm)";
    rows.push({ name: p.company_name, dev, parts, signal, opened, actionShort });
  }
  rows.sort((a, b) => b.signal - a.signal);
  if (rows.every((r) => r.signal === 0 && r.opened === 0)) {
    return ["Noch keine Aufrufe — wird aktiv, sobald du versendest."];
  }
  return rows.map((r) => `${r.name} — ${r.dev} ${r.opened}× geöffnet · ${r.parts.join(" ")}  →  ${r.actionShort}`);
}
const watchRows = await buildWatchSignalLines();

// ── Founder-tauglicher Tagesüberblick: Status-Symbol (🟢/🟡/🔴) + Klartext,
//    Handlung zuerst, KEINE technischen Codes. 1-Minuten-Überblick.
const aktionen = [];
if (notfallCount > 0) aktionen.push(`🚨 ${notfallCount} Notfall-Meldung (letzte 24h)`);
if (agentHangupCount > 0) aktionen.push(`⚠ Telefon-Assistentin hat aufgelegt (${agentHangupCount}×) — bitte prüfen`);
if ((stuck48h ?? 0) > 0) aktionen.push(`${stuck48h} Fall/Fälle hängen seit über 48h`);
if (expiring24h.length > 0) aktionen.push(`${expiring24h.length} Test-Zugang läuft in unter 24h aus`);
if (followUpDueCount > 0) aktionen.push(`${followUpDueCount}× Trial-Follow-up fällig${followUpNames ? ` (${followUpNames})` : ""}`);
if (pubPendingStale > 0) aktionen.push(`${pubPendingStale} BigBen-Reservierung(en) offen seit über 6h`);

const sysProblem = !healthOk || !resendOk || (healthDb && healthDb !== "ok");
const aktN = aktionen.length;
const fazit = aktN > 0 ? `${aktN} ${aktN === 1 ? "Punkt" : "Punkte"} für dich` : "alles in Ordnung";
const subjectLine = `${severity} FlowSight · ${dateStr} · ${fazit}`;

const report = [
  `${severity}  FlowSight · Tagesüberblick · ${dateStr}`,
  ``,
  `🔔 HEUTE FÜR DICH`,
  ...(aktN ? aktionen.map((a) => `   • ${a}`) : [`   • Nichts Dringendes — alles ruhig.`]),
  ``,
  `📊 DEINE BEWEIS-SEITEN  (wer hat geschaut?)`,
  ...watchRows.map((r) => `   ${r}`),
  ``,
  `📥 ÜBERBLICK`,
  `   Neue Anfragen (24h): ${cases24h}    ·    Offen: ${backlogNew ?? 0}    ·    Erledigt (7 Tage): ${done7d ?? 0}`,
  `   Test-Zugänge aktiv: ${activeTrialCount}    ·    Follow-up fällig: ${followUpDueCount}`,
  ``,
  sysProblem ? `⚠ System: bitte prüfen (E-Mail / Datenbank / API)` : `System läuft · alles ok ✓`,
].join("\n");

const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://flowsight.ch";
const fullReport = `${report}\n\n→ Zum Leitsystem: ${baseUrl}/ops`;

// Marker-Zeile: der Workflow zieht daraus den E-Mail-Betreff (und entfernt sie aus dem Body).
console.log("__SUBJECT__:" + subjectLine);
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
