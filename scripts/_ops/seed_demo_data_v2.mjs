#!/usr/bin/env node
// ===========================================================================
// seed_demo_data_v2.mjs — High-End Demo Cases (70+, dynamic per tenant)
//
// Reads the CustomerSite config to get categories, service area, team.
// Generates realistic cases across 2024-2026 with:
// - Correct categories (matching Voice Agent + Wizard)
// - Seasonal distribution (heating = winter, clogs = year-round)
// - Source-appropriate descriptions (voice vs wizard vs manual)
// - Realistic review data (30% of done cases)
// - Staff assignments from tenant's actual team
// - Unique addresses from the tenant's actual service area
// - Chronological seq_numbers
// - Realistic updated_at (done cases = days/weeks after created_at)
//
// Usage:
//   node --env-file=.env.local scripts/_ops/seed_demo_data_v2.mjs \
//     --slug=doerfler-ag [--count=70] [--clean]
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// ===========================================================================

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// ── ENV ────────────────────────────────────────────────────────────────
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// ── ARGS ──────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? "true"]; })
);
const slug = args.slug;
if (!slug) { console.error("--slug=<tenant-slug> is required"); process.exit(1); }
const targetCount = parseInt(args.count ?? "70", 10);
const clean = args.clean === "true";
const asDemo = args.demo === "true"; // default: false = real cases (visible in main tab)

// ── HELPERS ───────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickWeighted(items) {
  const total = items.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { r -= (item.weight || 1); if (r <= 0) return item; }
  return items[items.length - 1];
}
function randomPhone() { return `+41${pick(["79","78","76"])}${String(Math.floor(Math.random()*10000000)).padStart(7,"0")}`; }

// ── PLZ MAP ───────────────────────────────────────────────────────────
const GEMEINDE_PLZ = {
  "Oberrieden":"8942","Thalwil":"8800","Horgen":"8810","Kilchberg":"8802",
  "Rüschlikon":"8803","Adliswil":"8134","Langnau am Albis":"8135",
  "Wädenswil":"8820","Richterswil":"8805","Au ZH":"8804",
  "Hütten":"8825","Schönenberg":"8824","Zürich":"8002",
};

const STREETS = [
  "Seestrasse","Bahnhofstrasse","Dorfstrasse","Hauptstrasse","Kirchweg",
  "Schulhausstrasse","Bergstrasse","Gartenstrasse","Rosenweg","Birkenweg",
  "Sonnhalde","Wiesenstrasse","Industriestrasse","Im Grund","Rebhalde",
  "Zürcherstrasse","Oberdorfstrasse","Mattweg","Langackerstrasse","Eichenweg",
];

const SWISS_FIRST = ["Thomas","Peter","Daniel","Martin","Andreas","Sandra","Monika","Claudia","Ursula","Barbara","Stefan","Markus","Christian","Hans","Beat","Eva","Silvia","Ruth","Maria","Franziska","Lukas","Niklaus","Reto","Marcel","Jürg","Susanne","Heidi","Verena","Brigitte","Doris"];
const SWISS_LAST = ["Müller","Meier","Brunner","Fischer","Weber","Huber","Schmid","Keller","Wagner","Steiner","Baumann","Gerber","Frei","Roth","Maurer","Bühler","Künzler","Zürcher","Wenger","Ammann"];

// ── CASE TEMPLATES PER CATEGORY ───────────────────────────────────────
// Each template generates descriptions in 3 styles: voice, wizard, manual

