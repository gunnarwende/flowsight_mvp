#!/usr/bin/env node
/**
 * qa_sweep.mjs — QA Sweep for FlowSight surfaces (Phase A: DOM + Phase B: Vision)
 *
 * Compares live surfaces against Identity Contract + Leitstand Zielbild.
 * Outputs structured delta report: STOPP / SYSTEM / FOUNDER / POLISH.
 *
 * Phase A (DOM): Structural checks (text, classes, attributes, tab titles).
 * Phase B (Vision): Claude Vision API analysis of screenshots for visual/qualitative gaps.
 *   Requires ANTHROPIC_API_KEY. Skipped gracefully if not set.
 *
 * Surfaces checked:
 *   - Website /kunden/[slug]  (public)
 *   - Wizard  /kunden/[slug]/melden  (public)
 *   - Leitstand /ops/cases  (auth via magic link)
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/qa_sweep.mjs --tenant=weinberger-ag --screenshots
 *   node --env-file=src/web/.env.local scripts/_ops/qa_sweep.mjs --tenant=weinberger-ag --screenshots --no-vision
 *   node --env-file=src/web/.env.local scripts/_ops/qa_sweep.mjs --tenant=weinberger-ag --target=http://localhost:3000 --screenshots
 *
 * Prerequisites:
 *   cd src/web && npm install --save-dev playwright && npx playwright install chromium
 *
 * Exit code: 1 if STOPP deltas found, 0 otherwise, 2 on script error.
 */

import { createRequire } from "module";
import fs from "fs";

// Resolve playwright from src/web/node_modules (installed there, script runs from repo root)
const require = createRequire(
  new URL("../../src/web/package.json", import.meta.url),
);
const { chromium } = require("playwright");

// ── Args ───────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const eq = a.indexOf("=");
      return eq > 0 ? [a.slice(2, eq), a.slice(eq + 1)] : [a.slice(2), true];
    }),
);

const TENANT_SLUG = args.tenant;
if (!TENANT_SLUG) {
  console.error(
    "Usage: qa_sweep.mjs --tenant=<slug> [--target=<url>] [--screenshots]",
  );
  process.exit(1);
}

const TARGET =
  args.target ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://flowsight.ch";
const TAKE_SCREENSHOTS = !!args.screenshots;
const SKIP_VISION = !!args["no-vision"];
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const VISION_ENABLED = !SKIP_VISION && !!ANTHROPIC_API_KEY && TAKE_SCREENSHOTS;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const SB_HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

// ── Tenant Config ──────────────────────────────────────────────
async function loadTenantConfig() {
  // 1. Load from Supabase
  const url = `${SUPABASE_URL}/rest/v1/tenants?slug=eq.${TENANT_SLUG}&select=id,name,slug,case_id_prefix,modules`;
  const res = await fetch(url, { headers: SB_HEADERS });
  const rows = await res.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    console.error(`Tenant "${TENANT_SLUG}" not found in DB`);
    process.exit(1);
  }

  const t = rows[0];
  const shortName = t.modules?.sms_sender_name ?? t.name;

  // 2. Extract brandColor from CustomerSite TypeScript file
  let brandColorFromCode = null;
  try {
    const tsPath = `src/web/src/lib/customers/${TENANT_SLUG}.ts`;
    const tsContent = fs.readFileSync(tsPath, "utf8");
    const m = tsContent.match(/brandColor:\s*"(#[0-9a-fA-F]{3,8})"/);
    if (m) brandColorFromCode = m[1];
  } catch {
    /* file may not exist for all tenants */
  }

  const brandColor =
    t.modules?.primary_color ?? brandColorFromCode ?? "#d4a853";

  return {
    tenantId: t.id,
    displayName: t.name,
    shortName,
    caseIdPrefix: t.case_id_prefix ?? "FS",
    brandColor,
    brandColorFromCode,
    slug: t.slug,
  };
}

// ── Delta Collection ───────────────────────────────────────────
const deltas = [];

function delta(severity, id, title, surface, expected, found, ref) {
  deltas.push({ severity, id, title, surface, expected, found, ref });
}

// ── Supabase Auth (magic link + cookie injection for Playwright) ─
function extractProjectRef() {
  // SUPABASE_URL = https://<project-ref>.supabase.co
  const m = SUPABASE_URL.match(/https:\/\/([^.]+)\./);
  return m ? m[1] : "unknown";
}

