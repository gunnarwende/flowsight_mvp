#!/usr/bin/env node
/**
 * seed_doerfler_precise.mjs — Precise seed for Dörfler AG matching B5 KPIs.
 * Target: NEU ~3, BEI UNS ~5, ERLEDIGT ~21 (7-day view)
 * Plus older cases for pagination + 2025 data.
 * Reviews: ~17 angefragt, ~10 erhalten.
 */

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TID = "d0000000-0000-0000-0000-000000000002";

const NAMES = [
  "Martin Keller", "Monika Wenger", "Andreas Gerber", "Barbara Steiner",
  "Hans Bühler", "Brigitte Baumann", "Franziska Gerber", "Stefan Fischer",
  "Claudia Huber", "Thomas Meier", "Sandra Schmid", "Peter Brunner",
  "Elisabeth Widmer", "Markus Weber", "Ursula Frei", "Daniel Keller",
  "Ruth Schneider", "René Müller", "Anna Hofer", "Kurt Zimmermann",
  "Heidi Gerber", "Marcel Müller", "Doris Gerber", "Niklaus Baumann",
  "Verena Steiner", "Fritz Meier", "Silvia Graf", "Walter Berger",
  "Margrit Schwarz", "Bruno Huber",
];

const CITIES = [
  { city: "Oberrieden", plz: "8942" }, { city: "Thalwil", plz: "8800" },
  { city: "Horgen", plz: "8810" }, { city: "Kilchberg", plz: "8802" },
  { city: "Adliswil", plz: "8134" }, { city: "Rüschlikon", plz: "8803" },
];

const STREETS = ["Seestrasse", "Bahnhofstrasse", "Dorfstrasse", "Hauptstrasse", "Gartenweg", "Birkenweg", "Schulstrasse", "Kirchgasse", "Weinbergstrasse", "Mühlegasse"];

