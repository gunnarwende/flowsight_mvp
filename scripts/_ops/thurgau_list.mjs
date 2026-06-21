#!/usr/bin/env node
/**
 * thurgau_list.mjs — vor-qualifizierte Thurgau-Kontaktliste (einmaliger Lauf).
 *
 * Liest scout_raw.csv → Thurgau + Sanitär/Heizung + lebende Website → crawlt jeden Betrieb
 * (Home + Über-uns/Team, Screenshot) → EIN kombinierter Claude-Call (Text+Bild) liefert:
 *   - Entscheider (bis 2 GL, je Anrede Herr/Frau + Name + Rolle + Mail)
 *   - Team-Größe (Köpfe auf der Team-Seite zählen)  - Leistungen  - core/Büro  - Confidence
 * Mail zusätzlich aus mailto/Text. Filter: Kern-Gewerk, Größe ≤ ~13, Inhaber gefunden (sonst "?").
 *
 * Regeln (Founder 18.06., docs/sales/crawl_feedback.md):
 *   Inhaber immer "Herr/Frau Name"; zwei GL → beide; nicht findbar → "?". Größe via Screenshot zählen, sonst "?".
 *   Mail immer versuchen (kein Ausschluss). Website tot/„im Aufbau" → raus.
 *
 * Output: docs/sales/thurgau_leads.json (inkrementell geschrieben).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/thurgau_list.mjs --test 2     # 2 Betriebe, Vordergrund
 *   node --env-file=src/web/.env.local scripts/_ops/thurgau_list.mjs --limit 34   # voller Lauf
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");
const OUT = path.resolve(__dirname, "../../docs/sales/thurgau_leads.json");

const A = process.argv;
const arg = (n, d) => { const i = A.indexOf(n); return i >= 0 && A[i + 1] && !A[i + 1].startsWith("--") ? A[i + 1] : d; };
const TEST = A.includes("--test") ? Number(arg("--test", 2)) : 0;
const LIMIT = Number(arg("--limit", 34));

// 6 Keeper (Founder behalten) — per Namensteil
const KEEPERS = ["serafini", "rickenbach", "musa", "hutt gmbh", "schäfli", "schütz gebäudetechnik"];
// bereits abtelefoniert/raus → nicht erneut
const SKIP = ["pierre sanitär design", "mb haustechnik", "rellstab"];

const TG_RX = /(Frauenfeld|Kreuzlingen|Amriswil|Weinfelden|Romanshorn|Arbon|Sirnach|Aadorf|Münchwilen|Bischofszell|Steckborn|Tägerwilen|Müllheim|Eschlikon|Wängi|Bürglen|Sulgen|Kradolf|Erlen|Bottighofen|Gachnang|Felben|Matzingen|Stettfurt|Diessenhofen|Egnach|Güttingen|Kesswil|Roggwil|Hauptwil|Affeltrangen|Wigoltingen|Märstetten|Pfyn|Hüttlingen|Thundorf|Lommis|Berg|Uttwil|Sommeri)/i;
const CORE_RX = /sanit[äa]r|heiz|haustechnik|installat|spengler|geb[äa]udetechnik|h[äa]ustechnik/i;
const NONCORE_RX = /\b(bau|baugesch|maurer|maler|gartenbau|k[üu]chen|ausstellung|architekt|immobil|garage|elektro)\b/i;
const DIR_RX = /yellow\.|local\.ch|search\.ch|tel\.search/i;

function csvParse(txt) {
  txt = txt.replace(/^﻿/, ""); const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < txt.length; i++) { const c = txt[i];
    if (q) { if (c === '"' && txt[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ";") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else if (c === "\r") {} else f += c; }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// ── Kandidaten wählen ────────────────────────────────────────────────
function pickCandidates() {
  const rows = csvParse(fs.readFileSync(RAW, "utf-8"));
  const h = rows.shift(); const ix = Object.fromEntries(h.map((c, i) => [c, i]));
  const all = rows.map((r) => ({
    firma: r[ix.firma], website: r[ix.website], ort: (r[ix.adresse] || "").match(/\d{4}\s+(.+)$/)?.[1] || r[ix.ort] || "",
    adresse: r[ix.adresse] || "", telefon: r[ix.telefon] || "", rating: r[ix.google_rating] || "",
    reviews: r[ix.google_reviews] || "", score: Number(r[ix.score]) || 0, place_id: r[ix.place_id] || "",
  })).filter((c) => c.firma && /^https?:\/\//.test(c.website || "") && !DIR_RX.test(c.website));
  const isTG = (c) => TG_RX.test(c.adresse) || TG_RX.test(c.ort);
  const isCore = (c) => CORE_RX.test(c.firma) || CORE_RX.test(c.website);
  const isNonCore = (c) => NONCORE_RX.test(c.firma) && !CORE_RX.test(c.firma);
  const keep = (c) => KEEPERS.some((k) => norm(c.firma).includes(norm(k)));
  const skip = (c) => SKIP.some((k) => norm(c.firma).includes(norm(k)));
  const tg = all.filter((c) => isTG(c) && !skip(c));
  const keepers = tg.filter(keep);
  const rest = tg.filter((c) => !keep(c) && isCore(c) && !isNonCore(c))
    .sort((a, b) => (b.score - a.score) || (Number(b.reviews) - Number(a.reviews)));
  // dedupe per Firma
  const seen = new Set(); const dedup = (arr) => arr.filter((c) => { const k = norm(c.firma); if (seen.has(k)) return false; seen.add(k); return true; });
  const out = dedup([...keepers, ...rest]).slice(0, LIMIT);
  return { out, nKeep: keepers.length };
}

// ── Crawl (Home + Über-uns/Team) + Screenshot ────────────────────────
const SUB_RX = /(ueber|über|uber|about|team|mitarbeiter|kontakt|impressum|crew|unternehmen|firma|wir-|leistung|angebot|service|dienstleist)/i;
const TEAM_RX = /(ueber|über|uber|team|mitarbeiter|crew|unternehmen)/i;
async function crawlSite(browser, url) {
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 }, locale: "de-CH", ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  const out = { pages: [], shotBuf: null, alive: false, underConstruction: false };
  const visit = async (u) => {
    try { const r = await page.goto(u, { waitUntil: "domcontentloaded", timeout: 15000 });
      if (!r || r.status() >= 400) return null; await page.waitForTimeout(2200);
      return await page.evaluate(() => ({ text: document.body.innerText || "", html: document.documentElement.outerHTML || "" }));
    } catch { return null; }
  };
  const home = await visit(url);
  let origin = url; try { origin = new URL(url).origin; } catch {}
  if (home && home.text.trim().length > 40) {
    out.alive = true; out.pages.push({ url, ...home });
    if (/(im aufbau|wird in den n[äa]chsten|under construction|baustelle|coming soon|relaunch)/i.test(home.text)) out.underConstruction = true;
    const links = await page.evaluate(() => Array.from(document.querySelectorAll("a[href]")).map((a) => ({ href: a.href, text: (a.textContent || "").trim() })));
    const seen = new Set([url]); const cands = [];
    for (const l of links) { if (!l.href || !l.href.startsWith(origin)) continue;
      if (!(SUB_RX.test(l.href) || SUB_RX.test(l.text))) continue;
      const clean = l.href.split("#")[0]; if (seen.has(clean)) continue; seen.add(clean); cands.push(clean); if (cands.length >= 6) break; }
    for (const c of cands) { const d = await visit(c); if (d && d.text.trim().length > 80) out.pages.push({ url: c, ...d }); }
    const teamPage = out.pages.filter((p) => TEAM_RX.test(p.url)).sort((a, b) => b.text.length - a.text.length)[0]
      || out.pages.slice().sort((a, b) => b.text.length - a.text.length)[0];
    if (teamPage) { try { await page.goto(teamPage.url, { waitUntil: "domcontentloaded", timeout: 15000 }); await page.waitForTimeout(1800);
      out.shotBuf = await page.screenshot({ fullPage: true }); } catch {} }
  }
  await ctx.close();
  return out;
}
function scanMails(pages) {
  const html = pages.map((p) => p.html).join("\n"); const text = pages.map((p) => p.text).join("\n");
  const set = new Set();
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) set.add(m[1].toLowerCase());
  for (const m of text.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)) set.add(m[0].toLowerCase());
  return [...set];
}
// Text-Muster: "Geschäftsführer/Inhaber: Name" bzw. "Name, Inhaber" (aus crawl_extract.mjs)
const OWNER_RX = [
  /(?:Gesch[aä]ftsf[uü]hr(?:er|ung)|Inhaber(?:in)?|Gesch[aä]ftsleitung|Eigent[uü]mer|vertreten durch)[\s:.,–-]+([A-ZÄÖÜ][a-zäöüéèê]+\s+[A-ZÄÖÜ][a-zäöüéèê]+(?:\s+[A-ZÄÖÜ][a-zäöüéèê]+)?)/g,
  /([A-ZÄÖÜ][a-zäöüéèê]+\s+[A-ZÄÖÜ][a-zäöüéèê]+(?:\s+[A-ZÄÖÜ][a-zäöüéèê]+)?)\s*[,–-]\s*(?:Gesch[aä]ftsf[uü]hr(?:er|ung)|Inhaber(?:in)?|Gesch[aä]ftsleitung)/g,
];
function regexOwners(pages) {
  const text = pages.map((p) => p.text).join("\n"); const found = [];
  for (const rx of OWNER_RX) { let m; while ((m = rx.exec(text))) { const n = m[1].trim(); if (n.length > 4 && !found.includes(n)) found.push(n); } }
  return found.slice(0, 2);
}
// Größe NUR aus expliziter Textangabe — Foto-Köpfe-Zählen ist unzuverlässig (Founder 18.06.). Sonst null → "?".
function sizeFromText(text) {
  const t = (text || "").replace(/\s+/g, " ");
  const m = t.match(/Team\s+von\s+(?:rund\s+|ca\.?\s+|über\s+|gut\s+)?(\d{1,3})/i)
    || t.match(/(\d{1,3})\s*[-–]?\s*k[öo]pfig/i)
    || t.match(/(?:rund|ca\.?|über|mehr als|gut|knapp)\s+(\d{1,3})\s+(?:Mitarbeit|Besch[äa]ftigt|Angestellt|Fachle|Fachkr|Mitgliede)/i)
    || t.match(/(\d{1,3})\s+(?:Mitarbeit(?:er|ende|enden|erinnen)?|Besch[äa]ftigte|Angestellte|Fachleute|Fachkr[äa]fte|Mitgliede)/i);
  if (m) { const n = Number(m[1]); if (n >= 1 && n <= 400) return n; }
  return null;
}

// ── Claude: kombiniert Text + Screenshot → strukturierte Felder ──────
async function analyze(firma, teamText, shotBuf, mails, ownerHint) {
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return null;
  const prompt = `Schweizer Sanitär-/Heizungsbetrieb "${firma}". Unten Text der Über-uns/Team/Leistungen/Impressum-Seite + (falls vorhanden) ein Screenshot der Team-Seite + gefundene Mail-Adressen.
Per Textmuster gefundene mögliche Entscheider (prüfen + nutzen, wenn plausibel echte Personen): ${JSON.stringify(ownerHint || [])}.
Gib NUR valides JSON zurück, keine Erklärung:
{"deciders":[{"salutation":"Herr"|"Frau"|null,"name":"VOLLER PERSONENNAME","role":"...","email":"... oder null"}],
 "team_size": <Zahl klar erkennbarer Personen/Köpfe ODER null>,
 "leistungen": "<kurze Komma-Liste der angebotenen Leistungen, z.B. Sanitär, Heizung, Spenglerei, Bad-Sanierung>",
 "is_core_sanitaer_heizung": <true|false>,
 "has_office_reception": <true|false>,
 "confidence":"hoch"|"mittel"|"niedrig"}
Regeln:
- 'deciders': Geschäftsführer/Inhaber/GL des KERN-Bereichs Sanitär/Heizung. Gibt es ZWEI gleichrangige GL, beide aufnehmen (max 2). NIE Techniker, NIE "info@", NIE den Firmennamen als Person.
- 'salutation': Herr/Frau aus dem Namen/Foto ableiten; unklar → null.
- 'team_size': Köpfe auf der Team-Seite zählen (Screenshot bevorzugt). Unklar → null.
- Keine klare Führungsperson sichtbar → deciders:[] und confidence:"niedrig".
Mails: ${JSON.stringify(mails)}
Text:
${(teamText || "").slice(0, 6000)}`;
  const content = [{ type: "text", text: prompt }];
  if (shotBuf) content.unshift({ type: "image", source: { type: "base64", media_type: "image/png", data: shotBuf.toString("base64") } });
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 900, messages: [{ role: "user", content }] }),
    });
    if (!res.ok) { console.log(`  [llm] HTTP ${res.status}`); return null; }
    const j = await res.json(); const m = (j.content?.[0]?.text || "").match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e) { console.log(`  [llm] ${e.message.slice(0, 80)}`); return null; }
}

function fmtInhaber(deciders) {
  const ds = (deciders || []).filter((d) => d && d.name && d.name.length > 2).slice(0, 2);
  if (!ds.length) return "?";
  return ds.map((d) => `${d.salutation ? d.salutation + " " : ""}${d.name}`.trim()).join(", ");
}
function tariffFor(ma) { if (ma == null) return "TBD"; if (ma <= 3) return "Solo (950)"; if (ma <= 12) return "Premium (2000)"; return "DQ (zu gross)"; }

async function main() {
  const { out: cands, nKeep } = pickCandidates();
  const list = TEST ? cands.slice(0, TEST) : cands;
  console.log(`thurgau_list: ${list.length} Betriebe${TEST ? " [TEST]" : ""} (Keeper: ${nKeep})`);
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    console.log(`\n[${i + 1}/${list.length}] ${c.firma} — ${c.website}`);
    let rec = { ...c, inhaber: "?", deciders: [], ma: null, tarif: "TBD", mail: "", leistungen: "?", core: null, office: null, confidence: null, alive: false, flag: "" };
    try {
      const site = await crawlSite(browser, c.website);
      rec.alive = site.alive;
      if (!site.alive) { rec.flag = "Website tot"; console.log("  ✗ Website nicht erreichbar"); }
      else if (site.underConstruction) { rec.flag = "im Aufbau"; console.log("  ⚠ Website im Aufbau"); }
      else {
        const mails = scanMails(site.pages);
        const teamText = site.pages.slice().sort((a, b) => b.text.length - a.text.length)[0]?.text || "";
        const ownerHint = regexOwners(site.pages);
        const allText = site.pages.map((p) => p.text).join("\n");
        // Größe NUR aus expliziter Textangabe (Founder 18.06.). Foto-Köpfe-Zählen ist unzuverlässig → sonst "?".
        rec.ma = sizeFromText(allText);
        // Größe-Risiko: viele Reviews + Größe unbekannt → evtl. zu gross (du zählst).
        if (rec.ma == null && Number(r.reviews) > 40) rec.flag = (rec.flag ? rec.flag + " · " : "") + "viele Reviews — Größe prüfen (evtl. >13)";
        const a = await analyze(c.firma, teamText, site.shotBuf, mails, ownerHint);
        if (a) {
          rec.confidence = a.confidence || null;
          // S13: NIE raten. Der Regex-Hint (ownerHint) ist NUR ein Hinweis an die KI, NIE eine eigenständige Antwort.
          // Ist die KI selbst unsicher (confidence "niedrig") → KEIN Name, sondern "?". Ein falscher Name ist katastrophal, "?" ist harmlos.
          rec.deciders = (rec.confidence === "niedrig") ? [] : (a.deciders || []);
          rec.inhaber = fmtInhaber(rec.deciders);
          rec.tarif = tariffFor(rec.ma);
          rec.leistungen = a.leistungen || "?";
          rec.core = a.is_core_sanitaer_heizung; rec.office = a.has_office_reception;
          // Mail: Entscheider-Mail bevorzugt, sonst erste Personen-Mail, sonst erste Mail
          const dMail = (a.deciders || []).map((d) => d && d.email).find(Boolean);
          const person = mails.find((e) => !/^(info|kontakt|office|mail|service|contact|admin)@/.test(e));
          rec.mail = (dMail || person || mails[0] || "").toLowerCase();
        }
        console.log(`  → Inhaber: ${rec.inhaber} | MA: ${rec.ma ?? "?"} (${rec.tarif}) | Mail: ${rec.mail || "?"} | ${rec.leistungen}`);
      }
    } catch (e) { rec.flag = "Crawl-Fehler"; console.log(`  ✗ ${e.message.slice(0, 80)}`); }
    results.push(rec);
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2), "utf-8"); // inkrementell sichern
  }
  await browser.close();
  console.log(`\n✅ ${results.length} Betriebe → ${path.relative(process.cwd(), OUT)}`);
}
main();