async function getAdminEmail() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=10`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  const data = await res.json();
  const users = data.users ?? [];
  const admin = users.find(
    (u) => u.app_metadata?.role === "admin" && u.email,
  );
  return admin?.email ?? null;
}

async function authenticatePlaywright(context, page) {
  const email = await getAdminEmail();
  if (!email) {
    console.log("  ✗ No admin user found in Supabase");
    return false;
  }
  console.log(`  Auth as: ${email.slice(0, 3)}***`);

  // Generate magic link via Admin API
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "magiclink",
      email,
      redirect_to: `${TARGET}/ops/cases`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.log(`  ✗ Magic link generation failed: ${res.status} ${err}`);
    return false;
  }

  const link = await res.json();
  const token = link.hashed_token ?? link.properties?.hashed_token;
  if (!token) {
    console.log("  ✗ No hashed_token in response");
    return false;
  }

  const verifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(TARGET + "/ops/cases")}`;

  console.log("  Verifying magic link...");
  try {
    await page.goto(verifyUrl, { waitUntil: "networkidle", timeout: 20000 });
  } catch {
    // networkidle timeout is OK — page may still have navigated
  }
  await page.waitForTimeout(2000);

  // The redirect may land on a different domain with tokens in the URL fragment.
  // Strategy: extract access_token from fragment or from cookies, then inject.
  const currentUrl = page.url();

  // Check if already authenticated (landed on /ops/ successfully)
  if (
    currentUrl.includes("/ops/") &&
    !currentUrl.includes("/login") &&
    !currentUrl.includes("/expired")
  ) {
    console.log("  ✓ Authenticated (direct redirect)");
    return true;
  }

  // Extract tokens from URL fragment (#access_token=...&refresh_token=...)
  const hashIdx = currentUrl.indexOf("#");
  if (hashIdx === -1) {
    console.log(`  ✗ No tokens in URL: ${currentUrl.slice(0, 80)}...`);
    return false;
  }

  const fragment = currentUrl.slice(hashIdx + 1);
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresAt = params.get("expires_at");

  if (!accessToken || !refreshToken) {
    console.log("  ✗ Could not extract tokens from URL fragment");
    return false;
  }

  // Build Supabase auth cookie value
  // @supabase/ssr stores session as JSON in sb-<ref>-auth-token cookie(s)
  const projectRef = extractProjectRef();
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionJson = JSON.stringify({
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: parseInt(expiresAt, 10) || Math.floor(Date.now() / 1000) + 3600,
    refresh_token: refreshToken,
  });

  // Parse target domain for cookie
  const targetUrl = new URL(TARGET);
  const cookieDomain = targetUrl.hostname;

  // Supabase SSR may split large cookies — for now, try single cookie
  // If value > ~3180 chars, it needs to be split into .0, .1, etc.
  const CHUNK_SIZE = 3180;
  const chunks = [];
  for (let i = 0; i < sessionJson.length; i += CHUNK_SIZE) {
    chunks.push(sessionJson.slice(i, i + CHUNK_SIZE));
  }

  const cookiesToSet = chunks.map((chunk, i) => ({
    name: chunks.length === 1 ? cookieName : `${cookieName}.${i}`,
    value: chunk,
    domain: cookieDomain,
    path: "/",
    httpOnly: false,
    secure: targetUrl.protocol === "https:",
    sameSite: "Lax",
  }));

  await context.addCookies(cookiesToSet);
  console.log(
    `  Injected ${cookiesToSet.length} auth cookie(s) for ${cookieDomain}`,
  );

  // Navigate to OPS to verify
  try {
    await page.goto(`${TARGET}/ops/cases`, {
      waitUntil: "networkidle",
      timeout: 15000,
    });
  } catch {
    /* networkidle timeout OK */
  }
  await page.waitForTimeout(2000);

  const finalUrl = page.url();
  if (finalUrl.includes("/ops/") && !finalUrl.includes("/login")) {
    console.log("  ✓ Authenticated (via cookie injection)");
    return true;
  }

  console.log(`  ✗ Auth failed after cookie injection — on: ${finalUrl}`);
  return false;
}

// ── Screenshot Helper ──────────────────────────────────────────
async function screenshot(page, name) {
  if (!TAKE_SCREENSHOTS) return;
  const dir = "tmp/qa/screenshots";
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
}

