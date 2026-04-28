#!/usr/bin/env node
/**
 * record_take4.mjs — Take 4 (A10/A12/A13/A17/A19 Rebuild).
 *
 * Struktur (7 Teile, Close-Circle A19 komplett entfernt):
 *   1. take4_01_akt1.webm       — D1 Fallübersicht → D2 Case-Detail → In Arbeit + Termin → Termin versenden (A11)
 *   2. take4_02_cut.webm        — Brand-Cut
 *   3. take4_03_phone_day1.webm — Handy: 07:59 → 08:00 Reminder kommt rein (A10 Zeit-Logik)
 *   4. take4_04_akt2.webm       — Erledigt → Save → Scroll Verlauf → Bewertung anfragen → D15 Hold (A12)
 *   5. take4_05_phone_day2.webm — Handy: Alle 3 SMS statisch
 *   6. take4_06_review.webm     — Live /review/[id] Mobile (A13/A14/A15/A16)
 *   7. take4_07_closing.webm    — Dashboard mit Gold-Case (A17 Status "Erledigt" gold via CSS-Inject)
 *
 * Warning-Bypass (A11): DEMO_NO_DISPATCH=1 auf Dev-Server → Termin versenden +
 * Bewertung anfragen setzen nur DB-Fields, kein SMS/E-Mail.
 *
 * Usage (Dev-Server Start):
 *   DEMO_NO_DISPATCH=1 npm --prefix src/web run dev
 *   APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
 *     scripts/_ops/record_take4.mjs --slug doerfler-ag
 */

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const args = process.argv.slice(2);
const slug = args.find((a) => a.startsWith("--slug"))?.split("=")[1] || "doerfler-ag";
const baseUrl = args.find((a) => a.startsWith("--base-url"))?.split("=")[1] || "http://localhost:3000";

// S4: Speed-Flag — fast für Dev-Runs, normal für Prod, demo für High-End-Review
const speedArg = args.find((a) => a.startsWith("--speed"))?.split("=")[1] || "normal";
const SPEED = { fast: 0.5, normal: 1.0, demo: 1.3 }[speedArg] || 1.0;
const w = (ms) => Math.round(ms * SPEED);
console.log(`\n  Speed-Mode: ${speedArg} (factor ${SPEED})`);

const configPath = join("docs", "customers", slug, "tenant_config.json");
const config = JSON.parse(await readFile(configPath, "utf-8"));
const t = config.tenant;
const brandColor = t.brand_color || "#0b1220";
const caseUuid = config._wizard_case_id;
const caseLabel = config._wizard_case_label;
const reviewToken = config._review_token || "";
const displayPhone = config.video?.display_phone || "+41 44 505 74 21";

console.log(`\n=== Take 4 v2 Recording: ${t.name} (${slug}) ===\n`);

function fmtTime(iso) {
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function fmtDate(iso) {
  const d = new Date(iso);
  return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
}
function fmtWeekday(iso) {
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  return days[new Date(iso).getDay()];
}

const outBase = join("docs", "gtm", "pipeline", "06_video_production", "screenflows", slug);
await mkdir(outBase, { recursive: true });

// ── Auth-Cookies ──
async function getAuthCookies() {
  const email = "admin@flowsight.ch";
  await sb.from("otp_codes").delete().eq("email", email);
  await sb.from("otp_codes").insert({
    email, code: "take4v2",
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    used: false,
  });
  const resp = await fetch(`${baseUrl}/api/ops/auth/verify-code`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code: "take4v2" }),
  });
  if (resp.status !== 200) { console.error("Auth failed"); process.exit(1); }
  return resp.headers.getSetCookie() || [];
}

