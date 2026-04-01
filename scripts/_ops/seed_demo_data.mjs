#!/usr/bin/env node
// ===========================================================================
// seed_demo_data.mjs — Generate realistic demo cases for a tenant
//
// Usage:
//   node --env-file=src/web/.env.local scripts/_ops/seed_demo_data.mjs --tenant=<uuid> [--gewerk=sanitaer] [--count=15] [--clean]
//
// Flags:
//   --tenant=<uuid>   Tenant ID (required)
//   --gewerk=<type>   Trade type: sanitaer (default), heizung, allgemein
//   --count=<n>       Number of cases to generate (default: 15)
//   --clean           Delete existing demo cases for this tenant before seeding
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env or .env.local
// ===========================================================================

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
import { randomUUID } from "node:crypto";

// ── ENV ────────────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── ARGS ───────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);

const tenantId = args.tenant;
if (!tenantId) {
  console.error("❌ --tenant=<uuid> is required");
  process.exit(1);
}

const gewerk = args.gewerk ?? "sanitaer";
const count = parseInt(args.count ?? "15", 10);
const clean = args.clean === "true";

// ── TEMPLATES ──────────────────────────────────────────────────────────────

const SWISS_NAMES = [
  "Müller", "Meier", "Brunner", "Fischer", "Weber",
  "Huber", "Schmid", "Keller", "Wagner", "Steiner",
  "Baumann", "Gerber", "Frei", "Roth", "Maurer",
];

const SWISS_FIRST_NAMES = [
  "Thomas", "Peter", "Daniel", "Martin", "Andreas",
  "Sandra", "Monika", "Claudia", "Ursula", "Barbara",
  "Stefan", "Markus", "Christian", "Hans", "Beat",
];

const CITIES = [
  { plz: "8800", city: "Thalwil" },
  { plz: "8942", city: "Oberrieden" },
  { plz: "8810", city: "Horgen" },
  { plz: "8802", city: "Kilchberg" },
  { plz: "8803", city: "Rüschlikon" },
  { plz: "8134", city: "Adliswil" },
  { plz: "8002", city: "Zürich" },
  { plz: "8038", city: "Zürich" },
];

const STREETS = [
  "Seestrasse", "Bahnhofstrasse", "Dorfstrasse", "Hauptstrasse",
  "Kirchweg", "Schulhausstrasse", "Bergstrasse", "Industriestrasse",
  "Gartenstrasse", "Rosenweg",
];

