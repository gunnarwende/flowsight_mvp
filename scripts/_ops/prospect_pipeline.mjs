#!/usr/bin/env node
/**
 * Prospect Pipeline — Orchestrator for onboarding new prospects.
 *
 * Two modes:
 *   Quick: --url <url> --slug <slug>  (crawl website, auto-generate everything)
 *   Config: --config <path>           (use pre-filled onboard.json)
 *
 * Usage (from repo root):
 *   node --env-file=src/web/.env.local scripts/_ops/prospect_pipeline.mjs \
 *     --url https://example.ch --slug example-ag [--name "Example AG"] [--dry-run]
 *
 *   node --env-file=src/web/.env.local scripts/_ops/prospect_pipeline.mjs \
 *     --config docs/customers/example-ag/onboard.json [--dry-run]
 *
 * Options:
 *   --skip-website   Skip website config generation
 *   --skip-tenant    Skip Supabase tenant creation
 *   --skip-voice     Skip voice agent JSON generation
 *   --dry-run        Preview all actions without writing
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

// ── CLI args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(flag) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1]) return args[i + 1];
  }
  return undefined;
}

function getFlag(flag) {
  return args.includes(flag);
}

const urlArg = getArg("--url");
const slugArg = getArg("--slug");
const nameArg = getArg("--name");
const configArg = getArg("--config");
const dryRun = getFlag("--dry-run");
const skipWebsite = getFlag("--skip-website");
const skipTenant = getFlag("--skip-tenant");
const skipVoice = getFlag("--skip-voice");

// Validate mode
const isQuickMode = !!(urlArg && slugArg);
const isConfigMode = !!configArg;

if (!isQuickMode && !isConfigMode) {
  console.error(`
Usage:
  node --env-file=src/web/.env.local scripts/_ops/prospect_pipeline.mjs [options]

Quick mode (crawl + auto-generate):
  --url <url>           Prospect website URL (required)
  --slug <slug>         Customer slug, kebab-case (required)
  --name "Company AG"   Override auto-detected name (optional)

Config mode (pre-filled manifest):
  --config <path>       Path to onboard.json (required)

Options:
  --skip-website        Skip website config generation
  --skip-tenant         Skip Supabase tenant creation
  --skip-voice          Skip voice agent JSON generation
  --dry-run             Preview all actions without writing
`);
  process.exit(1);
}

if (isQuickMode && isConfigMode) {
  console.error("ERROR: Use either --url/--slug (Quick) or --config (Config), not both.");
  process.exit(1);
}

// Validate slug format
if (slugArg && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugArg)) {
  console.error(`ERROR: Invalid slug "${slugArg}". Must be lowercase-kebab (e.g. "mueller-ht").`);
  process.exit(1);
}

// ── Paths ─────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "../..");
const SRC_WEB = join(REPO_ROOT, "src/web");
const CUSTOMERS_LIB = join(SRC_WEB, "src/lib/customers");
const PUBLIC_KUNDEN = join(SRC_WEB, "public/kunden");
const RETELL_EXPORTS = join(REPO_ROOT, "retell/exports");
const DOCS_CUSTOMERS = join(REPO_ROOT, "docs/customers");

// ── Supabase env (only needed if tenant module active) ────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Service keyword map ───────────────────────────────────────────────────
const SERVICE_KEYWORDS = {
  "sanitär": { name: "Sanitär", icon: "bath", slug: "sanitaer" },
  "sanitaer": { name: "Sanitär", icon: "bath", slug: "sanitaer" },
  "badezimmer": { name: "Sanitär", icon: "bath", slug: "sanitaer" },
  "badsanierung": { name: "Badsanierung", icon: "bath", slug: "badsanierung" },
  "heizung": { name: "Heizung", icon: "flame", slug: "heizung" },
  "wärmepumpe": { name: "Heizung", icon: "flame", slug: "heizung" },
  "waermepumpe": { name: "Heizung", icon: "flame", slug: "heizung" },
  "fussbodenheizung": { name: "Heizung", icon: "flame", slug: "heizung" },
  "boiler": { name: "Boiler & Warmwasser", icon: "water", slug: "boiler" },
  "warmwasser": { name: "Boiler & Warmwasser", icon: "water", slug: "boiler" },
  "spenglerei": { name: "Spenglerei", icon: "roof", slug: "spenglerei" },
  "dachrinne": { name: "Spenglerei", icon: "roof", slug: "spenglerei" },
  "flachdach": { name: "Spenglerei", icon: "roof", slug: "spenglerei" },
  "solar": { name: "Solartechnik", icon: "solar", slug: "solar" },
  "solaranlage": { name: "Solartechnik", icon: "solar", slug: "solar" },
  "photovoltaik": { name: "Solartechnik", icon: "solar", slug: "solar" },
  "leitungsbau": { name: "Leitungsbau", icon: "pipe", slug: "leitungsbau" },
  "rohrverlegung": { name: "Leitungsbau", icon: "pipe", slug: "leitungsbau" },
  "reparatur": { name: "Reparaturservice", icon: "wrench", slug: "reparatur" },
  "notdienst": { name: "Reparaturservice", icon: "wrench", slug: "reparatur" },
  "lüftung": { name: "Lüftung", icon: "snowflake", slug: "lueftung" },
  "lueftung": { name: "Lüftung", icon: "snowflake", slug: "lueftung" },
  "klima": { name: "Klima & Kälte", icon: "snowflake", slug: "klima" },
  "kälte": { name: "Klima & Kälte", icon: "snowflake", slug: "klima" },
  "blitzschutz": { name: "Blitzschutz", icon: "tool", slug: "blitzschutz" },
  "entwässerung": { name: "Entwässerung", icon: "water", slug: "entwaesserung" },
  "abfluss": { name: "Rohrreinigung", icon: "pipe", slug: "rohrreinigung" },
  "rohrreinigung": { name: "Rohrreinigung", icon: "pipe", slug: "rohrreinigung" },
  "verstopfung": { name: "Rohrreinigung", icon: "pipe", slug: "rohrreinigung" },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function slugToCamelCase(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function generateSenderName(companyName) {
  return companyName
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 11);
}

function contentHash(buf) {
  return createHash("md5").update(buf).digest("hex").slice(0, 12);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function log(icon, msg) {
  console.log(`  ${icon} ${msg}`);
}

// ── Step 1: Crawl or Load Config ──────────────────────────────────────────

async function crawlWebsite(url, slug) {
  console.log("\n━━━ Step 1: Crawling website ━━━\n");

  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error("ERROR: puppeteer not installed. Run: cd scripts && npm install");
    process.exit(1);
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlowSight-Crawler/1.0");

  // Collect all discovered images (URL → response buffer)
  const imageBuffers = new Map();
  page.on("response", async (response) => {
    const ct = response.headers()["content-type"] || "";
    if (ct.startsWith("image/") && response.ok()) {
      try {
        const buf = await response.buffer();
        if (buf.length >= 500) {
          imageBuffers.set(response.url(), buf);
        }
      } catch { /* ignore streaming errors */ }
    }
  });

  // Normalize URL
  const baseUrl = url.replace(/\/$/, "");
  const origin = new URL(baseUrl).origin;

  // Visit homepage first
  log("🌐", `Loading ${baseUrl}`);
  await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 30000 });

  // Auto-scroll to trigger lazy images
  await autoScroll(page);

  // Extract all internal links
  const links = await page.evaluate((orig) => {
    return [...new Set(
      Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.href)
        .filter((h) => h.startsWith(orig) && !h.match(/\.(pdf|zip|doc|docx|xlsx|png|jpg|jpeg|gif|svg|webp|avif)$/i))
    )];
  }, origin);

  // Visit internal pages (max 15 total)
  const pagesToVisit = links.slice(0, 14); // 14 + homepage = 15
  const allTexts = [];
  const allImages = new Set();

  // Extract from homepage
  const homeData = await extractPageData(page);
  allTexts.push(homeData.text);
  homeData.images.forEach((img) => allImages.add(img));

  for (const link of pagesToVisit) {
    try {
      await page.goto(link, { waitUntil: "networkidle2", timeout: 15000 });
      await autoScroll(page);
      const pageData = await extractPageData(page);
      allTexts.push(pageData.text);
      pageData.images.forEach((img) => allImages.add(img));
    } catch {
      // skip failed pages
    }
  }

  const pagesVisited = 1 + pagesToVisit.length;
  log("📄", `Visited ${pagesVisited} pages, found ${allImages.size} image URLs`);

  // Combine all text for regex extraction
  const fullText = allTexts.join("\n");

  // Extract brand color (skip white/near-white/black)
  const brandColor = await page.evaluate(() => {
    function isUsableColor(hex) {
      if (!hex) return false;
      const c = hex.replace("#", "");
      const r = parseInt(c.slice(0, 2), 16);
      const g = parseInt(c.slice(2, 4), 16);
      const b = parseInt(c.slice(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 30 && brightness < 240; // skip near-black and near-white
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const v = meta.getAttribute("content");
      if (isUsableColor(v)) return v;
    }

    // Try header, nav, primary buttons for a meaningful accent color
    for (const sel of ["header", "nav", ".navbar", "[class*=primary]", "a.btn", "button.btn"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          const hex = "#" + [match[1], match[2], match[3]].map((x) => parseInt(x).toString(16).padStart(2, "0")).join("");
          if (isUsableColor(hex)) return hex;
        }
      }
    }
    return null;
  });

  await browser.close();

  // ── Regex extraction ────────────────────────────────────────────────

  // Phone numbers (Swiss) — handles spaces, dots, dashes, no separators
  const phoneRegex = /(?:\+41|0)[\s.\-]*\d{2}[\s.\-]*\d{3}[\s.\-]*\d{2}[\s.\-]*\d{2}/g;
  const phones = [...new Set((fullText.match(phoneRegex) || []).map((p) => p.replace(/[\s.\-]+/g, " ").trim()))];

  // Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = [...new Set(
    (fullText.match(emailRegex) || []).filter((e) => !e.includes("example") && !e.includes("@sentry"))
  )];

  // PLZ + City
  const plzRegex = /\b(\d{4})\s+([A-ZÄÖÜ][a-zäöüé]+(?:\s+[a-zäöüé]+)?)\b/g;
  const plzMatches = [];
  let m;
  while ((m = plzRegex.exec(fullText)) !== null) {
    const plz = m[1];
    if (parseInt(plz) >= 1000 && parseInt(plz) <= 9999) {
      plzMatches.push({ zip: plz, city: m[2] });
    }
  }

  // Opening hours
  const hoursRegex = /(?:Mo|Di|Mi|Do|Fr|Sa|So)[^.\n]*?\d{1,2}[:.]\d{2}/g;
  const hours = [...new Set(fullText.match(hoursRegex) || [])].slice(0, 4);

  // Services detection
  const textLower = fullText.toLowerCase();
  const detectedServices = new Map();
  for (const [keyword, svc] of Object.entries(SERVICE_KEYWORDS)) {
    if (textLower.includes(keyword) && !detectedServices.has(svc.slug)) {
      detectedServices.set(svc.slug, { name: svc.name, icon: svc.icon, slug: svc.slug, summary: "" });
    }
  }

  // Emergency detection
  const emergencyKeywords = ["24h", "notdienst", "pikett", "notfall", "24 stunden", "rund um die uhr"];
  const hasEmergency = emergencyKeywords.some((kw) => textLower.includes(kw));

  // Auto-detect company name: use page title, fall back to slug-to-titlecase
  let detectedName = nameArg;
  if (!detectedName) {
    // The first line of allTexts[0] is typically the <title> tag content
    const firstLine = (allTexts[0] || "").split("\n")[0]?.trim();
    if (firstLine && firstLine.length > 2 && firstLine.length < 120) {
      // Strip everything after common separators, keep just the company name
      detectedName = firstLine
        .split(/\s*[-–—|]\s*/)[0]
        .replace(/\s*(Home|Startseite|Willkommen|Herzlich willkommen).*$/i, "")
        .trim();
    }
    if (!detectedName || detectedName.length < 3) {
      detectedName = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }

  // Collect image buffers for download
  // Also collect images from <img> tags that might not have triggered network intercept
  const imageUrlsToDownload = [];
  for (const imgUrl of allImages) {
    if (imageBuffers.has(imgUrl)) continue; // already captured
    if (imgUrl.startsWith("data:")) continue;
    imageUrlsToDownload.push(imgUrl);
  }

  // Download missing images via fetch
  for (const imgUrl of imageUrlsToDownload.slice(0, 50)) {
    try {
      const resp = await fetch(imgUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const buf = Buffer.from(await resp.arrayBuffer());
        if (buf.length >= 500) {
          imageBuffers.set(imgUrl, buf);
        }
      }
    } catch { /* skip */ }
  }

  log("🖼️ ", `${imageBuffers.size} images captured (>500 bytes)`);

  // Auto-detected fields
  const autoDetected = [];
  if (detectedName !== slug) autoDetected.push("name");
  if (phones.length > 0) autoDetected.push("phone");
  if (emails.length > 0) autoDetected.push("email");
  if (plzMatches.length > 0) autoDetected.push("address");
  if (hours.length > 0) autoDetected.push("hours");

  const firstPhone = phones[0] || "";
  const firstEmail = emails[0] || "";
  const firstAddress = plzMatches[0] || { zip: "", city: "" };

  // Build onboard.json
  const manifest = {
    slug,
    name: detectedName,
    website_url: baseUrl,
    brand_color: brandColor || "#2b6cb0",

    modules: {
      website: true,
      voice: true,
      sms: { enabled: true, sender_name: generateSenderName(detectedName) },
      ops: true,
      reviews: { google_url: "" },
    },

    contact: {
      phone: firstPhone.replace(/^0/, "+41").replace(/\s+/g, ""),
      phone_display: firstPhone,
      email: firstEmail,
      address: {
        street: "",
        zip: firstAddress.zip,
        city: firstAddress.city,
      },
      opening_hours: hours.length > 0 ? hours : ["Mo-Fr 07:30-17:00"],
    },

    services: [...detectedServices.values()],

    team: [],

    emergency: {
      enabled: hasEmergency,
      phone: firstPhone.replace(/^0/, "+41").replace(/\s+/g, ""),
    },

    _crawl: {
      crawled_at: new Date().toISOString(),
      pages_visited: pagesVisited,
      images_found: imageBuffers.size,
      auto_detected: autoDetected,
    },
  };

  // Save crawl data
  const crawlData = {
    url: baseUrl,
    crawled_at: manifest._crawl.crawled_at,
    pages_visited: pagesVisited,
    phones,
    emails,
    plz_matches: plzMatches,
    opening_hours: hours,
    services: [...detectedServices.keys()],
    has_emergency: hasEmergency,
    brand_color: brandColor,
    image_count: imageBuffers.size,
  };

  log("📊", `Detected: ${autoDetected.join(", ") || "nothing"} | ${detectedServices.size} services | emergency: ${hasEmergency}`);

  return { manifest, crawlData, imageBuffers };
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  // Wait for lazy images
  await new Promise((r) => setTimeout(r, 1000));
}

