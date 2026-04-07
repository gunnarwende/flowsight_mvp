#!/usr/bin/env node
/**
 * Send Outreach Mail 1 — persönliche Vorstellung an Prospect.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/send_outreach_mail.mjs <slug> <email>
 *
 * Example:
 *   node --env-file=src/web/.env.local scripts/_ops/send_outreach_mail.mjs doerfler-ag info@doerflerag.ch
 *
 * Preview (ohne Versand):
 *   node --env-file=src/web/.env.local scripts/_ops/send_outreach_mail.mjs doerfler-ag --preview
 */

import { sendEmail } from "./_lib/send_email.mjs";

const BASE = "https://flowsight.ch";

/* ------------------------------------------------------------------ */
/*  Prospect-spezifische Inhalte                                      */
/* ------------------------------------------------------------------ */

const prospects = {
  "doerfler-ag": {
    anrede: "Herr Dörfler",
    firma: "Dörfler AG",
    betreff: "Etwas Persönliches für die Dörfler AG",
    kontext: `Vor ein paar Monaten war einer von Ihnen beiden bei uns in der Wohnung, weil eine Dichtung bei einem Wasserhahnanschluss ersetzt werden musste. Wir waren mit der Ausführung sehr zufrieden.`,
    vorstellungUrl: `${BASE}/kunden/doerfler-ag/vorstellung`,
  },
};

/* ------------------------------------------------------------------ */
/*  HTML Builder                                                      */
/* ------------------------------------------------------------------ */

function buildHtml(p) {
  const photoUrl = `${BASE}/vorstellung/gunnar_play.png`;

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="padding:36px 28px 32px 28px;">

  <p style="margin:0 0 20px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">
    Guten Tag ${p.anrede}
  </p>

  <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#333333;">
    Ich hoffe, Ihnen geht es gut und Sie konnten die sonnigen Ostertage geniessen.
  </p>

  <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#333333;">
    Mein Name ist Gunnar Wende, ich wohne in Oberrieden.
  </p>

  <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#333333;">
    ${p.kontext}
  </p>

  <p style="margin:0 0 24px 0;font-size:15px;line-height:1.65;color:#333333;">
    Das ist mir in Erinnerung geblieben. Ich habe mir danach ein paar Gedanken gemacht und f&uuml;r die ${p.firma} etwas Konkretes vorbereitet.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:8px 0 20px 0;">
    <a href="${p.vorstellungUrl}" target="_blank" style="text-decoration:none;">
      <img src="${photoUrl}" alt="Gunnar Wende" width="120" height="120"
        style="width:120px;height:120px;border-radius:60px;object-fit:cover;display:block;border:3px solid #e8e8e8;">
    </a>
  </td></tr>
  </table>

  <p style="margin:0 0 8px 0;font-size:15px;line-height:1.65;color:#333333;text-align:center;">
    Hier k&ouml;nnen Sie es sich in Ruhe anschauen&nbsp;&mdash;<br>dauert etwa f&uuml;nf Minuten:
  </p>

  <p style="margin:0 0 28px 0;text-align:center;">
    <a href="${p.vorstellungUrl}" target="_blank"
      style="font-size:15px;color:#2b6cb0;text-decoration:underline;word-break:break-all;">
      flowsight.ch/kunden/${p.vorstellungUrl.split("/kunden/")[1]}
    </a>
  </p>

  <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#333333;">
    Ich m&ouml;chte Ihnen damit nichts verkaufen. Mich w&uuml;rde einfach ehrlich interessieren, wie das auf Sie wirkt.
  </p>

  <p style="margin:0 0 28px 0;font-size:15px;line-height:1.65;color:#333333;">
    Gerne komme ich auch kurz pers&ouml;nlich vorbei&nbsp;&mdash; wir sind ja nur ein paar Strassen voneinander entfernt.
  </p>

  <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;width:100%;">
  <tr><td style="padding-top:20px;">
    <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Gunnar Wende</p>
    <p style="margin:0;font-size:13px;line-height:1.5;color:#888888;">
      Oberrieden<br>
      <a href="tel:+41445520919" style="color:#888888;text-decoration:none;">+41 44 552 09 19</a><br>
      <a href="mailto:gunnar.wende@flowsight.ch" style="color:#888888;text-decoration:none;">gunnar.wende@flowsight.ch</a>
    </p>
  </td></tr>
  </table>

</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Plain-text fallback                                               */
/* ------------------------------------------------------------------ */

function buildText(p) {
  return `Guten Tag ${p.anrede}

Ich hoffe, Ihnen geht es gut und Sie konnten die sonnigen Ostertage geniessen.

Mein Name ist Gunnar Wende, ich wohne in Oberrieden.

${p.kontext}

Das ist mir in Erinnerung geblieben. Ich habe mir danach ein paar Gedanken gemacht und für die ${p.firma} etwas Konkretes vorbereitet.

Hier können Sie es sich in Ruhe anschauen — dauert etwa fünf Minuten:
${p.vorstellungUrl}

Ich möchte Ihnen damit nichts verkaufen. Mich würde einfach ehrlich interessieren, wie das auf Sie wirkt.

Gerne komme ich auch kurz persönlich vorbei — wir sind ja nur ein paar Strassen voneinander entfernt.

Freundliche Grüsse
Gunnar Wende
Oberrieden
+41 44 552 09 19
gunnar.wende@flowsight.ch`;
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

const [slug, emailOrFlag] = process.argv.slice(2);

if (!slug || !emailOrFlag) {
  console.error("Usage: send_outreach_mail.mjs <slug> <email|--preview>");
  process.exit(1);
}

const prospect = prospects[slug];
if (!prospect) {
  console.error(`Unknown slug: ${slug}. Available: ${Object.keys(prospects).join(", ")}`);
  process.exit(1);
}

const html = buildHtml(prospect);
const text = buildText(prospect);

if (emailOrFlag === "--preview") {
  console.log(html);
  console.log("\n--- Plain text fallback ---\n");
  console.log(text);
  process.exit(0);
}

console.log(`Sending outreach mail to ${emailOrFlag}...`);
console.log(`Subject: ${prospect.betreff}`);
console.log(`Vorstellung: ${prospect.vorstellungUrl}`);

const result = await sendEmail({
  to: emailOrFlag,
  subject: prospect.betreff,
  html,
  text,
  fromName: "Gunnar Wende",
  replyTo: "gunnar.wende@flowsight.ch",
});

if (result.success) {
  console.log(`✅ Sent! Message ID: ${result.messageId}`);
} else {
  console.error(`❌ Failed: ${result.error}`);
  process.exit(1);
}
