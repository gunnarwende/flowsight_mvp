#!/usr/bin/env node
/**
 * _geo_icp.mjs — gemeinsame Region- + Branchen-Filter (Ergebnis-Ebene).
 *
 * Kernproblem, das hier gelöst wird: Google Places liefert pro Ortssuche einen
 * UMKREIS (auch Nachbarkanton-Treffer). Bisher wurde per lose-Substring
 * (realOrt.includes(suchOrt)) gefiltert → "Frauenfeld" enthält "au" → Bleed.
 * Und der gespeicherte ort war die SUCH-Gemeinde, nicht die echte Adresse.
 *
 * Hier: echten Ort+PLZ aus der formatierten Adresse parsen, per EXAKTER
 * Mitgliedschaft in der Gemeinde-Datei dem Kanton zuordnen, und offensichtliche
 * Nicht-ICP-Branchen (Hotel/Museum/Schule/Verband/…) verwerfen.
 *
 * Reuse: ch_gemeinden_de.json (Ort→Kanton, nur Deutschschweiz-Kantone).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BY_KANTON = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../src/web/src/data/ch_gemeinden_de.json"), "utf-8"));

// Ort → [Kantone] (Homonyme wie "Au" liegen in mehreren Kantonen).
export const ORT_TO_KANTONE = new Map();
for (const k of Object.keys(BY_KANTON)) {
  for (const o of BY_KANTON[k]) {
    const key = normOrt(o);
    if (!ORT_TO_KANTONE.has(key)) ORT_TO_KANTONE.set(key, []);
    if (!ORT_TO_KANTONE.get(key).includes(k)) ORT_TO_KANTONE.get(key).push(k);
  }
}

// Pro Kanton ein Set normierter Orte (schnelle, EXAKTE Mitgliedschaftsprüfung).
const KANTON_ORT_SET = new Map();
for (const k of Object.keys(BY_KANTON)) KANTON_ORT_SET.set(k, new Set(BY_KANTON[k].map(normOrt)));

// Nicht-deutsche Orte, die im "_de"-File leaken (frz. Unterwallis, Berner Jura,
// zweisprachig). Nur relevant für DE-weite Läufe über BE/VS — für reine DE-Kantone
// (TG, ZH, …) ohne Wirkung. Erweiterbar.
export const NON_DE_ORTE = new Set([
  "sion","sitten","sierre","siders","martigny","monthey","leuk","loeche","loèche","brig-glis",
  "moutier","biel","bienne","biel/bienne","saint-imier","tavannes","tramelan","la neuveville",
  "fribourg","bulle","romont","chatel","châtel","estavayer","murten","morat",
].map(normOrt));

export function normOrt(s) {
  return String(s ?? "")
    .toLowerCase().trim()
    .replace(/\s*\([^)]*\)\s*$/, "")        // "Au (ZH)" → "Au"
    .replace(/\s+(zh|tg|sg|be|lu|ag|so|gr|vs|fr|bl|bs|sh|ar|ai|zg|ur|sz|ow|nw|gl)$/i, "") // "Au ZH" → "Au"
    .replace(/^st\.?\s+/, "st. ")           // normalize "St.Gallen"/"St Gallen" → "st. gallen"
    .replace(/\s+/g, " ")
    .replace(/[.,]+$/, "")
    .trim();
}

// "Strasse 1, 8500 Frauenfeld, Schweiz" → { plz:"8500", ort:"Frauenfeld" }
export function extractPlzOrt(address) {
  const a = String(address ?? "").trim();
  if (!a) return { plz: null, ort: null };
  // PLZ + Ort irgendwo in der Adresse (4-stellig + Rest bis Komma/Ende).
  const m = a.match(/\b(\d{4})\s+([^,]+?)(?:,|$)/);
  if (m) return { plz: m[1], ort: m[2].trim() };
  // Fallback: vorletztes Komma-Segment (Street, Ort, Schweiz)
  const parts = a.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { plz: null, ort: parts[parts.length - 2].replace(/^\d{4}\s*/, "").trim() || null };
  return { plz: null, ort: null };
}

export function kantoneOfOrt(ort) { return ORT_TO_KANTONE.get(normOrt(ort)) || []; }

// EXAKTE Mitgliedschaft: liegt der Ort im Zielkanton?
export function inKanton(ort, kanton) {
  const set = KANTON_ORT_SET.get(kanton);
  return !!set && set.has(normOrt(ort));
}

// Deutschschweiz: in irgendeinem DE-Kanton UND nicht auf der NON_DE-Liste.
export function isDeutschschweiz(ort) {
  const n = normOrt(ort);
  if (!n || NON_DE_ORTE.has(n)) return false;
  return ORT_TO_KANTONE.has(n);
}

