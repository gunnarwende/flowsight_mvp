#!/usr/bin/env node
/**
 * record_wizard_take3.mjs — Wizard recording for Take 3 (Desktop 1280×720).
 *
 * Records a realistic Wizard submission:
 *   1. Step 1: Click "Leck" category, click "Normal" urgency, click Weiter
 *   2. Step 2: Live-type Bahnhofstrasse / 15 / 8942 / Oberrieden, click Weiter
 *   3. Step 3: Name/Phone/Email pre-filled, LIVE-TYPE description with
 *      typo+correction ("Irgendwtas" → backspace×4 → "etwas scheint undicht zu sein")
 *   4. Submit → MOCKED API response → Success page (DA-0050)
 *
 * DOM-Patch: Header phone replaced with display_phone (+41 44 505 74 21).
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_wizard_take3.mjs --slug doerfler-ag
 */

import { readFile, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";
const baseUrl = args.find((a) => a.startsWith("--base-url"))?.split("=")[1] || "http://localhost:3000";

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const video = config.video || {};
// Samsung-Kontakt-Anzeige = internationale Schreibweise.
// Website-Header (Wizard) = lokale Schreibweise.
const displayPhone = video.display_phone || "+41 44 505 74 21";
// FB67: Wizard-Header nutzt Schweizer Lokalformat (kein +41), entspricht
// Handwerker-Gewohnheit auf eigenen Websites.
const wizardHeaderPhone = video.display_phone_local || "044 505 74 21";
const caseLabel = config._wizard_case_label || "DA-0050";
const caseUuid = config._wizard_case_id || "00000000-0000-0000-0000-000000000050";
const wizardTime = config._wizard_time || new Date().toISOString();

// Reporter identity (matches insert_take3_wizard_case.mjs)
const REPORTER_NAME = "Gunnar Wende";
const REPORTER_PHONE = "076 489 89 80";
const REPORTER_EMAIL = "gunnar.wende@flowsight.ch";

// Target Leck-case address
const STREET = "Bahnhofstrasse";
const HOUSE_NUMBER = "15";
const PLZ = "8942";
const CITY = "Oberrieden";
const DESCRIPTION = "Irgendetwas scheint undicht zu sein";

console.log(`\n=== Take 3 Wizard Recording: ${t.name} (${slug}) ===\n`);
console.log(`  Wizard-Header-Phone (lokal): ${wizardHeaderPhone}`);
console.log(`  case label (mocked):         ${caseLabel}`);

async function typeLikeHuman(page, selector, text, opts = {}) {
  // Mikro-Irregularität: 50-130ms pro Buchstabe.
  const delayBase = opts.base ?? 70;
  const delayJitter = opts.jitter ?? 60;
  const locator = page.locator(selector);
  await locator.click();
  await locator.fill(""); // clear any existing
  for (const ch of text) {
    await locator.type(ch, { delay: delayBase + Math.random() * delayJitter });
  }
}

async function typeWithTypo(page, selector, text, typoPoint, wrongSuffix) {
  // Tippe bis typoPoint dann wrongSuffix dann Backspace×|wrongSuffix| dann Rest.
  const locator = page.locator(selector);
  await locator.click();
  await locator.fill("");
  const before = text.slice(0, typoPoint);
  const rest = text.slice(typoPoint);
  for (const ch of before) {
    await locator.type(ch, { delay: 60 + Math.random() * 70 });
  }
  // Vertipper
  for (const ch of wrongSuffix) {
    await locator.type(ch, { delay: 60 + Math.random() * 70 });
  }
  await page.waitForTimeout(350); // "merken"
  for (let i = 0; i < wrongSuffix.length; i++) {
    await locator.press("Backspace", { delay: 70 });
  }
  for (const ch of rest) {
    await locator.type(ch, { delay: 60 + Math.random() * 70 });
  }
}

const outBase = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
const outDir = join(outBase, "_tmp_wizard");
await mkdir(outDir, { recursive: true });

// B8 Final: Viewport 1440×900 NATIV — keine Stauchung mehr. Step 3 darf
// bei Bedarf scrollen (Playwright scrollt bei Eingabe automatisch).
const VIEWPORT = { width: 1440, height: 900 };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  recordVideo: { dir: outDir, size: VIEWPORT },
});

