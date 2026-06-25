/**
 * _anrede.mjs — gemeinsame Anrede-Logik für die Inhaber-Karte.
 *
 * Ziel: Das Inhaber-Feld zeigt IMMER „Herr/Frau Nachname" (kein Vorname) — für den
 * Cold Call. Geschlecht: explizites „Herr/Frau …" auf der Seite (wenn blob da ist)
 * schlägt die Vornamen-Liste; sonst Default „Herr" (Sanitär stark männlich) —
 * mehrdeutige werden so zu „Herr" und fallen ggf. der Founder-Gegenprüfung zu.
 *
 * Genutzt von crawl_extract.mjs (frischer Crawl, mit Seiten-Text als blob) UND
 * enrich_new_leads.mjs (Umformat bestehender Werte, ohne blob).
 */

// Häufige weibliche Vornamen (DE/CH/IT-CH) — klar weiblich. Mehrdeutige (Andrea,
// Simone, Nicola, Sascha, Kim, Toni, Dominique …) bewusst WEGGELASSEN, um keinen
// Mann als „Frau" anzusprechen. Mehrdeutige fängt die explizite „Frau X"-Suche.
export const FEMALE_VORNAMEN = new Set([
  "anna","maria","sandra","claudia","nicole","barbara","petra","monika","susanne","ursula",
  "ruth","esther","rita","brigitte","daniela","sabine","karin","christine","christina","manuela",
  "franziska","jasmin","jessica","laura","lara","sarah","sara","julia","lena","lea","mia","emma",
  "sofia","sophie","sophia","fabienne","melanie","michaela","michela","martina","marina","tanja",
  "vanessa","corinne","regula","beatrice","cornelia","doris","edith","eva","gabriela","heidi",
  "ingrid","irene","isabelle","katrin","kathrin","katharina","lisa","madeleine","margrit","nadja",
  "nathalie","natalie","patricia","pia","rahel","rebecca","renate","silvia","sonja","stephanie",
  "stefanie","therese","theresa","verena","vreni","yvonne","carmen","chiara","deborah","elena",
  "elisabeth","fiona","hanna","johanna","katja","leonie","livia","marisa","mirjam","miriam","nora",
  "olivia","ramona","selina","tamara","valentina","victoria","alina","anja","antonia","bettina",
  "carla","caroline","denise","elisa","evelyne","gisela","janine","judith","klara","clara","liliane",
  "magdalena","marianne","nelly","priska","rosa","rosmarie","sibylle","valeria","simona","francesca",
  "giulia","alessia","nadia","seraina","ladina","jolanda","corina","sara",
]);

// Wörter, die einen „Inhaber"-Eintrag als NICHT-Person entlarven (Navigation/Firma).
const NONPERSON_RE = /\b(Niederlassung|Niederlassungen|Unsere|Team|Kontakt|Filiale|Standort|Gesch[aä]ftsstelle|Hauptsitz|Sitz|Verwaltung|Leitung|Abteilung|Sekretariat|Empfang|GmbH|AG|S[aà]rl|Haustechnik|Sanit[aä]r|Heizung|Willkommen|Startseite|Dienstleistungen|Leistungen)\b/i;

function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// Ist „s" plausibel ein Personenname (2–4 großgeschriebene Wörter, kein Navi/Firma)?
export function isPersonName(s) {
  const w = String(s).trim().split(/\s+/).filter(Boolean);
  if (w.length < 2 || w.length > 4) return false;
  if (NONPERSON_RE.test(s)) return false;
  return w.every((x) => /^[A-ZÄÖÜ][a-zäöüéèêàçï'’.\-]+$/.test(x));
}

// „Roger Burkhardt" → „Herr Burkhardt". Idempotent: „Herr X" bleibt „Herr X".
// blob = optionaler Seiten-Text für explizite „Herr/Frau Nachname"-Erkennung.
export function anredeName(fullName, blob = "") {
  const raw = String(fullName).trim();
  if (/^(Herr|Frau)\s+\S/.test(raw)) return raw;          // schon Anrede → unverändert
  const q = /\?\s*$/.test(raw) ? " ?" : "";
  const parts = raw.replace(/\s*\?\s*$/, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return raw;
  const nachname = parts[parts.length - 1];
  const vorname = (parts[0] || "").toLowerCase().split("-")[0];
  if (blob) {
    const nn = escapeRe(nachname);
    if (new RegExp(`\\bFrau\\s+(?:[A-ZÄÖÜ][\\wäöü.\\-]+\\s+){0,2}${nn}\\b`).test(blob)) return `Frau ${nachname}${q}`;
    if (new RegExp(`\\bHerr\\s+(?:[A-ZÄÖÜ][\\wäöü.\\-]+\\s+){0,2}${nn}\\b`).test(blob)) return `Herr ${nachname}${q}`;
  }
  return `${FEMALE_VORNAMEN.has(vorname) ? "Frau" : "Herr"} ${nachname}${q}`;
}

// Bestehenden entscheider-Wert säubern + auf „Herr/Frau Nachname" bringen.
// Müll-Teile (Navigation/Firma) werden verworfen; leer → "" (= Lücke).
export function reformatEntscheider(value, blob = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const out = [];
  for (const p of raw.split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean)) {
    if (/^(Herr|Frau)\s+\S/.test(p)) { out.push(p); continue; }
    if (isPersonName(p)) out.push(anredeName(p, blob));
    // sonst: kein Personenname → verwerfen
  }
  return [...new Set(out)].join(", ");
}