async function extractPageData(page) {
  return await page.evaluate(() => {
    // Extract text content — broad selection to catch contact info in footers, sidebars, etc.
    const textParts = [];
    const title = document.title;
    if (title) textParts.push(title);

    // Standard content elements
    for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "td", "th", "dt", "dd", "address", "blockquote"]) {
      document.querySelectorAll(tag).forEach((el) => {
        const t = el.textContent?.trim();
        if (t && t.length > 2) textParts.push(t);
      });
    }

    // Footer and contact sections (often contain phone, email, address)
    for (const sel of ["footer", "[class*=contact]", "[class*=footer]", "[class*=phone]", "[id*=contact]", "[id*=footer]", "nav"]) {
      document.querySelectorAll(sel).forEach((el) => {
        const t = el.textContent?.trim();
        if (t && t.length > 2) textParts.push(t);
      });
    }

    // Tel links (explicit phone numbers)
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      const tel = a.getAttribute("href")?.replace("tel:", "").trim();
      if (tel) textParts.push(tel);
      const t = a.textContent?.trim();
      if (t) textParts.push(t);
    });

    // Mailto links (explicit emails)
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      const mail = a.getAttribute("href")?.replace("mailto:", "").split("?")[0].trim();
      if (mail) textParts.push(mail);
    });

    // Extract images
    const images = new Set();
    document.querySelectorAll("img").forEach((img) => {
      const src = img.src || img.dataset?.src || img.getAttribute("data-lazy-src") || "";
      if (src && !src.startsWith("data:") && !src.includes("svg")) images.add(src);
    });

    // CSS background images
    document.querySelectorAll("[style]").forEach((el) => {
      const match = el.style.backgroundImage?.match(/url\(["']?([^"')]+)["']?\)/);
      if (match && !match[1].includes("svg")) images.add(match[1]);
    });

    return { text: textParts.join("\n"), images: [...images] };
  });
}

