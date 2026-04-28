#!/usr/bin/env node
/**
 * derive_config.mjs — Derive full tenant config from crawl_extract.json.
 *
 * Reads crawl data + optional prospect_card.json, and produces:
 *   1. tenant_config.json — complete config for provisioning
 *   2. founder_review.md — items that need Founder confirmation
 *
 * Usage:
 *   node scripts/_ops/derive_config.mjs --slug waelti-sohn-ag
 *   node scripts/_ops/derive_config.mjs --slug waelti-sohn-ag --validate
 *
 * Flags:
 *   --slug       Customer slug (required)
 *   --validate   Check existing tenant_config.json for completeness (no generation)
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}
function hasFlag(flag) {
  return args.includes(flag);
}

const slug = getArg("--slug");
const validateOnly = hasFlag("--validate");

if (!slug) {
  console.error(`
Usage: node scripts/_ops/derive_config.mjs --slug <slug> [--validate]

Required:
  --slug       Customer slug (kebab-case)

Optional:
  --validate   Check existing tenant_config.json for completeness
`);
  process.exit(1);
}

const customerDir = join("docs", "customers", slug);

// ── PLZ_CITY_MAP (extracted from src/web/src/lib/plz/plzCityMap.ts) ──────
const PLZ_CITY_MAP = {
  "8800": "Thalwil",
  "8942": "Oberrieden",
  "8810": "Horgen",
  "8802": "Kilchberg",
  "8803": "Rüschlikon",
  "8134": "Adliswil",
  "8135": "Langnau am Albis",
  "8820": "Wädenswil",
  "8805": "Richterswil",
  "8804": "Au ZH",
  "8038": "Zürich",
  "8001": "Zürich",
  "8002": "Zürich",
  "8003": "Zürich",
  "8004": "Zürich",
  "8005": "Zürich",
  "8006": "Zürich",
  "8008": "Zürich",
  "8032": "Zürich",
  "8037": "Zürich",
  "8041": "Zürich",
  "8045": "Zürich",
  "8048": "Zürich",
  "8055": "Zürich",
};

// ── FIXED_CATEGORIES (from src/web/src/lib/customers/categories.ts) ──────
const FIXED_CATEGORIES = [
  { value: "Allgemein", label: "Allgemein", hint: "Sonstiges Anliegen", iconKey: "clipboard", fixed: true },
  { value: "Angebot", label: "Angebot", hint: "Offerte, Beratung", iconKey: "document", fixed: true },
  { value: "Kontakt", label: "Kontakt", hint: "Frage, Rückruf", iconKey: "chat", fixed: true },
];

// ── Service → Wizard category mapping ────────────────────────────────────
const SERVICE_TO_CATEGORY = [
  { keywords: /verstopf|abfluss|WC|toilette|kanalisation|entwässerung/i, value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Kanalisation", iconKey: "drain" },
  { keywords: /leck|tropf|undicht|wasserschaden|feucht/i, value: "Leck", label: "Leck", hint: "Wasserschaden, undichte Stelle", iconKey: "drop" },
  { keywords: /heizung|heiz|wärmepumpe|radiatoren|heizkörper|thermostat|fussbodenheizung/i, value: "Heizung", label: "Heizung", hint: "Heizung, Wärmepumpe", iconKey: "flame" },
  { keywords: /boiler|warmwasser|entkalkung|durchlauferhitzer|speicher/i, value: "Boiler", label: "Boiler", hint: "Warmwasser, Entkalkung", iconKey: "thermometer" },
  { keywords: /rohrbruch|wasserrohr|rohrleitung|leitungsbau/i, value: "Rohrbruch", label: "Rohrbruch", hint: "Wasserrohr, Rohrleitung", iconKey: "pipe" },
  { keywords: /lüftung|klima|klimaanlage|belüftung|ventilation/i, value: "Lüftung", label: "Lüftung", hint: "Lüftung, Klimaanlage", iconKey: "wind" },
  { keywords: /umbau|sanier|renovier|bad|neubau|renovation/i, value: "Umbau/Sanierung", label: "Umbau/Sanierung", hint: "Umbau, Bad-Renovation", iconKey: "wrench" },
];

// ── Existing prefixes (from known customers) ─────────────────────────────
// Used for uniqueness check
async function getExistingPrefixes() {
  const prefixes = new Set();
  try {
    const customersDir = join("docs", "customers");
    // Check known customer configs
    const knownPrefixes = ["DF", "BH", "WL", "WB", "FS"]; // Dörfler, Brunner, Walter-Leuthold, Weinberger, FlowSight
    for (const p of knownPrefixes) prefixes.add(p);
  } catch { /* ignore */ }
  return prefixes;
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Extract first 2 consonants from company name for case_id_prefix */
/** Case-ID Prefix: 2 Buchstaben aus Firmenname. NIEMALS Zahlen. NIEMALS Umlaute (ÄÖÜ).
 * "Wälti & Sohn AG" → "WS" (Initialen der Wörter)
 * "Stark Haustechnik" → "SH"
 * "Leins AG" → "LN" (Konsonanten)
 * "Dörfler AG" → "DF" */