const DONE_CATS = ["Leck", "Sanitär allgemein", "Boiler", "Heizung", "Verstopfung", "Rohrbruch", "Kontakt", "Allgemein", "Angebot", "Badsanierung", "Heizungsersatz", "Komplettrenovation"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(d) { return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString(); }
function phone(i) { return "+4176" + String(7000000 + i * 31337).slice(0, 7); }

async function main() {
  console.log("Seeding Dörfler AG (precise KPIs)...\n");

  const cases = [];

  // ═══ FEATURED CASE: Rohrbruch (Neu, Dringend) ═══
  cases.push({
    tenant_id: TID, category: "Rohrbruch", status: "new", urgency: "dringend",
    source: "voice", reporter_name: "Martin Keller", contact_phone: "+41767134096",
    street: "Seestrasse", house_number: "14", city: "Oberrieden", plz: "8942",
    description: "Der Anrufer steht im Keller knöcheltief im Wasser, vermutlich wegen eines Rohrbruchs.",
    created_at: daysAgo(0.5), is_demo: true,
  });

  // ═══ 2 weitere Neue (total 3) ═══
  cases.push({
    tenant_id: TID, category: "Sanitär allgemein", status: "new", urgency: "normal",
    source: "wizard", reporter_name: "Test Überschrift", contact_phone: "+41791234567",
    city: "Oberrieden", plz: "8942",
    description: "Sanierung ohne Badewanne mit Dusche",
    created_at: daysAgo(1), is_demo: true,
  });
  cases.push({
    tenant_id: TID, category: "Angebot", status: "new", urgency: "normal",
    source: "wizard", reporter_name: "Franziska Gerber", contact_phone: "+41791234568",
    city: "Langnau am Albis", plz: "8135",
    description: "Anfrage für Badsanierung",
    created_at: daysAgo(2), is_demo: true,
  });

  // ═══ 5 Bei uns (in_arbeit/scheduled/warten) ═══
  cases.push({
    tenant_id: TID, category: "Boiler", status: "in_arbeit", urgency: "normal",
    source: "voice", reporter_name: "Monika Wenger", contact_phone: "+41763001234",
    street: "Bahnhofstrasse", house_number: "22", city: "Thalwil", plz: "8800",
    description: "Boiler Service (Entkalkung).",
    created_at: daysAgo(3), is_demo: true,
  });
  cases.push({
    tenant_id: TID, category: "Badsanierung", status: "in_arbeit", urgency: "normal",
    source: "manual", reporter_name: "Andreas Gerber", contact_phone: "+41763005678",
    street: "Gartenweg", house_number: "5", city: "Adliswil", plz: "8134",
    description: "Komplettsanierung Bad geplant.",
    created_at: daysAgo(4), is_demo: true,
  });
  cases.push({
    tenant_id: TID, category: "Heizung", status: "scheduled", urgency: "normal",
    source: "voice", reporter_name: "Hans Bühler", contact_phone: "+41763009012",
    street: "Dorfstrasse", house_number: "8", city: "Thalwil", plz: "8800",
    description: "Heizkörper Ventil tropft.",
    created_at: daysAgo(5), is_demo: true,
  });
  cases.push({
    tenant_id: TID, category: "Leck", status: "in_arbeit", urgency: "dringend",
    source: "voice", reporter_name: "Stefan Fischer", contact_phone: "+41763002345",
    street: "Hauptstrasse", house_number: "31", city: "Horgen", plz: "8810",
    description: "Wasserhahn in Küche tropft seit Tagen.",
    created_at: daysAgo(2), is_demo: true,
  });
  cases.push({
    tenant_id: TID, category: "Verstopfung", status: "warten", urgency: "normal",
    source: "wizard", reporter_name: "Claudia Huber", contact_phone: "+41763003456",
    street: "Schulstrasse", house_number: "12", city: "Kilchberg", plz: "8802",
    description: "Abfluss Dusche läuft langsam.",
    created_at: daysAgo(6), is_demo: true,
  });

  // ═══ 21 Erledigte (Reviews: 17 angefragt, 10 erhalten) ═══
  for (let i = 0; i < 21; i++) {
    const name = NAMES[(i + 5) % NAMES.length];
    const loc = CITIES[i % CITIES.length];
    const cat = DONE_CATS[i % DONE_CATS.length];
    const reviewSent = i < 17;
    const reviewReceived = i < 10;
    const rating = reviewReceived ? (i < 8 ? 5 : 4) : null;

    cases.push({
      tenant_id: TID, category: cat, status: "done", urgency: "normal",
      source: pick(["voice", "wizard", "manual"]),
      reporter_name: name, contact_phone: phone(i + 5),
      street: STREETS[i % STREETS.length], house_number: String(2 + i * 3),
      city: loc.city, plz: loc.plz,
      description: `${cat} in ${loc.city} — erledigt.`,
      created_at: daysAgo(1 + i * 0.3),
      review_sent_at: reviewSent ? daysAgo(0.5 + i * 0.2) : null,
      review_rating: rating,
      review_received_at: reviewReceived ? daysAgo(0.3 + i * 0.15) : null,
      review_text: reviewReceived ? pick(["Schnell und zuverlässig!", "Top Service, danke!", "Sehr kompetent.", "Saubere Arbeit.", "Jederzeit wieder.", "Sehr zufrieden.", "Empfehlenswert!", "Schnelle Reaktion."]) : null,
      is_demo: true,
    });
  }

  // ═══ 20 Ältere Cases (2025 + früher, für Pagination) ═══
  for (let i = 0; i < 20; i++) {
    const name = NAMES[(i + 15) % NAMES.length];
    const loc = CITIES[i % CITIES.length];
    const cat = DONE_CATS[i % DONE_CATS.length];
    const month = 3 + (i % 10);
    const day = Math.min(28, 5 + i);
    cases.push({
      tenant_id: TID, category: cat, status: "done", urgency: "normal",
      source: pick(["voice", "wizard", "manual"]),
      reporter_name: name, contact_phone: phone(i + 20),
      city: loc.city, plz: loc.plz,
      description: `${cat} in ${loc.city}.`,
      created_at: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T10:00:00Z`,
      is_demo: true,
    });
  }

  // Insert
  const { data, error } = await sb.from("cases").insert(cases).select("seq_number, status, review_rating");
  if (error) {
    console.error("Insert error:", error.message);
    return;
  }

  // Stats
  const stats = { total: data.length, neu: 0, beiUns: 0, erledigt: 0, reviewSent: 0, reviewReceived: 0 };
  for (const c of data) {
    if (c.status === "new") stats.neu++;
    else if (["in_arbeit", "scheduled", "warten"].includes(c.status)) stats.beiUns++;
    else if (c.status === "done") stats.erledigt++;
    if (c.review_rating) stats.reviewReceived++;
  }

  console.log(`Inserted: ${stats.total} cases`);
  console.log(`Seq: ${data[0]?.seq_number} → ${data[data.length - 1]?.seq_number}`);
  console.log(`\nALL KPIs: NEU=${stats.neu} BEI_UNS=${stats.beiUns} ERLEDIGT=${stats.erledigt}`);
  console.log(`Reviews: ${stats.reviewReceived} erhalten`);

  // 7-day verify
  const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await sb.from("cases").select("status, review_sent_at, review_rating").eq("tenant_id", TID).gte("created_at", sevenAgo);
  const kpi = { neu: 0, beiUns: 0, erledigt: 0, revSent: 0, revRecv: 0 };
  for (const c of recent) {
    if (c.status === "new") kpi.neu++;
    else if (["in_arbeit", "scheduled", "warten"].includes(c.status)) kpi.beiUns++;
    else if (c.status === "done") kpi.erledigt++;
    if (c.review_sent_at) kpi.revSent++;
    if (c.review_rating) kpi.revRecv++;
  }
  console.log(`\n7-Day KPIs: NEU=${kpi.neu} BEI_UNS=${kpi.beiUns} ERLEDIGT=${kpi.erledigt}`);
  console.log(`7-Day Reviews: ${kpi.revRecv} erhalten / ${kpi.revSent} angefragt`);
  console.log("\n✅ Dörfler AG seed complete");
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
