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

// ── Event-Logging Infrastructure (Option B, 30.05.) ──
// Logs deterministic event-timestamps per phase-boundary.
// Used by event_log_to_override.mjs → build_from_phase_schedule auto-calibrate.
// NO waitUntilT — recording timing stays natural (no drift force).
const _partEvents = {};
let _currentPart = 0;
let _partStart = null;
function pinPartStart(partIdx) {
  _currentPart = partIdx;
  _partStart = Date.now();
  if (!_partEvents[partIdx]) _partEvents[partIdx] = [];
  _partEvents[partIdx].push({ name: "part_start", recording_t: 0 });
  console.log(`  [PART ${partIdx} start]`);
}
function logEvt(name) {
  if (_partStart === null) return;
  const rt = (Date.now() - _partStart) / 1000;
  _partEvents[_currentPart].push({ name, recording_t: Number(rt.toFixed(3)) });
  console.log(`  [EVT P${_currentPart} ${name.padEnd(28)} @ ${rt.toFixed(2)}s]`);
}
async function writeEventLog() {
  const eventLogPath = join(outBase, "take4_event_log.json");
  const allEvents = [];
  for (const part of Object.keys(_partEvents).sort((a,b) => Number(a)-Number(b))) {
    for (const ev of _partEvents[part]) {
      allEvents.push({ part: Number(part), ...ev });
    }
  }
  // Spec-aligned part_webm_offsets: skip webm preamble before first meaningful event.
  // Per take4_master_spec.json, each Part should start at master_t = sum(prev parts' allocated dur).
  // Offset = recording_t of "first visible content" event per part (skips page-load preamble).
  // Mapping (first-visible-content event per part):
  //   P1: "dashboard_visible" — first KPI tiles render
  //   P3: "phone_homescreen_visible" — Phone Lockscreen rendered
  //   P4: "inarbeit_view_post_visible" — Case-Detail rendered
  //   P5: "phone_sms_thread_visible" — Phone Day-2 thread rendered
  //   P6: "review_start" — Review page first render (no preamble usually)
  //   P7: "closing_start" — Dashboard rendered
  const FIRST_CONTENT_EVENT = {
    1: "dashboard_visible",
    3: "phone_homescreen_visible",
    4: "inarbeit_view_post_visible",
    5: "phone_sms_thread_visible",
    6: "review_start",
    7: "case_review_done_visible",  // skip Part 7 page-load preamble (FAIL @ master 85)
  };
  const part_webm_offsets = {};
  for (const [partStr, eventName] of Object.entries(FIRST_CONTENT_EVENT)) {
    const part = Number(partStr);
    const ev = (_partEvents[part] || []).find((e) => e.name === eventName);
    part_webm_offsets[part] = ev ? Math.max(0, ev.recording_t - 0.3) : 0; // -0.3s buffer
  }
  const log = {
    slug,
    recorder: "take4_event_logged_v2_offsets",
    generated_at: new Date().toISOString(),
    part_webm_offsets,
    events: allEvents,
  };
  await (await import("node:fs/promises")).writeFile(eventLogPath, JSON.stringify(log, null, 2));
  console.log(`\n✓ event_log: ${eventLogPath} (${allEvents.length} events, offsets=${JSON.stringify(part_webm_offsets)})`);
}

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
  // Parallel-safe OTP (01.06.): eindeutiger Code pro Slug + Delete NUR auf den
  // eigenen Code (sonst killen sich parallele Tenant-Runs den Code/used-Flag).
  const otpCode = `take4_${slug}`;
  // Root-Fix Parallel-Auth: die verify-code-Route macht admin.generateLink +
  // verifyOtp für DENSELBEN GoTrue-User (admin@flowsight.ch). Zwei gleichzeitige
  // Lanes kollidieren → eine bekommt 500 session_error (verifiziert 01.06.).
  // Retry-with-backoff+jitter de-synct die Lanes: die verlierende wartet kurz und
  // holt einen frischen Link, wenn keine andere gerade generiert. Skaliert auf N.
  const MAX = 8;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    await sb.from("otp_codes").delete().eq("email", email).eq("code", otpCode);
    await sb.from("otp_codes").insert({
      email, code: otpCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      used: false,
    });
    const resp = await fetch(`${baseUrl}/api/ops/auth/verify-code`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otpCode }),
    });
    if (resp.status === 200) return resp.headers.getSetCookie() || [];
    if (attempt === MAX) { console.error(`Auth failed after ${MAX} attempts (status ${resp.status})`); process.exit(1); }
    const backoff = 400 * attempt + Math.floor(Math.random() * 600);
    console.warn(`  ⚠ auth contention (status ${resp.status}), retry ${attempt}/${MAX} in ${backoff}ms`);
    await new Promise((r) => setTimeout(r, backoff));
  }
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
    // FB27 (31.05. PM): force greeting text to "Guten Morgen" via DOM-replace.
    // (real-time getGreeting() changes based on build-time; pipeline needs deterministic).
    // Non-invasive: only mutates the visible greeting span text, not Date globals.
    try {
      const fixGreeting = () => {
        document.querySelectorAll("*").forEach((el) => {
          if (el.children.length > 0) return;
          const t = el.textContent || "";
          if (/^Guten (Tag|Abend),/.test(t.trim())) {
            el.textContent = t.replace(/Guten (Tag|Abend)/, "Guten Morgen");
          }
        });
      };
      fixGreeting();
      setInterval(fixGreeting, 50);
      try {
        const obs = new MutationObserver(() => fixGreeting());
        obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      } catch {}
    } catch {}
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
      /* T4-V8 (31.05.): "Admin: back to workspace" Escape-Button im Sidebar weg */
      [data-owner-only="admin-back"] { display: none !important; }
      /* T4-V8d (31.05.): Cover bottom-left dev-badge mit sidebar-dark rect.
         FIX 31.05. PM: body::after wurde von nextjs-portal überlagert weil
         portal-host an <html> hängt (außerhalb body-stacking-context).
         Echter <div> auf documentElement via JS (siehe ensureDevBadgeCover). */
      #fs-devbadge-cover {
        position: fixed !important;
        bottom: 0 !important; left: 0 !important;
        width: 220px !important; height: 48px !important;
        background: rgb(0,5,15) !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        display: block !important;
      }
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
    // T4-V8e (31.05. PM): Dev-Badge-Cover als echter <div> auf documentElement.
    // body::after rendert NICHT über portal-host der an <html> hängt — daher
    // muss der Cover SELBST auf <html> sein, im selben stacking-context.
    const ensureDevBadgeCover = () => {
      const host = document.body || document.documentElement;
      if (!host) return;
      let cover = document.getElementById("fs-devbadge-cover");
      if (!cover) {
        cover = document.createElement("div");
        cover.id = "fs-devbadge-cover";
        cover.setAttribute("data-fs-purpose", "cover-devbadge");
      }
      // CRITICAL: re-append to make it LAST child of body — last-child wins
      // stacking-order when z-index is equal, AND positioned-element of
      // body's stacking context beats nextjs-portal that may be a sibling.
      if (cover.parentElement !== host || host.lastElementChild !== cover) {
        host.appendChild(cover);
      }
      // Inline style is final authority (CSS-rule may be defeated by portal).
      cover.style.cssText =
        "position:fixed !important;bottom:0 !important;left:0 !important;" +
        "width:240px !important;height:52px !important;" +
        "background:rgb(0,5,15) !important;" +
        "z-index:2147483647 !important;" +
        "pointer-events:none !important;display:block !important;" +
        "isolation:isolate !important;" +
        "transform:translateZ(0) !important;";
    };
    ensureDevBadgeCover();
    setInterval(ensureDevBadgeCover, 100);
    try {
      const obsCover = new MutationObserver(() => ensureDevBadgeCover());
      obsCover.observe(document.documentElement, { childList: true, subtree: false });
    } catch {}
    // T4-V8c (31.05.): Shadow-Root-Content leeren statt host removen.
    // Next.js re-erstellt den host wenn entfernt, aber shadow-root-innerHTML="" hält stand.
    const nukePortal = () => {
      document.querySelectorAll("nextjs-portal").forEach((p) => {
        try {
          if (p.shadowRoot) p.shadowRoot.innerHTML = "";
          p.setAttribute("style", "display:none!important;visibility:hidden!important;position:fixed;left:-99999px;top:-99999px;width:0;height:0;");
        } catch {}
      });
    };
    nukePortal();
    setInterval(nukePortal, 50);  // ~30fps cadence
    try {
      const obs = new MutationObserver(() => nukePortal());
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch {}
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
      // T4-V8 (31.05.): Inline-style override for nextjs-portal host element.
      // CSS rules can be overridden by :host { all: initial } inside shadow root,
      // so direct style attribute is the only reliable kill.
      try {
        document.querySelectorAll("nextjs-portal").forEach((p) => {
          p.setAttribute("style", "display:none !important;visibility:hidden !important;opacity:0 !important;pointer-events:none !important;position:fixed;left:-9999px;top:-9999px;");
        });
      } catch {}
      // Belt-and-suspenders text-match kill
      try {
        document.querySelectorAll("*").forEach((el) => {
          if (el.children.length > 5) return;
          const txt = (el.textContent || "").trim();
          if (txt.length > 30) return;
          if (/^\d*\s*Issues?$/i.test(txt) || /^Build Error$/i.test(txt) || /^\d+\s*errors?$/i.test(txt)) {
            let n = el;
            for (let i = 0; i < 8 && n; i++) {
              const cs = getComputedStyle(n);
              if (cs.position === "fixed" || cs.position === "absolute") {
                n.remove();
                return;
              }
              n = n.parentElement;
            }
            el.remove();
          }
        });
      } catch {}
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
  pinPartStart(1);
  logEvt("recording_start");

  // FB78: Start mit D1 Fallliste.
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(w(6500));  // +2s buffer für sauberen Einstieg (C15)
  try {
    const later = page.locator('button:has-text("Später")');
    if (await later.count() > 0) { await later.first().click(); await page.waitForTimeout(w(300)); }
  } catch {}
  logEvt("dashboard_visible");
  console.log("  D1: Fallübersicht sichtbar");
  // ── ANKER-ARCHITEKTUR (01.06.2026) ───────────────────────────────────────
  // akt1-Aktionen werden an FESTE Master-Zeiten geankert (= Dörfler R24, die Basis
  // des universellen Cursor-Layers) statt an blinde waitForTimeouts. Deterministisch:
  //   master(jetzt) = rt() − dashboardVisibleRt + 0.3
  // weil compose offset1 exakt auf dashboard_visible kalibriert (offset1 = dvRt − 0.3).
  // → der universelle Cursor sitzt bei JEDEM Betrieb zehntelsekunden-genau. Vorher
  // produzierten blinde Waits pro Betrieb eine andere Kadenz (Leins +0.85/+0.46 vs
  // Dörfler = holprig). Der Anker wartet nur (nie rückwärts); funktioniert, weil die
  // Aufnahme natürlich ≤ den Zielzeiten liegt.
  const nowRt = () => (Date.now() - _partStart) / 1000;  // recording_t wie in logEvt
  const dashboardVisibleRt = nowRt();
  const holdUntilMaster = async (M, label) => {
    const targetRt = dashboardVisibleRt + (M - 0.3);
    const remMs = (targetRt - nowRt()) * 1000;
    if (remMs > 0) { await page.waitForTimeout(remMs); }
    else { console.warn(`  ⚠ anchor "${label}" master ${M}s schon um ${(-remMs).toFixed(0)}ms überschritten (Aufnahme langsamer als Ziel)`); }
  };

  // ── Deterministischer Liste→Detail-Sprung (01.06.2026) ──────────────────
  // Problem: nach row.click rendert das Detail render-zeit-abhängig (0.4–1.4s) →
  // der sichtbare Sprung driftete pro Betrieb (Stark@~10, Leins@~11) → Cursor-Mismatch
  // 0:09–0:26. Fix: Liste als Screenshot-Overlay EINFRIEREN, Detail dahinter REAL
  // rendern lassen (zustands-gesteuert via waitFor), dann den Sprung exakt bei
  // kanonisch CASE_REVEAL_T enthüllen → für JEDEN Betrieb identisch, cursor-synchron.
  const CASE_REVEAL_T = 11.0; // Leins-Referenz (Founder-abgenommen), direkt vor Cursor-Bearbeiten @~11.4
  const detailReady = page.locator('button[title="Bearbeiten"]').first();
  const row = page.locator(`tr:has-text("${caseLabel}"), a:has-text("${caseLabel}")`).first();
  let rowFound = true;
  try { await row.scrollIntoViewIfNeeded(); } catch { rowFound = false; }
  // 01.06.2026 PARALLEL-HÄRTUNG: Freeze+Navigation FRÜH (master 8.0) statt 9.61.
  // Wurzel des Tenant-Jitters: Budget freeze→reveal war nur 1.39s; der Detail-Render
  // (detailReady.waitFor, render-zeit-abhängig) überschritt es pro Betrieb verschieden
  // (walter +53ms, weinberger +188ms) → holdUntilMaster(11.0) wartete NIE vorwärts →
  // Reveal driftete. Jetzt 3.0s Budget: Detail rendert mit Vorlauf hinter dem Overlay
  // fertig (~9.5), holdUntilMaster(11.0) wartet für JEDEN Betrieb vorwärts → Reveal
  // exakt @11.0, zehntelsekunden-genau & betriebsunabhängig. Frozen Liste = live Liste
  // (statisch) → optisch identisch; Cursor-Layer klickt unverändert ~9.6 darüber.
  await holdUntilMaster(8.0, "case_freeze_start");
  // 1. Liste einfrieren (Screenshot-Overlay über dem Viewport)
  try {
    const listShot = (await page.screenshot()).toString("base64");
    await page.evaluate((b64) => {
      const ov = document.createElement("div");
      ov.id = "fs-freeze-list";
      Object.assign(ov.style, { position: "fixed", inset: "0", zIndex: "2147483646",
        backgroundImage: `url(data:image/png;base64,${b64})`, backgroundSize: "cover", backgroundPosition: "center" });
      document.body.appendChild(ov);
    }, listShot);
  } catch (e) { console.warn("  freeze-overlay fail:", e.message); }
  // 2. Navigieren HINTER dem Overlay via SPA-DOM-Klick (KEIN goto, KEIN ?_hb=1).
  // 01.06. Lehre: goto?_hb=1 (Force-Save-Modus) unterdrückt den "Termin versenden"-
  // Button → Regression. DOM-.click() triggert die SPA-Navigation direkt am Element,
  // ignoriert die Overlay-Occlusion UND bleibt im Normalmodus (Versenden erscheint).
  const navOk = await page.evaluate((label) => {
    const el = [...document.querySelectorAll('tr, a, [role="row"]')].find((e) => (e.textContent || "").includes(label));
    if (!el) return false;
    (el.querySelector("a") || el).click();
    return true;
  }, caseLabel).catch(() => false);
  if (!navOk) { await page.goto(`${baseUrl}/ops/cases/${caseUuid}`, { waitUntil: "domcontentloaded" }).catch(() => {}); }
  // Auf ECHTEN Detail-Render warten (zustands-gesteuert, nicht Timer). Endet jetzt mit
  // Vorlauf (~master 9.0–9.5) weit vor dem 11.0-Reveal.
  await detailReady.waitFor({ state: "visible", timeout: 8000 }).catch(() => console.warn("  ⚠ detail render >8s"));
  logEvt("case_click");  // Telemetrie-Marker (visueller Cursor-Klick ~9.6 via Layer)
  // 3. Reveal exakt bei kanonisch 11.0s → deterministischer Sprung (wartet vorwärts)
  await holdUntilMaster(CASE_REVEAL_T, "case_detail_reveal");
  await page.evaluate(() => document.getElementById("fs-freeze-list")?.remove());
  logEvt("case_initial_neu_visible");
  console.log(`  → Detail-Sprung deterministisch @${CASE_REVEAL_T}s`);
  await holdUntilMaster(13.55, "bearbeiten_click");

  // Click Bearbeiten (pencil icon)
  try {
    await page.locator('button[title="Bearbeiten"]').first().click({ timeout: 5000 });
    logEvt("bearbeiten_click");
    console.log("  D3: Bearbeiten geklickt");
  } catch (e) { console.warn("  Bearbeiten fail:", e.message); }
  // MASTER-TIMING: REF macht Bearbeiten+Dropdown atomisch (<0,1s). Vorher 2,8s → 0,1s.
  await page.waitForTimeout(w(100));

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
      // FB1 (31.05.): Animierter Hover durch Optionen Neu→Geplant→In Arbeit→Warten→In Arbeit.
      // Cycle highlights um Mouse-Hover zu simulieren wie REF.
      const targetIdx = options.findIndex((o) => /in\s?arbeit/i.test(o.label));
      overlay.innerHTML = options.map((o, i) =>
        `<div data-opt-idx="${i}" style="padding:10px 14px;color:#1a1a1a;transition:background 80ms;">${o.label}</div>`
      ).join("");
      document.body.appendChild(overlay);
      // Hover sequence: Neu(0)→Geplant(1)→In Arbeit(2)→Warten(3)→In Arbeit(2 final)
      const hoverSeq = [0, 1, 2, 3, 2];
      const hoverDur = 600; // ms per option
      let stepIdx = 0;
      const cycle = () => {
        overlay.querySelectorAll("[data-opt-idx]").forEach((d) => {
          d.style.background = "";
          d.style.fontWeight = "";
        });
        const optIdx = hoverSeq[stepIdx];
        const el = overlay.querySelector(`[data-opt-idx="${optIdx}"]`);
        if (el) {
          el.style.background = "#eff6ff";
          el.style.fontWeight = "500";
        }
        stepIdx++;
        if (stepIdx < hoverSeq.length) setTimeout(cycle, hoverDur);
      };
      cycle();
    });
    logEvt("status_dropdown_open");
    console.log("  D4: Status-Dropdown animated hover (Neu→Geplant→In Arbeit→Warten→In Arbeit)");
  } catch (e) { console.warn("  Dropdown-overlay fail:", e.message); }
  // Anker status_inarbeit @16.99 (R24). Deckt die ~3.0s Hover-Animation (dropdown@~13.66 → 16.99 ≈ 3.3s).
  await holdUntilMaster(16.99, "status_inarbeit_set");

  try {
    // Close visual dropdown
    await page.evaluate(() => document.getElementById("fb96-dropdown")?.remove());
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption({ label: "In Arbeit" });
    logEvt("status_inarbeit_set");
    console.log("  D5/D6: Status → In Arbeit");
  } catch (e) { console.warn("  Status fail:", e.message); }
  // Anker Termin-Picker @19.2 (R24)
  await holdUntilMaster(19.2, "termin_picker_open");

  // Termin öffnen
  try {
    const terminInput = page.locator('input[placeholder*="Termin"], button:has-text("Termin wählen")').first();
    await terminInput.click({ timeout: 5000 });
    logEvt("termin_picker_open");
    console.log("  D7: Termin-Picker geöffnet");
  } catch (e) { console.warn("  Termin-Picker fail:", e.message); }
  // Spec M05 termin_picker 19.4-23.3 (3.9s) — picker hold before slot picking
  await page.waitForTimeout(w(1300));

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
    // FB2A (31.05.): Monatsübergangs-Bug Fix via DOM-traversal innerhalb des Pickers.
    // Picker uses unknown framework (lucide icons als SVG). Find next-arrow via heuristic:
    // it's the RIGHTMOST button in the calendar header (left of month label).
    const today = new Date();
    const apptDate = new Date(apptStart);
    const monthsForward = (apptDate.getFullYear() - today.getFullYear()) * 12
                         + (apptDate.getMonth() - today.getMonth());
    for (let i = 0; i < monthsForward; i++) {
      const clicked = await page.evaluate(() => {
        // FB2A-v2 (31.05. PM): Scoped DOM-traversal. NIEMALS globaler Button-Scan —
        // letzter Build hat dabei die Löschen-Trash-Icon-Button getroffen
        // → "Diesen Fall wirklich löschen?" Dialog im Video. NIE WIEDER.
        //
        // Strategie:
        //   1. Finde Element mit Text "Mai 2026" / "Juni 2026" etc. (month-label).
        //   2. Steige bis zum Calendar-Header-Container hoch (max 4 Levels).
        //   3. Suche Buttons NUR in diesem Container, nimm den, dessen
        //      bounding-rect.x > monthLabel.x liegt (= rechts davon).
        //   4. Fallback ist KEIN globaler Click — return null statt Risiko.
        const monthRegex = /(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+20\d{2}/;
        // Suche das Element mit dem KÜRZESTEN textContent das den Monat enthält
        // (Innermost label, nicht body). Picker-Header in r2_20s.png zeigt
        // "‹  Mai 2026  ›" — entweder in einem <button>/<div>, oder die 3
        // Teile in Geschwister-Elements.
        const allEls = [...document.querySelectorAll('*')];
        let labelEl = null;
        let labelTxtLen = 9999;
        for (const el of allEls) {
          const ts = (el.textContent || '').trim();
          if (ts.length > 40 || ts.length < 6) continue;
          if (!monthRegex.test(ts)) continue;
          // bevorzuge Elemente mit wenigen children + sichtbar
          if (el.children.length > 3) continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0 || r.y < 0 || r.y > 800) continue;
          if (ts.length < labelTxtLen) {
            labelEl = el; labelTxtLen = ts.length;
          }
        }
        if (!labelEl) return { found: null, reason: 'no-month-label' };
        const labelRect = labelEl.getBoundingClientRect();
        // Suche Container hoch
        let container = labelEl;
        for (let lvl = 0; lvl < 5; lvl++) {
          const btns = [...container.querySelectorAll('button')];
          if (btns.length >= 2) {
            // Nimm Button rechts vom Label
            const right = btns.filter(b => {
              const r = b.getBoundingClientRect();
              return r.x > labelRect.x + labelRect.width / 2
                  && Math.abs(r.y - labelRect.y) < 100
                  && r.width < 80 && r.height < 80;
            });
            if (right.length >= 1) {
              // Nimm den NÄCHSTEN (kleinster x über labelRect.right)
              right.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x);
              const tgt = right[0];
              const tr = tgt.getBoundingClientRect();
              tgt.click();
              return { found: 'scoped-next', x: Math.round(tr.x), y: Math.round(tr.y), w: Math.round(tr.width), lvl };
            }
          }
          container = container.parentElement;
          if (!container) break;
        }
        return { found: null, reason: 'no-scoped-button' };
      });
      console.log(`  Picker next-arrow attempt ${i+1}/${monthsForward}: ${JSON.stringify(clicked)}`);
      if (clicked.found === null) {
        console.warn(`  Picker month-nav ABORT: ${clicked.reason} — keine destruktive Fallback-Aktion.`);
        break;
      }
      await page.waitForTimeout(w(350));
    }
    if (monthsForward > 0) console.log(`  Picker: navigated ${monthsForward} month(s) forward → target ${apptDate.toISOString().slice(0,10)}`);
    const dayBtn = page.locator(`button, td, span`).filter({ hasText: new RegExp(`^${apptDay}$`) }).first();
    await dayBtn.click({ timeout: 3000 });
    await page.waitForTimeout(w(400));  // Slots rendern lassen
    // Anker Slot-Pick-START @21.64 (R24) — die ~0.52s von+bis-Sequenz endet dann mit
    // slots_set @~22.16 (= Dörfler R24). Absorbiert die variable Monats-Navigation davor.
    await holdUntilMaster(21.64, "termin_slots_start");
    // ROBUST slot pick (30.05.): bisSlot is usually LAST occurrence of bisStr
    // (after von-column "10:00" and any footer text "08:00-10:00").
    const vonSlot = page.locator(`text=/^${vonStr.replace(":", "\\:")}$/`).first();
    await vonSlot.scrollIntoViewIfNeeded().catch(() => {});
    await vonSlot.click({ timeout: 3000 });
    await page.waitForTimeout(w(400));
    // Try .last() first (typically BIS-column entry after VON entry), fallback to .nth(1)
    const bisAll = page.locator(`text=/^${bisStr.replace(":", "\\:")}$/`);
    const bisCount = await bisAll.count();
    let bisIdx = bisCount > 0 ? bisCount - 1 : 1; // .last() index, or fallback .nth(1)
    if (bisCount < 2) bisIdx = 0;
    const bisSlot = bisAll.nth(bisIdx);
    await bisSlot.scrollIntoViewIfNeeded().catch(() => {});
    await bisSlot.click({ timeout: 3000, force: true });
    logEvt("termin_slots_set");
    console.log(`  D8: ${vonStr}-${bisStr} gesetzt (bisIdx=${bisIdx}/${bisCount})`);
  } catch (e) { console.warn("  Slot fail:", e.message); }
  // Anker Übernehmen @24.01 (R24)
  await holdUntilMaster(24.01, "uebernehmen_click");

  try {
    await page.locator('button:has-text("Übernehmen")').first().click({ timeout: 3000 });
    logEvt("uebernehmen_click");
    console.log("  D9: Übernehmen");
  } catch {}
  // Spec M06 termin_set 23.3-23.8 (0.5s) — minimal wait before termin_versenden_click
  await page.waitForTimeout(w(500));
  logEvt("termin_versenden_btn_visible");

  // A11: "Termin versenden" klicken (statt Speichern+Trotzdem). Bei DEMO_NO_DISPATCH=1
  // setzt das Server-seitig appointment_sent_at + invite_sent-Event OHNE echten
  // SMS/E-Mail-Versand. Dadurch gibt's kein Warning-Banner im Save-Flow.
  try {
    const terminBtn = page.locator('button:has-text("Termin versenden")').first();
    await terminBtn.waitFor({ state: "visible", timeout: 4000 });
    await terminBtn.click({ timeout: 4000 });
    logEvt("termin_versenden_click");
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
  // MASTER-TIMING (30.05.): REF Apr 30 case_inarbeit_view phase = 4,8s (23,7-28,5).
  // FB24 (31.05. PM): 700ms war zu kurz — Backend insert von invite_sent fire-and-forget,
  // DB-write lief NACH patchLatestEventTime → invite_sent zeigte Live-Time (14:49) statt 09:02.
  // Wait erhöht auf 2500ms + patch wiederholt nach Reload als belt-and-suspenders.
  await page.waitForTimeout(w(2500));

  // C3: Alle Events der "In Arbeit + Termin"-Aktion auf reminderSent patchen.
  // FB24: invite_sent + melder_termin_notified MUSS Reminder-Zeit (09:02) sein damit
  // Verlauf "Termineinladung gesendet · 31.05, 09:02" zeigt (nicht Live-Time).
  const demoNowIso = config._demo_now || new Date().toISOString();
  const reminderIso = config._reminder_time || demoNowIso;
  const confirmationIso = config._confirmation_sent_time || demoNowIso;
  await patchLatestEventTime(caseUuid, "invite_sent", reminderIso);
  await patchLatestEventTime(caseUuid, "melder_termin_notified", reminderIso);
  await patchLatestEventTime(caseUuid, "fields_updated", demoNowIso);
  await patchLatestEventTime(caseUuid, "status_changed", demoNowIso);  // Neu→In Arbeit
  await patchLatestEventTime(caseUuid, "assignee_assignment", demoNowIso);
  // FB24 (31.05. PM): Bestätigungs-SMS-Event (sms_sent) auch fixen — sonst Live-Time im Verlauf.
  await patchLatestEventTime(caseUuid, "sms_sent", confirmationIso);
  await patchLatestEventTime(caseUuid, "case_created", confirmationIso);
  // Reload damit Verlauf patched Zeiten zeigt
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(w(1200));
  // FB24 retry: patch invite_sent ein 2. Mal nach Reload (falls erstes Mal race condition)
  await patchLatestEventTime(caseUuid, "invite_sent", reminderIso);
  await patchLatestEventTime(caseUuid, "melder_termin_notified", reminderIso);
  await patchLatestEventTime(caseUuid, "sms_sent", confirmationIso);
  await patchLatestEventTime(caseUuid, "case_created", confirmationIso);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(w(800));
  logEvt("inarbeit_view_visible");

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
  pinPartStart(2);
  logEvt("cut_start");
  await page.goto("file:///" + tmpHtml.replace(/\\/g, "/"));
  await page.waitForTimeout(w(1400));
  logEvt("cut_end");

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
  // GB19 (31.05. PM): Datum-Format = "Sonntag, 31. Mai" (Take 2 Style), NICHT "31.05".
  const DE_WEEKDAYS = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  const DE_MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const longDateDE = (d) => `${DE_WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${DE_MONTHS[d.getMonth()]}`;
  const urlParams = new URLSearchParams({
    firma: t.name,
    telefon: displayPhone,
    sms_sender: t.name,
    case_ref: caseLabel,
    uhrzeit: String(rD.getHours()).padStart(2, "0") + ":" + String(rD.getMinutes()).padStart(2, "0"),
    datum: longDateDE(rD),
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
  pinPartStart(3);
  logEvt("phone_day1_start");
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

  // FB7 (31.05.): Phone-clock UND SMS-timestamp MÜSSEN identisch sein (Vertrauen).
  // Persistent setInterval forced — Template könnte clock später überschreiben via applyConfig.
  await page.evaluate((args) => {
    if (window.showScreen) window.showScreen("homescreen");
    // Persistent clock-force via interval to overwrite any subsequent template updates
    window.__forceClockTime = args.barTime;
    if (window.__forceClockInterval) clearInterval(window.__forceClockInterval);
    window.__forceClockInterval = setInterval(() => {
      document.querySelectorAll(".clock-display").forEach((el) => { el.textContent = window.__forceClockTime; });
    }, 80);
    if (window.updateAllClocks) window.updateAllClocks(args.barTime);
    // REF FB17 (31.05. PM): Bestätigungs-SMS Timestamp = bestaetTime (08:08),
    // NICHT phone-clock-barTime (09:02). FB7-Identität gilt nur Phone-Clock = Reminder-SMS.
    const timestampEl = document.getElementById("sms-timestamp");
    if (timestampEl) timestampEl.textContent = args.bestaetTime;
    const dayEl = document.getElementById("sms-day");
    if (dayEl) dayEl.innerHTML = `${args.bestaetDay} · <span id="sms-time">${args.bestaetTime}</span>`;
    if (window.showSmsNotification) window.showSmsNotification();
  }, { barTime: rTime, bestaetDay: bestaetDayLabel, bestaetTime: bestaetHHMM });
  logEvt("phone_homescreen_visible");
  console.log(`  Homescreen ${rTime} + Bestätigungs-SMS ${bestaetDayLabel} ${bestaetHHMM}`);
  await page.waitForTimeout(w(2200));
  logEvt("sms_notif_visible");

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
  logEvt("sms_thread_opened");
  console.log(`  → SMS-Thread mit Reminder (Termin ${apptHHMM}, ${terminAdresse})`);
  // Spec take4_master_spec.json: P01 phone_day1_reminder duration 6.5s. Extend hold.
  await page.waitForTimeout(w(3200));
  logEvt("phone_day1_end");

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
  pinPartStart(4);
  logEvt("recording_start");

  await page.goto(`${baseUrl}/ops/cases/${caseUuid}?_hb=1`, { waitUntil: "domcontentloaded" });
  // FB Zone4: Log inarbeit_view_post_visible early, then hold ~5s in settled view
  // before opening edit-mode. REF master 33.5-39 = 5.5s closed-form period.
  await page.waitForTimeout(w(800));
  logEvt("inarbeit_view_post_visible");
  await page.waitForTimeout(w(4500));
  try {
    const later = page.locator('button:has-text("Später")');
    if (await later.count() > 0) { await later.first().click(); await page.waitForTimeout(w(300)); }
  } catch {}

  // Bearbeiten (now ~5s after inarbeit_view_post_visible event)
  try {
    await page.locator('button[title="Bearbeiten"]').first().click({ timeout: 5000 });
    logEvt("bearbeiten2_click");
    console.log("  D11: Bearbeiten");
  } catch {}
  await page.waitForTimeout(w(1000));

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
      // FB8 (31.05.): Animierter Hover durch Optionen Status #2 — letztes step Erledigt.
      const targetIdx = options.findIndex((o) => /erledigt/i.test(o.label));
      overlay.innerHTML = options.map((o, i) =>
        `<div data-opt2-idx="${i}" style="padding:10px 14px;color:#1a1a1a;transition:background 80ms;">${o.label}</div>`
      ).join("");
      document.body.appendChild(overlay);
      // Hover sequence: In Arbeit(current,2)→Warten(3)→Erledigt(4)
      const hoverSeq = [2, 3, 4];
      const hoverDur = 700;
      let stepIdx = 0;
      const cycle = () => {
        overlay.querySelectorAll("[data-opt2-idx]").forEach((d) => {
          d.style.background = "";
          d.style.fontWeight = "";
        });
        const optIdx = hoverSeq[stepIdx];
        const el = overlay.querySelector(`[data-opt2-idx="${optIdx}"]`);
        if (el) {
          el.style.background = "#eff6ff";
          el.style.fontWeight = "500";
        }
        stepIdx++;
        if (stepIdx < hoverSeq.length) setTimeout(cycle, hoverDur);
      };
      cycle();
    });
    logEvt("status_dropdown2_open");
    console.log("  D12: Status-Dropdown #2 animated hover (In Arbeit→Warten→Erledigt)");
  } catch (e) { console.warn("  Dropdown-overlay fail:", e.message); }
  await page.waitForTimeout(w(2400)); // = 3*700ms + 300ms buffer

  try {
    await page.evaluate(() => document.getElementById("fb96-dropdown2")?.remove());
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption({ label: "Erledigt" });
    logEvt("status_erledigt_set");
    console.log("  D13: Status → Erledigt");
  } catch (e) { console.warn("  Status fail:", e.message); }
  // FB9 (31.05.): Speichern soll @ master 43.0 sein. Status_erledigt_set @ ~master 42.5,
  // Speichern click ~0.5s später. Reduced 1700→400ms.
  await page.waitForTimeout(w(400));

  // A12 Step 1: "Speichern" oben — Termin wurde nicht geändert, also kein Warning.
  try {
    await page.locator('button:has-text("Speichern")').first().click({ timeout: 3000 });
    logEvt("erledigt_speichern_click");
    console.log("  D14: Speichern oben (Status → Erledigt wird persistiert)");
  } catch {}
  await page.waitForTimeout(w(1000));
  // Fallback: Trotzdem falls Warning trotz allem auftaucht
  try {
    const trotzdem = page.locator('button:has-text("Trotzdem speichern")');
    if (await trotzdem.count() > 0) await trotzdem.first().click({ timeout: 1500 });
  } catch {}
  await page.waitForTimeout(w(1000));

  // A12 Step 2: Scroll runter zum Verlauf/Bewertung-Bereich.
  try {
    const verlaufHeader = page.locator('h3:has-text("Verlauf")').first();
    await verlaufHeader.scrollIntoViewIfNeeded({ timeout: 3000 });
    console.log("  D14b: Scroll zu Verlauf");
  } catch (e) { console.warn("  Scroll fail:", e.message); }
  // FB Zone4: Log bewertung_pre_visible BEFORE the settle so the phase mapping
  // has real "button visible, not clicked" time before click event.
  // Schedule-tuned: case_bewertung_pre = master 44.8-49.8 (5s window, ends with click).
  logEvt("bewertung_pre_visible");
  await page.waitForTimeout(w(2500));

  // A12 Step 3: "Bewertung anfragen"-Button klicken.
  try {
    await page.locator('button:has-text("Bewertung anfragen")').first().click({ timeout: 5000 });
    logEvt("bewertung_anfragen_click");
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
  // Zone5-Hold: extend post-click visibility to fill Part 4's 33.5s schedule slot.
  // Master 49.8-67.0 (17.2s) shows "Bewertung angefragt" + Verlauf-patched-times.
  await page.waitForTimeout(w(8500));
  logEvt("akt2_end");

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
    // GB19 (31.05. PM): Datum-Format = "Sonntag, 31. Mai" (Take 2 Style)
    datum: (() => {
      const DE_WD = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
      const DE_MO = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
      return `${DE_WD[reviewSentD.getDay()]}, ${reviewSentD.getDate()}. ${DE_MO[reviewSentD.getMonth()]}`;
    })(),
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
  pinPartStart(5);
  logEvt("phone_day2_start");
  await page.addInitScript(() => { window.__t4PhoneMode = true; });
  await page.goto(fullUrl);
  await page.waitForTimeout(w(300));
  // FB24-followup (31.05. PM): Phone-Day-2 clock muss = statusBarHHMM (09:04) sein.
  // Template setzt sms-screen .clock-display auf smsTime = uhrzeit + (anrufDauer/60+1) → 09:08.
  // Forcing clock via setInterval (gleicher Pattern wie Phone-Day-1).
  await page.evaluate((args) => {
    window.__forceClockTime = args.statusBarTime;
    if (window.__forceClockInterval) clearInterval(window.__forceClockInterval);
    window.__forceClockInterval = setInterval(() => {
      document.querySelectorAll(".clock-display").forEach((el) => { el.textContent = window.__forceClockTime; });
    }, 80);
  }, { statusBarTime: statusBarHHMM });
  logEvt("phone_sms_thread_visible");

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
  logEvt("phone_day2_end");

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

  // FB26 (31.05. PM): Chrome via initScript mit setInterval-retry — fires sobald body
  // existiert (frame 1). Vorher: 500ms-Wait + page.evaluate = >1s Delay sichtbar.
  // padding-top 96px (status-bar 36 + 60px gap zu "Dörfler AG" header) per Founder-Wunsch.
  const reviewClockText = (() => {
    const t = new Date(config._review_sent_time || config._reminder_time || Date.now());
    return new Intl.DateTimeFormat("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" }).format(t);
  })();
  await context.addInitScript((args) => {
    const css = `
      body { padding-top: 96px !important; padding-bottom: 56px !important; margin: 0 !important; }
      nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast],
      button[data-nextjs-dev-tools-button] { display: none !important; }
    `;
    const STATUS_BAR_HTML =
      `<span>${args.clock}</span>` +
      `<span style="display:flex;align-items:center;gap:6px;">` +
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1a1a" opacity="0.9"><path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0z"/></svg>` +
        `<svg width="15" height="12" viewBox="0 0 24 20" fill="#1a1a1a"><path d="M12 3C7.5 3 3.4 4.8 0 7.4l12 15 12-15C20.6 4.8 16.5 3 12 3z"/></svg>` +
        `<svg width="14" height="12" viewBox="0 0 24 18" fill="#1a1a1a"><rect x="1" y="12" width="3" height="5"/><rect x="6" y="8" width="3" height="9"/><rect x="11" y="4" width="3" height="13"/><rect x="16" y="0" width="3" height="17"/></svg>` +
        `<span style="background:#2a2a2a;color:#fff;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;display:inline-flex;align-items:center;gap:2px;"><svg width="7" height="10" viewBox="0 0 24 24" fill="#22c55e"><path d="M7 2v11h3v9l7-12h-4l3-8z"/></svg>71</span>` +
      `</span>`;
    const STATUS_BAR_STYLE =
      "position:fixed !important;top:0 !important;left:0 !important;right:0 !important;" +
      "height:36px !important;background:#ffffff !important;" +
      "display:flex !important;justify-content:space-between !important;align-items:center !important;" +
      "padding:8px 48px 4px !important;z-index:2147483647 !important;" +
      "font-family:'SamsungOne','Segoe UI',sans-serif !important;" +
      "font-size:13px !important;color:#1a1a1a !important;font-weight:500 !important;" +
      "box-sizing:border-box !important;";
    const NAV_BAR_STYLE =
      "position:fixed !important;bottom:0 !important;left:0 !important;right:0 !important;" +
      "height:48px !important;background:#ffffff !important;" +
      "display:flex !important;justify-content:center !important;align-items:center !important;" +
      "gap:90px !important;z-index:2147483647 !important;" +
      "color:#5f6368 !important;font-size:18px !important;box-sizing:border-box !important;";
    const inject = () => {
      const root = document.documentElement;
      if (!document.getElementById("t4-review-css") && document.head) {
        const s = document.createElement("style");
        s.id = "t4-review-css"; s.textContent = css;
        document.head.appendChild(s);
      }
      if (!root) return;
      let sb = document.getElementById("t4-review-statusbar");
      if (!sb) {
        sb = document.createElement("div");
        sb.id = "t4-review-statusbar";
        sb.innerHTML = STATUS_BAR_HTML;
      }
      sb.style.cssText = STATUS_BAR_STYLE;
      if (sb.parentElement !== root) root.appendChild(sb);
      let nb = document.getElementById("t4-review-navbar");
      if (!nb) {
        nb = document.createElement("div");
        nb.id = "t4-review-navbar";
        nb.innerHTML = `<span>|||</span><span>○</span><span>&lt;</span>`;
      }
      nb.style.cssText = NAV_BAR_STYLE;
      if (nb.parentElement !== root) root.appendChild(nb);
    };
    // Run as early as possible — even before DOMContentLoaded
    inject();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inject, { once: true });
    }
    setInterval(inject, 80);  // FB26: 80ms = ~12fps anchor refresh, zehntelsekunden-flüssig
  }, { clock: reviewClockText });

  const page = await context.newPage();
  pinPartStart(6);
  logEvt("review_start");
  await page.goto(reviewUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(w(2000));
  logEvt("rating_intro_visible");
  // HINWEIS (02.06.): Der Stern-Fill-Zeitpunkt dieser Live-Aufnahme jittert (recordVideo-
  // Latenz). Das wird NICHT hier gelöst, sondern deterministisch in der finalen Pipeline:
  // apply_canonical_stars.mjs legt die farb-neutrale Stern-Innenregion von Stark (Gold-
  // Referenz) im fixen Fenster über den Master → Stern-Slot millisekunde-gleich für alle,
  // Header/Brand-Farbe/Fall bleiben per-Tenant. Warm-up/Scene-Anker verworfen (war fummelig).
  console.log("  Review-Page geladen (initial state, chrome via initScript)");

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
    logEvt("rating_stars_clicked");
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
    logEvt("rating_submit_click");
    console.log("  Bewertung abschliessen → Done-View");
  } catch (e) { console.warn("  Submit fail:", e.message); }
  // Spec take4_master_spec.json: P02 phone_day2 + Done-View total 13.0s (master 72-85).
  // Extend done-view hold to fill Part 6 slot.
  await page.waitForTimeout(w(3700));
  logEvt("review_done_visible");

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
  pinPartStart(7);
  logEvt("closing_start");

  // Case-Detail zuerst — Spec M19 review_done_view 85.0-89.2 (4.2s)
  await page.goto(`${baseUrl}/ops/cases/${caseUuid}?_hb=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(w(4000));
  logEvt("case_review_done_visible");
  console.log("  Closing: Case-Detail mit Gold-Review");
  // Spec: case visible until master 89.2 (4.2s after start at 85). Then transition.
  // case_review_done @ master 85 (after offset). Tuned: 2.7s case-hold + page.goto ~1.5s → dashboard @ master ~89.2.
  await page.waitForTimeout(w(2700));

  // Fallübersicht — Spec M20 dashboard_final 89.2-96.9
  await page.goto(`${baseUrl}/ops/cases`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(w(800));
  logEvt("dashboard_final_visible");
  console.log("  Closing: Fallübersicht mit Gold-Case");
  // Hold dashboard ~7s (M20 lasts 89.2-96.9 = 7.7s)
  await page.waitForTimeout(w(7000));
  logEvt("closing_end");

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

await writeEventLog();

console.log("\n=== Take 4 Recording Complete (7 parts, A19 close-circle entfernt) ===\n");