// ── Hide dev overlays + FB67: weiße Maske initial über gesamter Seite ──
// Der Cover bleibt drauf bis forcePatchPhones() die Maske entfernt. Verhindert
// dass die echte Phone-Nummer im initial-render sichtbar ist.
await context.addInitScript(() => {
  try { localStorage.setItem("ops-push-onboarding-dismissed", Date.now().toString()); } catch {}
  const css = `
    nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast],
    [class*="nextjs"], [id*="nextjs"], [class*="__next-build"],
    div[style*="position: fixed"][style*="z-index: 9"] {
      display: none !important; visibility: hidden !important; opacity: 0 !important;
    }
    button[data-nextjs-toast], div[data-nextjs-toast], [data-nextjs-dev-tools-button] {
      display: none !important;
    }
    /* FB67 Cover: Weiße Fullscreen-Maske bis Phone gepatcht ist.
       Opak, kein transition initial (nur beim removal). */
    #fb67-cover {
      position: fixed !important;
      inset: 0 !important;
      background-color: #ffffff !important;
      opacity: 1 !important;
      z-index: 2147483647 !important;  /* max int32 — über allem */
      pointer-events: none !important;
    }
    #fb67-cover.fb67-fading {
      transition: opacity 200ms ease-out !important;
      opacity: 0 !important;
    }
  `;
  const injectStyle = () => {
    if (document.getElementById("fb67-style")) return;
    const style = document.createElement("style");
    style.id = "fb67-style";
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  const injectCover = () => {
    if (document.getElementById("fb67-cover")) return;
    const cover = document.createElement("div");
    cover.id = "fb67-cover";
    (document.body || document.documentElement).appendChild(cover);
  };
  injectStyle();
  injectCover();
  // Falls React/HMR Element überschreibt, re-insert.
  window.__fb67_guard = setInterval(() => { injectStyle(); injectCover(); }, 80);
  setTimeout(() => { if (window.__fb67_guard) clearInterval(window.__fb67_guard); }, 5000);

  const observer = new MutationObserver((ms) => {
    for (const m of ms) for (const n of m.addedNodes) {
      if (n.tagName === "NEXTJS-PORTAL" || n.getAttribute?.("data-nextjs-dialog") !== null) n.remove();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
});

// FB70 + FB71 + FB68: Wizard-Styling + aggressive Dev-Badge-Suppression.
async function applyWizardStyles() {
  await page.addStyleTag({
    content: `
      /* FB70: Footer fix unten am Viewport (konstant über alle Steps). */
      body > footer, [class*="Footer"], footer {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        background: #fff !important;
        border-top: 1px solid rgba(0,0,0,0.05) !important;
        z-index: 50 !important;
      }
      main {
        padding-bottom: 80px !important;
      }
      /* C13: Native Tailwind-Layout, aber mit uniform-scale zoom damit Step 3
         in 900px passt ohne Scroll UND ohne Quetschung. zoom skaliert
         alles proportional (nicht wie CSS font-size compression). */
      html { zoom: 0.88 !important; }
      body { zoom: 1 !important; }  /* body-level reset um Doppel-Zoom zu vermeiden */
      /* FB68: ALLE Next.js Dev-Badges aggressive killen — jede Variante
         (Legacy-Portal, neue DevTools-Button, Error-Indicator, Floating-Pills). */
      nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast], [data-nextjs-toast-wrapper],
      [class*="nextjs"], [id*="nextjs"], [class*="__next"],
      button[data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues],
      [aria-label*="issue" i], [aria-label*="Dev Tools" i],
      body > div[style*="position: fixed"][style*="z-index:"][style*="bottom"],
      body > div[style*="position:fixed"][style*="bottom"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  }).catch(() => {});
  // Shadow-DOM + direkt removal für Badges die CSS nicht erwischt.
  await page.evaluate(() => {
    const kill = () => {
      const all = document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], [data-issues-collapsed]');
      all.forEach((el) => el.remove());
      // Heuristisch: fixed positioned bottom-left container mit rotem Circle
      document.querySelectorAll("body > div, body > button").forEach((el) => {
        const s = getComputedStyle(el);
        if (s.position === "fixed" && (parseInt(s.bottom) >= 0 && parseInt(s.bottom) < 50) &&
            (parseInt(s.left) >= 0 && parseInt(s.left) < 50) &&
            (el.textContent || "").match(/issue/i)) {
          el.remove();
        }
      });
    };
    kill();
    // Re-kill if Next.js re-injects.
    if (!window.__fb68_killer) {
      window.__fb68_killer = setInterval(kill, 150);
    }
  }).catch(() => {});
}

// FB67: Phone-Patch-Helper — von Node aus nach jedem Step aufrufbar.
// Das hat im Test zuverlässig alle Text-Nodes ersetzt (addInitScript Variante
// lief auch, aber Patch via page.evaluate() ist der sichere Weg — reliable.)
async function forcePatchPhones(targetPhone) {
  return await page.evaluate((phone) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    let replaced = 0;
    for (const node of nodes) {
      if (!node.nodeValue) continue;
      const patched = node.nodeValue
        .replace(/\+41\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/g, phone)
        .replace(/0\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/g, (m) => {
          if (m.replace(/\s/g, "") === phone.replace(/\s/g, "")) return m;
          return phone;
        });
      if (patched !== node.nodeValue) { node.nodeValue = patched; replaced++; }
    }
    document.querySelectorAll("a[href^='tel:']").forEach((a) => {
      a.setAttribute("href", `tel:${phone.replace(/\s/g, "")}`);
    });
    return replaced;
  }, targetPhone);
}

// FB67: Remove the cover overlay (reveals patched page).
async function removeFb67Cover() {
  await page.evaluate(() => {
    const cover = document.getElementById("fb67-cover");
    if (cover) {
      cover.classList.add("fb67-fading");
      setTimeout(() => cover.remove(), 250);
    }
    // Auch die cover-re-injection guard stoppen
    if (window.__fb67_guard) clearInterval(window.__fb67_guard);
  });
}


const page = await context.newPage();
// Capture console messages from page (Debug FB67)
page.on("console", (msg) => {
  if (msg.text().includes("[FB67]")) console.log("  page:", msg.text());
});

// ── Mock POST /api/cases: return deterministic DA-0050 success ──
const mockPayload = {
  id: caseUuid,
  seq_number: config._wizard_seq_number || 50,
  case_id_prefix: t.case_id_prefix || "DA",
  tenant_id: "mocked-tenant-id",
  source: "wizard",
  urgency: "normal",
  category: "Leck",
  city: CITY,
  created_at: wizardTime,
  verify_token: "mocked-token-take3",
};

await page.route("**/api/cases", async (route) => {
  if (route.request().method() === "POST") {
    console.log("  [Mock] POST /api/cases intercepted → returning DA-0050");
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(mockPayload),
    });
  } else {
    await route.continue();
  }
});

// ── Navigate to Wizard (schnell) ──
console.log("  Loading /kunden/" + slug + "/meldung ...");
await page.goto(`${baseUrl}/kunden/${slug}/meldung`, { waitUntil: "domcontentloaded", timeout: 20000 });

// Apply FB70/71 wizard styles first (sticky footer + compact layout).
await applyWizardStyles();

// FB67: Cover bleibt drauf, solange Patch noch nicht durch ist.
// 3 Patch-Durchgänge für React-Hydration-Sicherheit, dann Cover weg.
const r1 = await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles();
await page.waitForTimeout(400);
const r2 = await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles();
await page.waitForTimeout(400);
const r3 = await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles();
console.log(`  [FB67] Phone-Patch: ${r1}+${r2}+${r3} nodes (initial+hydration+safety)`);
// Cover entfernen — erst jetzt ist die echte Phone-Nummer nicht mehr sichtbar.
await removeFb67Cover();
await page.waitForTimeout(400); // Fade-Out abwarten

console.log("  C1: Wizard Step 1 loaded, pausing to show initial state ...");
await page.waitForTimeout(2000);

// Re-patch vor C2 (falls React neu gerendert hat)
await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles();

// ── C2: Click Leck category ──
// Strategy: click the direct Leck label inside the CategoryCard button.
// Playwright click bubbles to parent <button>.
await page.locator('button').filter({ has: page.locator('text=Leck') }).first()
  .click({ timeout: 8000 });
console.log("  C2: 'Leck' ausgewählt");
await page.waitForTimeout(1200);

// ── C3: Click Normal urgency ──
await page.locator('button').filter({ has: page.locator('text=Normal') }).first()
  .click({ timeout: 8000 });
console.log("  C3: 'Normal' ausgewählt");
await page.waitForTimeout(1500);

// ── Click Weiter ──
await page.locator('button:has-text("Weiter")').first().click();
console.log("  → Step 2");
await page.waitForTimeout(1500);
await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles(); // Header survives step change

// ── C4-C5: Live-type address fields ──
// Strasse-Feld
await typeLikeHuman(page, 'input[placeholder*="Bahnhofstrasse"], input[name="street"]', STREET);
await page.waitForTimeout(400);
// Nr-Feld
await typeLikeHuman(page, 'input[placeholder*="12a"], input[name="house_number"]', HOUSE_NUMBER);
await page.waitForTimeout(400);
// PLZ-Feld
await typeLikeHuman(page, 'input[placeholder*="8000"], input[name="plz"]', PLZ);
await page.waitForTimeout(400);
// Ort-Feld
await typeLikeHuman(page, 'input[placeholder*="Zürich"], input[name="city"]', CITY);
console.log("  C5: Adresse live getippt");
await page.waitForTimeout(1500);

// ── Click Weiter ──
await page.locator('button:has-text("Weiter")').first().click();
console.log("  → Step 3");
await page.waitForTimeout(1500);
await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles();

// ── Step 3: Pre-fill Name/Phone/Email ──
// Use selectors based on label text proximity. The wizard has labels above inputs.
await typeLikeHuman(page, 'input[name="contactName"], input[id*="name"], input[aria-label*="Name"]', REPORTER_NAME, { base: 50, jitter: 40 });
await page.waitForTimeout(400);
await typeLikeHuman(page, 'input[name="contactPhone"], input[type="tel"]', REPORTER_PHONE, { base: 50, jitter: 40 });
await page.waitForTimeout(400);
await typeLikeHuman(page, 'input[name="contactEmail"], input[type="email"]', REPORTER_EMAIL, { base: 50, jitter: 40 });
await page.waitForTimeout(600);

// ── C6: Live-type description WITH typo+correction ──
// "Irgendetwas" — user types "Irgendwtas" (typo "wt" instead of "et"),
// pauses, deletes 4 chars ("wtas"), then corrects.
// Typo at position 6 ("Irgend" | "wtas" [typo] → backspace ×4 → "etwas")
await typeWithTypo(
  page,
  'textarea[name="description"], textarea[id*="description"], textarea',
  DESCRIPTION,
  6,       // position after "Irgend"
  "wtas"   // typo
);
console.log("  C6: Beschreibung live getippt (mit Vertipper+Korrektur)");
await page.waitForTimeout(1200);

// FB122: KEIN scroll — aggressive CSS oben sorgt dafür dass alles auf 900px passt.
// Verify: scrollHeight sollte ≤ viewport sein. Wenn nicht, logge Warnung.
const needScroll = await page.evaluate(() => {
  const doc = document.documentElement;
  return doc.scrollHeight > doc.clientHeight + 10;
});
if (needScroll) {
  console.warn("  ⚠ Step 3 overflow — content > viewport, CSS muss noch kompakter");
}
await page.waitForTimeout(1000);

// ── Click "Meldung absenden" → mocked API → success page ──
await page.locator('button:has-text("Meldung absenden")').first().click();
console.log("  → Submit geklickt");
await page.waitForTimeout(1500);
await forcePatchPhones(wizardHeaderPhone);
await applyWizardStyles(); // Success-Page kann Phone enthalten
await page.waitForTimeout(1500);

// ── C7: Success-Page ──
console.log("  C7: Success-Page sichtbar (DA-0050)");
await page.waitForTimeout(2500);

// Save video BEFORE closing context (Playwright requires live context).
const recVideo = page.video();
const finalPath = join(outBase, "take3_wizard.webm");
if (existsSync(finalPath)) await rm(finalPath);
await page.close(); // triggers video finalization
if (recVideo) {
  await recVideo.saveAs(finalPath);
}
await context.close();
await browser.close();
await rm(outDir, { recursive: true, force: true });

const kb = Math.round((await import("node:fs")).statSync(finalPath).size / 1024);
console.log(`\n✅ Saved: ${finalPath} (${kb} KB)\n`);
