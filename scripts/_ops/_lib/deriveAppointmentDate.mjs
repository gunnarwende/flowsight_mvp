/**
 * deriveAppointmentDate(baseISO)
 *
 * Returns { start, end, reminder } where:
 *   start     = ISO of appointment start (09:00 on next working day +48h)
 *   end       = start + 2h (= 11:00)
 *   reminder  = start - 24h (SMS reminder timestamp)
 *
 * Rules (PIPELINE_BIBLE §18.4):
 *   1. candidate = baseISO + 48h, time set to 09:00.
 *   2. If candidate falls on Sat → +2 days, Sun → +1 day.
 *   3. If candidate hits a CH public holiday → +1 day, re-check.
 *
 * Thereby the 24h reminder always lies between case creation and appointment —
 * chronologically valid (not before case exists).
 */

// Swiss public holidays (bundle-wide; cantonal holidays omitted for simplicity).
// Expand as needed.
const CH_HOLIDAYS = new Set([
  "2026-01-01", // Neujahr
  "2026-04-03", // Karfreitag
  "2026-04-06", // Ostermontag
  "2026-05-01", // Tag der Arbeit
  "2026-05-14", // Auffahrt
  "2026-05-25", // Pfingstmontag
  "2026-08-01", // Bundesfeier
  "2026-12-25", // Weihnachten
  "2026-12-26", // Stephanstag
  "2027-01-01",
  "2027-03-26", // Karfreitag
  "2027-03-29", // Ostermontag
  "2027-05-01",
  "2027-05-06", // Auffahrt
  "2027-05-17", // Pfingstmontag
]);

function iso(d) {
  return d.toISOString();
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function deriveAppointmentDate(baseISO) {
  const base = new Date(baseISO);
  // Step 1: +48h candidate at 09:00 local
  let candidate = new Date(base.getTime() + 48 * 3600 * 1000);
  candidate.setHours(9, 0, 0, 0);

  // Step 2+3: Loop until working day & not holiday
  for (let i = 0; i < 14; i++) {
    const day = candidate.getDay();      // 0 = Sun, 6 = Sat
    const isHoliday = CH_HOLIDAYS.has(ymd(candidate));
    if (day >= 1 && day <= 5 && !isHoliday) break;
    // Skip ahead
    if (day === 0) candidate.setDate(candidate.getDate() + 1);
    else if (day === 6) candidate.setDate(candidate.getDate() + 2);
    else candidate.setDate(candidate.getDate() + 1); // holiday on weekday
  }

  const start = new Date(candidate);
  const end = new Date(candidate.getTime() + 2 * 3600 * 1000); // +2h = 11:00
  const reminder = new Date(candidate.getTime() - 24 * 3600 * 1000); // -24h

  // Completion time: appointment end + 30min (+ time for technician to save).
  const completion = new Date(end.getTime() + 30 * 60 * 1000);
  // Bewertungsanfrage: 1 minute after completion.
  const reviewSent = new Date(completion.getTime() + 60 * 1000);

  return {
    start: iso(start),
    end: iso(end),
    reminder: iso(reminder),
    completion: iso(completion),
    reviewSent: iso(reviewSent),
  };
}
