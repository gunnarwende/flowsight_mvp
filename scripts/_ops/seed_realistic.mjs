#!/usr/bin/env node
/**
 * seed_realistic.mjs — Realistic cases spanning Jan 2026 to today.
 * KPIs MUST visibly change between 7d, 30d, and YTD filters.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FN = ["Peter","Thomas","Martin","Daniel","Stefan","Marco","Patrick","Andreas","Michael","Christian","Sandra","Claudia","Monika","Ursula","Barbara","Andrea","Nicole","Sarah","Laura","Eva","Hans","Beat","René","Jürg","Fritz","Markus","Roland","Werner","Kurt","Rolf","Silvia","Heidi","Brigitte","Ruth","Elisabeth"];
const LN = ["Müller","Meier","Schmid","Keller","Weber","Huber","Schneider","Meyer","Fischer","Steiner","Brunner","Gerber","Frei","Zimmermann","Moser","Widmer","Wyss","Graf","Roth","Baumann","Bühler","Suter","Aebi","Graber","Hofer"];
const STREETS = ["Seestrasse","Bahnhofstrasse","Dorfstrasse","Kirchgasse","Schulstrasse","Rosenweg","Birkenstrasse","Lindenstrasse","Bergstrasse","Wiesenweg","Gartenstrasse","Talstrasse","Höhenweg","Feldstrasse","Sonnhaldenstrasse","Rebbergstrasse","Mühlegasse","Alte Landstrasse","Im Grund","Kirchweg","Hauptstrasse"];
const CITIES = [
  {plz:"8942",city:"Oberrieden"},{plz:"8800",city:"Thalwil"},{plz:"8810",city:"Horgen"},
  {plz:"8802",city:"Kilchberg"},{plz:"8134",city:"Adliswil"},{plz:"8135",city:"Langnau am Albis"},
  {plz:"8803",city:"Rüschlikon"},{plz:"8820",city:"Wädenswil"},{plz:"8038",city:"Zürich"},
  {plz:"8002",city:"Zürich"},{plz:"8045",city:"Zürich"},{plz:"8952",city:"Schlieren"},
  {plz:"8143",city:"Stallikon"},{plz:"8805",city:"Richterswil"},
];
const CATS = ["Leck","Rohrbruch","Verstopfung","Heizung","Boiler","Sanitär allgemein","Wartung","Neuinstallation","Angebot","Kontakt","Spenglerei","Badsanierung"];
const DESCS = [
  "Wasserhahn tropft seit gestern in der Küche.","Heizung funktioniert nicht, Radiator kalt.",
  "WC-Spülung läuft permanent nach.","Boiler Fehlermeldung, kein Warmwasser.",
  "Verstopfter Abfluss Dusche.","Rohrbruch im Keller — DRINGEND!",
  "Badsanierung geplant, Offerte gewünscht.","Heizung macht laute Klopfgeräusche.",
  "Regenrinne undicht.","Jährliche Wartung Heizung fällig.",
  "Wasserenthärtungsanlage gewünscht.","Thermostatventil defekt.",
  "Küchenabfluss verstopft.","Zirkulationspumpe defekt.",
  "Druckabfall Heizung.","Toilette verstopft, dringend!",
  "Neue Armaturen Bad gewünscht.","Feuchter Fleck an Wand, vermute Leck.",
  "Fussbodenheizung ungleichmässig.","Beratung Solar gewünscht.",
  "Spülmaschine-Anschluss leckt.","Alte Bleirohre ersetzen.",
  "Duschkopf tropft.","Heizöltank Reinigung nötig.","Aussenwasserhahn eingefroren.",
];
const STAFF = ["Ramon Dörfler","Luzian Dörfler","Walter Leuthold","Marco Müller","Patrick Weber","Daniel Keller"];

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function phone() { return "+4179" + String(Math.floor(Math.random() * 9000000) + 1000000); }

const TENANTS = [
  { name: "Dörfler AG", id: "d0000000-0000-0000-0000-000000000002", googleAvg: 4.7 },
  { name: "Walter Leuthold", id: "d2afa695-367b-4581-8aa2-a68b33f9a037", googleAvg: 4.9 },
  { name: "Jul. Weinberger AG", id: "fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8", googleAvg: 4.4 },
  { name: "Brunner Haustechnik AG", id: "d0000000-0000-0000-0000-000000000001", googleAvg: 4.8 },
];

function dateInRange(startDaysAgo, endDaysAgo) {
  const d = startDaysAgo - Math.random() * (startDaysAgo - endDaysAgo);
  return new Date(Date.now() - d * 86400000).toISOString();
}

function buildCase(tid, created_at, status, opts = {}) {
  const loc = pick(CITIES);
  const fn = pick(FN), ln = pick(LN);
  const src = pick(["voice","voice","voice","wizard","wizard","manual"]);
  return {
    tenant_id: tid, source: src, category: pick(CATS),
    urgency: opts.urgency || pick(["normal","normal","normal","normal","dringend","dringend","notfall"]),
    description: pick(DESCS),
    plz: loc.plz, city: loc.city, street: pick(STREETS),
    house_number: String(Math.floor(Math.random() * 120) + 1),
    reporter_name: `${fn} ${ln}`, contact_phone: phone(),
    contact_email: `${fn.toLowerCase()}.${ln.toLowerCase()}@bluewin.ch`,
    status, is_demo: false, created_at,
    scheduled_at: ["scheduled","in_arbeit"].includes(status) ? dateInRange(3, 0) : null,
    assignee_text: ["scheduled","in_arbeit","done"].includes(status) ? pick(STAFF) : null,
    review_sent_at: opts.reviewSent ? new Date(new Date(created_at).getTime() + (2 + Math.random() * 3) * 86400000).toISOString() : null,
    review_rating: opts.rating || null,
    review_received_at: opts.rating ? new Date(new Date(created_at).getTime() + (3 + Math.random() * 5) * 86400000).toISOString() : null,
  };
}

async function seedTenant(t) {
  await sb.from("case_events").delete().eq("tenant_id", t.id);
  await sb.from("cases").delete().eq("tenant_id", t.id);

  const cases = [];

  // ═══ 7 TAGE: 12 Fälle — aktive Arbeit ═══
  // KPIs 7d: ~4 Neu, ~3 Bei uns, ~5 Erledigt, ~2 Bewertungen
  cases.push(buildCase(t.id, dateInRange(1, 0), "new", { urgency: "notfall" }));
  cases.push(buildCase(t.id, dateInRange(2, 0), "new", { urgency: "dringend" }));
  cases.push(buildCase(t.id, dateInRange(1, 0), "new"));
  cases.push(buildCase(t.id, dateInRange(2, 1), "new"));
  cases.push(buildCase(t.id, dateInRange(4, 1), "scheduled"));
  cases.push(buildCase(t.id, dateInRange(3, 1), "in_arbeit"));
  cases.push(buildCase(t.id, dateInRange(5, 2), "warten"));
  cases.push(buildCase(t.id, dateInRange(6, 3), "done", { reviewSent: true, rating: 5 }));
  cases.push(buildCase(t.id, dateInRange(5, 2), "done", { reviewSent: true, rating: 4 }));
  cases.push(buildCase(t.id, dateInRange(6, 3), "done", { reviewSent: true }));
  cases.push(buildCase(t.id, dateInRange(4, 2), "done"));
  cases.push(buildCase(t.id, dateInRange(7, 4), "done"));

  // ═══ 8-30 TAGE: 18 Fälle — überwiegend erledigt ═══
  // KPIs 30d: ~4 Neu, ~3 Bei uns, ~23 Erledigt (5+18), ~8 Bewertungen (2+6)
  for (let i = 0; i < 18; i++) {
    const created = dateInRange(30, 8);
    if (i < 14) {
      const rs = i % 2 === 0;
      const rating = rs && i % 3 !== 0 ? pick([4, 5, 5, 5, 5]) : null;
      cases.push(buildCase(t.id, created, "done", { reviewSent: rs, rating }));
    } else if (i < 16) {
      cases.push(buildCase(t.id, created, "done"));
    } else if (i === 16) {
      cases.push(buildCase(t.id, created, "warten"));
    } else {
      cases.push(buildCase(t.id, created, "scheduled"));
    }
  }

  // ═══ 31-90 TAGE: 25 Fälle — alle erledigt, solide Bewertungen ═══
  // KPIs YTD: ~4 Neu, ~3 Bei uns, ~48 Erledigt, ~18 Bewertungen
  for (let i = 0; i < 25; i++) {
    const created = dateInRange(90, 31);
    const rs = i % 2 === 0;
    const rating = rs ? pick([4, 5, 5, 5, 5]) : null;
    cases.push(buildCase(t.id, created, "done", { reviewSent: rs, rating }));
  }

  // ═══ Q1 2026 (Jan-März): 25 Fälle — Aufbauphase, alle erledigt ═══
  for (let i = 0; i < 25; i++) {
    const daysAgo = 91 + Math.floor(Math.random() * 60); // ~91-150 days ago (Jan-Feb)
    const created = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const rs = i % 3 === 0;
    const rating = rs ? pick([4, 5, 5, 5]) : null;
    cases.push(buildCase(t.id, created, "done", { reviewSent: rs, rating }));
  }

  const { error } = await sb.from("cases").insert(cases);
  if (error) { console.error(`❌ ${t.name}: ${error.message}`); return; }

  // Events
  const { data: rows } = await sb.from("cases").select("id, status, source, created_at, review_sent_at, review_rating").eq("tenant_id", t.id);
  const events = [];
  for (const c of rows) {
    events.push({ case_id: c.id, tenant_id: t.id, event_type: "case_created", title: `Fall erstellt via ${c.source === "voice" ? "Anruf" : c.source === "wizard" ? "Website" : "manuell"}`, created_at: c.created_at });
    if (c.source === "voice") events.push({ case_id: c.id, tenant_id: t.id, event_type: "sms_verification_sent", title: "SMS-Bestätigung gesendet", created_at: new Date(new Date(c.created_at).getTime() + 30000).toISOString() });
    events.push({ case_id: c.id, tenant_id: t.id, event_type: "email_notification_sent", title: "Benachrichtigung gesendet", created_at: new Date(new Date(c.created_at).getTime() + 5000).toISOString() });
    if (c.status !== "new") {
      const lbl = { scheduled: "Geplant", in_arbeit: "In Arbeit", warten: "Warten", done: "Erledigt" }[c.status] || c.status;
      events.push({ case_id: c.id, tenant_id: t.id, event_type: "status_changed", title: `Status: Neu → ${lbl}`, metadata: { from: "new", to: c.status }, created_at: new Date(new Date(c.created_at).getTime() + 3600000 + Math.random() * 7200000).toISOString() });
    }
    if (c.review_sent_at) events.push({ case_id: c.id, tenant_id: t.id, event_type: "review_requested", title: "Bewertungsanfrage gesendet", created_at: c.review_sent_at });
    if (c.review_rating) events.push({ case_id: c.id, tenant_id: t.id, event_type: "review_received", title: `Bewertung erhalten: ${c.review_rating}★`, metadata: { rating: c.review_rating }, created_at: new Date(new Date(c.review_sent_at).getTime() + 86400000 + Math.random() * 172800000).toISOString() });
  }
  await sb.from("case_events").insert(events);

  // Google avg
  const { data: tr } = await sb.from("tenants").select("modules").eq("id", t.id).single();
  await sb.from("tenants").update({ modules: { ...(tr?.modules || {}), google_review_avg: t.googleAvg } }).eq("id", t.id);

  // Stats
  const rated = rows.filter(c => c.review_rating);
  const d7 = new Date(Date.now() - 7 * 86400000);
  const d30 = new Date(Date.now() - 30 * 86400000);
  const r7 = rows.filter(c => new Date(c.created_at) >= d7);
  const r30 = rows.filter(c => new Date(c.created_at) >= d30);
  const st7 = {}; r7.forEach(c => { st7[c.status] = (st7[c.status]||0)+1; });
  const st30 = {}; r30.forEach(c => { st30[c.status] = (st30[c.status]||0)+1; });
  const stAll = {}; rows.forEach(c => { stAll[c.status] = (stAll[c.status]||0)+1; });

  console.log(`\n✅ ${t.name}: ${cases.length} cases + ${events.length} events`);
  console.log(`   7d:  ${r7.length} cases | ${JSON.stringify(st7)} | reviews: ${r7.filter(c=>c.review_rating).length}`);
  console.log(`   30d: ${r30.length} cases | ${JSON.stringify(st30)} | reviews: ${r30.filter(c=>c.review_rating).length}`);
  console.log(`   YTD: ${rows.length} cases | ${JSON.stringify(stAll)} | reviews: ${rated.length}`);
  console.log(`   Google: ${t.googleAvg}★`);
}

async function main() {
  console.log("🔄 Seeding realistic data (Jan 2026 → today) for ALL tenants...");
  for (const t of TENANTS) await seedTenant(t);
  console.log("\n🎉 Done.");
}

main().catch(console.error);