// ── Checks: Website ────────────────────────────────────────────
async function checkWebsite(page, config) {
  const url = `${TARGET}/kunden/${config.slug}`;
  console.log(`\n  Website: ${url}`);

  let response;
  try {
    response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
  } catch {
    delta(
      "STOPP", "WEB_TIMEOUT", "Website timeout",
      url, "Page loads <15s", "Timeout", "qa_gate.md A6",
    );
    return;
  }

  if (!response || response.status() !== 200) {
    delta(
      "STOPP", "WEB_HTTP", "Website nicht erreichbar",
      url, "HTTP 200", `HTTP ${response?.status() ?? "?"}`, "qa_gate.md A6",
    );
    return;
  }

  await screenshot(page, `website_${config.slug}`);
  const bodyText = await page.textContent("body");

  // Company name visible
  if (!bodyText.includes(config.displayName)) {
    delta(
      "STOPP", "WEB_NAME", "Firmenname nicht auf Website",
      url, config.displayName, "Nicht gefunden", "identity_contract.md R1",
    );
  }

  // No "FlowSight" in nav/hero/main (footer "Powered by" is OK)
  const sections = ["nav", "main", ".hero", "header"];
  for (const sel of sections) {
    const els = await page.locator(sel).allTextContents().catch(() => []);
    const text = els.join(" ");
    if (/flowsight/i.test(text) && !/powered by/i.test(text)) {
      delta(
        "STOPP", "WEB_FLOWSIGHT", `"FlowSight" sichtbar in <${sel}>`,
        url, "Kein FlowSight in Hauptinhalt", `In <${sel}> gefunden`,
        "identity_contract.md R4",
      );
      break;
    }
  }

  // Voice CTA present
  const hasCallCta =
    bodyText.includes("anrufen") ||
    bodyText.includes("Anrufen") ||
    bodyText.includes("Jetzt anrufen") ||
    bodyText.includes("Notfall");
  if (!hasCallCta) {
    delta(
      "SYSTEM", "WEB_VOICE_CTA", "Kein Anruf-CTA gefunden",
      url, "CTA mit Telefonnummer", "Nicht gefunden", "gold_contact.md",
    );
  }

  // Services listed
  const hasServices =
    bodyText.includes("Sanitär") ||
    bodyText.includes("Heizung") ||
    bodyText.includes("Leistungen") ||
    bodyText.includes("Services");
  if (!hasServices) {
    delta(
      "SYSTEM", "WEB_SERVICES", "Keine Leistungen auf Website",
      url, "Services/Leistungen sichtbar", "Nicht gefunden",
      "identity_contract.md R2",
    );
  }
}

// ── Checks: Wizard ─────────────────────────────────────────────
async function checkWizard(page, config) {
  // Try direct wizard URL patterns
  const wizardUrls = [
    `${TARGET}/kunden/${config.slug}/melden`,
    `${TARGET}/kunden/${config.slug}/formular`,
  ];

  let wizardFound = false;
  for (const url of wizardUrls) {
    try {
      const res = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
      if (res && res.status() === 200) {
        wizardFound = true;
        console.log(`  Wizard: ${url}`);
        await screenshot(page, `wizard_${config.slug}`);

        const bodyText = await page.textContent("body");

        // No "FlowSight" in wizard
        if (/flowsight/i.test(bodyText) && !/powered by/i.test(bodyText)) {
          delta(
            "STOPP", "WIZ_FLOWSIGHT", "FlowSight sichtbar im Wizard",
            url, "Kein FlowSight", "Gefunden", "identity_contract.md R4",
          );
        }

        // Wizard shows tenant name or branding
        if (!bodyText.includes(config.displayName) && !bodyText.includes(config.shortName)) {
          delta(
            "SYSTEM", "WIZ_BRANDING", "Wizard zeigt keinen Firmennamen",
            url, config.displayName, "Nicht gefunden",
            "identity_contract.md R4",
          );
        }

        // Emergency option present
        if (!bodyText.includes("Notfall") && !bodyText.includes("dringend") && !bodyText.includes("Dringend")) {
          delta(
            "SYSTEM", "WIZ_EMERGENCY", "Keine Notfall-Option im Wizard",
            url, "Notfall/Dringend-Option", "Nicht gefunden",
            "wizard.md N1-N7",
          );
        }
        break;
      }
    } catch {
      /* try next URL */
    }
  }

  if (!wizardFound) {
    // Check if wizard is embedded on the website page
    console.log("  Wizard: Keine dedizierte URL gefunden (ggf. embedded)");
  }
}

