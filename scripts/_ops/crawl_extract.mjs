#!/usr/bin/env node
/**
 * crawl_extract.mjs — Crawl a Swiss business website and extract structured data.
 *
 * Uses Playwright to render pages (handles Wix, JS-only sites).
 * Discovers subpages, extracts text, parses fields, calls Google Places API.
 * Output: docs/customers/{slug}/crawl_extract.json
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/crawl_extract.mjs \
 *     --url https://www.waeltisohn.ch --slug waelti-sohn-ag
 *
 * Env:
 *   GOOGLE_PLACES_API_KEY  — for rating/review count (optional, skips if missing)
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const inputUrl = getArg("--url");
const slug = getArg("--slug");

if (!inputUrl || !slug) {
  console.error(`
Usage: node --env-file=src/web/.env.local scripts/_ops/crawl_extract.mjs \\
  --url https://www.example.ch --slug example-ag

Required:
  --url    Website URL to crawl
  --slug   Customer slug (kebab-case)
`);
  process.exit(1);
}

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || null;
const baseUrl = inputUrl.replace(/\/+$/, "");
const domain = new URL(baseUrl).hostname;

// ── Page discovery config ────────────────────────────────────────────────
// For each logical page, try multiple URL patterns
const PAGE_PATTERNS = {
  home: ["/"],
  team: ["/team", "/ueber-uns", "/about", "/about-us", "/uber-uns", "/unser-team", "/firma", "/portrait", "/unternehmen"],
  services: ["/dienstleistungen", "/services", "/leistungen", "/dienstleistungen-service", "/angebot", "/leistung", "/kompetenzen", "/sortiment"],
  kontakt: ["/kontakt", "/contact", "/kontakt-1", "/kontakt-2"],
  karriere: ["/karriere", "/jobs", "/stellen", "/offene-stellen", "/lehrstellen", "/career"],
  impressum: ["/impressum", "/imprint", "/legal", "/rechtliches"],
};

// ── Extraction regexes ───────────────────────────────────────────────────
const PHONE_RE = /(?:\+41\s?|0)(?:\s?\(?\d{1,3}\)?)[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const YEAR_RE = /(?:seit|gegr[uü]ndet|gr[uü]ndung|established|founded)[\s:]*(\d{4})/i;
const YEAR_STANDALONE_RE = /\b(19\d{2}|20[0-2]\d)\b/g;
const PLZ_RE = /\b(\d{4})\s+([A-ZÄÖÜ][a-zäöüéèê]+(?:\s+(?:am\s+)?[A-ZÄÖÜ][a-zäöüéèê]*)*)/g;
const OPENING_HOURS_RE = /(?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?|Ö(?:ff|eff)nungszeiten|Gesch[aä]ftszeiten|Bürozeiten|Telefonzeiten|Erreichbarkeit)[\s\S]{0,300}?(?:\d{1,2}[:.]\d{2}[\s\S]*?\d{1,2}[:.]\d{2})/gi;
const NOTDIENST_RE = /(?:Notdienst|Notfall|24[\s/]*7|Pikett|Nacht[\s-]*dienst|Stördienst|Hauswart-Notfall|ausserhalb\s+der\s+(?:Büro|Geschäfts)zeiten)/i;
const MEMBER_RE = /(?:suissetec|VSSH|aqua\s*suisse|SIA|Innung|Fachverband|Verband|Gebäudetechnik|SwissGAS|ProKlima|Minergie)/gi;

// ── State ────────────────────────────────────────────────────────────────
const pageTexts = {};      // pageKey → text
const pageSources = {};    // pageKey → url that worked
const allTexts = [];       // all text concatenated

// ── Result template ──────────────────────────────────────────────────────
const result = {
  _meta: {
    crawled_at: new Date().toISOString(),
    source_url: inputUrl,
    crawler: "playwright",
    pages_crawled: [],
  },
  firma: { value: "", source: "", verified: false },
  inhaber: { value: null, source: "not_found", verified: false },
  adresse: { value: "", source: "", verified: false },
  telefon: { value: "", source: "", verified: false },
  email: { value: "", source: "", verified: false },
  oeffnungszeiten: { value: null, source: "not_found", verified: false, action: "founder_confirm" },
  notdienst: { value: null, source: "not_found", verified: false, action: "skip" },
  google: { rating: null, review_count: null, source: "google_api", verified: false },
  gruendung: { value: null, source: "not_found", verified: false },
  team_groesse: { value: null, source: "not_found", verified: false, note: "NIEMALS aus Fotos herleiten" },
  leistungen: { value: {}, source: "", verified: false },
  einzugsgebiet: { value: null, source: "not_found", verified: false, action: "auto_derive_from_plz" },
  mitgliedschaften: { value: null, source: "not_found", verified: false },
  stellenangebote: { value: null, source: "not_found", verified: false },
  markenpartner: { value: null, source: "not_found", verified: false },
  werte: { value: null, source: "not_found", verified: false },
  brand_color: { value: null, source: "", verified: false },
  website_url: { value: inputUrl, source: "input", verified: true },
  besonderheiten: { value: null, source: "not_found", verified: false },
};

// ── Helpers ──────────────────────────────────────────────────────────────
function sourceTag(pageKey) {
  const map = {
    home: "website_home",
    team: "website_team",
    services: "website_services",
    kontakt: "website_kontakt",
    karriere: "website_jobs",
    impressum: "website_impressum",
  };
  return map[pageKey] || "website_home";
}

function unique(arr) {
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
}

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// ── Page crawling ────────────────────────────────────────────────────────
async function crawlPage(page, url, pageKey) {
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Check if the page actually loaded (not 404/5xx)
    if (!response || response.status() >= 400) {
      return null;
    }

    // Wait for JS rendering (Wix, React, etc.)
    await page.waitForTimeout(3000);

    // Scroll to trigger lazy-loaded content
    await page.evaluate(async () => {
      const distance = 400;
      let total = 0;
      while (total < document.body.scrollHeight) {
        window.scrollBy(0, distance);
        total += distance;
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(1000);

    const text = await page.evaluate(() => document.body.innerText);
    return text || null;
  } catch (err) {
    // Timeout or navigation error — silently skip
    return null;
  }
}

async function extractBrandColor(page) {
  try {
    const color = await page.evaluate(() => {
      // Strategy 1: Header/nav background
      const header = document.querySelector("header, nav, [role='banner']");
      if (header) {
        const bg = getComputedStyle(header).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && bg !== "rgb(255, 255, 255)") {
          return bg;
        }
      }

      // Strategy 2: First h1 or h2 color
      for (const tag of ["h1", "h2"]) {
        const el = document.querySelector(tag);
        if (el) {
          const c = getComputedStyle(el).color;
          if (c && c !== "rgb(0, 0, 0)" && c !== "rgb(255, 255, 255)" && c !== "rgba(0, 0, 0, 0)") {
            return c;
          }
        }
      }

      // Strategy 3: Primary button background
      const btn = document.querySelector("a.btn, button.btn, .cta, [class*='primary'], a[class*='button']");
      if (btn) {
        const bg = getComputedStyle(btn).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && bg !== "rgb(255, 255, 255)") {
          return bg;
        }
      }

      // Strategy 4: Most common non-black/white color in first 500px
      const links = document.querySelectorAll("a");
      const colorCounts = {};
      for (const link of Array.from(links).slice(0, 20)) {
        const c = getComputedStyle(link).color;
        if (c && c !== "rgb(0, 0, 0)" && c !== "rgb(255, 255, 255)") {
          colorCounts[c] = (colorCounts[c] || 0) + 1;
        }
      }
      const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) return sorted[0][0];

      return null;
    });

    if (!color) return null;

    // Convert rgb(...) to hex
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }

    return color;
  } catch {
    return null;
  }
}

// ── Field extraction ─────────────────────────────────────────────────────

function extractFirma() {
  // Collect all AG/GmbH mentions and pick the shortest/cleanest one
  const candidates = [];

  for (const key of ["impressum", "home", "kontakt"]) {
    const text = pageTexts[key];
    if (!text) continue;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines.slice(0, 40)) {
      // Match standalone company name: 1-5 words + legal form
      // Use a tighter regex that avoids capturing long preamble
      const re = /(?:^|[\s,.:(])([A-ZÄÖÜ][a-zäöüéèê]*(?:\s+(?:&\s+)?[A-ZÄÖÜ][a-zäöüéèê]*){0,4}\s+(?:AG|GmbH|Sàrl|SA|KlG|Genossenschaft))\b/g;
      for (const m of line.matchAll(re)) {
        const name = m[1].trim();
        // Prefer shorter matches (less context pollution)
        candidates.push({ name, source: sourceTag(key), len: name.length });
      }
    }
  }

  if (candidates.length > 0) {
    // Sort by length — shortest match is usually the cleanest company name
    candidates.sort((a, b) => a.len - b.len);
    return { value: candidates[0].name, source: candidates[0].source, verified: true };
  }

  // Fallback: use <title> or first heading
  const homeText = pageTexts.home;
  if (homeText) {
    const lines = homeText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      return { value: lines[0].slice(0, 80), source: "website_home", verified: false };
    }
  }

  return { value: "", source: "not_found", verified: false };
}

function extractInhaber() {
  for (const key of ["team", "impressum", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Look for explicit owner/manager patterns
    // Pattern: "Title: Firstname Lastname" — name is 2-4 words starting with uppercase
    const patterns = [
      /(?:Gesch[aä]ftsf[uü]hr(?:er|ung)|Inhaber(?:in)?|CEO|Direktor(?:in)?|Geschäftsleitung|Managing\s+Director|Eigent[uü]mer)[\s:.,–-]+([A-ZÄÖÜ][a-zäöüéèê]+\s+[A-ZÄÖÜ][a-zäöüéèê]+(?:\s+[A-ZÄÖÜ][a-zäöüéèê]+)?)/g,
      /([A-ZÄÖÜ][a-zäöüéèê]+\s+[A-ZÄÖÜ][a-zäöüéèê]+(?:\s+[A-ZÄÖÜ][a-zäöüéèê]+)?)[\s,–-]+(?:Gesch[aä]ftsf[uü]hr(?:er|ung)|Inhaber(?:in)?|CEO|Geschäftsleitung)/g,
    ];

    for (const re of patterns) {
      const matches = [...text.matchAll(re)];
      if (matches.length > 0) {
        const names = matches.map((m) => {
          // Clean: take only first 2-3 capitalized words (firstname + lastname)
          const raw = m[1].trim();
          const words = raw.split(/\s+/).filter((w) => /^[A-ZÄÖÜ]/.test(w));
          // Stop at first non-name word (e.g. "Haustechnik", "GmbH")
          const nameWords = [];
          for (const w of words) {
            if (/^(Haustechnik|Sanitär|AG|GmbH|Heizung|Service|und|Sohn|Söhne)$/i.test(w)) break;
            nameWords.push(w);
          }
          return nameWords.slice(0, 3).join(" ");
        }).filter((n) => n.split(" ").length >= 2); // Must have at least first+last name
        if (names.length > 0) {
          return { value: unique(names).join(", "), source: sourceTag(key), verified: true };
        }
      }
    }
  }
  return { value: null, source: "not_found", verified: false };
}

function extractAdresse() {
  for (const key of ["kontakt", "impressum", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Look for Swiss address pattern: Street + Number, PLZ City
    const addressRe = /([A-ZÄÖÜ][a-zäöüéèê]+(?:strasse|weg|gasse|platz|rain|halden|rain)\s*\d{1,4}[a-z]?)[\s,]*(\d{4})\s+([A-ZÄÖÜ][a-zäöüéèê]+(?:\s+(?:am\s+)?[A-ZÄÖÜ][a-zäöüéèê]*)*)/gi;
    const matches = [...text.matchAll(addressRe)];
    if (matches.length > 0) {
      const m = matches[0];
      return { value: `${m[1]}, ${m[2]} ${m[3]}`, source: sourceTag(key), verified: true };
    }

    // Broader pattern: PLZ + City with any preceding street
    const plzMatches = [...text.matchAll(PLZ_RE)];
    if (plzMatches.length > 0) {
      // Try to find a street before the PLZ
      const m = plzMatches[0];
      const plzIdx = text.indexOf(m[0]);
      const before = text.slice(Math.max(0, plzIdx - 100), plzIdx);
      const streetMatch = before.match(/([A-ZÄÖÜ][a-zäöüéèê]+(?:strasse|weg|gasse|platz|rain|halden)\s*\d{1,4}[a-z]?)\s*$/i);
      if (streetMatch) {
        return { value: `${streetMatch[1]}, ${m[1]} ${m[2]}`, source: sourceTag(key), verified: true };
      }
      // Just PLZ + City
      return { value: `${m[1]} ${m[2]}`, source: sourceTag(key), verified: true };
    }
  }
  return { value: "", source: "not_found", verified: false };
}

function extractTelefon() {
  const phones = new Set();
  for (const key of ["kontakt", "home", "impressum"]) {
    const text = pageTexts[key];
    if (!text) continue;
    const matches = text.match(PHONE_RE) || [];
    for (const m of matches) {
      phones.add(m.replace(/\s+/g, " ").trim());
    }
  }
  if (phones.size > 0) {
    const list = [...phones];
    return { value: list.join(", "), source: "website_kontakt", verified: true };
  }
  return { value: "", source: "not_found", verified: false };
}

function extractEmail() {
  const emails = new Set();
  for (const key of ["kontakt", "impressum", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;
    const matches = text.match(EMAIL_RE) || [];
    for (const m of matches) {
      // Filter out platform defaults, trackers, and common non-business emails
      const lower = m.toLowerCase();
      const junk = ["sentry", "wix", "example", "website.com", "wixpress", "sentry.io",
        "placeholder", "test@", "noreply", "no-reply", "wordpress", "squarespace",
        "google", "facebook", "twitter", ".png", ".jpg", ".svg", ".gif"];
      if (!junk.some((j) => lower.includes(j))) {
        emails.add(lower);
      }
    }
  }
  if (emails.size > 0) {
    // Prefer info@ or service@ over others
    const list = [...emails].sort((a, b) => {
      if (a.startsWith("info@")) return -1;
      if (b.startsWith("info@")) return 1;
      if (a.startsWith("service@")) return -1;
      if (b.startsWith("service@")) return 1;
      return 0;
    });
    return { value: list.join(", "), source: "website_kontakt", verified: true };
  }
  return { value: "", source: "not_found", verified: false };
}

function extractOeffnungszeiten() {
  for (const key of ["kontakt", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Strategy 1: Find a block after "Öffnungszeiten" / "Bürozeiten" header
    const headerRe = /(?:Ö(?:ff|eff)nungszeiten|Gesch[aä]ftszeiten|Bürozeiten|Telefonzeiten|Erreichbarkeit)\s*[:\n]*([\s\S]{10,400}?)(?:\n\s*\n|\n[A-Z])/gi;
    const headerMatch = text.match(headerRe);
    if (headerMatch) {
      const block = headerMatch[0];
      // Extract individual day → time patterns
      const dayRe = /(Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)[\s\-–bis]*((?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?))?\s*[:\s]+(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})(?:\s*(?:und|,|&)\s*(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2}))?/gi;
      const dayMatches = [...block.matchAll(dayRe)];

      if (dayMatches.length > 0) {
        const hours = {};
        for (const dm of dayMatches) {
          const dayRange = dm[2] ? `${dm[1]}-${dm[2]}` : dm[1];
          let time = `${dm[3]}-${dm[4]}`;
          if (dm[5] && dm[6]) time += ` und ${dm[5]}-${dm[6]}`;
          hours[dayRange] = time;
        }
        return { value: hours, source: sourceTag(key), verified: true };
      }
    }

    // Strategy 2: Look for day-time patterns anywhere
    const dayTimeRe = /(Mo(?:ntag)?[\s\-–]*(?:Fr(?:eitag)?|Sa(?:mstag)?)?)\s*[:\s]+(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})/gi;
    const dayTimeMatches = [...text.matchAll(dayTimeRe)];
    if (dayTimeMatches.length > 0) {
      const hours = {};
      for (const dm of dayTimeMatches) {
        hours[dm[1].trim()] = `${dm[2]}-${dm[3]}`;
      }
      return { value: hours, source: sourceTag(key), verified: true };
    }
  }
  return { value: null, source: "not_found", verified: false, action: "founder_confirm" };
}

function extractNotdienst() {
  for (const key of ["kontakt", "home", "services"]) {
    const text = pageTexts[key];
    if (!text) continue;

    if (NOTDIENST_RE.test(text)) {
      // Extract surrounding context
      const idx = text.search(NOTDIENST_RE);
      const context = text.slice(Math.max(0, idx - 50), idx + 200).trim();
      // Look for a phone number nearby
      const nearbyPhone = context.match(PHONE_RE);
      return {
        value: cleanText(context.slice(0, 200)),
        source: sourceTag(key),
        verified: true,
        phone: nearbyPhone ? nearbyPhone[0] : null,
      };
    }
  }
  return { value: null, source: "not_found", verified: false, action: "skip" };
}

function extractGruendung() {
  for (const key of ["team", "home", "impressum"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Explicit founding pattern
    const explicit = text.match(YEAR_RE);
    if (explicit) {
      return { value: explicit[1], source: sourceTag(key), verified: true };
    }

    // Look for year in context of "seit", "Tradition", "Generation"
    const contextRe = /(?:seit|Tradition|Generation[en]*|Jahre?|History|Geschichte)[\s\S]{0,50}?(19\d{2}|20[0-2]\d)/gi;
    const ctxMatch = text.match(contextRe);
    if (ctxMatch) {
      const yearMatch = ctxMatch[0].match(/(19\d{2}|20[0-2]\d)/);
      if (yearMatch) {
        return { value: yearMatch[1], source: sourceTag(key), verified: true };
      }
    }
  }
  return { value: null, source: "not_found", verified: false };
}

function extractTeamGroesse() {
  for (const key of ["team", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Look for explicit team size mentions — require number >= 2 (1 person is not a "team size" statement)
    const patterns = [
      /(\d{1,3})\s*(?:Mitarbeiter(?:innen)?|Angestellte|Fachleute|Profis|Spezialisten|Mitarbeitende|Teammitglieder)/i,
      /(?:Team|Belegschaft|Mannschaft)\s+(?:von\s+)?(\d{1,3})\b/i,
      /(?:rund|ca\.?|über|mehr\s+als|circa)\s+(\d{1,3})\s*(?:Mitarbeiter(?:innen)?|Angestellte|Fachleute)/i,
    ];

    for (const re of patterns) {
      const match = text.match(re);
      if (match) {
        const num = parseInt(match[1], 10);
        // Sanity check: must be 2-500 to be a team size, not a page number or year fragment
        if (num >= 2 && num <= 500) {
          return { value: num, source: sourceTag(key), verified: true };
        }
      }
    }
  }
  return { value: null, source: "not_found", verified: false, note: "NIEMALS aus Fotos herleiten" };
}

function extractLeistungen() {
  for (const key of ["services", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;

    const categories = {};
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // Common service keywords for Swiss plumbing/heating businesses
    const serviceKeywords = {
      "Sanitär": /sanit[aä]r|badezimmer|dusche|bad\b|WC|toilette|waschtisch|armaturen|kalt[\s-]*und[\s-]*warmwasser/i,
      "Heizung": /heizung|heiz|w[aä]rmepumpe|w[aä]rme|fussbodenheizung|radiatoren|heizk[oö]rper|thermostat/i,
      "Boiler/Warmwasser": /boiler|warmwasser|entkalkung|speicher|durchlauferhitzer/i,
      "Rohrbruch/Leitungen": /rohrbruch|rohrleitungen|rohr|leitungsbau|wasserleitung|gasleitung/i,
      "Verstopfung/Abfluss": /verstopf|abfluss|kanalisation|entwässerung|abwasser|drainage/i,
      "Lüftung/Klima": /l[uü]ftung|klima|klimaanlage|bel[uü]ftung|ventilation/i,
      "Umbau/Sanierung": /umbau|sanier|renovier|neubau|renovation|umgestaltung/i,
      "Solar/Erneuerbar": /solar|photovoltaik|erneuerbar|w[aä]rmepumpe/i,
      "Beratung/Planung": /beratung|planung|projekt|offerte|konzept/i,
      "Kundendienst": /kundendienst|service|reparatur|wartung|unterhalt|pflege/i,
      "Gas": /gas(?:leitung|installation|ger[aä]t)|erdgas/i,
      "Spenglerei": /spenglerei|blechnerei|dach(?:rinne|entw[aä]sserung)|flachdach/i,
    };

    // Check each line against keywords
    for (const [cat, re] of Object.entries(serviceKeywords)) {
      const matchingLines = lines.filter((l) => re.test(l));
      if (matchingLines.length > 0) {
        categories[cat] = matchingLines.slice(0, 5).map((l) => cleanText(l.slice(0, 120)));
      }
    }

    if (Object.keys(categories).length > 0) {
      return { value: categories, source: sourceTag(key), verified: true };
    }
  }
  return { value: {}, source: "not_found", verified: false };
}

function extractEinzugsgebiet() {
  for (const key of ["home", "kontakt", "services"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Only match explicit service area declarations
    const patterns = [
      /(?:Einzugsgebiet|Einsatzgebiet|Servicegebiet|T[aä]tig\s+in|Wir\s+sind\s+(?:in|f[uü]r)\s+Sie\s+(?:in|da))[\s:]+([^.\n]{10,200})/gi,
      /(?:Wir\s+bedienen|Unser(?:e)?\s+(?:Einsatz|Service|Einzugs)gebiet|Region)[:\s]+([^.\n]{10,200})/gi,
    ];

    for (const re of patterns) {
      const matches = [...text.matchAll(re)];
      if (matches.length > 0) {
        const val = cleanText(matches[0][1].slice(0, 200));
        // Sanity check: should contain at least one city-like word (capitalized, not a generic word)
        if (/[A-ZÄÖÜ][a-zäöüéèê]{2,}/.test(val) && !/^\s*(?:für|von|und|Integration|Service)\s/i.test(val)) {
          return { value: val, source: sourceTag(key), verified: true };
        }
      }
    }
  }
  return { value: null, source: "not_found", verified: false, action: "auto_derive_from_plz" };
}

function extractMitgliedschaften() {
  const members = new Set();
  for (const key of Object.keys(pageTexts)) {
    const text = pageTexts[key];
    if (!text) continue;
    const matches = text.match(MEMBER_RE) || [];
    for (const m of matches) members.add(m.trim());
  }
  if (members.size > 0) {
    return { value: [...members], source: "website_home", verified: true };
  }
  return { value: null, source: "not_found", verified: false };
}

function extractStellenangebote() {
  const text = pageTexts.karriere;
  if (!text) return { value: null, source: "not_found", verified: false };

  const patterns = [
    /(?:offene\s+Stellen?|Lehrstellen?|Ausbildungspl[aä]tze?|Lehrling|Stifti|Karriere|Job)/i,
  ];

  for (const re of patterns) {
    if (re.test(text)) {
      // Extract relevant section
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const relevantLines = lines.filter((l) =>
        /stell|lehr|job|beruf|ausbildung|praktik|karriere/i.test(l),
      );
      if (relevantLines.length > 0) {
        return { value: relevantLines.slice(0, 5).join("; "), source: "website_jobs", verified: true };
      }
      return { value: "Karriere-Seite vorhanden, Details prüfen", source: "website_jobs", verified: false };
    }
  }
  return { value: null, source: "not_found", verified: false };
}

function extractMarkenpartner() {
  const brands = new Set();
  const knownBrands = [
    "Geberit", "Grohe", "Hansgrohe", "Duravit", "Keramag", "Laufen", "Dornbracht",
    "Viessmann", "Buderus", "Vaillant", "Hoval", "CTA", "Stiebel Eltron", "Daikin",
    "Zehnder", "Franke", "Arbonia", "Siemens", "Bosch", "Roth", "Grundfos",
    "Wilo", "Oventrop", "Danfoss", "Belimo", "Similor", "KWC", "Oras", "Schmidlin",
  ];

  for (const key of Object.keys(pageTexts)) {
    const text = pageTexts[key];
    if (!text) continue;
    for (const brand of knownBrands) {
      if (text.includes(brand)) brands.add(brand);
    }
  }

  if (brands.size > 0) {
    return { value: [...brands], source: "website_home", verified: true };
  }
  return { value: null, source: "not_found", verified: false };
}

function extractWerte() {
  for (const key of ["home", "team"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Look for slogans, mission statements
    const patterns = [
      /(?:Unser\s+(?:Leitbild|Motto|Versprechen|Slogan|Anspruch)|Qualit[aä]t|Tradition|Zuverlässig|Kompetenz|Kundenn[aä]he)[\s:]+([^.]{10,200})/gi,
      /(?:Wir\s+stehen\s+f[uü]r|Was\s+uns\s+ausmacht|Unsere?\s+Werte?)[\s:]+([^.]{10,200})/gi,
    ];

    for (const re of patterns) {
      const match = text.match(re);
      if (match) {
        return { value: cleanText(match[0].slice(0, 200)), source: sourceTag(key), verified: true };
      }
    }
  }

  // Fallback: first visible slogan-like text on home page
  if (pageTexts.home) {
    const lines = pageTexts.home.split("\n").map((l) => l.trim()).filter((l) => l.length > 20 && l.length < 120);
    // Skip navigation, Wix boilerplate, and generic lines
    const skipPatterns = [
      /^(home|kontakt|team|dienst|impressum|menu|nav|cookie|weiter|skip|log\s*in|anmelden)/i,
      /hauptinhalt|main\s*content|navigation|breadcrumb|footer|header|sidebar/i,
      /@|tel:|fax:|www\./i,
      /^\d{4}/, // years/PLZ at start
      /^\+?\d/, // phone numbers
      /^copyright|^©|datenschutz|privacy|agb/i,
    ];
    const slogan = lines.find((l) =>
      !PHONE_RE.test(l) && !skipPatterns.some((p) => p.test(l)),
    );
    if (slogan) {
      return { value: slogan, source: "website_home", verified: true };
    }
  }

  return { value: null, source: "not_found", verified: false };
}

function extractBesonderheiten() {
  const keywords = {
    Showroom: /showroom|ausstellung|schaukasten/i,
    Laden: /laden|shop|verkauf|geschäft/i,
    Lehrbetrieb: /lehrbetrieb|ausbildungsbetrieb|lehrling|lehrstelle|lernende/i,
    Familienbetrieb: /familienbetrieb|familienunternehmen|generation/i,
    "24h Notdienst": /24[\s/]*(?:h|Stunden)|rund\s+um\s+die\s+Uhr/i,
    "ISO zertifiziert": /ISO\s*\d{4}|zertifiz/i,
  };

  const found = [];
  for (const key of Object.keys(pageTexts)) {
    const text = pageTexts[key];
    if (!text) continue;
    for (const [label, re] of Object.entries(keywords)) {
      if (re.test(text) && !found.includes(label)) {
        found.push(label);
      }
    }
  }

  if (found.length > 0) {
    return { value: found.join(", "), source: "website_home", verified: true };
  }
  return { value: null, source: "not_found", verified: false };
}

// ── Google Places API ────────────────────────────────────────────────────
async function fetchGooglePlaces(companyName, address) {
  if (!GOOGLE_API_KEY) {
    console.log("  [SKIP] Google Places API — no GOOGLE_PLACES_API_KEY set");
    return { rating: null, review_count: null };
  }

  try {
    // Extract city from address for better search
    const plzMatch = address.match(/(\d{4})\s+(\S+)/);
    const city = plzMatch ? plzMatch[2] : "";
    const query = `${companyName} ${city}`.trim();

    console.log(`  [Google] Searching: "${query}"`);

    // Use Places API (New) — Text Search
    const url = `https://places.googleapis.com/v1/places:searchText`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.rating,places.userRatingCount,places.displayName",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "de",
        regionCode: "CH",
      }),
    });

    if (!response.ok) {
      console.error(`  [Google] API error: ${response.status} ${response.statusText}`);
      return { rating: null, review_count: null };
    }

    const data = await response.json();
    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      console.log(`  [Google] Found: ${place.displayName?.text} — ${place.rating} (${place.userRatingCount} reviews)`);
      return {
        rating: place.rating || null,
        review_count: place.userRatingCount || null,
      };
    }

    console.log("  [Google] No results found");
    return { rating: null, review_count: null };
  } catch (err) {
    console.error(`  [Google] Error: ${err.message}`);
    return { rating: null, review_count: null };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== Crawl + Extract: ${inputUrl} ===`);
  console.log(`Slug: ${slug}`);
  console.log(`Google API: ${GOOGLE_API_KEY ? "available" : "not set (skipping)"}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    locale: "de-CH",
  });

  const page = await context.newPage();

  // ── Discover and crawl pages ──
  let pagesFound = 0;
  let pagesFailed = 0;

  for (const [pageKey, patterns] of Object.entries(PAGE_PATTERNS)) {
    let found = false;
    for (const path of patterns) {
      const url = baseUrl + path;
      console.log(`  [${pageKey}] Trying: ${url}`);

      const text = await crawlPage(page, url, pageKey);
      if (text && text.trim().length > 50) {
        pageTexts[pageKey] = text;
        pageSources[pageKey] = url;
        allTexts.push(text);
        result._meta.pages_crawled.push({ key: pageKey, url, chars: text.length });
        pagesFound++;
        found = true;
        console.log(`  [${pageKey}] OK — ${text.length} chars`);
        break;
      }
    }
    if (!found) {
      console.log(`  [${pageKey}] Not found (tried ${patterns.length} patterns)`);
      pagesFailed++;
    }
  }

  console.log(`\nPages found: ${pagesFound}, not found: ${pagesFailed}\n`);

  // ── Extract brand color from home page ──
  console.log("  [brand_color] Extracting...");
  if (pageSources.home) {
    await page.goto(pageSources.home, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);
    const color = await extractBrandColor(page);
    if (color) {
      result.brand_color = { value: color, source: "website_home", verified: true };
      console.log(`  [brand_color] Found: ${color}`);
    } else {
      console.log("  [brand_color] Not found");
    }
  }

  await browser.close();

  // ── Extract all fields ──
  console.log("\n--- Extracting fields ---\n");

  const firmaResult = extractFirma();
  result.firma = firmaResult;
  console.log(`  firma: ${firmaResult.value || "(not found)"} [${firmaResult.source}]`);

  const inhaberResult = extractInhaber();
  result.inhaber = inhaberResult;
  console.log(`  inhaber: ${inhaberResult.value || "(not found)"} [${inhaberResult.source}]`);

  const adresseResult = extractAdresse();
  result.adresse = adresseResult;
  console.log(`  adresse: ${adresseResult.value || "(not found)"} [${adresseResult.source}]`);

  const telefonResult = extractTelefon();
  result.telefon = telefonResult;
  console.log(`  telefon: ${telefonResult.value || "(not found)"} [${telefonResult.source}]`);

  const emailResult = extractEmail();
  result.email = emailResult;
  console.log(`  email: ${emailResult.value || "(not found)"} [${emailResult.source}]`);

  const hoursResult = extractOeffnungszeiten();
  result.oeffnungszeiten = hoursResult;
  console.log(`  oeffnungszeiten: ${hoursResult.value ? "found" : "(not found)"} [${hoursResult.source}]`);

  const notdienstResult = extractNotdienst();
  result.notdienst = notdienstResult;
  console.log(`  notdienst: ${notdienstResult.value ? "found" : "(not found)"} [${notdienstResult.source}]`);

  const gruendungResult = extractGruendung();
  result.gruendung = gruendungResult;
  console.log(`  gruendung: ${gruendungResult.value || "(not found)"} [${gruendungResult.source}]`);

  const teamResult = extractTeamGroesse();
  result.team_groesse = teamResult;
  console.log(`  team_groesse: ${teamResult.value || "(not found)"} [${teamResult.source}]`);

  const leistungenResult = extractLeistungen();
  result.leistungen = leistungenResult;
  console.log(`  leistungen: ${Object.keys(leistungenResult.value).length} categories [${leistungenResult.source}]`);

  const einzugsgebietResult = extractEinzugsgebiet();
  result.einzugsgebiet = einzugsgebietResult;
  console.log(`  einzugsgebiet: ${einzugsgebietResult.value ? "found" : "(not found)"} [${einzugsgebietResult.source}]`);

  const memberResult = extractMitgliedschaften();
  result.mitgliedschaften = memberResult;
  console.log(`  mitgliedschaften: ${memberResult.value ? memberResult.value.join(", ") : "(not found)"}`);

  const stellenResult = extractStellenangebote();
  result.stellenangebote = stellenResult;
  console.log(`  stellenangebote: ${stellenResult.value || "(not found)"}`);

  const markenResult = extractMarkenpartner();
  result.markenpartner = markenResult;
  console.log(`  markenpartner: ${markenResult.value ? markenResult.value.join(", ") : "(not found)"}`);

  const werteResult = extractWerte();
  result.werte = werteResult;
  console.log(`  werte: ${werteResult.value ? werteResult.value.slice(0, 60) + "..." : "(not found)"}`);

  const besondResult = extractBesonderheiten();
  result.besonderheiten = besondResult;
  console.log(`  besonderheiten: ${besondResult.value || "(not found)"}`);

  // ── Google Places API ──
  console.log("\n--- Google Places API ---\n");
  const companyName = result.firma.value || slug;
  const address = result.adresse.value || "";
  const googleResult = await fetchGooglePlaces(companyName, address);
  result.google.rating = googleResult.rating;
  result.google.review_count = googleResult.review_count;
  if (googleResult.rating) {
    result.google.verified = true;
  }

  // ── Save output ──
  const outDir = join("docs", "customers", slug);
  if (!existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
  }

  const outPath = join(outDir, "crawl_extract.json");
  await writeFile(outPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\n--- Saved: ${outPath} ---\n`);

  // ── Summary ──
  const fields = Object.entries(result).filter(([k]) => !k.startsWith("_"));
  let verified = 0;
  let notFound = 0;
  let founderNeeded = 0;

  for (const [key, val] of fields) {
    if (key === "google") {
      if (val.rating !== null) verified++;
      else notFound++;
      continue;
    }
    if (typeof val === "object" && val !== null) {
      if (val.verified === true) verified++;
      else if (val.action === "founder_confirm") founderNeeded++;
      else if (val.source === "not_found" || !val.value) notFound++;
      else founderNeeded++;
    }
  }

  console.log("=== SUMMARY ===");
  console.log(`  ${verified} fields verified`);
  console.log(`  ${notFound} fields not found`);
  console.log(`  ${founderNeeded} fields need Founder input`);
  console.log(`  Pages crawled: ${pagesFound}/${Object.keys(PAGE_PATTERNS).length}`);
  console.log(`  Output: ${outPath}`);
  console.log("================\n");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
