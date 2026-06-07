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

  // Dispositions-Policy → das schmale Format, das der Webhook liest (resolveVoiceDispositions).
  const disp = drVoice.dispositions ?? {};
  const voiceDispositions = {
    reklamationPush: disp.d5_reklamation?.notify === "push",
    callbackPush: disp.d3_rueckruf?.notify === "push" || disp.d4_nachfrage?.notify === "push",
    // volle Policy fürs Audit / spätere Nutzung mitschreiben
    full: disp,
  };

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
  console.log(`    voice_dispositions = reklamationPush=${voiceDispositions.reklamationPush}, callbackPush=${voiceDispositions.callbackPush}`);
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
  console.log(`  4. Telefon-Weiterleitung beim Kunden einrichten (Stufe B) → echte Anrufe fliessen.`);
  console.log(`  Danach Session auf "live" setzen.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
