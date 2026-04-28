/**
 * pipelineHydration.mjs — Universal Hydration Barrier (§33 der Pipeline-Bible).
 *
 * Zweck: Eine einzige Quelle für alle Hydration-Barriers + Universal-Context-
 * Patches die jede Pipeline-Recording-Szene braucht. Ersetzt pro-Script-
 * Duplikate (Date-Patch, Dev-Badge-Kill, Tenant-Switcher-Kill, Grey/Brand-
 * Overlay-Gate).
 *
 * Die Regel (§33):
 *   "Kein Frame wird im Video sichtbar, bevor die Szene visuell final ist."
 *
 * Exports:
 *   installDeterministicContext(context, { demoIso })
 *     → Date-Pin + Dev-Kill + TenantSwitcher-Kill + Push-Dismiss
 *     → Einmal pro BrowserContext am Anfang jeder Recording-Szene aufrufen.
 *
 *   createHydrationBarrier({ bg, minHoldMs, maxHoldMs, requiredSelectors,
 *                            requiredStyles, stableFramesNeeded, fadeMs,
 *                            overlayId })
 *     → Gibt einen addInitScript-String zurück, der beim Page-Load einen
 *       Overlay einblendet und aktiv wartet bis das Layout stabil ist.
 *     → Via `await context.addInitScript(barrier)` oder
 *           `await page.addInitScript(barrier)` aktivieren.
 *
 * Konvention: Jede Recording-Szene ruft GENAU diese Funktionen auf — keine
 * eigenen Overlays oder Date-Patches mehr duplizieren.
 */

/**
 * Installiert alle universellen Context-Patches auf einem Playwright-Context.
 * MUSS vor dem ersten page.goto() aufgerufen werden.
 *
 * @param {import("playwright").BrowserContext} context
 * @param {object} opts
 * @param {string} opts.demoIso - ISO-Zeitstring auf den Date.now() + new Date() gepinnt werden
 * @param {boolean} [opts.killTenantSwitcher=true] - Tenant-Dropdown ausblenden (Default: ja)
 * @param {boolean} [opts.killWarningBanner=true] - "Benachrichtigungen noch nicht versendet" kollabieren
 */
