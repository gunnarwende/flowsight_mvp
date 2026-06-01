#!/usr/bin/env node
/**
 * record_leitsystem_take2.mjs — High-end Leitsystem recording for Take 2.
 * Addresses ALL feedback points FB10-FB18.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/record_leitsystem_take2.mjs --slug doerfler-ag
 */

import { readFile, writeFile, mkdir, copyFile, rm } from "node:fs/promises";
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
  // Parallel-safe OTP (01.06.): eindeutiger Code pro Slug + Delete NUR auf den
  // eigenen Code (sonst killen sich parallele Tenant-Runs gegenseitig → 500).
  const otpCode = `leit2_${slug}`;
  // Root-Fix Parallel-Auth (01.06.): verify-code macht generateLink+verifyOtp für
  // DENSELBEN GoTrue-User → gleichzeitige Lanes kollidieren (eine 500). Retry-with-
  // backoff+jitter de-synct die Lanes → robust für N parallele Betriebe.
  async function getAdminCookies() {
    const MAX = 8;
    for (let attempt = 1; attempt <= MAX; attempt++) {
      await sb.from("otp_codes").delete().eq("email", email).eq("code", otpCode);
      await sb.from("otp_codes").insert({
        email, code: otpCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used: false,
      });
      const resp = await fetch(`${baseUrl}/api/ops/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      if (resp.status === 200) return resp.headers.getSetCookie() || [];
      if (attempt === MAX) { console.error(`Auth failed after ${MAX} attempts (status ${resp.status})`); process.exit(1); }
      const backoff = 400 * attempt + Math.floor(Math.random() * 600);
      console.warn(`  ⚠ auth contention (status ${resp.status}), retry ${attempt}/${MAX} in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  const setCookies = await getAdminCookies();
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
    // FB74c (28.05): Minimal proven kill, runs FIRST so a downstream throw in
    // the complex kill below can't break suppression. The probe at
    // scripts/_probe_indicator2.mjs confirmed Next.js 16 wraps the indicator in
    //   <nextjs-portal>#shadow > #devtools-indicator.nextjs-toast[data-nextjs-toast]
    // Removing the portal host removes the shadow content along with it.
    const minimalKill = () => {
      try {
        document
          .querySelectorAll('nextjs-portal, [data-nextjs-toast], #devtools-indicator')
          .forEach((el) => el.remove());
      } catch (e) {}
    };
    minimalKill();
    setInterval(minimalKill, 50);
    new MutationObserver(minimalKill).observe(document.documentElement, { childList: true, subtree: true });

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
    // FB51 nuclear: kill Next.js dev indicators across shadow DOM
    const killShadow = (root) => {
      if (!root) return;
      try {
        root.querySelectorAll && root.querySelectorAll('*').forEach((el) => {
          try {
            const cl = (el.className && typeof el.className === "string") ? el.className : "";
            const id = el.id || "";
            const txt = (el.textContent || "").slice(0, 100);
            if (cl.match(/issue|nextjs|dev-tools|toast/i) ||
                id.match(/issue|nextjs/i) ||
                txt.match(/^\s*\d+\s+Issues?\s*$/i)) {
              el.remove();
            }
            if (el.shadowRoot) killShadow(el.shadowRoot);
          } catch (e) {}
        });
      } catch (e) {}
    };
    const killBadges = () => {
      // FB74b (28.05): Next.js 16 introduced new tag names + the previous
      // text-regex required ≤4 children. The "2 Issues" badge has more
      // children (icon + label + close + spacer) → the V73 splice still
      // showed it. Drop the children-count gate, add tag names and a
      // bottom-left red-background catch-all.
      document.querySelectorAll([
        'nextjs-portal', 'nextjs-dev-tools', 'nextjs-dev-overlay',
        'nextjs-static-indicator', 'nextjs-build-watcher',
        '[data-nextjs-toast]', '[data-nextjs-dev-tools-button]',
        '[data-nextjs-dev-tools]', '[data-issues-collapsed]', '[data-issues]',
        '[aria-label*="issue" i]', '[aria-label*="Dev Tools" i]',
        '[class*="nextjs-toast"]', '[class*="nextjs-static-indicator"]',
        '[class*="dev-tools"]', '[class*="dev-indicator"]'
      ].join(',')).forEach((el) => el.remove());
      // Walk every shadow root we can reach.
      document.querySelectorAll('*').forEach((host) => {
        if (host.shadowRoot) { try { killShadow(host.shadowRoot); } catch (e) {} }
      });
      killShadow(document.body);
      // "N Issues" text match — drop children-count constraint, allow nested.
      document.querySelectorAll('*').forEach((el) => {
        try {
          const txt = (el.textContent || "").trim();
          if (/\d+\s*Issues?/i.test(txt) && txt.length < 80) {
            const s = getComputedStyle(el);
            if (s.position === "fixed" || el.closest('[style*="fixed"]')) {
              (el.closest('[style*="fixed"]') || el).remove();
            }
          }
        } catch (e) {}
      });
      // Catch-all: any FIXED bottom-left element with reddish background.
      document.querySelectorAll('*').forEach((el) => {
        try {
          const s = getComputedStyle(el);
          if (s.position !== "fixed") return;
          const bottom = parseInt(s.bottom);
          const left = parseInt(s.left);
          if (!(bottom >= 0 && bottom < 100 && left >= 0 && left < 100)) return;
          const m = (s.backgroundColor || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) return;
          const r = +m[1], g = +m[2], b = +m[3];
          if (r > 150 && g < 100 && b < 100) el.remove();
        } catch (e) {}
      });
    };
    killBadges();
    setInterval(killBadges, 100);
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

  // FB1: Recording-Start-Zeitstempel (für Status-Bar-Switch beim Fall-Detail-Öffnen).
  const recordingStartMs = Date.now();

  // Event-Log: emits recording_t for every choreography landmark. Used by
  // _gen_t2_override.mjs to auto-generate phase source ranges (eliminates the
  // "guess source-time from frame-sampling" loop). recording_t = seconds since
  // playwright recording started (page.goto about:blank).
  const events = [];
  const logEvent = (name) => {
    const t = (Date.now() - recordingStartMs) / 1000;
    events.push({ name, recording_t: Number(t.toFixed(3)) });
    console.log(`  [event] ${name} @ recording_t=${t.toFixed(3)}s`);
  };

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

  // Founder-spec 28.05: fast-start-then-decel scroll down (1s) + bottom hold (3s) + rapid up (0.3s).
  //  Schedule (V62-output time):
  //    leit_dashboard_initial   4:17,8-4:30,5 (12.7s)
  //    leit_list_scroll_down    4:30,5-4:31,5 (1.0s, ease-out)
  //    leit_list_bottom         4:31,5-4:34,5 (3.0s HOLD)
  //    leit_list_scroll_up      4:34,5-4:34,8 (0.3s rapid)
  //    leit_kpi_neu             4:37,2-... (gap of 2.4s at top before click)
  logEvent("top_dwell_start");
  await page.waitForTimeout(12700);
  logEvent("top_dwell_end");
  console.log("  Phase A: Initial top dwell (12.7s)");

  // Linear scroll (no easing).
  const scrollTo = async (top, durationMs) => {
    const currentTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
    const delta = top - currentTop;
    if (Math.abs(delta) < 5) return;
    const steps = Math.max(10, Math.floor(durationMs / 50));
    const stepDelta = delta / steps;
    const stepMs = durationMs / steps;
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, stepDelta);
      await page.waitForTimeout(stepMs);
    }
  };

  // Ease-out scroll (fast start → slow end) for realistic "schwung" motion.
  const scrollToEaseOut = async (top, durationMs) => {
    const currentTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
    const delta = top - currentTop;
    if (Math.abs(delta) < 5) return;
    const steps = Math.max(20, Math.floor(durationMs / 25));
    // ease-out cubic: f(t) = 1 - (1-t)^3
    const stepMs = durationMs / steps;
    let lastProgress = 0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      const stepDelta = (eased - lastProgress) * delta;
      lastProgress = eased;
      await page.mouse.wheel(0, stepDelta);
      await page.waitForTimeout(stepMs);
    }
  };

  // Phase B: scroll-down 1s ease-out (fast→slow, bottom reached at 4:31.5)
  logEvent("scroll_down_start");
  await scrollToEaseOut(800, 1000);
  logEvent("scroll_down_end");
  console.log("  Phase B: Scroll-down ease-out (1.0s)");

  // Phase C: bottom HOLD 3s
  await page.waitForTimeout(3000);
  logEvent("bottom_hold_end");
  console.log("  Phase C: Bottom hold (3.0s)");

  // Phase D: scroll UP 0.5s ease-out (fast→slow)
  logEvent("scroll_up_start");
  await scrollToEaseOut(0, 500);
  logEvent("scroll_up_end");
  console.log("  Phase D: Scroll up ease-out (0.5s)");

  // Gap: 2.4s at top before NEU click (canonical schedule expects NEU at 4:37,2)
  await page.waitForTimeout(2400);
  logEvent("pre_neu_hold_end");

  // ── B7-B10: KPI Klicks ──
  // FB14: Fix Selektoren — KPI Cards sind klickbare Divs
  async function clickKPI(label, dwellMs = 2000) {
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
        await page.waitForTimeout(dwellMs);
        console.log(`  KPI "${label}" geklickt ✓ (dwell ${dwellMs}ms)`);
        return true;
      }
    } catch (e) {
      console.log(`  KPI "${label}" error: ${e.message.slice(0, 60)}`);
    }
    console.log(`  KPI "${label}" nicht gefunden`);
    return false;
  }

  // Founder-spec 28.05: KPI dwells calibrated to V66 schedule
  // NEU 4:37,0-4:40,0 (3.0s) → BEI UNS 4:40,0-4:42,5 (2.5s) → ERLEDIGT 4:42,5-4:45,8 (3.3s) → BEWERTUNG 4:45,8-5:21,3 (35.5s)
  logEvent("kpi_neu_click");
  await clickKPI("NEU", 3000);
  logEvent("kpi_neu_dwell_end");
  logEvent("kpi_bei_uns_click");
  await clickKPI("BEI UNS", 2500);
  logEvent("kpi_bei_uns_dwell_end");
  logEvent("kpi_erledigt_click");
  await clickKPI("ERLEDIGT", 3300);
  logEvent("kpi_erledigt_dwell_end");
  logEvent("kpi_bewertung_click");
  // V102c (28.05): BEWERTUNG dwell 37500→38600ms — measured drift left
  // filter_reset_click at 5:22.92 (still 1.08s early). Extra 1.1s closes gap.
  await clickKPI("BEWERTUNG", 38600);
  logEvent("kpi_bewertung_dwell_end");

  // Filter zurücksetzen
  try {
    const resetBtn = page.locator('text=Filter zurücksetzen').first();
    if (await resetBtn.count() > 0) {
      logEvent("filter_reset_click");
      await resetBtn.click();
      await page.waitForTimeout(800);
      logEvent("filter_reset_done");
      console.log("  Filter zurückgesetzt ✓");
    }
  } catch {}

  // Force-scroll back to top so we have a clean "Guten Abend visible" pre-scroll state.
  // Filter-reset may leave page scrolled; this normalises the position.
  await page.evaluate(() => window.scrollTo(0, 0));
  // V102c (28.05): pre_scroll_hold 500→600ms to balance BEWERTUNG +1.1s such
  // that gap filter_reset_click→small_scroll_start = 1.5s (founder spec).
  await page.waitForTimeout(600);
  logEvent("pre_scroll_hold_end");

  // Founder-spec 28.05: small scroll-down 0.4s (just hide Guten Abend header + filter buttons,
  // KPIs still visible), then hold ~3s before case-click.
  logEvent("small_scroll_start");
  await scrollToEaseOut(120, 400);
  logEvent("small_scroll_end");
  console.log("  Small scroll-down 0.4s (hide header, keep KPIs)");
  // V101 alignment: post_scroll_hold reduced 3000→2200ms so case_click lands at
  // output 5:27.0 accounting for 3s page-load navigation overhead.
  await page.waitForTimeout(2200);
  logEvent("post_scroll_hold_end");
  console.log("  Hold 2.2s before case-click (V101 alignment)");

  // ── B12: Scroll to Phone-Case (eindeutig via reporter_name) + click ──
  // FB33: Phone-Case hat reporter_name "Gunnar Wende" aus notruf.txt-Script —
  // das ist EINDEUTIG (im Gegensatz zu "Rohrbruch" das auch der Notfall-Case
  // sein könnte je nach Branche). Wir suchen nach dem Reporter-Namen aus config.
  const phoneReporter = config.seed?.phone_demo_case?.reporter_name || "Wende";
  const phoneCat = config.seed?.phone_demo_case?.kategorie || "Rohrbruch";

  // FB51/52: Direct nav to phone case
  let caseClicked = false;

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
        logEvent("case_click");
        await page.goto(`${baseUrl}/ops/cases/${phoneCase.id}`, { waitUntil: "domcontentloaded", timeout: 10000 });
        await page.waitForTimeout(1000);
        logEvent("case_loaded");
        caseClicked = true;
      }
    } catch (e) {
      console.log(`  Direct navigation fehlgeschlagen: ${e.message.slice(0, 60)}`);
    }
  }

  if (caseClicked) {
    // FB1: Messe den Moment des Fall-Detail-Öffnens (Sekunden seit Recording-Start).
    // compose nutzt diesen Wert zum Umschalten der Status-Bar-Uhr (+1 min).
    const detailSwitchSec = (Date.now() - recordingStartMs) / 1000;
    console.log(`  FB1: Fall-Detail geöffnet bei Recording-Sekunde ${detailSwitchSec.toFixed(2)}`);
    try {
      const cfgAgain = JSON.parse(await readFile(configPath, "utf-8"));
      cfgAgain._take2_detail_switch_sec = detailSwitchSec;
      await writeFile(configPath, JSON.stringify(cfgAgain, null, 2), "utf-8");
    } catch (e) {
      console.warn(`  FB1 config write warning: ${e.message}`);
    }

    // FB51 (27.05): Shorter load wait — direct nav loads fast
    await page.waitForTimeout(800);
    await page.waitForSelector(`text=${phoneCat}`, { timeout: 3000 }).catch(() => {});
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

    // Founder-spec 28.05: case-detail choreography
    //   Top hold (11s) → scroll-down 2s ease-out → bottom hold 3s → scroll-up 0.5s ease-out → top hold (18s) → Zurück

    // V101 alignment (28.05): case_top_hold reduced 12000→8000ms. Founder spec
    // wants case_top from 5:27 to 5:38 = 11s WALL-CLOCK total. Page-load adds
    // ~3s before case_top_hold_start, so internal hold of 8s yields ~11s total.
    logEvent("case_top_hold_start");
    await page.waitForTimeout(8000);
    logEvent("case_top_hold_end");
    console.log("  Case top hold (8s; ~11s total incl nav)");

    // Scroll-down 2s ease-out (fast→slow) to bottom
    logEvent("case_scroll_down_start");
    await scrollToEaseOut(1400, 2000);
    logEvent("case_scroll_down_end");
    console.log("  Case scroll-down ease-out (2.0s)");

    // Bottom hold 3s
    await page.waitForTimeout(3000);
    logEvent("case_bottom_hold_end");
    console.log("  Case bottom hold (3s)");

    // Rapid scroll-up 0.5s ease-out (fast→slow) back to top
    logEvent("case_scroll_up_start");
    await scrollToEaseOut(0, 500);
    logEvent("case_scroll_up_end");
    console.log("  Case scroll-up ease-out (0.5s)");

    // V104f (29.05): Reverted to 11000ms. V104e at 11650ms went +3.2s LATE
    // (return at 6:04.7 vs 6:01.5 target). V104d at 11000ms was -0.65s EARLY
    // (return at 6:00.85). Variance of ~3-4s observed across runs due to
    // upstream cumulative dwell jitter. 11000ms gives best-case median result.
    // TODO: replace with post-record trim-by-event-timestamp for deterministic
    // results regardless of recording variance.
    await page.waitForTimeout(11000);
    logEvent("case_top_hold_final_end");
    console.log("  Case top hold final (11s — V104f median calibration)");

    // B17: Back to overview (list)
    logEvent("zurueck_click");
    try {
      await page.locator('text=Zurück').first().click();
      await page.waitForTimeout(1500);
      // V102 (28.05): scrollTo(0,0) after zurück so the final dashboard view
      // matches the initial dashboard top (4:18-4:30 state). Founder spec:
      // 6:01.5 → 6:20 should show 1:1 dashboard initial standbild.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);
      logEvent("list_visible");
      console.log("  B17: Zurück zur Fall-Liste + scrollTo(0,0) ✓");
    } catch {
      await page.goBack();
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);
      logEvent("list_visible");
      console.log("  B17: Zurück (goBack) + scrollTo(0,0) ✓");
    }
    // V102: extend recording so final dashboard-top state covers 6:01.5–6:20.
    // Recorder previously ended at recording_t ~135 which mapped to output ~6:18.6,
    // leaving 1.4s of V50-base bleed. Add 4s extra so overlay covers full 6:20.
    await page.waitForTimeout(4000);
    logEvent("recording_end_extended");
  } else {
    console.log(`  ⚠️ Phone-Case mit reporter "${phoneReporter}" nicht in Case-Liste gefunden`);
  }

  // FB53: Final pause extended to 7s so pipeline overlay covers to master 380.5
  await page.waitForTimeout(7000);
  logEvent("recording_end");

  // ── Stop recording ──
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Move to final location
  const finalPath = join(outBase, "take2_leitsystem.webm");
  await copyFile(videoPath, finalPath);
  await rm(outDir, { recursive: true, force: true });

  // Persist event log alongside the recording.
  const eventLogPath = join(outBase, "take2_event_log.json");
  await writeFile(eventLogPath, JSON.stringify({ tenant: slug, recording_start_ms: recordingStartMs, events }, null, 2), "utf-8");
  console.log(`  event log: ${eventLogPath} (${events.length} events)`);

  const size = statSync(finalPath).size;
  console.log(`\n✅ Saved: ${finalPath} (${Math.round(size / 1024)} KB)`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