function deriveCaseIdPrefix(companyName) {
  // Umlaute ersetzen: Ä→A, Ö→O, Ü→U
  const clean = companyName
    .replace(/[Ää]/g, "A").replace(/[Öö]/g, "O").replace(/[Üü]/g, "U");

  // Strategy 1: Initialen der ersten 2 signifikanten Wörter
  const words = clean
    .replace(/\b(AG|GmbH|SA|Sarl|KlG|Genossenschaft|und|&)\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1 && /^[A-Z]/i.test(w));
  if (words.length >= 2) {
    const prefix = (words[0][0] + words[1][0]).toUpperCase().replace(/[^A-Z]/g, "");
    if (prefix.length === 2) return prefix;
  }
  // Strategy 2: Erste 2 Konsonanten des Firmennamens
  const consonants = clean
    .replace(/[^a-zA-Z]/g, "")
    .replace(/[aeiou]/gi, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (consonants.length >= 2) return consonants.slice(0, 2);
  // Fallback: erste 2 Buchstaben
  return clean.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
}

/** Derive SMS sender name: max 11 chars, ASCII alphanumeric only.
 * Strategy: "Firma Rechtsform" wenn ≤11 (z.B. "Stark GmbH", "Leins AG").
 * Fallback: Firmenname ohne Rechtsform, gekürzt. */
function deriveSMSSenderName(companyName) {
  const toAscii = (s) => s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  // Try: "Firma Rechtsform" (e.g., "Stark GmbH", "Leins AG", "Doerfler AG")
  // Use FIRST word of the company name (before any "Haustechnik", "Sanitär" etc.)
  const legalMatch = companyName.match(/^(.+?)\s+(AG|GmbH|SA|Sàrl|KlG)$/i);
  if (legalMatch) {
    const fullName = toAscii(legalMatch[1]);
    const firstWord = fullName.split(/\s+/)[0]; // "Stark" from "Stark Haustechnik"
    const form = legalMatch[2];

    // Try first word + form: "Stark GmbH" (10 chars)
    const shortCandidate = `${firstWord} ${form}`;
    if (shortCandidate.length <= 11) return shortCandidate;

    // Try full name without spaces: "DoerflerAG"
    const name = fullName.replace(/\s+/g, "");
    const candidate = `${name} ${form}`;
    if (candidate.length <= 11) return candidate;
    // If too long with space, try without: "DoerflerAG"
    const noSpace = `${name}${form}`;
    if (noSpace.length <= 11) return noSpace;
  }

  // Fallback: just the name, no legal form
  return toAscii(companyName).replace(/\s+/g, "").slice(0, 11);
}

/** Count syllables in German text (rough approximation) */
function countSyllables(text) {
  const vowelGroups = text.toLowerCase().match(/[aeiouäöü]+/gi) || [];
  return Math.max(1, vowelGroups.length);
}

/** Derive domain from services list */
function deriveDomain(leistungen) {
  const keys = Object.keys(leistungen).map((k) => k.toLowerCase());
  const hasSanitaer = keys.some((k) => /sanit|abfluss|verstopf|rohr|bad/i.test(k));
  const hasHeizung = keys.some((k) => /heiz|wärme/i.test(k));
  const hasLueftung = keys.some((k) => /lüft|klima/i.test(k));
  const hasSpenglerei = keys.some((k) => /spengl|blech|dach/i.test(k));
  const hasBlitzschutz = keys.some((k) => /blitz|erdung|fangstange/i.test(k));
  const hasGas = keys.some((k) => /gas/i.test(k));
  const hasSolar = keys.some((k) => /solar|photovoltaik|erneuerbar/i.test(k));

  const parts = [];
  if (hasSanitaer) parts.push("Sanitär");
  if (hasHeizung) parts.push("Heizung");
  if (hasLueftung) parts.push("Lüftung");
  if (hasSpenglerei) parts.push("Spenglerei");
  if (hasBlitzschutz) parts.push("Blitzschutz");
  if (hasSolar) parts.push("Solar");
  if (hasGas) parts.push("Gas");

  if (parts.length === 0) return "Haustechnik";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" und ");
  // ALLE Leistungsbereiche einbeziehen (Fix 1: Domain zu eng)
  return parts.slice(0, -1).join(", ") + " und " + parts[parts.length - 1];
}

/** Derive wizard categories: IMMER genau 3 Custom + 3 Fixed = 6 Kacheln.
 * Top 3 = typische KUNDENPROBLEME für diesen Betrieb (nicht Leistungen!).
 * Gold-Standard (Dörfler Sanitär+Heizung): Verstopfung, Leck, Heizung.
 * Ein Wort, simpel, alltagsnah. */
