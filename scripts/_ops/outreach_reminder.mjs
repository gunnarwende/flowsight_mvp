#!/usr/bin/env node
/**
 * outreach_reminder.mjs — Tägliche Outreach-Kadenz-Erinnerung an den Founder.
 *
 * Liest die aktiven Beweis-Seiten (proof_pages = SSOT für Kontakt-Historie) und
 * berechnet pro Prospect den fälligen nächsten Touch (Kadenz Tag-0/3/6-7, siehe
 * docs/sales/pipeline.md). Mailt einen Digest an den Founder — ABER nur, wenn
 * mindestens eine Aktion fällig ist (kein Spam an ruhigen Tagen).
 *
 * Signal aus proof_pages: view_count/first_viewed_at = „hat er die Seite geöffnet?".
 * Geöffnet = heisser Lead → Anruf priorisieren. Nicht geöffnet + alt = kalt.
 *
 * Usage:
 *   node scripts/_ops/outreach_reminder.mjs            # Board auf stdout (Cron-Log + manuell)
 *   node scripts/_ops/outreach_reminder.mjs --email     # zusätzlich Founder-Mail, falls fällig
 */
import { createClient } from "../../src/web/node_modules/@supabase/supabase-js/dist/index.mjs";
import { sendEmail } from "./_lib/send_email.mjs";

const DO_EMAIL = process.argv.includes("--email");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error("✗ SUPABASE_URL / SERVICE_ROLE_KEY fehlen"); process.exit(1); }
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const APP = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://flowsight.ch").replace(/\/$/, "");

const DAY = 86400000;
const now = Date.now();

/** Kadenz-Entscheidung pro Prospect → { prio, action, line }. prio 0 = keine Aktion. */
function classify(p) {
  const ageD = p.created_at ? Math.floor((now - new Date(p.created_at).getTime()) / DAY) : 0;
  const viewed = (p.view_count ?? 0) > 0;
  const name = `${p.company_name || p.tenant_slug}`;
  const link = `${APP}/p/${p.token}`;
  const meta = `Tag ${ageD} · ${viewed ? `geöffnet ${p.view_count}×` : "noch NICHT geöffnet"} · ${link}`;
  // Geöffnet = heisser Lead: ab Tag 1 Anruf-Fenster, sortiert ganz oben.
  if (viewed && ageD >= 1) return { prio: 3, action: "ANRUFEN (warm)", line: `🔥 ${name} — hat geöffnet → persönlicher Anruf (Phase-1-Playbook). ${meta}` };
  if (viewed) return { prio: 1, action: "beobachten", line: `👀 ${name} — heute geöffnet, beobachten. ${meta}` };
  // Nicht geöffnet:
  if (ageD >= 11) return { prio: 1, action: "parken erwägen", line: `💤 ${name} — kalt + alt, max. Kadenz fast erreicht → parken erwägen (Re-Outreach ~3 Mte). ${meta}` };
  if (ageD >= 6) return { prio: 2, action: "Tag-6-7-Anruf", line: `📞 ${name} — Tag-6-7-Anruf fällig (kalt, aber persönlicher Touch). ${meta}` };
  if (ageD >= 3) return { prio: 2, action: "Tag-3-Nudge", line: `👋 ${name} — Tag-3-Nudge fällig (kurz „reingeschaut?"). ${meta}` };
  return { prio: 0, action: "frisch", line: `🌱 ${name} — frisch versendet, abwarten. ${meta}` };
}

const { data, error } = await supabase
  .from("proof_pages")
  .select("token, tenant_slug, company_name, view_count, first_viewed_at, last_viewed_at, created_at, status")
  .eq("status", "active")
  .order("created_at", { ascending: true });
if (error) { console.error("✗ proof_pages:", error.message); process.exit(1); }

const rows = (data || []).map(classify).sort((a, b) => b.prio - a.prio);
const due = rows.filter((r) => r.prio >= 2);
const warm = rows.filter((r) => r.prio === 3);

console.log(`\n📋 OUTREACH-KADENZ (${new Date().toISOString().slice(0, 10)}) — ${rows.length} aktive Beweis-Seiten, ${due.length} Aktion(en) fällig\n`);
for (const r of rows) console.log("  " + r.line);
console.log("");

if (DO_EMAIL) {
  const to = process.env.MAIL_REPLY_TO;
  if (!to) { console.log("⚠ MAIL_REPLY_TO fehlt — keine Mail."); process.exit(0); }
  if (due.length === 0 && warm.length === 0) { console.log("✓ Nichts fällig — keine Mail (kein Spam)."); process.exit(0); }

  const actionItems = rows.filter((r) => r.prio >= 2);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = [
    `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px">`,
    `<h2 style="margin:0 0 4px">📋 Outreach-Kadenz — heute</h2>`,
    `<p style="color:#555;margin:0 0 16px">${actionItems.length} Aktion(en) fällig${warm.length ? ` · ${warm.length} warm (geöffnet)` : ""}.</p>`,
    actionItems.length ? `<p style="font-weight:600;margin:0 0 6px">Heute dran:</p><ul style="margin:0 0 16px">${actionItems.map((r) => `<li style="margin:4px 0">${esc(r.line)}</li>`).join("")}</ul>` : "",
    `<p style="font-weight:600;margin:0 0 6px;color:#888">Gesamtes Board:</p><ul style="margin:0;color:#666;font-size:13px">${rows.map((r) => `<li style="margin:3px 0">${esc(r.line)}</li>`).join("")}</ul>`,
    `<p style="color:#999;font-size:12px;margin-top:16px">Watch-Tiefe: <code>proof_watch_report.mjs --slug X</code> · Anruf: <code>phase1_gespraech_playbook.md</code></p>`,
    `</div>`,
  ].join("");
  const text = [`Outreach-Kadenz — ${actionItems.length} Aktion(en) fällig.`, "", ...rows.map((r) => "• " + r.line)].join("\n");
  const res = await sendEmail({ to, fromName: "FlowSight Outreach", subject: `📋 Outreach-Kadenz — ${actionItems.length} Aktion(en) fällig`, html, text });
  console.log(res?.success ? `✓ Reminder-Mail an ${to} gesendet.` : `✗ Mail fehlgeschlagen: ${res?.error}`);
}
