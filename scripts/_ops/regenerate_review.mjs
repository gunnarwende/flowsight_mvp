#!/usr/bin/env node
/**
 * regenerate_review.mjs — Regenerate founder_review.md from EXISTING tenant_config.json.
 *
 * DOES NOT re-crawl or re-derive. Reads tenant_config.json + crawl_extract.json
 * and generates a complete founder review document for quality checking.
 *
 * Usage:
 *   node scripts/_ops/regenerate_review.mjs --slug stark-haustechnik
 *   node scripts/_ops/regenerate_review.mjs --slug all   (all customers with tenant_config)
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const slug = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

if (!slug) {
  console.error("Usage: node scripts/_ops/regenerate_review.mjs --slug <slug|all>");
  process.exit(1);
}

async function generateReview(customerSlug) {
  const customerDir = join("docs", "customers", customerSlug);
  const configPath = join(customerDir, "tenant_config.json");
  const crawlPath = join(customerDir, "crawl_extract.json");

  if (!existsSync(configPath)) {
    console.error(`  Skipping ${customerSlug}: no tenant_config.json`);
    return;
  }

  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const crawl = existsSync(crawlPath) ? JSON.parse(await readFile(crawlPath, "utf-8")) : {};

  const t = config.tenant || {};
  const va = config.voice_agent || {};
  const wiz = config.wizard || {};
  const seed = config.seed || {};
  const vid = config.video || {};
  const prospect = config.prospect || {};

  const firma = t.name || customerSlug;
  const proofVariante = vid.call_proof_variante || "B";
  const proofLabel = proofVariante === "C" ? "Notdienst (Variante C)" : "Preis (Variante B)";
  const wizardCustom = (wiz.categories || []).filter((c) => !c.fixed);
  const wizardAll = (wiz.categories || []).map((c) => c.value).join(", ");

  let md = "";

  // ── Header ──
  md += `# Founder Review: ${firma}\n\n`;
  md += `**Slug:** ${customerSlug}\n`;
  md += `**Datum:** ${new Date().toISOString().slice(0, 10)}\n`;
  md += `**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision\n`;
  md += `**Config:** \`docs/customers/${customerSlug}/tenant_config.json\`\n\n`;
  md += `---\n\n`;

  // ── Was die Pipeline gemacht hat ──
  md += `## 1. Was die Pipeline automatisch gemacht hat\n\n`;
  md += `| Schritt | Ergebnis |\n|---------|----------|\n`;
  md += `| Website gecrawlt | ${crawl._meta?.pages_crawled?.length || "?"} Seiten |\n`;
  md += `| Zefix verifiziert | ${crawl._zefix?.official_name || "nicht gefunden"} (${crawl._zefix?.uid || "keine UID"}) |\n`;
  md += `| Google Places | ${seed.google_rating || "-"}★ bei ${seed.google_review_count || 0} Bewertungen |\n`;
  md += `| Voice Agent | 23 Platzhalter befüllt → \`voice_agent_de.json\` |\n`;
  md += `| Wizard | ${wizardCustom.length} Custom + 3 Fixed = ${(wiz.categories || []).length} Kategorien |\n`;
  md += `| Seed | ${seed.case_count || 0} Cases, ${(seed.service_area_plz || []).length} PLZs |\n`;
  md += `| Call-Proof | ${proofLabel} |\n`;
  md += `\n`;

  // ── PFLICHT-Items ──
  const pflicht = config._founder_actions_needed || [];
  if (pflicht.length > 0) {
    md += `---\n\n`;
    md += `## ⚠️ PFLICHT — Founder muss bestätigen (${pflicht.length})\n\n`;
    for (const field of pflicht) {
      md += `- **${field}** → in \`tenant_config.json\` befüllen\n`;
    }
    md += `\n`;
  }

  // ── Betriebsdaten (Tabelle) ──
  md += `---\n\n`;
  md += `## 2. Betriebsdaten\n\n`;
  md += `> Stimmt das? Wenn nicht → Korrektur in die Spalte "Korrektur Founder" eintragen. CC übernimmt die Änderungen.\n\n`;
  md += `| Feld | Wert | Korrektur Founder |\n|------|------|------------------|\n`;
  md += `| Firma | ${firma} | |\n`;
  md += `| Zefix UID | ${crawl._zefix?.uid || "nicht gefunden"} | |\n`;
  md += `| Google | ${seed.google_rating || "-"}★ / ${seed.google_review_count || 0} Reviews | |\n`;
  md += `| Adresse | ${va.address || "FEHLT"} | |\n`;
  md += `| Telefon (ECHT, live) | ${va.phone || "FEHLT"} | |\n`;
  md += `| Telefon (Video, FIKTIV) | ${vid.display_phone || vid.telefon_display || "⚠️ FEHLT — wird sonst echte Nummer angezeigt!"} | |\n`;
  md += `| E-Mail | ${va.email || "FEHLT"} | |\n`;
  md += `| Website | ${va.website || "FEHLT"} | |\n`;
  md += `| Gründungsjahr | ${va.founded || "(nicht bekannt)"} | |\n`;
  md += `| Inhaber/GL | ${va.owner_names || "FEHLT"} | |\n`;
  md += `| Team | ${va.team_section || "(nicht bekannt)"} | |\n`;
  md += `| Mitgliedschaften | ${va.memberships || "(keine)"} | |\n`;
  md += `\n`;

  // ── Pipeline-Konfiguration ──
  md += `---\n\n`;
  md += `## 3. Pipeline-Konfiguration\n\n`;
  md += `| Feld | Wert | Korrektur Founder |\n|------|------|------------------|\n`;
  md += `| Domain (Lisa Scope) | ${va.domain || "FEHLT"} | |\n`;
  md += `| Case-ID Prefix | ${t.case_id_prefix || "?"} | |\n`;
  md += `| SMS Sender | ${t.sms_sender_name || "?"} | |\n`;
  md += `| Brand Color | ${t.brand_color || "#64748b"} | |\n`;
  md += `| Wizard Top 3 | ${wizardCustom.map((c) => c.value).join(", ")} | |\n`;
  md += `| Seed Cases | ${seed.case_count || 0} | |\n`;
  md += `| Call-Proof | ${proofLabel} | |\n`;
  md += `| Notfall-Fall (Pos 1, rot) | ${seed.notfall_case?.kategorie || "?"} — ${seed.notfall_case?.beschreibung || "?"} | |\n`;
  md += `| Phone-Fall (Pos 2, aus Call-Script) | ${seed.phone_demo_case?.kategorie || "?"} / ${seed.phone_demo_case?.reporter_name || "?"} / ${seed.phone_demo_case?.stadt || "?"} | |\n`;
  md += `| Wizard-Fall | ${seed.wizard_demo_case?.kategorie || "?"} (${seed.wizard_demo_case?.dringlichkeit || "?"}) in ${seed.wizard_demo_case?.stadt || "?"} | |\n`;
  md += `| Prospect E-Mail | ${prospect.email || "FEHLT"} | |\n`;

  // PLZs
  const plzs = seed.service_area_plz || [];
  if (plzs.length > 0) {
    md += `| Einzugsgebiet | ${plzs.length} PLZs: ${plzs.slice(0, 6).join(", ")}${plzs.length > 6 ? ` (+${plzs.length - 6} weitere)` : ""} | |\n`;
  } else {
    md += `| Einzugsgebiet | FEHLT | |\n`;
  }
  md += `\n`;

  // ── NEU: Telefon-Fall aus Call-Script (FB33) ──
  md += `---\n\n`;
  md += `## 3b. Telefon-Fall aus Call-Script (Take 2)\n\n`;
  md += `> Der Audio-Call (\`mini_takes/Take2/call/Notruf/notruf.txt\`) ist Master-Aufnahme für alle Sanitär-Betriebe. Die Felder unten müssen exakt zum Gesagten passen — sonst fühlt sich der Fall im Leitsystem falsch an.\n\n`;
  const pdc = seed.phone_demo_case || {};
  md += `| Feld | Wert | Source im Call | Korrektur |\n|------|------|----------------|----------|\n`;
  md += `| Kategorie | ${pdc.kategorie || "?"} | User: "Sieht für mich eher nach einem Rohrbruch aus" | |\n`;
  md += `| Priorität (urgency) | ${pdc.urgency || "?"} | Lisa: "Das klingt dringend" | |\n`;
  md += `| Reporter-Name | ${pdc.reporter_name || "?"} | User: "Bei Wende" (Klingelschild) | |\n`;
  md += `| Source | ${pdc.source || "?"} | (voice-channel) | |\n`;
  md += `| Strasse + Nr | ${pdc.strasse || "?"} ${pdc.hausnummer || "?"} | User: "Seestrasse vierzehn" | |\n`;
  md += `| PLZ / Ort | ${pdc.plz || "?"} ${pdc.stadt || "?"} | User: "Acht neun vier zwei Oberrieden" | |\n`;
  md += `| Beschreibung | ${pdc.beschreibung || "?"} | (Zusammenfassung Zeilen 4-6, 20) | |\n`;
  md += `| Telefon (fiktiv) | ${vid.display_phone || vid.telefon_display || "⚠️ FEHLT"} | nicht echt, nur Video | |\n`;
  md += `\n`;
  md += `**Case-ID:** \`${t.case_id_prefix || "XX"}-xxxx\` (dynamisch von DB, seq_number vergeben).\n`;
  md += `**Uhrzeit/Datum:** Fall wird im Leitsystem mit \`now - 1min\` erstellt → Video-frisch "Heute HH:MM".\n\n`;

  // ── Voice Agent: Was Lisa konkret sagt ──
  md += `---\n\n`;
  md += `## 4. Was Lisa am Telefon sagen wird\n\n`;
  md += `> Das sind die KONKRETEN Antworten die Lisa gibt. Stimmt etwas nicht → in \`tenant_config.json\` unter \`voice_agent.*\` korrigieren.\n\n`;

  const lisaResponses = [
    ["Greeting", `Hallo, hier ist Lisa — die digitale Assistentin der ${firma}. Wie kann ich Ihnen helfen?`],
    ["Öffnungszeiten", va.opening_hours_spoken || "⚠️ FEHLT — Lisa kann Öffnungszeiten nicht beantworten"],
    ["Einzugsgebiet", va.service_area_spoken || "⚠️ FEHLT"],
    ["Adresse/Anfahrt", va.address_spoken || "⚠️ FEHLT"],
    ["Preise", va.price_deflect || "⚠️ FEHLT"],
    ["Chef sprechen", va.owner_names ? `Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?` : "⚠️ Kein Inhaber bekannt — Lisa kann nicht auf GL verweisen"],
    ["Termine", va.email ? `Für Termine senden Sie am besten eine kurze Nachricht an ${va.email} — das Team kann das dann direkt einplanen.` : "⚠️ Keine E-Mail — Lisa kann nicht auf Terminanfrage verweisen"],
    ["Stellen/Bewerbung", va.jobs_spoken || "⚠️ FEHLT"],
    ["Notdienst", va.emergency_policy || "(kein Notdienst)"],
  ];

  for (const [topic, answer] of lisaResponses) {
    const warning = answer.startsWith("⚠️") ? " ❗" : "";
    md += `**${topic}:**${warning}\n> "${answer}"\n\n`;
  }

  md += `**Leistungen (Lisa kennt):**\n`;
  if (va.services_list) {
    for (const line of va.services_list.split("\n")) {
      md += `> ${line}\n`;
    }
  } else {
    md += `> ⚠️ FEHLT — Lisa kennt keine Leistungen\n`;
  }
  md += `\n`;

  md += `**Scope:** Lisa nimmt Anliegen im Bereich **${va.domain || "?"}** auf. Alles andere → out_of_scope.\n\n`;
  md += `**Intake-Kategorien:** ${va.categories || wizardAll}\n\n`;

  // ── SMS / E-Mail / Wizard Preview ──
  md += `---\n\n`;
  md += `## 5. SMS & Wizard Preview\n\n`;

  md += `**SMS nach Anruf (Kunde bekommt):**\n`;
  md += `> Absender: "${t.sms_sender_name || "?"}"\n`;
  md += `> Text: "Ihre Meldung wurde aufgenommen. Hier können Sie die Daten prüfen und Fotos ergänzen: flowsight.ch/v/${t.case_id_prefix || "XX"}0088..."\n\n`;

  md += `**SMS Erinnerung (24h vor Termin):**\n`;
  md += `> Absender: "${t.sms_sender_name || "?"}"\n`;
  md += `> Text: "Erinnerung: Morgen [Uhrzeit] kommt ${firma} zu Ihnen. Bei Änderungen: [Link]"\n\n`;

  md += `**Wizard (Online-Formular):**\n`;
  md += `> Brand Color: ${t.brand_color || "#64748b"}\n`;
  md += `> Reihe 1 (Custom): ${wizardCustom.map((c) => `${c.value} (${c.hint})`).join(" | ")}\n`;
  md += `> Reihe 2 (Fix): Allgemein | Angebot | Kontakt\n\n`;

  md += `**Review-Seite (Kunde bewertet):**\n`;
  md += `> Firmenname: ${firma}\n`;
  md += `> Brand Color: ${t.brand_color || "#64748b"}\n`;
  md += `> Auftragsreferenz: z.B. "${t.case_id_prefix || "XX"}-0088 · Rohrbruch in ${seed.phone_demo_case?.stadt || "Zürich"}"\n\n`;

  // ── Video-Konfiguration ──
  md += `---\n\n`;
  md += `## 6. Video-Konfiguration\n\n`;
  md += `| Feld | Wert |\n|------|------|\n`;
  md += `| Firma (Display) | ${vid.firma_display || firma} |\n`;
  md += `| Firma (Silben) | ${vid.firma_silben || "?"} |\n`;
  md += `| Telefon (FIKTIV, für Video) | ${vid.display_phone || vid.telefon_display || "⚠️ FEHLT"} |\n`;
  md += `| Telefon (ECHT, NICHT im Video zeigen) | ${va.phone || "?"} |\n`;
  md += `| Prefix (Case-ID) | ${vid.prefix || t.case_id_prefix || "?"} |\n`;
  md += `| Google Sterne | ${vid.google_stars || "-"} |\n`;
  md += `| Call-Proof Variante | ${proofLabel} |\n`;
  md += `| Video Hook | ${vid.video_hook || "(keiner)"} |\n`;
  md += `\n`;

  // ── Staff (für Dropdown im Video) ──
  md += `---\n\n`;
  md += `## 7. Staff (Dropdown im Video)\n\n`;
  md += `| Name | Rolle |\n|------|------|\n`;
  for (const name of seed.staff_names || []) {
    md += `| ${name} | (Dummy-Name) |\n`;
  }
  md += `\n> Hinweis: Im Video werden IMMER Dummy-Namen gezeigt (Max Mustermann etc.). Keine echten Mitarbeiternamen.\n\n`;

  // ── Nächster Schritt ──
  md += `---\n\n`;
  md += `## Nächster Schritt\n\n`;
  if (pflicht.length > 0) {
    md += `⚠️ Zuerst die ${pflicht.length} PFLICHT-Items oben befüllen, dann:\n\n`;
  }
  md += `\`\`\`bash\nnode --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug ${customerSlug} --from provision\n\`\`\`\n\n`;
  md += `Das provisioniert: Supabase Tenant + Voice Agent + ${seed.case_count || 50} Demo-Cases + Prospect-Zugang.\n`;

  // ── Save ──
  const reviewPath = join(customerDir, "founder_review.md");
  await writeFile(reviewPath, md, "utf-8");
  console.log(`  ✅ ${customerSlug}: ${reviewPath} (${md.split("\n").length} Zeilen)`);
}

// ── Main ──
async function main() {
  if (slug === "all") {
    const { readdirSync } = await import("node:fs");
    const customersDir = join("docs", "customers");
    const dirs = readdirSync(customersDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    for (const d of dirs) {
      if (existsSync(join(customersDir, d, "tenant_config.json"))) {
        await generateReview(d);
      }
    }
  } else {
    await generateReview(slug);
  }
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
