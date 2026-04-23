#!/usr/bin/env node
/**
 * market_report.mjs — Generate comprehensive market analysis report from enriched data.
 * Reads: docs/gtm/icp/market/phase3_full.json
 * Writes: docs/gtm/icp/market/marktanalyse.md
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join("docs", "gtm", "icp", "market");
const data = JSON.parse(await readFile(join(OUT_DIR, "phase3_full.json"), "utf-8"));

// ── Enrich ──
for (const b of data) {
  if (b.crawl?.teamSize) {
    if (b.crawl.teamSize <= 3) b.sizeCategory = "Micro (1-3 MA)";
    else if (b.crawl.teamSize <= 8) b.sizeCategory = "Klein (4-8 MA)";
    else if (b.crawl.teamSize <= 20) b.sizeCategory = "Mittel (9-20 MA)";
    else b.sizeCategory = "Gross (20+ MA)";
  } else {
    b.sizeCategory = "Unbekannt";
  }

  let dig = 0;
  if (b.website || b.google?.website) dig++;
  if (b.crawl?.hasForm) dig++;
  if (b.crawl?.hasBooking) dig++;
  if (b.crawl?.serviceBreadth >= 4) dig++;
  if (b.google?.rating) dig++;
  b.digitalScore = dig;
  b.digitalLevel = dig <= 1 ? "Minimal" : dig <= 2 ? "Basis" : dig <= 3 ? "Mittel" : "Fortgeschritten";

  let icp = 0;
  if (!b.crawl?.hasBooking) icp += 3;
  if (!b.crawl?.hasForm) icp += 2;
  if ((b.google?.reviewCount || 0) <= 10) icp += 2;
  else if ((b.google?.reviewCount || 0) <= 30) icp += 1;
  if (b.zefix?.legalFormId === 3 || b.zefix?.legalFormId === 4) icp += 2;
  if (b.google?.rating >= 4.5) icp += 1;
  b.icpScore = icp;
}

const total = data.length;
const pct = (n) => Math.round((n / total) * 100) + "%";
const withZefix = data.filter((b) => b.zefix).length;
const withGoogle = data.filter((b) => b.google).length;
const withCrawl = data.filter((b) => b.crawl).length;
const withWebsite = data.filter((b) => b.website || b.google?.website).length;
const withTeam = data.filter((b) => b.crawl?.teamSize).length;
const withFounded = data.filter((b) => b.crawl?.foundedYear).length;
const withForm = data.filter((b) => b.crawl?.hasForm).length;
const withBooking = data.filter((b) => b.crawl?.hasBooking).length;

// Legal forms
const forms = {};
for (const b of data) {
  const f = b.zefix
    ? b.zefix.legalFormId === 3 ? "AG" : b.zefix.legalFormId === 4 ? "GmbH" : b.zefix.legalFormId === 1 ? "Einzelunternehmen" : "Andere"
    : "Nicht im HR";
  forms[f] = (forms[f] || 0) + 1;
}

// Ratings + Reviews
const ratings = { "5.0": 0, "4.5-4.9": 0, "4.0-4.4": 0, "3.0-3.9": 0, "<3.0 / keine": 0 };
const reviewBuckets = { "0": 0, "1-5": 0, "6-15": 0, "16-30": 0, "31-50": 0, "51-100": 0, "100+": 0 };
for (const b of data) {
  const r = b.google?.rating;
  if (!r) ratings["<3.0 / keine"]++;
  else if (r === 5) ratings["5.0"]++;
  else if (r >= 4.5) ratings["4.5-4.9"]++;
  else if (r >= 4) ratings["4.0-4.4"]++;
  else if (r >= 3) ratings["3.0-3.9"]++;
  else ratings["<3.0 / keine"]++;

  const rc = b.google?.reviewCount || 0;
  if (rc === 0) reviewBuckets["0"]++;
  else if (rc <= 5) reviewBuckets["1-5"]++;
  else if (rc <= 15) reviewBuckets["6-15"]++;
  else if (rc <= 30) reviewBuckets["16-30"]++;
  else if (rc <= 50) reviewBuckets["31-50"]++;
  else if (rc <= 100) reviewBuckets["51-100"]++;
  else reviewBuckets["100+"]++;
}

// Services
const svcCounts = {};
for (const b of data) {
  if (b.crawl?.services) {
    for (const s of b.crawl.services) svcCounts[s] = (svcCounts[s] || 0) + 1;
  }
}

// ICP
const icpBuckets = {
  "ICP 8-10 (Kern-Zielgruppe)": data.filter((b) => b.icpScore >= 8),
  "ICP 6-7 (Gut)": data.filter((b) => b.icpScore >= 6 && b.icpScore < 8),
  "ICP 4-5 (Mittel)": data.filter((b) => b.icpScore >= 4 && b.icpScore < 6),
  "ICP 0-3 (Niedrig)": data.filter((b) => b.icpScore < 4),
};

// Digital levels
const digLevels = {};
for (const b of data) digLevels[b.digitalLevel] = (digLevels[b.digitalLevel] || 0) + 1;

// Cities
const cities = {};
for (const b of data) if (b.city) cities[b.city] = (cities[b.city] || 0) + 1;

// Founded decades
const decades = {};
for (const b of data) {
  if (b.crawl?.foundedYear) {
    const dec = Math.floor(b.crawl.foundedYear / 10) * 10;
    decades[dec + "s"] = (decades[dec + "s"] || 0) + 1;
  }
}

// TAM/SAM/SOM
const factor = 4.2;
const samZH = data.filter((b) => b.icpScore >= 6).length;
const samCH = Math.round(samZH * factor);
const tamCH = Math.round(total * factor);

// ── Build Report ──
let md = `# Marktanalyse Kanton Zürich — Sanitär / Heizung / Haustechnik

**Datum:** ${new Date().toISOString().slice(0, 10)}
**Methodik:** search.ch (Schweizer Telefonverzeichnis) + Zefix Handelsregister + Google Places API + Website-Crawling (Playwright)
**Stichprobe:** ${total} Betriebe (dedupliziert aus 4 Suchkategorien)
**Gecrawlt:** ${withCrawl} Websites im Detail analysiert

---

## Executive Summary

Im Kanton Zürich existieren mindestens **${total} aktive Betriebe** im Bereich Sanitär/Heizung/Haustechnik/Spenglerei.

Hochrechnung Deutschschweiz: ca. **${tamCH} Betriebe** (Faktor ${factor}: ZH ≈ 24% der Deutschschweizer Wirtschaftskraft).

**${pct(samZH)} der Betriebe (${samZH})** haben ICP-Score ≥ 6 und sind potenzielle FlowSight-Kunden. Bei 10 Betrieben/Tag Outreach und 5-10% Conversion = **${Math.round(samZH * 0.05)}-${Math.round(samZH * 0.1)} Kunden allein aus dem Kanton ZH**.

---

## 1. Datenqualität

| Quelle | Abdeckung | Anteil |
|--------|-----------|--------|
| search.ch (Basis) | ${total} | 100% |
| Zefix Handelsregister | ${withZefix} | ${pct(withZefix)} |
| Google Places | ${withGoogle} | ${pct(withGoogle)} |
| Website vorhanden | ${withWebsite} | ${pct(withWebsite)} |
| Website gecrawlt | ${withCrawl} | ${pct(withCrawl)} |
| Teamgrösse ermittelt | ${withTeam} | ${Math.round((withTeam / withCrawl) * 100)}% (von gecrawlten) |
| Gründungsjahr ermittelt | ${withFounded} | ${Math.round((withFounded / withCrawl) * 100)}% (von gecrawlten) |
| Kontaktformular | ${withForm} | ${Math.round((withForm / withCrawl) * 100)}% (von gecrawlten) |
| Online-Terminbuchung | ${withBooking} | ${Math.round((withBooking / withCrawl) * 100)}% (von gecrawlten) |

## 2. Rechtsformen (Zefix)

| Rechtsform | Anzahl | Anteil |
|-----------|--------|--------|
${Object.entries(forms).sort((a, b) => b[1] - a[1]).map(([f, n]) => `| ${f} | ${n} | ${pct(n)} |`).join("\n")}

**Hinweis:** Rechtsform ≠ Betriebsgrösse. Beispiel: Dörfler AG = 2 MA, FlowSight GmbH = 1 Person.

## 3. Google-Bewertungen

### Rating-Verteilung

| Rating | Anzahl | Anteil |
|--------|--------|--------|
${Object.entries(ratings).map(([r, n]) => `| ${r} | ${n} | ${pct(n)} |`).join("\n")}

### Bewertungsanzahl

| Reviews | Anzahl | Anteil | Bedeutung |
|---------|--------|--------|-----------|
| 0 | ${reviewBuckets["0"]} | ${pct(reviewBuckets["0"])} | Kein Google-Profil oder inaktiv |
| 1-5 | ${reviewBuckets["1-5"]} | ${pct(reviewBuckets["1-5"])} | Starter — Review-Engine hochrelevant |
| 6-15 | ${reviewBuckets["6-15"]} | ${pct(reviewBuckets["6-15"])} | Aufbauphase |
| 16-30 | ${reviewBuckets["16-30"]} | ${pct(reviewBuckets["16-30"])} | Solide Basis |
| 31-50 | ${reviewBuckets["31-50"]} | ${pct(reviewBuckets["31-50"])} | Gut etabliert |
| 51-100 | ${reviewBuckets["51-100"]} | ${pct(reviewBuckets["51-100"])} | Starke Präsenz |
| 100+ | ${reviewBuckets["100+"]} | ${pct(reviewBuckets["100+"])} | Marktführer lokal |

## 4. Digitale Reife

| Stufe | Anzahl | Anteil |
|-------|--------|--------|
${Object.entries(digLevels).sort((a, b) => b[1] - a[1]).map(([l, n]) => `| ${l} | ${n} | ${pct(n)} |`).join("\n")}

**${Math.round(((withCrawl - withForm) / withCrawl) * 100)}% haben KEIN Kontaktformular** → höchster Erreichbarkeits-Pain.

## 5. Leistungsspektrum (gecrawlte Websites)

| Leistung | Betriebe | Anteil |
|----------|----------|--------|
${Object.entries(svcCounts).sort((a, b) => b[1] - a[1]).map(([s, n]) => `| ${s} | ${n} | ${Math.round((n / withCrawl) * 100)}% |`).join("\n")}

## 6. Geographische Verteilung (Top 20)

| Ort | Betriebe |
|-----|----------|
${Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([c, n]) => `| ${c} | ${n} |`).join("\n")}

${Object.keys(decades).length > 0 ? `## 7. Gründungsjahre (${withFounded} Betriebe)

| Jahrzehnt | Betriebe |
|-----------|----------|
${Object.entries(decades).sort().map(([d, n]) => `| ${d} | ${n} |`).join("\n")}
` : ""}

## 8. ICP-Scoring

Score: Erreichbarkeits-Pain (kein Formular/Booking) + Bewertungs-Potenzial (wenige Reviews) + Budget (Rechtsform) + Qualität (≥4.5★)

| Segment | Anzahl | Anteil |
|---------|--------|--------|
${Object.entries(icpBuckets).map(([l, list]) => `| ${l} | ${list.length} | ${pct(list.length)} |`).join("\n")}

## 9. Marktgrösse (TAM / SAM / SOM)

### Kanton Zürich

| Metrik | Anzahl | Erklärung |
|--------|--------|----------|
| **TAM** | ${total} | Alle Sanitär/Heizung/Haustechnik/Spenglerei |
| **SAM** | ${samZH} | ICP ≥ 6 |
| **SOM 5%** | ${Math.round(samZH * 0.05)} | Konservativ |
| **SOM 10%** | ${Math.round(samZH * 0.1)} | Optimistisch |

### Hochrechnung Deutschschweiz

| Metrik | Anzahl |
|--------|--------|
| **TAM** | ~${tamCH} |
| **SAM** | ~${samCH} |
| **SOM 5%** | ~${Math.round(samCH * 0.05)} |
| **SOM 10%** | ~${Math.round(samCH * 0.1)} |

### Revenue-Projektion

| Szenario | Kunden | Ø MRR | ARR |
|----------|--------|-------|-----|
| Kt. ZH konservativ (5%) | ${Math.round(samZH * 0.05)} | CHF 350 | CHF ${(Math.round(samZH * 0.05) * 350 * 12).toLocaleString()} |
| Kt. ZH optimistisch (10%) | ${Math.round(samZH * 0.1)} | CHF 400 | CHF ${(Math.round(samZH * 0.1) * 400 * 12).toLocaleString()} |
| Deutschschweiz (5%) | ${Math.round(samCH * 0.05)} | CHF 350 | CHF ${(Math.round(samCH * 0.05) * 350 * 12).toLocaleString()} |
| Deutschschweiz (10%) | ${Math.round(samCH * 0.1)} | CHF 400 | CHF ${(Math.round(samCH * 0.1) * 400 * 12).toLocaleString()} |

### Reichweite bei 10 Betrieben/Tag

- **Kanton ZH SAM (${samZH}):** In ${Math.round(samZH / 10)} Arbeitstagen durchkontaktiert (~${Math.round(samZH / 10 / 22)} Monate)
- **Deutschschweiz SAM (~${samCH}):** In ${Math.round(samCH / 10)} Arbeitstagen (~${Math.round(samCH / 10 / 22)} Monate)

## 10. Top 50 Prospects

${(() => {
  const top = data.filter((b) => b.icpScore >= 5).sort((a, b) => b.icpScore - a.icpScore || (b.google?.reviewCount || 0) - (a.google?.reviewCount || 0)).slice(0, 50);
  let t = "| # | Betrieb | Rechtsform | ★ | Reviews | ICP |\n|---|---------|-----------|---|---------|-----|\n";
  for (let i = 0; i < top.length; i++) {
    const b = top[i];
    const form = b.zefix ? (b.zefix.legalFormId === 3 ? "AG" : b.zefix.legalFormId === 4 ? "GmbH" : b.zefix.legalFormId === 1 ? "Einzel" : "?") : "-";
    t += `| ${i + 1} | ${b.name.slice(0, 40)} | ${form} | ${b.google?.rating || "-"} | ${b.google?.reviewCount || 0} | ${b.icpScore} |\n`;
  }
  return t;
})()}

## 11. Pain-Points nach Betriebsgrösse

### Micro/Klein (1-8 MA) — geschätzt 60-70% des Marktes
- Inhaber auf Baustelle = nicht erreichbar
- Kein Büro, kein Empfang, kein System
- Verpasste Anrufe = verlorene Aufträge
- Abends: Offerten, Rückrufe, Admin
- Wenige Google-Bewertungen trotz guter Arbeit
- **FlowSight löst:** Lisa fängt Anrufe auf, SMS-Bestätigung, Überblick, Review-Engine
- **Pricing:** CHF 299/Mo

### Mittel (9-20 MA) — geschätzt 20% des Marktes
- Disponentin koordiniert 6-12 Techniker
- 12-20 Kontakte/Tag — Morgenroutine: 8+ Fälle verteilen
- Techniker brauchen mobilen Zugang
- Kalender-Koordination
- **FlowSight löst:** Zentrale Übersicht, Zuweisung, Techniker-Ansicht, Kalender
- **Pricing:** CHF 499/Mo
- **Script-Tipp:** "...egal ob Sie allein arbeiten oder ein Team koordinieren"

### Gross (20+ MA) — geschätzt 10% des Marktes, höchstes Budget
- Eigene Prozesse, evtl. schon CRM
- Pain: Erreichbarkeit NACH Büroschluss + Review-Engine
- **FlowSight löst:** 24/7 Auffangen + automatische Bewertungen + Reporting
- **Pricing:** CHF 799+/Mo
- **Script-Tipp:** "...das System wächst mit Ihrem Betrieb mit"

---

## Rohdaten

- [phase1_searchch.json](phase1_searchch.json) — ${total} Betriebe aus search.ch
- [phase2_enriched.json](phase2_enriched.json) — + Zefix + Google
- [phase3_full.json](phase3_full.json) — + Website-Crawl (Top 110)
- [zefix_kanton_zh.json](zefix_kanton_zh.json) — 728 Betriebe aus Zefix-Scan
`;

await writeFile(join(OUT_DIR, "marktanalyse.md"), md, "utf-8");
console.log("Saved: docs/gtm/icp/market/marktanalyse.md");
console.log(`Lines: ${md.split("\n").length}`);
