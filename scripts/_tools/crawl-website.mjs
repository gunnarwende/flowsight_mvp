#!/usr/bin/env node
/**
 * crawl-website.mjs — Extract ALL images from a website (including JS-loaded).
 *
 * Uses Puppeteer (headless Chrome) so it sees dynamically loaded images,
 * lightbox galleries, lazy-loaded content, etc.
 *
 * Usage:
 *   npx puppeteer browsers install chrome   # first time only
 *   node scripts/_tools/crawl-website.mjs <url> [--out <dir>] [--click-thumbs]
 *
 * Examples:
 *   node scripts/_tools/crawl-website.mjs https://www.doerflerag.ch/
 *   node scripts/_tools/crawl-website.mjs https://www.doerflerag.ch/ --out docs/customers/doerfler-ag/images
 *   node scripts/_tools/crawl-website.mjs https://www.example.ch/ --click-thumbs
 *
 * Options:
 *   --out <dir>       Output directory (default: .crawl-images/<domain>)
 *   --click-thumbs    Try clicking thumbnail/gallery elements to trigger lightbox
 *   --max-pages <n>   Max pages to crawl (default: 50)
 *   --min-size <n>    Min image dimension in px to download (default: 80, skips tiny icons)
 */

import puppeteer from "puppeteer";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { createHash } from "node:crypto";

// ── CLI args ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const startUrl = args.find((a) => a.startsWith("http"));
if (!startUrl) {
  console.error("Usage: node crawl-website.mjs <url> [--out <dir>] [--click-thumbs]");
  process.exit(1);
}

const domain = new URL(startUrl).hostname;
const outIdx = args.indexOf("--out");
const outDir = outIdx !== -1 ? args[outIdx + 1] : `.crawl-images/${domain}`;
const clickThumbs = args.includes("--click-thumbs");
const maxPagesIdx = args.indexOf("--max-pages");
const maxPages = maxPagesIdx !== -1 ? parseInt(args[maxPagesIdx + 1], 10) : 50;
const minSizeIdx = args.indexOf("--min-size");
const minSize = minSizeIdx !== -1 ? parseInt(args[minSizeIdx + 1], 10) : 80;

// ── State ─────────────────────────────────────────────────────────
const visited = new Set();
const toVisit = [startUrl];
const imageUrls = new Map(); // url → { page, type }
const downloaded = new Set(); // content hashes to dedupe

// ── Helpers ───────────────────────────────────────────────────────
function isSameDomain(url) {
  try {
    return new URL(url).hostname === domain;
  } catch {
    return false;
  }
}

function isImageUrl(url) {
  const path = new URL(url).pathname.toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff?)$/i.test(path);
}

function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

function pageSlug(url) {
  const path = new URL(url).pathname;
  if (path === "/" || path === "") return "home";
  return path.replace(/^\/|\/$/g, "").replace(/[/.]/g, "-") || "home";
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
      // Safety timeout
      setTimeout(() => { clearInterval(timer); resolve(); }, 10000);
    });
  });
}

async function collectImageUrls(page, pageUrl) {
  // 1. All <img> src and srcset
  const imgSrcs = await page.evaluate(() => {
    const urls = [];
    document.querySelectorAll("img").forEach((img) => {
      if (img.src) urls.push(img.src);
      if (img.srcset) {
        img.srcset.split(",").forEach((entry) => {
          const url = entry.trim().split(/\s+/)[0];
          if (url) urls.push(url);
        });
      }
      // data-src (lazy load)
      const dataSrc = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
      if (dataSrc) urls.push(dataSrc);
    });
    return urls;
  });

  // 2. CSS background images
  const bgImages = await page.evaluate(() => {
    const urls = [];
    document.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1]) urls.push(match[1]);
      }
    });
    return urls;
  });

  // 3. <a> href pointing to images (common in galleries)
  const linkImages = await page.evaluate(() => {
    const urls = [];
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.href;
      if (/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff?)$/i.test(href)) {
        urls.push(href);
      }
    });
    return urls;
  });

  // 4. <source> elements (picture, video poster)
  const sourceSrcs = await page.evaluate(() => {
    const urls = [];
    document.querySelectorAll("source").forEach((s) => {
      if (s.srcset) {
        s.srcset.split(",").forEach((entry) => {
          const url = entry.trim().split(/\s+/)[0];
          if (url) urls.push(url);
        });
      }
      if (s.src) urls.push(s.src);
    });
    document.querySelectorAll("[poster]").forEach((el) => {
      if (el.poster) urls.push(el.poster);
    });
    return urls;
  });

  const allUrls = [...imgSrcs, ...bgImages, ...linkImages, ...sourceSrcs];

  for (const raw of allUrls) {
    try {
      const full = new URL(raw, pageUrl).href;
      if (!imageUrls.has(full)) {
        imageUrls.set(full, { page: pageUrl, type: "dom" });
      }
    } catch { /* skip invalid urls */ }
  }
}

