/**
 * demo_time.mjs — Single Source of Truth für Take-4-Zeitlogik (A10).
 *
 * Demo-Wirklichkeit:
 *   - demoNow           = heute 07:59 (lokal Europe/Zurich)
 *   - appointmentStart  = morgen 08:00
 *   - appointmentEnd    = morgen 10:00
 *   - confirmationSent  = heute 07:59:30 (wenige Sekunden nach Termin-Save)
 *   - reminderSent      = heute 08:00   (24h-Reminder)
 *   - completionTime    = morgen 10:30  (30 Min nach Termin-Ende)
 *   - reviewSentTime    = morgen 10:31  (1 Min nach Completion)
 *   - reviewRatedTime   = morgen 10:32  (1 Min später — Kunde bewertet)
 *
 * Werktag-Gate:
 *   - Videos werden NUR generiert wenn heute UND morgen Werktag sind
 *     (Mo-Fr, keine CH-Feiertage).
 *
 * Das Modul arbeitet konsistent in ISO-Strings (UTC) und berücksichtigt
 * Europe/Zurich für die Wandlung Tag/Uhrzeit.
 */

// ────────────────────────────────────────────────────────────────────
// Schweizer Feiertage (fest + bewegliche, Bund)
// ────────────────────────────────────────────────────────────────────

/** Osterdatum nach Gauss. Gibt {y,m,d} zurück. */
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31);
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return { y: year, m: month, d: day };
}

/** Addiert N Tage auf ein {y,m,d}. */
function addDays({ y, m, d }, n) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** YYYY-MM-DD */
function ymd({ y, m, d }) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Set aller eidg. Feiertage eines Jahres als YYYY-MM-DD. */
function chHolidaysForYear(year) {
  const easter = easterSunday(year);
  const karfreitag = addDays(easter, -2);
  const ostermontag = addDays(easter, 1);
  const auffahrt = addDays(easter, 39);
  const pfingstmontag = addDays(easter, 50);
  const holidays = new Set([
    `${year}-01-01`,        // Neujahr
    `${year}-01-02`,        // Berchtoldstag (kantonal, meist arbeitsfrei)
    ymd(karfreitag),
    ymd(ostermontag),
    `${year}-05-01`,        // Tag der Arbeit (kantonal)
    ymd(auffahrt),
    ymd(pfingstmontag),
    `${year}-08-01`,        // Bundesfeier
    `${year}-12-25`,        // Weihnachten
    `${year}-12-26`,        // Stephanstag
  ]);
  return holidays;
}

/** Ist {y,m,d} ein Werktag in der Schweiz? */
export function isCHWorkday({ y, m, d }) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = dt.getUTCDay(); // 0=Sunday, 6=Saturday
  if (wd === 0 || wd === 6) return false;
  const holidays = chHolidaysForYear(y);
  return !holidays.has(ymd({ y, m, d }));
}

// ────────────────────────────────────────────────────────────────────
// Europe/Zurich Date-Helfer (ohne externe Libs)
// ────────────────────────────────────────────────────────────────────

/**
 * Erstellt eine Date für (y,m,d,HH,MM) in Europe/Zurich.
 * Berücksichtigt Sommer-/Winterzeit.
 */
function zurichDate(y, m, d, hh, mm) {
  // Naiver Ansatz: Baue UTC-Date an (y,m,d,hh,mm), frage es dann in Europe/Zurich
  // und justiere so lange bis die Zurich-Komponente stimmt.
  let dt = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
  for (let iter = 0; iter < 4; iter++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Zurich",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).formatToParts(dt).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
    const gotY = Number(parts.year), gotM = Number(parts.month), gotD = Number(parts.day);
    const gotH = Number(parts.hour === "24" ? "0" : parts.hour);
    const gotMi = Number(parts.minute);
    const delta =
      ((y - gotY) * 525600 + (m - gotM) * 43800 + (d - gotD) * 1440 + (hh - gotH) * 60 + (mm - gotMi)) * 60 * 1000;
    if (delta === 0) break;
    dt = new Date(dt.getTime() + delta);
  }
  return dt;
}