export async function installDeterministicContext(context, opts) {
  const { demoIso, killTenantSwitcher = true, killWarningBanner = true } = opts;
  if (!demoIso) throw new Error("installDeterministicContext requires opts.demoIso");

  // 1. FB43 Date-Pin
  await context.addInitScript((demoIsoArg) => {
    const FAKE_NOW = new Date(demoIsoArg).getTime();
    const OrigDate = Date;
    function FakeDate(...args) {
      if (!(this instanceof FakeDate)) return new OrigDate(FAKE_NOW).toString();
      if (args.length === 0) return Reflect.construct(OrigDate, [FAKE_NOW], FakeDate);
      return Reflect.construct(OrigDate, args, FakeDate);
    }
    FakeDate.prototype = OrigDate.prototype;
    FakeDate.now = () => FAKE_NOW;
    FakeDate.parse = OrigDate.parse;
    FakeDate.UTC = OrigDate.UTC;
    Object.setPrototypeOf(FakeDate, OrigDate);
    globalThis.Date = FakeDate;
  }, demoIso);

  // 2. FB38a Dev-Badge-Kill (customElements + attachShadow intercept + aggressive remove)
  //    + FB44 Tenant-Switcher-Kill
  //    + FB104 Warning-Banner-Collapse
  //    + Push-Onboarding-Dismiss
  await context.addInitScript((args) => {
    const { killTS, killWarn } = args;

    // Push-Onboarding aus dem Weg
    try {
      localStorage.setItem("ops-push-onboarding-dismissed", Date.now().toString());
    } catch {}

    // Dev-Badge Registration-Intercept — KILLT nextjs-portal bevor es aktiv wird
    try {
      const origDefine = customElements.define.bind(customElements);
      customElements.define = function (name, ctor, options) {
        if (typeof name === "string" && name.toLowerCase().startsWith("nextjs-")) return;
        return origDefine(name, ctor, options);
      };
    } catch {}
    try {
      const origAttach = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function (optsAttach) {
        if (this.tagName && this.tagName.toLowerCase().startsWith("nextjs-")) {
          return document.createDocumentFragment();
        }
        return origAttach.call(this, optsAttach);
      };
    } catch {}

    // Base-CSS (immer gesetzt)
    const baseCss = [
      // FB76/Dev-Badges aggressiv weg
      "nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast], [data-nextjs-toast-wrapper],",
      "[class*='nextjs'], [id*='nextjs'], [class*='__next'],",
      "button[data-nextjs-dev-tools-button], [data-issues-collapsed], [data-issues],",
      "[aria-label*='issue' i], [aria-label*='Dev Tools' i],",
      "button[data-sentry], [data-error-toast], .sentry-feedback,",
      "[class*='sentry'], [data-testid*='sentry']",
      "{ display: none !important; visibility: hidden !important; opacity: 0 !important; }",
    ].join("\n");

    // FB44: Tenant-Switcher robust unterdrücken (Selector disambiguiert, Kaskadenschutz)
    const switcherCss = killTS ? [
      "[data-owner-only='tenant-switcher'],",
      "[data-owner-only='tenant-switcher'] * {",
      "  display: none !important; visibility: hidden !important;",
      "  opacity: 0 !important; height: 0 !important; max-height: 0 !important;",
      "  overflow: hidden !important; pointer-events: none !important;",
      "  position: absolute !important; left: -99999px !important;",
      "}",
    ].join("\n") : "";

    // FB104: Warning-Banner (amber/yellow) kollabieren
    const warnCss = killWarn ? [
      "[class*='bg-yellow-50'], [class*='bg-amber-50'],",
      "[class*='border-yellow-200'], [class*='border-amber-200'],",
      "div[style*='#fef3c7'], div[style*='#fef08a'], div[style*='#fffbeb']",
      "{ display: none !important; }",
    ].join("\n") : "";

    const css = baseCss + "\n" + switcherCss + "\n" + warnCss;
    const inject = () => {
      let s = document.getElementById("fs-pipeline-base-css");
      if (!s) {
        s = document.createElement("style");
        s.id = "fs-pipeline-base-css";
        (document.head || document.documentElement).appendChild(s);
      }
      if (s.textContent !== css) s.textContent = css;
    };
    inject();
    setInterval(inject, 120);

    // Aggressiver DOM-Remove für Elemente die trotz CSS durchschlüpfen
    const aggressiveKill = () => {
      document.querySelectorAll(
        "nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button], " +
        "[data-issues-collapsed], [data-issues]"
      ).forEach((el) => { try { el.remove(); } catch {} });
      if (killTS) {
        document.querySelectorAll("[data-owner-only='tenant-switcher']").forEach((el) => {
          try { el.remove(); } catch {}
        });
      }
      // Fixed-Position Badges bottom-left
      document.querySelectorAll("body > div, body > button, html > nextjs-portal")
        .forEach((el) => {
          try {
            const s = getComputedStyle(el);
            if (s.position !== "fixed") return;
            const txt = (el.textContent || "").toLowerCase();
            const bottom = parseInt(s.bottom) || 0;
            const left = parseInt(s.left) || 0;
            if (bottom < 80 && left < 80 && /issue|error|warn/.test(txt)) el.remove();
          } catch {}
        });
    };
    aggressiveKill();
    setInterval(aggressiveKill, 80);

    // MutationObserver für dynamisch hinzugefügte Badges
    const observer = new MutationObserver(() => aggressiveKill());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }, { killTS: killTenantSwitcher, killWarn: killWarningBanner });
}

/**
 * Generiert einen addInitScript-String der einen Full-Screen-Overlay einblendet
 * und aktiv wartet bis die Szene visuell final ist (Layout stabil + required
 * selectors + required computed styles).
 *
 * Rückgabe ist ein String — kann direkt in `context.addInitScript(barrier)`
 * oder `page.addInitScript(barrier)` verwendet werden.
 *
 * @param {object} opts
 * @param {string} [opts.bg="#0b1220"] - Overlay-Farbe (matcht vorherigen Frame!)
 * @param {number} [opts.minHoldMs=2500] - Minimum-Hold
 * @param {number} [opts.maxHoldMs=7000] - Safety-Net
 * @param {number} [opts.stableFramesNeeded=5] - Layout-Hash stabile Frames
 * @param {number} [opts.frameIntervalMs=100] - Check-Intervall
 * @param {number} [opts.fadeMs=500] - Fade-Out-Dauer
 * @param {string} [opts.overlayId="fs-hydration-barrier"] - DOM-ID
 * @param {string} [opts.hashSelector] - CSS-Selector für Layout-Hash-Ziele (darf ",.." getrennt sein)
 * @param {string[]} [opts.requiredSelectors=[]] - Selectors die existieren müssen
 * @param {Array<{selector:string, prop:string, min:number}>} [opts.requiredStyles=[]] - Computed-Style-Schwellen
 * @param {boolean} [opts.waitFonts=true] - document.fonts.ready abwarten
 * @returns {string} JavaScript-Quellcode für addInitScript
 */