const CATEGORY_TEMPLATES = {
  "Verstopfung": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12], // year-round
    urgencyDist: { notfall: 0.15, dringend: 0.25, normal: 0.6 },
    voice: [
      "Abfluss in der Küche komplett verstopft. Wasser läuft nicht mehr ab.",
      "WC im Erdgeschoss verstopft, lässt sich nicht mehr spülen.",
      "Badewanne läuft nicht ab, steht voll Wasser.",
      "Lavabo im Bad verstopft, Wasser steht bis zum Rand.",
      "Küchenabfluss riecht stark und läuft sehr langsam ab.",
    ],
    wizard: [
      "Guten Tag, unser Küchenabfluss ist seit gestern komplett verstopft. Wasser staut sich im Becken. Können Sie vorbeikommen?",
      "Hallo, das WC im OG ist verstopft, trotz Pömpel keine Besserung. Bitte um Hilfe.",
      "Der Abfluss in der Dusche ist extrem langsam. Haare und Seifenreste vermutlich. Bitte Termin.",
    ],
    manual: [
      "Kundin angerufen: Abfluss Küche verstopft. Termin vereinbart.",
      "Rückruf von Frau X: WC verstopft seit 2 Tagen.",
    ],
  },
  "Leck": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12],
    urgencyDist: { notfall: 0.2, dringend: 0.4, normal: 0.4 },
    voice: [
      "Wasserhahn in der Küche tropft seit einer Woche. Wird immer schlimmer.",
      "Unter dem Lavabo im Bad ist es feucht. Vermutlich undichte Leitung.",
      "Dusche im OG ist undicht. Fliesen im Bereich der Duschwanne sind nass.",
      "Tropfende Leitung im Keller, kleine Pfütze am Boden.",
      "Siphon unter der Spüle tropft bei jedem Abwasch.",
    ],
    wizard: [
      "Seit ca. 2 Wochen tropft unser Wasserhahn im Bad. Können Sie das reparieren?",
      "Hallo, unter unserem Lavabo ist es feucht. Wir vermuten ein Leck. Bitte Termin.",
      "Undichte Stelle an der Dusche. Wasser läuft an der Wand runter.",
    ],
    manual: ["Kundenmeldung: Leck unter Spülbecken. Besichtigung nötig."],
  },
  "Rohrbruch": {
    seasonal: [1,2,3,11,12], // mostly winter (frost)
    urgencyDist: { notfall: 0.6, dringend: 0.3, normal: 0.1 },
    voice: [
      "Im Keller steht alles unter Wasser. Vermutlich ein Rohrbruch.",
      "Wasserrohr im Keller geplatzt. Wasser spritzt aus der Wand.",
      "Rohrbruch in der Waschküche. Wasser steht knöcheltief.",
      "Leitung gebrochen nach den Frosttemperaturen letzte Nacht.",
    ],
    wizard: [
      "DRINGEND: Rohrbruch im Keller, Wasser steht ca. 10cm hoch. Bitte schnellstmöglich kommen!",
      "Wasserrohr geplatzt, vermutlich Frostschaden. Haupthahn zugedreht. Bitte um schnelle Hilfe.",
    ],
    manual: ["Notfall-Anruf: Rohrbruch Keller, Haupthahn zugedreht, Techniker unterwegs."],
  },
  "Heizung": {
    seasonal: [1,2,3,4,10,11,12], // heating season
    urgencyDist: { notfall: 0.2, dringend: 0.35, normal: 0.45 },
    voice: [
      "Heizung komplett ausgefallen. Heizkörper bleiben kalt.",
      "Heizkörper im Kinderzimmer wird nicht warm. Rest funktioniert.",
      "Thermostat zeigt eine Fehlermeldung an. Heizung geht nicht.",
      "Fussbodenheizung im Bad funktioniert nicht mehr.",
      "Heizung macht Klopfgeräusche, besonders nachts.",
      "Heizkörper im Wohnzimmer hat oben ein Leck. Tropft.",
    ],
    wizard: [
      "Unsere Heizung ist seit gestern Abend ausgefallen. Haus kühlt ab. Bitte dringend.",
      "Hallo, ein Heizkörper im Schlafzimmer wird nicht mehr warm. Könnten Sie vorbeischauen?",
      "Jährliche Heizungswartung fällig. Bitte Termin in den nächsten 2-3 Wochen.",
    ],
    manual: [
      "Kunde möchte Heizungswartung. Termin nächste Woche.",
      "Heizungsersatz-Beratung gewünscht (Öl → Wärmepumpe).",
    ],
  },
  "Boiler": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12],
    urgencyDist: { notfall: 0.1, dringend: 0.3, normal: 0.6 },
    voice: [
      "Warmwasserboiler macht seltsame Geräusche. Kein heisses Wasser mehr ab 18 Uhr.",
      "Boiler tropft. Kleine Pfütze unter dem Gerät.",
      "Kein Warmwasser seit heute Morgen. Boiler zeigt nichts an.",
    ],
    wizard: [
      "Boiler ist 15 Jahre alt und müsste ersetzt werden. Bitte Beratung und Offerte.",
      "Warmwasser kommt nur noch lauwarm. Entkalkung fällig?",
    ],
    manual: ["Entkalkung Boiler fällig, letztes Mal vor 3 Jahren."],
  },
  "Sanitär allgemein": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12],
    urgencyDist: { notfall: 0.05, dringend: 0.15, normal: 0.8 },
    voice: [
      "Allgemeine Frage zu einer Badsanierung. Möchte gerne beraten werden.",
      "Armaturen im Bad sollen erneuert werden. Beratung gewünscht.",
      "Neues WC im Gäste-Bad installieren. Offerte gewünscht.",
    ],
    wizard: [
      "Wir planen eine Badezimmer-Renovation. Können Sie für eine Offerte vorbeikommen?",
      "Möchten eine Regendusche nachrüsten. Ist das bei uns möglich?",
      "Anfrage: Neue Armaturen Küche + Bad. Bitte Termin für Beratung.",
    ],
    manual: [
      "Offerte Badsanierung EG, 2 Bäder.",
      "Regendusche nachrüsten, Beratung vor Ort.",
    ],
  },
  "Allgemein": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12],
    urgencyDist: { notfall: 0, dringend: 0.1, normal: 0.9 },
    voice: ["Allgemeine Rückfrage zum letzten Einsatz.","Frage zu den Öffnungszeiten und Verfügbarkeit."],
    wizard: ["Allgemeine Anfrage. Bitte um Rückruf.","Frage zu Ihrem Leistungsangebot."],
    manual: ["Rückruf-Wunsch Kunde.","Allgemeine Anfrage telefonisch."],
  },
  "Angebot": {
    seasonal: [3,4,5,6,7,8,9], // spring/summer for renovations
    urgencyDist: { notfall: 0, dringend: 0.05, normal: 0.95 },
    voice: ["Offerte für komplette Sanitärsanierung im EG. 2 Bäder, 1 Küche.","Offerte gewünscht für Heizungsersatz."],
    wizard: [
      "Guten Tag, wir planen die Sanierung unseres Badezimmers und hätten gerne eine Offerte.",
      "Anfrage Offerte: Ersatz Warmwasserboiler 300L, inkl. Montage.",
      "Offertanfrage: Komplettsanierung Sanitär Altbau.",
    ],
    manual: ["Offerte Badsanierung nach Beratungsgespräch."],
  },
  "Kontakt": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12],
    urgencyDist: { notfall: 0, dringend: 0.1, normal: 0.9 },
    voice: ["Bitte um Rückruf zwecks Terminvereinbarung.","Möchte einen Beratungstermin vereinbaren."],
    wizard: ["Bitte um Rückruf. Erreichbar Mo-Fr 9-17 Uhr.","Terminwunsch für Beratung vor Ort."],
    manual: ["Rückruf-Wunsch: Terminvereinbarung."],
  },
  // ── Large projects (Renovationen, Sanierungen) — min 2 per tenant on page 1
  "Badsanierung": {
    seasonal: [1,2,3,4,5,6,7,8,9,10,11,12],
    urgencyDist: { notfall: 0, dringend: 0.05, normal: 0.95 },
    voice: [
      "Komplette Badsanierung geplant. Möchten gerne eine Beratung vor Ort und dann eine Offerte.",
      "Wir planen unser Badezimmer zu renovieren. Dusche, WC, Lavabo — alles komplett neu.",
    ],
    wizard: [
      "Guten Tag, wir planen die Komplettsanierung unseres Badezimmers (Baujahr 1985). Dusche, Badewanne, Lavabo und WC sollen erneuert werden. Bitte Termin für Beratung und Offerte.",
      "Badsanierung EG: barrierefreie Dusche, neues WC, Doppellavabo. Budget ca. CHF 25'000-35'000. Bitte Offerte.",
      "Renovation Gäste-Bad OG: Komplett neu inkl. Fliesen, Dusche, WC. Bitte Besichtigung + Offerte.",
    ],
    manual: [
      "Beratungsgespräch Badsanierung: 2 Bäder, Altbau 1978. Offerte folgt nach Besichtigung.",
      "Offerte erstellt: Komplettsanierung Bad EG, CHF 32'500 inkl. MwSt. Kunde überlegt.",
    ],
  },
  "Heizungsersatz": {
    seasonal: [3,4,5,6,7,8,9,10], // planned outside heating season
    urgencyDist: { notfall: 0, dringend: 0.1, normal: 0.9 },
    voice: [
      "Unsere Ölheizung ist 25 Jahre alt. Wir möchten auf Wärmepumpe umsteigen. Beratung gewünscht.",
      "Heizungsersatz geplant: aktuell Gas, möchten wissen was die Optionen sind.",
    ],
    wizard: [
      "Heizungsersatz: Öl auf Wärmepumpe. EFH Baujahr 1992, 180m². Bitte Beratung und Offerte.",
      "Planen den Ersatz unserer Gasheizung (20 Jahre alt). Wärmepumpe oder Pellets? Bitte Termin.",
      "Heizungssanierung MFH (6 Wohnungen): Zentrale Ölheizung ersetzen. Bitte Offerte + Beratung.",
    ],
    manual: [
      "Beratung Heizungsersatz: Öl → WP, EFH 200m². Besichtigung durchgeführt. Offerte in Arbeit.",
      "Offerte Heizungsersatz: Luft-Wasser WP inkl. Demontage Öltank. CHF 38'000.",
    ],
  },
  "Komplettrenovation": {
    seasonal: [2,3,4,5,6,7,8,9,10], // spring to autumn
    urgencyDist: { notfall: 0, dringend: 0.05, normal: 0.95 },
    voice: [
      "Wir planen eine Komplettrenovation Sanitär im ganzen Haus. 3 Bäder und Küche. Bitte Beratung.",
    ],
    wizard: [
      "Komplettrenovation Sanitär: EFH Baujahr 1975, 3 Bäder + Küche. Leitungen müssen komplett erneuert werden. Bitte Besichtigung + Offerte.",
      "Sanierung Altbau: Steigleitungen, 2 Bäder, Küche. Koordination mit Elektriker nötig. Bitte Offerte.",
    ],
    manual: [
      "Grossprojekt: Komplettsanierung Sanitär EFH, 3 Bäder + Küche. Baustart geplant Juni. Offerte CHF 65'000.",
      "Renovation MFH 4 Wohnungen: Bäder + Leitungen. Etappenweise. Offerte in Arbeit.",
    ],
  },
};