async function setupLeitsystemContext(browser, recordDir, cookies) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: recordDir, size: { width: 1440, height: 900 } },
  });
  const cookieDomain = new URL(baseUrl).hostname;
  for (const raw of cookies) {
    const eqIdx = raw.indexOf("="); const scIdx = raw.indexOf(";");
    const name = raw.slice(0, eqIdx);
    const value = raw.slice(eqIdx + 1, scIdx > 0 ? scIdx : undefined);
    await context.addCookies([{ name, value, domain: cookieDomain, path: "/", sameSite: "Lax" }]);
  }
  const { data: tenant } = await sb.from("tenants").select("id").eq("slug", slug).single();
  if (tenant) {
    await context.addCookies([{
      name: "fs_active_tenant", value: tenant.id, domain: cookieDomain, path: "/", sameSite: "Lax",
    }]);
  }
  await context.addInitScript(() => {
    try { localStorage.setItem("ops-push-onboarding-dismissed", Date.now().toString()); } catch {}
    const css = `
      /* FB76/Dev-Badges aggressiv weg */
      nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast], [data-nextjs-toast-wrapper],
      [class*="nextjs"], [id*="nextjs"], [class*="__next"],
      button[data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues],
      [aria-label*="issue" i], [aria-label*="Dev Tools" i],
      button[data-sentry], [data-error-toast], .sentry-feedback,
      [class*="sentry"], [data-testid*="sentry"] {
        display: none !important; visibility: hidden !important; opacity: 0 !important;
      }
      /* FB62 Tenant-Switcher weg */
      [data-owner-only="tenant-switcher"] { display: none !important; }
      /* FB75 Content-Padding */
      main.md\\:ml-64 > *:not(.full-bleed) {
        max-width: 1080px !important; margin-left: auto !important; margin-right: auto !important;
      }
      main.md\\:ml-64 { padding-left: 48px !important; padding-right: 48px !important; }
      /* A11: Warning "Benachrichtigungen noch nicht versendet" wird jetzt via
         DEMO_NO_DISPATCH + "Termin versenden"-Click umgangen. Diese CSS-Rule
         bleibt als Safety-Net falls Click-Order mal fehlschlägt. */
      [class*="bg-yellow-50"], [class*="bg-amber-50"],
      [class*="border-yellow-200"], [class*="border-amber-200"],
      div[style*="#fef3c7"], div[style*="#fef08a"], div[style*="#fffbeb"] {
        display: none !important;
      }

      /* C1: Next.js 16 "3 Issues" Dev-Badge aggressiv killen (Shadow-DOM + Button) */
      nextjs-portal, [data-nextjs-toast-wrapper], [data-nextjs-toast],
      button[data-nextjs-dev-tools-button], [data-nextjs-dialog-overlay],
      button[aria-label*="Issue" i], button[aria-label*="issue" i],
      div[class*="__next"]:not(#__next), [data-issue-count] {
        display: none !important; visibility: hidden !important;
        opacity: 0 !important; pointer-events: none !important;
      }
      /* Alle fixed-position red-background Elements bottom-left abknipsen */
      body > button[style*="position: fixed"], body > div[style*="position: fixed"] {
        display: none !important;
      }

      /* A17 Video-Mode: Status-Pill "Erledigt" bei bewertet_positiv mit GOLD
         Hintergrund (nur Video — Live bleibt grün). Keine Produkt-Drift. */
      span[data-status-pill="erledigt-gold"] {
        background: linear-gradient(to right, #fde68a, #fbbf24) !important;
        color: #78350f !important;
        font-weight: 600 !important;
        box-shadow: inset 0 0 0 1px rgba(217, 119, 6, 0.5) !important;
      }
    `;
    const inject = () => {
      if (document.getElementById("t4v2-style")) return;
      const s = document.createElement("style");
      s.id = "t4v2-style"; s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    };
    inject();
    setInterval(inject, 120);
    // Aggressive Dev-Badge-Suppression: remove by attribute AND by visual
    // heuristic (fixed-position element with "issue" text in bottom-left corner).
    const aggressiveKill = () => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues]').forEach((el) => el.remove());
      // FB102: Shadow-DOM-Kill for Next.js 16 dev-indicator (lives in nextjs-portal shadow root).
      try {
        document.querySelectorAll("nextjs-portal").forEach((p) => {
          p.remove();
          if (p.shadowRoot) {
            p.shadowRoot.querySelectorAll("*").forEach((c) => c.remove?.());
          }
        });
        // Any <button> with aria-label containing "Open Next.js Dev Tools" etc.
        document.querySelectorAll("button, div").forEach((el) => {
          const al = el.getAttribute("aria-label") || "";
          const title = el.getAttribute("title") || "";
          if (/issue|dev tools|next\.?js|_next/i.test(al + title) && el.textContent.length < 100) {
            el.remove();
          }
        });
      } catch {}
      document.querySelectorAll("body > *, html > *").forEach((el) => {
        try {
          const s = getComputedStyle(el);
          if (s.position !== "fixed") return;
          const txt = (el.textContent || "").trim();
          const bottom = parseInt(s.bottom) || 0;
          const left = parseInt(s.left) || 0;
          if (bottom < 60 && left < 60 && /issue/i.test(txt)) {
            el.remove();
          }
        } catch {}
      });
      // FB97/FB104: Warning-Banner VISUELL unsichtbar (aber Button im DOM,
      // Playwright kann "Trotzdem speichern" trotzdem clicken). Wir kollabieren
      // den Wrapper mit opacity/height=0, nicht remove().
      document.querySelectorAll("div, section, aside, p").forEach((el) => {
        const txt = (el.textContent || "").slice(0, 400);
        if (/Benachrichtigungen noch nicht versendet|wurden ge.ndert.*aber.*noch nicht/i.test(txt)
            && txt.length < 500 && !el.dataset.fb104Hidden) {
          // Walk up to the warning wrapper (bg-amber/bg-yellow container).
          let node = el;
          for (let d = 0; d < 3; d++) {
            const p = node.parentElement;
            if (!p) break;
            const cls = p.className || "";
            const style = p.getAttribute("style") || "";
            if (/bg-(yellow|amber)/.test(cls) || /fef3c7|fef08a|fffbeb|rgb\(254/.test(style)) {
              node = p;
              break;
            }
            if (p.children.length <= 4) node = p;
            else break;
          }
          // Visuell kollabieren: Opacity + 0-Height + pointer-events none.
          node.dataset.fb104Hidden = "1";
          node.style.cssText +=
            ";opacity:0 !important;max-height:0 !important;height:0 !important;" +
            "margin:0 !important;padding:0 !important;overflow:hidden !important;" +
            "border:none !important;visibility:hidden !important;";
        }
      });
    };
    setInterval(aggressiveKill, 80);
  });
  return context;
}

async function saveRecording(page, context, targetPath) {
  const vid = page.video();
  await page.close();
  if (vid) await vid.saveAs(targetPath);
  await context.close();
}