// ── Step 2: Website Module ────────────────────────────────────────────────

async function generateWebsiteConfig(manifest, imageBuffers) {
  if (skipWebsite || manifest.modules?.website === false) {
    log("⏭️ ", "Website module: skipped");
    return { todoCount: 0, imagesSelected: 0, registryUpdated: false };
  }

  console.log("\n━━━ Step 2: Website module ━━━\n");

  const slug = manifest.slug;
  const imgDir = join(PUBLIC_KUNDEN, slug);

  // Select top images by size (max 12)
  let imagesSelected = 0;
  if (imageBuffers && imageBuffers.size > 0) {
    const sorted = [...imageBuffers.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 12);

    if (!dryRun) {
      ensureDir(imgDir);
      for (const [url, buf] of sorted) {
        const ext = guessImageExt(url, buf);
        const hash = contentHash(buf);
        const fileName = `${slug}_${String(imagesSelected).padStart(3, "0")}_${hash}.${ext}`;
        writeFileSync(join(imgDir, fileName), buf);
        imagesSelected++;
      }
    }
    log("🖼️ ", `${imagesSelected} images → src/web/public/kunden/${slug}/`);
  }

  // Generate customer config TypeScript file
  const configPath = join(CUSTOMERS_LIB, `${slug}.ts`);
  const varName = slugToCamelCase(slug);
  const phoneRaw = manifest.contact.phone || "";
  const phoneDisplay = manifest.contact.phone_display || phoneRaw;

  // Build services array
  const services = (manifest.services || []).map((svc) => {
    return `    {
      name: "${esc(svc.name)}",
      slug: "${esc(svc.slug)}",
      icon: "${svc.icon || "wrench"}",
      summary: "${esc(svc.summary || `${svc.name} — professionell und zuverlässig.`)}",
    }`;
  });

  // Build gallery from downloaded images
  const galleryImages = [];
  if (!dryRun && imagesSelected > 0) {
    for (let i = 0; i < imagesSelected; i++) {
      // Read back the written files to get exact names
      // For simplicity, reconstruct the name
      galleryImages.push(`      { src: \`\${IMG}/${slug}_${String(i).padStart(3, "0")}_\${/* hash */""}\`, alt: "" }`);
    }
  }

  // Count TODOs
  let todoCount = 0;
  const needsTodo = (val) => !val || val === "";

  const taglineTodo = needsTodo(null) ? " // TODO: add tagline" : "";
  if (taglineTodo) todoCount++;
  const metaTodo = " // TODO: add meta description";
  todoCount++;
  const regionTodo = needsTodo(null) ? " // TODO: add service region" : "";
  if (regionTodo) todoCount++;
  const gemeindenTodo = " // TODO: add Gemeinden";
  todoCount++;
  const teamTodo = manifest.team?.length > 0 ? "" : " // TODO: add team members";
  if (teamTodo) todoCount++;

  const configContent = `import type { CustomerSite } from "./types";

const IMG = "/kunden/${slug}";

export const ${varName}: CustomerSite = {
  slug: "${slug}",
  companyName: "${esc(manifest.name)}",
  tagline: "",${taglineTodo}
  metaDescription: "",${metaTodo}
  brandColor: "${manifest.brand_color || "#2b6cb0"}",

  contact: {
    phone: "${esc(phoneDisplay)}",
    phoneRaw: "${esc(phoneRaw)}",
    email: "${esc(manifest.contact.email || "")}",
    address: {
      street: "${esc(manifest.contact.address?.street || "")}",
      zip: "${esc(manifest.contact.address?.zip || "")}",
      city: "${esc(manifest.contact.address?.city || "")}",
    },
    openingHours: [${(manifest.contact.opening_hours || []).map((h) => `\n      "${esc(h)}"`).join(",")}
    ],
  },

${manifest.emergency?.enabled ? `  emergency: {
    enabled: true,
    phone: "${esc(phoneDisplay)}",
    phoneRaw: "${esc(phoneRaw)}",
    label: "24h Notdienst",
    description: "Rohrbruch? Heizung ausgefallen? Rufen Sie uns jetzt an.",
  },

` : ""}  services: [
${services.join(",\n")}
  ],

  gallery: [],

  serviceArea: {
    region: "",${regionTodo}
    gemeinden: [],${gemeindenTodo}
  },

  team: [],${teamTodo}
};
`;

  if (!dryRun) {
    writeFileSync(configPath, configContent, "utf-8");
    log("📄", `Config: src/web/src/lib/customers/${slug}.ts (${todoCount} TODOs)`);
  } else {
    log("📄", `Would create: src/web/src/lib/customers/${slug}.ts (${todoCount} TODOs)`);
  }

  // Update registry
  const registryUpdated = await updateRegistry(slug, varName);

  return { todoCount, imagesSelected, registryUpdated };
}

