/**
 * demo_time.mjs — Single Source of Truth für ALLE Pipeline-Zeiten (Take 2/3/4).
 *
 * Compressed-Morning-Architektur (Founder-Entscheidung 23.04.):
 *   Alles spielt am gleichen Werktag zwischen 08:04 und 09:06 ab. Termin selbst
 *   liegt morgen 08:00-10:00 (nur im Bestätigungs-Text sichtbar, keine
 *   visuelle Zeitreferenz im Video). Samsung-Uhr in jeder Szene deterministisch
 *   aus diesem Modul — keine dynamischen `new Date()`-Zeiten mehr in Pipeline.
 *
 * Timeline:
 *   08:04  Take 2 Anruf startet (Samsung-Uhr)
 *   08:07  Anruf endet (Lisa 3:11 min intake)
 *   08:08  Rohrbruch-Case in DB + Lisa-SMS-Bestätigung (Samsung-Uhr 08:08)
 *   08:09  Take 2 Leitsystem Fall-Detail (Nav-Uhr +1 min, FB1)
 *   ──────── 47 min Timeskip ────────
 *   08:56  Take 3 Wizard-Submit (Leck-Case in DB)
 *   08:57  Take 3 Leitsystem-View nach Wizard (Nav-Uhr)
 *   08:58  Take 3 Leitsystem Fall-Detail (Nav-Uhr +1 min)
 *   08:58  Take 4 Akt 1 — Click "Termin versenden"
 *           → Termin-Bestätigung-SMS an Kunde (Samsung-Uhr 08:58)
 *           → 24h-Reminder fires (Termin morgen 08:00 = <24h) (Samsung-Uhr 08:58)
 *   ──────── Compressed Cut ("Am nächsten Morgen") ────────
 *   09:02  Take 4 Akt 2 — Completion-Click → Status Erledigt
 *   09:04  Bewertungs-SMS (+2 min nach Completion, FB11) (Samsung-Uhr 09:04)
 *   09:06  Kunde bewertet (+2 min) (Samsung-Uhr 09:04)
 *
 * Werktag-Gate:
 *   Videos werden NUR generiert wenn heute UND morgen Werktag sind
 *   (Mo-Fr, keine CH-Feiertage).
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

  const Z = (h, m) => zurichDate(today.y, today.m, today.d, h, m);
  const ZT = (h, m) => zurichDate(tomorrow.y, tomorrow.m, tomorrow.d, h, m);

  // ── Take 2 — Rohrbruch-Call ──
  const phoneCallStartTime   = Z(8, 4);   // Samsung-Uhr beim Anruf-Start
  const phoneCallEndTime     = Z(8, 7);   // Lisa 3:11 min intake (191s)
  const phoneCaseSavedTime   = Z(8, 8);   // Case in DB (1 min nach Call-Ende)
  const phoneSmsConfirmTime  = Z(8, 8);   // Lisa SMS-Bestätigung = Case-Save
  const phoneLeitsystemNav   = Z(8, 8);   // Admin öffnet Leitsystem
  const phoneLeitsystemDet   = Z(8, 9);   // Fall-Detail +1 min (FB1)

  // ── Take 3 — Wizard ──
  const wizardSubmitTime     = Z(8, 56);  // Leck-Case in DB
  const wizardLeitsystemNav  = Z(8, 57);
  const wizardLeitsystemDet  = Z(8, 58);  // Fall-Detail +1 min (FB1)

  // ── Take 4 Akt 1 — Bestätigung ──
  const terminSaveTime       = Z(8, 58);  // Click "Termin versenden"
  const confirmSmsSent       = Z(8, 58);  // Termin-Bestätigung an Kunde
  const reminder24hSent      = Z(8, 58);  // <24h → feuert sofort
  const appointmentStart     = ZT(8, 0);
  const appointmentEnd       = ZT(10, 0);

  // ── Take 4 Akt 2 — Erledigen + Bewertung (Compressed) ──
  const completionTime       = Z(9, 2);   // "Erledigt"-Click
  const reviewSmsSent        = Z(9, 4);   // +2 min nach Completion (FB11)
  const reviewRatedTime      = Z(9, 6);   // Kunde bewertet +2 min

  // ── Samsung-Uhr pro Szene (statisch, keine new Date() mehr) ──
  const samsungClock = {
    take2_homescreen:  "08:03",   // Vor-Anruf-Homescreen
    take2_contacts:    "08:03",   // Kontaktsuche
    take2_call_active: "08:04",   // Anruf aktiv
    take2_call_ended:  "08:07",   // Call-Ended Screen
    take2_sms_notif:   "08:08",   // SMS-Notification
    take2_sms_open:    "08:08",   // SMS geöffnet
    take4_akt1_home:   "08:58",   // Bestätigung kommt
    take4_akt1_sms:    "08:58",   // Bestätigungs-SMS-Notif
    take4_akt1_rem:    "08:58",   // 24h-Reminder
    take4_akt2_home:   "09:04",   // Review-SMS kommt
    take4_akt2_sms:    "09:04",   // Review-SMS-Notif
    take4_review:      "09:04",   // Review-Screen
  };

  // ── Legacy-Aliasse (für Abwärtskompat während Umbau) ──
  const demoNow = Z(8, 4);
  const confirmationSent = confirmSmsSent;
  const reminderSent = reminder24hSent;
  const reviewSentTime = reviewSmsSent;

  return {
    today,
    tomorrow,
    // Take 2
    phoneCallStartTime,
    phoneCallEndTime,
    phoneCaseSavedTime,
    phoneSmsConfirmTime,
    phoneLeitsystemNav,
    phoneLeitsystemDet,
    // Take 3
    wizardSubmitTime,
    wizardLeitsystemNav,
    wizardLeitsystemDet,
    // Take 4 Akt 1
    terminSaveTime,
    confirmSmsSent,
    reminder24hSent,
    appointmentStart,
    appointmentEnd,
    // Take 4 Akt 2
    completionTime,
    reviewSmsSent,
    reviewRatedTime,
    // Samsung-Uhr pro Szene
    samsungClock,
    // Legacy-Aliasse
    demoNow,
    confirmationSent,
    reminderSent,
    reviewSentTime,
    // Hilfs-ISO-Strings
    iso: {
      phoneCallStartTime: phoneCallStartTime.toISOString(),
      phoneCaseSavedTime: phoneCaseSavedTime.toISOString(),
      phoneSmsConfirmTime: phoneSmsConfirmTime.toISOString(),
      wizardSubmitTime: wizardSubmitTime.toISOString(),
      terminSaveTime: terminSaveTime.toISOString(),
      confirmSmsSent: confirmSmsSent.toISOString(),
      reminder24hSent: reminder24hSent.toISOString(),
      appointmentStart: appointmentStart.toISOString(),
      appointmentEnd: appointmentEnd.toISOString(),
      completionTime: completionTime.toISOString(),
      reviewSmsSent: reviewSmsSent.toISOString(),
      reviewRatedTime: reviewRatedTime.toISOString(),
      // Legacy
      demoNow: demoNow.toISOString(),
      confirmationSent: confirmationSent.toISOString(),
      reminderSent: reminderSent.toISOString(),
      reviewSentTime: reviewSentTime.toISOString(),
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