// ── DISTRIBUTION LOGIC ──────────────────────────────────────────────

function generateTimeline(count) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const dates = [];

  // 2024 H2: ~11% of cases
  const count2024 = Math.round(count * 0.11);
  for (let i = 0; i < count2024; i++) {
    const month = 6 + Math.floor(Math.random() * 6); // Jul-Dec
    dates.push(new Date(currentYear - 2, month, 1 + Math.floor(Math.random() * 28)));
  }

  // 2025: ~31% of cases, increasing per quarter
  const count2025 = Math.round(count * 0.31);
  for (let i = 0; i < count2025; i++) {
    // Weight towards later quarters
    const r = Math.random();
    const month = r < 0.15 ? Math.floor(Math.random() * 3) // Q1: 15%
      : r < 0.35 ? 3 + Math.floor(Math.random() * 3)       // Q2: 20%
      : r < 0.6 ? 6 + Math.floor(Math.random() * 3)        // Q3: 25%
      : 9 + Math.floor(Math.random() * 3);                  // Q4: 40%
    dates.push(new Date(currentYear - 1, month, 1 + Math.floor(Math.random() * 28)));
  }

  // 2026 Jan-now: ~58% of cases, heavily weighted to recent
  const count2026 = count - count2024 - count2025;
  const currentMonth = now.getMonth();
  for (let i = 0; i < count2026; i++) {
    const r = Math.random();
    let month, day;
    if (r < 0.35) {
      // Last 30 days: 35% of 2026 cases
      const daysAgo = Math.floor(Math.random() * 30);
      const d = new Date(now.getTime() - daysAgo * 86400000);
      month = d.getMonth();
      day = d.getDate();
    } else if (r < 0.55) {
      // Last 7 days: extra 20%
      const daysAgo = Math.floor(Math.random() * 7);
      const d = new Date(now.getTime() - daysAgo * 86400000);
      month = d.getMonth();
      day = d.getDate();
    } else {
      // Earlier 2026
      month = Math.floor(Math.random() * currentMonth);
      day = 1 + Math.floor(Math.random() * 28);
    }
    dates.push(new Date(currentYear, month, day));
  }

  // Sort chronologically
  dates.sort((a, b) => a.getTime() - b.getTime());

  // Add random time (07:00-19:00)
  return dates.map(d => {
    d.setHours(7 + Math.floor(Math.random() * 12));
    d.setMinutes(Math.floor(Math.random() * 60));
    d.setSeconds(Math.floor(Math.random() * 60));
    return d;
  });
}