// ── Checks: Leitstand ──────────────────────────────────────────
async function checkLeitstand(page, config) {
  const url = `${TARGET}/ops/cases`;
  console.log(`  Leitstand: ${url}`);

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
  } catch {
    // networkidle may timeout — check if page loaded anyway
  }

  await page.waitForTimeout(2000); // React hydration
  await screenshot(page, `leitstand_${config.slug}`);

  const bodyText = await page.textContent("body").catch(() => "");

  // If we got redirected to login, auth is broken
  if (page.url().includes("/login")) {
    delta(
      "FOUNDER", "OPS_AUTH", "Leitstand: Redirect auf Login",
      url, "Authentifizierter Zugang", "Redirect auf /login",
      "Prüfen: Admin-User + Magic Link",
    );
    return;
  }

  // ── Sidebar Checks ──
  // Desktop sidebar: aside element with specific structure from OpsShell.tsx
  const sidebar = page.locator("aside").first();
  const sidebarVisible = await sidebar.isVisible().catch(() => false);

  if (sidebarVisible) {
    // Initials check (inside the rounded-lg avatar div)
    const initialsEl = sidebar.locator(".rounded-lg span").first();
    const initials = await initialsEl.textContent().catch(() => null);

    if (initials === "LS" || initials === "FS") {
      delta(
        "STOPP", "IC_SIDEBAR_INITIALS",
        `Sidebar zeigt "${initials}" statt Tenant-Initialen`,
        url,
        `Tenant-Initialen (abgeleitet aus "${config.displayName}")`,
        `"${initials}" (Fallback)`,
        "identity_contract.md R4, ticketlist D8",
      );
    }

    // Sidebar display name
    const sidebarNameEl = sidebar.locator("span.truncate, span.font-bold.text-gray-900").first();
    const sidebarName = await sidebarNameEl.textContent().catch(() => null);

    if (sidebarName && sidebarName.trim() === "Leitstand") {
      delta(
        "STOPP", "IC_SIDEBAR_NAME",
        'Sidebar zeigt "Leitstand" statt Firmenname',
        url, config.displayName, '"Leitstand"',
        "identity_contract.md R4",
      );
    }

    // Brand color: avatar background should be tenant color, not amber
    const avatarDiv = sidebar.locator(".rounded-lg").first();
    const avatarInfo = await avatarDiv.evaluate((el) => ({
      bg: window.getComputedStyle(el).backgroundColor,
      classes: el.className,
    })).catch(() => null);

    if (avatarInfo) {
      const { bg, classes } = avatarInfo;
      // amber-500 = rgb(245, 158, 11) or class contains "amber"
      const isAmber =
        bg.includes("245, 158, 11") ||
        bg.includes("245,158,11") ||
        classes.includes("amber");
      if (isAmber) {
        delta(
          "STOPP", "IC_BRAND_COLOR",
          "Sidebar-Avatar nutzt Amber statt Tenant-Farbe",
          url, `Tenant-Farbe ${config.brandColor}`,
          `${classes.includes("amber") ? "bg-amber-500" : bg}`,
          "identity_contract.md E3, ticketlist D8",
        );
      }
    }

    // Active nav color: check if amber is used for active nav items
    const activeNavItem = sidebar.locator("a.bg-amber-50, a[class*='amber']").first();
    const hasAmberNav = await activeNavItem.isVisible().catch(() => false);
    if (hasAmberNav) {
      delta(
        "SYSTEM", "IC_NAV_COLOR",
        "Navigation-Akzent nutzt Amber statt Tenant-Farbe",
        url, `Tenant-Farbe ${config.brandColor}`,
        "Amber (bg-amber-50, text-amber-700)",
        "ticketlist D8",
      );
    }
  }

  // ── Tab Title ──
  const title = await page.title();
  if (title.toLowerCase().includes("flowsight")) {
    delta(
      "STOPP", "IC_TAB_FLOWSIGHT", '"FlowSight" im Browser-Tab',
      url, `"${config.shortName} ..." im Tab`, `"${title}"`,
      "identity_contract.md R4",
    );
  }
  if (!title.includes(config.shortName)) {
    delta(
      "SYSTEM", "IC_TAB_NAME", "Tab-Titel ohne Tenant-Name",
      url, `"${config.shortName}" im Tab-Titel`, `"${title}"`,
      "identity_contract.md E1",
    );
  }

  // ── "FlowSight" in visible UI elements ──
  const uiSections = await page
    .locator("aside, nav, header, h1, h2, h3, [class*='sidebar']")
    .allTextContents()
    .catch(() => []);
  const uiText = uiSections.join(" ");
  if (uiText.includes("FlowSight")) {
    delta(
      "STOPP", "IC_FLOWSIGHT_OPS", "FlowSight sichtbar im Leitstand",
      url, "Kein FlowSight in UI-Elementen", "Gefunden in Sidebar/Nav/Headers",
      "identity_contract.md R4",
    );
  }

  // ── "Bald" badges (should be removed per L2) ──
  if (bodyText.includes("Bald")) {
    delta(
      "STOPP", "L2_BALD", '"Bald"-Text im Leitstand',
      url, 'Keine "Bald"-Platzhalter', 'Text "Bald" gefunden',
      "ticketlist L2, leitstand.md §10.8",
    );
  }

  // ── Pagination (D1) ──
  const tableRows = await page.locator("table tbody tr").count().catch(() => 0);
  const cardItems = await page.locator("[class*='PulsCard'], [class*='puls-card']").count().catch(() => 0);
  const totalItems = tableRows + cardItems;

  // Check for pagination controls
  const paginationLocators = [
    'button:has-text("Nächste")', 'button:has-text("Weiter")',
    'button:has-text("Vorherige")', '[class*="pagination"]',
    '[aria-label*="page"]', 'button:has-text(">")',
  ];
  let hasPagination = false;
  for (const loc of paginationLocators) {
    if (await page.locator(loc).count().catch(() => 0) > 0) {
      hasPagination = true;
      break;
    }
  }

  if (totalItems > 15 && !hasPagination) {
    delta(
      "SYSTEM", "D1_PAGINATION",
      `Keine Pagination — ${totalItems} Elemente auf einer Seite`,
      url, "Max 15 pro Seite + Pagination",
      `${totalItems} Elemente ohne Pagination`,
      "ticketlist D1",
    );
  }

  // ── Consistent view (D6) — check for mixed cards and table ──
  const hasTable = await page.locator("table").count().catch(() => 0);
  // Cards used as case items (not KPI cards) indicate inconsistency
  // This is a heuristic — PulsView cards inside the cases page
  const pulsCards = await page.locator("[class*='rounded-xl'][class*='border']").count().catch(() => 0);
  if (hasTable > 0 && pulsCards > 4) {
    delta(
      "SYSTEM", "D6_MIXED_VIEWS",
      "Gemischte Ansichten (Cards + Tabelle)",
      url, "Eine konsistente Darstellung",
      `${hasTable} Tabelle(n) + ${pulsCards} Card-Elemente`,
      "ticketlist D6",
    );
  }

  // ── Case ID prefix (D10.1) ──
  const cellTexts = await page
    .locator("td, [class*='case-id'], [class*='caseId'], [class*='caseRef']")
    .allTextContents()
    .catch(() => []);

  const wrongPrefix = cellTexts.filter(
    (t) => /^FS-\d/.test(t.trim()) && config.caseIdPrefix !== "FS",
  );
  if (wrongPrefix.length > 0) {
    delta(
      "SYSTEM", "D10_PREFIX",
      `Case-IDs nutzen "FS-" statt "${config.caseIdPrefix}-"`,
      url, `${config.caseIdPrefix}-XXXX`,
      wrongPrefix[0].trim(),
      "ticketlist D10.1, identity_contract §2.3",
    );
  }

  // ── KPI numbers (D3) — basic sanity check ──
  // Look for KPI-like elements and check if numbers are present
  const kpiTexts = await page
    .locator("[class*='text-2xl'], [class*='text-3xl'], [class*='font-bold'][class*='text-lg']")
    .allTextContents()
    .catch(() => []);
  const kpiNumbers = kpiTexts
    .map((t) => parseInt(t.trim(), 10))
    .filter((n) => !isNaN(n));

  if (kpiNumbers.length >= 2) {
    // "Total" should be >= any other KPI number
    const maxKpi = Math.max(...kpiNumbers);
    const totalLike = kpiNumbers[0]; // First KPI is usually Total
    if (totalLike < maxKpi && totalLike > 0) {
      delta(
        "SYSTEM", "D3_KPI_INCONSISTENT",
        "KPI-Zahlen möglicherweise inkonsistent",
        url,
        "Total ≥ jede Einzel-KPI",
        `Erste KPI (${totalLike}) < Max-KPI (${maxKpi})`,
        "ticketlist D3",
      );
    }
  }
}