// ── AUTORITATIVER Kanton (aus Google addressComponents) ──
// Der Ortsname allein kann Homonyme (Wetzikon TG vs ZH) NICHT auflösen — derselbe
// Name liegt in mehreren Kantonen. Google liefert den Kanton direkt; den nehmen wir.
const DE_KANTONE = new Set(Object.keys(BY_KANTON));
// Schreibvarianten / Codes → kanonischer Schlüssel (= BY_KANTON-Keys).
const KANTON_ALIAS = new Map([
  ["sankt gallen", "St. Gallen"], ["st. gallen", "St. Gallen"], ["st.gallen", "St. Gallen"], ["sg", "St. Gallen"],
  ["zh", "Zürich"], ["zuerich", "Zürich"], ["zurich", "Zürich"],
  ["tg", "Thurgau"], ["be", "Bern"], ["berne", "Bern"],
  ["gr", "Graubünden"], ["grisons", "Graubünden"], ["graubuenden", "Graubünden"],
  ["vs", "Wallis"], ["valais", "Wallis"], ["fr", "Freiburg"], ["fribourg", "Freiburg"],
  ["ag", "Aargau"], ["lu", "Luzern"], ["so", "Solothurn"], ["sh", "Schaffhausen"], ["zg", "Zug"],
  ["sz", "Schwyz"], ["ur", "Uri"], ["gl", "Glarus"], ["ow", "Obwalden"], ["nw", "Nidwalden"],
  ["ai", "Appenzell Innerrhoden"], ["ar", "Appenzell Ausserrhoden"],
  ["bl", "Basel-Landschaft"], ["bs", "Basel-Stadt"],
]);
export function canonKanton(k) {
  const s = String(k ?? "").trim().replace(/^kanton\s+/i, "").replace(/\s+/g, " ");
  if (!s) return "";
  if (DE_KANTONE.has(s)) return s;                       // exakter Treffer
  const aliased = KANTON_ALIAS.get(s.toLowerCase());
  if (aliased) return aliased;
  const stFix = s.replace(/^sankt\s+/i, "St. ");          // "Sankt Gallen" → "St. Gallen"
  if (DE_KANTONE.has(stFix)) return stFix;
  return s;  // unbekannt (z.B. nicht-DE-Kanton wie "Genf"/"Tessin") → kein DE-Match
}
// Liegt der (autoritative) Google-Kanton im Zielkanton?
export function kantonMatchesTarget(googleKanton, targetKanton) {
  return !!googleKanton && canonKanton(googleKanton) === targetKanton;
}
// Ist der Google-Kanton ein Deutschschweiz-Kanton?
export function isDeutschschweizKanton(googleKanton) {
  return DE_KANTONE.has(canonKanton(googleKanton));
}

// ── Branchen-/ICP-Filter (Ergebnis-Ebene) ──
// Offensichtliche Nicht-Sanitär-Treffer, die Google bei Ortssuchen reinmischt.
const BLOCK_TYPES = new Set([
  "lodging","hotel","tourist_attraction","museum","school","primary_school","secondary_school",
  "university","restaurant","cafe","bar","church","place_of_worship","local_government_office",
  "city_hall","park","campground","art_gallery","library","store","supermarket","real_estate_agency",
  "insurance_agency","bank","doctor","dentist","pharmacy","lawyer",
]);
const BLOCK_NAME_RE = /\b(hotel|gasthof|restaurant|schloss|museum|tourismus|verkehrsverein|bildung|beratung|landwirtschaft|gartenwelt|kirche|pfarr|gemeindeverwaltung|stadtverwaltung|verband|suissetec|genossenschaft\b)/i;
// Positive Sanitär-Signale (Name) — überschreibt schwache Block-Treffer.
const SANI_NAME_RE = /sanit|installat|haustechnik|geb(ä|ae)udetechnik|w(ä|ae)rmetechnik|energietechnik|heiz|spengl|gwh|gas[\s-]?wasser|klempn|bad(\s|umbau|sanierung)/i;
// Sanitär-nahe Google-Typen.
const SANI_TYPES = new Set(["plumber","general_contractor","contractor","home_goods_store","hardware_store","roofing_contractor","electrician"]);
// KLAR fremde Branchen (Name) — verwerfen, auch wenn Google einen generischen
// Typ wie general_contractor liefert (sonst rutscht z.B. eine Schreinerei durch).
// Ein echtes Sani-Namenssignal (SANI_NAME_RE) sticht das aber noch aus.
// Stämme ohne hintere Wortgrenze (sonst matcht "schreiner" nicht in "Schreinerei").
const HARD_NONSANI_RE = /\b(schreiner|zimmerei|zimmermann|gipser|maler|gartenbau|g(ä|ae)rtner|bodenleg|parkett|dachdeck|bedachung|elektr|metzg|b(ä|ae)cker|coiffure|carrosserie|autogarage)/i;

/**
 * Verwerfen, wenn klar Nicht-ICP. Name-Sanitärsignal sticht (verhindert
 * Fehlausschluss eines echten Betriebs, dessen Google-Typ unscharf ist).
 * @param {{name?:string, types?:string[]}} r
 * @returns {{blocked:boolean, reason:string}}
 */
export function isLikelyNonICP(r) {
  const name = String(r?.name ?? "");
  const types = Array.isArray(r?.types) ? r.types : [];
  // 1) Echtes Sani-Namenssignal sticht alles — nie fälschlich ausschließen.
  if (SANI_NAME_RE.test(name)) return { blocked: false, reason: "" };
  // 2) Klar fremde Branche im Namen → verwerfen, BEVOR ein generischer
  //    Google-Typ (general_contractor) sie durchwinkt.
  const hard = name.match(HARD_NONSANI_RE);
  if (hard) return { blocked: true, reason: `Branche:${hard[0]}` };
  // 3) Sonst: sanitär-naher Typ akzeptiert; harte Block-Typen/-Namen verwerfen.
  if (types.some((t) => SANI_TYPES.has(t))) return { blocked: false, reason: "" };
  const blockType = types.find((t) => BLOCK_TYPES.has(t));
  if (blockType) return { blocked: true, reason: `Typ:${blockType}` };
  const nameHit = name.match(BLOCK_NAME_RE);
  if (nameHit) return { blocked: true, reason: `Name:${nameHit[0]}` };
  return { blocked: false, reason: "" };
}
