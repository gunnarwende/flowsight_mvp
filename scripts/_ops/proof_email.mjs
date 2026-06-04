#!/usr/bin/env node
/**
 * proof_email.mjs — rendert die Tag-0-Outreach-Mail für eine Beweis-Seite und
 * (optional) schickt eine Vorschau via Resend.
 *
 * Modell (outreach_templates.md, Ein-Link): Betreff + persönlicher Brief mit
 * EINEM Link (die /p/<token>-Seite), Variante-A-CTA (Telefon-Window +
 * Founder-Follow-up), ehrlicher Schluss ("echter Mensch schlägt glatte
 * Maschine"). Dynamische Wochentage aus dem Versanddatum.
 *
 * WICHTIG: Der ECHTE Versand an einen Prospect läuft aus dem eigenen Postfach
 * des Founders (Regel: "Founder sendet IMMER aus eigener E-Mail"). Dieses
 * Script (a) druckt die paste-fertige Copy und (b) sendet mit --send eine
 * Vorschau an einen Test-Empfänger (default: Founder) — zum Erleben auf
 * Handy + Laptop, NICHT für den echten Kaltversand.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/proof_email.mjs --token <token> [--send] [--to addr] [--phone "+41 .."]
 *   node --env-file=src/web/.env.local scripts/_ops/proof_email.mjs --slug walter-leuthold --send
 */

import { createRequire } from "node:module";
import { sendEmail } from "./_lib/send_email.mjs";

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
const slug = arg("slug");
const doSend = !!arg("send", false);
const to = arg("to") || "gunnar.wende@flowsight.ch";
const phone = arg("phone") || ""; // Founder-Mobil (echter Versand); leer = Zeile weglassen
const baseUrl = (arg("base-url", "https://flowsight.ch") || "https://flowsight.ch").replace(/\/$/, "");

if (!token && !slug) {
  console.error("ERROR: --token <token> ODER --slug <slug> erforderlich");
  process.exit(1);
}

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/** Nächster Werktag strikt nach `from` (überspringt Sa/So). */
function nextWeekday(from) {
  const d = new Date(from);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return d;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function main() {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let query = sb
    .from("proof_pages")
    .select("token, company_name, contact_salutation, variant, status, expires_at");
  query = token ? query.eq("token", token) : query.eq("tenant_slug", slug).order("created_at", { ascending: false }).limit(1);
  const { data, error } = token ? await query.single() : await query.maybeSingle();
  if (error || !data) {
    console.error(`ERROR: proof_pages nicht gefunden (${error?.message || "kein Treffer"})`);
    process.exit(1);
  }

  const company = data.company_name;
  const salutation = data.contact_salutation || "Guten Tag";
  const proofUrl = `${baseUrl}/p/${data.token}`;

  // Dynamische CTA-Tage
  const now = new Date();
  const followUp = nextWeekday(now);
  const nextTouch = nextWeekday(followUp);
  const followUpDay = WEEKDAYS[followUp.getDay()];
  const nextTouchDay = WEEKDAYS[nextTouch.getDay()];

  const subject = `${salutation} — ich habe etwas für ${company} ausprobiert`;

  const phoneLineText = phone ? `\n${phone}` : "";
  const text =
    `Guten Tag ${salutation},\n\n` +
    `ich bin Gunnar Wende aus Oberrieden. Ich baue ein Leitsystem für Sanitärbetriebe in der Region — damit kein Anruf und keine Anfrage mehr verloren geht.\n\n` +
    `Ich habe ${company} einmal komplett durchgespielt — vom Anruf bis zur Bewertung — und auf eine kurze, private Seite gelegt:\n\n` +
    `Ihr persönlicher Einblick: ${proofUrl}\n\n` +
    `Das ist kein Werbe-Mockup, sondern Ihr echtes System, live.\n\n` +
    `Ich bin am ${followUpDay} zwischen 10 und 12 Uhr für 15 Minuten am Telefon — wenn Sie eine Frage haben, melden Sie sich kurz. Sonst schreibe ich Ihnen am ${nextTouchDay} nochmal.\n\n` +
    `Und wenn Sie finden, das ist nichts für Sie — sagen Sie mir das bitte ehrlich. Das hilft mir genauso.\n\n` +
    `Herzliche Grüsse\nGunnar Wende${phoneLineText}`;

  const phoneLineHtml = phone ? `<br>${esc(phone)}` : "";
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5f7;">
  <div style="max-width:560px;margin:0 auto;padding:28px 22px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1f2933;">
    <p style="margin:0 0 16px;">Guten Tag ${esc(salutation)},</p>
    <p style="margin:0 0 16px;">ich bin Gunnar Wende aus Oberrieden. Ich baue ein Leitsystem für Sanitärbetriebe in der Region — damit kein Anruf und keine Anfrage mehr verloren geht.</p>
    <p style="margin:0 0 16px;">Ich habe <strong>${esc(company)}</strong> einmal komplett durchgespielt — vom Anruf bis zur Bewertung — und auf eine kurze, private Seite gelegt:</p>
    <p style="margin:0 0 22px;">
      <a href="${proofUrl}" style="display:inline-block;background:#0b1f33;color:#ffd66b;text-decoration:none;font-weight:600;padding:13px 20px;border-radius:10px;">👉&nbsp; Ihr persönlicher Einblick</a>
    </p>
    <p style="margin:0 0 16px;color:#52606d;font-size:14px;">Falls der Knopf nicht geht: <a href="${proofUrl}" style="color:#0b1f33;">${esc(proofUrl)}</a></p>
    <p style="margin:0 0 16px;">Das ist kein Werbe-Mockup, sondern Ihr echtes System, live.</p>
    <p style="margin:0 0 16px;">Ich bin am <strong>${esc(followUpDay)} zwischen 10 und 12 Uhr</strong> für 15 Minuten am Telefon — wenn Sie eine Frage haben, melden Sie sich kurz. Sonst schreibe ich Ihnen am ${esc(nextTouchDay)} nochmal.</p>
    <p style="margin:0 0 22px;">Und wenn Sie finden, das ist nichts für Sie — sagen Sie mir das bitte ehrlich. Das hilft mir genauso.</p>
    <p style="margin:0;">Herzliche Grüsse<br>Gunnar Wende${phoneLineHtml}</p>
  </div></body></html>`;

  // ── Paste-fertige Ausgabe ──
  console.log(`\n${"═".repeat(64)}`);
  console.log(`BETREFF:  ${subject}`);
  console.log(`AN:       ${to}`);
  console.log(`LINK:     ${proofUrl}  (Variante: ${data.variant})`);
  console.log(`${"─".repeat(64)}`);
  console.log(text);
  console.log(`${"═".repeat(64)}\n`);

  if (data.status !== "active") {
    console.log(`⚠️  Hinweis: proof_pages.status = "${data.status}" (Seite evtl. nicht erreichbar).`);
  }

  if (!doSend) {
    console.log(`🟡 Vorschau gedruckt (kein Versand). Mit --send an ${to} schicken.`);
    return;
  }

  const res = await sendEmail({
    to,
    subject,
    html,
    text,
    fromName: "Gunnar Wende",
    replyTo: "gunnar.wende@flowsight.ch",
  });
  if (res.success) {
    console.log(`✅ Test-Mail gesendet an ${to} (id ${res.messageId}).`);
    console.log(`   Absender: Gunnar Wende <${process.env.MAIL_FROM || "noreply@send.flowsight.ch"}>`);
  } else {
    console.error(`❌ Versand fehlgeschlagen: ${res.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