// ── Checks: Brand Color Sync ───────────────────────────────────
function checkBrandColorSync(config) {
  // Compare DB brand color vs CustomerSite TypeScript
  if (
    config.brandColorFromCode &&
    config.brandColor !== config.brandColorFromCode
  ) {
    delta(
      "SYSTEM", "IC_COLOR_SYNC",
      "Brand Color: DB und CustomerSite divergieren",
      "Supabase vs TypeScript",
      `Identisch (CustomerSite: ${config.brandColorFromCode})`,
      `DB: ${config.brandColor} vs Code: ${config.brandColorFromCode}`,
      "identity_contract.md E3, E5",
    );
  }
}

// ── Phase B: Vision Analysis (Claude API) ─────────────────
const VISION_CHECKLISTS = {
  website: {
    surface: "Website",
    prompt: `You are a QA auditor for a Swiss plumbing/heating business website.
Analyze this screenshot of the customer-facing website.

Tenant: {displayName} ({slug})
Expected brand color: {brandColor}

Check for these specific quality gaps:
1. **Brand consistency**: Does the page look professionally branded for this specific company? Is the brand color ({brandColor}) visible and used appropriately?
2. **Visual hierarchy**: Is the phone number / emergency CTA prominent and easy to find? Is the service list clearly readable?
3. **Typography**: Are fonts consistent, properly sized, and readable? No broken characters or encoding issues?
4. **Layout quality**: Any overlapping elements, broken grids, excessive whitespace, or cut-off content?
5. **Mobile-readiness visual cues**: Does the desktop layout look like it would break on mobile (very wide elements, tiny text)?
6. **Empty states**: Any visible placeholder text, "Lorem ipsum", or empty sections?
7. **Image quality**: Any missing images (broken icons), low-res images, or incorrect aspect ratios?
8. **Trust signals**: Does the page look trustworthy for a Swiss Handwerker business? (Professional photos, clear contact info, real address)

Do NOT check for:
- "FlowSight" branding issues (handled by DOM checks)
- HTML/DOM structure or accessibility attributes
- Code-level issues

Return a JSON array of findings. Each finding:
{ "severity": "STOPP|SYSTEM|FOUNDER|POLISH", "id": "VIS_WEB_xxx", "title": "short description", "detail": "what you see vs what's expected" }

Severity guide:
- STOPP: Broken layout, missing critical CTA, unreadable text, clearly wrong branding
- SYSTEM: Suboptimal hierarchy, weak brand presence, inconsistent spacing
- FOUNDER: Design taste decisions (color choices, photo selection, layout preference)
- POLISH: Minor spacing, alignment, shadow/border refinements

Return [] if everything looks good. ONLY return the JSON array, nothing else.`,
  },
  wizard: {
    surface: "Wizard",
    prompt: `You are a QA auditor for a Swiss plumbing/heating service request form (Meldungsformular).
Analyze this screenshot of the customer-facing wizard/form.

Tenant: {displayName} ({slug})
Expected brand color: {brandColor}

Check for:
1. **Brand consistency**: Tenant name and color visible? Feels like it belongs to the business?
2. **Form usability**: Are form fields clearly labeled? Is the flow intuitive? Can you tell what to do?
3. **Emergency visibility**: Is the emergency/Notfall option clearly visible and prominent?
4. **Visual quality**: Clean layout, no broken elements, proper spacing?
5. **Typography**: Consistent, readable fonts? German text properly rendered (ä, ö, ü, ß)?
6. **Trust**: Does this form look professional enough that a Swiss homeowner would fill it out?
7. **Empty states / placeholders**: Any "Lorem ipsum", TODO, or placeholder text visible?

Do NOT check for "FlowSight" branding (handled by DOM checks).

Return a JSON array of findings:
{ "severity": "STOPP|SYSTEM|FOUNDER|POLISH", "id": "VIS_WIZ_xxx", "title": "short description", "detail": "what you see vs what's expected" }

Return [] if everything looks good. ONLY return the JSON array, nothing else.`,
  },
  leitstand: {
    surface: "Leitstand",
    prompt: `You are a QA auditor for a Swiss plumbing/heating business operations dashboard ("Leitstand").
Analyze this screenshot of the internal operations dashboard.

Tenant: {displayName} ({slug})
Expected brand color: {brandColor}

This dashboard is used by the business owner/office staff to manage incoming service cases.
The Zielbild (target state) is a clean, professional sidebar-layout dashboard with:
- Left sidebar: tenant logo/initials in brand color, navigation items (Fälle, Einsatzplan, Mitarbeiter, Kennzahlen, Einstellungen)
- Main area: case list or pulse view with priority grouping
- KPI summary at top

Check for:
1. **Brand integration**: Is the sidebar branded with tenant color ({brandColor})? Are initials/logo correct?
2. **Information hierarchy**: Can you quickly see the most important information (new cases, emergencies)?
3. **Table/list quality**: Is the case list readable? Proper column alignment? No data overflow?
4. **Empty state handling**: If few/no cases, is there a helpful empty state (not just blank)?
5. **Navigation clarity**: Is it clear which section you're in? Active state visible?
6. **Visual polish**: Consistent spacing, borders, shadows? Professional appearance?
7. **Data presentation**: Are numbers, dates, status badges formatted properly?
8. **Responsiveness cues**: Does the layout use space efficiently? No excessive whitespace?

Do NOT check for:
- "FlowSight" / "Bald" text issues (handled by DOM checks)
- Tab title issues (handled by DOM checks)
- Authentication/routing issues

Return a JSON array of findings:
{ "severity": "STOPP|SYSTEM|FOUNDER|POLISH", "id": "VIS_OPS_xxx", "title": "short description", "detail": "what you see vs what's expected" }

Return [] if everything looks good. ONLY return the JSON array, nothing else.`,
  },
};

