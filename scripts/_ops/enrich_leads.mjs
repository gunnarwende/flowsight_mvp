#!/usr/bin/env node
/**
 * enrich_leads.mjs — Lead-Motor P12: Entscheider + Größe (=Preis-Schalter) + Mail anreichern.
 *
 * Behebt den Leins-`/Ueber-uns.htm`-Fehler: statt feste Pfade zu raten, werden ALLE Links der
 * Startseite gelesen und die passenden (über-uns/team/kontakt — jede Schreibweise/Endung) verfolgt.
 * Schichten: (1) robustes Link-Following + (2) Raw-HTML/mailto-Scan + (3) Vision-Fallback (Claude).
 *
 * Schreibt in den Cache `docs/sales/leads_enriched.json` (key = normalisierter Firmenname).
 * `build_leads.mjs` merged ihn (Priorität: manueller Override > Anreicherung > Review-Proxy) → leads.csv.
 * So überschreibt ein build_leads-Re-Run die Anreicherung NIE.
 *
 * SSOT: docs/gtm/sales/SALES_BIBLE.md §3 (ICP/Tarif), §11 (Vorbereitungsblatt), §14 (Lead-Motor).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/enrich_leads.mjs --url https://www.leinsag.ch/ --firma "Leins AG"
 *   node --env-file=src/web/.env.local scripts/_ops/enrich_leads.mjs --ring 0 [--limit 6]
 *   node --env-file=src/web/.env.local scripts/_ops/enrich_leads.mjs --all
 *   Flags: --no-vision (nur Text, kein API-Call) · --dry-run (nicht schreiben)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS = path.resolve(__dirname, "../../docs/sales/leads.csv");
const CACHE = path.resolve(__dirname, "../../docs/sales/leads_enriched.json");

const A = process.argv;
const arg = (n, d) => { const i = A.indexOf(n); return i >= 0 && A[i + 1] && !A[i + 1].startsWith("--") ? A[i + 1] : d; };
const URL_ = arg("--url"); const FIRMA = arg("--firma");
const RING = arg("--ring"); const ALL = A.includes("--all");
const LIMIT = Number(arg("--limit", 8));
const NO_VISION = A.includes("--no-vision");
const DRY = A.includes("--dry-run");

const GENERIC = new Set(["info","kontakt","contact","office","mail","admin","hello","hallo","welcome",
  "sekretariat","buchhaltung","empfang","team","post","service","mailbox","webmaster","noreply","no-reply"]);
const ROLE_RX = /(gesch[äa]ftsf[üu]hr|gesch[äa]ftsleit|inhaber|mitinhaber|\bGL\b|betriebsleit|sanit[äa]r|heizung|leitung|chef|partner|prokurist)/i;
const CORE_RX = /sanit[äa]r|heizung|haustechnik|installat|spengler|geb[äa]udetechnik/i;
const OFFICE_RX = /sekretariat|empfang|b[üu]ro|disposition|kundendienst|hotline|zentrale/i;

function normName(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(gmbh|ag|sa|sàrl|sarl)\b/g, "").replace(/[^a-z0-9& ]/g, "").replace(/\s+/g, " ").trim();
}
function csvParse(txt) {
  txt = txt.replace(/^﻿/, ""); const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < txt.length; i++) { const c = txt[i];
    if (q) { if (c === '"' && txt[i+1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ";") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else if (c === "\r") {} else f += c; }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

// ── Crawl: Home + robust entdeckte Unterseiten ───────────────────────
const SUBPAGE_RX = /(ueber|über|uber|about|team|mitarbeiter|kontakt|crew|unternehmen|firma|wir-|ueber-uns)/i;
async function crawlSite(url) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 }, locale: "de-CH", ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  const out = { pages: [], shotPage: null, shotBuf: null };
  async function visit(u) {
    try {
      const r = await page.goto(u, { waitUntil: "domcontentloaded", timeout: 15000 });
      if (!r || r.status() >= 400) return null;
      await page.waitForTimeout(2500);
      const data = await page.evaluate(() => ({
        text: document.body.innerText || "", html: document.documentElement.outerHTML || "",
      }));
      return data.text ? data : null;
    } catch { return null; }
  }
  const home = await visit(url);
  let origin = url; try { origin = new URL(url).origin; } catch {}
  if (home) {
    out.pages.push({ url, ...home });
    // ALLE Links lesen, passende (über-uns/team/kontakt) same-origin verfolgen
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]")).map((a) => ({ href: a.href, text: (a.textContent || "").trim() })));
    const seen = new Set([url]);
    const cands = [];
    for (const l of links) {
      if (!l.href || !l.href.startsWith(origin)) continue;
      if (!(SUBPAGE_RX.test(l.href) || SUBPAGE_RX.test(l.text))) continue;
      const clean = l.href.split("#")[0];
      if (seen.has(clean)) continue; seen.add(clean); cands.push(clean);
      if (cands.length >= 6) break;
    }
    for (const c of cands) {
      const d = await visit(c);
      if (d && d.text.trim().length > 80) out.pages.push({ url: c, ...d });
    }
    // Screenshot der inhaltsreichsten Über-uns/Team-Seite (für Vision-Fallback)
    const teamPage = pickTeamPage(out.pages);
    if (teamPage) {
      try { await page.goto(teamPage.url, { waitUntil: "domcontentloaded", timeout: 15000 }); await page.waitForTimeout(2000);
        out.shotBuf = await page.screenshot({ fullPage: true }); out.shotPage = teamPage.url; } catch {}
    }
  }
  await browser.close();
  return out;
}

// ── Extraktion aus Text/HTML ─────────────────────────────────────────
function extractFromPages(pages) {
  const allText = pages.map((p) => p.text).join("\n");
  const allHtml = pages.map((p) => p.html).join("\n");
  // Mails: mailto + roh
  const mails = new Set();
  for (const m of allHtml.matchAll(/mailto:([^"'?>\s]+)/gi)) mails.add(m[1].toLowerCase());
  for (const m of allText.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)) mails.add(m[0].toLowerCase());
  const all = [...mails];
  const person = all.filter((e) => !GENERIC.has(e.split("@")[0].split(/[._-]/)[0]));
  // Größen-Proxy: Personen-Mails ODER Rollen-Treffer auf der Team-Seite
  const roleHits = (allText.match(new RegExp(ROLE_RX.source, "gi")) || []).length;
  const sizeText = Math.max(person.length, Math.min(roleHits, 12)) || null;
  const core = CORE_RX.test(allText);
  const office = OFFICE_RX.test(allText);
  return { mails: all, person, sizeText, core, office };
}

// ── Team-Seite priorisieren (über-uns/team vor kontakt) ──────────────
const TEAM_RX = /(ueber|über|uber|team|mitarbeiter|crew|unternehmen)/i;
function pickTeamPage(pages) {
  return pages.filter((p) => TEAM_RX.test(p.url)).sort((a, b) => b.text.length - a.text.length)[0]
    || pages.filter((p) => SUBPAGE_RX.test(p.url)).sort((a, b) => b.text.length - a.text.length)[0]
    || pages.slice().sort((a, b) => b.text.length - a.text.length)[0];
}

// ── Entscheider aus Text (Claude, kein Bild) — primär, wenn Text reich ─
async function llmDecider(teamText, mails) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const prompt = `Text der "Über uns/Team"-Seite eines Schweizer Sanitär-/Heizungsbetriebs + gefundene Mitarbeiter-Mails.
Bestimme den ENTSCHEIDER für ein Telefon-/Erreichbarkeits-Produkt: die Geschäftsleitung des KERN-Bereichs
Sanitär/Heizung (NICHT der Gründer falls operativ raus, NICHT ein Techniker, NICHT "info@"). Ordne ihm seine
persönliche Mail aus der Liste zu. Antworte NUR mit JSON, keine Erklärung:
{"decider":{"name":"VOLLER PERSONENNAME","role":"...","email":"..."},"team_size":<Zahl|null>,"is_core_sanitaer_heizung":<bool>,"has_office_reception":<bool>,"confidence":"hoch"|"mittel"|"niedrig"}
'name' MUSS ein echter Personenname sein, NIEMALS der Firmenname; bei Unsicherheit decider null + confidence "niedrig".
Mails: ${JSON.stringify(mails)}
Text:
${(teamText || "").slice(0, 6000)}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) { console.log(`  [llm] HTTP ${res.status}`); return null; }
    const j = await res.json(); const txt = j.content?.[0]?.text || "";
    const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null;
  } catch (e) { console.log(`  [llm] ${e.message.slice(0, 80)}`); return null; }
}

// ── Vision-Fallback (Claude) ─────────────────────────────────────────
async function visionRead(buf) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !buf) return null;
  const prompt = `Dies ist ein Screenshot der "Über uns/Team/Kontakt"-Seite eines Schweizer Handwerksbetriebs (Sanitär/Heizung).
Gib NUR valides JSON zurück, keine Erklärung:
{"team_size": <Zahl klar sichtbarer Personen/Köpfe oder null>,
 "deciders": [{"name":"VOLLER PERSONENNAME (Vor- + Nachname)","role":"...","email":"... oder null"}],
 "is_core_sanitaer_heizung": <true/false>,
 "has_office_reception": <true/false>,
 "confidence": "hoch"|"mittel"|"niedrig"}
Regeln: 'name' MUSS ein echter Personenname sein, NIEMALS der Firmenname. Geschäftsführer/Inhaber/GL des Kern-Bereichs Sanitär/Heizung zuerst (nicht Techniker, nicht "info@"). Wenn keine klare Person mit Führungsrolle sichtbar ist: deciders:[] und confidence:"niedrig".`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 1024,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: buf.toString("base64") } },
          { type: "text", text: prompt },
        ] }],
      }),
    });
    if (!res.ok) { console.log(`  [vision] HTTP ${res.status}`); return null; }
    const j = await res.json();
    const txt = j.content?.[0]?.text || "";
    const m = txt.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch (e) { console.log(`  [vision] ${e.message.slice(0, 80)}`); return null; }
}

function tariffFor(ma) {
  if (ma == null) return "TBD (Crawl)";
  if (ma <= 3) return "Solo (950)";
  if (ma <= 12) return "Premium (2000)";
  return "DQ (zu groß)";
}

async function enrichOne(firma, url) {
  console.log(`\n▸ ${firma} — ${url}`);
  const site = await crawlSite(url);
  if (!site.pages.length) { console.log("  ✗ keine Seite erreichbar"); return null; }
  console.log(`  Seiten: ${site.pages.map((p) => p.url.replace(/^https?:\/\//, "")).join(", ")}`);
  const t = extractFromPages(site.pages);
  console.log(`  Text: ${t.person.length} Personen-Mail(s) [${t.person.join(", ") || "—"}], size~${t.sizeText ?? "?"}, core=${t.core}`);

  // Eindeutig bei 1 Personen-Mail; sonst entscheidet die KI (S6: GL Kern-Bereich), nicht „erste".
  // Text-reiche Über-uns-Seite → Claude im TEXT-Modus (zuverlässiger als Screenshot); sonst Vision-Fallback.
  let ma = t.sizeText, decider = null, role = null, mail = t.person.length === 1 ? t.person[0] : null, office = t.office, core = t.core, src = "text", confidence = null;
  const teamText = (pickTeamPage(site.pages) || {}).text || "";
  let a = null;
  if (!NO_VISION) {
    if (teamText.length > 300 && t.person.length) { console.log("  → KI Text-Entscheider…"); a = await llmDecider(teamText, t.mails); if (a) src = "llm-text"; }
    if (!a) { console.log("  → Vision-Fallback…"); a = await visionRead(site.shotBuf); if (a) src = "vision"; }
  }
  if (a) {
    if (a.team_size) ma = a.team_size;
    if (typeof a.is_core_sanitaer_heizung === "boolean") core = a.is_core_sanitaer_heizung;
    if (typeof a.has_office_reception === "boolean") office = a.has_office_reception;
    const d0 = a.decider || (a.deciders || [])[0];
    if (d0 && d0.name && normName(d0.name) !== normName(firma)) { decider = d0.name; role = d0.role || null; if (d0.email) mail = String(d0.email).toLowerCase(); }
    confidence = a.confidence || null;
    console.log(`  [${src}] size=${ma ?? "?"} decider=${decider || "—"} (${role || "?"}) mail=${mail || "—"} core=${core} conf=${confidence || "?"}`);
  }
  const inhaberTel = ma != null ? (ma <= 3 ? "ja" : office ? "nein" : "?") : "?";
  return {
    firma, url, entscheider: decider, rolle: role, mail, ma: ma ?? null, tariff: tariffFor(ma),
    inhaber_am_telefon: inhaberTel, core, size_source: src, confidence, mails_all: t.mails,
    enriched_at: new Date().toISOString().slice(0, 10),
  };
}

// ── Targets bestimmen ────────────────────────────────────────────────
function targetsFromLeads() {
  const rows = csvParse(fs.readFileSync(LEADS, "utf-8"));
  const h = rows.shift(); const ix = Object.fromEntries(h.map((c, i) => [c, i]));
  return rows.map((r) => ({ firma: r[ix.firma], url: r[ix.website], ring: r[ix.ring],
      tariff: r[ix.tariff], entscheider: r[ix.entscheider] }))
    .filter((t) => t.url && /^https?:\/\//.test(t.url));
}

async function main() {
  let targets = [];
  if (URL_) targets = [{ firma: FIRMA || URL_, url: URL_ }];
  else {
    targets = targetsFromLeads();
    if (RING) targets = targets.filter((t) => t.ring === RING);
    if (!ALL && !RING) { console.error("Bitte --url, --ring <0|1> oder --all angeben."); process.exit(1); }
    // bevorzugt noch nicht angereicherte (TBD / kein Entscheider); offensichtliche Nicht-Sanitär (Bau/Küchen/Planung) überspringen (spart Calls)
    const NC = /\b(bau|renovation|energieberatung|planung|kuchen|küchen|ausstellung)\b/i;
    const CO = /sanit|heiz|haustechnik|installat|spengler/i;
    targets = targets
      .filter((t) => (t.tariff?.startsWith("TBD") || !t.entscheider) && !(NC.test(t.firma) && !CO.test(t.firma)) && !/yellow\.|local\.ch/i.test(t.url || ""))
      .slice(0, LIMIT);
  }
  console.log(`enrich_leads: ${targets.length} Betrieb(e)${NO_VISION ? " (nur Text)" : ""}${DRY ? " [DRY]" : ""}`);

  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf-8")) : {};
  for (const t of targets) {
    const e = await enrichOne(t.firma, t.url);
    if (e) cache[normName(t.firma)] = e;
  }
  if (DRY) { console.log("\n[DRY] nicht geschrieben.\n" + JSON.stringify(cache, null, 2).slice(0, 1500)); return; }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2), "utf-8");
  console.log(`\n✅ Cache: ${path.relative(process.cwd(), CACHE)} (${Object.keys(cache).length} Einträge)`);
  console.log("→ jetzt 'node scripts/_ops/build_leads.mjs' für leads.csv/leads.md.");
}
main();