function pickUrgency(dist) {
  const r = Math.random();
  if (r < dist.notfall) return "notfall";
  if (r < dist.notfall + dist.dringend) return "dringend";
  return "normal";
}

function statusForAge(daysOld, isRecent7d) {
  if (isRecent7d) {
    const r = Math.random();
    if (r < 0.35) return "new";
    if (r < 0.55) return "scheduled";
    if (r < 0.75) return "in_arbeit";
    if (r < 0.85) return "warten";
    return "done";
  }
  if (daysOld < 14) {
    const r = Math.random();
    if (r < 0.15) return "new";
    if (r < 0.30) return "scheduled";
    if (r < 0.45) return "in_arbeit";
    if (r < 0.55) return "warten";
    return "done";
  }
  // Older cases: mostly done
  return Math.random() < 0.92 ? "done" : "in_arbeit";
}

// ── MAIN ──────────────────────────────────────────────────────────────

async function main() {
  // 1. Resolve tenant
  const { data: tenant, error: tErr } = await supabase
    .from("tenants").select("id, name, slug, case_id_prefix, modules").eq("slug", slug).single();
  if (tErr || !tenant) { console.error(`Tenant '${slug}' not found`); process.exit(1); }

  // 2. Get staff for assignments
  const { data: staff } = await supabase
    .from("staff").select("display_name").eq("tenant_id", tenant.id).eq("is_active", true);
  const staffNames = staff?.map(s => s.display_name) ?? [];

  // 3. Try to load CustomerSite config for categories + serviceArea
  let categories = ["Verstopfung","Leck","Heizung","Boiler","Rohrbruch","Sanitär allgemein","Badsanierung","Heizungsersatz","Komplettrenovation","Allgemein","Angebot","Kontakt"];
  let gemeinden = Object.keys(GEMEINDE_PLZ);

  try {
    // Dynamic import of the customer config
    const configPath = path.resolve("src/web/src/lib/customers", `${slug}.ts`);
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      // Extract categories from the config file
      const catMatches = content.match(/value:\s*"([^"]+)"/g);
      if (catMatches) {
        categories = catMatches.map(m => m.match(/"([^"]+)"/)[1]);
      }
      // Always include FIXED_CATEGORIES + common Voice Agent categories + large projects
      const FIXED = ["Allgemein", "Angebot", "Kontakt"];
      const VOICE_EXTRA = ["Boiler", "Rohrbruch", "Sanitär allgemein"];
      const LARGE_PROJECTS = ["Badsanierung", "Heizungsersatz", "Komplettrenovation"];
      for (const c of [...FIXED, ...VOICE_EXTRA, ...LARGE_PROJECTS]) {
        if (!categories.includes(c)) categories.push(c);
      }
      console.log(`  Categories from config: ${categories.join(", ")}`);
      // Extract gemeinden
      const gemMatch = content.match(/gemeinden:\s*\[([\s\S]*?)\]/);
      if (gemMatch) {
        const gems = gemMatch[1].match(/"([^"]+)"/g);
        if (gems) {
          gemeinden = gems.map(g => g.replace(/"/g, ""));
          console.log(`  Gemeinden from config: ${gemeinden.join(", ")}`);
        }
      }
    }
  } catch (e) {
    console.log(`  Could not parse config for ${slug}, using defaults`);
  }

  // Build location pool from gemeinden
  const locations = gemeinden.map(g => ({
    city: g,
    plz: GEMEINDE_PLZ[g] || "8000",
  })).filter(l => l.plz !== "8000" || l.city === "Zürich");

  console.log(`\n  Tenant:     ${tenant.name} (${tenant.slug})`);
  console.log(`  Staff:      ${staffNames.length > 0 ? staffNames.join(", ") : "none"}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Locations:  ${locations.length} gemeinden`);
  console.log(`  Cases:      ${targetCount}`);

  // Clean
  if (clean) {
    const { count: deleted } = await supabase
      .from("cases").delete({ count: "exact" }).eq("tenant_id", tenant.id).eq("is_demo", asDemo);
    // Also clean events for deleted demo cases
    console.log(`  Cleaned ${deleted ?? 0} existing demo cases`);
  }

  // 4. Generate timeline
  const timeline = generateTimeline(targetCount);
  const now = new Date();

  // 5. Create recurring customers (3-5 Stammkunden)
  const stammkundenCount = Math.min(5, Math.max(3, Math.floor(targetCount / 15)));
  const stammkunden = Array.from({ length: stammkundenCount }, () => {
    const first = pick(SWISS_FIRST);
    const last = pick(SWISS_LAST);
    const loc = pick(locations);
    return {
      name: `${first} ${last}`,
      phone: randomPhone(),
      email: `${first.toLowerCase()}.${last.toLowerCase()}@bluewin.ch`,
      plz: loc.plz,
      city: loc.city,
      street: pick(STREETS),
      houseNumber: String(1 + Math.floor(Math.random() * 60)),
    };
  });

  // 6. Generate cases
  const cases = [];
  const events = [];
  let usedAddresses = new Set();

  // 6a. Featured case — the "hero" case used for video screenshots / demos.
  // Always the NEWEST voice case: Rohrbruch, Dringend, status "new".
  // Uses the tenant's primary city (first location) for the address.
  {
    const featLoc = locations[0] || { plz: "8000", city: "Zürich" };
    const featStreet = "Seestrasse";
    const featHN = "14";
    const featContact = {
      name: `${pick(SWISS_FIRST)} ${pick(SWISS_LAST)}`,
      phone: randomPhone(),
      email: null,
      plz: featLoc.plz,
      city: featLoc.city,
      street: featStreet,
      houseNumber: featHN,
    };
    // Created "today" at 15:00 — matches the video storyboard
    const featCreated = new Date(now);
    featCreated.setHours(15, 0, 0, 0);
    const featId = randomUUID();
    const featDesc = `Der Anrufer steht im Keller knöcheltief im Wasser, vermutlich wegen eines Rohrbruchs. Die Adresse ist ${featStreet} ${featHN}, ${featLoc.plz} ${featLoc.city}. Der Schaden wurde als dringend eingestuft, und der Anrufer gab an, wo der Techniker klingeln soll.`;
    cases.push({
      id: featId,
      tenant_id: tenant.id,
      source: "voice",
      created_at: featCreated.toISOString(),
      updated_at: featCreated.toISOString(),
      reporter_name: featContact.name,
      contact_phone: featContact.phone,
      contact_email: null,
      plz: featContact.plz,
      city: featContact.city,
      street: featContact.street,
      house_number: featContact.houseNumber,
      category: "Rohrbruch",
      urgency: "dringend",
      description: featDesc,
      status: "new",
      assignee_text: null,
      scheduled_at: null,
      review_sent_at: null,
      review_rating: null,
      review_received_at: null,
      review_text: null,
      is_demo: asDemo,
    });
    events.push({
      case_id: featId, tenant_id: tenant.id,
      event_type: "case_created", title: "Fall erstellt via Voice Agent",
      created_at: featCreated.toISOString(),
    });
    events.push({
      case_id: featId, tenant_id: tenant.id,
      event_type: "sms_verification_sent", title: "SMS-Bestätigung an Kunden gesendet",
      created_at: new Date(featCreated.getTime() + 30000).toISOString(),
    });
    usedAddresses.add(`${featStreet}${featHN}${featLoc.city}`);
    console.log(`  Featured case: Rohrbruch in ${featLoc.plz} ${featLoc.city} (video hero)`);
  }

  for (let i = 0; i < targetCount; i++) {
    const createdAt = timeline[i];
    const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / 86400000);
    const isRecent7d = daysOld <= 7;
    const isRecent30d = daysOld <= 30;
    const monthNum = createdAt.getMonth() + 1;

    // Pick category (weighted by season)
    const availableCats = categories.filter(cat => {
      const tmpl = CATEGORY_TEMPLATES[cat];
      if (!tmpl) return true;
      return tmpl.seasonal.includes(monthNum);
    });
    const cat = pick(availableCats.length > 0 ? availableCats : categories);
    const tmpl = CATEGORY_TEMPLATES[cat] || CATEGORY_TEMPLATES["Allgemein"];

    // Urgency
    const urgency = pickUrgency(tmpl.urgencyDist);

    // Source (voice-heavy for older, more wizard for recent)
    const sourceR = Math.random();
    const source = sourceR < 0.5 ? "voice" : sourceR < 0.8 ? "wizard" : "manual";

    // Description (style matches source)
    const descPool = tmpl[source] || tmpl.voice || ["Serviceanfrage."];
    const description = pick(descPool);

    // Contact (Stammkunde or new)
    const isStammkunde = Math.random() < 0.2 && stammkunden.length > 0;
    const contact = isStammkunde ? pick(stammkunden) : (() => {
      const first = pick(SWISS_FIRST);
      const last = pick(SWISS_LAST);
      const loc = pick(locations);
      let street, hn, addrKey;
      do {
        street = pick(STREETS);
        hn = String(1 + Math.floor(Math.random() * 80));
        addrKey = `${street}${hn}${loc.city}`;
      } while (usedAddresses.has(addrKey) && usedAddresses.size < 200);
      usedAddresses.add(addrKey);
      return {
        name: `${first} ${last}`,
        phone: randomPhone(),
        email: source === "wizard" ? `${first.toLowerCase()}.${last.toLowerCase()}@${pick(["gmail.com","bluewin.ch","gmx.ch","outlook.com"])}` : null,
        plz: loc.plz,
        city: loc.city,
        street,
        houseNumber: hn,
      };
    })();

    // Status
    const status = statusForAge(daysOld, isRecent7d);

    // Updated_at: realistic gap after created_at
    let updatedAt = createdAt;
    if (status === "done") {
      const resolveDays = urgency === "notfall" ? 0.5 + Math.random() * 2 : 1 + Math.random() * 14;
      updatedAt = new Date(createdAt.getTime() + resolveDays * 86400000);
    } else if (status !== "new") {
      updatedAt = new Date(createdAt.getTime() + (0.5 + Math.random() * 3) * 86400000);
    }

    // Assignee (from staff, if available)
    const assignee = staffNames.length > 0 && status !== "new" ? pick(staffNames) : null;

    // Scheduled (for scheduled/in_arbeit cases)
    let scheduledAt = null;
    if (status === "scheduled" || (status === "in_arbeit" && Math.random() < 0.5)) {
      const scheduleDays = 1 + Math.floor(Math.random() * 7);
      scheduledAt = new Date(now.getTime() + scheduleDays * 86400000);
      scheduledAt.setHours(8 + Math.floor(Math.random() * 8), 0, 0, 0);
    }

    // Review (for done cases)
    let reviewSentAt = null, reviewRating = null, reviewReceivedAt = null, reviewText = null;
    if (status === "done" && daysOld > 3) {
      const shouldSendReview = Math.random() < 0.45; // 45% of done cases get review request
      if (shouldSendReview) {
        reviewSentAt = new Date(updatedAt.getTime() + 1 * 86400000).toISOString();
        const received = Math.random() < 0.6; // 60% of sent reviews get a response
        if (received) {
          reviewRating = pick([5, 5, 5, 5, 5, 4, 4, 4, 5, 5]); // avg ~4.7
          reviewReceivedAt = new Date(updatedAt.getTime() + (2 + Math.random() * 3) * 86400000).toISOString();
          if (reviewRating >= 4) {
            reviewText = pick([
              "Schnell und zuverlässig.",
              "Top Service, sehr freundlich.",
              "Saubere Arbeit, gerne wieder.",
              "Kompetente Beratung und schnelle Umsetzung.",
              "Jederzeit wieder. Sehr empfehlenswert.",
              "Professionell und pünktlich.",
              "Vielen Dank für den schnellen Einsatz!",
              "Sehr zufrieden mit der Arbeit.",
            ]);
          } else {
            reviewText = "Arbeit war okay, Kommunikation könnte besser sein.";
          }
        }
      }
    }

    const caseId = randomUUID();
    cases.push({
      id: caseId,
      tenant_id: tenant.id,
      source,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      reporter_name: contact.name,
      contact_phone: contact.phone,
      contact_email: contact.email,
      plz: contact.plz,
      city: contact.city,
      street: contact.street,
      house_number: contact.houseNumber,
      category: cat,
      urgency,
      description,
      status,
      assignee_text: assignee,
      scheduled_at: scheduledAt?.toISOString() ?? null,
      review_sent_at: reviewSentAt,
      review_rating: reviewRating,
      review_received_at: reviewReceivedAt,
      review_text: reviewText,
      is_demo: asDemo,
    });

    // Events
    const sourceLabel = source === "voice" ? "Anruf" : source === "wizard" ? "Website" : "manuell";
    events.push({
      case_id: caseId, tenant_id: tenant.id,
      event_type: "case_created", title: `Fall erstellt via ${sourceLabel}`,
      created_at: createdAt.toISOString(),
    });

    if (source === "voice") {
      events.push({
        case_id: caseId, tenant_id: tenant.id,
        event_type: "sms_verification_sent", title: "SMS-Verifizierung gesendet",
        created_at: new Date(createdAt.getTime() + 30000).toISOString(),
      });
    }

    if (status !== "new") {
      const statusLabels = { scheduled: "Geplant", in_arbeit: "In Arbeit", warten: "Warten", done: "Erledigt" };
      events.push({
        case_id: caseId, tenant_id: tenant.id,
        event_type: "status_changed",
        title: `Status geändert: Neu → ${statusLabels[status] ?? status}`,
        metadata: { from: "new", to: status },
        created_at: new Date(createdAt.getTime() + 2 * 3600000).toISOString(),
      });
    }

    if (reviewSentAt) {
      events.push({
        case_id: caseId, tenant_id: tenant.id,
        event_type: "review_requested", title: "Bewertungsanfrage gesendet",
        created_at: reviewSentAt,
      });
    }
  }

  // 6b. Page 1 shaping — control what appears on the first page (8 mobile slots)
  // Smart-sort order: notfall > dringend > normal > done (then by created_at desc)
  // Target layout for page 1:
  //   Slot 1: Notfall (in_arbeit) — exactly ONE, red accent, shows "1" badge on "Bei uns"
  //   Slot 2: Dringend case (the featured Rohrbruch is "new" so it sorts before normal active)
  //   Slot 3: Large project 1 (Badsanierung, in_arbeit)
  //   Slot 4: Normal active case
  //   Slot 5: Angebot (in_arbeit or scheduled)
  //   Slot 6: Normal active case
  //   Slot 7: Large project 2 (Heizungsersatz, scheduled)
  //   Slot 8: Normal active case

  // Step 1: Enforce exactly 1 notfall (in_arbeit), demote extras to dringend
  const activeNotfaelle = cases.filter(c => c.urgency === "notfall" && c.status !== "done" && c.status !== "new");
  if (activeNotfaelle.length > 1) {
    // Keep the most recent one, demote the rest
    activeNotfaelle.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    for (let i = 1; i < activeNotfaelle.length; i++) {
      activeNotfaelle[i].urgency = "dringend";
    }
    console.log(`  Notfälle: kept 1, demoted ${activeNotfaelle.length - 1} to dringend`);
  }
  // Ensure exactly 1 active notfall exists — promote if none
  if (activeNotfaelle.length === 0) {
    const promotable = cases.filter(c => c.urgency === "dringend" && c.status === "in_arbeit" && (now.getTime() - new Date(c.created_at).getTime()) < 14 * 86400000);
    if (promotable.length > 0) {
      promotable[0].urgency = "notfall";
      console.log(`  Notfälle: promoted 1 dringend → notfall`);
    }
  }
  // Set the single notfall to in_arbeit (not new, not done)
  const theNotfall = cases.find(c => c.urgency === "notfall" && c.status !== "done");
  if (theNotfall && theNotfall.status === "new") {
    theNotfall.status = "in_arbeit";
    theNotfall.updated_at = new Date(new Date(theNotfall.created_at).getTime() + 2 * 3600000).toISOString();
  }

  // Also demote "new" notfaelle to dringend (they shouldn't exist in seed data — only real calls are notfall+new)
  for (const c of cases) {
    if (c.urgency === "notfall" && c.status === "new" && c !== theNotfall) {
      c.urgency = "dringend";
    }
  }

  // Step 2: Ensure 2 large projects (positions 3 and 7 after smart-sort)
  const LARGE_PROJECT_CATS = ["Badsanierung", "Heizungsersatz", "Komplettrenovation"];
  const page1Projects = [
    { cat: "Badsanierung", desc: "Komplettsanierung Badezimmer: Dusche, WC, Lavabo, Fliesen. Besichtigung durchgeführt, Offerte in Arbeit.", status: "in_arbeit" },
    { cat: "Heizungsersatz", desc: "Heizungsersatz Öl → Wärmepumpe. EFH 200m², Besichtigung abgeschlossen. Offerte und Zeitplan in Abstimmung.", status: "scheduled" },
  ];
  // Find or promote large projects into active recent cases
  const recentActive = cases.filter(c =>
    !LARGE_PROJECT_CATS.includes(c.category) &&
    c.category !== "Rohrbruch" && c.category !== "Angebot" &&
    c.urgency === "normal" &&
    (c.status === "in_arbeit" || c.status === "scheduled" || c.status === "warten") &&
    (now.getTime() - new Date(c.created_at).getTime()) < 14 * 86400000
  );
  for (let i = 0; i < page1Projects.length; i++) {
    const proj = page1Projects[i];
    // Check if we already have one
    const existing = cases.find(c => c.category === proj.cat && (c.status === "in_arbeit" || c.status === "scheduled") && (now.getTime() - new Date(c.created_at).getTime()) < 14 * 86400000);
    if (existing) continue;
    // Promote a normal active case
    const candidate = recentActive[i];
    if (!candidate) continue;
    candidate.category = proj.cat;
    candidate.description = proj.desc;
    candidate.status = proj.status;
    candidate.urgency = "normal";
    candidate.source = "wizard";
    if (proj.status === "scheduled") {
      candidate.scheduled_at = new Date(now.getTime() + (5 + Math.floor(Math.random() * 10)) * 86400000).toISOString();
    }
  }
  console.log(`  Page 1 large projects: ${cases.filter(c => LARGE_PROJECT_CATS.includes(c.category) && (c.status === "in_arbeit" || c.status === "scheduled") && (now.getTime() - new Date(c.created_at).getTime()) < 14 * 86400000).length}`);

  // Step 3: Ensure 1 Angebot case on page 1 (position ~5)
  const activeAngebot = cases.find(c => c.category === "Angebot" && (c.status === "in_arbeit" || c.status === "scheduled") && (now.getTime() - new Date(c.created_at).getTime()) < 14 * 86400000);
  if (!activeAngebot) {
    const angCandidate = cases.find(c =>
      c.category !== "Rohrbruch" && !LARGE_PROJECT_CATS.includes(c.category) && c.category !== "Angebot" &&
      c.urgency === "normal" &&
      (c.status === "in_arbeit" || c.status === "scheduled") &&
      (now.getTime() - new Date(c.created_at).getTime()) < 14 * 86400000
    );
    if (angCandidate) {
      angCandidate.category = "Angebot";
      angCandidate.description = "Offertanfrage: Badsanierung EG komplett, inkl. Dusche, WC, Lavabo. Kunde möchte Beratung vor Ort und detaillierte Offerte.";
      angCandidate.source = "wizard";
      angCandidate.status = "in_arbeit";
      console.log(`  Angebot: promoted 1 case`);
    }
  } else {
    console.log(`  Angebot: already on page 1`);
  }

  // 6c. Guarantee minimum "new" cases by source in last 30 days
  // Requirement: min 5 voice + 3 wizard + 2 manual on status "new"
  const MIN_NEW = { voice: 5, wizard: 3, manual: 2 };
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const recent30d = cases.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
  const newBySource = { voice: 0, wizard: 0, manual: 0 };
  for (const c of recent30d) {
    if (c.status === "new") newBySource[c.source]++;
  }

  // Fix shortfalls by flipping recent non-new cases to "new"
  for (const [src, minCount] of Object.entries(MIN_NEW)) {
    let deficit = minCount - (newBySource[src] || 0);
    if (deficit <= 0) continue;

    // Find recent cases with this source that are NOT "new", flip them
    const candidates = recent30d
      .filter(c => c.source === src && c.status !== "new")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // newest first

    for (const c of candidates) {
      if (deficit <= 0) break;
      c.status = "new";
      c.updated_at = c.created_at; // new cases have updated_at ≈ created_at
      c.assignee_text = null; // new cases have no assignee
      c.scheduled_at = null;
      // Remove status_changed events for this case
      const evIdx = events.findIndex(e => e.case_id === c.id && e.event_type === "status_changed");
      if (evIdx >= 0) events.splice(evIdx, 1);
      deficit--;
    }
  }

  // Log the final distribution
  const finalNewBySource = { voice: 0, wizard: 0, manual: 0 };
  for (const c of cases.filter(c => new Date(c.created_at) >= thirtyDaysAgo && c.status === "new")) {
    finalNewBySource[c.source]++;
  }
  console.log(`  New cases (30d): voice=${finalNewBySource.voice} wizard=${finalNewBySource.wizard} manual=${finalNewBySource.manual}`);

  // 7. Insert
  // Batch insert in chunks of 50
  for (let i = 0; i < cases.length; i += 50) {
    const chunk = cases.slice(i, i + 50);
    const { error } = await supabase.from("cases").insert(chunk);
    if (error) { console.error(`Insert chunk ${i} failed:`, error.message); process.exit(1); }
  }
  console.log(`\n  ${cases.length} cases inserted`);

  for (let i = 0; i < events.length; i += 100) {
    const chunk = events.slice(i, i + 100);
    const { error } = await supabase.from("case_events").insert(chunk);
    if (error) console.error(`  Events chunk ${i} warning:`, error.message);
  }
  console.log(`  ${events.length} events inserted`);

  // 8. Stats
  const statsByYear = {};
  const statsByCat = {};
  const statsByStatus = {};
  for (const c of cases) {
    const y = new Date(c.created_at).getFullYear();
    statsByYear[y] = (statsByYear[y] || 0) + 1;
    statsByCat[c.category] = (statsByCat[c.category] || 0) + 1;
    statsByStatus[c.status] = (statsByStatus[c.status] || 0) + 1;
  }
  const reviewCount = cases.filter(c => c.review_rating != null).length;
  const avgRating = reviewCount > 0
    ? (cases.filter(c => c.review_rating).reduce((s, c) => s + c.review_rating, 0) / reviewCount).toFixed(1)
    : "n/a";

  console.log(`\n  Distribution:`);
  console.log(`    By year:     ${Object.entries(statsByYear).map(([y,n]) => `${y}: ${n}`).join(", ")}`);
  console.log(`    By category: ${Object.entries(statsByCat).sort((a,b) => b[1]-a[1]).map(([c,n]) => `${c}: ${n}`).join(", ")}`);
  console.log(`    By status:   ${Object.entries(statsByStatus).map(([s,n]) => `${s}: ${n}`).join(", ")}`);
  console.log(`    Reviews:     ${reviewCount} received, avg ${avgRating}★`);
  console.log(`    Stammkunden: ${stammkundenCount}`);
  console.log(`\n  Done. Dashboard: /ops/cases`);
}

main().catch(err => { console.error("Error:", err); process.exit(1); });
