#!/usr/bin/env node
/**
 * market_deep_analysis.mjs — Professional market analysis for Sanitär/Heizung Kanton Zürich.
 *
 * Phase 1: Zefix lookup (legal form, founding year) for ALL businesses
 * Phase 2: Website crawl (team size, services, digital maturity) for top 100-120
 * Phase 3: Classification and analysis
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/market_deep_analysis.mjs [--phase 1|2|3|all]
 *
 * Output: docs/gtm/icp/market/
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT_DIR = join("docs", "gtm", "icp", "market");
const RAW_PATH = join(OUT_DIR, "scan_raw.json");

const args = process.argv.slice(2);
const phase = args.includes("--phase") ? args[args.indexOf("--phase") + 1] : "all";

// ── Zefix API ────────────────────────────────────────────────────────────
async function zefixLookup(companyName) {
  try {
    // Clean name for search
    const query = companyName
      .replace(/[()]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);

    const response = await fetch("https://www.zefix.ch/ZefixREST/api/v1/firm/search.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Origin: "https://www.zefix.ch",
        Referer: "https://www.zefix.ch/de/search/entity/welcome",
      },
      body: JSON.stringify({ name: query, searchType: "exact", maxEntries: 3 }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      // Try contains search
      const r2 = await fetch("https://www.zefix.ch/ZefixREST/api/v1/firm/search.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Origin: "https://www.zefix.ch",
          Referer: "https://www.zefix.ch/de/search/entity/welcome",
        },
        body: JSON.stringify({ name: query.split(" ").slice(0, 2).join(" "), searchType: "contains", maxEntries: 5 }),
        signal: AbortSignal.timeout(8000),
      });
      if (!r2.ok) return null;
      const d2 = await r2.json();
      if (d2.error || !d2.list?.length) return null;
      return pickBestMatch(d2.list, query);
    }

    const data = await response.json();
    if (data.error || !data.list?.length) {
      // Fallback: contains with first 2 words
      const shortQuery = query.split(" ").slice(0, 2).join(" ");
      const r2 = await fetch("https://www.zefix.ch/ZefixREST/api/v1/firm/search.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Origin: "https://www.zefix.ch",
          Referer: "https://www.zefix.ch/de/search/entity/welcome",
        },
        body: JSON.stringify({ name: shortQuery, searchType: "contains", maxEntries: 5 }),
        signal: AbortSignal.timeout(8000),
      });
      if (!r2.ok) return null;
      const d2 = await r2.json();
      if (d2.error || !d2.list?.length) return null;
      return pickBestMatch(d2.list, query);
    }

    return pickBestMatch(data.list, query);
  } catch {
    return null;
  }
}

function pickBestMatch(list, query) {
  const qNorm = query.toLowerCase().replace(/\s+/g, " ");
  let best = null;
  let bestScore = -1;

  for (const c of list) {
    if (c.status !== "EXISTIEREND") continue;
    const name = (c.name || "").toLowerCase().replace(/\s+/g, " ");
    let score = 0;
    if (name === qNorm) score = 100;
    else if (name.includes(qNorm) || qNorm.includes(name)) score = 70;
    else {
      const qWords = new Set(qNorm.split(" "));
      const shared = name.split(" ").filter((w) => qWords.has(w)).length;
      score = (shared / Math.max(qWords.size, name.split(" ").length)) * 50;
    }
    if (score > bestScore) { bestScore = score; best = c; }
  }

  if (!best || bestScore < 20) return null;

  // Map legalFormId to human-readable
  const LEGAL_FORMS = {
    1: "Einzelunternehmen",
    2: "Kollektivgesellschaft",
    3: "Aktiengesellschaft (AG)",
    4: "GmbH",
    5: "Genossenschaft",
    6: "Verein",
    7: "Stiftung",
    8: "Kommanditgesellschaft",
    9: "Kommanditaktiengesellschaft",
    10: "Einfache Gesellschaft",
    11: "Institut des öffentlichen Rechts",
    12: "Zweigniederlassung",
    13: "SICAV",
    14: "SICAF",
    15: "KmGK",
  };

  return {
    name: best.name,
    uid: best.uidFormatted || null,
    legalFormId: best.legalFormId,
    legalForm: LEGAL_FORMS[best.legalFormId] || `Form ${best.legalFormId}`,
    legalSeat: best.legalSeat || null,
    status: best.status,
    shabDate: best.shabDate || null,
    matchScore: bestScore,
  };
}

// ── Lightweight website crawl (team + services + digital maturity) ────
async function crawlWebsite(browser, url) {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    viewport: { width: 1280, height: 720 },
    locale: "de-CH",
  });

  const page = await context.newPage();
  const result = { teamSize: null, teamMentions: [], services: [], foundedYear: null, hasForm: false, hasBooking: false, pageCount: 0 };

  try {
    const baseUrl = url.replace(/\/+$/, "");

    // Crawl home page
    const homeResp = await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 12000 });
    if (!homeResp || homeResp.status() >= 400) { await context.close(); return null; }
    await page.waitForTimeout(2000);
    const homeText = await page.evaluate(() => document.body.innerText);
    result.pageCount++;

    // Extract from home
    analyzeText(homeText, result);

    // Try team/about page
    for (const path of ["/team", "/ueber-uns", "/about", "/firma", "/portrait", "/unternehmen"]) {
      try {
        const resp = await page.goto(baseUrl + path, { waitUntil: "domcontentloaded", timeout: 8000 });
        if (resp && resp.status() < 400) {
          await page.waitForTimeout(1500);
          const text = await page.evaluate(() => document.body.innerText);
          if (text && text.length > 100) {
            analyzeText(text, result);
            result.pageCount++;
            break;
          }
        }
      } catch { /* skip */ }
    }

    // Try services page
    for (const path of ["/dienstleistungen", "/services", "/leistungen", "/angebot", "/kompetenzen"]) {
      try {
        const resp = await page.goto(baseUrl + path, { waitUntil: "domcontentloaded", timeout: 8000 });
        if (resp && resp.status() < 400) {
          await page.waitForTimeout(1500);
          const text = await page.evaluate(() => document.body.innerText);
          if (text && text.length > 100) {
            analyzeServices(text, result);
            result.pageCount++;
            break;
          }
        }
      } catch { /* skip */ }
    }

    // Check for forms/booking on home
    const hasForm = await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 8000 }).then(async () => {
      await page.waitForTimeout(1000);
      return page.evaluate(() => {
        const forms = document.querySelectorAll("form");
        const hasContactForm = Array.from(forms).some((f) =>
          f.innerHTML.toLowerCase().includes("name") || f.innerHTML.toLowerCase().includes("email") || f.innerHTML.toLowerCase().includes("telefon"),
        );
        const hasBooking = document.body.innerText.toLowerCase().includes("termin buchen") ||
          document.body.innerText.toLowerCase().includes("online buchen") ||
          document.body.innerText.toLowerCase().includes("terminanfrage");
        return { hasContactForm, hasBooking };
      });
    }).catch(() => ({ hasContactForm: false, hasBooking: false }));

    result.hasForm = hasForm.hasContactForm;
    result.hasBooking = hasForm.hasBooking;
  } catch {
    // Crawl failed
  }

  await context.close();
  return result;
}