function guessImageExt(url, buf) {
  // Check magic bytes
  if (buf[0] === 0xFF && buf[1] === 0xD8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf[0] === 0x52 && buf[1] === 0x49) return "webp";
  // Fallback to URL extension
  const ext = url.match(/\.(jpe?g|png|webp|avif|gif)/i)?.[1]?.toLowerCase();
  return ext === "jpeg" ? "jpg" : (ext || "jpg");
}

function esc(str) {
  return (str || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

async function updateRegistry(slug, varName) {
  const registryPath = join(CUSTOMERS_LIB, "registry.ts");
  let content = readFileSync(registryPath, "utf-8");

  // Check if already registered
  if (content.includes(`"${slug}"`)) {
    log("📋", "Registry: already registered (idempotent)");
    return false;
  }

  if (dryRun) {
    log("📋", "Would update registry.ts");
    return true;
  }

  // Add import line before the last import
  const lastImportIdx = content.lastIndexOf("import ");
  const lastImportEnd = content.indexOf("\n", lastImportIdx);
  const importLine = `import { ${varName} } from "./${slug}";`;
  content = content.slice(0, lastImportEnd + 1) + importLine + "\n" + content.slice(lastImportEnd + 1);

  // Add entry to customers object — find the closing }; of the record
  const recordEnd = content.indexOf("};");
  if (recordEnd === -1) {
    log("⚠️ ", "Could not find registry object end");
    return false;
  }

  // Find the last entry line before };
  const beforeEnd = content.lastIndexOf(",", recordEnd);
  if (beforeEnd === -1) {
    log("⚠️ ", "Could not find last registry entry");
    return false;
  }

  // Insert new entry after the last comma-terminated line
  const insertPos = content.indexOf("\n", beforeEnd) + 1;
  const newEntry = `  "${slug}": ${varName},\n`;
  content = content.slice(0, insertPos) + newEntry + content.slice(insertPos);

  writeFileSync(registryPath, content, "utf-8");
  log("📋", "Registry: updated");
  return true;
}

// ── Step 3: Tenant Module ─────────────────────────────────────────────────

async function createTenant(manifest) {
  if (skipTenant) {
    log("⏭️ ", "Tenant module: skipped");
    return { tenantId: null };
  }

  console.log("\n━━━ Step 3: Tenant module ━━━\n");

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log("⚠️ ", "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping tenant");
    return { tenantId: null };
  }

  const slug = manifest.slug;
  const name = manifest.name;

  // Build modules JSONB
  const smsConfig = manifest.modules?.sms || {};
  const modules = {
    website_wizard: manifest.modules?.website !== false,
    ops: manifest.modules?.ops !== false,
    voice: manifest.modules?.voice !== false,
    reviews: !!manifest.modules?.reviews,
    sms: smsConfig.enabled !== false,
  };
  if (smsConfig.sender_name) {
    modules.sms_sender_name = smsConfig.sender_name;
  }

  if (dryRun) {
    log("🗄️ ", `Would upsert tenant: slug="${slug}", modules=${JSON.stringify(modules)}`);
    return { tenantId: "dry-run" };
  }

  const REST = `${SUPABASE_URL}/rest/v1`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  };

  const res = await fetch(`${REST}/tenants?on_conflict=slug`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, slug, modules }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    log("❌", `Tenant upsert failed (HTTP ${res.status}): ${JSON.stringify(data)}`);
    return { tenantId: null };
  }

  const tenant = Array.isArray(data) ? data[0] : data;
  log("🗄️ ", `Tenant upserted: ${tenant.id} (${tenant.slug})`);

  // Verify
  const verifyRes = await fetch(
    `${REST}/tenants?slug=eq.${encodeURIComponent(slug)}&select=id,name,slug,modules`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const verifyData = await verifyRes.json().catch(() => []);
  if (Array.isArray(verifyData) && verifyData.length > 0) {
    log("✅", `Verified: ${verifyData[0].name} (${verifyData[0].id})`);
  }

  return { tenantId: tenant.id };
}