async function tryClickThumbnails(page, pageUrl) {
  // Find clickable image containers (common gallery patterns)
  const selectors = [
    'a[data-lightbox]',
    'a[data-fancybox]',
    'a[rel="lightbox"]',
    'a[class*="lightbox"]',
    'a[class*="gallery"]',
    'a[class*="thumb"]',
    '.gallery a',
    '.lightbox a',
    '[data-gallery] a',
    'a[href*=".jpg"]',
    'a[href*=".jpeg"]',
    'a[href*=".png"]',
    'a[href*=".webp"]',
    // Common CMS patterns
    '.wp-block-gallery a',
    '.ngg-gallery-thumbnail a',
    '.fotorama__thumb',
    'figure a',
    '.photo a',
    '.bild a',
    '.referenz a',
  ];

  for (const sel of selectors) {
    try {
      const elements = await page.$$(sel);
      if (elements.length === 0) continue;

      console.log(`    📸 Found ${elements.length} clickable elements matching: ${sel}`);

      for (const el of elements) {
        try {
          // Collect any href that's an image
          const href = await el.evaluate((e) => e.href || "");
          if (href && isImageUrl(href)) {
            const full = new URL(href, pageUrl).href;
            if (!imageUrls.has(full)) {
              imageUrls.set(full, { page: pageUrl, type: "gallery-href" });
            }
          }

          // Click to trigger lightbox
          await el.click();
          await page.waitForNetworkIdle({ timeout: 3000 }).catch(() => {});

          // Grab any new images that appeared (lightbox overlay)
          await collectImageUrls(page, pageUrl);

          // Close lightbox (try common close buttons)
          await page.evaluate(() => {
            const closeSelectors = [
              '.lightbox-close', '.fancybox-close', '.close', '[aria-label="Close"]',
              '.lb-close', '.pswp__button--close', '.mfp-close',
            ];
            for (const sel of closeSelectors) {
              const btn = document.querySelector(sel);
              if (btn) { btn.click(); return; }
            }
            // ESC key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          });

          await new Promise((r) => setTimeout(r, 300));
        } catch { /* click failed, move on */ }
      }
    } catch { /* selector failed, move on */ }
  }
}

// ── Download ──────────────────────────────────────────────────────
async function downloadImage(browser, url, pageSlugStr, index) {
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, { timeout: 15000, waitUntil: "load" });

    if (!response || !response.ok()) {
      await page.close();
      return null;
    }

    const buffer = await response.buffer();
    await page.close();

    // Skip tiny images (icons, spacers)
    if (buffer.length < 500) return null;

    // Dedupe by content hash
    const hash = createHash("md5").update(buffer).digest("hex").slice(0, 12);
    if (downloaded.has(hash)) return "dupe";
    downloaded.add(hash);

    // Determine extension from URL or content-type
    const contentType = response.headers()["content-type"] || "";
    let ext = extname(new URL(url).pathname).toLowerCase();
    if (!ext || ext.length > 6) {
      if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = ".jpg";
      else if (contentType.includes("png")) ext = ".png";
      else if (contentType.includes("webp")) ext = ".webp";
      else if (contentType.includes("gif")) ext = ".gif";
      else if (contentType.includes("svg")) ext = ".svg";
      else ext = ".jpg"; // fallback
    }

    const filename = `${pageSlugStr}_${String(index).padStart(3, "0")}_${hash}${ext}`;
    const dir = join(outDir, pageSlugStr);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);

    return filename;
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌐 Crawling: ${startUrl}`);
  console.log(`📁 Output:   ${outDir}`);
  console.log(`📏 Min size: ${minSize}px | Max pages: ${maxPages}`);
  console.log(`🖱️  Click thumbnails: ${clickThumbs}\n`);

  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // ── Network interception for images ──
  const networkImages = new Map();

  // ── Crawl pages ──
  let pageCount = 0;

  while (toVisit.length > 0 && pageCount < maxPages) {
    const url = toVisit.shift();
    const normalized = url.replace(/#.*$/, "").replace(/\/$/, "");

    if (visited.has(normalized)) continue;
    visited.add(normalized);
    pageCount++;

    console.log(`📄 [${pageCount}] ${url}`);

    const page = await browser.newPage();

    // Intercept network requests for images
    page.on("response", async (response) => {
      const respUrl = response.url();
      const ct = response.headers()["content-type"] || "";
      if (ct.startsWith("image/") && !networkImages.has(respUrl)) {
        networkImages.set(respUrl, { page: url, type: "network" });
      }
    });

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      // Scroll to trigger lazy loading
      await autoScroll(page);
      await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

      // Collect image URLs from DOM
      await collectImageUrls(page, url);

      // Click thumbnails if requested
      if (clickThumbs) {
        await tryClickThumbnails(page, url);
      }

      // Find internal links for crawling
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]")).map((a) => a.href);
      });

      for (const link of links) {
        const clean = link.replace(/#.*$/, "").replace(/\/$/, "");
        if (isSameDomain(link) && !visited.has(clean)) {
          toVisit.push(link);
        }
      }
    } catch (err) {
      console.log(`    ⚠️  Error: ${err.message}`);
    }

    await page.close();
  }

  // Merge network-intercepted images
  for (const [url, meta] of networkImages) {
    if (!imageUrls.has(url)) {
      imageUrls.set(url, meta);
    }
  }

  console.log(`\n✅ Crawled ${pageCount} pages`);
  console.log(`🖼️  Found ${imageUrls.size} unique image URLs\n`);

  // ── Filter & Download ──
  let downloadCount = 0;
  let dupeCount = 0;
  let skipCount = 0;

  const grouped = {};
  for (const [url, meta] of imageUrls) {
    const slug = pageSlug(meta.page);
    if (!grouped[slug]) grouped[slug] = [];
    grouped[slug].push(url);
  }

  for (const [slug, urls] of Object.entries(grouped)) {
    console.log(`📂 ${slug}: ${urls.length} images`);

    let index = 0;
    for (const url of urls) {
      const result = await downloadImage(browser, url, slug, index);
      if (result === "dupe") {
        dupeCount++;
      } else if (result) {
        downloadCount++;
        index++;
      } else {
        skipCount++;
      }
    }
  }

  await browser.close();

  // ── Summary ──
  const summary = {
    source: startUrl,
    crawledAt: new Date().toISOString(),
    pagesVisited: pageCount,
    totalImageUrls: imageUrls.size,
    downloaded: downloadCount,
    duplicates: dupeCount,
    skipped: skipCount,
    outputDir: outDir,
  };

  await writeFile(
    join(outDir, "_crawl-summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n────────────────────────────────────`);
  console.log(`📊 Summary:`);
  console.log(`   Pages crawled:  ${pageCount}`);
  console.log(`   Images found:   ${imageUrls.size}`);
  console.log(`   Downloaded:     ${downloadCount}`);
  console.log(`   Duplicates:     ${dupeCount}`);
  console.log(`   Skipped (tiny): ${skipCount}`);
  console.log(`   Output:         ${outDir}`);
  console.log(`────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
