#!/usr/bin/env node
/**
 * send_outreach.mjs — versendet die High-End-Outreach-Mail pro Betrieb (Phase 3).
 *
 * Aus „Gunnar Wende <gunnar.wende@flowsight.ch>" (Reply-To Founder), Foto inline (cid),
 * /p/-Link automatisch aus proof_pages. NULL Copy-Paste, perfektes Format.
 *
 * 🔒 SICHERHEIT: Default-Empfänger = FOUNDER (Test). Nur mit --live geht es an den
 *    echten Betriebs-Kontakt (tenant_config.prospect.email) — bewusst nur auf Wort.
 *
 * Inhalt: docs/customers/<slug>/outreach/email.json
 *   { subject, paragraphs[], linkLabel, closing[], signature[] }   (**bold** erlaubt)
 * Foto:   docs/customers/<slug>/outreach/gunnar_face_circle.png    (optional, inline)
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/send_outreach.mjs --slug doerfler-ag      # → an Founder (Test)
 *   node --env-file=src/web/.env.local scripts/_ops/send_outreach.mjs --slug X --live          # → echter Kontakt (nur auf Wort!)
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const slug = arg("slug");
const live = args.includes("--live");
const toOverride = arg("to");
const preview = arg("preview"); // schreibt HTML (Foto als data-URI) statt zu senden — Selbstcheck
const FOUNDER = "gunnar.wende@flowsight.ch";
const FROM = "Gunnar Wende <gunnar.wende@flowsight.ch>";
if (!slug) { console.error("ERROR: --slug required"); process.exit(1); }

const emailPath = join("docs/customers", slug, "outreach", "email.json");
const photoPath = join("docs/customers", slug, "outreach", "gunnar_face_circle.png");
const cfgPath = join("docs/customers", slug, "tenant_config.json");
if (!existsSync(emailPath)) { console.error(`ERROR: fehlt ${emailPath}`); process.exit(2); }
const mail = JSON.parse(readFileSync(emailPath, "utf8"));
const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: pp } = await sb.from("proof_pages")
  .select("token").eq("tenant_slug", slug).eq("status", "active")
  .order("created_at", { ascending: false }).limit(1).maybeSingle();
if (!pp) { console.error(`ERROR: keine aktive proof_page für ${slug}`); process.exit(2); }
const link = `https://flowsight.ch/p/${pp.token}`;

const betriebEmail = cfg?.prospect?.email || cfg?.outreach?.prospect_email || null;
const to = toOverride || (live ? betriebEmail : FOUNDER);
if (!to) { console.error("ERROR: kein Empfänger (kein --to, kein prospect.email)"); process.exit(2); }
if (live && !toOverride) console.log(`⚠️  LIVE — Empfänger = ECHTER Betrieb: ${to}`);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0b1f33;">$1</strong>');
const par = (t) => `<p style="margin:0 0 15px;color:#1f2933;">${md(t)}</p>`;

const photoB64 = existsSync(photoPath) ? readFileSync(photoPath).toString("base64") : null;
const photoSrc = preview ? `data:image/png;base64,${photoB64}` : "cid:facepic";
const photoBlock = photoB64
  ? `<p style="margin:0 0 22px;text-align:center;"><a href="${link}" style="text-decoration:none;"><img src="${photoSrc}" width="148" alt="Gunnar Wende" style="width:148px;border-radius:50%;display:inline-block;border:3px solid #f0e2c4;" /></a></p>`
  : "";
const button = `<p style="margin:0 0 24px;text-align:center;"><a href="${link}" style="display:inline-block;background:#0b1f33;color:#f6c945;text-decoration:none;font-weight:700;font-size:16px;padding:15px 32px;border-radius:11px;">${esc(mail.linkLabel || "Ihr persönlicher Einblick")}&nbsp; →</a></p>`;

// Light-Standard (FB36): Sanitär-Betriebe nutzen ganz überwiegend Hell-Modus
// (Default-Setup, kein getweakter Dark Mode). Wir optimieren auf eine helle, edle
// weiße Karte mit knalligem Navy-Button — so kommt sie beim Empfänger an.
const html = `<!doctype html><html lang="de"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#eceef1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eceef1" style="background:#eceef1;"><tr><td align="center" style="padding:26px 12px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;">
<tr><td style="padding:34px 28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.62;color:#1f2933;">
${(mail.paragraphs || []).map(par).join("\n")}
${photoBlock}
${button}
${(mail.closing || []).map(par).join("\n")}
<p style="margin:0;color:#475467;">${(mail.signature || []).map(esc).join("<br>")}</p>
</td></tr></table>
</td></tr></table>
</body></html>`;

if (preview) {
  writeFileSync(preview, html);
  console.log(`📄 Preview geschrieben: ${preview}\n   Betreff: ${mail.subject}\n   Link: ${link}`);
  process.exit(0);
}

const text = [
  ...(mail.paragraphs || []),
  `\n${mail.linkLabel || "Ihr persönlicher Einblick"}: ${link}\n`,
  ...(mail.closing || []), "", ...(mail.signature || []),
].join("\n\n").replace(/\*\*/g, "");

const attachments = photoB64 ? [{ filename: "gunnar.png", content: photoB64, content_id: "facepic" }] : [];
const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from: FROM, to, reply_to: FOUNDER, subject: mail.subject, html, text, attachments }),
});
console.log(res.ok
  ? `✅ gesendet an ${to}  ${live && !toOverride ? "🔴 LIVE" : "🧪 Test"}\n   Betreff: ${mail.subject}\n   Foto: ${photoB64 ? "inline ✓" : "—"}  Link: ${link}\n   ${await res.text()}`
  : `❌ ${res.status}: ${await res.text()}`);