const CASE_TEMPLATES = {
  sanitaer: [
    // Notfälle (3)
    { category: "Sanitär-Notfall", description: "Wasserrohrbruch im Keller. Wasser steht ca. 5cm hoch. Bitte dringend kommen.", urgency: "notfall" },
    { category: "Sanitär-Notfall", description: "Abfluss komplett verstopft in der Küche. Wasser läuft über. Brauchen sofortige Hilfe.", urgency: "notfall" },
    { category: "Heizungs-Notfall", description: "Heizung ausgefallen, Kleinkind im Haus. Temperatur sinkt. Bitte so schnell wie möglich.", urgency: "notfall" },
    // Reparaturen (5)
    { category: "Reparatur", description: "Tropfender Wasserhahn im Badezimmer, seit ca. 2 Wochen. Wird immer schlimmer.", urgency: "normal" },
    { category: "Reparatur", description: "WC-Spülung defekt, Wasser läuft ständig nach. Verbrauch steigt.", urgency: "normal" },
    { category: "Reparatur", description: "Dusche im OG undicht. Fliesen im Bereich der Duschwanne feucht.", urgency: "normal" },
    { category: "Reparatur", description: "Thermostat an der Heizung im Wohnzimmer reagiert nicht mehr. Raum wird nicht warm.", urgency: "normal" },
    { category: "Reparatur", description: "Warmwasserboiler macht seltsame Geräusche. Kein heisses Wasser mehr ab ca. 18 Uhr.", urgency: "dringend" },
    // Neuinstallationen (3)
    { category: "Neuinstallation", description: "Badezimmer komplett erneuern. Offerte gewünscht für Sanitär inkl. Plättli.", urgency: "normal" },
    { category: "Neuinstallation", description: "Boiler ersetzen, aktuelles Gerät ist 15 Jahre alt. Beratung gewünscht.", urgency: "normal" },
    { category: "Neuinstallation", description: "Regendusche im Masterbad nachrüsten. Beratung und Offerte gewünscht.", urgency: "normal" },
    // Wartung (2)
    { category: "Wartung", description: "Jahreswartung Heizungsanlage. Bitte Termin in den nächsten 2-3 Wochen.", urgency: "normal" },
    { category: "Wartung", description: "Entkalkung der Warmwasseranlage fällig. Letztes Mal vor 3 Jahren.", urgency: "normal" },
    // Anfragen (2)
    { category: "Allgemein", description: "Allgemeine Frage zu Kosten für Badezimmerumbau. Bitte Rückruf.", urgency: "normal" },
    { category: "Angebot", description: "Offerte für komplette Sanitärsanierung im EG. 2 Bäder, 1 Küche.", urgency: "normal" },
    // Kontakt (1)
    { category: "Kontakt", description: "Bitte um Rückruf zwecks Terminvereinbarung für Beratung vor Ort.", urgency: "normal" },
  ],
  heizung: [
    { category: "Heizungs-Notfall", description: "Heizung komplett ausgefallen. Haus kühlt schnell ab.", urgency: "notfall" },
    { category: "Heizungs-Notfall", description: "Gasgeruch bei der Heizung im Keller. Bitte sofort kommen.", urgency: "notfall" },
    { category: "Heizungs-Notfall", description: "Heizkörper tropft stark. Grosse Pfütze auf dem Boden.", urgency: "notfall" },
    { category: "Reparatur", description: "Heizung macht Klopfgeräusche, besonders nachts. Seit 1 Woche.", urgency: "normal" },
    { category: "Reparatur", description: "Ein Heizkörper im Kinderzimmer wird nicht warm, Rest funktioniert.", urgency: "normal" },
    { category: "Reparatur", description: "Thermostat zeigt Fehlermeldung E04 an. Bedienungsanleitung hilft nicht.", urgency: "normal" },
    { category: "Reparatur", description: "Fussbodenheizung im Bad funktioniert nicht mehr. Fliesen kalt.", urgency: "dringend" },
    { category: "Reparatur", description: "Warmwasser kommt nur lauwarm. Heizung scheint normal zu laufen.", urgency: "normal" },
    { category: "Neuinstallation", description: "Heizung ersetzen: Öl auf Wärmepumpe. Beratung gewünscht.", urgency: "normal" },
    { category: "Neuinstallation", description: "Neue Heizung für Neubau. Einfamilienhaus, ca. 160m².", urgency: "normal" },
    { category: "Neuinstallation", description: "Solarthermie-Anlage als Ergänzung zur bestehenden Heizung.", urgency: "normal" },
    { category: "Wartung", description: "Jährliche Heizungswartung fällig. Ölbrenner, Baujahr 2018.", urgency: "normal" },
    { category: "Wartung", description: "Heizungsspülung gewünscht. Heizkörper werden nicht gleichmässig warm.", urgency: "normal" },
    { category: "Allgemein", description: "Frage zu Förderbeiträgen für Heizungsersatz. Bitte Rückruf.", urgency: "normal" },
    { category: "Angebot", description: "Offerte für Heizungssanierung im MFH. 6 Wohnungen.", urgency: "normal" },
    { category: "Kontakt", description: "Rückruf gewünscht für Beratungstermin Heizung.", urgency: "normal" },
  ],
  allgemein: [
    { category: "Notfall", description: "Wasserrohrbruch, dringend Hilfe nötig!", urgency: "notfall" },
    { category: "Notfall", description: "Heizung ausgefallen bei Minusgraden.", urgency: "notfall" },
    { category: "Notfall", description: "Abfluss verstopft, Wasser in der Küche.", urgency: "notfall" },
    { category: "Reparatur", description: "Tropfender Hahn seit 2 Wochen.", urgency: "normal" },
    { category: "Reparatur", description: "WC-Spülung läuft nach.", urgency: "normal" },
    { category: "Reparatur", description: "Heizkörper wird nicht warm.", urgency: "normal" },
    { category: "Reparatur", description: "Dusche undicht.", urgency: "normal" },
    { category: "Reparatur", description: "Boiler macht Geräusche.", urgency: "dringend" },
    { category: "Neuinstallation", description: "Badezimmer komplett neu, Offerte gewünscht.", urgency: "normal" },
    { category: "Neuinstallation", description: "Boiler ersetzen, 15 Jahre alt.", urgency: "normal" },
    { category: "Neuinstallation", description: "Regendusche nachrüsten.", urgency: "normal" },
    { category: "Wartung", description: "Jahreswartung Heizung.", urgency: "normal" },
    { category: "Wartung", description: "Entkalkung Warmwasser.", urgency: "normal" },
    { category: "Allgemein", description: "Allgemeine Frage, bitte Rückruf.", urgency: "normal" },
    { category: "Angebot", description: "Offerte für Sanitärsanierung.", urgency: "normal" },
    { category: "Kontakt", description: "Terminvereinbarung gewünscht.", urgency: "normal" },
  ],
};

const STATUS_DISTRIBUTION = [
  "done", "done", "done", "done", "done",
  "new", "new", "new",
  "in_arbeit", "in_arbeit",
  "scheduled", "scheduled",
  "new", "warten", "done",
  "done",
];

const SOURCE_DISTRIBUTION = [
  "voice", "voice", "voice", "voice", "voice",
  "voice", "voice", "voice",
  "wizard", "wizard", "wizard", "wizard", "wizard",
  "manual", "manual",
  "voice",
];

