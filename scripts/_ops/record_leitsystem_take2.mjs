#!/usr/bin/env node
/**
 * record_leitsystem_take2.mjs — High-end Leitsystem recording for Take 2.
 * Addresses ALL feedback points FB10-FB18.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_leitsystem_take2.mjs --slug doerfler-ag
 */

import { readFile, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";
const baseUrl = args.find((a) => a.startsWith("--base-url"))?.split("=")[1] || "http://localhost:3000";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;

async function main() {
  console.log(`\n=== Leitsystem Recording: ${t.name} (${slug}) ===\n`);

  // ── Auth: OTP für admin@flowsight.ch, NICHT prospect.email ──
  // Prospect-User bekommt im CaseDetailForm eine simplified "PROSPECT VIEW"
  // (nur Status/Beschreibung, keine Kontakt/Verlauf/Anhänge-Sektionen).
  // Für ein 10/10 Video braucht das Leitsystem die FULL CASE SURFACE → admin login.
  // Das Seed (seed_screenflow_from_config.mjs) legt bereits einen Staff-Eintrag
  // für admin@flowsight.ch mit display_name = tenant short name an, damit das
  // Greeting "Guten Tag, Dörfler" statt "Admin" zeigt.
  const email = "admin@flowsight.ch";
  await sb.from("otp_codes").delete().eq("email", email);
  await sb.from("otp_codes").insert({
    email, code: "recording1",
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    used: false,
  });

  const authResp = await fetch(`${baseUrl}/api/ops/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code: "recording1" }),
  });

  if (authResp.status !== 200) {
    console.error("Auth failed:", authResp.status);
    process.exit(1);
  }

  const setCookies = authResp.headers.getSetCookie() || [];
  console.log("Auth OK, cookies:", setCookies.length);

  // ── Setup Playwright ──
  // Pipeline-Ordnerstruktur (siehe produce_screenflow.mjs):
  //   docs/gtm/pipeline/06_video_production/screenflows/<slug>/
  const outBase = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
  const outDir = join(outBase, "_tmp_leit");
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: outDir, size: { width: 412, height: 915 } },
  });

  // Set auth cookies
  const cookieDomain = new URL(baseUrl).hostname;
  for (const raw of setCookies) {
    const eqIdx = raw.indexOf("=");
    const scIdx = raw.indexOf(";");
    const name = raw.slice(0, eqIdx);
    const value = raw.slice(eqIdx + 1, scIdx > 0 ? scIdx : undefined);
    await context.addCookies([{ name, value, domain: cookieDomain, path: "/", sameSite: "Lax" }]);
  }

  // Tenant-Impersonation: admin@flowsight.ch hat JWT = FlowSight-System-Tenant.
  // Für Recording müssen wir fs_active_tenant Cookie direkt setzen, damit die
  // Leitzentrale nur Dörfler-Cases zeigt (nicht alle Tenants mit FS-Prefix).
  const { data: targetTenant } = await sb.from("tenants").select("id").eq("slug", slug).single();
  if (targetTenant) {
    await context.addCookies([{
      name: "fs_active_tenant",
      value: targetTenant.id,
      domain: cookieDomain,
      path: "/",
      sameSite: "Lax",
    }]);
    console.log(`  fs_active_tenant Cookie gesetzt: ${targetTenant.id}`);
  }

  const page = await context.newPage();

  // ── FB12: Suppress push notification popup ──
  // Uses the EXACT localStorage key from PushOnboardingBanner.tsx: "ops-push-onboarding-dismissed"
  // (Previous version used wrong key "push-banner-dismissed" → banner stayed visible for ~10s)
  await context.addInitScript(() => {
    try {
      localStorage.setItem("ops-push-onboarding-dismissed", Date.now().toString());
    } catch {}
  });

  // ── FB13/FB25/FB74: Aggressive Next.js dev-badge suppression ──
  // Mobile-Viewport braucht zusätzliche Maßnahmen — Dev-Badge erschien trotz
  // next.config devIndicators:false noch. Kombination aus CSS + MutationObserver
  // + Interval-Guard killt sie nachhaltig.
  await page.addInitScript(() => {
    const css = `
      nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast], [data-nextjs-toast-wrapper],
      [class*="nextjs"], [id*="nextjs"], [class*="__next-build"], [class*="__next"],
      button[data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues],
      [aria-label*="issue" i], [aria-label*="Dev Tools" i],
      /* FB76: Sentry-Error-Toasts + jede Fixed-Position-Error-Pille */
      button[data-sentry], [data-error-toast], .sentry-feedback,
      [class*="sentry"], [data-testid*="sentry"],
      div[style*="position: fixed"][style*="z-index: 9"],
      div[style*="position:fixed"][style*="z-index:9"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      /* FB62: Tenant-Switcher ist Founder-only. */
      [data-owner-only="tenant-switcher"] { display: none !important; }
    `;
    const injectStyle = () => {
      if (document.getElementById("fb74-style")) return;
      const style = document.createElement("style");
      style.id = "fb74-style";
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    };
    injectStyle();
    setInterval(injectStyle, 200);
    const killBadges = () => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], [data-issues-collapsed], [aria-label*="issue" i]').forEach((el) => el.remove());
      document.querySelectorAll("body > div, body > button").forEach((el) => {
        const s = getComputedStyle(el);
        const bottom = parseInt(s.bottom);
        const left = parseInt(s.left);
        if (s.position === "fixed" && bottom < 50 && (left < 50 || left > 300) &&
            (el.textContent || "").match(/issue/i)) {
          el.remove();
        }
      });
    };
    killBadges();
    setInterval(killBadges, 150);
    // Also intercept the error overlay creation
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.tagName === "NEXTJS-PORTAL" || node.getAttribute?.("data-nextjs-dialog") !== null) {
            node.remove();
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });

  // ── FB32: Reveal-Overlay + FB59: persistente Samsung Status-Bar ──
  const brandColor = t.brand_color || "#003478";

  // FB59: SMS-Zeit aus _seed_time berechnen (Call-End + 1min)
  const seedTimeIso = config._seed_time;
  const anrufDauerSec = 191;
  let smsTime = "17:56"; // fallback
  if (seedTimeIso) {
    const d = new Date(new Date(seedTimeIso).getTime() + (anrufDauerSec + 60) * 1000);
    smsTime = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  console.log(`  Samsung-Status-Bar Uhrzeit: ${smsTime} (aus _seed_time + call_duration + 1min)`);

  await context.addInitScript(`
    // Body-BG in Brand-Color (eliminiert weisser Flash beim Laden).
    document.documentElement.style.background = '${brandColor}';
    const styleTag = document.createElement('style');
    styleTag.textContent = [
      'html,body{background:${brandColor} !important;}',
      // FB59: Body padding-top für persistent Samsung Status-Bar (36px)
      'body{padding-top:36px !important;}',
    ].join('');
    document.documentElement.appendChild(styleTag);

    // FB59: Persistente Samsung Status-Bar über Leitsystem.
    // Zeigt Uhrzeit (Video-SMS-Zeit) + Mute + WiFi + Signal + Battery-Pill grün.
    // Fixed top, z-index 99999. Injection auf DOMContentLoaded + Re-Check (App
    // mount könnte sie überschreiben).
    // FB59: JS-Injection für Status-Bar war unreliable im Playwright-Recording.
    // Status-Bar wird stattdessen via FFmpeg-Overlay direkt auf das finale Video
    // gelegt (render_status_bar.mjs → status_bar.png → ffmpeg vstack).
    // Body bekommt nur padding-top:36px damit App-Content nicht unter die Overlay-Bar
    // gedrückt wird — aber wir scalen die App tatsächlich auf 878px im ffmpeg splice.

    // Reveal-Overlay: Brand-Color fullscreen, fadet nach 800ms aus.
    const overlay = document.createElement('div');
    overlay.id = 'app-reveal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:${brandColor};opacity:1;transform:scale(1);transition:opacity 400ms ease-out, transform 500ms ease-out;pointer-events:none;';
    document.documentElement.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(0.97)';
      setTimeout(() => overlay.remove(), 500);
    }, 800);

    // Portals remove alle 100ms
    function killPortals() {
      document.querySelectorAll('nextjs-portal, next-route-announcer, [class*="nextjs-toast"]').forEach(el => { try { el.remove(); } catch (e) {} });
    }
    killPortals();
    setInterval(killPortals, 100);
  `);
  console.log(`  Brand-Color body init + reveal overlay: ${brandColor}`);
  console.log("Recording...");
  await page.goto("about:blank");
  await page.waitForTimeout(350);

  // Tenant-Scope wurde bereits oben per context.addCookies gesetzt.
  // Jetzt zur App navigieren — der Cookie greift ab der ersten Request.
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded", timeout: 20000 });

  // FB62: Tenant-Switcher persistent ausblenden (Founder-only Element).
  // FB68: Dev-Badge-Kill auch hier.
  async function ensureSwitcherHidden() {
    await page.addStyleTag({
      content: `
        [data-owner-only="tenant-switcher"] { display: none !important; }
        nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast], [data-nextjs-toast-wrapper],
        button[data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues],
        [aria-label*="issue" i], [aria-label*="Dev Tools" i] {
          display: none !important; visibility: hidden !important; opacity: 0 !important;
        }
      `,
    }).catch(() => {});
    await page.evaluate(() => {
      document.querySelectorAll('[data-owner-only="tenant-switcher"]').forEach((el) => {
        el.style.display = "none";
      });
      const kill = () => {
        document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], [data-issues-collapsed]').forEach((el) => el.remove());
        document.querySelectorAll("body > div, body > button").forEach((el) => {
          const s = getComputedStyle(el);
          if (s.position === "fixed" && parseInt(s.bottom) < 50 && parseInt(s.left) < 50 &&
              (el.textContent || "").match(/issue/i)) {
            el.remove();
          }
        });
      };
      kill();
      if (!window.__fb68_killer) window.__fb68_killer = setInterval(kill, 150);
    }).catch(() => {});
  }
  await ensureSwitcherHidden();

  // FB10: Wait until page is FULLY loaded (no skeleton, no spinner)
  await page.waitForTimeout(7000);
  await ensureSwitcherHidden();

  // FB11: Greeting kommt jetzt sauber aus der DB (seed_screenflow_from_config.mjs
  // upsertet Staff-Eintrag mit display_name = tenant_short_name für prospect email
  // UND admin@flowsight.ch). Kein client-side Hack mehr nötig.

  // FB12: Dismiss push banner if still visible
  try {
    const laterBtn = page.locator('button:has-text("Später")');
    if (await laterBtn.count() > 0) {
      await laterBtn.first().click();
      await page.waitForTimeout(500);
    }
  } catch {}

  console.log("  B5: Übersicht geladen");
  await page.waitForTimeout(3000);

  // ── B6.1-B6.3: Slow scroll down then up ──
  // FB13: LANGSAMER scrollen
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
  await page.waitForTimeout(2500);
  console.log("  B6.2: Gescrollt nach unten");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(2500);
  console.log("  B6.3: Zurück nach oben");

  // ── B7-B10: KPI Klicks ──
  // FB14: Fix Selektoren — KPI Cards sind klickbare Divs
  async function clickKPI(label) {
    try {
      // FlowBar KPI cards are <button> elements containing a <span> with the label text.
      // The label is in a span with "uppercase tracking-wider" classes.
      // On mobile (412px): it's a 2x2 grid (md:hidden).
      const clicked = await page.evaluate((text) => {
        // Find ALL buttons that look like KPI cards (have rounded-xl class)
        const buttons = [...document.querySelectorAll("button")].filter(
          (b) => b.className.includes("rounded-xl") && b.className.includes("border-t-")
        );
        for (const btn of buttons) {
          // Check if this button contains the label text
          const spans = btn.querySelectorAll("span");
          for (const span of spans) {
            const spanText = span.textContent.trim().toUpperCase();
            if (spanText === text.toUpperCase() || spanText.includes(text.toUpperCase())) {
              btn.click();
              return true;
            }
          }
        }
        // Special case: BEWERTUNG button has a different structure (star ratings)
        if (text === "BEWERTUNG") {
          const starBtns = [...document.querySelectorAll("button")].filter(
            (b) => b.className.includes("rounded-xl") && b.className.includes("border-t-amber")
          );
          if (starBtns.length > 0) { starBtns[0].click(); return true; }
        }
        return false;
      }, label);

      if (clicked) {
        await page.waitForTimeout(2000);
        console.log(`  KPI "${label}" geklickt ✓`);
        return true;
      }
    } catch (e) {
      console.log(`  KPI "${label}" error: ${e.message.slice(0, 60)}`);
    }
    console.log(`  KPI "${label}" nicht gefunden`);
    return false;
  }

  // B7: Neu
  await clickKPI("NEU");
  // B8: Bei uns
  await clickKPI("BEI UNS");
  // B9: Erledigt
  await clickKPI("ERLEDIGT");
  // B10: Bewertung
  await clickKPI("BEWERTUNG");

  // B11: Filter zurücksetzen
  try {
    const resetBtn = page.locator('text=Filter zurücksetzen').first();
    if (await resetBtn.count() > 0) {
      await resetBtn.click();
      await page.waitForTimeout(1500);
      console.log("  Filter zurückgesetzt ✓");
    }
  } catch {}

  // ── B12: Scroll to Phone-Case (eindeutig via reporter_name) + click ──
  // FB33: Phone-Case hat reporter_name "Gunnar Wende" aus notruf.txt-Script —
  // das ist EINDEUTIG (im Gegensatz zu "Rohrbruch" das auch der Notfall-Case
  // sein könnte je nach Branche). Wir suchen nach dem Reporter-Namen aus config.
  const phoneReporter = config.seed?.phone_demo_case?.reporter_name || "Wende";
  const phoneCat = config.seed?.phone_demo_case?.kategorie || "Rohrbruch";

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 100, behavior: "smooth" }));
  await page.waitForTimeout(1500);

  // Click auf Phone-Case. Case-Rows nutzen onClick + router.push (kein <a href>).
  // Strategie: (1) text-locator click mit force, (2) direct URL lookup via Supabase.
  let caseClicked = false;
  try {
    const phoneLocator = page.locator(`text=${phoneReporter}`).first();
    if (await phoneLocator.count() > 0) {
      // force: true umgeht Visibility/Stability-Checks
      await phoneLocator.scrollIntoViewIfNeeded({ timeout: 2000 });
      await page.waitForTimeout(500);
      await phoneLocator.click({ force: true, timeout: 3000 });
      // URL-Change abwarten
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      if (currentUrl.includes("/ops/cases/") && !currentUrl.endsWith("/ops/cases")) {
        caseClicked = true;
        console.log(`  Case via text-click geöffnet: ${currentUrl.split("/").pop()}`);
      }
    }
  } catch (e) {
    console.log(`  Text-click fehlgeschlagen: ${e.message.slice(0, 60)}`);
  }

  // Fallback: Direkte URL-Navigation via Supabase-Lookup (Phone-Case = jüngster voice-source dringend)
  if (!caseClicked) {
    try {
      const { data: phoneCase } = await sb
        .from("cases")
        .select("id, seq_number")
        .eq("tenant_id", (await sb.from("tenants").select("id").eq("slug", slug).single()).data.id)
        .eq("source", "voice")
        .eq("urgency", "dringend")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (phoneCase) {
        console.log(`  Direct navigation to case ${phoneCase.seq_number}...`);
        await page.goto(`${baseUrl}/ops/cases/${phoneCase.id}`, { waitUntil: "domcontentloaded", timeout: 10000 });
        await page.waitForTimeout(1000);
        caseClicked = true;
      }
    } catch (e) {
      console.log(`  Direct navigation fehlgeschlagen: ${e.message.slice(0, 60)}`);
    }
  }

  if (caseClicked) {
    // FB26: Warten bis Case-Detail WIRKLICH geladen ist
    await page.waitForTimeout(5000);
    await page.waitForSelector(`text=${phoneCat}`, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    console.log(`  B13: Phone-Case "${phoneCat} / ${phoneReporter}" geöffnet ✓`);

    // FB42: Komplette Scroll-Choreo durch ALLE Sektionen.
    const pageInfo = await page.evaluate(() => {
      const root = document.scrollingElement || document.documentElement;
      const h3s = [...document.querySelectorAll("h3")].map((el) => el.textContent.trim());
      return {
        docHeight: root.scrollHeight,
        bodyHeight: document.body.scrollHeight,
        sections: h3s,
        hasKontakt: document.body.textContent.includes("Kontakt"),
        hasVerlauf: document.body.textContent.includes("Verlauf"),
        hasAnhaenge: document.body.textContent.includes("Anhänge"),
      };
    });
    console.log(`  Case-Detail: docHeight=${pageInfo.docHeight}, bodyHeight=${pageInfo.bodyHeight}`);
    console.log(`  Sektionen (h3): ${pageInfo.sections.join(" | ")}`);
    console.log(`  Kontakt: ${pageInfo.hasKontakt}, Verlauf: ${pageInfo.hasVerlauf}, Anhänge: ${pageInfo.hasAnhaenge}`);

    // B14: Top = Übersicht (Status/Priorität/Zuständig/Termin)
    await page.waitForTimeout(2500);
    console.log("  B14: Übersicht");

    // B15: Scroll zu ~600px — Beschreibung + Kontakt sichtbar
    await page.evaluate(() => {
      const root = document.scrollingElement || document.documentElement;
      root.scrollTo({ top: 600, behavior: "smooth" });
    });
    await page.waitForTimeout(2500);
    console.log("  B15: Beschreibung + Kontakt");

    // B15b: Scroll zu ~1200px — Verlauf
    await page.evaluate(() => {
      const root = document.scrollingElement || document.documentElement;
      root.scrollTo({ top: 1200, behavior: "smooth" });
    });
    await page.waitForTimeout(2500);
    console.log("  B15b: Verlauf");

    // B15c: Scroll ganz nach unten
    await page.evaluate(() => {
      const root = document.scrollingElement || document.documentElement;
      root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
    });
    await page.waitForTimeout(2500);
    console.log("  B15c: Interne Notizen + Anhänge");

    // B16: Zurück ganz nach oben (smooth)
    await page.evaluate(() => {
      const root = document.scrollingElement || document.documentElement;
      root.scrollTo({ top: 0, behavior: "smooth" });
    });
    await page.waitForTimeout(2500);
    console.log("  B16: Zurück zur Übersicht");

    // B17: Back to overview (list)
    try {
      await page.locator('text=Zurück').first().click();
      await page.waitForTimeout(3000);
      console.log("  B17: Zurück zur Fall-Liste ✓");
    } catch {
      await page.goBack();
      await page.waitForTimeout(3000);
      console.log("  B17: Zurück (goBack) ✓");
    }
  } else {
    console.log(`  ⚠️ Phone-Case mit reporter "${phoneReporter}" nicht in Case-Liste gefunden`);
  }

  // Final pause
  await page.waitForTimeout(2000);

  // ── Stop recording ──
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Move to final location
  const finalPath = join(outBase, "take2_leitsystem.webm");
  await copyFile(videoPath, finalPath);
  await rm(outDir, { recursive: true, force: true });

  const size = statSync(finalPath).size;
  console.log(`\n✅ Saved: ${finalPath} (${Math.round(size / 1024)} KB)`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