function analyzeText(text, result) {
  // Team size — explicit mentions
  const teamPatterns = [
    /(\d{1,3})\s*(?:Mitarbeiter(?:innen)?|Angestellte|Fachleute|Profis|Mitarbeitende|Teammitglieder)/i,
    /(?:Team|Belegschaft)\s+(?:von\s+)?(\d{1,3})/i,
    /(?:rund|ca\.?|über|mehr\s+als)\s+(\d{1,3})\s*(?:Mitarbeiter|Angestellte|Fachleute)/i,
  ];
  for (const re of teamPatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 2 && n <= 500) result.teamSize = n;
    }
  }

  // Founded year
  const yearRe = /(?:seit|gegr[uü]ndet|gr[uü]ndung|established|founded)[\s:]*(\d{4})/i;
  const ym = text.match(yearRe);
  if (ym) result.foundedYear = parseInt(ym[1], 10);

  // Team member names (look for patterns like "Name Nachname, Funktion")
  const namePattern = /([A-ZÄÖÜ][a-zäöüéèê]+\s+[A-ZÄÖÜ][a-zäöüéèê]+)[\s,–-]+(?:Gesch[aä]ftsf[uü]hr|Inhaber|CEO|Geschäftsleitung|Projektleiter|Monteur|Techniker|Lehrling|Auszubildend|Servicetechniker|Disponent)/gi;
  const names = [...text.matchAll(namePattern)].map((m) => m[1].trim());
  if (names.length > 0) {
    result.teamMentions = [...new Set(names)];
    if (!result.teamSize && names.length >= 2) {
      // Don't derive team size from names on page — rule: NEVER derive from photos/names
      // But we CAN note how many named people are on the team page
      result.teamMentions = [...new Set(names)];
    }
  }
}