async function analyzeScreenshot(screenshotPath, surface, config) {
  if (!VISION_ENABLED) return;
  if (!fs.existsSync(screenshotPath)) return;

  const checklist = VISION_CHECKLISTS[surface];
  if (!checklist) return;

  const imageData = fs.readFileSync(screenshotPath);
  const base64 = imageData.toString("base64");
  const mediaType = "image/png";

  // Fill in tenant details
  const prompt = checklist.prompt
    .replace(/{displayName}/g, config.displayName)
    .replace(/{slug}/g, config.slug)
    .replace(/{brandColor}/g, config.brandColor);

  console.log(`  Vision: analyzing ${checklist.surface}...`);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`  Vision: API error ${res.status} — ${err.slice(0, 120)}`);
      return;
    }

    const body = await res.json();
    const text = body.content?.[0]?.text ?? "";

    // Extract JSON array from response (may be wrapped in ```json ... ```)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      if (text.includes("[]")) return; // No findings
      console.log(`  Vision: could not parse response for ${surface}`);
      return;
    }

    const findings = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(findings) || findings.length === 0) return;

    console.log(`  Vision: ${findings.length} finding(s) for ${checklist.surface}`);

    for (const f of findings) {
      const severity = ["STOPP", "SYSTEM", "FOUNDER", "POLISH"].includes(f.severity)
        ? f.severity
        : "POLISH";
      delta(
        severity,
        f.id || `VIS_${surface.toUpperCase()}_UNKNOWN`,
        f.title || "Vision finding",
        `${checklist.surface} (Vision)`,
        f.detail || "",
        "Visuell erkannt",
        "Phase B Vision Analysis",
      );
    }
  } catch (err) {
    console.log(`  Vision: error for ${surface} — ${err.message}`);
  }
}

