#!/usr/bin/env node
/**
 * analyze_leads.mjs — READ-ONLY Tiefen-Audit der leads-Tabelle.
 *
 * Greift NICHT in laufende Runs ein (nur SELECT). Prüft jeden Lead auf die
 * 7 Qualitäts-Dimensionen und gibt eine kategorisierte Auswertung + eine
 * verteilte Stichprobe (N quer über die Liste) in den Log aus.
 *
 *   Dim 1 Region        — liegt der Ort wirklich im erwarteten Kanton? (Bleed?)
 *   Dim 2 Sprache       — liegt der Ort in einer NICHT-deutschen Region? (Romandie/TI/RR)
 *   Dim 3 Website       — eigene, prüfbare Seite? (kein Verzeichnis/Social)
 *   Dim 4 ICP/Sanitär   — sieht es nach echtem Sanitär-Betrieb aus?
 *   Dim 5 Kontakt       — Entscheider / Mail / Telefon vorhanden?
 *   Dim 6 Dubletten     — place_id / Domain / firma+ort doppelt?
 *   Dim 7 Größe/Flag    — Bucket-Verteilung + "1–3 ?"-Plausibilität
 *
 * Lauf: node scripts/_ops/analyze_leads.mjs [--sample 20] [--kanton Thurgau]
 *   Env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(f) { const i = process.argv.indexOf(f); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null; }
const SAMPLE = Math.max(1, parseInt(getArg("--sample") || "20", 10) || 20);
const expectKanton = (getArg("--kanton") || "").trim();

const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

// ── Gemeinde→Kanton-Index (für Region- + Sprach-Check) ──
const byKanton = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../src/web/src/data/ch_gemeinden_de.json"), "utf-8"));
const ortToKanton = new Map();
for (const k of Object.keys(byKanton)) for (const o of byKanton[k]) ortToKanton.set(String(o).trim().toLowerCase(), k);

// Bekannte nicht-deutsche Orte, die im "_de"-File leaken (frz. Unterwallis, Berner Jura, zweisprachig).
// Heuristik fürs Audit — NICHT die Produktiv-Grenze, nur Sichtbarmachung des Bleed-Risikos.
const NON_DE_ORTE = new Set(["sion","sierre","moutier","biel","bienne","fribourg","freiburg im üechtland","murten","morat","leuk","loèche","siders","sitten"].map(s=>s.toLowerCase()));

const DIRECTORY_HOSTS = ["yellow.ch","local.ch","search.ch","telsearch.ch","tel.search.ch","gelbeseiten","moneyhouse.ch","monetas.ch","zefix.ch","firmenwissen","facebook.com","instagram.com","linkedin.com","twitter.com","x.com","linktr.ee","google.com","g.page","goo.gl","business.site","wixsite.com","jimdofree.com","jimdosite.com","wordpress.com","blogspot.","sites.google.com"];
function host(u){ try { return new URL(String(u).startsWith("http")?u:`https://${u}`).hostname.replace(/^www\./,"").toLowerCase(); } catch { return null; } }
function usableWebsite(u){ const h=host(u); if(!h||!h.includes("."))return false; return !DIRECTORY_HOSTS.some(d=>h===d||h.endsWith(`.${d}`)||h.includes(d)); }

const SANI_RE = /sanit|installat|heiz|spengl|bad|haustechnik|geb(ä|ae)udetechnik|w(ä|ae)rmetechnik|energietechnik|klima|l(ü|ue)ftung|k(ä|ae)lte|entw(ä|ae)sser|solar|gwh|gas[\s-]?wasser|klempn|plumb/i;
function looksSanitaer(l){ const blob=[l.firma,l.website,l.notiz,l.signale,l.branche].filter(Boolean).join(" "); return SANI_RE.test(blob); }

function sizeBucket(v){ const m=String(v??"").match(/\d+/); if(!m) return "offen"; const n=parseInt(m[0],10); return n<=3?"1–3":n<=15?"4–15":">15"; }
const pct=(n,d)=>d?Math.round(n*100/d):0;

(async () => {
  const { data, error } = await sb.from("leads").select("*");
  if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
  const leads = data || [];
  const N = leads.length;
  if (!N) { console.log("Keine Leads in der DB."); return; }

  const cols = Object.keys(leads[0]);
  console.log(`\n══════════════ LEAD-AUDIT — ${N} Betriebe in der DB ══════════════`);
  console.log(`Spalten: ${cols.join(", ")}\n`);

  // ── Verteilungen ──
  const tally = (fn) => { const m={}; for(const l of leads){ const k=fn(l)??"(leer)"; m[k]=(m[k]||0)+1; } return m; };
  const show = (title,m,lim=15) => { console.log(title); Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,lim).forEach(([k,v])=>console.log(`   ${String(v).padStart(4)}  ${k}`)); console.log(""); };

  show("STATUS:", tally(l=>l.status));
  // Autoritativen Kanton (persistiert, aus Google) bevorzugen; sonst aus Ort ableiten
  // (last-wins bei Homonymen → nur Näherung, daher Fallback).
  const hasKantonCol = cols.includes("kanton");
  const kantonOfLead = (l) => (hasKantonCol && l.kanton && String(l.kanton).trim()) || ortToKanton.get(String(l.ort||"").trim().toLowerCase()) || "❓ unbekannter Ort";
  show(`KANTON (${hasKantonCol ? "persistiert, sonst aus Ort" : "aus Ort abgeleitet"}):`, tally(kantonOfLead));
  show("ORT (Top 15):", tally(l=>l.ort));
  show("GRÖSSE-BUCKET (ma_proxy):", tally(l=>sizeBucket(l.ma_proxy)));

  // ── Dim-Zähler ──
  let wrongKanton=0, unknownOrt=0, nonDE=0, badWebsite=0, noWebsite=0, notSani=0;
  let noEntscheider=0, noMail=0, noTel=0;
  const dupPlace={}, dupDomain={}, dupName={};
  const flaggedWrong=[], flaggedNonDE=[], flaggedWeb=[], flaggedSani=[];

  for (const l of leads) {
    const ortK = ortToKanton.get(String(l.ort||"").trim().toLowerCase());
    const authK = hasKantonCol && l.kanton && String(l.kanton).trim();   // autoritativ schlägt Namens-Ableitung
    const effK = authK || ortK;
    if (!effK) unknownOrt++;
    else if (expectKanton && effK !== expectKanton) { wrongKanton++; if(flaggedWrong.length<12) flaggedWrong.push(`${l.firma} — ${l.ort} → ${effK}`); }
    if (NON_DE_ORTE.has(String(l.ort||"").trim().toLowerCase())) { nonDE++; if(flaggedNonDE.length<12) flaggedNonDE.push(`${l.firma} — ${l.ort}`); }

    if (!l.website) { noWebsite++; if(flaggedWeb.length<12) flaggedWeb.push(`${l.firma} — (keine Website)`); }
    else if (!usableWebsite(l.website)) { badWebsite++; if(flaggedWeb.length<12) flaggedWeb.push(`${l.firma} — ${l.website}`); }

    if (!looksSanitaer(l)) { notSani++; if(flaggedSani.length<14) flaggedSani.push(`${l.firma} — ${l.website||"(o.W.)"} — "${(l.notiz||"").slice(0,40)}"`); }

    if (!l.entscheider) noEntscheider++;
    if (!l.mail) noMail++;
    if (!l.telefon) noTel++;

    if (l.place_id) dupPlace[l.place_id]=(dupPlace[l.place_id]||0)+1;
    const dom=host(l.website); if(dom) dupDomain[dom]=(dupDomain[dom]||0)+1;
    const nk=`${String(l.firma||"").trim().toLowerCase()}|${String(l.ort||"").trim().toLowerCase()}`; if(l.firma) dupName[nk]=(dupName[nk]||0)+1;
  }
  const dups=(m)=>Object.entries(m).filter(([,v])=>v>1);

  console.log("──────────── BAUSTELLEN (Dimensions-Audit) ────────────\n");
  console.log(`Dim 1 REGION    : ${unknownOrt} Ort nicht im DE-File (${pct(unknownOrt,N)}%)${expectKanton?`,  ${wrongKanton} falscher Kanton (erwartet ${expectKanton})`:"  [--kanton für Kanton-Check setzen]"}`);
  flaggedWrong.forEach(s=>console.log(`     ⚠️ ${s}`));
  console.log(`Dim 2 SPRACHE   : ${nonDE} Orte in nicht-deutscher Region (Bleed-Risiko)`);
  flaggedNonDE.forEach(s=>console.log(`     ⚠️ ${s}`));
  console.log(`Dim 3 WEBSITE   : ${noWebsite} ohne Website, ${badWebsite} Verzeichnis/Social (= NICHT ICP, ${pct(noWebsite+badWebsite,N)}%)`);
  flaggedWeb.forEach(s=>console.log(`     ⚠️ ${s}`));
  console.log(`Dim 4 ICP/SANI  : ${notSani} sehen NICHT nach Sanitär aus (${pct(notSani,N)}%)`);
  flaggedSani.forEach(s=>console.log(`     ⚠️ ${s}`));
  console.log(`Dim 5 KONTAKT   : ${noEntscheider} ohne Entscheider (${pct(noEntscheider,N)}%), ${noMail} ohne Mail (${pct(noMail,N)}%), ${noTel} ohne Telefon (${pct(noTel,N)}%)`);
  console.log(`Dim 6 DUBLETTEN : place_id ${dups(dupPlace).length}, Domain ${dups(dupDomain).length}, firma+ort ${dups(dupName).length}`);
  dups(dupDomain).slice(0,8).forEach(([k,v])=>console.log(`     ⚠️ ${v}× ${k}`));
  dups(dupName).slice(0,8).forEach(([k,v])=>console.log(`     ⚠️ ${v}× ${k}`));
  console.log("");

  // ── Verteilte Stichprobe ──
  const step=Math.max(1,Math.floor(N/SAMPLE));
  console.log(`──────────── STICHPROBE (${Math.min(SAMPLE,N)} verteilt, jeder ${step}.) ────────────\n`);
  for (let i=0,c=0;i<N&&c<SAMPLE;i+=step,c++){
    const l=leads[i]; const ortK=kantonOfLead(l);
    console.log(`#${i} ${l.firma||"(o.Firma)"}`);
    console.log(`   Ort: ${l.ort||"—"} (${ortK}) · PLZ ${l.plz||"—"} · Status ${l.status||"—"} · Größe ${l.ma_proxy||"—"}→${sizeBucket(l.ma_proxy)}`);
    console.log(`   Web: ${l.website||"—"} ${l.website?(usableWebsite(l.website)?"✓":"⚠️ Verzeichnis"):""} · Sani:${looksSanitaer(l)?"✓":"⚠️"}`);
    console.log(`   Kontakt: ${l.entscheider||"—"} · ${l.mail||"—"} · ${l.telefon||"—"}`);
    console.log("");
  }
  console.log("══════════════ ENDE AUDIT ══════════════\n");
})();
