#!/usr/bin/env node
/**
 * promote_cockpit_session.mjs — der Go-live-Promote (Onboarding-Cockpit, OC6).
 *
 * Phase-3-Gate, founder-run. NACHDEM der Founder das Cockpit-Ergebnis reviewt
 * hat (die 🆕-Zeilen), schreibt dieser Schritt die bestätigte Config aus dem
 * Cockpit-`draft` in die LIVE-Welt:
 *   1. DB:  tenants.modules (primary_color, notification_email, google_review_url,
 *           sms_sender_name, greeting_text/ki_disclosure, voice_dispositions),
 *           tenants.case_id_prefix, staff (echte Mitarbeiter; Dummys deaktiviert).
 *   2. Datei: schreibt die bestätigten Werte zurück in
 *           docs/customers/<slug>/tenant_config.json (voice_agent/tenant/wizard) —
 *           damit die bewährte Retell-Pipeline (generate_voice_agent + retell_sync)
 *           den LIVE-Agenten aus bestätigten Daten regeneriert.
 *   3. Session: status → "approved".
 *
 * Dieser Schritt PUBLISHED NICHT selbst bei Retell und kauft KEINE Nummer — das
 * bleiben bewusste Folge-Schritte (am Ende ausgegeben). „build-love-then-pay":
 * vorher wurde NICHTS live geschrieben (das Cockpit schrieb nur in `draft`).
 *
 * SICHERHEIT: Default = DRY-RUN (zeigt nur den Plan). Echtes Schreiben NUR mit
 * --confirm.
 *
 * Usage (Repo-Root):
 *   node --env-file=src/web/.env.local scripts/_ops/promote_cockpit_session.mjs --token <token> [--confirm]
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Spec: docs/gtm/onboarding/phase2_datamodel_backend.md §6 + phase2_cockpit_structure.md
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
function arg(name, def = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const token = arg("token");
const confirm = !!arg("confirm", false);
if (!token) {
  console.error("ERROR: --token erforderlich (aus der Submit-Benachrichtigung)");
  process.exit(1);
}

const str = (v) => (typeof v === "string" ? v : "");
/** effektiver Wert: getrimmter Draft-Wert gewinnt, sonst Prefill. */
const pick = (d, p) => (str(d).trim() ? str(d).trim() : str(p));

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen (--env-file=src/web/.env.local?)");
    process.exit(1);
  }
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: session, error: sErr } = await sb
    .from("cockpit_sessions")
    .select("token, tenant_id, slug, company_name, prefill, draft, status")
    .eq("token", token)
    .maybeSingle();
  if (sErr) { console.error(`ERROR: Session-Lookup: ${sErr.message}`); process.exit(1); }
  if (!session) { console.error(`ERROR: keine Session mit token=${token}`); process.exit(1); }
  if (session.status === "building") {
    console.error(`WARN: Session ist noch "building" (nicht abgesendet). Promote erst nach „An Gunnar gesendet" + Review.`);
  }

  const pf = session.prefill ?? {};
  const dr = session.draft ?? {};
  const pfVoice = pf.voice ?? {}, pfWissen = pfVoice.wissen ?? {}, pfBrand = pf.branding ?? {};
  const drVoice = dr.voice ?? {}, drWissen = drVoice.wissen ?? {}, drBrand = dr.branding ?? {};
  const drReview = dr.review ?? {}, drGolive = dr.golive ?? {};

  // ── effektive Werte (Draft über Prefill) ──────────────────────────────────
  const brandColor = pick(drBrand.brandColor, pfBrand.brandColor) || "#2b6cb0";
  const caseIdPrefix = pick(drBrand.caseIdPrefix, pfBrand.caseIdPrefix);
  const smsSenderName = pick(drReview.smsSenderName, pf.review?.smsSenderName);
  const greetingText = str(drVoice.greetingText) || str(pfVoice.greetingSuggestion);
  const notificationEmail = str(drReview.notificationEmail).trim();
  const googleReviewUrl = str(drReview.googleReviewUrl).trim();
  const adminEmail = str(drGolive.adminEmail).trim();
  const smsContent = str(drReview.smsContent).trim();
  const notifyMessagesByEmail = drReview.notifyMessagesByEmail === true;
  const avvVersion = str(drGolive.avvVersion).trim();
  const avvAcceptedAt = str(drGolive.avvAcceptedAt).trim();
  const drWizard = dr.wizard ?? {};
  const pickup = str(drVoice.pickup);
  const distribution = str(drWizard.distribution);
  const calProvider = (dr.calendar?.connect && dr.calendar?.provider && dr.calendar.provider !== "none") ? dr.calendar.provider : "none";
  const notes = dr.notes ?? {};

  // R6 #1: VOLLE per-Disposition-Policy (d1-d6 korb+notify) → der Webhook liest sie direkt
  // (resolveDispositionsConfig) und routet danach (Fall/Nachricht/nichts) + Push (notify).
  // Fehlt eine Disposition im Draft, greifen serverseitig die Sanitär-Defaults.
  const disp = drVoice.dispositions ?? {};
  const voiceDispositions = { ...disp };

  // echte Staff (Cockpit) → staff-Rows (display_name!). Dummys werden deaktiviert.
  const staff = Array.isArray(dr.staff) ? dr.staff.filter((s) => s && str(s.name).trim() && str(s.email).trim()) : [];

  const wissenEff = {
    opening_hours: pick(drWissen.openingHours, pfWissen.openingHours),
    opening_hours_spoken: pick(drWissen.openingHoursSpoken, pfWissen.openingHoursSpoken),
    service_area: pick(drWissen.serviceArea, pfWissen.serviceArea),
    service_area_spoken: pick(drWissen.serviceAreaSpoken, pfWissen.serviceAreaSpoken),
    address: pick(drWissen.address, pfWissen.address),
    address_spoken: pick(drWissen.addressSpoken, pfWissen.addressSpoken),
    services_list: pick(drWissen.servicesList, pfWissen.servicesList),
    memberships: pick(drWissen.memberships, pfWissen.memberships),
    emergency_policy: pick(drWissen.emergencyPolicy, pfWissen.emergencyPolicy),
    price_deflect: pick(drWissen.priceDeflect, pfWissen.priceDeflect),
    jobs_spoken: pick(drWissen.jobsSpoken, pfWissen.jobsSpoken),
    google_rating: pick(drWissen.googleRating, pfWissen.googleRating),
    owner_names: pick(drWissen.ownerNames, pfWissen.ownerNames),
    founded: pick(drWissen.founded, pfWissen.founded),
    team_section: pick(drWissen.teamSection, pfWissen.teamSection),
  };

  // ── Plan ausgeben ──────────────────────────────────────────────────────────
  console.log(`\n${confirm ? "PROMOTE" : "DRY-RUN — Plan für"} ${session.company_name} (slug=${session.slug}, tenant=${session.tenant_id}):\n`);
  console.log("  tenants.modules:");
  console.log(`    primary_color      = ${brandColor}`);
  console.log(`    notification_email = ${notificationEmail || "(LEER!)"}`);
  console.log(`    google_review_url  = ${googleReviewUrl || "(LEER!)"}`);
  console.log(`    sms_sender_name    = ${smsSenderName}`);
  console.log(`    greeting_text      = ${greetingText.slice(0, 70)}…`);
  console.log(`    voice_dispositions = ${Object.entries(voiceDispositions).map(([k, v]) => `${k}:${v?.korb ?? "?"}${v?.notify === "push" ? "+push" : ""}`).join(", ") || "(Defaults)"}`);
  console.log(`  tenants.case_id_prefix = ${caseIdPrefix}`);
  console.log(`  staff (echte, ${staff.length}): ${staff.map((s) => `${s.name} [${s.role}] ${s.email}`).join(" | ") || "(KEINE!)"}`);
  console.log(`  admin-login email  = ${adminEmail || "(LEER!)"}`);
  console.log(`  → tenant_config.json voice_agent/tenant/wizard wird mit bestätigten Werten überschrieben.\n`);

  if (!confirm) {
    console.log("DRY-RUN: nichts geschrieben. Mit --confirm ausführen (nach grünem Review).\n");
    return;
  }

  // ── 1) DB: tenants.modules + case_id_prefix ────────────────────────────────
  const { data: tenant, error: tErr } = await sb.from("tenants").select("id, modules").eq("id", session.tenant_id).maybeSingle();
  if (tErr || !tenant) { console.error(`ERROR: tenant-Lookup: ${tErr?.message ?? "not found"}`); process.exit(1); }
  const modules = { ...(tenant.modules ?? {}) };
  modules.primary_color = brandColor;
  if (notificationEmail) modules.notification_email = notificationEmail;
  if (googleReviewUrl) modules.google_review_url = googleReviewUrl;
  if (smsSenderName) modules.sms_sender_name = smsSenderName;
  modules.greeting_text = greetingText;
  modules.ki_disclosure = str(drVoice.kiDisclosure);
  modules.voice_dispositions = voiceDispositions;
  if (smsContent) modules.sms_content = smsContent;
  modules.notify_messages_email = notifyMessagesByEmail;
  modules.calendar_intent = calProvider; // tatsächliche Verbindung = OAuth nach Go-live (setzt calendar_ms_tenant_id)
  if (str(dr.calendar?.googleAccountEmail).trim()) modules.calendar_google_account = str(dr.calendar.googleAccountEmail).trim(); // K4: Konto, das wir bei Bedarf anbinden
  // Welle 1: Telefonie, Notfall/Notdienst, Feiertage, Agentur, Bewertungen, Nachrichten-Kanäle
  if (drVoice.telco?.provider) modules.telco_provider = drVoice.telco.provider === "other" || drVoice.telco.provider === "yallo" ? (str(drVoice.telco.otherName) || drVoice.telco.provider) : drVoice.telco.provider;
  modules.emergency_service = drVoice.emergencyService === true;
  if (drVoice.emergencyContact?.name || drVoice.emergencyContact?.phone) modules.emergency_contact = { name: str(drVoice.emergencyContact?.name), phone: str(drVoice.emergencyContact?.phone) };
  modules.holidays_closed = drVoice.holidaysClosed !== false; // Default geschlossen
  if (str(drVoice.vacationNote).trim()) modules.vacation_note = str(drVoice.vacationNote).trim();
  if (drWizard.agencyName || drWizard.agencyEmail) modules.web_agency = { name: str(drWizard.agencyName), email: str(drWizard.agencyEmail) };
  if (str(dr.review?.googlePlaceId).trim()) modules.google_place_id = str(dr.review.googlePlaceId).trim();
  modules.review_internal_threshold = typeof dr.review?.internalThreshold === "number" ? dr.review.internalThreshold : 3;
  if (str(dr.messages?.confirmSms).trim()) modules.sms_content = str(dr.messages.confirmSms).trim();
  modules.reminder_channel = dr.messages?.reminderChannel === "sms" ? "sms" : "email";
  modules.review_channel = dr.messages?.reviewChannel === "sms" ? "sms" : "email";
  if (avvVersion) { modules.avv_accepted_version = avvVersion; modules.avv_accepted_at = avvAcceptedAt || new Date().toISOString(); }

  const { error: upErr } = await sb.from("tenants").update({ modules, case_id_prefix: caseIdPrefix }).eq("id", session.tenant_id);
  if (upErr) { console.error(`ERROR: tenants update: ${upErr.message}`); process.exit(1); }
  console.log("✓ tenants.modules + case_id_prefix geschrieben");

  // ── 2) staff: Dummys deaktivieren, echte einfügen ──────────────────────────
  await sb.from("staff").update({ is_active: false }).eq("tenant_id", session.tenant_id);
  for (const s of staff) {
    await sb.from("staff").insert({
      tenant_id: session.tenant_id,
      display_name: str(s.name).trim(),
      role: s.role === "admin" ? "admin" : "techniker",
      email: str(s.email).trim(),
      is_active: true,
    });
  }
  console.log(`✓ staff: ${staff.length} echte Mitarbeiter eingefügt (Dummys deaktiviert)`);

  // ── 3) tenant_config.json zurückschreiben (für Retell-Regeneration) ────────
  const cfgPath = join(process.cwd(), "docs/customers", session.slug, "tenant_config.json");
  if (existsSync(cfgPath)) {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    cfg.tenant = { ...cfg.tenant, brand_color: brandColor, case_id_prefix: caseIdPrefix, sms_sender_name: smsSenderName };
    cfg.voice_agent = { ...cfg.voice_agent, ...wissenEff };
    // T4: Ferien + Notdienst-Flag → steuern das Erreichbarkeits-/Feiertags-Scripting im Prompt
    cfg.voice_agent.vacation_note = str(drVoice.vacationNote).trim();
    cfg.voice_agent.emergency_service = drVoice.emergencyService === true;
    if (Array.isArray(dr.wizard?.categories)) cfg.wizard = { ...cfg.wizard, categories: dr.wizard.categories };
    cfg._cockpit_promoted_at = new Date().toISOString();
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n");
    console.log(`✓ tenant_config.json aktualisiert: ${cfgPath}`);
  } else {
    console.log(`WARN: ${cfgPath} nicht gefunden — Retell-Regeneration manuell prüfen.`);
  }

  // ── 4) Session → approved ──────────────────────────────────────────────────
  await sb.from("cockpit_sessions").update({ status: "approved", approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("token", token);
  console.log("✓ cockpit_sessions.status = approved");

  // ── Rest-Schritte (bewusst manuell — Publish/Nummer/Login) ─────────────────
  console.log(`\n── NÄCHSTE GO-LIVE-SCHRITTE (manuell, Founder) ──`);
  console.log(`  1. LIVE-Agent regenerieren + publishen (bestätigte Daten):`);
  console.log(`       node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix ${session.slug}`);
  console.log(`     (zuvor generate_voice_agent, falls JSON neu gebaut werden muss — siehe Voice-Workflow.)`);
  console.log(`  2. Schweizer Nummer kaufen + auf den Agenten routen (Twilio/Peoplefone).`);
  console.log(`  3. Admin-Login vor-provisionieren: ${adminEmail || "(Admin-Mail fehlt!)"} (OTP/B1).`);
  const pickupSec = { sofort: "sofort", nach_10s: "nach ~10s", nach_15s: "nach ~15s", nach_20s: "nach ~20s", nach_30s: "nach ~30s" }[pickup] || "(nicht gewählt)";
  console.log(`  4. Telefon-Weiterleitung beim Kunden einrichten (Anbieter: ${modules.telco_provider || "(nicht gewählt)"}, Rufumleitung ${pickupSec}) → echte Anrufe fliessen (Stufe B).`);
  if (modules.emergency_service && modules.emergency_contact) console.log(`     ⚠️ Notdienst aktiv → Notfall-Alarm an: ${[modules.emergency_contact.name, modules.emergency_contact.phone].filter(Boolean).join(", ")} (Push+E-Mail, kein Live-Transfer).`);
  console.log(`  5. Wizard verteilen: ${distribution || "(nicht gewählt)"}${drWizard.embedBy ? " (Einbau: " + drWizard.embedBy + ")" : ""}.`);
  if (modules.web_agency) console.log(`     → Einbau-Anleitung an Web-Agentur senden: ${[modules.web_agency.name, modules.web_agency.email].filter(Boolean).join(", ") || "(Kontakt fehlt!)"}.`);
  const calAdmin = [dr.calendar?.adminName, dr.calendar?.adminEmail].filter((x) => str(x).trim()).join(", ");
  const googleAcct = str(dr.calendar?.googleAccountEmail).trim();
  console.log(`  6. Kalender: ${calProvider === "outlook" ? `Betrieb verbindet im Leitsystem (Einstellungen → Kalender, 1× Microsoft-Login${calAdmin ? `; Admin: ${calAdmin}` : ""})` : calProvider === "google" ? `Google — WIR richten die Anbindung ein (K4-Bau bei echtem Bedarf${googleAcct ? `; Konto: ${googleAcct}` : ""})` : "nicht angebunden"}.`);
  console.log(`  Danach Session auf "live" setzen.`);
  const noteLines = Object.entries(notes).filter(([, v]) => str(v).trim());
  if (noteLines.length) {
    console.log(`\n── HINWEISE DES INHABERS (aus dem Cockpit) ──`);
    for (const [k, v] of noteLines) console.log(`  • [${k}] ${str(v).trim()}`);
  }
  console.log("");
}

main().catch((e) => { console.error(e); process.exit(1); });