async function runVisionAnalysis(config) {
  if (!VISION_ENABLED) {
    if (!ANTHROPIC_API_KEY && !SKIP_VISION) {
      console.log("\n  Phase B (Vision): Skipped — no ANTHROPIC_API_KEY set");
    } else if (!TAKE_SCREENSHOTS) {
      console.log("\n  Phase B (Vision): Skipped — --screenshots not set");
    } else if (SKIP_VISION) {
      console.log("\n  Phase B (Vision): Skipped — --no-vision flag");
    }
    return;
  }

  console.log("\n  Phase B (Vision): Analyzing screenshots...");
  const dir = "tmp/qa/screenshots";

  // Analyze each surface screenshot if it exists
  const surfaces = [
    { key: "website", file: `${dir}/website_${config.slug}.png` },
    { key: "wizard", file: `${dir}/wizard_${config.slug}.png` },
    { key: "leitstand", file: `${dir}/leitstand_${config.slug}.png` },
  ];

  for (const { key, file } of surfaces) {
    await analyzeScreenshot(file, key, config);
  }
}

// ── Report Generator ───────────────────────────────────────────
function generateReport(config, startTime) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const counts = { STOPP: 0, SYSTEM: 0, FOUNDER: 0, POLISH: 0 };
  deltas.forEach((d) => counts[d.severity]++);
  const total = deltas.length;

  const visionLabel = VISION_ENABLED ? "A+B (DOM + Vision)" : "A (DOM only)";
  let md = "# QA Sweep — Delta Report\n\n";
  md += "| | |\n|---|---|\n";
  md += `| **Tenant** | ${config.displayName} (\`${config.slug}\`) |\n`;
  md += `| **Target** | ${TARGET} |\n`;
  md += `| **Date** | ${new Date().toISOString().slice(0, 19)}Z |\n`;
  md += `| **Duration** | ${duration}s |\n`;
  md += `| **Phase** | ${visionLabel} |\n`;
  md += `| **Deltas** | ${total} |\n\n`;

  md += "## Summary\n\n";
  md += "| Category | Count |\n|----------|-------|\n";
  const icons = { STOPP: "RED", SYSTEM: "YLW", FOUNDER: "BLU", POLISH: "GRY" };
  for (const [cat, count] of Object.entries(counts)) {
    md += `| **[${icons[cat]}] ${cat}** | ${count} |\n`;
  }
  md += "\n";

  if (total === 0) {
    md += "## Keine Deltas — alle Checks bestanden\n";
    return md;
  }

  const labels = {
    STOPP: "STOPP — Blockiert E2E/Proof",
    SYSTEM: "SYSTEM — Funktional, nicht Gold",
    FOUNDER: "FOUNDER — Braucht Entscheidung",
    POLISH: "POLISH — Kosmetisch",
  };

  for (const severity of ["STOPP", "SYSTEM", "FOUNDER", "POLISH"]) {
    const items = deltas.filter((d) => d.severity === severity);
    if (items.length === 0) continue;

    md += `---\n\n## ${labels[severity]}\n\n`;

    for (const d of items) {
      md += `### [${d.severity}] ${d.id}: ${d.title}\n\n`;
      md += "| | |\n|---|---|\n";
      md += `| **Surface** | ${d.surface} |\n`;
      md += `| **Expected** | ${d.expected} |\n`;
      md += `| **Found** | ${d.found} |\n`;
      md += `| **Ref** | ${d.ref} |\n\n`;
    }
  }

  return md;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  console.log(`QA Sweep — ${TENANT_SLUG} @ ${TARGET} [Phase ${VISION_ENABLED ? "A+B" : "A"}]`);

  const config = await loadTenantConfig();
  console.log(
    `  Tenant: ${config.displayName} | Prefix: ${config.caseIdPrefix} | Brand: ${config.brandColor}`,
  );

  // Non-browser checks first
  checkBrandColorSync(config);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "de-CH",
  });
  const page = await context.newPage();

  try {
    // Public surfaces
    await checkWebsite(page, config);
    await checkWizard(page, config);

    // Auth-required surfaces
    console.log("\n  Authenticating for Leitstand...");
    const authed = await authenticatePlaywright(context, page);
    if (authed) {
      await checkLeitstand(page, config);
    } else {
      delta(
        "FOUNDER", "AUTH_FAILED",
        "Leitstand-Checks uebersprungen (Auth fehlgeschlagen)",
        `${TARGET}/ops/cases`,
        "Erfolgreiche Admin-Anmeldung",
        "Magic Link Auth fehlgeschlagen",
        "Pruefen: Admin-User existiert, Supabase Auth aktiv",
      );
    }
  } finally {
    await browser.close();
  }

  // Phase B: Vision analysis (after browser close — uses saved screenshots)
  await runVisionAnalysis(config);

  // Generate and write report
  const report = generateReport(config, startTime);

  fs.mkdirSync("tmp/qa", { recursive: true });
  const slug = config.slug;
  const date = new Date().toISOString().slice(0, 10);
  const outFile = `tmp/qa/delta_report_${slug}_${date}.md`;
  fs.writeFileSync(outFile, report);

  // Console output
  console.log("\n" + "=".repeat(60));
  console.log(report);
  console.log(`Report: ${outFile}`);

  // Summary line (for morning_report integration)
  const c = { STOPP: 0, SYSTEM: 0, FOUNDER: 0, POLISH: 0 };
  deltas.forEach((d) => c[d.severity]++);
  const summary = `QA_SWEEP: ${slug} | STOPP=${c.STOPP} SYSTEM=${c.SYSTEM} FOUNDER=${c.FOUNDER} POLISH=${c.POLISH}`;
  console.log(summary);

  process.exit(c.STOPP > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("QA Sweep failed:", err.message ?? err);
  process.exit(2);
});
