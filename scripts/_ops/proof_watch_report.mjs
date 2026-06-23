#!/usr/bin/env node
/**
 * proof_watch_report.mjs — Watch-Signal pro Prospect (Phase-3-Kadenz-Priorisierung).
 *
 * Kombiniert Bunny-Watch-Statistik pro Take (Stream-Key) mit den Seiten-Öffnungen
 * (proof_pages). Pro Betrieb: geöffnet? welche Takes wie lange geschaut? Gerät
 * (T2 Desktop vs T2 Handy)? Engagement? → sortiert nach Gesamt-Watch-Zeit, damit
 * der Founder die wärmsten Leads zuerst anruft (Tag 6-7, mit discovery_questions.md).
 *
 * Kein Account-Key nötig — der Stream-Key liest die Statistik; pro-GUID = pro Betrieb/Take.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/proof_watch_report.mjs [--slug X] [--days 14]
 */
import { createRequire } from "node:module";
import { bunnyEnv, getVideo, getStatistics, sumChart } from "./_lib/bunny.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const slug = arg("slug");
const days = parseInt(arg("days") || "14", 10);

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const env = bunnyEnv();

const TAKES = [
  { key: "t1", label: "T1 Intro" },
  { key: "t2", label: "T2 Anruf · Desktop" },
  { key: "t2_portrait", label: "T2 Anruf · Handy" },
  { key: "t3", label: "T3 Wizard" },
  { key: "t4", label: "T4 Bewertung" },
];
const d10 = (d) => d.toISOString().slice(0, 10);

async function main() {
  const now = new Date();
  const from = new Date(now.getTime() - days * 864e5);
  let q = sb
    .from("proof_pages")
    .select("token,tenant_slug,company_name,videos,view_count,first_viewed_at,last_viewed_at,status")
    .eq("status", "active");
  if (slug) q = q.eq("tenant_slug", slug);
  const { data, error } = await q;
  if (error) { console.error(error.message); process.exit(1); }
  if (!data?.length) { console.log("Keine aktiven Beweis-Seiten."); return; }

  const rows = [];
  for (const r of data) {
    const takes = [];
    let signal = 0, mobile = 0, desktop = 0;
    for (const t of TAKES) {
      // T1 = geteiltes canonical Video (für ALLE Betriebe identisch) → kein Per-Prospect-
      // Signal. Im Report ignoriert, sonst dominiert das ~1197s-Rauschen die Lead-Sortierung.
      if (t.key === "t1") continue;
      const guid = r.videos?.[t.key];
      if (!guid) continue;
      let len = 0, views = 0, watch = 0, eng = 0;
      try {
        len = (await getVideo(env, guid)).length || 0;
        const s = await getStatistics(env, { guid, dateFrom: d10(from), dateTo: d10(now) });
        views = sumChart(s.viewsChart);
        watch = sumChart(s.watchTimeChart);
        eng = s.engagementScore || 0;
      } catch { /* Video evtl. noch nicht encodiert */ }
      const avg = views > 0 ? watch / views : 0;
      const pct = len > 0 ? Math.min(100, Math.round((avg / len) * 100)) : 0;
      takes.push({ label: t.label, views, watch, pct, eng });
      signal += watch;
      if (t.key === "t2_portrait") mobile += watch;
      if (t.key === "t2") desktop += watch;
    }
    rows.push({ r, takes, signal, mobile, desktop });
  }
  rows.sort((a, b) => b.signal - a.signal);

  console.log(`\n📊 WATCH-SIGNAL (letzte ${days} Tage) — sortiert nach Gesamt-Watch-Zeit\n`);
  for (const { r, takes, signal, mobile, desktop } of rows) {
    const dev = mobile > desktop ? "📱 Handy" : desktop > 0 ? "💻 Desktop" : "—";
    const last = String(r.last_viewed_at || "").slice(0, 16).replace("T", " ");
    console.log(`━━ ${r.company_name} (${r.tenant_slug}) ━━`);
    console.log(
      `   Seite geöffnet: ${r.view_count > 0 ? `JA (${r.view_count}×, zuletzt ${last})` : "NEIN"}  |  Gerät: ${dev}`
    );
    if (signal === 0) { console.log(`   ⚪ noch keine Watch-Zeit\n`); continue; }
    for (const t of takes) {
      if (t.views === 0) continue;
      const bar = "█".repeat(Math.round(t.pct / 10)).padEnd(10, "░");
      console.log(`   ${t.label.padEnd(20)} ${bar} ${String(t.pct).padStart(3)}%  (${t.views}×, ${Math.round(t.watch)}s, eng ${t.eng})`);
    }
    console.log(`   → Signal: ${Math.round(signal)}s Gesamt-Watch\n`);
  }
  console.log(`Tipp: oben = wärmste Leads → zuerst anrufen (Tag 6-7, mit docs/sales/discovery_questions.md).`);
}
main().catch((e) => { console.error(e); process.exit(1); });
