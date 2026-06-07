#!/usr/bin/env node
/**
 * create_cockpit_session.mjs — die Brücke Pipeline → Onboarding-Cockpit (OC6).
 *
 * Nach dem „Ja" im Gespräch (Phase 1) legt der Founder hiermit einen Cockpit-
 * Durchlauf an: ein privater Token + ein Snapshot der Vorbefüllung aus
 * tenant_config.json. Ausgabe = der /aufbau/<token>-Link für die Onboarding-Mail.
 *
 * Der Snapshot (prefill) wird bewusst in die DB kopiert — die Cockpit-Seite
 * liest zur Laufzeit NUR die DB, nie das Filesystem (Vercel-robust).
 *
 * Usage (vom Repo-Root):
 *   node --env-file=src/web/.env.local scripts/_ops/create_cockpit_session.mjs \
 *     --slug doerfler-ag [--base-url https://flowsight.ch] [--dry-run]
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Voraussetzung: ein tenants-Row mit diesem slug existiert (Phase-A-Provisioning).
 * Spec: docs/gtm/onboarding/phase2_datamodel_backend.md + phase2_cockpit_manifest.md
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

// ── CLI ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function arg(name, def = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const slug = arg("slug");
const dryRun = !!arg("dry-run", false);
const baseUrl = (arg("base-url", "https://flowsight.ch") || "https://flowsight.ch").replace(/\/$/, "");
if (!slug) {
  console.error("ERROR: --slug erforderlich (z.B. --slug doerfler-ag)");
  process.exit(1);
}

const ROOT = process.cwd();
const CONFIG_PATH = join(ROOT, "docs/customers", slug, "tenant_config.json");
if (!existsSync(CONFIG_PATH)) {
  console.error(`ERROR: tenant_config.json nicht gefunden: ${CONFIG_PATH}`);
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

// ── Helpers ────────────────────────────────────────────────────────────────
const str = (v) => (typeof v === "string" ? v : "");

/** Rechtsform für die gesprochene Anrede strippen ("Dörfler AG" → "Dörfler"). */
function shortName(name) {
  return str(name)
    .replace(/\s+(AG|GmbH|GbR|KG|OHG|AG\/SA|Sàrl|Sagl)\.?$/i, "")
    .trim() || str(name);
}

/** Vorschlag für Begrüssung inkl. revDSG-KI-Mindesthinweis (Betrieb feilt im Cockpit). */
function deriveGreeting(companyName) {
  const sn = shortName(companyName);
  return `Grüezi, Sie sind verbunden mit ${sn}. Mein Name ist Lisa, die digitale Assistentin — ich nehme Ihr Anliegen gerne auf.`;
}

const KI_DISCLOSURE_MIN =
  "Die Begrüssung muss erkennbar machen, dass Lisa eine digitale (KI-)Assistentin ist — der Anrufer darf nicht glauben, mit einem Menschen zu sprechen (revDSG-Transparenz).";

const REVIEW_CHIPS_DEFAULT = [
  "Schnell & zuverlässig",
  "Saubere Arbeit",
  "Kompetente Beratung",
  "Jederzeit wieder",
];

// ── Prefill-Mapping: tenant_config → CockpitPrefill (siehe types.ts) ─────────
// ✅ = vorbefüllt (confirm). 🆕-Felder (echte Staff, notification_email,
// google_review_url, Admin-Mail, Dispositionen) leben NICHT hier — sie starten
// im Cockpit leer und sind der eigentliche Erfassungs-Job.
function buildPrefill(c) {
  const t = c.tenant ?? {};
  const va = c.voice_agent ?? {};
  const w = c.wizard ?? {};
  const seed = c.seed ?? {};
  const prospect = c.prospect ?? {};
  return {
    branding: {
      companyName: str(t.name),
      brandColor: str(t.brand_color) || "#2b6cb0",
      caseIdPrefix: str(t.case_id_prefix),
      smsSenderName: str(t.sms_sender_name),
    },
    voice: {
      companyName: str(va.company_name) || str(t.name),
      domain: str(va.domain),
      greetingSuggestion: deriveGreeting(str(va.company_name) || str(t.name)),
      kiDisclosureMin: KI_DISCLOSURE_MIN,
      languagesDefault: { de: true, intl: true },
      wissen: {
        openingHours: str(va.opening_hours),
        openingHoursSpoken: str(va.opening_hours_spoken),
        serviceArea: str(va.service_area),
        serviceAreaSpoken: str(va.service_area_spoken),
        address: str(va.address),
        addressSpoken: str(va.address_spoken),
        servicesList: str(va.services_list),
        memberships: str(va.memberships),
        emergencyPolicy: str(va.emergency_policy),
        priceDeflect: str(va.price_deflect),
        jobsSpoken: str(va.jobs_spoken),
        phone: str(va.phone),
        email: str(va.email),
        website: str(va.website),
        googleRating: str(va.google_rating),
        ownerNames: str(va.owner_names),
        founded: str(va.founded),
        teamSection: str(va.team_section),
      },
    },
    wizard: {
      categories: Array.isArray(w.categories) ? w.categories : [],
      brandColor: str(t.brand_color) || "#2b6cb0",
    },
    review: {
      smsSenderName: str(t.sms_sender_name),
      chipsDefault: REVIEW_CHIPS_DEFAULT,
    },
    hints: {
      // Generische Crawl-Mail (info@…) — NUR Hinweis, NIE Default für notification/admin.
      crawledEmail: str(prospect.email) || null,
      // seed-Dummys (Max Mustermann …) — NUR Doku, der Betrieb erfasst echte Staff.
      dummyStaffNames: Array.isArray(seed.staff_names) ? seed.staff_names : [],
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const prefill = buildPrefill(cfg);
  const companyName = prefill.branding.companyName || slug;

  if (dryRun) {
    console.log("DRY-RUN — Prefill-Snapshot (würde gespeichert):");
    console.log(JSON.stringify(prefill, null, 2));
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen (--env-file=src/web/.env.local?)");
    process.exit(1);
  }
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Tenant per slug auflösen (muss aus Phase-A-Provisioning existieren).
  const { data: tenant, error: tErr } = await sb
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (tErr) {
    console.error(`ERROR: tenants-Lookup fehlgeschlagen: ${tErr.message}`);
    process.exit(1);
  }
  if (!tenant) {
    console.error(`ERROR: kein tenants-Row mit slug="${slug}". Erst Phase-A provisionieren.`);
    process.exit(1);
  }

  const token = randomBytes(12).toString("hex"); // 24 hex chars
  const { error } = await sb.from("cockpit_sessions").insert({
    token,
    tenant_id: tenant.id,
    slug,
    company_name: companyName,
    prefill,
    draft: {},
    progress: {},
    status: "building",
  });
  if (error) {
    console.error(`ERROR: cockpit_sessions insert fehlgeschlagen: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n✅ Cockpit-Session erstellt für ${companyName}:`);
  console.log(`   ${baseUrl}/aufbau/${token}`);
  console.log(`   Lokal: http://localhost:3000/aufbau/${token}\n`);
  console.log(`   → dieser Link kommt in die Onboarding-Mail (OC7).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