function deriveWizardCategories(leistungen) {
  const allServiceText = Object.entries(leistungen)
    .map(([cat, items]) => `${cat} ${Array.isArray(items) ? items.join(" ") : items}`)
    .join(" ");

  // Step 1: Detect broad service areas
  const hasSanitaer = /sanit|abfluss|WC|bad|rohr|wasser/i.test(allServiceText);
  const hasHeizung = /heizung|heiz|wärme|radiat|thermostat/i.test(allServiceText);

  // Step 2: Match against master category list
  const matched = [];
  for (const mapping of SERVICE_TO_CATEGORY) {
    if (mapping.keywords.test(allServiceText)) {
      matched.push({
        value: mapping.value,
        label: mapping.label,
        hint: mapping.hint,
        iconKey: mapping.iconKey,
      });
    }
  }

  // Step 3: Wenn "Sanitär" → Verstopfung + Leck sind IMMER typische Kundenprobleme
  // (auch wenn die Wörter nicht explizit auf der Website stehen)
  if (hasSanitaer) {
    if (!matched.some((c) => c.value === "Verstopfung")) {
      matched.unshift({ value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Kanalisation", iconKey: "drain" });
    }
    if (!matched.some((c) => c.value === "Leck")) {
      matched.splice(1, 0, { value: "Leck", label: "Leck", hint: "Wasserschaden, undichte Stelle", iconKey: "drop" });
    }
  }
  // Wenn "Heizung" → Heizung ist immer typisches Kundenproblem
  if (hasHeizung && !matched.some((c) => c.value === "Heizung")) {
    matched.push({ value: "Heizung", label: "Heizung", hint: "Heizung, Wärmepumpe", iconKey: "flame" });
  }

  // IMMER genau 3 Custom-Kategorien.
  // Defaults für Sanitär/Heizung: Verstopfung, Leck, Heizung (Gold-Standard)
  const DEFAULTS = [
    { value: "Verstopfung", label: "Verstopfung", hint: "Abfluss, WC, Kanalisation", iconKey: "drain" },
    { value: "Leck", label: "Leck", hint: "Wasserschaden, undichte Stelle", iconKey: "drop" },
    { value: "Heizung", label: "Heizung", hint: "Heizung, Wärmepumpe", iconKey: "flame" },
  ];

  let customCats;
  if (matched.length >= 3) {
    // Genug Matches: nimm die Top 3
    customCats = matched.slice(0, 3);
  } else if (matched.length > 0) {
    // Weniger als 3 Matches: fülle mit Defaults auf
    customCats = [...matched];
    for (const d of DEFAULTS) {
      if (customCats.length >= 3) break;
      if (!customCats.some((c) => c.value === d.value)) {
        customCats.push(d);
      }
    }
  } else {
    // Keine Matches: verwende alle 3 Defaults
    customCats = [...DEFAULTS];
  }

  return [...customCats.slice(0, 3), ...FIXED_CATEGORIES];
}

/** Derive pipe-separated categories for voice agent */
function deriveVoiceCategories(wizardCategories) {
  return wizardCategories.map((c) => c.value).join(" | ");
}

/** Format opening hours for voice prompt (natural German) */
function formatOpeningHoursSpoken(hours) {
  if (!hours) return "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten.";

  if (typeof hours === "string") {
    // Already a text string
    return hours;
  }

  if (typeof hours === "object") {
    const parts = Object.entries(hours).map(([day, time]) =>
      `${day}: ${time}`,
    );
    return `Wir sind ${parts.join(", ")} für Sie erreichbar.`;
  }

  return "Bitte kontaktieren Sie uns telefonisch für unsere aktuellen Öffnungszeiten.";
}

/** Format opening hours structured for voice prompt */
function formatOpeningHours(hours) {
  if (!hours) return "";
  if (typeof hours === "string") return hours;
  if (typeof hours === "object") {
    return Object.entries(hours).map(([day, time]) => `${day}: ${time}`).join("\n");
  }
  return "";
}

/** Derive service_area_plz from address PLZ */
function deriveServiceAreaPLZ(addressValue) {
  if (!addressValue) return [];

  const plzMatch = addressValue.match(/\b(\d{4})\b/);
  if (!plzMatch) return [];

  const basePLZ = plzMatch[1];
  const basePLZNum = parseInt(basePLZ, 10);

  // Include the base PLZ and all nearby PLZs from PLZ_CITY_MAP
  // "Nearby" = within ~200 PLZ numbers (rough proxy for ~15km in Zurich area)
  const plzList = [];
  for (const [plz, city] of Object.entries(PLZ_CITY_MAP)) {
    const plzNum = parseInt(plz, 10);
    if (Math.abs(plzNum - basePLZNum) <= 200) {
      plzList.push({ plz, city });
    }
  }

  // If base PLZ not in map, add it manually
  if (!plzList.some((p) => p.plz === basePLZ)) {
    const cityMatch = addressValue.match(/\d{4}\s+(.+?)(?:,|$)/);
    plzList.unshift({ plz: basePLZ, city: cityMatch ? cityMatch[1].trim() : "Unbekannt" });
  }

  return plzList;
}

/** Derive service_area_spoken from PLZ list or explicit area */
function deriveServiceAreaSpoken(einzugsgebiet, addressValue) {
  if (einzugsgebiet) {
    return einzugsgebiet;
  }

  const plzMatch = addressValue?.match(/\d{4}\s+(.+?)(?:,|$)/);
  if (plzMatch) {
    return `Wir sind in ${plzMatch[1].trim()} und der näheren Umgebung für Sie da.`;
  }

  return "Wir sind in der Region für Sie da.";
}

/** Derive team section text */
function deriveTeamSection(teamGroesse, inhaber) {
  const parts = [];
  if (inhaber) {
    parts.push(`Geschäftsleitung: ${inhaber}`);
  }
  if (teamGroesse) {
    parts.push(`Unser Team besteht aus ${teamGroesse} Mitarbeitenden.`);
  }
  return parts.join("\n") || "";
}

/** Derive video hook (in priority order) */
function deriveVideoHook(gruendung, werte, googleRating, googleReviewCount, firma) {
  const currentYear = new Date().getFullYear();

  // Priority 1: Founding year if > 20 years
  if (gruendung) {
    const year = parseInt(gruendung, 10);
    if (year && (currentYear - year) >= 20) {
      return `Seit ${year} für Sie da.`;
    }
    if (year) {
      return `Gegründet ${year}.`;
    }
  }

  // Priority 2: Values/slogan
  if (werte && werte.length > 10 && werte.length < 80) {
    return werte;
  }

  // Priority 3: Google rating
  if (googleRating && googleReviewCount) {
    return `${googleRating} Sterne bei ${googleReviewCount} Google-Bewertungen.`;
  }

  // Fallback
  return `${firma} — Ihr Partner für Haustechnik.`;
}

/** Derive betriebsspezifische_frage */
function deriveBetriebsspezifischeFrage(gruendung, leistungen, stellenangebote, firma) {
  const currentYear = new Date().getFullYear();

  // If founded > 50 years ago
  if (gruendung) {
    const year = parseInt(gruendung, 10);
    if (year && (currentYear - year) >= 50) {
      return `Wie lange gibt es ${firma} schon?`;
    }
  }

  // If specific service (solar, wärmepumpe)
  const serviceKeys = Object.keys(leistungen || {});
  const specialServices = serviceKeys.filter((k) =>
    /solar|wärmepumpe|erneuerbar|photovoltaik|klima|spenglerei/i.test(k),
  );
  if (specialServices.length > 0) {
    return `Macht ihr auch ${specialServices[0]}?`;
  }

  // If Lehrbetrieb
  if (stellenangebote && /lehr/i.test(stellenangebote)) {
    return "Bildet ihr auch Lehrlinge aus?";
  }

  // Fallback
  return "Was ist euer Einzugsgebiet?";
}

/** Derive case count from team size */
function deriveCaseCount(teamGroesse) {
  // Minimum 40-50 cases für realistischen Alltag (Founder-Feedback 19.04.)
  if (!teamGroesse) return 50; // default: 50 (war 30)
  if (teamGroesse <= 3) return 40;
  if (teamGroesse <= 10) return 50;
  if (teamGroesse <= 30) return 70;
  return 100;
}

/** Phone demo case = IMMER Rohrbruch/Wasserschaden (aus Call-Script, Founder Decision 20.04.)
 * Der Fall im Video-Anruf ist IMMER derselbe: Keller, knöcheltief im Wasser, Rohrbruch.
 * Nur Stadt + PLZ sind betriebsspezifisch (aus Einzugsgebiet). */
// FB33: Phone-Case aus Call-Script (mini_takes/Take2/call/Notruf/notruf.txt)
// Der Call-Audio ist Master-Aufnahme für ALLE Sanitär-Betriebe. Inhalt konstant:
//   - User: "Sieht für mich eher nach einem Rohrbruch aus" → kategorie
//   - Lisa: "Das klingt dringend" → urgency
//   - User: "Das ist die Seestrasse vierzehn" → strasse/hausnummer
//   - User: "Acht neun vier zwei Oberrieden" → plz/stadt
//   - User: "Bei Wende" (Klingelschild) → reporter_name
function derivePhoneDemoCase(wizardCategories, serviceAreaPLZ, adresse) {
  return {
    kategorie: "Rohrbruch",
    urgency: "dringend",
    source: "voice",
    reporter_name: "Wende", // FB50: nur Klingelschild, kein Vorname
    reporter_phone: "076 489 89 80", // FB48: Anrufer-Nummer (nicht Lisa-Nummer)
    beschreibung: "Anrufer steht im Keller knöcheltief im Wasser, vermutlich Rohrbruch. Klingelschild: Wende.",
    strasse: "Seestrasse",
    hausnummer: "14",
    stadt: "Oberrieden",
    plz: "8942",
    dringlichkeit: "Dringend", // legacy UI label
  };
}

// FB33: Notfall-Case (Position 1 im Leitsystem, rot markiert).
// Default branchen-basiert. Sanitär = "Boiler defekt" (nicht Rohrbruch, weil
// der Phone-Case selbst schon Rohrbruch ist — Duplikat vermeiden).
const NOTFALL_DEFAULTS = {
  "Sanitär und Heizung": { kategorie: "Boiler", beschreibung: "Boiler komplett defekt — kein Warmwasser. Kunde wartet auf Techniker." },
  "Sanitär": { kategorie: "Boiler", beschreibung: "Boiler komplett defekt — kein Warmwasser. Kunde wartet auf Techniker." },
  "Heizung": { kategorie: "Heizung", beschreibung: "Heizung komplett ausgefallen — Haus kühlt ab. Sofortmassnahme erforderlich." },
  "Elektrik": { kategorie: "Stromausfall", beschreibung: "Kompletter Stromausfall im Haus. Kunde wartet auf Techniker." },
  "Gastronomie": { kategorie: "Notfall", beschreibung: "Dringende Meldung im Betrieb." },
};
function deriveNotfallCase(domain) {
  const d = (domain || "").toLowerCase();
  for (const [key, value] of Object.entries(NOTFALL_DEFAULTS)) {
    if (d.includes(key.toLowerCase())) return value;
  }
  return NOTFALL_DEFAULTS["Sanitär und Heizung"]; // safe default
}

// FB36/37: Fiktive Zürcher Festnetz-Nummer — KONSTANT für ALLE Betriebe.
// Der Founder hat diese Nummer ausgewählt weil sie nirgends scharf/vergeben ist.
// Visuell zieht sie durch: Brunner AG Test → 74 21, Gebrüder Au GmbH Test → 74 21, etc.
// Nur der Firmenname variiert, die Nummer ist global dieselbe.
const PIPELINE_TEST_PHONE = "+41 44 505 74 21";
function deriveDisplayPhone(_slug) {
  return PIPELINE_TEST_PHONE;
}

/** Derive the wizard demo case (Online-Fall: Zweitkategorie, Normal) */
function deriveWizardDemoCase(wizardCategories, serviceAreaPLZ, adresse) {
  // Secondary category = second non-fixed category, or "Allgemein"
  const nonFixed = wizardCategories.filter((c) => !c.fixed);
  const secondary = nonFixed.length >= 2 ? nonFixed[1] : nonFixed[0];
  const cat = secondary ? secondary.value : "Allgemein";

  // Pick a different city than phone case
  const plzEntry = serviceAreaPLZ.length > 1 ? serviceAreaPLZ[1] : serviceAreaPLZ[0] || null;
  const stadt = plzEntry ? plzEntry.city : extractCityFromAddress(adresse);
  const plz = plzEntry ? plzEntry.plz : extractPLZFromAddress(adresse);

  // Normal priority scenarios (Projekte/Anfragen — hier fliesst das Geld)
  const scenarios = {
    "Verstopfung": "Abfluss in der Dusche läuft langsam ab — kein Notfall, aber gerne zeitnah.",
    "Heizung": "Möchten unsere Heizung ersetzen lassen, bitte um Offerte für Wärmepumpe.",
    "Umbau/Sanierung": "Badsanierung geplant — möchten gerne eine Beratung und Offerte.",
    "Boiler": "Boiler ist alt, möchten Entkalkung oder Ersatz — bitte um Termin.",
    "Lüftung": "Lüftung im Bad zieht nicht mehr richtig — gerne mal anschauen.",
    "Allgemein": "Gerne eine Beratung für eine Komplettsanierung unseres Badezimmers.",
    "Spenglerei": "Dachrinne undicht, bei Regen tropft es an der Fassade — bitte um Offerte.",
  };
  const beschreibung = scenarios[cat] || "Badsanierung geplant — möchten gerne eine Beratung und Offerte.";

  return { kategorie: cat, beschreibung, stadt, plz, dringlichkeit: "Normal" };
}

/**
 * Determine call proof variant: C (Notdienst) or B (Preis).
 * DEFAULT = B (Preis) — always safe, always correct.
 * C ONLY with STRONG evidence: explicit 24/7 or Pikett or "rund um die Uhr".
 * Just the word "Notfall" alone is NOT enough (could be "Bei Notfall Feuerwehr rufen").
 */
function deriveCallProofVariante(notdienstValue) {
  if (!notdienstValue) return "B";

  const text = String(notdienstValue).toLowerCase();

  // Strong evidence patterns — explicit 24/7 service
  const strongEvidence = [
    /24\s*(?:h|stunden)/,
    /rund\s+um\s+die\s+uhr/,
    /7\s*tage/,
    /pikett/,
    /auch\s+(?:an\s+)?(?:sonn|feier)/,
    /jederzeit/,
    /tag\s+und\s+nacht/,
    /egal\s+(?:um\s+)?welche\s+(?:uhr)?zeit/,
  ];

  const hasStrongEvidence = strongEvidence.some((re) => re.test(text));

  if (hasStrongEvidence) return "C";

  // Only weak evidence (just "Notfall" or "Notdienst" without 24/7 context)
  return "B";
}

function extractCityFromAddress(adresse) {
  const m = adresse?.match(/\d{4}\s+([A-ZÄÖÜa-zäöü]+(?:\s+[a-zäöü]+)*)/);
  return m ? m[1] : "";
}

function extractPLZFromAddress(adresse) {
  const m = adresse?.match(/(\d{4})/);
  return m ? m[1] : "";
}

/** Derive weighted categories for seed data */
function deriveCategoriesWeighted(wizardCategories) {
  const weights = {};
  const customCats = wizardCategories.filter((c) => !c.fixed);
  const totalWeight = 100;
  const fixedWeight = 15; // 5% each for Allgemein, Angebot, Kontakt

  const customWeight = totalWeight - fixedWeight;
  const perCustom = customCats.length > 0 ? Math.floor(customWeight / customCats.length) : 0;

  for (const cat of customCats) {
    weights[cat.value] = perCustom;
  }
  weights["Allgemein"] = 5;
  weights["Angebot"] = 5;
  weights["Kontakt"] = 5;

  return weights;
}

/** Derive featured case from service area and top category */
function deriveFeaturedCase(wizardCategories, serviceAreaPLZ, addressValue) {
  const topCategory = wizardCategories.find((c) => !c.fixed);
  const categoryDescriptions = {
    "Verstopfung": "Abfluss in der Küche komplett verstopft. Wasser läuft über.",
    "Leck": "Undichte Stelle unter dem Lavabo im Badezimmer. Wasser tropft.",
    "Heizung": "Heizung ausgefallen, Haus kühlt ab. Bitte dringend kommen.",
    "Boiler": "Kein Warmwasser seit heute Morgen. Boiler zeigt keine Reaktion.",
    "Rohrbruch": "Wasserrohrbruch im Keller. Wasser steht ca. 5cm hoch.",
    "Lüftung": "Lüftungsanlage macht laute Geräusche und zieht nicht mehr.",
    "Umbau/Sanierung": "Offerte gewünscht für komplette Badsanierung.",
  };

  const category = topCategory ? topCategory.value : "Verstopfung";

  // Prefer company's own PLZ/city (most realistic), then first from service area
  let area = { plz: "8000", city: "Zürich" };
  if (addressValue) {
    const plzMatch = addressValue.match(/(\d{4})\s+(.+?)(?:,|$)/);
    if (plzMatch) {
      area = { plz: plzMatch[1], city: plzMatch[2].trim() };
    }
  }
  if (area.plz === "8000" && serviceAreaPLZ.length > 0) {
    area = serviceAreaPLZ[0];
  }

  return {
    kategorie: category,
    beschreibung: categoryDescriptions[category] || "Allgemeine Anfrage.",
    stadt: area.city,
    plz: area.plz,
    dringlichkeit: "Dringend",
  };
}

/** Get the first phone number from a comma-separated list */
function primaryPhone(phoneStr) {
  if (!phoneStr) return "";
  return phoneStr.split(",")[0].trim();
}

/** Get the first email from a comma-separated list */
function primaryEmail(emailStr) {
  if (!emailStr) return "";
  return emailStr.split(",")[0].trim();
}

/** Format address for spoken output */
function deriveAddressSpoken(address) {
  if (!address) return "";
  return `Sie finden uns an der ${address}.`;
}

/** Format phone for display (Swiss format) */
function formatPhoneDisplay(phone) {
  if (!phone) return "";
  // Remove all non-digits except +
  const clean = phone.replace(/[^\d+]/g, "");
  // Format: +41 44 713 03 04 or 044 713 03 04
  if (clean.startsWith("+41") && clean.length === 12) {
    const local = clean.slice(3);
    return `+41 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }
  return phone.trim();
}

// ── Validate mode ────────────────────────────────────────────────────────
async function validateConfig() {
  const configPath = join(customerDir, "tenant_config.json");
  if (!existsSync(configPath)) {
    console.error(`ERROR: ${configPath} not found. Run derive_config.mjs first (without --validate).`);
    process.exit(1);
  }

  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const issues = [];

  // Check for founder_confirm placeholders
  function checkObj(obj, path = "") {
    for (const [key, val] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      if (val === "founder_confirm" || val === "FOUNDER_CONFIRM") {
        issues.push(`${fullPath}: still needs Founder confirmation`);
      }
      if (val === "" || val === null) {
        // Some fields are legitimately empty
        const allowEmpty = [
          "voice_agent.emergency_policy",
          "voice_agent.price_section",
          "voice_agent.jobs_section",
          "voice_agent.jobs_spoken",
          "voice_agent.founded",
          "voice_agent.memberships",
          "voice_agent.opening_hours",
          "voice_agent.team_section",
          "voice_agent.owner_names",
          "video.betriebsspezifische_antwort",
        ];
        if (!allowEmpty.includes(fullPath)) {
          issues.push(`${fullPath}: empty/null`);
        }
      }
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        checkObj(val, fullPath);
      }
    }
  }

  checkObj(config);

  // Check founder_actions_needed
  if (config._founder_actions_needed && config._founder_actions_needed.length > 0) {
    issues.push(`_founder_actions_needed still has ${config._founder_actions_needed.length} items`);
  }

  if (issues.length === 0) {
    console.log("\n=== VALIDATION PASSED ===");
    console.log("tenant_config.json is complete and ready for provisioning.\n");
    return;
  }

  console.log("\n=== VALIDATION FAILED ===");
  console.log(`${issues.length} issue(s) found:\n`);
  for (const issue of issues) {
    console.log(`  - ${issue}`);
  }
  console.log(`\nFix these before provisioning.\n`);
  process.exit(1);
}

// ── Main derive logic ────────────────────────────────────────────────────
async function main() {
  if (validateOnly) {
    await validateConfig();
    return;
  }

  // ── Read crawl_extract.json ──
  const crawlPath = join(customerDir, "crawl_extract.json");
  if (!existsSync(crawlPath)) {
    console.error(`ERROR: ${crawlPath} not found. Run crawl_extract.mjs first.`);
    process.exit(1);
  }

  const crawl = JSON.parse(await readFile(crawlPath, "utf-8"));
  console.log(`\n=== Derive Config: ${slug} ===`);
  console.log(`Source: ${crawlPath}`);

  // ── Read prospect_card.json (optional) ──
  let prospect = null;
  const prospectPath = join(customerDir, "prospect_card.json");
  if (existsSync(prospectPath)) {
    prospect = JSON.parse(await readFile(prospectPath, "utf-8"));
    console.log(`Prospect card: ${prospectPath}`);
  } else {
    console.log("Prospect card: not found (optional)");
  }

  // ── Extract raw values ──
  const firma = crawl.firma?.value || prospect?.company?.legal_name || slug;
  const inhaber = crawl.inhaber?.value || (prospect?.team?.length > 0 ? prospect.team.map((t) => t.name || t).join(", ") : null);
  const adresse = crawl.adresse?.value || (prospect?.contact?.address ? `${prospect.contact.address.street}, ${prospect.contact.address.zip} ${prospect.contact.address.city}` : "");
  const telefon = crawl.telefon?.value || prospect?.contact?.phone || "";
  const email = crawl.email?.value || prospect?.contact?.email || "";
  const website = crawl.website_url?.value || prospect?.contact?.website || "";
  const gruendung = crawl.gruendung?.value || (prospect?.company?.founding_year ? String(prospect.company.founding_year) : null);
  const teamGroesse = crawl.team_groesse?.value || null;
  const leistungen = crawl.leistungen?.value || {};
  const einzugsgebiet = crawl.einzugsgebiet?.value || null;
  const mitgliedschaften = crawl.mitgliedschaften?.value || null;
  const stellenangebote = crawl.stellenangebote?.value || null;
  const notdienst = crawl.notdienst?.value || null;
  const oeffnungszeiten = crawl.oeffnungszeiten?.value || null;
  const werte = crawl.werte?.value || null;
  const brandColor = crawl.brand_color?.value || prospect?.company?.brand_color || null;
  const googleRating = crawl.google?.rating || prospect?.reviews?.google_rating || null;
  const googleReviewCount = crawl.google?.review_count || prospect?.reviews?.google_reviews || null;
  const besonderheiten = crawl.besonderheiten?.value || null;

  // ── Derive all fields ──
  console.log("\n--- Deriving fields ---\n");

  // Tenant
  const caseIdPrefix = deriveCaseIdPrefix(firma);
  const existingPrefixes = await getExistingPrefixes();
  let finalPrefix = caseIdPrefix;
  if (existingPrefixes.has(finalPrefix)) {
    // Add a digit to make unique
    for (let i = 2; i <= 9; i++) {
      const candidate = `${finalPrefix[0]}${i}`;
      if (!existingPrefixes.has(candidate)) {
        finalPrefix = candidate;
        break;
      }
    }
  }
  console.log(`  case_id_prefix: ${finalPrefix} (from "${firma}")`);

  const smsSenderName = deriveSMSSenderName(firma);
  console.log(`  sms_sender_name: ${smsSenderName}`);

  // Voice Agent
  const domain = deriveDomain(leistungen);
  console.log(`  domain: ${domain}`);

  const wizardCategories = deriveWizardCategories(leistungen);
  console.log(`  wizard categories: ${wizardCategories.length} (${wizardCategories.filter((c) => !c.fixed).length} custom + ${wizardCategories.filter((c) => c.fixed).length} fixed)`);

  const voiceCategories = deriveVoiceCategories(wizardCategories);
  console.log(`  voice categories: ${voiceCategories}`);

  const teamSection = deriveTeamSection(teamGroesse, inhaber);
  const membershipStr = mitgliedschaften ? mitgliedschaften.join(", ") : "";
  const googleStr = googleRating ? `${googleRating} Sterne bei ${googleReviewCount || "?"} Bewertungen` : "";
  const openingHoursFormatted = formatOpeningHours(oeffnungszeiten);
  const openingHoursSpoken = formatOpeningHoursSpoken(oeffnungszeiten);
  const emergencyPolicy = notdienst || "";
  const servicesList = Object.entries(leistungen).map(([cat, items]) => {
    if (Array.isArray(items)) return `${cat}: ${items.join(", ")}`;
    return cat;
  }).join("\n");

  const serviceAreaPLZ = deriveServiceAreaPLZ(adresse);
  console.log(`  service_area_plz: ${serviceAreaPLZ.length} PLZs`);

  const serviceAreaSpoken = deriveServiceAreaSpoken(einzugsgebiet, adresse);
  const addressSpoken = deriveAddressSpoken(adresse);

  const jobsSection = stellenangebote || "";
  const jobsSpoken = stellenangebote
    ? `Ja, wir haben aktuell offene Stellen. ${stellenangebote}`
    : "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei.";

  // Video
  const firmaDisplay = firma;
  const firmaSilben = countSyllables(firma);
  const telefonDisplay = formatPhoneDisplay(primaryPhone(telefon));
  const videoPrefix = finalPrefix; // IMMER identisch mit case_id_prefix
  const videoHook = deriveVideoHook(gruendung, werte, googleRating, googleReviewCount, firma);
  console.log(`  video_hook: ${videoHook}`);

  const betriebsFrage = deriveBetriebsspezifischeFrage(gruendung, leistungen, stellenangebote, firma);
  console.log(`  betriebsspezifische_frage: ${betriebsFrage}`);

  // Seed
  const caseCount = deriveCaseCount(teamGroesse);
  const categoriesWeighted = deriveCategoriesWeighted(wizardCategories);
  // Dummy-Staff-Namen (erkennbar als Demo-Daten, keine echten Namen)
  const staffNames = ["Max Mustermann", "Anna Beispiel", "Peter Muster"];
  const featuredCase = deriveFeaturedCase(wizardCategories, serviceAreaPLZ, adresse);
  const phoneDemoCase = derivePhoneDemoCase(wizardCategories, serviceAreaPLZ, adresse);
  const wizardDemoCase = deriveWizardDemoCase(wizardCategories, serviceAreaPLZ, adresse);
  const notfallCase = deriveNotfallCase(domain);
  const displayPhone = deriveDisplayPhone(slug);
  console.log(`  display_phone (fiktiv, für Video): ${displayPhone}`);
  console.log(`  notfall_case (${domain}): ${notfallCase.kategorie}`);

  // ── Founder actions ──
  const founderActions = [];
  if (!email) founderActions.push({ field: "prospect_email", reason: "Keine E-Mail auf Website gefunden. Founder muss E-Mail beschaffen.", default: null });
  if (!brandColor) founderActions.push({ field: "brand_color", reason: "Brand Color nicht extrahierbar. Default: #64748b (slate).", default: "#64748b" });
  if (!oeffnungszeiten) founderActions.push({ field: "oeffnungszeiten", reason: "Öffnungszeiten nicht auf Website. Founder muss beschaffen.", default: "Bitte kontaktieren Sie uns telefonisch" });
  if (!inhaber) founderActions.push({ field: "inhaber", reason: "Inhaber/GL nicht auf Website identifiziert.", default: null });
  // video_hook: Optional für E-Mail/Video. Auto-Vorschlag wird verwendet wenn nicht angepasst.
  // betriebsspezifische_frage: OBSOLET — ersetzt durch call_proof_variante (Notruf/Preis). Nicht mehr als PFLICHT.
  if (videoHook) {
    founderActions.push({ field: "video_hook", reason: `Optional — für E-Mail oder Video-Subtitle. Auto-Vorschlag: "${videoHook}".`, default: videoHook });
  }

  // ── Build config ──
  const config = {
    _derived_from: "crawl_extract.json",
    _derived_at: new Date().toISOString(),
    _founder_actions_needed: founderActions.filter((a) => a.default === null).map((a) => a.field),

    tenant: {
      slug,
      name: firma,
      case_id_prefix: finalPrefix,
      brand_color: brandColor || "#64748b",
      sms_sender_name: smsSenderName,
    },

    voice_agent: {
      company_name: firma,
      domain,
      owner_names: inhaber || "",
      address: adresse,
      phone: primaryPhone(telefon),
      email: primaryEmail(email),
      website,
      founded: gruendung || "",
      team_section: teamSection,
      memberships: membershipStr,
      google_rating: googleStr,
      opening_hours: openingHoursFormatted,
      opening_hours_spoken: openingHoursSpoken,
      emergency_policy: emergencyPolicy,
      services_list: servicesList,
      service_area: einzugsgebiet || (serviceAreaPLZ.length > 0 ? serviceAreaPLZ.map((p) => `${p.plz} ${p.city}`).join(", ") : ""),
      service_area_spoken: serviceAreaSpoken,
      price_section: "",
      price_deflect: "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?",
      jobs_section: jobsSection,
      jobs_spoken: jobsSpoken,
      address_spoken: addressSpoken,
      categories: voiceCategories,
    },

    wizard: {
      categories: wizardCategories,
    },

    seed: {
      case_count: caseCount,
      google_rating: googleRating,
      google_review_count: googleReviewCount,
      staff_names: staffNames,
      categories_weighted: categoriesWeighted,
      service_area_plz: serviceAreaPLZ.map((p) => p.plz),
      featured_case: featuredCase,
      phone_demo_case: phoneDemoCase,
      notfall_case: notfallCase, // FB33: Position 1 im Leitsystem, rot markiert
      wizard_demo_case: wizardDemoCase,
      include_2025_data: true,
    },

    video: {
      firma_display: firmaDisplay,
      firma_silben: firmaSilben,
      // FB30: telefon_display UND display_phone = FIKTIVE Nummer. Die echte
      // va.phone bleibt separat für echte Calls. Im Video darf die echte
      // Nummer NIE erscheinen (Testviewer würden beim echten Betrieb landen).
      telefon_display: displayPhone,
      display_phone: displayPhone,
      prefix: videoPrefix,
      modus: 2,
      google_stars: googleRating,
      video_hook: videoHook,
      // betriebsspezifische_frage: OBSOLET — ersetzt durch call_proof_variante (Notruf/Preis)
      call_proof_variante: deriveCallProofVariante(notdienst),
    },

    prospect: {
      email: primaryEmail(email) || "",
    },
  };

  // ── Save config ──
  const configPath = join(customerDir, "tenant_config.json");
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  console.log(`\n--- Saved: ${configPath} ---`);

  // ── Generate founder_review.md ──
  const reviewItems = founderActions.filter((a) => a.default === null);
  const optionalItems = founderActions.filter((a) => a.default !== null);

  const proofVariante = config.video.call_proof_variante;
  const proofLabel = proofVariante === "C" ? "Notdienst (Variante C)" : "Preis (Variante B)";

  let reviewMd = `# Founder Review: ${firma}\n\n`;
  reviewMd += `**Slug:** ${slug}\n`;
  reviewMd += `**Datum:** ${new Date().toISOString().slice(0, 10)}\n`;
  reviewMd += `**Pipeline-Phase:** Phase 1 → Founder Review → dann Provision\n\n`;
  reviewMd += `---\n\n`;

  // ── Was wurde automatisch gemacht ──
  reviewMd += `## Was die Pipeline automatisch gemacht hat\n\n`;
  reviewMd += `1. **Website gecrawlt** (Playwright): ${crawl._meta?.pages_crawled?.length || "?"} Seiten\n`;
  reviewMd += `2. **Zefix verifiziert:** ${crawl._zefix?.official_name || "nicht gefunden"} (${crawl._zefix?.uid || "keine UID"})\n`;
  reviewMd += `3. **Google Places:** ${googleRating || "-"}★ bei ${googleReviewCount || 0} Bewertungen\n`;
  reviewMd += `4. **Entscheidungsmatrix:** 23 Voice-Agent-Platzhalter befüllt, ${wizardCategories.length} Wizard-Kategorien, ${serviceAreaPLZ.length} PLZs\n`;
  reviewMd += `5. **Call-Proof:** ${proofLabel} (${proofVariante === "C" ? "Betrieb hat Notdienst → Lisa zeigt 24/7-Erreichbarkeit" : "Kein Notdienst erkannt → Lisa zeigt professionellen Preis-Deflekt"})\n`;
  reviewMd += `6. **Voice Agent JSON** generiert: \`voice_agent_de.json\`\n\n`;

  if (reviewItems.length > 0) {
    reviewMd += `---\n\n`;
    reviewMd += `## PFLICHT — Founder muss bestätigen (${reviewItems.length} Punkte)\n\n`;
    reviewMd += `> **So geht's:** Unten die Felder prüfen. Vorschlag okay? → Weiter. Anpassen? → Wert direkt in \`tenant_config.json\` ändern.\n`;
    reviewMd += `> **Datei:** \`docs/customers/${slug}/tenant_config.json\`\n\n`;
    for (let i = 0; i < reviewItems.length; i++) {
      const item = reviewItems[i];
      reviewMd += `### ${i + 1}. ${item.field}\n`;
      reviewMd += `${item.reason}\n`;
      if (item.suggested) {
        reviewMd += `**Auto-Vorschlag:** ${item.suggested}\n`;
        reviewMd += `**→ Okay?** Dann nichts tun. **→ Anpassen?** In \`tenant_config.json\` → \`video.${item.field}\` ändern.\n\n`;
      } else {
        reviewMd += `**→ Muss befüllt werden** in \`tenant_config.json\`\n\n`;
      }
    }
  } else {
    reviewMd += `## ✅ Alle Pflichtfelder automatisch abgeleitet\n\n`;
    reviewMd += `Keine manuelle Eingabe nötig. Direkt weiter mit Provision.\n\n`;
  }

  reviewMd += `---\n\n`;
  reviewMd += `## Konfiguration prüfen\n\n`;
  reviewMd += `Stimmt das? Wenn etwas falsch ist → in \`tenant_config.json\` korrigieren.\n\n`;
  reviewMd += `| Feld | Wert | Stimmt? |\n|------|------|--------|\n`;
  reviewMd += `| Firma | ${firma} | |\n`;
  reviewMd += `| Zefix UID | ${crawl._zefix?.uid || "nicht gefunden"} | |\n`;
  reviewMd += `| Google | ${googleRating || "-"}★ / ${googleReviewCount || 0} Reviews | |\n`;
  reviewMd += `| Domain | ${domain} | |\n`;
  reviewMd += `| Case-ID Prefix | ${finalPrefix} | |\n`;
  reviewMd += `| SMS Sender | ${smsSenderName} | |\n`;
  reviewMd += `| Brand Color | ${config.tenant.brand_color} | |\n`;
  reviewMd += `| Wizard-Kategorien | ${wizardCategories.map((c) => c.value).join(", ")} | |\n`;
  reviewMd += `| Seed Cases | ${caseCount} | |\n`;
  const plzList = serviceAreaPLZ.slice(0, 8).map((p) => `${p.plz} ${p.city}`).join(", ") + (serviceAreaPLZ.length > 8 ? ` (+${serviceAreaPLZ.length - 8} weitere)` : "");
  reviewMd += `| Einzugsgebiet (${serviceAreaPLZ.length} PLZs) | ${plzList} | |\n`;
  reviewMd += `| Call-Proof | ${proofLabel} | |\n`;
  reviewMd += `| Phone-Fall | ${config.seed.phone_demo_case?.kategorie} (${config.seed.phone_demo_case?.dringlichkeit}) | |\n`;
  reviewMd += `| Wizard-Fall | ${config.seed.wizard_demo_case?.kategorie} (${config.seed.wizard_demo_case?.dringlichkeit}) | |\n`;
  reviewMd += `| Prospect E-Mail | ${config.prospect?.email || "FEHLT"} | |\n`;
  reviewMd += `| Video Hook | ${videoHook} | |\n`;

  // ── Voice Agent Preview — Was Lisa konkret sagen wird ──
  reviewMd += `\n---\n\n`;
  reviewMd += `## Was Lisa sagen wird (Voice Agent Preview)\n\n`;
  reviewMd += `> Das sind die konkreten Antworten die Lisa am Telefon gibt. Stimmt etwas nicht → in \`tenant_config.json\` unter \`voice_agent.*\` korrigieren.\n\n`;

  reviewMd += `**Greeting:** "Hallo, hier ist Lisa — die digitale Assistentin der ${firma}. Wie kann ich Ihnen helfen?"\n\n`;

  reviewMd += `**Öffnungszeiten-Frage:** "${config.voice_agent.opening_hours_spoken}"\n\n`;

  reviewMd += `**Einzugsgebiet-Frage:** "${config.voice_agent.service_area_spoken}"\n\n`;

  reviewMd += `**Preis-Frage:** "${config.voice_agent.price_deflect}"\n\n`;

  reviewMd += `**Chef sprechen:** "Die Geschäftsleitung ist gerade im Einsatz. Kann ich Ihnen weiterhelfen, oder soll ich eine Rückruf-Nachricht aufnehmen?"\n\n`;

  reviewMd += `**Termin-Frage:** "Für Termine senden Sie am besten eine kurze Nachricht an ${config.voice_agent.email} — das Team kann das dann direkt einplanen."\n\n`;

  reviewMd += `**Adresse:** "${config.voice_agent.address_spoken}"\n\n`;

  reviewMd += `**Stellen/Bewerbung:** "${config.voice_agent.jobs_spoken}"\n\n`;

  if (config.voice_agent.emergency_policy) {
    reviewMd += `**Notdienst:** "${config.voice_agent.emergency_policy.slice(0, 200)}"\n\n`;
  }

  reviewMd += `**Leistungen:** ${config.voice_agent.services_list ? config.voice_agent.services_list.slice(0, 300) : "(leer)"}${config.voice_agent.services_list?.length > 300 ? "..." : ""}\n\n`;

  reviewMd += `**Scope (Domain):** Lisa nimmt Anliegen im Bereich **${domain}** auf. Alles andere → out_of_scope.\n\n`;

  reviewMd += `**Kategorien für Intake:** ${voiceCategories}\n\n`;

  // ── Nächster Schritt ──
  reviewMd += `---\n\n`;
  reviewMd += `## Nächster Schritt\n\n`;
  reviewMd += `Wenn alles stimmt:\n`;
  reviewMd += `\`\`\`bash\n`;
  reviewMd += `node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs --slug ${slug} --from provision\n`;
  reviewMd += `\`\`\`\n\n`;
  reviewMd += `Das provisioniert: Supabase Tenant + Voice Agent + ${caseCount} Demo-Cases + Prospect-Zugang.\n`;

  const reviewPath = join(customerDir, "founder_review.md");
  await writeFile(reviewPath, reviewMd, "utf-8");
  console.log(`--- Saved: ${reviewPath} ---`);

  // ── Summary ──
  const pflichtCount = founderActions.filter((a) => a.default === null).length;

  console.log("\n=== VALIDATION REPORT ===");
  if (pflichtCount === 0) {
    console.log("  READY FOR PIPELINE.");
  } else {
    console.log(`  ${pflichtCount} PFLICHT-Item(s) — Founder muss bestätigen.`);
    console.log("\n  Founder muss bestätigen:");
    for (const a of founderActions.filter((x) => x.default === null)) {
      const short = a.suggested ? ` (Vorschlag: "${a.suggested}")` : "";
      console.log(`    - ${a.field}${short}`);
    }
  }
  console.log(`\n  Config: ${configPath}`);
  console.log(`  Review: ${reviewPath}`);
  console.log("=========================\n");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