// ── HELPERS ────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const prefix = pick(["79", "78", "76"]);
  const num = String(Math.floor(Math.random() * 10000000)).padStart(7, "0");
  return `+41${prefix}${num}`;
}

function relativeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 12) + 7); // 07:00–19:00
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(Math.floor(Math.random() * 60));
  return d.toISOString();
}

// ── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  // Verify tenant exists
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("id", tenantId)
    .single();

  if (tErr || !tenant) {
    console.error(`❌ Tenant ${tenantId} not found`);
    process.exit(1);
  }

  console.log(`🏢 Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`🔧 Gewerk: ${gewerk}`);
  console.log(`📊 Count: ${count}`);

  // Clean existing demo cases
  if (clean) {
    const { count: deleted } = await supabase
      .from("cases")
      .delete({ count: "exact" })
      .eq("tenant_id", tenantId)
      .eq("is_demo", true);
    console.log(`🧹 Cleaned ${deleted ?? 0} existing demo cases`);
  }

  const templates = CASE_TEMPLATES[gewerk] ?? CASE_TEMPLATES.allgemein;

  // Generate cases
  const cases = [];
  for (let i = 0; i < count; i++) {
    const tmpl = templates[i % templates.length];
    const loc = pick(CITIES);
    const firstName = pick(SWISS_FIRST_NAMES);
    const lastName = pick(SWISS_NAMES);
    const daysAgo = Math.floor(Math.random() * 14) + 1; // 1–14 days ago
    const createdAt = relativeDate(daysAgo);
    const status = STATUS_DISTRIBUTION[i % STATUS_DISTRIBUTION.length];
    const source = SOURCE_DISTRIBUTION[i % SOURCE_DISTRIBUTION.length];

    cases.push({
      id: randomUUID(),
      tenant_id: tenantId,
      source,
      created_at: createdAt,
      reporter_name: `${firstName} ${lastName}`,
      contact_phone: randomPhone(),
      contact_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      plz: loc.plz,
      city: loc.city,
      street: pick(STREETS),
      house_number: String(Math.floor(Math.random() * 80) + 1),
      category: tmpl.category,
      urgency: tmpl.urgency,
      description: tmpl.description,
      status,
      is_demo: true,
      review_sent_at: status === "done" && i % 3 === 0
        ? new Date(new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    });
  }

  // Insert cases
  const { error: insertErr } = await supabase.from("cases").insert(cases);
  if (insertErr) {
    console.error("❌ Insert failed:", insertErr.message);
    process.exit(1);
  }
  console.log(`✅ Inserted ${cases.length} demo cases`);

  // Generate case events for each case
  const events = [];
  for (const c of cases) {
    // case_created event
    events.push({
      case_id: c.id,
      tenant_id: tenantId,
      event_type: "case_created",
      title: `Fall erstellt via ${c.source === "voice" ? "Anruf" : c.source === "wizard" ? "Website" : "manuell"}`,
      created_at: c.created_at,
    });

    // status_changed events for non-new cases
    if (c.status !== "new") {
      const statusTime = new Date(new Date(c.created_at).getTime() + 2 * 60 * 60 * 1000);
      events.push({
        case_id: c.id,
        tenant_id: tenantId,
        event_type: "status_changed",
        title: `Status geändert: Neu → ${c.status === "scheduled" ? "Geplant" : c.status === "in_arbeit" ? "In Arbeit" : c.status === "warten" ? "Warten" : "Erledigt"}`,
        metadata: { from: "new", to: c.status },
        created_at: statusTime.toISOString(),
      });
    }

    // SMS verification event for voice cases
    if (c.source === "voice") {
      const smsTime = new Date(new Date(c.created_at).getTime() + 30 * 1000);
      events.push({
        case_id: c.id,
        tenant_id: tenantId,
        event_type: "sms_verification_sent",
        title: "SMS-Verifizierung gesendet",
        created_at: smsTime.toISOString(),
      });
    }

    // Review event for cases with review_sent_at
    if (c.review_sent_at) {
      events.push({
        case_id: c.id,
        tenant_id: tenantId,
        event_type: "review_requested",
        title: "Review-Anfrage via E-Mail gesendet",
        metadata: { channel: "email" },
        created_at: c.review_sent_at,
      });
    }
  }

  const { error: evErr } = await supabase.from("case_events").insert(events);
  if (evErr) {
    console.error("⚠️  Events insert failed:", evErr.message);
    // Non-fatal — cases are already in
  } else {
    console.log(`✅ Inserted ${events.length} case events`);
  }

  console.log(`\n🎉 Demo data ready for ${tenant.name}`);
  console.log(`   Dashboard: /ops/cases`);
  console.log(`   Clean up:  node scripts/_ops/seed_demo_data.mjs --tenant=${tenantId} --clean --count=0`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