// C3: Verlauf-Event-Timestamp auf demo_time patchen (neueste Event-Row per case+type).
async function patchLatestEventTime(case_id, event_type, isoTime) {
  const { data } = await sb.from("case_events")
    .select("id")
    .eq("case_id", case_id)
    .eq("event_type", event_type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) {
    await sb.from("case_events").update({ created_at: isoTime }).eq("id", data.id);
    console.log(`  [C3] Patched ${event_type} → ${isoTime}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// PART 1+2: Fallübersicht → Case-Detail → Bearbeiten → In Arbeit + Termin
// Merged als "take4_01_akt1.webm" (D1 + D2 + Edit flow).
// ══════════════════════════════════════════════════════════════════════
async function recordAkt1(browser, cookies) {
  console.log("\n── PART 1: D1 Fallliste → D2 Case-Detail → In Arbeit + Termin ──");
  const tmpDir = join(outBase, "_tmp_t4_akt1");
  await mkdir(tmpDir, { recursive: true });
  const context = await setupLeitsystemContext(browser, tmpDir, cookies);
  const page = await context.newPage();

  // FB78: Start mit D1 Fallliste.
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(w(6500));  // +2s buffer für sauberen Einstieg (C15)
  try {
    const later = page.locator('button:has-text("Später")');
    if (await later.count() > 0) { await later.first().click(); await page.waitForTimeout(w(300)); }
  } catch {}
  console.log("  D1: Fallübersicht sichtbar");
  await page.waitForTimeout(w(4500)); // D1 länger zeigen (+2s)

  // Click DA-0050 row → Case-Detail
  try {
    const row = page.locator(`tr:has-text("${caseLabel}"), a:has-text("${caseLabel}")`).first();
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(w(400));
    await row.click({ force: true });
    console.log("  → Case-Detail öffnen");
  } catch {
    await page.goto(`${baseUrl}/ops/cases/${caseUuid}?_hb=1`, { waitUntil: "domcontentloaded" });
  }
  await page.waitForTimeout(w(5000)); // D2 Ruhezeit (+2s)

  // Click Bearbeiten (pencil icon)
  try {
    await page.locator('button[title="Bearbeiten"]').first().click({ timeout: 5000 });
    console.log("  D3: Bearbeiten geklickt");
  } catch (e) { console.warn("  Bearbeiten fail:", e.message); }
  await page.waitForTimeout(w(2800));

  // FB79/96: Status-Dropdown VISUELL öffnen (synthetic overlay).
  // Native <select> zeigt Dropdown-Liste nicht zuverlässig unter Playwright.
  // Lösung: Ein custom Overlay-Div direkt unter dem Select rendern, das alle
  // Status-Optionen zeigt, 1.5s hold, dann schließen + selectOption.
  try {
    await page.evaluate(() => {
      const select = document.querySelector("select");
      if (!select) return;
      const rect = select.getBoundingClientRect();
      const options = [...select.options].map(o => ({ value: o.value, label: o.label }));
      const overlay = document.createElement("div");
      overlay.id = "fb96-dropdown";
      Object.assign(overlay.style, {
        position: "fixed",
        left: rect.left + "px",
        top: (rect.bottom + 2) + "px",
        width: rect.width + "px",
        background: "#fff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
        zIndex: "9999",
        fontFamily: "inherit",
        fontSize: "14px",
        overflow: "hidden",
      });
      // FB103: Richtiger Index für "In Arbeit" highlight (nicht "Geplant"!).
      const targetIdx = options.findIndex((o) => /in\s?arbeit/i.test(o.label));
      overlay.innerHTML = options.map((o, i) =>
        `<div style="padding:10px 14px;color:#1a1a1a;${i === targetIdx ? 'background:#eff6ff;font-weight:500;' : ''}">${o.label}</div>`
      ).join("");
      document.body.appendChild(overlay);
    });
    console.log("  D4: Status-Dropdown visuell offen (In Arbeit hervorgehoben)");
  } catch (e) { console.warn("  Dropdown-overlay fail:", e.message); }
  await page.waitForTimeout(w(3500)); // Hold auf offenem Dropdown

  try {
    // Close visual dropdown
    await page.evaluate(() => document.getElementById("fb96-dropdown")?.remove());
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption({ label: "In Arbeit" });
    console.log("  D5/D6: Status → In Arbeit");
  } catch (e) { console.warn("  Status fail:", e.message); }
  await page.waitForTimeout(w(2800));

  // Termin öffnen
  try {
    const terminInput = page.locator('input[placeholder*="Termin"], button:has-text("Termin wählen")').first();
    await terminInput.click({ timeout: 5000 });
    console.log("  D7: Termin-Picker geöffnet");
  } catch (e) { console.warn("  Termin-Picker fail:", e.message); }
  await page.waitForTimeout(w(2000));

  // Click target date + time slots — C4/C7: DYNAMISCH aus demo_time.
  const apptStart = config._appointment_start;
  const apptEnd = config._appointment_end;
  const apptDay = new Date(apptStart).getDate();
  // Extract HH:MM for slot pick (Europe/Zurich)
  const fmtCH = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit",
  });
  const vonStr = fmtCH.format(new Date(apptStart));  // e.g. "08:00"
  const bisStr = fmtCH.format(new Date(apptEnd));    // e.g. "10:00"
  try {
    const dayBtn = page.locator(`button, td, span`).filter({ hasText: new RegExp(`^${apptDay}$`) }).first();
    await dayBtn.click({ timeout: 3000 });
    await page.waitForTimeout(w(700));
    const vonSlot = page.locator(`text=/^${vonStr.replace(":", "\\:")}$/`).first();
    await vonSlot.scrollIntoViewIfNeeded().catch(() => {});
    await vonSlot.click({ timeout: 3000 });
    await page.waitForTimeout(w(400));
    const bisSlot = page.locator(`text=/^${bisStr.replace(":", "\\:")}$/`).nth(1);
    await bisSlot.scrollIntoViewIfNeeded().catch(() => {});
    await bisSlot.click({ timeout: 3000 });
    console.log(`  D8: ${vonStr}-${bisStr} gesetzt (aus demo_time)`);
  } catch (e) { console.warn("  Slot fail:", e.message); }
  await page.waitForTimeout(w(2800));

  try {
    await page.locator('button:has-text("Übernehmen")').first().click({ timeout: 3000 });
    console.log("  D9: Übernehmen");
  } catch {}
  await page.waitForTimeout(w(2800));

  // A11: "Termin versenden" klicken (statt Speichern+Trotzdem). Bei DEMO_NO_DISPATCH=1
  // setzt das Server-seitig appointment_sent_at + invite_sent-Event OHNE echten
  // SMS/E-Mail-Versand. Dadurch gibt's kein Warning-Banner im Save-Flow.
  try {
    const terminBtn = page.locator('button:has-text("Termin versenden")').first();
    await terminBtn.waitFor({ state: "visible", timeout: 4000 });
    await terminBtn.click({ timeout: 4000 });
    console.log("  D10 (A11): Termin versenden — saves + DEMO-dispatches");
  } catch (e) {
    console.warn("  Termin versenden fail, falle zurück auf Speichern:", e.message);
    // Fallback falls Termin-Versenden-Button nicht sichtbar (e.g. kein Contact)
    try {
      await page.locator('button:has-text("Speichern")').first().click({ timeout: 3000 });
      const trotzdem = page.locator('button:has-text("Trotzdem speichern")');
      if (await trotzdem.count() > 0) await trotzdem.first().click({ timeout: 2000 });
    } catch {}
  }
  await page.waitForTimeout(w(1500)); // Show "Wird versendet…" → "Gesendet" confirmation

  // C3: Alle Events der "In Arbeit + Termin"-Aktion auf demoNow patchen
  const demoNowIso = config._demo_now || new Date().toISOString();
  await patchLatestEventTime(caseUuid, "invite_sent", demoNowIso);
  await patchLatestEventTime(caseUuid, "melder_termin_notified", demoNowIso);
  await patchLatestEventTime(caseUuid, "fields_updated", demoNowIso);
  await patchLatestEventTime(caseUuid, "status_changed", demoNowIso);  // Neu→In Arbeit
  await patchLatestEventTime(caseUuid, "assignee_assignment", demoNowIso);
  // Reload damit Verlauf patched Zeiten zeigt
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(w(2500));

  const target = join(outBase, "take4_01_akt1.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);
}

// ══════════════════════════════════════════════════════════════════════
// PART 3: Brand-Cut
// ══════════════════════════════════════════════════════════════════════
async function recordBrandCut(browser) {
  console.log("\n── PART 3: Brand-Cut ──");
  const tmpDir = join(outBase, "_tmp_cut");
  await mkdir(tmpDir, { recursive: true });
  const htmlPath = join("scripts", "_ops", "screen_templates", "sequences", "take4_brand_cut.html");
  let html = await readFile(htmlPath, "utf-8");
  html = html.replace("{{FIRMA}}", t.name).replace("{{BRAND}}", brandColor);
  const tmpHtml = join(tmpDir, "cut.html");
  await writeFile(tmpHtml, html, "utf-8");

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto("file:///" + tmpHtml.replace(/\\/g, "/"));
  await page.waitForTimeout(w(1400));

  const target = join(outBase, "take4_02_cut.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);
}

// ══════════════════════════════════════════════════════════════════════
// PART 4: Handy Day+1 — Homescreen 08:59 → 09:00 → SMS-Notif → SMS-Thread
// Uses take2_samsung.html for identical look (FB82-85+FB90).
// ══════════════════════════════════════════════════════════════════════
async function recordPhoneDay1(browser) {
  console.log("\n── PART 4: Handy Day+1 (Reminder kommt rein) ──");
  const tmpDir = join(outBase, "_tmp_phone1");
  await mkdir(tmpDir, { recursive: true });

  // FB126: Reminder-Tag verwenden (24h VOR Termin), NICHT seedTime.
  const reminderTimeIso = config._reminder_time || new Date().toISOString();
  const rD = new Date(reminderTimeIso);
  const urlParams = new URLSearchParams({
    firma: t.name,
    telefon: displayPhone,
    sms_sender: t.name,
    case_ref: caseLabel,
    uhrzeit: String(rD.getHours()).padStart(2, "0") + ":" + String(rD.getMinutes()).padStart(2, "0"),
    datum: String(rD.getDate()).padStart(2, "0") + "." + String(rD.getMonth() + 1).padStart(2, "0"),
    initial: t.name.slice(0, 2).toUpperCase(),
    brand_color: brandColor,
  });
  const htmlPath = join("scripts", "_ops", "screen_templates", "sequences", "take2_samsung.html");
  const fullUrl = "file:///" + htmlPath.replace(/\\/g, "/") + "?" + urlParams.toString();

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    recordVideo: { dir: tmpDir, size: { width: 412, height: 915 } },
  });
  const page = await context.newPage();
  // Block take2_samsung.html auto-run: inject playwright marker + override.
  await page.addInitScript(() => {
    // URL is set separately; we just ensure auto-run path skips standalone part.
    // Override any running timers immediately after load.
    window.__t4PhoneMode = true;
  });
  // Reminder Day-Label + Time from rD (deklariert oben)
  const rWd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][rD.getDay()];
  const rTime = String(rD.getHours()).padStart(2, "0") + ":" + String(rD.getMinutes()).padStart(2, "0");
  const reminderDayLabel = `${rWd} ${String(rD.getDate()).padStart(2,"0")}.${String(rD.getMonth()+1).padStart(2,"0")}. - ${rTime}`;

  await page.goto(fullUrl);
  // C16+C17 Compressed: Bestätigung + Reminder beide 08:04 — Lisa's Bestätigung
  // kam gerade, und der Save triggert sofort 24h-Reminder (<24h vor Termin).
  await page.waitForTimeout(w(300));
  const reminderD = new Date(reminderTimeIso);
  const bestaetDate = new Date(config._confirmation_sent_time || reminderTimeIso); // 08:04
  const bestaetHHMM = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit",
  }).format(bestaetDate);
  const bestaetDayLabel = (() => {
    const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][bestaetDate.getDay()];
    const dd = String(bestaetDate.getDate()).padStart(2,"0");
    const mm = String(bestaetDate.getMonth()+1).padStart(2,"0");
    return `${wd} ${dd}.${mm}.`;
  })();

  await page.evaluate((args) => {
    if (window.showScreen) window.showScreen("homescreen");
    if (window.updateAllClocks) window.updateAllClocks(args.barTime);
    // C17: Bestätigungs-SMS Timestamp überschreiben (einige Minuten her)
    const timestampEl = document.getElementById("sms-timestamp");
    if (timestampEl) timestampEl.textContent = args.bestaetTime;
    const dayEl = document.getElementById("sms-day");
    if (dayEl) dayEl.innerHTML = `${args.bestaetDay} · <span id="sms-time">${args.bestaetTime}</span>`;
    if (window.showSmsNotification) window.showSmsNotification();
  }, { barTime: rTime, bestaetTime: bestaetHHMM, bestaetDay: bestaetDayLabel });
  console.log(`  Homescreen ${rTime} + Bestätigungs-SMS ${bestaetDayLabel} ${bestaetHHMM}`);
  await page.waitForTimeout(w(2200));

  // SMS-Thread öffnen + Reminder einblenden — C7: TerminTime aus demo_time.
  const apptStartIso = config._appointment_start;
  const apptHHMM = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit",
  }).format(new Date(apptStartIso));
  const terminAdresse = "Bahnhofstrasse 15";
  await page.evaluate(() => {
    if (window.openSmsThread) window.openSmsThread();
  });
  await page.waitForTimeout(w(800));
  await page.evaluate((args) => window.showSmsReminder && window.showSmsReminder({
    dayLabel: args.dayLabel,
    timestamp: args.time,
    terminTime: args.apptTime,
    adresse: args.adresse,
    phone: args.phone,
  }), {
    dayLabel: reminderDayLabel,
    time: rTime,
    apptTime: apptHHMM,
    adresse: terminAdresse,
    phone: displayPhone,
  });
  console.log(`  → SMS-Thread mit Reminder (Termin ${apptHHMM}, ${terminAdresse})`);
  await page.waitForTimeout(w(2200));

  const target = join(outBase, "take4_03_phone_day1.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);
}

// ══════════════════════════════════════════════════════════════════════
// PART 5: Leitsystem Akt 2 — Erledigt + Bewertung anfragen
// ══════════════════════════════════════════════════════════════════════
async function recordAkt2(browser, cookies) {
  console.log("\n── PART 5: Leitsystem Erledigt + Bewertung anfragen ──");
  const tmpDir = join(outBase, "_tmp_t4_akt2");
  await mkdir(tmpDir, { recursive: true });
  const context = await setupLeitsystemContext(browser, tmpDir, cookies);
  const page = await context.newPage();

  await page.goto(`${baseUrl}/ops/cases/${caseUuid}?_hb=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(w(4000));
  try {
    const later = page.locator('button:has-text("Später")');
    if (await later.count() > 0) { await later.first().click(); await page.waitForTimeout(w(300)); }
  } catch {}

  // Bearbeiten
  try {
    await page.locator('button[title="Bearbeiten"]').first().click({ timeout: 5000 });
    console.log("  D11: Bearbeiten");
  } catch {}
  await page.waitForTimeout(w(2800));

  // FB87/96: Status-Dropdown VISUELL öffnen für Erledigt (synthetic overlay).
  try {
    await page.evaluate(() => {
      const select = document.querySelector("select");
      if (!select) return;
      const rect = select.getBoundingClientRect();
      const options = [...select.options].map(o => ({ value: o.value, label: o.label }));
      const overlay = document.createElement("div");
      overlay.id = "fb96-dropdown2";
      Object.assign(overlay.style, {
        position: "fixed",
        left: rect.left + "px",
        top: (rect.bottom + 2) + "px",
        width: rect.width + "px",
        background: "#fff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
        zIndex: "9999",
        fontFamily: "inherit",
        fontSize: "14px",
        overflow: "hidden",
      });
      // FB103: Richtiger Index für "Erledigt" highlight.
      const targetIdx = options.findIndex((o) => /erledigt/i.test(o.label));
      overlay.innerHTML = options.map((o, i) =>
        `<div style="padding:10px 14px;color:#1a1a1a;${i === targetIdx ? 'background:#eff6ff;font-weight:500;' : ''}">${o.label}</div>`
      ).join("");
      document.body.appendChild(overlay);
    });
    console.log("  D12: Status-Dropdown visuell offen (Erledigt hervorgehoben)");
  } catch (e) { console.warn("  Dropdown-overlay fail:", e.message); }
  await page.waitForTimeout(w(3500));

  try {
    await page.evaluate(() => document.getElementById("fb96-dropdown2")?.remove());
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption({ label: "Erledigt" });
    console.log("  D13: Status → Erledigt");
  } catch (e) { console.warn("  Status fail:", e.message); }
  await page.waitForTimeout(w(2800));

  // A12 Step 1: "Speichern" oben — Termin wurde nicht geändert, also kein Warning.
  try {
    await page.locator('button:has-text("Speichern")').first().click({ timeout: 3000 });
    console.log("  D14: Speichern oben (Status → Erledigt wird persistiert)");
  } catch {}
  await page.waitForTimeout(w(2800));
  // Fallback: Trotzdem falls Warning trotz allem auftaucht
  try {
    const trotzdem = page.locator('button:has-text("Trotzdem speichern")');
    if (await trotzdem.count() > 0) await trotzdem.first().click({ timeout: 1500 });
  } catch {}
  await page.waitForTimeout(w(1800));

  // A12 Step 2: Scroll runter zum Verlauf/Bewertung-Bereich.
  try {
    const verlaufHeader = page.locator('h3:has-text("Verlauf")').first();
    await verlaufHeader.scrollIntoViewIfNeeded({ timeout: 3000 });
    console.log("  D14b: Scroll zu Verlauf");
  } catch (e) { console.warn("  Scroll fail:", e.message); }
  await page.waitForTimeout(w(3500));

  // A12 Step 3: "Bewertung anfragen"-Button klicken.
  try {
    await page.locator('button:has-text("Bewertung anfragen")').first().click({ timeout: 5000 });
    console.log("  D15: Bewertung anfragen geklickt (DEMO_NO_DISPATCH)");
  } catch (e) { console.warn("  Bewertung fail:", e.message); }

  // A12 Step 4: 1s warten bis Verlauf das neue Event "Bewertungsanfrage verschickt" zeigt.
  await page.waitForTimeout(w(2800));

  // A12 Step 5: Router-Refresh erzwingen damit Verlauf das DB-Event lädt.
  try {
    await page.evaluate(() => {
      // Next.js App-Router: router.refresh() via window.location reload (light).
      // Wir verwenden ein internes Event anstatt Reload.
      const btn = document.querySelector('button[title="Bearbeiten"]');
      // Trigger effect that re-fetches events
    });
    // Simpelster Weg: Scroll verlauf in sight erneut + Mini-Wait
    const verlaufHeader = page.locator('h3:has-text("Verlauf")').first();
    await verlaufHeader.scrollIntoViewIfNeeded({ timeout: 2000 });
  } catch {}
  await page.waitForTimeout(w(1200)); // Kurzer D15 Hold

  // C3: Alle Erledigt+Bewertung-Events patchen
  const completionIso = config._completion_time || new Date().toISOString();
  const reviewSentIso = config._review_sent_time || new Date().toISOString();
  await patchLatestEventTime(caseUuid, "review_requested", reviewSentIso);
  await patchLatestEventTime(caseUuid, "fields_updated", completionIso);  // Status→Erledigt
  await patchLatestEventTime(caseUuid, "status_changed", completionIso);
  // Reload damit Verlauf patched Zeiten zeigt
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(w(800));
  try {
    await page.locator('h3:has-text("Verlauf")').first().scrollIntoViewIfNeeded({ timeout: 2000 });
  } catch {}
  await page.waitForTimeout(w(2000)); // Hold nach Reload — Verlauf mit patched Zeit

  const target = join(outBase, "take4_04_akt2.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);
}

// ══════════════════════════════════════════════════════════════════════
// PART 6: Handy Day+2 — alle 3 SMS inkl. Bewertungsanfrage
// ══════════════════════════════════════════════════════════════════════
async function recordPhoneDay2(browser) {
  console.log("\n── PART 6: Handy Day+2 (alle 3 SMS chronologisch) ──");
  const tmpDir = join(outBase, "_tmp_phone2");
  await mkdir(tmpDir, { recursive: true });

  // C16: Status-Bar-Zeit = reviewSentTime (10:31 wenn 3. SMS reinkommt — aktuellster Moment)
  const reviewSentIso = config._review_sent_time || new Date().toISOString();
  const reviewSentD = new Date(reviewSentIso);
  const statusBarHHMM = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit",
  }).format(reviewSentD);
  const urlParams = new URLSearchParams({
    firma: t.name,
    telefon: displayPhone,
    sms_sender: t.name,
    case_ref: caseLabel,
    uhrzeit: statusBarHHMM,
    datum: String(reviewSentD.getDate()).padStart(2, "0") + "." + String(reviewSentD.getMonth() + 1).padStart(2, "0"),
    initial: t.name.slice(0, 2).toUpperCase(),
    brand_color: brandColor,
  });
  const htmlPath = join("scripts", "_ops", "screen_templates", "sequences", "take2_samsung.html");
  const fullUrl = "file:///" + htmlPath.replace(/\\/g, "/") + "?" + urlParams.toString();

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    recordVideo: { dir: tmpDir, size: { width: 412, height: 915 } },
  });
  const page = await context.newPage();
  await page.addInitScript(() => { window.__t4PhoneMode = true; });
  await page.goto(fullUrl);
  await page.waitForTimeout(w(300));

  // C16+C17: Alle 3 SMS statisch mit demo-time Timestamps.
  // SMS 1 Bestätigung: reminderSent - 15 Min (heute 07:45 — vor einigen Min)
  // SMS 2 Reminder: reminderSent (heute 08:00)
  // SMS 3 Review: reviewSent (morgen 10:31)
  const reminderDate = new Date(config._reminder_time || Date.now() - 24 * 3600 * 1000);
  const bestaetDate = new Date(config._confirmation_sent_time || reminderDate.toISOString()); // 08:04
  const reviewDate = new Date(config._review_sent_time || Date.now());
  const formatDayLabel = (d) => {
    const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${wd} ${dd}.${mm}. · ${hh}:${min}`;
  };
  const formatDayShortLabel = (d) => {
    const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${wd} ${dd}.${mm}.`;
  };
  const formatTime = (d) =>
    String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

  // C17 Override Bestätigungs-SMS Timestamp auf 07:45-ish
  await page.evaluate((args) => {
    const timestampEl = document.getElementById("sms-timestamp");
    if (timestampEl) timestampEl.textContent = args.bestaetTime;
    const dayEl = document.getElementById("sms-day");
    if (dayEl) dayEl.innerHTML = `${args.bestaetDay} · <span id="sms-time">${args.bestaetTime}</span>`;
  }, { bestaetTime: formatTime(bestaetDate), bestaetDay: formatDayShortLabel(bestaetDate) });

  // C7: Apt time + Adresse für Reminder
  const apptStartIso2 = config._appointment_start;
  const apptHHMM2 = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit",
  }).format(new Date(apptStartIso2));
  await page.evaluate((args) => {
    if (window.showScreen) window.showScreen("sms-screen");
    if (window.showSmsReminder) window.showSmsReminder({
      dayLabel: args.reminderDayLabel,
      timestamp: args.reminderTime,
      terminTime: args.apptTime,
      adresse: args.adresse,
      phone: args.phone,
    });
    if (window.showSmsReview) window.showSmsReview({
      dayLabel: args.reviewDayLabel,
      timestamp: args.reviewTime,
      caseRef: args.caseRef,
      token: args.token,
    });
  }, {
    reminderDayLabel: formatDayLabel(reminderDate),
    reminderTime: formatTime(reminderDate),
    apptTime: apptHHMM2,
    adresse: "Bahnhofstrasse 15",
    phone: displayPhone,
    reviewDayLabel: formatDayLabel(reviewDate),
    reviewTime: formatTime(reviewDate),
    caseRef: caseLabel,
    token: reviewToken,
  });
  console.log("  Alle 3 SMS statisch preloaded (FB107)");
  await page.waitForTimeout(w(5000));

  const target = join(outBase, "take4_05_phone_day2.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);
}

