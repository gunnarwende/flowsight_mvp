#!/usr/bin/env node
/**
 * seed_screenflow_from_config.mjs — Generic seed for Take 2 screenflow.
 *
 * Reads ONLY tenant_config.json. Branchen-agnostisch. Works for Sanitaer,
 * Elektriker, Friseur, Garage, etc.
 *
 * What it does:
 *   1. Resolves tenant_id from slug.
 *   2. Deletes all existing cases for this tenant (clean slate for video).
 *   3. Upserts staff record for prospect email with display_name = tenant short name.
 *      → Greeting "Guten Abend, Dörfler" instead of "Admin".
 *   4. Updates tenants.modules.google_review_avg + google_review_count
 *      from config.seed → FlowBar shows stars instead of "Noch keine".
 *   5. Inserts cases matching target KPIs (all categories from config):
 *      - 1× Notfall (urgency=notfall, in_arbeit) → ROT markiert in Leitsystem
 *      - 1× Featured Phone Case (from seed.phone_demo_case, created "now")
 *      - 1× Wizard Case (from seed.wizard_demo_case)
 *      - 5× "Bei uns" cases (in_arbeit/scheduled/warten)
 *      - 21× Done cases, 17 mit review_sent_at, 10 mit review_rating
 *      - 20× Older 2025 cases (pagination + 2025-Daten)
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/seed_screenflow_from_config.mjs \
 *     --slug doerfler-ag
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── CLI ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] ||
  (() => { const i = args.indexOf("--slug"); return i >= 0 ? args[i + 1] : null; })();

if (!slug) {
  console.error("Usage: seed_screenflow_from_config.mjs --slug <slug>");
  process.exit(1);
}

// ── Load tenant_config.json (SSOT) ────────────────────────────────────────
const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const va = config.voice_agent;
const seed = config.seed || {};
const prospect = config.prospect || {};

// ── Helper: pick random, dates ────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(d) { return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString(); }
function minutesAgo(m) { return new Date(Date.now() - m * 60 * 1000).toISOString(); }
function hoursAgo(h) { return new Date(Date.now() - h * 60 * 60 * 1000).toISOString(); }

// Tenant short name for greeting (first word, e.g. "Dörfler AG" → "Dörfler")
const tenantShortName = t.name.split(/[\s.]+/).filter(Boolean)[0] || t.name;

// ── Resolve categories from config (branchenagnostisch) ────────────────────
function getCategories() {
  // Priority 1: seed.categories_weighted (object → keys)
  if (seed.categories_weighted && typeof seed.categories_weighted === "object") {
    return Object.keys(seed.categories_weighted);
  }
  // Priority 2: voice_agent.categories (pipe-separated string)
  if (va.categories && typeof va.categories === "string") {
    return va.categories.split("|").map((c) => c.trim()).filter(Boolean);
  }
  // Priority 3: wizard.categories
  if (config.wizard?.categories && Array.isArray(config.wizard.categories)) {
    return config.wizard.categories.map((c) => c.value).filter(Boolean);
  }
  // Fallback
  return ["Allgemein"];
}

// ── Reporter names pool (generic Swiss names) ─────────────────────────────
const REPORTER_NAMES = [
  "Martin Keller", "Monika Wenger", "Andreas Gerber", "Barbara Steiner",
  "Hans Bühler", "Brigitte Baumann", "Franziska Gerber", "Stefan Fischer",
  "Claudia Huber", "Thomas Meier", "Sandra Schmid", "Peter Brunner",
  "Elisabeth Widmer", "Markus Weber", "Ursula Frei", "Daniel Keller",
  "Ruth Schneider", "René Müller", "Anna Hofer", "Kurt Zimmermann",
  "Heidi Gerber", "Marcel Müller", "Doris Gerber", "Niklaus Baumann",
  "Verena Steiner", "Fritz Meier", "Silvia Graf", "Walter Berger",
  "Margrit Schwarz", "Bruno Huber",
];

const STREETS = [
  "Seestrasse", "Bahnhofstrasse", "Dorfstrasse", "Hauptstrasse", "Gartenweg",
  "Birkenweg", "Schulstrasse", "Kirchgasse", "Weinbergstrasse", "Mühlegasse",
];

// Resolve cities from config.seed.service_area_plz.
// FB61 + Auffälligkeit 3: OWN-Location (aus voice_agent.address) wird erste
// Option + weitere Zimmerberg-Gemeinden werden prepend für geographische Diversität.
function getCities() {
  const PLZ_TO_CITY = {
    "8001": "Zürich", "8002": "Zürich", "8003": "Zürich", "8004": "Zürich",
    "8005": "Zürich", "8006": "Zürich", "8008": "Zürich", "8032": "Zürich",
    "8037": "Zürich", "8038": "Zürich", "8041": "Zürich", "8045": "Zürich",
    "8048": "Zürich", "8055": "Zürich",
    "8942": "Oberrieden", "8800": "Thalwil", "8810": "Horgen",
    "8802": "Kilchberg", "8134": "Adliswil", "8803": "Rüschlikon",
    "8135": "Langnau am Albis", "8820": "Wädenswil", "8804": "Au ZH",
    "8805": "Richterswil",
  };

  // Parse own location from voice_agent.address
  let ownLoc = null;
  const addrMatch = (va.address || "").match(/(\d{4})\s+([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ\s\-]+?)(?:,|$)/);
  if (addrMatch) ownLoc = { plz: addrMatch[1], city: addrMatch[2].trim() };

  const plzList = seed.service_area_plz || [];
  const cities = plzList.map((plz) => ({ plz, city: PLZ_TO_CITY[plz] || "Zürich" }));

  // Prepend own location if not already in list (Diversität + persönlicher Bezug)
  if (ownLoc && !cities.find((c) => c.plz === ownLoc.plz)) {
    cities.unshift(ownLoc);
  }

  if (cities.length === 0) {
    return [
      { city: "Oberrieden", plz: "8942" }, { city: "Thalwil", plz: "8800" },
      { city: "Horgen", plz: "8810" }, { city: "Kilchberg", plz: "8802" },
    ];
  }
  return cities;
}

function phone(i) { return "+4176" + String(7000000 + i * 31337).slice(0, 7); }

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n═══ Seed Screenflow: ${t.name} (${slug}) ═══\n`);

  // ── Resolve tenant_id ──
  const { data: tenant, error: tErr } = await sb
    .from("tenants")
    .select("id, modules")
    .eq("slug", slug)
    .single();

  if (tErr || !tenant) {
    console.error(`Tenant ${slug} not found in DB. Run provision_from_config.mjs first.`);
    process.exit(1);
  }
  const TID = tenant.id;
  console.log(`✓ Tenant: ${TID}`);

  // ── Step 1: Delete all existing cases for this tenant ──
  const { error: delErr } = await sb.from("cases").delete().eq("tenant_id", TID);
  if (delErr) {
    console.error("Delete cases failed:", delErr.message);
    process.exit(1);
  }
  console.log(`✓ Deleted existing cases for ${slug}`);

  // ── Step 2: Upsert staff entry for prospect email (fixes "Admin" greeting) ──
  const prospectEmail = prospect.email || `info@${slug.replace(/-/g, "")}.ch`;

  // Also ensure tenant admin user (admin@flowsight.ch) can see the tenant
  // with the correct display_name. We add BOTH as staff:
  //   - prospect email (for OTP login in pipeline)
  //   - admin@flowsight.ch (for admin magic-link login in produce_screenflow.mjs)
  const staffEntries = [
    {
      tenant_id: TID,
      display_name: tenantShortName,
      email: prospectEmail,
      role: "admin",
      is_active: true,
    },
    {
      tenant_id: TID,
      display_name: tenantShortName,
      email: "admin@flowsight.ch",
      role: "admin",
      is_active: true,
    },
  ];

  for (const entry of staffEntries) {
    // Check if exists, else insert
    const { data: existing } = await sb
      .from("staff")
      .select("id")
      .eq("tenant_id", TID)
      .eq("email", entry.email)
      .maybeSingle();

    if (existing) {
      await sb
        .from("staff")
        .update({ display_name: entry.display_name, is_active: true, role: entry.role })
        .eq("id", existing.id);
    } else {
      await sb.from("staff").insert(entry);
    }
  }
  console.log(`✓ Staff upserted: display_name="${tenantShortName}" for ${prospectEmail} + admin@flowsight.ch`);

  // B4 (Quality Gate): Admin-User app_metadata für neuen Tenant updaten.
  // Ohne das sieht admin@flowsight.ch die Leitzentrale mit JWT-Home-Tenant
  // statt mit dem gewünschten Tenant. Automatisiert bei jedem Seed-Run.
  try {
    const { data: listUsers } = await sb.auth.admin.listUsers({ perPage: 200 });
    const adminUser = listUsers.users.find((u) => u.email === "admin@flowsight.ch");
    if (adminUser) {
      await sb.auth.admin.updateUserById(adminUser.id, {
        app_metadata: {
          provider: "email",
          providers: ["email"],
          role: "admin",
          tenant_id: TID,
        },
      });
      console.log(`✓ admin@flowsight.ch app_metadata: role=admin, tenant_id=${TID}`);
    }
  } catch (e) {
    console.log(`⚠️ Admin-metadata-update fehlgeschlagen: ${e.message.slice(0, 100)}`);
  }

  // ── Step 3: Update tenant.modules with google_review_avg + count ──
  const existingModules = tenant.modules || {};
  const updatedModules = {
    ...existingModules,
    google_review_avg: seed.google_rating ?? existingModules.google_review_avg ?? 4.8,
    google_review_count: seed.google_review_count ?? existingModules.google_review_count ?? 10,
    // Phase A: notification_email NOT set (so Founder gets alerts, not prospect)
    // If prospect.email exists and should receive alerts, uncomment:
    // notification_email: prospectEmail,
  };

  // B5 (Scalability Gate): Auch case_id_prefix + name in tenants syncen —
  // config ist SSOT. Ohne das rendern Cases mit default "FS" statt "LN".
  const tenantUpdate = {
    modules: updatedModules,
    case_id_prefix: t.case_id_prefix,
    name: t.name,
  };
  const { error: modErr } = await sb
    .from("tenants")
    .update(tenantUpdate)
    .eq("id", TID);

  if (modErr) {
    console.error("Update tenant failed:", modErr.message);
  } else {
    console.log(`✓ tenant synced: name="${t.name}", case_id_prefix="${t.case_id_prefix}", google=${updatedModules.google_review_avg}★/${updatedModules.google_review_count}`);
  }

  // ── Step 4: Build cases (branchen-agnostisch) ──
  const categories = getCategories();
  const cities = getCities();
  const cases = [];

  const featuredPhoneCase = seed.phone_demo_case || {};
  const wizardCase = seed.wizard_demo_case || {};

  // ── Case 1: NOTFALL (ROT in Leitsystem) — Boiler defekt (FB33+FB61) ──
  // FB61: Notfall-Case bekommt den OWN-BUSINESS-ORT (aus voice_agent.address)
  // statt service_area_plz[0]. Persönlicher Bezug — Stark→Adliswil,
  // Dörfler→Oberrieden, Leins→Horgen, Wälti→Zürich (eigentlicher Sitz).
  const notfallCaseConfig = seed.notfall_case || {};
  const notfallCat = notfallCaseConfig.kategorie ||
    categories.find((c) => /boiler|heizung/i.test(c)) || categories[0];

  // Extract OWN location from voice_agent.address
  function extractOwnLocation(addr) {
    if (!addr) return null;
    // Match "Strasse 123, 8134 Adliswil" or "8134 Adliswil"
    const m = addr.match(/(\d{4})\s+([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ\s\-]+?)(?:,|$)/);
    if (m) return { plz: m[1], city: m[2].trim() };
    return null;
  }
  const ownLocation = extractOwnLocation(va.address) || cities[0];
  console.log(`  Notfall-Case Ort (aus voice_agent.address): ${ownLocation.city} ${ownLocation.plz}`);

  // FB77: Notfall-Case-Stammdaten pipeline-weit fix auf Claudia Brunner +
  // Friesenstrasse 58. Ort bleibt dynamisch aus voice_agent.address damit
  // der Notfall geografisch zum Betrieb passt (Dörfler → Oberrieden etc.).
  // Vorher: Daten identisch mit Phone-Case → visuell verwirrend.
  cases.push({
    tenant_id: TID,
    category: notfallCat,
    status: "in_arbeit",
    urgency: "notfall",
    source: "voice",
    reporter_name: "Claudia Brunner",
    contact_phone: "+41767134096",
    street: "Friesenstrasse",
    house_number: "58",
    city: ownLocation.city,
    plz: ownLocation.plz,
    description: notfallCaseConfig.beschreibung ||
      `${notfallCat} komplett defekt — kein Warmwasser. Kunde wartet auf Techniker.`,
    created_at: hoursAgo(2),
    is_demo: false,
  });

  // ── Phone-Case wird ALS LETZTER inserted (FB40) — höchste seq_number.
  const pcc = featuredPhoneCase;

  // FB48: Dual-Nummer-Logik. display_phone = Lisa-Nummer (fix für alle Betriebe,
  // im Samsung-Video sichtbar). reporter_phone = Anrufer-Nummer aus Call-Script
  // (im Leitsystem Case-Detail Kontakt sichtbar). Diese zwei Nummern haben
  // verschiedene Rollen und dürfen nicht verwechselt werden.
  const reporterPhone = pcc.reporter_phone || "076 489 89 80";
  const anrufDauerSec = 191;

  // FB47/49: Seed schreibt _seed_time in tenant_config damit produce_screenflow
  // die gleiche Base-Zeit nutzt. Ohne das springt die SMS-Zeit (CONFIG.uhrzeit
  // when samsung recorded) gegen Case-Created-Zeit (seed.now + 4min).
  const seedNow = new Date();
  const phoneCaseCreatedAt = new Date(seedNow.getTime() + (anrufDauerSec + 60) * 1000).toISOString();
  const phoneCaseData = {
    tenant_id: TID,
    category: pcc.kategorie || "Rohrbruch",
    status: "new",
    urgency: pcc.urgency || pcc.dringlichkeit?.toLowerCase() || "dringend",
    source: pcc.source || "voice",
    // FB50: Klingelschild-Name (nicht voller Vorname)
    reporter_name: pcc.reporter_name || "Wende",
    contact_phone: reporterPhone, // FB48: Anrufer-Nummer, NICHT Lisa-Nummer
    street: pcc.strasse || "Seestrasse",
    house_number: pcc.hausnummer || "14",
    city: pcc.stadt || "Oberrieden",
    plz: pcc.plz || "8942",
    description: pcc.beschreibung ||
      "Anrufer steht im Keller knöcheltief im Wasser, vermutlich Rohrbruch. Klingelschild: Wende.",
    created_at: phoneCaseCreatedAt,
    is_demo: false,
  };

  // ── Case 2: WIZARD CASE (Take 3 demo — different category) ──
  const wizCat = wizardCase.kategorie ||
    categories.find((c) => c !== phoneCat && c !== notfallCat) ||
    categories[1] || categories[0];
  cases.push({
    tenant_id: TID,
    category: wizCat,
    status: "new",
    urgency: "normal",
    source: "wizard",
    reporter_name: REPORTER_NAMES[2],
    contact_phone: "+41791234567",
    street: STREETS[1],
    house_number: "8",
    city: cities[1]?.city || phoneCity.city,
    plz: cities[1]?.plz || phoneCity.plz,
    description: wizardCase.beschreibung ||
      `${wizCat} über Online-Formular gemeldet.`,
    created_at: minutesAgo(60), // 1h ago
    is_demo: false,
  });

  // ── Cases 4-8: 5× BEI UNS (in_arbeit/scheduled/warten) ──
  const beiUnsStatuses = ["in_arbeit", "in_arbeit", "scheduled", "warten", "in_arbeit"];
  for (let i = 0; i < 5; i++) {
    const cat = categories[(i + 2) % categories.length] || categories[0];
    const loc = cities[i % cities.length];
    cases.push({
      tenant_id: TID,
      category: cat,
      status: beiUnsStatuses[i],
      urgency: i === 0 ? "dringend" : "normal",
      source: pick(["voice", "wizard", "manual"]),
      reporter_name: REPORTER_NAMES[(i + 3) % REPORTER_NAMES.length],
      contact_phone: phone(i + 3),
      street: STREETS[(i + 1) % STREETS.length],
      house_number: String(4 + i * 3),
      city: loc.city,
      plz: loc.plz,
      description: `${cat} in ${loc.city}.`,
      created_at: daysAgo(2 + i),
      is_demo: false,
    });
  }

  // ── 21× DONE-Cases — Verteilung für Filter-Optik (FB41+FB42) ──
  // Smart-Sort sortiert done per updated_at DESC (cases/page.tsx:313).
  //
  // Position (i) → Review-Status → Filter-Verhalten:
  //   i=0-6 (7 Cases, neueste): plain grün (keine Review)
  //     → Filter "Erledigt" Seite 1 dominiert von grün (FB41)
  //     → Filter "Bewertung" übersieht diese (kein sent_at)
  //   i=7 (1 Case): Gold (rating 5) → erstes Gold auf Filter "Erledigt" Seite 1 (FB41-Akzent)
  //   i=8-13 (6 Cases): Gold (rating 5) älter → Filter "Bewertung" dominiert gold
  //   i=14 (1 Case): amber-ring (sent_at, kein rating) → das "1 grün" bei FB42
  //   i=15-19 (5 Cases): Gold (rating 4) älter
  //   i=20 (1 Case): amber-ring alt
  //
  // Summary: 7 plain + 12 gold + 2 amber-ring = 21
  // KPIs: 14 angefragt / 12 erhalten / Google 3
  const reviewTexts = [
    "Schnell und zuverlässig!", "Top Service, danke!", "Sehr kompetent.",
    "Saubere Arbeit.", "Jederzeit wieder.", "Sehr zufrieden.",
    "Empfehlenswert!", "Schnelle Reaktion.",
  ];

  for (let i = 0; i < 21; i++) {
    const cat = categories[i % categories.length] || categories[0];
    const loc = cities[i % cities.length];
    const daysAge = 1 + i * 0.3; // 1.0 to 7.0 days ago (oldest-last)
    const caseCreatedAt = daysAgo(daysAge);

    let reviewSentAt = null, reviewReceivedAt = null, rating = null, reviewText = null;
    if (i < 7) {
      // plain grün — neueste Done-Cases, keine Review
    } else if (i === 7 || (i >= 8 && i <= 13)) {
      // Gold — rating 5
      reviewSentAt = daysAgo(daysAge * 0.7);
      reviewReceivedAt = daysAgo(daysAge * 0.5);
      rating = 5;
      reviewText = pick(reviewTexts);
    } else if (i === 14) {
      // amber-ring — sent_at only (1 grün in FB42)
      reviewSentAt = daysAgo(daysAge * 0.7);
    } else if (i >= 15 && i <= 19) {
      // Gold — rating 4
      reviewSentAt = daysAgo(daysAge * 0.7);
      reviewReceivedAt = daysAgo(daysAge * 0.5);
      rating = 4;
      reviewText = pick(reviewTexts);
    } else {
      // i === 20: amber-ring alt
      reviewSentAt = daysAgo(daysAge * 0.7);
    }

    cases.push({
      tenant_id: TID,
      category: cat,
      status: "done",
      urgency: "normal",
      source: pick(["voice", "wizard", "manual"]),
      reporter_name: REPORTER_NAMES[(i + 5) % REPORTER_NAMES.length],
      contact_phone: phone(i + 5),
      street: STREETS[i % STREETS.length],
      house_number: String(2 + i * 3),
      city: loc.city,
      plz: loc.plz,
      description: `${cat} in ${loc.city} — erledigt.`,
      created_at: caseCreatedAt,
      updated_at: caseCreatedAt, // explizit gleich — Smart-Sort per updated_at DESC
      review_sent_at: reviewSentAt,
      review_rating: rating,
      review_received_at: reviewReceivedAt,
      review_text: reviewText,
      is_demo: false,
    });
  }

  // ── Cases 30-49: 20× Older cases (2025) for pagination ──
  for (let i = 0; i < 20; i++) {
    const cat = categories[i % categories.length] || categories[0];
    const loc = cities[i % cities.length];
    const month = 3 + (i % 10);
    const day = Math.min(28, 5 + i);
    cases.push({
      tenant_id: TID,
      category: cat,
      status: "done",
      urgency: "normal",
      source: pick(["voice", "wizard", "manual"]),
      reporter_name: REPORTER_NAMES[(i + 15) % REPORTER_NAMES.length],
      contact_phone: phone(i + 20),
      city: loc.city,
      plz: loc.plz,
      description: `${cat} in ${loc.city}.`,
      created_at: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T10:00:00Z`,
      is_demo: false,
    });
  }

  // FB40: Phone-Case als ALLERLETZTEN Case einfügen → höchste seq_number
  cases.push(phoneCaseData);

  // FB47/49: Seed-Zeit in tenant_config.json persistieren damit produce_screenflow
  // die GLEICHE Base-Zeit nutzt. Sonst springt SMS-Zeit vs Case-Created-Zeit.
  const { writeFile } = await import("node:fs/promises");
  const configUpdate = { ...config, _seed_time: seedNow.toISOString() };
  await writeFile(configPath, JSON.stringify(configUpdate, null, 2), "utf-8");
  console.log(`✓ _seed_time geschrieben: ${seedNow.toISOString()}`);

  // updated_at = created_at falls nicht gesetzt (DB-Spalte ist NOT NULL)
  for (const c of cases) {
    if (!c.updated_at) c.updated_at = c.created_at;
  }

  // ── Insert all cases in one batch ──
  const { data: inserted, error: insErr } = await sb
    .from("cases")
    .insert(cases)
    .select("id, seq_number, status, urgency, review_rating, reporter_name");

  if (insErr) {
    console.error("Insert cases failed:", insErr.message);
    process.exit(1);
  }

  // ── Stats ──
  const stats = { total: inserted.length, neu: 0, beiUns: 0, erledigt: 0, notfall: 0, reviewReceived: 0 };
  for (const c of inserted) {
    if (c.status === "new") stats.neu++;
    else if (["in_arbeit", "scheduled", "warten"].includes(c.status)) stats.beiUns++;
    else if (c.status === "done") stats.erledigt++;
    if (c.urgency === "notfall") stats.notfall++;
    if (c.review_rating) stats.reviewReceived++;
  }

  // FB51: Case-Events für Phone-Case anlegen — Timeline zeigt Historie.
  // Real-Flow: Anruf eingegangen → SMS versendet → Sichten (next step, nicht als Event).
  const phoneCaseInserted = inserted.find(c => c.reporter_name === (pcc.reporter_name || "Wende"));
  if (phoneCaseInserted) {
    const callTime = new Date(phoneCaseCreatedAt);
    const smsTime = new Date(callTime.getTime() + 60 * 1000); // +1min nach Anruf
    await sb.from("case_events").insert([
      {
        tenant_id: TID,
        case_id: phoneCaseInserted.id,
        event_type: "case_created",
        title: "Anruf eingegangen — Fall erstellt",
        created_at: callTime.toISOString(),
      },
      {
        tenant_id: TID,
        case_id: phoneCaseInserted.id,
        event_type: "notification_sent",
        title: "SMS an Kunde versendet (Korrekturlink)",
        created_at: new Date(callTime.getTime() + 30 * 1000).toISOString(),
      },
      {
        tenant_id: TID,
        case_id: phoneCaseInserted.id,
        event_type: "notification_sent",
        title: "Team informiert", // FB57: Handwerker-Sprache, max 2 Wörter
        created_at: new Date(callTime.getTime() + 45 * 1000).toISOString(),
      },
    ]);
    console.log(`✓ Case-Events für Phone-Case DA-${String(phoneCaseInserted.seq_number).padStart(4, "0")} angelegt (3 Events)`);
  }

  console.log(`\n✓ Inserted ${stats.total} cases`);
  console.log(`  Seq: ${inserted[0]?.seq_number} → ${inserted[inserted.length - 1]?.seq_number}`);
  console.log(`\n  KPIs: NEU=${stats.neu} | BEI_UNS=${stats.beiUns} | ERLEDIGT=${stats.erledigt}`);
  console.log(`  Notfall (rot): ${stats.notfall}`);
  console.log(`  Reviews: ${stats.reviewReceived} erhalten`);

  // Verify 7-day window (matches FlowBar default view)
  const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await sb
    .from("cases")
    .select("status, urgency, review_sent_at, review_rating")
    .eq("tenant_id", TID)
    .gte("created_at", sevenAgo);

  const k = { neu: 0, beiUns: 0, erledigt: 0, notfall: 0, revSent: 0, revRecv: 0 };
  for (const c of recent) {
    if (c.status === "new") k.neu++;
    else if (["in_arbeit", "scheduled", "warten"].includes(c.status)) k.beiUns++;
    else if (c.status === "done") k.erledigt++;
    if (c.urgency === "notfall") k.notfall++;
    if (c.review_sent_at) k.revSent++;
    if (c.review_rating) k.revRecv++;
  }
  console.log(`\n  7-Day KPIs (FlowBar default):`);
  console.log(`    NEU=${k.neu} | BEI_UNS=${k.beiUns} | ERLEDIGT=${k.erledigt}`);
  console.log(`    Notfall=${k.notfall} | Reviews=${k.revRecv} erhalten / ${k.revSent} angefragt`);

  console.log(`\n✅ Screenflow seed complete for ${slug}.`);
  console.log(`   Greeting: "Guten Abend, ${tenantShortName}"`);
  console.log(`   Google Stars: ${updatedModules.google_review_avg}★ (${updatedModules.google_review_count} Bewertungen)`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
