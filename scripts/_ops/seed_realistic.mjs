#!/usr/bin/env node
/**
 * seed_realistic.mjs — Seed realistic cases with full lifecycle across ALL tenants.
 * Includes reviews (sent, received, ratings), realistic Swiss data, proper status flow.
 * Usage: node --env-file=src/web/.env.local scripts/_ops/seed_realistic.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Data pools ───────────────────────────────────────────────────────────────
const FN = ["Peter","Thomas","Martin","Daniel","Stefan","Marco","Patrick","Andreas","Michael","Christian","Sandra","Claudia","Monika","Ursula","Barbara","Andrea","Nicole","Sarah","Laura","Eva","Hans","Beat","René","Jürg","Fritz","Markus","Roland","Werner","Kurt","Rolf","Silvia","Heidi","Brigitte","Ruth","Elisabeth"];
const LN = ["Müller","Meier","Schmid","Keller","Weber","Huber","Schneider","Meyer","Fischer","Steiner","Brunner","Gerber","Frei","Zimmermann","Moser","Widmer","Wyss","Graf","Roth","Baumann","Bühler","Suter","Aebi","Graber","Hofer","Berger","Lüthi","Käser","Lehmann","Wenger"];
const STREETS = ["Seestrasse","Bahnhofstrasse","Dorfstrasse","Kirchgasse","Schulstrasse","Rosenweg","Birkenstrasse","Lindenstrasse","Bergstrasse","Wiesenweg","Gartenstrasse","Talstrasse","Höhenweg","Feldstrasse","Sonnhaldenstrasse","Rebbergstrasse","Industriestrasse","Mühlegasse","Alte Landstrasse","Im Grund","Kirchweg","Hauptstrasse","Oberdorfstrasse","Unterdorfstrasse","Rainstrasse"];
const CITIES = [
  {plz:"8942",city:"Oberrieden"},{plz:"8800",city:"Thalwil"},{plz:"8810",city:"Horgen"},
  {plz:"8802",city:"Kilchberg"},{plz:"8134",city:"Adliswil"},{plz:"8135",city:"Langnau am Albis"},
  {plz:"8803",city:"Rüschlikon"},{plz:"8820",city:"Wädenswil"},{plz:"8038",city:"Zürich"},
  {plz:"8002",city:"Zürich"},{plz:"8045",city:"Zürich Wollishofen"},{plz:"8952",city:"Schlieren"},
  {plz:"8143",city:"Stallikon"},{plz:"8136",city:"Gattikon"},{plz:"8805",city:"Richterswil"},
];
const CATS_SANITAER = ["Leck","Rohrbruch","Verstopfung","Heizung","Boiler","Sanitär allgemein","Wartung","Neuinstallation","Angebot","Kontakt","Spenglerei","Badsanierung"];
const DESCS = [
  "Wasserhahn tropft seit gestern in der Küche, Pfütze auf dem Boden.",
  "Heizung funktioniert seit heute Morgen nicht mehr, alle Radiatoren kalt.",
  "WC-Spülung läuft permanent nach, hoher Wasserverbrauch.",
  "Boiler zeigt Fehlermeldung E04, kein Warmwasser seit 2 Stunden.",
  "Verstopfter Abfluss Dusche, Wasser steht 10cm hoch.",
  "Rohrbruch im Keller! Wasser spritzt aus der Wand, DRINGEND!",
  "Badsanierung geplant, hätte gerne eine Offerte für komplettes Bad.",
  "Heizungsanlage macht seit einer Woche laute Klopfgeräusche.",
  "Regenrinne undicht an der Südseite, Wasser läuft die Fassade runter.",
  "Jährliche Wartung Heizungsanlage fällig, bitte Termin vereinbaren.",
  "Neue Wasserenthärtungsanlage gewünscht, Kalkproblem im ganzen Haus.",
  "Thermostatventil im Wohnzimmer defekt, Raum wird nicht warm.",
  "Küchenabfluss komplett verstopft, stinkt seit 3 Tagen.",
  "Zirkulationspumpe Warmwasser macht Geräusche und läuft heiss.",
  "Druckabfall Heizung von 1.8 auf 0.5 bar innert einer Woche.",
  "Toilette im OG verstopft, Wasser steigt beim Spülen!",
  "Möchten neue Armaturen im Bad, Grohe oder Hansgrohe.",
  "Feuchter Fleck an der Wand im Schlafzimmer, vermute Leck.",
  "Fussbodenheizung EG wird nur links warm, rechts bleibt kalt.",
  "Beratungstermin Solar-Warmwasser auf dem Dach gewünscht.",
  "Spülmaschine-Anschluss leckt, Wasser unter der Küche.",
  "Alte Bleirohre im Keller sollen ersetzt werden.",
  "Duschkopf-Schlauch tropft an der Verbindung.",
  "Heizöltank muss gereinigt werden, letzte Reinigung 2018.",
  "Aussenwasserhahn für Garten einfroren, vermutlich geplatzt.",
];

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function relDate(d) { return new Date(Date.now() - d * 86400000 - Math.random() * 43200000).toISOString(); }
function phone() { return "+4179" + String(Math.floor(Math.random() * 9000000) + 1000000); }

// ── Tenants to seed ──────────────────────────────────────────────────────────
const TENANTS = [
  { name: "Dörfler AG", id: "d0000000-0000-0000-0000-000000000002", googleAvg: 4.7 },
  { name: "Walter Leuthold", id: "d2afa695-367b-4581-8aa2-a68b33f9a037", googleAvg: 4.9 },
  { name: "Jul. Weinberger AG", id: "fc4ba994-c99c-4c17-9fa7-6c10bd0d6fa8", googleAvg: 4.4 },
  { name: "Brunner Haustechnik AG", id: "d0000000-0000-0000-0000-000000000001", googleAvg: 4.8 },
];

function buildCase(tid, daysAgo, status, opts = {}) {
  const loc = pick(CITIES);
  const fn = pick(FN), ln = pick(LN);
  const src = pick(["voice","voice","voice","wizard","wizard","manual"]);
  const urg = opts.urgency || pick(["normal","normal","normal","dringend","dringend","notfall"]);

  const c = {
    tenant_id: tid, source: src, category: pick(CATS_SANITAER),
    urgency: urg, description: pick(DESCS),
    plz: loc.plz, city: loc.city,
    street: pick(STREETS), house_number: String(Math.floor(Math.random() * 120) + 1),
    reporter_name: `${fn} ${ln}`, contact_phone: phone(),
    contact_email: `${fn.toLowerCase()}.${ln.toLowerCase()}@bluewin.ch`,
    status, is_demo: false,
    created_at: relDate(daysAgo),
    scheduled_at: null, assignee_text: null,
    review_sent_at: null, review_rating: null, review_received_at: null,
  };

  // Scheduled cases get an appointment
  if (status === "scheduled" || status === "in_arbeit") {
    c.scheduled_at = relDate(daysAgo - Math.random() * 2);
    c.assignee_text = pick(["Ramon Dörfler", "Luzian Dörfler", "Walter Leuthold", "Marco Müller", "Patrick Weber"]);
  }
  if (status === "done" && opts.withReview) {
    c.review_sent_at = relDate(daysAgo - 1 - Math.random());
    if (opts.reviewReceived) {
      c.review_rating = opts.rating || pick([4, 4, 5, 5, 5, 5, 5]);
      c.review_received_at = relDate(daysAgo - 2 - Math.random());
    }
  }
  return c;
}

async function seedTenant(tenant) {
  const { id: tid, name, googleAvg } = tenant;

  // Clean
  await sb.from("case_events").delete().eq("tenant_id", tid);
  await sb.from("cases").delete().eq("tenant_id", tid);

  const cases = [];

  // === LAST 7 DAYS: 18 cases — active work ===
  // 4 new (just came in)
  for (let i = 0; i < 4; i++) cases.push(buildCase(tid, Math.random() * 2 + 0.2, "new", { urgency: i === 0 ? "notfall" : i === 1 ? "dringend" : "normal" }));
  // 3 scheduled
  for (let i = 0; i < 3; i++) cases.push(buildCase(tid, Math.random() * 4 + 1, "scheduled"));
  // 2 in_arbeit
  for (let i = 0; i < 2; i++) cases.push(buildCase(tid, Math.random() * 3 + 1, "in_arbeit"));
  // 1 warten
  cases.push(buildCase(tid, Math.random() * 4 + 2, "warten"));
  // 8 done (recent completions, 5 with review sent, 3 with rating received)
  for (let i = 0; i < 8; i++) {
    const withReview = i < 5;
    const reviewReceived = i < 3;
    const rating = reviewReceived ? pick([4, 5, 5, 5, 5]) : null;
    cases.push(buildCase(tid, Math.random() * 5 + 1, "done", { withReview, reviewReceived, rating }));
  }

  // === 8-30 DAYS AGO: 22 cases — mostly done, good history ===
  for (let i = 0; i < 22; i++) {
    const daysAgo = Math.random() * 22 + 8;
    if (i < 1) { cases.push(buildCase(tid, daysAgo, "warten")); continue; }
    if (i < 2) { cases.push(buildCase(tid, daysAgo, "scheduled")); continue; }
    // 20 done
    const withReview = i % 2 === 0; // 50% get review request
    const reviewReceived = withReview && i % 3 !== 0; // ~67% of those respond
    const rating = reviewReceived ? pick([4, 4, 5, 5, 5, 5, 5]) : null;
    cases.push(buildCase(tid, daysAgo, "done", { withReview, reviewReceived, rating }));
  }

  // === 31-90 DAYS AGO: 20 cases — all done, established track record ===
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.random() * 59 + 31;
    const withReview = i % 2 === 0;
    const reviewReceived = withReview && i % 4 !== 0;
    const rating = reviewReceived ? pick([4, 5, 5, 5, 5, 5]) : null;
    cases.push(buildCase(tid, daysAgo, "done", { withReview, reviewReceived, rating }));
  }

  const { error } = await sb.from("cases").insert(cases);
  if (error) { console.error(`❌ ${name}: ${error.message}`); return; }

  // Events
  const { data: rows } = await sb.from("cases").select("id, status, source, created_at, review_sent_at, review_rating").eq("tenant_id", tid);
  const events = [];
  for (const c of rows) {
    // case_created
    events.push({ case_id: c.id, tenant_id: tid, event_type: "case_created",
      title: `Fall erstellt via ${c.source === "voice" ? "Anruf" : c.source === "wizard" ? "Website" : "manuell"}`,
      created_at: c.created_at });
    // SMS for voice
    if (c.source === "voice") {
      events.push({ case_id: c.id, tenant_id: tid, event_type: "sms_verification_sent",
        title: "SMS-Bestätigung an Melder gesendet",
        created_at: new Date(new Date(c.created_at).getTime() + 30000).toISOString() });
    }
    // Email notification
    events.push({ case_id: c.id, tenant_id: tid, event_type: "email_notification_sent",
      title: "Benachrichtigung an Betrieb gesendet",
      created_at: new Date(new Date(c.created_at).getTime() + 5000).toISOString() });
    // Status changes
    if (c.status !== "new") {
      const lbl = { scheduled: "Geplant", in_arbeit: "In Arbeit", warten: "Warten", done: "Erledigt" }[c.status];
      events.push({ case_id: c.id, tenant_id: tid, event_type: "status_changed",
        title: `Status geändert: Neu → ${lbl}`,
        metadata: { from: "new", to: c.status },
        created_at: new Date(new Date(c.created_at).getTime() + 3600000 + Math.random() * 7200000).toISOString() });
    }
    // Review events
    if (c.review_sent_at) {
      events.push({ case_id: c.id, tenant_id: tid, event_type: "review_requested",
        title: "Bewertungsanfrage per E-Mail gesendet",
        created_at: c.review_sent_at });
    }
    if (c.review_rating) {
      events.push({ case_id: c.id, tenant_id: tid, event_type: "review_received",
        title: `Bewertung erhalten: ${c.review_rating} Sterne`,
        metadata: { rating: c.review_rating },
        created_at: new Date(new Date(c.review_sent_at).getTime() + 86400000 + Math.random() * 172800000).toISOString() });
    }
  }
  await sb.from("case_events").insert(events);

  // Stats
  const rated = rows.filter(c => c.review_rating);
  const avgR = rated.length ? (rated.reduce((s, c) => s + c.review_rating, 0) / rated.length).toFixed(1) : "-";
  const sent = rows.filter(c => c.review_sent_at).length;
  const byStatus = {};
  rows.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

  // Update google_review_avg in modules
  const { data: t } = await sb.from("tenants").select("modules").eq("id", tid).single();
  const mods = { ...(t?.modules || {}), google_review_avg: googleAvg };
  await sb.from("tenants").update({ modules: mods }).eq("id", tid);

  console.log(`\n✅ ${name}: ${cases.length} cases + ${events.length} events`);
  console.log(`   Status: ${JSON.stringify(byStatus)}`);
  console.log(`   Reviews: ${sent} gesendet, ${rated.length} erhalten, Ø ${avgR}`);
  console.log(`   Google: ${googleAvg}★`);
}

async function main() {
  console.log("🔄 Seeding realistic data for ALL tenants...\n");
  for (const t of TENANTS) await seedTenant(t);
  console.log("\n🎉 Done. All tenants have realistic cases with reviews.");
}

main().catch(console.error);