export function createHydrationBarrier(opts = {}) {
  const {
    bg = "#0b1220",
    minHoldMs = 2500,
    maxHoldMs = 7000,
    stableFramesNeeded = 5,
    frameIntervalMs = 100,
    fadeMs = 500,
    overlayId = "fs-hydration-barrier",
    hashSelector = ".grid > *, [class*='flow'] button, [class*='flow'] span, h1, h2, select, .min-h-dvh",
    requiredSelectors = [],
    requiredStyles = [],
    waitFonts = true,
  } = opts;

  // Validierung
  for (const r of requiredStyles) {
    if (!r.selector || !r.prop) {
      throw new Error("requiredStyles entries need { selector, prop, min }");
    }
  }

  // Als String generieren — addInitScript bekommt keinen Closure-Access auf Node-Variablen
  return `
    (function(){
      var CFG = ${JSON.stringify({
        bg, minHoldMs, maxHoldMs, stableFramesNeeded, frameIntervalMs, fadeMs,
        overlayId, hashSelector, requiredSelectors, requiredStyles, waitFonts,
      })};

      var overlay = document.createElement('div');
      overlay.id = CFG.overlayId;
      overlay.style.cssText =
        'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;' +
        'background:' + CFG.bg + ';opacity:1;' +
        'transition:opacity ' + CFG.fadeMs + 'ms ease-out;' +
        'pointer-events:none;';
      (document.documentElement || document.body).appendChild(overlay);

      var startedAt = performance.now();
      var lastHash = '';
      var stableFrames = 0;
      var fontsReady = !CFG.waitFonts;
      if (CFG.waitFonts) {
        try {
          if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
            document.fonts.ready.then(function(){ fontsReady = true; });
          } else { fontsReady = true; }
        } catch(e) { fontsReady = true; }
      }

      function hashLayout() {
        var nodes = document.querySelectorAll(CFG.hashSelector);
        var h = '';
        nodes.forEach(function(n){
          var r = n.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          var txt = (n.textContent || '').replace(/\\s+/g, ' ').slice(0, 40);
          h += Math.round(r.top) + 'x' + Math.round(r.left) + 'x' +
               Math.round(r.width) + 'x' + Math.round(r.height) + '|' + txt + '||';
        });
        return h;
      }

      function requiredSelectorsOk() {
        for (var i = 0; i < CFG.requiredSelectors.length; i++) {
          if (!document.querySelector(CFG.requiredSelectors[i])) return false;
        }
        return true;
      }

      function requiredStylesOk() {
        for (var i = 0; i < CFG.requiredStyles.length; i++) {
          var rs = CFG.requiredStyles[i];
          var el = document.querySelector(rs.selector);
          if (!el) return false;
          var v;
          if (rs.prop === 'height' || rs.prop === 'width') {
            var rect = el.getBoundingClientRect();
            v = rs.prop === 'height' ? rect.height : rect.width;
          } else {
            v = parseFloat(getComputedStyle(el)[rs.prop]) || 0;
          }
          if (v < (rs.min || 0)) return false;
        }
        return true;
      }

      function fadeOut() {
        overlay.style.opacity = '0';
        setTimeout(function(){ try { overlay.remove(); } catch(e) {} }, CFG.fadeMs + 100);
      }

      function check() {
        var elapsed = performance.now() - startedAt;

        var currentHash = hashLayout();
        if (currentHash && currentHash === lastHash) stableFrames++;
        else { stableFrames = 0; lastHash = currentHash; }
        var layoutStable = stableFrames >= CFG.stableFramesNeeded;

        var ready =
          elapsed >= CFG.minHoldMs &&
          fontsReady &&
          layoutStable &&
          requiredSelectorsOk() &&
          requiredStylesOk();

        if (ready || elapsed >= CFG.maxHoldMs) fadeOut();
        else setTimeout(check, CFG.frameIntervalMs);
      }
      setTimeout(check, Math.min(400, CFG.minHoldMs / 2));
    })();
  `;
}

/**
 * Convenience-Funktion: Leitsystem-App-Open Barrier (Brand-Color-BG, wartet
 * auf SystemCard-Ring + stabiles FlowBar-Grid).
 *
 * @param {string} brandColor - Tenant brand color (#003478 etc.)
 * @returns {string}
 */
export function createLeitsystemBarrier(brandColor) {
  return createHydrationBarrier({
    bg: brandColor,
    minHoldMs: 4500,
    maxHoldMs: 8000,
    requiredSelectors: [
      // SystemCard-Ring ODER KPI-Card mit Ziffer
      "svg circle[stroke-dasharray], [class*='ring']",
    ],
    overlayId: "fs-leitsystem-barrier",
  });
}

/**
 * Convenience-Funktion: Review-Page Barrier (Grey-BG, wartet auf padding,
 * Brand-Bar und Firmen-Heading).
 *
 * @returns {string}
 */
export function createReviewBarrier() {
  return createHydrationBarrier({
    bg: "#f3f4f6",
    minHoldMs: 2000,
    maxHoldMs: 5000,
    requiredSelectors: [
      ".min-h-dvh.bg-gray-100",
      "h1, h2, .text-xl, .font-bold",
    ],
    requiredStyles: [
      { selector: ".min-h-dvh.bg-gray-100", prop: "paddingTop", min: 100 },
      { selector: ".h-1\\.5", prop: "height", min: 3 },
    ],
    overlayId: "fs-review-barrier",
  });
}
