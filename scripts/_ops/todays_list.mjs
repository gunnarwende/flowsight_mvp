#!/usr/bin/env node
/**
 * todays_list.mjs — Lead-Motor Schicht 3: serviert die Tagesblätter aus leads.csv.
 *
 *   Vor-Ort-Laufblatt (Ring 0)  +  Telefon-Tagesblatt (Ring 1)
 *
 * Filtert offene Leads (status neu / fälliger nächster Schritt), sortiert warm zuerst
 * (bekannter Entscheider → ICP-Score), blendet abgeschlossene/abgelehnte/DQ aus.
 * Schreibt zusätzlich docs/sales/todays_list.md.
 *
 * Usage:
 *   node scripts/_ops/todays_list.mjs                 # beide Blätter (Ring0 top 6, Ring1 top 10)
 *   node scripts/_ops/todays_list.mjs --ring 0 --n 8
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS = path.resolve(__dirname, "../../docs/sales/leads.csv");
const OUT = path.resolve(__dirname, "../../docs/sales/todays_list.md");

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const onlyRing = arg("--ring", null);
const N0 = Number(arg("--n", onlyRing === "1" ? 10 : 6));
const N1 = Number(arg("--n", 10));

function parseCsv(txt) {
  txt = txt.replace(/^﻿/, "");
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"' && txt[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else if (c === '"') q = true;
    else if (c === ";") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") {} else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

if (!fs.existsSync(LEADS)) { console.error("leads.csv fehlt — zuerst build_leads.mjs laufen lassen."); process.exit(1); }
const rows = parseCsv(fs.readFileSync(LEADS, "utf-8"));
const header = rows.shift();
const idx = Object.fromEntries(header.map((h, i) => [h, i]));
const leads = rows.map((r) => Object.fromEntries(header.map((h) => [h, r[idx[h]] ?? ""])));

const today = new Date().toISOString().slice(0, 10);
const DEAD = new Set(["closed", "nein", "parked", "gewonnen"]);
function isOpen(l) {
  if (DEAD.has((l.status || "").toLowerCase())) return false;
  if (l.tariff.startsWith("DQ")) return false;
  if (l.naechster_am && l.naechster_am > today) return false; // noch nicht fällig
  return true;
}
// warm zuerst: bekannter Entscheider, dann ICP-Score
function rank(a, b) {
  const da = a.entscheider ? 1 : 0, db = b.entscheider ? 1 : 0;
  if (da !== db) return db - da;
  return (Number(b.icp_score) || 0) - (Number(a.icp_score) || 0);
}

const open = leads.filter(isOpen);
const ring0 = open.filter((l) => l.ring === "0").sort(rank).slice(0, N0);
const ring1 = open.filter((l) => l.ring === "1").sort(rank).slice(0, N1);

function line(l) {
  const dm = l.entscheider ? `${l.entscheider}${l.rolle ? " (" + l.rolle + ")" : ""}` : "Entscheider TBD";
  const flag = l.signale.includes("Gewerk prüfen") ? "  ⚠ Gewerk prüfen" : "";
  return `  • ${l.firma} — ${l.ort} · ${l.tariff} · Inh.@Tel: ${l.inhaber_am_telefon}\n` +
         `    ${dm} · ${l.telefon || "Tel TBD"} · ${l.rating || "?"}★/${l.reviews || "?"} · ${l.website || "keine Website"}${flag}`;
}
function md(rows) {
  return rows.map((l) =>
    `- [ ] **${l.firma}** (${l.ort}) — ${l.tariff} · Inh.@Tel ${l.inhaber_am_telefon} · ` +
    `${l.entscheider || "Entscheider TBD"}${l.rolle ? " (" + l.rolle + ")" : ""} · ${l.telefon || "Tel TBD"} · ` +
    `${l.rating || "?"}★/${l.reviews || "?"}${l.signale.includes("Gewerk prüfen") ? " · ⚠ Gewerk prüfen" : ""}`
  ).join("\n");
}

const console_out =
`\n═══ TAGESLISTE ${today} ═══\n\n` +
(onlyRing !== "1" ? `🚲 VOR-ORT (Ring 0) — ${ring0.length} Betriebe:\n${ring0.map(line).join("\n")}\n\n` : "") +
(onlyRing !== "0" ? `📞 TELEFON (Ring 1) — ${ring1.length} Betriebe:\n${ring1.map(line).join("\n")}\n` : "");
console.log(console_out);

const mdOut = `# Tagesliste — ${today}

> Aus \`leads.csv\` via \`todays_list.mjs\`. Status zurückschreiben in \`leads.csv\` (Spalte status/naechster_schritt).
> Skripte: Vor-Ort §7 · Telefon §8 in \`docs/gtm/sales/SALES_BIBLE.md\`.

## 🚲 Vor-Ort (Ring 0) — Motor A
${md(ring0)}

## 📞 Telefon (Ring 1) — Motor B
${md(ring1)}
`;
fs.writeFileSync(OUT, mdOut, "utf-8");
console.log(`✅ geschrieben: ${path.relative(process.cwd(), OUT)}`);