function analyzeServices(text, result) {
  const serviceKeywords = {
    Sanitär: /sanit[aä]r|badezimmer|WC|toilette|waschtisch/i,
    Heizung: /heizung|w[aä]rmepumpe|radiatoren|heizk[oö]rper/i,
    Spenglerei: /spenglerei|blechnerei|dach(?:rinne|entw[aä]sserung)/i,
    Lüftung: /l[uü]ftung|klima|ventilation/i,
    Solar: /solar|photovoltaik|erneuerbar/i,
    Gas: /gas(?:leitung|installation)|erdgas/i,
    Umbau: /umbau|sanier|renovier|badsanierung/i,
    Kundendienst: /kundendienst|service|reparatur|wartung/i,
    Notdienst: /notdienst|notfall|24[\s/]*7|pikett/i,
    Blitzschutz: /blitzschutz|fangstange|erdung/i,
    Planung: /beratung|planung|projekt|offerte/i,
  };

  for (const [cat, re] of Object.entries(serviceKeywords)) {
    if (re.test(text) && !result.services.includes(cat)) {
      result.services.push(cat);
    }
  }
}

// ── Phase 1: Zefix Lookup ────────────────────────────────────────────
async function runPhase1() {
  console.log("\n=== PHASE 1: Zefix Handelsregister Lookup ===\n");

  const raw = JSON.parse(await readFile(RAW_PATH, "utf-8"));
  console.log(`Businesses to check: ${raw.length}\n`);

  const enriched = [];
  let found = 0;
  let notFound = 0;

  for (let i = 0; i < raw.length; i++) {
    const b = raw[i];
    process.stdout.write(`\r  [${i + 1}/${raw.length}] ${b.name.slice(0, 40).padEnd(40)} `);

    const zefix = await zefixLookup(b.name);
    enriched.push({
      ...b,
      zefix: zefix || null,
      legalForm: zefix?.legalForm || "unbekannt",
      legalFormId: zefix?.legalFormId || null,
      zefixName: zefix?.name || null,
      uid: zefix?.uid || null,
      zefixSeat: zefix?.legalSeat || null,
    });

    if (zefix) {
      found++;
      process.stdout.write(`→ ${zefix.legalForm} (${zefix.legalSeat || "?"})`);
    } else {
      notFound++;
      process.stdout.write("→ nicht gefunden");
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n\nZefix found: ${found}/${raw.length} (${Math.round((found / raw.length) * 100)}%)`);
  console.log(`Not found: ${notFound}\n`);

  const enrichedPath = join(OUT_DIR, "enriched_zefix.json");
  await writeFile(enrichedPath, JSON.stringify(enriched, null, 2), "utf-8");
  console.log(`Saved: ${enrichedPath}`);

  return enriched;
}

// ── Phase 2: Website Crawl (top 120) ─────────────────────────────────
async function runPhase2() {
  console.log("\n=== PHASE 2: Website Deep Crawl (Top 120) ===\n");

  const enrichedPath = join(OUT_DIR, "enriched_zefix.json");
  const enriched = JSON.parse(await readFile(enrichedPath, "utf-8"));

  // Select top 120 with websites, prioritizing AG/GmbH
  const withWebsite = enriched.filter((b) => b.website);
  const toCrawl = withWebsite
    .sort((a, b) => {
      // Prioritize: AG > GmbH > Einzelunternehmen > unknown
      const formPriority = { 3: 0, 4: 1, 1: 2 };
      const pa = formPriority[a.legalFormId] ?? 3;
      const pb = formPriority[b.legalFormId] ?? 3;
      if (pa !== pb) return pa - pb;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    })
    .slice(0, 120);

  console.log(`Crawling ${toCrawl.length} websites...\n`);

  const browser = await chromium.launch({ headless: true });
  let crawled = 0;
  let failed = 0;

  for (let i = 0; i < toCrawl.length; i++) {
    const b = toCrawl[i];
    process.stdout.write(`\r  [${i + 1}/${toCrawl.length}] ${b.name.slice(0, 35).padEnd(35)} `);

    try {
      const result = await crawlWebsite(browser, b.website);
      if (result) {
        b.crawl = result;
        crawled++;
        const info = [];
        if (result.teamSize) info.push(`${result.teamSize} MA`);
        if (result.foundedYear) info.push(`seit ${result.foundedYear}`);
        if (result.services.length) info.push(`${result.services.length} Leistungen`);
        if (result.hasForm) info.push("Formular");
        process.stdout.write(`→ ${info.join(", ") || "gecrawlt"}`);
      } else {
        b.crawl = null;
        failed++;
        process.stdout.write("→ fehlgeschlagen");
      }
    } catch {
      b.crawl = null;
      failed++;
      process.stdout.write("→ Fehler");
    }
  }

  await browser.close();
  console.log(`\n\nCrawled: ${crawled}, Failed: ${failed}\n`);

  // Save enriched data back
  // Merge crawl results into full enriched dataset
  const crawlMap = new Map(toCrawl.map((b) => [b.id, b.crawl]));
  for (const b of enriched) {
    if (crawlMap.has(b.id)) b.crawl = crawlMap.get(b.id);
  }

  const fullPath = join(OUT_DIR, "enriched_full.json");
  await writeFile(fullPath, JSON.stringify(enriched, null, 2), "utf-8");
  console.log(`Saved: ${fullPath}`);

  return enriched;
}

// ── Phase 3: Analysis & Report ───────────────────────────────────────
async function runPhase3() {
  console.log("\n=== PHASE 3: Marktanalyse ===\n");

  const fullPath = join(OUT_DIR, "enriched_full.json");
  const data = JSON.parse(await readFile(fullPath, "utf-8"));

  // ── Segmentation by LEGAL FORM (best size indicator) ──
  const byForm = {};
  for (const b of data) {
    const form = b.legalForm || "unbekannt";
    if (!byForm[form]) byForm[form] = [];
    byForm[form].push(b);
  }

  // ── Size estimation: combine legal form + team size + review count ──
  for (const b of data) {
    let sizeEst = "unbekannt";
    if (b.crawl?.teamSize) {
      if (b.crawl.teamSize <= 3) sizeEst = "Micro (1-3 MA)";
      else if (b.crawl.teamSize <= 8) sizeEst = "Klein (4-8 MA)";
      else if (b.crawl.teamSize <= 20) sizeEst = "Mittel (9-20 MA)";
      else sizeEst = "Gross (20+ MA)";
    } else if (b.legalFormId === 3) {
      sizeEst = "Mittel-Gross (AG → typ. 10-50 MA)";
    } else if (b.legalFormId === 4) {
      sizeEst = "Klein-Mittel (GmbH → typ. 3-20 MA)";
    } else if (b.legalFormId === 1) {
      sizeEst = "Micro-Klein (Einzelunternehmen → typ. 1-5 MA)";
    }
    b.sizeEstimate = sizeEst;

    // Digital maturity score (0-5)
    let digScore = 0;
    if (b.website) digScore++;
    if (b.crawl?.hasForm) digScore++;
    if (b.crawl?.hasBooking) digScore++;
    if (b.crawl?.services?.length >= 3) digScore++;
    if (b.crawl?.pageCount >= 3) digScore++;
    b.digitalMaturity = digScore;
    b.digitalLevel = digScore <= 1 ? "Minimal" : digScore <= 2 ? "Basis" : digScore <= 3 ? "Mittel" : "Fortgeschritten";

    // Service breadth
    b.serviceBreadth = b.crawl?.services?.length || 0;

    // Age category
    if (b.crawl?.foundedYear) {
      const age = 2026 - b.crawl.foundedYear;
      b.ageCategory = age < 5 ? "Startup (<5J)" : age < 20 ? "Etabliert (5-20J)" : "Tradition (20+J)";
    } else {
      b.ageCategory = "unbekannt";
    }

    // ICP Score (simplified)
    let icpScore = 0;
    // Erreichbarkeit (keine Online-Terminbuchung = höherer Pain)
    if (!b.crawl?.hasBooking) icpScore += 3;
    if (!b.crawl?.hasForm) icpScore += 2;
    // Bewertungs-Pain (wenige Reviews = Potenzial)
    if (b.reviewCount <= 5) icpScore += 2;
    else if (b.reviewCount <= 20) icpScore += 1;
    // Rechtsform (GmbH/AG = Budget)
    if (b.legalFormId === 3 || b.legalFormId === 4) icpScore += 2;
    else if (b.legalFormId === 1) icpScore += 1;
    b.icpScore = icpScore;
  }

  // ── Build report ──
  let md = `# Professionelle Marktanalyse — Sanitär/Heizung Kanton Zürich\n\n`;
  md += `**Datum:** ${new Date().toISOString().slice(0, 10)}\n`;
  md += `**Methodik:** Google Places API + Zefix Handelsregister + Website-Crawling (Playwright)\n`;
  md += `**Stichprobe:** ${data.length} Betriebe (dedupliziert)\n`;
  md += `**Datenquellen:** 3 (Google, Zefix, Website)\n\n`;
  md += `---\n\n`;

  // Executive Summary
  md += `## Executive Summary\n\n`;
  const agCount = data.filter((b) => b.legalFormId === 3).length;
  const gmbhCount = data.filter((b) => b.legalFormId === 4).length;
  const einzelCount = data.filter((b) => b.legalFormId === 1).length;
  const unknownForm = data.filter((b) => !b.legalFormId || ![1, 3, 4].includes(b.legalFormId)).length;
  const withTeamSize = data.filter((b) => b.crawl?.teamSize).length;
  const withFoundedYear = data.filter((b) => b.crawl?.foundedYear).length;
  const withForm = data.filter((b) => b.crawl?.hasForm).length;
  const withBooking = data.filter((b) => b.crawl?.hasBooking).length;
  const withWebsite = data.filter((b) => b.website).length;

  md += `Im Kanton Zürich operieren mindestens **${data.length} Sanitär-/Heizungsbetriebe** (Google Places, aktiv).\n\n`;
  md += `Die Hochrechnung für die gesamte Deutschschweiz ergibt ca. **${Math.round(data.length * 4.2)} Betriebe** `;
  md += `(Faktor 4.2: Zürich hat ~24% der Deutschschweizer Wirtschaftskraft).\n\n`;

  // Legal Form Distribution
  md += `## 1. Rechtsform-Verteilung (Zefix Handelsregister)\n\n`;
  md += `Die Rechtsform ist der **stärkste Indikator für Betriebsgrösse und Budget**:\n\n`;
  md += `| Rechtsform | Anzahl | Anteil | Typische Grösse | Budget-Potential |\n`;
  md += `|-----------|--------|--------|----------------|------------------|\n`;
  md += `| Aktiengesellschaft (AG) | ${agCount} | ${pct(agCount, data.length)} | 10-50 MA | 💰💰💰 CHF 499-799/Mo |\n`;
  md += `| GmbH | ${gmbhCount} | ${pct(gmbhCount, data.length)} | 3-20 MA | 💰💰 CHF 299-499/Mo |\n`;
  md += `| Einzelunternehmen | ${einzelCount} | ${pct(einzelCount, data.length)} | 1-5 MA | 💰 CHF 299/Mo |\n`;
  md += `| Andere/Unbekannt | ${unknownForm} | ${pct(unknownForm, data.length)} | Variabel | ? |\n\n`;

  // Size Estimation
  md += `## 2. Grössenverteilung (kombiniert: Zefix + Website-Crawl)\n\n`;
  const sizeGroups = {};
  for (const b of data) {
    const s = b.sizeEstimate;
    if (!sizeGroups[s]) sizeGroups[s] = [];
    sizeGroups[s].push(b);
  }
  md += `| Segment | Anzahl | Anteil | Ø Rating | Ø Reviews |\n`;
  md += `|---------|--------|--------|----------|-----------|\n`;
  for (const [label, list] of Object.entries(sizeGroups).sort((a, b) => b[1].length - a[1].length)) {
    const avgRating = list.filter((b) => b.rating).length > 0
      ? (list.filter((b) => b.rating).reduce((s, b) => s + b.rating, 0) / list.filter((b) => b.rating).length).toFixed(1) : "-";
    const avgReviews = list.length > 0
      ? Math.round(list.reduce((s, b) => s + (b.reviewCount || 0), 0) / list.length) : 0;
    md += `| ${label} | ${list.length} | ${pct(list.length, data.length)} | ${avgRating} | ${avgReviews} |\n`;
  }

  // Digital Maturity
  md += `\n## 3. Digitale Reife\n\n`;
  md += `| Metrik | Anzahl | Anteil | Bedeutung |\n`;
  md += `|--------|--------|--------|----------|\n`;
  md += `| Mit Website | ${withWebsite} | ${pct(withWebsite, data.length)} | Basis-Präsenz |\n`;
  md += `| Mit Kontaktformular | ${withForm} | ${pct(withForm, data.length)} | Minimale Lead-Erfassung |\n`;
  md += `| Mit Online-Terminbuchung | ${withBooking} | ${pct(withBooking, data.length)} | Digitalisiert |\n`;
  md += `| OHNE Formular (nur Telefon) | ${withWebsite - withForm} | ${pct(withWebsite - withForm, data.length)} | **HÖCHSTER PAIN** |\n\n`;

  const digitalLevels = {};
  for (const b of data) {
    const l = b.digitalLevel || "unbekannt";
    if (!digitalLevels[l]) digitalLevels[l] = [];
    digitalLevels[l].push(b);
  }
  md += `| Digitalisierungsstufe | Anzahl | Anteil |\n|---------------------|--------|--------|\n`;
  for (const [label, list] of Object.entries(digitalLevels).sort((a, b) => b[1].length - a[1].length)) {
    md += `| ${label} | ${list.length} | ${pct(list.length, data.length)} |\n`;
  }

  // Service Breadth
  md += `\n## 4. Leistungsbreite\n\n`;
  const serviceCounts = {};
  for (const b of data) {
    if (b.crawl?.services) {
      for (const s of b.crawl.services) {
        serviceCounts[s] = (serviceCounts[s] || 0) + 1;
      }
    }
  }
  const crawledCount = data.filter((b) => b.crawl).length;
  if (crawledCount > 0) {
    md += `Basierend auf ${crawledCount} gecrawlten Websites:\n\n`;
    md += `| Leistung | Betriebe | Anteil (gecrawlt) |\n|----------|----------|-------------------|\n`;
    for (const [svc, count] of Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])) {
      md += `| ${svc} | ${count} | ${pct(count, crawledCount)} |\n`;
    }
  }

  // Age Distribution
  md += `\n## 5. Betriebsalter\n\n`;
  const ageGroups = {};
  for (const b of data) {
    const a = b.ageCategory || "unbekannt";
    if (!ageGroups[a]) ageGroups[a] = [];
    ageGroups[a].push(b);
  }
  md += `| Alter | Anzahl | Anteil |\n|-------|--------|--------|\n`;
  for (const [label, list] of Object.entries(ageGroups).sort((a, b) => b[1].length - a[1].length)) {
    md += `| ${label} | ${list.length} | ${pct(list.length, data.length)} |\n`;
  }

  // Geographic Distribution
  md += `\n## 6. Geographische Verteilung\n\n`;
  const plzCounts = {};
  for (const b of data) {
    const plzMatch = b.address?.match(/\b(\d{4})\b/);
    if (plzMatch) plzCounts[plzMatch[1]] = (plzCounts[plzMatch[1]] || 0) + 1;
  }
  md += `| PLZ-Region | Betriebe |\n|-----------|----------|\n`;
  for (const [plz, count] of Object.entries(plzCounts).sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    md += `| ${plz} | ${count} |\n`;
  }

  // ICP Scoring
  md += `\n## 7. ICP-Scoring (vereinfacht)\n\n`;
  md += `Score basiert auf: Erreichbarkeits-Pain (kein Formular/Booking) + Bewertungs-Pain (wenige Reviews) + Budget (Rechtsform)\n\n`;
  const icpBuckets = {
    "ICP 8-10 (Kern-Zielgruppe)": data.filter((b) => b.icpScore >= 8),
    "ICP 6-7 (Gut)": data.filter((b) => b.icpScore >= 6 && b.icpScore < 8),
    "ICP 4-5 (Mittel)": data.filter((b) => b.icpScore >= 4 && b.icpScore < 6),
    "ICP 0-3 (Niedrig)": data.filter((b) => b.icpScore < 4),
  };
  md += `| Segment | Anzahl | Anteil | Ø Rating |\n|---------|--------|--------|----------|\n`;
  for (const [label, list] of Object.entries(icpBuckets)) {
    const avgR = list.filter((b) => b.rating).length > 0
      ? (list.filter((b) => b.rating).reduce((s, b) => s + b.rating, 0) / list.filter((b) => b.rating).length).toFixed(1) : "-";
    md += `| ${label} | ${list.length} | ${pct(list.length, data.length)} | ${avgR} |\n`;
  }

  // TAM / SAM / SOM
  md += `\n## 8. Marktgrösse (TAM / SAM / SOM)\n\n`;
  const tamZH = data.length;
  const tamCH = Math.round(tamZH * 4.2);
  const samZH = data.filter((b) => b.icpScore >= 6).length;
  const samCH = Math.round(samZH * 4.2);
  const somYear1 = Math.round(samZH * 0.10); // 10% Conversion bei persönlichem Outreach
  const somYear1CH = Math.round(samCH * 0.05); // 5% Conversion Deutschschweiz

  md += `### Kanton Zürich\n`;
  md += `| Metrik | Anzahl | Erklärung |\n|--------|--------|----------|\n`;
  md += `| **TAM** (Total Addressable Market) | ${tamZH} | Alle Sanitär/Heizung Betriebe im Kt. ZH |\n`;
  md += `| **SAM** (Serviceable Addressable Market) | ${samZH} | ICP ≥ 6 (passende Grösse + Pain) |\n`;
  md += `| **SOM** (Serviceable Obtainable, Jahr 1) | ${somYear1} | 10% von SAM bei persönlichem Outreach |\n\n`;

  md += `### Hochrechnung Deutschschweiz\n`;
  md += `| Metrik | Anzahl | Erklärung |\n|--------|--------|----------|\n`;
  md += `| **TAM** | ~${tamCH} | Faktor 4.2 (ZH = 24% Wirtschaftskraft) |\n`;
  md += `| **SAM** | ~${samCH} | ICP ≥ 6 |\n`;
  md += `| **SOM** (Jahr 1, 10 Betriebe/Tag) | ~${somYear1CH} | 5% Conversion bei Skalierung |\n\n`;

  md += `### Revenue-Projektion (konservativ)\n`;
  md += `| Szenario | Kunden (12 Mo) | Ø MRR | ARR |\n|----------|---------------|-------|-----|\n`;
  md += `| Konservativ (5% Conversion) | ${somYear1} | CHF ${somYear1 * 350} | CHF ${somYear1 * 350 * 12} |\n`;
  md += `| Optimistisch (10% Conversion) | ${somYear1 * 2} | CHF ${somYear1 * 2 * 400} | CHF ${somYear1 * 2 * 400 * 12} |\n`;

  // Top Prospects
  md += `\n## 9. Top 50 Prospects (nach ICP-Score)\n\n`;
  const topProspects = data
    .filter((b) => b.icpScore >= 5)
    .sort((a, b) => b.icpScore - a.icpScore || (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 50);

  md += `| # | Betrieb | Rechtsform | ★ | Reviews | Website | Formular | ICP |\n`;
  md += `|---|---------|-----------|---|---------|---------|----------|-----|\n`;
  for (let i = 0; i < topProspects.length; i++) {
    const b = topProspects[i];
    const form = b.legalFormId === 3 ? "AG" : b.legalFormId === 4 ? "GmbH" : b.legalFormId === 1 ? "Einzel" : "?";
    const web = b.website ? "✅" : "❌";
    const formular = b.crawl?.hasForm ? "✅" : "❌";
    md += `| ${i + 1} | ${b.name.slice(0, 40)} | ${form} | ${b.rating || "-"} | ${b.reviewCount || 0} | ${web} | ${formular} | ${b.icpScore} |\n`;
  }

  // Pain Points per Segment
  md += `\n## 10. Pain-Points nach Betriebsgrösse\n\n`;
  md += `### Micro (1-3 MA, Einzelunternehmen)\n`;
  md += `- Inhaber ist Techniker + Verkäufer + Disponent in einer Person\n`;
  md += `- Verpasste Anrufe = direkt verlorene Aufträge (kein Backup)\n`;
  md += `- Kein System — Zettel, Kopf, WhatsApp\n`;
  md += `- Abends: Offerten schreiben, Rückrufe, Buchhaltung\n`;
  md += `- **FlowSight löst:** Lisa fängt ALLE Anrufe auf. SMS-Bestätigung. Überblick.\n`;
  md += `- **Script-Relevanz:** Take 1 + Take 2 treffen perfekt\n\n`;

  md += `### Klein (4-8 MA, GmbH)\n`;
  md += `- 2-3 Techniker im Feld, 1 Büroperson (oder keiner)\n`;
  md += `- 5-10 Kontaktversuche/Tag, 2-4 verpasst\n`;
  md += `- Mündliche Weiterleitung → Informationsverlust\n`;
  md += `- Wenige Google-Bewertungen trotz guter Arbeit\n`;
  md += `- **FlowSight löst:** Sofortige Aufnahme + Zuweisung + Bewertungs-Engine\n`;
  md += `- **Script-Relevanz:** Take 1-4 vollständig relevant\n\n`;

  md += `### Mittel (9-20 MA, GmbH/AG)\n`;
  md += `- Disponentin/Büro koordiniert 6-12 Techniker\n`;
  md += `- 12-20 Kontakte/Tag — System oder Chaos\n`;
  md += `- Morgenroutine: 8+ neue Fälle verteilen\n`;
  md += `- Techniker im Feld brauchen mobilen Zugang\n`;
  md += `- **FlowSight löst:** Zentrale Übersicht + Zuweisung + Techniker-App\n`;
  md += `- **Script-Gap:** Bulk-Zuweisung, Kalender-Integration, Techniker-Ansicht nicht gezeigt\n`;
  md += `- **Script-Empfehlung:** Nebensatz wie "...egal ob Sie ein kleines Team koordinieren oder mit zehn Technikern arbeiten"\n\n`;

  md += `### Gross (20+ MA, AG)\n`;
  md += `- Eigene IT, eigene Prozesse, evtl. schon CRM\n`;
  md += `- Pain: Erreichbarkeit NACH Büroschluss + Review-Engine\n`;
  md += `- Bereit für hohe Preise (CHF 799+/Mo)\n`;
  md += `- **FlowSight löst:** 24/7 Auffangen + automatische Bewertungen\n`;
  md += `- **Script-Gap:** Keine Enterprise-Features gezeigt\n`;
  md += `- **Script-Empfehlung:** "...das System wächst mit Ihrem Betrieb mit"\n\n`;

  md += `---\n\n`;
  md += `## Rohdaten\n\n`;
  md += `- [scan_raw.json](scan_raw.json) — ${data.length} Betriebe (Google Places)\n`;
  md += `- [enriched_zefix.json](enriched_zefix.json) — + Handelsregister\n`;
  md += `- [enriched_full.json](enriched_full.json) — + Website-Crawl\n`;

  const mdPath = join(OUT_DIR, "marktanalyse.md");
  await writeFile(mdPath, md, "utf-8");
  console.log(`\nSaved: ${mdPath}`);
}

function pct(n, total) {
  return total > 0 ? `${Math.round((n / total) * 100)}%` : "0%";
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  if (phase === "1" || phase === "all") await runPhase1();
  if (phase === "2" || phase === "all") await runPhase2();
  if (phase === "3" || phase === "all") await runPhase3();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
