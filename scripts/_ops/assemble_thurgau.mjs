#!/usr/bin/env node
/**
 * assemble_thurgau.mjs — baut aus thurgau_leads.json die finale 20er-Kontaktliste:
 * 6 Keeper + 14 neue (Inhaber-Treffer zuerst), ICP-gefiltert, Felder bereinigt.
 * Patcht LEADS_TG in docs/gtm/customer_journey.html + schreibt eine Markdown-Übersicht.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_ = path.resolve(__dirname, "../../docs/sales/thurgau_leads.json");
const HTML = path.resolve(__dirname, "../../docs/gtm/customer_journey.html");
const MD = path.resolve(__dirname, "../../docs/sales/customers/2026-06-18/thurgau_liste.md");

const data = JSON.parse(fs.readFileSync(JSON_, "utf-8"));
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const KEEPERS = ["serafini", "rickenbach", "musa", "hutt", "haustechnet", "schuetzgebaeudetechnikag"];
const isKeeper = (r) => KEEPERS.some((k) => norm(r.website).includes(k) || norm(r.firma).includes(k.replace("haustechnet", "schäfli")));

// Namen bereinigen: erste Zeile, nur Namens-Zeichen, "Vorname Nachname" verlangen, sonst null
function cleanName(n) {
  let s = String(n || "").split(/\n|\r/)[0]
    .replace(/\b(sanit[äa]r|heizung|gmbh|ag|inhaber|gesch[äa]ftsf[üu]hrer|muster)\b/gi, "")
    .replace(/[^A-Za-zÄÖÜäöüéèêàçëï.\- ]/g, " ").replace(/\s+/g, " ").trim();
  const words = s.split(" ").filter((w) => w.replace(/[.\-]/g, "").length >= 2);
  if (words.length < 2) return null;            // braucht Vor- + Nachname
  return words.slice(0, 3).join(" ");
}
function fmtInhaber(deciders) {
  const out = [];
  for (const d of (deciders || []).slice(0, 2)) {
    const nm = cleanName(d && d.name); if (!nm) continue;
    const sal = d.salutation === "Herr" || d.salutation === "Frau" ? d.salutation + " " : "";
    out.push((sal + nm).trim());
  }
  return out.length ? out.join(", ") : "?";
}
function tariffFor(ma) { if (ma == null) return "TBD"; if (ma <= 3) return "Solo (950)"; if (ma <= 12) return "Premium (2000)"; return "DQ"; }

// Bauen + filtern
const seen = new Set();
function mk(r) {
  const k = norm(r.firma); if (seen.has(k)) return null; seen.add(k);
  const inh = fmtInhaber(r.deciders);
  const web = (r.website || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return {
    id: r.place_id || ("tg-" + k.replace(/[^a-z0-9]+/g, "-").slice(0, 18)),
    firma: r.firma.replace(/\s+-\s+.*$/, "").slice(0, 60), ort: r.ort || "",
    tel: r.telefon || "", web, webfull: r.website || "",
    rating: r.rating || "", reviews: r.reviews || "",
    inhaber: inh, ma: r.ma != null ? String(r.ma) : "?", tarif: tariffFor(r.ma),
    mail: r.mail || "?", services: r.leistungen && r.leistungen !== "?" ? r.leistungen : "?",
    _hasOwner: inh !== "?",
  };
}
const alive = data.filter((r) => r.alive && !/Aufbau/i.test(r.flag || ""));
const keepers = alive.filter((r) => isKeeper(r) && r.core !== false).map(mk).filter(Boolean).slice(0, 6);
const pool = alive.filter((r) => !isKeeper(r) && r.core === true && (r.ma == null || r.ma <= 13))
  .map(mk).filter(Boolean)
  .filter((r) => r._hasOwner)   // KEINE "?"-Inhaber auffüllen (Founder-Regel: ohne Inhaber = nicht auf die Liste)
  .sort((a, b) => (Number(b.reviews) - Number(a.reviews)));
const finalList = [...keepers, ...pool.slice(0, 20 - keepers.length)];
finalList.forEach((r) => delete r._hasOwner);

// LEADS_TG in HTML patchen
const js = "const LEADS_TG=" + JSON.stringify(finalList) + ";";
let html = fs.readFileSync(HTML, "utf-8");
html = html.replace(/const LEADS_TG=\[[\s\S]*?\];/, js);
fs.writeFileSync(HTML, html, "utf-8");

// Markdown
fs.mkdirSync(path.dirname(MD), { recursive: true });
const owners = finalList.filter((r) => r.inhaber !== "?").length;
let md = `# Thurgau-Kontaktliste (vor-qualifiziert) — ${finalList.length} Betriebe\n\n`;
md += `Stand 18.06. · mit Inhaber: ${owners}/${finalList.length} · Rest „?" = Website nennt keinen Namen, kurz prüfen.\n\n`;
md += `| # | Firma | Ort | Inhaber | MA | Tarif | Leistungen | E-Mail | Telefon |\n|---|---|---|---|---|---|---|---|---|\n`;
finalList.forEach((r, i) => { md += `| ${i + 1} | ${r.firma} | ${r.ort} | ${r.inhaber} | ${r.ma} | ${r.tarif} | ${r.services} | ${r.mail} | ${r.tel} |\n`; });
fs.writeFileSync(MD, md, "utf-8");

console.log(`✅ ${finalList.length} Betriebe (Keeper ${keepers.length} + neu ${finalList.length - keepers.length}) · mit Inhaber ${owners}`);
console.log(`   HTML gepatcht: ${path.relative(process.cwd(), HTML)}`);
console.log(`   Markdown: ${path.relative(process.cwd(), MD)}`);
console.log("\n" + finalList.map((r, i) => `${i + 1}. ${r.firma} | ${r.inhaber} | MA ${r.ma} | ${r.mail}`).join("\n"));
