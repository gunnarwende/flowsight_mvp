/**
 * recording_cursor.mjs — Realistic mouse-cursor overlay for Playwright recordings.
 *
 * Why custom overlay (not page.mouse.move):
 *   - Headless Chromium does not render the system cursor into the recording.
 *   - Custom overlays (dropdowns, modals) don't react to native hover events.
 *   - We need full control over path, easing, click-press animation, and hotspot.
 *
 * Realism principles (Fitts' law + observed human mouse behavior):
 *   1. Bezier path with subtle perpendicular curvature (humans don't move in straight lines)
 *   2. Easing with overshoot + settle (real mouse decelerates past target then snaps back)
 *   3. Speed scales with distance (long sweeps faster, micro-adjustments slower)
 *   4. Click-press animation (cursor briefly scales 0.88x, ~70ms, then back)
 *   5. Pre-click hesitation (80-220ms random — humans pause before committing)
 *   6. Slight off-center landing (humans never click dead-center pixels)
 *   7. Idle micro-drift (between actions, cursor wanders 1-3px)
 *
 * Usage:
 *   import { injectCursor, clickWithCursor, moveCursorToLocator, hoverEmphasize } from "./_lib/recording_cursor.mjs";
 *
 *   await injectCursor(page, { startX: 200, startY: 700 });          // once at recording start
 *   await clickWithCursor(page, page.locator('button'));              // smooth move + click
 *   await moveCursorToLocator(page, page.locator('h1'));              // hover/point at element
 *   await hoverEmphasize(page, page.locator('.kpi-card'), 1500);      // dwell + small circle (=hinweisen)
 *   await moveCursorTo(page, 500, 300, { ms: 600 });                  // direct pixel coordinates
 */

const CURSOR_SVG = `
<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" width="22" height="22"
     style="filter:drop-shadow(0 1.5px 2.5px rgba(0,0,0,0.55));overflow:visible">
  <path d="M2 1 L2 16 L6.5 12 L9 18 L12 17 L9.5 11 L15 11 Z"
        fill="#ffffff" stroke="#000000" stroke-width="0.9" stroke-linejoin="round"/>
</svg>`;

/**
 * Inject the cursor overlay into the page. Call once at the start of a recording.
 * @param {import('playwright').Page} page
 * @param {object} [opts]
 * @param {number} [opts.startX=200]
 * @param {number} [opts.startY=750]
 * @param {boolean} [opts.idleDrift=true] — gentle 1-3px drift between actions (off by default for tight scripts)
 */
export async function injectCursor(page, opts = {}) {
  const startX = opts.startX ?? 200;
  const startY = opts.startY ?? 750;
  const idleDrift = opts.idleDrift ?? false;

  await page.evaluate(([svg, sx, sy, drift]) => {
    if (document.getElementById("rec-cursor")) return;
    const c = document.createElement("div");
    c.id = "rec-cursor";
    Object.assign(c.style, {
      position: "fixed",
      left: sx + "px",
      top: sy + "px",
      width: "22px",
      height: "22px",
      pointerEvents: "none",
      zIndex: "999999",
      transformOrigin: "2px 2px",
      transform: "scale(1)",
      willChange: "left,top,transform",
    });
    c.innerHTML = svg;
    document.body.appendChild(c);
    window.__recCursor = { x: sx, y: sy, busy: false };

    if (drift) {
      // Idle drift: 1-3px wander every 800-1500ms when not busy
      setInterval(() => {
        const s = window.__recCursor;
        if (!s || s.busy) return;
        const dx = (Math.random() - 0.5) * 4;
        const dy = (Math.random() - 0.5) * 4;
        const nx = Math.max(0, Math.min(window.innerWidth - 22, s.x + dx));
        const ny = Math.max(0, Math.min(window.innerHeight - 22, s.y + dy));
        const el = document.getElementById("rec-cursor");
        if (el) {
          el.style.transition = "left 600ms ease-in-out, top 600ms ease-in-out";
          el.style.left = nx + "px";
          el.style.top = ny + "px";
          setTimeout(() => { el.style.transition = ""; }, 620);
        }
        s.x = nx; s.y = ny;
      }, 1100);
    }
  }, [CURSOR_SVG, startX, startY, idleDrift]);
}

/**
 * Move the cursor to absolute (x,y) coordinates with realistic motion.
 * @param {import('playwright').Page} page
 * @param {number} x
 * @param {number} y
 * @param {object} [opts]
 * @param {number} [opts.ms] — duration; auto-derived from distance if not set (Fitts' law)
 * @param {boolean} [opts.overshoot=true]
 * @param {number} [opts.curveAmount] — perpendicular path curvature (auto if not set)
 */