// ══════════════════════════════════════════════════════════════════════
// PART 7: Review-Surface — LIVE /review/[caseId] Mobile (A13/A14/A15/A16)
// Content wird mit padding-top 36px + padding-bottom 48px gerendert, damit
// Samsung-Statusbar + Samsung-Nav im Compose overlay'd werden kann.
// ══════════════════════════════════════════════════════════════════════
async function recordReview(browser) {
  console.log("\n── PART 7: LIVE /review Mobile (A13/A14/A15/A16) ──");
  const tmpDir = join(outBase, "_tmp_review");
  await mkdir(tmpDir, { recursive: true });

  const reviewTokenLong = config._review_token_long;
  if (!reviewTokenLong) {
    console.error("❌ _review_token_long fehlt — insert_take4_lifecycle.mjs erneut ausführen");
    process.exit(1);
  }

  const reviewUrl = `${baseUrl}/review/${caseUuid}?token=${reviewTokenLong}`;
  console.log(`  URL: ${reviewUrl}`);

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    recordVideo: { dir: tmpDir, size: { width: 412, height: 915 } },
  });

  // Padding für Samsung-Chrome-Overlay (36 top + 56 bottom).
  // FB14 (23.04.): padding-top 36→96 damit Review-Card 60px Abstand von Status-Bar hat
  // (vorher hing der Content unter der Status-Bar). Overlay selbst bleibt 36px top.
  await context.addInitScript(() => {
    const css = `
      body { padding-top: 96px !important; padding-bottom: 56px !important; }
      body > div:first-child { min-height: calc(100dvh - 152px) !important; }
      /* Dev-Badges killen (auch Next.js Portal in Shadow-DOM) */
      nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast],
      button[data-nextjs-dev-tools-button] { display: none !important; }
    `;
    const inject = () => {
      if (document.getElementById("t4-review-css")) return;
      const s = document.createElement("style");
      s.id = "t4-review-css"; s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    };
    inject();
    setInterval(inject, 150);
  });

  const page = await context.newPage();
  await page.goto(reviewUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(w(2000));
  console.log("  Review-Page geladen (initial state)");

  // C9: Stars sequenziell 1→2→3→4→5 aufziehen via Hover-Rating-Update.
  // ReviewSurfaceClient füllt Sterne bei onMouseEnter(n) sichtbar bis n.
  // Wir dispatchen mouseenter-Events pro Stern, dann final Click auf Stern 5.
  try {
    await page.waitForSelector('button[aria-label*="Sterne"]', { timeout: 3000 });
    for (let i = 1; i <= 5; i++) {
      await page.evaluate((idx) => {
        const btn = document.querySelectorAll('button[aria-label*="Sterne"]')[idx - 1];
        if (btn) {
          btn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
          btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        }
      }, i);
      await page.waitForTimeout(w(160));
    }
    // Final: auf Stern 5 clicken damit rating state persistiert (= positive phase)
    await page.locator('button[aria-label*="Sterne"]').nth(4).click({ timeout: 2000 });
    console.log("  5 Sterne sequenziell aufgezogen + geclickt (C9)");
  } catch (e) { console.warn("  Star click fail:", e.message); }
  await page.waitForTimeout(w(1400));

  // A15: Click 2 quick-select chips
  try {
    await page.locator('button:has-text("Schnell & zuverlässig")').first().click({ timeout: 3000 });
    await page.waitForTimeout(w(900));
    await page.locator('button:has-text("Saubere Arbeit")').first().click({ timeout: 3000 });
    console.log("  2 Chips: Schnell & zuverlässig + Saubere Arbeit");
  } catch (e) { console.warn("  Chip click fail:", e.message); }
  await page.waitForTimeout(w(3500));

  // A16: Click "Bewertung abschliessen"
  try {
    const submitBtn = page.locator('button:has-text("Bewertung abschliessen"), button:has-text("Ohne Google abschliessen")').first();
    await submitBtn.click({ timeout: 3000 });
    console.log("  Bewertung abschliessen → Done-View");
  } catch (e) { console.warn("  Submit fail:", e.message); }
  await page.waitForTimeout(w(3000)); // Hold auf Done-View

  const target = join(outBase, "take4_06_review.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);

  // C3: review_rated Event auf reviewRatedTime patchen (für Closing-Verlauf)
  await patchLatestEventTime(caseUuid, "review_rated", config._review_rated_time || new Date().toISOString());
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════
// PART 8: Closing Dashboard — Case als Gold ("Erledigt" mit Gold-BG A17).
// Das review_rated-Event sollte bereits durch die Live-Review-Submission
// in Part 7 existieren — falls nicht, manuell nachziehen für Safety.
// ══════════════════════════════════════════════════════════════════════
async function recordClosingDashboard(browser, cookies) {
  console.log("\n── PART 8: Closing Dashboard (A17 Gold) ──");
  // Safety: wenn Live-Review failte, setze Rating manuell damit Gold zeigt.
  const reviewRatedTime = config._review_rated_time || new Date().toISOString();
  await sb.from("cases").update({
    review_sent_at: config._review_sent_time || new Date().toISOString(),
    review_received_at: reviewRatedTime,
    review_rating: 5,
    review_text: "Schnell & zuverlässig. Saubere Arbeit.",
  }).eq("id", caseUuid);

  const tmpDir = join(outBase, "_tmp_closing");
  await mkdir(tmpDir, { recursive: true });
  const context = await setupLeitsystemContext(browser, tmpDir, cookies);
  const page = await context.newPage();

  // Case-Detail zuerst (2s)
  await page.goto(`${baseUrl}/ops/cases/${caseUuid}?_hb=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(w(4000));
  console.log("  Closing: Case-Detail mit Gold-Review");
  await page.waitForTimeout(w(3500));

  // Fallübersicht
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(w(3000));
  console.log("  Closing: Fallübersicht mit Gold-Case");
  await page.waitForTimeout(w(2500));

  const target = join(outBase, "take4_07_closing.webm");
  if (existsSync(target)) await rm(target);
  await saveRecording(page, context, target);
  await rm(tmpDir, { recursive: true, force: true });
  console.log(`  ✓ ${target}`);
}

// A19: Close-the-Circle entfernt — Split-Screen Gold vs Intern raus.

const only = args.find((a) => a.startsWith("--only"))?.split("=")[1] || "";

const cookies = await getAuthCookies();
console.log(`Auth OK, ${cookies.length} cookies`);

const browser = await chromium.launch({ headless: true });
try {
  if (!only || only === "akt1") await recordAkt1(browser, cookies);
  if (!only || only === "cut") await recordBrandCut(browser);
  if (!only || only === "phone1") await recordPhoneDay1(browser);
  if (!only || only === "akt2") await recordAkt2(browser, cookies);
  if (!only || only === "phone2") await recordPhoneDay2(browser);
  if (!only || only === "review") await recordReview(browser);
  if (!only || only === "closing") await recordClosingDashboard(browser, cookies);
} finally {
  await browser.close();
}

console.log("\n=== Take 4 Recording Complete (7 parts, A19 close-circle entfernt) ===\n");
