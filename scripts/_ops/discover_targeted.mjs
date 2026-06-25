#!/usr/bin/env node
/**
 * discover_targeted.mjs — Output-basierter „Go": sammelt N NEUE Betriebe der
 * Zielgröße 1–3 Mitarbeiter, statt blind X zu crawlen.
 *
 * Vorgehen (kein Doppelaufwand — jede Firma genau 1× gecrawlt, place_id-Dedup):
 *   - Orte des Kantons scouten (Google Places via scout.mjs)
 *   - Kandidaten mit eigener, prüfbarer Website, NEU (place_id nicht in DB)
 *   - KLEINE FIRMEN ZUERST (wenige Google-Reviews = meist 1–3-Mann-Betrieb)
 *   - jeden Kandidaten sofort crawlen (crawl_extract → Größe/Inhaber/Mail),
 *     in die DB schreiben (crawl_to_leads, identitätstreu) und nach Größe bucketen:
 *       1–3   → zählt zum Ziel (deine Arbeitsliste)
 *       4–15  → gesammelt (für später)
 *       >15   → geparkt (>15-Tab)
 *   - Stop, sobald das Ziel erreicht ODER das Zeitbudget (CI) aufgebraucht ist.
 *
 * Reuse: scout.mjs + crawl_extract.mjs + crawl_to_leads.mjs (Unterprozesse).
 *
 * Lauf:
 *   node scripts/_ops/discover_targeted.mjs --kanton Thurgau --target 10 [--minutes 20] [--execute]
 *   Env: GOOGLE_SCOUT_KEY (+ Places für crawl) + SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { extractPlzOrt, isDeutschschweiz, isLikelyNonICP, kantonMatchesTarget, kantoneOfOrt } from "./_geo_icp.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(f) { const i = process.argv.indexOf(f); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null; }
const kanton = (getArg("--kanton") || "").trim();
const startGemeinde = (getArg("--start") || "").trim(); // optionaler Start-Ort; sonst Resume ab Frontier
const target = Math.max(1, parseInt(getArg("--target") || "10", 10) || 10);
const MINUTES = Math.max(2, parseInt(getArg("--minutes") || "20", 10) || 20);
const EXECUTE = process.argv.includes("--execute");
// Locate-Modus: nur lokalisieren + parken (Region-/Branchen-sauber), KEIN Crawl.
// Für den DE-weiten Sweep — billig die ganze Landkarte einsammeln, später crawlen.
const LOCATE = process.argv.includes("--locate-only");
if (!kanton) { console.error("ERROR: --kanton <Kanton> fehlt."); process.exit(1); }

const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const JSON_PATH = path.resolve(__dirname, "../../src/web/src/data/ch_gemeinden_de.json");
const byKanton = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
const orte = byKanton[kanton];
if (!orte) { console.error(`ERROR: Kanton "${kanton}" nicht in der Liste.`); process.exit(1); }

const SCOUT = path.resolve(__dirname, "scout.mjs");
const EXTRACT = path.resolve(__dirname, "crawl_extract.mjs");
const TOLEADS = path.resolve(__dirname, "crawl_to_leads.mjs");
const RAW = path.resolve(__dirname, "../../docs/sales/scout_raw.csv");

// ── Helpers (bewusst klein gehalten; gleiche Konventionen wie discover_to_leads) ──
function parseCsv(txt) {
  txt = txt.replace(/^﻿/, "");
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"' && txt[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else if (c === '"') q = true;
    else if (c === ";") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}
const txt = (s) => { const v = String(s ?? "").trim(); return v === "" ? null : v; };
const numOrNull = (s) => { const n = parseFloat(String(s ?? "").replace(",", ".")); return Number.isFinite(n) ? n : null; };
const intOrNull = (s) => { const n = parseInt(String(s ?? ""), 10); return Number.isFinite(n) ? n : null; };

const DIRECTORY_HOSTS = [
  "yellow.ch", "local.ch", "search.ch", "telsearch.ch", "tel.search.ch", "gelbeseiten", "moneyhouse.ch",
  "monetas.ch", "zefix.ch", "firmenwissen", "facebook.com", "instagram.com", "linkedin.com", "twitter.com",
  "x.com", "linktr.ee", "google.com", "g.page", "goo.gl", "business.site", "wixsite.com", "jimdofree.com",
  "jimdosite.com", "wordpress.com", "blogspot.", "sites.google.com",
];
function usableWebsite(rawUrl) {
  const u = txt(rawUrl); if (!u) return false;
  let host;
  try { host = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return false; }
  if (!host || !host.includes(".")) return false;
  return !DIRECTORY_HOSTS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d));
}
function slugFromUrl(u) {
  try {
    const h = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "");
    return h.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "betrieb";
  } catch { return "betrieb"; }
}
function sizeTier(v) {
  const m = String(v ?? "").match(/\d+/); if (!m) return "offen";
  const n = parseInt(m[0], 10);
  return n <= 3 ? "solo" : n <= 15 ? "premium" : "dq";
}

// „1–3 ?"-Heuristik: Größe blieb offen (keine explizite Zahl, keine Team-Seite),
// ABER die Signale deuten klar auf einen Kleinstbetrieb — Seite wurde geladen,
// kein Team-Verzeichnis (≤2 Namen, ≤1 Personen-Mail) und wenige Google-Reviews.
// Große Firmen haben reichhaltige Team-Seiten + viele Reviews. So landen echte
// 1–3 in der Arbeitsliste (mit „?"), statt in „Größe?" liegen zu bleiben.
function looksSolo(j, reviews) {
  const ev = (j && j.team_groesse && j.team_groesse.evidence) || {};
  const pages = (j && j._meta && j._meta.pages_crawled) || [];
  if (!pages.length) return false;                    // Seite nicht geladen → nichts wissen
  if ((ev.namen ?? 0) > 2 || (ev.mails ?? 0) > 1) return false; // Hinweis auf Team
  if (reviews != null && reviews > 25) return false;  // etablierter, größerer Player
  return true;
}

// Cross-Kanton-Flow: ab dem gewählten Kanton in JSON-Reihenfolge weiterrollen,
// wenn ein Kanton leer wird, bevor das Ziel erreicht ist (echter Dauer-Flow).
// --single-kanton schaltet das ab (nur der gewählte Kanton).
const allKantone = Object.keys(byKanton);
const startKi = allKantone.indexOf(kanton);
// Region-Sicherung: standardmäßig NUR der gewählte Kanton. Cross-Kanton-Roll nur
// mit ausdrücklichem --roll-kantone (falsche Region wäre verheerend).
const ROLL = process.argv.includes("--roll-kantone");
const kantonsToRun = ROLL && startKi >= 0 ? allKantone.slice(startKi) : [kanton];

(async () => {
  // Bereits erfasste place_ids (nie doppelt crawlen) + erfasste Orte (für Resume)
  const existing = new Set();
  const coveredOrte = new Set();
  {
    const { data, error } = await sb.from("leads").select("place_id, ort");
    if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
    (data || []).forEach((r) => { if (r.place_id) existing.add(r.place_id); if (r.ort) coveredOrte.add(String(r.ort).trim().toLowerCase()); });
  }

  const startedAt = Date.now();
  const deadline = startedAt + MINUTES * 60 * 1000;
  let smallFound = 0, estSolo = 0, crawled = 0, p415 = 0, p15 = 0, failed = 0, parked = 0;
  let regionRejected = 0, brancheRejected = 0;
  const scoutedOrte = [];
  const kantoneTouched = [];
  const env = { ...process.env };
  const timeLeft = () => Date.now() < deadline;

  console.log(`\n── Targeted Go (${EXECUTE ? "SCHREIBEN" : "DRY-RUN"}) — Ziel ${target} neue 1–3-Betriebe, Budget ${MINUTES} Min ──`);
  console.log(`   Kantone: ${kantonsToRun.join(" → ")}${ROLL ? " (rollt weiter bei Bedarf)" : " (nur dieser)"}\n`);

  for (const kt of kantonsToRun) {
    if (!timeLeft() || smallFound >= target) break;
    const orte = byKanton[kt];
    if (!orte || !orte.length) continue;

    // Resume nahtlos: zusammenhängendes erfasstes Präfix (A…) überspringen, am
    // Frontier weitermachen. Der Grenz-Ort wird nochmal gescoutet (falls letzter
    // Lauf mittendrin stoppte). --start gilt nur für den gewählten Erst-Kanton.
    let prefixEnd = 0;
    while (prefixEnd < orte.length && coveredOrte.has(orte[prefixEnd].toLowerCase())) prefixEnd++;
    let startIdx = Math.max(0, prefixEnd - 1);
    if (startGemeinde && kt === kanton) {
      const gi = orte.findIndex((o) => o.toLowerCase() === startGemeinde.toLowerCase());
      if (gi >= 0) startIdx = gi;
    }
    kantoneTouched.push(kt);
    console.log(`\n══ ${kt}: Start ab "${orte[startIdx]}" (Index ${startIdx}/${orte.length}, erfasstes Präfix bis ${prefixEnd}) ══`);

    for (let i = startIdx; i < orte.length; i++) {
      const ort = orte[i];
      if (!timeLeft() || smallFound >= target) break;
      // Voll erfasste Orte überspringen (außer dem Grenz-Ort, den wir fertig machen).
      if (coveredOrte.has(ort.toLowerCase()) && i !== prefixEnd - 1) continue;
      // Harte 3-Min-Grenze je Scout (sonst kann ein hängender Google-Fetch den
      // ganzen Job blockieren — der Crawl unten hat längst ein Timeout, der Scout fehlte).
      try { execFileSync("node", [SCOUT, "--gemeinde", `${ort} ${kt}`], { stdio: "inherit", env, timeout: 180000, killSignal: "SIGKILL" }); }
      catch (e) { console.log(`  scout-Fehler/Timeout bei ${ort}: ${e.message} — weiter.`); continue; }
      scoutedOrte.push(ort);
      if (!EXECUTE) continue;
      if (!fs.existsSync(RAW)) continue;

      // Kandidaten der Gemeinde: eigene, prüfbare Website ist PFLICHT (Betriebe ohne
      // Website werden nie berücksichtigt), NEU, dedupe — KLEINE FIRMEN ZUERST.
      const rows = parseCsv(fs.readFileSync(RAW, "utf-8"));
      const header = rows.shift(); if (!header) continue;
      const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
      const seen = new Set();
      const cands = [];
      for (const r of rows) {
        const placeId = txt(r[idx.place_id]);
        const firma = txt(r[idx.firma]);
        const website = txt(r[idx.website]);
        const adresse = txt(r[idx.adresse]);
        if (!placeId || seen.has(placeId) || existing.has(placeId)) continue;
        if (!firma || !usableWebsite(website)) continue; // Website Pflicht
        // Region-Sicherung auf ERGEBNIS-Ebene. Google liefert pro Ortssuche einen
        // Umkreis (auch Nachbarkanton-Treffer). Primär: AUTORITATIVER Kanton aus
        // addressComponents — löst Homonyme (Wetzikon TG vs ZH), die der Ortsname
        // allein NICHT trennen kann. Fallback (altes CSV ohne kanton-Spalte):
        // exakte Ort→Kanton-Mitgliedschaft. Locate prüft gegen die ganze DE-Schweiz.
        const { plz: realPlz, ort: realOrt } = extractPlzOrt(adresse);
        const gKanton = txt(r[idx.kanton]);
        let regionOk;
        if (LOCATE) {
          regionOk = isDeutschschweiz(realOrt);
        } else if (gKanton) {
          regionOk = kantonMatchesTarget(gKanton, kt);     // autoritativ — löst Homonyme
        } else {
          // Kein autoritativer Kanton (z.B. alte Zeile ohne kanton-Spalte): nur
          // akzeptieren, wenn der Ort EINDEUTIG im Zielkanton liegt. Homonyme
          // (Wetzikon TG/ZH) werden verworfen statt permissiv durchgewunken.
          const ks = kantoneOfOrt(realOrt);
          regionOk = ks.length === 1 && ks[0] === kt;
        }
        if (!realOrt || !regionOk) { regionRejected++; continue; }
        // Branchen-Filter: offensichtliche Nicht-Sanitär-Treffer (Hotel/Museum/
        // Schule/Verband …), die Google bei Ortssuchen reinmischt, verwerfen.
        const icp = isLikelyNonICP({ name: firma });
        if (icp.blocked) { brancheRejected++; console.log(`  ⤫ Branche (${icp.reason}): ${firma}`); continue; }
        seen.add(placeId);
        cands.push({
          place_id: placeId, firma, website, ort: realOrt, plz: realPlz, adresse,
          telefon: txt(r[idx.telefon]), rating: numOrNull(r[idx.google_rating]), reviews: intOrNull(r[idx.google_reviews]),
          tier: txt(r[idx.tier]), signale: txt(r[idx.reasons]), icp_score: intOrNull(r[idx.score]),
        });
      }
      // wenige Reviews zuerst (eher 1–3); null Reviews ganz vorne
      cands.sort((a, b) => (a.reviews ?? 0) - (b.reviews ?? 0));

      // ── PARKEN: JEDER (website-führende) Sani-Betrieb kommt ZUERST in die
      //    Kontaktliste — keiner rutscht durch, auch wenn Ziel/Zeit den Crawl danach
      //    kappt. Nur DB-Insert, kein Crawl. ──
      for (const c of cands) {
        existing.add(c.place_id);
        const ins = await sb.from("leads").insert({
          place_id: c.place_id, firma: c.firma, ort: c.ort, plz: c.plz, telefon: c.telefon, website: c.website,
          rating: c.rating, reviews: c.reviews, tier: c.tier, signale: c.signale, icp_score: c.icp_score,
          status: "neu", updated_at: new Date().toISOString(),
        });
        if (ins.error) { console.log(`  insert übersprungen (${c.firma}): ${ins.error.message}`); continue; }
        parked++;
      }

      // Locate-Modus: nur lokalisieren + parken (Region/Branche sauber), kein Crawl.
      if (LOCATE) continue;

      // ── CRAWLEN & EINSTUFEN: kleine zuerst. Eine angefangene Gemeinde wird KOMPLETT
      //    gecrawlt (vollständige Einteilung); nur die Zeit ist der harte Stop. Das
      //    Ziel steuert, ob ein NEUER Ort startet. ──
      for (const c of cands) {
        if (!timeLeft()) break;
        const wurl = c.website.startsWith("http") ? c.website : `https://${c.website}`;
        const slug = slugFromUrl(wurl);
        console.log(`\n>>> [${ort}] ${c.firma}  (${wurl})  · ${c.reviews ?? 0} Reviews`);
        crawled++;
        let size = null, jData = null;
        // Bis zu 2 Versuche: ein transienter Crawl-Fehler (Netz/Render) soll den
        // Betrieb nicht ungesized lassen. Harte 75s-Obergrenze je Versuch; kein
        // zweiter Versuch, wenn das Zeitbudget schon aufgebraucht ist.
        for (let attempt = 1; attempt <= 2; attempt++) {
          if (attempt === 2 && !timeLeft()) break;
          try {
            execFileSync("node", [EXTRACT, "--url", wurl, "--slug", slug], { stdio: "inherit", env, timeout: 75000, killSignal: "SIGKILL" });
            execFileSync("node", [TOLEADS, "--slug", slug, "--place-id", c.place_id, "--execute"], { stdio: "inherit", env });
            const jsonPath = path.resolve(__dirname, "../../docs/customers", slug, "crawl_extract.json");
            if (fs.existsSync(jsonPath)) {
              jData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
              size = jData.team_groesse && jData.team_groesse.value != null ? jData.team_groesse.value : null;
            }
            break; // Erfolg
          } catch (e) {
            if (attempt === 2) { failed++; console.log(`  Crawl-Fehler bei ${c.firma} (2 Versuche): ${e.message} — geparkt, Größe offen.`); }
            else console.log(`  Crawl-Fehler bei ${c.firma}: ${e.message} — 1 Wiederholung …`);
          }
        }

        const tier = sizeTier(size);
        if (tier === "solo") { smallFound++; console.log(`  → 1–3 ✓ (Ziel ${smallFound}/${target})`); }
        else if (tier === "premium") { p415++; console.log(`  → 4–15 (gesammelt)`); }
        else if (tier === "dq") { p15++; console.log(`  → >15 (geparkt)`); }
        else if (looksSolo(jData, c.reviews)) {
          // Größe blieb offen, aber Signale = Kleinstbetrieb → als „1–3 ?" in die Liste.
          await sb.from("leads").update({ ma_proxy: "1–3 ?" }).eq("place_id", c.place_id);
          smallFound++; estSolo++;
          console.log(`  → 1–3 ? (geschätzt: keine Team-Seite, wenige Reviews) (Ziel ${smallFound}/${target})`);
        } else { console.log(`  → Größe offen`); }
      }
    }
  }

  const mins = Math.round((Date.now() - startedAt) / 60000);
  console.log(`\n✓ Targeted Go${LOCATE ? " (LOCATE)" : ""}: ${smallFound} neue 1–3-Betriebe (Ziel ${target}, davon ${estSolo} geschätzt „1–3 ?") in ~${mins} Min.`);
  console.log(`   Geparkt gesamt ${parked} · Gecrawlt ${crawled} · 4–15 ${p415} · >15 ${p15} · Fehler ${failed} · Kantone [${kantoneTouched.join(", ")}] · Orte ${scoutedOrte.length}`);
  console.log(`   Region-Filter: ${regionRejected} außerhalb Kanton/DE verworfen · Branchen-Filter: ${brancheRejected} Nicht-Sanitär verworfen`);
  console.log(`   ${smallFound >= target ? "Ziel erreicht." : "Budget/Orte aufgebraucht — nächstes Go macht nahtlos weiter."} Erscheint in /ceo/journey.\n`);
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
