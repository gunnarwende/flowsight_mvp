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

const GOOGLE_API_KEY = process.env.GOOGLE_SCOUT_KEY || process.env.GOOGLE_PLACES_API_KEY || null;
const baseUrl = inputUrl.replace(/\/+$/, "");
const domain = new URL(baseUrl).hostname;

// ── Page discovery config ────────────────────────────────────────────────
// For each logical page, try multiple URL patterns
const PAGE_PATTERNS = {
  home: ["/"],
  team: ["/team", "/ueber-uns", "/about", "/about-us", "/uber-uns", "/unser-team", "/firma", "/portrait", "/unternehmen",
    "/mitarbeiter", "/mitarbeitende", "/das-team", "/ihr-team", "/personen", "/belegschaft", "/ueber", "/wir-ueber-uns", "/team-1"],
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
const pageMeta = {};       // pageKey → { title, ogSiteName, ogTitle }
const pageSources = {};    // pageKey → url that worked
const allTexts = [];       // all text concatenated
let teamSignals = { photoCount: 0, expanded: false };  // gefüllt von analyzeTeam()

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
  google: { place_id: null, rating: null, review_count: null, source: "google_api", verified: false },
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
  _zefix: null,
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

    // Wait for JS rendering (Wix, React, etc.) — knapp gehalten (Speed: läuft ×40+ pro Betrieb)
    await page.waitForTimeout(1800);

    // Scroll to trigger lazy-loaded content
    await page.evaluate(async () => {
      const distance = 600;
      let total = 0;
      while (total < document.body.scrollHeight) {
        window.scrollBy(0, distance);
        total += distance;
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(500);

    const data = await page.evaluate(() => ({
      text: document.body.innerText || "",
      title: document.title || null,
      ogSiteName: document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") || null,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") || null,
    }));
    return data.text ? data : null;
  } catch (err) {
    // Timeout or navigation error — silently skip
    return null;
  }
}

async function extractBrandColor(page) {
  try {
    // Collect weighted color candidates from the most reliable brand-signals first.
    const candidates = await page.evaluate(() => {
      const out = [];
      const push = (c, weight) => { if (c) out.push({ c, weight }); };

      // S0: <meta name="theme-color"> — explicit brand signal, highest trust.
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta?.content) push(meta.content, 100);

      // S1: CSS custom properties on :root (--primary / --brand / --accent ...).
      const rootStyle = getComputedStyle(document.documentElement);
      for (const name of ["--primary","--primary-color","--brand","--brand-color",
        "--color-primary","--accent","--accent-color","--main-color","--theme-color","--bs-primary"]) {
        const v = rootStyle.getPropertyValue(name).trim();
        if (v) push(v, 90);
      }

      // S2: header/nav background.
      const header = document.querySelector("header, nav, [role='banner'], .header, #header, .navbar");
      if (header) push(getComputedStyle(header).backgroundColor, 70);

      // S3: CTA / primary buttons background.
      for (const sel of ["a.btn",".btn-primary","button.btn",".cta","[class*='primary']",
        "a[class*='button']",".button","[class*='btn']"]) {
        const el = document.querySelector(sel);
        if (el) push(getComputedStyle(el).backgroundColor, 60);
      }

      // S4: link colors by frequency.
      const freq = {};
      for (const l of Array.from(document.querySelectorAll("a")).slice(0, 40)) {
        const c = getComputedStyle(l).color;
        if (c) freq[c] = (freq[c] || 0) + 1;
      }
      for (const [c, n] of Object.entries(freq)) push(c, 30 + n);

      // S5: h1/h2 text color.
      for (const tag of ["h1", "h2"]) {
        const el = document.querySelector(tag);
        if (el) push(getComputedStyle(el).color, 20);
      }
      return out;
    });

    // Parse any rgb()/rgba()/#hex to [r,g,b]; reject neutrals (grey/white/black).
    const toRgb = (s) => {
      if (!s) return null;
      s = String(s).trim();
      let m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (m) return [+m[1], +m[2], +m[3]];
      m = s.match(/^#([0-9a-f]{6})$/i);
      if (m) return [parseInt(m[1].slice(0,2),16), parseInt(m[1].slice(2,4),16), parseInt(m[1].slice(4,6),16)];
      m = s.match(/^#([0-9a-f]{3})$/i);
      if (m) return [parseInt(m[1][0]+m[1][0],16), parseInt(m[1][1]+m[1][1],16), parseInt(m[1][2]+m[1][2],16)];
      return null;
    };
    const chroma = ([r,g,b]) => Math.max(r,g,b) - Math.min(r,g,b);
    // Reject: near-grey (chroma<25), near-white, near-black — these are never a brand color.
    const reject = (rgb) => chroma(rgb) < 25 || (rgb[0]>235&&rgb[1]>235&&rgb[2]>235) || (rgb[0]<18&&rgb[1]<18&&rgb[2]<18);

    let best = null, bestScore = -1;
    for (const { c, weight } of candidates) {
      const rgb = toRgb(c);
      if (!rgb || reject(rgb)) continue;
      const score = weight + chroma(rgb); // prominent AND saturated wins
      if (score > bestScore) { bestScore = score; best = rgb; }
    }
    if (!best) return null;
    const [r,g,b] = best;
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  } catch {
    return null;
  }
}

// ── Field extraction ─────────────────────────────────────────────────────

function extractFirma() {
  const LEGAL_FORMS = /\b(AG|GmbH|Sàrl|SA|KlG|Genossenschaft)\b/;
  const LEGAL_FORMS_CI = /\b(AG|GMBH|GmbH|Sàrl|SARL|SA|KlG|KLG|Genossenschaft|GENOSSENSCHAFT)\b/i;

  // ── Priority 1: og:site_name — usually the cleanest company name ──
  const homeMeta = pageMeta.home;
  if (homeMeta) {
    const ogName = homeMeta.ogSiteName?.trim();
    if (ogName && ogName.length >= 3 && ogName.length <= 80) {
      if (LEGAL_FORMS.test(ogName)) {
        console.log(`  [firma] Found via og:site_name: "${ogName}"`);
        return { value: ogName, source: "website_og_site_name", verified: true };
      }
      // Even without legal form, og:site_name is typically the company name
      if (ogName.length <= 50 && !/\b(home|willkommen|startseite|welcome)\b/i.test(ogName)) {
        console.log(`  [firma] Found via og:site_name (no legal form): "${ogName}"`);
        return { value: ogName, source: "website_og_site_name", verified: true };
      }
    }

    // ── Priority 2: <title> tag ──
    const title = homeMeta.title?.trim();
    if (title) {
      // Strategy A: Extract legal entity name from title
      // Handles: "Stark Haustechnik GmbH - Sanitär", "LEINS AG | Horgen", etc.
      const legalRe = /([\w\sÄÖÜäöüéèê&.'-]+?)\s+(AG|GmbH|Sàrl|SA|KlG|Genossenschaft)\b/i;
      const legalMatch = title.match(legalRe);
      if (legalMatch) {
        let name = `${legalMatch[1].trim()} ${legalMatch[2]}`;
        // Clean: remove leading separators/junk
        name = name.replace(/^[\s|—–·:\-]+/, "").trim();
        if (name.length >= 4 && name.length <= 80) {
          console.log(`  [firma] Found via <title> (legal entity): "${name}"`);
          return { value: name, source: "website_title", verified: true };
        }
      }

      // Strategy B: First segment before separator
      const segment = title.split(/\s*[-|—–·:]\s*/)[0].trim();
      if (segment.length >= 3 && segment.length <= 60) {
        if (!/^(home|willkommen|startseite|welcome|index)/i.test(segment)) {
          // Could be "Stark Haustechnik" without legal form — mark as unverified
          console.log(`  [firma] Found via <title> (first segment): "${segment}"`);
          return { value: segment, source: "website_title", verified: false };
        }
        // If first segment is generic, try last segment: "Home | Firma AG"
        const segments = title.split(/\s*[-|—–·:]\s*/);
        if (segments.length > 1) {
          const last = segments[segments.length - 1].trim();
          if (last.length >= 3 && last.length <= 60 && LEGAL_FORMS_CI.test(last)) {
            console.log(`  [firma] Found via <title> (last segment): "${last}"`);
            return { value: last, source: "website_title", verified: true };
          }
        }
      }
    }
  }

  // ── Priority 3: Regex on body text (Titlecase + ALLCAPS) ──
  const candidates = [];

  for (const key of ["impressum", "home", "kontakt"]) {
    const text = pageTexts[key];
    if (!text) continue;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines.slice(0, 50)) {
      // Titlecase: "Wälti & Sohn AG", "Leins AG"
      const titlecaseRe = /(?:^|[\s,.:(])([A-ZÄÖÜ][a-zäöüéèê]*(?:\s+(?:&\s+)?[A-ZÄÖÜ][a-zäöüéèê]*){0,4}\s+(?:AG|GmbH|Sàrl|SA|KlG|Genossenschaft))\b/g;
      for (const m of line.matchAll(titlecaseRe)) {
        candidates.push({ name: m[1].trim(), source: sourceTag(key), len: m[1].trim().length });
      }

      // ALLCAPS: "STARK HAUSTECHNIK GMBH", "LEINS AG"
      const capsRe = /\b((?:[A-ZÄÖÜ][A-ZÄÖÜ0-9&.'-]*\s+){1,5}(?:AG|GMBH|SARL|SA|KLG|GENOSSENSCHAFT))\b/g;
      for (const m of line.matchAll(capsRe)) {
        // Convert ALLCAPS to proper Titlecase
        const raw = m[1].trim();
        const words = raw.split(/\s+/);
        const titleCased = words.map((w) => {
          // Keep legal forms as-is (AG stays AG, GMBH → GmbH)
          const legalMap = { AG: "AG", GMBH: "GmbH", SARL: "Sàrl", SA: "SA", KLG: "KlG", GENOSSENSCHAFT: "Genossenschaft" };
          if (legalMap[w.toUpperCase()]) return legalMap[w.toUpperCase()];
          // Titlecase other words
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join(" ");
        candidates.push({ name: titleCased, source: sourceTag(key), len: titleCased.length });
      }
    }
  }

  if (candidates.length > 0) {
    // Sort: prefer shortest match (less context noise), break ties by source priority
    const sourcePriority = { website_impressum: 0, website_kontakt: 1, website_home: 2 };
    candidates.sort((a, b) => a.len - b.len || (sourcePriority[a.source] ?? 9) - (sourcePriority[b.source] ?? 9));
    console.log(`  [firma] Found via body regex: "${candidates[0].name}" (${candidates.length} candidates)`);
    return { value: candidates[0].name, source: candidates[0].source, verified: true };
  }

  // ── Fallback: first meaningful line from home ──
  const homeText = pageTexts.home;
  if (homeText) {
    const lines = homeText.split("\n").map((l) => l.trim()).filter((l) => l.length > 3 && l.length < 80);
    if (lines.length > 0) {
      return { value: lines[0], source: "website_home", verified: false };
    }
  }

  return { value: "", source: "not_found", verified: false };
}

function extractInhaber() {
  // Rollen breit (Inhaber/GF/Geschäftsleitung/Gründer/Mitinhaber/Patron …).
  const ROLE = "(?:Inhaber(?:in)?|Mitinhaber(?:in)?|Firmeninhaber(?:in)?|Gesch[aä]ftsf[uü]hr(?:er|erin|ung)|"
    + "Gesch[aä]ftsleitung|Gesch[aä]ftsleiter(?:in)?|Eigent[uü]mer(?:in)?|Gr[uü]nder(?:in)?|"
    + "Mitgr[uü]nder(?:in)?|CEO|Patron|Betriebsleiter(?:in)?|Managing\\s+Director)";
  const NAME = "[A-ZÄÖÜ][a-zäöüéèêàçï]+(?:[ -][A-ZÄÖÜ][a-zäöüéèêàçï]+){1,2}";
  // Wörter, die KEIN Personenname sind (Rechtsform/Gewerk/Navigation).
  const BLOCK = /\b(AG|GmbH|Sàrl|SA|KlG|Haustechnik|Geb[aä]udetechnik|Sanit[aä]r|Heizung|Spenglerei|Spengler|Service|Sohn|S[oö]hne|Team|Kontakt|Impressum|Startseite|Willkommen|Dienstleistungen|Leistungen|Notdienst|Kundendienst|Unternehmen|Ueber|Über)\b/i;

  const clean = (raw) => {
    const out = [];
    for (const w of raw.trim().split(/\s+/)) {
      if (BLOCK.test(w) || !/^[A-ZÄÖÜ][a-zäöüéèêàçï'’-]+$/.test(w)) break;
      out.push(w);
    }
    return out.slice(0, 3).join(" ");
  };
  const valid = (n) => n && n.split(" ").length >= 2 && !BLOCK.test(n);

  const owners = [];
  const seen = new Set();
  let src = null;
  const add = (n, key) => { const k = n.toLowerCase(); if (n && !seen.has(k)) { seen.add(k); owners.push(n); if (!src) src = sourceTag(key); } };

  for (const key of ["team", "impressum", "home", "kontakt"]) {
    const text = pageTexts[key];
    if (!text) continue;
    // „Rolle: Vorname Nachname [und/&/, Vorname Nachname]" — fängt 2 Geschäftspartner.
    const reA = new RegExp(`${ROLE}[\\s:.,–-]+(${NAME}(?:\\s*(?:und|&|,|sowie|/)\\s*${NAME}){0,2})`, "g");
    for (const m of text.matchAll(reA)) {
      for (const part of m[1].split(/\s*(?:und|&|,|sowie|\/)\s*/)) { const n = clean(part); if (valid(n)) add(n, key); }
    }
    // „Vorname Nachname, Rolle" oder „Vorname Nachname (Inhaber)".
    const reB = new RegExp(`(${NAME})\\s*[,–-]?\\s*[(]?\\s*(?:${ROLE})`, "g");
    for (const m of text.matchAll(reB)) { const n = clean(m[1]); if (valid(n)) add(n, key); }
    if (owners.length) break; // erste Seite mit klaren Treffern reicht (Team/Impressum zuerst)
  }

  if (owners.length) {
    return { value: owners.slice(0, 3).join(", "), source: src || "website_team", verified: true };
  }

  // Sekundär (Impressum): „vertreten durch / verantwortlich" — oft der Inhaber, aber
  // weniger sicher → mit „?" markieren, damit der Founder kurz gegenprüft.
  for (const key of ["impressum", "kontakt"]) {
    const text = pageTexts[key];
    if (!text) continue;
    const m = text.match(new RegExp(`(?:vertreten\\s+durch|verantwortlich(?:\\s+f[uü]r\\s+den\\s+Inhalt)?)[\\s:.,–-]+(${NAME})`, "i"));
    if (m) { const n = clean(m[1]); if (valid(n)) return { value: `${n} ?`, source: sourceTag(key), verified: false }; }
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
      // Cut city at first newline — prevents garbage capture from `i` flag
      const city = m[3].split(/[\n\r]/)[0].trim();
      return { value: `${m[1]}, ${m[2]} ${city}`, source: sourceTag(key), verified: true };
    }

    // Broader pattern: PLZ + City with any preceding street
    const plzMatches = [...text.matchAll(PLZ_RE)];
    if (plzMatches.length > 0) {
      // Try to find a street before the PLZ
      const m = plzMatches[0];
      const plzIdx = text.indexOf(m[0]);
      const before = text.slice(Math.max(0, plzIdx - 100), plzIdx);
      const streetMatch = before.match(/([A-ZÄÖÜ][a-zäöüéèê]+(?:strasse|weg|gasse|platz|rain|halden)\s*\d{1,4}[a-z]?)\s*$/i);
      const city = m[2].split(/[\n\r]/)[0].trim();
      if (streetMatch) {
        return { value: `${streetMatch[1]}, ${m[1]} ${city}`, source: sourceTag(key), verified: true };
      }
      // Just PLZ + City
      return { value: `${m[1]} ${city}`, source: sourceTag(key), verified: true };
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
  // 11.06.: "team" ergänzt — die Über-uns/Team-Seite trägt die persönlichen Entscheider-
  // Mails (z.B. michael.leins@… GL Sanitär/Heizung), die info@ nie liefert. innerText
  // dekodiert HTML-Entities (&#64;→@) bereits, daher hier kein zusätzlicher Decode nötig.
  for (const key of ["team", "kontakt", "impressum", "home"]) {
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
  // Day name patterns (short and long forms)
  const DAY = "(?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)";
  // Time pattern: 8:00 or 08:00 or 08.00 (with or without leading zero)
  const TIME = "(\\d{1,2}[:.]\\d{2})";
  // Separator between times: hyphen, en-dash, em-dash, or " bis "
  const TSEP = "\\s*[-–—]\\s*|\\s+bis\\s+";

  for (const key of ["kontakt", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;

    // Strategy 1: Find a block after "Öffnungszeiten" / "Bürozeiten" header
    const headerRe = /(?:Ö(?:ff|eff)nungszeiten|Gesch[aä]ftszeiten|Bürozeiten|Telefonzeiten|Erreichbarkeit)\s*[:\n]*([\s\S]{10,400}?)(?:\n\s*\n|\n[A-Z])/gi;
    const headerMatch = text.match(headerRe);
    if (headerMatch) {
      const block = headerMatch[0];
      // Extract individual day → time patterns (day-first: "Mo-Fr 08:00-17:00")
      const dayRe = new RegExp(
        `(${DAY})` +                              // first day
        `(?:[\\s\\-–—]*(?:bis\\s+)?` +            // optional separator ("bis", "-", "–")
        `(${DAY}))?` +                            // optional second day
        `\\s*[:;\\s]+` +                          // separator before time
        `${TIME}` +                               // start time
        `(?:${TSEP})` +                           // time separator
        `${TIME}` +                               // end time
        `(?:\\s*(?:und|,|&|\\/)\\s*` +            // optional second time range
        `${TIME}(?:${TSEP})${TIME})?`,            // second start-end time
        "gi"
      );
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

      // Within the header block, also try time-first pattern
      const timeFirstRe = new RegExp(
        `${TIME}` +                               // start time
        `(?:${TSEP})` +                           // time separator
        `${TIME}` +                               // end time
        `\\s+` +                                  // space before days
        `(${DAY})` +                              // first day
        `(?:[\\s\\-–—]*(?:bis\\s+)?` +            // optional separator
        `(${DAY}))?`,                             // optional second day
        "gi"
      );
      const timeFirstMatches = [...block.matchAll(timeFirstRe)];
      if (timeFirstMatches.length > 0) {
        const hours = {};
        for (const dm of timeFirstMatches) {
          const dayRange = dm[4] ? `${dm[3]}-${dm[4]}` : dm[3];
          hours[dayRange] = `${dm[1]}-${dm[2]}`;
        }
        return { value: hours, source: sourceTag(key), verified: true };
      }
    }

    // Strategy 2: Look for day-time patterns anywhere (day first: "Mo-Fr 08:00-17:00").
    // Captures an OPTIONAL second time range ("… und 13.30-17.00") — same as Strategy 1,
    // sonst geht der Nachmittag verloren (Leins-Fall 01.06.: "Mo-Fr 07-12 und 13.30-17").
    const dayTimeRe = new RegExp(
      `(${DAY})` +                                // first day
      `(?:[\\s\\-–—]*(?:bis\\s+)?` +              // optional separator
      `(${DAY}))?` +                              // optional second day
      `\\s*[:;\\s]+` +                            // separator before time
      `${TIME}` +                                 // start time
      `(?:${TSEP})` +                             // time separator
      `${TIME}` +                                 // end time
      `(?:\\s*(?:und|,|&|\\/)\\s*` +              // optional second time range
      `${TIME}(?:${TSEP})${TIME})?`,              // second start-end time
      "gi"
    );
    const dayTimeMatches = [...text.matchAll(dayTimeRe)];
    if (dayTimeMatches.length > 0) {
      const hours = {};
      for (const dm of dayTimeMatches) {
        const dayRange = dm[2] ? `${dm[1]}-${dm[2]}` : dm[1];
        let time = `${dm[3]}-${dm[4]}`;
        if (dm[5] && dm[6]) time += ` und ${dm[5]}-${dm[6]}`;
        hours[dayRange] = time;
      }
      return { value: hours, source: sourceTag(key), verified: true };
    }

    // Strategy 3: Time-first patterns anywhere ("08:00 - 17:00 Montag bis Freitag")
    const timeFirstAnyRe = new RegExp(
      `${TIME}` +                                 // start time
      `(?:${TSEP})` +                             // time separator
      `${TIME}` +                                 // end time
      `\\s+` +                                    // space before days
      `(${DAY})` +                                // first day
      `(?:[\\s\\-–—]*(?:bis\\s+)?` +              // optional separator
      `(${DAY}))?`,                               // optional second day
      "gi"
    );
    const timeFirstAnyMatches = [...text.matchAll(timeFirstAnyRe)];
    if (timeFirstAnyMatches.length > 0) {
      const hours = {};
      for (const dm of timeFirstAnyMatches) {
        const dayRange = dm[4] ? `${dm[3]}-${dm[4]}` : dm[3];
        hours[dayRange] = `${dm[1]}-${dm[2]}`;
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

// ── Team-Seite: „Mehr anzeigen" aufklappen, voll scrollen, dann Personen zählen ──
// Behebt den Bug „16 Mitarbeiter, aber nur 4 gezählt": viele Team-Seiten laden
// per Lazy-Load / „weitere anzeigen" / Tabs nach. Erst alles aufklappen → zählen.
async function analyzeTeam(page, url) {
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    if (!resp || resp.status() >= 400) return;
    await page.waitForTimeout(1500);

    const scrollAll = async () => {
      await page.evaluate(async () => {
        const step = 700;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
      });
    };

    // „Mehr/weitere/alle anzeigen", „Load more", Team-Tabs aufklappen (max. 4 Runden).
    let expanded = false;
    for (let round = 0; round < 4; round++) {
      await scrollAll();
      const clicked = await page.evaluate(() => {
        const rx = /(mehr\s*(an)?zeigen|weitere|alle\s+(an)?zeigen|gesamtes\s+team|ganzes\s+team|load\s*more|show\s*more|mehr\s+laden|weitere\s+mitarbeiter)/i;
        const els = Array.from(document.querySelectorAll("button, a, [role='button'], .more, .load-more, .btn"));
        let did = false;
        for (const el of els) {
          const t = (el.innerText || el.textContent || "").trim();
          if (t && t.length < 45 && rx.test(t)) { try { el.click(); did = true; } catch { /* ignore */ } }
        }
        return did;
      });
      await page.waitForTimeout(700);
      if (clicked) expanded = true; else break;
    }
    await scrollAll();
    await page.waitForTimeout(300);

    // Portrait-Fotos zählen (gerendert sichtbar, plausibles Seitenverhältnis, kein Logo/Icon).
    const photoCount = await page.evaluate(() => {
      let n = 0;
      for (const img of Array.from(document.querySelectorAll("img"))) {
        const r = img.getBoundingClientRect();
        if (r.width < 60 || r.height < 60) continue;
        const ar = r.width / r.height;
        if (ar < 0.5 || ar > 1.7) continue;                 // Porträt/quadratisch, keine Banner
        if (img.closest("header, nav, footer")) continue;   // keine Logos/Marken
        const src = (img.currentSrc || img.src || "").toLowerCase();
        if (/logo|icon|sprite|placeholder|favicon|\.svg(\?|$)/.test(src)) continue;
        n++;
      }
      return n;
    });

    // Voll-gerenderten Team-Text übernehmen (enthält jetzt ALLE Namen, nicht nur die ersten).
    const text = await page.evaluate(() => document.body.innerText || "");
    if (text && text.length > (pageTexts.team?.length || 0)) pageTexts.team = text;

    teamSignals = { photoCount, expanded };
    console.log(`  [team] aufgeklappt=${expanded} · Porträt-Fotos≈${photoCount}`);
  } catch (err) {
    console.log(`  [team] Analyse übersprungen: ${err.message}`);
  }
}

// Personen-Namen aus dem Team-Text: eigenständige Zeilen „Vorname Nachname" (2–3 Wörter,
// alle gross beginnend, keine Zahlen/Satzzeichen/Mail). Deutsche Substantiv-Grossschreibung
// fängt eine Blockliste ab, damit „Unsere Dienstleistungen" o.ä. nicht als Person zählt.
function teamNamesFromText(text) {
  if (!text) return [];
  const BLOCK = new Set([
    "unser", "unsere", "unseren", "unserem", "das", "die", "der", "den", "dem", "wir", "ihr", "ihre", "sie",
    "team", "teams", "mitarbeiter", "mitarbeiterin", "mitarbeiterinnen", "mitarbeitende", "mitarbeitenden",
    "sanitär", "sanitaer", "heizung", "heizungen", "spenglerei", "spengler", "haustechnik", "gebäudetechnik",
    "gebaeudetechnik", "lüftung", "lueftung", "service", "kundendienst", "notdienst", "kontakt", "impressum",
    "über", "ueber", "uns", "willkommen", "startseite", "home", "leistungen", "dienstleistungen", "angebot",
    "geschäftsführer", "geschäftsführung", "geschaeftsfuehrer", "inhaber", "inhaberin", "meister", "lernende",
    "lernender", "lehrling", "lehrlinge", "jobs", "karriere", "offene", "stellen", "aktuelles", "news",
    "referenzen", "projekte", "partner", "qualität", "qualitaet", "tradition", "kompetenz", "beratung",
    "planung", "montage", "reparatur", "wartung", "badezimmer", "badumbau", "umbau", "sanierung", "neubau",
    "moderne", "modernes", "ihre", "ihren", "herzlich", "willkommen", "telefon", "email", "adresse", "öffnungszeiten",
    "geberit", "grohe", "viessmann", "vaillant", "hoval", "buderus", "hansgrohe", "duravit", "laufen",
  ]);
  const out = new Map();
  for (let line of text.split("\n")) {
    line = line.trim();
    if (line.length < 4 || line.length > 32) continue;
    if (/[0-9.:;,@/()]/.test(line)) continue;                 // Namen tragen keine Zahlen/Satzzeichen/Mail
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 3) continue;
    if (!words.every((w) => /^[A-ZÄÖÜ][a-zäöüéèêàçïA-ZÄÖÜ'’-]{1,19}$/.test(w))) continue;
    if (words.some((w) => BLOCK.has(w.toLowerCase()))) continue;
    out.set(line.toLowerCase(), line);
  }
  return [...out.values()];
}

// Team-Grösse: explizite Zahl (höchste Sicherheit) → sonst Personen aus Namen + Fotos.
// Ziel ist die richtige KLASSE (1–3 / 4–15 / >15), die der Founder anfangs prüft.
function extractTeamGroesse() {
  // 1) Explizite Aussage „X Mitarbeiter" — am verlässlichsten.
  for (const key of ["team", "home"]) {
    const text = pageTexts[key];
    if (!text) continue;
    const patterns = [
      /(\d{1,3})\s*(?:Mitarbeiter(?:innen)?|Angestellte|Fachleute|Profis|Spezialisten|Mitarbeitende|Teammitglieder)/i,
      /(?:Team|Belegschaft|Mannschaft)\s+(?:von\s+)?(\d{1,3})\b/i,
      /(?:rund|ca\.?|über|mehr\s+als|circa)\s+(\d{1,3})\s*(?:Mitarbeiter(?:innen)?|Angestellte|Fachleute)/i,
    ];
    for (const re of patterns) {
      const match = text.match(re);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 2 && num <= 500) {
          return { value: num, source: sourceTag(key), verified: true,
            basis: "text_explicit", evidence: { explicit: num } };
        }
      }
    }
  }

  // 2) Personen zählen: Namen (eigenständige Zeilen) + Porträt-Fotos. Bei beidseitiger
  //    Bestätigung der HÖHERE Wert (behebt den Lazy-Bug „16 da, nur 4 geladen").
  const names = teamNamesFromText(pageTexts.team);
  const nNames = names.length;
  const nPhotos = teamSignals.photoCount || 0;

  let value = null, basis = null;
  if (nNames >= 2 && nPhotos >= 2) { value = Math.max(nNames, nPhotos); basis = "namen+fotos"; }
  else if (nNames >= 3) { value = nNames; basis = "namen"; }
  else if (nPhotos >= 2 && nNames >= 1) { value = Math.max(nPhotos, nNames); basis = "fotos"; }

  if (value != null) {
    const verified = basis === "namen+fotos";   // beidseitig bestätigt = belastbar
    return { value, source: "website_team", verified,
      basis, evidence: { namen: nNames, fotos: nPhotos, beispiele: names.slice(0, 25) },
      note: verified ? "Personen gezählt (Namen + Fotos bestätigt)" : "Schätzung — bitte prüfen" };
  }
  return { value: null, source: "not_found", verified: false, evidence: { namen: nNames, fotos: nPhotos } };
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
      // Deduplicate: count how many categories each line appears in
      const lineCatCount = {};
      for (const [cat, lines] of Object.entries(categories)) {
        for (const line of lines) {
          lineCatCount[line] = (lineCatCount[line] || 0) + 1;
        }
      }
      // Remove generic lines (appear in > 3 categories) + deduplicate within category
      // But KEEP at least the category keyword itself (e.g., "SANITÄR", "HEIZUNG")
      for (const cat of Object.keys(categories)) {
        const deduped = [...new Set(categories[cat])];
        const specific = deduped.filter((l) => (lineCatCount[l] || 0) <= 3);
        if (specific.length > 0) {
          categories[cat] = specific;
        } else {
          // All lines are generic — keep just the category name as a marker
          categories[cat] = [cat];
        }
      }

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

// ── Zefix (Handelsregister) API ──────────────────────────────────────────
async function verifyWithZefix(companyName) {
  if (!companyName || companyName.length < 3) return null;

  try {
    // Clean query: remove trailing punctuation, normalize whitespace
    const query = companyName.replace(/[.,;:!?]+$/, "").trim();
    console.log(`  [Zefix] Searching: "${query}"`);

    // Zefix REST API: POST to firm/search.json with JSON body
    const url = "https://www.zefix.ch/ZefixREST/api/v1/firm/search.json";

    // Try exact match first, then contains if no results
    for (const searchType of ["exact", "contains"]) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Origin: "https://www.zefix.ch",
          Referer: "https://www.zefix.ch/de/search/entity/welcome",
        },
        body: JSON.stringify({
          name: query,
          searchType,
          maxEntries: 10,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        // Zefix returns error JSON for "no results" on some queries
        if (text.includes("NORESULT")) {
          if (searchType === "exact") continue; // try contains
          console.log("  [Zefix] No results found");
          return null;
        }
        console.log(`  [Zefix] API returned ${response.status} — skipping`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        if (searchType === "exact") continue;
        console.log("  [Zefix] No results found");
        return null;
      }

      if (data.list && data.list.length > 0) {
        return parseZefixResult(data.list, query);
      }
    }

    console.log("  [Zefix] No results found");
    return null;
  } catch (err) {
    console.log(`  [Zefix] Error: ${err.message}`);
    return null;
  }
}

function parseZefixResult(companies, query) {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, " ").trim();

  // Find best match: prefer exact match, then closest name
  let best = null;
  let bestScore = -1;

  for (const c of companies) {
    const name = (c.name || c.companyName || "").trim();
    const normalizedName = name.toLowerCase().replace(/\s+/g, " ");

    let score = 0;
    // Exact match
    if (normalizedName === normalizedQuery) score = 100;
    // Contains query
    else if (normalizedName.includes(normalizedQuery)) score = 80;
    // Query contains result
    else if (normalizedQuery.includes(normalizedName)) score = 60;
    // Partial overlap (Levenshtein-like: shared words)
    else {
      const queryWords = new Set(normalizedQuery.split(/\s+/));
      const nameWords = normalizedName.split(/\s+/);
      const shared = nameWords.filter((w) => queryWords.has(w)).length;
      score = (shared / Math.max(queryWords.size, nameWords.length)) * 50;
    }

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  if (!best || bestScore < 20) {
    console.log("  [Zefix] No good match found");
    return null;
  }

  const result = {
    name: best.name,
    uid: best.uidFormatted || best.uid || null,
    ehraid: best.ehraid || null,
    legalSeat: best.legalSeat || null,
    cantonalExcerptWeb: best.cantonalExcerptWeb || null,
    status: best.status || null,
    legalFormId: best.legalFormId || null,
    matchScore: bestScore,
  };

  console.log(`  [Zefix] Match: "${result.name}" (score: ${bestScore}, seat: ${result.legalSeat}, UID: ${result.uid})`);
  return result;
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
        "X-Goog-FieldMask": "places.id,places.rating,places.userRatingCount,places.displayName",
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
        place_id: place.id || null,
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
    // 11.06.: Cert-Mismatch (z.B. leins.ch: Cert deckt www-Host nicht) ließ den Crawl
    // sonst KOMPLETT leer laufen (firma/inhaber/email alle leer). TLS-tolerant fetchen.
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // ── Discover and crawl pages ──
  let pagesFound = 0;
  let pagesFailed = 0;

  for (const [pageKey, patterns] of Object.entries(PAGE_PATTERNS)) {
    let found = false;
    let best = null;
    for (const path of patterns) {
      const url = baseUrl + path;
      console.log(`  [${pageKey}] Trying: ${url}`);

      const crawlResult = await crawlPage(page, url, pageKey);
      if (crawlResult && crawlResult.text.trim().length > 50) {
        if (!best || crawlResult.text.length > best.text.length) best = { ...crawlResult, url };
        // Speed: ABBRECHEN, sobald eine ECHTE Seite gefunden ist — sonst werden alle
        // ~18 URL-Muster je ~4-5s durchprobiert (das frass die ganze Lauf-Zeit).
        // SPA-Shell-Schutz: eine Seite mit ~Home-Länge ist meist nur der Shell
        // derselben Route (kein echter Unterinhalt) → überspringen und weiter suchen;
        // der bisher längste Treffer bleibt als best erhalten.
        const homeLen = (pageTexts.home && pageTexts.home.length) || 0;
        const isShell = pageKey !== "home" && homeLen > 0 && Math.abs(crawlResult.text.length - homeLen) < 200;
        if (crawlResult.text.length > 400 && !isShell) break;
      }
    }
    if (best) {
      pageTexts[pageKey] = best.text;
      pageMeta[pageKey] = { title: best.title, ogSiteName: best.ogSiteName, ogTitle: best.ogTitle };
      pageSources[pageKey] = best.url;
      allTexts.push(best.text);
      result._meta.pages_crawled.push({ key: pageKey, url: best.url, chars: best.text.length });
      pagesFound++;
      found = true;
      console.log(`  [${pageKey}] OK — ${best.text.length} chars @ ${best.url}${best.title ? ` (title: "${best.title.slice(0, 60)}")` : ""}`);
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
    await page.waitForTimeout(1500);
    const color = await extractBrandColor(page);
    if (color) {
      result.brand_color = { value: color, source: "website_home", verified: true };
      console.log(`  [brand_color] Found: ${color}`);
    } else {
      console.log("  [brand_color] Not found");
    }
  }

  // ── Team-Analyse: Mitarbeiterzahl aus der Team-Seite ableiten ──
  // (Namen + Porträt-Fotos zählen; klappt „mehr anzeigen"/Tabs vorher auf.)
  if (pageSources.team) {
    await analyzeTeam(page, pageSources.team);
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

  // ── Zefix (Handelsregister) Verification ──
  console.log("\n--- Zefix Verification ---\n");
  const zefixResult = await verifyWithZefix(result.firma.value);
  if (zefixResult) {
    result._zefix = {
      official_name: zefixResult.name,
      uid: zefixResult.uid,
      ehraid: zefixResult.ehraid,
      legal_seat: zefixResult.legalSeat,
      status: zefixResult.status,
      cantonal_excerpt: zefixResult.cantonalExcerptWeb,
      match_score: zefixResult.matchScore,
    };

    // If Zefix has a better name (higher confidence), upgrade
    if (zefixResult.matchScore >= 60 && zefixResult.name) {
      const oldName = result.firma.value;
      const zefixName = zefixResult.name;

      // Compare case-insensitively to detect substance change vs just casing
      const oldNorm = oldName.toLowerCase().replace(/\s+/g, " ");
      const zefixNorm = zefixName.toLowerCase().replace(/\s+/g, " ");

      if (oldNorm === zefixNorm) {
        // Same name, different casing — keep the better-cased version (prefer Titlecase over ALLCAPS)
        const isZefixAllCaps = zefixName === zefixName.toUpperCase();
        const isOldAllCaps = oldName === oldName.toUpperCase();
        if (isZefixAllCaps && !isOldAllCaps) {
          // Keep original casing, just mark as verified
          result.firma.source = `${result.firma.source}+zefix_verified`;
          result.firma.verified = true;
          console.log(`  [Zefix] Confirmed firma: "${oldName}" ✓ (Zefix: "${zefixName}")`);
        } else {
          result.firma.value = zefixName;
          result.firma.source = `${result.firma.source}+zefix_verified`;
          result.firma.verified = true;
          console.log(`  [Zefix] Confirmed firma: "${zefixName}" ✓`);
        }
      } else if (zefixNorm.includes(oldNorm) || oldNorm.includes(zefixNorm)) {
        // Zefix adds legal form (e.g., "Stark Haustechnik" → "Stark Haustechnik GmbH")
        // Use Zefix name but apply Titlecase if it's ALLCAPS
        const finalName = (zefixName === zefixName.toUpperCase())
          ? zefixName.split(/\s+/).map((w) => {
              const legalMap = { AG: "AG", GMBH: "GmbH", SA: "SA", SARL: "Sàrl" };
              return legalMap[w] || w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
            }).join(" ")
          : zefixName;
        result.firma.value = finalName;
        result.firma.source = `${result.firma.source}+zefix_verified`;
        result.firma.verified = true;
        console.log(`  [Zefix] Upgraded firma: "${oldName}" → "${finalName}"`);
      } else {
        // Substantially different — use Zefix as authority
        result.firma.value = zefixName;
        result.firma.source = `${result.firma.source}+zefix_verified`;
        result.firma.verified = true;
        console.log(`  [Zefix] Replaced firma: "${oldName}" → "${zefixName}"`);
      }
    }

    // Cross-reference address with registered seat
    if (zefixResult.legalSeat && result.adresse.value) {
      const addrLower = result.adresse.value.toLowerCase();
      const seatLower = zefixResult.legalSeat.toLowerCase();
      if (!addrLower.includes(seatLower)) {
        console.log(`  [Zefix] WARNING: Address city mismatch — extracted "${result.adresse.value}" but registered seat is "${zefixResult.legalSeat}"`);
      }
    }
  } else {
    result._zefix = null;
    console.log("  [Zefix] No verification available — company may not be in Handelsregister");
  }

  // ── Google Places API ──
  console.log("\n--- Google Places API ---\n");
  const companyName = result.firma.value || slug;
  const address = result.adresse.value || "";
  const googleResult = await fetchGooglePlaces(companyName, address);
  result.google.place_id = googleResult.place_id ?? null;
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