export async function moveCursorTo(page, x, y, opts = {}) {
  await page.evaluate(async ([targetX, targetY, ms, overshoot, curveAmt]) => {
    const c = document.getElementById("rec-cursor");
    const s = window.__recCursor;
    if (!c || !s) return;
    s.busy = true;

    const startX = s.x;
    const startY = s.y;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) { s.busy = false; return; }

    // Fitts'-derived duration: log-based scaling. 320ms baseline + ~0.55ms/px
    // capped at 900ms. Manual override via ms wins.
    const autoMs = Math.min(900, Math.max(220, 320 + Math.log2(1 + distance) * 60));
    const duration = ms != null ? ms : autoMs;

    // Bezier control point: perpendicular offset for subtle curvature.
    // Sign randomized so successive moves don't feel mechanical.
    const perpX = -dy / distance;
    const perpY = dx / distance;
    const curveBase = curveAmt != null ? curveAmt : Math.min(distance * 0.12, 28);
    const curve = curveBase * (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.4);
    const cpX = startX + dx * 0.5 + perpX * curve;
    const cpY = startY + dy * 0.5 + perpY * curve;

    // Overshoot: ~3-6% past target for distances > 80px, less for short hops.
    const overshootFactor = overshoot && distance > 80 ? (0.03 + Math.random() * 0.03) : 0;
    const oX = targetX + dx * overshootFactor;
    const oY = targetY + dy * overshootFactor;

    const overshootDuration = duration * (overshoot && distance > 80 ? 0.85 : 1.0);
    const settleDuration = duration - overshootDuration;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    const tStart = performance.now();
    return new Promise((resolve) => {
      function frame(now) {
        const elapsed = now - tStart;
        let curX, curY;
        if (elapsed < overshootDuration) {
          const t = easeOutCubic(elapsed / overshootDuration);
          const mt = 1 - t;
          // Quadratic Bezier: start → control → overshoot
          curX = mt * mt * startX + 2 * mt * t * cpX + t * t * oX;
          curY = mt * mt * startY + 2 * mt * t * cpY + t * t * oY;
          c.style.left = curX + "px";
          c.style.top = curY + "px";
          requestAnimationFrame(frame);
        } else if (elapsed < duration) {
          const t = easeInOutQuad((elapsed - overshootDuration) / Math.max(settleDuration, 1));
          curX = oX + (targetX - oX) * t;
          curY = oY + (targetY - oY) * t;
          c.style.left = curX + "px";
          c.style.top = curY + "px";
          requestAnimationFrame(frame);
        } else {
          c.style.left = targetX + "px";
          c.style.top = targetY + "px";
          s.x = targetX; s.y = targetY; s.busy = false;
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }, [x, y, opts.ms ?? null, opts.overshoot ?? true, opts.curveAmount ?? null]);
}

/**
 * Move cursor to the visual center of a Playwright locator (with slight off-center).
 * Returns the {x, y} that was used (after offset).
 */
export async function moveCursorToLocator(page, locator, opts = {}) {
  const box = await locator.boundingBox({ timeout: opts.timeout ?? 5000 });
  if (!box) return null;
  // Off-center: ±15% of half-dimension. Humans rarely hit dead-center.
  const jitterX = (Math.random() * 0.3 - 0.15) * (box.width / 2);
  const jitterY = (Math.random() * 0.3 - 0.15) * (box.height / 2);
  const x = box.x + box.width / 2 + (opts.offsetX ?? jitterX);
  const y = box.y + box.height / 2 + (opts.offsetY ?? jitterY);
  await moveCursorTo(page, x, y, opts);
  return { x, y };
}

/**
 * Click animation: cursor briefly scales down (mouse-down feel), then back up.
 */
async function pressAnimation(page) {
  await page.evaluate(() => {
    const c = document.getElementById("rec-cursor");
    if (!c) return;
    c.style.transition = "transform 70ms cubic-bezier(.4,0,.6,1)";
    c.style.transform = "scale(0.86)";
    setTimeout(() => {
      if (c) {
        c.style.transform = "scale(1)";
        setTimeout(() => { c.style.transition = ""; }, 80);
      }
    }, 75);
  });
  await page.waitForTimeout(160);
}

/**
 * Move cursor to locator, hesitate briefly, click-press animation, then trigger click.
 */
export async function clickWithCursor(page, locator, opts = {}) {
  await moveCursorToLocator(page, locator, opts);
  // Pre-click hesitation 80-220ms (humans pause before committing).
  const hesitate = opts.hesitate ?? (80 + Math.random() * 140);
  await page.waitForTimeout(hesitate);
  await pressAnimation(page);
  await locator.click(opts);
}

/**
 * Emphasize an element by hovering and drawing a small circle around it
 * (cursor traces a ~12-20px ellipse). Use to direct viewer attention.
 */
export async function hoverEmphasize(page, locator, durationMs = 1200, opts = {}) {
  const box = await locator.boundingBox({ timeout: opts.timeout ?? 5000 });
  if (!box) return;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = opts.radius ?? Math.min(18, Math.min(box.width, box.height) * 0.15);

  // Approach point (top-right of element)
  await moveCursorTo(page, cx + radius, cy - radius * 0.3, { ms: 380 });
  await page.waitForTimeout(120);

  // Trace ellipse (1-1.5 revolutions)
  await page.evaluate(async ([centerX, centerY, r, dur]) => {
    const c = document.getElementById("rec-cursor");
    const s = window.__recCursor;
    if (!c || !s) return;
    s.busy = true;
    const tStart = performance.now();
    const revolutions = 1.2;
    const phase0 = Math.atan2(s.y - centerY, s.x - centerX);
    return new Promise((resolve) => {
      function frame(now) {
        const elapsed = now - tStart;
        if (elapsed >= dur) {
          // Land on element center
          c.style.left = centerX + "px";
          c.style.top = centerY + "px";
          s.x = centerX; s.y = centerY; s.busy = false;
          return resolve();
        }
        const t = elapsed / dur;
        const angle = phase0 + t * revolutions * Math.PI * 2;
        // Ellipse with slight aspect (more horizontal than vertical, feels natural)
        const x = centerX + r * 1.15 * Math.cos(angle);
        const y = centerY + r * 0.85 * Math.sin(angle);
        c.style.left = x + "px";
        c.style.top = y + "px";
        s.x = x; s.y = y;
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }, [cx, cy, radius, durationMs]);
}

/**
 * Park cursor at a "neutral" position (e.g. while explaining without action).
 */
export async function parkCursor(page, opts = {}) {
  const x = opts.x ?? 1280;
  const y = opts.y ?? 740;
  await moveCursorTo(page, x, y, { ms: 700 });
}
