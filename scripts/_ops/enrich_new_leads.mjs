#!/usr/bin/env node
/**
 * enrich_new_leads.mjs — füllt die Karten-Felder Inhaber / E-Mail / Größe bei noch
 * UNVOLLSTÄNDIGEN Leads: crawlt deren Website (crawl_extract → Inhaber/Mail/Größe/
 * Leistungen) und schreibt das in dieselbe Zeile (crawl_to_leads --place-id = nur
 * Update, nie Duplikat). Ziel: jede Lead-Karte ist cold-call-fähig — Inhaber, Mail
 * und Größe gefüllt (bei Unsicherheit „?" bzw. Mail leer, wie crawl_extract es macht).
 *
 * Kandidaten: Website vorhanden UND mindestens eines von entscheider/mail/ma_proxy
 * leer, bestes ICP zuerst. Zeit-budgetiert (--minutes) statt fixem Limit — geht so
 * viele durch, wie ins Budget passen; der Rest bleibt für den nächsten Lauf
 * (nahtlos, da die Auswahl jedesmal die noch leeren zieht). Pro Lead try/catch +
 * harte Crawl-Zeitgrenze — eine kaputte/hängende Website stoppt den Lauf nie.
 *
 * Am Ende: „Founder-Gegenprüfung"-Liste — Betriebe, bei denen auch nach Crawl kein
 * Inhaber auffindbar war (online schlicht nicht vorhanden → Mensch klärt vorne).
 *
 * Lauf: node scripts/_ops/enrich_new_leads.mjs [--minutes 45] [--limit 1000]
 * Env: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (+ GOOGLE_SCOUT_KEY für Bewertung)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { reformatEntscheider } from "./_anrede.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(f) { const i = process.argv.indexOf(f); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null; }
const LIMIT = Math.max(1, parseInt(getArg("--limit") || "1000", 10) || 1000);
const MINUTES = Math.max(1, parseInt(getArg("--minutes") || "45", 10) || 45);
const deadline = Date.now() + MINUTES * 60 * 1000;
const timeLeft = () => Date.now() < deadline;
const SKIP_CRAWL = process.argv.includes("--skip-crawl");   // nur Umformat + Gegenprüfung (schnell)

const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const EXTRACT = path.resolve(__dirname, "crawl_extract.mjs");
const TOLEADS = path.resolve(__dirname, "crawl_to_leads.mjs");

function slugFromUrl(u) {
  try {
    const h = new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace(/^www\./, "");
    return h.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "betrieb";
  } catch { return "betrieb"; }
}

(async () => {
  // Kandidaten: Website vorhanden, aber Karte unvollständig (Inhaber ODER Mail ODER
  // Größe leer) → bestes ICP zuerst. Genau die Felder der Lead-Karte schließen.
  const { data: leads, error } = await sb
    .from("leads")
    .select("id, place_id, firma, ort, website, entscheider, mail, ma_proxy, icp_score")
    .not("website", "is", null)
    .order("icp_score", { ascending: false })
    .limit(LIMIT);
  if (error) { console.error("DB-Lesefehler:", error.message); process.exit(1); }
  // Unvollständig = Inhaber ODER Mail ODER Größe fehlt. In JS filtern, weil leere
  // Felder als "" (nicht NULL) gespeichert sind — eine .or(...is.null)-Query verfehlt die.
  const incomplete = (l) => !l.entscheider || !l.mail || !l.ma_proxy;
  const todo = (leads || []).filter((l) => l.website && l.place_id && incomplete(l));

  console.log(`\n── Anreicherung: ${todo.length} unvollständige Lead(s), Budget ${MINUTES} Min ──`);
  if (SKIP_CRAWL) console.log("⏭  --skip-crawl: kein Crawl, nur Umformat + Gegenprüfung.");
  else if (!todo.length) { console.log("Nichts anzureichern — alle Karten vollständig.\n"); }

  const env = { ...process.env };
  let ok = 0, fail = 0, done = 0;
  for (const l of (SKIP_CRAWL ? [] : todo)) {
    if (!timeLeft()) { console.log(`\n⏱ Zeitbudget (${MINUTES} Min) aufgebraucht — ${todo.length - done} bleiben für den nächsten Lauf.`); break; }
    done++;
    const wurl = l.website.startsWith("http") ? l.website : `https://${l.website}`;
    const slug = slugFromUrl(wurl);
    console.log(`\n>>> [${done}/${todo.length}] ${l.firma}  (${wurl})  → slug ${slug}`);
    try {
      // Harte 90s-Grenze je Crawl: eine hängende Website darf den Lauf nicht blockieren.
      execFileSync("node", [EXTRACT, "--url", wurl, "--slug", slug], { stdio: "inherit", env, timeout: 90000, killSignal: "SIGKILL" });
      execFileSync("node", [TOLEADS, "--slug", slug, "--place-id", l.place_id, "--execute"], { stdio: "inherit", env });
      ok++;
    } catch (e) { fail++; console.log(`  Fehler/Timeout bei ${l.firma}: ${e.message} — weiter.`); }
  }
  console.log(`\n✓ Anreicherung fertig: ${ok} ok, ${fail} mit Fehler.`);

  // ── Umformat-Pass: ALLE Inhaber-Felder auf „Herr/Frau Nachname" bringen + Müll
  //    (z.B. „Unsere Niederlassungen") rausputzen. Auch bestehende Werte (die der
  //    additive Crawl-Schutz nie anfasst) — darum hier zentral, nicht beim Crawl. ──
  // ALLE Leads holen + in JS filtern (die .not(entscheider,is,null)-Query lieferte
  // in dieser supabase-js-Version leer → 0 Updates). Schreibfehler werden geloggt.
  const { data: allLeads, error: rfErr } = await sb.from("leads").select("place_id, entscheider");
  if (rfErr) console.log(`  Umformat-Lesefehler: ${rfErr.message}`);
  let reformatted = 0, rfFail = 0;
  for (const l of (allLeads || [])) {
    const cur = (l.entscheider || "").trim();
    if (!cur) continue;
    const nv = reformatEntscheider(cur);
    if (nv === cur) continue;
    const { error: uErr } = await sb.from("leads").update({ entscheider: nv || null }).eq("place_id", l.place_id);
    if (uErr) { rfFail++; console.log(`  Umformat-Schreibfehler (${l.place_id}): ${uErr.message}`); continue; }
    reformatted++;
  }
  console.log(`✓ Anrede umformatiert: ${reformatted} bereinigt/auf „Herr/Frau Nachname" gebracht — ${(allLeads || []).length} geprüft${rfFail ? `, ${rfFail} Schreibfehler` : ""}.`);

  // ── Founder-Gegenprüfung: Inhaber auch nach Crawl nicht auffindbar (online nicht
  //    vorhanden). Die Maschine rät nie — diese klärt der Mensch vor dem ersten Call.
  //    null ODER leer ("") zählt als Lücke — in JS filtern (Empty-String-Fix). ──
  const { data: rest } = await sb
    .from("leads")
    .select("firma, ort, website, entscheider, icp_score")
    .not("website", "is", null)
    .order("icp_score", { ascending: false });
  const list = (rest || []).filter((l) => !l.entscheider);
  console.log(`\n──────── FOUNDER-GEGENPRÜFUNG: ${list.length} ohne auffindbaren Inhaber ────────`);
  if (!list.length) console.log("  (keine — alle haben einen Inhaber-Namen)");
  list.slice(0, 60).forEach((l) => console.log(`  • ${l.firma} — ${l.ort || "?"} — ${l.website}`));
  if (list.length > 60) console.log(`  … und ${list.length - 60} weitere.`);
  console.log("");
})().catch((e) => { console.error("FEHLER:", e.message); process.exit(1); });