/** Heutiges Datum in Europe/Zurich als {y,m,d}. */
function zurichToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date()).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
}

// ────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────

/**
 * Prüft das Werktag-Gate. Wirft Error falls heute ODER morgen kein Werktag.
 * Gibt bei Erfolg {today, tomorrow} als {y,m,d}-Paare zurück.
 */
export function assertWorkdayGate() {
  const today = zurichToday();
  const tomorrow = addDays(today, 1);
  const reasons = [];
  if (!isCHWorkday(today)) reasons.push(`heute (${ymd(today)}) ist kein Werktag`);
  if (!isCHWorkday(tomorrow)) reasons.push(`morgen (${ymd(tomorrow)}) ist kein Werktag`);
  if (reasons.length > 0) {
    throw new Error(`Workday-Gate FAILED: ${reasons.join(", ")}. Video wird nicht generiert.`);
  }
  return { today, tomorrow };
}

/**
 * Liefert die kompletten Demo-Zeitpunkte für Take 4.
 * Wirft Error wenn Werktag-Gate failt (außer opts.skipGate = true für Tests).
 */
export function getDemoTimes(opts = {}) {
  const today = opts.today ?? zurichToday();
  const tomorrow = addDays(today, 1);

  if (!opts.skipGate) {
    const reasons = [];
    if (!isCHWorkday(today)) reasons.push(`heute (${ymd(today)}) ist kein Werktag`);
    if (!isCHWorkday(tomorrow)) reasons.push(`morgen (${ymd(tomorrow)}) ist kein Werktag`);
    if (reasons.length > 0) {
      throw new Error(`Workday-Gate FAILED: ${reasons.join(", ")}. Video wird nicht generiert.`);
    }
  }

  // C16+C17 Compressed: Alles passiert heute 08:04 – 08:12 (live, kein Tomorrow-Jump).
  // Termin selbst liegt morgen 08:00-10:00, der Reminder feuert aber HEUTE 08:04
  // weil <24h vor Termin (Save-Zeit demoNow 08:04, Termin morgen 08:00 = 23h56min away).
  const demoNow = zurichDate(today.y, today.m, today.d, 8, 4);
  const confirmationSent = zurichDate(today.y, today.m, today.d, 8, 4);  // Lisa's Bestätigung (Take 2)
  const reminderSent = zurichDate(today.y, today.m, today.d, 8, 4);      // Reminder fires NOW (<24h)
  const appointmentStart = zurichDate(tomorrow.y, tomorrow.m, tomorrow.d, 8, 0);
  const appointmentEnd = zurichDate(tomorrow.y, tomorrow.m, tomorrow.d, 10, 0);
  // Compressed: Erledigen + Bewertung live im Video, nicht morgen.
  const completionTime = zurichDate(today.y, today.m, today.d, 8, 9);
  const reviewSentTime = zurichDate(today.y, today.m, today.d, 8, 10);
  const reviewRatedTime = zurichDate(today.y, today.m, today.d, 8, 12);

  return {
    today,
    tomorrow,
    demoNow,
    confirmationSent,
    reminderSent,
    appointmentStart,
    appointmentEnd,
    completionTime,
    reviewSentTime,
    reviewRatedTime,
    // Hilfs-ISO-Strings
    iso: {
      demoNow: demoNow.toISOString(),
      confirmationSent: confirmationSent.toISOString(),
      reminderSent: reminderSent.toISOString(),
      appointmentStart: appointmentStart.toISOString(),
      appointmentEnd: appointmentEnd.toISOString(),
      completionTime: completionTime.toISOString(),
      reviewSentTime: reviewSentTime.toISOString(),
      reviewRatedTime: reviewRatedTime.toISOString(),
    },
  };
}

/** Kurz-Format "Fr 23.04." */
export function formatDayShort(date) {
  const parts = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    weekday: "short", day: "2-digit", month: "2-digit",
  }).formatToParts(date).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return `${parts.weekday} ${parts.day}.${parts.month}.`;
}

/** Kurz-Format "08:00" */
export function formatTimeShort(date) {
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}