// ── Step 4: Voice Module ──────────────────────────────────────────────────

function generateVoiceConfigs(manifest) {
  if (skipVoice || manifest.modules?.voice === false) {
    log("⏭️ ", "Voice module: skipped");
    return { deAgent: null, intlAgent: null };
  }

  console.log("\n━━━ Step 4: Voice module ━━━\n");

  const slug = manifest.slug;
  const templateDe = join(RETELL_EXPORTS, "brunner_agent.json");
  const templateIntl = join(RETELL_EXPORTS, "brunner_agent_intl.json");

  if (!existsSync(templateDe) || !existsSync(templateIntl)) {
    log("⚠️ ", "Voice templates not found — skipping");
    return { deAgent: null, intlAgent: null };
  }

  const deJson = JSON.parse(readFileSync(templateDe, "utf-8"));
  const intlJson = JSON.parse(readFileSync(templateIntl, "utf-8"));

  const companyName = manifest.name;
  const contact = manifest.contact || {};
  const services = (manifest.services || []).map((s) => s.name).join(", ");
  const team = (manifest.team || []).map((t) => `${t.name} (${t.role})`).join(", ") || "Noch nicht erfasst";
  const hours = (contact.opening_hours || []).join("\n");
  const address = [contact.address?.street, contact.address?.zip, contact.address?.city].filter(Boolean).join(", ");

  // Build FIRMEN-WISSEN replacement block
  const firmenWissen = `═══════════════════════════════════════
FIRMEN-WISSEN (${companyName})
═══════════════════════════════════════

Firma: ${companyName}
Inhaber: TODO — Inhaber eintragen
Adresse: ${address || "TODO — Adresse eintragen"}
Telefon: ${contact.phone_display || contact.phone || "TODO"}
E-Mail: ${contact.email || "TODO"}
Website: ${manifest.website_url || "TODO"}
Gegründet: TODO
Team: ${team}
Mitglied: suissetec (Schweizerisch-Liechtensteinischer Gebäudetechnikverband)

Öffnungszeiten:
${hours || "- Montag bis Freitag: 07:00–17:00 Uhr\n- Samstag/Sonntag: geschlossen\n- Notdienst: TODO"}

Leistungen:
${services || "- TODO: Leistungen eintragen"}

Einzugsgebiet: TODO — Gemeinden eintragen

Preisindikationen (unverbindlich, Richtwerte):
- TODO: Preise eintragen
- Verbindliche Offerte: nur vor Ort nach Besichtigung

Lehrstellen & Bewerbungen:
- Aktuell keine offenen Lehrstellen
- Initiativbewerbungen willkommen an ${contact.email || "TODO"}`;

  // Process both DE and INTL agents
  for (const [label, json, suffix] of [["DE", deJson, ""], ["INTL", intlJson, "_intl"]]) {
    // Top-level fields
    json.agent_name = `${companyName} Intake (${label})`;
    json.version_title = `${companyName} Intake (${label}) v1`;

    // Replace FIRMEN-WISSEN block in global_prompt
    if (json.conversationFlow?.global_prompt) {
      const gp = json.conversationFlow.global_prompt;
      // Match from first ═══ FIRMEN-WISSEN to the ═══ before STIL
      const firmenStart = gp.indexOf("═══════════════════════════════════════\nFIRMEN-WISSEN");
      const stilStart = gp.indexOf("═══════════════════════════════════════\nSTIL");
      if (firmenStart !== -1 && stilStart !== -1) {
        json.conversationFlow.global_prompt =
          gp.slice(0, firmenStart) + firmenWissen + "\n\n" + gp.slice(stilStart);
      }
    }

    // Replace company name references in all node instructions
    if (json.conversationFlow?.nodes) {
      for (const node of json.conversationFlow.nodes) {
        if (node.instruction?.text) {
          node.instruction.text = node.instruction.text
            .replace(/Brunner Haustechnik AG/g, companyName)
            .replace(/brunner-haustechnik\.ch/g, (manifest.website_url || "").replace(/^https?:\/\//, "").replace(/\/$/, "") || `${slug}.ch`)
            .replace(/Thomas Brunner/g, "dem Inhaber")
            .replace(/Seestrasse 42, 8800 Thalwil/g, address || "TODO")
            .replace(/044 505 48 18/g, contact.phone_display || contact.phone || "TODO")
            .replace(/info@brunner-haustechnik\.ch/g, contact.email || `info@${slug}.ch`);
        }
      }
    }

    const outPath = join(RETELL_EXPORTS, `${slug}_agent${suffix}.json`);

    if (dryRun) {
      log("🎙️ ", `Would create: retell/exports/${slug}_agent${suffix}.json`);
    } else {
      writeFileSync(outPath, JSON.stringify(json, null, 2), "utf-8");
      log("🎙️ ", `Created: retell/exports/${slug}_agent${suffix}.json`);
    }
  }

  return { deAgent: `${slug}_agent.json`, intlAgent: `${slug}_agent_intl.json` };
}

// ── Step 5: Summary ───────────────────────────────────────────────────────

function printSummary(manifest, results) {
  const slug = manifest.slug;
  const { crawlData, websiteResult, tenantResult, voiceResult } = results;

  const smsConfig = manifest.modules?.sms || {};
  const reviewsConfig = manifest.modules?.reviews || {};

  console.log(`
━━━ Prospect Pipeline: ${slug} ━━━
`);

  if (crawlData) {
    log("🌐", `Crawl:    ${crawlData.pages_visited} pages, ${crawlData.image_count} images found (${websiteResult?.imagesSelected || 0} selected)`);
    log("📊", `Detected: ${(manifest._crawl?.auto_detected || []).map((d) => `${d} ✅`).join("  ")}  ${manifest.services?.length || 0} services`);
  }

  if (!skipWebsite && manifest.modules?.website !== false) {
    if (dryRun) {
      log("📄", `Website:  would create src/web/src/lib/customers/${slug}.ts`);
    } else {
      log("📄", `Website:  src/web/src/lib/customers/${slug}.ts (${websiteResult?.todoCount || 0} TODOs)`);
    }
    log("📋", `Registry: ${websiteResult?.registryUpdated ? "updated" : "already registered"}`);
  }

  if (!skipTenant) {
    if (tenantResult?.tenantId) {
      log("🗄️ ", `Tenant:   ${dryRun ? "would create" : "created"} (id: ${tenantResult.tenantId})`);
    } else if (tenantResult?.tenantId === null && !skipTenant) {
      log("🗄️ ", "Tenant:   skipped (no Supabase credentials)");
    }
  }

  if (!skipVoice && manifest.modules?.voice !== false) {
    if (voiceResult?.deAgent) {
      log("🎙️ ", `Voice:    retell/exports/${voiceResult.deAgent} (DE + INTL ready)`);
    }
  }

  if (smsConfig.enabled !== false) {
    log("📱", `SMS:      enabled (sender: "${smsConfig.sender_name || generateSenderName(manifest.name)}")`);
  }

  if (reviewsConfig) {
    log("⭐", `Reviews:  enabled (Google URL: ${reviewsConfig.google_url || "TODO"})`);
  }

  console.log(`
  ⏭️  Next:
  1. Review TODOs: src/web/src/lib/customers/${slug}.ts
  2. git add . && git commit -m "feat: add prospect ${slug}" && git push
  3. Live in ~90s: flowsight.ch/kunden/${slug}
  4. Bei Kundenzusage: node retell_sync.mjs --prefix ${slug}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║          FlowSight — Prospect Pipeline            ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  let manifest, crawlData, imageBuffers;

  if (isQuickMode) {
    // Quick mode: crawl website
    console.log(`  Mode:       Quick (crawl + auto-generate)`);
    console.log(`  URL:        ${urlArg}`);
    console.log(`  Slug:       ${slugArg}`);
    if (nameArg) console.log(`  Name:       ${nameArg}`);
    console.log(`  Dry-run:    ${dryRun ? "YES" : "no"}`);
    console.log(`  Skip:       ${[skipWebsite && "website", skipTenant && "tenant", skipVoice && "voice"].filter(Boolean).join(", ") || "none"}`);

    const result = await crawlWebsite(urlArg, slugArg);
    manifest = result.manifest;
    crawlData = result.crawlData;
    imageBuffers = result.imageBuffers;

    // Save onboard.json + crawl_data.json
    const customerDir = join(DOCS_CUSTOMERS, slugArg);
    if (!dryRun) {
      ensureDir(customerDir);
      writeFileSync(join(customerDir, "onboard.json"), JSON.stringify(manifest, null, 2), "utf-8");
      writeFileSync(join(customerDir, "crawl_data.json"), JSON.stringify(crawlData, null, 2), "utf-8");
      log("💾", `Manifest: docs/customers/${slugArg}/onboard.json`);
      log("💾", `Crawl:    docs/customers/${slugArg}/crawl_data.json`);
    } else {
      log("💾", `Would save: docs/customers/${slugArg}/onboard.json`);
      log("💾", `Would save: docs/customers/${slugArg}/crawl_data.json`);
    }
  } else {
    // Config mode: read existing onboard.json
    console.log(`  Mode:       Config (pre-filled manifest)`);
    console.log(`  Config:     ${configArg}`);
    console.log(`  Dry-run:    ${dryRun ? "YES" : "no"}`);
    console.log(`  Skip:       ${[skipWebsite && "website", skipTenant && "tenant", skipVoice && "voice"].filter(Boolean).join(", ") || "none"}`);

    const configPath = resolve(configArg);
    if (!existsSync(configPath)) {
      console.error(`\nERROR: Config file not found: ${configPath}`);
      process.exit(1);
    }

    manifest = JSON.parse(readFileSync(configPath, "utf-8"));
    if (!manifest.slug) {
      console.error("ERROR: onboard.json must have a 'slug' field.");
      process.exit(1);
    }
  }

  // Run modules
  const websiteResult = await generateWebsiteConfig(manifest, imageBuffers || null);
  const tenantResult = await createTenant(manifest);
  const voiceResult = generateVoiceConfigs(manifest);

  // Summary
  printSummary(manifest, {
    crawlData,
    websiteResult,
    tenantResult,
    voiceResult,
  });
}

main().catch((err) => {
  console.error("\nFATAL:", err.message || err);
  process.exit(1);
});
